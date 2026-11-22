/* ============================================================
   v36 · ARQUITECTURA DE SONIDO DE VEHÍCULOS Y AERONAVES
        + TEXTURAS DEL SOLDADO DE EISENMARK
   - Motores en bucle posicionales (tanques, camiones, tren,
     torpedera, cepelín, aviones), con tono según velocidad,
     atenuación por distancia y límite de 4 motores a la vez.
   - Cañonazo y recarga de tanque; pasadas y caída de aviones.
   - Torso y brazos de los soldados de Eisenmark (niveles 11–16)
     con textura de lana como mapa de detalle (conserva colores),
     mochila, cartucheras y pala con texturas reales; tablones
     de trinchera en la línea de las Tres Cruces (nivel 17).
   ============================================================ */
Object.assign(VOL34,{tk_idle:.55,tk_move:.7,tk_fire:1.1,tk_reload:.6,tk_on:.6,tr_idle:.45,tr_move:.6,train:.8,boat:.55,zep:.5,plane_loop:.6,bomber:.75,flyby1:.85,flyby2:.85,plane_die:.9});
MAXV34.tk_fire=4;for(const k of['tk_idle','tk_move','tr_idle','tr_move','train','boat','zep','plane_loop','bomber'])MAXV34[k]=8;
{const _d=dec35;dec35=function(n){if(!S35.dec[n]&&typeof SND36B!=='undefined'&&SND36B[n]&&typeof ac!=='undefined'&&ac){S35.dec[n]=1;try{const s=atob(SND36B[n]),u=new Uint8Array(s.length);for(let i=0;i<s.length;i++)u[i]=s.charCodeAt(i);ac.decodeAudioData(u.buffer,b=>{SND34.buf[n]=b},()=>{})}catch(e){}return}return _d(n)}}
/* ---- cañonazo de tanque / cañón antitanque (reemplaza la explosión usada como disparo) ---- */
function tkf36(x,z,rel){if(!samp34('tk_fire',1,1,x,z,{reach:45,max:600}))return false;if(rel)samp34('tk_reload',1,1,x,z,{delay:1.3,reach:12});return true}
/* ---- gestor de motores: una fuente en bucle por emisor cercano ---- */
const ENG36={act:new Map(),t:0};
function engSet36(key,name,x,z,vol,rate,pos){let a=ENG36.act.get(key);if(a&&a.n!==name){try{a.gn.gain.setTargetAtTime(0,ac.currentTime,.15);a.s.stop(ac.currentTime+.6)}catch(e){}ENG36.act.delete(key);a=null}
 if(!a){const r=samp34(name,1,1,null,null,{loop:true});if(!r||!r.s)return;r.gn.gain.cancelScheduledValues(ac.currentTime);r.gn.gain.setValueAtTime(0,ac.currentTime);a={s:r.s,gn:r.gn,n:name};ENG36.act.set(key,a)}a.seen=ENG36.t;
 let g=vol*(VOL34[name]||.6)*(G.vol==null?.8:G.vol);if(pos!==false&&x!=null){const d=Math.hypot(cam.position.x-x,cam.position.z-z);g*=1/(1+d/(name==='bomber'||name==='zep'?60:22));}
 a.gn.gain.setTargetAtTime(Math.max(0,g),ac.currentTime,.2);a.s.playbackRate.setTargetAtTime(Math.max(.4,rate),ac.currentTime,.25)}
