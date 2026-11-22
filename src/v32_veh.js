/* =====================================================================
   v32_veh · VEHÍCULOS Y MATERIAL PESADO DE AETHRION (1918–1922)
   Volskaya: autoblindado bitorre «Grom», carro ligero «Sokol», camión,
   tren (locomotora 2-6-0 con ténder y vagones), cañón de campaña, antitanque, mortero.
   Veyrn: autoblindado de reconocimiento 6×4, carro medio «Vrak» con barbetas,
   camión, destructor, transporte y monitor.
   Modelos: plantillas fusionadas (PB/pbMesh) cacheadas por tipo, bando y G.detail;
   cada instancia es un clone() que comparte geometrías.
   Comportamiento: recorrido por puntos con giro suave, torretas que buscan el
   objetivo hostil más cercano con línea de visión, ráfagas con trazadoras,
   proyectiles con aviso previo, daño por zonas, humo, explosión y restos en
   llamas que quedan como cobertura (obstB).
   Coordenadas de la API: LOCALES al nivel 17 (x mundo = VEH32.X + x; VEH32.X = X17).
   ===================================================================== */
const X17=160000;
const VEH32={list:[],X:X17,seaY:-.75,railY:.22,warn:true,allyDown:false,tpl:{},trains:[],lt:-1e9,
 onKill:v=>{},allies:null,onAllyHit:null,floor:null};
const vh_va32=new T.Vector3(),vh_vb32=new T.Vector3(),vh_vc32=new T.Vector3(),vh_vd32=new T.Vector3(),vh_ve32=new T.Vector3();
const vhCL32=(v,a,b)=>v<a?a:v>b?b:v,vhAD32=(a,b)=>{let d=b-a;while(d>Math.PI)d-=6.2832;while(d<-Math.PI)d+=6.2832;return d};
const vhDet32=()=>+(G.detail||0);
function vhSide32(s){return(s==='volsk'||s==='v'||s==='ally'||s==='a'||s===true||s==='vol')?'volsk':'veyrn'}
const vhVC32={volsk:{a:0x56604a,b:0x434b3a,c:0x66705a,m:0x2a2c26,tk:'sh'},veyrn:{a:0x4c5158,b:0x363a40,c:0x5e636a,m:0x222428,tk:'en'}};
const vhBURNT32=new T.MeshLambertMaterial({vertexColors:true,color:0x3a3632,map:typeof vehT!=='undefined'?vehT:null});
const vhGLINT32=new T.SpriteMaterial({map:(()=>{const c=document.createElement('canvas');c.width=c.height=64;const x=c.getContext('2d'),g=x.createRadialGradient(32,32,0,32,32,32);g.addColorStop(0,'rgba(255,255,255,1)');g.addColorStop(.2,'rgba(255,240,190,.9)');g.addColorStop(1,'rgba(255,200,120,0)');x.fillStyle=g;x.fillRect(0,0,64,64);x.fillStyle='rgba(255,250,220,.8)';x.fillRect(0,30,64,4);x.fillRect(30,0,4,64);return new T.CanvasTexture(c)})(),color:0xfff2c0,transparent:true,opacity:.95,blending:T.AdditiveBlending,depthWrite:false,fog:false});
function vhFlo32(x,z){if(VEH32.floor)return VEH32.floor(x,z);if(typeof floor17==='function'&&VEH32.X===X17)return floor17(x-X17,z)||0;return 0}
/* ---------- marcas, remaches, ruedas ---------- */
function vhMark32(q,x,y,z,ax,s,side){const X=ax==='x';const d=(r,c,o)=>pCyl(q,r,r,.02,c,x+(X?o:0),y,z+(X?0:o),X?0:1.5708,0,X?1.5708:0,14);const o=X?Math.sign(x||1):Math.sign(z||1);
 if(side==='volsk'){d(s*.5,0xe6e2d4,0);d(s*.34,0x2e6a3a,o*.012);d(s*.17,0x1c2a5a,o*.024)}
 else{const b=(w,c,oo)=>pBox(q,X?.02:w,w,X?w:.02,c,x+(X?oo:0),y,z+(X?0:oo),X?.785:0,0,X?0:.785,.02);b(s*.72,0xe0ddd2,0);b(s*.52,0x101012,o*.012);b(s*.14,0xa02020,o*.024)}}
function vhRiv32(q,x0,y0,z0,x1,y1,z1,n,col){const D=vhDet32();if(!D)return;n=Math.max(2,Math.round(n*(D>1?1:.45)));for(let i=0;i<n;i++){const t=i/(n-1);pBox(q,.045,.045,.045,col,x0+(x1-x0)*t,y0+(y1-y0)*t,z0+(z1-z0)*t,0,0,0,.02)}}
const vhWG32={};
/* rueda de radios con llanta maciza (eje = x) */
function vhWSpoke32(r,w,n,tyre,rim,sp){const k='s'+r+w+n+tyre+rim+sp+vhDet32();if(vhWG32[k])return vhWG32[k];const q=PB(),D=vhDet32();
 pa(q,gTor(r-.07,.075,6,D?16:12),tyre,0,0,0,0,1.5708,0,1,1,w/.15);pa(q,gTor(r-.15,.03,4,D?16:10),rim,0,0,0,0,1.5708,0);
 for(let i=0;i<n;i++){const a=i/n*6.2832;pBox(q,.05,r-.12,.06,sp,0,Math.cos(a)*(r-.12)/2,Math.sin(a)*(r-.12)/2,a,0,0)}
 pCyl(q,r*.22,r*.22,w*1.1,rim,0,0,0,0,0,1.5708,10);pCyl(q,r*.1,r*.1,w*1.4,0x2a2a26,0,0,0,0,0,1.5708,6);return vhWG32[k]=pbGeo(q)}
/* rueda de disco de acero con llanta maciza */
function vhWDisc32(r,w,tyre,disc){const k='d'+r+w+tyre+disc+vhDet32();if(vhWG32[k])return vhWG32[k];const q=PB(),D=vhDet32();
 pa(q,gTor(r-.08,.08,6,D?18:12),tyre,0,0,0,0,1.5708,0,1,1,w/.16);pCyl(q,r-.1,r-.1,w*.7,disc,0,0,0,0,0,1.5708,D?16:10);pCyl(q,r*.3,r*.34,w*1.05,shade(disc,.8),0,0,0,0,0,1.5708,10);
 if(D)for(let i=0;i<6;i++){const a=i/6*6.2832;pBox(q,w*1.1,.05,.05,0x2a2a26,0,Math.cos(a)*r*.22,Math.sin(a)*r*.22)}return vhWG32[k]=pbGeo(q)}
/* rueda ferroviaria con pestaña y radios */
function vhWRail32(r,col,n){const k='r'+r+col+n+vhDet32();if(vhWG32[k])return vhWG32[k];const q=PB();pCyl(q,r,r,.14,0x3a3a36,0,0,0,0,0,1.5708,16);pCyl(q,r+.05,r+.05,.04,0x2e2e2a,.08,0,0,0,0,1.5708,16);
 pCyl(q,r*.82,r*.82,.16,col,0,0,0,0,0,1.5708,14);for(let i=0;i<n;i++){const a=i/n*6.2832;pBox(q,.18,r*.7,.07,shade(col,.75),0,Math.cos(a)*r*.42,Math.sin(a)*r*.42,a,0,0)}
 if(n>8){pBox(q,.19,r*.32,r*.32,shade(col,.6),0,-r*.45,0)}pCyl(q,r*.18,r*.18,.24,0x222220,0,0,0,0,0,1.5708,8);return vhWG32[k]=pbGeo(q)}
function vhRoad32(r,k){if(vhDet32()>1&&typeof roadWheelGeo==='function')return roadWheelGeo(r,k);const key='rw'+r+k;if(vhWG32[key])return vhWG32[key];const q=PB(),c=TKC[k].b;pCyl(q,r,r,.26,0x1c1c1a,0,0,0,0,0,1.5708,10);pCyl(q,r*.72,r*.72,.3,c,0,0,0,0,0,1.5708,8);pCyl(q,r*.22,r*.22,.34,0x2a2a26,0,0,0,0,0,1.5708,6);return vhWG32[key]=pbGeo(q)}
function vhWheel32(par,geo,x,y,z,r,list,steer){let o=par;if(steer){o=new T.Group();o.position.set(x,y,z);o.name='steer';par.add(o);x=0;y=0;z=0}const m=new T.Mesh(geo,VCV);m.position.set(x,y,z);m.name='w'+r;o.add(m);if(list)list.push(m);return m}
/* ---------- tripulante de bajo coste (~220 vértices) ---------- */
const vhCRW32={};
function vhCrewGeo32(side,pose){const k=side+pose;if(vhCRW32[k])return vhCRW32[k];const q=PB(),V=side==='volsk',coat=V?0x5e6a52:0x383c46,pant=V?0x463e34:0x2c2e34,helm=V?0x56604a:0x2a2e34,sk=0xc8986a,bt=0x16120e,lea=V?0x3a2a18:0x4a4a30;
 const head=(y,z)=>{pBox(q,.2,.24,.22,sk,0,y,z);if(pose==='crewv'||(!V&&pose==='drv'))pa(q,gSph(.15,8,5,0,1.5708),0x3a2a1c,0,y+.06,z,0,0,0,1,.9,1.1);else{pa(q,gSph(.17,8,5,0,1.5708),helm,0,y+.05,z,0,0,0,1.05,.85,1.12);pCyl(q,.22,.24,.03,helm,0,y+.05,z,0,0,0,10);if(!V)pBox(q,.035,.07,.28,shade(helm,.8),0,y+.2,z)}};
 if(pose==='head'){pBox(q,.46,.36,.3,coat,0,-.18,0);head(.15,0)}
 else if(pose==='sit'||pose==='drv'){pBox(q,.44,.56,.28,coat,0,.68,0);pBox(q,.46,.07,.3,lea,0,.46,0);for(const s of[-1,1]){pBox(q,.16,.16,.5,pant,s*.12,.38,.2);pBox(q,.15,.44,.15,pant,s*.12,.18,.42);pBox(q,.15,.1,.24,bt,s*.12,0,.47);pBox(q,.12,.42,.12,coat,s*.27,.68,.14,-.9)}head(1.1,0)}
 else if(pose==='kneel'){pBox(q,.44,.56,.28,coat,0,.86,.05,.15);pBox(q,.46,.07,.3,lea,0,.62,0);pBox(q,.16,.46,.16,pant,-.12,.24,.3);pBox(q,.16,.16,.46,pant,-.12,.5,.1);pBox(q,.16,.44,.16,pant,.12,.16,-.2,1.4);pBox(q,.16,.16,.4,pant,.12,.42,0);pBox(q,.15,.1,.26,bt,-.12,.04,.36);
  for(const s of[-1,1])pBox(q,.12,.46,.12,coat,s*.27,.84,.22,-1.1);head(1.28,.1)}
 else{/* de pie */pBox(q,.44,.6,.28,coat,0,1.18,0);pBox(q,.46,.07,.3,lea,0,.9,0);if(V&&pose!=='crewv')pBox(q,.46,.36,.3,coat,0,.72,0);for(const s of[-1,1]){pBox(q,.16,.82,.17,pant,s*.12,.44,0);pBox(q,.17,.32,.19,bt,s*.12,.16,0);pBox(q,.15,.1,.26,bt,s*.12,.04,.04);pBox(q,.12,.56,.12,coat,s*.29,1.15,pose==='bino'?.18:0,pose==='bino'?-1.3:0,0,0)}
  if(pose==='bino')pBox(q,.18,.08,.14,0x111111,0,1.52,.3);if(pose==='carry')pCyl(q,.06,.06,.5,0xb08a3a,0,1.0,.22,1.5708,0,0,8);head(1.6,0)}
 return vhCRW32[k]=pbGeo(q)}
function vhCrew32(par,side,pose,x,y,z,ry,list){const m=new T.Mesh(vhCrewGeo32(side,pose),VCM);m.position.set(x,y,z);m.rotation.y=ry||0;m.name='crew';par.add(m);if(list)list.push(m);return m}
/* oruga: banda con textura de eslabones (material propio por instancia para animarla) */
const vhTRKM32=new T.MeshLambertMaterial({map:typeof trkT!=='undefined'?trkT:null,color:0x8a8a82});
function vhTrackRun32(g,X,w,pts,name){const t=PB();for(let i=0;i<pts.length-1;i++){const[a,b]=[pts[i],pts[i+1]],dy=b[0]-a[0],dz=b[1]-a[1],L=Math.hypot(dy,dz);pBox(t,w,.09,L+.06,0xffffff,X,(a[0]+b[0])/2,(a[1]+b[1])/2,-Math.atan2(dy,dz),0,0,0)}const m=pbMesh(t,g,vhTRKM32);m.name=name;return m}
/* ---------- montajes de armas ---------- */
function vhMount32(par,name,x,y,z){const y_=new T.Group();y_.position.set(x,y,z);y_.name='tur'+name;par.add(y_);const p=new T.Group();p.name='gun'+name;y_.add(p);const m=new T.Object3D();m.name='muz'+name;p.add(m);return{y:y_,p,m}}
/* =====================================================================
   PLANTILLAS (se construyen una vez por tipo · bando · detalle)
   ===================================================================== */
/* --- carro ligero volskayo «Sokol» (2 tripulantes, torre hexagonal, 37 mm) --- */
function vhTplLight32(side){const C=vhVC32[side],A=C.a,B=C.b,Cc=C.c,MT=C.m,DK=0x161614,D=vhDet32(),g=new T.Group(),q=PB(),W=[];
 /* bastidores de oruga laterales que envuelven el tren de rodaje */
 for(const s of[-1,1]){const X=s*.78;pBox(q,.1,.62,3.9,B,X+s*.17,.62,.15);pBox(q,.1,.5,3.9,shade(B,.85),X-s*.17,.6,.15);pBox(q,.42,.08,3.9,B,X,.95,.15);
  pBox(q,.1,.5,.9,B,X+s*.17,.95,2.3,.55);vhRiv32(q,X+s*.23,.86,-1.7,X+s*.23,.86,2.0,16,shade(B,.7));vhRiv32(q,X+s*.23,.38,-1.7,X+s*.23,.38,2.0,16,shade(B,.7));
  for(let i=0;i<3;i++)pBox(q,.04,.34,.5,DK,X+s*.23,.55,-1.2+i*1.25);/* aberturas de barro */
  pCyl(q,.06,.06,.4,MT,X,.62,2.35,0,0,1.5708,6)}
 /* casco central, frente alto del conductor con doble escotilla, cubierta del motor */
 pBox(q,1.14,.86,3.5,A,0,1.0,.05);pBox(q,1.14,.1,1.1,shade(A,.9),0,1.5,1.5,.45);pBox(q,1.1,.6,.1,A,0,1.18,2.0,-.25);
 pBox(q,.9,.08,.55,shade(A,.85),0,1.66,1.18,.2);for(const s of[-1,1])pBox(q,.42,.05,.5,shade(A,.8),s*.22,1.72,1.2,.3,0,s*.05);pBox(q,.5,.06,.04,DK,0,1.5,1.92);
 pBox(q,1.14,.36,1.7,shade(A,.95),0,1.42,-.9);if(D)for(let i=0;i<6;i++)pBox(q,.8,.03,.08,DK,0,1.61,-.3-i*.22);pBox(q,1.0,.5,.1,A,0,1.0,-1.72,.3);
 vhRiv32(q,-.58,1.42,1.9,-.58,1.42,-1.7,14,shade(A,.7));vhRiv32(q,.58,1.42,1.9,.58,1.42,-1.7,14,shade(A,.7));
 /* cola anti-zanjas */for(const s of[-1,1]){pBox(q,.08,.1,1.4,MT,s*.42,.95,-2.35,-.35);pBox(q,.08,.5,.08,MT,s*.42,.75,-2.95)}pBox(q,.92,.08,.08,MT,0,.55,-3.0);
 /* escape y silenciador, herramientas */pCyl(q,.05,.05,1.7,0x2a2420,-.72,1.42,-.6,1.5708,0,0,6);pCyl(q,.1,.1,.6,0x2a2420,-.74,1.42,-1.6,1.5708,0,0,8);
 if(D){pBox(q,.06,.06,1.1,0x5a3a20,.62,1.6,-.6);pBox(q,.04,.2,.26,0x555550,.62,1.6,-1.25);pa(q,gTor(.14,.025,4,10),0x3a3a36,-.4,1.62,-1.4,1.5708,0,0)}
 for(const s of[-1,1])vhMark32(q,s*.66,1.08,-.2,'x',.5,side);
 pbMesh(q,g,VCV);
 /* orugas */const pts=[[.06,-1.75],[.06,1.6],[.42,2.42],[.95,2.42],[1.04,1.9],[1.04,-1.55],[.7,-2.05],[.3,-2.0],[.06,-1.75]];for(const s of[-1,1])vhTrackRun32(g,s*.78,.34,pts,'trk');
 const rg=vhRoad32(.22,C.tk);for(const s of[-1,1]){for(let i=0;i<5;i++)vhWheel32(g,rg,s*.78,.26,-1.35+i*.68,.22,W);vhWheel32(g,vhWSpoke32(.48,.3,8,0x1e1e1c,B,shade(B,.8)),s*.78,.66,2.12,.48,W);const sp=vhWheel32(g,sprocketGeo(C.tk),s*.78,.55,-1.78,.4,W);sp.scale.setScalar(.8)}
 /* torre hexagonal con cúpula hongo y 37 mm corto */
 const M=vhMount32(g,'0',0,1.56,.42),tq=PB();pa(tq,gCyl(.58,.62,.78,6),Cc,0,.39,0,0,.5236);pa(tq,gCyl(.5,.58,.1,6),shade(Cc,.9),0,.83,0,0,.5236);pCyl(tq,.17,.2,.18,shade(Cc,.85),0,.97,-.05,0,0,0,10);pa(tq,gSph(.24,10,4,0,1.2),shade(Cc,.85),0,1.0,-.05,0,0,0,1,.5,1);
 for(let i=0;i<6;i++){const a=i/6*6.2832+.5236;pBox(tq,.12,.03,.02,DK,Math.sin(a)*.57,.62,Math.cos(a)*.57,0,a,0)}pBox(tq,.5,.5,.06,shade(Cc,.8),0,.38,-.58);
 vhRiv32(tq,-.3,.74,.5,.3,.74,.5,7,shade(Cc,.6));vhMark32(tq,.6,.42,0,'x',.36,side);vhMark32(tq,-.6,.42,0,'x',.36,side);pbMesh(tq,M.y);
 M.p.position.set(0,.4,.5);const gq=PB();pa(gq,gSph(.22,10,6),shade(Cc,.85),0,0,0,0,0,0,1,1,.6);pCyl(gq,.05,.055,.9,0x2a2c28,0,0,.5,1.5708,0,0,8);pCyl(gq,.07,.07,.08,0x2a2c28,0,0,.94,1.5708,0,0,8);pBox(gq,.04,.05,.2,DK,.15,.12,.12);pbMesh(gq,M.p);M.m.position.set(0,0,1.0);
 return{g,spec:{type:'tank',name:'el carro ligero Sokol',hp:1400,armB:.03,armX:.38,vmax:5.2,turn:.65,acc:1.4,hw:.98,hd:1.95,h:2.4,cz:-.1,zf:2.6,zb:-3.0,
  mounts:[{n:'0',kind:'gun',cal:.8,rng:180,yr:.9,arc:9,cd:5.5,dmg:75,r:4.5,vs:'both'}]}}}
