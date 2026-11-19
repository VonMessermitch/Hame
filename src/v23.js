/* =====================================================================
   v23 · OPERACIÓN CIELO DE ACERO — asalto aerotransportado (Eisenmark 1922)
   Nivel interno 12. Base aeronaval de Falkenhorst → cepelín clase Kaiser →
   interceptación → dracos y dragón → ciudad industrial → bombardeo →
   derribo → evacuación → paracaídas.
   Técnica: el cepelín (góndola jugable) permanece fijo en el mundo y todo el
   paisaje (base, campos, nubes, ciudad) vive en el grupo WORLD12, que se
   desplaza y desciende para simular el vuelo. Aviones y criaturas vuelan en
   coordenadas de mundo alrededor de la formación.
   ===================================================================== */
const X12=33000;
const L12={built:false,ph:0,st:0,t:0,T:0,cp:[X12+20,30],work:null,D:0,alt:0,spd:0,hull:100,eng:[100,100,100,100],belt:250,belts:3,heat:0,jam:0,prog:0,inside:false,sit:false};
const AIR12=[],BOMB12=[],FLAK12=[];let WORLD12=null,ZEP12=null;
const ZC={gray:0x5e6a72,iron:0x4a5258,blue:0x2e3e58,gar:0x7a1a24,brass:0xb08a30,wood:0x5a3e26,dk:0x1e2226};
/* ---------- aviones: caza biplano, bombardero bimotor, avión de ataque biplaza ---------- */
function mkPlane12(kind,side){const g=new T.Group(),q=PB(),own=side==='a',C=own?(kind==='bomb'?0x4e5a62:0x5a6670):(kind==='att'?0x5a5a3a:0x6a5a3a),D=shade(C,.7),M=own?ZC.gar:0x9a2a1a,big=kind==='bomb',s=big?2.2:kind==='att'?1.25:1;
 pBox(q,.9*s,.9*s,5*s,C,0,0,0);pBox(q,.7*s,.6*s,1.4*s,D,0,.05*s,-3*s);pa(q,gCone(.45*s,.9*s,8),0x2a2a2a,0,0,2.95*s,1.5708);pBox(q,.6*s,.25*s,.8*s,0x1a1a1a,0,.55*s,.6*s);
 for(const y of[-.45,.95]){pBox(q,8.4*s,.1*s,1.3*s,C,0,y*s,.6*s);pBox(q,8.45*s,.11*s,.25*s,M,0,y*s,1.2*s)}for(const x of[-2.6,2.6])for(const z of[.2,1])pBox(q,.06*s,1.4*s,.06*s,0x2a2a2a,x*s,.25*s,z*s);for(const x of[-1,1])pBox(q,.04*s,1.6*s,.04*s,0x6a6a6a,x*1.8*s,.25*s,.6*s,0,0,x*.6);
 pBox(q,3*s,.08*s,.9*s,C,0,.1*s,-3.4*s);pBox(q,.08*s,1.1*s,.9*s,M,0,.6*s,-3.4*s);for(const x of[-.6,.6])pBox(q,.06*s,.9*s,.06*s,0x2a2a2a,x*s,-.8*s,1.2*s);pCyl(q,.25*s,.25*s,.12*s,0x111111,-.6*s,-1.25*s,1.2*s,0,0,1.5708,8);pCyl(q,.25*s,.25*s,.12*s,0x111111,.6*s,-1.25*s,1.2*s,0,0,1.5708,8);
 if(own){for(const x of[-3,3])pBox(q,.9*s,.02*s,.9*s,0x111111,x*s,1.01*s,.6*s);pBox(q,.6*s,.6*s,.02*s,0xd8d0c0,0,.6*s,-3.86*s)}else for(const x of[-3,3]){pBox(q,.9*s,.02*s,.25*s,0xd8d0c0,x*s,1.01*s,.6*s);pBox(q,.25*s,.02*s,.9*s,0xd8d0c0,x*s,1.01*s,.6*s)}
 if(big){for(const x of[-2.2,2.2]){pCyl(q,.45*s,.45*s,1.6*s,D,x*s,.25*s,.9*s,1.5708,0,0,8)}pBox(q,.7*s,.1*s,1.6*s,0x2a2a2a,0,-.46*s,-.4*s)}if(kind==='att'||big)pa(q,gTor(.35*s,.05*s,4,10),0x2a2a2a,0,.6*s,-1.4*s,1.5708,0,0);
 pbMesh(q,g,VCV);const props=[];const px=big?[-2.2*s,2.2*s]:[0];for(const x of px){const p=new T.Group();p.position.set(x,big?.25*s:0,(big?1.75:3.42)*s);const pq=PB();pBox(pq,.12*s,2.4*s*(big?.7:1),.06*s,0x3a2a1a,0,0,0);pbMesh(pq,p,VCV);g.add(p);props.push(p)}
 const bay=new T.Group();bay.position.set(0,-.5*s,-.4*s);g.add(bay);g.userData={props,bay,s};scene.add(g);return g}
/* ---------- dracos voladores y dragón de guerra ---------- */
function mkFly12(kind){const g=new T.Group(),S=kind==='dragon'?3.4:kind==='arm'?1.25:.9,C=kind==='dragon'?0x3a2a24:kind==='arm'?0x3a3a34:0x4a3a2c,D=shade(C,.6);const bd=new T.Group();g.add(bd);
 {const q=PB();pa(q,gSph(1,10,8),C,0,0,0,0,0,0,.9,.8,2);for(let i=0;i<6;i++)pa(q,gCone(.12,.5,4),0xc8b890,0,.8,1.4-i*.5,-.3);pa(q,gSph(.6,8,6),C,0,.1,2.2,0,0,0,.7,.65,1.3);pBox(q,.5,.35,.9,D,0,.15,3.1);for(const s of[-1,1]){pa(q,gCone(.08,.6,5),0xe8e0c0,s*.22,.45,2.9,-1,0,s*.3);pBox(q,.12,.08,.06,0xffa020,s*.25,.25,3.45)}
  for(let i=0;i<4;i++)pa(q,gCyl(.4-i*.08,.3-i*.07,1.2,6),C,0,-.05,-1.9-i*1.05,1.5708,0,0);pa(q,gCone(.3,.8,4),D,0,0,-6.2,-1.5708);
  if(kind!=='small'){for(let i=0;i<5;i++)pBox(q,1.1,.12,.5,0x5a5e62,0,.82,.9-i*.5);pBox(q,1.4,.6,.1,0x5a5e62,0,.1,1.8,.2)}if(kind==='dragon'){for(const s of[-1,1])for(const z of[1,-1]){pBox(q,.4,1.2,.4,C,s*.7,-.9,z*.8)}pBox(q,1.3,.5,1.4,0x4a3020,0,1.1,0);pBox(q,1.4,.08,1.5,ZC.gar,0,1.36,0);pBox(q,.4,.5,.3,0x2a2a26,0,1.6,.3)}
  pbMesh(q,bd,VCM)}
 const W=[];for(const s of[-1,1]){const w=new T.Group();w.position.set(s*.6,.4,.4);bd.add(w);const q=PB();pBox(q,4,.06,.5,D,s*2,0,.2);for(let i=0;i<4;i++)pBox(q,.08,.07,2.4-i*.4,0x2a2018,s*(1+i*.95),0,-.9+i*.1);pa(q,gCyl(.01,.01,.01,3),D,0,0,0);pbMesh(q,w,VCM);const m=new T.Mesh(new T.PlaneGeometry(4,2.6),new T.MeshLambertMaterial({color:shade(C,.85),side:T.DoubleSide,transparent:true,opacity:.92}));m.rotation.x=-1.5708;m.position.set(s*2,-.02,-.9);w.add(m);W.push(w)}
 g.scale.setScalar(S);g.userData={W,bd,S};scene.add(g);return g}
/* ---------- cepelín clase Kaiser: casco, góndolas de motor, hélices, góndola jugable ---------- */
function mkZep12(){const Z=new T.Group();scene.add(Z);const X=X12,HY=22;
 /* casco: estructura segmentada de tela reforzada, anillos, quilla, aletas, emblema */
 {const q=PB();const L=150,R_=14;for(let i=0;i<20;i++){const z=-L/2+L*(i+.5)/20,k=Math.sin(Math.PI*(i+.5)/20),r=R_*Math.pow(k,.55);pCyl(q,r,r,L/20+.05,i%2?ZC.gray:shade(ZC.gray,.94),0,0,z,1.5708,0,0,18);pCyl(q,r+.06,r+.06,.25,ZC.iron,0,0,z-L/40,1.5708,0,0,18)}
  for(let i=0;i<14;i++){const a=i/14*6.283;pBox(q,.12,.12,138,ZC.iron,Math.cos(a)*13.2,Math.sin(a)*13.2,0)}pBox(q,2.4,1.4,140,shade(ZC.iron,.8),0,-13.4,0);
  for(const [rx,ry] of[[0,1],[0,-1],[1,0],[-1,0]])pBox(q,rx?10:.5,ry?10:.5,16,ZC.blue,rx*8,ry*8,68);for(const s of[-1,1]){pCyl(q,4.2,4.2,.15,0xe8e0d0,s*13.9,2,-20,0,0,1.5708,20);pCyl(q,3.4,3.4,.16,ZC.gar,s*13.95,2,-20,0,0,1.5708,20);pBox(q,.17,4.4,.9,0x1a1a1a,s*14,2,-20);pBox(q,.17,.9,4.4,0x1a1a1a,s*14,2,-20)}
  pBox(q,.4,22,.4,ZC.iron,0,0,-76);pBox(q,2,.3,6,ZC.blue,0,13.9,-40);pbMesh(q,Z,VCV)}
 /* góndolas de motor con hélices animadas y luces de navegación */
 const ENG=[];for(const [x,z] of[[-15,-30],[15,-30],[-15,26],[15,26]]){const e=new T.Group();e.position.set(X+x,HY-10,z);Z.add(e);const q=PB();pa(q,gSph(1.6,10,8),ZC.iron,0,0,0,0,0,0,1,1,2.6);pBox(q,.3,4,.3,ZC.dk,-Math.sign(x)*1.2,2.2,0,0,0,Math.sign(x)*.45);pBox(q,.3,4,.3,ZC.dk,-Math.sign(x)*1.2,2.2,-2,0,0,Math.sign(x)*.45);pCyl(q,.2,.25,1.2,0x2a2a2a,0,-.6,-3.6,1.5708,0,0,8);pbMesh(q,e,VCV);
  const pr=new T.Group();pr.position.set(0,0,-4.4);e.add(pr);{const p=PB();pBox(p,.3,5.2,.15,0x4a3020,0,0,0);pBox(p,5.2,.3,.15,0x4a3020,0,0,0);pCyl(p,.35,.35,.4,0x2a2a2a,0,0,0,1.5708,0,0,10);pbMesh(p,pr,VCV)}ENG.push({g:e,pr,x:X+x,z,hp:100,smk:0})}
 for(const [x,c] of[[-14.2,0xff2020],[14.2,0x20ff40]]){const l=new T.Mesh(gSph(.35,6,5),new T.MeshBasicMaterial({color:c}));l.position.set(X+x,HY,-10);Z.add(l)}
 Z.children[0].position.set(X,HY,0);
 /* puntales y cables de la góndola, escalerillas y pasarelas exteriores */
 {const q=PB();for(const s of[-1,1])for(const z of[-18,-6,6,18]){pBox(q,.18,4,.18,ZC.dk,X+s*3,7.6,z,0,0,-s*.25)}pBox(q,1.2,.12,40,ZC.iron,X,5.9,0);for(let i=0;i<10;i++)pBox(q,.8,.06,.12,0x6a6a6a,X+3.6,7.4,-12+i*.4,0,0,.4);pbMesh(q,Z,VCV)}
 return{Z,ENG,HY}}
/* góndola de mando/tropa: interior jugable (cubierta a 1,5 m), paredes con ventanas, puertas, bancos,
   radio, mapa, munición, puestos de MG, escalera a escotilla, bodega de bombas con suelo de cristal */
function mkGondola12(){const X=X12,F=1.5,H=4,W=3.3,Lz=22,G={glass:[],bayDoors:[],lamps:[],bombs:[]};const q=PB(),wd=ZC.wood,st=ZC.iron;
 pBox(q,W*2+.4,.3,Lz+.2+18.1,0x3a3028,X,F-.15,(Lz+.2-18.1)/2);pBox(q,W*2+.4,.3,1.1,0x3a3028,X,F-.15,-21.65);for(const s of[-1,1])pBox(q,W-1+.2,.3,3,0x3a3028,X+s*(1+(W-1+.2)/2),F-.15,-19.6);for(let z=-Lz;z<Lz;z+=1.1)if(z<-21.2||z>-18)pBox(q,W*2-.2,.02,.06,0x2a2018,X,F+.01,z);pBox(q,W*2+.4,.25,Lz*2+.4,ZC.blue,X,F+H+.12,0);pa(q,gCyl(W+.3,W+.3,Lz*2+.4,10),ZC.blue,X,F+H+.1,0,1.5708,0,0,1,1,.35);
 /* bajo la cubierta: casco de la góndola y bodega de bombas */
 pBox(q,W*2+.2,1.2,Lz+17.8,ZC.gray,X,F-.9,(Lz-17.8)/2);pBox(q,W*2+.2,1.2,.8,ZC.gray,X,F-.9,-21.6);for(const s of[-1,1])pBox(q,W-1.1+.1,1.2,3.4,ZC.gray,X+s*(1.1+(W-1.1+.1)/2),F-.9,-19.5);for(const s of[-1,1])pBox(q,.05,1.2,3.4,0x2a2a2a,X+s*1.12,F-.9,-19.5);pBox(q,2.24,1.2,.05,0x2a2a2a,X,F-.9,-17.82);pBox(q,2.24,1.2,.05,0x2a2a2a,X,F-.9,-21.18);pa(q,gCone(W+.1,4,10),ZC.gray,X,F+1.6,-Lz-2,-1.5708,0,0,1,1,.8);pa(q,gCone(W+.1,3,10),ZC.gray,X,F+1.6,Lz+1.5,1.5708,0,0,1,1,.8);
 /* paredes: tramos macizos, ventanas con marco de latón, troneras de MG, puerta de embarque (dcha.) y de emergencia (izda.) */
 const win=[];const WALL=(sd,z0,z1)=>{for(let z=z0;z<z1-.01;z+=4){const z2=Math.min(z1,z+4),L=z2-z,c=(z+z2)/2;pBox(q,.2,1.3,L,st,X+sd*W,F+.65,c);pBox(q,.2,1.2,L,st,X+sd*W,F+H-.6,c);if(L>2.6){pBox(q,.2,1.5,.6,st,X+sd*W,F+2.05,z+.3);pBox(q,.2,1.5,.6,st,X+sd*W,F+2.05,z2-.3);pBox(q,.26,.08,L-1.2,ZC.brass,X+sd*W,F+1.3,c);pBox(q,.26,.08,L-1.2,ZC.brass,X+sd*W,F+2.8,c);pBox(q,.26,1.5,.06,ZC.brass,X+sd*W,F+2.05,c);win.push([X+sd*(W-.02),c,sd,L-1.2])}else pBox(q,.2,1.5,L,st,X+sd*W,F+2.05,c)}};
 const SOL=(sd,z0,z1)=>pBox(q,.2,H,z1-z0,st,X+sd*W,F+H/2,(z0+z1)/2);
 for(const sd of[-1,1]){WALL(sd,-8,sd>0?11.2:22);pBox(q,.2,1.1,4,st,X+sd*W,F+.55,-10);pBox(q,.2,1,4,st,X+sd*W,F+H-.5,-10);pBox(q,.26,.08,4,ZC.dk,X+sd*W,F+1.12,-10);WALL(sd,sd<0?-19.2:-22,-12)}
 SOL(1,12.8,22);pBox(q,.2,1.4,1.6,st,X+W,F+H-.7,12);SOL(-1,-22,-20.8);pBox(q,.2,1.6,1.6,st,X-W,F+H-.8,-20);
 for(const z of[-Lz,Lz]){pBox(q,W*2,H,.2,st,X,F+H/2,z)}pBox(q,2.6,1.4,.22,0x0c1218,X,F+2.3,-Lz-.02,0,0x0a1018);
 /* tabiques: munición (z>15) y bodega (z<−16) con vanos de paso */
 for(const z of[15,-16]){pBox(q,2,H,.15,st,X-2.3,F+H/2,z);pBox(q,2,H,.15,st,X+2.3,F+H/2,z);pBox(q,2.6,.8,.15,st,X,F+H-.4,z)}
 /* bancos, ganchos, fusiles, macutos */
 for(const s of[-1,1]){const bl=s>0?6:10,bc=s>0?7.5:9.5;pBox(q,.7,.12,bl,wd,X+s*2.7,F+.55,bc);for(let z=bc-bl/2+.5;z<=bc+bl/2-.4;z+=3)pBox(q,.6,.5,.06,st,X+s*2.7,F+.3,z);pBox(q,.1,.9,bl,wd,X+s*3.12,F+1.1,bc);for(let z=bc-bl/2+.5;z<=bc+bl/2-.4;z+=1.8){pBox(q,.25,.4,.3,0x5a4a30,X+s*3.05,F+2.6,z);pBox(q,.04,1.1,.04,0x3a2818,X+s*3.08,F+2,z+.5,0,0,s*.1)}}
 /* puesto de radio, mesa de mapas, lámparas, cables, válvulas e instrumentos */
 pBox(q,1,.9,1.6,0x4a4a40,X-2.6,F+.45,-2);pBox(q,.9,.6,1.2,0x3a3e38,X-2.6,F+1.25,-2);for(let i=0;i<4;i++)pCyl(q,.06,.06,.05,0xd8d0b0,X-2.15,F+1.2+(i%2)*.2,-2.4+(i>>1)*.5,0,0,1.5708,8);pCyl(q,.02,.02,1.6,0x1a1a1a,X-2.9,F+2.3,-2,0,0,0,4);
 pBox(q,1.4,.08,1,wd,X+1.6,F+1,-6);for(const a of[-1,1])for(const b of[-1,1])pBox(q,.08,1,.08,0x3a2818,X+1.6+a*.6,F+.5,-6+b*.4);pBox(q,1.3,.02,.9,0xd8c8a0,X+1.6,F+1.05,-6);
 for(let z=-20;z<=20;z+=5){pBox(q,.04,.04,4.6,0x2a2a2a,X+2.9,F+H-.2,z);pCyl(q,.06,.06,4.6,0x6a5a3a,X-2.9,F+H-.35,z,1.5708,0,0,6);pa(q,gTor(.12,.03,4,8),0xb02020,X-2.9,F+H-.35,z,0,1.5708,0)}
 for(let i=0;i<6;i++)pCyl(q,.08,.08,.04,0xd8d0b0,X+3.05,F+2.6,-14+i*.25,0,0,1.5708,8);
 /* munición: cajas de cintas, fusibles, extintores */
 for(let i=0;i<6;i++)pBox(q,.8,.5,.6,0x4a5a3a,X-2.5+(i%2)*.9,F+.25+((i>>1)%2)*.5,17+(i>>2)*1.2);pBox(q,.82,.04,.62,0x2a3a2a,X-2.5,F+1.02,17);for(let i=0;i<3;i++)pCyl(q,.14,.14,.6,0xb02020,X+2.9,F+.3,17+i*.6,0,0,0,8);
 /* escalera hacia la escotilla superior */
 for(let i=0;i<10;i++)pBox(q,.6,.05,.05,0x6a6a6a,X+2.6,F+.3+i*.38,-13.5);for(const a of[-1,1])pBox(q,.05,3.9,.05,0x6a6a6a,X+2.6+a*.3,F+1.95,-13.5);pBox(q,.9,.12,.9,0x3a3a36,X+2.6,F+H+.05,-13.5);
 /* bodega: palancas de lanzamiento, mira de bombardeo y suelo de cristal */
 pBox(q,.6,1.1,.4,0x3a3a36,X-1.6,F+.55,-19);for(let i=0;i<3;i++)pBox(q,.04,.5,.04,0xb02020,X-1.75+i*.15,F+1.3,-19,.3);pCyl(q,.12,.15,1,0x2a2a2a,X+1.2,F+.9,-19,0,0,0,8);for(const s of[-1,1]){pBox(q,.1,.06,3.2,ZC.brass,X+s*1.05,F+.03,-19.6);pBox(q,2.2,.06,.1,ZC.brass,X,F+.03,-19.6+s*1.55)}pBox(q,.05,.04,3,ZC.brass,X,F+.02,-19.6);
 pbMesh(q,ZEP12.Z,VCV);
 const gl=new T.MeshBasicMaterial({color:0x9ab8c8,transparent:true,opacity:.18,depthWrite:false});for(const [x,z,s,L] of win){const m=new T.Mesh(gBox(.04,1.4,2.3),gl);m.scale.z=1;m.scale.z=L/2.3;m.position.set(x,F+2.05,z);ZEP12.Z.add(m);G.glass.push({m,x,z,s,ok:true})}
 {const m=new T.Mesh(gBox(2,.04,3),new T.MeshBasicMaterial({color:0x8ab0c0,transparent:true,opacity:.25,depthWrite:false}));m.position.set(X,F+.02,-19.6);ZEP12.Z.add(m)}
 /* bombas en sus soportes, bajo el suelo de cristal; compuertas de la bodega */
 for(let i=0;i<6;i++){const b=new T.Group(),bq=PB();pCyl(bq,.22,.22,1.3,0x3a4038,0,0,0,1.5708,0,0,10);pa(bq,gCone(.22,.4,10),0x3a4038,0,0,.85,1.5708);for(const s of[-1,1])pBox(bq,.02,.3,.25,0x2a2a2a,s*.15,0,-.75);pBox(bq,.46,.04,.15,ZC.gar,0,0,.3);pbMesh(bq,b,VCV);b.position.set(X-.6+(i%2)*1.2,F-.6,-18.6-(i>>1)*.9);ZEP12.Z.add(b);G.bombs.push(b)}
 for(const s of[-1,1]){const d=new T.Group();d.position.set(X+s*1.1,F-1.45,-19.5);ZEP12.Z.add(d);const m=new T.Mesh(gBox(1.1,.08,3.4),new T.MeshLambertMaterial({color:ZC.gray}));m.position.x=-s*.55;d.add(m);G.bayDoors.push({d,s})}
 /* lámparas interiores (alarma roja en la bodega) */
 for(let z=-18;z<=18;z+=6){const l=new T.Mesh(gSph(.12,6,5),new T.MeshBasicMaterial({color:0xffe8a0}));l.position.set(X,F+H-.25,z);ZEP12.Z.add(l);G.lamps.push(l)}G.alarm=new T.Mesh(gSph(.18,8,6),new T.MeshBasicMaterial({color:0x3a0a0a}));G.alarm.position.set(X,F+H-.3,-3);ZEP12.Z.add(G.alarm);
 /* volúmenes de colisión: cubierta, paredes, tabiques, mobiliario, puerta de embarque y de emergencia */
 const ob=[{x:X,z:0,hw:W+.2,hd:Lz+.2,h:F-.45},{x:X,z:-Lz,hw:W,hd:.15,h:F+H},{x:X,z:Lz,hw:W,hd:.15,h:F+H}];
 const seg=(sd,z0,z1,h)=>ob.push({x:X+sd*W,z:(z0+z1)/2,hw:.15,hd:(z1-z0)/2,h});seg(1,-22,-12,F+H);seg(1,-12,-8,F+H);seg(1,-8,11.2,F+H);seg(1,12.8,22,F+H);seg(-1,-22,-20.8,F+H);seg(-1,-19.2,-12,F+H);seg(-1,-12,-8,F+H);seg(-1,-8,22,F+H);
 for(const z of[15,-16]){ob.push({x:X-2.3,z,hw:1,hd:.1,h:F+H},{x:X+2.3,z,hw:1,hd:.1,h:F+H})}ob.push({x:X-2.6,z:-2,hw:.5,hd:.8,h:F+1.6},{x:X+1.6,z:-6,hw:.7,hd:.5,h:F+1.1},{x:X-2.5,z:17.6,hw:.85,hd:1.2,h:F+1},{x:X-1.6,z:-19,hw:.3,hd:.2,h:F+1.1});
 for(const s of[-1,1])ob.push({x:X+s*2.75,z:s>0?7.5:9.5,hw:.35,hd:s>0?3:5,h:F+.17,step:true});
 G.door=new T.Mesh(gBox(.12,2.6,1.6),new T.MeshLambertMaterial({map:woodTex,color:0x8a8a88}));G.door.position.set(X+W+.2,F+1.3,13.65);ZEP12.Z.add(G.door);G.doorOb={x:X+W,z:12,hw:.15,hd:.8,h:F+H};G.exit=new T.Mesh(gBox(.12,2.4,1.6),new T.MeshLambertMaterial({color:ZC.gar}));G.exit.position.set(X-W-.05,F+1.2,-20);ZEP12.Z.add(G.exit);G.exitOb={x:X-W,z:-20,hw:.15,hd:.8,h:F+H};ob.push(G.exitOb);
 G.obs=ob;obstB.push(...ob);G.F=F;return G}
