/* =====================================================================
   v28 · MISIÓN XIV «EL FIORDO DE LOS CONDENADOS» — nivel 15
   Marina Real de Eisenmark · Frente Septentrional · 1922
   Sistemas (integrador): misión, embarcación, daños, armas, torpedos, Flak,
   acorazado, IA naval, aviación, tripulación, radio, clima, HUD, cinemáticas.
   Modelos: v28_ships.js · Entorno: v28_env.js
   ===================================================================== */
const L28={built:false,on:false,ph:0,T:0,ev:{},st:0,cp:[0,40],cpPh:1,ot:'',work:null,onBoat:false,stn:'helm',ships:[],planes:[],torps:[],sh:[],bombs:[],swim:[],res:0,ordI:0,carry:0,ars:100,crew:[],sq:[],kills:{pat:0,des:0,air:0},tasks:{},wx:{fog:1,snow:.3,wind:.4,wave:.5},msgT:0,fail:false,cut:[]};
const NAVY28={coat:0x2c3e4c,pants:0x2a3038,helm:0x4a545c,cap:0x1e2630};
const ZH28={coat:0x3e4a3a,pants:0x4a4a3c,helm:0x6a6440,bad:0xc8a030};
const AD28=(a,b)=>{let d=b-a;while(d>Math.PI)d-=6.2832;while(d<-Math.PI)d+=6.2832;return d};
const TT28=(a,b,m)=>{const d=AD28(a,b);return a+Math.max(-m,Math.min(m,d))};
const CL28=(v,a,b)=>v<a?a:v>b?b:v;
/* fiordo ampliado ×1,2: deformación continua (identidad junto a la base, ×1,2 mar adentro) */
const SC28=1.2;function W28(x,z){if(z>-60)return[x,z];const k=CL28((-60-z)/100,0,1);return[x*(1+(SC28-1)*k),-60+(z+60)*SC28]}
function IW28(x,z){if(z>-60)return[x,z];const zd=-60+(z+60)/SC28,k=CL28((-60-zd)/100,0,1);return[x/(1+(SC28-1)*k),zd]}
const RT28=a=>a.map(p=>W28(p[0],p[1]));
function near28(p,x,z,r){const w=W28(x,z);return Math.hypot(p.x-X15-w[0],p.z-w[1])<r}
function dif28(){return({easy:{acc:.55,dmg:.6,hp:.8,ammo:1.5,rate:.75,rep:1.5},hard:{acc:1.3,dmg:1.35,hp:1.15,ammo:.75,rate:1.2,rep:.7}})[difficulty]||{acc:1,dmg:1,hp:1,ammo:1,rate:1,rep:1}}
const once28=(k,t)=>{if(L28.ev[k]||L28.T<(t||0))return false;L28.ev[k]=1;return true};
function obj28(t,x,z){if(x!==undefined){const w_=W28(x,z);x=w_[0];z=w_[1]}obj9(t,x===undefined?undefined:X15+x,z);L28.ot=t}
function setPh28(ph){L28.ph=ph;L28.T=0;L28.ev={};L28.st=0;try{localStorage.setItem('fiordo28cp',String(Math.max(ph,+(localStorage.getItem('fiordo28cp')||0))))}catch(e){}}
function later28(t,f){L13.tq.push({t,f})}
function dry28(x,z,need){return land15(x-X15,z)>WY15-(need||0)}
function wv28(x,z){return typeof waveH15==='function'?waveH15(x-X15,z,time)*L28.wx.wave:0}
/* ---------- personajes: marineros de Eisenmark y tropas de Zheng-Hua ---------- */
function sailor28(x,z,o){o=o||{};const n=npc11(X15+x,z,Object.assign({hat:o.cap?'cap':'helm',hatC:o.cap?NAVY28.cap:NAVY28.helm,coat:NAVY28.coat,web:!!o.w,pack:false},o));n.lv=15;
 if(o.w){arm13(n,o.w);try{gear20(n.g,{helm:NAVY28.helm,web:true,boots:true})}catch(e){}}else n.wpn='r';
 const u=n.g.userData,q=PB();pBox(q,.34,.08,.34,0xd8d4c8,0,.7,0);if(o.vest){pBox(q,.66,.42,.46,0xb8742a,0,.34,0);for(let i=0;i<3;i++)pBox(q,.68,.04,.47,0x5a3a1a,0,.18+i*.14,0)}pbMesh(q,u.ch,VCM);n.on=false;return n}
const ZHM28=new T.MeshLambertMaterial({color:ZH28.helm});
function sp28(k,x,z,o){o=Object.assign({tag:'z'},o||{});if(o.pat)o.pat=o.pat.map(p=>[p[0]+X15-X13,p[1]]);const e=sp13(k,x+X15-X13,z,o);e.t13=o.tag;
 const M={};M[PRG.coat]=ZH28.coat;M[PRG.pants]=ZH28.pants;M[PRG.bad]=ZH28.bad;e.g.traverse(m=>{if(!m.isMesh||!m.material)return;if(m.u27){m.material=ZHM28;return}if(m.material.color){const h=m.material.color.getHex();if(M[h]!==undefined){m.material=m.material.clone();m.material.color.setHex(M[h])}}});
 const u=e.g.userData;box(.22,.12,.2,0xa82a1a,.33,.42,0,u.ch);e.k8n={mosin:'a un fusilero de Zheng-Hua',stv:'a un tirador de asalto de Zheng-Hua',bar:'a un ametrallador de Zheng-Hua'}[k];return e}
const alive28=tag=>enemies.filter(e=>e.t13===tag&&e.hp>0);
/* ---------- agua: espuma, estelas, salpicaduras ---------- */
const FO28=[];let foI28=0;
function foamInit28(){if(FO28.length)return;const g=new T.CircleGeometry(1,10);g.rotateX(-1.5708);for(let i=0;i<90;i++){const m=new T.Mesh(g,new T.MeshBasicMaterial({color:0xe8f0f2,transparent:true,opacity:0,depthWrite:false}));m.visible=false;scene.add(m);FO28.push({m,t:0,l:1,s:1,g:1})}}
function foam28(x,z,s,life,grow){const f=FO28[foI28];foI28=(foI28+1)%FO28.length;if(!f)return;f.m.position.set(x,WY15+.06+wv28(x,z),z);f.t=0;f.l=life||2;f.s=s||1;f.g=grow||1;f.m.visible=true;f.m.scale.setScalar(f.s)}
function foamUpd28(dt){for(const f of FO28){if(!f.m.visible)continue;f.t+=dt;const k=f.t/f.l;if(k>=1){f.m.visible=false;continue}f.m.scale.setScalar(f.s*(1+k*f.g));f.m.material.opacity=.55*(1-k)}}
function splash28(x,z,k,dry){k=k||1;if(dry){burst(x,WY15+1,z,0x5a5650,10*k|0,.7,6*k);smoke(x,WY15+2,z,4*k,2.5,0x6a6660,1.5,.6);return}
 burst(x,WY15+.5,z,0xe8f4f8,Math.round(16*k),.9,7*k);smoke(x,WY15+1.5*k,z,3*k,1.6,0xe8eef2,5*k,.75);smoke(x,WY15+4*k,z,2*k,1.2,0xf4f8fa,7*k,.6);foam28(x,z,2*k,2.5,2);nz18(0,.5,'lowpass',900,200,.06*Math.min(2,k))}
/* ---------- proyectiles: cañón, Flak, artillería pesada, secundaria, ametralladoras ---------- */
const SHP28=[];
function shellInit28(){if(SHP28.length)return;const gs=new T.SphereGeometry(.12,6,4);for(let i=0;i<70;i++){const m=new T.Mesh(gs,new T.MeshBasicMaterial({color:0xffd080}));m.visible=false;scene.add(m);SHP28.push(m)}}
function shell28(o){const m=SHP28.find(q=>!q.visible);if(!m)return null;m.visible=true;m.position.copy(o.p);m.scale.setScalar(o.k==='big'?3:o.k==='mg'?.6:o.k==='flak'?1.2:1.6);m.material.color.setHex(o.k==='mg'?0xffe090:o.k==='flak'?0xffb060:0xffc870);
 const s=Object.assign({m,t:0,g:o.k==='mg'?1.5:o.k==='big'?7:5,life:o.k==='mg'?1.6:o.k==='flak'?(o.fuse||2.6):9},o);s.p=m.position;s.lp=s.p.clone();L28.sh.push(s);return s}
function aimV28(from,to,tv,sp,acc,g){const d=from.distanceTo(to),t=d/sp;const aim=to.clone();if(tv)aim.addScaledVector(tv,t);aim.y+=.5*(g||0)*t*t;const v=aim.sub(from).normalize();const sprd=.04/Math.max(.2,acc);v.x+=(R()-.5)*sprd*2;v.y+=(R()-.5)*sprd;v.z+=(R()-.5)*sprd*2;return v.normalize().multiplyScalar(sp)}
function shellUpd28(dt){const D=dif28();for(let i=L28.sh.length-1;i>=0;i--){const s=L28.sh[i];s.t+=dt;s.lp.copy(s.p);s.v.y-=s.g*dt;s.p.addScaledVector(s.v,dt);let hit=null;
  if(s.k!=='mg'&&R()<.5)trc16(s.lp.clone(),s.p.clone(),s.k==='flak'?0xffa040:0xffd090);else if(s.k==='mg'&&R()<.6)trc16(s.lp.clone(),s.p.clone(),0xffe0a0);
  /* Flak con espoleta de proximidad */if(s.k==='flak'){let near=null,nd=9;for(const a of L28.planes){if(a.st==='down'||a.st==='gone')continue;const d=a.p.distanceTo(s.p);if(d<nd){nd=d;near=a}}if(near||s.t>s.life){flak28(s.p,s.dmg,s.by);hit=1}}
  if(!hit&&s.k==='mg'){for(const a of L28.planes){if(a.st==='down'||a.st==='gone')continue;if(a.p.distanceTo(s.p)<a.r*.55){planeHit28(a,s.dmg,s.by);hit=1;break}}}
  if(!hit&&s.by!=='e'&&s.k!=='flak'){for(const a of L28.planes){if(a.st==='down'||a.st==='gone')continue;if(a.p.distanceTo(s.p)<a.r*.5){planeHit28(a,s.dmg*1.5,s.by);hit=1;break}}}
  if(!hit){for(const sh of L28.ships){if(!sh.alive&&!sh.wreck)continue;if(s.src===sh)continue;if(s.by==='e'&&sh.side==='e')continue;if(s.by!=='e'&&sh.side==='a')continue;if(Math.abs(sh.g.position.x-s.p.x)>sh.len*.6+4||Math.abs(sh.g.position.z-s.p.z)>sh.len*.6+4)continue;const lp=s.p.clone().applyMatrix4(sh.inv);if(sh.sc)lp.multiplyScalar(sh.sc);if(Math.abs(lp.x)<sh.beam/2+.3&&Math.abs(lp.z)<sh.len/2&&lp.y>-sh.draft&&lp.y<sh.top){shipHit28(sh,lp,s.dmg,s.k,s.by);impact28(s.p,s.k);hit=1;break}}}
  if(!hit&&s.by==='e'&&B28.g&&L28.onBoat){const g=B28.g;if(Math.abs(g.position.x-s.p.x)<14&&Math.abs(g.position.z-s.p.z)<14){const lp=s.p.clone().applyMatrix4(B28.inv);if(Math.abs(lp.x)<B28.beam/2+.4&&Math.abs(lp.z)<B28.len/2&&lp.y>-1.2&&lp.y<4){wolfHit28(lp,s.dmg*D.dmg,s.k);impact28(s.p,s.k);hit=1}}}
  if(!hit&&s.p.y<WY15+wv28(s.p.x,s.p.z)){if(s.k==='big'){splash28(s.p.x,s.p.z,2.6);blast28(s.p,12,s.dmg*.5,s.by)}else if(s.k==='sec'||s.k==='gun'){splash28(s.p.x,s.p.z,1.2);blast28(s.p,5,s.dmg*.4,s.by)}else if(s.k!=='mg')splash28(s.p.x,s.p.z,.6);else if(R()<.3)foam28(s.p.x,s.p.z,.4,.6,1);hit=1}
  if(!hit&&s.k!=='flak'&&dry28(s.p.x,s.p.z,-s.p.y+WY15)&&land15(s.p.x-X15,s.p.z)>s.p.y){splash28(s.p.x,s.p.z,s.k==='big'?2:.8,true);if(s.k==='big'||s.k==='sec')blast28(s.p,s.k==='big'?10:4,s.dmg*.6,s.by);hit=1}
  if(hit||s.t>s.life){s.m.visible=false;L28.sh.splice(i,1)}}}
function impact28(p,k){if(k==='mg'){sparks12(p.x,p.y,p.z);return}const big=k==='big'?2.4:k==='sec'||k==='gun'?1:0.5;fb12(p.x,p.y,p.z,4*big,.5,1);burst(p.x,p.y,p.z,0xffa040,8,.5,5*big);smoke(p.x,p.y+1,p.z,2.5*big,2.4,0x3a3632,1.2,.6);expSnd(p.x,p.z,big*.8);flashLight(p.x,p.y+1,p.z,2*big,.25,0xffb060)}
/* explosión cercana: daña al Wolfszahn y a barcos pequeños por onda expansiva */
function blast28(p,r,dmg,by){if(by==='e'&&B28.g&&L28.onBoat){const d=B28.g.position.distanceTo(p);if(d<r){const lp=p.clone().applyMatrix4(B28.inv);wolfHit28(lp,dmg*(1-d/r)*dif28().dmg,'blast');shake=Math.max(shake,1.2*(1-d/r))}}
 for(const sh of L28.ships){if(!sh.alive||sh.k==='bb')continue;if((by==='e')===(sh.side==='e'))continue;const d=sh.g.position.distanceTo(p);if(d<r+sh.len*.3)shipDmg28(sh,dmg*(1-Math.min(1,d/(r+sh.len*.3))),by,'casco')}}
function flak28(p,dmg,by){smoke(p.x,p.y,p.z,4,3,0x1a1a1a,.3,.85);burst(p.x,p.y,p.z,0xffc060,6,.3,9);flashLight(p.x,p.y,p.z,2,.12,0xffc070);tn18('square',140,60,.18,.05);
 for(const a of L28.planes){if(a.st==='down'||a.st==='gone')continue;const d=a.p.distanceTo(p);if(d<13)planeHit28(a,dmg*(1-d/13)*(by==='p'?1:.6),by)}}
/* =====================================================================
   BARCOS: creación, navegación por rutas, IA de patrulleras, destructores,
   acorazado, aliados y barcazas de desembarco; daños por sectores
   ===================================================================== */
const SECHP28={proa:500,popa:500,babor:800,estribor:800,cubierta:600,puente:320,chimeneas:260,timon:240,propulsion:300,torreA:260,torreB:260,torreC:260};
const SECN28={proa:'la proa',popa:'la popa',babor:'el costado de babor',estribor:'el costado de estribor',cubierta:'la cubierta',puente:'el puente',chimeneas:'las chimeneas',timon:'el timón',propulsion:'la propulsión',torreA:'la torre A',torreB:'la torre B',torreC:'la torre C'};
function ship28(k,side,x,z,hd,o){o=o||{};let g;
 if(k==='bb')g=mkTianlong15();else if(k==='des')g=mkDestroyer15();else if(k==='pat')g=mkPatrol15('e');else if(k==='ally')g=mkWolf15({ally:true,num:o.num});else g=mkLanding15();
 g.rotation.order='YXZ';{const w_=W28(x,z);g.position.set(X15+w_[0],WY15,w_[1])}g.rotation.y=hd;scene.add(g);const u=g.userData,D=dif28();if(o.wp)o.wp=RT28(o.wp);
 const HP={bb:6000,des:560,pat:170,ally:300,lc:90}[k]*(side==='e'?D.hp:1);
 const s={k,side,g,u,name:o.name||{bb:'Tianlong',des:'Destructor',pat:'Patrullera',ally:'S-12',lc:'Barcaza'}[k],hp:HP,max:HP,alive:true,v:o.v||0,vmax:{bb:4.2,des:9.5,pat:12.5,ally:12,lc:6}[k],acc:{bb:.3,des:1.3,pat:2.2,ally:2,lc:1.2}[k],turn:{bb:.07,des:.24,pat:.5,ally:.45,lc:.3}[k],hd,
  draft:u.draft||{bb:7,des:3,pat:.9,ally:1,lc:.8}[k],len:u.len||{bb:115,des:50,pat:19,ally:22,lc:10}[k],beam:u.beam||{bb:18,des:6,pat:4,ally:4.6,lc:3.4}[k],inv:new T.Matrix4(),wp:o.wp||null,wi:0,st:o.st||'idle',cd:{},fires:[],foamT:R(),smT:R(),list:0,sinkY:0,o,ord:o.ord||'form',goal:null,spd:0,evade:0};
 s.top=(u.deckY||2)+({bb:16,des:8,pat:3,ally:3.4,lc:2}[k]);if(k==='bb'){s.sc=SC28;g.scale.setScalar(SC28);s.len*=SC28;s.beam*=SC28;s.draft*=SC28;s.top*=SC28}if(k==='bb'){s.sec={};for(const id in SECHP28)s.sec[id]={hp:SECHP28[id]*D.hp,max:SECHP28[id]*D.hp,down:false};s.flood=0;s.turnF=1;s.speedF=1}
 g.updateMatrixWorld(true);s.inv.copy(g.matrixWorld).invert();L28.ships.push(s);return s}
const tw28=(s,v)=>{s.g.updateMatrixWorld(true);return s.g.localToWorld(v.clone())};
/* fuegos que viajan con el barco */
function shipFire28(s,lp,sz){if(s.fires.length>8)return;const w=tw28(s,lp),f=mkFire(w.x,w.z,sz||1.4,w.y);f.lp=lp.clone();s.fires.push(f)}
function shipFiresUpd28(s){if(!s.fires.length)return;s.g.updateMatrixWorld(true);for(const f of s.fires){const w=s.g.localToWorld(f.lp.clone());f.g.position.copy(w);f.x=w.x;f.y=w.y;f.z=w.z}}
/* navegación: rumbo hacia la meta con sondas de tierra y separación entre barcos */
function nav28(s,dt){const p=s.g.position;let spd=s.spd;if(s.k==='bb'&&s.aground){s.v*=.97;return}
 if(s.goal){let want=Math.atan2(s.goal[0]-p.x,s.goal[1]-p.z);if(s.evade>0){s.evade-=dt;want=s.evAng}
  const look=s.len*.5+Math.abs(s.v)*2.2+6,free=a=>{for(const d of[look*.45,look,look*1.4]){if(dry28(p.x+Math.sin(a)*d,p.z+Math.cos(a)*d,s.draft+.6))return false}return true};
  const direct=s.k==='lc'&&s.st==='in'&&Math.hypot(s.goal[0]-p.x,s.goal[1]-p.z)<60;if(!direct&&!free(want)){let ok=false;for(const o of[.35,-.35,.7,-.7,1.1,-1.1,1.6,-1.6,2.3,-2.3]){if(free(want+o)){want+=o;ok=true;break}}if(!ok)spd=-2}
  /* separación de otros barcos */for(const o of L28.ships){if(o===s||!o.alive)continue;const dx=p.x-o.g.position.x,dz=p.z-o.g.position.z,d=Math.hypot(dx,dz),m=(s.len+o.len)*.42;if(d<m&&d>.1&&s.k!=='bb'){want=Math.atan2(dx,dz)*.6+want*.4;spd*=.6}}
  const df=Math.abs(AD28(s.hd,want));s.hd=TT28(s.hd,want,s.turn*(s.turnF||1)*dt*CL28(Math.abs(s.v)/3,.35,1));if(df>1.2&&s.k!=='bb')spd*=.55}
 s.v+=CL28(spd-s.v,-s.acc*dt*1.5,s.acc*dt);const ox=p.x,oz=p.z;p.x+=Math.sin(s.hd)*s.v*dt;p.z+=Math.cos(s.hd)*s.v*dt;
 if(dry28(p.x+Math.sin(s.hd)*s.len*.45*Math.sign(s.v||1),p.z+Math.cos(s.hd)*s.len*.45*Math.sign(s.v||1),s.k==='lc'?-.4:s.draft)){p.x=ox;p.z=oz;if(s.k==='bb'){if(Math.abs(s.v)>.8)nz18(0,1.5,'lowpass',200,60,.12);s.v=0}else s.v*=-.2}
 s.g.rotation.y=s.hd}
/* torreta genérica: gira y eleva hacia un punto del mundo; devuelve true si apunta */
const _v28a=new T.Vector3(),_v28b=new T.Vector3();
function turAim28(s,t,tgt,dt,sp,g,rate){if(!t||!t.yaw)return false;t.yaw.getWorldPosition(_v28a);_v28b.copy(tgt).applyMatrix4(s.inv);const tl=_v28a.clone().applyMatrix4(s.inv);const a=Math.atan2(_v28b.x-tl.x,_v28b.z-tl.z);
 t.yaw.rotation.y=TT28(t.yaw.rotation.y,a,(rate||.6)*dt);const hd=Math.hypot(tgt.x-_v28a.x,tgt.z-_v28a.z);const el=CL28(.5*Math.asin(CL28((g||5)*hd/(sp*sp),-1,1))+Math.atan2(tgt.y-_v28a.y,hd)*.6,-.05,.75);if(t.pitch)t.pitch.rotation.x+=(-el-t.pitch.rotation.x)*Math.min(1,dt*2);
 return Math.abs(AD28(t.yaw.rotation.y,a))<.08}
