/* =====================================================================
   v38_env · DISTRITO DE VARNHOLT — mapa del nivel 18 («Martillo de Nieve»)
   Invierno, 22 de enero de 1923. Bosque de Dravik (pinos y abetos nevados,
   lago helado), Muro de Varn (alambradas, foso antitanque con un solo paso,
   trincheras en zigzag, 3 casamatas, refugios, Cota 214), Meseta de Varn
   (granja de piedra borgoñona, viñas, setos, batería FRUST, nidos AA),
   Falkenbrück (murallas con torres, puerta sur y puerta del ferrocarril,
   avenidas, plaza del mercado, iglesia con torre transitable, cuartel,
   fábrica de municiones, estación, talleres y playa de vías, río con dos
   puentes, ciudadela con túnel carretero, torre de comunicaciones, mástil),
   aeródromo veyrn improvisado al NE.
   Coordenadas LOCALES (x' = X18 + x; X18 en v38_lib.js). Norte = −z.
   API: buildVarn18(), sky18(phase[,blend]), weather18(dt), floor18(x,z),
        collapse18(id), towerDmg18(stage), K18.
   ===================================================================== */
let K18=null;
const W18={built:false,u:{value:0},smk:[],fl:[],ms:[],sl:null,fogP:null,col:{},tw:{},phase:'dawn',tgt:null,blend:0,fogN:12,fogF:300,fogC:0x2e3850,snow:.5,ft:2,ct:0,dt:0,gust:0,wind:2.2,tr:null};
const RN18=(()=>{let s=0x56617231;return()=>{s|=0;s=s+0x6D2B79F5|0;let t=Math.imul(s^s>>>15,1|s);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}})();
/* segundo generador SOLO para lo que tiene colisión: igual en todos los niveles de detalle */
const RP18=(()=>{let s=0x18f00d18;return()=>{s|=0;s=s+0x6D2B79F5|0;let t=Math.imul(s^s>>>15,1|s);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}})();
const pt18=(x,z,o)=>{const a=[x,z];a.x=x;a.z=z;if(o)Object.assign(a,o);return a};
const S18={};let SEC18=null,CAP18=null,Y18=0;
function sec18(x,z){if(x>172&&z<-590&&z>-860)return'air';if(z>-105)return x<-60?'forW':'forE';if(z>-285)return'wal';if(z>-530)return'mes';if(z>-655)return x<0?'csW':'csE';if(z>-765)return x<0?'cnW':'cnE';return'riv'}
function Q18(x,z,m){const k=SEC18||sec18(x,z);const s=S18[k]||(S18[k]={r:PB(),c:PB(),b:PB()});return s[m==='c'||m==='b'?m:'r']}
/* ---------- helpers heredados de v32_env (renombrados 17→18, con desplazamiento vertical Y18 y captura CAP18) ---------- */
function bx18(w,h,d,c,x,y,z,rx,ry,rz,m){pBox(Q18(x,z,m),w,h,d,c,X18+x,y+Y18,z,rx,ry,rz)}
function cy18(a,b,h,c,x,y,z,rx,ry,rz,s,m){pa(Q18(x,z,m),gCyl(a,b,h,s||8),c,X18+x,y+Y18,z,rx,ry,rz)}
function ge18(g,c,x,y,z,rx,ry,rz,sx,sy,sz,m){pa(Q18(x,z,m),g,c,X18+x,y+Y18,z,rx,ry,rz,sx,sy,sz)}
function bm18(c,x0,y0,z0,x1,y1,z1,th,m){const dx=x1-x0,dy=y1-y0,dz=z1-z0,L=Math.sqrt(dx*dx+dy*dy+dz*dz)||.01;pBox(Q18((x0+x1)/2,(z0+z1)/2,m),th,L,th,c,X18+(x0+x1)/2,(y0+y1)/2+Y18,(z0+z1)/2,Math.atan2(dz,dy),0,-Math.asin(Math.max(-1,Math.min(1,dx/L))))}
function rk18(x,y,z,sx,sy,sz,c,d){ge18(gRock17(d||0),c,x,y,z,RN18()*6,RN18()*6,RN18()*.4,sx,sy,sz)}
function ob18(x,z,hw,hd,h,y0,st){const o={x:X18+x,z,hw,hd,h:h+Y18};if(CAP18)CAP18.push(o);if(y0||Y18)o.y0=(y0||0)+Y18;if(st)o.step=true;obstB.push(o);K18.obs++;return o}
function cv18(x,z,r){covers.push({x:X18+x,z,r:r||1.4});K18.cover.push(pt18(x,z))}
/* kit de edificio: marco local (u a lo largo de w, v a lo largo de d) girado "a" */
function kit18(cx,cz,a){const c=Math.cos(a),s=Math.sin(a);const P=(u,v)=>[cx+u*c+v*s,cz-u*s+v*c];
 return{a,P,b:(w,h,d,col,u,y,v,rx,ry,rz,m)=>{const p=P(u,v);bx18(w,h,d,col,p[0],y,p[1],rx,a+(ry||0),rz,m)},
  cy:(r1,r2,h,col,u,y,v,rx,ry,rz,sg,m)=>{const p=P(u,v);cy18(r1,r2,h,col,p[0],y,p[1],rx,a+(ry||0),rz,sg,m)},
  g:(g,col,u,y,v,rx,ry,rz,sx,sy,sz,m)=>{const p=P(u,v);ge18(g,col,p[0],y,p[1],rx,a+(ry||0),rz,sx,sy,sz,m)},
  ob:(u,v,hu,hv,h,y0)=>{const p=P(u,v),sw=Math.abs(s)>.5;return ob18(p[0],p[1],sw?hv:hu,sw?hu:hv,h,y0)}}}
/* pieza sobre una fachada: face n(−v) s(+v) w(−u) e(+u); al = posición a lo largo; out = salida */
function fp18(K,o,face,al,y,out,sw,sh,sd,col,m){const ns=face==='n'||face==='s',sg=(face==='s'||face==='e')?1:-1;if(ns)K.b(sw,sh,sd,col,al,y,sg*(o.d/2+out),0,0,0,m);else K.b(sd,sh,sw,col,sg*(o.w/2+out),y,al,0,0,0,m)}
function win18(K,o,face,al,y,ww,hh,D){const tc=o.trim||0xcfc8b8,lit=RN18()<(o.lit||.12);fp18(K,o,face,al,y,.02,ww+.26,hh+.26,.06,tc);fp18(K,o,face,al,y,.05,ww,hh,.06,lit?0xc8a868:0x20262a);
 if(D>0){fp18(K,o,face,al,y,.09,.06,hh,.04,tc);fp18(K,o,face,al,y+hh*.18,.09,ww,.06,.04,tc);fp18(K,o,face,al,y+hh/2+.13,.05,ww+.42,.16,.14,shade(tc,.85))}
 fp18(K,o,face,al,y-hh/2-.08,.08,ww+.36,.09,.22,shade(tc,.8));
 if(D>1&&o.shut){fp18(K,o,face,al-ww/2-.32,y,.06,.42,hh+.1,.05,o.shut);fp18(K,o,face,al+ww/2+.32,y,.06,.42,hh+.1,.05,o.shut)}
 if(o.int)fp18(K,o,face,al,y,-.29,ww,hh,.04,0x9aa8ae)}
function door18(K,o,face,al,dw,open,D){const tc=o.trim||0xcfc8b8,dh=o.dh||2.3;fp18(K,o,face,al,dh/2+.05,.02,dw+.32,dh+.18,.07,tc);if(open!==2)fp18(K,o,face,al,dh/2,open?.03:.06,dw,dh,.06,open?0x0e0c0a:(o.doorC||0x4a3424));fp18(K,o,face,al,.09,.36,dw+.7,.18,.72,0x6a6862);
 if(D>0&&!o.noCan){fp18(K,o,face,al,dh+.35,.42,dw+.9,.1,.9,o.roof||0x3a3a3a);for(const s of[-1,1])fp18(K,o,face,al+s*(dw/2+.3),dh+.2,.8,.06,.3,.06,0x2a2a2a)}}
/* edificio completo con muros, zócalo, cornisa, cubierta, frontones, ventanas, puertas y chimeneas */
function house18(o){const D=K18.D,a=o.a||0,K=kit18(o.x,o.z,a),w=o.w,d=o.d,h=o.h,wc=o.wall,rc=o.roof||0x3e3c3a,tc=o.trim||0xcfc8b8,m=o.mat||'c',faces=o.faces||'nsew',fl=o.fl||1;const prev=SEC18;SEC18=o.sec||sec18(o.x,o.z);
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
  for(let f=0;f<fl;f++)for(let i=0;i<n;i++){const al=-L/2+(i+.5)*L/n;if(f===0&&doors.some(q=>q[0]===face&&Math.abs(q[1]-al)<q[2]/2+ww/2+.3))continue;if(o.noWin&&o.noWin.includes(face))continue;win18(K,o,face,al,f*h/fl+(o.wy||1.65),ww,wh,D)}}
 for(const q of doors)door18(K,o,q[0],q[1],q[2],o.int?2:q[3],D);
 for(const c of o.ch||[]){const ch=top-h+1.6;K.b(.75,ch+.6,.75,o.chC||0x6a3e30,c[0],h+ch/2-.2,c[1],0,0,0,'c');K.b(.95,.16,.95,0x3a3a3a,c[0],h+ch+.12,c[1]);const p=K.P(c[0],c[1]);W18.smk.push([X18+p[0],h+ch+.4,p[1],o.smk||.5])}
 if(D>1&&!o.flat&&!o.int){for(const su of[-1,1])for(const sv of[-1,1])K.b(.1,h,.1,0x3a3a3a,su*(w/2+.12),h/2,sv*(d/2+.12))}
 if(o.cv!==false){for(const su of[-1,1])for(const sv of[-1,1]){const p=K.P(su*(w/2+1.1),sv*(d/2+1.1));cv18(p[0],p[1],1.2)}}
 SEC18=prev;return K}
/* sacos terreros: fila recta con colisión por tramos */
function sb18(x0,z0,x1,z1,h,col,noOb){const D=K18.D,dx=x1-x0,dz=z1-z0,L=Math.hypot(dx,dz),ry=Math.atan2(-dz,dx),rows=Math.max(1,Math.round(h/.3)),n=Math.max(1,Math.round(L/.92));col=col||0xa49470;
 for(let r=0;r<rows;r++){if(D===0&&r<rows-1){const cxm=(x0+x1)/2,czm=(z0+z1)/2;bx18(L,(rows-1)*.3,.62,col,cxm,(rows-1)*.15,czm,0,ry,0,'c');r=rows-2;continue}for(let i=0;i<n;i++){const t=(i+.5+(r%2?.5:0))/n;if(t>1)continue;bx18(.9,.3,.55,shade(col,.92+RN18()*.16),x0+dx*t,.15+r*.3,z0+dz*t,0,ry+(RN18()-.5)*.12,0)}}
 if(noOb)return;const ax=Math.abs(dx)<.3||Math.abs(dz)<.3;if(ax)ob18((x0+x1)/2,(z0+z1)/2,Math.abs(dx)/2+.3,Math.abs(dz)/2+.3,h);else{const k=Math.ceil(L/1.6);for(let i=0;i<k;i++){const t=(i+.5)/k;ob18(x0+dx*t,z0+dz*t,.7,.7,h)}}}
/* anillo de sacos (nido de ametralladora / pozo de cañón) abierto hacia "op" (ángulo, 0 = −z) */
function ring18(cx,cz,r,h,op,gap){const n=Math.round(r*6.283/.95);for(let i=0;i<n;i++){const a=i/n*6.283;let da=Math.abs(((a-op)%6.283+9.42)%6.283-3.14);if(da<gap)continue;const x=cx+Math.sin(a)*r,z=cz-Math.cos(a)*r;const rows=Math.round(h/.3);if(K18.D>0)for(let k=0;k<rows;k++)bx18(.9,.3,.55,shade(0xa49470,.92+RN18()*.16),x,.15+k*.3,z,0,-a+(k%2)*.1,0,'c');else bx18(.95,h,.6,0xa49470,x,h/2,z,0,-a,0,'c')}
 const K=8;for(let i=0;i<K;i++){const a=(i+.5)/K*6.283;let da=Math.abs(((a-op)%6.283+9.42)%6.283-3.14);if(da<gap+.25)continue;ob18(cx+Math.sin(a)*r,cz-Math.cos(a)*r,.75,.75,h)}cv18(cx,cz,r)}
/* alambrada: caballos de frisa y hebras */
function wire18(x0,x1,z,gaps){const D=K18.D;let s=x0;gaps=gaps.slice().sort((p,q)=>p[0]-q[0]);const segs=[];for(const g of gaps.concat([[x1+10,0]])){const e=Math.min(x1,g[0]-g[1]/2);if(e>s)segs.push([s,e]);s=g[0]+g[1]/2}
 for(const [a,b] of segs){for(let x=a;x<=b;x+=3){for(const s of[-1,1])bm18(0x4a3a2a,x-.6*s,0,z-.7,x+.6*s,1.2,z+.7,.08);}for(const y of D>0?[.35,.7,1.05]:[.7])for(const dz of[-.6,.6])bx18(b-a,.025,.025,0x6a645a,(a+b)/2,y,z+dz);ob18((a+b)/2,z,(b-a)/2,.9,1.1)}}
/* trinchera en zigzag (baluartes y traveses) frente al sur (+z) */
function trench18(x0,x1,zb,o){const D=K18.D,bays=[],B=10;o=o||{};const gF=o.gF||[],gB=o.gB||[],P=0xa09070,PD=0x7a6a50,MUD=0x3e352a;
 const cut=(xa,xb,gs)=>{let s=xa;const out=[];for(const g of gs.filter(g=>g[0]>xa-g[1]&&g[0]<xb+g[1]).sort((p,q)=>p[0]-q[0])){const e=g[0]-g[1]/2;if(e>s)out.push([s,e]);s=Math.max(s,g[0]+g[1]/2)}if(s<xb)out.push([s,xb]);return out};
 let i=0;for(let xa=x0;xa<x1;xa+=B,i++){const xb=Math.min(x1,xa+B),zi=zb-(i%2)*4,cx=(xa+xb)/2;bays.push(pt18(cx,zi));
  bx18(xb-xa,.06,2.4,MUD,cx,.03,zi,0,0,0);if(D>0)bx18(xb-xa,.05,.8,0x5a4632,cx,.08,zi,0,0,0,'c');bx18(xb-xa,.42,.5,0x5a4a36,cx,.21,zi+.95,0,0,0,'c');
  for(const [a,b] of cut(xa,xb,gF)){bx18(b-a,1.2,1.4,P,(a+b)/2,.6,zi+1.9,0,0,0,'c');if(D>0)for(let x=a+.5;x<b;x+=.95)bx18(.9,.28,.5,shade(P,.9+RN18()*.2),x,1.34,zi+1.9+(RN18()-.5)*.3,0,(RN18()-.5)*.2,0);ob18((a+b)/2,zi+1.9,(b-a)/2,.7,1.25);if(D>0)for(let x=a+1;x<b;x+=2.5)bx18(.12,1.25,.12,0x4a3a28,x,.62,zi+1.15)}
  for(const [a,b] of cut(xa,xb,gB)){bx18(b-a,.8,1.2,PD,(a+b)/2,.4,zi-1.8,0,0,0,'c');ob18((a+b)/2,zi-1.8,(b-a)/2,.6,.8)}
  if(xb<x1){const zn=zb-((i+1)%2)*4,zf=Math.max(zi,zn)+1.9,zr=Math.min(zi,zn)+1.9;bx18(1.4,1.2,zf-zr+1.4,P,xb,.6,(zf+zr)/2,0,0,0,'c');ob18(xb,(zf+zr)/2,.7,(zf-zr)/2+.7,1.25);const yf=Math.max(zi,zn)-1.8,yr=Math.min(zi,zn)-1.8;bx18(1.2,.8,yf-yr+1.2,PD,xb,.4,(yf+yr)/2,0,0,0,'c');bx18(1.4,.06,4.4,MUD,xb,.03,(zi+zn)/2,0,0,0)}
  if(i%2===0)cv18(cx,zi+.6,1.5)}
 return bays}
