/* =====================================================================
   v29 · Ampliación de Kaltfjord y del frente blindado
   A1 Entorno: techos corregidos (en los módulos de origen), utilería instanciada,
      fiordo ×1,2 y acorazado ×1,2 (en v28 con W28/IW28/SC28)
   A2 Personajes: marinero, infantería de marina (casco tipo SSh-36), enfermeras,
      médico y sanitarios; poses de rescate y camilla
   A3 IA: defensores (reposo→alerta→arsenal→cobertura→combate→herido),
      nidos de MG-15 (tirador+cargador), equipo médico, perro, tripulación
      automática del Wolfszahn y retirada del acorazado a mar abierto
   A4 Cámara en tercera persona del tanque (nivel 14) con colisión y retícula
   ===================================================================== */
const L29={on:false,def:[],mg:[],team:null,downed:[],dog:null,nurses:[],props:false,G:{}};
const MC29={};const mat29=c=>MC29[c]||(MC29[c]=new T.MeshLambertMaterial({color:c}));
const UNI29={white:0xe6e4dc,navy:0x1c2840,petrol:0x1f4a52,black:0x161618,garnet:0x7a1a2a,green:0x2a5a34,brass:0xc8a040,steel:0x4e5648,field:0x56604c,nurse:0x5a6a82,red:0xb01e1e};
/* ---------- base de personaje: igual que npc11 pero con pantalón y accesorios propios ---------- */
function npc29(x,z,o){o=o||{};const g=mkSoldier({coat:o.coat,pants:o.pants,hat:o.hat||'cap',hatC:o.hatC||UNI29.black,tab:o.tab||GARNET,rank:o.rank||0,pack:false,officer:!!o.officer,puttee:o.puttee||0x2a2a2a,face:o.face});
 gear20(g,{web:!!o.web,boots:true,armband:o.armband,medbag:o.medbag});g.position.set(X15+x,0,z);g.rotation.y=o.f||0;scene.add(g);
 const n={g,u:g.userData,act:o.act||'idle',t:R()*9,f:o.f||0,name:o.name||'Marinero',path:null,pi:0,sp:o.sp||1.6,vx:0,vz:0,tgt:null,lv:15,hp:100};NPC11.push(n);return n}
const kit29=(n,par,fn)=>{const q=PB();fn(q);pbMesh(q,par,VCM)};
function cross29(q,x,y,z,s,ry){pBox(q,.13*s,.13*s,.01,0xf4f4f0,x,y,z,0,ry||0,0);pBox(q,.09*s,.025*s,.012,UNI29.red,x,y,z+(ry?0:.002),0,ry||0,0);pBox(q,.025*s,.09*s,.012,UNI29.red,x,y,z+(ry?0:.002),0,ry||0,0)}
/* gorra de campo negra con distintivo verde y granate */
function capBadge29(n){kit29(n,n.u.hd,q=>{pBox(q,.07,.06,.02,UNI29.green,0,.43,.21);pBox(q,.045,.04,.024,UNI29.garnet,0,.43,.213)})}
/* charreteras M40 azul petróleo, botones de latón, cuello azul marino */
function sailorKit29(n){const u=n.u;for(const a of[u.aR,u.aL])kit29(n,a,q=>{pBox(q,.2,.045,.26,UNI29.petrol,0,.04,0);pBox(q,.21,.015,.27,UNI29.brass,0,.068,0)});
 kit29(n,u.ch,q=>{pBox(q,.46,.14,.06,UNI29.navy,0,.66,-.2);pBox(q,.34,.08,.02,UNI29.navy,0,.62,.205);for(let i=0;i<4;i++)pBox(q,.035,.035,.02,UNI29.brass,0,.5-i*.13,.212)})}
/* casco de acero de ala ensanchada tipo SSh-36 */
const SSH29={g:null};function ssh29(hd,col,crossOn){const c=col||UNI29.steel;const m=mat29(c);const d=new T.Mesh(new T.SphereGeometry(.25,12,8,0,6.283,0,1.5),m);d.scale.set(1,.86,1.1);d.position.y=.31;hd.add(d);
 const b=new T.Mesh(new T.CylinderGeometry(.262,.33,.075,16,1,true),new T.MeshLambertMaterial({color:shade(c,.85),side:T.DoubleSide}));b.position.set(0,.24,-.015);b.scale.z=1.12;b.rotation.x=-.08;hd.add(b);
 const cr=new T.Mesh(gBox(.03,.035,.4),m);cr.position.y=.535;hd.add(cr);if(crossOn){const q=PB();cross29(q,0,.36,.27,1.15);for(const s of[-1,1])cross29(q,s*.26,.33,0,1.1,s*1.5708);pbMesh(q,hd,VCM)}}
