const TIMELINES = [
  {
    year: 2026,
    label: "INHERITED WORLD",
    subtitle: "BASELINE ERA",
    biome: 68.4,
    ocean: 71.0,
    restoration: 12,
    readiness: 46,
    temperature: 1.2,
    forest: 31.7,
    water: 64,
    energy: 42,
    population: 8.3,
    tone: "baseline",
    events: [
      ["01", "BASELINE LOCK", "Global conditions captured for the simulation start."],
      ["02", "RESTORATION SIGNAL", "Regional recovery programs begin to coordinate."],
      ["03", "ENERGY TRANSITION", "Clean-energy adoption becomes a major timeline variable."]
    ]
  },
  {
    year: 2050,
    label: "TRANSITION ERA",
    subtitle: "PROJECTED WORLD",
    biome: 74.8,
    ocean: 71.1,
    restoration: 39,
    readiness: 71,
    temperature: 1.5,
    forest: 36.9,
    water: 72,
    energy: 68,
    population: 9.7,
    tone: "transition",
    events: [
      ["01", "GREEN CORRIDORS", "Restoration networks reconnect fragmented habitats."],
      ["02", "WATER SECURITY", "Desalination, reuse and watershed recovery reshape regional resilience."],
      ["03", "GRID SHIFT", "Distributed clean power becomes a core planetary system."]
    ]
  },
  {
    year: 2077,
    label: "RESTORATION ERA",
    subtitle: "TARGET WORLD",
    biome: 86.2,
    ocean: 71.4,
    restoration: 82,
    readiness: 94,
    temperature: 1.6,
    forest: 45.3,
    water: 88,
    energy: 91,
    population: 10.1,
    tone: "restoration",
    events: [
      ["01", "BIOME RECOVERY", "Large-scale restoration corridors stabilize major ecosystems."],
      ["02", "BLUE NETWORK", "Ocean stewardship and coastal recovery become planetary infrastructure."],
      ["03", "CLIMATE ADAPTATION", "Cities and landscapes operate as coordinated resilient systems."]
    ]
  }
];

function clamp(value, min, max) { return Math.max(min, Math.min(max, value)); }

export class TemporalEngine {
  constructor({ onChange, onEvent }) {
    this.onChange = onChange;
    this.onEvent = onEvent;
    this.index = 0;
    this.compare = false;
    this.playing = false;
    this.progress = 0;
    this.timer = null;
    this.emit();
  }
  get current() { return TIMELINES[this.index]; }
  get timelines() { return TIMELINES; }
  setYear(year) {
    const next = TIMELINES.findIndex(item => item.year === Number(year));
    if (next < 0) return;
    this.index = next;
    this.progress = next / (TIMELINES.length - 1);
    this.emit();
  }
  setProgress(value) {
    this.progress = clamp(Number(value), 0, 1);
    const position = this.progress * (TIMELINES.length - 1);
    const nearest = Math.round(position);
    this.index = clamp(nearest, 0, TIMELINES.length - 1);
    this.emit();
  }
  toggleCompare() {
    this.compare = !this.compare;
    this.emit();
  }
  togglePlayback() {
    this.playing ? this.stop() : this.play();
  }
  play() {
    if (this.playing) return;
    this.playing = true;
    this.timer = window.setInterval(() => {
      this.progress += 0.006;
      if (this.progress >= 1) {
        this.progress = 0;
      }
      const next = Math.round(this.progress * (TIMELINES.length - 1));
      if (next !== this.index) {
        this.index = next;
        this.onEvent?.(this.current.events[0]);
      }
      this.emit();
    }, 90);
    this.emit();
  }
  stop() {
    this.playing = false;
    if (this.timer) window.clearInterval(this.timer);
    this.timer = null;
    this.emit();
  }
  generateProjection() {
    const base = this.current;
    const variance = Math.sin(this.current.year * 0.17) * 1.8;
    return {
      biome: clamp(base.biome + variance, 0, 100),
      water: clamp(base.water + variance * 0.5, 0, 100),
      energy: clamp(base.energy + variance * 0.7, 0, 100),
      resilience: clamp(base.readiness + variance, 0, 100)
    };
  }
  comparison() {
    return { baseline: TIMELINES[0], current: this.current, target: TIMELINES[TIMELINES.length - 1] };
  }
  emit() {
    this.onChange?.({ current: this.current, progress: this.progress, playing: this.playing, compare: this.compare, projection: this.generateProjection() });
  }
  dispose() { this.stop(); }
}
