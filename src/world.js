import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

const EARTH_URL = "https://threejs.org/examples/textures/planets/earth_atmos_2048.jpg";
const CLOUD_URL = "https://threejs.org/examples/textures/planets/earth_clouds_1024.png";
function fallbackEarthTexture() { const canvas=document.createElement("canvas");canvas.width=1024;canvas.height=512;const ctx=canvas.getContext("2d");const ocean=ctx.createLinearGradient(0,0,0,512);ocean.addColorStop(0,"#123d5b");ocean.addColorStop(.5,"#0b3150");ocean.addColorStop(1,"#071c35");ctx.fillStyle=ocean;ctx.fillRect(0,0,1024,512);ctx.fillStyle="#397d63";ctx.strokeStyle="#6ba982";ctx.lineWidth=3;const land=[[[115,90],[175,58],[230,78],[260,130],[235,185],[205,218],[190,280],[155,320],[135,255],[112,200],[80,150]],[[245,280],[285,300],[300,365],[275,435],[245,390],[230,330]],[[445,100],[500,65],[560,82],[580,130],[550,170],[520,155],[500,210],[470,185],[430,145]],[[505,210],[560,205],[590,270],[565,345],[535,400],[500,340],[485,270]],[[630,90],[710,65],[790,100],[830,155],[795,210],[740,205],[700,175],[650,190],[620,140]],[[735,220],[790,220],[815,285],[790,350],[750,330],[725,270]],[[850,370],[920,350],[950,390],[920,425],[870,420]]];land.forEach(points=>{ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();ctx.fill();ctx.stroke();});for(let i=0;i<1500;i++){const x=Math.random()*1024,y=Math.random()*512;ctx.fillStyle=i%2?"rgba(255,255,255,.025)":"rgba(0,0,0,.035)";ctx.fillRect(x,y,1.5,1.5);}const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;return texture;}

