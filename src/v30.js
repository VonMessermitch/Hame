/* =====================================================================
   v30 · MEJORAS DE GAMEPLAY SOBRE LO EXISTENTE
   1 Tanque pesado (nivel 14): inercia, giro sobre su eje, colisiones,
     suspensión visual, retroceso, torreta con inercia, daño por zonas
   2 IA aliada con estados: IDLE→FOLLOW→ALERT→ENGAGE→SEEK_COVER→ADVANCE→DEFEND→REGROUP
     (reemplaza a compUpd13: sirve a las misiones XII, XIII, XIV y Nachtfall)
   3 Vanguardia de choque de Eisenmark en la defensa del puerto (Alejandría)
   4 Terreno: texturas procedurales y calcomanías instanciadas (barro, grava,
     huellas, cráteres, quemado, manchas portuarias)
   5 Casco de infantería de marina v2 y cabezas femeninas para las enfermeras
   6 Cañón de 88 mm de las baterías con apuntado, disparo y retroceso
   7 Torpedera: cámara de conducción en tercera persona estable
   8 Desembarco del fiordo en cinco oleadas de infantería de marina de Zheng-Hua
   ===================================================================== */
const CL30=(v,a,b)=>v<a?a:v>b?b:v,AD30=(a,b)=>{let d=b-a;while(d>Math.PI)d-=6.2832;while(d<-Math.PI)d+=6.2832;return d};
/* =====================================================================
   1 · TANQUE PESADO
   ===================================================================== */
