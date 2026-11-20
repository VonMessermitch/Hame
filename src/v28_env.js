const X15=88000,WY15=-1.2;
/* =====================================================================
   v28 · Entorno: «El fiordo de los condenados» — fiordo, agua y base naval Kaltfjord (1922)
   Coordenadas LOCALES: x mundo = X15 + x ; z tal cual (norte = −z). Superficie del agua y = WY15.
   ===================================================================== */
const ENV15={built:false,base:false,amp:.6,t:0,tick:0,anch:{},dest:{},lights:[],smoke:[],burn:[],fires:[],obs:[],foot:[],bob:[],floes:null,mini:null,miniInfo:{x0:-1000,z0:-1450,mpp:5},autoSmoke:true};
/* ---------- geometría analítica del fiordo ---------- */
const MC15=[0,-60,0,-200,40,-380,20,-560,-10,-760,0,-1000];/* canal principal */
const WC15=[-60,-290,-150,-420,-160,-560,-110,-700,-30,-775];/* canal estrecho occidental */
const IS15=[60,-470,14,-30,-630,10,40,-705,8,-120,-90,16];/* islotes x,z,r */
const GL15=[-80,-960,-330,-1190,46, 92,-650,390,-770,40, 0,-1080,70,-1390,58, -170,-505,-430,-455,32, 260,-260,520,-120,36];/* glaciares: A(costa)→B(cumbre), ancho */
const LS15=[-100,-40,70];/* rampas de desembarco en el muelle */
let _pz15=0;
function pl15(P,x,z){let best=1e12,bz=0;for(let i=0;i<P.length-2;i+=2){const ax=P[i],az=P[i+1],dx=P[i+2]-ax,dz=P[i+3]-az;let t=((x-ax)*dx+(z-az)*dz)/(dx*dx+dz*dz);t=t<0?0:t>1?1:t;const px=ax+dx*t-x,pz=az+dz*t-z,d=px*px+pz*pz;if(d<best){best=d;bz=az+dz*t}}_pz15=bz;return Math.sqrt(best)}
const sst15=t=>t<=0?0:t>=1?1:t*t*(3-2*t);
/* distancia firmada al agua (negativa dentro del agua) */
let _s2_15=0;
function sdw15(x,z){const d1=pl15(MC15,x,z),zz=_pz15,na=sst15(Math.min((zz+262)/32,(-153-zz)/32));let s=d1-(85-35*na);
 if(z>-200&&z<10&&x>-200&&x<200){const hb=40+130*sst15((z+178)/68),sb=Math.max(Math.abs(x)-hb,z+2);if(sb<s)s=sb}
 const s2=(x<0&&z<-250&&z>-820)?pl15(WC15,x,z)-24:1e9;_s2_15=s2;if(s2<s)s=s2;
 const nf=x>-185&&x<185&&z>-45?0:z>-75&&x>-185&&x<185?(-45-z)/30:1;if(nf>0)s+=nf*4*Math.sin(x*.05+z*.031)*Math.sin(z*.045-x*.023);
 for(let i=0;i<12;i+=3){const dx=x-IS15[i],dz=z-IS15[i+1];if(dx*dx+dz*dz<3600){const di=Math.sqrt(dx*dx+dz*dz)-IS15[i+2]*(1+.15*Math.sin(Math.atan2(dz,dx)*3+i));if(-di>s)s=-di}}
 return s}
