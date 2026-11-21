/* =====================================================================
   v32 · BIBLIOTECA DE PERSONAJES — Volskaya y Veyrn (Aethrion, 1922)
   - volsk32(t,kind,o)  re-viste un soldado existente (mkSoldier / npc11 / sp13)
       kinds: rifle mg officer medic sapper mortar observer cav winter r11
   - veyrn32(t,kind,o)  kinds: rifle assault gren mg officer eng crew scout naval
   - helmVolsk32(hd) / helmVeyrn32(hd)  cascos sueltos (malla marcada u27)
   - VOLSK32 / VEYRN32  paletas,  LIB32  índice
   El cuerpo se reconstruye con mkSoldier (misma jerarquía de articulaciones,
   compatible con animación, IA y ragdoll); las armas y objetos referenciados
   por el objetivo se trasladan. Todo el equipo se construye en geometrías
   cacheadas por combinación y se fusiona con la malla de cada articulación
   (sin llamadas de dibujo extra).
   o (opcional): {coat:bool, hat:'helm'|'side'|'peak'|'papakha'|'soft'|'crew',
                  chev:bool, scarf:bool, sleeves:bool, face:0..4, rank:n}
   ===================================================================== */
const VOLSK32={tunic:0x68704e,tunicK:0x8c8660,breech:0x3a332c,coat:0x6e6e68,coatC:0x5c4e3c,helm:0x56603f,blue:0x1c2648,white:0xe6e2d6,green:0x2c6a3a,green11:0x2e5a30,red:0xa01e1e,black:0x141414,
 lea:0x5a3820,leaD:0x3a2414,canvas:0x8a7e58,canvasD:0x6a6040,boot:0x15110d,fur:0xd8c8a2,sheep:0x9a7e56,hood:0x8e8672,papakha:0x1a1612,brass:0xb0903a,steel:0x5a5e5e,roll:0x5e5a42,
 cockade:[0xe6e2d6,0x2c6a3a,0x1c2648]};
const VEYRN32={tunic:0x4c5258,tunicB:0x272d37,helm:0x2e3236,helmN:0x3c434c,web:0x5b5a3c,puttee:0x464640,navy:0x1b2236,collar:0x2e4c7e,white:0xdedcd2,coat:0x24282e,band:0x0c0c0c,
 lea:0x1c1814,ochre:0xb88a2a,armor:0x5c6268,canister:0x4a5048,canvas:0x6a6a4e,badge:0x8a8670,pants:0x363a40};
const GCL32={};
const gkL32=(k,f)=>k in GCL32?GCL32[k]:(GCL32[k]=f());
/* las geometrías cacheadas nunca se liberan con los cadáveres */
{const _s=sharedSets;sharedSets=function(){const S=_s();for(const k in GCL32)if(GCL32[k])S.g.add(GCL32[k]);return S}}
/* torno (casco): perfil cerrado; se invierte para normales exteriores; mod opcional para recortar el ala */
function latheL32(key,pts,seg,mod){return gkL32(key,()=>{const g=new T.LatheGeometry(pts.slice().reverse().map(p=>new T.Vector2(p[0],p[1])),seg);if(mod){const p=g.attributes.position;for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i),z=p.getZ(i);p.setY(i,mod(x,y,z))}}g.computeVertexNormals();return g})}
/* concatena geometrías de PB (position/normal/uv/color/index) */
function catL32(L){L=L.filter(Boolean);if(L.length===1)return L[0];let nv=0,ni=0;for(const g of L){nv+=g.attributes.position.count;ni+=g.index.count}
 const pos=new Float32Array(nv*3),nor=new Float32Array(nv*3),uv=new Float32Array(nv*2),col=new Float32Array(nv*3),idx=nv>65000?new Uint32Array(ni):new Uint16Array(ni);let vo=0,io=0;
 for(const g of L){const n=g.attributes.position.count;pos.set(g.attributes.position.array,vo*3);nor.set(g.attributes.normal.array,vo*3);if(g.attributes.uv)uv.set(g.attributes.uv.array,vo*2);if(g.attributes.color)col.set(g.attributes.color.array,vo*3);else col.fill(1,vo*3,(vo+n)*3);
  const I=g.index.array;for(let i=0;i<I.length;i++)idx[io++]=I[i]+vo;vo+=n}
 const bg=new T.BufferGeometry();bg.setAttribute('position',new T.BufferAttribute(pos,3));bg.setAttribute('normal',new T.BufferAttribute(nor,3));bg.setAttribute('uv',new T.BufferAttribute(uv,2));bg.setAttribute('color',new T.BufferAttribute(col,3));bg.setIndex(new T.BufferAttribute(idx,1));bg.computeBoundingSphere();return bg}
