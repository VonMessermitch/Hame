/* =====================================================================
   v32 · PRIMERA PERSONA: manos, brazos, armas y animaciones (todo el juego)
   - Niveles 1–12: antes no había modelo en primera persona (con V sólo se veía el mundo);
     ahora se dibuja el mismo sistema que en 13+ (escena VM13 aparte, encima del mundo).
   - Niveles 13+: los modelos VM13 (pistola, fusil, subfusil) se sustituyen por nuevos con la
     misma interfaz; vmUpd13 sigue decidiendo cuándo se ven (condición por nivel) y aquí se
     recalcula toda la pose: respiración, balanceo, inercia, retroceso con muelle, cerrojo,
     recargas táctica/vacía, cambio de arma, inspección, cuerpo a cuerpo, granada, sobresalto
     al recibir daño, caída tras un salto, fogonazo en cruz+cono, humo y vainas con rebote.
   ===================================================================== */
const rnd32=Math.random;
const VM32={on:false,own:false,drew:false,R:{},key:null,want:null,sw:1,t:0,rk:0,rv:0,rz:0,sx:0,sy:0,svx:0,svy:0,ly:null,lx:null,bob:0,spd:0,lp:null,
 runK:0,aimK:0,land:0,air:false,vyp:0,fl:0,flx:0,thr:-1,ins:0,boltS:0,ej:false,sl:0,relE:false,cas:[],smk:[],built:false,M:null,frame:0,f13:-1,cy:[0,0],ld:0,ldv:0,fxT:0,trT:0,
 pal:{lo:{gl:0x8a6a48,sl:0x4f6272},mid:{gl:0x4a3424,sl:0x4f6272},13:{gl:0x3a2a1c,sl:0x4a586c},17:{gl:0x5a564c,sl:0x5c6650},drum:{17:true}}};
const _q32=new T.Quaternion(),_e32=new T.Euler(),_p32=new T.Vector3(),_s32=new T.Vector3(),_Y32=new T.Vector3(0,1,0),_v32=new T.Vector3(),_w32=new T.Vector3(),_m32=new T.Matrix4();
/* ---------- materiales: madera veteada, acero pavonado con desgaste, latón, lana/cuero teñidos por nivel ---------- */
function tex32(f){const c=document.createElement('canvas');c.width=c.height=64;const x=c.getContext('2d');f(x,64);const t=new T.CanvasTexture(c);t.wrapS=t.wrapT=T.RepeatWrapping;return t}
function mats32(){if(VM32.M)return VM32.M;const hi=G.detail>0;
 const wood=tex32((x,s)=>{x.fillStyle='#d6d6d6';x.fillRect(0,0,s,s);for(let i=0;i<34;i++){const y0=rnd32()*s,a=.08+rnd32()*.22;x.strokeStyle='rgba(40,24,10,'+a+')';x.lineWidth=.6+rnd32()*1.4;x.beginPath();x.moveTo(0,y0);for(let k=0;k<=8;k++)x.lineTo(k*8,y0+Math.sin(k*.9+i)*1.6);x.stroke()}for(let i=0;i<5;i++){x.fillStyle='rgba(255,255,255,.12)';x.fillRect(rnd32()*s,rnd32()*s,6+rnd32()*10,1)}x.fillStyle='rgba(30,18,8,.35)';x.beginPath();x.ellipse(rnd32()*s,rnd32()*s,3,1.6,0,0,6.3);x.fill()});
 const steel=tex32((x,s)=>{x.fillStyle='#cfcfcf';x.fillRect(0,0,s,s);for(let i=0;i<500;i++){const v=150+rnd32()*105|0;x.fillStyle='rgba('+v+','+v+','+v+',.5)';x.fillRect(rnd32()*s|0,rnd32()*s|0,1,1)}x.strokeStyle='rgba(255,255,255,.35)';for(let i=0;i<7;i++){x.lineWidth=.5;x.beginPath();const a=rnd32()*s,b=rnd32()*s;x.moveTo(a,b);x.lineTo(a+rnd32()*14-7,b+rnd32()*6-3);x.stroke()}x.fillStyle='rgba(120,70,40,.18)';for(let i=0;i<4;i++)x.fillRect(rnd32()*s,rnd32()*s,3,2)});
 const knit=tex32((x,s)=>{x.fillStyle='#e8e8e8';x.fillRect(0,0,s,s);x.strokeStyle='rgba(0,0,0,.16)';x.lineWidth=1;for(let y=0;y<s;y+=4)for(let k=0;k<s;k+=4){x.beginPath();x.moveTo(k,y);x.lineTo(k+2,y+3);x.lineTo(k+4,y);x.stroke()}});
 const cloth=tex32((x,s)=>{x.fillStyle='#e4e4e4';x.fillRect(0,0,s,s);for(let i=0;i<420;i++){const v=170+rnd32()*80|0;x.fillStyle='rgb('+v+','+v+','+v+')';x.fillRect(rnd32()*s|0,rnd32()*s|0,1+(rnd32()*2|0),1)}for(let y=0;y<s;y+=2){x.fillStyle='rgba(0,0,0,.05)';x.fillRect(0,y,s,1)}});
 const L=(o)=>new T.MeshLambertMaterial(Object.assign({vertexColors:true},o));
 VM32.M={w:L({map:wood}),s:hi?new T.MeshPhongMaterial({vertexColors:true,map:steel,shininess:46,specular:0x4c4c50}):L({map:steel}),b:hi?new T.MeshPhongMaterial({vertexColors:true,shininess:80,specular:0x8a7040}):L({}),
  g:L({map:knit,color:0x4a3424}),c:L({map:cloth,color:0x4a586c}),l:L({map:cloth})};return VM32.M}
/* ---------- constructor: piezas por material, fusionadas en una malla por material y por pieza móvil ---------- */
function B32(){return{w:PB(),s:PB(),b:PB(),g:PB(),c:PB(),l:PB()}}
function F32(B,par){const M=mats32();for(const k in B)if(B[k].L.length){const m=pbMesh(B[k],par,M[k]);m.frustumCulled=false}return par}
function M32(x,y,z,rx,ry,rz){_e32.set(rx||0,ry||0,rz||0,'YXZ');return new T.Matrix4().compose(new T.Vector3(x,y,z),new T.Quaternion().setFromEuler(_e32),new T.Vector3(1,1,1))}
function put32(q,geo,col,F,x,y,z,rx,ry,rz,wr){const L=M32(x,y,z,rx,ry,rz),W=F?F.clone().multiply(L):L;W.decompose(_p32,_q32,_s32);_e32.setFromQuaternion(_q32,'YXZ');pa(q,geo,col,_p32.x,_p32.y,_p32.z,_e32.x,_e32.y,_e32.z,1,1,1,wr===undefined?.05:wr)}
function bx(q,F,w,h,d,c,x,y,z,rx,ry,rz,wr){put32(q,gBox(w,h,d),c,F,x,y,z,rx,ry,rz,wr)}
/* cilindro a lo largo de z (r1 detrás, r2 delante) */
function cz(q,F,r1,r2,len,c,x,y,z,s){put32(q,gCyl(r1,r2,len,s||10),c,F,x,y,z,1.5708,0,0)}
function limb32(q,col,A,E,r1,r2,ext,s){const d=_v32.copy(E).sub(A),L=d.length()*(ext||1);d.normalize();const m=_w32.copy(A).addScaledVector(d,L/2);_q32.setFromUnitVectors(_Y32,d);_e32.setFromQuaternion(_q32,'YXZ');pa(q,gCyl(r2,r1,L,s||10),col,m.x,m.y,m.z,_e32.x,_e32.y,_e32.z,1,1,1,.04)}
function seg32(q,col,A,E,w,h){const d=_v32.copy(E).sub(A),L=d.length();_m32.lookAt(A,E,Math.abs(d.y/L)>.9?new T.Vector3(1,0,0):_Y32);_q32.setFromRotationMatrix(_m32);_e32.setFromQuaternion(_q32,'YXZ');pa(q,gBox(w,h,L),col,(A.x+E.x)/2,(A.y+E.y)/2,(A.z+E.z)/2,_e32.x,_e32.y,_e32.z,1,1,1,.04)}
const V3=(a,b,c)=>new T.Vector3(a,b,c);
/* marco de mano: centro de la palma, dirección de los dedos, dorso (las muñecas quedan detrás de la palma) */
function FH32(pc,fd,yb){const Z=V3(-fd[0],-fd[1],-fd[2]).normalize(),X=new T.Vector3().crossVectors(V3(yb[0],yb[1],yb[2]),Z).normalize(),Y=new T.Vector3().crossVectors(Z,X);const M=new T.Matrix4().makeBasis(X,Y,Z);M.setPosition(pc[0]+Z.x*.047,pc[1]+Z.y*.047,pc[2]+Z.z*.047);return M}
const GW32=0xf4f4f4,GS32=0xc8c8c8,GD32=0x9c9c9c;
/* mano enguantada: palma, nudillos, 4 dedos de 2 falanges con articulación, pulgar de 2 falanges, puño del guante y manga hasta fuera de cámara */
function hand32(B,F,side,o){o=o||{};const q=B.g,c=o.c||[1,1,1,1],c2=o.c2||c.map(v=>v*1.1),th=o.th||[.5,.2,.5,.3],sp=o.sp||0;
 bx(q,F,.082,.027,.088,GW32,0,0,-.047);bx(q,F,.07,.012,.052,GS32,0,-.016,-.03);bx(q,F,.034,.024,.05,GW32,-side*.028,-.008,-.026,0,-side*.3,0);
 const FX=[.0285,.0095,-.0095,-.0275],L1=[.046,.05,.047,.037],L2=[.043,.047,.043,.034],WD=[.0185,.019,.018,.0158];
 for(let i=0;i<4;i++){const fx=-side*FX[i];bx(q,F,WD[i]*1.02,.011,.014,GS32,fx,.012,-.086);if(o.skip===i)continue;
  const Fi=F.clone().multiply(M32(fx,-.001,-.089,-c[i],-side*sp*(i-1.5)*.1,0)),w=WD[i];bx(q,Fi,w,w*.94,L1[i],GW32,0,0,-L1[i]/2);bx(q,Fi,w*1.08,w*1.05,.011,GS32,0,.0005,-L1[i]);
  const F2=Fi.clone().multiply(M32(0,0,-L1[i],-c2[i],0,0));bx(q,F2,w*.92,w*.88,L2[i],GW32,0,0,-L2[i]/2+.001);bx(q,F2,w*.78,w*.72,.008,GS32,0,-.001,-L2[i]+.002)}
 const Ft=F.clone().multiply(M32(-side*.043,-.011,-.03,-th[1],-side*th[0],-side*th[2]));bx(q,Ft,.022,.02,.044,GW32,0,0,-.022);bx(q,Ft,.023,.021,.01,GS32,0,0,-.044);
 const F3=Ft.clone().multiply(M32(0,0,-.044,-th[3],0,0));bx(q,F3,.02,.018,.034,GW32,0,0,-.016);
 bx(q,F,.088,.058,.046,GS32,0,-.003,.018);if(G.detail>=2){bx(q,F,.06,.002,.002,GD32,0,.014,-.062);bx(q,F,.002,.002,.05,GD32,-side*.012,.014,-.035)}
 if(o.el){const A=V3(0,0,.036).applyMatrix4(F),E=V3(o.el[0],o.el[1],o.el[2]);limb32(B.c,0xd8d8d8,A,E,.043,.054,1.35);limb32(B.c,0xa4a4a4,A.clone().lerp(E,-.03),A.clone().lerp(E,.13),.05,.053,1)}
 return F}
