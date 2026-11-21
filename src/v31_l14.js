/* =====================================================================
   v31 · NIVEL 14 «El último bastión» — arquitectura urbana de 1922
   Fachadas articuladas (marcos, guardapolvos, contraventanas, cornisas,
   impostas, pilastras, zócalos almohadillados), comercios con rótulos y
   toldos, portales con escalones, balcones de forja, mansardas con
   buhardillas y chimeneas, daños de guerra (impactos, hollín, ventanas
   tapiadas, pisos expuestos, coronas rotas, escombros), catedral
   (contrafuertes, rosetones, portada, campanarios, piñón escalonado) y
   palacio (capiteles, frontones, balconcillos, estatuas, jarrones,
   linterna de la cúpula, pilares de la verja).
   Puramente aditivo: ningún objeto existente se mueve ni se elimina.
   ===================================================================== */
const REC_31_14=[];
/* registro de las manzanas generadas por bld14 (mismas coordenadas, altura real de las ruinas) */
{const _o=bld14;bld14=function(q,x,z,w,d,fl,o){_o(q,x,z,w,d,fl,o);const ob=L14.obs[L14.obs.length-1];REC_31_14.push({x,z,w,d,fl,o:o||{},top:ob&&ob.hw===w/2&&ob.hd===d/2?ob.h:fl*3.2})}}
const IN_31_14={};
const zi_31_14=z=>z>-190?0:(z>-430?1:2);
function F_31_14(cx,cz,th,half){return{cx,cz,th,half,nx:Math.sin(th),nz:Math.cos(th),tx:Math.cos(th),tz:-Math.sin(th)}}
function fbx_31_14(q,F,w,h,d,c,u,y,o,rx,rz){return pBox(q,w,h,d,c,F.cx+F.tx*u+F.nx*o,y,F.cz+F.tz*u+F.nz*o,rx||0,F.th,rz||0)}
function fb_31_14(q,F,w,h,d,c,u,y,o,rx,rz){if(d<=.065&&!rx)return fp_31_14(q,F,w,h,c,u,y,o+d/2,rz);return pa(q,gFB_31_14(w,h,d),c,F.cx+F.tx*u+F.nx*o,y,F.cz+F.tz*u+F.nz*o,rx||0,F.th,rz||0)}
function ai_31_14(k,F,u,y,o,c,rot){const x=F.cx+F.tx*u+F.nx*o,z=F.cz+F.tz*u+F.nz*o,A=IN_31_14[k]||(IN_31_14[k]=[[],[],[]]);A[zi_31_14(z)].push([x,y,z,F.th+(rot||0),c===undefined?0xffffff:c])}
function uOf_31_14(F,x,z){return(x-F.cx)*F.tx+(z-F.cz)*F.tz}
/* geometrías ligeras: caja sin cara trasera (20 vértices) y plano (4 vértices) */
const GF_31_14={};
function gFB_31_14(w,h,d){const k=w+'|'+h+'|'+d;if(GF_31_14[k])return GF_31_14[k];const b=new T.BoxGeometry(w,h,d),g=new T.BufferGeometry();g.setAttribute('position',new T.BufferAttribute(b.attributes.position.array.slice(0,60),3));g.setAttribute('normal',new T.BufferAttribute(b.attributes.normal.array.slice(0,60),3));g.setAttribute('uv',new T.BufferAttribute(b.attributes.uv.array.slice(0,40),2));g.setIndex(Array.from(b.index.array.slice(0,30)));return GF_31_14[k]=g}
function gPL_31_14(w,h){const k='p'+w+'|'+h;return GF_31_14[k]||(GF_31_14[k]=new T.PlaneGeometry(w,h))}
function fp_31_14(q,F,w,h,c,u,y,o,rz){return pa(q,gPL_31_14(w,h),c,F.cx+F.tx*u+F.nx*o,y,F.cz+F.tz*u+F.nz*o,0,F.th,rz||0)}
/* geometrías unitarias de los elementos repetidos (cara hacia +z, origen en el centro de la ventana sobre el muro) */
function geos_31_14(){const S=0xc2b69e,G=0x8a8a8a,I=0x1e1c1a,SH=0x4a5a3c,g={};
 const jm=q=>{for(const s of[-1,1])pa(q,gPL_31_14(.16,1.86),S,s*.68,0,.1);pa(q,gPL_31_14(1.52,.24),S,0,.87,.1)},fr=q=>{jm(q);pa(q,gFB_31_14(1.8,.14,.22),S,0,1.06,.11)};
 let q=PB();fr(q);pa(q,gPL_31_14(.5,.42),G,-.3,.54,.1);g.A=pbGeo(q);
 q=PB();fr(q);for(const s of[-1,1])pa(q,gPL_31_14(.6,1.5),SH,s*1.08,0,.07);g.B=pbGeo(q);
 q=PB();jm(q);pa(q,gPL_31_14(1.45,.22),0x6a5638,0,.3,.11,0,0,.25);pa(q,gPL_31_14(1.45,.22),0x5a4a30,0,-.3,.12,0,0,-.2);g.C=pbGeo(q);
 q=PB();pa(q,gFB_31_14(2.4,.16,1),S,0,-.9,.5);pa(q,gFB_31_14(2.4,.85,.04),I,0,-.32,.97);for(const s of[-1,1])pa(q,gPL_31_14(1,.85),I,s*1.19,-.32,.5,0,s*1.5708,0);g.BL=pbGeo(q);
 q=PB();pa(q,new T.CylinderGeometry(.09,.12,.6,5,1,true),0xe0d8c4,0,0,0);g.BU=pbGeo(q);
 return g}
