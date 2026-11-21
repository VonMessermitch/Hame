/* =====================================================================
   v31 · IRON FOUNDRY — pulido de la Operación Nachtfall y equipo aerotransportado
   1 Paracaidistas a encontrar: aterrizan siempre (nadie queda colgado del cielo)
   2 Taikin: más edificios (barrio ribereño, iglesia, ruinas, mercado, almacenes)
   3 Patrullas entre antiaéreas y patrullas de reacción tras cada destrucción
   4 Brújula y minimapa del juego en la misión
   5 Máscara de gas de cabeza completa (capucha de goma)
   6 Casco de paracaidista fiel al modelo de 1938 (sin ala, orejas cubiertas,
     barbuquejo en Y de cuatro puntos)
   ===================================================================== */
/* ---------- 5 · máscara de gas de capucha completa ---------- */
gasMask30=function(hd,o){o=o||{};const g=new T.Group();g.name='gasmask';const RU=0x2c2e2a,RD=0x1e201c,q=PB();
 /* capucha de goma que envuelve cabeza, nuca y cuello */pa(q,gc30('gm_h',()=>new T.SphereGeometry(.235,12,10)),RU,0,.19,0,0,0,0,1.02,1.08,1.08);pa(q,gc30('gm_n',()=>new T.CylinderGeometry(.2,.24,.16,12,1,true)),RU,0,.0,-.01,0,0,0,1,1,1.05);
 for(let i=0;i<5;i++)pBox(q,.012,.4,.012,RD,(i-2)*.09,.2,-.252+Math.abs(i-2)*.012,-.1);pBox(q,.42,.012,.012,RD,0,.33,.2);/* costuras */
 /* oculares con aro metálico y cristal oscuro */for(const s of[-1,1]){pCyl(q,.06,.062,.05,0x6a6a5a,s*.082,.21,.22,1.5708,0,0,14);pCyl(q,.047,.047,.054,0x22343a,s*.082,.21,.226,1.5708,0,0,14);pCyl(q,.065,.065,.012,RD,s*.082,.21,.205,1.5708,0,0,14)}
 /* válvula de exhalación y filtro estriado */pCyl(q,.055,.065,.08,0x3a3c38,0,.08,.24,1.25,0,0,12);if(!o.hose){pCyl(q,.07,.07,.13,0x4a4e44,0,.03,.31,1.25,0,0,14);for(let i=0;i<5;i++)pCyl(q,.073,.073,.012,0x2a2c28,0,.0+i*.018,.29+i*.02,1.25,0,0,14);pCyl(q,.04,.04,.014,0x8a8a7a,0,-.03,.37,1.25,0,0,10)}
 else{for(let i=0;i<7;i++)pCyl(q,.03,.03,.07,0x2a2c28,0,.04-i*.06,.27-i*.015,.25,0,0,8)}
 /* correas de ajuste sobre la capucha */for(const s of[-1,1]){pBox(q,.02,.03,.36,0x3a3020,s*.215,.22,-.02,0,s*.05,0);pBox(q,.02,.025,.3,0x3a3020,s*.2,.1,-.04,-.25,s*.05,0)}pBox(q,.36,.03,.02,0x3a3020,0,.3,-.24);pbMesh(q,g,VCM);hd.add(g);return g};
/* ---------- 6 · casco aerotransportado modelo 1938 ---------- */
paraHelm30=function(hd,col){const c=col||0x4a4e44;const geo=gc30('fj38',()=>{const pts=[];for(let i=0;i<=12;i++){const a=i/12*1.62;pts.push(new T.Vector2(Math.sin(Math.min(a,1.5708))*.246+.0001,Math.cos(Math.min(a,1.5708))*.215+.035-(a>1.5708?(a-1.5708)*.9:0)))}pts.push(new T.Vector2(.25,-.055));const g=new T.LatheGeometry(pts.reverse(),22);
  /* borde recortado: más alto sobre los ojos, bajo en orejas y nuca */const p=g.attributes.position;for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i),z=p.getZ(i);if(y<.06){const a=Math.atan2(x,z),front=Math.max(0,Math.cos(a));p.setY(i,y+front*front*.07)}}g.computeVertexNormals();return g});
 const m=new T.Mesh(geo,mc30(c,{side:T.DoubleSide}));m.position.y=.27;m.scale.set(1.04,1,1.12);hd.add(m);
 const q=PB();pa(q,gc30('fj38r',()=>new T.TorusGeometry(.25,.009,4,24)),shade(c,.7),0,.215,0,1.5708,0,0,1.04,1.12,1);
 /* barbuquejo en Y: cuatro puntos de anclaje por lado */for(const s of[-1,1]){pCyl(q,.014,.014,.018,0x2a2a2a,s*.258,.27,.07,0,0,1.5708,6);pCyl(q,.014,.014,.018,0x2a2a2a,s*.258,.27,-.09,0,0,1.5708,6);pBox(q,.018,.17,.022,0x3a2616,s*.225,.18,.06,-.25,0,s*.12);pBox(q,.018,.17,.022,0x3a2616,s*.225,.18,-.07,.3,0,s*.12);pBox(q,.03,.03,.024,0x8a8a7a,s*.2,.1,0,0,0,0);pBox(q,.018,.12,.022,0x3a2616,s*.17,.04,.03,0,0,s*.35)}pBox(q,.15,.022,.03,0x3a2616,0,-.01,.12);
 for(const s of[-1,1])pCyl(q,.008,.008,.012,0x1a1a1a,s*.24,.34,-.02,0,0,1.5708,6);pBox(q,.06,.07,.01,0x7a1a2a,.17,.36,.17,0,.75,0);pBox(q,.028,.04,.012,0xc8a840,.172,.36,.172,0,.75,0);
 for(let i=0;i<6;i++)pBox(q,.03,.01,.01,shade(c,.6),(R()-.5)*.32,.3+R()*.16,.21,0,R(),0);pbMesh(q,hd,VCM)};