const TK30={v:0,r:0,tw:0,pch:0,rol:0,kick:0,near:[],nt:0,dist:0,ht:0};
function tankNear30(p){TK30.nt=.5;TK30.near=obstB.filter(o=>Math.abs(o.x-p.x)<o.hw+14&&Math.abs(o.z-p.z)<o.hd+14&&o.h>.9&&(o.y0||0)<1.6)}
function tankBlocked30(g){const p=g.position,a=g.rotation.y,c=Math.cos(a),s=Math.sin(a);for(const [lx,lz] of[[1.6,3.3],[-1.6,3.3],[1.6,-3.2],[-1.6,-3.2],[0,3.5],[0,-3.4],[1.7,0],[-1.7,0]]){const x=p.x+lx*c+lz*s,z=p.z-lx*s+lz*c;for(const o of TK30.near)if(Math.abs(x-o.x)<o.hw&&Math.abs(z-o.z)<o.hd)return true;if(Math.hypot(x-WC.x,z-WC.z)>WC.r-2)return true}return false}
function tankIn30(){let f=(keys.KeyW?1:0)-(keys.KeyS?1:0),r=(keys.KeyD?1:0)-(keys.KeyA?1:0);if(typeof tmOn!=='undefined'&&tmOn){f=-tm.y;r=tm.x;if(Math.abs(f)<.22)f=0;if(Math.abs(r)<.22)r=0}return{f,r}}
tankUpd14=function(dt){const g=L14.tank,u=g.userData,p=g.position;g.rotation.order='YXZ';TK30.nt-=dt;if(TK30.nt<=0)tankNear30(p);
 const inp=L14.immob||L9.cine?{f:0,r:0}:tankIn30();const vmax=inp.f>0?7.6:3.4,want=inp.f*vmax,dv=want-TK30.v;
 /* masa: acelera lento, frena fuerte, freno motor sin pedal */const brake=TK30.v!==0&&Math.sign(dv)!==Math.sign(TK30.v);const acc=!inp.f?1.2:brake?4.6:1.75;const v0=TK30.v;TK30.v+=CL30(dv,-acc*dt,acc*dt);
 /* giro: sobre su eje casi parado, más abierto en marcha */const tmax=.58-.26*Math.min(1,Math.abs(TK30.v)/7.6),wr=-inp.r*tmax*(TK30.v<-.4?-1:1);TK30.r+=(wr-TK30.r)*Math.min(1,dt*2.4);const oy=g.rotation.y;g.rotation.y+=TK30.r*dt;
 const ox=p.x,oz=p.z;p.x+=Math.sin(g.rotation.y)*TK30.v*dt;p.z+=Math.cos(g.rotation.y)*TK30.v*dt;
 if(tankBlocked30(g)){p.x=ox;p.z=oz;g.rotation.y=oy;if(Math.abs(TK30.v)>2.2&&!TK30.bt){TK30.bt=.8;shake=Math.max(shake,.9);nz18(0,.5,'lowpass',300,90,.12);tn18('sawtooth',70,40,.35,.06);burst(p.x+Math.sin(oy)*3.4,1,p.z+Math.cos(oy)*3.4,0x8a7a62,10,.6,4)}TK30.v*=-.12;TK30.r*=.3}TK30.bt=Math.max(0,(TK30.bt||0)-dt);
 /* infantería: los aliados se apartan; los enemigos pueden ser arrollados */if(Math.abs(TK30.v)>1){const fx=Math.sin(g.rotation.y)*Math.sign(TK30.v),fz=Math.cos(g.rotation.y)*Math.sign(TK30.v);for(const n of(L14.sq||[])){if(!n.g.visible)continue;const q=n.g.position,dx=q.x-p.x,dz=q.z-p.z,d=Math.hypot(dx,dz);if(d<4.2){q.x+=dx/d*(4.2-d)*.5;q.z+=dz/d*(4.2-d)*.5}}
  for(const e of enemies){if(e.hp<=0)continue;const q=e.g.position,dx=q.x-p.x,dz=q.z-p.z;if(Math.hypot(dx,dz)<3.6&&dx*fx+dz*fz>1.5&&Math.abs(TK30.v)>2.5)hurt(e,300,'x',{name:'El tanque Hell'})}}
 /* suspensión visual: cabeceo por aceleración, balanceo en giros, irregularidades del terreno */const accel=(TK30.v-v0)/Math.max(dt,1e-3);TK30.dist+=Math.abs(TK30.v)*dt;const bump=(Math.sin(TK30.dist*1.7)*.012+Math.sin(TK30.dist*4.3+1)*.006)*Math.min(1,Math.abs(TK30.v)/3);TK30.kick=Math.max(0,TK30.kick-dt*2.6);
 TK30.pch+=((-accel*.011)+bump-TK30.kick*.05-TK30.pch)*Math.min(1,dt*5);TK30.rol+=((TK30.r*TK30.v*.02)+bump*.5-TK30.rol)*Math.min(1,dt*4);g.rotation.x=CL30(TK30.pch,-.06,.06);g.rotation.z=CL30(TK30.rol,-.05,.05);p.y=Math.abs(bump)*.4;
 tankAnim(g,(Math.abs(TK30.v)+Math.abs(TK30.r)*2.4)*(TK30.v<-.1?-1:1),dt);L14.vs=TK30.v;
 if(Math.abs(TK30.v)>.6&&R()<dt*6){smoke(p.x-Math.sin(g.rotation.y)*3.4,1.2,p.z-Math.cos(g.rotation.y)*3.4,.8,1.4,0x3a3a3a,.6,.42);if(R()<.5)burst(p.x+(R()-.5)*3,.2,p.z+(R()-.5)*3,0x7a6a52,2,.5,1.5)}
 /* ruido de motor: tono según carga */TK30.ht-=dt;if(TK30.ht<=0){TK30.ht=.22;tn18('sawtooth',38+Math.abs(TK30.v)*5+Math.abs(TK30.r)*12,34,.24,.025+Math.min(.03,Math.abs(accel)*.004))}
 /* torreta pesada: velocidad angular limitada con aceleración */if(!L14.bent){const want=yaw+Math.PI-g.rotation.y,d=AD30(u.tur.rotation.y,want),tv=CL30(d*3,-.85,.85);TK30.tw+=CL30(tv-TK30.tw,-1.8*dt,1.8*dt);u.tur.rotation.y+=TK30.tw*dt;if(Math.abs(TK30.tw)>.2&&R()<dt*6)tn18('square',160+Math.abs(TK30.tw)*60,150,.08,.012);if(u.gun)u.gun.rotation.x+=(-CL30(pitch*.8,-.08,.22)-u.gun.rotation.x)*Math.min(1,dt*3)}
 P.g.position.set(p.x,1.25,p.z);P.vy=0;P.mvx=P.mvz=0;L14.cd-=dt;if(L14.cd<=0&&!L14.ldd){L14.ldd=1;crew14('load',6)}
 const ov=$('ov14');ov.style.display=L9.cine?'none':'block';ov.style.background=L14.thp<40?'radial-gradient(ellipse at center,rgba(0,0,0,0) 36%,rgba(20,18,14,.95) 70%),rgba(60,58,54,'+(.4-L14.thp/100)+')':'radial-gradient(ellipse at center,rgba(0,0,0,0) 40%,rgba(10,10,8,.92) 72%)';
 $('ammo').textContent=L14.bent?'CAÑÓN DESTRUIDO':(L14.wpn==='can'?'CAÑÓN 75 mm · '+(L14.cd>0?'CARGANDO…':'LISTO'):'AMETRALLADORA COAXIAL · ∞')+' · BLINDAJE '+Math.max(0,Math.round(L14.thp))+'% · '+Math.round(Math.abs(TK30.v)*3.6)+' km/h · ARM cambia arma';if(P.hp<100)P.hp=Math.min(100,P.hp+dt*20)};
{const _ts=tankShot14;tankShot14=function(){const c=L14.cd;_ts();if(L14.cd>c){TK30.kick=1;const g=L14.tank;g.position.x-=Math.sin(g.rotation.y+(L14.tank.userData.tur.rotation.y||0))*.08;g.position.z-=Math.cos(g.rotation.y+(L14.tank.userData.tur.rotation.y||0))*.08;const m=new T.Vector3();L14.tank.userData.muz.getWorldPosition(m);smoke(m.x,m.y,m.z,4,2.6,0x8a8478,1.2,.55);burst(m.x,.3,m.z,0x9a8a6a,14,.8,6)}}}
/* daño por zonas: frontal resiste, lateral normal, trasero crítico */
{const _th=tankHit14;tankHit14=function(d){const g=L14.tank,p=g.position;let src=null,bd=1e9;for(const a of L14.atg.concat(L14.etk)){if(!a.alive)continue;const q=a.g?a.g.position:{x:a.x,z:a.z},dd=Math.hypot(q.x-p.x,q.z-p.z);if(dd<bd){bd=dd;src=q}}let k=1,z='lateral';if(src){const ang=Math.abs(AD30(g.rotation.y,Math.atan2(src.x-p.x,src.z-p.z)));if(ang<.7){k=.55;z='frontal'}else if(ang>2.3){k=1.6;z='trasero'}}
 if(!TK30.zt||time-TK30.zt>5){TK30.zt=time;feed(z==='frontal'?'Impacto frontal · el blindaje resiste':z==='trasero'?'¡Impacto en la parte trasera! ¡Motor dañado!':'Impacto lateral')}_th(d*k)}}
