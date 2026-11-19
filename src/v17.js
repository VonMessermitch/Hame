/* =====================================================================
   v17 · OPERACIÓN TRES CORONAS — arsenal 8,98×66, MP38 de tambor,
   sable sin escudo y combos, médico de escuadra, enemigos rediseñados,
   esqueletos guardianes y el Capítulo IX: El Cerco de Vargenkreuz
   ===================================================================== */
const V17={};
/* ---------- texturas mejoradas (se redibujan los lienzos existentes: afecta a todo el juego) ---------- */
function retex(t,w,h,fn){const c=document.createElement('canvas');c.width=w;c.height=h;fn(c.getContext('2d'),w,h);t.image=c;t.needsUpdate=true}
retex(clothTex,128,128,(c,s)=>{for(let y=0;y<s;y+=2)for(let x=0;x<s;x+=2){const v=(((x>>1)+(y>>1))%2?7:-7)+(R()-.5)*12,b=170+v|0;c.fillStyle='rgb('+(b-9)+','+(b+1)+','+(b+9)+')';c.fillRect(x,y,2,2)}
 c.strokeStyle='rgba(38,46,54,.5)';c.setLineDash([3,2]);for(const y of[31,93]){c.beginPath();c.moveTo(0,y);c.lineTo(s,y);c.stroke()}for(const x of[22,106]){c.beginPath();c.moveTo(x,0);c.lineTo(x,s);c.stroke()}c.setLineDash([]);
 for(let i=0;i<9;i++){c.fillStyle='rgba(255,255,255,.07)';c.beginPath();c.ellipse(R()*s,R()*s,6+R()*10,4+R()*7,R()*3,0,7);c.fill()}const g=c.createLinearGradient(0,s*.65,0,s);g.addColorStop(0,'rgba(70,50,30,0)');g.addColorStop(1,'rgba(70,50,30,.32)');c.fillStyle=g;c.fillRect(0,0,s,s)});
retex(fabT,64,64,(c,s)=>{for(let y=0;y<s;y+=2)for(let x=0;x<s;x+=2){const b=232+((((x>>1)+(y>>1))%2)?9:-9)+(R()-.5)*12|0;c.fillStyle='rgb('+b+','+b+','+b+')';c.fillRect(x,y,2,2)}c.fillStyle='rgba(0,0,0,.12)';for(let x=0;x<s;x+=21)c.fillRect(x,0,1,s);for(let i=0;i<6;i++){c.fillStyle='rgba(90,70,40,.1)';c.fillRect(R()*s,R()*s,4+R()*8,3+R()*6)}});
retex(grainT,32,64,(c,w,h)=>{c.fillStyle='#8a5a34';c.fillRect(0,0,w,h);for(let x=0;x<w;x++){c.fillStyle=hsl_(24+R()*6,45+R()*10,28+Math.sin(x*.8)*7+R()*5);c.fillRect(x,0,1,h)}for(let i=0;i<5;i++){c.strokeStyle='rgba(40,20,8,.4)';c.beginPath();const x=R()*w;c.moveTo(x,0);c.bezierCurveTo(x+4,h*.3,x-4,h*.7,x+2,h);c.stroke()}c.fillStyle='rgba(255,230,190,.08)';c.fillRect(0,0,w,3)});
/* =====================================================================
   ARSENAL
   ===================================================================== */
/* Fusil Mannlicher-Mauser 8,98×66: cargador extraíble de 10 tipo Enfield, más daño, penetración y retroceso */
Object.assign(P.weapons.rifle,{mag:10,max:10,reserve:60,cd:.6,dmg:62,reload:2.6,fov:7});
{const q=PB();pBox(q,.076,.25,.15,0x2a2d30,0,-.06,-.15);pBox(q,.082,.03,.16,0x141414,0,-.195,-.15);for(let i=0;i<3;i++)pBox(q,.079,.012,.152,0x3a3d40,0,-.13+i*.05,-.15);pBox(q,.05,.03,.06,0xb8963a,0,.08,-.04);pbMesh(q,pW.rifle,VCV)}
const _fire17=fire;fire=function(){const cur=P.cur,n0=bullets.length,gun=P.gun9;if(gun){gunFire9();return}_fire17();if(cur==='rifle'&&!P.mg&&bullets.length>n0){const b=bullets[bullets.length-1];b.pen=1;b.v.multiplyScalar(1.22);shake=Math.max(shake,.8);pitch=clamp(pitch-.028,-.25,1.1);V16.kick=(V16.kick||0)+.32;fovKick=9;P.mvx=(P.mvx||0)*.8;P.mvz=(P.mvz||0)*.8;snd(46,.5,'sawtooth',.11);setTimeout(()=>snd(70,.9,'sine',.035),160);burst(b.m.position.x,b.m.position.y,b.m.position.z,0xffcc66,3,.12,6)}};
const _rl17=reload;reload=function(){if(P.cur==='rifle'&&!P.mg){const w=P.weapons.rifle;w.reload=w.mag>0?2.3:3.1}_rl17()};
/* MP38 con cargador de tambor de 50 (modelo nuevo, el tambor es la pieza animada en la recarga) */
function mkMP38d(){const w=new T.Group(),q=PB(),st=0x2e3134,dk=0x141414,bk=0x3a2416;
 pCyl(q,.058,.058,.72,st,0,-.48,0,0,0,0,10);for(let i=0;i<6;i++)pBox(q,.122,.03,.03,0x0a0a0a,0,-.27-i*.08,0);pCyl(q,.03,.03,.34,dk,0,-.98,0,0,0,0,8);pCyl(q,.037,.037,.07,dk,0,-1.16,0,0,0,0,8);pBox(q,.02,.08,.03,st,0,-1.12,.065);pBox(q,.03,.08,.04,dk,0,-.84,-.07);
 pBox(q,.1,.6,.11,0x45484b,0,.04,0);pBox(q,.08,.2,.05,0x2a2a2a,0,.12,.07);pBox(q,.075,.27,.1,bk,0,.1,-.13,.28);pBox(q,.06,.06,.12,st,0,-.02,-.1);pBox(q,.05,.05,.03,st,0,-.12,.09);pBox(q,.02,.1,.02,st,.06,-.05,0);
 for(const s of[-.035,.035])pCyl(q,.012,.012,.62,0x2a2a2a,s,.66,-.03,0,0,0,6);pBox(q,.1,.05,.16,0x2a2a2a,0,.98,-.04);pbMesh(q,w,VCV);
 const knob=new T.Group();knob.position.set(.08,0,.03);{const k=PB();pCyl(k,.035,.035,.07,0x222222,0,0,0,0,0,1.5708,8);pbMesh(k,knob,VCV)}w.add(knob);
 const mag=new T.Group();mag.position.set(0,-.1,-.06);{const m=PB();pBox(m,.06,.16,.14,st,0,0,-.08);pCyl(m,.19,.19,.13,0x34373a,0,-.05,-.3,0,0,1.5708,16);for(const s of[-.06,.06])pCyl(m,.205,.205,.025,dk,s,-.05,-.3,0,0,1.5708,16);for(let i=0;i<8;i++){const a=i/8*6.283;pBox(m,.14,.02,.03,0x1e2022,0,-.05+Math.cos(a)*.17,-.3+Math.sin(a)*.17,a)}pCyl(m,.05,.05,.05,0x8a8a80,.1,-.05,-.3,0,0,1.5708,8);pBox(m,.02,.13,.02,0x8a8a80,.13,-.05,-.3);pbMesh(m,mag,VCV)}w.add(mag);
 w.userData={mag,knob};return w}
{const o=pW.smg;if(o.parent)o.parent.remove(o);pW.smg=mkMP38d();pW.smg.visible=false;P.g.userData.mR.add(pW.smg)}
/* Sable polaco aserrado: nuevo modelo (sin escudo), guarda de estribo, empuñadura con alambre, vaceo y filo pulido */
const SABM=new T.MeshPhongMaterial({vertexColors:true,shininess:80,specular:0x777777});
function mkSabre9(){const w=new T.Group(),q=PB(),st=0xd4d9de,ed=0xf4f6f8,br=0xc9a23a,lw=0x3a2414;
 pBox(q,.052,.28,.056,lw,0,.04,0);for(let i=0;i<7;i++)pBox(q,.058,.012,.062,0xb08a40,0,-.08+i*.04,0,0,0,.35);pa(q,gSph(.046,8,6),br,0,.21,.0);pBox(q,.06,.05,.075,br,0,.245,.03);
 pBox(q,.03,.32,.026,br,0,.03,.13);pBox(q,.03,.026,.13,br,0,-.14,.065);pBox(q,.03,.026,.11,br,0,.19,.07);pBox(q,.38,.045,.07,br,0,-.155,0);for(const s of[-1,1])pa(q,gSph(.035,6,5),br,s*.19,-.155,0);
 const N=16,L=1.62;for(let i=0;i<N;i++){const t=(i+.5)/N,x=.34*t*t,y=-.2-t*L,rz=Math.atan(.68*t/L),hw=.092*(1-t*.38)+.012,dy=L/N*1.12;pBox(q,hw*2,dy,.024,st,x,y,0,0,0,rz,.02);if(t<.9)pBox(q,hw*.45,dy*.98,.03,0x6c737a,x+.006,y,0,0,0,rz,.01);pBox(q,.014,dy,.027,ed,x+hw-.006,y,0,0,0,rz,.01);
  if(i>=2&&i<N-1)for(let k=0;k<2;k++)pBox(q,.04,.035,.022,st,x-hw-.012,y+(k?-.04:.04),0,0,0,rz+.8,.02)}
 pa(q,gCone(.05,.18,6),st,.35,-.2-L-.07,0,0,0,.55);const m=pbMesh(q,w,SABM);return w}
{const o=pW.sword;if(o.parent)o.parent.remove(o);pW.sword=mkSabre9();pW.sword.visible=false;P.g.userData.mR.add(pW.sword)}
if(pShield.parent)pShield.parent.remove(pShield);
/* cadena de 5 golpes: tajo, revés, estocada, molinete giratorio y golpe aplastante */
SW.splice(2,0,{d:.4,dmg:48,k:'t',a0:0,a1:0},{d:.6,dmg:58,k:'s',a0:0,a1:0});
const _slash17=slash;slash=function(S){if(level===9)dev9Melee(S);if(S.k!=='t'&&S.k!=='s')return _slash17(S);let hit=0;const px=P.g.position.x,pz=P.g.position.z,fx=Math.sin(P.swFace),fz=Math.cos(P.swFace);
 for(const e of[...enemies]){const dx=e.g.position.x-px,dz=e.g.position.z-pz,d=Math.hypot(dx,dz)||1,ok=S.k==='s'?d<4.8*Math.max(1,e.s*.7):d<5.8*Math.max(1,e.s*.6)&&(dx*fx+dz*fz)/d>.72;
  if(ok){hurt(e,S.dmg,'m');hit++;e.stun=S.k==='t'?.75:.5;if(e.type!=='boss'&&e.type!=='mecha'&&!e.boss9){const k=S.k==='s'?2.6:1.3;e.g.position.x+=dx/d*k;e.g.position.z+=dz/d*k}burst(e.g.position.x,1.3,e.g.position.z,0xffcc66,8,.35,6)}}
 if(S.k==='s'){for(let i=0;i<16;i++){const a=i/16*6.283;burst(px+Math.cos(a)*2.6,1.1,pz+Math.sin(a)*2.6,0xd8e8ff,1,.3,3)}snd(150,.35,'sawtooth',.09);shake=Math.max(shake,.7)}else{burst(px+fx*3,1.3,pz+fz*3,0xffe0a0,6,.25,8);snd(420,.12,'square',.06)}
 if(hit){styl(9*hit);hs=.08;score+=hit*30;snd(300,.08,'square',.07)}};
const _swap17=swap;swap=function(){_swap17();if(P.cur==='rifle')say('Fusil Mannlicher-Mauser 8,98×66 — cargador de 10 (tipo Enfield), atraviesa enemigos',2);if(P.cur==='smg')say('MP38 — tambor de 50 cartuchos',1.6);if(P.cur==='sword')say('Sable aserrado — combo de 5: tajo, revés, estocada, molinete, aplastamiento',2.2)};
/* animaciones nuevas del sable y cuerpo del jugador */
const _aP17=animP;animP=function(dt,mv,run){_aP17(dt,mv,run);const u=P.g.userData;
 if(P.swT>=0){const S=SW[P.sc],t=P.swT/S.d;
  if(S.k==='t'){if(t<.3){const q=ez(t/.3);u.aR.rotation.x=lr(-1,-1.25,q);u.eR.rotation.x=lr(-.4,-1.9,q);u.aR.rotation.y=.3;u.b.rotation.x=-.12*q;u.ch.rotation.y=.25*q}else if(t<.55){const q=ez((t-.3)/.25);u.aR.rotation.x=lr(-1.25,-1.6,q);u.eR.rotation.x=lr(-1.9,0,q);u.b.rotation.x=lr(-.12,.38,q);u.ch.rotation.y=lr(.25,-.35,q)}else{const q=ez((t-.55)/.45);u.aR.rotation.x=lr(-1.6,-.7,q);u.eR.rotation.x=lr(0,-.4,q);u.b.rotation.x=lr(.38,0,q);u.ch.rotation.y=-.35*(1-q)}}
  else if(S.k==='s'){const q=ez(t);u.b.rotation.y=(q*6.2832)%6.2832;u.aR.rotation.x=-1.5;u.aR.rotation.y=1.05;u.eR.rotation.x=-.1;u.aL.rotation.x=-.5;u.aL.rotation.y=-1.1;u.b.position.y=.8-Math.sin(t*Math.PI)*.22;trH.material.opacity=.85*Math.sin(t*Math.PI);trPH.rotation.y=u.b.rotation.y+P.face}}};
/* jugador: correaje con cartuchera de peines, cantimplora de máscara, guantes y polainas */
{const u=P.g.userData,q=PB();pBox(q,.07,.84,.035,0x4a3220,0,.36,.215,0,0,-.62);for(let i=0;i<7;i++)pBox(q,.05,.05,.03,0xb8963a,-.21+i*.07,.62-i*.085,.235);pCyl(q,.09,.09,.26,0x4a5040,.31,.16,-.15,0,0,0,10);pCyl(q,.092,.092,.03,0x2a2a22,.31,.3,-.15,0,0,0,10);pBox(q,.16,.1,.02,0x7a2434,0,.6,.205);pbMesh(q,u.ch,VCM);
 for(const e of[u.eR,u.eL]){const g=PB();pBox(g,.19,.1,.21,0x3a2a1a,0,-.35,0);pbMesh(g,e,VCM)}for(const k of[u.k1,u.k2]){const g=PB();for(let i=0;i<4;i++)pBox(g,.265,.022,.285,0x5a5440,0,-.1-i*.05,0,0,0,i%2?.15:-.15);pbMesh(g,k,VCM)}}
/* =====================================================================
   ESCUADRA REMODELADA + MÉDICO (Sanitäter con pistola C10 y cuchillo)
   ===================================================================== */
let MED=null;
function mkKnife(){const q=PB();pBox(q,.04,.12,.05,0x3a2414,0,.02,0);pBox(q,.1,.02,.05,0x8a8a80,0,-.05,0);pBox(q,.025,.24,.012,0xd0d4d8,0,-.18,0,0,0,0,.02);return pbMesh(q,null,SABM)}
function makeMedic(){if(MED){scene.remove(MED.g);if(MED.lab)MED.lab.remove()}const g=mkSoldier({coat:0x5e6e74,hat:'helm',hatC:0x55605a,tab:0xe8e8e8,pack:false,face:3,scale:1});const u=g.userData;
 {const q=PB();pBox(q,.215,.1,.235,0xeeeeee,0,-.13,0);pBox(q,.012,.07,.02,0xc01818,.11,-.13,0);pBox(q,.012,.02,.07,0xc01818,.11,-.13,0);pbMesh(q,u.aL,VCM)}
 {const q=PB();pBox(q,.3,.27,.15,0x8a7a5a,-.33,.0,.06);pBox(q,.012,.12,.04,0xc01818,-.48,.0,.06);pBox(q,.012,.04,.12,0xc01818,-.48,.0,.06);pBox(q,.05,.8,.03,0x5a4630,-.12,.38,.2,0,0,.5);pbMesh(q,u.b,VCM)}
 {const q=PB();pBox(q,.14,.14,.02,0xffffff,0,.3,.26);pBox(q,.03,.1,.025,0xc01818,0,.3,.27);pBox(q,.1,.03,.025,0xc01818,0,.3,.27);pbMesh(q,u.hd,VCM)}
 u.mR.add(mkGun('c96'));const kn=mkKnife();u.mL.add(kn);scene.add(g);const lab=document.createElement('div');lab.className='nm';lab.style.color='#ff9c9c';$('hud').appendChild(lab);
 MED={g,u,hp:100,down:0,up:0,t:0,cd:0,mcd:0,hcd:0,mag:10,rel:0,heal:null,healT:0,name:'Sanitäter Ritter',vx:0,vz:0,lab,lv:-1,stab:0};return MED}
const _ab17=assignBots;assignBots=function(){_ab17();allies.forEach(a=>{const old=a.g,rk=a.name.startsWith('Uffz')?2:a.name.startsWith('Obgfr')?1:0;const ng=mkSoldier({coat:0x56687a,pants:0x3b4852,hat:'helm',hatC:0x4a5258,tab:0x7a2434,rank:rk,pack:true,puttee:0x4a4a3e});ng.position.copy(old.position);ng.rotation.y=old.rotation.y;ng.visible=old.visible;if(old.parent){old.parent.add(ng);old.parent.remove(old)}else scene.add(ng);disp16(old);a.g=ng;ng.userData.mR.add(a.role==='Apoyo'?mkMP38d():mkGun('rifle'));a.mag=a.role==='Apoyo'?50:10});makeMedic()};
function medPatient(){const m=MED,p=m.g.position;let best=null,bd=70;const c=(q,ref,kind)=>{const d=Math.hypot(q.x-p.x,q.z-p.z);if(d<bd){bd=d;best={ref,kind}}};
 if(P.hp>0&&P.hp<=10)c(P.g.position,P,'p');for(const a of allies)if(a.name&&a.g.visible&&(a.down>0||(a.hp!==undefined&&a.hp<=10)))c(a.g.position,a,'a');
 const o=officer;if(o&&o.g.visible&&(o.down>0||o.hp<=13))c(o.g.position,o,'o');for(const s of GAR)if(s.alive&&s.g.visible&&s.hp<=s.max*.1)c(s.g.position,s,'g');return best}
function medHealStep(h,dt){const r=h.ref;if(h.kind==='p'){P.hp=Math.min(100,P.hp+dt*22);P.inv=Math.max(P.inv,.2);return P.hp>=65}
 if(h.kind==='a'){if(r.down>0){r.down=Math.max(.01,r.down-dt*3);if(MED.healT>2.2){r.down=0;r.up=.8;r.hp=70;return true}return false}r.hp=Math.min(80,(r.hp||0)+dt*28);return r.hp>=70}
 if(h.kind==='o'){if(r.down>0){if(MED.healT>2.2){r.down=0;r.up=.9;r.hp=95;return true}return false}r.hp=Math.min(110,r.hp+dt*30);return r.hp>=90}
 if(h.kind==='g'){if(!r.alive)return true;r.down=0;r.hp=Math.min(r.max*.7,r.hp+dt*30);return r.hp>=r.max*.65}return true}
