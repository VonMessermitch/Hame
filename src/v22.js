/* =====================================================================
   v22 · HÚSARES ARGENTUM (espada + carabina), EMPUÑE CON IK DE MUÑECA,
   NAVEGACIÓN Y SEPARACIÓN DE TROPAS, TREN, EDIFICIOS, MURALLAS
   DEFENDIBLES, OBÚS CON DOTACIÓN Y FÍSICAS DE COLISIÓN
   ===================================================================== */
const V22={};const _q1=new T.Quaternion(),_q2=new T.Quaternion(),_q3=new T.Quaternion(),_v1=new T.Vector3(),_v2=new T.Vector3();
const QAIM=new T.Quaternion().setFromAxisAngle(new T.Vector3(1,0,0),-Math.PI/2);/* arma: cañón (−y local) hacia delante, parte superior (+z) hacia arriba */
/* ---------- EMPUÑE: postura de puntería resuelta numéricamente + muñeca con IK ---------- */
/* resuelto fuera de línea con búsqueda exhaustiva sobre el esqueleto mkSoldier (error mano derecha 1,4 cm; mano de apoyo 3 cm) */
const GRIP={R:[-.6,.88,-1.8],L:[-1.44,-1,-.2,.3],ok:true};
function solveGrip22(){if(GRIP.ok)return;const g=mkSoldier({scale:1});g.position.set(0,-50,0);g.rotation.y=0;scene.add(g);const u=g.userData,V=T.Vector3;
 const gun=mkGun('rifle');u.mR.add(gun);const sh=new V(),tg=new V();g.updateMatrixWorld(true);u.aR.getWorldPosition(sh);tg.set(sh.x+.2,sh.y-.06,sh.z+.34);/* empuñadura delante del hombro, a la altura del pecho */
 let best=null;for(let ax=-2;ax<=-.6;ax+=.06)for(let ay=-.4;ay<=.8;ay+=.06)for(let ex=-2;ex<=0;ex+=.08){u.aR.rotation.set(ax,ay,0);u.eR.rotation.x=ex;u.aR.updateMatrixWorld(true);u.mR.getWorldPosition(_v1);const e=_v1.distanceTo(tg);if(!best||e<best.e)best={e,ax,ay,ex}}
 u.aR.rotation.set(best.ax,best.ay,0);u.eR.rotation.x=best.ex;g.updateMatrixWorld(true);wristIK22(u,g,1);g.updateMatrixWorld(true);const hg=gun.localToWorld(new V(0,-.5,-.02));
 let bl=null;for(let lx=-2.4;lx<=-.4;lx+=.06)for(let ly=-1.4;ly<=.4;ly+=.06)for(let el=-2;el<=0;el+=.08){u.aL.rotation.set(lx,ly,0);u.eL.rotation.x=el;u.aL.updateMatrixWorld(true);u.mL.getWorldPosition(_v1);const e=_v1.distanceTo(hg);if(!bl||e<bl.e)bl={e,lx,ly,el}}
 GRIP.R=[best.ax,best.ay,best.ex];GRIP.L=[bl.lx,bl.ly,bl.el];GRIP.eR=best.e;GRIP.eL=bl.e;GRIP.ok=true;scene.remove(g)}
/* orienta la mano derecha para que el arma apunte al frente del personaje (w = mezcla 0…1) */
function wristIK22(u,g,w,pitchX){const m=u.mR;if(!m||!m.parent)return;m.parent.updateMatrixWorld(true);m.parent.getWorldQuaternion(_q1);g.getWorldQuaternion(_q2);if(pitchX){_q3.setFromAxisAngle(_v2.set(1,0,0),pitchX);_q2.multiply(_q3)}_q2.multiply(QAIM);_q1.invert().multiply(_q2);if(w>=1)m.quaternion.copy(_q1);else m.quaternion.slerp(_q1,w)}
function wristRest22(u,dt){const m=u.mR;if(!m)return;_q3.identity();m.quaternion.slerp(_q3,Math.min(1,dt*8));if(u.aL)u.aL.rotation.z*=Math.max(0,1-dt*8);for(const c of m.children)if(c.position.y)c.position.y*=Math.max(0,1-dt*8)}
function aimPose22(u,g,w,dt){if(!GRIP.ok)solveGrip22();const k=Math.min(1,dt*12)*w;u.aR.rotation.x+=(GRIP.R[0]-u.aR.rotation.x)*k;u.aR.rotation.y+=(GRIP.R[1]-u.aR.rotation.y)*k;u.eR.rotation.x+=(GRIP.R[2]-u.eR.rotation.x)*k;u.aL.rotation.x+=(GRIP.L[0]-u.aL.rotation.x)*k;u.aL.rotation.y+=(GRIP.L[1]-u.aL.rotation.y)*k;u.eL.rotation.x+=(GRIP.L[2]-u.eL.rotation.x)*k;u.aL.rotation.z+=(GRIP.L[3]-u.aL.rotation.z)*k;wristIK22(u,g,Math.min(1,w*1.2));for(const c of u.mR.children)if(c.visible)c.position.y=-.12*w}
/* vanguardia y guarnición: agarre a dos manos al apuntar, muñeca recta en reposo */
const _gp22=garPose;garPose=function(s,dt){_gp22(s,dt);const u=s.u;if(!u||s.down>0||s.up>0||s.melee>0||s.rel>0){if(u)wristRest22(u,dt);return}const aim=(s.aim>0||s.peek>0||s.tg)&&!(s.bolt>0);s.aw=(s.aw||0)+((aim?1:0)-(s.aw||0))*Math.min(1,dt*6);if(s.aw>.05)aimPose22(u,s.g,s.aw,dt);else wristRest22(u,dt)};
/* escuadra (aliados con nombre): misma corrección mientras apuntan */
const _au22=allyUpdate;allyUpdate=function(dt){_au22(dt);for(const a of allies){if(!a.name||!a.g.visible||a.down>0||a.up>0)continue;const u=a.g.userData;a.aw=(a.aw||0)+(((a.aim>0)?1:0)-(a.aw||0))*Math.min(1,dt*6);if(a.aw>.05)aimPose22(u,a.g,a.aw,dt);else wristRest22(u,dt)}};
/* ---------- FÍSICAS: separación entre personajes, elevación correcta, sin hundirse ---------- */
function sepList22(){const L=[];for(const s of GAR)if(s.alive&&s.g.visible)L.push(s.g.position);for(const a of allies)if(a.name&&a.g.visible)L.push(a.g.position);if(officer&&officer.g.visible)L.push(officer.g.position);if(MED&&MED.g.visible)L.push(MED.g.position);if(typeof NPC11!=='undefined'&&level===11)for(const n of NPC11)if(n.g.visible&&n.g.position.y<.3&&!n.path)L.push(n.g.position);return L}
function separate22(dt){const L=sepList22(),pp=P.g.position,n=L.length;for(let i=0;i<n;i++){const a=L[i];for(let j=i+1;j<n;j++){const b=L[j],dx=a.x-b.x,dz=a.z-b.z,d2=dx*dx+dz*dz;if(d2<.81&&d2>1e-6&&Math.abs(a.y-b.y)<1.2){const d=Math.sqrt(d2),push=(.9-d)*.5*Math.min(1,dt*10),nx=dx/d,nz=dz/d;a.x+=nx*push;a.z+=nz*push;b.x-=nx*push;b.z-=nz*push}}
  const dx=a.x-pp.x,dz=a.z-pp.z,d2=dx*dx+dz*dz;if(d2<.85&&d2>1e-6&&Math.abs(a.y-pp.y)<1.4){const d=Math.sqrt(d2),push=(.92-d)*Math.min(1,dt*12);a.x+=dx/d*push;a.z+=dz/d*push}}
 for(let i=0;i<CAV.length;i++){const a=CAV[i];if(!a.alive)continue;for(let j=i+1;j<CAV.length;j++){const b=CAV[j];if(!b.alive)continue;const p=a.g.position,q=b.g.position,dx=p.x-q.x,dz=p.z-q.z,d2=dx*dx+dz*dz;if(d2<4.4&&d2>1e-6){const d=Math.sqrt(d2),push=(2.1-d)*.5*Math.min(1,dt*8);p.x+=dx/d*push;p.z+=dz/d*push;q.x-=dx/d*push;q.z-=dz/d*push}}}}
