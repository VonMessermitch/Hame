/* =====================================================================
   v33 · IA ALIADA — escuadra de compañeros al estilo CoD1/CoD2/MOHAA
   (Glave: tácticas de escuadra · Hammon: navegación · Field: combate)
   - Formación por PUESTOS relativos al jugador y a la amenaza (cuña en
     marcha, línea al contacto, despliegue en reposo), 4–8 m entre hombres,
     puestos ajustados a coberturas, reasignados cada pocos segundos.
   - Cada hombre va DIRECTO a su puesto (no sigue al de adelante), con
     separación, ritmos y reacciones distintos, y se aparta del jugador.
   - Combate: vista + oído (disparos enemigos, noise33), cobertura frente a
     la amenaza, asomarse y disparar por ráfagas, recarga a cubierto,
     fuego de supresión, avance por saltos entre dos binomios, defensa de
     posiciones, reacción a granadas y bajas, avisos breves.
   - Navegación: control de progreso, desvío lateral, rastro del jugador
     como camino de respaldo (barrancos, interiores) y, en último caso,
     reaparición sólo fuera de cámara y lejos.
   - Los guiones mandan: n.lock / !n.on / n.down29 / puestos, rutas,
     sanitarios y dotaciones del nivel 17 quedan fuera de esta capa.
   Sustituye a compUpd30 (niveles 13–17) y añade capas ligeras a la
   escuadra de instrucción (11) y a los camaradas/oficial (1–10).
   ===================================================================== */
const A33={on:true,lv:-1,ax:0,az:0,vx:0,vz:0,h:0,fh:0,lt:-1,mode:'move',pm:'',kn:[],tdx:0,tdz:1,tT:-99,cT:-99,reT:0,pkx:0,pkz:0,pickN:0,trail:[],
 los:0,losMax:10,fr:-1,foes:[],ft:0,down:0,sayT:{},L:[],nm:new Set(),rr:0,
 dbg:{shots:0,sup:0,kills:0,hits:0,stuckT:0,coverT:0,allyT:0,think:0,los:0,det:0,trail:0,tele:0,flank:0,gren:0,bound:0,sep:0,pick:0}};
const _V33=new T.Vector3();
function los33(ax,ay,az,bx,by,bz){if(A33.los>=A33.losMax)return -1;A33.los++;A33.dbg.los++;return losClear(ax,ay,az,bx,by,bz)?1:0}
function off33(x,y,z){if(typeof cam==='undefined')return true;_V33.set(x,y,z).project(cam);return _V33.z>1||Math.abs(_V33.x)>1.08||Math.abs(_V33.y)>1.1||Math.hypot(x-cam.position.x,z-cam.position.z)>95}
function free33(x,z,r){return typeof blockedAt!=='function'||!blockedAt(x,z,r===undefined?.45:r)}
function say33(n,k,lines,gap){const t=A33.sayT[k]||-99;if(time-t<(gap||9))return;A33.sayT[k]=time;if(typeof aiSay30==='function'&&n&&n.name)aiSay30(n,typeof lines==='string'?lines:lines[R()*lines.length|0],2.2)}
function ang33(a){while(a>Math.PI)a-=6.2832;while(a<-Math.PI)a+=6.2832;return a}

/* ---------- ancla, rumbo y rastro del jugador ---------- */
function anchor33(){if(level===14&&typeof L14!=='undefined'&&L14.inTank&&L14.tank)return L14.tank.position;return P.g.position}
function track33(){const a=anchor33(),dt=A33.lt<0?0:Math.min(.25,time-A33.lt);A33.lt=time;
 if(A33.lv!==level||Math.hypot(a.x-A33.ax,a.z-A33.az)>25){A33.lv=level;A33.trail.length=0;A33.kn.length=0;A33.vx=A33.vz=0;A33.reT=0;A33.tT=-99;A33.h=A33.fh=typeof yaw!=='undefined'?ang33(yaw+Math.PI):0}
 else if(dt>0){const k=Math.min(1,dt*3);A33.vx+=((a.x-A33.ax)/dt-A33.vx)*k;A33.vz+=((a.z-A33.az)/dt-A33.vz)*k}
 A33.ax=a.x;A33.az=a.z;const sp=Math.hypot(A33.vx,A33.vz);if(sp>1.1)A33.h=ang33(A33.h+ang33(Math.atan2(A33.vx,A33.vz)-A33.h)*Math.min(1,dt*2.5));
 const T_=A33.trail,l=T_[T_.length-1];if(!l||Math.hypot(a.x-l[0],a.z-l[1])>2.5){T_.push([a.x,a.z]);if(T_.length>70)T_.shift()}return sp}
/* ---------- conocimiento compartido de la amenaza ---------- */
function know33(e,x,z,seen){const K=A33.kn;for(const k of K)if((e&&k.e===e)||(!e&&!k.e&&Math.hypot(k.x-x,k.z-z)<6)){k.x=x;k.z=z;k.y=e?e.g.position.y:0;k.t=time;if(seen)k.s=time;return}if(K.length>=24)K.shift();K.push({e,x,z,y:e?e.g.position.y:0,t:time,s:seen?time:-99})}
function threat33(){const K=A33.kn;let sx=0,sz=0,w=0,cx=0,cz=0;for(let i=K.length-1;i>=0;i--){const k=K[i];if(time-k.t>12||(k.e&&(k.e.hp<=0||enemies.indexOf(k.e)<0))){K.splice(i,1);continue}if(time-k.t>9)continue;const dx=k.x-A33.ax,dz=k.z-A33.az,d=Math.hypot(dx,dz)||1;if(d>130)continue;const q=1/(1+d/30)*(time-k.t<3?1.5:1);sx+=dx/d*q;sz+=dz/d*q;cx+=k.x*q;cz+=k.z*q;w+=q}
 if(w>0){const l=Math.hypot(sx,sz)||1;A33.tdx=sx/l;A33.tdz=sz/l;A33.tcx=cx/w;A33.tcz=cz/w;A33.tT=time}return w>0}
