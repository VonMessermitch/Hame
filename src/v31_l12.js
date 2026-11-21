/* =====================================================================
   v31 · Nivel 12 «Operación Cielo de Acero»: arquitectura de Falkenhorst y de la ciudad industrial
   (aditivo: marcos, contraventanas, dinteles, cornisas, tejados a dos aguas, chimeneas, canalones,
    puertas con escalón, letreros, faroles, raíles y celosías del hangar, depósitos; en la ciudad,
    tejados, chimeneas, almenas, lucernarios, daños de bombardeo, escombros y cráteres)
   ===================================================================== */
/* caja orientada sobre una fachada: (x,z) punto de la fachada, (nx,nz) normal exterior (eje), u a lo largo, y altura, o hacia fuera */
function ob31_12(q,x,z,nx,nz,u,y,o,w,h,d,c,rx,rz){if(nx)pBox(q,d,h,w,c,x+nx*o,y,z+u,rx||0,0,rz||0);else pBox(q,w,h,d,c,x+u,y,z+nz*o,rx||0,0,rz||0)}
/* ventana con marco, alféizar, dintel, parteluz y contraventanas opcionales */
function win31_12(q,x,z,nx,nz,u,y,w,h,o){o=o||{};const fr=o.fr||0xd8d0c0,gl=o.gl||0x1a2430;
 ob31_12(q,x,z,nx,nz,u,y,.04,w,h,.08,gl);
 ob31_12(q,x,z,nx,nz,u-w/2-.06,y,.08,.12,h+.12,.12,fr);ob31_12(q,x,z,nx,nz,u+w/2+.06,y,.08,.12,h+.12,.12,fr);ob31_12(q,x,z,nx,nz,u,y+h/2+.04,.08,w+.24,.1,.12,fr);
 ob31_12(q,x,z,nx,nz,u,y,.1,.07,h,.06,fr);ob31_12(q,x,z,nx,nz,u,y+h*.15,.1,w,.06,.06,fr);
 if(!o.noSill)ob31_12(q,x,z,nx,nz,u,y-h/2-.06,.14,w+.4,.1,.28,o.sill||0xb8ae98);
 if(!o.noLin)ob31_12(q,x,z,nx,nz,u,y+h/2+.2,.1,w+.5,.24,.2,o.lin||0xb8ae98);
 if(o.sh){for(const s of[-1,1]){const a=o.open===false?0:1;ob31_12(q,x,z,nx,nz,u+s*(w*.75+.05),y,.09,w*.5,h,.06,o.sh);ob31_12(q,x,z,nx,nz,u+s*(w*.75+.05),y,.13,w*.5,.05,.04,shade(o.sh,.7))}}}
/* puerta con jambas, dintel, escalón y tejadillo; farol (brillo) opcional */
function door31_12(q,qg,x,z,nx,nz,u,w,h,o){o=o||{};const fr=o.fr||0xb8ae98,lf=o.lf||0x3a2818;
 ob31_12(q,x,z,nx,nz,u,h/2+.05,.05,w,h,.1,lf);ob31_12(q,x,z,nx,nz,u,h*.5,.1,.06,h*.9,.04,shade(lf,.7));
 for(const s of[-1,1])ob31_12(q,x,z,nx,nz,u+s*(w/2+.12),h/2+.05,.08,.24,h+.1,.18,fr);ob31_12(q,x,z,nx,nz,u,h+.25,.1,w+.8,.3,.24,fr);
 ob31_12(q,x,z,nx,nz,u+w*.3,h*.5,.12,.08,.08,.06,0xc8a040);
 ob31_12(q,x,z,nx,nz,u,.1,.45,w+1,.2,.9,0x8a8478);if(o.steps)ob31_12(q,x,z,nx,nz,u,.05,.9,w+1.2,.1,1,0x7a766c);
 if(o.canopy){ob31_12(q,x,z,nx,nz,u,h+.75,.7,w+1.4,.1,1.4,o.canopy,nx?0:(nz>0?.18:-.18),nx?(nx>0?-.18:.18):0);for(const s of[-1,1])ob31_12(q,x,z,nx,nz,u+s*(w/2+.5),h+.45,.45,.08,.6,.9,0x2a2a2a,nx?0:(nz>0?-.6:.6),nx?(nx>0?.6:-.6):0)}
 if(o.lamp&&qg){ob31_12(q,x,z,nx,nz,u+(o.lampU||0),h+(o.canopy?1.25:.7),.25,.08,.08,.5,0x2a2a2a);ob31_12(q,x,z,nx,nz,u+(o.lampU||0),h+(o.canopy?1.05:.5),.45,.22,.3,.22,0x2a2a2a);ob31_12(qg,x,z,nx,nz,u+(o.lampU||0),h+(o.canopy?1.03:.48),.45,.16,.22,.16,0xffd890)}}
/* tejado a dos aguas: cumbrera a lo largo de 'x' o 'z'; muros de L (a lo largo) × S (luz), alero y0, altura de cumbrera rise */
function roof31_12(q,cx,cz,y0,L,S,rise,ax,rc,wc,o){o=o||{};const ov=o.ov===undefined?.45:o.ov,hs=S/2,a=Math.atan2(rise,hs),hh=hs+ov,ta=Math.tan(a),sl=hh/Math.cos(a)+.1,Lr=L+(o.ovL===undefined?.8:o.ovL),th=.22;
 for(const s of[-1,1]){const yc=y0+rise-hh/2*ta+th/2;if(ax==='x')pBox(q,Lr,th,sl,rc,cx,yc,cz+s*hh/2,s*a,0,0);else pBox(q,sl,th,Lr,rc,cx+s*hh/2,yc,cz,0,0,-s*a);
  const n=o.strips===undefined?4:o.strips;for(let k=1;k<=n;k++){const d=hh*k/(n+1),y=y0+rise-d*ta+th+.03;if(ax==='x')pBox(q,Lr,.06,.1,shade(rc,.72),cx,y,cz+s*d,s*a,0,0);else pBox(q,.1,.06,Lr,shade(rc,.72),cx+s*d,y,cz,0,0,-s*a)}
  if(o.gutter){const gy=y0-ov*ta-.05;if(ax==='x')pCyl(q,.1,.1,Lr,o.gutter,cx,gy,cz+s*(hh+.08),0,0,1.5708,6);else pCyl(q,.1,.1,Lr,o.gutter,cx+s*(hh+.08),gy,cz,1.5708,0,0,6)}}
 if(ax==='x')pBox(q,Lr+.1,.24,.34,shade(rc,.6),cx,y0+rise+.2,cz);else pBox(q,.34,.24,Lr+.1,shade(rc,.6),cx,y0+rise+.2,cz);
 if(wc!==null){const n=6;for(const e of[-1,1])for(let i=0;i<n;i++){const ww=S*(1-(i+.5)/n),hy=y0+rise/n*(i+.5);if(ax==='x')pBox(q,.3,rise/n+.02,ww,wc,cx+e*(L/2-.15),hy,cz);else pBox(q,ww,rise/n+.02,.3,wc,cx,hy,cz+e*(L/2-.15))}}}