function mkI_31_14(geo,L){let n=0;const o=new T.Object3D(),c=new T.Color();for(const A of L){if(!A.length)continue;const g=geo.clone();let x0=1e9,x1=-1e9,y0=1e9,y1=-1e9,z0=1e9,z1=-1e9;for(const p of A){x0=Math.min(x0,p[0]);x1=Math.max(x1,p[0]);y0=Math.min(y0,p[1]);y1=Math.max(y1,p[1]);z0=Math.min(z0,p[2]);z1=Math.max(z1,p[2])}
  g.boundingSphere=new T.Sphere(new T.Vector3((x0+x1)/2,(y0+y1)/2,(z0+z1)/2),Math.hypot(x1-x0,y1-y0,z1-z0)/2+3);
  const m=new T.InstancedMesh(g,VCV,A.length);A.forEach((p,i)=>{o.position.set(p[0],p[1],p[2]);o.rotation.set(0,p[3],0);o.updateMatrix();m.setMatrixAt(i,o.matrix);m.setColorAt(i,c.setHex(p[4]))});m.instanceMatrix.needsUpdate=true;if(m.instanceColor)m.instanceColor.needsUpdate=true;scene.add(m);n++}return n}
/* atlas de rótulos (una sola textura): 12 letreros de comercio + 2 anuncios pintados en medianeras */
const SG_31_14=['BÄCKEREI · J. WEBER','KAFFEEHAUS CENTRAL','APOTHEKE ZUM ENGEL','K.K. TABAK-TRAFIK','GASTHAUS ZUR POST','UHRMACHER HORVÁTH','BUCHHANDLUNG','FLEISCHHAUEREI','HOTEL EUROPA','CUKRÁSZDA · KONDITOREI','EISENWAREN · VAS','HUTMACHER L. FRANK'];
function atlas_31_14(){const c=document.createElement('canvas');c.width=c.height=512;const x=c.getContext('2d'),BG=['#1e2a22','#2e1a16','#151412','#2a2418'];
 SG_31_14.forEach((t,i)=>{const y=i*32;x.fillStyle=BG[i%4];x.fillRect(0,y,512,32);x.strokeStyle='#a88a48';x.lineWidth=2;x.strokeRect(3,y+3,506,26);x.fillStyle=i%3?'#d8b462':'#e8dcc0';x.font='bold 24px Georgia,serif';x.textAlign='center';x.textBaseline='middle';{const k=Math.min(2.2,440/x.measureText(t).width);x.save();x.translate(256,y+17);x.scale(k,1);x.fillText(t,0,0);x.restore()}for(let k=0;k<40;k++){x.fillStyle='rgba(0,0,0,'+(.15+Math.random()*.35)+')';x.fillRect(Math.random()*512,y+Math.random()*32,2+Math.random()*12,1+Math.random()*4)}});
 [['KAFFEE · TEE · KAKAO','#7a4636'],['SEIFE «PERLA» — DIE BESTE','#4a5a6a']].forEach(([t,b],i)=>{const y=384+i*64;x.fillStyle=b;x.fillRect(0,y,512,64);x.fillStyle='#e8dcc4';x.font='bold 38px Georgia,serif';x.textAlign='center';x.textBaseline='middle';x.fillText(t,256,y+34);for(let k=0;k<160;k++){x.fillStyle='rgba(110,100,90,'+(.2+Math.random()*.5)+')';x.fillRect(Math.random()*512,y+Math.random()*64,3+Math.random()*20,2+Math.random()*6)}});
 const t=new T.CanvasTexture(c);t.minFilter=T.LinearFilter;t.generateMipmaps=false;return t}
const SGG_31_14={};
function sgGeo_31_14(i){if(SGG_31_14[i])return SGG_31_14[i];const g=new T.PlaneGeometry(2,2),uv=g.attributes.uv,p0=i<12?i*32:384+(i-12)*64,p1=i<12?p0+32:p0+64,v0=1-p1/512,v1=1-p0/512;for(let k=0;k<uv.count;k++)uv.setXY(k,uv.getX(k),v0+uv.getY(k)*(v1-v0));return SGG_31_14[i]=g}
/* letrero: plano escalado .5 (pbGeo duplica las UV con escala 1) */
function sign_31_14(q,F,i,u,y,o,L,H){const x=F.cx+F.tx*u+F.nx*o,z=F.cz+F.tz*u+F.nz*o;pa(q,sgGeo_31_14(i),0xffffff,x,y,z,0,F.th,0,L*.5,H*.5,1,.04)}
/* mansarda: tronco de pirámide (normales planas) */
function mGeo_31_14(r){const g=new T.CylinderGeometry(r,1,1,4,1);g.rotateY(Math.PI/4);const n=g.toNonIndexed();n.computeVertexNormals();return n}
let MG_31_14=null;
function mans_31_14(q,X,z,w,d,y0,hm,col){if(!MG_31_14)MG_31_14=[mGeo_31_14(.86),mGeo_31_14(.3)];const k=1/.7071;pa(q,MG_31_14[0],col,X,y0+hm/2,z,0,0,0,w/2*k,hm,d/2*k);pa(q,MG_31_14[1],shade(col,.82),X,y0+hm+.45,z,0,0,0,w/2*.86*k,.9,d/2*.86*k)}
function rubF_31_14(q,F,u,n,spread,C){for(let i=0;i<n;i++){const s=.4+R()*.6;fbx_31_14(q,F,.5+R()*1.1*s,.2+R()*.45*s,.5+R()*.9*s,[0x6a6052,0x7a6e60,0x5a5248,shade(C,.85),0x7a4a36][i%5],u+(R()-.5)*spread,.15+R()*.2,.5+R()*1.5,R(),R())}}
function hole_31_14(q,F,u,y,sz){fp_31_14(q,F,2.2*sz,1.8*sz,0x2a2420,u,y+.3*sz,.035,R());fp_31_14(q,F,1.3*sz,1.1*sz,0x14100c,u,y,.08,R()*3);fp_31_14(q,F,.8*sz,.7*sz,0x0a0806,u,y,.11,R()*3);for(let i=0;i<3;i++){const a=i/3*6.283+R();fb_31_14(q,F,.4*sz,.24*sz,.16,i%2?0x8a4a34:0x6a5a4a,u+Math.cos(a)*.72*sz,y+Math.sin(a)*.6*sz,.06,0,a)}}

/* ---------- MANZANAS URBANAS (bld14) ----------
   Solo se visten las caras visibles desde los recorridos (avenida, calles laterales, plaza):
   la cara x que mira al centro y, en las manzanas interiores, también la que da a la calle lateral. */
