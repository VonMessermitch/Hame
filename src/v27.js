/* =====================================================================
   v27 · Mejoras de la Misión XII «Los que quedaron atrás» (nivel 13)
   - Aliados con el uniforme de aviación del cepelín (capítulo XI)
   - Casco praguense tipo wz.38 en acero marrón
   - Brújula y minimapa (niveles 13 y 14)
   - Baliza roja parpadeante donde hay que colocar cargas
   - Edificios mejorados (granero, casa, galpón) y búnkeres con puertas
   - Interrogatorio del chofer y huida en camión rehechos
   ===================================================================== */
PRG.helm=0x5b4936;
/* ---------- poses nuevas para los NPC ---------- */
const PD27={L1:0,L2:0,K1:0,K2:0,AR:-.15,AL:-.15,ER:-.2,EL:-.2,ARY:0,ALY:0,BY:.8,BX:0,HX:0,HY:0};
const KL27={L1:-1.45,L2:.12,K1:1.45,K2:1.7,BY:.5};
const ACT27={
 kneel:t=>Object.assign({},KL27,{AR:-2.75,AL:-2.75,ARY:.35,ALY:-.35,ER:-1.9,EL:-1.9,HY:Math.sin(t*23)*.035,HX:.12}),
 beg:t=>Object.assign({},KL27,{AR:-1.15+Math.sin(t*5)*.18,AL:-1.15+Math.sin(t*5+1)*.18,ER:-.95,EL:-.95,HY:Math.sin(t*4.6)*.32,BX:.14}),
 grabbed:t=>Object.assign({},KL27,{BY:.6,AR:-2.3,AL:-2.3,ER:-.7,EL:-.7,BX:-.3,HX:-.38,HY:Math.sin(t*26)*.045}),
 pointN:t=>Object.assign({},KL27,{AR:-2.0,ARY:-.9,ER:-.05,AL:-1.2,EL:-1.2,HY:-.5}),
 tied:t=>Object.assign({},KL27,{AR:.55,AL:.55,ER:-1.15,EL:-1.15,ARY:.35,ALY:-.35,HX:.42}),
 aimp:t=>({AR:-1.5,ER:-.05,ARY:-.12,AL:-.15,EL:-.3,HY:-.04+Math.sin(t*1.3)*.02}),
 grab:t=>({AR:-1.4,ER:-.2,ARY:-.1,AL:-1.55,EL:-.35,ALY:.35,BX:.3,HX:.18}),
 tie:t=>({L1:-1.2,L2:-.35,K1:1.5,K2:1.7,BY:.45,AR:-.9+Math.sin(t*7)*.3,AL:-.9-Math.sin(t*7)*.3,ER:-1.0,EL:-1.0,BX:.35,HX:.3}),
 climb:t=>({AR:-2.5,AL:-2.5,ER:-.45,EL:-.45,L1:-1.5,K1:1.7,L2:-.3,K2:.6,BY:.72,BX:.35}),
 wave:t=>({AR:-2.6+Math.sin(t*9)*.35,ARY:.4,ER:-.5,AL:-.2}),
 lantern:t=>({AR:-.75,ER:-.7,AL:-.15,HY:Math.sin(t*.9)*.2}),
 coat:t=>({AR:-1.1+Math.sin(t*6)*.25,AL:-1.1-Math.sin(t*6)*.25,ER:-1.6,EL:-1.6,HX:.25,HY:Math.sin(t*2)*.15}),
 crouchaim:t=>({L1:-1.2,L2:-.35,K1:1.5,K2:1.7,BY:.45,AR:-1.42,ER:-.15,AL:-1.35,ALY:-.55,EL:-.2,HY:-.08})};
{const _na27=npcAnim11;npcAnim11=function(n,dt){const f=ACT27[n.act];if(!f)return _na27(n,dt);const u=n.u,t=(n.t+=dt),k=Math.min(1,dt*7),bl=(x,y)=>x+(y-x)*k,P_=Object.assign({},PD27,f(t));
 u.l1.rotation.x=bl(u.l1.rotation.x,P_.L1);u.l2.rotation.x=bl(u.l2.rotation.x,P_.L2);u.k1.rotation.x=bl(u.k1.rotation.x,P_.K1);u.k2.rotation.x=bl(u.k2.rotation.x,P_.K2);u.aR.rotation.x=bl(u.aR.rotation.x,P_.AR);u.aL.rotation.x=bl(u.aL.rotation.x,P_.AL);u.aR.rotation.y=bl(u.aR.rotation.y,P_.ARY);u.aL.rotation.y=bl(u.aL.rotation.y,P_.ALY);u.eR.rotation.x=bl(u.eR.rotation.x,P_.ER);u.eL.rotation.x=bl(u.eL.rotation.x,P_.EL);u.b.position.y=bl(u.b.position.y,P_.BY);u.b.rotation.x=bl(u.b.rotation.x,P_.BX);u.hd.rotation.x=bl(u.hd.rotation.x,P_.HX);u.hd.rotation.y=bl(u.hd.rotation.y,P_.HY);
 if(n.g.rotation.x){n.g.rotation.x*=.8}}}
/* ---------- aliados con el uniforme de aviación del cepelín ---------- */
surv13=function(x,z,o){o=o||{};const helmOff=(o.hat&&o.hat!=='none')||o.band==='head';
 const n=npc11(X13+x,z,Object.assign({hat:'none',coat:o.rank||o.officer?AIRC.blue:AIRC.jacket,web:false,pack:false},o));n.lv=13;
 airKit12(n,{helmet:helmOff?false:undefined,scarf:o.scarf,officer:o.officer,coat:o.coat,phones:false});const A=n.air||[];const u=n.g.userData,add=(par,q)=>{const m=pbMesh(q,par,VCM);A.push(m);return m};
 if(o.band){const q=PB();if(o.band==='head')pBox(q,.38,.08,.38,0xe8e4dc,0,.24,0);else pBox(q,.21,.1,.23,0xe8e4dc,0,-.1,0);add(o.band==='head'?u.hd:u.eL,q)}
 if(o.dirt||o.torn||o.pack){const q=PB();if(o.dirt){for(let i=0;i<5;i++)pBox(q,.14,.1,.012,0x2a2620,(R()-.5)*.5,.1+R()*.5,.204)}if(o.torn)pBox(q,.12,.14,.012,0x6a6058,.2,.2,.205);if(o.pack)pBox(q,.36,.3,.16,0x4a4030,0,.32,-.28);add(u.ch,q)}
 if(o.flyhelm&&helmOff){const q=PB();pBox(q,.38,.17,.38,AIRC.lea,0,.32,-.01);add(u.hd,q)}
 /* la pistola de la funda pasa a ser la Lugy de la misión */if(n.pis){while(n.pis.children.length)n.pis.remove(n.pis.children[0]);const lg=lugyMesh13();lg.position.y=-.02;n.pis.add(lg)}
 n.air=A;n.wpn='p';n.sp=3.4;L13.sq.push(n);return n};