/* cartucheras y correaje de la infantería de marina */
function pouch29(n){kit29(n,n.u.ch,q=>{pBox(q,.66,.07,.44,0x2a1e14,0,.06,0);for(const x of[-.2,-.07,.07,.2])pBox(q,.11,.1,.07,0x3a2c1c,x,.11,.24);for(const s of[-1,1])pBox(q,.05,.62,.02,0x2a1e14,s*.12,.38,.22,0,0,s*.25)})}
/* ---------- fábricas de la facción Eisenmark ---------- */
function marinero29(x,z,o){o=o||{};const n=npc29(x,z,Object.assign({coat:o.officer?UNI29.navy:UNI29.white,pants:UNI29.navy,hat:'cap',hatC:UNI29.black},o));sailorKit29(n);capBadge29(n);if(o.vest)kit29(n,n.u.ch,q=>{pBox(q,.66,.42,.46,0xb8742a,0,.34,0);for(let i=0;i<3;i++)pBox(q,.68,.04,.47,0x5a3a1a,0,.18+i*.14,0)});return n}
function infante29(x,z,o){o=o||{};const n=npc29(x,z,Object.assign({coat:UNI29.white,pants:UNI29.navy,hat:'none'},o));sailorKit29(n);pouch29(n);ssh29(n.u.hd);if(o.w)arm13(n,o.w);return n}
function enfermera29(x,z,o){o=o||{};const n=npc29(x,z,Object.assign({coat:UNI29.nurse,pants:UNI29.nurse,hat:'none',name:'Enfermera'},o));const u=n.u;
 kit29(n,u.b,q=>{pBox(q,.56,.55,.4,UNI29.nurse,0,-.3,0);pBox(q,.4,.5,.02,0xf2f2ee,0,-.28,.205)});kit29(n,u.ch,q=>{pBox(q,.4,.45,.02,0xf2f2ee,0,.36,.212);cross29(q,0,.5,.224,1)});
 kit29(n,u.hd,q=>{pBox(q,.4,.16,.42,0xf2f2ee,0,.38,-.03);pBox(q,.36,.3,.08,0xf2f2ee,0,.2,-.22);cross29(q,0,.4,.19,.9);pBox(q,.36,.08,.06,0x4a3020,0,.33,.18)});kit29(n,u.aL,q=>{pBox(q,.13,.1,.13,0xf2f2ee,0,-.1,0);pBox(q,.135,.03,.135,UNI29.red,0,-.1,0)});return n}
function medico29(x,z,o){o=o||{};const n=npc29(x,z,Object.assign({coat:0xeceae4,pants:0x2a2a30,hat:'cap',hatC:0x3a3e44,officer:true,medbag:true,name:'Médico'},o));const u=n.u;
 kit29(n,u.b,q=>{pBox(q,.6,.6,.42,0xeceae4,0,-.3,0)});kit29(n,u.ch,q=>{pa(q,new T.TorusGeometry(.12,.012,4,10),0x1a1a1a,0,.62,.17,1.2,0,0);pBox(q,.04,.04,.03,0xb0b0b0,0,.5,.22);cross29(q,-.16,.5,.213,.7)});
 kit29(n,u.hd,q=>{for(const s of[-1,1])pCyl(q,.04,.04,.012,0x1a1a1a,s*.07,.07,.215,1.5708,0,0,8);pBox(q,.06,.01,.01,0x1a1a1a,0,.07,.217)});kit29(n,u.aL,q=>{pBox(q,.13,.1,.13,0xf2f2ee,0,-.1,0);pBox(q,.135,.03,.135,UNI29.red,0,-.1,0)});return n}
function sanitario29(x,z,o){o=o||{};const n=npc29(x,z,Object.assign({coat:UNI29.field,pants:UNI29.navy,hat:'none',medbag:true,armband:true,name:'Sanitario'},o));ssh29(n.u.hd,UNI29.steel,true);
 kit29(n,n.u.aL,q=>{pBox(q,.14,.11,.14,0xf2f2ee,0,-.12,0);pBox(q,.145,.035,.145,UNI29.red,0,-.12,0);pBox(q,.035,.11,.145,UNI29.red,0,-.12,0)});kit29(n,n.u.ch,q=>cross29(q,0,.36,.212,1.3));return n}
/* los marineros de la misión naval usan los nuevos uniformes (el v28 llama a sailor28) */
sailor28=function(x,z,o){o=o||{};const n=o.w?infante29(x,z,o):marinero29(x,z,o);n.on=false;if(!o.w)n.wpn='r';return n};
/* ---------- poses nuevas (rescate, camilla, ametralladora) ---------- */
const KN29={L1:-1.45,L2:.12,K1:1.45,K2:1.7,BY:.5};
const ACT29={
 kneelwork:(t)=>Object.assign({},KN29,{AR:-1.25+Math.max(0,Math.sin(t*6))*.25,AL:-1.25+Math.max(0,Math.sin(t*6))*.25,ER:-.4,EL:-.4,BX:.4,HX:.45}),
 lift:(t,n)=>{const k=n.lk===undefined?0:n.lk;return{L1:-1.3*(1-k),L2:-.4*(1-k),K1:1.6*(1-k),K2:1.7*(1-k),BY:.45+.35*k,AR:-.55,AL:-.55,ER:-.3,EL:-.3,BX:.5*(1-k)+.08}},
 carry:(t,n)=>{const mv=Math.hypot(n.vx||0,n.vz||0)>.3,ph=t*8;return{L1:mv?Math.sin(ph)*.5:0,L2:mv?-Math.sin(ph)*.5:0,K1:mv?Math.max(0,Math.sin(ph+1.4))*.7:0,K2:mv?Math.max(0,Math.sin(ph+4.5))*.7:0,AR:-.38,AL:-.38,ER:-.25,EL:-.25,BX:.06}},
 lie:()=>({AR:.1,AL:.1,ER:-.3,EL:-.3,HX:-.1}),
 mgfire:(t)=>Object.assign({},KN29,{AR:-1.42+Math.sin(t*40)*.02,ER:-.1,AL:-1.3,ALY:-.4,EL:-.25,BX:.15}),
 mgload:(t)=>Object.assign({},KN29,{AR:-1.0+Math.sin(t*5)*.35,AL:-1.1-Math.sin(t*5)*.3,ER:-1.0,EL:-.9,BX:.25,HX:.25}),
 dogsit:()=>({})};
{const _na=npcAnim11;npcAnim11=function(n,dt){const f=ACT29[n.act];if(!f)return _na(n,dt);const u=n.u,t=(n.t+=dt),k=Math.min(1,dt*7),bl=(x,y)=>x+(y-x)*k,P_=Object.assign({},PD27,f(t,n));
 u.l1.rotation.x=bl(u.l1.rotation.x,P_.L1);u.l2.rotation.x=bl(u.l2.rotation.x,P_.L2);u.k1.rotation.x=bl(u.k1.rotation.x,P_.K1);u.k2.rotation.x=bl(u.k2.rotation.x,P_.K2);u.aR.rotation.x=bl(u.aR.rotation.x,P_.AR);u.aL.rotation.x=bl(u.aL.rotation.x,P_.AL);u.aR.rotation.y=bl(u.aR.rotation.y,P_.ARY);u.aL.rotation.y=bl(u.aL.rotation.y,P_.ALY);u.eR.rotation.x=bl(u.eR.rotation.x,P_.ER);u.eL.rotation.x=bl(u.eL.rotation.x,P_.EL);u.b.position.y=bl(u.b.position.y,P_.BY);u.b.rotation.x=bl(u.b.rotation.x,P_.BX);u.hd.rotation.x=bl(u.hd.rotation.x,P_.HX);u.hd.rotation.y=bl(u.hd.rotation.y,P_.HY)}}