function turFire28(s,t,tgt,tv,sp,k,dmg,acc){const mz=(t.muzzles||[])[R()*(t.muzzles||[]).length|0];if(!mz)return;const o=new T.Vector3();mz.getWorldPosition(o);const v=aimV28(o,tgt,tv,sp,acc,k==='mg'?1.5:k==='big'?7:5);shell28({p:o,v,k,dmg,by:s.side,src:s});
 const big=k==='big';fb12(o.x,o.y,o.z,big?7:k==='mg'?.8:2.4,big?.35:.15,0);if(big){smoke(o.x,o.y,o.z,8,3,0x9a9690,1.2,.55);flashLight(o.x,o.y,o.z,6,.3,0xffc070);nz18(0,1.2,'lowpass',300,70,.22*CL28(1-o.distanceTo(cam.position)/900,.15,1));tn18('sine',55,30,1,.2*CL28(1-o.distanceTo(cam.position)/900,.1,1))}else if(k==='mg'){if(o.distanceTo(cam.position)<220)npcShot('mg',o.x,o.z)}else{nz18(0,.4,'lowpass',700,150,.06*CL28(1-o.distanceTo(cam.position)/500,0,1));smoke(o.x,o.y,o.z,1.5,1,0xb0aca8,.8,.4)}}
/* objetivos de una nave enemiga: el Wolfszahn y los aliados vivos */
function foeTgt28(s,range){let best=null,bd=range;const p=s.g.position;if(L28.onBoat&&B28.g&&!B28.sunk){const d=p.distanceTo(B28.g.position);if(d<bd){bd=d;best={p:B28.g.position,v:B28.vel,w:1}}}for(const o of L28.ships){if(!o.alive||o.side!=='a')continue;const d=p.distanceTo(o.g.position)*1.15;if(d<bd){bd=d;best={p:o.g.position,v:o.vel,s:o}}}return best}
function nearEnemy28(p,range,kinds){let best=null,bd=range;for(const o of L28.ships){if(!o.alive||o.side!=='e'||(kinds&&!kinds.includes(o.k)))continue;const d=p.distanceTo(o.g.position);if(d<bd){bd=d;best=o}}return best}
function shipUpd28(s,dt){const p=s.g.position,D=dif28();
 if(!s.alive){if(s.k!=='bb'){s.sinkT=(s.sinkT||0)+dt;s.g.rotation.z+=(s.sinkRZ-s.g.rotation.z)*dt*.3;s.g.rotation.x+=(s.sinkRX-s.g.rotation.x)*dt*.25;p.y-=dt*(s.sinkT<4?.15:.55);if(R()<dt*4)smoke(p.x+(R()-.5)*s.len*.4,WY15+2,p.z+(R()-.5)*s.len*.4,4,4,0x2a2826,2,.6);if(R()<dt*3)foam28(p.x+(R()-.5)*s.len*.5,p.z+(R()-.5)*s.len*.5,2,2,1.5);if(p.y<WY15-s.draft-14){s.g.visible=false;for(const f of s.fires)f.g.visible=false;s.gone=true}shipFiresUpd28(s)}return}
 s.vel=s.vel||new T.Vector3();s.vel.set(Math.sin(s.hd)*s.v,0,Math.cos(s.hd)*s.v);
 /* torpedos que se acercan: maniobra evasiva */if(s.evade<=0&&s.k!=='lc'){for(const t of L28.torps){if(t.st!=='run'||t.by===s.side)continue;const dx=p.x-t.p.x,dz=p.z-t.p.z,d=Math.hypot(dx,dz);if(d>170)continue;const along=dx*Math.sin(t.hd)+dz*Math.cos(t.hd),perp=Math.abs(dx*Math.cos(t.hd)-dz*Math.sin(t.hd));if(along>0&&perp<s.len*.5+6&&R()<(s.k==='bb'?.6:.9)){s.evade=s.k==='bb'?8:4;const a1=t.hd+1.5708,a2=t.hd-1.5708;s.evAng=Math.abs(AD28(s.hd,a1))<Math.abs(AD28(s.hd,a2))?a1:a2;if(s.k!=='pat'&&!L28.ev['ev'+s.k]){L28.ev['ev'+s.k]=1;radio28('Vigía',s.k==='bb'?'¡El acorazado vira! ¡Vio la estela del torpedo!':'¡El destructor maniobra para esquivar!',2.4)}break}}}
 if(s.k==='pat')patAI28(s,dt,D);else if(s.k==='des')desAI28(s,dt,D);else if(s.k==='bb')bbAI28(s,dt,D);else if(s.k==='ally')allyAI28(s,dt,D);else lcAI28(s,dt);
 nav28(s,dt);
 /* oleaje, escora e inundación */const w=wv28(p.x,p.z)*(s.k==='bb'?.25:s.k==='des'?.5:.8);p.y=WY15+w-s.sinkY;s.g.rotation.z=Math.sin(time*.8+s.foamT*9)*(s.k==='bb'?.006:.03)*L28.wx.wave*2+(s.list||0);s.g.rotation.x=Math.sin(time*1.1+s.foamT*5)*(s.k==='bb'?.004:.02)*L28.wx.wave*2;
 /* estela y humo */s.foamT+=dt;if(Math.abs(s.v)>1.2&&s.foamT>.14){s.foamT=0;const st=tw28(s,s.u.wakeOut||new T.Vector3(0,0,-s.len/2));foam28(st.x+(R()-.5)*s.beam*.5,st.z+(R()-.5)*s.beam*.5,s.beam*.35,3.2,2.2);const bw=tw28(s,s.u.bowOut||new T.Vector3(0,0,s.len/2));foam28(bw.x,bw.z,s.beam*.25,1.2,1.5)}
 s.smT-=dt;if(s.smT<=0){s.smT=s.k==='bb'?.35:.6;for(const o of(s.u.smokeOuts||(s.u.smokeOut?[s.u.smokeOut]:[]))){const w2=tw28(s,o);smoke(w2.x,w2.y,w2.z,s.k==='bb'?(s.sec&&s.sec.chimeneas.down?9:6):3,6,s.sec&&s.sec.chimeneas.down?0x101010:0x3a3a3c,2,.55)}}
 shipFiresUpd28(s);s.g.updateMatrixWorld(true);s.inv.copy(s.g.matrixWorld).invert()}
/* ---------- patrullera de Zheng-Hua ---------- */
function patAI28(s,dt,D){const p=s.g.position,t=foeTgt28(s,s.st==='attack'?420:260);s.cd.g=(s.cd.g||2+R()*2)-dt*D.rate;s.cd.m=(s.cd.m||1)-dt*D.rate;
 if(s.hp<s.max*.3&&s.st!=='flee'&&!s.fled){s.st='flee';s.fled=1;s.fT=14;feed('La patrullera enemiga se retira dañada')}
 if(s.st==='flee'){s.fT-=dt;const a=t?Math.atan2(p.x-t.p.x,p.z-t.p.z):s.hd;s.goal=[p.x+Math.sin(a)*80,p.z+Math.cos(a)*80];s.spd=s.vmax;if(s.fT<=0)s.st='attack';return}
 if(t){s.st='attack';const d=p.distanceTo(t.p);const side=(s.o.side||1),ang=Math.atan2(p.x-t.p.x,p.z-t.p.z)+side*.9;const r=d>140?50:75;s.goal=[t.p.x+Math.sin(ang)*r,t.p.z+Math.cos(ang)*r];s.spd=d>90?s.vmax:s.vmax*.75;
  const aimP=t.p.clone();aimP.y=WY15+1.5;if(turAim28(s,s.u.gun,aimP,dt,120,5,1.6)&&s.cd.g<=0&&d<330){s.cd.g=2.6+R();turFire28(s,s.u.gun,aimP,t.v,120,'gun',8,D.acc*.85)}
  if(s.u.mg&&d<150){turAim28(s,s.u.mg,aimP,dt,200,1.5,3);if(s.cd.m<=0){s.cd.m=.12;s.burst=(s.burst||0)+1;if(s.burst>10){s.burst=0;s.cd.m=1.6}turFire28(s,s.u.mg,aimP,t.v,200,'mg',1,D.acc*.7)}}}
 else{if(s.wp){const w=s.wp[s.wi%s.wp.length];if(Math.hypot(w[0]+X15-p.x,w[1]-p.z)<25)s.wi++;s.goal=[w[0]+X15,w[1]];s.spd=s.vmax*.5}else{s.goal=null;s.spd=0}}}
/* ---------- destructor ---------- */
function desAI28(s,dt,D){const p=s.g.position,t=foeTgt28(s,520);s.cd.t0=(s.cd.t0||2+R()*3)-dt*D.rate;s.cd.t1=(s.cd.t1||3+R()*3)-dt*D.rate;s.cd.aa=(s.cd.aa||1)-dt*D.rate;
 if(s.collide)return;
 if(t&&s.st!=='guard'){const d=p.distanceTo(t.p);if(d>160){s.goal=[t.p.x,t.p.z];s.spd=s.vmax}else{const ang=Math.atan2(p.x-t.p.x,p.z-t.p.z)+.7;s.goal=[t.p.x+Math.sin(ang)*130,t.p.z+Math.cos(ang)*130];s.spd=s.vmax*.7}
  /* abanico de torpedos una vez, si el blanco está de través */if(!s.firedT&&d<240&&d>70&&t.w){const rel=Math.abs(AD28(s.hd,Math.atan2(t.p.x-p.x,t.p.z-p.z)));if(rel>1.1&&rel<2.0){s.firedT=1;for(const o of[-.12,0,.12])later28(.4+R()*.3,()=>{if(s.alive)torp28(tw28(s,new T.Vector3(0,s.u.deckY||2,0)),Math.atan2(t.p.x-p.x,t.p.z-p.z)+o,'e',s)});radio28('Vigía','¡Torpedos en el agua! ¡Por el través!',2.4)}}}
 else if(s.st==='guard'&&s.guard){const gp=s.guard;s.goal=[gp[0]+X15,gp[1]];s.spd=Math.hypot(gp[0]+X15-p.x,gp[1]-p.z)>40?s.vmax*.6:0}
 else if(s.wp){const w=s.wp[s.wi%s.wp.length];if(Math.hypot(w[0]+X15-p.x,w[1]-p.z)<30)s.wi++;s.goal=[w[0]+X15,w[1]];s.spd=s.vmax*.6}
 const t2=t||foeTgt28(s,600);if(t2){const aimP=t2.p.clone();aimP.y=WY15+1.5;const d=p.distanceTo(t2.p);s.u.turrets.forEach((tr,i)=>{if(turAim28(s,tr,aimP,dt,140,5,.9)&&s.cd['t'+i]<=0&&d<560){s.cd['t'+i]=3.4+R()*1.5;turFire28(s,tr,aimP,t2.v,140,'gun',14,D.acc*.75)}});
  if(s.u.aa&&d<230){turAim28(s,s.u.aa,aimP,dt,180,1.5,2.5);if(s.cd.aa<=0){s.cd.aa=.16;s.ab=(s.ab||0)+1;if(s.ab>8){s.ab=0;s.cd.aa=2}turFire28(s,s.u.aa,aimP,t2.v,180,'mg',1.2,D.acc*.6)}}}
 /* defensa antiaérea propia contra nada: el AA del destructor dispara a aviones aliados (no hay) */}
/* ---------- acorazado Tianlong ---------- */
function bbAI28(s,dt,D){const p=s.g.position,u=s.u;s.cd.m=s.cd.m||[6,8,10];s.cd.s=(s.cd.s||2)-dt*D.rate;s.cd.aa=(s.cd.aa||1)-dt*D.rate;
 if(s.route&&!s.aground&&!s.hold){const w=s.route[s.ri||0];if(w){if(Math.hypot(w[0]+X15-p.x,w[1]-p.z)<30)s.ri=(s.ri||0)+1;s.goal=[w[0]+X15,w[1]];s.spd=s.vmax*(s.speedF||1)}else{s.goal=null;s.spd=0}}else{s.spd=0;if(s.hold)s.goal=null}
 if(s.sec&&s.sec.timon.down&&!s.aground&&s.rudderJam!==undefined){s.hd+=s.rudderJam*dt*.05}
 /* torres principales: bombardeo de la base o fuego contra barcos */const tg=s.bombard&&s.bombard.length?null:foeTgt28(s,1100);
 u.turrets.forEach((tr,i)=>{const id='torre'+(tr.name||'ABC'[i]);if(s.sec[id]&&s.sec[id].down)return;s.cd.m[i]-=dt*D.rate;let aimP=null,tv=null;
  if(s.bombard&&s.bombard.length){const b=s.bombard[(i+(s.bi||0))%s.bombard.length];aimP=new T.Vector3(b[0]+X15,1,b[1])}else if(tg){aimP=tg.p.clone();aimP.y=WY15+1;tv=tg.v}
  if(!aimP||s.silent)return;const ok=turAim28(s,tr,aimP,dt,170,7,.18);if(ok&&s.cd.m[i]<=0&&p.distanceTo(aimP)<1150){s.cd.m[i]=(s.bombard?7:10)+R()*4;s.bi=(s.bi||0)+1;for(let k=0;k<(tr.muzzles||[]).length;k++)later28(k*.18,()=>{if(s.alive)turFire28(s,{muzzles:[tr.muzzles[k]]},aimP,tv,170,'big',s.bombard?60:44,s.bombard?3:D.acc*(s.sec.puente.down?.5:.8))})}});
 /* secundaria y antiaérea contra el Wolfszahn y aliados cercanos */const t2=foeTgt28(s,520);if(t2&&!s.silent&&!s.bombard){const aimP=t2.p.clone();aimP.y=WY15+1.4;const d=p.distanceTo(t2.p);const acc=D.acc*(s.sec.puente.down?.55:.85);
  (u.sec||[]).forEach((tr,i)=>{const side=tr.side||1,lp=t2.p.clone().applyMatrix4(s.inv);if(Math.sign(lp.x)!==side&&Math.abs(lp.x)>4)return;s.cd['s'+i]=(s.cd['s'+i]===undefined?R()*3:s.cd['s'+i])-dt*D.rate;if(turAim28(s,tr,aimP,dt,150,5,.8)&&s.cd['s'+i]<=0&&d<480){s.cd['s'+i]=5.5+R()*3;turFire28(s,tr,aimP,t2.v,150,'sec',9,acc*.8)}});
  if(d<260)(u.aa||[]).forEach((tr,i)=>{turAim28(s,tr,aimP,dt,190,1.5,2);s.cd['a'+i]=(s.cd['a'+i]||R())-dt*D.rate;if(s.cd['a'+i]<=0){s.cd['a'+i]=.22+R()*.2;s.aab=(s.aab||0)+1;if(s.aab>14){s.aab=0;s.cd['a'+i]=2.5}turFire28(s,tr,aimP,t2.v,190,'mg',1.1,acc*.55)}})}
 /* las AA disparan contra los aviones derribados no: apuntan al cielo en ataques aéreos para efecto */
 /* inundación progresiva tras torpedos: escora */if(s.flood>0){s.list+=((s.floodSide||1)*Math.min(.09,s.flood*.025)-s.list)*dt*.2}}
/* ---------- aliados: patrulleras S-12 «Kranich» y S-14 «Möwe» con órdenes reales ---------- */
const ORD28=[['form','FORMACIÓN · seguir al Wolfszahn'],['esc','ATACAR ESCOLTAS'],['cub','CUBRIR AL WOLFSZAHN (antiaéreo)'],['bb','ATACAR EL ACORAZADO'],['base','PROTEGER LA BASE'],['hold','MANTENER POSICIÓN'],['ret','RETIRARSE AL PUERTO']];
function allyAI28(s,dt,D){const p=s.g.position,o=L28.ord||'form',bp=B28.g?B28.g.position:p;s.cd.g=(s.cd.g||2)-dt;s.cd.m=(s.cd.m||1)-dt;
 if(s.scripted){return}
 if(s.hp<s.max*.22&&!s.abandon){s.abandon=1;radio28(s.name,'¡Estamos perdidos! ¡Abandonen el barco!',2.4);for(let i=0;i<2;i++){const w=tw28(s,new T.Vector3((i?1:-1)*3.5,0,(R()-.5)*6));swimmer28(w.x-X15,w.z)}s.spd=0;s.goal=null;shipFire28(s,new T.Vector3(0,1.6,-3),2);return}
 if(s.abandon){s.spd=0;s.goal=null;return}
 let tgt=null;if(o==='form'||o==='cub'){if(L28.onBoat&&B28.g){const i=s.o.slot||0,hd=B28.hd,sx=i?18:-18,sz=-24;s.goal=[bp.x+Math.cos(hd)*sx+Math.sin(hd)*sz,bp.z-Math.sin(hd)*sx+Math.cos(hd)*sz];const d=Math.hypot(s.goal[0]-p.x,s.goal[1]-p.z);s.spd=d>40?s.vmax:d>12?Math.max(4,Math.abs(B28.v)+2):Math.abs(B28.v)}else{s.goal=null;s.spd=0}tgt=o==='form'?nearEnemy28(p,260,['pat','des']):null}
 else if(o==='esc'){tgt=nearEnemy28(p,900,['pat','des','lc']);if(tgt){const a=Math.atan2(p.x-tgt.g.position.x,p.z-tgt.g.position.z)+.8;s.goal=[tgt.g.position.x+Math.sin(a)*70,tgt.g.position.z+Math.cos(a)*70];s.spd=s.vmax}else s.spd=0}
 else if(o==='bb'){tgt=L28.ships.find(q=>q.k==='bb'&&q.alive);if(tgt){const a=Math.atan2(p.x-tgt.g.position.x,p.z-tgt.g.position.z)+.5*(s.o.slot?1:-1);s.goal=[tgt.g.position.x+Math.sin(a)*260,tgt.g.position.z+Math.cos(a)*260];s.spd=s.vmax}}
 else if(o==='base'||o==='ret'){const h=o==='ret'?[X15+(s.o.slot?-30:30),-60]:[X15+(s.o.slot?-60:60),-110];s.goal=h;s.spd=Math.hypot(h[0]-p.x,h[1]-p.z)>15?s.vmax*.8:0;tgt=nearEnemy28(p,300,['pat','lc','des'])}
 else if(o==='hold'){s.spd=0;s.goal=null;tgt=nearEnemy28(p,300)}
 if(tgt){const aimP=tgt.g.position.clone();aimP.y=WY15+1.5;const d=p.distanceTo(tgt.g.position);if(turAim28(s,s.u.bowGun,aimP,dt,160,5,1.4)&&s.cd.g<=0&&d<(tgt.k==='bb'?700:420)){s.cd.g=2.6+R()*1.2;turFire28(s,s.u.bowGun,aimP,tgt.vel,160,'gun',tgt.k==='bb'?14:16,1.1)}}
 /* antiaéreo de los aliados */const pl=L28.planes.find(a=>a.st!=='down'&&a.st!=='gone'&&a.p.distanceTo(p)<(o==='cub'?320:220));if(pl&&s.u.flak){if(turAim28(s,s.u.flak,pl.p,dt,240,2,2.2)&&s.cd.m<=0){s.cd.m=o==='cub'?.45:.8;const mz=s.u.flak.muzzles[0];const w=new T.Vector3();mz.getWorldPosition(w);shell28({p:w,v:aimV28(w,pl.p,pl.vel,240,o==='cub'?.9:.6,2),k:'flak',dmg:o==='cub'?26:18,by:'a',src:s,fuse:2.4,g:2})}}}
/* ---------- barcaza de desembarco ---------- */
function lcAI28(s,dt){const p=s.g.position;if(s.st==='in'){s.goal=s.beach;s.spd=s.vmax;if(Math.hypot(s.beach[0]-p.x,s.beach[1]-p.z)<12||dry28(p.x+Math.sin(s.hd)*5,p.z+Math.cos(s.hd)*5,-.4)){s.st='unload';s.t=0;s.v=0;s.spd=0}}
 else if(s.st==='unload'){s.t+=dt;s.spd=0;s.goal=null;if(s.u.ramp)s.u.ramp.rotation.x=Math.min(1.25,s.t*.9);if(s.t>1.2&&!s.dropped){s.dropped=1;const n=s.troops||6;for(let i=0;i<n;i++)later28(i*.45,()=>{const w=tw28(s,new T.Vector3((i%2?.8:-.8),0,s.len/2+1.5+(i>>1)*.6));const e=sp28(i%4===3?'bar':i%3===2?'stv':'mosin',w.x-X15,Math.max(w.z+3,2.5),{tag:'land'});e.alert=.3+R()*.4;e.active=true;e.unaware=false})}if(s.t>n28(s)){s.st='out';s.t=0}}
 else if(s.st==='out'){s.spd=-3;s.goal=null;s.t+=dt;if(s.t>8){s.goal=[p.x,p.z-200];s.spd=s.vmax}}}
const n28=s=>(s.troops||6)*.45+3;
/* ---------- daños ---------- */
function shipHit28(sh,lp,dmg,k,by){let sec='casco';if(sh.k==='bb'&&sh.u.sectors){const lq=sh.sc?lp.clone().divideScalar(sh.sc):lp;for(const q of sh.u.sectors){if(lq.x>=q.min.x&&lq.x<=q.max.x&&lq.y>=q.min.y&&lq.y<=q.max.y&&lq.z>=q.min.z&&lq.z<=q.max.z){sec=q.id;break}}if(sec==='casco')sec=lp.z>sh.len*.3?'proa':lp.z<-sh.len*.3?'popa':lp.y>(sh.u.deckY||5)?'cubierta':lp.x<0?'babor':'estribor'}
 shipDmg28(sh,dmg,by,sec,lp);if(R()<(k==='big'?.5:k==='gun'||k==='sec'?.18:.0)&&sh.alive){const fp=(sh.u.firePts||[]);shipFire28(sh,fp.length?fp[R()*fp.length|0]:lp,sh.k==='bb'?2.2:1.2)}}
