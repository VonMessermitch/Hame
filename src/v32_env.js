/* =====================================================================
   v32_env · GOLFO DE KARSKAYA — mapa del nivel 17 («Golfo de Hierro»)
   Puesto de Karsk, Barranco Sokol, Línea de las Tres Cruces, Llanura de
   Terek, Estación Karsk, Complejo Drovna, Puerto de Karsk, Garganta de
   Orlov con su puente, orilla norte fortificada. Mar, acantilados,
   mesetas, cielo gris, niebla, aguanieve y fogonazos en el horizonte.
   Coordenadas LOCALES (x' = X17 + x). Norte = −z.
   API: buildKarsk17(), sky17(), weather17(dt), floor17(x,z), K17.
   ===================================================================== */
let K17=null;
const W17={built:false,u:{value:0},smk:[],fl:[],ms:[],sl:null,beam:null,anemo:null,river:null,foam:null,sea:null,fogN:25,fogF:500,fogC:0x9aa0a4,ft:2,dt:0,skyS:0,gust:0,wind:3.2};
/* RNG con semilla: el mapa (rocas, colisiones, coberturas) es idéntico en cada carga */
const RN17=(()=>{let s=0x6b617273;return()=>{s|=0;s=s+0x6D2B79F5|0;let t=Math.imul(s^s>>>15,1|s);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}})();
const pt17=(x,z,o)=>{const a=[x,z];a.x=x;a.z=z;if(o)Object.assign(a,o);return a};
const sm17=t=>t<=0?0:t>=1?1:t*t*(3-2*t);
/* ---------- costa, terreno y alturas ---------- */
function coast17(z){if(z>12)return 104+3*Math.sin(z*.15);if(z>-72)return 140+3*Math.sin(z*.1);if(z>-598)return 141+9*Math.sin(z*.023+.4)+4*Math.sin(z*.07);if(z>-722)return 150;return 138+6*Math.sin(z*.05)}
const beach17=z=>z<=12&&z>-72;
function mesa17(x,z){const n=Math.sin(x*.011+1.3)*Math.sin(z*.008+.7)+.45*Math.sin(x*.023-z*.017)+.25*Math.sin(x*.05+z*.04);return 36*sm17((n-.2)/.18)+6*Math.sin(x*.03)*Math.sin(z*.025)}
function hT17(x,z){let y=0;const cx=coast17(z);
 if(beach17(z)){if(x>110)y=-.55*Math.min(1,(x-110)/30)-Math.max(0,x-140)*.13}else if(x>cx)y=-5-(x-cx)*.06-1.2*Math.sin(z*.3+x*.2);
 y=Math.max(y,-12);
 if(x<-235){const k=(-235-x);y+=k*.07*(1+.4*Math.sin(z*.012))+(x<-290?mesa17(x,z)*sm17((-290-x)/80):0)}
 if(z>115){const k=z-115;y+=k*.09+(z>150?mesa17(x+40,z)*.7*sm17((z-150)/80):0);if(x>cx)y=Math.min(y,-3)}
 if(z<-995){const k=-995-z;y+=k*.08+(z<-1040?mesa17(x,z)*sm17((-1040-z)/90):0)}
 return y}
/* rampa transitable de la loma rocosa (−120,−730): alturas reales para quien las use */
const HILL17={x:-120,z:-730,st:[[30,.8],[24,1.6],[18,2.4],[12,3.2],[7,4]]};
function floor17(x,z){let f=0;for(const s of HILL17.st)if(Math.abs(x-HILL17.x)<s[0]&&Math.abs(z-HILL17.z)<s[0])f=s[1];return f}
/* ---------- materiales y texturas ---------- */
function tex17(kind){const c=document.createElement('canvas');c.width=c.height=128;const x=c.getContext('2d');
 if(kind==='c'){x.fillStyle='#d6d6d6';x.fillRect(0,0,128,128);for(let i=0;i<900;i++){const v=170+RN17()*70|0;x.fillStyle='rgba('+v+','+v+','+v+',.5)';x.fillRect(RN17()*128,RN17()*128,2,2)}x.fillStyle='rgba(60,56,52,.55)';for(let r=0;r<8;r++){x.fillRect(0,r*16,128,2);const o=r%2?0:16;for(let k=0;k<4;k++)x.fillRect(o+k*32,r*16,2,16)}}
 else if(kind==='w'){x.fillStyle='#8aa0a8';x.fillRect(0,0,128,128);for(let i=0;i<260;i++){const v=150+RN17()*100|0;x.fillStyle='rgba('+v+','+(v+6)+','+(v+10)+','+(.15+RN17()*.35)+')';x.fillRect(RN17()*128,RN17()*128,6+RN17()*22,1+RN17()*1.5)}}
 else if(kind==='f'){const g=x.createRadialGradient(64,64,0,64,64,64);g.addColorStop(0,'rgba(255,240,210,1)');g.addColorStop(.25,'rgba(255,190,120,.6)');g.addColorStop(1,'rgba(255,160,80,0)');x.fillStyle=g;x.fillRect(0,0,128,128)}
 else{x.fillStyle='#e0e0e0';x.fillRect(0,0,128,128);for(let i=0;i<1400;i++){const v=180+RN17()*75|0;x.fillStyle='rgba('+v+','+v+','+v+',.55)';x.fillRect(RN17()*128,RN17()*128,1+RN17()*2,1+RN17()*2)}}
 const t=new T.CanvasTexture(c);t.wrapS=t.wrapT=T.RepeatWrapping;return t}
/* UV triplanar en metros (las texturas mantienen escala en piezas fusionadas) */
function triUV17(g,k){const p=g.attributes.position,n=g.attributes.normal,uv=g.attributes.uv;for(let i=0;i<p.count;i++){const nx=Math.abs(n.getX(i)),ny=Math.abs(n.getY(i)),nz=Math.abs(n.getZ(i));let u,v;if(ny>.6){u=p.getX(i);v=p.getZ(i)}else if(nx>nz){u=p.getZ(i);v=p.getY(i)}else{u=p.getX(i);v=p.getY(i)}uv.setXY(i,u*k,v*k)}uv.needsUpdate=true}
/* prisma triangular unitario (frontón/ático): base y=0, cumbrera y=1, eje x */
let TRI17=null;
function gTri17(){if(TRI17)return TRI17;const a0=[-.5,0,-.5],b0=[-.5,0,.5],c0=[-.5,1,0],a1=[.5,0,-.5],b1=[.5,0,.5],c1=[.5,1,0];const F=[a0,b0,c0,a1,c1,b1,a0,a1,b1,a0,b1,b0,b0,b1,c1,b0,c1,c0,a0,c0,c1,a0,c1,a1];const g=new T.BufferGeometry();g.setAttribute('position',new T.BufferAttribute(new Float32Array(F.flat()),3));g.setAttribute('uv',new T.BufferAttribute(new Float32Array(F.length*2),2));g.computeVertexNormals();return TRI17=g}
/* rocas facetadas (deformación determinista por posición: sin grietas) */
let ROCK17=null;
function gRock17(d){ROCK17=ROCK17||{};if(ROCK17[d])return ROCK17[d];const g=new T.IcosahedronGeometry(1,d),p=g.attributes.position;for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i),z=p.getZ(i),h=Math.sin(x*12.9+y*78.2+z*37.7)*43758.5,k=.78+.42*(h-Math.floor(h));p.setXYZ(i,x*k,y*k*(y<0?.6:1),z*k)}g.computeVertexNormals();if(!g.attributes.uv)g.setAttribute('uv',new T.BufferAttribute(new Float32Array(p.count*2),2));return ROCK17[d]=g}
/* ---------- sectores: cada uno se fusiona en ≤2 mallas (rugoso / hiladas) ---------- */
const S17={};let SEC17=null;
function sec17(x,z){if(x>124&&z<-590&&z>-730)return'port';if(z>-20)return'post';if(z>-226)return'rav';if(z>-300)return'line';if(z>-440)return'step';if(z>-560)return'sta';if(z>-742)return'dro';if(z>-815)return'brg';return'nor'}
function Q17(x,z,m){const k=SEC17||sec17(x,z);const s=S17[k]||(S17[k]={r:PB(),c:PB()});return s[m==='c'?'c':'r']}
function bx17(w,h,d,c,x,y,z,rx,ry,rz,m){pBox(Q17(x,z,m),w,h,d,c,X17+x,y,z,rx,ry,rz)}
function cy17(a,b,h,c,x,y,z,rx,ry,rz,s,m){pa(Q17(x,z,m),gCyl(a,b,h,s||8),c,X17+x,y,z,rx,ry,rz)}
function ge17(g,c,x,y,z,rx,ry,rz,sx,sy,sz,m){pa(Q17(x,z,m),g,c,X17+x,y,z,rx,ry,rz,sx,sy,sz)}
function bm17(c,x0,y0,z0,x1,y1,z1,th,m){const dx=x1-x0,dy=y1-y0,dz=z1-z0,L=Math.sqrt(dx*dx+dy*dy+dz*dz)||.01;pBox(Q17((x0+x1)/2,(z0+z1)/2,m),th,L,th,c,X17+(x0+x1)/2,(y0+y1)/2,(z0+z1)/2,Math.atan2(dz,dy),0,-Math.asin(Math.max(-1,Math.min(1,dx/L))))}
function rk17(x,y,z,sx,sy,sz,c,d){ge17(gRock17(d||0),c,x,y,z,RN17()*6,RN17()*6,RN17()*.4,sx,sy,sz)}
function ob17(x,z,hw,hd,h,y0,st){const o={x:X17+x,z,hw,hd,h};if(y0)o.y0=y0;if(st)o.step=true;obstB.push(o);K17.obs++;return o}
function cv17(x,z,r){covers.push({x:X17+x,z,r:r||1.4});K17.cover.push(pt17(x,z))}
/* kit de edificio: marco local (u a lo largo de w, v a lo largo de d) girado "a" */
function kit17(cx,cz,a){const c=Math.cos(a),s=Math.sin(a);const P=(u,v)=>[cx+u*c+v*s,cz-u*s+v*c];
 return{a,P,b:(w,h,d,col,u,y,v,rx,ry,rz,m)=>{const p=P(u,v);bx17(w,h,d,col,p[0],y,p[1],rx,a+(ry||0),rz,m)},
  cy:(r1,r2,h,col,u,y,v,rx,ry,rz,sg,m)=>{const p=P(u,v);cy17(r1,r2,h,col,p[0],y,p[1],rx,a+(ry||0),rz,sg,m)},
  g:(g,col,u,y,v,rx,ry,rz,sx,sy,sz,m)=>{const p=P(u,v);ge17(g,col,p[0],y,p[1],rx,a+(ry||0),rz,sx,sy,sz,m)},
  ob:(u,v,hu,hv,h,y0)=>{const p=P(u,v),sw=Math.abs(s)>.5;return ob17(p[0],p[1],sw?hv:hu,sw?hu:hv,h,y0)}}}
/* pieza sobre una fachada: face n(−v) s(+v) w(−u) e(+u); al = posición a lo largo; out = salida */
function fp17(K,o,face,al,y,out,sw,sh,sd,col,m){const ns=face==='n'||face==='s',sg=(face==='s'||face==='e')?1:-1;if(ns)K.b(sw,sh,sd,col,al,y,sg*(o.d/2+out),0,0,0,m);else K.b(sd,sh,sw,col,sg*(o.w/2+out),y,al,0,0,0,m)}
function win17(K,o,face,al,y,ww,hh,D){const tc=o.trim||0xcfc8b8,lit=RN17()<(o.lit||.12);fp17(K,o,face,al,y,.02,ww+.26,hh+.26,.06,tc);fp17(K,o,face,al,y,.05,ww,hh,.06,lit?0xc8a868:0x20262a);
 if(D>0){fp17(K,o,face,al,y,.09,.06,hh,.04,tc);fp17(K,o,face,al,y+hh*.18,.09,ww,.06,.04,tc);fp17(K,o,face,al,y+hh/2+.13,.05,ww+.42,.16,.14,shade(tc,.85))}
 fp17(K,o,face,al,y-hh/2-.08,.08,ww+.36,.09,.22,shade(tc,.8));
 if(D>1&&o.shut){fp17(K,o,face,al-ww/2-.32,y,.06,.42,hh+.1,.05,o.shut);fp17(K,o,face,al+ww/2+.32,y,.06,.42,hh+.1,.05,o.shut)}
 if(o.int)fp17(K,o,face,al,y,-.29,ww,hh,.04,0x9aa8ae)}
function door17(K,o,face,al,dw,open,D){const tc=o.trim||0xcfc8b8,dh=o.dh||2.3;fp17(K,o,face,al,dh/2+.05,.02,dw+.32,dh+.18,.07,tc);if(open!==2)fp17(K,o,face,al,dh/2,open?.03:.06,dw,dh,.06,open?0x0e0c0a:(o.doorC||0x4a3424));fp17(K,o,face,al,.09,.36,dw+.7,.18,.72,0x6a6862);
 if(D>0&&!o.noCan){fp17(K,o,face,al,dh+.35,.42,dw+.9,.1,.9,o.roof||0x3a3a3a);for(const s of[-1,1])fp17(K,o,face,al+s*(dw/2+.3),dh+.2,.8,.06,.3,.06,0x2a2a2a)}}