/* ---------- casco praguense tipo wz.38 (acero marrón) ---------- */
const HM27={g:null,m:null,m2:null};
function helm27(hd){if(!HM27.g){HM27.m=new T.MeshLambertMaterial({color:PRG.helm});HM27.m2=new T.MeshLambertMaterial({color:shade(PRG.helm,.8),side:T.DoubleSide});const q=PB();
  for(const s of[-1,1]){pCyl(q,.022,.022,.02,0x8a7a5a,s*.228,.36,0,0,0,1.5708,6);pBox(q,.022,.2,.022,0x2a1a0a,s*.2,.19,.05,0,0,s*.12)}pBox(q,.05,.06,.015,0xc8c4b0,0,.395,.245);pBox(q,.022,.04,.016,0x8a1a1a,0,.395,.25);HM27.g=pbGeo(q)}
 const dome=new T.Mesh(new T.SphereGeometry(.24,14,8,0,6.283,0,1.42),HM27.m);dome.scale.set(1,.9,1.07);dome.position.y=.3;hd.add(dome);
 const sk=new T.Mesh(new T.CylinderGeometry(.238,.285,.085,16,1,true),HM27.m2);sk.position.y=.262;sk.scale.z=1.07;hd.add(sk);
 const rim=new T.Mesh(new T.TorusGeometry(.284,.013,4,18),HM27.m);rim.rotation.x=1.5708;rim.position.y=.22;rim.scale.y=1.07;hd.add(rim);
 const ridge=new T.Mesh(gBox(.03,.025,.36),HM27.m);ridge.position.y=.515;hd.add(ridge);hd.add(new T.Mesh(HM27.g,VCM))}
{const _pr27=prg13;prg13=function(e,role){_pr27(e,role);if(role==='off')return;const hd=e.g.userData.hd;for(let i=hd.children.length-1;i>=0;i--){const c=hd.children[i];if(c.isMesh&&c.material&&c.material.color&&c.material.color.getHex&&(c.geometry.type==='SphereGeometry'||c.geometry.type==='CylinderGeometry')&&!c.u27)hd.remove(c)}const n0=hd.children.length;helm27(hd);for(let i=n0;i<hd.children.length;i++)hd.children[i].u27=1}}
/* ---------- brújula y minimapa ---------- */
document.head.insertAdjacentHTML('beforeend','<style>#mm27{position:absolute;left:16px;top:196px;width:150px;height:150px;border-radius:50%;pointer-events:none;z-index:6;display:none;box-shadow:0 0 0 2px rgba(214,178,96,.55),0 0 14px rgba(0,0,0,.6)}#cp27{position:absolute;left:50%;top:34px;transform:translateX(-50%);width:440px;height:34px;pointer-events:none;z-index:6;display:none}#t13{top:76px!important}#dist27{position:absolute;left:16px;top:350px;width:150px;text-align:center;font:12px Georgia,serif;letter-spacing:2px;color:#e8c878;text-shadow:0 1px 2px #000;pointer-events:none;z-index:6;display:none}@media (max-width:760px){#mm27{width:112px;height:112px;top:186px}#dist27{width:112px;top:302px}#cp27{width:300px;top:30px}}</style>');
document.body.insertAdjacentHTML('beforeend','<canvas id="mm27" width="300" height="300"></canvas><canvas id="cp27" width="880" height="68"></canvas><div id="dist27"></div>');
const MM27={t:0};
function mm27(dt){const c=$('mm27'),k=$('cp27'),dd=$('dist27');const on=playing&&(level===13||level===14)&&!L9.cine&&!(level===12);
 if(!on){if(c.style.display!=='none'){c.style.display=k.style.display=dd.style.display='none'}return}
 c.style.display=k.style.display=dd.style.display='block';$('arrow').style.display='none';MM27.t+=dt;
 const pp=level===14&&L14.inTank?L14.tank.position:P.g.position,yw=yaw,rx=Math.cos(yw),rz=-Math.sin(yw),fx=-Math.sin(yw),fz=-Math.cos(yw);
 /* minimapa */{const x=c.getContext('2d'),W=300,C=W/2,RA=45,s=C/RA;x.setTransform(1,0,0,1,0,0);x.clearRect(0,0,W,W);x.save();x.beginPath();x.arc(C,C,C-2,0,6.283);x.clip();
  const gr=x.createRadialGradient(C,C,10,C,C,C);gr.addColorStop(0,'rgba(48,42,30,.78)');gr.addColorStop(1,'rgba(18,16,12,.82)');x.fillStyle=gr;x.fillRect(0,0,W,W);
  x.setTransform(s*rx,-s*fx,s*rz,-s*fz,C,C);x.fillStyle='rgba(206,192,150,.5)';const R2=(RA+12)*(RA+12);
  for(const o of obstB){const dx=o.x-pp.x,dz=o.z-pp.z;if(dx*dx+dz*dz>R2+(o.hw*o.hw+o.hd*o.hd)*4)continue;if(o.hw>60||o.hd>60)continue;x.fillRect(dx-o.hw,dz-o.hd,o.hw*2,o.hd*2)}
  x.setTransform(1,0,0,1,0,0);const map=(wx,wz)=>{const dx=wx-pp.x,dz=wz-pp.z;return[C+(dx*rx+dz*rz)*s,C-(dx*fx+dz*fz)*s]};
  x.strokeStyle='rgba(214,178,96,.18)';x.lineWidth=1;for(const r of[15,30]){x.beginPath();x.arc(C,C,r*s,0,6.283);x.stroke()}
  const SQ=level===13?L13.sq.filter(n=>n.on&&n.g.visible):(L14.sq||[]).filter(n=>n.g&&n.g.visible);x.fillStyle='#7cd06a';for(const n of SQ){const [a,b]=map(n.g.position.x,n.g.position.z);x.beginPath();x.arc(a,b,6,0,6.283);x.fill()}
  const loud=level===14||L13.loud;if(loud){for(const e of enemies){if(e.hp<=0)continue;const dx=e.g.position.x-pp.x,dz=e.g.position.z-pp.z;if(dx*dx+dz*dz>RA*RA)continue;const [a,b]=map(e.g.position.x,e.g.position.z);x.fillStyle=(e.fl27||0)>0?'#ffd040':'#e03a2a';x.beginPath();x.arc(a,b,6,0,6.283);x.fill()}}
  if(L9.obj){let [a,b]=map(L9.obj[0],L9.obj[1]);const dx=a-C,dy=b-C,d=Math.hypot(dx,dy),lim=C-16;let edge=false;if(d>lim){a=C+dx/d*lim;b=C+dy/d*lim;edge=true}const pu=1+Math.sin(MM27.t*6)*.18;x.save();x.translate(a,b);if(edge){x.rotate(Math.atan2(dy,dx)+1.5708);x.fillStyle='#ffd25a';x.beginPath();x.moveTo(0,-14*pu);x.lineTo(10,6);x.lineTo(-10,6);x.closePath();x.fill()}else{x.scale(pu,pu);x.fillStyle='#ffd25a';x.beginPath();for(let i=0;i<10;i++){const r=i%2?6:14,an=i*.6283-1.5708;x.lineTo(Math.cos(an)*r,Math.sin(an)*r)}x.closePath();x.fill();x.strokeStyle='#4a3010';x.lineWidth=2;x.stroke()}x.restore()}
  x.fillStyle='#fff';x.strokeStyle='#000';x.lineWidth=2;x.beginPath();x.moveTo(C,C-13);x.lineTo(C+9,C+10);x.lineTo(C,C+5);x.lineTo(C-9,C+10);x.closePath();x.fill();x.stroke();
  /* norte en el borde */{const [a,b]=map(pp.x,pp.z-100);const dx=a-C,dy=b-C,d=Math.hypot(dx,dy)||1,lx=C+dx/d*(C-18),ly=C+dy/d*(C-18);x.font='bold 22px Georgia';x.textAlign='center';x.textBaseline='middle';x.fillStyle='#e8c878';x.fillText('N',lx,ly)}
  x.restore()}
 /* brújula */{const x=k.getContext('2d'),W=880,H=68,hd=Math.atan2(fx,-fz);x.clearRect(0,0,W,H);const gr=x.createLinearGradient(0,0,W,0);gr.addColorStop(0,'rgba(20,16,10,0)');gr.addColorStop(.15,'rgba(20,16,10,.62)');gr.addColorStop(.85,'rgba(20,16,10,.62)');gr.addColorStop(1,'rgba(20,16,10,0)');x.fillStyle=gr;x.fillRect(0,8,W,46);
  const FOV=1.9,px=a=>{let r=a-hd;while(r>Math.PI)r-=6.283;while(r<-Math.PI)r+=6.283;return Math.abs(r)>FOV/2?null:W/2+r/(FOV/2)*(W/2-30)};const NM=['N','NE','E','SE','S','SO','O','NO'];x.textAlign='center';x.textBaseline='middle';
  for(let i=0;i<24;i++){const a=i*.2618,X_=px(a);if(X_===null)continue;const big=i%3===0;x.fillStyle=big?'#e8c878':'rgba(232,200,120,.5)';if(big){x.font=(i%6===0?'bold 24px':'18px')+' Georgia';x.fillText(NM[i/3],X_,31)}else x.fillRect(X_-1,24,2,14)}
  x.fillStyle='#e8c878';x.beginPath();x.moveTo(W/2,52);x.lineTo(W/2-7,62);x.lineTo(W/2+7,62);x.closePath();x.fill();
  if(L9.obj){const dx=L9.obj[0]-pp.x,dz=L9.obj[1]-pp.z,b=Math.atan2(dx,-dz);let X_=px(b),side=0;if(X_===null){let r=b-hd;while(r>Math.PI)r-=6.283;while(r<-Math.PI)r+=6.283;side=r>0?1:-1;X_=side>0?W-22:22}
   x.fillStyle='#ffd25a';x.save();x.translate(X_,31);if(side){x.scale(side,1);x.beginPath();x.moveTo(12,0);x.lineTo(-4,-11);x.lineTo(-4,11);x.closePath();x.fill()}else{const pu=1+Math.sin(MM27.t*6)*.15;x.scale(pu,pu);x.beginPath();for(let i=0;i<10;i++){const r=i%2?6:15,an=i*.6283-1.5708;x.lineTo(Math.cos(an)*r,Math.sin(an)*r)}x.closePath();x.fill()}x.restore();
   dd.textContent='OBJETIVO · '+Math.round(Math.hypot(dx,dz))+' m'}else dd.textContent=''}}
