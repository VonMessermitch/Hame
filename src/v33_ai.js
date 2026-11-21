/* =====================================================================
   v33 · AETHRION COMBAT AI — IA enemiga por capas (sobre el bucle original)
   West (integración) · Field (cerebro individual) · Hammon (navegación y
   coberturas) · Glave (escuadras). Todo va como envoltorios de las funciones
   que ya llama el bucle de enemigos: e8T (objetivo), unstk (dirección),
   shootSol (disparo), findCover (cobertura), animE (pose), hurt/kill.
   API compartida: noise33(x,z,loud,src) y el objeto AI33 (config + depuración).
   ===================================================================== */
const AI33={on:true,v:1,lv:-1,
 cfg:{think:.3,thinkFar:.75,thinkPerFrame:8,rayBudget:12,vis:95,cone:1.15,coneAlert:1.75,rumor:14,grenSq:8,supDecay:.55,barkCD:9,maxNoise:24},
 /* perfiles de habilidad (multiplicadores) */
 prof:{
  RECLUTA:{react:1.45,acc:1.4,aimT:1.1,ear:.8,eye:.85,lead:0,brave:.6,adv:.55,cov:.85,gren:.35,sup:.55,melee:.6},
  REGULAR:{react:1,acc:1,aimT:.8,ear:1,eye:1,lead:.2,brave:.8,adv:.6,cov:1,gren:.6,sup:.8,melee:.8},
  VETERANO:{react:.8,acc:.82,aimT:.6,ear:1.1,eye:1.08,lead:.4,brave:.92,adv:.65,cov:1.15,gren:.85,sup:1,melee:1},
  ELITE:{react:.65,acc:.7,aimT:.45,ear:1.2,eye:1.15,lead:.55,brave:1,adv:.7,cov:1.25,gren:1,sup:1.05,melee:1}},
 /* temperamentos (se multiplican sobre el perfil) */
 temp:{
  AGRESIVO:{adv:1.5,cov:.75,brave:1.15,melee:1.3,sup:.9},
  DEFENSIVO:{adv:.25,cov:1.3,sup:1.25,brave:1.05},
  CAUTELOSO:{adv:.6,cov:1.35,react:1.1,brave:.8,ear:1.15,gren:1.1}},
 /* armas: dispersión base (rad), cargador, recarga, ráfaga, cadencias */
 wpn:{
  rifle:{sp:.014,mag:5,rel:2.6,kb:1,kcd:1.25,kc2:1.25,rng:75},
  sniper:{sp:.009,mag:5,rel:3,kb:1,kcd:2.1,kc2:2,rng:110},
  smg:{sp:.03,mag:32,rel:2.7,kb:3,kcd:.11,kc2:.45,rng:45},
  lmg:{sp:.028,mag:20,rel:3.6,kb:4,kcd:.13,kc2:.35,rng:70},
  mg:{sp:.032,mag:60,rel:5,kb:6,kcd:.1,kc2:.3,rng:80},
  pistol:{sp:.06,mag:8,rel:2,kb:2,kcd:.45,kc2:.7,rng:30}},
 diff:{easy:1.3,normal:1,hard:.85},
 list:[],log:[],sq:{},sqL:[],N:[],rc:0,tk:0,pShot:-99,stepT:0,vehT:0,sqI:0,bark:-99,gr:[],
 dbg:null,
 reset(){this.list.length=0;this.sq={};this.sqL.length=0;this.N.length=0;this.gr.length=0;this.dbg=dbg0E33()},
 stats(){const d=Object.assign({},this.dbg);d.st=Object.assign({},this.dbg.st);d.sf={};for(const k in this.dbg.sf)d.sf[k]=+this.dbg.sf[k].toFixed(1);d.ms=+this.dbg.ms.toFixed(3);d.msAvg=+((this.dbg.msSum||0)/Math.max(1,this.dbg.frames)).toFixed(3);d.msMax=+this.dbg.msMax.toFixed(2);d.squads=this.sqL.length;d.managed=this.list.length;return d},
 /* asignación de perfil: sobreescribible */
 assign:null};
AI33.prof['ÉLITE']=AI33.prof.ELITE;
function dbg0E33(){return{think:0,rays:0,shots:0,sup:0,noLos:0,ff:0,gren:0,grenAT:0,selfK:0,evade:0,melee:0,stuck:0,cvMove:0,flank:0,bound:0,retreat:0,detect:0,reload:0,heard:0,noise:0,st:{},sf:{},ms:0,msMax:0,frames:0}}
AI33.dbg=dbg0E33();
/* ---------- utilidades ---------- */
const aDE33=(a,b)=>{let d=a-b;while(d>Math.PI)d-=6.2832;while(d<-Math.PI)d+=6.2832;return d};
const gsE33=()=>(R()+R()+R()-1.5)*2;/* ~N(0,1) barata */
const PTE33={p:null,h:d=>hitP(d),ok:()=>true};
function pTE33(){PTE33.p=P.g.position;return PTE33}
/* ---------- audición: eventos de ruido ---------- */
function noise33(x,z,loud,src){if(!isFinite(x)||!isFinite(z))return;const N=AI33.N;if(N.length>=AI33.cfg.maxNoise)N.shift();N.push({x,z,r:loud||30,src:src||'player',t:time});AI33.dbg.noise++}
/* ---------- línea de visión con la rejilla de navegación (barata) ---------- */
let RIDE33=0;
function hitSegE33(o,ax,ay,az,dx,dy,dz,L){
 if(o.hw!==undefined){let t0=0,t1=1;
  if(Math.abs(dx)<1e-6){if(ax<o.x-o.hw||ax>o.x+o.hw)return false}else{let u0=(o.x-o.hw-ax)/dx,u1=(o.x+o.hw-ax)/dx;if(u0>u1){const s=u0;u0=u1;u1=s}if(u0>t0)t0=u0;if(u1<t1)t1=u1;if(t0>t1)return false}
  if(Math.abs(dz)<1e-6){if(az<o.z-o.hd||az>o.z+o.hd)return false}else{let u0=(o.z-o.hd-az)/dz,u1=(o.z+o.hd-az)/dz;if(u0>u1){const s=u0;u0=u1;u1=s}if(u0>t0)t0=u0;if(u1<t1)t1=u1;if(t0>t1)return false}
  const e0=.7/L,e1=1-.45/L;if(t0<e0)t0=e0;if(t1>e1)t1=e1;if(t0>t1)return false;
  const y0=ay+dy*t0,y1=ay+dy*t1;return Math.min(y0,y1)<o.h&&Math.max(y0,y1)>(o.y0||0)}
 if(!(o.r>=1))return false;const qx=o.x-ax,qz=o.z-az;let t=(qx*dx+qz*dz)/(L*L);if(t<.7/L||t>1-.45/L)return false;const cx=ax+dx*t-o.x,cz=az+dz*t-o.z;return cx*cx+cz*cz<o.r*o.r&&ay+dy*t<1.1}
function losE33(ax,ay,az,bx,by,bz){AI33.rc++;AI33.dbg.rays++;if(typeof NV==='undefined')return losClear(ax,ay,az,bx,by,bz);RIDE33++;const C=NV.cell,dx=bx-ax,dy=by-ay,dz=bz-az,L=Math.hypot(dx,dz);if(L<1.2)return true;
 const n=Math.ceil(L/(C*.45));let li=1e9,lj=1e9;for(let i=0;i<=n;i++){const t=i/n,ci=Math.floor((ax+dx*t)/C),cj=Math.floor((az+dz*t)/C);if(ci===li&&cj===lj)continue;li=ci;lj=cj;const A=NV.m.get(ci+','+cj);if(!A)continue;
  for(let k=0;k<A.length;k++){const o=A[k];if(o._r33===RIDE33)continue;o._r33=RIDE33;if(hitSegE33(o,ax,ay,az,dx,dy,dz,L))return false}}return true}