function bldDeco_31_14(Q,qS,qG,r,si){const X=X14+r.x,H=r.fl*3.2,top=r.top,ru=!!r.o.ruin,C=r.o.c||[0x8a7a66,0x9a8a74,0x7a6e60,0x8e8070,0x6e6458][Math.abs((r.x*7+r.z*3)|0)%5],q=Q[zi_31_14(r.z)];
 const zf=r.o.both?[-1,1]:[r.o.face||1],faces=[],sx=Math.sign(r.x)||1;
 for(const s of[-1,1])faces.push({F:F_31_14(X,r.z+s*r.d/2,s>0?0:Math.PI,r.w/2),win:zf.includes(s),ax:'z',s,vis:false});
 for(const s of[-1,1])faces.push({F:F_31_14(X+s*r.w/2,r.z,s*Math.PI/2,r.d/2),win:true,ax:'x',s,vis:s===-sx||Math.abs(r.x)<30});
 const tint=[0xffffff,0xf4ead8,0xe8e4e0,0xfff2dc,0xe0e4ea][Math.abs((r.x*3+r.z)|0)%5],burn=ru||R()<.25;
 const glow=(F,u,y)=>{fp_31_14(qG,F,1.1,1.3,0x6a2a10,u,y,.09);fp_31_14(qG,F,.9,.5,R()<.5?0xc85a1e:0xe08030,u,y-.35,.12)};
 for(const fc of faces){const F=fc.F,hf=F.half;
  /* la fachada derribable del edificio-fortaleza (x≈-9.7, z -270…-254) queda limpia */
  if(fc.ax==='x'&&Math.abs(F.cx-(X14-9.7))<.8&&F.cz-hf<-252&&F.cz+hf>-272)continue;
  if(!fc.vis){if(!ru&&fc.ax==='z')fb_31_14(q,F,2*hf+.5,.36,.46,shade(C,1.1),0,H-.18,.23);
   if(!fc.win&&fc.ax==='z'&&!ru&&H>9&&R()<.5){const L=Math.min(2*hf-3,10);sign_31_14(qS,F,12+(R()*2|0),0,H-2.6,.03,L,L/8)}
   continue}
  const shop=top>4&&fc.s===-sx&&R()<.85;
  /* zócalo, imposta, pilastras de esquina, cornisa */
  fb_31_14(q,F,2*hf+.3,.7,.2,shade(C,.68),0,.35,.1);if(top>3.6)fb_31_14(q,F,2*hf+.24,.24,.26,shade(C,1.12),0,3.28,.13);
  for(const s of[-1,1])fb_31_14(q,F,.7,top-.7,.18,shade(C,1.1),s*(hf-.35),.7+(top-.7)/2,.09);
  if(!shop&&!ru)fp_31_14(q,F,2*hf-.6,.07,shade(C,.6),0,1.75,.03);
  if(!ru){fb_31_14(q,F,2*hf+.5,.36,.46,shade(C,1.1),0,H-.18,.23);fb_31_14(q,F,2*hf+.3,.2,.26,shade(C,.72),0,H-.48,.13)}
  /* ventanas: posiciones exactas de bld14 */
  const us=[];for(let k=0;k<Math.floor(r.d/3);k++)us.push(uOf_31_14(F,F.cx,r.z-r.d/2+1.5+k*3));
  let nTop=0;for(let f=0;f<r.fl;f++){const y=1.6+f*3.2;if(y>top-.6)break;nTop=f}
  for(let f=0;f<=nTop;f++){const y=1.6+f*3.2;
   us.forEach((u,k)=>{
    if(f===0&&shop)return;
    if(ru&&f===nTop&&R()<.35){if(R()<.5)fp_31_14(q,F,1.3,1.6,0x0c0a08,u,y,.1);return}
    const p=R();if(f===0)ai_31_14(p<.35?'C':'A',F,u,y,0,tint);else ai_31_14(p<.32?'B':(p<.4?'C':'A'),F,u,y,0,tint);
    if(f===0&&p>.35&&p<.55)fb_31_14(q,F,1.3,.62,.36,0xb0a080,u,1.1,.16);
    if(R()<.12)fp_31_14(q,F,1.5,1.3,0x1c1814,u,y+1.55,.035);
    if(burn&&f>0&&R()<.1)glow(F,u,y);
    if(!ru&&f>=1&&f<=2&&r.fl>=3&&k===(us.length>>1)&&R()<.7)ai_31_14('BL',F,u,y,0,tint)});
  }
  /* comercio en planta baja: escaparates, puerta con escalón, cartela con rótulo, toldos */
  if(shop){const sc=[0x2a3a2c,0x4a2420,0x2a2620,0x3a2e22,0x24303a][si%5],aw=[[0x7a2a20,0xc8b890],[0x2a4a2a,0xc8c0a0],[0x3a3a5a,0xd0c8b0]][si%3];
   fb_31_14(q,F,2*hf-1.6,.56,.16,sc,0,2.98,.08);fb_31_14(q,F,2*hf-1.4,.1,.22,shade(sc,1.4),0,3.3,.11);
   const L=Math.min(2*hf-2.4,7.2);sign_31_14(qS,F,si%12,0,2.98,.17,L,.5);
   const dk=us.length>2?(us.length>>1):-1;
   us.forEach((u,k)=>{if(k===dk){fb_31_14(q,F,1.5,2.65,.1,sc,u,1.32,.04);fp_31_14(q,F,1.1,2.4,0x2a1e16,u,1.2,.13);fp_31_14(q,F,.7,.6,0x2a3438,u,1.85,.16);fb_31_14(q,F,1.6,.18,.5,0x8a8478,u,.09,.25);return}
    const br=R()<.4;fb_31_14(q,F,2.5,2.5,.1,sc,u,1.25,.04);fp_31_14(q,F,2.2,1.85,br?0x100e0c:0x2a3438,u,1.45,.13);if(br)fp_31_14(q,F,.5,.9,0x4a5458,u+(R()-.5)*1.4,1.2+R()*.6,.16,R()*2);
    if(R()<.6){const torn=R()<.35,a=torn?1.15:.42,L2=torn?.8:1.05,yy=2.82-Math.sin(a)*L2/2,oo=Math.cos(a)*L2/2+.05;fb_31_14(q,F,2.4,.04,L2,aw[0],u,yy,oo,a);if(!torn){fb_31_14(q,F,.8,.045,L2,aw[1],u,yy+.01,oo,a);fp_31_14(q,F,2.4,.22,aw[0],u,yy-Math.sin(a)*L2/2-.08,oo+Math.cos(a)*L2/2)}}});
   /* utilería contra la fachada (sin colisión) */
   if(R()<.5){const u=(R()-.5)*(2*hf-4),t=R()*3|0;if(t===0){fbx_31_14(q,F,.8,.8,.8,0x6a5434,u,.4,.6);fbx_31_14(q,F,.8,.8,.8,0x5a4a30,u+.85,.4,.6,0,0)}else if(t===1){for(let j=0;j<2;j++)pCyl(q,.32,.32,.95,0x3a3a34,F.cx+F.tx*(u+j*.7)+F.nx*.5,.48,F.cz+F.tz*(u+j*.7)+F.nz*.5,0,0,0,6)}else{fbx_31_14(q,F,1.2,2,.5,0x4a3020,u,.28,.75,1.45,0)}}}
  else if(!ru&&top>4&&us.length>2){/* portal de viviendas */const u=us[us.length>>1]+1.5;if(Math.abs(u)<hf-1.2){fb_31_14(q,F,1.6,2.75,.2,shade(C,1.2),u,1.37,.1);fp_31_14(q,F,1.1,2.3,0x2a1e16,u,1.15,.24);fb_31_14(q,F,1.5,.15,.45,0x8a8478,u,.075,.22)}}
  /* daños: impacto de obús con escombros al pie */
  if(ru||R()<.5){const u=(R()-.5)*(2*hf-3),y=2.5+R()*Math.max(.5,top-4);hole_31_14(q,F,u,y,.8+R()*.9);rubF_31_14(q,F,u,2,2,C)}
  /* ruina: corona dentada, forjado al aire, habitación abierta, escombros */
  if(ru){for(let u=-hf+1;u<hf-.5;u+=2.2+R()*1.4){const h=.3+R()*2.6;fbx_31_14(q,F,1.4+R()*1.2,h,.42,C,u,top+h/2-.05,-.21)}
   if(top>6.6)fb_31_14(q,F,2*hf*(.3+R()*.4),.26,.45,0x5a5048,(R()-.5)*hf,3.3,.2);
   if(top>5){const u=(R()-.5)*(2*hf-6),y=top-1.55;fp_31_14(q,F,4.6,2.7,0x110e0c,u,y,.08);fp_31_14(q,F,3.4,1.5,[0x6a5a3a,0x5a6a5a,0x7a5a4a][si%3],u-.3,y+.35,.085);fp_31_14(q,F,.6,.8,0x3a2a1a,u-.6,y+.4,.09);fb_31_14(q,F,4.8,.28,.4,0x5a5048,u,y-1.25,.2);fbx_31_14(q,F,.16,.16,2.4,0x3a2a1a,u+1.2,y-1,.8,.7,.3)}
   rubF_31_14(q,F,0,4,2*hf-1,C)}
 }
 /* techo: mansarda (pizarra/teja/cobre) con buhardillas hacia la calle y chimeneas; en ruinas: interior destripado visto desde arriba */
 if(!ru){const col=[0x4a4e54,0x6a3a2c,0x4e6a5e,0x3e4248][Math.abs((r.x+r.z*5)|0)%4],hm=2.4,y0=H+.4;mans_31_14(q,X,r.z,r.w-.2,r.d-.2,y0,hm,col);
  const ix=(r.w-.2)/2*.14,F=F_31_14(X-sx*(r.w/2-.1),r.z,-sx*Math.PI/2,r.d/2);for(const u of[-r.d/4-1,0,r.d/4+1]){if(R()<.2)continue;fb_31_14(q,F,1.3,1.5,1.3,shade(C,1.05),u,y0+1,-ix*.45-.75);fp_31_14(q,F,.8,.9,0x1a1612,u,y0+1.05,-ix*.45-.09);fb_31_14(q,F,1.5,.12,1.6,col,u,y0+1.8,-ix*.45-.8,.3)}
  const nc=1+(R()*2|0);for(let i=0;i<nc;i++){const cx=X+(R()-.5)*(r.w-5),cz=r.z+(R()-.5)*(r.d-5);pBox(q,.75,2.2,1.1,0x7a4a38,cx,y0+hm+.8,cz);pBox(q,.95,.16,1.3,0x5a5248,cx,y0+hm+1.95,cz)}
  if(R()<.35){const cz=r.z+(R()-.5)*(r.d-6),a=Math.atan2(hm,(r.w-.2)/2*.14),xx=X-sx*(r.w/2-.1-(r.w/2)*.07);pBox(q,2.6,.3,2.6,0x0e0c0a,xx,y0+hm*.5,cz,0,0,sx*a);for(const j of[-1,1])pBox(q,2.9,.14,.14,0x3a2a1a,xx,y0+hm*.5+.15,cz+j*.6,0,0,sx*a)}}
 else{pa(q,gPL_31_14(r.w-1.2,r.d-1.2),[0x5a4030,0x6a5a48,0x4a4440][si%3],X,top+.05,r.z,-1.5708,0,0);pBox(q,.18,.6+R()*1.8,r.d*(.3+R()*.4),0xa89a80,X+(R()-.5)*(r.w-4),top+.6,r.z+(R()-.5)*4);pBox(q,r.w*(.3+R()*.4),.6+R()*1.8,.18,0xa89a80,X+(R()-.5)*4,top+.6,r.z+(R()-.5)*(r.d-4));
  for(let i=0;i<2;i++)pBox(q,.22,.22,4+R()*4,0x2a1e14,X+(R()-.5)*(r.w-3),top+.4+R()*.6,r.z+(R()-.5)*(r.d-3),(R()-.5)*.5,R()*3,(R()-.5)*.4);
  pBox(q,.6+R()*.8,.5+R()*.4,.5+R()*.5,0x4a3020,X+(R()-.5)*(r.w-4),top+.3,r.z+(R()-.5)*(r.d-4),R()*.6,R()*3,R()*.6);
  pa(q,gPL_31_14(r.w*.5,r.d*.4),0x141210,X+(R()-.5)*3,top+.09,r.z+(R()-.5)*3,-1.5708,0,0)}
}