/* índice suelto (en el gatillo): falanges de la base al punto de contacto */
function finger32(B,F,side,tip,joint){const b=V3(-side*.0285,-.001,-.089).applyMatrix4(F);seg32(B.g,GW32,b,joint,.0185,.0175);seg32(B.g,GS32,joint.clone().lerp(b,.12),joint.clone().lerp(tip,.12),.02,.019);seg32(B.g,GW32,joint,tip,.017,.016);return b}
/* ---------- fogonazo (estrella frontal + cono lateral + halo), compartido ---------- */
function fxTex32(){if(VM32.FT)return VM32.FT;const star=tex32((x,s)=>{x.translate(32,32);for(let i=0;i<6;i++){x.rotate(Math.PI/3);const g=x.createLinearGradient(0,0,0,-30);g.addColorStop(0,'rgba(255,250,220,1)');g.addColorStop(.5,'rgba(255,170,60,.7)');g.addColorStop(1,'rgba(255,90,10,0)');x.fillStyle=g;x.beginPath();x.moveTo(-4-rnd32()*2,0);x.lineTo(0,-22-rnd32()*9);x.lineTo(4+rnd32()*2,0);x.fill()}const r=x.createRadialGradient(0,0,0,0,0,12);r.addColorStop(0,'rgba(255,255,240,1)');r.addColorStop(1,'rgba(255,160,40,0)');x.fillStyle=r;x.fillRect(-12,-12,24,24)});
 const cone=tex32((x,s)=>{const g=x.createLinearGradient(0,0,s,0);g.addColorStop(0,'rgba(255,250,225,1)');g.addColorStop(.35,'rgba(255,190,80,.85)');g.addColorStop(1,'rgba(255,80,10,0)');x.fillStyle=g;x.beginPath();x.moveTo(0,32);x.quadraticCurveTo(20,8,64,20);x.lineTo(48,32);x.lineTo(64,44);x.quadraticCurveTo(20,56,0,32);x.fill()});
 const puff=tex32((x,s)=>{const g=x.createRadialGradient(32,32,2,32,32,30);g.addColorStop(0,'rgba(235,235,230,.55)');g.addColorStop(.6,'rgba(200,200,196,.22)');g.addColorStop(1,'rgba(180,180,176,0)');x.fillStyle=g;x.fillRect(0,0,64,64)});
 const A=m=>new T.MeshBasicMaterial({map:m,transparent:true,blending:T.AdditiveBlending,depthWrite:false,side:T.DoubleSide});
 VM32.FT={star:A(star),cone:A(cone),puff,glow:typeof fbTex12==='function'?fbTex12():star,pl:new T.PlaneGeometry(1,1)};return VM32.FT}
function flash32(R,x,y,z,s){const F=fxTex32(),g=new T.Group();g.position.set(x,y,z);R.gun.add(g);const st=new T.Mesh(F.pl,F.star);st.scale.setScalar(s);g.add(st);
 for(let i=0;i<2;i++){const c=new T.Mesh(F.pl,F.cone);c.scale.set(s*2.2,s*.9,1);c.rotation.set(i?1.5708:0,1.5708,0);c.position.z=-s*1.05;g.add(c)}
 const fl=new T.Sprite(new T.SpriteMaterial({map:F.glow,color:0xffd090,transparent:true,blending:T.AdditiveBlending,depthWrite:false}));fl.scale.setScalar(s*1.4);fl.visible=false;g.add(fl);
 g.visible=false;R.fx=g;R.fl=fl;R.fs=s;R.mz=V3(x,y,z);return g}
