import "./style.css";
import { regions } from "./regions.js";
import { PlanetWorld } from "./world.js";

const $ = selector => document.querySelector(selector);
const app = $("#app");
const toast = $("#toast");
let world;
let rotationEnabled = true;
let toastTimer;
let startTime = Date.now();

function showToast(message) {
  toast.textContent = message; toast.classList.add("visible");
  clearTimeout(toastTimer); toastTimer = setTimeout(() => toast.classList.remove("visible"), 2600);
}
function openModal(id) { const modal = document.getElementById(id); if (modal) modal.classList.remove("hidden"); }
function closeModal(id) { const modal = document.getElementById(id); if (modal) modal.classList.add("hidden"); }
function setView(view) {
  document.querySelectorAll(".rail-item").forEach(button => button.classList.toggle("active", button.dataset.view === view));
  if (view === "orbital") { world.reset(); showToast("ORBITAL COMMAND // GLOBAL VIEW"); }
  if (view === "surface") { showToast("SURFACE INTEL // SELECT A REGIONAL SIGNAL"); world.setRotation(false); }
  if (view === "archive") { openModal("briefing-modal"); showToast("FIELD ARCHIVE // MISSION DOSSIER"); }
}
function selectRegion(region) {
  $("#region-title").textContent = region.name.toUpperCase();
  $("#region-biome").textContent = region.biome;
  $("#region-status").textContent = region.status;
  $("#region-index").textContent = region.index;
  $("#region-description").textContent = region.description;
  world.focusRegion(region); openModal("region-modal");
}
function renderRegions() {
  $("#region-list").innerHTML = regions.map(region => `<button class="region-row" data-region="${region.id}"><span class="region-dot" style="--signal:${region.color.toString(16).padStart(6,"0")}"></span><span class="region-row-name">${region.short}<small>${region.status}</small></span><b>${region.value}<small>%</small></b><span class="row-arrow">↗</span></button>`).join("");
  document.querySelectorAll(".region-row").forEach(button => button.addEventListener("click", () => {
    const region = regions.find(item => item.id === button.dataset.region); if(region) selectRegion(region);
  }));
}
function initializeWorld() {
  try {
    world = new PlanetWorld($("#world-root"), regions, { onRegion: selectRegion });
    world.rotationPreference = rotationEnabled;
  } catch (error) {
    console.error("3D world initialization failed:", error);
    $("#world-root").classList.add("world-fallback");
    showToast("3D renderer unavailable — interface remains active");
  }
}
function setRotation(value) {
  rotationEnabled = value; $("#rotation-toggle").classList.toggle("rotation-active", value);
  if(world) world.setRotation(value);
  $("#setting-rotation").checked = value;
}
function updateElapsed() {
  const seconds = Math.floor((Date.now()-startTime)/1000);
  const hh=String(Math.floor(seconds/3600)).padStart(2,"0"),mm=String(Math.floor(seconds%3600/60)).padStart(2,"0"),ss=String(seconds%60).padStart(2,"0");
  $("#elapsed").textContent = `${hh}:${mm}:${ss}`;
}
function init() {
  renderRegions(); initializeWorld();
  document.querySelectorAll(".rail-item").forEach(button => button.addEventListener("click",()=>setView(button.dataset.view)));
  $("#settings-open").addEventListener("click",()=>openModal("settings-modal"));
  $("#briefing-button").addEventListener("click",()=>openModal("briefing-modal"));
  $("#launch-button").addEventListener("click",()=>{ closeModal("intro-overlay"); showToast("PLANETARY COMMAND INITIALIZED"); });
  $("#begin-button").addEventListener("click",()=>{ closeModal("intro-overlay"); showToast("WELCOME, RESTORATION ARCHITECT"); });
  $("#zoom-in").addEventListener("click",()=>{ if(world){world.camera.position.multiplyScalar(.86);world.controls.update();} });
  $("#zoom-out").addEventListener("click",()=>{ if(world){world.camera.position.multiplyScalar(1.16);world.controls.update();} });
  $("#reset-view").addEventListener("click",()=>world?.reset());
  $("#rotation-toggle").addEventListener("click",()=>setRotation(!rotationEnabled));
  $("#setting-rotation").addEventListener("change",event=>setRotation(event.target.checked));
  $("#setting-labels").addEventListener("change",event=>world?.setLabels(event.target.checked));
  $("#setting-motion").addEventListener("change",event=>world?.setReducedMotion(event.target.checked));
  $("#setting-quality").addEventListener("change",event=>world?.setQuality(event.target.checked));
  document.querySelectorAll("[data-close]").forEach(button=>button.addEventListener("click",()=>closeModal(button.dataset.close)));
  document.querySelectorAll(".modal-backdrop").forEach(backdrop=>backdrop.addEventListener("pointerdown",event=>{if(event.target===backdrop)closeModal(backdrop.id);}));
  document.addEventListener("keydown",event=>{if(event.key==="Escape")document.querySelectorAll(".modal-backdrop").forEach(modal=>modal.classList.add("hidden"));});
  setInterval(updateElapsed,1000); updateElapsed();
  $("#coordinates").textContent="LAT 00.00° / LNG 00.00°";
  $("#intro-overlay").classList.remove("hidden");
  $("#world-root").addEventListener("pointermove",event=>{
    if(!world || event.buttons) return;
    const rect=$("#world-root").getBoundingClientRect(); const x=((event.clientX-rect.left)/rect.width-.5)*360; const y=((event.clientY-rect.top)/rect.height)*180-90;
    $("#coordinates").textContent=`LAT ${Math.abs(y).toFixed(2)}° ${y>=0?"N":"S"} / LNG ${Math.abs(x).toFixed(2)}° ${x>=0?"E":"W"}`;
  });
}
init();

window.addEventListener("beforeunload",()=>world?.dispose());