/* ---------- elegibilidad y alta ---------- */
function okE33(e){return AI33.on&&e.type==='sol'&&!e.xbow&&!e.cine&&!e.sab&&!e.sab9&&!e.crew22&&!e.boss9&&!e.boss10&&!e.inBk&&!e.ret17&&!(level===6&&e.siege)}
function wcE33(e){if(e.k8==='bar')return e.mg9||e.kind17==='mg'&&e.hold?'mg':'lmg';if(e.k8==='stv'||e.k8==='gren')return 'smg';if(e.snip)return 'sniper';return 'rifle'}
function roleE33(e){const k=e.kind17||'';if(k==='officer'||e.capt||/oficial/.test(e.k8n||''))return 'leader';if(k==='mg'||e.k8==='bar'||e.mg9)return 'mg';if(k==='gren'||e.k8==='gren')return 'grenadier';if(k==='eng')return 'at';if(k==='scout')return 'scout';if(e.snip)return 'marksman';if(k==='assault'||k==='naval'||e.k8==='stv')return 'assault';return 'rifle'}
function profE33(e,role){if(AI33.assign){try{const r=AI33.assign(e,role);if(r)return r}catch(er){}}
 const df=difficulty,r=R();let sk=df==='easy'?(r<.6?'RECLUTA':'REGULAR'):df==='hard'?(r<.25?'REGULAR':r<.8?'VETERANO':'ELITE'):(r<.22?'RECLUTA':r<.8?'REGULAR':'VETERANO');
 if(role==='leader'||role==='marksman')sk=sk==='RECLUTA'?'REGULAR':sk==='REGULAR'?'VETERANO':'ELITE';
 let tp=null;if(role==='assault'||e.kind17==='naval')tp='AGRESIVO';else if(role==='mg'||e.hold)tp='DEFENSIVO';else if(role==='scout'||role==='marksman'||level===13)tp='CAUTELOSO';else{const q=R();tp=q<.18?'AGRESIVO':q<.36?'CAUTELOSO':null}
 return {sk,tp}}
function mkProfE33(sk,tp){const b=Object.assign({},AI33.prof[sk]||AI33.prof.REGULAR),t=tp&&AI33.temp[tp];if(t)for(const k in t)b[k]=(b[k]||1)*t[k];b.name=sk+(tp?'/'+tp:'');return b}
function sqKeyE33(e){const p=e.g.position;return (e.t13||e.t10||'')+'|'+Math.floor(p.x/60)+','+Math.floor(p.z/60)}
function joinSqE33(e,a){let k=sqKeyE33(e),s=AI33.sq[k],i=0;while(s&&s.m.length>=7){i++;s=AI33.sq[k+'#'+i]}if(!s){k=i?k+'#'+i:k;s=AI33.sq[k]={k,m:[],n0:0,ld:null,lkx:0,lkz:0,lkT:-99,know:0,el:0,elT:time+3,fl:null,flT:0,fside:R()<.5?1:-1,gT:time+4,svT:-99,retT:0,retN:0,mor:1,ldDead:0,tick:0,vis:0};AI33.sqL.push(s)}
 s.m.push(e);s.n0=Math.max(s.n0,s.m.length);a.sq=s;if(a.role==='leader'||!s.ld)s.ld=e}
function initE33(e,T0){const role=roleE33(e),wc=wcE33(e),W=AI33.wpn[wc],pr=profE33(e,role),pf=mkProfE33(pr.sk,pr.tp),p=e.g.position,t=T0&&T0.p?T0:pTE33();
 const a={s:'ALERT',sT:time,decT:0,know:2,aw:.5,vis:0,visT:-99,acq:-99,lkx:t.p.x+(R()-.5)*14,lkz:t.p.z+(R()-.5)*14,lkT:time-6,think:R()*.3,hearT:time,role,wc,W,pf,
  mag:W.mag,rel:0,sup:0,supT:-99,cov:null,sq:null,T:t,tg:{p:new T.Vector3(),h:t.h,ok:t.ok},bp:new T.Vector3(),look:new T.Vector3(p.x+Math.sin(e.g.rotation.y)*10,p.y,p.z+Math.cos(e.g.rotation.y)*10),
  self:0,mx:0,mz:0,ix:0,iz:0,hf:e.g.rotation.y,gT:time+5+R()*8,gn:role==='grenadier'?3:role==='at'?2:role==='assault'||role==='leader'?1+(R()<.4?1:0):R()<.55?1:0,
  ord:'',fls:1,rxT:0,svT:-99,ph:'',phT:0,rgx:0,rgz:0,cvRef:null,cvPend:null,invT:0,melT:0,actT:0,evx:0,evz:0,evE:0,evR:0,ffT:-99,nx:0,bs:0,lastShot:-99,cvT:0,cvN:0,lx:p.x,lz:p.z,stT:0,stk:0,cmp:0,shT:0,shx:0,shz:0,d:50,hitT:-99,ret:0,grA:null};
 /* aparecidos por sorpresa tras un sigilo: si vio al jugador, contacto; si no, avisado */
 if(e.sus>=1&&t.p===P.g.position){a.know=3;a.lkx=t.p.x;a.lkz=t.p.z;a.lkT=time;a.aw=1}
 e.a33=a;e.gcd=1e9;e.kb=W.kb;e.kcd=W.kcd;e.kc2=W.kc2;if(!e.k8&&wc==='rifle'){a.W=Object.assign({},W,{mag:8,kb:2,kcd:.45})}
 joinSqE33(e,a);AI33.list.push(e);return a}
/* ---------- coberturas (Hammon) ---------- */
let CSE33=0;
function covPtsE33(e,a,tx,tz,R_,out){const p=e.g.position;out.length=0;CSE33++;
 if(typeof covers!=='undefined')for(const c of covers){const dx=c.x-p.x,dz=c.z-p.z;if(dx*dx+dz*dz>R_*R_)continue;const vx=c.x-tx,vz=c.z-tz,l=Math.hypot(vx,vz)||1,k=c.r+.85;out.push({x:c.x+vx/l*k,z:c.z+vz/l*k,low:1,ox:c.x,oz:c.z,b:c})}
 if(typeof NV!=='undefined'){const C=NV.cell,i0=Math.floor((p.x-R_)/C),i1=Math.floor((p.x+R_)/C),j0=Math.floor((p.z-R_)/C),j1=Math.floor((p.z+R_)/C);
  for(let i=i0;i<=i1;i++)for(let j=j0;j<=j1;j++){const A=NV.m.get(i+','+j);if(!A)continue;for(const o of A){if(o._c33===CSE33)continue;o._c33=CSE33;if(o.hw===undefined)continue;if(o.h<.9||o.hw>16||o.hd>16||o.veh32&&o.veh32.alive)continue;
   const vx=o.x-tx,vz=o.z-tz,tall=o.h>1.32?1:0;let fx,fz,lat,nx=0,nz=0;
   if(Math.abs(vx)/(o.hw+.01)>Math.abs(vz)/(o.hd+.01)){nx=Math.sign(vx);fx=o.x+nx*(o.hw+.7);lat=o.hd;for(const s of tall?[-1,1]:[0,1]){const z=s===0?clamp(p.z,o.z-o.hd+.5,o.z+o.hd-.5):o.z+s*Math.max(0,o.hd-.55);out.push({x:fx,z,low:!tall,ox:o.x,oz:o.z,b:o,px:fx-nx*.2,pz:z+s*1.3,cor:s!==0})}}
   else{nz=Math.sign(vz);fz=o.z+nz*(o.hd+.7);for(const s of tall?[-1,1]:[0,1]){const x=s===0?clamp(p.x,o.x-o.hw+.5,o.x+o.hw-.5):o.x+s*Math.max(0,o.hw-.55);out.push({x,z:fz,low:!tall,ox:o.x,oz:o.z,b:o,px:x+s*1.3,pz:fz-nz*.2,cor:s!==0})}}}}}
 if(level===17&&typeof K17!=='undefined'&&K17&&Array.isArray(K17.cover)){const X=typeof XL17!=='undefined'?XL17:0;for(const c of K17.cover){const cx=X+(c.x!==undefined?c.x:c[0]),cz=c.z!==undefined?c.z:c[1];const dx=cx-p.x,dz=cz-p.z;if(dx*dx+dz*dz>R_*R_)continue;out.push({x:cx,z:cz,low:1,ox:cx-(cx-tx)*.05,oz:cz-(cz-tz)*.05,b:null})}}
 return out}
