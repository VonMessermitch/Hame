/* =====================================================================
   v19 · CRÓNICAS DE HIERRO — OPERACIÓN TRIDENTE DE ACERO
   Capítulo X: «El incendio de Alejandría». El jugador es el Gefreiter
   Kasimir Wolff, Sturmtruppe del Ejército Imperial de Eisenmark (1922).
   ===================================================================== */
const X10=22000;
const L10={built:false,ph:0,under:false,alarm:false,det:0,st:0,t:0};
const EIS={coat:0x5a5e44,pants:0x3e402e,helm:0x2e302a,trim:0xc89030,tab:0xc89030};
function mkEis(o){o=o||{};const g=mkSoldier(Object.assign({coat:EIS.coat,pants:EIS.pants,hat:'helm',hatC:EIS.helm,tab:EIS.tab,trim:EIS.trim,puttee:0x4a4a36,packC:0x5a4a30},o));const u=g.userData;
 if(o.mask){const q=PB();pCyl(q,.075,.09,.16,0x3a3a30,0,.07,.21,1.3,0,0,8);pCyl(q,.06,.06,.03,0x1a1a1a,0,.03,.29,1.3,0,0,8);for(const s of[-1,1]){pCyl(q,.055,.055,.03,0x1a2a2a,s*.08,.2,.18,1.5708,0,0,8);pCyl(q,.06,.06,.02,0x6a6a5a,s*.08,.2,.17,1.5708,0,0,8)}pBox(q,.36,.24,.02,0x3a3a30,0,.13,.175);pbMesh(q,u.hd,VCM)}
 if(o.armor){const q=PB();pBox(q,.7,.62,.1,0x5a5e62,0,.36,.23,.06);for(let i=0;i<3;i++)pBox(q,.72,.04,.11,0x3a3e42,0,.18+i*.18,.24);for(const s of[-1,1])pBox(q,.3,.14,.42,0x5a5e62,s*.4,.7,0,0,0,s*.25);pbMesh(q,u.ch,SABM)}
 return g}
/* jugador del cap. X: Sturmtruppe de Eisenmark (uniforme, casco oscuro, máscara de gas) */
function playerEis(on){const M={0x4f6272:EIS.coat,0x3b4852:EIS.pants,0x4a5258:EIS.helm};P.g.traverse(o=>{if(!o.material||o.material===VCM||o.material.vertexColors)return;const m=o.material;if(on){if(m.u19===undefined)m.u19=m.color.getHex();const h=M[m.u19];if(h!==undefined)m.color.setHex(h)}else if(m.u19!==undefined)m.color.setHex(m.u19)});
 if(!V18.mask){const q=PB();pCyl(q,.075,.09,.16,0x3a3a30,0,.07,.21,1.3,0,0,8);for(const s of[-1,1])pCyl(q,.055,.055,.03,0x1a2a2a,s*.08,.2,.18,1.5708,0,0,8);pBox(q,.36,.24,.02,0x3a3a30,0,.13,.175);pCyl(q,.02,.02,.4,0x2a2a22,.12,-.05,.12,.4,0,.6,6);V18.mask=pbMesh(q,P.g.userData.hd,VCM)}V18.mask.visible=on}
/* ---------- TANQUETAS de Eisenmark (reconocimiento con MG, apoyo con cañón ligero) ---------- */
function mkTankette(kind,col){const g=new T.Group(),q=PB(),C=col||0x5a5e44,D=shade(C,.7);pBox(q,2.0,.9,3.4,C,0,1.0,0);pBox(q,1.96,.1,1.0,shade(C,.92),0,1.38,1.6,-.5);pBox(q,1.9,.5,.1,C,0,.8,1.75,.45);for(const s of[-1,1]){for(let i=0;i<8;i++)pBox(q,.04,.04,.04,shade(C,.6),s*1.0,1.35,-1.4+i*.38);pBox(q,.7,.05,3.6,D,s*1.12,1.08,0);pCyl(q,.1,.1,.15,0x222222,s*.6,1.25,1.8,1.5708,0,0,8)}
 pBox(q,.5,.06,.5,0xc89030,0,1.46,-.9);pBox(q,.04,.4,.04,0x1a1a1a,0,1.46,-.9);pBox(q,1.2,.3,.6,0x4a4a36,0,1.6,-1.4);pBox(q,.5,.1,.3,0xd8d0b0,.75,1.1,1.72,.45);pbMesh(q,g,VCV);
 const tm=new T.MeshLambertMaterial({map:trkT.clone()});tm.map.needsUpdate=true;tm.map.repeat.set(5,1);for(const s of[-1,1]){const t=PB(),X=s*1.12;pBox(t,.55,.08,3.0,0xffffff,X,.92,0,0,0,0,0);pBox(t,.55,.08,3.2,0xffffff,X,.05,0,0,0,0,0);pBox(t,.55,.08,.9,0xffffff,X,.5,1.75,-1,0,0,0);pBox(t,.55,.08,.9,0xffffff,X,.5,-1.75,1,0,0,0);pbMesh(t,g,tm)}
 const W=[],rg=roadWheelGeo(.34,'sh');for(const s of[-1,1])for(const z of[-1.1,0,1.1]){const w=new T.Mesh(rg,VCV);w.position.set(s*1.12,.4,z);w.scale.set(.8,1,1);g.add(w);W.push(w)}
 const tur=new T.Group();tur.position.set(0,1.5,.1);g.add(tur);const tq=PB();pCyl(tq,.62,.7,.6,shade(C,1.05),0,.3,0,0,0,0,10);pCyl(tq,.4,.4,.08,D,-.1,.64,-.15,0,0,0,10);pBox(tq,.36,.3,.4,D,0,.3,.6);pbMesh(tq,tur,VCV);
 const gun=new T.Group();gun.position.set(0,.3,.75);tur.add(gun);const gq=PB();if(kind==='sup'){pCyl(gq,.08,.09,1.9,0x2a2a2a,0,0,.95,1.5708,0,0,8);pCyl(gq,.12,.12,.25,0x1a1a1a,0,0,1.9,1.5708,0,0,8)}else{pCyl(gq,.05,.05,.9,0x1a1a1a,-.12,0,.45,1.5708,0,0,6);pCyl(gq,.05,.05,.9,0x1a1a1a,.12,0,.45,1.5708,0,0,6);pBox(gq,.4,.2,.3,0x2a2a2a,0,0,0)}pbMesh(gq,gun,VCV);const muz=new T.Object3D();muz.position.set(0,0,kind==='sup'?2.05:.95);gun.add(muz);
 const mgr=new T.Group();mgr.position.set(-.1,.7,-.15);tur.add(mgr);const mmz=new T.Object3D();mmz.position.set(0,.4,.9);mgr.add(mmz);const cmd=mkEis({hat:'cap',hatC:0x2e302a,pack:false,scale:.9});cmd.userData.l1.visible=cmd.userData.l2.visible=false;cmd.children.forEach(c=>{if(c.geometry===shG)c.visible=false});cmd.position.set(0,-.95,0);mgr.add(cmd);
 g.userData={v16:'tank',tur,gun,muz,mgr,mmz,gunner:cmd,wh:W,trk:tm,rec:0,mgRec:0};scene.add(g);return g}
const TK10=[];
function spawnTK(kind,x,z,name){const g=mkTankette(kind);g.position.set(x,0,z);const t={g,kind,name,hp:kind==='sup'?900:700,max:kind==='sup'?900:700,alive:true,path:null,pi:0,cd:2,mcd:0,ob:{x,z,r:2},hold:false};obst.push(t.ob);TK10.push(t);
 L9.tgts.push({p:g.position,r:2.2,y:2.4,bias:4,h:d=>tkDamage(t,d),ok:()=>t.alive});return t}
function tkDamage(t,d){if(!t.alive)return;t.hp-=d*.7;if(t.hp<=0){t.alive=false;boom9(t.g.position.x,t.g.position.z,1.4,false);mkFire(t.g.position.x,t.g.position.z,1,1,-1);t.g.userData.tur.rotation.z=.4;feed('✝ La tanqueta '+t.name+' ha sido destruida');say('¡Han volado la '+t.name+'!',2.5)}}
function vehTarget(p,maxd){let b=null,bd=maxd;for(const e of enemies){if(!e.active)continue;const d=Math.hypot(e.g.position.x-p.x,e.g.position.z-p.z)-(BIG(e)?8:0);if(d<bd){bd=d;b={p:e.g.position,y:1.2*e.s,hit:x=>hurt(e,x,'b',{name:'Tanqueta de Eisenmark'}),e}}}
 for(const h of HIT9)if(h.foe&&h.ok()){const d=Math.hypot(h.x()-p.x,h.z()-p.z)-12;if(d<bd){bd=d;b={p:new T.Vector3(h.x(),0,h.z()),y:1.5,hit:x=>h.dmg(x,'x'),h}}}return b}
function tkUpd(dt){for(const t of TK10){const g=t.g,u=g.userData,p=g.position;if(!t.alive){if(R()<dt*3)smoke(p.x,2,p.z,3,3,0x1a1a1a,1.5,.5);continue}const tg=vehTarget(p,70);let sp=0;
 if(t.path&&t.pi<t.path.length&&!t.hold){const w=t.path[t.pi],dx=w[0]-p.x,dz=w[1]-p.z,d=Math.hypot(dx,dz);if(d<2.5)t.pi++;else{g.rotation.y=angL(g.rotation.y,Math.atan2(dx,dz),Math.min(1,dt*.9));sp=tg&&Math.hypot(tg.p.x-p.x,tg.p.z-p.z)<30?1.6:3.2;p.x+=Math.sin(g.rotation.y)*sp*dt;p.z+=Math.cos(g.rotation.y)*sp*dt;const oi=obst.indexOf(t.ob);if(oi>=0)obst.splice(oi,1);resolve(p,1.6);obst.push(t.ob);t.ob.x=p.x;t.ob.z=p.z}}
 tankAnim(g,sp,dt);if(!tg){u.mtg=null;continue}const err=tankTurret(g,tg.p.x,tg.p.z,dt,1.6);t.cd-=dt;
 if(t.kind==='sup'){if(t.cd<=0&&err<.1){t.cd=3.2+R();u.muz.getWorldPosition(_tv);u.rec=1;burst(_tv.x,_tv.y,_tv.z,0xffcc66,8,.2,8);smoke(_tv.x,_tv.y,_tv.z,3,2,0x8a8a8a,.6,.5);npcShot('big',_tv.x,_tv.z);const tp=tg.p.clone(),h=tg.h;setTimeout(()=>{if(level!==10)return;if(h)h.dmg(320,'x');boom9(tp.x,tp.z,1,false)},280)}}
 else if(t.cd<=0&&err<.2){t.cd=.11;t.mb=(t.mb||0)+1;if(t.mb>10){t.mb=0;t.cd=.9}u.muz.getWorldPosition(_tv);u.mgRec=1;_tw.set(tg.p.x+(R()-.5)*1.2,tg.y,tg.p.z+(R()-.5)*1.2);trc16(_tv,_tw,0xffb050);npcShot('mg',_tv.x,_tv.z);if(R()<.4)tg.hit(14)}}}
/* ---------- DRACOS TERRESTRES: animales de guerra (asalto, transporte, pesado, rastreo) ---------- */
function mkDraco(kind,cA,cB){const s={asalto:1,transporte:1.15,pesado:1.5,rastreo:.8}[kind]||1;const g=new T.Group(),bd=new T.Group();bd.position.y=1.5;g.add(bd);const q=PB();
 pa(q,gSph(1,12,9),cA,0,0,0,0,0,0,1.05,.9,2.0);pa(q,gSph(.9,10,8),shade(cA,1.15),0,-.35,.1,0,0,0,.95,.6,1.7);for(let i=0;i<7;i++)pBox(q,.5-i*.03,.14,.5,cB,0,.82-i*.02,1.2-i*.42,.2);for(let i=0;i<6;i++)pa(q,gCone(.12,.45,4),0xd8c890,0,.95,1.1-i*.42,-.4);
 if(kind==='asalto'||kind==='pesado'){pBox(q,1.6,1.1,.16,0x4a4e52,0,.1,1.85,.25);for(let i=0;i<4;i++)pBox(q,.1,.1,.18,0x9a9a90,-.6+i*.4,.4,1.94);for(const sd of[-1,1])pBox(q,.1,.8,1.6,0x4a4e52,sd*1.0,.1,.6,0,0,sd*.2)}
 if(kind==='transporte'){pBox(q,1.8,.12,2.0,0x5a4630,0,1.05,-.3);for(const sd of[-1,1])pBox(q,.08,.6,2.0,0x5a4630,sd*.9,1.35,-.3);pBox(q,1.8,.6,.08,0x5a4630,0,1.35,.68)}
 if(kind==='pesado'){for(let i=0;i<3;i++)pa(q,gCone(.25,.9,6),0x4a4e52,0,.2,2.2-i*.05,1.4)}pbMesh(q,bd,VCM);
 const neck=new T.Group();neck.position.set(0,.35,1.8);neck.rotation.x=-.35;bd.add(neck);{const n=PB();pCyl(n,.38,.5,1.3,cA,0,.55,0,0,0,0,8);for(let i=0;i<3;i++)pa(n,gCone(.1,.35,4),0xd8c890,0,.6+i*.35,-.38,-.6);pbMesh(n,neck,VCM)}
 const head=new T.Group();head.position.set(0,1.2,.1);neck.add(head);{const h=PB();pBox(h,.62,.5,.9,cA,0,0,.35);pBox(h,.5,.25,.6,shade(cA,1.1),0,-.08,.9);for(const sd of[-1,1]){pa(h,gCone(.08,.55,5),0xe8e0c0,sd*.24,.3,-.05,-.9,0,sd*.3);pBox(h,.1,.08,.05,0x111111,sd*.27,.12,.55)}for(let i=0;i<5;i++)pa(h,gCone(.03,.12,4),0xf0e8d0,-.18+i*.09,-.2,1.1,Math.PI);if(kind==='asalto'||kind==='pesado')pBox(h,.66,.1,.7,0x4a4e52,0,.27,.4);pbMesh(h,head,VCM)}
 for(const sd of[-1,1]){const ey=new T.Mesh(gSph(.06,6,5),new T.MeshBasicMaterial({color:0xffc020}));ey.position.set(sd*.28,.13,.58);head.add(ey)}
 const jaw=new T.Group();jaw.position.set(0,-.22,.15);head.add(jaw);{const j=PB();pBox(j,.48,.14,.95,shade(cA,.9),0,-.05,.5);for(let i=0;i<5;i++)pa(j,gCone(.03,.12,4),0xf0e8d0,-.18+i*.09,.06,.95);pbMesh(j,jaw,VCM)}
 const tail=[];let par=bd,z0=-1.9;for(let i=0;i<4;i++){const t=new T.Group();t.position.set(0,i?0:.1,i?-1.0:z0);par.add(t);const tq=PB();pCyl(tq,.42-i*.09,.32-i*.08,1.1,cA,0,0,-.5,1.5708,0,0,8);pa(tq,gCone(.08,.3,4),0xd8c890,0,.32-i*.07,-.5,-.3);pbMesh(tq,t,VCM);tail.push(t);par=t}
 const legs=[];for(const [x,z] of[[-.75,1.0],[.75,1.0],[-.8,-1.0],[.8,-1.0]]){const up=new T.Group();up.position.set(x,-.25,z);bd.add(up);{const a=PB();pa(a,gSph(.4,8,6),cA,0,-.1,0,0,0,0,1,1.3,1.1);pbMesh(a,up,VCM)}const lo=new T.Group();lo.position.y=-.6;up.add(lo);{const b=PB();pCyl(b,.22,.18,.7,shade(cA,.9),0,-.3,0,0,0,0,8);for(let i=0;i<3;i++)pa(b,gCone(.06,.2,4),0xe8e0c0,-.12+i*.12,-.68,.18,1.4);pBox(b,.4,.12,.45,shade(cA,.8),0,-.66,.06);pbMesh(b,lo,VCM)}legs.push([up,lo])}
 const sh=new T.Mesh(shG,shM);sh.rotation.x=-1.5708;sh.position.y=.04;sh.scale.set(3,5,1);g.add(sh);g.scale.setScalar(s);scene.add(g);return{g,bd,neck,head,jaw,tail,legs,s}}
const DR10=[];
function spawnDraco(kind,side,x,z,name){const c=side==='e'?[0x4a2a24,0x1a1010]:[{asalto:0x5a6a3a,transporte:0x6a6040,pesado:0x4a5040,rastreo:0x7a6a4a}[kind],0x2a2a20];const D=mkDraco(kind,c[0],c[1]);D.g.position.set(x,0,z);const hp={asalto:900,transporte:800,pesado:1600,rastreo:500}[kind]*(side==='e'?.8:1);
 const d=Object.assign(D,{kind,side,name,hp,max:hp,alive:true,st:'follow',t:R()*5,cd:1,ccd:4,vx:0,vz:0,charge:0,atk:0,atkK:0,anchor:null,fall:0});DR10.push(d);
 if(side==='e')HIT9.push({foe:true,x:()=>d.g.position.x,z:()=>d.g.position.z,y0:0,y1:3*d.s,r:1.8*d.s,ok:()=>d.alive,dmg:(v,k)=>drDamage(d,v*(k==='b'?.6:1))});
 else L9.tgts.push({p:D.g.position,r:1.8*D.s,y:3*D.s,bias:3,h:v=>drDamage(d,v),ok:()=>d.alive});return d}
function drDamage(d,v){if(!d.alive)return;d.hp-=v;burst(d.g.position.x,2*d.s,d.g.position.z,0x8a2a1a,3,.3,3);if(d.hp<=0){d.alive=false;d.fall=.001;tn18('sawtooth',90,30,1.4,.08);feed(d.side==='e'?'★ ¡Draco enemigo abatido!':'✝ El draco '+d.name+' ha caído');if(d.side==='e')score+=1800}}
function drTargets(d){const L=[];if(d.side==='a'){for(const e of enemies)if(e.active)L.push({p:e.g.position,hit:v=>hurt(e,v,'m',{name:'Draco '+d.name}),veh:false,k:e});for(const o of DR10)if(o.alive&&o.side==='e')L.push({p:o.g.position,hit:v=>drDamage(o,v),veh:true});if(ET10&&ET10.alive)L.push({p:ET10.g.position,hit:v=>etDamage(v,'ram'),veh:true})}
 else{L.push({p:P.g.position,hit:v=>hitP(v*.4)});for(const a of allies)if(a.name&&a.g.visible&&!(a.down>0))L.push({p:a.g.position,hit:v=>allyDamage(a,v*.5)});for(const s of GAR)if(s.alive&&s.g.visible)L.push({p:s.g.position,hit:v=>garDamage(s,v,null)});for(const c of CAV)if(c.alive&&c.g.visible)L.push({p:c.g.position,hit:v=>cavDamage(c,v)});for(const t of TK10)if(t.alive)L.push({p:t.g.position,hit:v=>tkDamage(t,v),veh:true});for(const o of DR10)if(o.alive&&o.side==='a')L.push({p:o.g.position,hit:v=>drDamage(o,v),veh:true})}return L}
