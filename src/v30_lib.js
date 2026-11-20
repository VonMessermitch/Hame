/* =====================================================================
   v30 · BIBLIOTECA DE RECURSOS REUTILIZABLES (Eisenmark)
   Todos los modelos devuelven Groups sin añadir a la escena (salvo que se
   indique) y comparten geometrías y materiales en caché.
   - LIB30.para(x,z,o)      paracaidista de Eisenmark completo (NPC)
   - LIB30.paraHelm(hd)     casco aerotransportado
   - LIB30.gasMask(hd,o)    máscara de gas (lentes, filtro, correas, tubo)
   - LIB30.chutePack(ch)    mochila de paracaídas, arnés, cinturón y cargadores
   - LIB30.canopy()         campana del paracaídas con cordajes
   - LIB30.beacon()         baliza de lanzamiento (luz intermitente)
   - LIB30.flak88()         cañón de 88 mm sobre cureña cruciforme
   - LIB30.aaHybrid()       antiaéreo híbrido cuádruple (Bofors + Flakvierling)
   - LIB30.femHead(n,v)     3 variantes de cabeza femenina
   - LIB30.marineHelm(hd)   casco de acero de la infantería de marina (v2)
   - LIB30.zhKit(e,kind)    infantería de marina de Zheng-Hua: recon, línea, choque, apoyo
   - LIB30.vanguard(x,z,o)  Vanguardia de Infantería de Choque de Eisenmark (Alejandría)
   ===================================================================== */
const GC30={},MC30={};
const gc30=(k,f)=>GC30[k]||(GC30[k]=f());
const mc30=(c,o)=>{const k=c+'|'+JSON.stringify(o||{});return MC30[k]||(MC30[k]=new T.MeshLambertMaterial(Object.assign({color:c},o||{})))};
const P30={smock:0x5c604a,smockD:0x454a38,pants:0x3e4436,helm:0x4a4e44,lea:0x3a2616,web:0x5a5236,rub:0x2a2c28,brass:0xb0903a,steel:0x5a5e60};
/* ---------- casco aerotransportado: cúpula compacta, ala corta recta, protección lateral ---------- */
function paraHelm30(hd,col){const c=col||P30.helm;const g=gc30('ph',()=>{const pts=[];for(let i=0;i<=10;i++){const a=i/10*1.5708;pts.push(new T.Vector2(Math.sin(a)*.245+.0001,Math.cos(a)*.21+.03))}pts.push(new T.Vector2(.262,.02));pts.push(new T.Vector2(.262,-.035));pts.push(new T.Vector2(.25,-.04));return new T.LatheGeometry(pts.reverse(),18)});
 const m=new T.Mesh(g,mc30(c,{side:T.DoubleSide}));m.position.y=.27;m.scale.set(1,1,1.08);hd.add(m);
 const q=PB();pa(q,new T.TorusGeometry(.257,.012,4,20),shade(c,.75),0,.24,0,1.5708,0,0,1,1.08,1);for(const s of[-1,1]){pCyl(q,.016,.016,.02,0x2a2a2a,s*.255,.3,.04,0,0,1.5708,6);pBox(q,.02,.2,.025,P30.lea,s*.2,.13,.06,0,0,s*.2);pBox(q,.02,.14,.025,P30.lea,s*.16,.12,-.08,0,0,s*.25)}pBox(q,.13,.025,.03,P30.lea,0,.02,.16);
 pBox(q,.06,.07,.01,0x7a1a2a,.15,.36,.15,0,.6,0);pBox(q,.03,.04,.012,0xc8a840,.152,.36,.153,0,.6,0);for(let i=0;i<5;i++)pBox(q,.03,.012,.012,shade(c,.62),(R()-.5)*.3,.28+R()*.18,.2,0,R(),0);pbMesh(q,hd,VCM)}