/* =====================================================================
   MUNDO: base de Falkenhorst, paisaje en mosaico, nubes y ciudad
   ===================================================================== */
const BASE12={obs:[],npc:[],props:[],searches:[],bombers:[]};let TILES12=[],CLOUD12=[],CITY12=null;
function cloudTex12(){const c=document.createElement('canvas');c.width=c.height=64;const x=c.getContext('2d');const g=x.createRadialGradient(32,32,4,32,32,31);g.addColorStop(0,'rgba(255,255,255,.95)');g.addColorStop(.6,'rgba(235,238,242,.55)');g.addColorStop(1,'rgba(230,232,236,0)');x.fillStyle=g;x.fillRect(0,0,64,64);x.globalCompositeOperation='destination-in';const m=x.createRadialGradient(32,36,6,32,36,30);m.addColorStop(0,'rgba(0,0,0,1)');m.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=m;x.fillRect(0,0,64,64);x.globalCompositeOperation='source-over';for(let i=0;i<14;i++){const px=12+Math.random()*40,py=20+Math.random()*26,r=6+Math.random()*9,h=x.createRadialGradient(px,py,1,px,py,r);h.addColorStop(0,'rgba(180,186,196,.25)');h.addColorStop(1,'rgba(180,186,196,0)');x.fillStyle=h;x.fillRect(0,0,64,64)}const t=new T.CanvasTexture(c);return t}
function bOb(o){obstB.push(o);BASE12.obs.push(o);return o}
function buildBase12(){const X=X12,W=WORLD12;
 {const N=48,g=new T.PlaneGeometry(3000,3000,N,N);g.rotateX(-1.5708);const pos=g.attributes.position,col=new Float32Array(pos.count*3),c=new T.Color();for(let i=0;i<pos.count;i++){const x=pos.getX(i),z=pos.getZ(i),near=Math.abs(x)<260&&Math.abs(z)<420;c.setHex(near?0x6e6a52:((Math.floor(x/120)+Math.floor(z/150))%3===0?0x5a6a34:(Math.floor(x/90)+Math.floor(z/110))%2?0x6e7a3e:0x8a7e48)).lerp(new T.Color(0x4a5030),R()*.3);col.set([c.r,c.g,c.b],i*3);if(!near)pos.setY(i,(Math.sin(x*.004)+Math.cos(z*.003))*6)}g.setAttribute('color',new T.BufferAttribute(col,3));g.computeVertexNormals();const m=new T.Mesh(g,new T.MeshLambertMaterial({vertexColors:true,map:rt_(sandTex,60,60)}));m.position.set(X,-.02,0);W.add(m)}
 const q=PB(),qd=PB();
 /* pista y apartaderos */ pBox(q,34,.05,520,0x7a6e58,X+40,.02,-160);for(let i=0;i<10;i++)pBox(q,30,.06,14,0x8a8a80,X+40,.04,-40-i*50);for(let i=0;i<20;i++)pBox(q,1.2,.07,8,0xe8e0d0,X+40,.05,-30-i*26);
 /* plataforma de embarque: escalones, barandillas, montacargas */ for(let i=0;i<5;i++){const h=.3*(i+1);pBox(q,1,h,3.4,0x6a5a40,X+8.2-i,h/2,12);if(i)bOb({x:X+8.2-i,z:12,hw:.5,hd:1.7,h:h-.45,step:true})}pBox(q,1,1.5,3.4,0x6a5a40,X+3.9,.75,12);bOb({x:X+3.9,z:12,hw:.5,hd:1.7,h:1.05,step:true});
 for(const s of[-1,1]){pBox(q,4.4,.06,.06,0x8a8a80,X+5.8,1.9,12+s*1.75,0,0,-.25);for(let i=0;i<4;i++)pBox(q,.06,1,.06,0x8a8a80,X+4.2+i*1.2,1.2,12+s*1.75)}bOb({x:X+5.6,z:13.85,hw:2.4,hd:.08,h:2.2});bOb({x:X+5.6,z:10.15,hw:2.4,hd:.08,h:2.2});
 {const x=X+9,z=20;for(const a of[-1,1])for(const b of[-1,1])pBox(q,.15,8,.15,0x3a3a36,x+a*1.2,4,z+b*1.2);pBox(q,2.4,.1,2.4,0x5a5a52,x,2,z);pBox(q,2.6,.3,2.6,0x2a2a26,x,8,z);bOb({x,z,hw:1.3,hd:1.3,h:2})}
 /* amarres: tornos y cables al casco */ for(const [x,z] of[[-22,-50],[22,-50],[-22,50],[22,50]]){pBox(q,2,1.2,2,0x3a3a36,X+x,.6,z);pCyl(q,.6,.6,1.6,0x6a5a3a,X+x,1.5,z,0,0,1.5708,10);bOb({x:X+x,z,hw:1.1,hd:1.1,h:1.4});const L=new T.Line(new T.BufferGeometry().setFromPoints([new T.Vector3(X+x,1.6,z),new T.Vector3(X+x*.45,ZEP12.HY-10,z*.6)]),new T.LineBasicMaterial({color:0x2a2a2a}));W.add(L);BASE12.props.push({cable:L})}
 /* hangar gigante de dirigibles (arco, costillas, puertas corredizas, vigas y grúas) */ {const x=X-130,z=0;pa(q,gCyl(36,36,230,16),0x6a6e70,x,0,z,1.5708,0,0,1,1,1.3);for(let i=0;i<12;i++)pa(q,gTor(36.4,.6,4,16,3.1416),0x3a3e40,x,0,z-110+i*20,0,0,0,1,1.3,1);pBox(q,74,1,232,0x4a4a46,x,.5,z);for(const s of[-1,1]){pBox(q,18,40,1.2,0x5a5e60,x+s*27,20,z-115.5);for(let i=0;i<6;i++)pBox(q,.4,40,1.3,0x3a3e40,x+s*(20+i*3),20,z-115.6)}pBox(q,36,4,1,0x3a3e40,x,44,z-115.5);for(let i=0;i<5;i++)pBox(q,.4,30,.4,0x3a3a36,x-30+i*15,15,z-60+i*30);pBox(q,60,.6,.6,0x3a3a36,x,30,z-60);bOb({x,z,hw:37,hd:116,h:46});
  for(let i=0;i<4;i++){pBox(q,1.2,.6,12,0xc8a020,x-20+i*13,.3,z-122)}}
 /* torre de control: tres plantas, ventanales, cabina acristalada, telescopios, banderas y antenas */ {const x=X+58,z=46;box(10,12,10,0xffffff,x,6,z,W,0,rt_(brickT,3,4));for(let f=0;f<3;f++)for(const s of[-1,1]){pBox(q,7,1.4,.12,0x1a2430,x,2+f*4,z+s*5.02);pBox(q,7.3,.12,.2,0xd8d0c0,x,1.25+f*4,z+s*5.06);pBox(q,.12,1.4,7,0x1a2430,x+s*5.02,2+f*4,z)}pBox(q,11,.4,11,0x4a4a46,x,12.2,z);pBox(q,9,2.6,9,0x9ab8c8,x,13.7,z);pBox(q,10,.4,10,0x3a3a36,x,15.2,z);pCyl(q,.06,.06,7,0x2a2a2a,x+3,18.5,z,0,0,0,4);pBox(q,3,.06,.06,0x2a2a2a,x+3,21,z);for(const s of[-1,1])pCyl(q,.12,.18,1,0x2a2a2a,x+s*3,14,z+4.7,1.2,0,0,8);for(let i=0;i<12;i++)pBox(q,1.4,.2,.8,0x5a4a3a,x+5.7,.1+i*1,z-4+i*.7);bOb({x,z,hw:5,hd:5,h:15});
  for(const s of[-1,1]){pCyl(q,.08,.08,10,0x8a8a80,x+s*6,5,z+6.5,0,0,0,6);pBox(q,2.2,1.4,.04,ZC.blue,x+s*6+1.15,9.2,z+6.5);pBox(q,2.2,.35,.05,ZC.gar,x+s*6+1.15,9.6,z+6.5)}}
 /* cuartel, comedor, taller, depósitos, municiones */ box(32,5,10,0xffffff,X+75,2.5,96,W,0,rt_(brickT,8,2));pBox(q,33,.4,11,0x3a3028,X+75,5.3,96);for(let i=0;i<8;i++){pBox(q,1.4,1.6,.1,0x1a2430,X+62+i*3.8,2.6,90.95);pBox(q,1.6,.12,.2,0xd8d0c0,X+62+i*3.8,1.7,90.9)}pBox(q,1.8,2.6,.12,0x3a2818,X+75,1.3,90.94);bOb({x:X+75,z:96,hw:16,hd:5,h:5.5});
 box(18,4,9,0xffffff,X+30,2,112,W,0,rt_(woodTex,5,1));pBox(q,19,.3,10,0x3a3028,X+30,4.2,112);bOb({x:X+30,z:112,hw:9,hd:4.5,h:4.5});
 {const x=X-55,z=70;pBox(q,26,.3,14,0x3a3028,x,6,z);for(const a of[-1,1])for(let i=0;i<4;i++)pBox(q,.3,6,.3,0x4a3a2a,x-12+i*8,3,z+a*6.8);for(let i=0;i<4;i++){pBox(q,1.4,1,2.4,0x2a2a2a,x-9+i*6,1.3,z);pCyl(q,.5,.5,2.6,0x4a4a46,x-9+i*6,1.3,z,1.5708,0,0,10);pBox(q,.4,.8,.4,0x3a3a36,x-9+i*6,.4,z);pBox(q,3,.1,1,0x5a4630,x-9+i*6,1,z+4);for(let k=0;k<3;k++)pBox(q,.1,.05,.4,0x8a8a80,x-10+i*6+k*.5,1.08,z+4)}pCyl(q,1.2,1.2,2.4,0x3a4a3a,x+14,1.2,z-4,0,0,1.5708,12);bOb({x:x+14,z:z-4,hw:1.3,hd:1.3,h:2.4})}
 for(let i=0;i<3;i++){pCyl(q,4,4,6,0x8a8478,X+95,3,-20-i*11,0,0,0,14);pCyl(q,4.1,4.1,.2,0x4a4a42,X+95,4.5,-20-i*11,0,0,0,14);pBox(q,1.5,.5,.1,0xc02020,X+95,3.5,-15.9-i*11);bOb({x:X+95,z:-20-i*11,hw:4,hd:4,h:6})}
 {const x=X-48,z=-48;for(let i=0;i<12;i++){pBox(q,1.6,.9,1,0x4a5a3a,x-6+(i%4)*2,.45+Math.floor(i/8)*.9,z-3+Math.floor((i%8)/4)*1.6);pBox(q,1,.2,.02,0xd8c060,x-6+(i%4)*2,.5,z-2.49+Math.floor((i%8)/4)*1.6)}for(let i=0;i<4;i++){pCyl(q,.4,.4,3,0x3a4038,x+6,.6+i*.85,z,1.5708,0,0,10);pa(q,gCone(.4,.7,10),0x3a4038,x+6,.6+i*.85,z+1.85,1.5708)}for(const s of[-1,1])pBox(q,16,1.2,.8,0xb8ac88,x,.6,z+s*5.5);bOb({x,z,hw:8,hd:6,h:1.4})}
 /* estación ferroviaria: vía, vagones, locomotora, vagones cisterna */ for(const s of[-.75,.75])pBox(q,.12,.14,800,0x6a6a6a,X+140+s,.1,0);for(let i=0;i<5;i++){const z=-30+i*10;pBox(q,2.8,2.8,8.6,i<2?0x2a2e30:0x5a3a26,X+140,2,z);if(i<2)pCyl(q,1.3,1.3,8.4,0x2a2e30,X+140,2.4,z,1.5708,0,0,12);for(const t of[-3,3])for(const a of[-1,1])pCyl(q,.45,.45,.2,0x1a1a1a,X+140+a*1.1,.45,z+t,0,0,1.5708,8)}{pCyl(q,1.1,1.1,6,0x1e2226,X+140,2.4,-42,1.5708,0,0,12);pBox(q,2.6,2.8,2.6,0x1e2226,X+140,2.8,-37.6);pCyl(q,.35,.4,1.4,0x16191b,X+140,4,-44,0,0,0,10)}bOb({x:X+140,z:-12,hw:1.5,hd:36,h:4});box(10,3.4,6,0xffffff,X+128,1.7,-60,W,0,rt_(brickT,3,1));bOb({x:X+128,z:-60,hw:5,hd:3,h:3.6});
 /* defensa: cañones AA, nidos de MG, reflectores, garitas, alambradas */ for(const [x,z] of[[80,20],[-30,-90],[-90,90]]){pCyl(q,1.4,1.6,.8,0x4a4a42,X+x,.4,z,0,0,0,10);pBox(q,1,1.2,1.4,0x5a5a52,X+x,1.4,z);pCyl(q,.12,.12,3.4,0x2a2a2a,X+x,2.6,z+.8,-.9,0,0,6);for(let i=0;i<8;i++){const a=i/8*6.283;pBox(q,1.2,.9,.8,0xb8ac88,X+x+Math.cos(a)*3.2,.45,z+Math.sin(a)*3.2,0,-a,0)}bOb({x:X+x,z,hw:1.6,hd:1.6,h:2})}
 for(const [x,z] of[[30,-20],[-20,30]]){for(let i=0;i<5;i++){const a=i/5*3.14;pBox(q,1.2,1,.8,0xb8ac88,X+x+Math.cos(a)*2.4,.5,z-Math.sin(a)*2.4,0,a,0)}}
 for(const [x,z] of[[100,60],[-80,-30]]){pCyl(q,.9,.9,.8,0x3a3a36,X+x,.4,z,0,0,0,10);pCyl(q,.7,.7,1,0x5a5a52,X+x,1.3,z,1.5708,0,0,12);const cone=new T.Mesh(new T.ConeGeometry(14,140,16,1,true),new T.MeshBasicMaterial({color:0xfff6d0,transparent:true,opacity:.06,depthWrite:false,side:T.DoubleSide,blending:T.AdditiveBlending}));cone.geometry.translate(0,-70,0);cone.position.set(X+x,1.4,z);W.add(cone);BASE12.searches.push({m:cone,t:R()*6})}
 for(let i=0;i<4;i++){const a=i/4*6.283+.785,x=X+Math.cos(a)*240,z=Math.sin(a)*330;for(const s of[-1,1])for(const t of[-1,1])pBox(qd,.25,7,.25,0x4a3018,x+s,3.5,z+t);pBox(qd,2.6,.2,2.6,0x4a3018,x,7,z);pBox(qd,2.6,1.2,.15,0x5a4030,x,7.7,z+1.3);pa(qd,gCone(2.2,1.4,4),0x3a3028,x,8.9,z,0,.785,0)}
 for(let x=-240;x<=240;x+=8){for(const z of[-330,330]){pBox(qd,.12,1.4,.12,0x4a3018,X+x,.7,z);pBox(qd,8,.03,.03,0x7a7a7a,X+x+4,1.1,z);pBox(qd,8,.03,.03,0x7a7a7a,X+x+4,.6,z)}}for(let z=-330;z<=330;z+=8)for(const x of[-240,240]){pBox(qd,.12,1.4,.12,0x4a3018,X+x,.7,z);pBox(qd,.03,.03,8,0x7a7a7a,X+x,1.1,z+4)}
 /* andamios junto al casco, escaleras móviles, grúa con polea, cables eléctricos */ for(const s of[-1,1]){const x=X+s*16;for(const a of[-1,1])for(const b of[-1,1])pBox(q,.15,10,.15,0x8a8a80,x+a*1.5,5,30+b*1.5);for(let i=1;i<5;i++)pBox(q,3.2,.08,3.2,0x6a5a40,x,i*2.4,30);bOb({x,z:30,hw:1.6,hd:1.6,h:10})}
 {const x=X+20,z=60;pBox(q,1,14,1,0xb89020,x,7,z);pBox(q,14,.8,.8,0xb89020,x+5,14,z);pCyl(q,.03,.03,8,0x1a1a1a,x+11,10,z,0,0,0,4);pBox(q,1.2,1,1.2,0x4a5a3a,x+11,5.6,z);bOb({x,z,hw:.6,hd:.6,h:14})}
 for(let i=0;i<14;i++){const x=X-20+i*6;pCyl(qd,.1,.12,6,0x4a3018,x,3,-12,0,0,0,6);pBox(qd,1.2,.08,.08,0x4a3018,x,5.8,-12);if(i<13)pBox(qd,6,.02,.02,0x1a1a1a,x+3,5.6,-12)}
 /* barriles, bidones, cajas marcadas, carretillas, motores desmontados, bancos, pizarra de rutas, faroles, banderas */
 for(let i=0;i<40;i++){const x=X+(R()-.5)*200,z=(R()-.5)*240;if(Math.abs(x-X)<20&&Math.abs(z)<30)continue;if(Math.abs(x-X+130)<40)continue;const k=R();if(k<.4){for(let j=0;j<3;j++)pCyl(q,.4,.4,1.1,[0x6b4a2a,0x7a3a2a,0x3a4a5a][j],x+j*.85,.55,z,0,0,0,10)}else if(k<.75){pBox(q,1.2,.8,.9,0x6a5a3a,x,.4,z);pBox(q,1.2,.8,.9,0x5a6a3a,x+1.3,.4,z);pBox(q,1.2,.8,.9,0x4a5a3a,x+.6,1.2,z);pBox(q,.8,.2,.02,0xd8c060,x,.45,z+.46)}else{pBox(q,1.4,.25,.9,0x5a4630,x,.55,z);pCyl(q,.25,.25,.1,0x111111,x,.25,z+.5,0,0,1.5708,8);pBox(q,.06,.06,1.4,0x3a2818,x,.7,z-1)}}
 pBox(q,2.4,1.6,.1,0x1a2a1a,X+14,1.8,24);pBox(q,2,.02,.06,0xe8e0d0,X+14,2,24.06,0,0,.3);pBox(q,1.8,.02,.06,0xe8e0d0,X+14,1.6,24.06,0,0,-.2);for(let i=0;i<3;i++)pBox(q,2,.1,.5,0x5a4630,X+16+i*2.5,.5,26);
 for(let i=0;i<10;i++){const x=X-40+i*12,z=i%2?-8:40;pCyl(q,.1,.12,5,0x2a2a2a,x,2.5,z,0,0,0,6);pBox(q,.7,.3,.4,0xffe8a0,x+.3,4.9,z,0,0,0)}for(const [x,z] of[[-10,-15],[10,-15],[0,120]]){pCyl(q,.08,.08,11,0x8a8a80,X+x,5.5,z,0,0,0,6);pBox(q,2.6,1.6,.04,ZC.blue,X+x+1.35,9.8,z);pBox(q,2.6,.4,.05,ZC.gar,X+x+1.35,10.3,z)}
 pbMesh(q,W,VCV);pbMesh(qd,W,VCV);
 /* vehículos: camiones de munición, tractor de remolque */ for(const [x,z,r] of[[12,40,0],[-20,10,1.5708],[60,-10,.4]]){const t=mkTruck16({col:0x4a5048});t.position.set(X+x,0,z);t.rotation.y=r;W.add(t);BASE12.props.push({truck:t,x0:X+x,z0:z});bOb({x:X+x,z,hw:Math.abs(Math.cos(r))*1.3+Math.abs(Math.sin(r))*3,hd:Math.abs(Math.sin(r))*1.3+Math.abs(Math.cos(r))*3,h:3})}
 /* aviones aparcados calentando motores (bombarderos y cazas de escolta) */ for(let i=0;i<3;i++){const p=mkPlane12('bomb','a');p.position.set(X+28+i*18,2.6,-90-i*14);p.rotation.y=Math.PI;W.add(p);BASE12.bombers.push(p);bOb({x:p.position.x,z:p.position.z,hw:9,hd:5,h:4})}for(let i=0;i<4;i++){const p=mkPlane12('fight','a');p.position.set(X+20+i*9,1.3,-140);p.rotation.y=Math.PI;W.add(p);BASE12.bombers.push(p)}
 /* tripulación de tierra y tropa */ const NP=(x,z,o)=>{const n=npc11(X+x,z,o);n.lv=12;W.add(n.g);BASE12.npc.push(n);return n};
  for(let i=0;i<4;i++)NP(-58+i*6,74,{act:i%2?'crouch':'clean',tools:true,f:0,name:'Mecánico'});for(let i=0;i<3;i++)NP(26+i*18,-82-i*14,{act:'argue',f:Math.PI,name:'Piloto',hat:'cap'});
 NP(-42,-40,{act:'smoke',cig:true,f:0});NP(-40,-41,{act:'smokesit',cig:true,f:-2});NP(70,90,{act:'clean',gun:'r',f:0});NP(72,90,{act:'eat',f:0});
 {const loop=[[-200,-300],[200,-300],[200,300],[-200,300]];for(let i=0;i<3;i++){const n=NP(-200+i*2,-300,{hat:'helm',hatC:EIS.helm,gun:'r',act:'march',path:loop.map(p=>[X+p[0],p[1]]),sp:1.5});n.pi=1}}
 for(let i=0;i<4;i++){const n=NP(10+i*2,50,{act:'run',f:Math.PI});n.path=[[X+10+i*2,50],[X+10+i*2,-30],[X+40,-80]];n.sp=3.5;n.act='run'}}
