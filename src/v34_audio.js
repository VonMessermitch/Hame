/* ============================================================
   v34 · SONIDOS REALES DE ARMAS
   Muestras del usuario (SND34B) decodificadas una vez en el
   AudioContext del juego. Cada disparo: tono ±5 %, volumen
   variable, atenuación y filtro por distancia, límite de voces.
   Si una muestra no cargó, suena el sintetizado original.
   ============================================================ */
const SND34={buf:{},loading:false,v:{},fl:{loop:null,last:-9,prev:-9}};
const VOL34={rifle:.85,ametralladora:.7,mg15:.75,mgduales:.75,revolver:.85,pistola:.8,escopeta:.9,panzerfaust:1,Flak88Fire1:1,Flak_single:.8,flakpanzer_loop:.7,flakpanzer_loop_fast:.65,Flakpanzer_cooldown:.7,flak_reload:.6};
const MAXV34={ametralladora:4,mg15:4,mgduales:3,rifle:5,flakpanzer_loop_fast:3};
function load34(){if(SND34.loading||typeof ac==='undefined'||!ac||typeof SND34B==='undefined')return;SND34.loading=true;
 for(const k in SND34B){try{const s=atob(SND34B[k]),u=new Uint8Array(s.length);for(let i=0;i<s.length;i++)u[i]=s.charCodeAt(i);ac.decodeAudioData(u.buffer,b=>{SND34.buf[k]=b},()=>{})}catch(e){}}}
function out34(){try{return typeof AB==='function'?AB():ac.destination}catch(e){return ac.destination}}
/* name, volumen, tono, x/z mundo (opcional: posicional), o:{delay,off,dur,loop} */
function samp34(n,vol,rate,x,z,o){if(typeof ac==='undefined'||!ac){return false}load34();const b=SND34.buf[n];if(!b)return false;
 try{if(typeof sfxOK==='function'&&!sfxOK())return true;o=o||{};let g=(vol==null?1:vol)*(VOL34[n]||.8)*(G.vol==null?.8:G.vol)*(.88+Math.random()*.24),lp=0;
  if(x!=null&&typeof cam!=='undefined'){const d=Math.hypot(cam.position.x-x,cam.position.z-z);if(d>(o.max||220))return true;g*=1/(1+d/(o.reach||16));if(d>25)lp=Math.max(900,16000-d*(o.reach?40:95))}
  if(g<.004)return true;const t=ac.currentTime+(o.delay||0),s=ac.createBufferSource();s.buffer=b;s.playbackRate.value=(rate||1)*(.95+Math.random()*.1);
  const gn=ac.createGain();gn.gain.value=g;let h=s;if(lp){const f=ac.createBiquadFilter();f.type='lowpass';f.frequency.value=lp;s.connect(f);h=f}h.connect(gn);gn.connect(out34());
  if(o.loop){s.loop=true;s.loopStart=.03;s.loopEnd=Math.max(.1,b.duration-.05)}
  if(o.dur){s.start(t,o.off||0);gn.gain.setValueAtTime(g,t+o.dur*.75);gn.gain.linearRampToValueAtTime(0,t+o.dur);s.stop(t+o.dur+.02)}else s.start(t,o.off||0);
  const L=SND34.v[n]||(SND34.v[n]=[]);L.push(s);s.onended=()=>{const i=L.indexOf(s);if(i>=0)L.splice(i,1)};const mx=MAXV34[n]||6;while(L.length>mx){const q=L.shift();try{q.stop()}catch(e){}}
  return o.loop?{s,gn}:true}catch(e){return false}}
/* ---- disparos del jugador, nidos de MG y enemigos que ya llamaban a weaponSfx ---- */
let FR34=0,WSF34=-1;const PEND34=[];
{const _w=weaponSfx;weaponSfx=function(kind){WSF34=FR34;let n=null;
 if(kind==='rifle')n='rifle';else if(kind==='smg')n='ametralladora';else if(kind==='revolver')n=level>=13?'pistola':'revolver';else if(kind==='c10')n='pistola';else if(kind==='gatling')n='mgduales';
 else if(kind==='mg')n=(typeof curMG!=='undefined'&&curMG&&curMG.k15)?'mg15':'ametralladora';
 if(n&&samp34(n,1))return;return _w(kind)}}