/* v33 · casamata de hormigón con tronera al sur y puerta blindada trasera (mismo diseño que
   las casamatas del cap. XIII, v25/v31_l13, parametrizado para coordenadas locales del 17).
   Centro (cx,cz); la tronera mira a +z (sur). Devuelve {mg:[x,z], door:[x,z]} */
function casemate18(cx,cz,o){o=o||{};const D=K18.D,CC=o.col||0x8a8780,CB=(w,h,d,x,y,z)=>bx18(w,h,d,CC,cx+x,y,cz+z);
 CB(10.6,1.2,.8,0,.6,3.5);CB(1,1.6,.8,-4.8,2.0,3.5);CB(1,1.6,.8,4.8,2.0,3.5);CB(.7,1.6,.8,0,2.0,3.5);CB(.8,2.8,7,-5,1.4,0);CB(.8,2.8,7,5,1.4,0);CB(6.3,2.8,.8,-1.85,1.4,-3.5);CB(2.3,2.8,.8,3.85,1.4,-3.5);CB(1.4,.7,.8,2,2.45,-3.5);
 bx18(11.8,.7,8.8,0x5a5a56,cx,3.15,cz);bx18(11,.45,8,0x3e3a2c,cx,3.7,cz);for(let i=0;i<8;i++)bx18(1.2,.4,.6,0xb8ac88,cx-4.4+i*1.25,4.1,cz+3.7,0,(i%2)*.08,0,'c');bx18(10.8,.1,.9,0x2a2a26,cx,2.85,cz+4.3);
 for(const s of[-1,1])bx18(1.4,2.6,8.4,0x4a4636,cx+s*6.1,.9,cz,0,0,-s*.6);bx18(12,1.6,1.2,0x4a4636,cx,.5,cz+4.4,.75,0,0);
 /* interior oscuro, marco de acero y hoja blindada abierta */bx18(9.2,.04,6.2,0x24221e,cx,.02,cz);bx18(9.2,.06,.7,0x14120e,cx,2.75,cz+3.1);bx18(1.6,.16,.16,0x2a2a2a,cx+2,2.12,cz-3.92);for(const s of[-1,1])bx18(.16,2.1,.16,0x2a2a2a,cx+2+s*.74,1.05,cz-3.92);
 {const hx=cx+1.32,hz=cz-3.95,a=1.8,ux=Math.cos(a),uz=-Math.sin(a);bx18(1.36,2.05,.1,0x3a4038,hx+ux*.68,1.03,hz+uz*.68,0,a,0);if(D>0)for(let i=0;i<3;i++)for(let j=0;j<3;j++)bx18(.06,.06,.12,0x2a2e28,hx+ux*(.2+j*.48),.35+i*.65,hz+uz*(.2+j*.48),0,a,0);bx18(.07,.45,.16,0x6a6a62,hx+ux*1.18,1.0,hz+uz*1.18,0,a,0)}
 /* plataforma de tiro de la ametralladora, mesa, cajas y farol */bx18(2.2,.25,1.4,0x4a3a28,cx-1.4,.13,cz+2.3,0,0,0,'c');bx18(1.8,.08,.6,0x5a3a22,cx-2.5,.8,cz-2.6,0,0,0,'c');for(let i=0;i<3;i++)bx18(.7,.45,.45,0x4a5a3a,cx+3.6,.23,cz-1.8+i*.6,0,0,0,'c');bx18(.14,.14,.14,0xffd890,cx,2.6,cz-1);
 /* camuflaje y ventilación (v31_l13) */for(let i=0;i<5;i++)bx18(1.2+RN18()*.8,.06,.9,0x3a4a2a,cx-4+i*2,3.95,cz-1.5+(i%2)*1.6,0,RN18(),0);cy18(.18,.18,.6,0x4a4a44,cx-3,4.1,cz-2,0,0,0,8);bx18(.5,.08,.5,0x3a3a36,cx-3,4.42,cz-2);
 if(o.name&&D>0){bx18(1.6,.36,.05,0xd8ccb0,cx-2.6,3.25,cz-4.42);bx18(1.3,.06,.06,0x1a1a1a,cx-2.6,3.28,cz-4.46)}
 ob18(cx,cz+3.5,5.3,.4,1.2);ob18(cx-5,cz,.4,3.5,2.8);ob18(cx+5,cz,.4,3.5,2.8);ob18(cx-1.85,cz-3.5,3.15,.4,2.8);ob18(cx+3.85,cz-3.5,1.15,.4,2.8);
 cv18(cx-6.9,cz-2,1.4);cv18(cx+6.9,cz-2,1.4);return{mg:[cx-1.4,cz+2.3],door:[cx+2,cz-4.6],x:cx,z:cz}}
/* entrada de refugio (estilo del búnker de mando del cap. XIII, v27): alas de hormigón, dintel,
   marco de acero, puerta (abierta o entornada), cartel, farol y túmulo de tierra detrás.
   (x,z) = la puerta; la entrada mira a +z */
function dug18(x,z,o){o=o||{};const D=K18.D,CC=0x84827a;for(const s of[-1,1]){bx18(.5,2.5,2.2,CC,x+s*1.45,1.25,z+1.0);ob18(x+s*1.45,z+1.0,.25,1.1,2.5)}bx18(3.4,.5,2.4,CC,x,2.75,z+1.0);
 bx18(1.8,.16,.16,0x2a2a2a,x,2.42,z-.08);for(const s of[-1,1])bx18(.16,2.4,.16,0x2a2a2a,x+s*.86,1.2,z-.08);bx18(1.6,2.3,.05,0x0c0a08,x,1.15,z-.18);
 {const a=o.shut?0:-1.75,hx=x-.8,hz=z,ux=Math.cos(a),uz=-Math.sin(a);bx18(1.5,2.3,.12,o.wood?0x5a4630:0x3a4038,hx+ux*.75,1.15,hz+uz*.75,0,a,0,'c');bx18(.08,.5,.16,0x6a6a62,hx+ux*1.3,1.1,hz+uz*1.3,0,a,0)}
 if(o.sign){bx18(1.4,.4,.05,0xe8e0c8,x,3.25,z+2.22);bx18(1.2,.06,.06,0x1a1a1a,x,3.3,z+2.26);bx18(.8,.06,.06,0x1a1a1a,x-.1,3.17,z+2.26)}bx18(.16,.16,.16,0xffe0a0,x+1.1,3.15,z+2.3);
 /* túmulo de tierra y sacos sobre el refugio */bx18(7,1.4,5.6,0x4a4636,x,.7,z-3.2,0,0,0);bx18(5.6,.9,4.4,0x544e3c,x,1.75,z-3.2);for(const s of[-1,1])bx18(1.4,2.2,5.6,0x4a4636,x+s*3.4,.8,z-3.2,0,0,-s*.55);bx18(7,1.2,1.4,0x4a4636,x,.4,z-6.3,-.6,0,0);
 if(D>0)for(let i=0;i<5;i++)bx18(.9,.3,.5,shade(0xa49470,.9+RN18()*.2),x-2+i*1,2.35,z-1.3,0,(RN18()-.5)*.3,0,'c');cy18(.08,.08,1.2,0x3a3a36,x+1.8,2.6,z-3.5,0,0,0,6);
 ob18(x,z-3.2,3.5,2.6,2.2);return pt18(x,z+1.6)}
/* red de camuflaje sobre postes */
function camo18(x,z,w,d,y,ry){const D=K18.D,c=Math.cos(ry||0),s=Math.sin(ry||0);bx18(w,.05,d,0x4a5236,x,y,z,0,ry||0,0);for(const a of[-1,1])for(const b of[-1,1])cy18(.05,.06,y,0x4a3a28,x+a*w*.45*c+b*d*.45*s,y/2,z-a*w*.45*s+b*d*.45*c,0,0,0,5);
 if(D>0)for(let i=0;i<(D>1?14:7);i++){const u=(RN18()-.5)*w,v=(RN18()-.5)*d;bx18(.6+RN18()*.8,.04,.5+RN18()*.6,[0x5e6440,0x3a4228,0x6a6448][i%3],x+u*c+v*s,y+.04,z-u*s+v*c,0,RN18()*3,0)}
 if(D>0)for(let i=0;i<6;i++){const u=(i/5-.5)*w;bx18(.3,.7,.03,0x4a5236,x+u*c+d/2*s,y-.35,z-u*s+d/2*c,0,ry||0,0)}}
/* poste de telégrafo */
function pole18(x,z){cy18(.12,.16,7.2,0x4a3a2a,x,3.6,z,0,0,0,6);bx18(1.8,.12,.12,0x4a3a2a,x,6.6,z);if(K18.D>0)for(const s of[-.7,.7])cy18(.05,.05,.16,0xe0e0d8,x+s,6.75,z,0,0,0,5)}
/* vía: balasto, durmientes y rieles (tramos de 20 m para que cada sector cierre su malla) */
function rail18(x,z0,z1,bal){const D=K18.D,sp=D===0?2.2:D===1?1.2:.85,dz=z1<z0?-1:1;for(let z=z0;dz<0?z>z1:z<z1;z+=20*dz){const ze=dz<0?Math.max(z1,z-20):Math.min(z1,z+20),L=Math.abs(ze-z),cz=(z+ze)/2;if(bal!==false)bx18(3.4,.22,L,0x6a6660,x,.02,cz,0,0,0);for(const s of[-.72,.72])bx18(.09,.16,L,0x8a8680,x+s,.26,cz,0,0,0);for(let k=0;k<L;k+=sp)bx18(2.5,.1,.24,0x3a2a1c,x,.16,z+dz*(k+sp/2),0,0,0,'c')}}
function railD18(x0,z0,x1,z1){const dx=x1-x0,dz=z1-z0,L=Math.hypot(dx,dz),ry=Math.atan2(dx,dz);for(const s of[-.72,.72])bx18(.09,.16,L,0x8a8680,(x0+x1)/2+s*Math.cos(ry),.26,(z0+z1)/2-s*Math.sin(ry),0,ry,0);for(let k=0;k<L;k+=1.4)bx18(2.5,.1,.24,0x3a2a1c,x0+dx*k/L,.16,z0+dz*k/L,0,ry,0,'c')}
/* camino de tierra con huellas */
function road18(pts,w){for(let i=0;i<pts.length-1;i++){const [x0,z0]=pts[i],[x1,z1]=pts[i+1],L=Math.hypot(x1-x0,z1-z0),ry=Math.atan2(x1-x0,z1-z0),n=Math.ceil(L/24);for(let k=0;k<n;k++){const t=(k+.5)/n,x=x0+(x1-x0)*t,z=z0+(z1-z0)*t;bx18(w,.1,L/n+.6,0x8e8a82,x,.0,z,0,ry,0);if(K18.D>0)for(const s of[-1,1])bx18(.5,.1,L/n+.6,0x6e6a62,x+s*1.1*Math.cos(ry),.012,z-s*1.1*Math.sin(ry),0,ry,0)}}}
/* tanque cilíndrico de almacenamiento con escalera, baranda y anillos */
function tank18(x,z,r,h,col){const D=K18.D,sg=D===0?12:18;cy18(r,r,h,col,x,h/2,z,0,0,0,sg);pa(Q18(x,z),gCone(r+.2,r*.25,sg),shade(col,.85),X18+x,h+r*.125,z);cy18(r+.6,r+.6,.4,0x5a5650,x,.2,z,0,0,0,sg,'c');
 if(D>0){for(let y=h/4;y<h;y+=h/4)cy18(r+.04,r+.04,.12,shade(col,.8),x,y,z,0,0,0,sg);for(let i=0;i<(D>1?16:8);i++){const a=i/(D>1?16:8)*6.283;bx18(.06,1,.06,0x3a3a36,x+Math.cos(a)*(r-.2),h+.5,z+Math.sin(a)*(r-.2))}cy18(r-.15,r-.15,.06,0x3a3a36,x,h+1,z,0,0,0,sg)}
 const lx=x-r-.25;for(const s of[-.25,.25])bx18(.07,h+1,.07,0x2a2a28,lx,(h+1)/2,z+s);for(let y=.4;y<h;y+=D>0?.5:1.2)bx18(.06,.06,.5,0x2a2a28,lx,y,z);if(D>0)for(let y=2.5;y<h;y+=1.2)cy18(.4,.4,.05,0x2a2a28,lx-.15,y,z,0,0,1.5708,6);
 cy18(.3,.3,2,0x3a3a36,x+r+.6,1,z,0,0,1.5708,6);bx18(.6,.6,.6,0x6a2a1a,x+r+1.4,.6,z);if(D>1)for(let i=0;i<5;i++)bx18(.25,h*.6,.03,shade(col,.65),x+Math.cos(i*1.3+2)*r*1.01,h*.6,z+Math.sin(i*1.3+2)*r*1.01,0,-(i*1.3+2)+1.5708,0);
 ob18(x,z,r*.92,r*.92,h);K18.tanks.push(pt18(x,z,{r,h}));for(const a of[0,1.57,3.14,4.71])cv18(x+Math.cos(a)*(r+1.4),z+Math.sin(a)*(r+1.4),1.5)}
/* torre de celosía (mástil de radio) */
function lattice18(x,z,H,w,col){for(const a of[-1,1])for(const b of[-1,1])bm18(col,x+a*w,0,z+b*w,x+a*w*.25,H,z+b*w*.25,.12);for(let y=2.5;y<H;y+=2.5){const k=1-y/H*.75,k2=1-(y+2.5)/H*.75;for(const a of[-1,1]){bm18(col,x-w*k,y,z+a*w*k,x+w*k2,Math.min(H,y+2.5),z+a*w*k2,.05);bm18(col,x+a*w*k,y,z-w*k,x+a*w*k2,Math.min(H,y+2.5),z+w*k2,.05)}}}
/* casco simple (botes amarrados, buques lejanos) */
/* =====================================================================
   v38 · utilidades propias
   ===================================================================== */