/* ---------- baliza roja donde se colocan las cargas ---------- */
const BC27={g:null};
function bcInit27(){if(BC27.g)return;const g=new T.Group(),mk=(geo,op,c)=>{const m=new T.Mesh(geo,new T.MeshBasicMaterial({color:c||0xff2a14,transparent:true,opacity:op,depthWrite:false,blending:T.AdditiveBlending,side:T.DoubleSide,fog:false}));m.op=op;g.add(m);return m};
 g.r1=mk(new T.RingGeometry(1.2,1.55,40),.9);g.r1.rotation.x=-1.5708;g.r1.position.y=.42;g.r2=mk(new T.RingGeometry(.2,1.2,40),.3);g.r2.rotation.x=-1.5708;g.r2.position.y=.41;
 g.col=mk(new T.CylinderGeometry(.18,.55,26,12,1,true),.2);g.col.position.y=13;g.ar=mk(new T.ConeGeometry(.42,.9,4),.95,0xff4020);g.ar.rotation.x=Math.PI;g.ar.position.y=2.6;
 g.bx=new T.Mesh(gBox(.8,.26,.5),new T.MeshBasicMaterial({color:0xff2010,fog:false}));g.bx.position.y=.5;g.add(g.bx);const L=new T.PointLight(0xff2a10,2.2,9);L.position.y=1.2;g.add(L);g.L=L;g.visible=false;scene.add(g);BC27.g=g}
function bcUpd27(dt){if(!BC27.g)bcInit27();const g=BC27.g;let pt=null;if(playing&&level===13&&!L9.cine){try{for(const w of works13())if(/^Colocar/.test(w.lbl)){pt=w;break}}catch(e){}}
 g.visible=!!pt;if(!pt)return;g.position.set(pt.x,0,pt.z);const b=Math.sin(time*9)>0?1:.25,pu=(time*1.4)%1;g.r1.scale.setScalar(1+pu*.6);g.r1.material.opacity=.9*(1-pu);g.r2.material.opacity=.3*b;g.col.material.opacity=.22*b;g.ar.position.y=2.6+Math.sin(time*4)*.35;g.ar.rotation.y+=dt*2;g.bx.visible=b>.5;g.L.intensity=2.4*b}