/* explosiones del tanque: polvo, escombros y cráter */
{const _b=boom14;boom14=function(x,y,z,k,by){_b(x,y,z,k,by);burst(x,.3,z,0x8a7a62,12,1,5*k);smoke(x,.8,z,6*k,5,0x6a5e4e,.8,.5);decalAt30('crater',x,z,2.4*k)}}
/* =====================================================================
   2 · IA ALIADA CON ESTADOS
   ===================================================================== */
const AI30={ord:'follow',foes:[],tt:0,blast:null,lines:0};
const MAG30={r:5,smg:32,lmg:40,p:8};
function aiSay30(n,t,w){if(time-AI30.lines<(w||2.5))return;AI30.lines=time;talk([[n.name.split(' ').pop(),t,1.6]])}
function cover30(n,e){const p=n.g.position,ep=e.g.position;let best=null,bs=1e9;for(const o of obstB){if(o.h<1||o.hw>16||o.hd>16)continue;if(Math.abs(o.x-p.x)>14||Math.abs(o.z-p.z)>14)continue;const dx=o.x-ep.x,dz=o.z-ep.z;let cx,cz;if(Math.abs(dx)>Math.abs(dz)){cx=o.x+Math.sign(dx)*(o.hw+.8);cz=o.z+(R()-.5)*o.hd}else{cz=o.z+Math.sign(dz)*(o.hd+.8);cx=o.x+(R()-.5)*o.hw}
  if(typeof blockedAt==='function'&&blockedAt(cx,cz,.4))continue;const s=Math.hypot(cx-p.x,cz-p.z)+Math.hypot(cx-P.g.position.x,cz-P.g.position.z)*.4;if(s<bs){bs=s;best=[cx,cz]}}return best}