function rig32(k,key){const root=new T.Group(),kick=new T.Group(),piv=new T.Group(),gun=new T.Group();root.add(kick);kick.add(piv);piv.add(gun);root.visible=false;return{k,key,root,kick,piv,gun}}
function grp32(par,x,y,z){const g=new T.Group();g.position.set(x||0,y||0,z||0);par.add(g);return g}
const WD32=0x6c4529,WD32b=0x56361f,ST32=0x34373c,ST32b=0x4e5258,BR32=0xc8a040;
/* ---------- fusil de cerrojo: alza de hoja, guion, abrazaderas, anillas, baqueta, cerrojo con manija, bayoneta opcional ---------- */
function rifle32(bay){const R=rig32('r','Rf'),g=R.gun,hi=G.detail>=2,lo=G.detail===0;let B=B32();const w=B.w,s=B.s;
 bx(w,null,.04,.112,.19,WD32,0,-.07,.305,-.07);bx(s,null,.042,.118,.008,ST32,0,-.072,.402,-.07);bx(w,null,.036,.05,.15,WD32,0,-.098,.19,.33);
 bx(w,null,.034,.052,.13,WD32,0,-.03,.12,.42);bx(w,null,.032,.04,.04,WD32b,0,-.07,.082,.9);
 bx(w,null,.042,.05,.24,WD32,0,-.02,-.07);bx(w,null,.042,.044,.5,WD32,0,-.022,-.43);bx(w,null,.034,.034,.05,WD32b,0,-.018,-.7);bx(w,null,.03,.016,.3,WD32b,0,.024,-.44);
 if(!lo){bx(w,null,.0425,.006,.2,WD32b,0,-.044,-.4);bx(w,null,.041,.003,.12,0x3a2410,0,.006,.2,-.05)}
 bx(s,null,.032,.034,.2,ST32,0,.012,-.07);cz(s,null,.019,.019,.045,ST32,0,.012,-.185,12);bx(s,null,.02,.008,.05,ST32b,0,.002,.055);
 cz(s,null,.0105,.0075,.66,ST32,0,.012,-.53,10);cz(s,null,.0082,.0082,.012,ST32b,0,.012,-.866,10);
 bx(s,null,.047,.053,.016,ST32b,0,-.006,-.47);bx(s,null,.04,.045,.032,ST32,0,-.004,-.69);
 put32(s,gTor(.009,.0022,4,10),ST32b,null,0,-.042,-.47,0,1.5708,0);put32(s,gTor(.009,.0022,4,10),ST32b,null,0,-.135,.24,0,1.5708,0);
 bx(s,null,.024,.014,.05,ST32,0,.028,-.27);bx(s,null,.02,.006,.034,ST32b,0,.037,-.262,-.05);bx(s,null,.005,.009,.004,ST32,.006,.0445,-.248);bx(s,null,.005,.009,.004,ST32,-.006,.0445,-.248);bx(s,null,.017,.004,.004,ST32,0,.04,-.248);
 bx(s,null,.012,.02,.02,ST32,0,.028,-.845);bx(s,null,.0026,.012,.003,ST32b,0,.043,-.848);if(hi){bx(s,null,.002,.02,.016,ST32,.0075,.04,-.846);bx(s,null,.002,.02,.016,ST32,-.0075,.04,-.846);for(const z of[-.3,-.6])bx(s,null,.0045,.0045,.002,ST32b,.022,-.02,z)}
 cz(s,null,.003,.003,.17,ST32b,0,-.004,-.79,6);
 bx(s,null,.012,.004,.075,ST32,0,-.051,.037);bx(s,null,.012,.026,.004,ST32,0,-.04,-.002);bx(s,null,.012,.022,.004,ST32,0,-.041,.075,.45);bx(s,null,.036,.006,.075,ST32b,0,-.047,-.04);
 if(bay){const b=R.bay=grp32(g,0,0,0),q=B32();bx(q.s,null,.016,.024,.05,ST32,0,-.006,-.87);bx(q.s,null,.007,.04,.007,ST32,0,-.003,-.89);bx(q.s,null,.004,.019,.27,0x8a9096,0,-.013,-1.03);bx(q.s,null,.003,.01,.04,0x8a9096,0,-.016,-1.18,.3);F32(q,b)}
 F32(B,g);
 /* cerrojo: eje a la altura de la caja; rot z levanta la manija, z+ lo lleva atrás */
 const bo=R.bolt=grp32(g,0,.021,0);B=B32();cz(B.s,null,.0098,.0098,.15,0x6a6e74,0,0,-.06,10);bx(B.s,null,.015,.013,.03,ST32,0,-.003,.032);
 bx(B.s,null,.044,.009,.009,0x5a5e64,.025,0,.008);put32(B.s,gSph(.0095,8,6),0x4e5258,null,.05,-.008,.012);F32(B,bo);R.knob=V3(.05,-.008,.012);
 const tr=R.trig=grp32(g,0,-.026,.03);B=B32();bx(B.s,null,.005,.022,.006,ST32b,0,-.011,0,.25);F32(B,tr);
 /* peine: 5 cartuchos de latón (para la recarga) */
 const cl=R.clip=grp32(g,0,.064,.022);B=B32();bx(B.s,null,.03,.064,.005,ST32b,0,-.004,.004);F32(B,cl);const rn=R.rnds=grp32(cl,0,0,0);B=B32();for(let i=0;i<5;i++){cz(B.b,null,.0058,.0058,.06,BR32,0,-.028+i*.0125,-.03,7);cz(B.b,null,.0048,.0016,.024,0xb06a3a,0,-.028+i*.0125,-.072,7)}F32(B,rn);cl.visible=false;
 /* mano derecha en la garganta de la culata, índice en el gatillo */
 const rh=R.rh=grp32(g);B=B32();const FR=FH32([.035,-.046,.082],[-.05,-.42,-.92],[1,.2,0]);hand32(B,FR,1,{skip:0,c:[0,1.45,1.5,1.55],c2:[0,1.35,1.35,1.3],th:[.95,.35,.9,.25],el:[.2,-.34,.56]});
 finger32(B,FR,1,V3(.002,-.036,.026),V3(.016,-.03,.0));F32(B,rh);
 /* mano derecha manejando el cerrojo (cuelga del cerrojo) */
 const bc=R.rhB=grp32(bo,R.knob.x,R.knob.y,R.knob.z);B=B32();const FB=FH32([.02,-.02,.05],[-.25,.25,-.94],[.75,.65,0]);hand32(B,FB,1,{c:[.9,1.2,1.3,1.4],c2:[.8,1.2,1.3,1.3],th:[.3,.1,.2,.2],el:[.28,-.38,.55]});F32(B,bc);bc.visible=false;
 /* mano izquierda bajo el guardamanos */
 const lh=R.lh=grp32(g);B=B32();hand32(B,FH32([-.012,-.057,-.42],[.45,.3,-.84],[-.45,-.89,0]),-1,{c:[.95,1.0,1.05,1.1],c2:[.75,.75,.75,.75],th:[.25,-.35,.3,.2],el:[-.3,-.47,-.16]});F32(B,lh);
 /* mano izquierda empujando el peine */
 const l2=R.lh2=grp32(g);B=B32();hand32(B,FH32([-.055,.075,.07],[.55,-.25,-.8],[-.55,.83,0]),-1,{c:[.9,1.1,1.2,1.3],c2:[.9,1.1,1.1,1.1],th:[-.15,.35,-.2,.15],el:[-.3,-.3,.3]});F32(B,l2);l2.visible=false;
 flash32(R,0,.012,bay?-1.2:-.875,.11);R.ej=V3(.012,.04,-.07);R.cas={r:.0062,l:.057};
 R.hip=[.115,-.104,-.36];R.aim=[0,-.049,-.25];R.W={kz:1,kr:1,sw:1.25,imp:3.2};R.mag=null;return R}
/* ---------- subfusil (cargador recto, tambor) y ametralladora ligera (plato superior) ---------- */
function smg32(o){o=o||{};const lmg=!!o.lmg,drum=!!o.drum,R=rig32('s',o.key||'Sm'),g=R.gun,hi=G.detail>=2,lo=G.detail===0;let B=B32();const w=B.w,s=B.s,J=lmg?.026:.017,Lb=lmg?.42:.2;
 cz(s,null,.021,.021,.32,ST32,0,.02,-.12,12);cz(s,null,.023,.023,.016,ST32b,0,.02,.046,12);cz(s,null,J,J,Lb,ST32,0,.02,-.28-Lb/2,lmg?12:10);
 if(!lo)for(let i=0;i<(lmg?7:4);i++)for(let k=0;k<(hi?6:3);k++){const a=k*(hi?1.05:2.1)+.5;bx(s,null,.006,.006,.012,0x0e0e10,Math.cos(a)*J,.02+Math.sin(a)*J,-.31-i*.05,0,0,a)}
 if(lmg)for(let i=0;i<6;i++)bx(s,null,.002,.06,.36,ST32b,0,.02,-.47,0,0,i*.52);
 const ze=-.28-Lb;cz(s,null,.009,.009,.06,ST32b,0,.02,ze-.02,8);bx(s,null,.016,.03,.022,ST32,0,.038,ze+.02);bx(s,null,.0026,.012,.003,ST32b,0,.049,ze+.02);
 bx(s,null,.016,.014,.02,ST32,0,.042,.0);bx(s,null,.004,.007,.004,ST32,.005,.0515,.004);bx(s,null,.004,.007,.004,ST32,-.005,.0515,.004);
 bx(s,null,.028,.05,.045,ST32,0,-.016,-.15);bx(w,null,.03,.105,.044,WD32b,0,-.052,.036,.32);bx(s,null,.012,.004,.07,ST32,0,-.04,-.012);bx(s,null,.012,.024,.004,ST32,0,-.028,-.048);
 bx(w,null,.038,.06,.24,WD32,0,-.026,.2,.12);bx(w,null,.036,.05,.1,WD32,0,-.006,.1,.06);bx(s,null,.04,.068,.008,ST32b,0,-.04,.32,.12);
 if(drum||lmg)bx(w,null,.036,.036,.16,WD32,0,-.01,-.36);if(lmg){bx(s,null,.006,.006,.2,ST32,.012,-.03,-.5,.25);bx(s,null,.006,.006,.2,ST32,-.012,-.03,-.5,.25)}
 if(hi)bx(s,null,.03,.004,.3,0x2a2418,.021,.0,-.05);F32(B,g);
 const bo=R.bolt=grp32(g,.023,.02,-.05);B=B32();bx(B.s,null,.022,.008,.012,0x5a5e64,.011,0,0);put32(B.s,gSph(.009,8,6),0x5a5e64,null,.024,0,0);F32(B,bo);
 const tr=R.trig=grp32(g,0,-.02,-.02);B=B32();bx(B.s,null,.005,.02,.006,ST32b,0,-.01,0,.2);F32(B,tr);
 const mk=(par,y)=>{const m=grp32(par,0,y,0),q=B32();if(lmg){cz(q.s,null,.075,.075,.02,ST32,0,.012,0,18);cz(q.s,null,.022,.022,.03,ST32b,0,.02,0,8);if(!lo)for(let i=0;i<8;i++)bx(q.s,null,.14,.022,.004,ST32b,0,.012,0,0,i*.39,0)}
  else if(drum){put32(q.s,gCyl(.068,.068,.042,18),ST32,null,0,-.085,0,0,0,1.5708);put32(q.s,gCyl(.02,.02,.05,10),ST32b,null,0,-.085,0,0,0,1.5708);bx(q.s,null,.024,.05,.034,ST32,0,-.02,0);if(hi)put32(q.s,gTor(.068,.004,4,18),ST32b,null,0,-.085,0,0,1.5708,0)}
  else{bx(q.s,null,.024,.17,.034,ST32,0,-.09,0,.06);bx(q.s,null,.028,.01,.04,ST32b,0,-.172,.006);if(hi)bx(q.s,null,.0245,.11,.004,0x24262a,0,-.09,-.016,.06)}F32(q,m);return m};
 if(lmg){R.mag=mk(g,0);R.mag.position.set(0,.05,-.1)}else{R.mag=mk(g,0);R.mag.position.set(0,-.04,-.15)}
 const rh=R.rh=grp32(g);B=B32();const FR=FH32([.032,-.05,.044],[-.06,-.3,-.95],[1,.12,0]);hand32(B,FR,1,{skip:0,c:[0,1.5,1.55,1.6],c2:[0,1.35,1.35,1.3],th:[1.05,.3,.95,.3],el:[.21,-.34,.46]});finger32(B,FR,1,V3(.002,-.03,-.02),V3(.016,-.026,-.044));F32(B,rh);
 const lh=R.lh=grp32(g);B=B32();if(drum||lmg)hand32(B,FH32([.004,-.05,-.37],[.55,.18,-.82],[-.38,-.92,0]),-1,{c:[1.15,1.2,1.25,1.3],c2:[1.2,1.2,1.2,1.2],th:[.35,-.15,.35,.25],el:[-.28,-.36,-.02]});
 else hand32(B,FH32([-.032,-.055,-.15],[.1,-.25,-.96],[-1,-.1,0]),-1,{c:[1.45,1.5,1.55,1.6],c2:[1.3,1.3,1.3,1.3],th:[1,.3,.9,.3],el:[-.26,-.38,.0]});F32(B,lh);
 R.nmag=mk(g,0);R.nmag.visible=false;
 flash32(R,0,.02,ze-.06,lmg?.12:.085);R.ej=V3(.022,.03,-.09);R.cas={r:lmg?.006:.0046,l:lmg?.054:.022};
 R.hip=lmg?[.11,-.12,-.36]:[.1,-.105,-.32];R.aim=lmg?[0,-.055,-.3]:[0,-.055,-.3];R.W={kz:lmg?.8:.45,kr:lmg?.6:.4,sw:lmg?1.5:1,imp:lmg?1.3:.9};R.drum=drum;R.lmg=lmg;return R}