/* las unidades elevadas (murallas, plataformas) no son expulsadas por el volumen sobre el que caminan */
const _rs22=resolve;resolve=function(p,r,py){if(py===undefined&&p.y>.6&&p!==P.g.position)return _rs22(p,r,p.y);return _rs22(p,r,py)};
/* ---------- NAVEGACIÓN DEL CAMPAMENTO: grafo de pasos + desatasco ---------- */
const NG11={nodes:null,adj:null};
function segClear22(ax,az,bx,bz,r){const L=Math.hypot(bx-ax,bz-az),n=Math.max(1,Math.ceil(L/1.2));for(let i=1;i<n;i++){const t=i/n;if(blockedAt(ax+(bx-ax)*t,az+(bz-az)*t,r))return false}return true}
function navGraph11(){if(NG11.nodes&&NG11.sig===NV.sig)return;navGrid();NG11.sig=NV.sig;const X=X11,P_=[[0,6],[0,-12],[-20,6],[20,6],[-20,-12],[20,-12],[-38,0],[-38,22],[-38,-30],[-10,32],[10,32],[-15,38],[-40,40],[36,8],[38,0],[38,-10],[28,-34],[0,-40],[-20,-40],[-46,-40],[-60,-40],[-30,-56],[4,-50],[20,-48],[34,-56],[50,-40],[70,-40],[90,-40],[110,-40],[60,-10],[90,-10],[132,-6],[132,8],[132,22],[110,22],[84,22],[70,12],[60,30],[60,46],[100,46],[140,30],[-70,-10],[-90,-24],[-100,-18],[-40,-80],[-20,-100],[-45,-140],[-60,-150],[-40,-160],[-20,-150],[0,-130],[20,-150],[38,-160],[38,-190],[20,-200],[60,-190],[38,-235],[38,-245],[5,-80],[40,-80],[60,-80],[-70,-60],[-64.5,-150],[-57.5,-150],[-50.5,-150],[-43.5,-150],[-36.5,-150],[-29.5,-150],[-22.5,-150],[-45,-158],[-30,-162],[-94,-24],[-80,-30],[-60,-80],[-30,-120],[0,-170],[70,-170],[70,-200]];
 NG11.nodes=P_.map(q=>[X+q[0],q[1]]).filter(q=>!blockedAt(q[0],q[1],.6));const N=NG11.nodes;NG11.adj=N.map(()=>[]);for(let i=0;i<N.length;i++)for(let j=i+1;j<N.length;j++){const d=Math.hypot(N[i][0]-N[j][0],N[i][1]-N[j][1]);if(d<70&&segClear22(N[i][0],N[i][1],N[j][0],N[j][1],.55)){NG11.adj[i].push([j,d]);NG11.adj[j].push([i,d])}}}
function nearNode11(x,z){let b=-1,bd=1e9;const N=NG11.nodes;for(let i=0;i<N.length;i++){const d=Math.hypot(N[i][0]-x,N[i][1]-z);if(d<bd&&segClear22(x,z,N[i][0],N[i][1],.5)){bd=d;b=i}}if(b<0)for(let i=0;i<N.length;i++){const d=Math.hypot(N[i][0]-x,N[i][1]-z);if(d<bd){bd=d;b=i}}return b}
function graphPath11(ax,az,bx,bz){navGraph11();const s=nearNode11(ax,az),t=nearNode11(bx,bz);if(s<0||t<0)return null;const N=NG11.nodes,dist=N.map(()=>1e9),prev=N.map(()=>-1),done=N.map(()=>false);dist[s]=0;
 for(;;){let u=-1,ud=1e9;for(let i=0;i<N.length;i++)if(!done[i]&&dist[i]<ud){ud=dist[i];u=i}if(u<0||u===t)break;done[u]=true;for(const [v,w] of NG11.adj[u])if(dist[u]+w<dist[v]){dist[v]=dist[u]+w;prev[v]=u}}
 if(dist[t]>=1e9)return null;const path=[];for(let v=t;v>=0;v=prev[v])path.unshift(N[v]);return path}
const _r22=route8;route8=function(a,tx,tz){if(level!==11)return _r22(a,tx,tz);const w=route11(a,tx,tz);const p=a.g.position,d=Math.hypot(tx-p.x,tz-p.z);if(d<4)return w;
 const G=a.gp11||(a.gp11={t:0,path:null,tx:0,tz:0,i:0});G.t-=V16.dt||.016;if(G.t<=0||Math.hypot(G.tx-tx,G.tz-tz)>3){G.t=2.5;G.tx=tx;G.tz=tz;G.path=segClear22(p.x,p.z,tx,tz,.5)?null:graphPath11(p.x,p.z,tx,tz);G.i=0}
 if(G.path){while(G.i<G.path.length&&Math.hypot(G.path[G.i][0]-p.x,G.path[G.i][1]-p.z)<2.2)G.i++;for(let k=G.path.length-1;k>G.i;k--){if(segClear22(p.x,p.z,G.path[k][0],G.path[k][1],.5)){G.i=k;break}}if(G.i<G.path.length){if(segClear22(p.x,p.z,tx,tz,.5)){G.path=null;return w}return G.path[G.i]}G.path=null}return w};
/* desatasco de los NPC del campamento (instructor, reclutas): retroceso lateral y nueva ruta */
const _nu22=npcUpd11;npcUpd11=function(dt){for(const n of NPC11){if(!n.tgt||n.lv!==level){n.stk=0;continue}const p=n.g.position;n.sk=(n.sk||0)+dt;if(n.sk>.8){const mv=Math.hypot(p.x-(n.lx||p.x),p.z-(n.lz||p.z));n.lx=p.x;n.lz=p.z;n.sk=0;if(mv<.35){n.stk=(n.stk||0)+1;if(n.gp11)n.gp11.t=0;if(n.stk>=3){const a=Math.atan2(n.tgt[0]-p.x,n.tgt[1]-p.z)+(R()<.5?1.6:-1.6);for(let k=0;k<6;k++){const nx=p.x+Math.sin(a)*1.5,nz=p.z+Math.cos(a)*1.5;if(!blockedAt(nx,nz,.45)){p.x=nx;p.z=nz;break}}n.stk=0}}else n.stk=0}}_nu22(dt)};
/* =====================================================================
   HÚSARES ARGENTUM: kolpak, pelliza, cordones; espada + carabina Mauser
   ===================================================================== */
let KARG=null;function mkKar22(){if(!KARG){const q=PB(),wd=0x5a3820,st=0x26292c,dk=0x111111;pCyl(q,.02,.02,.78,st,0,-.55,0,0,0,0,6);pBox(q,.07,.48,.065,wd,0,-.32,-.02);pBox(q,.055,.3,.03,0x6e4a2a,0,-.38,.04);pBox(q,.08,.03,.085,0x8a8a80,0,-.5,0);pBox(q,.03,.05,.04,st,0,-.93,.035);
 pBox(q,.08,.3,.1,st,0,.05,0);pBox(q,.03,.06,.03,st,0,0,.065);pCyl(q,.015,.015,.11,st,.065,.15,.02,0,0,1.5708,6);pa(q,gSph(.024,6,5),st,.12,.11,.02);pBox(q,.065,.12,.09,0x2a2c2e,0,-.03,-.1);pBox(q,.02,.09,.05,st,0,.17,-.08);
 pBox(q,.07,.14,.09,wd,0,.27,-.06,.35);pBox(q,.072,.3,.12,wd,0,.43,-.04);pBox(q,.075,.15,.14,wd,0,.62,-.05);pBox(q,.08,.04,.15,dk,0,.71,-.05);pBox(q,.012,.75,.012,0x4a3018,.042,.1,-.06);KARG=pbGeo(q)}return new T.Mesh(KARG,VCM)}
function hussarize22(c){if(c.h22||c.lance)return;c.h22=1;const u=c.ru;
 /* kolpak de piel con bolsa roja y penacho blanco; pelliza con piel; cordones dorados; sabretache */
 {const q=PB();pCyl(q,.25,.23,.34,0x16120e,0,.47,-.01,0,0,0,12);pBox(q,.1,.3,.06,0xa02424,.18,.5,-.06,0,0,-.4);pCyl(q,.05,.07,.3,0xf0ece0,.12,.82,.06,0,0,-.15,8);pBox(q,.06,.05,.02,0xd8b850,0,.48,.235);pbMesh(q,u.hd,SABM)}
 {const q=PB();pBox(q,.42,.7,.16,0x2a3a6a,.22,.36,-.2,0,0,.15);pBox(q,.46,.1,.18,0x5a4a3a,.22,.72,-.2,0,0,.15);pBox(q,.1,.7,.18,0x5a4a3a,.43,.36,-.2,0,0,.15);for(let i=0;i<6;i++)pBox(q,.42,.025,.02,0xd8b850,0,.2+i*.09,.2);for(const s of[-1,1])pCyl(q,.02,.02,.02,0xd8b850,s*.22,.22+0*.1,.21,1.5708,0,0,6);pbMesh(q,u.ch,SABM)}
 {const q=PB();pBox(q,.22,.28,.04,0xa02424,.3,-.32,.1,0,0,.1);pBox(q,.12,.12,.045,0xd8b850,.3,-.3,.12);pBox(q,.03,.36,.03,0x1a1a1a,.3,-.1,.12);pbMesh(q,u.b,SABM)}
 /* vaina de la espada (cadera izquierda) y empuñadura envainada; carabina colgada a la espalda */
 const sv=new T.Group();sv.position.set(.3,0,0);sv.rotation.set(.5,0,.15);u.b.add(sv);{const q=PB();pBox(q,.05,.95,.03,0x2a2a2e,0,-.45,0);pBox(q,.06,.06,.04,0xb0b4b8,0,-.93,0);pBox(q,.06,.05,.04,0xb0b4b8,0,0,0);pbMesh(q,sv,SABM)}
 c.hilt=new T.Group();sv.add(c.hilt);{const q=PB();pBox(q,.035,.16,.045,0x1a1208,0,.1,0);pa(q,gTor(.06,.01,4,8,3.1),0xc9a23a,0,.14,.03,0,1.57,0);pbMesh(q,c.hilt,SABM)}
 c.carS=mkKar22();c.carS.position.set(.05,.4,-.27);c.carS.rotation.set(0,0,2.55);u.ch.add(c.carS);
 c.sabH=u.mR.children.find(o=>o.isMesh)||null;c.carH=mkKar22();c.carH.visible=false;u.mR.add(c.carH);
 c.wpn='sab';c.want='sab';c.swT=0;c.mag=5;c.ccd=1+R()*2;c.rel=0;c.mcd=0;c.ft=0;c.cb=c.i!==0;c.hilt.visible=false}