const pqL32=(key,fn)=>gkL32(key,()=>{const q=PB();fn(q);return q.L.length?pbGeo(q):null});
/* ================= CASCOS Y TOCADOS (espacio de la cabeza: cara z+, coronilla y≈.36) ================= */
function hgHelmV32(q,D,c){const C=c||VOLSK32.helm,seg=D>1?18:D?14:10;
 const L=latheL32('lhV'+seg,[[0,.31],[.13,.29],[.21,.235],[.255,.15],[.275,.07],[.3,.03],[.36,-.018],[.366,-.032],[.33,-.03],[.272,.02],[.258,.1],[0,.13]],seg,
  (x,y,z)=>{if(y>.06)return y;const r=Math.hypot(x,z)||1,f=1-Math.max(0,z/r);return y-.06*f*(.6+.4*Math.min(1,(.06-y)/.1))});
 pa(q,L,C,0,.205,0,0,0,0,1.04,1,1.1,.03);
 pa(q,gTor(.17,.016,4,D?10:6,3.1416),shade(C,1.08),0,.345,0,0,1.5708,0,1,1,1.12);/* cresta baja */
 if(D){const K=VOLSK32.cockade;const cs=D>1?10:6;pCyl(q,.036,.036,.01,K[0],0,.39,.262,1.5708-.62,0,0,cs);pCyl(q,.026,.026,.012,K[1],0,.39,.265,1.5708-.62,0,0,cs);if(D>1)pCyl(q,.014,.014,.014,K[2],0,.39,.267,1.5708-.62,0,0,8)}
 for(const s of[-1,1])pBox(q,.018,.2,.02,VOLSK32.leaD,s*.2,.1,.05,0,0,s*.14);pBox(q,.12,.02,.025,VOLSK32.leaD,0,.0,.15);
 if(D>1)for(const s of[-1,1])pCyl(q,.014,.014,.014,shade(C,.7),s*.26,.33,0,0,0,1.5708,6)}
function hgHelmE32(q,D,c,brow){/* Veyrn: cúpula de acero oscuro, viseras delantera y trasera, cresta pronunciada, placa frontal */
 const C=c||VEYRN32.helm,seg=D>1?18:D?14:10;
 const L=latheL32('lhE'+seg,[[0,.32],[.14,.3],[.22,.24],[.258,.15],[.272,.05],[.286,-.016],[.27,-.022],[.255,.06],[0,.12]],seg);
 pa(q,L,C,0,.2,0,0,0,0,1.02,1,1.08,.03);
 pBox(q,.36,.018,.14,shade(C,.92),0,.2,.3,.3,0,0);pBox(q,.4,.018,.15,shade(C,.92),0,.185,-.3,-.36,0,0);
 pa(q,gTor(.2,.03,4,D?12:7,3.1416),shade(C,1.15),0,.375,0,0,1.5708,0,1,1.05,.7);pBox(q,.03,.02,.4,shade(C,1.15),0,.5,0);
 pBox(q,.11,.09,.014,VEYRN32.badge,0,.37,.278,-.45,0,0);if(D){pBox(q,.014,.06,.01,0x1a1a1a,-.018,.37,.287,-.45,0,.4);pBox(q,.014,.06,.01,0x1a1a1a,.018,.37,.287,-.45,0,-.4)}
 for(const s of[-1,1])pBox(q,.018,.2,.02,VEYRN32.lea,s*.2,.1,.05,0,0,s*.14);pBox(q,.12,.02,.025,VEYRN32.lea,0,.0,.15);
 if(brow){pBox(q,.4,.12,.03,VEYRN32.armor,0,.33,.29,-.3,0,0);for(const s of[-1,1])pCyl(q,.016,.016,.02,0x1a1a1a,s*.16,.33,.305,1.27,0,0,6)}}
function hgSide32(q,c,trim,D){/* pilotka: gorro de campaña en cuña con escarapela */
 pBox(q,.39,.08,.4,c,0,.37,-.01);pBox(q,.2,.12,.4,c,-.07,.44,-.01,0,0,.5);pBox(q,.2,.12,.4,c,.07,.44,-.01,0,0,-.5);pBox(q,.04,.05,.4,shade(c,.9),0,.5,-.01);
 if(trim){const K=VOLSK32.cockade;pBox(q,.05,.04,.012,K[0],.1,.43,.205);if(D)pBox(q,.025,.022,.014,K[2],.1,.43,.208)}}
function hgPeak32(q,crown,band,badge,D){/* gorra de plato */
 pCyl(q,.255,.255,.085,band,0,.38,0,0,0,0,D?14:10);pCyl(q,.3,.26,.075,crown,0,.46,-.01,-.06,0,0,D?14:10);pBox(q,.32,.02,.15,0x0c0a08,0,.345,.25,.32,0,0,.02);
 if(badge==='v'){const K=VOLSK32.cockade;pCyl(q,.034,.034,.012,K[0],0,.39,.255,1.5708,0,0,10);pCyl(q,.024,.024,.014,K[1],0,.39,.257,1.5708,0,0,10);pCyl(q,.012,.012,.016,K[2],0,.39,.259,1.5708,0,0,8)}
 else{pBox(q,.06,.05,.012,VEYRN32.badge,0,.4,.258);pBox(q,.08,.025,.012,VEYRN32.ochre,0,.46,.29,-.1,0,0)}
 if(D>1)pBox(q,.3,.012,.02,0x2a2418,0,.36,.262)}
function hgPapakha32(q,D){/* papaja de piel negra con tapa azul y galón blanco */
 const P=VOLSK32;pCyl(q,.275,.26,.3,P.papakha,0,.45,-.01,-.05,0,0,D?12:8);pCyl(q,.24,.24,.02,P.blue,0,.6,-.02,-.05,0,0,D?12:8);pBox(q,.4,.012,.03,P.white,0,.612,-.02,-.05,0,0);pBox(q,.03,.012,.4,P.white,0,.612,-.02,-.05,0,0);
 if(D>1)for(let i=0;i<8;i++){const a=i/8*6.283;pBox(q,.07,.06,.05,shade(P.papakha,1.4),Math.sin(a)*.27,.33+(i%3)*.1,Math.cos(a)*.27-.01,0,a,0)}}