/* ---------- pistola semiautomática (Lugy) con corredera, cargador y apoyo a dos manos ---------- */
function pistol32(){const R=rig32('p','P'),g=R.gun,hi=G.detail>=2;let B=B32();const s=B.s,w=B.w;
 bx(s,null,.026,.02,.15,ST32,0,.004,-.075);cz(s,null,.009,.009,.03,0x1a1b1e,0,.03,-.182,8);bx(s,null,.012,.004,.05,ST32,0,-.023,-.045);bx(s,null,.012,.024,.004,ST32,0,-.012,-.07);F32(B,g);
 const sl=R.slide=grp32(g);B=B32();bx(B.s,null,.028,.034,.2,ST32,0,.03,-.07);if(hi)for(let i=0;i<7;i++)bx(B.s,null,.0295,.026,.003,0x18191c,0,.03,.01+i*.006);
 bx(B.s,null,.004,.006,.006,ST32,.0055,.05,.02);bx(B.s,null,.004,.006,.006,ST32,-.0055,.05,.02);bx(B.s,null,.012,.004,.008,ST32,0,.048,.02);bx(B.s,null,.003,.007,.004,ST32b,0,.0505,-.165);bx(B.s,null,.002,.006,.03,BR32,.0146,.034,-.09);F32(B,sl);
 const gr=R.gr=grp32(g,0,-.004,.018);gr.rotation.x=.3;B=B32();bx(B.s,null,.026,.11,.044,ST32,0,-.055,0);for(const k of[-1,1]){bx(B.w,null,.004,.088,.036,WD32b,k*.0145,-.052,0);if(hi)for(let i=0;i<5;i++)bx(B.w,null,.0045,.002,.03,0x2a180c,k*.0148,-.025-i*.014,0)}F32(B,gr);
 const mk=par=>{const m=grp32(par),q=B32();bx(q.s,null,.022,.1,.034,0x2a2c30,0,-.06,.002);bx(q.s,null,.03,.012,.05,0x1a1c20,0,-.114,.002);F32(q,m);return m};R.mag=mk(gr);
 const tr=R.trig=grp32(g,0,-.004,-.04);B=B32();bx(B.s,null,.004,.018,.006,ST32b,0,-.009,0,.2);F32(B,tr);
 const rh=R.rh=grp32(g);B=B32();const FR=FH32([.032,-.056,.03],[-.06,-.3,-.95],[1,.15,0]);hand32(B,FR,1,{skip:0,c:[0,1.5,1.55,1.6],c2:[0,1.35,1.35,1.3],th:[1.1,.15,.9,.2],el:[.2,-.33,.36]});finger32(B,FR,1,V3(.003,-.012,-.042),V3(.017,-.012,-.06));F32(B,rh);
 const lh=R.lh=grp32(g);B=B32();hand32(B,FH32([-.03,-.075,.01],[.3,-.28,-.91],[-1,-.25,0]),-1,{c:[1.35,1.4,1.45,1.5],c2:[1.2,1.2,1.2,1.2],th:[-.1,-.25,-.2,.1],el:[-.22,-.34,.3]});F32(B,lh);
 R.nmag=mk(lh);R.nmag.position.set(-.03,-.07,-.06);R.nmag.visible=false;
 flash32(R,0,.03,-.2,.07);R.ej=V3(.016,.05,-.05);R.cas={r:.0045,l:.018};R.hip=[.11,-.1,-.36];R.aim=[0,-.0535,-.31];R.W={kz:.7,kr:1.3,sw:.7,imp:2.1};R.idx=null;return R}
/* ---------- revólveres dobles (niveles 1–12): tambor que bascula, martillo ---------- */
function revGun32(par,side){const gg=grp32(par,side*.13,0,0),B=B32(),s=B.s,hi=G.detail>=2;
 bx(s,null,.024,.034,.07,ST32,0,.02,-.0);put32(s,gCyl(.0095,.0095,.17,8),ST32,null,0,.032,-.12,1.5708,0,0);bx(s,null,.006,.02,.15,ST32,0,.012,-.105);bx(s,null,.003,.008,.012,ST32b,0,.044,-.198);bx(s,null,.014,.006,.04,ST32,0,.04,.02);
 bx(B.w,null,.026,.09,.036,WD32,0,-.036,.05,.38);bx(s,null,.028,.012,.04,ST32b,0,-.078,.073,.38);bx(s,null,.01,.004,.05,ST32,0,-.02,.0);bx(s,null,.01,.02,.004,ST32,0,-.01,-.024);F32(B,gg);
 const cy=grp32(gg,0,.024,-.012),q=B32();cz(q.s,null,.0195,.0195,.04,0x44484e,0,0,0,12);if(hi)for(let i=0;i<6;i++){const a=i*1.047;bx(q.s,null,.004,.004,.03,0x1a1b1e,Math.cos(a)*.019,Math.sin(a)*.019,0,0,0,a)}F32(q,cy);
 const hm=grp32(gg,0,.036,.036),h=B32();bx(h.s,null,.006,.016,.008,ST32b,0,.006,0,-.4);bx(h.s,null,.008,.004,.01,ST32b,0,.014,.006);F32(h,hm);
 const hb=B32();const FR=FH32([side*.03,-.04,.05],[-side*.06,-.32,-.94],[side,.15,0]);hand32(hb,FR,side,{c:[1.45,1.5,1.55,1.6],c2:[1.35,1.35,1.35,1.3],th:[1.05,.3,.95,.3],el:[side*.22,-.34,.4]});F32(hb,gg);
 return{g:gg,cy,hm}}
function revs32(){const R=rig32('v','rv'),A=revGun32(R.gun,1),Bv=revGun32(R.gun,-1);R.gs=[A,Bv];R.rh=A.g;R.lh=Bv.g;
 const F=fxTex32();R.fxs=[];for(const G_ of R.gs){const g=new T.Group();g.position.set(0,.032,-.21);G_.g.add(g);const st=new T.Mesh(F.pl,F.star);st.scale.setScalar(.09);g.add(st);for(let i=0;i<2;i++){const c=new T.Mesh(F.pl,F.cone);c.scale.set(.2,.08,1);c.rotation.set(i?1.5708:0,1.5708,0);c.position.z=-.09;g.add(c)}g.visible=false;R.fxs.push(g)}
 R.fx=R.fxs[0];R.fl=new T.Sprite(new T.SpriteMaterial({map:F.glow,transparent:true,blending:T.AdditiveBlending,depthWrite:false}));R.fl.visible=false;R.fs=.09;R.mz=V3(0,.032,-.21);
 R.ej=V3(0,.024,-.012);R.cas={r:.0055,l:.03};R.hip=[0,-.115,-.36];R.aim=[0,-.085,-.33];R.W={kz:.8,kr:1.6,sw:.8,imp:2.4};return R}
