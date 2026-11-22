/* ============================================================
   v35 · INGENIERÍA DE SONIDO — biblioteca ampliada (Audio 1.2)
   Usa el motor de muestras de v34 (samp34). Decodificación
   perezosa: cada muestra se decodifica la primera vez que se
   necesita o al empezar el nivel (precarga por nivel), para no
   ocupar memoria con sonidos que ese nivel no usa.
   ============================================================ */
const S35={dec:{},lvl:-1,amb:[],step:0,px:0,pz:0,py:0,vy:0,air:0,wzT:0,gr:new WeakMap(),egN:0,stepT:0};
Object.assign(VOL34,{enfield:.9,nagant:.8,sniper:.85,rel_start:.6,rel_loop:.6,rel_end:.65,at_gun:1,g_pin:.6,g_throw1:.6,g_throw2:.6,g_throw3:.6,
 ex_gren1:1,ex_gren2:1,ex_gren3:1,ex_mort1:1,ex_mort2:1,ex_mort3:1,ex_big1:1.1,ex_big2:1.1,ex_metal:1.1,ex_boat:1.1,ex_water:1,ex_far1:.9,ex_far2:.9,ex_far3:.9,
 inc_long1:.7,inc_long2:.7,inc_s1:.7,inc_s2:.7,inc_s3:.7,mort_launch:.8,mort_load:.6,wz1:.55,wz2:.55,wz3:.55,wz4:.55,wz5:.55,wz6:.55,ld_hurt:.6,
 amb_wind:.22,amb_wave:.3,amb_cricket:.18,amb_fire:.2,amb_river:.25});
for(const k of['enfield','nagant','sniper'])MAXV34[k]=5;
function dec35(n){if(S35.dec[n]||typeof SND35B==='undefined'||!SND35B[n]||typeof ac==='undefined'||!ac)return;S35.dec[n]=1;
 try{const s=atob(SND35B[n]),u=new Uint8Array(s.length);for(let i=0;i<s.length;i++)u[i]=s.charCodeAt(i);ac.decodeAudioData(u.buffer,b=>{SND34.buf[n]=b},()=>{})}catch(e){}}
{const _sp=samp34;samp34=function(n){if(!SND34.buf[n])dec35(n);return _sp.apply(this,arguments)}}
const pk35=(p,k)=>p+(1+(Math.random()*k|0));
/* ---- superficie y ambiente por nivel ---- */
function surf35(){const p=P.g.position;
 if(level===12)return p.y>3?'metal':'dirt';if(level===13)return'grass';if(level===14)return'stone';
 if(level===15){if(typeof L28!=='undefined'&&L28.onBoat)return'metal';if(typeof depth15==='function'&&depth15(p.x,p.z)>.2)return'wade';return'snow'}
 if(level===16)return p.y>.6?'wood':'stone';
 if(level===17){const x=p.x-(typeof X17!=='undefined'?X17:0),z=p.z;if(z<-752&&z>-808&&Math.abs(x+20)<8)return'metal';if(z>14&&z<34&&x>22&&x<48)return'wood';return'dirt'}
 return'dirt'}
const AMB35={1:['amb_wind'],2:['amb_wind'],3:['amb_wind'],4:['amb_wind'],5:['amb_wind'],6:['amb_wind'],7:['amb_wind'],8:['amb_wind'],9:['amb_wind'],10:['amb_wind'],11:['amb_wind'],
 13:['amb_wind','amb_cricket'],14:['amb_fire'],15:['amb_wave','amb_wind'],16:['amb_cricket','amb_wind'],17:['amb_wave','amb_wind']};
const PRE35=['enfield','nagant','sniper','rel_start','rel_loop','rel_end','g_pin','g_throw1','g_throw2','g_throw3','gb_earth1','gb_earth2','gb_earth3','gb_stone1','gb_stone2','gb_wood1',
 'ex_gren1','ex_gren2','ex_gren3','ex_mort1','ex_mort2','ex_mort3','ex_big1','ex_big2','ex_far1','ex_far2','ex_far3','wz1','wz2','wz3','wz4','wz5','wz6','ld_hurt'];