/* paisaje: mosaicos de campos, bosques, pueblos, ríos y ferrocarril que se reciclan durante el vuelo */
function mkTile12(k){const g=new T.Group(),X=X12,S=1600;{const N=24,geo=new T.PlaneGeometry(S*1.7,S,N,N);geo.rotateX(-1.5708);const pos=geo.attributes.position,col=new Float32Array(pos.count*3),c=new T.Color();for(let i=0;i<pos.count;i++){const x=pos.getX(i),z=pos.getZ(i);c.setHex([0x5a6a34,0x6e7a3e,0x8a7e48,0x4a5a2a,0x7a6a3a][(Math.floor((x+k*37)/140)*3+Math.floor((z+k*91)/170))%5&4|0]).lerp(new T.Color(0x3a4a28),R()*.25);col.set([c.r,c.g,c.b],i*3);pos.setY(i,(Math.sin(x*.004+k)+Math.cos(z*.0035))*14)}geo.setAttribute('color',new T.BufferAttribute(col,3));geo.computeVertexNormals();g.add(new T.Mesh(geo,new T.MeshLambertMaterial({vertexColors:true})))}
 const q=PB();pBox(q,8,.5,S,0x6a5e48,(R()-.5)*600,1,0);pBox(q,1.4,.6,S,0x4a4a46,(R()-.5)*900,1.2,0);pBox(q,30,.4,S,0x3a5a7a,(R()-.5)*1200,.6,0,0,.3,0);
 for(let v=0;v<5;v++){const vx=(R()-.5)*1300,vz=(R()-.5)*1300;for(let h=0;h<14;h++){const x=vx+(R()-.5)*90,z=vz+(R()-.5)*90,w=6+R()*6;pBox(q,w,4+R()*3,w*.8,0xd8ccb0,x,3,z);pBox(q,w+.6,1.6,w*.8+.6,0x8a3a2a,x,6.2,z)}pCyl(q,2,2,16,0xc8bca0,vx,8,vz,0,0,0,8);pa(q,gCone(2.4,6,8),0x6a3a2a,vx,19,vz)}
 pbMesh(q,g,VCV);{const N=160,im=new T.InstancedMesh(new T.ConeGeometry(5,16,6),new T.MeshLambertMaterial({color:0x1e3020}),N),m=new T.Matrix4();for(let i=0;i<N;i++){const cx=((i/40)|0),x=(R()-.5)*1500+cx*0,z=(R()-.5)*1500,s=.7+R()*.8;m.makeScale(s,s,s);m.setPosition(x,8*s+3,z);im.setMatrixAt(i,m)}g.add(im)}
 g.position.set(X12,0,-1500-S*(k+.5));WORLD12.add(g);return g}
function mkClouds12(){const tex=cloudTex12(),mat=new T.SpriteMaterial({map:tex,transparent:true,opacity:.62,depthWrite:false,fog:true,color:0xd4d8dc});for(let c=0;c<26;c++){const cx=X12+(R()-.5)*1500,cy=160+R()*220,cz=-R()*3400,n=3+(R()*4|0);for(let i=0;i<n;i++){const m=new T.Sprite(mat.clone());const s=50+R()*90;m.scale.set(s*1.5,s*.6,1);m.position.set(cx+(R()-.5)*120,cy+(R()-.5)*14,cz+(R()-.5)*90);WORLD12.add(m);CLOUD12.push(m)}}}
/* ciudad industrial fortificada: murallas, fábricas, chimeneas, estación, depósitos, arsenal, puente, refinería, puerto, AA, torres, barrios */
function buildCity12(zc){const C=new T.Group();C.position.set(X12,0,zc);WORLD12.add(C);CITY12=C;const q=PB(),q2=PB();
 pBox(q,2800,1,3000,0x55603a,0,-.8,0);for(let i=0;i<30;i++)pBox(q,60+R()*120,1,60+R()*140,[0x6a6a3e,0x4a5a2e,0x7a6e44][i%3],(R()-.5)*2400,-.6,(R()-.5)*2800);pBox(q,900,1,900,0x5a5a52,0,0,0);pBox(q,60,1.2,900,0x3a5a7a,-260,.2,0);for(let a=0;a<24;a++){const t=a/24*6.283,r=330;pBox(q,90,14,8,0x8a7e68,Math.cos(t)*r,7,Math.sin(t)*r,0,-t+1.5708,0);if(a%3===0){pCyl(q,9,10,22,0x7a6e58,Math.cos(t)*r,11,Math.sin(t)*r,0,0,0,10);pa(q,gCone(10,8,10),0x5a3a2a,Math.cos(t)*r,26,Math.sin(t)*r)}}
 for(let i=0;i<260;i++){const x=(R()-.5)*600,z=(R()-.5)*600;if(Math.hypot(x,z)>310||Math.abs(x+260)<40)continue;const w=6+R()*8,h=5+R()*10;pBox(q2,w,h,w*.9,[0xb8ac90,0xa89c80,0x9a8e78][i%3],x,h/2,z);pBox(q2,w+.6,1.4,w+.6,0x6a3a2a,x,h+.7,z)}
 const T_={};
 {const x=60,z=40;for(let i=0;i<5;i++){pBox(q,22,10,60,0x6a5e50,x+i*26,5,z);for(let k=0;k<6;k++)pBox(q,22,2.4,.4,0x3a3a36,x+i*26,11,z-27+k*10.5,.6)}for(let i=0;i<6;i++)pCyl(q,2.2,3,40,0x7a4a3a,x-10+i*24,20,z+40,0,0,0,10);T_.fab={x:x+50,z,y:10,r:70}}
 {const x=-120,z=120;for(const s of[-1.4,-.47,.47,1.4])pBox(q,.4,.2,500,0x6a6a6a,x+s*4,.7,z-100);for(let i=0;i<8;i++){pBox(q,3,3,9,0x5a3a26,x,2.4,z-20-i*11);pBox(q,3,3,9,0x2a2e30,x+8,2.4,z-30-i*11)}pBox(q,30,12,70,0x7a6a58,x+30,6,z-30);pa(q,gCyl(16,16,70,10),0x4a5a62,x+30,12,z-30,1.5708,0,0,1,1,.5);T_.rail={x:x+15,z:z-50,y:5,r:50}}
 {const x=150,z=-120;for(let i=0;i<6;i++){pCyl(q,12,12,16,0xb8b0a0,x+(i%3)*30,8,z-(i>>1|0)*0+(i>2?30:0),0,0,0,16);pa(q,gCone(12,3,16),0x9a9488,x+(i%3)*30,17.5,z+(i>2?30:0))}pBox(q,90,.6,2,0x4a4a42,x+30,4,z+15);T_.fuel={x:x+30,z:z+15,y:8,r:45}}
 {const x=-60,z=-150;pBox(q,70,14,50,0x6a6050,x,7,z);for(const s of[-1,1])for(const t of[-1,1])pCyl(q,6,7,20,0x5a5040,x+s*35,10,z+t*25,0,0,0,8);for(let i=0;i<6;i++)pBox(q,8,6,8,0x5a5040,x-25+i*10,17,z);T_.ars={x,z,y:12,r:40}}
 {const x=-260,z=-40;C.userData.br=new T.Group();C.userData.br.position.set(x,0,z);C.add(C.userData.br);const b=PB();pBox(b,70,3,14,0x6a6a62,0,14,0);for(let i=0;i<5;i++)pBox(b,1,10,14,0x3a3a36,-30+i*15,19,0);pbMesh(b,C.userData.br,VCV);for(const s of[-1,1])pBox(q,8,14,16,0x7a7060,x+s*40,7,z);T_.bridge={x,z,y:14,r:35}}
 {const x=-180,z=-230;for(let i=0;i<4;i++){pCyl(q,4,5,40,0x8a8a82,x+i*14,20,z,0,0,0,10);for(let k=0;k<5;k++)pCyl(q,5,5,.6,0x4a4a42,x+i*14,6+k*8,z,0,0,0,10)}for(let i=0;i<3;i++){pBox(q,60,8,14,0x4a4a46,-300,4,-260+i*40);pBox(q,40,6,12,0x5a3a2a,-330,3,-260+i*40)}}
 for(const [x,z] of[[0,-60],[100,180],[-150,20],[200,0]])pCyl(q,.6,1,60,0x2a2a2a,x,30,z,0,0,0,6);
 const AA=[];for(const [x,z] of[[40,-60],[-100,-60],[90,140],[-20,170],[180,60],[-140,140]]){pCyl(q,4,4.5,2,0x4a4a42,x,1,z,0,0,0,10);pBox(q,1.4,1.6,2,0x5a5a52,x,2.8,z);pCyl(q,.2,.2,5,0x2a2a2a,x,4.5,z+1.2,-.8,0,0,6);AA.push({x,z})}T_.aa={x:40,z:-60,y:3,r:20};
 pbMesh(q,C,VCV);pbMesh(q2,C,VCV);{const N=420,im=new T.InstancedMesh(new T.ConeGeometry(5,15,6),new T.MeshLambertMaterial({color:0x1f3420}),N),m=new T.Matrix4();for(let i=0;i<N;i++){const band=i<300,a=band?(R()-.5)*1.4+Math.PI:R()*6.283,r=band?520+R()*260:420+R()*900,s=.8+R()*.7;m.makeScale(s,s,s);m.setPosition(Math.sin(a)*r*(band?1.6:1),7*s,-Math.cos(a)*r);im.setMatrixAt(i,m)}C.add(im)}C.userData.T=T_;C.userData.AA=AA;C.userData.chim=[[50,80],[74,80],[98,80],[122,80],[146,80],[170,80]];
 const SL=[];for(const [x,z] of[[0,0],[-80,80],[120,-40],[60,160]]){const cone=new T.Mesh(new T.ConeGeometry(18,320,16,1,true),new T.MeshBasicMaterial({color:0xfff6d0,transparent:true,opacity:.07,depthWrite:false,side:T.DoubleSide,blending:T.AdditiveBlending}));cone.geometry.translate(0,-160,0);cone.position.set(x,2,z);C.add(cone);SL.push({m:cone,t:R()*6})}C.userData.SL=SL;return C}
function buildWorld12(){if(L12.built)return;L12.built=true;WORLD12=new T.Group();scene.add(WORLD12);{const m=new T.Mesh(new T.PlaneGeometry(40000,40000),new T.MeshLambertMaterial({color:0x56603c}));m.rotation.x=-1.5708;m.position.set(X12,-22,-15000);WORLD12.add(m);L12.far=m}ZEP12=mkZep12();ZEP12.G=mkGondola12();buildBase12();for(let k=0;k<3;k++)TILES12.push(mkTile12(k));mkClouds12();
 const mg=[mkMG08(X12+2.75,-10,1.5,12),mkMG08(X12-2.75,-10,1.5,12)];mg[0].out=Math.PI/2;mg[1].out=-Math.PI/2;mg[0].y0=-Math.PI/2;mg[1].y0=Math.PI/2;mg[0].g.rotation.y=Math.PI/2;mg[1].g.rotation.y=-Math.PI/2;for(const m of mg)ZEP12.Z.add(m.g);L12.mg=mg}
/* =====================================================================
   SISTEMAS DE VUELO: marco relativo al cepelín, explosiones grandes, bombas
   ===================================================================== */