/* --- carro medio veyrno «Vrak» (casco en caja, barbetas laterales con ametralladora, cañón corto 57 mm) --- */
function vhTplMedium32(side){const C=vhVC32[side],A=C.a,B=C.b,Cc=C.c,MT=C.m,DK=0x141416,D=vhDet32(),g=new T.Group(),q=PB(),W=[];
 pBox(q,1.7,.9,6.1,B,0,.88,0);/* superestructura que sobresale sobre las orugas */pBox(q,2.56,1.0,4.3,A,0,1.82,.05);pBox(q,2.56,.1,4.3,shade(A,.9),0,2.36,.05);
 pBox(q,2.4,.12,1.5,A,0,1.72,2.7,.42);pBox(q,1.7,.75,.12,shade(A,.95),0,.95,3.12,-.5);pBox(q,2.4,.12,1.1,A,0,1.95,-2.55,-.4);pBox(q,1.7,.7,.12,shade(A,.9),0,1.0,-3.05,.2);
 /* cabina del conductor y ametralladora de proa */pBox(q,.75,.5,.6,shade(A,.95),-.6,2.1,2.0);pBox(q,.5,.05,.03,DK,-.6,2.18,2.31);pa(q,gSph(.17,8,6),shade(A,.85),.6,1.75,2.62);pCyl(q,.035,.035,.55,DK,.6,1.75,2.9,1.5708,0,0,6);
 /* barbetas laterales */for(const s of[-1,1]){pCyl(q,.48,.48,.92,A,s*1.28,1.78,.55,0,0,0,10);pCyl(q,.5,.5,.06,shade(A,.85),s*1.28,2.26,.55,0,0,0,10);vhRiv32(q,s*1.3,2.32,-1.9,s*1.3,2.32,2.0,18,shade(A,.7));vhRiv32(q,s*1.3,1.36,-1.9,s*1.3,1.36,2.0,18,shade(A,.7));vhMark32(q,s*1.29,1.8,-1.2,'x',.6,side)}
 /* faldones sobre el rodaje, rejillas, escape, viga de desatasco */
 for(const s of[-1,1]){pBox(q,.06,.42,5.6,shade(B,.9),s*1.36,.95,0);for(let i=0;i<5;i++)pBox(q,.04,.18,.4,DK,s*1.38,.82,-2.2+i*1.1)}
 if(D)for(let i=0;i<7;i++)pBox(q,1.5,.03,.08,DK,0,2.42,-1.1-i*.17);pCyl(q,.13,.15,1.2,0x2a2420,.95,2.9,-1.8,0,0,0,8);pCyl(q,.17,.17,.12,0x1a1612,.95,3.5,-1.8,0,0,0,8);
 pBox(q,2.4,.26,.3,0x5a4028,0,2.55,-1.65);for(const s of[-1,1])pBox(q,.08,.4,1.6,MT,s*1.1,2.48,-2.0);
 if(D){for(const s of[-1,1]){pBox(q,.06,.06,1.3,0x5a3a20,s*1.31,2.15,-.9);pa(q,gTor(.16,.03,4,10),0x3a3a36,s*1.31,2.0,1.5,0,1.5708,0)}for(const s of[-1,1])pCyl(q,.13,.13,.2,0x222222,s*.9,1.95,3.05,1.5708,0,0,8)}
 pbMesh(q,g,VCV);
 const pts=[[.06,-2.6],[.06,2.5],[.5,3.15],[.92,3.15],[1.12,2.7],[1.12,-2.7],[.75,-3.12],[.35,-3.05],[.06,-2.6]];for(const s of[-1,1])vhTrackRun32(g,s*1.08,.48,pts,'trk');
 const rg=vhRoad32(.32,C.tk);for(const s of[-1,1]){for(let i=0;i<7;i++)vhWheel32(g,rg,s*1.08,.36,-2.2+i*.73,.32,W);vhWheel32(g,vhWSpoke32(.45,.44,8,0x1c1c1a,B,shade(B,.8)),s*1.08,.68,2.82,.45,W);vhWheel32(g,sprocketGeo(C.tk),s*1.08,.62,-2.78,.48,W)}
 /* torre con frente inclinado, cúpula del jefe abierta */
 const M=vhMount32(g,'0',0,2.4,.75),tq=PB();pBox(tq,1.45,.78,1.6,Cc,0,.39,-.1);pBox(tq,1.45,.1,.6,Cc,0,.62,.82,.6);pBox(tq,1.45,.6,.1,Cc,0,.32,.84,-.15);for(const s of[-1,1])pBox(tq,.1,.72,1.6,shade(Cc,.95),s*.74,.36,-.1,0,0,s*.12);
 pBox(tq,1.2,.4,.5,shade(Cc,.9),0,.42,-1.1);pCyl(tq,.3,.32,.32,shade(Cc,.85),.3,.94,-.3,0,0,0,10);pBox(tq,.5,.06,.5,shade(Cc,.8),.3,1.3,-.62,-1.2);for(let i=0;i<5;i++){const a=i/5*6.28;pBox(tq,.08,.04,.02,DK,.3+Math.sin(a)*.31,.96,-.3+Math.cos(a)*.31,0,a,0)}
 vhRiv32(tq,-.7,.76,.5,.7,.76,.5,9,shade(Cc,.6));vhRiv32(tq,-.7,.76,-.85,.7,.76,-.85,9,shade(Cc,.6));vhMark32(tq,.79,.4,-.3,'x',.42,side);vhMark32(tq,-.79,.4,-.3,'x',.42,side);pbMesh(tq,M.y);
 vhCrew32(M.y,side,'head',.3,1.15,-.3,0);
 M.p.position.set(0,.36,.9);const gq=PB();pBox(gq,.56,.46,.3,shade(Cc,.85),0,0,.05);pCyl(gq,.065,.075,1.35,0x2a2c28,0,0,.8,1.5708,0,0,10);pCyl(gq,.09,.09,.12,0x2a2c28,0,0,1.44,1.5708,0,0,10);pCyl(gq,.06,.06,.9,shade(Cc,.7),0,.13,.55,1.5708,0,0,8);pbMesh(gq,M.p);M.m.position.set(0,0,1.52);
 /* ametralladoras de barbeta (arco lateral) */
 const mk=(n,s)=>{const S=vhMount32(g,n,s*1.62,1.8,.55);S.y.rotation.y=s*1.5708;const sq=PB();pa(sq,gSph(.16,8,6),shade(A,.8),0,0,0);pCyl(sq,.05,.05,.6,0x262626,0,0,.3,1.5708,0,0,6);pCyl(sq,.02,.02,.2,0x222222,0,0,.66,1.5708,0,0,5);pbMesh(sq,S.p);S.m.position.set(0,0,.78)};mk('1',1);mk('2',-1);
 return{g,spec:{type:'tank',name:'el carro medio Vrak',hp:2400,armB:.02,armX:.32,vmax:4.2,turn:.42,acc:1.0,hw:1.32,hd:3.2,h:2.9,cz:0,zf:3.3,zb:-3.15,
  mounts:[{n:'0',kind:'gun',cal:1.0,rng:200,yr:.55,arc:9,cd:7,dmg:85,r:5,vs:'both'},{n:'1',kind:'mg',rng:110,yr:1.5,arc:1.1,base:1.5708,cd:1.6,dmg:7},{n:'2',kind:'mg',rng:110,yr:1.5,arc:1.1,base:-1.5708,cd:1.6,dmg:7}]}}}
/* --- autoblindado volskayo bitorre «Grom» --- */
function vhTplArmcarV32(side){const C=vhVC32[side],A=C.a,B=C.b,Cc=C.c,MT=C.m,DK=0x141414,D=vhDet32(),g=new T.Group(),q=PB(),W=[];
 for(const s of[-1,1])pBox(q,.14,.2,5.0,MT,s*.5,.72,.1);pCyl(q,.07,.07,1.7,MT,0,.52,1.9,0,0,1.5708,6);pCyl(q,.1,.1,1.9,MT,0,.52,-1.3,0,0,1.5708,8);
 /* capó blindado a dos aguas, radiador con persianas */
 pBox(q,1.12,.75,1.6,A,0,1.18,1.95);for(const s of[-1,1])pBox(q,.62,.06,1.6,shade(A,.92),s*.27,1.62,1.95,0,0,s*.22);pBox(q,1.18,.95,.1,A,0,1.22,2.78);for(let i=0;i<6;i++)pBox(q,1.0,.04,.06,DK,0,.85+i*.13,2.84,.5);
 for(const s of[-1,1]){pCyl(q,.13,.11,.24,MT,s*.66,1.45,2.78,1.5708,0,0,8);pBox(q,.3,.18,.3,A,s*.66,1.62,2.72,.4)}
 /* guardabarros */for(const s of[-1,1]){for(let i=0;i<4;i++){const a=-1.0+i*.65;pBox(q,.36,.05,.45,shade(A,.85),s*.9,.52+Math.cos(a)*.66,1.9+Math.sin(a)*.66,-a)}pBox(q,.38,.05,2.0,shade(A,.85),s*.92,.86,.35);for(let i=0;i<3;i++){const a=-.7+i*.7;pBox(q,.6,.05,.45,shade(A,.85),s*.86,.52+Math.cos(a)*.64,-1.3+Math.sin(a)*.64,-a)}}
 /* cabina con frente inclinado y viseras */pBox(q,1.76,1.05,1.1,A,0,1.52,.75);pBox(q,1.76,.1,.7,shade(A,.9),0,2.0,1.2,.55);for(const s of[-1,1]){pBox(q,.5,.12,.04,DK,s*.42,1.95,1.31);pBox(q,.52,.16,.05,shade(A,.8),s*.42,2.06,1.36,.6)}
 /* caja de combate, puesto de conducción trasero */pBox(q,1.96,1.3,2.4,A,0,1.7,-.95);pBox(q,1.96,.1,2.4,shade(A,.9),0,2.38,-.95);pBox(q,1.2,.7,.1,shade(A,.9),0,1.6,-2.18);pBox(q,.4,.08,.04,DK,0,1.95,-2.24);
 for(const s of[-1,1]){pBox(q,.05,.8,.6,shade(A,.85),s*1.0,1.55,-.3);pBox(q,.03,.06,.3,DK,s*1.01,1.95,-1.5);vhMark32(q,s*.99,1.6,-1.3,'x',.55,side);vhRiv32(q,s*.99,2.3,-2.1,s*.99,2.3,1.2,16,shade(A,.7));vhRiv32(q,s*.99,1.1,-2.1,s*.99,1.1,1.2,16,shade(A,.7))}
 if(D){pBox(q,.5,.4,.7,0x4a4a36,.8,1.15,-.1);pBox(q,.06,.06,1.2,0x5a3a20,-.98,1.1,.2);pCyl(q,.05,.05,1.0,0x1a1a18,-.75,.6,-.4,1.5708,0,0,6)}
 pbMesh(q,g,VCV);
 const wf=vhWSpoke32(.5,.16,10,0x161614,shade(B,.9),shade(B,.75));for(const s of[-1,1]){vhWheel32(g,wf,s*.92,.5,1.9,.5,W,true);vhWheel32(g,wf,s*.84,.5,-1.3,.5,W);vhWheel32(g,wf,s*1.0,.5,-1.3,.5,W)}
 /* dos torretas escalonadas con Maxim de camisa de agua */
 const tur=(n,x,z)=>{const M=vhMount32(g,n,x,2.42,z),tq=PB();pCyl(tq,.5,.52,.6,Cc,0,.3,0,0,0,0,12);pa(tq,gSph(.5,12,4,0,1.0),shade(Cc,.92),0,.55,0,0,0,0,1,.45,1);pBox(tq,.18,.04,.02,DK,0,.42,.5);if(D)vhRiv32(tq,-.35,.58,.36,.35,.58,.36,6,shade(Cc,.6));pbMesh(tq,M.y);
  M.p.position.set(0,.3,.45);const gq=PB();pBox(gq,.26,.24,.12,shade(Cc,.8),0,0,0);pCyl(gq,.065,.065,.62,0x3c3e3a,0,0,.36,1.5708,0,0,8);pCyl(gq,.025,.03,.16,0x1a1a1a,0,0,.74,1.5708,0,0,6);pbMesh(gq,M.p);M.m.position.set(0,0,.84)};
 tur('0',-.45,-.45);tur('1',.45,-1.5);
 vhCrew32(g,side,'drv',.3,.75,.62,0);
 return{g,spec:{type:'car',name:'el autoblindado Grom',hp:800,armB:.1,armX:.8,vmax:8,turn:.55,acc:2.2,wb:3.2,hw:1.0,hd:2.7,h:3,cz:.15,zf:2.9,zb:-2.3,
  mounts:[{n:'0',kind:'mg',rng:120,yr:2,arc:9,cd:1.4,dmg:7},{n:'1',kind:'mg',rng:120,yr:2,arc:9,cd:1.5,dmg:7}]}}}
/* --- autoblindado veyrno de reconocimiento 6×4 --- */
function vhTplArmcarE32(side){const C=vhVC32[side],A=C.a,B=C.b,Cc=C.c,MT=C.m,DK=0x121214,D=vhDet32(),g=new T.Group(),q=PB(),W=[];
 for(const s of[-1,1])pBox(q,.14,.2,5.3,MT,s*.55,.66,0);
 /* casco anguloso: proa en cuña, flancos inclinados hacia adentro */
 pBox(q,1.82,.78,4.2,A,0,1.2,-.25);for(const s of[-1,1]){pBox(q,.1,.62,4.2,shade(A,.92),s*.82,1.85,-.25,0,0,-s*.32);pa(q,gBox(.1,.78,1.45),A,s*.68,1.2,2.4,0,-s*.5,0)}
 pBox(q,1.5,.1,4.2,shade(A,.9),0,2.14,-.25);pBox(q,1.2,.1,1.5,shade(A,.88),0,1.9,2.25,.35);pBox(q,.9,.7,.1,A,0,1.2,3.0);pBox(q,1.3,.1,1.0,A,0,1.65,2.6,.5);
 for(const s of[-1,1]){pBox(q,.3,.06,.04,DK,s*.3,1.88,2.95);pCyl(q,.12,.12,.2,MT,s*.55,1.4,2.95,1.5708,0,0,8);vhMark32(q,s*.95,1.35,.2,'x',.55,side)}
 pBox(q,1.7,.6,.1,shade(A,.9),0,1.3,-2.4,.2);/* rueda de repuesto lateral y bastidor de antena */
 if(D){for(const s of[-1,1])pBox(q,.04,.04,3.6,MT,s*.68,2.42,-.3);for(const z of[-2,-.3,1.4])for(const s of[-1,1])pBox(q,.04,.3,.04,MT,s*.68,2.28,z);pBox(q,.4,.4,.7,0x3e3e34,-.98,1.1,-1.6)}
 vhRiv32(q,-.92,1.55,-2.3,-.92,1.55,1.8,14,shade(A,.7));vhRiv32(q,.92,1.55,-2.3,.92,1.55,1.8,14,shade(A,.7));
 const sp=new T.Mesh(vhWDisc32(.45,.2,0x161614,B),VCV);sp.position.set(1.02,1.35,-1.1);sp.rotation.z=0;
 pbMesh(q,g,VCV);g.add(sp);
 const wd=vhWDisc32(.45,.2,0x161614,B);for(const s of[-1,1]){vhWheel32(g,wd,s*.95,.45,2.0,.45,W,true);vhWheel32(g,wd,s*.95,.45,-.95,.45,W);vhWheel32(g,wd,s*.95,.45,-1.95,.45,W)}
 const M=vhMount32(g,'0',0,2.18,-.4),tq=PB();pCyl(tq,.5,.64,.56,Cc,0,.28,0,0,0,0,8);pCyl(tq,.42,.5,.08,shade(Cc,.9),0,.6,0,0,0,0,8);pBox(tq,.3,.1,.3,shade(Cc,.8),0,.67,-.15);pBox(tq,.22,.04,.02,DK,0,.42,.6);vhMark32(tq,.0,.3,-.6,'z',.3,side);pbMesh(tq,M.y);
 M.p.position.set(0,.3,.55);const gq=PB();pBox(gq,.22,.22,.14,shade(Cc,.8),0,0,0);pCyl(gq,.055,.055,.6,0x2a2a2a,0,0,.35,1.5708,0,0,8);pCyl(gq,.022,.028,.16,0x1a1a1a,0,0,.72,1.5708,0,0,6);pbMesh(gq,M.p);M.m.position.set(0,0,.82);
 return{g,spec:{type:'car',name:'el autoblindado veyrno',hp:750,armB:.1,armX:.8,vmax:9,turn:.6,acc:2.4,wb:3.4,hw:1.0,hd:2.9,h:2.8,cz:0,zf:3.0,zb:-2.5,
  mounts:[{n:'0',kind:'mg',rng:130,yr:2,arc:9,cd:1.3,dmg:7}]}}}