const SN18=0xe2e7ee,ZD18=[-167,-177],ZR18=[-819,-843];
const sm18=t=>t<=0?0:t>=1?1:t*t*(3-2*t);
/* Cota 214: loma suave con cima plana a y≈6 (la usan floorAt y el terreno) */
function floor18(x,z){const d=Math.hypot(x-70,z+250);return d<50?6*sm18((50-d)/38):0}
function hT18(x,z){let y=floor18(x,z);const ex=Math.max(0,Math.abs(x)-335),ez=Math.max(0,z-135,-935-z);
 if(ex>0||ez>0){const k=Math.hypot(ex,ez);y+=k*.11*(1+.4*Math.sin(x*.013+z*.009))+(k>40?14*(.6+.4*Math.sin(x*.021)*Math.sin(z*.017))*sm18((k-40)/90):0)}
 const lx=(x+200)/52,lz=z/40,l=lx*lx+lz*lz;if(l<1.4)y-=.45*sm18((1.4-l)/.5);return y}
function tex18(k){const c=document.createElement('canvas');c.width=c.height=128;const x=c.getContext('2d');
 if(k==='b'){x.fillStyle='#bdbdbd';x.fillRect(0,0,128,128);for(let r=0;r<16;r++)for(let i=0;i<5;i++){const v=200+RN18()*55|0;x.fillStyle='rgb('+v+','+v+','+v+')';x.fillRect(((i*28+(r%2)*14)%140)-6,r*8+1,26,6)}}
 else{const g=x.createRadialGradient(64,64,0,64,64,64);g.addColorStop(0,'rgba(255,255,255,.9)');g.addColorStop(.5,'rgba(255,255,255,.35)');g.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=g;x.fillRect(0,0,128,128)}
 const t=new T.CanvasTexture(c);t.wrapS=t.wrapT=T.RepeatWrapping;return t}
/* muro recto alineado a un eje, con almenas opcionales y nieve encima */
function wl18(x0,z0,x1,z1,h,t,col,m,o){o=o||{};const ax=Math.abs(x1-x0)>=Math.abs(z1-z0),L=ax?Math.abs(x1-x0):Math.abs(z1-z0),cx=(x0+x1)/2,cz=(z0+z1)/2,y0=o.y0||0,sw=ax?L:t,sd=ax?t:L;if(L<.05)return;
 bx18(sw,h,sd,col,cx,y0+h/2,cz,0,0,0,m);if(!o.noOb)ob18(cx,cz,sw/2,sd/2,y0+h+(o.po?0:0),y0);
 if(o.cren&&K18.D>0){const n=Math.max(1,Math.floor(L/2.4));for(let i=0;i<n;i++){const u=-L/2+(i+.5)*L/n;bx18(ax?1.2:t,1.1,ax?t:1.2,col,ax?cx+u:cx,y0+h+.55,ax?cz:cz+u,0,0,0,m);bx18(ax?1.25:t+.08,.1,ax?t+.08:1.25,SN18,ax?cx+u:cx,y0+h+1.14,ax?cz:cz+u)}}
 if(o.snow!==false)bx18(sw+.08,.12,sd+.08,SN18,cx,y0+h+.06,cz)}
/* muro con vanos [centro,ancho] a lo largo de su eje */
function wlg18(x0,z0,x1,z1,gaps,h,t,col,m,o){const ax=Math.abs(x1-x0)>=Math.abs(z1-z0),a0=ax?Math.min(x0,x1):Math.min(z0,z1),a1=ax?Math.max(x0,x1):Math.max(z0,z1);let s=a0;
 for(const g of gaps.slice().sort((p,q)=>p[0]-q[0])){const e=g[0]-g[1]/2;if(e>s)ax?wl18(s,z0,e,z0,h,t,col,m,o):wl18(x0,s,x0,e,h,t,col,m,o);s=Math.max(s,g[0]+g[1]/2)}
 if(a1>s)ax?wl18(s,z0,a1,z0,h,t,col,m,o):wl18(x0,s,x0,a1,h,t,col,m,o)}
/* torre de muralla cuadrada */
function twr18(x,z,s,h,col){bx18(s,h,s,col,x,h/2,z,0,0,0,'c');bx18(s+.5,.5,s+.5,shade(col,.85),x,h-.2,z,0,0,0,'c');ob18(x,z,s/2,s/2,h+1);
 for(const k of[-1,1]){wl18(x-s/2,z+k*(s/2-.3),x+s/2,z+k*(s/2-.3),1,.6,col,'c',{y0:h,cren:true,noOb:true});wl18(x+k*(s/2-.3),z-s/2,x+k*(s/2-.3),z+s/2,1,.6,col,'c',{y0:h,cren:true,noOb:true})}
 bx18(s-.6,.15,s-.6,SN18,x,h+.08,z);if(K18.D>0)for(let y=3;y<h-2;y+=3.2)for(const k of[-1,1]){bx18(.25,.9,.1,0x1a1a1c,x+k*s*.2,y,z+s/2+.02);bx18(.25,.9,.1,0x1a1a1c,x+k*s*.2,y,z-s/2-.02)}}
/* cráter de obús: mancha de tierra y borde */
function crater18(x,z,r){cy18(r,r*.8,.05,0x5a524a,x,.03,z,0,0,0,9,'r');cy18(r*.55,r*.5,.06,0x3a342e,x,.05,z,0,0,0,7,'r');if(K18.D>0)for(let i=0;i<6;i++){const a=i*1.05+RN18();rk18(x+Math.cos(a)*r,.05,z+Math.sin(a)*r,.6+RN18()*.5,.22,.5,i%2?0x6a6058:0xd8dce2,0)}}
function hedge18(x0,z0,x1,z1){const ax=Math.abs(x1-x0)>=Math.abs(z1-z0),L=Math.hypot(x1-x0,z1-z0),cx=(x0+x1)/2,cz=(z0+z1)/2;bx18(ax?L:1.3,1.5,ax?1.3:L,0x34402e,cx,.75,cz,0,0,0,'r');bx18(ax?L+.1:1.1,.22,ax?1.1:L+.1,SN18,cx,1.55,cz);
 if(K18.D>0)for(let u=-L/2+1;u<L/2;u+=2.2)rk18(ax?cx+u:cx+(RN18()-.5)*.6,1.1+RN18()*.4,ax?cz+(RN18()-.5)*.6:cz+u,1,.6,1,RN18()<.5?0x3a4a34:0xd6dce2,0);ob18(cx,cz,ax?L/2:.65,ax?.65:L/2,1.5)}
function hay18(x,z,r){cy18(r,r,2.2,0xa08a5a,x,1.1,z,0,0,0,10,'r');pa(Q18(x,z),gCone(r+.15,1.8,10),0xd8dce2,X18+x,2.2+.9,z);ob18(x,z,r*.8,r*.8,3)}
function shrine18(x,z){cy18(.12,.14,3.4,0x4a3a28,x,1.7,z,0,0,0,6);bx18(.7,.6,.6,0x5a4430,x,3.5,z);pa(Q18(x,z),gCone(.62,.7,4),0xd8dce2,X18+x,4.15,z,0,.785,0);bx18(.04,.5,.04,0x2a2018,x,4.7,z);bx18(.3,.04,.04,0x2a2018,x,4.8,z);ob18(x,z,.25,.25,3)}
function birch18(x,z,s){cy18(.1*s,.16*s,7*s,0xd8d4cc,x,3.5*s,z,0,0,(RN18()-.5)*.08,6,'r');if(K18.D>0){for(let i=0;i<4;i++)bx18(.1,.1,.1,0x1a1a1a,x,1+i*1.4,z+.12*s);for(let i=0;i<5;i++){const a=i*1.3+RN18(),y=(3.5+i*.8)*s;bm18(0x6a5a4a,x,y,z,x+Math.cos(a)*1.6*s,y+1.3*s,z+Math.sin(a)*1.6*s,.06)}}ob18(x,z,.2,.2,5)}
function drum18(x,z,n){for(let i=0;i<n;i++)cy18(.3,.3,.9,i%3?0x3a4a3a:0x6a3a2a,x+(i%3)*.65,.45,z+Math.floor(i/3)*.65,0,0,0,8,'c');ob18(x+.65,z+.3,1.1,.7,.9)}
function crates18(x,z,n,col){for(let i=0;i<n;i++)bx18(1,.7,.7,col||0x5a4a32,x+(i%3)*1.05,.35+Math.floor(i/6)*.7,z+Math.floor(i/3)%2*.75,0,(RN18()-.5)*.1,0,'c');ob18(x+1.05,z+.37,1.6,.8,n>6?1.4:.7)}
function logs18(x,z,L,ry){const c=Math.cos(ry||0),s=Math.sin(ry||0);for(let r=0;r<3;r++)for(let i=0;i<4-r;i++){const o=(i-(3-r)/2)*.5;cy18(.24,.24,L,0x6a4a30,x+o*c,.25+r*.42,z-o*s,1.5708,ry||0,0,7,'r')}bx18(1.6,.1,L,SN18,x,1.5,z,0,ry||0,0);ob18(x,z,Math.abs(c)*1+Math.abs(s)*L/2,Math.abs(s)*1+Math.abs(c)*L/2,1.4)}
function tent18(x,z,ry,col){ge18(gTri17(),col||0x5a5e44,x,0,z,0,ry||0,0,4,2.3,3.4,'r');bx18(4.1,.08,1.6,SN18,x,1.85,z,0,ry||0,0);ob18(x,z,Math.abs(Math.cos(ry||0))*1.8+Math.abs(Math.sin(ry||0))*2,Math.abs(Math.sin(ry||0))*1.8+Math.abs(Math.cos(ry||0))*2,1.8)}
/* escalera de peldaños volados (convención v37: caja pisable a h+.45) */
function stairT18(x0,z0,dx,dz,n,base,F,wide,col){const ax=Math.abs(dx)>Math.abs(dz),run=Math.abs(ax?dx:dz),r=(F-base)/n;col=col||0x6a5440;
 for(let i=0;i<n;i++){const x=x0+dx*i,z=z0+dz*i,w=base+(i+1)*r,sw=ax?run+.02:wide,sd=ax?wide:run+.02;bx18(sw,.18,sd,col,x,w-.09,z,0,0,0,'r');const b=ob18(x,z,sw/2,sd/2,w-.45,w-.8,true)}
 const Lh=n*run,Rv=n*r,len=Math.hypot(Lh,Rv),a=Math.atan2(Rv,Lh),xm=x0+dx*(n-1)/2,zm=z0+dz*(n-1)/2,ym=base+Rv/2-.3;
 if(ax)bx18(len,.2,.2,shade(col,.8),xm,ym,zm+(wide/2-.1),0,0,dx>0?a:-a,'r');else bx18(.2,.2,len,shade(col,.8),xm+(wide/2-.1),ym,zm,dz<0?a:-a,0,0,'r')}
function slab18(x0,x1,z0,z1,F,col){bx18(x1-x0,.3,z1-z0,col||0x5a4a3a,(x0+x1)/2,F-.15,(z0+z1)/2,0,0,0,'r');return ob18((x0+x1)/2,(z0+z1)/2,(x1-x0)/2+.02,(z1-z0)/2+.02,F-.45,F-.4)}
/* casas de relleno de manzana: piedra borgoñona ('st') o ladrillo de pueblo ferroviario ('br') */
const RES18=[];function res18(x0,x1,z0,z1){RES18.push([Math.min(x0,x1),Math.max(x0,x1),Math.min(z0,z1),Math.max(z0,z1)])}
function free18(x0,x1,z0,z1){for(const r of RES18)if(x0<r[1]&&x1>r[0]&&z0<r[3]&&z1>r[2])return false;return true}
function hs18(o,sty){const st=sty==='st',P=RP18,fl=o.fl||2+(P()<.35?1:0);const b={x:o.x,z:o.z,a:o.a||0,w:o.w,d:o.d,fl,h:fl*3.3+.5,faces:o.faces,doors:o.doors||[],cv:false,lit:.14,int:o.int,sec:o.sec};
 if(st)Object.assign(b,{wall:[0xb9ae96,0xa99f8a,0xc4b89e,0x9e9483][P()*4|0],roof:0xd4d9e0,trim:0xd6ccb4,rh:3.4+P()*1.6,ch:[[o.w*.3*(P()<.5?-1:1),0]],chC:0x8a7a68,shut:[0x5a6e7a,0x6a4a3a,0x7a8a6a][P()*3|0],ws:3,plinth:0x6a6258,mat:'c'});
 else Object.assign(b,{wall:[0x8e4632,0x9a5038,0x7e3e2c,0xa0583e][P()*4|0],roof:0xcfd4da,trim:0xd8ccb0,flat:true,ws:2.6,wh:1.6,ww:.9,plinth:0x5a5450,mat:'b',ch:P()<.5?[[o.w*.3,o.d*.25]]:[],chC:0x7a3e2c});
 if(o.x0!==undefined)Object.assign(b,o.ex||{});house18(b);return b}
function row18(x0,x1,z0,z1,face,sty,o){o=o||{};const ns=face==='n'||face==='s',dd=10.5,P=RP18;let p=ns?x0:z0+dd+1;const end=ns?x1:z1-dd-1;let k=0;
 while(p<end-5){let w=8+P()*5;if(end-p-w<6)w=end-p;if(k>0&&P()<.13){p+=3.2;k++;continue}const d=9.5+P()*2,s=sty==='mix'?(P()<.5?'st':'br'):sty;let x,z,a,fc;
  if(face==='n'){x=p+w/2;z=z0+d/2;a=0;fc='n'}else if(face==='s'){x=p+w/2;z=z1-d/2;a=0;fc='s'}else if(face==='w'){x=x0+d/2;z=p+w/2;a=Math.PI/2;fc='s'}else{x=x1-d/2;z=p+w/2;a=Math.PI/2;fc='n'}
  /* con a=π/2: u→−z, v→+x: la cara 's' mira al +x... la calle oeste (x0) necesita 'n' */
  if(face==='w')fc='n';if(face==='e')fc='s';
  const rx=ns?w/2:d/2,rz=ns?d/2:w/2;if(free18(x-rx,x+rx,z-rz,z+rz)){hs18({x,z,a,w,d,faces:fc+(P()<.3?(fc==='n'?'s':'n'):''),doors:[[fc,(P()-.5)*w*.4,1.4,0]]},s);res18(x-rx,x+rx,z-rz,z+rz);
   const cs=face==='n'?[[x-rx-.9,z0-1],[x+rx+.9,z0-1]]:face==='s'?[[x-rx-.9,z1+1],[x+rx+.9,z1+1]]:face==='w'?[[x0-1,z-rz-.9],[x0-1,z+rz+.9]]:[[x1+1,z-rz-.9],[x1+1,z+rz+.9]];if(k%2===0)for(const c of cs)cv18(c[0],c[1],1.2)}
  p+=w+(P()<.25?.6:0);k++}}