const V12=new T.Vector3(),V12b=new T.Vector3(),V12c=new T.Vector3();
const angD12=(a,b)=>{let d=(a-b)%(6.2832);if(d>Math.PI)d-=6.2832;if(d<-Math.PI)d+=6.2832;return d};
function fbTex12(){const c=document.createElement('canvas');c.width=c.height=64;const x=c.getContext('2d'),g=x.createRadialGradient(32,32,2,32,32,31);g.addColorStop(0,'rgba(255,250,220,1)');g.addColorStop(.3,'rgba(255,180,60,.9)');g.addColorStop(.7,'rgba(200,60,10,.45)');g.addColorStop(1,'rgba(80,20,0,0)');x.fillStyle=g;x.fillRect(0,0,64,64);return new T.CanvasTexture(c)}
const FB12=[];let fbI12=0;
function fbInit12(){if(FB12.length)return;const tex=fbTex12();for(let i=0;i<48;i++){const s=new T.Sprite(new T.SpriteMaterial({map:tex,transparent:true,blending:T.AdditiveBlending,depthWrite:false,fog:false}));s.visible=false;scene.add(s);FB12.push({s,t:0,d:1,k:1,vy:0})}
 const rg=new T.Mesh(new T.RingGeometry(.8,1,32),new T.MeshBasicMaterial({color:0xfff0d0,transparent:true,opacity:0,side:T.DoubleSide,depthWrite:false}));rg.rotation.x=-1.5708;scene.add(rg);L12.ring={m:rg,t:9}}
/* bola de fuego (tamaño en metros), visible a cientos de metros */
function fb12(x,y,z,k,d,vy){const f=FB12[fbI12];fbI12=(fbI12+1)%FB12.length;if(!f)return;f.s.position.set(x,y,z);f.t=0;f.d=d||1;f.k=k;f.vy=vy||0;f.s.visible=true;f.s.material.rotation=R()*6.28}
function fbUpd12(dt){for(const f of FB12){if(!f.s.visible)continue;f.t+=dt;const u=f.t/f.d;if(u>=1){f.s.visible=false;continue}f.s.scale.setScalar(f.k*(.3+Math.sqrt(u)*.9));f.s.material.opacity=1-u*u;f.s.position.y+=f.vy*dt}
 const r=L12.ring;if(r&&r.t<1.6){r.t+=dt;r.m.scale.setScalar(4+r.t*r.k);r.m.material.opacity=Math.max(0,.7*(1-r.t/1.6))}}
/* explosión de gran escala con variantes: 'fuel' (bola enorme y humo negro), 'ars' (cadena de secundarias),
   'rail' (fragmentos y vagones), 'aa' (fogonazo y munición), 'bridge' (polvo y derrumbe), 'air' (aeronave) */
function bx12(x,y,z,k,kind){k=k||1;const big=k>1.5;fb12(x,y+4*k,z,22*k,1.1+k*.25,6);fb12(x+(R()-.5)*8*k,y+2*k,z+(R()-.5)*8*k,14*k,.8,3);
 smoke(x,y+6*k,z,26*k,9+k*2,kind==='fuel'?0x101010:0x3a3632,5*k,.75);smoke(x+(R()-.5)*12*k,y+3*k,z+(R()-.5)*12*k,18*k,7,0x5a524a,3*k,.6);
 burst(x,y+2,z,0xffa040,Math.min(40,12*k|0),1.4,24*k);burst(x,y+2,z,0x2a2018,Math.min(30,10*k|0),2,18*k);flashLight(x,y+10,z,9*k,.5,0xffb060);
 if(big&&L12.ring){L12.ring.m.position.set(x,y+1,z);L12.ring.t=0;L12.ring.k=60*k}
 if(kind==='fuel'){for(let i=0;i<4;i++)later12(.25+i*.35,()=>fb12(x+(R()-.5)*30,y+10+i*8,z+(R()-.5)*30,30+R()*20,1.6,9))}
 if(kind==='ars'){for(let i=0;i<7;i++)later12(.4+i*.45+R()*.3,()=>{const a=x+(R()-.5)*60,b=z+(R()-.5)*50;fb12(a,y+4,b,12+R()*14,.9,4);burst(a,y+3,b,0xffe080,10,1,26);snd12boom(a,b,.6)})}
 if(kind==='aa'){for(let i=0;i<10;i++)later12(i*.18,()=>burst(x+(R()-.5)*10,y+3,z+(R()-.5)*10,0xffe0a0,6,.8,30))}
 snd12boom(x,z,k)}
function snd12boom(x,z,k){if(!ac||!sndOK())return;const d=Math.hypot(x-cam.position.x,z-cam.position.z),v=clamp(1-d/1600,0,1)*Math.min(1.4,k);if(v<.03)return;const dl=Math.min(3,d/340);nz18(.01,2.2,'lowpass',500*(.4+v*.6),60,.55*v,dl);tn18('sine',55,20,1.6,.5*v,dl)}
function later12(t,f){(L12.tq||(L12.tq=[])).push({t,f})}
/* bombas en caída libre (del cepelín o de los bombarderos): impactan en el suelo, sobre la ciudad */
function dropBomb12(x,y,z,vz,mesh,tgt){let m=mesh;if(!m){m=new T.Group();const q=PB();pCyl(q,.3,.3,1.6,0x3a4038,0,0,0,1.5708,0,0,8);pa(q,gCone(.3,.5,8),0x3a4038,0,0,1.05,1.5708);for(const s of[-1,1])pBox(q,.02,.4,.3,0x2a2a2a,s*.18,0,-.9);pbMesh(q,m,VCV);scene.add(m)}else{const w=new T.Vector3();m.getWorldPosition(w);m.parent.remove(m);scene.add(m);m.position.copy(w);x=w.x;y=w.y;z=w.z}
 m.position.set(x,y,z);BOMB12.push({m,v:new T.Vector3((R()-.5)*.6,-1,vz||0),tgt,t:0})}
function bombUpd12(dt){const gy=-L12.alt+(CITY12?CITY12.position.y:0)+1;for(let i=BOMB12.length-1;i>=0;i--){const b=BOMB12[i];b.t+=dt;b.v.y-=9.8*dt;b.v.z+=(L12.spd-b.v.z)*Math.min(1,dt*.5);b.m.position.addScaledVector(b.v,dt);b.m.lookAt(b.m.position.x+b.v.x,b.m.position.y+b.v.y,b.m.position.z+b.v.z);
 if(b.m.position.y<=gy||b.t>14){const p=b.m.position;scene.remove(b.m);BOMB12.splice(i,1);if(b.t<14)bx12(p.x,gy,p.z,1.1+R()*.5,b.tgt||'gen')}}}
/* =====================================================================
   COMBATE AÉREO: cazas, aviones de ataque, dracos, dragón, escolta y bombarderos
   ===================================================================== */
const AIRK={fight:{hp:55,spd:64,r:4.5,sc:150},att:{hp:120,spd:50,r:5.5,sc:220},bomb:{hp:420,spd:34,r:10,sc:0},small:{hp:40,spd:44,r:3.2,sc:120},arm:{hp:150,spd:36,r:4.2,sc:250},dragon:{hp:1600,spd:34,r:12,sc:1500}};
function air12(kind,side,o){o=o||{};const fly=kind==='small'||kind==='arm'||kind==='dragon',g=fly?mkFly12(kind):mkPlane12(kind,side),K=AIRK[kind];
 const a={g,kind,side,fly,hp:K.hp,mx:K.hp,spd:K.spd*(o.sk||1),r:K.r,st:o.st||'inbound',t:0,cd:1+R()*2,p:g.position,v:new T.Vector3(),off:o.off||null,tp:null,tb:null,bank:0,ph:R()*6,smk:0,id:R()};
 if(o.pos)g.position.copy(o.pos);else{const an=o.an!==undefined?o.an:(R()-.5)*2.4,d=o.d||820;g.position.set(X12+Math.sin(an)*d,o.y!==undefined?o.y:(R()-.35)*90,-Math.cos(an)*d)}
 a.v.set(X12-a.p.x,4-a.p.y,-a.p.z).setLength(a.spd);if(o.v)a.v.copy(o.v);if(side==='e')a.tp=tgtPt12(a);AIR12.push(a);return a}
function tgtPt12(a){const k=R(),Z=ZEP12;a.tb=null;
 if(a.kind==='arm'){const E=Z.ENG.filter(e=>e.hp>0);const e=E.length?E[R()*E.length|0]:Z.ENG[R()*4|0];a.eng=e;return new T.Vector3(e.x,Z.HY-10,e.z)}
 if(a.kind==='small'){a.sd=R()<.5?1:-1;return new T.Vector3(X12+a.sd*3.6,3.2,-12+R()*20)}
 if(k<.18){const B=AIR12.filter(b=>b.side==='a'&&b.kind==='bomb'&&b.st==='form');if(B.length){a.tb=B[R()*B.length|0];return a.tb.p}}
 if(k<.55||a.kind==='dragon')return new T.Vector3(X12+(R()-.5)*16,Z.HY+(R()-.3)*14,(R()-.5)*110);
 a.sd=R()<.5?1:-1;return new T.Vector3(X12+a.sd*3.4,3,(R()-.6)*34)}
function steer12(a,tx,ty,tz,turn,dt){V12.set(tx-a.p.x,ty-a.p.y,tz-a.p.z);if(V12.lengthSq()<1e-4)return;V12.setLength(a.spd);const ox=a.v.x,oz=a.v.z;a.v.lerp(V12,Math.min(1,turn*dt)).setLength(a.spd);const cr=(ox*a.v.z-oz*a.v.x)/(a.spd*a.spd*Math.max(dt,.001));a.bank+=(clamp(-cr*1.4,-1.1,1.1)-a.bank)*Math.min(1,dt*3)}
function exposed12(sd){if(P.mg&&curMG&&Math.sign(curMG.x-X12)===sd)return 1;const p=P.g.position;if(!L12.sit&&Math.abs(p.x-(X12+sd*3.3))<1.3&&p.z>-15&&p.z<15)return .5;return 0}
/* ráfaga contra el cepelín, la góndola o un bombardero: trazadoras, chispas, impactos metálicos */
function shoot12(a,T_){const p=a.p,fw=V12c.copy(a.v).normalize(),n=a.fly?0:4;const o=V12b.copy(p).addScaledVector(fw,a.r);
 if(a.fly){if(a.kind==='dragon'){for(let i=0;i<8;i++){const u=i/8;later12(u*.5,()=>{const q=o.clone().lerp(T_,u);fb12(q.x,q.y,q.z,3+u*7,.5,0)})}later12(.5,()=>{fb12(T_.x,T_.y,T_.z,10,.8,1);smoke(T_.x,T_.y,T_.z,8,4,0x2a2a2a,1,.6);dmgZep12(T_,8,'fire');roar12(.6)})}return}
 for(let i=0;i<n;i++){const j=T_.clone();j.x+=(R()-.5)*4;j.y+=(R()-.5)*3;j.z+=(R()-.5)*5;trc16(o.clone(),j,a.side==='e'?0xffa040:0xffe090)}
 npcShot('mg',p.x,p.z);const d=p.distanceTo(T_);later12(Math.min(.6,d/500),()=>{if(level!==12)return;if(a.tb){a.tb.hp-=a.kind==='att'?22:12;burst(T_.x,T_.y,T_.z,0xffd890,6,.3,6);if(a.tb.hp<=0&&a.tb.st!=='down')down12(a.tb,'e');return}
  for(let i=0;i<3;i++)burst(T_.x+(R()-.5)*3,T_.y+(R()-.5)*2,T_.z+(R()-.5)*4,0xffd890,3,.25,5);dmgZep12(T_,a.kind==='att'?3:1.4,'mg');tn18('square',2400+R()*600,1400,.04,.035);tn18('square',1800,900,.05,.03,.08)})}
/* daño al cepelín: casco, góndolas de motor, ventanas; el jugador solo sufre si está expuesto */
function dmgZep12(T_,v,how){if(L12.ph<1||L12.ph>6)return;L12.hull=Math.max(8,L12.hull-v*.35);const Z=ZEP12;
 for(const e of Z.ENG)if(Math.hypot(T_.x-e.x,T_.z-e.z)<8&&Math.abs(T_.y-(Z.HY-10))<6){e.hp=Math.max(L12.ph>=5?0:12,e.hp-v*2)}
 if(Math.abs(T_.y-3)<4.5&&Math.abs(Math.abs(T_.x-X12)-3.3)<2){const sd=Math.sign(T_.x-X12);const G=ZEP12.G;
  if(R()<.22*v)for(const w of G.glass)if(w.ok&&w.s===sd&&Math.abs(w.z-T_.z)<4){breakGlass12(w);break}
  const e=exposed12(sd);if(e&&R()<.45*e){hitP((how==='fire'?10:4)+R()*4);burst(P.g.position.x,2.8,P.g.position.z,0xffd890,4,.2,4)}
  if(R()<.3)sparks12(X12+sd*3.1,3+R(),T_.z)}}
function breakGlass12(w){w.ok=false;w.m.visible=false;burst(w.x,3.5,w.z,0xcfe8f0,14,.8,5);tn18('triangle',3200,1200,.25,.06);nz18(0,.3,'highpass',3000,2000,.08);L12.broke=(L12.broke||0)+1}
function sparks12(x,y,z){burst(x,y,z,0xffe070,8,.4,6);flashLight(x,y,z,1.5,.12,0xffe0a0);tn18('square',3000,800,.08,.02)}
function roar12(v){nz18(0,1.6,'lowpass',420,90,.25*v);tn18('sawtooth',110,55,1.4,.08*v);tn18('sawtooth',160,70,1.2,.05*v,.1)}
function down12(a,by){if(a.st==='down')return;a.st='down';a.t=0;a.hp=0;a.v.y-=6;a.spin=(R()-.5)*3;burst(a.p.x,a.p.y,a.p.z,0xffa040,14,.8,10);fb12(a.p.x,a.p.y,a.p.z,a.r*2.2,.8,0);
 if(a.side==='e'){L12.kills=(L12.kills||0)+1;if(by==='p'){score+=AIRK[a.kind].sc;L12.pk=(L12.pk||0)+1;feed('★ '+{fight:'Caza enemigo',att:'Avión de ataque',small:'Draco',arm:'Draco blindado',dragon:'DRAGÓN DE GUERRA'}[a.kind]+' derribado');styl&&styl(4)}if(a.fly)roar12(.5)}else{feed('✖ '+(a.kind==='bomb'?'Bombardero propio':'Caza de escolta')+' derribado');if(a.kind==='bomb')L12.bLost=(L12.bLost||0)+1}}
function remAir12(i){const a=AIR12[i];scene.remove(a.g);disp16&&disp16(a.g);AIR12.splice(i,1)}
function airUpd12(dt){const Z=ZEP12,gy=-L12.alt;
 for(let i=AIR12.length-1;i>=0;i--){const a=AIR12[i],p=a.p;a.t+=dt;a.ph+=dt;
  if(a.st==='down'){a.v.y-=9.8*dt;a.v.z+=(L12.spd-a.v.z)*Math.min(1,dt*.4);p.addScaledVector(a.v,dt);a.g.rotateZ(a.spin*dt);a.g.rotateX(.3*dt);a.smk-=dt;if(a.smk<=0){a.smk=.07;smoke(p.x,p.y,p.z,a.r*1.4,4,0x1e1e1e,.5,.7);if(R()<.6)fb12(p.x,p.y,p.z,a.r*.9,.4,0)}
   if(p.y<gy+4||a.t>16){if(p.y<gy+6&&Math.abs(p.z)<1700)bx12(p.x,gy+2,p.z,a.kind==='bomb'||a.kind==='dragon'?2:1,'air');remAir12(i)}continue}
  if(a.st==='leave'){steer12(a,p.x+(p.x-X12)*3,p.y+60,p.z-400,.8,dt);if(Math.hypot(p.x-X12,p.z)>1300)remAir12(i);else{p.addScaledVector(a.v,dt);orient12(a,dt)}continue}
  if(a.side==='e')foeAI12(a,dt);else allyAI12(a,dt);
  if(a.st!=='claw'&&a.st!=='form'&&!a.idle)p.addScaledVector(a.v,dt);
  /* evitar el casco: si se mete dentro de la envolvente, sale despedido */
  const hx=p.x-X12,hy=p.y-Z.HY;if(Math.abs(p.z)<80&&hx*hx+hy*hy<(16+a.r)**2&&a.st!=='claw'){const d=Math.hypot(hx,hy)||1;p.x=X12+hx/d*(16+a.r);p.y=Z.HY+hy/d*(16+a.r);if(a.side==='e'&&a.st==='attack'){a.st='break';a.t=0;a.bp=new T.Vector3(p.x+hx/d*300,p.y+hy/d*120,p.z+(R()-.5)*300)}}
  if(a.idle){V12.set(p.x,p.y,p.z-10);a.g.lookAt(V12);a.g.rotateZ(Math.sin(time*.7+a.ph)*.08)}else if(a.st!=='form')orient12(a,dt);
  if(a.hp<a.mx*.4&&a.side==='e'){a.smk-=dt;if(a.smk<=0){a.smk=.18;smoke(p.x,p.y,p.z,a.r,2.5,0x3a3a3a,.3,.5)}}
  const u=a.g.userData;if(u.props)for(const q of u.props)q.rotation.z+=dt*45;if(u.W){const f=a.kind==='dragon'?2.6:a.kind==='arm'?5:7,s=Math.sin(a.ph*f);u.W[0].rotation.z=s*.65;u.W[1].rotation.z=-s*.65;u.bd.position.y=-s*.15}}}
function orient12(a,dt){V12.copy(a.p).add(a.v);a.g.lookAt(V12);a.g.rotateZ(a.bank)}
function foeAI12(a,dt){const p=a.p;if(a.tb&&(a.tb.st==='down'||!AIR12.includes(a.tb)))a.tp=tgtPt12(a);const T_=a.tb?a.tb.p:a.tp;if(!T_){a.tp=tgtPt12(a);return}const d=p.distanceTo(T_);
 if(L12.flee){a.st='leave';return}
 if(a.kami===1&&d<12){a.kami=0;shake=1.5;damage12(1);sparks12(X12+3.2,4,p.z);for(const w of ZEP12.G.glass)if(w.ok&&w.s>0&&Math.abs(w.z-p.z)<5)breakGlass12(w);bx12(X12+4.5,3,p.z,.3,'gen');say('¡Un draco se estrella contra la góndola y cae bajo el dirigible!',2.2);a.v.set(2,-14,4);down12(a,'x');return}
 if(a.kami===2&&a.tb&&d<a.tb.r+4){const b=a.tb;a.kami=0;bx12(b.p.x,b.p.y,b.p.z,1.1,'air');down12(b,'e');down12(a,'x');radio12('¡Un draco se estrelló contra el Gotha dos! ¡Se va abajo!');return}
 if(a.st==='inbound'){steer12(a,T_.x,T_.y,T_.z,.7,dt);if(d<420)a.st='attack'}
 else if(a.st==='attack'){steer12(a,T_.x,T_.y,T_.z,a.fly?2.2:1.5,dt);a.cd-=dt;V12.copy(T_).sub(p).normalize();const dot=V12.dot(V12c.copy(a.v).normalize());
  if(a.cd<=0&&d<(a.kind==='dragon'?170:300)&&dot>.9&&!(a.kind==='small')){a.cd=a.kind==='dragon'?3.2:a.fly?2.4:.9+R()*.8;shoot12(a,T_)}
  if((a.kind==='small'||a.kind==='arm')&&d<9){a.st='claw';a.t=0;a.cd=.6;roar12(.3)}
  else if(d<(a.kind==='dragon'?45:a.fly?14:34)){a.st='break';a.t=0;const sd=Math.sign(p.x-X12)||1;a.bp=new T.Vector3(p.x+sd*(250+R()*200),p.y+(R()-.4)*160,p.z+(R()-.5)*500);if(!a.fly&&R()<.5)tn18('sawtooth',220,140,1.4,.05)}}
 else if(a.st==='break'){steer12(a,a.bp.x,a.bp.y,a.bp.z,1.2,dt);if(a.t>3.5+R()*2&&Math.hypot(p.x-X12,p.z)>200||a.t>9){a.tp=tgtPt12(a);a.st='attack';a.t=0}}
 else if(a.st==='claw'){/* agarrado a la ventana / al motor: muerde, rasga, golpea */const hold=V12.copy(a.tp);if(a.kind==='small')hold.x+=a.sd*1.8;else hold.y-=2.6;a.p.lerp(hold,Math.min(1,dt*4));a.v.set(Math.sin(a.t*3)*2,0,-1);a.cd-=dt;
  if(a.cd<=0){a.cd=1.1+R()*.6;if(a.kind==='small'){const w=ZEP12.G.glass.find(w=>w.ok&&w.s===a.sd&&Math.abs(w.z-a.tp.z)<3.5);if(w)breakGlass12(w);sparks12(X12+a.sd*3.2,3.4,a.tp.z);const e=exposed12(a.sd);if(e&&Math.abs(P.g.position.z-a.tp.z)<6&&R()<.6)hitP(6+R()*5);tn18('sawtooth',500,160,.25,.06)}else{if(a.eng){a.eng.hp=Math.max(L12.ph>=5?0:10,a.eng.hp-14);sparks12(a.eng.x,Z12HY()-10,a.eng.z)}roar12(.25)}}
  if(a.t>(a.kind==='arm'?14:9)){a.st='break';a.t=0;a.bp=new T.Vector3(p.x+(p.x-X12)*20+(R()-.5)*100,p.y-60,p.z-200)}}
 if(Math.hypot(p.x-X12,p.z)>1400){a.st='inbound';a.tp=tgtPt12(a)}if(p.y<-L12.alt+40&&a.st!=='claw')a.v.y+=dt*30}