/* --- camión con toldo de lona --- */
function vhTplTruck32(side){const C=vhVC32[side],A=C.a,MT=0x262622,D=vhDet32(),g=new T.Group(),q=PB(),W=[],WD=side==='volsk'?0x6a5236:0x4a4440,CV=side==='volsk'?0x8a866a:0x5c605a;
 for(const s of[-1,1])pBox(q,.14,.22,6.0,MT,s*.5,.82,-.2);pCyl(q,.07,.07,1.7,MT,0,.55,2.3,0,0,1.5708,6);pCyl(q,.12,.12,1.9,MT,0,.55,-1.6,0,0,1.5708,8);pBox(q,.36,.34,.34,0x30302a,0,.55,-1.6);
 pBox(q,1.0,1.1,.14,shade(A,.85),0,1.42,3.05);if(D)for(let i=0;i<8;i++)pBox(q,.03,.9,.04,0x1a1a16,-.4+i*.115,1.42,3.13);pCyl(q,.05,.05,.12,0x8a8a7a,0,2.04,3.0);
 pBox(q,.98,.8,1.4,A,0,1.42,2.3);pCyl(q,.49,.49,1.4,A,0,1.82,2.3,1.5708,0,0,10);for(const s of[-1,1]){if(D)for(let i=0;i<6;i++)pBox(q,.03,.32,.05,0x2a2a24,s*.5,1.42,1.9+i*.17);
  for(let i=0;i<4;i++){const a=-1.1+i*.7;pBox(q,.38,.05,.45,shade(A,.8),s*.86,.55+Math.cos(a)*.68,2.3+Math.sin(a)*.68,-a)}pBox(q,.4,.05,1.5,shade(A,.8),s*.9,.9,.85);pCyl(q,.13,.11,.22,0x22221e,s*.62,1.85,2.95,1.5708,0,0,8)}
 /* cabina abierta con techo de lona */pBox(q,1.8,.1,1.3,0x3a3a30,0,1.0,1.0);pBox(q,1.8,.9,.08,A,0,1.45,1.6);for(const s of[-1,1]){pBox(q,.07,1.4,.07,MT,s*.85,2.05,1.62);pBox(q,.07,1.65,.07,MT,s*.88,1.82,.4);pBox(q,.05,.5,.8,A,s*.9,1.3,1.0)}
 pBox(q,1.9,.06,1.5,CV,0,2.78,1.0,.03);pBox(q,1.6,.28,.55,0x3a2a1a,0,1.25,.85);pBox(q,1.6,.5,.1,0x3a2a1a,0,1.55,.58);pa(q,gTor(.18,.025,4,10),0x1a1410,.4,1.85,1.35,-.9,0,0);
 /* caja de carga y toldo */const BZ=-1.6,BL=3.9,BW=2.2,FY=1.02;pBox(q,BW,.12,BL,WD,0,FY,BZ);for(const s of[-1,1]){pBox(q,.06,.55,BL,WD,s*BW/2,FY+.32,BZ);if(D)for(let i=0;i<5;i++)pBox(q,.08,.6,.06,shade(WD,.7),s*(BW/2+.02),FY+.32,BZ-BL/2+.2+i*(BL-.4)/4)}
 pBox(q,BW,.55,.06,WD,0,FY+.32,BZ+BL/2);pBox(q,BW,.55,.06,WD,0,FY+.32,BZ-BL/2);
 pa(q,new T.CylinderGeometry(1.12,1.12,BL,10,1,true,1.5708,3.1416),CV,0,FY+.6,BZ,1.5708,0,0,1,1,1,.05);for(const s of[-1,1])pBox(q,.04,.6,BL,CV,s*1.1,FY+.3,BZ);
 for(let i=0;i<4;i++)pa(q,gTor(1.13,.03,4,12,3.1416),shade(CV,.75),0,FY+.6,BZ-BL/2+.2+i*(BL-.4)/3);pa(q,new T.CircleGeometry(1.1,10,0,3.1416),shade(CV,.85),0,FY+.6,BZ+BL/2-.02);
 pBox(q,2.0,.65,.04,0x141410,0,FY+.88,BZ-BL/2+.04);pBox(q,2.1,.5,.06,CV,0,FY+1.5,BZ-BL/2-.02,-.15);
 if(side==='volsk')for(const s of[-1,1])vhMark32(q,s*1.13,FY+.32,BZ,'x',.5,side);else for(const s of[-1,1])vhMark32(q,s*1.13,FY+.32,BZ,'x',.45,side);
 pCyl(q,.05,.05,2.0,0x1a1a18,.75,.7,-.3,1.5708,0,0,6);pbMesh(q,g,VCV);
 const wf=vhWSpoke32(.5,.16,10,0x141412,shade(A,.85),shade(A,.7));for(const s of[-1,1]){vhWheel32(g,wf,s*.88,.5,2.3,.5,W,true);vhWheel32(g,wf,s*.82,.5,-1.6,.5,W);vhWheel32(g,wf,s*1.0,.5,-1.6,.5,W)}
 vhCrew32(g,side,'drv',.4,.62,.85,0);
 return{g,spec:{type:'truck',name:'el camión',hp:380,armB:.5,armX:1.3,vmax:9.5,turn:.6,acc:2.2,wb:3.9,hw:1.15,hd:3.3,h:3,cz:-.2,zf:3.15,zb:-3.6,mounts:[],
  seats:[[-.6,FY+.1,-.6],[.6,FY+.1,-.6],[-.6,FY+.1,-1.6],[.6,FY+.1,-1.6],[-.6,FY+.1,-2.6],[.6,FY+.1,-2.6]]}}}
/* --- locomotora 2-6-0 con ténder --- */
function vhTplLoco32(){const g=new T.Group(),q=PB(),D=vhDet32(),BK=0x1e2022,BK2=0x2a2c2e,RD=0x7a2418,GN=0x34463a,BR=0xb08a3a,W=[];
 /* bastidor, viga de topes, quitapiedras */
 for(const s of[-1,1])pBox(q,.12,.4,9.6,BK,s*.62,1.1,.6);pBox(q,2.5,.36,.2,RD,0,1.12,5.4);for(const s of[-1,1]){pCyl(q,.16,.16,.36,0x222222,s*.8,1.12,5.68,1.5708,0,0,8);pCyl(q,.24,.24,.05,0x333333,s*.8,1.12,5.87,1.5708,0,0,10)}
 for(let i=0;i<7;i++)pBox(q,.08,.75,.08,BK2,-.75+i*.25,.62,5.75,-.6,0,(i-3)*.12);pBox(q,1.9,.08,.4,BK2,0,.3,5.95);
 pBox(q,2.6,.06,8.4,BK2,0,1.42,.9);/* estribos */
 /* caldera, caja de humos, chimenea, domos */
 pCyl(q,.8,.8,5.4,BK,0,2.3,2.0,1.5708,0,0,16);for(let i=0;i<5;i++)pa(q,gTor(.81,.025,4,D?16:10),BR,0,2.3,-.4+i*1.2);pCyl(q,.84,.84,.9,0x222426,0,2.3,5.0,1.5708,0,0,16);pCyl(q,.74,.74,.06,0x2a2c2e,0,2.3,5.46,1.5708,0,0,16);
 pBox(q,.06,.06,.3,BR,0,2.3,5.52);pCyl(q,.21,.18,1.0,BK,0,3.4,4.95,0,0,0,10);pCyl(q,.33,.22,.3,BK,0,3.98,4.95,0,0,0,12);
 pCyl(q,.3,.36,.45,BK,0,3.2,2.6,0,0,0,10);pa(q,gSph(.3,10,4,0,1.5708),BR,0,3.42,2.6);pCyl(q,.24,.3,.35,BK,0,3.15,1.3,0,0,0,10);pa(q,gSph(.24,8,4,0,1.5708),BK,0,3.32,1.3);
 pCyl(q,.05,.05,.3,BR,0,3.3,.3);pCyl(q,.04,.07,.25,BR,.2,3.25,.15);pCyl(q,.18,.16,.3,0x3a3a36,0,3.12,5.25,1.5708,0,0,8);pCyl(q,.12,.12,.02,0xfff0c0,0,3.12,5.41,1.5708,0,0,8);
 for(const s of[-1,1]){pBox(q,.03,.03,5,BR,s*.84,2.72,2.0);pCyl(q,.34,.34,1.2,BK2,s*1.0,1.25,4.2,1.5708,0,0,12);pBox(q,.4,.3,.6,BK2,s*.92,1.65,4.2);pBox(q,.08,.08,1.6,0x8a8a86,s*1.0,1.25,3.2)}
 /* cabina */pBox(q,2.5,1.9,1.9,GN,0,2.55,-.75);pBox(q,2.7,.1,2.3,BK,0,3.55,-.8);for(const s of[-1,1]){pBox(q,.04,.5,.55,0x14181c,s*1.26,2.95,-.55);pBox(q,.04,.9,.4,0x14181c,s*1.26,2.2,-1.45)}for(const s of[-1,1])pBox(q,.5,.4,.04,0x14181c,s*.75,2.95,.21);
 if(D)vhRiv32(q,-1.26,1.65,0,-1.26,1.65,-1.65,8,shade(GN,.6));pBox(q,.6,.3,.03,0xd8c890,1.27,1.95,-.8);
 /* ténder */pBox(q,2.3,.3,5.6,BK,0,1.05,-4.7);pBox(q,2.6,1.55,5.2,GN,0,2.0,-4.7);pBox(q,2.7,.08,5.3,shade(GN,.8),0,2.8,-4.7);
 for(let i=0;i<(D?7:4);i++)pa(q,gSph(.6+R()*.3,6,4),0x0e0e0e,(R()-.5)*1.4,2.85,-2.8-i*.55,0,R()*3,0,1.2,.5,1);pBox(q,2.5,.36,.2,RD,0,1.1,-7.4);for(const s of[-1,1])pCyl(q,.16,.16,.4,0x222222,s*.8,1.1,-7.6,1.5708,0,0,8);
 if(D)for(const s of[-1,1])vhRiv32(q,s*1.31,2.7,-2.2,s*1.31,2.7,-7.2,14,shade(GN,.6));
 pbMesh(q,g,VCV);
 const D2=vhDet32()>1,dw=vhWRail32(.72,RD,D2?14:10),lw=vhWRail32(.42,RD,D2?8:0),tw=vhWRail32(.45,0x2a2a2a,D2?8:0);for(const s of[-1,1]){for(const z of[3.0,1.5,0])vhWheel32(g,dw,s*.72,.72,z,.72,W);vhWheel32(g,lw,s*.72,.42,4.6,.42,W);for(const z of[-3.0,-4.6,-6.2])vhWheel32(g,tw,s*.72,.45,z,.45,W)}
 /* bielas de acoplamiento animadas */for(const s of[-1,1]){const r=new T.Mesh(gBox(.06,.12,3.3),VCV);r.position.set(s*.86,.72,1.5);r.name='rod'+(s>0?'R':'L');const rq=PB();pBox(rq,.07,.12,3.3,0x8a8a86,0,0,0);pBox(rq,.07,.1,2.4,0x9a9a96,0,.05,2.0);r.geometry=pbGeo(rq);g.add(r)}
 vhCrew32(g,'volsk','head',.8,2.95,-.9,1.5708);
 return{g,spec:{type:'loco',name:'la locomotora',hp:2200,armB:.05,armX:.5,hw:1.35,hd:6.8,h:4,cz:-1.0,zf:5.9,zb:-7.75,mounts:[]}}}
/* --- vagones: 'box' cerrado, 'flat' plataforma con sacos y cañón, 'tank' cisterna, 'troop' de tropa --- */
function vhTplWagon32(kind,side){const g=new T.Group(),q=PB(),D=vhDet32(),BK=0x222220,W=[],V=side==='volsk';let col=kind==='box'?0x6a3a28:kind==='troop'?(V?0x4e5a44:0x4a4e54):0x3a3a36;const spec={type:'wagon',name:kind==='tank'?'el vagón cisterna':'el vagón',hp:kind==='tank'?500:700,armB:.2,armX:.9,hw:1.4,hd:4.4,h:kind==='flat'?2.2:3.6,cz:0,zf:4.55,zb:-4.55,mounts:[]};
 for(const s of[-1,1])pBox(q,.14,.3,8.4,BK,s*.7,1.0,0);pBox(q,2.5,.3,.2,0x5a2018,0,1.0,4.2);pBox(q,2.5,.3,.2,0x5a2018,0,1.0,-4.2);for(const z of[-1,1])for(const s of[-1,1])pCyl(q,.14,.14,.36,0x222222,s*.8,1.0,z*4.38,1.5708,0,0,8);
 for(const z of[-2.4,2.4])for(const s of[-1,1]){pBox(q,.1,.4,.9,0x2a2a26,s*.82,.62,z);if(D)for(let i=0;i<3;i++)pBox(q,.11,.03,.9-i*.2,0x1a1a18,s*.82,.82-i*.04,z)}
 pBox(q,2.6,.1,8.4,kind==='flat'?0x5a4630:0x3a2a1c,0,1.2,0);
 if(kind==='box'||kind==='troop'){pBox(q,2.6,2.0,8.2,col,0,2.25,0);if(D)for(let i=0;i<14;i++)for(const s of[-1,1])pBox(q,.03,1.9,.04,shade(col,.7),s*1.31,2.25,-3.9+i*.6);
  pa(q,new T.CylinderGeometry(3.2,3.2,8.4,12,1,false,3.1416-.42,.84),shade(col,.6),0,.3,0,1.5708,0,0,1,1,1,.03);
  for(const s of[-1,1]){pBox(q,.05,1.8,1.5,shade(col,.9),s*1.33,2.2,kind==='troop'&&s>0?.9:0);pBox(q,.06,.06,3.4,0x2a2a26,s*1.34,3.15,.4)}
  if(kind==='troop'){pBox(q,.04,1.7,1.4,0x0e0c0a,1.31,2.15,0);for(const z of[-3,3])for(const s of[-1,1])pBox(q,.04,.35,.5,0x10100e,s*1.32,2.85,z);pCyl(q,.08,.08,.7,0x1a1a18,.6,3.65,-2.5,0,0,0,6);pCyl(q,.12,.12,.08,0x1a1a18,.6,4.0,-2.5,0,0,0,6);vhMark32(q,-1.34,2.3,-2,'x',.6,side);
   vhCrew32(g,side,'stand',1.0,1.25,.3,1.5708);vhCrew32(g,side,'sit',1.0,1.25,-.4,1.5708)}else{pBox(q,.4,.25,.04,0xd8d0b0,1.34,1.6,-2.8)}}
 else if(kind==='tank'){pCyl(q,1.1,1.1,7.4,0x1a1a1c,0,2.45,0,1.5708,0,0,16);for(const z of[-3.7,3.7])pa(q,gSph(1.1,14,6,0,1.5708),0x1a1a1c,0,2.45,z,z>0?1.5708:-1.5708,0,0,1,1,.3);
  for(let i=0;i<4;i++)pa(q,gTor(1.11,.03,4,16),0x2a2a2a,0,2.45,-2.7+i*1.8);pCyl(q,.5,.55,.5,0x1a1a1c,0,3.6,0,0,0,0,12);pCyl(q,.56,.56,.06,0x2a2a2a,0,3.86,0,0,0,0,12);
  for(const s of[-1,1]){pBox(q,.5,.05,8,0x4a3a26,s*1.15,1.35,0);if(D)for(let i=0;i<9;i++)pBox(q,.04,.7,.04,0x2a2a26,s*1.38,1.7,-4+i)}pBox(q,.04,.04,8,0x3a3a36,1.38,2.05,0);pBox(q,.04,.04,8,0x3a3a36,-1.38,2.05,0);pBox(q,1.5,.3,.03,0xd8d0b0,0,2.3,4.0)}
 else{/* plataforma: estacas, sacos terreros, munición */for(let i=0;i<5;i++)for(const s of[-1,1])pBox(q,.1,.6,.1,0x3a2a1a,s*1.25,1.5,-3.8+i*1.9);
  const SB=0x8a7a56;for(let i=0;i<(D?16:8);i++){const z=-3.6+i*(7.2/((D?16:8)-1));for(const s of[-1,1])pa(q,gCyl(.22,.22,.62,D?8:6),shade(SB,.9+R()*.2),s*1.05,1.42+(i%2)*.0,z,1.5708,R()*.2,0,1,1,1.1)}
  for(let i=0;i<(D?12:6);i++){const z=-3.4+i*(6.8/((D?12:6)-1));for(const s of[-1,1])pa(q,gCyl(.21,.21,.6,6),shade(SB,.85+R()*.2),s*1.05,1.82,z,1.5708,R()*.3,0)}
  pBox(q,.8,.4,.5,0x4a4a2e,-.5,1.45,-2.8);pBox(q,.8,.4,.5,0x4a4a2e,.4,1.45,-3.2);pbMesh(q,g,VCV);
  const M=vhMount32(g,'0',0,1.25,.6),tq=PB();pCyl(tq,.35,.45,.4,0x34383a,0,.2,0,0,0,0,10);pBox(tq,1.5,1.0,.06,V?vhVC32.volsk.a:vhVC32.veyrn.a,0,.85,.55,-.08);for(const s of[-1,1])pBox(tq,.06,.9,.6,V?vhVC32.volsk.a:vhVC32.veyrn.a,s*.76,.8,.25,0,s*.3,0);pBox(tq,.5,.5,.6,0x3a3e3a,0,.62,0);pbMesh(tq,M.y);
  M.p.position.set(0,.75,.2);const gq=PB();pBox(gq,.26,.26,.9,0x2e3230,0,0,-.1);pCyl(gq,.06,.075,2.0,0x2a2c2a,0,0,1.2,1.5708,0,0,10);pCyl(gq,.05,.05,1.0,0x5a5e60,0,.17,.6,1.5708,0,0,6);pbMesh(gq,M.p);M.m.position.set(0,0,2.2);
  vhCrew32(M.y,side,'kneel',-.5,-.2,-.7,0);vhCrew32(M.y,side,'stand',.6,-.2,-1.1,-.4);
  spec.mounts=[{n:'0',kind:'gun',cal:1.0,rng:240,yr:.5,arc:9,cd:8,dmg:85,r:5,vs:'both'}];spec.name='la plataforma artillada';
  const wr=vhWRail32(.45,0x2a2a2a,vhDet32()>1?8:0);for(const z of[-2.4,2.4])for(const s of[-1,1])vhWheel32(g,wr,s*.72,.45,z,.45,W);return{g,spec}}
 pbMesh(q,g,VCV);const wr=vhWRail32(.45,0x2a2a2a,vhDet32()>1?8:0);for(const z of[-2.4,2.4])for(const s of[-1,1])vhWheel32(g,wr,s*.72,.45,z,.45,W);return{g,spec}}