/* chimenea de ladrillo con cornisa y cañones */
function chim31_12(q,x,y0,z,w,h,c,pots){pBox(q,w,h,w*.8,c,x,y0+h/2,z);pBox(q,w+.25,.2,w*.8+.25,shade(c,.75),x,y0+h-.3,z);pBox(q,w+.3,.16,w*.8+.3,0x8a8478,x,y0+h+.08,z);for(let i=0;i<(pots||0);i++)pCyl(q,.13,.16,.5,0x8a4a30,x-(pots-1)*.2+i*.4,y0+h+.4,z,0,0,0,6)}
/* bajante pluvial con codo */
function pipe31_12(q,x,z,h,c){pCyl(q,.07,.07,h,c,x,h/2,z,0,0,0,5);pBox(q,.2,.12,.2,c,x,.1,z)}
/* hilera de sacos terreros (cobertura) */
function sand31_12(q,x,z,len,ry,rows){const cs=Math.cos(ry),sn=Math.sin(ry),n=Math.max(1,Math.round(len/1.05));for(let r=0;r<rows;r++)for(let i=0;i<n-(r%2);i++){const u=(i-(n-1)/2+(r%2)*.5)*1.05;pBox(q,1.1,.42,.62,[0xa89c78,0x988c6a,0xb0a482][(i+r)%3],x+cs*u,.21+r*.4,z-sn*u,0,ry+(R()-.5)*.12,0)}}
/* cajas apiladas (cobertura) */
function crate31_12(q,x,z,n){const C_=[0x6a5a3a,0x5a6a3a,0x6a5030];for(let i=0;i<n;i++){const k=i%3,l=(i/3|0);pBox(q,1.1,.85,.95,C_[i%3],x+k*1.15-(l?.0:0)+l*.55,.43+l*.86,z+(R()-.5)*.1,0,(R()-.5)*.2,0);pBox(q,.9,.12,.02,0x2a2418,x+k*1.15+l*.55,.43+l*.86,z+.48)}}
/* carretilla de mano / carro */
function cart31_12(q,x,z,ry){const cs=Math.cos(ry),sn=Math.sin(ry);pBox(q,1.6,.5,1.1,0x5a4630,x,.75,z,0,ry,0);pBox(q,1.7,.08,1.2,0x4a3a28,x,.5,z,0,ry,0);for(const s of[-1,1])pCyl(q,.4,.4,.08,0x2a2a2a,x+sn*s*.6,.4,z+cs*s*.6,1.5708,ry,0,10);for(const s of[-1,1])pBox(q,1.6,.06,.06,0x4a3a28,x-cs*1.4+sn*s*.4,.85,z+sn*1.4+cs*s*.4,0,ry,-.15)}