/* ---------- edificios: más detalle (granero, casa, galpón) y búnkeres con puertas ---------- */
function deco27(){const X=X13,q=PB(),WO=0x4a3624,DK=0x2a1e14,ST=0x6a665c,GL=0xffc870;
 const gable=(cx,y0,z,w,h,c,face)=>{for(let i=0;i<6;i++){const ww=w*(1-i/6);pBox(q,ww,h/6+.02,.25,c,cx,y0+h/6*i+h/12,z)}};
 const win=(x,y,z,ax,lit)=>{/* ax: 'x' pared perpendicular a x, 'z' pared perpendicular a z */const sx=ax==='x'?.12:1.1,sz=ax==='x'?1.1:.12;pBox(q,sx*1.08,1.3,sz*1.08,0xd8d0b8,x,y,z);pBox(q,ax==='x'?.14:.9,1.05,ax==='x'?.9:.14,lit?0x8a6a30:0x1a1e22,x,y,z);pBox(q,ax==='x'?.16:.06,1.05,ax==='x'?.06:.16,0xd8d0b8,x,y,z);pBox(q,ax==='x'?.16:.9,.06,ax==='x'?.9:.16,0xd8d0b8,x,y,z);
  for(const s of[-1,1])pBox(q,ax==='x'?.08:.5,1.15,ax==='x'?.5:.08,0x3a4a3a,x+(ax==='x'?0:s*.82),y,z+(ax==='x'?s*.82:0));pBox(q,ax==='x'?.3:1.2,.08,ax==='x'?1.2:.3,0x8a8070,x,y-.68,z);if(lit){const m=new T.Mesh(gBox(ax==='x'?.02:.86,.98,ax==='x'?.86:.02),new T.MeshBasicMaterial({color:GL,transparent:true,opacity:.55}));m.position.set(x,y,z);scene.add(m)}};
 /* granero */{const bx=X+30,z0=-190,H=3.2;
  for(const [x,z,w,d] of[[bx,z0-8.25,12.6,.3],[bx-6.25,z0,.3,16.6],[bx+6.25,z0,.3,16.6],[bx-4,z0+8.25,4.4,.3],[bx+4,z0+8.25,4.4,.3]])pBox(q,w,.6,d,ST,x,.3,z);
  for(let i=0;i<12;i++){pBox(q,.1,2*H-.6,.06,DK,bx-5.5+i,H+.3,z0-8.24);}for(let i=0;i<16;i++)for(const s of[-1,1])pBox(q,.06,2*H-.6,.1,DK,bx+s*6.24,H+.3,z0-7.5+i);
  gable(bx,2*H,z0+8.15,12.2,2.9,0x6a4a2a);gable(bx,2*H,z0-8.15,12.2,2.9,0x6a4a2a);pBox(q,.3,.3,16.8,DK,bx,2*H+2.95,z0);
  for(const s of[-1,1]){const dg=new T.Group();pBox(q,2.2,3.4,.12,0x7a3a22,bx+s*7.3,1.7,z0+8.4);pBox(q,2.2,.14,.14,0xd8d0b8,bx+s*7.3,3.3,z0+8.48);pBox(q,2.2,.14,.14,0xd8d0b8,bx+s*7.3,.2,z0+8.48);pBox(q,.14,3.6,.14,0xd8d0b8,bx+s*7.3,1.7,z0+8.48,0,0,s*.55)}
  pBox(q,4.4,.2,.25,DK,bx,3.75,z0+8.45);pBox(q,9,.12,.12,0x2a2a2a,bx,3.9,z0+8.5);pBox(q,2.2,1.6,.15,0x2a1e14,bx,5.1,z0+8.3);pBox(q,1.6,.6,.5,0xc8a858,bx,4.55,z0+8.5);pCyl(q,.05,.05,1.8,0x6a6a6a,bx,7.8,z0+3,1.5708,0,0,5);
  pBox(q,1,1.2,1,0x6a4a2a,bx,2*H+3.4,z0);for(const s of[-1,1])pBox(q,1.4,.12,1.2,0x3a2a22,bx+s*.35,2*H+4.15,z0,0,0,s*.5);pCyl(q,.02,.02,1,0x2a2a2a,bx,2*H+4.8,z0,0,0,0,4);pBox(q,.6,.04,.04,0x2a2a2a,bx,2*H+5.2,z0);pBox(q,.04,.04,.6,0x2a2a2a,bx,2*H+5.1,z0);
  for(let i=0;i<3;i++)for(const s of[-1,1])win(bx+s*6.32,4.6,z0-5+i*5,'x',i===1&&s>0);
  for(let i=0;i<4;i++)pCyl(q,.35,.35,.9,0xc8a858,bx+7.5,.45,z0+2-i*1.1,0,0,1.5708,10);pBox(q,1.8,.06,.06,0x6a6a6a,bx-7.2,1.1,z0+5);pCyl(q,.4,.5,.9,0x5a5a5a,bx-7.4,.45,z0+6.5,0,0,0,10)}
 /* casa principal */{const hx=X-18,hz=-292,H=3;
  for(const [x,z,w,d] of[[hx,hz-4.75,12.6,.3],[hx-6.25,hz,.3,9.6],[hx+6.25,hz,.3,9.6],[hx-3.5,hz+4.75,5.4,.3],[hx+3.5,hz+4.75,5.4,.3]])pBox(q,w,.7,d,ST,x,.35,z);
  for(const s of[-1,1]){for(let i=0;i<6;i++){const ww=9.4*(1-i/6);pBox(q,.25,.42,ww,0x8a4a36,hx+s*6.12,2*H+.21+i*.42,hz)}}
  pBox(q,.25,.25,9.8,0x3a1e16,hx,2*H+2.55,hz);for(let i=0;i<9;i++)for(const s of[-1,1])pBox(q,6.9,.05,.06,0x3a1a14,hx+s*3,2*H+1.33,hz-4.4+i*1.1,0,0,s*.5);
  pBox(q,.9,3.2,.9,0x7a3a2a,hx-3,2*H+2.2,hz-1.5);pBox(q,1.1,.2,1.1,0x5a5a5a,hx-3,2*H+3.85,hz-1.5);pBox(q,.7,1.6,.7,0x7a3a2a,hx+3.5,2*H+1.8,hz+2);
  for(const s of[-1,1])pBox(q,12.8,.12,.18,0x5a5a5a,hx,2*H+.05,hz+s*4.95);
  for(const s of[-1,1]){win(hx+s*3.6,1.6,hz+4.82,'z',s<0);win(hx+s*3.6,4.6,hz+4.82,'z',s>0);win(hx+s*3.6,1.6,hz-4.82,'z',false);win(hx+s*3.6,4.6,hz-4.82,'z',false);win(hx+s*6.32,1.6,hz,'x',s>0);win(hx+s*6.32,4.6,hz-1.5,'x',false)}
  pBox(q,2.4,.15,.18,0xd8d0b8,hx,2.5,hz+4.86);for(const s of[-1,1])pBox(q,.18,2.5,.18,0xd8d0b8,hx+s*1.1,1.25,hz+4.86);
  pBox(q,4.4,.12,2.2,0x3a1e16,hx,2.9,hz+5.9,-.18,0,0);for(const s of[-1,1])pBox(q,.16,2.8,.16,0x4a3624,hx+s*2,1.4,hz+6.9);pBox(q,4.4,.2,2.2,0x6a665c,hx,.1,hz+5.9);
  for(const s of[-1,1])pBox(q,.9,.22,.3,0x5a3a22,hx+s*3.6,.98,hz+5.05);for(let i=0;i<6;i++)pBox(q,.12,.18,.12,i%2?0xb02a2a:0xe8c84a,hx-3.9+i*.12+(i>2?6.6:0),1.18,hz+5.05);
  const lp=new T.Mesh(gSph(.12,6,5),new T.MeshBasicMaterial({color:GL}));lp.position.set(hx+1.5,2.6,hz+5.1);scene.add(lp)}
 /* galpón */{const gx=X+22,gz=-306;for(let i=0;i<10;i++)pBox(q,.08,3.2,.06,DK,gx-4.5+i,1.6,gz-3.88);for(const s of[-1,1])pBox(q,10.4,.12,.3,0x2a2a26,gx,3.55,gz+s*4.05);pBox(q,10.4,.5,.12,0x4a3a28,gx,3.3,gz+3.9)}
 /* búnker de mando: puerta blindada abierta, marco, alas de hormigón, foco y cartel */{const bx=X+10,bz=-531,dz=bz+5;
  for(const s of[-1,1]){box(.5,2.5,2.2,0xffffff,bx+s*1.45,1.25,dz+1.4,scene,0,rt_(concT,1,1));oB13({x:10+s*1.45,z:dz+1.4,hw:.25,hd:1.1,h:2.5})}box(3.4,.5,2.4,0xffffff,bx,2.75,dz+1.4,scene,0,rt_(concT,1,1));
  pBox(q,1.8,.16,.16,0x2a2a2a,bx,2.42,dz+.32);for(const s of[-1,1])pBox(q,.16,2.4,.16,0x2a2a2a,bx+s*.86,1.2,dz+.32);
  const dg=new T.Group();dg.position.set(bx-.8,0,dz+.4);dg.rotation.y=-1.75;scene.add(dg);{const dq=PB();pBox(dq,1.5,2.3,.12,0x3a4038,.75,1.15,0);for(let i=0;i<4;i++)for(let j=0;j<3;j++)pCyl(dq,.035,.035,.03,0x2a2e28,.2+j*.55,.3+i*.6,.07,1.5708,0,0,6);pBox(dq,.08,.5,.08,0x6a6a62,1.3,1.1,.1);for(const y of[.4,1.9])pBox(dq,.16,.16,.16,0x2a2a2a,0,y,0);pbMesh(dq,dg,VCV)}
  pBox(q,1.4,.4,.05,0xe8e0c8,bx,3.25,dz+2.62);pBox(q,1.2,.06,.06,0x1a1a1a,bx,3.3,dz+2.66);pBox(q,.8,.06,.06,0x1a1a1a,bx-.1,3.17,dz+2.66);
  const lp=new T.Mesh(gSph(.14,6,5),new T.MeshBasicMaterial({color:0xffe0a0}));lp.position.set(bx+1.1,3.15,dz+2.7);scene.add(lp);
  for(const s of[-1,1]){pBox(q,1.6,1.2,10.5,0x4a4636,bx+s*9.4,.5,bz,0,0,s*.7);}pBox(q,17,.6,1.6,0x4a4636,bx,.25,bz-5.9,-.6,0,0);
  for(let i=0;i<5;i++)pBox(q,1.8,.08,1.6,0x3a4a2a,bx-6+i*3,3.75,bz-2+((i%2)*1.2),0,i*.4,0)}
 pbMesh(q,scene,VCV)}
{const _b27=build13;build13=function(){const was=L13.built;_b27();if(!was)deco27()}}
/* =====================================================================
   INTERROGATORIO DEL CHOFER (rehecho)
   ===================================================================== */
