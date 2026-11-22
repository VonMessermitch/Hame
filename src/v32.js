/* ============================================================
   v32 · OPCIONES DE GRÁFICOS (estilo MOHAA / CoD1)
   Presets Baja / Media / Alta / Ultra + ajustes individuales,
   límite de FPS para ahorrar batería y medidor de rendimiento.
   Se guardan en localStorage (nilo_gfx) junto al resto de G.
   ============================================================ */
if(G.cap===undefined)G.cap=0;
PRE.baja.cap=30;PRE.media.cap=0;PRE.alta.cap=0;PRE.ultra.cap=0;
/* ---- límite de FPS: acumula dt para no ralentizar el juego ---- */
{let acc=0,last=0,skip=false;const _up=update,_dr=draw;
 update=function(dt){const cap=+G.cap;if(!cap){acc=0;skip=false;return _up(dt)}const n=performance.now();if(n-last<1000/cap-2){acc+=dt;skip=true;return}skip=false;last=n;const d=Math.min(dt+acc,.1);acc=0;return _up(d)};
 draw=function(){if(skip&&playing)return;return _dr()}}
/* ---- con detalle bajo no se cargan los adornos pesados de los niveles 12–14 ---- */
for(const k of['deco31_12','deco31_13','deco31_14']){if(typeof window[k]!=='function')continue;const f=window[k];window[k]=function(){if(+G.detail===0)return;return f.apply(this,arguments)}}
/* ---- panel de gráficos en el menú ---- */
function gfx32(){const O=$('cpO');if(!O||$('gfx32'))return;
 const S='background:#24190e;color:#f3e6c4;border:1px solid #8a6a35;padding:6px;font:14px Georgia,serif';
 const sel=(id,lab,opts,hint)=>'<label>'+lab+' <select id="'+id+'" style="'+S+'">'+opts.map(o=>'<option value="'+o[0]+'">'+o[1]+'</option>').join('')+'</select>'+(hint?'<small style="display:block;color:#a8946a;letter-spacing:0;font-size:12px">'+hint+'</small>':'')+'</label>';
 O.insertAdjacentHTML('beforeend','<div id="gfx32"><h2 style="margin-top:22px">GRÁFICOS</h2>'+
  sel('g32q','CALIDAD',[['baja','Baja · celulares modestos, 30 FPS'],['media','Media · recomendada para Android'],['alta','Alta'],['ultra','Ultra · máximo detalle'],['pers','Personalizada']],'Como en los clásicos: elegí un preset y ajustá lo que quieras abajo.')+
  sel('g32res','RESOLUCIÓN 3D',[['.5','50 %'],['.65','65 %'],['.75','75 %'],['.85','85 %'],['1','100 %']],'Lo que más pesa en la GPU del celular.')+
  sel('g32det','DETALLE DE MODELOS Y EDIFICIOS',[['0','Bajo (sin adornos)'],['1','Normal'],['2','Alto']],'Se aplica al empezar la próxima misión.')+
  sel('g32part','PARTÍCULAS (humo, polvo, chispas)',[['.4','Pocas'],['.8','Normales'],['1','Muchas'],['1.4','Máximas']])+
  sel('g32fog','DISTANCIA DE VISIÓN',[['.8','Corta'],['1','Normal'],['1.3','Lejana']])+
  sel('g32cap','LÍMITE DE FPS',[['0','Sin límite (60)'],['45','45 FPS'],['30','30 FPS · ahorro de batería y menos calor']])+
  sel('g32fps','MEDIDOR DE FPS',[['0','Oculto'],['1','Visible']])+
  sel('g32br','BRILLO',[['.85','Oscuro'],['1','Normal'],['1.15','Claro'],['1.3','Muy claro']])+
  '</div>');
 const map={g32res:'res',g32det:'detail',g32part:'part',g32fog:'fog',g32cap:'cap',g32fps:'fps',g32br:'bright'};
 const near=(id,v)=>{const s=$(id);let b=null,bd=1e9;for(const o of s.options){const d=Math.abs(+o.value-v);if(d<bd){bd=d;b=o.value}}s.value=b};
 const sync=()=>{for(const id in map)near(id,+G[map[id]]||0);$('g32q').value=PRE[G.q]&&['res','part','detail','fog','cap'].every(k=>+PRE[G.q][k]===+G[k])?G.q:'pers'};
 $('g32q').onchange=()=>{const q=$('g32q').value;if(PRE[q]){Object.assign(G,PRE[q]);G.q=q}saveG();applyG();sync()};
 for(const id in map)$(id).onchange=()=>{G[map[id]]=+$(id).value;G.q='pers';saveG();applyG();sync()};
 sync()}