const Z12HY=()=>ZEP12.HY;
function allyAI12(a,dt){const p=a.p;
 if(a.kind==='bomb'){const o=a.off;V12.set(X12+o[0]+Math.sin(time*.3+a.ph)*3,o[1]+Math.sin(time*.5+a.ph)*2,o[2]+Math.cos(time*.25+a.ph)*4);if(a.st==='join'){steer12(a,V12.x,V12.y,V12.z,1,dt);if(p.distanceTo(V12)<12)a.st='form'}else{a.st='form';p.lerp(V12,Math.min(1,dt*.8));a.g.rotation.set(Math.sin(time*.4+a.ph)*.03,Math.PI,Math.sin(time*.5+a.ph)*.05)}
  if(a.drop>0){a.drop-=dt;a.dc=(a.dc||0)-dt;if(a.dc<=0){a.dc=.45;dropBomb12(p.x+(R()-.5)*2,p.y-2,p.z,L12.spd*.6,null,a.tg)}a.g.userData.bay.rotation.x=-.8}else a.g.userData.bay.rotation.x=0;return}
 /* caza de escolta: busca enemigos cercanos al cepelín y los persigue; si no hay, vuelve a su puesto */
 a.st2=(a.st2||0)-dt;if(a.st2<=0){a.st2=.8;let b=null,bd=700;for(const e of AIR12){if(e.side!=='e'||e.st==='down'||e.st==='leave')continue;const d=Math.hypot(e.p.x-X12,e.p.z)+e.p.distanceTo(p)*.5;if(d<bd){bd=d;b=e}}a.tgt=b}
 const e=a.tgt&&a.tgt.st!=='down'&&AIR12.includes(a.tgt)?a.tgt:null;
 a.idle=false;if(e){V12b.copy(e.p).addScaledVector(e.v,.6);steer12(a,V12b.x,V12b.y,V12b.z,1.5,dt);a.cd-=dt;const d=p.distanceTo(e.p);V12.copy(e.p).sub(p).normalize();if(a.cd<=0&&d<220&&V12.dot(V12c.copy(a.v).normalize())>.93){a.cd=.7+R()*.6;for(let i=0;i<3;i++){const j=e.p.clone();j.x+=(R()-.5)*4;j.y+=(R()-.5)*3;trc16(p.clone().addScaledVector(V12c,4),j,0xffe090)}npcShot('mg',p.x,p.z);
   const dm=(e.kind==='dragon'?16:e.kind==='arm'?14:22)*(L12.allyK||1);later12(d/600,()=>{if(e.st==='down')return;e.hp-=dm;burst(e.p.x,e.p.y,e.p.z,0xffd890,4,.3,6);if(e.hp<=0){if(e.kind==='dragon'&&!L12.dragonOK){e.hp=60;e.st='break';e.t=0;e.bp=new T.Vector3(e.p.x+300,e.p.y+100,e.p.z-300)}else down12(e,'a')}})}
  if(d<25){a.v.y+=dt*40}}
 else{const o=a.off;V12.set(X12+o[0],o[1],o[2]);const d=p.distanceTo(V12);if(d>22&&!a.idle||d>40)steer12(a,V12.x,V12.y,V12.z,1.2,dt);else{a.idle=true;p.lerp(V12,Math.min(1,dt*.6));a.v.set(0,0,-a.spd);a.bank*=.9}}}
/* =====================================================================
   MG 08 DEL DIRIGIBLE: cinta de 250, recarga manual, recalentamiento, retroceso, casquillos
   ===================================================================== */
const _mgF12=mgFire;mgFire=function(){if(level!==12)return _mgF12();if(P.cd>0||!curMG)return;
 if(L12.rel>0)return;if(L12.jam>0){if(!L12.jm||time-L12.jm>1.4){L12.jm=time;say('¡La MG 08 está al rojo! Esperá a que se enfríe el manguito…',1.4)}return}
 if(L12.belt<=0){P.cd=.3;tn18('square',260,200,.04,.04);if(!L12.em||time-L12.em>1.6){L12.em=time;say(L12.belts>0?'Cinta vacía — R / REC para cambiar la cinta':'Sin cintas — recogé munición en el pañol de popa',1.6)}return}
 const n=bullets.length;_mgF12();if(bullets.length>n){const b=bullets[bullets.length-1];b.life=2.7;b.v.multiplyScalar(1.3);b.dmg=19;L12.belt--;L12.heat=Math.min(1,L12.heat+.0105);
  if(L12.belt%3===0)trc16(b.m.position.clone(),b.m.position.clone().addScaledVector(b.v,2.4),0xffc060);
  const M=curMG,sd=Math.sign(M.x-X12);if(R()<.5)burst(M.x-sd*.2,M.y+1.1,M.z+.3,0xc8a040,1,.6,2);pitch+=(R()-.35)*.006;yaw+=(R()-.5)*.004;M.bar.position.z=-.05;later12(.04,()=>{M.bar.position.z=0});
  if(L12.heat>=1){L12.jam=3.2;say('¡RECALENTADA! La MG 08 echa vapor…',1.8);tn18('sine',2200,1800,.6,.03)}}};
const _umg12=updMG;updMG=function(){if(level===12&&P.mg&&curMG&&curMG.y0!==undefined){const d=clamp(angD12(yaw,curMG.y0),-1.3,1.3);yaw=curMG.y0+d;pitch=clamp(pitch,-.6,.85)}_umg12()};
const _rl12=reload;reload=function(){if(level===12&&P.mg){if(L12.rel>0||L12.belt>=250)return;if(L12.belts<=0){say('No quedan cintas. Corré al pañol de munición (popa) y recogé otra.',2.2);return}L12.rel=2.6;say('Cambiando la cinta…',1.4);tn18('square',300,180,.12,.05);tn18('square',500,300,.08,.05,1.2);tn18('square',900,600,.06,.05,2.3);return}return _rl12()};
function mgUpd12(dt){if(L12.rel>0){L12.rel-=dt;if(L12.rel<=0){L12.belts--;L12.belt=250;say('Cinta lista.',1)}}if(L12.jam>0){L12.jam-=dt;if(R()<dt*8&&curMG)smoke(curMG.x,curMG.y+1.3,curMG.z,.5,1,0xe0e0e0,1,.4)}L12.heat=Math.max(0,L12.heat-dt*(firing&&P.mg?.04:.16))}
/* =====================================================================
   DAÑOS PROGRESIVOS DE LA GÓNDOLA: humo, paneles, chispas, alarma, luces, fuegos, turbulencia
   ===================================================================== */
const CR12=[];
function crate12(x,z,k){const g=new T.Group(),q=PB();if(k==='b'){pCyl(q,.35,.35,.9,0x4a5a3a,0,.45,0,0,0,0,10)}else{pBox(q,.8,.6,.7,0x4a5a3a,0,.3,0);pBox(q,.82,.05,.72,0x2a3a2a,0,.6,0);pBox(q,.5,.15,.02,0xd8c060,0,.35,.36)}pbMesh(q,g,VCV);g.position.set(x,1.5,z);scene.add(g);ZEP12.Z.add(g);CR12.push({g,vx:0,vz:0,r:.45})}
function gondUpd12(dt){const G=ZEP12.G,D=L12.dmg||0,pp=P.g.position;
 /* turbulencia: el mobiliario suelto se desliza con la inclinación y choca contra las paredes; empuja/lo empujás */
 for(const c of CR12){const p=c.g.position;c.vx+=(L12.roll||0)*-14*dt+(L12.turb||0)*(R()-.5)*6*dt;c.vz+=(L12.pitchT||0)*10*dt;p.x+=c.vx*dt;p.z+=c.vz*dt;c.vx*=Math.pow(.25,dt);c.vz*=Math.pow(.25,dt);
  if(Math.abs(p.x-X12)>2.7){p.x=X12+Math.sign(p.x-X12)*2.7;c.vx*=-.3}if(p.z<-21.4||p.z>21.4){p.z=clamp(p.z,-21.4,21.4);c.vz*=-.3}
  const dx=p.x-pp.x,dz=p.z-pp.z,d=Math.hypot(dx,dz);if(d<c.r+.45&&d>1e-3&&Math.abs(pp.y-1.5)<.8){const k=c.r+.45-d;if(Math.hypot(c.vx,c.vz)>3&&!L12.cHit){L12.cHit=1.2;hitP(6);say('¡Cuidado con la carga suelta!',1.2)}p.x+=dx/d*k*.7;p.z+=dz/d*k*.7;pp.x-=dx/d*k*.3;pp.z-=dz/d*k*.3;c.vx+=dx/d*k*4;c.vz+=dz/d*k*4}c.g.rotation.y+=(Math.abs(c.vx)+Math.abs(c.vz))*dt*.3}
 if(L12.cHit>0)L12.cHit-=dt;
 /* luces: parpadeo creciente, algunas se apagan; alarma roja giratoria */
 L12.lt=(L12.lt||0)-dt;if(L12.lt<=0){L12.lt=.08;G.lamps.forEach((l,i)=>{const off=D>=3&&i%3===1||D>=5&&i%2===0;l.visible=!off&&!(D>=2&&R()<.04*D)})}
 const al=L12.alarm;G.alarm.material.color.setHex(al?(Math.sin(time*8)>0?0xff2020:0x3a0a0a):0x3a0a0a);if(L12.redL){L12.redL.intensity=al?(Math.sin(time*8)>0?2.2:.3):0}
 if(al){L12.at=(L12.at||0)-dt;if(L12.at<=0){L12.at=1;tn18('square',720,720,.35,.03);tn18('square',540,540,.35,.03,.45)}}
 /* chispas en conductos, humo que entra por las ventanas rotas, paneles que se desprenden */
 if(D>=1&&R()<dt*D*.8)sparks12(X12+(R()<.5?2.9:-2.9),5.1,(R()-.5)*40);
 if(L12.broke&&R()<dt*Math.min(4,L12.broke)*.6){const w=G.glass.filter(w=>!w.ok);if(w.length){const g=w[R()*w.length|0];smoke(g.x-g.s*.4,3.4,g.z,1.6,2.5,0x6a6a6a,.2,.35)}}
 if(D>=2&&R()<dt*.15*D&&(L12.panels||0)<6){L12.panels=(L12.panels||0)+1;const sd=R()<.5?1:-1,z=(R()-.5)*36;const m=new T.Mesh(gBox(.06,.9,1.2),new T.MeshLambertMaterial({color:ZC.iron}));m.position.set(X12+sd*3.05,4.6,z);scene.add(m);L12.fall=(L12.fall||[]);L12.fall.push({m,vy:0,y0:1.55,rx:(R()-.5)*3});sparks12(m.position.x,4.8,z);tn18('square',400,120,.3,.05)}
 if(L12.fall)for(let i=L12.fall.length-1;i>=0;i--){const f=L12.fall[i];if(f.m.position.y<=f.y0){continue}f.vy-=14*dt;f.m.position.y=Math.max(f.y0,f.m.position.y+f.vy*dt);f.m.rotation.x+=f.rx*dt;if(f.m.position.y<=f.y0){f.m.rotation.x=1.5708;burst(f.m.position.x,1.6,f.m.position.z,0x8a8a80,6,.3,3);tn18('square',260,90,.2,.06);if(f.hit&&Math.hypot(pp.x-f.m.position.x,pp.z-f.m.position.z)<1.1){hitP(14);say('¡Te golpeó un panel!',1.2)}}}
 /* incendios interiores: queman si te metés dentro, pero se pueden rodear */
 if(L12.fires)for(const f of L12.fires){if(Math.hypot(pp.x-f.x,pp.z-f.z)<.75*f.s&&Math.abs(pp.y-1.5)<1){L12.burn=(L12.burn||0)-dt;if(L12.burn<=0){L12.burn=.5;hitP(5);say('¡Quema! Rodeá el fuego.',1)}}}}
function fireIn12(x,z,s){const f=mkFire(x,z,s,1.5);(L12.fires||(L12.fires=[])).push(f);return f}
function damage12(n){L12.dmg=Math.max(L12.dmg||0,n);if(n>=2&&!L12.alarm){L12.alarm=true}}
/* =====================================================================
   TRIPULACIÓN: sargento Brandner, oficial, escuadra, mecánico y radiotelegrafista
   ===================================================================== */
const CREW12=[];
function crew12(){if(L12.crewOK)return;L12.crewOK=true;const X=X12;const NP=(x,z,o)=>{const n=npc11(X+x,z,Object.assign({hat:'helm',hatC:EIS.helm,coat:EIS.coat},o));n.lv=12;CREW12.push(n);return n};
 L12.sgt=NP(9.5,8,{name:'Feldwebel Brandner',rank:2,act:'point',f:1.5708,gun:'r'});L12.off=NP(17,19,{name:'Hauptmann Adler',hat:'cap',hatC:0x2e3440,peak:0x2e3440,officer:true,act:'point',f:-1.5708,mapcase:true});
 const nm=['Kessler','Lenz','Vogt','Hartmann','Ruhl','Brenner'];L12.sq=nm.map((s,i)=>NP(12+i*1.7,5.2,{name:'Soldado '+s,gun:'r',act:'idle',f:-1.5708,pack:true}));
 L12.mech=NP(1.2,-3.2,{name:'Mecánico Ott',hat:'cap',act:'crouch',f:1.5708,tools:true});L12.rad=NP(-1.9,-2,{name:'Radiotelegrafista Falk',hat:'cap',act:'sit',f:-1.5708});L12.rad.g.position.y=1.53;{const st=new T.Mesh(gBox(.45,.45,.45),new T.MeshLambertMaterial({color:ZC.wood}));st.position.set(X-1.85,1.72,-2);ZEP12.Z.add(st)}L12.mech.g.position.y=1.5;
 const seats=[[1,5.5],[1,7.5],[-1,5.5],[-1,7.5],[-1,9.5],[-1,11.5]];L12.sq.forEach((n,i)=>{n.seat=seats[i]});L12.sgt.seat=[-1,13.5];
 for(const n of CREW12)n.g.position.y=n.g.position.y||0;
 for(let i=0;i<3;i++)crate12(X+(i-1)*1.6,18.8+(i%2),i===1?'b':'c');crate12(X-1.2,1,'c');crate12(X+1.4,-9.6,'b')}
function seatPos12(n){const s=n.seat;return[X12+s[0]*2.55,s[1]]}
function board12(n,delay){const s=n.seat,X=X12;n.q=[[X+10.5,12],[X+4.6,12],[X+2.1,12],[X+s[0]*1.5,s[1]],seatPos12(n)];n.wait=delay||0;n.act='walk';n.sp=2.2}
function walk12(n,pts,then,sp){n.q=pts.slice();n.then=then;n.wait=0;n.sp=sp||2.2;n.seated=false;n.act='walk';n.g.rotation.x=0}
function sitNow12(n){const p=seatPos12(n);n.g.position.set(p[0],1.7,p[1]);n.f=n.seat[0]>0?-1.5708:1.5708;n.g.rotation.y=n.f;n.act='sit';n.seated=true;n.q=null}
function crewUpd12(dt){for(const n of CREW12){if(!n.g.visible)continue;const p=n.g.position;
 if(n.q&&n.q.length){if(n.wait>0){n.wait-=dt;n.vx=n.vz=0;continue}const w=n.q[0],dx=w[0]-p.x,dz=w[1]-p.z,d=Math.hypot(dx,dz);if(d<.25){n.q.shift();if(!n.q.length){n.vx=n.vz=0;if(n.seat&&!n.then)sitNow12(n);else{n.act=n.endAct||'idle';if(n.then){const f=n.then;n.then=null;f(n)}}}}else{const v=Math.min(n.sp,d/dt);n.vx=dx/d*v;n.vz=dz/d*v;p.x+=n.vx*dt;p.z+=n.vz*dt;n.f=Math.atan2(dx,dz)}
  if(!n.seated){const fl=floorAt({x:p.x,y:p.y+.3,z:p.z});p.y+=(Math.max(0,fl)-p.y)*Math.min(1,dt*12)}}
 else if(!n.seated&&!n.lying&&!n.out&&L12.ph>=1){p.y=1.5}
 /* fusileros en las ventanas: disparan a los aparatos enemigos de su costado */
 if(n.act==='aim'&&n.sd&&!L9.cine){n.cd=(n.cd||R()*2)-dt;if(n.cd<=0){n.cd=1.6+R()*2;let b=null,bd=260;for(const a of AIR12){if(a.side!=='e'||a.st==='down'||Math.sign(a.p.x-X12)!==n.sd)continue;const d=a.p.distanceTo(p);if(d<bd){bd=d;b=a}}
  if(b){n.look=null;n.f=Math.atan2(b.p.x-p.x,b.p.z-p.z);const o=new T.Vector3(p.x+n.sd*.9,p.y+1.5,p.z);trc16(o,b.p.clone().add(new T.Vector3((R()-.5)*3,(R()-.5)*3,(R()-.5)*3)),0xffe0a0);npcShot('rifle',p.x,p.z);burst(o.x,o.y,o.z,0xffd080,2,.15,2);if(R()<.3){b.hp-=12;if(b.hp<=0&&!(b.kind==='dragon'&&!L12.dragonOK))down12(b,'a')}}else n.f=n.sd>0?-1.5708+1.5708*2:1.5708-1.5708*2}}}}
function toWin12(n,x,z){walk12(n,[[X12+Math.sign(x)*1.2,n.g.position.z],[X12+Math.sign(x)*1.2,z],[X12+x,z]],m=>{m.act='aim';m.sd=Math.sign(x);m.f=m.sd>0?1.5708:-1.5708},2.8)}
/* =====================================================================
   VUELO: movimiento del mundo, mosaicos, nubes, luces, motores, sonido
   ===================================================================== */