const CPE33=[],TOPE33=[];
function resdE33(e,x,z){let n=0;for(const o of AI33.list){if(o===e||!o.a33)continue;const c=o.a33.cov;if(c){const dx=c.x-x,dz=c.z-z,q=dx*dx+dz*dz;if(q<4.8)return -1;if(q<16)n++}const op=o.g.position,dx=op.x-x,dz=op.z-z;if(dx*dx+dz*dz<2.2&&o.a33.s!=='DEAD')n+=.5}return n}
/* mode: near | adv | flank | far | regroup */
function pickCoverE33(e,a,mode,cx,cz){const p=e.g.position,tx=a.lkx,tz=a.lkz,dCur=Math.hypot(p.x-tx,p.z-tz),R_=mode==='far'?44:mode==='flank'?34:30;
 const L=covPtsE33(e,a,tx,tz,R_,CPE33);if(!L.length)return null;const pref={rifle:28,sniper:42,smg:15,lmg:30,mg:32,pistol:12}[a.wc]||25,minD=a.wc==='smg'?6:9,ang0=Math.atan2(p.x-tx,p.z-tz);
 const top=TOPE33;top.length=0;
 for(const c of L){const dt=Math.hypot(c.x-tx,c.z-tz);if(dt<minD)continue;const de=Math.hypot(c.x-p.x,c.z-p.z);if(de>R_)continue;
  if(typeof blockedAt==='function'&&blockedAt(c.x,c.z,.38))continue;const rs=resdE33(e,c.x,c.z);if(rs<0)continue;
  let s=de*.9+rs*5+R()*3+(c.low?0:c.cor?-1:7);
  if(mode==='near')s+=Math.abs(dt-pref)*.35;
  else if(mode==='adv'){if(dt>dCur-4)continue;s+=Math.abs(dt-Math.max(minD+2,Math.min(pref,dCur-9)))*.45}
  else if(mode==='flank'){const an=Math.atan2(c.x-tx,c.z-tz),want=ang0+a.fls*1.25;s+=Math.abs(aDE33(an,want))*16+Math.abs(dt-Math.min(pref,dCur))*.3}
  else if(mode==='far'){if(dt<dCur+6)continue;s-=Math.min(dt-dCur,30)*.6}
  else if(mode==='regroup'){s+=Math.hypot(c.x-cx,c.z-cz)*1.1+Math.abs(dt-pref)*.2}
  const mx=(p.x+c.x)*.5-tx,mz=(p.z+c.z)*.5-tz;if(mx*mx+mz*mz<64)s+=18;
  const bx=c.ox-c.x,bz=c.oz-c.z,ux=tx-c.x,uz=tz-c.z;if(bx*ux+bz*uz<=0)s+=30;
  c.s=s;if(top.length<4){top.push(c);top.sort((u,v)=>u.s-v.s)}else if(s<top[3].s){top[3]=c;top.sort((u,v)=>u.s-v.s)}}
 if(!top.length)return null;
 /* protección (agachado) y tiro (de pie / desde la esquina): rayos reales, presupuestados */
 let best=null,prot=null,nr=0;
 for(const c of top){if(nr>=7)break;const pr=!losE33(tx,1.45,tz,c.x,.95,c.z);nr++;if(!pr)continue;if(!prot)prot=c;if(mode==='far'){best=c;break}
  const sx=c.cor&&c.px!==undefined?c.px:c.x,sz=c.cor&&c.pz!==undefined?c.pz:c.z;nr++;if(losE33(sx,1.62,sz,tx,1.3,tz)){best=c;break}}
 best=best||prot||top[0];AI33.rc=Math.max(0,AI33.rc-nr+1);
 if(!best)return null;return {x:best.x,z:best.z,low:best.low,px:best.px,pz:best.pz,cor:best.cor,ox:best.ox,oz:best.oz,h:best.b&&best.b.h||1,tree:best.tree,t:time}}
function setCovE33(e,a,c,why){if(!c)return false;a.cov=c;e.cv={x:c.x,z:c.z};a.cvRef=a.cvPend=e.cv;e.st='cover';e.alert=0;a.cvT=time;a.cvN++;AI33.dbg.cvMove++;return true}
/* cobertura comprometida: la amenaza quedó del mismo lado */
function covBadE33(a){const c=a.cov;if(!c)return true;const bx=c.ox-c.x,bz=c.oz-c.z,ux=a.lkx-c.x,uz=a.lkz-c.z,l=Math.hypot(ux,uz)||1;return (bx*ux+bz*uz)/(Math.hypot(bx,bz)*l+.01)<.15}
/* ---------- percepción (Field) ---------- */
function fogKE33(){const f=scene.fog;let k=1;if(f&&f.far)k=clamp(f.far*.9/AI33.cfg.vis,.35,1.25);else if(f&&f.density)k=clamp(2.2/f.density/AI33.cfg.vis,.3,1.2);if(level===16)k*=.7;return k}
function seeE33(e,a,dt){const p=e.g.position,q=a.T.p;if(!q)return;const dx=q.x-p.x,dz=q.z-p.z,d=Math.hypot(dx,dz);a.d=d;const isP=q===P.g.position;let st=1;
 if(isP){st=P.pr?.42:P.cr?.62:1;if(P.cover&&(P.cr||P.pr))st*=.75;const sp=Math.hypot(P.mvx||0,P.mvz||0);if(sp>5.5)st*=1.25;else if(sp<.5)st*=.85;if(time-AI33.pShot<1.2)st=Math.max(st,1.6)}
 const rng=AI33.cfg.vis*AI33.fk*a.pf.eye*Math.min(1.3,st);let ok=d<rng;
 if(ok&&d>3.5){const cone=a.know>=2?AI33.cfg.coneAlert:AI33.cfg.cone;if(Math.abs(aDE33(Math.atan2(dx,dz),e.g.rotation.y))>cone)ok=false}
 if(ok){if(AI33.rc>=AI33.cfg.rayBudget){if(time-a.visT>.7)a.vis=0;return}const ty=q.y+(isP?(P.pr?.35:P.cr?.9:1.35):1.25);ok=losE33(p.x,p.y+1.62*(e.s||1),p.z,q.x,ty,q.z)}
 if(!ok){a.vis=0;a.aw=Math.max(a.know>=2?.5:0,a.aw-dt*.12);return}
 const rec=a.pf.react*(.22+d/42)/st*(a.know>=2?.38:1);a.aw+=dt/Math.max(.05,rec);if(d<2.5)a.aw=1;
 if(a.aw>=1){a.aw=1;if(!a.vis&&time-a.visT>1.6){a.acq=Math.hypot(q.x-a.lkx,q.z-a.lkz)<3&&time-a.visT<8?time-a.pf.aimT*.5:time;a.rxT=time+a.pf.react*(.2+R()*.35);if(a.know<3){AI33.dbg.detect++;if(!AI33.t1)AI33.t1=time;e.alert=Math.max(e.alert||0,a.pf.react*(.18+R()*.3))}}a.vis=1;a.visT=a.svT=time;a.lkx=q.x;a.lkz=q.z;a.lkT=time;a.know=3}
 else if(a.aw>.35&&a.know<1){a.know=1;a.ix=q.x+(R()-.5)*6;a.iz=q.z+(R()-.5)*6}}