const _mc22=mkCav9;mkCav9=function(i,x,z){const c=_mc22(i,x,z);hussarize22(c);return c};
function hussarAI22(dt){for(const c of CAV){if(!c.alive||c.lance||!c.h22)continue;const u=c.ru,p=c.g.position;c.ft-=dt;
  if(c.ft<=0){c.ft=.3;let tg=null,td=70;for(const e of enemies){if(!e.active&&e.active!==undefined&&!e.unaware)continue;const d=Math.hypot(e.g.position.x-p.x,e.g.position.z-p.z);if(d<td){td=d;tg=e}}c.tg=tg;c.td=td}
  const chg=CAVS.st==='charge'||c.st==='charge',d=c.tg?c.td:99;
  if(chg||d<8||!c.cb)c.want='sab';else if(d>12&&d<62)c.want='car';
  /* transición: guardar el arma actual y desenfundar la otra (0,8 s) */
  if(c.want!==c.wpn&&c.swT<=0)c.swT=.8;if(c.swT>0){const prev=c.swT;c.swT-=dt;if(prev>.4&&c.swT<=.4){c.wpn=c.want;tn18('square',900,700,.05,.02)}}
  const toCar=c.wpn==='car',q=c.swT>0?Math.sin((1-c.swT/.8)*Math.PI):0;
  if(c.sabH)c.sabH.visible=!toCar;c.carH.visible=toCar;c.carS.visible=!toCar&&c.cb;c.hilt.visible=toCar;
  if(c.swT>0){const toBack=(c.wpn==='car'&&c.swT>.4)||(c.wpn==='sab'&&c.swT<=.4&&c.want==='car');/* mano hacia la vaina o hacia la espalda */
   if(c.want==='car'?c.swT>.4:c.swT<=.4){u.aR.rotation.x+=(-.4-u.aR.rotation.x)*q;u.aR.rotation.y+=(-.9-u.aR.rotation.y)*q;u.eR.rotation.x+=(-1.3-u.eR.rotation.x)*q}else{u.aR.rotation.x+=(-2.7-u.aR.rotation.x)*q;u.aR.rotation.y+=(.3-u.aR.rotation.y)*q;u.eR.rotation.x+=(-1.9-u.eR.rotation.x)*q}continue}
  if(toCar){const tg=c.tg;c.rel=Math.max(0,c.rel-dt);c.bolt=Math.max(0,(c.bolt||0)-dt);c.kick=Math.max(0,(c.kick||0)-dt*6);
   if(tg&&d<62){const wa=Math.atan2(tg.g.position.x-p.x,tg.g.position.z-p.z);if(Math.hypot(c.vx,c.vz)<1.5)c.g.rotation.y=angL(c.g.rotation.y,wa,Math.min(1,dt*1.4));const want=wa-c.g.rotation.y,tw=Math.atan2(Math.sin(want),Math.cos(want));u.ch.rotation.y+=(clamp(tw,-1.25,1.25)-u.ch.rotation.y)*Math.min(1,dt*5);
    if(c.rel>0){u.aR.rotation.set(-.9,.2,0);u.eR.rotation.x=-1.2;u.aL.rotation.set(-1.2+Math.sin(c.t*9)*.15,-.6,0);u.eL.rotation.x=-1.4;wristRest22(u,dt)}
    else{aimPose22(u,u.ch,1,dt);if(c.bolt>0){const b=Math.sin((1-c.bolt/.55)*Math.PI);u.aR.rotation.x+=.3*b;u.eR.rotation.x-=.5*b}u.ch.rotation.x=-c.kick*.12;
     c.ccd-=dt;const mv=Math.hypot(c.vx,c.vz);if(c.ccd<=0&&Math.abs(tw)<1.3&&losClear(p.x,2.9,p.z,tg.g.position.x,1.3*tg.s,tg.g.position.z)){if(c.mag<=0){c.rel=2.4;c.mag=5;tn18('square',300,260,.08,.03)}else{c.mag--;c.ccd=1.7+R()*1.1;c.kick=1;c.bolt=.55;const o=new T.Vector3();c.carH.localToWorld(o.set(0,-.95,0));const t2=tg.g.position.clone();t2.y+=1.25*tg.s;const v=t2.sub(o).normalize(),spr=.025+mv*.006;v.x+=(R()-.5)*spr;v.y+=(R()-.5)*spr*.5;v.z+=(R()-.5)*spr;v.normalize().multiplyScalar(70);const m=new T.Mesh(bG,bM);m.position.copy(o);m.lookAt(o.clone().add(v));scene.add(m);bullets.push({m,v,life:1.1,dmg:36,by:{name:c.name+' (carabina Mauser)'},pen:1});burst(o.x,o.y,o.z,0xffdd88,2,.08,2);smoke(o.x,o.y,o.z,.4,.6,0xb0b0b0,.4,.3);npcShot('rifle',o.x,o.z)}}}}
   else{u.ch.rotation.y*=.9;u.aR.rotation.x+=(-.55-u.aR.rotation.x)*Math.min(1,dt*6);u.aR.rotation.y+=(.15-u.aR.rotation.y)*Math.min(1,dt*6);u.eR.rotation.x+=(-1.25-u.eR.rotation.x)*Math.min(1,dt*6);wristRest22(u,dt)}}
  else{u.ch.rotation.y*=.9;wristRest22(u,dt);c.mcd-=dt;const tg=c.tg;
   /* espada: guardia alta, tajo y parada contra quien se acerque */
   if(tg&&d<3.6&&!chg){const want=Math.atan2(tg.g.position.x-p.x,tg.g.position.z-p.z)-c.g.rotation.y;u.ch.rotation.y=clamp(Math.atan2(Math.sin(want),Math.cos(want)),-1.1,1.1);if(c.mcd<=0){c.mcd=.95+R()*.4;c.slash=.4;hurt(tg,62,'m',c);tg.stun=.4;burst(tg.g.position.x,1.3,tg.g.position.z,0xffcc66,5,.25,4);snd(240+R()*80,.1,'sawtooth',.04)}else if(c.slash<=0){u.aR.rotation.x=-2.3;u.aR.rotation.y=.55;u.eR.rotation.x=-.6}}
   else if(!chg&&c.slash<=0&&d<20){u.aR.rotation.x+=(-1.6-u.aR.rotation.x)*Math.min(1,dt*5);u.eR.rotation.x+=(-.9-u.eR.rotation.x)*Math.min(1,dt*5)}}}}
const _cu22=cavUpd;cavUpd=function(dt){_cu22(dt);hussarAI22(dt)};
/* el capitán conserva la Ruby; si el escuadrón está «formando» sin orden de carga, hostiga con carabinas en lugar de quedarse inmóvil */
/* =====================================================================
   TREN MILITAR: locomotora y vagones detallados, bielas animadas,
   holgura entre vagones al frenar y colisiones por vagón
   ===================================================================== */