/* edificio completo con muros, zócalo, cornisa, cubierta, frontones, ventanas, puertas y chimeneas */
function house17(o){const D=K17.D,a=o.a||0,K=kit17(o.x,o.z,a),w=o.w,d=o.d,h=o.h,wc=o.wall,rc=o.roof||0x3e3c3a,tc=o.trim||0xcfc8b8,m=o.mat||'c',faces=o.faces||'nsew',fl=o.fl||1;const prev=SEC17;SEC17=o.sec||sec17(o.x,o.z);
 const doors=o.doors||[];
 if(o.int){const t=.26;const segs=(face,L)=>{const gs=doors.filter(q=>q[0]===face).map(q=>[q[1]-q[2]/2,q[1]+q[2]/2]).sort((p,q)=>p[0]-q[0]);const out=[];let s=-L/2;for(const g of gs){if(g[0]>s)out.push([s,g[0]]);out.push([g[0],g[1],1]);s=g[1]}if(s<L/2)out.push([s,L/2]);return out};
  for(const face of['n','s','w','e']){const ns=face==='n'||face==='s',L=ns?w:d-2*t,sg=(face==='s'||face==='e')?1:-1;for(const sgm of segs(face,L)){const len=sgm[1]-sgm[0],c=(sgm[0]+sgm[1])/2;const y0=sgm[2]?(o.dh||2.3):0,hh=h-y0;if(hh<=.05)continue;
   if(ns){K.b(len,hh,t,wc,c,y0+hh/2,sg*(d/2-t/2),0,0,0,m);if(!sgm[2])K.ob(c,sg*(d/2-t/2),len/2,t/2+.05,h)}else{K.b(t,hh,len,wc,sg*(w/2-t/2),y0+hh/2,c,0,0,0,m);if(!sgm[2])K.ob(sg*(w/2-t/2),c,t/2+.05,len/2,h)}}}
  K.b(w-.5,.08,d-.5,0x5a4632,0,.04,0,0,0,0,'c');K.b(w-.5,.06,d-.5,shade(wc,.55),0,h-.03,0)}
 else{K.b(w,h,d,wc,0,h/2,0,0,0,0,m);K.ob(0,0,w/2,d/2,h+(o.flat?0:1.2))}
 K.b(w+.24,.45,d+.24,o.plinth||0x5e5a54,0,.22,0,0,0,0,'c');
 if(D>0&&!o.noPost)for(const su of[-1,1])for(const sv of[-1,1])K.b(.3,h,.3,tc,su*w/2,h/2,sv*d/2);
 K.b(w+.3,.24,d+.3,tc,0,h-.12,0);for(let f=1;f<fl;f++)K.b(w+.14,.14,d+.14,shade(tc,.9),0,f*h/fl,0);
 let top=h;
 if(o.flat){K.b(w+.4,.3,d+.4,rc,0,h+.15,0);for(const s of[-1,1]){K.b(w+.5,.55,.25,tc,0,h+.42,s*(d/2+.1));K.b(.25,.55,d+.5,tc,s*(w/2+.1),h+.42,0)}top=h+.7}
 else{const rh=o.rh||Math.min(d*.42,4),ang=Math.atan2(rh,d/2),L=Math.hypot(d/2,rh)+.55;K.g(gTri17(),wc,0,h,0,0,0,0,w,rh,d,m);
  for(const s of[-1,1])K.b(w+.7,.16,L,rc,0,h+rh/2+.09*Math.cos(ang)-Math.sin(ang)*.25,s*(d/4+.09*Math.sin(ang)+Math.cos(ang)*.25),s*ang,0,0,'c');
  K.b(w+.74,.2,.32,shade(rc,.75),0,h+rh+.06,0);if(D>0){for(const su of[-1,1])K.b(.12,.16,L*2*Math.cos(ang),tc,su*(w/2+.36),h+.05,0)}
  if(o.vent){K.b(w*.5,.9,1.1,shade(rc,.9),0,h+rh+.5,0);K.b(w*.5+.3,.12,1.6,rc,0,h+rh+1,0)}top=h+rh}
 /* aberturas */
 const ws=o.ws||3.2,wh=o.wh||1.3,ww=o.ww||1;
 for(const face of faces){if(!'nsew'.includes(face))continue;const ns=face==='n'||face==='s',L=ns?w:d;const n=Math.max(1,Math.floor((L-1)/ws));
  for(let f=0;f<fl;f++)for(let i=0;i<n;i++){const al=-L/2+(i+.5)*L/n;if(f===0&&doors.some(q=>q[0]===face&&Math.abs(q[1]-al)<q[2]/2+ww/2+.3))continue;if(o.noWin&&o.noWin.includes(face))continue;win17(K,o,face,al,f*h/fl+(o.wy||1.65),ww,wh,D)}}
 for(const q of doors)door17(K,o,q[0],q[1],q[2],o.int?2:q[3],D);
 for(const c of o.ch||[]){const ch=top-h+1.6;K.b(.75,ch+.6,.75,o.chC||0x6a3e30,c[0],h+ch/2-.2,c[1],0,0,0,'c');K.b(.95,.16,.95,0x3a3a3a,c[0],h+ch+.12,c[1]);const p=K.P(c[0],c[1]);W17.smk.push([X17+p[0],h+ch+.4,p[1],o.smk||.5])}
 if(D>1&&!o.flat&&!o.int){for(const su of[-1,1])for(const sv of[-1,1])K.b(.1,h,.1,0x3a3a3a,su*(w/2+.12),h/2,sv*(d/2+.12))}
 if(o.cv!==false){for(const su of[-1,1])for(const sv of[-1,1]){const p=K.P(su*(w/2+1.1),sv*(d/2+1.1));cv17(p[0],p[1],1.2)}}
 SEC17=prev;return K}
/* sacos terreros: fila recta con colisión por tramos */
function sb17(x0,z0,x1,z1,h,col,noOb){const D=K17.D,dx=x1-x0,dz=z1-z0,L=Math.hypot(dx,dz),ry=Math.atan2(-dz,dx),rows=Math.max(1,Math.round(h/.3)),n=Math.max(1,Math.round(L/.92));col=col||0xa49470;
 for(let r=0;r<rows;r++){if(D===0&&r<rows-1){const cxm=(x0+x1)/2,czm=(z0+z1)/2;bx17(L,(rows-1)*.3,.62,col,cxm,(rows-1)*.15,czm,0,ry,0,'c');r=rows-2;continue}for(let i=0;i<n;i++){const t=(i+.5+(r%2?.5:0))/n;if(t>1)continue;bx17(.9,.3,.55,shade(col,.92+RN17()*.16),x0+dx*t,.15+r*.3,z0+dz*t,0,ry+(RN17()-.5)*.12,0)}}
 if(noOb)return;const ax=Math.abs(dx)<.3||Math.abs(dz)<.3;if(ax)ob17((x0+x1)/2,(z0+z1)/2,Math.abs(dx)/2+.3,Math.abs(dz)/2+.3,h);else{const k=Math.ceil(L/1.6);for(let i=0;i<k;i++){const t=(i+.5)/k;ob17(x0+dx*t,z0+dz*t,.7,.7,h)}}}
/* anillo de sacos (nido de ametralladora / pozo de cañón) abierto hacia "op" (ángulo, 0 = −z) */
function ring17(cx,cz,r,h,op,gap){const n=Math.round(r*6.283/.95);for(let i=0;i<n;i++){const a=i/n*6.283;let da=Math.abs(((a-op)%6.283+9.42)%6.283-3.14);if(da<gap)continue;const x=cx+Math.sin(a)*r,z=cz-Math.cos(a)*r;const rows=Math.round(h/.3);if(K17.D>0)for(let k=0;k<rows;k++)bx17(.9,.3,.55,shade(0xa49470,.92+RN17()*.16),x,.15+k*.3,z,0,-a+(k%2)*.1,0,'c');else bx17(.95,h,.6,0xa49470,x,h/2,z,0,-a,0,'c')}
 const K=8;for(let i=0;i<K;i++){const a=(i+.5)/K*6.283;let da=Math.abs(((a-op)%6.283+9.42)%6.283-3.14);if(da<gap+.25)continue;ob17(cx+Math.sin(a)*r,cz-Math.cos(a)*r,.75,.75,h)}cv17(cx,cz,r)}
/* alambrada: caballos de frisa y hebras */
function wire17(x0,x1,z,gaps){const D=K17.D;let s=x0;gaps=gaps.slice().sort((p,q)=>p[0]-q[0]);const segs=[];for(const g of gaps.concat([[x1+10,0]])){const e=Math.min(x1,g[0]-g[1]/2);if(e>s)segs.push([s,e]);s=g[0]+g[1]/2}
 for(const [a,b] of segs){for(let x=a;x<=b;x+=3){for(const s of[-1,1])bm17(0x4a3a2a,x-.6*s,0,z-.7,x+.6*s,1.2,z+.7,.08);}for(const y of D>0?[.35,.7,1.05]:[.7])for(const dz of[-.6,.6])bx17(b-a,.025,.025,0x6a645a,(a+b)/2,y,z+dz);ob17((a+b)/2,z,(b-a)/2,.9,1.1)}}
/* trinchera en zigzag (baluartes y traveses) frente al sur (+z) */
function trench17(x0,x1,zb,o){const D=K17.D,bays=[],B=10;o=o||{};const gF=o.gF||[],gB=o.gB||[],P=0xa09070,PD=0x7a6a50,MUD=0x3e352a;
 const cut=(xa,xb,gs)=>{let s=xa;const out=[];for(const g of gs.filter(g=>g[0]>xa-g[1]&&g[0]<xb+g[1]).sort((p,q)=>p[0]-q[0])){const e=g[0]-g[1]/2;if(e>s)out.push([s,e]);s=Math.max(s,g[0]+g[1]/2)}if(s<xb)out.push([s,xb]);return out};
 let i=0;for(let xa=x0;xa<x1;xa+=B,i++){const xb=Math.min(x1,xa+B),zi=zb-(i%2)*4,cx=(xa+xb)/2;bays.push(pt17(cx,zi));
  bx17(xb-xa,.06,2.4,MUD,cx,.03,zi,0,0,0);if(D>0)bx17(xb-xa,.05,.8,0x5a4632,cx,.08,zi,0,0,0,'c');bx17(xb-xa,.42,.5,0x5a4a36,cx,.21,zi+.95,0,0,0,'c');
  for(const [a,b] of cut(xa,xb,gF)){bx17(b-a,1.2,1.4,P,(a+b)/2,.6,zi+1.9,0,0,0,'c');if(D>0)for(let x=a+.5;x<b;x+=.95)bx17(.9,.28,.5,shade(P,.9+RN17()*.2),x,1.34,zi+1.9+(RN17()-.5)*.3,0,(RN17()-.5)*.2,0);ob17((a+b)/2,zi+1.9,(b-a)/2,.7,1.25);if(D>0)for(let x=a+1;x<b;x+=2.5)bx17(.12,1.25,.12,0x4a3a28,x,.62,zi+1.15)}
  for(const [a,b] of cut(xa,xb,gB)){bx17(b-a,.8,1.2,PD,(a+b)/2,.4,zi-1.8,0,0,0,'c');ob17((a+b)/2,zi-1.8,(b-a)/2,.6,.8)}
  if(xb<x1){const zn=zb-((i+1)%2)*4,zf=Math.max(zi,zn)+1.9,zr=Math.min(zi,zn)+1.9;bx17(1.4,1.2,zf-zr+1.4,P,xb,.6,(zf+zr)/2,0,0,0,'c');ob17(xb,(zf+zr)/2,.7,(zf-zr)/2+.7,1.25);const yf=Math.max(zi,zn)-1.8,yr=Math.min(zi,zn)-1.8;bx17(1.2,.8,yf-yr+1.2,PD,xb,.4,(yf+yr)/2,0,0,0,'c');bx17(1.4,.06,4.4,MUD,xb,.03,(zi+zn)/2,0,0,0)}
  if(i%2===0)cv17(cx,zi+.6,1.5)}
 return bays}
/* v33 · casamata de hormigón con tronera al sur y puerta blindada trasera (mismo diseño que
   las casamatas del cap. XIII, v25/v31_l13, parametrizado para coordenadas locales del 17).
   Centro (cx,cz); la tronera mira a +z (sur). Devuelve {mg:[x,z], door:[x,z]} */
function casemate17(cx,cz,o){o=o||{};const D=K17.D,CC=o.col||0x8a8780,CB=(w,h,d,x,y,z)=>bx17(w,h,d,CC,cx+x,y,cz+z);
 CB(10.6,1.2,.8,0,.6,3.5);CB(1,1.6,.8,-4.8,2.0,3.5);CB(1,1.6,.8,4.8,2.0,3.5);CB(.7,1.6,.8,0,2.0,3.5);CB(.8,2.8,7,-5,1.4,0);CB(.8,2.8,7,5,1.4,0);CB(6.3,2.8,.8,-1.85,1.4,-3.5);CB(2.3,2.8,.8,3.85,1.4,-3.5);CB(1.4,.7,.8,2,2.45,-3.5);
 bx17(11.8,.7,8.8,0x5a5a56,cx,3.15,cz);bx17(11,.45,8,0x3e3a2c,cx,3.7,cz);for(let i=0;i<8;i++)bx17(1.2,.4,.6,0xb8ac88,cx-4.4+i*1.25,4.1,cz+3.7,0,(i%2)*.08,0,'c');bx17(10.8,.1,.9,0x2a2a26,cx,2.85,cz+4.3);
 for(const s of[-1,1])bx17(1.4,2.6,8.4,0x4a4636,cx+s*6.1,.9,cz,0,0,-s*.6);bx17(12,1.6,1.2,0x4a4636,cx,.5,cz+4.4,.75,0,0);
 /* interior oscuro, marco de acero y hoja blindada abierta */bx17(9.2,.04,6.2,0x24221e,cx,.02,cz);bx17(9.2,.06,.7,0x14120e,cx,2.75,cz+3.1);bx17(1.6,.16,.16,0x2a2a2a,cx+2,2.12,cz-3.92);for(const s of[-1,1])bx17(.16,2.1,.16,0x2a2a2a,cx+2+s*.74,1.05,cz-3.92);
 {const hx=cx+1.32,hz=cz-3.95,a=1.8,ux=Math.cos(a),uz=-Math.sin(a);bx17(1.36,2.05,.1,0x3a4038,hx+ux*.68,1.03,hz+uz*.68,0,a,0);if(D>0)for(let i=0;i<3;i++)for(let j=0;j<3;j++)bx17(.06,.06,.12,0x2a2e28,hx+ux*(.2+j*.48),.35+i*.65,hz+uz*(.2+j*.48),0,a,0);bx17(.07,.45,.16,0x6a6a62,hx+ux*1.18,1.0,hz+uz*1.18,0,a,0)}
 /* plataforma de tiro de la ametralladora, mesa, cajas y farol */bx17(2.2,.25,1.4,0x4a3a28,cx-1.4,.13,cz+2.3,0,0,0,'c');bx17(1.8,.08,.6,0x5a3a22,cx-2.5,.8,cz-2.6,0,0,0,'c');for(let i=0;i<3;i++)bx17(.7,.45,.45,0x4a5a3a,cx+3.6,.23,cz-1.8+i*.6,0,0,0,'c');bx17(.14,.14,.14,0xffd890,cx,2.6,cz-1);
 /* camuflaje y ventilación (v31_l13) */for(let i=0;i<5;i++)bx17(1.2+RN17()*.8,.06,.9,0x3a4a2a,cx-4+i*2,3.95,cz-1.5+(i%2)*1.6,0,RN17(),0);cy17(.18,.18,.6,0x4a4a44,cx-3,4.1,cz-2,0,0,0,8);bx17(.5,.08,.5,0x3a3a36,cx-3,4.42,cz-2);
 if(o.name&&D>0){bx17(1.6,.36,.05,0xd8ccb0,cx-2.6,3.25,cz-4.42);bx17(1.3,.06,.06,0x1a1a1a,cx-2.6,3.28,cz-4.46)}
 ob17(cx,cz+3.5,5.3,.4,1.2);ob17(cx-5,cz,.4,3.5,2.8);ob17(cx+5,cz,.4,3.5,2.8);ob17(cx-1.85,cz-3.5,3.15,.4,2.8);ob17(cx+3.85,cz-3.5,1.15,.4,2.8);
 cv17(cx-6.9,cz-2,1.4);cv17(cx+6.9,cz-2,1.4);return{mg:[cx-1.4,cz+2.3],door:[cx+2,cz-4.6],x:cx,z:cz}}
/* entrada de refugio (estilo del búnker de mando del cap. XIII, v27): alas de hormigón, dintel,
   marco de acero, puerta (abierta o entornada), cartel, farol y túmulo de tierra detrás.
   (x,z) = la puerta; la entrada mira a +z */