gfx32();if(!$('gfx32'))setTimeout(gfx32,500);
{const b=document.querySelector('#cod [data-p=cpO] small');if(b)b.textContent='Dificultad, gráficos, límite de FPS';const O=$('cpO');if(O&&getComputedStyle(O).overflowY==='visible'){O.style.overflowY='auto';O.style.maxHeight='100%'}}
/* nivel 17: sin arma en mano hasta equiparse en el barracón */
{const _v=vmUpd13;vmUpd13=function(dt){if(level===17&&typeof N17!=='undefined'&&N17.arm&&!N17.arm.length&&typeof L13!=='undefined'){const s=L13.vm;L13.vm=false;try{return _v(dt)}finally{L13.vm=s}}return _v(dt)}}
/* ============================================================
   v39 · GRÁFICOS AVANZADOS: presets Ultra baja / Extrema y
   ajustes sueltos: suavizado (supersampling), sombras de
   contacto, filtro y calidad de texturas, profundidad de color,
   detalle de curvas, efectos de pantalla.
   ============================================================ */
for(const [k,v] of Object.entries({aa:1,sh:1,tf:2,tq:1,cd:24,cv:1}))if(G[k]===undefined)G[k]=v;
PRE.ultrabaja={res:.35,part:.2,detail:0,fog:.6,cap:30,aa:1,sh:0,tf:0,tq:.5,cd:16,cv:.5,fx:0};
PRE.extrema={res:1,part:1.6,detail:2,fog:1.5,cap:0,aa:1.5,sh:1,tf:8,tq:1,cd:24,cv:1.5,fx:1};
for(const k of['baja','media','alta','ultra'])Object.assign(PRE[k],{aa:1,sh:k!=='baja'?1:0,tf:k==='baja'?1:k==='media'?2:4,tq:k==='baja'?.5:1,cd:24,cv:k==='baja'?.75:k==='ultra'?1.25:1,fx:k==='baja'?0:1});
/* suavizado: la escena se dibuja a mayor resolución y se reduce (supersampling) */
{const _a=applyG;applyG=function(){_a();try{RTS=G.res*(+G.aa||1);sizeRT();rt.texture.minFilter=rt.texture.magFilter=(+G.aa||1)>1?T.LinearFilter:T.NearestFilter;try{const p=rend.properties.get(rt.texture);if(p&&p.__webglTexture){rt.dispose()}}catch(e){}sizeRT()}catch(e){}try{if(typeof shM!=='undefined')shM.opacity=+G.sh?.35:0}catch(e){}txAll39();cdSet39()}}
/* profundidad de color: cuantización en el post-proceso */
function cdSet39(){try{if(!pMat.uniforms.cd39){pMat.uniforms.cd39={value:255};pMat.fragmentShader=pMat.fragmentShader.replace('gl_FragColor=vec4(c,1.);','c=floor(c*cd39+.5)/cd39;gl_FragColor=vec4(c,1.);').replace('void main','uniform float cd39;\nvoid main');pMat.needsUpdate=true}pMat.uniforms.cd39.value=(+G.cd||24)>=24?255:(+G.cd>=16?31:7)}catch(e){}}
/* filtro y calidad de texturas en todo lo cargado */
let TXA39=1;try{TXA39=rend.capabilities.getMaxAnisotropy()||1}catch(e){}
function tx39(t){const im=t&&t.image;if(!t||!t.isTexture||t===rt.texture||t.isDataTexture||!im||!((im.tagName==="CANVAS")||(im.tagName==="IMG"&&im.complete&&im.naturalWidth)))return;const f=+G.tf;if(t.userData.tq39===undefined)t.userData.tq39=t.minFilter;
 if(f===0){t.magFilter=T.NearestFilter;t.minFilter=T.NearestFilter;t.anisotropy=1}else{t.minFilter=f>=2?T.LinearMipMapLinearFilter:T.LinearFilter;if(+G.tq<1)t.minFilter=T.NearestMipMapNearestFilter;t.anisotropy=f>2?Math.min(TXA39,f):1}t.needsUpdate=true}