function hearE33(e,a){const p=e.g.position,N=AI33.N;for(let i=N.length-1;i>=0;i--){const n=N[i];if(n.t<=a.hearT)break;const d=Math.hypot(n.x-p.x,n.z-p.z),r=n.r*a.pf.ear;if(d>r)continue;const k=1-d/r;
  if(n.src==='enemy'||n.src==='death'){if(a.know<2&&a.sq&&a.sq.lkT>time-20){a.know=2;a.lkx=a.sq.lkx;a.lkz=a.sq.lkz;a.lkT=a.sq.lkT}else if(a.know<1){a.know=1;a.ix=n.x;a.iz=n.z}continue}
  AI33.dbg.heard++;const err=d*.13+2;
  if((n.src==='player'||n.src==='ally'||n.src==='step'&&k>.55)&&k>.35){if(!a.vis&&time-a.visT>1){a.lkx=n.x+(R()-.5)*err;a.lkz=n.z+(R()-.5)*err;a.lkT=Math.max(a.lkT,time-1.5)}if(a.know<2)a.know=2}
  else if(a.know<1){a.know=1;a.ix=n.x+(R()-.5)*err;a.iz=n.z+(R()-.5)*err}}
 a.hearT=time}
/* ---------- granadas (Field): sólo con una oportunidad válida ---------- */
function grenOKE33(e,a,tx,tz,d){if(a.gn<=0||time<a.gT||!a.sq||time<a.sq.gT||d<11||d>27*(a.pf.gren>.9?1.12:1))return false;
 for(const o of enemies){if(o===e||o.hp<=0)continue;if(Math.hypot(o.g.position.x-tx,o.g.position.z-tz)<7.5)return false}
 const p=e.g.position,t=1.15+d*.016,y0=p.y+2.1,vy=(9*t*t-y0)/t,ap=y0+vy*vy/36,mx=(p.x+tx)*.5,mz=(p.z+tz)*.5;if(AI33.rc>AI33.cfg.rayBudget)return false;
 return losE33(p.x,y0,p.z,mx,ap,mz)&&losE33(mx,ap,mz,tx,.8,tz)}
function throwE33(e,a,tx,tz,veh){const p=e.g.position,d=Math.hypot(tx-p.x,tz-p.z),er=(1.2+d*.06)*a.pf.acc;tx+=gsE33()*er*.7;tz+=gsE33()*er*.7;const t=1.15+d*.016,y0=p.y+2.1,pos=new T.Vector3(p.x,y0,p.z);
 const m=window.mkStickG?mkStickG():new T.Mesh(typeof egrG!=='undefined'?egrG:new T.SphereGeometry(.22,8,6),typeof egrM!=='undefined'?egrM:new T.MeshLambertMaterial({color:0x3a4a22}));m.position.copy(pos);scene.add(m);
 const g={m,pos,v:new T.Vector3((tx-p.x)/t,(9*t*t-y0)/t,(tz-p.z)/t),fuse:t};egr.push(g);AI33.gr.push({g,veh,by:e,t:time});a.gn--;a.gT=time+14+R()*8;if(a.sq)a.sq.gT=time+AI33.cfg.grenSq;AI33.dbg.gren++;if(veh)AI33.dbg.grenAT++;
 if(time-AI33.bark>4&&R()<.6){AI33.bark=time;feed(veh?'¡Carga contra el blindado!':'¡Granada enemiga!')}snd(300,.1,'square',.04);noise33(p.x,p.z,15,'enemy')}
function grenUpdE33(){const G=AI33.gr;for(let i=G.length-1;i>=0;i--){const r=G[i];if(egr.indexOf(r.g)>=0)continue;G.splice(i,1);const q=r.g.pos;noise33(q.x,q.z,140,'boom');for(const o of enemies)if(o.hp>0&&Math.hypot(o.g.position.x-q.x,o.g.position.z-q.z)<5)AI33.dbg.selfK++;
  if(r.veh&&r.veh.alive&&typeof VEH32!=='undefined'&&VEH32.dmg){const vp=r.veh.g.position;if(Math.hypot(vp.x-q.x,vp.z-q.z)<4.5)try{VEH32.dmg(r.veh,700,'g',q.x,q.z)}catch(er){}}}}