function medUpd(dt){const m=MED;if(!m)return;const g=m.g,p=g.position,u=m.u;const hide=level===7||(level===8&&L8.cine)||(level===9&&L9.cine)||!playing;
 if(hide){m.lab.style.display='none';if(level===7)g.visible=false;return}if(!g.visible||m.lv!==level||Math.hypot(p.x-P.g.position.x,p.z-P.g.position.z)>95){g.visible=true;m.lv=level;p.set(P.g.position.x+2.2,0,P.g.position.z+2.6);m.heal=null}
 m.t+=dt;m.cd-=dt;m.hcd-=dt;m.mcd-=dt;m.stab=Math.max(0,m.stab-dt);m.rel=Math.max(0,m.rel-dt);if(m.rel===0&&m.wr){m.wr=0;m.mag=10}
 if(m.down>0){m.down-=dt;g.rotation.x+=(-1.4-g.rotation.x)*Math.min(1,dt*6);p.y=.25;if(m.down<=0){m.up=.8;m.hp=70;say(m.name+': «Me vendo yo mismo… ¡sigo con vosotros!»',2.2)}m.lab.style.display='none';return}
 if(m.up>0){m.up-=dt;g.rotation.x*=Math.pow(.02,dt);p.y*=Math.pow(.02,dt);if(m.up<=0){g.rotation.x=0;p.y=0}return}
 if(!m.heal&&m.hcd<=0){const h=medPatient();if(h){m.heal=h;m.healT=0;const nm=h.kind==='p'?'Oberleutnant':h.kind==='o'?'mi teniente':h.ref.name.split(' ').pop();say(m.name+': «¡Aguanta, '+nm+'! ¡Voy!»',2)}}
 const ph=m.t*10,k=Math.min(1,dt*10);let tg=null,td=30;for(const e of enemies){const d=Math.hypot(e.g.position.x-p.x,e.g.position.z-p.z);if(d<td){td=d;tg=e}}
 if(m.heal){const r=m.heal.ref,q=m.heal.kind==='p'?P.g.position:r.g.position;if(m.heal.kind==='g'&&!r.alive){m.heal=null;return}const d=navMove(m,q.x+.8,q.z+.8,6.4,dt,1.0);
  if(d<1.6){m.healT+=dt;g.rotation.y=Math.atan2(q.x-p.x,q.z-p.z);u.l1.rotation.x=-1.45;u.k1.rotation.x=1.65;u.l2.rotation.x=-.15;u.k2.rotation.x=1.75;u.b.position.y=.45;u.b.rotation.x=.35;u.hd.rotation.x=.4;u.aR.rotation.x=-1.25+Math.sin(m.t*11)*.35;u.aL.rotation.x=-1.1+Math.cos(m.t*11)*.35;u.eR.rotation.x=u.eL.rotation.x=-.9;
   if(R()<dt*8)burst(q.x,1+R(),q.z,R()<.5?0x7aff8a:0xffffff,1,.6,1.5);if(R()<dt*2)snd(880,.08,'sine',.02);if(medHealStep(m.heal,dt)||m.healT>4){feed('✚ '+m.name+' atendió a '+(m.heal.kind==='p'?'Kovač':m.heal.kind==='o'?'el teniente':r.name));snd(660,.25,'sine',.04);m.heal=null;m.hcd=3}m.lab.style.display='none';return}}
 else{const fx=-Math.sin(yaw),fz=-Math.cos(yaw),rx=Math.cos(yaw),rz=-Math.sin(yaw);navMove(m,P.g.position.x+fx*1.2+rx*3.4,P.g.position.z+fz*1.2+rz*3.4,5.6,dt,1.6)}
 /* combate: cuchillo a corta distancia, pistola C10 a media */
 if(tg){g.rotation.y=angL(g.rotation.y,Math.atan2(tg.g.position.x-p.x,tg.g.position.z-p.z),Math.min(1,dt*10));
  if(td<3.4&&td>1.5&&m.mcd<=.15){const dx=tg.g.position.x-p.x,dz=tg.g.position.z-p.z;p.x+=dx/td*4.5*dt;p.z+=dz/td*4.5*dt}
  if(td<2.4&&m.mcd<=0){m.kc=((m.kc||0)+1)%3;m.mcd=m.kc===2?1.0:.55;m.stab=.4;m.sk=m.kc;hurt(tg,m.kc===2?55:34,'m',m);tg.stun=m.kc===2?.6:.3;const dx=tg.g.position.x-p.x,dz=tg.g.position.z-p.z,l=Math.hypot(dx,dz)||1;if(m.kc===2){tg.g.position.x+=dx/l*1.2;tg.g.position.z+=dz/l*1.2;m.back=.35}burst(tg.g.position.x,1.2,tg.g.position.z,0xaa2a1a,5,.3,3);snd(m.kc===1?380:260,.1,'sawtooth',.05);if(R()<.15)say(m.name+': «'+['¡Atrás, bestia!','¡Esto no es un hospital!','¡Fuera de mi paciente!'][R()*3|0]+'»',1.8)}
  else if(td<30&&td>=2.6&&m.cd<=0&&m.rel<=0){if(m.mag<=0){m.rel=1.6;m.wr=1}else{const o=p.clone();o.y=1.5;if(losClear(o.x,o.y,o.z,tg.g.position.x,1.3*tg.s,tg.g.position.z)){m.mag--;m.cd=.45+R()*.3;m.rk=1;const t2=tg.g.position.clone();t2.y=1.25*tg.s;const v=t2.sub(o).normalize();v.x+=(R()-.5)*.04;v.z+=(R()-.5)*.04;v.normalize().multiplyScalar(66);const b=new T.Mesh(bG,bM);b.position.copy(o);b.lookAt(o.clone().add(v));scene.add(b);bullets.push({m:b,v,life:1.2,dmg:18,by:m});npcShot('rifle',o.x,o.z);burst(o.x+v.x*.012,o.y,o.z+v.z*.012,0xffdd88,1,.06,1)}else m.cd=.25}}}
 else if(Math.hypot(m.vx,m.vz)>.3)g.rotation.y=angL(g.rotation.y,Math.atan2(m.vx,m.vz),Math.min(1,dt*6));
 const mvv=Math.hypot(m.vx,m.vz),gait=mvv>.35?Math.sin(ph)*.6:0;u.l1.rotation.x+=(gait-u.l1.rotation.x)*k;u.l2.rotation.x+=(-gait-u.l2.rotation.x)*k;u.k1.rotation.x+=((mvv>.35?Math.max(0,Math.sin(ph+1.4))*.75:0)-u.k1.rotation.x)*k;u.k2.rotation.x+=((mvv>.35?Math.max(0,Math.sin(ph+4.54))*.75:0)-u.k2.rotation.x)*k;
 u.b.position.y+=(.8+(mvv>.35?Math.abs(Math.sin(ph))*.05:0)-u.b.position.y)*k;u.b.rotation.x+=(Math.min(.14,mvv*.03)-u.b.rotation.x)*k;u.hd.rotation.x*=.9;
 m.rk=Math.max(0,(m.rk||0)-dt*7);m.back=Math.max(0,(m.back||0)-dt);if(m.back>0&&tg){const dx=p.x-tg.g.position.x,dz=p.z-tg.g.position.z,l=Math.hypot(dx,dz)||1;p.x+=dx/l*5*dt;p.z+=dz/l*5*dt}const aim=tg&&td<30&&td>=2.6,mel=m.stab>0;
 if(mel){const q=1-m.stab/.4;if(m.sk===1){u.aL.rotation.x=-1.4;u.aL.rotation.y=lr(-1.1,1.0,ez(q));u.eL.rotation.x=-.3;u.ch.rotation.y=lr(.4,-.5,ez(q))}else{u.aL.rotation.y=0;u.aL.rotation.x=q<.35?lr(-1,-1.25,q/.35):lr(-1.25,-1.75,ez((q-.35)/.65));u.eL.rotation.x=q<.35?lr(-.8,-1.7,q/.35):lr(-1.7,0,ez((q-.35)/.65));u.ch.rotation.y=-.3*Math.sin(q*Math.PI)}u.aR.rotation.x=-.7;u.eR.rotation.x=-.9;u.b.rotation.x=.25*Math.sin(q*Math.PI)}
 else if(aim){u.aR.rotation.x+=(-1.52+m.rk*.35-u.aR.rotation.x)*Math.min(1,dt*18);u.eR.rotation.x=-.08-m.rk*.2;u.aL.rotation.x+=(-1.38+m.rk*.3-u.aL.rotation.x)*k;u.aL.rotation.y=.55;u.eL.rotation.x=-.45;u.ch.rotation.y*=.8;u.ch.rotation.x=-.05-m.rk*.06;u.hd.rotation.x=.05}
 else{u.aR.rotation.x+=(-.55-u.aR.rotation.x)*k;u.eR.rotation.x+=(-.5-u.eR.rotation.x)*k;u.aL.rotation.x+=(-.6-u.aL.rotation.x)*k;u.aL.rotation.y*=.8;u.eL.rotation.x+=(-.7-u.eL.rotation.x)*k;u.ch.rotation.y*=.8;u.ch.rotation.x*=.8}
 const v=p.clone();v.y+=2.5;v.project(cam);const dd=p.distanceTo(cam.position);if(v.z<1&&dd<55&&Math.abs(v.x)<1.1&&Math.abs(v.y)<1.1){m.lab.style.display='block';m.lab.style.left=((v.x*.5+.5)*innerWidth)+'px';m.lab.style.top=((-v.y*.5+.5)*innerHeight)+'px';m.lab.textContent='✚ '+m.name+' · Médico';m.lab.style.opacity=clamp(1.3-dd/55,.3,1)}else m.lab.style.display='none'}
function medDamage(d){const m=MED;if(!m||m.down>0)return;m.hp-=d*.55;burst(m.g.position.x,1.2,m.g.position.z,0xaa2a1a,3,.25,2);if(m.hp<=0){m.hp=0;m.down=8;m.heal=null;feed('⚕ ¡El médico Ritter está herido!')}}
/* =====================================================================
   ENEMIGOS: modelos enriquecidos (orcos en especial), esqueletos,
   capa de animación de combate y tácticas
   ===================================================================== */
const ORC={orcoE:.22,orcoH:.32,granadero:.28};
function decorEnemy(e){const u=e.g.userData,t=e.type;if(!u||!u.hd)return;const EM=u.em16||(u.em16=VCM.clone());
 if(ORC[t]!==undefined){e.orc=1;e.hunchK=ORC[t];const sk=0x5a7a3a,dk=0x3a5226,mt=t==='orcoE'?0x555b5d:0x42464a;
  {const q=PB();pBox(q,.4,.07,.1,dk,0,.27,.17);pBox(q,.3,.11,.12,shade(sk,.8),0,.04,.14);for(const s of[-1,1]){pa(q,gCone(.035,.16,5),0xeee6c8,s*.1,.12,.2,-.3,0,s*.15);pBox(q,.05,.16,.1,sk,s*.22,.22,-.02,0,0,s*.6);pBox(q,.03,.12,.02,0x6a1a10,s*.08,.2,.181)}
   if(t==='orcoH'){for(const s of[-1,1])pa(q,gCone(.06,.32,6),0xd8d0b0,s*.2,.55,-.02,0,0,-s*.7)}else if(t==='orcoE'){for(let i=0;i<4;i++)pBox(q,.06,.12,.08,0x111111,0,.42+i*.0,.12-i*.09)}else pBox(q,.22,.16,.14,0x2a2c2a,0,.12,.22);pbMesh(q,u.hd,EM)}
  {const q=PB();pBox(q,.72,.12,.46,0x4a3220,0,.7,0);for(const s of[-1,1]){pBox(q,.32,.13,.38,mt,s*.43,.68,0,0,0,s*.2);for(let i=0;i<3;i++)pa(q,gCone(.035,.16,5),0xb8b8b0,s*(.36+i*.06),.8,-.1+i*.1)}pa(q,gSph(.07,6,5),0xe8e0c8,0,.3,.26);pBox(q,.04,.4,.03,0x2a2a26,.12,.35,.24,0,0,.5);pbMesh(q,u.ch,EM)}
  {const q=PB();pBox(q,.36,.44,.03,0x4a3220,0,-.2,.2);pBox(q,.34,.38,.03,0x3a2618,0,-.18,-.2);pBox(q,.14,.1,.04,0xc9a23a,0,.15,.21);pbMesh(q,u.b,EM)}
  for(const ee of[u.eR,u.eL]){const q=PB();pBox(q,.21,.14,.23,mt,0,-.2,0);pa(q,gCone(.03,.14,4),0xb8b8b0,0,-.2,.12,1.5708);pbMesh(q,ee,EM)}
  for(const kk of[u.k1,u.k2]){const q=PB();pa(q,gCone(.035,.13,4),0xb8b8b0,0,.0,.16,1.5708);pbMesh(q,kk,EM)}}
 else if(t==='plaga'){e.hunchK=.18;for(let i=0;i<5;i++){const m=new T.Mesh(gSph(.05+R()*.04,6,5),new T.MeshLambertMaterial({color:0xffb030,emissive:0x8a4a00}));m.position.set((R()-.5)*.5,.15+R()*.5,.18+R()*.04);u.ch.add(m)}for(const ee of[u.eR,u.eL]){const q=PB();for(let i=0;i<3;i++)pa(q,gCone(.02,.16,4),0x2a2018,-.05+i*.05,-.55,0,Math.PI);pbMesh(q,ee,EM)}}
 else if(t==='mago'){const q=PB();pa(q,gCone(.42,.9,8),0x3a1a4a,0,-.3,0,Math.PI);pbMesh(q,u.b,EM);const h=PB();pBox(h,.44,.2,.44,0x2a1236,0,.42,-.03);pa(h,gCone(.2,.4,6),0x2a1236,0,.62,-.1,-.4);pbMesh(h,u.hd,EM);const o=new T.Mesh(gSph(.12,8,6),new T.MeshLambertMaterial({color:0xcc88ff,emissive:0x7722bb}));o.position.y=-1.65;u.mR.add(o)}
 else if(t==='custodio'){const q=PB();pBox(q,.06,.3,.5,0xc9a23a,0,.62,0);pBox(q,.6,.9,.04,0x6a1a1a,0,-.05,-.24,.1);pbMesh(q,u.hd,EM);const c=PB();pBox(c,.62,1.0,.04,0x7a1a1a,0,.1,-.24,.12);pbMesh(c,u.ch,EM)}
 else if(t==='trasgo'){e.hunchK=.15;const q=PB();pBox(q,.44,.3,.46,0x3a3a2a,0,.32,-.04);pBox(q,.08,.12,.12,0x6a8a3a,0,.12,.22);pbMesh(q,u.hd,EM)}
 else if(t==='sol'&&!e.k8){const q=PB();pBox(q,.06,.8,.035,0x5a3a20,0,.35,.21,0,0,.6);pCyl(q,.08,.08,.22,0x4a4a3a,-.3,.1,-.1);pbMesh(q,u.ch,EM)}}
const _sE17=spawnE;spawnE=function(type,x,z){const e=_sE17(type,x,z);try{decorEnemy(e)}catch(err){}return e};
/* ESQUELETOS GUARDIANES: huesos fusionados sobre el mismo esqueleto articulado (compatibles con IA y ragdoll) */
function spSkel(x,z){const e=spawnE('plaga',x,z),u=e.g.userData;e.skel=1;e.hunchK=.1;e.k8n='a un esqueleto guardián';const S=sharedSets();
 for(const j of[u.l1,u.k1,u.l2,u.k2,u.b,u.ch,u.hd,u.aR,u.eR,u.aL,u.eL,u.mR,u.mL])for(const c of j.children.slice())if(c.isMesh){j.remove(c);if(!S.g.has(c.geometry))c.geometry.dispose()}
 e.g.children.slice().forEach(c=>{if(c.isMesh&&c.geometry!==shG)e.g.remove(c)});const B=0xd8d0b8,Bd=0xa89a80,EM=u.em16||(u.em16=VCM.clone());
 const bone=(j,f)=>{const q=PB();f(q);pbMesh(q,j,EM)};
 for(const l of[u.l1,u.l2])bone(l,q=>{pCyl(q,.05,.045,.4,B,0,-.2,0,0,0,0,6);pa(q,gSph(.07,6,5),Bd,0,-.4,0)});for(const k of[u.k1,u.k2])bone(k,q=>{pCyl(q,.045,.04,.36,B,0,-.18,0,0,0,0,6);pBox(q,.14,.06,.24,B,0,-.38,.05)});
 bone(u.b,q=>{pBox(q,.4,.14,.2,B,0,.02,0);pCyl(q,.04,.04,.3,Bd,0,.2,-.05,0,0,0,6);pBox(q,.6,.06,.06,0x5a3a20,0,.1,.1)});
 bone(u.ch,q=>{pCyl(q,.04,.04,.7,Bd,0,.35,-.1,0,0,0,6);for(let i=0;i<5;i++){const y=.18+i*.11,w=.5-Math.abs(i-1.8)*.06;pa(q,gTor(w/2,.022,4,12,3.3),B,0,y,-.02,1.5708,0,0,1,1,1.1)}pBox(q,.5,.06,.08,B,0,.66,0);pBox(q,.06,.3,.04,B,0,.42,.14)});
 bone(u.hd,q=>{pa(q,gSph(.19,10,8),B,0,.2,0,0,0,0,1,1.05,1.1);pBox(q,.26,.1,.18,B,0,.04,.08);for(let i=0;i<5;i++)pBox(q,.03,.04,.02,0xf0e8d0,-.08+i*.04,.08,.17);pBox(q,.2,.05,.1,0x6a5a3a,0,.38,-.02);pBox(q,.06,.04,.04,0x111111,0,.13,.19)});
 for(const s of[-1,1]){const ey=new T.Mesh(gSph(.045,6,5),new T.MeshBasicMaterial({color:0x50ffd0}));ey.position.set(s*.075,.22,.16);u.hd.add(ey)}
 for(const a of[u.aR,u.aL])bone(a,q=>pCyl(q,.04,.035,.36,B,0,-.18,0,0,0,0,6));for(const el of[u.eR,u.eL])bone(el,q=>{pCyl(q,.035,.03,.32,B,0,-.16,0,0,0,0,6);pBox(q,.1,.12,.06,B,0,-.4,0)});
 u.mR.add(mkSabre());e.hp=e.max=95*({easy:.78,normal:1,hard:1.28}[difficulty]||1);e.sp=4.6;return e}
const _kill17=kill;kill=function(e){if(e.skel){const p=e.g.position;for(let i=0;i<3;i++)burst(p.x,1+i*.4,p.z,0xe8e0c8,6,.8,5);snd(900,.12,'square',.03)}if(e.boss9)boss9Dead(e);_kill17(e)};
/* capa de animación: encorvamiento y balanceo pesado de orcos, anticipación y torsión en los golpes,
   retroceso al recibir impactos, rugido de combate, respiración y retroceso del disparo */
const _aE17=animE;animE=function(e,ax,az,dt,crouch){_aE17(e,ax,az,dt,crouch);const u=e.g.userData;if(!u||!u.ch)return;const mv=Math.hypot(e.vx||0,e.vz||0),t=e.t||0,hk=e.hunchK||0;let cx=hk,cy=0,hx=-hk*.7,bz=0;
 if(mv>.5&&(e.orc||e.boss9)){bz=Math.sin(t*5)*.08;cy=Math.sin(t*5)*.14}
 if(e.atk>0){const dur=e.type==='orcoH'?.55:e.type==='custodio'?.5:.4,q=clamp(1-e.atk/dur,0,1);cy+=q<.45?-.6*(q/.45):lr(-.6,.5,(q-.45)/.55);cx+=q<.45?-.14:.28}
 if(e.ch>0&&(e.orc||e.type==='custodio'))cx+=.3;if(e.flash>0){cx-=.35;hx-=.3;bz+=(R()-.5)*.2}if(e.stun>0)cy+=Math.sin(t*22)*.12;if(e.aim>.25&&!e.orc)cx-=.06;
 if(e.roar>0){e.roar-=dt;cx=-.3;hx=-.55;u.aR.rotation.x=-2.3;u.aL.rotation.x=-2.3;u.eR.rotation.x=u.eL.rotation.x=-.2}
 const k=Math.min(1,dt*10);u.ch.rotation.x+=(cx-u.ch.rotation.x)*k;u.ch.rotation.y+=(cy-u.ch.rotation.y)*Math.min(1,dt*12);u.b.rotation.z+=(bz-u.b.rotation.z)*Math.min(1,dt*8);u.hd.rotation.x+=(hx-u.hd.rotation.x)*Math.min(1,dt*8);u.ch.position.y=.15+Math.sin(t*2.3)*.012;
 if((e.orc||e.boss9)&&!e.roared&&!(e.alert>0)){e.roared=1;e.roar=.85;snd(64+R()*30,.6,'sawtooth',.06);burst(e.g.position.x,1.8*e.s,e.g.position.z,0x9a3a2a,4,.4,2)}};
/* tácticas: granadas de fusileros, esquiva de orcos y plaga bajo puntería, cobertura al ser heridos */
const egrG=new T.SphereGeometry(.22,8,6),egrM=new T.MeshLambertMaterial({color:0x3a4a22,emissive:0x331100});
function enemyTactics(dt){const pp=P.g.position;for(const e of enemies){if(!e.active||e.hold||e.cine)continue;e.tac=(e.tac===undefined?R()*2:e.tac)-dt;if(e.tac>0)continue;e.tac=.6+R()*.5;const p=e.g.position,tp=e.tp8||pp,d=Math.hypot(tp.x-p.x,tp.z-p.z);
 if((e.type==='sol'||e.type==='trasgo')&&!e.sab){e.gcd=(e.gcd===undefined?5+R()*10:e.gcd-1);if(e.gcd<=0&&d>11&&d<26&&R()<.45){e.gcd=16+R()*10;const t=1.4,pos=new T.Vector3(p.x,2.2,p.z),m=window.mkStickG?mkStickG():new T.Mesh(egrG,egrM);m.position.copy(pos);scene.add(m);egr.push({m,pos,v:new T.Vector3((tp.x-p.x)/t,(9*t*t-2.2)/t,(tp.z-p.z)/t),fuse:t});if(R()<.4)feed('¡Granada enemiga!');snd(300,.1,'square',.04)}}
 if((e.orc||e.type==='plaga'||e.skel)&&firing&&Math.hypot(p.x-pp.x,p.z-pp.z)<30){const fx=-Math.sin(yaw),fz=-Math.cos(yaw),dx=p.x-pp.x,dz=p.z-pp.z,dd=Math.hypot(dx,dz)||1;if((dx*fx+dz*fz)/dd>.93&&R()<.55){const s=R()<.5?1:-1;e.vx=(e.vx||0)+(-dz/dd)*s*8;e.vz=(e.vz||0)+(dx/dd)*s*8}}}}
const _hurt17=hurt;hurt=function(e,d,mode,by){_hurt17(e,d,mode,by);if(e.hp>0&&!e.hold&&(e.type==='sol'||e.type==='trasgo')&&e.st!=='hide'&&e.st!=='cover'&&R()<.35){const c=findCover(e);if(c){e.cv=c;e.st='cover'}}};
/* =====================================================================
   CAPÍTULO IX — OPERACIÓN TRES CORONAS: EL CERCO DE VARGENKREUZ
   ===================================================================== */
const X9=18000,XU=X9+430,ZU=-300;
const L9={built:false,ph:-1,cine:0,skip:0,t:0,obj:null,def:false,cp:[X9,6],tgts:[],under:false,stage:0};
/* sectores: cada uno se fusiona por separado y se oculta por distancia (menos dibujo en Android) */
const SECT9=[];
function sect9(name,x,z,r,fn){const n0=scene.children.length;sBegin();fn();scene.updateMatrixWorld(true);sEnd();const S={name,x,z,r,objs:scene.children.slice(n0),vis:true,under:name==='Ruinas'};SECT9.push(S);return S}
function sectCull(){const p=P.g.position,c=cam.position;for(const S of SECT9){const d=Math.min(Math.hypot(p.x-S.x,p.z-S.z),Math.hypot(c.x-S.x,c.z-S.z));const v=S.under?L9.under:(!L9.under&&d<S.r+200);if(v!==S.vis){S.vis=v;for(const o of S.objs)o.visible=v}}if(SBI)SBI.visible=!L9.under;if(CRI)CRI.visible=!L9.under;if(GRD9)GRD9.visible=!L9.under}
/* sacos terreros destructibles por etapas (instanciados: 1 draw call) */
let SBI=null;const COV9=[],_sM=new T.Matrix4(),_sQ=new T.Quaternion(),_sV=new T.Vector3(),_sS=new T.Vector3();
function sbInit(){if(SBI)return;SBI=new T.InstancedMesh(new T.BoxGeometry(1,1,1),new T.MeshLambertMaterial({map:sackT,color:0xd8ccb0}),800);SBI.count=0;SBI.frustumCulled=false;scene.add(SBI)}
function sbSet(c,h){_sV.set(c.x,h/2,c.z);_sS.set(c.w,Math.max(.001,h),c.d);_sQ.identity();_sM.compose(_sV,_sQ,_sS);SBI.setMatrixAt(c.i,_sM);SBI.instanceMatrix.needsUpdate=true}
function sb9(x,z,w,d,h){sbInit();if(SBI.count>=800)return null;h=h||1.2;const c={i:SBI.count++,x,z,w,d,h,hp:2,ob:{x,z,hw:w/2,hd:d/2,h},cv:{x,z,r:Math.max(w,d)/2+.8}};sbSet(c,h);obstB.push(c.ob);covers.push(c.cv);COV9.push(c);return c}
function sbRow(x0,z0,x1,z1,h,gapEvery){const L=Math.hypot(x1-x0,z1-z0),n=Math.max(1,Math.round(L/2.2)),ax=Math.abs(x1-x0)>Math.abs(z1-z0);for(let i=0;i<n;i++){if(gapEvery&&i%gapEvery===gapEvery-1)continue;const t=(i+.5)/n,x=x0+(x1-x0)*t,z=z0+(z1-z0)*t,s=L/n;sb9(x,z,ax?s*1.02:.95,ax?.95:s*1.02,h)}}
function sbHit(x,z,r){for(const c of COV9){if(c.hp<=0)continue;if(Math.abs(c.x-x)<c.w/2+r&&Math.abs(c.z-z)<c.d/2+r){c.hp--;if(c.hp===1){const h=c.h*.5;sbSet(c,h);c.ob.h=h;burst(c.x,.6,c.z,0x9a8a5a,6,.6,4)}else{sbSet(c,0);const i=obstB.indexOf(c.ob);if(i>=0)obstB.splice(i,1);const j=covers.indexOf(c.cv);if(j>=0)covers.splice(j,1);burst(c.x,.4,c.z,0x8a7a4a,12,.8,6)}}}}
/* cráteres por instancias con anillo de barro */
let CRI=null,CRR=null,crN=0;function crater9(x,z,r){if(!CRI){CRI=new T.InstancedMesh(new T.CircleGeometry(1,14).rotateX(-1.5708),new T.MeshLambertMaterial({color:0x1e1810}),120);CRR=new T.InstancedMesh(new T.RingGeometry(.9,1.35,14).rotateX(-1.5708),new T.MeshLambertMaterial({color:0x4a3a28}),120);for(const m of[CRI,CRR]){m.count=0;m.frustumCulled=false;scene.add(m)}}
 const i=crN%120;crN++;_sM.makeScale(r,1,r);_sM.setPosition(x,.035+(i%9)*.002,z);CRI.setMatrixAt(i,_sM);_sM.setPosition(x,.03+(i%9)*.002,z);CRR.setMatrixAt(i,_sM);CRI.count=CRR.count=Math.min(120,crN);CRI.instanceMatrix.needsUpdate=CRR.instanceMatrix.needsUpdate=true}