cineDriver13=function(){const X=X13,dv=L13.drv,Wn=L13.W,K=L13.K,M=L13.M,E=L13.E,D0=new T.Vector3(X+.5,0,-334.5);
 const lines=[['Weiss','¡Alto! ¡Manos arriba!'],['Chofer praguense','¡No disparen! ¡Me rindo!'],['Weiss','¡De rodillas! ¡Las manos en la cabeza!'],['Weiss','¿Adónde llevaban a los pilotos?'],['Chofer praguense','¡Al puesto del puente! ¡Están en los búnkeres! Los están interrogando.'],['Weiss','¿Cuántos guardias?'],['Chofer praguense','No sé... veinte, quizá más. Hay una guarnición, cañones y puestos de vigilancia.'],['Weiss','¿Qué viene por el ferrocarril?'],['Chofer praguense','Un tren militar. Trae refuerzos y equipo para la defensa de la ciudad.'],['Weiss','¿Cuándo llega?'],['Chofer praguense','¡En unos minutos! Por allá... desde el este.'],['Weiss','Krause, atalo. Müller, revisá el camión.'],['Krause','Con gusto. Quietito, amigo.']];
 const ev=[],LT=[];let t=.2;for(const [w,l] of lines){const tt=t;LT.push(tt);ev.push({t:tt,fn:()=>sayN13(w,l,Math.max(2,l.length*.05))});t+=Math.max(2.2,l.length*.052)}const TT=t+1.2;
 const fw=[Math.sin(0),Math.cos(0)];/* el chofer mira al sur (+z), hacia Weiss */
 const S=[Wn,K,M,E].filter(n=>n&&n.on);for(const n of S){n.lock=true;n.q=null;n.tgt=null;n.path=null}
 const P0={W:[D0.x+.5,D0.z+4.2],K:[D0.x-2.6,D0.z+2.2],M:[D0.x+2.8,D0.z+2.4],E:[D0.x+5.5,D0.z+5]};
 Wn.g.position.set(P0.W[0],0,P0.W[1]);if(K.on)K.g.position.set(P0.K[0]-1,0,P0.K[1]+2);if(M.on)M.g.position.set(P0.M[0]+1,0,P0.M[1]+2);if(E.on)E.g.position.set(P0.E[0],0,P0.E[1]);
 draw12(Wn,true);if(K.wpn==='p')draw12(K,true);if(M.wpn==='p')draw12(M,true);
 dv.path=null;dv.tgt=null;dv.act='surr';dv.g.position.set(D0.x,0,D0.z);dv.f=0;dv.g.rotation.y=0;
 const face=(n,x,z)=>{n.f=Math.atan2(x-n.g.position.x,z-n.g.position.z)},mv=(n,x,z,sp,dt)=>{const p=n.g.position,dx=x-p.x,dz=z-p.z,d=Math.hypot(dx,dz);if(d>.05){const s=Math.min(d,sp*dt);p.x+=dx/d*s;p.z+=dz/d*s;n.vx=dx/d*sp;n.vz=dz/d*sp}else{n.vx=n.vz=0}return d};
 const dp=()=>dv.g.position,dh=()=>[dp().x,dv.act==='surr'?1.65:1.05,dp().z],wh=()=>[Wn.g.position.x,1.72,Wn.g.position.z];
 L9.tick=dt=>{const T_=CIN9.t,d=dp();
  /* chofer: retrocede con las manos en alto → de rodillas → suplica → lo agarran → señala → atado */
  if(T_<LT[2])dv.act='surr',d.z=D0.z-Math.min(.8,T_*.3);else if(T_<LT[4])dv.act='kneel';else if(T_<LT[5])dv.act='beg';else if(T_<LT[7])dv.act='grabbed';else if(T_<LT[8])dv.act='kneel';else if(T_<LT[10])dv.act='beg';else if(T_<LT[11])dv.act='pointN';else dv.act='tied';
  if(dv.act==='pointN')dv.f=-.9;else dv.f=0;
  /* Weiss: avanza apuntando, se acerca, lo agarra del cuello, retrocede */
  const wd=T_<LT[1]?[P0.W[0],D0.z+2.6]:T_<LT[5]?[d.x+.25,d.z+1.45]:T_<LT[7]?[d.x+.15,d.z+.78]:T_<LT[11]?[d.x+.3,d.z+1.25]:[d.x+1.4,d.z+2.2];
  const wm=mv(Wn,wd[0],wd[1],T_<LT[1]?1.6:1.2,dt);Wn.act=wm>.08?'walk':T_>=LT[5]&&T_<LT[7]?'grab':'aimp';face(Wn,d.x,d.z);
  /* Krause y Müller cubren; Krause luego ata al chofer; Ernst vigila el camino */
  if(K.on){if(T_<LT[11]){const km=mv(K,P0.K[0],P0.K[1],2,dt);K.act=km>.08?'walk':K.wpn==='p'?'aimp':'aim';face(K,d.x,d.z)}else{const km=mv(K,d.x-.2,d.z-.75,1.4,dt);K.act=km>.08?'walk':'tie';face(K,d.x,d.z)}}
  if(M.on){if(T_<LT[11]){const mm=mv(M,P0.M[0],P0.M[1],2,dt);M.act=mm>.08?'walk':'crouchaim';face(M,d.x,d.z)}else{const mm=mv(M,L13.trk.position.x+1.8,L13.trk.position.z+1,2.2,dt);M.act=mm>.1?'walk':'idle';if(mm>.1)M.f=Math.atan2(M.vx,M.vz)}}
  if(E.on){E.act='crouchaim';E.f=Math.PI*.75}
  if(T_>=LT[5]&&T_<LT[5]+.1&&!L13.ev.g27){L13.ev.g27=1;tn18('square',180,120,.12,.05)}
  npcUpd11(dt);cam.position.x+=Math.sin(time*1.7)*.008;cam.position.y+=Math.sin(time*2.3)*.006};
 const d0x=()=>D0.x,d0z=()=>D0.z;const sh=[
  {d:LT[2],a:()=>[d0x()+4.2,1.15,d0z()+5.2],la:()=>{const w=Wn.g.position;return[(w.x+dp().x)/2,1.3,(w.z+dp().z)/2]}},
  {d:LT[4]-LT[2],a:()=>{const w=Wn.g.position;return[w.x+1.5,1.85,w.z+1.5]},la:dh},
  {d:LT[5]-LT[4],a:()=>[dp().x-1.4,1.0,dp().z+1.2],la:dh},
  {d:LT[7]-LT[5],a:()=>[dp().x-2.1,1.35,dp().z+.5],la:()=>[dp().x+.1,1.3,dp().z+.4]},
  {d:LT[8]-LT[7],a:()=>[dp().x-.15,1.1,dp().z+.25],la:wh},
  {d:LT[10]-LT[8],a:()=>{const w=Wn.g.position;return[w.x-.9,1.9,w.z+1.8]},la:dh},
  {d:LT[11]-LT[10],a:()=>[dp().x+1.9,1.3,dp().z+1.6],la:()=>[dp().x-6,1.5,dp().z-14]},
  {d:TT-LT[11],a:()=>[dp().x-3.4,2.4,dp().z+3.6],b:()=>[dp().x-4.2,3.4,dp().z+5],la:()=>[dp().x,.9,dp().z]}];

 cine9(sh,()=>{for(const n of S)n.lock=false;Wn.act='idle';if(K.on)K.act='idle';if(M.on)M.act='idle';dv.act='tied';dv.g.position.set(X+2.2,0,-342);dv.f=Math.PI;dv.g.rotation.y=Math.PI;L13.drvTied=true;go13(7)},ev)};
