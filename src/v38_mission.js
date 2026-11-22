/* =====================================================================
   v38 · CAPÍTULO II «OPERACIÓN MARTILLO DE NIEVE» (nivel 18)
   Distrito de Varnholt · 22 de enero de 1923 · 12.º Regimiento de Infantería
   de Campo de Volskaya con el 2.º Grupo de Artillería Mecanizada «FRUST».
   I Antes del amanecer · II El muro de Varn · III Las sombras del cielo ·
   IV Cuervos del Norte · V Falkenbrück · VI FRUST · VII La bandera sobre Falkenbrück
   Usa v38_env (buildVarn18, K18, sky18, weather18, floor18, collapse18, towerDmg18),
   v38_lib (volsk32 r12/r12off/frust/pilot, veyrn32 storm/knight, flag38, vehículos FRUST),
   v38_air (AIR38), v32_veh/v37_veh (VEH32), v33_ai/v33_ally (IA) y el armazón de v32_golfo.
   Secundarios con consecuencias (N18.sec): piloto, escuadra aislada, batería, mando, puente.
   QA: qa18() devuelve el estado; N18.dbg contadores.
   ===================================================================== */
const N18={built:false,on:false,ph:0,cpPh:0,st:0,T:0,ev:{},ot:'',all:[],sq:[],q:[],grp:{},sh:[],veh:[],bc:[],chg:[],works:[],mg:[],cap:{},capTxt:'',capTgt:null,
 kills:0,lost:0,saved:0,vk:0,gk:0,sup:0,art:0,tw:100,sec:{pilot:null,iso:null,bat:null,cmd:null,brg:null},junc:true,rauth:'none',flag:0,t0:0,dbg:{spawn:0,defer:0,stk:0,los:0,hid:0,ms:0,n:0,msMax:0}};
const WG18=x=>X18+x;
const once18=(k,t)=>{if(N18.ev[k]||N18.T<(t||0))return false;N18.ev[k]=1;return true};
const DIF18=()=>({easy:.72,normal:1,hard:1.3}[difficulty]||1);
const DK18=(a,b,c)=>({easy:a,normal:b,hard:c}[difficulty]);
const MOROZ18='«A todas las unidades del 12.º y del FRUST: aquí Moroz. Falkenbrück es nuestra. La bandera del regimiento flamea sobre la ciudadela y el nudo ferroviario está en manos de Volskaya. Hoy perdimos amigos en el Muro de Varn, en la meseta y en estas calles; no los olviden, porque ellos nos trajeron hasta acá. Descansen lo que puedan y limpien las armas. Desde los pasos de montaña llegan noticias de nuevas alas de grifos. La guerra no terminó: apenas cambió de cielo. Moroz, cambio y fuera.»';
function obj18(t,x,z){obj9(t,x===undefined?undefined:WG18(x),z);N18.ot=t}
function setPh18(ph){N18.ph=ph;N18.T=0;N18.ev={};N18.st=0;N18.cap={};try{localStorage.setItem('martillo38cp',String(Math.max(ph,+(localStorage.getItem('martillo38cp')||0))))}catch(e){}}
const fnV18=n=>typeof window[n]==='function'?window[n]:(typeof VEH32!=='undefined'&&VEH32&&typeof VEH32[n]==='function'?VEH32[n]:null);
const L18=k=>{const v=K18&&K18[k];return v?[v[0],v[1]]:[0,0]};
/* ¿lo vería el jugador? (distancia, niebla, cono y línea de vista) */
function vis18(x,z){const c=cam.position,dx=x-c.x,dz=z-c.z,d=Math.hypot(dx,dz);if(d<35)return true;const far=scene.fog&&scene.fog.far?scene.fog.far*.85:400;if(d>far)return false;const fx=-Math.sin(yaw),fz=-Math.cos(yaw);if((dx*fx+dz*fz)/d<.35)return false;return losClear(c.x,c.y,c.z,x,1.4,z)}
/* ---------------------------------------------------------------------
   ENEMIGOS: aparición perezosa (nunca a la vista) con tope activo (Android)
   --------------------------------------------------------------------- */
const EN18={rifle:'a un fusilero de Veyrn',storm:'a un soldado de choque de Veyrn',mg:'a un ametrallador de Veyrn',officer:'a un oficial de Veyrn',eng:'a un zapador de Veyrn',crew:'a un tripulante de Veyrn',knight:'a un caballero grifo de Veyrn',scout:'a un explorador de Veyrn',gren:'a un granadero de Veyrn'};
function sp18(k,x,z,o){o=o||{};const kind=o.kind||{mosin:'rifle',stv:'storm',bar:'mg',knight:'knight'}[k]||'rifle';const wk=k==='knight'?'stv':k;
 const e=sp13(wk,x+X18-X13,z,{tag:o.tag,y:o.y,hold:o.hold,role:kind==='officer'?'off':undefined,un:o.un,pat:o.pat?o.pat.map(p=>[p[0]+X18-X13,p[1]]):undefined,f:o.f});e.t13=o.tag||'v';e.kind18=kind;
 try{veyrn32(e,kind)}catch(er){}e.k8n=EN18[kind]||EN18.rifle;if(!o.un){e.unaware=false;e.active=true;e.alert=.3+R()*.9}e.side=R()<.5?1:-1;e.goal18=o.goal||null;e.keep18=!!o.keep;
 const dm=DK18(.85,1,1.15);e.hp*=dm*(o.hp||1);e.max=e.hp;if(typeof floor18==='function'&&!o.y){const f=floor18(x,z);if(f>.05)e.g.position.y=f}
 const g=N18.grp[e.t13]||(N18.grp[e.t13]={n:0,k:0});g.n++;N18.dbg.spawn++;return e}
const foes18=tag=>enemies.filter(e=>e.hp>0&&(!tag||String(e.t13).startsWith(tag))&&!e.ret17);
const qN18=tag=>N18.q.filter(q=>String(q.o.tag).startsWith(tag)).length;
const left18=tag=>foes18(tag).length+qN18(tag);
function q18(k,cands,o){N18.q.push({k,c:Array.isArray(cands[0])?cands:[cands],o:o||{},t:0})}
function cap18(){return Math.max(6,Math.round(DK18(9,11,13)-(+G.detail===0?2:0)))}
function pump18(dt){N18.qt=(N18.qt||0)-dt;if(N18.qt>0)return;N18.qt=.3;let alive=enemies.filter(e=>e.hp>0).length;const cap=cap18();let n=0;
 for(let i=0;i<N18.q.length&&n<2;i++){const q=N18.q[i];q.t+=.3;if(alive>=cap)break;let c=null;const L=q.c.slice().sort(()=>R()-.5);for(const s of L){if(q.o.force||(q.o.fb&&q.t>q.o.fb)||!vis18(WG18(s[0]),s[1])){c=s;break}}
  if(!c){N18.dbg.defer++;if(q.t>90)N18.q.splice(i--,1);continue}N18.q.splice(i--,1);const j=q.o.hold||q.o.un?0:3;sp18(q.k,c[0]+(R()-.5)*j,c[1]+(R()-.5)*j,q.o);alive++;n++}}
function despawn18(e){scene.remove(e.g);const i=enemies.indexOf(e);if(i>=0)enemies.splice(i,1)}
/* empuje táctico ligero: los que tienen meta avanzan por saltos hacia ella */
function tac18(dt){N18.tt=(N18.tt||0)-dt;if(N18.tt>0)return;N18.tt=1.1;const pp=P.g.position;
 for(const e of enemies){if(e.hp<=0||e.unaware||e.hold)continue;const p=e.g.position;
  if(e.ret17){if(Math.hypot(p.x-pp.x,p.z-pp.z)>70&&!vis18(p.x,p.z))despawn18(e);continue}
  if(e.goal18){const g=e.goal18,d=Math.hypot(WG18(g[0])-p.x,g[1]-p.z);if(d>4){if(R()<.55){e.cv={x:WG18(g[0])+(R()-.5)*6,z:g[1]+(R()-.5)*6};e.st='cover'}}else e.goal18=null}}}
/* ---------------------------------------------------------------------
   ALIADOS: escuadra con nombre (sigue al jugador, IA v33) y secciones
   independientes por sector (rutas propias, no siguen al jugador)
   --------------------------------------------------------------------- */
const NM18={moroz:'Teniente Arkady Moroz',orlov:'Cabo Mikhail Orlov',belik:'Anton Belik',sokol:'Yuri Sokol',rudenko:'Pavel Rudenko',varga:'Nikolai Varga'};
const SQK18={moroz:{kind:'r12off',officer:true,w:'p',rank:3,look:{hat:'peak'}},orlov:{rank:1,look:{nco:true,hat:'m22'},w:'smg'},belik:{w:'lmg',role:'mg',look:{hat:'m22'}},sokol:{role:'gren',look:{hat:'square'}},rudenko:{role:'marksman',look:{hat:'m22',coat:true}},varga:{role:'sapper',look:{hat:'m22'}}};
const alive18=n=>n&&!n.dead17&&n.lv===18;
function ally18(x,z,o){o=o||{};const n=npc11(WG18(x),z,{name:o.name||'Soldado del 12.º',coat:0x6a7a8c,hat:'helm',hatC:0x5e5c3a,rank:o.rank||0,officer:!!o.officer,f:o.f===undefined?Math.PI:o.f});n.lv=18;arm13(n,o.w||'r');
 n.kind18=o.kind||'r12';n.kind17=o.role||'rifle';n.hp=100;n.on=o.on!==false;n.g.visible=true;n.key18=o.key||'';try{volsk32(n,n.kind18,o.look||{})}catch(e){}
 if(typeof floor18==='function'){const f=floor18(x,z);if(f>.05)n.g.position.y=f}
 L9.tgts.push({p:n.g.position,h:d=>hurtA18(n,d),ok:()=>n.lv===level&&n.g.visible&&!n.down17&&!n.dead17,r:.6,bias:3,y:1.9});N18.all.push(n);return n}
function hurtA18(n,d){if(n.down17||n.dead17||n.inv18||L9.cine)return;n.hp-=d*DK18(.5,.75,.95);if(n.hp<=0)down18(n)}
function down18(n){if(n.down17)return;n.down17=time;n.down29=true;n.lock=true;n.tgt=null;n.route18=null;n.heal18=null;n.act='lie';n.g.rotation.order='YXZ';n.g.rotation.x=-1.5708;n.g.position.y=.18+(n.g.position.y>.3?n.g.position.y:0);
 if(n.sq18){feed('✚ '+n.name+' herido · atendelo (USAR) antes de que sea tarde');if(!N18.dm||time-N18.dm>5){N18.dm=time;talk([[n.name.split(' ').pop(),['¡Me dieron! ¡Ayuda!','¡La pierna! ¡No la siento!','¡Herido! ¡Acá, rápido!'][R()*3|0],1.8]])}}}
function revive18(n,by){if(!n.down17||n.dead17)return;n.down17=0;n.down29=false;n.lock=false;n.hp=60;n.g.rotation.x=0;n.g.position.y=0;n.act='idle';N18.saved++;feed('✚ '+(by||'Vos')+' atendió a '+n.name);score+=150}
function mkSq18(keys,cx,cz){return keys.map((k,i)=>{const o=Object.assign({name:NM18[k]||('Soldado '+['Lebedev','Kuzmin','Zorin','Antonov','Gromov'][i%5]),key:k},SQK18[k]||{});const n=ally18(cx+(i%3)*1.8-1.8,cz+2+(i/3|0)*1.8,o);n.sq18=1;return n})}
/* sección independiente: avanza por su ruta a saltos, ocupa puestos y combate sola */
function secA18(tag,n,route,posts,o){o=o||{};const L=[];for(let i=0;i<n;i++){const s=route[0];const a=ally18(s[0]+(i%3)*2-2,s[1]+(i/3|0)*2,{name:(o.nm||'Fusilero')+' '+['Ilyin','Sorokin','Popov','Vasko','Tarasov','Zhukov','Fedin','Gusev','Markov','Nosov'][(i+tag.length*3)%10],w:o.mg&&i===0?'lmg':R()<.25?'smg':'r',look:o.look});
  a.sec18=tag;a.on=false;a.lock=true;a.route18=route.slice(1).map(p=>[WG18(p[0])+(R()-.5)*4,p[1]+(R()-.5)*3]);a.ri=0;a.post18=posts?[WG18(posts[i%posts.length][0])+(i>=posts.length?2:0),posts[i%posts.length][1]]:null;a.wait18=o.wait||0;L.push(a)}return L}
function foeNear18(p,rng){let b=null,bd=rng;for(const e of enemies){if(e.hp<=0||e.unaware)continue;const q=e.g.position,d=Math.hypot(q.x-p.x,q.z-p.z);if(d<bd){if(N18.los>=10)break;N18.los++;N18.dbg.los++;if(losClear(p.x,1.5,p.z,q.x,1.3,q.z)){bd=d;b=e}}}return b}
function shoot18(n,dt){n.ft=(n.ft||R())-dt;if(n.ft<=0){n.ft=.6+R()*.4;n.tg=foeNear18(n.g.position,n.wpn==='p'?40:n.kind17==='marksman'?120:85)}const e=n.tg&&n.tg.hp>0&&enemies.includes(n.tg)?n.tg:null;if(!e)return false;const p=n.g.position,q=e.g.position;n.f=Math.atan2(q.x-p.x,q.z-p.z);if(n.mag===undefined)n.mag=MAG30[n.wpn]||5;if(n.rl>0){n.rl-=dt;if(n.rl<=0)n.mag=MAG30[n.wpn]||5;n.act='crouch';return true}n.act='crouchaim';fire30(n,e,Math.hypot(q.x-p.x,q.z-p.z),dt);return true}
function mv18(n,dt,tg,sp){const p=n.g.position,d=Math.hypot(p.x-tg[0],p.z-tg[1]);if(d<1.3){n.sk18=0;n.ld18=undefined;return true}n.tgt=[tg[0],tg[1]];n.sp=sp;n.act='run';n.ck18=(n.ck18||0)-dt;if(n.ck18>0)return false;n.ck18=1.5;
 if(n.ld18!==undefined&&n.ld18-d<.5)n.sk18=(n.sk18||0)+1;else n.sk18=0;n.ld18=d;
 if(n.sk18>=3&&(n.sk18>=8||(!vis18(p.x,p.z)&&!vis18(tg[0],tg[1])))){p.set(tg[0],p.y,tg[1]);n.vx=n.vz=0;n.sk18=0;n.ld18=undefined;N18.dbg.stk++;return true}return false}