/* =====================================================================
   A1 · UTILERÍA DE LA BASE (instanciada: un draw call por tipo)
   ===================================================================== */
const COVER29=[[-112,9],[-92,10],[-62,11],[-50,10],[-24,12],[16,12],[34,11],[50,13],[78,10],[104,9]];
const NEST29=[{x:-70,z:7},{x:90,z:7}];
function props29(){if(L29.props)return;L29.props=true;const X=X15,sand=[],crate=[],hog=[],M=new T.Matrix4(),Q=new T.Quaternion(),S=new T.Vector3(1,1,1),P_=new T.Vector3(),E_=new T.Euler();
 const bag=(x,z,a,y)=>{sand.push([x,y||.22,z,a])},wall=(x,z,len,a,rows)=>{const n=Math.round(len/.9);for(let r=0;r<(rows||2);r++)for(let i=0;i<n;i++){const t=(i-(n-1)/2)*.9+(r%2)*.45;bag(x+Math.cos(a)*t,z-Math.sin(a)*t,a+(R()-.5)*.15,.22+r*.38)}};
 for(const [x,z] of COVER29){wall(x,z-1.1,3.6,0,3);ob15(x,z-1.1,1.8,.4,.95)}
 for(const n of NEST29){for(let i=0;i<9;i++){const a=Math.PI+(i/8-.5)*2.6,r=2.3;for(let k=0;k<3;k++)bag(n.x+Math.sin(a)*r,n.z+Math.cos(a)*r*-1,a+1.5708,.22+k*.38)}ob15(n.x,n.z-2.2,2.2,.4,1.1)}
 for(const [x,z,n] of[[-20,40,6],[30,48,5],[64,30,8],[-46,58,4],[0,26,4]])for(let i=0;i<n;i++)crate.push([X+x+(i%3)*1.15,.4+((i/3)|0)*.8,z+(R()-.5)*.2,R()*.2]);
 for(const [x,z] of[[-108,-1],[-92,-1],[-48,-1],[-32,-1],[62,-1],[78,-1]])hog.push([X+x,.7,z,R()]);
 const inst=(geo,mat,L,fn)=>{const m=new T.InstancedMesh(geo,mat,L.length);L.forEach((v,i)=>{fn(v,i);m.setMatrixAt(i,M)});m.instanceMatrix.needsUpdate=true;scene.add(m);return m};
 inst(new T.BoxGeometry(.85,.36,.5),new T.MeshLambertMaterial({color:0xa8986e}),sand,v=>{P_.set(X+v[0],v[1],v[2]);Q.setFromEuler(E_.set(0,v[3],(R()-.5)*.06));S.set(1,1,1);M.compose(P_,Q,S)});
 inst(new T.BoxGeometry(1.1,.8,.8),new T.MeshLambertMaterial({color:0x5a5a36}),crate,v=>{P_.set(v[0],v[1],v[2]);Q.setFromEuler(E_.set(0,v[3],0));S.set(1,1,1);M.compose(P_,Q,S)});
 {const g=new T.BoxGeometry(.15,1.6,.15);inst(g,new T.MeshLambertMaterial({color:0x3a3a3a}),hog.flatMap(v=>[[...v,0],[...v,1],[...v,2]]),v=>{P_.set(v[0],v[1],v[2]);Q.setFromEuler(E_.set(v[4]===0?.8:v[4]===1?-.8:0,v[3],v[4]===2?.8:0));S.set(1,1,1);M.compose(P_,Q,S)})}
 /* sendas pisoteadas, huellas de vehículos y montículos de nieve */{const q=PB();for(const [x0,z0,x1,z1] of[[0,5,0,70],[0,40,60,36],[0,40,-60,60],[-60,30,-100,70],[10,72,10,40]]){const L=Math.hypot(x1-x0,z1-z0),a=Math.atan2(x1-x0,z1-z0);pBox(q,2.4,.02,L,0x8a8a84,X+(x0+x1)/2,.012,(z0+z1)/2,0,a,0);for(const s of[-.7,.7])pBox(q,.25,.025,L,0x6a6a66,X+(x0+x1)/2+Math.cos(a)*s,.02,(z0+z1)/2-Math.sin(a)*s,0,a,0)}pbMesh(q,scene,VCV)}
 /* faroles con halo (sin luces dinámicas extra) */{const hg=new T.SphereGeometry(.7,8,6),hm=new T.MeshBasicMaterial({color:0xffd890,transparent:true,opacity:.12,depthWrite:false,blending:T.AdditiveBlending});for(const [x,z] of[[-24,14],[16,14],[50,16],[-70,12],[90,12],[17,63],[60,28]]){const q=PB();pCyl(q,.07,.1,3.4,0x2a2a2a,X+x,1.7,z,0,0,0,6);pBox(q,.3,.3,.3,0x1a1a1a,X+x,3.5,z);pbMesh(q,scene,VCV);const l=new T.Mesh(gSph(.12,6,5),new T.MeshBasicMaterial({color:0xffe0a0}));l.position.set(X+x,3.4,z);scene.add(l);const h=new T.Mesh(hg,hm);h.position.copy(l.position);scene.add(h)}}}