function compUpd30(dt,LST){const pp=P.g.position,fx=-Math.sin(yaw),fz=-Math.cos(yaw),rx=Math.cos(yaw),rz=-Math.sin(yaw);let i=0;
 AI30.tt-=dt;if(AI30.tt<=0){AI30.tt=.25;AI30.foes=enemies.filter(e=>e.hp>0&&!(e.unaware&&!L13.loud))}const foes=AI30.foes;const quiet=L13.sneak&&!L13.loud;
 for(const n of(LST||L13.sq)){if(!n.on||n.lock||n.down29)continue;const p=n.g.position,sl=SLOT13[i++%SLOT13.length],tx=pp.x+rx*sl[0]-fx*sl[1],tz=pp.z+rz*sl[0]-fz*sl[1],dp=Math.hypot(p.x-pp.x,p.z-pp.z);
  p.y+=(Math.max(0,floorAt({x:p.x,y:p.y+.4,z:p.z}))-p.y)*Math.min(1,dt*10);if(n.mag===undefined)n.mag=MAG30[n.wpn]||5;
  /* percepción: prioriza a quien amenaza al jugador o está cerca de la escuadra */n.ft=(n.ft||0)-dt;if(n.ft<=0){n.ft=.3+R()*.15;let b=null,bs=1e9;const rng=n.wpn==='p'?42:70;for(const e of foes){const q=e.g.position,d=Math.hypot(q.x-p.x,q.z-p.z);if(d>rng)continue;let s=d;const dpl=Math.hypot(q.x-pp.x,q.z-pp.z);if(dpl<25&&e.active)s-=18;if(e.k8==='bar')s-=6;if(s<bs&&losClear(p.x,1.5,p.z,q.x,1.3,q.z)){bs=s;b=e}}n.tg=b}
  const e=n.tg&&n.tg.hp>0&&enemies.includes(n.tg)?n.tg:null;let st=n.st30||'FOLLOW';
  /* reacción a explosiones cercanas */if(AI30.blast&&time-AI30.blast.t<.2&&Math.hypot(AI30.blast.x-p.x,AI30.blast.z-p.z)<14&&!n.duckT){n.duckT=1.1;if(R()<.4)aiSay30(n,['¡Cuidado!','¡Al suelo!','¡Granada!'][R()*3|0])}if(n.duckT){n.duckT=Math.max(0,n.duckT-dt);if(n.duckT>0){n.act='crouch';n.tgt=null;continue}}
  if(e){if(st==='FOLLOW'||st==='IDLE'||st==='REGROUP'){st='ALERT';n.at=.3+R()*.3;if(R()<.5)aiSay30(n,['¡Contacto!','¡Enemigos!','¡Ahí, a las doce!','¡Los veo!'][R()*4|0])}}
  else if(st!=='DEFEND'){st=AI30.ord==='hold'?'DEFEND':dp>32?'REGROUP':(Math.hypot(P.vx||0,P.vz||0)<.1&&dp<6?'IDLE':'FOLLOW')}
  if(AI30.ord==='hold'&&!e)st='DEFEND';if(AI30.ord==='follow'&&st==='DEFEND'&&!e)st='FOLLOW';
  /* recarga */if(n.rl>0){n.rl-=dt;n.act='crouch';if(n.rl<=0)n.mag=MAG30[n.wpn]||5;n.st30=st;continue}
  if(st==='ALERT'){n.at-=dt;n.tgt=null;n.act=n.wpn==='p'?'point':'aim';if(e)n.f=Math.atan2(e.g.position.x-p.x,e.g.position.z-p.z);if(n.at<=0)st='ENGAGE'}
  else if(st==='ENGAGE'||st==='SEEK_COVER'||st==='ADVANCE'){if(!e){st='FOLLOW'}else{const q=e.g.position,d=Math.hypot(q.x-p.x,q.z-p.z);n.rp=(n.rp||8+R()*6)-dt;
    if(st==='ENGAGE'&&(!n.cov||n.rp<=0)&&!quiet){n.rp=9+R()*6;const c=cover30(n,e);if(c){n.cov=c;st='SEEK_COVER';n.tgt=c;n.sp=5.2}}
    if(st==='ENGAGE'&&dp>20&&AI30.ord!=='hold'){st='ADVANCE';const k=.5;n.tgt=[p.x+(pp.x-p.x)*k,p.z+(pp.z-p.z)*k];n.sp=5}
    if(AI30.ord==='advance'&&st==='ENGAGE'&&d>22&&n.rp<4){st='ADVANCE';n.tgt=[p.x+(q.x-p.x)*.35,p.z+(q.z-p.z)*.35];n.sp=4.6}
    if((st==='SEEK_COVER'||st==='ADVANCE')&&!n.tgt)st='ENGAGE';
    if(!n.tgt){n.f=Math.atan2(q.x-p.x,q.z-p.z);n.act=n.wpn==='p'?'point':n.cov?'crouchaim':'aim';if(n.wpn==='p')draw12(n,true);fire30(n,e,d,dt)}}}
  else if(st==='DEFEND'){if(!n.dp)n.dp=[p.x,p.z];if(Math.hypot(p.x-n.dp[0],p.z-n.dp[1])>2.5)n.tgt=n.dp.slice();else{n.tgt=null;n.act='crouch'}if(e){n.f=Math.atan2(e.g.position.x-p.x,e.g.position.z-p.z);n.act='crouchaim';fire30(n,e,Math.hypot(e.g.position.x-p.x,e.g.position.z-p.z),dt)}}
  else if(st==='REGROUP'){n.cov=null;n.dp=null;n.tgt=[tx,tz];n.sp=6.2;n.act='run';if(dp<10)st='FOLLOW'}
  else{n.cov=null;if(AI30.ord!=='hold')n.dp=null;if(Math.hypot(p.x-tx,p.z-tz)>2.4){n.tgt=[tx,tz];n.sp=dp>10?5.6:3.4}else{n.tgt=null;n.act=quiet?'crouch':st==='IDLE'?(n.idA||(n.idA=['idle','idle','smoke'][R()*3|0])):'idle';if(st==='IDLE'&&R()<dt*.2)n.f+=(R()-.5)*1.2}if(n.wpn==='p'&&n.pis&&n.pis.visible&&!L13.loud)draw12(n,false)}
  n.st30=st;stuck30(n,dt,pp,fx,fz,rx,rz,dp)}}
function fire30(n,e,d,dt){n.cd=(n.cd===undefined?R():n.cd)-dt;if(n.cd>0)return;const lmg=n.wpn==='lmg',smg=n.wpn==='smg',k=lmg?5:smg?4:1;n.cd=n.wpn==='p'?.75+R()*.6:lmg?1.7+R():smg?1.1+R()*.6:1.3+R()*.9;n.mag-=k;if(n.mag<=0){n.rl=2.2;if(R()<.35)aiSay30(n,'¡Recargando!',3)}
 const p=n.g.position;for(let j=0;j<k;j++)later13(j*.1,()=>{if(!enemies.includes(e)||e.hp<=0)return;const src=n.wpn==='p'?n.pis:n.rif;if(!src)return;src.updateMatrixWorld(true);const o=src.localToWorld(new T.Vector3(0,-.5,0)),t=e.g.position.clone();t.y=1.2+(R()-.5)*.6;t.x+=(R()-.5)*1.2;t.z+=(R()-.5)*1.2;trc16(o,t,0xffe0a0);burst(o.x,o.y,o.z,0xffd080,2,.1,2);npcShot(lmg?'mg':'rifle',p.x,p.z);
  const acc=(n.wpn==='p'?.4:lmg?.3:smg?.33:.52)*CL30(1.35-d/60,.25,1)*(n.cov?1.1:1);if(R()<acc)hurt(e,n.wpn==='p'?24:lmg?18:smg?16:42,'b',{name:n.name})});L13.loud=true}
