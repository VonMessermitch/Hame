/* =====================================================================
   v21 · CUERPO A TIERRA, COBERTURAS, ANIMACIONES DE ARMAS,
   CATAFRACTOS, REFINERÍA Y CAMPAMENTO TOKOVSKY (Misión 0)
   ===================================================================== */
const V21={prK:0,peek:0,cvMsg:0};P.pr=false;P.cover=null;P.g.rotation.order='YXZ';
/* ---------- CUERPO A TIERRA Y ARRASTRARSE (Z / botón TUM) ---------- */
function prone(v){if(!playing||P.mg||P.veh)return;const n=v===undefined?!P.pr:v;if(n===P.pr)return;P.pr=n;if(n){P.cr=false;P.cover=null;P.roll=0;burst(P.g.position.x,.1,P.g.position.z,0x8a7a5a,6,.4,2);snd(140,.12,'triangle',.04);say('Cuerpo a tierra: avanzas arrastrándote (Z / TUM para levantarte).',1.6)}else snd(240,.1,'triangle',.03)}
const _pm21=pMove;pMove=function(sp,run,moving,dt){let s=_pm21(sp,run&&!P.pr,moving,dt);if(P.pr)s=Math.min(s,1.55);if(P.cover)s=Math.min(s,3.4);return s};
const _jp21=jump;jump=function(){if(P.pr){prone(false);return}if(P.cover){coverExit();}_jp21()};
const _cr21=crouch;crouch=function(v){if(P.pr){P.pr=false;P.cr=true;return}_cr21(v)};
const _ps21=pSpread;pSpread=function(){let k=_ps21();if(P.pr)k*=.25;else if(P.cover&&!P.cr)k*=.7;return k};
const _hp21=hitP;hitP=function(d){if(P.pr)d*=.6;if(P.cover&&P.cr)d*=.3;if(level===11)d*=.4;_hp21(d)};
const _fi21=fire;fire=function(){const n=bullets.length;if(P.cover)V21.peek=.7;_fi21();if(bullets.length>n){const b=bullets[bullets.length-1];if(P.pr)b.m.position.y-=.95;else if(P.cr)b.m.position.y-=.35}};
/* ---------- COBERTURAS (F / botón CUB): pegarse, desplazarse y asomarse ---------- */
function coverFind(){const p=P.g.position;let best=null,bd=2.4;
 for(const b of obstB){if(b.step||b.nolos||(b.y0||0)>.2||b.h<.75||b.h>2.6||b.hw>40||b.hd>40)continue;const cx=clamp(p.x,b.x-b.hw,b.x+b.hw),cz=clamp(p.z,b.z-b.hd,b.z+b.hd),d=Math.hypot(p.x-cx,p.z-cz);if(d<bd&&d>.01){bd=d;best={b,c:false,cx,cz,nx:(p.x-cx)/d,nz:(p.z-cz)/d,hi:b.h>1.7}}}
 for(const o of obst){if(o.r<.8||o.r>2.6)continue;const dx=p.x-o.x,dz=p.z-o.z,l=Math.hypot(dx,dz),d=l-o.r;if(d<bd&&l>.01){bd=d;best={b:o,c:true,cx:o.x+dx/l*o.r,cz:o.z+dz/l*o.r,nx:dx/l,nz:dz/l,hi:o.r>1.6}}}return best}
function coverEnter(){if(!playing||P.mg||P.veh)return;if(P.cover){coverExit();return}const c=coverFind();if(!c){say('No hay cobertura cerca.',1.2);return}P.pr=false;P.cover=c;P.cr=!c.hi;V21.peek=0;const p=P.g.position;p.x=c.cx+c.nx*.6;p.z=c.cz+c.nz*.6;burst(c.cx,.6,c.cz,0x9a8a6a,5,.3,2);snd(110,.1,'square',.04);if(V21.cvMsg++<2)say(c.hi?'A cubierto tras una cobertura alta: dispara asomándote.':'A cubierto: FUEGO para asomarte y disparar · aléjate o CUB para salir.',2.2)}
function coverExit(){if(!P.cover)return;P.cover=null;P.cr=false}
function coverUpd(dt){const c=P.cover;if(!c)return;if(P.roll>0||P.pr||P.mg||!playing){coverExit();return}const p=P.g.position,b=c.b;
 if(c.c){const dx=p.x-b.x,dz=p.z-b.z,l=Math.hypot(dx,dz)||1;c.cx=b.x+dx/l*b.r;c.cz=b.z+dz/l*b.r;c.nx=dx/l;c.nz=dz/l}else{c.cx=clamp(p.x,b.x-b.hw,b.x+b.hw);c.cz=clamp(p.z,b.z-b.hd,b.z+b.hd);const dx=p.x-c.cx,dz=p.z-c.cz,l=Math.hypot(dx,dz);if(l>.01){c.nx=dx/l;c.nz=dz/l}}
 if(obstB.indexOf(b)<0&&obst.indexOf(b)<0){coverExit();say('¡Tu cobertura ha volado!',1.5);return}
 const away=(P.mvx||0)*c.nx+(P.mvz||0)*c.nz;if(away>2.6){coverExit();return}const d=Math.hypot(p.x-c.cx,p.z-c.cz);if(d>.62||d<.5){p.x=c.cx+c.nx*.6;p.z=c.cz+c.nz*.6}
 V21.peek=Math.max(0,V21.peek-dt);if(firing||P.aim>.6)V21.peek=Math.max(V21.peek,.5);if(!c.hi)P.cr=!(V21.peek>0)}
/* coberturas de enemigos y aliados: la cobertura baja entre tirador y blanco detiene parte de los impactos */
function coverBetween(x,z,sx,sz,r){for(const b of obstB){if(b.step||(b.y0||0)>.2||b.h<.75||b.h>2.6||b.hw>40)continue;const cx=clamp(x,b.x-b.hw,b.x+b.hw),cz=clamp(z,b.z-b.hd,b.z+b.hd),d=Math.hypot(x-cx,z-cz);if(d<r&&((cx-x)*(sx-x)+(cz-z)*(sz-z))>0)return{x:cx,z:cz}}return null}
const _hu21=hurt;hurt=function(e,d,mode,by){if((mode==='b'||mode==='h')&&e&&e.hp>0&&!e.boss10&&(e.st==='cover'||e.st==='hide'||e.pin||e.cvOK)&&R()<.45){const p=e.g.position,s=by&&by.g?by.g.position:P.g.position,c=coverBetween(p.x,p.z,s.x,s.z,1.7);if(c){burst(c.x,1,c.z,0xc8b890,4,.25,3);if(R()<.3)snd(900+R()*500,.05,'square',.02);return}}return _hu21(e,d,mode,by)};
const _gd21=garDamage;garDamage=function(s,v,src,k){if(k!=='blast'&&src&&src.x!==undefined&&s.crouch>.4&&R()<.5){const c=coverBetween(s.g.position.x,s.g.position.z,src.x,src.z,1.7);if(c){burst(c.x,1,c.z,0xc8b890,3,.2,3);return}}return _gd21(s,v,src,k)};
/* la escuadra se pone a cubierto cuando hay varios enemigos cerca */
const _oai21=officerAI;officerAI=function(dt){_oai21(dt);const o=officer;if(!o||!o.g.visible||!playing)return;let n=0;const p=o.g.position;for(const e of enemies)if(e.active&&Math.hypot(e.g.position.x-p.x,e.g.position.z-p.z)<45)n++;if(n>=3&&o.mode==='advance'&&!(o.forced>0))o.mode='cover'};
/* ---------- ANIMACIONES DE DISPARO Y EMPUÑE (jugador) ---------- */
const _aP21=animP;animP=function(dt,mv,run){_aP21(dt,mv,run);if(level===11&&L11.ph!==0&&!P.mg&&!L11.arm.includes(P.cur)){for(const k in pW)pW[k].visible=false;pShield.visible=false;V20.r9.visible=false}const u=P.g.userData,bl=(a,b,w)=>a+(b-a)*w;V21.prK+=((P.pr?1:0)-V21.prK)*Math.min(1,dt*6);const pk=V21.prK;
 if(P.veh){P.g.rotation.x=0;u.l1.rotation.x=-1.4;u.l2.rotation.x=-1.4;u.k1.rotation.x=u.k2.rotation.x=1.4;return}
 if(pk>.01){V21.wasPr=1;P.g.rotation.x=1.42*pk;const moving=Math.hypot(P.mvx||0,P.mvz||0)>.4,t=time*6.5,aimN=P.aim>0||firing;
  if(aimN&&!moving){u.aR.rotation.set(bl(u.aR.rotation.x,-2.95,pk),.12,0);u.aL.rotation.set(bl(u.aL.rotation.x,-2.8,pk),-.42,0);u.eR.rotation.x=-.12;u.eL.rotation.x=-.2}
  else{const s=moving?Math.sin(t):0;u.aR.rotation.set(bl(u.aR.rotation.x,-2.5+s*.45,pk),.25,0);u.aL.rotation.set(bl(u.aL.rotation.x,-2.5-s*.45,pk),-.25,0);u.eR.rotation.x=-.6-Math.max(0,s)*.5;u.eL.rotation.x=-.6-Math.max(0,-s)*.5}
  const s2=moving?Math.sin(t+1.3):0;u.l1.rotation.x=bl(u.l1.rotation.x,s2*.35,pk);u.l2.rotation.x=bl(u.l2.rotation.x,-s2*.35,pk);u.k1.rotation.x=bl(u.k1.rotation.x,.3+Math.max(0,s2)*.9,pk);u.k2.rotation.x=bl(u.k2.rotation.x,.3+Math.max(0,-s2)*.9,pk);
  u.l1.rotation.z=bl(0,-.25,pk);u.l2.rotation.z=bl(0,.25,pk);u.b.position.y=bl(u.b.position.y,.8,pk);u.b.rotation.x=0;u.hd.rotation.x=bl(u.hd.rotation.x,-1.15,pk);return}
 if(V21.wasPr){V21.wasPr=0;P.g.rotation.x=0;u.l1.rotation.z=u.l2.rotation.z=0}
 if(P.pzfOn&&P.pzf>0||P.mg||P.roll>0||V16.thT>0||V16.swT>0||P.swT>=0||P.cur==='sword')return;
 const ak=u.ak||0,gun=P.cur==='rifle'||P.cur==='smg';
 if(gun&&P.rel<=0){/* postura de tiro a dos manos: mano izquierda bajo el guardamanos, mejilla en la culata, torso perfilado */
  u.aL.rotation.y=bl(u.aL.rotation.y,-.62,ak);u.eL.rotation.x=bl(u.eL.rotation.x,-.18,ak);u.hd.rotation.z=bl(u.hd.rotation.z,.13,ak);u.hd.rotation.y=bl(u.hd.rotation.y,-.1,ak);u.ch.rotation.y+=(-.16*ak-u.ch.rotation.y)*.4;
  if(P.cur==='rifle'&&P.bolt>0){/* ciclo del cerrojo: la mano derecha sube, tira y empuja */const tb=.4-P.bolt,q=tb<.06?0:tb<.36?Math.sin((tb-.06)/.3*Math.PI):0;u.aR.rotation.x+=.32*q;u.aR.rotation.y+=.34*q;u.eR.rotation.x-=.6*q;u.hd.rotation.z+=.05*q}
  if(P.rc>0){u.b.rotation.x-=P.rc*.05;if(P.cur==='smg'){u.aR.rotation.z=(R()-.5)*.06*P.rc;u.aL.rotation.z=(R()-.5)*.05*P.rc}}else u.aR.rotation.z=u.aL.rotation.z=0}
 if(P.cover){const c=P.cover;if(P.cr&&!(V21.peek>0)){u.b.rotation.x+=.12;u.hd.rotation.x+=.1}}};
/* ---------- ANIMACIONES DE DISPARO (vanguardia y guarnición) ---------- */
const _gs21=garShoot;garShoot=function(s,e){_gs21(s,e);if(s.kind!=='mg')s.bolt=s.kind==='rifle'?.55:0;s.kick=1};
const _gp21=garPose;garPose=function(s,dt){_gp21(s,dt);const u=s.u;if(!u||s.down>0)return;s.kick=Math.max(0,(s.kick||0)-dt*7);if(s.kick>0){u.ch.rotation.x-=s.kick*.08;u.aR.rotation.x-=s.kick*.1;u.aL.rotation.x-=s.kick*.06;if(s.kind==='mg'){u.aR.rotation.z=(R()-.5)*.05;u.ch.rotation.y=(R()-.5)*.03}}
 if(s.bolt>0){s.bolt-=dt;const t=.55-s.bolt,q=t<.1?0:t<.45?Math.sin((t-.1)/.35*Math.PI):0;u.aR.rotation.x+=.35*q;u.aR.rotation.y+=.3*q;u.eR.rotation.x-=.55*q}
 if(s.aim>0||s.peek>0){u.aL.rotation.y+=(-.55-u.aL.rotation.y)*Math.min(1,dt*8);u.hd.rotation.z=.1}else u.hd.rotation.z*=.9};
/* ---------- CATAFRACTOS: rodean líneas y obstáculos por los pasos ---------- */
const _cm21=cavMove;cavMove=function(c,tx,tz,sp,dt){if(level===10){const w=route10(c,tx,tz);if(w){tx=w[0];tz=w[1]}}return _cm21(c,tx,tz,sp,dt)};
const _lh21=lanceHit;lanceHit=function(c,e){_lh21(c,e);if(e.hp<=0&&R()<.4)feed('⚡ '+c.name+' ensarta '+(e.k8n||'a un enemigo'))};
/* ---------- controles: Z / TUM (tumbarse), F / CUB (cobertura) ---------- */
$('tc').insertAdjacentHTML('beforeend','<div id="btu" class="t">TUM</div><div id="bcv" class="t">CUB</div>');
document.head.insertAdjacentHTML('beforeend','<style>#btu{right:190px;bottom:92px;width:52px;height:52px;color:#c8e0a0}#bcv{right:250px;bottom:30px;width:52px;height:52px;color:#a0d0e8}@media (max-height:500px){#btu{right:156px;bottom:70px;width:46px;height:46px}#bcv{right:210px;bottom:16px;width:46px;height:46px}}</style>');
$('btu').addEventListener('touchstart',e=>{prone();e.preventDefault()},{passive:false});$('bcv').addEventListener('touchstart',e=>{coverEnter();e.preventDefault()},{passive:false});
addEventListener('keydown',e=>{if(!playing||V16.paused)return;if(e.code==='KeyZ'){prone();e.preventDefault()}if(e.code==='KeyF'){coverEnter();e.preventDefault()}});
/* =====================================================================
   REFINERÍA DE ALEJANDRÍA Y MISCELÁNEOS DEL CAP. X
   ===================================================================== */
