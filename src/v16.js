/* =====================================================================
   v16 · EDICIÓN DEFINITIVA — remasterización y expansión del Capítulo VIII
   (cielo nocturno de doble luna, guarnición combatiente, teniente autónomo,
   búnkeres habitables, camiones y tanque nuevos, destrucción parcial,
   cinemática del avance blindado, movimiento con inercia, pausa, audio)
   ===================================================================== */
const V16={kick:0,land:0,bob:0,swT:0,thT:0,hurtT:0,stam:100,fat:0,paused:false,hadLock:false,bark:0,phaseShown:-1};
/* ---------- utilidades de geometría compartida y mallas fusionadas ---------- */
const GQ={};
function gBox(w,h,d){const k='b'+w+'|'+h+'|'+d;return GQ[k]||(GQ[k]=new T.BoxGeometry(w,h,d))}
function gCyl(a,b,h,s){s=s||8;const k='c'+a+'|'+b+'|'+h+'|'+s;return GQ[k]||(GQ[k]=new T.CylinderGeometry(a,b,h,s))}
function gSph(r,ws,hs,ts,tl){const k='s'+r+'|'+ws+'|'+hs+'|'+(ts||0)+'|'+(tl||0);return GQ[k]||(GQ[k]=new T.SphereGeometry(r,ws,hs,0,6.2832,ts||0,tl||Math.PI))}
function gCone(r,h,s){const k='k'+r+'|'+h+'|'+s;return GQ[k]||(GQ[k]=new T.ConeGeometry(r,h,s||8))}
function gTor(r,t,rs,ts,arc){const k='t'+r+'|'+t+'|'+rs+'|'+ts+'|'+(arc||0);return GQ[k]||(GQ[k]=new T.TorusGeometry(r,t,rs,ts,arc||6.2832))}
const fabT=pixTex(32,32,(c,s)=>{c.fillStyle='#fff';c.fillRect(0,0,s,s);for(let i=0;i<260;i++){const v=200+R()*55|0;c.fillStyle='rgb('+v+','+v+','+v+')';c.fillRect(R()*s|0,R()*s|0,1+(R()*2|0),1)}for(let y=0;y<s;y+=3){c.fillStyle='rgba(0,0,0,.05)';c.fillRect(0,y,s,1)}});
fabT.wrapS=fabT.wrapT=T.RepeatWrapping;fabT.magFilter=T.LinearFilter;
const VCM=new T.MeshLambertMaterial({vertexColors:true,map:fabT}),VCB=new T.MeshBasicMaterial({vertexColors:true});
const _pm=new T.Matrix4(),_pq=new T.Quaternion(),_pe=new T.Euler(),_ps=new T.Vector3(),_pp=new T.Vector3(),_pv=new T.Vector3(),_pn=new T.Matrix3(),_pc=new T.Color();
/* PB: acumula piezas (geometría+color+transformación) y las fusiona en UNA malla con colores por vértice */
function PB(){return{L:[]}}
function pa(pb,geo,col,x,y,z,rx,ry,rz,sx,sy,sz,wear){pb.L.push({geo,col,x:x||0,y:y||0,z:z||0,rx:rx||0,ry:ry||0,rz:rz||0,sx:sx===undefined?1:sx,sy:sy===undefined?1:sy,sz:sz===undefined?1:sz,w:wear===undefined?.06:wear});return pb}
function pBox(pb,w,h,d,c,x,y,z,rx,ry,rz,wr){return pa(pb,gBox(w,h,d),c,x,y,z,rx,ry,rz,1,1,1,wr)}
function pCyl(pb,a,b,h,c,x,y,z,rx,ry,rz,s){return pa(pb,gCyl(a,b,h,s||8),c,x,y,z,rx,ry,rz)}
function pbGeo(pb){let nv=0,ni=0;for(const q of pb.L){nv+=q.geo.attributes.position.count;ni+=q.geo.index?q.geo.index.count:q.geo.attributes.position.count}
const pos=new Float32Array(nv*3),nor=new Float32Array(nv*3),uv=new Float32Array(nv*2),col=new Float32Array(nv*3),idx=nv>65000?new Uint32Array(ni):new Uint16Array(ni);let vo=0,io=0;
for(const q of pb.L){const g=q.geo,P_=g.attributes.position,N_=g.attributes.normal,U_=g.attributes.uv;_pe.set(q.rx,q.ry,q.rz,'YXZ');_pq.setFromEuler(_pe);_pp.set(q.x,q.y,q.z);_ps.set(q.sx,q.sy,q.sz);_pm.compose(_pp,_pq,_ps);_pn.getNormalMatrix(_pm);
_pc.setHex(q.col);const j=1+(R()-.5)*2*q.w;const cr=Math.min(1,_pc.r*j),cg=Math.min(1,_pc.g*j),cb=Math.min(1,_pc.b*j);
for(let i=0;i<P_.count;i++){_pv.fromBufferAttribute(P_,i).applyMatrix4(_pm);const o=(vo+i)*3;pos[o]=_pv.x;pos[o+1]=_pv.y;pos[o+2]=_pv.z;_pv.fromBufferAttribute(N_,i).applyMatrix3(_pn).normalize();nor[o]=_pv.x;nor[o+1]=_pv.y;nor[o+2]=_pv.z;col[o]=cr;col[o+1]=cg;col[o+2]=cb;if(U_){uv[(vo+i)*2]=U_.getX(i)*Math.max(1,q.sx*2);uv[(vo+i)*2+1]=U_.getY(i)*Math.max(1,q.sy*2)}}
if(g.index){for(let i=0;i<g.index.count;i++)idx[io++]=g.index.getX(i)+vo}else{for(let i=0;i<P_.count;i++)idx[io++]=vo+i}vo+=P_.count}
const bg=new T.BufferGeometry();bg.setAttribute('position',new T.BufferAttribute(pos,3));bg.setAttribute('normal',new T.BufferAttribute(nor,3));bg.setAttribute('uv',new T.BufferAttribute(uv,2));bg.setAttribute('color',new T.BufferAttribute(col,3));bg.setIndex(new T.BufferAttribute(idx,1));bg.computeBoundingSphere();return bg}
function pbMesh(pb,parent,mat){const m=new T.Mesh(pbGeo(pb),mat||VCM);if(parent)parent.add(m);return m}
const mixC=(a,b,t)=>{_pc.setHex(a);const c2=new T.Color(b);_pc.lerp(c2,t);return _pc.getHex()};
const shade=(c,k)=>{_pc.setHex(c);_pc.multiplyScalar(k);return _pc.getHex()};
/* ---------- SOLDADO v16: misma jerarquía de articulaciones que human() (compatible con poses, IA y ragdoll) ---------- */
const SK=[0xd2a679,0xc8986a,0xb88a5e,0xdcb48a,0xa87850],HAIR=[0x2a1c12,0x4a3420,0x1a1410,0x6a5030,0x8a7a6a];
function headgear(pb,kind,col,trim){
 if(kind==='helm'){pa(pb,gSph(.27,12,6,0,1.5708),col,0,.25,0,0,0,0,1.06,.92,1.16);pCyl(pb,.34,.36,.035,col,0,.25,.02,0,0,0,14);pBox(pb,.05,.05,.03,shade(col,.7),.27,.32,0);pBox(pb,.05,.05,.03,shade(col,.7),-.27,.32,0);pBox(pb,.3,.04,.02,0x2a2016,0,.16,.2)}
 else if(kind==='kepi'){/* kepi de oficial austrohúngaro M.1908/12: copa estructurada, banda, visera de charol, roseta e insignia */
  pCyl(pb,.205,.218,.27,col,0,.44,-.01,-.06,0,0,14);pCyl(pb,.206,.206,.012,shade(col,.8),0,.575,-.02,-.06,0,0,14);
  pCyl(pb,.222,.222,.07,shade(col,.72),0,.345,0,0,0,0,14);pCyl(pb,.224,.224,.018,trim,0,.385,0,0,0,0,14);pCyl(pb,.224,.224,.012,trim,0,.31,0,0,0,0,14);
  pBox(pb,.36,.022,.15,0x0a0806,0,.3,.24,.32,0,0,.02);pBox(pb,.34,.012,.03,0x1c1712,0,.29,.31,.32,0,0,.02);
  pCyl(pb,.042,.042,.02,trim,0,.45,.205,1.5708-.06,0,0,10);pCyl(pb,.022,.022,.024,0x1a1208,0,.45,.212,1.5708-.06,0,0,8);pBox(pb,.07,.05,.012,trim,0,.53,.198,-.06);
  pBox(pb,.3,.02,.02,trim,0,.322,.214);pBox(pb,.03,.03,.03,trim,.17,.31,.15);pBox(pb,.03,.03,.03,trim,-.17,.31,.15);pBox(pb,.012,.12,.02,0x0a0806,.2,.24,.12,0,0,.15);pBox(pb,.012,.12,.02,0x0a0806,-.2,.24,.12,0,0,-.15)}
 else if(kind==='cap'){pBox(pb,.4,.17,.38,col,0,.42,-.01,0,0,0,.05);pBox(pb,.42,.08,.4,shade(col,.85),0,.35,-.01);pBox(pb,.04,.04,.02,trim,0,.42,.19);pBox(pb,.26,.02,.1,shade(col,.6),0,.33,.22,.25)}
 else if(kind==='fez'){pCyl(pb,.15,.19,.24,0x8a1a1a,0,.42,0,0,0,0,10);pBox(pb,.02,.14,.02,0x111111,.1,.38,-.14)}}
function mkSoldier(o){o=o||{};const coat=o.coat||0x6f7c80,pants=o.pants||shade(coat,.78),hatC=o.hatC||0x4e5a52,skin=o.skin||SK[R()*SK.length|0],trim=o.trim||0xc9a23a,lea=o.leather||0x3a2414,det=G.detail>0;
const g=new T.Group(),sc=o.scale||(.95+R()*.1);
const mkL=x=>{const l=new T.Group();l.position.set(x,.8,0);const a=PB();pBox(a,.27,.44,.3,pants,0,-.2,0);pBox(a,.24,.08,.26,shade(pants,.9),0,-.38,.01);pbMesh(a,l);
 const k=new T.Group();k.position.y=-.4;const b=PB();pBox(b,.24,.3,.26,pants,0,-.14,0);pBox(b,.26,.2,.28,o.puttee||0x5a5440,0,-.27,0);for(let i=0;i<3;i++)pBox(b,.265,.015,.285,shade(o.puttee||0x5a5440,.7),0,-.2-i*.06,0,0,0,.2*(i%2?1:-1));
 pBox(b,.28,.14,.36,0x1a120c,0,-.36,.05);pBox(b,.29,.04,.38,0x0a0806,0,-.42,.05);pBox(b,.26,.06,.1,0x241810,0,-.31,.2);if(det)pBox(b,.04,.02,.02,0x777770,.12,-.33,.12);pbMesh(b,k);l.add(k);g.add(l);return[l,k]};
const [l1,k1]=mkL(-.16),[l2,k2]=mkL(.16);
const b=new T.Group();b.position.y=.8;g.add(b);{const q=PB();pBox(q,.5,.22,.34,pants,0,.05,0);pBox(q,.56,.08,.39,lea,0,.17,0);pBox(q,.1,.08,.02,0x9a8a5a,0,.17,.2);
 for(const s of[-1,1]){pBox(q,.15,.16,.11,lea,s*.15,.2,.22);pBox(q,.15,.03,.12,shade(lea,.8),s*.15,.27,.22)}
 if(det){pCyl(q,.08,.08,.22,0x4a4a3a,.3,.06,-.1);pCyl(q,.082,.082,.04,0x2a2a22,.3,.18,-.1);pBox(q,.06,.34,.12,0x4a3a28,-.3,-.04,-.08,.2);pBox(q,.14,.16,.05,0x5a5040,-.3,-.18,-.08,.2);pBox(q,.2,.22,.1,0x6a5e44,-.2,.0,-.2)}pbMesh(q,b)}
const ch=new T.Group();ch.position.y=.15;b.add(ch);{const q=PB();pBox(q,.66,.68,.38,coat,0,.34,0);pBox(q,.62,.18,.42,shade(coat,.95),0,.02,0);pBox(q,.3,.09,.3,coat,0,.71,0);pBox(q,.12,.12,.12,skin,0,.74,0);
 const tab=o.tab||0xa02a2a;pBox(q,.06,.05,.02,tab,.1,.7,.155);pBox(q,.06,.05,.02,tab,-.1,.7,.155);for(let i=0;i<5;i++)pBox(q,.04,.04,.02,0xb8a060,0,.6-i*.12,.195);
 for(const s of[-1,1]){pBox(q,.17,.06,.36,shade(coat,.9),s*.25,.69,0);pBox(q,.05,.05,.02,0x9a8a5a,s*.25,.72,.16);pBox(q,.05,.72,.03,lea,s*.17,.34,.205,0,0,s*.22);pBox(q,.05,.72,.03,lea,s*.17,.34,-.205,0,0,-s*.22)}
 pBox(q,.14,.1,.03,shade(coat,.85),-.17,.48,.2);pBox(q,.14,.1,.03,shade(coat,.85),.17,.48,.2);
 if(o.pack!==false){pBox(q,.46,.46,.22,o.packC||0x6a5a3c,0,.36,-.3);pBox(q,.46,.08,.24,shade(o.packC||0x6a5a3c,.8),0,.56,-.3);pCyl(q,.1,.1,.6,o.roll||0x5a5a48,0,.66,-.3,0,0,1.5708,8);if(det){pBox(q,.2,.14,.06,0x8a8a80,0,.2,-.43);pBox(q,.06,.4,.04,0x4a3a28,.18,.32,-.43,.15)}}
 if(o.rank){for(let i=0;i<o.rank;i++)pBox(q,.03,.03,.02,0xe0d0a0,.06+i*.045,.66,.16)}
 if(o.officer){/* oficial: cinturón Sam Browne, portamapas, prismáticos, faja dorada, cordón */
  pBox(q,.68,.07,.42,0x2a1a0e,0,.04,0);pBox(q,.05,.8,.03,0x2a1a0e,.12,.32,.205,0,0,-.42);pBox(q,.05,.8,.03,0x2a1a0e,-.12,.32,-.205,0,0,-.42);
  pBox(q,.66,.05,.43,trim,0,.1,0);pBox(q,.2,.26,.06,0x3a2414,.33,.06,.16,0,0,-.08);pCyl(q,.05,.05,.12,0x1a1a1a,-.12,.3,.23,1.5708);pCyl(q,.05,.05,.12,0x1a1a1a,-.02,.3,.23,1.5708);
  for(const s of[-1,1]){pBox(q,.19,.07,.38,trim,s*.25,.7,0);pBox(q,.04,.04,.02,0xffffff,s*.25,.74,.19)}pBox(q,.02,.4,.02,trim,-.2,.5,.2,0,0,.5);pBox(q,.1,.08,.02,trim,0,.68,.16)}
 pbMesh(q,ch)}
const hd=new T.Group();hd.position.y=.74;ch.add(hd);{const q=PB(),hc=o.hair===undefined?HAIR[R()*HAIR.length|0]:o.hair;pBox(q,.34,.36,.34,skin,0,.17,0,0,0,0,.03);pBox(q,.36,.12,.36,hc,0,.3,-.02);pBox(q,.34,.2,.06,hc,0,.2,-.16);
 for(const s of[-1,1]){pBox(q,.05,.04,.02,0x1a1208,s*.08,.2,.172);pBox(q,.04,.1,.06,skin,s*.18,.17,0);pBox(q,.08,.02,.02,hc,s*.08,.25,.172)}pBox(q,.06,.09,.07,shade(skin,.92),0,.13,.19);
 const fa=o.face===undefined?(R()*5|0):o.face;if(fa===1||fa===3)pBox(q,.16,.04,.04,hc,0,.075,.18);if(fa===2)pBox(q,.3,.14,.08,hc,0,.03,.16);if(fa===3)pBox(q,.12,.05,.05,hc,0,.0,.17);if(fa===4){pBox(q,.22,.035,.04,hc,0,.08,.18,0,0,0);pBox(q,.04,.05,.04,hc,.11,.06,.18);pBox(q,.04,.05,.04,hc,-.11,.06,.18)}
 headgear(q,o.hat||'helm',hatC,trim);pbMesh(q,hd)}
const mkA=x=>{const a=new T.Group();a.position.set(x,.58,0);a.rotation.order='YXZ';const q=PB();pBox(q,.2,.37,.22,coat,0,-.17,0);pBox(q,.21,.08,.23,shade(coat,.9),0,-.02,0);pbMesh(q,a);
 const e=new T.Group();e.position.y=-.36;const r=PB();pBox(r,.18,.32,.2,coat,0,-.16,0);pBox(r,.19,.07,.21,o.cuff||shade(coat,.75),0,-.3,0);pBox(r,.15,.15,.15,o.glove||skin,0,-.42,.01);pbMesh(r,e);
 const m=new T.Group();m.position.y=-.42;e.add(m);a.add(e);ch.add(a);return[a,e,m]};
const [aR,eR,mR]=mkA(-.45),[aL,eL,mL]=mkA(.45);
const sh=new T.Mesh(shG,shM);sh.rotation.x=-1.5708;sh.position.y=.03;g.add(sh);
g.scale.setScalar(sc);g.userData={l1,l2,k1,k2,b,ch,hd,aR,aL,eR,eL,mR,mL,ak:0,ay:0,v16:1};return g}
/* armas ligeras fusionadas (1 malla): fusil M95, carabina, MG Schwarzlose portátil, pistola C96 */
const WGC={};
function mkGun(kind){const k=kind||'rifle';if(!WGC[k]){const q=PB(),wd=0x6a4226,st=0x2a2d30,dk=0x151515;
 if(k==='rifle'||k==='carb'){const L=k==='rifle'?1:.82;pCyl(q,.024,.024,1.1*L,st,0,-.66*L,0,0,0,0,6);pBox(q,.08,.62*L,.075,wd,0,-.38*L,-.02);pBox(q,.085,.13,.11,st,0,.1,0);pBox(q,.03,.12,.03,st,.06,.18,.02);pBox(q,.075,.42,.11,wd,0,.42,-.05);pBox(q,.08,.18,.15,wd,0,.66,-.07);pBox(q,.085,.06,.16,dk,0,.77,-.08);pBox(q,.1,.025,.11,0x9a9a90,0,-.6*L,0);if(k==='rifle')pBox(q,.014,.45,.03,0xb8bcc0,0,-1.42,.01)}
 else if(k==='mg'){pCyl(q,.075,.075,.7,0x3a3a2a,0,-.55,0,0,0,0,8);pCyl(q,.025,.025,.35,dk,0,-1.05,0,0,0,0,6);pBox(q,.15,.45,.17,st,0,.0,0);pBox(q,.14,.2,.12,0x4a4a3a,.13,-.05,.0);pBox(q,.06,.16,.06,dk,0,.3,-.02);pBox(q,.05,.12,.05,dk,-.08,.33,.0);pBox(q,.05,.12,.05,dk,.08,.33,0)}
 else if(k==='c96'){pBox(q,.06,.34,.13,st,0,-.12,0);pBox(q,.05,.12,.24,st,0,-.05,-.16);pCyl(q,.02,.02,.28,dk,0,-.38,.02,0,0,0,6);pBox(q,.055,.16,.1,0x5a3a20,0,.1,-.06,.3)}
 WGC[k]=pbGeo(q)}return new T.Mesh(WGC[k],VCM)}
/* sable de oficial (melé del teniente) */
function mkSabre(){const q=PB();pBox(q,.03,.9,.012,0xc8ccd0,0,-.62,0,0,0,0,.02);pBox(q,.14,.03,.06,0xc9a23a,0,-.16,0);pBox(q,.04,.16,.05,0x1a1208,0,-.06,0);pa(q,gTor(.07,.012,4,8,3.1),0xc9a23a,0,-.1,.04,0,1.57,0);return pbMesh(q,null)}
/* ---------- kepi para el teniente: sustituye el casco convencional ---------- */
function stripHelmet(g){const hd=g.userData.hd;for(const c of hd.children.slice()){const t=c.geometry&&c.geometry.type;if(t==='SphereGeometry'||t==='CylinderGeometry'||c.position.y>.3||(t==='BoxGeometry'&&c.position.y>.28))hd.remove(c)}}
function addKepi(g,col,trim){const q=PB();headgear(q,'kepi',col,trim);const m=pbMesh(q,g.userData.hd);m.name='kepi';return m}
/* modelo del teniente (también para el NPC de la sesión informativa) */
const OFK={swiss:{coat:0x5a6a6e,pants:0x2a2e32,hat:0x4c5a60,trim:0xd8b850,tab:0x2a6a3a},milan:{coat:0x5b3430,pants:0x2e2624,hat:0x4a2e2a,trim:0xd8b850,tab:0xb02020},soviet:{coat:0x52613a,pants:0x2e3628,hat:0x4d5a36,trim:0xd8b850,tab:0xb63c32}};
function mkOfficerModel(){const k=OFK[doctrine]||OFK.swiss;const g=mkSoldier({coat:k.coat,pants:k.pants,hat:'kepi',hatC:k.hat,trim:k.trim,tab:k.tab,officer:true,pack:false,glove:0x8a6a48,puttee:0x1a120c,leather:0x2a1a0e,scale:1.06,face:1,hair:0x2a1c12,skin:0xd2a679});
 const u=g.userData;u.mR.add(mkGun('c96'));const sab=mkSabre();sab.position.set(.3,.1,-.05);sab.rotation.set(.25,0,.15);u.b.add(sab);u.sabre=sab;
 /* botas altas de montar */for(const k2 of[u.k1,u.k2]){const q=PB();pBox(q,.27,.36,.3,0x120c08,0,-.24,0);pbMesh(q,k2)}return g}
/* =====================================================================
   MEMORIA: liberar geometrías/materiales únicos de cadáveres retirados
   (el original los quitaba de la escena sin liberarlos: fuga en GPU)
   ===================================================================== */
const SHR={n:-1,g:new Set(),m:new Set()};
function sharedSets(){const n=Object.keys(GQ).length+Object.keys(gC).length+Object.keys(mC).length+matCache.size+Object.keys(WGC).length;if(n===SHR.n)return SHR;SHR.n=n;const g=SHR.g,m=SHR.m;g.clear();m.clear();
 [...Object.values(GQ),...Object.values(gC),...Object.values(WGC),...Object.values(RWG),...Object.values(SPG),TRW,hG,cgG,shG,bG,sG,pGeo,trG,flG].forEach(x=>x&&g.add(x));[...Object.values(mC),...matCache.values(),VCM,VCV,VCB,GLASS,shM,bM,sM,mM].forEach(x=>x&&m.add(x));return SHR}
function disp16(root){const S=sharedSets();root.traverse(o=>{if(o.geometry&&!S.g.has(o.geometry))o.geometry.dispose();if(o.material){const ms=Array.isArray(o.material)?o.material:[o.material];for(const q of ms)if(!S.m.has(q))q.dispose()}})}
const smkG=new T.SphereGeometry(1,8,6);
/* fusión diferida de humanoides originales: por articulación y textura (≈70 → ≈20 draw calls por figura) */
const _mA=new T.Matrix4(),_mB=new T.Matrix3();
function mergeHuman(g){const u=g.userData;if(!u||u.v16||u.mg16||!u.ch)return;u.mg16=1;const J=[u.l1,u.k1,u.l2,u.k2,u.b,u.ch,u.hd,u.aR,u.eR,u.mR,u.aL,u.eL,u.mL].filter(Boolean),JS=new Set(J),S=sharedSets();
 for(const j of J){const groups=new Map();const walk=(o,M)=>{for(const c of o.children.slice()){if(JS.has(c))continue;if(!c.visible)continue;c.updateMatrix();const m2=new T.Matrix4().multiplyMatrices(M,c.matrix);
   if(c.isMesh&&c.geometry&&c.geometry.attributes.normal&&!Array.isArray(c.material)&&c.material.isMeshLambertMaterial&&!c.material.transparent){const mt=c.material,em=mt.emissive?mt.emissive.getHex():0;const k=(mt.map?mt.map.uuid:'-')+'|'+em;let a=groups.get(k);if(!a){a={map:mt.map,em,L:[]};groups.set(k,a)}a.L.push({c,m:m2,col:mt.color.getHex()})}
   if(c.children.length)walk(c,m2)}};walk(j,new T.Matrix4());
  for(const a of groups.values()){if(a.L.length<2)continue;let nv=0,ni=0;for(const q of a.L){const G=q.c.geometry;nv+=G.attributes.position.count;ni+=G.index?G.index.count:G.attributes.position.count}
   const pos=new Float32Array(nv*3),nor=new Float32Array(nv*3),uv=new Float32Array(nv*2),col=new Float32Array(nv*3),idx=nv>65000?new Uint32Array(ni):new Uint16Array(ni);let vo=0,io=0;
   for(const q of a.L){const G=q.c.geometry,P_=G.attributes.position,N_=G.attributes.normal,U_=G.attributes.uv;_mB.getNormalMatrix(q.m);_pc.setHex(q.col);
    for(let i=0;i<P_.count;i++){_pv.fromBufferAttribute(P_,i).applyMatrix4(q.m);const o=(vo+i)*3;pos[o]=_pv.x;pos[o+1]=_pv.y;pos[o+2]=_pv.z;_pv.fromBufferAttribute(N_,i).applyMatrix3(_mB).normalize();nor[o]=_pv.x;nor[o+1]=_pv.y;nor[o+2]=_pv.z;col[o]=_pc.r;col[o+1]=_pc.g;col[o+2]=_pc.b;if(U_){uv[(vo+i)*2]=U_.getX(i);uv[(vo+i)*2+1]=U_.getY(i)}}
    if(G.index){for(let i=0;i<G.index.count;i++)idx[io++]=G.index.getX(i)+vo}else{for(let i=0;i<P_.count;i++)idx[io++]=vo+i}vo+=P_.count;
    const c=q.c;c.parent.remove(c);if(!S.g.has(c.geometry))c.geometry.dispose();if(!S.m.has(c.material))c.material.dispose()}
   const bg=new T.BufferGeometry();bg.setAttribute('position',new T.BufferAttribute(pos,3));bg.setAttribute('normal',new T.BufferAttribute(nor,3));bg.setAttribute('uv',new T.BufferAttribute(uv,2));bg.setAttribute('color',new T.BufferAttribute(col,3));bg.setIndex(new T.BufferAttribute(idx,1));bg.computeBoundingSphere();
   const mm=new T.Mesh(bg,new T.MeshLambertMaterial({vertexColors:true,map:a.map||null,emissive:a.em}));j.add(mm)}}}
