/* =====================================================================
   v50 · CAMPAÑA DE VEYRN — XIX «Operación Rompeolas» y XX «Bastión de Hierro»
   Reemplaza, envolviendo (sin tocar vGAI/src/missions_veyrn_vgai.js), la lógica
   de fases de los niveles 19 y 20:
   - Escuadra Veyrn con IA v33 real (seguir, cubrirse, disparar, destrabarse) y
     secciones aliadas con ruta propia; antes quedaban congeladas (nadie llamaba
     a npcUpd11/compUpd30 en 19 y 20).
   - Enemigos de Volskaya (volsk32 rifle/mg/officer/sapper/r11 en Karsk y
     r12/r12off/mg/frust/winter en Varnholt) que aparecen sólo fuera de cámara.
   - Seis fases por nivel con objetivos encadenados, cargas con [E], zonas de
     captura, vehículos (VEH32) de ambos bandos, grifos de Veyrn aliados (AIR38)
     en el XX, artillería con aviso y secundarios con consecuencias reales.
   - Cinemáticas de entrada y salida saltables (cine9), pantalla final propia,
     marcadores de secundarios en minimapa y brújula, viewmodel y nombres de
     armas de Veyrn, puntos de control 0..5 y reaparición en el punto activo.
   API de QA: window.VEYRN50 (st(), perf(), go(ph,cp), skip()).
   ===================================================================== */