/* blancos no humanos: vehículos, máquinas, resonadores (balas, explosivos, cañón y melé) */
const HIT9=[];
v9Hit=function(b){if(level!==9)return false;const p=b.m.position;for(const h of HIT9){if(!h.ok())continue;if(Math.hypot(p.x-h.x(),p.z-h.z())<h.r&&p.y>h.y0&&p.y<h.y1){h.dmg(b.dmg,'b');burst(p.x,p.y,p.z,0xffd890,3,.2,4);snd(1500,.04,'square',.02);return true}}return false};
function hitSplash9(x,z,r,d,kind){for(const h of HIT9){if(!h.ok())continue;const dd=Math.hypot(x-h.x(),z-h.z());if(dd<r+h.r)h.dmg(d*(1-dd/(r+h.r)*.5),kind||'x')}}
const _boom17=boom;boom=function(pos){_boom17(pos);if(level===9)hitSplash9(pos.x,pos.z,4.5,360,'x');if(window.expSnd)expSnd(pos.x,pos.z,1)};
/* artillería dinámica: silbido, impacto, cráter, coberturas dañadas, daño repartido por distancia */
const SHL=[];function shell9(x,z,k,col){snd(1500,.85,'sine',.02);SHL.push({x,z,t:.9,k:k||1,col})}
function shellUpd(dt){for(let i=SHL.length-1;i>=0;i--){const s=SHL[i];s.t-=dt;if(s.t<=0){SHL.splice(i,1);boom9(s.x,s.z,s.k,true,s.col)}}}
function boom9(x,z,k,allies,col){if(window.expSnd)expSnd(x,z,k);burst(x,.5,z,col||0xff7a20,Math.round(14*k),.6,9*k);burst(x,.5,z,0x4a3a2a,Math.round(16*k),1.1,6*k);smoke(x,1.5,z,7*k,5,0x3a3632,1.2,.6);flashLight(x,3,z,4*k,.35,col||0xffb060);npcShot('big',x,z);crater9(x,z,1.5*k+R()*.8);sbHit(x,z,2.2*k);
 for(const e of[...enemies]){const d=Math.hypot(e.g.position.x-x,e.g.position.z-z);if(d<6*k)hurt(e,110*k*(1-d/(6*k)*.6),'m')}if(allies)e8Blast(x,z,6*k,42*k);const dp=Math.hypot(P.g.position.x-x,P.g.position.z-z);if(dp<5*k&&allies!==false)hitP(28*k*(1-dp/(5*k)*.5));shake=Math.max(shake,clamp(1.3-dp/60,0,1.1));hitSplash9(x,z,5*k,240*k,'x');chBlast(x,1,z,3.2*k,9*k,0)}
/* gas fantástico: nube verde a la deriva, daña y ciega por zonas */
const GAS={on:false,x:0,z:0,r:15,t:0,tk:0};
function gasStart(x,z){Object.assign(GAS,{on:true,x,z,t:44,r:15});say('¡GAS! ¡Máscaras, máscaras!',3);for(let i=0;i<6;i++)setTimeout(()=>snd(950,.15,'square',.025),i*260);for(const s of GAR)s.mask=3}
function gasUpd(dt){if(!GAS.on)return;GAS.t-=dt;GAS.z+=1.1*dt;GAS.x+=Math.sin(time*.25)*.8*dt;if(GAS.t<=0){GAS.on=false;return}
 if(R()<dt*16)smoke(GAS.x+(R()-.5)*GAS.r*1.8,.6+R()*1.6,GAS.z+(R()-.5)*GAS.r*1.8,7+R()*6,5,0x7a9a3a,.12,.5);GAS.tk-=dt;if(GAS.tk>0)return;GAS.tk=.5;
 const pp=P.g.position;if(Math.hypot(pp.x-GAS.x,pp.z-GAS.z)<GAS.r){hitP(4);snd(180,.2,'sawtooth',.02)}
 for(const s of GAR){if(s.mask>0)s.mask-=.5;if(s.alive&&s.g.visible&&Math.hypot(s.g.position.x-GAS.x,s.g.position.z-GAS.z)<GAS.r)garDamage(s,s.mask>0?5:1.2,null)}for(const a of allies)if(a.name&&Math.hypot(a.g.position.x-GAS.x,a.g.position.z-GAS.z)<GAS.r)allyDamage(a,2)}
function gasIn(){return GAS.on&&Math.hypot(P.g.position.x-GAS.x,P.g.position.z-GAS.z)<GAS.r}
/* =====================================================================
   OBJETIVOS ENEMIGOS AMPLIADOS (cap. IX): jugador, escuadra, médico,
   guarnición, caballería y objetivos (comunicaciones, camión, blindado aliado)
   ===================================================================== */
const G9L=l=>l===9||l===6||l===4;
const _e8T17=e8T;e8T=function(e){if(level===8){const r=_e8T17(e);if(MED&&MED.g.visible&&!(MED.down>0)&&e.tgr8===r&&Math.hypot(MED.g.position.x-e.g.position.x,MED.g.position.z-e.g.position.z)<Math.hypot(r.p.x-e.g.position.x,r.p.z-e.g.position.z)-4){e.tgr8={p:MED.g.position,h:medDamage,ok:()=>!(MED.down>0)};e.tp8=MED.g.position;e.th8=medDamage;return e.tgr8}return r}if(!G9L(level))return null;
 e.tgT8=(e.tgT8||0)-(V16.dt||.016);if(e.tgT8>0&&e.tgr8&&e.tgr8.ok())return e.tgr8;const p=e.g.position;let best={p:P.g.position,h:hitP,ok:()=>true},bs=Math.hypot(P.g.position.x-p.x,P.g.position.z-p.z)-6+R()*4;
 const cand=(q,h,ok,bias)=>{const d=Math.hypot(q.x-p.x,q.z-p.z)+bias+R()*4;if(d<bs){bs=d;best={p:q,h,ok}}};
 if(officer&&officer.g.visible&&!(officer.down>0))cand(officer.g.position,offDamage,()=>officer.g.visible&&!(officer.down>0),1);
 for(const a of allies)if(a.name&&a.g.visible&&!(a.down>0))cand(a.g.position,d=>allyDamage(a,d),()=>!(a.down>0),2);
 if(MED&&MED.g.visible&&!(MED.down>0))cand(MED.g.position,medDamage,()=>!(MED.down>0),2);
 for(const s of GAR)if(s.alive&&s.g.visible&&!(s.down>0))cand(s.g.position,d=>garDamage(s,d,p),()=>s.alive,s.inB?7:0);
 for(const c of CAV)if(c.alive&&c.g.visible)cand(c.g.position,d=>cavDamage(c,d),()=>c.alive,3);
 for(const t of L9.tgts)if(t.ok())cand(t.p,t.h,t.ok,t.bias||0);
 e.tgT8=.7+R()*.8;e.tgr8=best;e.tp8=best.p;e.th8=best.h;return best};
const _e8H17=e8Hit;e8Hit=function(b){if(level===8){if(_e8H17(b))return true;return medHit(b)}if(!G9L(level))return false;const p=b.m.position;
 for(const s of GAR){if(!s.alive||!s.g.visible)continue;const q=s.g.position;if(Math.abs(p.x-q.x)<.6&&Math.abs(p.z-q.z)<.6&&p.y<q.y+(s.crouch>.5&&!(s.peek>0)?1.25:1.95)){garDamage(s,b.dmg*.85,p);return true}}
 for(const a of allies){if(!a.name||!a.g.visible||a.down>0)continue;const q=a.g.position;if(Math.abs(p.x-q.x)<.6&&Math.abs(p.z-q.z)<.6&&p.y<2){allyDamage(a,b.dmg);return true}}
 const o=officer;if(o&&o.g.visible&&!(o.down>0)){const q=o.g.position;if(Math.abs(p.x-q.x)<.6&&Math.abs(p.z-q.z)<.6&&p.y<2.1){offDamage(b.dmg);return true}}
 if(medHit(b))return true;for(const c of CAV){if(!c.alive)continue;const q=c.g.position;if(Math.hypot(p.x-q.x,p.z-q.z)<1.25&&p.y<3){cavDamage(c,b.dmg);return true}}
 for(const t of L9.tgts){if(!t.ok())continue;if(Math.hypot(p.x-t.p.x,p.z-t.p.z)<t.r&&p.y<(t.y||2.6)){t.h(b.dmg);burst(p.x,p.y,p.z,0xffd890,2,.2,3);return true}}return false};
function medHit(b){const m=MED;if(!m||!m.g.visible||m.down>0)return false;const q=m.g.position,p=b.m.position;if(Math.abs(p.x-q.x)<.6&&Math.abs(p.z-q.z)<.6&&p.y<2){medDamage(b.dmg);return true}return false}
const _e8B17=e8Blast;e8Blast=function(x,z,r,pw){if(level===8){_e8B17(x,z,r,pw);if(MED&&Math.hypot(MED.g.position.x-x,MED.g.position.z-z)<r)medDamage(pw*.6);return}if(!G9L(level))return;
 for(const s of GAR){if(!s.alive||!s.g.visible)continue;const d=Math.hypot(s.g.position.x-x,s.g.position.z-z);if(d<r){const pr=s.inB?.3:s.crouch>.5?.6:1;garDamage(s,pw*(1-d/r*.6)*pr,{x,z},'blast');if(s.alive&&pw*(1-d/r)>16&&!s.inB)s.down=1.2+R()*1.4}}
 for(const a of allies)if(a.name){const d=Math.hypot(a.g.position.x-x,a.g.position.z-z);if(d<r)allyDamage(a,pw*(1-d/r*.6))}if(officer){const d=Math.hypot(officer.g.position.x-x,officer.g.position.z-z);if(d<r)offDamage(pw*(1-d/r*.6))}
 if(MED&&Math.hypot(MED.g.position.x-x,MED.g.position.z-z)<r)medDamage(pw*.6);for(const c of CAV)if(c.alive&&Math.hypot(c.g.position.x-x,c.g.position.z-z)<r)cavDamage(c,pw*1.2);for(const t of L9.tgts)if(t.ok()&&Math.hypot(t.p.x-x,t.p.z-z)<r+t.r)t.h(pw*1.5)};
/* =====================================================================
   CABALLERÍA DE ARGENTUM — húsares con IA autónoma de escuadrón
   formación · avance · detección de ametralladoras · flanqueo · carga ·
   reorientación · retirada por bajas · reagrupamiento
   ===================================================================== */
const CAV=[],CAVS={st:'off',t:0,n0:0,rx:0,rz:0,ax:0,az:0,tx:0,tz:0,fell:0,home:[0,0]};
function mkHorse9(coat,cloth){const g=new T.Group(),body=new T.Group();body.position.y=1.5;g.add(body);const q=PB(),mn=0x1a1410;
 pCyl(q,.44,.42,1.9,coat,0,0,0,1.5708,0,0,10);pa(q,gSph(.46,10,8),coat,0,.03,.82,0,0,0,1,1,1.1);pa(q,gSph(.44,10,8),coat,0,.06,-.86);pBox(q,1.0,.05,1.05,cloth,0,.4,.05);pBox(q,1.02,.05,.08,0xc9a23a,0,.38,.57);pBox(q,1.02,.05,.08,0xc9a23a,0,.38,-.47);
 pBox(q,.48,.14,.62,0x3a2414,0,.48,.05);pBox(q,.52,.16,.12,0x2a1a0e,0,.56,-.24);pBox(q,.3,.1,.1,0x2a1a0e,0,.56,.34);for(const s of[-1,1]){pBox(q,.03,.55,.05,0x2a1a0e,s*.5,.1,.08);pBox(q,.1,.04,.14,0x8a8a80,s*.5,-.2,.08);pBox(q,.25,.3,.12,0x5a4630,s*.52,.15,-.5)}pBox(q,.12,.78,.14,mn,0,-.15,-1.25,.55);pbMesh(q,body,VCM);
 const neck=new T.Group();neck.position.set(0,.3,.95);neck.rotation.x=-.55;body.add(neck);{const n=PB();pBox(n,.3,1.0,.44,coat,0,.42,0);pBox(n,.08,.95,.1,mn,0,.45,-.2);pbMesh(n,neck,VCM)}
 const head=new T.Group();head.position.set(0,.92,.05);head.rotation.x=.75;neck.add(head);{const h=PB();pBox(h,.27,.3,.66,coat,0,0,.24);pBox(h,.24,.22,.22,shade(coat,.85),0,-.06,.58);for(const s of[-1,1]){pBox(h,.06,.14,.05,coat,s*.09,.2,-.02,0,0,s*.2);pBox(h,.02,.03,.03,0x111111,s*.14,.06,.32);pBox(h,.02,.04,.5,0x2a1a0e,s*.14,-.02,.32)}pBox(h,.28,.04,.04,0x2a1a0e,0,-.02,.5);pbMesh(h,head,VCM)}
 const legs=[];for(const [x,z] of[[-.24,.78],[.24,.78],[-.24,-.8],[.24,-.8]]){const up=new T.Group();up.position.set(x,-.18,z);body.add(up);{const a=PB();pBox(a,.17,.62,.24,coat,0,-.3,0);pbMesh(a,up,VCM)}const lo=new T.Group();lo.position.y=-.6;up.add(lo);{const b=PB();pBox(b,.11,.56,.13,shade(coat,.9),0,-.28,0);pBox(b,.15,.12,.19,0x1a1612,0,-.6,.02);pbMesh(b,lo,VCM)}legs.push([up,lo])}
 const sh=new T.Mesh(shG,shM);sh.rotation.x=-1.5708;sh.position.y=.04;sh.scale.set(1.3,2.6,1);g.add(sh);return{g,body,neck,head,legs}}
const CAVN=['Argentum','Zrínyi','Bánffy','Esterházy','Rákóczi','Kinsky','Batthyány','Pálffy'];
function mkCav9(i,x,z){const H=mkHorse9([0x5a3a22,0x3a2618,0x6a5a4a,0x2a2220,0x8a6a4a][i%5],0x2a3a7a);const r=mkSoldier({coat:0x2a3a6a,pants:0xa02424,hat:'kepi',hatC:0x7a1a1a,trim:0xd8b850,tab:0xd8b850,pack:false,rank:i===0?3:0,puttee:0x111111,leather:0x1a1a1a,scale:1});
 r.children.forEach(c=>{if(c.geometry===shG)c.visible=false});const u=r.userData;u.l1.rotation.set(-.55,0,-.45);u.l2.rotation.set(-.55,0,.45);u.k1.rotation.x=u.k2.rotation.x=.9;r.position.set(0,1.25,.05);H.g.add(r);u.mR.add(mkSabre());
 if(i===0){const q=PB();pBox(q,.72,.6,.12,0xc8ccd2,0,.36,.22,.05);pBox(q,.72,.55,.1,0xb8bcc2,0,.38,-.22,-.05);pBox(q,.74,.06,.46,0xc9a23a,0,.1,0);for(const s2 of[-1,1])pBox(q,.04,.4,.04,0x2a1a0e,s2*.25,.5,.0);pa(q,gSph(.08,6,5),0xc9a23a,0,.4,.29);pbMesh(q,u.ch,SABM);const pq=PB();pBox(pq,.05,.22,.13,0x1a1a1c,0,-.08,0);pCyl(pq,.026,.026,.24,0x111111,0,-.26,.03,0,0,0,6);pBox(pq,.055,.13,.09,0x5a3a20,0,.08,-.05,.3);r.userData.ruby=pbMesh(pq,u.mL,SABM)}H.g.position.set(x,0,z);scene.add(H.g);const c=Object.assign(H,{r,ru:u,hp:i===0?380:260,max:260,alive:true,st:'slot',vx:0,vz:0,t:R()*5,cd:0,slash:0,i,name:(i===0?'Capitán ':'Húsar ')+CAVN[i%8],fall:0});CAV.push(c);return c}
function cavDamage(c,d){if(!c.alive)return;c.hp-=d;burst(c.g.position.x,1.6,c.g.position.z,0xaa2a1a,3,.25,2);if(c.hp<=0){c.alive=false;c.fall=.001;feed('✝ '+c.name+' ha caído');snd(300,.4,'sawtooth',.04);
 const w=new T.Vector3();c.r.getWorldPosition(w);c.g.remove(c.r);scene.add(c.r);c.r.position.copy(w);const j={};for(const k in LIM)j[k]=(R()-.5)*8;corpses.push({g:c.r,t:0,dir:1,vx:Math.sin(c.g.rotation.y)*4,vz:Math.cos(c.g.rotation.y)*4,vy:3,j,y:w.y,rx:0,keep:40});
 for(const o of CAV)if(o.alive&&Math.hypot(o.g.position.x-c.g.position.x,o.g.position.z-c.g.position.z)<20){o.vx*=.4;o.vz*=.4;if(R()<.35)say(o.name+': «¡Han derribado a '+c.name.split(' ').pop()+'!»',2)}}}
function cavAnim(c,dt){const v=Math.hypot(c.vx,c.vz);c.t+=dt*(1.2+v*.55);const ph=c.t*2.4,gal=Math.min(1,v/9),trot=v>.5?1:0;
 if(!c.alive){if(c.fall>0&&c.fall<1){c.fall=Math.min(1,c.fall+dt*1.5);c.g.rotation.z=1.45*ez(c.fall);c.g.position.y=.35*Math.sin(c.fall*Math.PI);c.legs.forEach((l,i)=>{l[0].rotation.x=.6*(i%2?1:-1);l[1].rotation.x=.4})}return}
 c.legs.forEach((l,i)=>{const o=[0,.5,1.6,2.1][i];l[0].rotation.x=trot*Math.sin(ph+o)*(.35+gal*.4);l[1].rotation.x=trot*Math.max(0,Math.sin(ph+o+1.2))*(.6+gal*.4)});
 c.body.position.y=1.5+trot*Math.abs(Math.sin(ph))*.08*(1+gal);c.body.rotation.x=trot*Math.sin(ph)*.05*gal;c.neck.rotation.x=-.55+trot*Math.sin(ph+.5)*.12;c.head.rotation.x=.75-gal*.15;
 const u=c.ru;u.b.position.y=.8+trot*Math.abs(Math.sin(ph+.4))*.06;u.b.rotation.x=-.05+gal*.18;c.slash=Math.max(0,c.slash-dt);if(c.slash>0){const q=1-c.slash/.4;u.aR.rotation.x=lr(-2.9,-.6,q);u.eR.rotation.x=-.3}else{u.aR.rotation.x+=((c.st==='charge'?-2.7:-.9)-u.aR.rotation.x)*Math.min(1,dt*6);u.eR.rotation.x=c.st==='charge'?-.2:-.7}if(c.i===0&&c.alive&&c.st!=='charge'){c.pcd=(c.pcd||0)-dt;let tg=null,td=24;for(const e of enemies){const d=Math.hypot(e.g.position.x-c.g.position.x,e.g.position.z-c.g.position.z);if(d<td){td=d;tg=e}}if(tg){u.aL.rotation.x=-1.6;u.eL.rotation.x=-.1;u.aL.rotation.y=Math.atan2(tg.g.position.x-c.g.position.x,tg.g.position.z-c.g.position.z)-c.g.rotation.y;if(c.pcd<=0){c.pcd=1.1+R()*.5;const o=c.g.position.clone();o.y=2.9;const t2=tg.g.position.clone();t2.y=1.2*tg.s;const v=t2.sub(o).normalize();v.x+=(R()-.5)*.04;v.z+=(R()-.5)*.04;v.normalize().multiplyScalar(66);const m=new T.Mesh(bG,bM);m.position.copy(o);m.lookAt(o.clone().add(v));scene.add(m);bullets.push({m,v,life:1,dmg:34,by:{name:'Capitán Argentum (Ruby 11 mm)'}});npcShot('rifle',o.x,o.z);burst(o.x+v.x*.02,o.y,o.z+v.z*.02,0xffdd88,2,.08,2);u.eL.rotation.x=-.5}return}}u.aL.rotation.x=-1.1;u.eL.rotation.x=-.9;u.aL.rotation.y=0}
function cavMove(c,tx,tz,sp,dt){const p=c.g.position,dx=tx-p.x,dz=tz-p.z,d=Math.hypot(dx,dz);let mx=0,mz=0;if(d>1.2){const s=steer(c,dx,dz,dt);mx=s[0]*sp;mz=s[1]*sp;if(d<6&&c.st!=='charge'){mx*=d/6;mz*=d/6}}const k=Math.min(1,dt*(c.st==='charge'?2.2:3));c.vx+=(mx-c.vx)*k;c.vz+=(mz-c.vz)*k;p.x+=c.vx*dt;p.z+=c.vz*dt;resolve(p,1.0);if(d>3){c.stk=(c.stk||0)+dt;if(c.stk>1.5){const mv=Math.hypot(p.x-(c.lx||0),p.z-(c.lz||0));c.lx=p.x;c.lz=p.z;c.stk=0;if(mv<1.2){c.stuckN=(c.stuckN||0)+1;if(c.stuckN>=2){for(let q=0;q<12;q++){const nx=p.x+(R()-.5)*8+dx/d*3,nz=p.z+(R()-.5)*8+dz/d*3;if(!blockedAt(nx,nz,1.2)&&Math.hypot(nx-X9,nz+290)<330){p.x=nx;p.z=nz;break}}c.stuckN=0;if(c.nav)c.nav.fail=0}}else c.stuckN=0}}
 if(Math.hypot(c.vx,c.vz)>.6)c.g.rotation.y=angL(c.g.rotation.y,Math.atan2(c.vx,c.vz),Math.min(1,dt*(c.st==='charge'?2.5:4)));return d}