/* atascos: desvío lateral y, si sigue sin avanzar lejos del jugador, reaparición detrás fuera de su vista */
function stuck30(n,dt,pp,fx,fz,rx,rz,dp){if(!n.tgt){n.sk=0;return}n.chk=(n.chk||0)-dt;if(n.chk>0)return;n.chk=1.6;const p=n.g.position,d=Math.hypot(p.x-n.tgt[0],p.z-n.tgt[1]);if(n.lastD!==undefined&&n.lastD-d<.6){n.sk=(n.sk||0)+1;const a=Math.atan2(n.tgt[0]-p.x,n.tgt[1]-p.z)+(n.sk%2?1.4:-1.4);n.tgt=[p.x+Math.sin(a)*4,p.z+Math.cos(a)*4];
  if(n.sk>3&&dp>20){const bx=pp.x-fx*6+rx*(R()-.5)*4,bz=pp.z-fz*6+rz*(R()-.5)*4;if(typeof blockedAt!=='function'||!blockedAt(bx,bz)){p.set(bx,pp.y,bz);n.vx=n.vz=0;n.tgt=null}n.sk=0}}else n.sk=0;n.lastD=d}
compUpd13=compUpd30;
{const _ex=expSnd;expSnd=function(x,z,k){AI30.blast={x,z,t:time};return _ex(x,z,k)}}
/* órdenes de escuadra en las misiones a pie: seguir → avanzar → mantener */
{const _o=orderLt;orderLt=function(){if(playing&&(level===13||level===14||level===16||(level===15&&typeof L28!=='undefined'&&!L28.onBoat))){const L=['follow','advance','hold'],N={follow:'SEGUIRME Y CUBRIR',advance:'AVANZAR Y FLANQUEAR',hold:'MANTENER ESTA POSICIÓN'};AI30.ord=L[(L.indexOf(AI30.ord)+1)%L.length];for(const n of L13.sq||[]){n.dp=null;n.cov=null}feed('ORDEN DE ESCUADRA: '+N[AI30.ord]);const n=(L13.sq||[]).find(q=>q.on);if(n)aiSay30(n,{follow:'¡Entendido, lo cubrimos!',advance:'¡Avanzamos! ¡Fuego y movimiento!',hold:'¡Posición tomada!'}[AI30.ord],0);snd(520,.12,'square',.03);return}return _o()}}
/* =====================================================================
   4 · TERRENO: texturas procedurales y calcomanías instanciadas
   ===================================================================== */
const DEC30={};
function decTex30(kind){const c=document.createElement('canvas');c.width=c.height=128;const x=c.getContext('2d'),cx=64;x.clearRect(0,0,128,128);const blob=(col,a,r,n)=>{for(let i=0;i<n;i++){const ang=R()*6.283,d=R()*r;x.fillStyle=col.replace('A',(a*(.4+R()*.6)).toFixed(2));x.beginPath();x.arc(cx+Math.cos(ang)*d,cx+Math.sin(ang)*d,4+R()*14,0,6.283);x.fill()}};
 if(kind==='mud'){blob('rgba(58,46,32,A)',.55,40,60);blob('rgba(30,24,18,A)',.4,30,30);blob('rgba(90,96,100,A)',.25,26,6)}
 else if(kind==='gravel'){blob('rgba(120,116,104,A)',.35,46,40);for(let i=0;i<500;i++){const a=R()*6.283,d=R()*54;x.fillStyle='rgba('+(90+R()*80|0)+','+(88+R()*70|0)+','+(80+R()*60|0)+','+(.5+R()*.5)+')';x.fillRect(cx+Math.cos(a)*d,cx+Math.sin(a)*d,1+R()*2.5,1+R()*2.5)}}
 else if(kind==='crater'){const g=x.createRadialGradient(cx,cx,4,cx,cx,60);g.addColorStop(0,'rgba(18,14,10,.95)');g.addColorStop(.45,'rgba(40,32,24,.85)');g.addColorStop(.7,'rgba(70,58,44,.55)');g.addColorStop(1,'rgba(70,58,44,0)');x.fillStyle=g;x.fillRect(0,0,128,128);for(let i=0;i<40;i++){const a=R()*6.283,d=30+R()*28;x.fillStyle='rgba(40,32,24,'+(.3+R()*.4)+')';x.fillRect(cx+Math.cos(a)*d,cx+Math.sin(a)*d,2+R()*4,2+R()*4)}}
 else if(kind==='scorch'){const g=x.createRadialGradient(cx,cx,2,cx,cx,62);g.addColorStop(0,'rgba(10,10,10,.85)');g.addColorStop(.6,'rgba(26,22,20,.5)');g.addColorStop(1,'rgba(26,22,20,0)');x.fillStyle=g;x.fillRect(0,0,128,128)}
 else if(kind==='tracks'){for(const s of[-1,1])for(let y=0;y<128;y+=6){x.fillStyle='rgba(40,34,26,'+(.5+R()*.3)+')';x.fillRect(cx+s*30-10,y,20,4)}}
 else if(kind==='oil'){blob('rgba(16,14,18,A)',.6,34,40);blob('rgba(60,40,90,A)',.12,24,8)}
 else{blob('rgba(70,74,62,A)',.4,48,50);blob('rgba(98,104,80,A)',.3,40,30)}
 const t=new T.CanvasTexture(c);return t}
