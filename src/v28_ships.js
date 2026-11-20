/* =====================================================================
   v28 · MODELOS NAVALES (Ingeniero naval)
   Fábricas de modelos 3D: casco genérico, lancha B-17 «Wolfszahn», patrullero y
   destructor Zheng-Hua, acorazado ZH-01 «Tianlong», lancha de desembarco,
   hidroaviones, torpedo y restos flotantes.
   Ejes locales: +Z = proa, +X = estribor, Y arriba, y=0 = línea de flotación.
   Solo definiciones: nada se crea al cargar.
   ===================================================================== */
const NV15={};
function nvMat15(k,f){return NV15[k]||(NV15[k]=f())}
function nvV15(x,y,z){return new T.Vector3(x,y,z)}
function nvGrp15(p,x,y,z){const g=new T.Group();g.position.set(x||0,y||0,z||0);if(p)p.add(g);return g}
function nvObj15(p,x,y,z){const o=new T.Object3D();o.position.set(x,y,z);p.add(o);return o}
function nvCvs15(w,h,fn){const c=document.createElement('canvas');c.width=w;c.height=h;fn(c.getContext('2d'),w,h);const t=new T.CanvasTexture(c);t.anisotropy=4;return t}
/* calcomanía plana (número de casco, emblemas) */
function nvDecal15(tex,w,h,ds){const m=new T.Mesh(new T.PlaneGeometry(w,h),nvMat15('dc'+tex.uuid+(ds?1:0),()=>new T.MeshLambertMaterial({map:tex,transparent:true,alphaTest:.25,side:ds?T.DoubleSide:T.FrontSide,depthWrite:true})));return m}
/* bandera ondeada: el borde del asta en x=0, se extiende hacia +x */
function nvFlag15(tex,w,h){const k='fg'+w+'|'+h;const geo=nvMat15(k,()=>{const gg=new T.PlaneGeometry(w,h,8,1);const p=gg.attributes.position;for(let i=0;i<p.count;i++){const x=p.getX(i)+w/2;p.setX(i,x);p.setZ(i,Math.sin(x/w*5.2)*w*.06*(x/w))}gg.computeVertexNormals();return gg});
 return new T.Mesh(geo,nvMat15('fm'+tex.uuid,()=>new T.MeshLambertMaterial({map:tex,side:T.DoubleSide})))}
/* --- texturas de lienzo --- */
function nvEisTex15(){return nvMat15('tEis',()=>nvCvs15(192,128,(c,w,h)=>{c.fillStyle='#1c2026';c.fillRect(0,0,w,h);c.fillStyle='#7a1a2a';c.fillRect(0,44,w,40);c.fillStyle='#b8933a';c.fillRect(0,41,w,3);c.fillRect(0,84,w,3);
 const cx=w*.5,cy=h/2;c.save();c.translate(cx,cy);c.fillStyle='#0e0e0e';for(let k=0;k<2;k++){const s=k?1:1.18;c.fillStyle=k?'#d4ad48':'#111';c.beginPath();for(let i=0;i<4;i++){c.save();c.rotate(i*Math.PI/2);c.moveTo(-5*s,-6*s);c.lineTo(-15*s,-38*s);c.lineTo(15*s,-38*s);c.lineTo(5*s,-6*s);c.restore()}c.fill()}
 c.fillStyle='#d4ad48';c.beginPath();c.arc(0,0,9,0,7);c.fill();c.fillStyle='#7a1a2a';c.beginPath();c.arc(0,0,4.5,0,7);c.fill();c.restore()}))}
/* emblema imperial Zheng-Hua: disco rojo, doble anillo dorado y dragón enroscado estilizado alrededor de un sol */
function nvDraw15(c,cx,cy,R0){c.save();c.translate(cx,cy);
 for(let i=0;i<16;i++){c.save();c.rotate(i*Math.PI/8);c.fillStyle='#d8b040';c.beginPath();c.moveTo(-R0*.07,-R0*.9);c.lineTo(0,-R0*1.0);c.lineTo(R0*.07,-R0*.9);c.fill();c.restore()}
 c.fillStyle='#d8b040';c.beginPath();c.arc(0,0,R0*.9,0,7);c.fill();c.fillStyle='#9a1414';c.beginPath();c.arc(0,0,R0*.82,0,7);c.fill();
 c.strokeStyle='#d8b040';c.lineWidth=R0*.03;c.beginPath();c.arc(0,0,R0*.74,0,7);c.stroke();
 c.fillStyle='#e8c050';c.beginPath();c.arc(0,0,R0*.2,0,7);c.fill();c.fillStyle='#9a1414';c.beginPath();c.arc(0,0,R0*.13,0,7);c.fill();
 /* cuerpo del dragón: espiral gruesa con escamas */
 c.lineCap='round';const pts=[];for(let i=0;i<=60;i++){const t=i/60,a=-1.2+t*Math.PI*1.75,r=R0*(.32+.32*t);pts.push([Math.cos(a)*r,Math.sin(a)*r])}
 for(const [lw,col] of [[R0*.17,'#5a0a0a'],[R0*.12,'#e0b848']]){c.strokeStyle=col;c.lineWidth=lw;c.beginPath();pts.forEach((p,i)=>{const k=1-i/60*.55;i?c.lineTo(p[0],p[1]):c.moveTo(p[0],p[1])});c.stroke()}
 c.fillStyle='#9a1414';for(let i=4;i<58;i+=5){c.beginPath();c.arc(pts[i][0],pts[i][1],R0*.025,0,7);c.fill()}
 /* espinas dorsales */
 c.fillStyle='#e0b848';for(let i=6;i<56;i+=6){const p=pts[i],q=pts[i+1],dx=q[0]-p[0],dy=q[1]-p[1],L=Math.hypot(dx,dy),nx=dy/L,ny=-dx/L;c.beginPath();c.moveTo(p[0]+nx*R0*.05,p[1]+ny*R0*.05);c.lineTo(p[0]+nx*R0*.13+dx,p[1]+ny*R0*.13+dy);c.lineTo(q[0]+nx*R0*.05,q[1]+ny*R0*.05);c.fill()}
 /* cabeza */
 const h=pts[60];c.save();c.translate(h[0],h[1]);c.rotate(Math.atan2(h[1]-pts[56][1],h[0]-pts[56][0]));c.fillStyle='#e0b848';c.beginPath();c.moveTo(-R0*.08,-R0*.1);c.lineTo(R0*.2,-R0*.06);c.lineTo(R0*.24,R0*.02);c.lineTo(R0*.12,R0*.05);c.lineTo(R0*.2,R0*.1);c.lineTo(-R0*.08,R0*.1);c.fill();
 c.beginPath();c.moveTo(-R0*.02,-R0*.09);c.lineTo(-R0*.16,-R0*.22);c.lineTo(R0*.04,-R0*.1);c.fill();c.fillStyle='#5a0a0a';c.beginPath();c.arc(R0*.06,-R0*.03,R0*.025,0,7);c.fill();c.restore();
 c.restore()}
function nvZhRound15(){return nvMat15('tZhR',()=>nvCvs15(256,256,(c,w,h)=>{c.clearRect(0,0,w,h);nvDraw15(c,128,128,124)}))}
function nvZhFlag15(){return nvMat15('tZhF',()=>nvCvs15(192,128,(c,w,h)=>{c.fillStyle='#8a1212';c.fillRect(0,0,w,h);c.fillStyle='#d4ad48';c.fillRect(0,0,w,5);c.fillRect(0,h-5,w,5);nvDraw15(c,w*.42,h/2,50)}))}
function nvNumTex15(txt,fg){return nvMat15('tN'+txt+fg,()=>nvCvs15(256,96,(c,w,h)=>{c.clearRect(0,0,w,h);c.font='bold 72px Georgia, "Times New Roman", serif';c.textAlign='center';c.textBaseline='middle';c.lineWidth=7;c.strokeStyle='rgba(18,18,18,.65)';c.strokeText(txt,w/2,h/2+4);c.fillStyle=fg;c.fillText(txt,w/2,h/2+4)}))}
/* ---------- casco genérico ---------- */
function nvDef15(o){const d=Object.assign({below:0x5a2420,sheer:0,bowFine:.5,sternW:.7,deck:0x6a5a44,fcZ:null,fcH:0,n:24},o);d.hl=d.len/2;return d}
function hF15(d,z){const t=(z+d.hl)/d.len;let f=1;const bs=.56-d.bowFine*.1;
 if(t>bs){const u=Math.min(1,(t-bs)/(1-bs));f=Math.pow(Math.max(0,Math.cos(u*Math.PI/2)),.55+d.bowFine*.65)}
 if(t<.18){const u=Math.max(0,t)/.18;f*=d.sternW+(1-d.sternW)*Math.sin(u*Math.PI/2)}return f}