function glac15(x,z){let b=0;for(let i=0;i<GL15.length;i+=5){const ax=GL15[i],az=GL15[i+1],dx=GL15[i+2]-ax,dz=GL15[i+3]-az,w=GL15[i+4];let t=((x-ax)*dx+(z-az)*dz)/(dx*dx+dz*dz);if(t<-.1||t>1.05)continue;t=t<0?0:t>1?1:t;const px=ax+dx*t-x,pz=az+dz*t-z,d=Math.sqrt(px*px+pz*pz);if(d<w){const k=sst15((w-d)/(w*.55))*(t>.92?(1.05-t)/.13:1);if(k>b){b=k;_gt15=t}}}return b}
let _gt15=0;
/* altura del terreno / fondo marino (x LOCAL) */
function land15(x,z){
 if(z>=-1&&z<=150&&x>=-160&&x<=160)return 0;
 const s=sdw15(x,z);
 if(s<0){let b=WY15-.4-19*(1-Math.exp(s/13))+.8*Math.sin(x*.07)*Math.sin(z*.053);
  if(z<-1&&z>-45&&x>-168&&x<168){if(b>-9)b=-9;for(let i=0;i<3;i++){const ax=Math.abs(x-LS15[i]);if(ax<11){const be=-1.5-(-1-z)*.42,w=sst15((11-ax)/4);if(be>b)b+=(be-b)*w}}}
  const sx=x-25,sz=z+215,ds=sx*sx+sz*sz;if(ds<1600){const k=-3-17*sst15((Math.sqrt(ds)-14)/26);if(k>b)b=k}
  return b}
 const n1=Math.sin(x*.0113+1.3)*Math.sin(z*.0091+.4)+.5*Math.sin(x*.027-z*.019+2),sn=Math.sin(x*.017+Math.sin(z*.011)*1.5)*Math.cos(z*.014+Math.sin(x*.009)*1.2),rr=1-(sn<0?-sn:sn);
 const L=15+17*Math.min(1,Math.max(0,(_s2_15-s)/20));
 let h=WY15+.5+(118+58*n1)*(1-Math.exp(-s/L))+rr*rr*rr*120*Math.min(1,s/90)+3*Math.sin(x*.21+z*.17)*Math.min(1,s/20);
 if(z>-60&&z<230&&x>-260&&x<260){const ex=x<-160?-160-x:x>160?x-160:0,ez=z>150?z-150:z<-1?-1-z:0,dp=Math.sqrt(ex*ex+ez*ez);if(dp<48)h*=sst15(dp/48)}
 if((x<420&&x>-460&&z<-90)||(x>200&&z<-90&&z>-300)){const gb=glac15(x,z);if(gb>0){const hg=WY15+9+_gt15*200+3*Math.sin(x*.05+z*.04);h+=(hg-h)*gb}}
 return h}