/* =====================================================================
   A3 · NIDOS DE MG-15 (reutiliza el modelo de trípode del capítulo XI)
   ===================================================================== */
let MGP29=null;
function mgProto29(){if(MGP29)return MGP29;const g=new T.Group();{const q=PB();for(let i=0;i<3;i++){const a=i/3*6.283+.5;const lx=Math.sin(a)*.38,lz=Math.cos(a)*.38;pBox(q,.035,1.37,.035,0x2a2c2e,lx/2,.42,lz/2,-Math.asin(lz/1.37),0,Math.asin(lx/1.37));pBox(q,.08,.03,.08,0x1a1a1a,lx,-.24,lz)}pCyl(q,.07,.08,.28,0x2a2c2e,0,1.08,0,0,0,0,8);pBox(q,.18,.05,.12,0x2a2c2e,0,1.2,0);pbMesh(q,g,VCV)}
 const bar=new T.Group();bar.name='bar';bar.position.y=1.25;g.add(bar);{const q=PB();pBox(q,.11,.13,.5,0x3a3d40,0,0,.04);pCyl(q,.046,.046,.78,0x4b4f52,0,.01,.66,1.5708,0,0,10);for(let i=0;i<8;i++)pBox(q,.02,.03,.04,0x111111,(i%2?.047:-.047),.01,.35+i*.08);for(let i=0;i<4;i++)pCyl(q,.05,.05,.02,0x1a1a1a,0,.01,.33+i*.19,1.5708,0,0,10);pa(q,gCone(.035,.1,8),0x111111,0,.01,1.1,1.5708);for(const s of[-1,1])pCyl(q,.11,.11,.08,0x4a4a3a,s*.1,.04,.12,0,0,1.5708,12);pBox(q,.22,.04,.06,0x3a3a30,0,.12,.12);pBox(q,.16,.1,.04,0x2a2c2e,0,-.02,-.24);for(const s of[-1,1])pBox(q,.03,.1,.03,0x3a2a1c,s*.07,-.06,-.28);pbMesh(q,bar,VCV)}
 const mz=new T.Object3D();mz.position.set(0,.01,1.15);bar.add(mz);MGP29=g;return g}
function nest29(x,z,i){const g=mgProto29().clone();g.position.set(X15+x,-.2,z+.4);g.rotation.y=Math.PI;scene.add(g);const bar=g.getObjectByName('bar'),mz=bar.children.find(c=>!c.isMesh);
 const gun=infante29(x,z+1.5,{name:'Ametrallador '+['Wendt','Brauer'][i],act:'mgfire',f:Math.PI}),ld=infante29(x+.9,z+1.3,{name:'Cargador '+['Hock','Siebert'][i],act:'idle',f:Math.PI});for(const n of[gun,ld]){n.g.visible=true;n.hp=100;n.role29=n===gun?'tirador':'cargador'}
 const m={x,z,g,bar,mz,gun,ld,belt:60,st:'watch',t:0,cd:0,burst:0,i};L29.mg.push(m);return m}
function mgUpd29(m,dt){const D=dif28(),alive=n=>n&&!n.down29&&n.g.visible;let gn=alive(m.gun)?m.gun:alive(m.ld)?m.ld:null,ld=gn===m.gun&&alive(m.ld)?m.ld:null;if(!gn){return}
 if(gn===m.ld&&!m.swap){m.swap=1;talk([[m.ld.name,'¡Cayó el tirador! ¡Tomo la ametralladora!',2]]);m.ld.g.position.set(X15+m.x,0,m.z+1.5)}
 gn.act='mgfire';gn.f=Math.PI;if(ld)ld.act=m.st==='reload'?'mgload':'idle';
 const foes=alive28('land');let tg=null,bd=95;for(const e of foes){const dx=e.g.position.x-(X15+m.x),dz=e.g.position.z-m.z,d=Math.hypot(dx,dz);if(d>bd)continue;bd=d;tg=e}
 if(m.st==='reload'){m.t-=dt;if(ld)ld.act='mgload';else gn.act='mgload';if(m.t<=0){m.st='watch';m.belt=60;if(ld&&R()<.5)talk([[ld.name,'¡Cinta puesta!',1.2]])}return}
 if(!tg){m.bar.rotation.y*=.95;return}const a=Math.atan2(tg.g.position.x-(X15+m.x),tg.g.position.z-m.z)-Math.PI;m.bar.rotation.y=TT28(m.bar.rotation.y,AD28(0,a),dt*2.5);m.bar.rotation.x=-.03;
 m.cd-=dt;if(m.cd>0)return;const burstMax=ld?16:7;if(m.burst>=burstMax){m.burst=0;m.cd=ld?.5:1.6;return}m.cd=ld?.075:.1;m.burst++;m.belt--;
 const o=new T.Vector3();m.mz.getWorldPosition(o);fb12(o.x,o.y,o.z,.7,.06,0);if(m.belt%3===0){const t=tg.g.position.clone();t.y=1.1+(R()-.5)*.6;t.x+=(R()-.5)*1.6;t.z+=(R()-.5)*1.6;trc16(o.clone(),t,0xffe0a0)}if(m.belt%2===0)npcShot('mg',o.x,o.z);
 if(R()<.11*(ld?1:.8))hurt(tg,22,'b',{name:gn.name});if(m.belt<=0){m.st='reload';m.t=ld?2.4:5.5;if(ld)talk([[ld.name,'¡Recargando! ¡Cinta nueva!',1.4]])}}
/* =====================================================================
   A3 · DEFENSORES: reposo → alerta → arsenal → cobertura → combate → herido
   ===================================================================== */