function drAnim(d,dt){const v=Math.hypot(d.vx,d.vz);d.t+=dt*(1+v*.35);const ph=d.t*3,k=Math.min(1,v/6);
 if(!d.alive){if(d.fall>0&&d.fall<1){d.fall=Math.min(1,d.fall+dt*.8);d.g.rotation.z=1.3*ez(d.fall);d.jaw.rotation.x=.5}return}
 d.legs.forEach((l,i)=>{const o=[0,Math.PI,Math.PI*.5,Math.PI*1.5][i];l[0].rotation.x=v>.4?Math.sin(ph+o)*(.3+k*.4):0;l[1].rotation.x=v>.4?Math.max(0,Math.sin(ph+o+1))*(.5+k*.3):0});
 d.bd.position.y=1.5+Math.abs(Math.sin(ph))*.08*k;d.bd.rotation.z=Math.sin(ph*.5)*.04*k;d.tail.forEach((t,i)=>{t.rotation.y=Math.sin(d.t*1.6-i*.7)*.18;t.rotation.x=.05});d.neck.rotation.x=-.35+Math.sin(d.t*1.3)*.05;
 d.atk=Math.max(0,d.atk-dt);if(d.atk>0){const q=1-d.atk/.5;if(d.atkK==='bite'){d.jaw.rotation.x=q<.4?.7*q/.4:.7*(1-(q-.4)/.6);d.neck.rotation.x=-.35+Math.sin(q*Math.PI)*.45}else{d.bd.rotation.x=-Math.sin(q*Math.PI)*.4;d.legs[0][0].rotation.x=d.legs[1][0].rotation.x=-Math.sin(q*Math.PI)*1.1}}else d.jaw.rotation.x=Math.max(0,Math.sin(d.t*.7))*.12;d.bd.rotation.x*=.9}
function drUpd(dt){for(const d of DR10){drAnim(d,dt);if(!d.alive)continue;const p=d.g.position;d.cd-=dt;d.ccd-=dt;const T_=drTargets(d);let tg=null,td=d.side==='a'?36:60;const an=d.anchor?d.anchor():null;
 for(const t of T_){const dd=Math.hypot(t.p.x-p.x,t.p.z-p.z);if(an&&d.side==='a'&&Math.hypot(t.p.x-an.x,t.p.z-an.z)>42)continue;if(dd<td){td=dd;tg=t}}let tx=p.x,tz=p.z,sp=0;
 if(d.charge>0){d.charge-=dt;sp=14;const fx=Math.sin(d.g.rotation.y),fz=Math.cos(d.g.rotation.y);tx=p.x+fx*10;tz=p.z+fz*10;for(const t of T_){if(t.hitC===d)continue;if(Math.hypot(t.p.x-p.x,t.p.z-p.z)<2.6*d.s){t.hit(t.veh?520:210);t.hitC=d;burst(t.p.x,1.4,t.p.z,0xd8b080,10,.5,6);shake=Math.max(shake,.7);tn18('sawtooth',70,40,.4,.08);if(t.k){t.k.stun=1;t.k.g.position.x+=fx*5;t.k.g.position.z+=fz*5}}}}
 else if(tg){tx=tg.p.x;tz=tg.p.z;sp=d.kind==='pesado'?5.5:7.5;if(td>11&&td<26&&d.ccd<=0){d.ccd=7+R()*3;d.charge=1.6;d.g.rotation.y=Math.atan2(tx-p.x,tz-p.z);tn18('sawtooth',120,50,1,.07);nz18(.1,1,'lowpass',500,150,.06);if(d.side==='a'&&R()<.5)say('¡El draco '+d.name+' embiste!',1.6)}
  if(td<3.4*d.s){sp=0;if(d.cd<=0){d.cd=1.25;if(R()<.6){d.atk=.5;d.atkK='bite';tg.hit(d.kind==='pesado'?190:140);tn18('square',180,90,.15,.05)}else{d.atk=.5;d.atkK='stomp';setTimeout(()=>{if(!d.alive)return;for(const t of T_)if(Math.hypot(t.p.x-p.x,t.p.z-p.z)<5.5*d.s)t.hit(t.veh?150:80);burst(p.x,.3,p.z,0xc0a070,20,.7,8);expSnd(p.x,p.z,.6);shake=Math.max(shake,.5)},220)}}}}
 else if(an){tx=an.x;tz=an.z;sp=Math.hypot(tx-p.x,tz-p.z)>6?5:0}
 const dx=tx-p.x,dz=tz-p.z,dd=Math.hypot(dx,dz);let mx=0,mz=0;if(sp&&dd>.8){if(d.charge>0){mx=Math.sin(d.g.rotation.y)*sp;mz=Math.cos(d.g.rotation.y)*sp}else{const s2=steer(d,dx,dz,dt);mx=s2[0]*sp;mz=s2[1]*sp}}const k=Math.min(1,dt*3);d.vx+=(mx-d.vx)*k;d.vz+=(mz-d.vz)*k;p.x+=d.vx*dt;p.z+=d.vz*dt;resolve(p,1.4*d.s);if(Math.hypot(d.vx,d.vz)>.5&&!(d.charge>0))d.g.rotation.y=angL(d.g.rotation.y,Math.atan2(d.vx,d.vz),Math.min(1,dt*3));
 if(d.side==='a'&&!d.bk){d.bk=1;d.rt=10}d.rt=(d.rt||10)-dt;if(d.rt<=0){d.rt=9+R()*9;tn18('sawtooth',110+R()*40,55,1.1,.05)}}}
/* ---------- CATAFRACTOS: caballos blindados y lanzas de descarga eléctrica ---------- */
const LNC=new T.MeshBasicMaterial({color:0x7ab8ff});
function mkCat10(i,x,z){const H=mkHorse9([0x3a3028,0x2a2018,0x4a3a2a][i%3],0x2a2a3a);const pl=PB();pBox(pl,1.1,.5,.12,0x6a6e72,0,.1,1.26,.3);pBox(pl,1.1,.55,.6,0x5a5e62,0,.15,-.95);for(const s of[-1,1])pBox(pl,.08,.6,1.4,0x6a6e72,s*.55,-.05,.1);pbMesh(pl,H.body,SABM);{const c=PB();pBox(c,.34,.9,.5,0x6a6e72,0,.45,.05);pbMesh(c,H.neck,SABM)}{const c=PB();pBox(c,.3,.32,.62,0x7a7e82,0,.08,.26);pa(c,gCone(.05,.35,4),0xc8ccd2,0,.3,.5,-.6);pbMesh(c,H.head,SABM)}
 const r=mkSoldier({coat:0x3a3a40,pants:0x2a2a30,hat:'helm',hatC:0x6a6e72,pack:false,scale:1.02,puttee:0x1a1a1a});r.children.forEach(c=>{if(c.geometry===shG)c.visible=false});const u=r.userData;{const a=PB();pBox(a,.72,.66,.46,0x6a6e72,0,.36,0);for(const s of[-1,1])pBox(a,.3,.16,.44,0x7a7e82,s*.42,.68,0,0,0,s*.3);pBox(a,.8,.1,.5,0xc89030,0,.05,0);pbMesh(a,u.ch,SABM)}{const hq=PB();pBox(hq,.36,.08,.04,0x111111,0,.2,.2);pa(hq,gCone(.06,.4,4),0xa02020,0,.62,-.05);pbMesh(hq,u.hd,SABM)}
 u.l1.rotation.set(-.55,0,-.45);u.l2.rotation.set(-.55,0,.45);u.k1.rotation.x=u.k2.rotation.x=.9;r.position.set(0,1.25,.05);H.g.add(r);
 const ln=new T.Group();const lq=PB();pCyl(lq,.045,.06,4.2,0x5a3a20,0,-1.6,0,0,0,0,8);pCyl(lq,.16,.05,.4,0x6a6e72,0,.3,0,0,0,0,8);for(let k=0;k<4;k++)pa(lq,gTor(.07,.015,4,8),0xc89030,0,-3.0-k*.12,0,1.5708);pbMesh(lq,ln,SABM);const tip=new T.Mesh(gCone(.07,.5,6),LNC);tip.position.y=-3.9;tip.rotation.x=Math.PI;ln.add(tip);u.mR.add(ln);
 H.g.position.set(x,0,z);scene.add(H.g);const c=Object.assign(H,{r,ru:u,hp:520,max:520,alive:true,st:'slot',vx:0,vz:0,t:R()*5,cd:0,slash:0,i,name:(i===0?'Rittmeister ':'Catafracto ')+['Varga','Hollm','Brandis','Kessel','Udo','Reinholt','Marek','Tavik','Oszkar','Lenz'][i%10],fall:0,lance:true,tip});CAV.push(c);return c}
function lanceHit(c,e){hurt(e,150,'m',c);e.stun=1;const p=e.g.position,q=c.g.position,dx=p.x-q.x,dz=p.z-q.z,l=Math.hypot(dx,dz)||1;p.x+=dx/l*2.6;p.z+=dz/l*2.6;burst(p.x,1.4,p.z,0x9ad0ff,14,.35,8);burst(p.x,1.4,p.z,0xffffff,6,.2,10);flashLight(p.x,2,p.z,3,.18,0x7ab8ff);tn18('square',1400,180,.22,.05);nz18(.001,.15,'highpass',4000,3000,.08);
 let n=0;for(const o of enemies){if(o===e||n>=2)continue;const d=Math.hypot(o.g.position.x-p.x,o.g.position.z-p.z);if(d<7){n++;hurt(o,55,'m',c);o.stun=.5;trc16(new T.Vector3(p.x,1.4,p.z),new T.Vector3(o.g.position.x,1.3,o.g.position.z),0x9ad0ff);burst(o.g.position.x,1.3,o.g.position.z,0x9ad0ff,5,.2,5)}}for(const h of HIT9)if(h.foe&&h.ok()&&Math.hypot(h.x()-p.x,h.z()-p.z)<h.r+3)h.dmg(380,'x')}
function catAnim(){for(const c of CAV){if(!c.lance||!c.alive)continue;const u=c.ru;if(c.slash>0){const q=1-c.slash/.4;u.aR.rotation.x=-1.5;u.eR.rotation.x=-.1+Math.sin(q*Math.PI)*.2;u.b.rotation.x=.25*Math.sin(q*Math.PI)}else{u.aR.rotation.x=c.st==='charge'?-1.5:-.6;u.eR.rotation.x=c.st==='charge'?-.08:-.9}c.tip.material.color.setHex(c.st==='charge'&&R()<.5?0xffffff:0x7ab8ff);if(c.st==='charge'&&R()<.25){c.tip.getWorldPosition(_tv);burst(_tv.x,_tv.y,_tv.z,0x9ad0ff,1,.12,2)}}}
/* ---------- TANQUE ENEMIGO con puntos débiles (popa y torreta) ---------- */
let ET10=null;
function spawnET(x,z){const g=mkTank16('en');g.position.set(x,0,z);g.rotation.y=-1.5708;const t={g,hp:2600,max:2600,alive:true,cd:3,ob:{x,z,r:3.4}};obst.push(t.ob);ET10=t;HIT9.push({foe:true,x:()=>g.position.x,z:()=>g.position.z,y0:0,y1:3.4,r:3.2,ok:()=>t.alive,dmg:(v,k,b)=>etDamage(v,k,b)});return t}
function etDamage(v,k,b){const t=ET10;if(!t||!t.alive)return;let m=k==='b'?.06:k==='ram'?1:1;if(b&&k==='b'){const fy=t.g.rotation.y,fx=Math.sin(fy),fz=Math.cos(fy),vl=Math.hypot(b.v.x,b.v.z)||1;if((b.v.x*fx+b.v.z*fz)/vl>.45){m=.9;if(R()<.2)feed('¡Impacto en la popa: punto débil!')}else if(b.m.position.y>2.6){m=.5}}t.hp-=v*m;if(t.hp<=0){t.alive=false;boom9(t.g.position.x,t.g.position.z,2,false);mkFire(t.g.position.x,t.g.position.z,1.6,1,-1);t.g.userData.tur.rotation.set(.3,.8,.2);feed('★ ¡Tanque enemigo destruido!');say('¡El tanque enemigo arde!',2.5);score+=4000}}
function etUpd(dt){const t=ET10;if(!t)return;const g=t.g,u=g.userData,p=g.position;if(!t.alive){if(R()<dt*3)smoke(p.x,3,p.z,4,4,0x1a1a1a,1.6,.5);return}let tg=null,td=110;for(const k of TK10)if(k.alive){const d=Math.hypot(k.g.position.x-p.x,k.g.position.z-p.z);if(d<td){td=d;tg={p:k.g.position,hit:v=>tkDamage(k,v)}}}const dp=Math.hypot(P.g.position.x-p.x,P.g.position.z-p.z);if(!tg||dp<td*.6)tg={p:P.g.position,hit:v=>hitP(v*.25)};
 let sp=0;if(Math.hypot(tg.p.x-p.x,tg.p.z-p.z)>16){g.rotation.y=angL(g.rotation.y,Math.atan2(tg.p.x-p.x,tg.p.z-p.z),Math.min(1,dt*.35));sp=2.4;p.x+=Math.sin(g.rotation.y)*sp*dt;p.z+=Math.cos(g.rotation.y)*sp*dt;const oi=obst.indexOf(t.ob);if(oi>=0)obst.splice(oi,1);resolve(p,3);obst.push(t.ob);t.ob.x=p.x;t.ob.z=p.z}tankAnim(g,sp,dt);
 const err=tankTurret(g,tg.p.x,tg.p.z,dt,.9);t.cd-=dt;if(t.cd<=0&&err<.08){t.cd=4.5;u.muz.getWorldPosition(_tv);u.rec=1;burst(_tv.x,_tv.y,_tv.z,0xffcc66,10,.25,10);npcShot('big',_tv.x,_tv.z);const tp=tg.p.clone(),h=tg.hit;setTimeout(()=>{if(level!==10||!t.alive)return;h(260);boom9(tp.x+(R()-.5)*3,tp.z+(R()-.5)*3,1.2,true)},300)}}
/* ---------- CLASES ENEMIGAS ESPECIALES ---------- */
function mkXbow(){const q=PB();pBox(q,.06,.6,.08,0x5a3a20,0,-.3,0);pBox(q,.7,.04,.06,0x3a2a1a,0,-.55,0);pBox(q,.02,.02,.66,0x888888,0,-.55,.04,1.5708);return pbMesh(q,null,VCM)}
function sp10(kind,x,z,opt){if(enemies.length>=(L10.under?16:24)&&!(opt&&opt.force))return null;let e;const fr=R()*5|0;const nm={fus:'a un fusilero',gra:'a un granadero',amet:'a un ametrallador',tir:'a un tirador de precisión',ofi:'a un oficial enemigo',acech:'a un acechador',lanz:'a un lanzador',ball:'a un ballestero',bruto:'a un bruto',mino:'a un minotauro',ogro:'a un ogro artillero',capa:'a un capataz',gorlock:'a un gorlock',genglock:'a un genglock',hurlock:'a un hurlock',escudo:'a un guerrero escudado',orco:'a un orco hachero',trasgo:'a un trasgo'}[kind];
 switch(kind){case'fus':e=sp8('mosin',x,z,0,fr);break;case'gra':e=sp8('gren',x,z,0,fr);break;case'amet':e=sp8('bar',x,z,.001,fr);e.mg9=1;e.hp*=1.3;break;case'tir':e=sp8('mosin',x,z,0,fr);e.snip=1;e.kc2=2.2;e.hp*=.9;break;case'ofi':e=sp8('stv',x,z,0,fr);e.capt=1;break;
  case'acech':e=spawnE('plaga',x,z);e.stalk=1;e.hp*=1.2;e.g.traverse(o=>{if(o.material&&o.material.color&&!o.material.vertexColors)o.material.color.lerp(new T.Color(0x1a1a20),.6)});break;case'lanz':e=spawnE('granadero',x,z);break;case'ball':case'hurlock':e=kind==='ball'?sp8('stv',x,z,0,fr):spawnE('orcoE',x,z);e.xbow=1;{const u=e.g.userData;u.mR.children.slice().forEach(c=>u.mR.remove(c));u.mR.add(mkXbow())}break;
  case'bruto':e=spawnE('orcoH',x,z);e.s=1.5;e.hp=e.max=e.hp*2.2;e.brute=1;break;case'mino':e=spMin(x,z,R()<.5?'bl':'as');break;case'ogro':e=spawnE('orcoH',x,z);e.s=1.9;e.hp=e.max=e.hp*3.6;e.ogre=1;e.oc=4;{const q=PB();pCyl(q,.22,.3,1.4,0x2a2a2a,.25,.75,-.35,-.8,0,0,8);pBox(q,.6,.5,.4,0x4a3a2a,0,.4,-.35);pbMesh(q,e.g.userData.ch,VCM)}break;
  case'capa':e=sp8('stv',x,z,0,fr);e.capt=1;e.hp*=1.8;e.max=e.hp;{const q=PB();pCyl(q,.02,.02,2.2,0x3a2a1a,0,.9,-.3);pBox(q,.6,.5,.02,0x8a1a1a,.32,1.7,-.3);pbMesh(q,e.g.userData.ch,VCM)}break;case'gorlock':e=spawnE('orcoE',x,z);e.s=1.3;e.hp*=1.5;break;case'genglock':e=spawnE('trasgo',x,z);e.sp*=1.5;break;case'escudo':e=spawnE('custodio',x,z);break;case'orco':e=spawnE('orcoH',x,z);break;default:e=spawnE('trasgo',x,z)}
 e.nav8=0;e.alert=e.hold?0:R()*1.2;e.k8n=nm||e.k8n;if(L10.under)e.under9=1;e.side=R()<.5?1:-1;return e}