/* ---------- máscara de gas de época: pieza facial de goma, lentes con aro metálico, filtro estriado ---------- */
function gasMask30(hd,o){o=o||{};const g=new T.Group();g.name='gasmask';const q=PB();pa(q,gc30('mf',()=>new T.SphereGeometry(.17,10,8,0,6.283,0,2.2)),P30.rub,0,.12,.13,1.35,0,0,1.05,.95,.7);
 for(const s of[-1,1]){pCyl(q,.052,.052,.035,0x6a6a5a,s*.075,.2,.215,1.5708,0,0,12);pCyl(q,.042,.042,.04,0x1c2c30,s*.075,.2,.22,1.5708,0,0,12)}
 pCyl(q,.05,.06,.07,0x3a3c38,0,.07,.25,1.3,0,0,10);if(!o.hose){pCyl(q,.065,.065,.12,0x4a4e44,0,.03,.33,1.3,0,0,12);for(let i=0;i<4;i++)pCyl(q,.068,.068,.012,0x2a2c28,0,.0+i*.02,.31+i*.025,1.3,0,0,12)}
 for(const s of[-1,1]){pBox(q,.02,.025,.3,P30.rub,s*.17,.2,.03,0,s*.15,0);pBox(q,.02,.022,.28,P30.rub,s*.15,.1,.0,0,s*.1,-.2)}pBox(q,.3,.02,.025,P30.rub,0,.3,-.15);
 if(o.hose){for(let i=0;i<6;i++)pCyl(q,.03,.03,.07,0x2a2c28,0,-.02-i*.06,.27-i*.01,.3,0,0,8)}pbMesh(q,g,VCM);hd.add(g);return g}
/* ---------- mochila de paracaídas, arnés en X, cinturón con portacargadores, rodilleras ---------- */
function chutePack30(n){const u=n.g?n.g.userData:n.userData;const qc=PB();pBox(qc,.5,.46,.2,0x5a5440,0,.4,-.33);pBox(qc,.52,.04,.22,0x3a3426,0,.62,-.33);pBox(qc,.08,.08,.06,0x8a2a1a,.2,.2,-.44);for(const s of[-1,1]){pBox(qc,.06,.7,.025,P30.web,s*.14,.38,.215,0,0,s*.38);pBox(qc,.07,.46,.03,P30.web,s*.25,.42,-.2)}pBox(qc,.3,.06,.03,P30.web,0,.26,.225);pBox(qc,.1,.1,.03,P30.steel,0,.26,.24);
 pBox(qc,.68,.08,.44,P30.lea,0,.06,0);for(const x of[-.22,-.12,.12,.22])pBox(qc,.09,.16,.07,0x4a4430,x,.06,.25);pBox(qc,.12,.12,.08,0x4a4430,-.3,.05,.14);pCyl(qc,.05,.05,.16,0x4a4e44,.3,.1,-.12,0,0,0,8);
 for(const s of[-1,1])pBox(qc,.18,.12,.08,P30.smockD,s*.16,.36,.215);pbMesh(qc,u.ch,VCM);
 for(const k of[u.k1,u.k2]){if(!k)continue;const qk=PB();pBox(qk,.2,.14,.08,0x2a2a24,0,-.04,.12);pbMesh(qk,k,VCM)}}
/* ---------- paracaidista completo (NPC compatible con npcUpd11 / compUpd13) ---------- */
function para30(x,z,o){o=o||{};const g=mkSoldier({coat:P30.smock,pants:P30.pants,hat:'none',hatC:P30.helm,tab:GARNET,rank:o.rank||0,pack:false,officer:!!o.officer,puttee:0x2a2420,face:o.face});
 gear20(g,{web:false,boots:true,glove:true});const u=g.userData;
 {const q=PB();for(let i=0;i<7;i++)pBox(q,.1+R()*.12,.08+R()*.1,.012,P30.smockD,(R()-.5)*.5,.15+R()*.5,.208);for(const s of[-1,1]){pBox(q,.14,.12,.02,P30.smockD,s*.16,.2,.212)}pbMesh(q,u.ch,VCM)}
 paraHelm30(u.hd);const pp=Object.assign({},o);const n={g,u,act:o.act||'idle',t:R()*9,f:o.f||0,name:o.name||'Paracaidista',path:null,pi:0,sp:3.4,vx:0,vz:0,tgt:null,lv:o.lv||16,hp:100};
 chutePack30(n);n.mask=gasMask30(u.hd,{hose:false});n.mask.visible=!!o.mask;if(o.w)arm13(n,o.w);else n.wpn='r';g.position.set(x,0,z);g.rotation.y=o.f||0;scene.add(g);NPC11.push(n);return n}