function defInit29(){if(L29.def.length)return;const A=ENV15.anch;for(const n of L28.base||[]){n.fsm='idle';n.hp=100;L29.def.push(n)}
 for(let i=0;i<4;i++){const n=infante29(-100+i*8,64+(i%2)*3,{name:'Infante '+['Kraus','Albers','Dorn','Feld'][i],act:['smoke','idle','argue','smokesit'][i]});n.fsm='idle';n.hp=100;n.g.visible=true;L29.def.push(n)}}
function defUpd29(dt){const A=ENV15.anch,ph=L28.ph,D=dif28();
 L29.def.forEach((n,i)=>{if(!n.g.visible&&!n.down29)return;
  if(n.fsm==='idle'){if(ph===3){n.fsm='alert';n.t29=R()*.8;n.act='idle'}return}
  if(n.fsm==='alert'){n.t29-=dt;if(n.t29>0)return;if(!L29.ev_al){L29.ev_al=1;talk([[n.name,'¡Desembarco! ¡Todos al arsenal por fusiles!',2.2]])}n.fsm='toArs';n.tgt=[X15+A.torpLoad.x+(i%5-2)*1.4,A.torpLoad.z-1.5-(i/5|0)*1.6];n.sp=6.2;n.act='run';n.chk=0;n.ld=1e9;return}
  if(n.fsm==='toArs'||n.fsm==='toCov'){stuck29(n,dt);if(!n.tgt){if(n.fsm==='toArs'){n.fsm='arm';n.t29=1.1;n.act='tie';n.f=0}else{n.fsm='fight';n.act='crouchaim';n.f=Math.PI}}return}
  if(n.fsm==='arm'){n.t29-=dt;if(n.t29<=0){arm13(n,i%4===3?'lmg':'r');n.fsm='toCov';const c=COVER29[i%COVER29.length];n.cv=[X15+c[0]+(i>=COVER29.length?1.2:0),c[1]+.6];n.tgt=n.cv.slice();n.sp=5;n.act='run';n.ld=1e9}return}
  if(n.fsm==='fight'){if(!n.tgt&&n.cv&&Math.hypot(n.g.position.x-n.cv[0],n.g.position.z-n.cv[1])>3)n.tgt=n.cv.slice();const p=n.g.position;n.ft=(n.ft||0)-dt;if(n.ft<=0){n.ft=.4;let b=null,bd=75;for(const e of alive28('land')){const d=Math.hypot(e.g.position.x-p.x,e.g.position.z-p.z);if(d<bd&&losClear(p.x,1.3,p.z,e.g.position.x,1.3,e.g.position.z)){bd=d;b=e}}n.tg=b}
   const e=n.tg&&n.tg.hp>0?n.tg:null;n.act=e?'crouchaim':'crouch';if(e){n.f=Math.atan2(e.g.position.x-p.x,e.g.position.z-p.z);n.cd=(n.cd===undefined?R()*1.5:n.cd)-dt;if(n.cd<=0){const lmg=n.wpn==='lmg';n.cd=lmg?2:1.4+R();for(let j=0;j<(lmg?4:1);j++)later28(j*.12,()=>{if(!n.rif||n.down29||e.hp<=0)return;n.rif.updateMatrixWorld(true);const o=n.rif.localToWorld(new T.Vector3(0,-.5,0)),t=e.g.position.clone();t.y=1.2;t.x+=(R()-.5);t.z+=(R()-.5);trc16(o,t,0xffe0a0);npcShot(lmg?'mg':'rifle',p.x,p.z);if(R()<(lmg?.22:.32))hurt(e,lmg?20:38,'b',{name:n.name})})}}}});
 /* fuego enemigo contra los aliados: pueden caer heridos */for(const e of alive28('land')){if(e.unaware)continue;e.f29=(e.f29===undefined?1+R()*2:e.f29)-dt*D.rate;if(e.f29>0)continue;e.f29=1.8+R()*1.8;const p=e.g.position;let b=null,bd=55;for(const n of[...L29.def,...L29.mg.flatMap(m=>[m.gun,m.ld]),...(L28.def||[])]){if(!n||n.down29||!n.g.visible)continue;const d=Math.hypot(n.g.position.x-p.x,n.g.position.z-p.z);if(d<bd&&losClear(p.x,1.4,p.z,n.g.position.x,1.2,n.g.position.z)){bd=d;b=n}}
  if(b){const t=b.g.position.clone();t.y=1.1;trc16(new T.Vector3(p.x,1.5,p.z),t,0xffc070);if(R()<.15*D.acc){b.hp=(b.hp===undefined?100:b.hp)-34;if(b.hp<=0)down29(b)}}}}
function stuck29(n,dt){n.chk=(n.chk||0)-dt;if(n.chk>0||!n.tgt)return;n.chk=3;const d=Math.hypot(n.g.position.x-n.tgt[0],n.g.position.z-n.tgt[1]);if(n.ld-d<1){const k=Math.min(1,6/Math.max(d,.1));n.g.position.x+=(n.tgt[0]-n.g.position.x)*k;n.g.position.z+=(n.tgt[1]-n.g.position.z)*k}n.ld=d}
function down29(n){if(n.down29)return;n.down29=true;n.fsm='down';n.tgt=null;n.path=null;n.on=false;n.lock=true;n.act='lie';n.g.rotation.order='YXZ';n.g.rotation.x=-1.5708;n.g.position.y=.18;if(n.rif)n.rif.visible=false;feed('✚ '+n.name+' herido · ¡Sanitario!');if(!L29.dmsg||time-L29.dmsg>6){L29.dmsg=time;talk([[n.name,['¡Me dieron! ¡Sanitario!','¡Ah! ¡La pierna! ¡Sanitario!','¡Herido! ¡Herido aquí!'][R()*3|0],1.8]])}L29.downed.push(n);if(L13.sq&&L13.sq.includes(n))L13.sq=L13.sq.filter(q=>q!==n)}
/* =====================================================================
   A2/A3 · EQUIPO MÉDICO: médico, 2 sanitarios con camilla, 2 enfermeras y el perro
   ===================================================================== */