function mergeTick(){let n=0;for(const e of enemies){if(e.g.userData.mg16)continue;e.mgT=(e.mgT||0)+1;if(e.mgT>3){mergeHuman(e.g);if(++n>=2)return}}for(const a of allies)if(a.name&&a.g.visible&&!a.g.userData.mg16&&n<2){mergeHuman(a.g);n++}for(const q of npcs)if(!q.g.userData.mg16&&n<2){mergeHuman(q.g);n++}}
smkUpd=function(dt){const a=L8.sm||[];for(let i=a.length-1;i>=0;i--){const s=a[i];s.l-=dt;s.m.scale.multiplyScalar(1+dt*.04);s.m.material.opacity=Math.min(.5,s.l/12*.5);if(s.l<=0){scene.remove(s.m);s.m.material.dispose();a.splice(i,1)}}};
/* =====================================================================
   VEHÍCULOS v16
   ===================================================================== */
const vehT=pixTex(64,64,(c,s)=>{c.fillStyle='#fff';c.fillRect(0,0,s,s);for(let i=0;i<500;i++){const v=205+R()*50|0;c.fillStyle='rgb('+v+','+v+','+(v-4)+')';c.fillRect(R()*s|0,R()*s|0,2,2)}
 for(let i=0;i<14;i++){c.fillStyle='rgba(60,40,20,.12)';c.fillRect(R()*s,R()*s,2+R()*3,6+R()*14)}c.fillStyle='rgba(0,0,0,.12)';for(let x=0;x<s;x+=16)c.fillRect(x,0,1,s);for(let y=0;y<s;y+=16)c.fillRect(0,y,s,1);c.fillStyle='rgba(0,0,0,.25)';for(let x=4;x<s;x+=8)for(let y=4;y<s;y+=16)c.fillRect(x,y,1,1)});
vehT.wrapS=vehT.wrapT=T.RepeatWrapping;
const VCV=new T.MeshLambertMaterial({vertexColors:true,map:vehT});
const GLASS=new T.MeshLambertMaterial({color:0x1a2a36,transparent:true,opacity:.55,emissive:0x0a1218});
function crossMark(q,x,y,z,ax,s){const X=ax==='x';const b=(w,h,c,t)=>pBox(q,X?t:w,h,X?w:t,c,x,y,z,0,0,0,.02);b(s*1.12,s*.4,0x101010,.03);b(s*.4,s*1.12,0x101010,.03);b(s,s*.28,0xe8e6dc,.045);b(s*.28,s,0xe8e6dc,.045)}
/* rueda de camión: llanta maciza, disco de radios, buje */
let TRW=null;function truckWheelGeo(){if(TRW)return TRW;const q=PB();pCyl(q,.62,.62,.26,0x141412,0,0,0,0,0,1.5708,16);pCyl(q,.5,.5,.27,0x2a2a24,0,0,0,0,0,1.5708,14);pCyl(q,.42,.42,.28,0x4a5038,0,0,0,0,0,1.5708,12);for(let i=0;i<6;i++)pBox(q,.3,.06,.8,0x3a4030,0,0,0,i*.5236,0,0);pCyl(q,.13,.13,.34,0x2a2a26,0,0,0,0,0,1.5708,8);pCyl(q,.06,.06,.38,0x777770,0,0,0,0,0,1.5708,6);TRW=pbGeo(q);return TRW}
/* CAMIÓN v16 — transporte pesado de tropas (tipo Büssing / Gräf & Stift 1915): más largo, más alto y con plataforma ampliada */
function mkTruck16(o){o=o||{};const g=new T.Group(),q=PB(),C=o.col||0x56604a,CD=shade(C,.72),WD=0x7a5a3a,WD2=0x5e4428,MT=0x2a2c2a,BK=0x121210;
 /* chasis, ejes, ballestas */
 for(const s of[-1,1]){pBox(q,.16,.24,8.4,MT,s*.56,1.0,-.05);pBox(q,.1,.1,1.3,0x34352e,s*.56,.86,2.85);pBox(q,.1,.1,1.5,0x34352e,s*.56,.86,-2.3);for(let i=0;i<3;i++)pBox(q,.11,.03,1.25-i*.3,0x2a2a24,s*.56,.8-i*.04,2.85);for(let i=0;i<3;i++)pBox(q,.11,.03,1.45-i*.3,0x2a2a24,s*.56,.8-i*.04,-2.3)}
 pCyl(q,.07,.07,2.3,MT,0,.62,2.85,0,0,1.5708,6);pCyl(q,.12,.12,1.9,MT,0,.62,-2.3,0,0,1.5708,8);pBox(q,.4,.36,.36,0x30302a,0,.62,-2.3);pCyl(q,.06,.06,4.6,0x30302a,0,.75,.3,1.5708,0,0,6);
 for(let i=0;i<4;i++)pBox(q,1.2,.1,.12,MT,0,1.0,3.6-i*2.4);
 /* morro: radiador, capó con persianas, guardabarros curvos */
 pBox(q,1.32,1.12,.16,C,0,1.6,4.02);pBox(q,1.04,.86,.06,0x1c1c18,0,1.58,4.11);for(let i=0;i<9;i++)pBox(q,.025,.84,.04,0x3a3a32,-.44+i*.11,1.58,4.13);pCyl(q,.66,.66,.16,C,0,2.0,4.02,1.5708,0,0,14);
 pCyl(q,.06,.06,.12,0x8a8a7a,0,2.72,4.0);pBox(q,1.24,.8,2.0,C,0,1.62,3.0);pCyl(q,.62,.62,2.0,C,0,2.0,3.0,1.5708,0,0,12);
 for(const s of[-1,1]){for(let i=0;i<7;i++)pBox(q,.03,.36,.06,CD,s*.63,1.6,2.35+i*.2);pBox(q,.05,.06,1.9,0x8a8a7a,s*.6,2.25,3.0)}
 for(const s of[-1,1]){const fx=s*1.12;for(let i=0;i<5;i++){const a=-1.2+i*.6,r=.82;pBox(q,.44,.05,.55,CD,fx,.62+Math.cos(a)*r,2.85+Math.sin(a)*r,-a,0,0)}pBox(q,.48,.06,2.9,CD,s*1.08,.98,.55);pBox(q,.04,.1,2.9,MT,s*1.32,.95,.55);
  for(let i=0;i<4;i++){const a=-.9+i*.6,r=.8;pBox(q,.62,.05,.5,CD,s*1.08,.62+Math.cos(a)*r,-2.3+Math.sin(a)*r,-a,0,0)}
  /* faros de acetileno con soporte */pCyl(q,.15,.13,.26,0x22221e,s*.82,2.05,4.08,1.5708,0,0,10);pCyl(q,.155,.155,.04,0x9a8a5a,s*.82,2.05,4.22,1.5708,0,0,10);pBox(q,.05,.36,.05,MT,s*.82,1.8,4.02);
  /* bidones y caja de herramientas sobre el estribo */pBox(q,.36,.5,.16,0x4a5a30,s*1.1,1.3,-.2);pBox(q,.4,.34,.7,0x3a3a2e,s*1.12,1.2,.9)}
 pBox(q,2.3,.16,.22,0x2a2a24,0,.92,4.3);for(const s of[-1,1])pBox(q,.22,.22,.22,0x2a2a24,s*1.05,.92,4.3);
 /* cabina abierta con techo de lona */
 pBox(q,2.1,.1,1.75,0x3a3a30,0,1.16,1.1);pBox(q,2.0,1.0,.1,C,0,1.72,2.0);pBox(q,1.9,.08,.25,0x2a2218,0,2.2,1.88);
 for(const s of[-1,1]){pBox(q,.08,1.25,.08,MT,s*.92,2.62,2.02);pBox(q,.07,1.62,.07,MT,s*.98,2.0,.28);pBox(q,.05,.5,.9,C,s*1.02,1.5,1.2);pBox(q,.04,.04,.3,MT,s*1.15,2.55,2.0);pBox(q,.03,.22,.16,0x8a9aa0,s*1.3,2.6,2.0)}
 pBox(q,1.84,.06,.06,MT,0,3.22,2.02);pBox(q,1.84,.06,.06,MT,0,2.0,2.02);pBox(q,2.2,.07,1.95,0x6a6448,0,2.84,1.12,.04);pCyl(q,.08,.08,2.2,0x5a5440,0,2.86,.18,0,0,1.5708,6);
 pBox(q,1.85,.3,.62,0x3a2a1a,0,1.45,1.05);pBox(q,1.85,.62,.12,0x3a2a1a,0,1.78,.72);pa(q,gTor(.21,.025,5,12),0x1a1410,.45,1.98,1.62,-.9,0,0);pCyl(q,.03,.03,.7,MT,.45,1.7,1.82,-.6,0,0,5);pBox(q,.3,.08,.25,0x2a2a24,-.5,1.3,1.75);
 /* plataforma de carga AMPLIADA (5,2 m), barandas de tablones, bancos laterales, aros de lona */
 const BZ=-1.85,BL=5.2,BW=2.56,FY=1.44;pBox(q,BW,.12,BL,WD2,0,FY,BZ);for(let i=0;i<8;i++)pBox(q,BW-.04,.02,.04,0x3a2818,0,FY+.07,BZ-BL/2+.3+i*.66);
 for(const s of[-1,1]){for(let i=0;i<3;i++)pBox(q,.07,.22,BL,i%2?WD:WD2,s*(BW/2-.03),FY+.2+i*.26,BZ,0,0,0,.1);for(let i=0;i<6;i++)pBox(q,.1,.95,.1,0x4a3420,s*(BW/2+.02),FY+.42,BZ-BL/2+.15+i*(BL-.3)/5);
  pBox(q,.38,.06,BL-.6,0x6a4a2c,s*.98,FY+.48,BZ-.2);for(let i=0;i<4;i++)pBox(q,.06,.42,.06,0x3a2818,s*.98,FY+.25,BZ+1.8-i*1.3);pBox(q,.05,.34,BL-.8,0x5a3e24,s*1.18,FY+.74,BZ-.2)}
 for(let i=0;i<3;i++)pBox(q,BW,.22,.07,i%2?WD:WD2,0,FY+.2+i*.26,BZ+BL/2+.02);pBox(q,BW,.5,.07,WD2,0,FY+.98,BZ+BL/2+.02);
 for(let i=0;i<3;i++)pBox(q,BW,.22,.07,i%2?WD:WD2,0,FY+.2+i*.26,BZ-BL/2-.02);pBox(q,.3,.12,.2,MT,0,1.0,BZ-BL/2-.2);pa(q,gTor(.08,.02,4,8),0x555550,0,.9,BZ-BL/2-.32,0,1.57,0);
 for(let i=0;i<4;i++){const z=BZ+BL/2-.25-i*1.55;pa(q,gTor(1.26,.035,4,14,3.1416),0x4a3420,0,FY+.95,z);pBox(q,.06,.06,.04,0x4a3420,1.26,FY+.95,z);pBox(q,.06,.06,.04,0x4a3420,-1.26,FY+.95,z)}pBox(q,.06,.06,BL-.4,0x4a3420,0,FY+2.2,BZ);
 /* lona replegada sobre la parte delantera: deja ver a las tropas */
 pa(q,new T.CylinderGeometry(1.32,1.32,1.4,14,1,true,-1.5708,3.1416),0x8a8460,0,FY+.95,BZ+BL/2-.75,1.5708,0,0,1,1,1,.05);pCyl(q,.16,.16,2.7,0x7a7452,0,FY+2.2,BZ+BL/2-1.6,0,0,1.5708,8);
 /* carga a escala: cajas de munición, sacos, bidones junto al frontal */
 for(const s of[-1,1]){pBox(q,.82,.56,.6,0x8a6a40,s*.62,FY+.34,BZ+BL/2-.4);pBox(q,.84,.06,.62,0x4a3420,s*.62,FY+.64,BZ+BL/2-.4);pBox(q,.7,.42,.5,0x5a5a3a,s*.62,FY+.88,BZ+BL/2-.4)}pCyl(q,.2,.2,.76,0xa8986a,0,FY+.3,BZ+BL/2-.3,0,0,1.5708,8);
 /* escape, depósito, rueda de repuesto, insignias */
 pCyl(q,.06,.06,2.6,0x1a1a18,.9,.8,-.6,1.5708,0,0,6);pCyl(q,.09,.09,.7,0x1a1a18,.9,.8,-2.0,1.5708,0,0,6);pCyl(q,.3,.3,1.4,0x3a3e30,-.75,1.05,.2,0,0,1.5708,10);
 for(const s of[-1,1])crossMark(q,s*(BW/2+.07),FY+.55,BZ-.8,'x',.55);pBox(q,.5,.18,.03,0xd8d0b0,-.9,1.65,4.12);
 const body=pbMesh(q,g,VCV);
 const lens=PB();for(const s of[-1,1])pCyl(lens,.12,.12,.02,0xfff2c0,s*.82,2.05,4.25,1.5708,0,0,10);pbMesh(lens,g,VCB);
 const gl=new T.Mesh(gBox(1.78,1.12,.03),GLASS);gl.position.set(0,2.62,2.03);g.add(gl);
 const W=[];const wg=truckWheelGeo();for(const [x,z,s] of[[1.12,2.85,1],[-1.12,2.85,1],[1.2,-2.3,1],[-1.2,-2.3,1],[.9,-2.3,1],[-.9,-2.3,1]]){const w=new T.Mesh(wg,VCV);w.position.set(x,.62,z);g.add(w);W.push(w)}
 if(o.driver!==false){const d=mkSoldier({coat:0x5e6a6c,hat:'cap',hatC:0x4e5a5c,pack:false,scale:1});const u=d.userData;u.l1.rotation.x=u.l2.rotation.x=-1.35;u.k1.rotation.x=u.k2.rotation.x=1.35;u.aR.rotation.x=u.aL.rotation.x=-1.2;u.eR.rotation.x=u.eL.rotation.x=-.5;d.position.set(.45,1.04,1.02);g.add(d);g.userData.drv=d}
 g.userData.wh=W;g.userData.body=body;g.userData.v16='truck';scene.add(g);return g}
/* ---------------------------------------------------------------------
   TANQUE v16 — Panzerkampfwagen M.16 «Hunyadi»
   chasis compacto y tren de rodaje de bogies (Stuart), casco remachado alto
   con barbeta lateral de obús (M3 Lee), glacis inclinado, torreta con mantelete
   curvo y cañón largo (Panther). Un único vehículo coherente de la facción.
   --------------------------------------------------------------------- */
const trkT=pixTex(64,16,(c,w,h)=>{c.fillStyle='#2a2a26';c.fillRect(0,0,w,h);for(let x=0;x<w;x+=8){c.fillStyle='#4a4a42';c.fillRect(x,0,5,h);c.fillStyle='#1a1a18';c.fillRect(x+5,0,3,h);c.fillStyle='#5a5a50';c.fillRect(x+1,h/2-1,3,2)}});
trkT.wrapS=trkT.wrapT=T.RepeatWrapping;
const TKC={sh:{a:0x4e5642,b:0x3e4535,c:0x5a6250},st:{a:0x9a8a5a,b:0x5a6a3a,c:0x8a7a4e},wr:{a:0x2a2622,b:0x1a1816,c:0x3a2e26},hero:{a:0x4a5640,b:0x3a4232,c:0x56604c}};
const RWG={};function roadWheelGeo(r,k){const key=r+'|'+k;if(RWG[key])return RWG[key];const q=PB(),dk=k==='wr'?0x141210:0x1c1c1a,c=TKC[k].b;pCyl(q,r,r,.28,dk,0,0,0,0,0,1.5708,14);pCyl(q,r*.8,r*.8,.3,c,0,0,0,0,0,1.5708,12);for(let i=0;i<6;i++)pBox(q,.32,.05,r*1.5,shade(c,.8),0,0,0,i*.5236,0,0);pCyl(q,r*.25,r*.25,.36,0x2a2a26,0,0,0,0,0,1.5708,8);RWG[key]=pbGeo(q);return RWG[key]}
const SPG={};function sprocketGeo(k){if(SPG[k])return SPG[k];const q=PB(),c=TKC[k].b;pCyl(q,.48,.48,.32,shade(c,.8),0,0,0,0,0,1.5708,14);for(let i=0;i<12;i++){const a=i/12*6.2832;pBox(q,.3,.12,.12,0x2a2a26,0,Math.cos(a)*.5,Math.sin(a)*.5,a,0,0)}pCyl(q,.18,.18,.38,0x2a2a26,0,0,0,0,0,1.5708,8);SPG[k]=pbGeo(q);return SPG[k]}
function mkTank16(k){k=k||'sh';const K=TKC[k],A=K.a,B=K.b,Cc=K.c,MT=0x2a2c2a,DK=0x161616,wr=k==='wr';const g=new T.Group(),q=PB();
 /* casco inferior y glacis (Panther) */
 pBox(q,2.3,1.05,6.4,A,0,1.0,-.1);pBox(q,2.34,.12,1.55,A,0,1.72,2.95,-1.0);pBox(q,2.3,.12,.95,shade(A,.92),0,.86,3.35,.75);
 /* superestructura remachada (Lee) sobre las orugas, laterales inclinados */
 pBox(q,2.9,.72,4.6,A,0,2.02,-.55);for(const s of[-1,1]){pBox(q,.12,.78,4.6,shade(A,.95),s*1.52,1.98,-.55,0,0,s*.32);for(let i=0;i<14;i++){pBox(q,.04,.04,.04,shade(A,.7),s*1.47,2.32,-2.7+i*.33);pBox(q,.04,.04,.04,shade(A,.7),s*1.6,1.72,-2.7+i*.33)}}
 for(let i=0;i<9;i++)pBox(q,.04,.04,.04,shade(A,.7),-1.1+i*.27,2.39,1.72);
 pBox(q,2.6,.16,1.9,shade(A,.9),0,2.44,-2.0);for(let i=0;i<8;i++)pBox(q,1.4,.04,.08,DK,0,2.53,-2.7+i*.2);pBox(q,2.3,.9,.12,A,0,1.7,-3.32,.2);
 /* escapes dobles con silenciador (Panther) y barbeta de obús lateral (Lee) */
 for(const s of[-1,1]){pCyl(q,.11,.11,1.0,0x2a2420,s*.6,2.35,-3.45,0,0,0,8);pBox(q,.32,.5,.24,0x3a2e26,s*.6,1.8,-3.48)}
 if(!wr){pBox(q,.72,.7,1.15,shade(A,.95),1.18,2.05,1.55);pCyl(q,.4,.4,.7,A,1.18,2.05,2.05,1.5708,0,0,10);pCyl(q,.1,.11,1.1,MT,1.18,2.0,2.7,1.5708,0,0,8);pCyl(q,.13,.13,.18,DK,1.18,2.0,3.25,1.5708,0,0,8)}
 /* ametralladora de casco en rótula, visor del conductor, escotillas, periscopios */
 pa(q,gSph(.16,8,6),shade(A,.85),-.62,1.95,3.05);pCyl(q,.03,.03,.5,DK,-.62,1.95,3.3,1.5708,0,0,6);pBox(q,.4,.07,.05,DK,.45,2.05,2.72,-1.0);
 for(const s of[-1,1]){pCyl(q,.32,.32,.07,shade(A,.85),s*.55,2.42,1.55,0,0,0,12);pBox(q,.1,.12,.16,DK,s*.55,2.5,1.85)}
 /* faros con rejilla, guardabarros, faldones laterales (Schürzen) parcialmente perdidos */
 for(const s of[-1,1]){pCyl(q,.14,.14,.2,0x222222,s*1.0,1.98,3.2,1.5708,0,0,8);pCyl(q,.1,.1,.02,0xfff0c0,s*1.0,1.98,3.31,1.5708,0,0,8);for(let i=0;i<3;i++)pBox(q,.02,.24,.02,MT,s*1.0-.08+i*.08,1.98,3.36);
  pBox(q,.9,.05,6.9,shade(A,.9),s*1.48,1.63,-.05);for(let i=0;i<4;i++){if(R()<.18&&!wr)continue;pBox(q,.04,.62,1.45,shade(A,.95),s*1.95,1.32,2.1-i*1.5,0,R()*.05,s*(.04+R()*.08))}
  /* herramientas: pala, pico, cable de remolque, eslabones de repuesto */
  pBox(q,.06,.06,1.3,0x5a3a20,s*1.5,1.72,-1.4);pBox(q,.04,.24,.3,0x555550,s*1.5,1.72,-2.15);pa(q,gTor(.18,.03,4,10),0x3a3a36,s*1.5,1.74,.4,1.5708,0,0)}
 for(let i=0;i<4;i++)pBox(q,.7,.08,.24,0x2e2e2a,-.7+i*.48,2.02,2.62,-1.0);
 /* caja de estiba y bidones traseros, insignias de la facción */
 pBox(q,1.4,.45,.6,0x4a4a36,0,2.75,-2.55);for(let i=0;i<3;i++)pBox(q,.32,.45,.16,0x3a4a2a,-.5+i*.5,2.75,-3.0);
 for(const s of[-1,1])crossMark(q,s*1.62,2.0,-.9,'x',.58);pBox(q,.6,.24,.03,0xd8d0b0,.5,1.25,3.4,.75);
 if(k==='st')for(let i=0;i<22;i++){const s=R()<.5?-1:1;pBox(q,.03,.25+R()*.3,.4+R()*.6,0x4a5a2e,s*1.6,1.8+R()*.5,-2.5+R()*4.4,0,0,s*.32)}
 /* orugas: banda con textura desplazable */
 const tm=new T.MeshLambertMaterial({map:trkT.clone(),color:wr?0x6a6a6a:0xffffff});tm.map.needsUpdate=true;tm.map.repeat.set(9,1);
 for(const s of[-1,1]){const t=PB(),X=s*1.45;pBox(t,.78,.1,5.4,0xffffff,X,1.42,-.1,0,0,0,0);pBox(t,.78,.1,5.6,0xffffff,X,.08,-.1,0,0,0,0);pBox(t,.78,.1,1.25,0xffffff,X,.82,3.02,-1.0,0,0,0);pBox(t,.78,.1,1.0,0xffffff,X,1.02,2.98,.5,0,0,0);pBox(t,.78,.1,1.25,0xffffff,X,.75,-3.25,1.1,0,0,0);
  for(let i=0;i<3;i++)pCyl(t,.15,.15,.3,0x2a2a26,X,1.3,1.5-i*1.6,0,0,1.5708,8);pbMesh(t,g,tm)}
 const body=pbMesh(q,g,VCV);
 const W=[],rg=roadWheelGeo(.43,k),sg=sprocketGeo(k);for(const s of[-1,1]){const X=s*1.45;for(const z of[1.85,1.0,-.95,-1.8]){const w=new T.Mesh(rg,VCV);w.position.set(X,.52,z);g.add(w);W.push(w)}
  /* bogies con resortes de voluta (Stuart) */const bq=PB();for(const z of[1.42,-1.38]){pBox(bq,.2,.3,1.2,shade(B,.8),X-s*.3,.72,z);pCyl(bq,.13,.1,.4,0x2a2a26,X-s*.3,.98,z,0,0,0,8)}pbMesh(bq,g,VCV);
  const sp=new T.Mesh(sg,VCV);sp.position.set(X,.98,3.08);g.add(sp);W.push(sp);const id=new T.Mesh(sg,VCV);id.position.set(X,.82,-3.3);id.scale.setScalar(.9);g.add(id);W.push(id)}
 /* TORRETA (Panther) con cúpula de comandante y ametralladora (Lee) */
 const tur=new T.Group();tur.position.set(0,2.4,.15);g.add(tur);const tq=PB();
 pBox(tq,1.66,.88,2.5,Cc,0,.45,0);for(const s of[-1,1]){pBox(tq,.13,.95,2.5,shade(Cc,.95),s*.95,.42,0,0,0,s*.36);pBox(tq,.1,.4,.14,0x2a2a26,s*1.06,.62,.75)}pBox(tq,1.84,.1,2.44,shade(Cc,.92),0,.92,-.02);
 pBox(tq,1.5,.72,.7,Cc,0,.48,-1.5);pCyl(tq,.75,.75,.72,Cc,0,.48,-1.82,0,0,0,10);pBox(tq,1.3,.42,.5,0x4a4a36,0,.5,-2.3);
 for(const s of[-1,1]){for(let i=0;i<3;i++)pCyl(tq,.06,.06,.3,0x2a2a26,s*.8,.95,.6+i*.16,.6,0,0,6);for(let i=0;i<3;i++)pBox(tq,.05,.22,.42,0x2e2e2a,s*1.0,.35,-.3-i*.46,0,0,s*.36)}
 for(const s of[-1,1])crossMark(tq,s*1.04,.42,-.8,'x',.45);
 pCyl(tq,.4,.42,.4,shade(Cc,.9),-.42,1.1,-.55,0,0,0,12);for(let i=0;i<6;i++){const a=i/6*6.2832;pBox(tq,.1,.12,.06,0x1a1a1a,-.42+Math.cos(a)*.41,1.15,-.55+Math.sin(a)*.41,0,-a,0)}pCyl(tq,.36,.36,.05,0x2a2a26,-.42,1.33,-.55,0,0,0,12);
 pCyl(tq,.3,.3,.06,shade(Cc,.85),.45,.98,-.6,0,0,0,10);pBox(tq,.12,.14,.18,DK,.45,1.05,-.25);
 pa(tq,new T.CylinderGeometry(.58,.58,1.15,12,1,false,0,3.1416),shade(Cc,.97),0,.45,1.22,0,0,1.5708);
 pbMesh(tq,tur,VCV);
 const gun=new T.Group();gun.position.set(0,.45,1.35);tur.add(gun);const gq=PB();pCyl(gq,.15,.15,.9,MT,0,0,.35,1.5708,0,0,10);pCyl(gq,.1,.115,4.3,MT,0,0,2.6,1.5708,0,0,10);pCyl(gq,.15,.15,.55,shade(MT,1.2),0,0,2.2,1.5708,0,0,10);pCyl(gq,.17,.17,.42,DK,0,0,4.85,1.5708,0,0,10);pBox(gq,.42,.12,.3,DK,0,0,4.85);pCyl(gq,.03,.03,.5,DK,.32,.05,.4,1.5708,0,0,6);pbMesh(gq,gun,VCV);
 const muz=new T.Object3D();muz.position.set(0,0,5.15);gun.add(muz);if(wr){tur.rotation.set(.12,1.1,.08);gun.rotation.x=.18}
 /* afuste de la ametralladora en la cúpula + artillero visible */
 const mgr=new T.Group();mgr.position.set(-.42,1.38,-.55);tur.add(mgr);const mq=PB();pCyl(mq,.03,.03,.5,MT,0,.15,0,0,0,0,6);pBox(mq,.12,.14,.55,0x2e3026,0,.42,.15);pCyl(mq,.06,.06,.5,0x2a2a22,0,.44,.6,1.5708,0,0,8);pCyl(mq,.02,.02,.3,DK,0,.44,1.0,1.5708,0,0,6);pBox(mq,.08,.18,.04,DK,.07,.35,-.12);pBox(mq,.08,.18,.04,DK,-.07,.35,-.12);pBox(mq,.4,.3,.05,shade(Cc,.9),0,.5,.45);pbMesh(mq,mgr,VCV);
 const mmz=new T.Object3D();mmz.position.set(0,.44,1.18);mgr.add(mmz);
 let gunner=null;if(!wr){gunner=mkSoldier({coat:0x3a3e3a,hat:'cap',hatC:0x2a2a28,pack:false,scale:.95,glove:0x2a2018,face:R()*3|0});const u=gunner.userData;gunner.position.set(0,-1.26,-.42);mgr.add(gunner);u.l1.visible=u.l2.visible=false;gunner.children.forEach(c=>{if(c.geometry===shG)c.visible=false})}
 g.userData={v16:'tank',tur,gun,muz,mgr,mmz,gunner,wh:W,trk:tm,body,k,rec:0,mgRec:0};scene.add(g);return g}