/* ---------- plantillas de formación (lateral, frente) ---------- */
const FM33={
 move:[[-5,1],[5.5,-1.5],[-9.5,-4],[9.5,-5],[-3.5,-7.5],[4,-8.5],[-13.5,-7],[13.5,-8]],
 contact:[[-4.5,1.5],[5,.5],[-9.5,0],[10,1.5],[-14.5,.5],[15,0],[-6.5,-4.5],[7.5,-5]],
 idle:[[-4.5,2.5],[5,1.5],[-7.5,-3],[8,-3.5],[-2.5,-6.5],[3,-7],[-11,.5],[11,-.5]],
 quiet:[[-2.2,-2.5],[2.4,-3],[-3.6,-5.5],[3.8,-6],[-1.4,-8],[1.6,-8.6],[-5,-8],[5,-8.5]],
 tank:[[-5,-6],[5.5,-6.5],[-6.5,-12],[6.5,-12.5],[-4,-17],[4.5,-17.5],[-8,-2],[8,-2.5]]};
function cover33(x,z,tx,tz,used,rad){let b=null,bs=rad||5.5;const C=typeof covers!=='undefined'?covers:[];for(const c of C){if(Math.abs(c.x-x)>bs+c.r||Math.abs(c.z-z)>bs+c.r)continue;const ux=c.x-tx,uz=c.z-tz,ul=Math.hypot(ux,uz)||1;const qx=c.x+ux/ul*(c.r*.75+.55),qz=c.z+uz/ul*(c.r*.75+.55),d=Math.hypot(qx-x,qz-z);if(d>=bs)continue;let ok=true;for(const u of used)if(Math.hypot(u[0]-qx,u[1]-qz)<2.6){ok=false;break}if(!ok||!free33(qx,qz,.4))continue;bs=d;b=[qx,qz]}for(const o of obstB){if(o.h<1||(o.y0||0)>.5||o.hw>18||o.hd>18||Math.abs(o.x-x)>bs+o.hw+1||Math.abs(o.z-z)>bs+o.hd+1)continue;const dx=o.x-tx,dz=o.z-tz;let qx,qz;if(Math.abs(dx)/(o.hw+.01)>Math.abs(dz)/(o.hd+.01)){qx=o.x+Math.sign(dx)*(o.hw+.6);qz=Math.max(o.z-o.hd+.4,Math.min(o.z+o.hd-.4,z))}else{qz=o.z+Math.sign(dz)*(o.hd+.6);qx=Math.max(o.x-o.hw+.4,Math.min(o.x+o.hw-.4,x))}
  const d=Math.hypot(qx-x,qz-z);if(d>=bs)continue;let ok=true;for(const u of used)if(Math.hypot(u[0]-qx,u[1]-qz)<2.6){ok=false;break}if(!ok||!free33(qx,qz,.4))continue;bs=d;b=[qx,qz]}
 return b}
/* reparto de puestos: ordenados lateralmente para que nadie se cruce */
function pick33(L,mode,thr){const fh=A33.fh,fx=Math.sin(fh),fz=Math.cos(fh),rx=-Math.cos(fh),rz=Math.sin(fh);let tp=FM33[mode]||FM33.move;const n=L.length;if(!n)return;A33.dbg.pick++;A33.pickN++;
 const lead=mode==='move'?.7:0,ax=A33.ax+A33.vx*lead,az=A33.az+A33.vz*lead,adv=AI30.ord==='advance'&&mode!=='quiet'&&mode!=='tank'?8:0;
 const sl=[];for(let i=0;i<n;i++){const t=tp[i%tp.length],w=i>=tp.length?1.25:1;sl.push([t[0]*w,t[1]*w+adv])}sl.sort((a,b)=>a[0]-b[0]);
 const al=L.map(m=>{const p=m.g.position;return{m,l:(p.x-A33.ax)*rx+(p.z-A33.az)*rz}}).sort((a,b)=>a.l-b.l);
 const bound=thr&&(mode==='contact')&&A33.pickN%2,used=[];const tx=thr?A33.tcx:ax+fx*40,tz=thr?A33.tcz:az+fz*40;
 for(let i=0;i<n;i++){const m=al[i].m;if(m.dp33&&AI30.ord==='hold')continue;
  /* avance por saltos: un binomio se mueve, el otro cubre */if(bound!==undefined&&thr&&m.sl33&&(m.tm33===bound)&&Math.hypot(m.sl33[0]-A33.ax,m.sl33[1]-A33.az)<16){used.push(m.sl33);continue}
  const s=sl[i],jx=m.jx33||0,jz=m.jz33||0;let x=ax+rx*s[0]+fx*s[1]+jx,z=az+rz*s[0]+fz*s[1]+jz,cv=false;
  if(mode==='contact'||mode==='idle'){const c=cover33(x,z,tx,tz,used,mode==='contact'?6:4);if(c){x=c[0];z=c[1];cv=true}}
  if(!free33(x,z)){let ok=false;for(const r of[1.2,2.4,3.6]){for(let k=0;k<8;k++){const a=k*.785,qx=x+Math.cos(a)*r,qz=z+Math.sin(a)*r;if(free33(qx,qz)){x=qx;z=qz;ok=true;break}}if(ok)break}}
  /* alcanzable desde el ancla: si un muro los separa, el puesto se acerca al jugador */
  if(!cv){const v=los33(A33.ax,.9,A33.az,x,.9,z);if(v===0){let ok=false;for(const k of[.6,.35]){const qx=A33.ax+(x-A33.ax)*k,qz=A33.az+(z-A33.az)*k;if(free33(qx,qz)&&los33(A33.ax,.9,A33.az,qx,.9,qz)!==0){x=qx;z=qz;ok=true;break}}if(!ok){const t=A33.trail[Math.max(0,A33.trail.length-2-(i%3))];if(t){x=t[0]+jx*.3;z=t[1]+jz*.3}}}}
  for(const u of used)if(Math.hypot(u[0]-x,u[1]-z)<2.4){x+=rx*2.6*(s[0]<0?-1:1);z+=rz*2.6*(s[0]<0?-1:1)}
  const ns=[x,z,cv];if(mode==='move'||mode==='quiet'||mode==='tank'){const dx=x-ax,dz=z-az;ns.rl=[dx*rx+dz*rz,dx*fx+dz*fz]}used.push(ns);m.nsl33=ns;m.nslT=time+(m.rd33||.3)}
 A33.pkx=A33.ax;A33.pkz=A33.az;if(bound!==undefined&&thr&&n>2){A33.dbg.bound++;const mv=L.find(m=>m.tm33!==bound&&m.tg);if(mv)say33(mv,'bound',['¡Avanzo! ¡Cubrime!','¡Muévanse, los cubro!','¡Fuego y movimiento!','¡Saltamos al próximo!'],14)}}