const PJ10=[],VENT21=[];
function tankCar(x,z){const g=new T.Group(),q=PB();pBox(q,2.6,.3,9,0x2a2a26,0,1,0);pCyl(q,1.3,1.3,8.6,0x2a2e30,0,2.3,0,1.5708,0,0,14);pCyl(q,.5,.5,.5,0x3a3a36,0,3.7,0,0,0,0,10);for(const s of[-1,1])for(const t of[-3,3])pCyl(q,.45,.45,.25,0x1a1a1a,s*1.05,.5,t,0,0,1.5708,10);pBox(q,2.7,.06,.4,0xc8b020,0,2.3,4.33);pbMesh(q,g,VCV);g.position.set(x,0,z);g.rotation.y=1.5708;scene.add(g);obstB.push({x,z,hw:4.5,hd:1.3,h:3.6});return g}
function pumpjack(x,z,r){const g=new T.Group(),q=PB();pBox(q,5,.3,1.6,0x3a3a36,0,.15,0);for(const s of[-1,1])pBox(q,.15,3,.15,0x5a5a52,0,1.6,s*.5,s*.15);pBox(q,1.2,.8,1,0x6a4a2a,-1.8,.6,0);pbMesh(q,g,VCV);const bm=new T.Group();bm.position.y=3.1;g.add(bm);{const b=PB();pBox(b,5,.3,.3,0x8a7a2a,0,0,0);pBox(b,.3,1.4,.9,0x8a7a2a,2.5,-.5,0,0,0,.2);pCyl(b,.03,.03,2.6,0x111111,2.8,-1.9,0,0,0,0,4);pbMesh(b,bm,VCV)}g.position.set(x,0,z);g.rotation.y=r||0;scene.add(g);obstB.push({x,z,hw:2.6,hd:.9,h:3});PJ10.push({g,bm,ph:R()*6});return g}
const _b21=build10;build10=function(){if(L10.built)return;_b21();const X=X10;
 sect10('Refinería II',X,-590,100,()=>{
  /* antorcha de gas */ for(let i=0;i<6;i++){cp(.14,.14,4.6,0x5a5a52,X-92+((i&1)?1.2:-1.2),2.3+i*4.4,-640+((i&2)?1.2:-1.2))}cp(.5,.6,28,0x6a6a62,X-92,14,-640);box(2.6,.3,2.6,0x3a3a36,X-92,27.6,-640);mkFire(X-92,-640,1.6,28.3,-1);obstB.push({x:X-92,z:-640,hw:1.4,hd:1.4,h:28});
  /* columnas de destilación con plataformas */ for(const [x,z,h] of[[85,-632,22],[-100,-610,18],[100,-575,16]]){cp(2,2.3,h,0x9a9a92,X+x,h/2,z);for(let i=1;i<h/4;i++){cp(2.9,2.9,.25,0x4a4a42,X+x,i*4,z);for(let a=0;a<8;a++)box(.08,1,.08,0x3a3a36,X+x+Math.cos(a*.785)*2.8,i*4+.5,z+Math.sin(a*.785)*2.8)}PR.ladder(X+x+2.3,0,z,h-1,0);ob(X+x,z,2.5)}
  /* racks de tuberías elevadas */ for(const z of[-548,-616]){for(let x=-60;x<=60;x+=10){box(.3,5,.3,0x4a4a42,X+x,2.5,z-1);box(.3,5,.3,0x4a4a42,X+x,2.5,z+1);box(.3,.3,2.3,0x4a4a42,X+x,5,z)}for(let i=0;i<4;i++){const m=cp(.22+i*.05,.22+i*.05,122,[0x6a5a3a,0x5a5a62,0x8a3a2a,0x5a6a5a][i],X,5.4+i*.1,z-.8+i*.55);m.rotation.z=1.5708}}
  /* vagones cisterna en el apartadero */ const sl=new T.InstancedMesh(gBox(.4,.15,3.2),new T.MeshLambertMaterial({color:0x4a3220}),90),mm=new T.Matrix4();for(let i=0;i<90;i++){mm.makeTranslation(X-125+i*.9,.08,-520);sl.setMatrixAt(i,mm)}scene.add(sl);for(const s of[-.75,.75])box(82,.14,.12,0x6a6a6a,X-84,.2,-520+s);tankCar(X-80,-520);tankCar(X-91,-520);tankCar(X-102,-520);
  /* oficinas de la refinería */ box(14,8,9,0xffffff,X-38,4,-535,0,0,rt_(brickT,4,2));box(15,.5,10,0x3a3430,X-38,8.2,-535);for(let i=0;i<5;i++)for(const y of[2.2,5.6]){box(1.4,1.6,.1,0x1a2430,X-44+i*3,y,-530.44,0,0x0a1420);box(1.6,.12,.14,0xd8d0c0,X-44+i*3,y-.86,-530.4)}box(8,1.2,.1,0x1a1a1a,X-38,7.2,-530.4);box(7.6,.9,.12,0xc8a830,X-38,7.2,-530.36);obstB.push({x:X-38,z:-535,hw:7,hd:4.5,h:8.2});
  /* chimenea de ladrillo */ cp(1.4,2,26,0xffffff,X+20,13,-648);box(3.4,1,3.4,0x5a3a2a,X+20,1,-648,0,0,brickT);ob(X+20,-648,2.2);
  /* charcos de crudo, bidones, cajas, farolas, extintores y carteles */ for(let i=0;i<10;i++){const m=mesh(new T.CircleGeometry(1.5+R()*2.5,14),0x0a0806,X+(R()-.5)*170,.04,-520-R()*120);m.rotation.x=-1.5708}
  for(let i=0;i<8;i++){const x=X+(R()-.5)*160,z=-525-R()*110;for(let k=0;k<5;k++)PR.barrel(x+(k%3)*1.1,z+(k>2?1.1:0));PR.stack(x+4,z,R())}
  for(let i=0;i<10;i++){const x=X-90+i*20,z=i%2?-560:-600;cp(.12,.16,7,0x2a2a2a,x,3.5,z);box(1.4,.2,.4,0x2a2a2a,x+.6,7,z);box(.6,.25,.4,0xffe8a0,x+1.1,6.82,z,0,0xffd060)}
  for(let i=0;i<6;i++){const x=X-70+i*28,z=-596+(i%2)*40;cp(.18,.18,.7,0xc02020,x,.35,z);box(.9,.6,.05,0xe0c020,x+.8,1.6,z);box(.05,1.6,.05,0x3a3a3a,x+.8,.8,z)}
  for(const [x,z] of[[-20,-560],[25,-585],[-55,-625],[60,-612]])box(1.2,.8,1.2,0x5a5a52,X+x,.4,z)});
 for(const [x,z] of[[-20,-560],[25,-585],[-55,-625],[60,-612]])VENT21.push({x:X+x,z,t:R()*2});
 pumpjack(X-130,-545,.3);pumpjack(X-134,-578,-.2);pumpjack(X-128,-612,.5);
 /* misceláneos por sector: costa, trincheras, desierto, minas y explanada */
 sect10('Misceláneos',X,-250,330,()=>{
  for(let i=0;i<12;i++){const x=X-60+i*11,z=-30.5;box(.5,.5,.5,0x6a5a3a,x,.25,z+4.5,0,0,woodTex);box(.3,.25,.6,0x4a5a3a,x+.6,.13,z+4.5)}
  for(let i=0;i<8;i++){const x=X+(R()<.5?-1:1)*(10+R()*50),z=-15-R()*90;box(.08,1.4,.08,0x4a3018,x,.7,z);box(1.1,.32,.05,0xd8c8a0,x+.4,1.25,z);box(.6,.4,.4,0x3a3a2a,x+1.4,.2,z+.6)}
  for(let i=0;i<4;i++){const x=X-40+i*25,z=-12;box(.4,.25,.3,0x2a2a2a,x,.9,z);box(.05,.9,.05,0x4a3018,x,.45,z);cp(.04,.04,.2,0x1a1a1a,x+.12,1.1,z,0)}
  for(let i=0;i<14;i++){const z=-125-i*10;box(.25,7,.25,0x5a4030,X+62,3.5,z);box(1.6,.12,.12,0x5a4030,X+62,6.6,z)}
  {const g=X+28,z=-150;box(2.4,1.2,5,0x2a2420,g,.6,z);box(2.2,1.3,1.8,0x1a1614,g,1.6,z+1.4);for(const s of[-1,1])for(const t of[-1.6,1.6])cp(.5,.5,.3,0x111111,g+s*1.2,.5,z+t);ob(g,z,2.6)}
  for(let i=0;i<10;i++){const x=X+(R()-.5)*120,z=-285-R()*100;mesh(new T.ConeGeometry(.8+R(),1.2+R(),6),0x5a4a3a,x,.6,z,0,0,stoneTex)}
  for(let i=0;i<6;i++){const x=X+(R()<.5?-1:1)*(25+R()*40),z=-280-R()*110;box(.15,.15,.15,0x7ad0ff,x,1+R(),z,0,0x3a90ff)}
  for(let i=0;i<5;i++){const x=X+(R()-.5)*200,z=-455-R()*35;PR.flag(x,z,0x3a3a30,5)}
  for(let i=0;i<4;i++){const x=X-60+i*40,z=-470;box(3,.2,1.6,0x5a4630,x,.7,z,0,0,woodTex);for(const s of[-1,1])cp(.5,.5,.12,0x3a2a1a,x+s*1.4,.5,z+.9,0,0)}});
 SECT10[SECT10.length-1].misc=1};
const _fx21=fx10;fx10=function(dt,cine){_fx21(dt,cine);for(const p of PJ10){p.ph+=dt*1.6;p.bm.rotation.z=Math.sin(p.ph)*.32}
 for(const v of VENT21){v.t-=dt;if(v.t<=0){v.t=.6+R()*.6;if(Math.abs(P.g.position.z-v.z)<120)smoke(v.x,1,v.z,1.2,2,0xd8d8d0,.8,.35)}}
 V21.chT=(V21.chT||0)-dt;if(V21.chT<=0&&L10.ph>=5){V21.chT=.5;smoke(X10+20,27,-648,3,4,0x1a1614,1.6,.5)}};
/* el sector de misceláneos abarca todo el mapa: se reparte la visibilidad por distancia en el culling general */
const _cu21=cull10;cull10=function(){_cu21();const S=SECT10.find(s=>s.misc);if(S){const p=P.g.position;for(const o of S.objs){if(!o.userData._p){o.updateMatrixWorld&&o.updateMatrixWorld(true);const bs=o.geometry&&(o.geometry.boundingSphere||(o.geometry.computeBoundingSphere(),o.geometry.boundingSphere));o.userData._p=bs?bs.center.clone().applyMatrix4(o.matrixWorld):new T.Vector3()}const q=o.userData._p;o.visible=Math.abs(q.z-p.z)<150||(bsR(o)>80)}}};
function bsR(o){const b=o.geometry&&o.geometry.boundingSphere;return b?b.radius:0}
/* =====================================================================
   MISIÓN 0 · CAMPAMENTO TOKOVSKY — «El que no sabe marchar, tampoco sabe morir»
   Eisenmark 1922 · distrito militar de Tokovsky. Nivel interno 11.
   ===================================================================== */
const X11=27000;const L11={built:false,ph:0,st:0,t:0,arm:[],nades:false,cp:[X11-15,38],work:null,ord:'seguir',ex:0};
const CAMP={coat:0x404a56,pants:0x2e3640,helm:0x3a4148,cap:0x3a4450};
/* ---------- utilidades de modelo ---------- */
function bar11(x,z,w,d,col){const H=3.2;box(w,H,d,col||0xffffff,x,H/2,z,0,0,rt_(woodTex,w/4,1));for(const s of[-1,1]){const r=box(w+1,.2,d/2+1.2,0x3a3028,x,H+.9,z+s*(d/4+.25),0,0,woodTex);r.rotation.x=s*.42}box(w+.2,1.8,.2,0x4a3a2a,x,H+.55,z);for(let i=0;i<Math.floor(w/4);i++)for(const s of[-1,1])box(1.1,.9,.08,0x1a2028,x-w/2+2+i*4,1.9,z+s*(d/2+.02),0,0x0a1018);box(1.4,2.3,.1,0x3a2818,x,1.15,z+d/2+.04);cp(.35,.35,2,0x4a4a4a,x+w/2-1.5,H+1.6,z);obstB.push({x,z,hw:w/2,hd:d/2,h:H+1})}
function tgt11(x,z,o){o=o||{};const g=new T.Group(),q=PB(),c=o.col||0xd8c8a0;pBox(q,.12,.9,.12,0x4a3018,0,.45,0);pBox(q,.62,1.05,.06,c,0,1.4,0);pCyl(q,.2,.2,.06,c,0,2.08,0,1.5708,0,0,12);pCyl(q,.13,.13,.07,0x1a1a1a,0,1.45,.01,1.5708,0,0,10);pCyl(q,.06,.06,.08,0xc02020,0,1.45,.02,1.5708,0,0,8);if(o.mark)pBox(q,.62,.16,.07,o.mark,0,.98,.01);pbMesh(q,g,VCV);
 g.position.set(x,0,z);g.rotation.y=o.ry||0;scene.add(g);const t={g,x,z,up:true,hits:0,id:o.id,on:o.on||null,mv:o.mv||null,ph:R()*6,base:x,col:o.col,name:o.name};TG11.push(t);
 HIT9.push({x:()=>g.position.x,z:()=>g.position.z,y0:.8,y1:2.3,r:.45,ok:()=>t.up&&level===11,dmg:(v,k)=>tgtHit(t,k)});return t}
const TG11=[];
function tgtHit(t,k){if(!t.up)return;t.up=false;t.hits++;t.fall=0.001;snd(520+R()*120,.08,'square',.05);burst(t.g.position.x,1.5,t.g.position.z,0xd8c8a0,6,.25,4);if(t.on)t.on(t,k)}
function tgtUp(t){t.up=true;t.fall=0;t.g.rotation.x=0}
function tgtUpd(dt){for(const t of TG11){if(t.fall>0&&t.fall<1){t.fall=Math.min(1,t.fall+dt*4);t.g.rotation.x=-1.45*t.fall}if(t.mv&&t.up){t.ph+=dt*t.mv[1];t.g.position.x=t.base+Math.sin(t.ph)*t.mv[0]}}}
/* ---------- tren militar ---------- */
function mkTrain11(){const g=new T.Group();{const q=PB(),K=0x1e2224,R_=0x7a1a1a;pCyl(q,1.1,1.1,7,K,0,2.3,0,0,0,1.5708,14);pBox(q,2.6,.4,10,0x2a2a2a,0,1,0);pBox(q,2.6,2.8,2.6,K,0,2.6,-3.6);pBox(q,2.8,.2,2.8,0x3a3a3a,0,4.1,-3.6);for(const s of[-1,1])pBox(q,.1,.9,.9,0x1a2028,s*1.31,3,-3.6);pCyl(q,.35,.45,1.4,K,0,3.9,2.4,0,0,0,10);pCyl(q,.5,.4,.3,K,0,4.6,2.4,0,0,0,10);pCyl(q,.4,.4,.6,0xb08a30,0,3.5,.4,0,0,0,10);pBox(q,2.4,.5,.6,R_,0,.9,5.1);pa(q,gCone(.9,1.2,4),0x3a3a3a,0,.7,5.7,1.5708,0,.785);pCyl(q,.25,.25,.1,0xffe8a0,0,2.6,4.5,1.5708,0,0,10);
 for(const s of[-1,1])for(const z of[-2.6,-.6,1.4,3.4])pCyl(q,.65,.65,.2,0x2a2a2a,s*1.15,.65,z,0,0,1.5708,12);pBox(q,.1,.1,6,0x8a8a80,1.2,.65,.4);pbMesh(q,g,VCV)}
 const ten=new T.Group();ten.position.z=-8.3;g.add(ten);{const q=PB();pBox(q,2.6,2,5,0x2a2e30,0,1.9,0);pBox(q,2.4,.6,4.6,0x111111,0,3.1,0);for(const s of[-1,1])for(const z of[-1.6,1.6])pCyl(q,.5,.5,.2,0x2a2a2a,s*1.15,.55,z,0,0,1.5708,10);pbMesh(q,ten,VCV)}
 const W=[];for(let i=0;i<4;i++){const w=new T.Group();w.position.z=-15-i*9.2;g.add(w);const q=PB();pBox(q,2.8,2.8,8.4,0x5a3a26,0,2.3,0);pBox(q,3,.25,8.6,0x3a2a1a,0,3.8,0);for(const s of[-1,1]){pBox(q,.06,2.2,2.6,0x4a2e1c,s*1.43,2.2,0);for(const z of[-2.8,2.8])pCyl(q,.48,.48,.2,0x2a2a2a,s*1.15,.5,z,0,0,1.5708,10)}pBox(q,2.82,.4,.1,0xd8c8a0,0,3.1,4.22);pbMesh(q,w,VCV);W.push(w)}
 g.rotation.y=-1.5708;scene.add(g);return{g,W}}
/* ---------- NPC del campamento: actividades animadas ---------- */
const NPC11=[];
function npc11(x,z,o){o=o||{};const g=mkSoldier({coat:o.coat||CAMP.coat,pants:CAMP.pants,hat:o.hat||'cap',hatC:o.hatC||CAMP.cap,tab:GARNET,rank:o.rank||0,pack:!!o.pack,officer:!!o.officer,puttee:0x3a3a36,face:o.face});
 gear20(g,{helm:o.hat==='helm'?(o.hatC||CAMP.helm):undefined,web:o.web!==false,boots:true,peak:o.peak,monocle:o.monocle,mapcase:o.mapcase,armband:o.armband,medbag:o.medbag,tools:o.tools});
 if(o.gun)g.userData.mR.add(o.gun==='mg'?mkEwMG12():mkEwR9(false));if(o.cig){const c=new T.Mesh(gBox(.015,.015,.09),new T.MeshBasicMaterial({color:0xf0e8d8}));c.position.set(.05,.07,.21);g.userData.hd.add(c);const e=new T.Mesh(gBox(.02,.02,.02),new T.MeshBasicMaterial({color:0xff6020}));e.position.set(.05,.07,.26);g.userData.hd.add(e)}
 g.position.set(x,0,z);g.rotation.y=o.f||0;scene.add(g);const n={g,u:g.userData,act:o.act||'idle',t:R()*9,f:o.f||0,name:o.name||'Recluta',path:o.path||null,pi:0,sp:o.sp||1.6,vx:0,vz:0,tgt:null,lv:11};NPC11.push(n);return n}