function wheel22(q,x,y,z,r,col){pa(q,gTor(r,.06,5,16),col,x,y,z,0,1.5708,0);pCyl(q,r*.25,r*.25,.18,0x2a2a2a,x,y,z,0,0,1.5708,10);for(let k=0;k<8;k++){const a=k/8*6.283;pBox(q,.05,r*1.7,.04,col,x,y,z,a,0,0)}}
function mkTrain22(){const g=new T.Group(),K=0x23272a,KS=0x16191b,RD=0x7a1a1a,BR=0xb08a30,RU=0x5a3a24;const cars=[];
 {const q=PB();pBox(q,2.7,.42,10.6,0x2a2a2a,0,1,.5);for(const s of[-1,1]){pCyl(q,.2,.2,.5,0x3a3a3a,s*.9,1.05,6.05,1.5708,0,0,10);pCyl(q,.3,.3,.08,0x5a5a5a,s*.9,1.05,6.3,1.5708,0,0,12)}pBox(q,2.8,.5,.25,RD,0,1.05,5.85);pa(q,gCone(1,1.2,4),0x3a3a3a,0,.75,6.5,1.5708,0,.785);
  pCyl(q,1.08,1.08,6.2,K,0,2.35,1.4,1.5708,0,0,16);for(let i=0;i<5;i++)pCyl(q,1.11,1.11,.08,BR,0,2.35,-1.5+i*1.45,1.5708,0,0,16);pCyl(q,1.12,1.12,1.3,KS,0,2.35,4.4,1.5708,0,0,16);pCyl(q,.95,.95,.08,0x2a2e30,0,2.35,5.07,1.5708,0,0,16);pBox(q,.08,.08,.5,0x8a8a80,.5,2.35,5.1);pCyl(q,.08,.08,.06,BR,0,2.35,5.12,1.5708,0,0,8);
  pCyl(q,.32,.42,1.3,KS,0,3.9,4.3,0,0,0,10);pCyl(q,.55,.38,.32,KS,0,4.66,4.3,0,0,0,12);pCyl(q,.38,.38,.6,BR,0,3.6,1.6,0,0,0,12);pa(q,gSph(.38,10,6,0,1.5708),BR,0,3.9,1.6);pCyl(q,.3,.3,.4,K,0,3.55,3,0,0,0,10);pa(q,gSph(.3,8,5,0,1.5708),K,0,3.75,3);pCyl(q,.05,.04,.4,BR,.3,3.75,.6,0,0,0,6);
  pCyl(q,.22,.24,.18,0xffe8a0,0,3.45,5.15,1.5708,0,0,12);pBox(q,.5,.4,.3,K,0,3.45,4.95);for(const s of[-1,1]){pCyl(q,.03,.03,6,BR,s*.98,2.95,1.5,1.5708,0,0,5);pBox(q,.5,.05,7.4,0x2a2a2a,s*1.3,1.42,1.1);pCyl(q,.36,.36,1.2,K,s*1.18,1.15,3.9,1.5708,0,0,10);for(let i=0;i<24;i++)pBox(q,.03,.03,.03,0x4a4e50,s*1.08,2.35+(i%2)*.35,-1.6+i*.25)}
  pBox(q,2.8,2.9,2.8,K,0,2.9,-3.4);pBox(q,3.2,.16,3.3,KS,0,4.42,-3.4);for(const s of[-1,1]){pBox(q,.04,.9,.9,0x101418,s*1.41,3.2,-3.2);pBox(q,.06,1.0,.06,0x5a5e60,s*1.42,3.2,-2.72);pBox(q,.06,1.0,.06,0x5a5e60,s*1.42,3.2,-3.68);pBox(q,.06,.06,1.0,0x5a5e60,s*1.42,3.68,-3.2);pBox(q,.4,.08,.3,0x3a3a3a,s*1.25,.6,-4.6);pBox(q,.4,.08,.3,0x3a3a3a,s*1.25,1.0,-4.6);pCyl(q,.025,.025,1.8,BR,s*1.45,2.6,-4.75,0,0,0,5)}pBox(q,1.6,1.1,.05,0xff7020,0,2.1,-1.98,0,0,0,0);
  pBox(q,.9,.5,.03,0xd8c8a0,0,3.9,-1.98);pBox(q,1.2,.3,.6,RU,.6,4.55,-.5);pBox(q,.6,.06,1.6,0x3a2a1a,-.8,3.45,1.8);pbMesh(q,g,VCV)}
 /* ruedas motrices, bielas de acoplamiento y biela motriz animadas */
 const W=[],RODS=[];for(const s of[-1,1]){for(const z of[-2.2,-.4,1.4]){const w=new T.Group();w.position.set(s*1.16,.82,z);g.add(w);const q=PB();wheel22(q,0,0,0,.78,0x2a2a2a);pBox(q,.1,.32,.42,0x3a3a3a,0,-.42,0);pbMesh(q,w,VCV);W.push(w)}const fw=new T.Group();fw.position.set(s*1.16,.55,3.6);g.add(fw);{const q=PB();wheel22(q,0,0,0,.45,0x2a2a2a);pbMesh(q,fw,VCV)}W.push(fw);
  const rod=new T.Mesh(gBox(.06,.12,3.8),new T.MeshLambertMaterial({color:0x8a8a80}));rod.position.set(s*1.3,.82,-.4);g.add(rod);RODS.push({m:rod,s,ph:s>0?0:1.5708})}
 const ten=new T.Group();ten.position.z=-8.3;g.add(ten);{const q=PB();pBox(q,2.7,.35,5.2,0x2a2a2a,0,.95,0);pBox(q,2.6,1.8,5,K,0,2.05,0);pBox(q,2.62,.08,5.02,BR,0,2.95,0);pa(q,gSph(1.1,10,6,0,1.5708),0x0a0a0a,0,2.95,.9,0,0,0,1.1,.5,1.6);pCyl(q,.3,.3,.12,0x3a3a3a,0,3.05,-1.7,0,0,0,10);for(let i=0;i<5;i++)pBox(q,.08,.08,.02,0x5a5e60,1.3,1.4+i*.3,-2.52);for(const s of[-1,1])for(const z of[-1.6,0,1.6]){wheel22(q,s*1.15,.55,z,.5,0x2a2a2a)}for(let i=0;i<16;i++)pBox(q,.03,.03,.03,0x4a4e50,1.31,1.4+(i%4)*.4,-2+(i>>2)*1.2);pBox(q,.6,.5,.04,RU,-.8,1.7,2.51);pbMesh(q,ten,VCV)}cars.push({o:ten,L:5.2,z:-8.3});
 const wag=[];for(let i=0;i<4;i++){const w=new T.Group();w.position.z=-15-i*9.2;g.add(w);const q=PB(),C=[0x5a3a26,0x4a3420,0x5e4028,0x4e3222][i];pBox(q,2.7,.3,8.6,0x2a2a2a,0,1,0);pBox(q,2.8,2.7,8.4,C,0,2.45,0);for(let k=0;k<20;k++)for(const s of[-1,1])pBox(q,.02,2.6,.03,shade(C,.75),s*1.41,2.45,-4.1+k*.43);
  pa(q,gCyl(1.48,1.48,8.6,12),0x3a3a36,0,3.62,0,1.5708,0,0,1,1,.3);for(const s of[-1,1]){pBox(q,.05,2.2,2.6,shade(C,.85),s*1.44,2.3,0);pBox(q,.06,.08,2.9,0x3a3a3a,s*1.46,3.48,0);pBox(q,.06,.08,2.9,0x3a3a3a,s*1.46,1.18,0);for(const y of[1.6,3])pBox(q,.04,.05,2.5,0x2a2a2a,s*1.47,y,0,0,0,y===1.6?.75:-.75);pBox(q,.06,.2,.06,0x8a8a80,s*1.48,2.3,.9);pBox(q,.03,.4,.8,0xd8d0b8,s*1.44,3.15,-2.8,0,0,0,0)}
  for(const e of[-1,1]){for(const s of[-1,1]){pCyl(q,.16,.16,.4,0x3a3a3a,s*.85,1.1,e*4.45,1.5708,0,0,8);pCyl(q,.24,.24,.06,0x5a5a5a,s*.85,1.1,e*4.66,1.5708,0,0,10)}pBox(q,.15,.15,.4,0x3a3a3a,0,1.1,e*4.5)}pBox(q,.08,2.2,.08,0x3a3a3a,1.1,2.2,4.24);for(let k=0;k<6;k++)pBox(q,.4,.04,.04,0x3a3a3a,1.1,1.3+k*.35,4.26);pa(q,gTor(.25,.03,4,10),0x3a3a3a,-.8,3.4,4.3,0,0,0);
  for(const s of[-1,1])for(const z of[-2.8,2.8]){wheel22(q,s*1.15,.5,z,.48,0x2a2a2a);pBox(q,.15,.3,.4,0x3a3a3a,s*1.3,.55,z)}pBox(q,.7,.35,.02,RU,-.6,1.6,4.21,0,0,0,0);pbMesh(q,w,VCV);wag.push(w);cars.push({o:w,L:8.6,z:-15-i*9.2})}
 g.rotation.y=-1.5708;scene.add(g);cars.unshift({o:null,L:11,z:.5});const obs=cars.map(()=>({x:0,z:0,hw:1,hd:1.45,h:4.4}));obstB.push(...obs);
 return{g,W:wag,wheels:W,rods:RODS,cars,obs,lx:null,sl:wag.map(()=>0)}}
mkTrain11=function(){return mkTrain22()};
function trainUpd22(tr,dt){const g=tr.g;if(tr.lx===null)tr.lx=g.position.x;const dx=g.position.x-tr.lx,v=dx/Math.max(dt,1e-4);tr.lx=g.position.x;const dist=Math.abs(dx);
 for(const w of tr.wheels)w.rotation.x+=dist/.78*(dx<0?1:-1);for(const r of tr.rods){const a=tr.wheels[0].rotation.x+r.ph;r.m.position.y=.82+Math.sin(a)*.32;r.m.position.z=-.4+Math.cos(a)*.32}
 tr.v0=tr.v0===undefined?v:tr.v0;const acc=(v-tr.v0)/Math.max(dt,1e-4);tr.v0=v;tr.W.forEach((w,i)=>{tr.sl[i]+=(-acc*.004*(i+1)-tr.sl[i])*Math.min(1,dt*3);w.position.z=-15-i*9.2+clamp(tr.sl[i],-.25,.25)});if(Math.abs(acc)>2&&Math.abs(v)<4&&R()<dt*3)nz18(0,.15,'lowpass',300,120,.05);
 g.updateMatrixWorld(true);tr.cars.forEach((c,i)=>{const o=tr.obs[i];_v1.set(0,0,c.o?c.o.position.z:c.z);g.localToWorld(_v1);o.x=_v1.x;o.z=_v1.z;o.hw=c.L/2;o.hd=1.45})}
/* =====================================================================
   EDIFICIOS DEL CAMPAMENTO: ventanas con hueco, marco, cruceta, alféizar,
   contraventanas y cristal; puertas con marco, tablones, bisagras,
   tirador y escalón; barracón del este transitable con puerta animada
   ===================================================================== */
function win22(x,y,z,face,w,h){/* face: +1 = fachada +z, -1 = fachada −z */const fz=z+face*.02;box(w+.24,h+.24,.12,0x3a2818,x,y,fz,0,0);box(w,h,.14,0x0c1218,x,y,fz-face*.04,0,0x060a10);box(w-.1,h-.1,.04,0x7a9aaa,x,y,fz+face*.02,0,0x0a1418);box(.06,h,.16,0x3a2818,x,y,fz);box(w,.06,.16,0x3a2818,x,y,fz);box(w+.4,.1,.26,0x5a4630,x,y-h/2-.12,fz+face*.06);
 for(const s of[-1,1]){const sh=box(w/2,h+.05,.05,0x4a5a3a,x+s*(w/2+w/4+.1),y,fz+face*.12);sh.rotation.y=s*face*.35}}