function allyUpd18(dt){const free=[],pp=P.g.position;N18.ar=(N18.ar||0)+1;let ix=0;
 for(const n of N18.all){ix++;if(!alive18(n))continue;const p=n.g.position,dp=Math.hypot(p.x-pp.x,p.z-pp.z);
  if(n.down17){if(n.g.visible&&time-n.down17>DK18(90,60,40)){if(n.key18==='moroz'){n.dead17=1;n.g.visible=false;N18.morozEv=1;feed('✚ El teniente Moroz fue evacuado por los camilleros')}else{n.dead17=1;N18.lost++;if(n.sq18){feed('✝ '+n.name+' no sobrevivió');score=Math.max(0,score-300)}}}continue}
  if(n.sec18){/* activación perezosa por distancia (presupuesto Android) */const far=dp>DK18(140,130,120)-(+G.detail===0?25:0);if(far){if(n.g.visible){n.g.visible=false;N18.dbg.hid++}
    if(n.route18&&n.route18.length&&(N18.ar+ix)%30===0&&!vis18(n.route18[0][0],n.route18[0][1])){const w=n.route18.shift();p.set(w[0],p.y,w[1])}else if(n.route18&&!n.route18.length&&n.post18&&((N18.ar+ix)%40===0)&&!vis18(n.post18[0],n.post18[1]))p.set(n.post18[0],p.y,n.post18[1]);continue}
   if(!n.g.visible){if(vis18(p.x,p.z)&&dp>40)continue;n.g.visible=true}
   if(n.wait18>0){n.wait18-=dt;n.act='crouch';shoot18(n,dt);continue}
   if(n.route18&&n.route18.length){if(n.rw>0){n.rw-=dt;n.tgt=null;if(!shoot18(n,dt))n.act='crouch';continue}if(mv18(n,dt,n.route18[0],5)){n.route18.shift();n.rw=1.2+R()*2}continue}
   if(n.post18){const d=Math.hypot(p.x-n.post18[0],p.z-n.post18[1]);if(d>1.2){mv18(n,dt,n.post18,4);continue}}n.tgt=null;if(!shoot18(n,dt))n.act='crouch';continue}
  if(n.heal18){const t=n.heal18;if(!t.down17||t.dead17)n.heal18=null;else{const d=Math.hypot(t.g.position.x-p.x,t.g.position.z-p.z);if(d>1.5){n.tgt=[t.g.position.x+.8,t.g.position.z];n.sp=5.6;n.act='run'}else{n.tgt=null;n.act='crouch';n.hT=(n.hT||0)+dt;if(n.hT>4){n.hT=0;revive18(t,n.name);n.heal18=null}}continue}}
  if(n.key18==='orlov'&&!n.route18&&N18.ar%20===0){const t=N18.all.find(q=>alive18(q)&&q.down17&&q.sq18&&q.g.visible&&!N18.all.some(m=>m.heal18===q)&&Math.hypot(q.g.position.x-p.x,q.g.position.z-p.z)<30);if(t){n.heal18=t;n.hT=0;aiSay30(n,'¡Aguantá, '+t.name.split(' ').pop()+'! ¡Voy!',0);continue}}
  if(n.route18){if(n.route18.length){if(mv18(n,dt,n.route18[0],n.rsp||4.2))n.route18.shift();else if(n.leadW&&dp>16){n.tgt=null;n.act='crouch'}}else{n.route18=null;if(n.onArr){const f=n.onArr;n.onArr=null;f(n)}}continue}
  if(n.post18){const d=Math.hypot(p.x-n.post18[0],p.z-n.post18[1]);if(d>1.2){mv18(n,dt,n.post18,d>8?5.4:3.2);continue}n.tgt=null;if(!shoot18(n,dt))n.act=n.pose18||'crouch';continue}
  if(n.on&&!n.lock)free.push(n)}
 N18.sq=free;L13.sq=free;compUpd30(dt,free)}
/* ---------------------------------------------------------------------
   FUEGO: obuses con aviso, barreras propias, apoyo (B / APO)
   --------------------------------------------------------------------- */
let RG18=null;
function shell18(x,z,o){o=o||{};const r=o.r||5,dl=o.dl||2.2;if(!RG18){RG18=new T.RingGeometry(.8,1,24);RG18.rotateX(-1.5708)}const m=new T.Mesh(RG18,new T.MeshBasicMaterial({color:o.col||0xff3020,transparent:true,opacity:.5,depthWrite:false}));m.position.set(x,.1+(floor18(x-X18,z)||0),z);m.scale.setScalar(r);m.visible=o.ring!==false;scene.add(m);N18.sh.push({x,z,r,t:dl,d:dl,m,pw:o.pw||55,wh:0,by:o.by||'e'})}
function shellUpd18(dt){for(let i=N18.sh.length-1;i>=0;i--){const s=N18.sh[i];s.t-=dt;s.m.material.opacity=.25+.35*Math.abs(Math.sin((s.d-s.t)*(6+10*(1-s.t/s.d))));s.m.scale.setScalar(s.r*(1-.35*(s.t/s.d)));if(!s.wh&&s.t<1.1){s.wh=1;const dd=Math.hypot(s.x-P.g.position.x,s.z-P.g.position.z);if(dd<140)tn18('sine',1500,420,1.05,.05*Math.max(.2,1-dd/140))}if(s.t<=0){scene.remove(s.m);s.m.material.dispose();N18.sh.splice(i,1);blast18(s.x,s.z,s.r,s.pw,s.by)}}}
function vehs18(){return typeof VEH32!=='undefined'&&VEH32?VEH32.list.filter(v=>v.on&&v.alive):[]}
function blast18(x,z,r,pw,by){const y=floor18(x-X18,z)||0;bx12(x,.4+y,z,Math.min(2.2,.6+r/8));expSnd(x,z,1);try{decalAt30('crater',x,z,r*.9)}catch(e){}flashLight(x,3+y,z,4,.3,0xffb060);const dpl=Math.hypot(x-P.g.position.x,z-P.g.position.z);shake=Math.max(shake,Math.max(0,1.6-dpl/25));
 for(const e of [...enemies]){if(e.hp<=0)continue;const d=Math.hypot(e.g.position.x-x,e.g.position.z-z);if(d<r*1.4)hurt(e,pw*2.4*(1-d/(r*1.4)*.6),'x',by==='a'?{name:'El FRUST'}:by==='p'?{name:'Vos'}:undefined)}
 if(dpl<r)hitP(pw*(1-dpl/r*.6)*(by==='e'?1:.6));
 for(const n of N18.all){if(!alive18(n)||n.down17||!n.g.visible)continue;const d=Math.hypot(n.g.position.x-x,n.g.position.z-z);if(d<r)hurtA18(n,pw*(by==='e'?1.1:.4)*(1-d/r*.5))}
 for(const v of vehs18()){const d=Math.hypot(v.g.position.x-x,v.g.position.z-z);if(d<r+2.5&&!(by!=='e'&&v.side==='volsk')&&typeof vhVehDmg32==='function')vhVehDmg32(v,pw*4*(1-d/(r+2.5)*.5),'x',x,z)}}
/* fogonazo de cañón propio (salvas FRUST hacia el horizonte) */
function gunFx18(v){if(!v||!v.alive||!v.g)return;const p=v.g.position,r=v.g.rotation.y,x=p.x+Math.sin(r)*3.4,z=p.z+Math.cos(r)*3.4;fb12(x,2,z,5,.25,0);smoke(x,2,z,3,3,0x9a9a98,1,.5);flashLight(x,2,z,5,.18,0xffc070);expSnd(x,z,.7);if(Math.hypot(P.g.position.x-x,P.g.position.z-z)<40)shake=Math.max(shake,.5)}
function aim18(){const d=new T.Vector3();cam.getWorldDirection(d);const o=cam.position;let t=140;if(d.y<-.01)t=Math.min(190,o.y/-d.y);t=Math.max(20,t);return[o.x+d.x*t,o.z+d.z*t]}
function support18(){if(!playing||level!==18||L9.cine)return;const pic=N18.ph===3||N18.ph===4;const n=pic?N18.pic:N18.art;
 if(!(N18.ph>=3)){say('Todavía no hay apoyo disponible.',1.4);return}if(n<=0){say(pic?'No quedan Picador disponibles.':'El FRUST no tiene salvas disponibles.',1.6);return}
 const [x,z]=aim18();if(Math.hypot(x-P.g.position.x,z-P.g.position.z)<18){say('¡Demasiado cerca! Marcá un punto más lejos.',1.6);return}
 if(pic){N18.pic--;const a=airSpawn38('plane','D',{from:'s',force:1,jit:60,y:110});airOrder38(a,{mode:'dive',at:[x-X18,z]});radio28('Picador 2','Picador en picado, blanco marcado. ¡Cabezas abajo!',2.4);smoke(x,.3,z,2,6,0xd04020,4,.4)}
 else{N18.art--;radio28('FRUST','Batería, ¡tres salvas sobre el humo! Fuego.',2.2);smoke(x,.3,z,2,6,0xd04020,4,.4);for(let i=0;i<5;i++)later13(2.5+i*.7,()=>shell18(x+(R()-.5)*14,z+(R()-.5)*14,{r:6,pw:70,by:'a',dl:1.4,col:0xffa020}))}
 N18.sup++}
/* ---------------------------------------------------------------------
   VEHÍCULOS
   --------------------------------------------------------------------- */
function veh18(kind,side,x,z,rot){const B=fnV18(kind),S=fnV18('vehSpawn32');if(!B||!S)return null;try{const v=B(side);S(v,x,z,rot||0);v.s18=side;N18.veh.push(v);return v}catch(e){console.warn('veh18',kind,e);return null}}
function ord18(v,o){if(!v||!v.alive)return;try{vehOrder32(v,o)}catch(e){}}
function crew18(v,n){if(!v)return;try{gunCrew32(v,{n:n||3,spawn:(wx,wz)=>v.side==='volsk'?ally18(wx-X18,wz,{kind:'frust',name:'Artillero FRUST '+['Grek','Ostap','Lev','Timur'][R()*4|0]}):sp18('mosin',wx-X18,wz,{tag:'gc',kind:'crew'})})}catch(e){}}
function vDrop18(v){if(v.g&&v.g.parent)v.g.parent.remove(v.g);v.on=false;v.alive=false;v.k18=1;if(v.ob){const i=obstB.indexOf(v.ob);if(i>=0)obstB.splice(i,1);v.ob=null}if(v.hit&&typeof HIT9!=='undefined'){const i=HIT9.indexOf(v.hit);if(i>=0)HIT9.splice(i,1)}let i=VEH32.list.indexOf(v);if(i>=0)VEH32.list.splice(i,1);i=N18.veh.indexOf(v);if(i>=0)N18.veh.splice(i,1)}
function dmgV18(v,d,k){if(v&&v.alive&&typeof vhVehDmg32==='function')vhVehDmg32(v,d,k||'at',v.g.position.x,v.g.position.z)}
function train18(fromZ,toZ,sp,armd){const F=fnV18('trainRun32');if(!F)return null;try{const c=armd?['loco','flat','box','flat','box']:['loco','troop','troop','flat'];return F(c,fromZ,toZ,sp,{x:-130,side:'volsk'})}catch(e){console.warn('train18',e);return null}}
/* ---------------------------------------------------------------------
   TRABAJOS (USAR): socorrer, colocar/desactivar cargas, izar bandera…
   --------------------------------------------------------------------- */
function works18(){const W=N18.works.filter(w=>!w.done&&(!w.ok||w.ok()));const pp=P.g.position;
 for(const n of N18.all)if(alive18(n)&&n.down17&&n.g.visible&&(n.sq18||n.iso18||n.pilot18))W.push({x:n.g.position.x,z:n.g.position.z,r:2.2,dur:n.pilot18?3:2.6,lbl:'Atender a '+n.name,fn:()=>{revive18(n);if(n.pilot18)pilotOK18(n)}});return W}
function work18(x,z,lbl,dur,fn,o){const w=Object.assign({x:WG18(x),z,r:2.4,dur,lbl,fn},o||{});N18.works.push(w);return w}
function workUpd18(dt){const pp=P.g.position,w=N18.work;if(w){if(Math.hypot(pp.x-w.x,pp.z-w.z)>w.r+1.5||L9.cine){N18.work=null;return}w.t+=dt;$('pr').textContent=w.lbl+'… '+bar10(w.t/w.dur);if(w.t>=w.dur){N18.work=null;const o=w.src||w;o.done=!o.again;w.fn()}return}
 for(const c of works18())if(Math.hypot(pp.x-c.x,pp.z-c.z)<c.r){$('pr').textContent='[E / USAR] '+c.lbl;return}
 if(P.mg){$('pr').textContent='[USAR] dejar la ametralladora · FUEGO dispara';return}if(nearMG()){$('pr').textContent='[E / USAR] Tomar la ametralladora';return}$('pr').textContent=N18.capTxt||''}
