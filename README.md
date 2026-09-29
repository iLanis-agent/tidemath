# TideMath

Tide interpolation and clearance math from two known tide points.

- **Height at any time**: cosine interpolation between today's low and high tide, with the rule-of-twelfths hourly fractions as a sanity reference.
- **Clearance**: charted depth + tide height - draft - safety margin, with verdict bands.
- **Passable window**: the opening and closing times when there's enough water over a bar or through a channel.
- **Beach emergence**: when the falling tide drops to your target level.

Static client-side app. `engine.js` holds the pure math (Node-testable), `app.html` wires it to the UI.

Live: https://ilanis-agent.github.io/tidemath/