/* --- cañón de campaña de 76 mm con escudo y cuatro sirvientes --- */
function vhTplField32(side){const C=vhVC32[side],A=side==='volsk'?0x5a624c:0x50555a,WD=0x7a5a36,g=new T.Group(),D=vhDet32(),W=[];
 const M=vhMount32(g,'0',0,0,0),q=PB();
 pCyl(q,.06,.06,1.6,0x2a2a26,0,.64,0,0,0,1.5708,8);pBox(q,.3,.3,.9,shade(A,.85),0,.85,-.05);
 /* escudo con faldón y cresta plegable */pBox(q,1.6,1.05,.05,A,0,1.25,.3,-.1);pBox(q,1.3,.4,.05,A,0,.38,.33);pBox(q,1.2,.3,.05,shade(A,.9),0,1.9,.24,-.3);pBox(q,.12,.12,.06,0x101010,-.25,1.35,.31);
 if(D)vhRiv32(q,-.75,1.72,.24,.75,1.72,.24,10,shade(A,.6));
 /* mástil de cola con pala y espeque */pBox(q,.26,.2,2.6,shade(A,.9),0,.5,-1.45,-.2);pBox(q,.6,.4,.08,shade(A,.75),0,.15,-2.78,.3);pBox(q,.05,.05,.9,WD,0,.35,-2.95,-.4);
 for(const s of[-1,1])pBox(q,.3,.06,.24,0x3a2a1a,s*.45,.95,-.25);
 if(D){pBox(q,.7,.45,.5,0x4a4a2e,1.3,.22,-1.6);if(D>1)for(let i=0;i<5;i++)pCyl(q,.05,.05,.5,0xb08a3a,1.1+i*.1,.5,-1.6,1.5708,0,0,6)}
 vhMark32(q,.0,1.3,.34,'z',.3,side);pbMesh(q,M.y);
 const wg=vhWSpoke32(.64,.1,12,0x2a2a26,WD,WD);for(const s of[-1,1])vhWheel32(M.y,wg,s*.8,.64,0,.64,W);
 M.p.position.set(0,1.12,.05);const gq=PB();pCyl(gq,.055,.07,2.3,0x2c2e2c,0,0,.95,1.5708,0,0,10);pCyl(gq,.07,.07,.08,0x2c2e2c,0,0,2.1,1.5708,0,0,10);pCyl(gq,.08,.08,1.3,shade(A,.75),0,.15,.35,1.5708,0,0,8);pBox(gq,.2,.24,.4,0x2a2a28,0,-.02,-.35);pBox(gq,.06,.14,.16,0x222222,-.16,.12,0);pbMesh(gq,M.p);M.m.position.set(0,0,2.15);
 const cr=[];vhCrew32(M.y,side,'kneel',-.55,0,-.75,0,cr);vhCrew32(M.y,side,'kneel',.55,0,-.95,.2,cr);vhCrew32(M.y,side,'carry',1.05,0,-2.0,-.6,cr);vhCrew32(M.y,side,'bino',-1.5,0,-1.7,.3,cr);
 return{g,spec:{type:'gun',name:'el cañón de campaña',hp:520,armB:.15,armX:1,crewHp:260,hw:1.0,hd:1.6,h:1.6,cz:-.6,zf:2.3,zb:-3,
  mounts:[{n:'0',kind:'gun',cal:1.0,rng:300,yr:.3,arc:9,cd:7,dmg:80,r:5,vs:'both'}]}}}
/* --- cañón antitanque ligero de 37 mm --- */
function vhTplAT32(side){const A=side==='volsk'?0x5a624c:0x50555a,g=new T.Group(),D=vhDet32(),W=[],M=vhMount32(g,'0',0,0,0),q=PB();
 pCyl(q,.05,.05,1.1,0x2a2a26,0,.42,0,0,0,1.5708,8);pBox(q,.22,.22,.6,shade(A,.85),0,.6,0);pBox(q,1.1,.62,.04,A,0,.82,.25,-.12);pBox(q,.1,.08,.05,0x101010,.2,.9,.27);
 for(const s of[-1,1])pBox(q,.12,.12,1.9,shade(A,.9),s*.35,.3,-1.0,-.12,s*.22,0);for(const s of[-1,1])pBox(q,.3,.2,.05,shade(A,.75),s*.75,.1,-1.85);
 if(D)vhRiv32(q,-.5,1.1,.22,.5,1.1,.22,8,shade(A,.6));pbMesh(q,M.y);
 const wg=vhWSpoke32(.42,.09,10,0x1e1e1c,shade(A,.8),shade(A,.7));for(const s of[-1,1])vhWheel32(M.y,wg,s*.58,.42,0,.42,W);
 M.p.position.set(0,.72,.05);const gq=PB();pCyl(gq,.032,.045,1.7,0x2a2c2a,0,0,.7,1.5708,0,0,8);pCyl(gq,.05,.05,.08,0x2a2c2a,0,0,1.55,1.5708,0,0,8);pBox(gq,.16,.18,.4,0x2a2a28,0,0,-.25);pBox(gq,.05,.1,.12,0x222222,.12,.1,.05);pbMesh(gq,M.p);M.m.position.set(0,0,1.6);
 const cr=[];vhCrew32(M.y,side,'kneel',-.45,0,-.65,0,cr);vhCrew32(M.y,side,'kneel',.6,0,-.9,.3,cr);if(D)vhCrew32(M.y,side,'carry',.9,0,-1.8,-.4,cr);
 return{g,spec:{type:'gun',name:'el cañón antitanque',hp:380,armB:.15,armX:1,crewHp:180,hw:.8,hd:1.2,h:1.2,cz:-.5,zf:1.7,zb:-2,
  mounts:[{n:'0',kind:'at',cal:.55,rng:220,yr:.6,arc:9,cd:4,dmg:55,r:3,vs:'veh'}]}}}
/* --- mortero de trinchera de 81 mm --- */
function vhTplMortar32(side){const g=new T.Group(),D=vhDet32(),M=vhMount32(g,'0',0,0,0),q=PB();pBox(q,.6,.06,.6,0x3a3c38,0,.03,0);pBox(q,.4,.12,.4,0x2e302c,0,.1,0);
 pBox(q,.6,.36,.42,0x4a4a2e,.85,.18,-.5);if(D)for(let i=0;i<4;i++)pCyl(q,.04,.05,.36,0x5a5e4a,.7+i*.1,.45,-.5,0,0,0,6);pbMesh(q,M.y);
 M.p.position.set(0,.15,0);const gq=PB();pCyl(gq,.05,.05,1.3,0x2c2e2c,0,0,.65,1.5708,0,0,10);pCyl(gq,.065,.065,.06,0x2c2e2c,0,0,1.3,1.5708,0,0,10);pbMesh(gq,M.p);M.m.position.set(0,0,1.32);
 const bp=PB();for(const s of[-1,1])pBox(bp,.04,.04,1.0,0x2c2e2c,s*.22,.42,.55,.75,s*.25,0);pBox(bp,.5,.05,.05,0x2c2e2c,0,.75,.85);pbMesh(bp,M.y).name='bipod';
 const cr=[];vhCrew32(M.y,side,'kneel',-.45,0,-.25,.6,cr);vhCrew32(M.y,side,'kneel',.5,0,-.55,-.5,cr);
 return{g,spec:{type:'mortar',name:'el mortero',hp:220,armB:.3,armX:1,crewHp:140,hw:.6,hd:.6,h:1,cz:0,zf:1,zb:-1,
  mounts:[{n:'0',kind:'mortar',cal:.8,rng:320,min:35,yr:.8,arc:9,cd:6,dmg:75,r:6,vs:'inf'}]}}}
/* --- buques: destructor, transporte, monitor --- */
function vhTplShip32(kind){const V=vhVC32.veyrn,HC=kind==='transport'?0x3e4246:0x4c5258,ST=shade(HC,.75),DS=0x2e3236,DK=0x6a5e4a,RED=0x6a1a16,D=vhDet32(),g=new T.Group(),q=PB(),ms=[];
 const P_={destroyer:{len:68,beam:7.2,free:3,draft:3.2,sheer:1.4,bowFine:.75,sternW:.7,fcZ:14,fcH:1.1,n:D?28:18},transport:{len:96,beam:13,free:6,draft:6,sheer:1.6,bowFine:.45,sternW:.8,fcZ:36,fcH:1.6,n:D?28:18},monitor:{len:58,beam:15,free:1.6,draft:3,sheer:.4,bowFine:.55,sternW:.85,fcZ:null,fcH:0,n:D?24:16}}[kind];
 const d=nvDef15(Object.assign({color:HC,deck:DK,below:RED},P_));g.add(mkHull15(d));const Y=z=>hY15(d,z);
 const gun=(n,x,z,s,arc,base)=>{const r=nvNavGun15(g,x,Y(z),z,HC,s);r.yaw.name='tur'+n;r.pitch.name='gun'+n;r.muzzles[0].name='muz'+n;if(base)r.yaw.rotation.y=base;ms.push({n,kind:'naval',cal:2,rng:1400,yr:.25,arc:arc||2.4,base:base||0,cd:9,dmg:140,r:12,vs:'both'})};
 if(kind==='destroyer'){pBox(q,4.2,2.2,6,ST,0,Y(9)+1.1,9);pBox(q,5,1.4,3,HC,0,Y(10)+2.9,10.5);pBox(q,5.2,.15,3.4,DS,0,Y(10)+3.65,10.5);for(let i=0;i<5;i++)pBox(q,.6,.4,.04,0x101418,-2+i,Y(10)+3.0,12.02);
  for(let i=0;i<4;i++){const z=4-i*7;pCyl(q,.9,1.0,6.5,ST,0,Y(z)+3.2,z,0,0,0,12);pCyl(q,.95,.95,.4,0x161616,0,Y(z)+6.4,z,0,0,0,12);pa(q,gTor(.98,.06,4,12),0x8a1a16,0,Y(z)+5.6,z,1.5708,0,0)}
  pCyl(q,.14,.18,16,DS,0,Y(11)+9,11.5,0,0,0,6);pBox(q,.1,.1,4,DS,0,Y(11)+13,11.5,0,0,1.5708);pCyl(q,.1,.14,10,DS,0,Y(-22)+5,-22,0,0,0,6);
  for(const z of[-12,-17])pCyl(q,.35,.35,4.2,DS,0,Y(z)+.8,z,1.5708,0,0,10);pBox(q,2,1.2,3,ST,0,Y(-26)+.6,-26);
  if(D)nvRail15(q,d,-33,13,2,ST,.1,.9);gun('0',0,22,1.3);gun('1',0,-29,1.3,2.4,3.1416);gun('2',2.2,-8,1,1.4,1.5708)}
 else if(kind==='transport'){pBox(q,11,6,14,0xd8d2c0,0,Y(0)+3,0);pBox(q,12,.2,15,DS,0,Y(0)+6.1,0);pBox(q,9,3,7,0xd8d2c0,0,Y(2)+7.5,2);pBox(q,10,.2,8,DS,0,Y(2)+9.1,2);for(let i=0;i<7;i++)pBox(q,.9,.5,.05,0x101418,-3.5+i*1.2,Y(2)+8.2,5.53);
  pCyl(q,1.8,2.0,9,0x2a2a2a,0,Y(-3)+11,-3,0,0,0,14);pa(q,gTor(1.85,.12,4,14),0xb8a050,0,Y(-3)+13.5,-3,1.5708,0,0);
  for(const z of[28,16,-18,-30]){pBox(q,6,.8,6,0x4a3a28,0,Y(z)+.4,z);pBox(q,6.4,.15,6.4,0x2a2a26,0,Y(z)+.85,z)}
  for(const z of[22,-24]){pCyl(q,.3,.4,20,DS,0,Y(z)+10,z,0,0,0,8);for(const s of[-1,1])pCyl(q,.12,.15,12,DS,s*1.2,Y(z)+5,z+(z>0?5:-5),z>0?.55:-.55,0,s*.1,6);pBox(q,.15,.15,8,DS,0,Y(z)+14,z,0,0,1.5708)}
  if(D)for(let i=0;i<4;i++)for(const s of[-1,1])pa(q,gCyl(.6,.6,4,8),0xd8d2c0,s*5.2,Y(-8)+5.4,-6-i*3.2,1.5708,0,0,1,.6,1);
  gun('0',0,-44,1.1,2,3.1416)}
 else{/* monitor: bulges, gran torre doble, mástil trípode */for(const s of[-1,1])pa(q,gCyl(2.2,2.2,36,10),0x3e4448,s*6.6,.3,-2,1.5708,0,0,1,1,.6);
  pBox(q,6,3,8,ST,0,Y(-2)+1.5,-2);pBox(q,7,.2,9,DS,0,Y(-2)+3.1,-2);pBox(q,4,2.2,4,HC,0,Y(0)+4.2,0);pCyl(q,1.6,1.8,7,ST,0,Y(-6)+6,-6,0,0,0,12);
  for(const[x,z] of[[0,3],[-2.5,-2],[2.5,-2]])pCyl(q,.25,.35,22,DS,x*.5,Y(0)+12,z*.5+.6,(z-1)*.04,0,x*.04,6);pBox(q,3,1.6,3,ST,0,Y(0)+22,1.2);pBox(q,3.4,.15,3.4,DS,0,Y(0)+22.9,1.2);
  const t=nvTurret15(g,0,Y(14),14,{w:7,h:3.2,l:8,col:HC,zf:4.5,th:1.8,tz:2.5,n:2,sp:2,len:11,r:.36,b0:1});t.yaw.name='tur0';t.pitch.name='gun0';t.muzzles[0].name='muz0';ms.push({n:'0',kind:'naval',cal:3,rng:2200,yr:.12,arc:2.2,cd:16,dmg:200,r:16,vs:'both'});
  gun('1',3.5,-14,1,1.6,1.5708);gun('2',-3.5,-14,1,1.6,-1.5708)}
 pbMesh(q,g,VCV);return{g,spec:{type:'ship',name:{destroyer:'el destructor veyrno',transport:'el transporte veyrno',monitor:'el monitor veyrno'}[kind],hp:{destroyer:6000,transport:9000,monitor:14000}[kind],armB:0,armX:.3,vmax:{destroyer:9,transport:5,monitor:4}[kind],turn:.06,acc:.4,hw:P_.beam/2,hd:P_.len/2,h:P_.free+4,cz:0,zf:P_.len/2,zb:-P_.len/2,mounts:ms,
  stacks:kind==='destroyer'?[[0,Y(4)+6.6,4],[0,Y(-3)+6.6,-3],[0,Y(-10)+6.6,-10],[0,Y(-17)+6.6,-17]]:kind==='transport'?[[0,Y(-3)+15.6,-3]]:[[0,Y(-6)+9.6,-6]]}}}
/* =====================================================================
   INSTANCIAS Y API
   ===================================================================== */
function vhInst32(key,side,fn,arg){const k=key+'|'+side+'|'+(arg||'')+'|'+vhDet32();let t=VEH32.tpl[k];if(!t){t=VEH32.tpl[k]=fn(arg!==undefined?arg:side,side);t.g.updateMatrixWorld(true);let n=0;t.g.traverse(o=>{if(o.isMesh&&o.geometry.attributes.position)n+=o.geometry.attributes.position.count});t.verts=n}
 const S=t.spec,g=t.g.clone(true);const v={g,kind:key,variant:arg||null,side,ally:side==='volsk',type:S.type,name:S.name,hp:S.hp,maxhp:S.hp,alive:true,on:false,spec:S,verts:t.verts,
  mounts:[],wh:[],whr:[],steer:[],trk:[],crew:[],rods:[],v:0,st:0,steerA:0,yr:0,path:null,pi:0,hold:false,fire:true,halt:false,crewHp:S.crewHp||0,crewMax:S.crewHp||0,t:R()*9,smT:0,snT:0,kick:0,ws:0,ob:null,hit:null,fires:[],seats:S.seats||null};
 g.traverse(o=>{const n=o.name;if(!n)return;if(o.isMesh&&n[0]==='w'&&n.length>1&&!isNaN(+n.slice(1))){v.wh.push(o);v.whr.push(+n.slice(1))}else if(n==='steer')v.steer.push(o);else if(n==='trk'){o.material=o.material.clone();if(o.material.map){o.material.map=o.material.map.clone();o.material.map.needsUpdate=true;o.material.map.repeat.set(8,1)}v.trk.push(o)}else if(n==='crew')v.crew.push(o);else if(n==='rodL'||n==='rodR')v.rods.push(o)});
 for(const M of S.mounts){const y=g.getObjectByName('tur'+M.n),p=g.getObjectByName('gun'+M.n),m=g.getObjectByName('muz'+M.n);if(!y||!m)continue;const o=Object.assign({},M,{y,p:p||y,m,cd0:M.cd,cd:2+R()*M.cd,base:M.base||y.rotation.y||0,yaw:0,pit:0,tgt:null,tk:'',tt:R()*.5,burst:0,bt:0,tele:0,rec:0,p0z:(p||y).position.z,brk:14,tl:null,gl:null});
  if(M.kind!=='mg'&&M.kind!=='mortar'){o.gl=new T.Sprite(vhGLINT32);o.gl.scale.setScalar(.01);o.gl.visible=false;m.add(o.gl)}v.mounts.push(o)}
 return v}
function armcar32(side){const s=vhSide32(side);return vhInst32('armcar',s,s==='volsk'?vhTplArmcarV32:vhTplArmcarE32)}
function tank32(side,variant){const s=vhSide32(side),k=variant||(s==='volsk'?'light':'medium');return vhInst32('tank_'+k,s,k==='light'?vhTplLight32:vhTplMedium32)}
function truck32(side){return vhInst32('truck',vhSide32(side),vhTplTruck32)}
function loco32(){return vhInst32('loco','volsk',vhTplLoco32)}
function wagon32(kind,side){kind=kind||'box';const s=vhSide32(side===undefined?'volsk':side),v=vhInst32('wagon',s,(k,sd)=>vhTplWagon32(k,sd),kind);v.kind='wagon_'+kind;if(kind==='flat'&&side===undefined)v.fire=false;return v}
function fieldgun32(side){return vhInst32('fieldgun',vhSide32(side),vhTplField32)}
function atgun32(side){return vhInst32('atgun',vhSide32(side),vhTplAT32)}
function mortar32(side){return vhInst32('mortar',vhSide32(side===undefined?'veyrn':side),vhTplMortar32)}
function ship32(kind,side){kind=kind||'destroyer';const v=vhInst32('ship',vhSide32(side===undefined?'veyrn':side),k=>vhTplShip32(k),kind);v.kind='ship_'+kind;return v}
/* ---------- colocación ---------- */
function vehSpawn32(v,x,z,rot){const S=v.spec,g=v.g;g.position.set(VEH32.X+x,v.type==='ship'?VEH32.seaY:vhFlo32(VEH32.X+x,z),z);g.rotation.order='YXZ';g.rotation.y=rot||0;if(!g.parent)scene.add(g);v.on=true;if(!VEH32.list.includes(v))VEH32.list.push(v);
 if(v.type!=='ship'&&!v.ob){v.ob={x:0,z:0,hw:1,hd:1,h:S.h*.85,nolos:true,veh32:v};obstB.push(v.ob);vhObUpd32(v)}
 if(!v.hit&&typeof HIT9!=='undefined'){v.hit={foe:!v.ally,x:()=>v.g.position.x,z:()=>v.g.position.z,y0:0,y1:S.h,r:Math.min(S.hw,S.hd)+.35+(v.type==='ship'?S.hd*.5:0),ok:()=>v.on&&(v.alive||v.crewHp>0&&v.type!=='ship')&&!v.ally,dmg:(d,k)=>vhVehDmg32(v,d,k,P.g.position.x,P.g.position.z)};HIT9.push(v.hit)}
 return v}