function charge18(x,z,fuse,onBoom,o){o=o||{};const m=new T.Group();const q=PB();pBox(q,.5,.3,.35,0x5a4a2a,0,.15,0);pBox(q,.52,.05,.37,0x2a2a22,0,.2,0);pCyl(q,.02,.02,.5,0x8a2020,.2,.35,0,0,0,.8,4);pbMesh(q,m,VCV);m.position.set(WG18(x),floor18(x,z)||0,z);scene.add(m);
 const bc=beacon17(WG18(x),(floor18(x,z)||0)+.4,z,o.col||0xff4020,2.2);const c={x:WG18(x),z,t:fuse,m,bc,onBoom,lbl:o.lbl||'Desactivar la carga',by:o.by||'e',done:false};N18.chg.push(c);
 if(o.defuse!==false)c.w=work18(x,z,c.lbl,DK18(2,3,3.5),()=>{c.done=true;scene.remove(c.m);scene.remove(c.bc.g);feed('★ Carga desactivada');score+=400;if(o.onDef)o.onDef(c)},{ok:()=>!c.done});return c}
function chgUpd18(dt){for(let i=N18.chg.length-1;i>=0;i--){const c=N18.chg[i];if(c.done){N18.chg.splice(i,1);continue}beaconUpd17(c.bc,time);c.t-=dt;if(c.t<=0){c.done=true;if(c.w)c.w.done=true;scene.remove(c.m);scene.remove(c.bc.g);N18.chg.splice(i,1);bx12(c.x,.5,c.z,1.8);expSnd(c.x,c.z,2);shake=Math.max(shake,1.2);blast18(c.x,c.z,7,c.by==='p'?90:70,c.by);if(c.onBoom)c.onBoom(c)}}}
/* zona a asegurar (sin enemigos cerca durante dur segundos) */
function capZ18(key,x,z,r,dur,dt){const pp=P.g.position;if(Math.hypot(pp.x-x,pp.z-z)>r)return(N18.cap[key]||0)/dur;let nb=0,be=null,bd=1e9;for(const e of enemies)if(e.hp>0&&!e.ret17&&!e.unaware){const d=Math.hypot(e.g.position.x-x,e.g.position.z-z);if(d<r+14){nb++;const dp=Math.hypot(e.g.position.x-pp.x,e.g.position.z-pp.z);if(dp<bd){bd=dp;be=e}}}
 if(nb){N18.capTgt=[be.g.position.x,be.g.position.z];N18.blkT=(N18.blkT||0)+dt;if(nb<=2&&N18.blkT>35){N18.blkT=0;for(const e of enemies)if(e.hp>0&&Math.hypot(e.g.position.x-x,e.g.position.z-z)<r+14){e.ret17=1;e.cv={x:e.g.position.x+(e.g.position.x-x)*2,z:e.g.position.z-30};e.st='cover'}feed('★ Los últimos defensores se repliegan')}N18.capTxt='¡Quedan '+nb+' enemigos en la zona! ('+Math.round(bd)+' m)';return(N18.cap[key]||0)/dur}
 N18.blkT=0;N18.cap[key]=Math.min(dur,(N18.cap[key]||0)+dt);N18.capTxt='Asegurando la posición '+bar10(N18.cap[key]/dur);return N18.cap[key]/dur}
function bcn18(x,z,col,y){const b=beacon17(WG18(x),(y||floor18(x,z)||0),z,col||0xffd070,2.6);N18.bc.push(b);return b}
function bcnClr18(){for(const b of N18.bc)scene.remove(b.g);N18.bc=[]}
/* ---------------------------------------------------------------------
   ESCALA DE BATALLA: lo lejano se representa barato (trazadoras, fogonazos, eco)
   --------------------------------------------------------------------- */
const FRONT18=[[0,-200,60],[0,-200,60],[0,-380,90],[0,-500,90],[0,-640,80],[-120,-720,70],[0,-800,70]];
function farFx18(dt){N18.ff=(N18.ff||0)-dt;if(N18.ff>0)return;N18.ff=(+G.detail===0?1.3:.7)+R()*.8;const F=FRONT18[N18.ph]||FRONT18[0],pp=P.g.position;
 const a=R()*6.28,r=90+R()*120,x=pp.x+Math.cos(a)*r,z=Math.min(F[1]+60,pp.z-30)+Math.sin(a)*F[2]*.6-R()*60;if(vis18(x,z)&&Math.hypot(x-pp.x,z-pp.z)<110)return;
 if(R()<.6){const o=new T.Vector3(x,1.4,z),t=new T.Vector3(x+(R()-.5)*50,1+R()*2,z-30-R()*40);trc16(o,t,R()<.5?0xffe0a0:0xff9a60);if(R()<.4)npcShot(R()<.5?'mg':'rifle',x,z)}
 else{fb12(x,3,z-40,9+R()*8,.4,0);if(R()<.5)expSnd(x,z-40,.5)}}
/* ---------------------------------------------------------------------
   AIRE: grifos, cazas, nidos antiaéreos
   --------------------------------------------------------------------- */
function airSet18(cz){AIR38.origin(X18);AIR38.center=[0,cz];AIR38.home=[0,700];AIR38.max.g=DK18(3,4,6)-(+G.detail===0?1:0);AIR38.max.p=4;AIR38.fog=null;AIR38.ff=.35}
function grif18(v,o){o=Object.assign({from:'n',jit:120,hpK:DK18(.8,1,1.2)},o||{});return airSpawn38('griffin',v,o)}
function aaNest18(i,crew){const K=K18.aaNests[i];if(!K)return null;const M=mkMG08(WG18(K[0]),K[1],0,18);M.g.rotation.y=Math.PI;N18.mg.push(M);let gn=null;if(crew){gn=ally18(K[0]-1,K[1]+1.2,{name:'Ametrallador AA '+['Kasimov','Bely'][i%2],w:'lmg'});gn.post18=[WG18(K[0])-1,K[1]+1.2];gn.lock=true;gn.on=false;gn.pose18='crouchaim';gn.keepPh=3}
 const s={x:K[0],z:K[1],r:220,rate:DK18(.55,.45,.38),dmg:12,y:1.6,on:()=>gn&&!gn.down17&&!gn.dead17&&!(P.mg&&curMG===M)};AIR38.aa.push(s);return{M,gn,s}}
function airHooks18(){AIR38.onKill=(a,by,how)=>{if(level!==18)return;if(a.side==='veyrn'){N18.gk++;if(a.boss){N18.rauth='down';later13(1,()=>{radio28('Chaika 1','¡Eisenkrall cae! ¡Rauth está abajo, repito, Rauth abajo!',2.6)})}}};
 AIR38.onDismount=(x,z,a)=>{if(level!==18)return null;const e=sp18('knight',x,z,{tag:'kn',kind:'knight'});return e};
 AIR38.onLand=(a,at)=>{if(level!==18)return;const s=N18.nests&&N18.nests.find(n=>n&&Math.hypot(n.s.x-(at?at[0]:a.p.x-X18),n.s.z-(at?at[1]:a.p.z))<8);if(s&&s.gn&&!s.gn.down17){down18(s.gn);feed('¡Un grifo cayó sobre el nido antiaéreo!')}};
 AIR38.onRetreat=a=>{if(level===18&&a.boss){N18.rauth='fled';feed('★ ¡Rauth se retira herido!')}}}
/* ---------------------------------------------------------------------
   ESTRUCTURA DE ACTOS
   --------------------------------------------------------------------- */
const AT18=[['I','ANTES DEL AMANECER','05:10 · Bosque de Dravik'],['II','EL MURO DE VARN','06:00 · Línea defensiva de Varn'],['III','LAS SOMBRAS DEL CIELO','07:20 · Meseta de Varn'],['IV','CUERVOS DEL NORTE','08:00 · Meseta de Varn'],['V','FALKENBRÜCK','09:30 · Puerta sur y plaza del mercado'],['VI','FRUST','11:40 · Estación y playa de vías'],['VII','LA BANDERA SOBRE FALKENBRÜCK','13:20 · Ciudadela y torre de comunicaciones']];
const SKYP18=['dawn','dawn','morning','morning','morning','day','day'];
const CPS18=[[0,40],[-30,-108],[40,-268],[-20,-468],[0,-524],[-70,-655],[0,-742]];
function act18(ph){const a=AT18[ph];say('ACTO '+a[0]+' · «'+a[1]+'» · '+a[2],4.5)}
function clearAll18(){for(const e of[...enemies])despawn18(e);N18.q=[];N18.grp={};for(const s of N18.sh)scene.remove(s.m);N18.sh=[];
 for(const n of N18.all){scene.remove(n.g);const i=NPC11.indexOf(n);if(i>=0)NPC11.splice(i,1)}N18.all=[];N18.sq=[];L13.sq=[];L9.tgts=[];
 try{VEH32.clear()}catch(e){}N18.veh=[];for(const c of N18.chg){scene.remove(c.m);scene.remove(c.bc.g)}N18.chg=[];N18.works=[];bcnClr18();
 for(const M of N18.mg){scene.remove(M.g);const i=MGS.indexOf(M);if(i>=0)MGS.splice(i,1)}N18.mg=[];N18.nests=null;AIR38.aa.length=0;try{airClear38()}catch(e){}
 if(N18.barr){for(const o of N18.barr.ob){const i=obstB.indexOf(o);if(i>=0)obstB.splice(i,1)}scene.remove(N18.barr.g);N18.barr=null}
 if(N18.flagG){scene.remove(N18.flagG);N18.flagG=null}if(N18.wreck){scene.remove(N18.wreck);N18.wreck=null}
 P.mg=false;curMG=null;N18.work=null;N18.cap={};N18.capTxt='';N18.sqd=null;N18.secs={}}
function sqKeys18(ph){return ph===0?['orlov','belik','sokol','rudenko','varga']:['moroz','orlov','belik','sokol','rudenko','varga']}
function go18(ph,jump){setPh18(ph);N18.cpPh=ph;L9.tick=null;$('fade12').style.opacity=0;N18.capTxt='';
 if(jump){clearAll18();refill(ph>0?3:2);P.cur='rifle';N18.arm=ph>=4?['rifle','revolver','smg']:['rifle','revolver'];P.weapons.smg.reserve=ph>=4?140:0;yaw=ph===5?-Math.PI*.15:0;pitch=0;P.vy=0;P.mvx=P.mvz=0;
  const S=CPS18[ph];P.g.position.set(WG18(S[0]),0,S[1]);sky18(SKYP18[ph]);if(ph===2)sky18('dawn'),sky18('morning',25);
  N18.sqd=mkSq18(sqKeys18(ph),S[0],S[1]+3);if(ph>0){if(N18.sec.pilot===null)N18.sec.pilot=false;if(ph>1&&N18.sec.iso===null)N18.sec.iso=false;if(ph>2&&N18.sec.bat===null)N18.sec.bat=true;if(ph>4&&N18.sec.cmd===null)N18.sec.cmd=false;if(ph>5&&N18.sec.brg===null)N18.sec.brg=false}
  N18.art=ph>=4?(N18.sec.bat?3:1)+DK18(1,0,0):0;N18.pic=DK18(3,2,2)+(N18.sec.pilot?1:0)}
 else{/* continuidad: repone la escuadra con fusileros de relevo */const pp=P.g.position;const al=N18.all.filter(n=>alive18(n)&&n.sq18&&!n.down17).length;if(al<3){const L=mkSq18(['r','r'].slice(0,3-al),pp.x-X18,pp.z+14);for(const n of L){n.g.visible=true}feed('Llegan fusileros de relevo a la sección')}
  for(const n of N18.all)if(!n.sq18&&n.keepPh!==ph){scene.remove(n.g);n.dead17=1;n.g.visible=false;n.lv=-1;const i=NPC11.indexOf(n);if(i>=0)NPC11.splice(i,1)}N18.all=N18.all.filter(n=>!n.dead17||n.sq18);
  for(const v of N18.veh.slice())if(v&&v.g&&v.keepPh!==ph&&Math.hypot(v.g.position.x-pp.x,v.g.position.z-pp.z)>160&&!vis18(v.g.position.x,v.g.position.z))vDrop18(v);
  for(const e of enemies)if(e.hp>0&&!e.keep18){const p=e.g.position;e.ret17=1;e.cv={x:p.x,z:p.z-45};e.st='cover'}bcnClr18();N18.works=N18.works.filter(w=>w.keep);for(const n of N18.all)if(n.sq18){n.route18=null;n.post18=null;n.on=true;n.lock=false;n.inv18=0;n.leadW=0}}
 airSet18([0,-180,-400,-470,-640,-720,-790][ph]);AI30.ord='follow';act18(ph);[st0_18,st1_18,st2_18,st3_18,st4_18,st5_18,st6_18][ph](jump)}
/* ======================= I · ANTES DEL AMANECER ======================= */
const WP18=[[-6,-18],[-22,-58],[-34,-100]];
function frust18(){const F=K18.frustSlots;N18.how=[];for(let i=0;i<3;i++){const p=[[16,2],[28,0],[40,2]][i];const v=veh18('howitzer38','volsk',p[0],p[1],Math.PI);if(v){crew18(v,3);N18.how.push(v)}}
 N18.trc=[veh18('tractor38','volsk',22,32,Math.PI),veh18('tractor38','volsk',38,32,Math.PI)];N18.spg=veh18('spg38','volsk',6,22,Math.PI);N18.amT=veh18('ammoTruck38','volsk',50,24,Math.PI);N18.obs=veh18('obsCar38','volsk',34,16,Math.PI*.8);if(N18.obs)try{obsMast38(N18.obs,true)}catch(e){}
 for(const v of N18.veh)if(v&&v.side==='volsk')ord18(v,{mode:'hold'});
 for(let i=0;i<4;i++){const n=ally18(10+i*9,26+(i%2)*3,{kind:'frust',name:'Artillero FRUST '+['Grek','Ostap','Lev','Timur'][i],w:'r'});n.on=false;n.lock=true;n.post18=[n.g.position.x,n.g.position.z];n.pose18=i%2?'idle':'crouch';n.inv18=1}}