function depth15(x,z){return WY15-land15(x,z)}
function navOK15(x,z,draft){return depth15(x,z)>(draft||0)+.5}
/* olas (x LOCAL) — más mansas dentro de la dársena */
function waveH15(x,z,t){const a=ENV15.amp*(z>-60?.3:z>-220?.3+.7*(-60-z)/160:1);return a*(.55*Math.sin(x*.042+z*.013+t*1.05)+.3*Math.sin(z*.057-x*.021-t*1.32)+.15*Math.sin((x+z)*.071+t*1.9))}
/* ---------- texturas procedurales ---------- */
let TX15=null;
function ctex15(w,h,fn,rep){const c=document.createElement('canvas');c.width=w;c.height=h;fn(c.getContext('2d'),w,h);const t=new T.CanvasTexture(c);t.wrapS=t.wrapT=T.RepeatWrapping;if(rep)t.repeat.set(rep,rep);return t}
function tex15(){if(TX15)return TX15;const nz=(c,w,h,n,a,b)=>{for(let i=0;i<n;i++){const v=a+R()*(b-a)|0;c.fillStyle='rgb('+v+','+v+','+v+')';c.fillRect(R()*w|0,R()*h|0,1+(R()*2|0),1+(R()*2|0))}};
 const plank=ctex15(64,64,(c,w,h)=>{for(let p=0;p<2;p++){const v=205+R()*35|0;c.fillStyle='rgb('+v+','+(v-6)+','+(v-14)+')';c.fillRect(0,p*32,w,32);for(let i=0;i<14;i++){c.fillStyle='rgba(60,40,20,.12)';c.fillRect(0,p*32+R()*30|0,w,1)}c.fillStyle='rgba(30,20,10,.55)';c.fillRect(0,p*32,w,2);c.fillStyle='rgba(40,30,20,.5)';c.fillRect(R()*60|0,p*32+14,2,4)}});
 const corr=ctex15(64,32,(c,w,h)=>{for(let x=0;x<w;x++){const v=190+48*Math.sin(x/w*8*Math.PI)|0;c.fillStyle='rgb('+v+','+v+','+v+')';c.fillRect(x,0,1,h)}for(let i=0;i<10;i++){c.fillStyle='rgba(120,60,20,'+(.1+R()*.25)+')';c.fillRect(R()*w|0,R()*h|0,2+R()*5|0,2+R()*8|0)}});
 const conc=ctex15(64,64,(c,w,h)=>{c.fillStyle='#d8d6d0';c.fillRect(0,0,w,h);nz(c,w,h,900,170,240);c.fillStyle='rgba(60,60,60,.18)';c.fillRect(0,0,w,1);for(let i=0;i<6;i++){c.fillStyle='rgba(80,70,60,.15)';c.fillRect(R()*w|0,R()*h|0,1,4+R()*10|0)}});
 const grd=ctex15(128,128,(c,w,h)=>{c.fillStyle='#d4d4d4';c.fillRect(0,0,w,h);nz(c,w,h,5000,150,255);for(let i=0;i<60;i++){c.fillStyle='rgba(70,70,70,.12)';c.beginPath();c.arc(R()*w,R()*h,2+R()*7,0,6.3);c.fill()}});
 const rip=ctex15(128,128,(c,w,h)=>{const id=c.createImageData(w,h),f=(x,y)=>Math.sin(x*6.2832*3/w+Math.sin(y*6.2832*2/h)*1.3)*.5+Math.sin(y*6.2832*5/h+x*6.2832*2/w)*.35+Math.sin((x+y)*6.2832*7/w)*.15;for(let y=0;y<h;y++)for(let x=0;x<w;x++){const dx=f(x+1,y)-f(x-1,y),dy=f(x,y+1)-f(x,y-1),o=(y*w+x)*4;id.data[o]=128+dx*90;id.data[o+1]=128+dy*90;id.data[o+2]=255;id.data[o+3]=255}c.putImageData(id,0,0)});
 /* atlas de letreros: 16 filas de 512×64 */
 const SG=[['BASE NAVAL KALTFJORD','#1c2a3a','#e8e0c8'],['MUELLE DEL WOLFSZAHN','#2a2018','#e8d8a8'],['ARSENAL DE TORPEDOS','#5a1a1a','#f0e8d8'],['PELIGRO · COMBUSTIBLE','#c8a020','#1a1a1a'],['HOSPITAL NAVAL','#e8e8e0','#9a1a1a'],['COMEDOR DE MARINERÍA','#2a3a2a','#e8e0c8'],['TALLER DE REPARACIONES','#3a3a40','#e8e0c8'],['ESTACIÓN RADIOTELEGRÁFICA','#1a2a3a','#e8e0c8'],['BATERÍA COSTERA N.º 1','#3a3a2a','#e8e0c8'],['BATERÍA COSTERA N.º 2','#3a3a2a','#e8e0c8'],['HANGAR DE HIDROAVIONES','#2a2a3a','#e8e0c8'],['TALLER DE MÁQUINAS','#3a2a1a','#e8e0c8'],['COMANDANCIA','#1c1f26','#c9a227'],['PROHIBIDO FUMAR','#9a1a1a','#f0f0f0'],['MUELLE N.º 2 · GRÚA','#2a3038','#e8e0c8'],['ESTACIÓN METEOROLÓGICA','#2a3a3a','#e8e0c8']];
 const sign=ctex15(512,1024,(c,w,h)=>{c.textAlign='center';c.textBaseline='middle';SG.forEach((s,i)=>{const y=i*64;c.fillStyle=s[1];c.fillRect(0,y,w,64);c.strokeStyle=s[2];c.lineWidth=4;c.strokeRect(6,y+6,w-12,52);c.fillStyle=s[2];c.font='bold 30px Georgia,serif';c.fillText(s[0],w/2,y+33,w-30);for(let k=0;k<40;k++){c.fillStyle='rgba(90,50,20,'+R()*.25+')';c.fillRect(R()*w,y+R()*64,2+R()*6,1+R()*3)}})});sign.wrapS=sign.wrapT=T.ClampToEdgeWrapping;
 const flag=ctex15(128,84,(c,w,h)=>{c.fillStyle='#1c1f26';c.fillRect(0,0,w,h);c.fillStyle='#7a1a2a';c.fillRect(0,30,w,24);c.fillStyle='#c9a227';const cx=40,cy=42;c.fillRect(cx-4,cy-18,8,36);c.fillRect(cx-18,cy-4,36,8);c.beginPath();for(const [a,b] of[[0,-1],[0,1],[-1,0],[1,0]]){c.moveTo(cx+a*18-b*7,cy+b*18-a*7);c.lineTo(cx+a*18+b*7,cy+b*18+a*7);c.lineTo(cx+a*10,cy+b*10)}c.fill();c.strokeStyle='#c9a227';c.lineWidth=2;c.beginPath();c.arc(cx,cy,12,0,6.3);c.stroke()});flag.wrapS=flag.wrapT=T.ClampToEdgeWrapping;
 const L=(m,o)=>new T.MeshLambertMaterial(Object.assign({vertexColors:true,map:m},o||{}));
 TX15={plank,corr,conc,grd,rip,sign,flag,SG,MW:L(plank),MC:L(corr,{side:T.DoubleSide}),MK:L(conc),MG:L(conc,{polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-4}),ML:new T.MeshBasicMaterial({vertexColors:true}),MS:new T.MeshLambertMaterial({map:sign}),MV:L(grd)};return TX15}