/* ---------- navegación: progreso, desvío, rastro y reaparición ---------- */
function nav33(n,gx,gz,dt){const p=n.g.position,N=n.nv33||(n.nv33={lx:p.x,lz:p.z,t:R()*.9,stk:0,wp:null,until:0,ti:-1,lc:0});const dg=Math.hypot(gx-p.x,gz-p.z);
 N.t-=dt;if(N.t<=0){N.t=.9;const mv=Math.hypot(p.x-N.lx,p.z-N.lz);N.lx=p.x;N.lz=p.z;
  if(dg>2.5&&mv<.4&&n.tgt){N.stk++;A33.dbg.stuckT+=.9;
   if(N.stk<=2){const base=Math.atan2(gx-p.x,gz-p.z),sd=N.stk%2?1:-1;for(const k of[1.2,-1.2,1.9,-1.9,2.6,-2.6]){const a=base+k*sd,ux=Math.sin(a),uz=Math.cos(a);if(free33(p.x+ux*1.6,p.z+uz*1.6)&&free33(p.x+ux*3.4,p.z+uz*3.4)){N.wp=[p.x+ux*3.4,p.z+uz*3.4];N.until=time+1.5;N.ti=-1;A33.dbg.det++;break}}}
   else if(N.ti<0)trailIn33(n,N);
   if(N.stk>=6){const dp=Math.hypot(p.x-A33.ax,p.z-A33.az);if(dp>26&&off33(p.x,1,p.z))tele33(n);else if(N.stk>=9&&dp>14&&off33(p.x,1,p.z))tele33(n)}}
  else if(mv>.6)N.stk=Math.max(0,N.stk-1);
  /* proactivo: lejos y sin línea hacia el jugador → rastro */
  if(N.ti<0&&dg>16&&Math.hypot(p.x-A33.ax,p.z-A33.az)>16){N.lc++;if(N.lc%2===0&&los33(p.x,.9,p.z,A33.ax,.9,A33.az)===0)trailIn33(n,N)}
  else if(N.ti>=0&&N.lc++%2===0&&Math.hypot(p.x-A33.ax,p.z-A33.az)<22&&los33(p.x,.9,p.z,gx,.9,gz)===1)N.ti=-1}
 if(N.wp&&time<N.until){if(Math.hypot(N.wp[0]-p.x,N.wp[1]-p.z)>1)return N.wp;N.wp=null}
 if(N.ti>=0){const T_=A33.trail;if(N.ti>=T_.length-1){N.ti=-1}else{const w=T_[N.ti];if(Math.hypot(w[0]-p.x,w[1]-p.z)<2)N.ti++;return T_[Math.min(N.ti,T_.length-1)]}}
 return null}
function trailIn33(n,N){const T_=A33.trail,p=n.g.position;if(T_.length<2)return;let bi=-1,bd=1e9;for(let i=0;i<T_.length;i++){const d=Math.hypot(T_[i][0]-p.x,T_[i][1]-p.z)-i*.15;if(d<bd){bd=d;bi=i}}if(bi<0)return;
 for(let j=0;j<3&&bi+j<T_.length;j++){const w=T_[bi+j];const v=los33(p.x,.9,p.z,w[0],.9,w[1]);if(v!==0){N.ti=bi+j;A33.dbg.trail++;return}}N.ti=bi;A33.dbg.trail++}
function tele33(n){const T_=A33.trail,p=n.g.position;for(let i=T_.length-4;i>=0&&i>T_.length-14;i--){const w=T_[i];if(Math.hypot(w[0]-A33.ax,w[1]-A33.az)<7)continue;const x=w[0]+(R()-.5)*2,z=w[1]+(R()-.5)*2;if(free33(x,z)&&off33(x,1,z)){p.set(x,Math.max(0,floorAt({x,y:.4,z})),z);n.vx=n.vz=0;n.tgt=null;if(n.nv33){n.nv33.stk=0;n.nv33.ti=-1;n.nv33.wp=null;n.nv33.lx=x;n.nv33.lz=z}if(n.nav){n.nav.stuck=0;n.nav.fail=0}A33.dbg.tele++;return true}}return false}
/* ---------- percepción individual (escalonada, con presupuesto de LOS) ---------- */
function see33(n,quiet){const p=n.g.position,rng=n.wpn==='p'?42:75,f=n.g.rotation.y,pp=P.g.position;let c1=null,c2=null,c3=null,s1=1e9,s2=1e9,s3=1e9;
 for(const e of A33.foes){const q=e.g.position,dx=q.x-p.x,dz=q.z-p.z,d=Math.hypot(dx,dz);if(d>rng)continue;const heard=e.shot33&&time-e.shot33<4;if(!heard&&!A33.alert&&d>12&&Math.abs(ang33(Math.atan2(dx,dz)-f))>2.2)continue;
  let s=d;if(e.active&&Math.hypot(q.x-pp.x,q.z-pp.z)<25)s-=18;if(heard)s-=8;if(e===n.tg)s-=6;if(e.k8==='bar')s-=6;
  if(s<s1){c3=c2;s3=s2;c2=c1;s2=s1;c1=e;s1=s}else if(s<s2){c3=c2;s3=s2;c2=e;s2=s}else if(s<s3){c3=e;s3=s}}
 for(const e of[c1,c2,c3]){if(!e)continue;const q=e.g.position,v=los33(p.x,p.y+1.5,p.z,q.x,q.y+1.3,q.z);if(v===1){n.tg=e;n.vis33=time;know33(e,q.x,q.z,true);return e}if(v<0&&e===n.tg&&time-(n.vis33||-9)<1.5)return e}
 if(n.tg&&(n.tg.hp<=0||enemies.indexOf(n.tg)<0))n.tg=null;return null}