function hgHood32(q,D){/* capucha guateada bajo el casco, con borde de piel y cordones */
 const P=VOLSK32,H=P.hood;pBox(q,.4,.34,.05,H,0,.2,-.2);for(const s of[-1,1]){pBox(q,.05,.32,.38,H,s*.205,.19,0);pBox(q,.04,.26,.05,P.fur,s*.18,.17,.19);if(D>1)pBox(q,.012,.1,.012,P.fur,s*.06,-.04,.18,0,0,s*.4)}
 pBox(q,.4,.06,.38,H,0,.03,-.01);pBox(q,.3,.04,.05,P.fur,0,.02,.19);if(D>1)for(let i=0;i<3;i++)pBox(q,.41,.012,.39,shade(H,.75),0,.12+i*.09,-.01)}
function hgCrew32(q,D){/* casco acolchado de cuero de tripulante con gafas */
 const P=VEYRN32;pa(q,gSph(.245,D?12:8,5,0,1.25),P.lea,0,.2,0,0,0,0,1.06,1.05,1.12,.04);pBox(q,.4,.3,.06,P.lea,0,.2,-.19);for(let i=-1;i<=1;i++)pBox(q,.05,.05,.5,0x262220,i*.1,.42-Math.abs(i)*.03,-.01);pBox(q,.5,.05,.05,0x262220,0,.38,0);
 for(const s of[-1,1]){pBox(q,.05,.26,.2,P.lea,s*.2,.17,-.02);pCyl(q,.05,.05,.04,0x6a6a5a,s*.08,.36,.24,1.25,0,0,D?10:6);pCyl(q,.038,.038,.045,0x1e3a44,s*.08,.36,.245,1.25,0,0,D?10:6)}
 pBox(q,.5,.025,.04,0x2a2622,0,.34,.16)}
function hgSoft32(q,c,D){/* gorra de campaña de Veyrn con visera corta */
 pCyl(q,.255,.255,.07,shade(c,.85),0,.37,0,0,0,0,D?12:8);pCyl(q,.27,.25,.09,c,0,.44,-.01,-.05,0,0,D?12:8);pBox(q,.26,.02,.1,0x14141a,0,.34,.24,.35,0,0);pBox(q,.05,.04,.012,VEYRN32.ochre,0,.39,.258)}
/* ================= TORSO (ch: pecho .0–.72, frente z=.19, espalda z=-.19, brazos x=±.45) ================= */
function boardsL32(q,base,pipe,plate,D,num){for(const s of[-1,1]){if(D)pBox(q,.15,.014,.32,pipe,s*.245,.724,0);pBox(q,.12,.02,.3,base,s*.245,.73,0);if(D>1)pBox(q,.03,.012,.03,0x8a8a80,s*.245,.742,.12);
  if(D&&plate){if(num===2&&D>1){for(const [w,d,x,z] of[[.05,.012,0,-.05],[.012,.03,.02,-.035],[.05,.012,0,-.02],[.012,.03,-.02,-.005],[.05,.012,0,.01]])pBox(q,w,.008,d,plate,s*.245+x,.742,z)}
   else if(num===11){pBox(q,.014,.008,.07,plate,s*.245-.02,.742,-.03);pBox(q,.014,.008,.07,plate,s*.245+.02,.742,-.03)}else pBox(q,.05,.008,.07,plate,s*.245,.742,-.03)}}}
function coatTopL32(q,c,D,trimC){/* capote cruzado: cuello vuelto, solapas, doble fila de botones */
 pBox(q,.46,.1,.4,shade(c,.92),0,.73,-.01);if(!trimC)for(const s of[-1,1])pBox(q,.12,.22,.03,shade(c,.9),s*.1,.6,.205,0,0,s*.4);
 for(let i=0;i<(D>1?4:2);i++)for(const s of[-1,1])pBox(q,.035,.035,.02,0x3a3a30,s*.1,.5-i*(D>1?.13:.22),.21);
 if(trimC){pBox(q,.5,.12,.42,trimC,0,.73,-.01);if(D)for(const s of[-1,1])pBox(q,.06,.6,.03,trimC,s*.07,.36,.205)}
 if(D>1){pBox(q,.3,.06,.03,shade(c,.85),0,.12,-.205);for(const s of[-1,1])pBox(q,.03,.03,.02,0x3a3a30,s*.12,.12,-.22)}}
function bedrollL32(q,c,D){/* rollo de manta en herradura: hombro izquierdo a cadera derecha, rodeando el torso */
 pa(q,gTor(.47,.072,D?5:4,D?14:10),c,0,.43,0,.8,1.5708,0,.55,1,1,.05);
 if(D)for(const t of[-.25,.25])for(const z of[1,-1])pBox(q,.17,.03,.05,VOLSK32.leaD,t*Math.sin(.8),.43+t*Math.cos(.8),z*.27,0,0,-.8)}
function bandolierL32(q,lea,n,rev){const k=rev?-1:1;pBox(q,.07,.92,.03,lea,0,.37,.215,0,0,k*.72);pBox(q,.07,.92,.03,lea,0,.37,-.215,0,0,-k*.72);for(let i=0;i<n;i++){const t=(i/(n-1)-.5)*.7;pBox(q,.09,.07,.05,shade(lea,.85),-k*t*.66*Math.sin(.72)/.66*.85,.37+t*Math.cos(.72),.235,0,0,k*.72)}}
function packL32(q,c,D,o){o=o||{};pBox(q,.44,.42,.18,c,0,.38,-.29);pBox(q,.44,.07,.2,shade(c,.8),0,.57,-.29);if(D>1)for(const s of[-1,1])pBox(q,.04,.4,.02,VOLSK32.leaD,s*.13,.38,-.385);
 if(o.roll)pCyl(q,.08,.08,.56,o.roll,0,.66,-.27,0,0,1.5708,D>1?8:6);if(o.tin){pBox(q,.22,.16,.08,0x6a6e58,0,.36,-.41);pBox(q,.04,.18,.09,VOLSK32.leaD,0,.36,-.41)}
 if(o.shovel){pBox(q,.04,.5,.04,0x6a4a2a,.2,.3,-.4,0,0,.25);pBox(q,.16,.2,.02,0x4a4e4a,.27,.05,-.41,0,0,.25)}}
