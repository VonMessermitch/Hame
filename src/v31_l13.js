/* v31 · Mejora de edificios del nivel 13 (misión XII «Los que quedaron atrás»):
   granero, casa, galpón, gallinero, utilería de granja, portones, torre de guardia,
   estribos y celosía del puente, vía, faroles, cajas y nidos de sacos del complejo.
   Puramente aditivo: pocas mallas fusionadas, sin luces dinámicas nuevas. */
function deco31_13(){const X=X13,q=PB(),qe=PB(),r31_13=(()=>{let k=7;return()=>(k=k*16807%2147483647)/2147483647})(),DK=0x2a1e14,WO=0x4a3624,ST=0x6a665c,IR=0x2a2a2a,GL=0xffc870;
 /* tiras sobre faldones inclinados (cumbrera a lo largo de z): slab de centro (cx,cy), ancho W, ángulo a, lado s */
 const rs31_13=(cx,cy,z,W,L,a,s,step,th,col,sz)=>{const ca=Math.cos(a),sa=Math.sin(a);for(let u=-W/2+step/2;u<W/2;u+=step){const v=th;pBox(q,.1,.07,L,col,cx+u*ca+v*s*sa,cy-u*s*sa+v*ca,z,0,0,-s*a)}};
 const lamp31_13=(x,y,z,glow)=>{pBox(q,.26,.06,.26,IR,x,y+.2,z);pBox(q,.3,.05,.3,IR,x,y-.17,z);for(const a of[-1,1])for(const b of[-1,1])pBox(q,.025,.34,.025,IR,x+a*.11,y,z+b*.11);pBox(qe,.18,.28,.18,glow||GL,x,y,z);pCyl(q,.02,.02,.12,IR,x,y+.28,z,0,0,0,4)};
 const crate31_13=(x,y,z,w,h,d,ry,c)=>{c=c||0x5a4a30;pBox(q,w,h,d,c,x,y+h/2,z,0,ry,0);const cs=Math.cos(ry),sn=Math.sin(ry);for(const k of[-1,1]){pBox(q,w+.02,.07,.06,shade(c,.7),x+sn*k*d/2,y+h*.15,z+cs*k*d/2,0,ry,0);pBox(q,w+.02,.07,.06,shade(c,.7),x+sn*k*d/2,y+h*.85,z+cs*k*d/2,0,ry,0)}pBox(q,w*.4,h*.22,.02,0xd8d0b8,x+sn*(d/2+.01),y+h*.5,z+cs*(d/2+.01),0,ry,0)};
 const sack31_13=(x,y,z,r)=>pa(q,gSph(.36,6,4),0xb8a878,x,y+.2,z,0,r||0,0,1.2,.6,.8);

 /* ============================ GRANERO ============================ */{const bx=X+30,z0=-190,H=3.2,a=.45;
  /* tejado: hileras de tablillas, tapajuntas de hastial, canalones y bajantes */
  for(const s of[-1,1]){const cx=bx+s*3.1,cy=2*H+1.4;rs31_13(cx,cy,z0,6.9,16.6,a,s,.42,.15,0x2a1e18);
   for(const e of[-1,1])pBox(q,6.95,.32,.1,DK,cx,cy+.04,z0+e*8.36,0,0,-s*a);
   pBox(q,.18,.3,16.8,DK,bx+s*6.24,6.3,z0);pCyl(q,.09,.09,16.8,0x4a4a46,bx+s*6.45,6.12,z0,1.5708,0,0,6);
   for(const e of[-1,1]){pCyl(q,.06,.06,5.9,0x4a4a46,bx+s*6.45,3.15,z0+e*8.15,0,0,0,5);pBox(q,.14,.06,.3,0x4a4a46,bx+s*6.45,.25,z0+e*8.15+e*.12)}
   /* cabios bajo el faldón (visibles dentro) */for(let i=0;i<8;i++)pBox(q,6.6,.18,.14,0x3a2a1a,cx-.2*s*Math.sin(a),cy-.2*Math.cos(a),z0-7.4+i*2.1,0,0,-s*a)}
  for(let i=0;i<5;i++){const z=z0-6.8+i*3.4;pBox(q,7,.2,.16,0x3a2a1a,bx,7.35,z);pBox(q,.16,1.6,.16,0x3a2a1a,bx,8.15,z)}
  /* polea de heno en el hastial frontal */pBox(q,.26,.26,1.9,DK,bx,8.45,z0+8.85);pCyl(q,.16,.16,.1,IR,bx,8.2,z0+9.55,0,0,1.5708,8);pCyl(q,.02,.02,2.5,0x8a7a5a,bx,6.95,z0+9.6,0,0,0,4);pa(q,gTor(.1,.025,4,8,4.4),IR,bx,5.65,z0+9.6,0,0,1.5708);
  /* umbral de piedra, rampa y jambas del portón */pBox(q,4.6,.1,1.4,0x5a5850,bx,.05,z0+8.95);for(const s of[-1,1]){pBox(q,.22,3.7,.22,DK,bx+s*2.12,1.85,z0+8.32);pBox(q,.3,.3,.3,ST,bx+s*2.12,.15,z0+8.5)}
  /* rieles del portón corredizo y farol sobre el portón */pBox(q,.06,.12,.06,IR,bx+5.3,3.85,z0+8.5);pBox(q,.06,.12,.06,IR,bx-5.3,3.85,z0+8.5);pBox(q,.5,.06,.06,IR,bx+2.6,4.3,z0+8.6);lamp31_13(bx+2.75,4.05,z0+8.75);
  /* exterior: leñera bajo alero (este), escalera apoyada, barril de lluvia, abrevadero, carro de heno */
  {const lx=bx+6.85,lz=z0-5;pBox(q,1.3,.12,4.6,0x3a2a22,lx+.3,2.05,lz,0,0,-.25);for(const k of[-1,1])pBox(q,.12,1.9,.12,DK,lx+.8,.95,lz+k*2.2);
   for(let r=0;r<4;r++)for(let i=0;i<9;i++)pCyl(q,.13,.13,.9,i%3?0x6a4a2a:0x7a5a34,lx+(r%2)*.05,.14+r*.26,lz-1.95+i*.48+(r%2)*.22,0,0,1.5708,6);oB13({x:30+6.95,z:lz,hw:.55,hd:2.3,h:1.3})}
  for(const s of[-1,1])pBox(q,.08,4.6,.08,0x5a4a32,bx+6.75,2.2,z0+3.2+s*.25,0,0,.22);for(let i=0;i<10;i++){const y=.3+i*.42;pBox(q,.06,.05,.55,0x5a4a32,bx+6.75-(y-2.2)*.223,y,z0+3.2)}
  pCyl(q,.36,.4,.95,0x4a3a26,bx+6.85,.48,z0-8.55,0,0,0,10);for(const y of[.2,.8])pCyl(q,.41,.41,.05,IR,bx+6.85,y,z0-8.55,0,0,0,10);pCyl(q,.33,.33,.02,0x101418,bx+6.85,.94,z0-8.55,0,0,0,10);
  {const tx=bx+10.5,tz=z0+4;pBox(q,.8,.55,2.6,0x5a4630,tx,.32,tz);pBox(q,.62,.04,2.4,0x10161c,tx,.58,tz);for(const k of[-1,1])pBox(q,.9,.12,.12,DK,tx,.08,tz+k*1.1);oB13({x:40.5,z:tz,hw:.45,hd:1.3,h:.6})}
  {const wx=bx+11,wz=z0+14,r=.35,c=Math.cos(r),sn=Math.sin(r);const P=(dx,dz)=>[wx+dx*c+dz*sn,wz-dx*sn+dz*c];
   {const[x,z]=P(0,0);pBox(q,1.8,.12,3.6,0x5a4630,x,.95,z,0,r,0);pBox(q,1.7,1.0,3.2,0xc8a858,x,1.55,z,0,r,0);pa(q,gSph(1,8,5),0xb89848,x,2.05,z,0,r,0,.85,.45,1.6)}
   for(const k of[-1,1]){const[x,z]=P(k*.95,0);pBox(q,.08,.5,3.6,0x4a3a26,x,1.2,z,0,r,0);for(const e of[-1,1]){const[x2,z2]=P(k*1,e*1.2);pCyl(q,.48,.48,.08,0x3a2a1a,x2,.48,z2,0,r,1.5708,10);pCyl(q,.08,.08,.12,IR,x2,.48,z2,0,r,1.5708,6)}}
   {const[x,z]=P(0,2.6);pBox(q,.1,.1,2,0x4a3a26,x,.6,z,-.25,r,0)}oB13({x:41,z:z0+14,hw:1.6,hd:2,h:2.3})}
  /* interior: farol, herramientas colgadas, arneses, sacos de grano, heno suelto en el altillo */
  lamp31_13(bx+5.6,2.4,z0+3.2);pBox(q,.3,.06,.06,IR,bx+5.75,2.62,z0+3.2);
  for(let i=0;i<4;i++){const z=z0+.6+i*.55;pBox(q,.05,1.7,.05,0x6a5a3a,bx+5.7,1.25,z,0,0,.06);if(i===0){for(let k=0;k<4;k++)pBox(q,.03,.3,.03,0x8a8a86,bx+5.68,2.2,z-.12+k*.08)}else if(i===1)pBox(q,.04,.08,.5,0x8a8a86,bx+5.66,2.1,z+.15,.6,0,0);else pBox(q,.04,.06,.45,0x5a4a32,bx+5.68,2.12,z)}
  pa(q,gTor(.32,.07,5,10),0x3a2416,bx+5.72,1.9,z0-.6,0,1.5708,0);pBox(q,.05,.5,.05,0x2a1a10,bx+5.74,1.4,z0-.2);
  for(let i=0;i<5;i++)sack31_13(bx-2.2+i*.7,(i>2)*.42,z0-7.45+(i>2)*.05,i*.3);
  pa(q,gSph(1.1,8,5),0xb89848,bx+4.6,H+.2,z0-6.6,0,0,0,1.2,.6,1);pa(q,gSph(.8,7,5),0xa88a40,bx+3.2,H+.15,z0-7.2,0,0,0,1.3,.5,.8);
  for(let i=0;i<6;i++)pBox(q,.03,.03,.3+r31_13()*.4,0xc8a858,bx-1+r31_13()*5,.02,z0-3+r31_13()*5,0,r31_13()*3,0)}

 /* ============================ CASA ============================ */{const hx=X-18,hz=-292,H=3,a=.5;
  /* tejado de tejas: hileras horizontales, canalones y bajantes, sombreretes de chimenea */
  for(const s of[-1,1]){const cx=hx+s*3,cy=2*H+1.2;rs31_13(cx,cy,hz,6.8,9.9,a,s,.34,.15,0x4a1e16);
   for(const e of[-1,1])pBox(q,6.85,.3,.1,0x3a1e16,cx,cy+.03,hz+e*4.95,0,0,-s*a);
   pCyl(q,.09,.09,10,0x5a5a5a,hx+s*6.25,5.65,hz,1.5708,0,0,6);for(const e of[-1,1]){pCyl(q,.06,.06,5.5,0x5a5a5a,hx+s*6.3,2.9,hz+e*4.85,0,0,0,5);pBox(q,.14,.06,.3,0x5a5a5a,hx+s*6.3,.22,hz+e*4.85+e*.12)}}
  for(const [x,z,y] of[[hx-3,hz-1.5,2*H+4],[hx+3.5,hz+2,2*H+2.6]]){for(const k of[-1,1])pCyl(q,.12,.14,.45,0x8a4a30,x+k*.2,y+.2,z,0,0,0,6);pBox(q,.95,.12,.95,0x5a5a5a,x,y-.05,z)}
  /* esquinas de sillería, imposta entre pisos, dinteles de piedra */
  for(const [sx,sz] of[[-1,-1],[1,-1],[-1,1],[1,1]])for(let k=0;k<10;k++){const y=.95+k*.52,L=k%2?.45:.8;pBox(q,L,.44,.08,0xa8a090,hx+sx*(6.24-L/2),y,hz+sz*4.74);pBox(q,.08,.44,k%2?.8:.45,0xa8a090,hx+sx*6.24,y,hz+sz*(4.74-(k%2?.8:.45)/2))}
  for(const s of[-1,1]){pBox(q,12.4,.14,.12,0x9a9284,hx,3.05,hz+s*4.76);pBox(q,.12,.14,9.4,0x9a9284,hx+s*6.27,3.05,hz)}
  const lint=(x,y,z,ax)=>pBox(q,ax==='x'?.14:1.36,.2,ax==='x'?1.36:.14,0x9a9284,x,y+.78,z);
  for(const s of[-1,1]){lint(hx+s*3.6,1.6,hz+4.86);lint(hx+s*3.6,4.6,hz+4.86);lint(hx+s*3.6,1.6,hz-4.86);lint(hx+s*3.6,4.6,hz-4.86);lint(hx+s*6.36,1.6,hz,'x');lint(hx+s*6.36,4.6,hz-1.5,'x')}
  /* puerta de entrada abierta contra la fachada, montante, escalón, aldaba y bandos de ocupación */
  pBox(q,.9,2.3,.06,0x3a2a1a,hx-1.68,1.25,hz+4.8);for(const y of[.7,1.75])pBox(q,.66,.7,.03,0x2a1e12,hx-1.68,y,hz+4.84);pBox(q,.05,.05,.05,0xb8a060,hx-2.0,1.2,hz+4.85);
  
  pBox(q,4.4,.1,.5,0x5a5850,hx,.05,hz+7.2);
  for(const [x,y,c] of[[hx+1.55,1.75,0xd8d0b0],[hx+1.75,1.25,0xc8c0a0],[hx+1.45,1.2,0xe0d8c0]])pBox(q,.34,.44,.02,c,x,y,hz+4.8);pBox(q,.3,.04,.022,0x8a1a1a,hx+1.55,1.9,hz+4.81);
  /* banco y leñera junto a la casa */{const bx=hx+6.75,bz=hz+2.4;pBox(q,.45,.08,1.6,WO,bx,.5,bz);for(const k of[-1,1])pBox(q,.4,.48,.08,DK,bx,.24,bz+k*.7);oB13({x:-18+6.75,z:bz,hw:.25,hd:.8,h:.55})}
  {const wx=hx-6.85,wz=hz+2.6;pBox(q,1,.1,3.6,0x3a1e16,wx-.1,1.75,wz,0,0,.25);for(const k of[-1,1])pBox(q,.1,1.6,.1,DK,wx-.45,.8,wz+k*1.7);for(let r=0;r<4;r++)for(let i=0;i<7;i++)pCyl(q,.13,.13,.8,i%3?0x6a4a2a:0x7a5a34,wx,.14+r*.26,wz-1.5+i*.48+(r%2)*.2,0,0,1.5708,6);oB13({x:-18-6.85,z:wz,hw:.5,hd:1.8,h:1.2})}
  /* interior planta baja: alfombra, lámpara colgante, aparador con platos, repisa, fregadero, cuadros */
  pBox(q,2.8,.02,1.8,0x6a2a22,hx-3,.02,hz-1);pBox(q,2.4,.025,1.4,0x8a5a2a,hx-3,.025,hz-1);
  pCyl(q,.01,.01,1,IR,hx-3,2.45,hz-1,0,0,0,4);pCyl(q,.05,.28,.18,0x3a3a2a,hx-3,1.9,hz-1,0,0,0,8);pa(qe,gSph(.09,6,4),GL,hx-3,1.8,hz-1);
  {const dx=hx-5.55,dz=hz+2.2;pBox(q,.5,.9,1.6,0x5a3a22,dx,.45,dz);pBox(q,.3,1,1.5,0x4a3020,dx-.1,1.4,dz);pBox(q,.05,.04,1.5,0x3a2414,dx+.06,1.35,dz);for(let i=0;i<4;i++)pCyl(q,.16,.16,.03,0xe8e0d0,dx+.04,1.55,dz-.55+i*.37,0,0,1.5708,10);pBox(q,.52,.06,1.64,0x3a2414,dx,1.92,dz);oB13({x:-18-5.55,z:dz,hw:.27,hd:.8,h:1.9})}
  {const kz=hz-4.0;pBox(q,2,.9,.55,0x6a5a4a,hx,.45,kz);pBox(q,2.05,.06,.6,0x8a8478,hx,.92,kz);pBox(q,.7,.12,.4,0xa8a8a0,hx-.4,.9,kz);pCyl(q,.02,.02,.3,IR,hx-.4,1.1,kz-.15,0,0,0,4);oB13({x:-18,z:kz,hw:1,hd:.3,h:.95})}
  pBox(q,2,.05,.25,0x4a3020,hx,1.95,hz-4.13);for(let i=0;i<6;i++)pCyl(q,.06,.06,.18,[0xb8a060,0x8a3a2a,0x6a7a5a][i%3],hx-.8+i*.32,2.07,hz-4.13,0,0,0,6);
  for(const [x,y,z,ax] of[[hx-5.75,1.9,hz-2.2,'x'],[hx+1.6,1.7,hz-4.22,'z'],[hx-5.75,4.9,hz+2,'x'],[hx-1.4,4.7,hz-4.22,'z']]){pBox(q,ax==='x'?.04:.55,.45,ax==='x'?.55:.04,0x5a3a1a,x,y,z);pBox(q,ax==='x'?.045:.43,.33,ax==='x'?.43:.045,[0x4a5a6a,0x6a5a3a][(x|0)&1],x,y,z)}
  /* planta alta: cabecero, almohada y manta en la cama, mesilla con vela, baúl, cortinas */
  pBox(q,1.7,1,.1,0x4a3020,hx-4,H+.75,hz-3.55);pBox(q,1,.14,.4,0xe8e0d0,hx-4,H+.57,hz-3.25);pBox(q,1.66,.08,1.4,0x5a6a4a,hx-4,H+.54,hz-2.15);
  pBox(q,.5,.55,.45,0x4a3020,hx-2.75,H+.4,hz-3.95);pCyl(q,.04,.04,.14,0xe8e0d0,hx-2.75,H+.75,hz-3.95,0,0,0,5);pa(qe,gSph(.035,5,4),0xffd080,hx-2.75,H+.86,hz-3.95);
  pBox(q,1.1,.5,.5,0x5a3a1a,hx-4,H+.4,hz-1.15);pBox(q,1.12,.06,.52,IR,hx-4,H+.5,hz-1.15);
  for(const s of[-1,1])pBox(q,.28,1.15,.04,0x7a2a2a,hx+3.6+s*.5,4.6,hz+4.25);pBox(q,1.4,.08,.06,0x3a2414,hx+3.6,5.2,hz+4.25);
  pBox(q,2,.02,1.3,0x5a3a5a,hx-3.6,H+.17,hz-.2)}

 /* ============================ GALPÓN Y GRANJA ============================ */{const gx=X+22,gz=-306;
  for(let i=0;i<21;i++)pBox(q,.08,.06,8.1,0x4a4a44,gx-5+i*.5,3.56,gz);pBox(q,10.2,.08,.08,0x5a3a22,gx,3.12,gz+3.8);
  {const bx=gx+3.6,bz=gz-3.55;pBox(q,2.4,.08,.75,0x5a4630,bx,.9,bz);for(const a of[-1,1])for(const b of[-1,1])pBox(q,.08,.88,.08,DK,bx+a*1.1,.44,bz+b*.3);pBox(q,2.2,.06,.6,0x4a3a28,bx,.25,bz);pBox(q,.4,.25,.3,0x6a6a62,bx+.8,1.07,bz);pBox(q,.6,.15,.25,0x3a4048,bx-.6,1.0,bz+.1);
   pBox(q,2.2,1.1,.04,0x5a4a32,bx,1.9,gz-3.86);for(let i=0;i<6;i++)pBox(q,.04,.5+(i%3)*.15,.04,0x8a8a86,bx-.9+i*.36,1.85,gz-3.82);oB13({x:25.6,z:bz,hw:1.2,hd:.4,h:.95})}
  for(let i=0;i<3;i++){pCyl(q,.3,.3,.9,[0x3a4a3a,0x6a2a1a,0x3a3a3a][i],gx-4.1+i*.65,.45,gz-3.4,0,0,0,10);pCyl(q,.31,.31,.04,IR,gx-4.1+i*.65,.65,gz-3.4,0,0,0,10)}oB13({x:22-3.45,z:gz-3.4,hw:1,hd:.35,h:.9});
  for(let i=0;i<3;i++)pa(q,gTor(.42,.14,5,10),0x1a1a1a,gx+4.4,.14+i*.28,gz+2.6,1.5708,0,0);
  lamp31_13(gx,2.75,gz);pCyl(q,.01,.01,.45,IR,gx,3.1,gz,0,0,0,4)}
 {/* gallinero: puerta, rampa, ponederos */const cx=X-38,cz=-270;pBox(q,.6,.9,.05,0x1a1410,cx+.6,.75,cz+1.03);pBox(q,.4,.05,1.3,0x5a4a32,cx+.6,.25,cz+1.55,-.35,0,0);for(let i=0;i<4;i++)pBox(q,.42,.03,.06,0x3a2a18,cx+.6,.18+i*.11,cz+1.2+i*.27);pBox(q,.6,.5,1.6,0x5a4a32,cx-1.75,.9,cz,0,0,0);pBox(q,.66,.08,1.7,0x4a2a20,cx-1.8,1.2,cz,0,0,.3)}
 {/* abrevadero y estercolero junto al corral */pBox(q,2.2,.5,.6,0x6a6a62,X-30,.25,-318.5);pBox(q,2,.05,.4,0x10161c,X-30,.48,-318.5);pa(q,gSph(1.4,7,5),0x2a2418,X-39.5,0,-318,0,0,0,1.3,.5,1);pBox(q,.05,1.6,.05,0x6a5a3a,X-38.6,.6,-317.2,.3,0,.4)}
 {/* portón norte (abierto contra la cerca) y faroles sobre los postes */for(const z of[-330.35]){pBox(q,2.6,.1,.1,0x4a3a28,X+4.6,1.0,z);pBox(q,2.6,.1,.1,0x4a3a28,X+4.6,.4,z);for(let i=0;i<4;i++)pBox(q,.1,1.0,.1,0x4a3a28,X+3.4+i*.8,.7,z);pBox(q,2.9,.1,.1,0x4a3a28,X+4.6,.7,z,0,0,.36)}
  pBox(q,2.6,.1,.1,0x4a3a28,X+4.6,1.0,-250.35);pBox(q,2.6,.1,.1,0x4a3a28,X+4.6,.4,-250.35);pBox(q,2.9,.1,.1,0x4a3a28,X+4.6,.7,-250.35,0,0,.36);for(let i=0;i<4;i++)pBox(q,.1,1.0,.1,0x4a3a28,X+3.4+i*.8,.7,-250.35);
  for(const z of[-250,-330])for(const s of[-1,1]){pBox(q,.42,.1,.42,DK,X+s*3.2,2.45,z);pa(q,gCone(.3,.35,4),DK,X+s*3.2,2.6,z,0,.785,0);}
  lamp31_13(X-3.2,2.15,-249.75);lamp31_13(X+3.2,2.15,-330.25)}
 {/* cruz de camino (Bildstock) junto al sendero */const sx=X-7,sz=-244;pBox(q,.4,1.8,.4,0x8a8478,sx,.9,sz);pBox(q,.6,.6,.45,0x9a9488,sx,2.1,sz);pBox(q,.4,.4,.1,0x1a1410,sx,2.1,sz+.2);pa(qe,gSph(.05,5,4),0xffb050,sx,1.98,sz+.18);for(const s of[-1,1])pBox(q,.5,.06,.6,0x4a1e16,sx+s*.2,2.55,sz,0,0,-s*.6);pBox(q,.05,.5,.05,0x2a1e14,sx,2.95,sz);pBox(q,.28,.05,.05,0x2a1e14,sx,3.05,sz);oB13({x:-7,z:sz,hw:.3,hd:.3,h:2.4})}
 {/* almiares, carretilla, tajo con hacha, lecheras */
  for(const [x,z] of[[37,-318],[37.5,-324]]){pCyl(q,1.5,1.7,1.6,0xb89848,X+x,.8,z,0,0,0,9);pa(q,gCone(1.6,1.9,9),0xa88a40,X+x,2.55,z);pCyl(q,.05,.05,1.2,DK,X+x,3.6,z,0,0,0,4);ob(X+x,z,1.6)}
  {const wx=X+28.5,wz=-299.5;pBox(q,.9,.35,1.1,0x5a5a50,wx,.55,wz,.15,.4,0);pCyl(q,.22,.22,.08,IR,wx-.2,.22,wz+.6,0,.4,1.5708,8);for(const k of[-1,1])pBox(q,.05,.05,1.5,0x5a4630,wx+k*.38,.5,wz-.5,.25,.4,0)}
  {const cx=X+27.4,cz=-264.5;pCyl(q,.36,.4,.55,0x6a4a2a,cx,.28,cz,0,0,0,9);pBox(q,.05,.7,.05,0x5a4630,cx+.1,.85,cz,0,0,.35);pBox(q,.04,.14,.22,0x8a8a86,cx-.05,1.15,cz,0,0,.35);for(let i=0;i<5;i++)pBox(q,.14,.5,.14,0x8a6a40,cx+.8+r31_13()*.6,.07,cz-.6+r31_13()*1.2,1.5708,r31_13()*3,0)}
  for(const [dx,dz] of[[1.6,1.3],[1.95,1.0],[1.7,.75]]){pCyl(q,.17,.19,.6,0x8a8a86,X+8+dx,.3,-283+dz,0,0,0,8);pCyl(q,.1,.1,.12,0x8a8a86,X+8+dx,.66,-283+dz,0,0,0,8)}
  /* tendedero entre la casa y el pozo */pCyl(q,.05,.05,2.2,DK,X-9,1.1,-286,0,0,0,5);pCyl(q,.05,.05,2.2,DK,X-3,1.1,-286,0,0,0,5);pBox(q,6,.015,.015,0x8a8a80,X-6,2.1,-286);for(const [x,c] of[[-8,0xd8d0c0],[-6.6,0x6a7a8a],[-5.2,0xd8d0c0],[-4.1,0x8a6a5a]])pBox(q,.7,.8,.02,c,X+x,1.7,-286)}

 /* ============================ COMPLEJO FERROVIARIO ============================ */{const ZT=-560;
  /* torre de guardia: cruces de San Andrés, escalera, antepechos, postes del tejado, reflector */
  {const tx=X-40,tz=-542;for(const [ax,dz] of[['x',-1],['x',1],['z',-1],['z',1]])for(const y of[1.6,4.4]){for(const k of[-1,1])ax==='x'?pBox(q,3.6,.14,.1,0x3a2a18,tx,y,tz+dz*1.38,0,0,k*.785):pBox(q,.1,.14,3.6,0x3a2a18,tx+dz*1.38,y,tz,k*.785,0,0)}
   for(const k of[-1,1])pBox(q,.08,6.4,.08,0x4a3a28,tx-1.75,3,tz-1+k*.3);for(let i=0;i<15;i++)pBox(q,.06,.05,.62,0x4a3a28,tx-1.75,.4+i*.4,tz-1);
   pBox(q,.12,1,3.2,0x4a3a28,tx+1.6,6.6,tz);pBox(q,3.2,1,.12,0x4a3a28,tx,6.6,tz-1.6);pBox(q,.12,1,2,0x4a3a28,tx-1.6,6.6,tz+.6);for(const [a,b] of[[-1,-1],[1,-1],[-1,1],[1,1]])pBox(q,.12,1.0,.12,0x3a2a18,tx+a*1.5,7.0,tz+b*1.5);pBox(q,3.4,.1,3.4,0x3a2a18,tx,7.45,tz);
   for(const [w,d,x,z] of[[3.3,.06,0,1.66],[3.3,.06,0,-1.66],[.06,3.3,1.66,0],[.06,3.3,-1.66,0]])pBox(q,w,.12,d,0x3a2a18,tx+x,6.06,tz+z);
   pCyl(q,.28,.3,.4,0x3a3e3a,tx+.9,7.4,tz+1.1,1.4,0,0,10);pCyl(qe,.25,.25,.04,0xfff2c0,tx+.9,7.43,tz+1.32,1.4,0,0,10);for(let i=0;i<3;i++)pBox(q,.55,.3,.5,0xb8ac88,tx-.9+i*.55,.15,tz+2.1)}
  /* estribos del puente: sillería, cornisa, aletas, apoyos; pila central con tajamar */
  for(const x of[58,102]){const ax=X+x,o=x<80?-1:1;pBox(q,4.4,.35,6.4,0x8a8478,ax,3.15,ZT);for(let k=0;k<5;k++){const y=-.4+k*.7;for(const s of[-1,1])pBox(q,4.05,.06,.04,0x4a4a44,ax,y,ZT+s*3.02);pBox(q,.04,.06,6.05,0x4a4a44,ax-o*2.02,y,ZT)}
   for(const s of[-1,1]){pBox(q,4.5,2.8,.9,0x6a6a62,ax+o*.4,1.1,ZT+s*3.9,0,s*o*.25,0);pBox(q,4.6,.25,1,0x8a8478,ax+o*.4,2.6,ZT+s*3.9,0,s*o*.25,0);pBox(q,.7,.3,.7,0x5a5a56,ax-o*1.7,3.45,ZT+s*2.1)}}
  {const px=X+80;pBox(q,2.2,2,7.4,0x6a6a62,px,-.9,ZT);pa(q,gCone(1.55,2,4),0x6a6a62,px,-.6,ZT+4.4,1.5708,.785,0,1,1,.55);pa(q,gCone(1.55,2,4),0x6a6a62,px,-.6,ZT-4.4,-1.5708,.785,0,1,1,.55);pBox(q,2.4,.2,7.6,0x8a8478,px,.1,ZT)}
  /* celosía: cartelas remachadas, arriostrado horizontal superior, pasarela lateral */
  for(const s of[-1,1])for(let i=0;i<=8;i++)for(const y of[.5,3.6])pBox(q,.9,.7,.06,0x2e3236,X+60+i*5,y,ZT+s*2.27);
  for(let i=0;i<8;i++)for(const k of[-1,1])pBox(q,.12,.12,6.5,0x3a3e42,X+62.5+i*5,3.84,ZT,0,k*.872,0);
    /* vía: placas de asiento (instanciadas), eclisas, traviesas y carriles de repuesto */
  {const xs=[];for(let x=-450;x<850;x+=1.1)if(x>-160&&x<190)xs.push(x);const im=new T.InstancedMesh(gBox(.34,.035,.24),new T.MeshLambertMaterial({color:0x3a3632}),xs.length*2),m=new T.Matrix4();let n=0;for(const x of xs)for(const s of[-.75,.75]){m.makeTranslation(X+x,.31,ZT+s);im.setMatrixAt(n++,m)}scene.add(im)}
  for(let x=-150;x<190;x+=12)for(const s of[-.75,.75])pBox(q,.6,.1,.16,0x4a4a48,X+x,.33,ZT+s);
  {const sx=X-18,sz=ZT-6.5;for(let r=0;r<4;r++)for(let i=0;i<6;i++)pBox(q,.26,.16,2.6,0x3a2a1a,sx-1.6+i*.42+(r%2)*.2,.08+r*.17,sz,0,0,0);for(let i=0;i<3;i++)pBox(q,5,.14,.12,0x5a5a5a,sx+4.4,.07+i*.14,sz-.6+i*.3);oB13({x:-18,z:sz,hw:1.5,hd:1.35,h:.7});oB13({x:-13.6,z:sz-.3,hw:2.5,hd:.5,h:.45})}
  /* señales: brazo de semáforo y luces */for(const x of[-60,120]){pBox(q,1.4,.22,.06,0xb02020,X+x+.7,4.4,ZT+3.5,0,0,.35);pBox(q,.3,.06,.06,0xe8e0d0,X+x+1.1,4.55,ZT+3.47,0,0,.35);pa(qe,gSph(.1,6,4),0xff4030,X+x,4.2,ZT+3.42);pBox(q,.6,.08,.6,IR,X+x,5.1,ZT+3.5)}
  /* faroles del complejo (solo brillo) */for(const [x,z] of[[-5,-500],[5,-541],[30,-549],[-30,-549],[52,-552],[-45,-505]]){pCyl(q,.07,.1,4.2,0x2a2c2e,X+x,2.1,z,0,0,0,6);pBox(q,.6,.06,.06,0x2a2c2e,X+x+.25,4.15,z);pa(q,gCone(.32,.25,8),0x2a2c2e,X+x+.5,4.15,z);pa(qe,gSph(.12,6,4),0xffe0a0,X+x+.5,3.98,z);pBox(q,.3,.2,.3,0x3a3a36,X+x,.1,z)}
  /* cajas de munición y bidones */
  {const groups=[[-36,-511],[22,-513],[-13,-537]];for(const [gx,gz] of groups){crate31_13(X+gx,0,gz,1.2,.7,.8,0);crate31_13(X+gx+.15,.7,gz+.05,1.0,.6,.7,.2,0x4a5a3a);crate31_13(X+gx+1.35,0,gz+.1,.9,.5,.6,-.3,0x4a5a3a);pCyl(q,.3,.3,.9,0x3a4a3a,X+gx-1.1,.45,gz+.2,0,0,0,10);pCyl(q,.3,.3,.9,0x4a3a2a,X+gx-1.15,.45,gz-.5,0,0,0,10);oB13({x:gx+.2,z:gz,hw:1.95,hd:.55,h:1.3})}}
  /* nidos de sacos: hilera superior escalonada y ametralladora en trípode */
  for(const [x,z] of[[-8,-508],[30,-510],[70,-545]]){for(let i=0;i<6;i++){const a=(i+.5)/7*3.14;pBox(q,1.0,.35,.62,0xa89c78,X+x+Math.cos(a)*2.2,1.07,z+Math.sin(a)*2.2,0,-a+1.57,0)}
   pBox(q,.22,.22,.9,IR,X+x,1.3,z+1.6);pCyl(q,.04,.04,.9,IR,X+x,1.32,z+2.4,1.5708,0,0,6);pCyl(q,.07,.07,.45,0x3a3a36,X+x,1.32,z+2.05,1.5708,0,0,6);for(const s of[-1,1])pBox(q,.04,.7,.04,IR,X+x+s*.22,.95,z+1.5,0,0,s*.4);pBox(q,.04,.7,.04,IR,X+x,.95,z+1.25,-.4,0,0);
   crate31_13(X+x+.9,0,z+.3,.5,.3,.3,.4,0x4a5a3a)}
  /* casamatas: tablón de nombre, ganchos de camuflaje; búnker de mando: ventiladores y antena */
  for(const x of[-25,45]){const cx=X+x,cz=-524;for(let i=0;i<5;i++)pBox(q,1.2+r31_13()*.8,.06,.9,0x3a4a2a,cx-4+i*2,3.95,cz-1.5+(i%2)*1.6,0,r31_13(),0);pCyl(q,.18,.18,.6,0x4a4a44,cx-3,4.1,cz-2,0,0,0,8);pBox(q,.5,.08,.5,0x3a3a36,cx-3,4.42,cz-2)}
  {const bx=X+10,bz=-531;for(const k of[-1,1]){pCyl(q,.2,.2,.7,0x4a4a44,bx+k*5,4.0,bz-3,0,0,0,8);pBox(q,.55,.08,.55,0x3a3a36,bx+k*5,4.38,bz-3)}pCyl(q,.03,.05,5,IR,bx+7,6.1,bz-3.5,0,0,0,4);pBox(q,.9,.03,.03,IR,bx+7,8.2,bz-3.5);pBox(q,.6,.03,.03,IR,bx+7,7.6,bz-3.5)}}

 /* ============================ CARTELES (una malla, textura de lienzo) ============================ */
 {const c=document.createElement('canvas');c.width=512;c.height=256;const g=c.getContext('2d');
  const sign=(y,bg,fg,t1,t2)=>{g.fillStyle=bg;g.fillRect(0,y,512,128);g.strokeStyle=fg;g.lineWidth=6;g.strokeRect(8,y+8,496,112);g.fillStyle=fg;g.textAlign='center';g.font='bold 44px serif';g.fillText(t1,256,y+58);g.font='bold 26px serif';g.fillText(t2,256,y+98)};
  sign(0,'#d8ccb0','#1a1a1a','ALTO · ZONA MILITAR','Prohibido el paso — se disparará');sign(128,'#e0d6bc','#7a1a1a','TOQUE DE QUEDA','Por orden de la Comandancia de Praga');
  const pos=[],uv=[],idx=[];const quad=(x,y,z,w,h,ry,v0)=>{const b=pos.length/3,cs=Math.cos(ry),sn=Math.sin(ry);for(const [u,v] of[[-.5,-.5],[.5,-.5],[.5,.5],[-.5,.5]]){pos.push(x+u*w*cs,y+v*h,z-u*w*sn);uv.push(u+.5,v0+(v+.5)*.5)}idx.push(b,b+1,b+2,b,b+2,b+3)};
  quad(X+5,1.6,-244.96,1.16,.62,0,0);quad(X-18+1.55,1.75,-287.18,.34,.17,0,0);
  for(const [px,pz] of[[-6.2,-498],[48,-552]]){quad(X+px,1.4,pz+.03,1.8,.9,0,.5);for(const k of[-1,1])pCyl(q,.06,.06,1.9,0x3a2a1a,X+px+k*.8,.95,pz-.06,0,0,0,5);pBox(q,1.9,1,.04,0x3a2a1a,X+px,1.4,pz)}
  const ge=new T.BufferGeometry();ge.setAttribute('position',new T.Float32BufferAttribute(pos,3));ge.setAttribute('uv',new T.Float32BufferAttribute(uv,2));ge.setIndex(idx);ge.computeVertexNormals();
  const tx=new T.CanvasTexture(c);scene.add(new T.Mesh(ge,new T.MeshLambertMaterial({map:tx,side:T.DoubleSide})))}
 pbMesh(q,scene,VCV);pbMesh(qe,scene,new T.MeshBasicMaterial({vertexColors:true}))}
{const _b31=build13;build13=function(){const was=L13.built;_b31();if(was)return;deco31_13()}}