function en10Upd(dt){const pp=P.g.position;for(const e of enemies){const p=e.g.position,tp=e.tp8||pp,d=Math.hypot(tp.x-p.x,tp.z-p.z);
 if(e.stalk&&!e.rev){e.alert=99;e.vx=e.vz=0;if(Math.hypot(pp.x-p.x,pp.z-p.z)<13||e.hp<e.max){e.rev=1;e.alert=0;e.sp*=1.6;e.stun=0;tn18('sawtooth',300,900,.4,.04);feed('¡Un acechador salta de su escondite!')}}
 if(e.ogre){e.oc-=dt;if(d>14){e.alert=Math.max(e.alert,.5);if(e.oc<=0&&d<85){e.oc=5.5+R()*2;e.atk=.55;burst(p.x,3.5*e.s/1.9,p.z,0xffaa44,8,.3,6);expSnd(p.x,p.z,.6);shell9(tp.x+(R()-.5)*6,tp.z+(R()-.5)*6,1.2)}}}
 if(e.brute&&R()<dt*2)sbHit(p.x,p.z,1.6);
 if(e.capt){e.ct=(e.ct||0)-dt;if(e.ct<=0){e.ct=3;for(const o of enemies)if(o!==e&&Math.hypot(o.g.position.x-p.x,o.g.position.z-p.z)<16){o.cd=Math.min(o.cd,.3);o.cap10=e}if(!e.shout&&e.active){e.shout=1;say('Capataz enemigo: «¡Adelante, perros! ¡Cubrid a los de vanguardia!»',2.2)}}}
 if(e.xbow&&e.cd>.4&&e.cd<.45){}}}
const _kill19=kill;kill=function(e){if(level===10&&e.capt){for(const o of enemies)if(o.cap10===e&&R()<.6){o.fled=true;o.cv=findCover(o,true);o.st=o.cv?'cover':'fire'}feed('El capataz ha caído: sus hombres vacilan')}_kill19(e)};
/* los cuerpo a cuerpo rodean al objetivo (envolvimiento) en el cap. X */
const _uk19=unstk;unstk=function(e,ax,az,dt){if(level===10&&!e.k8&&!e.ogre&&(ax||az)){const tp=e.tp8||P.g.position,d=Math.hypot(tp.x-e.g.position.x,tp.z-e.g.position.z);if(d>4&&d<22){const k=.55*(e.side||1);const nx=ax-az*k,nz=az+ax*k;ax=nx;az=nz}}return _uk19(e,ax,az,dt)};
/* ---------- SIGILO (fase I): patrullas, conos de visión, ruido, eliminaciones silenciosas ---------- */
function stealthUpd(dt){if(L10.alarm)return;let mx=0;const pp=P.g.position,run=Math.hypot(P.mvx||0,P.mvz||0)>7;
 for(const e of enemies){if(!e.unaware)continue;e.active=false;e.alert=99;const p=e.g.position;if(e.pat){const w=e.pat[e.pi%e.pat.length],dx=w[0]-p.x,dz=w[1]-p.z,d=Math.hypot(dx,dz);if(d<1.2){e.pw=(e.pw||0)+dt;if(e.pw>2.5){e.pw=0;e.pi++}}else{p.x+=dx/d*1.5*dt;p.z+=dz/d*1.5*dt;e.ph10=Math.atan2(dx,dz)}animE(e,d>1.2?1:0,0,dt,false)}
  if(e.ph10===undefined)e.ph10=e.g.rotation.y;e.ph10+=Math.sin(time*.6+e.t)*.004;e.g.rotation.y=e.ph10;
  const dx=pp.x-p.x,dz=pp.z-p.z,d=Math.hypot(dx,dz),ang=Math.abs(((Math.atan2(dx,dz)-e.ph10+Math.PI)%6.2832+6.2832)%6.2832-Math.PI),R_=(P.cr?8:15)*(run?1.4:1);
  if(d<R_&&ang<1.05&&losClear(p.x,1.6,p.z,pp.x,1.2,pp.z))e.sus=(e.sus||0)+dt*(1.4-d/R_)*(P.cr?.6:1.2);else if(d<3.5)e.sus=(e.sus||0)+dt*.6;else e.sus=Math.max(0,(e.sus||0)-dt*.35);
  if(e.sus>=1)alert10(e);mx=Math.max(mx,e.sus||0)}L10.det=mx;
 if(firing&&!P.mg&&P.cur!=='sword'&&P.cd>0)for(const e of enemies)if(e.unaware&&Math.hypot(e.g.position.x-pp.x,e.g.position.z-pp.z)<(P.cur==='smg'?30:45))alert10(e);
 if(L10.aT>0){L10.aT-=dt;if(L10.aT<=0&&enemies.some(e=>!e.unaware&&e.ph10!==undefined&&e.hp>0))raiseAlarm()}}
function alert10(e){if(!e.unaware)return;e.unaware=false;e.active=true;e.alert=0;tn18('square',700,700,.15,.03);say('«¡¿Quién va?!» — te han visto',1.6);for(const o of enemies)if(o.unaware&&Math.hypot(o.g.position.x-e.g.position.x,o.g.position.z-e.g.position.z)<22)o.sus=Math.max(o.sus||0,.7);if(!(L10.aT>0))L10.aT=4}
function raiseAlarm(){if(L10.alarm)return;L10.alarm=true;for(const e of enemies)if(e.unaware){e.unaware=false;e.active=true;e.alert=0}for(let i=0;i<6;i++)setTimeout(()=>tn18('square',880,880,.25,.03),i*400);if(L10.comms){say('¡Alarma en la costa! Pero sin radio no pueden pedir refuerzos.',3.5);return}say('¡ALARMA! ¡La guarnición entera sabe que estáis aquí!',3.5);wave9h(['fus','fus','gra','acech','orco'],X10-10,-40,30)}
const _hurt19=hurt;hurt=function(e,d,mode,by){if(level===10&&e.unaware&&mode==='m'&&!by){d=9999;feed('✠ Eliminado en silencio');score+=300;e.unaware=false;e.silent=1}else if(level===10&&e.unaware){alert10(e)}_hurt19(e,d,mode,by)};
function wave9h(list,cx,cz,spread){let n=0;for(const k of list)if(sp10(k,cx+(R()-.5)*spread,cz+(R()-.5)*8))n++;return n}
/* ---------- DEPÓSITOS DE COMBUSTIBLE con estados: intacto · dañado · incendiado · explosión · destruido ---------- */
const TANK10=[];
function mkFuelTank(x,z,r,h,main){const g=new T.Group(),q=PB(),C=main?0xb8b0a0:0x9a9488;pCyl(q,r,r,h,C,0,h/2,0,0,0,0,16);for(let i=1;i<4;i++)pCyl(q,r+.06,r+.06,.15,0x5a5a52,0,h*i/4,0,0,0,0,16);pa(q,gCone(r,1.2,16),shade(C,.9),0,h+.6,0);for(let i=0;i<Math.ceil(h/.5);i++)pBox(q,.6,.05,.05,0x3a3a36,r+.1,.3+i*.5,0);for(const s of[-1,1])pBox(q,.05,h,.05,0x3a3a36,r+.1,h/2,s*.3);pBox(q,r*1.2,.6,.05,main?0xc02020:0x2a3a6a,0,h*.6,r+.02);pCyl(q,.25,.25,r*1.6,0x4a4a42,-r-.5,.6,0,0,0,1.5708,8);pbMesh(q,g,VCV);g.position.set(x,0,z);scene.add(g);
 const t={g,x,z,r,h,main,hp:main?2200:900,max:main?2200:900,st:0,charged:false,alive:true,ob:{x,z,r:r+.3}};obst.push(t.ob);covers.push({x,z,r:r+1});TANK10.push(t);
 if(!main)HIT9.push({foe:true,x:()=>x,z:()=>z,y0:0,y1:h+1,r:r+.2,ok:()=>t.alive,dmg:(v,k)=>ftDamage(t,v*(k==='b'?.35:1))});return t}
function ftState(t){const f=t.hp/t.max,ns=t.hp<=0?4:f<.35?2:f<.7?1:0;if(ns===t.st)return;t.st=ns;if(ns===1){t.g.rotation.z=.02;feed('Depósito dañado: fuga de combustible')}if(ns===2){t.fires=[mkFire(t.x+t.r*.6,t.z,1.2,t.h*.5,-1),mkFire(t.x,t.z,1.6,t.h+.5,-1)];feed('¡Depósito incendiado!')}if(ns===4)ftExplode(t)}
function ftDamage(t,v){if(!t.alive)return;t.hp-=v;ftState(t)}
function ftExplode(t,quiet){if(!t.alive)return;t.alive=false;t.hp=0;expSnd(t.x,t.z,2);for(let i=0;i<3;i++)burst(t.x,t.h*(.3+i*.3),t.z,[0xff7a20,0xffcc44,0x3a2a1a][i],30,1.2,14);smoke(t.x,t.h,t.z,14,10,0x1a1414,2.5,.65);flashLight(t.x,t.h,t.z,10,1.4,0xff8030);shake=Math.max(shake,1.6);crater9(t.x,t.z,t.r+2);
 t.g.scale.set(1,.45,1);t.g.rotation.z=.15;if(!t.fires)t.fires=[];t.fires.push(mkFire(t.x,t.z,2.2,t.h*.45,-1));for(const e of[...enemies])if(Math.hypot(e.g.position.x-t.x,e.g.position.z-t.z)<t.r+8)hurt(e,400,'m');if(!quiet){e8Blast(t.x,t.z,t.r+6,60);const dp=Math.hypot(P.g.position.x-t.x,P.g.position.z-t.z);if(dp<t.r+7)hitP(45)}
 for(const o of TANK10)if(o!==t&&o.alive&&Math.hypot(o.x-t.x,o.z-t.z)<t.r+o.r+14)setTimeout(()=>ftDamage(o,o.max*.6),500+R()*700)}
function ftUpd(dt){for(const t of TANK10){if(t.st===1&&R()<dt*2)smoke(t.x+t.r,1,t.z,1.5,2,0x4a4a3a,.6,.4);if(t.st===2){t.hp-=dt*18;ftState(t);if(R()<dt*3)smoke(t.x,t.h+2,t.z,6,6,0x1a1414,2,.5)}if(t.st===4&&R()<dt*2)smoke(t.x,t.h*.5,t.z,9,8,0x161212,2.2,.5)}}
/* =====================================================================
   MAPA CONTINUO DEL CAP. X (sur → norte, sin teletransportes)
   A Costa · B Trincheras · C Desierto · D Minas (dentro de la meseta) ·
   E Explanada · F Refinería y puerto industrial
   ===================================================================== */