function shipDmg28(sh,dmg,by,sec,lp){if(!sh.alive)return;if(sh.side==='a'&&L28.ph<4)return;const D=dif28();
 if(sh.k==='bb'){const q=sh.sec[sec]||sh.sec.cubierta;q.hp-=dmg;sh.hp-=dmg*.25;if(q.hp<=0&&!q.down){q.down=true;secDown28(sh,sec in sh.sec?sec:'cubierta')}if(by==='p'&&dmg>20)score+=Math.round(dmg*.4);return}
 sh.hp-=dmg*(sh.side==='a'?.55:1);if(sh.side==='a'&&sh.hp<sh.max*.5&&!sh.cry){sh.cry=1;radio28(sh.name,'¡Nos dieron fuerte! ¡Necesitamos apoyo!',2.2)}
 if(sh.hp<sh.max*.45&&sh.fires.length<2&&R()<.25){const fp=sh.u.firePts||[];shipFire28(sh,fp.length?fp[R()*fp.length|0]:new T.Vector3(0,1.5,0),1.2)}
 if(sh.hp<=0)sink28(sh,by)}
function sink28(sh,by){if(!sh.alive)return;sh.alive=false;sh.wreck=true;sh.sinkRZ=(R()<.5?-1:1)*(.5+R()*.6);sh.sinkRX=(R()-.5)*.5;const p=sh.g.position;bx12(p.x,WY15+2,p.z,sh.k==='des'?1.6:.9);splash28(p.x,p.z,sh.k==='des'?3:1.8);shake=Math.max(shake,1);
 if(sh.side==='e'){const nm={pat:'Patrullera de Zheng-Hua hundida',des:'Destructor de Zheng-Hua hundido',lc:'Barcaza de desembarco hundida'}[sh.k];feed('★ '+nm);if(by==='p'){score+={pat:900,des:2500,lc:500}[sh.k]||0;crew28('kill')}L28.kills[sh.k]=(L28.kills[sh.k]||0)+1;for(let i=0;i<(sh.k==='des'?3:1);i++)later28(1+i,()=>{if(R()<.6)foam28(p.x+(R()-.5)*10,p.z+(R()-.5)*10,1.5,3,2)})}
 else{feed('✖ '+sh.name+' hundida');radio28('Falk','¡Perdimos al '+sh.name+'! ¡Malditos!',2)}}
function secDown28(sh,id){const p=sh.g.position;feed('★ Acorazado: '+SECN28[id]+' destruido');const u=sh.u;
 if(id.startsWith('torre')){const t=u.turrets.find(q=>'torre'+q.name===id)||u.turrets['ABC'.indexOf(id.slice(-1))];if(t&&t.pitch){t.pitch.rotation.x=.18;t.yaw.rotation.z=.06}const w=t?(()=>{const v=new T.Vector3();t.yaw.getWorldPosition(v);return v})():p;fb12(w.x,w.y+2,w.z,10,.8,4);shipFire28(sh,t?t.yaw.position.clone().add(new T.Vector3(0,2,0)):new T.Vector3(),2.4)}
 if(id==='puente'){if(u.bridge){u.bridge.rotation.z=.08;u.bridge.position.y-=.6}shipFire28(sh,new T.Vector3(0,(u.deckY||5)+8,10),2.6);radio28('Vigía','¡Le dieron en el puente! ¡Su fuego pierde precisión!',2.4)}
 if(id==='chimeneas'){sh.speedF=(sh.speedF||1)*.8;if(u.funnels&&u.funnels[0])u.funnels[0].rotation.z=.25}
 if(id==='propulsion'){sh.speedF=(sh.speedF||1)*.35;radio28('Vigía','¡Humo blanco en la popa! ¡Pierde máquinas!',2.4)}
 if(id==='timon'){sh.turnF=.05;sh.rudderJam=1;radio28('Vigía','¡El timón! ¡Le dimos al timón! ¡No puede gobernar!',2.6)}
 if(id==='babor'||id==='estribor'){sh.flood=(sh.flood||0)+1;sh.floodSide=id==='babor'?-1:1;sh.speedF=(sh.speedF||1)*.85}}
/* =====================================================================
   B-17 «WOLFSZAHN»: navegación arcade con peso, puestos, armas, daños por
   componentes, incendios, inundación y control de averías de la tripulación
   ===================================================================== */
const B28={g:null,u:null,v:0,thr:0,rud:0,r:0,hd:Math.PI,inv:new T.Matrix4(),vel:new T.Vector3(),len:22,beam:4.6,deckY:1.3,
 comp:{casco:100,motor:100,helice:100,timon:100,canon:100,flak:100,tubos:100,radio:100,comb:100},flood:0,fires:[],torp:4,tubeSel:0,tubeRdy:[1,1],tubeArm:[0,0],tubeRel:[0,0],gyro:0,gun:40,flak:240,gunCd:0,flakCd:0,mgCd:0,flakBurst:0,roll:0,pch:0,sunk:false,moored:true,engT:0};
const STN28=['helm','bow','flak','torp','eng'],STNN28={helm:'PUENTE DE MANDO · timón y ametralladoras',bow:'CAÑÓN DE PROA 88 mm',flak:'CAÑÓN FLAK 37 mm (antiaéreo)',torp:'TUBOS LANZATORPEDOS',eng:'SALA DE MÁQUINAS · control de averías'};
const CN28={casco:'Casco',motor:'Motor',helice:'Propulsión',timon:'Timón',canon:'Cañón de proa',flak:'Flak',tubos:'Tubos lanzatorpedos',radio:'Radio',comb:'Depósito de combustible'};
function wolfInit28(){if(B28.g)return;const g=mkWolf15({});g.rotation.order='YXZ';scene.add(g);B28.g=g;B28.u=g.userData;B28.len=B28.u.len||22;B28.beam=B28.u.beam||4.6;B28.deckY=B28.u.deckY||1.3;/* puesto de mando abierto y director de torpedos sobre el puente: mejor visibilidad */const st=B28.u.stations||(B28.u.stations={});st.helm=new T.Vector3(.45,3.62,1.1);st.torp=new T.Vector3(-.5,3.62,.4)}
function wolfReset28(full){const C=B28.comp,D=dif28();if(full){for(const k in C)C[k]=100;B28.flood=0;for(const f of B28.fires)f.g.visible=false;B28.fires=[];B28.torp=4;B28.tubeRdy=[1,1];B28.tubeArm=[0,0];B28.gun=Math.round(40*D.ammo);B28.flak=Math.round(240*D.ammo);B28.sunk=false;for(const t of B28.u.tubes||[])if(t.torp)t.torp.visible=true}}
function moor28(){const a=ENV15.anch.wolf;B28.g.position.set(X15+a.x,WY15,a.z);B28.hd=a.ry;B28.g.rotation.y=a.ry;B28.v=0;B28.thr=0;B28.moored=true;B28.g.updateMatrixWorld(true);B28.inv.copy(B28.g.matrixWorld).invert()}
/* títulos de cinemática: cancelar los pendientes si la escena termina antes de mostrarse */
{let tok=0;story=function(s){tok++;const my=tok,e=$('story');if(!s){e.style.opacity=0;return}e.style.opacity=0;setTimeout(()=>{if(my!==tok)return;e.textContent=s;e.style.opacity=1},400)}}
const lw28=v=>{B28.g.updateMatrixWorld(true);return B28.g.localToWorld(v.clone())};
/* lectura de los mandos: teclado o joystick táctil */
function helmIn28(){let f=(keys.KeyW?1:0)-(keys.KeyS?1:0),r=(keys.KeyD?1:0)-(keys.KeyA?1:0);if(typeof tmOn!=='undefined'&&tmOn){f=-tm.y;r=tm.x;if(Math.abs(f)<.25)f=0;if(Math.abs(r)<.2)r=0}return{f,r}}
function wolfUpd28(dt){const g=B28.g,p=g.position,C=B28.comp,D=dif28();if(B28.sunk)return;
 const inp=L9.cine||B28.moored?{f:0,r:0}:helmIn28();
 /* telégrafo: aceleración progresiva; el timón vuelve al centro al soltar */B28.thr=CL28(B28.thr+inp.f*dt*.55,-.45,1);if(Math.abs(B28.thr)<.04&&!inp.f)B28.thr*=.9;B28.rud+=((inp.r)-B28.rud)*Math.min(1,dt*(inp.r?2.2:3));
 const mot=C.motor>0?.35+.65*C.motor/100:0,pro=C.helice>0?.3+.7*C.helice/100:.15,flo=1-B28.flood*.55,vmax=16.5*mot*pro*flo,want=B28.thr*vmax;
 B28.v+=CL28(want-B28.v,-3.2*dt,2.0*mot*dt);B28.v*=1-dt*.04;
 const tim=C.timon>0?.3+.7*C.timon/100:.12,rr=-B28.rud*.5*tim*CL28(Math.abs(B28.v)/5,.18,1)*Math.sign(B28.v||1);B28.r+=(rr-B28.r)*Math.min(1,dt*1.4);const dh=B28.r*dt;B28.hd+=dh;g.rotation.y=B28.hd;if(L28.onBoat)yaw+=dh;
 /* corriente y viento del fiordo: deriva leve */const ox=p.x,oz=p.z;p.x+=Math.sin(B28.hd)*B28.v*dt+L28.wx.wind*.25*dt;p.z+=Math.cos(B28.hd)*B28.v*dt;
 /* colisión con rocas, costa y barcos: sin atravesar el terreno */let bump=0;for(const [lx,lz] of[[0,B28.len*.48],[0,-B28.len*.45],[B28.beam*.5,0],[-B28.beam*.5,0],[B28.beam*.4,B28.len*.3],[-B28.beam*.4,B28.len*.3]]){const w=lw28(new T.Vector3(lx,0,lz));if(dry28(w.x,w.z,.7)){bump=1;break}}
 if(!bump)for(const s of L28.ships){if(!s.g.visible||(s.gone))continue;const d=Math.hypot(s.g.position.x-p.x,s.g.position.z-p.z);if(d>s.len*.6+12)continue;const lp=p.clone().applyMatrix4(s.inv);if(s.sc)lp.multiplyScalar(s.sc);if(Math.abs(lp.x)<s.beam/2+2.4&&Math.abs(lp.z)<s.len/2+4){bump=2;if(s.alive&&s.k!=='bb'){s.v*=.5;if(Math.abs(B28.v)>4)shipDmg28(s,Math.abs(B28.v)*4,'p','casco')}break}}
 if(!bump)for(const d of L28.debris||[]){if(!d.g.visible)continue;if(Math.hypot(d.g.position.x-p.x,d.g.position.z-p.z)<3.2){if(Math.abs(B28.v)>5)wolfHit28(new T.Vector3(0,.2,B28.len*.45),Math.abs(B28.v)*.8,'ram');d.v=(d.v||new T.Vector3()).set(Math.sin(B28.hd)*B28.v*.6,0,Math.cos(B28.hd)*B28.v*.6);d.g.position.addScaledVector(d.v,.15)}}
 if(bump){p.x=ox;p.z=oz;const sp=Math.abs(B28.v);if(sp>3.5&&!B28.bt){B28.bt=1.6;wolfHit28(new T.Vector3(0,0,B28.len*.4),sp*1.3,'ram');shake=Math.max(shake,sp*.12);nz18(0,.6,'lowpass',260,80,.15);tn18('sawtooth',90,40,.4,.08);if(!L28.ev.bumpMsg){L28.ev.bumpMsg=1;radio28('Brandt (timonel)','¡Rocas! ¡Cuidado con el casco!',1.8)}}B28.v*=-.25}B28.bt=Math.max(0,(B28.bt||0)-dt);
 /* balanceo, cabeceo, escora por inundación e impactos */const amp=L28.wx.wave*2;B28.roll+=(Math.sin(time*.9)*.035*amp+B28.rud*B28.v*.0035-B28.flood*.12*(B28.floodSide||1)-B28.roll)*Math.min(1,dt*2);B28.kick=(B28.kick||0)*Math.max(0,1-dt*3);
 B28.pch+=((Math.sin(time*1.25)*.025*amp)-(B28.v>6?.02:0)+B28.kick*.04-B28.pch)*Math.min(1,dt*2.5);g.rotation.z=B28.roll;g.rotation.x=B28.pch;p.y=WY15+wv28(p.x,p.z)*.8-B28.flood*.6+Math.sin(time*7)*.004*Math.abs(B28.v);
 B28.vel.set(Math.sin(B28.hd)*B28.v,0,Math.cos(B28.hd)*B28.v);g.updateMatrixWorld(true);B28.inv.copy(g.matrixWorld).invert();
 /* estela, espuma en la proa, humo del motor */B28.ft=(B28.ft||0)+dt;if(Math.abs(B28.v)>1.5&&B28.ft>.09){B28.ft=0;const st=lw28(B28.u.wakeOut||new T.Vector3(0,0,-11));foam28(st.x+(R()-.5)*2,st.z+(R()-.5)*2,1.2+Math.abs(B28.v)*.08,3,2.4);const bw=lw28(new T.Vector3((R()<.5?-1:1)*.9,0,B28.len*.45));foam28(bw.x,bw.z,.6+Math.abs(B28.v)*.05,1,1.6);if(B28.v>9&&R()<.4)burst(bw.x,WY15+.6,bw.z,0xe8f4f8,2,.5,3)}
 B28.st_=(B28.st_||0)-dt;if(B28.st_<=0){B28.st_=C.motor<50?.12:.3;const so=lw28(B28.u.smokeOut||new T.Vector3(0,3.5,-1));smoke(so.x,so.y,so.z,C.motor<50?2.2:1.2,3,C.motor<50?0x1a1a1a:0x4a4a4a,1.5,C.motor<50?.7:.35)}
 /* agua que entra por el casco perforado */if(C.casco<70){B28.flood=Math.min(1,B28.flood+(70-C.casco)/70*.022*dt/D.rep*(B28.pump?.3:1))}if(B28.pump){B28.pump-=dt;B28.flood=Math.max(0,B28.flood-dt*.05)}
 if(B28.flood>.55&&!L28.ev.fl1){L28.ev.fl1=1;radio28('Voss (mecánico)','¡Entra agua a la sala de máquinas! ¡Hay que activar las bombas!',2.6)}
 if(B28.flood>=1||C.casco<=0)wolfSink28();
 /* incendios a bordo: daño progresivo */for(const f of B28.fires){const w=lw28(f.lp);f.g.position.copy(w);f.x=w.x;f.y=w.y;f.z=w.z;f.tt=(f.tt||0)+dt;const c=f.comp;C[c]=Math.max(0,C[c]-dt*1.2);C.casco=Math.max(0,C.casco-dt*.35);if(c==='comb'&&C.comb<20&&!f.boom){f.boom=1;fb12(w.x,w.y+1,w.z,8,.6,3);wolfHit28(f.lp,18,'fire')}}
 /* ruido del motor */engSnd28(Math.abs(B28.v)/16.5,C.motor);
 /* tripulación: averías */crewUpd28(dt);
 B28.gunCd-=dt;B28.flakCd-=dt;B28.mgCd-=dt;for(let i=0;i<2;i++){if(B28.tubeRel[i]>0){B28.tubeRel[i]-=dt*(C.tubos>30?1:.4);if(B28.tubeRel[i]<=0&&B28.torp>(B28.tubeRdy[0]+B28.tubeRdy[1])){B28.tubeRdy[i]=1;const t=B28.u.tubes&&B28.u.tubes[i];if(t&&t.torp)t.torp.visible=true;radio28('Keller','¡Tubo '+(i?'de estribor':'de babor')+' recargado!',1.6)}}}}
/* sonido continuo del motor con osciladores */
const ENG28={};function engSnd28(k,mot){if(!ac||!L28.on){return}try{if(!ENG28.o){const o=ac.createOscillator(),o2=ac.createOscillator(),f=ac.createBiquadFilter(),g=ac.createGain();o.type='sawtooth';o2.type='square';f.type='lowpass';f.frequency.value=220;o.connect(f);o2.connect(f);f.connect(g);g.connect(typeof AB==='function'?AB():ac.destination);g.gain.value=0;o.start();o2.start();Object.assign(ENG28,{o,o2,f,g})}
 const on=L28.onBoat&&playing&&!B28.sunk;ENG28.g.gain.setTargetAtTime(on?(.022+k*.04)*(mot<40?1.3:1):0,ac.currentTime,.2);ENG28.o.frequency.setTargetAtTime(32+k*48+(mot<40?Math.sin(time*13)*6:0),ac.currentTime,.25);ENG28.o2.frequency.setTargetAtTime(16+k*24,ac.currentTime,.25)}catch(e){}}
function engStop28(){try{if(ENG28.g)ENG28.g.gain.setTargetAtTime(0,ac.currentTime,.1)}catch(e){}}
/* impactos sobre el Wolfszahn: componente según la zona */
function wolfHit28(lp,dmg,k){if(B28.sunk||L9.cine&&!L28.cineDmg)return;const C=B28.comp;let c;const z=lp.z/(B28.len/2);
 if(k==='ram')c='casco';else if(z>.55)c=R()<.6?'canon':'casco';else if(z>.1)c=R()<.5?'radio':R()<.5?'timon':'casco';else if(z>-.35)c=R()<.5?'tubos':R()<.5?'comb':'casco';else c=R()<.4?'flak':R()<.5?'motor':R()<.5?'helice':'timon';
 dmg*=.75;if(c==='casco')C.casco=Math.max(0,C.casco-dmg*.5);else{C[c]=Math.max(0,C[c]-dmg*.9);C.casco=Math.max(0,C.casco-dmg*.15)}B28.kick=1;
 if(L28.onBoat){P.hp=Math.max(25,P.hp-dmg*.25);shake=Math.max(shake,Math.min(2,dmg*.05))}
 if(dmg>6){burst(lw28(lp).x,lw28(lp).y,lw28(lp).z,0xffa040,6,.4,5);crew28('hit')}
 if(dmg>8&&R()<(c==='comb'||c==='motor'?.3:.1)*(k==='fire'?0:1))wolfFire28(c);
 if(C[c]<=0&&!B28['dn'+c]){B28['dn'+c]=1;const m={motor:'¡El motor se para! ¡Voss, a la sala de máquinas!',helice:'¡Hélice dañada! ¡Perdemos velocidad!',timon:'¡El timón no responde bien!',canon:'¡El cañón de proa está inutilizado!',flak:'¡El Flak está fuera de combate!',tubos:'¡Los tubos lanzatorpedos están atascados!',radio:'¡La radio murió! ¡Pasamos a señales luminosas!',comb:'¡Fuga en el depósito de combustible!'}[c];if(m)talk([['Falk',m,2.4]])}}
const FCOMP28={motor:0,comb:1,radio:2,flak:3,canon:4};
function wolfFire28(c){if(B28.fires.length>=3)return;const fp=B28.u.firePts||[new T.Vector3(0,1.6,-5)];const i=Math.min(fp.length-1,FCOMP28[c]!==undefined?FCOMP28[c]:R()*fp.length|0);if(B28.fires.some(f=>f.i===i))return;const w=lw28(fp[i]),f=mkFire(w.x,w.z,1.1,w.y);f.lp=fp[i].clone();f.i=i;f.comp=c in B28.comp?c:'casco';B28.fires.push(f);radio28('Keller','¡Fuego a bordo! ¡'+(CN28[f.comp]||'Cubierta')+'!',1.8)}
function fireOut28(f){f.g.visible=false;const w=f.g.position;smoke(w.x,w.y+.6,w.z,2.5,2,0xd8dcdc,1.4,.6);B28.fires.splice(B28.fires.indexOf(f),1);nz18(0,.7,'highpass',2400,1800,.05)}
function wolfSink28(){if(B28.sunk||L28.fail)return;B28.sunk=true;radio28('Falk','¡Nos hundimos! ¡Abandonen el barco!',2.4);bx12(B28.g.position.x,WY15+2,B28.g.position.z,1);later28(3,()=>fail28('El Wolfszahn se hundió en el fiordo.'))}
/* tripulación a bordo: timonel Brandt, cargador Keller, mecánico Voss + comandante Falk */
function crewInit28(){if(L28.crew.length)return;const sp=B28.u.crewSpots||[{p:new T.Vector3(0,1.3,2),f:0},{p:new T.Vector3(.8,1.3,6),f:0},{p:new T.Vector3(0,1.3,-5),f:Math.PI}];
 const nm=['Brandt (timonel)','Keller','Voss (mecánico)'];sp.slice(0,3).forEach((s,i)=>{const n=sailor28(0,0,{name:nm[i],vest:true,cap:i===0});n.home=s.p.clone();n.homeF=s.f||0;n.lp=s.p.clone();n.job=null;n.g.visible=false;L28.crew.push(n)});
 const f=sailor28(0,0,{name:'Teniente de navío Falk',cap:true,officer:true,vest:true});f.home=new T.Vector3(-.95,3.62,.5);f.homeF=0;f.lp=f.home.clone();L28.falk=f;L28.crew.push(f);for(const n of L28.crew)n.g.visible=false}
function crewShow28(on){for(const n of L28.crew){n.g.visible=on;n.lock=true;n.on=false}}
function crewUpd28(dt){const D=dif28(),C=B28.comp;if(!L28.crew.length)return;const [hb,kl,vs]=L28.crew;
 /* asignar trabajos: incendios primero, luego bombas de achique y reparaciones */for(const f of B28.fires){if(f.who)continue;const n=[vs,kl].find(q=>q&&!q.job);if(!n)break;n.job={k:'fire',f,t:0};f.who=n;crewSay28(n,'¡Voy con el extintor!')}
 if(B28.flood>.2&&vs&&!vs.job){vs.job={k:'pump',t:0};crewSay28(vs,'¡Activo las bombas de achique!')}
 if(vs&&!vs.job){const c=['casco','motor','helice','timon','flak','canon','tubos','radio'].find(k=>C[k]<(k==='casco'?40:45));if(c){vs.job={k:'rep',c,t:0};crewSay28(vs,'¡Reparo '+CN28[c].toLowerCase()+'!')}}
 for(const n of[hb,kl,vs]){if(!n)continue;const j=n.job;let tgt=n.home;if(j){if(j.k==='fire'){if(!B28.fires.includes(j.f)){n.job=null;continue}tgt=j.f.lp}else if(j.k==='pump')tgt=(B28.u.stations&&B28.u.stations.eng)||n.home;else tgt=(B28.u.stations&&B28.u.stations.eng)||n.home}
  const d=Math.hypot(tgt.x-n.lp.x,tgt.z-n.lp.z);if(d>.6){const s=Math.min(d,2.2*dt);n.lp.x+=(tgt.x-n.lp.x)/d*s;n.lp.z+=(tgt.z-n.lp.z)/d*s;n.act='run';n.vx=1;n.lf=Math.atan2(tgt.x-n.lp.x,tgt.z-n.lp.z)}else if(j){n.act='tie';n.vx=0;j.t+=dt*D.rep;
   if(j.k==='fire'&&j.t>7){fireOut28(j.f);n.job=null;crewSay28(n,'¡Fuego apagado!')}else if(j.k==='pump'){B28.flood=Math.max(0,B28.flood-dt*.025*D.rep);if(B28.flood<.05){n.job=null}}else if(j.k==='rep'){const cap=j.c==='casco'?55:70;C[j.c]=Math.min(cap,C[j.c]+dt*(j.c==='casco'?1.4:3.2)*D.rep);if(C[j.c]>=cap){n.job=null;B28['dn'+j.c]=0;crewSay28(n,(j.c==='casco'?'Vía de agua taponada':CN28[j.c]+' reparado')+', a medias.')}}}
  else{n.act=n===hb?'clean':'idle';n.vx=0;n.lf=n.homeF}}
 crewPose28()}