/* ---------- vehículos hostiles para los AT ---------- */
function hostVehE33(p,r){if(typeof VEH32==='undefined'||!VEH32||!VEH32.list)return null;let b=null,bd=r;for(const v of VEH32.list){if(!v.alive||!v.on||!v.ally||v.type==='ship')continue;const d=Math.hypot(v.g.position.x-p.x,v.g.position.z-p.z);if(d<bd){bd=d;b=v}}return b}
/* ---------- decisión (Field + órdenes de Glave) ---------- */
function setSE33(a,s,dur){if(a.s!==s){a.s=s;a.sT=time;AI33.dbg.st[s]=(AI33.dbg.st[s]||0)+1}a.decT=time+(dur||1.4)+R()*.6}
const SELFE33={GUARD:1,INVESTIGATE:1,SEARCH:1,SUPPRESS:1,EVADE:1,MELEE:1,GRENADE:1,HOLD:1,ENGAGE:1,ALERT:1,PANIC:1};
const MOVEE33={TAKE_COVER:1,ADVANCE:1,FLANK:1,RETREAT:1,REGROUP:1};
function moveE33(e,a,mode,why,dur){const c=pickCoverE33(e,a,mode,a.rgx,a.rgz);if(!setCovE33(e,a,c))return false;setSE33(a,why,dur||2);return true}
function thinkE33(e,a,dt){AI33.dbg.think++;const p=e.g.position;seeE33(e,a,dt);hearE33(e,a);
 if(a.shT&&time>=a.shT){a.shT=0;if(!a.vis&&a.shL>a.lkT){a.lkx=a.shx;a.lkz=a.shz;a.lkT=a.shL;if(a.know<2)a.know=2}}
 e.gcd=1e9;
 const tx=a.lkx,tz=a.lkz,dl=Math.hypot(tx-p.x,tz-p.z),age=time-a.lkT,s=a.s,sq=a.sq,pf=a.pf;
 if((s==='MELEE'||s==='GRENADE'||s==='EVADE')&&time<a.actT)return;
 if(a.vis&&a.d<2.1&&time>a.melT&&!e.hold){setSE33(a,'MELEE',.5);a.actT=time+.55;a.melT=time+1.6;a.mh=0;AI33.dbg.melee++;return}
 if(a.rel>0&&!e.hold&&!a.cov&&!MOVEE33[s]){if(moveE33(e,a,'near','TAKE_COVER',1.2))return}
 const passive=s==='GUARD'||s==='INVESTIGATE'||s==='SEARCH'||s==='ALERT';
 if(time<a.decT&&!(a.vis&&passive))return;
 if(a.know<=0){setSE33(a,'GUARD',2);return}
 if(a.know===1){if(s!=='INVESTIGATE'){a.ix=a.ix||tx;a.iz=a.iz||tz;a.invT=time}setSE33(a,'INVESTIGATE',2.5);if(time-a.invT>14){a.know=0;a.ix=0}return}
 /* retirada y reagrupamiento de escuadra */
 if(sq&&sq.retT>time&&!e.hold&&!e.keep17){if(s!=='RETREAT'){if(!moveE33(e,a,'far','RETREAT',3)){e.cv={x:p.x+(p.x-tx)/(dl||1)*25,z:p.z+(p.z-tz)/(dl||1)*25};a.cvRef=e.cv;e.st='cover';setSE33(a,'RETREAT',3)}AI33.dbg.retreat++}return}
 if(s==='RETREAT'&&sq){const c=centroidE33(sq);a.rgx=c[0];a.rgz=c[1];if(!moveE33(e,a,'regroup','REGROUP',3))setSE33(a,'ALERT',2);return}
 /* pánico bajo fuego intenso */
 if(a.sup>2.4&&pf.brave<.85&&R()<.45&&a.cov&&s!=='PANIC'){setSE33(a,'PANIC',2+R()*1.5);a.ph='hide';return}
 /* blindado cerca: AT / granaderos lo atacan; el resto se cubre */
 const veh=hostVehE33(p,30);
 if(veh&&(a.role==='at'||a.role==='grenadier')&&a.gn>0&&time>a.gT){const vp=veh.g.position,dv=Math.hypot(vp.x-p.x,vp.z-p.z);if(dv>8){a.grA={x:vp.x,z:vp.z,v:veh};setSE33(a,'GRENADE',.8);a.actT=time+.75;return}}
 /* granada: objetivo a cubierto, agrupado o quieto en posición conocida */
 if(age<5&&a.gn>0&&time>a.gT&&R()<pf.gren*.5){const cl=clusE33(tx,tz);if((!a.vis||cl>=2||P.cover&&a.T.p===P.g.position)&&grenOKE33(e,a,tx,tz,dl)){a.grA={x:tx,z:tz,v:null};setSE33(a,'GRENADE',.8);a.actT=time+.75;return}}
 const inCov=a.cov&&Math.hypot(p.x-a.cov.x,p.z-a.cov.z)<2.2;
 /* cobertura comprometida (flanqueado / castigado dentro de ella) */
 if(inCov&&(SELFE33[s])&&!e.hold&&(covBadE33(a)||a.cmp>1)){a.cmp=0;if(moveE33(e,a,'near','TAKE_COVER',1.5))return}
 if(MOVEE33[s]&&e.st==='cover'&&time-a.cvT<9)return;/* sigue moviéndose a su punto */
 if(inCov&&SELFE33[s]&&!e.hold&&time-a.visT>6&&time-a.cvT>6&&sq&&time-sq.lkT<3){a.cov=null;if(moveE33(e,a,'near','TAKE_COVER',1.5))return}/* desde aquí no se le ve: cambiar de posición */
 const contact=a.vis||age<3;
 if(contact){
  if(a.ord==='flank'&&!e.hold&&s!=='FLANK'&&dl>14){if(moveE33(e,a,'flank','FLANK',4)){AI33.dbg.flank++;a.ord='';if(time-AI33.bark>AI33.cfg.barkCD&&R()<.5){AI33.bark=time;feed('El enemigo intenta flanquear')}return}a.ord=''}
  if(a.ord==='bound'&&!e.hold&&dl>18&&time-a.cvT>4){if(moveE33(e,a,'adv','ADVANCE',3)){AI33.dbg.bound++;return}}
  if(!inCov&&!e.hold){if(moveE33(e,a,'near','TAKE_COVER',1.5))return;
   if(a.role==='assault'&&pf.adv>.9&&dl<24){e.st='fire';setSE33(a,'ASSAULT',2.5);return}
   setSE33(a,'HOLD',2);return}
  if(a.role==='mg'&&!a.vis&&age<5&&time-Math.max(a.svT,sq?sq.svT:-99)<5&&time>(a.supN||0)){setSE33(a,'SUPPRESS',2.5+R()*1.5);a.supN=time+6;AI33.dbg.sup++;return}
  if(s!=='ENGAGE')a.ph='hide';setSE33(a,'ENGAGE',1.5);return}
 if(age<6&&time-Math.max(a.svT,sq?sq.svT:-99)<6&&(a.role==='mg'||pf.sup*R()>.5)&&time>(a.supN||0)&&dl<a.W.rng&&(inCov||e.hold)){setSE33(a,'SUPPRESS',2+R()*1.5);a.supN=time+7+R()*4;AI33.dbg.sup++;return}
 if(dl<10&&!e.hold){if(s!=='SEARCH'){a.ix=tx+(R()-.5)*12;a.iz=tz+(R()-.5)*12}setSE33(a,'SEARCH',3);return}
 const go=!e.hold&&(a.ord==='bound'||pf.adv*(e.goal17?1.4:1)>.75||age>12&&pf.adv>.4);
 if(go&&time-a.cvT>3.5){if(moveE33(e,a,'adv','ADVANCE',3)){AI33.dbg.bound++;return}if(dl>24){e.st='adv';e.tm=2.5;a.cov=null;setSE33(a,'ADVANCE',2.5);return}a.ix=tx+(R()-.5)*10;a.iz=tz+(R()-.5)*10;setSE33(a,'SEARCH',3);return}
 if(!inCov&&!e.hold){if(moveE33(e,a,'near','TAKE_COVER',1.5))return}
 if(s!=='ALERT')a.ph='hide';setSE33(a,'ALERT',1.8)}
function clusE33(x,z){let n=0;if(Math.hypot(P.g.position.x-x,P.g.position.z-z)<5.5)n++;if(typeof L9!=='undefined'&&L9.tgts)for(const t of L9.tgts){if(t.ok&&t.ok()&&Math.hypot(t.p.x-x,t.p.z-z)<5.5)n++}return n}
function centroidE33(sq){let x=0,z=0,n=0;for(const o of sq.m){x+=o.g.position.x;z+=o.g.position.z;n++}return n?[x/n,z/n]:[0,0]}
/* disparo con cadencia propia (ráfagas, pausas, tiempo de reacción) */
function fireE33(e,a,p,vis,sup){if(e.cd>0||a.rel>0||time<a.nx||time<a.rxT)return;if(!vis&&!sup&&time-a.lkT>2.2)return;if(a.d>a.W.rng&&vis)return;
 shootSol(e,p);if(a.bl>0){a.nx=time+a.W.kcd*(.9+R()*.25);a.bl--}else{a.bl=Math.max(0,Math.round((a.W.kb+Math.floor(R()*a.W.kb))*(a.d>35&&a.W.kb>1?.5:1))-1);a.nx=time+(a.W.kb>1?.55+R()*.7:a.W.kc2*(.85+R()*.4))}}