function vhObUpd32(v){const o=v.ob;if(!o)return;const S=v.spec,a=v.g.rotation.y,c=Math.abs(Math.cos(a)),s=Math.abs(Math.sin(a));o.x=v.g.position.x+Math.sin(a)*S.cz;o.z=v.g.position.z+Math.cos(a)*S.cz;o.hw=c*S.hw+s*S.hd;o.hd=s*S.hw+c*S.hd}
function vehPath32(v,pts,opts){opts=opts||{};v.path=pts.map(p=>[VEH32.X+p[0],p[1]]);v.pi=0;v.loop=!!opts.loop;{const C=vhC32(v);v.vmax=C&&C.speed>0?(opts.speed?Math.min(opts.speed,C.road||C.speed):C.speed):(opts.speed||v.spec.vmax||5)}if(v.ai){v.ai.sT=0;v.ai.gb=false;v.ai.stk.length=0;v.ai.anc=null;if(opts.loop&&v.ai.mode==='advance')v.ai.mode='patrol'}v.onEnd=opts.onEnd||null;v.halt=!!opts.halt;v.arrived=false;v.hold=false;return v}
/* ---------- objetivos ---------- */
function vhAllies32(){if(VEH32.allies)return VEH32.allies()||[];return(typeof L13!=='undefined'&&L13.sq)||[]}
const vhDIF32=()=>({easy:.7,normal:1,hard:1.25}[difficulty]||1);
function vhTOk32(m){const t=m.tgt;if(!t)return false;switch(m.tk){case'P':return playing&&P.hp>0;case'A':return t.g&&t.g.visible&&!t.down29;case'E':return t.hp>0&&t.g.parent;case'V':return t.alive&&t.on}return false}
function vhTPos32(m,o){const t=m.tgt;if(m.tk==='P'){o.copy(P.g.position);o.y+=P.cr?.8:1.15}else if(m.tk==='V'){o.copy(t.g.position);o.y+=t.spec.h*.42}else{o.copy(t.g.position);o.y+=1.1}return o}
function vhPick32(v,m){const o=m.y.getWorldPosition(vh_va32),gy=v.g.rotation.y;let best=null,bk='',bs=1e9,los=0;const rng=m.rng*(v.rngK||1);
 const consider=(t,k,x,y,z,bias,needLos)=>{const d=Math.hypot(x-o.x,z-o.z);if(d>rng||(m.min&&d<m.min))return;const s=d+bias;if(s>=bs)return;if(m.arc<3){const rel=vhAD32(0,Math.atan2(x-o.x,z-o.z)-gy-m.base);if(Math.abs(rel)>m.arc+.15)return}
  if(needLos){if(los>5)return;los++;if(!losClear(o.x,o.y+.3,o.z,x,y,z)||vhSmokeBlk32(o.x,o.z,x,z))return}bs=s;best=t;bk=k};
 const lo=m.kind!=='mortar',mg=m.kind==='mg';
 if(v.ally){for(const e of enemies){if(e.hp<=0)continue;const p=e.g.position;consider(e,'E',p.x,1.2,p.z,m.vs==='veh'?60:0,lo)}}
 else{if(playing&&P.hp>0){const p=P.g.position;consider(P,'P',p.x,p.y+1.1,p.z,-12,lo)}const A=vhAllies32();for(const n of A){if(!n.g||!n.g.visible||n.down29)continue;const p=n.g.position;consider(n,'A',p.x,1.2,p.z,m.vs==='veh'?60:4,lo)}}
 for(const w of VEH32.list){if(!w.alive||!w.on||w.ally===v.ally||w===v)continue;const hv=w.type==='tank'||w.type==='loco'||w.type==='ship'||w.type==='car';if(mg&&hv&&w.type!=='car')continue;if(m.vs==='inf'&&hv)continue;if(w.type==='ship'&&m.kind!=='naval')continue;const p=w.g.position;consider(w,'V',p.x,p.y+w.spec.h*.42,p.z,m.vs==='veh'||m.kind==='gun'?-25:(mg&&w.type==='car'?10:0),lo)}
 if(best!==m.tgt){m.brk=m.kind==='mortar'?16:0;m.tele=0}m.tgt=best;m.tk=bk}
/* ---------- proyectiles (reserva fija, sin asignaciones por cuadro) ---------- */
const vhSH32=[];let vhShI32=0;const vhSHG32=new T.SphereGeometry(.14,6,4),SHM32=new T.MeshBasicMaterial({color:0x1a1a18});
for(let i=0;i<40;i++)vhSH32.push({on:false,t:0,T:1,a:new T.Vector3(),b:new T.Vector3(),h:0,k:1,side:'veyrn',dmg:0,r:0,tv:null,src:null,kind:'',wh:false,m:null,vis:false,by:null});
function vhShot32(kind,ax,ay,az,bx,by,bz,T_,h,k,side,dmg,r,tv,src,vis,wait){const s=vhSH32[vhShI32];vhShI32=(vhShI32+1)%vhSH32.length;s.on=true;s.kind=kind;s.a.set(ax,ay,az);s.b.set(bx,by,bz);s.T=T_;s.t=-(wait||0);s.h=h;s.k=k;s.side=side;s.dmg=dmg;s.r=r;s.tv=tv;s.src=src;s.wh=false;s.vis=vis;s.by=src?{name:src.name}:null;
 if(vis){if(!s.m){s.m=new T.Mesh(vhSHG32,SHM32);s.m.scale.set(1,1,2.2)}if(!s.m.parent)scene.add(s.m);s.m.visible=false}else if(s.m)s.m.visible=false;return s}
function vhCamVol32(x,z,R_){return vhCL32(1-Math.hypot(x-cam.position.x,z-cam.position.z)/R_,0,1)}
function vhShUpd32(dt){for(const s of vhSH32){if(!s.on)continue;s.t+=dt;if(s.t<0)continue;
  if(!s.wh&&(s.kind==='mortar'||s.kind==='naval')&&s.T-s.t<(s.kind==='naval'?1.9:1.4)){s.wh=true;const v=vhCamVol32(s.b.x,s.b.z,s.kind==='naval'?320:170);if(v>.02){tn18('sine',s.kind==='naval'?1300:1700,s.kind==='naval'?240:380,s.kind==='naval'?1.8:1.3,.06*v);nz18(.4,s.kind==='naval'?1.8:1.2,'bandpass',2600,600,.03*v)}}
  const u=Math.min(1,s.t/s.T);if(s.vis&&s.m){s.m.visible=true;const x=s.a.x+(s.b.x-s.a.x)*u,y=s.a.y+(s.b.y-s.a.y)*u+Math.sin(u*Math.PI)*s.h,z=s.a.z+(s.b.z-s.a.z)*u;vh_ve32.set(x,y,z);s.m.lookAt(vh_ve32);s.m.position.copy(vh_ve32);if(s.kind==='mortar'&&R()<dt*12)smoke(x,y,z,.4,.6,0xb0b0aa,0,.3)}
  if(u>=1){s.on=false;if(s.m)s.m.visible=false;vhImpact32(s.b.x,s.b.y,s.b.z,s.k,s.side,s.dmg,s.r,s.tv,s.src,s.kind,s.by)}}}
/* ---------- impactos ---------- */
function vhIsWater32(x,z){return typeof VEH32.water==='function'&&VEH32.water(x-VEH32.X,z)}
function vhImpact32(x,y,z,k,side,dmg,r,tv,src,kind,by){const wet=vhIsWater32(x,z),dp=Math.hypot(P.g.position.x-x,P.g.position.z-z);y=Math.max(y,0);
 if(wet){burst(x,y+.5,z,0xd8e0e4,Math.round(14*k),1.4,8*k);smoke(x,y+2*k,z,5*k,3.5,0xe4e8ea,2.5*k,.6);smoke(x,y+5*k,z,3*k,2.5,0xf0f2f2,4*k,.5);expSnd(x,z,k*.7)}
 else if(k<.7){burst(x,y+.3,z,0xffa040,8,.35,6);burst(x,y+.3,z,0x5a4a38,10,.8,5);smoke(x,y+1,z,2.6,2.4,0x5a5248,.8,.5);flashLight(x,y+1.5,z,2.2,.2,0xffb060);npcShot('big',x,z);if(typeof decalAt30==='function')decalAt30('scorch',x,z,1.4)}
 else if(k<1.5){if(typeof FB12!=='undefined'&&FB12.length)fb12(x,y+1.2,z,5*k,.5,1.5);burst(x,y+.4,z,0xff8a30,12,.5,8*k);burst(x,y+.4,z,0x4a3c2c,18,1.2,9*k);smoke(x,y+1.5,z,5*k,4,0x4a443c,1.2,.6);smoke(x,y+3,z,3.5*k,3,0x6a5e4e,2.5,.5);flashLight(x,y+2,z,4*k,.3,0xffb060);expSnd(x,z,k*.9);
  if(typeof decalAt30==='function')decalAt30('crater',x,z,1.7*k);else if(typeof crater9==='function')crater9(x,z,1.2*k)}
 else{if(typeof bx12==='function'&&typeof FB12!=='undefined'&&FB12.length)bx12(x,y,z,k*.5);else{burst(x,y+1,z,0xff8a30,30,.8,14);flashLight(x,y+4,z,8,.5,0xffb060)}burst(x,y+.5,z,0x4a3a2a,30,2,16*k*.6);smoke(x,y+6,z,10*k,7,0x4a443e,3,.7);smoke(x,y+2,z,7*k,5,0x6a5e4e,1.5,.6);expSnd(x,z,2);
  if(typeof decalAt30==='function')decalAt30('crater',x,z,2.6*k);else if(typeof crater9==='function')crater9(x,z,2*k)}
 if(typeof shake!=='undefined')shake=Math.max(shake,vhCL32((k>1.5?1.6:1)-dp/(k>1.5?90:45),0,1.2));
 /* daño */const all=side==='all';
 if(tv&&tv.alive)vhVehDmg32(tv,600*k,'ap',src?src.g.position.x:x,src?src.g.position.z:z);
 for(const w of VEH32.list){if(!w.on||w===tv||(!all&&w.ally===(side==='volsk')))continue;if(!w.alive&&w.crewHp<=0)continue;const dd=Math.hypot(w.g.position.x-x,w.g.position.z-z)-Math.min(w.spec.hw,w.spec.hd);if(dd<r)vhVehDmg32(w,180*k*(1-Math.max(0,dd)/r),'x',x,z)}
 if(all||side!=='volsk'){if(dp<r&&P.g.position.y<y+4){const c=losClear(x,y+.6,z,P.g.position.x,P.g.position.y+1,P.g.position.z)?1:.4;hitP(dmg*(1-dp/r*.7)*c*(P.pr?.6:1))}
  for(const n of vhAllies32()){if(!n.g||!n.g.visible||n.down29)continue;const d=Math.hypot(n.g.position.x-x,n.g.position.z-z);if(d<r)vhAllyHit32(n,dmg*(1-d/r*.7))}}
 if(all||side==='volsk'){for(let i=enemies.length-1;i>=0;i--){const e=enemies[i];if(!e||e.hp<=0)continue;const d=Math.hypot(e.g.position.x-x,e.g.position.z-z);if(d<r*1.15){hurt(e,dmg*1.7*(1-d/(r*1.15)*.6),'m',by||{name:'La artillería'});if(e.hp<=0&&src)VEH32.dbg.killsE++}}}
 if(typeof sbHit==='function'&&k>=.7)try{sbHit(x,z,1.6*k)}catch(e){}}
function vhAllyHit32(n,d){if(VEH32.onAllyHit){const r=VEH32.onAllyHit(n,d);if(n.down17||n.down29||n.dead17)VEH32.dbg.killsA++;return r}n.hp=(n.hp===undefined?100:n.hp)-d;if(n.hp<=0){if(VEH32.allyDown&&typeof down29==='function')down29(n);else n.hp=25}}
/* ---------- daño a vehículos ---------- */
function vhVehDmg32(v,d,kind,sx,sz){if(!v.on)return;const S=v.spec,p=v.g.position;let k=1;
 if(v.alive&&sx!==undefined&&isFinite(sx)){const at=kind==='ap'||kind==='at'||kind==='g'||(kind==='x'&&d>=150);if(!v.thr||at||!v.thr.at||time-v.thr.t>3)v.thr={x:sx,z:sz,t:time,at,d,k:kind}}
 if(sx!==undefined&&(kind==='g'||kind==='ap'||kind==='x')&&v.type!=='gun'&&v.type!=='mortar'){const ang=Math.abs(vhAD32(v.g.rotation.y,Math.atan2(sx-p.x,sz-p.z)));if(ang<.7)k=.6;else if(ang>2.3)k=1.5}
 if(kind==='b'){if(v.crewHp>0){v.crewHp-=d*.55;vhCrewCheck32(v)}d*=S.armB;if(S.armB<.2&&R()<.5)burst(p.x+(R()-.5)*S.hw,1+R()*S.h*.5,p.z+(R()-.5)*S.hd,0xffe0a0,3,.15,4)}
 else if(kind==='x'||kind==='m'){if(v.crewHp>0){v.crewHp-=d*.9;vhCrewCheck32(v)}d*=(v.type==='tank'&&d>=450)?.9:S.armX*k}
 else{if(v.crewHp>0){v.crewHp-=d*.6;vhCrewCheck32(v)}d*=k}
 if(!v.alive)return;v.hp-=d;v.lastK=kind;if(v.hp<=0)vhVehKill32(v,'boom')}
function vhCrewCheck32(v){const n=v.crew.length;if(!n)return;const alive=Math.max(0,Math.ceil(v.crewHp/v.crewMax*n));let i=0;for(const c of v.crew){if(c.visible&&i>=alive){c.visible=false;const w=c.getWorldPosition(vh_vd32);burst(w.x,1,w.z,0x8a1a10,6,.4,3)}if(c.visible)i++}
 if(v.crewHp<=0&&v.alive&&(v.type==='gun'||v.type==='mortar'))vhVehKill32(v,'crew')}
const vhSC32={tank:1500,car:800,truck:400,gun:600,mortar:300,loco:1000,wagon:300,ship:3000};
function vhVehKill32(v,how){if(!v.alive)return;VEH32.dbg.vk++;if(v.ai){v.ai.st='destroyed';v.ai.tx=null}v.alive=false;v.hp=0;v.v=0;v.how=how;const S=v.spec,p=v.g.position,x=p.x,z=p.z;for(const m of v.mounts){m.burst=0;m.tele=0;if(m.gl)m.gl.visible=false}
 if(how==='crew'){for(const c of v.crew)c.visible=false;feed('★ '+v.name.replace(/^el |^la /,'').replace(/^./,c=>c.toUpperCase())+' silenciado')}
 else{const k={tank:1.3,car:1,truck:.9,loco:1.5,wagon:v.kind==='wagon_tank'?2:1,gun:.8,mortar:.6,ship:3}[v.type]||1;
  if(typeof bx12==='function'&&typeof FB12!=='undefined'&&FB12.length)bx12(x,p.y+1,z,k*.45,v.kind==='wagon_tank'?'fuel':undefined);burst(x,p.y+1.5,z,0xffa040,24,.9,12*k);burst(x,p.y+1,z,0x2a2420,20,1.6,9*k);smoke(x,p.y+3,z,8*k,6,0x1e1c1a,2.5,.7);flashLight(x,p.y+3,z,7*k,.5,0xffa050);expSnd(x,z,1.6*k);
  if(typeof shake!=='undefined')shake=Math.max(shake,vhCL32(1.4-Math.hypot(P.g.position.x-x,P.g.position.z-z)/50,0,1.3));
  const dp=Math.hypot(P.g.position.x-x,P.g.position.z-z);if(dp<S.hd+4&&v.type!=='ship')hitP(30*(1-dp/(S.hd+4)));for(let i=enemies.length-1;i>=0;i--){const e=enemies[i];if(e&&e.hp>0&&Math.hypot(e.g.position.x-x,e.g.position.z-z)<S.hd+3)hurt(e,200,'m',{name:'La explosión'})}
  v.g.traverse(o=>{if(!o.isMesh)return;if(o.name==='crew'||o.isSprite){o.visible=false;return}if(o.name==='trk'){o.material.color.setHex(0x3a3634);return}if(o.material&&o.material.vertexColors)o.material=vhBURNT32});
  if(v.type==='tank'&&v.mounts[0]){const t=v.mounts[0].y;t.position.y+=.3;t.rotation.z=.32;t.rotation.x=.12;v.mounts[0].p.rotation.x=.25}
  if(v.type==='car'||v.type==='truck'){v.g.rotation.z=.05}
  if(typeof mkFire==='function'&&v.type!=='ship'){v.fires.push(mkFire(x,z,v.type==='tank'||v.type==='loco'?1.3:1,p.y+S.h*.45))}
  v.ws=v.type==='ship'?240:120;feed('★ '+v.name.replace(/^el |^la /,'').replace(/^./,c=>c.toUpperCase())+' destruido')}
 if(!v.ally&&typeof score!=='undefined')score+=vhSC32[v.type]||300;
 if(v.ob){v.ob.nolos=false;v.ob.h=S.h*.75}if(v.type!=='ship'&&typeof covers!=='undefined')covers.push({x,z,r:Math.min(S.hw,S.hd)+.6});
 try{VEH32.onKill(v)}catch(e){console.warn(e)}}
/* ---------- disparo ---------- */
function vhFireMG32(v,m){VEH32.dbg.shots++;const o=m.m.getWorldPosition(vh_va32),t=vhTPos32(m,vh_vb32),d=o.distanceTo(t);t.x+=(R()-.5)*(.6+d*.02);t.y+=(R()-.5)*.6;t.z+=(R()-.5)*(.6+d*.02);
 trc16(o,t,v.ally?0xffe0a0:0xffc070);if(R()<.5)burst(o.x,o.y,o.z,0xffd080,2,.08,2);if(m.burst%2)npcShot('mg',o.x,o.z);
 let acc=vhCL32(.42-d/320,.07,.38)*(Math.abs(v.v)>1?.7:1);if(m.tk==='P'){acc*=vhDIF32()*(P.cr?.7:1)}if(R()>acc){if(R()<.3)burst(t.x,.1,t.z,0x8a7a62,2,.3,2);return}
 const tg=m.tgt;if(m.tk==='P'){VEH32.dbg.hitsP++;hitP(m.dmg)}else if(m.tk==='A'){VEH32.dbg.hitsA++;vhAllyHit32(tg,m.dmg*1.2)}else if(m.tk==='E'){hurt(tg,22,'b',{name:v.name.replace(/^./,c=>c.toUpperCase())});if(tg.hp<=0)VEH32.dbg.killsE++}else if(m.tk==='V')vhVehDmg32(tg,22,'b')}