function chevL32(q,D){/* galón en V negro y rojo (manga izquierda, cara exterior) */const P=VOLSK32;for(const s of[-1,1]){pBox(q,.012,.13,.032,P.black,.104,-.12,s*.035,s*.55,0,0);if(D)pBox(q,.012,.11,.016,P.red,.108,-.1,s*.03,s*.55,0,0)}}
/* ================= PIEZAS POR ARTICULACIÓN ================= */
function partVL32(kind,bone,L,D,q){const P=VOLSK32,C=L.coatC;
 if(bone==='hd'){if(L.hood)hgHood32(q,D);
  if(L.hat==='helm')hgHelmV32(q,D);else if(L.hat==='side')hgSide32(q,L.tun,1,D);else if(L.hat==='peak')hgPeak32(q,L.tun,P.blue,'v',D);else if(L.hat==='papakha')hgPapakha32(q,D)}
 else if(bone==='ch'){const bd=kind==='r11'?P.green11:P.blue,num=kind==='r11'?11:2;if(kind!=='officer')boardsL32(q,bd,P.white,P.white,D,num);else for(const s of[-1,1]){pBox(q,.14,.014,.31,P.blue,s*.245,.735,0);if(D)for(const z of[-.06,.04])pBox(q,.025,.012,.025,0xd8d4c8,s*.245,.748,z)}
  if(L.coat){if(kind==='winter')coatTopL32(q,C,D,P.fur);else coatTopL32(q,C,D)}
  if(L.scarf)pBox(q,.36,.1,.34,0x6a5a48,0,.74,0),pBox(q,.08,.22,.03,0x6a5a48,.06,.58,.22,0,0,.15);
  if(kind==='rifle'||kind==='r11'){if(L.roll)bedrollL32(q,P.roll,D);if(kind==='r11'&&D)bandolierL32(q,P.lea,D>1?6:4,true)}
  if(kind==='mg'){pBox(q,.4,.04,.4,P.leaD,0,.5,-.32,0,0,0);for(let i=0;i<2;i++){pBox(q,.36,.24,.16,0x4a5038,0,.28+i*.26,-.3);pBox(q,.12,.04,.06,0x2a2a22,0,.42+i*.26,-.3)}pCyl(q,.045,.045,.7,0x2a2a2a,.18,.42,-.42,0,0,.35,6);pBox(q,.18,.04,.3,P.leaD,-.25,.73,0)}
  if(kind==='medic'){pBox(q,.06,.9,.025,P.canvasD,0,.37,.215,0,0,-.72);pBox(q,.06,.9,.025,P.canvasD,0,.37,-.215,0,0,.72)}
  if(kind==='sapper'){pBox(q,.44,.11,.09,0x8a7a4a,0,.22,.24);if(D)for(let i=0;i<2;i++)pBox(q,.03,.115,.095,0x3a3020,-.075+i*.15,.22,.24);pBox(q,.05,.62,.025,0x3a3020,0,.4,.215,0,0,.65);packL32(q,P.canvasD,D,{});pBox(q,.05,.75,.05,0x6a4a2a,-.15,.5,-.42,0,0,-.2);pBox(q,.22,.26,.03,0x4a4e4a,-.07,.9,-.43,0,0,-.2)}
  if(kind==='mortar'){pBox(q,.4,.5,.05,0x5a4a32,0,.38,-.24);for(let i=0;i<3;i++){const x=-.13+i*.13;pCyl(q,.055,.055,.26,0x4a5040,x,.44,-.33,0,0,0,D?8:6);pa(q,gCone(.055,.1,D?8:6),0x4a5040,x,.62,-.33);pBox(q,.1,.1,.01,0x3a3a34,x,.27,-.33);pBox(q,.01,.1,.1,0x3a3a34,x,.27,-.33)}pBox(q,.46,.04,.14,P.leaD,0,.3,-.33)}
  if(kind==='observer'){pBox(q,.34,.44,.05,0x5a4a32,0,.38,-.24);pCyl(q,.17,.17,.24,0x3a3a34,0,.44,-.38,0,0,1.5708,D?12:8);pCyl(q,.14,.14,.25,0x8a6a3a,0,.44,-.38,0,0,1.5708,D?12:8);pCyl(q,.04,.04,.34,0x2a2a2a,0,.44,-.38,0,0,1.5708,6);pBox(q,.04,.2,.04,0x2a2a2a,.19,.36,-.38);
   pBox(q,.05,.38,.02,P.leaD,-.04,.48,.205,0,0,.5);pCyl(q,.045,.045,.12,0x1a1a1a,-.06,.3,.24,1.5708,0,0,8);pCyl(q,.045,.045,.12,0x1a1a1a,.04,.3,.24,1.5708,0,0,8)}
  if(kind==='officer'){pBox(q,.05,.38,.02,P.leaD,.04,.48,.205,0,0,-.5)}
  if(kind==='cav'){bandolierL32(q,P.lea,7,false);pBox(q,.05,.9,.025,P.leaD,0,.37,.218,0,0,.75)}
  if(kind==='winter'){packL32(q,P.canvas,D,{roll:P.roll,tin:1,shovel:1})}
  if(kind==='rifle'&&!L.roll&&D)packL32(q,P.canvasD,D,{tin:L.tin})}
 else if(bone==='b'){if(L.coat)pBox(q,.66,.24,.44,C,0,.03,0);else pBox(q,.58,.17,.4,L.tun,0,.05,0);
  if(kind==='winter'&&L.coat&&D>1)pBox(q,.68,.04,.46,P.fur,0,.15,0);
  if(kind==='rifle'||kind==='r11'||kind==='winter'){pBox(q,.07,.3,.05,0x3a2a1a,.3,-.06,-.1,.15);if(L.tin)pa(q,gCyl(.09,.09,.06,D?10:6),0x6a6e58,-.22,-.02,-.29,1.5708,0,0,1,1,.6);if(L.shovel&&kind!=='winter'){pBox(q,.04,.32,.04,0x6a4a2a,.22,-.08,-.24,.1);pBox(q,.15,.18,.03,0x4a4e4a,.22,-.3,-.26,.1)}}
  if(kind==='officer'||kind==='mg'){pBox(q,.1,.18,.1,P.leaD,.3,.04,.1);pBox(q,.11,.04,.11,0x1a120a,.3,.15,.1)}
  if(kind==='medic'){pBox(q,.28,.24,.12,P.canvas,-.3,.0,.02);pBox(q,.3,.05,.13,shade(P.canvas,.8),-.3,.12,.02);pBox(q,.08,.025,.012,P.green,-.3,.0,.083);pBox(q,.025,.08,.012,P.green,-.3,.0,.083);pBox(q,.012,.08,.025,P.green,-.445,.0,.02);pBox(q,.012,.025,.08,P.green,-.445,.0,.02)}
  if(kind==='sapper'){pa(q,gTor(.08,.02,4,8),0xa89a6a,.3,-.02,.1,0,1.5708,0);pBox(q,.03,.24,.04,0x2a2a2a,-.3,-.04,.08,0,0,.15)}
  if(kind==='observer'){pBox(q,.2,.2,.12,P.leaD,.32,.0,.04);pBox(q,.21,.04,.13,0x1a120a,.32,.1,.04)}
  if(kind==='cav'){pBox(q,.04,.95,.035,0x2a2420,.32,-.35,-.06,-.35,0,.05);pBox(q,.06,.1,.06,P.brass,.32,.13,.1,-.35,0,.05);pBox(q,.1,.03,.07,P.brass,.32,.09,.08,-.35,0,.05)}}
 else if(bone==='l1'||bone==='l2'){const s=bone==='l1'?-1:1;
  if(L.coat){const len=kind==='cav'?.68:kind==='winter'?.6:.62,cy=.05-len/2;pBox(q,.34,len,.03,C,-s*.01,cy,.172+(s>0?.004:0),-.07,0,0);pBox(q,.03,len,.36,shade(C,.95),s*.163,cy,0,0,0,s*.07);pBox(q,.33,len-.08,.03,shade(C,.92),-s*.01,cy+.04,-.18+(s>0?.004:0),.06,0,0);
   if(kind==='winter'&&D){const by=.05-len;pBox(q,.36,.06,.06,P.fur,-s*.01,by,.19-len*.07+.03);pBox(q,.06,.06,.38,P.fur,s*.17+s*len*.07,by,0);if(D>1)pBox(q,.35,.06,.06,P.fur,-s*.01,by+.08,-.18-(len-.08)*.06)}}
  else if(L.breeches){pBox(q,.32,.2,.33,L.pants,s*.01,-.17,0)}}
 else if(bone==='k1'||bone==='k2'){if(kind==='winter'){pBox(q,.29,.3,.31,P.canvas,0,-.2,0);for(let i=0;i<(D>1?3:1);i++)pBox(q,.3,.025,.32,P.leaD,0,-.1-i*.09,0)}
  else{pBox(q,.27,.34,.3,P.boot,0,-.2,0);pBox(q,.285,.03,.31,0x0a0806,0,-.04,0);if(kind==='cav'&&D)pBox(q,.02,.02,.1,P.steel,0,-.4,-.2)}}
 else if(bone==='aL'){if(L.chev)chevL32(q,D);if(kind==='medic'){pBox(q,.215,.09,.235,P.white,0,-.1,0);pBox(q,.012,.06,.02,P.green,.11,-.1,0);pBox(q,.012,.02,.06,P.green,.11,-.1,0)}}
 else if(bone==='eL'||bone==='eR'){if(kind==='winter'&&L.coat)pBox(q,.21,.08,.23,P.fur,0,-.28,0);else if(L.sleeves){pBox(q,.19,.26,.21,L.skin,0,-.2,0);pBox(q,.21,.08,.23,L.tun,0,-.05,0)}}}