function door22(x,z,face,w,h,col){const fz=z+face*.03;box(w+.3,h+.18,.16,0x2a1c10,x,h/2,fz);box(w,h,.1,col||0x4a3018,x,h/2,fz+face*.04,0,0,woodTex);for(let i=1;i<4;i++)box(.02,h,.11,0x2a1c10,x-w/2+i*w/4,h/2,fz+face*.05);box(w*.9,.08,.12,0x3a2818,x,h*.3,fz+face*.07,0,0);box(w*.9,.08,.12,0x3a2818,x,h*.75,fz+face*.07);for(const y of[h*.3,h*.75])box(.25,.06,.13,0x111111,x-w/2+.15,y,fz+face*.08);box(.05,.12,.06,0xb08a30,x+w/2-.18,h*.48,fz+face*.12);box(w+.6,.18,.6,0x6a6050,x,.09,fz+face*.35)}
bar11=function(x,z,w,d,col){const H=3.2,X=X11;const hollow=Math.abs(x-(X+32))<.1&&Math.abs(z-18)<.1;
 if(hollow){const t=.3;box(w,H,t,col||0xffffff,x,H/2,z-d/2,0,0,rt_(woodTex,w/4,1));box(w/2-.8,H,t,col||0xffffff,x-w/4-.4,H/2,z+d/2,0,0,rt_(woodTex,w/8,1));box(w/2-.8,H,t,col||0xffffff,x+w/4+.4,H/2,z+d/2,0,0,rt_(woodTex,w/8,1));box(1.6,H-2.4,t,col||0xffffff,x,H-.4,z+d/2,0,0,woodTex);for(const s of[-1,1])box(t,H,d,col||0xffffff,x+s*w/2,H/2,z,0,0,rt_(woodTex,d/4,1));
  obstB.push({x,z:z-d/2,hw:w/2,hd:t/2,h:H+1},{x:x-w/4-.4,z:z+d/2,hw:w/4-.4,hd:t/2,h:H+1},{x:x+w/4+.4,z:z+d/2,hw:w/4-.4,hd:t/2,h:H+1},{x:x-w/2,z,hw:t/2,hd:d/2,h:H+1},{x:x+w/2,z,hw:t/2,hd:d/2,h:H+1});
  box(w-.6,.05,d-.6,0x5a4630,x,.03,z,0,0,woodTex);for(let i=0;i<4;i++)for(const s of[-1,1]){const bx=x-w/2+2.5+i*4.4,bz=z+s*(d/2-1.2);box(1.9,.08,.9,0x6a4a2a,bx,.5,bz,0,0,woodTex);box(1.9,.08,.9,0x6a4a2a,bx,1.5,bz,0,0,woodTex);box(1.8,.1,.8,0x8a8a70,bx,.6,bz);for(const a of[-1,1])box(.08,1.7,.08,0x4a3018,bx+a*.9,.85,bz+.4);obstB.push({x:bx,z:bz,hw:.95,hd:.45,h:1.6})}cp(.35,.4,1,0x2a2a2a,x+w/2-1,0.5,z);cp(.08,.08,2.4,0x2a2a2a,x+w/2-1,2.2,z);box(1.6,.06,.9,0x6a4a2a,x-w/2+1.4,.8,z,0,0,woodTex);obstB.push({x:x+w/2-1,z,hw:.4,hd:.4,h:1})}
 else{box(w,H,d,col||0xffffff,x,H/2,z,0,0,rt_(woodTex,w/4,1));obstB.push({x,z,hw:w/2,hd:d/2,h:H+1})}
 for(const s of[-1,1]){const r=box(w+1,.2,d/2+1.2,0x3a3028,x,H+.9,z+s*(d/4+.25),0,0,woodTex);r.rotation.x=s*.42;for(let k=0;k<4;k++){const sh=box(w+1,.04,.05,0x2a2018,x,H+.62+k*.2,z+s*(d/2+.45-k*.48));sh.rotation.x=s*.42}}box(w+.2,1.8,.2,0x4a3a2a,x,H+.55,z);
 for(let i=0;i<Math.floor(w/4);i++)for(const s of[-1,1]){const wx=x-w/2+2+i*4;if(hollow&&s>0&&Math.abs(wx-x)<1.6)continue;win22(wx,1.95,z+s*d/2,s,1,.9)}if(!hollow)door22(x,z+d/2,1,1.3,2.25);
 cp(.35,.35,2,0x4a4a4a,x+w/2-1.5,H+1.6,z);cp(.45,.45,.2,0x2a2a2a,x+w/2-1.5,H+2.65,z);for(const s of[-1,1])box(.2,.4,d+.2,0x3a2a1a,x+s*(w/2+.05),.2,z)};
/* puertas animadas (bisagra), conmutables con USAR */
const DOORS22=[];
function leaf22(hx,hz,w,h,base){const pv=new T.Group();pv.position.set(hx,0,hz);pv.rotation.y=base;scene.add(pv);const q=PB();pBox(q,w,h,.1,0x6a4a2a,w/2,h/2,0);for(let i=1;i<4;i++)pBox(q,.02,h,.11,0x3a2818,i*w/4,h/2,0);pBox(q,w*.9,.08,.13,0x3a2818,w/2,h*.3,0);pBox(q,w*.9,.08,.13,0x3a2818,w/2,h*.75,0);for(const y of[h*.3,h*.75])pBox(q,.3,.06,.14,0x111111,.17,y,0);pBox(q,.05,.14,.16,0xb08a30,w-.15,h*.48,0);pbMesh(q,pv,VCV);return pv}
function mkDoor22(leaves,ob,name){const D={pvs:leaves.map(l=>({pv:leaf22(l[0],l[1],l[2],l[3],l[4]),base:l[4],dir:l[5]})),open:false,a:0,o:ob,x:leaves[0][0],z:leaves[0][1],name:name||'puerta'};if(ob&&obstB.indexOf(ob)<0)obstB.push(ob);DOORS22.push(D);return D}
function doorToggle22(D){D.open=!D.open;snd(D.open?180:140,.35,'sawtooth',.035);nz18(0,.3,'lowpass',400,200,.03);if(!D.o)return;const i=obstB.indexOf(D.o);if(D.open&&i>=0)obstB.splice(i,1);if(!D.open&&i<0)obstB.push(D.o)}
function doorsUpd22(dt){for(const D of DOORS22){const tg=D.open?1.45:0;D.a+=(tg-D.a)*Math.min(1,dt*3.5);for(const l of D.pvs)l.pv.rotation.y=l.base+D.a*l.dir}}
/* ---------- campamento: puertas animadas, marcos del cuartel, objetos empujables ---------- */
const PUSH22=[];
function pushable22(x,z,kind,lv){const g=new T.Group(),q=PB();if(kind==='b'){pCyl(q,.42,.42,1.1,[0x6b4a2a,0x7a3a2a,0x3a4a5a][R()*3|0],0,.55,0,0,0,0,10);for(const y of[.2,.9])pCyl(q,.44,.44,.06,0x2a2a2a,0,y,0,0,0,0,10)}else{pBox(q,.9,.8,.9,0x6a5a3a,0,.4,0);pBox(q,.92,.06,.92,0x4a3a2a,0,.8,0);pBox(q,.6,.2,.02,0xd8c060,0,.45,.46)}pbMesh(q,g,VCV);g.position.set(x,0,z);scene.add(g);PUSH22.push({g,r:kind==='b'?.45:.6,vx:0,vz:0,lv})}
function pushUpd22(dt){const pp=P.g.position;let A=null;for(const o of PUSH22){if(o.lv!==level)continue;const p=o.g.position;if(Math.abs(p.x-pp.x)>45||Math.abs(p.z-pp.z)>45)continue;if(!A){A=sepList22();A.push(pp)}
 for(const a of A){if(Math.abs(a.y-p.y)>1)continue;const dx=p.x-a.x,dz=p.z-a.z,d=Math.hypot(dx,dz),m=o.r+.42;if(d<m&&d>1e-4){const k=m-d;p.x+=dx/d*k*.8;p.z+=dz/d*k*.8;o.vx+=dx/d*k*5;o.vz+=dz/d*k*5}}
 const v=Math.hypot(o.vx,o.vz);if(v>.02){p.x+=o.vx*dt;p.z+=o.vz*dt;const f=Math.pow(.04,dt);o.vx*=f;o.vz*=f;const ox=p.x,oz=p.z;resolve(p,o.r);if(Math.abs(p.x-ox)>1e-3)o.vx*=-.3;if(Math.abs(p.z-oz)>1e-3)o.vz*=-.3;o.g.rotation.y+=v*dt*.6}}}