/* ---------- sable (niveles 1–12): hoja curva, guarda con guardamano, empuñadura de cuero con alambre ---------- */
function sabre32(){const R=rig32('b','sb'),g=R.gun,hi=G.detail>=2;let B=B32();
 bx(B.l,null,.024,.11,.03,0x3a2416,0,0,0);if(hi)for(let i=0;i<9;i++)bx(B.b,null,.025,.0025,.031,0xb8a070,0,-.045+i*.011,0,0,0,.4);
 bx(B.b,null,.03,.016,.036,0xb89a50,0,-.062,.002);bx(B.b,null,.026,.012,.11,0xb89a50,0,.058,-.018);bx(B.b,null,.012,.03,.01,0xb89a50,0,.07,.02);
 let y=.064,z=0,a=0;for(let i=0;i<5;i++){const L=.17;a+=.045;const cy=y+Math.cos(a)*L/2,czz=z+Math.sin(a)*L/2;bx(B.s,null,.0055,L+.004,.028-i*.002,0xb8bec4,0,cy,czz,-a,0,0,.02);if(i<4)bx(B.s,null,.0058,L,.004,0x6a7076,0,cy,czz+.012,-a);y+=Math.cos(a)*L;z+=Math.sin(a)*L}R.tip=V3(0,y,z);
 seg32(B.b,0xb89a50,V3(0,.058,-.07),V3(0,-.02,-.055),.006,.008);seg32(B.b,0xb89a50,V3(0,-.02,-.055),V3(0,-.06,-.02),.006,.008);F32(B,g);
 B=B32();hand32(B,FH32([.029,0,.004],[0,0,-1],[1,0,0]),1,{c:[1.5,1.55,1.6,1.62],c2:[1.4,1.4,1.4,1.35],th:[1.15,.1,1.0,.35],el:[.13,-.3,.32]});F32(B,g);
 R.lh=grp32(g);R.fx=new T.Group();R.fl=new T.Sprite();R.fs=0;R.mz=V3();R.hip=[.21,-.2,-.42];R.aim=R.hip;R.W={kz:0,kr:0,sw:1,imp:0};return R}
/* ---------- brazo de lanzamiento de granada ---------- */
function throwArm32(){const g=new T.Group(),B=B32();hand32(B,FH32([0,0,0],[.2,.1,-.97],[-.3,.95,0]),-1,{c:[1.25,1.3,1.35,1.4],c2:[1.1,1.1,1.1,1.1],th:[.6,.1,.6,.3],el:[-.12,-.3,.3]});F32(B,g);
 const gr=new T.Group(),q=B32();put32(q.s,gSph(.03,8,6),0x3a4a2a,null,0,0,0);for(let i=0;i<3;i++)bx(q.s,null,.062,.004,.062,0x2a3a1e,0,-.018+i*.018,0);bx(q.s,null,.012,.022,.012,0x5a5e64,0,.034,0);bx(q.s,null,.008,.04,.01,0x6a6e74,.012,.025,0,0,0,-.3);F32(q,gr);gr.position.set(.0,.035,-.05);g.add(gr);g.userData.gr=gr;g.visible=false;return g}
/* ---------- vainas en el mundo (12, con rebote) y humo junto a la boca (8, en la escena VM) ---------- */
function casPool32(){if(VM32.cas.length)return;const m=new T.MeshPhongMaterial({color:0xc8a040,shininess:70,specular:0x806030,emissive:0x1a1004}),g=gCyl(1,1,1,7);
 for(let i=0;i<12;i++){const c=new T.Mesh(g,m);c.visible=false;c.frustumCulled=false;VM32.cas.push({m:c,v:new T.Vector3(),w:new T.Vector3(),t:0,b:0,rest:false})}}
function smkPool32(){if(VM32.smk.length||!VM13.scene)return;const F=fxTex32();for(let i=0;i<8;i++){const s=new T.Sprite(new T.SpriteMaterial({map:F.puff,color:0xa8a8a2,transparent:true,depthWrite:false,opacity:0}));s.visible=false;VM13.scene.add(s);VM32.smk.push({s,v:new T.Vector3(),t:0,T:1})}}
const _c32=new T.Vector3(),_d32=new T.Vector3();
function eject32(R,n){if(!R||!VM13.cam||typeof cam==='undefined')return;casPool32();R.gun.updateMatrixWorld(true);for(let k=0;k<(n||1);k++){
 const pt=R.gs?R.gs[k%2].g:R.gun;pt.updateMatrixWorld(true);_c32.copy(R.ej).applyMatrix4(pt.matrixWorld);const dist=_c32.length();_c32.project(VM13.cam);
 _d32.set(_c32.x,_c32.y,.5).unproject(cam).sub(cam.position).normalize();let c=VM32.cas.find(c=>!c.m.visible);if(!c)c=VM32.cas.reduce((a,b)=>b.t<a.t?b:a);
 if(c.m.parent!==scene)scene.add(c.m);c.m.position.copy(cam.position).addScaledVector(_d32,Math.max(.25,dist));const rv=R.gs;
 c.v.set(rv?(rnd32()-.5)*.6:.9+rnd32()*.5,rv?-.4:1.1+rnd32()*.5,rv?.2:.25+rnd32()*.2).applyQuaternion(cam.quaternion);c.v.x+=(P.mvx||0)*.8;c.v.z+=(P.mvz||0)*.8;
 c.w.set(8+rnd32()*10,rnd32()*6,10+rnd32()*8);c.m.scale.set(R.cas.r,R.cas.l,R.cas.r);c.m.rotation.set(rnd32()*6,rnd32()*6,rnd32()*6);c.t=6;c.b=0;c.rest=false;c.m.visible=true}}
function smoke32(R,n){smkPool32();if(!VM32.smk.length||!R.fs)return;R.gun.updateMatrixWorld(true);for(let k=0;k<n;k++){const s=VM32.smk.find(s=>!s.s.visible)||VM32.smk[0];s.s.position.copy(R.mz).applyMatrix4(R.gun.matrixWorld);s.s.position.z-=.05;
 s.v.set(.02+rnd32()*.03,.05+rnd32()*.05,-.02-rnd32()*.03);s.T=s.t=.7+rnd32()*.6;s.s.scale.setScalar(.018+rnd32()*.014);s.s.material.rotation=rnd32()*6;s.s.visible=true}}
function fxUpd32(dt){for(const c of VM32.cas){if(!c.m.visible)continue;c.t-=dt;if(c.t<=0){c.m.visible=false;continue}if(c.rest)continue;
  c.v.y-=9.8*dt;c.m.position.addScaledVector(c.v,dt);c.m.rotation.x+=c.w.x*dt;c.m.rotation.y+=c.w.y*dt;c.m.rotation.z+=c.w.z*dt;
  const fy=P.g.position.y+c.m.scale.x;if(c.m.position.y<fy){c.m.position.y=fy;if(c.v.y<-.7&&c.b<4){c.v.y=-c.v.y*.36;c.v.x*=.5;c.v.z*=.5;c.w.multiplyScalar(.5);c.b++;if(c.b<3&&typeof tn18==='function'&&c.m.position.distanceToSquared(P.g.position)<16)tn18('triangle',2600+rnd32()*1400,2000,.04,.01)}else{c.rest=true;c.m.rotation.set(1.5708,rnd32()*6,0)}}}
 for(const s of VM32.smk){if(!s.s.visible)continue;s.t-=dt;if(s.t<=0){s.s.visible=false;continue}const u=1-s.t/s.T;s.s.position.addScaledVector(s.v,dt);s.v.multiplyScalar(Math.pow(.6,dt));s.s.scale.multiplyScalar(1+dt*1.6);s.s.material.opacity=.24*Math.sin(Math.min(1,u*3)*1.5708)*(1-u);s.s.material.rotation+=dt*.4}}