function npcAnim11(n,dt){const u=n.u,a=n.act,t=(n.t+=dt),bl=(x,y,w)=>x+(y-x)*w,k=Math.min(1,dt*8);let L1=0,L2=0,K1=0,K2=0,AR=-.15,AL=-.15,ER=-.2,EL=-.2,ARY=0,ALY=0,BY=.8,BX=0,HX=0,HY=0,GY=0;
 const mv=Math.hypot(n.vx,n.vz);if(mv>.3||a==='march'||a==='run'){const sp=a==='run'||mv>3.2?13:9,ph=t*sp;L1=Math.sin(ph)*(sp>10?.8:.55);L2=-L1;K1=Math.max(0,Math.sin(ph+1.4))*.8;K2=Math.max(0,Math.sin(ph+4.5))*.8;AR=-L1*.5;AL=L1*.5;if(a==='march'){AR=-2.7;ER=-1.9;ARY=.2;AL=L1*.7}}
 if(a==='salute'){AR=-2.45;ARY=.6;ER=-2.1}else if(a==='point'){AR=-1.5;ARY=-.2;ER=-.05;AL=.25;EL=-.6}else if(a==='behind'){AR=.35;AL=.35;ER=-.9;EL=-.9;ARY=.3;ALY=-.3}
 else if(a==='sit'||a==='clean'||a==='eat'||a==='smokesit'){L1=L2=-1.5;K1=K2=1.5;BY=.42;if(a==='clean'){AR=-.9+Math.sin(t*5)*.25;AL=-1;ER=-1.2;EL=-1.1;ALY=-.4}if(a==='eat'){const q=Math.max(0,Math.sin(t*1.6));AR=-.6-q*1.3;ER=-.6-q*1.6;AL=-.7;EL=-1}if(a==='smokesit'){const q=Math.max(0,Math.sin(t*.8));AR=-.4-q*1.6;ER=-.4-q*1.8;if(q>.95&&R()<dt*3)smoke(n.g.position.x,1.5,n.g.position.z,.2,.6,0xd0d0d0,.3,.3)}}
 else if(a==='smoke'){const q=Math.max(0,Math.sin(t*.8));AR=-.3-q*1.7;ER=-.3-q*1.9;AL=.3;EL=-.8;ALY=-.3;if(q>.95&&R()<dt*3)smoke(n.g.position.x,1.85,n.g.position.z,.2,.6,0xd0d0d0,.3,.3)}
 else if(a==='argue'){AR=-.8+Math.sin(t*4.2)*.6;ARY=Math.sin(t*2.3)*.5;ER=-1+Math.sin(t*5)*.4;AL=-.5+Math.cos(t*3.6)*.5;HY=Math.sin(t*1.7)*.3;BX=.08}
 else if(a==='aim'){AR=-1.42;ER=-.15;AL=-1.35;ALY=-.55;EL=-.2;HY=-.08}
 else if(a==='faint'){GY=0}else if(a==='laugh'){BX=-.1+Math.sin(t*14)*.06;AR=-.3;AL=-.3;HX=-.3}else if(a==='vomit'){BX=.55+Math.sin(t*6)*.08;HX=.4;AR=-.6;AL=-.6;L1=-.2;L2=-.2}else if(a==='crouch'){L1=-1.2;L2=-.35;K1=1.5;K2=1.7;BY=.45}
 else if(a!=='walk'&&mv<.3){AR=-.15+Math.sin(t*1.3)*.02;AL=-.15-Math.sin(t*1.3)*.02}
 u.l1.rotation.x=bl(u.l1.rotation.x,L1,k);u.l2.rotation.x=bl(u.l2.rotation.x,L2,k);u.k1.rotation.x=bl(u.k1.rotation.x,K1,k);u.k2.rotation.x=bl(u.k2.rotation.x,K2,k);u.aR.rotation.x=bl(u.aR.rotation.x,AR,k);u.aL.rotation.x=bl(u.aL.rotation.x,AL,k);u.aR.rotation.y=bl(u.aR.rotation.y,ARY,k);u.aL.rotation.y=bl(u.aL.rotation.y,ALY,k);u.eR.rotation.x=bl(u.eR.rotation.x,ER,k);u.eL.rotation.x=bl(u.eL.rotation.x,EL,k);u.b.position.y=bl(u.b.position.y,BY,k);u.b.rotation.x=bl(u.b.rotation.x,BX,k);u.hd.rotation.x=bl(u.hd.rotation.x,HX,k);u.hd.rotation.y=bl(u.hd.rotation.y,HY,k);
 if(a==='faint'){n.g.rotation.x+=(-1.5-n.g.rotation.x)*Math.min(1,dt*5);n.g.position.y=.2}else if(n.g.rotation.x){n.g.rotation.x*=.8;n.g.position.y=0}}
function npcUpd11(dt){const pp=P.g.position;for(const n of NPC11){if(n.lv!==level||!n.g.visible)continue;const p=n.g.position;
 if(n.tgt){const d=navMove(n,n.tgt[0],n.tgt[1],n.sp,dt,.8);if(d<1){n.tgt=null;n.vx=n.vz=0}else n.g.rotation.y=angL(n.g.rotation.y,Math.atan2(n.vx,n.vz),Math.min(1,dt*6))}
 else if(n.path){const w=n.path[n.pi%n.path.length],dx=w[0]-p.x,dz=w[1]-p.z,d=Math.hypot(dx,dz);if(d<1)n.pi++;else{n.vx=dx/d*n.sp;n.vz=dz/d*n.sp;p.x+=n.vx*dt;p.z+=n.vz*dt;n.g.rotation.y=angL(n.g.rotation.y,Math.atan2(dx,dz),Math.min(1,dt*5))}}
 else{n.vx*=.8;n.vz*=.8;if(n.look){n.g.rotation.y=angL(n.g.rotation.y,Math.atan2(n.look[0]-p.x,n.look[1]-p.z),Math.min(1,dt*4))}else n.g.rotation.y=angL(n.g.rotation.y,n.f,Math.min(1,dt*3))}
 if(Math.hypot(p.x-pp.x,p.z-pp.z)<90||L9.cine)npcAnim11(n,dt)}}
/* ---------- diálogo con cola (subtítulos con nombre) ---------- */
const DLG={q:[],t:0};
function talk(lines,clear){if(clear){DLG.q.length=0;DLG.t=0}for(const l of lines)DLG.q.push(l);while(DLG.q.length>5&&typeof DLG.q[0]!=='function')DLG.q.shift()}
function dlgUpd(dt){if(DLG.t>0){DLG.t-=dt;return}const l=DLG.q.shift();if(!l)return;if(typeof l==='function'){l();return}const d=l[2]||Math.max(2.4,l[1].length*.055);say((l[0]?l[0]+': ':'')+'«'+l[1]+'»',d);DLG.t=d+.2;if(l[0]==='Koller'&&KOL)KOL.act=KOL.act==='behind'||KOL.act==='idle'?'point':KOL.act;}
function kol(t,d){talk([['Koller',t,d]])}
/* ---------- MAPA DEL CAMPAMENTO (sur → norte): andén y vía, patio, barracones, cantina,
   enfermería, cuartel, establos, carbonera, torre, circuito de obstáculos (este), polígono
   de tiro (noroeste), trinchera de instrucción (norte), estaciones de armas (noreste),
   parque de vehículos (sureste), pueblo de prácticas y «Sector Norte» ---------- */
const DOOR11={};let GRD11=null;
function build11(){if(L11.built)return;L11.built=true;const X=X11;sBegin();
 {const g=new T.PlaneGeometry(520,460,60,50);g.rotateX(-1.5708);const pos=g.attributes.position,col=new Float32Array(pos.count*3),c=new T.Color();for(let i=0;i<pos.count;i++){const x=pos.getX(i),z=pos.getZ(i)-90;const r=Math.hypot(x,z+90);pos.setY(i,r>215?(r-215)*.25*(1+Math.sin(x*.07)*.4):Math.sin(x*.08)*Math.cos(z*.06)*.12);c.setHex(r>205?0x3a4a2a:Math.abs(x)<28&&Math.abs(z)<20?0x8a8070:0x5a5a3a).lerp(new T.Color(0x4a4030),R()*.5);col[i*3]=c.r;col[i*3+1]=c.g;col[i*3+2]=c.b}
  g.setAttribute('color',new T.BufferAttribute(col,3));g.computeVertexNormals();GRD11=new T.Mesh(g,new T.MeshLambertMaterial({vertexColors:true,map:rt_(sandTex,40,36)}));GRD11.position.set(X+20,0,-90);scene.add(GRD11)}
 /* vía férrea y andén */ {const sl=new T.InstancedMesh(gBox(3.2,.15,.4),new T.MeshLambertMaterial({color:0x3a2a1a}),300),mm=new T.Matrix4();for(let i=0;i<300;i++){mm.makeTranslation(X-200+i*1.35,.08,48);sl.setMatrixAt(i,mm)}scene.add(sl)}for(const s of[-.75,.75])box(410,.14,.12,0x6a6a6a,X,.2,48+s);
 box(70,.6,6,0x8a8478,X-15,.3,42,0,0,rt_(concT,14,1));obstB.push({x:X-15,z:42,hw:35,hd:3,h:.6,step:true});for(let i=0;i<6;i++){cp(.12,.12,3.4,0x2a2a2a,X-45+i*12,2,40);box(1,.3,.3,0x2a2a2a,X-45+i*12,3.6,40)}box(10,3.4,5,0xffffff,X-38,1.7,36,0,0,rt_(brickT,3,1));box(11,.4,6,0x3a3028,X-38,3.6,36);box(3,.6,.1,0x1a1a1a,X-38,2.8,38.55);box(2.8,.45,.12,0xd8d0b0,X-38,2.8,38.5);obstB.push({x:X-38,z:36,hw:5,hd:2.5,h:3.6});
 /* patio de formación, mástil y cuartel */ box(56,.06,40,0x8a8070,X,.03,0,0,0,rt_(cobT,12,9));cp(.12,.16,12,0x8a8a80,X,6,-16);box(2.4,1.5,.05,0x3a4450,X+1.25,11,-16);box(2.4,.3,.06,GARNET,X+1.25,11.4,-16);
 box(18,6,9,0xffffff,X,3,-28,0,0,rt_(brickT,6,2));box(19,.5,10,0x3a3028,X,6.3,-28);for(let i=0;i<6;i++)box(1.2,1.6,.1,0x1a2028,X-7.5+i*3,3.5,-23.45,0,0x101820);box(2,3,.1,0x3a2818,X,1.5,-23.45);box(6,.8,.1,0x2a2a2a,X,5.2,-23.42);obstB.push({x:X,z:-28,hw:9,hd:4.5,h:6.5});
 /* barracones, cantina, enfermería, establos, carbonera y torre */ bar11(X-55,12,26,8);bar11(X-55,-4,26,8);bar11(X-55,-20,26,8);bar11(X+32,18,20,8);
 bar11(X-25,28,14,9,0xc8b898);for(let i=0;i<3;i++){box(4,.12,1.4,0x6a4a2a,X-30+i*5,.9,22.5,0,0,woodTex);for(const s of[-1,1])box(4,.1,.4,0x5a3a20,X-30+i*5,.5,22.5+s*1.1,0,0,woodTex)}
 bar11(X+25,28,14,9,0xe8e0d0);box(1.6,.4,.1,0xc02020,X+25,2.6,32.6);box(.4,1.6,.1,0xc02020,X+25,2.6,32.62);
 for(let i=0;i<4;i++){box(3.2,2.4,.2,0x5a4030,X-100,1.2,-4-i*4,0,0,woodTex)}box(.3,2.6,18,0x4a3020,X-97,1.3,-10);box(8,.2,18,0x3a3028,X-100,2.8,-10);obstB.push({x:X-100,z:-10,hw:3.5,hd:9,h:2.8});
 for(let i=0;i<4;i++)mesh(new T.ConeGeometry(2.5+R(),2.4+R(),7),0x15130f,X-90+i*5,1.2,34,0,0,stoneTex);
 {const x=X+92,z=30;for(const a of[-1,1])for(const b of[-1,1])box(.3,11,.3,0x4a3018,x+a*1.6,5.5,z+b*1.6);box(4.2,.3,4.2,0x4a3018,x,10,z);box(4.2,1.2,.2,0x5a4030,x,10.7,z+2);box(4.2,1.2,.2,0x5a4030,x,10.7,z-2);mesh(new T.ConeGeometry(3.4,1.6,4),0x3a3028,x,12.2,z).rotation.y=.785;PR.ladder(x+1.9,0,z,10,1.5708);obstB.push({x,z,hw:1.8,hd:1.8,h:1.5})}
 for(let i=0;i<10;i++)PR.barrel(X+R()*20-50,30+R()*6);for(let i=0;i<8;i++)PR.stack(X-75+R()*30,-35-R()*8,R());PR.tent(X+10,24,.2,0xd8c8a0);PR.tent(X-8,26,-.3,0xd8c8a0);
 /* FASE I — circuito de obstáculos (carril este, x X+42…X+130) */ for(const s of[-1,1])for(let x=42;x<=128;x+=4){box(4,.9,.12,0x6a4a2a,X+x+2,.6,s*5.2,0,0,woodTex);box(.15,1.1,.15,0x4a3018,X+x,.55,s*5.2)}for(const s of[-1,1])obstB.push({x:X+86,z:s*5.2,hw:44,hd:.15,h:1.2});
 cp(.4,.4,10.4,0x5a3a20,X+52,.4,0).rotation.x=1.5708;obstB.push({x:X+52,z:0,hw:.4,hd:5,h:.8});
 for(let z=-4.6;z<=4.6;z+=.9)box(.12,1.2,.12,0x6a4a2a,X+62,.6,z);box(.08,.12,10,0x6a4a2a,X+62,1.05,0);box(.08,.12,10,0x6a4a2a,X+62,.6,0);obstB.push({x:X+62,z:0,hw:.15,hd:5,h:1.05});
 box(.5,.5,10.4,0x5a3a20,X+72,1.35,0);for(const s of[-1,1])box(.3,1.6,.3,0x4a3018,X+72,.8,s*5);obstB.push({x:X+72,z:0,hw:.35,hd:5,h:1.6,y0:1.05,under:1});
 for(let x=80;x<=90;x+=2.5){box(.06,.5,.06,0x4a4a4a,X+x,.25,-5);box(.06,.5,.06,0x4a4a4a,X+x,.25,5);box(.03,.03,10,0x8a8a8a,X+x,.55,0);for(let z=-4.5;z<=4.5;z+=1.2)box(.02,.12,.02,0x8a8a8a,X+x+.3,.58,z,0,0)}obstB.push({x:X+85,z:0,hw:5.5,hd:5,h:1.4,y0:.58,under:1});
 for(let x=96;x<=106;x+=3.3)for(const z of[-2.3,2.3]){const zz=((x-96)/3.3)%2?-z:z;cp(.45,.45,1.1,0x6b4a2a,X+x,.55,zz);obst.push({x:X+x,z:zz,r:.6})}
 for(let i=0;i<3;i++){box(2,.5+i*.5,10,0x6a5a4a,X+112+i*2,(.5+i*.5)/2,0,0,0,woodTex);obstB.push({x:X+112+i*2,z:0,hw:1,hd:5,h:.5+i*.5,step:true})}box(2,.5,10,0x6a5a4a,X+118,.75,0,0,0,woodTex);
 box(2.6,4,.4,0x4a3a2a,X+124,2,-4.2,0,0,woodTex);box(2.6,4,.4,0x4a3a2a,X+124,2,4.2,0,0,woodTex);box(2.6,.6,10,0x3a3028,X+124,4.3,0);
 /* FASE II — patio: líneas de sacos y marcas */ for(const x of[-14,0,14])sbRow(X+x-4,-6,X+x+4,-6,1,0);for(const [x,c] of[[-20,0xc02020],[0,0x2040c0],[20,0xe0c020]])PR.flag(X+x,-12,c,5);
 /* FASE III — polígono de tiro (noroeste) */ box(44,.5,3,0x6a5a4a,X-50,.25,-44,0,0,woodTex);box(4,.9,1.2,0x5a4030,X-48,.95,-43,0,0,woodTex);for(let i=0;i<6;i++)box(.08,2,.08,0x4a3018,X-70+i*8,1,-45.5);box(44,1.5,.1,0x6a4a2a,X-50,2,-45.5);mesh(new T.BoxGeometry(70,8,8),0x5a4a30,X-50,4,-138);obstB.push({x:X-50,z:-138,hw:35,hd:4,h:8});
 for(let i=0;i<5;i++){box(.4,3,.4,0x4a3018,X-72+i*10,1.5,-127)}box(44,.12,.3,0x3a3a3a,X-50,.1,-97);box(44,.12,.3,0x3a3a3a,X-50,.1,-99);
 /* FASE IV — trinchera de instrucción (norte) */ sbRow(X-14,-56,X+26,-56,1.15,0);for(let x=-14;x<=26;x+=2.2)box(2,.08,.7,0xc0a070,X+x,.05,-58.5,0,0,woodTex);for(let x=-14;x<=26;x+=4)box(.15,1.6,.15,0x4a3018,X+x,.8,-59.6);box(40,.4,.15,0x6a4a2a,X+6,1.4,-59.6);
 mesh(new T.CircleGeometry(3,20),0xc02020,X+14,.05,-78).rotation.x=-1.5708;mesh(new T.CircleGeometry(2.6,20),0xd8d0c0,X+14,.06,-78).rotation.x=-1.5708;mesh(new T.CircleGeometry(2.4,20),0x5a5a3a,X+14,.07,-78).rotation.x=-1.5708;
 box(6,1.8,.6,0x6a4a2a,X+28,.9,-74,0,0,woodTex);obstB.push({x:X+28,z:-74,hw:3,hd:.3,h:1.8});mesh(new T.CircleGeometry(2.4,20),0xc02020,X+28,.05,-79).rotation.x=-1.5708;mesh(new T.CircleGeometry(2,20),0x5a5a3a,X+28,.06,-79).rotation.x=-1.5708;
 for(let x=34;x<=44;x+=2)box(.06,.06,.06,0xd8d0c0,X+x,.05,-58);for(let z=-60;z>=-100;z-=5){box(.3,.08,.3,0xc02020,X+33,.05,z);box(.3,.08,.3,0xc02020,X+45,.05,z)}
 sb9(X+6,-100,3.4,.9,1.15);sb9(X+4,-98.6,.9,2.4,1.15);sb9(X+8,-98.6,.9,2.4,1.15);box(1.2,.8,.8,0x6a5a3a,X-6,.4,-52,0,0,woodTex);box(1.2,.05,.8,0xe0e0e0,X-6,.82,-52);
 /* FASE V — estaciones de armas (noreste) */ box(64,.5,3,0x6a5a4a,X+80,.25,-46,0,0,woodTex);for(let i=0;i<5;i++){box(2.4,.9,1.2,0x5a4030,X+54+i*13,.95,-45,0,0,woodTex);box(2.4,1.5,.08,0x3a2a1a,X+54+i*13,1.3,-44.4)}mesh(new T.BoxGeometry(80,6,6),0x5a4a30,X+80,3,-150);obstB.push({x:X+80,z:-150,hw:40,hd:3,h:6});
 /* FASE VI — parque de vehículos (sureste) */ box(70,.05,24,0x6a6050,X+110,.03,28,0,0,rt_(cobT,14,5));for(let i=0;i<6;i++){const x=X+84+i*9;cp(.25,.35,.7,0xe06010,x,.35,20);cp(.25,.35,.7,0xe06010,x,.35,36)}box(9,.06,6,0xd8d0c0,X+138,.05,28);box(8.4,.07,5.4,0x6a6050,X+138,.06,28);for(let i=0;i<4;i++)PR.stack(X+96+i*10,44,R());box(6,3,5,0x5a5048,X+150,1.5,44,0,0,woodTex);
 /* FASE VII — pueblo de prácticas (noroeste lejano) */ for(const [x,z,w,d] of[[-55,-165,10,8],[-35,-172,8,8],[-60,-185,9,7],[-28,-190,12,8]]){shack(X+x,z,w,d,3.4,0x9a8a6a);box(1.5,2.2,.12,0x1a1410,X+x,1.1,z+d/2+.05)}for(let i=0;i<8;i++)sbRow(X-70+i*7,-150,X-66+i*7,-150,.9,0);
 /* FASE VIII — «Sector Norte» */ sbRow(X+5,-170,X+70,-170,1.2,4);for(let x=5;x<=70;x+=2.2)box(2,.08,.7,0xc0a070,X+x,.05,-172.5,0,0,woodTex);for(let i=0;i<14;i++)crater9(X+(R()-.2)*80,-175-R()*55,1+R()*2);for(let i=0;i<8;i++)deadTree(X+10+R()*60,-180-R()*45);
 mesh(new T.CircleGeometry(4,20),0x2a6a2a,X+38,.05,-245).rotation.x=-1.5708;PR.flag(X+38,-245,0x2a6a2a,6);PR.sign(X+30,-240,0);
 /* bosque, montañas y cerco */ {const N=420,tr=new T.InstancedMesh(new T.ConeGeometry(1.8,7,7),new T.MeshLambertMaterial({color:0x1e3020}),N),tk=new T.InstancedMesh(new T.CylinderGeometry(.25,.3,2,6),new T.MeshLambertMaterial({color:0x3a2a1a}),N),m=new T.Matrix4(),q=new T.Quaternion(),sc=new T.Vector3();for(let i=0;i<N;i++){const a=R()*6.283,r=212+R()*50,x=X+20+Math.cos(a)*r,z=-90+Math.sin(a)*r,s=.8+R()*.9;sc.set(s,s,s);m.compose(new T.Vector3(x,3.5*s+1,z),q,sc);tr.setMatrixAt(i,m);m.compose(new T.Vector3(x,1,z),q,sc);tk.setMatrixAt(i,m)}scene.add(tr);scene.add(tk)}
 for(let i=0;i<10;i++){const a=i/10*6.283,x=X+20+Math.cos(a)*330,z=-90+Math.sin(a)*330;mesh(new T.ConeGeometry(70+R()*40,90+R()*60,7),0x4a5058,x,30,z).material&&0}
 scene.updateMatrixWorld(true);sEnd();sbInit();
 /* puertas, blancos, mesas, armas y vehículos (dinámicos) */
 {const m=new T.Mesh(gBox(2.6,3.6,.15),new T.MeshLambertMaterial({map:woodTex,color:0x6a4a2a}));m.position.set(X+124,1.8,0);m.rotation.y=1.5708;scene.add(m);const o={x:X+124,z:0,hw:.2,hd:3.9,h:3.6};obstB.push(o);DOOR11.course={m,o,open:false}}
 mkMG08(X+80,-48,0,11);L11.mort=mkMortar();L11.mort.position.set(X+66,0,-50);scene.add(L11.mort);L11.can=mkKrupp();L11.can.position.set(X+100,0,-52);L11.can.rotation.y=0;
 L11.truck=mkTruck16({driver:true,col:0x4a5048});L11.truck.position.set(X+92,0,28);L11.truck.rotation.y=1.5708;L11.trkOb={x:X+92,z:28,r:2.6};obst.push(L11.trkOb);
 L11.tank=mkTankette('rec',0x4a5040);L11.tank.position.set(X+86,0,40);L11.tank.rotation.y=1.5708;L11.tkOb={x:X+86,z:40,r:2};obst.push(L11.tkOb);
 L11.wreck=mkTruck16({driver:false,col:0x3a3a30});L11.wreck.position.set(X+146,0,36);L11.wreck.rotation.set(0,.4,0);obst.push({x:X+146,z:36,r:2.4});
 L11.horse=mkHorse9(0x5a3a22,0x3a4450);L11.horse.g.position.set(X-100,0,-22);scene.add(L11.horse.g);L11.draco=mkDraco10('rastreo',0x6a6a4a,0x2a2a20);L11.draco.g.position.set(X-108,0,-30);L11.draco.g.rotation.y=1.2;obst.push({x:X-108,z:-30,r:2});
 L11.train=mkTrain11();L11.train.g.position.set(X+10,0,48);
 L11.siren=null;bunker8(X+40,-202,1,'CASAMATA');
}
/* ---------- personajes del campamento ---------- */
let KOL=null;const AMB11={};
function spawnCamp11(){const X=X11;if(KOL)return;
 KOL=npc11(X-10,36,{name:'Sargento Koller',hat:'cap',hatC:0x2e3440,peak:0x2e3440,rank:3,cig:true,coat:0x3a4450,act:'behind',sp:3.6,mapcase:true});KOL.g.userData.mR.add(mkC10?mkC10():new T.Group());
 AMB11.off=npc11(X-30,40,{name:'Oficial',peak:0x2e3440,officer:true,cig:true,act:'smoke',f:Math.PI*.5});
 AMB11.med=npc11(X+24,23,{name:'Sanitario',armband:true,medbag:true,act:'idle',f:Math.PI});
 AMB11.cabo=npc11(X+10,4,{name:'Cabo Brandt',hat:'helm',hatC:CAMP.helm,gun:'r',act:'idle',rank:1,f:Math.PI});
 AMB11.form=[];for(let i=0;i<4;i++)AMB11.form.push(npc11(X-9+i*2.2,-1,{name:'Recluta',gun:'r',act:'idle',f:Math.PI}));
 AMB11.march=[];const loop=[[X-24,12],[X+24,12],[X+24,-14],[X-24,-14]];for(let i=0;i<4;i++){const n=npc11(X-24+i*2,12,{hat:'helm',hatC:CAMP.helm,gun:'r',act:'march',path:loop,sp:1.7});n.pi=1;AMB11.march.push(n)}
 for(const [x,z,f] of[[-2,-22.5,0],[2,-22.5,0]])npc11(X+x,z,{hat:'helm',hatC:CAMP.helm,gun:'r',act:'salute',f});
 for(let i=0;i<3;i++)npc11(X-48+i*3,16.6,{act:'clean',gun:'r',f:0});for(let i=0;i<3;i++)npc11(X-31+i*5,21,{act:'eat',f:0});
 npc11(X+30,23.5,{act:'smoke',cig:true,f:Math.PI});npc11(X+33,23.2,{act:'smokesit',cig:true,f:-2.5});
 npc11(X-86,30,{act:'argue',f:1.5708,name:'Carbonero'});npc11(X-83.8,30,{act:'argue',f:-1.5708});
 AMB11.mech=npc11(X+144,32,{act:'crouch',tools:true,f:.4,name:'Mecánico'});npc11(X+92,30.5,{act:'idle',f:0,name:'Conductor'});
 {const g=npc11(X+92,30,{hat:'helm',hatC:CAMP.helm,gun:'r',act:'aim',f:Math.PI});g.g.position.y=10.2}
 npc11(X-62,-40,{hat:'helm',hatC:CAMP.helm,act:'behind',f:Math.PI,name:'Instructor de tiro'});
 for(const [x,z] of[[-98,-24],[-98,-28]]){const h=mkHorse9(R()<.5?0x3a2618:0x6a5a4a,0x3a4450);h.g.position.set(X+x,0,z);h.g.rotation.y=1.5708;scene.add(h.g)}}