function partEL32(kind,bone,L,D,q){const P=VEYRN32,C=L.coatC;
 if(bone==='hd'){if(L.hat==='helm')hgHelmE32(q,D,kind==='naval'?P.helmN:P.helm,kind==='assault');else if(L.hat==='peak')hgPeak32(q,kind==='officer'?0x3a3e46:L.tun,P.band,'e',D);else if(L.hat==='crew')hgCrew32(q,D);else if(L.hat==='soft')hgSoft32(q,L.tun,D)}
 else if(bone==='ch'){if(kind!=='crew'&&kind!=='naval'){for(const s of[-1,1]){pBox(q,.15,.014,.32,P.ochre,s*.245,.724,0);pBox(q,.12,.02,.3,shade(L.tun,.85),s*.245,.73,0)}}
  if(L.coat)coatTopL32(q,C,D);
  if(L.scarf)pBox(q,.36,.1,.34,0x3a3a3a,0,.74,0),pBox(q,.08,.24,.03,0x3a3a3a,-.07,.58,.22,0,0,-.12);
  if(kind==='naval'){pBox(q,.54,.3,.025,P.collar,0,.57,-.205);pBox(q,.5,.02,.03,P.white,0,.44,-.21);pBox(q,.02,.26,.03,P.white,-.24,.57,-.21);pBox(q,.02,.26,.03,P.white,.24,.57,-.21);
   for(const s of[-1,1]){pBox(q,.08,.36,.025,P.collar,s*.12,.56,.205,0,0,s*.55);pBox(q,.016,.34,.03,P.white,s*.15,.56,.21,0,0,s*.55)}pBox(q,.08,.07,.04,0x0e0e12,0,.4,.215);pBox(q,.05,.14,.03,0x0e0e12,0,.3,.215);
   pBox(q,.06,.9,.025,P.web,0,.37,.225,0,0,.72);pBox(q,.06,.9,.025,P.web,0,.37,.23,0,0,-.72)}
  if(kind==='rifle'||kind==='naval'||kind==='eng'){pBox(q,.4,.36,.16,P.canvas,0,.38,-.28);pCyl(q,.07,.07,.5,0x4a4a40,0,.6,-.28,0,0,1.5708,D?8:6)}
  if(kind==='eng'){pBox(q,.04,.7,.04,0x5a4028,.14,.42,-.39,0,0,.3);pBox(q,.4,.05,.05,0x4a4e4a,.24,.76,-.39,0,0,.3)}
  if(kind==='assault'){pBox(q,.62,.2,.1,P.armor,0,.56,.235,.04,0,0);pBox(q,.58,.18,.1,P.armor,0,.38,.245);pBox(q,.54,.16,.1,P.armor,0,.21,.24,-.05,0,0);for(const s of[-1,1])pBox(q,.22,.06,.38,P.armor,s*.3,.73,0,0,0,s*.22);
   if(D>1)for(const y of[.56,.38,.21])for(const s of[-1,1])pBox(q,.025,.025,.02,0x1a1a1a,s*.22,y,.29)}
  if(kind==='assault'||kind==='gren'){for(const s of[-1,1]){pBox(q,.05,.62,.025,P.web,s*.14,.42,.27,0,0,s*.2);pBox(q,.2,.22,.1,P.canvas,s*.17,.08,.31);pBox(q,.21,.05,.11,shade(P.canvas,.8),s*.17,.18,.31);
    if(D)pBox(q,.03,.12,.03,0x6a4a2a,s*.17+.04,.25,.31);if(D>1)pBox(q,.03,.12,.03,0x6a4a2a,s*.17-.04,.25,.31)}}
  if(kind==='gren'){pBox(q,.4,.32,.14,P.canvas,0,.36,-.27);for(let i=0;i<(D>1?4:2);i++)pBox(q,.03,.18,.03,0x6a4a2a,-.12+i*.08,.58,-.27)}
  if(kind==='mg'){for(let i=0;i<2;i++)pBox(q,.36,.24,.16,0x3a4034,0,.28+i*.26,-.3);pCyl(q,.045,.045,.7,0x2a2a2a,-.18,.42,-.42,0,0,-.35,6);pBox(q,.18,.04,.3,P.lea,-.25,.73,0)}
  if(kind==='officer'||kind==='scout'){pCyl(q,.045,.045,.12,0x1a1a1a,-.06,.32,.25,1.5708,0,0,8);pCyl(q,.045,.045,.12,0x1a1a1a,.04,.32,.25,1.5708,0,0,8);pBox(q,.04,.36,.02,P.lea,-.03,.5,.208,0,0,.4)}
  if(kind==='scout'){pCyl(q,.09,.09,.6,0x4a4a3a,0,.64,-.25,0,0,1.5708,D?8:6)}
  if(kind==='crew'){pBox(q,.68,.72,.42,P.lea,0,.34,0,0,0,0,.05);pBox(q,.4,.12,.4,P.lea,0,.73,-.02);for(const s of[-1,1])pBox(q,.14,.28,.03,0x2a2622,s*.1,.5,.215,0,0,s*.35);for(let i=0;i<3;i++)pBox(q,.04,.04,.02,0x6a6a60,.12,.5-i*.15,.215)}}
 else if(bone==='b'){if(L.coat)pBox(q,.66,.24,.44,C,0,.03,0);else if(kind==='crew')pBox(q,.62,.2,.44,P.lea,0,.06,0);else pBox(q,.58,.17,.4,L.tun,0,.05,0);
  if(kind!=='crew'&&kind!=='officer'){pCyl(q,.07,.07,.25,P.canister,.24,.0,-.22,0,0,0,D?10:6);if(D)for(let i=0;i<3;i++)pCyl(q,.074,.074,.015,shade(P.canister,.7),.24,-.08+i*.08,-.22,0,0,0,D?10:6);pCyl(q,.074,.074,.03,0x2a2e2a,.24,.13,-.22,0,0,0,D?10:6)}
  if(kind==='gren')for(let i=0;i<3;i++){pCyl(q,.04,.04,.1,0x3a3e3a,-.12+i*.12,.26,.24,0,0,0,6);pBox(q,.03,.2,.03,0x6a4a2a,-.12+i*.12,.12,.24)}
  if(kind==='eng'){for(const s of[-1,1]){pBox(q,.18,.2,.1,0x6a5a3a,s*.3,.0,.06);pBox(q,.19,.04,.11,0x3a3020,s*.3,.1,.06)}pBox(q,.03,.26,.04,0x2a2a2a,-.32,-.05,-.12,0,0,.15)}
  if(kind==='crew'||kind==='mg'||kind==='officer'){pBox(q,.1,.18,.1,P.lea,.3,.04,.1);pBox(q,.11,.04,.11,0x0a0a0a,.3,.15,.1)}
  if(kind==='officer'){pBox(q,.2,.24,.05,P.lea,-.32,-.04,.06,0,0,.08)}}
 else if(bone==='l1'||bone==='l2'){const s=bone==='l1'?-1:1;if(L.coat){const len=.66,cy=.05-len/2;pBox(q,.34,len,.03,C,-s*.01,cy,.172+(s>0?.004:0),-.07,0,0);pBox(q,.03,len,.36,shade(C,.95),s*.163,cy,0,0,0,s*.07);pBox(q,.33,len-.08,.03,shade(C,.92),-s*.01,cy+.04,-.18+(s>0?.004:0),.06,0,0)}
  else if(kind==='crew'||kind==='officer')pBox(q,.32,.2,.33,L.pants,s*.01,-.17,0)}
 else if(bone==='k1'||bone==='k2'){if(kind==='crew'||kind==='officer'){pBox(q,.27,.34,.3,0x0e0c0a,0,-.2,0);pBox(q,.285,.03,.31,0x060504,0,-.04,0)}}
 else if(bone==='eL'||bone==='eR'){if(kind==='crew')pBox(q,.21,.14,.23,0x14110e,0,-.3,0);else if(L.sleeves){pBox(q,.19,.26,.21,L.skin,0,-.2,0);pBox(q,.21,.08,.23,L.tun,0,-.05,0)}}}