function st0_18(jump){frust18();const pp=[30,18];const mz=N18.sqd.find(n=>n.key18==='moroz')||mkSq18(['moroz'],pp[0],pp[1])[0];N18.moroz=mz;mz.on=false;mz.lock=true;mz.post18=[WG18(pp[0]),pp[1]];mz.pose18='idle';mz.g.position.set(WG18(pp[0]),0,pp[1]);mz.inv18=1;
 for(const n of N18.sqd){if(n===mz)continue;n.on=false;n.lock=true;n.post18=[WG18(4+R()*10),26+R()*6];n.pose18='idle'}
 /* patrulla veyrn en el bosque y escolta del piloto derribado */
 q18('mosin',[-30,-72],{tag:'pat',kind:'scout',un:true,pat:[[-30,-72],[12,-78],[-8,-90]]});q18('mosin',[8,-80],{tag:'pat',kind:'scout',un:true,pat:[[8,-80],[-38,-70],[-20,-92]]});if(DIF18()>.9)q18('stv',[-20,-92],{tag:'pat',kind:'storm',un:true,pat:[[-20,-92],[-40,-60]]});
 q18('mosin',[-70,-16],{tag:'pil',kind:'scout',un:true,pat:[[-70,-16],[-88,-4],[-62,4]]});q18('mosin',[-84,-20],{tag:'pil',kind:'rifle',un:true,pat:[[-84,-20],[-66,-22]]});
 {const g=new T.Group(),q=PB();pBox(q,1.1,1,4.2,0x4c5848,0,.5,0,.1,.4,.2);pBox(q,5,.12,1.4,0x6a7560,1.6,.4,-.4,0,.5,.35);pBox(q,3,.12,1.2,0x4c5848,-1.8,.9,.6,.4,.3,-.6);pCyl(q,.5,.5,.5,0x8a9096,0,.5,2.1,1.5708,.4,0,10);pBox(q,1.8,.08,.12,0x5a3a22,.3,.9,2.4,.3,.4,1.2);pbMesh(q,g,VCV);g.position.set(WG18(-80),0,-12);scene.add(g);N18.wreck=g;smoke(WG18(-80),1,-12,2,4,0x3a3a3a,3,.5)}
 const pl=ally18(-77,-9,{kind:'pilot',name:'Teniente aviador Lasko',w:'p'});pl.pilot18=1;pl.on=false;pl.lock=true;down18(pl);pl.down17=time+9999;N18.pilot=pl;
 if(N18.cpPh===0&&!N18.introSeen){N18.introSeen=1;cineIntro18()}else st0b18()}
function st0b18(){N18.st=1;obj18('Presentate al Teniente Moroz junto al coche de observación del FRUST',30,18);bcn18(30,18)}
function pilotOK18(n){N18.sec.pilot=true;n.lock=true;n.on=false;n.down17=0;n.down29=false;n.g.rotation.x=0;n.route18=[[WG18(-40),10],[WG18(20),30]];n.rsp=2.6;n.onArr=m=>{m.g.visible=false};feed('★ OBJETIVO SECUNDARIO · Piloto rescatado: la escuadrilla V-19 sabrá dónde anidan los grifos');score+=800;
 talk([['Lasko','Gracias, soldado… Los grifos salen del aeródromo del nordeste. Díganselo a los Chaika.',3],['Orlov','Vuelva al claro, teniente. Nosotros seguimos.',2]])}
function upd0_18(dt){const pp=P.g.position,mz=N18.moroz;
 if(N18.st===1&&mz&&Math.hypot(pp.x-mz.g.position.x,pp.z-mz.g.position.z)<7){N18.st=2;N18.T=0;bcnClr18();
  talk([[NM18.moroz,'Escuchen bien. A las seis el FRUST abre fuego sobre el Muro de Varn.',3],[NM18.moroz,'Antes necesito un camino seguro entre los pinos hasta el foso antitanque. Hay un solo paso.',3.4],[NM18.moroz,'Orlov, llevate a la escuadra. Marquen el sendero. Sin ruido: patrullas veyrn en el bosque.',3.4],[NM18.orlov,'Entendido, mi teniente. ¡Escuadra, conmigo!',2.2],[NM18.moroz,'Y otra cosa: un Chaika cayó anoche cerca del lago. Si el piloto vive, tráiganlo.',3.2]]);
  later13(15,()=>{if(N18.ph!==0)return;N18.st=3;N18.wi=0;for(const n of N18.sqd)if(n!==mz){n.on=true;n.lock=false;n.post18=null}const o=N18.sqd.find(n=>n.key18==='orlov');if(o){o.on=false;o.lock=true;o.leadW=1;o.route18=WP18.map(w=>[WG18(w[0]+2),w[1]]);o.rsp=3.2}
   obj18('Reconocé el sendero seguro: seguí las marcas hasta el foso (0/3) · (opcional) buscá al piloto derribado junto al lago, al oeste',WP18[0][0],WP18[0][1]);bcn18(WP18[0][0],WP18[0][1],0x9adfff);
   })}
 if(N18.st===3){const w=WP18[N18.wi];if(w&&Math.hypot(pp.x-WG18(w[0]),pp.z-w[1])<12){N18.wi++;bcnClr18();score+=100;
   if(N18.wi===1){feed('Marca de paso 1/3');later13(2,()=>{train18(112,-150,9,true);say('El tren blindado «Zarya» pasa hacia el frente…',3);later13(3,()=>talk([[NM18.belik,'Mirá eso… el Zarya. Lleva cañones hasta en el ténder.',2.6],[NM18.orlov,'Callate y mirá el bosque, Belik.',2]]))})}
   if(N18.wi===2){feed('Marca de paso 2/3');talk([[NM18.orlov,'¡Abajo! Patrulla veyrn adelante. Agachados… o los callamos rápido.',2.6]])}
   const nx=WP18[N18.wi];if(nx){obj18('Reconocé el sendero seguro: seguí las marcas hasta el foso ('+N18.wi+'/3)',nx[0],nx[1]);bcn18(nx[0],nx[1],0x9adfff)}
   else{N18.st=4;N18.T=0;obj18('Sendero marcado. Esperá en el lindero del bosque: el FRUST va a abrir fuego');talk([[NM18.orlov,'Sendero marcado. Radio: «Martillo, el camino está limpio.»',2.6],[NM18.moroz,'Recibido. FRUST, ¡fuego a discreción sobre el Muro!',2.6]])}}
  if(N18.sec.pilot===null&&N18.wi>=3)N18.sec.pilot=false}
 if(N18.st===4){if(once18('vol',2)){radio28('FRUST','¡Batería, fuego!',1.6)}if(N18.T>2&&N18.T<14){N18.vt=(N18.vt||0)-dt;if(N18.vt<=0){N18.vt=.7+R()*.6;const v=N18.how[(R()*N18.how.length)|0];gunFx18(v);later13(2.5+R(),()=>{const x=WG18(-150+R()*300),z=-205-R()*45;fb12(x,4,z,14,.5,0);expSnd(x,z,.8)})}}if(N18.T>14)go18(1,false)}
 if(N18.ev.pal===undefined&&foes18('pat').some(e=>!e.unaware)){N18.ev.pal=1;for(const e of foes18('pat'))if(e.unaware){e.unaware=false;e.active=true;e.alert=.3}}}
function cineIntro18(){const c=K18.frustClear;cine9([{d:5,a:[WG18(-60),40,90],b:[WG18(-20),30,70],la:[WG18(20),2,20],txt:'DISTRITO DE VARNHOLT · 22 DE ENERO DE 1923 · 05:10'},{d:5,a:[WG18(c[0]-10),4,c[1]+18],b:[WG18(c[0]+12),3.2,c[1]+16],la:[WG18(c[0]+6),1.6,c[1]],txt:'BOSQUE DE DRAVIK · 2.º Grupo de Artillería Mecanizada «FRUST»'},{d:5,a:[WG18(4),2,46],b:[WG18(2),1.8,42],la:[WG18(24),1.6,20],txt:'CAPÍTULO II · OPERACIÓN MARTILLO DE NIEVE'}],()=>st0b18(),
  [{t:1,fn:()=>radio28('Radio FRUST','…Martillo a todas las piezas: hora cero a las seis. Silencio de radio hasta entonces…',3.4)},{t:6,fn:()=>{for(let i=0;i<3;i++)later13(i*.7,()=>{const x=WG18(-200+R()*400),z=-900-R()*200;fb12(x,10,z,40,.5,0)})}},{t:11.5,fn:()=>sayN13(NM18.orlov,'Arriba, muchachos. El teniente nos quiere ver.',2.6),must:true}])}
/* ======================= II · EL MURO DE VARN ======================= */
function line18(){const B=K18.line.bunkers;N18.bk=B.map((b,i)=>{const mg=b.mg||[b[0],b[1]+2],dr=b.door||[b[0],b[1]-3];q18('bar',[mg[0],mg[1]],{tag:'bk'+i,kind:'mg',hold:true,fb:20,keep:true});q18('mosin',[mg[0]+1.2,mg[1]-.5],{tag:'bk'+i,hold:true,fb:20});
  const o={i,x:b[0],z:b[1],mg,dr,done:false};o.w=work18(dr[0],dr[1],'Colocar la carga de demolición en la casamata',DK18(2,2.6,3),()=>{feed('Carga colocada · ¡alejate!');charge18(dr[0],dr[1],5,()=>bkDone18(o,'p'),{defuse:false,by:'p',col:0xffa020})},{ok:()=>!o.done,r:2.6});return o});
 const bays=K18.line.bays.filter(b=>b[0]>-70&&b[0]<90);const n=Math.round(9*DIF18());for(let i=0;i<n;i++){const b=bays[(i*5+3)%bays.length];q18(i%3===0?'stv':'mosin',[b[0],b[1]],{tag:'tr',kind:i%3===0?'storm':'rifle',hold:i%2===0,fb:25})}
 const vp=veh18('armcar32','veyrn',40,-226,0);if(vp)ord18(vp,{mode:'hold'})}
function st1_18(jump){N18.st=0;sky18('dawn');sky18('morning',240);line18();
 /* asalto: dos secciones independientes, carro y autoblindado propios */
 const R2=K18.routes.II;secA18('sw',Math.round(DK18(6,5,5)),[[-60,-118],[-50,-140],[-35,-150],[-35,-172],[-35,-186],[-40,-192]],[[-45,-190],[-30,-194],[-55,-194],[-20,-190],[-60,-190]],{wait:50,mg:true});
 secA18('se',Math.round(DK18(6,5,4)),[[30,-118],[20,-140],[0,-150],[-30,-172],[-20,-186],[10,-190]],[[3,-190],[13,-194],[23,-190],[-7,-194]],{wait:55});
 const tk=veh18('tank32','volsk',-40,-128,Math.PI);if(tk){tk.s18='volsk';later13(52,()=>ord18(tk,{mode:'advance',path:[[-35,-150],[-35,-172],[-35,-200],[0,-216],[40,-222]]}))}
 /* escuadra aislada (secundario) */
 if(N18.sec.iso===null){const L=[];for(let i=0;i<3;i++){const n=ally18(-152+i*2,-160,{name:['Cabo Sergei Danko','Soldado Arsen Kovac','Soldado Ilya Petrenko'][i],w:i?'r':'lmg'});n.iso18=1;n.on=false;n.lock=true;n.post18=[n.g.position.x,n.g.position.z];n.pose18='crouch';L.push(n)}N18.iso=L;
  for(let i=0;i<Math.round(4*DIF18());i++)q18(i?'mosin':'bar',[-150+i*5,-188],{tag:'iso',hold:!i,fb:30})}
 N18.bar=48;obj18('Preparación artillera del FRUST · esperá la orden de asalto');talk([[NM18.moroz,'¡Cuerpo a tierra hasta que levanten el fuego! Después, por el paso del foso.',3]]);
 for(const n of N18.all)if(n.sq18){n.on=true;n.lock=false}}