function koller(x,z,act){if(!KOL)return;KOL.tgt=[x,z];KOL.after=act||'behind';KOL.act='walk'}
function kolUpd(dt){if(!KOL)return;if(!KOL.tgt&&KOL.act==='walk')KOL.act=KOL.after||'behind';KOL.look=KOL.tgt?null:[P.g.position.x,P.g.position.z];if(KOL.act==='point'){KOL.pt=(KOL.pt||0)+dt;if(KOL.pt>2.2){KOL.pt=0;KOL.act='behind'}}}
/* ---------- utilidades de la instrucción ---------- */
function obj11(t,x,z){L11.ot=t;obj9(t,x,z)}
function joke11(k,lines,cd){const n=time;L11.jk=L11.jk||{};if(L11.jk[k]&&n-L11.jk[k]<(cd||25))return;L11.jk[k]=n;talk(lines)}
function step11(n){L11.st=n;L11.t=0;L11.sub=0}
function giveArm11(w){if(!L11.arm.includes(w))L11.arm.push(w);if(w==='smg'||w==='rifle'||w==='revolver'){const W=P.weapons[w];W.mag=W.max;W.reserve=Math.max(W.reserve,w==='smg'?100:40)}}
function whistle11(){tn18('sine',2600,2300,.45,.05);tn18('sine',2600,2400,.2,.04,.5)}
const MGL11={on:false,x:0,z:0,z0:0,z1:0,x0:0,x1:0,t:0,axis:'x'};
function mgLane11(dt){const M=MGL11;if(!M.on)return;M.t+=dt;M.cd=(M.cd||0)-dt;if(M.cd>0)return;M.cd=.09;const s=Math.sin(M.t*1.3)*.5+.5,o=new T.Vector3(M.x,1.3,M.z),tx=M.axis==='x'?M.x0+(M.x1-M.x0)*s:M.x0,tz=M.axis==='x'?M.z0:M.z0+(M.z1-M.z0)*s;
 trc16(o,new T.Vector3(tx,1.2,tz),0xffc070);npcShot('mg',M.x,M.z);const pp=P.g.position;const inLane=pp.x>Math.min(M.lx0,M.lx1)&&pp.x<Math.max(M.lx0,M.lx1)&&pp.z>Math.min(M.lz0,M.lz1)&&pp.z<Math.max(M.lz0,M.lz1);
 if(inLane&&!P.pr&&!(P.cover&&P.cr)&&R()<(M.slow?.14:.07)){hitP(9);burst(pp.x,1.2,pp.z,0xd8c8a0,4,.2,3);if(!M.warn||time-M.warn>4){M.warn=time;say(M.msg||'¡Fogueo! ¡Te dieron! ¡AL SUELO!',1.6)}}}
/* ---------- FASES ---------- */
function go11(ph){L11.ph=ph;step11(0);DLG.q=DLG.q.filter(l=>typeof l==='function');const X=X11;MGL11.on=false;
 const st=[null,()=>{L11.cp=[X-15,38];koller(X,6);obj11('I · Seguí al sargento Koller',X,6);talk([['Koller','¡Vamos, recluta! ¡Detrás de mí! ¡Y no te pierdas, que el campamento no tiene carteles para idiotas!']])},
  ()=>{L11.cp=[X+120,0];koller(X+2,-3);obj11('II · Volvé al patio de formación',X,-3)},
  ()=>{L11.cp=[X,-2];koller(X-46,-40);obj11('III · Polígono de tiro: seguí a Koller',X-48,-41)},
  ()=>{L11.cp=[X-48,-40];koller(X+4,-50);obj11('IV · Trinchera de instrucción',X+4,-52)},
  ()=>{L11.cp=[X+6,-50];koller(X+70,-40);obj11('V · Exposición de armas',X+70,-42)},
  ()=>{L11.cp=[X+70,-40];koller(X+84,22);obj11('VI · Parque de vehículos',X+84,22)},
  ()=>{L11.cp=[X+84,22];koller(X-45,-146);obj11('VII · Pueblo de prácticas: allí te espera tu grupo',X-45,-146)},
  ()=>{L11.cp=[X-45,-146];cineAlarm11()}][ph];if(st)st();
 if(ph===4)giveArm11('revolver');if(ph===5){giveArm11('smg');for(const t of L11.t5)tgtUp(t)}}
/* armamento al repetir un ejercicio suelto */
function armFor11(ph){if(ph>=4)giveArm11('rifle');if(ph>=5){giveArm11('revolver');giveArm11('sword');L11.nades=true;P.grenades=Math.max(P.grenades,3)}if(ph>=6)giveArm11('smg');if(L11.arm.length&&!L11.arm.includes(P.cur))P.cur=L11.arm[0]}
function upd11_1(dt){const X=X11,pp=P.g.position,dk=KOL?Math.hypot(pp.x-KOL.g.position.x,pp.z-KOL.g.position.z):0;L11.t+=dt;
 if(L11.st===0){if(dk>16&&L11.t>5){joke11('lag',[['Koller','¡Vamos, recluta! ¡Esas piernas no están decorativas!']],20);if(L11.t>16)joke11('abuela',[['Koller','¿Qué ocurre? ¿Te reclutaron a vos o a tu abuela?']],40)}
  if(!KOL.tgt&&dk<8){step11(1);L11.cp=[X,6];kol('Primera lección: las piernas son gratis. ¡Carrera corta hasta aquel barracón! ¡Ya!');obj11('I · Carrera corta hasta el barracón del este',X+32,13)}}
 else if(L11.st===1){if(near10(X+32,13,4)){if(L11.t>14)kol('¡Mi abuela llega antes, y la enterramos en marzo!');step11(2);L11.vmax=0;kol('¡Ahora sprint de verdad hasta la bandera roja! ¡Mantené CORRER!');obj11('I · ¡Sprint hasta la bandera roja!',X+38,0);koller(X+40,8)}}
 else if(L11.st===2){L11.vmax=Math.max(L11.vmax||0,Math.hypot(P.mvx||0,P.mvz||0));if(near10(X+38,0,3)){if(L11.vmax<7.5)kol('¿A eso le llamás correr? En el frente, eso es un blanco caminando. Sigamos.');step11(3);L11.cpI=0;talk([['Koller','¡Circuito de obstáculos! Tronco, valla, barrera baja, alambre, barriles, escalones y la puerta del fondo. ¡Adelante!']])}}
 else if(L11.st===3){const CP=[[56,'el tronco','¡Saltá el tronco! (SALTAR)'],[66,'la valla','¡Saltá la valla, recluta!'],[76,'la barrera baja','¡Agachate para pasar por debajo! (AGACHAR)'],[92,'la alambrada','¡Cuerpo a tierra y arrastrate bajo el alambre! (TUMBARSE)'],[108,'los barriles','¡Esquivá los barriles, no los abraces!'],[121,'los escalones','¡Arriba y abajo, como en las trincheras!'],[128,'la puerta','¡Abrí la puerta del barracón! (USAR)']];
  const c=CP[L11.cpI];if(!c){step11(4);return}obj11('I · Circuito: '+c[1]+' ('+(L11.cpI+1)+'/'+CP.length+')',X+c[0],0);if(pp.x>X+c[0]-.5&&Math.abs(pp.z)<5.5){L11.cpI++;L11.sub=0;snd(880,.06,'sine',.04);if(L11.cpI===CP.length){step11(4);return}}else{L11.sub+=dt;if(L11.sub>7){L11.sub=-6;kol(c[2])}}
  if(L11.cpI===0&&pp.x>X+49.5&&pp.x<X+51.3&&Math.hypot(P.mvx||0,P.mvz||0)<.6&&P.gnd){L11.fall=(L11.fall||0)+dt;if(L11.fall>1.3&&!L11.fell){L11.fell=1;V16.kick=1;burst(pp.x,.3,pp.z,0x6a5a3a,14,.6,4);talk([['Soldado veterano','Excelente. Ya tenemos un especialista en reconocimiento del suelo.'],['Koller','¡Levantate! ¡El barro no te paga alojamiento! ¡SALTÁ!']])}}}
 else if(L11.st===4){kol('¡Bien! No te moriste. Eso ya es más de lo que esperaba. ¡Al patio, que la disciplina no se negocia!');go11(2)}}
function upd11_2(dt){const X=X11,pp=P.g.position;L11.t+=dt;const F=AMB11.form;
 if(L11.st===0){if(near10(X,-1,10)&&!KOL.tgt){step11(1);for(const n of F)n.f=Math.PI;talk([['Koller','¡En formación! ¡A la izquierda!'],()=>{F[2].f=Math.PI*.5;F[2].act='idle'},['Koller','¡No, imbécil! ¡Tu otra izquierda!'],['Recluta','¡Mi sargento, tengo dos izquierdas!'],['Koller','¡Entonces te voy a enseñar cuál de las dos sirve para caminar!'],()=>{F[2].f=Math.PI}])}}
 else if(L11.st===1){if(!DLG.q.length&&DLG.t<=0){step11(2);L11.lk=0;kol('Recluta: mirá la bandera ROJA. Cuando te diga, mirá, no bosteces.')}}
 else if(L11.st===2){const FL=[[X-20,-12,'ROJA'],[X,-12,'AZUL'],[X+20,-12,'AMARILLA']],f=FL[L11.lk];if(!f){step11(3);kol('¡Ahora seguí al cabo Brandt y no te separes! ¡Paso de marcha!');AMB11.cabo.path=[[X+10,4],[X+22,4],[X+22,-10],[X-22,-10],[X-22,4]];AMB11.cabo.act='march';AMB11.cabo.sp=2.1;return}
  obj11('II · Mirá la bandera '+f[2],f[0],f[1]);cam.getWorldDirection(dv);const vx=f[0]-cam.position.x,vy=4-cam.position.y,vz=f[1]-cam.position.z,l=Math.hypot(vx,vy,vz);if((dv.x*vx+dv.y*vy+dv.z*vz)/l>.975){L11.sub+=dt;if(L11.sub>.6){L11.lk++;L11.sub=0;snd(880,.06,'sine',.04);if(FL[L11.lk])kol('Bien. Ahora la '+FL[L11.lk][2]+'.')}}else L11.sub=0}
 else if(L11.st===3){const c=AMB11.cabo,d=Math.hypot(pp.x-c.g.position.x,pp.z-c.g.position.z);obj11('II · Seguí al cabo Brandt sin separarte ('+Math.max(0,Math.ceil(14-L11.sub))+' s)',c.g.position.x,c.g.position.z);if(d<6.5)L11.sub+=dt;else if(d>12)joke11('cabo',[['Koller','¡El cabo no es un tranvía! ¡No lo vas a alcanzar en la próxima parada!']],15);if(L11.sub>=14){c.path=null;c.tgt=[X+10,4];c.act='idle';step11(4);kol('¡Alto! Mantené la posición en la marca. Ni un paso.')}}
 else if(L11.st===4){obj11('II · Mantené la posición sobre la marca (sin moverte)',X,5);const mv=Math.hypot(P.mvx||0,P.mvz||0);if(near10(X,5,2.2)&&mv<.3){L11.sub+=dt;if(L11.sub>4){step11(5);kol('¡A cubierto detrás de los sacos! ¡Agachate o pegate a la cobertura!')}}else{if(near10(X,5,2.2)&&mv>.5&&L11.sub>1)joke11('mov',[['Koller','¡Dije sin moverte! ¡Hasta las estatuas tienen más disciplina!']],12);L11.sub=0}}
 else if(L11.st===5){obj11('II · Ponete a cubierto detrás de los sacos (AGACHAR o CUB)',X,-4.5);if(pp.z>-5.6&&pp.z<-3&&(P.cr||P.cover||P.pr)&&[-14,0,14].some(x=>Math.abs(pp.x-X-x)<4.5)){step11(6);kol('¡De pie!')}}
 else if(L11.st===6){obj11('II · ¡De pie!',X,-3);if(!P.cr&&!P.pr&&!P.cover){step11(7);L11.lr=0;kol('Paso lateral: a la marca izquierda y después a la derecha. Sin dar la espalda.')}}
 else if(L11.st===7){const M=[[X-8,4],[X+8,4]],m=M[L11.lr];obj11('II · Paso lateral: marca '+(L11.lr?'derecha':'izquierda'),m[0],m[1]);if(near10(m[0],m[1],1.6)){L11.lr++;snd(880,.06,'sine',.04);if(L11.lr>1){step11(8);cineFaint11()}}}}