function engStart12(){if(!ac||L12.eng0)return;try{const g=ac.createGain();g.gain.value=0;const f=ac.createBiquadFilter();f.type='lowpass';f.frequency.value=260;f.connect(g);g.connect(ac.destination);const os=[];for(const [t,fr] of[['sawtooth',44],['sawtooth',66.5],['triangle',88]]){const o=ac.createOscillator();o.type=t;o.frequency.value=fr;o.connect(f);o.start();os.push(o)}L12.eng0={g,f,os}}catch(e){}}
function engStop12(){const E=L12.eng0;if(!E)return;try{for(const o of E.os)o.stop();E.g.disconnect()}catch(e){}L12.eng0=null}
function engSnd12(){const E=L12.eng0;if(!E||!ac)return;const on=playing&&level===12,alive=ZEP12.ENG.filter(e=>e.hp>0).length,rpm=L12.ph===0?.25:.55+L12.spd/40;let v=on?.045*G.vol*(.5+alive/8)*(L12.ph>=7?.3:1):0;if(L12.sput&&Math.sin(time*7)>.3)v*=.25;E.g.gain.setTargetAtTime(v,ac.currentTime,.3);E.os.forEach((o,i)=>o.frequency.setTargetAtTime([44,66.5,88][i]*rpm*(1+(L12.sput?Math.sin(time*13)*.06:0)),ac.currentTime,.4))}
function flight12(dt){const Z=ZEP12;L12.D+=L12.spd*dt;WORLD12.position.set(0,-L12.alt,L12.D);
 for(const t of TILES12){const wz=t.position.z+L12.D;if(wz-800>1100)t.position.z-=3*1600;t.visible=!(CITY12&&Math.abs(t.position.z+L12.D-(CITY12.position.z+L12.D))<1500)}
 for(const c of CLOUD12){const wz=c.position.z+L12.D;if(wz>700)c.position.z-=3600}
 if(L12.D>2600&&BASE12.vis!==false){BASE12.vis=false;for(const ch of WORLD12.children)if(!TILES12.includes(ch)&&!CLOUD12.includes(ch)&&ch!==CITY12&&ch!==L12.far)ch.visible=false}
 for(const e of Z.ENG){e.pr.rotation.z+=dt*(L12.ph===0?6:e.hp>0?38:3);if(e.hp<55&&L12.ph>=1){e.smk-=dt;if(e.smk<=0){e.smk=e.hp<=0?.06:.16;smoke(e.x,Z.HY-10,e.z+3,e.hp<=0?4:2.4,4,e.hp<=0?0x141414:0x4a4a4a,.6,.7);if(e.hp<=0&&R()<.5)fb12(e.x+(R()-.5)*2,Z.HY-10,e.z+2,4+R()*3,.5,2)}}}
 if(L12.ph>=1&&L12.ph<7&&L12.hull<45&&R()<dt*(45-L12.hull)*.08){const z=(R()-.5)*120;fb12(X12+(R()-.5)*20,Z.HY+R()*10,z,6+R()*6,.8,2);smoke(X12,Z.HY+8,z,10,6,0x1a1a1a,2,.6)}
 for(const s of BASE12.searches){s.t+=dt;s.m.rotation.set(Math.PI+Math.sin(s.t*.4)*.5,0,Math.cos(s.t*.33)*.5)}
 if(CITY12){for(const s of CITY12.userData.SL){s.t+=dt;s.m.rotation.set(Math.PI+Math.sin(s.t*.5)*.45,0,Math.cos(s.t*.37)*.45)}cityFx12(dt)}
 /* inclinación, turbulencia y balanceo (rotación de cámara) */
 L12.roll=(L12.roll||0)+((L12.rollT||0)+(L12.turb?Math.sin(time*1.7)*.03*L12.turb:0)-(L12.roll||0))*Math.min(1,dt*1.5);L12.pitchT=L12.ph>=6?-.12:0;
 if(L12.turb&&R()<dt*.6*L12.turb)shake=Math.max(shake,.35);
 if(L12.ph===0&&BASE12.props){const t=BASE12.props.find(p=>p.truck);if(t){t.tk=(t.tk||0)+dt*4;t.truck.position.z=t.z0-((t.tk)%120);t.truck.rotation.y=Math.PI}}}
function cw12(tx,ty,tz){const C=CITY12;return new T.Vector3(X12+tx,-L12.alt+C.position.y+ty,C.position.z+L12.D+tz)}
function cityFx12(dt){const C=CITY12,U=C.userData;U.ft=(U.ft||0)-dt;if(U.ft<=0){U.ft=.12;for(const f of(U.fires||[])){if(R()<.5){const p=cw12(f[0]+(R()-.5)*f[2]*8,f[1],f[3]+(R()-.5)*f[2]*8);fb12(p.x,p.y+2,p.z,f[2]*9,.7,5)}if(R()<.35){const p=cw12(f[0],f[1]+4,f[3]);smoke(p.x,p.y,p.z,f[2]*22,9,0x161414,7,.7)}}
  for(const c of U.chim)if(R()<.2){const p=cw12(c[0],40,c[1]);smoke(p.x,p.y,p.z,10,7,0x3a3632,4,.5)}}
 if(L12.flak){U.at=(U.at||0)-dt;if(U.at<=0){U.at=.18;if(U.AA.length){const a=U.AA[R()*U.AA.length|0],o=cw12(a.x,5,a.z),t=new T.Vector3(X12+(R()-.5)*260,(R()-.2)*90,(R()-.5)*300);trc16(o,t,0xffe070)}}
  U.fk=(U.fk||0)-dt;if(U.fk<=0){U.fk=.35+R()*.5;const x=X12+(R()-.5)*240,y=(R()-.3)*80,z=(R()-.6)*260;fb12(x,y,z,7,.35,0);smoke(x,y,z,9,5,0x141414,.2,.85);snd12boom(x,z,.35);if(Math.hypot(x-X12,y-10,z)<40){shake=Math.max(shake,.6);L12.hull=Math.max(8,L12.hull-1.5);sparks12(X12+(R()<.5?3:-3),4,(R()-.5)*30)}}}
 if(L12.siren){U.sr=(U.sr||0)-dt;if(U.sr<=0){U.sr=4.2;tn18('sawtooth',260,620,2,.018);tn18('sawtooth',620,260,2,.018,2)}}}
/* =====================================================================
   FASES DE LA MISIÓN
   ===================================================================== */
function sayN12(w,t,d){say(w+': «'+t+'»',d||Math.max(2.4,t.length*.055))}
function radio12(t,d){nz18(0,.35,'bandpass',2000,1400,.05);talk([['RADIO',t,d]])}
function ln12(who,t,d){talk([[who,t,d]])}
function setPh12(ph){L12.ph=ph;L12.T=0;L12.ev={};L12.st=0;try{localStorage.setItem('cielo23cp',String(Math.max(ph,+(localStorage.getItem('cielo23cp')||0))))}catch(e){}}
const once12=(k,t)=>{if(L12.ev[k]||L12.T<t)return false;L12.ev[k]=1;return true};
function obj12(t,x,z){obj9(t,x,z);L12.ot=t}
function sky12(k){const n=scene.fog.near,f=scene.fog.far,c=scene.fog.color.clone();sky9(k);scene.fog.near=n;scene.fog.far=f;scene.fog.color.copy(c);L9.fog=null}
function fogTo12(c,n,f,top){L12.fog={c:new T.Color(c),n,f};const h='#'+new T.Color(c).getHexString();setSky([[0,top||'#4a5a6c'],[.38,'#'+new T.Color(c).lerp(new T.Color(top||'#4a5a6c'),.4).getHexString()],[.5,h],[1,h]])}
function wave12(list){for(const w of list)later12(w.t||0,()=>{if(level!==12)return;for(let i=0;i<(w.n||1);i++)air12(w.k,'e',{an:w.an+(R()-.5)*.25,y:(w.y||0)+(R()-.5)*30,d:w.d||(w.k==='fight'||w.k==='att'?820:560)})})}
function closeDoor12(){const G=ZEP12.G;if(L12.door)return;L12.door=true;G.door.position.set(X12+3.35,2.8,12);if(!obstB.includes(G.doorOb))obstB.push(G.doorOb);tn18('square',200,120,.3,.06);nz18(0,.4,'lowpass',600,200,.06)}
function baseOff12(){for(const o of BASE12.obs){const i=obstB.indexOf(o);if(i>=0)obstB.splice(i,1)}for(const p of BASE12.props)if(p.cable)p.cable.visible=false}
function formation12(now){if(L12.form)return;L12.form=true;const B=[[-70,-8,40],[70,-8,40],[-120,-14,95],[120,-14,95],[0,-22,130]],F=[[-45,26,-70],[45,26,-70],[-95,18,-10],[95,18,-10],[-65,34,70],[65,34,70]];
 B.forEach((o,i)=>{const a=air12('bomb','a',{pos:new T.Vector3(X12+o[0]*1.3,o[1]-(now?0:60),o[2]+(now?0:520+i*40)),off:o,st:now?'form':'join'});a.g.userData.bay.rotation.x=0});
 F.forEach((o,i)=>air12('fight','a',{pos:new T.Vector3(X12+o[0]*1.5,o[1]-(now?0:40),o[2]+(now?0:640+i*30)),off:o,st:'esc'}))}
function upd12(dt){const ph=L12.ph;L12.T+=dt;const T_=L12.T,X=X12,pp=P.g.position;
 if(ph===0){if(L12.st===1){obj12('Embarque · Sube por la rampa a la góndola del cepelín',X+8.5,12);const near=Math.hypot(pp.x-X-14,pp.z-6)<10||T_>6;if(near&&!L12.ev.joke){L12.ev.joke=1;talk([['Soldado Kessler','¿Cuánto tarda este cacharro en llegar a la ciudad?'],['Soldado Lenz','Depende. Si los motores no explotan, dos horas.'],['Soldado Kessler','¿Y si explotan?'],['Soldado Lenz','Entonces llegamos antes que el correo.'],['Feldwebel Brandner','¡Dejen de filosofar y abróchense! ¡No pienso escribir dos cartas de condolencias por una estupidez!',4.5]])}
   if(pp.y>1.2&&pp.x<X+3.2&&Math.abs(pp.z)<22){L12.st=2;obj12('Toma asiento en el banco de estribor (E / USAR)',X+2.4,9.5)}}
  if(L12.st===2&&!(pp.y>1.2&&pp.x<X+3.4))L12.st=1}
 else if(ph===1){const k=clamp((T_-6)/40,0,1),e=k*k*(3-2*k);L12.alt=e*260;L12.spd=clamp((T_-8)/32,0,1)*22;
  if(once12('cab',4)){baseOff12();say('Los mecánicos sueltan los cables de amarre.',2.4);tn18('square',300,100,.2,.06);for(const n of BASE12.npc)if(n.act==='crouch'||n.act==='clean'){n.act='run';n.path=[[n.g.position.x+30,n.g.position.z+20]];n.sp=4}}
  if(once12('lift',7)){shake=.5;say('El cepelín se eleva. La base de Falkenhorst queda abajo…',3)}
  if(once12('form',16))formation12(false);
  if(once12('w1',20))talk([['Soldado Vogt','Mirá eso... hasta parece un viaje de vacaciones.'],['Soldado Hartmann','Sí. Vacaciones con cuarenta toneladas de explosivos y posibilidades de morir.',4]]);
  if(once12('hud',10)){obj12('Mantén la posición y prepárate para el combate · Avance de la formación: 18%');story('OBJETIVO DE MISIÓN — Mantén la posición');later12(3,()=>story(''))}
  if(once12('off',38)){walk12(L12.off,[[X+1,-4],[X+.6,4]],n=>{n.act='point';n.f=0});}
  if(once12('stand',44)){ln12('Hauptmann Adler','¡A sus puestos! ¡El enemigo no acostumbra recibirnos con café!',3.5);L12.sit=false;toWin12(L12.sq[0],-2.6,2);toWin12(L12.sq[1],2.6,-2);toWin12(L12.sq[2],-2.6,-6);toWin12(L12.sq[3],2.6,2);walk12(L12.sgt,[[X-1,8],[X-.5,-6]],n=>{n.act='point';n.f=Math.PI})}
  if(T_>=50)go12(2)}
 else if(ph===2){if(once12('pos',2))obj12('Ocupa una MG 08 de babor o estribor y defiende el cepelín (E / USAR)',X+(pp.x>X?2.2:-2.2),-10);
  if(once12('w2',14))wave12([{k:'fight',an:-1.05,n:2}]);if(once12('pass',8)){const a=air12('fight','e',{an:.25,d:700,y:30});a.tp=new T.Vector3(X,30,-20);a.st='attack'}
  if(once12('w3',24))wave12([{k:'att',an:.35,n:2,y:-35}]);if(once12('w4',36))wave12([{k:'fight',an:.9,n:2},{k:'fight',an:-.8,n:1,t:2}]);if(once12('w5',46))wave12([{k:'att',an:-.4,n:1,y:-20},{k:'fight',an:1.2,n:2,t:3}]);
  if(once12('b2',30))ln12('Feldwebel Brandner','¡Ráfagas cortas, Weiss! ¡La cinta no crece en los árboles!');
  if(T_>=62)go12(3)}
 else if(ph===3)upd12_3(dt);else if(ph===4)upd12_4(dt);else if(ph===5)upd12_5(dt);else if(ph===6)upd12_6(dt);
 /* HUD de vuelo */
 const el=$('gar');if(ph>=1&&ph<7&&!L9.cine){const E=ZEP12.ENG.map(e=>e.hp<=0?'✖':e.hp<55?'▣':'■').join('');L12.prog=Math.min(99,Math.round(4+L12.D/55));el.style.display='block';el.innerHTML='CEPELÍN KAISER · CASCO <b>'+Math.round(L12.hull)+'%</b> · MOTORES <b>'+E+'</b> · AVANCE DE LA FORMACIÓN <b>'+(ph>=5?100:L12.prog)+'%</b>'+(L12.kills?' · DERRIBOS <b>'+L12.kills+'</b>':'')}else el.style.display='none';
 if(P.mg&&curMG){const h=Math.round(L12.heat*10);$('ammo').textContent='MG 08 · CINTA '+L12.belt+'/250 · RESERVA '+L12.belts+' · TEMP '+'■'.repeat(h)+'□'.repeat(10-h)+(L12.jam>0?' · ¡RECALENTADA!':L12.rel>0?' · CAMBIANDO CINTA…':'')}}
function upd12_3(dt){const T_=L12.T,X=X12,Z=ZEP12;
 if(once12('dark',0)){fogTo12(0x3e444c,30,380,'#14181e');L12.turb=1;for(const c of CLOUD12)c.material.color.setHex(0x5a5e66);obj12('Sigue disparando · Algo se mueve entre las nubes oscuras');say('La formación entra en un banco de nubes oscuras. El cepelín vibra.',3);for(let i=0;i<40;i++){const m=CLOUD12[i];m.position.set(X+(R()-.5)*700,L12.alt+(R()-.5)*120,-L12.D-R()*900)}}
 L12.sput=T_>2&&T_<60&&(T_%9)<2.5;
 if(once12('shadow',2)){const d=air12('dragon','e',{pos:new T.Vector3(X-260,70,-120)});d.st='break';d.t=-4;d.bp=new T.Vector3(X+500,50,120);L12.drag=d;roar12(1.2);shake=.8}
 if(once12('l1',4.5))talk([['Soldado Ruhl','¡Eso no es un avión!',1.8],['Hauptmann Adler','¡Posiciones defensivas! ¡Dracos al frente!',2.6]]);
 if(once12('s1',6))wave12([{k:'small',an:-.7,n:4,y:-5}]);
 if(once12('kami',9)){const a=air12('small','e',{pos:new T.Vector3(X+90,18,-80)});a.kami=1;a.tp=new T.Vector3(X+3.4,4,-6);a.st='attack';a.spd=50}
 if(once12('arm',12))wave12([{k:'arm',an:1.35,n:1,y:-15},{k:'arm',an:-1.35,n:1,y:-15,t:1}]);
 if(once12('mech',17)){const m=L12.mech,p=m.g.position;bx12(X+3.2,3.2,p.z,.35,'gen');shake=1.6;sparks12(X+3.1,3.5,p.z);damage12(2);m.act='faint';m.lying=true;m.q=null;p.set(X-1.9,1.62,p.z-1);m.g.rotation.x=-1.45;L12.wound=m;fireIn12(X+2.2,-6.5,.45);for(const w of ZEP12.G.glass)if(w.s>0&&Math.abs(w.z+3)<4&&w.ok)breakGlass12(w);
  talk([['Soldado Lenz','¡Ott! ¡La explosión lo tiró contra la pared!'],['Feldwebel Brandner','¡Weiss, ocupate del mecánico! ¡Rápido!',2.6]]);obj12('Ayuda al mecánico herido (E / USAR) · después vuelve a la MG',X-1.9,p.z)}
 if(once12('eng',22)){Z.ENG[1].hp=40;radio12('¡Motor dos echando humo! ¡Lo tenemos al cuarenta por ciento!');L12.hull-=4}
 if(once12('dra',26)){const d=L12.drag;if(d&&AIR12.includes(d)&&d.st!=='down'){d.st='attack';d.tp=new T.Vector3(X+20,Z.HY-6,-30);d.tb=null}roar12(1.4);ln12('Hauptmann Adler','¡El dragón! ¡Fuego concentrado sobre el dragón!')}
 if(once12('tilt',30)){L12.rollT=.2;shake=1.5;damage12(3);fireIn12(X-1.4,-11.5,.5);const k=L12.sq[0],l=L12.sq[1];later12(.2,()=>{k.q=null;k.act='faint';k.g.position.x=X-3.0;k.g.rotation.z=.7;l.q=null;walk12(l,[[X-2.4,k.g.position.z+.6]],n=>{n.act='point';n.f=-1.5708},4)});
  talk([['Soldado Kessler','¡Me resbalo! ¡La ventana!',1.6],['Soldado Lenz','¡Te tengo! ¡No te sueltes, idiota!',2],['Soldado Kessler','…Gracias. Te debo una cerveza.',2]]);later12(3.4,()=>{L12.rollT=0;k.g.rotation.z=0;toWin12(k,-2.6,2);toWin12(l,2.6,-2)})}
 if(once12('belt',34)&&L12.belts<=2){ln12('Feldwebel Brandner','¡Weiss! ¡Traé una cinta del pañol de popa antes de quedarte seco!');obj12('Recoge una cinta de munición en el pañol (popa) · E / USAR',X-2.2,17.4)}
 if(once12('s2',38))wave12([{k:'small',an:.75,n:5,y:0}]);if(once12('f3',44)){wave12([{k:'fight',an:-.3,n:2,d:700}]);radio12('¡Cazas enemigos aprovechando el caos! ¡Escolta, a por ellos!')}
 if(once12('dok',46)){L12.dragonOK=true;ln12('Hauptmann Adler','¡Mantengan la formación! ¡Nadie rompe filas!')}
 if(once12('s3',52))wave12([{k:'small',an:-1.1,n:3},{k:'arm',an:.2,n:1,y:-25,t:2}]);
 if(once12('dflee',61)){const d=L12.drag;if(d&&AIR12.includes(d)&&d.st!=='down'){d.st='leave';say('El dragón, herido, se pierde entre las nubes.',2.4);roar12(1)}L12.turb=.4}
 if(T_>=66)go12(4)}