function crewPose28(){if(!B28.g)return;for(const n of L28.crew){if(!n.g.visible)continue;const w=lw28(n.lp||n.home);n.g.position.copy(w);n.g.rotation.y=B28.hd+(n.lf!==undefined?n.lf:n.homeF||0);n.f=n.g.rotation.y}}
function crewSay28(n,t){if(L28.cs&&time-L28.cs<3)return;L28.cs=time;talk([[n.name.split(' ')[0],t,1.8]])}
function crew28(k){const L={kill:[['Keller','¡Blanco! ¡Se hunde!'],['Falk','¡Así se hace, Kern!'],['Brandt','¡Uno menos en el fiordo!']],hit:[['Brandt','¡Nos dieron!'],['Keller','¡Impacto a bordo!'],['Falk','¡Aguanten! ¡Sigan disparando!']],air:[['Keller','¡Lo bajaste! ¡Al agua!'],['Falk','¡Buen tiro de Flak!']]}[k];if(!L)return;if(L28.lc&&time-L28.lc<4)return;L28.lc=time;const l=L[R()*L.length|0];talk([[l[0],l[1],1.8]])}
/* ---------- puestos del jugador ---------- */
function stnPos28(){const st=B28.u.stations||{};return st[L28.stn]||new T.Vector3(0,B28.deckY,0)}
function setStn28(s,quiet){if(!STN28.includes(s))return;L28.stn=s;const yy=(B28.u.stationYaw||{})[s]||0;yaw=B28.hd+Math.PI-yy;pitch=s==='flak'?.35:0;if(!quiet){say(STNN28[s],1.4);tn18('square',300,420,.05,.03)}L28.work=null}
function boardPin28(){const lp=stnPos28(),w=lw28(lp);P.g.position.set(w.x,w.y,w.z);P.vy=0;P.mvx=P.mvz=0;
 const eye=lw28(new T.Vector3(lp.x,lp.y+(L28.stn==='flak'?1.5:L28.stn==='bow'?2.35:1.62),lp.z));cam.position.copy(eye);cam.rotation.z+=B28.roll*.8}
/* ---------- disparo según el puesto ---------- */
function wolfFire28_(){const C=B28.comp,u=B28.u,D=dif28();const dir=new T.Vector3();cam.getWorldDirection(dir);
 if(L28.stn==='bow'){if(C.canon<=0){say('Cañón inutilizado. Esperá la reparación o cambiá de puesto.',1.6);return}if(B28.gunCd>0)return;if(B28.gun<=0){say('Sin munición de cañón',1.2);return}const t=u.bowGun,mz=t.muzzles[0],o=new T.Vector3();mz.getWorldPosition(o);
  B28.gun--;B28.gunCd=1.6*(C.canon<50?1.6:1);shell28({p:o,v:dir.clone().multiplyScalar(160).add(B28.vel),k:'gun',dmg:46,by:'p'});fb12(o.x,o.y,o.z,3,.18,0);smoke(o.x,o.y,o.z,3,2,0xb0aca8,1,.5);flashLight(o.x,o.y,o.z,3,.2,0xffc070);nz18(0,.6,'lowpass',900,150,.22);tn18('sine',90,40,.4,.2);shake=Math.max(shake,.6);B28.kick=.6;if(t.pitch){t.pitch.position.z-=.25;later28(.2,()=>{t.pitch.position.z+=.25})}if(B28.gun%5===0)later28(.9,()=>crewSay28(L28.crew[1]||{name:'Keller'},'¡Cargado!'));return}
 if(L28.stn==='flak'){if(C.flak<=0){say('Flak fuera de combate.',1.4);return}if(B28.flakCd>0)return;if(B28.flak<=0){say('Sin munición de Flak',1.2);return}const t=u.flak;B28.flak--;B28.flakCd=.2*(C.flak<50?1.7:1);const mz=t.muzzles[B28.flak%t.muzzles.length],o=new T.Vector3();mz.getWorldPosition(o);
  const v=dir.clone();v.x+=(R()-.5)*.012;v.y+=(R()-.5)*.012;v.z+=(R()-.5)*.012;shell28({p:o,v:v.normalize().multiplyScalar(240),k:'flak',dmg:34,by:'p',fuse:3,g:2});fb12(o.x,o.y,o.z,1.4,.08,0);nz18(0,.18,'bandpass',900,500,.12);tn18('square',160,70,.1,.06);shake=Math.max(shake,.25);return}
 if(L28.stn==='torp'){torpLaunch28();return}
 if(L28.stn==='helm'){if(B28.mgCd>0)return;B28.mgCd=.09;const t=(u.mgs||[])[R()<.5?0:1];const mz=t&&t.muzzles?t.muzzles[0]:null,o=new T.Vector3();if(mz)mz.getWorldPosition(o);else o.copy(cam.position).add(dir);const v=dir.clone();v.x+=(R()-.5)*.02;v.y+=(R()-.5)*.015;v.z+=(R()-.5)*.02;shell28({p:o,v:v.normalize().multiplyScalar(220),k:'mg',dmg:6,by:'p'});weaponSfx('mg');return}
 if(L28.stn==='eng')say('Sala de máquinas: USAR para bombas de achique o apagar incendios.',1.6)}
function stnAim28(dt){const u=B28.u,loc=yaw+Math.PI-B28.hd;if(L28.stn==='bow'&&u.bowGun){const a=CL28(AD28(0,loc),-2.6,2.6);u.bowGun.yaw.rotation.y=a;if(u.bowGun.pitch)u.bowGun.pitch.rotation.x=-CL28(pitch,-.1,.5)}
 if(L28.stn==='flak'&&u.flak){u.flak.yaw.rotation.y=AD28(0,loc);if(u.flak.pitch)u.flak.pitch.rotation.x=-CL28(pitch,-.05,1.45)}
 if(L28.stn==='helm'&&u.mgs)for(const m of u.mgs)if(m.yaw)m.yaw.rotation.y=CL28(AD28(0,loc),-2,2);
 if(L28.stn==='torp'){B28.gyro=CL28(AD28(0,loc),-.6,.6)}
 if(u.searchlight&&L28.wx.night)u.searchlight.rotation.y=AD28(0,loc)}
/* ---------- torpedos ---------- */
function torp28(pos,hd,by,src,depth){const g=mkTorpedo15();g.rotation.order='YXZ';g.position.copy(pos);g.rotation.y=hd;scene.add(g);const t={g,p:g.position,hd,v:0,t:0,st:by==='p'?'tube':'drop',by,src,depth:depth||(by==='e'?.6:1.4),life:40,ft:0};if(by!=='p'){t.st='drop';t.vy=0}L28.torps.push(t);return t}
function torpArm28(){const i=B28.tubeSel,C=B28.comp;if(C.tubos<=0){say('Tubos atascados. Necesitan reparación.',1.6);return}if(!B28.tubeRdy[i]){say('Ese tubo está vacío'+(B28.torp>0?' · recargando…':' · no quedan torpedos'),1.6);return}if(B28.tubeArm[i]){say('Tubo listo. ¡FUEGO para lanzar!',1.4);return}
 L28.work={lbl:'Retirar el seguro y cebar el tubo '+(i?'de estribor':'de babor'),t:0,dur:1.6,boat:1,fn:()=>{B28.tubeArm[i]=1;say('Tubo '+(i?'de estribor':'de babor')+' cebado · comprobá el rumbo del giróscopo y lanzá',2);tn18('square',600,900,.08,.04);tn18('square',900,900,.06,.03,.12)}}}
function torpLaunch28(){const i=B28.tubeSel;if(!B28.tubeArm[i]){torpArm28();return}const tu=(B28.u.tubes||[])[i];if(!tu)return;B28.tubeArm[i]=0;B28.tubeRdy[i]=0;B28.torp--;if(tu.torp)tu.torp.visible=false;
 const o=new T.Vector3();tu.mouth.getWorldPosition(o);const hd=B28.hd+B28.gyro+(tu.side||0)*.06;const t=torp28(o,hd,'p',null);t.v=B28.v;tu.g.position.z-=.15;later28(.25,()=>{tu.g.position.z+=.15});
 nz18(0,.7,'highpass',600,300,.16);tn18('sawtooth',120,40,.6,.08);smoke(o.x,o.y,o.z,1.8,1.4,0xe0e0e0,.6,.6);feed('TORPEDO LANZADO · '+(i?'estribor':'babor')+' · giróscopo '+Math.round(B28.gyro*57.3)+'°');talk([['Keller','¡Torpedo en el agua!',1.6]]);
 if(B28.torp>(B28.tubeRdy[0]+B28.tubeRdy[1]))B28.tubeRel[i]=14;L28.lastTorp=t}
function torpUpd28(dt){for(let i=L28.torps.length-1;i>=0;i--){const t=L28.torps[i],p=t.p;t.t+=dt;let done=false;
  if(t.st==='tube'){/* expulsión del tubo */const k=Math.min(1,t.t/.35);p.x+=Math.sin(t.hd)*(t.v+4*k)*dt;p.z+=Math.cos(t.hd)*(t.v+4*k)*dt;if(t.t>.35){t.st='drop';t.vy=-1}}
  else if(t.st==='drop'){t.vy=(t.vy||0)-9.8*dt;p.y+=t.vy*dt;p.x+=Math.sin(t.hd)*Math.max(4,t.v)*dt;p.z+=Math.cos(t.hd)*Math.max(4,t.v)*dt;t.g.rotation.x=.25;if(p.y<WY15-t.depth){p.y=WY15-t.depth;t.st='run';t.g.rotation.x=0;splash28(p.x,p.z,.7);t.v=Math.max(t.v,6)}}
  else{t.v=Math.min(t.by==='e'?18:22,t.v+dt*8);p.x+=Math.sin(t.hd)*t.v*dt;p.z+=Math.cos(t.hd)*t.v*dt;p.y=WY15-t.depth;if(t.g.userData.prop)t.g.userData.prop.rotation.z+=dt*40;t.ft+=dt;if(t.ft>.07){t.ft=0;foam28(p.x-Math.sin(t.hd)*2,p.z-Math.cos(t.hd)*2,.45,4,1.2)}
   if(land15(p.x+Math.sin(t.hd)*2.6-X15,p.z+Math.cos(t.hd)*2.6)>p.y-.2){torpBoom28(p,null,null,t);if(t.by==='p')feed('El torpedo estalló contra las rocas');done=true}
   if(!done){for(const s of L28.ships){if((s.side==='e')===(t.by==='e')&&t.by!=='x')continue;if(!s.alive&&!(s.k==='bb'))continue;if(Math.abs(s.g.position.x-p.x)>s.len*.6+3||Math.abs(s.g.position.z-p.z)>s.len*.6+3)continue;const lp=p.clone().applyMatrix4(s.inv);if(s.sc)lp.multiplyScalar(s.sc);if(Math.abs(lp.x)<s.beam/2+.3&&Math.abs(lp.z)<s.len/2){if(lp.y<-s.draft){if(!t.under){t.under=1;if(t.by==='p'){feed('¡El torpedo pasó por debajo de la '+s.name.toLowerCase()+'!');talk([['Keller','¡Calado demasiado bajo! ¡Pasó por debajo!',2]])}}continue}torpBoom28(p,s,lp,t);done=true;break}}}
   if(!done&&t.by==='e'&&B28.g&&!B28.sunk){const lp=p.clone().applyMatrix4(B28.inv);if(Math.abs(lp.x)<B28.beam/2+.3&&Math.abs(lp.z)<B28.len/2){torpBoom28(p,null,null,t);wolfHit28(lp,62*dif28().dmg,'torp');B28.floodSide=lp.x<0?-1:1;done=true}}
   if(t.t>t.life){done=true;t.g.visible=false}}
  if(done){scene.remove(t.g);L28.torps.splice(i,1)}}}
function torpBoom28(p,s,lp,t){splash28(p.x,p.z,3.4);fb12(p.x,WY15+2,p.z,10,.7,4);smoke(p.x,WY15+8,p.z,12,5,0xe8eef0,8,.7);expSnd(p.x,p.z,2);tn18('sine',40,20,1.6,.25);flashLight(p.x,WY15+2,p.z,6,.35,0xffc070);shake=Math.max(shake,1.4*CL28(1-p.distanceTo(cam.position)/300,0,1));
 if(!s)return;if(s.k==='bb'){const sec=lp.z<-s.len/2+16?(lp.y<-2?'timon':'popa'):lp.z<-s.len/2+24?'propulsion':lp.z>s.len/2-18?'proa':lp.x<0?'babor':'estribor';const dmg=sec==='timon'||sec==='propulsion'?999:sec==='popa'?520:620;
  shipDmg28(s,dmg,t.by,sec,lp);if(sec==='popa'){shipDmg28(s,300,t.by,'propulsion',lp);shipDmg28(s,999,t.by,'timon',lp)}s.flood=(s.flood||0)+.6;s.floodSide=lp.x<0?-1:1;shipFire28(s,new T.Vector3(lp.x*.8/(s.sc||1),(s.u.deckY||5),lp.z/(s.sc||1)),2.6);s.torpHits=(s.torpHits||0)+1;s.lastHit={sec,t:time};if(t.by==='p'){score+=2000;feed('★ ¡IMPACTO DE TORPEDO EN EL ACORAZADO! · '+SECN28[sec]);L28.bbHit=sec}}
 else shipDmg28(s,s.k==='des'?620:400,t.by,'casco',lp)}
/* ---------- hidroaviones de Zheng-Hua ---------- */
function plane28(kind,x,y,z,hd,o){const g=mkSeaplane15(kind);g.rotation.order='YXZ';if(!(o&&o.raw)){const w_=W28(x,z);x=w_[0];z=w_[1]}g.position.set(X15+x,y,z);scene.add(g);const D=dif28();const a={kind,g,u:g.userData,p:g.position,hd,pch:0,bank:0,sp:kind==='att'?36:40,hp:(kind==='att'?110:80)*D.hp,max:(kind==='att'?110:80)*D.hp,st:'patrol',t:0,alt:y,r:(g.userData.span||13)*.5,vel:new T.Vector3(),bombs:kind==='att'?3:1,cx:X15+x,cz:z,cd:0,o:o||{}};L28.planes.push(a);return a}
function planeHit28(a,d,by){if(a.st==='down'||a.st==='gone')return;a.hp-=d;burst(a.p.x,a.p.y,a.p.z,0xffd080,3,.3,4);if(a.hp<a.max*.45&&!a.smk){a.smk=1}if(a.hp<a.max*.25&&a.st!=='flee'&&R()<.35&&!a.fled){a.fled=1;a.st='flee';a.t=0;feed('Un hidroavión se retira humeando');L28.kills.flee=(L28.kills.flee||0)+1}
 if(a.hp<=0){a.st='down';a.t=0;a.spin=(R()-.5)*3;fb12(a.p.x,a.p.y,a.p.z,6,.6,0);if(by==='p'){score+=600;crew28('air')}L28.kills.air++;feed('★ Hidroavión de Zheng-Hua derribado')}}
function planeUpd28(dt){const D=dif28();for(let i=L28.planes.length-1;i>=0;i--){const a=L28.planes[i],p=a.p;a.t+=dt;if(a.u.prop)a.u.prop.rotation.z+=dt*45;
  if(a.st==='gone'){scene.remove(a.g);L28.planes.splice(i,1);continue}
  if(a.st==='down'){a.pch=Math.max(-.9,a.pch-dt*.4);a.hd+=a.spin*dt;a.bank+=a.spin*dt*.8;if(R()<dt*20)smoke(p.x,p.y,p.z,2.5,3,0x1a1a1a,.5,.7);if(R()<dt*10)fb12(p.x,p.y,p.z,2.5,.3,0);
   if(p.y<WY15+.5){splash28(p.x,p.z,2.2);fb12(p.x,WY15+1,p.z,6,.5,2);expSnd(p.x,p.z,1);a.st='gone';if(!L28.ev.planeWater){L28.ev.planeWater=1;radio28('Vigía','¡Avión enemigo al agua!',1.8)}}}
  else{let gx,gz,ga=a.alt;const tg=L28.onBoat&&B28.g&&!B28.sunk?B28.g.position:null;
   if(a.st==='launch'){ga=a.alt;gx=p.x+Math.sin(a.hd)*100;gz=p.z+Math.cos(a.hd)*100;if(a.t>4)a.st='patrol'}
   else if(a.st==='patrol'){const ang=a.t*.35+(a.o.ph||0);gx=a.cx+Math.sin(ang)*160;gz=a.cz+Math.cos(ang)*160;ga=a.alt;a.cd-=dt*D.rate;if(tg&&a.cd<=0&&p.distanceTo(tg)<700){a.st='run';a.t=0;a.dropped=0;if(!L28.ev.runMsg||time-L28.ev.runMsg>14){L28.ev.runMsg=time;radio28('Vigía',a.kind==='att'?'¡Hidroavión en picada! ¡Viene a bombardear!':'¡Avión de reconocimiento ametrallando!',2)}}}
   else if(a.st==='run'){if(!tg){a.st='patrol';continue}const ft=Math.sqrt(2*Math.max(5,p.y-WY15)/9.8),lead=tg.clone().addScaledVector(B28.vel,ft*1.2);gx=lead.x;gz=lead.z;ga=WY15+(a.kind==='att'?34:26);const hdist=Math.hypot(lead.x-p.x,lead.z-p.z);
    if(a.kind==='att'&&!a.dropped&&hdist<a.sp*ft*1.05&&Math.abs(AD28(a.hd,Math.atan2(lead.x-p.x,lead.z-p.z)))<.35&&a.bombs>0){a.dropped=1;a.bombs--;bomb28(a);}
    if(a.kind==='rec'&&hdist<170){a.cd2=(a.cd2||0)-dt;if(a.cd2<=0){a.cd2=.1;const v=aimV28(p.clone(),tg.clone().setY(WY15+1.6),B28.vel,220,D.acc*.6,1.5);shell28({p:p.clone(),v,k:'mg',dmg:1.4,by:'e'})}}
    if(hdist<40||a.t>16){a.st='climb';a.t=0}}
   else if(a.st==='climb'){gx=p.x+Math.sin(a.hd)*100;gz=p.z+Math.cos(a.hd)*100;ga=a.alt+20;if(a.t>6){a.st='patrol';a.t=0;a.cd=5+R()*6;if(tg){a.cx=tg.x;a.cz=tg.z}}}
   else if(a.st==='flee'){gx=p.x+Math.sin(a.hd)*200;gz=p.z-200;ga=a.alt+40;if(a.t>14)a.st='gone'}
   /* rumbo, alabeo y altitud */const want=Math.atan2(gx-p.x,gz-p.z),df=AD28(a.hd,want),tr=CL28(df,-.75,.75);a.hd+=tr*dt;a.bank+=(-tr*1.1-a.bank)*Math.min(1,dt*2);const dy=ga-p.y;a.pch+=(CL28(dy/40,-.45,.4)-a.pch)*Math.min(1,dt*1.5);
   /* no chocar con las montañas */const ah=land15(p.x+Math.sin(a.hd)*60-X15,p.z+Math.cos(a.hd)*60);if(ah>p.y-25){a.pch=Math.min(.5,a.pch+dt*1.5);a.hd+=dt*.8}
   if(a.smk&&R()<dt*14)smoke(p.x,p.y,p.z,1.8,2.5,0x2a2a2a,.4,.6)}
  a.vel.set(Math.sin(a.hd)*Math.cos(a.pch),Math.sin(a.pch),Math.cos(a.hd)*Math.cos(a.pch)).multiplyScalar(a.sp);p.addScaledVector(a.vel,dt);a.g.rotation.set(-a.pch,a.hd,a.bank);
  /* zumbido del motor cerca de la cámara */const dc=p.distanceTo(cam.position);a.snd=(a.snd||0)-dt;if(dc<260&&a.snd<=0&&a.st!=='gone'){a.snd=.35;tn18('sawtooth',90+R()*12,80,.4,.05*CL28(1-dc/260,0,1))}}}