/* ---------- campana del paracaídas con cordajes (geometría compartida) ---------- */
function canopy30(col){const g=new T.Group();const geo=gc30('cn',()=>new T.SphereGeometry(4.2,14,6,0,6.283,0,1.25));const m=new T.Mesh(geo,mc30(col||0x8a8a6a,{side:T.DoubleSide}));m.scale.set(1,.55,1);m.position.y=7.2;g.add(m);
 const lp=[];for(let i=0;i<12;i++){const a=i/12*6.283;lp.push(Math.cos(a)*4,7.2+Math.sin(1.25)*0,Math.sin(a)*4, 0,1.5,0)}const lg=new T.BufferGeometry();lg.setAttribute('position',new T.Float32BufferAttribute(lp,3));g.add(new T.LineSegments(lg,gc30('lnm',()=>new T.LineBasicMaterial({color:0x2a2a22}))));
 const q=PB();for(let i=0;i<14;i++){const a=i/14*6.283;pBox(q,.05,.05,.05,0x6a6a52,Math.cos(a)*4.15,7.25,Math.sin(a)*4.15)}pbMesh(q,g,VCV);return g}
/* ---------- baliza de lanzamiento (trípode, caja de radio, lámpara intermitente) ---------- */
function beacon30(){const g=new T.Group(),q=PB();for(let i=0;i<3;i++){const a=i/3*6.283;pBox(q,.04,1.3,.04,0x3a3a30,Math.sin(a)*.3,.6,Math.cos(a)*.3,Math.cos(a)*.25,0,-Math.sin(a)*.25)}pBox(q,.36,.26,.22,0x3e4436,0,.15,.5);pBox(q,.04,.5,.04,0x2a2a2a,.12,.5,.5);pCyl(q,.08,.1,.12,0x2a2a2a,0,1.25,0,0,0,0,8);pbMesh(q,g,VCV);
 const l=new T.Mesh(gSph(.1,8,6),new T.MeshBasicMaterial({color:0xff3a20}));l.position.y=1.35;g.add(l);const h=new T.Mesh(gSph(.9,10,8),new T.MeshBasicMaterial({color:0xff4020,transparent:true,opacity:.25,depthWrite:false,blending:T.AdditiveBlending}));h.position.y=1.35;g.add(h);g.userData={lamp:l,halo:h};return g}
/* ---------- cañón de 88 mm: cureña cruciforme, freno de boca, recuperadores, equilibradores, escudo ---------- */
function flak88_30(o){o=o||{};const g=new T.Group(),C=o.col||0x4e5446,D=shade(C,.75),q=PB();
 pBox(q,6,.22,.5,C,0,.25,0);pBox(q,.5,.22,6,C,0,.25,0);for(const [x,z] of[[3,0],[-3,0],[0,3],[0,-3]]){pCyl(q,.18,.24,.25,D,x,.12,z,0,0,0,8);pCyl(q,.05,.05,.35,0x2a2a2a,x,.4,z,0,0,0,6)}pCyl(q,.55,.7,.6,C,0,.6,0,0,0,0,12);
 if(o.wheels)for(const z of[-3.4,3.4])for(const s of[-1,1])pCyl(q,.45,.45,.22,0x1e1e1e,s*.85,.45,z,0,0,1.5708,14);pbMesh(q,g,VCV);
 const yaw=new T.Group();yaw.position.y=.9;g.add(yaw);{const qy=PB();pCyl(qy,.75,.75,.2,C,0,0,0,0,0,0,14);for(const s of[-1,1]){pBox(qy,.14,1.1,1.4,C,s*.45,.6,0);pBox(qy,.4,.06,.35,0x2a2a2a,s*.95,.55,-.4);pCyl(qy,.13,.13,.04,0x6a6a5a,s*.62,.7,.1,0,0,1.5708,12)}pBox(qy,2.2,1.4,.06,D,0,.9,.95,-.15,0,0);pBox(qy,.3,.4,.3,0x3a3a30,.7,.6,-.6);pBox(qy,.14,.14,.4,0x1a1a1a,-.55,1.25,.2);pbMesh(qy,yaw,VCV)}
 const pit=new T.Group();pit.position.set(0,1.05,0);yaw.add(pit);const brl=new T.Group();pit.add(brl);{const qb=PB();pBox(qb,.36,.36,1.3,D,0,0,-.2);pCyl(qb,.11,.13,5.6,0x3a3e38,0,0,2.9,1.5708,0,0,12);pCyl(qb,.17,.17,.5,0x2e322c,0,0,5.8,1.5708,0,0,12);for(let i=0;i<3;i++)pBox(qb,.36,.06,.04,0x1a1a1a,0,0,5.66+i*.12);pCyl(qb,.09,.09,2.2,C,0,.24,.9,1.5708,0,0,10);pCyl(qb,.09,.09,2.2,C,0,-.22,.9,1.5708,0,0,10);for(const s of[-1,1])pCyl(qb,.07,.07,1.4,0x3a3a34,s*.3,.25,-.1,1.3,0,0,8);pbMesh(qb,brl,VCV)}
 const mz=new T.Object3D();mz.position.set(0,0,6.1);brl.add(mz);g.userData={yaw,pitch:pit,barrel:brl,muzzles:[mz],kick:0};return g}