/* textura de suelo opaca y sin costuras: tierra, grava fina y matices */
function groundTex30(){const c=document.createElement('canvas');c.width=c.height=256;const x=c.getContext('2d');x.fillStyle='#8a8478';x.fillRect(0,0,256,256);for(let i=0;i<2600;i++){const v=110+R()*80|0;x.fillStyle='rgba('+v+','+(v-6)+','+(v-16)+','+(.25+R()*.4)+')';const s=1+R()*3;x.fillRect(R()*256,R()*256,s,s)}for(let i=0;i<40;i++){x.fillStyle='rgba(70,62,50,'+(.08+R()*.12)+')';x.beginPath();x.arc(R()*256,R()*256,10+R()*30,0,6.283);x.fill()}const t=new T.CanvasTexture(c);t.wrapS=t.wrapT=T.RepeatWrapping;return t}
function decalSet30(kind,max){if(DEC30[kind])return DEC30[kind];const g=new T.PlaneGeometry(1,1);g.rotateX(-1.5708);const m=new T.MeshLambertMaterial({map:decTex30(kind),transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2});const im=new T.InstancedMesh(g,m,max||80);im.count=0;im.frustumCulled=false;im.renderOrder=1;scene.add(im);return DEC30[kind]={im,max:max||80,i:0}}
const _dm30=new T.Matrix4(),_dq30=new T.Quaternion(),_dv30=new T.Vector3(),_ds30=new T.Vector3(),_de30=new T.Euler();
function decalAt30(kind,x,z,s,y,rot){const D=decalSet30(kind,kind==='crater'||kind==='scorch'?60:120);const i=D.i%D.max;D.i++;_dv30.set(x,(y||0)+.02+(D.i%7)*.002,z);_dq30.setFromEuler(_de30.set(0,rot===undefined?R()*6.283:rot,0));_ds30.set(s*(kind==='tracks'?.5:1),1,s);_dm30.compose(_dv30,_dq30,_ds30);D.im.setMatrixAt(i,_dm30);D.im.count=Math.min(D.max,Math.max(D.im.count,i+1));D.im.instanceMatrix.needsUpdate=true}
function scatter30(X,Z,R_,list){for(const [kind,n,s0,s1] of list)for(let i=0;i<n;i++){const a=R()*6.283,d=Math.sqrt(R())*R_;decalAt30(kind,X+Math.cos(a)*d,Z+Math.sin(a)*d,s0+R()*(s1-s0))}}
function trackLine30(x0,z0,x1,z1){const L=Math.hypot(x1-x0,z1-z0),a=Math.atan2(x1-x0,z1-z0);for(let t=0;t<L;t+=5)decalAt30('tracks',x0+(x1-x0)*t/L,z0+(z1-z0)*t/L,5.2,0,a)}
/* =====================================================================
   5 · CASCO DE INFANTERÍA DE MARINA v2 Y CABEZAS FEMENINAS
   ===================================================================== */
ssh29=function(hd,col,crossOn){marineHelm30(hd,col,crossOn)};
{const _e=enfermera29;enfermera29=function(x,z,o){const n=_e(x,z,Object.assign({face:0},o||{}));femHead30(n,(L30.fem=(L30.fem||0)+1)%3);return n}}
const L30={fem:0};
/* =====================================================================
   6 · CAÑÓN DE 88 mm DE LAS BATERÍAS: apuntado, disparo y retroceso
   ===================================================================== */