function bkDone18(o,by){if(o.done)return;o.done=true;if(o.w)o.w.done=true;for(const e of foes18('bk'+o.i))hurt(e,999,'x',{name:'La carga'});bx12(WG18(o.x),1,o.z,2);smoke(WG18(o.x),2,o.z,6,8,0x3a3632,3,.6);mkFire(WG18(o.x),o.z,1.4,0);N18.bkN=(N18.bkN||0)+1;feed('★ Casamata '+(o.i+1)+' destruida');score+=600}
function upd1_18(dt){const pp=P.g.position;
 if(N18.st===0){N18.bar-=dt;N18.vt=(N18.vt||0)-dt;if(N18.vt<=0){N18.vt=DK18(.5,.6,.7);const x=-140+R()*280,z=-188-R()*55;if(Math.hypot(WG18(x)-pp.x,z-pp.z)>30)shell18(WG18(x),z,{r:6,pw:60,by:'a',dl:1.6,ring:false})}
  if(N18.bar<=0){N18.st=1;radio28('FRUST','Fuego levantado. ¡Adelante el 12.º!',2);talk([[NM18.moroz,'¡AL ASALTO! ¡Las casamatas primero! ¡Varga, las cargas!',2.6]]);sayN13('Silbatos','¡Fiiiiu! ¡Fiiiiu!',1.5);for(const b of N18.bk)bcn18(b.dr[0],b.dr[1],0xff8040)}
  obj18('Preparación artillera del FRUST: '+Math.max(0,Math.ceil(N18.bar))+' s · avanzá hasta el paso del foso cuando levanten el fuego',-35,-160);return}
 for(const b of N18.bk)if(!b.done&&N18.T>20&&!left18('bk'+b.i)&&N18.grp['bk'+b.i])bkDone18(b,'k');
 if(N18.st===1){const n=N18.bk.filter(b=>b.done).length;const nx=N18.bk.find(b=>!b.done);if(nx)obj18('Silenciá las casamatas de ametralladoras ('+n+'/3) · granadas por la tronera o carga en la puerta (USAR)'+(N18.sec.iso===null?' · (opcional) socorré a la escuadra aislada al oeste':''),nx.dr[0],nx.dr[1]);
  if(n>=3){N18.st=2;N18.T=0;bcnClr18();bcn18(70,-250,0x9adfff,6);talk([[NM18.moroz,'¡El muro cayó! ¡Arriba, a la Cota 214 antes de que se reagrupen!',2.8]]);for(let i=0;i<Math.round(4*DIF18());i++)q18(i?'mosin':'bar',[66+i*3,-256],{tag:'hill',hold:!i,fb:25})}}
 if(N18.st===2){const k=capZ18('hill',WG18(70),-250,14,DK18(15,20,25),dt);obj18('Asegurá la Cota 214 '+bar10(k),70,-250);if(k>.3&&once18('hc')){for(let i=0;i<Math.round(5*DIF18());i++)q18(i%2?'stv':'mosin',[[50+i*8,-310],[100,-300]],{tag:'hc',kind:i%2?'storm':'rifle',goal:[70,-252]});feed('¡Contraataque veyrn sobre la cota!')}
  if(k>=1&&!left18('hc')){N18.st=3;bcnClr18();score+=1000;feed('★ COTA 214 ASEGURADA');talk([[NM18.moroz,'La cota es nuestra. FRUST: la batería puede avanzar a la meseta.',2.8]]);later13(4,()=>{if(N18.ph===1)go18(2,false)})}}
 if(N18.sec.iso===null&&N18.iso){const L=N18.iso.filter(alive18);if(!L.length){N18.sec.iso=false;feed('✖ La escuadra aislada fue aniquilada')}else if(N18.T>20&&!left18('iso')&&Math.hypot(pp.x-L[0].g.position.x,pp.z-L[0].g.position.z)<12){N18.sec.iso=true;score+=800;feed('★ OBJETIVO SECUNDARIO · Escuadra aislada rescatada: se unirá al asalto de Falkenbrück');talk([['Danko','¡Pensamos que nadie venía! El 12.º no deja a los suyos.',2.6]]);for(const n of L){n.lock=true;n.post18=null;n.route18=[[WG18(-40),-192]];n.onArr=m=>{m.post18=[m.g.position.x,m.g.position.z]}}}}}
/* ======================= III · LAS SOMBRAS DEL CIELO ======================= */
function st2_18(jump){N18.st=0;if(!jump)sky18('morning',40);airHooks18();
 const pits=(K18.battery&&K18.battery.pits&&K18.battery.pits.length?K18.battery.pits:[[-52,-405],[-40,-408],[-28,-405]]).slice(0,3);N18.pits=pits;N18.how=[];N18.trc=[];
 for(let i=0;i<3;i++){const tr=veh18('tractor38','volsk',-6+i*8,-282-i*9,Math.PI),gn=veh18('howitzer38','volsk',-6+i*8,-278-i*9,Math.PI);if(tr&&gn){try{tow38(tr,gn)}catch(e){}tr.keepPh=gn.keepPh=3;N18.trc.push(tr);N18.how.push(gn);ord18(tr,{mode:'advance',path:[[-4+i*4,-320],[-20,-360],[pits[i][0],pits[i][1]+12]],speed:3.6})}}
 for(let i=0;i<Math.round(5*DIF18());i++)q18(i===0?'bar':'mosin',[[-70,-372],[-60,-376],[-48,-366],[-80,-356]],{tag:'farm',hold:i<2,fb:30,kind:i===0?'mg':'rifle'});
 N18.nests=[aaNest18(0,true),aaNest18(1,true)];secA18('mz',4,[[30,-300],[20,-360],[8,-392]],[[6,-392],[12,-396],[-2,-398],[18,-390]],{nm:'Fusilero'});
 obj18('Escoltá a la batería FRUST hasta la loma de la meseta',-40,-395);bcn18(-40,-395);talk([[NM18.moroz,'La batería sube a la meseta. Limpien la granja: no quiero tiradores a su flanco.',3]]);
 for(const n of N18.all)if(n.sq18){n.on=true;n.lock=false}}
const GW18=[[['scout','scout','line']],[['line','lancer','line']],[['heavy','captain','line','scout']]];
function upd2_18(dt){const pp=P.g.position;
 if(N18.st===0){let arr=0;N18.trc.forEach((t,i)=>{if(t&&t.alive&&N18.how[i]&&N18.how[i].h38&&N18.how[i].h38.st==='towed'){const pt=N18.pits[i];if(Math.hypot(t.g.position.x-WG18(pt[0]),t.g.position.z-(pt[1]+12))<6){try{unlimber38(N18.how[i],{face:Math.PI,fire:true})}catch(e){}crew18(N18.how[i],3)}}else arr++});
  if((arr>=3||N18.T>90)&&Math.hypot(pp.x-WG18(-40),pp.z+395)<60){N18.st=1;N18.T=0;N18.wv=0;N18.gk0=N18.gk;bcnClr18();feed('La batería FRUST se despliega en la loma');talk([[NM18.orlov,'¡Ahí vienen! ¡GRIFOS, del norte!',2],[NM18.moroz,'¡A los nidos antiaéreos! ¡Que no toquen los cañones!',2.6]]);if(N18.sec.pilot)later13(8,()=>{airSpawn38('plane','A',{from:'s',jit:80});radio28('Chaika 3','Chaika 3 sobre la meseta. Gracias por Lasko, infantería.',2.4)})}
  obj18('Escoltá a la batería FRUST hasta la loma de la meseta'+(left18('farm')?' · despejá la granja':''),-40,-395);return}
 if(N18.st===1){const need=DK18(4,5,6),got=N18.gk-N18.gk0;N18.wt=(N18.wt||0)-dt;
  if(N18.wv<GW18.length&&N18.wt<=0&&AIR38.list.filter(a=>a.alive&&a.side==='veyrn').length<2){const W=GW18[N18.wv];for(const v of W[0])grif18(v,{});N18.wv++;N18.wt=25;if(N18.wv===2)later13(10,()=>{const a=AIR38.list.find(q=>q.alive&&q.side==='veyrn'&&q.var==='line'&&q.rider);const s=K18.aaNests[1];if(a&&s){airOrder38(a,{mode:'land',at:[s[0],s[1]-2]});feed('¡Un grifo baja en picado sobre el nido antiaéreo del este!')}})}
  obj18('Defendé la batería FRUST de los grifos · derribados '+got+'/'+need+' · cañones en pie '+N18.how.filter(v=>v.alive).length+'/3 · usá las ametralladoras de los nidos',-40,-405);
  if(got>=need||(N18.T>170&&N18.wv>=GW18.length)){N18.st=2;N18.T=0;N18.sec.bat=N18.how.filter(v=>v.alive).length>=2&&N18.trc.some(t=>t&&t.alive);score+=1200;
   feed(N18.sec.bat?'★ OBJETIVO SECUNDARIO · Batería intacta: el FRUST tendrá salvas de apoyo en la ciudad':'✖ La batería quedó diezmada: poco apoyo de artillería en la ciudad');
   talk([[NM18.moroz,'Se van… por ahora. FRUST, enganchen y avancen detrás de nosotros.',2.8]]);N18.how.forEach((g,i)=>{const t=N18.trc[i];if(g&&g.alive&&t&&t.alive)try{limber38(g,t);later13(5,()=>ord18(t,{mode:'advance',path:[[-30,-440],[-10,-462]],speed:3.4}))}catch(e){}});bcn18(0,-468,0x9adfff)}}
 if(N18.st===2){obj18('La batería se redespliega · avanzá hacia el camino de Falkenbrück',0,-468);if(Math.hypot(pp.x-X18,pp.z+468)<20||N18.T>80)go18(3,false)}}
/* ======================= IV · CUERVOS DEL NORTE ======================= */
function st3_18(jump){N18.st=0;airHooks18();if(jump)N18.nests=[aaNest18(0,true),aaNest18(1,true)];
 const fg=veh18('fieldgun32','veyrn',8,-506,0);if(fg){crew18(fg,2);N18.opGun=fg}for(let i=0;i<Math.round(6*DIF18());i++)q18(i===0?'bar':i%3?'mosin':'stv',[[-12+i*4,-508],[14,-512],[-16,-500]],{tag:'op',hold:i<2,fb:30,kind:i===0?'mg':i%3?'rifle':'storm'});
 secA18('ma',4,[[-60,-440],[-50,-470],[-40,-492]],[[-40,-492],[-36,-496],[-44,-494],[-30,-490]],{nm:'Fusilero'});
 obj18('Avanzá por la meseta hacia la muralla',0,-490);
 /* evento: un V-19 sale de la niebla y derriba a un grifo */
 later13(4,()=>{if(N18.ph!==3)return;const pp=P.g.position,fx=-Math.sin(yaw),fz=-Math.cos(yaw);const g=airSpawn38('griffin','line',{world:true,x:pp.x+fx*200,z:pp.z+fz*200,y:32,force:1,hdg:yaw+Math.PI});const p=airSpawn38('plane','B',{world:true,x:pp.x-fx*260,z:pp.z-fz*260,y:45,force:1,hdg:yaw});if(g&&p)airOrder38(p,{mode:'attack',tgt:{k:'air',o:g}});
  later13(5,()=>{if(g&&g.alive)airDmg38(g,999,'b','a')});radio28('Chaika 1','¡Cuervos del Norte sobre la meseta! ¡Tally-ho, grifos a las doce!',2.6);later13(7,()=>talk([[NM18.belik,'¡Lo bajó! ¡¿Vieron eso?! ¡Lo bajó de un tirón!',2.4],[NM18.orlov,'Los Chaika. Ahora sí es una pelea pareja.',2.2]]))});
 later13(9,()=>{if(N18.ph!==3)return;const n=2+(N18.sec.pilot?1:0);for(let i=0;i<n;i++)airSpawn38('plane',i?'A':'B',{from:'s',jit:120});for(const v of['line','scout','line','heavy'].slice(0,DK18(3,3,4)))grif18(v,{});N18.st=1;N18.T=0;
  talk([[NM18.moroz,'¡Puesto avanzado delante de la puerta sur! Marquen el blanco: los Picador lo revientan.',3]]);bcn18(4,-506,0xff8040)})}
function upd3_18(dt){const pp=P.g.position;if(N18.st===0)return;
 N18.at=(N18.at||0)-dt;if(N18.at<=0){N18.at=20;if(AIR38.list.filter(a=>a.alive&&a.side==='veyrn').length<2&&N18.T<160)grif18(R()<.5?'line':'scout',{})}
 if(N18.st===1){const gunOK=N18.opGun&&N18.opGun.alive&&N18.opGun.fire!==false;obj18('Destruí el puesto avanzado frente a la puerta sur · marcá el blanco y pedí los Picador (B / APO · quedan '+N18.pic+')',4,-506);
  if(N18.T>5&&!left18('op')&&!(N18.opGun&&N18.opGun.alive&&N18.opGun.gc&&N18.opGun.gc.state==='manned')){N18.st=2;bcnClr18();score+=1000;feed('★ PUESTO AVANZADO DESTRUIDO');bcn18(0,-530,0x9adfff);talk([[NM18.moroz,'¡A la puerta! ¡Falkenbrück nos espera!',2.2]])}}
 if(N18.st===2){obj18('Llegá a la puerta sur de Falkenbrück',0,-530);if(Math.hypot(pp.x-X18,pp.z+530)<14)go18(4,false)}}
/* ======================= V · FALKENBRÜCK ======================= */
function st4_18(jump){N18.st=0;airHooks18();if(!jump)sky18('morning',30);N18.arm=['rifle','revolver','smg'];if(P.weapons.smg.reserve<100){P.weapons.smg.reserve=140;feed('★ Recogés un subfusil Sorvin M21 de la armería de la puerta')}
 for(let i=0;i<Math.round(4*DIF18());i++)q18(i%2?'stv':'mosin',[[-8+i*5,-556],[6,-562],[-6,-566]],{tag:'gate',kind:i%2?'storm':'rifle',hold:i===0,fb:30});
 for(let i=0;i<Math.round(6*DIF18());i++)q18(i===1?'bar':i%2?'stv':'mosin',[[-8,-582-i*4],[8,-586-i*4],[0,-598]],{tag:'av',kind:i===1?'mg':i%2?'storm':'rifle',hold:i<2,fb:40});
 /* barricada de piedra en la calle transversal */{const g=new T.Group(),q=PB();for(let i=0;i<6;i++)pBox(q,1.6,1.2+R()*.6,1.2,0x7a766c,(i-2.5)*1.5,.7,(R()-.5)*.4,0,R()*.3,0);for(let i=0;i<3;i++)pBox(q,1.4,.8,1,0x6a665c,(i-1)*1.5,1.6,0);pbMesh(q,g,VCV);g.position.set(WG18(-40),0,-604);g.rotation.y=Math.PI/2;scene.add(g);N18.barr={g,ob:[{x:WG18(-40),z:-604,hw:.8,hd:4.6,h:2}]};obstB.push(N18.barr.ob[0])}
 if(N18.sec.cmd===null){const c=veh18('obsCar38','veyrn',100,-656,Math.PI/2);if(c){ord18(c,{mode:'hold'});try{obsMast38(c,true)}catch(e){}N18.cmdV=c;work18(98,-653,'Colocar una carga en el vehículo de mando',2.4,()=>{feed('Carga colocada · ¡alejate!');charge18(99,-654,5,()=>{dmgV18(c,5000,'x')},{defuse:false,by:'p',col:0xffa020})},{ok:()=>c.alive,r:3.4})}
  for(let i=0;i<3;i++)q18('mosin',[[92+i*4,-648],[104,-662]],{tag:'cmd',fb:40})}
 if(N18.sec.iso){secA18('iso',3,[[-130,-540],[-120,-580],[-120,-604],[-85,-604]],[[-85,-606],[-88,-602],[-82,-604]],{nm:'Soldado (escuadra Danko)',mg:true});feed('La escuadra de Danko entra por la puerta del ferrocarril')}
 secA18('ve',4,[[60,-535],[60,-560],[60,-604]],[[58,-604],[62,-600],[60,-608],[56,-600]],{nm:'Fusilero'});
 obj18('Entrá en Falkenbrück por la puerta sur',0,-548);bcn18(0,-548,0x9adfff);for(const n of N18.all)if(n.sq18){n.on=true;n.lock=false}
 later13(3,()=>talk([[NM18.moroz,'Calle por calle, casa por casa. Ojo con los techos: los grifos se posan ahí.',2.8]]))}