function cavPick(cx,cz){const A=enemies.filter(e=>e.active&&!e.obs9&&!e.under9);let best=null,bs=1e9;for(const e of A){const p=e.g.position;let n=0;for(const f of A)if(Math.hypot(f.g.position.x-p.x,f.g.position.z-p.z)<12)n++;const s=Math.hypot(p.x-cx,p.z-cz)-n*8;if(s<bs){bs=s;best=e}}if(!best)return null;
 const t={x:best.g.position.x,z:best.g.position.z};let mg=null;for(const e of A)if(e.mg9&&Math.hypot(e.g.position.x-t.x,e.g.position.z-t.z)<45){mg=e;break}
 let ax=t.x+(cx-t.x)/Math.max(1,Math.hypot(cx-t.x,cz-t.z))*40,az=t.z+(cz-t.z)/Math.max(1,Math.hypot(cx-t.x,cz-t.z))*40;
 if(mg){const s=(cx<mg.g.position.x)?-1:1;ax=mg.g.position.x+s*38;az=mg.g.position.z-12;if(R()<.6)say('Capitán Argentum: «¡Ametralladora! ¡Rodeadla por el flanco, no de frente!»',3)}ax=clamp(ax,X9-135,X9+140);az=clamp(az,-205,-108);for(let k=0;k<8&&blockedAt(ax,az,2);k++){ax+=(R()-.5)*10;az+=(R()-.5)*10}return{t,ax,az,mg:!!mg}}
function cavUpd(dt){for(const c of CAV)cavAnim(c,dt);const A=CAV.filter(c=>c.alive);if(!A.length||CAVS.st==='off')return;CAVS.t+=dt;let cx=0,cz=0;A.forEach(c=>{cx+=c.g.position.x;cz+=c.g.position.z});cx/=A.length;cz/=A.length;
 if(!CAVS.fell&&A.length<CAVS.n0*.55&&CAVS.st!=='arrive'){CAVS.fell=1;CAVS.st='retreat';CAVS.t=0;say('Capitán Argentum: «¡Demasiadas bajas! ¡Retirada a la loma, reagrupad!»',3.5)}
 const S=CAVS.st;
 if(S==='arrive'||S==='form'||S==='regroup'||S==='retreat'){const AP=S==='arrive'&&CAVS.path?CAVS.path[CAVS.pi]:null,hx=AP?AP[0]:S==='retreat'?CAVS.home[0]:CAVS.rx,hz=AP?AP[1]:S==='retreat'?CAVS.home[1]:CAVS.rz;A.forEach((c,i)=>{c.st='slot';cavMove(c,hx+(i-A.length/2)*3.2,hz+(i%2)*3,S==='retreat'||S==='arrive'?13:8,dt)});
  const d=Math.hypot(cx-hx,cz-hz);if(S==='arrive'&&d<14){if(AP&&CAVS.pi<CAVS.path.length-1)CAVS.pi++;else{CAVS.st='form';CAVS.t=0}}if(S==='retreat'&&d<12){CAVS.st='regroup';CAVS.t=0;CAVS.rx=hx;CAVS.rz=hz}
  if((S==='form'&&CAVS.t>2.5&&CAVS.go)||(S==='regroup'&&CAVS.t>7)){const pk=cavPick(cx,cz);if(pk){CAVS.tgt=pk;CAVS.ax=pk.ax;CAVS.az=pk.az;CAVS.st='advance';CAVS.t=0;if(S==='regroup'){CAVS.fell=A.length<CAVS.n0*.35?1:0;say('Capitán Argentum: «¡Reagrupados! ¡Otra vez, por la Corona!»',2.5)}}}}
 else if(S==='advance'){A.forEach((c,i)=>{c.st='slot';cavMove(c,CAVS.ax+(i-A.length/2)*3.4,CAVS.az+(i%2)*3,9.5,dt)});if(Math.hypot(cx-CAVS.ax,cz-CAVS.az)<10||CAVS.t>16){const pk=cavPick(cx,cz);if(!pk){CAVS.st='form';CAVS.t=0;CAVS.rx=cx;CAVS.rz=cz;return}CAVS.tx=pk.t.x;CAVS.tz=pk.t.z;CAVS.st='charge';CAVS.t=0;say('Capitán Argentum: «¡A LA CARGA!»',2.2);snd(520,.5,'square',.04);setTimeout(()=>snd(660,.6,'square',.04),300);
   A.forEach((c,i)=>{const dx=CAVS.tx-c.g.position.x,dz=CAVS.tz-c.g.position.z,l=Math.hypot(dx,dz)||1;c.st='charge';c.cx=CAVS.tx+dx/l*20+(i-A.length/2)*2.2;c.cz=CAVS.tz+dz/l*20})}}
 else if(S==='charge'){let done=0;A.forEach(c=>{if(c.st==='charge'){const d=cavMove(c,c.cx,c.cz,15.5,dt);c.cd-=dt;if(c.cd<=0)for(const e of enemies){const q=e.g.position;if(Math.hypot(q.x-c.g.position.x,q.z-c.g.position.z)<2.8*Math.max(1,e.s*.8)){c.cd=.55;c.slash=.4;hurt(e,95,'m',c);e.stun=.6;const vx=q.x-c.g.position.x,vz=q.z-c.g.position.z,l=Math.hypot(vx,vz)||1;q.x+=vx/l*1.8;q.z+=vz/l*1.8;burst(q.x,1.3,q.z,0xffcc66,6,.3,5);snd(240,.12,'sawtooth',.05);break}}if(d<4||CAVS.t>9)c.st='wheel'}else{done++;c.st='wheel';cavMove(c,c.cx+(c.cx-CAVS.tx)*.4,c.cz+(c.cz-CAVS.tz)*.4,9,dt)}});
  if(done>=A.length||CAVS.t>11){CAVS.st='form';CAVS.t=0;const vx=cx-CAVS.tx,vz=cz-CAVS.tz,l=Math.hypot(vx,vz)||1;CAVS.rx=cx+vx/l*14;CAVS.rz=cz+vz/l*14;say('Capitán Argentum: «¡Media vuelta! ¡Reorientad y formad!»',2)}}}
/* =====================================================================
   BLINDADO ENEMIGO «Basilisco», CAÑÓN DE CAMPAÑA, MÁQUINAS DE ASEDIO,
   RESONADORES DE LAS RUINAS Y EL COLOSO
   ===================================================================== */
const AC9=[];
function mkArmCar9(){const g=new T.Group(),q=PB(),C=0x5a4a3a,D=0x2a2420;pBox(q,2.3,.9,5.0,C,0,1.15,0);pBox(q,2.2,.12,1.3,shade(C,.9),0,1.65,2.0,-.5);pBox(q,2.0,.8,1.6,C,0,1.6,-1.6);pBox(q,1.9,.6,1.8,shade(C,.95),0,1.9,.4);
 for(const s of[-1,1]){pBox(q,.12,.7,4.6,shade(C,.92),s*1.2,1.4,0,0,0,s*.25);pBox(q,.5,.06,1.2,D,s*1.15,1.02,1.7);pBox(q,.5,.06,1.2,D,s*1.15,1.02,-1.6);for(let i=0;i<9;i++)pBox(q,.04,.04,.04,shade(C,.7),s*1.27,1.62,-2+i*.5);pBox(q,.03,.55,.55,0x8a1a1a,s*1.32,1.45,-.4);pBox(q,.035,.2,.2,0xe8c040,s*1.335,1.45,-.4)}
 pBox(q,.5,.12,.03,0x111111,-.5,2.0,1.32);pBox(q,.5,.12,.03,0x111111,.5,2.0,1.32);for(const s of[-1,1])pCyl(q,.12,.12,.15,0x222222,s*.8,1.5,2.6,1.5708,0,0,8);pBox(q,2.0,.2,.15,D,0,.85,2.55);pbMesh(q,g,VCV);
 const W=[],wg=truckWheelGeo();for(const [x,z] of[[1.15,1.7],[-1.15,1.7],[1.15,-1.6],[-1.15,-1.6]]){const w=new T.Mesh(wg,VCV);w.position.set(x,.6,z);g.add(w);W.push(w)}
 const tur=new T.Group();tur.position.set(0,2.2,.2);g.add(tur);{const t=PB();pCyl(t,.72,.8,.6,C,0,.3,0,0,0,0,10);pCyl(t,.68,.68,.06,D,0,.62,0,0,0,0,10);pBox(t,.22,.22,.5,D,0,.3,.7);pCyl(t,.055,.055,.8,0x151515,0,.3,1.2,1.5708,0,0,6);pbMesh(t,tur,VCV)}
 const muz=new T.Object3D();muz.position.set(0,.3,1.65);tur.add(muz);scene.add(g);return{g,tur,muz,W}}
function spawnAC9(path){const v=mkArmCar9();v.g.position.set(path[0][0],0,path[0][1]);const a=Object.assign(v,{hp:1500,max:1500,alive:true,path,pi:1,mcd:0,mb:0,mp:0,ob:{x:path[0][0],z:path[0][1],r:2.9},name:'el blindado «Basilisco»'});obst.push(a.ob);AC9.push(a);
 HIT9.push({x:()=>a.g.position.x,z:()=>a.g.position.z,y0:0,y1:3.2,r:2.7,ok:()=>a.alive,dmg:(d,k)=>acDamage(a,d,k)});return a}
function acDamage(a,d,k){if(!a.alive)return;a.hp-=d*(k==='b'?.11:k==='m'?.3:1);if(k!=='b')flashLight(a.g.position.x,2,a.g.position.z,3,.2);if(a.hp<=0){a.alive=false;boom9(a.g.position.x,a.g.position.z,1.6,false);const f=mkFire(a.g.position.x,a.g.position.z,1.2,1.5,-1);a.tur.rotation.set(.3,1,.2);feed('★ ¡'+a.name+' destruido!');say('¡El blindado arde! ¡Buen tiro!',2.5);score+=2500}}
function acUpd(dt){for(const a of AC9){if(!a.alive){if(R()<dt*4)smoke(a.g.position.x,2.5,a.g.position.z,3,3,0x1a1a1a,1.6,.5);continue}const p=a.g.position,w=a.path[a.pi],dx=w[0]-p.x,dz=w[1]-p.z,d=Math.hypot(dx,dz);if(d<3)a.pi=(a.pi+1)%a.path.length;
 let tg=null,td=78;const C=[[P.g.position,null],...CAV.filter(c=>c.alive).map(c=>[c.g.position,c]),...GAR.filter(s=>s.alive&&s.g.visible).map(s=>[s.g.position,s]),...allies.filter(q=>q.name&&q.g.visible).map(q=>[q.g.position,q])];for(const c of C){const dd=Math.hypot(c[0].x-p.x,c[0].z-p.z)-(c[1]&&c[1].legs?12:0);if(dd<td){td=dd;tg=c[0]}}
 const tsp=tg?.8:1.7;a.v=(a.v||0)+(tsp-(a.v||0))*Math.min(1,dt*.4);const sp=a.v,want=Math.atan2(dx,dz);a.g.rotation.y=angL(a.g.rotation.y,want,Math.min(1,dt*.3));p.x+=Math.sin(a.g.rotation.y)*sp*dt;p.z+=Math.cos(a.g.rotation.y)*sp*dt;{const oi=obst.indexOf(a.ob);if(oi>=0)obst.splice(oi,1);resolve(p,2.6);obst.push(a.ob)}a.ob.x=p.x;a.ob.z=p.z;for(const wh of a.W)wh.rotation.x+=sp*dt/.6;a.g.position.y=Math.abs(Math.sin(time*3))*.015;if(R()<dt*2)smoke(p.x-Math.sin(a.g.rotation.y)*2.6,1.2,p.z-Math.cos(a.g.rotation.y)*2.6,1.4,2,0x2a2a2a,.8,.35);
 if(tg){const ta=Math.atan2(tg.x-p.x,tg.z-p.z)-a.g.rotation.y;a.tur.rotation.y=angL(a.tur.rotation.y,ta,Math.min(1,dt*2.5));a.mcd-=dt;if(a.mp>0)a.mp-=dt;else if(a.mcd<=0){a.mcd=.11;a.mb++;if(a.mb>10){a.mb=0;a.mp=1.1+R()}a.muz.getWorldPosition(_tv);const v=new T.Vector3(tg.x-_tv.x+(R()-.5)*2.4,tg.y+1.2-_tv.y,tg.z-_tv.z+(R()-.5)*2.4).normalize();eshoot(_tv.clone(),v,9,62);trc16(_tv,_tv.clone().addScaledVector(v,30),0xff8040);npcShot('mg',_tv.x,_tv.z)}}}}
/* cañón de campaña en la loma: posición estratégica contra el blindado */
const FG9={g:null,x:0,z:0,cd:0};
function gunFire9(){if(FG9.cd>0)return;FG9.cd=2.4;cam.getWorldDirection(dv);const o=new T.Vector3(FG9.x,2.6,FG9.z).addScaledVector(dv,3.5);let hp=null,ha=null;const q=o.clone();
 for(let s=0;s<130&&!hp;s++){q.addScaledVector(dv,2);if(q.y<=.1){hp=q.clone();break}for(const h of HIT9){if(h.ok()&&Math.hypot(q.x-h.x(),q.z-h.z())<h.r+.6&&q.y<h.y1+1){hp=q.clone();ha=h;break}}if(!hp)for(const e of enemies)if(Math.hypot(q.x-e.g.position.x,q.z-e.g.position.z)<1.3*e.s&&q.y<2.3*e.s){hp=q.clone();break}}
 burst(o.x,o.y,o.z,0xffcc66,10,.3,10);smoke(o.x,o.y,o.z,4,2.5,0x8a8a8a,.6,.6);npcShot('big',o.x,o.z);snd(52,.6,'sawtooth',.14);shake=Math.max(shake,.9);FG9.g.userData.rec=1;if(!hp)return;const tt=Math.min(.6,o.distanceTo(hp)/240);
 setTimeout(()=>{if(level!==9)return;if(ha)ha.dmg(560,'g');boom9(hp.x,hp.z,1.25,false)},tt*1000)}
/* máquinas de asedio: torre, ariete blindado y bombarda arcana */
const MACH=[];
function mkSiegeTower(){const g=new T.Group(),q=PB(),W=0x6a4a2a,W2=0x4a3218;pBox(q,5,11,5,W,0,6.2,0);for(let i=0;i<6;i++){pBox(q,5.1,.18,5.1,W2,0,1.2+i*1.9,0)}for(const s of[-1,1])for(const t of[-1,1])pBox(q,.3,11.4,.3,W2,s*2.5,6.2,t*2.5);pBox(q,4.6,.12,4.6,0x2a2a2a,0,11.9,0);for(let i=0;i<8;i++)pBox(q,.4,.9,.3,W,-2.2+i*.62,12.4,2.3);pBox(q,3,9,.2,0x7a7a72,0,6,2.6);pBox(q,1.4,2.4,.05,0x8a1a1a,0,9.8,2.75);for(const s of[-1,1])for(const t of[-1,1])pCyl(q,.8,.8,.4,0x2a2018,s*2.2,.8,t*1.8,0,0,1.5708,10);pbMesh(q,g,VCV);scene.add(g);return g}
function mkRam9(){const g=new T.Group(),q=PB(),M=0x4a4a46;pBox(q,3.2,.4,7,0x4a3218,0,1,0);for(const s of[-1,1])pBox(q,.15,2.4,7,M,s*1.6,2.3,0,0,0,s*.35);pBox(q,2,.15,7,M,0,3.5,0);for(let i=0;i<10;i++)pBox(q,3.4,.05,.1,0x2a2a2a,0,3.3,-3.2+i*.7);for(const s of[-1,1])for(const t of[-1,1])pCyl(q,.75,.75,.4,0x2a2018,s*1.7,.75,t*2.4,0,0,1.5708,10);pbMesh(q,g,VCV);
 const log=new T.Group();log.position.set(0,2.0,0);g.add(log);const l=PB();pCyl(l,.32,.32,7.5,0x5a3a22,0,0,1,1.5708,0,0,10);pa(l,gSph(.5,8,6),0x3a3a3a,0,0,4.9);pa(l,gCone(.4,.8,6),0x3a3a3a,0,0,5.5,1.5708);pbMesh(l,log,VCV);g.userData.log=log;scene.add(g);return g}
function mkBombard9(){const g=new T.Group(),q=PB();pBox(q,3,.6,4.5,0x3a2a1a,0,.9,0);for(const s of[-1,1])pCyl(q,1,1,.3,0x2a2018,s*1.6,1,0,0,0,1.5708,12);pCyl(q,1.0,1.3,3.4,0x3a3a40,0,2.3,-.3,-.9,0,0,12);pCyl(q,1.12,1.12,.3,0x2a2a2e,0,3.3,.6,-.9,0,0,12);pbMesh(q,g,VCV);
 for(let i=0;i<5;i++){const r=new T.Mesh(gBox(.5,.08,.06),new T.MeshBasicMaterial({color:0xc070ff}));r.position.set(-.8+i*.4,2.6,-.1);r.rotation.x=-.9;g.add(r)}scene.add(g);return g}
function spawnMach(kind,x,z,tx,tz){const g=kind==='torre'?mkSiegeTower():kind==='ariete'?mkRam9():mkBombard9();g.position.set(x,0,z);g.rotation.y=Math.atan2(tx-x,tz-z);const hp={torre:1300,ariete:1500,bombarda:1000}[kind];
 const m={g,kind,hp,max:hp,alive:true,tx,tz,arr:false,t:0,cd:4,ob:{x,z,r:kind==='torre'?3.6:3},name:{torre:'la torre de asedio',ariete:'el ariete blindado',bombarda:'la bombarda arcana'}[kind]};obst.push(m.ob);MACH.push(m);
 HIT9.push({x:()=>m.g.position.x,z:()=>m.g.position.z,y0:0,y1:kind==='torre'?12:4,r:kind==='torre'?3.4:2.8,ok:()=>m.alive,dmg:(d,k)=>machHit(m,d,k)});return m}
function machHit(m,d,k){if(!m.alive)return;m.hp-=d*(k==='b'?.1:k==='m'?.4:1);if(m.hp<=0){m.alive=false;boom9(m.g.position.x,m.g.position.z,1.8,false);mkFire(m.g.position.x,m.g.position.z,1.6,0,-1);m.g.rotation.z=.35;m.g.position.y=-.5;feed('★ ¡'+m.name+' destruida!');say('¡Cae '+m.name+'!',2.5);score+=3000}}
function machUpd(dt){for(const m of MACH){if(!m.alive){if(R()<dt*3)smoke(m.g.position.x,3,m.g.position.z,4,4,0x1a1a1a,1.6,.5);continue}const p=m.g.position;m.t+=dt;
 const stopD=m.kind==='bombarda'?92:0,FX=X9,FZ=-520;const d=m.kind==='bombarda'?Math.hypot(p.x-FX,p.z-FZ):Math.hypot(m.tx-p.x,m.tz-p.z);
 if(!m.arr){if((m.kind==='bombarda'&&d<stopD)||(m.kind!=='bombarda'&&d<2.5)){m.arr=true;if(m.kind!=='bombarda')say('¡'+m.name.charAt(0).toUpperCase()+m.name.slice(1)+' ha llegado a la muralla!',3)}else{const sp={torre:1.1,ariete:1.7,bombarda:1.8}[m.kind],dx=m.tx-p.x,dz=m.tz-p.z,l=Math.hypot(dx,dz)||1;p.x+=dx/l*sp*dt;p.z+=dz/l*sp*dt;m.ob.x=p.x;m.ob.z=p.z;if(R()<dt*3)burst(p.x,.3,p.z,0x6a5a48,2,.6,2)}}
 else{m.cd-=dt;if(m.kind==='ariete'){const lg=m.g.userData.log;lg.position.z=Math.max(0,Math.sin(m.t*2.4))*1.2;if(m.cd<=0){m.cd=2.6;L9.gate-=1;shake=Math.max(shake,.4);snd(60,.5,'sawtooth',.12);burst(m.tx,2,m.tz,0x8a7a5a,10,.6,5);if(L9.gate===0)gateBreak9()}}
  else if(m.kind==='torre'){if(m.cd<=0){m.cd=17;for(let i=0;i<4;i++)sp9(['mosin','stv','orcoE','sol'][i],p.x+(R()-.5)*4,p.z+(R()-.5)*4);say('¡La torre de asedio vomita soldados!',2)}}
  else if(m.cd<=0){m.cd=5.5;const tx=FX+(R()-.5)*90,tz=FZ+(R()-.5)*70;burst(p.x,4,p.z,0xc070ff,10,.4,8);npcShot('big',p.x,p.z);shell9(tx,tz,1.15,0xb060ff)}}}}
/* resonadores de la máquina subterránea y el Coloso */
const DEV9=[];
function mkDevice9(){const g=new T.Group(),q=PB();pCyl(q,1.3,1.6,.6,0x3a3a40,0,.3,0,0,0,0,10);pCyl(q,.5,.7,2.6,0x4a4a52,0,1.9,0,0,0,0,8);for(let i=0;i<4;i++){const a=i/4*6.283;pBox(q,.25,2.2,.25,0x6a5a3a,Math.cos(a)*.9,1.5,Math.sin(a)*.9,0,0,0);pCyl(q,.08,.08,1.4,0x2a2a2a,Math.cos(a)*1.4,.4,Math.sin(a)*1.4,1.5708,-a,0,6)}pa(q,gTor(.9,.08,6,16),0xc9a23a,0,3.2,0,1.5708);pbMesh(q,g,VCV);
 const core=new T.Mesh(new T.OctahedronGeometry(.6,0),new T.MeshBasicMaterial({color:0xff4060}));core.position.y=3.6;g.add(core);g.userData.core=core;const ring=new T.Mesh(gTor(1.2,.05,4,20),new T.MeshBasicMaterial({color:0xff6a8a,transparent:true,opacity:.6,blending:T.AdditiveBlending,depthWrite:false}));ring.position.y=3.6;g.add(ring);g.userData.ring=ring;scene.add(g);return g}