/* ---------- cada cuadro: aplicar el estado ---------- */
function frameE33(e,a,dt){const p=e.g.position;
 if(a.rel>0){a.rel-=dt;if(a.rel<=0){a.rel=0;a.mag=a.W.mag}}
 a.sup=Math.max(0,a.sup-dt*AI33.cfg.supDecay);if(e.sup33&&time-e.sup33<.4)a.sup+=dt*1.2;
 /* órdenes externas (tácticas de misión, reacciones a heridas): se respetan */
 if(e.st==='cover'&&e.cv&&e.cv!==a.cvRef){a.cvRef=e.cv;if(e.cv!==a.cvPend||!a.cov)a.cov={x:e.cv.x,z:e.cv.z,ox:NaN,oz:NaN,low:1};a.cvT=time;if(!MOVEE33[a.s])setSE33(a,'TAKE_COVER',2)}
 /* llegada a la cobertura */
 if(MOVEE33[a.s]&&(e.st==='hide'||e.st==='peek'||a.cov&&Math.hypot(p.x-a.cov.x,p.z-a.cov.z)<.9)){a.ph='hide';a.phT=time+.25+R()*.4;setSE33(a,a.s==='RETREAT'?'RETREAT':'ENGAGE',a.s==='RETREAT'?2:1);if(a.s==='RETREAT')a.s='ENGAGE'}
 if(a.s==='ASSAULT'&&e.st!=='fire'&&e.st!=='adv')setSE33(a,'ENGAGE',.5);
 const s=a.s,self=!!SELFE33[s];a.self=self;a.mx=a.mz=0;a.cr=0;
 const vis=a.vis&&time-a.visT<.6;
 if(self){if(!(e.stun>0))e.alert=Math.max(e.alert||0,.02);
  switch(s){
   case 'GUARD':{const h=a.hf+Math.sin(time*.35+e.t)*.9;a.look.set(p.x+Math.sin(h)*10,p.y,p.z+Math.cos(h)*10);break}
   case 'INVESTIGATE':case 'SEARCH':{const dx=a.ix-p.x,dz=a.iz-p.z,d=Math.hypot(dx,dz);if(d>1.4){const k=s==='SEARCH'?.62:.45;a.mx=dx/d*k;a.mz=dz/d*k;a.look.set(a.ix,p.y,a.iz)}else{const h=Math.atan2(dx,dz)+Math.sin(time*.8+e.t)*1.3;a.look.set(p.x+Math.sin(h)*10,p.y,p.z+Math.cos(h)*10);if(s==='SEARCH'&&time-a.sT>2.5){a.ix=a.lkx+(R()-.5)*16;a.iz=a.lkz+(R()-.5)*16;a.sT=time}}break}
   case 'ENGAGE':case 'ALERT':case 'PANIC':case 'SUPPRESS':case 'HOLD':{const c=a.cov,sup=s==='SUPPRESS';
    if(!a.ph){a.ph='hide';a.phT=time+.4}
    if(s==='HOLD'){a.ph='peek';a.cr=vis?0:1}
    if(sup)a.ph='peek';
    if(a.ph==='hide'){a.cr=1;if(c&&!e.hold){const dx=c.x-p.x,dz=c.z-p.z,d=Math.hypot(dx,dz);if(d>.45&&d<4){a.mx=dx/d*.5;a.mz=dz/d*.5}}
     a.look.set(a.lkx,1,a.lkz);
     if(time>=a.phT&&a.rel<=0&&a.sup<1.7&&s!=='PANIC'){const want=vis||time-a.lkT<2.5||s==='ALERT'&&R()<.5;if(want){a.ph='peek';a.phT=time+1.2+R()*1.1}else a.phT=time+.6+R()*.8}}
    else{if(c&&c.cor&&c.px!==undefined&&!e.hold&&s!=='HOLD'){const dx=c.px-p.x,dz=c.pz-p.z,d=Math.hypot(dx,dz);if(d>.4&&d<4){a.mx=dx/d*.55;a.mz=dz/d*.55}}
     if(vis)a.look.copy(a.T.p);else a.look.set(a.lkx,1,a.lkz);
     if(s!=='ALERT'||vis)fireE33(e,a,p,vis,sup&&time-a.lkT<8);
     if(!sup&&s!=='HOLD'&&(time>=a.phT||a.rel>0||a.sup>2.2||!vis&&time-a.visT>1.6&&time-a.lkT>2.5)){a.ph='hide';a.phT=time+(.7+R()*1.1)*a.pf.cov+(a.sup>1?.8:0)+(a.rel>0?a.rel:0)}
     if(s==='HOLD'&&a.rel>0)a.cr=1}
    if(sup&&vis&&time-a.sT>.8)a.decT=0;break}
   case 'EVADE':{const dx=p.x-a.evx,dz=p.z-a.evz,d=Math.hypot(dx,dz)||1;a.mx=dx/d;a.mz=dz/d;a.look.set(p.x+dx/d*6,p.y,p.z+dz/d*6);if(time>a.evE){a.decT=0;a.actT=0;a.s='ALERT';a.cov=null}break}
   case 'MELEE':{const q=a.T.p;a.look.copy(q);const dx=q.x-p.x,dz=q.z-p.z,d=Math.hypot(dx,dz)||1;if(time<a.actT-.25){a.mx=dx/d*.6;a.mz=dz/d*.6}e.aim=.3;
    if(!a.mh&&time>=a.actT-.2){a.mh=1;if(d<2.6){try{a.T.h(13)}catch(er){}snd(180,.1,'square',.05);burst(q.x,1.3,q.z,0xaa2222,3,.25,2)}}if(time>=a.actT){a.decT=0;a.s='ENGAGE';a.ph='hide'}break}
   case 'GRENADE':{const g=a.grA;if(g)a.look.set(g.x,1,g.z);e.aim=.3;if(time>=a.actT){if(g)throwE33(e,a,g.v?g.v.g.position.x:g.x,g.v?g.v.g.position.z:g.z,g.v);a.grA=null;a.decT=0;a.s='ENGAGE';a.ph='hide'}break}}}
 /* objetivo creído: lo real si se ve; si no, la última posición conocida */
 const tg=a.tg;tg.h=a.T.h;tg.ok=a.T.ok;
 if(self)tg.p=(vis&&s!=='GUARD'&&s!=='INVESTIGATE'&&s!=='SEARCH'&&s!=='EVADE')?a.T.p:a.look;else if(vis)tg.p=a.T.p;else{a.bp.set(a.lkx,0,a.lkz);tg.p=a.bp}
 e.tp8=tg.p;
 /* atascos y coberturas inalcanzables */
 a.stT+=dt;if(a.stT>1){const mv=Math.hypot(p.x-a.lx,p.z-a.lz),want=Math.hypot(a.mx,a.mz)>.3||(!self&&(e.st==='cover'||e.st==='adv'));a.lx=p.x;a.lz=p.z;a.stT=0;
  if(want&&mv<.3&&!e.hold&&!(e.stun>0)){a.stk++;if(a.stk>=2){AI33.dbg.stuck++;a.stk=0;if(!self&&e.st==='cover'){const old=a.cov;a.cov=null;if(!moveE33(e,a,'near','TAKE_COVER',1.5)){a.cov=old;setSE33(a,'ALERT',1.5)}}else if(self){a.ix=p.x+(R()-.5)*8;a.iz=p.z+(R()-.5)*8;if(a.cov&&Math.hypot(p.x-a.cov.x,p.z-a.cov.z)>.9)a.cov=null}if(e.nav)e.nav.fail=0}}else a.stk=0;
  if(MOVEE33[s]&&e.st==='cover'&&time-a.cvT>10){setSE33(a,'ALERT',1);a.ph='hide'}}
 AI33.dbg.sf[s]=(AI33.dbg.sf[s]||0)+dt}