/* sustitución global de modelos: camiones y tanques nuevos en todos los capítulos */
const _mkVeh16=mkVeh;mkVeh=function(k){if(k==='truck')return mkTruck16();if(k==='tank')return mkTank16(level===8&&L8&&L8.ph>=3?'wr':'sh');return _mkVeh16(k)};
mkTank2=function(k){const g=mkTank16(k==='st'?'st':'sh');if(k==='st')g.scale.setScalar(.92);return g};
/* VII: los fusileros del convoy viajan sobre la nueva plataforma */
addRiders=function(tg){for(const [x,z] of[[-.75,-.6],[.75,-1.9],[-.75,-3.2]]){const g=mkSoldier({coat:0x5a6a7a,hat:'helm',hatC:0x4a5258});g.userData.mR.add(mkGun('rifle'));g.position.set(x,1.5,z);tg.add(g);rid.push({g,cd:R()*1.5})}};
/* =====================================================================
   NOCHE INCIPIENTE — dos lunas llenas, estrellas granate, nubes y bruma
   ===================================================================== */
function moonTex(base,dark,seed){const c=document.createElement('canvas');c.width=c.height=256;const x=c.getContext('2d');let s=seed;const rn=()=>{s=(s*9301+49297)%233280;return s/233280};
 const g=x.createRadialGradient(118,112,10,128,128,120);g.addColorStop(0,base);g.addColorStop(.85,base);g.addColorStop(1,dark);x.fillStyle=g;x.beginPath();x.arc(128,128,120,0,7);x.fill();
 x.save();x.beginPath();x.arc(128,128,119,0,7);x.clip();x.filter='blur(6px)';for(let i=0;i<9;i++){x.fillStyle='rgba(60,60,80,'+(.12+rn()*.18)+')';x.beginPath();x.ellipse(40+rn()*176,40+rn()*176,14+rn()*34,10+rn()*24,rn()*3,0,7);x.fill()}x.filter='none';
 for(let i=0;i<70;i++){const cx=rn()*256,cy=rn()*256,r=1.5+rn()*rn()*12;x.strokeStyle='rgba(40,40,60,'+(.15+rn()*.25)+')';x.lineWidth=1+r*.12;x.beginPath();x.arc(cx,cy,r,0,7);x.stroke();x.fillStyle='rgba(255,255,255,'+(.05+rn()*.08)+')';x.beginPath();x.arc(cx-r*.25,cy-r*.25,r*.6,0,7);x.fill()}
 const sh=x.createRadialGradient(150,145,60,128,128,128);sh.addColorStop(0,'rgba(0,0,0,0)');sh.addColorStop(1,'rgba(0,0,20,.45)');x.fillStyle=sh;x.fillRect(0,0,256,256);x.restore();
 const t=new T.CanvasTexture(c);t.minFilter=T.LinearFilter;return t}
function glowTex(r,g,b){const c=document.createElement('canvas');c.width=c.height=128;const x=c.getContext('2d'),gr=x.createRadialGradient(64,64,0,64,64,64);gr.addColorStop(0,'rgba('+r+','+g+','+b+',.55)');gr.addColorStop(.35,'rgba('+r+','+g+','+b+',.16)');gr.addColorStop(1,'rgba('+r+','+g+','+b+',0)');x.fillStyle=gr;x.fillRect(0,0,128,128);const t=new T.CanvasTexture(c);t.minFilter=T.LinearFilter;return t}
function cloudTex(){const c=document.createElement('canvas');c.width=256;c.height=96;const x=c.getContext('2d');x.filter='blur(7px)';for(let i=0;i<40;i++){const cx=30+R()*196,cy=34+R()*34,r=10+R()*24;x.fillStyle='rgba(255,255,255,'+(.1+R()*.22)+')';x.beginPath();x.arc(cx,cy,r,0,7);x.fill()}const t=new T.CanvasTexture(c);t.minFilter=T.LinearFilter;return t}
const smokeT=(()=>{const c=document.createElement('canvas');c.width=c.height=64;const x=c.getContext('2d');x.filter='blur(3px)';for(let i=0;i<14;i++){const g=x.createRadialGradient(0,0,0,0,0,1);x.fillStyle='rgba(255,255,255,'+(.08+R()*.1)+')';x.beginPath();x.arc(20+R()*24,20+R()*24,8+R()*12,0,7);x.fill()}const t=new T.CanvasTexture(c);t.minFilter=T.LinearFilter;return t})();
const NIGHT={g:null,on:false,mode:'night'};
function buildNight(){if(NIGHT.g)return NIGHT.g;const g=new T.Group();g.renderOrder=-1;
 /* estrellas granate y rojizo oscuro: distribución natural (más densas cerca de una "vía" difusa) */
 const N=900,pos=new Float32Array(N*3),col=new Float32Array(N*3),sz=new Float32Array(N),ph=new Float32Array(N);
 for(let i=0;i<N;i++){let a=R()*6.2832,e=Math.asin(.06+R()*.94);if(R()<.35){const b=R()*6.2832;a=b;e=Math.asin(clamp(.35+Math.sin(b*2)*.25+(R()-.5)*.18,.06,.99))}const r=285;pos[i*3]=Math.cos(e)*Math.cos(a)*r;pos[i*3+1]=Math.sin(e)*r;pos[i*3+2]=Math.cos(e)*Math.sin(a)*r;
  const k=R(),cc=k<.55?[.55,.08,.12]:k<.85?[.72,.16,.14]:k<.96?[.42,.05,.16]:[.85,.72,.7];const br=.55+R()*.45;col[i*3]=cc[0]*br;col[i*3+1]=cc[1]*br;col[i*3+2]=cc[2]*br;sz[i]=R()<.92?1.2+R()*1.3:2.6+R()*1.4;ph[i]=R()*6.28}
 const sg=new T.BufferGeometry();sg.setAttribute('position',new T.BufferAttribute(pos,3));sg.setAttribute('color',new T.BufferAttribute(col,3));sg.setAttribute('sz',new T.BufferAttribute(sz,1));sg.setAttribute('ph',new T.BufferAttribute(ph,1));
 const sm=new T.ShaderMaterial({transparent:true,depthWrite:false,blending:T.AdditiveBlending,fog:false,uniforms:{time:{value:0},vis:{value:1}},
  vertexShader:'attribute float sz;attribute float ph;attribute vec3 color;uniform float time;varying vec3 vc;varying float tw;void main(){vc=color;tw=.7+.3*sin(time*(1.3+ph*.4)+ph*7.);vec4 mv=modelViewMatrix*vec4(position,1.);gl_PointSize=sz;gl_Position=projectionMatrix*mv;}',
  fragmentShader:'uniform float vis;varying vec3 vc;varying float tw;void main(){float d=length(gl_PointCoord-.5);if(d>.5)discard;gl_FragColor=vec4(vc*tw*vis*(1.-d*1.6),1.);}'});
 const st=new T.Points(sg,sm);st.frustumCulled=false;g.add(st);NIGHT.sm=sm;
 /* dos lunas: la mayor, «Selene de Hierro», pálida y dominante; la menor, «la Ámbar», rojiza y lejana */
 const mk=(tex,glow,dir,el,dist,size,halo)=>{const v=new T.Vector3(Math.cos(el)*Math.sin(dir),Math.sin(el),Math.cos(el)*Math.cos(dir)).multiplyScalar(dist);const h=new T.Sprite(new T.SpriteMaterial({map:glow,transparent:true,depthWrite:false,blending:T.AdditiveBlending,fog:false}));h.scale.setScalar(size*halo);h.position.copy(v);g.add(h);
  const m=new T.Sprite(new T.SpriteMaterial({map:tex,transparent:true,depthWrite:false,fog:false}));m.scale.setScalar(size);m.position.copy(v);g.add(m);return{m,h,v}};
 NIGHT.m1=mk(moonTex('#e6ecf4','#9aa6b8',7),glowTex(170,190,230),2.62,.36,270,44,3.1);
 NIGHT.m2=mk(moonTex('#e8b4a0','#9a6050',31),glowTex(230,140,110),-2.35,.6,275,17,2.8);
 /* nubes oscuras en deriva, algunas velando las lunas */
 const ct=cloudTex();NIGHT.cl=[];for(let i=0;i<14;i++){const a=i<2?2.62+(i?.12:-.18):R()*6.2832,el=i<2?.33+i*.07:.08+R()*.32,d=240;const s=new T.Sprite(new T.SpriteMaterial({map:ct,color:i<2?0x3a4458:0x1e2434,transparent:true,opacity:i<2?.75:.5+R()*.3,depthWrite:false,fog:false}));s.position.set(Math.cos(el)*Math.sin(a)*d,Math.sin(el)*d,Math.cos(el)*Math.cos(a)*d);s.scale.set(90+R()*90,26+R()*20,1);g.add(s);NIGHT.cl.push({s,a,el,d,sp:(R()-.5)*.004})}
 g.visible=false;scene.add(g);NIGHT.g=g;return g}
function nightSky(mode){const blood=mode==='blood';const c=document.createElement('canvas');c.width=4;c.height=512;const x=c.getContext('2d'),gg=x.createLinearGradient(0,0,0,512);
 const S=blood?[[0,'#07030a'],[.28,'#120814'],[.42,'#2a0e18'],[.48,'#5a1a18'],[.5,'#8a2a14'],[.52,'#2a1010'],[1,'#080404']]:[[0,'#02030a'],[.25,'#070c1c'],[.4,'#121a32'],[.47,'#262c48'],[.495,'#3e3448'],[.505,'#5a3a36'],[.53,'#16161c'],[1,'#07070a']];
 S.forEach(a=>gg.addColorStop(a[0],a[1]));x.fillStyle=gg;x.fillRect(0,0,4,512);skyMesh.material.map=new T.CanvasTexture(c);skyMesh.material.needsUpdate=true;skyMesh.visible=true;scene.background=null;
 buildNight().visible=true;NIGHT.on=true;NIGHT.mode=mode;
 scene.fog.color.set(blood?0x1c0c10:0x121827);hemi.color.set(blood?0x8a6a80:0x7088c0);hemi.groundColor.set(blood?0x4a2418:0x3a3226);hemi.intensity=blood?.8:.76;sunL.color.set(0xa8bce8);sunL.intensity=.72;
 const m=NIGHT.m1.v;sunL.position.set(m.x*.3,m.y*.3,m.z*.3);pMat.uniforms.tint.value.set(blood?1.04:.9,blood?.92:.97,blood?.95:1.1)}
smoke8=function(x,z){for(let i=0;i<10;i++){const m=new T.Mesh(smkG,new T.MeshLambertMaterial({color:0x6a6c74,transparent:true,opacity:.5,depthWrite:false}));m.position.set(x+(R()-.5)*10,1+R()*2,z+(R()-.5)*10);m.scale.setScalar(2+R()*3);scene.add(m);L8.sm=L8.sm||[];L8.sm.push({m,l:28+R()*10})}for(let i=0;i<6;i++)smoke(x+(R()-.5)*12,1.5,z+(R()-.5)*12,9,14,0x55575e,.3,.5)};
const _setSky16=setSky;setSky=function(stops){if(level===8){nightSky(stops&&stops[0]&&stops[0][1]==='#2a0505'?'blood':'night');return}if(NIGHT.g){NIGHT.g.visible=false;NIGHT.on=false}pMat.uniforms.tint.value.set(1.06,1,.9);_setSky16(stops)};
function nightUpd(dt){if(!NIGHT.on||!NIGHT.g)return;NIGHT.g.position.copy(cam.position);NIGHT.sm.uniforms.time.value=time;for(const c of NIGHT.cl){c.a+=c.sp*dt;c.s.position.set(Math.cos(c.el)*Math.sin(c.a)*c.d,Math.sin(c.el)*c.d,Math.cos(c.el)*Math.cos(c.a)*c.d)}}
/* =====================================================================
   LUCES DE ESCENA (número fijo: sin recompilar sombreadores en mitad del combate)
   ===================================================================== */
const LT={pts:[],spot:null,beam:null,fl:[],fires:[]};
function lightsInit(){if(LT.pts.length)return;const n=G.detail>0?5:3;for(let i=0;i<n;i++){const l=new T.PointLight(0xff9a40,0,26,2);scene.add(l);LT.pts.push({l,base:0,f:R()*9,on:false})}
 for(let i=0;i<2;i++){const l=new T.PointLight(0xffb060,0,60,2);scene.add(l);LT.fl.push({l,t:0,d:1,i:0})}
 const sp=new T.SpotLight(0xdfe8ff,0,190,.16,.5,1.2);scene.add(sp);scene.add(sp.target);LT.spot=sp;
 const bm=new T.Mesh(new T.CylinderGeometry(.4,7.5,150,14,1,true),new T.MeshBasicMaterial({color:0xcfdcff,transparent:true,opacity:.07,blending:T.AdditiveBlending,depthWrite:false,side:T.DoubleSide,fog:false}));bm.geometry.translate(0,-75,0);bm.visible=false;scene.add(bm);LT.beam=bm}
function bindFireLight(x,y,z,i,col){const p=LT.pts[i];if(!p)return;p.l.position.set(x,y,z);p.l.color.set(col||0xff9a40);p.base=i<2?1.6:1.3;p.on=true}
function flashLight(x,y,z,int,d,col){const L=LT.fl.sort((a,b)=>a.t-b.t)[0];if(!L)return;L.l.position.set(x,y,z);L.l.color.set(col||0xffb060);L.i=int;L.t=d;L.d=d}
function searchSet(on,x,y,z){LT.spotOn=on;if(on){LT.spot.position.set(x,y,z);LT.sx=x;LT.sy=y;LT.sz=z}}
function lightsUpd(dt){for(const p of LT.pts){if(!p.on){p.l.intensity=0;continue}p.f+=dt*(8+R()*6);p.l.intensity=p.base*(.78+Math.sin(p.f)*.12+R()*.1)}
 for(const L of LT.fl){if(L.t>0){L.t-=dt;L.l.intensity=L.i*Math.max(0,L.t/L.d)}else L.l.intensity=0}
 const sp=LT.spot;if(sp){if(LT.spotOn){LT.sa=(LT.sa||0)+dt*.32;const tx=LT.sx+Math.sin(LT.sa)*42,tz=LT.sz+(LT.sdir||1)*(70+Math.sin(LT.sa*.7)*25);sp.target.position.set(tx,0,tz);sp.intensity=2.4;
  const bm=LT.beam;bm.visible=true;bm.position.copy(sp.position);const d=new T.Vector3(tx-sp.position.x,-sp.position.y,tz-sp.position.z);bm.scale.y=d.length()/150;bm.quaternion.setFromUnitVectors(new T.Vector3(0,-1,0),d.normalize())}else{sp.intensity=0;LT.beam.visible=false}}}
/* =====================================================================
   EFECTOS: humo volumétrico simulado (sprites), trazadoras, fuegos
   ===================================================================== */
const SMK=[];const SMN=G.part<.6?40:70;for(let i=0;i<SMN;i++){const s=new T.Sprite(new T.SpriteMaterial({map:smokeT,color:0x888888,transparent:true,opacity:0,depthWrite:false}));s.visible=false;scene.add(s);SMK.push({s,l:0,m:1,vx:0,vy:0,vz:0,g:1,o:.5})}let smI=0;
function smoke(x,y,z,size,life,col,vy,op){const p=SMK[smI];smI=(smI+1)%SMK.length;p.s.visible=true;p.s.position.set(x,y,z);p.s.material.color.setHex(col||0x5a5a5e);p.s.material.rotation=R()*6.28;p.l=p.m=life||3;p.g=size||3;p.s.scale.setScalar(p.g*.5);p.vx=(R()-.5)*.6;p.vz=(R()-.5)*.6;p.vy=vy===undefined?1.2:vy;p.o=op===undefined?.55:op}
function smokeUpd(dt){for(const p of SMK){if(p.l<=0)continue;p.l-=dt;if(p.l<=0){p.s.visible=false;continue}const k=1-p.l/p.m;p.s.position.x+=(p.vx+.35)*dt;p.s.position.y+=p.vy*dt;p.s.position.z+=p.vz*dt;p.s.scale.setScalar(p.g*(.5+k*.9));p.s.material.opacity=p.o*Math.min(1,k*5)*(1-k)}}
const TRC=[];const trG=new T.BoxGeometry(.05,.05,1);for(let i=0;i<36;i++){const m=new T.Mesh(trG,new T.MeshBasicMaterial({color:0xffd080,transparent:true,opacity:.9,blending:T.AdditiveBlending,depthWrite:false}));m.visible=false;scene.add(m);TRC.push({m,t:0,a:new T.Vector3(),b:new T.Vector3(),d:.12})}let trI=0;
function trc16(a,b,col){const t=TRC[trI];trI=(trI+1)%TRC.length;t.a.copy(a);t.b.copy(b);t.t=0;const L=a.distanceTo(b);t.d=Math.max(.06,L/180);t.m.material.color.setHex(col||0xffd080);t.m.scale.z=Math.min(6,L*.25);t.m.visible=true;t.m.position.copy(a);t.m.lookAt(b)}
function tracerUpd(dt){for(const t of TRC){if(!t.m.visible)continue;t.t+=dt;const u=t.t/t.d;if(u>=1){t.m.visible=false;continue}t.m.position.lerpVectors(t.a,t.b,u)}}
const FIRES=[];const flG=gCone(.5,1.4,6);
function mkFire(x,z,s,y,li){s=s||1;y=y||0;const g=new T.Group();g.position.set(x,y,z);const ms=[];for(let i=0;i<3;i++){const m=new T.Mesh(flG,new T.MeshBasicMaterial({color:[0xff6a10,0xffa030,0xffe070][i],transparent:true,opacity:.85,blending:T.AdditiveBlending,depthWrite:false}));m.position.set((R()-.5)*.4*s,.6*s,(R()-.5)*.4*s);m.scale.set(s*(1-i*.25),s*(1-i*.2),s*(1-i*.25));g.add(m);ms.push(m)}
 scene.add(g);const f={g,ms,s,x,z,y,t:R()*9,li:li===undefined?-1:li};if(f.li>=0)bindFireLight(x,y+1.2*s,z,f.li);FIRES.push(f);return f}
function fireUpd(dt){for(const f of FIRES){if(!f.g.visible)continue;f.t+=dt;f.ms.forEach((m,i)=>{const k=.8+Math.sin(f.t*(9+i*3)+i)*.15+R()*.1;m.scale.y=f.s*(1-i*.2)*k*1.2;m.rotation.y+=dt*(1+i)});if(R()<dt*3)smoke(f.x+(R()-.5)*f.s,f.y+1.6*f.s,f.z+(R()-.5)*f.s,2.2*f.s,3.5,0x2a2a2e,1.6,.45);if(R()<dt*4)burst(f.x,f.y+.8*f.s,f.z,0xffa040,1,.8,2)}}
/* =====================================================================
   AUDIO: bus maestro con compresor, límite de voces, ambiente por capas
   ===================================================================== */