function block18(x0,x1,z0,z1,sty,edges){for(const e of edges||'nswe')row18(x0,x1,z0,z1,e,sty)}
/* bosque: abeto (0) y pino silvestre (1), instanciados por región con esfera de recorte propia */
function treeGeo18(kind,D){const pb=PB();
 if(kind===0){pa(pb,new T.CylinderGeometry(.12,.24,3,5,1,true),0x4a3a2a,0,1.5,0);const n=D>1?4:D>0?3:2;for(let i=0;i<n;i++){const t=i/n,r=2.9*(1-t*.72),h=4.4-t*1.6,y=2+t*7.6;pa(pb,new T.ConeGeometry(r,h,7,1,true),[0x24382a,0x2a4030,0x30462e][i%3],0,y+h/2,0,0,i*.4,0);if(D>0)pa(pb,new T.ConeGeometry(r*.78,h*.42,7,1,true),0xe8edf3,0,y+h*.62,0,0,i*.4+.2,0)}}
 else{pa(pb,new T.CylinderGeometry(.14,.26,10,5,1,true),0x8a5a3a,0,5,0);const ig=new T.IcosahedronGeometry(1,0);pa(pb,ig,0x2e4630,0,10.2,0,0,0,0,2.6,1.3,2.6);if(D>0){pa(pb,ig,0x34502e,1.2,8.8,.6,0,1,0,1.6,.9,1.6);pa(pb,ig,0xe4e9ef,.1,10.9,0,0,.5,0,2.2,.6,2.2)}}
 const g=pbGeo(pb);g.deleteAttribute('uv');return g}
function trees18(D){const L=W18.tr;if(!L)return;const reg={};for(const t of L){const r=(t[1]>-110?'S':t[0]<0?'W':'E')+t[3];(reg[r]||(reg[r]=[])).push(t)}
 const mat=new T.MeshLambertMaterial({vertexColors:true}),m4=new T.Matrix4(),q=new T.Quaternion(),e=new T.Euler(),v=new T.Vector3(),sc=new T.Vector3(),c=new T.Color(),base=[treeGeo18(0,D),treeGeo18(1,D)];K18.trees=0;
 for(const k in reg){const a=reg[k],kind=+k[1],g=base[kind].clone();let x0=1e9,x1=-1e9,z0=1e9,z1=-1e9;for(const t of a){x0=Math.min(x0,t[0]);x1=Math.max(x1,t[0]);z0=Math.min(z0,t[1]);z1=Math.max(z1,t[1])}
  g.boundingSphere=new T.Sphere(new T.Vector3(X18+(x0+x1)/2,6,(z0+z1)/2),Math.hypot(x1-x0,z1-z0)/2+20);const im=new T.InstancedMesh(g,mat,a.length);
  a.forEach((t,i)=>{e.set((RN18()-.5)*.06,RN18()*6.28,(RN18()-.5)*.06);q.setFromEuler(e);v.set(X18+t[0],hT18(t[0],t[1])-.15,t[1]);sc.set(t[2]*(.9+RN18()*.2),t[2],t[2]*(.9+RN18()*.2));m4.compose(v,q,sc);im.setMatrixAt(i,m4);c.setRGB(1,1,1).multiplyScalar(.82+RN18()*.3);im.setColorAt(i,c)});
  im.instanceMatrix.needsUpdate=true;if(im.instanceColor)im.instanceColor.needsUpdate=true;scene.add(im);W18.ms.push(im);K18.trees+=a.length}}
function tree18(x,z,s,kind){W18.tr.push([x,z,s,kind||0])}
/* =====================================================================
   CONSTRUCCIÓN
   ===================================================================== */