/* ---------- escuadras (Glave) ---------- */
function sqTickE33(sq){for(let i=sq.m.length-1;i>=0;i--){const o=sq.m[i];if(o.hp<=0||enemies.indexOf(o)<0||!o.a33){sq.m.splice(i,1)}}
 if(!sq.m.length){const i=AI33.sqL.indexOf(sq);if(i>=0)AI33.sqL.splice(i,1);delete AI33.sq[sq.k];return}
 if(!sq.ld||sq.m.indexOf(sq.ld)<0){if(sq.ld){sq.ldDead=1;for(const o of sq.m){o.a33.sup+=.8}}sq.ld=sq.m.find(o=>o.a33.role==='leader')||sq.m[0]}
 /* conocimiento compartido */
 let best=null;sq.vis=0;for(const o of sq.m){const a=o.a33;if(a.vis)sq.vis=1;if(a.svT>sq.svT)sq.svT=a.svT;if(!best||a.lkT>best.lkT)best=a}
 if(best&&best.lkT>sq.lkT){sq.lkx=best.lkx;sq.lkz=best.lkz;sq.lkT=best.lkT;sq.know=Math.max(sq.know,best.know)}
 /* rumor: sin contacto mucho rato, el mando les indica la zona (ritmo de misión) */
 if(sq.know>=2&&time-sq.lkT>AI33.cfg.rumor){const t=sq.ld.a33.T.p||P.g.position;sq.lkx=t.x+(R()-.5)*20;sq.lkz=t.z+(R()-.5)*20;sq.lkT=time-4}
 for(const o of sq.m){const a=o.a33;if(a.lkT<sq.lkT-.5&&!a.shT&&!a.vis){a.shT=time+.5+R()*.9;a.shx=sq.lkx;a.shz=sq.lkz;a.shL=sq.lkT}}
 if(sq.know<2)return;
 /* moral y retirada */
 const cas=sq.n0-sq.m.length;let br=0;for(const o of sq.m)br+=o.a33.pf.brave;br/=sq.m.length;sq.mor=1-cas/Math.max(1,sq.n0)*.85-(sq.ldDead?.2:0)+(br-.8)*.5;
 if(sq.retN<1&&sq.n0>=3&&sq.mor<.42&&sq.m.length<=2&&!sq.m.some(o=>o.hold||o.keep17)){sq.retN++;sq.retT=time+7+R()*4;if(time-AI33.bark>AI33.cfg.barkCD){AI33.bark=time;feed('★ El enemigo retrocede para reagruparse')}}
 /* fuego y movimiento: un elemento cubre, el otro avanza */
 const n=sq.m.length;let adv=0;for(const o of sq.m)adv+=o.a33.pf.adv*(o.goal17?1.4:1);adv/=n;
 const d=Math.hypot(sq.ld.g.position.x-sq.lkx,sq.ld.g.position.z-sq.lkz);
 if(time>sq.elT){sq.el^=1;sq.elT=time+6+R()*3}
 let movers=0,arrived=0;
 for(let i=0;i<n;i++){const o=sq.m[i],a=o.a33;if(o===sq.fl)continue;
  const canMove=!o.hold&&a.role!=='mg'&&a.role!=='marksman'&&n>=2&&adv>.45&&d>15&&a.rel<=0;
  if(canMove&&(i&1)===sq.el){a.ord='bound';movers++;if(o.st==='hide'||o.st==='peek')arrived++}else a.ord=a.role==='mg'?'sup':'cover'}
 if(movers&&arrived===movers&&time>sq.elT-4){sq.el^=1;sq.elT=time+6+R()*3}
 /* flanqueo: uno o dos hombres por una ruta lateral */
 if(sq.fl&&(sq.m.indexOf(sq.fl)<0||time>sq.flT)){if(sq.fl.a33)sq.fl.a33.ord='';sq.fl=null}
 if(!sq.fl&&n>=3&&d>16&&d<70&&time>sq.flT+6&&R()<.4){const c=sq.m.find(o=>o!==sq.ld&&!o.hold&&(o.a33.role==='assault'||o.a33.role==='rifle'||o.a33.role==='scout'));if(c){sq.fl=c;sq.flT=time+14;sq.fside=-sq.fside;c.a33.fls=sq.fside;c.a33.ord='flank';c.a33.decT=0}}}
/* ---------- amenazas entrantes: granadas del jugador y fuego cercano ---------- */
function threatsE33(dt){
 for(const g of grens){if(g.fuse>2.2)continue;for(const e of AI33.list){const a=e.a33;if(!a||e.hold||a.s==='EVADE'||e.unaware)continue;const p=e.g.position,d=Math.hypot(p.x-g.pos.x,p.z-g.pos.z);if(d<7){if(!a.evR){a.evR=time+a.pf.react*(.25+R()*.3)}else if(time>=a.evR){a.evR=0;a.evx=g.pos.x;a.evz=g.pos.z;a.evE=time+Math.min(1.6,g.fuse+.3);setSE33(a,'EVADE',.2);a.actT=a.evE;AI33.dbg.evade++;if(time-AI33.bark>3&&R()<.5){AI33.bark=time;feed('«¡Granada! ¡Al suelo!»')}}}}}
 /* balas nuevas: ruido + supresión (a lo largo de la trayectoria) */
 let shotP=false;for(const b of bullets){if(b._s33)continue;b._s33=1;const o=b.m.position,v=b.v,vl=Math.hypot(v.x,v.z)||1,ux=v.x/vl,uz=v.z/vl;
  if(!b.by){shotP=true}else if(R()<.35)noise33(o.x,o.z,65,'ally');
  for(const e of AI33.list){const a=e.a33;if(!a)continue;const qx=e.g.position.x-o.x,qz=e.g.position.z-o.z,t=qx*ux+qz*uz;if(t<2||t>85)continue;const pd=Math.abs(qx*uz-qz*ux);if(pd<2.6){a.sup+=(2.6-pd)/2.6*.45;a.supT=time;if(!b.by&&!a.vis&&a.know>=2&&time-a.visT>1){const er=t*.12;a.lkx=P.g.position.x+(R()-.5)*er;a.lkz=P.g.position.z+(R()-.5)*er;a.lkT=Math.max(a.lkT,time-1.2)}}}}
 if(shotP){AI33.pShot=time;noise33(P.g.position.x,P.g.position.z,P.cur==='revolver'?55:75,'player')}
 /* pasos del jugador */
 AI33.stepT-=dt;if(AI33.stepT<=0){AI33.stepT=.45;const sp=Math.hypot(P.mvx||0,P.mvz||0);if(sp>1.2&&!P.mg)noise33(P.g.position.x,P.g.position.z,P.pr?1.5:P.cr?3:sp>7?14:7,'step')}
 AI33.vehT-=dt;if(AI33.vehT<=0){AI33.vehT=1;if(typeof VEH32!=='undefined'&&VEH32&&VEH32.list)for(const v of VEH32.list){if(v.alive&&v.on&&v.ally&&v.type!=='ship'&&v.type!=='gun'&&v.type!=='mortar')noise33(v.g.position.x,v.g.position.z,50,'veh')}}}