/* animación genérica de retroceso para cañones de esta biblioteca */
function gunKick30(m,dt){const u=m.userData;if(u.kick>0){u.kick=Math.max(0,u.kick-dt*2.4);const k=u.kick;for(const b of(u.barrels||[u.barrel]))if(b)b.position.z=-.55*Math.sin(k*Math.PI)*(k>.5?1:k*2)}}
/* ---------- antiaéreo híbrido cuádruple de Zheng-Hua/Eisenmark (Bofors + Flakvierling) ---------- */
function aaHybrid30(o){o=o||{};const g=new T.Group(),C=o.col||0x4a4e46,D=shade(C,.72),q=PB();
 pBox(q,4.6,.2,.45,C,0,.22,0,0,.785,0);pBox(q,4.6,.2,.45,C,0,.22,0,0,-.785,0);for(const a of[.785,2.356,3.927,5.497]){const x=Math.cos(a)*2.2,z=Math.sin(a)*2.2;pCyl(q,.2,.26,.2,D,x,.1,z,0,0,0,8);pCyl(q,.05,.05,.32,0x2a2a2a,x,.36,z,0,0,0,6)}pCyl(q,.8,.95,.45,C,0,.5,0,0,0,0,14);for(let i=0;i<8;i++){const a=i/8*6.283;pBox(q,.08,.12,.08,0x2a2a2a,Math.cos(a)*.85,.75,Math.sin(a)*.85)}
 if(o.wheels!==false)for(const s of[-1,1])pCyl(q,.4,.4,.2,0x1a1a1a,s*1.6,.4,-1.6,0,0,1.5708,12);pbMesh(q,g,VCV);
 const yaw=new T.Group();yaw.position.y=.78;g.add(yaw);{const qy=PB();pCyl(qy,1.05,1.05,.16,C,0,0,0,0,0,0,16);for(const s of[-1,1]){pBox(qy,.16,.95,1.1,C,s*.42,.55,0);pBox(qy,.42,.08,.38,0x2a2622,s*1.15,.5,-.35);pBox(qy,.36,.42,.06,0x2a2622,s*1.15,.75,-.55);pCyl(qy,.16,.16,.04,0x6a6a5a,s*.62,.65,.25,0,0,1.5708,12);pBox(qy,.06,.6,.06,0x2a2a2a,s*1.1,.25,-.35)}
  pBox(qy,2.4,1.0,.06,D,0,.75,.85,-.12,0,0);pBox(qy,.5,.36,.06,D,0,1.35,.86,-.12,0,0);pBox(qy,.16,.24,.16,0x1a1a1a,.0,1.5,.2);pCyl(qy,.1,.1,.12,0x8a8a7a,0,1.66,.2,1.5708,0,0,10);pbMesh(qy,yaw,VCV)}
 const pit=new T.Group();pit.position.set(0,1.0,0);yaw.add(pit);const bars=[],mzs=[];
 for(const [x,y] of[[-.32,.16],[.32,.16],[-.32,-.16],[.32,-.16]]){const b=new T.Group();b.position.set(x,y,0);pit.add(b);const qb=PB();pBox(qb,.2,.22,.9,C,0,0,0);pCyl(qb,.045,.055,2.4,0x2e322c,0,0,1.6,1.5708,0,0,10);pa(qb,gCone(.075,.32,10),0x1e1e1e,0,0,2.9,1.5708);pCyl(qb,.07,.07,.5,0x3a3a34,0,.0,.6,1.5708,0,0,10);if(y>0){pBox(qb,.14,.34,.3,0x8a7a4a,0,.3,-.05);for(let i=0;i<4;i++)pBox(qb,.15,.02,.06,0xb0903a,0,.2+i*.07,-.05)}pbMesh(qb,b,VCV);const mz=new T.Object3D();mz.position.set(0,0,3.05);b.add(mz);bars.push(b);mzs.push(mz)}
 g.userData={yaw,pitch:pit,barrels:bars,muzzles:mzs,kick:0,alive:true};return g}