const _bo22=boom;boom=function(pos){_bo22(pos);for(const o of PUSH22){if(o.lv!==level)continue;const p=o.g.position,dx=p.x-pos.x,dz=p.z-pos.z,d=Math.hypot(dx,dz);if(d<8&&d>.01){o.vx+=dx/d*(8-d)*2.2;o.vz+=dz/d*(8-d)*2.2}}};
const _b1122=build11;build11=function(){const first=!L11.built;_b1122();if(!first)return;const X=X11;
 const C=DOOR11.course;C.m.visible=false;V22.course=mkDoor22([[X+124,-4,4,3.6,-1.5708,1],[X+124,4,4,3.6,1.5708,-1]],C.o,'portón del circuito');V22.course.cx=X+124;V22.course.cz=0;
 V22.bdoor=mkDoor22([[X+31.2,22.05,1.6,2.4,0,1]],{x:X+32,z:22,hw:.8,hd:.12,h:2.4},'puerta del barracón');V22.bdoor.cx=X+32;V22.bdoor.cz=22.6;
 sBegin();for(let i=0;i<6;i++)win22(X-7.5+i*3,3.5,-23.5,1,1.2,1.6);door22(X,-23.5,1,2,3);box(19,.3,1.2,0x4a3a2a,X,6.6,-22.9);scene.updateMatrixWorld(true);sEnd();
 for(const [x,z,k] of[[-6,14,'b'],[-5,15.2,'b'],[8,-8,'c'],[9.2,-8.2,'c'],[-26,-36,'b'],[-25,-37,'c'],[44,10,'b'],[45,11,'b'],[-14,-52,'c'],[60,-44,'b'],[100,44,'c'],[102,44,'b']])pushable22(X+x,z,k,11)};
const _w1122=works11;works11=function(){const W=_w1122().filter(w=>w.lbl!=='Abrir la puerta del barracón');const pp=P.g.position;
 for(const D of DOORS22){if(D.lv22!==undefined&&D.lv22!==level)continue;if(level!==11)continue;if(Math.hypot(pp.x-D.cx,pp.z-D.cz)<3.2)W.unshift({x:D.cx,z:D.cz,r:3.2,dur:.35,lbl:(D.open?'Cerrar ':'Abrir ')+D.name,fn:()=>{doorToggle22(D);if(D===V22.course)DOOR11.course.open=D.open}})}return W};
/* =====================================================================
   FORTALEZA DE LAS TRES CORONAS (cap. IX): escaleras, pasarela con
   parapeto, puestos de tiro, y guarnición que sube, ocupa y se releva
   ===================================================================== */
const WALL22={posts:[],stairs:[],built:false};
function stair22(x0,z0,dx,dz,n,hTop,wide){const S=[];for(let i=0;i<n;i++){const x=x0+dx*i,z=z0+dz*i,h=(i+1)*hTop/n,ax=Math.abs(dx)>Math.abs(dz);box(ax?Math.abs(dx)+.02:wide,h,ax?wide:Math.abs(dz)+.02,0xb8ab92,x,h/2,z,0,0,stoneTex);obstB.push({x,z,hw:ax?Math.abs(dx)/2:wide/2,hd:ax?wide/2:Math.abs(dz)/2,h,step:true});S.push([x,z,h])}return S}
function fortWalls22(){if(WALL22.built)return;WALL22.built=true;const X=X9,FZ=-480,H=6;sBegin();
 const st=[{id:0,steps:stair22(X-31,-482.3,.9,0,10,H,1.6),pre:[X-34,-486],bot:[X-32.2,-482.3],top:[X-22.6,-482.3],on:[X-22.4,-480],wall:'S',dir:'x'},
  {id:1,steps:stair22(X+31,-482.3,-.9,0,10,H,1.6),pre:[X+34,-486],bot:[X+32.2,-482.3],top:[X+22.6,-482.3],on:[X+22.4,-480],wall:'S',dir:'x'},
  {id:2,steps:stair22(X+47.7,-555,0,.9,10,H,1.6),pre:[X+44.5,-557],bot:[X+47.7,-556.4],top:[X+47.7,-546.9],on:[X+50,-546.4],wall:'E',dir:'z'},
  {id:3,steps:stair22(X-47.7,-555,0,.9,10,H,1.6),pre:[X-44.5,-557],bot:[X-47.7,-556.4],top:[X-47.7,-546.9],on:[X-50,-546.4],wall:'W',dir:'z'}];WALL22.stairs=st;
 for(const s of st)for(const [x,z,h] of s.steps.filter((q,i)=>i%2===0))box(s.dir==='x'?.06:1.7,.9,s.dir==='x'?1.7:.06,0x4a3018,s.dir==='x'?x:x-.85*Math.sign(x-X),h+.45,s.dir==='x'?z-.85:z);
 /* parapetos exteriores (frenan caídas y cubren a los tiradores agachados) */
 for(const [x0,x1] of[[X-49,X-6.6],[X+6.6,X+49]]){obstB.push({x:(x0+x1)/2,z:FZ+1.35,hw:(x1-x0)/2,hd:.15,h:H+1.15,y0:H});box(x1-x0,1.15,.3,0x9a8e76,(x0+x1)/2,H+.58,FZ+1.35,0,0,rt_(stoneTex,(x1-x0)/3,1))}
 for(const s of[-1,1]){obstB.push({x:X+s*51.35,z:-541,hw:.15,hd:15.5,h:H+1.15,y0:H});box(.3,1.15,31,0x9a8e76,X+s*51.35,H+.58,-541,0,0,rt_(stoneTex,10,1))}
 /* sacos, cajas de munición y teas en la pasarela */
 const P_=[];for(const x of[-46,-38,-30,-16,-10,10,16,30,38,46])P_.push({x:X+x,z:FZ+.2,f:0,wall:'S',st:x<0?0:1});for(const z of[-530,-540,-552]){P_.push({x:X+50.3,z,f:Math.PI/2,wall:'E',st:2});P_.push({x:X-50.3,z,f:-Math.PI/2,wall:'W',st:3})}
 for(const p of P_){if(p.wall==='S')box(1.6,.55,.5,0xd8ccb0,p.x,H+.28,FZ+.95,0,0,sackT);else box(.5,.55,1.6,0xd8ccb0,p.x+(p.wall==='E'?.95:-.95),H+.28,p.z,0,0,sackT);p.occ=null;p.y=H}
 for(const [x,z] of[[-42,FZ-.8],[42,FZ-.8],[-25,FZ-.8],[25,FZ-.8]]){box(.7,.45,.45,0x4a5a3a,X+x,H+.23,z);box(.72,.06,.47,0x2a3a2a,X+x,H+.46,z)}
 scene.updateMatrixWorld(true);sEnd();WALL22.posts=P_;
 for(const [x,z,k] of[[-36,-498,'b'],[-35,-499.2,'b'],[36,-530,'c'],[37,-531,'b'],[-10,-545,'c'],[12,-498,'b']])pushable22(X+x,z,k,9)}
const _b922=build9;build9=function(){const first=!L9.built;_b922();if(first)fortWalls22()};
function wallPath22(post){const s=WALL22.stairs[post.st];const P=[[s.pre[0],0,s.pre[1]],[s.bot[0],0,s.bot[1]],[s.top[0],6,s.top[1]],[s.on[0],6,s.on[1]]];if(s.wall==='S')P.push([post.x,6,-480]);else P.push([s.on[0],6,post.z]);P.push([post.x,6,post.z]);return P}
function sendToWall22(sol,post){if(post.occ&&post.occ!==sol)return false;if(sol.wpost)sol.wpost.occ=null;post.occ=sol;sol.wpost=post;const p=sol.g.position;
 if(sol.wy>5.5&&sol.wpost){const cur=[p.x,6,p.z];sol.wroute=[cur,post.wall==='S'?[post.x,6,-480]:[cur[0],6,post.z],[post.x,6,post.z]];sol.wi=0}else{sol.wroute=wallPath22(post);sol.wi=0;sol.wy=0}sol.wAt=false;return true}
function wallFree22(wall,near){let b=null,bd=1e9;for(const p of WALL22.posts){if(p.occ&&(!p.occ.alive||!p.occ.g.visible))p.occ=null;if(p.occ||(wall&&p.wall!==wall))continue;const d=near?Math.hypot(p.x-near.x,p.z-near.z):0;if(d<bd){bd=d;b=p}}return b}
const _e922=enter9;enter9=function(retry){_e922(retry);if(!WALL22.built)return;for(const p of WALL22.posts)p.occ=null;for(const s of GAR){s.wpost=null;s.wroute=null;s.wy=0;s.wAt=false}
 const R_=GAR.filter(s=>s.alive&&s.g.visible&&!s.retired&&s.kind!=='mg');R_.sort((a,b)=>Math.abs(a.g.position.z+480)-Math.abs(b.g.position.z+480));let n=0;for(const s of R_){if(n>=7)break;const pst=wallFree22(null,s.g.position);if(pst&&sendToWall22(s,pst))n++}
 if(n)say('Hollenstein: «¡Fusileros a las murallas! ¡Ocupad las almenas!»',3)};