/* =====================================================================
   ENVOLTORIOS
   ===================================================================== */
{const _t=e8T;e8T=function(e){const r=_t?_t(e):null;if(!AI33.on||!okE33(e))return r;if(e.unaware)return r;const t0=performance.now();
 let a=e.a33;if(!a)a=initE33(e,r);a.T=r||pTE33();if(!a.T.p)a.T=pTE33();const dt=(typeof V16!=='undefined'&&V16.dt)||.016;
 a.think-=dt;if(a.think<=0&&AI33.tk<AI33.cfg.thinkPerFrame){AI33.tk++;const far=a.d>80||!e.g.visible;a.think=(far?AI33.cfg.thinkFar:AI33.cfg.think)*(.85+R()*.3);thinkE33(e,a,Math.max(dt,AI33.cfg.think))}
 frameE33(e,a,dt);AI33.fms+=performance.now()-t0;return a.tg}}
{const _u=unstk;unstk=function(e,ax,az,dt){const a=e.a33;if(a&&AI33.on&&!e.unaware){
  if(a.self){ax=a.mx;az=a.mz}
  else if(a.cov&&a.cov.cor&&a.cov.px!==undefined&&(e.st==='peek'||e.st==='hide')){const p=e.g.position,tx=e.st==='peek'?a.cov.px:a.cov.x,tz=e.st==='peek'?a.cov.pz:a.cov.z,dx=tx-p.x,dz=tz-p.z,d=Math.hypot(dx,dz);if(d>.35&&d<3){ax=dx/d*.55;az=dz/d*.55}}
  if(time-a.ffT<.9&&!(ax||az)){const r=e.g.rotation.y;ax=Math.cos(r)*.5*a.fls;az=-Math.sin(r)*.5*a.fls}
  /* separación suave entre compañeros de escuadra */
  if(a.sq&&(ax||az)){const p=e.g.position;for(const o of a.sq.m){if(o===e)continue;const dx=p.x-o.g.position.x,dz=p.z-o.g.position.z,q=dx*dx+dz*dz;if(q<6.25&&q>.01){const d=Math.sqrt(q);ax+=dx/d*(2.5-d)*.25;az+=dz/d*(2.5-d)*.25}}}}
 return _u?_u(e,ax,az,dt):[ax,az]}}
{const _s=shootSol;shootSol=function(e,p){const a=e.a33;if(!a||!AI33.on||e.type!=='sol')return _s(e,p);
 if(a.rel>0)return;if(a.mag<=0){a.rel=a.W.rel*(a.pf.react>1.2?1.15:a.pf.react<.75?.9:1);AI33.dbg.reload++;if(time-AI33.bark>AI33.cfg.barkCD&&R()<.25&&a.d<30){AI33.bark=time;feed('«¡Recargando!»')}return}
 const vis=a.vis&&time-a.visT<.5;let tx,ty,tz,sup=false,tp=null;
 if(vis){tp=a.T.p;const isP=tp===P.g.position;tx=tp.x;tz=tp.z;ty=tp.y+(isP?(P.pr?.3:P.cr?.85:1.2):1.15);
  if(a.pf.lead>0&&isP){const ft=Math.hypot(tx-p.x,tz-p.z)/26*a.pf.lead;tx+=(P.mvx||0)*ft;tz+=(P.mvz||0)*ft}}
 else if(time-a.lkT<(a.s==='SUPPRESS'?8:2.2)&&time-Math.max(a.svT,a.sq?a.sq.svT:-99)<(a.s==='SUPPRESS'?10:3)&&AI33.rc<AI33.cfg.rayBudget&&losE33(p.x,p.y+1.5,p.z,p.x+(a.lkx-p.x)*.75,1.1,p.z+(a.lkz-p.z)*.75)){tx=a.lkx;tz=a.lkz;ty=1;sup=true}
 else{AI33.dbg.noLos++;return}
 const cvh=a.cov&&a.cov.low&&Math.hypot(p.x-a.cov.x,p.z-a.cov.z)<1.6?(a.cov.h||1)+.22:0,o=new T.Vector3(p.x,p.y+Math.max(1.4*(e.s||1),cvh),p.z),dx=tx-o.x,dz=tz-o.z,d=Math.hypot(dx,dz)||1;
 /* fuego amigo: no disparar con un compañero en la línea */
 for(const q of enemies){if(q===e||q.hp<=0)continue;const qx=q.g.position.x-o.x,qz=q.g.position.z-o.z,t=(qx*dx+qz*dz)/d;if(t<.8||t>d-1)continue;if(Math.abs(qx*dz-qz*dx)/d<.85){a.ffT=time;AI33.dbg.ff++;return}}
 if(time-a.lastShot>.5)a.bs=0;else a.bs++;a.lastShot=time;
 const ts=tp===P.g.position?Math.hypot(P.mvx||0,P.mvz||0):0,ms=Math.hypot(e.vx||0,e.vz||0);
 let sg=a.W.sp*a.pf.acc*(AI33.diff[difficulty]||1)*(1+Math.max(0,1-(time-a.acq)/a.pf.aimT)*.9)*(ms>1?1.6:1)*(ts>2?1.25:1)*(1+Math.min(2.2,a.sup)*.4)*(1+Math.min(4,a.bs)*.12)*(e.hp<e.max*.35?1.25:1)*(d<8?.7:1)*(1+Math.max(0,d-45)/40)*(sup?3.2:1);
 const v=new T.Vector3(tx-o.x,ty-o.y,tz-o.z).normalize();v.x+=gsE33()*sg;v.z+=gsE33()*sg;v.y+=gsE33()*sg*.45;v.normalize();
 eshoot(o,v,8);if(AI33.cfg.log&&AI33.log.length<400)AI33.log.push([+d.toFixed(1),+sg.toFixed(3),vis?1:0,+ms.toFixed(1),+(time-a.acq).toFixed(1),a.bs,+a.sup.toFixed(1),a.wc,+o.y.toFixed(2),+ty.toFixed(2)]);e.aim=.35;a.mag--;AI33.dbg.shots++;if(sup)AI33.dbg.supShots=(AI33.dbg.supShots||0)+1;
 burst(o.x+v.x*.6,o.y,o.z+v.z*.6,0xffdd88,2,.08,1);snd(a.wc==='rifle'||a.wc==='sniper'?120:150,.12,'sawtooth',.03);if(R()<.3)noise33(p.x,p.z,60,'enemy')}}
{const _f=findCover;findCover=function(e,far){const a=e.a33;if(!a||!AI33.on||!okE33(e)||e.unaware)return _f(e,far);const c=pickCoverE33(e,a,far?'far':'near');if(c){a.cov=c;a.cvT=time;return (a.cvPend={x:c.x,z:c.z})}return _f(e,far)}}
{const _a=animE;animE=function(e,ax,az,dt,crouch){const a=e.a33;if(a&&AI33.on&&!e.unaware&&a.cr&&!(ax||az))crouch=true;return _a(e,ax,az,dt,crouch)}}
{const _h=hurt;hurt=function(e,d,mode,by){const a=e&&e.a33;if(a&&e.hp>0&&AI33.on){a.sup+=.7;a.hitT=time;if(e.st==='hide')a.cmp++;if(!by&&(mode==='b'||mode==='h')){if(a.know<2)a.know=2;if(!a.vis){const p=e.g.position,dd=Math.hypot(P.g.position.x-p.x,P.g.position.z-p.z),er=dd*.1;a.lkx=P.g.position.x+(R()-.5)*er;a.lkz=P.g.position.z+(R()-.5)*er;a.lkT=Math.max(a.lkT,time-1)}}}return _h(e,d,mode,by)}}
{const _k=kill;kill=function(e){if(e&&e.a33){const p=e.g.position;noise33(p.x,p.z,30,'death');e.a33.cov=null;e.a33.s='DEAD';const i=AI33.list.indexOf(e);if(i>=0)AI33.list.splice(i,1)}return _k(e)}}
{const _b=boom;boom=function(pos){if(pos)noise33(pos.x,pos.z,140,'boom');return _b(pos)}}
if(typeof expSnd==='function'){const _x=expSnd;expSnd=function(x,z,k){noise33(x,z,120*(k||1),'boom');return _x.apply(this,arguments)}}
{const _u=update;update=function(dt){if(!AI33.on||!playing){return _u(dt)}const t0=performance.now();
 if(level!==AI33.lv){AI33.lv=level;AI33.reset()}AI33.rc=0;AI33.tk=0;AI33.fms=0;AI33.fk=fogKE33();
 const cine=typeof L9!=='undefined'&&L9.cine;
 if(!cine){try{threatsE33(dt);grenUpdE33();for(let i=AI33.list.length-1;i>=0;i--){const e=AI33.list[i];if(e.hp<=0||enemies.indexOf(e)<0){if(e.a33)e.a33.cov=null;AI33.list.splice(i,1)}}
  const L=AI33.sqL;if(L.length){for(let k=0;k<2&&k<L.length;k++){AI33.sqI=(AI33.sqI+1)%L.length;const s=L[AI33.sqI];if(time-s.tick>.45){s.tick=time;sqTickE33(s)}}}}catch(er){if(!AI33.err){AI33.err=1;console.warn('AI33',er)}}}
 const t1=performance.now();_u(dt);
 const D=AI33.dbg,ms=(t1-t0)+AI33.fms;D.frames++;D.ms+=(ms-D.ms)*.05;D.msSum=(D.msSum||0)+ms;if(ms>4)D.slow=(D.slow||0)+1;if(ms>D.msMax)D.msMax=ms}}