function vhFireGun32(v,m){VEH32.dbg.shots++;const o=m.m.getWorldPosition(vh_va32),t=vhTPos32(m,vh_vb32),d=o.distanceTo(t),cal=m.cal,mov=Math.abs(v.v)>.6?1.5:1;let tv=null;
 if(m.tk==='V'){if(R()<vhCL32(.7-d/500,.25,.7)/mov*(m.tgt.smkT>time?.35:1)){tv=m.tgt}else{const a=R()*6.28,e=3+R()*4;t.x+=Math.cos(a)*e;t.z+=Math.sin(a)*e;t.y=vhFlo32(t.x,t.z)}}
 else{const err=(m.kind==='naval'?14:1.4)+d*.02*mov*(m.tk==='P'?vhDIF32():1),a=R()*6.28,e=err*Math.sqrt(R());t.x+=Math.cos(a)*e;t.z+=Math.sin(a)*e;t.y=vhFlo32(t.x,t.z)}
 trc16(o,t,0xffd090);if(typeof FB12!=='undefined'&&FB12.length)fb12(o.x,o.y,o.z,2.2*cal,.16,0);burst(o.x,o.y,o.z,0xffc060,8,.2,6*cal);smoke(o.x,o.y,o.z,2.4*cal,2.4,0xa8a49c,.8,.55);flashLight(o.x,o.y,o.z,2.5*cal,.15,0xffc070);
 if(cal>=.8)(typeof tkf36==='function'&&cal>=.5&&tkf36(o.x,o.z))||expSnd(o.x,o.z,.5*cal);else npcShot('big',o.x,o.z);if(v.type==='gun')burst(v.g.position.x,.3,v.g.position.z,0x9a8a6a,8,.6,4);
 m.rec=1;v.kick=cal;vhShot32(m.kind,o.x,o.y,o.z,t.x,t.y,t.z,Math.max(.08,d/(m.kind==='naval'?380:460)),0,cal,v.ally?'volsk':'veyrn',m.dmg,m.r,tv,v,false,0)}
function vhFireMortar32(v,m){VEH32.dbg.shots++;const o=m.m.getWorldPosition(vh_va32),t=vhTPos32(m,vh_vb32),d=Math.hypot(t.x-o.x,t.z-o.z);const a=R()*6.28,e=m.brk*(.5+R()*.5);m.brk=Math.max(m.tk==='P'?3.5/vhDIF32():2.5,m.brk*.62);t.x+=Math.cos(a)*e;t.z+=Math.sin(a)*e;t.y=vhFlo32(t.x,t.z);
 smoke(o.x,o.y,o.z,1.6,2,0xb8b4ac,1,.5);burst(o.x,o.y,o.z,0xffc060,4,.15,4);const vv=vhCamVol32(o.x,o.z,140);if(vv>.02){tn18('sine',110,45,.25,.12*vv);nz18(.002,.25,'lowpass',900,200,.1*vv)}m.rec=1;
 vhShot32('mortar',o.x,o.y,o.z,t.x,t.y,t.z,2.6+d/110,12+d*.35,m.cal,v.ally?'volsk':'veyrn',m.dmg,m.r,null,v,true,0)}
/* ---------- actualización ---------- */
function vhMountUpd32(v,m,dt){m.rec=Math.max(0,m.rec-dt*2.5);if(m.p!==m.y)m.p.position.z=m.p0z-m.rec*.22*m.cal;
 if(!v.alive||!v.fire){if(m.gl)m.gl.visible=false;return}
 m.tt-=dt;if(m.tt<=0){m.tt=.45+R()*.25;vhPick32(v,m)}else if(m.tgt&&!vhTOk32(m)){m.tgt=null;m.tk='';m.tele=0}
 m.cd-=dt;if(m.burst>0){m.bt-=dt;if(m.bt<=0){m.bt=.085;m.burst--;if(m.tgt&&vhTOk32(m))vhFireMG32(v,m);else m.burst=0}}
 if(!m.tgt){m.tele=0;if(m.gl)m.gl.visible=false;return}
 const o=m.y.getWorldPosition(vh_vc32),t=vhTPos32(m,vh_vd32),hd=Math.hypot(t.x-o.x,t.z-o.z);
 const want=vhCL32(vhAD32(0,Math.atan2(t.x-o.x,t.z-o.z)-v.g.rotation.y-m.base),-m.arc,m.arc),dy=vhAD32(m.yaw,want);m.yaw+=vhCL32(dy,-m.yr*dt,m.yr*dt);m.y.rotation.y=m.base+m.yaw;
 let el=m.kind==='mortar'?vhCL32(1.42-hd/m.rng*.55,.8,1.42):Math.atan2(t.y-o.y,hd)+(m.kind==='naval'?hd/9000:0);el=vhCL32(el,-.15,m.kind==='mortar'?1.45:.6);if(m.p!==m.y)m.pit+=vhCL32(el-m.pit,-dt*1.2,dt*1.2),m.p.rotation.x=-m.pit;
 const ok=Math.abs(dy)<.05&&Math.abs(el-m.pit)<.06;
 if(m.kind==='mg'){if(ok&&m.cd<=0&&m.burst<=0){m.burst=5+(R()*4|0);m.bt=0;m.cd=m.cd0*(.8+R()*.5)+m.burst*.085}return}
 if(m.kind==='mortar'){if(ok&&m.cd<=0){m.cd=m.cd0*(.8+R()*.4);vhFireMortar32(v,m)}return}
 /* cañones: aviso visible y audible antes de disparar al jugador */
 if(m.tele>0){m.tele-=dt;if(m.gl){m.gl.visible=true;m.gl.scale.setScalar((.55+.45*Math.abs(Math.sin(time*18)))*(1.6-m.tele*.4)*(m.cal+.4))}if(m.tele<=0){if(m.gl)m.gl.visible=false;m.cd=m.cd0*(.85+R()*.3);vhFireGun32(v,m)}return}
 if(ok&&m.cd<=0){if(m.tk==='P'||m.tk==='A'){m.tele=m.tk==='P'?1.2+R()*.5:.5;if(m.tk==='P'){const vv=vhCamVol32(o.x,o.z,120);if(vv>.02){tn18('square',240,190,.07,.05*vv);tn18('square',180,150,.09,.04*vv,.12)}if(VEH32.warn&&time-(VEH32.wt||-99)>9){VEH32.wt=time;feed('⚠ ¡'+v.name.replace(/^./,c=>c.toUpperCase())+' te apunta! ¡Cubrite!')}}}else{m.cd=m.cd0*(.85+R()*.3);vhFireGun32(v,m)}}}
function vhDriveOld32(v,dt){const S=v.spec,g=v.g,p=g.position;let st=0,yr=0;const wheeled=v.type==='car'||v.type==='truck';
 if(v.path&&!v.arrived&&v.alive&&!v.hold){const w=v.path[v.pi],dx=w[0]-p.x,dz=w[1]-p.z,dist=Math.hypot(dx,dz),err=vhAD32(g.rotation.y,Math.atan2(dx,dz)),last=v.pi>=v.path.length-1&&!v.loop;
  st=v.vmax*vhCL32(1-Math.abs(err)/(wheeled?1.6:1.3),wheeled?.3:.12,1);if(last)st=Math.min(st,Math.sqrt(2*(S.acc||1)*.8*dist)+.2);
  if(v.type==='tank'||v.type==='ship'){const tr=S.turn*(v.type==='ship'?vhCL32(Math.abs(v.v)/2,.2,1):1);yr=vhCL32(err*1.8,-tr,tr)}else{v.steerA+=(vhCL32(err*1.6,-.6,.6)-v.steerA)*Math.min(1,dt*3);yr=vhCL32(v.v*Math.tan(v.steerA)/(S.wb||3),-S.turn,S.turn)}
  if(dist<(last?1.4:wheeled?4:3)||(!last&&dist<9&&Math.abs(err)>1.35)){if(last){v.arrived=true;st=0;if(v.onEnd)try{v.onEnd(v)}catch(e){console.warn(e)}}else{v.pi++;if(v.pi>=v.path.length)v.pi=0}}
  if(v.halt)for(const m of v.mounts)if(m.tele>0)st=0;
  /* no atropellar al jugador ni chocar con otro vehículo */const fx=Math.sin(g.rotation.y),fz=Math.cos(g.rotation.y);{const qx=P.g.position.x-p.x,qz=P.g.position.z-p.z,f=qx*fx+qz*fz,l=Math.abs(qx*fz-qz*fx);if(v.ally&&f>0&&f<S.zf+4&&l<S.hw+1.4)st=0}
  for(const o of VEH32.list){if(o===v||!o.on||o.type==='ship')continue;const qx=o.g.position.x-p.x,qz=o.g.position.z-p.z,f=qx*fx+qz*fz,l=Math.abs(qx*fz-qz*fx);if(f>0&&f<S.zf+o.spec.hd+3&&l<S.hw+o.spec.hw+.6)st=Math.min(st,o.alive&&o.v>.5?o.v:0)}}
 v.st=st;const acc=S.acc||1,v0=v.v;v.v+=vhCL32(st-v.v,-acc*1.8*dt,acc*dt);if(!wheeled)v.yr+=(yr-v.yr)*Math.min(1,dt*3);else v.yr=yr;
 if(Math.abs(v.v)>.01||Math.abs(v.yr)>.01){g.rotation.y+=v.yr*dt;p.x+=Math.sin(g.rotation.y)*v.v*dt;p.z+=Math.cos(g.rotation.y)*v.v*dt}
 vhAnim32(v,dt,v0,wheeled)}
function vhAnim32(v,dt,v0,wheeled){const S=v.spec,g=v.g,p=g.position;
 v.t+=dt;const sp=Math.abs(v.v);
 if(v.type==='ship'){p.y=VEH32.seaY+Math.sin(v.t*.55)*.22;g.rotation.z=Math.sin(v.t*.43)*.025;g.rotation.x=Math.sin(v.t*.31)*.008}
 else{p.y+=(vhFlo32(p.x,p.z)-p.y)*Math.min(1,dt*8);const a=(v.v-v0)/Math.max(dt,1e-3),bump=sp>.3?Math.sin(v.t*(wheeled?11:7))*.006*Math.min(1,sp/3):0;v.kick=Math.max(0,v.kick-dt*3);
  g.rotation.x+=((-a*.008)-v.kick*.03+bump-g.rotation.x)*Math.min(1,dt*5);if(v.alive)g.rotation.z+=((v.yr*v.v*.012)-g.rotation.z)*Math.min(1,dt*4)}
 for(let i=0;i<v.wh.length;i++)v.wh[i].rotation.x+=(v.v+(v.type==='tank'?Math.abs(v.yr)*1.5:0))*dt/v.whr[i];
 for(const t of v.trk)if(t.material.map)t.material.map.offset.x-=(v.v+Math.abs(v.yr)*1.5)*dt*.18;for(const s of v.steer)s.rotation.y=v.steerA;
 if(v.alive&&v.type!=='ship'&&v.type!=='gun'&&v.type!=='mortar'){v.smT-=dt;if(v.smT<=0){v.smT=sp>.5?.25:.7;const bx=p.x-Math.sin(g.rotation.y)*(-S.zb*.9),bz=p.z-Math.cos(g.rotation.y)*(-S.zb*.9);smoke(bx,p.y+1,bz,.7+sp*.08,1.4,0x3a3a3a,.6,.38);if(sp>3&&R()<.5)burst(p.x+(R()-.5)*2,.2,p.z+(R()-.5)*2,0x7a6a52,2,.5,1.5)}
  if(sp>2&&v.ally&&(v.type==='tank'||v.type==='car'))for(let i=enemies.length-1;i>=0;i--){const e=enemies[i];if(!e||e.hp<=0)continue;const qx=e.g.position.x-p.x,qz=e.g.position.z-p.z;if(Math.hypot(qx,qz)<S.hd*.8&&qx*Math.sin(g.rotation.y)+qz*Math.cos(g.rotation.y)>S.hd*.4)hurt(e,300,'x',{name:v.name.replace(/^./,c=>c.toUpperCase())})}}}
/* =====================================================================
   v37 · IA DE VEHÍCULOS (reutilizable en cualquier nivel)
   · Clases VEH32.cls: velocidad, aceleración y frenado progresivos, giro (ruedas: Ackermann con
     radio mínimo; orugas: pivote), blindaje, alcance de detección y de ataque, táctica.
   · Máquina de estados: patrol/advance/recon/engage/maneuver/cover/retreat/disabled/destroyed.
   · Detección con línea de vista (presupuestada), reacción al antitanque (frente al tirador,
     marcha atrás, humo, repliegue a cobertura), retirada con daño grave.
   · Evitación: rejilla espacial de obstB + zonas vedadas (trincheras/alambradas) + restos y otros
     vehículos; antenas de dirección, frenado ante obstáculos, colisión dura OBB (SAT) y
     recuperación de atascos (marcha atrás girando).
   · Órdenes: vehOrder32(v,{mode,path,goal,speed}); vehPath32 sigue funcionando igual.
   ===================================================================== */
VEH32.cls={
 recon:{speed:5.4,road:8,acc:1.5,brake:3.6,turn:.55,steer:.6,wheeled:true,armor:'light',detect:150,attack:120,standoff:24,tactics:'recon',retreat:.65,smoke:1,cover:16},
 light:{speed:3.3,road:4.2,acc:.7,brake:1.9,turn:.5,wheeled:false,armor:'medium',detect:140,attack:170,standoff:36,tactics:'assault',retreat:.3,smoke:2,cover:14},
 medium:{speed:2.6,road:3.3,acc:.5,brake:1.5,turn:.34,wheeled:false,armor:'heavy',detect:140,attack:190,standoff:46,tactics:'assault',retreat:.25,smoke:2,cover:14},
 truck:{speed:6.5,road:10,acc:1.4,brake:3.2,turn:.5,steer:.6,wheeled:true,armor:'none',detect:90,attack:0,standoff:0,tactics:'transport',retreat:0,smoke:0,cover:10},
 at:{speed:0,acc:0,turn:0,armor:'shield',detect:220,attack:220,tactics:'static'},
 field:{speed:0,acc:0,turn:0,armor:'shield',detect:300,attack:300,tactics:'static'},
 mortar:{speed:0,acc:0,turn:0,armor:'none',detect:320,attack:320,tactics:'static'}};
VEH32.clsOf={armcar:'recon',tank_light:'light',tank_medium:'medium',truck:'truck',atgun:'at',fieldgun:'field',mortar:'mortar'};
VEH32.dbg={think:0,stuck:0,giveup:0,bump:0,shots:0,hitsP:0,hitsA:0,killsE:0,killsA:0,vk:0,retreat:0,smoke:0,maneuver:0,engage:0,dismount:0,los:0};
VEH32.noGo=[];VEH32.smk=[];VEH32.losN=0;
const vhO1={},vhO2={},vhMTV32={x:0,z:0},vhEMPTY32=[];
function vhC32(v){if(v.cls!==undefined)return v.cls;const k=v.clsK||VEH32.clsOf[v.kind];return v.cls=k&&VEH32.cls[k]?VEH32.cls[k]:null}
function vhAI32(v){return v.ai||(v.ai={st:'advance',mode:'advance',t:0,th:R()*.25,sT:0,tx:null,tz:0,spd:0,face:null,faceT:0,fh:0,hs:v.g.rotation.y,ff:99,fc:99,lc:0,arr:1.5,pf:false,
 foe:null,fk:'',fx:0,fz:0,fd:1e9,ft:-99,lt:-99,hits:0,caution:0,mp:null,rg:null,revT:0,cT:0,hT:0,rec:0,recS:1,recD:-1,sc:0,lx:0,lz:0,lpt:0,stk:[],side:R()<.5?1:-1,smk:0,gb:false,hist:{}})}
/* ---------- rejilla espacial de obstáculos estáticos ---------- */
const VG32={cs:8,m:new Map(),big:[],n:-1,ng:-1,lv:-2,t:0,pad:4};
function vhGK32(ix,iz){return ix*131071+iz}
function vhGrid32(force){const G_=VG32,lv=typeof level!=='undefined'?level:0;G_.t-=1;if(!force&&obstB.length===G_.n&&VEH32.noGo.length===G_.ng&&lv===G_.lv&&G_.t>0)return;
 G_.n=obstB.length;G_.ng=VEH32.noGo.length;G_.lv=lv;G_.t=300;G_.m.clear();G_.big.length=0;const cs=G_.cs,pd=G_.pad;
 const add=b=>{const x0=Math.floor((b.x-b.hw-pd)/cs),x1=Math.floor((b.x+b.hw+pd)/cs),z0=Math.floor((b.z-b.hd-pd)/cs),z1=Math.floor((b.z+b.hd+pd)/cs);if((x1-x0+1)*(z1-z0+1)>300){G_.big.push(b);return}
  for(let i=x0;i<=x1;i++)for(let j=z0;j<=z1;j++){const k=vhGK32(i,j);let a=G_.m.get(k);if(!a)G_.m.set(k,a=[]);a.push(b)}};
 for(const b of obstB){if(b.veh32||!(b.h>=.35)||(b.y0||0)>=3.2||!isFinite(b.x))continue;add(b)}for(const b of VEH32.noGo)add(b)}
function vhCell32(x,z){return VG32.m.get(vhGK32(Math.floor(x/VG32.cs),Math.floor(z/VG32.cs)))||vhEMPTY32}
function vhBlkOk32(v,b){return !b.ng||!b.side||b.side===v.side}
/* zona vedada a vehículos (coordenadas locales): trincheras, alambradas, refugios */
function vehNoGo32(x0,z0,x1,z1,o){o=o||{};const b={x:VEH32.X+(x0+x1)/2,z:(z0+z1)/2,hw:Math.abs(x1-x0)/2,hd:Math.abs(z1-z0)/2,h:2,ng:true,side:o.side?vhSide32(o.side):null,tag:o.tag||''};VEH32.noGo.push(b);VG32.ng=-1;return b}
/* nivel 17: la línea de las Tres Cruces y la trinchera norte son infranqueables para vehículos */
function vhNoGo17(){if(VEH32.ng17||typeof level==='undefined'||level!==17||typeof K17==='undefined'||!K17||VEH32.X!==X17)return;VEH32.ng17=true;
 const lz=K17.lineZ||-243;vehNoGo32(-132,lz-3.6,112,lz+14.2,{tag:'line'});for(const x of[-45,30])vehNoGo32(x-2.6,-269,x+2.6,lz-3,{tag:'comm'});
 const N=K17.north;if(N){const tz=N.trenchZ||-842,gx=-20;vehNoGo32(-116,tz-4,gx-5.2,tz+14,{tag:'north'});vehNoGo32(gx+5.2,tz-4,76,tz+14,{tag:'north'})}}