const AU={bus:null,stamps:[],wst:[],amb:null,eng:null,nb:null};
AB=function(){if(!AU.bus&&ac){const c=ac.createDynamicsCompressor();c.threshold.value=-16;c.knee.value=8;c.ratio.value=5;c.attack.value=.004;c.release.value=.2;const g=ac.createGain();g.gain.value=.95;c.connect(g);g.connect(ac.destination);AU.bus=c}return AU.bus||ac.destination};
sndOK=function(){const n=performance.now();while(AU.stamps.length&&n-AU.stamps[0]>80)AU.stamps.shift();if(AU.stamps.length>=12)return false;AU.stamps.push(n);return true};
sfxOK=function(){const n=performance.now();while(AU.wst.length&&n-AU.wst[0]>110)AU.wst.shift();if(AU.wst.length>=6)return false;AU.wst.push(n);return true};
function noiseBuf(){if(AU.nb||!ac)return AU.nb;const b=ac.createBuffer(1,ac.sampleRate*2,ac.sampleRate),d=b.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;AU.nb=b;return b}
/* disparo NPC barato: ruido filtrado, volumen y brillo según distancia */
function npcShot(kind,x,z){if(!ac||!sndOK())return;const d=Math.hypot(x-cam.position.x,z-cam.position.z),v=clamp(1-d/120,0,1);if(v<.04)return;try{const n=ac.currentTime,s=ac.createBufferSource();s.buffer=noiseBuf();const f=ac.createBiquadFilter();f.type='lowpass';f.frequency.value=(kind==='mg'?1600:kind==='big'?500:2200)*(.35+v*.65);const g=ac.createGain();const L=kind==='big'?.9:kind==='mg'?.09:.18;g.gain.setValueAtTime((kind==='big'?.5:.22)*v*G.vol,n);g.gain.exponentialRampToValueAtTime(.001,n+L);s.connect(f);f.connect(g);g.connect(AB());s.start(n,R()*1.5,L+.05)}catch(e){}}
function ambStart(){if(!ac||AU.amb)return;try{const n=ac.currentTime,s=ac.createBufferSource();s.buffer=noiseBuf();s.loop=true;const f=ac.createBiquadFilter();f.type='bandpass';f.frequency.value=380;f.Q.value=.6;const g=ac.createGain();g.gain.value=.018*G.vol;const lf=ac.createOscillator(),lg=ac.createGain();lf.frequency.value=.09;lg.gain.value=.012*G.vol;lf.connect(lg);lg.connect(g.gain);s.connect(f);f.connect(g);g.connect(AB());s.start(n);lf.start(n);AU.amb={s,g,lf,t:2}}catch(e){}}
function ambStop(){if(AU.amb){try{AU.amb.s.stop();AU.amb.lf.stop()}catch(e){}AU.amb=null}engine(false)}
function engine(on,vol){if(!ac)return;if(on&&!AU.eng){try{const o=ac.createOscillator(),o2=ac.createOscillator(),f=ac.createBiquadFilter(),g=ac.createGain(),s=ac.createBufferSource();o.type='sawtooth';o.frequency.value=34;o2.type='square';o2.frequency.value=17.5;f.type='lowpass';f.frequency.value=180;g.gain.value=0;s.buffer=noiseBuf();s.loop=true;const f2=ac.createBiquadFilter();f2.type='bandpass';f2.frequency.value=900;f2.Q.value=3;const g2=ac.createGain();g2.gain.value=.25;s.connect(f2);f2.connect(g2);g2.connect(g);o.connect(f);o2.connect(f);f.connect(g);g.connect(AB());o.start();o2.start();s.start();AU.eng={o,o2,s,g}}catch(e){}}
 if(AU.eng){if(on)AU.eng.g.gain.setTargetAtTime((vol||.05)*G.vol,ac.currentTime,.3);else{const e=AU.eng;e.g.gain.setTargetAtTime(0,ac.currentTime,.4);setTimeout(()=>{try{e.o.stop();e.o2.stop();e.s.stop()}catch(x){}},1600);AU.eng=null}}}
/* capas lejanas: artillería, ráfagas, campana de alarma, grillos nocturnos, metal y escombros */
function ambUpd(dt,intens){if(!ac||!AU.amb)return;AU.amb.t-=dt;if(AU.amb.t>0)return;const I=intens||.4;AU.amb.t=(2.2+R()*5)/(.4+I);const r=R();
 if(r<.3*I){snd(36+R()*14,1.4+R(),'sine',.035+.03*I);setTimeout(()=>snd(70,.4,'sawtooth',.01),120)}
 else if(r<.62){const n=3+R()*6|0,x=cam.position.x+(R()-.5)*300,z=cam.position.z-120-R()*120;for(let i=0;i<n;i++)setTimeout(()=>npcShot(R()<.5?'mg':'rifle',x,z),i*95)}
 else if(r<.72&&I<.5){for(let i=0;i<5;i++)setTimeout(()=>snd(4200+R()*500,.04,'sine',.006),i*70)}
 else if(r<.8)snd(220+R()*90,.5,'triangle',.008);
 else if(r<.86&&I>.6){for(let i=0;i<6;i++)setTimeout(()=>snd(880,.18,'square',.012),i*380)}}
/* =====================================================================
   NAVEGACIÓN COMPARTIDA: rejilla espacial de obstáculos, antenas de
   dirección, detección de atasco, desvío lateral, retroceso y abandono
   ===================================================================== */
const NV={sig:'',cell:6,m:new Map()};
function navGrid(){const s=obst.length+'|'+obstB.length;if(s===NV.sig)return;NV.sig=s;NV.m.clear();const C=NV.cell,add=(k,o)=>{let a=NV.m.get(k);if(!a){a=[];NV.m.set(k,a)}a.push(o)};
 for(const o of obst){for(let i=Math.floor((o.x-o.r)/C);i<=Math.floor((o.x+o.r)/C);i++)for(let j=Math.floor((o.z-o.r)/C);j<=Math.floor((o.z+o.r)/C);j++)add(i+','+j,o)}
 for(const b of obstB){if((b.y0||0)>=1.6||b.step||b.h<.45)continue;for(let i=Math.floor((b.x-b.hw)/C);i<=Math.floor((b.x+b.hw)/C);i++)for(let j=Math.floor((b.z-b.hd)/C);j<=Math.floor((b.z+b.hd)/C);j++)add(i+','+j,b)}}
function blockedAt(x,z,r){const a=NV.m.get(Math.floor(x/NV.cell)+','+Math.floor(z/NV.cell));if(Math.hypot(x-WC.x,z-WC.z)>WC.r-1)return true;if(!a)return false;for(const o of a){if(o.hw!==undefined){if(Math.abs(x-o.x)<o.hw+r&&Math.abs(z-o.z)<o.hd+r)return true}else if(Math.hypot(x-o.x,z-o.z)<o.r+r)return true}return false}
const ANG=[0,.45,-.45,.9,-.9,1.4,-1.4,2.0,-2.0,2.7,-2.7];
function steer(a,dx,dz,dt){/* devuelve una dirección libre próxima a la deseada y gestiona el atasco */
 const N=a.nav||(a.nav={t:0,side:R()<.5?1:-1,lx:a.g.position.x,lz:a.g.position.z,st:0,stuck:0,det:0,dx:0,dz:0,fail:0,ok:[dx,dz]});const p=a.g.position;const L=Math.hypot(dx,dz);if(L<.01){N.st=0;return[0,0]}dx/=L;dz/=L;
 if(N.det>0){N.det-=dt;return[N.dx,N.dz]}
 N.t-=dt;if(N.t<=0){N.t=.14+R()*.06;const base=Math.atan2(dx,dz);let best=null;for(const k of ANG){const an=base+k*N.side,ux=Math.sin(an),uz=Math.cos(an);if(!blockedAt(p.x+ux*1.3,p.z+uz*1.3,.42)&&!blockedAt(p.x+ux*2.4,p.z+uz*2.4,.42)){best=[ux,uz];if(k!==0&&Math.abs(k)>1.3&&R()<.3)N.side*=-1;break}}N.ok=best||[-dx,-dz]}
 /* control de progreso cada 0,7 s */
 N.st+=dt;if(N.st>.7){const mv=Math.hypot(p.x-N.lx,p.z-N.lz);N.lx=p.x;N.lz=p.z;N.st=0;if(mv<.28){N.stuck++;if(N.stuck>=4){N.fail=3;N.stuck=0}const an=Math.atan2(dx,dz)+(N.stuck>=2?Math.PI*.8:1.5708)*N.side;N.dx=Math.sin(an);N.dz=Math.cos(an);N.det=.6+R()*.6;N.side*=-1}else N.stuck=Math.max(0,N.stuck-1)}
 if(N.fail>0)N.fail-=dt;return N.ok}
function navMove(a,tx,tz,sp,dt,stop){const p=a.g.position,dx=tx-p.x,dz=tz-p.z,d=Math.hypot(dx,dz);a.vx=a.vx||0;a.vz=a.vz||0;let mx=0,mz=0;if(d>(stop||.6)){const w=route8(a,tx,tz);const s=w?steer(a,w[0]-p.x,w[1]-p.z,dt):steer(a,dx,dz,dt);mx=s[0]*sp;mz=s[1]*sp;if(d<2.5){mx*=d/2.5;mz*=d/2.5}}else if(a.nav)a.nav.st=0;
 const k=Math.min(1,dt*(d>(stop||.6)?5:8));a.vx+=(mx-a.vx)*k;a.vz+=(mz-a.vz)*k;p.x+=a.vx*dt;p.z+=a.vz*dt;resolve(p,.45);return d}
/* rutas a través del fuerte: puerta y brechas detectadas dinámicamente (cambian tras la detonación) */
const EX={sig:'',pts:[]};
function exits8(){if(EX.sig===NV.sig)return EX.pts;EX.sig=NV.sig;EX.pts=[];const add=(x,z,nx,nz)=>{if(!blockedAt(x,z,.6)&&!blockedAt(x+nx*2.4,z+nz*2.4,.5)&&!blockedAt(x-nx*2.4,z-nz*2.4,.5))EX.pts.push({x,z,ox:x+nx*3.4,oz:z+nz*3.4,ix:x-nx*3.4,iz:z-nz*3.4})};
 for(let x=-60;x<=60;x+=3){add(X8+x,-96,0,1);add(X8+x,-206,0,-1)}for(let z=-202;z<=-100;z+=3){add(X8-64,z,-1,0);add(X8+64,z,1,0)}return EX.pts}
const inFort=(x,z)=>Math.abs(x-X8)<63.6&&z<-97.6&&z>-204.4;
function route8(a,tx,tz){if(level!==8)return null;const p=a.g.position,ai=inFort(p.x,p.z),ti=inFort(tx,tz);if(ai===ti){a.rt8=null;return null}
 const r=a.rt8||(a.rt8={t:0,e:null,th:0});r.t-=V16.dt||.016;if(r.t<=0||!r.e){r.t=.8;const E=exits8();let b=null,bs=1e9;for(const e of E){const sc=Math.hypot(e.x-p.x,e.z-p.z)+Math.hypot(tx-e.x,tz-e.z);if(sc<bs){bs=sc;b=e}}if(b!==r.e)r.th=0;r.e=b}
 const e=r.e;if(!e)return null;const ap=ai?[e.ix,e.iz]:[e.ox,e.oz],th=ai?[e.ox,e.oz]:[e.ix,e.iz];if(r.th||Math.hypot(ap[0]-p.x,ap[1]-p.z)<2.4){r.th=1;return th}return ap}
/* antiatasco para la IA enemiga original (todas las campañas) */
unstk=function(e,ax,az,dt){if(!(ax||az))return[ax,az];if(level===8){const tp=e.tp8||P.g.position,w=route8(e,tp.x,tp.z);if(w){const dx=w[0]-e.g.position.x,dz=w[1]-e.g.position.z,l=Math.hypot(dx,dz)||1,m=Math.hypot(ax,az)||1;ax=dx/l*m;az=dz/l*m}}const s=steer(e,ax,az,dt);const m=Math.hypot(ax,az);return[s[0]*m,s[1]*m]};
/* línea de visión contra los volúmenes sólidos */
function losClear(ax,ay,az,bx,by,bz){const dx=bx-ax,dy=by-ay,dz=bz-az,L=Math.hypot(dx,dz);if(L<2)return true;const n=Math.min(36,Math.ceil(L/1.6));const q={x:0,y:0,z:0};for(let i=1;i<n;i++){const t=i/n;if(t*L<1.3||(1-t)*L<1.1)continue;q.x=ax+dx*t;q.y=ay+dy*t;q.z=az+dz*t;if(inB(q))return false}return true}
/* =====================================================================
   GUARNICIÓN ALIADA — soldados autónomos del fuerte (pueden morir)
   ===================================================================== */
const GAR=[];let garN=0;const GNM=['Szabó','Kovács','Tóth','Nagy','Horváth','Varga','Kiss','Molnár','Gruber','Huber','Pichler','Moser','Steiner','Bauer','Wagner','Hofer','Lakatos','Farkas','Balogh','Papp'],GRK=['Inf.','Gefr.','Korp.','Zgsf.'];
function mkGar(i,kind){const coats=[0x7a8a8e,0x72827e,0x808a88,0x6e7c82],hats=R()<.62?'helm':R()<.75?'cap':'kepi',rk=R()<.15?3:R()<.3?2:R()<.55?1:0;
 const g=mkSoldier({coat:coats[R()*4|0],hat:hats,hatC:hats==='helm'?[0x4e5a52,0x55605a,0x4a5450][R()*3|0]:0x6a787c,tab:[0xa02a2a,0x2a6a3a,0xd8c060,0x2a3a7a][R()*4|0],rank:rk,pack:R()<.75,puttee:R()<.5?0x5a5440:0x4a4a3e});
 g.userData.mR.add(mkGun(kind==='mg'?'mg':kind==='carb'?'carb':'rifle'));g.visible=false;scene.add(g);
 const s={g,u:g.userData,i,kind,name:GRK[rk]+' '+GNM[(i*7+3)%GNM.length],hp:125,max:125,alive:true,post:null,st:'idle',t:R()*9,cd:R(),mag:kind==='mg'?100:5,rel:0,tg:null,tgT:0,los:false,vx:0,vz:0,morale:1,down:0,up:0,crouch:0,aim:0,peek:0,burst:0,inB:false,fall:0,hitT:0,bark:0,face:Math.PI};GAR.push(s);return s}
function garVisible(v){for(const s of GAR)if(s.alive)s.g.visible=v}
const POSTS={};let postSet=null;
function garAssign(name,list){postSet=name;const P_=(POSTS[name]=list.map(p=>({x:p[0],z:p[1],f:p[2],c:!!p[3],bk:!!p[4],fb:p[5]||null,occ:null})));
 const alive=GAR.filter(s=>s.alive);for(const s of alive){s.post=null}
 for(const p of P_){let best=null,bd=1e9;for(const s of alive){if(s.post)continue;if(p.bk&&s.kind==='mg'&&R()<.5)continue;const d=Math.hypot(s.g.position.x-p.x,s.g.position.z-p.z)+(s.kind==='mg'&&!p.c&&!p.bk?20:0);if(d<bd){bd=d;best=s}}if(best){best.post=p;p.occ=best;best.st='move';if(best.nav)best.nav.fail=0}}
 for(const s of alive)if(!s.post){const p=P_[R()*P_.length|0];if(p){s.post={x:p.x+(R()-.5)*4,z:p.z+(R()-.5)*3,f:p.f,c:p.c,bk:false,fb:p.fb};s.st='move'}}}
function garTarget(s){const p=s.g.position;let best=null,bs=1e9;const R2=s.kind==='mg'?58:64;
 if(V16.focus&&enemies.indexOf(V16.focus)>=0){const e=V16.focus,d=Math.hypot(e.g.position.x-p.x,e.g.position.z-p.z);if(d<R2&&losClear(p.x,1.45,p.z,e.g.position.x,1.3*e.s,e.g.position.z))return e}
 for(const e of enemies){if(!e.active)continue;const ep=e.g.position,d=Math.hypot(ep.x-p.x,ep.z-p.z);if(d>R2)continue;const dp=Math.hypot(ep.x-P.g.position.x,ep.z-P.g.position.z);const sc=d+(dp<12?-10:0)+(e.s>1.15?-6:0)+(e===s.tg?-5:0)+R()*3;if(sc<bs){if(!losClear(p.x,(s.crouch>.5?1.2:1.45),p.z,ep.x,ep.y+1.3*e.s,ep.z))continue;bs=sc;best=e}}return best}
function garShoot(s,e){const p=s.g.position,u=s.u,mg=s.kind==='mg';const o=new T.Vector3(p.x+Math.sin(s.g.rotation.y)*.7,p.y+(s.crouch>.5&&!s.peek?1.15:1.45),p.z+Math.cos(s.g.rotation.y)*.7);const t=e.g.position.clone();t.y+=1.25*e.s;
 const d=o.distanceTo(t),sp=(mg?.045:s.kind==='carb'?.03:.022)+d*.0004+(Math.hypot(e.vx||0,e.vz||0)>1?.015:0)+(s.morale<.5?.02:0);const v=t.sub(o).normalize();v.x+=(R()-.5)*sp;v.y+=(R()-.5)*sp*.6;v.z+=(R()-.5)*sp;v.normalize().multiplyScalar(mg?78:72);
 const m=new T.Mesh(bG,bM);m.position.copy(o);m.lookAt(o.clone().add(v));scene.add(m);bullets.push({m,v,life:1.2,dmg:mg?13:s.kind==='carb'?24:30,by:s});if(mg)trc16(o,o.clone().addScaledVector(v,.6),0xffc070);
 burst(o.x+v.x*.012,o.y,o.z+v.z*.012,0xffdd88,1,.06,1);if(R()<.5)burst(o.x,o.y,o.z,0xaaaaaa,1,.5,.8);npcShot(mg?'mg':'rifle',o.x,o.z);s.aim=.4;u.ch.rotation.x=-.08;s.recoil=1}
function garPose(s,dt){const u=s.u,mv=Math.hypot(s.vx,s.vz),k=Math.min(1,dt*10),ph=s.t*(mv>3.5?13:10);
 if(s.down>0||s.up>0){const lying=s.down>0?1:clamp(s.up/.7,0,1);s.g.rotation.x+=(-1.45*lying-s.g.rotation.x)*Math.min(1,dt*8);s.g.position.y=.25*lying;u.l1.rotation.x+=(.2-u.l1.rotation.x)*k;u.l2.rotation.x+=(-.1-u.l2.rotation.x)*k;u.aR.rotation.x+=(-2.4*lying-.4-u.aR.rotation.x)*k;u.aL.rotation.x+=(-.3-u.aL.rotation.x)*k;return}
 s.g.rotation.x*=.8;s.g.position.y=0;const cr=s.crouch;
 const gait=mv>.4?Math.sin(ph)*(mv>3.5?.75:.55):0;u.l1.rotation.x+=((cr>.5&&mv<.4?-1.25:gait)-u.l1.rotation.x)*k;u.l2.rotation.x+=((cr>.5&&mv<.4?-.35:-gait)-u.l2.rotation.x)*k;
 u.k1.rotation.x+=((cr>.5&&mv<.4?1.55:mv>.4?Math.max(0,Math.sin(ph+1.4))*.85:0)-u.k1.rotation.x)*k;u.k2.rotation.x+=((cr>.5&&mv<.4?1.75:mv>.4?Math.max(0,Math.sin(ph+4.54))*.85:0)-u.k2.rotation.x)*k;
 const by=cr>.5&&mv<.4?.42:.8+(mv>.4?Math.abs(Math.sin(ph))*.06:Math.sin(s.t*1.7)*.012);u.b.position.y+=(by-u.b.position.y)*k;
 const aim=s.aim>0||s.peek>0,rl=s.rel>0;let rx=aim?-1.48:-.85,lx=aim?-1.3:-1,er=aim?-.25:-.75,el=aim?-.4:-.9;if(rl){rx=-.7;lx=-1.4+Math.sin(s.t*12)*.15;er=-1.1;el=-1.6}if(s.melee>0){const q=1-s.melee/.45;rx=lr(-1.2,-1.7,q);er=lr(-1.6,0,q);lx=-1.4}
 u.aR.rotation.x+=(rx-u.aR.rotation.x)*k;u.aL.rotation.x+=(lx-u.aL.rotation.x)*k;u.eR.rotation.x+=(er-u.eR.rotation.x)*k;u.eL.rotation.x+=(el-u.eL.rotation.x)*k;u.aL.rotation.y+=(-.42-u.aL.rotation.y)*k;
 s.recoil=Math.max(0,(s.recoil||0)-dt*8);u.ch.rotation.x+=((-(s.recoil||0)*.12)+(mv>3.5?.12:0)-u.ch.rotation.x)*k;u.b.rotation.x+=((cr>.5&&mv<.4?.25:Math.min(.15,mv*.03))-u.b.rotation.x)*k;
 u.hd.rotation.y+=((s.tg||mv>.4?0:Math.sin(s.t*.7+s.i)*.6)-u.hd.rotation.y)*Math.min(1,dt*3);if(s.hitT>0){s.hitT-=dt;u.b.rotation.x-=s.hitT*.6}}
function garKill(s,src){if(!s.alive)return;s.alive=false;s.hp=0;if(s.post&&s.post.occ===s)s.post.occ=null;s.post=null;const g=s.g;g.rotation.x=0;
 const dx=src?g.position.x-src.x:R()-.5,dz=src?g.position.z-src.z:R()-.5,d=Math.hypot(dx,dz)||1,j={};for(const k in LIM)j[k]=(R()-.5)*8;corpses.push({g,t:0,dir:R()<.5?1:-1,vx:dx/d*3,vz:dz/d*3,vy:2.5+R()*2,j,y:0,rx:0,keep:45});
 burst(g.position.x,1.1,g.position.z,0x8a1a10,8,.5,3);garN++;feed('✝ '+s.name+' ha caído · guarnición '+GAR.filter(q=>q.alive).length+'/'+GAR.length);
 for(const o of GAR){if(!o.alive||o===s)continue;const dd=Math.hypot(o.g.position.x-g.position.x,o.g.position.z-g.position.z);if(dd<16){o.morale=Math.max(0,o.morale-.22);o.hitT=.3;if(o.bark<=0&&R()<.5){o.bark=8;say(o.name+': «¡'+['Han dado a '+s.name.split(' ')[1]+'!','¡Sanitäter! ¡Camillero!','¡Hombre abajo!','¡Cubríos, cubríos!'][R()*4|0]+'»',2.2)}}}
 if(corpses.length>26){for(const c of corpses)if(!c.keep){c.t=Math.max(c.t,8)}}}
function garDamage(s,d,src,kind){if(!s.alive||s.down>0&&kind!=='blast')return;s.hp-=d;s.hitT=.25;s.morale=Math.max(0,s.morale-.04);burst(s.g.position.x,1.2,s.g.position.z,0xaa2a1a,3,.25,2);if(s.hp<=0)garKill(s,src)}
function garUpd(dt){if(!GAR.length)return;const pp=P.g.position;let k=0;
 for(const s of GAR){if(!s.alive||!s.g.visible)continue;s.t+=dt;s.cd-=dt;s.aim=Math.max(0,s.aim-dt);s.bark-=dt;s.melee=Math.max(0,(s.melee||0)-dt);s.morale=Math.min(1,s.morale+dt*.012);const p=s.g.position;
  if(s.down>0){s.down-=dt;if(s.down<=0){s.up=.7}garPose(s,dt);continue}if(s.up>0){s.up-=dt;garPose(s,dt);continue}
  if(s.rel>0){s.rel-=dt;if(s.rel<=0)s.mag=s.kind==='mg'?100:5}
  /* percepción escalonada */
  s.tgT-=dt;if(s.tgT<=0){s.tgT=.28+R()*.25+(k++%4)*.02;s.tg=garTarget(s)}if(s.tg&&enemies.indexOf(s.tg)<0)s.tg=null;const e=s.tg;
  let near=null,nd=99;for(const o of enemies){const d=Math.hypot(o.g.position.x-p.x,o.g.position.z-p.z);if(d<nd){nd=d;near=o}}
  /* melé a bayoneta si el enemigo llega encima */
  if(near&&nd<2.6&&s.cd<=0&&s.kind!=='mg'){s.cd=1.1;s.melee=.45;s.g.rotation.y=Math.atan2(near.g.position.x-p.x,near.g.position.z-p.z);hurt(near,38,'m',s);near.stun=.35;const dx=near.g.position.x-p.x,dz=near.g.position.z-p.z,dd=Math.hypot(dx,dz)||1;near.g.position.x+=dx/dd*1.2;near.g.position.z+=dz/dd*1.2;snd(240,.12,'sawtooth',.05)}
  /* posición: retirada si la posición está desbordada o la moral cae */
  let tx=s.post?s.post.x:p.x,tz=s.post?s.post.z:p.z,sp=4.4;const over=near&&nd<6.5&&(s.kind==='mg'||s.hp<45||s.morale<.35);
  if(over||s.morale<.25){const fb=s.post&&s.post.fb;if(fb){tx=fb[0];tz=fb[1]}else{const dx=p.x-near.g.position.x,dz=p.z-near.g.position.z,dd=Math.hypot(dx,dz)||1;tx=p.x+dx/dd*8;tz=p.z+dz/dd*8}sp=5.4;if(s.bark<=0&&R()<.3){s.bark=9;say(s.name+': «¡'+['Nos desbordan, atrás!','¡Repliegue!','¡No puedo contenerlos!'][R()*3|0]+'»',2)}}
  s.inB=false;if(!(over||s.morale<.25)&&s.post&&s.post.bkI!==undefined){const b=BK[s.post.bkI];if(b.inside(p)){s.inB=true;s.wp=0}else{const o=b.out,ii=b.inn;if(!s.wp&&Math.hypot(o.x-p.x,o.z-p.z)>1.3){tx=o.x;tz=o.z}else{s.wp=1;tx=ii.x;tz=ii.z;if(Math.hypot(o.x-p.x,o.z-p.z)>6)s.wp=0}}}
  const dpost=Math.hypot(tx-p.x,tz-p.z);if(dpost>12)sp=5.3;
  if(s.nav&&s.nav.fail>2.5&&s.post&&s.post.bkI===undefined){s.post={x:p.x+(R()-.5)*5,z:p.z+(R()-.5)*5,f:s.post.f,c:false,fb:s.post.fb};s.nav.fail=0}
  const d=navMove(s,tx,tz,sp,dt,.55);const atPost=d<1.2;
  /* combate */
  s.peek=Math.max(0,s.peek-dt);const cov=s.post&&s.post.c&&atPost;s.crouch+=((((cov&&!(s.peek>0))||(cov&&s.rel>0))?1:0)-s.crouch)*Math.min(1,dt*6);if(!cov)s.crouch*=Math.pow(.02,dt);
  let face=s.post&&atPost?s.post.f:Math.atan2(s.vx,s.vz);if(Math.hypot(s.vx,s.vz)<.3&&!(s.post&&atPost))face=s.g.rotation.y;
  if(e){const ep=e.g.position,de=Math.hypot(ep.x-p.x,ep.z-p.z);face=Math.atan2(ep.x-p.x,ep.z-p.z);
   if(s.rel<=0&&s.cd<=0&&(atPost||de<30)){if(s.mag<=0){s.rel=s.kind==='mg'?4:2.6;if(s.bark<=0&&R()<.3){s.bark=7;feed(s.name+': ¡Recargando!')}}
    else{if(cov&&s.peek<=0){s.peek=1.1+R()*.8;s.cd=.25}else{garShoot(s,e);s.mag--;if(s.kind==='mg'){s.burst=(s.burst||0)+1;if(s.burst>=6+(R()*6|0)){s.burst=0;s.cd=.9+R()*.8}else s.cd=.1}else s.cd=(atPost?.9:1.4)+R()*.6;if(cov)s.peek=Math.max(s.peek,.5)}}}}
  s.g.rotation.y=angL(s.g.rotation.y,face,Math.min(1,dt*(e?7:4)));garPose(s,dt)}
 /* etiquetas cercanas */}