/* ---------- disparo de supresión (sin daño, sólo fuerza al enemigo a cubrirse) ---------- */
function sup33(n,x,z,dt,y){y=y||0;n.sc33=(n.sc33===undefined?R()*1.5:n.sc33)-dt;if(n.sc33>0||n.rl>0)return false;const lmg=n.wpn==='lmg';n.sc33=lmg?.9+R()*.6:1.8+R()*1.6;const p=n.g.position;
 const v=los33(p.x,p.y+1.5,p.z,x,y+1.4,z);if(v!==1){n.sc33=.6;return false}const k=lmg?4:1;n.mag=(n.mag===undefined?(MAG30[n.wpn]||5):n.mag)-k;if(n.mag<=0){n.rl=2.2;say33(n,'rl','¡Recargando!',6)}
 for(let j=0;j<k;j++)later13(j*.11,()=>{const src=n.wpn==='p'?n.pis:n.rif;let o;if(src){src.updateMatrixWorld(true);o=src.localToWorld(new T.Vector3(0,-.5,0))}else o=new T.Vector3(p.x,1.5,p.z);const t=new T.Vector3(x+(R()-.5)*2.4,y+.6+R()*1.4,z+(R()-.5)*2.4);trc16(o,t,0xffe0a0);burst(o.x,o.y,o.z,0xffd080,2,.1,2);if(typeof npcShot==='function')npcShot(lmg?'mg':'rifle',p.x,p.z);burst(t.x,t.y,t.z,0x8a7a62,3,.2,2)});
 for(const e of enemies)if(e.hp>0&&Math.hypot(e.g.position.x-x,e.g.position.z-z)<5){e.sup33=time;if(e.a33&&typeof e.a33.sup==='number')e.a33.sup+=.35*k}A33.dbg.sup+=k;L13.loud=true;if(typeof noise33==='function')noise33(p.x,p.z,70,'ally');return true}
/* ---------- ¿el jugador está en la línea de tiro? ---------- */
function plf33(p,q){const pp=P.g.position,dx=q.x-p.x,dz=q.z-p.z,L=Math.hypot(dx,dz)||1,ux=dx/L,uz=dz/L,wx=pp.x-p.x,wz=pp.z-p.z,t=wx*ux+wz*uz;if(t<.5||t>L)return false;return Math.abs(wx*uz-wz*ux)<1.1}
/* =====================================================================
   NÚCLEO: sustituye a compUpd30 (escuadras de 13, 14, 15, 16 y 17)
   ===================================================================== */