function upd4_18(dt){const pp=P.g.position;
 if(N18.st===0&&pp.z<-552){N18.st=1;bcnClr18();obj18('Avanzá por la avenida principal',0,-600)}
 if(N18.st===1){obj18('Avanzá por la avenida principal · enemigos '+left18('av'),0,-600);
  if(pp.z<-578&&once18('tank')){/* el tanque veyrn rompe la barricada */const tk=veh18('tank32','veyrn',-78,-604,Math.PI/2);N18.etank=tk;if(tk){ord18(tk,{mode:'advance',path:[[-40,-604],[-16,-604],[-6,-612]],speed:4});feed('¡Motor de tanque en la calle oeste!')}
   later13(9,()=>{if(N18.barr){for(const o of N18.barr.ob){const i=obstB.indexOf(o);if(i>=0)obstB.splice(i,1)}const p=N18.barr.g.position;bx12(p.x,1,p.z,1.2);smoke(p.x,1,p.z,4,5,0x8a8478,2,.6);expSnd(p.x,p.z,1);scene.remove(N18.barr.g);N18.barr=null;feed('¡El tanque veyrn arrolla la barricada de piedra!')}});
   later13(16,()=>{if(N18.ph!==4)return;if(N18.etank&&N18.etank.alive){gunFx18(N18.etank)}collapse18('casa');shake=Math.max(shake,1.4);N18.st=2;N18.T=0;feed('¡El edificio se derrumba sobre la avenida!');talk([[NM18.orlov,'¡La avenida está cortada! ¡Por la calle del oeste!',2.4]]);
    later13(14,()=>{if(N18.etank&&N18.etank.alive){const p=N18.etank.g.position;const a=airSpawn38('plane','D',{from:'s',force:1,y:110});airOrder38(a,{mode:'dive',at:[p.x-X18,p.z]});radio28('Picador 1','Picador sobre el tanque de la avenida. ¡Bomba fuera en diez!',2.6);later13(12,()=>{if(N18.etank&&N18.etank.alive)dmgV18(N18.etank,900,'x')})}})})}}
 if(N18.st===2){const w=[[-85,-604],[-85,-648],[-24,-650]];N18.wi2=N18.wi2||0;const c=w[N18.wi2];if(c&&Math.hypot(pp.x-WG18(c[0]),pp.z-c[1])<9)N18.wi2++;const nx=w[Math.min(N18.wi2,2)];obj18('La avenida quedó cortada: rodeá por la calle oeste hasta la plaza del mercado',nx[0],nx[1]);
  if(N18.wi2>=2||pp.z<-640){N18.st=3;N18.T=0;for(let i=0;i<Math.round(7*DIF18());i++)q18(i===0?'bar':i%3?'mosin':'stv',[[10,-660],[-12,-668],[16,-640],[0,-675]],{tag:'plz',kind:i===0?'mg':i%3?'rifle':'storm',hold:i<2,fb:30});q18('mosin',[4,-672],{tag:'plz',kind:'officer',fb:30});
   later13(6,()=>{if(N18.ph!==4)return;for(const v of['line','scout','line'].slice(0,DK18(2,3,3)))grif18(v,{from:'n',y:22,jit:40});feed('¡Grifos rasantes sobre la plaza!');later13(10,()=>{airSpawn38('plane','A',{from:'s',jit:60,patrol:[0,-650,160]});radio28('Chaika 2','Chaika 2 sobre la plaza. Los tengo.',2)})})}}
 if(N18.st===3){const k=capZ18('plz',X18,-650,22,DK18(15,20,25),dt);obj18('Tomá la plaza del mercado '+bar10(k)+(N18.sec.cmd===null?' · (opcional) destruí el vehículo de mando junto a la fábrica':''),0,-650);
  if(k>=1&&!left18('plz')){N18.st=4;score+=1200;feed('★ PLAZA DEL MERCADO TOMADA');talk([[NM18.moroz,'La plaza es nuestra. FRUST entra por la puerta del ferrocarril: ¡a la estación!',2.8]]);later13(5,()=>{if(N18.ph===4)go18(5,false)})}}
 if(N18.sec.cmd===null&&N18.cmdV&&!N18.cmdV.alive){N18.sec.cmd=true;score+=900;feed('★ OBJETIVO SECUNDARIO · Vehículo de mando destruido: el contraataque blindado llegará desorganizado');radio28('FRUST','Su radio de mando calló. Bien hecho, 12.º.',2.2)}}
/* ======================= VI · FRUST ======================= */
const JUNC18=[-130,-722];
function st5_18(jump){N18.st=0;if(N18.sec.cmd===null)N18.sec.cmd=false;if(!jump)sky18('day',60);else sky18('day');airHooks18();
 const s1=veh18('spg38','volsk',-130,-560,Math.PI),s2=veh18('spg38','volsk',-124,-548,Math.PI),tr=veh18('tractor38','volsk',-136,-536,Math.PI),hw=veh18('howitzer38','volsk',-136,-532,Math.PI),am=veh18('ammoTruck38','volsk',-128,-524,Math.PI);
 if(tr&&hw)try{tow38(tr,hw)}catch(e){}N18.fr6={s1,s2,tr,hw,am};ord18(s1,{mode:'advance',path:[[-120,-600],[-112,-660],[-140,-684]],speed:3.4});ord18(s2,{mode:'advance',path:[[-120,-600],[-108,-660],[-116,-706]],speed:3.4});ord18(tr,{mode:'advance',path:[[-120,-600],[-110,-650],[-146,-688]],speed:3.2});ord18(am,{mode:'advance',path:[[-120,-610],[-104,-660]],speed:3.6});
 secA18('yd',4,[[-100,-650],[-110,-680],[-118,-700]],[[-118,-702],[-122,-706],[-112,-698],[-128,-700]],{nm:'Fusilero',mg:true});
 /* puente ferroviario (secundario): zapadores veyrn lo están minando */
 if(N18.sec.brg===null){N18.brgC=[];for(const p of[[-128,-826],[-132,-836]])N18.brgC.push(charge18(p[0],p[1],DK18(240,190,160),()=>{N18.sec.brg=false;feed('✖ El puente ferroviario voló: el tren blindado no podrá entrar a la ciudad')},{lbl:'Desactivar la carga del puente ferroviario',onDef:()=>{if(N18.brgC.every(c=>c.done&&c.t>0)){N18.sec.brg=true;score+=900;feed('★ OBJETIVO SECUNDARIO · Puente ferroviario salvado: el tren blindado «Zarya» podrá apoyarnos')}}}));for(let i=0;i<2;i++)q18('mosin',[[-126,-818],[-134,-814]],{tag:'brg',kind:'eng',fb:40})}
 N18.wv=0;N18.wt=20;obj18('Escoltá al FRUST hasta la playa de vías y defendé los cañones mecanizados',-125,-690);bcn18(-125,-690,0x9adfff);
 talk([[NM18.moroz,'Los cañones mecanizados entran a la playa de vías. Veyrn va a contraatacar con blindados desde el norte.',3.2],[NM18.varga,'Si vuelan el empalme, el tren no entra. Yo cuido las vías, teniente.',2.6]]);for(const n of N18.all)if(n.sq18){n.on=true;n.lock=false}}
function wave6_18(i){const k=N18.sec.cmd?.7:1,n=Math.round([6,7,6][i]*DIF18()*k);const S=[[-140,-800],[-112,-792],[-162,-772],[-96,-786]];for(let j=0;j<n;j++)q18(j%3===2?'stv':'mosin',S,{tag:'w6',kind:j%3===2?'storm':'rifle',goal:[-125+(R()-.5)*30,-712]});
 if(i===0){const a=veh18('armcar32','veyrn',-130,-830,Math.PI);ord18(a,{mode:'advance',path:[[-128,-790],[-130,-745]]})}
 if(i===1&&!N18.sec.cmd){const t=veh18('tank32','veyrn',-112,-808,Math.PI);ord18(t,{mode:'advance',path:[[-114,-770],[-122,-738]]})}
 if(i===2){for(let j=0;j<DK18(2,3,3);j++)q18('mosin',[[-150,-780],[-160,-790]],{tag:'sap',kind:'eng',goal:JUNC18});const t=veh18('tank32','veyrn',-150,-812,Math.PI);ord18(t,{mode:'advance',path:[[-152,-770],[-140,-740]]})}
 feed(['¡Contraataque veyrn desde el norte!','¡Blindados enemigos en la playa de vías!','¡Zapadores veyrn van hacia el empalme!'][i])}
function upd5_18(dt){const pp=P.g.position,F=N18.fr6||{};
 if(F.hw&&F.hw.h38&&F.hw.h38.st==='towed'&&F.tr&&F.tr.alive&&Math.hypot(F.tr.g.position.x-WG18(-146),F.tr.g.position.z+688)<6&&!N18.ev.unl){N18.ev.unl=1;try{unlimber38(F.hw,{face:Math.PI})}catch(e){}crew18(F.hw,3)}
 if(N18.st===0){if(N18.T>14||Math.hypot(pp.x-WG18(-125),pp.z+690)<30){N18.st=1;N18.T=0;bcnClr18()}obj18('Escoltá al FRUST hasta la playa de vías',-125,-690);return}
 if(N18.st===1){N18.wt-=dt;const bus=left18('w6')+left18('sap')+vehs18().filter(v=>v.side==='veyrn').length;
  if(N18.wv<3&&(N18.wt<=0||(bus<2&&N18.wt<10))){wave6_18(N18.wv);N18.wv++;N18.wt=45;
   if(N18.wv===2)later13(8,()=>{const g=F.hw,t=F.tr;if(g&&g.alive&&t&&t.alive&&g.h38&&g.h38.st==='ready'){try{limber38(g,t)}catch(e){}feed('El FRUST cambia de posición el obús bajo el fuego');later13(6,()=>{ord18(t,{mode:'advance',path:[[-110,-690]],speed:3.4});N18.ev.unl2=1})}});
   if(N18.wv===2&&F.am&&F.am.alive)later13(4,()=>{ord18(F.am,{mode:'advance',path:[[-130,-686],[-118,-700]],speed:3});feed('El camión de municiones reabastece a las piezas')})}
  if(N18.ev.unl2&&!N18.ev.unl3&&F.tr&&F.tr.alive&&Math.hypot(F.tr.g.position.x-WG18(-110),F.tr.g.position.z+690)<5){N18.ev.unl3=1;try{unlimber38(F.hw,{face:Math.PI})}catch(e){}}
  /* zapadores: si llegan al empalme, plantan la carga */
  for(const e of foes18('sap')){if(e.chg18)continue;const d=Math.hypot(e.g.position.x-WG18(JUNC18[0]),e.g.position.z-JUNC18[1]);if(d<4){e.jt=(e.jt||0)+dt;if(e.jt>3){e.chg18=1;N18.jc=charge18(JUNC18[0]+(R()-.5)*2,JUNC18[1],DK18(35,25,18),()=>{N18.junc=false;feed('✖ ¡Volaron el empalme ferroviario!');score=Math.max(0,score-800)},{lbl:'Desactivar la carga del empalme'});feed('¡Carga colocada en el empalme! ¡Desactivala!');talk([[NM18.varga,'¡Pusieron una carga en las agujas! ¡Rápido!',2]])}}}
  const al=[F.s1,F.s2,F.hw].filter(v=>v&&v.alive).length,jc=N18.jc&&!N18.jc.done;obj18('Defendé los cañones FRUST del contraataque blindado · oleada '+N18.wv+'/3 · piezas '+al+'/3'+(jc?' · ¡DESACTIVÁ LA CARGA DEL EMPALME!':'')+(N18.sec.brg===null?' · (opcional) desactivá las cargas del puente ferroviario':''),jc?N18.jc.x-X18:-125,jc?N18.jc.z:-712);
  if(N18.wv>=3&&N18.T>20&&!jc&&!left18('w6')&&!left18('sap')&&!vehs18().some(v=>v.side==='veyrn'&&v.type!=='gun')){N18.st=2;score+=1500;if(N18.sec.brg===null)N18.sec.brg=false;feed('★ CONTRAATAQUE BLINDADO RECHAZADO');talk([[NM18.moroz,'¡Aguantaron! Ahora la ciudadela. Rauth y sus grifos no se van a ir sin pelear.',3]]);later13(5,()=>{if(N18.ph===5)go18(6,false)})}}}