function spawnDev9(x,z,name){const g=mkDevice9();g.position.set(x,0,z);const d={g,x,z,hp:950,max:950,alive:true,name};obst.push({x,z,r:1.7});DEV9.push(d);HIT9.push({x:()=>x,z:()=>z,y0:0,y1:4.6,r:1.7,ok:()=>d.alive,dmg:(v,k)=>devHit(d,v,k)});return d}
function devHit(d,v,k){if(!d.alive)return;d.hp-=v*(k==='b'?.55:k==='m'?1.4:1);d.g.userData.core.material.color.setHex(0xffffff);setTimeout(()=>{if(d.alive)d.g.userData.core.material.color.setHex(0xff4060)},60);if(d.hp<=0){d.alive=false;boom9(d.x,d.z,1.5,false,0xff4080);d.g.userData.core.visible=false;d.g.userData.ring.visible=false;d.g.rotation.z=.2;feed('★ Resonador '+d.name+' destruido');say('¡Resonador '+d.name+' destruido! Quedan '+DEV9.filter(q=>q.alive).length,2.5);score+=2000}}
function dev9Melee(S){if(level!==9)return;const px=P.g.position.x,pz=P.g.position.z;for(const h of HIT9)if(h.ok()&&Math.hypot(h.x()-px,h.z()-pz)<h.r+3.2)h.dmg(S.dmg,'m')}
function devUpd(dt){for(const d of DEV9){if(!d.alive)continue;const u=d.g.userData;u.core.rotation.y+=dt*2;u.core.position.y=3.6+Math.sin(time*3+d.x)*.15;u.ring.rotation.x+=dt*1.4;u.ring.rotation.y+=dt;if(R()<dt*6)burst(d.x,3.6,d.z,0xff6080,1,.5,3)}}
let BOSS9=null;
function spawnBoss9(x,z){const e=spawnE('orcoH',x,z),u=e.g.userData;e.boss9=1;e.s=2.5;e.g.scale.setScalar(2.5);const dm={easy:.78,normal:1,hard:1.28}[difficulty]||1;e.hp=e.max=3600*dm;e.sp=3.4;e.alert=0;e.k8n='al COLOSO DE LAS TRES CORONAS';e.slamT=5;e.sumd=0;e.hunchK=.3;const EM=u.em16||(u.em16=VCM.clone());
 {const q=PB();for(const s of[-1,1]){pa(q,gCone(.08,.5,6),0x2a2018,s*.24,.6,0,0,0,-s*.8);pa(q,gCone(.05,.3,5),0xc9a23a,s*.12,.7,.05,0,0,-s*.2)}pBox(q,.46,.06,.46,0xc9a23a,0,.5,0);pbMesh(q,u.hd,EM)}
 for(const s of[-1,1]){const ey=new T.Mesh(gSph(.05,6,5),new T.MeshBasicMaterial({color:0xff3010}));ey.position.set(s*.08,.22,.19);u.hd.add(ey)}{const q=PB();pBox(q,.9,.6,.5,0x5a5a5e,0,.4,.05);for(let i=0;i<5;i++)pBox(q,.12,.4,.12,0x4a4a4e,-.3+i*.15,.75,-.1,.4);pbMesh(q,u.ch,EM)}
 $('bb').style.display='block';$('bb').querySelector('span').textContent='EL COLOSO DE LAS TRES CORONAS';BOSS9=e;return e}
function boss9Upd(dt){const e=BOSS9;if(!e||enemies.indexOf(e)<0)return;$('bb').querySelector('i').style.width=Math.max(0,e.hp/e.max*100)+'%';const p=e.g.position,pp=P.g.position,d=Math.hypot(pp.x-p.x,pp.z-p.z);e.slamT-=dt;
 if(e.slamT<.7&&e.slamT>0&&d<10){e.g.userData.aR.rotation.x=e.g.userData.aL.rotation.x=-2.9}
 if(e.slamT<=0&&d<10){e.slamT=6+R()*2;boom9(p.x+Math.sin(e.g.rotation.y)*3,p.z+Math.cos(e.g.rotation.y)*3,1.5,true,0xff5020);shake=1.6;snd(40,.8,'sawtooth',.18)}
 const f=e.hp/e.max;if((f<.66&&e.sumd<1)||(f<.33&&e.sumd<2)){e.sumd++;e.roar=1.2;for(let i=0;i<4;i++)spSkel(p.x+(R()-.5)*14,p.z+(R()-.5)*14).alert=0;say('¡El Coloso llama a los guardianes de huesos!',2.5);snd(55,1.2,'sawtooth',.15)}}
function boss9Dead(e){$('bb').style.display='none';BOSS9=null;shake=2;setTimeout(()=>{if(level===9&&L9.ph===12)cineCollapse9()},2200)}
/* =====================================================================
   MAPA DEL CAP. IX — un único escenario conectado (sur → norte)
   S1 Trincheras de San Gregor · S2 Granja de Kessel · S3 Llanura de Argentum ·
   S4 Bosque de Tannen · S5 Puente del Cuervo · S6 Estación Vargenkreuz ·
   S7 Fortaleza de las Tres Coronas · S8 Monasterio (y ruinas subterráneas)
   ===================================================================== */
let GRD9=null;const RIV9={z0:-386,z1:-362},BR9={hp:1000,col:false,mid:[],blk:null,fordBlk:null,fordVis:[]};
function noise9(x,z){return Math.sin(x*.07)*Math.cos(z*.05)*.5+Math.sin(x*.13+z*.11)*.3+Math.sin(z*.21)*.2}
function ground9(){const W=360,D=740,g=new T.PlaneGeometry(W,D,60,120);g.rotateX(-1.5708);const pos=g.attributes.position,col=new Float32Array(pos.count*3),c=new T.Color();
 for(let i=0;i<pos.count;i++){const x=pos.getX(i)+X9,z=pos.getZ(i)-290;let h=noise9(x,z)*.18;const inTr=z>-8&&z<26&&Math.abs(x-X9)<70,inRiv=z<RIV9.z1+2&&z>RIV9.z0-2;if(inTr||Math.abs(x-X9)<6)h*=.2;if(inRiv)h=-.6;pos.setY(i,h);
  if(z>-100)c.setHex(0x4a3a28).lerp(new T.Color(0x3a2e20),R()*.5);else if(z>-212)c.setHex(0x5a6a38).lerp(new T.Color(0x7a7a44),R()*.4);else if(z>-350)c.setHex(0x2e3a22).lerp(new T.Color(0x3a3020),R()*.5);else if(z>-395)c.setHex(0x4a4a3a);else c.setHex(0x6a6248).lerp(new T.Color(0x5a5a4a),R()*.5);
  if(Math.abs(x-X9)<4.5&&!inRiv)c.setHex(0x6a5e4a);col[i*3]=c.r;col[i*3+1]=c.g;col[i*3+2]=c.b}
 g.setAttribute('color',new T.BufferAttribute(col,3));g.computeVertexNormals();const m=new T.Mesh(g,new T.MeshLambertMaterial({vertexColors:true,map:rt_(dirtT,40,80)}));m.position.set(X9,0,-290);scene.add(m);GRD9=m;
 /* colinas perimetrales y bordes invisibles */
 for(let i=0;i<18;i++){const s=i<9?-1:1,z=40-(i%9)*85;mesh(new T.SphereGeometry(40+R()*25,10,6),0x3a4030,X9+s*(195+R()*20),-14,z).scale.y=.6}
 for(const [x,z,hw,hd] of[[X9-168,-290,2,380],[X9+168,-290,2,380],[X9,60,170,2],[X9,-660,170,2]])obstB.push({x,z,hw,hd,h:30})}
const TRI=[];function trees9(list){const n=list.length;if(!n)return;const tr=new T.InstancedMesh(new T.CylinderGeometry(.22,.34,4,6),new T.MeshLambertMaterial({color:0x3a2a1c}),n),cr=new T.InstancedMesh(new T.ConeGeometry(2.2,6,7),new T.MeshLambertMaterial({color:0xffffff}),n),cr2=new T.InstancedMesh(new T.ConeGeometry(1.6,4.4,7),new T.MeshLambertMaterial({color:0xffffff}),n),m=new T.Matrix4(),cc=new T.Color();
 list.forEach((t,i)=>{const s=t[2];m.makeScale(s,s,s);m.setPosition(t[0],2*s,t[1]);tr.setMatrixAt(i,m);m.makeScale(s,s,s);m.setPosition(t[0],5.6*s,t[1]);cr.setMatrixAt(i,m);m.setPosition(t[0],8.2*s,t[1]);cr2.setMatrixAt(i,m);cc.setHex([0x24381e,0x2e4424,0x1e3020,0x384a2a][i%4]);cr.setColorAt(i,cc);cr2.setColorAt(i,cc.multiplyScalar(1.1));ob(t[0],t[1],.6*s)});
 for(const q of[tr,cr,cr2])scene.add(q)}
function rocks9(list){const im=new T.InstancedMesh(new T.DodecahedronGeometry(1,0),new T.MeshLambertMaterial({color:0x6a6862,map:stoneTex}),list.length),m=new T.Matrix4(),q=new T.Quaternion(),e=new T.Euler();list.forEach((r,i)=>{e.set(R(),R()*3,R());q.setFromEuler(e);m.compose(new T.Vector3(r[0],r[2]*.3,r[1]),q,new T.Vector3(r[2],r[2]*.7,r[2]*1.1));im.setMatrixAt(i,m);if(r[2]>.9){ob(r[0],r[1],r[2]*.9);covers.push({x:r[0],z:r[1],r:r[2]+.6})}});scene.add(im)}
function grass9(list){const im=new T.InstancedMesh(new T.ConeGeometry(.18,.7,4),new T.MeshLambertMaterial({color:0xffffff}),list.length),m=new T.Matrix4(),c=new T.Color();list.forEach((g,i)=>{m.makeScale(1,.6+R()*.8,1);m.setPosition(g[0],.3,g[1]);im.setMatrixAt(i,m);c.setHex([0x6a7a3a,0x8a8a4a,0x5a6a30][i%3]);im.setColorAt(i,c)});scene.add(im)}
function shack(x,z,w,d,h,col){box(w,h,d,col||0xffffff,x,h/2,z,0,0,woodTex);const r=box(w+.6,.25,d+.8,0x4a3a2a,x,h+.1,z);r.rotation.x=.12;obstB.push({x,z,hw:w/2,hd:d/2,h});covers.push({x,z,r:Math.max(w,d)/2+.8})}
function locomotive9(x,z){const g=new T.Group(),q=PB(),K=0x1e1e22,B=0x2a2a30,Rd=0x7a1a1a;pCyl(q,1.1,1.1,7,B,0,2.4,.5,1.5708,0,0,14);pCyl(q,1.15,1.15,.5,K,0,2.4,4,1.5708,0,0,14);pCyl(q,.4,.5,1.4,K,0,3.9,3.2);pCyl(q,.45,.45,.7,0xb8963a,0,3.6,1);pBox(q,2.6,2.6,2.8,K,0,2.8,-3.6);pBox(q,2.8,.2,3.2,B,0,4.2,-3.6);for(const s of[-1,1])pBox(q,.05,.8,1,0x1a2a30,s*1.31,3.2,-3.4);pBox(q,2.8,.5,10,Rd,0,1.1,0);
 for(const s of[-1,1])for(let i=0;i<4;i++)pCyl(q,.8,.8,.2,0x2a2a2a,s*1.1,.85,2.8-i*1.9,0,0,1.5708,12);pBox(q,2.4,1,1,K,0,.7,5.2,.6);pCyl(q,.3,.3,.2,0xfff0c0,0,2.6,4.3,1.5708,0,0,10);pbMesh(q,g,VCV);g.position.set(x,0,z);scene.add(g);for(let i=-1;i<=1;i++)ob(x,z+i*3.5,1.8);covers.push({x,z,r:4})}