const _cu30_33=compUpd30;
function compUpd33(dt,LST){const pp=P.g.position;const L0=LST||L13.sq||[];
 if(A33.fr!==time){A33.fr=time;A33.los=0}
 const spd=track33();
 AI30.tt-=dt;if(AI30.tt<=0){AI30.tt=.25;AI30.foes=enemies.filter(e=>e.hp>0&&!(e.unaware&&!L13.loud))}A33.foes=AI30.foes;const quiet=L13.sneak&&!L13.loud;
 const L=A33.L;L.length=0;let dn=0;for(const n of L0){if(n.down29||n.down17){dn++;continue}if(!n.on||n.lock)continue;L.push(n);A33.nm.add(n.name)}
 /* bajas: alguien cae → aviso y todos buscan cubierta */
 if(dn>A33.down){const w=L[0];if(w)say33(w,'down',['¡Hombre caído!','¡Le dieron a uno de los nuestros!','¡Cayó uno! ¡Cúbranse!'],6);A33.reT=0}A33.down=dn;
 for(const e of A33.foes)if(e.shot33&&time-e.shot33<.6&&Math.hypot(e.g.position.x-A33.ax,e.g.position.z-A33.az)<75)know33(e,e.g.position.x,e.g.position.z,false);
 const thr=!quiet&&threat33();const contact=thr&&time-A33.tT<8;A33.alert=contact;if(contact&&time-A33.cT>14&&L.length){const n=L[R()*L.length|0];const rel=ang33(Math.atan2(A33.tdx,A33.tdz)-ang33(yaw+Math.PI));say33(n,'cont',Math.abs(rel)<.6?['¡Contacto al frente!','¡Enemigos adelante!','¡Ahí, a las doce!']:rel>0?['¡Contacto a la izquierda!','¡Por la izquierda!']:['¡Contacto a la derecha!','¡Por la derecha!'],10)}if(contact)A33.cT=time;
 const inTank=level===14&&typeof L14!=='undefined'&&L14.inTank;
 const mode=quiet?'quiet':inTank?'tank':contact?'contact':spd>1.1?'move':'idle';
 /* rumbo de la formación: hacia la amenaza en combate, hacia donde marcha el jugador si no */
 const want=contact?Math.atan2(A33.tdx,A33.tdz):mode==='idle'?A33.fh:A33.h;const dh=Math.abs(ang33(want-A33.fh));A33.fh=ang33(A33.fh+ang33(want-A33.fh)*Math.min(1,dt*(contact?3:1.5)));
 if(L.length&&(time>A33.reT||mode!==A33.pm||Math.hypot(A33.ax-A33.pkx,A33.az-A33.pkz)>(mode==='move'?4:mode==='contact'?5:6)||dh>.7&&mode!=='idle'||AI30.ord!=='hold'&&L.some(m=>!m.sl33&&!m.nsl33))){A33.pm=mode;A33.reT=time+(contact?3+R()*1.2:2.4+R()*1.6);pick33(L,mode,contact)}
 const fh=A33.fh;let i=0;
 for(const n of L){const p=n.g.position;i++;
  if(n.rd33===undefined){n.rd33=.15+R()*.6;n.spk33=.9+R()*.22;n.tm33=i%2;n.jx33=(R()-.5)*1.6;n.jz33=(R()-.5)*1.6;n.th33=R()*.4;n.pk33=0;n.pkT33=0}
  if(n.nsl33&&time>=n.nslT){n.sl33=n.nsl33;n.nsl33=null}
  p.y+=(Math.max(0,floorAt({x:p.x,y:p.y+.4,z:p.z}))-p.y)*Math.min(1,dt*10);if(n.mag===undefined)n.mag=MAG30[n.wpn]||5;
  A33.dbg.allyT+=dt;const far=Math.hypot(p.x-cam.position.x,p.z-cam.position.z)>120;
  /* percepción escalonada */n.th33-=dt;let e=n.tg&&n.tg.hp>0&&enemies.indexOf(n.tg)>=0?n.tg:null;if(n.th33<=0){n.th33=(far?1:.28+R()*.16);A33.dbg.think++;e=quiet&&!L13.loud?null:far?null:see33(n,quiet)}
  const vis=e&&time-(n.vis33||-9)<1.2;
  /* granadas enemigas: huir */if(typeof egr!=='undefined'&&egr.length&&!(n.gv33&&time<n.gvT)){for(const g of egr){const q=g.pos||g.m&&g.m.position;if(!q)continue;const d=Math.hypot(q.x-p.x,q.z-p.z);if(d<6.5){let ux=p.x-q.x,uz=p.z-q.z;const l=Math.hypot(ux,uz)||1;ux/=l;uz/=l;let gx=p.x+ux*7,gz=p.z+uz*7;if(!free33(gx,gz)){gx=p.x-uz*6;gz=p.z+ux*6;if(!free33(gx,gz)){gx=p.x+uz*6;gz=p.z-ux*6}}n.gv33=[gx,gz];n.gvT=time+1.9;A33.dbg.gren++;say33(n,'gren',['¡Granada!','¡Granada! ¡Al suelo!','¡Cuerpo a tierra, granada!'],4);break}}}
  /* explosión cercana: agacharse un instante (sin congelar si está huyendo) */if(AI30.blast&&time-AI30.blast.t<.2&&Math.hypot(AI30.blast.x-p.x,AI30.blast.z-p.z)<14&&!n.duckT){n.duckT=.9;if(R()<.25)say33(n,'blast',['¡Cuidado!','¡Al suelo!','¡Esa estuvo cerca!'],6)}
  if(n.duckT){n.duckT=Math.max(0,n.duckT-dt)}
  /* recarga (a cubierto si puede) */if(n.rl>0){n.rl-=dt;if(!(n.rl>0))n.mag=MAG30[n.wpn]||5}
  /* destino */let gx,gz,cv=false,fl=false;const dp=Math.hypot(p.x-A33.ax,p.z-A33.az);
  if(n.gv33&&time<n.gvT){gx=n.gv33[0];gz=n.gv33[1];fl=true}
  else if(AI30.ord==='hold'){if(!n.dp33){const c=cover33(p.x,p.z,thr?A33.tcx:p.x+Math.sin(fh)*40,thr?A33.tcz:p.z+Math.cos(fh)*40,[],4);n.dp33=c?[c[0],c[1],true]:[p.x,p.z,false]}gx=n.dp33[0];gz=n.dp33[1];cv=n.dp33[2]}
  else{n.dp33=null;if(n.ov33&&time<n.ovT&&dp<45){gx=n.ov33[0];gz=n.ov33[1];cv=false}else if(n.sl33){gx=n.sl33[0];gz=n.sl33[1];cv=n.sl33[2];const r=n.sl33.rl;if(r&&(mode==='move'||mode==='quiet'||mode==='tank')){/* puesto vivo: se desliza con el jugador */const ld=mode==='move'?.7:.4,fx=Math.sin(fh),fz=Math.cos(fh),qx=A33.ax+A33.vx*ld-Math.cos(fh)*r[0]+fx*r[1],qz=A33.az+A33.vz*ld+Math.sin(fh)*r[0]+fz*r[1];if(free33(qx,qz)){gx=qx;gz=qz}}}else{gx=p.x;gz=p.z}}
  /* el que está trabado en un buen tiroteo no abandona su cobertura por un paso del jugador */
  let dg=Math.hypot(gx-p.x,gz-p.z);if(!fl&&vis&&n.at33&&dg<4.5&&dp<18){gx=p.x;gz=p.z;dg=0}
  const wp=fl?null:nav33(n,gx,gz,dt);const mx=wp?wp[0]:gx,mz=wp?wp[1]:gz,dm=Math.hypot(mx-p.x,mz-p.z),arr=contact?1:1.6;
  if(dm>arr){n.at33=false;n.tgt=[mx,mz];let s=fl?7.2:Math.min(7.9,Math.max(2.4,1.4+dg*.5))*n.spk33;if(quiet)s=Math.min(s,dg>8?5.2:2.8);if(spd>2&&dg>2.5)s=Math.max(s,Math.min(8.6,spd*(dg>8?1.25:dg>4?1.1:1)));if(dg>22)s=Math.max(s,8.2);if(AI30.ord==='hold'&&!fl)s=Math.min(s,5.6);n.sp=s;n.act=s>4.6?'run':'idle';if(dg>3)n.mvT33=time}
  else{n.tgt=null;if(!n.at33){n.at33=true;n.pk33=0;n.pkT33=.4+R()*.6}}
  /* combate */
  if(vis&&!quiet){const q=e.g.position,d=Math.hypot(q.x-p.x,q.z-p.z);const blocked=plf33(p,q);
   if(n.at33){n.f=Math.atan2(q.x-p.x,q.z-p.z);n.pkT33-=dt;if(n.pkT33<=0){n.pk33=cv?1-n.pk33:1;n.pkT33=n.pk33?(n.wpn==='lmg'?2.6:1.5)+R()*1.3:.8+R()*1}
    const up=n.pk33&&!(n.rl>0);if(n.wpn==='p')draw12(n,true);n.act=n.wpn==='p'?'point':cv?(up?'crouchaim':'crouch'):(n.rl>0?'crouch':'aim');
    if(up&&!blocked)fire30(n,e,d,dt);if(blocked&&!(n.ov33&&time<n.ovT)){const a=Math.atan2(q.x-p.x,q.z-p.z)+1.5708*(R()<.5?1:-1),ox=p.x+Math.sin(a)*2.5,oz=p.z+Math.cos(a)*2.5;if(free33(ox,oz)){n.ov33=[ox,oz];n.ovT=time+3}}
    if(cv)A33.dbg.coverT+=dt}
   else if(dm>arr&&n.sp<5.2&&!(n.rl>0)&&!blocked&&Math.abs(ang33(Math.atan2(q.x-p.x,q.z-p.z)-Math.atan2(mx-p.x,mz-p.z)))<1){fire30(n,e,d,dt)}}
  else if(n.at33&&!fl){
   /* sin blanco visible: suprimir lo último conocido, o buscar ángulo; nunca quedarse mirando la nada */
   let k=null,kd=70;if(contact&&!quiet)for(const c of A33.kn){if(time-c.t>8)continue;const d=Math.hypot(c.x-p.x,c.z-p.z);if(d<kd){kd=d;k=c}}
   if(k){n.f=Math.atan2(k.x-p.x,k.z-p.z);n.act=cv?'crouch':'aim';if(cv)A33.dbg.coverT+=dt;n.nv33&&(n.nv33.blind=(n.nv33.blind||0)+dt);
    if((n.wpn==='lmg'||n.tm33===(A33.pickN%2))&&time-k.t<5)sup33(n,k.x,k.z,dt,k.y);
    if(n.nv33&&n.nv33.blind>5&&AI30.ord!=='hold'&&!(n.ov33&&time<n.ovT)){n.nv33.blind=0;const a=Math.atan2(k.x-p.x,k.z-p.z);for(const sd of[1,-1]){const b=a+1.5708*sd,qx=p.x+Math.sin(b)*5.5,qz=p.z+Math.cos(b)*5.5;if(free33(qx,qz)&&los33(qx,p.y+1.5,qz,k.x,(k.y||0)+1.3,k.z)===1){n.ov33=[qx,qz];n.ovT=time+8;A33.dbg.flank++;break}}}}
   else{if(n.nv33)n.nv33.blind=0;n.f=angL(n.f||0,contact?Math.atan2(A33.tdx,A33.tdz):fh+(n.jx33||0)*.35,Math.min(1,dt*2));n.act=quiet?'crouch':mode==='idle'&&!contact?(n.idA||(n.idA=['idle','idle','smoke','idle'][R()*4|0])):cv&&contact?'crouch':'idle';if(n.wpn==='p'&&n.pis&&n.pis.visible&&!L13.loud)draw12(n,false)}}
  n.cov=!!(cv&&n.at33);if(n.duckT>0&&!n.tgt)n.act='crouch';
  n.st30=fl?'SEEK_COVER':AI30.ord==='hold'?'DEFEND':vis?(n.at33?'ENGAGE':'ADVANCE'):contact?'ALERT':dp>32?'REGROUP':'FOLLOW'}}