function garHUD(){const el=$('gar');if(!el)return;if(level!==8||!GAR.length||!GAR[0].g.visible){el.style.display='none';return}const a=GAR.filter(s=>s.alive).length;el.style.display='block';el.innerHTML='GUARNICIÓN <b>'+a+'/'+GAR.length+'</b> <span>'+'▮'.repeat(a)+'<i>'+'▮'.repeat(GAR.length-a)+'</i></span>'}
/* =====================================================================
   OBJETIVOS ENEMIGOS: cada enemigo elige entre jugador, teniente,
   camaradas y guarnición (distancia, amenaza, protección) — sólo cap. VIII
   ===================================================================== */
function allyDamage(a,d){if(a.down>0)return;a.hp=(a.hp===undefined?100:a.hp)-d*.55;a.hitT=.25;burst(a.g.position.x,1.2,a.g.position.z,0xaa2a1a,3,.25,2);if(a.hp<=0){a.down=7;a.hp=0;feed('⚕ '+a.name+' está herido — se recompondrá');say(a.name+': «¡Me han dado… sigo vivo!»',2)}}
function offDamage(d){const o=officer;if(!o||o.down>0)return;o.hp=(o.hp===undefined?130:o.hp)-d*.6;o.hitT=.3;o.lastHit=0;burst(o.g.position.x,1.3,o.g.position.z,0xaa2a1a,3,.25,2);if(o.hp<=0){o.down=6;o.hp=0;feed('⚕ ¡El teniente ha caído!');say('¡El teniente está herido! ¡Cubridle!',2.5)}}
e8T=function(e){if(level!==8)return null;e.tgT8=(e.tgT8||0)-(V16.dt||.016);if(e.tgT8>0&&e.tgr8&&e.tgr8.ok())return e.tgr8;
 const p=e.g.position;let best={p:P.g.position,h:hitP,ok:()=>true},bs=Math.hypot(P.g.position.x-p.x,P.g.position.z-p.z)-6+R()*4;
 const cand=(q,h,ok,bias)=>{const d=Math.hypot(q.x-p.x,q.z-p.z)+bias+R()*4;if(d<bs){bs=d;best={p:q,h,ok}}};
 if(officer&&officer.g.visible&&!(officer.down>0))cand(officer.g.position,offDamage,()=>officer.g.visible&&!(officer.down>0),1);
 for(const a of allies)if(a.name&&a.g.visible&&!(a.down>0))cand(a.g.position,d=>allyDamage(a,d),()=>a.name&&!(a.down>0),2);
 for(const s of GAR)if(s.alive&&s.g.visible&&!(s.down>0))cand(s.g.position,d=>garDamage(s,d,p),()=>s.alive,s.post&&s.post.bk?7:0);
 e.tgT8=.7+R()*.8;e.tgr8=best;e.tp8=best.p;e.th8=best.h;return best};
e8Hit=function(b){if(level!==8)return false;const p=b.m.position;
 for(const s of GAR){if(!s.alive||!s.g.visible)continue;const q=s.g.position;if(Math.abs(p.x-q.x)<.6&&Math.abs(p.z-q.z)<.6&&p.y>q.y&&p.y<q.y+(s.crouch>.5&&!(s.peek>0)?1.25:1.95)){garDamage(s,b.dmg*.85,b.m.position);return true}}
 for(const a of allies){if(!a.name||!a.g.visible||a.down>0)continue;const q=a.g.position;if(Math.abs(p.x-q.x)<.6&&Math.abs(p.z-q.z)<.6&&p.y<q.y+2){allyDamage(a,b.dmg);return true}}
 const o=officer;if(o&&o.g.visible&&!(o.down>0)){const q=o.g.position;if(Math.abs(p.x-q.x)<.6&&Math.abs(p.z-q.z)<.6&&p.y<q.y+2.1){offDamage(b.dmg);return true}}return false};
e8Blast=function(x,z,r,pw){if(level!==8)return;for(const s of GAR){if(!s.alive)continue;const d=Math.hypot(s.g.position.x-x,s.g.position.z-z);if(d<r){const pr=s.inB?.3:s.crouch>.5?.6:1;garDamage(s,pw*(1-d/r*.6)*pr,{x,z},'blast');if(s.alive&&pw*(1-d/r)>16&&!s.inB){s.down=1.2+R()*1.4}}}
 for(const a of allies)if(a.name){const d=Math.hypot(a.g.position.x-x,a.g.position.z-z);if(d<r)allyDamage(a,pw*(1-d/r*.6))}if(officer){const d=Math.hypot(officer.g.position.x-x,officer.g.position.z-z);if(d<r)offDamage(pw*(1-d/r*.6))}};
/* =====================================================================
   EL TENIENTE — comandante de campo autónomo (IA por prioridades)
   1 amenaza al jugador · 2 amenaza propia · 3 amenaza a compañeros ·
   4 enemigos que bloquean el objetivo · 5 enemigos de alto valor ·
   6 defensa de posiciones · 7 reagrupar · 8 avanzar · 9 explorar
   ===================================================================== */
const BIG=e=>e.s>=1.18||e.mino||['granadero','orcoH','custodio','boss','mecha','mago'].indexOf(e.type)>=0;
const ST_ES={intercept:'PROTEGER AL OBERLEUTNANT',melee:'CARGA A SABLE',fallback:'REPLEGARSE',support:'APOYAR A UN COMPAÑERO',assault:'ASALTAR',flank:'FLANQUEAR',cover:'FUEGO Y COBERTURA',focus:'FUEGO CONCENTRADO',hold:'DEFENDER POSICIÓN',regroup:'REAGRUPAR',advance:'AVANZAR',explore:'RECONOCER',heal:'CUBRIRSE',reload:'RECARGAR',down:'HERIDO'};
const OFF_LINES={intercept:['¡A cubierto, Oberleutnant! ¡Yo me encargo!','¡Detrás de mí, Kovač!'],melee:['¡A sable, por la Corona!','¡Venid aquí, perros!'],fallback:['¡Atrás, atrás! ¡Reagrupaos!','¡Retroceded a cubierto!'],support:['¡Aguanta, voy hacia ti!','¡Cubrid a ese hombre!'],assault:['¡Adelante, a la carga!','¡Ahora, todos a una!'],flank:['¡Rodeadlos por el flanco!','¡Envolvedlos, rápido!'],cover:['¡Fuego y cobertura!','¡Que no levanten la cabeza!'],focus:['¡Fuego concentrado sobre el grande!','¡Todos contra esa bestia!'],hold:['¡Mantened la línea!','¡Nadie retrocede!'],regroup:['¡Escuadra, reagrupaos conmigo!','¡Cerrad filas!'],advance:['¡Avanzamos por saltos!','¡Seguidme!'],explore:['Ojos abiertos…','Demasiado silencio.']};
function offModel(){if(!officer)return;if(officer.v16)return;const old=officer.g,ng=mkOfficerModel();ng.position.copy(old.position);ng.rotation.y=old.rotation.y;ng.visible=old.visible;if(old.parent)old.parent.add(ng);old.parent&&old.parent.remove(old);officer.g=ng;officer.v16=1;officer.hp=130;officer.down=0;officer.mag=10;officer.nade=12;officer.st='advance';officer.dec=0;officer.hold=0;officer.pers={aggr:.4+R()*.4,caution:.3+R()*.4};
 const sh=mkSabre();sh.visible=false;ng.userData.mR.add(sh);ng.userData.sabreH=sh;
 if(!officer.lab){const lab=document.createElement('div');lab.className='nm';lab.style.color='#ffd27a';$('hud').appendChild(lab);officer.lab=lab}officer.name=level===8?'Lt. Hollenstein':'Lt. '+NM[R()*NM.length|0]}
const _mkOff16=makeOfficer;makeOfficer=function(){const o=_mkOff16();officer.v16=0;offModel();return officer};
function objPoint(){const pp=P.g.position;if(level===8){const MX=X8+38,MZ=-150;return L8.ph<=3?{x:X8,z:-98}:L8.ph===4?{x:X8,z:-140}:L8.ph===5?{x:MX,z:MZ}:L8.ph===6?{x:X8,z:8}:{x:X8,z:-40}}const fx=-Math.sin(yaw),fz=-Math.cos(yaw);return{x:pp.x+fx*14,z:pp.z+fz*14}}
function coverNear(x,z,thx,thz,maxd){let best=null,bs=1e9;for(const c of covers){const d=Math.hypot(c.x-x,c.z-z);if(d>maxd)continue;const vx=c.x-thx,vz=c.z-thz,l=Math.hypot(vx,vz)||1,k=c.r+.9,px=c.x+vx/l*k,pz=c.z+vz/l*k;if(blockedAt(px,pz,.4))continue;const s=Math.hypot(px-x,pz-z)+R()*2;if(s<bs){bs=s;best={x:px,z:pz}}}return best}
function officerAI(dt){const op=officer;if(!op||!op.g.visible)return;if(!op.v16)offModel();const g=op.g,me=g.position,pp=P.g.position,u=g.userData;op.t+=dt;op.cd-=dt;op.dec-=dt;op.voice=(op.voice||0)-dt;op.nade-=dt;op.mcd=(op.mcd||0)-dt;op.hold-=dt;op.lastHit=(op.lastHit||0)+dt;op.rel=Math.max(0,(op.rel||0)-dt);if(op.rel===0&&op.wasRel){op.wasRel=0;op.mag=10}
 /* herido: cae, se arrastra y se levanta */
 if(op.down>0){op.down-=dt;op.st='down';g.rotation.x+=(-1.4-g.rotation.x)*Math.min(1,dt*6);g.position.y=.25;u.aR.rotation.x=-2.6;if(op.down<=0){op.hp=70;op.up=.9;say(op.name+': «Sólo es un rasguño… ¡seguimos!»',2.5)}return}
 if(op.up>0){op.up-=dt;g.rotation.x*=Math.pow(.02,dt);g.position.y*=Math.pow(.02,dt);if(op.up<=0){g.rotation.x=0;g.position.y=0}return}
 if(op.lastHit>4&&op.hp<130)op.hp=Math.min(130,op.hp+dt*6);
 const act=enemies.filter(e=>e.active);let tP=null,dP=1e9,tS=null,dS=1e9,big=null,dB=1e9;
 for(const e of act){const q=e.g.position,a=Math.hypot(q.x-pp.x,q.z-pp.z),b=Math.hypot(q.x-me.x,q.z-me.z);if(a<dP){dP=a;tP=e}if(b<dS){dS=b;tS=e}if(BIG(e)&&b<dB){dB=b;big=e}}
 /* decisiones con histéresis: se re-evalúan cada ~0,35 s o al instante ante amenazas inmediatas */
 const melT=tP&&(tP.type==='plaga'||tP.type==='orcoH'||tP.type==='custodio'||tP.mino||tP.berserk);
 const urgent=(tP&&(dP<8||(melT&&dP<13)))||(tS&&dS<4.5);
 op.forced=Math.max(0,(op.forced||0)-dt);if(op.forced>0&&!urgent){op.st='regroup';op.mode='protect';op.goal={x:pp.x+Math.sin(yaw)*2.6+Math.cos(yaw)*2,z:pp.z+Math.cos(yaw)*2.6-Math.sin(yaw)*2};op.dec=.2}
 else if(op.dec<=0||(urgent&&op.st!=='intercept'&&op.st!=='melee'&&op.st!=='fallback')){op.dec=.3+R()*.15;let st='advance',goal=null,tgt=null;const obj=objPoint();
  if(tP&&(dP<8||(melT&&dP<13))){st='intercept';tgt=tP;const vx=tP.g.position.x-pp.x,vz=tP.g.position.z-pp.z,l=Math.hypot(vx,vz)||1;goal={x:pp.x+vx/l*2.6,z:pp.z+vz/l*2.6}}
  else if(tS&&dS<4.5){if(!BIG(tS)&&op.hp>45&&op.mcd<=0&&op.pers.aggr>.35){st='melee';tgt=tS;goal={x:tS.g.position.x,z:tS.g.position.z}}else{st='fallback';tgt=tS;const vx=me.x-tS.g.position.x,vz=me.z-tS.g.position.z,l=Math.hypot(vx,vz)||1;goal={x:me.x+vx/l*7+(pp.x-me.x)*.2,z:me.z+vz/l*7+(pp.z-me.z)*.2}}}
  else{let sup=null,sd=1e9,se=null;const mates=[...allies.filter(a=>a.name&&a.g.visible&&!(a.down>0)).map(a=>a.g.position),...GAR.filter(s=>s.alive&&s.g.visible).map(s=>s.g.position)];
   for(const m of mates){if(Math.hypot(m.x-me.x,m.z-me.z)>24)continue;for(const e of act){const d=Math.hypot(e.g.position.x-m.x,e.g.position.z-m.z);if(d<6&&d<sd){sd=d;sup=m;se=e}}}
   if(sup){st='support';tgt=se;goal={x:(sup.x*2+me.x)/3,z:(sup.z*2+me.z)/3}}
   else{const blk=act.filter(e=>Math.hypot(e.g.position.x-obj.x,e.g.position.z-obj.z)<22&&Math.hypot(e.g.position.x-me.x,e.g.position.z-me.z)<55);
    const defend=level===8&&(L8.ph===10||L8.ph===11)||level===2||level===4||level===5;
    if(op.hp<45&&tS&&dS<30){st='heal';tgt=tS;goal=coverNear(me.x,me.z,tS.g.position.x,tS.g.position.z,16)}
    else if(big&&dB<50&&(!blk.length||R()<.4)){st='focus';tgt=big;V16.focus=big;goal=coverNear(me.x,me.z,big.g.position.x,big.g.position.z,14)}
    else if(blk.length&&!defend){let cx=0,cz=0;blk.forEach(e=>{cx+=e.g.position.x;cz+=e.g.position.z});cx/=blk.length;cz/=blk.length;tgt=blk.reduce((a,b)=>Math.hypot(b.g.position.x-me.x,b.g.position.z-me.z)<Math.hypot(a.g.position.x-me.x,a.g.position.z-me.z)?b:a);
     const agg=op.pers.aggr+(doctrine==='soviet'?.3:0)-(doctrine==='swiss'?.2:0);
     if(blk.length<=3&&op.hp>60&&agg>.55){st='assault';const vx=me.x-cx,vz=me.z-cz,l=Math.hypot(vx,vz)||1;goal={x:cx+vx/l*6,z:cz+vz/l*6}}
     else if(doctrine==='milan'||(R()<.45&&doctrine!=='swiss')){st='flank';op.fside=op.fside||(R()<.5?1:-1);const vx=cx-me.x,vz=cz-me.z,l=Math.hypot(vx,vz)||1;goal={x:cx-vz/l*14*op.fside-vx/l*6,z:cz+vx/l*14*op.fside-vz/l*6}}
     else{st='cover';goal=coverNear(me.x,me.z,cx,cz,14)||{x:me.x,z:me.z}}}
    else if(defend&&act.length){st='hold';let cx=0,cz=0;act.forEach(e=>{cx+=e.g.position.x;cz+=e.g.position.z});cx/=act.length;cz/=act.length;tgt=tS;const ax=(pp.x*2+cx)/3,az=(pp.z*2+cz)/3;goal=coverNear(ax,az,cx,cz,16)||{x:ax,z:az}}
    else if(Math.hypot(me.x-pp.x,me.z-pp.z)>24||allies.some(a=>a.name&&a.g.visible&&Math.hypot(a.g.position.x-pp.x,a.g.position.z-pp.z)>22)){st='regroup';goal={x:pp.x+Math.sin(yaw)*3+Math.cos(yaw)*2.5,z:pp.z+Math.cos(yaw)*3-Math.sin(yaw)*2.5}}
    else if(!act.length||dS>45){st=act.length?'advance':(R()<.12&&op.st!=='advance'?'explore':'advance');const vx=obj.x-pp.x,vz=obj.z-pp.z,l=Math.hypot(vx,vz)||1,ah=Math.min(9,l);goal={x:pp.x+vx/l*ah+(op.fside||1)*2.5,z:pp.z+vz/l*ah};if(st==='explore')goal={x:me.x+(R()-.5)*10,z:me.z+(R()-.5)*10};const cv=coverNear(goal.x,goal.z,obj.x,obj.z,5);if(cv&&act.length)goal=cv}
    else{st='cover';tgt=tS;goal=coverNear(me.x,me.z,tS.g.position.x,tS.g.position.z,12)||{x:me.x,z:me.z}}}}
  if(op.mag<=0&&!op.wasRel){op.rel=1.8;op.wasRel=1;if(st!=='intercept'&&st!=='melee'&&tS){const cv=coverNear(me.x,me.z,tS.g.position.x,tS.g.position.z,10);if(cv){goal=cv;st='reload'}}}
  /* sin bloquear al jugador ni alejarse demasiado */
  if(goal){const lx=goal.x-pp.x,lz=goal.z-pp.z,ld=Math.hypot(lx,lz),lim=st==='assault'||st==='flank'?34:st==='support'?30:24;if(ld>lim){goal.x=pp.x+lx/ld*lim;goal.z=pp.z+lz/ld*lim}if(ld<1.6&&st!=='intercept'){goal.x=pp.x+Math.cos(yaw)*2.2;goal.z=pp.z-Math.sin(yaw)*2.2}}
  if(op.nav&&op.nav.fail>0&&goal){goal={x:me.x+(pp.x-me.x)*.5+(R()-.5)*6,z:me.z+(pp.z-me.z)*.5+(R()-.5)*6};op.nav.fail=0}
  if(st!==op.st){if(op.voice<=0&&(st!=='advance'||R()<.25)&&st!=='reload'){op.voice=4+R()*3;const L=OFF_LINES[st];if(L){say(op.name+': «'+L[R()*L.length|0]+'»',2.6);feed('TENIENTE: '+ST_ES[st])}}op.st=st}
  op.goal=goal||op.goal||{x:me.x,z:me.z};op.tgt=tgt;op.mode={intercept:'protect',melee:'defend',fallback:'defend',support:'defend',assault:'assault',flank:'flank',cover:'cover',focus:'cover',hold:'cover',heal:'cover',reload:'cover'}[st]||'advance';
  const ot={protect:'PROTEGER AL OFICIAL',defend:'DEFENSA CERCANA',assault:'ASALTO COORDINADO',flank:'ENVOLVER POR LOS FLANCOS',cover:'FUEGO Y COBERTURA',advance:'AVANZAR POR SECCIONES'}[op.mode];if(ot!==orderText){orderText=ot}}
 if(V16.focus&&enemies.indexOf(V16.focus)<0)V16.focus=null;
 /* movimiento con navegación y antiatasco; nunca encima del jugador */
 const st=op.st,spd={intercept:6.4,melee:6.6,fallback:5.6,support:5.6,assault:5.8,flank:5.4,cover:4.9,focus:4.6,hold:4.4,heal:5,reload:5,regroup:5.6,advance:4.3,explore:2.6}[st]||4.4;
 const gl=op.goal||{x:me.x,z:me.z};let d=navMove(op,gl.x,gl.z,spd,dt,st==='melee'?1.4:.8);const dpl=Math.hypot(me.x-pp.x,me.z-pp.z);if(dpl<1.3){const k=(1.3-dpl)/1.3;me.x+=(me.x-pp.x)/(dpl||1)*k*dt*6;me.z+=(me.z-pp.z)/(dpl||1)*k*dt*6}
 /* combate: pistola C96, sable, granada */
 let tg=op.tgt&&enemies.indexOf(op.tgt)>=0?op.tgt:tS;const tdist=tg?Math.hypot(tg.g.position.x-me.x,tg.g.position.z-me.z):1e9;
 if(st==='melee'&&tg&&tdist<2.3&&op.mcd<=0){op.mcd=1.05;op.swing=.45;hurt(tg,62,'m',op);tg.stun=.6;const vx=tg.g.position.x-me.x,vz=tg.g.position.z-me.z,l=Math.hypot(vx,vz)||1;tg.g.position.x+=vx/l*1.8;tg.g.position.z+=vz/l*1.8;burst(tg.g.position.x,1.3,tg.g.position.z,0xffcc66,6,.3,5);snd(220,.15,'sawtooth',.07)}
 else if(tg&&tdist<44&&op.cd<=0&&op.rel<=0&&op.mag>0&&st!=='melee'){const o=me.clone();o.y=1.55;if(losClear(o.x,o.y,o.z,tg.g.position.x,1.3*tg.s,tg.g.position.z)){op.cd=.32+R()*.25+(Math.hypot(op.vx,op.vz)>3?.2:0);op.mag--;const aim=tg.g.position.clone();aim.y=1.3*tg.s;const v=aim.sub(o).normalize(),sp=.026+(Math.hypot(op.vx,op.vz)>3?.03:0);v.x+=(R()-.5)*sp;v.y+=(R()-.5)*sp*.6;v.z+=(R()-.5)*sp;v.normalize().multiplyScalar(68);const m=new T.Mesh(bG,bM);m.position.copy(o);m.lookAt(o.clone().add(v));scene.add(m);bullets.push({m,v,life:1.3,dmg:24,by:op});SFXV=clamp(1-dpl/70,.15,1);weaponSfx('c10');muzzleBurst(o);op.aim=.4}else op.cd=.2}
 if(op.nade<=0&&act.length>=3&&level!==7){for(const e of act){const q=e.g.position,de=Math.hypot(q.x-me.x,q.z-me.z);if(de<12||de>30||Math.hypot(q.x-pp.x,q.z-pp.z)<8)continue;let n=0;for(const f of act)if(Math.hypot(f.g.position.x-q.x,f.g.position.z-q.z)<5)n++;if(n>=3){op.nade=16+R()*8;op.throwT=.5;const pos=me.clone();pos.y=1.8;const t=1.2,v=new T.Vector3((q.x-me.x)/t,(9*t*t-1.8+1)/t*.55+3,(q.z-me.z)/t);const gm=new T.Mesh(new T.SphereGeometry(.2,8,6),new T.MeshLambertMaterial({color:0x2a3a1a}));gm.position.copy(pos);scene.add(gm);grens.push({m:gm,pos,v,fuse:1.5});say(op.name+': «¡Granada!»',1.4);break}}}
 /* animación: marcha, carrera, puntería, recarga, sable, lanzamiento, cuclillas en cobertura */
 const face=tg&&tdist<48?Math.atan2(tg.g.position.x-me.x,tg.g.position.z-me.z):(Math.hypot(op.vx,op.vz)>.4?Math.atan2(op.vx,op.vz):Math.atan2(pp.x-me.x,pp.z-me.z));g.rotation.y=angL(g.rotation.y,face,Math.min(1,dt*7));
 const mv=Math.hypot(op.vx,op.vz),run=mv>4.6,ph=op.t*(run?13:10),k=Math.min(1,dt*10),cr=(st==='cover'||st==='hold'||st==='focus'||st==='reload'||st==='heal')&&mv<.5&&d<1.5?1:0;op.aim=Math.max(0,(op.aim||0)-dt);op.swing=Math.max(0,(op.swing||0)-dt);op.throwT=Math.max(0,(op.throwT||0)-dt);
 const gait=mv>.35?Math.sin(ph)*(run?.8:.58):0;u.l1.rotation.x+=((cr?-1.2:gait)-u.l1.rotation.x)*k;u.l2.rotation.x+=((cr?-.3:-gait)-u.l2.rotation.x)*k;u.k1.rotation.x+=((cr?1.5:mv>.35?Math.max(0,Math.sin(ph+1.4))*(run?.95:.7):0)-u.k1.rotation.x)*k;u.k2.rotation.x+=((cr?1.7:mv>.35?Math.max(0,Math.sin(ph+4.54))*(run?.95:.7):0)-u.k2.rotation.x)*k;
 u.b.position.y+=((cr?.45:.8+(mv>.35?Math.abs(Math.sin(ph))*(run?.07:.045):Math.sin(op.t*1.6)*.015))-u.b.position.y)*k;u.b.rotation.x+=(((cr?.2:0)+Math.min(.16,mv*.03))-u.b.rotation.x)*k;
 const sw=op.swing>0;u.sabreH.visible=sw||st==='melee';u.mR.children.forEach(c=>{if(c!==u.sabreH)c.visible=!u.sabreH.visible});if(u.sabre)u.sabre.visible=!u.sabreH.visible;
 let rx=tg&&tdist<44?-1.5:-.6,er=tg&&tdist<44?-.15:-.5,lx=-.5,el=-.6;if(sw){const q=1-op.swing/.45;rx=q<.35?lr(-1.2,-3,q/.35):lr(-3,-.7,(q-.35)/.65);er=-.3}else if(op.rel>0){rx=-1;er=-1.2;lx=-1.3+Math.sin(op.t*14)*.15;el=-1.5}else if(op.throwT>0){rx=lr(-3,-1,1-op.throwT/.5);er=-.3}else if(!tg&&mv>.4){rx=-.4-gait*.4;lx=-.4+gait*.4}
 if(op.voice>3.2&&!tg){lx=-2.6;el=-.2}u.aR.rotation.x+=(rx-u.aR.rotation.x)*k;u.eR.rotation.x+=(er-u.eR.rotation.x)*k;u.aL.rotation.x+=(lx-u.aL.rotation.x)*k;u.eL.rotation.x+=(el-u.eL.rotation.x)*k;
 u.hd.rotation.y+=((tg?0:st==='explore'||st==='advance'?Math.sin(op.t*.9)*.7:0)-u.hd.rotation.y)*Math.min(1,dt*3);if(op.hitT>0){op.hitT-=dt;u.b.rotation.x-=op.hitT*.8}}