function wagon9(x,z,ry,rz){const g=new T.Group(),q=PB();pBox(q,2.8,2.6,8,0x5a3a26,0,2.2,0);for(let i=0;i<8;i++)pBox(q,2.85,.08,.08,0x3a2414,0,1.1+i*.33,0);pBox(q,3,.2,8.4,0x3a3a3a,0,3.6,0);pBox(q,.1,1.8,2,0x2a1a10,1.45,2.1,0);for(const s of[-1,1])for(const t of[-1,1])pCyl(q,.5,.5,.18,0x2a2a2a,s*1.1,.5,t*2.8,0,0,1.5708,10);pbMesh(q,g,VCV);g.position.set(x,0,z);g.rotation.set(0,ry||0,rz||0);scene.add(g);ob(x,z+2,1.8);ob(x,z-2,1.8);covers.push({x,z,r:3.5})}
function crown9(x,z,y,r){const q=PB();pa(q,gTor(r,.25,6,20),0xd8b040,0,0,0,1.5708);for(let i=0;i<8;i++){const a=i/8*6.283;pa(q,gCone(.35,1.6,5),0xe8c050,Math.cos(a)*r,.8,Math.sin(a)*r);pa(q,gSph(.22,6,5),0xc02030,Math.cos(a)*r,1.7,Math.sin(a)*r)}const m=pbMesh(q,scene,VCB);m.position.set(x,y,z)}
function build9(){if(L9.built)return;L9.built=true;ground9();const X=X9;
 /* S1 — Trincheras de San Gregor: parapetos, duelas, refugios, puesto de comunicaciones, alambradas, tierra de nadie */
 sect9('San Gregor',X,10,120,()=>{sbRow(X-62,0,X+62,0,1.25,9);sbRow(X-62,8,X-8,8,1.4,0);sbRow(X+8,8,X+62,8,1.4,0);for(const x of[-40,-4,30])sbRow(X+x,8.5,X+x,26,1.3,0);
  for(let x=-60;x<=60;x+=2.2)box(2,.08,.7,0xc0a070,X+x,.05,4.2,0,0,woodTex);for(const [x,z] of[[-30,16],[22,22],[-52,20]]){box(5,2.4,4,0xffffff,X+x,1.2,z,0,0,woodTex);box(5.6,.6,4.6,0xffffff,X+x,2.7,z,0,0,sackT);box(1.4,1.9,.1,0x0a0806,X+x,.95,z-2.05);obstB.push({x:X+x,z,hw:2.5,hd:2,h:3})}
  box(2,.9,1.1,0x5a4630,X+12,.45,18,0,0,woodTex);box(.7,.5,.5,0x3a4a3a,X+12,1.15,18);cp(.05,.05,9,0x3a3a3a,X+14,4.5,19);box(1.6,.05,.05,0x3a3a3a,X+14,8.6,19);for(let i=0;i<5;i++)PR.pole(X+18+i*9,24+i*3,6);ob(X+12,18,1);
  for(let x=-60;x<=60;x+=16){if(Math.abs(x)<6)continue;PR.wire(X+x,-12,X+x+12,-12)}for(let i=0;i<14;i++)deadTree(X+(R()-.5)*120,-20-R()*70);
  for(const x of[-50,-20,10,40])PR.crate(X+x,12+R()*4,R()*3,1);PR.flag(X-2,10,0x7a2434,7);PR.lamp(X-20,10,3.5);PR.lamp(X+24,10,3.5);
  sbRow(X-55,-100,X+55,-100,1.2,6);for(const [x,z] of[[-26,-58],[30,-62]]){sb9(X+x,z-1.4,3.2,.9,1.1);sb9(X+x-1.8,z,.9,2.4,1.1);sb9(X+x+1.8,z,.9,2.4,1.1)}
  const wt=mkTank16('wr');wt.position.set(X-34,.2,-42);wt.rotation.set(0,.7,.1);ob(X-34,-42,3.6);covers.push({x:X-34,z:-42,r:4});
  for(let i=0;i<26;i++)crater9(X+(R()-.5)*120,-16-R()*80,1.2+R()*2.4)});
 /* S2 — Granja de Kessel: casa, granero, molino (hito), vallas, almiares, pozo */
 sect9('Kessel',X+80,-150,60,()=>{house(X+80,-146,9,7,4.5);shack(X+96,-160,10,8,5,0xb08060);box(10.6,.3,9,0x6a2a1a,X+96,5.9,-160,0,0,tileT);PR.well(X+70,-158);PR.cart(X+86,-134,.6);for(let i=0;i<4;i++)PR.hay(X+62+i*4,-170,R());PR.fence(X+56,-128,X+108,-128);PR.fence(X+56,-178,X+108,-178);PR.fence(X+108,-128,X+108,-178);
  cyl(2.2,12,0xd8c8a8,X+110,6,-136,10);mesh(new T.ConeGeometry(3,3,10),0x6a2a1a,X+110,13.5,-136,0,0,tileT);ob(X+110,-136,2.4);
  const sails=new T.Group();sails.position.set(X+110,11,-133.6);const q=PB();for(let i=0;i<4;i++){pBox(q,.3,6,.1,0x5a4630,0,3,0,0,0,i*1.5708);pBox(q,1.2,4.4,.05,0xd8d0b8,.7,3.4,0,0,0,i*1.5708)}const m=pbMesh(q,sails,VCV);m.rotation.z=0;scene.add(sails);L9.sails=sails;
  for(const [x,z] of[[64,-140],[90,-170]]){sb9(X+x,z,3,.9,1.1)}});
 /* S3 — Llanura de Argentum: hierba, muros de piedra, nidos de ametralladora, loma con cañón */
 sect9('Argentum',X-40,-160,110,()=>{const gl=[];for(let i=0;i<700;i++){const x=X-150+R()*230,z=-108-R()*100;gl.push([x,z])}grass9(gl);
  for(const [x0,z0,x1] of[[-120,-130,-80],[-40,-190,0],[-100,-200,-60]]){for(let x=x0;x<x1;x+=2.4)box(2.3,.9,.9,0xb8b0a0,X+x,.45,z0,0,0,stoneTex);obstB.push({x:X+(x0+x1)/2,z:z0,hw:(x1-x0)/2,hd:.45,h:.9});covers.push({x:X+(x0+x1)/2,z:z0,r:(x1-x0)/2})}
  for(const [x,z] of[[-60,-150],[-10,-175],[35,-140]]){sb9(X+x,z-1.6,3.6,.9,1.15);sb9(X+x-2,z-.2,.9,2.4,1.15);sb9(X+x+2,z-.2,.9,2.4,1.15)}
  const H=[X+52,-100];mesh(new T.SphereGeometry(9,12,8),0x5a5a3a,H[0],-5.8,H[1]).scale.set(1,.9,1);for(let i=0;i<3;i++)obstB.push({x:H[0],z:H[1]+6-i*2.6,hw:4.5-i*.5,hd:1.3,h:.5+i*.5,step:true});obstB.push({x:H[0],z:H[1]-2.5,hw:4,hd:3,h:1.5,step:true});
  sbRow(H[0]-4,H[1]-5.5,H[0]+4,H[1]-5.5,.9,0);PR.flag(H[0]+3,H[1],0x7a2434,6);box(1.4,.8,.8,0x5a4630,X+42,.4,-90,0,0,woodTex);box(.7,.45,.4,0x3a4a3a,X+42,1.02,-90);cp(.04,.04,6,0x3a3a3a,X+43,3,-90.5);box(1.4,.04,.04,0x3a3a3a,X+43,5.8,-90.5);L9.radioPos={x:X+42,z:-88.6};ob(X+42,-90,.8);
  trees9([...Array(60)].map(()=>[X-150+R()*20,-100-R()*110,.8+R()*.5]))});
 /* S4 — Bosque de Tannen: árboles instanciados, rocas, arroyo con pasarelas, trincheras abandonadas, restos, observatorios, repetidor */
 sect9('Tannen',X,-280,130,()=>{const T_=[];for(let i=0;i<520;i++){const x=X-158+R()*316,z=-214-R()*136;if(Math.abs(x-X)<7)continue;if(Math.hypot(x-(X+30),z+262)<11)continue;if(x<X-34&&x>X-52&&z<-288)continue;if(z<-288&&z>-304&&x<X-6&&x>X-48)continue;if(z<-338&&z>-352&&x>X-26&&x<X)continue;T_.push([x,z,.8+R()*.6])}trees9(T_);
  rocks9([...Array(70)].map(()=>[X-150+R()*300,-216-R()*130,.4+R()*1.3]).filter(r=>Math.abs(r[0]-X)>6));
  for(let i=0;i<22;i++){const z=-220-i*6,x=X-44+Math.sin(i*.6)*5;const w=mesh(new T.PlaneGeometry(4,6.4),0x2a4a5a,x,.04,z,0,0x0a1a22);w.rotation.x=-1.5708}
  for(const z of[-250,-300]){box(4.5,.2,1.8,0xffffff,X-44+Math.sin((-220-z)/6*.6)*5,.15,z,0,0,woodTex)}
  sbRow(X-30,-240,X-12,-240,1,3);sbRow(X+14,-276,X+34,-276,1,3);const wr=mkTruck16({driver:false,col:0x3a3a30});wr.position.set(X+16,0,-232);wr.rotation.set(0,1.2,.25);ob(X+16,-232,2.6);covers.push({x:X+16,z:-232,r:3.5});
  const ac=mkArmCar9();ac.g.position.set(X-20,0,-318);ac.g.rotation.set(0,.6,-.2);ac.tur.rotation.set(.3,1,0);ob(X-20,-318,2.8);
  for(const [x,z] of[[-40,-250],[55,-290],[-22,-322]]){const px=X+x;for(const s of[-1,1])for(const t of[-1,1])box(.2,6,.2,0x4a3018,px+s*1.1,3,z+t*1.1,0,0,woodTex);box(2.8,.2,2.8,0xffffff,px,5.9,z,0,0,woodTex);PR.ladder(px+1.4,0,z,5.9,0);ob(px,z,1.4)}
  shack(X+30,-262,4,3,3,0x8a7a5a);cp(.06,.06,14,0x3a3a3a,X+33,7,-263);for(let i=0;i<4;i++)box(2.4-i*.4,.06,.06,0x3a3a3a,X+33,9+i*1.4,-263);L9.relay={x:X+30,z:-259.6}});
 /* S5 — Puente del Cuervo: río, orillas, puente de piedra y acero, vado, trincheras de cabeza de puente */
 sect9('Cuervo',X,-374,120,()=>{const wt=new T.Mesh(new T.PlaneGeometry(330,RIV9.z1-RIV9.z0+4,30,2),new T.MeshLambertMaterial({color:0x2a3e48,emissive:0x0a1418,transparent:true,opacity:.92,map:rt_(cobT,40,3)}));wt.rotation.x=-1.5708;wt.position.set(X,.03,(RIV9.z0+RIV9.z1)/2);scene.add(wt);L9.water=wt;
  for(const z of[RIV9.z1+1,RIV9.z0-1])for(let x=-160;x<=160;x+=8){const b=box(8.2,.8,2.4,0x5a4a34,X+x,-.1,z,0,0,dirtT);b.rotation.x=z>-374?-.4:.4}
  for(const [a,b] of[[-165,-86],[-74,-4.2],[4.2,165]])obstB.push({x:X+(a+b)/2,z:(RIV9.z0+RIV9.z1)/2,hw:(b-a)/2,hd:(RIV9.z1-RIV9.z0)/2,h:4});
  for(const z of[-366,-374,-382]){box(7.4,2.6,2.2,0xffffff,X,-.9,z,0,0,stoneTex)}box(8.6,.4,3,0xffffff,X,.15,-358,0,0,stoneTex);box(8.6,.4,3,0xffffff,X,.15,-390,0,0,stoneTex);
  for(const [z0,z1] of[[-388,-377.5],[-370.5,-360]]){box(7.2,.24,z0-z1<0?z1-z0:z0-z1,0xc0a070,X,.12,(z0+z1)/2,0,0,woodTex)}for(const s of[-1,1]){obstB.push({x:X+s*3.9,z:-374,hw:.2,hd:15,h:1.2})}
  /* tramo central (puede derrumbarse): piezas independientes */
  const mid=new T.Mesh(gBox(7.2,.24,7.2),new T.MeshLambertMaterial({map:woodTex,color:0xc0a070}));mid.position.set(X,.12,-374);BR9.mid.push(mid);for(const s of[-1,1]){for(let i=0;i<5;i++){const tr=new T.Mesh(gBox(.15,1.4,.15),new T.MeshLambertMaterial({color:0x3a3d40}));tr.position.set(X+s*3.8,.8,-388+i*7);if(i===2)BR9.mid.push(tr);scene.add(tr)}const rl=new T.Mesh(gBox(.12,.12,30),new T.MeshLambertMaterial({color:0x3a3d40}));rl.position.set(X+s*3.8,1.4,-374);scene.add(rl);BR9.rail=(BR9.rail||[]).concat(rl)}scene.add(mid);
  for(let i=0;i<4;i++){const a=new T.Mesh(new T.TorusGeometry(3.6,.12,4,16,Math.PI),new T.MeshLambertMaterial({color:0x4a4e52}));a.position.set(X+(i<2?-3.85:3.85),.3,-381+(i%2)*14);a.rotation.y=1.5708;scene.add(a)}
  /* vado del oeste: bloqueado por alambre y carro hundido hasta que el puente falle */
  for(let i=0;i<6;i++)rocks9([[X-80+(R()-.5)*8,-374+(R()-.5)*20,.5+R()*.4]]);BR9.fordBlk={x:X-80,z:-374,hw:6,hd:12,h:4};obstB.push(BR9.fordBlk);
  const fv=[];const wq=PB();for(let i=0;i<5;i++)pCyl(wq,.05,.05,1.4,0x4a4a4a,X-86+i*3,.7,-362.5);pBox(wq,12,.04,.04,0x888888,X-80,.9,-362.5);pBox(wq,12,.04,.04,0x888888,X-80,.5,-362.5);pBox(wq,3,1,4,0x4a3218,X-80,.3,-374,0,.6,.4);const fm=pbMesh(wq,scene,VCV);BR9.fordVis.push(fm);
  sbRow(X-24,-356,X-6,-356,1.15,0);sbRow(X+8,-356,X+26,-356,1.15,0);sbRow(X-14,-398,X-6,-398,1.1,0);sbRow(X+8,-400,X+18,-400,1.1,0);for(let i=0;i<5;i++)PR.crate(X-30+i*2,-348,0,1);PR.rubble(X-40,-352,1);PR.rubble(X+40,-354,1);
  const tk=mkTruck16({col:0x4e5a46});tk.position.set(X+3,0,-350);tk.rotation.y=Math.PI;L9.truck=tk;tk.userData.ob={x:X+3,z:-350,r:2.6};obst.push(tk.userData.ob);const hood=new T.Mesh(gBox(1.3,.08,1.8),new T.MeshLambertMaterial({color:0x56604a}));hood.position.set(0,2.4,3.3);hood.rotation.x=-1.1;tk.add(hood);
  const al=mkArmCar9();al.g.position.set(X-14,0,-347);al.g.rotation.y=Math.PI;L9.alc=al;ob(X-14,-347,2.8)});
 /* S6 — Estación Vargenkreuz: vías, andén, edificio con reloj, depósito de agua, locomotora y vagones */
 sect9('Vargenkreuz',X+92,-435,70,()=>{const sl=new T.InstancedMesh(gBox(3.2,.15,.4),new T.MeshLambertMaterial({color:0x4a3220}),130),m=new T.Matrix4();for(let i=0;i<130;i++){m.makeTranslation(X+96,.08,-392-i*.75*1.0-i*.0);m.setPosition(X+96,.08,-392-i*.8);sl.setMatrixAt(i,m)}scene.add(sl);for(const s of[-.75,.75])box(.12,.14,104,0x6a6a6a,X+96+s,.2,-444);
  box(4,.9,46,0xb8b0a0,X+90,.45,-436,0,0,stoneTex);obstB.push({x:X+90,z:-436,hw:2,hd:23,h:.9,step:true});house(X+82,-432,8,14,5);box(1.6,1.6,.1,0xf0e8d0,X+86.1,4.6,-432);box(.06,.6,.05,0x111111,X+86.2,4.7,-432);
  for(const s of[-1,1])for(const t of[-1,1])cp(.15,.15,7,0x4a3218,X+104+s*1.6,3.5,-410+t*1.6);cp(2.4,2.4,3.4,0x5a4a3a,X+104,8.6,-410);mesh(new T.ConeGeometry(2.6,1.4,10),0x3a3a3a,X+104,11,-410);ob(X+104,-410,2.6);
  locomotive9(X+96,-428);wagon9(X+96,-442);wagon9(X+93,-456,.25,.3);PR.sign(X+88,-412,0);for(let i=0;i<4;i++)PR.lamp(X+88,-418-i*12,4)});
 /* S7 — Fortaleza de las Tres Coronas (murallas destructibles por bloques) */
 sect9('Tres Coronas',X,-520,90,()=>{const FZ=-480,NZ=-560;wl(X-50,FZ,X-6,FZ,3);wl(X+6,FZ,X+50,FZ,3);wl(X-50,NZ,X-5,NZ,3);wl(X+5,NZ,X+50,NZ,3);wl(X-50,FZ,X-50,-515,3);wl(X-50,-525,X-50,NZ,3);wl(X+50,FZ,X+50,-515,3);wl(X+50,-525,X+50,NZ,3);
  tw(X-50,FZ,6,6,1);tw(X+50,FZ,6,6,1);tw(X-50,NZ,5,5,1);tw(X+50,NZ,5,5,1);tw(X,-540,7,8,1);chFlush();crown9(X-50,FZ,13.4,5.6);crown9(X+50,FZ,13.4,5.6);crown9(X,-540,17.4,6.4);
  /* puertas laterales de madera (el ariete las ataca) */
  L9.gateOb=[{x:X+50,z:-520,hw:.6,hd:5,h:5},{x:X-50,z:-520,hw:.6,hd:5,h:5}];obstB.push(...L9.gateOb);
  house(X-30,-505,14,8,4.5);house(X-30,-540,14,8,4.5);house(X+30,-540,12,9,4);for(let i=0;i<6;i++)PR.stack(X+26+(i%3)*3,-500-Math.floor(i/3)*4,0);for(let i=0;i<5;i++)PR.barrel(X+38,-505-i*1.4);
  PR.cannon(X-20,-486,Math.PI);PR.cannon(X+20,-486,Math.PI);PR.cannon(X+44,-540,Math.PI/2);PR.tent(X+12,-530,0,0xd8d0c0);PR.fire(X+8,-512);for(const [x,z] of[[-10,-488],[10,-488],[-44,-522],[44,-522]])PR.lamp(X+x,z,4);
  for(const [x,z] of[[-15,-552],[15,-552]])PR.flag(X+x,z,0x7a2434,11);
  sbRow(X-12,-476,X-4,-476,1.15,0);sbRow(X+4,-476,X+12,-476,1.15,0);sbRow(X+44,-512,X+44,-528,1.15,0);sbRow(X-44,-512,X-44,-528,1.15,0);
  const pk=mkTruck16({driver:false});pk.position.set(X-14,0,-530);pk.rotation.y=.2;ob(X-14,-530,2.6);ob(X-14,-534,2.6);const tkp=mkTank16('sh');tkp.position.set(X+18,0,-552);tkp.rotation.y=Math.PI/2;ob(X+18,-552,3.5);covers.push({x:X+18,z:-552,r:4});
  for(let i=0;i<3;i++){const mo=mkMortar();mo.position.set(X-8+i*8,0,-500)}
});
 {const k=mkKrupp();k.position.set(X+52,1.5,-102.5);k.rotation.y=Math.PI;FG9.g=k;FG9.x=X+52;FG9.z=-101;mkMG08(X-8,-477.6,0,9).g.rotation.y=Math.PI;mkMG08(X+44.8,-516,0,9).g.rotation.y=Math.PI/2;L9.gateM=[1,-1].map(s=>{const m=new T.Mesh(gBox(1,5,10),new T.MeshLambertMaterial({map:woodTex,color:0xffffff}));m.position.set(X+s*50,2.5,-520);scene.add(m);return m})}
 bunker8(X-30,-466,1,'K-1');bunker8(X+30,-466,-1,'K-2');
 /* S8 — Monasterio: nave, campanario (hito con luz roja), claustro, cementerio, entrada a la cripta */
 sect9('Monasterio',X,-605,60,()=>{box(14,9,24,0xffffff,X,4.5,-606,0,0,rt_(plasterT,3,2));const rf=mesh(new T.CylinderGeometry(.1,8.2,5,4,1),0x6a2a1a,X,11.2,-606,0,0,tileT);rf.rotation.y=.785;rf.scale.z=1.6;obstB.push({x:X,z:-606,hw:7,hd:12,h:9});
  box(5,22,5,0xffffff,X-9,11,-596,0,0,rt_(stoneTex,1,5));mesh(new T.ConeGeometry(3.6,7,4),0x2a3a4a,X-9,25.5,-596).rotation.y=.785;mesh(new T.SphereGeometry(.4,8,6),0xff2020,X-9,29.4,-596,0,0xff0000);obstB.push({x:X-9,z:-596,hw:2.5,hd:2.5,h:22});
  for(let i=0;i<8;i++){cyl(.4,4,0xd8c8a8,X+10+i*3,2,-592,8);box(3.2,.6,1,0xc8b890,X+10+i*3,4.3,-592);ob(X+10+i*3,-592,.5)}for(let i=0;i<10;i++){const x=X-24+(i%5)*3,z=-588-Math.floor(i/5)*3;box(.15,1.2,.15,0x9a9488,x,.6,z);box(.7,.15,.15,0x9a9488,x,.9,z)}
  box(3.4,4.2,.3,0x0a0806,X,2.1,-593.8);box(4.2,.6,.6,0xb8a888,X,4.5,-593.8);L9.crypt={x:X,z:-592}});
 /* RUINAS SUBTERRÁNEAS (zona aparte, cerrada): pasillos, cámaras, pilares, runas, maquinaria */
 sect9('Ruinas',XU,ZU,90,()=>{const H=8,W=(x0,z0,x1,z1)=>{const cx=(x0+x1)/2,cz=(z0+z1)/2,w=Math.abs(x1-x0)||1.2,d=Math.abs(z1-z0)||1.2;box(w,H,d,0xffffff,cx,H/2,cz,0,0,rt_(brickT,Math.max(w,d)/3,2));obstB.push({x:cx,z:cz,hw:w/2,hd:d/2,h:H})};
  const fl=box(96,.1,120,0xffffff,XU,.02,ZU,0,0,rt_(cobT,24,30));const cl=box(96,.4,120,0x1a1410,XU,H+.2,ZU);
  W(XU-48,ZU+60,XU+48,ZU+60);W(XU-48,ZU-60,XU+48,ZU-60);W(XU-48,ZU-60,XU-48,ZU+60);W(XU+48,ZU-60,XU+48,ZU+60);
  W(XU-48,ZU+38,XU-4,ZU+38);W(XU+4,ZU+38,XU+48,ZU+38);W(XU-17,ZU+38,XU-17,ZU+16);W(XU+17,ZU+38,XU+17,ZU+16);W(XU-48,ZU+16,XU-17,ZU+16);W(XU+17,ZU+16,XU+48,ZU+16);
  W(XU-48,ZU-16,XU-17,ZU-16);W(XU+17,ZU-16,XU+48,ZU-16);W(XU-17,ZU+16,XU-17,ZU+5);W(XU-17,ZU-5,XU-17,ZU-16);W(XU+17,ZU+16,XU+17,ZU+5);W(XU+17,ZU-5,XU+17,ZU-16);W(XU-17,ZU-16,XU-5,ZU-16);W(XU+5,ZU-16,XU+17,ZU-16);
  for(const [x,z] of[[-10,8],[10,8],[-10,-8],[10,-8],[-30,6],[-30,-6],[30,6],[30,-6],[0,-30],[-8,-38],[8,-38],[0,26]]){cyl(.9,H,0xb8ab92,XU+x,H/2,ZU+z,10);box(2.4,.8,2.4,0x8a8070,XU+x,H-.4,ZU+z);ob(XU+x,ZU+z,1.1)}
  for(let i=0;i<6;i++)box(14,.4,.9,0xb8ab92,XU,.2+i*.35,ZU+58-i*.9,0,0,stoneTex);
  for(let i=0;i<14;i++){const r=box(.5+R()*1.5,.3+R()*.8,.5+R()*1.4,0x8a8070,XU+(R()-.5)*88,.25,ZU+(R()-.5)*110,0,0,stoneTex);r.rotation.y=R()*3}
  for(const [x,z] of[[-40,30],[38,28],[-8,-50],[30,-30]]){box(1.6,1.2,1.2,0x4a4a42,XU+x,.6,ZU+z);cp(.2,.2,1.6,0x3a3a3a,XU+x+.5,1.6,ZU+z);box(4,.15,.15,0x2a2a2a,XU+x,2.6,ZU+z)}
  const ring=new T.Group();ring.position.set(XU,5,ZU);const rq=PB();pa(rq,gTor(4.2,.45,8,28),0x5a5048);for(let i=0;i<12;i++){const a=i/12*6.283;pBox(rq,.6,1.1,.8,0x8a7a5a,Math.cos(a)*4.2,Math.sin(a)*4.2,0,0,0,a)}pbMesh(rq,ring,VCV);scene.add(ring);L9.ring=ring;
  const core=new T.Mesh(new T.OctahedronGeometry(1.4,0),new T.MeshBasicMaterial({color:0xff2a50}));core.position.set(XU,5,ZU);scene.add(core);L9.core=core;box(6,1.2,6,0x3a3a40,XU,.6,ZU);ob(XU,ZU,3.3);
  const runeM=new T.MeshBasicMaterial({color:0xff5070,transparent:true,opacity:.7,blending:T.AdditiveBlending,depthWrite:false});L9.runeM=runeM;for(let i=0;i<26;i++){const x=XU+(R()<.5?-47.6:47.6),z=ZU+(R()-.5)*110,r=new T.Mesh(gBox(.05,.8+R()*.8,.5+R()*.8),runeM);r.position.set(x,2+R()*4,z);scene.add(r)}
  for(const [x,z,i] of[[-44,52,0],[44,52,1],[-44,-12,2],[44,-12,3],[0,-56,4]])mkFire(XU+x,ZU+z,.6,1.2,-1)});
 sbInit();sectCull()}
/* =====================================================================
   CAP. IX — UTILIDADES DE FASE
   ===================================================================== */
function sp9(kind,x,z,force){if(!force&&enemies.length>=(L9.under?16:22))return null;let e;const fr=R()*5|0;
 if(kind==='mg'){e=sp8('bar',x,z,.001,fr);e.mg9=1;e.hp*=1.3;e.max=e.hp}else if(kind==='mosin'||kind==='stv'||kind==='bar'||kind==='gren')e=sp8(kind,x,z,0,fr);else if(kind==='skel')e=spSkel(x,z);else e=spawnE(kind,x,z);
 e.nav8=0;e.alert=e.hold?0:R()*1.2;if(L9.under)e.under9=1;return e}
function wave9(list,cx,cz,spread){let n=0;for(const k of list)if(sp9(k,cx+(R()-.5)*spread,cz+(R()-.5)*8))n++;return n}
function gar9(list){const made=[];for(const q of list){const s=mkGar(GAR.length,q[4]||'rifle');s.g.visible=true;s.g.position.set(q[0]+(R()-.5)*1.5,0,q[1]+(R()-.5)*1.5);s.post={x:q[0],z:q[1],f:q[2]===undefined?Math.PI:q[2],c:!!q[3],bk:!!q[5],fb:q[6]||null,occ:s};if(q[5])for(let k=0;k<BK.length;k++)if(BK[k].inside({x:q[0],z:q[1]}))s.post.bkI=k;made.push(s)}return made}
function garRetire9(){for(const s of GAR)if(s.alive&&s.g.visible){s.g.visible=false;s.retired=1}}
function tele9(x,z,yw){P.g.position.set(x,0,z);P.mvx=P.mvz=0;P.vy=0;yaw=yw||0;pitch=.18;allies.forEach((a,i)=>{if(a.name){a.g.position.set(x+(i-1)*2.6,0,z+3.5);a.g.visible=true;a.down=0;a.g.rotation.x=0}});if(officer){officer.g.position.set(x-3.5,0,z+1.5);officer.g.visible=true;officer.down=0;officer.g.rotation.x=0;officer.dec=0}if(MED){MED.g.position.set(x+3.5,0,z+2.5);MED.g.visible=true;MED.down=0;MED.heal=null;MED.lv=level}L9.cp=[x,z]}
function sky9(k){const S={alba:[[[0,'#0c1018'],[.35,'#1e2632'],[.47,'#4a4a52'],[.5,'#8a6a5a'],[.52,'#3a3530'],[1,'#151310']],0x5a5e62,18,140,0x9aa4b0,0x3a3024,.85,0xd0a080,.6,[.98,.97,1]],
 manana:[[[0,'#3a4a5a'],[.4,'#7a8a96'],[.5,'#c8c0a8'],[.53,'#6a6a5a'],[1,'#3a3a30']],0x8a9090,30,190,0xc8d0d8,0x4a4030,1,0xfff0d0,.85,[1,1,.98]],
 bosque:[[[0,'#2a3430'],[.45,'#5a6a60'],[.5,'#8a8a78'],[.53,'#3a4030'],[1,'#202018']],0x4a5a50,12,110,0x9ab0a0,0x2a3020,.8,0xd8e0c0,.55,[.94,1,.96]],
 tarde:[[[0,'#3a3050'],[.38,'#8a5a5a'],[.48,'#e09050'],[.51,'#f0c070'],[.54,'#5a4030'],[1,'#2a2018']],0x9a7a60,30,200,0xffd8b0,0x4a3a2a,1,0xffb070,1,[1.06,1,.92]],
 ruinas:[[[0,'#000'],[1,'#000']],0x140c10,6,62,0x6a4a6a,0x2a1a14,.55,0xff6040,.25,[1.05,.94,.98]],
 amanecer:[[[0,'#2a3a5a'],[.4,'#8a7a8a'],[.48,'#f0b070'],[.5,'#ffe0a0'],[.53,'#7a6040'],[1,'#2a2418']],0xc0a080,40,230,0xfff0d8,0x5a4a30,1.1,0xffd090,1.1,[1.05,1,.94]]}[k];
 setSky(S[0]);skyMesh.visible=k!=='ruinas';L9.fog={c:new T.Color(S[1]),n:S[2],f:S[3]};scene.fog.color.copy(L9.fog.c);scene.fog.near=S[2];scene.fog.far=S[3];hemi.color.set(S[4]);hemi.groundColor.set(S[5]);hemi.intensity=S[6];sunL.color.set(S[7]);sunL.intensity=S[8];sunL.position.set(80,50,30);pMat.uniforms.tint.value.set(...S[9])}
function retry9(msg){story(msg+' — Reintentando la fase…');say(msg,4);for(const e of[...enemies]){scene.remove(e.g);disp16(e.g)}enemies.length=0;for(const b of ebul)scene.remove(b.m);ebul.length=0;for(const g of egr)scene.remove(g.m);egr.length=0;P.hp=100;refill(4);setTimeout(()=>story(''),3500);go9(L9.ph,true)}
function obj9(t,x,z){$('obj').textContent=t;L9.obj=x===undefined?null:[x,z]}
/* =====================================================================
   CINEMÁTICAS DEL CAP. IX: tomas con movimiento, eventos sincronizados, saltables
   ===================================================================== */
const CIN9={sh:[],t:0,end:null,ev:[]};
function cine9(sh,end,ev){L9.cine=1;L9.skip=0;firing=false;P.gun9=false;Object.assign(CIN9,{sh,t:0,end,ev:(ev||[]).map(e=>Object.assign({},e,{d:0}))});sh.forEach(s=>s.sd=0);$('tc').style.display='none';$('bars').style.display='block';$('skip').style.display='block';$('pr').textContent='';$('arrow').style.display='none';$('obj').textContent='';$('plant').style.display='none';$('gar').style.display='none';document.querySelectorAll('.nm').forEach(l=>l.style.display='none')}
function cine9Upd(dt){const C=CIN9;C.t+=dt;for(const e of C.ev)if(!e.d&&C.t>=e.t){e.d=1;e.fn()}let t=C.t,s=null;for(const q of C.sh){if(t<=q.d){s=q;break}t-=q.d}
 if(!s||L9.skip){L9.skip=0;for(const e of C.ev)if(!e.d&&e.must){e.d=1;e.fn()}cineEnd9();return}
 const u=sm8(t/s.d),f=v=>typeof v==='function'?v(u):v,A=f(s.a),B=s.b?f(s.b):A,LA=f(s.la),LB=s.lb?f(s.lb):LA;cam.position.set(lr(A[0],B[0],u),lr(A[1],B[1],u),lr(A[2],B[2],u));cam.lookAt(lr(LA[0],LB[0],u),lr(LA[1],LB[1],u),lr(LA[2],LB[2],u));
 if(s.txt&&!s.sd){s.sd=1;story(s.txt)}if(s.fn)s.fn(dt,u);if(shake>0){shake=Math.max(0,shake-dt*2);cam.position.x+=(R()-.5)*shake*.4;cam.position.y+=(R()-.5)*shake*.4}}
function cineEnd9(){L9.cine=0;story('');$('bars').style.display='none';$('skip').style.display='none';$('tc').style.display='block';const f=CIN9.end;CIN9.end=null;L9.tick=null;if(f)f()}
const c9=(o,dx,dy,dz)=>u=>{const p=o();return[p.x+dx,p.y+dy,p.z+dz]};
/* =====================================================================
   FASES
   ===================================================================== */
const COM9={hp:900,max:900};
function go9(ph,retry){L9.ph=ph;L9.t=0;L9.stage=0;P.gun9=false;({1:enter1,3:enter3,5:enter5,7:enter7,9:enter9,11:enter11,12:enter12})[ph](retry)}
/* FASE 1 — EL BARRO Y EL ACERO */
function enter1(retry){const X=X9;sky9('alba');tele9(X,5,0);L9.def=true;L9.wv=0;L9.wt=retry?4:10;L9.art=3;L9.loss=0;COM9.hp=COM9.max;
 if(!retry){gar9([[X-46,1.6,Math.PI,1],[X-34,1.6,Math.PI,1],[X-23,1.6,Math.PI,1,'mg'],[X-13,1.6,Math.PI,1],[X-4,1.6,Math.PI,1],[X+7,1.6,Math.PI,1],[X+17,1.6,Math.PI,1],[X+27,1.6,Math.PI,1,'mg'],[X+37,1.6,Math.PI,1],[X+48,1.6,Math.PI,1]])}
 L9.tgts=[{p:new T.Vector3(X+12,0,18),r:1.6,y:2,bias:6,h:d=>{COM9.hp-=d},ok:()=>COM9.hp>0}];for(const [x,z] of[[-26,-58],[30,-62]])sp9('mg',X+x,z,true)}