export class PlanetWorld {
  constructor(container,regions,callbacks){this.container=container;this.regions=regions;this.callbacks=callbacks;this.scene=new THREE.Scene();this.camera=new THREE.PerspectiveCamera(38,1,.1,100);this.camera.position.set(0,.25,4.25);this.renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:"high-performance"});this.renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.7));this.renderer.outputColorSpace=THREE.SRGBColorSpace;this.renderer.toneMapping=THREE.ACESFilmicToneMapping;this.renderer.toneMappingExposure=1.15;this.container.appendChild(this.renderer.domElement);this.controls=new OrbitControls(this.camera,this.renderer.domElement);this.controls.enableDamping=true;this.controls.dampingFactor=.045;this.controls.enablePan=false;this.controls.minDistance=2.25;this.controls.maxDistance=7;this.controls.autoRotate=true;this.controls.autoRotateSpeed=.32;this.planet=new THREE.Group();this.scene.add(this.planet);this.pickables=[];this.markerMeshes=[];this.labelsVisible=true;this.reducedMotion=false;this.rotationPreference=true;this.temporalState=null;this.raycaster=new THREE.Raycaster();this.pointer=new THREE.Vector2();this.clock=new THREE.Clock();this.running=true;this.createLighting();this.createStars();this.createEarth();this.createMarkers();this.onPointer=this.onPointer.bind(this);this.onResize=this.onResize.bind(this);this.animate=this.animate.bind(this);this.renderer.domElement.addEventListener("pointerdown",this.onPointer);window.addEventListener("resize",this.onResize);this.onResize();this.animate();}
  createLighting(){this.scene.add(new THREE.AmbientLight(0x7899bb,1.45));const sun=new THREE.DirectionalLight(0xfff2d8,3.2);sun.position.set(4,2,5);this.scene.add(sun);const rim=new THREE.PointLight(0x3a8dff,2.4,12);rim.position.set(-4,-1,-3);this.scene.add(rim);}
  createStars(){const count=1800,positions=new Float32Array(count*3);for(let i=0;i<count;i++){const radius=THREE.MathUtils.randFloat(13,35),theta=Math.random()*Math.PI*2,phi=Math.acos(THREE.MathUtils.randFloatSpread(2));positions[i*3]=radius*Math.sin(phi)*Math.cos(theta);positions[i*3+1]=radius*Math.cos(phi);positions[i*3+2]=radius*Math.sin(phi)*Math.sin(theta);}const geometry=new THREE.BufferGeometry();geometry.setAttribute("position",new THREE.BufferAttribute(positions,3));const material=new THREE.PointsMaterial({color:0xa8c9e9,size:.045,transparent:true,opacity:.75,sizeAttenuation:true});this.stars=new THREE.Points(geometry,material);this.scene.add(this.stars);}
  createEarth(){const loader=new THREE.TextureLoader();loader.setCrossOrigin("anonymous");const earthMaterial=new THREE.MeshPhongMaterial({map:fallbackEarthTexture(),shininess:12,specular:new THREE.Color(0x244b69),color:0xffffff});this.earth=new THREE.Mesh(new THREE.SphereGeometry(1,96,96),earthMaterial);this.planet.add(this.earth);loader.load(EARTH_URL,texture=>{texture.colorSpace=THREE.SRGBColorSpace;this.earth.material.map=texture;this.earth.material.needsUpdate=true;},undefined,()=>{});this.clouds=new THREE.Mesh(new THREE.SphereGeometry(1.009,64,64),new THREE.MeshPhongMaterial({map:this.makeCloudFallback(),transparent:true,opacity:.13,depthWrite:false,color:0xffffff}));this.planet.add(this.clouds);loader.load(CLOUD_URL,texture=>{texture.colorSpace=THREE.SRGBColorSpace;this.clouds.material.map=texture;this.clouds.material.opacity=.22;this.clouds.material.needsUpdate=true;},undefined,()=>{});this.atmosphere=new THREE.Mesh(new THREE.SphereGeometry(1.055,64,64),new THREE.ShaderMaterial({vertexShader:"varying vec3 vNormal; void main(){vNormal=normalize(normalMatrix*normal);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}",fragmentShader:"uniform vec3 glowColor; varying vec3 vNormal; void main(){float intensity=pow(.68-dot(vNormal,vec3(0.,0.,1.)),2.2);gl_FragColor=vec4(glowColor,1.)*intensity*.72;}",uniforms:{glowColor:{value:new THREE.Color(0x1f86ff)}},blending:THREE.AdditiveBlending,side:THREE.BackSide,transparent:true,depthWrite:false}));this.planet.add(this.atmosphere);this.glow=new THREE.Mesh(new THREE.SphereGeometry(1.12,48,48),new THREE.MeshBasicMaterial({color:0x1675d1,transparent:true,opacity:.035,side:THREE.BackSide}));this.planet.add(this.glow);this.createRestorationOverlay();}
  createRestorationOverlay(){this.restorationCanvas=document.createElement("canvas");this.restorationCanvas.width=2048;this.restorationCanvas.height=1024;this.restorationContext=this.restorationCanvas.getContext("2d");this.restorationTexture=new THREE.CanvasTexture(this.restorationCanvas);this.restorationTexture.colorSpace=THREE.SRGBColorSpace;this.restorationTexture.needsUpdate=true;this.restorationSurface=new THREE.Mesh(new THREE.SphereGeometry(1.012,96,96),new THREE.MeshBasicMaterial({map:this.restorationTexture,transparent:true,opacity:.94,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.FrontSide}));this.restorationSurface.renderOrder=2;this.planet.add(this.restorationSurface);}
  drawRestorationSurface(state){const ctx=this.restorationContext;if(!ctx)return;const w=this.restorationCanvas.width,h=this.restorationCanvas.height;ctx.clearRect(0,0,w,h);const zones=[{id:"amazon",level:state.forest,color:"#48ef78",rx:125,ry:82},{id:"arctic",level:state.rewilding,color:"#80eaff",rx:145,ry:62},{id:"sahara",level:state.drylands,color:"#e7c66a",rx:145,ry:76},{id:"southasia",level:Math.max(state.wetlands,state.urban),color:"#55e6c1",rx:150,ry:92},{id:"coral",level:state.coastal,color:"#39dfe8",rx:150,ry:78}];const centers={amazon:{lat:-3.4,lon:-60},arctic:{lat:72,lon:20},sahara:{lat:23,lon:12},southasia:{lat:21,lon:82},coral:{lat:1,lon:125}};for(const zone of zones){const amount=THREE.MathUtils.clamp(Number(zone.level)||0,0,100);if(amount<2)continue;const p=centers[zone.id],x=((p.lon+180)/360)*w,y=((90-p.lat)/180)*h;const alpha=.12+amount/100*.43;ctx.save();ctx.translate(x,y);ctx.scale(1,zone.ry/zone.rx);const grad=ctx.createRadialGradient(0,0,4,0,0,zone.rx);grad.addColorStop(0,zone.color+Math.round(alpha*255).toString(16).padStart(2,"0"));grad.addColorStop(.58,zone.color+Math.round(alpha*.58*255).toString(16).padStart(2,"0"));grad.addColorStop(1,zone.color+"00");ctx.fillStyle=grad;ctx.beginPath();ctx.arc(0,0,zone.rx,0,Math.PI*2);ctx.fill();ctx.restore();}this.restorationTexture.needsUpdate=true;}
  makeCloudFallback(){const canvas=document.createElement("canvas");canvas.width=512;canvas.height=256;const c=canvas.getContext("2d");for(let i=0;i<900;i++){const x=Math.random()*512,y=Math.random()*256,r=2+Math.random()*10;c.fillStyle=`rgba(255,255,255,${Math.random()*.09})`;c.beginPath();c.ellipse(x,y,r*1.8,r,0,0,Math.PI*2);c.fill();}return new THREE.CanvasTexture(canvas);}
  latLon(lat,lon,radius=1.018){const phi=(90-lat)*Math.PI/180,theta=(lon+180)*Math.PI/180;return new THREE.Vector3(-radius*Math.sin(phi)*Math.cos(theta),radius*Math.cos(phi),radius*Math.sin(phi)*Math.sin(theta));}
  createMarkers(){const markerGeometry=new THREE.SphereGeometry(.018,12,12);this.regions.forEach(region=>{const marker=new THREE.Mesh(markerGeometry,new THREE.MeshBasicMaterial({color:region.color}));marker.position.copy(this.latLon(region.lat,region.lon));marker.userData.region=region;marker.userData.baseColor=region.color;this.planet.add(marker);this.pickables.push(marker);this.markerMeshes.push(marker);const ring=new THREE.Mesh(new THREE.RingGeometry(.025,.034,32),new THREE.MeshBasicMaterial({color:region.color,transparent:true,opacity:.72,side:THREE.DoubleSide}));ring.lookAt(this.latLon(region.lat,region.lon).normalize());marker.add(ring);});}
  onPointer(event){const rect=this.renderer.domElement.getBoundingClientRect();this.pointer.x=((event.clientX-rect.left)/rect.width)*2-1;this.pointer.y=-((event.clientY-rect.top)/rect.height)*2+1;this.raycaster.setFromCamera(this.pointer,this.camera);const hits=this.raycaster.intersectObjects(this.pickables,false);if(hits.length&&this.callbacks.onRegion)this.callbacks.onRegion(hits[0].object.userData.region);}
  onResize(){const width=Math.max(1,this.container.clientWidth),height=Math.max(1,this.container.clientHeight);this.camera.aspect=width/height;this.camera.updateProjectionMatrix();this.renderer.setSize(width,height,false);}
  setRotation(value){this.rotationPreference=value;this.controls.autoRotate=value&&!this.reducedMotion;}
  setLabels(value){this.labelsVisible=value;this.markerMeshes.forEach(m=>m.visible=value);}
  setReducedMotion(value){this.reducedMotion=value;this.controls.autoRotate=this.reducedMotion?false:this.rotationPreference;}
  setQuality(high){this.renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,high?1.7:1));}
  setTemporalState(state){this.temporalState=state;const progress=Math.max(0,Math.min(1,(state.year-2026)/(2077-2026)));const biome=state.biome??68;const color=new THREE.Color();color.setHSL(.55-.12*progress,.72,.52);if(this.earth){this.earth.material.color.lerp(color,.18);this.earth.material.needsUpdate=true;}if(this.atmosphere?.material?.uniforms?.glowColor)this.atmosphere.material.uniforms.glowColor.value.lerp(new THREE.Color(progress>.6?0x48e0b0:0x1f86ff),.12);if(this.clouds)this.clouds.material.opacity=.18+.08*progress;this.glow?.material&&(this.glow.material.opacity=.035+.018*progress);}
  setRestorationState(state){this.restorationState=state;this.drawRestorationSurface(state);const map={amazon:state.forest,southasia:Math.max(state.wetlands,state.urban),sahara:state.drylands,arctic:state.rewilding,coral:state.coastal};this.markerMeshes.forEach(marker=>{const region=marker.userData.region;const level=map[region.id]??0;const color=new THREE.Color(region.color);color.lerp(new THREE.Color(0x69f0a7),level/120);marker.material.color.copy(color);const scale=1+level/90;marker.scale.setScalar(scale);const ring=marker.children[0];if(ring){ring.material.color.copy(color);ring.material.opacity=.35+level/150;ring.scale.setScalar(1+level/80);}});const momentum=state.metrics?.momentum??0;if(this.atmosphere?.material?.uniforms?.glowColor)this.atmosphere.material.uniforms.glowColor.value.set(0x1f86ff).lerp(new THREE.Color(0x42dca1),momentum/100);if(this.glow?.material)this.glow.material.opacity=.035+momentum/900;}
  setDecisionState(state){this.decisionState=state;const s=state.scores||{};const blend={...(this.restorationState||{forest:0,wetlands:0,drylands:0,rewilding:0,coastal:0,urban:0})};blend.forest=Math.max(blend.forest,Math.round((s.biodiversity||0)*.82));blend.wetlands=Math.max(blend.wetlands,Math.round((s.water||0)*.78));blend.drylands=Math.max(blend.drylands,Math.round((s.biome||0)*.64));blend.rewilding=Math.max(blend.rewilding,Math.round((s.biodiversity||0)*.76));blend.coastal=Math.max(blend.coastal,Math.round((s.climate||0)*.68));blend.urban=Math.max(blend.urban,Math.round((s.livelihood||0)*.7));blend.metrics={momentum:state.score||0};this.drawRestorationSurface(blend);const regional={amazon:blend.forest,arctic:blend.rewilding,sahara:blend.drylands,southasia:Math.max(blend.wetlands,blend.urban),coral:blend.coastal};this.markerMeshes.forEach(marker=>{const level=regional[marker.userData.region.id]||0;const color=new THREE.Color(marker.userData.baseColor);color.lerp(new THREE.Color(0x72e6a5),level/125);marker.material.color.copy(color);marker.scale.setScalar(1+level/150);});if(this.atmosphere?.material?.uniforms?.glowColor)this.atmosphere.material.uniforms.glowColor.value.set(0x1f86ff).lerp(new THREE.Color(0x42dca1),(state.score||0)/130);}
  setExperienceState(state){
    this.experienceState=state;
    const p=state?.pillars||{};
    const env=THREE.MathUtils.clamp(Number(p.environment??50),0,100);
    const water=THREE.MathUtils.clamp(Number(p.water??50),0,100);
    const bio=THREE.MathUtils.clamp(Number(p.biodiversity??50),0,100);
    const people=THREE.MathUtils.clamp(Number(p.people??50),0,100);
    const climate=THREE.MathUtils.clamp(Number(p.climate??50),0,100);
    const blend={...(this.restorationState||{forest:0,wetlands:0,drylands:0,rewilding:0,coastal:0,urban:0})};
    blend.forest=Math.max(blend.forest||0,bio*.82,env*.55);
    blend.wetlands=Math.max(blend.wetlands||0,water*.86);
    blend.drylands=Math.max(blend.drylands||0,climate*.62);
    blend.rewilding=Math.max(blend.rewilding||0,bio*.78);
    blend.coastal=Math.max(blend.coastal||0,Math.max(water,climate)*.68);
    blend.urban=Math.max(blend.urban||0,people*.72);
    blend.metrics={...(blend.metrics||{}),momentum:Math.round((env+water+bio+people+climate)/5)};
    this.drawRestorationSurface(blend);
    const regional={amazon:blend.forest,arctic:blend.rewilding,sahara:blend.drylands,southasia:Math.max(blend.wetlands,blend.urban),coral:blend.coastal};
    this.markerMeshes.forEach(marker=>{
      const level=regional[marker.userData.region.id]||0;
      const color=new THREE.Color(marker.userData.baseColor).lerp(new THREE.Color(0x66e6a5),level/125);
      marker.material.color.copy(color);
      marker.scale.setScalar(1+level/180);
      const ring=marker.children[0];if(ring){ring.material.color.copy(color);ring.material.opacity=.3+level/180;}
    });
    const avg=(env+water+bio+people+climate)/5;
    const tint=new THREE.Color().setHSL(.52-(climate/100)*.08,.58,.48+(avg/100)*.08);
    if(this.atmosphere?.material?.uniforms?.glowColor)this.atmosphere.material.uniforms.glowColor.value.copy(tint);
    if(this.glow?.material)this.glow.material.color.copy(tint).multiplyScalar(1.15),this.glow.material.opacity=.025+avg/1800;
    if(this.clouds)this.clouds.material.opacity=.12+water/100*.16;
    if(this.earth?.material)this.earth.material.color.setRGB(1, .94+env/1800, .92+climate/2200);
  }
  setPhase7State(state){
    this.phase7State=state;
    if(!this.phase7Canvas){
      this.phase7Canvas=document.createElement("canvas");this.phase7Canvas.width=2048;this.phase7Canvas.height=1024;
      this.phase7Context=this.phase7Canvas.getContext("2d");this.phase7Texture=new THREE.CanvasTexture(this.phase7Canvas);this.phase7Texture.colorSpace=THREE.SRGBColorSpace;
      this.phase7Surface=new THREE.Mesh(new THREE.SphereGeometry(1.019,96,96),new THREE.MeshBasicMaterial({map:this.phase7Texture,transparent:true,opacity:.9,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.FrontSide}));
      this.phase7Surface.renderOrder=3;this.planet.add(this.phase7Surface);
    }
    const ctx=this.phase7Context,w=this.phase7Canvas.width,h=this.phase7Canvas.height;ctx.clearRect(0,0,w,h);
    const defs={amazon:{lat:-3.4,lon:-60,color:"#43f078",system:"environment"},arctic:{lat:72,lon:20,color:"#77dfff",system:"climate"},sahara:{lat:23,lon:12,color:"#f0c66b",system:"food"},southasia:{lat:21,lon:82,color:"#55e6c1",system:"cities"},coral:{lat:1,lon:125,color:"#39dfe8",system:"ocean"}};
    const scanColors={ecosystem:"#49e878",water:"#38bce8",climate:"#ffad55",ocean:"#37dfe8",human:"#d28bff",resources:"#f4d36b"};
    const selected=state.selectedRegion;const scanColor=scanColors[state.scan]||"#49e878";
    for(const [id,p] of Object.entries(defs)){
      const val=THREE.MathUtils.clamp(Number(state.regions?.[id]??50),0,100),x=((p.lon+180)/360)*w,y=((90-p.lat)/180)*h;
      const color=id===selected?scanColor:p.color,alpha=.12+(val/100)*.42,r=65+val*1.1;
      ctx.save();ctx.translate(x,y);const g=ctx.createRadialGradient(0,0,3,0,0,r);g.addColorStop(0,color+Math.round(alpha*255).toString(16).padStart(2,"0"));g.addColorStop(.55,color+Math.round(alpha*.52*255).toString(16).padStart(2,"0"));g.addColorStop(1,color+"00");ctx.fillStyle=g;ctx.beginPath();ctx.ellipse(0,0,r,r*.62,0,0,Math.PI*2);ctx.fill();ctx.restore();
    }
    this.phase7Texture.needsUpdate=true;
    const avg=THREE.MathUtils.clamp(Number(state.average??50),0,100);
    const tint=new THREE.Color().setHSL(.48-(avg/100)*.12,.78,.48);
    if(this.atmosphere?.material?.uniforms?.glowColor)this.atmosphere.material.uniforms.glowColor.value.copy(tint);
    if(this.glow?.material){this.glow.material.color.copy(tint);this.glow.material.opacity=.025+avg/1400;}
    if(this.clouds)this.clouds.material.opacity=.12+avg/500;
    const colors={amazon:0x43f078,arctic:0x77dfff,sahara:0xf0c66b,southasia:0x55e6c1,coral:0x39dfe8};
    this.markerMeshes.forEach(marker=>{
      const id=marker.userData.region.id,level=THREE.MathUtils.clamp(Number(state.regions?.[id]??0),0,100);
      const base=new THREE.Color(colors[id]??marker.userData.baseColor),stress=new THREE.Color(0xff775f);
      const color=base.clone().lerp(stress,(100-level)/160);
      marker.material.color.copy(color);marker.scale.setScalar(1+level/125);
      const ring=marker.children[0];if(ring){ring.material.color.copy(color);ring.material.opacity=.28+level/140;ring.scale.setScalar(1+level/95);}
    });
    this.phase7Surface.visible=true;
  }
  setAuditVisual(mode="recovery"){
    const palettes={recovery:0x55e6a8,stress:0xff9b55,baseline:0x398bdb};
    const color=new THREE.Color(palettes[mode]||palettes.baseline);
    if(this.atmosphere?.material?.uniforms?.glowColor)this.atmosphere.material.uniforms.glowColor.value.copy(color);
    if(this.glow?.material){this.glow.material.color.copy(color);this.glow.material.opacity=mode==="baseline"?.035:.075;}
    if(this.clouds)this.clouds.material.opacity=mode==="stress"?.28:.18;
    this.auditVisualMode=mode;
  }
  focusRegion(region){this.planet.updateMatrixWorld(true);const point=this.latLon(region.lat,region.lon,1.02).normalize();const worldPoint=point.applyMatrix4(this.planet.matrixWorld);this.camera.position.copy(worldPoint.normalize().multiplyScalar(3));this.controls.target.set(0,0,0);this.controls.update();}
  reset(){this.camera.position.set(0,.25,4.25);this.controls.target.set(0,0,0);this.controls.update();}
  animate(){if(!this.running)return;requestAnimationFrame(this.animate);const delta=Math.min(this.clock.getDelta(),.05);if(!this.reducedMotion){this.clouds.rotation.y+=delta*.006;this.stars.rotation.y+=delta*.0015;}this.controls.update();this.renderer.render(this.scene,this.camera);}
  dispose(){this.running=false;window.removeEventListener("resize",this.onResize);this.renderer.domElement.removeEventListener("pointerdown",this.onPointer);this.controls.dispose();this.scene.traverse(obj=>{obj.geometry?.dispose();if(obj.material){(Array.isArray(obj.material)?obj.material:[obj.material]).forEach(m=>{m.map?.dispose();m.dispose();});}});this.renderer.dispose();this.renderer.domElement.remove();}
}