/* prisma triangular unitario (frontón): cumbrera a lo largo de x, base y=0 z=±.5, vértice y=1 */
let PR15=null;
function gPr15(){if(PR15)return PR15;const v=[-.5,0,-.5,-.5,0,.5,-.5,1,0, .5,0,.5,.5,0,-.5,.5,1,0, -.5,0,-.5,.5,1,0,.5,0,-.5, -.5,0,-.5,-.5,1,0,.5,1,0, .5,0,.5,-.5,1,0,-.5,0,.5, .5,0,.5,.5,1,0,-.5,1,0];const g=new T.BufferGeometry();g.setAttribute('position',new T.BufferAttribute(new Float32Array(v),3));g.computeVertexNormals();return PR15=g}
/* viga entre dos puntos (coordenadas de mundo) */
function beam15(q,c,x0,y0,z0,x1,y1,z1,th){const dx=x1-x0,dy=y1-y0,dz=z1-z0,L=Math.sqrt(dx*dx+dy*dy+dz*dz)||.01;/* orienta el eje Y de la viga según la dirección (Euler XYZ: rx=atan2(dz,dy), rz=-asin(dx)) */pBox(q,th,L,th,c,(x0+x1)/2,(y0+y1)/2,(z0+z1)/2,Math.atan2(dz,dy),0,-Math.asin(Math.max(-1,Math.min(1,dx/L))))}
/* marco local (x0,z0 locales, giro yaw) */
function fr15(x0,z0,yaw){const c=Math.cos(yaw||0),s=Math.sin(yaw||0),W=(lx,lz)=>X15+x0+lx*c+lz*s,Z=(lx,lz)=>z0-lx*s+lz*c;return{c,s,yaw:yaw||0,P:(lx,lz)=>[x0+lx*c+lz*s,z0-lx*s+lz*c],
 b:(q,w,h,d,col,lx,ly,lz,rx,ry,rz)=>pBox(q,w,h,d,col,W(lx,lz),ly,Z(lx,lz),rx||0,(ry||0)+(yaw||0),rz||0),
 s:(q,w,h,d,col,lx,ly,lz,rx,ry,rz)=>pa(q,gBox(1,1,1),col,W(lx,lz),ly,Z(lx,lz),rx||0,(ry||0)+(yaw||0),rz||0,w,h,d),
 g:(q,geo,col,lx,ly,lz,rx,ry,rz,sx,sy,sz)=>pa(q,geo,col,W(lx,lz),ly,Z(lx,lz),rx||0,(ry||0)+(yaw||0),rz||0,sx,sy,sz),
 cy:(q,a,b,h,col,lx,ly,lz,rx,ry,rz,sg)=>pCyl(q,a,b,h,col,W(lx,lz),ly,Z(lx,lz),rx||0,(ry||0)+(yaw||0),rz||0,sg)}}