function offLabel(){const o=officer;if(!o||!o.lab)return;if(!o.g.visible||!playing||(level===8&&L8.cine)){o.lab.style.display='none';return}const v=o.g.position.clone();v.y+=2.7;v.project(cam);const dd=o.g.position.distanceTo(cam.position);if(v.z<1&&dd<70&&Math.abs(v.x)<1.1&&Math.abs(v.y)<1.1){o.lab.style.display='block';o.lab.style.left=((v.x*.5+.5)*innerWidth)+'px';o.lab.style.top=((-v.y*.5+.5)*innerHeight)+'px';o.lab.textContent='★ '+o.name+' · '+(ST_ES[o.st]||'');o.lab.style.opacity=clamp(1.3-dd/70,.35,1)}else o.lab.style.display='none'}
/* =====================================================================
   ESCUADRA: los 3 camaradas conservan su doctrina, ahora con navegación
   antiatasco, posibilidad de caer heridos y recomponerse
   ===================================================================== */
allyUpdate=function(dt){if(!playing)return;officerAI(dt);const op=officer,active=enemies.filter(e=>e.active),leader=op&&op.g.visible?op.g.position:null;
 const nearest=(from,max=65)=>{let best=null,bd=max;for(const e of active){const d=Math.hypot(e.g.position.x-from.x,e.g.position.z-from.z);if(d<bd){bd=d;best=e}}return{e:best,d:bd}};
 for(const a of allies){if(!a.name)continue;const p=a.g.position,u=a.g.userData;a.t+=dt;a.cd-=dt;a.aim=Math.max(0,a.aim-dt);a.ammoT-=dt;a.rel=Math.max(0,a.rel-dt);if(a.rel===0&&a.wasReload){a.mag=a.role==='Apoyo'?30:5;a.wasReload=false}
  if(a.down>0){a.down-=dt;a.g.rotation.x+=(-1.4-a.g.rotation.x)*Math.min(1,dt*6);p.y=.25;u.aR.rotation.x=-2.2;if(a.down<=0){a.hp=60;a.up=.8}continue}
  if(a.up>0){a.up-=dt;a.g.rotation.x*=Math.pow(.02,dt);p.y*=Math.pow(.02,dt);if(a.up<=0){a.g.rotation.x=0;p.y=0}continue}
  const threat=nearest(p,72),tg=threat.e,apo=a.role==='Apoyo',scout=a.role==='Fusilero';
  let tx=leader?leader.x+(a.i-1)*3.2:P.g.position.x+(a.i-1)*3.2,tz=leader?leader.z+3.5+(a.i%2?1.6:-1.6):P.g.position.z+5;
  if(level===2||level===4){tx=WC.x+(a.i-1)*13;tz=-1.6}if(level===5){tx=8000+[-7.5,7.5,-4][a.i];tz=[-6.5,-6.5,2][a.i]}
  let desired=apo?11:scout?7:8;if(op&&op.mode==='protect'){tx=P.g.position.x+(a.i-1)*2.3;tz=P.g.position.z+2.8;desired=5}
  if(tg&&op&&op.mode==='flank'){tx=tg.g.position.x+(tg.g.position.z-p.z)*a.flankSide*.9;tz=tg.g.position.z-(tg.g.position.x-p.x)*a.flankSide*.9;desired=apo?13:7}
  else if(tg&&op&&op.mode==='assault'){tx=tg.g.position.x+(a.i-1)*2.3;tz=tg.g.position.z+3+(a.i%2)*1.2;desired=apo?10:4.5}
  else if(tg&&op&&op.mode==='cover'){const cv=a.cvT>0&&a.cv?a.cv:coverNear(p.x,p.z,tg.g.position.x,tg.g.position.z,12);a.cv=cv;a.cvT=(a.cvT>0?a.cvT:3)-dt;if(cv){tx=cv.x;tz=cv.z;desired=.8}else{tx=leader?leader.x+(a.i-1)*4.2:p.x;tz=leader?leader.z+5+(a.i%2)*2:p.z;desired=apo?13:9}}
  if(tg&&(!op||op.mode==='advance'))desired=apo?13:9;
  {const w=route8(a,tx,tz);if(w){tx=w[0];tz=w[1];desired=.5}}let dx=tx-p.x,dz=tz-p.z,d=Math.hypot(dx,dz),mx=0,mz=0;if(d>desired){mx=dx/(d||1);mz=dz/(d||1)}
  if(tg&&scout&&op&&op.mode!=='assault'){const side=a.flankSide;mx+=-((tg.g.position.z-p.z)*side)*.009;mz+=(tg.g.position.x-p.x)*side*.009}
  {const dpl=Math.hypot(p.x-P.g.position.x,p.z-P.g.position.z);if(dpl<1.4){mx+=(p.x-P.g.position.x)/(dpl||1);mz+=(p.z-P.g.position.z)/(dpl||1)}}
  const ml=Math.hypot(mx,mz);if(ml>1){mx/=ml;mz/=ml}if(ml>.05){const s=steer(a,mx,mz,dt);const m2=Math.min(1,ml);mx=s[0]*m2;mz=s[1]*m2}
  const sp=apo?3.6:scout?5.0:4.3,accel=Math.min(1,dt*(apo?2.7:scout?5.5:4));a.vx=a.vx||0;a.vz=a.vz||0;a.vx+=(mx*sp-a.vx)*accel;a.vz+=(mz*sp-a.vz)*accel;p.x+=a.vx*dt;p.z+=a.vz*dt;resolve(p,.5);
  const ftg=(V16.focus&&active.indexOf(V16.focus)>=0&&Math.hypot(V16.focus.g.position.x-p.x,V16.focus.g.position.z-p.z)<50)?V16.focus:tg,fd=ftg?Math.hypot(ftg.g.position.x-p.x,ftg.g.position.z-p.z):99;
  if(ftg){const range=apo?45:scout?39:36;if(a.rel<=0&&a.cd<=0&&fd<range){if(a.mag<=0){a.rel=apo?2.8:2.1;a.wasReload=true;feed(a.name+': ¡Recargando!')}else{a.mag--;a.aim=.35;a.cd=(apo?.13:scout?.82:1.05)+R()*.3;const o=p.clone();o.y=1.4;const t2=ftg.g.position.clone();t2.y=1.2*ftg.s;const v=t2.sub(o).normalize(),spread=apo?.035:scout?.025:.05;v.x+=(R()-.5)*spread;v.y+=(R()-.5)*spread*.6;v.z+=(R()-.5)*spread;v.normalize().multiplyScalar(apo?70:62);const m=new T.Mesh(bG,bM);m.position.copy(o);m.lookAt(o.clone().add(v));scene.add(m);bullets.push({m,v,life:1.3,dmg:apo?7:scout?19:16,by:a});if(R()<.55){SFXV=clamp(1-Math.hypot(p.x-cam.position.x,p.z-cam.position.z)/80,.15,1);weaponSfx(apo?'smg':'rifle')}}}}
  if(apo&&a.ammoT<=0&&playing){a.ammoT=42+R()*18;pick(P.g.position.x+(R()-.5)*4,P.g.position.z+(R()-.5)*4,'a')}
  const face=ftg?Math.atan2(ftg.g.position.x-p.x,ftg.g.position.z-p.z):(Math.hypot(a.vx,a.vz)>.2?Math.atan2(a.vx,a.vz):a.g.rotation.y);a.g.rotation.y=angL(a.g.rotation.y,face,Math.min(1,dt*(scout?8:apo?4.5:6)));
  const mv=Math.hypot(a.vx,a.vz)>.35,ph=a.t*(scout?13:apo?8.5:10),k=Math.min(1,dt*10),gait=mv?Math.sin(ph)*(scout?.72:apo?.42:.58):0,cr=op&&op.mode==='cover'&&!mv&&ftg?1:0;
  u.l1.rotation.x+=((cr?-1.2:gait)-u.l1.rotation.x)*k;u.l2.rotation.x+=((cr?-.3:-gait)-u.l2.rotation.x)*k;u.k1.rotation.x+=((cr?1.5:mv?Math.max(0,Math.sin(ph+1.4))*(scout?.85:.55):0)-u.k1.rotation.x)*k;u.k2.rotation.x+=((cr?1.7:mv?Math.max(0,Math.sin(ph+4.54))*(scout?.85:.55):0)-u.k2.rotation.x)*k;
  const aiming=!!ftg&&fd<(apo?45:40);u.aR.rotation.x+=((aiming?(apo?-1.15:-1.45):apo?-.55:-.85)-u.aR.rotation.x)*k;u.aL.rotation.x+=((aiming?-1.25:apo?-.7:-1)-u.aL.rotation.x)*k;u.eR.rotation.x+=((aiming?-.35:-.75)-u.eR.rotation.x)*k;u.eL.rotation.x+=((aiming?-.35:-.85)-u.eL.rotation.x)*k;
  u.b.position.y+=((cr?.45:.8+(mv?Math.abs(Math.sin(ph))*(scout?.07:.045):Math.sin(a.t*(apo?1.2:1.8))*.012))-u.b.position.y)*k;u.b.rotation.x+=(Math.min(.13,Math.hypot(a.vx,a.vz)*.026)+(a.aim>0?-.04:0)+(cr?.2:0)-u.b.rotation.x)*Math.min(1,dt*8);if(a.hitT>0){a.hitT-=dt;u.b.rotation.x-=a.hitT*.7}}};
/* =====================================================================
   BÚNKERES v16 — hormigón armado, troneras reales (las balas pasan por
   la ranura), puerta metálica con bisagras y colisión, interior habitable
   ===================================================================== */
const BK=[];
function bunker8(x,z,side,label){const W=12,D=8,H=3.1,t=.8;sBegin();
 const C=(w,h,d,px,py,pz,y0)=>{box(w,h,d,0xffffff,x+px,py,z+pz,0,0,rt_(concT,Math.max(w,d)/3,h/2));obstB.push({x:x+px,z:z+pz,hw:w/2,hd:d/2,h:py+h/2,y0:y0||0})};
 for(const s of[1,-1]){const pz=s*(D/2-t/2);C(W,1.15,t,0,.575,pz);C(2.65,.55,t,-4.675,1.425,pz,1.15);C(3.7,.55,t,0,1.425,pz,1.15);C(2.65,.55,t,4.675,1.425,pz,1.15);C(W,H-1.7,t,0,1.7+(H-1.7)/2,pz,1.7);
  for(const sx of[-2.6,2.6]){box(1.7,.1,1.1,0x6a6862,x+sx,1.12,z+pz+s*.2,0,0,concT);box(1.9,.12,.2,0x3a3a36,x+sx,1.74,z+pz+s*.45)}}
 const L=D-2*t,sx=side*(W/2-t/2);C(t,H,L,-sx,H/2,0);const pl=(L-1.7)/2;C(t,H,pl,sx,H/2,1.7/2+pl/2);C(t,H,pl,sx,H/2,-(1.7/2+pl/2));box(t,H-2.3,1.7,0xffffff,x+sx,2.3+(H-2.3)/2,z,0,0,concT);obstB.push({x:x+sx,z,hw:t/2,hd:.85,h:H,y0:2.8});
 C(W+.9,.5,D+.9,0,H+.25,0,H);
 box(W-2*t,.06,D-2*t,0xc8a070,x,.03,z,0,0,rt_(woodTex,3,2));
 /* berma de tierra, sacos terreros, marco de puerta, señalización */
 for(const s of[1,-1]){const b=box(W+1.6,.95,2.2,0x8a7a5a,x,.32,z+s*(D/2+1.05),0,0,rt_(dirtT,3,1));b.rotation.x=s*.32}
 for(let i=0;i<8;i++)for(const s of[1,-1])box(1.45,.42,.85,0xffffff,x-5.1+i*1.46,H+.72,z+s*(D/2-.1),0,0,sackT);
 for(const s of[1,-1]){box(.9,1.15,2.2,0xffffff,x+side*(W/2+1.5),.58,z+s*2.3,0,0,sackT);obstB.push({x:x+side*(W/2+1.5),z:z+s*2.3,hw:.45,hd:1.1,h:1.15})}
 box(.3,2.6,.3,0x55534e,x+sx+side*.35,1.3,z+1.0,0,0,concT);box(.3,2.6,.3,0x55534e,x+sx+side*.35,1.3,z-1.0,0,0,concT);box(.3,.3,2.3,0x55534e,x+sx+side*.35,2.45,z,0,0,concT);
 box(1.1,.5,.06,0xd8d0b0,x+sx+side*.52,2.8,z+1.5);box(.9,.12,.07,0x1a1a1a,x+sx+side*.53,2.85,z+1.5);
 /* interior: munición, camilla, mesa con teléfono de campaña, estantería de proyectiles, lámpara */
 for(let i=0;i<3;i++)box(.9,.5,.6,0x6a5a3a,x-side*4.2,.25+(i===2?.5:0),z-1.6+(i%2)*1.1,0,0,woodTex);
 box(2,.08,.62,0x8a8460,x-side*1.5,.62,z+.2);for(const q of[-1,1])box(2.1,.06,.06,0x3a2a1a,x-side*1.5,.6,z+.2+q*.32);for(const q of[-.9,.9])for(const r of[-.25,.25])box(.05,.6,.05,0x3a2a1a,x-side*1.5+q,.3,z+.2+r);
 box(1.2,.06,.7,0x5a4630,x+side*2.6,.85,z-1.9,0,0,woodTex);for(const q of[-.5,.5])box(.06,.85,.06,0x3a2a1a,x+side*2.6+q,.42,z-1.9);box(.26,.18,.2,0x2a2a26,x+side*2.4,.97,z-1.9);
 for(let i=0;i<4;i++)box(1.6,.05,.4,0x4a3a28,x-side*4.6,.5+i*.5,z+2.2);for(let i=0;i<8;i++)cp(.08,.08,.36,0xb8963a,x-side*5+(i%4)*.3,.72+(i>3?.5:0),z+2.2);
 cp(.06,.06,1.6,0x3a3d40,x-side*3,H+.6,z-2.2);box(.25,.18,.18,0x2a2c2e,x-side*3,H+1.45,z-2.2);
 box(.36,.3,.36,0xffd890,x,H-.3,z,0,0xffa040);
 /* MG sobre trineo en la tronera central frontal */
 box(.8,.12,1.1,0x3a3d40,x,1.0,z+D/2-1.2);cp(.08,.08,1.1,0x2a2a26,x,1.32,z+D/2-.85).rotation.x=1.5708;box(.2,.25,.4,0x3a3d40,x,1.32,z+D/2-1.4);
 sEnd();
 const dg=new T.Group();dg.position.set(x+sx+side*.42,0,z-.85);const dq=PB();pBox(dq,.12,2.28,1.7,0x4a4e52,0,1.14,.85,0,0,0,.04);for(let i=0;i<4;i++)for(let j=0;j<3;j++)pBox(dq,.15,.04,.04,0x6a6e72,0,.3+i*.55,.25+j*.6);pBox(dq,.16,.06,1.6,0x3a3d40,0,.5,.85);pBox(dq,.16,.06,1.6,0x3a3d40,0,1.8,.85);pBox(dq,.2,.08,.12,0x9a9a90,side*.08,1.1,1.45);
 for(const y of[.4,1.9])pCyl(dq,.06,.06,.25,0x2a2a26,0,y,0,0,0,0,6);pbMesh(dq,dg,VCV);scene.add(dg);
 const o={x:x+sx,z,hw:.42,hd:.85,h:2.3};obstB.push(o);
 const b={x,z,W,D,side,label,door:{g:dg,a:0,open:false,o,t:0,x:x+sx,z,side},inside:q=>Math.abs(q.x-x)<W/2-t-.1&&Math.abs(q.z-z)<D/2-t-.1,out:{x:x+side*(W/2+1.7),z},inn:{x:x+side*(W/2-t-1.3),z}};
 covers.push({x,z:z-D/2-1,r:6});BK.push(b);return b}
function doorsUpd(dt){for(const b of BK){const d=b.door;let near=Math.hypot(P.g.position.x-d.x,P.g.position.z-d.z)<3.2;if(!near)for(const s of GAR)if(s.alive&&s.g.visible&&Math.hypot(s.g.position.x-d.x,s.g.position.z-d.z)<3){near=true;break}
 if(!near&&officer&&Math.hypot(officer.g.position.x-d.x,officer.g.position.z-d.z)<3)near=true;if(!near)for(const a of allies)if(a.name&&Math.hypot(a.g.position.x-d.x,a.g.position.z-d.z)<3){near=true;break}if(!near)for(const e of enemies)if(Math.hypot(e.g.position.x-d.x,e.g.position.z-d.z)<3){near=true;break}
 if(near)d.t=2.2;else d.t-=dt;const want=d.t>0;if(want!==d.open){d.open=want;const i=obstB.indexOf(d.o);if(want&&i>=0)obstB.splice(i,1);else if(!want&&i<0)obstB.push(d.o);snd(want?160:120,.35,'square',.03)}
 d.a+=((d.open?-1.45*d.side:0)-d.a)*Math.min(1,dt*4);d.g.rotation.y=d.a}}
/* =====================================================================
   DECORADO DEL FUERTE (curado y funcional). Ala OESTE persiste; ala ESTE
   (polvorín) desaparece con la detonación y libera sus colisiones.
   ===================================================================== */
const FX8={W:[],E:[],eObst:[],eObstB:[],eCov:[],rub:null,ruinF:[],cols:[]};
function batch8(list,fn,east){const n0=scene.children.length,o0=obst.length,b0=obstB.length,c0=covers.length;sBegin();fn();scene.updateMatrixWorld(true);sEnd();list.push(...scene.children.slice(n0));if(east){FX8.eObst.push(...obst.slice(o0));FX8.eObstB.push(...obstB.slice(b0));FX8.eCov.push(...covers.slice(c0))}}
function emplace(x,z,f,n){/* nido de sacos terreros en media luna, de cara a f */n=n||3;for(let i=0;i<n;i++){const a=f+(i-(n-1)/2)*.62,cx=x+Math.sin(a)*1.6,cz=z+Math.cos(a)*1.6;const m=box(1.8,1.05,.85,0xffffff,cx,.52,cz,0,0,sackT);m.rotation.y=a;obstB.push({x:cx,z:cz,hw:.75,hd:.75,h:1.05})}covers.push({x:x+Math.sin(f)*1.6,z:z+Math.cos(f)*1.6,r:1.6})}
function cot(x,z,r){const g=gp(x,z,r);box(.8,.08,2,0x6a6448,0,.55,0,g,0,canvasT);for(const s of[-1,1])box(.06,.06,2.1,0x4a3420,s*.4,.52,0,g);for(const s of[-1,1])for(const q of[-.95,.95])box(.05,.5,.05,0x4a3420,s*.38,.26,q,g);box(.7,.12,.3,0xd8d0c0,0,.64,-.8,g)}
function shellStack(x,z){for(let i=0;i<4;i++)for(let j=0;j<3;j++)cp(.12,.12,.6,0xb8963a,x+i*.26,.3+j*.0,z+j*.26);box(1.3,.08,1,0x4a3a28,x+.4,.02,z+.26)}
function guardBox(x,z,r){const g=gp(x,z,r);box(1.4,2.4,1.4,0xffffff,0,1.2,0,g,0,woodTex);box(1.0,1.6,.1,0x1a1612,0,1.1,.71,g);mesh(new T.ConeGeometry(1.15,.7,4),0x6a2a1a,0,2.75,0,g).rotation.y=.785;ob(x,z,1)}
function brazier(x,z){cp(.45,.3,.5,0x2a2a26,x,1.1,z);cp(.06,.06,1,0x2a2a26,x,.5,z);for(let i=0;i<3;i++)box(.06,1,.06,0x2a2a26,x+Math.cos(i*2.1)*.3,.45,z+Math.sin(i*2.1)*.3).rotation.z=.3;ob(x,z,.5)}
fort2=function(){bld(X8-46,-125,12,24,3,'e');bld(X8-46,-165,12,24,3,'e');bld(X8+44,-118,15,9,3,'w');bld(X8+44,-190,15,9,3,'w');bld(X8-20,-195,15,9,4,'s');bld(X8-26,-118,9,6,3,'s');chFlush();
 batch8(FX8.W,()=>{
  /* cuarteles: catres, taquillas y mesa en los barracones del oeste */
  for(const zc of[-125,-165])for(let i=0;i<4;i++){cot(X8-49.5,zc-9+i*4.6,1.5708);box(.6,1.8,.5,0x5a5a4a,X8-51.4,.9,zc-7+i*4.6)}box(2.4,.08,1.2,0x6a4a2a,X8-44,.85,-125,0,0,woodTex);for(const s of[-1,1])PR.bench(X8-44,-125+s*1.2,0);
  /* puestos de guardia, braseros, banderas */
  guardBox(X8-8,-103,0);guardBox(X8+8,-103,0);brazier(X8-6,-100.5);brazier(X8+6,-100.5);
  for(const [x,z] of[[-30,-104],[-52,-145],[-10,-190]])PR.flag(X8+x,z,0x7a1a1a,9);
  /* emplazamientos del patio (cobertura para quien domine el patio) */
  emplace(X8-14,-128,Math.PI);emplace(X8+12,-128,Math.PI);emplace(X8-30,-144,Math.PI);emplace(X8-4,-152,Math.PI);emplace(X8-18,-162,Math.PI);emplace(X8-40,-106,Math.PI,2);
  /* hospital de sangre con camillas, comedor, herramientas, morteros y cañones de plaza */
  PR.tent(X8-32,-182,0,0xd8d0c0);box(1,1,.05,0xd02020,X8-32,2.2,-180.6);box(.3,1,.06,0xffffff,X8-32,2.2,-180.55);box(1,.3,.06,0xffffff,X8-32,2.2,-180.55);for(let i=0;i<3;i++)cot(X8-26+i*1.2,-186,0);
  for(let i=0;i<3;i++){box(2.6,.08,1,0x6a4a2a,X8-24+i*4,.8,-108,0,0,woodTex);PR.bench(X8-24+i*4,-109,0)}PR.fire(X8-12,-112);
  PR.cannon(X8-24,-150,Math.PI);PR.cannon(X8-36,-160,Math.PI*.9);
  for(const [x,z] of[[-8,-138],[2,-182]]){emplace(X8+x,z,0,4)}shellStack(X8-30,-132);shellStack(X8-6,-120);
  for(let i=0;i<5;i++)PR.crate(X8-34+i*1.5,-190,0,1);for(let i=0;i<4;i++)PR.barrel(X8-38+i*1.2,-174);PR.cart(X8-36,-112,1.2);
  /* pasarela de madera interior en la muralla frontal con escaleras */
  for(const s of[-1,1]){for(let i=0;i<5;i++){const x=X8+s*(16+i*8);box(8,.15,2.2,0xffffff,x,4.2,-99.2,0,0,woodTex);for(const q of[-3.6,3.6])box(.18,4.2,.18,0x4a3016,x+q,2.1,-98.2,0,0,woodTex)}PR.ladder(X8+s*14,0,-98.6,4.2,0)}
  for(const [x,z] of[[-20,-170],[-44,-140],[-12,-130]])PR.lamp(X8+x,z,4.2);
 });
 batch8(FX8.E,()=>{
  /* depósito de pólvora y munición junto al polvorín (ala este) */
  for(let i=0;i<6;i++)PR.barrel(X8+30+(i%3)*1.3,-160-Math.floor(i/3)*1.3,0x5a2a1a);for(let i=0;i<4;i++)PR.stack(X8+50,-134-i*5,1.5708);shellStack(X8+26,-140);shellStack(X8+48,-160);
  emplace(X8+20,-140,Math.PI);emplace(X8+26,-172,Math.PI,4);PR.cart(X8+52,-150,0);PR.cart(X8+22,-118,2.2);
  for(const [x,z] of[[30,-130],[50,-170]])PR.lamp(X8+x,z,4.2);box(2.4,.8,.08,0xd8c060,X8+38,4.2,-143.9);box(2,.2,.09,0x1a1a1a,X8+38,4.3,-143.85);
 },true)};