function ambStop35(){for(const a of S35.amb){try{a.gn.gain.setTargetAtTime(0,ac.currentTime,.4);a.s.stop(ac.currentTime+1.5)}catch(e){}}S35.amb.length=0}
function ambStart35(){ambStop35();for(const n of AMB35[level]||[]){const a=samp34(n,1,1,null,null,{loop:true});if(a&&a.s){a.n=n;a.s.playbackRate.value=n==='amb_wind'&&level<=11?.85:1;S35.amb.push(a)}}if(S35.amb.length<(AMB35[level]||[]).length&&(S35.ambN=(S35.ambN||0)+1)<20)S35.ambT=.8}
function lvl35(){S35.lvl=level;for(const n of PRE35)dec35(n);const s=['dirt','grass','stone','wood','metal','snow'];for(const k of s){if((level===17&&(k==='wood'||k==='metal'))||k==='dirt'||(level===13&&k==='grass')||(level===14&&k==='stone')||(level===15&&(k==='snow'||k==='metal'))||(level===16&&(k==='stone'||k==='wood'))||(level===12&&k==='metal'))for(let i=1;i<=3;i++)dec35('fs_'+k+i),dec35('ld_'+k)}
 if(level===15){dec35('fs_wade1');dec35('fs_wade2');dec35('ex_water');dec35('ex_boat')}if(level===17){dec35('ex_water');dec35('at_gun');dec35('ex_metal')}if(level===14||level===17)dec35('at_gun');
 for(const n of AMB35[level]||[])dec35(n);S35.ambN=0;S35.ambT=1.2}
/* ---- fusil: armas del jugador en 13+ (Enfield), enemigos (Nagant), tiradores (francotirador) ---- */
{const _w=weaponSfx;weaponSfx=function(kind){if(kind==='rifle'&&level>=13&&samp34('enfield',1)){WSF34=FR34;return}return _w(kind)}}
{const _p=pick34;pick34=function(e){const r=_p(e);if(r==='rifle'){const w=e&&e.a33&&e.a33.wc;return w==='sniper'?'sniper':'nagant'}return r}}
/* ---- recarga del fusil: inicio · peine · cierre del cerrojo ---- */
{const _r=reload;reload=function(){const was=P.rel;const r=_r.apply(this,arguments);if(was<=0&&P.rel>0&&P.cur==='rifle'&&SND34.buf.rel_start){const T_=P.rld||P.rel;samp34('rel_start',1);if(T_>2.4)samp34('rel_loop',1,1,null,null,{delay:1.1});samp34('rel_end',1,1,null,null,{delay:Math.max(.9,T_-.8)})}return r}}
/* ---- granadas: seguro + lanzamiento del jugador ---- */
{const _t=throwG;throwG=function(){const n0=P.grenades;const r=_t.apply(this,arguments);if(P.grenades<n0){samp34('g_pin',1);samp34(pk35('g_throw',3),1,1,null,null,{delay:.18})}return r}}
/* ---- explosiones: tamaño, distancia (retardo por velocidad del sonido) y agua ---- */
let EXT35=-1;
function water35(x,z){if(level===15&&typeof depth15==='function')return depth15(x,z)>.5;if(level===17&&typeof VEH32!=='undefined'&&VEH32.water)try{return VEH32.water(x-X17,z)}catch(e){}return false}
{const _x=expSnd;expSnd=function(x,z,k){EXT35=FR34;k=k||1;if(typeof cam==='undefined')return _x(x,z,k);const d=Math.hypot(x-cam.position.x,z-cam.position.z);let n;
 if(d>140)n=pk35('ex_far',3);else if(water35(x,z))n='ex_water';else if(k<=.75)n=pk35('ex_gren',3);else if(k<=1.3)n=pk35('ex_mort',3);else n=k>=2&&level===15?'ex_boat':(Math.random()<.5?'ex_big1':'ex_big2');
 if(samp34(n,Math.min(1.6,.65+k*.4),1,x,z,{delay:Math.min(.6,d/340),reach:d>140?120:40,max:700}))return;return _x(x,z,k)}}