/* movimiento por escaleras y pasarela; postura en el parapeto; relevo y refuerzo de sectores */
const _gu22=garUpd;garUpd=function(dt){const W=level===9&&WALL22.built;if(W)for(const s of GAR){if(!s.wroute||!s.alive)continue;const p=s.g.position;if(s.wi===0&&!s.wAt){const b=s.wroute[0];s.post={x:b[0],z:b[2],f:s.g.rotation.y,c:false,bk:false,fb:null,occ:s};if(Math.hypot(b[0]-p.x,b[2]-p.z)<1.3)s.wi=1}else s.post={x:p.x,z:p.z,f:s.wAt?s.wpost.f:s.g.rotation.y,c:!!s.wAt,bk:false,fb:null,occ:s}}
 _gu22(dt);if(!W)return;
 for(const s of GAR){if(!s.wroute)continue;if(!s.alive){if(s.wpost)s.wpost.occ=null;s.wroute=null;continue}const p=s.g.position;
  if(s.wi===0&&!s.wAt){s.wy=0}else if(!s.wAt&&!(s.down>0)){const w=s.wroute[Math.min(s.wi+1,s.wroute.length-1)],a=s.wroute[s.wi];if(s.wi>=s.wroute.length-1){s.wAt=true}else{const dx=w[0]-p.x,dz=w[2]-p.z,d=Math.hypot(dx,dz),sp=(s.wi===0?2.2:3)*dt;if(d<=sp){p.x=w[0];p.z=w[2];s.wi++}else{p.x+=dx/d*sp;p.z+=dz/d*sp;s.g.rotation.y=Math.atan2(dx,dz)}const seg=Math.hypot(w[0]-a[0],w[2]-a[2])||1,t=1-Math.min(1,d/seg);s.wy=a[1]+(w[1]-a[1])*t;s.vx=dx/(d||1)*3;s.vz=dz/(d||1)*3}}
  else if(s.wAt){const q=s.wpost;p.x+=(q.x-p.x)*Math.min(1,dt*6);p.z+=(q.z-p.z)*Math.min(1,dt*6);s.vx=s.vz=0}
  s.g.position.y=s.wy||0;
  /* la sección de muralla bajo sus pies ha volado: cae al patio */
  if(s.wy>5&&s.wi>=3&&R()<dt*2){let ok=false;for(const b of obstB)if(!b.y0&&b.h>=5.2&&Math.abs(p.x-b.x)<b.hw+.45&&Math.abs(p.z-b.z)<b.hd+.45){ok=true;break}if(!ok){s.wy=0;s.g.position.y=0;s.down=1.6;if(s.wpost)s.wpost.occ=null;s.wpost=null;s.wroute=null;garDamage(s,35,null,'blast');feed(s.name+' cae de la muralla derruida')}}}
 V22.wt=(V22.wt||0)-dt;if(V22.wt>0)return;V22.wt=3;const sec={S:[X9,-470],E:[X9+62,-540],W:[X9-62,-540]};
 for(const k in sec){let th=0;for(const e of enemies)if(e.active&&Math.hypot(e.g.position.x-sec[k][0],e.g.position.z-sec[k][1])<45)th++;const def=GAR.filter(s=>s.alive&&s.wpost&&s.wpost.wall===k).length;
  if(th>=3&&def<3){const pst=wallFree22(k,{x:sec[k][0],z:sec[k][1]});if(pst){let b=null,bd=1e9;for(const s of GAR){if(!s.alive||!s.g.visible||s.retired||s.wroute||s.kind==='mg')continue;const d=Math.hypot(s.g.position.x-pst.x,s.g.position.z-pst.z);if(d<bd){bd=d;b=s}}if(b&&sendToWall22(b,pst)&&R()<.5)say(b.name+': «¡Refuerzo el sector '+({S:'sur',E:'este',W:'oeste'})[k]+'!»',2)}}}
 for(const s of GAR){if(!s.alive||!s.wAt)continue;s.hh=s.hh===undefined?s.hp:s.hh;if(s.hh-s.hp>45){s.hh=s.hp;const pst=wallFree22(s.wpost.wall,s.g.position);if(pst&&pst!==s.wpost&&Math.hypot(pst.x-s.g.position.x,pst.z-s.g.position.z)>5){sendToWall22(s,pst);if(R()<.4)feed(s.name+': ¡cambio de almena!')}}else s.hh=Math.max(s.hp,s.hh-dt*2)}};
/* rutas de entrada y salida de la fortaleza por la puerta principal */
const _r922=route8;route8=function(a,tx,tz){if(level===9&&WALL22.built){const p=a.g.position,X=X9,inF=(x,z)=>Math.abs(x-X)<48.5&&z<-481.5&&z>-558.5;if(Math.abs(p.x-X)<75&&p.z>-600&&p.z<-440&&inF(tx,tz)!==inF(p.x,p.z)){const gin=inF(tx,tz);if(Math.abs(p.x-X)<4.5&&Math.abs(p.z+480)<5)return[X,gin?-487:-473];return[X+clamp(p.x-X,-2,2),gin?-475:-485]}}return _r922(a,tx,tz)};
/* puntería desde altura: la línea de visión parte de la posición real (no del suelo) */
const _lc22=losClear;losClear=function(ax,ay,az,bx,by,bz){if(level===9&&WALL22.built&&ay<2.2){for(const s of GAR)if(s.wy>5&&Math.abs(s.g.position.x-ax)<.05&&Math.abs(s.g.position.z-az)<.05){ay+=s.wy;break}}return _lc22(ax,ay,az,bx,by,bz)};
/* =====================================================================
   OBÚS DE ASEDIO ENEMIGO con dotación (artillero, cargador, auxiliar):
   puntería, carga, disparo con retroceso, proyectil visible en parábola
   ===================================================================== */
function mkObus22(){const g=new T.Group(),q=PB(),S=0x3a3e40,D=0x26292c,WD=0x4a3a28;
 for(const s of[-1,1]){pBox(q,.22,.3,3.6,S,s*.55,.45,-2,0,s*.18,0);pBox(q,.4,.12,.5,D,s*.95,.12,-3.7,0,s*.18,0);for(let i=0;i<8;i++)pBox(q,.04,.04,.04,0x5a5e60,s*(.55+.12),.62,-.6-i*.4)}
 pCyl(q,.09,.09,2.4,D,0,.95,0,0,0,1.5708,8);for(const s of[-1,1]){wheel22(q,s*1.15,.95,0,.9,WD);pa(q,gTor(.9,.05,5,18),0x2a2a2a,s*1.15,.95,0,0,1.5708,0)}
 pBox(q,2.2,1.3,.08,S,0,1.75,.65,-.12);pBox(q,.5,.12,.1,0x111111,.45,2.05,.7,-.12);for(let i=0;i<10;i++)pBox(q,.04,.04,.04,0x5a5e60,-1+i*.22,2.35,.6);pBox(q,.9,.5,1.2,S,0,1.25,-.2);pa(q,gTor(.75,.07,4,12,1.6),D,.55,1.3,-.2,0,1.5708,.4);pbMesh(q,g,VCV);
 const bar=new T.Group();bar.position.set(0,1.45,0);g.add(bar);const sl=new T.Group();bar.add(sl);{const b=PB();pCyl(b,.27,.33,2.6,0x45494c,0,0,.7,1.5708,0,0,14);pCyl(b,.36,.36,.25,D,0,0,2.0,1.5708,0,0,14);pCyl(b,.38,.38,.5,D,0,0,-.75,1.5708,0,0,14);pBox(b,.5,.5,.4,D,0,0,-1.15);pBox(b,.08,.25,.08,0x8a8a80,.28,.05,-1.3);for(const s of[-1,1])pCyl(b,.09,.09,1.6,0x5a5e60,s*.22,.32,.2,1.5708,0,0,8);for(let i=0;i<4;i++)pCyl(b,.34,.34,.04,0x2a2a2a,0,0,-.2+i*.5,1.5708,0,0,14);pbMesh(b,sl,VCV)}
 const cr=new T.Group();cr.position.set(2.4,0,-2.2);g.add(cr);{const c=PB();pBox(c,1,.5,.7,0x4a5a3a,0,.25,0);for(let i=0;i<4;i++){pCyl(c,.12,.12,.55,0xb08a30,-.33+i*.22,.78,0,0,0,0,8);pa(c,gCone(.12,.22,8),0x6a6a60,-.33+i*.22,1.16,0)}pbMesh(c,cr,VCV)}
 const muz=new T.Object3D();muz.position.set(0,0,2.15);sl.add(muz);g.userData.bar=bar;g.userData.sl=sl;g.userData.muz=muz;scene.add(g);return g}
mkBombard9=function(){return mkObus22()};
const SHELL22=[];
const _sm22=spawnMach;spawnMach=function(kind,x,z,tx,tz){const m=_sm22(kind,x,z,tx,tz);if(kind==='bombarda'){m.name='el obús de asedio';m.ob.r=2.6;m.cyc='aim';m.ct=2.5;m.crew=[];
  const pos=[[-.9,-2.1,'artillero'],[1.6,-1.6,'cargador'],[-1.4,.2,'auxiliar']];for(const [ox,oz,role] of pos){const e=sp9('mosin',x+ox,z+oz,true);if(!e)continue;e.crew22=m;e.role22=role;e.off22=[ox,oz];e.k8n='a un '+role+' de artillería';e.hold=[x+ox,0,z+oz];m.crew.push(e)}}return m};
function crewPos22(m,e){const g=m.g,c=Math.cos(g.rotation.y),s=Math.sin(g.rotation.y),o=e.off22;return[g.position.x+o[0]*c+o[1]*s,g.position.z-o[0]*s+o[1]*c]}
function obusTarget22(m){const p=m.g.position;let best=null,bs=1e9;const cand=[];cand.push({p:P.g.position,w:1});for(const s of GAR)if(s.alive&&s.g.visible)cand.push({p:s.g.position,w:s.wy>5?.6:1});for(const a of allies)if(a.name&&a.g.visible)cand.push({p:a.g.position,w:1.2});
 for(const c of cand){const d=Math.hypot(c.p.x-p.x,c.p.z-p.z);if(d<40||d>175)continue;const dx=(c.p.x-p.x)/d,dz=(c.p.z-p.z)/d;let blk=false;for(const k of[4,8,12])if(blockedAt(p.x+dx*k,p.z+dz*k,.4)){blk=true;break}if(blk)continue;const sc=d*c.w+R()*25;if(sc<bs){bs=sc;best={x:c.p.x,z:c.p.z,d}}}return best}