/* ---------- EDIFICIO DE VIVIENDAS (apt14) ---------- */
function aptDeco_31_14(q,qS,qG){const X=X14,z0=-444,C=0x7e7262,H=3.2,T0=0xf0e4d0;
 for(const s of[-1,1]){const F=F_31_14(X,z0+s*15.25,s>0?0:Math.PI,16);
  for(let f=0;f<5;f++)for(let k=0;k<8;k++){const x=X-14+k*4,u=uOf_31_14(F,x,F.cz),y=f*H+1.7;if(f===0&&(k===3||k===4))continue;if(f===0&&s>0&&(k<2||k>5))continue;const p=R();ai_31_14(f===0?'C':(p<.3?'B':(p<.38?'C':'A')),F,u,y,0,T0);if(f>=2&&((s>0&&(k===1||k===6))||(s<0&&(k===2||k===5))))ai_31_14('BL',F,u,y,.05,T0);if(f>1&&R()<.07){fp_31_14(qG,F,1.2,1.4,0x6a2a10,u,y,.34);fp_31_14(qG,F,1,.55,0xd06a24,u,y-.38,.345)}}
  fb_31_14(q,F,32.6,.8,.22,shade(C,.66),0,.4,.11);for(let f=1;f<5;f++)fb_31_14(q,F,32.3,.22,.24,shade(C,1.12),0,f*H+.05,.12);fb_31_14(q,F,32.4,.12,.2,shade(C,1.1),0,H*2+.65,.1);
  for(const t of[-1,1])fb_31_14(q,F,.8,16,.2,shade(C,1.12),t*15.6,8,.1);for(const t of[-1,1])fb_31_14(q,F,.6,12.4,.14,shade(C,1.06),t*6,H+6.25,.07);
  fb_31_14(q,F,33,.45,.6,shade(C,1.12),0,15.85,.3);fb_31_14(q,F,32.6,.22,.32,shade(C,.7),0,15.48,.16);fb_31_14(q,F,33.2,.12,.14,0x3a3a36,0,16.6,.55)}
 /* fachada sur: brecha oscura de la planta baja, comercios a ambos lados */
 {const F=F_31_14(X,z0+15.25,0,16);fb_31_14(q,F,7.4,3,.04,0x0c0a08,0,1.5,.05);fb_31_14(q,F,6,1.8,.05,0x16120e,.4,1.1,.055);for(let i=0;i<7;i++){const a=i/6*Math.PI,rr=3.6+R()*.5;fb_31_14(q,F,.5+R()*.4,.3+R()*.2,.2,i%2?0x8a4a34:0x7a6e60,Math.cos(a)*rr,Math.max(.2,Math.sin(a)*3.1),.1,R()*.4,a+R())}
  hole_31_14(q,F,7.5,10.5,1.6);hole_31_14(q,F,-9,13.2,1.1);fb_31_14(q,F,3,1.6,.02,0x2a2420,6,11.6,.015);
  for(const t of[-1,1]){const c0=t*10,sc=t<0?0x2a3a2c:0x4a2420;fb_31_14(q,F,9,.6,.16,sc,c0,3,.07);sign_31_14(qS,F,t<0?1:2,c0,3,.16,7,.44);for(const k of[-2,2]){fb_31_14(q,F,3.2,2.55,.1,sc,c0+k,1.27,.04);fp_31_14(q,F,2.8,1.9,R()<.5?0x2a3438:0x0e0c0a,c0+k,1.4,.095)}
   fb_31_14(q,F,7.6,.04,1.1,0x7a2a20,c0,2.65,.5,.42);fb_31_14(q,F,2.6,.045,1.1,0xc8b890,c0-1.2,2.66,.5,.42)}}
 /* fachada norte: marco de la puerta trasera */{const F=F_31_14(X,z0-15.25,Math.PI,16);for(const t of[-1,1])fb_31_14(q,F,.34,2.9,.24,shade(C,1.2),t*2.2,1.45,.12);fb_31_14(q,F,4.9,.34,.28,shade(C,1.2),0,2.95,.14)}
 /* laterales: ventanas y marcos */for(const s of[-1,1]){const F=F_31_14(X+s*16.25,z0,s*Math.PI/2,15);for(let f=1;f<5;f++)for(const zz of[-11,-5,5,11]){const u=uOf_31_14(F,F.cx,z0+zz),y=f*H+1.7;fp_31_14(q,F,1.2,1.5,0x1a1612,u,y,.07);fb_31_14(q,F,1.4,.12,.18,shade(C,1.15),u,y-.82,.08);ai_31_14(R()<.3?'B':'A',F,u,y,0,T0)}for(let f=1;f<5;f++)fb_31_14(q,F,30.3,.22,.24,shade(C,1.12),0,f*H+.05,.12);fb_31_14(q,F,31,.45,.6,shade(C,1.12),0,15.85,.3)}
 /* mansarda con buhardillas y chimeneas */mans_31_14(q,X,z0,31.6,29.6,16.5,2.6,0x4a4e54);for(const s of[-1,1]){const F=F_31_14(X,z0+s*14.8,s>0?0:Math.PI,16);for(const x of[-12,-6,0,6,12]){const u=uOf_31_14(F,X+x,F.cz);fb_31_14(q,F,1.4,1.5,1.4,shade(C,1.05),u,17.5,-1.6);fb_31_14(q,F,.85,.9,.05,0x1a1612,u,17.55,-.88);fb_31_14(q,F,1.6,.12,1.7,0x4a4e54,u,18.3,-1.6,.3)}}
 for(const [x,z] of[[-10,-6],[4,6],[11,-8],[-3,9]]){pBox(q,.9,2.4,1.3,0x7a4a38,X+x,20,z0+z);pBox(q,1.1,.16,1.5,0x5a5248,X+x,21.25,z0+z)}}