/* ---------- montaje: sustituye los modelos VM13 y añade los de 1–12 ---------- */
function vmBuild32(){if(VM32.built)return;if(!VM13.scene&&typeof vmInit13==='function')vmInit13();if(!VM13.scene)return;VM32.built=true;const S=VM13.scene;
 for(const w of[VM13.P,VM13.Rf,VM13.Sm])if(w&&w.root)S.remove(w.root);for(const s of VM13.sh)s.m.visible=false;VM13.sh=[];
 const R=VM32.R;R.P=pistol32();R.Rf=rifle32(true);R.Sm=smg32();R.dr=smg32({drum:true,key:'dr'});R.lm=smg32({lmg:true,key:'lm'});R.rv=revs32();R.sb=sabre32();
 for(const k in R){const r=R[k];r.root.rotation.order='YXZ';S.add(r.root);r.b={};for(const n of['bolt','mag','nmag','slide','clip','rnds','rhB'])if(r[n])r.b[n]=r[n].position.clone()}
 VM13.P=R.P;VM13.Rf=R.Rf;VM13.Sm=R.Sm;VM32.TA=throwArm32();S.add(VM32.TA);VM32.hemi=S.children.find(o=>o.isHemisphereLight);if(VM32.hemi)VM32.h0={i:VM32.hemi.intensity,c:VM32.hemi.color.getHex()};
 const C=VM13.cam,_up=C.updateProjectionMatrix.bind(C);C.updateProjectionMatrix=function(){VM32.drew=true;return _up()};smkPool32()}
function vmKey32(){const c=P.cur;if(level<=12){if(c==='sword'||((P.swT>=0||P.swC>0)&&c!=='rifle'))return'sb';return c==='rifle'?'Rf':c==='smg'?'Sm':'rv'}
 if(VM13.seq&&VM13.seq.show)return VM13.seq.show;if(c==='rifle')return'Rf';if(c==='lmg')return'lm';if(c==='smg')return VM32.pal.drum[level]?'dr':'Sm';return'P'}
function hide32(){for(const k in VM32.R)VM32.R[k].root.visible=false;if(VM32.TA)VM32.TA.visible=false}
const ez32=t=>t<=0?0:t>=1?1:t*t*(3-2*t),win32=(u,a,b,c,d)=>u<a||u>d?0:u<b?ez32((u-a)/(b-a)):u<=c?1:1-ez32((u-c)/(d-c));
function pal32(){const p=VM32.pal,lv=level;let o=p[lv]||(lv>=17?p[17]:lv>=13?p[13]:lv<=8?p.lo:p.mid);let sl=o.sl;if(lv<=12&&typeof EIS!=='undefined'&&((typeof L10!=='undefined'&&L10.eis)||(typeof L12!=='undefined'&&L12.skin)))sl=EIS.coat;const M=mats32();if(VM32.pk!==lv+':'+sl){VM32.pk=lv+':'+sl;M.g.color.setHex(o.gl);M.c.color.setHex(sl)}
 if(VM32.hemi&&lv<=12&&typeof hemi!=='undefined'){const h=VM32.hemi;h.intensity+=(Math.min(1.3,Math.max(.6,hemi.intensity*.85))-h.intensity)*.05;h.color.copy(hemi.color).lerp(_W32,.55)}else if(VM32.hemi&&VM32.h0){VM32.hemi.intensity=VM32.h0.i;VM32.hemi.color.setHex(VM32.h0.c)}}
const _W32=new T.Color(0xffffff);
/* ---------- disparo: muelle de retroceso, fogonazo, humo, vaina, mecanismo ---------- */
function shot32(c){const k=level<=12?(c==='rifle'?'Rf':c==='smg'?'Sm':'rv'):(c==='rifle'?'Rf':c==='smg'?(VM32.pal.drum[level]?'dr':'Sm'):c==='lmg'?'lm':'P'),R=VM32.R[k];if(!R)return;
 VM32.rv+=R.W.imp*(.85+rnd32()*.3);VM32.rz=(rnd32()-.5)*2;VM32.fxT=.04;VM32.sl=1;VM32.trT=.09;VM32.shotN=(VM32.shotN||0)+1;
 if(R.gs){const sd=P.alt?0:1;VM32.gk=VM32.gk||[0,0];VM32.gkv=VM32.gkv||[0,0];VM32.gkv[sd]+=7;VM32.cy[sd]+=1.0472;VM32.gside=sd}
 if(!VM32.on)return;if(c==='rifle'){VM32.boltS=1;VM32.ej=false}else if(!R.gs)eject32(R);smoke32(R,c==='rifle'?2:c==='smg'?(rnd32()<.35?1:0):1);
 if(R.gs)R.fx=R.fxs[VM32.gside||0];R.fx.rotation.z=rnd32()*6.3;R.fx.scale.setScalar((.75+rnd32()*.45)*(1-.45*VM32.aimK));R.fx.children[1].scale.x=R.fs*(1.6+rnd32()*1.4);R.fx.children[2].scale.x=R.fs*(1.6+rnd32()*1.4)}