compUpd30=compUpd33;compUpd13=compUpd33;
/* separación, no estorbar al jugador y no tapar su línea de tiro (después del movimiento) */
function sep33(L,dt,rad){const pp=P.g.position,an=anchor33(),tank=level===14&&typeof L14!=='undefined'&&L14.inTank,pr=tank?4.6:1.8,k=Math.min(1,dt*6),fx=-Math.sin(yaw),fz=-Math.cos(yaw);
 for(let i=0;i<L.length;i++){const a=L[i],p=a.g.position;let mx=0,mz=0;
  for(let j=0;j<L.length;j++){if(i===j)continue;const q=L[j].g.position,dx=p.x-q.x,dz=p.z-q.z,d=Math.hypot(dx,dz);if(d<rad&&d>.001){mx+=dx/d*(rad-d);mz+=dz/d*(rad-d)}else if(d<=.001){mx+=R()-.5;mz+=R()-.5}}
  {const dx=p.x-an.x,dz=p.z-an.z,d=Math.hypot(dx,dz)||.01;if(d<pr){mx+=dx/d*(pr-d)*1.6;mz+=dz/d*(pr-d)*1.6}
   /* el jugador avanza hacia él: paso al costado */const vx=A33.vx,vz=A33.vz,v=Math.hypot(vx,vz);if(v>1.5&&d<3.6){const ux=vx/v,uz=vz/v,al=-(dx*ux+dz*uz),lat=dx*uz-dz*ux;if(al<0&&-al<3.6&&Math.abs(lat)<1.5){const s=lat>=0?1:-1;mx+=uz*s*1.8;mz+=-ux*s*1.8}}
   /* delante del cañón del jugador en combate */if(A33.mode33c&&!a.tgt){const al=-(dx*fx+dz*fz),lat=dx*fz-dz*fx;if(al<0&&-al<22&&Math.abs(lat)<1){const s=lat>=0?1:-1;mx+=fz*s*1.2;mz+=-fx*s*1.2}}}
  if(typeof VEH32!=='undefined'&&VEH32&&VEH32.list)for(const v of VEH32.list){if(!v.alive||!v.g)continue;const q=v.g.position,dx=p.x-q.x,dz=p.z-q.z,d=Math.hypot(dx,dz)||.01;if(d<5.2){mx+=dx/d*(5.2-d);mz+=dz/d*(5.2-d)}}
  const m=Math.hypot(mx,mz);if(m<.01)continue;const lim=Math.min(m,1.5)/m;const nx=p.x+mx*lim*k*1.2,nz=p.z+mz*lim*k*1.2;if(free33(nx,nz,.4)){p.x=nx;p.z=nz;A33.dbg.sep++}}}