fort3=function(){const lab=(x,z,y,c)=>box(2.2,.9,.1,c,x,y,z);
 batch8(FX8.W,()=>{for(const [x,z,c] of[[-46,-112.9,0xc03030],[-46,-152.9,0x6a8a4a],[-20,-190.4,0x3a4a6a]])lab(X8+x,z,5.6,c);
  for(const s of[-1,1]){const x=X8+s*54,z=-120-(s>0?30:0);if(s<0){cp(.3,.3,16,0x3a3a36,x,8,z);for(let i=0;i<5;i++)box(1.6,.12,.12,0x3a3a36,x,3+i*3,z);box(.6,.4,.6,0x2a2a2a,x,16.2,z);ob(x,z,1)}}
  for(let i=0;i<12;i++){const x=X8-56+i*10,z=-101;if(Math.abs(x-X8)>10&&x<X8+14){box(3.5,.1,.1,0x2a2a2a,x,.7,z);box(3.5,.1,.1,0x2a2a2a,x,1.3,z);cp(.05,.05,1.5,0x2a2a2a,x-1.7,.75,z)}}
  for(let i=0;i<14;i++){const x=X8-50+R()*62,z=-110-R()*84;if(free(x,z,1.2))box(.6+R()*1.2,.3+R()*.5,.6+R()*1.2,0x6a6050,x,.2,z).rotation.y=R()*3}});
 batch8(FX8.E,()=>{lab(X8+44,-113.4,5.6,0xd8d8d0);lab(X8+44,-185.4,5.6,0x3a4a6a);const x=X8+54,z=-150;cp(.3,.3,16,0x3a3a36,x,8,z);for(let i=0;i<5;i++)box(1.6,.12,.12,0x3a3a36,x,3+i*3,z);ob(x,z,1);
  for(let i=0;i<5;i++){const x2=X8+16+i*10;box(3.5,.1,.1,0x2a2a2a,x2,.7,-101);box(3.5,.1,.1,0x2a2a2a,x2,1.3,-101)}},true);
 const w=[];const tk=mkTank16('wr');tk.position.set(X8-14,.3,-186);tk.rotation.set(0,2.4,-.08);w.push(tk);ob(X8-14,-186,3.4);covers.push({x:X8-14,z:-186,r:4});
 const k=mkKrupp();k.position.set(X8-34,0,-130);k.rotation.set(0,2,.3);w.push(k);const tr=mkTruck16({driver:false,col:0x3a3a30});tr.position.set(X8+28,0,-128);tr.rotation.set(0,.6,1.35);tr.position.y=1.1;w.push(tr);FX8.E.push(tr);
 const pk=mkTruck16({driver:false});pk.position.set(X8-24,0,-178);pk.rotation.y=1.5708;ob(X8-24,-178,2.2);ob(X8-20,-178,2.2);ob(X8-28,-178,2.2);covers.push({x:X8-24,z:-178,r:3});
 L8.wreck=[tk,k];};
/* glacis: pozos de tirador para la guarnición atacante; campamento con fogatas, reflector y tienda de mando */
function glacis8(){sBegin();for(const x of[-40,-28,-16,-6,6,16,28,40]){emplace(X8+x,-40,Math.PI,3);PR.crater(X8+x+(R()-.5)*6,-34-R()*4,1.6+R())}
 for(const x of[-30,30])emplace(X8+x,-22,Math.PI,2);
 PR.fire(X8-14,26);PR.fire(X8+16,30);PR.tent(X8-24,34,0,0xc8c0a0);box(2,.08,1.2,0x5a4a30,X8-24,.9,30,0,0,woodTex);box(1.4,.02,.9,0xd8d0b0,X8-24,.95,30);for(let i=0;i<6;i++)PR.pole(X8-50+i*10,46,7);
 for(const s of[-1,1]){emplace(X8+s*6,-58,Math.PI,2)}scene.updateMatrixWorld(true);sEnd();mkFire(X8-14,26,.7,.15,0);mkFire(X8+16,30,.7,.15,1);
 const sl=mkTruck16({driver:false});sl.position.set(X8-22,0,42);sl.rotation.y=Math.PI;const q=PB();pCyl(q,.55,.6,.8,0x2a2c2a,0,0,0,1.5708,0,0,12);pCyl(q,.5,.5,.04,0xfff0d0,0,0,.42,1.5708,0,0,12);pBox(q,.2,1,.2,0x2a2c2a,0,-.7,0);const lamp=pbMesh(q,sl,VCV);lamp.position.set(0,2.85,-2.4);lamp.rotation.y=Math.PI;FX8.slTruck=sl;ob(X8-22,42,2.5);ob(X8-22,38,2.5);ob(X8-22,46,2.5)}
/* escombros y fuegos de la detonación (preconstruidos, ocultos) */
function rubble8(){const MX=X8+38,MZ=-150,q=PB(),pts=[];for(let i=0;i<16;i++){const a=i/16*6.2832+R()*.3,r=19+R()*16;let x=MX+Math.cos(a)*r,z=MZ+Math.sin(a)*r;x=Math.min(x,X8+72);pts.push([x,z,1.4+R()*1.4]);const n=9+R()*6|0;
  for(let j=0;j<n;j++){const s=.5+R()*1.3;pBox(q,s*(.8+R()*.6),s*(.5+R()*.5),s*(.8+R()*.6),[0xb8ab92,0xa89a80,0xc8bca0,0x8a8070,0x9a9890][R()*5|0],x+(R()-.5)*3.4,s*.25,z+(R()-.5)*3.4,R()*.6,R()*3,R()*.6,.08)}
  for(let j=0;j<3;j++)pBox(q,.2,.12,1.6+R()*1.4,0x4a3220,x+(R()-.5)*3,.25,z+(R()-.5)*3,R()*.5,R()*3,R()*.4);if(R()<.5)pBox(q,.08,.08,2.4,0x2a2a2a,x,.4,z,.6,R()*3,.4)}
 const m=pbMesh(q,scene,VCM);m.visible=false;FX8.rub=m;FX8.rubPts=pts;
 for(let i=0;i<5;i++){const p=pts[i*3%pts.length];const f=mkFire(p[0]+1,p[1]+1,.9+R()*.6,0,-1);f.g.visible=false;FX8.ruinF.push(f)}
 const ring=new T.Mesh(new T.RingGeometry(.8,1,48),new T.MeshBasicMaterial({color:0xffc890,transparent:true,opacity:0,blending:T.AdditiveBlending,depthWrite:false,side:T.DoubleSide}));ring.rotation.x=-1.5708;ring.position.set(MX,.3,MZ);scene.add(ring);FX8.ring=ring}
/* DETONACIÓN PARCIAL: ala este, polvorín, una torre y un tramo de parapeto. El resto resiste. */
function partialBoom(MX,MZ){V16.boomT=0;V16.boomed=true;
 chBlast(MX,0,MZ,46,30,0);chBlast(X8+3,15,-175,8,16,.35);chBlast(X8+12,11,-96,5,11,.5);chBlast(X8+32,11,-96,7,13,.45);chBlast(X8+64,12,-150,10,14,.3);
 for(const o of FX8.E)o.visible=false;for(let i=0;i<6;i++)if(L8.props[i])L8.props[i].visible=false;
 const rm=(arr,src)=>{for(const o of src){const i=arr.indexOf(o);if(i>=0)arr.splice(i,1)}};rm(obst,FX8.eObst);rm(obstB,FX8.eObstB);rm(covers,FX8.eCov);
 flashLight(MX,24,MZ,9,3.2,0xffc070);searchSet(false);FX8.ring.material.opacity=.9;FX8.ringT=0;
 /* la guarnición sufre según distancia, protección y posición */
 for(const s of GAR){if(!s.alive)continue;const d=Math.hypot(s.g.position.x-MX,s.g.position.z-MZ);if(d<44)garKill(s,{x:MX,z:MZ});else if(d<95){const k=1-(d-44)/51,pr=s.inB?.3:s.crouch>.5?.65:1;garDamage(s,70*k*pr,{x:MX,z:MZ},'blast');if(s.alive&&!s.inB&&k>.25)s.down=1.5+k*2.5}}
 for(const a of allies)if(a.name){const d=Math.hypot(a.g.position.x-MX,a.g.position.z-MZ);if(d<95)a.hitT=.5}
 setTimeout(()=>{if(level!==8)return;FX8.rub.visible=true;for(const p of FX8.rubPts){ob(p[0],p[1],p[2]);covers.push({x:p[0],z:p[1],r:p[2]+.6})}for(const f of FX8.ruinF)f.g.visible=true;bindFireLight(FX8.ruinF[0].x,1.5,FX8.ruinF[0].z,3,0xff7a30);bindFireLight(FX8.ruinF[2].x,1.5,FX8.ruinF[2].z,4,0xff7a30)},1600)}
/* =====================================================================
   BLINDADOS: animación de orugas/ruedas, torreta independiente,
   cañón principal con retroceso, ametralladora de cúpula con artillero
   ===================================================================== */
function tankAnim(g,sp,dt){const u=g.userData;if(!u.trk)return;u.trk.map.offset.x-=sp*dt*.18;for(const w of u.wh)w.rotation.x+=sp*dt/.45;u.rec=Math.max(0,(u.rec||0)-dt*2.2);u.gun.position.z=1.35-u.rec*.55;u.mgRec=Math.max(0,(u.mgRec||0)-dt*10);
 if(u.gunner){const gu=u.gunner.userData,k=u.mgRec;gu.aR.rotation.x=-1.35+(R()-.5)*.12*k;gu.aL.rotation.x=-1.3+(R()-.5)*.12*k;gu.eR.rotation.x=gu.eL.rotation.x=-.55;gu.ch.rotation.x=-.1*k+(u.gunAim||0);gu.hd.rotation.x=-.05+(R()-.5)*.05*k}
 if(sp>.5&&R()<dt*6)smoke(g.position.x+Math.sin(g.rotation.y)*-3.6+(R()-.5),2.6,g.position.z+Math.cos(g.rotation.y)*-3.6,2.2,2.5,0x2a2a2a,1.4,.4);if(sp>.5&&R()<dt*8)burst(g.position.x+(R()-.5)*3,.3,g.position.z,0x6a5a48,1,.6,2)}
const _tv=new T.Vector3(),_tw=new T.Vector3();
function tankTurret(g,tx,tz,dt,rate){const u=g.userData;const want=Math.atan2(tx-g.position.x,tz-g.position.z)-g.rotation.y;u.tur.rotation.y=angL(u.tur.rotation.y,want,Math.min(1,dt*(rate||1.3)));let e=((want-u.tur.rotation.y+Math.PI)%6.2832+6.2832)%6.2832-Math.PI;return Math.abs(e)}
function tankMainGun(g,tg,who){const u=g.userData;u.muz.getWorldPosition(_tv);u.rec=1;burst(_tv.x,_tv.y,_tv.z,0xffcc66,10,.25,10);smoke(_tv.x,_tv.y,_tv.z,5,2.6,0x8a8a8a,.6,.6);flashLight(_tv.x,_tv.y+1,_tv.z,4,.25,0xffd090);npcShot('big',_tv.x,_tv.z);snd(60,.5,'sawtooth',.12);shake=Math.max(shake,.6);const ex=tg.g.position.x,ez=tg.g.position.z;L8.tm.push({t:L8.t+.25,fn:()=>{impact(ex,1,ez,1);flashLight(ex,3,ez,5,.4)}})}
function tankMG(g,dt,maxd,who,hitP_){const u=g.userData;if(!u.gunner)return;u.mcd=(u.mcd||0)-dt;u.mrt=(u.mrt||0)-dt;const fwd=g.rotation.y+u.tur.rotation.y;
 if(!u.mtg||enemies.indexOf(u.mtg)<0||u.mrt<=0){u.mrt=.6+R()*.8;let b=null,bd=maxd||46;for(const e of enemies){const d=Math.hypot(e.g.position.x-g.position.x,e.g.position.z-g.position.z);if(d<bd&&(e!==u.mtg||R()<.5)){bd=d;b=e}}u.mtg=b}
 const t=u.mtg;if(!t){u.gunAim=0;return}const want=Math.atan2(t.g.position.x-g.position.x,t.g.position.z-g.position.z)-fwd;u.mgr.rotation.y=angL(u.mgr.rotation.y,want,Math.min(1,dt*6));u.gunAim=-.05;
 const err=Math.abs(((want-u.mgr.rotation.y+Math.PI)%6.2832+6.2832)%6.2832-Math.PI);
 if(u.mpause>0){u.mpause-=dt;return}if(u.mcd<=0&&err<.25){u.mcd=.075;u.mb=(u.mb||0)+1;if(u.mb>=8+(R()*10|0)){u.mb=0;u.mpause=.22+R()*.4}u.mgRec=1;u.mmz.getWorldPosition(_tv);_tw.set(t.g.position.x+(R()-.5)*1.4,1+R()*1.2*t.s,t.g.position.z+(R()-.5)*1.4);trc16(_tv,_tw,0xffb050);burst(_tv.x,_tv.y,_tv.z,0xffdd88,1,.05,2);npcShot('mg',_tv.x,_tv.z);
  if(R()<(hitP_||.32)){hurt(t,20,'b',who||{name:'El artillero'});burst(_tw.x,_tw.y,_tw.z,0xaa2a1a,2,.2,3)}else burst(_tw.x,.2,_tw.z,0x8a7a60,2,.3,3)}}
spawnTanks=function(){L8.tk=[];const H=V16.tc&&V16.tc.tk;[[-34,'sh'],[-6,'hero'],[18,'st'],[38,'sh']].forEach(([x,k],i)=>{let g;if(k==='hero'&&H)g=H;else{g=mkTank2(k);g.rotation.y=Math.PI;g.position.set(X8+x,0,64+i*9)}L8.tk.push({g,k,tz:-22-(i%2)*8,cd:2+R()*2})});L8.hero=L8.tk[1];
 say('Radio: «¡4.ª División Blindada en el sector! ¡Los Hunyadi M.16 abren fuego!»',6);snd(60,2,'sawtooth',.15);engine(true,.05);for(const s of GAR)if(s.alive){s.morale=Math.min(1,s.morale+.45)}const s=GAR.find(q=>q.alive);if(s)setTimeout(()=>say(s.name+': «¡Los blindados! ¡Están aquí!»',2.5),2500)};
tanksUpd=function(dt){for(const t of L8.tk){const g=t.g,u=g.userData,dz=t.tz-g.position.z;let tg=null,bd=170;for(const e of enemies){const d=Math.hypot(e.g.position.x-g.position.x,e.g.position.z-g.position.z)-(BIG(e)?25:0);if(d<bd){bd=d;tg=e}}let sp=0;
 if(dz<-.5&&!t.on){const v=Math.max(-9*dt,dz);g.position.z+=v;sp=-v/dt;if(g.position.z<=t.tz+.6)t.on=1}
 else if(tg){g.rotation.y=angL(g.rotation.y,Math.atan2(tg.g.position.x-g.position.x,tg.g.position.z-g.position.z),Math.min(1,dt*.25));}
 g.position.y=Math.abs(Math.sin(time*7+t.tz))*.02*(sp>0?1:0);g.rotation.x=Math.sin(time*2.3+t.tz)*.012*(sp>0?1:.2);tankAnim(g,sp,dt);
 if(tg&&u.tur){const err=tankTurret(g,tg.g.position.x,tg.g.position.z,dt);t.cd-=dt;if(t.cd<=0&&err<.07){t.cd=2.6+R()*1.6;tankMainGun(g,tg)}}
 tankMG(g,dt,44,{name:'Artillero del '+(t.k==='hero'?'Reinhardt':'Hunyadi')})}};
/* =====================================================================
   CINEMÁTICA — AVANCE DEL TANQUE (antes de la secuencia final)
   ===================================================================== */
function tankCineStart(){L8.cine=1;L8.ph=13;L8.skip=0;firing=false;const c=V16.tc={t:0,shot:-1,tk:null,gunCd:3.2,smk:0,sw:0};$('tc').style.display='none';$('bars').style.display='block';$('skip').style.display='block';$('pr').textContent='';$('arrow').style.display='none';$('obj').textContent='';$('plant').style.display='none';
 const tk=mkTank16('hero');tk.position.set(X8-6,0,150);tk.rotation.y=Math.PI;c.tk=tk;
 for(let i=0;i<16;i++)smoke(X8-6+(R()-.5)*30,1.2+R()*2.5,34-R()*44,10+R()*7,20,0x4a4c56,.15,.62);
 for(let i=0;i<7;i++){const e=spawnR(['sol','plaga','orcoE','trasgo','sol','plaga','orcoH'][i],X8-6+(R()-.5)*34,8-R()*40);e.cine=1;e.alert=0}
 engine(true,.09);story('Del humo surge el rugido de un motor: la 4.ª División Blindada ha llegado.');feed('Cinemática · pulsa Saltar / Intro')}
function tankCineEnd(){const c=V16.tc;if(!c||L8.ph!==13)return;const tk=c.tk;if(tk.position.z>-14){tk.position.set(X8-6,0,-16)}tk.rotation.set(0,Math.PI,0);for(const e of enemies)e.cine=0;
 L8.cine=0;L8.ph=11;L8.at=0;L8.skip=0;story('');$('bars').style.display='none';$('skip').style.display='none';$('tc').style.display='block';spawnTanks()}
function camTo(x,y,z,lx,ly,lz,dt,snap){if(snap){cam.position.set(x,y,z)}else{const k=Math.min(1,dt*4);cam.position.x+=(x-cam.position.x)*k;cam.position.y+=(y-cam.position.y)*k;cam.position.z+=(z-cam.position.z)*k}cam.position.y=Math.max(.5,cam.position.y);cam.lookAt(lx,ly,lz)}
function tankCine(dt){const c=V16.tc,tk=c.tk,u=tk.userData;c.t+=dt;L8.t+=dt;time+=dt;const t=c.t;if(L8.skip){L8.skip=0;tankCineEnd();return}
 /* avance sobre terreno irregular, a través del humo */
 const z0=tk.position.z,zt=150-Math.min(t,17.5)*9.8,x=X8-6+Math.sin(zt*.045)*4.5;const sp=(z0-zt)/Math.max(dt,1e-4);tk.position.set(x,Math.abs(Math.sin(t*2.6))*.07+Math.max(0,Math.sin(zt*.21))*.12,zt);
 tk.rotation.y=Math.PI+Math.cos(zt*.045)*.2;tk.rotation.x=Math.sin(t*3.1)*.025+Math.cos(zt*.21)*.03;tk.rotation.z=Math.sin(t*2.2)*.018;tankAnim(tk,Math.min(14,sp),dt);
 /* los enemigos cargan contra el blindado y reaccionan a los impactos */
 for(const e of enemies){const p=e.g.position,dx=tk.position.x-p.x,dz=tk.position.z-p.z,d=Math.hypot(dx,dz)||1;e.t+=dt;if(d<60&&!e.stun){p.x+=dx/d*e.sp*.55*dt;p.z+=dz/d*e.sp*.55*dt;e.g.rotation.y=Math.atan2(dx,dz);animE(e,1,0,dt,false)}if(e.stun>0)e.stun-=dt;if(d<4.6)hurt(e,9999,'m')}
 tankMG(tk,dt,52,{name:'El artillero Weiss'},.42);
 c.gunCd-=dt;let big=null,bd=90;for(const e of enemies){const d=Math.hypot(e.g.position.x-tk.position.x,e.g.position.z-tk.position.z)-(BIG(e)?20:0);if(d<bd){bd=d;big=e}}if(big){const err=tankTurret(tk,big.g.position.x,big.g.position.z,dt,1.6);if(c.gunCd<=0&&err<.1){c.gunCd=4.2;tankMainGun(tk,big)}}
 if(R()<dt*1.4){const ex=tk.position.x+(R()-.5)*70,ez=tk.position.z-30-R()*60;burst(ex,1,ez,0xff7a20,10,.6,8);flashLight(ex,4,ez,3,.3);npcShot('big',ex,ez)}
 c.smk-=dt;if(c.smk<=0&&zt>-5){c.smk=.18;smoke(x+(R()-.5)*12,1+R()*2,zt-6-R()*14,8+R()*5,9,0x50525c,.2,.5)}
 /* dirección de cámara: plano general · frontal bajo · orugas · lateral · torreta/artillero · impactos · humo · aproximación */
 const sh=t<2.6?0:t<4.6?1:t<6.6?2:t<8.6?3:t<11?4:t<13?5:t<15?6:7,snap=sh!==c.shot;c.shot=sh;const P_=tk.position;
 if(sh===0)camTo(X8+24,15-t*2,P_.z-34,P_.x,2,P_.z,dt,snap);
 else if(sh===1)camTo(P_.x+1.6,.75,P_.z-14,P_.x,2.2,P_.z,dt,snap);
 else if(sh===2)camTo(P_.x+3.8,.85,P_.z-1.2,P_.x+1.4,.75,P_.z+2,dt,snap);
 else if(sh===3)camTo(P_.x+13,2.4,P_.z+3,P_.x,1.8,P_.z,dt,snap);
 else if(sh===4){u.tur.updateMatrixWorld(true);_tv.set(2.4,3,-3.2);u.tur.localToWorld(_tv);u.mgr.getWorldPosition(_tw);camTo(_tv.x,_tv.y,_tv.z,_tw.x,_tw.y+.6,_tw.z,dt,snap)}
 else if(sh===5){const e=u.mtg||big;if(e){const q=e.g.position,dx=q.x-P_.x,dz=q.z-P_.z,l=Math.hypot(dx,dz)||1;camTo(q.x+dz/l*5+dx/l*3,1.7,q.z-dx/l*5+dz/l*3,q.x,1.2,q.z,dt,snap)}else camTo(P_.x-7,1.6,P_.z-12,P_.x,2,P_.z,dt,snap)}
 else if(sh===6)camTo(P_.x-7.5,1.5,P_.z-12,P_.x,2,P_.z,dt,snap);
 else{_tv.set(.8,5.6,-12.5);tk.localToWorld(_tv);camTo(_tv.x,_tv.y,_tv.z,P_.x,1.5,P_.z-40,dt,snap)}
 if(t>7&&!c.s1){c.s1=1;story('El artillero Weiss barre la llanura con su ametralladora, sin soltar el gatillo.')}if(t>13&&!c.s2){c.s2=1;story('El Hunyadi del comandante Reinhardt atraviesa el humo hacia el portal.')}
 runTm();updParts(dt);chUpd(dt);if(t>=18)tankCineEnd()}
