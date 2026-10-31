# EARTH CHRONICLES 2077
### The Living Planet. The Changing Timeline.

Earth Chronicles 2077 is a browser-based planetary exploration and environmental restoration game. Phase 1 establishes the cinematic command interface and interactive 3D Earth that future phases will build upon.

## Phase 1 — Foundation

- Full-screen, non-scrolling command interface with responsive desktop and mobile layouts.
- Interactive Three.js Earth with atmosphere, cloud layer, starfield and orbital lighting.
- Drag-to-rotate, scroll/pinch zoom, zoom buttons, reset and auto-rotation controls.
- Selectable regional signals for the Amazon Basin, Arctic Circle, Sahara Corridor, South Asia and Coral Triangle.
- Planetary intelligence HUD, regional index cards, mission elapsed timer and coordinate readout.
- Intro sequence, mission briefing, environment navigation and configurable settings.
- Reduced-motion, rendering-quality and marker-visibility controls.
- Local demonstration data is clearly identified as illustrative rather than live scientific measurements.

## Run locally

Requirements: Node.js 20 or newer.

```bash
npm install
npm run dev
```

Create a production build:

```bash
npm run build
npm run preview
```

## Technology

- [Three.js](https://github.com/mrdoob/three.js) for real-time 3D rendering.
- [Vite](https://github.com/vitejs/vite) for development and production builds.
- Earth and cloud map textures are loaded from the Three.js public examples; a procedural fallback texture is included for the Earth surface.

## Deployment

The project is a static Vite application and can be deployed to Vercel. The Vercel Git integration setting `github.autoJobCancellation: false` prevents a newer push from automatically cancelling an in-progress deployment job for an earlier commit. Each commit remains in Git history; deployments still need to finish successfully before being treated as release-ready.

## Roadmap

1. **Foundation** — planetary command, 3D Earth, camera controls, regional selection and settings.
2. **Temporal Engine** — 2026 / 2050 / 2077 timelines and temporal reconstruction.
3. **Planetary Transformation** — restoration, energy, water, pollution and ecosystem systems.
4. **Intelligence & Consequences** — decision engine, simulated outcomes and future comparison.
5. **Gameplay & Experience** — missions, achievements, tutorials, accessibility and polish.
6. **Finalization** — QA, optimization, deployment and hackathon submission.

## Attribution

Three.js is distributed under the MIT License. See the upstream project for its license and notices. Earth/cloud textures are served from the Three.js examples texture directory and remain subject to the upstream project's terms and attribution requirements.