function bomb28(a){const g=(a.u.bombs||[])[a.bombs]||null;if(g)g.visible=false;const m=new T.Mesh(gBox(.3,.3,1.1),new T.MeshLambertMaterial({color:0x2a2a2a}));m.position.copy(a.p);m.position.y-=1.4;scene.add(m);L28.bombs.push({m,v:a.vel.clone().multiplyScalar(.9),t:0});tn18('sine',900,300,1.6,.04)}
function bombUpd28(dt){for(let i=L28.bombs.length-1;i>=0;i--){const b=L28.bombs[i];b.t+=dt;b.v.y-=9.8*dt;b.m.position.addScaledVector(b.v,dt);b.m.lookAt(b.m.position.clone().add(b.v));const p=b.m.position;let hit=false;
  if(B28.g&&!B28.sunk){const lp=p.clone().applyMatrix4(B28.inv);if(Math.abs(lp.x)<B28.beam/2+.3&&Math.abs(lp.z)<B28.len/2&&lp.y<3.5&&lp.y>-.5){impact28(p,'gun');fb12(p.x,p.y+1,p.z,7,.6,2);wolfHit28(lp,44*dif28().dmg,'bomb');if(R()<.6)wolfFire28(R()<.5?'comb':'motor');hit=true}}
  if(!hit&&p.y<WY15){splash28(p.x,p.z,2.4);if(B28.g){const d=Math.hypot(B28.g.position.x-p.x,B28.g.position.z-p.z);if(d<11){const lp=p.clone().applyMatrix4(B28.inv);wolfHit28(lp,28*(1-d/11)*dif28().dmg,'blast');shake=Math.max(shake,1.4)}}hit=true}
  if(hit||b.t>12){scene.remove(b.m);L28.bombs.splice(i,1)}}}
/* ---------- náufragos: rescate con cuerda ---------- */
function swimmer28(x,z){const n=sailor28(x,z,{name:'Marinero en el agua',vest:true});n.g.position.y=WY15-1.05;n.act='wave';n.swim=true;const r=mkLifeRing15?mkLifeRing15():null;if(r){r.position.set(X15+x+.9,WY15,z);scene.add(r);n.ring=r}L28.swim.push(n);return n}
function swimUpd28(dt){for(const n of L28.swim){if(!n.g.visible)continue;if(n.saved){n.st_=(n.st_||0)+dt;const k=Math.min(1,n.st_/1.4),w=lw28(new T.Vector3(B28.beam*.4*(n.side||1),B28.deckY,0));n.g.position.lerp(w,k*.2);if(k>=1){n.g.visible=false;if(n.ring)n.ring.visible=false}continue}const p=n.g.position;p.y=WY15-1.05+wv28(p.x,p.z)*.7;n.g.rotation.y+=dt*.3;if(n.ring)n.ring.position.y=WY15+wv28(p.x,p.z)*.7}}
function rescue28(n){n.saved=true;n.act='climb';n.side=Math.sign(n.g.position.clone().applyMatrix4(B28.inv).x)||1;L28.res++;score+=300;feed('★ Marinero rescatado ('+L28.res+')');const L=['¡Gracias, Wolfszahn! Pensé que me quedaba en el fiordo.','¡Dios los bendiga! ¡El agua está helada!','¡Gracias! ¡Denme un fusil, todavía puedo pelear!'];talk([['Náufrago',L[(L28.res-1)%L.length],2.4]]);tn18('square',500,700,.1,.04)}
/* =====================================================================
   CLIMA (niebla, nieve, viento, oleaje), RADIO y SEÑALES, ÓRDENES,
   VIGÍA (detección), HUD NAVAL y MINIMAPA DEL FIORDO
   ===================================================================== */
const WX28={tgt:{fog:520,snow:.3,wind:.3,wave:.45,col:0x8c98a2},cur:null,snow:null};
function wx28(o){Object.assign(WX28.tgt,o)}
function snowInit28(){if(WX28.snow)return;const n=Math.round(1400*Math.max(.35,G.part||1)),g=new T.BufferGeometry(),a=new Float32Array(n*3);for(let i=0;i<n;i++){a[i*3]=(R()-.5)*140;a[i*3+1]=R()*60;a[i*3+2]=(R()-.5)*140}g.setAttribute('position',new T.BufferAttribute(a,3));
 const m=new T.Points(g,new T.PointsMaterial({color:0xf4f6f8,size:.22,transparent:true,opacity:.85,depthWrite:false}));m.frustumCulled=false;scene.add(m);WX28.snow=m;WX28.n=n}
function wxUpd28(dt){const t=WX28.tgt;if(!WX28.cur)WX28.cur=Object.assign({},t);const c=WX28.cur,k=Math.min(1,dt*.35);for(const q of['fog','snow','wind','wave'])c[q]+=(t[q]-c[q])*k;
 scene.fog.far=c.fog;scene.fog.near=Math.min(40,c.fog*.12);const fc=new T.Color(t.col);scene.fog.color.lerp(fc,k);L28.wx.wave=c.wave;L28.wx.wind=c.wind;L28.wx.snow=c.snow;
 if(WX28.snow){const s=WX28.snow,pa=s.geometry.attributes.position,a=pa.array,n=Math.round(WX28.n*c.snow);s.geometry.setDrawRange(0,n);s.position.set(cam.position.x,cam.position.y-20,cam.position.z);s.visible=n>10;
  for(let i=0;i<n;i++){a[i*3+1]-=(2.2+(i%5)*.3)*dt;a[i*3]+=(c.wind*3+Math.sin(time+i)*.6)*dt;a[i*3+2]+=Math.cos(time*.7+i)*.4*dt;if(a[i*3+1]<0){a[i*3+1]=60;a[i*3]=(R()-.5)*140;a[i*3+2]=(R()-.5)*140}if(a[i*3]>70)a[i*3]-=140}pa.needsUpdate=true}
 if(typeof water15==='function')water15(dt,time,cam.position.x-X15,cam.position.z,c.wave);
 /* viento: ráfagas sonoras */L28.wt=(L28.wt||0)-dt;if(L28.wt<=0){L28.wt=3+R()*5;nz18(0,2.6,'bandpass',300+c.wind*300,200,.02+c.wind*.03)}}
/* ---------- radio: interferencias, comunicaciones cortadas → señales luminosas ---------- */
function radio28(who,t,d){const crewOnBoard=/Keller|Brandt|Voss|Falk|Vigía|Hell|Kern/.test(who);if(L28.onBoat&&B28.comp.radio<=0&&!crewOnBoard){const s=L28.ships.find(q=>q.side==='a'&&q.alive);if(s&&s.u.lamp){L28.sig={s,t:2.4}}talk([['SEÑALES · lámpara del '+(s?s.name:'aliado'),t.replace(/[¡!]/g,'').toUpperCase(),d||2.6]]);return}
 let tx=t;if(L28.onBoat&&B28.comp.radio<55&&!crewOnBoard)tx=t.split(' ').map(w=>R()<.25?'…krrr…':w).join(' ');if(!crewOnBoard){nz18(0,.25,'bandpass',2200,1600,.04);tn18('square',1200,1200,.04,.015)}talk([[crewOnBoard?who:'RADIO · '+who,tx,d||Math.max(2,t.length*.05)]])}
function sigUpd28(dt){if(!L28.sig)return;const g=L28.sig;g.t-=dt;const l=g.s.u.lamp;if(l){l.visible=Math.sin(time*18)>0||g.t<=0;if(l.material&&l.material.color)l.material.color.setHex(Math.sin(time*18)>0?0xfff6d0:0x333333)}if(g.t<=0)L28.sig=null}
function order28(){L28.ordI=(L28.ordI+1)%ORD28.length;const o=ORD28[L28.ordI];L28.ord=o[0];feed('ORDEN NAVAL: '+o[1]);const al=L28.ships.filter(s=>s.side==='a'&&s.alive&&!s.abandon);if(!al.length){say('No quedan patrulleras aliadas',1.4);return}
 const ack={form:'¡Recibido! En formación detrás del Wolfszahn.',esc:'¡Recibido! ¡Vamos por las escoltas!',cub:'¡Recibido! Cubrimos al Wolfszahn contra aviones.',bb:'¿Contra el acorazado? ¡Recibido… que Dios nos ayude!',base:'¡Recibido! Volvemos a proteger Kaltfjord.',hold:'¡Recibido! Mantenemos posición.',ret:'¡Recibido! Nos replegamos al puerto.'}[o[0]];radio28(al[0].name,ack,2.2);if(B28.comp.radio<=0)L28.sig={s:al[0],t:2}}
function flare28(){const p=cam.position.clone();const m=new T.Mesh(gSph(.25,6,5),new T.MeshBasicMaterial({color:0xff3020}));m.position.copy(p);scene.add(m);const L=new T.PointLight(0xff4020,3,80);m.add(L);let t=0,vy=26;const tick=dt=>{t+=dt;vy-=6*dt;m.position.y+=vy*dt;if(R()<.6)smoke(m.position.x,m.position.y,m.position.z,.8,1.5,0xd8c8c0,.2,.5);if(t>7){scene.remove(m);return false}return true};L28.fx=(L28.fx||[]);L28.fx.push(tick);
 tn18('sawtooth',500,1200,.5,.05);feed('BENGALA ROJA · los aliados atacan al enemigo más cercano');const al=L28.ships.filter(s=>s.side==='a'&&s.alive&&!s.abandon);if(al.length){L28.ord='esc';L28.ordI=1;radio28(al[0].name,'¡Bengala roja! ¡Al ataque!',1.8)}}
/* ---------- vigía: rumbo, distancia e identificación parcial ---------- */
function brg28(dx,dz){return Math.round((Math.atan2(dx,-dz)*57.2958+360)%360)}
function card28(b){return['N','NE','E','SE','S','SO','O','NO'][Math.round(b/45)%8]}
function vigia28(){const p=(B28.g&&L28.onBoat)?B28.g.position:P.g.position,L=[];for(const s of L28.ships){if(!s.alive||s.side!=='e'||!s.g.visible)continue;const d=p.distanceTo(s.g.position);if(d>1400||d>scene.fog.far*1.7)continue;L.push({d,b:brg28(s.g.position.x-p.x,s.g.position.z-p.z),n:d<650||s.k==='bb'?{bb:'ACORAZADO',des:'Destructor',pat:'Patrullera',lc:'Barcaza'}[s.k]:'Contacto ?'})}
 for(const a of L28.planes){if(a.st==='down'||a.st==='gone')continue;const d=p.distanceTo(a.p);if(d>1200)continue;L.push({d,b:brg28(a.p.x-p.x,a.p.z-p.z),n:d<550?'Hidroavión':'Motor de avión ?'})}
 L.sort((a,b)=>a.d-b.d);return L.slice(0,3).map(c=>c.n+' '+card28(c.b)+' '+String(c.b).padStart(3,'0')+'° ≈'+(c.d>=1000?(c.d/1000).toFixed(1).replace('.',',')+' km':Math.round(c.d/10)*10+' m')).join(' · ')}
/* ---------- HUD naval contextual ---------- */
document.head.insertAdjacentHTML('beforeend','<style>#nv28{position:absolute;left:50%;top:70px;transform:translateX(-50%);width:min(760px,94vw);text-align:center;font:12px Georgia,serif;letter-spacing:1px;color:#e8dcb8;text-shadow:0 1px 2px #000;pointer-events:none;z-index:6;display:none;line-height:1.45}#nv28 b{color:#ffd878}#nv28 .bad{color:#ff7a5a}#nv28 .mid{color:#f0c060}#nv28 .ok{color:#a8d88a}#nv28 .row{background:linear-gradient(90deg,transparent,rgba(16,14,10,.55),transparent);padding:1px 0}#ars28{position:absolute;left:50%;top:70px;transform:translateX(-50%);font:13px Georgia,serif;color:#f0dca8;text-shadow:0 1px 2px #000;display:none;z-index:6;pointer-events:none}@media (max-width:760px){#nv28{font-size:10px;top:62px}}</style>');
document.body.insertAdjacentHTML('beforeend','<div id="nv28"></div><div id="ars28"></div>');
const pc28=v=>{v=Math.round(v);return'<span class="'+(v<35?'bad':v<70?'mid':'ok')+'">'+v+'%</span>'};
function hud28(dt){const e=$('nv28');L28.ht=(L28.ht||0)-dt;if(!L28.onBoat||L9.cine||!playing){e.style.display='none';return}e.style.display='block';if(L28.ht>0)return;L28.ht=.2;const C=B28.comp,kn=Math.abs(B28.v)*1.944,tl=B28.thr<-.05?'ATRÁS':B28.thr<.08?'PARADO':B28.thr<.4?'⅓ AVANTE':B28.thr<.75?'⅔ AVANTE':'TODA MÁQUINA',hd=brg28(Math.sin(B28.hd),-Math.cos(B28.hd));
 let w='';if(L28.stn==='torp'){const tb=i=>(i?'ESTRIBOR':'BABOR')+' ['+(!B28.tubeRdy[i]?(B28.tubeRel[i]>0?'RECARGANDO '+Math.ceil(B28.tubeRel[i])+'s':'VACÍO'):B28.tubeArm[i]?'<b>CEBADO</b>':'CARGADO')+']';w='TUBOS: '+(B28.tubeSel?tb(0)+' · <b>▶ '+tb(1)+'</b>':'<b>▶ '+tb(0)+'</b> · '+tb(1))+' · TORPEDOS '+B28.torp+' · GIRÓSCOPO '+(B28.gyro>=0?'+':'')+Math.round(B28.gyro*57.3)+'° · REC cambia tubo · USAR ceba · FUEGO lanza'}
 else if(L28.stn==='bow')w='CAÑÓN 88 mm · '+(C.canon<=0?'<span class="bad">INUTILIZADO</span>':B28.gunCd>0?'CARGANDO…':'<b>LISTO</b>')+' · PROYECTILES '+B28.gun+' · estado '+pc28(C.canon);
 else if(L28.stn==='flak')w='FLAK 37 mm · '+(C.flak<=0?'<span class="bad">FUERA DE COMBATE</span>':'CARGADORES '+B28.flak)+' · estado '+pc28(C.flak)+' · espoleta de proximidad';
 else if(L28.stn==='eng')w='SALA DE MÁQUINAS · AGUA EMBARCADA '+pc28(B28.flood*100).replace('ok','bad')+' · INCENDIOS '+B28.fires.length+' · USAR: '+(B28.fires.length?'apagar incendio':'bombas de achique');
 else w='TIMÓN · AMETRALLADORAS DEL PUENTE · W/S telégrafo · A/D timón';
 const al=L28.ships.filter(s=>s.side==='a'&&s.alive);const vg=vigia28();
 e.innerHTML='<div class="row">⚓ <b>'+STNN28[L28.stn].split(' · ')[0]+'</b> · '+kn.toFixed(0)+' NUDOS · RUMBO '+String(hd).padStart(3,'0')+'° · '+tl+'</div><div class="row">CASCO '+pc28(C.casco)+' · MOTOR '+pc28(C.motor)+' · HÉLICE '+pc28(C.helice)+' · TIMÓN '+pc28(C.timon)+' · RADIO '+pc28(C.radio)+(B28.flood>.03?' · AGUA <span class="bad">'+Math.round(B28.flood*100)+'%</span>':'')+(B28.fires.length?' · <span class="bad">🔥 FUEGO A BORDO ×'+B28.fires.length+'</span>':'')+'</div><div class="row">'+w+'</div>'+(al.length?'<div class="row">ORDEN: <b>'+ORD28[L28.ordI][1]+'</b> ('+al.map(s=>s.name+' '+Math.round(s.hp/s.max*100)+'%').join(', ')+') · T/ORD cambia</div>':'')+(vg?'<div class="row">VIGÍA · '+vg+'</div>':'')}
/* ---------- minimapa del fiordo (amplía el de la v27) ---------- */
{const _mm=mm27;mm27=function(dt){if(level!==15)return _mm(dt);const c=$('mm27'),k=$('cp27'),dd=$('dist27');const on=playing&&!L9.cine;if(!on){c.style.display=k.style.display=dd.style.display='none';return}
 c.style.display=k.style.display=dd.style.display='block';$('arrow').style.display='none';MM27.t+=dt;const boat=L28.onBoat&&B28.g,pp=boat?B28.g.position:P.g.position,yw=yaw,rx=Math.cos(yw),rz=-Math.sin(yw),fx=-Math.sin(yw),fz=-Math.cos(yw);
 const x=c.getContext('2d'),W=300,Cc=W/2,RA=boat?260:50,s=Cc/RA;x.setTransform(1,0,0,1,0,0);x.clearRect(0,0,W,W);x.save();x.beginPath();x.arc(Cc,Cc,Cc-2,0,6.283);x.clip();x.fillStyle='rgba(20,26,30,.85)';x.fillRect(0,0,W,W);
 x.setTransform(s*rx,-s*fx,s*rz,-s*fz,Cc,Cc);const mi=typeof ENV15!=='undefined'&&ENV15.mini;if(mi){const I=ENV15.miniInfo||{x0:-1000,z0:-1450,mpp:5};x.globalAlpha=.9;x.drawImage(mi,X15+I.x0-pp.x,I.z0-pp.z,mi.width*I.mpp,mi.height*I.mpp);x.globalAlpha=1}
 if(!boat){x.fillStyle='rgba(206,192,150,.5)';for(const o of obstB){const dx=o.x-pp.x,dz=o.z-pp.z;if(dx*dx+dz*dz>(RA+20)*(RA+20))continue;if(o.hw>60||o.hd>60)continue;x.fillRect(dx-o.hw,dz-o.hd,o.hw*2,o.hd*2)}}
 x.setTransform(1,0,0,1,0,0);const map=(wx,wz)=>{const dx=wx-pp.x,dz=wz-pp.z;return[Cc+(dx*rx+dz*rz)*s,Cc-(dx*fx+dz*fz)*s]};const tri=(wx,wz,h,col,sz)=>{const [a,b]=map(wx,wz);x.save();x.translate(a,b);x.rotate(h+yw+Math.PI);x.fillStyle=col;x.beginPath();x.moveTo(0,-sz);x.lineTo(sz*.6,sz*.7);x.lineTo(-sz*.6,sz*.7);x.closePath();x.fill();x.restore()};
 for(const sh of L28.ships){if(!sh.g.visible||sh.gone)continue;const d=pp.distanceTo(sh.g.position);if(d>RA*1.1)continue;const col=!sh.alive?'#777':sh.side==='a'?'#7cd06a':sh.k==='bb'?'#ff4a2a':'#e0503a';tri(sh.g.position.x,sh.g.position.z,sh.hd,col,sh.k==='bb'?16:sh.k==='des'?11:8)}
 for(const a of L28.planes){if(a.st==='gone'||a.st==='down')continue;if(pp.distanceTo(a.p)>RA)continue;const [u,v]=map(a.p.x,a.p.z);x.fillStyle='#ffd040';x.font='bold 20px Georgia';x.textAlign='center';x.textBaseline='middle';x.fillText('✈',u,v)}
 for(const t of L28.torps){if(t.st!=='run')continue;const [u,v]=map(t.p.x,t.p.z);x.fillStyle=t.by==='e'?'#ff6040':'#e8f0f8';x.fillRect(u-2,v-2,4,4)}
 for(const n of L28.swim){if(!n.g.visible||n.saved)continue;const [u,v]=map(n.g.position.x,n.g.position.z);x.strokeStyle='#ffa040';x.lineWidth=3;x.beginPath();x.arc(u,v,6,0,6.283);x.stroke()}
 if(!boat){x.fillStyle='#7cd06a';for(const n of(L13.sq||[]).filter(n=>n.on&&n.g.visible&&n.lv===15)){const [a,b]=map(n.g.position.x,n.g.position.z);x.beginPath();x.arc(a,b,6,0,6.283);x.fill()}for(const e of enemies){if(e.hp<=0)continue;const dx=e.g.position.x-pp.x,dz=e.g.position.z-pp.z;if(dx*dx+dz*dz>RA*RA)continue;const [a,b]=map(e.g.position.x,e.g.position.z);x.fillStyle='#e03a2a';x.beginPath();x.arc(a,b,6,0,6.283);x.fill()}}
 if(L9.obj){let [a,b]=map(L9.obj[0],L9.obj[1]);const dx=a-Cc,dy=b-Cc,d=Math.hypot(dx,dy),lim=Cc-16;let edge=false;if(d>lim){a=Cc+dx/d*lim;b=Cc+dy/d*lim;edge=true}const pu=1+Math.sin(MM27.t*6)*.18;x.save();x.translate(a,b);x.fillStyle='#ffd25a';if(edge){x.rotate(Math.atan2(dy,dx)+1.5708);x.beginPath();x.moveTo(0,-14*pu);x.lineTo(10,6);x.lineTo(-10,6);x.closePath();x.fill()}else{x.scale(pu,pu);x.beginPath();for(let i=0;i<10;i++){const r=i%2?6:14,an=i*.6283-1.5708;x.lineTo(Math.cos(an)*r,Math.sin(an)*r)}x.closePath();x.fill()}x.restore()}
 if(boat)tri(pp.x,pp.z,B28.hd,'#ffffff',12);else{x.fillStyle='#fff';x.beginPath();x.moveTo(Cc,Cc-13);x.lineTo(Cc+9,Cc+10);x.lineTo(Cc,Cc+5);x.lineTo(Cc-9,Cc+10);x.closePath();x.fill()}
 {const [a,b]=map(pp.x,pp.z-100);const dx=a-Cc,dy=b-Cc,d=Math.hypot(dx,dy)||1;x.font='bold 22px Georgia';x.textAlign='center';x.textBaseline='middle';x.fillStyle='#e8c878';x.fillText('N',Cc+dx/d*(Cc-18),Cc+dy/d*(Cc-18))}x.restore();
 /* brújula */{const x=k.getContext('2d'),W=880,H=68,hd=Math.atan2(fx,-fz);x.clearRect(0,0,W,H);const gr=x.createLinearGradient(0,0,W,0);gr.addColorStop(0,'rgba(20,16,10,0)');gr.addColorStop(.15,'rgba(20,16,10,.62)');gr.addColorStop(.85,'rgba(20,16,10,.62)');gr.addColorStop(1,'rgba(20,16,10,0)');x.fillStyle=gr;x.fillRect(0,8,W,46);
  const FOV=1.9,px=a=>{let r=a-hd;while(r>Math.PI)r-=6.283;while(r<-Math.PI)r+=6.283;return Math.abs(r)>FOV/2?null:W/2+r/(FOV/2)*(W/2-30)};const NM=['N','NE','E','SE','S','SO','O','NO'];x.textAlign='center';x.textBaseline='middle';
  for(let i=0;i<24;i++){const a=i*.2618,X_=px(a);if(X_===null)continue;const big=i%3===0;x.fillStyle=big?'#e8c878':'rgba(232,200,120,.5)';if(big){x.font=(i%6===0?'bold 24px':'18px')+' Georgia';x.fillText(NM[i/3],X_,31)}else x.fillRect(X_-1,24,2,14)}
  x.fillStyle='#e8c878';x.beginPath();x.moveTo(W/2,52);x.lineTo(W/2-7,62);x.lineTo(W/2+7,62);x.closePath();x.fill();
  if(L9.obj){const dx=L9.obj[0]-pp.x,dz=L9.obj[1]-pp.z,b=Math.atan2(dx,-dz);let X_=px(b),side=0;if(X_===null){let r=b-hd;while(r>Math.PI)r-=6.283;while(r<-Math.PI)r+=6.283;side=r>0?1:-1;X_=side>0?W-22:22}x.fillStyle='#ffd25a';x.save();x.translate(X_,31);if(side){x.scale(side,1);x.beginPath();x.moveTo(12,0);x.lineTo(-4,-11);x.lineTo(-4,11);x.closePath();x.fill()}else{x.beginPath();for(let i=0;i<10;i++){const r=i%2?6:15,an=i*.6283-1.5708;x.lineTo(Math.cos(an)*r,Math.sin(an)*r)}x.closePath();x.fill()}x.restore()}
  /* contactos enemigos en la brújula */for(const sh of L28.ships){if(!sh.alive||sh.side!=='e'||!sh.g.visible)continue;const dx=sh.g.position.x-pp.x,dz=sh.g.position.z-pp.z;if(Math.hypot(dx,dz)>900)continue;const X_=px(Math.atan2(dx,-dz));if(X_===null)continue;x.fillStyle=sh.k==='bb'?'#ff4a2a':'#e0503a';x.fillRect(X_-3,46,6,6)}}
 if(L9.obj)dd.textContent='OBJETIVO · '+Math.round(Math.hypot(L9.obj[0]-pp.x,L9.obj[1]-pp.z))+' m';}}