function ob15(x,z,hw,hd,h,y0){const o={x:X15+x,z,hw,hd,h};if(y0!==undefined)o.y0=y0;obstB.push(o);ENV15.obs.push(o);return o}
function unob15(o){let i=obstB.indexOf(o);if(i>=0)obstB.splice(i,1);i=ENV15.obs.indexOf(o);if(i>=0)ENV15.obs.splice(i,1)}
/* ---------- FIORDO: terreno, bosques, hielo, agua, minimapa ---------- */
function buildFjord15(){if(ENV15.built)return;ENV15.built=true;const TX=tex15(),X=X15;
 /* terreno 2000×2000 centrado en (0,-450), 160×160 segmentos (12,5 m) */
 {const N=160,g=new T.PlaneGeometry(2000,2000,N,N);g.rotateX(-Math.PI/2);const pos=g.attributes.position,n=pos.count;
  for(let i=0;i<n;i++){const x=pos.getX(i),z=pos.getZ(i)-450;pos.setY(i,land15(x,z))}
  g.computeVertexNormals();const nor=g.attributes.normal,col=new Float32Array(n*3),c=new T.Color(),c2=new T.Color();
  const SNOW=0xe8ecf0,ROCK=0x5a5a58,DARK=0x3c3c3e,WET=0x2a2b2c,FOR=0x24342a,MOSS=0x4a4c40,BED=0x2c3634,PLAT=0xcfd5da,MUD=0x6a6660,ICE=0xd8e6f0,ICEB=0xa8c4d8;
  for(let i=0;i<n;i++){const x=pos.getX(i),z=pos.getZ(i)-450,h=pos.getY(i),ny=nor.getY(i),nn=Math.sin(x*.031+z*.017)*Math.sin(z*.027-x*.011)+.4*Math.sin(x*.11+z*.09);
   if(z>=-1&&z<=150&&x>=-160&&x<=160){c.setHex(PLAT).lerp(c2.setHex(MUD),Math.max(0,nn*.5+.1)+R()*.1)}
   else if(h<WY15-.15){c.setHex(BED).lerp(c2.setHex(0x1a2228),Math.min(1,(WY15-h)/18))}
   else if(h<WY15+2.2){c.setHex(WET)}
   else{const gb=z<-90?glac15(x,z):0;
    if(ny<.5)c.setHex(DARK).lerp(c2.setHex(ROCK),Math.max(0,(ny-.2)/.3));
    else{c.setHex(ROCK);if(h<60&&ny>.62)c.lerp(c2.setHex(nn>-.1?FOR:MOSS),Math.min(1,(ny-.62)*5)*(h<45?1:(60-h)/15))}
    const sl=h>140?1.6:h>70?(h-70)/45+.15:h>40?(h-40)/60*.3:0,sk=Math.min(1,Math.max(0,sl*(ny-.38)*2.6+(h>170?.25:0)+nn*.1));if(sk>0)c.lerp(c2.setHex(SNOW),sk);
    if(gb>0)c.lerp(c2.setHex(Math.sin(x*.21+z*.13)>.75?ICEB:ICE),Math.min(1,gb*1.4))}
   c.multiplyScalar(.94+R()*.1);col[i*3]=c.r;col[i*3+1]=c.g;col[i*3+2]=c.b}
  g.setAttribute('color',new T.BufferAttribute(col,3));const uv=g.attributes.uv;for(let i=0;i<uv.count;i++)uv.setXY(i,uv.getX(i)*160,uv.getY(i)*160);
  const m=new T.Mesh(g,TX.MV);m.position.set(X,0,-450);scene.add(m);ENV15.terrain=m}
 /* anillo lejano de cumbres (cierra el horizonte) */
 {const g=new T.PlaneGeometry(7000,7000,40,40);g.rotateX(-Math.PI/2);const pos=g.attributes.position,n=pos.count,col=new Float32Array(n*3),c=new T.Color();
  for(let i=0;i<n;i++){const x=pos.getX(i),z=pos.getZ(i)-450,ex=Math.max(0,Math.abs(x)-1000),ez=Math.max(0,z>550?z-550:-1450-z),out=Math.sqrt(ex*ex+ez*ez);let h;
   if(out<=0){const inn=Math.min(1000-Math.abs(x),z>-450?550-z:z+1450);h=inn>190?-160:land15(Math.max(-990,Math.min(990,x)),Math.max(-1440,Math.min(540,z)))-6}
   else{const cx=Math.max(-990,Math.min(990,x)),cz=Math.max(-1440,Math.min(540,z)),h0=land15(cx,cz),hf=180+170*Math.sin(x*.0021+1)*Math.sin(z*.0017+2)+120*Math.abs(Math.sin(x*.004+z*.003));h=h0+(hf-h0)*Math.min(1,out/400)}
   pos.setY(i,h);c.setHex(h>120?0xe0e6ec:h>60?0x8a9096:0x4a4c4c);col[i*3]=c.r;col[i*3+1]=c.g;col[i*3+2]=c.b}
  g.setAttribute('color',new T.BufferAttribute(col,3));g.computeVertexNormals();const m=new T.Mesh(g,new T.MeshLambertMaterial({vertexColors:true,flatShading:true}));m.position.set(X,0,-450);scene.add(m);ENV15.ring=m}
 /* bosques de coníferas (instanciados) */
 {const part=Math.max(.35,Math.min(1.2,(typeof G!=='undefined'&&G.part)||1)),N=Math.round(820*part),P=[];let tries=0;
  while(P.length<N&&tries<60000){tries++;const x=(R()-.5)*1500,z=-1300+R()*1700;if(x>-175&&x<175&&z>-5&&z<165)continue;const fm=Math.sin(x*.013+z*.007)+Math.sin(z*.019-x*.004)*.8;if(fm<-.2)continue;const h=land15(x,z);if(h<2||h>50)continue;const gx=land15(x+3,z)-h,gz=land15(x,z+3)-h;if(gx*gx+gz*gz>16)continue;if(glac15(x,z)>.05)continue;P.push(x,z,h)}
  const n=P.length/3,fg=new T.ConeGeometry(1,1,7);fg.translate(0,.5,0);const tg=new T.CylinderGeometry(.12,.16,1,5);tg.translate(0,.5,0);
  const fo=new T.InstancedMesh(fg,new T.MeshLambertMaterial({color:0xffffff}),n),tr=new T.InstancedMesh(tg,new T.MeshLambertMaterial({color:0x3a2a1e}),n),m4=new T.Matrix4(),q4=new T.Quaternion(),e=new T.Euler(),v=new T.Vector3(),sc=new T.Vector3(),c=new T.Color(),cs=new T.Color(0xe8eef2);
  for(let i=0;i<n;i++){const x=P[i*3],z=P[i*3+1],h=P[i*3+2],H=6+R()*8,r=H*(.26+R()*.08);e.set((R()-.5)*.08,R()*6.28,(R()-.5)*.08);q4.setFromEuler(e);v.set(X+x,h+H*.18,z);sc.set(r,H*.85,r);m4.compose(v,q4,sc);fo.setMatrixAt(i,m4);v.set(X+x,h-.3,z);sc.set(H*.12,H*.3,H*.12);m4.compose(v,q4,sc);tr.setMatrixAt(i,m4);
   c.setHex([0x1e3426,0x223a2a,0x1a2e22,0x2a3a2c][i&3]).lerp(cs,Math.min(.55,Math.max(.08,h/90+R()*.25)));fo.setColorAt(i,c)}
  fo.instanceMatrix.needsUpdate=true;if(fo.instanceColor)fo.instanceColor.needsUpdate=true;scene.add(fo);scene.add(tr);ENV15.trees=[fo,tr];ENV15.nTrees=n}
 /* rocas de la orilla (instanciadas) */
 {const P=[];let tries=0;while(P.length<180*4&&tries<30000){tries++;const x=(R()-.5)*700,z=-1100+R()*1100;if(x>-175&&x<175&&z>-30)continue;const s=sdw15(x,z);if(s<-6||s>14)continue;P.push(x,z,land15(x,z),s)}
  const n=P.length/4,geo=new T.IcosahedronGeometry(1,0),m=new T.InstancedMesh(geo,new T.MeshLambertMaterial({color:0xffffff,flatShading:true}),n),m4=new T.Matrix4(),q4=new T.Quaternion(),e=new T.Euler(),v=new T.Vector3(),sc=new T.Vector3(),c=new T.Color();
  for(let i=0;i<n;i++){const k=1.2+R()*3.5;e.set(R()*3,R()*3,R()*3);q4.setFromEuler(e);v.set(X+P[i*4],Math.max(P[i*4+2],WY15-1)+k*.2,P[i*4+1]);sc.set(k*(1+R()*.6),k*(.5+R()*.4),k*(1+R()*.5));m4.compose(v,q4,sc);m.setMatrixAt(i,m4);c.setHex([0x4a4a4a,0x3a3a3c,0x5a5a58][i%3]);if(R()<.4)c.lerp(new T.Color(0xe8ecf0),.6);m.setColorAt(i,c)}
  scene.add(m);ENV15.rocks=m}
 /* témpanos a la deriva (lejos de las derrotas) */
 {const g=new T.CylinderGeometry(1,1,.5,9);{const p=g.attributes.position,jr=[];for(let k=0;k<10;k++)jr.push(.65+R()*.5);for(let i=0;i<p.count;i++){const x=p.getX(i),z=p.getZ(i),a=Math.atan2(z,x),k=Math.round(((a+Math.PI)/6.2832)*9)%9,r=Math.hypot(x,z);if(r>.01){p.setX(i,x*jr[k]);p.setZ(i,z*jr[k])}}g.computeVertexNormals()}
  const L=[];let tries=0;while(L.length<46*3&&tries<20000){tries++;const x=(R()-.5)*500,z=-1050+R()*1000;if(depth15(x,z)<2.5)continue;if(z>-130&&x>-175&&x<175&&!(Math.abs(x)>110&&z<-40))continue;if(pl15(MC15,x,z)<32)continue;if(x<-40&&z<-280&&z>-790&&pl15(WC15,x,z)<10)continue;if(sdw15(x,z)>-4)continue;L.push(x,z,1.5+R()*5)}
  const n=L.length/3,m=new T.InstancedMesh(g,new T.MeshLambertMaterial({color:0xe2ecf2}),n);ENV15.floes={m,L,n,ry:[]};for(let i=0;i<n;i++)ENV15.floes.ry.push(R()*6.28);scene.add(m);floe15(0)}
 /* agua: plano que sigue a la cámara, olas por vértice y rizado por mapa de normales */
 {const TX2=TX;TX2.rip.repeat.set(70,70);const g=new T.PlaneGeometry(2400,2400,90,90);g.rotateX(-Math.PI/2);const mat=new T.MeshPhongMaterial({color:0x2e3e46,specular:0x8a9ca8,shininess:60,normalMap:TX2.rip,normalScale:new T.Vector2(.45,.45),transparent:true,opacity:.9});
  const m=new T.Mesh(g,mat);m.position.set(X,WY15,-450);m.frustumCulled=false;scene.add(m);ENV15.water=m;ENV15.wstep=2400/90;ENV15.wx=g.attributes.position.array.slice()}
 /* minimapa */
 mini15();if(ENV15.base)foot15()}