/* ================= LOOKS (variación por individuo) ================= */
const pickL32=(a)=>{let r=R(),t=0;for(const [v,p] of a){t+=p;if(r<t)return v}return a[a.length-1][0]};
const HATVL32={rifle:[['helm',.55],['side',.35],['peak',.1]],mg:[['helm',.8],['side',.2]],officer:[['peak',.85],['papakha',.15]],medic:[['side',.6],['helm',.4]],sapper:[['helm',1]],mortar:[['helm',.6],['side',.4]],observer:[['side',.5],['helm',.3],['peak',.2]],cav:[['papakha',1]],winter:[['helm',.8],['papakha',.2]],r11:[['side',.5],['helm',.5]]};
function lookVL32(kind,o){const P=VOLSK32,L={};L.tun=kind==='r11'?P.tunicK:P.tunic;L.pants=P.breech;
 const pc={rifle:.35,mg:.25,officer:.5,medic:.3,sapper:.2,mortar:.25,observer:.4,cav:1,winter:1,r11:.3}[kind];L.coat=o.coat!==undefined?!!o.coat:R()<pc;
 L.coatC=kind==='winter'?P.sheep:P.coat;
 L.hat=o.hat||pickL32(HATVL32[kind]);
 L.hood=kind==='winter'&&L.hat==='helm';L.chev=o.chev!==undefined?!!o.chev:(kind==='sapper'||kind==='mg'?R()<.6:kind==='rifle'?R()<.35:false);
 L.roll=(kind==='rifle'||kind==='r11')&&R()<.6;L.tin=R()<.5;L.shovel=R()<.5;L.scarf=o.scarf!==undefined?!!o.scarf:(kind!=='officer'&&kind!=='winter'&&R()<.18);
 L.sleeves=o.sleeves!==undefined?!!o.sleeves:(!L.coat&&kind!=='officer'&&kind!=='cav'&&R()<.22);L.breeches=!L.coat;return L}