function upd11_3(dt){const X=X11;L11.t+=dt;
 if(L11.st===0){obj11('III · Recogé el fusil de la mesa (USAR)',X-48,-43);if(near10(X-48,-41,5)&&!L11.said3){L11.said3=1;talk([['Koller','Esto es un fusil. No es un bastón, no es una pala y no es un argumento para discutir con tu novia.'],['Koller','Si lo apuntás, hacelo con intención. Si disparás, sabé por qué. Si te quedás sin munición, no me mires como si yo fuera a fabricarla con las manos.']])}}
 else if(L11.st===1){const T_=L11.t1;const left=T_.filter(t=>t.up).length;obj11('III · Ejercicio 1: blancos estáticos — cercano, medio y lejano ('+(3-left)+'/3)',T_[0].x,T_[0].z);if(L11.shots>9&&left)joke11('ruido',[['Koller','¡No es una competencia de ruido! ¡Quiero impactos, no una serenata!']],30);if(!left){step11(2);L11.shots=0;kol('Ahora se mueven. ¡El enemigo no se va a quedar quieto para que le hagas un retrato!');for(const t of L11.t2)tgtUp(t)}}
 else if(L11.st===2){const left=L11.t2.filter(t=>t.up).length;obj11('III · Ejercicio 2: blancos móviles ('+(3-left)+'/3)',X-50,-97);if(!left){step11(3);L11.call=0;L11.ok3=0;L11.shots=0;for(const t of L11.t3)tgtUp(t);callTarget11()}}
 else if(L11.st===3){obj11('III · Ejercicio 3: derribá SOLO el blanco que indique Koller ('+L11.ok3+'/3)',L11.callT.x,L11.callT.z);if(L11.ok3>=3){step11(4);kol('Aceptable. Todavía no sos peligroso, pero ya no sos inofensivo. ¡A la trinchera!');go11(4)}}}
function callTarget11(){const T_=L11.t3.filter(t=>t.up);const t=T_[R()*T_.length|0];L11.callT=t;const side=t.x<X11-50?'izquierda':'derecha';kol('¡El '+t.name+'! ¡El de la '+side+'!')}
function upd11_4(dt){const X=X11,pp=P.g.position;L11.t+=dt;const w=P.weapons.rifle;
 if(L11.st===0){obj11('IV · Llegá a la trinchera de instrucción',X+4,-52);if(near10(X+4,-53,6)){step11(1);L11.emp=0;kol('Reglas del frente: la guerra no espera a que recargues. ¡Vaciá el cargador contra la berma y recargá!')}}
 else if(L11.st===1){obj11('IV · Vaciá el cargador y recargá (RECARGAR)',X+6,-70);if(P.cur==='rifle'&&w.mag===0)L11.emp=1;if(L11.emp&&w.mag===w.max){step11(2);kol('Ahora la pistola (ARMA) y de vuelta al fusil. Rápido: en el frente se cambia de arma más rápido que de calcetines.')}}
 else if(L11.st===2){obj11('IV · Cambiá a la pistola y vuelve al fusil (ARM / Q)',X+6,-55);if(P.cur==='revolver')L11.sub=1;if(L11.sub===1&&P.cur==='rifle'){step11(3);kol('¡Cobertura! Pegate a los sacos (CUB o F). Agachado no te ven; asomado, sí.')}}
 else if(L11.st===3){obj11('IV · Ponete a cubierto contra los sacos (CUB)',X+6,-55);if(P.cover){step11(4);tgtUp(L11.t4);kol('Asomate (FUEGO te levanta) y derribá el blanco de enfrente. Después volvés abajo.')}}
 else if(L11.st===4){obj11('IV · Asomate desde la cobertura y derribá el blanco',L11.t4.x,L11.t4.z);if(!L11.t4.up){step11(5);cineMG11()}}
 else if(L11.st===5){obj11('IV · ¡Cuerpo a tierra! Arrastrate bajo el fuego hasta la bandera',X+39,-100);if(near10(X+39,-100,3)){MGL11.on=false;step11(6);L11.nades=true;P.grenades=Math.max(P.grenades,4);talk([['Koller','Granadas de instrucción: ¡quitá la seguridad, apuntá, lanzá y buscá cobertura! ¡No te quedes mirando el resultado como si estuvieras esperando fuegos artificiales!']])}}
 else if(L11.st===6){obj11('IV · Lanzá una granada dentro del círculo rojo (GRA)',X+14,-78);if(P.grenades<=0)P.grenades=2}
 else if(L11.st===7){obj11('IV · Ahora una granada detrás de la barricada',X+28,-79);if(P.grenades<=0)P.grenades=2}
 else if(L11.st===8){obj11('IV · Bayoneta: derribá los dos muñecos con CUERPO A CUERPO (MEL)',X-6,-64);if(L11.t8.every(t=>!t.up)){step11(9);MGL11.on=true;Object.assign(MGL11,{x:X+54,z:-104,axis:'x',x0:X+28,x1:X+52,z0:-104,lx0:X+28,lx1:X+52,lz0:-107,lz1:-101,slow:1,msg:'¡Más rápido, recluta! ¡El que corre despacio, se queda!'});kol('Sprint táctico: cruzá ese tramo corriendo hasta la bandera verde. ¡Sin pararte a pensar!')}}
 else if(L11.st===9){obj11('IV · Sprint táctico bajo fuego hasta la bandera',X+50,-104);if(near10(X+50,-104,3)){MGL11.on=false;step11(10);P.hp=Math.min(P.hp,55);spawnMedkit20(X-6,-52);kol('Estás sangrando… de vergüenza, sobre todo. Hay un botiquín en la mesa: usalo.')}}
 else if(L11.st===10){obj11('IV · Curate con el botiquín de la mesa',X-6,-52);if(near10(X-6,-52,2.4)&&P.hp>70){step11(11);kol('Bien. ¡Exposición de armas! El que no conoce sus armas, carga las de los demás.');go11(5)}}}
function upd11_5(dt){const X=X11;L11.t+=dt;
 if(L11.st===0){obj11('V · Subfusil: derribá los tres blancos cercanos con la MP (ARM)',X+55,-62);if(L11.t5.every(t=>!t.up)){step11(1);cineMG0811()}}
 else if(L11.st===2){obj11('V · Montá la MG 08 (USAR) y derribá los blancos lejanos ('+L11.t5b.filter(t=>!t.up).length+'/4)',X+80,-48);if(P.mg&&firing){L11.burst=(L11.burst||0)+dt;if(L11.burst>3.2){L11.burst=0;joke11('burst',[['Koller','¡Dispará en ráfagas! ¡No estamos tratando de derretir el cañón!']],20)}}else L11.burst=0;if(L11.t5b.every(t=>!t.up)){step11(3);if(P.mg)toggleMG();kol('Mortero: apoyo indirecto. Disparás sin ver, así que mirá dónde caen y corregí. Tres disparos.')}}
 else if(L11.st===3){obj11('V · Mortero: tres disparos sobre la zona marcada (USAR) — '+(L11.mo||0)+'/3',X+66,-50);if((L11.mo||0)>=3){step11(4);kol('Cañón de campaña: cargá, orientá y dispará contra el blindado de madera.')}}
 else if(L11.st===4){obj11('V · Cañón de campaña: cargá y dispará (USAR)',X+100,-52);if(L11.canDone){step11(5);giveArm11('revolver');P.cur='revolver';kol('Y la pistola: arma de emergencia. Tres blancos, rápido, como si te fueran a morder.');for(const t of L11.t5c)tgtUp(t)}}
 else if(L11.st===5){obj11('V · Pistola: derribá los tres blancos cercanos',X+109,-56);if(L11.t5c.every(t=>!t.up)){step11(6);kol('¡Suficiente! Ahora vehículos. Y ni se te ocurra chocar nada que tenga ruedas.');go11(6)}}}
function upd11_6(dt){const X=X11,pp=P.g.position;L11.t+=dt;
 if(L11.st===0){obj11('VI · Subí al camión de transporte (USAR)',X+92,30);if(near10(X+92,28,7)&&!L11.seat){L11.seat=1;const r=AMB11.form[3];r.g.position.set(X+86,0,32);r.tgt=[X+92,31];r.sp=5;talk([['Recluta','¡Yo llegué primero!'],['Koller','¡Perfecto! ¡Entonces vas a ser el primero en bajar cuando nos encontremos con el enemigo!'],['Koller','Vos, recluta: al otro asiento. USAR para subir.']])}}
 else if(L11.st===1){obj11('VI · Viaje en camión con la tropa',X+110,30);if(!P.veh){step11(2);kol('Ese camión averiado no se arregla rezando. Ayudá al mecánico.')}}
 else if(L11.st===2){obj11('VI · Ayudá al mecánico con el camión averiado (USAR)',X+146,33)}
 else if(L11.st===3){obj11('VI · Subí a la tanqueta (USAR)',L11.tank.position.x,L11.tank.position.z)}
 else if(L11.st===4){const G=L11.gates,g=G[L11.gi];obj11(g?'VI · Conducí la tanqueta: puerta '+(L11.gi+1)+'/'+G.length:'VI · Disparo de la tanqueta: FUEGO contra el blindado de madera',g?g[0]:X+150,g?g[1]:12);if(g&&Math.hypot(L11.tank.position.x-g[0],L11.tank.position.z-g[1])<5){L11.gi++;snd(880,.06,'sine',.04)}if(!g&&L11.tkShot){step11(5)}}
 else if(L11.st===5){obj11('VI · Estacioná la tanqueta en el recuadro blanco y quedate quieto',X+138,28);if(Math.hypot(L11.tank.position.x-X-138,L11.tank.position.z-28)<3.2&&(L11.vspd||0)<.4){L11.sub+=dt;if(L11.sub>1.5){step11(6);vehExit11();talk([['Mecánico','¡Milagro! Ni un rasguño.'],['Koller','La caballería y los dracos, en los establos. Andá a verlos: un animal de guerra no es una mascota.']])}}else L11.sub=0}
 else if(L11.st===6){obj11('VI · Establos: caballería y dracos de Eisenmark',X-100,-18);if(near10(X-100,-18,8)){step11(7);koller(X-96,-16);talk([['Koller','El caballo te lleva al frente. El draco te lleva a través del frente. Ninguno de los dos te quiere.'],['Mozo de cuadra','Al draco no se le mira a los ojos, recluta. Ni se le da la espalda. Ni se le habla de comida.'],['Koller','Montarlos te lo enseñan los catafractos. Hoy, aprendé a no ponerte delante.'],()=>{step11(8);go11(7)}])}}}
function upd11_7(dt){const X=X11,pp=P.g.position;L11.t+=dt;const S=L11.sq||[],al=S.filter(s=>s.alive);
 if(L11.st===0){obj11('VII · Presentate a tu grupo de instrucción',X-45,-146);if(near10(X-45,-146,8)&&!L11.sqOn){L11.sqOn=1;spawnSquad11();talk([['Koller','Éstos son tus cuatro. No son soldados todavía; vos tampoco. Dales órdenes con ORD (o T).'],['Koller','¡Recluta! ¡Llevá a tu grupo hasta el edificio! ¡No quiero cuatro cadáveres decorando el patio!'],['Koller','Primero: ordená que dos te cubran (ORD hasta CUBRIR).']]);step11(1)}}
 else if(L11.st===1){obj11('VII · Ordená que dos soldados cubran (ORD → CUBRIR)',X-45,-148);if(L11.ord==='cubrir'){step11(2);kol('Ahora avanzá con el resto hasta el edificio grande. ORD → ASALTAR para que entren contigo.')}}
 else if(L11.st===2){obj11('VII · Avanzá con el resto hasta el edificio',X-35,-168);if(near10(X-35,-168,7)){step11(3);kol('¡Despejad el área! Muñecos y blancos de práctica: todo lo que tenga brazalete rojo.')}}
 else if(L11.st===3){const n=enemies.filter(e=>e.t11==='v7').length+L11.t7.filter(t=>t.up).length;obj11('VII · Despejá el área ('+n+')',X-40,-178);if(!n){step11(4);kol('¡Reagrupad! ORD → SEGUIR y que estén todos contigo.')}}
 else if(L11.st===4){obj11('VII · Reagrupá a la escuadra (ORD → SEGUIR)',pp.x,pp.z);if(L11.ord==='seguir'&&al.every(s=>Math.hypot(s.g.position.x-pp.x,s.g.position.z-pp.z)<12)){step11(5);kol('Bien. Os quedan vivos '+al.length+' de 4. En la guerra eso sería un éxito. Aquí es apenas aceptable.');later11(4.5,()=>{if(level===11&&L11.ph===7)go11(8)})}}
 if(L11.st>=1&&L11.st<5){if(al.length&&al.every(s=>Math.hypot(s.g.position.x-pp.x,s.g.position.z-pp.z)>45))joke11('aband',[['Koller','¡Tu escuadra no es un accesorio! ¡Si los mandás a morir, por lo menos tené la decencia de saber por qué!']],30);if(al.some(s=>s.nav&&s.nav.fail>2))joke11('trab',[['Koller','¡¿Qué hacen ahí?! ¡No están esperando un tren!']],30)}}
function upd11_8(dt){const X=X11,pp=P.g.position;L11.t+=dt;
 if(L11.st===0){const n=enemies.filter(e=>e.t11==='n1').length;obj11('VIII · Sector Norte: tomá la trinchera ('+n+')',X+38,-172);if(!n){step11(1);L11.cp=[X+38,-168];for(const e of[s10('amet',X+40,-200,'',{pin:1}),s10('fus',X+34,-204),s10('fus',X+46,-206),s10('gra',X+40,-210)])if(e){e.t11='n2';e.train=1;e.hp*=.6}kol('¡La casamata! No la ataques de frente: flanqueá y metele una granada.')}}
 else if(L11.st===1){const n=enemies.filter(e=>e.t11==='n2').length;obj11('VIII · Flanqueá y silenciá la casamata ('+n+')',X+40,-200);if(!n){step11(2);kol('¡Tres objetivos marcados! Destruílos: granadas o fuego concentrado.')}}
 else if(L11.st===2){const n=L11.obj8.filter(o=>o.alive).length;obj11('VIII · Destruí los objetivos marcados ('+(3-n)+'/3)',(L11.obj8.find(o=>o.alive)||{x:X+38}).x,(L11.obj8.find(o=>o.alive)||{z:-215}).z);if(!n){step11(3);L11.cp=[X+38,-212];Object.assign(MGL11,{on:true,x:X+75,z:-232,axis:'x',x0:X+15,x1:X+65,z0:-232,lx0:X+10,lx1:X+68,lz0:-236,lz1:-228,slow:0,msg:'¡Ametralladora simulada! ¡Cuerpo a tierra o corré!'});kol('¡Último tramo bajo fuego! ¡A la zona de extracción!')}}
 else if(L11.st===3){obj11('VIII · Cruzá bajo el fuego hasta la extracción',X+38,-245);if(near10(X+38,-245,4)){MGL11.on=false;step11(4);cineClose11()}}}