function floe15(t){const F=ENV15.floes;if(!F)return;const m4=new T.Matrix4(),q4=new T.Quaternion(),e=new T.Euler(),v=new T.Vector3(),sc=new T.Vector3();for(let i=0;i<F.n;i++){const x=F.L[i*3],z=F.L[i*3+1],s=F.L[i*3+2];e.set(Math.sin(t+i)*.03,F.ry[i],Math.cos(t*.8+i)*.03);q4.setFromEuler(e);v.set(X15+x,WY15+.05+waveH15(x,z,t),z);sc.set(s,1,s*(.6+(i%5)*.12));m4.compose(v,q4,sc);F.m.setMatrixAt(i,m4)}F.m.instanceMatrix.needsUpdate=true}
function mini15(){const S=400,cv=document.createElement('canvas');cv.width=cv.height=S;const c=cv.getContext('2d'),id=c.createImageData(S,S),I=ENV15.miniInfo,H=new Float32Array(S*S);
 for(let j=0;j<S;j++)for(let i=0;i<S;i++)H[j*S+i]=land15(I.x0+i*I.mpp,I.z0+j*I.mpp);
 for(let j=0;j<S;j++)for(let i=0;i<S;i++){const h=H[j*S+i],o=(j*S+i)*4;let r,g,b;
  if(h<WY15){const d=Math.min(1,(WY15-h)/18);r=58-26*d;g=74-28*d;b=84-26*d}
  else{const hx=H[j*S+Math.min(S-1,i+1)]-H[j*S+Math.max(0,i-1)],hz=H[Math.min(S-1,j+1)*S+i]-H[Math.max(0,j-1)*S+i],sh=Math.max(.45,Math.min(1.3,1-(hx+hz)*.025));
   const k=Math.min(1,h/200);r=90+60*k;g=92+60*k;b=88+70*k;if(h>75){r=g=b=200+40*Math.min(1,(h-75)/80)}if(h<1&&h>-.5&&I.x0+i*I.mpp>-161&&I.x0+i*I.mpp<161){r=170;g=172;b=168}r*=sh;g*=sh;b*=sh}
  id.data[o]=r;id.data[o+1]=g;id.data[o+2]=b;id.data[o+3]=255}
 c.putImageData(id,0,0);ENV15.mini=cv}
