// TideMath engine - tide interpolation and clearance math. Pure functions, no DOM.
(function (root) {
  'use strict';

  // Cosine interpolation of tide height at time t (minutes) between a low and a high.
  // tLow/hLow: time and height of one extreme, tHigh/hHigh: the other. t between them.
  function heightAt(t, tLow, hLow, tHigh, hHigh) {
    if (tHigh <= tLow) throw new Error('high must come after low');
    var mid = (hHigh + hLow) / 2;
    var amp = (hHigh - hLow) / 2;
    var frac = (t - tLow) / (tHigh - tLow);
    if (frac < 0 || frac > 1) throw new Error('time outside the tide window');
    return mid + amp * Math.cos(Math.PI * (1 - frac));
  }

  // Inverse: first time (minutes, rising) at which the height reaches h between low and high.
  function timeForHeight(h, tLow, hLow, tHigh, hHigh) {
    if (tHigh <= tLow) throw new Error('high must come after low');
    var mid = (hHigh + hLow) / 2;
    var amp = (hHigh - hLow) / 2;
    var c = (h - mid) / amp;
    if (c > 1 || c < -1) throw new Error('height outside this tide range');
    var frac = 1 - Math.acos(c) / Math.PI;
    return tLow + frac * (tHigh - tLow);
  }

  // Rule of twelfths: fraction of range moved in each of the 6 hours between extremes.
  function twelfthsFractions() {
    return [1 / 12, 2 / 12, 3 / 12, 3 / 12, 2 / 12, 1 / 12];
  }

  // Vertical clearance over an obstruction: charted depth + tide height - draft - safety margin.
  function clearance(chartedDepth, tideHeight, draft, margin) {
    return chartedDepth + tideHeight - draft - margin;
  }

  function clearanceVerdict(cm) {
    if (cm >= 1.0) return 'comfortable - plenty of water under you';
    if (cm >= 0.3) return 'fine - watch the sounder';
    if (cm >= 0) return 'marginal - you are in the margin, go slow';
    return 'aground territory - do not attempt';
  }

  // Passable window: times between low and high where clearance >= 0 (rising and falling roots).
  // Returns {opens, closes} in minutes, or null if never passable / always passable flags.
  function passableWindow(chartedDepth, draft, margin, tLow, hLow, tHigh, hHigh) {
    var need = draft + margin - chartedDepth; // tide height required
    var cLow = clearance(chartedDepth, hLow, draft, margin);
    var cHigh = clearance(chartedDepth, hHigh, draft, margin);
    if (cHigh < 0) return { passable: false, reason: 'not enough water even at high tide' };
    if (cLow >= 0) return { passable: true, opens: tLow, closes: tHigh, note: 'passable through this whole stretch' };
    var opens = timeForHeight(need, tLow, hLow, tHigh, hHigh);
    // falling side: mirror around high (approximate symmetric fall over the same half-period)
    var half = tHigh - tLow;
    var closes = tHigh + (tHigh - opens);
    return { passable: true, opens: opens, closes: closes, note: 'window ' + Math.round(closes - opens) + ' min' };
  }

  // Beach emergence: time the water drops to a level (falling side), given high then next low.
  function emergesAt(targetHeight, tHigh, hHigh, tNextLow, hNextLow) {
    // falling: interpolate from high to next low
    var mid = (hHigh + hNextLow) / 2;
    var amp = (hHigh - hNextLow) / 2;
    var c = (targetHeight - mid) / amp;
    if (c > 1 || c < -1) throw new Error('level outside this falling range');
    var frac = Math.acos(c) / Math.PI;
    return tHigh + frac * (tNextLow - tHigh);
  }

  function fmtTime(mins) {
    var m = ((Math.round(mins) % 1440) + 1440) % 1440;
    var h = Math.floor(m / 60), mm = m % 60;
    return (h < 10 ? '0' : '') + h + ':' + (mm < 10 ? '0' : '') + mm;
  }

  var api = {
    heightAt: heightAt,
    timeForHeight: timeForHeight,
    twelfthsFractions: twelfthsFractions,
    clearance: clearance,
    clearanceVerdict: clearanceVerdict,
    passableWindow: passableWindow,
    emergesAt: emergesAt,
    fmtTime: fmtTime
  };
  root.TideMath = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