function mkStretcher29(){const g=new T.Group(),q=PB();for(const s of[-1,1])pCyl(q,.03,.03,2.5,0x6a5236,s*.29,0,0,1.5708,0,0,6);pBox(q,.56,.025,1.9,0x8a8460,0,.01,0);for(const z of[-.95,.95])pBox(q,.62,.03,.04,0x5a4a30,0,-.01,z);for(const s of[-1,1])for(const z of[-.7,.7])pBox(q,.03,.12,.03,0x3a3a3a,s*.27,-.07,z);pbMesh(q,g,VCV);scene.add(g);return g}
function medInit29(){if(L29.team)return;const H={x:10,z:69};const doc=medico29(H.x,H.z,{name:'Doctor Halden',f:Math.PI}),m1=sanitario29(H.x-3,H.z-.5,{name:'Sanitario Roth',f:Math.PI}),m2=sanitario29(H.x+3,H.z-.5,{name:'Sanitario Kessel',f:Math.PI});
 L29.nurses=[enfermera29(H.x-5,H.z+.6,{name:'Enfermera Lise',act:'idle',f:Math.PI}),enfermera29(H.x+5,H.z+.6,{name:'Enfermera Marthe',act:'idle',f:Math.PI})];for(const n of[doc,m1,m2,...L29.nurses])n.g.visible=true;
 const st=mkStretcher29();st.position.set(X15+H.x,.12,H.z-2);st.rotation.y=Math.PI*.5;L29.team={doc,m1,m2,st,H,st0:{x:X15+H.x,z:H.z-2},state:'home',pat:null,t:0};
 const d=mkDog13();d.position.set(X15+2,0,8);d.visible=true;scene.add(d);L29.dog={g:d,v:0,bark:5}}
function medUpd29(dt){const M=L29.team;if(!M)return;const {doc,m1,m2,st,H}=M,door=[X15+H.x,H.z-3.5];
 const lead=m1,rear=m2,syncRear=()=>{const a=lead.g.rotation.y,p=lead.g.position;rear.g.position.set(p.x-Math.sin(a)*2.3,0,p.z-Math.cos(a)*2.3);rear.g.rotation.y=a;rear.f=a;rear.vx=lead.vx;rear.vz=lead.vz;st.position.set(p.x-Math.sin(a)*1.15,M.sy||.85,p.z-Math.cos(a)*1.15);st.rotation.y=a};
 if(M.state==='home'){const n=L29.downed.find(q=>!q.res29);for(const q of[doc,m1,m2])if(!q.tgt)q.act='idle';if(n){n.res29=1;M.pat=n;M.state='go';M.t=0;talk([[doc.name,'¡Herido en el muelle! ¡Camilla, conmigo!',2]]);doc.tgt=[n.g.position.x+.8,n.g.position.z+.4];doc.sp=5.2;lead.tgt=[n.g.position.x+.3,n.g.position.z+2.2];lead.sp=4.2;lead.ld=1e9;M.sy=.85}return}
 const P_=M.pat;if(!P_){M.state='home';return}
 if(M.state==='go'){lead.act='carry';rear.act='carry';syncRear();stuck29(lead,dt);if(!doc.tgt){doc.act='kneelwork';doc.f=Math.atan2(P_.g.position.x-doc.g.position.x,P_.g.position.z-doc.g.position.z)}if(!lead.tgt){M.state='load';M.t=0;lead.lk=0;rear.lk=0}return}
 if(M.state==='load'){M.t+=dt;const k=CL28(M.t/1.2,0,1);lead.act=rear.act='lift';lead.lk=rear.lk=M.t<1.2?0:CL28((M.t-1.6)/.8,0,1);M.sy=.85-(1-Math.abs(1-M.t/1.2*1))*.0;if(M.t<1.2)M.sy=.85-.7*k;else if(M.t<1.6)M.sy=.15;else M.sy=.15+.7*CL28((M.t-1.6)/.8,0,1);syncRear();
  if(M.t>1.2){const a=st.rotation.y;P_.g.position.set(st.position.x,st.position.y+.12,st.position.z);P_.g.rotation.set(-1.5708,a+Math.PI,0);P_.act='lie'}if(M.t>=2.4){M.state='carry';lead.tgt=door.slice();lead.sp=2.6;lead.ld=1e9;doc.tgt=[door[0]+1.6,door[1]+.5];doc.sp=2.6;talk([[lead.name,'¡Arriba! ¡A la enfermería!',1.6]])}return}
 if(M.state==='carry'){lead.act=rear.act='carry';syncRear();stuck29(lead,dt);const a=st.rotation.y;P_.g.position.set(st.position.x,st.position.y+.12,st.position.z);P_.g.rotation.set(-1.5708,a+Math.PI,0);
  if(!lead.tgt){M.state='deliver';M.t=0;const nu=L29.nurses[(L29.nn=(L29.nn||0)+1)%2];nu.tgt=[door[0]-.6,door[1]-1.2];nu.sp=3.5;M.nu=nu}return}
 if(M.state==='deliver'){M.t+=dt;M.sy=Math.max(.15,.85-M.t*.8);syncRear();lead.act=rear.act='lift';lead.lk=rear.lk=0;P_.g.position.set(st.position.x,st.position.y+.12,st.position.z);if(M.nu&&!M.nu.tgt)M.nu.act='kneelwork';
  if(M.t>2.2){P_.g.visible=false;P_.healed29=true;L29.downed=L29.downed.filter(q=>q!==P_);feed('✚ '+P_.name+' llegó a la enfermería');if(M.nu){M.nu.act='idle';M.nu.tgt=[door[0]+(M.nu===L29.nurses[0]?-5:5),door[1]+4.1]}M.pat=null;M.state='home';for(const q of[lead,rear])q.tgt=null;st.position.set(M.st0.x,.12,M.st0.z);st.rotation.y=Math.PI*.5;lead.g.position.set(door[0]-3,0,door[1]+3);rear.g.position.set(door[0]+3,0,door[1]+3);doc.tgt=[door[0],door[1]+3.5]}}}
