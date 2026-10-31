# Phase 4 — Decision & Consequence Intelligence

Phase 4 turns the restoration sandbox into a four-stage planetary policy campaign.

## Systems included
- Four decision scenarios: Amazon Basin, South Asia water security, global energy transition, and Coral Triangle coastal resilience.
- Three mutually exclusive policy choices per scenario, each with a resource cost and a distinct impact profile.
- A finite policy-credit budget that forces prioritization across the campaign.
- Five connected outcome indicators: biome health, water security, biodiversity, community wellbeing, and climate stability.
- Live policy previews before commitment, including positive and negative trade-offs.
- Delayed consequence queue: long-horizon benefits are applied as the campaign advances and resolved at campaign completion.
- Strategy profiles: balanced stewardship, ecology first, community first, and climate first. Profiles change the evaluation weights and projected impact scaling.
- Decision ledger with committed policy, region, cost and timing.
- Alternate-future comparison across the four strategy profiles.
- Campaign reset and downloadable outcome report.
- Globe integration: committed outcomes update the localized restoration visualization and regional markers.

## How to play
Open **DECISION COMMAND** from the left navigation rail. Read the challenge, select one policy, inspect the projected consequences, and commit it. Each scenario allows one committed policy. Continue through all four scenarios, then review the final score, decision ledger and alternate strategy evaluations.

## Model boundaries
This is an educational strategy simulation. The indicator values, scenario effects, policy costs and delayed consequences are authored game mechanics. They are not measured environmental data, causal scientific forecasts, economic predictions, or policy recommendations for real-world deployment. The globe overlays visualize the simulation state; they do not depict actual land-cover change.

## Technical structure
- `src/phase4.js`: scenario definitions, budget and decision engine, consequence calculations, strategy evaluation, ledger and report export.
- `src/phase4.css`: responsive Phase 4 command interface.
- `src/main.js`: initializes the engine and connects committed outcomes to the globe.
- `src/world.js`: maps the simulated outcome indicators to the existing regional restoration visualization.