/* ---------- geometría: OBB del vehículo y SAT ---------- */
function vhOBB32(v,o){const S=v.spec,a=v.g.rotation.y,s=Math.sin(a),c=Math.cos(a),cz=((S.zf||S.hd)+(S.zb||-S.hd))/2;o.x=v.g.position.x+s*cz;o.z=v.g.position.z+c*cz;o.ux=s;o.uz=c;o.hl=((S.zf||S.hd)-(S.zb||-S.hd))/2;o.hw=S.hw;return o}
function vhSatAB32(A,bx,bz,bw,bd,pad){let best=1e9,nx=0,nz=0;const dx=A.x-bx,dz=A.z-bz,wx=A.uz,wz=-A.ux;
 for(let i=0;i<4;i++){const ax=i===0?1:i===1?0:i===2?A.ux:wx,az=i===0?0:i===1?1:i===2?A.uz:wz;const rA=A.hw*Math.abs(wx*ax+wz*az)+A.hl*Math.abs(A.ux*ax+A.uz*az),rB=bw*Math.abs(ax)+bd*Math.abs(az),d=dx*ax+dz*az,ov=rA+rB+pad-Math.abs(d);if(ov<=0)return 0;if(ov<best){best=ov;nx=d<0?-ax:ax;nz=d<0?-az:az}}
 vhMTV32.x=nx;vhMTV32.z=nz;return best}
function vhSatBB32(A,B){let best=1e9,nx=0,nz=0;const dx=A.x-B.x,dz=A.z-B.z,awx=A.uz,awz=-A.ux,bwx=B.uz,bwz=-B.ux;
 for(let i=0;i<4;i++){const ax=i===0?A.ux:i===1?awx:i===2?B.ux:bwx,az=i===0?A.uz:i===1?awz:i===2?B.uz:bwz;const rA=A.hw*Math.abs(awx*ax+awz*az)+A.hl*Math.abs(A.ux*ax+A.uz*az),rB=B.hw*Math.abs(bwx*ax+bwz*az)+B.hl*Math.abs(B.ux*ax+B.uz*az),d=dx*ax+dz*az,ov=rA+rB-Math.abs(d);if(ov<=0)return 0;if(ov<best){best=ov;nx=d<0?-ax:ax;nz=d<0?-az:az}}
 vhMTV32.x=nx;vhMTV32.z=nz;return best}
/* ¿punto (círculo r) bloqueado para v? */
function vhPtBlk32(v,x,z,r){for(const b of vhCell32(x,z))if(Math.abs(x-b.x)<b.hw+r&&Math.abs(z-b.z)<b.hd+r&&vhBlkOk32(v,b))return true;
 for(const b of VG32.big)if(Math.abs(x-b.x)<b.hw+r&&Math.abs(z-b.z)<b.hd+r&&vhBlkOk32(v,b))return true;
 for(const w of VEH32.list){if(w===v||!w.on||w.type==='ship'||!w.ob)continue;const B=vhOBB32(w,vhO2),dx=x-B.x,dz=z-B.z;if(Math.abs(dx)>B.hl+B.hw+r||Math.abs(dz)>B.hl+B.hw+r)continue;if(Math.abs(dx*B.ux+dz*B.uz)<B.hl+r&&Math.abs(dx*B.uz-dz*B.ux)<B.hw+r)return true}
 if(typeof VEH32.water==='function'&&VEH32.water(x-VEH32.X,z))return true;return false}
function vhProbe32(v,h,L,r,off){const p=v.g.position,s=Math.sin(h),c=Math.cos(h);for(let d=0;d<=L;d+=1.1)if(vhPtBlk32(v,p.x+s*(off+d),p.z+c*(off+d),r))return d;return L+1}
/* colisión dura: el casco nunca entra en un obstáculo ni en otro vehículo */
function vhCollide32(v){const O=vhOBB32(v,vhO1);let px=0,pz=0,hit=0;const chk=b=>{if(!vhBlkOk32(v,b))return;const ov=vhSatAB32(O,b.x,b.z,b.hw,b.hd,0);if(ov>0){const m=Math.min(ov,1.2);O.x+=vhMTV32.x*m;O.z+=vhMTV32.z*m;px+=vhMTV32.x*m;pz+=vhMTV32.z*m;hit++}};
 for(const b of vhCell32(O.x,O.z))chk(b);for(const b of VG32.big)chk(b);
 for(const w of VEH32.list){if(w===v||!w.on||w.type==='ship'||!w.ob)continue;if(Math.abs(w.g.position.x-O.x)>12||Math.abs(w.g.position.z-O.z)>12)continue;const B=vhOBB32(w,vhO2),ov=vhSatBB32(O,B);if(ov>0){const m=Math.min(ov,1.2)*(w.ai&&w.alive&&!w.train?.5:1);O.x+=vhMTV32.x*m;O.z+=vhMTV32.z*m;px+=vhMTV32.x*m;pz+=vhMTV32.z*m;hit++}}
 if(hit){const p=v.g.position;p.x+=px;p.z+=pz;const f=px*Math.sin(v.g.rotation.y)+pz*Math.cos(v.g.rotation.y);if(f*v.v<0)v.v*=.35;VEH32.dbg.bump++;v.ai.bmp=(v.ai.bmp||0)+1}}
/* prueba independiente de solapamiento (QA): cajas obstB estáticas que el casco invade más de 'tol' m */
function vhOverlap32(v,tol){const O=vhOBB32(v,{});let n=0;tol=tol===undefined?.12:tol;for(const b of obstB){if(b.veh32||!(b.h>=.35)||(b.y0||0)>=3.2)continue;if(Math.abs(b.x-O.x)>b.hw+8||Math.abs(b.z-O.z)>b.hd+8)continue;if(vhSatAB32(O,b.x,b.z,b.hw,b.hd,-tol)>0)n++}
 for(const b of VEH32.noGo)if(vhBlkOk32(v,b)&&vhSatAB32(O,b.x,b.z,b.hw,b.hd,-tol)>0)n+=1000;return n}
/* ---------- humo ---------- */
function vhSmoke32(v,tx,tz){const p=v.g.position,dx=tx-p.x,dz=tz-p.z,L=Math.hypot(dx,dz)||1,ux=dx/L,uz=dz/L,A=v.ai;A.smk++;VEH32.dbg.smoke++;
 for(let i=-2;i<=2;i++){const d=7+R()*3,x=p.x+ux*d+uz*i*3.2,z=p.z+uz*d-ux*i*3.2;VEH32.smk.push({x,z,t:16+R()*4,c:R()*.3})}v.smkT=time+14;
 burst(p.x,p.y+v.spec.h*.8,p.z,0xd8d8d0,6,.5,4);if(typeof npcShot==='function')npcShot('big',p.x,p.z);if(v.ally===false&&vhCamVol32(p.x,p.z,90)>.1)feed('¡El '+v.name.replace(/^el |^la /,'')+' tiende humo!')}
function vhSmokeUpd32(dt){const L=VEH32.smk;for(let i=L.length-1;i>=0;i--){const s=L[i];s.t-=dt;s.c-=dt;if(s.c<=0){s.c=.75;smoke(s.x+(R()-.5)*2,1,s.z+(R()-.5)*2,5,6,0xc8c8c0,.25,.75)}if(s.t<=0)L.splice(i,1)}}
function vhSmokeBlk32(ax,az,bx,bz){const L=VEH32.smk;if(!L.length)return false;const dx=bx-ax,dz=bz-az,l2=dx*dx+dz*dz||1;for(const s of L){if(s.t<2)continue;const t=vhCL32(((s.x-ax)*dx+(s.z-az)*dz)/l2,0,1),qx=ax+dx*t-s.x,qz=az+dz*t-s.z;if(qx*qx+qz*qz<12)return true}return false}
/* ---------- percepción ---------- */
function vhScan32(v,C){const p=v.g.position,S=v.spec;let best=null,bk='',bd=C.detect,bx=0,bz=0;const cons=(t,k,x,z)=>{const d=Math.hypot(x-p.x,z-p.z);if(d<bd){bd=d;best=t;bk=k;bx=x;bz=z}};
 if(v.ally){for(const e of enemies){if(!e||e.hp<=0||!e.g.parent)continue;cons(e,'E',e.g.position.x,e.g.position.z)}}
 else{if(playing&&P.hp>0)cons(P,'P',P.g.position.x,P.g.position.z);for(const n of vhAllies32()){if(!n.g||!n.g.visible||n.down29||n.down17||n.dead17)continue;cons(n,'A',n.g.position.x,n.g.position.z)}}
 for(const w of VEH32.list){if(!w.alive||!w.on||w.ally===v.ally||w.type==='ship'||w.type==='wagon'||w.type==='loco')continue;cons(w,'V',w.g.position.x,w.g.position.z)}
 if(!best||VEH32.losN>=6)return null;VEH32.losN++;VEH32.dbg.los++;if(bd>6&&(!losClear(p.x,p.y+S.h*.9,p.z,bx,1.3,bz)||vhSmokeBlk32(p.x,p.z,bx,bz)))return null;return{t:best,k:bk,x:bx,z:bz,d:bd}}
function vhSense32(v,C){const A=v.ai,p=v.g.position;for(const m of v.mounts){if(m.tgt&&vhTOk32(m)){const t=vhTPos32(m,vh_vd32);A.foe=m.tgt;A.fk=m.tk;A.fx=t.x;A.fz=t.z;A.ft=time;A.fd=Math.hypot(t.x-p.x,t.z-p.z);return}}
 const s=vhScan32(v,C);if(s){A.foe=s.t;A.fk=s.k;A.fx=s.x;A.fz=s.z;A.ft=time;A.fd=s.d}else if(A.foe)A.fd=Math.hypot(A.fx-p.x,A.fz-p.z)}
/* ---------- reacciones ---------- */
function vhRetreat32(v,C,tx,tz){const A=v.ai,p=v.g.position,S=v.spec;let ax=p.x-tx,az=p.z-tz,L=Math.hypot(ax,az)||1;ax/=L;az/=L;const R_=C.tactics==='recon'?55:40;let gx=p.x+ax*R_,gz=p.z+az*R_;
 for(const a of[0,.45,-.45,.9,-.9,1.3,-1.3]){const c=Math.cos(a),s=Math.sin(a),x=p.x+(ax*c-az*s)*R_,z=p.z+(az*c+ax*s)*R_;if(!vhPtBlk32(v,x,z,S.hw+1)){gx=x;gz=z;break}}
 if(typeof covers!=='undefined'){let bc=null,bd=24;for(const c of covers){if(!c||(c.r||1)>4)continue;const d=Math.hypot(c.x-gx,c.z-gz);if(d>=bd)continue;if(Math.hypot(c.x-tx,c.z-tz)<L+8)continue;bd=d;bc=c}
  if(bc){let ux=bc.x-tx,uz=bc.z-tz;const l=Math.hypot(ux,uz)||1;const x=bc.x+ux/l*((bc.r||1)+S.hd+2),z=bc.z+uz/l*((bc.r||1)+S.hd+2);if(!vhPtBlk32(v,x,z,S.hw+.6)){gx=x;gz=z}}}
 A.rg=[gx,gz];A.st='retreat';A.t=0;A.anc=null;A.tx0=tx;A.tz0=tz;const ang=Math.abs(vhAD32(v.g.rotation.y,Math.atan2(tx-p.x,tz-p.z)));A.revT=ang<1.5?3+R()*1.5:0;A.caution++;VEH32.dbg.retreat++;
 if(A.smk<(C.smoke||0))vhSmoke32(v,tx,tz)}
function vhManeuver32(v,C){const A=v.ai,p=v.g.position,S=v.spec;let ux=A.fx-p.x,uz=A.fz-p.z;const L=Math.hypot(ux,uz)||1;ux/=L;uz/=L;
 for(const s of[A.side,-A.side]){const d=13+R()*10,x=p.x+uz*s*d-ux*3,z=p.z-ux*s*d-uz*3;if((!A.anc||Math.hypot(x-A.anc[0],z-A.anc[1])<34)&&!vhPtBlk32(v,x,z,S.hw+1.2)&&vhProbe32(v,Math.atan2(x-p.x,z-p.z),Math.min(d,14),S.hw+.4,0)>Math.min(d,14)*.6){A.mp=[x,z];A.side=-s;A.st='maneuver';A.t=0;VEH32.dbg.maneuver++;return true}}A.t=0;return false}
function vhOnAT32(v,C,th){const A=v.ai,p=v.g.position;if(C.tactics==='transport'||C.tactics==='static')return;
 if(C.tactics==='recon'||v.hp<v.maxhp*C.retreat){vhRetreat32(v,C,th.x,th.z);return}
 const h=Math.atan2(th.x-p.x,th.z-p.z),ang=Math.abs(vhAD32(v.g.rotation.y,h));A.faceT=7;A.fh=h;A.fx=th.x;A.fz=th.z;A.ft=time;A.fd=Math.hypot(th.x-p.x,th.z-p.z);
 if(ang>.7&&A.smk<(C.smoke||0))vhSmoke32(v,th.x,th.z);if(C===VEH32.cls.light&&ang<1.3)A.revT=2.5;if(A.st!=='retreat'){A.st='engage';A.t=0}}
/* ---------- estados ---------- */
function vhOrdS32(A){return A.mode==='recon'?'recon':A.mode==='patrol'?'patrol':A.mode==='hold'?'cover':A.mode==='retreat'?'cover':'advance'}
function vhThink32(v,C,dt){const A=v.ai,p=v.g.position;VEH32.dbg.think++;
 if(!v.alive){A.st='destroyed';A.tx=null;A.spd=0;return}
 A.t+=dt;A.revT=Math.max(0,A.revT-dt);A.faceT=Math.max(0,A.faceT-dt);A.hT=Math.max(0,A.hT-dt);
 if(A.st!=='disabled'&&v.hp<v.maxhp*.15&&C.speed>0&&v.type!=='truck'){A.st='disabled';A.t=0}
 if(A.st==='disabled'||v.hold){A.tx=null;A.spd=0;A.face=null;A.pf=false;return}
 vhSense32(v,C);const seen=time-A.ft<6,d=seen?A.fd:1e9,so=(C.standoff||0)+A.caution*12,ordS=vhOrdS32(A);
 const th=v.thr;if(th&&th.t>A.lt){A.lt=th.t;if(th.at){A.hits++;vhOnAT32(v,C,th)}else if(!seen&&C.attack>0){A.fx=th.x;A.fz=th.z;A.ft=time-3;A.fd=Math.hypot(th.x-p.x,th.z-p.z)}}
 const pathOn=v.path&&!v.arrived;
 if(C.tactics==='transport'){if(A.st!=='retreat'&&A.st!=='cover')A.st=pathOn?ordS==='cover'?'advance':ordS:'cover';if(A.st==='retreat'&&(A.t>20||!A.rg))A.st='cover'}
 else switch(A.st){
  case'advance':case'patrol':case'recon':if(seen&&C.attack>0&&(d<so||(A.st==='recon'&&d<C.attack)||(!pathOn&&d<C.attack))){A.st='engage';A.t=0;VEH32.dbg.engage++}break;
  case'engage':if(!A.anc)A.anc=[p.x,p.z];if(!seen&&A.t>4){A.st=ordS;A.t=0}else if(C.tactics==='recon'&&A.mode!=='hold'&&A.t>7+R()*5)vhManeuver32(v,C);else if(C.tactics==='assault'&&A.mode!=='hold'&&pathOn&&A.t>10+R()*6&&d>so+8){A.st=ordS;A.t=0}break;
  case'maneuver':if(!A.mp||A.t>12||Math.hypot(A.mp[0]-p.x,A.mp[1]-p.z)<3){A.mp=null;A.st=seen?'engage':ordS;A.t=0}break;
  case'retreat':if(!A.rg||A.t>25||Math.hypot(A.rg[0]-p.x,A.rg[1]-p.z)<3.5){A.st='cover';A.t=0;A.cT=(C.cover||14)+R()*6}break;
  case'cover':if(A.mode==='hold'){if(seen&&C.attack>0&&d<C.attack){A.st='engage';A.t=0}break}A.cT-=dt;if(A.cT<=0){if(v.hp<=v.maxhp*Math.max(.3,(C.retreat||0)*.6))A.caution=Math.max(A.caution,Math.ceil((C.attack*.75-(C.standoff||0))/12));A.st=seen&&d<C.attack?'engage':ordS;A.t=0}break;
  default:A.st=ordS}
 vhPlan32(v,C,seen,d,so)}
function vhPlan32(v,C,seen,d,so){const A=v.ai,p=v.g.position,S=v.spec,sp=Math.min(v.vmax||C.speed,C.road||C.speed);A.tx=null;A.spd=0;A.face=null;A.pf=false;
 const foeH=seen?Math.atan2(A.fx-p.x,A.fz-p.z):null,m0=v.mounts[0];
 const follow=k=>{if(!v.path||v.arrived)return false;const w=v.path[v.pi];A.tx=w[0];A.tz=w[1];A.pf=true;A.spd=sp*k;const last=v.pi>=v.path.length-1&&!v.loop;A.arr=last?(C.wheeled?1.8:1.6):(C.wheeled?4.5:3.2);return true};
 if(A.revT>0&&A.st!=='retreat'){const b=v.g.rotation.y+Math.PI;A.tx=p.x+Math.sin(b)*12;A.tz=p.z+Math.cos(b)*12;A.spd=-Math.min(1.8,C.speed*.6);A.arr=1;return}
 switch(A.st){
  case'advance':case'patrol':case'recon':{let k=A.st==='recon'?.7:1;if(seen&&C.attack>0&&d<C.attack*1.15)k*=C.tactics==='recon'?.55:.7;
   if(C.tactics==='assault'&&seen&&m0&&m0.tgt&&m0.cd<.9&&m0.kind==='gun'&&d<m0.rng)A.hT=2.6;if(A.hT>0)k=0;follow(k);if(k===0){A.tx=null;A.pf=false}break}
  case'engage':if(C.tactics==='assault'&&A.mode!=='hold'&&d>so+10&&m0&&m0.cd>2.2&&!A.faceT){follow(.45)}
   if(!A.tx&&!C.wheeled)A.face=A.faceT>0?A.fh:foeH;break;
  case'maneuver':if(A.mp){A.tx=A.mp[0];A.tz=A.mp[1];A.spd=sp*.8;A.arr=2.5}break;
  case'retreat':if(A.rg){A.tx=A.rg[0];A.tz=A.rg[1];A.arr=3;A.spd=A.revT>0?-Math.min(2.4,C.speed*.7):Math.min(sp*1.1,C.road||sp)}break;
  case'cover':if(!C.wheeled&&(A.faceT>0||seen))A.face=A.faceT>0?A.fh:foeH;break}}