function engGC36(){for(const [k,a] of ENG36.act)if(a.seen!==ENG36.t){try{a.gn.gain.setTargetAtTime(0,ac.currentTime,.2);a.s.stop(ac.currentTime+.8)}catch(e){}ENG36.act.delete(k)}}
function engUpd36(dt){ENG36.t++;if(!playing||typeof cam==='undefined'){engGC36();return}const c=cam.position,L=[];
 /* VEH32 (nivel 17) */
 if(typeof VEH32!=='undefined'&&VEH32.list)for(const v of VEH32.list){if(!v.alive||!v.g)continue;const t=/^tank/.test(v.kind)?'tank':/^truck/.test(v.kind)?'truck':v.kind;if(t!=='tank'&&t!=='armcar'&&t!=='truck'&&t!=='loco')continue;const p=v.g.position,d=Math.hypot(p.x-c.x,p.z-c.z);if(d<150)L.push([d,v,t,p])}
 L.sort((a,b)=>a[0]-b[0]);for(let i=0;i<Math.min(4,L.length);i++){const [d,v,t,p]=L[i],sp=Math.abs(v.v||0),mv=sp>.4;
  const nm=t==='loco'?'train':t==='tank'?(mv?'tk_move':'tk_idle'):(mv?'tr_move':'tr_idle');engSet36(v,nm,p.x,p.z,1,t==='loco'?.7+sp*.06:mv?.85+Math.min(.4,sp*.05):1)}
 /* tanque del jugador (nivel 14) */
 if(level===14&&typeof L14!=='undefined'&&L14.tank&&(L14.inTank||Math.hypot(L14.tank.position.x-c.x,L14.tank.position.z-c.z)<80)){const p=L14.tank.position,k='L14',o=ENG36.p14||(ENG36.p14={x:p.x,z:p.z}),sp=Math.hypot(p.x-o.x,p.z-o.z)/Math.max(dt,.001);o.x=p.x;o.z=p.z;
  engSet36(k,sp>.6?'tk_move':'tk_idle',p.x,p.z,L14.inTank?1.3:1,sp>.6?.85+Math.min(.4,sp*.05):1,!L14.inTank)}
 /* torpedera (nivel 15) */
 if(level===15&&typeof L28!=='undefined'&&L28.onBoat&&typeof B28!=='undefined'&&!B28.sunk){const k=Math.min(1,Math.max(0,ENG36.k28||0));engSet36('B28','boat',null,null,.7+k*.6,.75+k*.5,false)}
 /* cepelín (niveles 12 y 16 a bordo) */
 if(level===12&&typeof L12!=='undefined'&&L12.ph<7){engSet36('Z12','zep',null,null,L12.ph===0?.5:1,L12.ph===0?.8:.95+(L12.spd||0)/80,false)}
 if(level===16&&typeof N16!=='undefined'&&N16.ph===1)engSet36('Z16','zep',null,null,.9,.9,false);
 /* aeronaves: el motor más cercano en bucle + pasada al cruzar cerca */
 let best=null,bd=1e9;const air=[];if(level===12&&typeof AIR12!=='undefined')for(const a of AIR12)if(a&&a.p&&a.st!=='down'&&a.kind!=='dragon'&&a.kind!=='draco')air.push(a.p);
 if(level===15&&typeof L28!=='undefined'&&L28.planes)for(const a of L28.planes){const q=a&&(a.p||a.g&&a.g.position);if(q&&!(a.hp<=0))air.push(q)}
 for(const q of air){const d=Math.hypot(q.x-c.x,q.y-c.y,q.z-c.z);if(d<bd){bd=d;best=q}
  const o=S36F.get(q),pd=o?o.d:d;if(o&&pd<70&&d>pd&&!o.fb&&time-S36F.t>2.5){o.fb=1;S36F.t=time;samp34(Math.random()<.5?'flyby1':'flyby2',1,1,q.x,q.z,{reach:40,max:300})}if(d>140&&o)o.fb=0;S36F.set(q,{d,fb:o?o.fb:0})}
 if(best&&bd<400)engSet36('AIR','plane_loop',best.x,best.z,1.2,1+Math.min(.25,Math.max(-.2,0)),true);
 if(level===17&&typeof N17!=='undefined'&&N17.planes&&N17.planes.visible!==false&&N17.planes.parent){const p=N17.planes.position;engSet36('B17','bomber',p.x,p.z,1.6,1,true)}
 engGC36()}