const SECT10=[],MZ0=-272,MZ1=-400,MX0=X10-72,MX1=X10+72;let GRD10=null;
function sect10(name,x,z,r,fn){const n0=scene.children.length;sBegin();fn();scene.updateMatrixWorld(true);sEnd();const S={name,x,z,r,objs:scene.children.slice(n0),vis:true,in:name==='Minas'};SECT10.push(S);return S}
function inMine(p){return p.x>MX0+2&&p.x<MX1-2&&p.z<MZ0-1&&p.z>MZ1+1}
function cull10(){const p=P.g.position,c=cam.position;L10.under=inMine(p);for(const S of SECT10){const d=Math.min(Math.hypot(p.x-S.x,p.z-S.z),Math.hypot(c.x-S.x,c.z-S.z));const v=S.in?(L10.under||d<S.r+60):(d<S.r+210&&!(L10.under&&Math.abs(p.z-S.z)>90));if(v!==S.vis){S.vis=v;for(const o of S.objs)o.visible=v}}skyMesh.visible=!L10.under}
const WIRE10=[],GATE10={},MECH10=[],ZONE10={};
function wireSeg(x0,x1,z){const obs=[],q=PB();for(let x=x0;x<=x1;x+=2.5){pCyl(q,.04,.05,1.3,0x4a4a4a,x,.65,z,0,0,(R()-.5)*.3,6);pCyl(q,.04,.05,1.3,0x4a4a4a,x+.6,.65,z+1.2,0,0,(R()-.5)*.3,6);const o={x:x+.3,z:z+.6,r:.9};obst.push(o);obs.push(o)}for(const y of[.3,.65,1.0])for(const dz of[0,1.2]){pBox(q,x1-x0,.02,.02,0x8a8a8a,(x0+x1)/2,y,z+dz)}for(let x=x0;x<x1;x+=.8)pBox(q,.02,.9,.02,0x7a7a7a,x,.6,z+.6,0,0,.8);const m=pbMesh(q,scene,VCV);const w={x0,x1,z,obs,m,cut:false,cx:(x0+x1)/2};WIRE10.push(w);return w}
function cutWire(w){w.cut=true;w.m.visible=false;for(const o of w.obs){const i=obst.indexOf(o);if(i>=0)obst.splice(i,1)}feed('Paso abierto en la alambrada');tn18('square',1600,1500,.06,.03);tn18('square',1600,1500,.06,.03,.15)}
function statue(x,z,face){box(3.4,4,2.4,0xffffff,x,2,z,0,0,stoneTex);box(4.4,4.6,2.8,0xffffff,x,6.3,z,0,0,stoneTex);box(2.6,2.6,2.4,0xc8bca0,x,9.9,z,0,0,stoneTex);box(2.8,3.4,.8,0xb8ab92,x,8.2,z+face*1.5,0,0,stoneTex);mesh(new T.ConeGeometry(1.9,2,8),0x8a8070,x,12.2,z,0,0,stoneTex);box(.5,9,.5,0x6a6050,x+2.6,5,z+face*.8);box(2,2.4,.3,0x8a8a8a,x+2.6,9.4,z+face*.8);obstB.push({x,z,hw:2.2,hd:1.4,h:12})}
function build10(){if(L10.built)return;L10.built=true;const X=X10;
 {const W=360,D=760,g=new T.PlaneGeometry(W,D,60,120);g.rotateX(-1.5708);const pos=g.attributes.position,col=new Float32Array(pos.count*3),c=new T.Color();for(let i=0;i<pos.count;i++){const x=pos.getX(i)+X,z=pos.getZ(i)-300;let h=(Math.sin(x*.05)*Math.cos(z*.04)*.6+Math.sin(x*.11+z*.07)*.3)*(z<-120&&z>-262?1:.3);if(Math.abs(x-X)<5)h*=.2;pos.setY(i,h);
  if(z>20)c.setHex(0xd8c49a);else if(z>-118)c.setHex(0x6a5a40).lerp(new T.Color(0x4a3e2a),R()*.6);else if(z>-262)c.setHex(0xc8a868).lerp(new T.Color(0xd8b878),R()*.5);else if(z>-400)c.setHex(0x6a5a48);else if(z>-505)c.setHex(0xb89a68);else c.setHex(0x4a4640).lerp(new T.Color(0x3a3630),R()*.5);if(Math.abs(x-X)<4.5)c.multiplyScalar(.85);col[i*3]=c.r;col[i*3+1]=c.g;col[i*3+2]=c.b}
  g.setAttribute('color',new T.BufferAttribute(col,3));g.computeVertexNormals();GRD10=new T.Mesh(g,new T.MeshLambertMaterial({vertexColors:true,map:rt_(sandTex,30,60)}));GRD10.position.set(X,0,-300);scene.add(GRD10)}
 const sea=new T.Mesh(new T.PlaneGeometry(900,420),new T.MeshLambertMaterial({color:0x1a3a4a,emissive:0x061418,transparent:true,opacity:.92,map:rt_(cobT,60,30)}));sea.rotation.x=-1.5708;sea.position.set(X,.05,258);scene.add(sea);L10.sea=sea;
 const sea2=new T.Mesh(new T.PlaneGeometry(200,200),sea.material);sea2.rotation.x=-1.5708;sea2.position.set(X+205,.05,-600);scene.add(sea2);
 for(const [x,z,hw,hd] of[[X-168,-300,2,380],[X+168,-300,2,380],[X,52,170,2],[X,-655,170,2],[X+140,-600,20,52]])obstB.push({x,z,hw,hd,h:30});
 for(const s of[-1,1]){const cx=X+s*120;box(96,18,138,0x8a7458,cx,9,-331,0,0,rt_(stoneTex,24,5));obstB.push({x:cx,z:-331,hw:48,hd:69,h:18})}
 for(let i=0;i<16;i++){const s=i<8?-1:1,z=40-(i%8)*90;mesh(new T.SphereGeometry(40+R()*25,10,6),0x9a7a50,X+s*(195+R()*20),-14,z).scale.y=.6}
 /* A — COSTA: playa, rocas, restos de lanchas, erizos checos, estación de comunicaciones, nidos de MG, faro en ruinas */
 sect10('Costa',X,10,90,()=>{rocks9([...Array(60)].map(()=>[X-150+R()*300,46-R()*40,.4+R()*1.6]));for(const [x,z,r] of[[-30,40,.6],[40,43,-.4],[-80,38,1.2]]){const b=box(3,1.2,8,0x5a4a3a,X+x,.5,z,0,0,woodTex);b.rotation.set(.2,r,.25);ob(X+x,z,2.4)}
  for(let i=0;i<14;i++){const x=X-70+i*10+(R()-.5)*4,z=30+(R()-.5)*6;for(const r of[0,1.05,2.1]){const b=box(.18,.18,2.2,0x3a3a36,x,.6,z);b.rotation.set(.6,r,.4)}ob(x,z,.9)}
  shack(X-45,2,5,4,3,0x9a8a6a);cp(.06,.06,14,0x3a3a3a,X-42,7,1);for(let i=0;i<4;i++)box(2.4-i*.4,.06,.06,0x3a3a3a,X-42,9+i*1.4,1);box(1.4,.9,.8,0x4a4a3a,X-49,.45,6);ZONE10.comms={x:X-45,z:5.4};
  for(const [x,z] of[[-14,-6],[26,-4]]){sb9(X+x,z+1.6,3.4,.9,1.15);sb9(X+x-1.9,z+.2,.9,2.4,1.15);sb9(X+x+1.9,z+.2,.9,2.4,1.15)}
  const H=[X+58,-12];mesh(new T.SphereGeometry(10,12,8),0x8a7a5a,H[0],-6.5,H[1]).scale.set(1,.85,1);for(let i=0;i<3;i++)obstB.push({x:H[0],z:H[1]+7-i*2.6,hw:4.5-i*.5,hd:1.3,h:.5+i*.5,step:true});obstB.push({x:H[0],z:H[1]-1.5,hw:4,hd:3.2,h:1.5,step:true});cyl(2.2,9,0xd8d0c0,H[0]+4,4.5,H[1]-6,10);box(3,1.2,3,0x8a3020,H[0]+4,9.6,H[1]-6);obstB.push({x:H[0]+4,z:H[1]-6,hw:2.2,hd:2.2,h:9});ZONE10.hill={x:H[0],z:H[1]-1.5};
  for(let i=0;i<10;i++)crater9(X+(R()-.5)*120,-R()*14,1+R()*1.5)});
 /* B — TRINCHERAS DE HIERRO: tres líneas, alambradas cortables, búnkeres, morteros, artillería, barricada */
 sect10('Trincheras',X,-66,80,()=>{sbRow(X-55,-14,X-6,-14,1.2,6);sbRow(X+6,-14,X+55,-14,1.2,6);sbRow(X-62,-38,X-5,-38,1.15,5);sbRow(X+5,-38,X+62,-38,1.15,5);for(let x=-60;x<=60;x+=2.2)box(2,.08,.7,0xc0a070,X+x,.05,-40.5,0,0,woodTex);
  sbRow(X-62,-64,X-44,-64,1.2,0);sbRow(X-22,-64,X-5,-64,1.2,0);sbRow(X+5,-64,X+22,-64,1.2,0);sbRow(X+44,-64,X+62,-64,1.2,0);
  for(let x=-64;x<=64;x+=4){if(Math.abs(x)<7)continue;box(4,1.25,1.4,0xffffff,X+x,.62,-98,0,0,rt_(concT,1.3,.5));obstB.push({x:X+x,z:-98,hw:2,hd:.7,h:1.25})}covers.push({x:X,z:-98,r:3});
  for(let i=0;i<24;i++)crater9(X+(R()-.5)*120,-18-R()*90,1.2+R()*2.4);for(let i=0;i<10;i++){const x=(R()<.5?-1:1)*(10+R()*55);deadTree(X+x,-24-R()*70)}
  for(const [x,z] of[[-10,-78],[14,-80]]){const m=mkMortar();m.position.set(X+x,0,z);sb9(X+x,z+1.6,3,.9,.9)}
  PR.flag(X-50,-104,0x8a1a1a,8);PR.flag(X+50,-104,0x8a1a1a,8)});
 for(const [a,b] of[[-66,-44],[-44,-22],[-22,0],[0,22],[22,44],[44,66]])wireSeg(X+a,X+b,-30);
 bunker8(X-34,-70,1,'L2-A');bunker8(X+34,-70,-1,'L2-B');
 {const m=new T.Mesh(gBox(10,2.6,1.6),new T.MeshLambertMaterial({map:woodTex,color:0x9a8a6a}));m.position.set(X,1.3,-98);scene.add(m);const o={x:X,z:-98,hw:5,hd:.8,h:2.6};obstB.push(o);GATE10.bar={m,o,hp:700,alive:true};HIT9.push({foe:true,x:()=>X,z:()=>-98,y0:0,y1:2.6,r:5,ok:()=>GATE10.bar.alive,dmg:(v,k)=>gateDmg(GATE10.bar,v*(k==='b'?.05:1),'¡La barricada ha caído!')})}
 L10.guns=[];for(const [x,z] of[[-28,-108],[28,-108],[48,-112]]){const k=mkKrupp();k.position.set(X+x,0,z);k.rotation.y=0;L10.guns.push({g:k,x:X+x,z,cap:false})}
 /* C — DESIERTO: dunas, carretera, vía férrea con cruce, batería, depósitos, puerta del complejo */
 sect10('Desierto',X,-190,90,()=>{for(let i=0;i<26;i++){const x=X+(R()<.5?-1:1)*(15+R()*140),z=-125-R()*130;mesh(new T.SphereGeometry(8+R()*10,10,6),0xd0b070,x,-4,z,0,0,sandTex).scale.set(1.4,.5,1);if(R()<.3)ob(x,z,5)}
  const sl=new T.InstancedMesh(gBox(.4,.15,3.2),new T.MeshLambertMaterial({color:0x4a3220}),400),mm=new T.Matrix4();for(let i=0;i<400;i++){mm.makeTranslation(X-160+i*.8,.08,-200);sl.setMatrixAt(i,mm)}scene.add(sl);for(const s of[-.75,.75])box(320,.14,.12,0x6a6a6a,X,.2,-200+s);
  shack(X+40,-194,5,4,3.4,0xb8a080);PR.sign(X+30,-196,0);box(.3,6,.3,0x2a2a2a,X+34,3,-197);box(1.4,.3,.2,0xc02020,X+34,5.6,-197);ZONE10.cross={x:X+40,z:-198};
  for(let i=0;i<8;i++)PR.stack(X+60+(i%4)*4,-150-Math.floor(i/4)*5,R());for(let i=0;i<6;i++)PR.barrel(X+75+i*1.3,-162);PR.tent(X+86,-140,0,0xc8b890);PR.tent(X+64,-136,.4,0xc8b890);
  for(const [x,z] of[[-70,-168],[-60,-176],[-80,-178]])sbRow(X+x-3,z+2,X+x+3,z+2,.9,0);for(let i=0;i<5;i++)palm(X-110+R()*40,-140-R()*100);
  for(let x=-70;x<=70;x+=4){if(Math.abs(x)<7)continue;box(4,4,1.6,0xffffff,X+x,2,-262,0,0,rt_(concT,1.3,1.3));obstB.push({x:X+x,z:-262,hw:2,hd:.8,h:4})}box(14,1.2,1.8,0x6a6a6a,X,4.6,-262)});
 L10.bat=[];for(const [x,z] of[[-70,-168],[-60,-176],[-80,-178]]){const k=mkKrupp();k.position.set(X+x,0,z);k.rotation.y=0;const g={g:k,hp:700,max:700,alive:true,x:X+x,z};L10.bat.push(g);HIT9.push({foe:true,x:()=>g.x,z:()=>g.z,y0:0,y1:3,r:2.2,ok:()=>g.alive,dmg:(v,kk)=>{if(!g.alive)return;g.hp-=v*(kk==='b'?.15:1);if(g.hp<=0){g.alive=false;boom9(g.x,g.z,1.3,false);g.g.rotation.z=.4;feed('★ Cañón enemigo destruido')}}})}
 {const m=new T.Mesh(gBox(10,4,1.6),new T.MeshLambertMaterial({map:steelT,color:0x6a6a62}));m.position.set(X,2,-262);scene.add(m);const o={x:X,z:-262,hw:5,hd:.8,h:4};obstB.push(o);GATE10.comp={m,o,alive:true}}
 /* D — MINAS (dentro de la meseta): columnas, abismo con puentes, raíles y vagonetas, fundición, ascensor, estatuas, galerías, compuerta */
 sect10('Minas',X,-336,95,()=>{const H=16,W=(x0,z0,x1,z1,h)=>{const cx=(x0+x1)/2,cz=(z0+z1)/2,w=Math.abs(x1-x0)||3,d=Math.abs(z1-z0)||3;box(w,h||H,d,0xffffff,cx,(h||H)/2,cz,0,0,rt_(stoneTex,Math.max(w,d)/4,(h||H)/4));obstB.push({x:cx,z:cz,hw:w/2,hd:d/2,h:h||H})};
  W(MX0,MZ0,X-6,MZ0);W(X+6,MZ0,MX1,MZ0);W(MX0,MZ1,X-7,MZ1);W(X+7,MZ1,MX1,MZ1);W(MX0,MZ0,MX0,-300);W(MX0,-310,MX0,-360);W(MX0,-370,MX0,MZ1);W(MX1,MZ0,MX1,-305);W(MX1,-315,MX1,-355);W(MX1,-365,MX1,MZ1);
  box(150,3,134,0x8a7458,X,H+1.5,-336,0,0,rt_(stoneTex,20,18));for(let i=0;i<10;i++){const b=box(14+R()*20,4+R()*6,14+R()*20,0x8a7458,X+(R()-.5)*120,H+3,-336+(R()-.5)*110,0,0,stoneTex);b.rotation.y=R()*3}box(14,3,2,0x3a3430,X,H-1.5,MZ0);
  box(140,.12,128,0xffffff,X,.03,-336,0,0,rt_(cobT,30,28));
  for(const x of[-45,-20,20,45])for(const z of[-292,-318,-356,-382]){cyl(2.3,H,0xb8ab92,X+x,H/2,z,10);box(5.4,1.2,5.4,0x8a8070,X+x,H-.6,z,0,0,stoneTex);box(5.4,1,5.4,0x8a8070,X+x,.5,z,0,0,stoneTex);ob(X+x,z,2.6)}
  const ch=mesh(new T.PlaneGeometry(140,12),0x050404,X,.05,-336);ch.rotation.x=-1.5708;for(const [a,b] of[[MX0,X-31],[X-25,X+27],[X+33,MX1]])obstB.push({x:(a+b)/2,z:-336,hw:(b-a)/2,hd:6,h:6,nolos:1});
  for(const bx of[X-28,X+30]){box(6,.5,13,0xffffff,bx,.25,-336,0,0,stoneTex);for(const s of[-1,1]){box(.3,1,13,0x6a6050,bx+s*2.9,.75,-336);obstB.push({x:bx+s*2.9,z:-336,hw:.15,hd:6.5,h:1})}}
  for(let i=0;i<3;i++){const a=box(.5,.2,1.8,0x4a3220,X-60,.1,-282-i*0);}const sl=new T.InstancedMesh(gBox(1.8,.15,.4),new T.MeshLambertMaterial({color:0x4a3220}),120),mm=new T.Matrix4();for(let i=0;i<120;i++){mm.makeTranslation(X-60,.08,-280-i*.95);sl.setMatrixAt(i,mm)}scene.add(sl);for(const s of[-.5,.5])box(.1,.12,114,0x6a5a4a,X-60+s,.18,-337);
  const mol=mesh(new T.PlaneGeometry(18,16),0xff6a10,X+55,.08,-380,0,0xff5a00);mol.rotation.x=-1.5708;obstB.push({x:X+55,z:-380,hw:9,hd:8,h:1});for(let i=0;i<3;i++){cp(1.4,1.1,2,0x2a2a2a,X+44+i*4,1,-366);box(.1,12,.1,0x3a3a3a,X+44+i*4,10,-366)}box(10,3,4,0x5a3a2a,X+60,1.5,-364,0,0,brickT);
  for(const s of[-1,1])statue(X+s*16,-392,-1);
  for(const [x,z] of[[-40,-300],[38,-370]]){box(8,.3,5,0xffffff,X+x,3,z,0,0,woodTex);for(const a of[-1,1])for(const b of[-1,1])box(.3,3,.3,0x4a3018,X+x+a*3.6,1.5,z+b*2.2);obstB.push({x:X+x,z,hw:4,hd:2.5,h:3.3,y0:2.8});PR.ladder(X+x+4.2,0,z,3,1.5708)}
  for(const [x,z] of[[MX0,-305],[MX0,-365],[MX1,-310],[MX1,-360]]){const a=box(1,6,10,0x0a0806,x+(x<X?1.6:-1.6),3,z)}
  for(let i=0;i<20;i++){const r=box(.5+R()*1.5,.3+R()*.8,.5+R()*1.4,0x8a8070,X+(R()-.5)*130,.25,-280-R()*112,0,0,stoneTex);r.rotation.y=R()*3}
  for(const [x,z] of[[-60,-288],[60,-288],[-60,-392],[60,-342],[0,-300]])mkFire(X+x,z,.5,1.2,-1)});
 {const g=new T.Group(),q=PB();pBox(q,1.4,1,2,0x5a4a3a,0,.9,0);for(const s of[-1,1])for(const t of[-1,1])pCyl(q,.3,.3,.15,0x2a2a2a,s*.7,.35,t*.6,0,0,1.5708,8);pBox(q,1.2,.4,1.6,0x2a2420,0,1.5,0);pbMesh(q,g,VCV);g.position.set(X-60,0,-300);scene.add(g);L10.cart=g;SECT10[3].objs.push(g)}
 {const g=new T.Group(),q=PB();pBox(q,4,.2,4,0x4a4a42,0,0,0);for(const s of[-1,1])for(const t of[-1,1])pBox(q,.1,3,.1,0x3a3a36,s*1.9,1.5,t*1.9);pBox(q,4,.15,4,0x4a4a42,0,3,0);pbMesh(q,g,VCV);g.position.set(X+56,0,-290);scene.add(g);L10.lift=g;SECT10[3].objs.push(g)}
 {const m=new T.Mesh(gBox(13,8,1.4),new T.MeshLambertMaterial({map:steelT,color:0x5a5a52}));m.position.set(X,4,MZ1);scene.add(m);const o={x:X,z:MZ1,hw:6.5,hd:.7,h:8};obstB.push(o);GATE10.mine={m,o,alive:true};SECT10[3].objs.push(m)}
 for(const [x,z,n] of[[-50,-302,'oeste'],[50,-302,'este'],[0,-386,'de la compuerta']]){const g=new T.Group(),q=PB();pBox(q,1.4,1.2,1,0x3a3a36,0,.6,0);pa(q,gTor(.6,.08,6,12),0xc89030,0,1.6,.3,0,0,0);pCyl(q,.06,.06,.9,0x2a2a2a,0,1.2,.1,1.5708,0,0,6);pbMesh(q,g,VCV);g.position.set(X+x,0,z);scene.add(g);SECT10[3].objs.push(g);MECH10.push({x:X+x,z:z+1.4,g,p:0,done:false,n})}
 /* E — EXPLANADA: tres posiciones elevadas */
 sect10('Explanada',X,-450,70,()=>{for(const [x,z] of[[-55,-425],[0,-440],[55,-425]]){mesh(new T.SphereGeometry(7,10,6),0xa08a60,X+x,-4.8,z).scale.set(1,.8,1);obstB.push({x:X+x,z,hw:3.4,hd:3.4,h:.8,step:true});sbRow(X+x-3,z-3.5,X+x+3,z-3.5,1,0);covers.push({x:X+x,z:z-3,r:3})}rocks9([...Array(30)].map(()=>[X+(R()-.5)*300,-405-R()*95,.5+R()*1.4]));
  for(const [x,z] of[[-10,-485],[20,-487]]){sb9(X+x,z+1.6,3.4,.9,1.15);sb9(X+x-1.9,z+.2,.9,2.4,1.15);sb9(X+x+1.9,z+.2,.9,2.4,1.15)}});
 ZONE10.hills=[[X-55,-425],[X,-440],[X+55,-425]].map(h=>({x:h[0],z:h[1],t:0,done:false}));
 /* F — REFINERÍA Y PUERTO: depósitos, bombas, torre de control, antiaéreos, destilación, tuberías, pasarelas, grúas, muelle */
 sect10('Refinería',X,-580,95,()=>{for(let x=-100;x<=100;x+=4){if(Math.abs(x)<8)continue;box(4,3,.4,0x6a6a62,X+x,1.5,-510,0,0,steelT);obstB.push({x:X+x,z:-510,hw:2,hd:.2,h:3})}
  for(let i=0;i<10;i++){cp(.4,.4,60,0x5a5a52,X-70+i*14,1.4+(i%3)*.8,-580).rotation.x=1.5708}for(let i=0;i<6;i++){box(30,.15,1.4,0x4a4a42,X-50+i*20,6,-545-i*12,0,0,steelT);for(const s of[-1,1])box(.15,6,.15,0x3a3a36,X-50+i*20+s*14,3,-545-i*12)}
  for(const [x,z] of[[-20,-630],[30,-632]]){cp(2.2,2.6,26,0x8a8a82,X+x,13,z);for(let i=0;i<6;i++)cp(2.8,2.8,.3,0x4a4a42,X+x,3+i*4,z);ob(X+x,z,2.8)}
  shack(X-70,-540,12,8,6,0x8a8478);shack(X+70,-530,10,8,5,0x8a8478);box(4,18,4,0x9a9488,X+70,9,-560,0,0,concT);box(7,3,7,0x4a5a6a,X+70,19.5,-560);obstB.push({x:X+70,z:-560,hw:2,hd:2,h:18});ZONE10.tower={x:X+70,z:-555};
  for(const s of[0,1]){const z=-580-s*40;for(const a of[-1,1])box(1,26,1,0xb89020,X+108+a*4,13,z);box(10,1,1,0xb89020,X+108,26,z);box(1,1,30,0xb89020,X+108,25,z+10)}box(10,1,20,0x5a4a3a,X+112,.4,-602,0,0,woodTex);ZONE10.ext={x:X+112,z:-600};
  wagon9(X-60,-520,1.5708);wagon9(X-48,-520,1.5708);for(const [x,z] of[[-15,-524],[20,-526]]){sb9(X+x,z+1.6,3.4,.9,1.15);sb9(X+x-1.9,z+.2,.9,2.4,1.15);sb9(X+x+1.9,z+.2,.9,2.4,1.15)}
  box(14,.6,10,0x4a4a42,X,6,-628,0,0,steelT);for(const a of[-1,1])for(const b of[-1,1])box(.6,6,.6,0x3a3a36,X+a*6.5,3,-628+b*4.5);obstB.push({x:X,z:-628,hw:7,hd:5,h:6.3,y0:5.7});PR.ladder(X-7.4,0,-628,6,1.5708);
  box(2,1.2,1.4,0x3a3a2a,X-10,.6,-515);box(.4,.5,.3,0xc02020,X-10,1.4,-515);ZONE10.det={x:X-10,z:-516.5}});
 L10.pump={hp:1500,max:1500,alive:true,x:X-70,z:-610};{const g=new T.Group(),q=PB();pBox(q,10,4,7,0x6a6a62,0,2,0);for(let i=0;i<4;i++){pCyl(q,.9,.9,3,0x3a4a5a,-3.6+i*2.4,5,0);pa(q,gTor(.7,.15,6,12),0xb83020,-3.6+i*2.4,6.6,0,1.5708)}pbMesh(q,g,VCV);g.position.set(L10.pump.x,0,L10.pump.z);scene.add(g);L10.pump.g=g;obstB.push({x:X-70,z:-610,hw:5,hd:3.5,h:6});HIT9.push({foe:true,x:()=>X-70,z:()=>-610,y0:0,y1:7,r:5,ok:()=>L10.pump.alive,dmg:(v,k)=>{const p=L10.pump;if(!p.alive)return;p.hp-=v*(k==='b'?.2:1);if(p.hp<=0){p.alive=false;boom9(p.x,p.z,2,false);mkFire(p.x,p.z,2,4,-1);feed('★ Sistema de bombeo destruido');say('¡Las bombas han volado! El combustible ya no fluye.',3)}}})}
 L10.aa=[];for(const [x,z] of[[-25,-530],[25,-530],[0,-645]]){const g=new T.Group(),q=PB();pCyl(q,1.4,1.6,.8,0x4a4a42,0,.4,0,0,0,0,10);pBox(q,1,1.2,1.4,0x5a5a52,0,1.4,0);for(const s of[-1,1])pCyl(q,.1,.1,3.4,0x2a2a2a,s*.25,2.6,.8,-.9,0,0,6);pbMesh(q,g,VCV);g.position.set(X+x,0,z);scene.add(g);const a={g,x:X+x,z,hp:650,alive:true};L10.aa.push(a);ob(X+x,z,1.7);HIT9.push({foe:true,x:()=>a.x,z:()=>a.z,y0:0,y1:4,r:1.8,ok:()=>a.alive,dmg:(v,k)=>{if(!a.alive)return;a.hp-=v*(k==='b'?.3:1);if(a.hp<=0){a.alive=false;boom9(a.x,a.z,1.2,false);a.g.rotation.z=.5;feed('★ Antiaéreo neutralizado')}}})}
 L10.dep=[mkFuelTank(X-45,-575,7,10,true),mkFuelTank(X,-600,8,12,true),mkFuelTank(X+45,-575,7,10,true)];L10.dep.forEach((d,i)=>d.name=['D-1','D-2','D-3'][i]);for(const [x,z,r] of[[-80,-570,3.5],[-85,-590,3],[80,-600,3.5],[85,-620,3],[-40,-620,3],[45,-620,3.5],[-60,-640,3],[60,-645,3]])mkFuelTank(X+x,z,r,6+R()*3,false);
 sbInit()}