/* ---------- CATEDRAL (cath14) ---------- */
function cathDeco_31_14(q,qG){const Xc=X14-36,zc=-525,C=0x9a9080,S=0xb0a690,D=0x1a1612,SL=0x5a5a5e;
 /* naves laterales: contrafuertes escalonados con pináculos, tracería apuntada, rosetón con radios */
 for(const s of[-1,1]){const F=F_31_14(Xc+s*11,zc,s*Math.PI/2,23);
  fb_31_14(q,F,46.2,.9,.24,shade(C,.7),0,.45,.12);fb_31_14(q,F,46.2,.3,.22,S,0,15.6,.11);fb_31_14(q,F,46.2,.25,.22,S,0,3.1,.11);
  for(const z of[-547.5,-538.5,-529.5,-520.5,-511.5,-503]){const u=uOf_31_14(F,F.cx,z);fb_31_14(q,F,1.1,11,.6,C,u,5.5,.3);fb_31_14(q,F,.9,4.2,.36,C,u,13.1,.18);fb_31_14(q,F,1.15,.16,.8,SL,u,11.15,.32,.75);pCyl(q,0,.38,2.4,S,F.cx+F.tx*u+F.nx*.2,16.6,F.cz+F.tz*u+F.nz*.2,0,.785,0,4)}
  for(let i=0;i<5;i++){const u=uOf_31_14(F,F.cx,zc-18+i*9);if(s<0)fb_31_14(q,F,2.4,8,.1,D,u,7,.03);for(const t of[-1,1]){fb_31_14(q,F,.3,8,.36,S,u+t*1.35,7,.18);fb_31_14(q,F,1.75,.3,.36,S,u-t*.62,11.55,.18,0,t*.72)}fb_31_14(q,F,1.6,1.6,.3,D,u,11.15,.12,0,.785);fb_31_14(q,F,.14,8.6,.34,S,u,7.3,.17);fb_31_14(q,F,2.4,.12,.3,S,u,6.2,.15);fb_31_14(q,F,3,.3,.4,S,u,2.9,.2)}}
 {const F=F_31_14(Xc+11,zc,Math.PI/2,23);pa(q,new T.TorusGeometry(3.55,.22,4,16),S,Xc+11.42,10,zc,0,Math.PI/2,0);for(let i=0;i<8;i++)fb_31_14(q,F,.14,6.9,.12,S,0,10,.46,0,i*.3927);pCyl(q,.7,.7,.5,S,Xc+11.4,10,zc,0,0,1.5708,10);
  /* impacto y hollín en la nave */hole_31_14(q,F,uOf_31_14(F,F.cx,-544),12.5,1.8);fb_31_14(q,F,5,3.4,.02,0x1e1a16,uOf_31_14(F,F.cx,-543),13.2,.015)}
 /* fachada oeste (entre torres): portada con arquivoltas, rosetón, piñón escalonado */
 {const F=F_31_14(Xc,zc+23,0,3);fb_31_14(q,F,3,5.2,.06,D,0,2.6,.03);for(const t of[-1,1]){fb_31_14(q,F,1.42,4.7,.12,0x4a2a18,t*.74,2.35,.08);for(const y of[1,2.4,3.8])fb_31_14(q,F,1.3,.09,.16,0x2a2a2a,t*.74,y,.1);fb_31_14(q,F,.42,5.6,.5,S,t*1.75,2.8,.25);fb_31_14(q,F,.42,6.1,.82,shade(S,.92),t*2.2,3.05,.41);fb_31_14(q,F,2.4,.36,.5,S,-t*.95,6.25,.25,0,t*.6);fb_31_14(q,F,2.9,.36,.82,shade(S,.92),-t*1.2,6.75,.41,0,t*.6)}
  fb_31_14(q,F,3,1.05,.08,shade(S,.8),0,5.75,.06,0,0);fb_31_14(q,F,5.6,.18,1.3,0x8a8478,0,.09,.65);fb_31_14(q,F,4.6,.18,.7,0x8a8478,0,.27,.35);fb_31_14(q,F,6,.3,.3,S,0,8.3,.15);
  pCyl(q,2.2,2.2,.3,0x3a2a4a,Xc,12.2,zc+23.08,1.5708,0,0,12);pa(q,new T.TorusGeometry(2.25,.2,4,14),S,Xc,12.2,zc+23.25,0,0,0);for(let i=0;i<6;i++)fb_31_14(q,F,.12,4.4,.12,S,0,12.2,.3,0,i*.5236);pCyl(q,.45,.45,.4,S,Xc,12.2,zc+23.25,1.5708,0,0,8);
  for(let i=0;i<5;i++)fb_31_14(q,F,6-i*1.25,1.5,.7,C,0,16.75+i*1.5,-.2);for(let i=0;i<5;i++)fb_31_14(q,F,.4,.4,.8,S,0,17.5+i*1.5,-.15);pBox(q,.25,2,.25,0x3a3a3a,Xc,25.6,zc+22.8);pBox(q,1.1,.22,.25,0x3a3a3a,Xc,26,zc+22.8)}
 /* campanarios: imposta, reloj, campanario con lamas, pretil, pináculos, cruces */
 for(const s of[-1,1]){const tx=Xc+s*7,tz=zc+26;
  for(let k=0;k<4;k++){const th=k*Math.PI/2,F=F_31_14(tx+Math.sin(th)*4,tz+Math.cos(th)*4,th,4);fb_31_14(q,F,8.3,.8,.2,shade(C,.7),0,.4,.1);for(const y of[11.6,25])fb_31_14(q,F,8.3,.3,.24,S,0,y,.12);for(const t of[-1,1])fb_31_14(q,F,.6,30,.22,shade(C,1.06),t*3.7,15,.11);
   for(const t of[-1,1]){fb_31_14(q,F,.9,3.2,.06,D,t*1.1,27.3,.02);fb_31_14(q,F,.9,.9,.06,D,t*1.1,28.9,.02,0,.785);for(let j=0;j<2;j++)fb_31_14(q,F,.9,.08,.2,0x4a3a2a,t*1.1,26.4+j*1.1,.08,.5)}
   if(k===0){pCyl(q,1.05,1.05,.12,0xe0d8c0,tx,18.6,tz+4.06,1.5708,0,0,10);pa(q,new T.TorusGeometry(1.1,.1,3,12),0x8a7a4a,tx,18.6,tz+4.14,0,0,0);fb_31_14(q,F,.08,.75,.05,0x1a1a1a,0,18.85,.16,0,s*.4);fb_31_14(q,F,.08,.55,.05,0x1a1a1a,0,18.5,.17,0,1.9)}}
  for(const [a,b] of[[1,1],[1,-1],[-1,1],[-1,-1]]){pCyl(q,0,.5,2.4,S,tx+a*3.75,31.2,tz+b*3.75,0,.785,0,4);pBox(q,.7,.6,.7,S,tx+a*3.75,30.3,tz+b*3.75)}
  for(const t of[-1,1]){pBox(q,8.2,.7,.3,S,tx,30.35,tz+t*3.95);pBox(q,.3,.7,8.2,S,tx+t*3.95,30.35,tz)}
  pBox(q,.18,1.8,.18,0x3a3a3a,tx,40.6,tz);pBox(q,.9,.16,.16,0x3a3a3a,tx,40.9,tz);pa(q,gSph(.22,6,4),0x8a7a4a,tx,39.9,tz)}
 /* cabecera (este, z -548): ventanales y contrafuertes */{const F=F_31_14(Xc,zc-23,Math.PI,11);for(const x of[-6,0,6]){const u=uOf_31_14(F,Xc+x,F.cz);fb_31_14(q,F,2.2,7,.1,D,u,7,.03);fb_31_14(q,F,1.5,1.5,.1,D,u,10.5,.03,0,.785);fb_31_14(q,F,.14,7.4,.3,S,u,7,.15)}for(const x of[-10.6,-3,3,10.6]){const u=uOf_31_14(F,Xc+x,F.cz);fb_31_14(q,F,1.1,11,.6,C,u,5.5,.3);fb_31_14(q,F,.9,4.2,.36,C,u,13.1,.18);fb_31_14(q,F,1.15,.16,.8,SL,u,11.15,.32,.75)}}
 pa(qG,gBox(.9,3,.02),0xff7a2a,Xc+11.06,7,zc-9,0,Math.PI/2,0,1,1,1,.2)}