function cityFire12(k){const T_=CITY12.userData.T[k];(CITY12.userData.fires||(CITY12.userData.fires=[])).push([T_.x,T_.y,k==='fuel'?2.2:k==='ars'?1.6:1.1,T_.z])}
function hitTgt12(k){const T_=CITY12.userData.T[k],p=cw12(T_.x,T_.y,T_.z);bx12(p.x,p.y,p.z,k==='fuel'?3.4:k==='ars'?2.6:k==='bridge'?1.8:2.2,k);cityFire12(k);L12.tdone=(L12.tdone||0)+1;feed('★ '+{rail:'Depósito ferroviario',fuel:'Depósito de combustible',ars:'Arsenal industrial',aa:'Puesto antiaéreo',bridge:'Puente logístico',fab:'Complejo fabril'}[k]+' destruido');score+=400;
 if(k==='bridge'){L12.brT=0}if(k==='aa')CITY12.userData.AA.shift()}
function upd12_4(dt){const T_=L12.T,X=X12;L12.spd=Math.max(6,22-T_*.5);
 if(once12('clear',0)){fogTo12(0x9a7e6c,160,1600,'#3a3048');L12.turb=.2;for(const c of CLOUD12)c.material.color.setHex(0xd8c8b8);sky12('tarde');if(!CITY12){buildCity12(-(L12.D+585));CITY12.position.y=14}L12.flak=false;cineCity12()}
 if(once12('fl',10)){L12.flak=true;L12.siren=true;obj12('Defiende la aeronave durante la aproximación · Prepárate para el bombardeo')}
 if(once12('w',12))wave12([{k:'fight',an:.5,n:2},{k:'small',an:-.6,n:3,t:3}]);
 if(T_>=32)go12(5)}
function bombBay12(byPlayer){if(L12.bombed)return;L12.bombed=true;const G=ZEP12.G;if(byPlayer){score+=250;feed('★ Bombas fuera')}nz18(0,1.8,'lowpass',300,120,.08);tn18('sawtooth',90,60,1.6,.05);L12.bay=0.001;
 G.bombs.forEach((b,i)=>later12(1.4+i*.45,()=>{dropBomb12(0,0,0,L12.spd*.4,b,['rail','fuel','ars','aa','bridge','fab'][i]);tn18('square',180,90,.15,.05)}));talk([['Hauptmann Adler','¡Compuertas abiertas! ¡Bombas fuera!',2.2]]);obj12('Observa el bombardeo por el suelo de cristal o una ventana · Sigue defendiendo la aeronave')}
function upd12_5(dt){const T_=L12.T,X=X12,Z=ZEP12;L12.spd=Math.max(2.5,L12.spd-dt*2);
 if(once12('o',0)){talk([['Hauptmann Adler','¡Abran compuertas! ¡Weiss, a la bodega: palancas de lanzamiento!',3]]);obj12('Baja a la bodega (popa) y acciona las palancas de lanzamiento (E / USAR)',X-1.6,-18.4)}
 if(once12('auto',15)&&!L12.bombed){ln12('Hauptmann Adler','¡Apartate, Weiss! ¡Lo hago yo!');bombBay12(false)}
 if(L12.bay>0&&L12.bay<1){L12.bay=Math.min(1,L12.bay+dt*.7);for(const d of Z.G.bayDoors)d.d.rotation.z=d.s*L12.bay*1.45}
 if(once12('bomb',6)){radio12('¡Bombarderos, en pasada! ¡Suelten a mi señal… ahora!');for(const a of AIR12)if(a.side==='a'&&a.kind==='bomb'&&a.st!=='down'){later12(R()*3,()=>{a.drop=9+R()*4})}}
 
 for(const [t,k] of[[10,'rail'],[14,'fuel'],[18.5,'ars'],[23,'aa'],[27,'bridge'],[31,'fab']])if(once12('t'+k,t))hitTgt12(k);
 if(CITY12&&L12.brT!==undefined&&L12.brT<4){L12.brT+=dt;const b=CITY12.userData.br;b.rotation.z=-L12.brT*.12;b.position.y=-L12.brT*3}
 if(once12('w1',8))wave12([{k:'fight',an:-.6,n:2,d:700},{k:'small',an:.9,n:4,t:2}]);if(once12('w2',20))wave12([{k:'small',an:-.9,n:3},{k:'arm',an:1.2,n:1,y:-20,t:1}]);
 if(once12('crash',18)){const B=AIR12.filter(a=>a.side==='a'&&a.kind==='bomb'&&a.st!=='down');if(B.length){const b=B[0],d=air12('small','e',{pos:b.p.clone().add(new T.Vector3(-120,30,-60))});d.tb=b;d.st='attack';d.kami=2;L12.crashB=b}}
 if(once12('sink',24)){const B=AIR12.filter(a=>a.side==='a'&&a.kind==='bomb'&&a.st!=='down');if(B.length>1){const b=B[B.length-1];b.hp=60;b.off=b.off.slice();b.sink=1;radio12('¡El Gotha cuatro pierde altura! ¡Va tocado!')}}
 for(const a of AIR12)if(a.sink&&a.st!=='down'){a.off[1]-=dt*5;if(R()<dt*8)smoke(a.p.x,a.p.y,a.p.z,6,4,0x2a2a2a,.4,.6)}
 if(once12('eng2',30)){const e=Z.ENG[1];bx12(e.x,Z.HY-10,e.z,.9,'air');e.hp=0;shake=2;L12.hull=Math.min(L12.hull,40);damage12(4);L12.rollT=.08;talk([['RADIO','¡El motor número dos está fuera! ¡Tenemos pérdida de presión!',3],['Hauptmann Adler','¡Mantengan la formación! ¡El bombardeo ya está completado!',3]])}
 if(once12('lean',38)){say('La aeronave comienza a inclinarse…',2);L12.rollT=.12}
 if(T_>=44)go12(6)}
function upd12_6(dt){const T_=L12.T,X=X12,pp=P.g.position;L12.alt=Math.max(205,L12.alt-dt*3);L12.spd=Math.min(18,L12.spd+dt*3);
 if(once12('boom',0)){bx12(X+6,4,-14,1.4,'air');fb12(X+3,3,-12,9,.6,0);shake=2.6;$('flash').style.transition='opacity .1s';$('flash').style.opacity=.85;setTimeout(()=>{$('flash').style.transition='opacity 1.4s';$('flash').style.opacity=0},120);
  damage12(6);L12.rollT=.17;L12.turb=1.2;L12.hull=Math.min(L12.hull,15);for(const e of ZEP12.ENG)if(R()<.5)e.hp=0;for(const w of ZEP12.G.glass)if(w.ok&&R()<.5)breakGlass12(w);
  if(P.mg){P.mg=false;curMG=null}L12.sit=false;P.pr=true;later12(1.7,()=>{P.pr=false;say('Te levantás como podés. El suelo está inclinado.',2)});
  fireIn12(X+1.3,-3.5,.6);fireIn12(X-1.7,-9.5,.55);fireIn12(X+1.7,-14.2,.5);
  story('ALERTA — EMERGENCIA');later12(3,()=>story(''));obj12('¡ABANDONA LA AERONAVE! Integridad estructural crítica · Evacuación inmediata → salida de emergencia (popa, babor)',X-2.6,-20);
  for(const n of L12.sq)if(R()<.5&&n.g.visible){n.q=null;n.act='faint';n.g.rotation.z=.6;later12(1+R()*2,()=>{n.g.rotation.z=0;n.act='idle'})}
  for(let i=0;i<6;i++)later12(.4+i*.7,()=>smoke(X+(R()-.5)*5,4.6,(R()-.5)*36,3,5,0x2a2a2a,.1,.65))}
 if(once12('exit',1.2)){const G=ZEP12.G;const i=obstB.indexOf(G.exitOb);if(i>=0)obstB.splice(i,1);G.exit.rotation.y=-1.2;G.exit.position.x-=.6;G.exit.position.z+=.6;L12.exitOpen=true;tn18('square',260,90,.4,.07);smoke(X-3.6,3,-20,4,3,0xe0e0e0,.2,.5)}
 if(once12('help',2)){const l=L12.sq[1];l.q=null;l.seated=false;l.lying=false;l.g.rotation.set(0,0,0);l.g.position.set(clamp(pp.x-.8,X-2.2,X+2.2),1.5,pp.z-1.2);l.act='point';l.f=Math.atan2(pp.x-l.g.position.x,pp.z-l.g.position.z);ln12('Soldado Lenz','¡Arriba, Weiss! ¡Vamos, vamos, a la puerta de emergencia!');later12(2.5,()=>walk12(l,[[X,-12],[X,-17],[X-2.2,-19.6]],n=>{n.act='idle'},2.6))}
 if(!L12.ev.fallObj&&pp.z<-1){L12.ev.fallObj=1;const m=new T.Mesh(gBox(2.2,.25,.35),new T.MeshLambertMaterial({color:0x3a3a36}));m.position.set(clamp(pp.x,X-1.6,X+1.6),5.3,pp.z-2.6);scene.add(m);(L12.fall||(L12.fall=[])).push({m,vy:-1,y0:1.62,rx:2.2,hit:true});ln12('Feldwebel Brandner','¡CUIDADO ARRIBA!',1.4);tn18('square',200,60,.5,.07)}
 if(once12('jumpL',6))talk([['Feldwebel Brandner','¡Salten, maldita sea! ¡El dirigible no va a aterrizar suavemente!',3.2],['Soldado Ruhl','¡Mi paracaídas!',1.6],['Feldwebel Brandner','¡Si no lo encontrás ahora, vas a tener una caída muy educativa!',3.4]]);
 if(once12('sgt',3)){const s=L12.sgt;s.q=null;s.seated=false;s.g.position.set(X-1.6,1.5,-18.6);s.act='point';s.f=-1.5708}
 /* la escuadra salta por la puerta de emergencia, uno a uno */
 if(T_>4)for(const n of L12.sq){if(n.out||n.q&&n.q.length)continue;if(!n.jq){n.jq=1;n.g.rotation.z=0;walk12(n,[[X,n.g.position.z],[X,-17],[X-2.3,-19.8],[X-4.2,-20]],m=>{m.out=true;m.g.visible=false;smoke(X-4,2.5,-20,2,2,0xd8d8d8,.2,.4)},2.4+R()*.8);n.wait=R()*5}}
 if(once12('auto',50)&&L12.ph===6){say('El sargento te agarra del correaje y te empuja al vacío.',2);jump12()}}
/* =====================================================================
   CINEMÁTICAS: «Todos a bordo», interceptación, objetivo a la vista y «La caída»
   ===================================================================== */
function cineIntro12(){const X=X12;cine9([
 {d:4.5,a:[X+46,1.6,74],b:[X+36,2.4,56],la:[X+2,16,0],txt:'BASE AERONAVAL DE FALKENHORST — EISENMARK, 1922'},
 {d:4,a:[X-24,3.2,48],b:[X-30,3,34],la:[X-55,1.4,70]},
 {d:4,a:[X+64,4,-58],b:[X+52,3.4,-70],la:[X+46,2.4,-104]},
 {d:4.5,a:[X+44,12,34],b:[X+26,6,20],la:[X+8,5,8],txt:'OPERACIÓN CIELO DE ACERO'}],
 ()=>{story('');L12.st=1;L12.T=0;P.g.position.set(X+20,0,30);yaw=.57;pitch=.05;L12.sq.forEach((n,i)=>board12(n,1+i*1.3));board12(L12.sgt,10.5);walk12(L12.off,[[X+9,14],[X+4.6,12],[X+1.2,12],[X+1.2,-5]],n=>{n.act='idle';n.f=Math.PI});L12.off.wait=12},
 [{t:.2,fn:()=>{tn18('sine',2600,2400,.5,.05);tn18('sine',2600,2400,.4,.05,.6)}},{t:1,fn:()=>say('OFICIAL DE OPERACIONES (megáfono): «¡Escuadrón de asalto, embarque inmediato! ¡La ventana de bombardeo no va a esperarlos!»',5)},{t:9,fn:()=>{nz18(0,2.5,'lowpass',300,150,.08)}}])}
function cineIntercept12(){const X=X12;const E=AIR12.filter(a=>a.side==='e');const lead=E[0];if(!lead)return;cine9([
 {d:3,a:()=>[lead.p.x+8,lead.p.y+4,lead.p.z+28],la:()=>[lead.p.x,lead.p.y,lead.p.z-40],txt:'¡CONTACTO AÉREO AL NORESTE!'},
 {d:3,a:[X+30,34,60],b:[X+24,36,30],la:()=>[lead.p.x,lead.p.y,lead.p.z]}],()=>{},[{t:.1,fn:()=>{nz18(0,.35,'bandpass',2000,1400,.05);sayN12('RADIO','¡Contacto aéreo al noreste! ¡Múltiples aparatos enemigos acercándose! ¡Repito, interceptores enemigos!',5.5)}}])}
function cineCity12(){const X=X12,o=L12.off;o.q=null;o.seated=false;o.g.position.set(X+1.6,1.5,-7.1);o.f=0;o.g.rotation.y=0;o.act='point';const C=()=>cw12(0,20,0);cine9([
 {d:4.5,a:[X+.2,3.3,-3.4],b:[X+.5,3.1,-4],la:[X+1.6,2.5,-6.4],txt:'¡OBJETIVO A LA VISTA!'},
 {d:5.5,a:[X+70,16,-30],b:[X+55,6,-70],la:()=>{const c=C();return[c.x,c.y,c.z]}}],()=>{walk12(o,[[X+.6,-4]],n=>{n.act='point'})},
 [{t:.3,fn:()=>sayN12('Hauptmann Adler','¡Objetivo a la vista! ¡Depósitos industriales, estación ferroviaria y arsenal! ¡Bombarderos, mantengan la formación!',4.6)},{t:4.7,fn:()=>{nz18(0,.35,'bandpass',2000,1400,.05);sayN12('RADIO','¡Escuadrón de bombardeo, inicien ataque! ¡Repito, ataque autorizado!',4.5);L12.siren=true}},{t:5,fn:()=>{L12.flak=true}}])}
function jump12(){if(L12.ph>=7)return;setPh12(7);for(const n of CREW12)n.g.visible=false;for(const f of(L12.fires||[]))f.g.visible=false;for(const f of(L12.fall||[]))f.m.visible=false;for(const c of CR12)c.g.visible=false;if(L12.redL)L12.redL.intensity=0;L12.work=null;P.mg=false;curMG=null;$('gar').style.display='none';cineFall12()}
function chute12(){const g=new T.Group(),q=PB();pa(q,gSph(3.2,14,6,0,Math.PI/2),0xd8d0b8,0,6.2,0,0,0,0,1,.55,1);for(let i=0;i<8;i++){const a=i/8*6.283;pBox(q,.02,5.2,.02,0x3a3a36,Math.cos(a)*1.6,3.5,Math.sin(a)*1.6,Math.sin(a)*.3,0,-Math.cos(a)*.3)}pbMesh(q,g,VCV);g.scale.setScalar(.05);return g}
function dir12(pl){const c=CITY12?cw12(0,0,0):new T.Vector3(pl.x,0,pl.z+300);const v=new T.Vector3(c.x-pl.x,0,c.z-pl.z);if(v.lengthSq()<1)v.set(0,0,1);return v.normalize()}
function cineFall12(){const X=X12;fpv=false;P.g.visible=true;L12.fpvOff=true;const pl=P.g.position;pl.set(X-3.8,1.5,-20);P.g.rotation.set(0,-1.5708,0);const F={vy:0,vx:-4,ch:null,t:0};L12.jf=F;
 /* compañeros que saltan con paracaídas */const J=[];for(let i=0;i<3;i++){const n=npc11(X-4-i*2,-20-i*6,{hat:'helm',hatC:EIS.helm,coat:EIS.coat,act:'faint'});n.lv=12;n.g.position.y=-8-i*14;const c=chute12();n.g.add(c);J.push({n,c,vy:-12,t:-i*.6})}L12.jmp=J;
 const ZP=L12.zp;
 L9.tick=dt=>{F.t+=dt;if(!F.ch){F.vy-=9.8*dt;F.vy=Math.max(F.vy,-30)}else{F.vy+=(-4-F.vy)*Math.min(1,dt*1.6);F.ch.scale.setScalar(Math.min(1,F.ch.scale.x+dt*1.4));P.g.rotation.x*=.95}
  F.vx*=Math.pow(.6,dt);pl.x+=F.vx*dt;pl.y+=F.vy*dt;pl.z-=(F.ch?16:8)*dt;if(CITY12)cityFx12(dt);smokeUpd(dt);if(!F.ch)P.g.rotation.x=Math.max(-1.3,P.g.rotation.x-dt*1.2);
  const u=P.g.userData;if(u.aR){u.aR.rotation.x=F.ch?-2.9:-1.6;u.aL.rotation.x=F.ch?-2.9:-1.6;u.aR.rotation.z=F.ch?.2:-.8;u.aL.rotation.z=F.ch?-.2:.8}
  for(const j of J){j.t+=dt;if(j.t<0)continue;j.vy+=(-5.5-j.vy)*Math.min(1,dt*1.2);j.n.g.position.y+=j.vy*dt;j.c.scale.setScalar(Math.min(1,j.c.scale.x+dt*1.2))}
  /* el cepelín ardiendo se inclina y cae lentamente */if(ZP){ZP.rotation.x=Math.min(.35,ZP.rotation.x+dt*.03);ZP.rotation.z=Math.min(.12,ZP.rotation.z+dt*.012);ZP.position.y-=dt*4;ZP.position.z-=dt*6;if(R()<dt*40){const z=(R()-.5)*130,p=new T.Vector3(X+(R()-.5)*18,22+R()*10,z);ZP.localToWorld(p.set((R()-.5)*18,(R()-.2)*14,z));fb12(p.x,p.y,p.z,10+R()*14,1.1,5);if(R()<.6)smoke(p.x,p.y+4,p.z,18,9,0x141414,3,.75)}}
  if(CITY12&&R()<dt*1.3){const k=['rail','fuel','ars','fab'][R()*4|0],T_=CITY12.userData.T[k],p=cw12(T_.x+(R()-.5)*120,4,T_.z+(R()-.5)*120);bx12(p.x,p.y,p.z,1+R(),'gen')}
  fbUpd12(dt);bombUpd12(dt)};
 for(const a of AIR12){if(a.side==='e'&&a.st!=='down')a.st='leave';if(a.side==='a'&&a.st!=='down'){a.st='leave'}}L12.flee=true;
 const fd=document.getElementById('fade12');cine9([
 {d:3.2,a:[X-12,-1,-31],b:[X-14,-6,-30],la:()=>[pl.x,pl.y+1,pl.z],txt:'EL SALTO'},
 {d:5,a:()=>[pl.x-5,pl.y+2.5,pl.z+7],la:()=>[X,ZP?ZP.position.y:20,-10]},
 {d:5.5,a:()=>{const d=dir12(pl);return[pl.x-d.x*9,pl.y+3.2,pl.z-d.z*9]},la:()=>{const d=dir12(pl);return[pl.x+d.x*30,pl.y-12,pl.z+d.z*30]}},
 {d:7,a:()=>[pl.x+26,pl.y-6,pl.z+34],b:()=>[pl.x+48,pl.y-4,pl.z+60],la:()=>[pl.x,pl.y+3,pl.z],txt:'LA CAÍDA'},
 {d:3.5,a:()=>[pl.x+48,pl.y-4,pl.z+60],b:()=>[pl.x+60,pl.y,pl.z+80],la:()=>[pl.x,pl.y,pl.z]}],
 ()=>{fd.style.opacity=1;setTimeout(()=>{if(level===12)end(true)},900)},
 [{t:.2,fn:()=>{nz18(0,2.4,'highpass',900,500,.09)}},{t:4.6,fn:()=>{F.ch=chute12();P.g.add(F.ch);tn18('triangle',160,90,.6,.08);nz18(0,.6,'lowpass',800,200,.1);say('El paracaídas se abre de golpe.',2)}},
  {t:9,fn:()=>{tn18('sine',220,220,3,.03);tn18('sine',261,261,3,.025,.4);tn18('sine',196,196,4,.03,3)}},
  {t:14,fn:()=>{nz18(0,4,'bandpass',1800,1600,.04);say('RADIO (interferencias): «...escuadrón... ¿alguien responde?... ¡Weiss! ¿Me escuchás?... ¡Respondan!»',6)}},
  {t:20.5,fn:()=>{fd.style.transition='opacity 3s';fd.style.opacity=1}}])}