function txAll39(){try{scene.traverse(o=>{const m=o.material;if(!m)return;for(const q of Array.isArray(m)?m:[m])if(q.map)tx39(q.map)})}catch(e){}}
{let lv=-1,t=0;const _u=update;update=function(dt){const r=_u(dt);if(level!==lv){lv=level;t=2.5}if(t>0){t-=dt;if(t<=0)txAll39()}return r}}
/* detalle de curvas: segmentos de cilindros, conos y esferas creados desde ahora */
{const C=T.CylinderGeometry,S=T.SphereGeometry,K=T.ConeGeometry,f=(n,mn)=>Math.max(mn,Math.round((n||8)*(+G.cv||1)));
 T.CylinderGeometry=class extends C{constructor(a,b,h,r,hs,o,ts,tl){super(a,b,h,f(r,3),hs,o,ts,tl)}};
 T.ConeGeometry=class extends K{constructor(a,h,r,hs,o,ts,tl){super(a,h,f(r,3),hs,o,ts,tl)}};
 T.SphereGeometry=class extends S{constructor(a,w,h,p0,p1,t0,t1){super(a,f(w,4),f(h,3),p0,p1,t0,t1)}}}
function gfx39(){const O=$('gfx32');if(!O||$('g39'))return;const S='background:#24190e;color:#f3e6c4;border:1px solid #8a6a35;padding:6px;font:14px Georgia,serif';
 const sel=(id,lab,opts,h)=>'<label>'+lab+' <select id="'+id+'" style="'+S+'">'+opts.map(o=>'<option value="'+o[0]+'">'+o[1]+'</option>').join('')+'</select>'+(h?'<small style="display:block;color:#a8946a;font-size:12px">'+h+'</small>':'')+'</label>';
 const q=$('g32q');q.insertAdjacentHTML('afterbegin','<option value="ultrabaja">Ultra baja · celulares muy modestos</option>');q.insertAdjacentHTML('beforeend','<option value="extrema">Extrema · PC potente</option>');
 const rs=$('g32res');rs.insertAdjacentHTML('afterbegin','<option value=".35">35 %</option>');
 O.insertAdjacentHTML('beforeend','<div id="g39">'+
  sel('g39aa','SUAVIZADO (ANTIALIAS)',[['1','Desactivado'],['1.25','×1.25 (supersampling)'],['1.5','×1.5'],['2','×2 · muy pesado']],'Dibuja la escena a más resolución y la reduce: bordes más suaves.')+
  sel('g39sh','SOMBRAS',[['0','Desactivadas'],['1','Sombras de contacto']],'Sombras bajo soldados y objetos.')+
  sel('g39tf','FILTRO DE TEXTURAS',[['0','Píxel (sin filtro, estilo retro)'],['1','Bilineal'],['2','Trilineal'],['4','Anisotrópico ×4'],['8','Anisotrópico ×8'],['16','Anisotrópico ×16']])+
  sel('g39tq','CALIDAD DE TEXTURAS',[['.5','Baja'],['1','Alta']])+
  sel('g39cd','PROFUNDIDAD DE COLOR',[['8','8 bits (retro)'],['16','16 bits'],['24','24 bits (completa)']])+
  sel('g39cv','DETALLE DE CURVAS',[['.5','Bajo'],['.75','Medio'],['1','Normal'],['1.25','Alto'],['1.5','Muy alto']],'Segmentos de cilindros y esferas. Se aplica al empezar la próxima misión.')+
  sel('g39fx','EFECTOS DE PANTALLA',[['0','Mínimos'],['1','Completos']],'Sacudidas, desenfoque y velos de daño.')+'</div>');
 const map={g39aa:'aa',g39sh:'sh',g39tf:'tf',g39tq:'tq',g39cd:'cd',g39cv:'cv',g39fx:'fx'};
 const sync=()=>{for(const id in map){const s=$(id),v=+G[map[id]];let b=s.options[0].value,bd=1e9;for(const o of s.options){const d=Math.abs(+o.value-v);if(d<bd){bd=d;b=o.value}}s.value=b}};
 for(const id in map)$(id).onchange=()=>{G[map[id]]=+$(id).value;G.q='pers';$('g32q').value='pers';saveG();applyG()};
 const _q=q.onchange;q.onchange=()=>{_q();sync()};sync();if(PRE[G.q])q.value=G.q}
gfx39();setTimeout(gfx39,600);try{applyG()}catch(e){}