function hW15(d,z){return d.beam/2*hF15(d,z)}
function hY15(d,z){const t=(z+d.hl)/d.len;let y=d.free;if(t>.55){const u=(t-.55)/.45;y+=d.sheer*u*u}if(d.fcZ!==null&&z>=d.fcZ)y+=d.fcH;return y}
/* mkHull15(o) — casco por secciones transversales; acepta además o.fcZ/o.fcH (castillo elevado desde fcZ hacia proa) y o.n (secciones) */
function mkHull15(o){const d=o.hl?o:nvDef15(o),hb=d.beam/2,N=d.n,bt=Math.max(.12,d.draft*.045),BOOT=0x1c1c1e;
 let zs=[];for(let i=0;i<=N;i++)zs.push(-d.hl+d.len*i/N);
 if(d.fcZ!==null){zs=zs.filter(z=>Math.abs(z-d.fcZ)>d.len/N*.3);zs.push(d.fcZ-.03,d.fcZ);zs.sort((a,b)=>a-b)}
 const prof=zs.map(z=>{const t=(z+d.hl)/d.len,w=hb*hF15(d,z),yd=hY15(d,z),ub=t>.6?(t-.6)/.4:0,us=t<.14?t/.14:1;
  const wlF=.95-.2*ub,kw=(.2-.17*ub)*(.5+.5*us),bil=(.82-.12*ub)*(.5+.5*us),dk=d.draft*(1-.3*ub*ub*ub)*(.62+.38*Math.sin(us*Math.PI/2)),rake=d.len*.035*ub*ub;
  const P=(y,wf)=>{const yn=(y+dk)/(yd+dk);return[w*wf,y,z-rake*(1-yn)]};
  return[P(yd,1),P(yd*.5,.995),P(.06,wlF),P(-bt,wlF*.985),P(-dk*.6,bil),P(-dk,kw)]});
 const pos=[],col=[],uv=[],idx=[],C=new T.Color();
 const V=(x,y,z,c)=>{C.setHex(c);pos.push(x,y,z);col.push(C.r,C.g,C.b);uv.push(z*.22,y*.22+x*.05);return pos.length/3-1};
 const bands=[{r:[0,1,2],c:d.color},{r:[2,3],c:BOOT},{r:[3,4,5],c:d.below}];
 for(const s of[1,-1])for(const b of bands){const base=prof.map(p=>b.r.map(r=>V(s*p[r][0],p[r][1],p[r][2],b.c)));
  for(let i=0;i<prof.length-1;i++)for(let r=0;r<b.r.length-1;r++){const a=base[i][r],bb=base[i+1][r],c=base[i][r+1],e=base[i+1][r+1];if(s>0)idx.push(a,bb,c,bb,e,c);else idx.push(a,c,bb,bb,c,e)}}
 const p0=prof[0];for(let r=0;r<5;r++){const c=r<2?d.color:r==2?BOOT:d.below;const R0=V(p0[r][0],p0[r][1],p0[r][2],c),L0=V(-p0[r][0],p0[r][1],p0[r][2],c),R1=V(p0[r+1][0],p0[r+1][1],p0[r+1][2],c),L1=V(-p0[r+1][0],p0[r+1][1],p0[r+1][2],c);idx.push(R0,R1,L0,L0,R1,L1)}
 const dl=prof.map(p=>[V(-p[0][0],p[0][1],p[0][2],d.deck),V(p[0][0],p[0][1],p[0][2],d.deck)]);
 for(let i=0;i<dl.length-1;i++){const[L,Rr]=dl[i],[L2,R2]=dl[i+1];idx.push(L,L2,Rr,Rr,L2,R2)}
 const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.setAttribute('color',new T.Float32BufferAttribute(col,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.setIndex(idx);g.computeVertexNormals();g.computeBoundingSphere();
 const m=new T.Mesh(g,nvMat15('hull',()=>new T.MeshLambertMaterial({vertexColors:true,map:typeof vehT!=='undefined'?vehT:null})));m.userData.def=d;return m}
/* ---------- piezas de detalle (lotes PB) ---------- */
function nvSeg15(q,x0,y0,z0,x1,y1,z1,t,col,t2){const dx=x1-x0,dy=y1-y0,dz=z1-z0,L=Math.hypot(dx,dy,dz);if(L<1e-4)return;
 pBox(q,t,t2||t,L,col,(x0+x1)/2,(y0+y1)/2,(z0+z1)/2,-Math.atan2(dy,Math.hypot(dx,dz)),Math.atan2(dx,dz),0,.03)}
/* barandilla a lo largo de la borda (ambas bandas) */
function nvRail15(q,d,z0,z1,step,col,inset,h,y0){const n=Math.max(1,Math.round((z1-z0)/step));
 for(const s of[1,-1]){let pv=null;for(let i=0;i<=n;i++){const z=z0+(z1-z0)*i/n,x=s*Math.max(.05,hW15(d,z)-inset),y=y0!=null?y0:hY15(d,z);pBox(q,.05,h,.05,col,x,y+h/2,z);
  if(pv){nvSeg15(q,pv[0],pv[1]+h,pv[2],x,y+h,z,.045,col);nvSeg15(q,pv[0],pv[1]+h*.5,pv[2],x,y+h*.5,z,.03,col)}pv=[x,y,z]}}}
/* barandilla recta entre dos puntos */
function nvRailL15(q,x0,z0,x1,z1,y,h,col,step){const L=Math.hypot(x1-x0,z1-z0),n=Math.max(1,Math.round(L/(step||1.2)));for(let i=0;i<=n;i++){const t=i/n;pBox(q,.045,h,.045,col,x0+(x1-x0)*t,y+h/2,z0+(z1-z0)*t)}nvSeg15(q,x0,y+h,z0,x1,y+h,z1,.04,col);nvSeg15(q,x0,y+h*.5,z0,x1,y+h*.5,z1,.03,col)}
function nvLadder15(q,x,y,z,h,ry,col){const c=Math.cos(ry),s=Math.sin(ry);for(const k of[-.2,.2])pBox(q,.05,h,.05,col,x+c*k,y+h/2,z-s*k,0,ry,0);for(let v=.25;v<h;v+=.3)pBox(q,.4,.035,.035,col,x,y+v,z,0,ry,0)}
function nvRing15(q,x,y,z,ry){pa(q,gTor(.3,.07,6,14),0xe2d8c6,x,y,z,0,ry,0);for(let i=0;i<4;i++){const a=i*Math.PI/2+.785,c=Math.cos(a)*.3;pa(q,gBox(.1,.17,.17),0xb02a1e,x+c*Math.cos(ry),y+Math.sin(a)*.3,z-c*Math.sin(ry),0,ry,a)}}
function nvAmmo15(q,x,y,z,ry,col){col=col||0x4a4c30;pBox(q,.62,.34,.36,col,x,y+.17,z,0,ry,0);pBox(q,.64,.05,.38,shade(col,.75),x,y+.33,z,0,ry,0);pBox(q,.2,.04,.04,0x222222,x,y+.37,z,0,ry,0)}
function nvBollard15(q,x,y,z,col){for(const k of[-.22,.22]){pCyl(q,.08,.08,.32,col,x,y+.16,z+k,0,0,0,8);pCyl(q,.11,.11,.05,col,x,y+.32,z+k,0,0,0,8)}pBox(q,.22,.08,.6,col,x,y+.04,z)}
function nvCowl15(q,x,y,z,h,r,col,ry){pCyl(q,r,r,h,col,x,y+h/2,z,0,0,0,8);const s=Math.sin(ry||0),c=Math.cos(ry||0);pCyl(q,r*1.5,r*1.05,r*1.8,col,x+s*r*.5,y+h+r*.4,z+c*r*.5,1.3,ry||0,0,8);pCyl(q,r*1.3,r*1.3,.02,0x111111,x+s*r*1.35,y+h+r*.6,z+c*r*1.35,1.3,ry||0,0,8)}
function nvMush15(q,x,y,z,col){pCyl(q,.09,.09,.35,col,x,y+.17,z,0,0,0,6);pCyl(q,.2,.22,.1,col,x,y+.38,z,0,0,0,8)}
function nvCoil15(q,x,y,z){pa(q,gTor(.24,.05,4,10),0x6a5a40,x,y+.05,z,1.5708,0,0);pa(q,gTor(.17,.05,4,10),0x6a5a40,x,y+.12,z,1.5708,0,0)}
/* pieza móvil genérica: yaw (giro) > pitch (elevación: rotation.x negativa = arriba) > cañones a lo largo de +Z */
function nvGun15(par,x,y,z,th,tz,b,fy,fp){const yaw=nvGrp15(par,x,y,z),pitch=nvGrp15(yaw,0,th,tz),qy=PB(),qp=PB(),mz=[],sg=b.seg||8;
 for(let i=0;i<b.n;i++){const bx=(i-(b.n-1)/2)*(b.sp||0),by=b.by||0;pCyl(qp,b.r*.78,b.r,b.len,b.col,bx,by,b.b0+b.len/2,Math.PI/2,0,0,sg);pCyl(qp,b.r*1.08,b.r*1.08,b.len*.05,shade(b.col,.85),bx,by,b.b0+b.len*.975,Math.PI/2,0,0,sg);mz.push(nvObj15(pitch,bx,by,b.b0+b.len))}
 if(fy)fy(qy);if(fp)fp(qp);if(qy.L.length)pbMesh(qy,yaw,VCV);pbMesh(qp,pitch,VCV);return{yaw,pitch,muzzles:mz}}
/* cañón naval ligero con escudo */
function nvNavGun15(par,x,y,z,col,s){s=s||1;const DS=0x34383c,GC=0x3a3e42;
 return nvGun15(par,x,y,z,.42*s,.05*s,{n:1,len:2.3*s,r:.075*s,b0:.15*s,col:GC},qy=>{pCyl(qy,.3*s,.34*s,.16*s,DS,0,.08*s,0,0,0,0,10);pBox(qy,.46*s,.36*s,.5*s,shade(col,.8),0,.3*s,0);
  pBox(qy,1.5*s,1.15*s,.06*s,col,0,.62*s,.62*s,-.08,0,0);for(const k of[1,-1])pBox(qy,.06*s,1.0*s,.7*s,col,k*.77*s,.58*s,.3*s,0,k*.35,0);pBox(qy,1.46*s,.05*s,.32*s,col,0,1.18*s,.5*s);
  pBox(qy,.26*s,.26*s,.04*s,0x0e0e0e,0,.46*s,.665*s);for(const k of[1,-1]){pCyl(qy,.11*s,.11*s,.04*s,DS,k*.3*s,.45*s,-.15*s,0,0,1.5708,8);pBox(qy,.2*s,.05*s,.22*s,0x262626,k*.36*s,.18*s,-.5*s);pBox(qy,.04*s,.3*s,.04*s,DS,k*.36*s,0,-.5*s)}
  for(let i=0;i<6;i++)pBox(qy,.03*s,.03*s,.02*s,shade(col,.6),-.6*s+i*.24*s,1.05*s,.66*s,-.08,0,0)},
  qp=>{pBox(qp,.24*s,.24*s,1.0*s,GC,0,0,.05*s);pBox(qp,.3*s,.3*s,.42*s,0x2e3236,0,0,-.55*s);pCyl(qp,.05*s,.05*s,.8*s,0x5a5e62,0,.17*s,.3*s,1.5708,0,0,6);pBox(qp,.05*s,.12*s,.22*s,0x222222,-.2*s,.13*s,0)})}
/* ametralladora de camisa de agua sobre pivote */
function nvMG15(par,x,y,z,col,shield){return nvGun15(par,x,y,z,.1,0,{n:1,len:.85,r:.03,b0:.4,col:0x262626,seg:6},qy=>{pBox(qy,.08,.2,.1,0x333333,0,.04,0);if(shield)pBox(qy,.62,.44,.03,col,0,.2,.42,-.1,0,0)},
 qp=>{pBox(qp,.12,.15,.55,0x2a2a2a,0,0,.05);pCyl(qp,.065,.065,.52,0x3c3e3a,0,0,.58,1.5708,0,0,8);pBox(qp,.1,.12,.13,0x5a4e32,.12,-.04,.08);pBox(qp,.04,.12,.16,0x3a2a1a,0,-.07,-.32);pBox(qp,.02,.06,.02,0x222222,0,.1,.75)})}
/* torreta blindada (casa con frente inclinado) */
function nvTurret15(par,x,y,z,o){const w=o.w,h=o.h,l=o.l,col=o.col,zf=o.zf,zb=zf-l,sl=o.sl||h*.45,dk=shade(col,.6);
 return nvGun15(par,x,y,z,o.th,o.tz,{n:o.n,sp:o.sp,len:o.len,r:o.r,b0:o.b0||.2,col:shade(col,.85),seg:o.seg||10},qy=>{
  pBox(qy,w,h,l,col,0,h/2,zf-l/2);const L=Math.hypot(h,sl),dd=Math.min(l*.25,sl*1.3),nz=h/L,ny=sl/L;
  pBox(qy,w*.97,L,dd,col,0,h/2-ny*dd/2,zf+sl/2-nz*dd/2,-Math.atan2(sl,h),0,0);
  pBox(qy,w*1.01,.12,l*.96,shade(col,1.08),0,h+.04,zf-l/2);
  for(let i=0;i<o.n;i++){const bx=(i-(o.n-1)/2)*o.sp;pBox(qy,o.r*3.2,o.r*4.6,.15,0x111111,bx,o.th,zf+sl*(1-o.th/h)+.02,-Math.atan2(sl,h),0,0)}
  if(o.rf){for(const k of[1,-1]){pCyl(qy,h*.16,h*.16,w*.18,col,k*(w/2+w*.08),h*.72,zb+l*.28,0,0,1.5708,8);pBox(qy,w*.06,h*.26,h*.3,dk,k*(w/2+w*.17),h*.72,zb+l*.28)}}
  pBox(qy,w*.18,h*.12,l*.16,dk,-w*.25,h+.14,zb+l*.3);pBox(qy,w*.18,h*.12,l*.16,dk,w*.25,h+.14,zb+l*.3);pBox(qy,w*.12,h*.18,w*.12,dk,0,h+.16,zf-l*.15);
  pBox(qy,w*.92,h*.1,.1,dk,0,h*.35,zb-.04);for(let i=0;i<4;i++)pBox(qy,.06,h*.5,.05,dk,-w*.35+i*w*.23,h*.6,zb-.05);if(o.fy)o.fy(qy)},
  qp=>{for(let i=0;i<o.n;i++){const bx=(i-(o.n-1)/2)*o.sp;pCyl(qp,o.r*1.5,o.r*1.6,o.r*4,0x2a2c2e,bx,0,o.b0+o.r*1.6,Math.PI/2,0,0,10)}})}
/* afuste antiaéreo doble con escudo */
function nvAA15(par,x,y,z,col,s){s=s||1;const DS=0x2e3236;return nvGun15(par,x,y,z,.75*s,0,{n:2,sp:.36*s,len:2.4*s,r:.055*s,b0:.3*s,col:0x2a2a2a},
 qy=>{pCyl(qy,.3*s,.42*s,.6*s,DS,0,.3*s,0,0,0,0,10);pBox(qy,.9*s,.12*s,.6*s,DS,0,.62*s,0);for(const k of[1,-1]){pBox(qy,.08*s,.5*s,.4*s,DS,k*.42*s,.8*s,0);pBox(qy,.3*s,.06*s,.3*s,0x222222,k*.62*s,.5*s,-.55*s);pBox(qy,.05*s,.5*s,.05*s,DS,k*.62*s,.25*s,-.55*s)}
  pBox(qy,1.5*s,.7*s,.04*s,col,0,.95*s,.6*s,-.12,0,0);for(const k of[1,-1])pBox(qy,.04*s,.65*s,.6*s,col,k*.78*s,.92*s,.35*s,0,k*.4,0)},
 qp=>{for(const k of[1,-1]){pBox(qp,.16*s,.22*s,.8*s,0x2a2a2a,k*.18*s,0,0);pBox(qp,.14*s,.24*s,.3*s,0x4a4a3a,k*.18*s,.22*s,-.1*s);pCyl(qp,.075*s,.075*s,.6*s,0x3a3a3a,k*.18*s,0,.6*s,1.5708,0,0,8)}pa(qp,gTor(.15*s,.012*s,3,10),0x222222,0,.3*s,.5*s);pBox(qp,.02*s,.3*s,.02*s,0x222222,0,.2*s,.5*s)})}
/* proyector (Group para orientar) */
function nvLight15(par,x,y,z,s,ry){s=s||1;const g=nvGrp15(par,x,y,z);g.rotation.y=ry||0;const q=PB(),DS=0x34383c;pCyl(q,.12*s,.18*s,.4*s,DS,0,.2*s,0,0,0,0,8);pBox(q,.66*s,.08*s,.14*s,DS,0,.42*s,0);for(const k of[1,-1])pBox(q,.06*s,.42*s,.1*s,DS,k*.31*s,.6*s,0);
 pCyl(q,.27*s,.25*s,.55*s,0x55595c,0,.68*s,0,Math.PI/2,0,0,12);pCyl(q,.2*s,.2*s,.1*s,0x44484a,0,.68*s,-.3*s,Math.PI/2,0,0,8);pCyl(q,.06*s,.06*s,.15*s,0x333333,0,.98*s,0,0,0,0,6);pbMesh(q,g,VCV);
 const L=new T.Mesh(gCyl(.23*s,.23*s,.02*s,12),nvMat15('lens',()=>new T.MeshBasicMaterial({color:0xf2ead0})));L.rotation.x=Math.PI/2;L.position.set(0,.68*s,.28*s);g.add(L);return g}
function nvHullDecal15(g,d,tex,z,y,w,h,col){const dw=(hW15(d,z+.25)-hW15(d,z-.25))/.5;for(const s of[1,-1]){const m=nvDecal15(tex,w,h);m.rotation.y=Math.atan2(s,-dw);const x=hW15(d,z)*.995;m.position.set(s*(x+.035),y,z);g.add(m)}}
/* ---------- TORPEDO ---------- */
function nvTorpGeo15(withProps){return nvMat15('tg'+(withProps?1:0),()=>{const q=PB(),S=0x7a8088,BRS=0xb8923e;pCyl(q,.22,.22,3.8,S,0,0,0,Math.PI/2,0,0,10);pCyl(q,.06,.22,.55,BRS,0,0,2.17,Math.PI/2,0,0,10);pa(q,gSph(.07,6,4),BRS,0,0,2.45);
 pCyl(q,.225,.225,.06,0x5a5e64,0,0,.9,Math.PI/2,0,0,10);pCyl(q,.225,.225,.06,0x5a5e64,0,0,-.8,Math.PI/2,0,0,10);pCyl(q,.08,.22,.75,S,0,0,-2.27,Math.PI/2,0,0,10);
 for(let i=0;i<4;i++){const a=i*Math.PI/2;pBox(q,.02,.34,.36,0x6a7078,Math.sin(a)*.17,Math.cos(a)*.17,-2.45,0,0,-a)}pCyl(q,.035,.035,.35,0x444444,0,0,-2.75,Math.PI/2,0,0,6);
 if(withProps)for(const zz of[-2.7,-2.82])for(let i=0;i<4;i++)pBox(q,.05,.3,.02,BRS,0,0,zz,0,zz<-2.75?.3:-.3,i*Math.PI/2+(zz<-2.75?.785:0));return pbGeo(q)})}
function mkTorpedo15(){const g=new T.Group();g.add(new T.Mesh(nvTorpGeo15(false),VCV));const pr=nvGrp15(g,0,0,-2.76),q=PB();for(const[zz,o,tw] of[[.05,0,-.3],[-.08,.785,.3]])for(let i=0;i<4;i++)pBox(q,.05,.32,.02,0xb8923e,0,0,zz,0,tw,o+i*Math.PI/2);pa(q,gSph(.05,6,4),0x444444,0,0,-.13);pbMesh(q,pr,VCV);
 g.userData={prop:pr,len:5.3,radius:.22};return g}
/* =====================================================================
   B-17 «WOLFSZAHN» — lancha cañonera / torpedera blindada (1922)
   ===================================================================== */
function mkWolf15(o){o=o||{};const ally=!!o.ally,num=o.num||(ally?'S-12':'B-17');
 const HC=o.color||(ally?0x606c64:0x5a6670),ST=shade(HC,.72),DS=0x34383c,DK=0x6a5a44,BR=0xb08d48,WD=0x6e5034,WH=0xd8d2c2;
 const g=new T.Group(),d=nvDef15({len:22,beam:4.6,free:1.3,draft:1.1,color:HC,sheer:.55,bowFine:.62,sternW:.82,deck:DK,n:22});
 g.add(mkHull15(d));const Y=z=>hY15(d,z),W=z=>hW15(d,z),D=1.3,q=PB(),qg=PB();
 /* regala, defensa de madera, barandillas */
 for(const s of[1,-1])for(let z=-11;z<10.9;z+=1){const z2=Math.min(z+1,10.95);nvSeg15(q,s*(W(z)+.02),Y(z)-.05,z,s*(W(z2)+.02),Y(z2)-.05,z2,.1,ST,.14);nvSeg15(q,s*(W(z)*.99+.05),.66,z,s*(W(z2)*.99+.05),.66,z2,.1,WD,.12)}
 nvRail15(q,d,-10.7,9.4,1.3,ST,.1,.85);for(const s of[1,-1])nvSeg15(q,s*W(-10.7)*.9,D+.85,-10.7,s*.4,D+.85,-10.95,.04,ST);
 /* proa: roda, cabrestante, anclas, bitas, rompeolas, asta de tajamar */
 pCyl(q,.2,.25,.35,DS,0,Y(9.2)+.17,9.2,0,0,0,10);pCyl(q,.25,.25,.06,DS,0,Y(9.2)+.37,9.2,0,0,0,10);
 for(const s of[1,-1]){nvBollard15(q,s*.55,Y(8.3),8.3,DS);const za=9.35,xa=s*(W(za)+.06);pBox(q,.1,.75,.1,0x2a2a2a,xa,1.05,za);pBox(q,.12,.12,.62,0x2a2a2a,xa,.7,za,.3,0,0);pBox(q,.1,.1,.5,0x2a2a2a,xa,1.38,za,0,0,0);pCyl(q,.12,.12,.12,0x111111,s*(W(9.75)+.02),1.45,9.75,0,0,1.5708,8);
  for(let i=0;i<6;i++){const t=i/5;pBox(q,.08,.05,.14,0x2a2a2a,s*.28*t,Y(9.2+t*.55)+.05,9.2+t*.55,0,0,i%2*1.57)}}
 pBox(q,.08,.6,.4,ST,0,Y(10.8)+.05,10.75);pCyl(q,.025,.03,1.2,WD,0,Y(10.6)+.6,10.6,0,0,0,5);
 for(const s of[1,-1])pBox(q,1.3,.36,.06,ST,s*.58,Y(4.3)+.18,4.3,0,s*.48,0);
 /* cañón de proa */
 const yb=Y(7);pCyl(q,.3,.42,.55,DS,0,yb+.27,7,0,0,0,10);pCyl(q,.52,.52,.06,DS,0,yb+.03,7,0,0,0,12);for(let i=0;i<8;i++){const a=i*.785;pBox(q,.05,.05,.05,0x222222,Math.sin(a)*.46,yb+.07,7+Math.cos(a)*.46)}
 const bowGun=nvNavGun15(g,0,yb+.55,7,HC,1);
 for(const s of[1,-1])nvAmmo15(q,s*.85,Y(5.6),5.6,s*.3);
 /* puente / caseta del timón */
 const z0=-.2,z1=3.0,hx=1.15,yW1=2.4,yW2=3.12,yR=3.55,zc=(z0+z1)/2,dz=z1-z0;
 pBox(q,2*hx,yW1-D,.12,HC,0,(D+yW1)/2,z1);pBox(q,2*hx+.1,yR-yW2,.14,HC,0,(yW2+yR)/2,z1);for(const x of[-hx,-.4,.4,hx])pBox(q,.14,yW2-yW1,.12,HC,x,(yW1+yW2)/2,z1);
 pBox(q,2*hx+.14,.95,.09,ST,0,D+.5,z1+.1,-.14,0,0);for(let i=0;i<9;i++)pBox(q,.04,.04,.03,0x222222,-1.05+i*.26,D+.88,z1+.08);
 pBox(qg,2*hx,yW2-yW1,.03,0,0,(yW1+yW2)/2,z1);
 for(const s of[1,-1]){pBox(q,.1,yW1-D,dz,HC,s*hx,(D+yW1)/2,zc);pBox(q,.12,yR-yW2,dz,HC,s*hx,(yW2+yR)/2,zc);for(const z of[z0+.05,1.05,2.0,z1-.05])pBox(q,.1,yW2-yW1,.14,HC,s*hx,(yW1+yW2)/2,z);pBox(qg,.03,yW2-yW1,dz,0,s*hx,(yW1+yW2)/2,zc);
  pBox(q,hx-.45,yR-D,.1,HC,s*(.45+(hx-.45)/2),(D+yR)/2,z0);nvRing15(q,s*(hx+.08),2.0,.55,Math.PI/2);pBox(q,.06,.12,.12,0x222222,s*(hx+.05),2.4,.55)}
 pBox(q,.9,yR-3.28,.1,HC,0,(3.28+yR)/2,z0);pBox(q,.85,1.95,.05,ST,.47+.0,D+.98,z0-.43,0,1.5708,0);pBox(q,.05,.08,.05,BR,.5,D+1.0,z0-.75);
 pBox(q,3.5,.1,3.6,ST,0,yR+.05,zc+.1);pBox(q,2.5,.05,.4,ST,0,yR-.06,z1+.25,-.25,0,0);
 const yr=yR+.1;nvRailL15(q,-1.72,z0-.05,-1.72,z1+.25,yr,.85,ST);nvRailL15(q,1.72,z0-.05,1.72,z1+.25,yr,.85,ST);nvRailL15(q,-1.72,z1+.25,1.72,z1+.25,yr,.85,ST,1);nvRailL15(q,-1.72,z0-.05,-.5,z0-.05,yr,.85,ST);nvRailL15(q,.5,z0-.05,1.72,z0-.05,yr,.85,ST);
 nvLadder15(q,0,D,z0-.12,yr-D,0,ST);
 pBox(q,2.2,.04,3.1,WD,0,D+.02,zc);/* interior: timón, telégrafo, bitácora, tubos acústicos, mesa de cartas */
 pBox(q,.3,.8,.25,WD,0,D+.4,2.55);pa(q,gTor(.32,.035,5,14),WD,0,D+1.02,2.38);for(let i=0;i<4;i++)pBox(q,.72,.035,.035,WD,0,D+1.02,2.38,0,0,i*.785);for(let i=0;i<8;i++){const a=i*.785;pBox(q,.03,.12,.03,WD,Math.cos(a)*.4,D+1.02+Math.sin(a)*.4,2.38,0,0,a-1.5708)}pCyl(q,.06,.06,.12,BR,0,D+1.02,2.42,1.5708,0,0,6);
 pCyl(q,.06,.08,.9,DS,.72,D+.45,2.6,0,0,0,6);pCyl(q,.2,.2,.14,BR,.72,D+1.0,2.6,1.5708,0,0,12);pCyl(q,.16,.16,.02,WH,.72,D+1.0,2.52,1.5708,0,0,12);pBox(q,.05,.32,.05,DS,.72,D+1.08,2.48,0,0,.4);
 pCyl(q,.13,.18,.95,BR,-.62,D+.47,2.5,0,0,0,8);pa(q,gSph(.15,8,5,0,1.5708),0x9aa0a0,-.62,D+.95,2.5);for(const x of[-.3,.3,.5])pCyl(q,.035,.035,.7,BR,x,D+1.6,2.9,0,0,0,6);pBox(q,.7,.06,.5,WD,-.75,D+.85,.35);pBox(q,.6,.8,.04,WD,-.75,D+.42,.12);
 /* mástil, verga, antenas, luces, proyector, lámpara de señales */
 pCyl(q,.06,.09,4.6,ST,0,yR+.1+2.3,.6,0,0,0,6);pBox(q,2.2,.06,.06,ST,0,7.2,.6);pa(q,gSph(.08,6,4),0xe0d8a0,0,8.3,.6);for(const s of[1,-1]){pBox(q,.1,.14,.1,s>0?0x2a6a2a:0x8a2020,s*1.05,7.12,.6)}
 nvSeg15(q,-1.05,7.2,.6,-.2,3.62,-10.8,.014,0x1a1a1a);nvSeg15(q,1.05,7.2,.6,.2,3.62,-10.8,.014,0x1a1a1a);for(const s of[1,-1])nvSeg15(q,s*1.05,7.2,.6,s*1.75,yR+.1,z0,.014,0x2a2a2a);
 for(let v=4.1;v<7.1;v+=.35)pBox(q,.3,.03,.03,ST,0,v,.52);
 const searchlight=nvLight15(g,0,yR+.1,2.6,1,0);
 pBox(q,.12,.25,.12,DS,1.3,yR+.22,2.95);pBox(q,.32,.3,.3,DS,1.3,yR+.47,2.95);pBox(q,.36,.04,.06,DS,1.3,yR+.64,2.95);
 const lamp=new T.Mesh(gSph(.13,10,8),new T.MeshBasicMaterial({color:0x3a3426}));lamp.position.set(1.3,yR+.47,3.13);g.add(lamp);
 /* ametralladoras en las alas del puente */
 const mgs=[];for(const s of[1,-1]){pCyl(q,.05,.07,.75,DS,s*1.45,yR+.1+.37,2.7,0,0,0,6);mgs.push(nvMG15(g,s*1.45,yR+.85,2.7,HC,true))}
 /* chimenea, silbato, vientos, ventiladores */
 pa(q,gCyl(.6,.66,.22,12),DS,0,D+.11,-1.05,0,0,0,1,1,1.35);pa(q,gCyl(.42,.48,2.7,12),ST,0,D+1.35,-1.05,-.1,0,0,1,1,1.4);pa(q,gCyl(.45,.45,.28,12),0x18181a,0,D+2.6,-1.17,-.1,0,0,1,1,1.4);pa(q,gCyl(.47,.47,.06,12),DS,0,D+2.2,-1.13,-.1,0,0,1,1,1.4);
 pCyl(q,.05,.06,.4,BR,0,D+2.0,-.42,0,0,0,6);for(const s of[1,-1])nvSeg15(q,0,3.3,-1.15,s*1.9,D+.05,-1.15,.014,0x2a2a2a);nvSeg15(q,0,3.3,-1.2,0,D+.05,-2.9,.014,0x2a2a2a);
 for(const s of[1,-1]){nvCowl15(q,s*.75,D,-1.95,.7,.13,ST,0);nvMush15(q,s*.9,D,-6.25,ST)}
 /* tubos lanzatorpedos */
 const tubes=[];for(const s of[1,-1]){const tg=nvGrp15(g,s*1.45,D+.64,-3);tg.rotation.y=s*.14;const qt=PB();
  pCyl(qt,.3,.3,5.0,ST,0,0,0,Math.PI/2,0,0,12);for(const zz of[-2.45,-.9,.9,2.42])pCyl(qt,.335,.335,.13,DS,0,0,zz,Math.PI/2,0,0,12);pCyl(qt,.25,.25,.02,0x070707,0,0,2.505,Math.PI/2,0,0,12);
  pCyl(qt,.36,.36,.22,DS,0,0,-2.6,Math.PI/2,0,0,12);pBox(qt,.46,.16,.5,DS,0,.34,-2.2);pBox(qt,.08,.08,.3,BR,s*.36,.1,-2.3);pCyl(qt,.09,.09,.4,0x5a5040,-s*.38,.0,-1.8,0,0,1.5708,6);
  for(const zz of[-1.5,1.4]){pBox(qt,.5,.6,.26,DS,0,-.36,zz);pBox(qt,.7,.06,.36,DS,0,-.64,zz)}pBox(qt,.26,.05,.26,0x262626,-s*.5,-.2,-2.3);pbMesh(qt,tg,VCV);
  const mouth=nvObj15(tg,0,0,2.55),torp=new T.Mesh(nvTorpGeo15(true),VCV);torp.position.z=.05;tg.add(torp);tubes.push({g:tg,side:s,mouth,torp})}
 pa(q,gTor(1.1,.04,4,20),DS,1.45,D+.03,-3,1.5708,0,0,.35,1,.35);pa(q,gTor(1.1,.04,4,20),DS,-1.45,D+.03,-3,1.5708,0,0,.35,1,.35);
 /* escotilla de máquinas (abierta) */
 pBox(q,1.0,.26,1.0,ST,0,D+.13,-5.9);pBox(q,.8,.02,.8,0x080808,0,D+.27,-5.9);pBox(q,.92,.9,.06,ST,0,D+.7,-6.45,-.22,0,0);pBox(q,.05,.06,.3,BR,0,D+.95,-6.4,-.22,0,0);
 nvAmmo15(q,-.95,D,-4.6,0,0x5a3a2a);pCyl(q,.12,.12,.04,BR,.6,D+.02,-9.6,0,0,0,8);pCyl(q,.12,.12,.04,BR,-.6,D+.02,-9.6,0,0,0,8);
 /* plataforma antiaérea */
 const zf=-7.8,yP=D+.55;pCyl(q,1.15,1.2,.55,ST,0,D+.275,zf,0,0,0,16);pCyl(q,1.17,1.17,.05,DS,0,yP,zf,0,0,0,16);pBox(q,.7,.28,.3,ST,0,D+.14,zf-1.32);
 {let pv=null;for(let i=0;i<=12;i++){const a=i/12*Math.PI*2,x=Math.sin(a)*1.1,z=zf+Math.cos(a)*1.1;if(i<12)pBox(q,.045,.8,.045,ST,x,yP+.4,z);if(pv&&!(i==6||i==7)){nvSeg15(q,pv[0],yP+.8,pv[1],x,yP+.8,z,.04,ST);nvSeg15(q,pv[0],yP+.42,pv[1],x,yP+.42,z,.03,ST)}pv=[x,z]}}
 const flak=nvGun15(g,0,yP,zf,.62,0,{n:2,sp:.3,len:1.7,r:.045,b0:.35,col:0x2c2c2c},qy=>{pCyl(qy,.25,.32,.5,DS,0,.25,0,0,0,0,10);pBox(qy,.62,.1,.42,DS,0,.5,0);for(const k of[1,-1])pBox(qy,.06,.35,.3,DS,k*.33,.64,0);pBox(qy,.26,.05,.26,0x2a2a2a,0,.55,-.7);pBox(qy,.05,.5,.05,DS,0,.3,-.7);pBox(qy,.92,.5,.03,HC,0,.88,.52,-.15,0,0)},
  qp=>{for(const k of[1,-1]){pBox(qp,.14,.2,.7,0x2c2c2c,k*.15,0,0);pBox(qp,.12,.26,.3,0x4a4a3a,k*.15,.22,-.05);pCyl(qp,.045,.045,.45,0x555555,k*.15,-.06,.3,Math.PI/2,0,0,6);pBox(qp,.1,.15,.25,0x3a2a1a,k*.36,-.1,-.42)}pa(qp,gTor(.12,.012,3,10),0x222222,0,.24,.42);pBox(qp,.02,.24,.02,0x222222,0,.14,.42)});
 for(const s of[1,-1]){nvAmmo15(q,s*1.5,D,-8.7,0);nvAmmo15(q,s*1.45,D,-6.9,.2)}
 /* popa: bitas, cabos, botes de humo, aros salvavidas, asta de bandera */
 for(const s of[1,-1]){nvBollard15(q,s*1.3,D,-10.1,DS);nvRing15(q,s*(W(-9.6)-.06),D+.5,-9.6,Math.PI/2);nvRing15(q,s*(W(5.0)-.06),Y(5)+.5,5.0,Math.PI/2);pCyl(q,.16,.16,.5,0x3a3a30,s*.7,D+.25,-10.5,0,0,0,8)}
 nvCoil15(q,.0,D,-9.3);nvCoil15(q,1.1,D,-4.6);
 pa(q,gCyl(.03,.045,2.45,6),WD,0,D+1.2,-10.62,-.12,0,0);const fl=nvFlag15(nvEisTex15(),1.5,1.0);fl.position.set(0,3.08,-10.78);fl.rotation.y=Math.PI/2;g.add(fl);
 /* número de casco */
 nvHullDecal15(g,d,nvNumTex15(num,'#ece8dc'),7.3,.95,1.5,.56);
 pbMesh(q,g,VCV);pbMesh(qg,g,GLASS);
 const st={helm:nvV15(0,D,1.75),bow:nvV15(0,Y(5.7),5.7),flak:nvV15(0,yP,zf-.95),torp:nvV15(0,D,-3),eng:nvV15(0,D,-4.95)};
 g.userData={kind:'wolf',ally,num,stations:st,stationYaw:{helm:0,bow:0,flak:0,torp:0,eng:Math.PI},bowGun,flak,mgs,tubes,
  firePts:[nvV15(0,D+.4,-5.9),nvV15(0,D+.3,-9.4),nvV15(0,yR+.2,1.4),nvV15(0,yP+.3,zf),nvV15(0,Y(8.5)+.3,8.5)],
  smokeOut:nvV15(0,4.0,-1.2),wakeOut:nvV15(0,0,-11),bowOut:nvV15(0,0,11),lamp,searchlight,len:22,beam:4.6,deckY:D,draft:1.1,deckAt:Y,
  crewSpots:[{p:nvV15(0,D,1.75),f:0},{p:nvV15(.75,Y(6.2),6.2),f:0},{p:nvV15(-.9,D,-5.9),f:Math.PI/2}]};
 return g}
/* =====================================================================
   PATRULLERO Zheng-Hua
   ===================================================================== */
function mkPatrol15(side){const HC=0x4a5448,ST=shade(HC,.72),DS=0x2e3230,DK=0x5e5240,RED=0x8a1a16,GOLD=0xc8a040,WD=0x5e4630;
 const g=new T.Group(),d=nvDef15({len:19,beam:4,free:1.0,draft:.9,color:HC,sheer:.45,bowFine:.55,sternW:.8,deck:DK,n:20});g.add(mkHull15(d));const Y=z=>hY15(d,z),W=z=>hW15(d,z),D=1.0,q=PB(),qg=PB();
 for(const s of[1,-1])for(let z=-9.5;z<9.4;z+=1){const z2=Math.min(z+1,9.45);nvSeg15(q,s*(W(z)+.02),Y(z)-.05,z,s*(W(z2)+.02),Y(z2)-.05,z2,.09,ST,.12);if(z>5)nvSeg15(q,s*(W(z)*.99+.03),Y(z)-.28,z,s*(W(z2)*.99+.03),Y(z2)-.28,z2,.03,RED,.18)}
 nvRail15(q,d,-9.2,8,1.4,ST,.1,.8);
 const gun=nvNavGun15(g,0,Y(5.4)+.5,5.4,HC,.85);pCyl(q,.28,.38,.5,DS,0,Y(5.4)+.25,5.4,0,0,0,10);
 for(const s of[1,-1]){nvBollard15(q,s*.45,Y(7.6),7.6,DS);nvAmmo15(q,s*.8,Y(4),4,0)}pCyl(q,.18,.22,.3,DS,0,Y(8.3)+.15,8.3,0,0,0,8);pCyl(q,.025,.03,1.1,WD,0,Y(9.2)+.55,9.2,0,0,0,5);
 /* caseta */
 const z0=-1.2,z1=1.8,hx=.95,yR=2.9;pBox(q,2*hx,yR-D,z1-z0,HC,0,(D+yR)/2,(z0+z1)/2);pBox(qg,2*hx+.02,.5,z1-z0-.4,0,0,2.35,(z0+z1)/2);pBox(qg,2*hx-.3,.5,.04,0,0,2.35,z1+.01);
 pBox(q,2.5,.1,z1-z0+.5,ST,0,yR+.05,(z0+z1)/2+.1);pBox(q,.7,1.6,.05,0x262a26,0,D+.8,z0-.01);nvRailL15(q,-1.2,z0,-1.2,z1+.3,yR+.1,.7,ST);nvRailL15(q,1.2,z0,1.2,z1+.3,yR+.1,.7,ST);nvRailL15(q,-1.2,z1+.3,1.2,z1+.3,yR+.1,.7,ST,1);
 nvLadder15(q,.7,D,z0-.1,yR-D+.1,0,ST);pBox(q,1.9,.4,.08,shade(HC,.85),0,D+.25,z1+.08,-.1,0,0);
 for(const s of[1,-1])nvRing15(q,s*(hx+.08),1.9,.3,Math.PI/2);
 nvLight15(g,0,yR+.1,1.2,.8,0);
 pCyl(q,.05,.08,4,ST,0,yR+2.1,0,0,0,0,6);pBox(q,1.7,.05,.05,ST,0,yR+3.3,0);nvSeg15(q,0,yR+4,0,0,D+2,-9.2,.015,0x1a1a1a);nvSeg15(q,0,yR+4,0,0,Y(9.2)+1.1,9.2,.015,0x1a1a1a);
 const mf=nvFlag15(nvZhFlag15(),1.0,.66);mf.position.set(.85,yR+3.0,0);mf.rotation.y=Math.PI/2;g.add(mf);
 /* chimenea con banda roja y anillo dorado */
 pa(q,gCyl(.38,.42,2.3,10),ST,0,D+1.15,-2.2,-.08,0,0,1,1,1.35);pa(q,gCyl(.4,.4,.45,10),RED,0,D+1.75,-2.25,-.08,0,0,1,1,1.35);pa(q,gCyl(.405,.405,.08,10),GOLD,0,D+1.75,-2.25,-.08,0,0,1,1,1.35);pa(q,gCyl(.4,.4,.2,10),0x161616,0,D+2.2,-2.29,-.08,0,0,1,1,1.35);
 for(const s of[1,-1]){nvCowl15(q,s*.75,D,-3.2,.6,.12,ST,0);nvMush15(q,s*.7,D,-4.6,ST)}
 pBox(q,1.2,.4,1.6,ST,0,D+.2,-4.2);pBox(q,1.0,.06,1.4,0x1a1a1a,0,D+.42,-4.2);
 /* ametralladora de popa y cargas de profundidad */
 pCyl(q,.06,.09,.9,DS,0,D+.45,-6.6,0,0,0,6);const mg=nvMG15(g,0,D+1.0,-6.6,HC,true);mg.yaw.rotation.y=Math.PI;
 for(const s of[1,-1]){for(let i=0;i<3;i++)pCyl(q,.2,.2,.45,0x2a2e2a,s*1.1,D+.24,-8.0-i*.48,Math.PI/2,0,0,10);pBox(q,.06,.3,1.5,DS,s*1.36,D+.15,-8.5);nvBollard15(q,s*1.1,D,-5.5,DS);nvAmmo15(q,s*1.2,D,-6.6,1.57)}
 nvCoil15(q,0,D,-8.6);
 pa(q,gCyl(.025,.04,1.9,6),WD,0,D+.95,-9.15,-.12,0,0);const fl=nvFlag15(nvZhFlag15(),1.3,.86);fl.position.set(0,2.5,-9.28);fl.rotation.y=Math.PI/2;g.add(fl);
 nvHullDecal15(g,d,nvZhRound15(),6.6,.62,.75,.75);nvHullDecal15(g,d,nvNumTex15('31','#d8b040'),4.6,.58,.9,.34);
 pbMesh(q,g,VCV);pbMesh(qg,g,GLASS);
 g.userData={kind:'patrol',side:side||'e',gun,mg,firePts:[nvV15(0,D+.3,-4.2),nvV15(0,yR+.1,.3),nvV15(0,Y(6)+.3,6),nvV15(0,D+.3,-7.5)],smokeOut:nvV15(0,3.3,-2.4),wakeOut:nvV15(0,0,-9.5),bowOut:nvV15(0,0,9.5),len:19,beam:4,deckY:D,draft:.9,deckAt:Y};
 return g}
/* =====================================================================
   DESTRUCTOR Zheng-Hua
   ===================================================================== */
function mkDestroyer15(){const HC=0x4c5258,ST=shade(HC,.75),DS=0x2e3236,DK=0x6a5e4a,RED=0x8a1a16,GOLD=0xc8a040,WD=0x5e4630;
 const g=new T.Group(),d=nvDef15({len:50,beam:6,free:2.6,draft:3,color:HC,sheer:1.2,bowFine:.72,sternW:.7,deck:DK,fcZ:10,fcH:.9,n:30});g.add(mkHull15(d));
 const Y=z=>hY15(d,z),W=z=>hW15(d,z),D=2.6,F=3.5,q=PB(),qg=PB();
 for(const s of[1,-1])for(let z=-25;z<24.9;z+=2){const z2=Math.min(z+2,24.95);nvSeg15(q,s*(W(z)+.02),Y(z)-.06,z,s*(W(z2)+.02),Y(z2)-.06,z2,.1,ST,.16)}
 nvRail15(q,d,-24.6,9.7,2,ST,.1,.9);nvRail15(q,d,10.2,22,2,ST,.1,.9);
 /* proa: anclas, cabrestantes, roda, asta */
 for(const s of[1,-1]){const za=21.5;pBox(q,.14,1.0,.14,0x222222,s*(W(za)+.07),Y(za)-.9,za);pBox(q,.16,.16,.8,0x222222,s*(W(za)+.07),Y(za)-1.4,za,.3,0,0);pCyl(q,.18,.18,.15,0x0e0e0e,s*(W(22.3)+.02),Y(22.3)-.5,22.3,0,0,1.5708,8);
  pCyl(q,.25,.3,.4,DS,s*.6,Y(20)+.2,20,0,0,0,10);nvBollard15(q,s*.9,Y(18.5),18.5,DS)}pCyl(q,.03,.04,1.6,WD,0,Y(24.6)+.8,24.6,0,0,0,5);
 /* torre de proa */
 const tA=Y(16.5);pCyl(q,1.3,1.4,.4,DS,0,tA+.2,16.5,0,0,0,14);
 const tur=[nvTurret15(g,0,tA+.4,16.5,{w:2.4,h:1.6,l:2.6,zf:1.2,sl:.6,col:HC,n:1,sp:0,len:4.4,r:.14,th:.8,tz:1.1,b0:.1}),null];
 /* puente */
 pBox(q,3.8,1.8,3.4,HC,0,F+.9,12.6);pBox(q,3.2,1.6,2.6,HC,0,F+2.6,12.9);pBox(qg,3.22,.5,2.0,0,0,F+2.8,12.9);pBox(qg,2.6,.5,.04,0,0,F+2.8,14.21);pBox(q,5.2,.12,3.4,ST,0,F+3.45,12.8);
 nvRailL15(q,-2.6,11.1,-2.6,14.5,F+3.5,.8,ST);nvRailL15(q,2.6,11.1,2.6,14.5,F+3.5,.8,ST);nvRailL15(q,-2.6,14.5,2.6,14.5,F+3.5,.8,ST);pBox(q,5.0,.7,.06,shade(HC,.9),0,F+3.85,14.5);
 pCyl(q,.08,.08,2.2,DS,0,F+4.5,12.4,0,0,1.5708,6);pBox(q,.4,.4,.4,DS,0,F+3.75,12.4);for(const s of[1,-1]){pCyl(q,.15,.15,.25,DS,s*1.1,F+4.5,12.4,0,0,1.5708,8);nvRing15(q,s*1.92,F+1.0,12.4,Math.PI/2)}
 const lights=[nvLight15(g,1.6,F+3.5,11.6,.9,.5),nvLight15(g,-1.6,F+3.5,11.6,.9,-.5)];
 nvLadder15(q,1.5,F,10.85,1.8,0,ST);
 /* trípode del palo trinquete */
 const mt=F+3.5;nvSeg15(q,0,mt,11.2,0,F+13,10.6,.18,ST);for(const s of[1,-1])nvSeg15(q,s*1.4,mt,10.2,0,F+9,10.6,.12,ST);pBox(q,3.2,.08,.08,ST,0,F+10.5,10.6);pBox(q,1.2,.5,1.2,ST,0,F+8.3,10.6);nvRailL15(q,-.6,9.9,.6,9.9,F+8.55,.4,ST,.6);
 const mf=nvFlag15(nvZhFlag15(),1.2,.8);mf.position.set(1.6,F+10.4,10.6);mf.rotation.y=Math.PI/2;g.add(mf);
 nvSeg15(q,0,F+12.8,10.6,0,F+6,-13,.016,0x1a1a1a);nvSeg15(q,0,F+12.8,10.6,0,Y(24.6)+1.6,24.6,.016,0x1a1a1a);
 /* casetas y chimeneas */
 pBox(q,2.8,1.4,11,HC,0,D+.7,1.2);pBox(q,3.0,.08,11.2,ST,0,D+1.44,1.2);for(let z=-3.5;z<6.5;z+=1.2)for(const s of[1,-1])pBox(q,.04,.22,.22,0x161616,s*1.41,D+.85,z);
 const smokeOuts=[];for(const[fz,hh] of[[5,7.0],[-1.6,6.6]]){const b=D+1.44;pa(q,gCyl(.95,1.0,.4,12),DS,0,b+.2,fz,0,0,0,1,1,1.5);pa(q,gCyl(.78,.85,hh,12),ST,0,b+hh/2,fz,-.07,0,0,1,1,1.5);
  pa(q,gCyl(.8,.8,.6,12),0x161616,0,b+hh-.3,fz-Math.sin(.07)*(hh/2-.3),-.07,0,0,1,1,1.5);pa(q,gCyl(.81,.81,.3,12),RED,0,b+hh-1.0,fz-Math.sin(.07)*(hh/2-1.0),-.07,0,0,1,1,1.5);
  pCyl(q,.08,.08,hh*.8,DS,.0,b+hh*.4,fz+1.25,0,0,0,6);for(const s of[1,-1])nvSeg15(q,0,b+hh*.8,fz,s*2.8,D+.05,fz,.02,0x2a2a2a);smokeOuts.push(nvV15(0,b+hh,fz-Math.sin(.07)*hh/2))}
 for(const s of[1,-1]){nvCowl15(q,s*1.9,D,7.6,1.1,.2,ST,0);nvCowl15(q,s*1.9,D,-4.2,1.0,.2,ST,Math.PI);nvCowl15(q,s*.9,D+1.44,2,.7,.16,ST,0)}
 /* botes en pescantes */
 for(const s of[1,-1]){const bx=s*(W(1.5)-.1);pa(q,gCyl(.6,.6,5,8,),0x8a8070,bx,D+1.9,1.5,Math.PI/2,0,0,1,1,.6);pBox(q,1.0,.08,4.6,0x5a4630,bx,D+2.25,1.5);for(const zz of[-.5,3.5]){pCyl(q,.07,.07,2.2,ST,s*(W(1.5)-.5),D+1.1,zz,0,0,0,6);nvSeg15(q,s*(W(1.5)-.5),D+2.2,zz,bx,D+2.6,zz,.08,ST)}}
 /* antiaéreo, tubos, palo mayor, proyector */
 pCyl(q,1.3,1.3,1.4,HC,0,D+.7,-6.6,0,0,0,14);pCyl(q,1.36,1.36,.06,DS,0,D+1.42,-6.6,0,0,0,14);nvLadder15(q,0,D,-5.2,1.45,0,ST);
 const aa=nvAA15(g,0,D+1.42,-6.6,HC,.8);
 {const tg=nvGrp15(g,0,D,-10.5);tg.rotation.y=.4;const qt=PB();pCyl(qt,.8,.9,.4,DS,0,.2,0,0,0,0,12);for(const x of[-.55,0,.55])pCyl(qt,.24,.24,4.6,ST,x,.75,0,Math.PI/2,0,0,10);pBox(qt,1.8,.25,.6,DS,0,.5,-2.0);pBox(qt,.5,.6,.5,DS,1.0,.6,-1.6);pbMesh(qt,tg,VCV)}
 pCyl(q,.1,.14,9,ST,0,D+4.5,-13,0,0,0,6);pBox(q,1.8,.06,.06,ST,0,D+7.2,-13);pBox(q,1.8,.12,1.8,ST,0,D+3.2,-13);nvRailL15(q,-.9,-13.9,.9,-13.9,D+3.26,.5,ST,.9);
 lights.push(nvLight15(g,0,D+3.26,-12.4,.9,Math.PI));
 /* torre de popa, cargas de profundidad, bandera */
 pCyl(q,1.3,1.4,.6,DS,0,D+.3,-17,0,0,0,14);tur[1]=nvTurret15(g,0,D+.6,-17,{w:2.4,h:1.6,l:2.6,zf:1.2,sl:.6,col:HC,n:1,sp:0,len:4.4,r:.14,th:.8,tz:1.1,b0:.1});tur[1].yaw.rotation.y=Math.PI;
 for(const s of[1,-1]){pBox(q,.08,.6,3.4,DS,s*1.75,D+.3,-22.6);pBox(q,.08,.6,3.4,DS,s*1.05,D+.3,-22.6);for(let i=0;i<6;i++)pCyl(q,.28,.28,.55,0x2a2e2a,s*1.4,D+.36,-21.2-i*.56,Math.PI/2,0,0,10);nvBollard15(q,s*2.0,D,-19,DS);nvRing15(q,s*(W(-20)-.06),D+.55,-20,Math.PI/2);nvAmmo15(q,s*1.6,D,-15,0)}
 pa(q,gCyl(.035,.05,2.8,6),WD,0,D+1.4,-24.5,-.12,0,0);const fl=nvFlag15(nvZhFlag15(),1.8,1.2);fl.position.set(0,D+2.1,-24.68);fl.rotation.y=Math.PI/2;g.add(fl);
 nvHullDecal15(g,d,nvZhRound15(),19.5,2.0,1.4,1.4);nvHullDecal15(g,d,nvNumTex15('Z-07','#e6e0d0'),15.6,2.0,2.4,.9);
 pbMesh(q,g,VCV);pbMesh(qg,g,GLASS);
 g.userData={kind:'destroyer',turrets:tur,aa,lights,firePts:[nvV15(0,F+3.6,12.6),smokeOuts[0].clone().setY(D+3),smokeOuts[1].clone().setY(D+3),nvV15(0,D+.3,-10.5),nvV15(0,D+.4,-20),nvV15(0,Y(20)+.3,20),nvV15(1.5,D+.2,-3)],
  smokeOuts,wakeOut:nvV15(0,0,-25),bowOut:nvV15(0,0,25),len:50,beam:6,deckY:D,draft:3,deckAt:Y};
 return g}
/* =====================================================================
   ZH-01 «TIANLONG» — acorazado clase Dragón Imperial
   ===================================================================== */
function mkTianlong15(){const HC=0x3e4248,ST=shade(HC,.8),LT=0x50555c,DS=0x26292d,DK=0x7a6a50,RED=0x7e1614,GOLD=0xc8a040,WD=0x5e4630;
 const L=115,hl=57.5,B=18,FR=5,DR=7,FC=-22,FH=1.4;
 const g=new T.Group(),d=nvDef15({len:L,beam:B,free:FR,draft:DR,color:HC,sheer:3,bowFine:.6,sternW:.62,deck:DK,fcZ:FC,fcH:FH,n:34});g.add(mkHull15(d));
 const Y=z=>hY15(d,z),W=z=>hW15(d,z),M=FR+FH,q=PB(),qd=PB();
 /* regala, cinturón blindado, portillos, barandillas */
 for(const s of[1,-1]){for(let z=-hl;z<hl-.1;z+=3){const z2=Math.min(z+3,hl-.05);nvSeg15(q,s*(W(z)+.03),Y(z)-.1,z,s*(W(z2)+.03),Y(z2)-.1,z2,.22,ST,.3)}
  for(let z=-40;z<42;z+=6){const z2=z+6,x0=W(z)*.965+.1,x1=W(z2)*.965+.1,Lz=Math.hypot(x1-x0,6);pBox(qd,.32,4.2,Lz,0x35383d,s*(x0+x1)/2,.5,(z+z2)/2,0,Math.atan2(s*(x1-x0),6),0,.02)}
  for(let z=-50;z<46;z+=3.2){const yy=z>FC?5.2:3.7,dw=(W(z+.3)-W(z-.3))/.6;pBox(qd,.4,.4,.08,0x101214,s*(W(z)+.02),yy,z,0,Math.atan2(s,-dw),0,0)}}
 nvRail15(q,d,-57,FC-.1,3.5,ST,.15,1.0);nvRail15(q,d,FC+.1,52,3.5,ST,.15,1.0);
 /* proa: anclas, escobenes, cabrestantes, cadenas, roda, asta de torrotito */
 for(const s of[1,-1]){const za=49.5,xa=s*(W(za)+.12),ya=Y(za)-2.3;pCyl(qd,.5,.5,.5,0x0c0c0e,s*(W(51)+.05),Y(51)-1.3,51,0,0,1.5708,10);pBox(qd,.3,2.2,.3,0x1e1e20,xa,ya,za);pBox(qd,.32,.32,1.8,0x1e1e20,xa,ya-1.0,za,.35,0,0);pBox(qd,.25,.25,1.6,0x1e1e20,xa,ya+1.05,za);
  pCyl(q,.6,.7,.7,DS,s*1.6,Y(46)+.35,46,0,0,0,12);pCyl(q,.72,.72,.12,DS,s*1.6,Y(46)+.72,46,0,0,0,12);for(let i=0;i<9;i++){const t=i/8;pBox(q,.25,.12,.42,0x222222,s*(1.6+t*.8),Y(46+t*4.5)+.06,46+t*4.5,0,0,i%2*1.57)}
  nvBollard15(q,s*2.4,Y(42),42,DS);nvBollard15(q,s*(W(30)-1.2),Y(30),30,DS)}
 pCyl(q,.05,.06,3,WD,0,Y(56)+1.5,56,0,0,0,6);{const jf=nvFlag15(nvZhFlag15(),2.2,1.45);jf.position.set(0,Y(56)+2.3,56.1);jf.rotation.y=Math.PI/2;g.add(jf)}
 nvSeg15(q,0,Y(56)+3,56,0,34,13,.04,0x1a1a1a);
 /* barbetas y torres principales */
 const tz={A:37,B:25,C:-41},bh={A:1.4,B:4.6,C:1.4},turrets=[];
 for(const nm of['A','B','C']){const z=tz[nm],yb=Y(z)+bh[nm];pCyl(q,4.9,5.0,bh[nm]+1.2,ST,0,yb-(bh[nm]+1.2)/2,z,0,0,0,20);pCyl(q,5.05,5.05,.2,DS,0,yb-.1,z,0,0,0,20);
  const tt=nvTurret15(g,0,yb,z,{w:9.6,h:3.2,l:10.5,zf:3.6,sl:1.4,col:LT,n:3,sp:2.7,len:17,r:.5,th:1.55,tz:3.4,b0:.4,rf:true,seg:10,fy:qy=>{pBox(qy,.3,.2,8,DS,4.9,.3,-1.5);pBox(qy,.3,.2,8,DS,-4.9,.3,-1.5);for(let i=0;i<3;i++)pBox(qy,1.0,.06,.9,DS,-3+i*3,3.28,-4.5)}});
  tt.name=nm;tt.pos=nvV15(0,yb,z);if(nm==='C')tt.yaw.rotation.y=Math.PI;turrets.push(tt)}
 /* superestructura central (cubierta de botes) */
 const yB=M+3.2;pBox(q,12,3.2,26,HC,0,M+1.6,-3);pBox(q,12.6,.16,26.6,ST,0,yB+.08,-3);for(let z=-15;z<10;z+=2)for(const s of[1,-1])pBox(q,.06,.35,.35,0x111214,s*6.02,M+2.1,z);
 nvRailL15(q,-6.2,-16.2,-6.2,10.2,yB+.16,.9,ST,2);nvRailL15(q,6.2,-16.2,6.2,10.2,yB+.16,.9,ST,2);nvRailL15(q,-6.2,-16.2,6.2,-16.2,yB+.16,.9,ST,2);
 for(const s of[1,-1]){nvLadder15(q,s*5.4,M,-16.25,3.3,Math.PI,ST);for(const z of[-12,-6,6])nvCowl15(q,s*4.8,yB,z,1.2,.3,ST,s*1.57)}
 /* botes y grúas */
 for(const s of[1,-1]){for(const bz of[-5.5,-12.5]){pa(q,gCyl(.9,.9,7,10),0xb0a890,s*4.3,yB+1.1,bz,Math.PI/2,0,0,1,1,.65);pBox(q,1.55,.1,6.5,0x5a4630,s*4.3,yB+1.62,bz);pBox(q,.9,.6,1.8,0xb0a890,s*4.3,yB+1.8,bz+1.5);for(const k of[-2.2,2.2])pBox(q,1.6,.8,.3,DS,s*4.3,yB+.4,bz+k)}
  pCyl(q,.35,.45,6,ST,s*5.2,yB+3,-16,0,0,0,10);nvSeg15(q,s*5.2,yB+5.6,-16,s*5.2,yB+3.5,-7,.35,ST,.5);nvSeg15(q,s*5.2,yB+5.6,-16,s*5.2,yB+3.6,-7.2,.03,0x1a1a1a);pBox(q,1.0,1.2,1.4,DS,s*5.2,yB+1.2,-16.9)}
 /* torreta secundarias (5 por banda) */
 const sec=[];for(const s of[1,-1])for(const z of[19.5,10.5,1,-8.5,-17.5]){const x=s*Math.min(W(z)-2.0,7.3),yb=Y(z)+.9;pCyl(q,1.55,1.65,1.2,ST,x,yb-.6,z,0,0,0,12);
  const st=nvTurret15(g,x,yb,z,{w:2.6,h:1.55,l:3.0,zf:1.3,sl:.7,col:LT,n:1,sp:0,len:5.6,r:.18,th:.75,tz:1.2,b0:.1,seg:8});st.yaw.rotation.y=s*.35;st.side=s;st.pos=nvV15(x,yb,z);sec.push(st)}
 /* antiaéreos (cubierta de botes) */
 const aa=[];for(const[x,z] of[[5,8.6],[-5,8.6],[3.8,-14.6],[-3.8,-14.6]]){pCyl(q,1.4,1.4,.9,HC,x,yB+.45,z,0,0,0,12);const a=nvAA15(g,x,yB+.9,z,HC,1);a.yaw.rotation.y=x>0?.8:-.8;a.pos=nvV15(x,yB+.9,z);aa.push(a)}
 /* chimeneas (Groups) */
 const funnels=[],smokeOuts=[],lights=[];
 for(const[fz,hh] of[[3.2,13],[-9.2,12]]){const fg=nvGrp15(g,0,yB,fz),qf=PB();pa(qf,gCyl(2.7,2.9,1.2,16),DS,0,.6,0,0,0,0,1,1,1.45);pa(qf,gCyl(2.3,2.55,hh,16),ST,0,hh/2,0,-.05,0,0,1,1,1.5);
  const tz2=-Math.sin(.05)*hh/2;pa(qf,gCyl(2.36,2.36,.9,16),0x141416,0,hh-.45,tz2*.93,-.05,0,0,1,1,1.5);pa(qf,gCyl(2.37,2.37,.5,16),RED,0,hh-2.0,tz2*.7,-.05,0,0,1,1,1.5);pa(qf,gCyl(2.375,2.375,.14,16),GOLD,0,hh-1.65,tz2*.75,-.05,0,0,1,1,1.5);
  pa(qf,gCyl(2.7,2.7,.25,16),DS,0,hh+.35,tz2*1.05,-.05,0,0,1,1,1.45);for(let i=0;i<4;i++)pBox(qf,.12,.6,.12,DS,Math.cos(i*1.57)*2.1,hh+.1,tz2+Math.sin(i*1.57)*3,0,0,0);
  for(const s of[1,-1]){pCyl(qf,.18,.18,hh*.9,DS,s*.9,hh*.45,3.55,0,0,0,6);pCyl(qf,.12,.12,hh*.7,DS,s*1.5,hh*.35,-3.4,0,0,0,6)}
  for(let v=1.5;v<hh-1;v+=.45)pBox(qf,.5,.04,.05,DS,0,v,-3.65);
  pBox(qf,7.6,.15,3.2,DS,0,hh*.55,0);nvRailL15(qf,-3.8,-1.6,-3.8,1.6,hh*.55+.07,.8,ST,1.1);nvRailL15(qf,3.8,-1.6,3.8,1.6,hh*.55+.07,.8,ST,1.1);
  pbMesh(qf,fg,VCV);funnels.push(fg);smokeOuts.push(nvV15(0,yB+hh+.5,fz+tz2*1.05));if(fz<0){lights.push(nvLight15(fg,3.0,hh*.55+.07,.6,1.6,.6));lights.push(nvLight15(fg,-3.0,hh*.55+.07,.6,1.6,-.6))}}
 /* puente: torre pagoda escalonada (Group) */
 const bz=13,bridge=nvGrp15(g,0,Y(bz),bz),qb=PB(),qbg=PB();{let y=0;const tiers=[[13,3.2,9,0],[10.5,2.8,8,.3],[8.4,2.6,6.4,.4],[6.6,2.4,5.2,.4],[5,2.2,4,.3],[3.6,2,3,.2]];
  pCyl(qb,2.4,2.5,6.2,LT,0,3.1+.5,5.3,0,0,0,14);pCyl(qb,2.55,2.55,.3,DS,0,6.8,5.3,0,0,0,14);for(let i=0;i<6;i++)pBox(qb,.5,.14,.05,0x0e0e10,Math.sin(i*.5-1.25)*2.42,5.6,5.3+Math.cos(i*.5-1.25)*2.42,0,i*.5-1.25,0);
  tiers.forEach(([w,h,dd,oz],i)=>{const zc=-oz*i;pBox(qb,w,h,dd,HC,0,y+h/2,zc);if(i>0){pBox(qbg,w+.04,h*.32,dd+.04,0,0,y+h*.62,zc)}
   const ew=w+1.6-i*.12,ed=dd+1.4;pBox(qb,ew,.14,ed,ST,0,y+h+.07,zc);pBox(qb,ew+.3,.08,ed+.3,RED,0,y+h+.18,zc);
   for(const sx of[1,-1])for(const sz of[1,-1])pBox(qb,.5,.14,.9,RED,sx*(ew/2+.1),y+h+.32,zc+sz*(ed/2+.05),.35*sz,0,-.5*sx);
   if(i==1||i==2)for(const sx of[1,-1])nvRailL15(qb,sx*ew/2,zc-ed/2,sx*ew/2,zc+ed/2,y+h+.14,.8,ST,1.5);y+=h+.14});
  const yt=y;pBox(qb,17,.18,3.2,ST,0,9.6,1.0);nvRailL15(qb,-8.5,2.6,8.5,2.6,9.69,.9,ST,2.2);nvRailL15(qb,-8.5,-.6,-8.5,2.6,9.69,.9,ST,1.5);nvRailL15(qb,8.5,-.6,8.5,2.6,9.69,.9,ST,1.5);
  pCyl(qb,1.6,1.7,1.4,LT,0,yt+.7,-.6,0,0,0,14);pCyl(qb,.38,.38,11,LT,0,yt+1.2,-.6,0,0,1.5708,10);for(const s of[1,-1]){pCyl(qb,.5,.5,.4,DS,s*5.5,yt+1.2,-.6,0,0,1.5708,10);pBox(qb,.6,.8,.6,DS,s*1.6,yt+1.0,-.6)}
  pCyl(qb,.22,.32,13,ST,0,yt+8,-.8,0,0,0,8);pBox(qb,6,.14,.14,ST,0,yt+9.5,-.8);pBox(qb,4,.12,.12,ST,0,yt+12,-.8);pa(qb,gSph(.3,8,6),0xd8d2b0,0,yt+14.6,-.8);
  for(const s of[1,-1]){nvSeg15(qb,s*3,yt+9.5,-.8,s*5,8,1,.03,0x1a1a1a);nvSeg15(qb,0,yt+14,-.8,s*2,yt+9.5,-.8,.02,0x1a1a1a)}
  for(const s of[1,-1])nvLadder15(qb,s*2.6,0,-4.9,yt,Math.PI,ST);
  pbMesh(qb,bridge,VCV);pbMesh(qbg,bridge,GLASS);lights.push(nvLight15(bridge,7.4,9.69,1.6,1.4,.7));lights.push(nvLight15(bridge,-7.4,9.69,1.6,1.4,-.7));
  const bf=nvFlag15(nvZhFlag15(),2.6,1.7);bf.position.set(2.9,yt+9.4,-.8);bf.rotation.y=Math.PI/2;bridge.add(bf);
  nvSeg15(q,0,Y(bz)+yt+14,bz-.8,0,32,-27,.04,0x1a1a1a);bridge.userData.top=yt}
 /* catapulta transversal (hidroavión) */
 const cz=-19.5,cy=M;pCyl(q,1.6,1.8,1.4,DS,0,cy+.7,cz,0,0,0,14);pBox(q,15,.35,1.3,ST,0,cy+1.6,cz);for(let x=-7;x<7.1;x+=1.4){pBox(q,.1,.5,1.3,DS,x,cy+1.25,cz);nvSeg15(q,x,cy+1.45,cz-.6,x+1.4,cy+1.45,cz+.6,.06,DS)}pBox(q,15,.08,.12,0x8a8a8a,0,cy+1.8,cz-.4);pBox(q,15,.08,.12,0x8a8a8a,0,cy+1.8,cz+.4);pBox(q,1.4,.6,1.6,DS,-6.6,cy+2.0,cz);
 /* superestructura de popa, trípode, director de popa */
 const az=-27;pBox(q,9,3.4,7,HC,0,FR+1.7,az);pBox(q,9.6,.14,7.6,ST,0,FR+3.47,az);pBox(q,6,2.4,4.5,HC,0,FR+4.7,az+.5);pBox(qd,6.04,.6,4.54,0x18191c,0,FR+5.0,az+.5);pBox(q,6.8,.12,5.2,ST,0,FR+6.0,az+.5);
 pCyl(q,1.3,1.4,1.2,LT,0,FR+6.7,az+.5,0,0,0,12);pCyl(q,.3,.3,7,LT,0,FR+7.0,az+.5,0,0,1.5708,8);
 const mt=FR+6;nvSeg15(q,0,mt,az-1.5,0,FR+24,az-1.8,.4,ST);for(const s of[1,-1])nvSeg15(q,s*3.2,FR+3.5,az-4.5,0,FR+19,az-1.8,.3,ST);pBox(q,8,.18,.18,ST,0,FR+20,az-1.8);pBox(q,2.4,1.2,2.4,ST,0,FR+17,az-1.8);
 {const af=nvFlag15(nvZhFlag15(),2.4,1.6);af.position.set(3.9,FR+19.9,az-1.8);af.rotation.y=Math.PI/2;g.add(af)}
 nvRailL15(q,-4.8,az-3.8,4.8,az-3.8,FR+3.54,.9,ST,1.6);nvLadder15(q,3.2,FR,az+3.6,3.5,0,ST);
 for(const s of[1,-1]){nvCowl15(q,s*6.5,FR,-31,1.2,.3,ST,0);nvBollard15(q,s*(W(-46)-1.3),FR,-46,DS);nvBollard15(q,s*(W(-53)-1.3),FR,-53,DS);nvBollard15(q,s*(W(14)-1.3),M,14,DS);nvRing15(q,s*(W(-50)-.12),FR+.6,-50,Math.PI/2);nvRing15(q,s*(W(-33)-.12),FR+.6,-33,Math.PI/2)}
 for(let i=0;i<5;i++)nvAmmo15(q,-2+i*1.0,FR,-33.5,0);nvCoil15(q,2.5,FR,-52);nvCoil15(q,-2.5,FR,-52);
 /* popa: asta y bandera */
 pa(q,gCyl(.06,.09,5,6),WD,0,FR+2.5,-56.4,-.15,0,0);{const fl=nvFlag15(nvZhFlag15(),3.6,2.4);fl.position.set(0,FR+3.6,-56.75);fl.rotation.y=Math.PI/2;g.add(fl)}
 /* emblema del dragón imperial a ambos lados de la proa */
 nvHullDecal15(g,d,nvZhRound15(),47,5.4,4.2,4.2);nvHullDecal15(g,d,nvNumTex15('ZH-01','#e0c060'),40,5.4,6,2.2);
 pbMesh(q,g,VCV);pbMesh(qd,g,VCV);
 const sectors=[
  {id:'timon',min:nvV15(-B/2-2,-DR-1,-hl-3),max:nvV15(B/2+2,0,-hl+5)},
  {id:'propulsion',min:nvV15(-B/2-2,-DR-1,-hl+5),max:nvV15(B/2+2,0,-hl+14)},
  {id:'torreA',min:nvV15(-6,Y(37),30),max:nvV15(6,Y(37)+bh.A+4,44)},
  {id:'torreB',min:nvV15(-6,Y(25)+1,18.5),max:nvV15(6,Y(25)+bh.B+4,31)},
  {id:'torreC',min:nvV15(-6,FR,-48),max:nvV15(6,FR+bh.C+4,-34)},
  {id:'puente',min:nvV15(-9,M+1,7),max:nvV15(9,Y(bz)+48,19)},
  {id:'chimeneas',min:nvV15(-4.5,yB+.5,-14),max:nvV15(4.5,yB+15,8)},
  {id:'proa',min:nvV15(-B/2-2,-DR-1,hl-14),max:nvV15(B/2+2,30,hl+4)},
  {id:'popa',min:nvV15(-B/2-2,-DR-1,-hl-3),max:nvV15(B/2+2,30,-hl+14)},
  {id:'babor',min:nvV15(-B/2-2,-DR-1,-hl),max:nvV15(-B/2+2.5,M+.6,hl)},
  {id:'estribor',min:nvV15(B/2-2.5,-DR-1,-hl),max:nvV15(B/2+2,M+.6,hl)},
  {id:'babor',min:nvV15(-B/2-2,-DR-1,-hl),max:nvV15(0,FR-.5,hl)},
  {id:'estribor',min:nvV15(0,-DR-1,-hl),max:nvV15(B/2+2,FR-.5,hl)},
  {id:'cubierta',min:nvV15(-B/2-2,FR-1.5,-hl-3),max:nvV15(B/2+2,60,hl+4)}];
 g.userData={kind:'tianlong',turrets,sec,aa,sectors,
  firePts:[nvV15(0,Y(37)+bh.A+3.4,37),nvV15(0,Y(25)+bh.B+3.4,25),nvV15(0,FR+bh.C+3.4,-41),nvV15(0,Y(bz)+12,bz),nvV15(0,yB+13,3.2),nvV15(0,yB+12,-9.2),nvV15(4,M+.2,-3),nvV15(-4,M+.2,14),nvV15(0,Y(48)+.3,48),nvV15(0,FR+.3,-50),nvV15(0,FR+3.6,az)],
  smokeOuts,wakeOut:nvV15(0,0,-hl),bowOut:nvV15(0,0,hl),lights,len:L,beam:B,deckY:FR,deckFore:M,draft:DR,deckAt:Y,bridge,funnels,
  catapult:nvV15(-6.6,cy+2.3,cz),catapultYaw:Math.PI/2};
 return g}
/* =====================================================================
   LANCHA DE DESEMBARCO
   ===================================================================== */
function mkLanding15(){const HC=0x4a5448,ST=shade(HC,.75),DS=0x2e3230,BL=0x5a2420,g=new T.Group(),q=PB();
 pBox(q,3.4,.55,8.6,BL,0,-.275,-.6);pBox(q,3.4,.12,8.6,0x1c1c1c,0,.04,-.6);pBox(q,3.3,.5,1.6,BL,0,-.12,4.1,-.32,0,0);
 for(const s of[1,-1]){pBox(q,.14,1.5,10,HC,s*1.63,.85,-.1);pBox(q,.2,.12,10,ST,s*1.63,1.62,-.1);pBox(q,.14,.5,9.6,BL,s*1.63,-.2,-.6);for(let z=-4;z<4.5;z+=1.4)pBox(q,.06,1.3,.08,ST,s*1.72,.9,z);nvRing15(q,s*1.75,1.0,-3.2,Math.PI/2)}
 pBox(q,3.4,1.9,.14,HC,0,.65,-5.05);pBox(q,3.0,.08,8.8,0x5a5040,0,.36,-.5);
 for(const s of[1,-1]){pBox(q,.42,.08,6.2,0x5e4a32,s*.8,.82,.4);for(const z of[-2.4,.4,3.2])pBox(q,.08,.42,.3,DS,s*.8,.58,z)}
 pBox(q,1.4,1.0,1.4,ST,0,.9,-4.2);pBox(q,1.2,.08,1.2,0x1a1a1a,0,1.42,-4.2);pBox(q,.9,1.3,.9,HC,1.0,1.05,-3.6);pBox(q,.86,.25,.04,0x0e0e0e,1.0,1.5,-3.14);pCyl(q,.18,.18,.04,0x3a2a1a,1.0,1.25,-3.9,1.5708,0,0,8);
 pCyl(q,.05,.07,1.3,DS,-1.0,1.0,-3.8,0,0,0,6);const mg=nvMG15(g,-1.0,1.7,-3.8,HC,true);pCyl(q,.03,.04,1.4,0x5e4630,0,1.3,-5.0,-.1,0,0,5);
 const fl=nvFlag15(nvZhFlag15(),.8,.52);fl.position.set(0,1.8,-5.1);fl.rotation.y=Math.PI/2;g.add(fl);
 pbMesh(q,g,VCV);const ramp=nvGrp15(g,0,.4,4.75),qr=PB();pBox(qr,3.1,1.9,.14,HC,0,.95,0);for(const x of[-1.1,0,1.1])pBox(qr,.1,1.8,.1,ST,x,.95,.1);for(let y=.3;y<1.9;y+=.35)pBox(qr,2.9,.04,.05,DS,0,y,-.09);pBox(qr,3.1,.12,.16,ST,0,1.85,0);pCyl(qr,.08,.08,3.2,DS,0,0,0,0,0,1.5708,6);pbMesh(qr,ramp,VCV);
 const seats=[];for(const s of[1,-1])for(const z of[2.9,1.4,-.1,-1.6])seats.push(nvV15(s*.8,.4,z));
 g.userData={kind:'landing',ramp,rampOpen:1.35,seats,mg,wakeOut:nvV15(0,0,-5.1),bowOut:nvV15(0,0,4.9),len:10,beam:3.4,deckY:.4,draft:.6};return g}
/* =====================================================================
   HIDROAVIONES Zheng-Hua ('rec' biplaza de reconocimiento / 'att' de ataque)
   ===================================================================== */
function mkSeaplane15(kind){const att=kind==='att',FC=att?0x5b604a:0x6e7660,WC=att?0x6e7058:0x8c8e74,RED=0x8a1a16,GOLD=0xc8a040,DS=0x2a2a2a,FL=0x7a7e70;
 const g=new T.Group(),q=PB(),span=att?14:13,sp2=span*.9;
 /* fuselaje y motor radial */
 pBox(q,1.1,1.15,2.4,FC,0,0,2.4);pBox(q,1.0,1.05,2.6,FC,0,-.02,.0);pCyl(q,.16,.52,4.6,FC,0,.0,-3.5,-Math.PI/2,0,0,8);pBox(q,.9,.12,6,shade(FC,.85),0,.55,-.9);
 pCyl(q,.66,.6,.8,RED,0,0,3.95,Math.PI/2,0,0,14);for(let i=0;i<7;i++){const a=i/7*Math.PI*2;pCyl(q,.1,.12,.36,DS,Math.cos(a)*.52,Math.sin(a)*.52,4.0,0,0,a-Math.PI/2,6)}pCyl(q,.22,.22,.3,DS,0,0,4.38,Math.PI/2,0,0,8);
 for(const s of[1,-1])pCyl(q,.06,.06,1.6,0x3a3430,s*.52,-.35,2.6,Math.PI/2,0,0,6);
 /* alas */
 const yu=1.75,yl=-.42;pBox(q,span,.15,1.85,WC,0,yu,1.3);pBox(q,sp2,.13,1.65,WC,0,yl,1.4);pBox(q,span,.06,.25,shade(WC,.8),0,yu-.03,.42);pBox(q,sp2,.06,.25,shade(WC,.8),0,yl-.02,.62);
 for(const s of[1,-1]){for(const x of[span*.32,span*.15]){pBox(q,.08,yu-yl,.1,DS,s*x,(yu+yl)/2,1.9);pBox(q,.08,yu-yl,.1,DS,s*x,(yu+yl)/2,.8)}nvSeg15(q,s*span*.32,yu,1.8,s*span*.15,yl,1.8,.02,0x1a1a1a);nvSeg15(q,s*span*.32,yl,1.8,s*span*.15,yu,1.8,.02,0x1a1a1a);pBox(q,.07,yu-.55,.08,DS,s*.45,(yu+.55)/2,1.9,0,0,-s*.15);pBox(q,.07,yu-.55,.08,DS,s*.45,(yu+.55)/2,.9,0,0,-s*.15)}
 /* cola */
 pBox(q,4,.08,1.2,WC,0,.35,-5.3);pBox(q,.1,1.6,1.3,FC,0,1.05,-5.5);for(let i=0;i<3;i++)pBox(q,.12,1.4,.32,i%2?GOLD:RED,0,1.0,-6.0-i*.3+.3);
 /* flotadores */
 const fl=(x,y,l,w)=>{pBox(q,w,.62,l,FL,x,y,0);pBox(q,w*.9,.5,1.4,FL,x,y+.06,l/2+.55,-.25,0,0);pBox(q,w*.6,.35,.9,FL,x,y+.08,-l/2-.3,.15,0,0);pBox(q,w*1.02,.06,l,shade(FL,.7),x,y-.33,0)};
 if(att){for(const s of[1,-1]){fl(s*1.6,-2.0,6.4,.75);for(const z of[2.1,-.6]){nvSeg15(q,s*1.6,-1.7,z,s*.45,-.4,z,.08,DS);nvSeg15(q,s*1.6,-1.7,z,0,-.5,z+.4,.06,DS)}}}
 else{fl(0,-2.0,6.6,.85);for(const z of[2.2,-.4])for(const s of[1,-1])nvSeg15(q,0,-1.7,z,s*.45,-.45,z,.08,DS);for(const s of[1,-1]){pBox(q,.4,.35,1.4,FL,s*sp2*.44,yl-.75,1.4);nvSeg15(q,s*sp2*.44,yl-.6,1.6,s*sp2*.44,yl,1.6,.05,DS);nvSeg15(q,s*sp2*.44,yl-.6,1.0,s*sp2*.44,yl,1.4,.05,DS)}}
 /* cabinas: piloto con gafas; ametrallador trasero en 'rec' */
 const pil=(z)=>{pa(q,gSph(.19,8,6),0xc89a70,0,.78,z);pa(q,gSph(.2,8,5,0,1.6),0x4a3420,0,.82,z-.02);for(const s of[1,-1])pCyl(q,.06,.06,.06,0x6a8a9a,s*.08,.8,z+.17,Math.PI/2,0,0,6);pBox(q,.22,.04,.04,0x2a2a2a,0,.8,z+.15);pBox(q,.42,.3,.3,0x4a3a2a,0,.52,z-.05)};
 pil(att?-.2:-.1);pBox(q,.5,.25,.04,0x9ab0b8,0,.85,att?.3:.4,-.4,0,0);pa(q,gTor(.33,.05,4,12),0x3a2a1a,0,.6,att?-.2:-.1,Math.PI/2,0,0);
 let gunner=null;if(!att){pa(q,gTor(.36,.05,4,12),0x3a2a1a,0,.6,-1.6,Math.PI/2,0,0);gunner=nvGrp15(g,0,.62,-1.6);const qg=PB();pa(qg,gSph(.19,8,6),0xc89a70,0,.18,-.05);pa(qg,gSph(.2,8,5,0,1.6),0x4a3420,0,.22,-.07);for(const s of[1,-1])pCyl(qg,.06,.06,.06,0x6a8a9a,s*.08,.2,-.22,Math.PI/2,0,0,6);pBox(qg,.42,.3,.3,0x4a3a2a,0,-.08,0);
  pa(qg,gTor(.38,.03,3,14),0x333333,0,.02,0,Math.PI/2,0,0);pBox(qg,.06,.3,.06,DS,0,.18,-.4);pBox(qg,.08,.12,.8,DS,0,.38,-.6);pCyl(qg,.025,.025,.5,DS,0,.38,-1.15,Math.PI/2,0,0,6);pCyl(qg,.12,.12,.06,0x4a4a3a,0,.48,-.55,0,0,0,10);pbMesh(qg,gunner,VCV);gunner.rotation.y=Math.PI;gunner.userData.muzzle=nvObj15(gunner,0,.38,-1.4)}
 pbMesh(q,g,nvMat15('planeMat',()=>new T.MeshLambertMaterial({vertexColors:true,map:typeof fabT!=='undefined'?fabT:null})));
 /* hélice */
 const prop=nvGrp15(g,0,0,4.58),qp=PB();pBox(qp,.2,3.0,.06,0x5a3a20,0,0,0,0,.2,0);pa(qp,gCone(.2,.4,8),DS,0,0,.15,Math.PI/2,0,0);pbMesh(qp,prop,VCV);
 /* bombas */
 const bombs=[];const bomb=(x,y,z,s)=>{const bq=PB();pCyl(bq,.18*s,.18*s,1.2*s,0x3a3e34,0,0,0,Math.PI/2,0,0,8);pa(bq,gSph(.18*s,8,5),0x3a3e34,0,0,.6*s);pCyl(bq,.02,.18*s,.5*s,0x3a3e34,0,0,-.85*s,-Math.PI/2,0,0,8);for(let i=0;i<4;i++)pBox(bq,.02,.3*s,.25*s,0x3a3e34,0,0,-1.0*s,0,0,i*Math.PI/2);pBox(bq,.04,.04,.05,0xc8a040,0,0,.8*s);
  const m=pbMesh(bq,g,VCV);m.position.set(x,y,z);bombs.push(m);pBox(q,.05,.2,.05,DS,x,y+.2,z)};
 if(att){bomb(0,-.88,.6,1.5);bomb(3.1,yl-.35,1.4,.75);bomb(-3.1,yl-.35,1.4,.75)}else{bomb(2.6,yl-.32,1.4,.6);bomb(-2.6,yl-.32,1.4,.6)}
 /* escarapelas dragón-sol */
 const rt=nvZhRound15();for(const s of[1,-1]){const a=nvDecal15(rt,1.5,1.5);a.rotation.x=-Math.PI/2;a.position.set(s*span*.36,yu+.085,1.3);g.add(a);const b=nvDecal15(rt,1.3,1.3);b.rotation.x=Math.PI/2;b.position.set(s*sp2*.36,yl-.075,1.4);g.add(b);
  const c=nvDecal15(rt,.8,.8);c.rotation.y=s*Math.PI/2;c.position.set(s*.38,.15,-3.0);g.add(c)}
 g.userData={kind:'seaplane',type:att?'att':'rec',prop,bombs,gunner,smokeOut:nvV15(0,-.2,3.8),len:9.2,span};return g}
/* =====================================================================
   OBJETOS FLOTANTES
   ===================================================================== */
function mkBuoy15(){const g=new T.Group(),q=PB();pCyl(q,.75,.6,1.3,0xa02a1e,0,-.2,0,0,0,0,12);pCyl(q,.77,.77,.35,0x1a1a1a,0,.25,0,0,0,0,12);pCyl(q,.4,.75,.3,0xa02a1e,0,.55,0,0,0,0,12);
 for(let i=0;i<4;i++){const a=i*Math.PI/2+.785;nvSeg15(q,Math.cos(a)*.55,.6,Math.sin(a)*.55,Math.cos(a)*.15,2.3,Math.sin(a)*.15,.07,0x2a2a2a)}pBox(q,.5,.06,.5,0x2a2a2a,0,1.5,0);pCyl(q,.22,.22,.3,0x1a1a1a,0,2.4,0,0,0,0,8);pa(q,gCone(.3,.5,8),0xa02a1e,0,2.9,0);pa(q,gTor(.12,.03,4,8),0x2a2a2a,.6,.2,0,0,1.57,0);
 pbMesh(q,g,VCV);const lamp=new T.Mesh(gSph(.14,8,6),new T.MeshBasicMaterial({color:0xffe0a0}));lamp.position.y=2.6;g.add(lamp);g.userData={lamp};return g}
function mkDebris15(kind){const g=new T.Group(),q=PB(),WD=0x6a5236;
 if(kind==='barrel'){pCyl(q,.36,.36,1.0,0x5a4a2c,0,0,0,Math.PI/2,0,.2,10);for(const z of[-.35,0,.35])pCyl(q,.375,.375,.05,0x2a2a2a,0,0,z,Math.PI/2,0,.2,10)}
 else if(kind==='plank'){pBox(q,.32,.08,3,WD,0,.02,0,0,.1,.05);pBox(q,.28,.08,1.6,shade(WD,.85),.3,.03,.4,0,-.3,0)}
 else if(kind==='raft'){for(let i=0;i<6;i++)pBox(q,.3,.1,2.2,i%2?WD:shade(WD,.85),-.8+i*.32,.12,0,0,0,(R()-.5)*.05);for(const z of[-.8,.8])pBox(q,2.0,.08,.2,shade(WD,.7),0,.2,z);for(const x of[-.7,.7])pCyl(q,.25,.25,1.8,0x5a4a2c,x,-.05,0,Math.PI/2,0,0,8);pa(q,gTor(.2,.04,4,8),0x8a7a5a,.3,.25,.3,1.5708,0,0)}
 else{pBox(q,.9,.8,.9,0x7a6040,0,.05,0,.1,.3,.08);for(const y of[-.25,.35])pBox(q,.94,.1,.94,0x5a4630,0,.05+y,0,.1,.3,.08)}
 pbMesh(q,g,VCV);g.userData={kind:kind||'crate'};return g}
function mkLifeRing15(){const g=new T.Group(),q=PB();nvRing15(q,0,0,0,0);const m=pbMesh(q,g,VCV);m.rotation.x=Math.PI/2;m.position.y=.02;return g}