/* ---- disparos enemigos (posicionales): contexto del tirador para elegir la muestra ---- */
let CUR34=null;
function pick34(e){if(!e)return'rifle';if(e.type==='orcoE')return'escopeta';if(e.k8==='bar')return'ametralladora';if(e.k8==='stv')return'pistola';const w=e.a33&&e.a33.wc;if(w==='smg')return'ametralladora';if(w==='mg'||w==='lmg')return'mg15';if(w==='pistol'||w==='p')return'pistola';return'rifle'}
{const _s=shootSol;shootSol=function(e,p){CUR34=e;try{return _s(e,p)}finally{CUR34=null}}}
if(typeof fireE33==='function'){const _f=fireE33;fireE33=function(e){CUR34=e;try{return _f.apply(this,arguments)}finally{CUR34=null}}}
{const _e=eshoot;eshoot=function(o,d,dmg,spd,mat){const r=_e(o,d,dmg,spd,mat);if(CUR34&&PEND34.length<10&&!PEND34.some(q=>q.e===CUR34&&q.f===FR34))PEND34.push({e:CUR34,n:pick34(CUR34),x:o.x,z:o.z,f:FR34});return r}}
/* ---- aliados (fire30: escuadras de 13–17) ---- */
if(typeof fire30==='function'){const _f=fire30;fire30=function(n){const m0=n.mag;const r=_f.apply(this,arguments);
 if(n.mag<m0&&n.g){const p=n.g.position,w=n.wpn,nm=w==='lmg'?'mg15':w==='smg'?'ametralladora':w==='p'?'pistola':'rifle',k=w==='lmg'?4:w==='smg'?3:1;for(let i=0;i<k;i++)samp34(nm,.8,1,p.x,p.z,{delay:i*(w==='lmg'?.1:.085)})}return r}}
/* ---- Panzerfaust ---- */
if(typeof firePzf==='function'){const _p=firePzf;firePzf=function(){if(!SND34.buf.panzerfaust)return _p.apply(this,arguments);const a=nz18,b=tn18;nz18=tn18=function(){};try{_p.apply(this,arguments)}finally{nz18=a;tn18=b}samp34('panzerfaust',1)}}
/* ---- Flak de la torpedera (nivel 15): disparo suelto, ráfaga en bucle y enfriamiento ---- */
function flakShot34(){if(!SND34.buf.Flak_single||!ac)return false;const F=SND34.fl,t=ac.currentTime;
 if(!F.loop){if(t-F.prev<.45&&SND34.buf.flakpanzer_loop)F.loop=samp34('flakpanzer_loop',1,1,null,null,{loop:true})||null;else samp34('Flak_single',1)}
 F.prev=t;F.last=t;return true}
function flakTick34(){const F=SND34.fl;if(F.loop&&ac&&ac.currentTime-F.last>.32){try{const t=ac.currentTime;F.loop.gn.gain.setTargetAtTime(0,t,.03);F.loop.s.stop(t+.15)}catch(e){}F.loop=null;samp34('Flakpanzer_cooldown',1)}}
/* ---- 88 mm (baterías costeras) y antiaéreas cuádruples de Taikin ---- */
function gun88_34(x,z){if(!samp34('Flak88Fire1',1.1,1,x,z))return false;samp34('flak_reload',.8,1,x,z,{delay:1.3});return true}
function aaQuad34(x,z){return samp34('flakpanzer_loop_fast',1,1,x,z,{off:Math.random()*.6,dur:.5})}
/* ---- bucle: reproducir disparos enemigos pendientes y cortar la ráfaga de Flak ---- */
{const _u=update;update=function(dt){if(!SND34.loading)load34();FR34++;if(PEND34.length){for(const q of PEND34)if(q.f!==WSF34)samp34(q.n,.9,1,q.x,q.z);PEND34.length=0}flakTick34();return _u(dt)}}