function dug17(x,z,o){o=o||{};const D=K17.D,CC=0x84827a;for(const s of[-1,1]){bx17(.5,2.5,2.2,CC,x+s*1.45,1.25,z+1.0);ob17(x+s*1.45,z+1.0,.25,1.1,2.5)}bx17(3.4,.5,2.4,CC,x,2.75,z+1.0);
 bx17(1.8,.16,.16,0x2a2a2a,x,2.42,z-.08);for(const s of[-1,1])bx17(.16,2.4,.16,0x2a2a2a,x+s*.86,1.2,z-.08);bx17(1.6,2.3,.05,0x0c0a08,x,1.15,z-.18);
 {const a=o.shut?0:-1.75,hx=x-.8,hz=z,ux=Math.cos(a),uz=-Math.sin(a);bx17(1.5,2.3,.12,o.wood?0x5a4630:0x3a4038,hx+ux*.75,1.15,hz+uz*.75,0,a,0,'c');bx17(.08,.5,.16,0x6a6a62,hx+ux*1.3,1.1,hz+uz*1.3,0,a,0)}
 if(o.sign){bx17(1.4,.4,.05,0xe8e0c8,x,3.25,z+2.22);bx17(1.2,.06,.06,0x1a1a1a,x,3.3,z+2.26);bx17(.8,.06,.06,0x1a1a1a,x-.1,3.17,z+2.26)}bx17(.16,.16,.16,0xffe0a0,x+1.1,3.15,z+2.3);
 /* túmulo de tierra y sacos sobre el refugio */bx17(7,1.4,5.6,0x4a4636,x,.7,z-3.2,0,0,0);bx17(5.6,.9,4.4,0x544e3c,x,1.75,z-3.2);for(const s of[-1,1])bx17(1.4,2.2,5.6,0x4a4636,x+s*3.4,.8,z-3.2,0,0,-s*.55);bx17(7,1.2,1.4,0x4a4636,x,.4,z-6.3,-.6,0,0);
 if(D>0)for(let i=0;i<5;i++)bx17(.9,.3,.5,shade(0xa49470,.9+RN17()*.2),x-2+i*1,2.35,z-1.3,0,(RN17()-.5)*.3,0,'c');cy17(.08,.08,1.2,0x3a3a36,x+1.8,2.6,z-3.5,0,0,0,6);
 ob17(x,z-3.2,3.5,2.6,2.2);return pt17(x,z+1.6)}
/* red de camuflaje sobre postes */
function camo17(x,z,w,d,y,ry){const D=K17.D,c=Math.cos(ry||0),s=Math.sin(ry||0);bx17(w,.05,d,0x4a5236,x,y,z,0,ry||0,0);for(const a of[-1,1])for(const b of[-1,1])cy17(.05,.06,y,0x4a3a28,x+a*w*.45*c+b*d*.45*s,y/2,z-a*w*.45*s+b*d*.45*c,0,0,0,5);
 if(D>0)for(let i=0;i<(D>1?14:7);i++){const u=(RN17()-.5)*w,v=(RN17()-.5)*d;bx17(.6+RN17()*.8,.04,.5+RN17()*.6,[0x5e6440,0x3a4228,0x6a6448][i%3],x+u*c+v*s,y+.04,z-u*s+v*c,0,RN17()*3,0)}
 if(D>0)for(let i=0;i<6;i++){const u=(i/5-.5)*w;bx17(.3,.7,.03,0x4a5236,x+u*c+d/2*s,y-.35,z-u*s+d/2*c,0,ry||0,0)}}
/* poste de telégrafo */
function pole17(x,z){cy17(.12,.16,7.2,0x4a3a2a,x,3.6,z,0,0,0,6);bx17(1.8,.12,.12,0x4a3a2a,x,6.6,z);if(K17.D>0)for(const s of[-.7,.7])cy17(.05,.05,.16,0xe0e0d8,x+s,6.75,z,0,0,0,5)}
/* vía: balasto, durmientes y rieles (tramos de 20 m para que cada sector cierre su malla) */
function rail17(x,z0,z1,bal){const D=K17.D,sp=D===0?2.2:D===1?1.2:.85,dz=z1<z0?-1:1;for(let z=z0;dz<0?z>z1:z<z1;z+=20*dz){const ze=dz<0?Math.max(z1,z-20):Math.min(z1,z+20),L=Math.abs(ze-z),cz=(z+ze)/2;if(bal!==false)bx17(3.4,.22,L,0x6a6660,x,.02,cz,0,0,0);for(const s of[-.72,.72])bx17(.09,.16,L,0x8a8680,x+s,.26,cz,0,0,0);for(let k=0;k<L;k+=sp)bx17(2.5,.1,.24,0x3a2a1c,x,.16,z+dz*(k+sp/2),0,0,0,'c')}}
function railD17(x0,z0,x1,z1){const dx=x1-x0,dz=z1-z0,L=Math.hypot(dx,dz),ry=Math.atan2(dx,dz);for(const s of[-.72,.72])bx17(.09,.16,L,0x8a8680,(x0+x1)/2+s*Math.cos(ry),.26,(z0+z1)/2-s*Math.sin(ry),0,ry,0);for(let k=0;k<L;k+=1.4)bx17(2.5,.1,.24,0x3a2a1c,x0+dx*k/L,.16,z0+dz*k/L,0,ry,0,'c')}
/* camino de tierra con huellas */
function road17(pts,w){for(let i=0;i<pts.length-1;i++){const [x0,z0]=pts[i],[x1,z1]=pts[i+1],L=Math.hypot(x1-x0,z1-z0),ry=Math.atan2(x1-x0,z1-z0),n=Math.ceil(L/24);for(let k=0;k<n;k++){const t=(k+.5)/n,x=x0+(x1-x0)*t,z=z0+(z1-z0)*t;bx17(w,.1,L/n+.6,0x6c604c,x,.0,z,0,ry,0);if(K17.D>0)for(const s of[-1,1])bx17(.5,.1,L/n+.6,0x52483a,x+s*1.1*Math.cos(ry),.012,z-s*1.1*Math.sin(ry),0,ry,0)}}}
/* tanque cilíndrico de almacenamiento con escalera, baranda y anillos */
function tank17(x,z,r,h,col){const D=K17.D,sg=D===0?12:18;cy17(r,r,h,col,x,h/2,z,0,0,0,sg);pa(Q17(x,z),gCone(r+.2,r*.25,sg),shade(col,.85),X17+x,h+r*.125,z);cy17(r+.6,r+.6,.4,0x5a5650,x,.2,z,0,0,0,sg,'c');
 if(D>0){for(let y=h/4;y<h;y+=h/4)cy17(r+.04,r+.04,.12,shade(col,.8),x,y,z,0,0,0,sg);for(let i=0;i<(D>1?16:8);i++){const a=i/(D>1?16:8)*6.283;bx17(.06,1,.06,0x3a3a36,x+Math.cos(a)*(r-.2),h+.5,z+Math.sin(a)*(r-.2))}cy17(r-.15,r-.15,.06,0x3a3a36,x,h+1,z,0,0,0,sg)}
 const lx=x-r-.25;for(const s of[-.25,.25])bx17(.07,h+1,.07,0x2a2a28,lx,(h+1)/2,z+s);for(let y=.4;y<h;y+=D>0?.5:1.2)bx17(.06,.06,.5,0x2a2a28,lx,y,z);if(D>0)for(let y=2.5;y<h;y+=1.2)cy17(.4,.4,.05,0x2a2a28,lx-.15,y,z,0,0,1.5708,6);
 cy17(.3,.3,2,0x3a3a36,x+r+.6,1,z,0,0,1.5708,6);bx17(.6,.6,.6,0x6a2a1a,x+r+1.4,.6,z);if(D>1)for(let i=0;i<5;i++)bx17(.25,h*.6,.03,shade(col,.65),x+Math.cos(i*1.3+2)*r*1.01,h*.6,z+Math.sin(i*1.3+2)*r*1.01,0,-(i*1.3+2)+1.5708,0);
 ob17(x,z,r*.92,r*.92,h);K17.tanks.push(pt17(x,z,{r,h}));for(const a of[0,1.57,3.14,4.71])cv17(x+Math.cos(a)*(r+1.4),z+Math.sin(a)*(r+1.4),1.5)}
/* torre de celosía (mástil de radio) */
function lattice17(x,z,H,w,col){for(const a of[-1,1])for(const b of[-1,1])bm17(col,x+a*w,0,z+b*w,x+a*w*.25,H,z+b*w*.25,.12);for(let y=2.5;y<H;y+=2.5){const k=1-y/H*.75,k2=1-(y+2.5)/H*.75;for(const a of[-1,1]){bm17(col,x-w*k,y,z+a*w*k,x+w*k2,Math.min(H,y+2.5),z+a*w*k2,.05);bm17(col,x+a*w*k,y,z-w*k,x+a*w*k2,Math.min(H,y+2.5),z+w*k2,.05)}}}
/* casco simple (botes amarrados, buques lejanos) */
function hull17(x,y,z,L,B,Hh,col,o){o=o||{};const ry=o.ry||0,c=Math.cos(ry),s=Math.sin(ry),P=(u,v)=>[x+u*s+v*c,z+u*c-v*s];const pb=(w,h,d,cl,u,yy,v,rx)=>{const p=P(u,v);bx17(w,h,d,cl,p[0],yy,p[1],rx||0,ry,0,o.m)};
 pb(B,Hh,L*.72,col,0,y+Hh/2,0);for(const sd of[-1,1]){const p=P(sd*L*.36+sd*L*.06,0);bx17(B*.7,Hh,L*.14,col,p[0],y+Hh/2,p[1],0,ry+(sd>0?0:0),0,o.m)}{const p=P(L*.47,0);bx17(B*.36,Hh,L*.08,col,p[0],y+Hh/2,p[1],0,ry,0,o.m)}
 pb(B*1.02,.18,L*.75,o.deck||shade(col,.7),0,y+Hh,0);if(o.sup)pb(B*.6,o.sup,L*.2,o.supC||shade(col,1.2),-L*.05,y+Hh+o.sup/2,0);for(const f of o.fun||[]){const p=P(f,0);cy17(B*.12,B*.12,o.fh||3,o.funC||0x2a2622,p[0],y+Hh+(o.sup||0)+(o.fh||3)/2-.3,p[1],0,0,0,8,o.m)}for(const mm of o.mast||[]){const p=P(mm,0);cy17(.12,.18,o.mh||10,0x2a2622,p[0],y+Hh+(o.mh||10)/2,p[1],0,0,0,6,o.m)}}
/* =====================================================================
   CONSTRUCCIÓN
   ===================================================================== */