function gateDmg(G,v,msg){if(!G.alive)return;G.hp-=v;if(G.hp<=0){G.alive=false;G.m.visible=false;const i=obstB.indexOf(G.o);if(i>=0)obstB.splice(i,1);boom9(G.m.position.x,G.m.position.z,1.4,false);say(msg,2.5)}}
function openGate(G,msg){if(!G.alive)return;G.alive=false;G.m.visible=false;const i=obstB.indexOf(G.o);if(i>=0)obstB.splice(i,1);boom9(G.m.position.x,G.m.position.z,1.5,false);if(msg)say(msg,3)}
/* =====================================================================
   NAVEGACIÓN DEL CAP. X: pasos por las líneas (alambradas, parapetos,
   muralla del complejo, boca de la mina, puentes del abismo, compuerta,
   valla de la refinería). Evita que bots y vehículos se queden trabados.
   ===================================================================== */
const WL10=[
 {z:-29.4,h:.8,gaps:()=>{const g=[X10-70,X10+70];for(const w of WIRE10)if(w.cut)g.push(w.cx);return g}},
 {z:-98,h:.8,gaps:()=>GATE10.bar&&!GATE10.bar.alive?[X10-70,X10,X10+70]:[X10-70,X10+70]},
 {z:-262,h:.9,gaps:()=>GATE10.comp&&!GATE10.comp.alive?[X10]:[]},
 {z:-272,h:1.6,gaps:()=>[X10]},
 {z:-336,h:6,gaps:()=>[X10-28,X10+30]},
 {z:-400,h:1,gaps:()=>GATE10.mine&&!GATE10.mine.alive?[X10]:[]},
 {z:-510,h:.3,gaps:()=>[X10-106,X10,X10+106]}];
function route10(a,tx,tz){const p=a.g.position;let W=null,bd=1e9;for(const w of WL10){if((p.z-w.z)*(tz-w.z)>=0)continue;const d=Math.abs(p.z-w.z);if(d<bd){bd=d;W=w}}if(!W){a.rt10=null;return null}
 const s=p.z>W.z?1:-1,r=a.rt10||(a.rt10={t:0,w:null,g:null,th:0});r.t-=V16.dt||.016;if(r.w!==W){r.w=W;r.th=0;r.t=0}
 if(r.t<=0){r.t=1;const G=W.gaps();let b=null,bs=1e9;for(const g of G){const sc=Math.abs(p.x-g)+Math.abs(tx-g);if(sc<bs){bs=sc;b=g}}if(b!==r.g)r.th=0;r.g=b}
 if(r.g===null)return[clamp(tx,p.x-6,p.x+6),W.z+s*(W.h+4)];const ap=[r.g,W.z+s*(W.h+3.2)],th=[r.g,W.z-s*(W.h+3.6)];if(r.th||(Math.abs(ap[0]-p.x)<2.2&&Math.abs(ap[1]-p.z)<2.6)){r.th=1;return th}return ap}
const _r10=route8;route8=function(a,tx,tz){return level===10?route10(a,tx,tz):_r10(a,tx,tz)};
const _uk10=unstk;unstk=function(e,ax,az,dt){if(level===10&&(ax||az)&&!e.pin){const tp=e.tp8||P.g.position,w=route10(e,tp.x,tp.z);if(w){const dx=w[0]-e.g.position.x,dz=w[1]-e.g.position.z,l=Math.hypot(dx,dz)||1,m=Math.hypot(ax,az)||1;ax=dx/l*m;az=dz/l*m}}return _uk10(e,ax,az,dt)};
/* el abismo de la mina bloquea el paso pero no la línea de tiro */
inB=function(q){for(const b of obstB)if(!b.nolos&&Math.abs(q.x-b.x)<b.hw&&Math.abs(q.z-b.z)<b.hd&&q.y<b.h&&q.y>=(b.y0||0))return true;return false};
/* =====================================================================
   EJÉRCITO DE EISENMARK: vanguardia (asalto, escopeteros, zapadores,
   escuderos acorazados, ametralladora), escuadra y oficial con uniforme
   ===================================================================== */
const ENM=['Brandt','Kessler','Vogt','Hartung','Lindner','Rauch','Falk','Störmer','Adler','Eckhart','Holz','Weiss','Kranz','Roth','Baumann','Seidel','Krämer','Wendt','Busch','Lorenz'],ERK=['Sturmmann','Gefreiter','Obergefreiter','Unteroffizier'];
const ROLE10={smg:'asalto',shot:'escopetero',sap:'zapador',shield:'escudero',rifle:'fusilero',mg:'ametrallador'};
function swapModel(o,ng){const old=o.g,ou=old.userData,nu=ng.userData;const map=new Map();for(const k in ou)if(ou[k]&&ou[k].isObject3D&&nu[k]&&nu[k].isObject3D)map.set(ou[k],nu[k]);
 for(const k of['mR','mL'])if(ou[k]&&nu[k])for(const c of ou[k].children.slice())nu[k].add(c);
 for(const k in ou){const v=ou[k];if(k in nu&&!(v&&v.isObject3D&&!(nu[k]&&nu[k].isObject3D)))continue;if(v&&v.isObject3D){const np=map.get(v.parent)||(v.parent===old?ng:null);if(np&&v.parent!==np)np.add(v)}nu[k]=v}
 ng.position.copy(old.position);ng.rotation.copy(old.rotation);ng.visible=old.visible;scene.add(ng);scene.remove(old);o.g=ng;if(o.u)o.u=nu;return old}
function eisGar(s,role){const ng=mkEis({mask:R()<.35,armor:role==='shield',rank:role==='mg'?1:R()<.2?1:0,pack:role!=='shield'});const u=ng.userData;
 for(const c of s.u.mR.children.slice())s.u.mR.remove(c);u.mR.add(role==='mg'?mkGun('mg'):role==='smg'?mkMP38d():role==='shot'?mkShotgun():role==='shield'?mkC10():role==='sap'?mkMP38d():mkGun('rifle'));
 if(role==='shield'){const sh=new T.Group(),q=PB();pBox(q,.72,1.2,.07,0x5a5e62,0,0,0);pBox(q,.6,.06,.08,0x3a3e42,0,.35,.01);pBox(q,.6,.06,.08,0x3a3e42,0,-.35,.01);pBox(q,.14,.05,.09,0x111111,.12,.42,.01);pBox(q,.3,.3,.09,0xb08a20,0,0,.02);pbMesh(q,sh,SABM);sh.position.set(.05,-.25,.25);sh.rotation.set(0,0,.1);u.mL.add(sh);const sw=mkSabre();sw.position.set(-.3,.15,-.05);sw.rotation.set(.3,0,2.9);u.ch.add(sw)}
 if(role==='sap'){const q=PB();pBox(q,.42,.3,.22,0x6a5a3a,0,.3,-.3);pCyl(q,.06,.06,.5,0x8a7a5a,.2,.55,-.3,0,0,1.5708,6);pBox(q,.1,.1,.1,0xc02020,-.15,.5,-.42);pbMesh(q,u.ch,VCM)}
 swapModel(s,ng);s.u=ng.userData;s.role=role;s.kind=role==='mg'?'mg':role==='rifle'?'rifle':'carb';s.mag=s.kind==='mg'?100:10;s.name=ERK[R()*4|0]+' '+ENM[(GAR.length*7+R()*20|0)%ENM.length]+' ('+ROLE10[role]+')';if(role==='shield'){s.hp=s.max=230}if(role==='sap'){s.hp=s.max=110}return s}
function gar10(list){const made=gar9(list.map(q=>[q[0],q[1],q[2]===undefined?Math.PI:q[2],q[3],q[4]==='mg'?'mg':'rifle']));made.forEach((s,i)=>eisGar(s,list[i][4]||'smg'));return made}
const _gd10=garDamage;garDamage=function(s,v,src){if(level===10&&s.role==='shield'){v*=.4;if(R()<.4)burst(s.g.position.x,1.3,s.g.position.z,0xffdd88,3,.15,3)}return _gd10(s,v,src)};
let PST10=0;function posts10(list){L10.posts=list;garAssign('x10_'+(PST10++),list)}
function line10(z,x0,x1,n,f,c){const L=[];for(let i=0;i<n;i++)L.push([x0+(x1-x0)*(n>1?i/(n-1):.5),z+(i%2)*1.2,f===undefined?Math.PI:f,!!c]);return L}
function eisOn(){if(L10.eis)return;L10.eis=1;playerEis(true);for(const a of allies){if(!a.name)continue;a.n0=a.name;a.g0=swapModel(a,mkEis({mask:R()<.5,rank:a.role==='Apoyo'?1:0}));a.name=ERK[R()*4|0]+' '+ENM[R()*ENM.length|0]}
 if(officer){officer.n0=officer.name;officer.g0=swapModel(officer,mkEis({officer:true,hat:'cap',hatC:0x2a2a26,rank:3,pack:false}));officer.name='Hauptmann Reuss'}
 if(MED){MED.n0=MED.name;const ng=mkEis({mask:false,pack:false});const q=PB();pBox(q,.2,.14,.2,0xe8e8e8,0,-.1,0);pBox(q,.06,.1,.21,0xc02020,0,-.1,0);pBox(q,.21,.04,.06,0xc02020,0,-.1,0);pbMesh(q,ng.userData.aL,VCM);MED.g0=swapModel(MED,ng);MED.name='Sanitäter Brenner'}}
function eisOff(){if(!L10.eis)return;L10.eis=0;playerEis(false);for(const a of allies)if(a.g0){swapModel(a,a.g0);a.g0=null;if(a.n0)a.name=a.n0}if(officer&&officer.g0){swapModel(officer,officer.g0);officer.g0=null;officer.name=officer.n0||officer.name}if(MED&&MED.g0){swapModel(MED,MED.g0);MED.g0=null;MED.name=MED.n0||MED.name}if(V18.mask)V18.mask.visible=false}
/* el diálogo del juego base nombra al Oberleutnant Kovač: en el cap. X el protagonista es el Gefreiter Kasimir Wolff */
const NMX=t=>typeof t==='string'&&level===10?t.replace(/Oberleutnant Kovač/g,'Gefreiter Wolff').replace(/Kovač/g,'Wolff').replace(/OBERLEUTNANT/g,'GEFREITER').replace(/Oberleutnant/g,'Gefreiter').replace(/TENIENTE/g,'HAUPTMANN').replace(/el teniente/g,'el capitán').replace(/Teniente/g,'Hauptmann').replace(/teniente/g,'capitán'):t;
const _say10=say;say=function(t,s){return _say10(NMX(t),s)};const _feed10=feed;feed=function(t){if(typeof t==='string')t=t.replace(' abatió a a ',' abatió a ').replace(' abatió a al ',' abatió al ');return _feed10(NMX(t))};const _story10=story;story=function(s){return _story10(NMX(s))};
/* =====================================================================
   UTILIDADES DE FASE
   ===================================================================== */
function sky10(k){if(k!=='noche10'){sky9(k);return}const S=[[[0,'#02040a'],[.45,'#0a1220'],[.5,'#1c2636'],[.53,'#0a0c10'],[1,'#050505']],0x0a1220,10,115,0x4a5a8a,0x101418,.6,0x8a9ad0,.28,[.9,.95,1.1]];
 setSky(S[0]);skyMesh.visible=true;L9.fog={c:new T.Color(S[1]),n:S[2],f:S[3]};scene.fog.color.copy(L9.fog.c);scene.fog.near=S[2];scene.fog.far=S[3];hemi.color.set(S[4]);hemi.groundColor.set(S[5]);hemi.intensity=S[6];sunL.color.set(S[7]);sunL.intensity=S[8];sunL.position.set(-60,40,-30);pMat.uniforms.tint.value.set(...S[9])}
function s10(kind,x,z,tag,o){o=o||{};const e=sp10(kind,x,z,{force:true});if(!e)return null;e.t10=tag;if(o.pin)e.pin=[x,z];if(o.un){e.unaware=true;e.active=false;e.alert=99;e.pat=o.pat||null;e.pi=0;e.ph10=o.f===undefined?0:o.f}return e}
function w10(list,cx,cz,spread,tag){let n=0;for(const k of list){const e=sp10(k,cx+(R()-.5)*spread,cz+(R()-.5)*8);if(e){e.t10=tag;e.alert=0;n++}}return n}
const cnt10=t=>{let n=0;for(const e of enemies)if(e.t10===t)n++;return n};
const near10=(x,z,r)=>Math.hypot(P.g.position.x-x,P.g.position.z-z)<r;
function clear10(x,z,r){for(const e of enemies)if(e.active!==false&&Math.hypot(e.g.position.x-x,e.g.position.z-z)<r)return false;return true}
function bar10(f){const n=10,k=Math.round(clamp(f,0,1)*n);return'['+'■'.repeat(k)+'□'.repeat(n-k)+']'}
/* trabajos con E/USAR (cortar alambre, sabotear, accionar mecanismos, colocar cargas) — sirve en táctil */
function works10(){const W=[],X=X10,ph=L10.ph,pp=P.g.position;
 if(ph===1&&!L10.comms)W.push({x:ZONE10.comms.x,z:ZONE10.comms.z,r:3.2,dur:3,lbl:'Sabotear la estación de comunicaciones',fn:()=>{L10.comms=true;burst(ZONE10.comms.x,2,ZONE10.comms.z,0x9ad0ff,20,.4,6);flashLight(ZONE10.comms.x,3,ZONE10.comms.z,6,.4,0x9ad0ff);tn18('sawtooth',900,60,.6,.05);feed('★ Radio enemiga saboteada');say('Wolff (susurro): «Cables cortados. Ya no pueden pedir ayuda.»',3)}});
 if(ph===2&&L10.st===0)for(const w of WIRE10)if(!w.cut&&Math.abs(pp.z-(-29.4))<3.2&&pp.x>w.x0-1&&pp.x<w.x1+1)W.push({x:clamp(pp.x,w.x0,w.x1),z:pp.z,r:2.6,dur:2.2,lbl:'Cortar la alambrada',fn:()=>cutWire(w)});
 if(ph===3&&L10.st===1&&GATE10.comp.alive&&!L10.gchg)W.push({x:X,z:-258.6,r:3.2,dur:2.5,lbl:'Colocar la carga en la puerta del complejo',fn:()=>gateCharge10()});
 if(ph===4)for(const m of MECH10)if(!m.done)W.push({x:m.x,z:m.z,r:2.8,dur:4,lbl:'Activar el mecanismo '+m.n,fn:()=>mechDone10(m)});
 if(ph===6&&L10.st===1)for(const d of L10.dep)if(!d.charged)W.push({x:d.x,z:d.z+d.r+1.2,r:3.2,dur:2.5,lbl:'Colocar cargas en el depósito '+d.name,fn:()=>{d.charged=true;const c=box(.8,.6,.4,0x6a5a3a,d.x,1.2,d.z+d.r+.25);box(.1,.2,.1,0xc02020,d.x,1.6,d.z+d.r+.45,0,0xff0000);feed('★ Cargas en '+d.name);tn18('square',1200,1200,.08,.03)}});
 if(ph===6&&L10.st===2&&!L10.sapOK)W.push({x:ZONE10.det.x,z:ZONE10.det.z,r:3,dur:6,lbl:'Armar tú mismo el detonador',fn:()=>{L10.sapT=999}});
 if(ph===6&&L10.st===4)W.push({x:ZONE10.det.x,z:ZONE10.det.z,r:3,dur:1.2,lbl:'ACCIONAR EL DETONADOR',fn:()=>cineBlast10()});
 return W}
function workUpd10(dt){const pp=P.g.position,w=L10.work;if(w){if(Math.hypot(pp.x-w.x,pp.z-w.z)>w.r+1.2||L9.cine){L10.work=null;say('Interrumpido.',1.2);return}w.t+=dt;$('pr').textContent=w.lbl+'… '+bar10(w.t/w.dur);if(R()<dt*5)burst(w.x,1,w.z,0xffd080,1,.08,2);if(w.t>=w.dur){L10.work=null;w.fn()}return}
 if($('pr').textContent)return;for(const c of works10())if(Math.hypot(pp.x-c.x,pp.z-c.z)<c.r){$('pr').textContent='[E / USAR] '+c.lbl;return}}
function sapUpd10(dt){const j=L10.sj;if(!j)return;let s=j.s;if(!s||!s.alive){s=null;let bd=1e9;for(const q of GAR)if(q.alive&&q.role==='sap'&&q.g.visible){const d=Math.hypot(q.g.position.x-j.x,q.g.position.z-j.z);if(d<bd){bd=d;s=q}}j.s=s;if(s){s.post={x:j.x,z:j.z,f:Math.PI,c:false,fb:null,occ:s};s.st='move'}}
 if(!s){j.wait=(j.wait||0)+dt;return}if(Math.hypot(s.g.position.x-j.x,s.g.position.z-j.z)<2.4){j.t+=dt;s.crouch=1;if(R()<dt*4)burst(j.x,.6,j.z,0xffd080,1,.08,2);if(j.t>=j.dur){L10.sj=null;j.fn(s);if(L10.posts)posts10(L10.posts)}}}
function pinUpd10(){for(const e of enemies)if(e.pin){e.g.position.x=e.pin[0];e.g.position.z=e.pin[1];e.vx=e.vz=0}}
/* =====================================================================
   FASE I — INFILTRACIÓN COSTERA (sigilo nocturno)
   ===================================================================== */