/* ---------- 1 · los paracaidistas dispersos aterrizan siempre ---------- */
function landPara31(n){if(!n.desc)return;n.desc=0;const g=n.g.position;if(n.land)g.set(X16+n.land[0],0,n.land[1]);g.y=0;if(n.can){n.can.scale.set(1,.12,1);n.can.position.set(g.x+3+R()*2,-.2,g.z+2);n.can.rotation.set(0,R()*6,0)}n.act='crouch'}
{const _g=go16;go16=function(ph,jump){if(ph===3)for(const n of N16.paras)landPara31(n);_g(ph,jump);if(ph===3)for(const n of N16.paras){if(n.role==='wounded'){n.g.rotation.order='YXZ';n.g.rotation.x=-1.5708;n.g.position.y=.18}}if(ph===5)patrols31()}}
/* los que todavía caen mientras el jugador ya está en tierra siguen bajando hasta el suelo */
{const _u=upd16;upd16=function(dt){for(const n of N16.paras){if(!n.desc)continue;const g=n.g.position;g.y-=dt*(g.y>100?14:5.4);if(n.land){g.x+=(X16+n.land[0]-g.x)*dt*.2;g.z+=(n.land[1]-g.z)*dt*.2}if(n.can)n.can.position.set(g.x,g.y+.2,g.z);n.act='climb';if(g.y<=0)landPara31(n)}_u(dt)}}
/* ---------- 3 · patrullas entre antiaéreas ---------- */
function patrols31(){if(N16.pat31)return;N16.pat31=true;const P_=[[[-150,34],[-60,34],[40,34],[-60,34]],[[128,4],[140,-40],[126,-90],[126,-180],[126,-90],[140,-40]],[[-100,-92],[0,-92],[100,-92],[0,-92]],[[-190,-10],[-200,-90],[-200,-180],[-200,-90]]];
 P_.forEach((path,i)=>{for(let k=0;k<3;k++){const off=k*1.6;sp16(k===2&&i%2?'bar':k===1?'stv':'mosin',path[0][0]+off,path[0][1]+off,{tag:'pat',un:true,lamp:k===0,kind:k===0?'recon':'line',pat:path.map(p=>[p[0]+off,p[1]+off])})}});
 feed('Patrullas de Zheng-Hua recorren los caminos entre las antiaéreas')}
{const _b=aaBoom16;aaBoom16=function(a,quiet){_b(a,quiet);if(quiet)return;const next=N16.aa.filter(q=>q.alive);if(!next.length)return;const n=next[0];const mx=(a.x+n.x)/2,mz=(a.z+n.z)/2;later13(6,()=>{if(N16.ph!==5)return;radio28('Ostermann','¡Patrulla de reacción saliendo de '+n.name.split(' · ')[0]+'! ¡Los vienen a buscar!',2.4);for(let k=0;k<4;k++){const e=sp16(k===3?'bar':k%2?'stv':'mosin',mx+(R()-.5)*12,mz+(R()-.5)*12,{tag:'rx',kind:k===0?'vanguard':'line'});e.unaware=false;e.active=true;e.alert=.4+R()*.5}})}}
/* ---------- 4 · brújula y minimapa (los de la v27) también en Nachtfall ---------- */
{const _m=mm27;mm27=function(dt){if(level===16){if(!N16.foot){const c=$('mm27');if(c){c.style.display='none';$('cp27').style.display='none';$('dist27').style.display='none'}return}const lv=level;level=13;try{_m(dt)}finally{level=lv}return}return _m(dt)}}
/* ---------- 2 · Taikin: más edificios ---------- */
function ruin31(q,x,z,w,d,h){const X=X16,C=0x6a5e52;pBox(q,w,.4,d,0x4a4440,X+x,.2,z);for(const [sx,sz,ww,dd] of[[-1,0,.6,d],[1,0,.6,d],[0,-1,w,.6],[0,1,w,.6]]){const hh=h*(.3+R()*.7);pBox(q,ww,hh,dd,C,X+x+sx*(w/2-.3),hh/2,z+sz*(d/2-.3));if(sx===0)for(let i=0;i<Math.floor(w/3);i++)if(hh>3)pBox(q,1.1,1.4,.7,0x14161c,X+x-w/2+1.5+i*3,2,z+sz*(d/2-.3))}for(let i=0;i<8;i++)pBox(q,1+R()*2,.5+R()*1.4,1+R()*2,shade(C,.6+R()*.4),X+x+(R()-.5)*w*.8,.3,z+(R()-.5)*d*.8,R(),R(),R()*.4);ob16(x,z,w/2,d/2,h*.6);N16.smk.push([X+x,2,z])}
function church31(q,x,z){const X=X16,C=0xc8bca0;pBox(q,12,9,22,C,X+x,4.5,z);for(const s of[-1,1]){pBox(q,13,.3,12.5,0x5a3a2a,X+x+s*3.2,11,z,0,0,-s*.75);}pBox(q,6,22,6,C,X+x,11,z+13);pa(q,gCone(4.6,9,4),0x4a5a4a,X+x,26.5,z+13,0,.785,0);pBox(q,1.4,2.2,.2,0xffd080,X+x,16,z+16.05);for(let i=0;i<3;i++)for(const s of[-1,1])pBox(q,.1,3,1.4,0x28323a,X+x+s*6.05,4.5,z-7+i*7);pBox(q,2.4,3.6,.2,0x3a2a1a,X+x,1.8,z+16.05);ob16(x,z,6,11,10);ob16(x,z+13,3,3,22)}
{const _bt=buildTaikin16;buildTaikin16=function(){const was=N16.built;_bt();if(was)return;const X=X16,q=PB();
 /* barrio ribereño: casas y tiendas frente al canal (norte), dejando libres puentes y calles */for(const x of[-250,-232,-214,-186,-170,-130,-112,-94,-76,-58,-30,-16,24,40,58,76,94,112,160,178,196,214,232])gable16(q,x,-55,8,6,5,[0xd8cfb8,0xc8b898,0xb8a888,0xa8907a][(x+4000)%4|0],[0x5a2a22,0x4a3028,0x3a3a40][(x+4000)%3|0]);
 for(const x of[-250,-232,-214,-170,-130,-94,-58,-30,24,58,94,160,196,232]){pBox(q,6,.12,2,0x6a2a22,X+x,3.2,-51.4,-.35,0,0);pBox(q,5,.6,.1,0xd8c8a0,X+x,3.7,-51.9)}
 /* aldea de la zona de salto: iglesia y casas */church31(q,-262,232);for(const [x,z] of[[-240,198],[-92,182],[-170,262],[10,215],[70,240]])gable16(q,x,z,9,7,4,0xb8a888,0x4a3028);
 /* ruinas de bombardeos anteriores */ruin31(q,-160,-186,20,10,9);ruin31(q,-30,-186,16,12,8);ruin31(q,205,-75,18,12,10);ruin31(q,-100,-290,22,14,12);
 /* más bloques al norte y al este */for(const [x,z,w,d,f] of[[-250,-320,26,18,5],[-165,-320,26,18,4],[-120,-320,26,18,5],[-70,-320,30,18,4],[250,-80,20,14,4],[250,-120,22,18,5],[250,-240,24,22,4]])block16(q,x,z,w,d,f,[0x6a5e52,0x5e5a54,0x726658][(x+z+4000)%3|0]);
 /* almacenes y cobertizos junto a las vías y el perímetro */for(const x of[200,220,240])gable16(q,x,58,12,8,4.5,0x5a4a40,0x2a2a2c);pBox(q,10,6,10,0x5a4a3a,X-260,3,20);ob16(-260,20,5,5,6);
 /* mercado: puestos con toldos en los bordes de la plaza (centro libre para la segunda ola) */for(const [x,z] of[[14,-136],[20,-136],[26,-136],[14,-166],[20,-166],[26,-166]]){pBox(q,4,.12,3,[0xa83a2a,0x3a6a4a,0xc8a040][(x/6|0)%3],X+x,2.4,z,.15,0,0);for(const a of[-1,1])for(const b of[-1,1])pBox(q,.1,2.4,.1,0x3a2a1a,X+x+a*1.8,1.2,z+b*1.3);pBox(q,3.4,.9,2,0x6a5236,X+x,.45,z);ob16(x,z,1.9,1.4,1)}
 /* faroles en las calles nuevas */pbMesh(q,scene,VCV);for(const [x,z] of[[-200,-50],[-120,-50],[30,-50],[150,-50],[-240,215],[-90,195],[180,-140]])lamp16(x,z,4.2)}}