/* ---------- blancos de cada ejercicio ---------- */
function tgtDown(t){t.up=false;t.fall=1;t.g.rotation.x=-1.45}
function setupTargets11(){const X=X11;if(L11.t1)return;
 L11.t1=[tgt11(X-58,-62),tgt11(X-50,-84),tgt11(X-42,-116)];
 L11.t2=[0,1,2].map(i=>tgt11(X-60+i*10,-97,{mv:[7+i*2,.8+i*.25]}));L11.t2.forEach(tgtDown);
 const C=[[0xc02020,'rojo'],[0x2040c0,'azul'],[0xe0c020,'amarillo'],[0x2a8a2a,'verde']];L11.t3=C.map((c,i)=>tgt11(X-62+i*8,-75,{mark:c[0],name:c[1],on:t=>{if(L11.ph!==3||L11.st!==3)return;if(t===L11.callT){L11.ok3++;snd(1200,.08,'sine',.05);if(L11.ok3<3)later11(0.9,()=>{if(level!==11)return;for(const q of L11.t3)tgtUp(q);callTarget11()})}else{joke11('wrong',[['Koller',R()<.5?'¡Maravilloso! ¡Acabás de heredar una carrera en artillería!':'¡Ése no! ¿Sabés lo que es la izquierda o también tenés dos?']],6);later11(0.8,()=>{if(level===11)tgtUp(t)})}}}));L11.t3.forEach(tgtDown);
 L11.t4=tgt11(X+6,-74);tgtDown(L11.t4);
 L11.t8=[tgt11(X-8,-64,{col:0x8a7a5a}),tgt11(X-3,-64,{col:0x8a7a5a})];L11.t8.forEach(tgtDown);
 L11.t5=[0,1,2].map(i=>tgt11(X+52+i*3,-62));L11.t5b=[0,1,2,3].map(i=>tgt11(X+72+i*6,-98-i*7));L11.t5c=[0,1,2].map(i=>tgt11(X+106+i*3,-57));[...L11.t5,...L11.t5b,...L11.t5c].forEach(tgtDown);
 L11.t7=[[-50,-160],[-32,-182],[-58,-195]].map(([x,z])=>tgt11(X+x,z,{col:0xa04030}));L11.t7.forEach(tgtDown);
 {const g=new T.Group(),q=PB();pBox(q,3,1.4,5,0x6a5a3a,0,1,0);pBox(q,2,1,2,0x6a5a3a,0,2.1,-.5);pCyl(q,.12,.12,3,0x4a3a2a,0,2.2,1.5,1.5708,0,0,8);pbMesh(q,g,VCV);g.position.set(X+102,0,-135);scene.add(g);L11.mock=g}
 {const g=new T.Group(),q=PB();pBox(q,3,1.2,4.6,0x6a5a3a,0,.9,0);pBox(q,1.8,.9,1.8,0x6a5a3a,0,1.9,0);pCyl(q,.1,.1,2.6,0x4a3a2a,0,1.9,1.4,1.5708,0,0,8);pbMesh(q,g,VCV);g.position.set(X+150,0,12);scene.add(g);L11.mock2=g}
 L11.obj8=[[20,-215],[55,-218],[38,-226]].map(([x,z])=>{const g=new T.Group(),q=PB();pBox(q,1.6,.4,2.6,0x6a5a3a,0,.6,0);pCyl(q,.5,.5,.2,0x3a3a36,-.9,.5,0,0,0,1.5708,10);pCyl(q,.5,.5,.2,0x3a3a36,.9,.5,0,0,0,1.5708,10);pCyl(q,.12,.14,2.4,0x4a4a42,0,1,1.2,1.5708,0,0,8);pBox(q,1.6,1,.1,0xc02020,0,1.2,-.6);pbMesh(q,g,VCV);g.position.set(X+x,0,z);scene.add(g);const o={g,x:X+x,z,hp:260,alive:true};
  HIT9.push({foe:true,x:()=>o.x,z:()=>o.z,y0:0,y1:2,r:1.6,ok:()=>o.alive&&level===11,dmg:(v,k)=>{if(!o.alive)return;o.hp-=v*(k==='b'?.2:1);if(o.hp<=0){o.alive=false;boom9(o.x,o.z,1,false);o.g.visible=false;feed('★ Objetivo destruido')}}});return o})}
/* ---------- escuadra de instrucción (fase VII–VIII) y órdenes ---------- */
function spawnSquad11(prac){const X=X11;const made=gar9([[X-48,-146],[X-46,-145],[X-44,-146],[X-42,-145]].map(p=>[p[0],p[1],Math.PI,0,'rifle']));const nm=['Recluta Haas','Recluta Petrov','Recluta Ludwig','Recluta Moser'];
 made.forEach((s,i)=>{const ng=mkSoldier({coat:CAMP.coat,pants:CAMP.pants,hat:'helm',hatC:CAMP.helm,tab:GARNET,pack:true,puttee:0x3a3a36});for(const c of s.u.mR.children.slice())s.u.mR.remove(c);ng.userData.mR.add(mkEwR9(false));swapModel(s,ng);s.u=ng.userData;gear20(ng,{helm:CAMP.helm});s.name=nm[i];s.hp=s.max=160});L11.sq=made;sqOrder11('seguir',true);if(prac===false)return;
 for(const [k,x,z] of[['fus',-55,-172],['fus',-30,-180],['gra',-60,-192],['fus',-26,-196]]){const e=sp10(k,X+x,z,{force:true});if(e){e.t11='v7';e.train=1;e.hp*=.5;e.max=e.hp}}for(const t of L11.t7)tgtUp(t)}
function sqOrder11(o,quiet){L11.ord=o;const X=X11,S=(L11.sq||[]).filter(s=>s.alive),pp=P.g.position;
 if(o==='mantener')posts10(S.map(s=>[s.g.position.x,s.g.position.z,s.g.rotation.y,true]));
 else if(o==='cubrir')posts10(S.map((s,i)=>i<2?[X-52+i*14,-148,Math.PI,true]:[pp.x+(i-2.5)*2,pp.z+3,Math.PI,false]));
 else if(o==='asaltar')posts10(S.map((s,i)=>[X-35+(i-1.5)*2.4,-169-(i%2),Math.PI,false]));
 else posts10(S.map((s,i)=>[pp.x+(i-1.5)*2.4,pp.z+3+(i%2)*1.5,Math.PI,false]));
 if(!quiet){say('ESCUADRA: '+o.toUpperCase(),1.6);snd(600,.08,'square',.04)}}
const _ol21=orderLt;orderLt=function(){if(level===11){if(!L11.sq||!L11.sq.length){say('No tenés a nadie a tus órdenes, recluta. Todavía.',1.6);return}const O=['seguir','mantener','cubrir','asaltar'];sqOrder11(O[(O.indexOf(L11.ord)+1)%4]);return}_ol21()};
/* ---------- vehículos de instrucción: camión (pasajero) y tanqueta (conducible) ---------- */
function vehBoard11(k){P.pr=false;coverExit();P.veh={kind:k};if(k==='truck'){const X=X11;L11.tpath=[[X+140,24],[X+140,38],[X+80,38],[X+80,24],[X+92,28]];L11.tpi=0;whistle11()}else{const i=obst.indexOf(L11.tkOb);if(i>=0)obst.splice(i,1);L11.tkH=L11.tank.rotation.y;L11.tkCd=0;tn18('sawtooth',60,90,1.2,.06)}}
function vehExit11(){const v=P.veh;if(!v)return;P.veh=null;const g=v.kind==='truck'?L11.truck:L11.tank;P.g.position.set(g.position.x+Math.cos(g.rotation.y)*2.6,0,g.position.z-Math.sin(g.rotation.y)*2.6);P.g.position.y=0;if(v.kind==='tank'){L11.tkOb.x=g.position.x;L11.tkOb.z=g.position.z;obst.push(L11.tkOb)}}
function vehUpd11(dt){const v=P.veh;if(!v)return;
 if(v.kind==='truck'){const g=L11.truck,w=L11.tpath[L11.tpi];if(!w){vehExit11();return}const dx=w[0]-g.position.x,dz=w[1]-g.position.z,d=Math.hypot(dx,dz);if(d<1.5)L11.tpi++;else{g.rotation.y=angL(g.rotation.y,Math.atan2(dx,dz),Math.min(1,dt*1.5));const s=Math.min(5.5,d);g.position.x+=Math.sin(g.rotation.y)*s*dt;g.position.z+=Math.cos(g.rotation.y)*s*dt;const u=g.userData;if(u.wh)for(const q of u.wh)q.rotation.x+=s*dt*2}
  L11.trkOb.x=g.position.x;L11.trkOb.z=g.position.z;const c=Math.cos(g.rotation.y),s=Math.sin(g.rotation.y);P.g.position.set(g.position.x-s*1.6+c*.6,1.45,g.position.z-c*1.6-s*.6);P.mvx=P.mvz=0;P.vy=0;
  if(AMB11.form[3]){const r=AMB11.form[3];r.tgt=null;r.g.position.set(g.position.x-s*1.6-c*.6,1.45,g.position.z-c*1.6+s*.6);r.g.rotation.y=g.rotation.y+1.5708;r.act='sit'}if(R()<dt*2)smoke(g.position.x-s*3.4,.6,g.position.z-c*3.4,.6,1,0x6a6a6a,.6,.4)}
 else{const g=L11.tank,mx=P.mvx||0,mz=P.mvz||0,m=Math.hypot(mx,mz);let sp=0;if(m>.8){const want=Math.atan2(mx,mz),df=Math.abs(((want-g.rotation.y+Math.PI)%6.2832+6.2832)%6.2832-Math.PI);g.rotation.y=angL(g.rotation.y,want,Math.min(1,dt*1.3));sp=Math.min(6,m)*(df<1.2?1:.25)}
  L11.vspd=(L11.vspd||0)+(sp-(L11.vspd||0))*Math.min(1,dt*2);const p=g.position,ox=p.x,oz=p.z;p.x+=Math.sin(g.rotation.y)*L11.vspd*dt;p.z+=Math.cos(g.rotation.y)*L11.vspd*dt;resolve(p,1.8);if(L11.vspd>2&&Math.hypot(p.x-ox,p.z-oz)<L11.vspd*dt*.4){L11.vspd*=.3;joke11('choque',[['Mecánico','¡No lo choques!'],['Koller','¡Si lo choca, lo repara! ¡Si lo rompe, duerme dentro de los restos!']],25)}
  tankAnim(g,L11.vspd,dt);P.g.position.set(p.x,1.55,p.z);P.vy=0;L11.tkCd-=dt;$('ammo').textContent='TANQUETA DE INSTRUCCIÓN · '+(L11.tkCd>0?'CARGANDO…':'CAÑÓN LISTO')+' · USAR para bajar'}}
function tankFire11(){if(L11.tkCd>0)return;L11.tkCd=2.2;const g=L11.tank,u=g.userData;cam.getWorldDirection(dv);let t=8;for(;t<90;t+=2){if(cam.position.y+dv.y*t<.2)break}const x=cam.position.x+dv.x*t,z=cam.position.z+dv.z*t;if(u.tur)u.tur.rotation.y=Math.atan2(x-g.position.x,z-g.position.z)-g.rotation.y;if(u.muz){u.muz.getWorldPosition(_tv);burst(_tv.x,_tv.y,_tv.z,0xffcc66,10,.25,8)}u.rec=1;npcShot('big',g.position.x,g.position.z);later11(0.3,()=>{if(level!==11)return;boom9(x,z,1,false);if(Math.hypot(x-L11.mock2.position.x,z-L11.mock2.position.z)<5&&!L11.tkShot){L11.tkShot=true;L11.mock2.rotation.z=.5;L11.mock2.position.y=-.4;feed('★ ¡Blanco destruido!');kol('¡Impacto! Ahora estacioná. Y suave, que el combustible no crece en los árboles.')}})}
/* ---------- trabajos con USAR en el campamento ---------- */
function works11(){const W=[],X=X11,ph=L11.ph,st=L11.st;
 if(ph===1&&st===3&&!DOOR11.course.open)W.push({x:X+122.3,z:0,r:2.6,dur:.6,lbl:'Abrir la puerta del barracón',fn:()=>{const D=DOOR11.course;D.open=true;D.m.rotation.y=0;D.m.position.x+=1.3;D.m.position.z+=2.6;const i=obstB.indexOf(D.o);if(i>=0)obstB.splice(i,1);snd(200,.3,'sawtooth',.04)}});
 if(ph===3&&st===0)W.push({x:X-48,z:-42,r:2.8,dur:.8,lbl:'Recoger el fusil Ew-R9',fn:()=>{giveArm11('rifle');P.cur='rifle';step11(1);L11.shots=0;for(const t of L11.t1)tgtUp(t);talk([['Koller','Tres siluetas: cercana, media y lejana. FUEGO para disparar; mantené apuntado para afinar.']])}});
 if(ph===5&&st===3)W.push({x:X+66,z:-50,r:2.8,dur:1.2,lbl:'Disparar el mortero',fn:()=>{L11.mo=(L11.mo||0)+1;const m=L11.mort.position;burst(m.x,1.4,m.z,0xffcc66,10,.25,8);smoke(m.x,1.4,m.z,2,2,0x9a9a90,.8,.5);expSnd(m.x,m.z,.4);const tx=X+64+(R()-.5)*10,tz=-128+(R()-.5)*8;later11(1.5,()=>{if(level===11){shell9(tx,tz,1);say(L11.mo>=3?'Koller: «Tres de tres. Ni la artillería lo haría peor.»':'Observador: «Impacto '+(R()<.5?'largo':'corto')+'… ¡corrigiendo!»',2)}})}});
 if(ph===5&&st===4&&!L11.canDone)W.push({x:X+100,z:-50,r:3.2,dur:2,lbl:'Cargar, orientar y disparar el cañón',fn:()=>{const c=L11.can.position;burst(c.x,1.6,c.z+2,0xffcc66,16,.3,10);smoke(c.x,1.6,c.z+2,4,3,0x9a9a90,1.2,.6);expSnd(c.x,c.z,1);shake=Math.max(shake,1);later11(0.5,()=>{if(level!==11)return;boom9(L11.mock.position.x,L11.mock.position.z,1.4,false);L11.mock.rotation.z=.6;L11.mock.position.y=-.5;L11.canDone=true;feed('★ Blindado de madera destruido')})}});
 if(ph===6&&st===0&&L11.seat&&!DLG.q.length)W.push({x:X+92,z:28,r:5,dur:.4,lbl:'Subir al camión',fn:()=>{vehBoard11('truck');step11(1)}});
 if(ph===6&&st===2)W.push({x:X+146,z:33,r:3.2,dur:3,lbl:'Ayudar al mecánico',fn:()=>{step11(3);talk([['Mecánico','¡Ahí, ahí! ¡Apretá esa tuerca, no la acaricies!'],['Mecánico','Listo. Ahora probá la tanqueta, y si la chocás…'],['Koller','¡Si la choca, la repara! ¡Si la rompe, duerme dentro de los restos!']])}});
 if(ph===6&&st===3)W.push({x:L11.tank.position.x,z:L11.tank.position.z,r:3.6,dur:.4,lbl:'Subir a la tanqueta',fn:()=>{vehBoard11('tank');step11(4);L11.gi=0;L11.tkShot=false;L11.gates=[[X11+100,28],[X11+120,28],[X11+132,20]];kol('El joystick conduce; FUEGO dispara el cañón. Pasá por las puertas de conos y destruí el blindado de madera.')}});
 return W}
function workUpd11(dt){const pp=P.g.position,w=L11.work;if(w){if(Math.hypot(pp.x-w.x,pp.z-w.z)>w.r+1.2||L9.cine){L11.work=null;return}w.t+=dt;$('pr').textContent=w.lbl+'… '+bar10(w.t/w.dur);if(w.t>=w.dur){L11.work=null;w.fn()}return}
 if(P.veh){$('pr').textContent=P.veh.kind==='tank'?'[USAR] Bajar de la tanqueta':'';return}if($('pr').textContent)return;for(const c of works11())if(Math.hypot(pp.x-c.x,pp.z-c.z)<c.r){$('pr').textContent='[E / USAR] '+c.lbl;return}}
/* granadas de instrucción en los círculos; un recluta con iniciativa */
const _bo21=boom;boom=function(pos){_bo21(pos);if(level!==11||L11.ph!==4)return;const X=X11;
 if(L11.st===6&&Math.hypot(pos.x-X-14,pos.z+78)<3.2){step11(7);kol('¡Dentro! Ahora detrás de la barricada: parábola, no línea recta.')}
 else if(L11.st===7&&Math.hypot(pos.x-X-28,pos.z+79)<2.8){step11(-1);const r=AMB11.form[1];r.g.position.set(X+2,0,-54.5);r.act='aim';later11(1.4,()=>{if(level!==11)return;burst(X+3,.4,-57.5,0x6a5a3a,20,.8,6);smoke(X+3,.5,-57.5,4,3,0x8a8a80,1,.5);expSnd(X+3,-57.5,.6);shake=Math.max(shake,.8);r.act='faint';talk([['Koller','¡SANITARIO!'],['Sanitario','¿Qué pasó?'],['Koller','¡Tenemos un idiota con iniciativa!'],()=>{r.act='idle';r.g.rotation.x=0;r.g.position.y=0;for(const t of L11.t8)tgtUp(t);L11.arm.includes('sword')||giveArm11('sword');step11(8);kol('Bayoneta: dos muñecos. Golpe con MEL, como si te debieran dinero.')}])})}
 else if((L11.st===6||L11.st===7)&&Math.hypot(pos.x-P.g.position.x,pos.z-P.g.position.z)<6)joke11('cerca',[['Koller','¡Lejos de vos, genio! ¡La granada se tira AL enemigo!']],10)};