/* ayuda a los movimientos GUIONADOS (puestos, rutas, sanitarios) sin pelear con el guion:
   si un NPC con destino no progresa, se le da un rodeo momentáneo; sólo si sigue trabado mucho
   tiempo y ni él ni su destino están en cámara, se lo deja en su destino */
function assist33(dt){if(level<13||(typeof L9!=='undefined'&&L9.cine))return;for(const n of NPC11){if(n.lv!==level||!n.g.visible||!n.tgt||A33.L.indexOf(n)>=0){if(n.as33)n.as33.stk=0;continue}const p=n.g.position,a=n.as33||(n.as33={lx:p.x,lz:p.z,t:R(),stk:0,wp:null,until:0,sv:null});
 a.t-=dt;if(a.t<=0){a.t=1;const mv=Math.hypot(p.x-a.lx,p.z-a.lz),d=Math.hypot(n.tgt[0]-p.x,n.tgt[1]-p.z);a.lx=p.x;a.lz=p.z;
  if(d>3&&mv<.3){a.stk++;A33.dbg.stuckT+=1;if(a.stk>=2&&!(a.wp&&time<a.until)){const base=Math.atan2(n.tgt[0]-p.x,n.tgt[1]-p.z),sd=a.stk%2?1:-1;for(const k of[1.3,-1.3,2,-2,2.7,-2.7]){const an=base+k*sd,ux=Math.sin(an),uz=Math.cos(an);if(free33(p.x+ux*1.6,p.z+uz*1.6)&&free33(p.x+ux*3.4,p.z+uz*3.4)){a.wp=[p.x+ux*3.4,p.z+uz*3.4];a.until=time+1.4;A33.dbg.det++;break}}}
   if(a.stk>=8&&off33(p.x,1,p.z)&&off33(n.tgt[0],1,n.tgt[1])&&free33(n.tgt[0],n.tgt[1])){p.x=n.tgt[0];p.z=n.tgt[1];n.vx=n.vz=0;a.stk=0;a.wp=null;A33.dbg.tele++}}
  else if(mv>.5)a.stk=0}
 if(a.wp&&time<a.until&&Math.hypot(a.wp[0]-p.x,a.wp[1]-p.z)>1){a.sv=n.tgt;n.tgt=a.wp}}}
{const _nu=npcUpd11;npcUpd11=function(dt){if(A33.on&&playing)assist33(dt);_nu(dt);for(const n of NPC11){const a=n.as33;if(a&&a.sv){if(!n.tgt||n.tgt===a.wp)n.tgt=a.sv;a.sv=null}}if(!A33.on||!playing||(typeof L9!=='undefined'&&L9.cine))return;if(level<13||A33.fr<0||time-A33.fr>.3)return;A33.mode33c=time-A33.tT<6;sep33(A33.L,dt,2.1)}}
/* disparos enemigos (vista/oído de la escuadra) y contadores de QA */
{const _s=shootSol;shootSol=function(e,p){const n0=ebul.length,r=_s(e,p);if(e&&ebul.length>n0)e.shot33=time;return r}}/* QA: sólo si de verdad salió una bala (la IA enemiga puede abortar el disparo) */
{const _f=fire30;fire30=function(n,e,d,dt){const m0=n.mag;_f(n,e,d,dt);if(n.mag<m0){A33.dbg.shots+=Math.max(1,m0-n.mag);if(typeof noise33==='function')noise33(n.g.position.x,n.g.position.z,70,'ally');if(n.tg){const q=n.tg.g.position;know33(n.tg,q.x,q.z,true)}}}}
{const _h=hurt;hurt=function(e,d,mode,by){if(by&&by.name&&A33.nm.has(by.name)&&!by.g)A33.dbg.hits++;return _h(e,d,mode,by)}}
{const _k=kill;kill=function(e,...a){try{if(e&&!e.k33&&e.hp<=0&&e.lastBy){const b=e.lastBy;if((b.name&&A33.nm.has(b.name))||(typeof allies!=='undefined'&&allies.indexOf(b)>=0)||(typeof GAR!=='undefined'&&GAR.indexOf(b)>=0)){e.k33=1;A33.dbg.kills++;if(level>=13&&R()<.18){const n=A33.L.find(m=>m.name===b.name);if(n)say33(n,'kill',['¡Lo bajé!','¡Uno menos!','¡Cayó!'],12)}}}}catch(_){}return _k(e,...a)}}
if(typeof noise33==='function'){const _n=noise33;noise33=function(x,z,loud,src){if(src==='enemy'&&Math.hypot(x-A33.ax,z-A33.az)<Math.max(30,loud||0))know33(null,x,z,false);return _n(x,z,loud,src)}}
/* órdenes (T / ORD): mantener fija puntos defendibles; avanzar adelanta la formación y alterna binomios */
{const _o=orderLt;orderLt=function(){const o0=AI30.ord;const r=_o.apply(this,arguments);if(AI30.ord!==o0){A33.reT=0;for(const n of A33.L){n.dp33=null;n.ov33=null}if(AI30.ord==='hold'){const fh=ang33(yaw+Math.PI);A33.fh=fh}}return r}}
/* =====================================================================
   NIVEL 11 · escuadra de instrucción: «seguir» y «cubrir» con formación real
   ===================================================================== */