function dSeg18(x,z,P){let b=1e9;for(let i=0;i<P.length-1;i++){const [ax,az]=P[i],[bx,bz]=P[i+1],dx=bx-ax,dz=bz-az,L2=dx*dx+dz*dz||1,t=Math.max(0,Math.min(1,((x-ax)*dx+(z-az)*dz)/L2));b=Math.min(b,Math.hypot(x-ax-dx*t,z-az-dz*t))}return b}
function buildVarn18(){if(W18.built)return;W18.built=true;const X=X18,D=(G.detail===undefined?1:+G.detail);W18.tr=[];
 const P=pt18;
 K18={D,obs:0,cover:[],tanks:[],
  bounds:{x0:-320,x1:320,z0:120,z1:-920},
  start:P(0,40,{yaw:0}),frustClear:P(30,20,{r:28}),frustSlots:[P(18,10,{ry:0}),P(26,8,{ry:0}),P(34,8,{ry:0}),P(42,10,{ry:0}),P(22,32,{ry:Math.PI}),P(38,32,{ry:Math.PI})],lake:P(-200,0,{rx:59,rz:46}),cabin:P(-75,-5),
  line:{trenchZ:-190,trench2Z:-232,wireZ:[-148,-158],ditch:{z0:ZD18[0],z1:ZD18[1]},ditchCross:P(-35,-172,{w:8}),bunkers:[],dugouts:[],gaps:[P(-35,-190),P(0,-190)]},
  hill:P(70,-250,{y:6,r:50}),hillOP:P(70,-250,{y:6}),
  farm:P(-60,-360),farmHouse:P(-70,-368),barn:P(-46,-370),dovecote:P(-78,-350),battery:P(-40,-405,{pits:[]}),aaNests:[],chapel:P(150,-300),
  wallZ:-540,gate:P(0,-540),railGate:P(-130,-540),eastGate:P(170,-700),plaza:P(0,-650,{x0:-22,x1:22,z0:-628,z1:-672}),fountain:P(0,-650),
  church:P(-46,-638),tower:P(-26,-638,{y:14,door:[-21.6,-638],belfry:[-26.5,14,-638]}),station:P(-112,-692),platform:P(-124.3,-692),yard:P(-150,-700),workshop:P(-152,-742),waterTower:P(-138.5,-705),
  factory:P(110,-690),barracks:P(110,-572),citadel:P(0,-790),tunnel:P(0,-790,{x0:-3.6,x1:3.6,z0:-768,z1:-812,doors:[P(-4.5,-774),P(4.5,-774)]}),keep:P(0,-790),
  commTower:P(25,-795,{h:30,stage:0}),flagpole:P(-20,-792,{y:12.5}),
  bridges:[P(0,-831,{kind:'road',z0:ZR18[0],z1:ZR18[1],w:9}),P(-130,-831,{kind:'rail',z0:ZR18[0],z1:ZR18[1],w:4})],river:{z0:ZR18[0],z1:ZR18[1],y:-2.4},
  airfield:P(230,-720,{strip:[[225,-640],[225,-805]],hangars:[],roosts:[]}),north:P(0,-880),end:P(0,-910),
  rail:{x:-130,z0:120,z1:-920},road:{x:0},collapse:{casa:P(14,-617),fabrica:P(88,-690)},
  routes:{},sectors:{}};
 sky18('dawn');
 /* --------------------------- TERRENO (3 franjas + foso + río) --------------------------- */
 {const col=(x,z,y,c,c2)=>{const n=Math.sin(x*.05+z*.031)+Math.sin(x*.013-z*.021)*.8+Math.sin(x*.21+z*.17)*.25;c.setHex(n>.4?0xd4dae2:n>-.5?0xc8d0da:0xbcc6d2);
   if(Math.abs(x)<6&&z<125)c.lerp(c2.setHex(0x9a968e),.55);if(Math.abs(x+130)<3)c.lerp(c2.setHex(0x8a8680),.5);
   if(z<-182&&z>-245&&x>-235&&x<225&&n<.3)c.lerp(c2.setHex(0x8a8276),.35+.2*Math.sin(x*.3));
   if(x>-172&&x<172&&z<-541&&z>-819)c.lerp(c2.setHex(0xb0aeaa),.45);if(x>205&&x<245&&z<-635&&z>-810)c.lerp(c2.setHex(0xe8ecf0),.6);
   if(Math.hypot(x-30,z-20)<26)c.lerp(c2.setHex(0xa8a49a),.35);if(y>3&&Math.abs(x)>330){const b=Math.sin(x*.07+z*.05);if(b>.5)c.lerp(c2.setHex(0x6a6a6c),.5)}
   c.multiplyScalar(.93+R()*.1)};
  const W=1504,NX=188,MT=new T.MeshLambertMaterial({vertexColors:true,map:tex17('r')});
  const strip=(za,zb,sz)=>{const nz=Math.max(1,Math.round((za-zb)/sz)),g=new T.PlaneGeometry(W,za-zb,NX,nz);g.rotateX(-Math.PI/2);g.translate(0,0,(za+zb)/2);const p=g.attributes.position,uv=g.attributes.uv,cl=new Float32Array(p.count*3),c=new T.Color(),c2=new T.Color();
   for(let i=0;i<p.count;i++){const x=p.getX(i),z=p.getZ(i),y=hT18(x,z);p.setY(i,y);uv.setXY(i,x/7,z/7);col(x,z,y,c,c2);cl.set([c.r,c.g,c.b],i*3)}g.setAttribute('color',new T.BufferAttribute(cl,3));g.computeVertexNormals();const m=new T.Mesh(g,MT);m.position.x=X;m.matrixAutoUpdate=false;m.updateMatrix();scene.add(m);W18.ms.push(m)};
  strip(520,ZD18[0],8);strip(ZD18[1],ZR18[0],6);strip(ZR18[1],-1350,10);
  /* zanjas: perfil [fracción, profundidad, color] */
  const trough=(za,zb,prof)=>{const pos=[],cl=[],idx=[],c=new T.Color(),NP=prof.length;for(let i=0;i<=NX;i++){const x=-W/2+i*8;for(const [f,dy,hc] of prof){const z=za+(zb-za)*f,yl=hT18(x,f<.5?za:zb);pos.push(x,yl+dy,z);c.setHex(hc).multiplyScalar(.9+R()*.15);cl.push(c.r,c.g,c.b)}}
   for(let i=0;i<NX;i++)for(let j=0;j<NP-1;j++){const a=i*NP+j,b=a+1,cc=a+NP,d=cc+1;idx.push(a,b,cc,b,d,cc)}const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.setAttribute('color',new T.Float32BufferAttribute(cl,3));g.setIndex(idx);g.computeVertexNormals();
   const m=new T.Mesh(g,new T.MeshLambertMaterial({vertexColors:true,side:T.DoubleSide}));m.position.x=X;m.matrixAutoUpdate=false;m.updateMatrix();scene.add(m);W18.ms.push(m)};
  trough(ZD18[0],ZD18[1],[[0,0,0xc8d0da],[.12,-.3,0x8a8a88],[.3,-2.2,0x5a4e42],[.4,-2.7,0xb8c0c8],[.6,-2.7,0xb8c0c8],[.7,-2.2,0x5a4e42],[.88,-.3,0x8a8a88],[1,0,0xc8d0da]]);
  trough(ZR18[0],ZR18[1],[[0,0,0xc8d0da],[.05,-.6,0x8a8478],[.14,-2.6,0x5a5248],[.3,-4,0x2a3034],[.7,-4,0x2a3034],[.86,-2.6,0x5a5248],[.95,-.6,0x8a8478],[1,0,0xc8d0da]]);
  /* agua del río con témpanos, hielo del lago */
  {const t=tex17('w');t.repeat.set(60,1.2);const g=new T.PlaneGeometry(W,ZR18[0]-ZR18[1]-1.5);g.rotateX(-Math.PI/2);const m=new T.Mesh(g,new T.MeshLambertMaterial({color:0x56646c,map:t}));m.position.set(X,-2.4,(ZR18[0]+ZR18[1])/2);scene.add(m);W18.ms.push(m);W18.river=m}
  {const g=new T.CircleGeometry(1,40);g.rotateX(-Math.PI/2);const t=tex17('w');t.repeat.set(6,6);const m=new T.Mesh(g,new T.MeshLambertMaterial({color:0xb4c6d2,map:t}));m.scale.set(59,1,46);m.position.set(X-200,-.04,0);scene.add(m);W18.ms.push(m);W18.ice=m}}
 /* obstáculos del foso y del río (bajos + muro solo-jugador para no saltarlos) */
 {const block=(z0,z1,gaps)=>{const zc=(z0+z1)/2,hd=Math.abs(z1-z0)/2-.6;let s=-340;for(const g of gaps.concat([[350,0]])){const e=g[0]-g[1]/2;if(e>s){ob18((s+e)/2,zc,(e-s)/2,hd,.6);const o=ob18((s+e)/2,zc,(e-s)/2,hd,4,.6);o.po=true}s=g[0]+g[1]/2}};
  block(ZD18[0],ZD18[1],[[-35,8]]);block(ZR18[0],ZR18[1],[[-130,4.2],[0,9]])}

 /* ================== ACTO I · BOSQUE DE DRAVIK ================== */
 SEC18=null;
 const paths=[[[0,130],[0,-112]],[[-150,20],[70,20]],[[30,20],[110,-40],[150,-104]],[[-10,-10],[-90,-60],[-125,-104]],[[-130,130],[-130,-112]],[[-75,-5],[-75,20]]];
 const clearD=(x,z)=>{let d=1e9;for(const p of paths)d=Math.min(d,dSeg18(x,z,p));d=Math.min(d,Math.hypot(x-30,z-20)-30,Math.hypot(x,z-40)-12,Math.hypot(x+75,z+5)-10);const lx=(x+200)/64,lz=z/52;d=Math.min(d,(Math.sqrt(lx*lx+lz*lz)-1)*50);return d};
 {const CS=16;for(let zc=112;zc>-104;zc-=CS){let run=null;const flush=()=>{if(run){ob18((run[0]+run[1])/2,zc,(run[1]-run[0])/2-1.5,CS/2-1.5,6);run=null}};
   for(let xc=-312;xc<=312;xc+=CS){const n=Math.sin(xc*.031+1)*Math.sin(zc*.027+2)+.6*Math.sin(xc*.07-zc*.05),cd=clearD(xc,zc);
    if(n>-.25&&cd>CS*.75+5){if(run&&run[1]>=xc-CS/2-.01)run[1]=xc+CS/2;else{flush();run=[xc-CS/2,xc+CS/2]}
     for(let i=0;i<3;i++)for(let j=0;j<3;j++){const x=xc-CS/2+CS*(i+.5)/3+(RP18()-.5)*2.4,z=zc-CS/2+CS*(j+.5)/3+(RP18()-.5)*2.4,s=.75+RP18()*.55,k=RP18()<.4?1:0;if(D===0&&(i+j)%2)continue;tree18(x,z,s,k)}}
    else{flush();for(let t=0;t<2;t++){const x=xc+(RP18()-.5)*CS,z=zc+(RP18()-.5)*CS,s=.7+RP18()*.5,k=RP18()<.4?1:0;if(RP18()<.42&&clearD(x,z)>4.5){tree18(x,z,s,k);ob18(x,z,.32,.32,6)}}}}
   flush()}}
 /* lago helado: muelle, cabaña de pesca, juncos, agujero en el hielo */
 {const L=K18.lake;bx18(2.2,.2,16,0x5a4a38,L.x+52,.1,L.z+6,0,.3,0,'r');for(let i=0;i<5;i++)for(const s of[-1,1])cy18(.1,.1,1.2,0x3a2e22,L.x+52+s*.9+(i*3-6)*.3,.1,L.z+6+i*3-6,0,0,0,5);
  house18({x:L.x+40,z:L.z-34,w:4,d:3.5,h:2.4,wall:0x5a4030,roof:0xd8dde4,trim:0x6a5038,rh:1.6,doors:[['s',0,.9,0]],faces:'s',mat:'r',cv:false,noCan:true});
  cy18(1.4,1.4,.06,0x1a2a30,L.x+8,.0,L.z+10,0,0,0,12,'r');ob18(L.x+8,L.z+10,1.1,1.1,.6);
  if(D>0)for(let i=0;i<40;i++){const a=RN18()*6.28,x=L.x+Math.cos(a)*58,z=L.z+Math.sin(a)*45;if(x>L.x+45&&Math.abs(z)<14)continue;bx18(.06,.8+RN18()*.6,.06,0x8a7a52,x,.4,z,(RN18()-.5)*.3,0,(RN18()-.5)*.3,'r')}
  for(const [x,z] of[[-150,30],[-146,-26],[-160,40],[-245,38],[-258,-20],[-140,10]])birch18(x,z,.9+RN18()*.3)}
 /* claro FRUST: tiendas, troncos, bidones, cocina de campaña, redes, rampa de tablones */
 {const C=K18.frustClear;tent18(C.x-18,C.z-10,0);tent18(C.x-18,C.z-2,0);tent18(C.x-12,C.z+14,1.57);tent18(C.x+20,C.z+16,.3,0x4a4e3a);logs18(C.x+24,C.z-12,7,.4);logs18(C.x-6,C.z+22,6,1.5);drum18(C.x+14,C.z-18,8);drum18(C.x+26,C.z+4,5);crates18(C.x-4,C.z-20,9,0x4a5a3a);
  camo18(C.x-2,C.z+4,12,8,3.2,0);camo18(C.x+16,C.z+2,10,7,3.2,.1);cy18(.5,.6,1,0x3a3a36,C.x-8,.5,C.z+6,0,0,0,8,'c');cy18(.12,.12,1.6,0x2a2a28,C.x-8,1.6,C.z+6,0,0,0,6,'c');ob18(C.x-8,C.z+6,.6,.6,1.2);
  bx18(2,.3,5,0x6a5236,C.x+30,.3,C.z-2,.12,0,0,'r');shrine18(8,62);shrine18(-6,-96)}
 /* cabaña del leñador (interior transitable) y aserradero */
 house18({x:-75,z:-5,w:8,d:6,h:2.8,wall:0x5a4030,roof:0xd6dbe2,trim:0x6a5038,rh:2.2,int:true,doors:[['n',0,1.4],['s',1.5,1.2]],faces:'ns',ch:[[2.5,0]],chC:0x5a5a58,mat:'r',lit:.6});
 {logs18(-60,-14,8,0);logs18(-60,-20,8,0);bx18(6,3,4,0x5a4632,-90,1.5,8,0,0,0,'r');bx18(6.6,.2,4.6,SN18,-90,3.1,8,0,0,0);ob18(-90,8,3,2,3)}
 /* tierra de nadie: cráteres, tocones, carro quemado, pinos rotos */
 for(let i=0;i<26;i++){const x=-280+RP18()*560,z=-104-RP18()*40;crater18(x,z,1.6+RP18()*2.4)}
 for(let i=0;i<30;i++){const x=-300+RP18()*600,z=-100-RP18()*44;if(Math.abs(x)<7||Math.abs(x+35)<5)continue;const h=.6+RP18()*3;cy18(.22,.3,h,0x3a2e24,x,h/2,z,(RP18()-.5)*.3,0,(RP18()-.5)*.3,6,'r');if(h>1.5)ob18(x,z,.3,.3,h)}
 {bx18(2.2,.8,4,0x3a2e24,-22,.9,-122,0,.4,.15,'r');for(const s of[-1,1])cy18(.6,.6,.12,0x2a2420,-22+s*1.2,.6,-122,0,.4,1.57,10,'r');ob18(-22,-122,1.6,2.2,1.4);cv18(-20,-118,1.3)}
 /* ================== ACTO II · MURO DE VARN ================== */
 wire18(-320,320,-148,[[-35,9],[-130,6],[60,6],[175,6]]);wire18(-320,320,-158,[[-35,9],[-100,6],[95,6],[200,6]]);
 /* paso del foso: terraplén de tierra y fajinas; puente de vía volado */
 {const c=K18.line.ditchCross;bx18(8,2.7,11,0x6a5a48,c.x,-1.3,c.z,0,0,0,'r');bx18(8.2,.1,11,0xb8bcc2,c.x,.02,c.z,0,0,0,'r');for(const s of[-1,1])for(let i=0;i<4;i++)cy18(.25,.25,8,0x5a4a32,c.x,-.4-i*.5,c.z+s*5.3,0,0,1.5708,6,'r');
  for(const s of[-1,1])bx18(.4,.3,13,0x3a3a3a,-130+s*.72,-1.2,-172,s*.25,0,.3,'c');bx18(4,.6,4,0x5a5650,-130,-.4,ZD18[0]+1,0,0,0,'c');bx18(4,.6,4,0x5a5650,-130,-.4,ZD18[1]-1,0,0,0,'c')}
 /* trincheras en zigzag (rotas por la vía) */
 const bays=[...trench18(-236,-138,-190,{gF:[],gB:[]}),...trench18(-122,226,-190,{gF:[[-35,8],[0,6]],gB:[[-35,8],[0,6],[-115,3],[-5,3],[110,3]]})];K18.line.bays=bays;
 trench18(-226,-138,-232,{gF:[[-200,4]]});trench18(-122,14,-232,{gF:[[-35,8],[0,6],[-70,4]],gB:[[-35,8],[0,6]]});
 for(const [x,z] of[[-115,-203],[-5,-205],[110,-203]]){const b=casemate18(x,z,{name:1});K18.line.bunkers.push(P(x,z,{mg:P(b.mg[0],b.mg[1]),door:P(b.door[0],b.door[1])}))}
 for(const [x,z] of[[-160,-244],[-70,-245],[-25,-246]])K18.line.dugouts.push(dug18(x,z,{sign:true}));
 /* trincheras de comunicación: muretes de sacos zigzag norte-sur */
 for(const x of[-90,-50,40]){sb18(x-1.6,-196,x-1.6,-214,1.1);sb18(x+1.6,-196,x+1.6,-214,1.1)}
 /* Cota 214: puesto de observación en la cima (Y18 = altura del suelo) */
 {const H=K18.hill;Y18=6;ring18(H.x,H.z,9,1.2,0,.5);ring18(H.x+12,H.z+4,2.6,1.1,Math.PI,.55);
  for(const s of[-1,1])cy18(.14,.14,4.2,0x4a3a28,H.x-3+s*1.2,2.1,H.z+2,0,0,0,6,'r');bx18(3,.15,3,0x5a4632,H.x-3,4.2,H.z+2,0,0,0,'r');bx18(3.2,.9,.12,0x5a4632,H.x-3,4.7,H.z+.5,0,0,0,'r');bx18(3.3,.12,3.3,SN18,H.x-3,4.3,H.z+2);
  bx18(.6,1,.6,0xb8b4aa,H.x+3,.5,H.z-3,0,0,0,'c');bx18(.1,.06,.3,0x2a2a2a,H.x+3,.85,H.z-2.68);ob18(H.x+3,H.z-3,.3,.3,1);cy18(.3,.4,3.2,0x2a2218,H.x-6,1.6,H.z-5,.2,0,.1,6,'r');ob18(H.x-6,H.z-5,.35,.35,3);camo18(H.x+5,H.z+6,5,4,2,.3);Y18=0;
  for(let i=0;i<8;i++){const z=-203-i*4.2,y=floor18(70,z);bx18(3,.18,.3,0x4a3a28,70,y+.05,z,0,0,0,'r')}}
 for(let i=0;i<18;i++){const x=-260+RP18()*520,z=-262-RP18()*20;if(Math.hypot(x-70,z+250)<52)continue;crater18(x,z,1.4+RP18()*1.6)}
 /* ================== ACTOS III–IV · MESETA DE VARN ================== */
 /* granja borgoñona: casa (interior), granero (interior), palomar, cobertizo, pozo, muro con portón */
 {const F=K18.farm,SC=0xb8ab90;house18({x:-70,z:-368,w:12,d:8,h:6.4,fl:2,wall:SC,roof:0xd2d8e0,trim:0xd8ceb6,rh:4.6,int:true,doors:[['s',-2,1.4],['n',3,1.2]],faces:'nsw',ch:[[4,0]],chC:0x8a7a68,shut:0x5a6e7a,mat:'c',lit:.5,cv:false});
  house18({x:-46,z:-371,w:14,d:10,h:5.2,wall:0xa89c84,roof:0xd2d8e0,trim:0xcfc4ac,rh:4.4,int:true,doors:[['s',0,3.6],['n',-4,1.4]],faces:'',mat:'c',cv:false,noCan:true});
  {const x=-78,z=-350;cy18(2.6,2.7,8,SC,x,4,z,0,0,0,12,'c');pa(Q18(x,z),gCone(3.1,3.4,12),0xd2d8e0,X+x,9.7,z);for(let i=0;i<4;i++)bx18(.3,.3,.1,0x1a1a1a,x+Math.cos(i*1.57)*2.62,6.6,z+Math.sin(i*1.57)*2.62,0,-i*1.57,0,'c');ob18(x,z,2.1,2.1,8)}
  for(const s of[-1,1])cy18(.12,.12,3,0x4a3a28,-56+s*3,1.5,-352,0,0,0,6,'r');bx18(7,.2,4,0xd8dce2,-56,3.05,-352.5,.15,0,0,'r');crates18(-58,-353,4,0x6a5236);
  cy18(.9,.9,.9,0x8a8070,-60,.45,-358,0,0,0,10,'c');for(const s of[-1,1])cy18(.06,.06,1.6,0x3a3a3a,-60+s*.8,1.3,-358,0,0,0,5);bx18(1.8,.08,.08,0x3a3a3a,-60,2.1,-358);ob18(-60,-358,.9,.9,.9);
  wlg18(-84,-344,-36,-344,[[-62,6]],2.2,.7,0xa89f8a,'c');wlg18(-84,-380,-36,-380,[[-50,4]],2.2,.7,0xa89f8a,'c');wlg18(-84,-380,-84,-344,[[-366,3]],2.2,.7,0xa89f8a,'c');wl18(-36,-380,-36,-344,2.2,.7,0xa89f8a,'c');
  bx18(.4,2.8,.4,0x8a8070,-65.2,1.4,-344,0,0,0,'c');bx18(.4,2.8,.4,0x8a8070,-58.8,1.4,-344,0,0,0,'c');bx18(2.6,2,.1,0x5a4632,-66.5,1,-342.8,0,.6,0,'r');
  for(const [x,z] of[[-26,-350],[-28,-362],[-96,-372],[-98,-386],[-30,-332]])hay18(x,z,1.9);logs18(-88,-356,5,1.57)}
 /* batería FRUST: 4 pozos de cañón abiertos al sur, polvorín, puesto de mando */
 {const B=K18.battery;for(const [x,z] of[[-70,-405],[-50,-409],[-30,-409],[-10,-405]]){ring18(x,z,3.8,1.2,Math.PI,.55);B.pits.push(P(x,z));crates18(x-1,z+5.5,3,0x4a5a3a)}
  dug18(-40,-392,{sign:true,wood:true});camo18(-40,-420,8,6,2.6,0);bx18(2,.8,1,0x5a4632,-40,.4,-420,0,0,0,'r');ob18(-40,-420,1,.5,.8)}
 for(const [x,z] of[[-95,-420],[30,-385]]){ring18(x,z,2.6,1.1,Math.PI,.5);K18.aaNests.push(P(x,z))}
 /* setos, viñas en hileras, capilla en ruinas, camión destruido, cráteres */
 hedge18(20,-300,180,-300);hedge18(-200,-450,-18,-450);hedge18(18,-450,60,-450);hedge18(100,-320,100,-330);hedge18(100,-480,100,-500);hedge18(-150,-300,-60,-300);
 for(let i=0;i<20;i++){const x=40+i*3.2;for(const [z0,z1] of[[-335,-395],[-405,-470]]){const zc=(z0+z1)/2,L=z0-z1;bx18(.5,.35,L,0xd4dae2,x,.17,zc,0,0,0,'r');bx18(.03,.03,L,0x4a4a44,x,.75,zc,0,0,0,'r');if(D>0)for(let z=z1;z<z0;z+=D>1?2.5:5)cy18(.035,.04,1.1,0x3a2e22,x,.55,z,0,0,0,4,'r');ob18(x,zc,.3,L/2,.9)}}
 house18({x:150,z:-300,w:8,d:13,h:5,wall:0xa89c86,roof:0xd2d8e0,trim:0xcfc4ac,rh:4,int:true,doors:[['s',0,1.6],['n',0,1.4]],faces:'we',mat:'c',lit:0});
 {bx18(2.2,1.6,5.5,0x4a5040,20,1.1,-330,0,.5,.25,'c');bx18(2,1.4,1.8,0x3a4034,20+Math.sin(.5)*3.4,1.2,-330+Math.cos(.5)*3.4,0,.5,0,'c');for(const s of[-1,1])cy18(.45,.45,.3,0x1a1a1a,20+s*1.1,.45,-330,0,.5,1.57,8,'c');ob18(20,-330,2,3,1.8);cv18(23,-326,1.3)}
 for(let i=0;i<34;i++){const x=-280+RP18()*560,z=-285-RP18()*240;if(Math.abs(x+60)<30&&Math.abs(z+362)<26)continue;if(x>36&&x<106&&z<-330)continue;crater18(x,z,1.4+RP18()*2.2)}
 shrine18(-8,-300);shrine18(8,-505);
 for(let z=100;z>-920;z-=40)if(!(z<-535&&z>-830))pole18(-136,z);
 /* cinturones de bosque en los flancos de la meseta y la línea */
 const belt=(x0,x1,z0,z1,sp)=>{ob18((x0+x1)/2,(z0+z1)/2,(x1-x0)/2-2,(z0-z1)/2-2,6);for(let x=x0+sp/2;x<x1;x+=sp)for(let z=z1+sp/2;z<z0;z+=sp){if(D===0&&RP18()<.4){RP18();RP18();continue}tree18(x+(RP18()-.5)*sp*.6,z+(RP18()-.5)*sp*.6,.8+RP18()*.5,RP18()<.25?1:0)}};
 belt(-324,-262,-110,-280,7);belt(262,324,-110,-280,7);belt(-324,-232,-300,-530,7.5);belt(240,324,-300,-520,7.5);belt(-324,-182,-860,-930,8);belt(40,324,-880,-930,8);
 /* lejanía fuera de límites: bosque visual sin colisión */
 {const n=[700,1500,2400][Math.max(0,Math.min(2,D))];let k=0,t=0;while(k<n&&t<n*20){t++;const x=-650+RN18()*1300,z=420-RN18()*1720;const out=Math.abs(x)>335||z>132||z<-935;if(!out||(z<-805&&z>-860))continue;tree18(x,z,.8+RN18()*.6,RN18()<.3?1:0);k++}}
 /* ================== ACTO V · FALKENBRÜCK ================== */
 const WC=0x9a9488,BR=0x8e4632;
 /* reservas (las manzanas de relleno no las invaden) */
 res18(-64,-20,-648,-630);res18(-24,24,-674,-626);res18(6,22,-625,-609);res18(84,136,-602,-562);res18(84,140,-708,-672);
 res18(-21,-7,-583,-567);res18(-21,-7,-624,-608);res18(7,21,-698,-682);res18(-21,-7,-748,-732);
 /* murallas, torres, puertas */
 wlg18(-170,-540,170,-540,[[0,12],[-130,10]],7,2.5,WC,'c',{cren:true});wlg18(-170,-540,-170,-818,[],7,2.5,WC,'c',{cren:true});wlg18(170,-540,170,-818,[[-700,5]],7,2.5,WC,'c',{cren:true});
 for(const [x,z,s,h] of[[-170,-540,8,12],[170,-540,8,12],[-170,-818,8,12],[170,-818,8,12],[-9,-540,6,11],[9,-540,6,11],[-138,-540,5,10],[-122,-540,5,10],[-170,-680,6,10],[170,-760,6,10],[170,-694.5,4,9],[170,-705.5,4,9]])twr18(x,z,s,h,WC);
 bx18(12,3,3,WC,0,8.5,-540,0,0,0,'c');bx18(12.4,.15,3.4,SN18,0,10.1,-540);bx18(10,2.5,3,WC,-130,8.2,-540,0,0,0,'c');bx18(10.4,.15,3.4,SN18,-130,9.5,-540);
 if(D>0){for(const x of[-150,-100,-60,40,90,140])bx18(6+RN18()*5,3+RN18()*2,.2,0x84847e,x,2.5,-538.6,0,0,0,'c');bx18(1.6,1.2,.1,0x2a3a6a,-4,7.6,-538.4);bx18(1.6,1.2,.1,0x2a3a6a,4,7.6,-538.4)}
 wlg18(-170,-818.5,170,-818.5,[[-130,4.4],[0,9]],1.1,.6,0x7a766e,'c');
 /* calles empedradas con nieve sucia */
 for(const [x0,z0,x1,z1] of[[-7,-541,7,-767],[-170,-644,170,-656],[-89,-541,-81,-767],[56,-541,64,-767],[-170,-541,170,-549],[-89,-600,166,-608],[-89,-716,166,-724],[-170,-764,170,-770],[-170,-812,170,-818]])bx18(x1-x0,.06,Math.abs(z1-z0),0x8e8c86,(x0+x1)/2,.03,(z0+z1)/2,0,0,0,'c');
 /* plaza del mercado: fuente con columna, puestos, faroles */
 {bx18(44,.07,44,0x9a968e,0,.04,-650,0,0,0,'c');cy18(3.2,3.4,.8,0x9a9488,0,.4,-650,0,0,0,16,'c');cy18(2.8,2.8,.1,0xc8d4dc,0,.75,-650,0,0,0,16,'r');cy18(.45,.55,4.5,0xb0a890,0,2.6,-650,0,0,0,8,'c');bx18(.9,1.4,.9,0x5a6a62,0,5.5,-650,0,0,0,'c');ob18(0,-650,3,3,.8);cv18(0,-645.5,1.6);cv18(0,-654.5,1.6);
  for(const [x,z,r] of[[-16,-634,0],[-16,-666,0],[16,-634,0],[16,-666,0],[-17,-650,1.57],[17,-658,1.57]]){for(const a of[-1,1])for(const b of[-1,1])cy18(.06,.06,2.4,0x4a3a28,x+a*1.3,1.2,z+b*.8,0,0,0,5);for(let i=0;i<4;i++)bx18(.7,.08,2,i%2?0xd8d0c0:0x8a3a2a,x-1.05+i*.7,2.45,z,.15,0,0,'r');bx18(2.6,.9,.6,0x5a4632,x,.45,z+.5,0,0,0,'r');crates18(x-1,z-.9,2,0x6a5236);ob18(x,z+.5,1.3,.3,.9)}
  for(const [x,z] of[[-21,-629],[21,-629],[-21,-671],[21,-671],[-8,-560],[8,-560],[-8,-740],[8,-740]]){cy18(.08,.12,3.6,0x1a1a1a,x,1.8,z,0,0,0,6,'c');bx18(.4,.5,.4,0xffd890,x,3.8,z,0,0,0,'c');ob18(x,z,.15,.15,3.6)}}
 /* iglesia: nave con bancos (interior) y torre con escalera de 4 tramos hasta el campanario (y=14) */
 {const SC=0xb4a88e;house18({x:-46,z:-638,w:32,d:12,h:9,wall:SC,roof:0xcfd5dd,trim:0xd8ceb6,rh:6.5,int:true,doors:[['n',4,2.4],['e',0,1.8],['s',-8,1.4]],faces:'ns',ws:5,wh:3.2,ww:1.2,wy:4.6,mat:'c',lit:.4,cv:false});
  for(let i=0;i<7;i++){const x=-56+i*2.6;for(const z of[-641.2,-634.8]){bx18(.5,.9,3.4,0x5a3e28,x,.45,z,0,0,0,'r');ob18(x,z,.3,1.7,.9)}}bx18(2,1.1,4,0xd8d0c0,-60.4,.55,-638,0,0,0,'c');ob18(-60.4,-638,1,2,1.1);bx18(.1,2,.1,0xc8a040,-60.4,2,-638);bx18(.1,.1,1,0xc8a040,-60.4,2.5,-638);
  const ix0=-29.4,ix1=-22.6,iz0=-641.4,iz1=-634.6,TH=15.1;
  wl18(-30,-641.7,-22,-641.7,TH,.6,SC,'c');wl18(-30,-634.3,-22,-634.3,TH,.6,SC,'c');
  for(const x of[-29.7,-22.3]){wlg18(x,-641.4,x,-634.6,[[-638,1.8]],TH,.6,SC,'c');wl18(x,-638.9,x,-637.1,TH-2.4,.6,SC,'c',{y0:2.4,snow:false})}
  for(const [a,b] of[[-29.4,-641.4],[-23.8,-641.4],[-29.4,-635.8],[-23.8,-635.8]]){bx18(1.2,4,1.2,SC,a+.6,TH+2,b+.6,0,0,0,'c');ob18(a+.6,b+.6,.6,.6,TH+4,TH)}
  for(const [x,z,hw,hd] of[[-26,-641.7,4,.3],[-26,-634.3,4,.3],[-29.7,-638,.3,4],[-22.3,-638,.3,4]]){const o=ob18(x,z,hw,hd,TH+4,TH);o.po=true}
  bx18(9,.5,9,shade(SC,.8),-26,TH+4.2,-638,0,0,0,'c');pa(Q18(-26,-638),gCone(6,8.5,4),0x5a6a6e,X-26,TH+4.45+4.25,-638,0,.785,0);cy18(.06,.06,2.4,0x2a2a2a,-26,TH+14,-638,0,0,0,5);bx18(1.2,.08,.08,0x2a2a2a,-26,TH+14.5,-638);
  if(D>0){cy18(1.1,1.1,.12,0xe8e0c8,-21.9,11,-638,0,0,1.5708,16,'c');bx18(.08,.8,.06,0x1a1a1a,-21.8,11.2,-638);for(const y of[4,8])for(const z of[-640,-636])bx18(.12,1.4,.4,0x1a1a1a,-21.95,y,z)}
  bx18(.5,.6,.5,0x6a5a3a,-26,TH+.8,-638,0,0,0,'c');cy18(.9,.6,1.2,0x6a5a2a,-26,TH+2.6,-638,0,0,0,10,'c');
  stairT18(-23.975,-640.8,-.35,0,12,0,3.5,1.2);slab18(-29.4,-28.0,-641.4,-640.2,3.5);
  stairT18(-28.8,-640.025,0,.35,12,3.5,7,1.2);slab18(-29.4,-28.2,-636.0,-634.6,7);
  stairT18(-28.025,-635.2,.35,0,12,7,10.5,1.2);slab18(-24.0,-22.6,-635.8,-634.6,10.5);
  stairT18(-23.2,-635.975,0,-.35,12,10.5,14,1.2);slab18(ix0,-23.8,iz0,iz1,14);slab18(-23.8,ix1,iz0,-640.0,14)}
 /* casas con interior en los recorridos clave (atajos a los patios de manzana) */
 for(const [x,z,fc] of[[-14,-575,'s'],[-14,-616,'s'],[14,-690,'n'],[-14,-740,'s']]){const o=hs18({x,z,a:Math.PI/2,w:14,d:12,fl:2,int:true,faces:fc,doors:[['s',0,1.6],['n',-2,1.6]]},x<0?'st':'br');bx18(11.4,.12,13.4,0x6a5a4a,x,3.4,z,0,0,0,'r');crates18(x-2,z+3,3,0x6a5236);bx18(2,.8,1,0x5a3e28,x+2,.4,z-4,0,0,0,'r');ob18(x+2,z-4,1,.5,.8)}
 /* casa de la esquina, colapsable ('casa'): 3 pisos de ladrillo; los escombros cortan media avenida */
 {SEC18='col_casa';CAP18=[];hs18({x:14,z:-617,a:Math.PI/2,w:12,d:12,fl:3,faces:'ns',doors:[['n',0,1.4,0]],sec:'col_casa'},'br');W18.col.casa={ob:CAP18,rob:[],x:14,z:-617};
  SEC18='rub_casa';CAP18=[];for(let i=0;i<26;i++){const x=1.5+RP18()*19,z=-624+RP18()*14;bx18(1+RP18()*2.4,.4+RP18()*1.2,1+RP18()*2,RP18()<.6?BR:0xd8ccb0,x,.3,z,RP18()*.6,RP18()*3,RP18()*.6,'b')}
  bx18(6,3.2,.6,BR,4.3,1.6,-616,0,1.4,.25,'b');ob18(4.3,-616,2.8,4,3.2);ob18(14,-617,7,6,.4,0,true);ob18(14,-617,4,3.5,.9,0,true);W18.col.casa.rob=CAP18;CAP18=null;SEC18=null}
 /* cuartel (planta baja transitable) y patio de armas */
 {house18({x:110,z:-572,w:44,d:12,h:7.2,fl:2,wall:BR,roof:0xcfd4da,trim:0xd8ccb0,flat:true,int:true,doors:[['n',0,2.4],['s',-12,1.8],['s',12,1.8]],faces:'ns',ws:3,ww:.9,wh:1.6,mat:'b',lit:.35,cv:false});bx18(43,.12,11,0x6a5a4a,110,3.5,-572,0,0,0,'r');
  for(let i=0;i<8;i++){bx18(.9,.6,2,0x4a4a3a,92+i*5,.3,-575,0,0,0,'r');ob18(92+i*5,-575,.45,1,.6)}cy18(.08,.1,11,0xd0d0d0,110,5.5,-592,0,0,0,6,'c');ob18(110,-592,.2,.2,11);bx18(46,.05,18,0x9a968e,110,.04,-590,0,0,0,'c');sb18(96,-598,104,-598,1.2);sb18(116,-598,124,-598,1.2)}
 /* fábrica de municiones: nave con techo en sierra, chimenea; muro oeste colapsable ('fabrica') */
 {const FC=0x8a4430;house18({x:110,z:-690,w:44,d:26,h:9,wall:FC,roof:0xcfd4da,trim:0xc8bca0,flat:true,int:true,doors:[['s',-10,5],['s',10,5],['n',0,5],['w',0,7]],faces:'nsw',ws:4,wh:3,ww:1.6,wy:5,mat:'b',lit:.4,noCan:true,dh:4.2,cv:false});
  for(let i=0;i<6;i++){const x=88+3.67+i*7.33;ge18(gTri17(),0xcfd5dc,x,9.4,-690,0,Math.PI/2,0,26,2.2,7.3,'r');if(D>0)bx18(.2,1.4,25,0x30383c,x+1.8,10.5,-690,0,0,.55,'c')}
  cy18(1.8,1.1,30,0x7a3a28,138,15,-704,0,0,0,10,'b');ob18(138,-704,1.4,1.4,30);W18.smk.push([X+138,30.5,-704,1]);
  for(let i=0;i<5;i++)for(const z of[-697,-683]){bx18(2.4,1.5,1.6,0x3a3e3a,93+i*7,.75,z,0,0,0,'c');ob18(93+i*7,z,1.2,.8,1.5)}
  for(let i=0;i<4;i++){for(let k=0;k<(D>0?12:4);k++)cy18(.16,.16,.7,0xa08040,124+i*1.5+(k%3)*.35,.35+Math.floor(k/3)*.7*.0,-692+Math.floor(k/3)*.35,0,0,0,6,'c');ob18(124.5+i*1.5,-691.5,.6,.8,.8)}
  bx18(.4,.4,24,0x3a3a3a,110,7.8,-690,0,0,0,'c');bx18(3,.4,.5,0x6a5a2a,110,7.4,-690,0,0,0,'c');
  SEC18='col_fabrica';CAP18=[];bx18(.3,4.2,7,FC,88.13,2.1,-690,0,0,0,'b');ob18(88.13,-690,.2,3.5,4.2);W18.col.fabrica={ob:CAP18,rob:[],x:88,z:-690};
  SEC18='rub_fabrica';CAP18=[];for(let i=0;i<20;i++)bx18(.8+RP18()*1.4,.3+RP18()*.6,.8+RP18()*1.4,FC,84+RP18()*8,.2,-694+RP18()*8,RP18(),RP18()*3,RP18(),'b');bx18(.4,.5,8,0x5a5a56,88,3.6,-690,.4,0,.6,'c');ob18(88,-690,4,4,.1,0,true);W18.col.fabrica.rob=CAP18;CAP18=null;SEC18=null}
 /* estación (vestíbulo transitable), andén con marquesina, playa de vías, talleres de locomotoras, tanque de agua */
 {house18({x:-112,z:-692,w:12,d:26,h:6.5,wall:0x9a5038,roof:0xcfd4da,trim:0xd8ccb0,flat:true,int:true,doors:[['w',-6,2],['w',6,2],['e',0,2.4]],faces:'we',ws:3,mat:'b',lit:.5,cv:false});
  bx18(9.8,.9,44,0x8a8680,-122.9,.45,-692,0,0,0,'c');ob18(-122.9,-692,4.9,22,.45,0,true);for(let z=-712;z<-670;z+=6)cy18(.1,.1,3.4,0x2a2a2a,-121,2.6,z,0,0,0,6,'c');bx18(9,.2,44,0x4a4a48,-122.6,4.3,-692,0,0,.06,'c');bx18(9.2,.1,44.2,SN18,-122.6,4.45,-692,0,0,.06);bx18(.1,.8,1.6,0xe8e0c8,-118.1,4.8,-692);
  rail18(-147,-652,-772);rail18(-157,-662,-772);railD18(-130,-630,-147,-652);railD18(-147,-650,-157,-662);
  house18({x:-152,z:-742,w:22,d:30,h:8,wall:0x8a4430,roof:0xcfd5dc,trim:0xc8bca0,rh:4,vent:true,int:true,doors:[['s',-5,4.5],['s',5,4.5],['n',-5,4.5]],faces:'we',mat:'b',dh:5.2,noCan:true,cv:false});
  for(const x of[-157,-147]){bx18(1.3,.05,24,0x1a1816,x,.04,-742,0,0,0,'c')}bx18(3,.9,1,0x5a4632,-162,.45,-735,0,0,0,'r');ob18(-162,-735,1.5,.5,.9);crates18(-145,-752,4,0x4a4a3a);
  {const x=-138.5,z=-705;for(const a of[-1,1])for(const b of[-1,1]){cy18(.15,.18,6,0x3a3a3a,x+a*1.6,3,z+b*1.6,0,0,0,6,'c');ob18(x+a*1.6,z+b*1.6,.2,.2,6)}cy18(2.4,2.4,3,0x5a4a3a,x,7.5,z,0,0,0,14,'r');pa(Q18(x,z),gCone(2.7,1.4,14),0xd8dde4,X+x,9.7,z)}
  bx18(6,2,3,0x2a2826,-163,1,-690,0,0,0,'c');ob18(-163,-690,3,1.5,2);
  for(let z=-560;z>-640;z-=26)hs18({x:-150,z,w:10,d:16,fl:1,faces:'e',doors:[['e',0,3,0]]},'br');}
 /* manzanas de relleno */
 for(const [z0,z1] of[[-600,-549],[-644,-608],[-716,-656],[-764,-724]]){block18(-81,-7,z0,z1,z0>-610?'st':'mix');block18(7,56,z0,z1,'mix');block18(64,166,z0,z1,'br','nsw');block18(-100,-89,z0,z1,'br','e')}
 /* ciudadela: muros, bastiones, túnel carretero bajo el torreón, patios */
 {const CC=0x8e8a80;wlg18(-32,-768,32,-768,[[0,7.2]],9,2,CC,'c',{cren:true});wlg18(-32,-812,32,-812,[[0,7.2]],9,2,CC,'c',{cren:true});wlg18(-32,-768,-32,-812,[[-790,2.4]],9,2,CC,'c',{cren:true});wl18(32,-768,32,-812,9,2,CC,'c',{cren:true});
  for(const a of[-1,1])for(const b of[-768,-812])twr18(a*32,b,7,11,CC);
  for(const s of[-1,1]){wlg18(s*4.3,-769,s*4.3,-811,[[-774,2.4]],6,1.4,0x7a766e,'c',{snow:false});wl18(s*4.3,-775.2,s*4.3,-772.8,3.6,1.4,0x7a766e,'c',{y0:2.4,snow:false});bx18(6,15,20,CC,s*8,7.5,-790,0,0,0,'c');ob18(s*8,-790,3,10,15)}
  bx18(10.4,1,44,0x6a6660,0,6.5,-790,0,0,0,'c');bx18(10,8,20,CC,0,11,-790,0,0,0,'c');bx18(22.4,.15,20.4,SN18,0,15.1,-790);for(const s of[-1,1])wl18(-11,-790+s*10,11,-790+s*10,1,.6,CC,'c',{y0:15,cren:true,noOb:true});
  for(const s of[-1,1])bx18(9.6,1.6,.4,CC,0,5.2,-769+s*.0-(s>0?0:42),0,0,0,'c');
  for(let z=-772;z>-810;z-=8)for(const s of[-1,1])bx18(.2,.3,.3,0xffd890,s*3.5,4.6,z,0,0,0,'c');
  if(D>0)for(let i=0;i<6;i++)for(const s of[-1,1])bx18(.12,1.2,.4,0x1a1a1a,s*11.05,9+(i%2)*3,-796+i*2.6);
  house18({x:18,z:-776,w:6,d:5,h:3,wall:0x7a7a72,roof:0x8a8a84,trim:0x9a9a92,flat:true,int:true,doors:[['w',0,1.2]],faces:'s',mat:'c',lit:.6,cv:false});
  cy18(.09,.12,12.5,0xb0b0aa,-20,6.25,-792,0,0,0,6,'c');cy18(.18,.18,.2,0xc8a040,-20,12.6,-792,0,0,0,8,'c');ob18(-20,-792,.2,.2,12.5);bx18(2,.6,2,0x8a8a84,-20,.3,-792,0,0,0,'c');
  sb18(-28,-800,-20,-806,1.2);sb18(10,-806,18,-806,1.2);crates18(-28,-776,6,0x4a5a3a);drum18(26,-772,4);cv18(-24,-784,1.4);cv18(12,-786,1.4)}
 /* torre de comunicaciones (secciones separadas para towerDmg18) */
 {const tx=25,tz=-795,H=30,w=2.4,k=y=>w*(1-y/H*.7);for(let y=0;y<H;y+=2.5){SEC18=y<17.5?'tw0':'tw1';const y1=Math.min(H,y+2.5),a=k(y),b=k(y1);for(const sa of[-1,1])for(const sb of[-1,1])bm18(0x3a3e40,tx+sa*a,y,tz+sb*a,tx+sa*b,y1,tz+sb*b,.14,'c');
   for(const s of[-1,1]){bm18(0x4a4e50,tx-a,y,tz+s*a,tx+b,y1,tz+s*b,.06,'c');bm18(0x4a4e50,tx+s*a,y,tz-a,tx+s*b,y1,tz+b,.06,'c');bm18(0x4a4e50,tx-b,y1,tz+s*b,tx+b,y1,tz+s*b,.07,'c');bm18(0x4a4e50,tx+s*b,y1,tz-b,tx+s*b,y1,tz+b,.07,'c')}}
  SEC18='tw0';bx18(3,.15,3,0x3a3a36,tx,17.5,tz,0,0,0,'c');for(let y=.5;y<17.5;y+=.5)bx18(.5,.05,.05,0x2a2a2a,tx,y,tz+k(y)+.05,0,0,0,'c');for(const sa of[-1,1])for(const sb of[-1,1])ob18(tx+sa*2.2,tz+sb*2.2,.25,.25,3);bx18(5.6,.5,5.6,0x7a7a72,tx,.25,tz,0,0,0,'c');
  SEC18='tw2';cy18(.06,.06,6,0x2a2a2a,tx,H+3,tz,0,0,0,5,'c');for(const y of[H-.6,H+1.4]){bx18(7,.12,.12,0x2a2a2a,tx,y,tz,0,0,0,'c');bx18(.12,.12,7,0x2a2a2a,tx,y,tz,0,0,0,'c');for(const s of[-1,1]){bx18(.05,1.6,.05,0x6a6a6a,tx+s*3.4,y-.8,tz,0,0,0,'c');bx18(.05,1.6,.05,0x6a6a6a,tx,y-.8,tz+s*3.4,0,0,0,'c')}}
  for(const [ax,az] of[[12,-795],[30.5,-782],[30.5,-809]])bm18(0x5a5a5a,tx,H-2,tz,ax,0,az,.03,'c');bx18(.4,.4,.4,0xc83020,tx,H+6.1,tz,0,0,0,'c');
  SEC18='tw2d';for(let i=0;i<7;i++)bx18(2+RN18()*4,.12,.12,0x2a2a2a,tx-4+RN18()*8,.08,tz-5+RN18()*10,0,RN18()*3,0,'c');SEC18=null;W18.tw={x:tx,z:tz,piv:17.5}}
 /* margen del río: almacenes, muelles, puentes */
 {hs18({x:-100,z:-792,w:24,d:22,fl:2,faces:'ns',doors:[['n',0,3,0]],ex:{}},'br');res18(-112,-88,-803,-781);
  hs18({x:-55,z:-792,w:26,d:20,fl:2,int:true,faces:'ns',doors:[['n',0,3],['s',0,3]]},'br');hs18({x:62,z:-792,w:30,d:20,fl:2,int:true,faces:'ns',doors:[['n',4,3],['s',-4,3]]},'br');hs18({x:120,z:-792,w:34,d:22,fl:2,faces:'ns',doors:[['n',0,3,0]]},'br');
  for(const [x,z] of[[-70,-776],[90,-776],[-130,-772]])crates18(x,z,6,0x5a4a32);
  bx18(9.8,.5,25,0x8a8478,0,-.22,-831,0,0,0,'c');for(const s of[-1,1])wl18(s*4.9,-819,s*4.9,-843,1.1,.5,0x8a8274,'c');for(const z of[-826.5,-835.5])bx18(9.8,2.6,2.2,0x7a7468,0,-1.5,z,0,0,0,'c');for(const z of[-822.5,-831,-839.5]){bx18(9.6,.6,3.4,0x7a7468,0,-.8,z-.0,.0,0,0,'c')}
  bx18(4.4,.4,25,0x3a3a3a,-130,-.22,-831,0,0,0,'c');rail18(-130,ZR18[0],ZR18[1],false);for(const s of[-1,1]){const x=-130+s*2.25;bx18(.3,.3,25,0x4a4e50,x,6,-831,0,0,0,'c');bx18(.3,.4,25,0x4a4e50,x,.2,-831,0,0,0,'c');for(let i=0;i<6;i++){const z=-819-i*4.8;bm18(0x4a4e50,x,0,z,x,6,z,.18,'c');bm18(0x4a4e50,x,0,z,x,6,z-4.8,.12,'c')}ob18(x+s*.1,-831,.15,12.5,6)}for(let i=0;i<5;i++)bx18(4.6,.18,.2,0x4a4e50,-130,6,-819-i*6,0,0,0,'c');for(const z of[-826,-836])bx18(3,3,2,0x7a7468,-130,-1.8,z,0,0,0,'c');
  if(D>0)for(let i=0;i<24;i++){const x=-300+RN18()*600;if(Math.abs(x)<8||Math.abs(x+130)<5)continue;bx18(1.5+RN18()*3,.12,1+RN18()*2,0xdde4ea,x,-2.32,-825-RN18()*12,0,RN18()*3,0,'r')}}
 /* caminos */
 road18([[0,124],[0,-164]],5);road18([[0,-140],[-35,-160],[-35,-166]],5);road18([[-35,-178],[-35,-184],[0,-205],[0,-538]],5);road18([[0,-845],[0,-922]],5);road18([[0,-356],[-62,-344]],3.5);road18([[60,-540],[60,-530],[170,-530],[200,-640]],4);road18([[173,-700],[205,-700]],4);
 rail18(-130,124,ZD18[0]);rail18(-130,ZD18[1],ZR18[0]);rail18(-130,ZR18[1],-924);
 /* ================== AERÓDROMO VEYRN (NE, extramuros) ================== */
 {const A=K18.airfield;bx18(40,.05,170,0xe2e6ea,225,.03,-722,0,0,0,'r');for(let z=-640;z>-805;z-=14)bx18(1.2,.5,.5,0xb04020,205,.25,z,0,0,0,'r');
  const hangar=(x,z)=>{const Wd=0x5a4632;wl18(x+7,z-9,x+7,z+9,6,.3,Wd,'r');wl18(x-7,z-9,x+7,z-9,6,.3,Wd,'r');wl18(x-7,z+9,x+7,z+9,6,.3,Wd,'r');ge18(gTri17(),Wd,x,6,z,0,Math.PI/2,0,18.6,2.6,14.6,'r');for(const s of[-1,1])bx18(14.8,.12,9.8,SN18,x,7.35,z+s*4.6,s*.27,0,0);A.hangars.push(P(x-3,z));crates18(x+3,z+5,6,0x4a4a3a)};hangar(272,-680);hangar(272,-760);
  for(const [x,z] of[[250,-652],[252,-706],[250,-736],[252,-790]]){for(const a of[-1,1])for(const b of[-1,1]){cy18(.15,.2,4,0x4a3a28,x+a*1.8,2,z+b*1.8,0,0,0,6,'r');ob18(x+a*1.8,z+b*1.8,.2,.2,4)}bx18(4.4,.25,4.4,0x5a4632,x,4.1,z,0,0,0,'r');bx18(4.6,.1,4.6,SN18,x,4.28,z);cy18(.18,.18,4.6,0x3a2e22,x,4.6,z,0,0,1.5708,6,'r');bx18(2.4,.5,.8,0x5a4632,x+3,.25,z,0,0,0,'r');A.roosts.push(P(x,z,{y:4.3}))}
  for(let i=0;i<4;i++)tent18(292,-650-i*14,1.57,0x5a5a4e);drum18(262,-718,9);drum18(262,-724,6);ring18(205,-700,2.6,1.1,Math.PI/2,.5);
  house18({x:240,z:-628,w:5,d:4,h:2.8,wall:0x5a4632,roof:0xd8dde4,trim:0x6a5038,rh:1.6,int:true,doors:[['s',0,1.1]],faces:'s',mat:'r',lit:.6,cv:false});
  cy18(.06,.08,6,0x8a8a8a,215,3,-632,0,0,0,5,'c');pa(Q18(215,-632),gCone(.35,1.8,8),0xd86020,X+216,5.6,-632,0,0,1.4)}
 /* ================== ORILLA NORTE ================== */
 {hs18({x:-40,z:-872,w:10,d:9,fl:2,faces:'s',doors:[['s',0,1.4,0]]},'st');hs18({x:40,z:-878,w:12,d:9,fl:2,faces:'s',doors:[['s',0,1.4,0]]},'st');hs18({x:-80,z:-896,w:9,d:8,fl:1,faces:'s',doors:[['s',0,1.4,0]]},'st');
  ring18(60,-862,3.6,1.2,0,.5);ring18(-90,-860,3.6,1.2,0,.5);trench18(-60,60,-852,{gF:[[0,6]],gB:[[0,6]]});for(let i=0;i<10;i++)crater18(-200+RP18()*400,-850-RP18()*60,1.5+RP18()*2)}
 /* ================== RECORRIDOS POR ACTO (principal + flancos) ================== */
 K18.routes={
  I:{main:[[0,40],[0,0],[0,-60],[0,-104],[0,-140]],w:[[0,40],[-10,-10],[-90,-60],[-120,-100],[-60,-140]],e:[[30,20],[110,-40],[150,-100],[100,-140]]},
  II:{main:[[0,-140],[-35,-160],[-35,-184],[-35,-200],[0,-215],[0,-262]],w:[[-35,-186],[-90,-186],[-114,-198],[-115,-210],[-90,-226],[-90,-262]],e:[[-35,-186],[20,-188],[60,-200],[70,-238],[70,-250]]},
  III:{main:[[0,-262],[0,-340],[0,-420],[0,-470]],w:[[0,-300],[-62,-340],[-62,-356],[-64,-388],[-95,-396],[-130,-450]],e:[[30,-290],[110,-310],[150,-286],[160,-420],[60,-440]]},
  IV:{main:[[0,-470],[0,-536]],w:[[-130,-450],[-130,-536]],e:[[60,-440],[60,-528],[170,-528],[200,-640]]},
  V:{main:[[0,-536],[0,-604],[0,-626],[11,-650],[0,-674],[0,-764]],w:[[-130,-536],[-130,-560],[-120,-580],[-85,-604],[-85,-650],[-118,-680],[-122.9,-692],[-112,-692],[-104,-692],[-85,-700],[-85,-766]],e:[[60,-548],[60,-604],[60,-650],[100,-650],[100,-676],[110,-690],[100,-706],[100,-720],[60,-720],[60,-766]]},
  VI:{main:[[0,-764],[0,-790],[0,-812],[0,-831],[0,-860],[0,-910]],w:[[-85,-766],[-40,-766],[-40,-790],[-31,-790],[-20,-790],[-8,-774],[0,-780]],e:[[60,-766],[20,-766],[3,-766],[0,-774],[6,-774],[18,-776]],air:[[170,-700],[205,-700],[230,-700]]}};
 /* ================== FUSIÓN DE SECTORES ================== */
 {const MT={r:new T.MeshLambertMaterial({vertexColors:true,map:tex17('r')}),c:new T.MeshLambertMaterial({vertexColors:true,map:tex17('c')}),b:new T.MeshLambertMaterial({vertexColors:true,map:tex18('b')})},UVK={r:.5,c:.55,b:.7};
  for(const k in S18){for(const mk of['r','c','b']){const q=S18[k][mk];if(!q.L.length)continue;const g=pbGeo(q);triUV17(g,UVK[mk]);const m=new T.Mesh(g,MT[mk]);m.matrixAutoUpdate=false;m.updateMatrix();K18.sectors[k+'_'+mk]=g.attributes.position.count;q.L.length=0;
   if(k==='tw1'){const T1=W18.tw,piv=new T.Group();piv.position.set(X+T1.x,T1.piv,T1.z);m.position.set(-X-T1.x,-T1.piv,-T1.z);m.matrixAutoUpdate=true;piv.add(m);scene.add(piv);T1.g1=piv}else scene.add(m);
   W18.ms.push(m);const cm=k.match(/^(col|rub)_(.+)$/);if(cm){const c=W18.col[cm[2]];(c[cm[1]==='col'?'ms':'rm']||(c[cm[1]==='col'?'ms':'rm']=[])).push(m);if(cm[1]==='rub')m.visible=false}
   if(k==='tw2')(W18.tw.a||(W18.tw.a=[])).push(m);if(k==='tw2d'){(W18.tw.d||(W18.tw.d=[])).push(m);m.visible=false}}}
  for(const id in W18.col){for(const o of W18.col[id].rob){const i=obstB.indexOf(o);if(i>=0)obstB.splice(i,1)}}}
 trees18(D);W18.tr=null;
 /* ================== ATMÓSFERA: nieve, bancos de niebla, fogonazos ================== */
 {const N=[400,900,1500][Math.max(0,Math.min(2,D))],g=new T.BufferGeometry(),p=new Float32Array(N*3);for(let i=0;i<N;i++){p[i*3]=(R()-.5)*60;p[i*3+1]=R()*26;p[i*3+2]=(R()-.5)*60}g.setAttribute('position',new T.BufferAttribute(p,3));
  const pm=new T.Points(g,new T.PointsMaterial({color:0xf4f8ff,size:.09,transparent:true,opacity:.85,depthWrite:false}));pm.frustumCulled=false;scene.add(pm);W18.sl={m:pm,N,p}}
 {const N=D===0?5:9,g=new T.BufferGeometry(),p=new Float32Array(N*3);for(let i=0;i<N;i++){const a=i/N*6.28;p[i*3]=Math.cos(a)*(40+R()*50);p[i*3+1]=2+R()*4;p[i*3+2]=Math.sin(a)*(40+R()*50)}g.setAttribute('position',new T.BufferAttribute(p,3));
  const pm=new T.Points(g,new T.PointsMaterial({color:0xc8d0dc,map:tex18('f'),size:46,transparent:true,opacity:.22,depthWrite:false}));pm.frustumCulled=false;scene.add(pm);W18.fogP={m:pm,N,p}}
 {const t=tex17('f');for(let i=0;i<2;i++){const s=new T.Sprite(new T.SpriteMaterial({map:t,color:0xffc890,transparent:true,opacity:0,blending:T.AdditiveBlending,depthWrite:false,fog:false}));s.visible=false;scene.add(s);W18.fl.push({s,t:0,d:.3})}}
 K18.verts=0;for(const m of W18.ms)if(m.geometry)K18.verts+=m.geometry.attributes.position.count*(m.isInstancedMesh?m.count:1);K18.draws=W18.ms.length;
}
/* ---------- cielo y luz: 'dawn' 05:10 azul oscuro · 'morning' 07–09 gris con niebla · 'day' 11–13 sol pálido ---------- */
const SKY18={dawn:{st:[[0,'#0a0f1e'],[.3,'#17213a'],[.46,'#34405c'],[.5,'#6a6074'],[.53,'#3e4660'],[1,'#1c2028']],fog:0x2c3650,n:12,f:[200,260,320],hc:0x6a7aa0,hg:0x2a2c38,hi:.85,sc:0x8a9ac8,si:.3,sp:[-70,35,90],snow:.55},
 morning:{st:[[0,'#5a6068'],[.4,'#868c94'],[.5,'#a4a8ae'],[1,'#767a80']],fog:0x9aa0a8,n:6,f:[140,175,210],hc:0xc0c8d2,hg:0x5a5c64,hi:.95,sc:0xd0d4da,si:.3,sp:[40,60,60],snow:1},
 day:{st:[[0,'#7a92ae'],[.38,'#a4b4c6'],[.5,'#dcdfe2'],[.56,'#c4c8cc'],[1,'#868c92']],fog:0xc0c8d2,n:25,f:[380,470,560],hc:0xc8d2de,hg:0x6a6a70,hi:.85,sc:0xfff0d8,si:.7,sp:[70,110,-40],snow:.22}};