/* ======================= VII · LA BANDERA SOBRE FALKENBRÜCK ======================= */
const TWR18=[25,-795],FLG18=[-20,-792];
function st6_18(jump){N18.st=0;if(N18.sec.brg===null)N18.sec.brg=false;sky18('day');airHooks18();N18.tw=100;
 for(let i=0;i<Math.round(8*DIF18());i++)q18(i<2?'bar':i%3?'mosin':'stv',[[-14,-780],[14,-784],[-20,-800],[16,-804],[0,-776],[-24,-786]],{tag:'cit',kind:i<2?'mg':i%3?'rifle':'storm',hold:i<3,fb:30});
 secA18('cw',4,[[-60,-740],[-40,-760],[-36,-790]],[[-36,-788],[-38,-794],[-34,-782],[-30,-790]],{nm:'Fusilero'});
 if(N18.sec.brg){const t=train18(-560,-705,8,true);N18.aaT={x:-130,z:-705,r:230,rate:.5,dmg:13,y:3};AIR38.aa.push(N18.aaT);feed('El tren blindado «Zarya» entra en la estación y abre fuego antiaéreo')}
 if(N18.sec.iso)secA18('iso',3,[[40,-740],[30,-762],[22,-776]],[[22,-776],[26,-778],[18,-778]],{nm:'Soldado (escuadra Danko)',mg:true});
 obj18('Tomá la ciudadela · entrá por el túnel carretero o la puerta oeste',0,-768);bcn18(0,-766,0x9adfff);for(const n of N18.all)if(n.sq18){n.on=true;n.lock=false}
 later13(2,()=>talk([[NM18.moroz,'Última jornada, muchachos. La torre de radio y el mástil. Después, descanso.',2.8]]))}
function rauth18(){const a=grif18('rauth',{from:'n',noRetreat:false,hpK:DK18(.8,1,1.15)});N18.rA=a;N18.rauth='on';for(const v of['guard','guard','guard'].slice(0,N18.sec.cmd?DK18(1,1,2):DK18(1,2,3)))grif18(v,{from:'n'});
 radio28('Vigía','¡Grifo negro con capa! ¡Es Rauth, sobre Eisenkrall! ¡Va por la torre!',3);feed('★ Capitán Rauth sobre «Eisenkrall»');later13(5,()=>{for(let i=0;i<2+(N18.sec.pilot?1:0);i++)airSpawn38('plane',i?'A':'B',{from:'s',jit:120})})}
function twUpd18(dt){const a=N18.rA;if(!a||!a.alive||N18.rauth!=='on')return;N18.rt=(N18.rt||0)-dt;if(N18.rt<=0&&!/flee|down|lapp|ground/.test(a.st)){N18.rt=10;airOrder38(a,{mode:'attack',tgt:{k:'pt',p:new T.Vector3(WG18(TWR18[0]),24,TWR18[1])}})}
 const d=Math.hypot(a.p.x-WG18(TWR18[0]),a.p.z-TWR18[1]),alt=a.p.y;if(d<18&&alt<48&&(!a.tw18||time-a.tw18>6)){a.tw18=time;N18.tw-=DK18(14,20,26);fb12(a.p.x,30,a.p.z,5,.3,0);if(typeof sparks12==='function')sparks12(WG18(TWR18[0]),26,TWR18[1]);expSnd(WG18(TWR18[0]),TWR18[1],.8);const s=N18.tw<=0?3:N18.tw<40?2:N18.tw<75?1:0;if(s>(K18.commTower.stage||0)){towerDmg18(s);feed(['','¡La torre pierde las antenas!','¡El tramo superior de la torre se dobla!','✖ ¡La torre de comunicaciones se desploma!'][s])}}}
function upd6_18(dt){const pp=P.g.position;twUpd18(dt);
 if(N18.st===0){obj18('Tomá la ciudadela · defensores '+left18('cit'),0,-790);if(N18.T>8&&!left18('cit')){N18.st=1;N18.T=0;bcnClr18();bcn18(TWR18[0],TWR18[1]+5,0x9adfff);score+=1000;feed('★ CIUDADELA TOMADA');later13(6,()=>{if(N18.ph===6)rauth18()});
   for(let i=0;i<Math.round(8*DIF18());i++)q18(i%2?'stv':'mosin',[[-8,-850],[8,-856],[20,-848],[-20,-852]],{tag:'cw',kind:i%2?'storm':'rifle',goal:[(R()-.5)*20,-800]});feed('¡Contraofensiva veyrn desde el puente norte!')}}
 if(N18.st===1){const k=capZ18('tw',WG18(TWR18[0]),TWR18[1]+4,10,DK18(18,24,30),dt);obj18('Asegurá la torre de comunicaciones '+bar10(k)+' · torre '+Math.max(0,Math.round(N18.tw))+'%'+(N18.rauth==='on'?' · ¡derribá o espantá a Rauth!':''),TWR18[0],TWR18[1]+4);
  if(N18.T>30&&once18('g2'))for(const v of['guard','line'])grif18(v,{});
  if(k>=1&&(N18.rauth==='down'||N18.rauth==='fled'||N18.T>150)&&!left18('cw')){N18.st=2;N18.T=0;bcnClr18();bcn18(FLG18[0],FLG18[1],0xffe080);score+=1200;if(N18.rauth==='on'&&N18.rA&&N18.rA.alive){airOrder38(N18.rA,{mode:'retreat'});N18.rauth='fled'}
   talk([[NM18.moroz,(K18.commTower.stage||0)<3?'La torre es nuestra. ¡Ahora el mástil! ¡La bandera del 12.º!':'Perdimos la torre, pero no la ciudadela. ¡Al mástil! ¡La bandera!',3]]);
   work18(FLG18[0],FLG18[1]+1,'Izar la bandera del 12.º Regimiento',3,flag18,{r:3})}}
 if(N18.st===2)obj18('Izá la bandera del 12.º Regimiento en el mástil de la ciudadela',FLG18[0],FLG18[1])}
function flag18(){N18.st=3;N18.flag=1;bcnClr18();obj18('La bandera del 12.º flamea sobre Falkenbrück');const g=new T.Group();g.position.set(WG18(FLG18[0])+.12,1.6,FLG18[1]);scene.add(g);N18.flagG=g;try{const f=flag38('volsk12',{w:1.8,h:1.4});g.add(f)}catch(e){const m=new T.Mesh(new T.PlaneGeometry(1.8,1.3),new T.MeshLambertMaterial({color:0x2a4a8a,side:T.DoubleSide}));m.position.x=.9;g.add(m)}
 feed('★ ¡LA BANDERA DEL 12.º SUBE SOBRE FALKENBRÜCK!');score+=2000;talk([[NM18.orlov,'¡Mírenla! ¡Arriba, arriba!',2],[NM18.belik,'¡Hurra por el 12.º! ¡Hurra por el FRUST!',2.4]]);N18.fy=0;
 later13(7,()=>{for(let i=0;i<3;i++){const p=airSpawn38('plane',i?'A':'B',{world:true,x:WG18(-40+i*40),z:-560,y:40+i*4,force:1,hdg:Math.PI});if(p)airOrder38(p,{mode:'patrol',at:[0,-900],r:80})}radio28('Chaika 1','Escuadrilla Chaika saluda a la ciudadela. ¡Viva el 12.º!',2.6)});later13(12,cineEnd18)}
function cineEnd18(){if(N18.ph!==6||N18.endC)return;N18.endC=1;const f=FLG18;for(let i=0;i<5;i++)airSpawn38('griffin',['line','heavy','line','scout','captain'][i],{x:-260+i*120,z:-1150-i*30,y:150+i*10,force:1,hdg:Math.PI/2,patrol:[0,-1250,300]});scene.fog.far=Math.max(scene.fog.far,700);W18.fogF=Math.max(W18.fogF,700);
 cine9([{d:6,a:[WG18(f[0]+4),3,f[1]+8],b:[WG18(f[0]+8),8,f[1]+16],la:[WG18(f[0]),11,f[1]],txt:'FALKENBRÜCK · 22 DE ENERO DE 1923 · 13:40'},{d:9,a:[WG18(f[0]+10),14,f[1]+30],b:[WG18(f[0]+40),70,f[1]+150],la:[WG18(0),5,-790],txt:''},{d:9,a:[WG18(30),80,-640],b:[WG18(20),95,-600],la:[WG18(0),120,-1200],txt:''}],()=>end(true),
  [{t:5.5,fn:()=>radio28(NM18.moroz,MOROZ18,16)},{t:21.5,fn:()=>say('Más allá de las montañas, nuevas alas… · CONTINUARÁ',3.5),must:true}])}
/* ---------------------------------------------------------------------
   BUCLE DEL NIVEL
   --------------------------------------------------------------------- */
function fx18(dt,cine){if(cine){AIR38.fr++;try{airUpd38(dt)}catch(e){}}if(L13.tq.length){for(const q of L13.tq)q.t-=dt;const due=L13.tq.filter(q=>q.t<=0);L13.tq=L13.tq.filter(q=>q.t>0);for(const q of due)try{q.f()}catch(e){console.warn('fx18',e)}}skyMesh.position.copy(cam.position);if(cine){updParts(dt);updRag(dt)}
 smokeUpd(dt);tracerUpd(dt);fireUpd(dt);lightsUpd(dt);fbUpd12(dt);if(L9.tick)L9.tick(dt);else npcUpd11(dt);if(!cine)dlgUpd(dt);shellUpd18(dt);chgUpd18(dt);for(const b of N18.bc)beaconUpd17(b,time);
 try{vehUpd32(dt)}catch(e){if(!N18.vw){N18.vw=1;console.warn('vehUpd32',e)}}try{weather18(dt)}catch(e){}if(N18.flagG&&N18.flagG.position.y<11.4)N18.flagG.position.y+=dt*1.25}
const UPD18=[upd0_18,upd1_18,upd2_18,upd3_18,upd4_18,upd5_18,upd6_18];
const WN18={rifle:'FUSIL VOLSK M11 · 7,62',revolver:'REVÓLVER KARSK M95',smg:'SUBFUSIL SORVIN M21'};
function updT18(dt){const t0=performance.now();N18.los=0;N18.capTxt='';N18.capTgt=null;fx18(dt,false);allyUpd18(dt);pump18(dt);tac18(dt);farFx18(dt);if(N18.ph===0)try{stealth13(dt)}catch(e){}
 N18.T+=dt;UPD18[N18.ph](dt);if(N18.capTgt&&!L9.cine)L9.obj=N18.capTgt;workUpd18(dt);
 const pp=P.g.position;pp.x=CL30(pp.x,WG18(-315),WG18(315));pp.z=CL30(pp.z,-915,118);{const f=floor18(pp.x-X18,pp.z);if(pp.y<f){pp.y=f;P.vy=Math.max(0,P.vy);P.gnd=true}}
 if(!L9.cine){if(N18.ot)$('obj').textContent=N18.ot;if(!P.mg){const w=P.weapons[P.cur];$('ammo').textContent=w?(WN18[P.cur]||'')+(P.rel>0?' · RECARGANDO':' · '+w.mag+' / '+w.reserve)+' · GRANADAS '+P.grenades+(N18.ph>=3?' · APOYO '+(N18.ph<=4?'PICADOR '+N18.pic:'FRUST '+N18.art):''):''}}
 const el=$('gar'),S=N18.sq.length;if(S&&!L9.cine){el.style.display='block';el.innerHTML='ESCUADRA DE ORLOV <b>'+S+'</b>'+(N18.all.some(n=>alive18(n)&&n.sq18&&n.down17)?' · <b style="color:#ff8a6a">HERIDOS</b>':'')+' · ORDEN: '+({follow:'SEGUIR',advance:'AVANZAR',hold:'MANTENER'}[AI30.ord])+' (T/ORD)'}else el.style.display='none';
 const b=$('bap18');if(b)b.style.display=N18.ph>=3&&!L9.cine?'flex':'none';ambUpd(dt,.85);
 const ms=performance.now()-t0;N18.dbg.ms+=ms;N18.dbg.n++;if(ms>N18.dbg.msMax)N18.dbg.msMax=ms}
function startLevel18(){level=18;clearStage();WC.x=X18;WC.z=-400;WC.r=700;mobs.forEach(m=>scene.remove(m.g));mobs=[];convoy.forEach(v=>scene.remove(v.g));convoy=[];npcs.forEach(n=>scene.remove(n.g));npcs=[];lightsInit();for(const p of LT.pts)p.on=false;searchSet(false);
 for(const s of GAR)scene.remove(s.g);GAR.length=0;for(const c of CAV)if(c.g)scene.remove(c.g);CAV.length=0;CAVS.st='off';L9.tgts=[];L9.def=false;L9.obj=null;L9.cine=0;if(L10.eis)eisOff();if(L12.skin)leave12();if(L13.on)leave13();if(L14.on)leave14();if(typeof L28!=='undefined'&&L28.on)leave28();if(N16.on)leave16();if(N17.on)leave17();
 allies.forEach(a=>{if(a.name)a.g.visible=false});if(officer)officer.g.visible=false;if(MED)MED.g.visible=false;vmInit13();fbInit12();
 if(!N18.w0)N18.w0=JSON.parse(JSON.stringify(P.weapons));refill(0);Object.assign(P.weapons.rifle,{mag:5,max:5,reserve:40,cd:.55,dmg:42,reload:2.4,fov:4});Object.assign(P.weapons.revolver,{mag:7,max:7,reserve:28,cd:.32,dmg:34,reload:2,fov:4});Object.assign(P.weapons.smg,{mag:35,max:35,reserve:0,cd:.085,dmg:16,reload:2.3,fov:1});P.cur='rifle';P.grenades=2;
 N18.fpv0=fpv;fpv=true;$('tc').style.display='block';playing=true;ambStart();N18.on=true;P.g.visible=true;$('fade12').style.opacity=0;L13.tq=[];L13.ev={};L13.sneak=false;L13.loud=true;AI30.ord='follow';
 Object.assign(N18,{kills:0,lost:0,saved:0,vk:0,gk:0,sup:0,junc:true,rauth:'none',flag:0,endC:0,introSeen:0,t0:time});N18.sec={pilot:null,iso:null,bat:null,cmd:null,brg:null};
 try{VEH32.origin(X18);VEH32.floor=(x,z)=>floor18(x-X18,z)}catch(e){}
 if(!N18.hook){N18.hook=1;const pa=VEH32.allies,ph=VEH32.onAllyHit,pk=VEH32.onKill;VEH32.allies=()=>level===18?N18.all.filter(n=>alive18(n)&&n.g.visible&&!n.down17):(pa?pa():((typeof L13!=='undefined'&&L13.sq)||[]));
  VEH32.onAllyHit=(n,d)=>{if(level===18)return hurtA18(n,d);if(ph)return ph(n,d);n.hp=(n.hp===undefined?100:n.hp)-d;if(n.hp<=0)n.hp=25};VEH32.onKill=v=>{try{if(pk)pk(v)}catch(e){}if(level===18&&v.side==='veyrn'&&!v.k18){v.k18=1;N18.vk++;score+=800;feed('★ Vehículo enemigo destruido')}}}
 buildVarn18();N18.built=true;const cp=+(($('cp18')||{}).value||0);go18(cp,true)}