/* =====================================================================
   HUIDA EN EL CAMIÓN (rehecha): subida a la caja, disfraz, lona, control praguense
   ===================================================================== */
function tw27(t,x,y,z){t.updateMatrixWorld(true);return t.localToWorld(new T.Vector3(x,y,z))}
cineEnd13=function(){const X=X13,S=L13.sq.filter(n=>n.on),A=L13.A,V=L13.V,t2=L13.trk2,Wn=L13.W;
 const lines=[['Krause','¿Y ahora?'],['Capitán Adler','Ahora estamos en territorio enemigo, sin aeronave, sin apoyo y con una guarnición buscándonos.'],['Ernst','Al menos el tren no va a llevarlos a ningún lado.'],['Weiss','Tenemos que salir de acá. La explosión habrá alertado a toda la zona.'],['Capitán Adler','Hay una vieja ruta de suministro al oeste. Si llegamos a las colinas, podemos intentar contactar con nuestras líneas.'],['Teniente Vogel','Y no vamos a caminar: el camión del puesto tiene el depósito lleno.'],['Capitán Adler','Vogel y yo manejamos. Con estos capotes praguenses, en la oscuridad, nadie va a notar la diferencia.'],['Ernst','¿Y nosotros?'],['Weiss','Atrás, bajo la lona. Y callados.']];
 const ev=[];let t=.2;for(const [w,l] of lines){const tt=t;ev.push({t:tt,fn:()=>sayN13(w,l,Math.max(2,l.length*.05))});t+=Math.max(2.1,l.length*.05)}const T0=t;
 /* disfrazados: Adler y Vogel con capote y casco praguense */
 const dA=npc11(0,0,{coat:PRG.coat,hat:'helm',hatC:PRG.helm,act:'idle',name:'Adler'}),dV=npc11(0,0,{coat:PRG.coat,hat:'helm',hatC:PRG.helm,act:'idle',name:'Vogel'});for(const d of[dA,dV]){d.lv=13;d.g.visible=false;try{prg13({g:d.g},'r')}catch(e){}}L13.drvs=[dA,dV];
 const bed=S.filter(n=>n!==A&&n!==V);const SEAT=[[.66,-1.0],[-.66,-1.0],[.66,-2.1],[-.66,-2.1],[.66,-3.0],[-.66,-3.0]];
 /* lona trasera enrollable */let flap=t2.userData.flap;if(!flap){flap=new T.Group();flap.position.set(0,2.3,-3.43);const m=new T.Mesh(gBox(2.02,1.2,.03),new T.MeshLambertMaterial({color:0x8a8c7a}));m.position.y=-.6;flap.add(m);for(let i=0;i<3;i++){const s=new T.Mesh(gBox(.04,.3,.04),new T.MeshLambertMaterial({color:0x3a2a1a}));s.position.set(-.7+i*.7,-1.1,.03);flap.add(s)}flap.scale.y=.06;t2.add(flap);t2.userData.flap=flap}
 /* control praguense en el camino del oeste */const CX=X-96,CZ=t2.position.z;const bar=new T.Group();bar.position.set(CX,1.05,CZ-3.6);{const q=PB();pBox(q,.14,.14,7.4,0xd8d0c0,0,0,3.7);for(let i=0;i<5;i++)pBox(q,.15,.15,.7,0xb02a2a,0,0,.6+i*1.4);pbMesh(q,bar,VCV)}scene.add(bar);
 {const q=PB();pBox(q,.3,1.1,.3,0x3a3a36,CX,.55,CZ-3.6);pBox(q,1.8,2.3,1.8,0x4a3e2e,CX-1.4,1.15,CZ-5.4);pBox(q,2.1,.15,2.1,0x2a2620,CX-1.4,2.4,CZ-5.4);pBox(q,.05,.6,.9,0xffc870,CX-.48,1.5,CZ-5.4);for(let i=0;i<5;i++)pBox(q,1.1,.8,.6,0xb8ac88,CX+2.4,.4,CZ-4.4-i*.62,0,.2,0);const m=pbMesh(q,scene,VCV);L13.cp27=[bar,m]}
 const g1=npc11(CX+1.5,CZ-3.4,{coat:PRG.coat,hat:'helm',hatC:PRG.helm,act:'lantern',f:-1.5708}),g2=npc11(CX-.9,CZ-4.2,{coat:PRG.coat,hat:'helm',hatC:PRG.helm,act:'idle',f:1.2});for(const g of[g1,g2]){g.lv=13;try{prg13({g:g.g},'r')}catch(e){}}g2.g.userData.mR.add(mkRifle(0x5a3a22));
 const lan=new T.Mesh(gSph(.1,6,5),new T.MeshBasicMaterial({color:0xffd080}));lan.position.set(0,-.5,.15);g1.g.userData.mR.add(lan);
 /* estado de cada pasajero */const st=new Map();bed.forEach((n,i)=>st.set(n,{i,ph:'w',c:0,seat:SEAT[i%SEAT.length]}));
 let v=0,started=false,stopped=false,go=false,lastX=t2.position.x;const fd=$('fade12');
 ev.push({t:T0+.05,fn:()=>{if(!t2.userData.lt27){const l=new T.PointLight(0xffb060,1.6,6);l.position.set(0,1.95,-1.4);t2.add(l);t2.userData.lt27=l;const lm=new T.Mesh(gSph(.07,6,5),new T.MeshBasicMaterial({color:0xffd090}));lm.position.set(0,2.2,-1.4);t2.add(lm)}/* corte: todos junto al camión */const tail=tw27(t2,0,0,-5.4);bed.forEach((n,i)=>{n.lock=true;n.q=null;n.tgt=null;n.path=null;n.g.visible=true;n.seated=false;n.g.position.set(tail.x+2+i*1.3,0,tail.z+(i%2?1.2:-1.2));n.act='idle'});
   const door=tw27(t2,-1.6,0,.9);A.lock=V.lock=true;A.tgt=V.tgt=null;A.g.position.set(door.x+2.2,0,door.z-1.2);V.g.position.set(door.x+3.4,0,door.z-1.6);A.seated=V.seated=false;A.act=V.act='idle';A.g.position.y=V.g.position.y=0},must:true});
 ev.push({t:T0+3.4,fn:()=>{sqOn13(A,false);sqOn13(V,false);const door=tw27(t2,-1.5,0,.9);dA.g.visible=dV.g.visible=true;dA.g.position.set(door.x+.6,0,door.z-.5);dV.g.position.set(door.x+1.6,0,door.z-.9);dA.act='coat';dV.act='coat';dA.f=dV.f=t2.rotation.y-1.5708;sayN13('Teniente Vogel','Huele a tabaco praguense.',1.8)},must:true});
 ev.push({t:T0+5.4,fn:()=>sayN13('Capitán Adler','Entonces huele a camuflaje. Arriba.',2)});
 ev.push({t:T0+8.6,fn:()=>{for(const d of[dA,dV]){d.seated=true;d.act='clean'}sayN13('Weiss','Lona abajo. Nadie respira.',2)},must:true});
 ev.push({t:T0+10.2,fn:()=>{nz18(0,3,'lowpass',260,120,.08);tn18('sawtooth',50,70,2,.05);started=true}});
 ev.push({t:T0+19.5,fn:()=>sayN13('Centinela praguense','¡Alto! ¿Adónde van a estas horas?',2.2)});
 ev.push({t:T0+22,fn:()=>sayN13('Teniente Vogel','Refuerzos para el puente. Órdenes del capitán.',2.4)});
 ev.push({t:T0+24.6,fn:()=>sayN13('Centinela praguense','...¿El puente? ¡El puente acaba de volar, idiota! ¡Muévanse!',2.6)});
 ev.push({t:T0+27.4,fn:()=>{go=true;tn18('sawtooth',60,90,1.5,.05)},must:true});
 ev.push({t:T0+30.4,fn:()=>sayN13('Ernst','Como en el cepelín... pero sin la vista.',2.4)});
 L9.tick=dt=>{const tt=CIN9.t;
  if(tt>T0){const tail=tw27(t2,0,0,-4.6),ry=t2.rotation.y;
   for(const [n,s] of st){if(s.ph==='w'){if(tt<T0+.4+s.i*.9){n.act='idle';continue}const p=n.g.position,dx=tail.x-p.x,dz=tail.z-p.z,d=Math.hypot(dx,dz);if(d>.15){const k=Math.min(d,2.6*dt);p.x+=dx/d*k;p.z+=dz/d*k;n.vx=dx/d*2.6;n.vz=dz/d*2.6;n.act='walk';n.f=Math.atan2(dx,dz);n.g.rotation.y=n.f}else{s.ph='c';s.c=0;n.vx=n.vz=0}}
    else if(s.ph==='c'){s.c+=dt/1.0;n.act='climb';const k=Math.min(1,s.c),a=tw27(t2,0,0,-4.6),b=tw27(t2,0,.672,-2.95);n.g.position.set(a.x+(b.x-a.x)*k,(b.y)*Math.sin(k*1.5708)+Math.sin(k*3.14)*.25,a.z+(b.z-a.z)*k);n.g.rotation.y=n.f=ry;if(s.c>=1){s.ph='m';s.c=0}}
    else if(s.ph==='m'){s.c+=dt/.7;const k=Math.min(1,s.c),a=tw27(t2,0,.672,-2.95),b=tw27(t2,s.seat[0],.672,s.seat[1]);n.g.position.set(a.x+(b.x-a.x)*k,b.y,a.z+(b.z-a.z)*k);n.act='walk';if(s.c>=1){s.ph='s';n.act='sit';n.seated=true}}
    else{const b=tw27(t2,s.seat[0],.672,s.seat[1]);n.g.position.copy(b);n.act=n===Wn&&tt>T0+8&&tt<T0+12?'point':'sit';n.f=ry+(s.seat[0]>0?-1.5708:1.5708);n.g.rotation.y=n.f}}
   if(dA.seated){const a=tw27(t2,-.45,.943,.75),b=tw27(t2,.45,.943,.75);dA.g.position.copy(a);dV.g.position.copy(b);dA.f=dV.f=t2.rotation.y;dA.g.rotation.y=dV.g.rotation.y=dA.f}
   if(tt>T0+9&&tt<T0+11)flap.scale.y=Math.min(1,.06+(tt-T0-9)*.6);
   if(started){const px=t2.position.x;let tv=8;if(!go){const rem=px-(CX+5.6);tv=rem>0?Math.min(8,Math.sqrt(2*3.2*rem)):0;if(rem<=.05)stopped=true}else tv=11;v+=(tv-v)*Math.min(1,dt*(tv>v?1.4:2.5));if(!go&&stopped)v=0;t2.position.x-=v*dt;truckDrive13(t2,lastX-t2.position.x,true);lastX=t2.position.x;if(R()<dt*(v>.5?10:3))smoke(t2.position.x+4.8,.4,t2.position.z+.5,.5,1.1,0x5a5a5a,.3,.35)}
   if(tt>T0+18&&tt<T0+27){g1.f=Math.atan2(t2.position.x-g1.g.position.x,t2.position.z+1.5-g1.g.position.z)}
   if(tt>T0+18.4&&tt<T0+21){const p=g1.g.position;p.z+=(CZ-2.1-p.z)*dt*1.5;p.x+=(t2.position.x-1.0-p.x)*dt*1.2;g1.vx=1}
   if(go){bar.rotation.x=Math.max(-1.35,bar.rotation.x-dt*1.2);g2.act=tt<T0+29.5?'wave':'idle'}}
  npcUpd11(dt);if(L13.piv&&R()<dt*5)smoke(L13.piv.position.x+(R()-.5)*30,4,-560,8,8,0x2a2826,2,.6)};
 const tp=()=>t2.position;
 cine9([{d:T0*.5,a:()=>{const n=L13.W;return[n.g.position.x-2.2,1.5,n.g.position.z+2.4]},la:()=>{const n=L13.A;return[n.g.position.x,1.4,n.g.position.z]}},{d:T0*.5,a:[X+9,1.6,-541],la:[X+5,1.2,-545.5]},
  {d:3.4,a:()=>{const p=tw27(t2,2.6,1.6,-8.5);return[p.x,p.y,p.z]},la:()=>{const p=tw27(t2,0,1.2,-3.2);return[p.x,p.y,p.z]}},
  {d:2.6,a:()=>{const p=tw27(t2,-4.4,1.7,1.2);return[p.x,p.y,p.z]},la:()=>{const p=tw27(t2,-1.4,1.4,.9);return[p.x,p.y,p.z]}},
  {d:2.6,a:()=>{const p=tw27(t2,2.2,1.9,-6.5);return[p.x,p.y,p.z]},la:()=>{const p=tw27(t2,0,1.3,-2.4);return[p.x,p.y,p.z]}},
  {d:2.6,a:()=>{const p=tw27(t2,0,1.95,-.45);return[p.x,p.y,p.z]},la:()=>{const p=tw27(t2,0,1.5,-3.4);return[p.x,p.y,p.z]}},
  {d:5,a:()=>{const p=tw27(t2,-6,2.2,-2);return[p.x,p.y,p.z]},la:()=>{const p=tw27(t2,0,1.4,1);return[p.x,p.y,p.z]}},
  {d:12.5,a:[CX-7,4.6,CZ-6.4],la:()=>[Math.max(CX+1,tp().x-3),1.4,tp().z-.8]},
  {d:3.2,a:()=>{const p=tw27(t2,0,1.95,-.45);return[p.x,p.y,p.z]},la:()=>{const p=tw27(t2,0,1.5,-3.4);return[p.x,p.y,p.z]}},
  {d:7.5,a:()=>[tp().x+30,34,tp().z+22],b:()=>[tp().x+18,52,tp().z+46],la:()=>[tp().x,0,tp().z],txt:'MISIÓN COMPLETADA · LOS QUE QUEDARON ATRÁS',fn:()=>{scene.fog.far+=(260-scene.fog.far)*.05;scene.fog.near=20}}],
  ()=>{fd.style.opacity=1;setTimeout(()=>{if(level===13)end(true)},900)},ev.concat([{t:T0+38.6,fn:()=>{fd.style.transition='opacity 3s';fd.style.opacity=1}}]))};
/* ---------- integración ---------- */
{const _up27=update;update=function(dt){_up27(dt);try{mm27(dt||0);bcUpd27(dt||0)}catch(e){}}}
