const INTERVENTIONS = [
  {id:"forest",name:"Forest corridors",zone:"LAND",description:"Reconnect fragmented forests and protect existing canopy.",weight:1.0,region:"amazon"},
  {id:"wetlands",name:"Wetland recovery",zone:"FRESHWATER",description:"Restore floodplains, peatlands and natural water filtration.",weight:.82,region:"southasia"},
  {id:"drylands",name:"Dryland regeneration",zone:"LAND",description:"Improve soil cover, native vegetation and water retention.",weight:.72,region:"sahara"},
  {id:"rewilding",name:"Habitat rewilding",zone:"BIODIVERSITY",description:"Reconnect habitats and support native species recovery.",weight:.9,region:"arctic"},
  {id:"coastal",name:"Coastal & reef protection",zone:"OCEAN",description:"Protect mangroves, seagrass and coral ecosystems.",weight:.88,region:"coral"},
  {id:"urban",name:"Urban nature networks",zone:"CITIES",description:"Add connected shade, green roofs and permeable public spaces.",weight:.66,region:"southasia"}
];
const PRESETS = {
  balanced:{forest:62,wetlands:55,drylands:48,rewilding:52,coastal:58,urban:46},
  biodiversity:{forest:82,wetlands:74,drylands:58,rewilding:90,coastal:76,urban:35},
  water:{forest:54,wetlands:92,drylands:82,rewilding:42,coastal:55,urban:62},
  blue:{forest:38,wetlands:65,drylands:35,rewilding:48,coastal:95,urban:52}
};
const clamp=(n,a=0,b=100)=>Math.max(a,Math.min(b,n));
export class RestorationEngine {
  constructor({onChange=()=>{}}={}) {
    this.onChange=onChange;
    this.levels={forest:28,wetlands:18,drylands:14,rewilding:20,coastal:24,urban:16};
    this.active="land";
    this.mount();
    this.render();
  }
  mount(){
    const panel=document.createElement("section");
    panel.id="restoration-lab";
    panel.className="modal-backdrop hidden phase3-backdrop";
    panel.innerHTML=`
      <section class="modal-card phase3-card" role="dialog" aria-modal="true" aria-labelledby="phase3-title">
        <div class="modal-head"><div><small>PHASE 03 // ENVIRONMENTAL TRANSFORMATION</small><h2 id="phase3-title">PLANET RESTORATION LAB</h2></div><button class="close-button" data-p3-close aria-label="Close restoration lab">×</button></div>
        <p class="p3-intro">Design a restoration strategy, allocate effort across connected ecosystems, and watch the simulated planetary indicators respond. This is a learning scenario, not a scientific forecast.</p>
        <div class="p3-tabs" role="tablist" aria-label="Ecosystem filters">
          <button class="active" data-p3-tab="all">ALL SYSTEMS</button><button data-p3-tab="land">LAND</button><button data-p3-tab="freshwater">FRESHWATER</button><button data-p3-tab="ocean">OCEAN</button><button data-p3-tab="cities">CITIES</button>
        </div>
        <div class="p3-layout">
          <div class="p3-interventions" id="p3-interventions"></div>
          <aside class="p3-side">
            <div class="p3-score"><span>RESTORATION MOMENTUM</span><strong id="p3-momentum">—</strong><div class="p3-meter"><i id="p3-momentum-bar"></i></div><small>Composite gameplay index</small></div>
            <div class="p3-metrics"><div><span>HABITAT CONNECTIVITY</span><b id="p3-connectivity">—</b></div><div><span>WATER RESILIENCE</span><b id="p3-water">—</b></div><div><span>COASTAL HEALTH</span><b id="p3-coast">—</b></div><div><span>URBAN GREENING</span><b id="p3-urban">—</b></div></div>
            <div class="p3-presets"><span>STRATEGY PRESETS</span><button data-p3-preset="balanced">BALANCED RECOVERY</button><button data-p3-preset="biodiversity">BIODIVERSITY FIRST</button><button data-p3-preset="water">WATER SECURITY</button><button data-p3-preset="blue">BLUE PLANET</button></div>
            <div class="p3-actions"><button data-p3-reset>RESET ALLOCATION</button><button class="p3-apply" data-p3-apply>APPLY TO WORLD ↗</button></div>
          </aside>
        </div>
        <div class="p3-foot"><span class="live-dot"></span><span id="p3-status">STRATEGY NOT YET APPLIED</span><span>SIMULATED OUTCOMES // NOT LIVE DATA</span></div>
      </section>`;
    document.body.appendChild(panel);
    this.panel=panel;
    panel.addEventListener("click",e=>{
      const close=e.target.closest("[data-p3-close]");
      if(close||e.target===panel){this.close();return;}
      const tab=e.target.closest("[data-p3-tab]");if(tab){this.active=tab.dataset.p3Tab;this.render();return;}
      const preset=e.target.closest("[data-p3-preset]");if(preset){this.levels={...PRESETS[preset.dataset.p3Preset]};this.render();return;}
      if(e.target.closest("[data-p3-reset]")){this.levels={forest:28,wetlands:18,drylands:14,rewilding:20,coastal:24,urban:16};this.render();return;}
      if(e.target.closest("[data-p3-apply]")){this.apply();return;}
    });
    panel.addEventListener("input",e=>{const input=e.target.closest("[data-p3-level]");if(!input)return;this.levels[input.dataset.p3Level]=Number(input.value);this.renderMetrics();const out=panel.querySelector(`[data-p3-value="${input.dataset.p3Level}"]`);if(out)out.textContent=input.value+"%";});
    document.addEventListener("keydown",e=>{if(e.key==="Escape"&&!this.panel.classList.contains("hidden"))this.close();});
  }
  open(){this.panel.classList.remove("hidden");}
  close(){this.panel.classList.add("hidden");}
  render(){
    const host=this.panel.querySelector("#p3-interventions");
    const rows=INTERVENTIONS.filter(item=>this.active==="all"||item.zone.toLowerCase()===this.active);
    host.innerHTML=rows.map(item=>`<article class="p3-item"><div class="p3-item-head"><div><small>${item.zone} // RESTORATION PROGRAM</small><b>${item.name}</b></div><output data-p3-value="${item.id}">${this.levels[item.id]}%</output></div><p>${item.description}</p><input aria-label="${item.name} allocation" type="range" min="0" max="100" step="1" value="${this.levels[item.id]}" data-p3-level="${item.id}"><div class="p3-range-label"><span>LOW PRIORITY</span><span>HIGH PRIORITY</span></div></article>`).join("");
    this.panel.querySelectorAll("[data-p3-tab]").forEach(b=>b.classList.toggle("active",b.dataset.p3Tab===this.active));
    this.renderMetrics();
  }
  calculate(){
    const v=this.levels;
    const avg=Object.values(v).reduce((a,b)=>a+b,0)/6;
    const weighted=(v.forest*.22+v.wetlands*.18+v.drylands*.13+v.rewilding*.18+v.coastal*.17+v.urban*.12);
    return {momentum:Math.round(weighted),connectivity:Math.round(clamp(24+v.forest*.28+v.rewilding*.32+v.drylands*.12)),water:Math.round(clamp(28+v.wetlands*.38+v.drylands*.2+v.forest*.14)),coast:Math.round(clamp(22+v.coastal*.62+v.wetlands*.12)),urban:Math.round(clamp(18+v.urban*.68)),average:Math.round(avg)};
  }
  renderMetrics(){
    const m=this.calculate();
    for(const [id,value] of Object.entries({momentum:m.momentum,connectivity:m.connectivity,water:m.water,coast:m.coast,urban:m.urban})){const el=this.panel.querySelector("#p3-"+id);if(el)el.textContent=value+"/100";}
    this.panel.querySelector("#p3-momentum-bar").style.width=m.momentum+"%";
  }
  apply(){
    const result={...this.levels,metrics:this.calculate()};
    this.onChange(result);
    this.panel.querySelector("#p3-status").textContent="RESTORATION STRATEGY APPLIED TO CURRENT SIMULATION";
  }
}