/* =====================================================================
   CONTROLADOR DE MISIÓN: construcción, fases, cinemáticas
   ===================================================================== */
const BOMBP28=[[-120,15],[90,40],[40,20],[-60,30],[10,60],[-100,80],[-20,90],[60,100]];
/* corte lateral entre el canal del oeste y el canal principal (paso para el primer ataque) */
function cutH28(x,z){const P_=[[-150,-430],[-95,-442],[-45,-432]];let d=1e9;for(let i=0;i<P_.length-1;i++){const [ax,az]=P_[i],[bx,bz]=P_[i+1],vx=bx-ax,vz=bz-az,t=CL28(((x-ax)*vx+(z-az)*vz)/(vx*vx+vz*vz),0,1),dx=x-(ax+vx*t),dz=z-(az+vz*t);d=Math.min(d,Math.hypot(dx,dz))}return d<20?-12+(d/20)*(d/20)*10:1e9}
function build28(){if(L28.built)return;L28.built=true;
 {const L0=land15;land15=function(x,z){const d=IW28(x,z),a=L0(d[0],d[1]);if(d[0]<-160||d[0]>-30||d[1]>-410||d[1]<-460)return a;return Math.min(a,cutH28(d[0],d[1]))}}
 buildFjord15();buildBase15();foamInit28();shellInit28();snowInit28();wolfInit28();crewInit28();const A=ENV15.anch;moor28();
 /* patrulleras aliadas amarradas */const al=A.allies||[{x:-8,z:-28},{x:50,z:-30}];L28.S12=ship28('ally','a',al[0].x,al[0].z,Math.PI,{num:'S-12',name:'S-12 «Kranich»',slot:0});L28.S14=ship28('ally','a',al[1].x,al[1].z,Math.PI,{num:'S-14',name:'S-14 «Möwe»',slot:1});
 /* el acorazado, oculto hasta la alarma */L28.bb=ship28('bb','e',35,-900,0,{});L28.bb.g.visible=false;L28.bb.hold=true;L28.bb.silent=true;
 /* marineros de la base: rutina, humor y luego defensa del puerto */const LN=[['Marinero Otten','Tres semanas sin ver un barco enemigo. Ni las focas vienen a vernos.'],['Cabo Ritter','¿Kern? El cocinero dice que hoy hay sopa. Dice lo mismo desde marzo.'],['Marinero Lenz','Si ves al teniente Falk, yo estaba trabajando. Muy duro.'],['Marinero Brück','Este frío no se va ni con aguardiente. Lo comprobé personalmente.'],['Cabo Hoff','Dicen que en el sur hace calor. Yo creo que es propaganda.'],['Marinero Sauer','¡Cuidado con esa caja! La última que se cayó al agua todavía flota en el informe.']];
 L28.base=(A.sailors||[]).slice(0,6).map((s,i)=>{const n=sailor28(s.x,s.z,{name:LN[i][0],cap:i%2===0,act:['smoke','argue','idle','clean','smokesit','idle'][i],f:s.f||0});n.line=LN[i][1];n.g.visible=true;return n});
 L28.def=['Cabo Ritter','Marinero Lenz','Marinero Brück','Marinero Otten'].map((nm,i)=>{const n=sailor28(A.falk.x+2+i,A.falk.z+6,{name:'Fusilero '+nm.split(' ')[1],w:i===3?'lmg':'r'});n.g.visible=false;return n});
 L28.vig=sailor28(A.tower?A.tower.x:-20,A.tower?A.tower.z:20,{name:'Vigía',cap:true,act:'point'});if(A.tower&&A.tower.y)L28.vig.g.position.y=A.tower.y;L28.vig.g.visible=true;
 L28.offG=sailor28(A.falk.x+3,A.falk.z+1,{name:'Oficial de guardia',cap:true,officer:true,act:'idle'});L28.offG.g.visible=true;
 /* línea de previsualización del rumbo del torpedo */{const g=new T.BufferGeometry().setFromPoints([new T.Vector3(0,0,0),new T.Vector3(0,0,140)]);const m=new T.LineDashedMaterial({color:0xfff2b0,dashSize:3,gapSize:2,transparent:true,opacity:.75});const l=new T.Line(g,m);l.computeLineDistances();l.visible=false;scene.add(l);L28.tline=l}}
function landFalk28(on){const f=L28.falk,A=ENV15.anch;if(on){f.onLand=true;f.g.visible=true;f.lock=false;f.g.position.set(X15+A.falk.x,0,A.falk.z);f.act='point';f.f=Math.PI}else f.onLand=false}
/* ---------- embarque y puestos ---------- */
function board28(){L28.onBoat=true;B28.moored=false;crewShow28(true);if(L28.falk)L28.falk.onLand=false;for(const n of L28.def){n.on=false;n.g.visible=false}L13.sq=[];setStn28('helm',true);$('gar').style.display='none';P.g.visible=false;wx28({fog:520})}
function unboard28(){L28.onBoat=false;crewShow28(false);$('nv28').style.display='none';L28.tline.visible=false}
/* ---------- trabajos (USAR) a pie y a bordo ---------- */
function works28(){const A=ENV15.anch,W=[],ph=L28.ph,tk=L28.tasks;if(L28.onBoat)return W;
 if(ph===1){if(!tk.crate&&!L28.carry)W.push({x:A.crateTake.x,z:A.crateTake.z,r:2.2,dur:1,lbl:'Levantar una caja de proyectiles de 88 mm',fn:()=>{L28.carry=1;feed('Llevás una caja de proyectiles · USAR junto al Wolfszahn para dejarla');tn18('square',260,200,.08,.04)}});
  if(L28.carry)W.push({x:A.crateDrop.x,z:A.crateDrop.z,r:3,dur:1.2,lbl:'Dejar la caja junto al Wolfszahn',fn:()=>{L28.carry=0;tk.crate=1;feed('★ Caja entregada');talk([['Keller','Gracias, Kern. Una más y te ascienden a mula.']])}});
  if(!tk.batt)W.push({x:A.battCheck.x,z:A.battCheck.z,r:2.6,dur:2.6,lbl:'Revisar el cerrojo y la puntería del cañón costero',fn:()=>{tk.batt=1;feed('★ Batería costera 1 revisada');talk([['Artillero Brandl','Ni un disparo en tres semanas. Está más limpio que mi conciencia.']])}});
  if(!tk.torp)W.push({x:A.torpLoad.x,z:A.torpLoad.z,r:2.6,dur:3,lbl:'Cargar un torpedo en la vagoneta del arsenal',fn:()=>{tk.torp=1;feed('★ Torpedo cargado para el Wolfszahn');talk([['Suboficial Mertens','Despacio… ese juguete hunde barcos. Preferiblemente ajenos.']])}})}
 return W}
function workUpd28(dt){const pp=P.g.position,w=L28.work;if(w){if(!w.boat&&Math.hypot(pp.x-w.x,pp.z-w.z)>w.r+1.2||L9.cine){L28.work=null;return}w.t+=dt;$('pr').textContent=w.lbl+'… '+bar10(w.t/w.dur);if(w.t>=w.dur){L28.work=null;w.fn()}return}if(L9.cine)return;
 if(L28.onBoat){const sw=swimNear28();if(sw){$('pr').textContent='[E / USAR] Lanzar una cuerda al náufrago';return}if(B28.fires.length){$('pr').textContent='[E / USAR] Combatir el incendio a bordo';return}if(L28.stn==='torp'){$('pr').textContent=B28.tubeArm[B28.tubeSel]?'Tubo cebado · ¡FUEGO para lanzar!':'[E / USAR] Retirar el seguro y cebar el tubo';return}if(L28.stn==='eng'&&B28.flood>.05){$('pr').textContent='[E / USAR] Activar las bombas de achique';return}$('pr').textContent='';return}
 for(const c of works28())if(Math.hypot(pp.x-X15-c.x,pp.z-c.z)<c.r){$('pr').textContent='[E / USAR] '+c.lbl;return}}
function swimNear28(){if(!B28.g)return null;for(const n of L28.swim){if(!n.g.visible||n.saved)continue;if(Math.hypot(n.g.position.x-B28.g.position.x,n.g.position.z-B28.g.position.z)<11&&Math.abs(B28.v)<4.5)return n}return null}
function boatUse28(){if(L28.work){L28.work=null;return}const sw=swimNear28();if(sw){L28.work={lbl:'Lanzando la cuerda',t:0,dur:1.5,boat:1,fn:()=>rescue28(sw)};return}
 if(B28.fires.length){const f=B28.fires[0];L28.work={lbl:'Combatiendo el incendio con el extintor',t:0,dur:2.4,boat:1,fn:()=>{if(B28.fires.includes(f)){if(f.who)f.who.job=null;fireOut28(f);feed('★ Incendio apagado')}}};return}
 if(L28.stn==='torp'){torpArm28();return}if(L28.stn==='eng'){L28.work={lbl:'Activando las bombas de achique',t:0,dur:2.6,boat:1,fn:()=>{B28.pump=14;feed('Bombas de achique en marcha');tn18('square',180,180,.6,.03)}};return}
 say('USAR: cebar torpedos (tubos), bombas (máquinas), apagar incendios o lanzar cuerdas a náufragos.',2.4)}
/* ---------- cinemáticas ---------- */
const wp28=(x,y,z)=>{const w_=W28(x,z);return[X15+w_[0],y,w_[1]]};
function cineIntro28(){const A=ENV15.anch,W=ENV15.anch.wolf;wx28({fog:600,snow:.35,wave:.4,wind:.3,col:0x9aa6b0});
 cine9([{d:6,a:wp28(-60,140,260),b:wp28(-20,110,170),la:wp28(10,20,-400),txt:'KALTFJORD · BASE NAVAL SEPTENTRIONAL · MARINA REAL DE EISENMARK · 1922'},
  {d:5,a:wp28(60,14,-70),b:wp28(30,8,-60),la:wp28(W.x,1.5,W.z)},{d:5,a:wp28(W.x+6,3,W.z+16),b:wp28(W.x+3,2.6,W.z+10),la:wp28(W.x,1.8,W.z-4)},
  {d:9,a:wp28(A.falk.x-4,1.7,A.falk.z+5),la:wp28(A.falk.x,1.6,A.falk.z)}],
  ()=>{go28(1)},[{t:.3,fn:()=>{nz18(0,4,'bandpass',300,200,.04)}},{t:16.5,fn:()=>sayN13('Teniente de navío Falk','Kern, deje de mirar el paisaje. Las cajas no se cargan solas.',2.6)},{t:19.4,fn:()=>sayN13('Matthias Kern','A la orden, mi teniente.',1.6)},{t:21.2,fn:()=>sayN13('Teniente de navío Falk','Munición al Wolfszahn, revise la batería uno y ayude en el arsenal. Después, a bordo.',3)}]);
 landFalk28(true);const f=L28.falk;f.g.position.set(X15+A.falk.x,0,A.falk.z);f.f=0}
function cineAlarm28(){const A=ENV15.anch,bb=L28.bb,W=A.wolf;bb.g.visible=true;bb.silent=true;bb.hold=false;{const w_=W28(30,-410);bb.g.position.set(X15+w_[0],WY15,w_[1])}bb.hd=0;bb.v=3;bb.route=RT28([[30,-370],[30,-350]]);bb.ri=0;bb.hold=false;wx28({fog:150,snow:.5,col:0x8a949c});WX28.cur.fog=140;
 const tw=A.tower||{x:-20,z:20,y:16};
 cine9([{d:4.5,a:wp28(tw.x+1,(tw.y||16)+1.7,tw.z+1.5),la:wp28(tw.x+10,(tw.y||16)-2,tw.z-120)},{d:4.5,a:wp28(A.falk.x+3,1.6,A.falk.z+4),la:wp28(A.falk.x,1.7,A.falk.z)},
  {d:9,a:wp28(W.x-4,1.4,W.z-26),b:wp28(W.x-6,1.6,W.z-30),la:()=>[bb.g.position.x,12,bb.g.position.z],fn:()=>{WX28.tgt.fog=520}},{d:5,a:()=>[bb.g.position.x+90,24,bb.g.position.z+70],la:()=>[bb.g.position.x,8,bb.g.position.z]},{d:3.5,a:wp28(-100,8,-20),la:wp28(-120,3,15)}],
  ()=>{bb.silent=false;bb.bombard=BOMBP28.slice();L28.st=1;L28.T=0;obj28('¡ALARMA! Corré al muelle del Wolfszahn',A.falk.x,A.falk.z)},
  [{t:.1,fn:()=>siren28(true),must:true},{t:.4,fn:()=>sayN13('Vigía','¡Contacto naval al norte!',2)},{t:2.6,fn:()=>sayN13('Oficial de guardia','¿Cuántos contactos?',1.6)},{t:4.6,fn:()=>sayN13('Vigía','¡No puedo identificarlos! ¡Son demasiado grandes!',2.4)},
   {t:9.6,fn:()=>sayN13('Teniente de navío Falk','¿Eso es un crucero?',1.8)},{t:11.8,fn:()=>sayN13('Vigía','¡Negativo, señor! ¡Es un acorazado!',2)},{t:14.2,fn:()=>sayN13('Teniente de navío Falk','¿Un acorazado en este fiordo?',2)},
   {t:18.6,fn:()=>{bb.silent=false;bb.bombard=[[-120,15]];for(const tr of bb.u.turrets)for(let k=0;k<tr.muzzles.length;k++)later28(k*.2,()=>turFire28(bb,{muzzles:[tr.muzzles[k]]},new T.Vector3(X15-120+(R()-.5)*20,1,15+(R()-.5)*20),null,170,'big',60,3));say('¡ANDANADA!',1.2)},must:true},{t:22,fn:()=>{if(ENV15.dest&&ENV15.dest.batt1)ENV15.dest.batt1.destroy();bx12(X15-120,2,15,1.4)},must:true}]);
 landFalk28(true)}
function siren28(on){L28.siren=on}
function cineBoard28(){const A=ENV15.anch,W=A.wolf,g=B28.g;siren28(false);board28();L28.onBoat=true;B28.moored=true;setStn28('helm',true);const f=L28.falk;
 L9.tick=dt=>{const t=CIN9.t;if(t>7.5){B28.moored=false;B28.thr=t<11?-.2:.55;if(t>11)B28.rud=-.25}wolfUpd28(dt)};
 cine9([{d:4,a:wp28(W.x+5,2.4,W.z+12),la:wp28(W.x,2,W.z)},{d:3.5,a:()=>{const p=lw28(new T.Vector3(1.6,5.2,3));return[p.x,p.y,p.z]},la:()=>{const p=lw28(new T.Vector3(-.95,5.1,.5));return[p.x,p.y,p.z]}},{d:4,a:wp28(W.x-14,1.2,W.z-10),la:()=>[g.position.x,1,g.position.z]},{d:4.5,a:wp28(W.x+18,.6,W.z-60),la:()=>[g.position.x,0,g.position.z]}],
  ()=>{L9.tick=null;B28.moored=false;B28.thr=.45;B28.rud=0;go28(4)},
  [{t:.3,fn:()=>sayN13('Teniente de navío Falk','¡Wolfszahn, al agua! ¡Nos vamos a enfrentar a esos bastardos!',2.8)},{t:3.4,fn:()=>sayN13('Keller','¡¿Contra ese acorazado?!',1.6)},{t:5.2,fn:()=>sayN13('Teniente de navío Falk','¡No! ¡Contra todo lo que no sea el acorazado! ¡El acorazado lo dejamos para cuando tengamos uno!',3.6)},{t:9.4,fn:()=>{nz18(0,2,'lowpass',200,90,.1);tn18('sawtooth',40,70,2,.06);sayN13('Brandt (timonel)','¡Amarras sueltas! ¡Máquina atrás!',1.8)}},{t:12,fn:()=>sayN13('Brandt (timonel)','¡Avante dos tercios!',1.4)}])}
function cinePlan28(){const g=B28.g;B28.thr=Math.min(B28.thr,.2);const f=L28.falk;
 L9.tick=dt=>{wolfUpd28(dt)};
 cine9([{d:5,a:()=>{const p=lw28(new T.Vector3(-1.9,5.1,3.2));return[p.x,p.y,p.z]},la:()=>{const p=lw28(new T.Vector3(-.95,5.15,.5));return[p.x,p.y,p.z]}},{d:5.5,a:()=>{const p=lw28(new T.Vector3(1.4,5.2,2.6));return[p.x,p.y,p.z]},la:()=>{const p=lw28(new T.Vector3(-.95,5.1,.5));return[p.x,p.y,p.z]}},{d:5,a:()=>{const p=lw28(new T.Vector3(0,6,-14));return[p.x,p.y,p.z]},la:()=>{const b=L28.bb.g.position;return[b.x,10,b.z]}},{d:4,a:wp28(-60,40,-200),la:wp28(-150,0,-430),txt:'EL CANAL ESTRECHO DEL OESTE'}],
  ()=>{L9.tick=null;L28.st=1;obj28('PLAN DE FALK · Entrá al canal estrecho del oeste',-60,-300)},
  [{t:.3,fn:()=>sayN13('Teniente de navío Falk','Ese monstruo tiene más acero que toda nuestra base.',2.4)},{t:3,fn:()=>sayN13('Keller','¿Y cómo piensa hundirlo, señor?',1.8)},{t:5,fn:()=>sayN13('Teniente de navío Falk','No pienso hundirlo.',1.6)},{t:6.8,fn:()=>sayN13('Keller','¿Entonces?',1.2)},{t:8.2,fn:()=>sayN13('Teniente de navío Falk','Pienso hacerle un agujero tan grande que tenga que reconsiderar su visita.',3)},{t:11.6,fn:()=>sayN13('Teniente de navío Falk','La ruta principal está bloqueada. Entramos por el canal del oeste. La batería dos lo va a distraer y el Kranich y el Möwe atacan por la angostura.',4.2)},{t:16,fn:()=>radio28('Batería 2','¡Batería dos lista! ¡Le vamos a hacer cosquillas!',2)}])}
function cineLast28(){B28.thr=Math.min(B28.thr,.3);L9.tick=dt=>{wolfUpd28(dt)};
 cine9([{d:5,a:()=>{const p=lw28(new T.Vector3(-2,5.1,3.4));return[p.x,p.y,p.z]},la:()=>{const p=lw28(new T.Vector3(-.95,5.1,.5));return[p.x,p.y,p.z]}},{d:4.5,a:()=>{const p=lw28(new T.Vector3(1.8,2.6,-2));return[p.x,p.y,p.z]},la:()=>{const p=lw28(new T.Vector3(0,2,-3.5));return[p.x,p.y,p.z]}},{d:4,a:()=>{const b=L28.bb.g.position;return[b.x-60,30,b.z-150]},la:()=>{const b=L28.bb.g.position;return[b.x,6,b.z]},txt:'EL TIANLONG INTENTA LLEGAR AL PUERTO INTERIOR'}],
  ()=>{L9.tick=null;L28.st=1},[{t:.3,fn:()=>sayN13('Teniente de navío Falk','¡Nos acercaremos por el lado ciego de las montañas! ¡Kern, prepare el último torpedo!',3)},{t:3.6,fn:()=>sayN13('Keller','¡Señor, nos van a hacer pedazos!',1.8)},{t:5.6,fn:()=>sayN13('Teniente de navío Falk','¡Ya están intentando hacerlo! ¡Al menos hagamos que les cueste!',2.8)}])}