function sky18(ph,blend){ph=SKY18[ph]?ph:'dawn';const S=SKY18[ph],D=Math.max(0,Math.min(2,G.detail===undefined?1:+G.detail));W18.phase=ph;setSky(S.st);if(skyMesh)skyMesh.scale.setScalar(2.4);W18.skyS=1;if(typeof L9!=='undefined')L9.fog=null;if(cam.far<1150){cam.far=1150;cam.updateProjectionMatrix()}
 W18.tgt={fog:new T.Color(S.fog),n:S.n,f:S.f[D],hc:new T.Color(S.hc),hg:new T.Color(S.hg),hi:S.hi,sc:new T.Color(S.sc),si:S.si,snow:S.snow};sunL.position.set(S.sp[0],S.sp[1],S.sp[2]);
 if(!blend){W18.blend=0;W18.fogC=S.fog;W18.fogN=S.n;W18.fogF=S.f[D];W18.snow=S.snow;scene.fog.color.setHex(S.fog);scene.fog.near=S.n;scene.fog.far=S.f[D];hemi.color.setHex(S.hc);hemi.groundColor.setHex(S.hg);hemi.intensity=S.hi;sunL.color.setHex(S.sc);sunL.intensity=S.si}else W18.blend=blend}
/* nieve que cae con ráfagas, niebla que deriva, humo de chimeneas, fogonazos de artillería en el horizonte */
function weather18(dt){if(!W18.built)return;dt=Math.min(dt||.033,.1);const t=(W18.u.value+=dt),cp=cam.position;W18.gust=.5+.5*Math.sin(t*.11)*Math.sin(t*.047+1);const wind=W18.wind*(.5+W18.gust);
 if(W18.blend>0&&W18.tgt){const k=Math.min(1,dt/Math.max(.1,W18.blend)),q=W18.tgt;W18.blend=Math.max(0,W18.blend-dt);const c=new T.Color(W18.fogC).lerp(q.fog,k);W18.fogC=c.getHex();W18.fogN+=(q.n-W18.fogN)*k;W18.fogF+=(q.f-W18.fogF)*k;W18.snow+=(q.snow-W18.snow)*k;hemi.color.lerp(q.hc,k);hemi.groundColor.lerp(q.hg,k);hemi.intensity+=(q.hi-hemi.intensity)*k;sunL.color.lerp(q.sc,k);sunL.intensity+=(q.si-sunL.intensity)*k}
 if(W18.river&&W18.river.material.map)W18.river.material.map.offset.x-=dt*.03;
 let fx=0;for(const q of W18.fl)if(q.t>0)fx=Math.max(fx,q.t/q.d);
 if(scene.fog&&level===18){scene.fog.near=W18.fogN;scene.fog.far=W18.fogF*(.9+.1*Math.sin(t*.06));const c=scene.fog.color;c.setHex(W18.fogC);if(fx>0)c.lerp(new T.Color(0xc89878),fx*.18)}
 const S=W18.sl;if(S){S.m.visible=true;const n=Math.floor(S.N*Math.max(.12,Math.min(1,W18.snow*(.7+.5*W18.gust))));S.m.geometry.setDrawRange(0,n);S.m.position.set(cp.x,cp.y-6,cp.z);const p=S.p;
  for(let i=0;i<n;i++){const o=i*3;p[o]+=(wind*.9+Math.sin(t*.7+i)*.5)*dt;p[o+1]-=(1.1+(i%4)*.25)*dt;p[o+2]+=Math.cos(t*.5+i*.3)*.4*dt;if(p[o+1]<0){p[o+1]+=26;p[o]=(R()-.5)*60;p[o+2]=(R()-.5)*60}if(p[o]>30)p[o]-=60}S.m.geometry.attributes.position.needsUpdate=true}
 const F=W18.fogP;if(F){F.m.visible=true;F.m.position.set(cp.x,0,cp.z);const p=F.p;for(let i=0;i<F.N;i++){const o=i*3;p[o]+=wind*.35*dt;if(p[o]>90){p[o]-=180}}F.m.geometry.attributes.position.needsUpdate=true;F.m.material.opacity=W18.phase==='morning'?.32:W18.phase==='dawn'?.2:.1;F.m.material.color.setHex(W18.fogC).lerp(new T.Color(0xffffff),.25)}
 W18.ct-=dt;if(W18.ct<=0&&W18.smk.length&&+G.detail!==0){W18.ct=.5;const s=W18.smk[(R()*W18.smk.length)|0];if(Math.hypot(s[0]-cp.x,s[2]-cp.z)<300)smoke(s[0],s[1],s[2],1+s[3]*2.5,6+s[3]*4,s[3]>.8?0x2a2826:0x9a9a98,.9+s[3],.3+s[3]*.2)}
 W18.dt-=dt;if(W18.dt<=0&&+G.detail>1&&W18.gust>.7){W18.dt=.6+R();const a=R()*6.28,r=6+R()*20;smoke(cp.x+Math.cos(a)*r,.3,cp.z+Math.sin(a)*r,1.6,2.5,0xf0f4f8,.2,.18)}
 W18.ft-=dt;if(W18.ft<=0){W18.ft=1.5+R()*5;const q=W18.fl.find(q=>q.t<=0)||W18.fl[0],north=R()<.7;q.s.position.set(cp.x-500+R()*1000,3+R()*18,north?Math.min(cp.z-420,-1000)-R()*300:Math.max(cp.z+420,300)+R()*250);q.s.scale.setScalar(60+R()*80);q.d=q.t=.18+R()*.25;q.s.visible=true;if(R()<.3)W18.ft=.2}
 for(const q of W18.fl)if(q.t>0){q.t-=dt;const k=Math.max(0,q.t/q.d);q.s.material.opacity=k*k*.85;if(q.t<=0)q.s.visible=false}}