const BOATS10=[];
function mkBoat10(big){const g=new T.Group(),q=PB(),L=big?11:5,W=big?4.2:1.8;pBox(q,W,big?1.4:.7,L,0x4a4e48,0,big?.7:.35,0);pBox(q,W-.3,.1,L-.4,0x2a2a26,0,big?1.35:.68,0);for(const s of[-1,1])pBox(q,.15,big?.7:.3,L,0x5a5e58,s*W/2,big?1.6:.8,0);if(big){pBox(q,W,1.8,.2,0x5a5e58,0,1.1,L/2+.1,-.15);pBox(q,1.2,1,1.2,0x3a3e3a,0,2,-L/2+1);pCyl(q,.2,.2,1.2,0x2a2a2a,0,2.6,-L/2+1,0,0,0,6)}pbMesh(q,g,VCV);scene.add(g);return g}
function enter10_1(){const X=X10;L10.ph=1;L10.st=0;L10.t=0;L10.solo=true;L10.sky='noche10';sky10('noche10');L10.cp=[X-30,38];L10.alarm=false;L10.det=0;L10.aT=0;L10.comms=false;
 s10('fus',X-48,9.5,'p1',{un:1,f:0});s10('ofi',X-40,10,'p1',{un:1,pat:[[X-36,12],[X-54,6],[X-46,-1]]});
 L10.nest=[s10('amet',X-14,-6,'p1',{un:1,pin:1,f:0}),s10('amet',X+26,-4,'p1',{un:1,pin:1,f:0})];s10('fus',X-18,-4,'p1',{un:1,f:.5});s10('fus',X+30,-3,'p1',{un:1,f:-.5});
 s10('fus',X-80,28,'p1',{un:1,pat:[[X-88,27],[X-40,25]]});s10('fus',X+8,26,'p1',{un:1,pat:[[X+4,26],[X+64,28]]});s10('gra',X+44,10,'p1',{un:1,pat:[[X+42,14],[X+46,-12]]});s10('tir',X+54,-15,'p1',{un:1,f:.4});s10('trasgo',X-100,18,'p1',{un:1,pat:[[X-106,20],[X-68,6]]});s10('fus',X-2,6,'p1',{un:1,pat:[[X-6,8],[X+16,4],[X+4,-10]]});
 obj9('I · Infiltración: sabotea la radio y neutraliza los 2 nidos de ametralladora',ZONE10.comms.x,ZONE10.comms.z)}
function upd10_1(dt){const X=X10;stealthUpd(dt);const n=L10.nest.filter(e=>enemies.indexOf(e)>=0);
 if(L10.st===0){const T_=[];if(!L10.comms)T_.push('sabotea la radio');if(n.length)T_.push('neutraliza '+n.length+' nido'+(n.length>1?'s':'')+' de MG');if(T_.length){const tg=!L10.comms?ZONE10.comms:{x:n[0].g.position.x,z:n[0].g.position.z};obj9('I · Infiltración: '+T_.join(' y '),tg.x,tg.z)}else{L10.st=1;say('Wolff: «Nidos en silencio. Al faro, a dar la señal.»',3);L10.cp=[X+10,8]}}
 if(L10.st===1){obj9('I · Sube a la posición elevada del faro y lanza la bengala',ZONE10.hill.x,ZONE10.hill.z);if(near10(ZONE10.hill.x,ZONE10.hill.z,5)){L10.st=2;cineLanding10()}}
 const el=$('det10');el.style.display='block';el.innerHTML=L10.alarm?'<b style="color:#ff5040">⚠ ALARMA</b>'+(L10.comms?' · radio cortada':''):'DETECCIÓN <span style="display:inline-block;width:90px;height:7px;background:#222;vertical-align:middle"><i style="display:block;height:7px;width:'+Math.round(L10.det*100)+'%;background:'+(L10.det>.6?'#ff5040':'#e0b050')+'"></i></span>'+(L10.aT>0?' <b style="color:#ffa040">¡SOSPECHAN!</b>':'')}
/* =====================================================================
   FASE II — TRINCHERAS DE HIERRO (tres líneas)
   ===================================================================== */
function enter10_2(){const X=X10;L10.ph=2;L10.st=0;L10.t=0;L10.solo=false;L10.alarm=true;$('det10').style.display='none';L10.sky='alba';L10.cp=[X,30];
 for(const e of enemies)if(e.unaware){e.unaware=false;e.active=true;e.alert=0}
 posts10(line10(-12,X-44,X+44,12,Math.PI,true));
 for(const [k,x,z,o] of[['fus',-40,-41],['fus',-20,-41],['fus',18,-41],['fus',40,-41],['gra',-8,-43],['gra',30,-43],['amet',10,-40.5,1],['tir',-50,-44],['escudo',-30,-42]])s10(k,X+x,z,'l1',{pin:o});
 obj9('II · Abre paso en la alambrada (E junto al alambre) — los zapadores también lo intentan',X-33,-29);L10.sj=null;L10.sapT0=0}
function cutCenter10(){for(const i of[2,3])if(!WIRE10[i].cut)cutWire(WIRE10[i])}
function upd10_2(dt){const X=X10,st=L10.st;L10.t+=dt;mortar10(dt);
 if(st===0){if(L10.t>16&&!L10.sj&&!WIRE10.some(w=>w.cut))L10.sj={x:X-33,z:-26.5,dur:6,t:0,fn:()=>{cutWire(WIRE10[1]);say('Zapador: «¡Paso abierto en el tramo oeste!»',2.5)}};
  if(WIRE10.some(w=>w.cut)){L10.st=1;L10.sj={x:X-3,z:-26.5,dur:5,t:0,fn:()=>{cutCenter10();say('Zapador: «¡Carril central despejado para la Kettenhund!»',2.5)}};posts10(line10(-34,X-50,X+50,12,Math.PI,true));say('Reuss: «¡Por la brecha! ¡A la primera trinchera!»',3);for(const t of TK10)if(t.name==='Kettenhund')t.path=[[X,-18]]}}
 else if(st===1){const n=cnt10('l1');obj9('II · Toma la primera trinchera ('+n+' defensores)',X,-41);if(WIRE10[2].cut&&WIRE10[3].cut)for(const t of TK10)if(t.name==='Kettenhund'&&t.pi>=t.path.length)t.path=[[X,-18],[X,-34]],t.pi=0;
  if(n===0){L10.st=2;L10.cp=[X,-24];cutCenter10();posts10(line10(-43,X-50,X+50,12,Math.PI,true));say('Reuss: «¡Primera línea nuestra! ¡Morteros al frente, cuidado!»',3);
   for(const [k,x,z,o] of[['amet',-34,-70,1],['amet',34,-70,1],['fus',-22,-67],['fus',22,-67],['fus',-50,-67],['fus',50,-67],['escudo',0,-68],['gorlock',-8,-74]])s10(k,X+x,z,'l2',{pin:o});for(const [x,z] of[[-10,-80],[14,-82]])s10('lanz',X+x,z,'mort',{pin:1});
   for(const t of TK10)if(t.name==='Kettenhund'){t.path=[[X,-18],[X,-36],[X,-52]];t.pi=0}}}
 else if(st===2){const m=cnt10('mort'),n=cnt10('l2');obj9('II · Elimina a los servidores de mortero ('+m+') y toma la segunda línea ('+n+')',m?X-10:X,m?-80:-68);
  if(m+n===0){L10.st=3;L10.cp=[X,-45];posts10(line10(-60,X-50,X+50,12,Math.PI,true));say('Reuss: «¡Segunda línea tomada! Quedan los nidos de la tercera.»',3);
   for(const [x,z] of[[-28,-101],[28,-101],[48,-102]])s10('amet',X+x,z,'mg3',{pin:1});for(const [k,x,z] of[['fus',-12,-106],['fus',14,-106],['ofi',0,-110],['escudo',-40,-104],['gra',40,-108]])s10(k,X+x,z,'l3');
   for(const t of TK10)if(t.name==='Kettenhund'){t.path=[[X,-52],[X,-70],[X,-86]];t.pi=0}}}
 else if(st===3){const n=cnt10('mg3');obj9('II · Silencia los nidos de ametralladora de la tercera línea ('+n+')',X,-101);if(n===0){L10.st=4;cineBreach10()}}
 else if(st===4){let left=0,tg=null;for(const g of L10.guns){if(g.cap)continue;left++;tg=tg||g;if(near10(g.x,g.z,3.6)&&clear10(g.x,g.z,10)){g.ct=(g.ct||0)+dt;$('pr').textContent='Capturando cañón… '+bar10(g.ct/2);if(g.ct>=2){g.cap=true;PR.flag(g.x+1.5,g.z,0x3a3a30,4);left--;feed('★ Cañón capturado ('+L10.guns.filter(q=>q.cap).length+'/3)')}}}
  L10.wt-=dt;if(L10.wt<=0&&enemies.length<10){L10.wt=20;w10(['fus','fus','gra','orco'],X+(R()-.5)*80,-150,20,'l3')}
  obj9('II · Captura la artillería enemiga ('+(3-left)+'/3)',tg?tg.x:X,tg?tg.z:-110);if(!left){L10.st=5;cineArmor10()}}}
function mortar10(dt){if(cnt10('mort')===0)return;L10.mt=(L10.mt||5)-dt;if(L10.mt>0)return;L10.mt=6+R()*3;const T_=[P.g.position];for(const s of GAR)if(s.alive&&s.g.visible)T_.push(s.g.position);const p=T_[R()*T_.length|0];for(const e of enemies)if(e.t10==='mort'){burst(e.g.position.x,1.2,e.g.position.z,0xffcc66,6,.2,5);expSnd(e.g.position.x,e.g.position.z,.35)}shell9(p.x+(R()-.5)*9,p.z+(R()-.5)*9,1)}
/* =====================================================================
   FASE III — DESIERTO (ofensiva mecanizada)
   ===================================================================== */
const TRK10=[];
function enter10_3(){const X=X10;L10.ph=3;L10.st=0;L10.t=0;L10.sky='manana';sky9('manana');L10.cp=[X,-112];L10.wt=20;L10.cvT=14;L10.crT=0;L10.etS=false;L10.trans=false;
 posts10(line10(-128,X-40,X+40,10,Math.PI,false));
 for(const [k,x,z,o] of[['fus',-66,-166],['fus',-74,-182],['ofi',-64,-184],['gra',-82,-170]])s10(k,X+x,z,'bat',{pin:o});
 for(const [k,x,z,o] of[['amet',30,-206,1],['fus',46,-204],['fus',36,-190],['escudo',44,-196],['gorlock',52,-210],['gra',24,-198]])s10(k,X+x,z,'cr',{pin:o});
 for(const [x,z] of[[-30,-150],[50,-160],[-10,-212]])s10('acech',X+x,z,'st3');
 obj9('III · Batería, cruce ferroviario, convoy de combustible',X-70,-175)}
function convoy10(){const X=X10;for(let i=0;i<3;i++){const g=mkTruck16({driver:true,col:0x6a5a40});g.position.set(X+20-i*12,0,-237);g.rotation.y=1.5708;const t={g,hp:650,alive:true,ob:{x:g.position.x,z:-237,r:2.4}};obst.push(t.ob);TRK10.push(t);
  HIT9.push({foe:true,x:()=>g.position.x,z:()=>g.position.z,y0:0,y1:3,r:2.4,ok:()=>t.alive,dmg:(v,k)=>{if(!t.alive)return;t.hp-=v*(k==='b'?.25:1);if(t.hp<=0){t.alive=false;boom9(g.position.x,g.position.z,1.6,false);mkFire(g.position.x,g.position.z,1.4,1,-1);g.rotation.z=.25;feed('★ Camión cisterna destruido');score+=400}}})}
 say('¡El convoy de combustible arranca hacia el este! ¡Detenedlo!',3)}
function trkUpd10(dt){for(const t of TRK10){if(!t.alive)continue;const g=t.g;if(g.position.x<X10+150){g.position.x+=2.2*dt;const u=g.userData;if(u.wh)for(const w of u.wh)w.rotation.x+=dt*4}t.ob.x=g.position.x}}
function upd10_3(dt){const X=X10;L10.t+=dt;trkUpd10(dt);
 if(!L10.trans){const d=DR10.find(o=>o.kind==='transporte'&&o.side==='a');if(d&&d.alive&&d.g.position.z<-118){L10.trans=true;const p=d.g.position;gar10([[p.x-2,p.z+2,Math.PI,0,'smg'],[p.x+2,p.z+2,Math.PI,0,'smg'],[p.x,p.z+4,Math.PI,0,'sap'],[p.x-3,p.z+4,Math.PI,0,'shot']]);posts10(L10.posts);say('Lastträger desembarca a la infantería motorizada.',2.5)}}
 L10.cvT-=dt;if(L10.cvT<=0&&!TRK10.length)convoy10();
 L10.wt-=dt;if(L10.wt<=0&&enemies.length<14){L10.wt=24;w10(['fus','gra','genglock','gorlock'],X+(R()-.5)*90,-250,20,'w3')}
 if(L10.st===0){const bat=L10.bat.filter(g=>g.alive).length,cvy=TRK10.length?TRK10.filter(t=>t.alive).length:3,et=!L10.etS?1:ET10&&ET10.alive?1:0;
  if(!L10.crOK){if(near10(ZONE10.cross.x,ZONE10.cross.z,10)&&cnt10('cr')===0&&clear10(ZONE10.cross.x,ZONE10.cross.z,18)){L10.crT+=dt;$('pr').textContent='Asegurando el cruce ferroviario… '+bar10(L10.crT/5);if(L10.crT>=5){L10.crOK=true;feed('★ Cruce ferroviario tomado');PR.flag(ZONE10.cross.x+3,ZONE10.cross.z,0x3a3a30,6)}}}
  const done=(bat?0:1)+(L10.crOK?1:0)+(cvy?0:1);if(!L10.etS&&(L10.t>45||done>=2)){L10.etS=true;cineFlank10();return}
  const parts=[];if(bat)parts.push('batería ('+bat+')');if(!L10.crOK)parts.push('cruce ferroviario');if(cvy)parts.push('convoy ('+cvy+')');if(L10.etS&&et)parts.push('carro enemigo');
  let tg=bat?L10.bat.find(g=>g.alive):!L10.crOK?ZONE10.cross:cvy?(TRK10.length?TRK10.find(t=>t.alive).g.position:{x:X+20,z:-237}):ET10&&ET10.alive?ET10.g.position:null;obj9('III · Destruye/toma: '+parts.join(', '),tg?tg.x:undefined,tg?tg.z:0);
  L10.front=tg?{x:tg.x,z:tg.z}:{x:X,z:-200};
  if(!parts.length&&L10.etS){L10.st=1;L10.cp=[X,-200];posts10(line10(-246,X-30,X+30,10,Math.PI,true));L10.sj={x:X+3,z:-257.8,dur:8,t:0,fn:()=>gateCharge10()};say('Reuss: «¡Zapadores, a la puerta del complejo! Cubridlos.»',3);for(const t of TK10)if(t.alive){t.path=[[t.g.position.x,t.g.position.z],[X+(t.name==='Zorn'?10:t.name==='Späher'?-10:0),-240]];t.pi=0}}}
 else if(L10.st===1){obj9(L10.gchg?'III · ¡Carga colocada! Apártate de la puerta':'III · Abre el acceso al complejo (zapadores o tú mismo: E)',X,-260);L10.front={x:X,z:-245};if(!GATE10.comp.alive){L10.st=2;L10.cp=[X,-245];say('Reuss: «¡Dentro! Goliat se queda en la entrada: no cabe por la boca de la mina.»',3.5);posts10(line10(-268,X-5,X+5,6,Math.PI,false))}}
 else if(L10.st===2){obj9('III · Entra en las minas de Khazrul',X,-274);if(inMine(P.g.position))cineMine10()}}
function gateCharge10(){if(L10.gchg)return;L10.gchg=true;if(L10.sj){L10.sj=null;if(L10.posts)posts10(L10.posts)}const X=X10;box(.8,.8,.3,0x6a5a3a,X,1.4,-261);feed('Carga colocada: 5 s');let k=0;const iv=setInterval(()=>{if(level!==10){clearInterval(iv);return}k++;tn18('square',1400,1400,.06,.04);if(k>=5){clearInterval(iv);openGate(GATE10.comp,'¡La puerta del complejo ha volado!');for(const e of enemies)if(Math.hypot(e.g.position.x-X,e.g.position.z+262)<9)hurt(e,300,'m');if(near10(X,-262,6))hitP(30)}},1000)}
/* =====================================================================
   FASE IV — LAS MINAS DE KHAZRUL
   ===================================================================== */
const VENT10=[[MX0+3,-305],[MX0+3,-365],[MX1-3,-310],[MX1-3,-360]];
function enter10_4(){const X=X10;L10.ph=4;L10.st=0;L10.t=0;L10.cp=[X,-282];L10.wt=4;L10.front={x:X,z:-252};posts10(line10(-300,X-14,X+14,8,Math.PI,false));
 bindFireLight(X-50,2.5,-302,0,0xffa050);bindFireLight(X+50,2.5,-302,1,0xffa050);bindFireLight(X,3,-386,2,0xff8040);bindFireLight(X+55,2,-378,3,0xff5010);
 for(const t of TK10){t.hold=true}obj9('IV · Activa los tres mecanismos de la compuerta',MECH10[0].x,MECH10[0].z)}
function mechDone10(m){if(m.done)return;m.done=true;m.g.rotation.y=.25;burst(m.x,1.6,m.z,0xffd080,16,.4,5);tn18('sawtooth',90,60,1.2,.06);nz18(.05,1,'lowpass',400,100,.06);const n=MECH10.filter(q=>q.done).length;feed('★ Mecanismo '+m.n+' activado ('+n+'/3)');
 const X=X10,v=VENT10[R()*4|0];if(n===1)w10(['mino','trasgo','trasgo'],v[0],v[1],4,'w4');if(n===2){w10(['capa','bruto','genglock'],v[0],v[1],4,'w4');say('¡Un capataz azuza a las bestias!',2.5)}
 if(n===2)posts10(line10(-370,X-14,X+14,8,Math.PI,false));
 if(n===3){openGate(GATE10.mine,'¡La compuerta norte se abre! ¡A la explanada!');shake=1.2;L10.st=1;L10.cp=[X,-384]}}
function upd10_4(dt){const X=X10;L10.t+=dt;
 if(L10.cart){L10.cart.position.z=-303+Math.sin(L10.t*.25)*20}if(L10.lift)L10.lift.position.y=Math.max(0,Math.sin(L10.t*.3)*7);
 for(const d of DR10)if(d.side==='a'&&d.g.position.z<-256){d.g.position.z=-256;d.vz=Math.max(0,d.vz)}
 if(L10.st===0){L10.wt-=dt;if(L10.wt<=0&&enemies.length<14){L10.wt=14;const v=VENT10[R()*4|0];const P_=['trasgo','genglock','gorlock','acech','orco','hurlock','escudo'];w10([P_[R()*7|0],P_[R()*7|0],P_[R()*7|0],'trasgo'],v[0],v[1],4,'w4');feed('Algo se arrastra por las galerías…')}
  const m=MECH10.find(q=>!q.done);obj9('IV · Activa los mecanismos de la compuerta ('+MECH10.filter(q=>q.done).length+'/3) — E junto a la rueda',m.x,m.z)}
 else{obj9('IV · Cruza la compuerta hacia la explanada',X,-404);if(P.g.position.z<-404)enter10_5()}}
/* =====================================================================
   FASE V — LA CARGA DE LOS CATAFRACTOS
   ===================================================================== */