if(typeof boom==='function'){const _b=boom;boom=function(pos){const f=EXT35;const r=_b.apply(this,arguments);if(EXT35===f&&pos)expSnd(pos.x,pos.z,.7);return r}}
/* ---- proyectiles con silbido (VEH32: naval / mortero): la muestra termina justo al impacto ---- */
if(typeof vhShot32==='function'){const _v=vhShot32;vhShot32=function(kind,ax,ay,az,bx,by,bz,T_,h,k,side,dmg,r,tv,src,vis,wait){const s=_v.apply(this,arguments);
 if(s&&(kind==='naval'||kind==='mortar')){const n=kind==='naval'?pk35('inc_long',2):pk35('inc_s',3);dec35(n);const b=SND34.buf[n];if(b){s.wh=true;samp34(n,1,1,bx,bz,{delay:Math.max(0,(wait||0)+T_-b.duration+.05),reach:30,max:400})}
  if(kind==='mortar'&&Math.hypot(ax-cam.position.x,az-cam.position.z)<300)samp34('mort_launch',1,1,ax,az,{delay:wait||0,reach:40,max:300})}
 return s}}
/* ---- bucle por cuadro: ambiente, pasos, aterrizajes, rebotes de granada, balas que pasan cerca ---- */
{const _u=update;update=function(dt){const r=_u(dt);if(typeof ac==='undefined'||!ac)return r;
 if(S35.lvl!==level)lvl35();if(S35.ambT>0){S35.ambT-=dt;if(S35.ambT<=0)ambStart35()}
 for(const a of S35.amb){const tg=(playing&&!(typeof L9!=='undefined'&&L9.cine&&level!==17)?1:.35)*(VOL34[a.n]||.25)*(G.vol==null?.8:G.vol);a.gn.gain.setTargetAtTime(tg,ac.currentTime,.5)}
 if(!playing)return r;const p=P.g.position;
 /* pasos */
 const onFoot=!(P.mg||(typeof L14!=='undefined'&&L14.inTank)||(level===16&&typeof N16!=='undefined'&&!N16.foot)||(typeof L9!=='undefined'&&L9.cine)||(level===12&&typeof L12!=='undefined'&&L12.turret));
 const hv=Math.hypot(p.x-S35.px,p.z-S35.pz)/Math.max(dt,.001);const grounded=Math.abs(P.vy||0)<.6;
 if(onFoot&&grounded&&hv>1.2&&hv<14){S35.step+=hv*dt;const L=hv>7.5?2.6:hv<3.5?1.5:2.1;if(S35.step>=L){S35.step=0;const sf=surf35(),n=sf==='wade'?pk35('fs_wade',2):pk35('fs_'+sf,3);samp34(n,hv<3.5?.35:hv>7.5?.75:.55)}}
 if(onFoot&&S35.vy<-7&&grounded){const sf=surf35();samp34(sf==='wade'?'fs_wade1':'ld_'+sf,.9);if(S35.vy<-13)samp34('ld_hurt',.8)}
 S35.vy=P.vy||0;S35.px=p.x;S35.pz=p.z;
 /* rebotes de granadas (jugador y enemigos) */
 const bk=level===14||level===16?'gb_stone':level===12?'gb_wood':'gb_earth';
 for(const L of[typeof grens!=='undefined'?grens:null,typeof egr!=='undefined'?egr:null])if(L)for(const g of L){if(!g||!g.v)continue;const pv=S35.gr.get(g);if(pv!==undefined&&pv<-2.5&&g.v.y>-.5){const q=g.pos||g.m&&g.m.position;if(q)samp34(pk35(bk,bk==='gb_wood'?2:bk==='gb_stone'?2:3),Math.min(1,-pv/9),1,q.x,q.z,{reach:12})}S35.gr.set(g,g.v.y)}
 if(typeof egr!=='undefined'){if(egr.length>S35.egN){for(let i=S35.egN;i<egr.length;i++){const g=egr[i],q=g&&(g.pos||g.m&&g.m.position);if(q)samp34(pk35('g_throw',3),1,1,q.x,q.z,{reach:10,max:60})}}S35.egN=egr.length}
 /* balas enemigas que pasan cerca de la cabeza */
 if(typeof ebul!=='undefined'&&time-S35.wzT>.09){const c=cam.position;for(const b of ebul){if(b.wz35||!b.m)continue;const q=b.m.position,d=Math.hypot(q.x-c.x,q.y-c.y,q.z-c.z);if(d<3.2&&d>.5){b.wz35=1;S35.wzT=time;samp34(pk35('wz',6),1-d/4);break}}}
 return r}}