const S36F=new WeakMap();S36F.t=-9;
/* ---- caída de aviones ---- */
if(typeof down12==='function'){const _d=down12;down12=function(a){const was=a&&a.st;const r=_d.apply(this,arguments);if(a&&was!=='down'&&a.p&&a.kind!=='dragon')samp34('plane_die',1,1,a.p.x,a.p.z,{reach:50,max:500});return r}}
if(typeof planeHit28==='function'){const _h=planeHit28;planeHit28=function(a){const h0=a&&a.hp;const r=_h.apply(this,arguments);if(a&&h0>0&&a.hp<=0){const q=a.p||a.g&&a.g.position;if(q)samp34('plane_die',1,1,q.x,q.z,{reach:50,max:500})}return r}}
/* ---- arranque del motor al subir al tanque del nivel 14 ---- */
let IN36=false;
/* ---- precarga por nivel ---- */
function pre36(){const L={12:['zep','plane_loop','flyby1','flyby2','plane_die'],14:['tk_idle','tk_move','tk_fire','tk_reload','tk_on'],15:['boat','plane_loop','flyby1','flyby2','plane_die'],16:['zep'],17:['tk_idle','tk_move','tk_fire','tk_reload','tr_idle','tr_move','train','bomber']}[level]||[];for(const n of L)dec35(n)}
{const _u=update;update=function(dt){const r=_u(dt);if(typeof ac==='undefined'||!ac)return r;if(ENG36.lv!==level){ENG36.lv=level;pre36();for(const [k,a] of ENG36.act){try{a.s.stop()}catch(e){}}ENG36.act.clear()}
 engUpd36(dt);if(level===14&&typeof L14!=='undefined'){if(L14.inTank&&!IN36)samp34('tk_on',1);IN36=!!L14.inTank}return r}}
/* silenciar los motores sintetizados cuando suena la muestra */
if(typeof engSnd12==='function'){const _e=engSnd12;engSnd12=function(){_e.apply(this,arguments);if(ENG36.act.has('Z12')&&L12.eng0)try{L12.eng0.g.gain.setTargetAtTime(0,ac.currentTime,.2)}catch(e){}}}
if(typeof engSnd28==='function'){const _e=engSnd28;engSnd28=function(k){ENG36.k28=k;_e.apply(this,arguments);if(ENG36.act.has('B28')&&ENG28.g)try{ENG28.g.gain.setTargetAtTime(0,ac.currentTime,.2)}catch(e){}}}

/* ================= TEXTURAS ================= */
const TX36={};
function tx36(n,rep){if(TX36[n])return TX36[n];const im=new Image();im.src='data:image/png;base64,'+TEX36[n];const t=new T.Texture(im);im.onload=()=>{t.needsUpdate=true};t.wrapS=t.wrapT=T.RepeatWrapping;t.magFilter=T.NearestFilter;t.minFilter=T.LinearMipMapLinearFilter;if(rep)t.repeat.set(rep[0],rep[1]);return TX36[n]=t}
const MT36={};
function dm36(n){if(MT36[n])return MT36[n];const k=1.275;return MT36[n]=new T.MeshLambertMaterial({vertexColors:true,map:tx36(n),color:new T.Color(k,k,k)})}
/* mochila + cartucheras + pala: geometría compartida con UV del atlas 2×2 */
let GEAR36=null;
function gearGeo36(){if(GEAR36)return GEAR36;const P_=[],N_=[],U_=[],I_=[];let vo=0;
 const add=(w,h,d,x,y,z,ry,cell)=>{const g=new T.BoxGeometry(w,h,d);if(ry)g.rotateY(ry);g.translate(x,y,z);const p=g.attributes.position,n=g.attributes.normal,u=g.attributes.uv,cx=(cell%2)*.5,cy=1-(cell>>1)*.5-.5;
  for(let i=0;i<p.count;i++){P_.push(p.getX(i),p.getY(i),p.getZ(i));N_.push(n.getX(i),n.getY(i),n.getZ(i));U_.push(cx+u.getX(i)*.5,cy+u.getY(i)*.5)}for(let i=0;i<g.index.count;i++)I_.push(g.index.getX(i)+vo);vo+=p.count;g.dispose()};
 add(.5,.5,.26,0,.36,-.3,0,0);            /* mochila (cubre la original) */
 add(.17,.18,.13,.15,.04,.24,0,1);add(.17,.18,.13,-.15,.04,.24,0,1); /* cartucheras al frente del cinturón */
 add(.14,.16,.1,-.3,.02,.06,1.57,3);      /* portacargador (Nagant) a la cadera */
 add(.16,.28,.035,.26,.2,-.33,0,2);add(.035,.3,.035,.26,.48,-.33,0,2); /* pala con mango, en la mochila */
 const b=new T.BufferGeometry();b.setAttribute('position',new T.Float32BufferAttribute(P_,3));b.setAttribute('normal',new T.Float32BufferAttribute(N_,3));b.setAttribute('uv',new T.Float32BufferAttribute(U_,2));b.setIndex(I_);b.computeBoundingSphere();return GEAR36=b}