/* perro de la base: acompaña al capitán Falk y, durante los rescates, al equipo médico */
function dogUpd29(dt){const d=L29.dog;if(!d)return;const M=L29.team;let tgt=null;if(M&&M.state!=='home'&&M.doc)tgt=M.doc.g.position;else if(L28.falk&&L28.falk.g.visible&&!L28.onBoat)tgt=L28.falk.g.position;if(!tgt){d.g.visible=false;return}d.g.visible=true;
 const p=d.g.position,ox=tgt.x-1.4,oz=tgt.z+1.2,dx=ox-p.x,dz=oz-p.z,dist=Math.hypot(dx,dz);const want=dist>1.2?Math.min(7,dist*1.6):0;d.v+=(want-d.v)*Math.min(1,dt*4);if(dist>.05){p.x+=dx/dist*d.v*dt;p.z+=dz/dist*d.v*dt;if(d.v>.3)d.g.rotation.y=TT28(d.g.rotation.y,Math.atan2(dx,dz),dt*6)}if(dist>60){p.set(ox,0,oz)}
 dogAnim13(d.g,dt,d.v/3);d.bark-=dt;if(d.bark<=0){d.bark=6+R()*8;if((L28.ph===2||L28.ph===3)&&p.distanceTo(cam.position)<40)bark13()}}
/* actualización de la base durante las fases a pie */
function base29(dt){if(L28.onBoat||L28.ph>3.5){return}defUpd29(dt);if(L28.ph===3)for(const m of L29.mg)mgUpd29(m,dt);else for(const m of L29.mg){m.gun.act='mgfire';if(m.ld)m.ld.act='idle'}medUpd29(dt);dogUpd29(dt)}
/* =====================================================================
   A3 · TRIPULACIÓN AUTOMÁTICA: si el jugador no opera el cañón o el Flak,
   Keller y el marinero Lenz los manejan solos
   ===================================================================== */
function crewInit29(){if(L29.lenz||!B28.g)return;const fl=(B28.u.stations&&B28.u.stations.flak)||new T.Vector3(0,1.85,-8.75);const n=marinero29(0,0,{name:'Marinero Lenz',vest:true});n.home=new T.Vector3(fl.x+.7,fl.y,fl.z+.6);n.homeF=Math.PI;n.lp=n.home.clone();n.g.visible=false;L28.crew.push(n);L29.lenz=n}
function crewGuns29(dt){if(!L28.onBoat||L9.cine||B28.sunk||!B28.g)return;const C=B28.comp,u=B28.u,bp=B28.g.position,G=L29.G,S={inv:B28.inv};G.cdB=(G.cdB===undefined?2:G.cdB)-dt;G.cdF=(G.cdF===undefined?1:G.cdF)-dt;
 if(L28.stn!=='bow'&&C.canon>0&&B28.gun>0&&u.bowGun){let t=null,bd=420;for(const s of L28.ships){if(!s.alive||s.side!=='e'||!s.g.visible)continue;const d=bp.distanceTo(s.g.position)*(s.k==='bb'?1.6:1);if(d<bd){bd=d;t=s}}
  if(t){const aimP=t.g.position.clone();aimP.y=WY15+1.6;if(turAim28(S,u.bowGun,aimP,dt,160,5,1.1)&&G.cdB<=0){G.cdB=3.6;B28.gun--;const o=new T.Vector3();u.bowGun.muzzles[0].getWorldPosition(o);shell28({p:o,v:aimV28(o,aimP,t.vel,160,.7,5).add(B28.vel),k:'gun',dmg:40,by:'a'});fb12(o.x,o.y,o.z,2.6,.15,0);smoke(o.x,o.y,o.z,2.5,1.6,0xb0aca8,1,.5);nz18(0,.5,'lowpass',800,150,.15);if(!G.m1){G.m1=1;feed('La tripulación opera las armas que no manejás vos (Keller: cañón · Lenz: Flak)')}}}}
 if(L28.stn!=='flak'&&C.flak>0&&B28.flak>0&&u.flak){let a=null,bd=480;for(const q of L28.planes){if(q.st==='down'||q.st==='gone')continue;const d=bp.distanceTo(q.p);if(d<bd){bd=d;a=q}}
  if(a&&turAim28(S,u.flak,a.p,dt,240,2,2.4)&&G.cdF<=0){G.cdF=.34;B28.flak--;const mz=u.flak.muzzles[B28.flak%u.flak.muzzles.length],o=new T.Vector3();mz.getWorldPosition(o);shell28({p:o,v:aimV28(o,a.p,a.vel,240,.55,2),k:'flak',dmg:24,by:'a',fuse:Math.min(3,bd/240+.15),g:2});fb12(o.x,o.y,o.z,1.2,.07,0);tn18('square',150,70,.08,.04)}}}
{const _w=wolfUpd28;wolfUpd28=function(dt){_w(dt);try{crewGuns29(dt)}catch(e){}}}
/* =====================================================================
   A3 · FASE 2 DEL COMBATE NAVAL: el acorazado retrocede hacia mar abierto
   ===================================================================== */
{const _g=go28;go28=function(ph,jump){_g(ph,jump);const bb=L28.bb;if(ph===5&&!jump&&bb){bb.hold=false;bb.bombard=null;bb.route=RT28([[28,-420],[25,-470]]);bb.ri=0;bb.vmax=3.2;later28(4,()=>radio28('Vigía','¡El acorazado da marcha atrás! ¡Se retira hacia mar abierto para ganar distancia!',2.6))}
 if(ph===6&&bb&&!jump){bb.bombard=[[ENV15.dest&&ENV15.dest.batt2?ENV15.dest.batt2.x:125,ENV15.dest&&ENV15.dest.batt2?ENV15.dest.batt2.z:10]]}
 if(ph===3){for(const m of L29.mg){m.belt=60;m.st='watch'}}if(jump&&ph<=3)resetBase29()}}