/* ---------- cabezas femeninas (3 variantes) para enfermeras y personal civil ---------- */
const HAIR30=[0x3a2416,0x1a1210,0x8a6a3a,0x6a2e1a];
function femHead30(n,v){const hd=(n.u||n.g.userData).hd;v=v===undefined?(R()*3|0):v;const hc=HAIR30[R()*HAIR30.length|0];const q=PB();
 /* rasgos: labios, cejas finas, pestañas, mejillas */pBox(q,.07,.022,.02,0xa83a3a,0,.085,.2);pBox(q,.045,.012,.02,0x8a2a2a,0,.07,.2);for(const s of[-1,1]){pBox(q,.06,.012,.02,shade(hc,.8),s*.075,.235,.2);pBox(q,.055,.012,.02,0x1a1210,s*.075,.2,.205);pBox(q,.045,.03,.012,0xe0a090,s*.1,.13,.198)}
 if(v===0){/* moño bajo */pBox(q,.36,.1,.37,hc,0,.32,-.01);pBox(q,.36,.28,.08,hc,0,.2,-.18);pa(q,gSph(.09,8,6),hc,0,.18,-.25);pBox(q,.3,.05,.02,hc,0,.29,.19)}
 else if(v===1){/* melena corta (bob) */pBox(q,.4,.12,.4,hc,0,.33,0);for(const s of[-1,1])pBox(q,.05,.26,.32,hc,s*.2,.18,-.02);pBox(q,.4,.3,.07,hc,0,.17,-.19);pBox(q,.34,.06,.03,hc,0,.27,.19)}
 else{/* trenza recogida */pBox(q,.37,.1,.38,hc,0,.32,0);pBox(q,.34,.22,.07,hc,0,.21,-.19);for(let i=0;i<4;i++)pa(q,gSph(.05,6,5),hc,0,.12-i*.08,-.23-i*.01);pBox(q,.32,.05,.02,hc,0,.28,.19)}
 pbMesh(q,hd,VCM)}
/* ---------- casco de acero de la infantería de marina (v2): perfil torneado con ala ensanchada,
   reborde enrollado, cresta, remaches, barbuquejo y desgaste ---------- */
function marineHelm30(hd,col,crossOn){const c=col||0x4e5648;const geo=gc30('mh',()=>{const p=[[0,.3],[.07,.297],[.13,.284],[.18,.26],[.215,.225],[.238,.18],[.25,.13],[.258,.085],[.275,.055],[.305,.035],[.33,.02],[.335,.012]];return new T.LatheGeometry(p.map(v=>new T.Vector2(v[0],v[1])),20)});
 const m=new T.Mesh(geo,mc30(c,{side:T.DoubleSide}));m.position.y=.21;m.scale.set(1,1,1.1);hd.add(m);
 const q=PB();pa(q,gc30('mhr',()=>new T.TorusGeometry(.335,.011,4,24)),shade(c,.8),0,.225,0,1.5708,0,0,1,1.1,1);pa(q,gc30('mhc',()=>new T.TorusGeometry(.12,.02,4,10,3.14)),shade(c,1.05),0,.47,0,0,1.5708,0,1,1,1.8);
 for(const s of[-1,1]){pCyl(q,.018,.018,.02,0x2a2a2a,s*.255,.34,0,0,0,1.5708,6);pBox(q,.02,.2,.022,P30.lea,s*.2,.13,.05,0,0,s*.18)}pBox(q,.12,.022,.03,P30.lea,0,.03,.15);
 for(let i=0;i<6;i++)pBox(q,.035,.01,.01,shade(c,.6),(R()-.5)*.35,.3+R()*.15,.22,0,R(),0);if(crossOn){pBox(q,.12,.12,.012,0xf2f2ee,0,.36,.255);pBox(q,.09,.025,.014,0xb01e1e,0,.36,.258);pBox(q,.025,.09,.014,0xb01e1e,0,.36,.258)}pbMesh(q,hd,VCM)}