/* armas: sólo las que te entregaron; granadas a partir de la trinchera */
const _fi21b=fire;fire=function(){if(level===11&&playing){if(P.veh){if(P.veh.kind==='tank')tankFire11();return}if(!P.mg&&!L11.arm.includes(P.cur)&&L11.ph!==0){if(!L11.armMsg||time-L11.armMsg>3){L11.armMsg=time;say(L11.arm.length?'Esa arma todavía no te la dieron, recluta. (ARM para cambiar)':'¡No tenés arma, recluta! Primero, el polígono.',1.8)}return}const w=P.weapons[P.cur],m=w?w.mag:0;_fi21b();if(w&&w.mag<m)L11.shots=(L11.shots||0)+1;return}_fi21b()};
const _sw21=swap;swap=function(){if(level===11&&L11.ph!==0){if(P.veh)return;if(!L11.arm.length){say('No tenés armas que cambiar.',1.2);return}for(let i=0;i<5;i++){_sw21();if(L11.arm.includes(P.cur)||P.pzfOn)break}return}_sw21()};
const _tg21=throwG;throwG=function(){if(level===11&&L11.ph!==0&&!L11.nades){say('Las granadas, en la trinchera. No antes.',1.6);return}if(P.veh)return;_tg21()};
const _in21=interact;interact=function(){if(level===11&&playing&&!L9.cine){if(P.veh){if(P.veh.kind==='tank'&&L11.st>=5)vehExit11();else if(P.veh.kind==='tank')say('Primero el circuito, después te bajás.',1.4);return}if(L11.work){L11.work=null;return}const pp=P.g.position;for(const c of works11())if(Math.hypot(pp.x-c.x,pp.z-c.z)<c.r){L11.work=Object.assign({},c,{t:0});return}}return _in21()};
/* pasar por debajo de la barrera (agachado) y del alambre (cuerpo a tierra) */
const _rs21=resolve;resolve=function(p,r,py){if(p===P.g.position&&level===11){const cl=P.pr?.5:P.cr?1:1.9,rm=[];for(let i=obstB.length-1;i>=0;i--){const b=obstB[i];if(b.under&&b.y0>=cl){rm.push(b);obstB.splice(i,1)}}_rs21(p,r,py);for(const b of rm)obstB.push(b);return}return _rs21(p,r,py)};
/* uniforme de recluta: gris azulado, sin casco de acero ni equipo de combate */
function recruitSkin11(on){const M={0x4f6272:CAMP.coat,0x3b4852:CAMP.pants,0x4a5258:CAMP.cap};P.g.traverse(o=>{if(!o.material||o.material===VCM||o.material.vertexColors)return;const m=o.material;if(on){if(m.u21===undefined)m.u21=m.color.getHex();const h=M[m.u21];if(h!==undefined)m.color.setHex(h)}else if(m.u21!==undefined)m.color.setHex(m.u21)});if(on)gear20(P.g,{web:true,boots:true});else gear20off(P.g);L11.skin=on}
/* ---------- lluvia de la llegada ---------- */
let RAIN11=null;function rain11(on){if(!RAIN11){const N=1400,g=new T.BufferGeometry(),a=new Float32Array(N*6);for(let i=0;i<N;i++){const x=(R()-.5)*60,y=R()*24,z=(R()-.5)*60;a.set([x,y,z,x+.05,y-.7,z],i*6)}g.setAttribute('position',new T.BufferAttribute(a,3));RAIN11=new T.LineSegments(g,new T.LineBasicMaterial({color:0xa0b0c0,transparent:true,opacity:.45}));RAIN11.frustumCulled=false;scene.add(RAIN11)}RAIN11.visible=on;L11.rain=on}
function rainUpd11(dt){if(!RAIN11||!RAIN11.visible)return;RAIN11.position.set(cam.position.x,0,cam.position.z);const a=RAIN11.geometry.attributes.position.array;for(let i=0;i<a.length;i+=6){a[i+1]-=dt*26;a[i+4]-=dt*26;if(a[i+4]<0){const y=20+R()*4;a[i+1]=y;a[i+4]=y-.7}}RAIN11.geometry.attributes.position.needsUpdate=true;V21.rs=(V21.rs||0)-dt;if(V21.rs<=0){V21.rs=1.6;nz18(0,1.8,'highpass',3000,2600,.012)}}
/* ---------- CINEMÁTICAS ---------- */
const T11=()=>L11.train.g.position;
function cineIntro11(){const X=X11;rain11(true);sky9('alba');const tr=L11.train;tr.g.position.x=X+190;const R_=[];for(let i=0;i<6;i++){const n=npc11(X-6+i*3.4,44,{name:'Recluta',pack:true,act:'idle',f:Math.PI});n.g.visible=false;R_.push(n)}L11.arrive=R_;
 const puddle=mesh(new T.CircleGeometry(1.6,16),0x2a2a30,X-8,.33,40);puddle.rotation.x=-1.5708;const bag=box(.5,.35,.3,0x6a5a3c,X-8,1.2,41.5);L11.bag=bag;
 KOL.g.position.set(X-30,0,38);KOL.tgt=null;KOL.act='behind';P.g.position.set(X-15,0,38.5);yaw=0;
 L9.tick=dt=>{const g=tr.g;if(g.position.x>X+10){g.position.x=Math.max(X+10,g.position.x-dt*Math.max(2,(g.position.x-X-10)*.55));if(R()<dt*6)smoke(g.position.x-2.4,4.6,48,1.4,2,0x3a3a3a,1.2,.5);V21.ch=(V21.ch||0)-dt;if(V21.ch<=0){V21.ch=.35;nz18(0,.25,'lowpass',500,200,.05)}}};
 cine9([{d:4.6,a:[X-40,7,22],b:[X-30,6,26],la:()=>[T11().x,2.4,48],txt:'Eisenmark, 1922. Distrito militar de Tokovsky.'},
  {d:3.2,a:[X-10,2.2,34],b:[X-12,2,33],la:[X-6,1.4,42],txt:'Recluta 1: «¿Este es Tokovsky? Pensé que nos iban a mandar a un campamento.»',fn:(dt,u)=>{if(u<.05)for(const [i,n] of R_.entries()){n.g.visible=true;n.g.position.set(X-6+i*3.4,.6,45);n.tgt=[X-8+i*2.6,39.5];n.sp=1.6}R_[1].act='vomit'}},
  {d:2.4,a:[X-4,1.9,36],la:[X-1,1.5,40],txt:'Recluta 2: «Esto es un campamento.»'},
  {d:2.2,a:[X-4,1.9,36],la:[X-6,1.5,40],txt:'Recluta 1: «¿Y el edificio?»'},
  {d:3.6,a:[X+2,2.5,36],b:[X+8,3,34],la:[X+25,2,29],txt:'Recluta 2: «Eso es la enfermería. Si llegás vivo, te dejan dormir ahí.»'},
  {d:3.4,a:[X-24,1.9,34],b:[X-26,1.9,35],la:[X-30,1.7,40],txt:'Un oficial con un cigarrillo observa la fila. Un recluta pierde su mochila: cae en el charco.',fn:(dt,u)=>{if(u>.4){bag.position.y=Math.max(.45,bag.position.y-dt*6);if(bag.position.y<=.46&&!L11.spl){L11.spl=1;burst(X-8,.4,40,0x4a4a50,12,.4,4)}}}},
  {d:5,a:[X-20,1.9,33],b:[X-17,1.8,34],la:()=>[KOL.g.position.x,1.7,KOL.g.position.z],txt:'Sargento instructor Koller: «¡Formación! ¡Alineados! ¡Y el que todavía esté buscando su equipaje, que se acuerde de que en el frente no hay oficina de objetos perdidos!»',fn:(dt,u)=>{if(u<.05){KOL.tgt=[X-17,38.4];KOL.sp=1.6}for(const [i,n] of R_.entries()){n.act=i===1?'vomit':'idle';n.tgt=n.tgt||null;n.f=Math.PI}}},
  {d:2.4,a:()=>[KOL.g.position.x+1.4,1.75,KOL.g.position.z-1.6],la:()=>[KOL.g.position.x,1.75,KOL.g.position.z],txt:'Koller: «Vos. ¿Nombre?»'},
  {d:2.4,a:()=>[P.g.position.x-1.2,1.7,P.g.position.z-1.6],la:()=>[P.g.position.x,1.6,P.g.position.z],txt:'«Recluta Kasimir Wolff, mi sargento.»'},
  {d:4.6,a:()=>[KOL.g.position.x+1.4,1.75,KOL.g.position.z-1.6],la:()=>[KOL.g.position.x,1.75,KOL.g.position.z],txt:'Koller: «Perfecto. Otro voluntario para una profesión que no tiene vacaciones, sueldo digno ni garantía de devolución.»'},
  {d:5.4,a:()=>[KOL.g.position.x-2,2.1,KOL.g.position.z-3],la:()=>[KOL.g.position.x,1.6,KOL.g.position.z],txt:'Koller: «Bienvenido a Tokovsky. Aquí vamos a enseñarte tres cosas: cómo caminar, cómo disparar y cómo evitar que te maten por hacer alguna estupidez.»'},
  {d:4.6,a:()=>[KOL.g.position.x+2.4,1.9,KOL.g.position.z-2],la:()=>[KOL.g.position.x,1.7,KOL.g.position.z],txt:'Koller: «En ese orden. Si aprendés la tercera antes que las otras dos, te consideraremos un genio.»'},
  {d:3.6,a:[X+30,26,60],b:[X+20,30,70],la:[X,0,-20],txt:'TOKOVSKY · DÍA 1 — INSTRUCCIÓN BÁSICA'}],
  ()=>{tr.g.position.x=X+10;R_[1].act='idle';for(const [i,n] of R_.entries()){n.g.visible=true;n.g.position.y=0;n.tgt=[X-40+i*3,-30+(i%2)*2];n.sp=1.8}bag.position.y=.45;rain11(false);sky9('manana');L11.sky='manana';story('');go11(1)},
  [{t:0,fn:()=>{whistle11()}},{t:56,fn:()=>{tr.g.position.x=X+10},must:true}])}
function cineFaint11(){const X=X11,r=AMB11.form[0];L9.tick=null;
 cine9([{d:2.6,a:[X-12,1.8,3],la:()=>[r.g.position.x,1.2,r.g.position.z],txt:'Un recluta se desmaya de pie.',fn:()=>{r.act='faint'}},
  {d:2.4,a:()=>[KOL.g.position.x+1.4,1.8,KOL.g.position.z+1.8],la:()=>[KOL.g.position.x,1.7,KOL.g.position.z],txt:'Koller: «¡Soldado! ¡¿Está muerto?!»'},
  {d:2.6,a:()=>[AMB11.med.g.position.x+1.5,1.7,AMB11.med.g.position.z+1.5],la:()=>[r.g.position.x,.5,r.g.position.z],txt:'Sanitario: «No, mi sargento. Está agotado.»',fn:(dt,u)=>{if(u<.05){AMB11.med.g.position.set(r.g.position.x+1.2,0,r.g.position.z+1);AMB11.med.act='crouch'}}},
  {d:3.6,a:()=>[KOL.g.position.x-1.2,1.75,KOL.g.position.z+2],la:()=>[KOL.g.position.x,1.7,KOL.g.position.z],txt:'Koller: «¡Qué decepción! ¡Por un segundo pensé que había conseguido silencio!»'}],
  ()=>{r.act='idle';r.g.rotation.x=0;r.g.position.y=0;AMB11.med.act='idle';AMB11.med.g.position.set(X+24,0,23);talk([['Koller','¡Al polígono! El fusil no es una herramienta para rascarse.']]);go11(3)})}
function cineMG11(){const X=X11,r=AMB11.form[2];r.g.position.set(X+12,0,-54.5);r.act='crouch';Object.assign(MGL11,{on:true,x:X+52,z:-80,axis:'z',x0:X+30,z0:-58,z1:-102,lx0:X+33,lx1:X+45,lz0:-102,lz1:-58,slow:0,msg:'¡Fogueo! ¡Te dieron! ¡CUERPO A TIERRA!'});
 cine9([{d:3,a:[X+20,2.2,-50],b:[X+16,2,-52],la:[X+8,1,-58],txt:'Un instructor abre fuego con una ametralladora de fogueo sobre la línea.'},
  {d:3,a:()=>[KOL.g.position.x+1.5,1.8,KOL.g.position.z+1.5],la:()=>[KOL.g.position.x,1.7,KOL.g.position.z],txt:'Koller: «¡Cobertura, recluta! ¡La bala no va a detenerse porque tengas una opinión!»'},
  {d:2.4,a:[X+16,1.6,-52],la:()=>[r.g.position.x,1.5,r.g.position.z],txt:'Un recluta se levanta en medio del fuego.',fn:()=>{r.act='idle'}},
  {d:2.2,a:()=>[KOL.g.position.x+1.5,1.8,KOL.g.position.z+1.5],la:()=>[KOL.g.position.x,1.7,KOL.g.position.z],txt:'Koller: «¡¿Qué demonios estás haciendo?!»'},
  {d:2.4,a:[X+15,1.7,-52],la:()=>[r.g.position.x,1.6,r.g.position.z],txt:'Recluta: «¡Pensé que había terminado, mi sargento!»'},
  {d:2.8,a:()=>[KOL.g.position.x-1.2,1.8,KOL.g.position.z+1.8],la:()=>[KOL.g.position.x,1.7,KOL.g.position.z],txt:'Koller: «¡Pensar es opcional, sobrevivir no!»',fn:()=>{r.act='crouch'}}],
  ()=>{r.act='idle';kol('¡Tu turno! Cuerpo a tierra (TUM) y arrastrate bajo el fuego hasta la bandera.')})}
function cineMG0811(){const X=X11;koller(X+79,-44);
 cine9([{d:3.6,a:[X+84,1.8,-42],b:[X+83,1.7,-43],la:[X+80,1.2,-48],txt:'Koller descubre la MG 08: «Esta belleza pesa más que algunos reclutas y tiene mejor juicio que otros.»'},
  {d:2.4,a:[X+76,1.8,-41],la:[X+79,1.6,-44],txt:'Recluta: «¿Podemos llevárnosla al frente?»'},
  {d:3.6,a:[X+77,1.8,-42],la:()=>[KOL.g.position.x,1.7,KOL.g.position.z],txt:'Koller: «Sí. Si podés llevarla, montarla, alimentarla y mantenerla funcionando.»'}],()=>{step11(2);for(const t of L11.t5b)tgtUp(t)})}
function cineAlarm11(){const X=X11;koller(X+30,-150);L11.siren=1;sky9('tarde');L11.sky='tarde';for(const [x,z] of[[X+20,-200],[X+50,-210],[X+5,-190]])mkFire(x,z,1,0,-1);
 cine9([{d:3.4,a:[X-30,8,-120],b:[X-20,9,-126],la:[X+30,4,-200],txt:'Suena una sirena. Columnas de humo se levantan sobre el sector norte.'},
  {d:3,a:()=>[AMB11.off.g.position.x+2,1.8,AMB11.off.g.position.z+2],la:()=>[AMB11.off.g.position.x,1.6,AMB11.off.g.position.z],txt:'Oficial: «¡Todo el personal a sus puestos! ¡Ataque al sector norte!»',fn:(dt,u)=>{if(u<.05){AMB11.off.g.position.set(X-40,0,-147);AMB11.off.tgt=[X-30,-160];AMB11.off.sp=5;AMB11.off.act='run'}}},
  {d:2.4,a:()=>{const s=(L11.sq||[])[0];const p=s?s.g.position:P.g.position;return[p.x+1.4,1.8,p.z+1.4]},la:()=>{const s=(L11.sq||[])[0];const p=s?s.g.position:P.g.position;return[p.x,1.6,p.z]},txt:'Recluta: «¡¿Nos atacan?!»'},
  {d:4,a:()=>[KOL.g.position.x+1.6,1.8,KOL.g.position.z+1.6],la:()=>[KOL.g.position.x,1.7,KOL.g.position.z],txt:'Koller: «¡Es un ejercicio, imbécil! ¡Si fuera real, ya estarías llorando en otro idioma!»'}],
  ()=>{AMB11.off.act='smoke';P.weapons.rifle.reserve+=20;giveArm11('smg');P.grenades=Math.max(P.grenades,4);L11.cp=[X+38,-155];if(L11.sq)sqOrder11('seguir',true);talk([['Koller','Te dan un arma, un cargador extra y un objetivo. Aplicá todo lo de hoy. ¡Sector Norte!']]);
   for(const [k,x,z] of[['fus',20,-174],['fus',35,-175],['gra',50,-174],['fus',62,-176],['ofi',42,-180]]){const e=s10(k,X+x,z);if(e){e.t11='n1';e.train=1;e.hp*=.6}}},[{t:0,fn:()=>{for(let i=0;i<4;i++)tn18('sawtooth',300,900,1.4,.04,i*1.5)},must:false}])}
function cineClose11(){const X=X11;const r=(L11.sq||[]).find(s=>s.alive)||null;whistle11();
 cine9([{d:2.6,a:[X+30,2,-238],b:[X+32,2.2,-240],la:[X+38,1,-246],txt:'Una explosión de entrenamiento levanta barro.',fn:(dt,u)=>{if(u<.05){burst(X+36,.5,-243,0x6a5a3a,30,1,8);smoke(X+36,.6,-243,5,4,0x8a8070,1.2,.5);expSnd(X+36,-243,1);shake=1.2;if(r){r.down=4;r.g.position.set(X+36,0,-242)}}}},
  {d:2.2,a:[X+34,1.2,-240],la:[X+36,.4,-242],txt:'Recluta: «¡Estoy herido!»'},{d:2.4,a:()=>[KOL.g.position.x+1.4,1.8,KOL.g.position.z+1.4],la:()=>[KOL.g.position.x,1.7,KOL.g.position.z],txt:'Koller: «¡No estás herido! ¡Te caíste!»',fn:(dt,u)=>{if(u<.05)KOL.g.position.set(X+33,0,-238)}},
  {d:2,a:[X+34,1.2,-240],la:[X+36,.4,-242],txt:'Recluta: «¡Me duele!»'},{d:3,a:()=>[KOL.g.position.x-1.2,1.8,KOL.g.position.z+1.8],la:()=>[KOL.g.position.x,1.7,KOL.g.position.z],txt:'Koller: «¡Eso es el suelo! ¡El suelo no tiene simpatía!»'},
  {d:3.4,a:[X+20,4,-228],b:[X+16,5,-226],la:[X+38,1,-245],txt:'Silbato largo. Koller: «¡Alto el fuego! ¡Fin del ejercicio!» Algunos se ríen; otros se tiran al barro.',fn:(dt,u)=>{if(u<.05){whistle11();for(const e of[...enemies])kill(e);for(const s of L11.sq||[])if(s.alive){s.down=6}}}}],()=>cineFinal11())}