function enter10_5(){const X=X10;L10.ph=5;L10.st=0;L10.t=0;L10.sky='tarde';sky9('tarde');L10.cp=[X,-398];posts10(line10(-414,X-40,X+40,10,Math.PI,true));
 for(const [k,x,z,o] of[['amet',-10,-487,1],['amet',20,-489,1],['ogro',-40,-496],['ogro',44,-494],['escudo',-25,-482],['escudo',5,-480],['escudo',30,-482],['fus',-50,-484],['fus',-14,-482],['fus',14,-484],['fus',54,-484],['mino',0,-492],['capa',10,-497],['lanz',-30,-490],['lanz',36,-490]])s10(k,X+x,z,'e5',{pin:o});
 for(const h of ZONE10.hills){s10('fus',h.x+3,h.z-4,'h5');s10(R()<.5?'gra':'gorlock',h.x-3,h.z-5,'h5')}
 spawnDraco('asalto','e',X+60,-492,'Bestia de guerra');
 for(const c of CAV)if(c.g){scene.remove(c.g)}CAV.length=0;for(let i=0;i<8;i++)mkCat10(i,X-160+(i%4)*3.2,-440-(i>>2)*4);
 Object.assign(CAVS,{st:'arrive',t:0,n0:8,path:[[X-130,-432],[X-96,-414]],pi:0,home:[X-96,-414],rx:X-96,rz:-414,go:0,fell:0,cn:'Rittmeister Varga',bx:[X-150,X+150,-500,-406],tgt:null});
 say('Reuss: «Tomad las tres alturas. Los catafractos de Varga llegan por las dunas del oeste.»',4)}
function upd10_5(dt){const X=X10;L10.t+=dt;cavUpd(dt);catAnim();
 if(L10.st===0){let left=0,tg=null;for(const h of ZONE10.hills){if(h.done)continue;left++;tg=tg||h;if(near10(h.x,h.z,5.5)&&clear10(h.x,h.z,12)){h.t+=dt;$('pr').textContent='Asegurando la posición… '+bar10(h.t/4);if(h.t>=4){h.done=true;PR.flag(h.x,h.z,0x3a3a30,6);feed('★ Posición elevada asegurada');left--}}}
  obj9('V · Asegura las tres posiciones elevadas ('+(3-left)+'/3)',tg?tg.x:X,tg?tg.z:-430);if(!left){L10.st=1;L10.bt=9;posts10([[X-55,-427,Math.PI,true],[X-52,-428,Math.PI,true],[X,-442,Math.PI,true],[X+3,-443,Math.PI,true],[X+55,-427,Math.PI,true],[X+52,-428,Math.PI,true],[X-25,-430,Math.PI,true],[X+25,-430,Math.PI,true]]);say('Reuss: «¡Alturas nuestras! ¡Artillería: fuego sobre la línea enemiga!»',3)}}
 else if(L10.st===1){L10.bt-=dt;obj9('V · Bombardeo de la artillería capturada…',X,-488);L10.sh=(L10.sh||0)-dt;if(L10.sh<=0){L10.sh=.45;shell9(X+(R()-.5)*120,-480-R()*20,1.2);if(R()<.3)tn18('sawtooth',300,80,.5,.03)}if(L10.bt<=0){L10.st=2;cineCharge10()}}
 else if(L10.st===2){const n=cnt10('e5'),mg=enemies.filter(e=>e.t10==='e5'&&e.pin).length;obj9('V · Rompe la línea enemiga junto a los catafractos ('+n+')',X,-486);if(n<=2&&!mg){L10.st=3;L10.cp=[X,-470];posts10(line10(-500,X-30,X+30,10,Math.PI,false));say('Reuss: «¡La línea se rompe! ¡A la refinería!»',3)}}
 else{obj9('V · Avanza hacia la refinería',X,-508);if(P.g.position.z<-512)enter10_6()}}
/* =====================================================================
   FASE VI — LA REFINERÍA DE ALEJANDRÍA y el Guardián
   ===================================================================== */
function enter10_6(){const X=X10;L10.ph=6;L10.st=0;L10.t=0;L10.cp=[X,-506];L10.towT=0;L10.wt=18;CAVS.st='off';for(const c of CAV)if(c.alive){c.st='slot'}
 posts10(line10(-532,X-40,X+40,12,Math.PI,true));bindFireLight(X-70,3,-605,0,0xff9040);bindFireLight(X+70,3,-555,1,0xff9040);
 for(const [k,x,z,o] of[['amet',-15,-524,1],['amet',20,-526,1],['fus',-40,-540],['fus',40,-540],['fus',-60,-560],['fus',65,-552],['gra',0,-545],['gra',-25,-560],['ball',30,-565],['ball',-50,-590],['lanz',10,-610],['tir',-75,-548],['escudo',75,-565]])s10(k,X+x,z,'r6',{pin:o});
 mkCrate18(X+6,-505,10);obj9('VI · Bombas, torre de control y antiaéreos',L10.pump.x,L10.pump.z)}
function spawnBoss10(){const X=X10;const e=spMin(X,-628,'bl'),u=e.g.userData;e.boss10=1;e.s=2.3;e.g.scale.setScalar(2.3);const dm={easy:.78,normal:1,hard:1.28}[difficulty]||1;e.hp=e.max=5200*dm;e.alert=0;e.k8n='al GUARDIÁN DE LA REFINERÍA';e.t10='boss';e.bst=1;e.bcd=3;e.slamT=5;e.g.position.y=6.3;e.pin=[X,-628];
 const EM=u.em16||(u.em16=VCM.clone());{const q=PB();pBox(q,.95,.7,.55,0x4a4e52,0,.38,.05);for(let i=0;i<4;i++)pBox(q,1,.06,.58,0x8a6a2a,0,.1+i*.18,.06);for(const s of[-1,1])pBox(q,.4,.2,.5,0x5a5e62,s*.55,.72,0,0,0,s*.4);pbMesh(q,u.ch,EM)}
 {const c=new T.Group(),q=PB();pCyl(q,.16,.2,1.4,0x2a2a2a,0,-.2,.35,1.5708,0,0,8);pCyl(q,.24,.24,.5,0x4a4a42,0,-.2,-.15,1.5708,0,0,8);pBox(q,.4,.4,.3,0x5a4a3a,0,-.2,-.5);pbMesh(q,c,EM);u.mR.add(c);e.can=c}
 $('bb').style.display='block';$('bb').querySelector('span').textContent='GUARDIÁN DE LA REFINERÍA · MINOTAURO ACORAZADO';L10.boss=e;return e}
function boss10Upd(dt){const e=L10.boss;if(!e||enemies.indexOf(e)<0)return;$('bb').querySelector('i').style.width=Math.max(0,e.hp/e.max*100)+'%';const p=e.g.position,pp=P.g.position,d=Math.hypot(pp.x-p.x,pp.z-p.z),f=e.hp/e.max,u=e.g.userData;
 if(e.bst===1){p.y=6.3;e.g.rotation.y=Math.atan2(pp.x-p.x,pp.z-p.z);u.aR.rotation.x=-1.5;e.bcd-=dt;if(e.bcd<=0){e.bcd=2.4+R()*.8;const o=new T.Vector3();e.can.getWorldPosition(o);burst(o.x,o.y,o.z,0xffcc66,12,.3,8);smoke(o.x,o.y,o.z,3,2,0x8a8a8a,.7,.5);expSnd(p.x,p.z,.7);const tx=pp.x+(R()-.5)*5,tz=pp.z+(R()-.5)*5;trc16(o,new T.Vector3(tx,.5,tz),0xffa040);setTimeout(()=>{if(level===10)boom9(tx,tz,1.2,true)},250)}
  if(R()<dt*1.4&&losClear(p.x,7,p.z,pp.x,1.2,pp.z)){for(let i=0;i<4;i++)setTimeout(()=>{if(level!==10||!playing)return;const o=new T.Vector3();e.can.getWorldPosition(o);trc16(o,new T.Vector3(pp.x+(R()-.5)*2,1,pp.z+(R()-.5)*2),0xffd080);if(R()<.35)hitP(6)},i*110)}
  if(f<.66){e.bst=2;e.pin=null;e.jy=6.3;say('¡El Guardián salta de la plataforma!',2.2);e.roar=1.2;tn18('sawtooth',60,30,1.2,.12)}}
 else if(e.bst===2||e.bst===3){if(e.jy>0){e.jy=Math.max(0,e.jy-dt*14);p.y=e.jy;if(e.jy===0){boom9(p.x,p.z,1.6,true,0xc08040);shake=1.8;for(const s of GAR)if(s.alive&&Math.hypot(s.g.position.x-p.x,s.g.position.z-p.z)<8)garDamage(s,40,e)}}
  e.slamT-=dt;if(e.slamT<.7&&e.slamT>0&&d<9){u.aR.rotation.x=u.aL.rotation.x=-2.9}if(e.slamT<=0&&d<9){e.slamT=(e.bst===3?3.5:5.5)+R()*2;boom9(p.x+Math.sin(e.g.rotation.y)*3,p.z+Math.cos(e.g.rotation.y)*3,1.4,true,0xff5020);shake=1.5}
  e.bcd-=dt;if(d>12&&e.bcd<=0){e.bcd=4;const tx=pp.x,tz=pp.z;const o=new T.Vector3();e.can.getWorldPosition(o);trc16(o,new T.Vector3(tx,.5,tz),0xffa040);burst(o.x,o.y,o.z,0xffcc66,10,.3,8);setTimeout(()=>{if(level===10)boom9(tx,tz,1,true)},250)}
  if(e.bst===2&&f<.33){e.bst=3;e.sp=(e.sp||3)*1.45;e.roar=1.4;say('¡El Guardián enloquece! ¡Está destrozando las coberturas!',2.5);tn18('sawtooth',50,25,1.6,.14)}
  if(e.bst===3){sbHit(p.x,p.z,2.4);for(let i=covers.length-1;i>=0;i--){const c=covers[i];if(c.sb)continue;if(Math.hypot(c.x-p.x,c.z-p.z)<3.5&&R()<dt){burst(c.x,1,c.z,0x8a7a5a,8,.6,5)}}e.alert=0;e.tp8=P.g.position}}}
function upd10_6(dt){const X=X10;L10.t+=dt;boss10Upd(dt);
 const wave=(n)=>{L10.wt-=dt;if(L10.wt<=0&&enemies.length<14){L10.wt=n;const s=R()<.5?[X-95,-560]:[X+90,-640];const P_=['fus','gra','ogro','bruto','mino','escudo','gorlock','orco'];w10([P_[R()*8|0],P_[R()*8|0],'fus','gra'],s[0],s[1],10,'w6')}};
 if(L10.st===0){wave(26);const aa=L10.aa.filter(a=>a.alive).length;if(!L10.towOK){if(near10(ZONE10.tower.x,ZONE10.tower.z,5)&&clear10(ZONE10.tower.x,ZONE10.tower.z,14)){L10.towT+=dt;$('pr').textContent='Tomando la torre de control… '+bar10(L10.towT/5);if(L10.towT>=5){L10.towOK=true;feed('★ Torre de control tomada');say('Wolff: «Torre nuestra. Las válvulas de seguridad, cerradas.»',3)}}}
  const parts=[];if(L10.pump.alive)parts.push('bombas');if(!L10.towOK)parts.push('torre de control');if(aa)parts.push('antiaéreos ('+aa+')');const tg=L10.pump.alive?L10.pump:!L10.towOK?ZONE10.tower:L10.aa.find(a=>a.alive);obj9('VI · Destruye/toma: '+parts.join(', '),tg?tg.x:undefined,tg?tg.z:0);
  if(!parts.length){L10.st=1;L10.cp=[X,-540];say('Reuss: «¡Cargas en los tres depósitos principales! ¡Rápido!»',3)}}
 else if(L10.st===1){wave(22);const d=L10.dep.find(q=>!q.charged);if(d)obj9('VI · Coloca cargas en los depósitos principales ('+L10.dep.filter(q=>q.charged).length+'/3)',d.x,d.z+d.r+1.2);else{L10.st=2;L10.sapT=0;L10.sapOK=false;const sp=GAR.filter(s=>s.alive&&s.role==='sap');if(sp.length<2)gar10([[X-12,-506,Math.PI,0,'sap'],[X-8,-506,Math.PI,0,'sap']]);posts10(line10(-522,X-30,X+20,10,Math.PI,true));for(const s of GAR)if(s.alive&&s.role==='sap'){s.post={x:ZONE10.det.x+(R()-.5)*3,z:ZONE10.det.z+1.5,f:Math.PI,c:true,fb:null,occ:s};s.st='move'}say('Zapadores: «¡Cableando el detonador! ¡Necesitamos cuarenta segundos!»',3.5)}}
 else if(L10.st===2){wave(9);const sp=GAR.filter(s=>s.alive&&s.role==='sap'&&Math.hypot(s.g.position.x-ZONE10.det.x,s.g.position.z-ZONE10.det.z)<5);L10.sapOK=sp.length>0;if(sp.length)L10.sapT+=dt;
  obj9(L10.sapOK?'VI · Defiende a los zapadores mientras arman el detonador '+bar10(L10.sapT/40):'VI · ¡Los zapadores no llegan! Arma tú el detonador (E)',ZONE10.det.x,ZONE10.det.z);if(L10.sapT>=40){L10.st=3;cineBoss10()}}
 else if(L10.st===3){wave(30);const b=L10.boss;obj9('VI · Derrota al Guardián de la Refinería'+(b?' · '+Math.round(b.hp/b.max*100)+'%':''),b?b.g.position.x:X,b?b.g.position.z:-628);if(!b||enemies.indexOf(b)<0){L10.st=4;L10.boss=null;$('bb').style.display='none';say('Reuss: «¡El Guardián ha caído! ¡Wolff, al detonador!»',3)}}
 else if(L10.st===4)obj9('VI · Acciona el detonador (E)',ZONE10.det.x,ZONE10.det.z)}
/* EXTRACCIÓN — huida al muelle bajo persecución */
function enter10_7(){const X=X10;L10.ph=7;L10.st=0;L10.t=0;L10.cp=[X,-516];L10.wt=3;posts10(line10(-596,X+104,X+118,10,0,false));L10.boat=mkBoat10(true);L10.boat.position.set(X+150,0,-640);L10.boat.rotation.y=-.6;say('Reuss: «¡Todos al muelle! ¡La lancha ya viene!»',3)}
function upd10_7(dt){const X=X10;L10.t+=dt;const b=L10.boat;if(b){b.position.x+=(X+124-b.position.x)*Math.min(1,dt*.3);b.position.z+=(-604-b.position.z)*Math.min(1,dt*.3);b.rotation.y+=(0-b.rotation.y)*Math.min(1,dt*.3)}
 L10.wt-=dt;if(L10.wt<=0&&enemies.length<12){L10.wt=8;const s=R()<.5?[X-60,-560]:[X+30,-645];w10(['fus','gorlock','genglock','acech','orco'].slice(0,3+(R()*2|0)),s[0],s[1],10,'w7')}
 obj9('EXTRACCIÓN · Corre al muelle del puerto industrial',ZONE10.ext.x,ZONE10.ext.z);if(near10(ZONE10.ext.x,ZONE10.ext.z,6)&&L10.t>4)cineExtract10()}
/* =====================================================================
   CINEMÁTICAS (todas saltables: botón, Enter o Espacio)
   ===================================================================== */
function cineIntro10(){const X=X10;const rb=mkBoat10(false);rb.position.set(X-30,0,90);L10.rb=rb;const crew=[];for(let i=0;i<2;i++){const s=mkEis({mask:true});s.position.set((i-.5)*.7,.6,-.8+i*1.4);s.userData.b.position.y=.5;rb.add(s);crew.push(s)}
 L9.tick=dt=>{rb.position.z=Math.max(46,rb.position.z-dt*5.5);rb.rotation.z=Math.sin(time*1.4)*.05};
 cine9([{d:4,a:[X-60,18,120],b:[X-40,10,95],la:[X,2,0],txt:'1922. Costa de Alejandría. Noche sin luna.'},
  {d:3.6,a:[X-36,2.2,104],b:[X-34,2,82],la:()=>[rb.position.x,1,rb.position.z-6],txt:'Una barca de remos de la Marca de Eisenmark se desliza entre las olas.'},
  {d:3.6,a:()=>[rb.position.x+2.5,1.6,rb.position.z+2],la:()=>[rb.position.x,1.3,rb.position.z-12],txt:'Gefreiter Kasimir Wolff, Sturmtruppe. Misión: abrir la playa al desembarco… sin que suene una sola alarma.'},
  {d:3,a:[X-24,3,40],b:[X-28,2.4,34],la:[X-45,2,5],txt:'Sabotea la radio, silencia los nidos y enciende la bengala desde el faro.'}],
  ()=>{rb.position.z=46;for(const s of crew)rb.remove(s);P.g.position.set(X-30,0,40);yaw=0;pitch=.12;enter10_1()},[{t:0,fn:()=>{}}])}
function cineLanding10(){const X=X10;const B=[mkBoat10(true),mkBoat10(true),mkBoat10(true)];B.forEach((b,i)=>{b.position.set(X-40+i*36,0,150+i*6);for(let k=0;k<(i===1?2:6);k++){const s=mkEis({mask:R()<.5});s.position.set((k%2-.5)*1.4,1.4,-3+(k>>1)*2);s.userData.b.position.y=.55;b.add(s)}});BOATS10.push(...B);
 const tk=spawnTK('sup',X-4,150,'Kettenhund');tk.hold=true;L10.tkB=B[1];
 L9.tick=dt=>{B.forEach((b,i)=>{b.position.z=Math.max(50,b.position.z-dt*(12-i));b.rotation.z=Math.sin(time*1.3+i)*.04});if(tk.alive){tk.g.position.set(B[1].position.x,1.4,B[1].position.z+1)}if(R()<dt*2)burst(X+58,14+R()*3,-14,0x40ff60,3,.3,2)};
 sky9('alba');L10.sky='alba';
 const fin=()=>{B.forEach((b,i)=>{b.position.z=50;b.children.slice().forEach(c=>{if(c.userData&&c.userData.l1)b.remove(c)})});tk.g.position.set(X,0,44);tk.ob.x=X;tk.ob.z=44;tk.hold=false;tk.path=[[X,30],[X,-16]];tk.pi=0;
  const roles=['smg','smg','smg','shot','shot','sap','sap','shield','shield','rifle','mg','smg'];gar10(roles.map((r,i)=>[X-40+(i%3)*36+(R()-.5)*3,45-(i/3|0)*.8,Math.PI,0,r]));
  allies.forEach((a,i)=>{if(a.name){a.g.visible=true;a.g.position.set(X-6+i*2.4,0,44);a.down=0;a.g.rotation.x=0}});if(officer){officer.g.visible=true;officer.g.position.set(X-2,0,43);officer.down=0;officer.dec=0}if(MED){MED.g.visible=true;MED.g.position.set(X+4,0,44);MED.down=0}enter10_2()};
 cine9([{d:3.6,a:[X+62,16,-8],b:[X+58,15,-4],la:[X+58,18,-14],lb:[X+20,8,60],txt:'¡Bengala verde sobre el faro! La flota de Eisenmark recibe la señal.'},
  {d:4.2,a:[X-14,3,92],b:[X-8,2.6,70],la:()=>[B[1].position.x,1,B[1].position.z-20],txt:'«¡Rampas abajo! ¡Por la Marca de Hierro!»'},
  {d:3.6,a:[X+14,2.2,38],b:[X+8,2,32],la:()=>[B[1].position.x,1.4,B[1].position.z],txt:'Tanqueta de apoyo «Kettenhund» en la arena. Hauptmann Reuss toma el mando de la vanguardia.'}],fin,[{t:11.3,fn:()=>{},must:false}])}