function cineGround28(){const bb=L28.bb;L28.cineDmg=false;bb.silent=true;bb.route=null;bb.hold=false;{const w_=W28(22,-226);bb.goal=[X15+w_[0],w_[1]]}bb.spd=bb.vmax*.6;bb.rudderJam=1;
 L9.tick=dt=>{const p=bb.g.position;if(!bb.aground&&(p.z>W28(0,-238)[1]||dry28(p.x+Math.sin(bb.hd)*50,p.z+Math.cos(bb.hd)*50,bb.draft))){bb.aground=true;bb.v=0;shake=2;nz18(0,3,'lowpass',180,50,.3);tn18('sawtooth',50,30,2.6,.12);for(let i=0;i<6;i++)later28(i*.3,()=>splash28(p.x+(R()-.5)*20,p.z+40+(R()-.5)*20,2))}if(bb.aground){bb.list+=(.06-bb.list)*dt*.4;bb.g.rotation.x+=(-.025-bb.g.rotation.x)*dt*.3}wolfUpd28(dt)};
 cine9([{d:5,a:()=>{const b=bb.g.position;return[b.x-30,14,b.z-90]},la:()=>{const b=bb.g.position;return[b.x,4,b.z-40]}},{d:7,a:()=>{const b=bb.g.position;return[b.x+80,20,b.z+60]},la:()=>{const b=bb.g.position;return[b.x,4,b.z]},txt:'EL TIANLONG PIERDE EL TIMÓN Y ENCALLA EN LA ANGOSTURA'}],
  ()=>{L9.tick=null;bb.aground=true;bb.v=0;go28(10)},[{t:.5,fn:()=>radio28('Vigía','¡El timón! ¡Le dimos al timón! ¡No puede gobernar!',2.4)},{t:4,fn:()=>sayN13('Brandt (timonel)','¡Está virando solo! ¡Va derecho a la angostura!',2.4)},{t:7.5,fn:()=>radio28('Batería 2','¡Encalló! ¡El acorazado está atrapado en el fiordo!',2.6)}])}
function cineEnd28(){const A=ENV15.anch,W=A.wolf,bb=L28.bb,g=B28.g;moor28();B28.thr=0;sky9('tarde');wx28({fog:700,snow:.15,wave:.3,wind:.2,col:0x9a8a80});const f=L28.falk;
 const fd=$('fade12');
 cine9([{d:5,a:wp28(W.x+14,4,W.z-16),la:wp28(W.x,2.5,W.z+2),txt:'KALTFJORD · ATARDECER'},{d:6.5,a:()=>{const p=lw28(new T.Vector3(1.5,5.2,2.8));return[p.x,p.y,p.z]},la:()=>{const p=lw28(new T.Vector3(-.95,5.1,.5));return[p.x,p.y,p.z]}},{d:6,a:()=>{const p=lw28(new T.Vector3(-.6,5.3,-1.6));return[p.x,p.y,p.z]},la:()=>[bb.g.position.x,6,bb.g.position.z]},{d:9,a:()=>[bb.g.position.x+120,60,bb.g.position.z+160],b:()=>[bb.g.position.x+40,90,bb.g.position.z+260],la:()=>[bb.g.position.x,0,bb.g.position.z],txt:'MISIÓN COMPLETADA · EL FIORDO DE LOS CONDENADOS'}],
  ()=>{fd.style.opacity=1;setTimeout(()=>{if(level===15)end(true)},900)},
  [{t:.5,fn:()=>sayN13('Keller','¿Lo hundimos?',1.4)},{t:2.2,fn:()=>sayN13('Teniente de navío Falk','No.',1)},{t:3.6,fn:()=>sayN13('Keller','¿Entonces ganamos?',1.4)},{t:5.4,fn:()=>sayN13('Teniente de navío Falk','No dejó de ser un acorazado.',2)},{t:11.5,fn:()=>{say('Falk mira el fiordo.',1.6)}},{t:13,fn:()=>sayN13('Teniente de navío Falk','Pero hoy no llegó a donde quería.',2.8)},{t:17,fn:()=>radio28('Kaltfjord','A todas las unidades: el acorazado enemigo permanece inmovilizado en la angostura. Kaltfjord sigue en pie.',4)},{t:22.5,fn:()=>{fd.style.transition='opacity 3s';fd.style.opacity=1}}])}
/* ---------- fases ---------- */
function clearFoes28(){for(const e of[...enemies])kill(e);for(const s of L28.ships)if(s.side==='e'&&s.k!=='bb'){scene.remove(s.g);for(const f of s.fires)f.g.visible=false;s.alive=false;s.gone=true}L28.ships=L28.ships.filter(s=>!(s.side==='e'&&s.k!=='bb'));for(const a of L28.planes)scene.remove(a.g);L28.planes=[];for(const t of L28.torps)scene.remove(t.g);L28.torps=[];for(const b of L28.bombs)scene.remove(b.m);L28.bombs=[];for(const s of L28.sh)s.m.visible=false;L28.sh=[]}
function bbAt28(ph){const bb=L28.bb;bb.g.visible=ph>=2;bb.aground=ph>=10;bb.route=null;bb.hold=true;bb.silent=ph<2||ph>=10;bb.bombard=ph>=2&&ph<=6?BOMBP28.slice():null;
 if(ph>=10){{const w_=W28(22,-234);bb.g.position.set(X15+w_[0],WY15,w_[1])}bb.hd=.4;bb.list=.06;bb.v=0;for(const id of['timon','propulsion'])if(!bb.sec[id].down){bb.sec[id].down=true;bb.sec[id].hp=0}bb.torpHits=2}
 else if(ph>=2){const w_=ph>=5?W28(25,-470):W28(30,-350);bb.g.position.set(X15+w_[0],WY15,w_[1]);bb.hd=0;bb.v=0}else{const w_=W28(35,-900);bb.g.position.set(X15+w_[0],WY15,w_[1])}bb.g.rotation.y=bb.hd;if(ph>=8&&!bb.torpHits){bb.torpHits=1;bb.sec.babor.hp*=.3;bb.flood=.6;bb.floodSide=-1}}
function placeBoat28(x,z,hd){{const w_=W28(x,z);x=w_[0];z=w_[1]}B28.g.position.set(X15+x,WY15,z);B28.hd=hd;B28.v=4;B28.thr=.3;B28.moored=false;B28.g.rotation.y=hd;B28.g.updateMatrixWorld(true);B28.inv.copy(B28.g.matrixWorld).invert()}
function allyAt28(x,z,hd,i){const s=[L28.S12,L28.S14][i];if(!s)return;if(!s.alive){return}s.g.position.set(X15+x,WY15,z);s.hd=hd;s.g.rotation.y=hd;s.v=3;s.scripted=false}
function go28(ph,jump){const A=ENV15.anch;L9.tick=null;setPh28(ph);L28.fail=false;L28.work=null;$('fade12').style.transition='opacity 1.5s';$('fade12').style.opacity=0;if([1,3,4,5,6,7,8,9,10,11].includes(ph))L28.cpPh=ph;
 if(jump){clearFoes28();L28.carry=0;bbAt28(ph);if(ph>=3&&ENV15.dest)for(const k in ENV15.dest){if(k!=='batt2'&&!ENV15.dest[k].done)try{ENV15.dest[k].destroy()}catch(e){}}wolfReset28(true);L28.res=0;
  if(ph<4){unboard28();moor28();landFalk28(true);P.g.visible=true;const S={1:[A.falk.x+2,A.falk.z+8],3:[A.falk.x,A.falk.z+6]}[ph]||[A.falk.x,A.falk.z+8];P.g.position.set(X15+S[0],0,S[1]);P.vy=0;yaw=0;pitch=0;for(const n of[L28.S12,L28.S14]){if(n&&n.alive){const a=n===L28.S12?(A.allies||[])[0]:(A.allies||[])[1];if(a){n.g.position.set(X15+a.x,WY15,a.z);n.hd=Math.PI;n.v=0}n.spd=0;n.goal=null}}}
  else{board28();const S={4:[8.5,-60,Math.PI],5:[0,-190,Math.PI],6:[-20,-240,Math.PI],7:[-130,-425,1.6],8:[-150,-480,Math.PI],9:[-30,-755,.15],10:[-10,-300,Math.PI],11:[10,-205,0]}[ph];placeBoat28(S[0],S[1],S[2]);setStn28(ph===5||ph===10?'flak':ph===7||ph===9?'torp':'helm',true);allyAt28(S[0]-20,S[1]+30,S[2],0);allyAt28(S[0]+20,S[1]+30,S[2],1)}}
 if(ph===1){wx28({fog:600,snow:.35,wave:.4,wind:.3,col:0x9aa6b0});obj28('RUTINA EN KALTFJORD');P.g.visible=true;landFalk28(true);if(!jump){P.g.position.set(X15+A.falk.x+2,0,A.falk.z+8);P.vy=0;yaw=0;pitch=0}}
 if(ph===2){cineAlarm28()}
 if(ph===3){siren28(true);wx28({fog:420,snow:.45,col:0x8a949c});const ld=A.landing||[{x:-100,z:-3},{x:-40,z:-3},{x:70,z:-3}];L28.lcs=ld.slice(0,3).map((b,i)=>{const s=ship28('lc','e',b.x*.6,-140-i*18,0,{});s.vmax=7;s.st='in';s.beach=[X15+b.x,b.z-4];s.troops=i===2?7:6;return s});
  L13.sq=[...L28.def];for(const n of L28.def){n.on=true;n.g.visible=true;n.lock=false;n.g.position.set(X15+A.falk.x+(R()-.5)*6,0,A.falk.z+4+R()*4)}L13.loud=true;L13.sneak=false;L28.ars=100;
  radio28('Falk','¡Barcazas de desembarco! ¡Defiendan el muelle y el arsenal!',2.6);obj28('DEFENSA DEL PUERTO · Rechazá el desembarco y protegé el arsenal',A.arsenal.x,A.arsenal.z)}
 if(ph===4){siren28(false);unhideAllies28();wx28({fog:520,snow:.2,wave:.7,wind:.45,col:0x8c98a2});L28.ord='form';L28.ordI=0;
  L28.e4=[ship28('pat','e',-50,-170,Math.PI,{wp:[[-50,-170],[50,-150],[40,-260],[-40,-250]],side:1}),ship28('pat','e',60,-235,Math.PI,{wp:[[40,-260],[-40,-250],[-50,-170],[50,-150]],side:-1}),ship28('des','e',10,-330,0,{st:'hunt'})];L28.e4[2].o.name='Destructor ZH «Fenghuo»';
  obj28('COMBATE CONTRA ESCOLTAS · Hundí las patrulleras y el destructor',0,-220);talk([['Falk','¡Patrulleras al frente! ¡Kern, al cañón de proa! (ARM / teclas 1-5 cambian de puesto)',3]])}
 if(ph===5){wx28({fog:680,snow:0,wave:.6,col:0x9aa8b2});const bb=L28.bb,c=tw28(bb,bb.u.catapult||new T.Vector3(0,6,-40));const a0=plane28('rec',c.x-X15,c.y+2,c.z,bb.hd+Math.PI*.5,{raw:1});a0.st='launch';L28.p5=[a0,plane28('att',-80,140,-700,0,{ph:1}),plane28('att',60,150,-760,0,{ph:3}),plane28('rec',0,170,-800,0,{ph:5})];for(const a of L28.p5){a.cx=B28.g.position.x;a.cz=B28.g.position.z-60}
  fb12(c.x,c.y,c.z,4,.3,1);smoke(c.x,c.y,c.z,4,2,0xd8d8d8,1,.6);radio28('Vigía','¡Lanzan un hidroavión desde el acorazado! ¡Y vienen más por el norte!',2.6);setStn28('flak');obj28('ATAQUE AÉREO · Derribá o ahuyentá los hidroaviones con el Flak')}
 if(ph===6){cinePlan28();L28.D2=ship28('des','e',-5,-245,Math.PI,{st:'guard'});L28.D2.guard=W28(-5,-245);L28.D2.o.name='Destructor ZH «Leishen»';wx28({fog:560,snow:.25,col:0x8c98a2});L28.ord='esc';L28.ordI=1;L28.bb.bombard=[[ENV15.dest&&ENV15.dest.batt2?ENV15.dest.batt2.x:125,ENV15.dest&&ENV15.dest.batt2?ENV15.dest.batt2.z:10]]}
 if(ph===7){if(!L28.D2||!L28.D2.alive){L28.D2=ship28('des','e',-5,-245,Math.PI,{st:'guard'});L28.D2.guard=W28(-5,-245)}const bb=L28.bb;bb.bombard=null;bb.hold=true;bb.silent=false;obj28('PRIMER ATAQUE · Lanzá torpedos contra el costado del Tianlong',25,-470);B28.torp=Math.max(B28.torp,2);B28.tubeRdy=[1,1];for(const t of B28.u.tubes||[])if(t.torp)t.torp.visible=true;L28.h0=bb.torpHits||0;talk([['Falk','¡Ahí está! ¡Tubos listos, Kern! (tecla 4: tubos · USAR ceba · FUEGO lanza)',3]])}
 if(ph===8){wx28({fog:300,snow:.9,wind:.85,wave:.9,col:0x8a949a});L28.D3=ship28('des','e',-120,-690,Math.PI*.95,{st:'patrol',wp:[[-160,-560],[-150,-440]]});L28.D3.o.name='Destructor ZH «Bailong»';L28.e8=[ship28('pat','e',-115,-735,Math.PI,{wp:[[-110,-700],[-160,-560]],side:1}),ship28('pat','e',-60,-772,Math.PI,{wp:[[-110,-700],[-160,-560]],side:-1})];
  let al=[L28.S14,L28.S12].find(s=>s&&s.alive&&!s.abandon);if(!al){al=L28.S16=ship28('ally','a',-150,-470,Math.PI,{num:'S-16',name:'S-16 «Albatros»',slot:0})}const bp=B28.g.position;al.g.position.set(bp.x+Math.sin(B28.hd)*40+8,WY15,bp.z+Math.cos(B28.hd)*40);al.hd=B28.hd;al.scripted=true;al.v=8;L28.ram=al;
  obj28('CAOS NAVAL · Atravesá el canal hacia el norte',-40,-770);radio28(al.name,'¡Destructor en el canal! ¡Nos tiene encima!',2.4)}
 if(ph===9){cineLast28();wx28({fog:480,snow:.4,wind:.5,wave:.7,col:0x8c98a2});const bb=L28.bb;bb.hold=false;bb.silent=false;bb.bombard=null;bb.route=RT28([[28,-380],[28,-300],[25,-255],[24,-240]]);bb.ri=0;bb.vmax=4.2;B28.torp=Math.max(B28.torp,1);if(!B28.tubeRdy[0]&&!B28.tubeRdy[1]){B28.tubeRdy[0]=1;const t=(B28.u.tubes||[])[0];if(t&&t.torp)t.torp.visible=true}L28.t9=time;obj28('SEGUNDO ATAQUE · Alcanzá la popa del Tianlong y torpedeá el timón',30,-380)}
 if(ph===10){wx28({fog:600,snow:.2,wave:.6,col:0x9aa6b0});L28.bb.silent=true;L28.p10=[plane28('att',-90,150,-700,0,{ph:0}),plane28('att',70,160,-720,0,{ph:2}),plane28('att',0,170,-760,0,{ph:4}),plane28('rec',-40,150,-650,0,{ph:6}),plane28('rec',40,155,-640,0,{ph:8})];for(const a of L28.p10){a.cx=B28.g.position.x;a.cz=B28.g.position.z;a.cd=2+R()*6}
  setStn28('flak');radio28('Vigía','¡Cinco hidroaviones! ¡Último ataque aéreo!',2.4);obj28('ÚLTIMA DEFENSA ANTIAÉREA · Flak, apagá incendios y mantené a flote el Wolfszahn')}
 if(ph===11){wx28({fog:650,snow:.1,wave:.4,col:0x9a8f88});sky9('tarde');obj28('RETIRADA · Volvé al muelle de Kaltfjord',A.wolf.x,A.wolf.z);L28.ord='form';L28.ordI=0;radio28('Kaltfjord','Wolfszahn, aquí Kaltfjord. Vuelvan a casa.',2.2)}}
function unhideAllies28(){for(const s of[L28.S12,L28.S14])if(s&&s.alive){s.scripted=false}}
function fail28(msg){if(L28.fail)return;L28.fail=true;say(msg+' Volviendo al último punto de control…',3);const fd=$('fade12');fd.style.transition='opacity 1.6s';fd.style.opacity=1;setTimeout(()=>{if(level!==15)return;B28.sunk=false;go28(L28.cpPh,true)},2600)}
function upd28(dt){const ph=L28.ph,A=ENV15.anch,pp=P.g.position,bp=B28.g?B28.g.position:pp;L28.T+=dt;const T_=L28.T;
 if(ph===1){const tk=L28.tasks,done=['crate','batt','torp'].filter(k=>tk[k]).length;if(done<3){const nx=!tk.crate?(L28.carry?A.crateDrop:A.crateTake):!tk.batt?A.battCheck:A.torpLoad;obj28('RUTINA EN KALTFJORD ('+done+'/3) · '+(!tk.crate?(L28.carry?'Llevá la caja al Wolfszahn':'Buscá una caja de munición en el galpón'):!tk.batt?'Revisá el cañón de la batería 1':'Cargá un torpedo en el arsenal'),nx.x,nx.z)}else{if(once28('all'))talk([['Teniente de navío Falk','Bien, Kern. Ahora, a bordo. Hoy salimos de patrulla.']]);obj28('Subí al Wolfszahn (muelle 1)',A.crateDrop.x,A.crateDrop.z);if(Math.hypot(pp.x-X15-A.crateDrop.x,pp.z-A.crateDrop.z)<6)go28(2)}
  if(T_>260&&done<3&&once28('late'))talk([['Teniente de navío Falk','¡Kern! ¿Necesita un mapa para encontrar una caja?']]);if(T_>420)go28(2);
  for(const n of L28.base||[])if(!n.said&&Math.hypot(n.g.position.x-pp.x,n.g.position.z-pp.z)<4.5){n.said=1;n.look=[pp.x,pp.z];talk([[n.name,n.line,3]])}}
 else if(ph===2){if(L28.st===1){const D=ENV15.dest||{};if(T_>2&&once28('d1')){if(D.fuel)D.fuel.destroy();radio28('Oficial de guardia','¡Le dieron al depósito de combustible!',2)}if(T_>6&&once28('d2')){if(D.crane)D.crane.destroy()}if(T_>10&&once28('d3')){if(D.pier2)D.pier2.destroy();radio28('Oficial de guardia','¡El muelle dos se hunde!',1.8)}
   L28.fi=(L28.fi||1)-dt;if(L28.fi<=0){L28.fi=1.2+R()*1.8;for(let k=0;k<4;k++){const x=X15+(R()-.5)*260,z=R()*120;if(Math.hypot(x-pp.x,z-pp.z)<20)continue;bx12(x,1,z,.7);break}}
   if((Math.hypot(pp.x-X15-A.falk.x,pp.z-A.falk.z)<14&&T_>8)||T_>34)go28(3)}}
 else if(ph===3){const ars=$('ars28');ars.style.display=L9.cine?'none':'block';ars.innerHTML='ARSENAL '+'█'.repeat(Math.ceil(L28.ars/10))+'░'.repeat(10-Math.ceil(L28.ars/10))+' '+Math.round(L28.ars)+'%';ars.style.top='96px';
  const a=alive28('land');for(const e of a){if(Math.hypot(e.g.position.x-X15-A.arsenal.x,e.g.position.z-A.arsenal.z)<16)L28.ars-=dt*1.4*dif28().dmg}if(L28.ars<=0)fail28('Los atacantes tomaron el arsenal.');
  const unl=(L28.lcs||[]).every(s=>s.dropped||!s.alive);L28.ot='DEFENSA DEL PUERTO · Rechazá el desembarco ('+a.length+' enemigos) y protegé el arsenal ('+Math.round(L28.ars)+'%)';
  if(unl&&a.length===0&&T_>12&&once28('ok')){$('ars28').style.display='none';radio28('Falk','¡Desembarco rechazado! ¡Todos al Wolfszahn!',2);later28(2.2,()=>{if(L28.ph===3){setPh28(3.5);cineBoard28()}})}}
 else if(ph===4){const e=L28.e4||[],ps=e.filter(s=>s.k==='pat'&&!s.alive).length,ds=e.filter(s=>s.k==='des'&&!s.alive).length;L28.ot='COMBATE CONTRA ESCOLTAS · patrulleras '+ps+'/2 · destructor '+ds+'/1';
  if(T_>25&&once28('help')&&L28.S14.alive){radio28('S-14 «Möwe»','¡Patrullera encima nuestro! ¡Wolfszahn, necesitamos ayuda!',2.6);if(e[1]&&e[1].alive)e[1].focus=L28.S14}
  if(T_>6&&once28('tip'))talk([['Keller','Las patrulleras tienen poco calado: los torpedos les pasan por debajo. ¡Cañón, Kern!',3]]);
  if(ps>=2&&ds>=1&&once28('ok')){radio28('Falk','¡Escoltas fuera de combate! … ¿Oyen eso? ¡Aviones! ¡Al Flak!',2.6);later28(3,()=>{if(L28.ph===4)go28(5)})}}
 else if(ph===5){const pl=L28.p5||[],k=pl.filter(a=>a.st==='down'||a.st==='gone'||a.st==='flee').length;L28.ot='ATAQUE AÉREO · Derribá o ahuyentá los hidroaviones ('+k+'/'+pl.length+') · Flak: tecla 3';if(k>=pl.length&&once28('ok')){radio28('Falk','¡Cielo despejado! Brandt, reúna a todos. Tengo un plan.',2.4);later28(3,()=>{if(L28.ph===5)go28(6)})}}
 else if(ph===6){if(L28.st===1&&near28(bp,-60,-300,45)){L28.st=2;obj28('Seguí el canal entre las montañas',-150,-420)}if(L28.st===2&&near28(bp,-150,-420,45)){L28.st=3;obj28('Doblá al este por el paso lateral: el Tianlong está del otro lado',-60,-436);radio28('Vigía','¡El paso lateral! ¡El acorazado debería estar justo detrás de esa roca!',2.4)}if(L28.st===3&&near28(bp,-90,-440,40))go28(7);
  /* la batería 2 distrae al acorazado */L28.b2=(L28.b2||3)-dt;if(L28.b2<=0&&ENV15.dest&&ENV15.dest.batt2&&!ENV15.dest.batt2.done){L28.b2=6+R()*3;const b=ENV15.dest.batt2;fb12(X15+b.x,4,b.z-3,3,.2,0);const bb=L28.bb.g.position;later28(1.8,()=>splash28(bb.x+(R()-.5)*60,bb.z+(R()-.5)*80,1.4))}}
 else if(ph===7){const bb=L28.bb;if(L28.st===0){L28.ot='PRIMER ATAQUE · Torpedeá el costado del Tianlong · torpedos '+B28.torp;if((bb.torpHits||0)>L28.h0){L28.st=1;bb.hd=bb.hd;bb.hold=false;bb.route=RT28([[25,-440]]);talk([['Keller','¡IMPACTO! ¡Le dimos!',1.6],['Falk','¡Y sigue a flote, el muy desgraciado! ¡Nos vio! ¡Todo a babor, a las rocas!',3]]);radio28('Vigía','¡El acorazado cambia de rumbo! ¡Gira sus torres hacia nosotros!',2.4);obj28('¡Escapá entre las rocas! Volvé al canal del oeste',-150,-480)}else reserve28()}
  else if(near28(bp,-150,-480,40))go28(8)}
 else if(ph===8){const al=L28.ram,D3=L28.D3;if(al&&D3&&!L28.ev.col){if(al.alive&&D3.alive){al.goal=[D3.g.position.x,D3.g.position.z];al.spd=al.vmax;D3.goal=[al.g.position.x,al.g.position.z];D3.spd=D3.vmax*.7;D3.collide=1;const d=al.g.position.distanceTo(D3.g.position);if(d<(al.len+D3.len)*.45||T_>28){L28.ev.col=1;collide28(al,D3)}}else L28.ev.col=1}
  if(T_>3&&once28('ram'))radio28(al?al.name:'Aliado','¡No podemos esquivarlo! ¡Vamos a embestirlo! ¡Por Eisenmark!',2.6);
  const sv=L28.swim.filter(n=>n.saved).length,tot=L28.swim.length;L28.ot='CAOS NAVAL · Atravesá el canal hacia el norte'+(tot?' · náufragos rescatados '+sv+'/'+tot+' (opcional)':'');if(near28(bp,-40,-770,50))go28(9)}
 else if(ph===9){const bb=L28.bb;if(L28.st===1){const st=tw28(bb,new T.Vector3(0,0,-bb.len/2/(bb.sc||1)));L9.obj=[st.x,st.z];L28.ot='SEGUNDO ATAQUE · Torpedeá la popa del Tianlong (timón y hélices) · torpedos '+B28.torp;
   if(bb.lastHit&&bb.lastHit.t>L28.t9&&['timon','propulsion','popa'].includes(bb.lastHit.sec)&&once28('gnd')){L28.st=2;setPh28(9.5);cineGround28()}else if(bb.lastHit&&bb.lastHit.t>L28.t9&&once28('miss'))talk([['Keller','¡Le dimos, pero sigue gobernando! ¡Necesitamos la popa!',2.4]]);if(L28.st===1)reserve28()}}
 else if(ph===10){const pl=L28.p10||[],k=pl.filter(a=>a.st==='down'||a.st==='gone'||a.st==='flee').length;L28.ot='ÚLTIMA DEFENSA ANTIAÉREA · aviones '+k+'/'+pl.length+(B28.fires.length?' · ¡INCENDIO A BORDO! (USAR)':'');if(k>=pl.length&&once28('ok')){radio28('Falk','¡Se van! ¡Se van, malditos! … Brandt, rumbo a casa.',2.6);later28(3,()=>{if(L28.ph===10)go28(11)})}}
 else if(ph===11){if(Math.hypot(bp.x-X15-A.wolf.x,bp.z-A.wolf.z)<26&&Math.abs(B28.v)<6&&once28('end')){setPh28(12);cineEnd28()}}
 /* sirena de la base */if(L28.siren){L28.sT=(L28.sT||0)-dt;if(L28.sT<=0){L28.sT=2.4;tn18('sine',380,620,1.15,.05);tn18('sine',620,380,1.15,.05,1.2)}}}