/* ---------- pose completa de cada fotograma ---------- */
function vmPose32(dt){vmBuild32();if(!VM32.built)return;dt=Math.min(dt||.016,.05);const t=VM32.t+=dt;pal32();
 /* cambio de arma: bajar el arma vieja, subir la nueva (el sable de un ataque aparece al instante) */
 const want=vmKey32();if(!VM32.key){VM32.key=want;VM32.sw=0}if(want!==VM32.key){if(want==='sb'&&P.swT>=0){VM32.key=want;VM32.sw=1}else{VM32.sw-=dt/.16;if(VM32.sw<=0){VM32.key=want;VM32.sw=0;VM32.boltS=0}}}else VM32.sw=Math.min(1,VM32.sw+dt/.3);
 const R=VM32.R[VM32.key]||VM32.R.P;hide32();R.root.visible=true;const k=R.k,w=P.weapons&&P.weapons[P.cur]||{cd:.4,mag:1,max:1};
 /* movimiento del jugador */const pp=P.g.position;if(!VM32.lp)VM32.lp=pp.clone();let sp=Math.hypot(pp.x-VM32.lp.x,pp.z-VM32.lp.z)/dt;if(sp>30)sp=0;VM32.lp.copy(pp);VM32.spd+=(Math.min(sp,10)-VM32.spd)*Math.min(1,dt*8);
 const gnd=P.gnd!==false,mv=Math.min(1,VM32.spd/6),rl=P.rel>0&&P.reloading===P.cur&&P.rld>0?1-P.rel/P.rld:-1;
 const bw=VM32.boltS&&P.cd>0&&P.cur==='rifle'&&R.k==='r'?Math.sin(clamp(1-P.cd/(w.cd||.42),0,1)*Math.PI):0;
 const run=gnd&&rl<0&&!(P.aim>0)&&!(VM32.fxT>0)&&(VM32.spd>7.3||((keys.ShiftLeft||(tmOn&&Math.hypot(tm.x,tm.y)>.92))&&VM32.spd>2.5));
 VM32.runK+=((run?1:0)-VM32.runK)*Math.min(1,dt*7);const rk=VM32.runK;VM32.aimK+=((P.aim>0&&!run&&rl<0&&k!=='b'?1:0)-VM32.aimK)*Math.min(1,dt*13);const aimK=VM32.aimK*(1-.55*bw);
 if(VM32.air&&gnd)VM32.ldv=(VM32.ldv||0)+Math.min(1.2,Math.max(0,-VM32.vyp)/12)*3;VM32.air=!gnd;VM32.vyp=P.vy||0;VM32.ld=VM32.ld||0;VM32.ldv=(VM32.ldv||0)+(-90*VM32.ld-12*VM32.ldv)*dt;VM32.ld+=VM32.ldv*dt;
 if(typeof V16!=='undefined'&&V16.bob!==undefined)VM32.bob=V16.bob;else if(gnd)VM32.bob+=dt*VM32.spd*1.25;const bob=VM32.bob;
 /* inercia de giro (muelle) */const dyw=VM32.ly===null?0:angD12(yaw,VM32.ly),dpt=VM32.lx===null?0:pitch-VM32.lx;VM32.ly=yaw;VM32.lx=pitch;const Wsw=R.W.sw*(1-aimK*.6);
 VM32.svx+=clamp(dyw,-.3,.3)*9*Wsw;VM32.svy+=clamp(dpt,-.3,.3)*9*Wsw;for(let i=0;i<2;i++){const h=dt/2;VM32.svx+=(-70*VM32.sx-10*VM32.svx)*h;VM32.sx+=VM32.svx*h;VM32.svy+=(-70*VM32.sy-10*VM32.svy)*h;VM32.sy+=VM32.svy*h;VM32.rv+=(-160*VM32.rk-17*VM32.rv)*h;VM32.rk+=VM32.rv*h}
 const sx=clamp(VM32.sx,-.25,.25),sy=clamp(VM32.sy,-.2,.2);VM32.fl=Math.max(0,VM32.fl-dt*3.2);VM32.fxT-=dt;VM32.trT-=dt;VM32.sl*=Math.pow(.00005,dt);
 const lift=Math.min(ez32(VM32.sw),level>=13&&VM13.lift!==undefined?VM13.lift:1);
 /* base: cadera ↔ puntería */const H=R.hip,A=R.aim;let px=H[0]+(A[0]-H[0])*aimK,py=H[1]+(A[1]-H[1])*aimK,pz=H[2]+(A[2]-H[2])*aimK,rx=0,ry=.05*(1-aimK),rz=0;
 if(k==='b'){rx-=.6;rz+=.35;ry-=.1}const ia=1-.75*aimK;py+=Math.sin(t*1.6)*.0022*ia;rx+=Math.sin(t*1.6+.8)*.006*ia;ry+=(Math.sin(t*.43)+.6*Math.sin(t*.97+1.3))*.006*ia;rz+=(Math.sin(t*.31+.5)+.5*Math.sin(t*.83))*.008*ia;
 const ba=mv*(1+rk*.9)*(1-aimK*.75)*(gnd?1:.15);px+=Math.cos(bob-.3)*.012*ba;py+=Math.sin(bob*2-.7)*.009*ba;rz+=Math.cos(bob)*.028*ba;rx+=Math.sin(bob*2-.4)*.014*ba;ry+=Math.cos(bob-.3)*.01*ba;
 if(!gnd){py+=clamp(-(P.vy||0)*.002,-.02,.03);rx+=clamp((P.vy||0)*.004,-.05,.05)}
 if(k==='p'){px-=.01*rk;py-=.06*rk;pz+=.04*rk;rx-=.75*rk;ry+=.25*rk;rz+=.15*rk}else if(k==='v'){py-=.05*rk;rx-=.6*rk}else if(k==='b'){py-=.04*rk;rx+=.35*rk;rz-=.2*rk}else{px-=.05*rk;py+=.005*rk;pz+=.02*rk;rx-=.22*rk;ry+=.7*rk;rz+=.5*rk}
 px+=sx*.05;ry+=sx*.6;rz+=sx*.3;py-=sy*.035;rx+=sy*.5;py-=VM32.ld*.05;rx-=VM32.ld*.1;py-=(1-lift)*.32;rx-=(1-lift)*.8;
 if(VM32.thr>=0){VM32.thr+=dt;const q=win32(VM32.thr,0,.12,.45,.62);py-=.14*q;rx-=.35*q;px+=.04*q;rz-=.3*q;thrArm32(VM32.thr);if(VM32.thr>.62){VM32.thr=-1;VM32.TA.visible=false}}
 /* cuerpo a cuerpo */let mel=0;
 if(P.bt>=0&&k==='r'&&typeof BY!=='undefined'){const S=BY[P.bs]||BY[0],u=P.bt/S.d;mel=1;if(S.k==='s'){const a=u<.35?ez32(u/.35):1-ez32((u-.35)/.08),b=win32(u,.35,.5,.58,1);pz+=.06*a-.3*b;px-=.07*b;py+=.03*b-.01*a;ry-=.05*b;rx+=.05*b}
  else{const a=win32(u,0,.3,.3,.32),b=win32(u,.28,.55,.62,1);ry+=-.5*a+1.45*b;rz+=.25*a+.7*b;px+=.05*a-.18*b;pz-=.12*b;py+=.04*b;rx+=.2*b}}
 else if(P.swT>=0&&k==='b'&&typeof SW!=='undefined'){const S=SW[P.sc]||SW[0],u=P.swT/S.d;mel=1;if(S.k==='h'){const s=S.a0<0?1:-1,a=ez32(u/.2),b=ez32((u-.2)/.3),c=ez32((u-.5)/.5),m=u<.2?a:u<.5?1:1-c;
   const sw_=u<.2?s:u<.5?s-2*s*b:-s;px+=(sw_*.22)*m;py+=.06*m;rx+=-1.35*m;ry+=sw_*1.05*m;rz+=s*.35*m;pz-=.08*m*(u>.2&&u<.5?1:.4)}
  else{const a=ez32(u/.4),b=ez32((u-.4)/.15),c=ez32((u-.55)/.45),m=u<.55?1:1-c;const ang=u<.4?.7*a:.7-2.6*b;rx+=ang*m;py+=(u<.4?.12*a:.12-.3*b)*m;px-=.12*m;pz-=.05*m}}
 else if(P.swT>=0&&k!=='b'){const S=typeof SW!=='undefined'&&SW[P.sc]||{d:.42},u=P.swT/S.d,m=win32(u,0,.25,.4,1);mel=1;pz-=.18*m;rx-=.5*m;px-=.06*m;rz+=.3*m}
 R.root.position.set(px,py-VM32.fl*.03,pz);R.root.rotation.set(rx,ry,rz);
 const rkk=VM32.rk;R.kick.position.set(0,rkk*.012,rkk*.07*R.W.kz);R.kick.rotation.set(rkk*.2*R.W.kr+VM32.fl*.16,VM32.rz*rkk*.05+VM32.fl*VM32.flx*.1,VM32.rz*rkk*.07+VM32.fl*VM32.flx*.2);
 /* restablecer piezas */const g=R.gun;g.position.set(0,0,0);g.rotation.set(0,0,0);R.piv.rotation.set(0,0,0);if(R.lh){R.lh.position.set(0,0,0);R.lh.rotation.set(0,0,0);R.lh.visible=true}if(R.rh){R.rh.visible=true}
 for(const n in R.b){R[n].position.copy(R.b[n]);R[n].rotation.set(0,0,0)}if(R.rhB)R.rhB.visible=false;if(R.lh2)R.lh2.visible=false;if(R.clip)R.clip.visible=false;if(R.mag)R.mag.visible=true;if(R.nmag)R.nmag.visible=false;if(R.bay)R.bay.visible=level<=12||!!(VM32.pal.bay&&VM32.pal.bay[level]);
 if(R.trig)R.trig.rotation.x=VM32.trT>0?.35:0;
 /* fogonazo */const fon=VM32.fxT>0&&!mel;if(R.gs){for(const f of R.fxs)f.visible=false;if(fon)R.fx.visible=true}else R.fx.visible=fon;R.fl.visible=fon;if(VM13.lt)VM13.lt.intensity=fon?2.6:0;
 if(k==='r')rifleMech32(R,rl,w);else if(k==='s')smgMech32(R,rl,w);else if(k==='p')pistolMech32(R,rl,w);else if(k==='v')revMech32(R,rl,dt,aimK);
 /* inspección */const ins=level>=13?(VM13.ins||0):VM32.ins;if(level<=12&&VM32.ins>0)VM32.ins-=dt;if(ins>0&&rl<0&&!mel){const u=1-ins/2.4,s=Math.sin(Math.min(1,u)*Math.PI),s2=win32(u,.35,.45,.6,.7);g.rotation.y+=s*.85;g.rotation.z+=s*.4;g.rotation.x+=s2*.25;g.position.x-=s*.05;g.position.y+=s*.02;
  if(k==='r'&&R.bolt){R.bolt.rotation.z=s2*1.25;R.bolt.position.z=R.b.bolt.z+s2*.035;if(s2>0){R.rh.visible=false;R.rhB.visible=true}}if(k==='p'&&R.slide)R.slide.position.z=s2*.012;if(k==='s'&&R.mag)R.mag.position.y=R.b.mag.y-Math.sin(s2*Math.PI)*.006}}
function thrArm32(u){const A=VM32.TA;if(!A)return;A.visible=u<.6;const gr=A.userData.gr;gr.visible=u<.34;let x,y,z,r;if(u<.25){const q=ez32(u/.25);x=-.26+.08*q;y=-.42+.4*q;z=-.28;r=.7*q}else if(u<.4){const q=ez32((u-.25)/.15);x=-.18+.12*q;y=-.02+.04*q;z=-.28-.3*q;r=.7-1.5*q}else{const q=ez32((u-.4)/.2);x=-.06-.15*q;y=.02-.45*q;z=-.58+.2*q;r=-.8}A.position.set(x,y,z);A.rotation.set(r,.2,0)}
/* fusil: ciclo de cerrojo tras cada disparo (levantar, atrás —sale la vaina—, adelante, abajo) dentro del tiempo de recarga del disparo; recarga con peine */
function rifleMech32(R,rl,w){const g=R.gun,bo=R.bolt,b0=R.b.bolt,K=R.knob;let lift=0,back=0,hand=false,appr=0;
 if(rl>=0){const tl=ez32(rl/.12)*(1-ez32((rl-.9)/.1));g.rotation.set(.1*tl,-.15*tl,.38*tl);g.position.set(-.03*tl,-.025*tl,-.07*tl);
  lift=win32(rl,.1,.15,.84,.89);back=win32(rl,.15,.24,.76,.84);hand=rl>.06&&rl<.95;appr=1-win32(rl,.06,.1,.9,.95);
  const out=win32(rl,.2,.3,.7,.8);R.lh.position.set(-.05*out,-.32*out,.12*out);R.lh.visible=!(rl>.3&&rl<.7);
  if(rl>.28&&rl<.72){const up=win32(rl,.28,.38,.62,.72),pr=rl>.42&&rl<.62?Math.max(0,Math.sin((rl-.42)/.2*Math.PI*3))*.012:0;R.lh2.visible=true;R.lh2.position.set(-.08*(1-up),-.32*(1-up)-pr,.1*(1-up))}
  if(rl>.28&&rl<.86){const c=R.clip;c.visible=true;if(rl<.4)c.position.add(R.lh2.position);R.rnds.position.y=-.052*ez32((rl-.42)/.2)-(rl>.42&&rl<.62?Math.max(0,Math.sin((rl-.42)/.2*Math.PI*3))*.004:0);if(rl>.76){const f=ez32((rl-.76)/.08);c.position.x+=.1*f;c.position.y+=.14*f;c.rotation.z=-1.6*f}}}
 else if(VM32.boltS&&P.cd>0&&P.cur==='rifle'){const u=clamp(1-P.cd/(w.cd||.42),0,1);lift=win32(u,.2,.3,.78,.88);back=win32(u,.3,.45,.6,.75);hand=u>.12&&u<.95;appr=1-win32(u,.12,.2,.88,.95);
  if(back>.85&&!VM32.ej){VM32.ej=true;eject32(R)}const s=Math.sin(u*Math.PI);g.rotation.z+=.07*s;g.rotation.x+=.03*s;g.position.y-=.008*s}
 else VM32.boltS=0;
 bo.rotation.z=lift*1.25;bo.position.z=b0.z+back*.075;if(hand){R.rh.visible=false;R.rhB.visible=true;R.rhB.rotation.z=-lift*.85;R.rhB.position.set(K.x-.015*appr,K.y-.059*appr,K.z+.07*appr)}}
