/* =====================================================================
   v37_veh · DOTACIONES DE PIEZAS (antitanque, cañón de campaña, mortero)
   · Sirvientes visibles y animados: el apuntador sigue la puntería (dirección
     y elevación), el cargador gira, recibe el proyectil y lo introduce, el
     proveedor va y viene de las cajas, el jefe de pieza observa; todos acusan
     el retroceso al disparar.
   · gunCrew32(gun,{side,n,r,spawn,tag}) deja la pieza servida y, si una
     amenaza cercana persiste, la dotación la abandona de a uno (no de golpe)
     y pelea como infantería con el sistema del nivel (sp17/ally17 en el 17,
     sp13/npc11 en los demás, o el spawn propio que se pase).
   ===================================================================== */
const VGC37={n:0,gone:0,men:0};
function vgcInit37(v){if(v.gcA)return v.gcA;const roles=v.type==='mortar'?['gunner','loader']:['gunner','loader','carrier','observer'];
 return v.gcA={L:v.crew.map((m,i)=>({m,role:roles[i]||'carrier',x:m.position.x,y:m.position.y,z:m.position.z,ry:m.rotation.y,rx:m.rotation.x,ph:R()*6})),yaw0:0}}
/* animación barata: sólo piezas cercanas a la cámara */
function vgcAnim37(v,dt){const m=v.mounts[0];if(!m||!v.crew.length)return;const p=v.g.position;if(Math.abs(p.x-cam.position.x)+Math.abs(p.z-cam.position.z)>140)return;const A=vgcInit37(v);
 const cd0=m.cd0||4,ld=vhCL32(m.cd/cd0,0,1),rec=m.rec||0,trav=vhCL32(Math.abs(m.yaw-A.yaw0)/Math.max(dt,1e-3),0,1.5);A.yaw0=m.yaw;const aim=!!m.tgt&&v.fire,mort=v.type==='mortar';
 for(const c of A.L){const o=c.m;if(!o.visible)continue;c.ph+=dt;let x=c.x,y=c.y,z=c.z,ry=c.ry,rx=c.rx;
  if(c.role==='gunner'){/* a la mira: se inclina, sigue la elevación, acusa el disparo */if(aim){rx+=-.16-(m.pit||0)*.35;z+=.06}y+=Math.sin(c.ph*9)*.012*trav;z-=rec*.16;rx+=rec*.18}
  else if(c.role==='loader'){/* ciclo de carga: gira al proveedor, recibe, se vuelve e introduce el proyectil */
   if(mort){if(aim&&ld<.2)rx+=-.55*(1-ld/.2);else if(ld>.3&&ld<.85)ry+=.7}
   else if(ld>.6){ry+=1.1*Math.sin(Math.min(1,(1-ld)/.4)*Math.PI*.5)}else if(ld>.25){ry+=1.1;rx+=-.25}else{const k=ld/.25;ry+=1.1*k;rx+=-.35*(1-k);z+=.22*(1-k)}
   z-=rec*.12;rx+=rec*.1}
  else if(c.role==='carrier'){/* va a las cajas y vuelve con la munición */const k=Math.sin(vhCL32((ld-.35)/.65,0,1)*Math.PI);z-=k*1.1;x+=k*.25;ry+=k>.05?(ld>.67?Math.PI*.85:0):0;y+=Math.abs(Math.sin(c.ph*7))*.03*k}
  else if(c.role==='observer'){ry+=aim?-.15:Math.sin(c.ph*.45)*.5;rx+=-rec*.08}
  o.position.set(x,y,z);o.rotation.set(rx,ry,0)}}
/* hostiles de a pie cerca de la pieza */
function vgcThreat37(v,r){const p=v.g.position;let bd=r,b=null;
 if(v.ally){for(const e of enemies){if(!e||e.hp<=0||!e.g.parent)continue;const d=Math.hypot(e.g.position.x-p.x,e.g.position.z-p.z);if(d<bd){bd=d;b=e}}}
 else{if(playing&&P.hp>0){const d=Math.hypot(P.g.position.x-p.x,P.g.position.z-p.z);if(d<bd){bd=d;b=P}}for(const n of vhAllies32()){if(!n.g||!n.g.visible||n.down29||n.down17||n.dead17)continue;const d=Math.hypot(n.g.position.x-p.x,n.g.position.z-p.z);if(d<bd){bd=d;b=n}}}
 if(b&&bd>5&&!losClear(p.x,1.3,p.z,b.g.position.x,1.3,b.g.position.z))return null;return b?{t:b,d:bd}:null}