function leave18(){N18.on=false;if(N18.w0)for(const k in N18.w0)Object.assign(P.weapons[k],N18.w0[k]);if(N18.fpv0!==undefined)fpv=N18.fpv0;const b=$('bap18');if(b)b.style.display='none';try{VEH32.floor=null;VEH32.origin(X17);AIR38.aa.length=0}catch(e){}}
function qa18(){const st=N18;return{ph:st.ph,st:st.st,T:+st.T.toFixed(1),cine:L9.cine,p:[Math.round(P.g.position.x-X18),+P.g.position.y.toFixed(1),Math.round(P.g.position.z)],hp:Math.round(P.hp),obj:($('obj').textContent||'').slice(0,150),pr:($('pr').textContent||'').slice(0,60),en:enemies.filter(e=>e.hp>0).length,q:st.q.length,al:st.all.filter(n=>alive18(n)).length,vis:st.all.filter(n=>alive18(n)&&n.g.visible).length,sq:st.sq.length,dn:st.all.filter(n=>alive18(n)&&n.down17).length,veh:vehs18().map(v=>v.kind+':'+v.side[1]).join(','),air:AIR38.list.filter(a=>a.alive).length,gk:st.gk,kills:st.kills,sec:st.sec,tw:st.tw,rauth:st.rauth,score,playing,ms:+(st.dbg.ms/Math.max(1,st.dbg.n)).toFixed(2),msMax:+st.dbg.msMax.toFixed(1)}}
/* ---------------------------------------------------------------------
   ENVOLTORIOS (sólo actúan en el nivel 18)
   --------------------------------------------------------------------- */
AMBL[18]=['wind','arty','wind','arty','wind','bell'];
$('tc').insertAdjacentHTML('beforeend','<div id="bap18" class="t" style="display:none">APO</div>');document.head.insertAdjacentHTML('beforeend','<style>#bap18{left:16px;top:186px;width:46px;height:46px;font-size:12px;color:#ffd06a;border-radius:10px}@media (max-height:500px){#bap18{top:158px;width:40px;height:40px}}</style>');
$('bap18').addEventListener('touchstart',e=>{support18();e.preventDefault()},{passive:false});addEventListener('keydown',e=>{if(e.code==='KeyB'&&playing&&level===18){support18();e.preventDefault()}});
{const _au=allyUpdate;allyUpdate=function(dt){if(level===18){for(const a of allies)if(a.name)a.g.visible=false;if(officer)officer.g.visible=false;return}return _au(dt)}}
{const _mu=medUpd;medUpd=function(dt){if(level===18){if(MED)MED.g.visible=false;return}return _mu(dt)}}
{const _ai=aiTick20;aiTick20=function(dt){if(level===18)return;return _ai(dt)}}
{const _hp=hitP;hitP=function(d){if(level===18){if(L9.cine)return;VM13.hit=1;d*=DK18(.6,.85,1.1)}_hp(d)}}
{const _k=kill;kill=function(e){if(level===18){N18.kills++;const g=N18.grp[e.t13];if(g)g.k++}return _k(e)}}
{const _h=hurt;hurt=function(e,d,m,by){if(level===18&&e&&e.unaware){e.unaware=false;e.active=true;e.alert=.2;for(const q of enemies)if(q.unaware&&q.t13===e.t13&&Math.hypot(q.g.position.x-e.g.position.x,q.g.position.z-e.g.position.z)<40){q.unaware=false;q.active=true}}return _h(e,d,m,by)}}
{const _b=boom;boom=function(pos){const r=_b.apply(this,arguments);if(level===18&&pos){try{if(N18.bk)for(const b of N18.bk)if(!b.done&&Math.hypot(pos.x-WG18(b.mg[0]),pos.z-b.mg[1])<3.2)bkDone18(b,'p');for(const v of vehs18())if(v.side==='veyrn'&&Math.hypot(v.g.position.x-pos.x,v.g.position.z-pos.z)<3.5)dmgV18(v,v.type==='tank'?220:320,'x')}catch(e){}}return r}}
{const _o=orderLt;orderLt=function(){if(playing&&level===18){const lv=level;level=16;try{_o()}finally{level=lv}return}return _o()}}
{const _m=mm27;mm27=function(dt){if(level===18){const lv=level,sq=L13.sq,ld=L13.loud;level=13;L13.sq=N18.sq;L13.loud=true;try{_m(dt)}finally{level=lv;L13.sq=sq;L13.loud=ld}return}return _m(dt)}}
{const _sw=swap;swap=function(){if(level===18&&playing){if(L9.cine||VM13.seq||P.mg)return;const A=N18.arm||['rifle'];P.cur=A[(A.indexOf(P.cur)+1)%A.length];P.rel=0;P.reloading=null;VM13.lift=0;return}_sw()}}
{const _fi=fire;fire=function(){if(level===18&&playing){if(L9.cine)return;if(P.mg)return _fi();const A=N18.arm||['rifle'];if(!A.includes(P.cur))P.cur=A[0];const n=bullets.length;_fi();if(bullets.length>n){VM13.k=1;VM13.sl=1;vmShell13()}return}return _fi()}}
{const _in=interact;interact=function(){if(level===18&&playing&&!L9.cine){if(P.mg){toggleMG();return}if(N18.work){N18.work=null;return}const pp=P.g.position;for(const c of works18())if(Math.hypot(pp.x-c.x,pp.z-c.z)<c.r){N18.work=Object.assign({},c,{t:0,src:c});return}if(nearMG()){toggleMG();return}return}return _in()}}
{const _tg=throwG;throwG=function(){if(level===18&&playing&&(L9.cine||P.mg))return;return _tg()}}
{const _rp=respawnP;respawnP=function(){_rp();if(level!==18)return;P.pr=false;P.cover=null;N18.work=null;go18(N18.cpPh||0,true);say('Punto de control.',1.6)}}
{const _s=surf35;surf35=function(){if(level===18){const p=P.g.position,z=p.z,x=p.x-X18;if(p.y>.6)return z<-540?'wood':'snow';if(z<-541&&z>-819&&Math.abs(x)<172)return'stone';return'snow'}return _s()}}
{const _l=lvl35;lvl35=function(){const r=_l.apply(this,arguments);if(level===18){for(const k of['snow','stone','wood'])for(let i=1;i<=3;i++){dec35('fs_'+k+i);dec35('ld_'+k)}dec35('at_gun')}return r}}
if(typeof VM32!=='undefined'&&VM32.pal&&VM32.pal[17])VM32.pal[18]=Object.assign({},VM32.pal[17],{sl:0x5c6878});
{const _s17=startLevel17;startLevel17=function(){if(N18.built){try{VEH32.floor=null;VEH32.origin(X17)}catch(e){}}if(N18.on)leave18();return _s17.apply(this,arguments)}}
{const _en=end;end=function(w){if(level===18&&w){_en(w);playing=false;$('fade12').style.opacity=0;$('gar').style.display='none';const b=$('bap18');if(b)b.style.display='none';$('menu').querySelector('h1').textContent='MARTILLO DE NIEVE';
  const S=N18.all.filter(n=>alive18(n)&&n.sq18&&!n.down17).map(n=>n.name.split(' ').pop()),mins=Math.round((time-(N18.t0||time))/60),sec=N18.sec,yn=(v,a,b)=>v?'<b style="color:#9ad07a">'+a+'</b>':'<b style="color:#d08a6a">'+b+'</b>';
  $('tx').innerHTML='<b style="font-size:19px;color:#e0b050">FIN DEL CAPÍTULO II · FALKENBRÜCK ES DE VOLSKAYA</b><br><br>• Enemigos abatidos: <b>'+N18.kills+'</b> · grifos derribados: <b>'+N18.gk+'</b> · vehículos destruidos: <b>'+N18.vk+'</b><br>• Camaradas atendidos: <b>'+N18.saved+'</b> · caídos: <b>'+N18.lost+'</b> · escuadra final: <b>'+(S.join(', ')||'—')+'</b>'+(N18.morozEv?' · Moroz evacuado herido':'')+
   '<br>• Piloto Lasko: '+yn(sec.pilot,'rescatado','perdido')+' · escuadra de Danko: '+yn(sec.iso,'rescatada','perdida')+' · batería FRUST: '+yn(sec.bat,'intacta','diezmada')+'<br>• Vehículo de mando: '+yn(sec.cmd,'destruido','escapó')+' · puente ferroviario: '+yn(sec.brg,'salvado','volado')+' · empalme: '+yn(N18.junc,'intacto','volado')+
   '<br>• Torre de comunicaciones: <b>'+['intacta','sin antenas','dañada','derribada'][K18.commTower.stage||0]+'</b> · Capitán Rauth: <b>'+({down:'abatido',fled:'en retirada',on:'en vuelo',none:'—'}[N18.rauth])+'</b><br>• Apoyos pedidos: <b>'+N18.sup+'</b> · Tiempo: <b>'+mins+' min</b><br><br><i>'+MOROZ18+'</i><br><br><b style="font-size:20px;color:#e0b050">PUNTUACIÓN: '+score+'</b>';try{localStorage.setItem('martillo38','1')}catch(e){}if(window.codShow)codShow('cpM');return}const r=_en(w);if(level===17&&w){try{$('lvsel').value='18';$('lvsel').dispatchEvent(new Event('change'))}catch(e){}}return r}}
{const _up=update;update=function(dt){if(level===18&&playing&&L9.cine){V16.dt=dt;time+=dt;cine9Upd(dt);fx18(dt,true);vmUpd13(dt);try{mm27(dt)}catch(e){}return}
 if(level!==18&&N18.on)leave18();_up(dt);if(!playing||level!==18)return;{const p=P.g.position;if(!isFinite(p.x)||!isFinite(p.z)){p.set(WG18(CPS18[N18.cpPh||0][0]),0,CPS18[N18.cpPh||0][1]);P.vy=0}}if(!fpv)fpv=true;updT18(dt);cam.position.y+=P.g.position.y;vmUpd13(dt)}}
/* menú: capítulo XVIII, punto de control, Experto */
{const done=(()=>{try{return localStorage.getItem('martillo38')==='1'}catch(e){return false}})();$('lvsel').insertAdjacentHTML('beforeend','<option value="18">XVIII · OPERACIÓN MARTILLO DE NIEVE — La bandera sobre Falkenbrück '+(done?'✔ completada':'(nuevo)')+'</option>');
 const S='background:#302417;color:#f3e6c4;padding:10px;border:1px solid #a77b35';$('lvsel').parentElement.insertAdjacentHTML('afterend','<label id="cp18l">PUNTO DE CONTROL <select id="cp18" style="'+S+'">'+AT18.map((a,i)=>'<option value="'+i+'">'+a[0]+' · '+a[1].charAt(0)+a[1].slice(1).toLowerCase()+(i?'':' (misión completa)')+'</option>').join('')+'</select></label>');
 const dO=$('difficulty')&&$('difficulty').querySelector('option[value="hard"]');const sx=()=>{const on=$('lvsel').value==='18';$('cp18l').style.display=on?'':'none';if(dO)dO.textContent=on?'Experto':'Élite'};$('lvsel').addEventListener('change',sx);sx();const cm=$('cmCP');if(cm)cm.appendChild($('cp18l'))}
try{if(sessionStorage.getItem('sel18')){const v=sessionStorage.getItem('sel18');sessionStorage.removeItem('sel18');$('lvsel').value='18';$('cp18').value=v;$('lvsel').dispatchEvent(new Event('change'))}}catch(e){}
{const _g=$('go').onclick;$('go').onclick=function(){if($('lvsel').value!=='18')return _g.apply(this,arguments);if(N18.built||N17.built||N16.built||(typeof L12!=='undefined'&&L12.built)){try{sessionStorage.setItem('sel18',$('cp18').value)}catch(e){}location.reload();return}V20.ps2=$('ps2fog').value;difficulty=$('difficulty').value;try{ac=new(window.AudioContext||window.webkitAudioContext)();if(ac.state==='suspended')ac.resume();startMusic()}catch(e){}$('menu').style.display='none';P.g.visible=true;cam.fov=65;cam.updateProjectionMatrix();startLevel18();try{rend.domElement.requestPointerLock()}catch(e){}}}