function buildKarsk17(){if(W17.built)return;W17.built=true;const X=X17,D=(G.detail===undefined?1:+G.detail);
 K17={D,obs:0,cover:[],tanks:[],
  post:pt17(35,22,{yaw:Math.PI}),gate:pt17(30,0),barracks:pt17(35,24),mess:pt17(64,30),radio:pt17(80,14),mast:pt17(87,11),obs_:pt17(55,49),lighthouse:pt17(95,40),wtower:pt17(12,50,{y:6.2}),beach:pt17(125,-30),
  ravine:[[20,-20],[16,-45],[20,-72],[8,-100],[-6,-122],[-12,-142],[-22,-168],[-40,-200]].map(p=>pt17(p[0],p[1])),squad:pt17(-25,-140),cart:pt17(13,-86),
  line:[pt17(-80,-250),pt17(0,-255),pt17(70,-250)],lineZ:-243,mg:[],at:[],dugouts:[],phone:pt17(6,-252),
  depot:pt17(-30,-480),tower:pt17(-60,-470,{y:8.3}),station:pt17(-34,-482),shed:pt17(-8,-530),coal:pt17(10,-486),
  drovna:pt17(-20,-650),boiler:pt17(8,-688),pump:pt17(22,-604),works:[pt17(-46,-590),pt17(-46,-630)],
  port:pt17(170,-660),piers:[pt17(178,-615),pt17(175,-660),pt17(180,-700)],cranes:[pt17(182,-615),pt17(192,-700)],warehouses:[pt17(137,-628),pt17(137,-690)],
  bridge:pt17(-20,-780,{z0:-755,z1:-805,w:12}),gorge:{z0:-760,z1:-800},heights:pt17(-120,-730,{y:4}),
  north:pt17(-20,-845,{bunkers:[pt17(-40,-822),pt17(2,-822)],pits:[pt17(-80,-858),pt17(45,-858)],trenchZ:-842}),end:pt17(-20,-920),
  road:[[30,14],[30,-6],[40,-30],[40,-300],[44,-540],[36,-600],[22,-680],[2,-733],[-16,-752]].map(p=>pt17(p[0],p[1])),rail:{x:-20,z0:80,z1:-960},
  bounds:{x0:-220,x1:260,z0:100,z1:-980},
  routes:{}};
 sky17();
 /* --------------------------- TERRENO --------------------------- */
 {const g=new T.PlaneGeometry(1400,1600,140,160);g.rotateX(-Math.PI/2);g.translate(0,0,-500);const p=g.attributes.position,col=new Float32Array(p.count*3),c=new T.Color(),c2=new T.Color();
  for(let i=0;i<p.count;i++){const x=p.getX(i),z=p.getZ(i),y=hT17(x,z);p.setY(i,y);const n=Math.sin(x*.05+z*.031)+Math.sin(x*.013-z*.021)*.8+Math.sin(x*.21+z*.17)*.25;
   c.setHex(n>.5?0x857a56:n>-.4?0x7a7250:0x6c6848);
   if(n<-1.1)c.lerp(c2.setHex(0xa8aaa0),.45);
   if(x>0&&x<110&&z<62&&z>-2)c.setHex(0x77705f);
   if(z<-232&&z>-266&&x>-130&&x<110)c.lerp(c2.setHex(0x5a5040),.6);
   if(z<-425&&z>-725&&x>-65&&x<130)c.lerp(c2.setHex(0x4e4a44),.7);
   if(z<-808&&z>-890)c.lerp(c2.setHex(0x625c46),.5);
   if(beach17(z)&&x>106)c.setHex(0x8c8a84).lerp(c2.setHex(0x6a6a66),R()*.4);
   if(y<-1.5)c.lerp(c2.setHex(y<-6?0x3a4244:0x5a5a56),.8);
   if(y>3){const b=Math.floor(y/5)%2;c.lerp(c2.setHex(b?0x8a6a50:0x9a8060),Math.min(1,y/12)*.75);if(y>30)c.lerp(c2.setHex(0x7a7050),.5)}
   c.multiplyScalar(.92+R()*.14);col.set([c.r,c.g,c.b],i*3)}
  g.setAttribute('color',new T.BufferAttribute(col,3));
  /* abre el hueco de la garganta */{const ix=g.index.array,keep=[];for(let k=0;k<ix.length;k+=3){const zc=(p.getZ(ix[k])+p.getZ(ix[k+1])+p.getZ(ix[k+2]))/3;if(zc<-760.5&&zc>-799.5)continue;keep.push(ix[k],ix[k+1],ix[k+2])}g.setIndex(keep)}
  g.computeVertexNormals();const t=groundTex30();t.repeat.set(140,160);const m=new T.Mesh(g,new T.MeshLambertMaterial({vertexColors:true,map:t}));m.position.set(X,0,0);m.matrixAutoUpdate=false;m.updateMatrix();scene.add(m);W17.ms.push(m)}
 /* --------------------------- GARGANTA DE ORLOV --------------------------- */
 const GD=x=>x<100?30:30-20*sm17((x-100)/60);
 {const NX=141,NZ=21,pos=[],col=[],idx=[],c=new T.Color(),c2=new T.Color();for(let j=0;j<NZ;j++)for(let i=0;i<NX;i++){const x=-700+i*10,z=-760-j*2,tz=(z+780)/20,e=hT17(x,tz<0?-800:-760),q=1-Math.pow(Math.abs(tz),5),dep=-GD(x),y=(j===0||j===NZ-1)?hT17(x,z):Math.min(e,e+(dep-e)*q+(q>.05&&q<.95?2.2*Math.sin(x*.37+j*1.7)+1.4*Math.sin(x*.11-j):0));pos.push(x,y,z);const b=Math.floor((y+40)/3.2)%3;c.setHex([0x6a5e50,0x5a5048,0x7a6a58][b]);if(y<dep+5)c.lerp(c2.setHex(0x2e3430),.6);c.multiplyScalar(.9+R()*.2);col.push(c.r,c.g,c.b)}
  for(let j=0;j<NZ-1;j++)for(let i=0;i<NX-1;i++){const a=j*NX+i,b=a+1,cc=a+NX,d=cc+1;idx.push(a,cc,b,b,cc,d)}
  const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.setAttribute('color',new T.Float32BufferAttribute(col,3));g.setIndex(idx);g.computeVertexNormals();const t=groundTex30();t.repeat.set(140,6);g.setAttribute('uv',new T.Float32BufferAttribute(new Float32Array(NX*NZ*2).map((v,k)=>k%2?Math.floor(k/2/NX)/(NZ-1):(Math.floor(k/2)%NX)/(NX-1)),2));
  const m=new T.Mesh(g,new T.MeshLambertMaterial({vertexColors:true,map:t,side:T.DoubleSide}));m.position.x=X;scene.add(m);W17.ms.push(m);
  /* río al fondo */const rg=new T.PlaneGeometry(1400,14,70,1);rg.rotateX(-Math.PI/2);const rp=rg.attributes.position;for(let i=0;i<rp.count;i++)rp.setY(i,-GD(rp.getX(i))+2.4);rg.translate(0,0,-780);rg.computeVertexNormals();const rt=tex17('w');rt.repeat.set(60,1);const rm=new T.Mesh(rg,new T.MeshLambertMaterial({color:0x5a6a6e,map:rt,emissive:0x0a1012}));rm.position.x=X;scene.add(rm);W17.river=rm;W17.ms.push(rm)}
 /* --------------------------- MAR --------------------------- */
 {const g=new T.PlaneGeometry(1000,1900,D>0?70:40,D>0?130:76);g.rotateX(-Math.PI/2);g.translate(560,0,-450);const p=g.attributes.position,ix=g.index.array,keep=[];const land=(x,z)=>{if(z<-758&&z>-802)return x<coast17(z)-6;return hT17(x,z)>-.45};
  for(let k=0;k<ix.length;k+=3){if(land(p.getX(ix[k]),p.getZ(ix[k]))&&land(p.getX(ix[k+1]),p.getZ(ix[k+1]))&&land(p.getX(ix[k+2]),p.getZ(ix[k+2])))continue;keep.push(ix[k],ix[k+1],ix[k+2])}g.setIndex(keep);
  const t=tex17('w');t.repeat.set(90,170);const mat=new T.MeshLambertMaterial({color:0x4a5a62,map:t,emissive:0x0c1418});
  mat.onBeforeCompile=sh=>{sh.uniforms.uT17=W17.u;sh.vertexShader='uniform float uT17;\n'+sh.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nfloat a17=clamp((position.x-115.)/90.,.12,1.);transformed.y+=a17*(.32*sin(position.x*.05+position.z*.021+uT17*1.1)+.18*sin(position.z*.09-position.x*.031-uT17*1.45)+.07*sin((position.x+position.z)*.23+uT17*2.4));')};
  const m=new T.Mesh(g,mat);m.position.set(X,-.75,0);scene.add(m);W17.sea=m;W17.ms.push(m);
  /* espuma en la playa y al pie del acantilado */const fq=PB();for(let z=8;z>-72;z-=4){const x=coast17(z)+2;pBox(fq,3+R()*2,.02,4.2,0xe8ecec,X+x,-.62,z,0,(R()-.5)*.2,0)}if(D>0)for(let z=100;z>-980;z-=9){if(beach17(z)||(z<-596&&z>-724))continue;const x=coast17(z)+3;pBox(fq,2,.02,8,0xd8e0e2,X+x,-.66,z,0,(R()-.5)*.3,0)}
  const fm=new T.Mesh(pbGeo(fq),new T.MeshBasicMaterial({vertexColors:true,transparent:true,opacity:.5,depthWrite:false}));scene.add(fm);W17.foam=fm;W17.ms.push(fm)}
 /* colisión del mar (fuera de playa y puerto) y del acantilado */
 for(let z=100;z>-980;z-=20){const z1=z-20,zc=z-10;if(z1>-72&&z<=12+20&&zc<12)continue;if(zc<-596&&zc>-724)continue;if(zc<-758&&zc>-802)continue;let cx=1e9;for(let k=0;k<=20;k+=4)cx=Math.min(cx,coast17(z-k));ob17(cx+31,zc,30,10.2,8)}
 ob17(185,-30,30,42,8);ob17(126,22,22,10,8);/* frente de la playa (el agua honda) y el escalón del cabo */
 /* --------------------------- ROCAS DE ACANTILADO --------------------------- */
 for(let z=96;z>-975;z-=D>0?7:12){if(beach17(z)||(z<-596&&z>-724))continue;const cx=coast17(z);rk17(cx+1.5+RN17()*3,-3+RN17()*2,z+RN17()*4,3+RN17()*3,4+RN17()*3,3+RN17()*3,[0x5a5852,0x4e4c48,0x66625a][z&3?0:1],0)}
 for(let z=8;z>-70;z-=6)rk17(coast17(z)+6+RN17()*8,-1.2,z,1+RN17(),.6,1+RN17(),0x5a5852,0);
 /* ================== I · PUESTO DE KARSK ================== */
 SEC17='post';
 house17({x:35,z:24,w:20,d:9,h:3.4,mat:'r',wall:0x6a5842,roof:0x3a3e3a,trim:0xc8bea8,int:1,doors:[['n',0,1.6],['s',-6,1.3]],ch:[[6,1.2]],shut:0x3e5040,lit:.4,cv:false});
 {/* interior de la barraca: literas, estufa, mesa, armero, taquillas, faroles */const zz=24;for(let i=0;i<5;i++){const x=35-7.5+i*3.6;if(Math.abs(x-29)<1.5)continue;for(const s of[-.45,.45])for(const t of[-1,1])bx17(.08,1.9,.08,0x4a3a28,x+t*.95,.95,zz+3.4+s,0,0,0,'c');for(const y of[.45,1.4]){bx17(2,.1,1,0x4a3a28,x,y,zz+3.4,0,0,0,'c');bx17(1.85,.12,.85,0x6a6a5a,x,y+.1,zz+3.4);if(D>0)bx17(1,.1,.86,0x5a4a3a,x+.3,y+.18,zz+3.4)}ob17(x,zz+3.4,1,.55,1.9)}
  cy17(.35,.4,.9,0x2a2a2a,41,.45,zz+1.2,0,0,0,10);cy17(.07,.07,3,0x2a2a2a,41,2.4,zz+1.2,0,0,0,6);ob17(41,zz+1.2,.45,.45,1);bx17(.6,.1,.6,0x6a2a1a,41,.95,zz+1.2);
  bx17(2.6,.08,1,0x5a4632,30,.78,zz-1.6,0,0,0,'c');for(const s of[-1,1])for(const t of[-1,1])bx17(.07,.78,.07,0x3a2a1a,30+s*1.2,.39,zz-1.6+t*.4);for(const s of[-1,1])bx17(2.6,.06,.3,0x4a3a28,30,.45,zz-1.6+s*.85,0,0,0,'c');ob17(30,zz-1.6,1.3,.5,.8);bx17(.16,.22,.16,0xd8b060,30.6,.93,zz-1.6);
  bx17(3,.1,.3,0x4a3a28,40,1.3,zz-4.1);for(let i=0;i<5;i++)bx17(.06,1.1,.08,0x2a1e14,38.8+i*.6,.9,zz-4,.12,0,0);
  for(let i=0;i<4;i++)bx17(.55,1.9,.5,0x4a5040,25.6,.95,zz-2.6+i*.6,0,0,0,'c');ob17(25.6,zz-1.7,.3,1.3,1.9);
  for(const x of[30,40]){bx17(.03,.5,.03,0x222222,x,3.1,zz);bx17(.22,.3,.22,0xe8c880,x,2.75,zz)}bx17(1.2,.9,.06,0x8a7a5a,35,2,zz+4.3);bx17(.8,.6,.04,0xd8d0b8,35,2,zz+4.27)}
 house17({x:64,z:30,w:12,d:7,h:3.2,mat:'r',wall:0x5e5040,roof:0x3e3a36,int:1,doors:[['n',-3,1.5],['w',0,1.4]],ch:[[3.5,1.6]],lit:.5,cv:false});
 {/* comedor: mesa larga, bancos, cocina de café, radio */bx17(7,.08,1.1,0x6a5032,63,.8,30,0,0,0,'c');for(const s of[-1,1]){bx17(7,.06,.32,0x4a3a28,63,.46,30+s*.9,0,0,0,'c');for(const t of[-3,3])bx17(.08,.8,.08,0x3a2a1a,63+t,.4,30+s*.4)}ob17(63,30,3.5,.9,.8);
  bx17(1.2,.9,.8,0x2a2826,68.6,.45,31.8);cy17(.25,.25,.2,0x8a8a80,68.4,1,31.8,0,0,0,8);cy17(.18,.22,.5,0x8a6a3a,68.9,1.15,31.8,0,0,0,8);cy17(.07,.07,2.3,0x2a2a2a,69.1,2.1,32.2,0,0,0,6);ob17(68.6,31.8,.7,.5,1);
  bx17(2,.08,.5,0x4a3a28,59.2,1.3,33,0,0,0,'c');bx17(.8,.5,.4,0x3a3226,59.2,1.6,33);for(let i=0;i<3;i++)cy17(.05,.05,.04,0xd8c070,58.95+i*.2,1.65,32.79,1.5708,0,0,6);bx17(.03,1.4,.03,0x222222,59.6,2.5,33.1);bx17(1,.6,.5,0x6a6050,59,.3,33.2)}
 house17({x:80,z:14,w:5,d:4,h:2.8,mat:'r',wall:0x5a5a4e,roof:0x2e2e2e,doors:[['w',0,1.1]],faces:'nsw',flat:1});
 lattice17(87,11,20,1.2,0x3a3a36);bx17(1.6,.08,1.6,0x3a3a36,87,20,11);for(const [ax,az] of[[95,18],[80,2],[95,2]]){bm17(0x8a8a86,87,19,11,ax,0,az,.03);bx17(.5,.3,.5,0x6a6a62,ax,.15,az);ob17(ax,az,.3,.3,.4)}bm17(0x2a2a2a,87,18.5,11,80,3.1,14,.02);ob17(87,11,1.3,1.3,3);
 /* observatorio meteorológico: torreón con cúpula, garita Stevenson, anemómetro */
 house17({x:55,z:49,w:6,d:6,h:3.2,wall:0x8a6a52,roof:0x3a3a3a,flat:1,doors:[['n',0,1.1]],faces:'nwe',mat:'c'});cy17(1.7,1.7,1.6,0xc8c0b0,55,4.5,49,0,0,0,14,'c');pa(Q17(55,49),gSph(1.75,12,6,0,1.5708),0x6a7a80,X+55,5.3,49);bx17(.4,1.6,.1,0x2a2a2a,55,5.6,47.3,-.3,0,0);
 {for(const s of[-1,1])for(const t of[-1,1])bx17(.06,1.2,.06,0xe8e8e0,61+s*.4,.6,53+t*.3);bx17(1,.8,.75,0xf0f0e8,61,1.5,53,0,0,0,'c');bx17(1.15,.06,.9,0xe0e0d8,61,1.95,53);cy17(.05,.06,6,0x3a3a36,50,3,53,0,0,0,6);ob17(61,53,.5,.4,1.9);
  const an=new T.Group();an.position.set(X+50,6,53);const aq=PB();for(let i=0;i<3;i++){const a=i*2.094;pBox(aq,.5,.03,.03,0x2a2a2a,Math.cos(a)*.25,0,Math.sin(a)*.25,0,-a,0);pa(aq,gSph(.08,6,4,0,1.5708),0x2a2a2a,Math.cos(a)*.5,0,Math.sin(a)*.5,1.5708,0,0)}pbMesh(aq,an,VCM);scene.add(an);W17.anemo=an}
 /* faro sobre el acantilado y casa del farero */
 {const lx=95,lz=40;for(let i=0;i<7;i++)rk17(lx+(RN17()-.3)*10,-.5,lz+(RN17()-.5)*12,2+RN17()*2,1.2+RN17(),2+RN17()*2,0x5e5a52,0);const H=15;for(let k=0;k<5;k++){const y0=k*H/5,r0=2.3-k*.13;cy17(r0,r0-.13,H/5,k%2?0xa83a2a:0xe8e4da,lx,y0+H/10,lz,0,0,0,D>0?16:10,'c')}
  cy17(2.6,2.6,.3,0x2a2a2a,lx,H+.15,lz,0,0,0,16);if(D>0)for(let i=0;i<14;i++){const a=i/14*6.283;bx17(.05,.9,.05,0x2a2a2a,lx+Math.cos(a)*2.5,H+.75,lz+Math.sin(a)*2.5)}cy17(2.5,2.5,.05,0x2a2a2a,lx,H+1.2,lz,0,0,0,16);
  cy17(1.3,1.3,2.1,0xd8c890,lx,H+1.35,lz,0,0,0,12);for(let i=0;i<6;i++){const a=i/6*6.283;bx17(.08,2.1,.08,0x2a2a2a,lx+Math.cos(a)*1.32,H+1.35,lz+Math.sin(a)*1.32)}pa(Q17(lx,lz),gCone(1.5,1.3,12),0xa83a2a,X+lx,H+3.05,lz);cy17(.06,.06,1,0x2a2a2a,lx,H+4.1,lz,0,0,0,5);
  for(let y=3;y<H;y+=3.5)bx17(.5,.8,.1,0x1e2226,lx-1.95+.02*y,y,lz,0,1.5708,0);bx17(1.1,2.1,.2,0x3a2a20,lx-2.2,1.05,lz,0,1.5708,0);ob17(lx,lz,2.2,2.2,H+3);
  house17({x:87,z:47,w:7,d:5,h:2.9,mat:'r',wall:0xd8d0c0,roof:0x8a3a2a,trim:0x6a6a62,doors:[['w',0,1]],ch:[[2,0]],faces:'nws',shut:0x3a5a7a});
  const bg=new T.Group();bg.position.set(X+lx,H+1.4,lz);const bmat=new T.MeshBasicMaterial({color:0xfff0c0,transparent:true,opacity:.045,depthWrite:false,blending:T.AdditiveBlending,side:T.DoubleSide});const cg=new T.ConeGeometry(4,70,10,1,true);cg.translate(0,-35,0);cg.rotateZ(Math.PI/2);for(const s of[0,Math.PI]){const b=new T.Mesh(cg,bmat);b.rotation.y=s;bg.add(b)}scene.add(bg);W17.beam=bg}
 /* torre de vigilancia con patas */
 {const tx=12,tz=50,H=6;for(const a of[-1,1])for(const b of[-1,1]){bm17(0x4a3a28,tx+a*1.8,0,tz+b*1.8,tx+a*1.3,H,tz+b*1.3,.22);ob17(tx+a*1.7,tz+b*1.7,.2,.2,H)}for(const y of[1.8,4])for(const a of[-1,1]){const k=1.8-y/H*.5;bm17(0x4a3a28,tx-k,y-1.4,tz+a*k,tx+k,y+.4,tz+a*k,.1);bm17(0x4a3a28,tx+a*k,y-1.4,tz-k,tx+a*k,y+.4,tz+k,.1)}
  bx17(3.2,.2,3.2,0x5a4632,tx,H,tz,0,0,0,'c');for(const s of[-1,1]){bx17(3.2,1,.08,0x5a4632,tx,H+.6,tz+s*1.56,0,0,0,'c');bx17(.08,1,3.2,0x5a4632,tx+s*1.56,H+.6,tz,0,0,0,'c')}for(const a of[-1,1])for(const b of[-1,1])bx17(.1,2.2,.1,0x3a2a1a,tx+a*1.5,H+1.2,tz+b*1.5);bx17(3.8,.14,3.8,0x3a3a36,tx,H+2.35,tz,.08,0,0);
  for(const s of[-.25,.25])bm17(0x3a2a1a,tx+s,0,tz-3.2,tx+s,H,tz-1.6,.07);for(let k=.5;k<H;k+=.5)bx17(.6,.05,.05,0x3a2a1a,tx,k,tz-3.2+k/H*1.6);cv17(tx+2.6,tz,1.2)}
 /* alambrado perimetral con portón al norte (30,0) y brecha al oeste */
 {const F=(x0,z0,x1,z1)=>{const L=Math.hypot(x1-x0,z1-z0),n=Math.ceil(L/3);for(let i=0;i<=n;i++){const t=i/n;bx17(.12,1.6,.12,0x4a3a28,x0+(x1-x0)*t,.8,z0+(z1-z0)*t)}for(const y of D>0?[.5,1,1.45]:[1])bx17(Math.abs(x1-x0)+.03,.025,Math.abs(z1-z0)+.03,0x6a645a,(x0+x1)/2,y,(z0+z1)/2);ob17((x0+x1)/2,(z0+z1)/2,Math.abs(x1-x0)/2+.1,Math.abs(z1-z0)/2+.1,1.6)};
  F(0,0,26.5,0);F(33.5,0,103,0);F(0,0,0,26);F(0,33,0,62);F(0,62,103,62);
  for(const s of[-1,1]){bx17(.35,2.6,.35,0x3a2a1a,30+s*3.4,1.3,0);ob17(30+s*3.4,0,.25,.25,2.6)}bx17(7.2,.25,.2,0x3a2a1a,30,2.5,0);bx17(1.9,.5,.06,0xd8d0b8,30,2.05,-.12);bm17(0x4a3a28,26.6,.3,0,24.6,1.4,-2.4,.08);bm17(0x4a3a28,33.4,.3,0,35.6,1.4,-2.2,.08);
  sb17(78,-2,96,-2,1.1);sb17(97,-2,100,6,1.1);ring17(104,5,2.2,1.1,3.14,.7);sb17(36,-3,44,-3,.9);sb17(14,-3,22,-3,.9);for(const p of[[87,-3],[40,-4],[18,-4],[100,1]])cv17(p[0],p[1],1.5);
  for(let i=0;i<6;i++)bx17(.8,.5,.5,0x5a5a36,48+(i%3)*.85,.25+(i>3?.5:0),12,0,0,0,'c');ob17(49,12,1.4,.4,1);cv17(49,10.6,1.2);
  /* letrinas, leña, bebedero y carro de agua */house17({x:8,z:8,w:3,d:2.2,h:2.3,wall:0x5a4a38,roof:0x2a2a2a,doors:[['n',0,.8]],faces:'n',cv:false});for(let i=0;i<9;i++)cy17(.15,.15,1.4,0x6a4a2a,88+(i%3)*.32,.15+Math.floor(i/3)*.3,24,1.5708,0,0,6);ob17(88.3,24,.8,.8,1);
  }
 SEC17=null;
 /* ================== II · BARRANCO SOKOL ================== */
 {const RV=K17.ravine,pk=K17.squad;let acc=0;const rocks=[];SEC17='rav';
  for(let i=0;i<RV.length-1;i++){const [x0,z0]=RV[i],[x1,z1]=RV[i+1],L=Math.hypot(x1-x0,z1-z0),tx=(x1-x0)/L,tz=(z1-z0)/L,nx=-tz,nz=tx;
   for(let t=0;t<L;t+=5.5){const x=x0+tx*t,z=z0+tz*t,hw=8+2*Math.sin((acc+t)*.07);
    for(const s of[-1,1]){const px=x+nx*s*(hw+3.3),pz=z+nz*s*(hw+3.3);if(Math.hypot(px-pk.x,pz-pk.z)<9||Math.abs(px+20)<5.5)continue;const r=4+RN17()*2.2,H=8+RN17()*7;rk17(px,H*.3,pz,r,H*.75,r*1.1,[0x6a6258,0x5e5850,0x746a5c][RN17()*3|0],D>0?1:0);ob17(px,pz,3.2,3.2,H*.9);rocks.push([px,pz]);
     if(RN17()<.8){const qx=x+nx*s*(hw+11),qz=z+nz*s*(hw+11);if(Math.abs(qx+20)>7)rk17(qx,H*.2,qz,r*1.5,H*.6,r*1.4,0x6a6052,0)}}}acc+=L}
  /* bolsillo de roca de la escuadra aislada */for(let a=.4;a<5.9;a+=.55){if(a<.8||a>5.5)continue;const px=pk.x-4+Math.cos(a)*8,pz=pk.z+Math.sin(a)*8;if(Math.abs(px+20)<4.5)continue;rk17(px,3.5,pz,3.4,8+RN17()*3,3.2,0x625a50,1);ob17(px,pz,2.6,2.6,9)}for(let i=0;i<3;i++){rk17(pk.x+(i-1)*2.4,.4,pk.z+2.5,1,.8,.9,0x6a645a,0);ob17(pk.x+(i-1)*2.4,pk.z+2.5,.8,.7,.9)}cv17(pk.x,pk.z+1.2,1.6);cv17(pk.x+2.5,pk.z-2,1.4);
  /* lecho seco, piedras, matorral, rocas sueltas */for(let i=0;i<RV.length-1;i++){const [x0,z0]=RV[i],[x1,z1]=RV[i+1],L=Math.hypot(x1-x0,z1-z0),ry=Math.atan2(x1-x0,z1-z0);for(let t=0;t<L;t+=6){const k=t/L,o=1.8*Math.sin((i*40+t)*.13),x=x0+(x1-x0)*k+Math.cos(ry)*o,z=z0+(z1-z0)*k-Math.sin(ry)*o;bx17(2.4,.05,6.5,0x6e6a62,x,.02,z,0,ry+(RN17()-.5)*.3,0);if(D>0)for(let j=0;j<3;j++)rk17(x+(RN17()-.5)*2,.05,z+(RN17()-.5)*5,.15+RN17()*.2,.1,.15+RN17()*.2,0x9a968c,0)}}
  for(let i=0;i<14;i++){const p=RV[1+(i%6)],q=RV[2+(i%6)],k=RN17(),x=p[0]+(q[0]-p[0])*k+(RN17()-.5)*9,z=p[1]+(q[1]-p[1])*k;const r=.8+RN17()*.9;rk17(x,r*.3,z,r,r*.8,r,0x6e665a,0);ob17(x,z,r*.7,r*.7,r*1.1);cv17(x,z,r+.6)}
  for(let i=0;i<(D>0?40:16);i++){const s=RN17()*(RV.length-1.01),j=Math.floor(s),k=s-j,x=RV[j][0]+(RV[j+1][0]-RV[j][0])*k+(RN17()-.5)*14,z=RV[j][1]+(RV[j+1][1]-RV[j][1])*k;pa(Q17(x,z),gCone(.6+RN17()*.5,.7+RN17()*.4,5),[0x4a4a2a,0x5a5030,0x3e4228][i%3],X+x,.35,z)}
  /* carro destrozado */{const cx=13,cz=-86;bx17(1.6,.12,3.2,0x4a3624,cx,.75,cz,.12,.4,.2,'c');for(const s of[-1,1])bx17(.1,.5,3.2,0x4a3624,cx+s*.8,1,cz,.12,.4,.2,'c');cy17(.65,.65,.1,0x3a2a1a,cx+.95,.6,cz+.9,0,.4,1.5708,10);cy17(.65,.65,.1,0x3a2a1a,cx+1.4,.06,cz-1.6,0,.4,0,10);bm17(0x4a3624,cx,.7,cz+1.6,cx-.6,.1,cz+3.4,.1);for(let i=0;i<3;i++)bx17(.6,.4,.5,0x6a5a3a,cx-1.2-i*.5,.2,cz-.5+i*.6,0,i,0,'c');ob17(cx,cz,1.2,1.8,1.3);cv17(cx-1.8,cz,1.4)}
  SEC17=null;K17.routes.II=[[[30,0],[20,-20],[16,-45],[20,-72],[8,-100],[-6,-122],[-25,-140]],[[30,0],[40,-40],[42,-120],[30,-170],[-10,-190],[-25,-150]]]}
 /* camino costero */road17(K17.road,6);
 /* postes de telégrafo a lo largo de la vía */{let pv=null;for(let z=76;z>-960;z-=40){if(z<-752&&z>-808)continue;pole17(-14,z);if(pv&&pv>z+30){for(const s of[-.7,.7])bx17(.04,.04,40,0x1e1e1e,-14+s,6.56,z+20)}pv=z}}
 /* ================== III · LÍNEA DE LAS TRES CRUCES (v33: posición real) ==================
    Trinchera de fuego continua y transitable (parapeto de sacos con escalón de tiro, revestimiento
    de tablas y traveses que no cortan el paso), tres casamatas de hormigón con puerta blindada
    (modelo del cap. XIII) con la ametralladora dentro, pozos antitanque con red de camuflaje,
    refugios con puerta detrás del parados, puesto de mando con teléfono, trincheras de
    comunicación hacia la retaguardia, pasos señalizados en la alambrada. Todo mira al sur (+z). */
 {SEC17='line';const L=K17.line,ZF=-240.6,ZR=-245.7,X0=-125,X1=105;K17.lineZ=-243;
  const lanes=[-112,-45,-22,30,94],cmX=L.map(c=>c.x+13),atX=L.map(c=>c.x-10),dgX=[-104,-58,-30,14,44,98];K17.lanes=lanes.map(x=>pt17(x,-243));K17.lineF=ZF;K17.lineR=ZR;
  const gapsF=lanes.map(x=>[x,4]).concat(cmX.map(x=>[x,10.8])).concat(atX.map(x=>[x,3.2])),gapsR=lanes.map(x=>[x,4]).concat(dgX.map(x=>[x,3.6]));
  const segs=(gs)=>{let s=X0;const out=[];for(const g of gs.slice().sort((p,q)=>p[0]-q[0])){const e=g[0]-g[1]/2;if(e>s)out.push([s,e]);s=Math.max(s,g[0]+g[1]/2)}if(s<X1)out.push([s,X1]);return out};
  const PC=0xa09070,PD=0x7a6a50,MUD=0x3e352a,TW=0x4a3a28;
  /* suelo de la trinchera y tablas */bx17(X1-X0,.05,4.2,MUD,(X0+X1)/2,.03,-243.1);if(D>0)for(let x=X0+1;x<X1;x+=2.2)bx17(1.9,.05,.75,0x5a4632,x,.07,-243.3,0,0,0,'c');
  /* parapeto frontal: sacos, escalón de tiro, revestimiento */for(const [a,b] of segs(gapsF)){const L_=b-a,cx=(a+b)/2;bx17(L_,1.25,1.3,PC,cx,.62,ZF,0,0,0,'c');if(D>0)for(let x=a+.45;x<b-.3;x+=.92)for(let k=0;k<(D>1?2:1);k++)bx17(.9,.3,.55,shade(PC,.88+RN17()*.24),x+(k?.46:0),1.4+k*.28,ZF+(RN17()-.5)*.25,0,(RN17()-.5)*.25,0);
   bx17(L_,.32,.5,TW,cx,.16,ZF-.9,0,0,0,'c');if(D>0){for(let x=a+.6;x<b;x+=1.8)bx17(.12,1.3,.12,TW,x,.65,ZF-.68);bx17(L_,.08,.06,0x5a4632,cx,1.1,ZF-.68)}ob17(cx,ZF,L_/2,.65,1.25)}
  /* traveses cortos (no cierran el paso) */for(let x=X0+7;x<X1-4;x+=14){if(gapsF.some(g=>Math.abs(g[0]-x)<g[1]/2+2)||dgX.some(d=>Math.abs(d-x)<2.5))continue;bx17(1.3,1.25,1.5,PC,x,.62,ZF-1.35,0,0,0,'c');ob17(x,ZF-1.35,.65,.75,1.25)}
  /* parados (pared trasera) */for(const [a,b] of segs(gapsR)){bx17(b-a,.8,1.2,PD,(a+b)/2,.4,ZR,0,0,0);if(D>0)for(let x=a+.5;x<b-.3;x+=.95)bx17(.9,.26,.5,shade(PD,.9+RN17()*.25),x,.92,ZR+(RN17()-.5)*.2,0,(RN17()-.5)*.3,0,'c');ob17((a+b)/2,ZR,(b-a)/2,.6,.8)}
  /* pasos de la alambrada: estacas blancas a cada lado (se ven desde la trinchera) */wire17(-128,108,-228.5,lanes.map(x=>[x,5]));for(const x of lanes)for(const s of[-1,1]){bx17(.12,1.3,.12,0xe8e4d8,x+s*2.6,.65,-228.5);bx17(.12,1.3,.12,0xe8e4d8,x+s*2.2,.65,ZF+1)}
  /* trincheras de comunicación hacia la retaguardia */for(const x of[-45,30]){bx17(3,.05,22,MUD,x,.03,-257.5);for(const s of[-1,1])bx17(.9,.55,22,PD,x+s*1.95,.28,-257.5,0,0,0);if(D>0)for(let z=-248;z>-268;z-=2.2)bx17(2.6,.05,.7,0x5a4632,x,.07,z,0,0,0,'c')}
  K17.mg=[];K17.at=[];K17.casemates=[];K17.slots=[];
  for(let i=0;i<3;i++){const c=L[i];/* cruz de madera */const H=8.5;bx17(.42,H,.42,0x5a4630,c.x,H/2,c.z,0,.05*i,0,'c');bx17(4.2,.4,.4,0x5a4630,c.x,6,c.z,0,.05*i,0,'c');if(D>0){bx17(.5,.5,.5,0x4a3a28,c.x,H+.1,c.z,0,.8,0);cy17(.1,.1,1.4,0x6a6a62,c.x+.4,5.4,c.z+.25,0,0,.3,5)}for(let k=0;k<8;k++)rk17(c.x+(RN17()-.5)*2.4,.2,c.z+(RN17()-.5)*2.4,.5,.35,.5,0x7a746a,0);ob17(c.x,c.z,.6,.6,H);cv17(c.x,c.z+1,1.2);
   /* casamata con la ametralladora de la cruz */const cm=casemate17(cmX[i],-237.8,{name:1});K17.casemates.push(cm);K17.mg.push(pt17(cm.mg[0],cm.mg[1],{rot:0,y:.25}));camo17(cmX[i],-237.5,12.5,9.5,4.35,0);
   /* pozo antitanque con red */const ax=atX[i];ring17(ax,-235.4,3.2,.95,0,1.05);K17.at.push(pt17(ax,-235.4,{rot:0}));for(let k=0;k<4;k++)bx17(.9,.35,.45,0x5a5a36,ax+2.4,.18+(k>>1)*.35,-238.2+(k&1)*.5,0,0,0,'c');camo17(ax,-235.6,7.5,7.5,2.3,.3);
   /* municiones junto a la cruz */for(let k=0;k<6;k++)bx17(.75,.4,.45,0x5a5a36,c.x+3+(k%3)*.8,.2+(k>2?.4:0),c.z-1.5,0,0,0,'c');ob17(c.x+3.8,c.z-1.5,1.2,.3,.8);
   /* puestos de tiro escalonados para la sección (sobre el escalón, detrás del parapeto) */const S=[];for(let x=c.x-20;x<=c.x+24;x+=3.1){if(Math.abs(x-cmX[i])<6.4||Math.abs(x-ax)<2.4||lanes.some(l=>Math.abs(l-x)<2.8))continue;let tv=false;for(let t=X0+7;t<X1-4;t+=14)if(Math.abs(t-x)<1.3)tv=true;if(tv)continue;S.push(pt17(x,ZF-1.25))}S.sort((p,q)=>Math.abs(p.x-c.x)-Math.abs(q.x-c.x));K17.slots.push(S.slice(0,11))}
  /* refugios con puerta detrás del parados; el del centro es el puesto de mando */for(const x of dgX){const p=dug17(x,-251,{sign:x===14,wood:x!==14,shut:x===-58||x===98});K17.dugouts.push(p);if(x!==14)cv17(x+2.6,-249,1.2)}
  /* teléfono de campaña junto al puesto de mando */K17.phone=pt17(9.5,-248.2);{const p=K17.phone;bx17(.4,.3,.25,0x3a3226,p.x,.95,p.z);bx17(.8,.8,.6,0x5a4a32,p.x,.4,p.z,0,0,0,'c');cy17(.06,.06,4,0x4a3a28,p.x+.8,2,p.z,0,0,0,5);cy17(.3,.3,.25,0x3a3a2a,p.x-.7,.12,p.z,1.5708,0,0,8);ob17(p.x,p.z,.45,.35,.8)}
  /* pilas de cajas y bidones en la retaguardia inmediata */for(const [x,z] of[[-50,-249],[24,-249],[60,-249],[-116,-249]]){for(let k=0;k<5;k++)bx17(.8,.45,.5,k%2?0x5a5a36:0x4a5030,x+(k%3)*.85,.23+(k>2?.45:0),z,0,(RN17()-.5)*.2,0,'c');cy17(.3,.3,.9,0x3a4a3a,x-1,.45,z+.2,0,0,0,8);ob17(x+.8,z,1.6,.4,.9)}
  /* tierra de nadie: cráteres y restos (sin colisión alta) */for(let i=0;i<10;i++){const x=-110+RN17()*210,z=-200+RN17()*26;decalAt30('crater',X+x,z,3+RN17()*3);for(let k=0;k<6;k++){const a=k/6*6.283;bx17(1,.3,.6,0x5a5040,x+Math.cos(a)*2.1,.12,z+Math.sin(a)*2.1,0,-a,0)}cv17(x,z,2)}
  SEC17=null;K17.routes.III=[[[-25,-150],[-60,-200],[-62,-243]],[[40,-170],[60,-210],[52,-243]]]}
 /* ================== IV · LLANURA DE TEREK ================== */
 {SEC17='step';/* restos: camión quemado, autoblindado, carro volcado */
  const wreck=(x,z,ry,k)=>{const K=kit17(x,z,ry);if(k===0){K.b(2.2,1.4,2,0x2a2420,0,1.2,2.3);K.b(2.3,.3,6.4,0x1e1a18,0,.55,0);K.b(2.2,.12,4,0x3a2a1e,0,.8,-1.2,.1,0,0);for(const s of[-1,1])for(const t of[2.2,-1.8])K.cy(.5,.5,.3,0x111111,s*1.1,.5,t,0,0,1.5708,8)}else if(k===1){K.b(2.4,1.6,5,0x2e322c,0,1.2,0,0,0,.15);K.cy(.7,.7,.9,0x2a2e28,0,2.3,-.5,0,0,.15,8);K.b(.12,.12,1.8,0x222222,0,2.4,-1.8,0,0,.15);for(const s of[-1,1])for(const t of[1.7,-1.7])K.cy(.55,.55,.3,0x111111,s*1.2,.45+s*.15,t,0,0,1.5708,8)}else{K.b(1.8,.5,3,0x4a3624,0,.9,0,0,0,2.6,'c');K.cy(.6,.6,.1,0x3a2a1a,1.2,.65,1,0,0,1.2,10)}K.ob(0,0,1.3,3,1.8);cv17(x+2,z,1.6);cv17(x-2,z,1.6);decalAt30('scorch',X+x,z,7)};
  wreck(18,-338,.5,0);wreck(-70,-382,-.8,1);wreck(58,-424,1.9,2);wreck(-2,-312,2.4,1);wreck(84,-360,.2,0);
  /* corral de piedra en ruinas (flanco este) */for(const [x0,z0,x1,z1] of[[60,-448,78,-448],[60,-448,60,-466],[60,-472,72,-472],[78,-448,78,-460]]){const L=Math.hypot(x1-x0,z1-z0);bx17(Math.abs(x1-x0)+.7,1.1,Math.abs(z1-z0)+.7,0x7a746a,(x0+x1)/2,.55,(z0+z1)/2,0,0,0,'c');ob17((x0+x1)/2,(z0+z1)/2,Math.abs(x1-x0)/2+.35,Math.abs(z1-z0)/2+.35,1.1);cv17((x0+x1)/2+(z0===z1?0:-1.3),(z0+z1)/2+(z0===z1?1.3:0),1.4)}
  for(let i=0;i<18;i++){const x=-110+RN17()*220,z=-305-RN17()*125;if(Math.abs(x+20)<6||Math.abs(x-40)<6)continue;decalAt30('crater',X+x,z,3+RN17()*4);for(let k=0;k<5;k++){const a=k/5*6.283;bx17(1.1,.32,.6,0x5a5040,x+Math.cos(a)*2.3,.13,z+Math.sin(a)*2.3,0,-a,0)}cv17(x,z,2.2)}
  for(let i=0;i<22;i++){const x=-140+RN17()*270,z=-300-RN17()*135,r=.6+RN17()*1.4;if(Math.abs(x+20)<5||Math.abs(x-40)<5)continue;rk17(x,r*.25,z,r,r*.7,r*1.2,[0x7a746a,0x6a645a][i&1],0);if(r>1){ob17(x,z,r*.7,r*.7,r);cv17(x,z,r+.7)}}
  SEC17=null;K17.routes.IV=[[[-6,-300],[-20,-380],[-30,-440]],[[40,-300],[44,-420],[10,-470]],[[-90,-300],[-80,-400],[-60,-450]]]}
 /* ================== V · ESTACIÓN KARSK ================== */
 {SEC17=null;rail17(-20,80,-752);rail17(-20,-808,-960);SEC17='sta';rail17(-12,-436,-548);rail17(-4,-446,-548);railD17(-20,-420,-12,-436);railD17(-12,-436,-4,-446);
  /* andén y edificio de pasajeros */bx17(4.4,.9,56,0x7a746a,-24.8,.45,-482,0,0,0,'c');bx17(4.6,.1,56.2,0x9a948a,-24.8,.92,-482);ob17(-24.8,-482,2.2,28,.45,0,1);
  house17({x:-34,z:-482,a:Math.PI/2,w:24,d:9,h:6.6,fl:2,wall:0xb8a888,roof:0x4a3a34,trim:0xe8e0d0,plinth:0x6a625a,doors:[['s',0,1.8],['s',-6,1.4],['n',0,1.6]],ch:[[-6,-1.5],[6,1.5]],shut:0x3e5a46,faces:'snew',lit:.25,ww:1.1,wh:1.6});
  {const K=kit17(-27.6,-482,0);for(let i=0;i<7;i++){K.b(.16,3.4,.16,0x2a3a30,1.2,2.6,-15+i*5);}K.b(3.6,.15,32,0x3a3e3a,.6,4.35,0,0,0,-.12,'c');bx17(2.2,.6,.08,0x1e2a24,-29.3,4,-482.0);bx17(2,.4,.06,0xe8e0c0,-29.25,4,-482)}
  /* depósito de agua (puesto enemigo de observación) */{const t=K17.tower;for(const a of[-1,1])for(const b of[-1,1]){bm17(0x3a3a36,t.x+a*2.6,0,t.z+b*2.6,t.x+a*2,8,t.z+b*2,.3);ob17(t.x+a*2.5,t.z+b*2.5,.25,.25,8)}for(const y of[3,6])for(const a of[-1,1]){bm17(0x3a3a36,t.x-2.4,y-2,t.z+a*2.4,t.x+2.4,y,t.z+a*2.4,.08);bm17(0x3a3a36,t.x+a*2.4,y-2,t.z-2.4,t.x+a*2.4,y,t.z+2.4,.08)}
   bx17(6,.25,6,0x4a3a2a,t.x,8,t.z,0,0,0,'c');cy17(3,3,4.2,0x5a4a3a,t.x,10.2,t.z,0,0,0,14,'c');for(let k=0;k<4;k++)cy17(3.05,3.05,.12,0x2a2a2a,t.x,8.6+k,t.z,0,0,0,14);pa(Q17(t.x,t.z),gCone(3.3,1.4,14),0x3a3a3a,X+t.x,13,t.z);if(D>0)for(let i=0;i<12;i++){const a=i/12*6.283;bx17(.05,1,.05,0x2a2a2a,t.x+Math.cos(a)*2.95,8.6,t.z+Math.sin(a)*2.95)}
   bm17(0x2a2a2a,t.x+3,10,t.z,t.x+4.6,7,t.z,.25);for(const s of[-.25,.25])bx17(.06,8,.06,0x2a2a28,t.x-3.1,4,t.z+s);for(let y=.4;y<8;y+=.5)bx17(.06,.06,.5,0x2a2a28,t.x-3.1,y,t.z);bx17(.5,.5,.6,0x2a2a2a,-17,.25,-500);cy17(.18,.2,4,0x2a2a2a,-16.5,2,-500,0,0,0,8);bm17(0x2a2a2a,-16.5,3.8,-500,-18.6,3.4,-500,.15)}
  /* cocherón de locomotoras */house17({x:-8,z:-532,a:Math.PI/2,w:26,d:15,h:7.5,wall:0x7a4a38,roof:0x3a3a3a,trim:0xb8a890,doors:[['w',-4,3.6,1],['w',4,3.6,1]],dh:5.2,ch:[[8,3]],vent:1,faces:'wnse',ws:3.4,ww:1.4,wh:2.2,wy:3.2,noCan:1});
  /* carbonera elevada con grúa */{const cx=10,cz=-486;for(let i=0;i<4;i++)for(const s of[-1,1])bx17(.3,3,.3,0x3a2a1a,cx+s*2.2,1.5,cz-6+i*4);bx17(5,.3,14,0x4a3a28,cx,3.1,cz,0,0,0,'c');for(let i=0;i<6;i++)pa(Q17(cx,cz),gCone(1.6,1.4,6),0x161616,X+cx+(RN17()-.5)*2,3.9,cz-5+i*2);bx17(5,1.2,.2,0x3a2a1a,cx,3.8,cz-7,0,0,0,'c');bm17(0x2a2a2a,cx-1,3.2,cz+5,cx-4,7.5,cz+5,.25);bm17(0x2a2a2a,cx-4,7.5,cz+5,cx-4,4,cz+5,.03);bm17(0x5a4a38,cx+2.6,0,cz+12,cx+2.6,3.1,cz+7,.6);ob17(cx,cz,2.6,7,3.4);cv17(cx-3.2,cz,1.6)}
  /* vagones estáticos en el desvío este (cobertura) */for(let i=0;i<3;i++){const z=-452-i*9.5;bx17(2.7,2.6,8.4,[0x5a3a2a,0x4a4a3a,0x5a4436][i],-4,1.9,z,0,0,0,'c');bx17(2.9,.2,8.8,0x2a2a2a,-4,3.25,z,.0,0,0);bx17(2.4,.4,8,0x1a1a1a,-4,.55,z);for(const t of[-2.8,2.8])for(const s of[-.7,.7])cy17(.42,.42,.12,0x1a1a1a,-4+s,.45,z+t,0,0,1.5708,8);ob17(-4,z,1.4,4.3,3.3);cv17(-6.4,z,1.5)}
  /* caseta de señales, semáforo, faroles, cajas */house17({x:-31,z:-452,w:4,d:3,h:2.6,wall:0x8a7a62,roof:0x3a3a34,doors:[['e',0,.9]],faces:'nes',ch:[[1,0]]});cy17(.1,.12,7,0x2a2a2a,-17,3.5,-418,0,0,0,6);bx17(.12,1.4,.25,0xa83a2a,-16.7,6.4,-418,0,0,-.6);bx17(.3,.3,.15,0x2a2a2a,-17,5.6,-418);
  for(const z of[-462,-476,-490,-504]){cy17(.06,.08,3.5,0x2a2a2a,-23.2,2.65,z,0,0,0,6);bx17(.3,.4,.3,0xd8c890,-23.2,4.45,z)}for(let i=0;i<5;i++)bx17(1,.7,.8,0x6a5a3a,-26+i%2,1.25+(i>2?.7:0),-458-i*.9,0,0,0,'c');
  SEC17=null;K17.routes.V=[[[-20,-420],[-24,-460],[-34,-470]],[[10,-440],[10,-470],[-8,-500]],[[-90,-440],[-75,-470],[-60,-470]]]}
 /* ================== V · COMPLEJO DROVNA ================== */
 {SEC17='dro';rail17(-12,-580,-706);railD17(-20,-566,-12,-580);railD17(-12,-706,-20,-718);
  const TK=[[72,-585,9,11],[98,-585,9,11],[72,-614,9,11],[98,-614,9,11],[116,-640,5.5,8],[72,-645,6,8],[94,-647,6,8]];for(const t of TK)tank17(t[0],t[1],t[2],t[3],[0x9a9890,0x8a8a84,0xa8a49a][(t[0]+t[1])&1?0:2]);
  /* terraplén del parque de tanques */for(const [x,z,w,d] of[[90,-570,70,1.4],[57,-596,1.4,28],[57,-638,1.4,30],[88,-662,62,1.4]]){bx17(w,.9,d,0x6a6050,x,.45,z);ob17(x,z,w/2,d/2,.9)}
  /* bastidores de tuberías: tanques → bombas → cargadero */{const rack=(x0,z0,x1,z1,y)=>{const L=Math.hypot(x1-x0,z1-z0),n=Math.ceil(L/8),ax=Math.abs(x1-x0)>Math.abs(z1-z0);for(let i=0;i<=n;i++){const x=x0+(x1-x0)*i/n,z=z0+(z1-z0)*i/n;if(Math.abs(x-36)<4.5&&Math.abs(z+600)<3)continue;for(const s of[-1,1]){const px=x+(ax?0:s*1),pz=z+(ax?s*1:0);bx17(.22,y,.22,0x3a3a36,px,y/2,pz)}ob17(x,z,ax?.15:1.15,ax?1.15:.15,2);bx17(ax?.22:2.4,.22,ax?2.4:.22,0x3a3a36,x,y,z)}for(const [o,r] of[[-.7,.22],[0,.3],[.7,.18]])cy17(r,r,L,[0x5a5a56,0x6a4a3a,0x4a5a5a][Math.round(o+1)],(x0+x1)/2+(ax?0:o),y+.25+r,(z0+z1)/2+(ax?o:0),ax?0:1.5708,0,ax?1.5708:0,6)};
   rack(54,-600,-8,-600,4.6);rack(54,-576,54,-656,3.2);rack(-8,-600,-8,-640,4.6)}
  /* cargadero de cisternas en el desvío */for(let i=0;i<4;i++){const z=-608-i*10;bx17(.3,4.8,.3,0x3a3a36,-8.6,2.4,z);bm17(0x3a3a36,-8.6,4.4,z,-11.6,3.6,z,.14);bm17(0x2a2a2a,-11.6,3.6,z,-12,3.2,z,.1)}bx17(1,.15,34,0x3a3a36,-8.6,3,-623);
  for(let i=0;i<3;i++){const z=-614-i*11;cy17(1.3,1.3,8,0x2a2a2a,-12,2.2,z,1.5708,0,0,12);bx17(2.4,.3,9.4,0x1e1e1e,-12,.75,z);bx17(.7,.4,.7,0x2a2a2a,-12,3.6,z);for(const t of[-3.4,3.4])for(const s of[-.7,.7])cy17(.42,.42,.12,0x1a1a1a,-12+s,.45,z+t,0,0,1.5708,8);ob17(-12,z,1.4,4.7,3.5);cv17(-14.6,z,1.4)}
  /* casa de bombas, calderas con chimeneas, talleres de ladrillo, estación Drovna, oficina */
  house17({x:22,z:-604,w:9,d:6,h:4.2,wall:0x8a4a38,roof:0x3a3a3a,trim:0xc0b098,doors:[['s',-2,1.6],['n',2,1.4]],faces:'nsew',ch:[[3,0]]});
  house17({x:8,z:-688,w:18,d:12,h:8,wall:0x7a4434,roof:0x2e2e2e,trim:0xb8a890,doors:[['s',-4,2.6],['e',0,2]],faces:'swe',ws:3,ww:1.3,wh:2.6,wy:4,vent:1});for(const x of[-.5,6]){cy17(1.1,1.5,26,0x7a4434,x,13,-697,0,0,0,10,'c');cy17(1.25,1.25,.6,0x3a2a22,x,25.7,-697,0,0,0,10);if(D>0)for(let y=6;y<24;y+=6)cy17(1.48-y*.015,1.48-y*.015,.3,0x3a2a22,x,y,-697,0,0,0,10);W17.smk.push([X+x,26.5,-697,1]);ob17(x,-697,1.5,1.5,26)}
  for(const z of[-590,-630])house17({x:-46,z,a:Math.PI/2,w:24,d:14,h:6.5,wall:0x8a4a36,roof:0x3a3a3c,trim:0xc8b8a0,doors:[['s',-5,3,0],['e',0,2.2]],faces:'sew',ws:3,ww:1.4,wh:2.4,wy:3.3,vent:1,ch:[[8,-4]]});
  bx17(4.4,.9,32,0x7a746a,-24.8,.45,-650,0,0,0,'c');bx17(4.6,.1,32.2,0x9a948a,-24.8,.92,-650);ob17(-24.8,-650,2.2,16,.45,0,1);
  house17({x:-32,z:-650,a:Math.PI/2,w:16,d:7,h:4.2,wall:0xa89878,roof:0x4a3a34,trim:0xe0d8c8,doors:[['s',0,1.6],['n',0,1.4]],ch:[[4,0]],shut:0x3e5a46,faces:'snew'});bx17(1.6,.5,.06,0x1e2a24,-28.42,3.5,-650,0,1.5708,0);
  house17({x:-48,z:-678,a:Math.PI/2,w:14,d:9,h:6.4,fl:2,wall:0x9a8a70,roof:0x3a3a34,trim:0xd8d0c0,doors:[['s',0,1.6]],faces:'sew',ch:[[-4,0]]});
  /* cerco de la refinería */{const F=(x0,z0,x1,z1)=>{const L=Math.hypot(x1-x0,z1-z0),n=Math.ceil(L/3.5);for(let i=0;i<=n;i++)bx17(.1,2,.1,0x3a3a36,x0+(x1-x0)*i/n,1,z0+(z1-z0)*i/n);for(const y of D>0?[.7,1.3,1.9]:[1.3])bx17(Math.abs(x1-x0)+.03,.025,Math.abs(z1-z0)+.03,0x6a645a,(x0+x1)/2,y,(z0+z1)/2);ob17((x0+x1)/2,(z0+z1)/2,Math.abs(x1-x0)/2+.1,Math.abs(z1-z0)/2+.1,2)};
   F(-62,-562,-26,-562);F(-14,-562,32,-562);F(52,-562,124,-562);F(-62,-562,-62,-636);F(-62,-646,-62,-722);F(-62,-722,-26,-722);F(-14,-722,-8,-722);F(14,-722,124,-722)}
  for(let i=0;i<14;i++){const x=-2+RN17()*50,z=-570-RN17()*140;if(Math.abs(x-30)<6||inB({x:X+x,y:.5,z})||inB({x:X+x+1.4,y:.5,z}))continue;for(let k=0;k<3;k++)cy17(.32,.32,.9,[0x3a4a3a,0x5a3a2a,0x2a2a2a][k],x+k*.68,.45,z,0,0,0,8);ob17(x+.68,z,1.1,.4,.9)}for(let i=0;i<10;i++)decalAt30('oil',X-50+RN17()*170,-570-RN17()*140,2+RN17()*3);
  SEC17=null;K17.routes.Vb=[[[40,-560],[34,-620],[22,-680]],[[-20,-560],[-30,-610],[-36,-690]],[[110,-560],[124,-600],[140,-640]]]}
 /* ================== V · PUERTO DE KARSK ================== */
 {SEC17='port';bx17(1.2,4,124,0x6a6862,150.6,-1.95,-660,0,0,0,'c');bx17(1.4,.25,124,0x4a3a28,150.6,.1,-660,0,0,0,'c');for(let z=-602;z>-720;z-=8)cy17(.2,.24,.5,0x2a2a2a,150,.35,z,0,0,0,8);
  /* muelles */
  const piers=[[-615,10,205],[-660,8,200],[-700,12,210]];for(const [z,w,x1] of piers){bx17(x1-150,.3,w,0x5a4632,(150+x1)/2,-.12,z,0,0,0,'c');for(let x=152;x<x1;x+=4)for(const s of[-1,1])cy17(.25,.25,6,0x3a2a1a,x,-3,z+s*(w/2-.3),0,0,0,6);if(D>0)for(let x=154;x<x1;x+=8)for(const s of[-1,1])cy17(.18,.22,.45,0x2a2a2a,x,.25,z+s*(w/2-.4),0,0,0,8);}
  /* agua del puerto entre muelles (colisión) */for(const [z0,z1] of[[-598,-610],[-620,-656],[-664,-694],[-706,-724]])ob17(205,(z0+z1)/2,54,Math.abs(z1-z0)/2,8);for(const [z,w,x1] of piers)ob17(x1+30,z,30,w/2+.2,8);
  /* grúas pórtico */for(const c of K17.cranes){const pz=c.z;for(const a of[-1,1])for(const b of[-1,1]){bm17(0x5a4a3a,c.x+a*2.4,0,pz+b*2.6,c.x+a*1.6,9,pz+b*1.8,.35);ob17(c.x+a*2.3,pz+b*2.5,.3,.3,9)}bx17(4.4,.5,4.6,0x5a4a3a,c.x,9.2,pz);bx17(3,2.6,3.2,0x6a5a46,c.x,10.8,pz,0,0,0,'c');bx17(3.3,.2,3.5,0x2a2a2a,c.x,12.2,pz);bm17(0x5a4a3a,c.x+1,10,pz,c.x+15,20,pz-2,.45);bm17(0x5a4a3a,c.x,12.2,pz,c.x+15,20,pz-2,.08);bm17(0x2a2a2a,c.x+15,20,pz-2,c.x+15,6,pz-2,.04);bx17(.6,.5,.4,0x2a2a2a,c.x+15,5.8,pz-2);for(const s of[-2.6,2.6])bx17(30,.12,.12,0x5a5a5a,c.x,.08,pz+s)}
  /* almacenes del puerto y capitanía */for(const z of[-628,-690])house17({x:137,z,a:Math.PI/2,w:24,d:12,h:6,wall:z<-650?0x6a5a46:0x7a6a50,roof:0x3a3c3e,trim:0xc8c0b0,doors:[['s',-5,3.4,0],['s',5,3.4,1],['n',0,3,0]],dh:3.6,faces:'sn',ws:4,ww:1.2,wh:1,wy:4.6,mat:'c'});
  house17({x:140,z:-659,w:7,d:6,h:5.6,fl:2,wall:0xb8b0a0,roof:0x6a3a2a,trim:0x5a5a52,doors:[['e',0,1.2]],faces:'nse',ch:[[-2,1]],shut:0x3a4a6a});
  /* pilas de cajas y barriles */for(let i=0;i<9;i++){const x=155+RN17()*40,z=[-615,-660,-700][i%3]+(RN17()-.5)*4;bx17(1.2,1,1.2,[0x6a5a3a,0x5a4a32][i&1],x,.5,z,0,RN17(),0,'c');if(i%2)bx17(1.1,.9,1.1,0x6a5a3a,x,1.45,z,0,RN17(),0,'c');ob17(x,z,.75,.75,1.4);cv17(x-1.2,z,1.2)}
  /* botes amarrados (siluetas estáticas) */hull17(186,-1.6,-622.5,16,4,2.2,0x3a3a3c,{ry:Math.PI/2,sup:1.8,fun:[0],fh:3,mast:[4],mh:7,deck:0x5a4a3a});hull17(178,-1.6,-652.5,12,3.4,1.9,0x5a3a2a,{ry:Math.PI/2,sup:1.6,mast:[2],mh:6,deck:0x5a4a3a});hull17(192,-1.6,-667.5,10,3,1.8,0x2a3a4a,{ry:-Math.PI/2,sup:1.4,mast:[-1],mh:6});hull17(175,-1.6,-708.5,18,4.4,2.4,0x2e3236,{ry:Math.PI/2,sup:2,fun:[-1],fh:3.4,mast:[5],mh:8});
  SEC17=null}
 /* ================== VI · GARGANTA Y PUENTE DE ORLOV ================== */
 {SEC17='brg';const bxL=-26,bxR=-14,z0=-755,z1=-805;
  /* estribos y pilas de piedra */for(const z of[-757,-803]){bx17(15,30,6,0x7a746a,-20,-15,z,0,0,0,'c')}for(const z of[-771.7,-788.3]){const dep=-GD(-20);bx17(7,-dep-.9,3.6,0x7a746a,-20,(dep-.9)/2,z,0,0,0,'c');bx17(8.4,1.6,4.6,0x6a645c,-20,dep+.8,z,0,0,0,'c');for(const s of[-1,1])bx17(2.6,-dep-.9,2.6,0x7a746a,-20+s*3.6,(dep-.9)/2,z,0,.785,0,'c');bx17(7.6,.5,4,0x8a847a,-20,-1.1,z,0,0,0,'c')}
  /* tablero y vías */bx17(13,.7,52,0x3a3e3a,-20,-.36,-780);bx17(12,.06,52,0x5a4a36,-20,.02,-780,0,0,0,'c');rail17(-20,-752,-808,false);
  /* vigas en celosía (Pratt) */const SC=0x3e4440;for(const x of[bxL,bxR]){bx17(.4,.4,50,SC,x,6,-780);bx17(.5,.5,50,SC,x,.2,-780);for(let z=z0;z>=z1;z-=5){bx17(.3,6,.3,SC,x,3,z);if(z>z1){const zm=z-5,mid=-780;bm17(SC,x,z>mid?.2:6,z,x,z>mid?6:.2,zm,.22)}}if(D>0)for(let z=z0;z>=z1;z-=1.25)bx17(.06,1.1,.06,0x2a2a2a,x+(x<-20?.5:-.5),.6,z);bx17(.06,.06,50,0x2a2a2a,x+(x<-20?.5:-.5),1.1,-780)}
  for(let z=z0;z>=z1;z-=10){bx17(12.4,.35,.35,SC,-20,6.1,z);if(z>z1)for(const s of[-1,1])bm17(SC,bxL,6.1,z,bxR,6.1,z-10,.12)}for(const z of[z0,z1]){bm17(SC,bxL,4.6,z,-20,6.1,z,.25);bm17(SC,bxR,4.6,z,-20,6.1,z,.25);bx17(5,.6,.1,0x2a2e2a,-20,5.3,z+(z===z0?.2:-.2))}
  for(const x of[bxL,bxR])ob17(x,-780,.3,25,6.4);
  /* rocas en los bordes de la garganta */for(let x=-215;x<255;x+=D>0?9:18){if(Math.abs(x+20)<12)continue;for(const z of[-759,-801])rk17(x+RN17()*6,-1.5-RN17()*2,z+(z<-780?-1:1)*RN17()*2,2+RN17()*2.5,2.5+RN17()*2,2+RN17()*2,[0x6a5e50,0x5a5048][RN17()*2|0],0)}
  /* bloqueo de la garganta, salvo el tablero */ob17((-232+bxL-.4)/2,-780,(bxL-.4+232)/2,23,60);ob17((bxR+.4+272)/2,-780,(272-bxR-.4)/2,23,60);
  /* loma rocosa de la orilla sur (−120,−730), escalonada y transitable */{const H=HILL17;const lg=new T.CylinderGeometry(7,32,4.4,14,4);const lp=lg.attributes.position;for(let i=0;i<lp.count;i++){const y=lp.getY(i);if(y>-2.1&&y<2.1){const k=1+.08*Math.sin(i*1.7);lp.setX(i,lp.getX(i)*k);lp.setZ(i,lp.getZ(i)*k)}}lg.computeVertexNormals();ge17(lg,0x56503c,H.x,2.0,H.z,0,0,0,1,1,1);for(const s of H.st){ob17(H.x,H.z,s[0],s[0],s[1]-.45,0,1)}for(let i=0;i<16;i++){const a=i/16*6.283+RN17()*.3,r=4+RN17()*20;const x=H.x+Math.cos(a)*r,z=H.z+Math.sin(a)*r;const rr=1+RN17()*1.5;rk17(x,floor17(x,z)+rr*.2,z,rr,rr*.8,rr,0x6a6258,0);ob17(x,z,rr*.7,rr*.7,floor17(x,z)+rr)}sb17(H.x-4,H.z-6,H.x+4,H.z-6,1);cv17(H.x,H.z-4.6,1.6)}
  SEC17=null;K17.routes.VI=[[[-20,-740],[-20,-805],[-20,-830]],[[-120,-730],[-30,-750],[-20,-805]]]}
 /* ================== VI · ORILLA NORTE ================== */
 {SEC17='nor';road17([[-16,-808],[-10,-860],[-12,-960]],6);
  const bays=trench17(-112,72,-842,{gF:[[-20,9],[-70,2.6],[34,2.6]],gB:[[-20,9],[-90,2.6],[-50,2.6],[10,2.6],[55,2.6]]});K17.north.trench=bays;
  /* v33: casamatas de hormigón con puerta blindada (modelo del cap. XIII) en lugar de los bloques simples */for(const b of K17.north.bunkers){casemate17(b.x,b.z,{col:0x7e7c76});camo17(b.x,b.z+.3,12.5,9.5,4.35,0);sb17(b.x-7.6,b.z+4.6,b.x-6.2,b.z+4.6,.7,0,1);sb17(b.x+6.2,b.z+4.6,b.x+7.6,b.z+4.6,.7,0,1)}
  for(const p of K17.north.pits){ring17(p.x,p.z,3.4,1,3.14,1);bx17(1.6,.06,5,0x3e352a,p.x,.03,p.z-5)}
  wire17(-118,78,-829,[[-20,10],[-70,3],[34,3]]);
  for(let i=0;i<10;i++){const x=-100+RN17()*170,z=-812-RN17()*14;decalAt30('crater',X+x,z,3+RN17()*3);cv17(x,z,2)}
  /* puesto de reunión: tiendas, poste indicador, fogón, cajas; estancia en ruinas */const E=K17.end;for(let i=0;i<6;i++){const x=E.x-24+(i%3)*9+(i>2?4:0),z=E.z-6-(i>2?10:0);ge17(gTri17(),0x6a6a52,x,0,z,0,1.5708,0,4,2.2,3.2,'c');bx17(.6,1.6,.05,0x1a1a14,x,.8,z+1.62,0,0,0)}cy17(.08,.1,3,0x4a3a28,E.x+8,1.5,E.z+6,0,0,0,6);bx17(1.6,.3,.06,0xd8d0b8,E.x+8.6,2.6,E.z+6,0,.3,0);for(let k=0;k<5;k++)rk17(E.x+5+Math.cos(k*1.25)*.6,.1,E.z+Math.sin(k*1.25)*.6,.25,.2,.25,0x5a5a56,0);for(let i=0;i<6;i++)bx17(.9,.5,.6,0x5a5a36,E.x-8+i*.95,.25,E.z+8,0,0,0,'c');ob17(E.x-5.6,E.z+8,2.9,.4,.6);
  for(const [x0,z0,x1,z1,h] of[[30,-890,48,-890,2.6],[30,-890,30,-906,1.8],[48,-890,48,-900,3.2],[30,-906,42,-906,1.2]]){bx17(Math.abs(x1-x0)+.6,h,Math.abs(z1-z0)+.6,0x8a8274,(x0+x1)/2,h/2,(z0+z1)/2,0,0,0,'c');ob17((x0+x1)/2,(z0+z1)/2,Math.abs(x1-x0)/2+.3,Math.abs(z1-z0)/2+.3,h);cv17((x0+x1)/2+(z0===z1?0:1.4),(z0+z1)/2+(z0===z1?-1.4:0),1.4)}
  SEC17=null}
 /* ================== LEJANÍA: buques veyrn en silueta ================== */
 {SEC17='far';for(const [x,z,L,k] of[[420,-120,110,0],[455,-330,90,1],[330,-680,80,2],[470,-560,120,0],[440,-880,100,1],[520,40,95,2]])hull17(x,-.8,z,L,L*.12,L*.07,0x3e4448,{ry:k===1?.2:-.15,sup:L*.06,supC:0x464c50,fun:k===2?[-L*.2]:[-L*.05,L*.06],fh:L*.07,funC:0x2e3236,mast:[L*.25,-L*.3],mh:L*.17,deck:0x3a4044});SEC17=null}
 /* ================== HIERBA DE ESTEPA (instanciada) ================== */
 {const g=new T.BufferGeometry(),pos=[],nor=[];for(let i=0;i<6;i++){const a=i*1.05+.3,r=.05+.04*(i%3),tx=Math.cos(a)*(.18+.1*(i%2)),tz=Math.sin(a)*(.18+.1*(i%2)),h=.38+.1*(i%3),px=-Math.sin(a)*.05,pz=Math.cos(a)*.05,bx=Math.cos(a)*r,bz=Math.sin(a)*r;pos.push(bx-px,0,bz-pz,bx+px,0,bz+pz,tx,h,tz);for(let k=0;k<3;k++)nor.push(0,1,0)}g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.setAttribute('normal',new T.Float32BufferAttribute(nor,3));
  const N=[900,2000,3400][Math.max(0,Math.min(2,D))],im=new T.InstancedMesh(g,new T.MeshLambertMaterial({color:0xffffff,side:T.DoubleSide}),N),m4=new T.Matrix4(),q4=new T.Quaternion(),e=new T.Euler(),v=new T.Vector3(),sc=new T.Vector3(),c=new T.Color(),tq={x:0,y:.3,z:0};let n=0,tries=0;
  while(n<N&&tries<N*12){tries++;const x=-215+RN17()*470,z=95-RN17()*1070;const st=z<-300&&z>-440;if(!st&&RN17()<.45)continue;if(x>coast17(z)-6)continue;if(Math.abs(x+20)<2.5||(z<-752&&z>-808))continue;if(z<-425&&z>-725&&x>-65&&x<130&&RN17()<.8)continue;if(x>0&&x<110&&z<62&&z>-2&&RN17()<.7)continue;tq.x=X+x;tq.z=z;if(inB(tq))continue;
   const s=.6+RN17()*.8;e.set(0,RN17()*6.28,0);q4.setFromEuler(e);v.set(X+x,floor17(x,z),z);sc.set(s,s*(.8+RN17()*.6),s);m4.compose(v,q4,sc);im.setMatrixAt(n,m4);c.setHex([0x7a6e48,0x6a6640,0x8a7a50,0x5e5e3a][n&3]).multiplyScalar(.8+RN17()*.3);im.setColorAt(n,c);n++}
  im.count=n;im.instanceMatrix.needsUpdate=true;if(im.instanceColor)im.instanceColor.needsUpdate=true;im.frustumCulled=false;scene.add(im);W17.ms.push(im);W17.grass=n}
 /* ================== FUSIÓN DE SECTORES ================== */
 {const MR=new T.MeshLambertMaterial({vertexColors:true,map:tex17('r')}),MC=new T.MeshLambertMaterial({vertexColors:true,map:tex17('c')});K17.sectors={};
  for(const k in S17){for(const mk of['r','c']){const q=S17[k][mk];if(!q.L.length)continue;const g=pbGeo(q);triUV17(g,mk==='c'?.85:.5);const m=new T.Mesh(g,mk==='c'?MC:MR);m.matrixAutoUpdate=false;m.updateMatrix();scene.add(m);W17.ms.push(m);K17.sectors[k+'_'+mk]=g.attributes.position.count;q.L.length=0}}}
 /* ================== ATMÓSFERA DINÁMICA ================== */
 {const N=[260,520,900][Math.max(0,Math.min(2,D))],g=new T.BufferGeometry(),p=new Float32Array(N*3);for(let i=0;i<N;i++){p[i*3]=(R()-.5)*60;p[i*3+1]=R()*30;p[i*3+2]=(R()-.5)*60}g.setAttribute('position',new T.BufferAttribute(p,3));const pm=new T.Points(g,new T.PointsMaterial({color:0xe8eef2,size:.08,transparent:true,opacity:.75,depthWrite:false}));pm.frustumCulled=false;scene.add(pm);W17.sl={m:pm,N,p,k:.6}}
 {const t=tex17('f');for(let i=0;i<3;i++){const s=new T.Sprite(new T.SpriteMaterial({map:t,color:0xffc890,transparent:true,opacity:0,blending:T.AdditiveBlending,depthWrite:false,fog:false}));s.visible=false;scene.add(s);W17.fl.push({s,t:0,d:.3})}}
 K17.verts=0;for(const m of W17.ms)if(m.geometry)K17.verts+=m.geometry.attributes.position.count*(m.isInstancedMesh?m.count:1);
}
/* cielo gris de amanecer, niebla de mar y luz fría (la misión lo llama al empezar) */
function sky17(){setSky([[0,'#4e545c'],[.3,'#6e747a'],[.47,'#9aa0a4'],[.5,'#a8acae'],[.56,'#8a8e90'],[1,'#5a5e60']]);const D=(G.detail===undefined?1:+G.detail);W17.fogF=D===0?380:D===1?480:560;W17.fogN=22;scene.fog.color.setHex(W17.fogC);scene.fog.near=W17.fogN;scene.fog.far=W17.fogF;if(typeof L9!=='undefined')L9.fog=null;
 hemi.color.setHex(0xb8c2cc);hemi.groundColor.setHex(0x5a5448);hemi.intensity=1.05;sunL.color.setHex(0xd8d6d0);sunL.intensity=.62;sunL.position.set(90,55,-30);skyMesh.scale.setScalar(2.4);W17.skyS=1;if(cam.far<1150){cam.far=1150;cam.updateProjectionMatrix()}}
/* viento, niebla que respira, aguanieve, polvo, humo de chimeneas, fogonazos de artillería en el mar */
function weather17(dt){if(!W17.built)return;dt=Math.min(dt||.033,.1);const t=(W17.u.value+=dt),cp=cam.position;W17.gust=.5+.5*Math.sin(t*.13)*Math.sin(t*.051+1);const wind=W17.wind*(.6+W17.gust*.9);
 if(W17.river&&W17.river.material.map)W17.river.material.map.offset.x-=dt*.12;if(W17.sea&&W17.sea.material.map){W17.sea.material.map.offset.x+=dt*.004;W17.sea.material.map.offset.y+=dt*.002}
 if(W17.foam)W17.foam.material.opacity=.32+.22*Math.sin(t*1.3);if(W17.beam)W17.beam.rotation.y=t*.9;if(W17.anemo)W17.anemo.rotation.y+=dt*(4+wind*2);
 if(scene.fog&&level===17){const f=W17.fl;let fx=0;for(const q of f)if(q.t>0)fx=Math.max(fx,q.t/q.d);scene.fog.far=W17.fogF*(.92+.08*Math.sin(t*.07));const c=scene.fog.color;c.setHex(W17.fogC);if(fx>0)c.lerp(new T.Color(0xc8a888),fx*.12)}
 const S=W17.sl;if(S){S.m.visible=true;S.k+=((W17.gust>.65?1:.25)-S.k)*dt*.2;const n=Math.floor(S.N*Math.max(.15,S.k));S.m.geometry.setDrawRange(0,n);S.m.position.set(cp.x,cp.y-8,cp.z);const p=S.p;for(let i=0;i<n;i++){const o=i*3;p[o]+=wind*1.6*dt;p[o+1]-=(5+(i%5))*dt;p[o+2]+=Math.sin(i+t)*.4*dt;if(p[o+1]<0){p[o+1]+=30;p[o]=(R()-.5)*60;p[o+2]=(R()-.5)*60}if(p[o]>30)p[o]-=60}S.m.geometry.attributes.position.needsUpdate=true;S.m.material.opacity=.35+.45*S.k}
 W17.dt-=dt;if(W17.dt<=0&&+G.detail!==0){W17.dt=.45+R()*.5;const a=R()*6.28,r=8+R()*25;smoke(cp.x+Math.cos(a)*r-10,.4,cp.z+Math.sin(a)*r,2.2+R()*2,4,0x9a8e78,.15,.14)}
 W17.ct=(W17.ct||0)-dt;if(W17.ct<=0&&W17.smk.length){W17.ct=.4;const s=W17.smk[(R()*W17.smk.length)|0];if(Math.hypot(s[0]-cp.x,s[2]-cp.z)<380)smoke(s[0],s[1],s[2],1.2+s[3]*3,6+s[3]*4,s[3]>.8?0x2a2826:0x8a8a88,1+s[3],.35+s[3]*.2)}
 W17.ft-=dt;if(W17.ft<=0){W17.ft=1.2+R()*4.5;const q=W17.fl.find(q=>q.t<=0)||W17.fl[0];q.s.position.set(X17+430+R()*350,3+R()*22,cp.z-500+R()*800);q.s.scale.setScalar(50+R()*70);q.d=q.t=.2+R()*.25;q.s.visible=true;if(R()<.35)W17.ft=.15}
 for(const q of W17.fl)if(q.t>0){q.t-=dt;const k=Math.max(0,q.t/q.d);q.s.material.opacity=k*k*.9;if(q.t<=0)q.s.visible=false}}
/* fuera del nivel 17: devuelve el cielo a su escala y oculta las partículas */
{const _u17=update;update=function(dt){_u17(dt);if(level!==17&&W17.skyS){W17.skyS=0;skyMesh.scale.setScalar(1);if(W17.sl)W17.sl.m.visible=false;for(const q of W17.fl)q.s.visible=false}}}