function lookEL32(kind,o){const P=VEYRN32,L={};L.tun=kind==='naval'?P.navy:(kind==='assault'||kind==='scout'?P.tunicB:P.tunic);L.pants=kind==='naval'?P.navy:P.pants;
 L.coat=o.coat!==undefined?!!o.coat:(kind==='officer'||(kind==='rifle'&&R()<.2));L.coatC=P.coat;
 L.hat=o.hat||(kind==='officer'?'peak':kind==='crew'?'crew':kind==='scout'?'soft':'helm');
 L.scarf=o.scarf!==undefined?!!o.scarf:(kind==='scout'||(kind!=='officer'&&kind!=='naval'&&R()<.12));L.sleeves=o.sleeves!==undefined?!!o.sleeves:(!L.coat&&(kind==='eng'||kind==='rifle'||kind==='mg')&&R()<.2);return L}
/* ================= RECONSTRUCCIÓN ================= */
const JL32=['l1','l2','k1','k2','b','ch','hd','aR','aL','eR','eL','mR','mL'];
const BNL32=['hd','ch','b','l1','l2','k1','k2','aL','eL','eR'];
function rebuildL32(t,so){const og=t.g,ou=og.userData;const ng=mkSoldier(so),nu=ng.userData;
 const jm=new Map();for(const k of JL32)if(ou[k])jm.set(ou[k],k);
 const keep=new Set();for(const k in t){const v=t[k];if(v&&v.isObject3D&&v!==og&&!jm.has(v))keep.add(v)}
 for(const k of['mR','mL'])if(ou[k])for(const c of ou[k].children)if(!jm.has(c))keep.add(c);
 for(const c of keep){const p=c.parent;const jn=p&&jm.get(p);if(jn&&nu[jn]){p.remove(c);nu[jn].add(c)}}
 for(const c of og.children.slice()){if(keep.has(c))continue;og.remove(c);try{disp16(c)}catch(err){}}
 for(const c of ng.children.slice())og.add(c);
 if(ou.g20)ou.g20=null;Object.assign(ou,nu);ou.mg16=0;if(Math.abs(og.scale.x-1)<.001)og.scale.setScalar(ng.scale.x);return ou}