/* derrumbe parcial de un edificio marcado ('casa' corta media avenida; 'fabrica' abre una brecha al oeste de la nave) */
function collapse18(id){const c=W18.col&&W18.col[id];if(!c||c.done)return false;c.done=true;for(const m of c.ms||[])m.visible=false;for(const m of c.rm||[])m.visible=true;
 for(const o of c.ob){const i=obstB.indexOf(o);if(i>=0)obstB.splice(i,1)}for(const o of c.rob)obstB.push(o);
 const x=X18+c.x;if(typeof smoke==='function')for(let i=0;i<(+G.detail===0?4:10);i++)smoke(x+(R()-.5)*14,1+R()*5,c.z+(R()-.5)*14,4+R()*4,5+R()*4,0x9a948a,.8,.5);if(typeof burst==='function')burst(x,3,c.z,0x8a6a5a,20,1.2,7);if(typeof expSnd==='function')expSnd(x,c.z,1);if(K18.collapse[id])K18.collapse[id].done=true;return true}
/* daños de la torre de comunicaciones: 1 = pierde antenas, 2 = tramo superior doblado, 3 = tramo superior caído */
function towerDmg18(stage){const T1=W18.tw;if(!T1||!T1.g1)return 0;stage=Math.max(0,Math.min(3,stage|0));if(stage<=(K18.commTower.stage||0))return K18.commTower.stage;K18.commTower.stage=stage;const x=X18+T1.x;
 if(stage>=1){for(const m of T1.a||[])m.visible=false;for(const m of T1.d||[])m.visible=true;if(typeof burst==='function')burst(x,29,T1.z,0xffd080,16,.8,9)}
 if(stage>=2){T1.g1.rotation.z=stage===2?-.42:-1.85;T1.g1.rotation.x=stage===2?.1:.25;if(typeof smoke==='function')smoke(x,18,T1.z,3,5,0x6a6a6a,1,.5)}
 if(typeof expSnd==='function')expSnd(x,T1.z,stage>2?1:0);return stage}
/* el suelo de la Cota 214 es real para todos los que usan floorAt (jugador, NPC, enemigos) */
{const _fa=floorAt;floorAt=function(q){const f=_fa(q);if(level===18&&W18.built){const h=floor18(q.x-X18,q.z);if(h>f)return h}return f}}
/* fuera del nivel 18: cielo a escala normal, sin nieve ni niebla */
{const _u18=update;update=function(dt){_u18(dt);if(level!==18&&W18.skyS){W18.skyS=0;skyMesh.scale.setScalar(1);if(W18.sl)W18.sl.m.visible=false;if(W18.fogP)W18.fogP.m.visible=false;for(const q of W18.fl)q.s.visible=false}}}