/* ---------- infantería de marina de Zheng-Hua (aplica sobre soldados creados con sp28 / sp16) ---------- */
const ZHC30={marine:0x34404a,dark:0x262e36,khaki:0x6a6448,red:0xa82a1a,gold:0xc8a030};
function zhKit30(e,kind){const u=e.g.userData,hd=u.hd;for(let i=hd.children.length-1;i>=0;i--){const c=hd.children[i];if(c.isMesh&&c.u27)hd.remove(c)}
 const M={};M[ZH28.coat]=ZHC30.marine;e.g.traverse(m=>{if(!m.isMesh||!m.material||!m.material.color||m.material.vertexColors)return;const h=m.material.color.getHex();if(M[h]!==undefined)m.material=mc30(M[h])});
 const q=PB();if(kind==='recon'){pBox(q,.36,.12,.36,ZHC30.dark,0,.36,0);pBox(q,.32,.03,.16,ZHC30.dark,0,.31,.2);pBox(q,.05,.05,.02,ZHC30.gold,0,.38,.183);pbMesh(q,hd,VCM);const qc=PB();pBox(qc,.34,.08,.34,ZHC30.khaki,0,.7,0);pbMesh(qc,u.ch,VCM)}
 else{marineHelm30(hd,kind==='vanguard'?0x3a3e40:0x5a5a40);pBox(q,.04,.04,.012,ZHC30.red,0,.39,.258);pbMesh(q,hd,VCM)}
 if(kind==='vanguard'){const qa=PB();pBox(qa,.7,.62,.1,0x4a4e52,0,.36,.23,.06);for(let i=0;i<3;i++)pBox(qa,.72,.04,.11,0x2a2e32,0,.18+i*.18,.24);for(const s of[-1,1])pBox(qa,.3,.14,.42,0x4a4e52,s*.4,.7,0,0,0,s*.25);pbMesh(qa,u.ch,VCM);gasMask30(hd,{hose:true});e.hp*=1.5;e.max=e.hp;e.k8n='a un soldado de choque de Zheng-Hua'}
 if(kind==='support'){const qs=PB();pBox(qs,.3,.24,.18,0x3a3a2a,.2,.2,.24);pBox(qs,.3,.24,.18,0x3a3a2a,-.2,.2,.24);pbMesh(qs,u.ch,VCM);e.k8n='a un ametrallador de marina de Zheng-Hua'}
 if(kind==='recon')e.k8n='a un explorador de marina de Zheng-Hua';if(kind==='line')e.k8n='a un infante de marina de Zheng-Hua';e.zk=kind;return e}
/* ---------- Vanguardia de Infantería de Choque de Eisenmark (recursos de Alejandría: mkEis) ---------- */
function vanguard30(x,z,o){o=o||{};const g=mkEis({armor:true,mask:!!o.mask});g.position.set(x,0,z);scene.add(g);const n={g,u:g.userData,act:'idle',t:R()*9,f:o.f||0,name:o.name||'Sturmmann',path:null,pi:0,sp:4,vx:0,vz:0,tgt:null,lv:o.lv||15,hp:160,van:true};NPC11.push(n);arm13(n,o.w||'smg');{const q=PB();for(let i=0;i<3;i++)pCyl(q,.035,.035,.18,0x3a3a2a,-.24+i*.05,.08,.2,0,0,0,6);pBox(q,.14,.1,.08,0x3a3a2a,.25,.1,.22);pbMesh(q,n.u.ch,VCM)}return n}
const LIB30={para:para30,paraHelm:paraHelm30,gasMask:gasMask30,chutePack:chutePack30,canopy:canopy30,beacon:beacon30,flak88:flak88_30,aaHybrid:aaHybrid30,femHead:femHead30,marineHelm:marineHelm30,zhKit:zhKit30,vanguard:vanguard30,gunKick:gunKick30};