function deco31_12(){const X=X12,W=WORLD12,q=PB(),qg=PB();
 const BR=0x7a4434,ST=0xb8ae98,DS=0x5a564e,GU=0x3a3a36,TI=0x6a3a2c,SL=0x4a4c52,WO=0x4a3624,SH=0x3a4a3a;
 /* ---------- TORRE DE CONTROL (X+58,46; 10×12×10) ---------- */
 {const x0=X+58,z0=46;
  pBox(q,10.5,.7,10.5,DS,x0,.35,z0);for(const y of[4,8])pBox(q,10.35,.24,10.35,ST,x0,y,z0);
  for(const a of[-1,1])for(const b of[-1,1])for(let k=0;k<12;k++)pBox(q,k%2?.75:.55,.5,k%2?.55:.75,ST,x0+a*4.92,.95+k*.95,z0+b*4.92);
  const F=[[1,0],[-1,0],[0,1],[0,-1]];
  for(const [nx,nz] of F){const fx=x0+nx*5,fz=z0+nz*5;for(let f=0;f<3;f++){const y=2+f*4;ob31_12(q,fx,fz,nx,nz,0,y+.95,.1,7.5,.26,.22,ST);if(nx)ob31_12(q,fx,fz,nx,nz,0,y-.75,.1,7.3,.12,.28,ST);for(let i=0;i<6;i++)ob31_12(q,fx,fz,nx,nz,-3.5+i*1.4,y,.06,.1,1.4,.08,0xd8d0c0);ob31_12(q,fx,fz,nx,nz,0,y+.35,.06,7,.07,.08,0xd8d0c0);ob31_12(q,fx,fz,nx,nz,-3.55,y,.06,.1,1.4,.08,0xd8d0c0);ob31_12(q,fx,fz,nx,nz,3.55,y,.06,.1,1.4,.08,0xd8d0c0)}}
  /* portal en la cara -x (hacia la plataforma) */ ob31_12(q,x0-5,z0,-1,0,0,1.55,.08,2.8,3.1,.16,ST);door31_12(q,qg,x0-5,z0,-1,0,0,1.5,2.4,{steps:1,canopy:0x3a3a36,lamp:1,lf:0x2e3a2e});
  ob31_12(q,x0-5,z0,-1,0,0,4.9,.12,4.6,.7,.08,0x22261e);for(let i=0;i<9;i++)ob31_12(q,x0-5,z0,-1,0,-1.9+i*.48,4.9,.17,.3,.34,.02,0xe0d8c0);
  /* galería y cabina acristalada */ for(const [nx,nz] of F){const fx=x0+nx*5.4,fz=z0+nz*5.4;ob31_12(q,fx,fz,nx,nz,0,13.35,0,10.9,.08,.08,0x2a2a2a);ob31_12(q,fx,fz,nx,nz,0,12.85,0,10.9,.05,.05,0x2a2a2a);for(let i=0;i<8;i++)ob31_12(q,fx,fz,nx,nz,-5.4+i*1.54,12.85,0,.07,1,.07,0x2a2a2a);
   const gx=x0+nx*4.5,gz=z0+nz*4.5;for(let i=0;i<7;i++)ob31_12(q,gx,gz,nx,nz,-4.5+i*1.5,13.7,.04,.14,2.6,.1,0xe8e4d8);ob31_12(q,gx,gz,nx,nz,0,12.5,.06,9.1,.3,.12,0xe8e4d8);ob31_12(q,gx,gz,nx,nz,0,14.4,.04,9.1,.08,.1,0xe8e4d8);
   for(let i=0;i<6;i++)ob31_12(q,x0+nx*5.15,z0+nz*5.15,nx,nz,-4.5+i*1.8,12.15,0,.12,.35,.3,ST)}
  pa(q,gCone(7.3,1.5,4),0x3a3a36,x0,16.15,z0,0,.785);pCyl(q,.3,.3,.4,0x8a8a80,x0,17,z0,0,0,0,8);pCyl(qg,.22,.22,.3,0xff4020,x0+3,22.1,z0,0,0,0,6);pCyl(q,.25,.25,.08,0x2a2a2a,x0+3,21.9,z0,0,0,0,6);
  /* escalera exterior: zancas y barandilla */ {const dx=x0+5.7,ln=Math.hypot(7.7,11),ang=-Math.atan2(11,7.7);for(const s of[-.75,.75])pBox(q,.1,.3,ln,0x3a3a36,dx+s,5.6,z0-.15,ang,0,0);pBox(q,.06,.06,ln,0x2a2a2a,dx+.75,6.6,z0-.15,ang,0,0);for(let i=0;i<6;i++)pBox(q,.06,1,.06,0x2a2a2a,dx+.75,1.1+i*2,z0-4+i*1.4);pBox(q,1.6,.2,1.6,0x5a4a3a,dx,11.2,z0+4.4)}
  pipe31_12(q,x0-5.1,z0+5.1,12,GU);pipe31_12(q,x0+5.1,z0-5.1,12,GU);
  /* cobertura junto a la torre */ sand31_12(q,x0-9,z0-8,4.2,0,3);crate31_12(q,x0+7,z0-8.5,5);bOb({x:x0-9,z:z0-8,hw:2.2,hd:.4,h:1.2});bOb({x:x0+8.2,z:z0-8.5,hw:1.8,hd:.55,h:1.7})}
 /* ---------- CUARTEL (X+75,96; 32×5×10) ---------- */
 {const x0=X+75,z0=96;pBox(q,32.3,.55,10.3,DS,x0,.27,z0);pBox(q,32.2,.2,10.2,ST,x0,4.8,z0);
  roof31_12(q,x0,z0,5.5,32,10,2.6,'x',TI,BR,{ov:.6,strips:5,gutter:GU});
  for(const cx of[-10,0,10])chim31_12(q,x0+cx,6.5,z0+1.4,1,3.4,BR,2);
  for(const s of[-1,1])for(const a of[-1,1])pipe31_12(q,x0+a*16.05,z0+s*5.12,5.2,GU);
  for(let i=0;i<8;i++){const u=-13+i*3.8;win31_12(q,x0,z0-5,0,-1,u,2.6,1.4,1.6,{sh:SH,noSill:1});win31_12(q,x0,z0+5,0,1,u,2.6,1.4,1.6,{sh:SH})}
  for(const e of[-1,1])for(const u of[-2.2,2.2])win31_12(q,x0+e*16,z0,e,0,u,2.6,1.2,1.5,{sh:SH});
  for(const e of[-1,1]){win31_12(q,x0+e*16,z0,e,0,0,6.6,.8,.8,{noSill:1,noLin:1})}
  door31_12(q,qg,x0,z0-5,0,-1,0,1.8,2.6,{steps:1,canopy:0x3a3a36,lamp:1,lampU:1.6});
  ob31_12(q,x0,z0-5,0,-1,0,4.25,.1,5,.6,.1,0x22261e);for(let i=0;i<7;i++)ob31_12(q,x0,z0-5,0,-1,-1.8+i*.6,4.25,.16,.36,.3,.02,0xe0d8c0);
  for(const u of[-14,14])door31_12(q,null,x0,z0+5,0,1,u,1.2,2.3,{});
  /* cobertura: sacos y cajas frente a la fachada */ sand31_12(q,x0-9,z0-9.2,6.3,0,3);sand31_12(q,x0+9,z0-9.2,6.3,0,3);crate31_12(q,x0+17.5,z0-7,6);cart31_12(q,x0-18,z0-6.5,.4);
  bOb({x:x0-9,z:z0-9.2,hw:3.3,hd:.4,h:1.2});bOb({x:x0+9,z:z0-9.2,hw:3.3,hd:.4,h:1.2});bOb({x:x0+18.7,z:z0-7,hw:1.8,hd:.55,h:1.7})}
 /* ---------- COMEDOR (X+30,112; 18×4×9, madera) ---------- */
 {const x0=X+30,z0=112;pBox(q,18.3,.45,9.3,DS,x0,.22,z0);roof31_12(q,x0,z0,4.35,18,9,2.2,'x',SL,0x5a4630,{ov:.5,strips:4,gutter:GU});
  pCyl(q,.2,.2,3.6,0x2a2a2a,x0+5,6.4,z0-1.5,0,0,0,6);pa(q,gCone(.45,.4,6),0x2a2a2a,x0+5,8.4,z0-1.5);
  for(let i=0;i<4;i++){const u=-6.6+i*4.4;if(i!==2)win31_12(q,x0,z0-4.5,0,-1,u,2.2,1.2,1.3,{sh:0x6a3a22,fr:0xe0d8c0});win31_12(q,x0,z0+4.5,0,1,u,2.2,1.2,1.3,{sh:0x6a3a22,fr:0xe0d8c0})}
  for(const s of[-1,1])for(const a of[-1,1])pBox(q,.25,4.1,.25,0x3a2818,x0+a*9.02,2.05,z0+s*4.52);
  door31_12(q,qg,x0,z0-4.5,0,-1,2.2,1.6,2.4,{steps:1,canopy:0x4a3a28,lamp:1,fr:0xe0d8c0,lf:0x5a3a22});
  ob31_12(q,x0,z0-4.5,0,-1,-1.8,3.6,.1,3.2,.55,.08,0x6a2a1a);for(let i=0;i<7;i++)ob31_12(q,x0,z0-4.5,0,-1,-3.1+i*.44,3.6,.15,.26,.26,.02,0xe8d8a0);
  for(let i=0;i<3;i++)pCyl(q,.4,.4,1.1,0x6b4a2a,x0-11+i*.85,.55,z0-2,0,0,0,10);cart31_12(q,x0+12,z0-1,1.2);crate31_12(q,x0-11.5,z0+3,4);bOb({x:x0-10.2,z:z0-2,hw:1.3,hd:.45,h:1.1});bOb({x:x0-10.5,z:z0+3,hw:1.8,hd:.55,h:1.7})}
 /* ---------- ESTACIÓN (X+128,-60; 10×3.4×6) con andén y marquesina ---------- */
 {const x0=X+128,z0=-60;pBox(q,10.3,.45,6.3,DS,x0,.22,z0);roof31_12(q,x0,z0,3.4,10,6,1.9,'x',TI,BR,{ov:.5,strips:3,gutter:GU});chim31_12(q,x0-2.5,4.2,z0+.8,.8,2.4,BR,1);
  for(const u of[-3,3]){win31_12(q,x0,z0-3,0,-1,u,1.9,1.1,1.3,{sh:SH});win31_12(q,x0,z0+3,0,1,u,1.9,1.1,1.3,{sh:SH})}win31_12(q,x0+5,z0,1,0,-1.6,1.9,1,1.3,{});door31_12(q,qg,x0+5,z0,1,0,1.2,1.3,2.3,{lamp:1});door31_12(q,null,x0,z0-3,0,-1,0,1.4,2.3,{steps:1});
  /* andén (bajo, sin colisión) y marquesina */ pBox(q,5,.35,22,0x8a8478,X+135.8,.17,-58);pBox(q,.3,.06,22,0xd8d0c0,X+138.15,.36,-58);
  for(let i=0;i<4;i++){pCyl(q,.1,.12,3.4,0x2a3a2a,X+137.2,1.7,-66+i*5.3,0,0,0,6);pBox(q,.1,.6,.1,0x2a3a2a,X+136.6,3.2,-66+i*5.3,0,0,.8)}pBox(q,4.4,.12,18,0x3a3a36,X+135.6,3.55,-58,0,0,-.1);pBox(q,4.4,.2,.1,0x2a2a2a,X+135.6,3.4,-49);
  for(let i=0;i<9;i++)pBox(q,.1,.1,18,0x2a2a2a,X+133.7+i*.45,3.62+(4-i)*.045,-58,0,0,-.1);
  pBox(q,.1,.7,5.2,0x22261e,X+137.9,3.05,-58);for(let i=0;i<11;i++)pBox(q,.03,.32,.3,0xe0d8c0,X+137.97,3.05,-60.3+i*.46);
  pCyl(q,.45,.45,.1,0xe8e4d8,X+137.9,2.45,-63,0,0,1.5708,12);pBox(q,.04,.3,.04,0x1a1a1a,X+137.96,2.5,-63);
  for(let i=0;i<4;i++)pBox(qg,.2,.25,.2,0xffd890,X+137.2,3.25,-63.4+i*5.3);
  cart31_12(q,X+135.5,-53,1.57);crate31_12(q,X+134.2,-66,4)}
 /* ---------- PLANTA DE HIDRÓGENO: caseta (X-160,-110; 10×5×8) ---------- */
 {const x0=X-160,z0=-110;pBox(q,10.3,.5,8.3,DS,x0,.25,z0);roof31_12(q,x0,z0,5,10,8,2,'x',SL,BR,{ov:.5,strips:3,gutter:GU});chim31_12(q,x0+3,6,z0-1,.7,2.2,BR,1);
  for(const u of[-2.5,2.5]){win31_12(q,x0,z0-4,0,-1,u,2.8,1.1,1.4,{});win31_12(q,x0,z0+4,0,1,u,2.8,1.1,1.4,{})}door31_12(q,qg,x0+5,z0,1,0,0,1.6,2.6,{steps:1,lamp:1,lf:0x4a4a42});
  ob31_12(q,x0+5,z0,1,0,0,3.6,.12,3.2,.9,.06,0xc02020);ob31_12(q,x0+5,z0,1,0,0,3.6,.16,2.8,.22,.02,0xe8e0d0);for(const s of[-1,1])pipe31_12(q,x0+s*5.1,z0-4.1,5,GU);
  for(let i=0;i<10;i++)pCyl(q,.18,.18,1.5,i%2?0x2a4a2a:0x8a2a1a,x0-4+i*.42,.75,z0+4.7,0,0,0,8);pBox(q,4.4,.08,.08,0x3a3a36,x0-2.1,1.2,z0+4.95)}
 /* ---------- CASETA DE RADIO (X+114,124; 4×3×4) ---------- */
 {const x0=X+114,z0=124;roof31_12(q,x0,z0,3,4,4,1.3,'z',SL,0x5a4630,{ov:.35,strips:2});win31_12(q,x0,z0+2,0,1,0,1.8,.9,.9,{sh:0x6a3a22});door31_12(q,qg,x0-2,z0,-1,0,0,1,2.2,{lamp:1});pCyl(q,.06,.06,1.4,0x2a2a2a,x0+1,5,z0,0,0,0,4);for(const s of[-1,1])pCyl(q,.08,.08,.2,0xd8d0c0,x0+1+s*.3,5.6,z0,0,0,0,6)}
 /* ---------- TALLER ABIERTO (X-55,70): cubierta a dos aguas con cerchas ---------- */
 {const x0=X-55,z0=70;roof31_12(q,x0,z0,6.15,26,14,2.6,'x',SL,null,{ov:.2,ovL:.4,strips:5,gutter:GU});
  for(let i=0;i<5;i++){const x=x0-12+i*6;const ang=Math.atan2(2.6,7);for(const s of[-1,1])pBox(q,.22,.22,7.4,0x4a3a2a,x,7.45,z0+s*3.5,s*ang,0,0);pBox(q,.2,2.6,.2,0x4a3a2a,x,7.45,z0);pBox(q,.18,.18,13.8,0x4a3a2a,x,6.2,z0)}
  for(let i=0;i<4;i++){pCyl(q,.02,.02,1.4,0x1a1a1a,x0-9+i*6,5.4,z0,0,0,0,4);pa(q,gCone(.35,.3,8),0x2a3a2a,x0-9+i*6,4.65,z0);pBox(qg,.18,.12,.18,0xffe0a0,x0-9+i*6,4.45,z0)}
  pBox(q,4.4,.8,.1,0x22261e,x0,5.4,z0-7.1);for(let i=0;i<8;i++)pBox(q,.3,.34,.02,0xe0d8c0,x0-1.7+i*.48,5.4,z0-7.17);
  crate31_12(q,x0+14.5,z0-5,5);sand31_12(q,x0-15,z0-4,3.2,1.5708,2);bOb({x:x0+15.7,z:z0-5,hw:1.8,hd:.55,h:1.7});bOb({x:x0-15,z:z0-4,hw:.4,hd:1.7,h:.8})}
 /* ---------- DEPÓSITOS DE COMBUSTIBLE (X+95; z -20,-31,-42) ---------- */
 {const x0=X+95;for(let i=0;i<3;i++){const z=-20-i*11;pa(q,gTor(4.05,.06,4,20),0x2a2a2a,x0,6.9,z,1.5708);for(let k=0;k<8;k++){const a=k/8*6.283;pBox(q,.06,.9,.06,0x2a2a2a,x0+Math.cos(a)*4.05,6.45,z+Math.sin(a)*4.05)}pa(q,gCone(4.1,1.1,14),0x6a665c,x0,6.15,z);
   for(const s of[-.3,.3])pBox(q,.07,6.4,.07,0x2a2a2a,x0-4.15,3.2,z+s);for(let k=0;k<12;k++)pBox(q,.05,.05,.6,0x2a2a2a,x0-4.15,.4+k*.5,z);for(const y of[1.5,4.5])pCyl(q,4.06,4.06,.12,shade(0x8a8478,.75),x0,y,z,0,0,0,14);
   pCyl(q,.25,.25,2.4,0x4a4a42,x0+4.6,.5,z,0,0,1.5708,6);pCyl(q,.35,.35,.06,0xb02020,x0+5.3,1,z,0,0,1.5708,8);pBox(q,1.4,.7,.06,0xe8e0d0,x0,3,z-4.05);pBox(q,1.1,.25,.07,0xb02020,x0,3,z-4.06)}
  pCyl(q,.3,.3,26,0x4a4a42,x0+5.8,.5,-31,1.5708,0,0,6);for(const s of[-1,1]){pBox(q,.4,.8,40,0x8a8478,x0+s*6.8,.4,-31);bOb({x:x0+s*6.8,z:-31,hw:.2,hd:20,h:.9})}pBox(q,14,.8,.4,0x8a8478,x0,.4,-51);bOb({x:x0,z:-51,hw:7,hd:.2,h:.9})}
 /* ---------- HANGAR GIGANTE (X-130): raíles, celosía en el frontón, rótulo, faroles, anexo, cumbrera ---------- */
 {const x0=X-130,zf=-115.5;for(const dz of[-.6,-1.8])pBox(q,82,.12,.18,0x5a5a5a,x0,.08,zf+dz);for(let i=0;i<41;i++)pBox(q,.3,.06,2,0x4a3a28,x0-40+i*2,.03,zf-1.2);
  for(const s of[-1,1])for(let i=0;i<3;i++)pBox(q,1.2,.6,.8,0x2a2a2a,x0+s*(21+i*6),.4,zf-.9);
  for(const y of[2,14,26,38])pBox(q,36,.5,.5,0x3a3e40,x0,y,zf-.6);for(let i=0;i<7;i++)pBox(q,.45,40,.5,0x3a3e40,x0-18+i*6,20,zf-.65);
  for(let i=0;i<6;i++)for(let j=0;j<3;j++){const cx=x0-15+i*6,cy=8+j*12,ln=Math.hypot(6,12),a=Math.atan2(6,12);pBox(q,.25,ln,.25,0x2e3234,cx,cy,zf-.75,0,0,(i+j)%2?a:-a)}
  for(const s of[-1,1])for(let i=0;i<3;i++){const cx=x0+s*(21+i*6)+s*1.5;const ln=Math.hypot(3,40),a=Math.atan2(3,40);pBox(q,.2,ln,.2,0x2a2e30,cx,20,zf-.75,0,0,a*(i%2?1:-1))}
  pBox(q,2.2,3.4,.2,0x2a2418,x0+27,1.7,zf-.75);for(const s of[-1,1])pBox(q,.25,3.6,.25,0xd8d0c0,x0+27+s*1.2,1.8,zf-.8);pBox(q,2.7,.25,.25,0xd8d0c0,x0+27,3.55,zf-.8);
  pBox(q,30,3,.3,0x22261e,x0,34,zf-.9);for(let i=0;i<22;i++)pBox(q,.8,1.6,.1,0xe0d8c0,x0-13.2+i*1.26,34,zf-1.08);pBox(q,30.4,.15,.35,0xc8a020,x0,35.6,zf-.9);pBox(q,30.4,.15,.35,0xc8a020,x0,32.4,zf-.9);
  for(let i=0;i<5;i++){const lx=x0-16+i*8;pBox(q,.1,.1,1,0x2a2a2a,lx,9.5,zf-1.1);pa(q,gCone(.5,.4,8),0x2a3a2a,lx,9.4,zf-1.6);pBox(qg,.3,.14,.3,0xffe0a0,lx,9.15,zf-1.6)}
  /* pasarela de cumbrera y ventiladores */ pBox(q,1.6,.25,226,0x3a3e40,x0,46.85,0);for(const s of[-1,1])pBox(q,.06,.06,226,0x2a2a2a,x0+s*.8,47.7,0);for(let i=0;i<8;i++){pBox(q,2.6,1.6,3,0x4a4e50,x0,47.6,-90+i*26);pBox(q,3,.2,3.4,0x2a2e30,x0,48.5,-90+i*26)}
  /* lucernarios a lo largo de los flancos del arco */ for(const s of[-1,1]){const a=.62,r=36.25;pBox(q,.25,3,200,0x6a8a9a,x0+s*Math.sin(a)*r,Math.cos(a)*r*1.3,0,0,0,s*Math.atan2(36*Math.cos(a),46.8*Math.sin(a)))}
  /* anexo de taller adosado al flanco este (x -94…-86) */ {const ax=x0+40,az=-40;pBox(q,8,5,30,0x8a7e68,ax,2.5,az);pBox(q,8.4,.5,30.4,DS,ax,.25,az);pBox(q,9,.25,31,SL,ax+.2,5.6,az,0,0,-.18);for(let i=0;i<5;i++)win31_12(q,ax+4,az,1,0,-12+i*6,2.8,1.4,1.6,{sh:SH});door31_12(q,qg,ax,az-15,0,-1,0,2.2,3,{steps:1,lamp:1,canopy:0x3a3a36});pipe31_12(q,ax+4.1,az+15.1,5.3,GU);pipe31_12(q,ax+4.1,az-15.1,5.3,GU);
   pCyl(q,.4,.4,2,0x2a2a2a,ax-1,6.5,az+8,0,0,0,8);pBox(q,.8,.15,.8,0x1a1a1a,ax-1,7.6,az+8);bOb({x:ax,z:az,hw:4,hd:15,h:6});crate31_12(q,ax+6,az-18,6);bOb({x:ax+7.2,z:az-18,hw:1.8,hd:.55,h:1.7})}}
 /* ---------- DEPÓSITO DE MUNICIÓN (X-48,-48): letrero de peligro ---------- */
 {const x=X-48,z=-54.5;for(const s of[-1,1])pBox(q,.12,2.6,.12,0x4a3018,x+s*1.4,1.3,z);pBox(q,3.4,1,.08,0xc02020,x,2.2,z);pBox(q,2.9,.25,.1,0xe8e0d0,x,2.2,z)}
 pbMesh(q,W,VCV);const gm=pbMesh(qg,W,new T.MeshBasicMaterial({vertexColors:true}));gm.userData.glow31=1}