/* ---------- conducción ---------- */
const vhCAND32=[0,.3,-.3,.62,-.62,.95,-.95,1.35,-1.35,1.9,-1.9,2.5,-2.5];
function vhSteer32(v,C,hd,rev){const A=v.ai,S=v.spec,sp=Math.abs(v.v),L=vhCL32(7+sp*2.6,8,20),cur=v.g.rotation.y+(rev?Math.PI:0),off=rev?(-(S.zb||-S.hd)-S.hw):((S.zf||S.hd)-S.hw);
 A.ff=vhProbe32(v,cur,L,S.hw+.25,off);let best=hd,bs=-1e9,bf=0,bc=0;
 for(const c of vhCAND32){const h=hd+c,f=vhProbe32(v,h,L,S.hw+.6,off);const s=Math.min(f,L)/L*2-Math.abs(c)*.5-Math.abs(vhAD32(cur,h))*.12+(Math.abs(c-A.lc)<.01?.15:0)+(f>L?.5:0)+(c>0?.02:0);if(s>bs){bs=s;best=h;bf=f;bc=c}if(c===0&&f>L)break}
 A.hs=rev?best-Math.PI:best;A.fc=bf;A.lc=bc;A.gb=A.pf&&vhPtBlk32(v,A.tx,A.tz,S.hw+.3)}
function vhWp32(v,A,C){const p=v.g.position,w=v.path[v.pi],dist=Math.hypot(w[0]-p.x,w[1]-p.z),last=v.pi>=v.path.length-1&&!v.loop,err=Math.abs(vhAD32(v.g.rotation.y,Math.atan2(w[0]-p.x,w[1]-p.z)));
 const reach=dist<A.arr||(!last&&dist<9&&err>1.35)||(A.gb&&A.ff<2.2&&dist<26)||(A.gb&&A.sc>0&&dist<40);
 if(!reach)return;A.gb=false;A.sT=0;if(last){v.arrived=true;A.tx=null;A.pf=false;if(v.onEnd)try{v.onEnd(v)}catch(e){console.warn(e)}}else{v.pi++;if(v.pi>=v.path.length)v.pi=0;const n=v.path[v.pi];A.tx=n[0];A.tz=n[1]}}
function vhMove32(v,dt,C){const A=v.ai,S=v.spec,g=v.g,p=g.position,wh=!!C.wheeled;let want=0,yrT=0,stT=0;A.sT-=dt;
 if(A.pf&&v.path&&!v.arrived)vhWp32(v,A,C);
 if(A.rec>0){A.rec-=dt;want=A.recD*Math.min(2,C.speed*.6);if(wh)stT=-A.recD*A.recS*(C.steer||.6);else yrT=A.recS*C.turn}
 else if(A.tx!==null&&v.alive){const dx=A.tx-p.x,dz=A.tz-p.z,dist=Math.hypot(dx,dz),rev=A.spd<0;let hd=Math.atan2(dx,dz);if(rev)hd+=Math.PI;
  if(A.sT<=0){A.sT=.16+R()*.06;vhSteer32(v,C,hd,rev)}
  const err=vhAD32(g.rotation.y,A.hs);let sp=Math.abs(A.spd);
  sp=Math.min(sp,Math.sqrt(2*C.brake*.6*Math.max(0,dist-A.arr*.5))+.25);sp=Math.min(sp,Math.sqrt(2*C.brake*Math.max(0,A.ff-.35)));
  if(wh){sp*=vhCL32(1-Math.abs(err)/2.4,.3,1);if(Math.abs(err)>1.2)sp=Math.min(sp,2.6)}else{sp*=vhCL32(1-Math.abs(err)/1.3,0,1);if(Math.abs(err)>.9)sp=Math.min(sp,.3)}
  if(v.halt)for(const m of v.mounts)if(m.tele>0)sp=0;
  if(v.ally&&!rev){const fx=Math.sin(g.rotation.y),fz=Math.cos(g.rotation.y),qx=P.g.position.x-p.x,qz=P.g.position.z-p.z,f=qx*fx+qz*fz,l=Math.abs(qx*fz-qz*fx);if(f>0&&f<(S.zf||S.hd)+4&&l<S.hw+1.4)sp=0}
  want=rev?-sp:sp;if(wh)stT=vhCL32(err*1.5*(rev?-1:1),-(C.steer||.6),C.steer||.6);else yrT=vhCL32(err*1.8,-C.turn,C.turn)}
 else if(A.face!==null&&!wh&&v.alive){const err=vhAD32(g.rotation.y,A.face);if(Math.abs(err)>.05)yrT=vhCL32(err*1.8,-C.turn,C.turn)}
 /* atasco: quiere moverse y no avanza → marcha atrás girando hacia el lado libre */
 A.lpt+=dt;if(A.lpt>=1){A.lpt=0;const mv=Math.hypot(p.x-A.lx,p.z-A.lz);A.lx=p.x;A.lz=p.z;if(A.rec<=0&&A.tx!==null&&Math.abs(A.spd)>.5&&mv<.3&&A.hT<=0){A.sc++;if(A.sc>=2){A.sc=0;vhUnstick32(v,C)}}else A.sc=0}
 const v0=v.v,up=Math.abs(want)>Math.abs(v.v)&&(want*v.v>=0||Math.abs(v.v)<.05),ra=up?C.acc:C.brake;v.v+=vhCL32(want-v.v,-ra*dt,ra*dt);v.st=want;
 if(wh){v.steerA+=vhCL32(stT-v.steerA,-1.6*dt,1.6*dt);v.yr=vhCL32(v.v*Math.tan(v.steerA)/(S.wb||3),-C.turn,C.turn)}else{v.yr+=(yrT-v.yr)*Math.min(1,dt*4);v.steerA=0}
 if(Math.abs(v.v)>.005||Math.abs(v.yr)>.005){g.rotation.y+=v.yr*dt;p.x+=Math.sin(g.rotation.y)*v.v*dt;p.z+=Math.cos(g.rotation.y)*v.v*dt;vhCollide32(v)}
 vhAnim32(v,dt,v0,wh)}
function vhUnstick32(v,C){const A=v.ai,S=v.spec,h=v.g.rotation.y,fwd=A.spd>=0;A.recD=fwd?-1:1;const back=fwd?h+Math.PI:h,off=fwd?(-(S.zb||-S.hd)-S.hw):((S.zf||S.hd)-S.hw);
 const fl=vhProbe32(v,back+.9,8,S.hw+.3,off),fr=vhProbe32(v,back-.9,8,S.hw+.3,off),fb=vhProbe32(v,back,6,S.hw+.25,off);
 /* lado al que quiere quedar mirando: el más libre por delante */const l=vhProbe32(v,h+1.1,10,S.hw+.4,0),r=vhProbe32(v,h-1.1,10,S.hw+.4,0);A.recS=l>=r?1:-1;
 if(fb<1.2&&fl<1.2&&fr<1.2){A.recD=-A.recD}A.rec=1.6+R()*1.2;A.sT=0;VEH32.dbg.stuck++;A.stk.push(time);while(A.stk.length&&time-A.stk[0]>40)A.stk.shift();
 if(A.stk.length>=4&&v.path&&!v.arrived){A.stk.length=0;VEH32.dbg.giveup++;const last=v.pi>=v.path.length-1&&!v.loop;if(last){v.arrived=true;if(v.onEnd)try{v.onEnd(v)}catch(e){console.warn(e)}}else v.pi++}}
function vhDrive32(v,dt){const C=vhC32(v);if(!C||v.type==='ship'||v.train||C.tactics==='static'||v.ai32===false)return vhDriveOld32(v,dt);
 const A=vhAI32(v);A.th-=dt;if(A.th<=0){A.th+=.25;vhThink32(v,C,.25);A.hist[A.st]=(A.hist[A.st]||0)+1}vhMove32(v,dt,C)}
/* ---------- órdenes ---------- */
function vehOrder32(v,o){if(!v)return v;o=o||{};const A=vhAI32(v),m=o.mode||'advance';A.mode=m;if(o.cls&&VEH32.cls[o.cls]){v.clsK=o.cls;v.cls=VEH32.cls[o.cls]}
 if(o.path&&o.path.length)vehPath32(v,o.path,{speed:o.speed,loop:m==='patrol'||!!o.loop,onEnd:o.onEnd});else if(o.goal&&m!=='retreat')vehPath32(v,[o.goal],{speed:o.speed,onEnd:o.onEnd});else if(m==='hold'){v.path=null;v.arrived=true}
 if(o.speed)v.vmax=o.speed;A.mode=m;
 if(m==='retreat'){const C=vhC32(v)||VEH32.cls.truck;if(o.goal){A.rg=[VEH32.X+o.goal[0],o.goal[1]];A.st='retreat';A.t=0;A.revT=0;v.path=null}else{const p=v.g.position;vhRetreat32(v,C,A.foe?A.fx:p.x+Math.sin(v.g.rotation.y)*30,A.foe?A.fz:p.z+Math.cos(v.g.rotation.y)*30)}}
 else{A.st=vhOrdS32(A);A.t=0}A.th=0;return v}
function vhPushP32(v,dt){const o=v.ob;if(!o)return;const q=P.g.position;if(q.y>o.h-.3)return;const dx=q.x-o.x,dz=q.z-o.z,px=o.hw+.45-Math.abs(dx),pz=o.hd+.45-Math.abs(dz);if(px<=0||pz<=0)return;
 if(px<pz)q.x+=Math.sign(dx||1)*px;else q.z+=Math.sign(dz||1)*pz;if(Math.abs(v.v)>2.5&&(!v.ht||time-v.ht>1.2)){v.ht=time;hitP(Math.abs(v.v)*(v.type==='loco'||v.type==='wagon'?9:4))}}
function vhFx32(v,dt){const p=v.g.position,S=v.spec;v.smT2=(v.smT2||0)-dt;if(v.smT2>0)return;
 if(v.alive){if(v.hp<v.maxhp*.45&&v.type!=='gun'&&v.type!=='mortar'){v.smT2=v.hp<v.maxhp*.2?.18:.35;smoke(p.x+(R()-.5)*S.hw,p.y+S.h*.8,p.z+(R()-.5)*S.hd*.5,1.6,3,v.hp<v.maxhp*.2?0x1e1c1a:0x4a4844,1.4,.5);if(v.hp<v.maxhp*.2&&R()<.4)burst(p.x,p.y+S.h*.7,p.z,0xffa040,2,.4,2)}else v.smT2=.5;
  if(v.type==='ship'&&S.stacks){v.smT2=.55;if(vhCamVol32(p.x,p.z,1400)>0)for(const s of S.stacks){vh_ve32.set(s[0],s[1],s[2]).applyMatrix4(v.g.matrixWorld);smoke(vh_ve32.x,vh_ve32.y,vh_ve32.z,3.5,6,0x2a2a2c,2,.5)}}}
 else if(v.ws>0){v.ws-=.5;v.smT2=.5;smoke(p.x+(R()-.5)*S.hw,p.y+S.h*.6,p.z+(R()-.5)*S.hd*.6,v.type==='ship'?9:3,v.type==='ship'?9:5,0x161514,2,.6)}else v.smT2=2}
function vehUpd32(dt){if(typeof time!=='undefined'){if(time===VEH32.lt)return;VEH32.lt=time}dt=Math.min(dt||0,.05);if(!dt)return;
 VEH32.losN=0;vhNoGo17();vhGrid32();vhSmokeUpd32(dt);
 for(const tr of VEH32.trains)vhTrainUpd32(tr,dt);
 let near=null,nd=70;
 for(const v of VEH32.list){if(!v.on)continue;if(!v.train)vhDrive32(v,dt);if(v.type==='ship'&&!v.alive){v.g.position.y=Math.max(VEH32.seaY-vhSink32(v),v.g.position.y-dt*.15);v.g.rotation.z=Math.min(.12,v.g.rotation.z+dt*.004)}
  if(v.ob&&(Math.abs(v.v)>.01||Math.abs(v.yr)>.001||v.train))vhObUpd32(v);if(v.ob)vhPushP32(v,dt);
  for(const m of v.mounts)vhMountUpd32(v,m,dt);vhFx32(v,dt);
  if(v.alive&&v.type!=='gun'&&v.type!=='mortar'&&v.type!=='wagon'){const d=Math.hypot(v.g.position.x-cam.position.x,v.g.position.z-cam.position.z);if(d<nd){nd=d;near=v}}}
 if(near){VEH32.snT-=dt;if(!(VEH32.snT>0)){VEH32.snT=.24;const vv=1-nd/70,sp=Math.abs(near.v);if(near.type==='loco')nz18(.01,.2,'lowpass',500,200,.015*vv);else tn18('sawtooth',(near.type==='tank'?34:46)+sp*5,30,.26,(.018+Math.min(.02,sp*.004))*vv)}}
 vhShUpd32(dt)}
function vhSink32(v){return v.spec.h*.6}
/* ---------- trenes por la vía x = −20 ---------- */
function trainRun32(cars,fromZ,toZ,speed,opts){opts=opts||{};const dir=toZ<fromZ?-1:1,tr={cars:[],z:fromZ,z0:fromZ,z1:toZ,dir,v:opts.v0||0,vmax:speed||8,x:VEH32.X+(opts.x===undefined?-20:opts.x),on:true,done:false,onEnd:opts.onEnd||null,ang:0,ch:0,idle:0,offs:[]};
 let acc=0;for(let c of cars){if(typeof c==='string')c=c==='loco'?loco32():wagon32(c,opts.side);const S=c.spec;tr.offs.push(acc+S.zf);acc+=S.zf-S.zb+.35;c.train=tr;tr.cars.push(c);if(!c.on)vehSpawn32(c,tr.x-VEH32.X,fromZ,dir<0?Math.PI:0)}
 tr.len=acc;vhTrainPlace32(tr);VEH32.trains.push(tr);const l=tr.cars[0];if(l&&l.type==='loco'){const vv=vhCamVol32(tr.x,fromZ,400);if(vv>.02){tn18('sine',640,630,1.1,.07*vv);tn18('sine',800,790,1.1,.05*vv)}}return tr}
function vhTrainPlace32(tr){for(let i=0;i<tr.cars.length;i++){const c=tr.cars[i],g=c.g;g.position.x=tr.x;g.position.z=tr.z-tr.dir*tr.offs[i];g.position.y=vhFlo32(tr.x,g.position.z)+VEH32.railY;g.rotation.y=tr.dir<0?Math.PI:0;c.v=tr.v}}
function vhTrainUpd32(tr,dt){if(!tr.on)return;const loco=tr.cars[0],dead=loco&&!loco.alive,rem=(tr.z1-tr.z)*tr.dir;let want=dead||tr.hold?0:tr.vmax;if(rem<=0)want=0;else want=Math.min(want,Math.sqrt(2*.7*rem)+.1);
 tr.v+=vhCL32(want-tr.v,-.9*dt,.55*dt);if(tr.v<0)tr.v=0;tr.z+=tr.dir*tr.v*dt;if(!tr.done&&(rem<=.2||(dead&&tr.v<.05))){tr.done=true;tr.v=0;if(tr.onEnd)try{tr.onEnd(tr)}catch(e){console.warn(e)}}
 vhTrainPlace32(tr);const da=tr.v*dt;for(const c of tr.cars)for(let i=0;i<c.wh.length;i++)c.wh[i].rotation.x+=da/c.whr[i];
 if(!loco||loco.type!=='loco')return;tr.ang+=da/.72;for(const r of loco.rods){const ph=r.name==='rodR'?0:1.5708;r.position.y=.72+Math.sin(tr.ang+ph)*.26;r.position.z=1.5+Math.cos(tr.ang+ph)*.26}
 if(dead)return;const ch=Math.floor(tr.ang*2/Math.PI);vh_ve32.set(0,4.1,4.95).applyMatrix4(loco.g.matrixWorld);
 if(ch!==tr.ch&&tr.v>.2){tr.ch=ch;smoke(vh_ve32.x,vh_ve32.y,vh_ve32.z,1.6+tr.v*.12,3.5,0xd4d4d0,2.6,.55);if(R()<.4)smoke(loco.g.position.x+(R()-.5)*2,.6,loco.g.position.z,1.2,1.4,0xe8e8e8,.4,.4);const vv=vhCamVol32(vh_ve32.x,vh_ve32.z,160);if(vv>.02)nz18(.005,.22,'bandpass',900,260,.06*vv)}
 else if(tr.v<=.2){tr.idle-=dt;if(tr.idle<=0){tr.idle=.9;smoke(vh_ve32.x,vh_ve32.y,vh_ve32.z,1.2,3,0xc8c8c4,1.4,.4)}}}
/* ---------- bombardeo naval entrante ---------- */
function navalShell32(x,z,opts){opts=opts||{};const wx=VEH32.X+x,k=opts.k||1.8,y=opts.y!==undefined?opts.y:vhFlo32(wx,z);return vhShot32('naval',wx+220,170,z+(R()-.5)*80,wx,y,z,1.9,0,k,opts.side||'veyrn',opts.dmg||110,opts.r||11,null,null,true,opts.delay||0)}
/* ---------- limpieza entre niveles ---------- */
function vhVehClear32(){for(const v of VEH32.list){if(v.g.parent)v.g.parent.remove(v.g);v.on=false;if(v.ob){const i=obstB.indexOf(v.ob);if(i>=0)obstB.splice(i,1);v.ob=null}if(v.hit&&typeof HIT9!=='undefined'){const i=HIT9.indexOf(v.hit);if(i>=0)HIT9.splice(i,1);v.hit=null}
  for(const f of v.fires){f.g.visible=false;if(f.g.parent)f.g.parent.remove(f.g);const i=FIRES.indexOf(f);if(i>=0)FIRES.splice(i,1)}v.fires.length=0}
 VEH32.list.length=0;VEH32.trains.length=0;VEH32.noGo.length=0;VEH32.smk.length=0;VEH32.ng17=false;VEH32.X=X17;VG32.n=-1;for(const s of vhSH32){s.on=false;if(s.m)s.m.visible=false}}
{const _c=clearStage;clearStage=function(){try{vhVehClear32()}catch(e){console.warn(e)}return _c.apply(this,arguments)}}
Object.assign(VEH32,{vehOrder32,vehNoGo32,order:vehOrder32,noGoBox:vehNoGo32,overlap:vhOverlap32,grid:vhGrid32,
 origin:x0=>{VEH32.X=+x0||0;VG32.n=-1;return VEH32},armcar32,tank32,truck32,loco32,wagon32,fieldgun32,atgun32,mortar32,ship32,vehSpawn32,vehPath32,vehUpd32,trainRun32,navalShell32,clear:vhVehClear32,dmg:vhVehDmg32,kill:vhVehKill32,impact:vhImpact32,
 world:(x,z)=>[VEH32.X+x,z],local:(x,z)=>[x-VEH32.X,z],near:(x,z,r,side)=>VEH32.list.filter(v=>v.on&&v.alive&&(side===undefined||v.side===vhSide32(side))&&Math.hypot(v.g.position.x-VEH32.X-x,v.g.position.z-z)<r)});