let GM36=null;
function eis36(n){const g=n&&n.g||n;if(!g||!g.userData||g.userData.eis36||!g.userData.ch||level<11||level>16)return;const u=g.userData;u.eis36=1;
 try{const m0=u.ch.children.find(c=>c.isMesh);if(m0)m0.material=dm36('torsoeisenmark');
  for(const a of[u.aR,u.aL]){const m=a&&a.children.find(c=>c.isMesh);if(m)m.material=dm36('uparmeisenmarksoldier')}
  for(const e of[u.eR,u.eL]){const m=e&&e.children.find(c=>c.isMesh);if(m)m.material=dm36('lowarmeisenmarksoldier')}
  if(G.detail>0&&!(n&&(n.medic||n.nurse||n.role==='medic'))){if(!GM36)GM36=new T.MeshLambertMaterial({map:tx36('gear')});const gm=new T.Mesh(gearGeo36(),GM36);u.ch.add(gm)}}catch(e){}}
if(typeof npc11==='function'){const _n=npc11;npc11=function(){const r=_n.apply(this,arguments);if(level>=11&&level<=16)eis36(r);return r}}
/* soldados creados antes (escuadras ya armadas al cambiar de nivel) */
{const _u=update;let k=0;update=function(dt){const r=_u(dt);if(level>=11&&level<=16&&++k%60===0){if(typeof L13!=='undefined'&&L13.sq)for(const n of L13.sq)eis36(n);if(typeof npcs!=='undefined')for(const n of npcs)if(n&&n.lv===level)eis36(n)}return r}}
/* tablones de trinchera (nivel 17): pilas y paneles junto a refugios, nidos y pozos antitanque */
let WOOD36=false;
function wood36(){if(WOOD36||level!==17||typeof K17==='undefined'||!K17.dugouts)return;WOOD36=true;const P_=[],N_=[],U_=[],I_=[];let vo=0;
 const add=(w,h,d,x,y,z,ry)=>{const g=new T.BoxGeometry(w,h,d);g.rotateY(ry||0);g.translate(x,y,z);const p=g.attributes.position,n=g.attributes.normal,u=g.attributes.uv;for(let i=0;i<p.count;i++){P_.push(p.getX(i),p.getY(i),p.getZ(i));N_.push(n.getX(i),n.getY(i),n.getZ(i));U_.push(u.getX(i)*Math.max(1,w/1.2),u.getY(i)*Math.max(1,h/1.2))}for(let i=0;i<g.index.count;i++)I_.push(g.index.getX(i)+vo);vo+=p.count;g.dispose()};
 const pts=[...(K17.dugouts||[]),...(K17.mg||[]),...(K17.at||[])];let i=0;
 for(const q of pts){const x=X17+(q.x!==undefined?q.x:q[0])+(i%2?3.2:-3.2),z=(q.z!==undefined?q.z:q[1])-3.5,r=(i*1.7)%3;i++;
  for(let k=0;k<3;k++)add(2.2,.12,.32,x,.07+k*.13,z+(k%2?.05:-.05),r+k*.06);add(.3,.25,.3,x-.8,.12,z+.45,r);add(.3,.25,.3,x+.8,.12,z+.45,r)}
 const b=new T.BufferGeometry();b.setAttribute('position',new T.Float32BufferAttribute(P_,3));b.setAttribute('normal',new T.Float32BufferAttribute(N_,3));b.setAttribute('uv',new T.Float32BufferAttribute(U_,2));b.setIndex(I_);b.computeBoundingSphere();
 const m=new T.Mesh(b,new T.MeshLambertMaterial({map:tx36('wood')}));m.userData.l17=1;scene.add(m)}
{const _u=update;update=function(dt){if(level===17&&!WOOD36&&typeof K17!=='undefined'&&K17.dugouts)wood36();return _u(dt)}}