if(typeof sqOrder11==='function'){const _q=sqOrder11;sqOrder11=function(o,quiet){if(!A33.on||o!=='seguir')return _q(o,quiet);const S=(L11.sq||[]).filter(s=>s.alive);if(!S.length)return _q(o,quiet);
 if(A33.fr!==time){A33.fr=time;A33.los=0}track33();const act=enemies.filter(e=>e.hp>0&&e.active);let thr=null;{let bd=70;for(const e of act){const d=Math.hypot(e.g.position.x-A33.ax,e.g.position.z-A33.az);if(d<bd){bd=d;thr=e}}}
 const sp=Math.hypot(A33.vx,A33.vz);let want=thr?Math.atan2(thr.g.position.x-A33.ax,thr.g.position.z-A33.az):sp>1.1?A33.h:A33.fh;if(A33.lv11!==level){A33.lv11=level;A33.fh=want}A33.fh=ang33(A33.fh+ang33(want-A33.fh)*.6);const fh=A33.fh,fx=Math.sin(fh),fz=Math.cos(fh),rx=-Math.cos(fh),rz=Math.sin(fh);
 const tp=thr?FM33.contact:sp>1.1?FM33.move:FM33.idle,ax=A33.ax+A33.vx*.7,az=A33.az+A33.vz*.7,used=[];const sl=S.map((s,i)=>tp[i%tp.length]).slice().sort((a,b)=>a[0]-b[0]);
 const al=S.map(s=>({s,l:(s.g.position.x-A33.ax)*rx+(s.g.position.z-A33.az)*rz})).sort((a,b)=>a.l-b.l);const list=[];
 for(let i=0;i<al.length;i++){const t=sl[i];let x=ax+rx*t[0]+fx*t[1],z=az+rz*t[0]+fz*t[1],cv=false;if(thr){const c=cover33(x,z,thr.g.position.x,thr.g.position.z,used,5);if(c){x=c[0];z=c[1];cv=true}}
  if(!free33(x,z)){for(const r of[1.5,3]){let ok=false;for(let k=0;k<8;k++){const a=k*.785;if(free33(x+Math.cos(a)*r,z+Math.sin(a)*r)){x+=Math.cos(a)*r;z+=Math.sin(a)*r;ok=true;break}}if(ok)break}}
  used.push([x,z]);list.push([x,z,thr?Math.atan2(thr.g.position.x-x,thr.g.position.z-z):fh,cv])}
 /* el reparto de garAssign es «al más cercano»: el orden lateral evita cruces */posts10(list);L11.ord=o;if(!quiet){say('ESCUADRA: '+o.toUpperCase(),1.6);snd(600,.08,'square',.04)}}}
/* separación y antiatasco de la guarnición/escuadra a pie (11) */
{const _g=garUpd;garUpd=function(dt){_g(dt);if(!A33.on||level!==11||typeof L11==='undefined'||!L11.sq)return;const L=L11.sq.filter(s=>s.alive&&s.g.visible&&!(s.down>0));sep33(L,dt,2.1);const sp=Math.hypot(A33.vx,A33.vz);
 for(const s of L){const p=s.g.position;/* paso de marcha: los reclutas no se quedan atrás cuando el jugador camina */if(L11.ord==='seguir'&&s.post&&sp>1.5){const d=Math.hypot(s.post.x-p.x,s.post.z-p.z),v=Math.hypot(s.vx||0,s.vz||0);if(d>3&&v>1){const bo=Math.min(3.4,sp*1.2-v);if(bo>0){const nx=p.x+s.vx/v*bo*dt,nz=p.z+s.vz/v*bo*dt;if(free33(nx,nz,.45)){p.x=nx;p.z=nz}}}}if(s.nav&&s.nav.fail>0&&Math.hypot(p.x-P.g.position.x,p.z-P.g.position.z)>30&&off33(p.x,1,p.z)){track33();if(tele33(s))s.nav.fail=0}}}}
/* =====================================================================
   NIVELES 1–10 · camaradas y oficial: separación, no estorbar, rescate
   ===================================================================== */
{const _a=allyUpdate;allyUpdate=function(dt){const m0=allies.map(a=>a.mag);_a(dt);if(!A33.on||!playing||level>10)return;allies.forEach((a,i)=>{if(a.name&&a.mag<m0[i])A33.dbg.shots+=m0[i]-a.mag});
 const L=allies.filter(a=>a.name&&a.g.visible&&!(a.down>0)&&!(a.up>0));if(typeof officer!=='undefined'&&officer&&officer.g.visible)L.push(officer);if(level===8&&typeof L8!=='undefined'&&L8.cine)return;
 const pp=P.g.position,k=Math.min(1,dt*5);for(let i=0;i<L.length;i++){const p=L[i].g.position;let mx=0,mz=0;for(let j=0;j<L.length;j++){if(i===j)continue;const q=L[j].g.position,dx=p.x-q.x,dz=p.z-q.z,d=Math.hypot(dx,dz);if(d<2.6&&d>.001){mx+=dx/d*(2.6-d);mz+=dz/d*(2.6-d)}}
  const m=Math.hypot(mx,mz);if(m>.01){const nx=p.x+mx/m*Math.min(m,1.2)*k,nz=p.z+mz/m*Math.min(m,1.2)*k;if(free33(nx,nz,.45)){p.x=nx;p.z=nz;A33.dbg.sep++}}}
 /* atasco prolongado lejos y fuera de cámara: reaparece detrás del jugador */
 if(level!==2&&level!==4&&level!==5)for(const a of allies){if(!a.name||!a.g.visible||a.down>0||!a.nav)continue;const p=a.g.position;if(a.nav.fail>0&&Math.hypot(p.x-pp.x,p.z-pp.z)>45&&off33(p.x,1,p.z)){const fx=-Math.sin(yaw),fz=-Math.cos(yaw);for(let t=0;t<6;t++){const x=pp.x-fx*(12+t*2)+(R()-.5)*6,z=pp.z-fz*(12+t*2)+(R()-.5)*6;if(free33(x,z)&&off33(x,1,z)){p.set(x,0,z);a.vx=a.vz=0;a.nav.fail=0;a.nav.stuck=0;A33.dbg.tele++;break}}}}}}
/* QA: instantánea de la escuadra */
function qa33(){return JSON.stringify({dbg:A33.dbg,mode:A33.pm,ord:AI30.ord,n:A33.L.length,kn:A33.kn.length,trail:A33.trail.length})}