function resetBase29(){for(const n of[...L29.def,...L29.mg.flatMap(m=>[m.gun,m.ld])]){if(!n)continue;n.down29=false;n.res29=0;n.healed29=false;n.hp=100;n.g.visible=true;n.g.rotation.x=0;n.lock=false;n.tgt=null;if(L29.def.includes(n)){n.fsm='idle'}}L29.downed=[];for(const m of L29.mg){m.gun.g.position.set(X15+m.x,0,m.z+1.5);m.ld.g.position.set(X15+m.x+.9,0,m.z+1.3);m.swap=0}if(L29.team){const M=L29.team;M.state='home';M.pat=null}}
/* construcción: se engancha al constructor del nivel naval */
{const _b=build28;build28=function(){const was=L28.built;_b();if(was)return;props29();for(let i=0;i<NEST29.length;i++)nest29(NEST29[i].x,NEST29[i].z,i);defInit29();medInit29();crewInit29()}}
{const _u=updT28;updT28=function(dt){_u(dt);try{base29(dt)}catch(e){console.warn(e)}}}
/* =====================================================================
   A4 · CÁMARA DEL TANQUE EN TERCERA PERSONA (nivel 14) — estilo CoD1
   cámara sobre y detrás de la torreta, inercia, colisión, retícula de cañón
   ===================================================================== */
const TC29={mode:'3p',pos:null,dist:9.2,h:1.7,lag:7};
document.head.insertAdjacentHTML('beforeend','<style>#rt29{position:fixed;left:50%;top:50%;width:46px;height:46px;margin:-23px;pointer-events:none;z-index:5;display:none}#rt29:before,#rt29:after{content:"";position:absolute;background:rgba(240,230,190,.85);box-shadow:0 0 2px #000}#rt29:before{left:22px;top:0;width:2px;height:46px}#rt29:after{top:22px;left:0;height:2px;width:46px}#gun29{position:fixed;width:18px;height:18px;margin:-9px;border:2px solid rgba(255,200,90,.9);border-radius:50%;pointer-events:none;z-index:5;display:none;box-shadow:0 0 3px #000}#tm29{position:fixed;left:50%;bottom:64px;transform:translateX(-50%);font:12px Georgia,serif;letter-spacing:2px;color:#e8dcb8;text-shadow:0 1px 2px #000;pointer-events:none;z-index:5;display:none}</style>');
document.body.insertAdjacentHTML('beforeend','<div id="rt29"></div><div id="gun29"></div><div id="tm29">TERCERA PERSONA · V / 1ª-3ª: mira del cañón</div>');
const _c29=new T.Vector3(),_d29=new T.Vector3(),_p29=new T.Vector3();
function tankCam29(dt){const g=L14.tank,u=g.userData;u.tur.getWorldPosition(_p29);_p29.y+=2.1;const cy=Math.cos(pitch),dir=_d29.set(-Math.sin(yaw)*cy,Math.sin(pitch),-Math.cos(yaw)*cy);
 /* posición deseada: detrás y por encima de la torreta, según la mirada */const want=_c29.copy(_p29).addScaledVector(dir,-TC29.dist);want.y=Math.max(_p29.y+.4,_p29.y+TC29.h-Math.sin(pitch)*TC29.dist*.6);
 /* colisión: no atravesar muros ni el suelo */let best=1;for(let k=.1;k<=1.001;k+=.05){const x=_p29.x+(want.x-_p29.x)*k,y=_p29.y+(want.y-_p29.y)*k,z=_p29.z+(want.z-_p29.z)*k;if(y<.5||(typeof inB==='function'&&inB(new T.Vector3(x,y,z)))){best=Math.max(.12,k-.08);break}}
 want.set(_p29.x+(want.x-_p29.x)*best,_p29.y+(want.y-_p29.y)*best,_p29.z+(want.z-_p29.z)*best);
 if(!TC29.pos)TC29.pos=want.clone();TC29.pos.lerp(want,Math.min(1,dt*TC29.lag));if(TC29.pos.distanceTo(want)>8)TC29.pos.copy(want);cam.position.copy(TC29.pos);cam.lookAt(_p29.x+dir.x*26,_p29.y+dir.y*26+1.2,_p29.z+dir.z*26);
 /* indicador de hacia dónde apunta realmente el cañón (la torreta gira con inercia) */const gd=$('gun29');if(u.muz&&!L14.bent){const m=new T.Vector3(),q=new T.Vector3();u.muz.getWorldPosition(m);u.gun.getWorldPosition(q);const v=m.clone().sub(q).normalize();const tp=m.clone().addScaledVector(v,80).project(cam);if(tp.z<1){gd.style.display='block';gd.style.left=((tp.x+1)/2*innerWidth)+'px';gd.style.top=((1-tp.y)/2*innerHeight)+'px'}else gd.style.display='none'}else gd.style.display='none'}
{const _u=update;update=function(dt){if(level===15&&L9.cine){const a=$('ars28');if(a)a.style.display='none'}const tank=level===14&&L14.on&&L14.inTank;if(tank&&!fpv){TC29.mode=TC29.mode==='3p'?'1p':'3p';fpv=true;say(TC29.mode==='3p'?'Cámara exterior (tercera persona)':'Mira del cañón',1.2)}
 _u(dt);const on=tank&&L14.inTank&&playing&&!L9.cine&&TC29.mode==='3p';$('rt29').style.display=on?'block':'none';$('tm29').style.display=on?'block':'none';if(!on){$('gun29').style.display='none';TC29.pos=null;return}
 $('ov14').style.display='none';P.g.visible=false;tankCam29(dt||0)}}
