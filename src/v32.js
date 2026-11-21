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