/* =====================================================================
   INTERACCIONES (E / USAR) Y PUNTOS DE CONTROL
   ===================================================================== */
function works12(){const X=X12,W=[],ph=L12.ph;
 if(ph===0&&L12.st===2)W.push({x:X+2.4,z:9.5,r:1.4,dur:.5,lbl:'Tomar asiento',fn:sit12});
 if(ph>=2&&ph<=5&&L12.belts<4)W.push({x:X-2.2,z:17.4,r:1.9,dur:1.3,lbl:'Recoger cinta de munición',fn:()=>{L12.belts=Math.min(4,L12.belts+2);feed('+2 cintas de MG 08 ('+L12.belts+')');tn18('square',400,300,.08,.05);if(L12.ph===3&&!L12.beltOK){L12.beltOK=true;ln12('Feldwebel Brandner','Bien. Ahora volvé a esa ametralladora.')}}});
 const w=L12.wound;if(w&&!w.ok)W.push({x:w.g.position.x+.9,z:w.g.position.z,r:1.9,dur:2.6,lbl:'Ayudar al mecánico herido',fn:()=>{w.ok=true;w.lying=false;w.g.rotation.x=0;w.g.position.y=1.5;w.act='idle';score+=200;feed('★ Mecánico atendido');talk([['Mecánico Ott','Gracias, chico… La cabeza me zumba, pero las manos funcionan.'],['Mecánico Ott','¡Voy a ver ese motor dos antes de que se nos caiga!']]);later12(3,()=>walk12(w,[[X+.6,w.g.position.z],[X+.6,-14],[X+2.2,-13.5]],n=>{n.act='crouch';n.f=1.5708}));obj12('Vuelve a la MG 08 y mantén a raya a los dracos')}});
 if(ph===5&&!L12.bombed)W.push({x:X-1.6,z:-18.4,r:1.6,dur:1.2,lbl:'Accionar las palancas de lanzamiento',fn:()=>bombBay12(true)});
 if(ph===6&&L12.exitOpen)W.push({x:X-2.5,z:-20,r:1.5,dur:.25,lbl:'¡SALTAR!',fn:jump12});
 return W}
function sit12(){const X=X12;L12.sit=true;P.g.position.set(X+2.15,1.5,9.5);yaw=1.5708;pitch=.05;closeDoor12();go12(1)}
function workUpd12(dt){const pp=P.g.position,w=L12.work;if(w){if(Math.hypot(pp.x-w.x,pp.z-w.z)>w.r+1.2||L9.cine){L12.work=null;return}w.t+=dt;$('pr').textContent=w.lbl+'… '+bar10(w.t/w.dur);if(w.t>=w.dur){L12.work=null;w.fn()}return}
 if(L9.cine||P.mg)return;for(const c of works12())if(Math.hypot(pp.x-c.x,pp.z-c.z)<c.r){$('pr').textContent='[E / USAR] '+c.lbl;return}}
/* arranque en una fase (punto de control) con el estado acumulado coherente */
function go12(ph,jump){const X=X12;setPh12(ph);if(jump){
  if(ph>=1){closeDoor12();baseOff12();L12.st=2;for(const n of CREW12)if(n.seat&&n!==L12.sgt)sitNow12(n);sitNow12(L12.sgt);L12.off.g.position.set(X+1.2,1.5,-5)}
  if(ph>=2){L12.alt=260;L12.spd=22;L12.D=Math.max(L12.D,1150);formation12(true);L12.sit=false;toWin12(L12.sq[0],-2.6,2);toWin12(L12.sq[1],2.6,-2);toWin12(L12.sq[2],-2.6,-6);toWin12(L12.sq[3],2.6,2);L12.sgt.seated=false;L12.sgt.g.position.set(X-.5,1.5,-6);L12.sgt.act='point';P.g.position.set(X+1.4,1.5,-8);yaw=-1.5708}
  if(ph>=3){L12.D=Math.max(L12.D,2500);L12.hull=88}
  if(ph>=4){L12.D=Math.max(L12.D,4000);L12.hull=74;ZEP12.ENG[1].hp=40;damage12(3);L12.dragonOK=true}
  if(ph>=4){if(!CITY12){buildCity12(-(L12.D+(ph>=5?120:585)));CITY12.position.y=14}sky12('tarde')}if(ph>=5){L12.spd=6;L12.flak=true;L12.siren=true}
  if(ph>=6){L12.bLost=Math.max(L12.bLost||0,1);L12.hull=40;ZEP12.ENG[1].hp=0;L12.bombed=true;L12.bay=1;for(const d of ZEP12.G.bayDoors)d.d.rotation.z=d.s*1.45;for(const k of['rail','fuel','ars','aa','bridge','fab'])cityFire12(k);L12.tdone=6;P.g.position.set(X+.5,1.5,6);yaw=Math.PI*.0}
  if(ph<4)sky12('manana');if(ph<3)fogTo12(0xa8b2bc,200,1700);else if(ph===3)fogTo12(0x3e444c,30,380,'#14181e');else fogTo12(0x9a7e6c,160,1600,'#3a3048')}
 if(ph===1){L12.sit=true;P.g.position.set(X+2.15,1.5,9.5);yaw=1.5708;L12.prog=4}
 if(ph===2){fogTo12(0xa8b2bc,200,1700);wave12([{k:'fight',an:.85,n:3,d:760}]);later12(.1,()=>{if(level===12&&L12.ph===2&&!jump)cineIntercept12()});if(jump)radio12('¡Contacto aéreo al noreste! ¡Múltiples aparatos enemigos acercándose!')}
 L12.cp=[P.g.position.x,P.g.position.z]}
/* =====================================================================
   BUCLE DE LA MISIÓN, CONSTRUCCIÓN Y ARRANQUE
   ===================================================================== */
function fx12(dt,cine){if(L12.tq&&L12.tq.length){for(const q of L12.tq)q.t-=dt;const due=L12.tq.filter(q=>q.t<=0);L12.tq=L12.tq.filter(q=>q.t>0);for(const q of due)q.f()}
 skyMesh.position.copy(cam.position);if(cine){updParts(dt);updRag(dt)}smokeUpd(dt);tracerUpd(dt);fireUpd(dt);lightsUpd(dt);if(L9.tick)L9.tick(dt);
 if(L12.ph<7){flight12(dt);airUpd12(dt);bombUpd12(dt);fbUpd12(dt)}npcUpd11(dt);crewUpd12(dt);gondUpd12(dt);mgUpd12(dt);engSnd12();if(!L9.cine)dlgUpd(dt);
 const F=L12.fog;if(F){const k=Math.min(1,dt*.8);scene.fog.color.lerp(F.c,k);scene.fog.near+=(F.n-scene.fog.near)*k;scene.fog.far+=(F.f-scene.fog.far)*k}}
function updT12(dt){fx12(dt,false);if(L12.ph>=6||L12.ph===0){const pr=$('pr');if(pr.textContent.indexOf('MG 08')>=0)pr.textContent=''}workUpd12(dt);upd12(dt);if(L12.ot&&!L9.cine)$('obj').textContent=L12.ot;
 const pp=P.g.position;if(L12.sit){pp.set(X12+2.15,1.5,9.5);P.vy=0}
 if(L12.ph>=1&&L12.ph<7&&(pp.y<.9||Math.abs(pp.x-X12)>3.6||Math.abs(pp.z)>23)){pp.set(X12+.5,1.5,clamp(pp.z,-14,14));P.vy=0;say('Te agarrás a un puntal y volvés a la cubierta.',1.6)}
 if(L12.dmg>=3&&R()<dt*.3)smoke(X12+(R()-.5)*5,5,(R()-.5)*40,2.4,4,0x4a4a4a,-.1,.35);ambUpd(dt,.6)}
function startLevel12(){const X=X12;level=12;buildWorld12();clearStage();WC.x=X;WC.z=0;WC.r=420;mobs.forEach(m=>scene.remove(m.g));mobs=[];convoy.forEach(v=>scene.remove(v.g));convoy=[];npcs.forEach(n=>scene.remove(n.g));npcs=[];lightsInit();for(const p of LT.pts)p.on=false;searchSet(false);
 for(const s of GAR)scene.remove(s.g);GAR.length=0;for(const c of CAV)if(c.g)scene.remove(c.g);CAV.length=0;CAVS.st='off';L9.tgts=[];L9.def=false;L9.obj=null;L9.cine=0;if(L10.eis)eisOff();
 allies.forEach(a=>{if(a.name)a.g.visible=false});if(officer)officer.g.visible=false;if(MED)MED.g.visible=false;crew12();fbInit12();
 if(!L12.zp){const ZP=new T.Group();ZP.position.set(X,22,0);scene.add(ZP);ZP.add(ZEP12.Z);ZEP12.Z.position.set(-X,-22,0);L12.zp=ZP}
 if(!L12.redL){L12.redL=new T.PointLight(0xff2020,0,16,2);L12.redL.position.set(X,4.6,-3);scene.add(L12.redL)}
 refill(3);P.grenades=0;P.cur='rifle';P.g.visible=true;playerEis(true);L12.skin=true;L12.fpv0=fpv;fpv=true;cam.far=4200;cam.updateProjectionMatrix();skyMesh.scale.setScalar(11);
 P.g.position.set(X+20,0,30);P.g.position.y=0;yaw=.57;pitch=.05;$('tc').style.display='block';playing=true;ambStart();engStart12();sky9('manana');fogTo12(0x9aa4ae,120,1400);scene.fog.far=1400;scene.fog.near=120;L12.on=true;
 const cp=+(($('cp12')||{}).value||0);story('OPERACIÓN CIELO DE ACERO — Asalto aerotransportado');setTimeout(()=>story(''),2600);
 if(cp===0){setPh12(0);cineIntro12()}else go12(cp,true)}
function leave12(){L12.on=false;engStop12();cam.far=500;cam.updateProjectionMatrix();skyMesh.scale.setScalar(1);if(L12.fpv0!==undefined)fpv=L12.fpv0;if(L12.skin&&!L10.eis)playerEis(false);L12.skin=false;if(L12.redL)L12.redL.intensity=0;P.g.rotation.x=0;const u=P.g.userData;if(u.aR){u.aR.rotation.z=0;u.aL.rotation.z=0}}
/* =====================================================================
   INTEGRACIÓN CON LOS SISTEMAS DEL JUEGO
   ===================================================================== */
AMBL[12]=['wind','wind','arty','wind','bell'];
document.body.insertAdjacentHTML('beforeend','<div id="fade12" style="position:fixed;inset:0;background:#000;opacity:0;pointer-events:none;z-index:11;transition:opacity 1.5s"></div>');
const _au12=allyUpdate;allyUpdate=function(dt){if(level===12){for(const a of allies)if(a.name)a.g.visible=false;if(officer)officer.g.visible=false;return}return _au12(dt)};
const _mu12=medUpd;medUpd=function(dt){if(level===12){if(MED)MED.g.visible=false;return}return _mu12(dt)};
const _ai12=aiTick20;aiTick20=function(dt){if(level===12)return;return _ai12(dt)};
const _hp12=hitP;hitP=function(d){if(level===12)d*=.55;_hp12(d)};
const _tg12=throwG;throwG=function(){if(level===12&&playing){say('¡Ni se te ocurra tirar una granada dentro del dirigible!',1.6);return}_tg12()};
const _in12=interact;interact=function(){if(level===12&&playing&&!L9.cine){if(L12.work){L12.work=null;return}if(L12.sit){say('Estás sentado con el correaje puesto. Esperá la orden del oficial.',1.8);return}const pp=P.g.position;if(!P.mg)for(const c of works12())if(Math.hypot(pp.x-c.x,pp.z-c.z)<c.r){L12.work=Object.assign({},c,{t:0});return}if(P.mg||(nearMG()&&L12.ph>=1&&L12.ph<6)){toggleMG();return}say(L12.ph>=6?'¡No hay tiempo! ¡A la salida de emergencia!':'Nada que usar aquí.',1.2);return}return _in12()};
/* impactos de bala del jugador sobre aviones, dracos y el dragón */
const _v9h12=v9Hit;v9Hit=function(b){if(level!==12)return _v9h12(b);const p=b.m.position;for(const a of AIR12){if(a.side!=='e'||a.st==='down'||a.st==='leave')continue;const r=a.r*1.25;if(Math.abs(p.x-a.p.x)>r||Math.abs(p.y-a.p.y)>r||Math.abs(p.z-a.p.z)>r||p.distanceToSquared(a.p)>r*r)continue;
 a.hp-=b.dmg*(a.kind==='arm'?.55:a.kind==='dragon'?.8:1);burst(p.x,p.y,p.z,a.fly?0x8a1a10:0xffd890,a.fly?5:4,.3,5);const cr=$('cr');cr.classList.add('hit');setTimeout(()=>cr.classList.remove('hit'),110);tn18('square',a.fly?600:1800,a.fly?300:1200,.03,.02);
 if(a.hp<=0){if(a.kind==='dragon'&&!L12.dragonOK){a.hp=90;a.st='break';a.t=0;a.bp=new T.Vector3(a.p.x+(a.p.x-X12)*4,a.p.y+80,a.p.z-250);roar12(1)}else down12(a,'p')}else if(a.st==='claw'&&a.hp<a.mx*.5){a.st='break';a.t=0;a.bp=new T.Vector3(a.p.x+(a.p.x-X12)*30,a.p.y-40,a.p.z-150)}return true}return false};
const _rp12=respawnP;respawnP=function(){_rp12();if(level!==12)return;P.pr=false;P.cover=null;P.mg=false;curMG=null;L12.work=null;L12.jam=0;L12.rel=0;if(L12.belts<2)L12.belts=2;if(L12.belt<60)L12.belt=250;
 if(L12.ph===0){P.g.position.set(X12+20,0,30);P.g.position.y=0}else if(L12.sit){P.g.position.set(X12+2.15,1.5,9.5)}else{P.g.position.set(X12+.4,1.5,L12.ph>=6?-2:2);P.g.position.y=1.5}say('Punto de control — sigues a bordo del Kaiser.',2)};
const _end12=end;end=function(w){if(level===12&&w){engStop12();_end12(w);playing=false;$('fade12').style.opacity=0;$('gar').style.display='none';const n=L12.tdone||0,bl=L12.bLost||0;
  $('menu').querySelector('h1').textContent='OPERACIÓN CIELO DE ACERO';
  $('tx').innerHTML='<b style="font-size:19px;color:#e0b050">Bombardeo completado</b><br><br>• Objetivos industriales: <b>destruidos</b> ('+n+'/6)<br>• Formación de bombarderos: <b>parcialmente superviviente</b> ('+Math.max(1,5-bl)+'/5)<br>• Cepelín Kaiser: <b>perdido</b><br>• Escuadrón: <b>disperso</b><br>• Protagonista: <b>superviviente</b><br><br>Aparatos y criaturas derribados por Weiss: <b>'+(L12.pk||0)+'</b> · Total de la formación: '+(L12.kills||0)+'<br><br><b>Siguiente misión:</b> Reunirse con las fuerzas terrestres y sobrevivir tras las líneas enemigas.<br><br><b style="font-size:20px;color:#e0b050">PUNTUACIÓN: '+score+'</b>';
  try{localStorage.setItem('cielo23','1');const o=$('lvsel').querySelector('option[value="12"]');if(o)o.text='XI · OPERACIÓN CIELO DE ACERO — ✔ completada'}catch(e){}return}
 return _end12(w)};
const _up12=update;update=function(dt){if(level===12&&L9.cine&&playing){V16.dt=dt;time+=dt;cine9Upd(dt);fx12(dt,true);if(L12.roll&&L12.ph<7)cam.rotateZ(L12.roll*.6);return}
 if(level!==12&&L12.on)leave12();_up12(dt);if(!playing||level!==12)return;if(!fpv&&L12.ph<7){fpv=true}updT12(dt);
 if(fpv){cam.position.y+=P.g.position.y-(L12.sit?.55:0)+(P.mg?.32:0);if(L12.roll)cam.rotateZ(L12.roll)}};
/* menú: misión XI con puntos de control */
{const done=(()=>{try{return localStorage.getItem('cielo23')==='1'}catch(e){return false}})();
 $('lvsel').insertAdjacentHTML('beforeend','<option value="12">XI · OPERACIÓN CIELO DE ACERO — Asalto aerotransportado '+(done?'✔ completada':'(nuevo)')+'</option>');
 const S='background:#302417;color:#f3e6c4;padding:10px;border:1px solid #a77b35';$('lvsel').parentElement.insertAdjacentHTML('afterend','<label id="cp12l">PUNTO DE CONTROL <select id="cp12" style="'+S+'"><option value="0">0:00 · Embarque en Falkenhorst (misión completa)</option><option value="1">0:45 · Despegue</option><option value="2">1:40 · Interceptación enemiga (MG 08)</option><option value="3">2:40 · Algo viene entre las nubes (dracos y dragón)</option><option value="4">3:45 · El objetivo aparece</option><option value="5">4:20 · El bombardeo</option><option value="6">5:10 · Derribo del cepelín</option></select></label>');
 const sx=()=>{$('cp12l').style.display=$('lvsel').value==='12'?'':'none'};$('lvsel').addEventListener('change',sx);sx()}
try{if(sessionStorage.getItem('sel12')){const v=sessionStorage.getItem('sel12');sessionStorage.removeItem('sel12');$('lvsel').value='12';$('cp12').value=v;$('cp12l').style.display=''}}catch(e){}
const _g12=$('go').onclick;$('go').onclick=function(){if($('lvsel').value!=='12')return _g12.apply(this,arguments);if(L12.built){try{sessionStorage.setItem('sel12',$('cp12').value)}catch(e){}location.reload();return}V20.ps2=$('ps2fog').value;try{ac=new(window.AudioContext||window.webkitAudioContext)();if(ac.state==='suspended')ac.resume();startMusic()}catch(e){}$('menu').style.display='none';P.g.visible=true;cam.fov=65;cam.updateProjectionMatrix();$('fade12').style.opacity=0;startLevel12();try{rend.domElement.requestPointerLock()}catch(e){}};
document.querySelector('#menu p b').textContent='Misión 0 + Capítulos I–XI · v23 OPERACIÓN CIELO DE ACERO';
$('hs').insertAdjacentHTML('beforebegin','<p class="c" style="color:#d8e0f0">NUEVO v23 · Misión XI «Operación Cielo de Acero»: embarque en la base de Falkenhorst, despegue en el cepelín Kaiser, MG 08 de góndola con cintas y recalentamiento, cazas, dracos y un dragón de guerra, bombardeo de una ciudad industrial, derribo y salto en paracaídas · puntos de control</p>');