function wave1(n){const X=X9,L=[['mosin','stv','mosin','gren','orcoE','plaga','stv','mosin'],['stv','mosin','orcoE','orcoE','gren','plaga','plaga','mosin','bar','stv'],['orcoH','orcoE','gren','gren','plaga','mosin','stv','bar','mosin','orcoE','plaga','mosin']][n];wave9(L,X,-104,100);say(['¡Primera oleada! ¡Fuego a discreción!','¡Segunda oleada, y traen gas!','¡Asalto general! ¡Que no pisen la trinchera!'][n],3);if(n===1)setTimeout(()=>{if(level===9&&L9.ph===1)gasStart(X+8,-62)},6000)}
function upd1(dt){const X=X9;L9.art-=dt;if(L9.art<=0){L9.art=2.6+R()*3.2;if(R()<.62)shell9(X+(R()-.5)*110,-24-R()*80,1);else shell9(X+(R()-.5)*110,-6+R()*20,1)}
 const alive=enemies.filter(e=>!e.mg9).length;if(L9.wv<3&&alive<=2){L9.wt-=dt;if(L9.wt<=0){wave1(L9.wv);L9.wv++;L9.wt=9}}
 let inT=0;for(const e of enemies){const p=e.g.position;if(p.z>-2&&p.z<14&&Math.abs(p.x-X)<62)inT++}L9.loss=inT>=5?L9.loss+dt:Math.max(0,L9.loss-dt);if(L9.loss>10){retry9('La trinchera ha caído');return}if(COM9.hp<=0){retry9('El puesto de comunicaciones ha sido destruido');return}
 obj9('FASE 1 · Defiende la primera línea · oleada '+Math.min(3,L9.wv)+'/3 · enemigos '+enemies.length+' · comunicaciones '+Math.max(0,Math.round(COM9.hp/COM9.max*100))+'%'+(inT>=3?' · ¡ENEMIGOS EN LA TRINCHERA!':''),inT>=3||COM9.hp<COM9.max*.5?X+12:undefined,18);
 if(L9.wv>=3&&enemies.length===0){go9(3);say('Teniente Hollenstein: «¡La línea aguanta! Kovač, a la radio de campaña de la loma: pida a la caballería de Argentum.»',5)}}
/* FASE 2 — LA CARGA DE ARGENTUM */
function enter3(retry){const X=X9;sky9('manana');L9.def=false;L9.tgts=[];if(retry){tele9(X-60,-70,0);CAV.forEach(c=>{if(c.alive)c.g.position.set(X-110+c.i*3,0,-74)})}
 for(const [x,z] of[[-60,-150],[-10,-175],[35,-140]]){sp9('mg',X+x,z,true);sp9('mosin',X+x-3,z-4,true);sp9('stv',X+x+3,z-5,true)}for(const [x,z] of[[78,-150],[92,-162],[70,-138]])sp9(['mosin','stv','orcoE'][R()*3|0],X+x,z,true);
 if(!AC9.some(a=>a.alive))spawnAC9([[X-80,-196],[X+20,-186],[X+30,-128],[X-50,-124]]);L9.reinf=20;L9.radio9=0;const hc=CAV.some(c=>c.alive);L9.stage=retry&&hc?1:0;CAVS.go=retry&&hc?1:0}
function upd3(dt){const X=X9,cap=CAV[0],nests=enemies.filter(e=>e.mg9).length,acA=AC9.some(a=>a.alive);L9.reinf-=dt;if(L9.reinf<=0&&CAV.some(c=>c.alive)){L9.reinf=24;wave9(['mosin','stv','sol'],X-30+(R()-.5)*60,-225,30)}
 if(L9.stage===0){const RD=L9.radioPos,d=Math.hypot(P.g.position.x-RD.x,P.g.position.z-RD.z);let pt='';if(d<3.2){pt='[MANTÉN E / USAR] Llamar a la caballería por radio';if(L8.hold){L9.radio9+=dt/2.4;if(R()<dt*4)snd(1200+R()*600,.05,'square',.02)}}$('pr').textContent=pt;const pb=$('plant');if(L9.radio9>0&&d<3.2){pb.style.display='block';pb.firstChild.nodeValue='LLAMANDO A ARGENTUM…';pb.querySelector('i').style.width=Math.min(100,L9.radio9*100)+'%'}else pb.style.display='none';obj9('FASE 2 · Llama a la caballería por la radio de campaña · '+Math.round(d)+' m',RD.x,RD.z);if(L9.radio9>=1){L9.stage=.5;pb.style.display='none';$('pr').textContent='';say('Radio: «Aquí Argentum. ¡Vamos para allá, aguantad!»',3);cineCav9()}}
 else if(L9.stage===1){const t=nests?enemies.find(e=>e.mg9):null;obj9('FASE 2 · Elimina los nidos de ametralladora ('+nests+') y el blindado '+(acA?'('+Math.round(AC9.find(a=>a.alive).hp/15)+'%)':'✔')+' · caballería '+CAV.filter(c=>c.alive).length+'/'+CAV.length+(acA?' · usa el cañón de la loma (USAR)':''),acA&&!P.gun9&&Math.hypot(P.g.position.x-FG9.x,P.g.position.z-FG9.z)>12?FG9.x:t?t.g.position.x:undefined,acA&&!P.gun9&&Math.hypot(P.g.position.x-FG9.x,P.g.position.z-FG9.z)>12?FG9.z:t?t.g.position.z:0);
  if(!nests&&!acA){L9.stage=2;say('¡La llanura es nuestra! Recuperad la granja de Kessel.',3.5);CAVS.rx=X+60;CAVS.rz=-130;CAVS.st='form'}}
 else{const d=Math.hypot(P.g.position.x-(X+78),P.g.position.z+148);obj9('FASE 2 · Llega a la granja de Kessel · enemigos '+enemies.length+' · '+Math.round(d)+' m',X+78,-148);if(d<12&&enemies.filter(e=>Math.hypot(e.g.position.x-(X+80),e.g.position.z+150)<30).length===0){L9.ph=4;cineForest9()}}}
/* FASE 3 — EL CERCO DE TANNEN */
function enter5(retry){const X=X9;sky9('bosque');tele9(X,-206,0);L9.def=false;L9.tgts=[];L9.flk=retry?12:16;L9.relay9=0;L9.fallen=L9.fallen||0;L9.circ=0;L9.route=null;
 if(!retry){for(const s of CAV){s.g.visible=false;s.alive=false}CAVS.st='off';garRetire9();L9.pat=gar9([[X+26,-256,Math.PI,1],[X+34,-256,Math.PI,1],[X+30,-266,0,1],[X+24,-262,Math.PI/2,1]])}
 for(const [x,z] of[[-40,-250],[55,-290],[-22,-322]]){const e=sp9('mosin',X+x,z,true);e.g.position.y=6;e.hold=[X+x,6,z];e.obs9=1;e.fled=true;e.alert=0;e.k8n='a un observador'}
 wave9(['stv','mosin','orcoE'],X-34,-236,10);wave9(['stv','mosin','plaga'],X+36,-240,10)}
function upd5(dt){const X=X9,pp=P.g.position,obs=enemies.filter(e=>e.obs9);L9.flk-=dt;if(L9.flk<=0&&pp.z>-336){L9.flk=21+R()*6;wave9(['stv','mosin','orcoE','plaga'],X-72,pp.z-12,14);wave9(['mosin','stv','trasgo','orcoE'],X+72,pp.z-14,14);say('¡Nos atacan por ambos flancos! ¡Quieren envolvernos!',3);
  if(L9.pat&&!L9.patR){L9.patR=1;const pts=[[pp.x-5,pp.z+4],[pp.x+5,pp.z+4],[pp.x-2,pp.z+7],[pp.x+2,pp.z+7]];L9.pat.forEach((s,i)=>{if(s.alive){s.post={x:pts[i][0],z:pts[i][1],f:Math.PI,c:false,fb:null}}});say('Patrulla de Tannen: «¡Nos replegamos hacia vosotros! ¡Cubridnos!»',3)}}
 if(!L9.fallen&&pp.z<-290){L9.fallen=1;const q=PB();pCyl(q,.7,.9,30,0x3a2a1c,X,1,-305,0,0,1.5708,8);for(let i=0;i<8;i++)pa(q,gCone(1.6,4,6),0x24381e,X-12+i*3.4,2.2,-305+(R()-.5)*2,0,0,1.5708+R());pbMesh(q,scene,VCV);for(let x=-14;x<=14;x+=2.4)ob(X+x,-305,1);
  L9.route=[[X-10,-292],[X-40,-299],[X-43,-330],[X-14,-346],[X,-352]];L9.ri=0;say('¡Un árbol derribado corta el camino! ¡Por el sendero del arroyo, al oeste!',4);wave9(['mosin','stv','orcoE'],X,-262,10);setTimeout(()=>{if(level===9)say('¡Nos cortan la retirada por el sur!',2.5)},1600)}
 let near=0;for(const e of enemies)if(Math.hypot(e.g.position.x-pp.x,e.g.position.z-pp.z)<26)near++;L9.circ-=dt;if(near>=7&&L9.circ<=0){L9.circ=22;say('Teniente Hollenstein: «¡Nos rodean! ¡Romped el cerco hacia el norte!»',3);if(officer)orderLt()}
 const rel=L9.relay,dr=Math.hypot(pp.x-rel.x,pp.z-rel.z);let ptxt='';if(L9.relay9<1&&dr<3.4){ptxt='[MANTÉN E / USAR] Restaurar comunicaciones';if(L8.hold){L9.relay9+=dt/3.5;if(R()<dt*6)burst(rel.x,1.5,rel.z,0xffe080,2,.3,3)}}$('pr').textContent=ptxt;
 const pb=$('plant');if(L9.relay9>0&&L9.relay9<1&&dr<3.4){pb.style.display='block';pb.firstChild.nodeValue='RESTAURANDO COMUNICACIONES…';pb.querySelector('i').style.width=L9.relay9*100+'%'}else pb.style.display='none';if(L9.relay9>=1&&!L9.relOK){L9.relOK=1;say('Radio: «Aquí el estado mayor. Os recibimos. Hay refuerzos camino del Puente del Cuervo.»',4.5);score+=1500}
 let tx=null;if(obs.length){const o=obs.reduce((a,b)=>Math.hypot(b.g.position.x-pp.x,b.g.position.z-pp.z)<Math.hypot(a.g.position.x-pp.x,a.g.position.z-pp.z)?b:a);tx=[o.g.position.x,o.g.position.z]}else if(!L9.relOK)tx=[rel.x,rel.z];else if(L9.route){while(L9.ri<L9.route.length-1&&Math.hypot(pp.x-L9.route[L9.ri][0],pp.z-L9.route[L9.ri][1])<6)L9.ri++;tx=L9.route[L9.ri]}else tx=[X,-352];
 obj9('FASE 3 · '+(obs.length?'Elimina a los observadores ('+obs.length+')':!L9.relOK?'Restaura las comunicaciones del repetidor':'Rompe el cerco: sal del bosque hacia el norte')+' · enemigos '+enemies.length,tx[0],tx[1]);
 if(!obs.length&&L9.relOK&&Math.hypot(pp.x-X,pp.z+352)<11){L9.ph=6;cineBridge9()}}
/* FASE 4 — EL PUENTE DEL CUERVO */
function enter7(retry){const X=X9;sky9('manana');tele9(X+4,-340,0);L9.def=true;L9.rep=retry?Math.min(L9.rep||0,60):0;L9.drive=0;L9.trHP=900;L9.alHP=1000;L9.sabT=8;L9.wvT=6;
 if(!retry){garRetire9();L9.brG=gar9([[X-18,-354.5,Math.PI,1],[X-9,-354.5,Math.PI,1],[X+12,-354.5,Math.PI,1,'mg'],[X+22,-354.5,Math.PI,1],[X+1.6,-356.6,Math.PI,0],[X+4.4,-356.6,Math.PI,0]]);L9.brG[4].job=L9.brG[5].job=1}
 const tk=L9.truck;L9.tgts=[{p:tk.position,r:2.8,y:3.2,bias:4,h:d=>{L9.trHP-=d},ok:()=>L9.trHP>0},{p:L9.alc.g.position,r:2.8,y:3.2,bias:6,h:d=>{L9.alHP-=d},ok:()=>L9.alHP>0}];
 sp9('mg',X-10,-400,true);sp9('mg',X+13,-402,true)}
function sab9(){const X=X9,pts=BR9.col?[[X-2.5,-389],[X+2.5,-389]]:[[X-2.5,-389],[X+2.5,-389],[X,-375]];const e=sp9('sol',X+(R()-.5)*50,-418,true);if(!e)return;e.sab9=pts[R()*pts.length|0];e.alert=99;e.k8n='a un saboteador';const EM=e.g.userData.em16||(e.g.userData.em16=VCM.clone());const q=PB();pBox(q,.4,.3,.2,0x8a2a1a,0,.3,-.32);pBox(q,.42,.06,.22,0xd8c040,0,.46,-.32);pbMesh(q,e.g.userData.ch,EM);feed('⚠ ¡Saboteador hacia el puente!')}
function brCollapse9(){const X=X9;BR9.col=true;BR9.mid.forEach(m=>m.visible=false);BR9.blk={x:X,z:-374,hw:4.4,hd:3.8,h:4};obstB.push(BR9.blk);for(let i=0;i<4;i++)burst(X+(R()-.5)*6,.5,-374+(R()-.5)*6,0x9aa8b0,14,1,6);smoke(X,1,-374,10,6,0x6a6a6a,1,.6);snd(45,1.2,'sawtooth',.18);shake=1.5;
 const i=obstB.indexOf(BR9.fordBlk);if(i>=0)obstB.splice(i,1);BR9.fordVis.forEach(m=>m.visible=false);say('¡El tramo central se ha hundido! Ingenieros: «¡Abrimos el vado del oeste! ¡El camión cruzará por allí!»',5);feed('RUTA ALTERNATIVA: vado del oeste')}
function upd7(dt){const X=X9,pp=P.g.position,tk=L9.truck;
 for(const e of enemies){if(!e.sab9)continue;e.alert=99;const p=e.g.position;if(!(e.sabT>0)){const dx=e.sab9[0]-p.x,dz=e.sab9[1]-p.z,d=Math.hypot(dx,dz);if(d<2.2){e.sabT=2.8;feed('⚠ ¡Un saboteador coloca cargas!')}else{const s=steer(e,dx,dz,dt);p.x+=s[0]*4.6*dt;p.z+=s[1]*4.6*dt;resolve(p,.6);e.vx=s[0]*4.6;e.vz=s[1]*4.6;e.g.rotation.y=Math.atan2(s[0],s[1]);animE(e,1,0,dt,false)}}
  else{e.sabT-=dt;e.vx=e.vz=0;animE(e,0,0,dt,true);if(R()<dt*5)burst(p.x,.6,p.z,0xffd040,1,.2,2);if(e.sabT<=0){boom9(e.sab9[0],e.sab9[1],1.3,true);BR9.hp-=340;hurt(e,9999,'m');if(BR9.hp<=500&&!BR9.col)brCollapse9()}}}
 L9.sabT-=dt;if(L9.sabT<=0&&!L9.drive){L9.sabT=15+R()*6;sab9();if(R()<.5)setTimeout(()=>{if(level===9&&L9.ph===7)sab9()},2500)}
 L9.wvT-=dt;if(L9.wvT<=0&&!L9.drive){L9.wvT=19+R()*5;wave9([['mosin','stv','orcoE','gren'],['stv','plaga','mosin','orcoH'],['mosin','mosin','trasgo','orcoE']][R()*3|0],X+(R()-.5)*60,-420,30)}
 /* reparación visual y funcional del camión */
 let work=0;for(const s of(L9.brG||[])){if(!s.alive||!s.job||s.down>0)continue;const d=Math.hypot(s.g.position.x-s.post.x,s.g.position.z-s.post.z);if(d<1.4){work++;s.cd=1;s.tg=null;const u=s.u;s.g.rotation.y=Math.PI;u.l1.rotation.x=-1.4;u.k1.rotation.x=1.6;u.l2.rotation.x=-.2;u.k2.rotation.x=1.7;u.b.position.y=.48;u.b.rotation.x=.3;u.aR.rotation.x=-1.9+Math.abs(Math.sin(s.t*7))*.7;u.eR.rotation.x=-.6;u.aL.rotation.x=-1.4;if(R()<dt*3){burst(s.g.position.x,1.6,s.g.position.z-.8,0xffd080,2,.15,3);snd(1200+R()*400,.04,'square',.015)}}}
 if(!work&&L9.rep<100&&(L9.brG||[]).filter(s=>s.alive&&s.job).length<2){const c=(L9.brG||[]).find(s=>s.alive&&!s.job&&!s.retired);if(c){c.job=1;c.post={x:X+1.6+R()*2.8,z:-356.6,f:Math.PI,c:false,fb:null};say(c.name+': «¡Ocupo el puesto del mecánico!»',2)}}
 if(!L9.drive){L9.rep=Math.min(100,L9.rep+work*dt*1.25);if(L9.rep>=100){L9.drive=1;L9.path=BR9.col?[[X+3,-345],[X-30,-345],[X-80,-352],[X-80,-392],[X-50,-410],[X-10,-414]]:[[X+1,-357],[X,-362],[X,-392],[X,-414]];L9.pi=0;say('Ingenieros: «¡Motor en marcha! ¡Cubrid al camión!»',3);for(const s of(L9.brG||[]))s.job=0}}
 else{const w=L9.path[L9.pi],p=tk.position,dx=w[0]-p.x,dz=w[1]-p.z,d=Math.hypot(dx,dz);if(d<1.5){L9.pi++;if(L9.pi>=L9.path.length){L9.ph=8;cineFort9();return}}else{const a=Math.atan2(dx,dz);tk.rotation.y=angL(tk.rotation.y,a,Math.min(1,dt*1.5));p.x+=Math.sin(tk.rotation.y)*5.2*dt;p.z+=Math.cos(tk.rotation.y)*5.2*dt;tk.userData.ob.x=p.x;tk.userData.ob.z=p.z;for(const wh of tk.userData.wh)wh.rotation.x+=5.2*dt/.62;if(R()<dt*5)smoke(p.x-Math.sin(tk.rotation.y)*4,1,p.z-Math.cos(tk.rotation.y)*4,1.6,1.6,0x2a2a2a,.8,.4)}}
 /* blindado aliado: fuego de apoyo */
 const al=L9.alc;if(L9.alHP>0){al.mcd=(al.mcd||0)-dt;let tg=null,td=58;for(const e of enemies){const d=Math.hypot(e.g.position.x-al.g.position.x,e.g.position.z-al.g.position.z);if(d<td){td=d;tg=e}}if(tg){al.tur.rotation.y=angL(al.tur.rotation.y,Math.atan2(tg.g.position.x-al.g.position.x,tg.g.position.z-al.g.position.z)-al.g.rotation.y,Math.min(1,dt*3));if(al.mcd<=0){al.mcd=R()<.12?1:.13;al.muz.getWorldPosition(_tv);const t2=tg.g.position.clone();t2.y=1.2*tg.s;const v=t2.sub(_tv).normalize();v.x+=(R()-.5)*.05;v.z+=(R()-.5)*.05;v.normalize().multiplyScalar(74);const m=new T.Mesh(bG,bM);m.position.copy(_tv);m.lookAt(_tv.clone().add(v));scene.add(m);bullets.push({m,v,life:1,dmg:11,by:{name:'El blindado aliado'}});npcShot('mg',_tv.x,_tv.z)}}}else if(!L9.alDead){L9.alDead=1;boom9(al.g.position.x,al.g.position.z,1.4,false);mkFire(al.g.position.x,al.g.position.z,1,1.6,-1);say('¡Han destruido el blindado aliado!',2.5)}
 if(L9.trHP<=0){retry9('El camión de refuerzos ha sido destruido');return}
 obj9('FASE 4 · '+(L9.drive?'Escolta al camión '+(BR9.col?'por el vado':'por el puente'):'Cubre la reparación del camión '+Math.round(L9.rep)+'%')+' · puente '+Math.max(0,Math.round(BR9.hp/10))+'%'+(BR9.col?' (dañado: ruta por el vado)':'')+' · camión '+Math.max(0,Math.round(L9.trHP/9))+'%',L9.drive?tk.position.x:X+3,L9.drive?tk.position.z:-352)}
/* FASE 5 — FORTALEZA DE LAS TRES CORONAS */
function enter9(retry){const X=X9;sky9('tarde');tele9(X,-458,0);L9.def=true;L9.gate=retry?Math.max(L9.gate,2):4;L9.fw=0;L9.fwT=8;L9.mon=0;L9.tgts=[];L9.truck.visible=false;if(L9.truck.userData.ob){const i=obst.indexOf(L9.truck.userData.ob);if(i>=0)obst.splice(i,1)}
 if(!retry){garRetire9();gar9([[X-8,-474.6,0,1],[X+8,-474.6,0,1],[X-32.6,-463.4,0,0,'rifle',1],[X-27.4,-463.4,0,0,'mg',1],[X+27.4,-463.4,0,0,'rifle',1],[X+32.6,-463.4,0,0,'rifle',1],[X+42.2,-515,Math.PI/2,1],[X+42.2,-525,Math.PI/2,1,'mg'],[X-42.2,-515,-Math.PI/2,1],[X-42.2,-525,-Math.PI/2,1],[X-20,-500,-Math.PI/2,0],[X+20,-505,Math.PI/2,0]])}
 for(const m of MACH)if(m.alive){m.alive=false;m.g.visible=false}MACH.length=0;spawnMach('ariete',X+150,-520,X+53.5,-520);spawnMach('torre',X-150,-525,X-55,-525);spawnMach('bombarda',X-150,-600,X-60,-560)}
function gateBreak9(){const X=X9;const o=L9.gateOb[0];const i=obstB.indexOf(o);if(i>=0)obstB.splice(i,1);if(L9.gateM)L9.gateM[0].visible=false;chBlast(X+50,3,-520,6,14,0);boom9(X+52,-520,1.4,true);say('¡El ariete ha reventado la puerta este! ¡Contened la brecha!',4)}
function upd9(dt){const X=X9;L9.fwT-=dt;if(L9.fwT<=0&&L9.fw<4){L9.fwT=24;const s=L9.fw%2?1:-1;wave9([['mosin','stv','orcoE','gren','plaga'],['stv','orcoH','mosin','bar','orcoE'],['gren','orcoE','orcoH','plaga','stv','mosin'],['orcoH','orcoH','gren','mosin','plaga','stv']][L9.fw],X+s*130,-520,30);wave9(['mosin','stv'],X-95,-470,12);L9.fw++;say('¡Oleada '+L9.fw+'/4 desde el '+(s>0?'este':'oeste')+'!',2.5)}
 let mon=0;for(const e of enemies)if(e.g.position.z<-582&&Math.abs(e.g.position.x-X)<36)mon++;L9.mon=mon>=3?L9.mon+dt:Math.max(0,L9.mon-dt);if(L9.mon>6){retry9('El enemigo ha alcanzado el monasterio');return}
 const ma=MACH.filter(m=>m.alive);let tg=null,bd=1e9;for(const m of ma){const d=Math.hypot(m.g.position.x-P.g.position.x,m.g.position.z-P.g.position.z);if(d<bd){bd=d;tg=m}}
 obj9('FASE 5 · Destruye las máquinas de asedio ('+ma.length+'/3: '+ma.map(m=>m.kind+' '+Math.round(m.hp/m.max*100)+'%').join(', ')+') · oleada '+L9.fw+'/4 · enemigos '+enemies.length+(mon?' · ¡HACIA EL MONASTERIO!':'')+(L9.gate<=0?' · PUERTA ESTE ROTA':''),tg?tg.g.position.x:undefined,tg?tg.g.position.z:0);
 if(!ma.length&&L9.fw>=4&&enemies.length<=3){L9.ph=10;cineRuins9()}}