function foot15(){const cv=ENV15.mini;if(!cv)return;const c=cv.getContext('2d'),I=ENV15.miniInfo;c.fillStyle='#2a2a2c';for(const f of ENV15.foot){const sw=Math.abs(Math.sin(f[4]||0))>.5,w=sw?f[3]:f[2],d=sw?f[2]:f[3];c.fillRect((f[0]-w/2-I.x0)/I.mpp,(f[1]-d/2-I.z0)/I.mpp,Math.max(1,w/I.mpp),Math.max(1,d/I.mpp))}
 c.fillStyle='#6a5a40';for(const p of[[0,-25,6,50],[41,-22,10,45],[-60,-15,12,30]])c.fillRect((p[0]-p[2]/2-I.x0)/I.mpp,(p[1]-p[3]/2-I.z0)/I.mpp,Math.max(1,p[2]/I.mpp),p[3]/I.mpp)}
/* animación del agua (cada dos llamadas), témpanos, cascos amarrados, bandera, anemómetro y humos */
function water15(dt,time,camX,camZ,amp){const E=ENV15,m=E.water;if(!m)return;E.amp=amp===undefined?E.amp:amp;E.t=time;E.tick++;
 const st=E.wstep;m.position.x=Math.round((camX-X15)/st)*st+X15;m.position.z=Math.round(camZ/st)*st;
 const rp=m.material.normalMap;rp.offset.x=time*.006;rp.offset.y=time*.004;
 if(E.tick%2===0&&E.amp>.02){const g=m.geometry,p=g.attributes.position.array,nr=g.attributes.normal.array,B=E.wx,ox=m.position.x-X15,oz=m.position.z;
  for(let i=0;i<p.length;i+=3){const x=B[i]+ox,z=B[i+2]+oz,a=E.amp*(z>-60?.3:z>-220?.3+.7*(-60-z)/160:1),p1=x*.042+z*.013+time*1.05,p2=z*.057-x*.021-time*1.32,p3=(x+z)*.071+time*1.9,c1=.55*Math.cos(p1),c2=.3*Math.cos(p2),c3=.15*Math.cos(p3);
   p[i+1]=a*(.55*Math.sin(p1)+.3*Math.sin(p2)+.15*Math.sin(p3));const dx=a*(c1*.042-c2*.021+c3*.071),dz=a*(c1*.013+c2*.057+c3*.071),l=1/Math.sqrt(dx*dx+1+dz*dz);nr[i]=-dx*l;nr[i+1]=l;nr[i+2]=-dz*l}
  g.attributes.position.needsUpdate=true;g.attributes.normal.needsUpdate=true}
 else if(E.tick%2===0&&!E.flat){}
 if(E.tick%3===0)floe15(time);
 for(const b of E.bob){const w=waveH15(b.x,b.z,time);b.g.position.y=b.y+w*(b.k||1);b.g.rotation.x=(b.rx||0)+Math.sin(time*.9+b.x)*.012*E.amp*(b.k||1);b.g.rotation.z=Math.sin(time*.7+b.z)*.02*E.amp*(b.k||1)}
 if(E.flagG){const g=E.flagG,p=g.attributes.position;for(let i=0;i<p.count;i++){const x=E.flagX[i];p.setZ(i,Math.sin(x*2.2-time*6)*.18*(x+1.5)/3+Math.sin(x*4-time*9)*.04*(x+1.5)/3)}p.needsUpdate=true}
 if(E.anemo)E.anemo.rotation.y+=dt*6;if(E.vane)E.vane.rotation.y=Math.sin(time*.3)*.3+.6;
 if(E.autoSmoke&&typeof smoke==='function'){E._sm=(E._sm||0)-dt;if(E._sm<=0&&E.smoke.length){E._sm=.55;const s=E.smoke[(R()*E.smoke.length)|0];smoke(s[0],s[1],s[2],1.6,4.5,0x8a8c90,1.1,.3)}
  E._sb=(E._sb||0)-dt;if(E._sb<=0&&E.burn.length){E._sb=.16;const s=E.burn[(R()*E.burn.length)|0];smoke(s[0]+(R()-.5)*s[3],s[1],s[2]+(R()-.5)*s[3],3+s[3]*.6,6,0x141414,2.4,.6)}}}