const _c816=cine8;cine8=function(dt){if(L8.ph===13){tankCine(dt);return}_c816(dt)};
/* =====================================================================
   DIRECTOR DE BATALLA DEL CAPÍTULO VIII — fases enlazadas y no repetibles
   ===================================================================== */
const PI_=Math.PI;
const PS={assault:[-40,-28,-16,-6,6,16,28,40].map(x=>[X8+x,-40,PI_,1,0,[X8+x,-26]]),
 court:[[X8-14,-128,PI_,1],[X8+12,-128,PI_,1],[X8-30,-144,PI_,1],[X8-4,-152,PI_,1],[X8-18,-162,PI_,1],[X8+20,-140,PI_,1],[X8+2,-105,PI_,0],[X8-40,-106,PI_,1]].map(p=>[...p,0,[X8+(p[0]-X8)*.5,-104]]),
 rear:[[X8-6,-101,PI_,0,0,[X8-6,-60]],[X8+6,-101,PI_,0,0,[X8+6,-60]],[X8-15,-104,PI_,0,0,[X8-12,-60]],[X8-26,-103,PI_,0,0,[X8-24,-60]]],
 outer:[[X8-48.6,-82.6,PI_,0,1],[X8-43.4,-82.6,PI_,0,1],[X8+48.6,-82.6,PI_,0,1],[X8+43.4,-82.6,PI_,0,1],...[-36,-24,-12,12,24,36].map(x=>[X8+x,-60.6,PI_,1,0,[X8+x,-34]]),[X8-6,-56.4,PI_,1,0,[X8-6,-34]],[X8+6,-56.4,PI_,1,0,[X8+6,-34]]]};
PS.portal=PS.outer;
function garAssign2(name){garAssign(name,name==='rear'?[...PS.rear,...PS.outer]:PS[name]);for(const s of GAR){if(!s.post)continue;const p=s.post;p.bkI=undefined;if(p.bk){for(let i=0;i<BK.length;i++)if(BK[i].inside({x:p.x,z:p.z}))p.bkI=i}s.wp=0}}
function banner(t,sub){const b=$('phase');if(!b)return;b.innerHTML=t+(sub?'<small>'+sub+'</small>':'');b.style.transition='none';b.style.opacity=1;b.style.transform='translateX(-50%) scale(1.06)';requestAnimationFrame(()=>{b.style.transition='opacity 1.2s 2.6s,transform 3.8s';b.style.opacity=0;b.style.transform='translateX(-50%) scale(1)'});snd(110,.8,'triangle',.05)}
function l8Setup(){nightSky('night');scene.fog.near=26;scene.fog.far=195;lightsInit();for(const p of LT.pts)p.on=false;bindFireLight(X8-14,1.2,26,0);bindFireLight(X8+16,1.2,30,1);
 if(!V16.l8f){V16.l8f=1;mkFire(X8-6,-100.5,.45,1.3,2);mkFire(X8+6,-100.5,.45,1.3,3)}else{bindFireLight(X8-6,2.2,-100.5,2);bindFireLight(X8+6,2.2,-100.5,3)}
 LT.sr=110;LT.sdir=1;searchSet(true,X8,22,-175);
 if(officer){offModel();officer.name='Lt. Hollenstein';const i=L8.rid.indexOf(officer.g);if(i>=0){L8.T1.remove(officer.g);L8.rid.splice(i,1);scene.add(officer.g)}officer.g.visible=false}
 if(L8.lt){scene.remove(L8.lt);const lt=mkOfficerModel();lt.position.set(X8,0,-30);lt.visible=false;scene.add(lt);L8.lt=lt}
 L8.rid.forEach((g,i)=>{const s=i%2?1:-1,row=Math.floor(i/2);g.position.set(s*.98,1.1,-.95-row*1.05);g.rotation.set(0,s>0?-PI_/2:PI_/2,0);const u=g.userData;u.l1.rotation.x=u.l2.rotation.x=-1.45;u.k1.rotation.x=u.k2.rotation.x=1.45;u.b.position.y=.8;u.aR.rotation.x=-.7;u.aL.rotation.x=-.9});
 for(const o of L8.TR||[])o.gu.position.z=-9.4;
 if(!GAR.length){const n=G.detail>0?8:6;for(let i=0;i<n;i++)mkGar(i,i===2||i===6?'mg':i%3===1?'carb':'rifle')}garVisible(false);
 Object.assign(V16,{ph:-1,boomed:false,retreat:0,reinf:0,focus:null});FX8.ring.material.opacity=0;ambStart()}
function l8Begin(){const lt=L8.lt;if(officer){officer.g.visible=true;officer.g.position.set(lt?lt.position.x:X8-8,0,lt?lt.position.z:30);officer.st='advance';officer.dec=0;officer.hp=130;officer.down=0}if(lt)lt.visible=false;
 GAR.forEach((s,i)=>{if(!s.alive)return;s.g.visible=true;s.g.position.set(X8-21+i*6,0,22+(i%2)*3);s.g.rotation.y=PI_});garAssign2('assault');
 banner('FASE I · ASALTO AL GLACIS','La guarnición avanza contigo · el teniente dirige la escuadra');V16.ph=3}
const _sl16=startLevel8;startLevel8=function(){_sl16();l8Setup()};
const _bl16=buildL8;buildL8=function(){const f=L8.built;_bl16();if(!f){bunker8(X8-46,-80,1,'B-1');bunker8(X8+46,-80,-1,'B-2');glacis8();rubble8()}};
const _ec16=endCine;endCine=function(){_ec16();L8.skip=0;l8Begin()};
const _ss16=startSac;startSac=function(){_ss16();L8.skip=0};const _bm16=startBoom;startBoom=function(){_bm16();L8.skip=0};
const _r1016=resume10;resume10=function(){_r1016();L8.skip=0;V16.ph=10;nightSky('blood');banner('FASE IV · REORGANIZACIÓN','El fuerte resiste en pie a medias · el portal escupe legiones');
 const n=G.detail>0?4:3,b0=GAR.length;for(let i=0;i<n;i++){const s=mkGar(b0+i,i===1?'mg':'rifle');s.g.visible=true;s.g.position.set(X8+28+i*2.2,0,26+(i%2)*2)}garAssign2('portal');
 for(const nn of npcs)nn.g.visible=false;LT.sr=120;LT.sdir=-1;searchSet(true,X8-22,4.9,40);
 setTimeout(()=>{const s=GAR.filter(q=>q.alive);if(s.length)say(s[0].name+': «¡Refuerzos de la 3.ª compañía! ¡A las troneras!»',3)},2600);if(officer){officer.dec=0;officer.hp=130}};
/* el capitán Slando espera a que la guarnición salga del radio de la explosión (máx. 9 s) */
window.capWait=function(){if(!GAR.length)return 3;const MX=X8+38,MZ=-150;const inside=GAR.filter(s=>s.alive&&s.g.visible&&Math.hypot(s.g.position.x-MX,s.g.position.z-MZ)<50).length;if(inside&&L8.capT>3&&!V16.waitSaid){V16.waitSaid=1;say('Capitán Slando: «¡Aún quedan hombres dentro! Esperad… ¡salid de ahí, rápido!»',3.5)}return inside?9:3};
const _sb16=startBoom;startBoom=function(){_sb16();banner('DETONACIÓN','')};
function director(dt){if(L8.ph===V16.ph)return;const ph=L8.ph;V16.ph=ph;
 if(ph===4){banner('FASE II · COMBATE EN EL PATIO','La guarnición toma los emplazamientos capturados');garAssign2('court');for(let i=0;i<7;i++)setTimeout(()=>snd(880,.2,'square',.02),i*420)}
 else if(ph===5)banner('OBJETIVO · EL POLVORÍN','Coloca la carga en el ala este');
 else if(ph===6){banner('FASE III · DEFENSA DEL FUERTE','La retaguardia sostiene la puerta mientras te repliegas');garAssign2('rear');const s=GAR.find(q=>q.alive);if(s)say(s.name+': «¡Cubrimos la puerta, mi Oberleutnant! ¡Corra al detonador!»',3.5)}
 else if(ph===11)banner('FASE VI · LA 4.ª DIVISIÓN BLINDADA','Aguanta mientras los Hunyadi avanzan sobre el portal')}
/* =====================================================================
   JUGADOR: inercia, marcha analógica, sprint con fatiga, agacharse,
   balanceo moderado, aterrizaje con peso, retroceso al recibir impactos
   ===================================================================== */
window.pMove=function(sp,run,moving,dt){const sprint=run&&moving&&!P.cr&&!V16.exh&&P.gnd;if(sprint){V16.stam=Math.max(0,V16.stam-dt*15);if(V16.stam<=0){V16.exh=1;say('Sin aliento…',1.2)}}else V16.stam=Math.min(100,V16.stam+dt*(moving?10:18));if(V16.exh&&V16.stam>38)V16.exh=0;
 let s=sp;if(run&&!sprint&&sp>7)s=6.2*(V16.exh?.82:1);if(P.cr)s=Math.min(s,3.3);if(tmOn){const m=Math.hypot(tm.x,tm.y);if(m<.92)s*=clamp(.3+m*.8,.3,1)}if(P.hp<30)s*=.88;if(P.cur==='revolver'||P.cur==='sword')s*=1.03;return s};
pSpread=function(){const v=Math.hypot(P.mvx||0,P.mvz||0);let k=v>7?.05:v>3?.022:v>.6?.009:0;if(!P.gnd)k+=.035;if(P.cr)k*=.35;return k};
const _hp16=hitP;hitP=function(d){const h=P.hp;_hp16(d);if(P.hp<h){V16.kick=Math.min(1.2,V16.kick+d/22);V16.hurtT=.32;P.mvx=(P.mvx||0)*.55;P.mvz=(P.mvz||0)*.55}};
function flinch(x,z,r){for(const e of enemies){const d=Math.hypot(e.g.position.x-x,e.g.position.z-z);if(d<r&&e.type!=='boss'&&e.type!=='mecha'&&!e.mino){e.stun=Math.max(e.stun||0,.3*(1-d/r)+.1);if((e.type==='sol'||e.type==='trasgo')&&e.st!=='hide'&&!e.hold&&R()<.6){e.cv=findCover(e,true);e.st=e.cv?'cover':'hide';e.tm=1+R()}}}}
const _imp16=impact;impact=function(x,y,z,big){_imp16(x,y,z,big);flinch(x,z,big?14:10);flashLight(x,3,z,big?5:3,.35)};
const _boom16=boom;boom=function(pos){_boom16(pos);flinch(pos.x,pos.z,11);flashLight(pos.x,2,pos.z,4,.3)};
function tankFear(){if(level!==8||L8.ph!==11||!L8.tk)return;for(const e of enemies){if(e.fear8||!(e.type==='sol'||e.type==='trasgo'||e.type==='mago'))continue;for(const t of L8.tk){if(Math.hypot(t.g.position.x-e.g.position.x,t.g.position.z-e.g.position.z)<24){e.fear8=1;e.fled=true;e.cv=findCover(e,true);e.st=e.cv?'cover':'fire';if(R()<.15)feed('El enemigo huye de los blindados');break}}}}
/* órdenes del jugador al teniente: «¡Conmigo!» (tecla T / botón ORD) */
function orderLt(){const o=officer;if(!o||!o.g.visible||!playing)return;o.forced=8;o.st='regroup';o.dec=0;o.voice=3;say(o.name+': «¡A sus órdenes, Oberleutnant! ¡Escuadra, con el jefe!»',2.4);feed('ORDEN: reagruparse con Kovač');snd(520,.12,'square',.03)}
const _sw16=swap;swap=function(){const c=P.cur;_sw16();if(P.cur!==c){V16.swT=.32;snd(260,.08,'square',.025)}};
const _tg16=throwG;throwG=function(){const n=P.grenades;_tg16();if(P.grenades<n)V16.thT=.45};
function crouch(v){P.cr=v===undefined?!P.cr:v;if(P.cr&&P.roll>0)P.cr=false}
const _aP16=animP;animP=function(dt,moving,run){_aP16(dt,moving,run);const u=P.g.userData,bl=(a,b,w)=>a+(b-a)*w;
 V16.crK=(V16.crK||0)+((P.cr&&P.gnd?1:0)-(V16.crK||0))*Math.min(1,dt*10);const c=V16.crK;
 if(c>.01){const ph=time*8,mv=Math.hypot(P.mvx||0,P.mvz||0)>.6;u.l1.rotation.x=bl(u.l1.rotation.x,mv?-.9+Math.sin(ph)*.35:-1.2,c);u.l2.rotation.x=bl(u.l2.rotation.x,mv?-.9-Math.sin(ph)*.35:-.35,c);u.k1.rotation.x=bl(u.k1.rotation.x,1.5,c);u.k2.rotation.x=bl(u.k2.rotation.x,1.7,c);u.b.position.y=bl(u.b.position.y,.45,c);u.b.rotation.x=bl(u.b.rotation.x,.22,c)}
 if(V16.swT>0){V16.swT-=dt;const w=Math.sin(V16.swT/.32*PI_);u.aR.rotation.x=bl(u.aR.rotation.x,-.2,w);u.aL.rotation.x=bl(u.aL.rotation.x,-.2,w);u.eR.rotation.x=bl(u.eR.rotation.x,-1.2,w)}
 if(V16.thT>0){V16.thT-=dt;const q=1-V16.thT/.45;u.aR.rotation.x=q<.4?bl(-1,-3,q/.4):bl(-3,-.8,(q-.4)/.6);u.ch.rotation.y=q<.4?-.4*q/.4:-.4+(q-.4)*1.4}
 if(V16.hurtT>0){V16.hurtT-=dt;u.b.rotation.x=bl(u.b.rotation.x,-.3,V16.hurtT/.32);u.hd.rotation.x-=V16.hurtT*.6}
 if(V16.exh){u.ch.rotation.x=.08+Math.sin(time*7)*.04}};
function camFeel(dt){const v=Math.hypot(P.mvx||0,P.mvz||0);if(P.gnd&&v>.5)V16.bob+=dt*v*1.25;const ab=P.gnd?Math.min(1,v/9):0;
 if(V16.air&&P.gnd){V16.land=Math.min(.42,Math.max(0,-V16.vyp)/28);if(V16.land>.12)V16.kick+=.15}V16.air=!P.gnd;V16.vyp=P.vy;V16.land=Math.max(0,V16.land-dt*1.6);V16.kick=Math.max(0,V16.kick-dt*3.2);
 const s=G.shk,by=Math.sin(V16.bob*2)*.05*ab*s,bx=Math.cos(V16.bob)*.035*ab*s;const fx=Math.cos(yaw),fz=-Math.sin(yaw);cam.position.x+=fx*bx;cam.position.z+=fz*bx;cam.position.y+=by-V16.land*.6-(V16.crK||0)*(fpv?.62:.5)-V16.kick*.12;if(V16.kick>.02){cam.rotateZ((R()-.5)*V16.kick*.03);cam.rotateX(V16.kick*.02)}
 if(V16.exh&&R()<dt*1.2)snd(160,.5,'sine',.012)}
/* =====================================================================
   PAUSA (botón táctil, P o Esc) — detiene juego, audio y cinemáticas
   ===================================================================== */
function pauseGame(on){if(on===V16.paused)return;if(on&&!playing)return;V16.paused=on;const el=$('pause');if(on){playing=false;firing=false;keys.KeyW=keys.KeyA=keys.KeyS=keys.KeyD=false;el.style.display='flex';$('tc').style.display='none';try{if(document.pointerLockElement)document.exitPointerLock()}catch(e){}try{ac&&ac.suspend()}catch(e){}}
 else{playing=true;el.style.display='none';if(!(level===8&&L8.cine))$('tc').style.display='block';try{ac&&ac.resume()}catch(e){};clock.getDelta()}}
/* =====================================================================
   INTERFAZ v16: estilos, botones nuevos, guarnición, aguante, fases
   ===================================================================== */
document.head.insertAdjacentHTML('beforeend','<style>#gar{position:absolute;left:16px;top:104px;font:12px Georgia,serif;color:#cfe0c0;letter-spacing:1px;display:none}#gar b{color:#ffd27a}#gar span{color:#9bbf5a;letter-spacing:0;margin-left:4px}#gar i{color:#5a2a22;font-style:normal}#stw{position:absolute;left:16px;bottom:34px;width:180px;height:4px;background:#0006}#st{display:block;height:100%;width:100%;background:#d8c070;transition:background .3s}#phase{position:fixed;left:50%;top:18%;transform:translateX(-50%);text-align:center;font:bold 26px Georgia,serif;letter-spacing:4px;color:#e8c070;text-shadow:0 2px 12px #000,0 0 30px #a0301888;opacity:0;pointer-events:none;z-index:7;white-space:nowrap}#phase small{display:block;font:italic 14px Georgia,serif;letter-spacing:1px;color:#e8dcc0;margin-top:6px}#pause{position:fixed;inset:0;background:#0b0804d9;display:none;flex-direction:column;align-items:center;justify-content:center;z-index:30;text-align:center}#pause h2{color:#e0b050;letter-spacing:6px;margin:0 0 10px}#pause p{font-size:13px;opacity:.75;max-width:520px;margin:4px 16px}#pause button{min-width:220px}#bp{right:14px;top:12px;width:40px;height:40px;border-radius:8px;font-size:15px}#bk{right:190px;bottom:30px;width:52px;height:52px;color:#e8d8a0}#bo{left:16px;top:132px;width:46px;height:46px;font-size:12px;color:#ffd27a;border-radius:10px}@media (max-height:440px){.t{font-size:12px}#bf{right:22px;bottom:84px;width:68px;height:68px}#br{right:100px;bottom:70px;width:46px;height:46px}#bro{right:22px;bottom:160px;width:46px;height:46px}#bm{right:100px;bottom:16px;width:46px;height:46px}#bg{right:22px;bottom:214px;width:46px;height:46px}#bw{right:104px;bottom:124px;width:46px;height:46px}#bj{right:104px;bottom:178px;width:46px;height:46px}#bk{right:156px;bottom:16px;width:46px;height:46px}#bv{top:8px;right:64px;width:40px;height:40px}#bp{top:8px;right:14px}#bi{bottom:92px;width:56px;height:56px}#jz{width:130px;height:130px;left:14px;bottom:14px}#js{top:40px;left:40px}#phase{font-size:17px;top:24%}#gar{top:92px}#bo{top:112px;width:40px;height:40px}#feed{top:56px;font-size:11px}#ammo{font-size:14px;right:210px;bottom:14px}#gc{right:210px;bottom:34px}#style{top:48px;font-size:26px}#gar{top:84px}#bo{top:106px}#hpw{width:150px}#stw{width:150px}}@media (max-width:640px){#phase{font-size:18px;letter-spacing:2px}#gar{top:96px}}</style>');
document.getElementById('hud').insertAdjacentHTML('beforeend','<div id="gar"></div><div id="stw"><i id="st"></i></div>');
document.body.insertAdjacentHTML('beforeend','<div id="phase"></div><div id="pause"><h2>PAUSA</h2><p>Sombras sobre el Nilo · Edición Definitiva</p><button id="pcont">Continuar</button><button id="pmenu" style="background:#6a4a2a;color:#f3e6c4">Menú principal</button><p style="margin-top:16px">PC: WASD · Shift correr (aguante) · X/Ctrl agacharse · C rodar · T orden «¡Conmigo!» al teniente · P/Esc pausa · Intro salta cinemáticas</p></div>');
$('tc').insertAdjacentHTML('beforeend','<div id="bp" class="t">II</div><div id="bk" class="t">AGA</div><div id="bo" class="t">ORD</div>');$('bo').addEventListener('touchstart',e=>{orderLt();e.preventDefault()},{passive:false});
$('pcont').onclick=()=>pauseGame(false);$('pmenu').onclick=()=>location.reload();
$('bp').addEventListener('touchstart',e=>{pauseGame(true);e.preventDefault()},{passive:false});$('bp').addEventListener('click',()=>pauseGame(true));
$('bk').addEventListener('touchstart',e=>{crouch();e.preventDefault()},{passive:false});
addEventListener('keydown',e=>{if(e.code==='KeyP'||(e.code==='Escape'&&!document.pointerLockElement&&!intro)){if(V16.paused)pauseGame(false);else if(playing)pauseGame(true);return}if(!playing)return;if(e.code==='KeyX'||e.code==='ControlLeft'){crouch();e.preventDefault()}if(e.code==='KeyT')orderLt();if((e.code==='Enter'||e.code==='Space')&&level===8&&L8.cine){L8.skip=1;e.preventDefault()}});
document.addEventListener('pointerlockchange',()=>{if(document.pointerLockElement)V16.hadLock=true;else if(V16.hadLock&&playing&&!V16.paused&&!(level===8&&L8.cine))pauseGame(true)});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&playing)pauseGame(true)});
/* textos de menú: nueva edición */
(function(){const o=[...$('lvsel').options].find(q=>q.value==='8');if(o)o.text='VIII · Qal\'at al-Nasr — EDICIÓN DEFINITIVA (noche de doble luna)';document.querySelector('#menu p b').textContent='1909 — Capítulos I–VIII · v16 EDICIÓN DEFINITIVA';
 $('hs').insertAdjacentHTML('beforebegin','<p class="c" style="color:#e8c070">NUEVO v16 · Cap. VIII nocturno bajo dos lunas · guarnición que combate y cae · teniente Hollenstein autónomo · búnkeres habitables · nuevos camiones y tanque Hunyadi M.16 · destrucción parcial del fuerte · cinemática del avance blindado · X/AGA agacharse · T/ORD ordenar al teniente · P/II pausa</p>')})();
/* =====================================================================
   ENVOLTORIO PRINCIPAL DE ACTUALIZACIÓN
   ===================================================================== */
const _up16=update;update=function(dt){V16.dt=dt;navGrid();_up16(dt);if(G.detail<2)mergeTick();
 if(level===8){nightUpd(dt);lightsUpd(dt);fireUpd(dt);smokeUpd(dt);tracerUpd(dt);
  if(FX8.ring&&V16.boomed&&FX8.ringT!==undefined&&FX8.ringT<1.4){FX8.ringT+=dt;FX8.ring.scale.setScalar(2+FX8.ringT*80);FX8.ring.material.opacity=Math.max(0,.9*(1-FX8.ringT/1.4))}
  if(V16.boomed){V16.colT=(V16.colT||0)-dt;if(V16.colT<=0){V16.colT=.22;const MX=X8+38,MZ=-150;smoke(MX+(R()-.5)*40,2+R()*4,MZ+(R()-.5)*40,10+R()*8,10,R()<.5?0x1e1c1e:0x3a3436,2.2,.55)}}
  if(L8.cine){for(const s of GAR)if(s.alive&&s.g.visible&&(s.down>0||s.up>0)){if(s.down>0){s.down-=dt;if(s.down<=0)s.up=.7}else s.up-=dt;garPose(s,dt)}doorsUpd(dt);if(L8.ph===9||L8.ph===13||L8.ph===12)updRag(dt);if(L8.ph===12&&L8.bail&&L8.hero&&L8.hero.g.userData.gunner)L8.hero.g.userData.gunner.visible=false;$('gar').style.display='none';if(L8.ph===12)engine(true,.04)}
  else if(playing){director(dt);garUpd(dt);tankFear();doorsUpd(dt);garHUD();if(L8.ph===6&&L8.cap&&!V16.retreat){V16.retreat=1;garAssign2('outer');say('Teniente Hollenstein: «¡Repliegue general! ¡Todos fuera del fuerte, va a volar!»',4)}
   ambUpd(dt,L8.ph<3?.3:L8.ph<6?.7:L8.ph<10?.8:1);if(L8.ph===11)engine(true,.05)}}
 else if(NIGHT.on){NIGHT.g.visible=false;NIGHT.on=false}
 if(playing&&!(level===8&&L8.cine)){camFeel(dt);offLabel();$('stw').style.display=V16.stam<99?'block':'none';$('st').style.width=V16.stam+'%';$('st').style.background=V16.exh?'#c0503a':'#d8c070'}else if(officer&&officer.lab)officer.lab.style.display='none'};
const _end16=end;end=function(w){_end16(w);if(!playing){ambStop();if(officer&&officer.lab)officer.lab.style.display='none'}};