function cineBreach10(){const X=X10;const tk=TK10.find(t=>t.name==='Kettenhund');const tp=()=>tk?tk.g.position:new T.Vector3(X,0,-86);
 L9.tick=dt=>{garUpd(dt);if(tk&&tk.alive)tankTurret(tk.g,X,-98,dt,2)};posts10(line10(-108,X-40,X+40,12,Math.PI,false));
 const fire=()=>{if(!GATE10.bar.alive)return;if(tk&&tk.alive){const u=tk.g.userData;u.muz.getWorldPosition(_tv);u.rec=1;burst(_tv.x,_tv.y,_tv.z,0xffcc66,10,.25,8);smoke(_tv.x,_tv.y,_tv.z,3,2,0x8a8a8a,.7,.5);npcShot('big',_tv.x,_tv.z)}gateDmg(GATE10.bar,99999,'¡Barricada abierta! ¡Adelante, Eisenmark!');for(const e of enemies)if(Math.hypot(e.g.position.x-X,e.g.position.z+98)<7)hurt(e,200,'m')};
 cine9([{d:3.4,a:[X+16,3,-80],b:[X+12,2.6,-86],la:[X,1.4,-98],txt:'El último nido calla. Reuss: «¡Kettenhund, abre esa barricada!»'},
  {d:2.6,a:()=>[tp().x-4,2,tp().z+5],la:[X,1.4,-98],txt:'La tanqueta avanza disparando…'},
  {d:4,a:[X-34,7,-78],b:[X-24,9,-70],la:[X,1,-104],txt:'…y la infantería de Eisenmark salta de las trincheras.'}],
  ()=>{fire();L10.wt=10;L10.cp=[X,-90];if(tk){tk.path=[[X,-104],[X,-116]];tk.pi=0}},[{t:4.2,fn:fire,must:true}])}
function cineArmor10(){const X=X10;const z1=spawnTK('rec',X-4,-56,'Zorn'),z2=spawnTK('rec',X+4,-64,'Späher');z1.path=[[X,-100],[X+10,-150],[X+30,-188]];z2.path=[[X,-100],[X+5,-170],[X+18,-222]];const kh=TK10.find(t=>t.name==='Kettenhund');if(kh&&kh.alive){kh.path=[[X,-112],[X-20,-140],[X-42,-162]];kh.pi=0}
 const g1=spawnDraco('pesado','a',X-10,-70,'Goliat'),g2=spawnDraco('transporte','a',X+10,-76,'Lastträger');for(const d of[g1,g2])d.anchor=()=>L10.front||{x:X,z:-130};L10.front={x:X,z:-126};
 cine9([{d:4,a:[X+8,2,-110],b:[X+6,2.4,-104],la:[X,2,-70],lb:[X,1.5,-90],txt:'Desde la playa llegan los refuerzos mecanizados: las tanquetas «Zorn» y «Späher».'},
  {d:4,a:[X-16,4,-96],b:[X-12,5,-106],la:()=>[g1.g.position.x,2.5,g1.g.position.z],txt:'Y los dracos de guerra de la Marca: el pesado «Goliat» y el transporte «Lastträger».'},
  {d:3.4,a:[X,3,-118],b:[X,4,-126],la:[X,1,-190],txt:'Reuss: «¡Al desierto! Batería, vía férrea y convoy. Después, abrid el complejo.»'}],()=>enter10_3())}
function cineFlank10(){const X=X10;const t=spawnET(X+150,-150);
 cine9([{d:3.6,a:[X+122,4,-138],b:[X+112,3.6,-146],la:()=>[t.g.position.x,1.5,t.g.position.z],txt:'¡Un carro de combate enemigo por el flanco este!'},
  {d:3.4,a:[X+20,3,-170],b:[X+26,3,-176],la:()=>[t.g.position.x,1.5,t.g.position.z],txt:'Va a por las tanquetas. Puntos débiles: retaguardia y torreta… o que Goliat lo embista.'}],()=>{feed('Panzerfaust en la caja junto a la tercera línea');say('Reuss: «¡Panzerfaust! ¡Por detrás, Wolff!»',3)})}
function cineMine10(){const X=X10;L10.front={x:X,z:-252};
 cine9([{d:3.6,a:[X,4,-276],b:[X,3,-290],la:[X,2,-330],txt:'Las minas de Khazrul: columnas talladas por manos que no eran humanas.'},
  {d:3.4,a:[X-58,3,-300],b:[X-54,2.5,-306],la:[MX0+2,1.5,-305],txt:'De las galerías sale un chirrido… trasgos, genglocks y algo mucho más grande.'},
  {d:3,a:[X+10,2,-284],b:[X+6,2,-290],la:[X+50,1.5,-302],txt:'Reuss: «Wolff, los tres mecanismos de la compuerta. Nosotros te cubrimos.»'}],()=>enter10_4(),
  [{t:2,fn:()=>{w10(['trasgo','trasgo','genglock','acech'],VENT10[0][0],VENT10[0][1],4,'w4');w10(['gorlock','trasgo','orco'],VENT10[2][0],VENT10[2][1],4,'w4')},must:true}])}
function cineCharge10(){const X=X10;CAVS.go=1;L9.tick=dt=>{cavUpd(dt);catAnim()};const v=()=>{const c=CAV.find(q=>q.alive);return c?c.g.position:new T.Vector3(X-96,0,-414)};
 cine9([{d:3.4,a:()=>[v().x+8,3,v().z+6],la:()=>[v().x,2,v().z],txt:'Rittmeister Varga alza la lanza. Los catafractos de Eisenmark cierran filas.'},
  {d:2.8,a:[X-4,2.4,-436],b:[X-2,2.6,-440],la:[X,1.8,-480],txt:'Reuss: «¡Catafractos… A LA CARGA!»'},
  {d:3.6,a:()=>[v().x-10,2,v().z+10],la:()=>[v().x+6,1.4,v().z-14],txt:'Las lanzas de descarga chisporrotean. El suelo tiembla.'}],()=>{say('¡Sigue luchando! Los catafractos rompen el flanco.',2.5)})}
function cineBoss10(){const X=X10;const b=spawnBoss10();
 cine9([{d:3.4,a:[X+20,9,-606],b:[X+15,9.5,-612],la:[X,8,-628],txt:'Sobre la plataforma de carga se alza el Guardián de la Refinería.'},
  {d:3,a:[X+8,7,-618],b:[X+6,7.6,-620],la:()=>[b.g.position.x,b.g.position.y+3,b.g.position.z],txt:'Un minotauro acorazado con un cañón pesado en el brazo.'},
  {d:2.6,a:[X-6,2,-560],b:[X-4,2,-566],la:[X,6,-628],txt:'Reuss: «¡A cubierto! ¡Wolff, derríbalo!»'}],()=>{})}
function cineBlast10(){const X=X10;if(L10.blast)return;L10.blast=1;const ex=i=>()=>{const d=L10.dep[i];if(d&&d.alive){ftExplode(d,true);for(const e of[...enemies])if(Math.hypot(e.g.position.x-d.x,e.g.position.z-d.z)<30)hurt(e,999,'m')}};
 const rest=()=>{for(const t of TANK10)if(t.alive&&!t.main)setTimeout(()=>{if(t.alive)ftExplode(t,true)},R()*1800)};
 cine9([{d:2.4,a:[X-12,2.6,-510],b:[X-12,2.8,-512],la:[X-10,1,-516.5],txt:'Wolff acciona el detonador…'},
  {d:5.4,a:[X-60,30,-500],b:[X+40,34,-505],la:[X,6,-585],txt:'¡La refinería de Alejandría estalla en cadena!'},
  {d:3,a:[X+20,4,-520],b:[X+30,4,-525],la:[X+90,2,-595],txt:'Reuss: «¡Al muelle! ¡La lancha no esperará!»'}],()=>enter10_7(),
  [{t:2.6,fn:ex(0),must:true},{t:3.6,fn:ex(2),must:true},{t:4.6,fn:ex(1),must:true},{t:5.4,fn:rest,must:true},{t:4.6,fn:()=>{if(L10.pump)L10.pump.alive=false;shake=2.2},must:false}])}
function cineExtract10(){const X=X10;if(L10.ext)return;L10.ext=1;const b=L10.boat;
 cine9([{d:3.6,a:[X+100,5,-588],b:[X+96,6,-578],la:[X+118,1,-604],txt:'Una lancha de la Marina de Eisenmark atraca en el muelle. Todos a bordo.'},
  {d:4.6,a:[X+150,12,-560],b:[X+160,18,-530],la:[X,8,-590],txt:'Alejandría arde a sus espaldas. La Operación Tridente de Acero ha cumplido.'}],()=>{L10.won=1;end(true)},
  [{t:0,fn:()=>{L9.tick=dt=>{if(b){b.position.x+=dt*4;b.rotation.y=.2}}}}])}
/* =====================================================================
   ACTUALIZACIÓN, INICIO E INTEGRACIÓN
   ===================================================================== */
function fx10(dt,cine){skyMesh.position.copy(cam.position);if(cine){updParts(dt);updRag(dt)}smokeUpd(dt);tracerUpd(dt);fireUpd(dt);lightsUpd(dt);chUpd(dt);shellUpd(dt);if(L9.tick)L9.tick(dt);cull10();
 if(L10.sea)L10.sea.material.map.offset.x+=dt*.02;tkUpd(dt);drUpd(dt);etUpd(dt);ftUpd(dt);if(CAV.length&&!cine)catAnim();
 if(L10.under!==L10.uw){L10.uw=L10.under;sky9(L10.under?'ruinas':L10.sky==='noche10'?'alba':L10.sky);if(!L10.under&&L10.sky==='noche10')sky10('noche10')}
 const F=L9.fog;if(F){const k=Math.min(1,dt*2);scene.fog.color.lerp(F.c,k);scene.fog.near+=(F.n-scene.fog.near)*k;scene.fog.far+=(F.f-scene.fog.far)*k}}
const _o10=obj9;obj9=function(t,x,z){if(level===10)L10.ot=t;return _o10(t,x,z)};
function upd10(dt){fx10(dt,false);garUpd(dt);pinUpd10();en10Upd(dt);sapUpd10(dt);workUpd10(dt);const ph=L10.ph;
 if(ph===1)upd10_1(dt);else if(ph===2)upd10_2(dt);else if(ph===3)upd10_3(dt);else if(ph===4)upd10_4(dt);else if(ph===5)upd10_5(dt);else if(ph===6)upd10_6(dt);else if(ph===7)upd10_7(dt);
 if(ph>=3)trkUpd10(0);
 if(L10.ot&&!L9.cine)$('obj').textContent=L10.ot;const ar=$('arrow');if(L9.obj){const pp=P.g.position,ddx=L9.obj[0]-pp.x,ddz=L9.obj[1]-pp.z,fx=-Math.sin(yaw),fz=-Math.cos(yaw),rx=Math.cos(yaw),rz=-Math.sin(yaw);ar.style.display='block';ar.style.transform='rotate('+(Math.atan2(ddx*rx+ddz*rz,ddx*fx+ddz*fz)*57.3)+'deg)'}else ar.style.display='none';
 if(L9.cine)return;const el=$('gar');const a=GAR.filter(s=>s.alive&&s.g.visible).length,tk=TK10.filter(t=>t.alive).length,dr=DR10.filter(d=>d.alive&&d.side==='a').length,c=CAV.filter(q=>q.alive).length;
 if(ph>1){el.style.display='block';el.innerHTML='VANGUARDIA <b>'+a+'</b>'+(tk?' · TANQUETAS <b>'+tk+'</b>':'')+(dr?' · DRACOS <b>'+dr+'</b>':'')+(c?' · CATAFRACTOS <b>'+c+'</b>':'')+' · ✚ '+(MED&&!(MED.down>0)?'sanitario activo':'sanitario herido')}else el.style.display='none';
 ambUpd(dt,ph===1?.5:ph===4?.4:.85);if(L10.ot)$('obj').textContent=L10.ot}
$('hud').insertAdjacentHTML('beforeend','<div id="det10" style="display:none;position:absolute;top:92px;left:50%;transform:translateX(-50%);font:600 12px Georgia,serif;color:#e8dcc0;background:rgba(0,0,0,.45);padding:4px 10px;border-radius:4px;letter-spacing:1px;pointer-events:none"></div>');
function startLevel10(){const X=X10;level=10;build10();clearStage();WC.x=X;WC.z=-290;WC.r=520;mobs.forEach(m=>scene.remove(m.g));mobs=[];convoy.forEach(v=>scene.remove(v.g));convoy=[];npcs.forEach(n=>scene.remove(n.g));npcs=[];lightsInit();for(const p of LT.pts)p.on=false;searchSet(false);
 for(const s of GAR)scene.remove(s.g);GAR.length=0;for(const c of CAV)if(c.g)scene.remove(c.g);CAV.length=0;CAVS.st='off';L9.tgts=[];L9.def=false;L9.obj=null;L9.cine=0;L10.ph=0;L10.st=0;L10.work=null;L10.sj=null;L10.uw=undefined;
 eisOn();if(officer){officer.g.visible=false;officer.g.position.set(X-30,0,70)}allies.forEach(a=>{if(a.name){a.g.visible=false;a.g.position.set(X-30,0,70)}});if(MED){MED.g.visible=false}
 mkCrate18(X-4,-16,10);mkCrate18(X+8,-114,10);mkCrate18(X-8,-408,10);
 refill(6);P.grenades=Math.max(P.grenades,3);P.g.visible=true;P.g.position.set(X-30,0,40);yaw=0;pitch=.12;$('tc').style.display='block';playing=true;ambStart();sky10('noche10');L10.sky='noche10';L10.solo=true;
 story('CAPÍTULO X — CRÓNICAS DE HIERRO: OPERACIÓN TRIDENTE DE ACERO');setTimeout(()=>story(''),2600);cineIntro10()}
/* la escuadra espera en la flota durante la infiltración */
const _au10=allyUpdate;allyUpdate=function(dt){if(level===10&&L10.solo){for(const a of allies)if(a.name)a.g.visible=false;if(officer)officer.g.visible=false;return}return _au10(dt)};
const _mu10=medUpd;medUpd=function(dt){if(level===10&&L10.solo){if(MED)MED.g.visible=false;return}return _mu10(dt)};
const _op10=objPoint;objPoint=function(){if((level===10||level===9)&&L9.obj&&!L9.cine)return{x:L9.obj[0],z:L9.obj[1]};return _op10()};
const _up19=update;update=function(dt){if(level===10&&L9.cine&&playing){V16.dt=dt;time+=dt;cine9Upd(dt);fx10(dt,true);return}_up19(dt);if(!playing)return;if(level===10)upd10(dt)};
const _in19=interact;interact=function(){if(level===10&&playing&&!L9.cine){if(crateNear())return _in19();if(L10.work){L10.work=null;return}const pp=P.g.position;for(const c of works10())if(Math.hypot(pp.x-c.x,pp.z-c.z)<c.r){L10.work=Object.assign({},c,{t:0});return}}return _in19()};
const _rp19=respawnP;respawnP=function(){_rp19();if(level===10){P.g.position.set(L10.cp[0],0,L10.cp[1]);P.g.position.y=0;P.mg=false;P.gun9=false;L10.work=null}};
const _end19=end;end=function(w){_end19(w);if(level===10){$('det10').style.display='none';if(w){$('menu').querySelector('h1').textContent='EL INCENDIO DE ALEJANDRÍA';$('tx').innerHTML='La costa cayó en silencio, las tres líneas de hierro se rompieron, el desierto ardió bajo las tanquetas y los dracos, las minas de Khazrul se abrieron, los catafractos barrieron la explanada… y la refinería de Alejandría se consumió en una cadena de fuego. El Guardián yace bajo los escombros.<br><br><b style="font-size:20px;color:#e0b050">PUNTUACIÓN: '+score+'</b><br>☠ Muertes: '+(typeof deathsN!=='undefined'?deathsN:0)+'<br><i>Fin de la Operación Tridente de Acero — Crónicas de Hierro.</i>'}}};
$('lvsel').insertAdjacentHTML('beforeend','<option value="10">X · CRÓNICAS DE HIERRO — El incendio de Alejandría (nuevo)</option>');document.querySelector('#menu p b').textContent='1909 / 1922 — Capítulos I–X · v19 CRÓNICAS DE HIERRO';
$('hs').insertAdjacentHTML('beforebegin','<p class="c" style="color:#ffc890">NUEVO v19 · Cap. X «Operación Tridente de Acero»: eres el Gefreiter Wolff de Eisenmark · infiltración con sigilo · trincheras de tres líneas · tanquetas y dracos de guerra · minas de Khazrul · carga de catafractos con lanzas eléctricas · refinería y el Guardián</p>');
try{if(sessionStorage.getItem('sel10')){sessionStorage.removeItem('sel10');$('lvsel').value='10'}}catch(e){}
const _g19=$('go').onclick;$('go').onclick=function(){if($('lvsel').value!=='10'){if(L10.eis)eisOff();return _g19()}if(L10.built){try{sessionStorage.setItem('sel10','1')}catch(e){}location.reload();return}try{ac=new(window.AudioContext||window.webkitAudioContext)();if(ac.state==='suspended')ac.resume();startMusic()}catch(e){}assignBots();$('menu').style.display='none';P.g.visible=true;cam.fov=65;cam.updateProjectionMatrix();startLevel10();try{rend.domElement.requestPointerLock()}catch(e){}};
/* reiniciar un nivel reutiliza el mismo AudioContext (evita nodos de contextos distintos al volver al menú) */
(function(){const A=window.AudioContext||window.webkitAudioContext;if(!A)return;const W=function(){try{if(typeof ac!=='undefined'&&ac&&ac.state!=='closed')return ac}catch(e){}return new A()};W.prototype=A.prototype;window.AudioContext=W;if(window.webkitAudioContext)window.webkitAudioContext=W})();