(function(){'use strict';
if(typeof window==='undefined'||typeof document==='undefined')return;
const VY={ver:'v50',on:false,lv:0,S:null,hooked:false};window.VEYRN50=VY;
const R_=Math.random,HY=Math.hypot;
const $e=id=>document.getElementById(id);
const DK=(a,b,c)=>({easy:a,normal:b,hard:c}[typeof difficulty!=='undefined'?difficulty:'normal'])||b;
const LOWD=()=>+((typeof G!=='undefined'&&G.detail)||0)===0;
const safe=(f,...a)=>{try{return f(...a)}catch(e){if(VY.S&&VY.S.dbg)VY.S.dbg.err=(VY.S.dbg.err||0)+1;if(!VY.warned){VY.warned=1;console.warn('veyrn_v50',e)}}};
const isV=()=>VY.on&&(level===19||level===20)&&level===VY.lv;
/* ---------------------------------------------------------------------
   DATOS: nombres, armas, puntos de control
   --------------------------------------------------------------------- */
const WN={rifle:'FUSIL VEYRN V98 · 7,92',smg:'SUBFUSIL STURM V22',revolver:'PISTOLA V-08',atrifle:'FUSIL ANTITANQUE AT-18 · 13,2'};
const KN={rifle:'a un fusilero de Volskaya',mg:'a un ametrallador de Volskaya',officer:'a un oficial de Volskaya',sapper:'a un zapador de Volskaya',observer:'a un observador de Volskaya',r11:'a un fusilero del 11.º de Volskaya',r12:'a un fusilero del 12.º de Volskaya',r12off:'a un teniente del 12.º de Volskaya',frust:'a un artillero FRUST',winter:'a un fusilero de invierno de Volskaya'};
/* [x,z,yaw] (yaw 0 = norte, -z; PI/2 = oeste) */
const CP={19:[[126,-26,1.5708],[22,-14,0],[-36,-196,0],[-6,-296,0],[-8,-556,0],[-30,-706,0]],
          20:[[0,40,0],[-30,-118,0],[12,-262,0],[0,-516,0],[-76,-656,1.1],[0,-742,0]]};
const TITLE={19:[['I','DESEMBARCO DEL FARO','05:20 · Playa de Karsk'],['II','BARRANCO SOKOL','06:30 · Barranco Sokol'],['III','LÍNEA DE LAS TRES CRUCES','07:40 · Línea fortificada'],['IV','DEPÓSITO DE TEREK','08:50 · Estación de Terek'],['V','PUERTO DE DROVNA','10:10 · Puerto de Drovna'],['VI','PUENTE DE ORLOV','11:20 · Garganta de Orlov']],
             20:[['I','BOSQUE DE DRAVIK','05:30 · Bosque de Dravik'],['II','MURO DE VARN','06:40 · Línea de Varn y Cota 214'],['III','MESETA DE VARN','08:00 · Meseta y granja'],['IV','CALLES DE FALKENBRÜCK','09:40 · Puerta sur y plaza'],['V','PLAYA DE VÍAS','11:10 · Estación y talleres'],['VI','CIUDADELA Y PUENTE','12:50 · Ciudadela de Falkenbrück']]};
/* ---------------------------------------------------------------------
   ESTADO
   --------------------------------------------------------------------- */
function newS(lv){return{lv,X:lv===19?(typeof X17!=='undefined'?X17:160000):(typeof X18!=='undefined'?X18:200000),ph:0,cpPh:0,T:0,st:0,ev:{},ot:'',sub:'',sq:[],all:[],secA:[],q:[],grp:{},works:[],sh:[],veh:[],tq:[],work:null,cap:{},kills:0,vk:0,gk:0,t0:typeof time!=='undefined'?time:0,
 sec:{},flags:{},guns:[],aa:[],air:[],flagG:null,qt:0,tt:0,at:0,los:0,regen:0,deaths:0,timer:0,
 dbg:{ms:0,n:0,msMax:0,spawn:0,defer:0,forced:0,tele:0,stk:0,err:0,minSpawnD:1e9,visSpawn:0}}}
const W=x=>VY.S.X+x;
function fl(x,z){const S=VY.S;try{if(S.lv===20&&typeof floor18==='function')return floor18(x,z)||0;if(S.lv===19&&typeof floor17==='function')return floor17(x,z)||0}catch(e){}return 0}
function once(k,t){const S=VY.S;if(S.ev[k]||S.T<(t||0))return false;S.ev[k]=1;return true}
function later(t,f){VY.S.tq.push({t,f})}
function obj(t,x,z){const S=VY.S;S.ot=t;if(x===undefined)L9.obj=null;else L9.obj=[W(x),z]}
function talkV(lines){try{if(typeof talk==='function')talk(lines.map(l=>[l[0],l[1],l[2]||Math.max(2.4,l[1].length*.05)]))}catch(e){}}
function feedV(t){try{feed(t)}catch(e){}}
/* visibilidad de un punto para la cámara del jugador (presupuesto de LOS) */
function vis(x,z){const c=cam.position,dx=x-c.x,dz=z-c.z,d=HY(dx,dz);if(d<35)return true;const far=scene.fog&&scene.fog.far?scene.fog.far*.85:400;if(d>far)return false;const fx=-Math.sin(yaw),fz=-Math.cos(yaw);if((dx*fx+dz*fz)/d<.3)return false;const S=VY.S;if(S.los>=10)return true;S.los++;return losClear(c.x,c.y,c.z,x,1.4,z)}
/* ---------------------------------------------------------------------
   ENEMIGOS DE VOLSKAYA
   --------------------------------------------------------------------- */
function spE(k,x,z,o){o=o||{};const S=VY.S;const kind=o.kind||(S.lv===19?{mosin:'rifle',stv:'rifle',bar:'mg'}:{mosin:'r12',stv:'winter',bar:'mg'})[k]||'rifle';
 const e=sp13(k,x+S.X-X13,z,{tag:o.tag,hold:o.hold,role:/off/.test(kind)?'off':undefined,un:o.un,f:o.f});e.t13=o.tag||'v';e.kv50=kind;
 try{volsk32(e,kind,o.look||{})}catch(er){}e.k8n=KN[kind]||KN.rifle;e.faction='volskaya';
 if(!o.un){e.unaware=false;e.active=true;e.alert=.3+R_()*.9}e.goal50=o.goal||null;e.hp*=DK(.8,1,1.2)*(o.hp||1);e.max=e.hp;
 const f=fl(x,z);if(f>.05){e.g.position.y=f;if(e.hold)e.hold[1]=f}
 const g=S.grp[e.t13]||(S.grp[e.t13]={n:0,k:0});g.n++;S.dbg.spawn++;
 const dp=HY(e.g.position.x-P.g.position.x,e.g.position.z-P.g.position.z);if(dp<S.dbg.minSpawnD)S.dbg.minSpawnD=Math.round(dp);return e}
const foes=tag=>enemies.filter(e=>e.hp>0&&(!tag||String(e.t13).startsWith(tag)));
function left(tag){const S=VY.S;let n=0;for(const e of enemies)if(e.hp>0&&String(e.t13).startsWith(tag))n++;for(const q of S.q)if(String(q.o.tag).startsWith(tag))n++;return n}
function qE(k,cands,o){VY.S.q.push({k,c:Array.isArray(cands[0])?cands:[cands],o:o||{},t:0})}
function capN(){return Math.max(6,Math.round(DK(8,10,12)-(LOWD()?2:0)))}
function pump(dt){const S=VY.S;S.qt-=dt;if(S.qt>0||!S.q.length)return;S.qt=.3;let alive=0;for(const e of enemies)if(e.hp>0)alive++;const cap=capN(),pp=P.g.position;let n=0;
 for(let i=0;i<S.q.length&&n<2;i++){const q=S.q[i];q.t+=.3;if(alive>=cap)break;let c=null;const L=q.c.slice().sort(()=>R_()-.5);
  for(const s of L){const d=HY(W(s[0])-pp.x,s[1]-pp.z);if(d<22)continue;if(!vis(W(s[0]),s[1])){c=s;break}if(q.o.fb&&q.t>q.o.fb&&d>58){c=s;S.dbg.forced++;break}}
  if(!c){S.dbg.defer++;if(q.t>120)S.q.splice(i--,1);continue}S.q.splice(i--,1);const j=q.o.hold?0:2.5;const e=spE(q.k,c[0]+(R_()-.5)*j,c[1]+(R_()-.5)*j,q.o);if(vis(e.g.position.x,e.g.position.z)&&HY(e.g.position.x-pp.x,e.g.position.z-pp.z)<58)S.dbg.visSpawn++;alive++;n++}}
function despawn(e){scene.remove(e.g);const i=enemies.indexOf(e);if(i>=0)enemies.splice(i,1)}
/* empuje táctico: los que tienen meta avanzan a saltos hacia ella */
function tac(dt){const S=VY.S;S.tt-=dt;if(S.tt>0)return;S.tt=1.1;for(const e of enemies){if(e.hp<=0||e.unaware||e.hold||!e.goal50)continue;const p=e.g.position,g=e.goal50,d=HY(W(g[0])-p.x,g[1]-p.z);if(d>5){if(R_()<.55){e.cv={x:W(g[0])+(R_()-.5)*7,z:g[1]+(R_()-.5)*7};e.st='cover'}}else e.goal50=null}}
/* ---------------------------------------------------------------------
   ALIADOS DE VEYRN
   --------------------------------------------------------------------- */
function ally(x,z,o){o=o||{};const S=VY.S;const n=npc11(W(x),z,{name:o.name||'Soldado de Veyrn',coat:0x3a4048,hat:'helm',hatC:0x2c3032,rank:o.rank||0,officer:!!o.officer,f:o.f===undefined?Math.PI:o.f});
 n.lv=S.lv;arm13(n,o.w||'r');n.kind50=o.kind||'rifle';n.kind17=o.role||(o.w==='lmg'?'mg':'rifle');n.hp=100;n.on=o.on!==false;n.g.visible=true;n.v50=1;
 try{veyrn32(n,n.kind50,o.look||{})}catch(e){}const f=fl(x,z);if(f>.05)n.g.position.y=f;
 L9.tgts.push({p:n.g.position,h:d=>{if(L9.cine)return;n.hp-=d*DK(.45,.6,.75);if(n.hp<18){n.hp=18;n.pin50=time}},ok:()=>n.lv===level&&n.g.visible&&!n.gone50,r:.6,bias:2.5,y:1.9});S.all.push(n);return n}
function rmAlly(n){n.gone50=1;n.g.visible=false;n.lv=-1;scene.remove(n.g);const i=NPC11.indexOf(n);if(i>=0)NPC11.splice(i,1)}
const SQ={19:[['Feldwebel Richter',{w:'smg',kind:'assault',rank:1}],['Gefreiter Voss',{kind:'rifle'}],['Pionier Weber',{kind:'eng'}],['MG-Schütze Hahn',{w:'lmg',kind:'mg',role:'mg'}]],
          20:[['Hauptmann Lindemann',{w:'smg',kind:'officer',officer:true,rank:3}],['Unteroffizier Becker',{w:'smg',kind:'storm',rank:1}],['Pionier Haas',{kind:'eng'}],['Schütze Albrecht',{w:'lmg',kind:'mg',role:'mg'}]]};
function mkSquad(){const S=VY.S,c=CP[S.lv][0];S.sq=SQ[S.lv].map((d,i)=>{const n=ally(c[0]+(i%2?1.6:-1.6),c[1]+2+i,Object.assign({name:d[0]},d[1]));n.sq50=1;return n})}
function placeSquad(x,z,yw){const S=VY.S,fx=-Math.sin(yw),fz=-Math.cos(yw),rx=Math.cos(yw),rz=-Math.sin(yw);let i=0;
 for(const n of S.all){if(!n.sq50||n.gone50)continue;const s=(i%2?1:-1)*(1.6+(i>>1)*1.4),b=2.2+(i>>1)*1.6;const px=W(x)+rx*s-fx*b,pz=z+rz*s-fz*b;n.g.position.set(px,fl(px-S.X,pz),pz);n.tgt=null;n.vx=n.vz=0;n.hp=Math.max(n.hp,80);n.act='idle';if(n.nv33)n.nv33.stk=0;i++}}
function foeNear(p,rng){const S=VY.S;let b=null,bd=rng;for(const e of enemies){if(e.hp<=0||e.unaware)continue;const q=e.g.position,d=HY(q.x-p.x,q.z-p.z);if(d<bd){if(S.los>=10)break;S.los++;if(losClear(p.x,1.5,p.z,q.x,1.3,q.z)){bd=d;b=e}}}return b}
function shootA(n,dt){n.ft50=(n.ft50||R_())-dt;if(n.ft50<=0){n.ft50=.7+R_()*.5;n.tg50=foeNear(n.g.position,n.wpn==='p'?40:85)}const e=n.tg50&&n.tg50.hp>0&&enemies.includes(n.tg50)?n.tg50:null;if(!e)return false;const p=n.g.position,q=e.g.position;n.f=Math.atan2(q.x-p.x,q.z-p.z);if(n.mag===undefined)n.mag=MAG30[n.wpn]||5;if(n.rl>0){n.rl-=dt;if(n.rl<=0)n.mag=MAG30[n.wpn]||5;n.act='crouch';return true}n.act='crouchaim';fire30(n,e,HY(q.x-p.x,q.z-p.z),dt);return true}
/* sección aliada con ruta propia (no sigue al jugador) */
function secA(n0,route,o){o=o||{};const S=VY.S,L=[],NM=S.lv===19?['Matrose Lenz','Matrose Kühn','Gefreiter Ott','Schütze Brand','Schütze Falk','Matrose Riedl']:['Schütze Kroll','Gefreiter Mertens','Schütze Pohl','Jäger Wendt','Schütze Graf','Jäger Lorenz'];
 const n=LOWD()?Math.max(2,n0-1):n0;for(let i=0;i<n;i++){const s=route[0];const a=ally(s[0]+(i%3)*2-2,s[1]+(i/3|0)*2,{name:(o.nm||'')+NM[(i+S.ph)%NM.length],w:o.mg&&i===0?'lmg':R_()<.25?'smg':'r',kind:o.kind||'rifle'});
  a.on=false;a.lock=true;a.route50=route.slice(1).map(p=>[W(p[0])+(R_()-.5)*4,p[1]+(R_()-.5)*3]);a.post50=o.post?[W(o.post[0])+(i-n/2)*2.2,o.post[1]+(R_()-.5)*2]:null;a.tagA=o.tag||'s';S.secA.push(a);L.push(a)}return L}
function mvA(n,dt,tg,sp){const p=n.g.position,d=HY(p.x-tg[0],p.z-tg[1]);if(d<1.4){n.sk50=0;n.ld50=undefined;return true}n.tgt=[tg[0],tg[1]];n.sp=sp;n.act='run';n.ck50=(n.ck50||0)-dt;if(n.ck50>0)return false;n.ck50=1.5;
 if(n.ld50!==undefined&&n.ld50-d<.5)n.sk50=(n.sk50||0)+1;else n.sk50=0;n.ld50=d;
 if(n.sk50>=3&&(n.sk50>=8||(!vis(p.x,p.z)&&!vis(tg[0],tg[1])))){p.set(tg[0],fl(tg[0]-VY.S.X,tg[1]),tg[1]);n.vx=n.vz=0;n.sk50=0;n.ld50=undefined;VY.S.dbg.stk++;return true}return false}
function allyUpd(dt){const S=VY.S,pp=P.g.position,free=[];
 for(const n of S.all){if(n.gone50||!n.g.visible)continue;const p=n.g.position;
  /* regeneración lenta fuera de combate */if(n.hp<100&&(!n.pin50||time-n.pin50>4))n.hp=Math.min(100,n.hp+dt*4);
  if(n.lock&&!n.sq50){/* sección */if(n.wait50>0){n.wait50-=dt;n.tgt=null;if(!shootA(n,dt))n.act='crouch';continue}
   if(n.route50&&n.route50.length){if(n.rw50>0){n.rw50-=dt;n.tgt=null;if(!shootA(n,dt))n.act='crouch';continue}if(mvA(n,dt,n.route50[0],4.6)){n.route50.shift();n.rw50=1+R_()*2}continue}
   if(n.post50&&HY(p.x-n.post50[0],p.z-n.post50[1])>1.3){mvA(n,dt,n.post50,3.6);continue}n.tgt=null;if(!shootA(n,dt))n.act='crouch';continue}
  if(n.sq50&&n.on&&!n.lock){/* la escuadra: anti-atasco final (lejos y fuera de cámara) */const dp=HY(p.x-pp.x,p.z-pp.z);
   if(dp>70&&!vis(p.x,p.z)){const a=yaw+Math.PI+(R_()-.5)*1.2,r=9+R_()*4,x=pp.x+Math.sin(a)*r*-1,z=pp.z+Math.cos(a)*r*-1;if(!vis(x,z)||dp>140){p.set(x,fl(x-S.X,z),z);n.tgt=null;n.vx=n.vz=0;S.dbg.tele++}}
   free.push(n)}}
 L13.sq=free;try{compUpd30(dt,free)}catch(e){safe(()=>{throw e})}
 if(S.lv===20)for(const n of S.all){if(!n.gone50&&n.g.visible){const f=fl(n.g.position.x-S.X,n.g.position.z);if(Math.abs(n.g.position.y-f)>.05&&!n.down29)n.g.position.y=f}}}
/* ---------------------------------------------------------------------
   TRABAJOS [E]: cargas, sabotajes, rescates (con baliza y marcador)
   --------------------------------------------------------------------- */
function work(id,x,z,lbl,dur,fn,o){o=o||{};const S=VY.S;let b=null;const col=o.sec?0x6ac8ff:0xffc850;
 try{if(typeof beacon17==='function')b=beacon17(W(x),fl(x,z),z,col,o.h||3)}catch(e){}
 const w={id,x:W(x),z,lx:x,r:o.r||2.6,lbl,dur:dur||3,fn,sec:!!o.sec,main:!o.sec,done:false,bc:b,ph:S.ph,keep:o.keep||0};S.works.push(w);return w}
function workDone(w){w.done=true;if(w.bc){scene.remove(w.bc.g)}w.bc=null}
function clearWorks(all){const S=VY.S;for(const w of S.works)if(all||!w.keep||w.keep<S.ph||w.done){if(w.bc)scene.remove(w.bc.g);w.bc=null;w.gone=1}S.works=S.works.filter(w=>!w.gone);S.work=null}
function workUpd(dt){const S=VY.S,pp=P.g.position,pr=$e('pr');for(const w of S.works)if(!w.done&&w.bc)try{beaconUpd17(w.bc,time)}catch(e){}
 const w=S.work;if(w){if(HY(pp.x-w.x,pp.z-w.z)>w.r+1.5||L9.cine||w.done){S.work=null;return}w.t+=dt;if(pr)pr.textContent=w.lbl+'… '+bar10(w.t/w.dur);if(w.t>=w.dur){S.work=null;workDone(w);safe(w.fn)}return}
 let nw=null,nd=1e9;for(const x of S.works){if(x.done)continue;const d=HY(pp.x-x.x,pp.z-x.z);if(d<x.r&&d<nd){nd=d;nw=x}}if(nw&&pr)pr.textContent='[E / USAR] '+nw.lbl+(nw.sec?' (opcional)':'')}
/* zona de captura: progresa con el jugador dentro y sin enemigos cerca */
function capZ(key,x,z,r,dur,dt){const S=VY.S,pp=P.g.position,X=W(x);if(HY(pp.x-X,pp.z-z)>r)return(S.cap[key]||0)/dur;let nb=0;for(const e of enemies)if(e.hp>0&&!e.unaware&&HY(e.g.position.x-X,e.g.position.z-z)<r+10)nb++;
 S.cap[key]=Math.min(dur,(S.cap[key]||0)+(nb?(nb<=1?dt*.35:0):dt));if(nb>1)S.sub=' · ¡enemigos en la zona!';return S.cap[key]/dur}
/* ---------------------------------------------------------------------
   ARTILLERÍA CON AVISO
   --------------------------------------------------------------------- */
let RG50=null;
function shell(x,z,o){o=o||{};const S=VY.S;if(!RG50){RG50=new THREE.RingGeometry(.8,1,24);RG50.rotateX(-1.5708)}const r=o.r||4.5,dl=o.dl||2.3,X=o.w?x:W(x);const m=new THREE.Mesh(RG50,new THREE.MeshBasicMaterial({color:o.col||0xff3020,transparent:true,opacity:.5,depthWrite:false}));m.position.set(X,fl(X-S.X,z)+.1,z);m.scale.setScalar(r);scene.add(m);S.sh.push({x:X,z,r,t:dl,d:dl,m,k:o.k||1,foe:!!o.foe,wh:0})}
function shellUpd(dt){const S=VY.S;for(let i=S.sh.length-1;i>=0;i--){const s=S.sh[i];s.t-=dt;s.m.material.opacity=.25+.35*Math.abs(Math.sin((s.d-s.t)*(6+10*(1-s.t/s.d))));s.m.scale.setScalar(s.r*(1-.35*(s.t/s.d)));
 if(!s.wh&&s.t<1.1){s.wh=1;const dd=HY(s.x-P.g.position.x,s.z-P.g.position.z);if(dd<140)try{tn18('sine',1500,420,1.05,.05*Math.max(.2,1-dd/140))}catch(e){}}
 if(s.t<=0){scene.remove(s.m);s.m.material.dispose();S.sh.splice(i,1);safe(()=>boom9(s.x,s.z,s.k,false,s.foe?0xffa050:undefined));if(!s.foe){/* fuego enemigo: daña al jugador (boom9 con allies=false no lo hace) */const dp=HY(P.g.position.x-s.x,P.g.position.z-s.z);if(dp<5*s.k)safe(()=>hitP(26*s.k*(1-dp/(5*s.k)*.5)))}}}}
/* ---------------------------------------------------------------------
   VEHÍCULOS (VEH32): el bando del modelo y el bando real están separados
   --------------------------------------------------------------------- */
function veh(fn,model,ally_,x,z,rot,o){o=o||{};const S=VY.S;try{const F=window[fn]||(typeof VEH32!=='undefined'&&VEH32[fn]);if(typeof F!=='function')return null;const v=o.arg!==undefined?F(o.arg,model):F(model,o.variant);v.ally=!!ally_;vehSpawn32(v,x,z,rot||0);v.v50=1;v.lv50=S.lv;S.veh.push(v);if(o.hp){v.hp*=o.hp;v.maxhp=v.hp}return v}catch(e){safe(()=>{throw e});return null}}
const vAlive=v=>v&&v.alive&&v.on;
/* ---------------------------------------------------------------------
   GRIFOS ALIADOS (AIR38, sólo XX)
   --------------------------------------------------------------------- */
function grif(variant,x,z,o){o=o||{};if(typeof airSpawn38!=='function')return null;try{const a=airSpawn38('g',variant||'line',Object.assign({x,z,force:true,y:o.y||55,noRetreat:true,hdg:o.hdg,rider:true},o));if(a&&a.g){a.v50=1;a.landAt=null;VY.S.air.push(a)}return a}catch(e){safe(()=>{throw e});return null}}
/* ---------------------------------------------------------------------
   FASES · NIVEL XIX «OPERACIÓN ROMPEOLAS»
   --------------------------------------------------------------------- */
const K7=(k,d)=>{try{const v=typeof KP17==='function'?KP17(k):null;if(Array.isArray(v)&&typeof v[0]==='number')return v}catch(e){}return d};
const NMS19={r:'Feldwebel Richter',v:'Gefreiter Voss',w:'Pionier Weber',h:'MG-Schütze Hahn',k:'Mayor Kessler (radio)'};
const PH19=[
/* I · DESEMBARCO DEL FARO */
{init(cp){const S=VY.S;obj('Cruzá la playa y silenciá el nido de ametralladora del faro',94,32);
  /* defensores de playa: existen antes de que el jugador tome el control */
  spE('bar',92,31,{tag:'f0',hold:true,kind:'mg'});spE('mosin',97,26,{tag:'f0',hold:true});spE('mosin',88,36,{tag:'f0'});
  spE('mosin',106,6,{tag:'f0b',kind:'rifle'});spE('mosin',100,14,{tag:'f0b',kind:'sapper'});
  if(DK(0,1,1))spE('stv',112,-6,{tag:'f0b',kind:'rifle'});
  secA(4,[[132,-40],[118,-20],[100,-4],[72,6],[52,8]],{kind:'naval',post:[50,8],tag:'mar'});
  if(!S.sec.radio)S.sec.radio='pend';
  if(S.sec.radio==='pend')work('radio',87,13,'Sabotear la radio costera de Volskaya',3,()=>{S.sec.radio='done';score+=350;feedV('★ Opcional: radio costera fuera de servicio · la Línea de las Tres Cruces no recibe el aviso');talkV([[NMS19.w,'¡Válvulas rotas y antena abajo! Que griten todo lo que quieran.']])},{sec:true,keep:0,r:2.8});
  shipDeco();
  if(!cp||S.ph===0)talkV([[NMS19.r,'¡Fuera de la lancha, Herr Oberleutnant! ¡El faro nos barre la playa!'],[NMS19.k,'Brandt, la radio del puesto de Karsk sigue transmitiendo. Si la callan antes de subir al barranco, la Línea de las Tres Cruces quedará ciega.']])},
 upd(dt){const S=VY.S;
  if(S.st===0){if(left('f0')===0){S.st=1;feedV('★ Nido del faro silenciado');talkV([[NMS19.h,'¡La ametralladora del faro calló! ¡Adelante, hacia el puesto!']]);obj('Tomá el Puesto de Karsk',35,22);
    qE('mosin',[[30,14],[40,16],[44,28]],{tag:'p0',fb:25,goal:[35,20]});qE('mosin',[[28,24],[46,22]],{tag:'p0',hold:true,fb:25});qE('bar',[[22,6],[38,4]],{tag:'p0',kind:'mg',fb:25});qE('stv',[[16,10],[50,-4]],{tag:'p0',kind:'officer',fb:30,goal:[40,12]});if(DK(0,1,1))qE('mosin',[[18,20],[54,30]],{tag:'p0',fb:30})}
   else if(S.T>70&&once('nudge0'))talkV([[NMS19.r,'¡El nido está al pie del faro, al noroeste! ¡Granada y adelante!']])}
  else if(S.st===1){const d=HY(P.g.position.x-W(35),P.g.position.z-22);if(d<16&&left('p0')<=1){S.st=2;feedV('★ Puesto de Karsk tomado');if(S.sec.radio==='pend'){S.sec.radio='lost';const w=S.works.find(x=>x.id==='radio');if(w)workDone(w);feedV('✖ La radio costera transmitió la alarma: la Línea de las Tres Cruces espera el asalto');talkV([[NMS19.k,'Interceptamos la transmisión de Karsk, Brandt. La línea sabe que van. Esperen artillería.']])}later(2.5,()=>go(1,false))}}}},
/* II · BARRANCO SOKOL */
{init(cp){const S=VY.S;obj('Remontá el Barranco Sokol hacia el norte',-36,-182);if(!S.sec.radio||S.sec.radio==='pend')S.sec.radio='lost';
  talkV([[NMS19.r,'Barranco Sokol. Crestas a los dos lados: ¡mirad arriba y no os amontonéis!']])},
 upd(dt){const S=VY.S,pz=P.g.position.z;
  if(pz<-35&&once('r1')){qE('mosin',[[-8,-92],[6,-98],[-16,-104]],{tag:'r1',fb:30,goal:[4,-70]});qE('mosin',[[10,-110],[-20,-96]],{tag:'r1',kind:'observer',hold:true,fb:30});qE('stv',[[-2,-112]],{tag:'r1',fb:30,goal:[6,-70]})}
  if(pz<-80&&once('r2')){qE('mosin',[[-24,-126],[-32,-132],[-12,-136]],{tag:'r2',fb:30,goal:[-10,-105]});qE('bar',[[-30,-150]],{tag:'r2',kind:'mg',hold:true,fb:35});qE('mosin',[[-14,-148],[-40,-140]],{tag:'r2',fb:30});if(DK(0,1,1))qE('stv',[[-26,-158]],{tag:'r2',fb:30,goal:[-20,-120]})}
  if(pz<-122&&once('r3')){qE('bar',[[-37,-180]],{tag:'r3',kind:'mg',hold:true,fb:30});qE('mosin',[[-44,-172],[-30,-188],[-46,-190]],{tag:'r3',fb:30});qE('stv',[[-38,-196]],{tag:'r3',kind:'officer',fb:30,goal:[-34,-160]})}
  const d=HY(P.g.position.x-W(-38),pz+188);if(S.ev.r3&&d<16&&left('r')<=1&&once('done1')){feedV('★ Barranco Sokol asegurado');talkV([[NMS19.v,'¡Salida del barranco limpia! ¡Ya se ven las cruces de la línea!']]);later(2.5,()=>go(2,false))}
  if(S.T>150&&once('n1'))talkV([[NMS19.r,'¡Seguí el cauce hacia el norte, Herr Oberleutnant! ¡Nosotros cubrimos las crestas!']])}},
/* III · LÍNEA DE LAS TRES CRUCES */
{init(cp){const S=VY.S;const CM=(typeof K17!=='undefined'&&K17&&Array.isArray(K17.casemates))?K17.casemates:[{mg:[-68.4,-235.5]},{mg:[11.6,-235.5]},{mg:[81.6,-235.5]}];
  S.cm=CM.map((c,i)=>({i,x:c.mg[0],z:c.mg[1],done:false}));const alarm=S.sec.radio!=='done';
  obj('Volá dos casamatas de la línea con las cargas de Weber',S.cm[0].x,S.cm[0].z+3);
  for(const c of S.cm){spE('bar',c.x,c.z-1.2,{tag:'cm'+c.i,kind:'mg',hold:true});work('cm'+c.i,c.x,c.z+3.2,'Colocar carga en la casamata',3,()=>{feedV('Carga colocada · ¡a cubierto!');later(4,()=>{c.done=true;safe(()=>boom9(W(c.x),c.z,1.6,false));for(const e of foes('cm'+c.i))safe(()=>hurt(e,999,'m'));feedV('★ Casamata destruida');S.flags.cmN=(S.flags.cmN||0)+1})},{r:3})}
  const D=(typeof K17!=='undefined'&&K17&&K17.dugouts)||[[-58,-249],[-30,-249],[14,-249],[44,-249]];
  for(let i=0;i<(alarm?7:5);i++){const d=D[(i*2+1)%D.length];qE(i%3===2?'stv':'mosin',[[d[0],d[1]+2]],{tag:'l',hold:i<3,fb:20,kind:i===0?'officer':'rifle'})}
  if(alarm){qE('bar',[[-30,-244],[40,-244]],{tag:'l',kind:'mg',hold:true,fb:20});S.flags.arty=1}
  const atp=(typeof K17!=='undefined'&&K17&&K17.at&&K17.at[1])||[-10,-235.4];S.atg=veh('atgun32','volsk',false,atp[0],atp[1]-1,Math.PI);if(S.atg)try{gunCrew32(S.atg,{n:2,spawn:(wx,wz)=>spE('mosin',wx-S.X,wz,{tag:'atc',kind:'rifle',hold:true})})}catch(e){}
  S.tank=veh('tank32','veyrn',true,40,-150,Math.PI,{variant:'medium',hp:1.4});if(S.tank)try{vehOrder32(S.tank,{mode:'advance',path:[[40,-180],[38,-210],[30,-226]],speed:2.2})}catch(e){}
  secA(4,[[-60,-196],[-58,-214],[-54,-228]],{kind:'storm',post:[-54,-230],tag:'st'});
  talkV(alarm?[[NMS19.k,'Brandt, la línea está alertada. Van a caer obuses sobre la aproximación: ¡no se queden quietos!'],[NMS19.w,'Tengo cargas para dos casamatas. Llévenme hasta las troneras.']]:[[NMS19.w,'Siguen sin saber que llegamos. Tengo cargas para dos casamatas: ¡a las troneras!'],[NMS19.r,'El Vrak sube por la carretera. ¡Cuidado con el antitanque!']])},
 upd(dt){const S=VY.S,pp=P.g.position;const nd=S.cm.filter(c=>c.done).length;
  if(S.st===0){const nx=S.cm.filter(c=>!c.done).sort((a,b)=>HY(W(a.x)-pp.x,a.z-pp.z)-HY(W(b.x)-pp.x,b.z-pp.z))[0];if(nx)L9.obj=[W(nx.x),nx.z+3];S.ot='Volá dos casamatas de la línea con las cargas de Weber ('+nd+'/2)';
   if(S.flags.arty&&pp.z>-238&&pp.z<-150){S.at-=dt;if(S.at<=0){S.at=DK(9,7,5.5)+R_()*3;shell(pp.x+(R_()-.5)*14+Math.sin(time)*4,pp.z-4-R_()*10,{w:true,r:5,k:1.1})}}
   if(nd>=2){S.st=1;for(const w of S.works)if(!w.done&&/^cm/.test(w.id))workDone(w);obj('Limpiá la trinchera de las Tres Cruces',-2,-247);feedV('★ ¡Brecha abierta en las Tres Cruces!');talkV([[NMS19.h,'¡Dos casamatas menos! ¡A la trinchera!']])}}
  else if(S.st===1){if(left('l')<=2&&once('done2')){S.flags.arty=0;feedV('★ Línea de las Tres Cruces tomada');later(2.5,()=>go(3,false))}}}},
/* IV · DEPÓSITO DE TEREK */
{init(cp){const S=VY.S;obj('Detené el contraataque del 11.º: destruí el autoblindado «Grom»',40,-380);
  S.car=veh('armcar32','volsk',false,44,-440,0,{hp:.85});if(S.car)try{vehOrder32(S.car,{mode:'advance',path:[[42,-400],[40,-350],[30,-320]],speed:3})}catch(e){}
  qE('mosin',[[-20,-380],[-30,-400],[10,-390]],{tag:'c',kind:'r11',fb:25,goal:[-10,-320]});qE('mosin',[[20,-400],[34,-410]],{tag:'c',kind:'r11',fb:25,goal:[10,-320]});qE('stv',[[-6,-410]],{tag:'c',kind:'officer',fb:25,goal:[-6,-330]});qE('bar',[[-40,-390]],{tag:'c',kind:'mg',hold:true,fb:30});if(DK(0,1,1))qE('mosin',[[0,-420],[-50,-410]],{tag:'c',kind:'r11',fb:30,goal:[0,-330]});
  try{if(window.WEAPONS_VGAI&&!(P.weapons&&P.weapons.atrifle)&&!S.atBox){S.atBox=1;WEAPONS_VGAI.buildATContainer(19,W(-3),-293,0)}}catch(e){}
  if(!S.sec.plans)S.sec.plans='pend';
  if(S.sec.plans==='pend')work('plans',-44,-490,'Recuperar los planos de Drovna',3,()=>{S.sec.plans='done';score+=400;feedV('★ Opcional: planos de Drovna · el colector central está marcado: alcanzan 2 cargas');talkV([[NMS19.w,'¡Con estos planos el puerto vuela con dos cargas en el colector!']])},{sec:true,keep:3,r:2.6});
  talkV([[NMS19.r,'¡Blindado en la carretera de Terek! ¡Fusiles al suelo, eso no lo para un V98!'],[NMS19.w,'Dejamos una caja con un AT-18 junto a la vía. ¡Agarralo, Herr Oberleutnant!']])},
 upd(dt){const S=VY.S;
  if(S.st===0){if(vAlive(S.car))L9.obj=[S.car.g.position.x,S.car.g.position.z];if(!vAlive(S.car)&&left('c')<=2){S.st=1;feedV('★ Contraataque detenido');obj('Tomá la estación de Terek',-34,-482);qE('mosin',[[-50,-478],[-20,-500],[-40,-500]],{tag:'d',kind:'r11',fb:20});qE('bar',[[-60,-468]],{tag:'d',kind:'mg',hold:true,fb:20});qE('stv',[[-8,-505]],{tag:'d',fb:20})}
   else if(S.T>100&&vAlive(S.car)&&once('n3'))talkV([[NMS19.w,'¡El AT-18 está en la caja, al sur! ¡O granadas debajo de las ruedas!']])}
  else if(S.st===1){const k=capZ('terek',-34,-482,13,10,dt);S.ot='Tomá la estación de Terek '+bar10(k)+(S.sub||'');S.sub='';if(k>=1&&once('done3')){feedV('★ Estación de Terek en manos de Veyrn');if(S.sec.plans==='pend'){S.sec.plans='lost';feedV('✖ Los planos de Drovna quedaron en la estación')}later(2.5,()=>go(4,false))}}}},
/* V · PUERTO DE DROVNA */
{init(cp){const S=VY.S;if(!S.sec.plans||S.sec.plans==='pend')S.sec.plans='lost';const TK=(typeof K17!=='undefined'&&K17&&Array.isArray(K17.tanks)&&K17.tanks.length>=3)?K17.tanks.map(t=>Array.isArray(t)?t:[t.x,t.z]):[[20,-600],[48,-604],[76,-612],[22,-640],[52,-650],[84,-660],[106,-626]];
  const plans=S.sec.plans==='done';const pick=plans?[TK[1],TK[4]]:[TK[0],TK[1],TK[2]];S.tanks=pick.map((t,i)=>({i,x:t[0],z:t[1],done:false}));
  for(const t of S.tanks)work('tk'+t.i,t.x,t.z+4,'Colocar carga en el depósito de combustible',2.5,()=>{t.done=true;feedV('Carga colocada ('+S.tanks.filter(q=>q.done).length+'/'+S.tanks.length+')')},{r:3.6});
  obj('Colocá cargas en '+S.tanks.length+' depósitos de combustible de Drovna',S.tanks[0].x,S.tanks[0].z+4);
  qE('mosin',[[40,-580],[10,-590],[70,-590]],{tag:'h',fb:20,goal:[30,-575]});qE('mosin',[[100,-610],[120,-640]],{tag:'h',fb:25,kind:'sapper',goal:[60,-600]});qE('bar',[[60,-628]],{tag:'h',kind:'mg',hold:true,fb:25});qE('stv',[[-10,-630],[30,-660]],{tag:'h',fb:25,kind:'officer',goal:[20,-600]});qE('mosin',[[137,-628],[137,-690]],{tag:'h2',fb:40,goal:[80,-620]});
  talkV(plans?[[NMS19.w,'Según los planos: el colector central y el tanque del muelle. Dos cargas y Drovna arde.']]:[[NMS19.w,'Sin planos vamos a ciegas: tres tanques, tres cargas. ¡Cúbranme!']])},
 upd(dt){const S=VY.S,pp=P.g.position,nd=S.tanks.filter(t=>t.done).length;
  if(S.st===0){const nx=S.tanks.filter(t=>!t.done).sort((a,b)=>HY(W(a.x)-pp.x,a.z-pp.z)-HY(W(b.x)-pp.x,b.z-pp.z))[0];if(nx)L9.obj=[W(nx.x),nx.z+4];S.ot='Colocá cargas en los depósitos de combustible ('+nd+'/'+S.tanks.length+')';
   if(nd>=S.tanks.length){S.st=1;S.timer=10;obj('¡Alejate de los depósitos! Detonación',-10,-560);talkV([[NMS19.w,'¡Mechas encendidas! ¡Diez segundos, todos al sur!']])}}
  else if(S.st===1){S.timer-=dt;S.ot='¡Alejate de los depósitos! Detonación en '+Math.max(0,Math.ceil(S.timer))+' s';if(S.timer<=0){S.st=2;S.tanks.forEach((t,i)=>later(i*.45,()=>{safe(()=>boom9(W(t.x),t.z,2.4,false,0xff8a30));safe(()=>{if(typeof fire9==='function')fire9(W(t.x),t.z,3)})}));const dmin=Math.min(...S.tanks.map(t=>HY(pp.x-W(t.x),pp.z-t.z)));if(dmin<10)safe(()=>hitP(45));for(const e of foes('h'))if(Math.min(...S.tanks.map(t=>HY(e.g.position.x-W(t.x),e.g.position.z-t.z)))<14)safe(()=>hurt(e,999,'m'));
    S.blown=1;score+=500;feedV('★ ¡Drovna arde! Depósitos de combustible destruidos');later(3,()=>talkV([[NMS19.k,'Vemos la columna de humo desde la flota. Buen trabajo, Brandt. Ahora: el puente de Orlov, antes de que lo vuelen.']]))}}
  else if(S.st===2){if(left('h')<=1&&S.T>4&&once('done4'))later(3,()=>go(5,false))}}},
/* VI · PUENTE DE ORLOV */
{init(cp){const S=VY.S;const H=K7('heights',[-120,-730]),B=K7('bridge',[-20,-780]);S.B=B;
  S.guns=[veh('fieldgun32','volsk',false,H[0]-4,H[1]+2,-Math.PI/2.4),veh('fieldgun32','volsk',false,H[0]+6,H[1]-6,-Math.PI/2.2)].filter(Boolean);
  S.guns.forEach((g,i)=>{g.fire=false;try{gunCrew32(g,{n:2,spawn:(wx,wz)=>spE('mosin',wx-S.X,wz,{tag:'gc',kind:'rifle',hold:true})})}catch(e){}g.fire=false;work('gun'+i,(g.g.position.x-S.X)+2.2,g.g.position.z+1.5,'Colocar carga en el cañón',2.5,()=>{later(3,()=>{safe(()=>vhVehDmg32(g,1e5,'x',g.g.position.x,g.g.position.z));safe(()=>boom9(g.g.position.x,g.g.position.z,1.3,false))})},{r:3.4})});
  qE('mosin',[[H[0]-10,H[1]+12],[H[0]+12,H[1]+10]],{tag:'ht',fb:20,goal:[H[0]+20,H[1]+20]});qE('bar',[[H[0]+2,H[1]+14]],{tag:'ht',kind:'mg',hold:true,fb:25});qE('stv',[[-40,-740],[-60,-720]],{tag:'ht',fb:25,kind:'officer'});
  obj('Silenciá los cañones de campaña de las alturas',H[0],H[1]);
  talkV([[NMS19.r,'¡Cañones en las alturas del oeste! Mientras disparen, nadie cruza ese puente.'],[NMS19.k,'Brandt: los zapadores de Volskaya cablearon el puente de Orlov. Lo necesitamos entero.']])},
 upd(dt){const S=VY.S,pp=P.g.position;const gl=S.guns.filter(vAlive);
  if(S.st===0){/* los cañones baten la aproximación al puente con aviso */S.at-=dt;if(gl.length&&S.at<=0&&pp.z<-700){S.at=DK(8,6,4.5)+R_()*2.5;shell(pp.x+(R_()-.5)*12,pp.z-(R_()*8),{w:true,r:5,k:1})}
   if(gl.length){const g=gl.sort((a,b)=>HY(a.g.position.x-pp.x,a.g.position.z-pp.z)-HY(b.g.position.x-pp.x,b.g.position.z-pp.z))[0];L9.obj=[g.g.position.x,g.g.position.z];S.ot='Silenciá los cañones de campaña de las alturas ('+(S.guns.length-gl.length)+'/'+S.guns.length+')'}
   if(!gl.length){S.st=1;for(const w of S.works)if(/^gun/.test(w.id)&&!w.done)workDone(w);feedV('★ Cañones de las alturas silenciados');S.timer=DK(200,160,130);
    S.bc=[[S.B[0]-4,S.B[1]+8],[S.B[0]+4,S.B[1]-10]].map((p,i)=>({i,done:false,p}));S.bc.forEach(b=>work('br'+b.i,b.p[0],b.p[1],'Cortar los cables de demolición',2.5,()=>{b.done=true;feedV('★ Carga del puente desactivada')},{r:3}));
    qE('mosin',[[S.B[0]-6,S.B[1]-30],[S.B[0]+6,S.B[1]-34]],{tag:'bz',kind:'sapper',fb:15,goal:[S.B[0],S.B[1]]});qE('stv',[[S.B[0],S.B[1]-40]],{tag:'bz',kind:'sapper',fb:15,goal:[S.B[0],S.B[1]-5]});
    talkV([[NMS19.w,'¡Cables en los dos estribos! ¡Si no los corto en un par de minutos, vuela todo!']])}}
  else if(S.st===1){S.timer-=dt;const nd=S.bc.filter(b=>b.done).length,nx=S.bc.find(b=>!b.done);if(nx)L9.obj=[W(nx.p[0]),nx.p[1]];S.ot='Cortá los cables de demolición del puente ('+nd+'/2) · '+Math.max(0,Math.ceil(S.timer))+' s';
   if(nd>=2){S.st=2;obj('Asegurá la cabeza de puente norte',-20,-845);feedV('★ Puente de Orlov intacto');talkV([[NMS19.r,'¡Puente salvado! ¡A la orilla norte antes de que contraataquen!']]);const N=K7('north',[-20,-845]),E=K7('end',[-20,-920]);
    qE('mosin',[[E[0]-10,E[1]+20],[E[0]+10,E[1]+16],[E[0],E[1]+30]],{tag:'n',kind:'r11',fb:20,goal:[N[0],N[1]]});qE('stv',[[E[0]-16,E[1]+26]],{tag:'n',kind:'r11',fb:20,goal:[N[0],N[1]]});qE('bar',[[E[0]+14,E[1]+30]],{tag:'n',kind:'mg',hold:true,fb:25});qE('mosin',[[E[0],E[1]+10],[E[0]+20,E[1]+12]],{tag:'n',kind:'officer',fb:25,goal:[N[0],N[1]]})}
   else if(S.timer<=0&&once('blow')){safe(()=>boom9(W(S.B[0]),S.B[1],2.6,false));feedV('✖ ¡Volaron el puente de Orlov!');S.failMsg='Volaron el puente de Orlov. Volvés al último punto de control.';later(2.2,()=>fail())}}
  else if(S.st===2){const k=capZ('north',-20,-845,15,18,dt);S.ot='Asegurá la cabeza de puente norte '+bar10(k)+(S.sub||'');S.sub='';if(k>=1&&left('n')<=1&&once('win'))endCine19()}}}
];
function shipDeco(){const S=VY.S;if(S.ships)return;S.ships=[veh('ship32','veyrn',true,232,-40,Math.PI*.95,{arg:'destroyer'}),veh('ship32','veyrn',true,196,30,Math.PI*1.05,{arg:'transport'}),veh('ship32','veyrn',true,215,-140,Math.PI,{arg:'monitor'})].filter(Boolean);for(const v of S.ships){v.fire=false;v.hold=true}}
/* ---------------------------------------------------------------------
   FASES · NIVEL XX «BASTIÓN DE HIERRO»
   --------------------------------------------------------------------- */
const K8=(k,d)=>{try{const v=typeof K18!=='undefined'&&K18?K18[k]:null;if(Array.isArray(v)&&typeof v[0]==='number')return v}catch(e){}return d};
const NMS20={l:'Hauptmann Lindemann',b:'Unteroffizier Becker',h:'Pionier Haas',a:'Schütze Albrecht',k:'Schütze Kroll',g:'Capitán de grifos Aldric'};
const PH20=[
/* I · BOSQUE DE DRAVIK */
{init(cp){const S=VY.S;if(typeof sky18==='function')safe(()=>sky18('dawn'));obj('Eliminá los puestos de escucha de Volskaya en el bosque',-4,-20);
  spE('mosin',-22,-8,{tag:'f',kind:'r12',hold:true});spE('mosin',18,-22,{tag:'f',kind:'winter',hold:true});spE('mosin',-6,-42,{tag:'f',kind:'r12'});if(DK(0,1,1))spE('stv',24,-48,{tag:'f',kind:'winter'});
  talkV([[NMS20.l,'Brandt, bienvenido a Varnholt. Hace dieciocho días el 12.º de Volskaya nos echó de Falkenbrück. Hoy la recuperamos.'],[NMS20.b,'Puestos de escucha entre los pinos. Rápido y en silencio, antes de que levanten el teléfono.']])},
 upd(dt){const S=VY.S;
  if(S.st===0){if(left('f')===0){S.st=1;const C=K8('cabin',[-75,-5]);obj('Cortá el teléfono de campaña de la cabaña de Dravik',C[0]+3,C[1]+3);qE('mosin',[[C[0]-6,C[1]-6],[C[0]+6,C[1]-8]],{tag:'cb',kind:'r12',fb:20});qE('stv',[[C[0]-10,C[1]+4]],{tag:'cb',kind:'r12off',fb:20,goal:[C[0],C[1]]});
    work('tel',C[0]+3,C[1]+3,'Cortar la línea telefónica de campaña',2.5,()=>{feedV('★ Teléfono de Dravik cortado');S.flags.tel=1},{r:2.8});talkV([[NMS20.h,'La línea va a la cabaña del oeste. Si la cortamos, el Muro no sabrá que llegamos.']])}}
  else if(S.st===1){if(S.flags.tel&&left('cb')<=1&&once('done0')){feedV('★ Bosque de Dravik despejado');later(2.5,()=>go(1,false))}}}},
/* II · MURO DE VARN */
{init(cp){const S=VY.S;if(typeof sky18==='function')safe(()=>sky18('morning',4));const LN=(typeof K18!=='undefined'&&K18&&K18.line)||{};const dc=LN.ditchCross||[-35,-172],bk=(LN.bunkers&&LN.bunkers[1])||[-5,-205];S.bk=bk;
  obj('Cruzá el foso por el paso del oeste y tomá la trinchera',dc[0],dc[1]);
  for(let i=0;i<Math.round(DK(5,6,8));i++){const x=-60+i*14;qE(i%3===2?'stv':'mosin',[[x,-192]],{tag:'w',kind:i===0?'r12off':(i%3===2?'winter':'r12'),hold:i<4,fb:20})}
  qE('bar',[[bk[0],bk[1]+1.5]],{tag:'wb',kind:'mg',hold:true,fb:15});
  S.tank=veh('tank32','veyrn',true,6,-96,Math.PI,{variant:'medium',hp:1.4});if(S.tank)try{vehOrder32(S.tank,{mode:'advance',path:[[6,-120],[6,-140]],speed:2})}catch(e){}
  secA(4,[[-50,-120],[-44,-150],[-36,-168]],{kind:'storm',post:[-36,-180],tag:'st'});
  if(!S.sec.obs)S.sec.obs='pend';if(S.sec.obs==='pend'){const H=K8('hillOP',[70,-250]);qE('mosin',[[H[0]-6,H[1]+4],[H[0]+5,H[1]-3]],{tag:'o',kind:'observer',hold:true,fb:30});qE('mosin',[[H[0]+8,H[1]+6]],{tag:'o',kind:'r12',fb:30});
   work('obs',H[0],H[1]+2,'Recalibrar el observatorio de la Cota 214',4,()=>{S.sec.obs='done';score+=350;feedV('★ Opcional: Cota 214 en manos de Veyrn · la artillería apoyará el asalto a la meseta');talkV([[NMS20.h,'¡Enlace con la batería del batallón! Nos van a abrir camino en la meseta.']])},{sec:true,keep:2,r:3})}
  talkV([[NMS20.l,'El Muro de Varn era nuestro. Ahora lo tiene el 12.º. Cruzamos el foso por el paso del oeste.'],[NMS20.b,'La Cota 214, al este, tiene un observatorio. Con él, la artillería nos acompaña hasta la meseta.']])},
 upd(dt){const S=VY.S,pp=P.g.position;
  if(S.st===0){if(pp.z<-184&&left('w')<=2){S.st=1;obj('Volá el búnker central del muro',S.bk[0],S.bk[1]+4);work('bk',S.bk[0],S.bk[1]+4,'Colocar carga en el búnker',3,()=>{later(4,()=>{safe(()=>boom9(W(S.bk[0]),S.bk[1],1.8,false));for(const e of foes('wb'))safe(()=>hurt(e,999,'m'));S.flags.bk=1;feedV('★ Búnker central destruido')})},{r:3.2});talkV([[NMS20.h,'¡El búnker central sigue barriendo la trinchera! Cubrime, pongo la carga.']])}}
  else if(S.st===1){if(S.flags.bk&&left('w')<=2&&once('done1')){feedV('★ Muro de Varn recuperado');talkV([[NMS20.l,'¡El muro vuelve a ser de Veyrn! Ahora la batería de la meseta.']]);later(3,()=>go(2,false))}}
  if(S.T>140&&S.st===0&&once('n1'))talkV([[NMS20.b,'¡El paso está al oeste, junto a los postes! ¡No intentes las alambradas de frente!']])}},
/* III · MESETA DE VARN */
{init(cp){const S=VY.S;if(typeof sky18==='function')safe(()=>sky18('morning',4));if(!S.sec.obs||S.sec.obs==='pend')S.sec.obs='lost';const B=K8('battery',[-40,-405]),FA=K8('farmHouse',[-70,-368]),AA=(typeof K18!=='undefined'&&K18&&K18.aaNests)||[[-95,-420],[30,-385]];S.Bp=B;
  S.guns=[veh('fieldgun32','volsk',false,B[0]-8,B[1],Math.PI),veh('fieldgun32','volsk',false,B[0]+8,B[1]-3,Math.PI)].filter(Boolean);
  S.guns.forEach((g,i)=>{g.fire=false;try{gunCrew32(g,{n:2,spawn:(wx,wz)=>spE('mosin',wx-S.X,wz,{tag:'gc',kind:'frust',hold:true})})}catch(e){}g.fire=false;work('gun'+i,(g.g.position.x-S.X)+2.2,g.g.position.z+1.5,'Colocar carga en el cañón',2.5,()=>{later(3,()=>{safe(()=>vhVehDmg32(g,1e5,'x',g.g.position.x,g.g.position.z));safe(()=>boom9(g.g.position.x,g.g.position.z,1.3,false))})},{r:3.4})});
  S.aa=AA.map((p,i)=>{const e=spE('bar',p[0],p[1],{tag:'aa'+i,kind:'mg',hold:true});return{i,x:p[0],z:p[1],e,done:false}});
  if(typeof AIR38!=='undefined'){AIR38.aa.length=0;for(const a of S.aa)AIR38.aa.push({x:a.x,z:a.z,r:220,rate:.5,dmg:12,on:()=>isV()&&!a.done})}
  qE('mosin',[[B[0]-16,B[1]+18],[B[0]+18,B[1]+14],[B[0],B[1]+24]],{tag:'b',kind:'r12',fb:20,goal:[B[0],B[1]+40]});qE('stv',[[B[0]+4,B[1]+20]],{tag:'b',kind:'winter',fb:20,goal:[B[0],B[1]+50]});qE('mosin',[[B[0]-2,B[1]-10]],{tag:'b',kind:'r12off',fb:25});
  const obs=S.sec.obs==='done';
  if(obs){later(5,()=>{talkV([[NMS20.h,'¡Batería del batallón, fuego sobre las ametralladoras antiaéreas!']]);S.aa.forEach((a,i)=>later(2+i*1.5,()=>{shell(a.x,a.z,{r:6,k:1.6,foe:true,dl:2})}));later(6,()=>{const g=S.guns[0];if(g){shell(g.g.position.x-S.X,g.g.position.z,{r:6,k:1.8,foe:true,dl:2.2});later(2.4,()=>safe(()=>vhVehDmg32(g,1e5,'x',g.g.position.x,g.g.position.z)))}})})}
  /* patrulla aislada en la granja (secundario) */
  if(!S.sec.patrol){S.sec.patrol='pend';S.pat=[ally(FA[0]+1,FA[1]+1,{name:'Schütze Kroll',kind:'rifle'}),ally(FA[0]-1,FA[1]+2,{name:'Gefreiter Mertens',w:'smg',kind:'storm'})];for(const n of S.pat){n.on=false;n.lock=true;n.post50=[n.g.position.x,n.g.position.z];n.pat50=1}
   qE('mosin',[[FA[0]-14,FA[1]-10],[FA[0]+12,FA[1]-12]],{tag:'g',kind:'r12',fb:30,goal:[FA[0],FA[1]]});qE('stv',[[FA[0]-18,FA[1]+6]],{tag:'g',kind:'winter',fb:30,goal:[FA[0],FA[1]]});
   work('pat',FA[0]+2,FA[1]+3,'Reagrupar la patrulla aislada',1.5,()=>{S.sec.patrol='done';score+=400;for(const n of S.pat){n.on=true;n.lock=false;n.sq50=1;n.post50=null}feedV('★ Opcional: patrulla rescatada · Kroll y Mertens se suman a la escuadra');talkV([[NMS20.k,'¡Gracias a Dios! Nos tenían rodeados desde el amanecer. ¡Vamos con ustedes!']])},{sec:true,keep:2,r:3})}
  obj('Silenciá la batería de Volskaya en la meseta',B[0],B[1]);
  talkV(obs?[[NMS20.l,'La artillería tiene los ojos de la Cota 214. Que trabajen ellos primero: después, la batería es nuestra.']]:[[NMS20.l,'Sin el observatorio vamos a pecho descubierto. Antiaéreas a los flancos: mientras vivan, los grifos no bajan.']]);
  if(S.sec.patrol==='pend')later(6,()=>talkV([[NMS20.b,'Radio de la granja, al oeste: una patrulla nuestra sigue rodeada ahí adentro.']]))},
 upd(dt){const S=VY.S,pp=P.g.position;for(const a of S.aa){if(!a.done&&(!a.e||a.e.hp<=0||!enemies.includes(a.e))){a.done=true;feedV('★ Antiaérea silenciada')}}
  if(!S.flags.grif&&S.aa.every(a=>a.done)){S.flags.grif=1;later(3,()=>{grif('line',-120,-160,{y:60});grif('line',-60,-170,{y:70});talkV([[NMS20.g,'¡Cielo limpio sobre la meseta! Escuadrilla de grifos de Veyrn, ¡en picada sobre la batería!']])})}
  const gl=S.guns.filter(vAlive);if(gl.length){const g=gl[0];L9.obj=[g.g.position.x,g.g.position.z]}S.ot='Silenciá la batería de Volskaya en la meseta ('+(S.guns.length-gl.length)+'/'+S.guns.length+')';
  /* la batería bate la meseta mientras viva */S.at-=dt;if(gl.length&&S.at<=0&&pp.z<-280){S.at=DK(10,8,6)+R_()*3;shell(pp.x+(R_()-.5)*14,pp.z-R_()*10,{w:true,r:5})}
  if(!gl.length&&left('b')<=2&&once('done2')){for(const w of S.works)if(/^gun/.test(w.id)&&!w.done)workDone(w);feedV('★ Batería de la meseta destruida');if(S.sec.patrol==='pend'){S.sec.patrol='lost';for(const n of S.pat||[])rmAlly(n);const w=S.works.find(x=>x.id==='pat');if(w)workDone(w);feedV('✖ La patrulla de la granja fue capturada')}later(3,()=>go(3,false))}}},
/* IV · CALLES DE FALKENBRÜCK */
{init(cp){const S=VY.S;if(typeof sky18==='function')safe(()=>sky18('day',5));const PZ=K8('plaza',[0,-650]);
  S.tk=veh('tank32','volsk',false,PZ[0]+6,PZ[1]+12,Math.PI,{variant:'light'});if(S.tk)try{vehOrder32(S.tk,{mode:'patrol',path:[[PZ[0]+6,PZ[1]+20],[PZ[0]-6,PZ[1]-10]],speed:1.6})}catch(e){}
  qE('mosin',[[-14,-590],[14,-596],[0,-606]],{tag:'u',kind:'r12',fb:20,goal:[0,-560]});qE('bar',[[-10,-616]],{tag:'u',kind:'mg',hold:true,fb:20});qE('stv',[[18,-610],[-18,-620]],{tag:'u',kind:'winter',fb:20,goal:[0,-575]});qE('mosin',[[PZ[0]-14,PZ[1]],[PZ[0]+16,PZ[1]+4]],{tag:'u2',kind:'r12',hold:true,fb:30});qE('stv',[[PZ[0],PZ[1]-14]],{tag:'u2',kind:'r12off',fb:30});
  try{if(window.WEAPONS_VGAI&&!(P.weapons&&P.weapons.atrifle)&&!S.atBox){S.atBox=1;WEAPONS_VGAI.buildATContainer(20,W(7),-514,0)}}catch(e){}
  if(S.air.filter(a=>a.alive).length<2){grif('line',-80,-420,{y:65});grif('line',60,-430,{y:75})}
  obj('Destruí el carro «Sokol» que defiende la plaza',PZ[0],PZ[1]);
  talkV([[NMS20.l,'Falkenbrück. Un Sokol domina la plaza: Haas dejó un AT-18 junto a la puerta.'],[NMS20.g,'Grifos sobre la ciudad. Les marcamos el carro.']])},
 upd(dt){const S=VY.S;
  if(S.st===0){if(vAlive(S.tk))L9.obj=[S.tk.g.position.x,S.tk.g.position.z];if(!vAlive(S.tk)){S.st=1;feedV('★ Carro Sokol destruido');obj('Tomá la Plaza de Falkenbrück',0,-650)}else if(S.T>110&&once('n3'))talkV([[NMS20.h,'¡El AT-18 está en la caja junto a la puerta sur! ¡O granadas bajo la oruga!']])}
  else if(S.st===1){const k=capZ('plaza',0,-650,14,12,dt);S.ot='Tomá la Plaza de Falkenbrück '+bar10(k)+(S.sub||'');S.sub='';if(k>=1&&left('u')<=2&&once('done3')){feedV('★ Plaza de Falkenbrück recuperada');later(2.5,()=>go(4,false))}}}},
/* V · PLAYA DE VÍAS */
{init(cp){const S=VY.S;const Y=K8('yard',[-150,-700]),ST=K8('station',[-112,-692]);
  S.guns=[veh('howitzer38','volsk',false,Y[0]+4,Y[1]+6,Math.PI*.8),veh('howitzer38','volsk',false,Y[0]-6,Y[1]-14,Math.PI*.8)].filter(Boolean);
  if(!S.guns.length)S.guns=[veh('fieldgun32','volsk',false,Y[0]+4,Y[1]+6,Math.PI*.8),veh('fieldgun32','volsk',false,Y[0]-6,Y[1]-14,Math.PI*.8)].filter(Boolean);
  S.guns.forEach((g,i)=>{g.fire=false;work('gun'+i,(g.g.position.x-S.X)+2.6,g.g.position.z+2,'Sabotear el obús FRUST',2.5,()=>{later(3,()=>{safe(()=>vhVehDmg32(g,1e5,'x',g.g.position.x,g.g.position.z));safe(()=>boom9(g.g.position.x,g.g.position.z,1.4,false))})},{r:3.6});
   for(let k=0;k<2;k++)spE('mosin',(g.g.position.x-S.X)+(k?-2.5:2.5),g.g.position.z-2,{tag:'fr',kind:'frust',hold:true})});
  qE('mosin',[[ST[0]+6,ST[1]+8],[ST[0]-4,ST[1]+12]],{tag:'y',kind:'r12',fb:20,goal:[-90,-660]});qE('bar',[[ST[0],ST[1]-4]],{tag:'y',kind:'mg',hold:true,fb:20});qE('stv',[[Y[0]+10,Y[1]+20],[Y[0]-4,Y[1]+24]],{tag:'y',kind:'winter',fb:25,goal:[-100,-670]});qE('mosin',[[-152,-742],[-140,-730]],{tag:'y',kind:'r12off',fb:30});
  obj('Saboteá los obuses FRUST de la playa de vías',Y[0],Y[1]);
  talkV([[NMS20.l,'Los obuses FRUST de la playa de vías barren media ciudad. Haas, cargas a los cierres.'],[NMS20.h,'Dos piezas. Llévenme hasta ellas y no van a disparar nunca más.']])},
 upd(dt){const S=VY.S,pp=P.g.position;const gl=S.guns.filter(vAlive);if(gl.length){L9.obj=[gl[0].g.position.x,gl[0].g.position.z]}S.ot='Saboteá los obuses FRUST de la playa de vías ('+(S.guns.length-gl.length)+'/'+S.guns.length+')';
  S.at-=dt;if(gl.length&&S.at<=0){S.at=DK(11,9,7)+R_()*3;shell(pp.x+(R_()-.5)*16,pp.z+(R_()-.5)*16,{w:true,r:5.5,k:1.1})}
  if(!gl.length&&left('y')<=2&&once('done4')){for(const w of S.works)if(/^gun/.test(w.id)&&!w.done)workDone(w);feedV('★ Obuses FRUST destruidos');later(3,()=>go(5,false))}}},
/* VI · CIUDADELA Y PUENTE */
{init(cp){const S=VY.S;const C=K8('citadel',[0,-790]),FP=K8('flagpole',[-20,-792]),BR=(typeof K18!=='undefined'&&K18&&K18.bridges&&K18.bridges[0])||[0,-831];S.C=C;S.FP=FP;S.BR=BR;
  qE('mosin',[[C[0]-14,C[1]+6],[C[0]+14,C[1]+4],[C[0],C[1]+10]],{tag:'c',kind:'r12',fb:20,goal:[C[0],C[1]+30]});qE('bar',[[C[0]+6,C[1]-6]],{tag:'c',kind:'mg',hold:true,fb:20});qE('stv',[[C[0]-8,C[1]-8]],{tag:'c',kind:'r12off',fb:25});qE('mosin',[[C[0]+20,C[1]-4]],{tag:'c',kind:'winter',hold:true,fb:25});
  if(S.air.filter(a=>a.alive).length<2){grif('line',-80,-640,{y:65});grif('heavy',60,-650,{y:75})}
  obj('Asaltá la Ciudadela de Falkenbrück',C[0],C[1]);
  talkV([[NMS20.l,'La ciudadela. El Bastión de Hierro. Cuando la bandera de Veyrn suba ahí, Varnholt sabrá quién manda.']])},
 upd(dt){const S=VY.S,pp=P.g.position;
  if(S.st===0){if(left('c')<=1&&HY(pp.x-W(S.C[0]),pp.z-S.C[1])<20){S.st=1;obj('Izá la bandera de Veyrn en la ciudadela',S.FP[0],S.FP[1]);work('flag',S.FP[0],S.FP[1]+1.5,'Izar la bandera de Veyrn',4,()=>{raiseFlag();S.st=2;S.T=0;feedV('★ La bandera de Veyrn flamea sobre el Bastión de Hierro');talkV([[NMS20.l,'¡Ahí está! ¡Ahora vienen a buscarla: posiciones, contraataque desde el puente!']]);obj('Resistí el contraataque final',S.C[0],S.C[1]);
     const B=S.BR;qE('mosin',[[B[0]-8,B[1]-12],[B[0]+8,B[1]-14],[B[0],B[1]-24]],{tag:'k',kind:'r12',fb:15,goal:[S.C[0],S.C[1]]});qE('stv',[[B[0]-130,B[1]-10],[B[0]+12,B[1]-20]],{tag:'k',kind:'winter',fb:15,goal:[S.C[0],S.C[1]]});qE('mosin',[[B[0]-120,B[1]-14]],{tag:'k',kind:'r12off',fb:20,goal:[S.C[0],S.C[1]]});qE('mosin',[[B[0]+20,B[1]-30],[B[0]-20,B[1]-30]],{tag:'k',kind:'r12',fb:20,goal:[S.C[0],S.C[1]]});
     S.car=veh('armcar32','volsk',false,B[0],B[1]-50,Math.PI*0,{hp:.8});if(S.car)try{vehOrder32(S.car,{mode:'advance',path:[[B[0],B[1]-10],[B[0],B[1]+12]],speed:2.4})}catch(e){}},{r:2.8})}}
  else if(S.st===2){const k=left('k');S.ot='Resistí el contraataque final · quedan '+k+(vAlive(S.car)?' · autoblindado':'');if(vAlive(S.car))L9.obj=[S.car.g.position.x,S.car.g.position.z];else L9.obj=[W(S.C[0]),S.C[1]];
   if((k===0&&!vAlive(S.car))||(S.T>DK(90,120,150)&&k<=2)){S.st=3;obj('Asegurá el puente norte y cortá las cargas',S.BR[0],S.BR[1]);work('brg',S.BR[0],S.BR[1]+3,'Cortar las cargas del puente norte',3,()=>{S.flags.brg=1;feedV('★ Puente norte asegurado');endCine20()},{r:3});talkV([[NMS20.h,'¡Se retiran! ¡Dejaron cargas en el puente norte, voy con vos!']])}}}}
];
function raiseFlag(){const S=VY.S;try{const g=new THREE.Group();g.position.set(W(S.FP[0])+.12,1.6+fl(S.FP[0],S.FP[1]),S.FP[1]);scene.add(g);S.flagG=g;let f=null;try{f=flag38('veyrn',{w:1.8,h:1.3})}catch(e){}if(!f){f=new THREE.Mesh(new THREE.PlaneGeometry(1.8,1.2),new THREE.MeshLambertMaterial({color:0x2a2e34,side:THREE.DoubleSide}));f.position.set(.9,3.2,0)}g.add(f)}catch(e){}}
/* ---------------------------------------------------------------------
   CINEMÁTICAS (cine9, saltables con SALTAR / Enter / Espacio)
   --------------------------------------------------------------------- */
function cineIntro19(f){const X=VY.S.X;const L=K7('light',[95,40]),B=K7('beach',[125,-30]);
 cine9([{d:5,a:[X+300,30,-90],b:[X+250,22,-60],la:[X+B[0],4,B[1]],txt:'GOLFO DE KARSKAYA · 18 DE SEPTIEMBRE DE 1922 · 05:20'},
  {d:5,a:[X+230,9,-10],b:[X+190,7,10],la:[X+L[0],12,L[1]],txt:'La flota de Veyrn abre fuego sobre la costa de Volskaya'},
  {d:5,a:[X+B[0]+10,2.4,B[1]-6],b:[X+B[0]+4,2,B[1]-2],la:[X+B[0]-30,1.5,B[1]+20],txt:'4.º STURMREGIMENT · Oberleutnant Brandt · «Rompeolas» empieza en la arena'}],f,
  [{t:3,fn:()=>safe(()=>boom9(X+L[0]+6,L[1]-10,1.4,false))},{t:5.5,fn:()=>safe(()=>boom9(X+100,8,1.2,false))},{t:7.5,fn:()=>safe(()=>boom9(X+L[0]-12,L[1]-4,1.6,false))},{t:12,fn:()=>safe(()=>boom9(X+108,-2,1,false))}])}
function cineIntro20(f){const X=VY.S.X;const S=VY.S;later(.3,()=>{grif('scout',-140,140,{y:45,hdg:Math.PI});grif('line',-110,170,{y:55,hdg:Math.PI})});
 cine9([{d:5,a:[X-60,40,110],b:[X-20,30,80],la:[X+10,4,10],txt:'DISTRITO DE VARNHOLT · 9 DE FEBRERO DE 1923 · 05:30'},
  {d:5,a:[X+20,14,30],b:[X-10,20,0],la:[X,8,-190],txt:'Dieciocho días después de perder Falkenbrück, Veyrn vuelve'},
  {d:5,a:[X+3,1.9,46],b:[X+1,1.8,42],la:[X,1.5,10],txt:'Leutnant Brandt y el batallón de asalto de Lindemann · «Bastión de Hierro»'}],f)}
function endCine19(){const S=VY.S,X=S.X,B=S.B||[-20,-780];S.st=9;obj('');talkV([[NMS19.k,'Aquí Kessler: la columna cruza el puente de Orlov. El corredor de Karsk es de Veyrn. Bien hecho, Brandt.']],true);
 const v=veh('tank32','veyrn',true,B[0],B[1]+50,Math.PI,{variant:'medium'});if(v)try{v.fire=false;vehOrder32(v,{mode:'advance',path:[[B[0],B[1]],[B[0],B[1]-60]],speed:3})}catch(e){}
 cine9([{d:5.5,a:[X+B[0]+30,14,B[1]-10],b:[X+B[0]+20,10,B[1]-30],la:[X+B[0],2,B[1]],txt:'PUENTE DE ORLOV · 11:40'},{d:5.5,a:[X+B[0]+12,3,B[1]-60],la:[X+B[0],2,B[1]],txt:'Los blindados de Veyrn cruzan intactos hacia el norte'},{d:6,a:[X+B[0]+40,30,B[1]-90],b:[X+B[0]+20,60,B[1]-160],la:[X+B[0],0,B[1]],txt:'MISIÓN COMPLETADA · OPERACIÓN ROMPEOLAS'}],()=>{safe(()=>{$e('fade12').style.opacity=1});setTimeout(()=>{if(level===19)end(true)},900)})}
function endCine20(){const S=VY.S,X=S.X,C=S.C||[0,-790];S.st=9;obj('');talkV([[NMS20.l,'A todas las unidades: el Bastión de Hierro es de Veyrn. Varnholt vuelve a casa.']],true);
 if(S.air.filter(a=>a.alive).length<2){grif('line',-60,-700,{y:50});grif('captain',40,-720,{y:60})}
 cine9([{d:5.5,a:[X+C[0]+24,8,C[1]+30],b:[X+C[0]+14,12,C[1]+16],la:[X+(S.FP?S.FP[0]:-20),5,S.FP?S.FP[1]:-792],txt:'FALKENBRÜCK · 9 DE FEBRERO DE 1923 · 14:10'},{d:5.5,a:[X+C[0]-30,22,C[1]+60],la:[X+C[0],18,C[1]],txt:'Los grifos de Veyrn sobrevuelan la ciudadela recuperada'},{d:6,a:[X+C[0]+60,40,C[1]+120],b:[X+C[0]+30,70,C[1]+200],la:[X+C[0],0,C[1]],txt:'MISIÓN COMPLETADA · BASTIÓN DE HIERRO'}],()=>{safe(()=>{$e('fade12').style.opacity=1});setTimeout(()=>{if(level===20)end(true)},900)})}
/* ---------------------------------------------------------------------
   CICLO: fx + lógica por fase
   --------------------------------------------------------------------- */
function fx(dt,cine){const S=VY.S;if(S.tq.length){for(const q of S.tq)q.t-=dt;const due=S.tq.filter(q=>q.t<=0);if(due.length){S.tq=S.tq.filter(q=>q.t>0);for(const q of due)safe(q.f)}}
 if(L13.tq&&L13.tq.length){for(const q of L13.tq)q.t-=dt;const due=L13.tq.filter(q=>q.t<=0);if(due.length){L13.tq=L13.tq.filter(q=>q.t>0);for(const q of due)safe(q.f)}}
 skyMesh.position.copy(cam.position);if(cine){safe(updParts,dt);safe(updRag,dt)}safe(smokeUpd,dt);safe(tracerUpd,dt);safe(fireUpd,dt);safe(lightsUpd,dt);safe(fbUpd12,dt);if(L9.tick)safe(L9.tick,dt);else safe(npcUpd11,dt);if(!cine)safe(dlgUpd,dt);shellUpd(dt);
 safe(vehUpd32,dt);if(S.lv===20&&typeof airUpd38==='function'){AIR38.fr++;safe(airUpd38,dt)}
 if(S.lv===19&&typeof W17!=='undefined'&&W17.built){if(W17.sl&&W17.sl.m)W17.sl.m.visible=true;if(skyMesh)skyMesh.scale.setScalar(2.4);safe(weather17,dt)}
 else if(S.lv===20&&typeof W18!=='undefined'&&W18.built){W18.skyS=1;if(skyMesh)skyMesh.scale.setScalar(2.4);if(W18.cull){const lim=(W18.fogF||280)*1.05;S.cr=(S.cr||0)+1;if(S.cr%3===0)for(const cq of W18.cull)cq.m.visible=HY(cq.c.x-cam.position.x,cq.c.z-cam.position.z)-cq.r<lim}if(scene.fog){scene.fog.near=W18.fogN||12;scene.fog.far=W18.fogF||260;scene.fog.color.setHex(W18.fogC||0x2c3650)}safe(weather18,dt)}}
function tick(dt){const S=VY.S,t0=performance.now();S.los=0;S.T+=dt;fx(dt,false);allyUpd(dt);pump(dt);tac(dt);
 const PH=S.lv===19?PH19:PH20;if(S.st<9)safe(()=>PH[S.ph].upd(dt));workUpd(dt);
 const pp=P.g.position;if(!isFinite(pp.x)||!isFinite(pp.z)){const c=CP[S.lv][S.cpPh];pp.set(W(c[0]),0,c[1]);P.vy=0}
 if(S.lv===19){pp.x=CL30(pp.x,W(-215),W(255));pp.z=CL30(pp.z,-975,95)}else{pp.x=CL30(pp.x,W(-315),W(315));pp.z=CL30(pp.z,-915,118)}
 const f=fl(pp.x-S.X,pp.z);if(pp.y<f){pp.y=f;P.vy=Math.max(0,P.vy);P.gnd=true}
 if(!L9.cine){const o=$e('obj');if(o)o.textContent=S.ot;if(!P.mg){const w=P.weapons[P.cur];const a=$e('ammo');if(a&&w)a.textContent=(WN[P.cur]||'')+(P.rel>0?' · RECARGANDO':' · '+w.mag+' / '+w.reserve)+' · GRANADAS '+P.grenades}
  const el=$e('gar');if(el){const n=S.all.filter(n=>n.sq50&&!n.gone50).length,sec=S.works.filter(w=>w.sec&&!w.done).map(w=>w.lbl);el.style.display='block';el.innerHTML=(S.lv===19?'ESCUADRA DE BRANDT ':'ESCUADRA DE LINDEMANN ')+'<b>'+n+'</b> · ORDEN: '+({follow:'SEGUIR',advance:'AVANZAR',hold:'MANTENER'}[AI30.ord]||'SEGUIR')+' (T/ORD)'+(sec.length?'<br><span style="color:#8ad0ff">◇ OPCIONAL: '+sec.join(' · ')+'</span>':'')}}
 const ms=performance.now()-t0;S.dbg.ms+=ms;S.dbg.n++;if(ms>S.dbg.msMax)S.dbg.msMax=ms}
/* ---------------------------------------------------------------------
   FASES: entrada, limpieza, punto de control
   --------------------------------------------------------------------- */
function clearPhase(full){const S=VY.S;for(const e of[...enemies])despawn(e);S.q.length=0;S.grp={};for(const s of S.sh){scene.remove(s.m)}S.sh.length=0;
 for(const n of S.secA)rmAlly(n);S.secA=[];S.all=S.all.filter(n=>!n.gone50);
 for(const v of S.veh){if(v.ship&&!full)continue;try{if(v.g.parent)v.g.parent.remove(v.g);v.on=false;if(v.ob){const i=obstB.indexOf(v.ob);if(i>=0)obstB.splice(i,1);v.ob=null}if(v.hit){const i=HIT9.indexOf(v.hit);if(i>=0)HIT9.splice(i,1);v.hit=null}const i=VEH32.list.indexOf(v);if(i>=0)VEH32.list.splice(i,1);for(const f of v.fires||[]){if(f.g.parent)f.g.parent.remove(f.g);const k=FIRES.indexOf(f);if(k>=0)FIRES.splice(k,1)}}catch(e){}}
 S.veh=[];S.ships=null;S.guns=[];S.tank=S.car=S.tk=S.atg=null;clearWorks(true);if(S.lv===20&&typeof airClear38==='function'){safe(airClear38);S.air=[];if(typeof AIR38!=='undefined')AIR38.aa.length=0}}
function softClear(){/* transición sin corte: los enemigos lejanos o fuera de cámara de la fase anterior se retiran */const S=VY.S;for(const e of[...enemies]){if(e.hp<=0)continue;const d=HY(e.g.position.x-P.g.position.x,e.g.position.z-P.g.position.z);if(d>45||!vis(e.g.position.x,e.g.position.z))despawn(e)}S.q.length=0;
 for(const n of S.secA){if(!vis(n.g.position.x,n.g.position.z))rmAlly(n);else{n.route50=null;n.post50=null;n.wait50=0}}S.secA=S.secA.filter(n=>!n.gone50);S.all=S.all.filter(n=>!n.gone50);clearWorks(false)}
function go(ph,cp,intro){const S=VY.S;const PH=S.lv===19?PH19:PH20;
 if(cp){clearPhase(false);S.cpPh=ph;const c=CP[S.lv][ph];P.g.position.set(W(c[0]),fl(c[0],c[1]),c[1]);P.vy=0;P.mvx=P.mvz=0;yaw=c[2];pitch=0;placeSquad(c[0],c[1],c[2]);S.cap={};S.flags.arty=0}
 else{softClear();S.cpPh=ph;try{localStorage.setItem(S.lv===19?'rompeolas_vgai_cp':'bastion_vgai_cp',String(Math.max(ph,+(localStorage.getItem(S.lv===19?'rompeolas_vgai_cp':'bastion_vgai_cp')||0))))}catch(e){}}
 S.ph=ph;S.T=0;S.st=0;S.ev={};S.at=4;S.sub='';
 if(S.lv===19&&(ph===0||cp))shipDeco();
 safe(()=>PH[ph].init(cp));
 const t=TITLE[S.lv][ph];if(!intro)safe(()=>story((S.lv===19?'XIX':'XX')+' · '+t[0]+' · '+t[1]+' — '+t[2]));if(!intro)later(4.5,()=>safe(()=>{if(!L9.cine)story('')}))}
function fail(){const S=VY.S;if(!isV())return;S.deaths++;safe(()=>say(S.failMsg||'Misión fallida.',3.5));go(S.cpPh,true);S.failMsg=''}
/* ---------------------------------------------------------------------
   INICIO Y SALIDA DEL NIVEL
   --------------------------------------------------------------------- */
function start(lv){const g=f=>{try{f()}catch(e){}};
 level=lv;g(()=>{if(typeof N17!=='undefined'&&N17.on)leave17()});g(()=>{if(typeof N18!=='undefined'&&N18.on)leave18()});
 clearStage();const X=lv===19?X17:X18;g(()=>{VEH32.origin(X);VEH32.floor=lv===20?(x,z)=>floor18(x-X18,z):null});
 WC.x=X+(lv===19?20:0);WC.z=lv===19?-440:-400;WC.r=lv===19?680:950;g(()=>{mobs.forEach(m=>scene.remove(m.g));mobs=[]});g(()=>{convoy.forEach(v=>scene.remove(v.g));convoy=[]});g(()=>{npcs.forEach(n=>scene.remove(n.g));npcs=[]});
 g(lightsInit);g(()=>{for(const p of LT.pts)p.on=false});g(()=>searchSet(false));g(()=>{for(const s of GAR)scene.remove(s.g);GAR.length=0});g(()=>{for(const c of CAV)if(c.g)scene.remove(c.g);CAV.length=0;CAVS.st='off'});
 L9.tgts=[];L9.def=false;L9.obj=null;L9.cine=0;g(()=>{if(L10.eis)eisOff()});g(()=>{if(L12.skin)leave12()});g(()=>{if(L13.on)leave13()});g(()=>{if(L14.on)leave14()});g(()=>{if(typeof L28!=='undefined'&&L28.on)leave28()});g(()=>{if(N16.on)leave16()});
 g(()=>allies.forEach(a=>{if(a.name)a.g.visible=false}));g(()=>{if(officer)officer.g.visible=false});g(()=>{if(MED)MED.g.visible=false});g(vmInit13);g(fbInit12);
 /* restos de una partida anterior del mismo nivel */if(VY.S){g(()=>clearPhase(true));for(const n of VY.S.all)rmAlly(n)}
 const M=window.VEYRN_MISSIONS_VGAI,N=M?(lv===19?M.N19:M.N20):null;if(N){N.built=true;N.on=false;N.works.length=0}
 if(lv===19){g(()=>{if(!W17.built)buildKarsk17()});g(sky17);g(()=>{if(W17.sl&&W17.sl.m)W17.sl.m.visible=true;skyMesh.scale.setScalar(2.4);W17.skyS=1})}
 else{g(()=>{if(!W18.built)buildVarn18()});g(()=>sky18('dawn'));g(()=>{W18.skyS=1})}
 VY.w0=VY.w0||JSON.parse(JSON.stringify(P.weapons));refill(0);Object.assign(P.weapons.rifle,{mag:5,max:5,reserve:45,cd:.52,dmg:46,reload:2.2,fov:4});Object.assign(P.weapons.smg,{mag:32,max:32,reserve:96,cd:.085,dmg:18,reload:2.1,fov:1});Object.assign(P.weapons.revolver,{mag:8,max:8,reserve:32,cd:.3,dmg:35,reload:1.9,fov:4});P.cur='rifle';P.grenades=3;P.hp=100;
 VY.fpv0=fpv;fpv=true;cam.far=lv===19?1400:1150;cam.updateProjectionMatrix();L9.fog=null;$e('tc').style.display='block';playing=true;g(ambStart);P.g.visible=true;$e('fade12').style.opacity=0;L13.tq=[];L13.ev={};L13.sneak=false;L13.loud=true;AI30.ord='follow';g(lvl35);
 if(lv===20&&typeof AIR38!=='undefined'){g(()=>AIR38.origin(X18));g(airClear38);AIR38.landSites=[];VY.gf0=AIR38.gfire;AIR38.gfire=false;AIR38.aa.length=0}
 VY.S=newS(lv);VY.on=true;VY.lv=lv;mkSquad();g(()=>{if(window.DOORS_VGAI)window.DOORS_VGAI.ensureDoorsForLevel(lv)});
 const cp=+(($e('cp'+lv)||{}).value||0);go(cp,true,cp===0);
 if(cp===0){VY.S.introSeen=1;(lv===19?cineIntro19:cineIntro20)(()=>{const t=TITLE[lv][0];safe(()=>story((lv===19?'XIX':'XX')+' · '+t[0]+' · '+t[1]));later(4,()=>safe(()=>{if(!L9.cine)story('')}))})}}
function leave(){const S=VY.S;VY.on=false;if(VY.w0)for(const k in VY.w0)if(P.weapons[k])Object.assign(P.weapons[k],VY.w0[k]);if(VY.fpv0!==undefined)fpv=VY.fpv0;
 try{if(S&&S.lv===20){AIR38.gfire=VY.gf0!==undefined?VY.gf0:true;AIR38.aa.length=0;airClear38()}}catch(e){}try{VEH32.floor=null;VEH32.origin(X17)}catch(e){}const el=$e('gar');if(el)el.style.display='none'}
/* ---------------------------------------------------------------------
   ENVOLTORIOS (sólo actúan en 19/20 con la dirección v50 activa)
   --------------------------------------------------------------------- */
function wrap(name,mk){const f=window[name];if(typeof f!=='function'||f._v50)return;const nf=mk(f);nf._v50=1;window[name]=nf}
function install(){if(VY.hooked)return;VY.hooked=true;
 wrap('update',_u=>function(dt){
  if(isV()&&playing&&L9.cine){V16.dt=dt;time+=dt;cine9Upd(dt);fx(dt,true);try{mm27(dt)}catch(e){}return}
  if(VY.on&&level!==VY.lv)leave();
  _u(dt);if(!playing||!isV())return;tick(dt);cam.position.y+=P.g.position.y;vm(dt)});
 wrap('respawnP',_r=>function(){if(!isV())return _r.apply(this,arguments);const lv=level;level=0;try{_r.apply(this,arguments)}finally{level=lv}P.pr=false;P.cover=null;VY.S.work=null;VY.S.deaths++;go(VY.S.cpPh||0,true);safe(()=>say('Punto de control.',1.6))});
 wrap('interact',_i=>function(){if(isV()&&playing){if(L9.cine)return;if(P.mg)return _i.apply(this,arguments);const S=VY.S;if(S.work){S.work=null;return}const pp=P.g.position;let b=null,bd=1e9;for(const w of S.works){if(w.done)continue;const d=HY(pp.x-w.x,pp.z-w.z);if(d<w.r&&d<bd){bd=d;b=w}}if(b){S.work=Object.assign(b,{t:0});return}}return _i.apply(this,arguments)});
 wrap('fire',_f=>function(){if(isV()&&playing){if(L9.cine)return;if(P.mg)return _f.apply(this,arguments);const n=bullets.length;const r=_f.apply(this,arguments);if(bullets.length>n){try{VM13.k=1;VM13.sl=1;vmShell13()}catch(e){}}return r}return _f.apply(this,arguments)});
 wrap('swap',_s=>function(){if(isV()&&playing){if(L9.cine||P.mg)return;const A=['rifle','smg','revolver'];if(P.weapons.atrifle)A.push('atrifle');P.cur=A[(A.indexOf(P.cur)+1)%A.length];P.rel=0;P.reloading=null;try{VM13.lift=0}catch(e){}return}return _s.apply(this,arguments)});
 wrap('throwG',_t=>function(){if(isV()&&(L9.cine||P.mg))return;return _t.apply(this,arguments)});
 wrap('hitP',_h=>function(d){if(isV()){if(L9.cine)return;try{VM13.hit=1}catch(e){}d*=DK(.6,.85,1.1)}return _h.call(this,d)});
 wrap('kill',_k=>function(e){if(isV()&&e&&!e.k50){e.k50=1;VY.S.kills++;const g=VY.S.grp[e.t13];if(g)g.k++}return _k.apply(this,arguments)});
 wrap('allyUpdate',_a=>function(dt){if(isV()){for(const a of allies)if(a.name)a.g.visible=false;if(officer)officer.g.visible=false;return}return _a.apply(this,arguments)});
 wrap('medUpd',_m=>function(dt){if(isV()){if(MED)MED.g.visible=false;return}return _m.apply(this,arguments)});
 wrap('aiTick20',_a=>function(dt){if(isV())return;return _a.apply(this,arguments)});
 wrap('orderLt',_o=>function(){if(isV()&&playing){const lv=level;level=16;try{_o()}finally{level=lv}return}return _o.apply(this,arguments)});
 wrap('boom',_b=>function(pos){const r=_b.apply(this,arguments);if(isV()&&pos){try{hitSplash9(pos.x,pos.z,4.5,380,'x')}catch(e){}}return r});
 wrap('end',_e=>function(w){if(!(isV()&&w))return _e.apply(this,arguments);const S=VY.S;const r=_e.apply(this,arguments);playing=false;safe(()=>{$e('fade12').style.opacity=0});const el=$e('gar');if(el)el.style.display='none';endScreen(S);return r});
 wrap('mm27',_m=>function(dt){const r=_m.apply(this,arguments);if(isV()&&playing&&!L9.cine)safe(secMarks);return r});
 /* sólo grifos de Veyrn aliados en el XX: buscan infantería y blindados de Volskaya */
 wrap('gTgt38',_g=>function(a){if(!(isV()&&VY.S.lv===20&&a&&a.side==='veyrn'))return _g.apply(this,arguments);const p=a.p;let best=null,bs=0;for(const e of enemies){if(e.hp<=0||!e.g.parent)continue;const q=e.g.position,d=HY(q.x-p.x,q.z-p.z);if(d>520)continue;let n=0;for(const b of VY.S.air)if(b!==a&&b.tg&&b.tg.o===e)n++;const s=1/(1+d/180)-.3*n+(e.hold?.15:0);if(s>bs){bs=s;best={k:'en',o:e}}}for(const v of VEH32.list){if(!v.alive||!v.on||v.ally)continue;const q=v.g.position,d=HY(q.x-p.x,q.z-p.z);if(d>520)continue;const s=1.4/(1+d/180);if(s>bs){bs=s;best={k:'veh',o:v}}}return best});
 wrap('claw38',_c=>function(a,t){if(isV()&&t&&t.k==='en'){const e=t.o;try{scr38(a.p.x,a.p.z,.5);burst(e.g.position.x,e.g.position.y+1,e.g.position.z,0x8a1a10,6,.4,4);hurt(e,150*(a.K.dmg||1),'m',{name:'Un grifo de Veyrn'});if(e.hp<=0&&enemies.includes(e))kill(e)}catch(er){}return}return _c.apply(this,arguments)});
 wrap('pistol38',_p=>function(a,t){if(isV()&&t&&t.k==='en'){a.fireT=.3;a.pst++;const e=t.o;try{const o=a.p.clone();o.y+=1.6*a.S;trc16(o,e.g.position.clone().setY(e.g.position.y+1.2),0xffe8b0);npcShot('pistol',a.p.x,a.p.z);if(R_()<.35){hurt(e,34,'b',{name:'Un caballero grifo'});if(e.hp<=0&&enemies.includes(e))kill(e)}}catch(er){}return}return _p.apply(this,arguments)});
 wrap('airDmg38',_d=>function(a,d,kind,by,zone){if(isV()&&VY.S.lv===20&&a&&a.side==='veyrn'&&(by==='p'||by==='a'))return 0;return _d.apply(this,arguments)});
 /* viewmodel 13+: dibujar también en 19/20 */
 try{if(typeof rend!=='undefined'&&!rend._v50){const _rr=rend.render.bind(rend);rend.render=function(s,c,...a){_rr(s,c,...a);if(s===scene&&isV()&&VM13.on&&VM13.scene){VM13.cam.aspect=cam.aspect;VM13.cam.updateProjectionMatrix();const ac=rend.autoClear;rend.autoClear=false;rend.clearDepth();_rr(VM13.scene,VM13.cam);rend.autoClear=ac}};rend._v50=1}}catch(e){}
 if(typeof VEH32!=='undefined'&&!VEH32._v50){VEH32._v50=1;const pa=VEH32.allies;VEH32.allies=()=>isV()?VY.S.all.filter(n=>!n.gone50&&n.g.visible):(pa?pa():((typeof L13!=='undefined'&&L13.sq)||[]))}
 if(typeof VM32!=='undefined'&&VM32.pal){VM32.pal[19]={gl:0x2e2a24,sl:0x40454c};VM32.pal[20]={gl:0x2a2622,sl:0x3c4148}}
 try{AMBL[19]=['wind','arty','wind','arty','wind'];AMBL[20]=['wind','arty','wind','bell','arty']}catch(e){}
 /* saltar cinemáticas en 19/20 (LX() del motor no las incluye) */
 const sk=$e('skip');if(sk)sk.addEventListener('click',()=>{if(isV()&&L9.cine)L9.skip=1});addEventListener('keydown',e=>{if(isV()&&L9.cine&&(e.code==='Enter'||e.code==='Space'||e.code==='Escape')){L9.skip=1;e.preventDefault()}});
 /* menú: #go para 19/20 pasa por esta dirección */
 const go_=$e('go'),lvs=$e('lvsel');if(go_&&lvs&&!go_._v50){const _g=go_.onclick;go_.onclick=function(){const v=lvs.value;if(v!=='19'&&v!=='20')return _g?_g.apply(this,arguments):undefined;const lv=+v;
  const M=window.VEYRN_MISSIONS_VGAI;const other=(typeof N16!=='undefined'&&N16.built)||(typeof L12!=='undefined'&&L12.built)||(typeof N17!=='undefined'&&N17.built)||(typeof N18!=='undefined'&&N18.built)||(M&&(lv===19?M.N20.built:M.N19.built));
  if(other){try{sessionStorage.setItem(lv===19?'sel19':'sel20',($e('cp'+lv)||{}).value||'0')}catch(e){}location.reload();return}
  try{if(typeof V20!=='undefined'&&$e('ps2fog'))V20.ps2=$e('ps2fog').value;if($e('difficulty'))difficulty=$e('difficulty').value;ac=new(window.AudioContext||window.webkitAudioContext)();if(ac.state==='suspended')ac.resume();startMusic()}catch(e){}
  $e('menu').style.display='none';P.g.visible=true;cam.fov=65;cam.updateProjectionMatrix();start(lv);try{rend.domElement.requestPointerLock()}catch(e){}};go_._v50=1}
 /* texto de los puntos de control con nombre y hora */
 for(const lv of[19,20]){const s=$e('cp'+lv);if(s)TITLE[lv].forEach((t,i)=>{if(s.options[i])s.options[i].textContent=t[0]+' · '+t[1]+' · '+t[2]+(i?'':' (misión completa)')})}}
function vm(dt){const lv=level,on0=typeof N18!=='undefined'?N18.on:false,p18=VM32&&VM32.pal?VM32.pal[18]:null;try{level=18;if(typeof N18!=='undefined')N18.on=true;if(p18)VM32.pal[18]=VM32.pal[lv];vmUpd13(dt)}catch(e){}finally{level=lv;if(typeof N18!=='undefined')N18.on=on0;if(p18)VM32.pal[18]=p18}}
/* marcadores de secundarios (rombo celeste) en minimapa y brújula */
function secMarks(){const S=VY.S,L=S.works.filter(w=>w.sec&&!w.done);if(!L.length)return;const c=$e('mm27'),k=$e('cp27');if(!c||!k)return;const pp=P.g.position;const d=new THREE.Vector3();cam.getWorldDirection(d);const hd=Math.atan2(d.x,-d.z),fx=Math.sin(hd),fz=-Math.cos(hd),rx=Math.cos(hd),rz=Math.sin(hd);
 const x=c.getContext('2d'),C=150,s=C/50;x.save();x.setTransform(1,0,0,1,0,0);
 for(const w of L){const dx=w.x-pp.x,dz=w.z-pp.z;let px=C+(dx*rx+dz*rz)*s,py=C-(dx*fx+dz*fz)*s;const ox=px-C,oy=py-C,od=HY(ox,oy),lim=C-16;if(od>lim){px=C+ox/od*lim;py=C+oy/od*lim}x.fillStyle='#6ac8ff';x.strokeStyle='#0a2a40';x.lineWidth=2;x.beginPath();x.moveTo(px,py-9);x.lineTo(px+7,py);x.lineTo(px,py+9);x.lineTo(px-7,py);x.closePath();x.fill();x.stroke()}x.restore();
 const cx=k.getContext('2d'),CW=880,hdg=hd*57.2958;cx.save();for(const w of L){const b=Math.atan2(w.x-pp.x,-(w.z-pp.z))*57.2958;let rel=((b-hdg)%360+540)%360-180;if(Math.abs(rel)>55)continue;const X=CW/2+(rel/55)*(CW/2-36);cx.fillStyle='#6ac8ff';cx.beginPath();cx.moveTo(X,18);cx.lineTo(X+7,28);cx.lineTo(X,38);cx.lineTo(X-7,28);cx.closePath();cx.fill()}cx.restore()}
/* pantalla final */
function endScreen(S){const h1=document.querySelector('#menu h1'),tx=$e('tx');const mins=Math.max(1,Math.round((time-(S.t0||time))/60));const yn=(v,a,b)=>v==='done'?'<b style="color:#9ad07a">'+a+'</b>':'<b style="color:#d08a6a">'+b+'</b>';const sq=S.all.filter(n=>n.sq50&&!n.gone50).map(n=>n.name.split(' ').pop());
 if(S.lv===19){if(h1)h1.textContent='OPERACIÓN ROMPEOLAS';if(tx)tx.innerHTML='<b style="font-size:19px;color:#e0b050">XIX · VICTORIA DE VEYRN · EL CORREDOR DE KARSK ES NUESTRO</b><br><br>• Bajas de Volskaya: <b>'+S.kills+'</b> · caídas propias: <b>'+S.deaths+'</b> · escuadra: <b>'+(sq.join(', ')||'—')+'</b><br>• Radio costera: '+yn(S.sec.radio,'saboteada (la línea no recibió el aviso)','transmitió (artillería sobre las Tres Cruces)')+'<br>• Planos de Drovna: '+yn(S.sec.plans,'capturados (2 cargas en vez de 3)','perdidos')+'<br>• Depósitos de Drovna: <b>'+(S.blown?'destruidos':'—')+'</b> · Puente de Orlov: <b style="color:#9ad07a">intacto</b><br>• Tiempo de operación: <b>'+mins+' min</b><br><br><i>«La arena de Karsk quedó atrás. El viento del golfo no lleva nombres, pero hoy llevó los nuestros hasta Orlov. Próximo destino: Varnholt.» — Oberleutnant Brandt</i><br><br><b style="font-size:20px;color:#e0b050">PUNTUACIÓN: '+score+'</b>';try{localStorage.setItem('rompeolas_vgai','1')}catch(e){}}
 else{if(h1)h1.textContent='BASTIÓN DE HIERRO';if(tx)tx.innerHTML='<b style="font-size:19px;color:#e0b050">XX · VICTORIA DE VEYRN · FALKENBRÜCK VUELVE A CASA</b><br><br>• Bajas de Volskaya: <b>'+S.kills+'</b> · caídas propias: <b>'+S.deaths+'</b> · escuadra final: <b>'+(sq.join(', ')||'—')+'</b><br>• Observatorio de la Cota 214: '+yn(S.sec.obs,'recalibrado (la artillería abrió la meseta)','perdido')+'<br>• Patrulla de la granja: '+yn(S.sec.patrol,'rescatada (Kroll y Mertens con nosotros)','capturada')+'<br>• Bandera de Veyrn sobre la ciudadela: <b style="color:#9ad07a">izada</b> · puente norte: <b style="color:#9ad07a">asegurado</b><br>• Tiempo de combate: <b>'+mins+' min</b><br><br><i>«Dieciocho días tardamos en volver. El Bastión de Hierro no es la piedra de la ciudadela: son los que la recuperaron.» — Hauptmann Lindemann</i><br><br><b style="font-size:20px;color:#e0b050">PUNTUACIÓN: '+score+'</b>';try{localStorage.setItem('bastion_vgai','1')}catch(e){}}
 try{if(window.codShow)codShow('cpM')}catch(e){}}
/* API de QA */
Object.assign(VY,{
 st(){const S=VY.S;if(!S)return null;return{lv:S.lv,ph:S.ph,st:S.st,T:+S.T.toFixed(1),cine:L9.cine,p:[Math.round(P.g.position.x-S.X),+P.g.position.y.toFixed(1),Math.round(P.g.position.z)],hp:Math.round(P.hp),obj:(($e('obj')||{}).textContent||'').slice(0,120),pr:(($e('pr')||{}).textContent||'').slice(0,60),en:enemies.filter(e=>e.hp>0).length,q:S.q.length,sq:S.all.filter(n=>n.sq50&&!n.gone50).map(n=>[n.name.split(' ').pop(),Math.round(n.g.position.x-S.X),Math.round(n.g.position.z),n.act]),secA:S.secA.length,works:S.works.filter(w=>!w.done).map(w=>w.id),sec:S.sec,veh:S.veh.filter(vAlive).map(v=>v.kind+(v.ally?'+':'-')),air:S.air.filter(a=>a.alive).length,kills:S.kills,score,playing,dbg:{ms:+(S.dbg.ms/Math.max(1,S.dbg.n)).toFixed(2),msMax:+S.dbg.msMax.toFixed(1),spawn:S.dbg.spawn,forced:S.dbg.forced,visSpawn:S.dbg.visSpawn,minSpawnD:S.dbg.minSpawnD,tele:S.dbg.tele,stk:S.dbg.stk,err:S.dbg.err}}},
 go(ph,cp){go(ph,cp!==false)},skip(){if(L9.cine)L9.skip=1},start,
 works(){return VY.S?VY.S.works.filter(w=>!w.done).map(w=>({id:w.id,x:+(w.x-VY.S.X).toFixed(1),z:+w.z.toFixed(1),sec:w.sec})):[]}});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(install,0));else setTimeout(install,0);
})();