function obusUpd22(dt){for(const m of MACH){if(m.kind!=='bombarda')continue;m.cd=999;const u=m.g.userData;const crew=(m.crew||[]).filter(e=>enemies.indexOf(e)>=0);m.crew=crew;
  if(!m.alive){for(const e of crew){e.hold=null;e.crew22=null}continue}
  /* amenaza: aliados o jugador cerca, o dotación herida → abandonan el servicio y combaten; vuelven si se despeja */
  const p=m.g.position;let th=Math.hypot(P.g.position.x-p.x,P.g.position.z-p.z)<22;for(const s of GAR)if(s.alive&&Math.hypot(s.g.position.x-p.x,s.g.position.z-p.z)<20)th=true;for(const e of crew)if(e.hp<e.max*.98&&!e.hit22){e.hit22=1;th=true}
  if(th){m.calm=0;if(!m.alarm){m.alarm=1;for(const e of crew){e.hold=null;e.alert=0}if(crew.length)say('¡La dotación del obús abandona la pieza y combate!',2)}}else{m.calm=(m.calm||0)+dt;if(m.alarm&&m.calm>6){m.alarm=0;for(const e of crew)e.hit22=0}}
  if(m.alarm){u.sl.position.z*=.9;continue}
  for(const e of crew){const [cx,cz]=crewPos22(m,e);const h=e.hold||[e.g.position.x,0,e.g.position.z];const dx=cx-h[0],dz=cz-h[2],d=Math.hypot(dx,dz),st=Math.min(d,(m.arr?2.6:3.4)*dt);e.hold=[h[0]+(d>0?dx/d*st:0),0,h[2]+(d>0?dz/d*st:0)];e.g.rotation.y=Math.atan2(p.x-cx,p.z-cz);e.alert=Math.max(e.alert||0,.5)}
  if(!m.arr){for(const e of crew){const u2=e.g.userData;if(u2&&u2.aR){u2.aR.rotation.x=-1.3;u2.aL.rotation.x=-1.3;u2.b.rotation.x=.35}}continue}
  const n=crew.length;if(!n){if(!m.empty){m.empty=1;feed('★ El obús ha quedado sin dotación')}continue}m.empty=0;const slow=n>=3?1:n===2?1.4:2.2;
  m.ct-=dt;const tg=m.tg;
  if(m.cyc==='aim'){if(!tg||m.ct>2.3){m.tg=obusTarget22(m)}if(m.tg){const want=Math.atan2(m.tg.x-p.x,m.tg.z-p.z);m.g.rotation.y=angL(m.g.rotation.y,want,Math.min(1,dt*.5));const el=clamp(.22+m.tg.d/260,.25,.95);u.bar.rotation.x+=(-el-u.bar.rotation.x)*Math.min(1,dt*1.2)}crewPose22(m,'aim',dt);if(m.ct<=0&&m.tg){m.cyc='load';m.ct=2*slow}else if(m.ct<=0)m.ct=1.5}
  else if(m.cyc==='load'){crewPose22(m,'load',dt);if(m.ct<=0){m.cyc='ready';m.ct=.7;tn18('square',600,600,.1,.03)}}
  else if(m.cyc==='ready'){crewPose22(m,'ears',dt);if(m.ct<=0){obusFire22(m);m.cyc='rec';m.ct=1.4*slow}}
  else{crewPose22(m,'rec',dt);u.sl.position.z+=(0-u.sl.position.z)*Math.min(1,dt*2.2);if(m.ct<=0){m.cyc='aim';m.ct=2.4*slow}}}
 for(let i=SHELL22.length-1;i>=0;i--){const s=SHELL22[i];s.t+=dt;const k=Math.min(1,s.t/s.T);s.m.position.set(s.a.x+(s.b.x-s.a.x)*k,s.a.y+(s.b.y-s.a.y)*k+Math.sin(k*Math.PI)*s.h,s.a.z+(s.b.z-s.a.z)*k);s.m.rotation.x+=dt*4;if(R()<dt*20)smoke(s.m.position.x,s.m.position.y,s.m.position.z,.3,.4,0x8a8a80,.4,.25);if(k>=1){scene.remove(s.m);SHELL22.splice(i,1);boom9(s.b.x,s.b.z,1.25,true);if(typeof e8Blast==='function')e8Blast(s.b.x,s.b.z,7,55);crater9(s.b.x,s.b.z,2);if(Math.hypot(P.g.position.x-s.b.x,P.g.position.z-s.b.z)<6)hitP(28)}}}
function obusFire22(m){const u=m.g.userData,tg=m.tg;if(!tg)return;u.muz.getWorldPosition(_v1);burst(_v1.x,_v1.y,_v1.z,0xffcc66,24,.45,12);burst(_v1.x,_v1.y,_v1.z,0xff7a20,12,.3,8);smoke(_v1.x,_v1.y,_v1.z,6,4,0x9a9a90,1.6,.6);flashLight(_v1.x,_v1.y,_v1.z,9,.25,0xffb060);burst(m.g.position.x,.2,m.g.position.z,0x8a7a5a,18,.9,6);expSnd(m.g.position.x,m.g.position.z,1.3);
 u.sl.position.z=-.75;const d=Math.hypot(P.g.position.x-m.g.position.x,P.g.position.z-m.g.position.z);if(d<70)shake=Math.max(shake,1.2*(1-d/70));
 const sh=new T.Mesh(gCyl(.13,.13,.5,8),new T.MeshLambertMaterial({color:0x5a5a52}));scene.add(sh);const b=new T.Vector3(tg.x+(R()-.5)*7,.2,tg.z+(R()-.5)*7);SHELL22.push({m:sh,a:_v1.clone(),b,t:0,T:1.6+tg.d/90,h:12+tg.d*.14});m.tg=null}
function crewPose22(m,mode,dt){for(const e of m.crew){const u=e.g.userData;if(!u||!u.aR)continue;const k=Math.min(1,dt*8),bl=(o,v)=>o+(v-o)*k;
  if(mode==='ears'){u.aR.rotation.x=bl(u.aR.rotation.x,-2.6);u.aL.rotation.x=bl(u.aL.rotation.x,-2.6);u.eR.rotation.x=bl(u.eR.rotation.x,-2.2);u.eL.rotation.x=bl(u.eL.rotation.x,-2.2);u.b.rotation.x=bl(u.b.rotation.x,.4)}
  else if(e.role22==='artillero'){u.aR.rotation.x=bl(u.aR.rotation.x,-1.3+(mode==='aim'?Math.sin(time*5)*.3:0));u.aL.rotation.x=bl(u.aL.rotation.x,-1.3-(mode==='aim'?Math.sin(time*5)*.3:0));u.b.rotation.x=bl(u.b.rotation.x,.35)}
  else if(e.role22==='cargador'){const c=mode==='load';u.aR.rotation.x=bl(u.aR.rotation.x,c?-1.1:-.3);u.aL.rotation.x=bl(u.aL.rotation.x,c?-1.1:-.3);u.eR.rotation.x=bl(u.eR.rotation.x,c?-1:-.3);u.b.rotation.x=bl(u.b.rotation.x,c?.5:.1);if(c){const [cx,cz]=crewPos22(m,e);const g=m.g,cc=Math.cos(g.rotation.y),ss=Math.sin(g.rotation.y),ph=1-m.ct/2;const ox=ph<.5?1.6:.4,oz=ph<.5?-2.2:-1.6;e.hold=[g.position.x+ox*cc+oz*ss,0,g.position.z-ox*ss+oz*cc]}}
  else{u.aR.rotation.x=bl(u.aR.rotation.x,mode==='rec'?-1.6:-.6);u.eR.rotation.x=bl(u.eR.rotation.x,-.8);u.b.rotation.x=bl(u.b.rotation.x,.2)}}}
const _mu22=machUpd;machUpd=function(dt){for(const m of MACH)if(m.kind==='bombarda')m.cd=999;_mu22(dt);obusUpd22(dt)};
/* =====================================================================
   INTEGRACIÓN: actualización por fotograma
   ===================================================================== */
const _fx1122=fx11;fx11=function(dt,cine){_fx1122(dt,cine);if(L11.train)trainUpd22(L11.train,dt);doorsUpd22(dt)};
const _up22=update;update=function(dt){_up22(dt);if(!playing)return;const cine=(LX(level)&&L9.cine)||(level===8&&L8.cine);if(!cine){separate22(dt);pushUpd22(dt)}};

document.querySelector('#menu p b').textContent='Misión 0 + Capítulos I–X · v22 HÚSARES, FORTALEZA Y ARTILLERÍA';
$('hs').insertAdjacentHTML('beforebegin','<p class="c" style="color:#f0d8a0">NUEVO v22 · húsares Argentum con espada y carabina Mauser · agarre de armas corregido (IK de muñeca) · murallas de la fortaleza con escaleras y almenas para la guarnición · obús de asedio con dotación · tren y edificios detallados · tropas que no se atascan · objetos empujables</p>');