/* ---------- CIUDAD INDUSTRIAL (grupo CITY12, coordenadas locales) ---------- */
function city31_12(C,H){const q=PB(),qg=PB();const TIc=[0x7a3a2a,0x8a4430,0x6a3428,0x4a4c54,0x5a3a30],WL=[0xb8ac90,0xa89c80,0x9a8e78],DK=0x1e1e22,SC=0x2a2622,RB=[0x7a7060,0x6a6050,0x8a7e68,0x4a4038];
 const rubble=(x,z,r,n,y)=>{for(let i=0;i<n;i++){const a=R()*6.283,d=R()*r,s=.6+R()*1.6;pBox(q,s*1.6,s*.7,s,RB[i%4],x+Math.cos(a)*d,(y||0)+.4+s*.3,z+Math.sin(a)*d,R()*.6,R()*3,R()*.6)}};
 const crater=(x,z,r)=>{pCyl(q,r*1.25,r*1.35,.25,0x6a6050,x,.55,z,0,0,0,9);pCyl(q,r,r*.9,.3,0x2a2620,x,.62,z,0,0,0,9)};
 const box_=(x,z,w,d,y,h,c)=>pBox(q,w,h,d,c,x,y+h/2,z);
 /* casas existentes: tejados, chimeneas, ventanas o daños */
 for(const [w,h,d,x,z,wc] of H){const top=h+1.4,dmg=R()<.24;
  for(const s of[-1,1]){const n=h>8?2:1;for(let r=0;r<n;r++){const y=2.3+r*3.4;if(R()<.85)pBox(q,w*.78,.9,.06,DK,x,y,z+s*(d/2+.03));if(R()<.85)pBox(q,.06,.9,d*.75,DK,x+s*(w/2+.03),y,z)}}
  pBox(q,w+.2,.3,d+.2,shade(wc,.8),x,h-.2,z);
  if(dmg){pBox(q,w+.62,.08,w+.62,SC,x,top+.04,z);pBox(q,w*.45,.1,w*.4,0x0e0e0e,x+(R()-.5)*w*.3,top+.1,z+(R()-.5)*w*.3);for(let i=0;i<3;i++)pBox(q,.25,.25,w*.7,0x2a2018,x-w*.25+i*w*.25,top+.5,z,.3+R()*.5,0,(R()-.5)*.6);
   const s=R()<.5?-1:1;pBox(q,w*.7,h*.45,.06,SC,x,h*.7,z+s*(d/2+.05));rubble(x+(R()-.5)*w,z+s*(d/2+1.5),2.4,5);if(R()<.4)pa(qg,gSph(.9,6,4),0xff7020,x,top+.5,z,0,0,0,1.6,.6,1.6)}
  else{const ax=R()<.5?'x':'z',rc=TIc[(R()*TIc.length)|0],rise=Math.min(4.5,w*.38);roof31_12(q,x,z,top,w+.6,w+.6,rise,ax,rc,shade(wc,.92),{ov:.25,ovL:.3,strips:2});
   if(R()<.8){const cx=x+(ax==='x'?(R()-.5)*w*.6:w*.18),cz=z+(ax==='z'?(R()-.5)*w*.6:w*.18);chim31_12(q,cx,top+rise*.4,cz,.8,rise*.7+1.2,0x8a5a44,1)}}}
 /* manzanas en hilera (casas adosadas) en los huecos */
 const T_=C.userData.T,busy=(x,z,r)=>{if(Math.hypot(x,z)>290-r||Math.abs(x+260)<50+r)return true;const rects=[[45,190,0,90],[-140,-60,-240,280],[130,235,-145,-60],[-110,-10,-190,-110],[-200,-120,-245,-215],[-360,-260,-280,-150],[-30,30,-80,-40],[80,120,160,200]];for(const [a,b,c,e] of rects)if(x>a-r&&x<b+r&&z>c-r&&z<e+r)return true;for(const h of H)if(Math.abs(h[3]-x)<h[0]/2+r&&Math.abs(h[4]-z)<h[0]/2+r)return true;for(const a of C.userData.AA)if(Math.hypot(a.x-x,a.z-z)<8+r)return true;return false};
 let rows=0;for(let t=0;t<400&&rows<44;t++){const x=(R()-.5)*560,z=(R()-.5)*560,n=3+(R()*4|0),alongX=R()<.5,L=n*6.4;if(busy(x,z,L/2+2))continue;rows++;
  const ruin=R()<.3,ri=ruin?(R()*n|0):-1,ri2=ruin&&R()<.5?Math.min(n-1,ri+1):-1;
  for(let i=0;i<n;i++){const u=(i-(n-1)/2)*6.4,hx=x+(alongX?u:0),hz=z+(alongX?0:u),h=7+R()*4,wc=WL[(rows+i)%3];const wx=alongX?6.4:8,wz=alongX?8:6.4;
   if(i===ri||i===ri2){box_(hx,hz,wx,wz,0,1.2+R()*1.5,shade(wc,.7));pBox(q,alongX?.5:wx,h*.6,alongX?wz:.5,shade(wc,.8),hx+(alongX?wx/2-.25:0),h*.3,hz+(alongX?0:wz/2-.25));rubble(hx,hz,4,9,1);pBox(q,wx+3,.06,wz+3,SC,hx,.56,hz);continue}
   box_(hx,hz,wx,wz,0,h,wc);box_(hx,hz,wx+.2,wz+.2,h-.3,.3,shade(wc,.8));
   for(const s of[-1,1])for(let r=0;r<(h>9?3:2);r++){const y=2.2+r*3;if(alongX)pBox(q,wx*.7,.9,.06,DK,hx,y,hz+s*(wz/2+.03));else pBox(q,.06,.9,wz*.7,DK,hx+s*(wx/2+.03),y,hz)}
   const rc=TIc[(rows*3+i)%TIc.length];if(alongX)roof31_12(q,hx,hz,h,wx,wz,2.6,'x',rc,shade(wc,.92),{ov:.35,ovL:.02,strips:2});else roof31_12(q,hx,hz,h,wz,wx,2.6,'z',rc,shade(wc,.92),{ov:.35,ovL:.02,strips:2});
   pBox(q,alongX?.5:wx+.6,h+1.6-h+1.2,alongX?wz+.6:.5,0x8a5a44,hx+(alongX?wx/2:0),h+.6,hz+(alongX?0:wz/2));chim31_12(q,hx+(alongX?wx/2:0),h+2.2,hz+(alongX?0:wz/2),.9,1.3,0x8a5a44,2)}
  }
 /* fábricas: pilastras, ventanales, cornisa, lucernarios, letrero, daños */
 {const x=60,z=40;for(let i=0;i<5;i++){const fx=x+i*26;for(const s of[-1,1]){for(let k=0;k<11;k++)pBox(q,.6,10.3,.8,0x5a4e42,fx+s*11.1,5.15,z-30+k*6);for(let k=0;k<10;k++)pBox(q,.06,3.6,4.2,0x2a3038,fx+s*11.04,5.2,z-27+k*6);pBox(q,.5,.5,60.4,0x4a4238,fx+s*11.15,10,z)}
   for(const e of[-1,1]){pa(q,gCyl(5,5,.2,10,false),0x2a3038,fx,4.5,z+e*30.05,1.5708);pBox(q,10.4,.3,.3,0x4a4238,fx,4.5,z+e*30.2);for(const s of[-1,1])pBox(q,.8,10.4,.9,0x5a4e42,fx+s*10.7,5.2,z+e*30.1)}
   pBox(q,14,1.4,.2,0x22261e,fx,8.8,z-30.25);for(let k=0;k<9;k++)pBox(q,1,.9,.06,0xe0d8c0,fx-5.6+k*1.4,8.8,z-30.38);
   for(let k=0;k<6;k++)pBox(q,21,.08,4.4,0x5e7078,fx,10.06,z-25+k*10.5);
   if(i===1||i===3){const hz=z-6+i*4;pBox(q,9,.14,12,0x0e0e0e,fx+2,10.1,hz);for(let k=0;k<5;k++)pBox(q,.3,.3,9,0x2a2018,fx-1+k*1.6,10.4,hz,.4*(k%2?1:-1),0,(R()-.5)*.5);pBox(q,14,.06,18,SC,fx+2,10.12,hz);rubble(fx+12.5,hz,4,8)}}
  for(let i=0;i<6;i++){const cx=x-10+i*24,cz=z+40;pBox(q,7.5,4,7.5,0x6a4a3a,cx,2,cz);pBox(q,8,.5,8,0x4a3a2e,cx,4.1,cz);for(const y of[12,24])pCyl(q,2.85-y*.016,2.85-y*.016,.6,0x5a3a2e,cx,y,cz,0,0,0,10);pCyl(q,2.35,2.35,2.4,0x1a1a1a,cx,38.9,cz,0,0,0,10);pCyl(q,2.5,2.5,.5,0x3a2a22,cx,37.5,cz,0,0,0,10)}}
 /* depósito ferroviario: linterna de ventilación en la bóveda, ventanales en abanico */
 {const x=-90,z=90;pBox(q,4,1.6,64,0x3a3e40,x,20.6,z);for(const s of[-1,1])pBox(q,.06,1,62,0x6a8a9a,x+s*2.03,20.6,z);pBox(q,5,.25,65,0x2a2e30,x,21.5,z);for(let i=0;i<6;i++){pBox(q,1.6,1.4,1.6,0x2a2e30,x,22.3,z-28+i*11);pBox(q,2,.15,2,0x1a1a1a,x,23.05,z-28+i*11)}
  for(const e of[-1,1]){pa(q,gCyl(11,11,.25,14,false),0x2a3038,x,10,z+e*35.15,1.5708);pa(q,gTor(11.2,.35,4,14,3.1416),0x4a4238,x,10,z+e*35.3);for(let k=0;k<5;k++)pBox(q,.25,11,.3,0x4a4238,x-8+k*4,10+5.5*0,z+e*35.35);pBox(q,22.6,.4,.4,0x4a4238,x,10,z+e*35.35);pBox(q,10,4,.3,0x3a2818,x,2,z+e*35.2)}}
 /* depósitos de combustible: barandillas en la cima, escalera, aros, cubeto */
 {const P_=[[150,-120],[180,-120],[210,-120],[150,-90],[180,-90],[210,-90]];for(const [x,z] of P_){pa(q,gTor(12,.15,4,24),0x3a3a36,x,16.9,z,1.5708);for(const y of[5,11])pCyl(q,12.06,12.06,.3,0x8a8478,x,y,z,0,0,0,16);pCyl(q,4,4,.08,0x6a2020,x,18.6,z,0,0,0,12);pCyl(q,3,3,.09,0xb8b0a0,x,18.62,z,0,0,0,12);pBox(q,1,16,.4,0x3a3a36,x-12.1,8,z,0,0,0)}
  for(const s of[-1,1]){pBox(q,94,1.6,1,0x8a8478,180,.8+.5,-105+s*31);pBox(q,1,1.6,63,0x8a8478,180+s*46.5,.8+.5,-105)}
  if(R()<2){pBox(q,30,.06,26,SC,210,.58,-90);rubble(222,-90,6,8)}}
 /* arsenal: almenas, troneras, torreones con matacanes */
 {const x=-60,z=-150;for(const s of[-1,1]){for(let k=0;k<12;k++)pBox(q,2.2,1.6,.9,0x5a5040,x-33+k*6,14.8,z+s*24.6);for(let k=0;k<8;k++)pBox(q,.9,1.6,2.2,0x5a5040,x+s*34.6,14.8,z-21+k*6)}
  for(const s of[-1,1])for(let k=0;k<10;k++){pBox(q,.6,2,.08,DK,x-30+k*6.6,8,z+s*25.05);pBox(q,.6,2,.08,DK,x-30+k*6.6,3.5,z+s*25.05)}
  for(const s of[-1,1])for(const t of[-1,1]){const tx=x+s*35,tz=z+t*25;pCyl(q,6.8,6.4,1.4,0x4a4234,tx,20.4,tz,0,0,0,10);for(let k=0;k<8;k++){const a=k/8*6.283;pBox(q,1.6,1.4,1,0x5a5040,tx+Math.cos(a)*6.3,21.8,tz+Math.sin(a)*6.3,0,-a,0)}}
  pBox(q,62,.1,42,0x3a3a36,x,14.06,z);for(let i=0;i<6;i++)pBox(q,8.4,.3,8.4,0x3a3028,x-25+i*10,20.15,z)}
 /* murallas: almenas y adarve; torres con matacanes */
 for(let a=0;a<24;a++){const t=a/24*6.283,r=330,cx=Math.cos(t)*r,cz=Math.sin(t)*r,dx=Math.sin(t),dz=-Math.cos(t),ry=-t+1.5708;for(let k=0;k<12;k++){const u=-41+k*7.45;pBox(q,3.2,2,1.4,0x8a7e68,cx+dx*u+Math.cos(t)*3.3,15,cz+dz*u+Math.sin(t)*3.3,0,ry,0)}pBox(q,90,.1,5,0x6a604e,cx-Math.cos(t)*.5,14.06,cz-Math.sin(t)*.5,0,ry,0);
  if(a%3===0){pCyl(q,10.8,10.8,1.4,0x6a604e,cx,21.4,cz,0,0,0,10);for(let k=0;k<6;k++){const b=k/6*6.283+.3;pBox(q,.8,2.4,.3,DK,cx+Math.cos(b)*9.6,12,cz+Math.sin(b)*9.6,0,-b+1.5708,0)}}}
 /* refinería: tuberías entre torres; almacenes del puerto con tejado */
 {const x=-180,z=-230;for(const y of[8,16])pBox(q,46,.8,.8,0x5a5a52,x+21,y,z+5.5);for(let i=0;i<4;i++)pBox(q,.6,16,.6,0x3a3a36,x+i*14,8,z+5.5);pCyl(q,.9,.9,6,0x2a2a2a,x+42,42,z,0,0,0,8);pa(qg,gCone(1.2,4,6),0xffa040,x+42,46.5,z)}
 for(let i=0;i<3;i++){const z=-260+i*40;roof31_12(q,-300,z,8,60,14,3.2,'x',i===1?SC:0x6a6a64,0x4a4a46,{ov:.4,strips:4});roof31_12(q,-340,z,6,20,12,2.6,'x',0x5a3a2a,0x5a3a2a,{ov:.4,strips:3});
  if(i===1){pBox(q,20,.2,10,0x0e0e0e,-292,11.4,z,0,0,.05);rubble(-300,z+10,6,10)}}
 /* nidos antiaéreos con sacos */
 for(const a of C.userData.AA)for(let i=0;i<10;i++){const b=i/10*6.283;pBox(q,2.6,1.2,1.2,0xb8ac88,a.x+Math.cos(b)*6.2,.9,a.z+Math.sin(b)*6.2,0,-b+1.5708,0)}
 /* cráteres y escombros dispersos */
 for(let i=0;i<38;i++){const x=(R()-.5)*560,z=(R()-.5)*560;if(Math.hypot(x,z)>300||Math.abs(x+260)<40)continue;crater(x,z,2+R()*4);if(R()<.4)rubble(x+4,z,3,4)}
 pbMesh(q,C,VCV);if(qg.L.length){const m=pbMesh(qg,C,new T.MeshBasicMaterial({vertexColors:true,transparent:true,opacity:.85}));m.userData.glow31=1}}

{const _c31=buildCity12;buildCity12=function(zc){const H=[],op=pBox;pBox=function(q,w,h,d,c,x,y,z){if((c===0xb8ac90||c===0xa89c80||c===0x9a8e78)&&Math.abs(d-w*.9)<1e-6&&Math.abs(y-h/2)<1e-6)H.push([w,h,d,x,z,c]);return op.apply(this,arguments)};let C;try{C=_c31(zc)}finally{pBox=op}try{city31_12(C,H)}catch(e){console.warn('city31_12',e)}return C}}
{const _b31=buildWorld12;buildWorld12=function(){const was=L12.built;_b31();if(was)return;deco31_12()}}