function batt30(dt){const E=ENV15;if(!E.batts||!L28.bb)return;const bb=L28.bb,ph=L28.ph;for(const b of E.batts){const m=b.m88;if(!m)continue;gunKick30(m,dt);if(b.dest.done)continue;const on=bb.g.visible&&((ph>=2&&ph<4&&b.k===1)||(ph>=2&&ph<=6&&b.k===2));if(!on)continue;
  const w=new T.Vector3();m.getWorldPosition(w);const t=bb.g.position,a=Math.atan2(t.x-w.x,t.z-w.z),d=Math.hypot(t.x-w.x,t.z-w.z);const u=m.userData;u.yaw.rotation.y=TT28(u.yaw.rotation.y,AD30(0,a-(b.G.rotation.y+m.rotation.y)),dt*.5);u.pitch.rotation.x+=(-CL30(.03+d/9000,0,.2)-u.pitch.rotation.x)*Math.min(1,dt*2);
  b.cd=(b.cd===undefined?2+R()*3:b.cd)-dt;if(b.cd<=0&&(!L9.cine||ph===2)){b.cd=5.5+R()*2.5;u.kick=1;const o=new T.Vector3();u.muzzles[0].getWorldPosition(o);fb12(o.x,o.y,o.z,4,.2,0);smoke(o.x,o.y,o.z,4,3,0xa8a49c,1.2,.6);burst(w.x,.5,w.z,0xa89878,10,.6,4);flashLight(o.x,o.y,o.z,3,.2,0xffc070);expSnd(o.x,o.z,.6);const tp=t.clone();tp.y=WY15+6;tp.x+=(R()-.5)*30;tp.z+=(R()-.5)*30;shell28({p:o,v:aimV28(o,tp,null,320,1.6,5),k:'gun',dmg:20,by:'a'})}}}
/* =====================================================================
   7 · TORPEDERA: cámara de conducción estable en tercera persona (puente)
   ===================================================================== */
const BC30={mode:'3p',pos:null,t:0};
{const _bp=boardPin28;boardPin28=function(){if(L28.stn!=='helm'||BC30.mode!=='3p'||L9.cine){BC30.pos=null;return _bp()}const g=B28.g,bp=g.position;const lp=stnPos28(),w=lw28(lp);P.g.position.set(w.x,w.y,w.z);P.vy=0;P.mvx=P.mvz=0;
 const rel=CL30(AD30(B28.hd+Math.PI,yaw),-2.4,2.4),ca=B28.hd+rel,pc=CL30(pitch,-.35,.3),dist=19-pc*6,h=6.8-pc*7;const want=new T.Vector3(bp.x-Math.sin(ca)*dist,Math.max(WY15+2.4,bp.y+h),bp.z-Math.cos(ca)*dist);
 /* no meter la cámara dentro de la montaña */for(let k=1;k>.3;k-=.1){const x=bp.x+(want.x-bp.x)*k,z=bp.z+(want.z-bp.z)*k;if(land15(x-X15,z)<want.y-2.5){want.set(x,want.y,z);break}}
 if(!BC30.pos){BC30.pos=cam.position.clone()}BC30.pos.lerp(want,Math.min(1,V16.dt*4.5));cam.position.copy(BC30.pos);cam.lookAt(bp.x+Math.sin(ca)*26,bp.y+2.2+pc*10,bp.z+Math.cos(ca)*26);cam.rotation.z+=B28.roll*.25}}
{const _u=update;update=function(dt){if(level===15&&typeof L28!=='undefined'&&L28.onBoat&&L28.stn==='helm'&&!fpv){BC30.mode=BC30.mode==='3p'?'1p':'3p';fpv=true;say(BC30.mode==='3p'?'Cámara de conducción exterior':'Vista desde el puente',1.2)}_u(dt);if(level===15&&L28.on){try{batt30(dt||0);waves30(dt||0)}catch(e){console.warn(e)}}}}
/* =====================================================================
   8 · DESEMBARCO EN CINCO OLEADAS (infantería de marina de Zheng-Hua)
   ===================================================================== */
const WV30=[{n:'Primera oleada · exploradores y fusileros de marina',k:['recon','recon','line','line','recon','line'],boats:2},{n:'Segunda oleada · infantería de línea',k:['line','line','line','line','line','line','line','line'],boats:3},{n:'Tercera oleada · vanguardia de choque de Zheng-Hua',k:['vanguard','vanguard','vanguard','vanguard','line','vanguard'],boats:2},{n:'Cuarta oleada · ametralladoras y apoyo',k:['support','support','line','line','support','line'],boats:2},{n:'Quinta oleada · refuerzos',k:[],boats:2}];
const W30={on:false,i:0,t:0,sent:0,boats:[],sentinel:null};
function waves30(dt){if(L28.ph!==3){W30.on=false;return}if(!W30.on){W30.on=true;W30.i=1;W30.t=0;W30.van=false;W30.sentinel={dropped:false,alive:true};if(L28.lcs)L28.lcs.push(W30.sentinel);for(const s of L28.lcs||[])if(s.k==='lc'&&s.troops)s.kind30='recon';feed('▸ '+WV30[0].n)}
 /* la primera oleada es la del v28: se le pone el uniforme de marina */for(const e of enemies)if(e.t13==='land'&&!e.zk&&e.hp>0)zhKit30(e,e.k8==='bar'?'support':R()<.5?'recon':'line');
 W30.t+=dt;const alive=alive28('land').length;if(W30.i<WV30.length&&(alive<=4||W30.t>45)&&W30.t>14){launchWave30(W30.i);W30.i++;W30.t=0}
 if(W30.i>=3&&!W30.van&&W30.t>8){W30.van=true;vanguardIn30()}
 if(W30.i>=WV30.length&&W30.boats.every(b=>b.dropped||!b.alive)&&alive===0&&W30.t>8&&W30.sentinel&&!W30.sentinel.dropped){W30.sentinel.dropped=true;radio28('Falk','¡Cinco oleadas y siguen sin pasar! ¡El muelle es nuestro!',2.4)}
 for(const b of W30.boats){if(b.st==='out'&&b.t>16&&b.g.visible){b.g.visible=false;b.alive=false}}}