function cineFinal11(){const X=X11;sky9('tarde');L11.sky='tarde';for(const p of LT.pts)p.on=false;const S=[];for(let i=0;i<7;i++){const c=box(.9,.6,.6,0x5a4a2a,X-9+i*3,.3,-1);S.push(c);const n=npc11(X-9+i*3,-1.2,{act:i===3?'smokesit':'sit',f:Math.PI,gun:i%2?'r':null,hat:i%3?'cap':'helm',hatC:CAMP.helm});n.g.position.y=0}
 P.g.position.set(X+2,0,-1.4);yaw=0;KOL.g.position.set(X-12,0,-5);KOL.tgt=null;KOL.act='behind';KOL.path=[[X-12,-5],[X+12,-5]];KOL.sp=.9;for(const n of NPC11)if(n.act==='march')n.g.visible=false;
 const K=()=>KOL.g.position,kc=(dx,dz)=>()=>[K().x+dx,1.8,K().z+dz],kl=()=>[K().x,1.65,K().z];
 cine9([{d:4,a:[X-24,6,-14],b:[X-18,5,-12],la:[X,1,-2],txt:'Atardecer en Tokovsky. Los reclutas, sentados sobre cajas de munición vacías. Cubiertos de barro.'},
  {d:5.4,a:kc(1.6,-2.2),la:kl,txt:'Koller: «Hoy aprendieron a caminar, disparar, cargar, apuntar, obedecer y, por milagro, no matarse entre ustedes.»'},
  {d:3.6,a:kc(-1.6,-2.2),la:kl,txt:'Pausa. Enciende un cigarrillo.',fn:(dt,u)=>{KOL.path=null;KOL.act='smoke'}},
  {d:4.4,a:kc(1.4,-2),la:kl,txt:'Koller: «No son soldados todavía. Algunos ni siquiera parecen personas funcionales.»'},
  {d:2.6,a:[X-4,1.4,-4],la:[X+2,1.2,-1],txt:'Los reclutas se miran.'},
  {d:3.4,a:kc(1.6,-2),la:kl,txt:'Koller: «Pero mañana empezamos a entrenar como corresponde.»'},
  {d:2.6,a:[X-6,1.4,-4.5],la:[X-6,1.2,-1],txt:'Recluta: «Mi sargento, ¿mañana es más difícil?»'},{d:1.8,a:kc(1.2,-2),la:kl,txt:'Koller: «Mucho más.»'},
  {d:1.8,a:[X-6,1.4,-4.5],la:[X-6,1.2,-1],txt:'Recluta: «¿Y después?»'},{d:2.6,a:kc(-1.2,-2),la:kl,txt:'Koller: «Después viene la guerra.»'},
  {d:2.4,a:[X,6,-16],b:[X,6.5,-17],la:[X,1,-1],txt:'Silencio.'},
  {d:6,a:kc(1.6,-2.4),b:kc(1.2,-1.8),la:kl,txt:'Koller: «Y la guerra no tiene instructor. No tiene silbato. No tiene blancos de madera. No te avisa cuándo te equivocaste.»'},
  {d:6,a:()=>[P.g.position.x-1.2,1.7,P.g.position.z-2.4],la:()=>[P.g.position.x,1.3,P.g.position.z],txt:'Koller: «Así que escuchá, recluta. Acá te voy a gritar, te voy a hacer correr y probablemente te voy a llamar idiota más veces de las que tu madre te llamó por tu nombre.»',fn:(dt,u)=>{if(u<.05){KOL.g.position.set(P.g.position.x-.6,0,P.g.position.z-1.6);KOL.act='behind'}}},
  {d:5.6,a:kc(1.1,-1.6),la:kl,txt:'Koller: «Pero si aprendés, quizá algún día vuelvas de esa mierda. Y eso es más de lo que puedo prometerte.»'},
  {d:4.4,a:[X+6,3,-12],b:[X+10,4,-14],la:()=>[K().x,1.5,K().z],txt:'Koller: «¡BARRACONES! ¡CENAR! ¡Y EL QUE SE QUEJE, QUE SE COMA SU PROPIO CASCO!»',fn:(dt,u)=>{if(u<.05){KOL.tgt=[X-30,-6];KOL.sp=2}}},
  {d:2.4,a:[X-6,1.4,-4.5],la:[X-6,1.2,-1],txt:'Recluta: «¿Mi sargento, qué hay de cena?»'},{d:3,a:[X+6,3,-12],la:()=>[K().x,1.5,K().z],txt:'Koller: «¡Lo que no te haya matado hoy!»'},
  {d:4,a:[X+40,40,40],b:[X+60,60,60],la:[X,0,-10],txt:'TOKOVSKY — INSTRUCCIÓN COMPLETADA · Campaña desbloqueada'}],()=>{try{localStorage.setItem('tokovsky21','1')}catch(e){}L11.won=1;end(true)})}
/* ---------- actualización del campamento ---------- */
function later11(t,f){(L11.tq||(L11.tq=[])).push({t,f})}
function fx11(dt,cine){if(L11.tq&&L11.tq.length){for(const q of L11.tq)q.t-=dt;const due=L11.tq.filter(q=>q.t<=0);L11.tq=L11.tq.filter(q=>q.t>0);for(const q of due)q.f()}skyMesh.position.copy(cam.position);if(cine){updParts(dt);updRag(dt)}smokeUpd(dt);tracerUpd(dt);fireUpd(dt);lightsUpd(dt);chUpd(dt);shellUpd(dt);if(L9.tick)L9.tick(dt);npcUpd11(dt);kolUpd(dt);tgtUpd(dt);if(!L9.cine)dlgUpd(dt);rainUpd11(dt);mgLane11(dt);vehUpd11(dt);
 V21.cs=(V21.cs||0)-dt;if(V21.cs<=0){V21.cs=.7;for(const [x,z] of[[-41.5,12],[-41.5,-4],[-41.5,-20],[40.5,18]])smoke(X11+x,6,z,.6,1,0x8a8a8a,.6,.35);if(L11.train&&L11.train.g.position.x<=X11+11)smoke(L11.train.g.position.x-2.4,4.6,48,.8,1.4,0x6a6a6a,.8,.4)}
 const F=L9.fog;if(F){const k=Math.min(1,dt*2);scene.fog.color.lerp(F.c,k);scene.fog.near+=(F.n-scene.fog.near)*k;scene.fog.far+=(F.f-scene.fog.far)*k}}
function updT11(dt){fx11(dt,false);garUpd(dt);pinUpd10();workUpd11(dt);const ph=L11.ph;
 if(ph===1)upd11_1(dt);else if(ph===2)upd11_2(dt);else if(ph===3)upd11_3(dt);else if(ph===4)upd11_4(dt);else if(ph===5)upd11_5(dt);else if(ph===6)upd11_6(dt);else if(ph===7)upd11_7(dt);else if(ph===8)upd11_8(dt);
 if(L11.sq&&L11.ord==='seguir'){L11.ft=(L11.ft||0)-dt;if(L11.ft<=0){L11.ft=1.2;sqOrder11('seguir',true)}}
 V21.am=(V21.am||4)-dt;if(V21.am<=0){V21.am=6+R()*8;const k=R();if(k<.3)whistle11();else if(k<.6)npcShot('rifle',X11-50+R()*20,-90);else if(k<.75)nz18(0,1.2,'lowpass',260,120,.04);else tn18('sine',880,880,.6,.02)}
 if(L11.siren&&ph===8&&L11.st<1){V21.sir=(V21.sir||0)-dt;if(V21.sir<=0){V21.sir=3;tn18('sawtooth',300,900,1.4,.025)}}
 if(L11.ot&&!L9.cine)$('obj').textContent=L11.ot;if(L11.ph!==0&&!P.mg&&!P.veh&&!L11.arm.includes(P.cur))$('ammo').textContent=L11.arm.length?'ARMA NO ENTREGADA · ARM para cambiar':'SIN ARMA — RECLUTA';const ar=$('arrow');if(L9.obj&&!L9.cine){const pp=P.g.position,ddx=L9.obj[0]-pp.x,ddz=L9.obj[1]-pp.z,fx=-Math.sin(yaw),fz=-Math.cos(yaw),rx=Math.cos(yaw),rz=-Math.sin(yaw);ar.style.display='block';ar.style.transform='rotate('+(Math.atan2(ddx*rx+ddz*rz,ddx*fx+ddz*fz)*57.3)+'deg)'}else ar.style.display='none';
 const el=$('gar');if(L11.sq&&!L9.cine){el.style.display='block';el.innerHTML='ESCUADRA DE INSTRUCCIÓN <b>'+L11.sq.filter(s=>s.alive).length+'/4</b> · ORDEN: <b>'+L11.ord.toUpperCase()+'</b> (ORD / T)'}else el.style.display='none';
 ambUpd(dt,.7)}
function startLevel11(){const X=X11;level=11;build11();clearStage();WC.x=X+20;WC.z=-90;WC.r=236;mobs.forEach(m=>scene.remove(m.g));mobs=[];convoy.forEach(v=>scene.remove(v.g));convoy=[];npcs.forEach(n=>scene.remove(n.g));npcs=[];lightsInit();for(const p of LT.pts)p.on=false;searchSet(false);
 for(const s of GAR)scene.remove(s.g);GAR.length=0;for(const c of CAV)if(c.g)scene.remove(c.g);CAV.length=0;CAVS.st='off';L9.tgts=[];L9.def=false;L9.obj=null;L9.cine=0;if(L10.eis)eisOff();
 allies.forEach(a=>{if(a.name)a.g.visible=false});if(officer)officer.g.visible=false;if(MED)MED.g.visible=false;spawnCamp11();setupTargets11();recruitSkin11(true);
 refill(2);P.grenades=0;L11.arm=[];L11.nades=false;L11.ph=0;L11.st=0;L11.sq=null;P.cur='rifle';P.g.visible=true;$('tc').style.display='block';playing=true;ambStart();sky9('manana');L11.sky='manana';
 const ex=+(($('ex11')||{}).value||0);L11.ex=ex;story('MISIÓN 0 — CAMPAMENTO TOKOVSKY');setTimeout(()=>story(''),2600);
 if(ex===0)cineIntro11();else if(ex===9){L11.ph=0;for(const w of['rifle','smg','revolver','sword'])giveArm11(w);L11.nades=true;P.grenades=6;P.g.position.set(X,0,5);obj11('Tokovsky · exploración libre: polígono, trinchera, armas y vehículos');for(const T_ of[L11.t1,L11.t2,L11.t5,L11.t5b,L11.t5c])for(const t of T_)tgtUp(t)}
 else{const S=[null,[X-15,38],[X+122,0],[X,-2],[X-46,-40],[X+6,-50],[X+70,-40],[X+84,22],[X-45,-146]][ex];P.g.position.set(S[0],0,S[1]);if(KOL)KOL.g.position.set(S[0]-2,0,S[1]-2);armFor11(ex);go11(ex);if(ex===8){spawnSquad11(false)}}}
/* ---------- integración ---------- */
AMBL[11]=['wind','dog','bird','bell','arty','wind'];
const _au21=allyUpdate;allyUpdate=function(dt){if(level===11){for(const a of allies)if(a.name)a.g.visible=false;if(officer)officer.g.visible=false;return}return _au21(dt)};
const _mu21=medUpd;medUpd=function(dt){if(level===11){if(MED)MED.g.visible=false;return}return _mu21(dt)};
const _up21=update;update=function(dt){if(level===11&&L9.cine&&playing){V16.dt=dt;time+=dt;cine9Upd(dt);fx11(dt,true);return}_up21(dt);if(!playing)return;coverUpd(dt);if(V21.prK>.01)cam.position.y=Math.max(.55,cam.position.y-V21.prK*1.05);
 if(level===11)updT11(dt);else{if(L11.skin)recruitSkin11(false);if(RAIN11&&RAIN11.visible)rain11(false)}
 if(!$('pr').textContent&&!P.cover&&!P.veh&&!L9.cine){V21.cf=(V21.cf||0)-dt;if(V21.cf<=0){V21.cf=.3;V21.cnear=!!(firing||enemies.some(e=>e.active&&Math.hypot(e.g.position.x-P.g.position.x,e.g.position.z-P.g.position.z)<35))&&!!coverFind()}if(V21.cnear)$('pr').textContent='[F / CUB] Ponerse a cubierto'}};
const _rp21=respawnP;respawnP=function(){_rp21();P.pr=false;P.cover=null;if(level===11){if(P.veh)vehExit11();P.g.position.set(L11.cp[0],0,L11.cp[1]);P.g.position.y=0;P.mg=false;L11.work=null}};
const _end21=end;end=function(w){_end21(w);if(level===11&&w){$('menu').querySelector('h1').textContent='TOKOVSKY — INSTRUCCIÓN COMPLETADA';$('tx').innerHTML='Caminar, correr, saltar, agacharse, cuerpo a tierra, coberturas, fusil, subfusil, pistola, bayoneta, granadas, MG 08, mortero, cañón, camión, tanqueta y escuadra: todo aprendido en un día bajo los gritos del sargento Koller.<br><br><b style="color:#e0b050">Campaña desbloqueada.</b> El campamento queda abierto para repetir cualquier ejercicio o explorarlo libremente (menú → Misión 0 → EJERCICIO).<br><br><b style="font-size:20px;color:#e0b050">PUNTUACIÓN: '+score+'</b><br><i>«Y la guerra no tiene instructor.»</i>';try{const o=$('lvsel').querySelector('option[value="11"]');if(o)o.text='0 · CAMPAMENTO TOKOVSKY — Instrucción ✔ completada'}catch(e){}}};
{const done=(()=>{try{return localStorage.getItem('tokovsky21')==='1'}catch(e){return false}})();
 $('lvsel').insertAdjacentHTML('afterbegin','<option value="11">0 · CAMPAMENTO TOKOVSKY — Instrucción '+(done?'✔ completada':'básica (empieza aquí)')+'</option>');if(!done)$('lvsel').value='11';
 const S='background:#302417;color:#f3e6c4;padding:10px;border:1px solid #a77b35';$('lvsel').parentElement.insertAdjacentHTML('afterend','<label id="ex11l">EJERCICIO <select id="ex11" style="'+S+'"><option value="0">Instrucción completa (con llegada en tren)</option><option value="1">I · Las piernas son gratis (movimiento y obstáculos)</option><option value="2">II · La disciplina no se negocia</option><option value="3">III · Polígono de tiro</option><option value="4">IV · Trinchera: recarga, cobertura, granadas, bayoneta</option><option value="5">V · Exposición de armas (MP, MG 08, mortero, cañón, pistola)</option><option value="6">VI · Vehículos (camión y tanqueta)</option><option value="7">VII · Escuadra y órdenes</option><option value="8">VIII · La última prueba: Sector Norte</option><option value="9">Exploración libre del campamento</option></select></label>');
 const sx=()=>{$('ex11l').style.display=$('lvsel').value==='11'?'':'none'};$('lvsel').addEventListener('change',sx);sx()}
try{if(sessionStorage.getItem('sel11')){const v=sessionStorage.getItem('sel11');sessionStorage.removeItem('sel11');$('lvsel').value='11';$('ex11').value=v;$('ex11l').style.display=''}}catch(e){}
const _g21=$('go').onclick;$('go').onclick=function(){if($('lvsel').value!=='11')return _g21.apply(this,arguments);if(L11.built){try{sessionStorage.setItem('sel11',$('ex11').value)}catch(e){}location.reload();return}V20.ps2=$('ps2fog').value;try{ac=new(window.AudioContext||window.webkitAudioContext)();if(ac.state==='suspended')ac.resume();startMusic()}catch(e){}assignBots();$('menu').style.display='none';P.g.visible=true;cam.fov=65;cam.updateProjectionMatrix();startLevel11();try{rend.domElement.requestPointerLock()}catch(e){}};
document.querySelector('#menu p b').textContent='Misión 0 + Capítulos I–X · v21 CAMPAMENTO TOKOVSKY';
$('hs').insertAdjacentHTML('beforebegin','<p class="c" style="color:#d8e0f0">NUEVO v21 · Misión 0 «Campamento Tokovsky» (instrucción completa con el sargento Koller) · cuerpo a tierra y arrastrarse (Z / TUM) · coberturas al estilo Gears (F / CUB) · animaciones de disparo y cerrojo · catafractos activos hasta el final · refinería ampliada</p>');
/* bayoneta / culatazo contra los muñecos y blancos de instrucción */
const _me21=melee;melee=function(){_me21();if(level!==11)return;later11(.18,()=>{const p=P.g.position,fx=-Math.sin(yaw),fz=-Math.cos(yaw);for(const t of TG11){if(!t.up)continue;const dx=t.g.position.x-p.x,dz=t.g.position.z-p.z,d=Math.hypot(dx,dz);if(d<2.8&&(dx*fx+dz*fz)/(d||1)>.2)tgtHit(t,'m')}})};
/* navegación del campamento: rodear tramos de valla largos (circuito, berma, parapetos) por sus extremos */
const WS11=[{z:5.2,x0:42,x1:130},{z:-5.2,x0:42,x1:130}];
function route11(a,tx,tz){const p=a.g.position,X=X11;for(const w of WS11){const z=w.z,s1=p.z-z,s2=tz-z;if(s1*s2>=0)continue;const k=s1/(s1-s2),cx=p.x+(tx-p.x)*k-X;if(cx<w.x0-1||cx>w.x1+1)continue;const E=(Math.abs(p.x-X-(w.x0-4))+Math.abs(tx-X-(w.x0-4))<Math.abs(p.x-X-(w.x1+4))+Math.abs(tx-X-(w.x1+4)))?w.x0-4:w.x1+4;if(Math.abs(p.x-X-E)>2)return[X+E,p.z];return[X+E,tz]}return null}
const _r11=route8;route8=function(a,tx,tz){return level===11?route11(a,tx,tz):_r11(a,tx,tz)};