function bakeL32(u,side,kind,L,D,fn){const lk=JSON.stringify(L).replace(/"skin":\d+,?/,'');const tot={v:0};
 for(const bn of BNL32){const j=u[bn];if(!j)continue;const geo=pqL32(side+'|'+kind+'|'+bn+'|'+D+'|'+lk+(bn[0]==='e'&&L.sleeves?'|'+L.skin:''),q=>fn(kind,bn,L,D,q));if(!geo)continue;tot.v+=geo.attributes.position.count;
  const m=j.children.find(c=>c.isMesh&&c.material===VCM&&!c.u27&&!c.u32);if(m){const old=m.geometry;m.geometry=catL32([old,geo]);old.dispose();m.u32=1}else{const mm=new T.Mesh(geo,VCM);mm.u32=1;j.add(mm)}}
 u.v32={side,kind,verts:tot.v};return tot.v}
const KNL32={V:{rifle:'Fusilero',mg:'Ametrallador',officer:'Teniente',medic:'Sanitario',sapper:'Zapador',mortar:'Morterista',observer:'Observador',cav:'Jinete',winter:'Fusilero',r11:'Fusilero del 11.º'},
 E:{rifle:'a un fusilero de Veyrn',assault:'a un soldado de asalto de Veyrn',gren:'a un granadero de Veyrn',mg:'a un ametrallador de Veyrn',officer:'a un oficial de Veyrn',eng:'a un zapador de Veyrn',crew:'a un tanquista de Veyrn',scout:'a un explorador de Veyrn',naval:'a un infante de marina de Veyrn'}};
function volsk32(t,kind,o){o=o||{};kind=KNL32.V[kind]?kind:'rifle';const u0=t&&t.g&&t.g.userData;if(!u0||!u0.ch||!u0.hd)return t;const P=VOLSK32,D=G.detail|0;
 const L=lookVL32(kind,o),skin=SK[R()*SK.length|0];L.skin=skin;const off=kind==='officer';
 const u=rebuildL32(t,{coat:L.coat?L.coatC:L.tun,pants:L.pants,hat:'none',tab:kind==='r11'?P.green11:P.blue,trim:off?0xc8b060:P.brass,pack:false,officer:off,puttee:P.boot,leather:P.lea,
  glove:kind==='winter'?0x5a4a3a:off?0x8a6a48:undefined,face:o.face,rank:o.rank||0,skin,scale:o.scale});
 bakeL32(u,'V',kind,L,D,partVL32);t.v32k='V:'+kind;return t}
function veyrn32(t,kind,o){o=o||{};kind=KNL32.E[kind]?kind:'rifle';const u0=t&&t.g&&t.g.userData;if(!u0||!u0.ch||!u0.hd)return t;const P=VEYRN32,D=G.detail|0;
 const L=lookEL32(kind,o),skin=SK[R()*SK.length|0];L.skin=skin;const off=kind==='officer';
 const face=o.face!==undefined?o.face:(R()<.55?0:R()*5|0);
 const u=rebuildL32(t,{coat:L.coat?L.coatC:(kind==='crew'?P.lea:L.tun),pants:L.pants,hat:'none',tab:kind==='naval'?P.collar:0x1a1a1a,trim:off?0x9a8a5a:P.badge,pack:false,officer:off,
  puttee:kind==='naval'?P.white:P.puttee,leather:kind==='crew'?0x0e0c0a:P.web,glove:kind==='crew'?0x14110e:undefined,face,rank:o.rank||0,skin,scale:o.scale});
 bakeL32(u,'E',kind,L,D,partEL32);
 if(t.hp!==undefined&&typeof enemies!=='undefined'&&enemies.indexOf(t)>=0){t.k8n=KNL32.E[kind];if(kind==='assault'&&!t.v32hp){t.v32hp=1;t.hp*=1.35;t.max=t.hp}}
 t.v32k='E:'+kind;return t}
/* cascos sueltos (para re-vestir sólo la cabeza) */
function helmVolsk32(hd,c){const D=G.detail|0;const g=pqL32('HV|'+D+'|'+(c||0),q=>hgHelmV32(q,D,c));const m=new T.Mesh(g,VCM);m.u27=1;m.name='helm32';hd.add(m);return m}
function helmVeyrn32(hd,c){const D=G.detail|0;const g=pqL32('HE|'+D+'|'+(c||0),q=>hgHelmE32(q,D,c));const m=new T.Mesh(g,VCM);m.u27=1;m.name='helm32';hd.add(m);return m}
const LIB32={volsk:volsk32,veyrn:veyrn32,helmVolsk:helmVolsk32,helmVeyrn:helmVeyrn32,VOLSK:VOLSK32,VEYRN:VEYRN32,kindsV:Object.keys(KNL32.V),kindsE:Object.keys(KNL32.E),cache:GCL32};