function launchWave30(i){const w=WV30[i],A=ENV15.anch,ld=A.landing||[{x:-100,z:-3},{x:-40,z:-3},{x:70,z:-3}];let ks=w.k.slice();if(!ks.length){/* quinta oleada: según cómo va la defensa */const def=(L29.def||[]).filter(n=>!n.down29&&n.g.visible).length;const n=L28.ars<60||def<5?4:8;for(let j=0;j<n;j++)ks.push(['line','vanguard','support','recon'][j%4])}
 feed('▸ '+w.n);radio28('Vigía',i===2?'¡Tercera oleada! ¡Tropas de choque con máscaras!':'¡Más barcazas entrando en la dársena!',2.2);const per=Math.ceil(ks.length/w.boats);
 for(let b=0;b<w.boats;b++){const lp=ld[(i+b)%ld.length];const s=ship28('lc','e',lp.x*.5+(R()-.5)*30,-160-b*22,0,{});s.st='in';s.beach=[X15+lp.x,lp.z-4];s.vmax=7;s.troops=0;s.kinds=ks.slice(b*per,(b+1)*per);W30.boats.push(s);L28.lcs.push(s)}}
/* el v28 crea a los tripulantes de las barcazas: aquí se visten según la composición de la oleada */
{const _lc=lcAI28;lcAI28=function(s,dt){if(s.kinds&&s.st==='unload'&&!s.dropped){s.t+=dt;s.spd=0;s.goal=null;if(s.u.ramp)s.u.ramp.rotation.x=Math.min(1.25,s.t*.9);if(s.t>1.2){s.dropped=1;s.kinds.forEach((k,i)=>later28(i*.5,()=>{const w=tw28(s,new T.Vector3((i%2?.8:-.8),0,s.len/2+1.5+(i>>1)*.6));const e=sp28(k==='support'?'bar':k==='vanguard'?'stv':i%3===2?'stv':'mosin',w.x-X15,Math.max(w.z+3,2.5),{tag:'land',hold:k==='support'});zhKit30(e,k);e.alert=.3+R()*.4;e.active=true;e.unaware=false;if(k==='support'){e.hold=[e.g.position.x,0,e.g.position.z+4]}}));s.st2=1}return}if(s.kinds&&s.dropped&&s.st==='unload'){s.t+=dt;if(s.t>s.kinds.length*.5+3){s.st='out';s.t=0}return}return _lc(s,dt)}}
/* vanguardia de choque de Eisenmark: contraataque desde las barracas */
function vanguardIn30(){const A=ENV15.anch;radio28('Falk','¡La Vanguardia de choque al muelle! ¡Échenlos al agua!',2.4);for(let i=0;i<4;i++){const n=vanguard30(X15-104+i*3,108,{name:'Sturmmann '+['Wolff','Brandauer','Riedl','Kranz'][i],w:i===3?'lmg':'smg',lv:15});n.fsm='toCov';n.hp=160;const beach=(A.landing||[])[i%3]||{x:0,z:-3};n.cv=[X15+beach.x+(R()-.5)*6,8+R()*4];n.tgt=n.cv.slice();n.sp=6.4;n.act='run';n.ld=1e9;L29.def.push(n)}}
/* terreno más rico en escenarios existentes (calcomanías instanciadas, un draw call por tipo) */
{const _b=build28;build28=function(){const was=L28.built;_b();if(was)return;const X=X15;scatter30(X,60,120,[['mud',22,3,7],['gravel',16,3,6],['scorch',6,3,6]]);scatter30(X+20,-6,30,[['oil',10,1.5,4]]);trackLine30(X,8,X,90);trackLine30(X-60,40,X+90,40)}}
{const _b=build14;build14=function(){const was=L14.built;_b();if(was)return;const X=X14;for(let z=40;z>-700;z-=60)scatter30(X,z,40,[['crater',2,3,6],['scorch',3,3,7],['mud',2,3,6]]);trackLine30(X-1.5,40,X-1.5,-300);trackLine30(X+1.5,40,X+1.5,-300)}}
{const _b=build13;build13=function(){const was=L13.built;_b();if(was)return;const X=X13;scatter30(X,-120,120,[['mud',20,2,5]]);scatter30(X,-290,60,[['mud',14,3,6],['tracks',0,4,5]]);trackLine30(X,-250,X,-560)}}