function reserve28(){if(B28.torp>0||B28.tubeRdy[0]||B28.tubeRdy[1]){L28.rsv=0;return}L28.rsv=(L28.rsv||0)+V16.dt;if(L28.rsv>12){L28.rsv=0;B28.torp=1;B28.tubeRdy[0]=1;const t=(B28.u.tubes||[])[0];if(t&&t.torp)t.torp.visible=true;talk([['Keller','¡Torpedo de reserva cargado en babor! ¡Es el último que nos queda!',2.6]])}}
function collide28(a,b){const p=a.g.position.clone().lerp(b.g.position,.5);bx12(p.x,WY15+3,p.z,1.8);splash28(p.x,p.z,3);shake=Math.max(shake,1.6);nz18(0,2.5,'lowpass',260,60,.3);tn18('sawtooth',80,30,2,.15);feed('★ ¡COLISIÓN! '+a.name+' embiste al '+b.o.name);
 a.scripted=false;sink28(a,'x');shipDmg28(b,b.hp+1,'p','casco');L28.debris=[];for(let i=0;i<22;i++){const g=mkDebris15(['crate','barrel','plank','raft'][i%4]);g.position.set(p.x+(R()-.5)*60,WY15,p.z+(R()-.5)*60);g.rotation.y=R()*6;scene.add(g);L28.debris.push({g})}
 for(let i=0;i<3;i++)swimmer28(p.x-X15+(R()-.5)*30,p.z+(R()-.5)*30);radio28('Vigía','¡Hombres al agua! ¡Restos por todo el canal!',2.4)}
function debrisUpd28(dt){for(const d of L28.debris||[]){const p=d.g.position;p.y=WY15+wv28(p.x,p.z)*.8;d.g.rotation.z=Math.sin(time+p.x)*.08;if(d.v){p.addScaledVector(d.v,dt);d.v.multiplyScalar(1-dt*.8)}}}
/* =====================================================================
   INTEGRACIÓN: bucle, controles (PC y táctil), arranque, menú y resultados
   ===================================================================== */
function fx28(dt,cine){if(L13.tq.length){for(const q of L13.tq)q.t-=dt;const due=L13.tq.filter(q=>q.t<=0);L13.tq=L13.tq.filter(q=>q.t>0);for(const q of due)q.f()}
 skyMesh.position.copy(cam.position);if(cine){updParts(dt);updRag(dt)}smokeUpd(dt);tracerUpd(dt);fireUpd(dt);lightsUpd(dt);fbUpd12(dt);if(L9.tick)L9.tick(dt);else npcUpd11(dt);if(!cine)dlgUpd(dt);
 for(const s of[...L28.ships])shipUpd28(s,dt);if(!L9.tick&&B28.g&&(L28.onBoat||!B28.moored))wolfUpd28(dt);else if(B28.g&&B28.moored&&!L9.tick){const p=B28.g.position;p.y=WY15+wv28(p.x,p.z)*.5;B28.g.rotation.z=Math.sin(time*.8)*.02;B28.g.updateMatrixWorld(true);B28.inv.copy(B28.g.matrixWorld).invert()}
 if(L28.onBoat||L9.cine)crewPose28();shellUpd28(dt);torpUpd28(dt);planeUpd28(dt);bombUpd28(dt);foamUpd28(dt);swimUpd28(dt);debrisUpd28(dt);wxUpd28(dt);sigUpd28(dt);if(L28.fx)L28.fx=L28.fx.filter(f=>f(dt));
 /* bote a la deriva: náufragos con chaleco salvavidas */if(L28.falk&&L28.falk.onLand)L28.falk.g.visible=true}
function updT28(dt){fx28(dt,false);if(L28.onBoat){stnAim28(dt);const tl=L28.tline;tl.visible=L28.stn==='torp'&&!L9.cine;if(tl.visible){const tu=(B28.u.tubes||[])[B28.tubeSel];const o=new T.Vector3();if(tu)tu.mouth.getWorldPosition(o);else o.copy(B28.g.position);tl.position.set(o.x,WY15+.3,o.z);tl.rotation.y=B28.hd+B28.gyro+(tu?(tu.side||0)*.06:0)}
  $('ammo').textContent=STNN28[L28.stn]+' · ARM/1-5 cambia de puesto';workUpd28(dt)}
 else{stealth13(dt);compUpd13(dt,L13.sq);workUpd28(dt);const w=P.weapons[P.cur],nm={revolver:'PISTOLA DE SERVICIO M.19',rifle:'FUSIL NAVAL M.22'}[P.cur];if(nm&&w)$('ammo').textContent=nm+(P.rel>0?' · RECARGANDO':' · '+w.mag+' / '+w.reserve)+(L28.carry?' · 📦 CAJA DE PROYECTILES':'')}
 upd28(dt);if(L28.ot&&!L9.cine)$('obj').textContent=L28.ot;const el=$('gar'),S=(L13.sq||[]).filter(n=>n.on&&n.lv===15);if(!L28.onBoat&&S.length&&!L9.cine){el.style.display='block';el.innerHTML='CON VOS <b>'+S.length+'</b>: '+S.map(n=>n.name.split(' ').pop()).join(' · ')}else el.style.display='none';hud28(dt);ambUpd(dt,.9)}
function startLevel15(){level=15;build28();clearStage();WC.x=X15;WC.z=-400;WC.r=1100;mobs.forEach(m=>scene.remove(m.g));mobs=[];convoy.forEach(v=>scene.remove(v.g));convoy=[];npcs.forEach(n=>scene.remove(n.g));npcs=[];lightsInit();for(const p of LT.pts)p.on=false;searchSet(false);
 for(const s of GAR)scene.remove(s.g);GAR.length=0;for(const c of CAV)if(c.g)scene.remove(c.g);CAV.length=0;CAVS.st='off';L9.tgts=[];L9.def=false;L9.obj=null;L9.cine=0;if(L10.eis)eisOff();if(L12.skin)leave12();if(L13.on)leave13();if(L14.on)leave14();
 allies.forEach(a=>{if(a.name)a.g.visible=false});if(officer)officer.g.visible=false;if(MED)MED.g.visible=false;vmInit13();fbInit12();
 if(!L28.w0)L28.w0=JSON.parse(JSON.stringify(P.weapons));refill(3);Object.assign(P.weapons.revolver,{mag:8,max:8,reserve:40,cd:.24,dmg:30,reload:1.7,fov:4});Object.assign(P.weapons.rifle,{mag:5,max:5,reserve:45,dmg:42});P.cur='revolver';P.grenades=2;L28.arm=['revolver','rifle'];
 L28.fpv0=fpv;fpv=true;cam.far=1500;cam.updateProjectionMatrix();sky9('manana');scene.fog.color.setHex(0x9aa6b0);scene.fog.near=30;scene.fog.far=600;L9.fog=null;hemi.intensity=1.05;
 $('tc').style.display='block';playing=true;ambStart();L28.on=true;$('fade12').style.opacity=0;const cp=+(($('cp15')||{}).value||0);
 if(cp===0){setPh28(0);cineIntro28()}else go28(cp,true)}
function leave28(){L28.on=false;engStop28();if(L28.w0)for(const k in L28.w0)Object.assign(P.weapons[k],L28.w0[k]);if(L28.fpv0!==undefined)fpv=L28.fpv0;$('nv28').style.display='none';$('ars28').style.display='none';cam.far=500;cam.updateProjectionMatrix()}
AMBL[15]=['wind','wind','bell','wind','arty'];
{const _au=allyUpdate;allyUpdate=function(dt){if(level===15){for(const a of allies)if(a.name)a.g.visible=false;if(officer)officer.g.visible=false;return}return _au(dt)}}
{const _mu=medUpd;medUpd=function(dt){if(level===15){if(MED)MED.g.visible=false;return}return _mu(dt)}}
{const _ai=aiTick20;aiTick20=function(dt){if(level===15)return;return _ai(dt)}}
{const _hp=hitP;hitP=function(d){if(level===15){if(L28.onBoat)return;VM13.hit=1;d*=.8}_hp(d)}}
{const _sw=swap;swap=function(){if(level===15&&playing){if(L9.cine)return;if(L28.onBoat){setStn28(STN28[(STN28.indexOf(L28.stn)+1)%STN28.length]);return}if(VM13.seq)return;const A=L28.arm;P.cur=A[(A.indexOf(P.cur)+1)%A.length];P.rel=0;P.reloading=null;VM13.lift=0;return}_sw()}}
{const _fi=fire;fire=function(){if(level===15&&playing){if(L9.cine)return;if(L28.onBoat)return wolfFire28_();if(!L28.arm.includes(P.cur))P.cur=L28.arm[0];const n=bullets.length;_fi();if(bullets.length>n){VM13.k=1;VM13.sl=1;vmShell13()}return}return _fi()}}
{const _rl=reload;reload=function(){if(level===15&&playing){if(L28.onBoat){if(L28.stn==='torp'){B28.tubeSel=1-B28.tubeSel;say('Tubo seleccionado: '+(B28.tubeSel?'ESTRIBOR':'BABOR'),1.2)}else if(L28.stn==='flak')say('Cargadores de Flak: '+B28.flak,1);return}const w=P.weapons[P.cur];if(w&&w.mag>=w.max&&!(P.rel>0)){VM13.ins=2.4;return}}return _rl()}}
{const _in=interact;interact=function(){if(level===15&&playing&&!L9.cine){if(L28.onBoat){boatUse28();return}if(L28.work){L28.work=null;return}const pp=P.g.position;for(const c of works28())if(Math.hypot(pp.x-X15-c.x,pp.z-c.z)<c.r){L28.work=Object.assign({},c,{t:0,x:X15+c.x});return}return}return _in()}}
{const _tg=throwG;throwG=function(){if(level===15&&L28.onBoat){if(L28.flT&&time-L28.flT<15){say('La próxima bengala estará lista en '+Math.ceil(15-(time-L28.flT))+' s',1.2);return}L28.flT=time;flare28();return}_tg()}}
{const _ol=orderLt;orderLt=function(){if(level===15){if(L28.onBoat)order28();else say('Las órdenes navales se dan desde el Wolfszahn.',1.4);return}_ol()}}
addEventListener('keydown',e=>{if(level!==15||!playing||!L28.onBoat||L9.cine)return;const m={Digit1:'helm',Digit2:'bow',Digit3:'flak',Digit4:'torp',Digit5:'eng'}[e.code];if(m)setStn28(m)});
{const _rp=respawnP;respawnP=function(){_rp();if(level!==15)return;P.pr=false;P.cover=null;L28.work=null;go28(L28.cpPh,true);say('Punto de control.',1.6)}}
{const _en=end;end=function(w){if(level===15&&w){_en(w);playing=false;engStop28();$('fade12').style.opacity=0;$('gar').style.display='none';$('nv28').style.display='none';$('ars28').style.display='none';$('menu').querySelector('h1').textContent='EL FIORDO DE LOS CONDENADOS';
  const K=L28.kills;$('tx').innerHTML='<b style="font-size:19px;color:#e0b050">FIN DE MISIÓN · KALTFJORD SIGUE EN PIE</b><br><br>• Acorazado ZH-01 «Tianlong»: <b>inmovilizado</b> en la angostura ('+(L28.bb.torpHits||0)+' impactos de torpedo)<br>• Patrulleras hundidas: <b>'+(K.pat||0)+'</b> · destructores: <b>'+(K.des||0)+'</b> · barcazas: <b>'+(K.lc||0)+'</b><br>• Hidroaviones derribados: <b>'+(K.air||0)+'</b>'+(K.flee?' · ahuyentados: <b>'+K.flee+'</b>':'')+'<br>• Náufragos rescatados: <b>'+L28.res+'</b><br>• B-17 «Wolfszahn»: casco al <b>'+Math.round(B28.comp.casco)+'%</b><br><br><i>«No dejó de ser un acorazado. Pero hoy no llegó a donde quería.»</i><br><br><b style="font-size:20px;color:#e0b050">PUNTUACIÓN: '+score+'</b>';try{localStorage.setItem('fiordo28','1')}catch(e){}if(window.codShow)codShow('cpM');return}
 const r=_en(w);if(level===14&&w){try{$('lvsel').value='15';$('lvsel').dispatchEvent(new Event('change'))}catch(e){}}return r}}
{const _up=update;update=function(dt){if(level===15&&L9.cine&&playing){V16.dt=dt;time+=dt;cine9Upd(dt);fx28(dt,true);vmUpd13(dt);hud28(dt);try{mm27(dt)}catch(e){}return}
 if(level!==15&&L28.on)leave28();_up(dt);if(!playing||level!==15)return;{const p=P.g.position;if(!isFinite(p.x)||!isFinite(p.z)){p.set(X15+ENV15.anch.falk.x,0,ENV15.anch.falk.z);P.vy=0}}if(!fpv)fpv=true;updT28(dt);if(L28.onBoat&&B28.g)boardPin28();else cam.position.y+=P.g.position.y;vmUpd13(dt)}}
/* ---------- menú: misión XIV y puntos de control ---------- */
{const done=(()=>{try{return localStorage.getItem('fiordo28')==='1'}catch(e){return false}})();$('lvsel').insertAdjacentHTML('beforeend','<option value="15">XIV · EL FIORDO DE LOS CONDENADOS — Misión naval '+(done?'✔ completada':'(nuevo)')+'</option>');
 const S='background:#302417;color:#f3e6c4;padding:10px;border:1px solid #a77b35';$('lvsel').parentElement.insertAdjacentHTML('afterend','<label id="cp15l">PUNTO DE CONTROL <select id="cp15" style="'+S+'"><option value="0">Rutina en Kaltfjord (misión completa)</option><option value="3">Defensa del puerto</option><option value="4">Combate contra escoltas</option><option value="5">Ataque aéreo</option><option value="7">Primer lanzamiento de torpedos</option><option value="8">Caos naval en el canal</option><option value="9">Segundo ataque: el último torpedo</option><option value="10">Última defensa antiaérea</option></select></label>');const sx=()=>{$('cp15l').style.display=$('lvsel').value==='15'?'':'none'};$('lvsel').addEventListener('change',sx);sx();const cm=$('cmCP');if(cm)cm.appendChild($('cp15l'))}
try{if(sessionStorage.getItem('sel15')){const v=sessionStorage.getItem('sel15');sessionStorage.removeItem('sel15');$('lvsel').value='15';$('cp15').value=v;$('lvsel').dispatchEvent(new Event('change'))}}catch(e){}
{const _g=$('go').onclick;$('go').onclick=function(){if($('lvsel').value!=='15')return _g.apply(this,arguments);if(L28.built){try{sessionStorage.setItem('sel15',$('cp15').value)}catch(e){}location.reload();return}V20.ps2=$('ps2fog').value;difficulty=$('difficulty').value;try{ac=new(window.AudioContext||window.webkitAudioContext)();if(ac.state==='suspended')ac.resume();startMusic()}catch(e){}$('menu').style.display='none';P.g.visible=true;cam.fov=65;cam.updateProjectionMatrix();startLevel15();try{rend.domElement.requestPointerLock()}catch(e){}}}
/* ---------- selección de misión: tarjetas y desplazamiento táctil ---------- */
document.head.insertAdjacentHTML('beforeend',`<style>
#cod{overflow-y:auto;-webkit-overflow-scrolling:touch;touch-action:pan-y}
#cmList{max-height:min(56vh,520px)!important;overflow-y:auto;-webkit-overflow-scrolling:touch;overscroll-behavior:contain;touch-action:pan-y;padding-right:6px;scroll-behavior:smooth;
 -webkit-mask-image:linear-gradient(#000 85%,transparent);mask-image:linear-gradient(#000 85%,transparent)}
#cmList::-webkit-scrollbar{width:8px}#cmList::-webkit-scrollbar-thumb{background:#8a6a32;border-radius:4px}#cmList::-webkit-scrollbar-track{background:rgba(255,255,255,.05)}
#cmList button{margin:4px 0;padding:11px 12px!important;border:1px solid #3a2e1e!important;border-left:4px solid #6a5434!important;background:rgba(30,22,14,.55)!important;border-radius:2px;line-height:1.3;transition:background .15s,border-color .15s}
#cmList button.on{border-left-color:#e8c878!important;background:rgba(200,152,56,.22)!important}
#cmList .g{padding:8px 0 2px;border-bottom:1px solid #4a3a24}
#cmHint{font:11px Georgia,serif;letter-spacing:2px;color:#a88a4a;text-align:center;margin-top:4px}
@media (max-width:820px),(max-height:520px){#cod{flex-direction:column}#codL{width:100%!important;padding:10px 14px!important;display:block!important}#codL .t1{font-size:20px!important}#codL .t2{margin:2px 0 6px!important;font-size:10px}#codL .cb{display:inline-block!important;width:auto!important;font-size:13px;padding:6px 10px!important;margin:2px;border:1px solid #4a3a24!important}#codL .cb small{display:none!important}#codR{padding:8px!important;align-items:stretch!important}.cp{width:100%!important;box-sizing:border-box;padding:12px!important}#cmL{flex-direction:column}#cmList{max-height:44vh!important;flex:none!important}#cmB .bx{min-height:0!important}}
</style>`);
if(window.codShow){const _cs=codShow;window.codShow=function(p){_cs(p);if(innerWidth<=820||innerHeight<=520){const e=document.getElementById(p);if(e)setTimeout(()=>e.scrollIntoView({block:'start',behavior:'smooth'}),50)}};for(const b of document.querySelectorAll('#codL .cb'))if(b.dataset.p&&b.dataset.p!=='cont')b.onclick=()=>window.codShow(b.dataset.p)}
{const l=document.getElementById('cmList');if(l){const h=document.createElement('div');h.id='cmHint';h.textContent='▼ deslizá o usá la rueda para ver más misiones';l.after(h);l.addEventListener('scroll',()=>{h.style.opacity=l.scrollTop+l.clientHeight>=l.scrollHeight-4?0:1});
 for(const ev of['touchstart','touchmove'])l.addEventListener(ev,e=>e.stopPropagation(),{passive:true})}}