/* FASE 6 — EL MONASTERIO Y LAS RUINAS */
function enter11(retry){L9.under=true;sky9('ruinas');tele9(XU,ZU+46,0);L9.def=true;L9.br=retry?Math.min(L9.br||0,40):0;L9.spT=4;garRetire9();L9.tgts=[];for(const p of LT.pts)p.on=false;bindFireLight(XU-44,2,ZU+52,0,0xff8040);bindFireLight(XU+44,2,ZU+52,1,0xff8040);bindFireLight(XU,2,ZU-56,2,0xff6040);bindFireLight(XU,5,ZU,3,0xff3050);
 if(!DEV9.length){spawnDev9(XU-32,ZU,'oeste');spawnDev9(XU+32,ZU,'este');spawnDev9(XU,ZU-36,'norte')}sectCull()}
function upd11(dt){const al=DEV9.filter(d=>d.alive);L9.br+=dt*(.25+al.length*.18);if(L9.br>=100){retry9('La brecha se ha abierto: la máquina despertó');return}
 L9.spT-=dt;if(L9.spT<=0){L9.spT=7.5+R()*2;const S=[[XU-44,ZU],[XU+44,ZU],[XU,ZU-52],[XU-30,ZU-40],[XU+30,ZU+30]][R()*5|0];wave9([['skel','skel','plaga'],['skel','mago','orcoE'],['custodio','skel','plaga'],['orcoH','skel','skel'],['mago','plaga','skel']][R()*5|0],S[0],S[1],5)}
 L9.core.scale.setScalar(1+Math.sin(time*6)*.08+L9.br*.006);L9.ring.rotation.z+=dt*(.3+L9.br*.02);L9.runeM.opacity=.4+Math.sin(time*3)*.3*(.5+L9.br/100);
 const pp=P.g.position;let tg=null,bd=1e9;for(const d of al){const dd=Math.hypot(d.x-pp.x,d.z-pp.z);if(dd<bd){bd=dd;tg=d}}
 obj9('FASE 6 · Destruye los resonadores ('+al.length+'/3) · BRECHA '+Math.round(L9.br)+'% · enemigos '+enemies.length,tg?tg.x:undefined,tg?tg.z:0);if(!al.length){L9.ph=11.5;cineMachine9()}}
function enter12(){L9.def=false;spawnBoss9(XU,ZU-30);say('El Coloso de las Tres Coronas: «…VUESTRAS CORONAS SON POLVO…»',4)}
function upd12(dt){boss9Upd(dt);L9.spT-=dt;if(L9.spT<=0&&enemies.length<8){L9.spT=12;wave9(['skel','skel'],XU+(R()<.5?-44:44),ZU,4)}const b=BOSS9;obj9('FINAL · Derrota al Coloso de las Tres Coronas'+(b?' · '+Math.round(b.hp/b.max*100)+'%':''),b?b.g.position.x:undefined,b?b.g.position.z:0)}
/* =====================================================================
   LAS 10 CINEMÁTICAS
   ===================================================================== */
function cineIntro9(){const X=X9;go9(1);cine9([{d:3.6,a:[X-34,15,42],b:[X+8,9,30],la:[X,1,-40],txt:'San Gregor, amanecer. La artillería no ha callado en toda la noche.'},{d:3.2,a:[X-42,1.7,4.4],b:[X-12,1.7,4.4],la:[X+25,1.2,3],txt:'Hombres agotados, barro hasta las rodillas… y la línea debe aguantar.'},{d:3.2,a:[X+4,2.3,2.4],b:[X+4,2.6,-3],la:[X,2,-85],txt:'Teniente Hollenstein: «¡A los parapetos! ¡Vienen por la tierra de nadie!»'}],null,
 [{t:.4,fn:()=>shell9(X-20,-50,1.2)},{t:1.5,fn:()=>shell9(X+30,-70,1.2)},{t:2.6,fn:()=>shell9(X+5,-35,1.3)},{t:4.5,fn:()=>shell9(X-40,-6,1)},{t:7.5,fn:()=>{sp9('mosin',X-8,-84,true);sp9('stv',X+6,-88,true);sp9('orcoE',X+16,-86,true)}}])}
function cineCav9(){const X=X9;for(const c of CAV)scene.remove(c.g);CAV.length=0;for(let i=0;i<8;i++)mkCav9(i,X+138+(i%2)*4,32-i*3.4);Object.assign(CAVS,{st:'arrive',t:0,n0:8,rx:X+28,rz:-114,home:[X+92,-100],fell:0,go:0,path:[[X+140,-20],[X+124,-78],[X+82,-108],[X+28,-114]],pi:0});const cp=()=>CAV[0].g.position;
 cine9([{d:3.2,a:[X+60,6,-60],b:[X+80,7,-50],la:[X+140,2,0],txt:'La radio crepita… y por el camino del este retumba el suelo: los húsares de Argentum.'},{d:3.2,a:c9(cp,-5,1.5,11),la:c9(cp,0,1.6,0),txt:'Capitán Argentum: «¡Por las Tres Coronas! ¡Abrid paso a la caballería!»'},{d:2.8,a:c9(cp,9,2.2,-6),la:c9(cp,0,2,0),lb:c9(cp,0,1.4,-20),txt:'Cubre la carga: elimina las ametralladoras y el blindado.'}],()=>{L9.stage=1;CAVS.go=1})}
function cineForest9(){const X=X9;go9(5);cine9([{d:3,a:[X,18,-196],b:[X+2,12,-222],la:[X,0,-262],txt:'El Bosque de Tannen. Las comunicaciones llevan horas muertas.'},{d:3,a:[X-6,2.4,-224],b:[X-4,2.2,-230],la:[X-30,1.4,-238],txt:'Silencio… y de pronto, siluetas entre los troncos.'},{d:2.6,a:c9(()=>officer.g.position,2.2,1.8,3),la:c9(()=>officer.g.position,0,1.6,0),txt:'Teniente Hollenstein: «¡Emboscada! ¡Cubríos y buscad sus observadores!»'}],null,[{t:3.2,fn:()=>{for(const e of enemies)if(!e.obs9)e.alert=0}}])}
function cineBridge9(){const X=X9;go9(7);cine9([{d:3.4,a:[X-34,13,-338],b:[X+8,10,-344],la:[X,0,-380],txt:'El Puente del Cuervo: el único paso de los refuerzos.'},{d:3,a:[X+9,2,-349],la:[X+3,1.2,-356],txt:'Ingenieros: «¡El camión está averiado! ¡Necesitamos tiempo!»'},{d:3,a:[X-14,3,-393],b:[X+10,3,-396],la:[X,1,-418],txt:'En la orilla norte se mueven saboteadores con cargas.'}],null)}
function cineFort9(){const X=X9;const tk=L9.truck;cine9([{d:3.4,a:[X+75,8,-415],b:[X+32,12,-448],la:[X,7,-520],txt:'La Fortaleza de las Tres Coronas. Y el enemigo ya la rodea.',fn:(dt)=>{tk.position.z-=6*dt}},{d:3,a:[X-62,17,-466],b:[X+62,17,-466],la:[X,4,-520],txt:'Torres de asedio, arietes y una bombarda arcana avanzan hacia los muros.'},{d:2.8,a:[X+60,6,-500],la:[X+140,3,-520],txt:'Teniente Hollenstein: «¡A las murallas! ¡Destruid sus máquinas!»'}],null,[{t:.05,must:true,fn:()=>go9(9)}])}
function cineRuins9(){const X=X9;cine9([{d:3.2,a:[X+14,4,-574],b:[X+6,3,-582],la:[X,2,-594],txt:'Bajo el monasterio, el suelo tiembla: el enemigo despierta algo antiguo.'},{d:3.2,a:[XU,3,ZU+52],b:[XU,4.5,ZU+30],la:[XU,5,ZU],txt:'Una cripta militar… construida sobre ruinas que nadie recuerda.'},{d:3,a:[XU-20,3,ZU+12],b:[XU+20,3,ZU+12],la:[XU,4,ZU-30],txt:'Tres resonadores alimentan la máquina. Destrúyelos antes de que abra la brecha.'}],null,
 [{t:2.2,fn:()=>{burst(X,2,-593.8,0xffa040,30,.8,10);snd(50,.8,'sawtooth',.15);shake=1.2}},{t:3.15,must:true,fn:()=>go9(11)}])}
function cineMachine9(){const g=L9.ring;cine9([{d:2.6,a:[XU+16,4,ZU+14],la:[XU,5,ZU],txt:'Sin resonadores, el corazón de la máquina se desboca…',fn:(dt)=>{L9.core.scale.setScalar(1.6+Math.sin(time*30)*.4)}},{d:2.4,a:[XU+18,6,ZU+18],la:[XU,4,ZU],txt:'¡La máquina estalla!',fn:(dt,u)=>{g.rotation.x+=dt*2;g.position.y=5-u*4}},{d:3,a:[XU,3,ZU+22],b:[XU,3.5,ZU+16],la:[XU,4,ZU-30],txt:'De la grieta emerge su guardián: el Coloso de las Tres Coronas.'}],()=>{L9.ph=12;go9(12)},
 [{t:2.6,fn:()=>{L9.core.visible=false;boom9(XU,ZU,2.2,false,0xff3060);flashLight(XU,6,ZU,9,1.5,0xff5070);shake=2.2;$('flash').style.transition='opacity .1s';$('flash').style.opacity=.8;setTimeout(()=>{$('flash').style.transition='opacity 1.5s';$('flash').style.opacity=0},120)}}])}
const FALL9=[];
function cineCollapse9(){L9.ph=13;story('');cine9([{d:3,a:[XU+12,3,ZU+6],la:[XU,6,ZU],txt:'El Coloso cae… y con él, la bóveda de la cripta.'},{d:3.4,a:[XU,2.4,ZU+30],b:[XU,2.4,ZU+44],la:[XU,1.5,ZU+56],txt:'Teniente Hollenstein: «¡Todos fuera! ¡Corred!»',fn:(dt,u)=>{allies.forEach((a,i)=>{a.g.position.z+=7*dt;walkPose(a.g,time*1.4)});if(officer){officer.g.position.z+=7*dt;walkPose(officer.g,time*1.4)}if(MED){MED.g.position.z+=7*dt;walkPose(MED.g,time*1.4)}}}],()=>cineTanks9(),
 [{t:.1,fn:()=>{for(const a of[...allies.map(q=>q.g),officer&&officer.g,MED&&MED.g])if(a){a.position.set(XU+(R()-.5)*6,0,ZU+24+R()*4);a.rotation.set(0,0,0)}}},...[...Array(14)].map((_,i)=>({t:.2+i*.4,fn:()=>{for(let k=0;k<3;k++){const m=new T.Mesh(gBox(1+R()*2,.6+R(),1+R()*2),new T.MeshLambertMaterial({color:0x8a8070,map:stoneTex}));m.position.set(XU+(R()-.5)*30,8,ZU+(R()-.5)*30);scene.add(m);FALL9.push({m,v:0,w:(R()-.5)*4})}shake=Math.max(shake,1);snd(60+R()*30,.5,'sawtooth',.1);burst(XU+(R()-.5)*20,6,ZU+(R()-.5)*20,0x8a8070,10,1,5)}}))])}
function cineTanks9(){const X=X9;L9.under=false;sky9('amanecer');for(const e of[...enemies]){scene.remove(e.g);disp16(e.g)}enemies.length=0;tele9(X,-492,Math.PI);for(const p of LT.pts)p.on=false;sectCull();
 for(let i=0;i<4;i++)sp9(['mosin','orcoE','stv','orcoH'][i],X-20+i*12,-455,true);const tks=[];for(let i=0;i<3;i++){const t=mkTank16(i===1?'hero':i?'st':'sh');t.position.set(X-12+i*12,0,-395-i*6);t.rotation.y=Math.PI;tks.push(t)}engine(true,.08);L9.tks=tks;
 L9.tick=dt=>{for(const t of tks){if(t.position.z>-462){t.position.z-=6*dt;tankAnim(t,6,dt)}else tankAnim(t,0,dt);tankMG(t,dt,60,{name:'La 4.ª División Blindada'},.6)}for(const e of enemies){e.t+=dt;animE(e,0,0,dt,false)}};
 cine9([{d:3,a:[X+2,.9,-470],la:[X,2,-400],txt:'Al amanecer, un rugido de motores llega desde el puente.'},{d:3,a:[X+16,3,-430],b:[X+16,3,-450],la:c9(()=>tks[1].position,0,2,0),txt:'La 4.ª División Blindada: los Hunyadi M.16 barren la llanura.'},{d:2.6,a:c9(()=>tks[1].position,2.6,5,-3),la:c9(()=>tks[1].position,0,3,12),txt:'El enemigo, sin su máquina ni su Coloso, se retira en desbandada.'}],()=>cineFinal9(),[{t:2.8,fn:()=>{const t=tks[1];tankMainGun(t,{g:{position:new T.Vector3(X-8,0,-455)}});setTimeout(()=>boom9(X-8,-455,1.3,false),250)}}])}
function cineFinal9(){const X=X9;engine(false);for(const e of[...enemies]){scene.remove(e.g);disp16(e.g)}enemies.length=0;for(const s of GAR)if(s.alive&&!s.retired){s.g.visible=true}
 L9.tick=dt=>{for(const s of GAR)if(s.alive&&s.g.visible){const u=s.u;u.aR.rotation.x=-2.6+Math.sin(time*6+s.i)*.3;u.aL.rotation.x=-2.4}};
 cine9([{d:3.4,a:[X,3,-470],b:[X,14,-455],la:[X,8,-540],txt:'Vargenkreuz resiste. Las Tres Coronas siguen en pie, heridas pero intactas.'},{d:3.4,a:[X-40,22,-470],b:[X+40,24,-480],la:[X,4,-525],txt:'Teniente Hollenstein: «Buen trabajo, Kovač. Hoy la Corona tiene tres veces más motivos para recordar sus nombres.»'},{d:3,a:[X+20,40,-420],b:[X,60,-400],la:[X,0,-540],txt:'OPERACIÓN TRES CORONAS — CUMPLIDA'}],()=>{L9.won=1;end(true)})}
/* =====================================================================
   BUCLE DEL CAP. IX
   ===================================================================== */
function fx9(dt){skyMesh.position.copy(cam.position);updParts(dt);smokeUpd(dt);tracerUpd(dt);fireUpd(dt);lightsUpd(dt);chUpd(dt);updRag(dt);shellUpd(dt);if(L9.tick)L9.tick(dt);if(L9.ph===2||L9.ph===3)cavUpd(dt);sectCull();if(L9.sails)L9.sails.rotation.z+=dt*.6;if(L9.water)L9.water.material.map.offset.x+=dt*.03;
 for(let i=FALL9.length-1;i>=0;i--){const f=FALL9[i];f.v-=22*dt;f.m.position.y+=f.v*dt;f.m.rotation.x+=f.w*dt;if(f.m.position.y<.4){f.m.position.y=.4;FALL9.splice(i,1)}}
 const F=L9.fog;if(F){const g=gasIn(),tc=g?new T.Color(0x6a7a3a):F.c,k=Math.min(1,dt*2);scene.fog.color.lerp(tc,k);scene.fog.near+=((g?2:F.n)-scene.fog.near)*k;scene.fog.far+=((g?24:F.f)-scene.fog.far)*k}}
function upd9main(dt){fx9(dt);garUpd(dt);doorsUpd(dt);gasUpd(dt);acUpd(dt);machUpd(dt);devUpd(dt);FG9.cd=Math.max(0,FG9.cd-dt);if(FG9.g){const u=FG9.g.userData;u.rec=(u.rec||0)*Math.pow(.02,dt);u.br.position.z=-.2+u.rec*.6}
 for(const e of enemies)if(e.hold){e.g.position.set(e.hold[0],e.hold[1],e.hold[2]);e.vx=e.vz=0}
 if(P.gun9){P.g.position.x=FG9.x;P.g.position.z=FG9.z+1.4;P.aim=1;const k=FG9.g;k.rotation.y=angL(k.rotation.y,yaw+Math.PI,1);$('ammo').textContent='CAÑÓN DE CAMPAÑA · '+(FG9.cd>0?'CARGANDO…':'LISTO')+' · USAR para bajar'}
 const ph=L9.ph;if(ph===1)upd1(dt);else if(ph===3)upd3(dt);else if(ph===5)upd5(dt);else if(ph===7)upd7(dt);else if(ph===9)upd9(dt);else if(ph===11)upd11(dt);else if(ph===12)upd12(dt);
 const near=FG9.g&&L9.ph===3&&!P.gun9&&Math.hypot(P.g.position.x-FG9.x,P.g.position.z-FG9.z)<3.6;if(near)$('pr').textContent='[E / USAR] Manejar el cañón de campaña';
 const ar=$('arrow');if(L9.obj){const pp=P.g.position,ddx=L9.obj[0]-pp.x,ddz=L9.obj[1]-pp.z,fx=-Math.sin(yaw),fz=-Math.cos(yaw),rx=Math.cos(yaw),rz=-Math.sin(yaw);ar.style.display='block';ar.style.transform='rotate('+(Math.atan2(ddx*rx+ddz*rz,ddx*fx+ddz*fz)*57.3)+'deg)'}else ar.style.display='none';
 if(L9.cine)return;const el=$('gar');const a=GAR.filter(s=>s.alive&&s.g.visible&&!s.retired).length,c=CAV.filter(q=>q.alive).length;el.style.display='block';el.innerHTML='ALIADOS <b>'+a+'</b>'+(c?' · CABALLERÍA <b>'+c+'/'+CAV.length+'</b>':'')+' · ✚ '+(MED&&!(MED.down>0)?'médico activo':'médico herido');
 ambUpd(dt,ph===1?.9:ph===5?.6:ph>=11?.4:.8)}
function startLevel9(){level=9;build9();clearStage();WC.x=X9+150;WC.z=-290;WC.r=560;mobs.forEach(m=>scene.remove(m.g));mobs=[];convoy.forEach(v=>scene.remove(v.g));convoy=[];spawnNPCs(9);lightsInit();for(const p of LT.pts)p.on=false;searchSet(false);
 if(officer){offModel();officer.name='Lt. Hollenstein';officer.g.visible=true}allies.forEach(a=>{if(a.name)a.g.visible=true});refill(6);P.g.visible=true;$('tc').style.display='block';playing=true;ambStart();
 bindFireLight(X9-30,1.2,14,0,0xff9040);bindFireLight(X9+22,1.2,20,1,0xff9040);L9.won=0;story('CAPÍTULO IX — OPERACIÓN TRES CORONAS');setTimeout(()=>story(''),2500);cineIntro9()}
/* integración: actualización, interacción, cinemáticas saltables, reaparición, final, menú */
const _up17=update;update=function(dt){if(level===9&&L9.cine&&playing){V16.dt=dt;time+=dt;cine9Upd(dt);fx9(dt);return}_up17(dt);if(!playing)return;enemyTactics(dt);medUpd(dt);if(level===9)upd9main(dt);
 if(!P.mg&&!P.gun9){const w=P.weapons[P.cur];if(P.cur==='rifle')$('ammo').textContent='MANNLICHER-MAUSER 8,98×66 · '+(P.rel>0?'RECARGANDO (peines)':w.mag+' / '+w.reserve);else if(P.cur==='smg')$('ammo').textContent='MP38 · TAMBOR 50 · '+(P.rel>0?'RECARGANDO':w.mag+' / '+w.reserve)}};
const _in17=interact;interact=function(){if(level===9&&playing&&!L9.cine){if(FG9.g&&L9.ph===3&&Math.hypot(P.g.position.x-FG9.x,P.g.position.z-FG9.z)<3.6){P.gun9=!P.gun9;P.aim=P.gun9?1:0;say(P.gun9?'Cañón de campaña: apunta y pulsa FUEGO. USAR para bajar.':'Dejas el cañón.',2.5);return}if(L9.relay&&Math.hypot(P.g.position.x-L9.relay.x,P.g.position.z-L9.relay.z)<3.6)return;if(L9.radioPos&&Math.hypot(P.g.position.x-L9.radioPos.x,P.g.position.z-L9.radioPos.z)<3.6)return;if(!nearMG()&&!P.mg)return}_in17()};
$('skip').addEventListener('click',()=>{if(level===9&&L9.cine)L9.skip=1});addEventListener('keydown',e=>{if(level===9&&L9.cine&&(e.code==='Enter'||e.code==='Space')){L9.skip=1;e.preventDefault()}});
const _rp17=respawnP;respawnP=function(){_rp17();if(level===9){P.gun9=false;P.g.position.set(L9.cp[0],0,L9.cp[1]+(L9.ph===11||L9.ph===12?0:4));P.g.position.y=0;P.mg=false}};
const _end17=end;end=function(w){_end17(w);if(w&&level===9){$('menu').querySelector('h1').textContent='LAS TRES CORONAS RESISTEN';$('tx').innerHTML='Las trincheras de San Gregor aguantaron el barro y el gas; los húsares de Argentum barrieron la llanura; el cerco de Tannen se rompió; el Puente del Cuervo dejó pasar a los refuerzos y la fortaleza resistió el asedio. Bajo el monasterio, la máquina del enemigo y su Coloso yacen sepultados.<br><br><b style="font-size:20px;color:#e0b050">PUNTUACIÓN: '+score+'</b><br>☠ Muertes: '+(typeof deathsN!=='undefined'?deathsN:0)+'<br><i>Fin de la Operación Tres Coronas.</i>'}};
$('lvsel').insertAdjacentHTML('beforeend','<option value="9">IX · OPERACIÓN TRES CORONAS — El Cerco de Vargenkreuz (nuevo)</option>');document.querySelector('#menu p b').textContent='1909 — Capítulos I–IX · v17 OPERACIÓN TRES CORONAS';
$('hs').insertAdjacentHTML('beforebegin','<p class="c" style="color:#9fd0ff">NUEVO v17 · Cap. IX «Operación Tres Coronas»: trincheras con gas y artillería, carga de húsares, cerco del bosque, Puente del Cuervo, asedio de la fortaleza y ruinas bajo el monasterio · fusil 8,98×66 de 10 tiros · MP38 de tambor · sable con combo de 5 · médico de escuadra · orcos, esqueletos y animaciones nuevas</p>');
const _g17=$('go').onclick;$('go').onclick=function(){if($('lvsel').value!=='9')return _g17();try{ac=new(window.AudioContext||window.webkitAudioContext)();if(ac.state==='suspended')ac.resume();startMusic()}catch(e){}assignBots();$('menu').style.display='none';P.g.visible=true;cam.fov=65;cam.updateProjectionMatrix();startLevel9();try{rend.domElement.requestPointerLock()}catch(e){}};