/* ---------- PALACIO REAL (palace14) ---------- */
function palDeco_31_14(q){const X=X14,z0=-690,C=0xc8bca0,C2=0xa89c80,C3=0xd8ccb0,D=0x1a1612,ST=0xe0d8c8;
 const F=F_31_14(X,z0+15,0,50);
 /* zócalo almohadillado, imposta del piso noble, friso con dentículos y moldura de coronación */
 fb_31_14(q,F,100.4,.8,.3,shade(C,.72),0,.4,.15);for(let y=1.2;y<6.5;y+=.8){fb_31_14(q,F,43.4,.06,.03,shade(C,.66),-25.8,y,.015);fb_31_14(q,F,43.4,.06,.03,shade(C,.66),25.8,y,.015)}
 fb_31_14(q,F,100.2,.4,.36,C2,0,7.05,.18);fb_31_14(q,F,100.2,.18,.26,shade(C2,1.1),0,7.35,.13);fb_31_14(q,F,101,.8,.16,shade(C,1.05),0,13.4,.08);fb_31_14(q,F,102,.26,.24,shade(C2,.68),0,13.88,2.05);fb_31_14(q,F,102.4,.24,4.4,shade(C2,1.12),0,15.32,0);
 /* capiteles y basas de las columnas */for(let i=0;i<13;i++){const x=X-42+i*7,z=z0+16.5;pBox(q,1.95,.5,1.95,C2,x,13.72,z);pCyl(q,1.05,.75,.45,C3,x,13.3,z,0,0,0,6);pBox(q,1.95,.45,1.95,C2,x,.22,z);pCyl(q,.82,1.02,.35,C3,x,.62,z,0,0,0,6)}
 /* ventanas: planta baja con guardapolvo, piso noble con frontones alternos y balconcillo */
 for(let i=0;i<13;i++){const u=-38.5+i*7;
  if(Math.abs(u)>4){for(const t of[-1,1])fb_31_14(q,F,.26,3.4,.2,C3,u+t*1.13,2.4,.1);fb_31_14(q,F,2.6,.3,.24,C3,u,4.05,.12);fb_31_14(q,F,.5,.6,.3,C3,u,4.1,.15);fb_31_14(q,F,2.9,.18,.42,C2,u,4.35,.21);fb_31_14(q,F,2.6,.18,.36,C2,u,.82,.18);fb_31_14(q,F,1.8,.05,.03,0x6a6a6e,u,2.4,.11)}
  for(const t of[-1,1])fb_31_14(q,F,.26,3.4,.2,C3,u+t*1.13,9.4,.1);fb_31_14(q,F,2.6,.3,.24,C3,u,11.05,.12);
  if(i%2){for(const t of[-1,1])fb_31_14(q,F,1.68,.2,.38,C2,u-t*.74,11.62,.19,0,t*.36);fb_31_14(q,F,2.9,.18,.38,C2,u,11.3,.19)}else{fb_31_14(q,F,2.9,.2,.4,C2,u,11.35,.2);fb_31_14(q,F,2.4,.3,.38,C2,u,11.6,.19)}
  fb_31_14(q,F,2.9,.22,.72,C2,u,7.82,.36);fb_31_14(q,F,2.9,.13,.2,C2,u,8.78,.66);for(let j=0;j<6;j++)ai_31_14('BU',F,u-1.2+j*.48,8.28,.66,0xffffff);for(const t of[-1,1])pBox(q,.22,.4,.5,C2,F.cx+u+t*1.2,7.55,F.cz+.25)}
 /* portada: sillares almohadillados, dintel con clave, frontón con escudo */
 for(let j=0;j<7;j++)for(const t of[-1,1])fb_31_14(q,F,j%2?.8:1.15,.82,.36,C2,t*(3.55+(j%2?0:.18)),.45+j*.9,.18);fb_31_14(q,F,8.2,.6,.42,C2,0,6.45,.21);fb_31_14(q,F,.8,1,.5,C3,0,6.4,.25);
 for(const t of[-1,1])fb_31_14(q,F,3.9,.3,.46,C2,-t*1.72,7.48,.23,0,t*.4);fb_31_14(q,F,4.6,.66,.14,shade(C,.95),0,7.15,.07);pCyl(q,.55,.55,.12,0xb08a30,X,7.25,F.cz+.22,1.5708,0,0,12);
 /* estatuas y jarrones sobre la cornisa (lejos del mástil) */
 const statue=(x,y,z,r)=>{pBox(q,1,.8,1,C2,x,y+.4,z);pCyl(q,.3,.42,1.3,ST,x,y+1.45,z,0,0,0,7);pBox(q,.55,.6,.34,ST,x,y+2.35,z,0,r,0);pa(q,gSph(.2,6,5),ST,x,y+2.86,z);pBox(q,.14,.75,.14,ST,x+.3,y+2.85,z,0,r,-.4);pBox(q,.14,.6,.14,ST,x-.32,y+2.2,z,0,r,.2)},urn=(x,y,z)=>{pBox(q,.8,.6,.8,C2,x,y+.3,z);pCyl(q,.38,.14,.7,C3,x,y+.95,z,0,0,0,6);pCyl(q,.2,.38,.4,C3,x,y+1.5,z,0,0,0,6)};
 for(const s of[-1,1]){statue(X+s*47.5,15.44,z0+16,s*.3);statue(X+s*31.5,15.44,z0+16.3,0);urn(X+s*39.5,15.44,z0+16.3);urn(X+s*23.5,15.44,z0+16.3);statue(X+s*49.4,15.44,z0-12,s*1.57)}
 /* daños: impactos, hollín, estatua caída al pie de la fachada */hole_31_14(q,F,-17,10.6,1.4);hole_31_14(q,F,28,3.6,1.2);hole_31_14(q,F,12,12.6,.9);fb_31_14(q,F,5,3,.02,0x1e1a16,-17,12,.012);fb_31_14(q,F,3,2.6,.02,0x1e1a16,31.5,10.6,.012);rubF_31_14(q,F,-17,8,4,C);rubF_31_14(q,F,28,8,3,C);
 {const x=X+20,z=z0+18.6;pCyl(q,.3,.42,1.3,ST,x,.4,z,0,0,1.5708,7);pBox(q,.55,.34,.6,ST,x+1.1,.32,z,0,0,0);pa(q,gSph(.2,6,5),ST,x+1.6,.25,z);pBox(q,.14,.14,.75,ST,x+.9,.16,z+.5,0,.6,0)}
 /* fachadas laterales */for(const s of[-1,1]){const G=F_31_14(X+s*50,z0,s*Math.PI/2,15);fb_31_14(q,G,30.4,.8,.3,shade(C,.72),0,.4,.15);fb_31_14(q,G,30.2,.4,.36,C2,0,7.05,.18);fb_31_14(q,G,30.4,.8,.16,shade(C,1.05),0,13.4,.08);for(let y=1.2;y<6.5;y+=.8)fb_31_14(q,G,29,.06,.03,shade(C,.66),0,y,.015);
  for(const u of[-10,-5,0,5,10])for(const y of[2.4,9.4]){fb_31_14(q,G,2,3,.1,D,u,y,.05);for(const t of[-1,1])fb_31_14(q,G,.26,3.4,.2,C3,u+t*1.13,y,.1);fb_31_14(q,G,2.9,.2,.4,C2,u,y+1.95,.2);fb_31_14(q,G,2.6,.18,.36,C2,u,y-1.58,.18)}
  for(const t of[-1,1])for(let j=0;j<16;j++)fb_31_14(q,G,j%2?.7:1,.82,.24,C2,t*(14.4-(j%2?0:.15)),.45+j*.88,.12)}
 /* cúpula: nervios, tambor con pilastras, linterna con remate */
 for(let k=0;k<8;k++){const th=k*Math.PI/4+.39;for(const ph of[.2,.6,1,1.3]){const r=9.12;pBox(q,.4,2.6,.35,C2,X+Math.sin(th)*r*Math.cos(ph),15.2+r*Math.sin(ph),z0+Math.cos(th)*r*Math.cos(ph),-ph,th,0)}}
 for(let k=0;k<16;k++){const th=k*Math.PI/8;pBox(q,.5,2,.3,C3,X+Math.sin(th)*9.3,15,z0+Math.cos(th)*9.3,0,th,0)}
 pCyl(q,1.7,1.7,2.4,C2,X,25.2,z0,0,0,0,8);for(let k=0;k<8;k++){const th=k*Math.PI/4+.39;pBox(q,.5,1.4,.08,D,X+Math.sin(th)*1.66,25.2,z0+Math.cos(th)*1.66,0,th,0)}pCyl(q,2,2,.25,C3,X,26.45,z0,0,0,0,8);pa(q,gSph(1.75,8,3,0,1.5708),0x6a8a7a,X,26.5,z0);pCyl(q,.06,.22,2,0xb08a30,X,29,z0,0,0,0,6);pa(q,gSph(.25,6,4),0xb08a30,X,28.2,z0);
 /* verja del jardín: pilares con remates y albardilla */for(const s of[-1,1]){pBox(q,112,.24,1.5,C2,X+s*64,3.52,-628);for(let i=0;i<15;i++){const x=X+s*(9+i*8);pBox(q,1.4,4,1.6,C,x,2,-628);pBox(q,1.7,.26,1.9,C2,x,4.13,-628);pCyl(q,.36,.2,.55,C3,x,4.55,-628,0,0,0,5)}}
}

function deco31_14(){try{const Q=[PB(),PB(),PB()],qS=PB(),qG=PB();for(const k in IN_31_14)delete IN_31_14[k];
 REC_31_14.forEach((r,i)=>bldDeco_31_14(Q,qS,qG,r,i));aptDeco_31_14(Q[2],qS,qG);cathDeco_31_14(Q[2],qG);palDeco_31_14(Q[2]);
 for(const q of Q)if(q.L.length)pbMesh(q,scene,VCV);
 if(qS.L.length)pbMesh(qS,scene,new T.MeshLambertMaterial({map:atlas_31_14(),vertexColors:true}));
 if(qG.L.length)pbMesh(qG,scene,new T.MeshBasicMaterial({vertexColors:true}));
 const G=geos_31_14();let n=0;for(const k in IN_31_14)if(G[k])n+=mkI_31_14(G[k],IN_31_14[k]);L14.dc31=n+5}catch(e){console.error('deco31_14',e)}}
{const _b31=build14;build14=function(){const was=L14.built;if(!was)REC_31_14.length=0;_b31();if(was)return;deco31_14()}}