/* subfusil / ametralladora: corredera en cada disparo; cambio de cargador táctico o con montaje del cerrojo si estaba vacío */
function smgMech32(R,rl,w){const g=R.gun,top=R.lmg;R.bolt.position.z=R.b.bolt.z+Math.min(1,VM32.sl*1.4)*.035;
 if(rl<0)return;const tl=ez32(rl/.12)*(1-ez32((rl-.88)/.12));g.rotation.set(.15*tl,.12*tl,(top?.25:-.4)*tl);g.position.y+=.02*tl;
 const dir=top?1:-1,out=rl<.12?0:rl<.3?ez32((rl-.12)/.18):rl<.45?1:rl<.62?1-ez32((rl-.45)/.17):0,grab=(R.drum||top)?win32(rl,.06,.13,.64,.72):1;
 R.mag.position.y=R.b.mag.y+dir*out*.3;R.mag.position.z=R.b.mag.z+out*.06;R.mag.visible=!(rl>.3&&rl<.45);
 const gx=(R.drum||top)?(top?-.05:-.035)*grab:0,gy=(R.drum||top)?(top?.12:.0)*grab:0,gz=(R.drum||top)?.22*grab:0;R.lh.position.set(gx,gy+dir*out*.3,gz+out*.06);
 if(rl>.62&&rl<.68)g.position.y+=.01*Math.sin((rl-.62)/.06*Math.PI);
 if(VM32.relE){const ch=win32(rl,.68,.74,.84,.9);R.lh.position.x+=ch*(.08-gx);R.lh.position.y+=ch*(.075-gy);R.lh.position.z+=ch*(.1-gz);R.bolt.position.z+=win32(rl,.75,.79,.81,.83)*.06;g.rotation.z+=ch*.25}
 else{const pt=win32(rl,.7,.75,.8,.86);R.lh.position.y-=pt*.012}}
/* pistola: corredera atrás al disparar y bloqueada con el cargador vacío; recarga táctica o con liberación de corredera */
function pistolMech32(R,rl,w){const g=R.gun,empty=w.mag<=0&&rl<0;R.slide.position.z=Math.min(1,VM32.sl*1.3)*.03+(empty?.03:0);
 if(rl<0)return;const tl=ez32(rl/.12)*(1-ez32((rl-.88)/.12));g.rotation.set(.25*tl,0,.5*tl);
 if(rl>.12){const d=ez32((rl-.12)/.13);R.mag.position.y=R.b.mag.y-(rl<.72?d*.3:0);R.mag.visible=rl<.25||rl>.72}
 const out=win32(rl,.12,.3,.45,.66);R.lh.position.set(-.06*out,-.3*out,.06*out);R.nmag.visible=rl>.3&&rl<.72;if(rl>.6&&rl<.72)R.nmag.position.y=R.b.nmag.y+.03*ez32((rl-.6)/.12);
 if(VM32.relE){R.slide.position.z=.03*(rl<.84?1:1-ez32((rl-.84)/.04));R.lh.position.y+=.03*win32(rl,.76,.81,.83,.87)}}
/* revólveres: retroceso alterno, tambor que gira, recarga con tambores basculados y vainas que caen */
function revMech32(R,rl,dt,aimK){VM32.gk=VM32.gk||[0,0];VM32.gkv=VM32.gkv||[0,0];VM32.cyc=VM32.cyc||[0,0];const tl=rl>=0?ez32(rl/.12)*(1-ez32((rl-.88)/.12)):0,sw=rl>=0?win32(rl,.12,.2,.75,.85):0;
 if(rl<0)VM32.rvE=false;else if(rl>.22&&!VM32.rvE){VM32.rvE=true;eject32(R,6)}
 for(let i=0;i<2;i++){const G_=R.gs[i],sd=i?-1:1;VM32.gkv[i]+=(-170*VM32.gk[i]-15*VM32.gkv[i])*dt;VM32.gk[i]+=VM32.gkv[i]*dt;const gk=VM32.gk[i];
  VM32.cyc[i]+=(VM32.cy[i]-VM32.cyc[i])*Math.min(1,dt*18)+dt*12*sw;G_.cy.rotation.z=VM32.cyc[i];G_.cy.position.x=-sd*.032*sw;G_.hm.rotation.x=gk>.08?0:-.5*(1-Math.min(1,VM32.gk[i]*4));
  G_.g.position.set(sd*.13*(1-.3*aimK-.35*tl),gk*.01+.05*tl,gk*.03);G_.g.rotation.set(gk*.32+1.15*tl,sd*.04*(1-aimK),-sd*.05+sd*.35*tl)}}
/* ---------- enganches ---------- */
{const _v=vmUpd13;vmUpd13=function(dt){if(VM13.scene&&!VM32.built)vmBuild32();_v(dt);VM32.f13=VM32.frame;VM32.on=!!VM13.on;if(!VM13.on){if(VM32.built)hide32();return}if(VM32.err)return;try{vmPose32(dt)}catch(e){VM32.err=e;console.error('v32_vm',e)}}}
{const _i=vmInit13;vmInit13=function(){_i();vmBuild32()}}
vmShell13=function(){};vmCur13=function(){return VM32.R[VM32.key||vmKey32()]||VM32.R.P||VM13.P};
function vmTick32(dt){if(VM32.cas.length||VM32.smk.length)fxUpd32(Math.min(dt,.05));if(VM32.f13===VM32.frame)return;
 const own=level<=12&&playing&&fpv&&!L9.cine&&!P.mg&&!P.veh&&!P.pzfOn&&!P.gun9&&!(level===12&&typeof L12!=='undefined'&&L12.tur)&&VM32.enabled!==false;
 VM32.own=own;VM32.on=own;if(!own){if(VM32.built)hide32();return}if(VM32.err)return;try{vmPose32(dt)}catch(e){VM32.err=e;console.error('v32_vm',e)}}
{const _u=update;update=function(dt){VM32.frame++;_u(dt);vmTick32(dt)}}
{const _r=rend.render;rend.render=function(s,c,...a){VM32.drew=false;_r.call(this,s,c,...a);if(s===scene&&VM32.on&&!VM32.drew&&VM32.built&&!VM32.err){VM13.cam.aspect=cam.aspect;VM13.cam.updateProjectionMatrix();const ac=this.autoClear;this.autoClear=false;this.clearDepth();_r.call(this,VM13.scene,VM13.cam);this.autoClear=ac}}}
{const _f=fire;fire=function(){const c=P.cur,w=P.weapons&&P.weapons[c],m0=w?w.mag:0,n0=bullets.length,r=_f.apply(this,arguments);if(w&&!P.mg&&(w.mag<m0||bullets.length>n0))try{shot32(c)}catch(e){console.error('v32_vm',e)}return r}}
{const _r=reload;reload=function(){const w=P.weapons&&P.weapons[P.cur],m0=w?w.mag:-1,full=w&&w.mag>=w.max,r0=P.rel;const r=_r.apply(this,arguments);if(P.rel>0&&!(r0>0))VM32.relE=m0===0;else if(full&&level<=12&&fpv&&playing&&!(P.rel>0)&&P.cur!=='sword')VM32.ins=2.4;return r}}
{const _g=throwG;throwG=function(){const n=P.grenades,r=_g.apply(this,arguments);if(P.grenades<n&&VM32.on){VM32.thr=0;if(VM32.TA)VM32.TA.visible=true}return r}}
{const _h=hitP;hitP=function(d){const h=P.hp,r=_h.apply(this,arguments);if(P.hp<h){VM32.fl=Math.min(1,.5+(h-P.hp)/30);VM32.flx=rnd32()<.5?-1:1}return r}}