/* un sirviente baja de la pieza y pasa a ser infantería del nivel */
function vgcSpawn37(v,C,m,i){v.g.updateMatrixWorld(true);const w=m.getWorldPosition(new T.Vector3()),lx=w.x-VEH32.X,ry=v.g.rotation.y+(v.mounts[0]?v.mounts[0].yaw:0);let n=null;
 try{if(C.spawn)n=C.spawn(w.x,w.z,i,v);
  else if(C.side==='veyrn'){if(level===17&&typeof sp17==='function')n=sp17(i===0?'mosin':R()<.5?'stv':'mosin',lx,w.z,{tag:C.tag,kind:'crew'});
   else if(typeof sp13==='function'){n=sp13('mosin',w.x-X13,w.z,{tag:C.tag});if(typeof veyrn32==='function')try{veyrn32(n,'crew')}catch(e){}n.unaware=false;n.active=true}}
  else{if(level===17&&typeof ally17==='function')n=ally17(lx,w.z,{kind:'rifle',name:'Artillero '+['Vask','Orel','Tamm','Lev'][i%4]});
   else if(typeof npc11==='function'){n=npc11(w.x,w.z,{name:'Artillero',hat:'helm'});if(typeof arm13==='function')arm13(n,'r');if(typeof volsk32==='function')try{volsk32(n,'rifle')}catch(e){}n.lv=level}}}catch(e){console.warn('gunCrew32',e)}
 if(n&&n.g){n.g.position.set(w.x,vhFlo32(w.x,w.z),w.z);n.g.rotation.y=ry;n.gun32=v;n.sp37=[Math.round(w.x-VEH32.X),Math.round(w.z)];C.men.push(n);VGC37.men++;VEH32.dbg.dismount++}return n}
function vgcUpd37(v,dt){const C=v.gc;if(!C||C.state==='gone')return;if(!v.alive||!v.on){C.state='gone';return}C.tt-=dt;if(C.tt>0)return;C.tt=.3;
 if(C.state==='manned'){if(!C.abandon)return;const t=vgcThreat37(v,C.r);if(t){C.thr+=t.d<C.r*.45?.6:.3}else C.thr=Math.max(0,C.thr-.15);
  if(C.thr>=1.5||(t&&v.crewMax&&v.crewHp<v.crewMax*.35)){C.state='leaving';v.fire=false;for(const mm of v.mounts){mm.tele=0;mm.burst=0;if(mm.gl)mm.gl.visible=false}
   const vis=v.crew.filter(c=>c.visible);C.q=vis.slice(1).concat(vis.slice(0,1));C.nt=.25;if(vhCamVol32(v.g.position.x,v.g.position.z,60)>.1)feed(v.ally?'¡La dotación del '+v.name.replace(/^el |^la /,'')+' deja la pieza y pelea!':'¡Los artilleros enemigos abandonan la pieza!')}return}
 if(C.state==='leaving'){C.nt-=.3;if(C.nt>0)return;const m=C.q.shift();if(m&&m.visible){m.visible=false;vgcSpawn37(v,C,m,C.men.length)}C.nt=.45+R()*.4;if(!C.q.length){C.state='gone';VGC37.gone++}}}
/* API pública */
function gunCrew32(v,o){if(!v||!v.spec||(v.type!=='gun'&&v.type!=='mortar'))return null;o=o||{};const side=vhSide32(o.side||v.side),n=Math.max(0,Math.min(o.n===undefined?v.crew.length:o.n,v.crew.length));
 vgcInit37(v);v.crew.forEach((c,i)=>{if(i>=n)c.visible=false;else if(v.alive)c.visible=true});if(v.crewMax&&n<v.crew.length)v.crewHp=v.crewMax*Math.max(.25,n/v.crew.length);
 v.gc={side,n,r:o.r||15,spawn:typeof o.spawn==='function'?o.spawn:null,abandon:o.abandon!==false,tag:o.tag||(side==='veyrn'?'gcrew':'gcrewA'),state:'manned',thr:0,tt:R()*.3,q:[],men:[],nt:0};v.fire=n>0;VGC37.n++;return v.gc}
/* el jugador u otra lógica toma/deja la pieza */
function gunMan32(v,on){if(!v)return;v.fire=!!on&&(!v.gc||v.gc.state==='manned')}
{const _u=vehUpd32;vehUpd32=function(dt){const r=_u.apply(this,arguments);if(typeof time!=='undefined'){if(VGC37.lt===time)return r;VGC37.lt=time}try{const d=Math.min(dt||0,.05);if(d>0)for(const v of VEH32.list){if(!v.on||(v.type!=='gun'&&v.type!=='mortar'))continue;if(v.alive)vgcAnim37(v,d);if(v.gc)vgcUpd37(v,d)}}catch(e){if(!VGC37.w){VGC37.w=1;console.warn('v37_veh',e)}}return r};VEH32.vehUpd32=vehUpd32}
Object.assign(VEH32,{gunCrew32,gunMan32,crewStats:VGC37});
