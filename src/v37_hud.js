/* ============================================================
   v37 · HUD TÁCTIL, CONTROLES ANDROID Y OPTIMIZACIÓN DEL HUD
   Mezcla propia de móvil moderno + CoD1 + estilo militar del juego:
   joystick flotante con zona muerta, caminata lenta y carrera bloqueable,
   cámara en toda la mitad derecha (también arrastrando FUEGO/MIRA),
   botones en arcos alrededor de FUEGO, botones de contexto,
   indicadores de daño, postura, munición compacta, áreas seguras,
   escala por vmin y opciones en OPCIONES → CONTROLES TÁCTILES.
   Solo envuelve/reubica: todos los botones originales siguen vivos.
   ============================================================ */
const S37D={size:1,op:.85,sens:1,adsM:.6,acc:1,aa:1,adsMode:'toggle',f2:1,joy:'float',lefty:0,invY:0,off:{}};
const S37=Object.assign({},S37D,(()=>{try{return JSON.parse(localStorage.getItem('nilo_touch37')||'{}')||{}}catch(e){return{}}})());
if(!S37.off||typeof S37.off!=='object')S37.off={};
function save37(){try{localStorage.setItem('nilo_touch37',JSON.stringify(S37))}catch(e){}}
const H37={touch:('ontouchstart' in window)||(navigator.maxTouchPoints|0)>0,u:4,W:0,H:0,sl:0,sr:0,st:0,sb:0,L:{},R:50,tc:new Map(),ads:false,near:false,lock:false,arm:false,joy:null,dmg:[],obj:'',objT:0,am:'',st0:'',gr:-1,lv:-1,n:0,dbg:{fire:0,look:0,joy:0,ads:0,reset:0}};
/* ---------- estilos ---------- */
document.head.insertAdjacentHTML('beforeend','<style id="css37">'+
':root{--u:4px;--sl:0px;--sr:0px;--st:0px;--sb:0px;--op:.85}'+
'#sa37{position:fixed;left:0;top:0;width:0;height:0;visibility:hidden;pointer-events:none;padding:env(safe-area-inset-top,0px) env(safe-area-inset-right,0px) env(safe-area-inset-bottom,0px) env(safe-area-inset-left,0px)}'+
/* --- parte superior: objetivo compacto, brújula, minimapa --- */
'body.h37 #obj{top:calc(var(--st) + var(--u)*1.1)!important;left:50%!important;right:auto!important;width:auto!important;max-width:min(62vw,150vmin);transform:translateX(-50%);font-size:calc(var(--u)*3.05)!important;line-height:1.3;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;padding:calc(var(--u)*.45) calc(var(--u)*4.5);box-sizing:border-box;background:linear-gradient(90deg,transparent,rgba(12,13,8,.55) 14%,rgba(12,13,8,.55) 86%,transparent);letter-spacing:.04em}'+
'body.h37 #obj:empty{background:none}body.h37 #obj.full37{white-space:normal;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical}'+
'body.objf37 #cp27,body.objf37 #arrow{margin-top:calc(var(--u)*4)}body.h37 #cp27{top:calc(var(--st) + var(--u)*6.6)!important;width:min(calc(var(--u)*84),50vw)!important;height:auto!important;opacity:.92}'+
'body.h37 #arrow{top:calc(var(--st) + var(--u)*6.6)!important;font-size:calc(var(--u)*4.4)!important}'+
'body.h37 #t13{top:calc(var(--st) + var(--u)*15)!important;font-size:calc(var(--u)*5.5)!important}'+
'body.h37 #bb{top:calc(var(--st) + var(--u)*15.5)!important}'+
'body.h37 #mm27{left:calc(var(--sl) + var(--u)*2)!important;top:calc(var(--st) + var(--u)*2)!important;width:calc(var(--u)*26)!important;height:calc(var(--u)*26)!important}'+
'body.h37 #dist27{left:calc(var(--sl) + var(--u)*2)!important;top:calc(var(--st) + var(--u)*28.6)!important;width:calc(var(--u)*26)!important;font-size:calc(var(--u)*2.4)!important;letter-spacing:.12em}'+
'body.h37 #gar{left:calc(var(--sl) + var(--u)*2)!important;top:calc(var(--st) + var(--u)*32.4)!important;font-size:calc(var(--u)*2.55)!important;max-width:calc(var(--u)*46);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}'+
'body.h37 #score{left:calc(var(--sl) + var(--u)*40)!important;top:calc(var(--st) + var(--u)*1.6)!important;font-size:calc(var(--u)*3.6)!important}'+
'body.h37 #combo{left:calc(var(--sl) + var(--u)*40)!important;top:calc(var(--st) + var(--u)*6.6)!important}body.h37 #style{left:calc(var(--sl) + var(--u)*40)!important;top:calc(var(--st) + var(--u)*10)!important;font-size:calc(var(--u)*6)!important}'+
'body.h37 #feed{top:calc(var(--st) + var(--u)*13)!important;right:calc(var(--sr) + var(--u)*2)!important;font-size:calc(var(--u)*2.6)!important;max-width:calc(var(--u)*48)}'+
'body.h37 #ai20{top:calc(var(--st) + var(--u)*13)!important;right:calc(var(--sr) + var(--u)*24)!important}'+
/* --- centro: retícula limpia, avisos, indicadores de daño --- */
'body.h37 #cr{width:calc(var(--u)*.95);height:calc(var(--u)*.95);margin:calc(var(--u)*-.475);border:0;border-radius:50%;background:#fff;opacity:.88;filter:drop-shadow(0 0 1px #000)}'+
'body.h37 #cr::before,body.h37 #cr::after{content:"";position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:calc(var(--u)*6.6);height:calc(var(--u)*.36);background:linear-gradient(90deg,#fffd 0 30%,transparent 30% 70%,#fffd 70%);transition:width .12s,height .12s}'+
'body.h37 #cr::after{width:calc(var(--u)*.36);height:calc(var(--u)*6.6);background:linear-gradient(180deg,#fffd 0 30%,transparent 30% 70%,#fffd 70%)}'+
'body.ads37 #cr::before{width:calc(var(--u)*3.4)}body.ads37 #cr::after{height:calc(var(--u)*3.4)}'+
'body.near37 #cr{background:#ff6a4a}body.near37 #cr::before{background:linear-gradient(90deg,#ff6a4add 0 30%,transparent 30% 70%,#ff6a4add 70%)}body.near37 #cr::after{background:linear-gradient(180deg,#ff6a4add 0 30%,transparent 30% 70%,#ff6a4add 70%)}'+
'body.h37 #cr.hit{background:#ff3333;transform:scale(1.7)}body.h37 #cr.head{background:#ffd54a;transform:scale(2.1)}'+
'body.h37 #pr{top:64%;bottom:auto!important;left:50%!important;width:auto!important;max-width:58vw;transform:translateX(-50%);font-size:calc(var(--u)*3.2)!important;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;padding:0 calc(var(--u)*2);background:rgba(12,13,8,.45);border-radius:calc(var(--u)*1)}body.h37 #pr:empty{display:none}'+
'body.h37 #sub{left:50%!important;width:min(54vw,150vmin)!important;transform:translateX(-50%);bottom:calc(var(--sb) + var(--u)*11.5)!important;font-size:calc(var(--u)*3.25)!important}'+
'#dd37{position:absolute;left:50%;top:50%;width:0;height:0;pointer-events:none}'+
'.di37{position:absolute;left:calc(var(--u)*-10);top:calc(var(--u)*-1.7);width:calc(var(--u)*20);height:calc(var(--u)*3.4);border-radius:50% 50% 0 0/100% 100% 0 0;background:radial-gradient(ellipse at 50% 100%,rgba(255,50,30,.95) 0,rgba(190,20,0,.55) 42%,transparent 70%);opacity:0;will-change:transform,opacity}'+
/* --- abajo al centro: postura, salud, munición --- */
'body.h37 #hpw{left:calc(50% - var(--u)*30)!important;right:auto!important;top:auto!important;bottom:calc(var(--sb) + var(--u)*2.7)!important;width:calc(var(--u)*26)!important;height:calc(var(--u)*2.1)!important;border-color:rgba(201,164,90,.6)!important}'+
'body.h37 #stw{left:calc(50% - var(--u)*30)!important;bottom:calc(var(--sb) + var(--u)*1.5)!important;width:calc(var(--u)*26)!important;height:calc(var(--u)*.7)!important}'+
'#hl37{position:absolute;left:calc(50% - var(--u)*30);bottom:calc(var(--sb) + var(--u)*5.2);width:calc(var(--u)*26);display:flex;justify-content:space-between;font:bold calc(var(--u)*2.2) Georgia,serif;letter-spacing:.12em;color:#d8c48a;white-space:nowrap}#hl37 b{color:#e9f0d0}'+
'#sn37{position:absolute;left:calc(50% - var(--u)*37.5);bottom:calc(var(--sb) + var(--u)*1.2);width:calc(var(--u)*6.5);height:calc(var(--u)*7);color:#e8d8a0;opacity:.9}#sn37 svg{width:100%;height:100%}'+
'body.h37 #ammo,body.h37 #gc{opacity:0!important}'+
'#am37{position:absolute;left:calc(50% + var(--u)*1.5);bottom:calc(var(--sb) + var(--u)*1.1);max-width:calc(var(--u)*40);color:#f0dca0;font-family:Georgia,serif;white-space:nowrap;line-height:1.05}'+
'#am37 i{display:block;font:normal calc(var(--u)*2.1) Georgia,serif;letter-spacing:.1em;color:#cbb37a;overflow:hidden;text-overflow:ellipsis;font-style:normal}#am37 b{font-size:calc(var(--u)*4.6);letter-spacing:.04em}#am37 small{font-size:calc(var(--u)*2.6);color:#bba06a;margin-left:calc(var(--u)*.6)}#am37 em{font:normal calc(var(--u)*2.2) Georgia,serif;color:#d4e09a;margin-left:calc(var(--u)*1.6)}#am37.raw b{font-size:calc(var(--u)*2.6)}'+
/* --- botones táctiles --- */
'body.tch37 #jz,body.tch37 #tl{display:none!important}'+
'#lk37{position:absolute;inset:0;pointer-events:auto;touch-action:none}'+
'body.tch37 #tc .t{left:0!important;top:0!important;right:auto!important;bottom:auto!important;margin:0!important;box-sizing:border-box;border-radius:50%;background:radial-gradient(circle at 50% 36%,rgba(60,66,44,.6),rgba(15,17,11,.74));border:calc(var(--u)*.42) solid rgba(201,164,90,.6);color:#efd9a0;font:bold calc(var(--u)*1.95) Georgia,serif;letter-spacing:.06em;flex-direction:column;align-items:center;justify-content:center;opacity:var(--op);box-shadow:0 calc(var(--u)*.3) calc(var(--u)*1) rgba(0,0,0,.45),inset 0 0 0 calc(var(--u)*.22) rgba(0,0,0,.4);text-shadow:0 1px 2px #000;line-height:1;padding:0;will-change:transform;touch-action:none;transition:opacity .15s,border-color .15s}'+
'body.tch37 #tc .t svg{width:46%;height:46%;fill:none;stroke:currentColor;stroke-width:2.1;stroke-linecap:round;stroke-linejoin:round;margin-bottom:calc(var(--u)*.25);pointer-events:none}body.tch37 #tc .t span{pointer-events:none}'+
'body.tch37 #tc .t:active,body.tch37 #tc .t.on37{background:radial-gradient(circle at 50% 40%,rgba(150,120,60,.75),rgba(40,32,16,.85));border-color:#ffd27a;opacity:1}'+
'body.tch37 #tc #bf,body.tch37 #tc #ff37{border-width:calc(var(--u)*.6);color:#ffe4a8;background:radial-gradient(circle at 50% 36%,rgba(120,46,26,.66),rgba(34,12,8,.8));font-size:calc(var(--u)*2.4)}'+
'body.tch37 #tc #bf:active,body.tch37 #tc #ff37:active{background:radial-gradient(circle at 50% 40%,rgba(210,80,40,.8),rgba(70,20,10,.9))}'+
'body.tch37 #tc #bp,body.tch37 #tc #bv,body.tch37 #tc #bo,body.tch37 #tc #bmo17{border-radius:calc(var(--u)*1.8)}'+
'body.tch37 #tc .t.dim37{opacity:calc(var(--op)*.42)}body.tch37 #tc .x37{display:none!important}'+
'body.tch37 #tc .t.hot37{opacity:1;border-color:#ffd27a;color:#fff2c4;animation:hot37 1.1s ease-in-out infinite}@keyframes hot37{50%{box-shadow:0 0 0 calc(var(--u)*.9) rgba(255,210,122,.35),0 0 calc(var(--u)*3) rgba(255,190,80,.6)}}'+
'.n37{position:absolute;right:calc(var(--u)*-.6);top:calc(var(--u)*-.6);min-width:calc(var(--u)*3.6);height:calc(var(--u)*3.6);border-radius:calc(var(--u)*1.8);background:#c9a45a;color:#1b140d;font:bold calc(var(--u)*2.3) Georgia,serif;display:flex;align-items:center;justify-content:center;text-shadow:none}'+
'#jb37,#jk37{position:absolute;left:0;top:0;border-radius:50%;pointer-events:none;will-change:transform}'+
'#jb37{border:calc(var(--u)*.42) dashed rgba(201,164,90,.5);background:radial-gradient(circle,rgba(20,22,14,.12),rgba(20,22,14,.4));opacity:calc(var(--op)*.5);box-sizing:border-box}#jb37.on37{opacity:var(--op)}'+
'#jk37{background:radial-gradient(circle at 45% 40%,rgba(240,205,130,.95),rgba(170,128,60,.75));box-shadow:0 0 calc(var(--u)*1.2) rgba(0,0,0,.5);opacity:calc(var(--op)*.6)}#jk37.on37{opacity:1}#jk37.run37{background:radial-gradient(circle at 45% 40%,#ffe9a8,#e09a3a)}'+
'#jl37{position:absolute;left:0;top:0;box-sizing:border-box;border-radius:calc(var(--u)*1.6);border:calc(var(--u)*.35) solid rgba(201,164,90,.55);background:rgba(15,17,11,.6);color:#efd9a0;font:bold calc(var(--u)*1.8) Georgia,serif;letter-spacing:.08em;display:flex;align-items:center;justify-content:center;flex-direction:column;opacity:calc(var(--op)*.55);pointer-events:auto;touch-action:none;will-change:transform;line-height:1}'+
'#jl37.arm37{opacity:1;border-color:#ffd27a;background:rgba(120,90,30,.7)}#jl37.on37{opacity:1;border-color:#ffd27a;background:rgba(150,110,40,.85);color:#fff3c8}'+
/* --- editor de disposición --- */
'#ed37{position:fixed;inset:0;z-index:60;background:rgba(8,9,6,.82);display:none;touch-action:none;font-family:Georgia,serif;color:#efd9a0}#ed37 .k37{position:absolute;left:0;top:0;border-radius:50%;border:2px solid #c9a45a;background:rgba(60,66,44,.75);display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:bold;letter-spacing:1px;touch-action:none;cursor:grab;box-sizing:border-box}#ed37 .k37.g37{border-color:#ffd27a;background:rgba(150,110,40,.85)}'+
'#ed37 .bar37{position:absolute;left:50%;top:40%;transform:translate(-50%,-50%);display:flex;gap:10px;flex-wrap:wrap;justify-content:center;max-width:70vw;text-align:center}#ed37 .bar37 p{width:100%;margin:0;font-size:13px;opacity:.85}#ed37 button{margin:0;padding:8px 16px;font-size:13px}'+
'</style>');
document.body.insertAdjacentHTML('beforeend','<div id="sa37"></div>');
document.body.classList.add('h37');
/* ---------- iconos ---------- */
const IC37={fire:'<path d="M10 3h4l1.5 4.5V21h-7V7.5z"/><path d="M8.5 16h7"/>',ads:'<circle cx="12" cy="12" r="7"/><path d="M12 2v5M12 17v5M2 12h5M17 12h5"/>',rec:'<path d="M20 12a8 8 0 1 1-2.4-5.7"/><path d="M20 4v5h-5"/>',jump:'<path d="M5 14l7-7 7 7"/><path d="M5 20h14"/>',
 crouch:'<path d="M5 8l7 7 7-7"/><path d="M5 20h14"/>',prone:'<path d="M5 5l7 6 7-6M5 12l7 6 7-6"/>',gren:'<circle cx="12" cy="14.5" r="6"/><path d="M10 8.5V5.5h4v3M14 5.5l3-2"/>',melee:'<path d="M5 19l4-4"/><path d="M8.5 15.5L19 5v4l-8.5 8.5z"/>',swap:'<path d="M4 8h14l-3.5-3.5M20 16H6l3.5 3.5"/>',
 roll:'<path d="M5 12a7 7 0 1 0 2.2-5.1"/><path d="M5 4v4h4"/>',cover:'<path d="M12 3l8 3v6c0 5-4 8-8 9-4-1-8-4-8-9V6z"/>',use:'<path d="M7 21V4h10v17"/><path d="M14 12.5h.8"/><path d="M4 21h16"/>',ord:'<path d="M6 21V4"/><path d="M6 4h12l-3 4 3 4H6"/>',mor:'<path d="M8.5 20L12 5l3.5 15"/><path d="M6 20h12"/>',
 pause:'<path d="M9 5v14M15 5v14"/>',eye:'<path d="M2 12s4-6.5 10-6.5S22 12 22 12s-4 6.5-10 6.5S2 12 2 12z"/><circle cx="12" cy="12" r="2.8"/>'};
const svg37=k=>'<svg viewBox="0 0 24 24">'+IC37[k]+'</svg>';
/* ---------- utilidades ---------- */
const sst37=(a,b,x)=>{const t=Math.max(0,Math.min(1,(x-a)/(b-a)));return t*t*(3-2*t)};
const css37=(el,p,v)=>el.style.setProperty(p,v,'important');
/* evita escrituras repetidas del HUD (sin cambio = sin recálculo de estilo/maquetación) */
function dd37(el){if(!el||el.dd37)return;el.dd37=1;const tc=Object.getOwnPropertyDescriptor(Node.prototype,'textContent'),ih=Object.getOwnPropertyDescriptor(Element.prototype,'innerHTML');if(!tc||!ih)return;
 Object.defineProperty(el,'textContent',{configurable:true,get(){return tc.get.call(this)},set(v){v=v==null?'':String(v);const f=this.firstChild;if(v===''?!f:(f&&!f.nextSibling&&f.nodeType===3&&f.data===v))return;tc.set.call(this,v)}});
 Object.defineProperty(el,'innerHTML',{configurable:true,get(){return ih.get.call(this)},set(v){v=v==null?'':String(v);if(ih.get.call(this)===v)return;ih.set.call(this,v)}})}
const DD37=['obj','pr','ammo','gc','score','gar','dist27','feed','combo','style','t13','ai20','sub'];
function ddAll37(){for(const id of DD37){const e=$(id);if(e&&!e.dd37)dd37(e)}}
ddAll37();
/* ---------- puntería (MIRA / ADS) ---------- */
{let base=+G.fov||65;const zf=()=>{if(!H37.ads)return 1;return P&&P.cur==='rifle'?.66:P&&P.cur==='revolver'?.84:.78};
 try{Object.defineProperty(G,'fov',{configurable:true,enumerable:true,get(){return base*zf()},set(v){base=+v||65}});
  Object.defineProperty(G,'toJSON',{configurable:true,enumerable:false,value(){const o={};for(const k in this)o[k]=this[k];o.fov=base;return o}})}catch(e){}}
function ads37(on){on=!!on;if(on===H37.ads)return;H37.ads=on;H37.dbg.ads++;document.body.classList.toggle('ads37',on);const b=$('ad37');if(b)b.classList.toggle('on37',on);
 if(on){if(typeof P!=='undefined')P.aim=1}else if(typeof P!=='undefined'&&!P.mg&&!P.gun9)P.aim=0}
{const _p=pSpread;pSpread=function(){const k=_p.apply(this,arguments);return H37.ads?k*.45:k}}
/* PC: clic derecho mantenido = mirar por la mira (sin disparar) */
addEventListener('mousedown',e=>{if(e.button===2&&playing&&e.target===rend.domElement){e.stopImmediatePropagation();ads37(true)}},true);
addEventListener('mouseup',e=>{if(e.button===2&&H37.ads)ads37(false)},true);
rend.domElement.addEventListener('contextmenu',e=>e.preventDefault());
/* ---------- indicadores de daño ---------- */
{const hud=$('hud');hud.insertAdjacentHTML('beforeend','<div id="dd37">'+'<i class="di37"></i>'.repeat(4)+'</div><div id="sn37"></div><div id="hl37"><span id="hs37">DE PIE</span><b id="hn37"></b></div><div id="am37"></div>');
 H37.dmg=[...$('dd37').children].map(el=>({el,x:0,z:0,t:-9}))}
function dmgRot37(d){const p=P.g.position,sx=d.x-p.x,sz=d.z-p.z;const fx=-Math.sin(yaw),fz=-Math.cos(yaw),rx=Math.cos(yaw),rz=-Math.sin(yaw);const a=Math.atan2(sx*rx+sz*rz,sx*fx+sz*fz);d.el.style.transform='rotate('+a.toFixed(3)+'rad) translateY(calc(var(--u)*-21))'}
function dmgDir37(){if(typeof P==='undefined'||!P.g)return;const p=P.g.position;let sx=null,sz=null;
 if(typeof ebul!=='undefined')for(const b of ebul){if(!b||!b.m||!b.v)continue;const q=b.m.position;if(Math.hypot(q.x-p.x,q.z-p.z)<2.2){const l=Math.hypot(b.v.x,b.v.z)||1;sx=p.x-b.v.x/l*30;sz=p.z-b.v.z/l*30;break}}
 if(sx===null&&typeof enemies!=='undefined'){let bd=75;for(const e of enemies){if(!e||!e.g||e.hp<=0)continue;const q=e.g.position,d=Math.hypot(q.x-p.x,q.z-p.z);if(d<bd){bd=d;sx=q.x;sz=q.z}}}
 if(sx===null)return;let d=H37.dmg[0];for(const o of H37.dmg)if(o.t<d.t)d=o;d.x=sx;d.z=sz;d.t=performance.now();dmgRot37(d);const el=d.el;el.style.transition='none';el.style.opacity='1';void el.offsetWidth;el.style.transition='opacity 1.7s ease-in';el.style.opacity='0'}
{const _h=hitP;hitP=function(d){const h0=typeof P!=='undefined'?P.hp:0;const r=_h.apply(this,arguments);try{if(P.hp<h0)dmgDir37()}catch(e){}return r}}
/* ---------- capa táctil ---------- */
const BT37={bf:['fire','FUEGO'],br:['rec','REC'],bro:['roll','ROD'],bm:['melee','MELÉ'],bg:['gren','GRAN'],bw:['swap','ARMA'],bj:['jump','SALTO'],bv:['eye','1ª/3ª'],bi:['use','USAR'],bp:['pause',''],bk:['crouch','AGA'],bo:['ord','ORD'],btu:['prone','TUM'],bcv:['cover','CUB'],bmo17:['mor','MOR'],ff37:['fire','FUEGO'],ad37:['ads','MIRA']};
function lay37(){const W=innerWidth,Hh=innerHeight;H37.W=W;H37.H=Hh;const cs=getComputedStyle($('sa37'));const sl=parseFloat(cs.paddingLeft)||0,sr=parseFloat(cs.paddingRight)||0,st=parseFloat(cs.paddingTop)||0,sb=parseFloat(cs.paddingBottom)||0;Object.assign(H37,{sl,sr,st,sb});
 const u=Math.min(Math.min(W,Hh)/100,6.4)*(+S37.size||1);H37.u=u;const rs=document.documentElement.style;rs.setProperty('--u',u.toFixed(2)+'px');rs.setProperty('--sl',sl+'px');rs.setProperty('--sr',sr+'px');rs.setProperty('--st',st+'px');rs.setProperty('--sb',sb+'px');rs.setProperty('--op',String(+S37.op||.85));
 const L={},F=[W-sr-14.5*u,Hh-sb-18.5*u];const add=(k,x,y,s)=>{const o=S37.off[k];if(o){x+=o[0]*u;y+=o[1]*u}L[k]={x,y,s:s*u}};
 const pol=(k,a,r,s)=>add(k,F[0]+Math.cos(a*Math.PI/180)*r*u,F[1]-Math.sin(a*Math.PI/180)*r*u,s);
 add('bf',F[0],F[1],19);pol('br',182,20.5,11.5);pol('ad37',143,20.5,11.5);pol('bj',106,20.5,11.5);pol('btu',70,20.5,11.5);
 pol('bm',197,35,10);pol('bg',175,35,10);pol('bw',153,35,10);pol('bro',131,35,10);pol('bcv',109,35,10);pol('bi',88,35,10.5);
 add('bp',W-sr-6*u,st+6*u,9);add('bv',W-sr-17*u,st+6*u,9);add('bo',sl+33*u,st+6.5*u,9.5);add('bmo17',sl+33*u,st+17.5*u,9.5);
 add('bk',sl+44*u,Hh-sb-8.5*u,11);add('ff37',sl+8.5*u,Hh-sb-58*u,13);add('joy',sl+21*u,Hh-sb-21*u,28);
 if(+S37.lefty)for(const k in L){if(k==='bp'||k==='bv'||k==='bo'||k==='bmo17')continue;L[k].x=W-L[k].x}
 H37.L=L;H37.R=14*u;if(!H37.touch)return;
 for(const k in L){if(k==='joy')continue;const el=$(k);if(!el)continue;const o=L[k];css37(el,'width',o.s.toFixed(1)+'px');css37(el,'height',o.s.toFixed(1)+'px');css37(el,'transform','translate3d('+(o.x-o.s/2).toFixed(1)+'px,'+(o.y-o.s/2).toFixed(1)+'px,0)')}
 const R=H37.R,jb=$('jb37'),jk=$('jk37'),jl=$('jl37');jb.style.width=jb.style.height=2*R+'px';jk.style.width=jk.style.height=R*.9+'px';jl.style.width=10*u+'px';jl.style.height=7*u+'px';if(!H37.joy)joyIdle37()}
function joyDraw37(bx,by,kx,ky){const R=H37.R;$('jb37').style.transform='translate3d('+(bx-R).toFixed(1)+'px,'+(by-R).toFixed(1)+'px,0)';$('jk37').style.transform='translate3d('+(kx-R*.45).toFixed(1)+'px,'+(ky-R*.45).toFixed(1)+'px,0)';
 const u=H37.u;$('jl37').style.transform='translate3d('+(bx-5*u).toFixed(1)+'px,'+(by-1.95*R-3.5*u).toFixed(1)+'px,0)'}
function joyIdle37(){const j=H37.L.joy;if(!j||!H37.touch||!$('jb37'))return;joyDraw37(j.x,j.y,j.x,j.y);$('jb37').classList.remove('on37');$('jk37').classList.remove('on37','run37');$('jl37').classList.remove('arm37')}
function lock37(on){on=!!on;H37.lock=on;const jl=$('jl37');if(jl){jl.classList.toggle('on37',on);jl.innerHTML=on?'<span>▲▲</span><span>BLOQ.</span>':'<span>▲</span><span>CORRER</span>'}
 if(on){tmOn=true;tm.x=0;tm.y=-1;if(H37.ads)ads37(false)}else if(!H37.joy){tmOn=false;tm.x=tm.y=0}}
function joy37(en,x,y){const R=H37.R;let dx=x-en.bx,dy=y-en.by,d=Math.hypot(dx,dy);
 if(S37.joy==='float'&&d>1.7*R&&!(dy<-1.2*R&&Math.abs(dx)<1.2*R)){const k=(d-1.7*R)/d;en.bx+=dx*k;en.by+=dy*k;dx=x-en.bx;dy=y-en.by;d=Math.hypot(dx,dy)}
 const arm=dy<-1.55*R&&Math.abs(dx)<1.15*R;if(arm!==H37.arm){H37.arm=arm;$('jl37').classList.toggle('arm37',arm)}
 const m=d/R;let mo=m>.12?Math.min(1,(m-.12)/.83):0;if(mo<1)mo=Math.pow(mo,1.25);
 if(arm){tm.x=0;tm.y=-1}else if(d>0){tm.x=dx/d*mo;tm.y=dy/d*mo}else tm.x=tm.y=0;tmOn=true;
 const kd=Math.min(d,R),kx=d>0?en.bx+dx/d*kd:en.bx,ky=d>0?en.by+dy/d*kd:en.by;joyDraw37(en.bx,en.by,kx,ky);$('jk37').classList.toggle('run37',arm||mo>=1)}
function look37(en,x,y,ts){const dx=x-en.x,dy=y-en.y;en.x=x;en.y=y;if(!dx&&!dy)return;const dt=Math.max(.004,Math.min(.1,(ts-en.t)/1000));en.t=ts;const vm=Math.min(H37.W,H37.H)||400;
 en.v=en.v*.55+Math.hypot(dx,dy)/vm/dt*.45;let k=2.06/vm*(+G.sens||1)*(+S37.sens||1);if(+S37.acc)k*=.82+.62*sst37(.35,2.6,en.v);if(H37.ads)k*=+S37.adsM||.6;if(+S37.aa&&H37.near&&en.v<1.7)k*=.6;
 yaw-=dx*k;const lo=Math.min(-.25,pitch),hi=Math.max(1.1,pitch);pitch=clamp(pitch+dy*k*(+S37.invY?-1:1),lo,hi);H37.dbg.look++}
function fireSync37(){let f=false;for(const en of H37.tc.values())if(en.k==='fire'){f=true;break}firing=f}
function rel37(id,cancel){const en=H37.tc.get(id);if(!en)return;H37.tc.delete(id);
 if(en.k==='joy'){H37.joy=null;const arm=H37.arm&&!cancel;H37.arm=false;if(arm)lock37(true);else if(!H37.lock){tmOn=false;tm.x=tm.y=0}joyIdle37()}
 else if(en.k==='fire')fireSync37();else if(en.k==='ads'&&S37.adsMode==='hold')ads37(false)}
function sweep37(list){if(!H37.tc.size)return;const ids=new Set();for(const t of list)ids.add(t.identifier);for(const id of [...H37.tc.keys()])if(!ids.has(id))rel37(id,true)}
function reset37(){for(const id of [...H37.tc.keys()])rel37(id,true);H37.tc.clear();H37.joy=null;H37.arm=false;lock37(false);if(H37.touch)firing=false;tmOn=false;tm.x=tm.y=0;try{tmID=null;tlID=null}catch(e){}if(typeof L8!=='undefined')L8.hold=false;if(S37.adsMode==='hold')ads37(false);joyIdle37();H37.dbg.reset++}
function inJoy37(x,y){const W=H37.W,Hh=H37.H;return (+S37.lefty?x>W*.58:x<W*.42)&&y>Hh*.3}
function tc37(){if(!H37.touch)return;const tc=$('tc');document.body.classList.add('tch37');
 tc.insertAdjacentHTML('afterbegin','<div id="lk37"></div><div id="jb37"></div><div id="jk37"></div><div id="jl37"></div>');
 tc.insertAdjacentHTML('beforeend','<div id="ff37" class="t"></div><div id="ad37" class="t"></div>');
 for(const id in BT37){const el=$(id);if(!el)continue;const [ic,lb]=BT37[id];el.innerHTML=svg37(ic)+(lb?'<span>'+lb+'</span>':'')+(id==='bg'?'<b class="n37" id="gn37"></b>':'')}
 lock37(false);
 $('lk37').addEventListener('touchstart',e=>{e.preventDefault();for(const t of e.changedTouches){const x=t.clientX,y=t.clientY;if(H37.tc.has(t.identifier))continue;
   if(!H37.joy&&inJoy37(x,y)){if(H37.lock)lock37(false);const j=H37.L.joy;let bx=x,by=y;if(S37.joy!=='float'&&j&&Math.hypot(x-j.x,y-j.y)<2.2*H37.R){bx=j.x;by=j.y}else{const R=H37.R;bx=clamp(x,H37.sl+R*1.05,H37.W-H37.sr-R*1.05);by=clamp(y,H37.st+R*2.6,H37.H-H37.sb-R*1.05)}
    const en={k:'joy',bx,by};H37.tc.set(t.identifier,en);H37.joy=en;H37.dbg.joy++;$('jb37').classList.add('on37');$('jk37').classList.add('on37');joy37(en,x,y)}
   else H37.tc.set(t.identifier,{k:'look',lk:1,x,y,t:e.timeStamp,v:0})}},{passive:false});
 $('jl37').addEventListener('touchstart',e=>{e.preventDefault();lock37(!H37.lock)},{passive:false});
 $('ff37').addEventListener('touchstart',e=>{e.preventDefault();for(const t of e.changedTouches)H37.tc.set(t.identifier,{k:'fire',lk:1,x:t.clientX,y:t.clientY,t:e.timeStamp,v:0});firing=true;H37.dbg.fire++;fire()},{passive:false});
 $('ad37').addEventListener('touchstart',e=>{e.preventDefault();for(const t of e.changedTouches)H37.tc.set(t.identifier,{k:'ads',lk:1,x:t.clientX,y:t.clientY,t:e.timeStamp,v:0});if(S37.adsMode==='hold')ads37(true);else ads37(!H37.ads)},{passive:false});
 /* FUEGO principal: sigue disparando con su propio código y además el dedo mueve la cámara */
 addEventListener('touchstart',e=>{for(const t of e.changedTouches){if(H37.tc.has(t.identifier))continue;const tg=t.target;if(tg&&tg.closest&&tg.closest('#bf')){H37.tc.set(t.identifier,{k:'fire',lk:1,x:t.clientX,y:t.clientY,t:e.timeStamp,v:0});H37.dbg.fire++}}sweep37(e.touches)},{passive:true});
 addEventListener('touchmove',e=>{for(const t of e.changedTouches){const en=H37.tc.get(t.identifier);if(!en)continue;if(en.k==='joy')joy37(en,t.clientX,t.clientY);else if(en.lk)look37(en,t.clientX,t.clientY,e.timeStamp)}},{passive:true});
 const end=e=>{for(const t of e.changedTouches)rel37(t.identifier,e.type==='touchcancel');sweep37(e.touches)};
 addEventListener('touchend',end,{passive:true});addEventListener('touchcancel',end,{passive:true});
 addEventListener('blur',reset37);addEventListener('pagehide',reset37);document.addEventListener('visibilitychange',()=>{if(document.hidden)reset37()});
 let rT=0;const rl=()=>{clearTimeout(rT);rT=setTimeout(lay37,120)};addEventListener('resize',rl);addEventListener('orientationchange',rl)}
tc37();lay37();
/* ---------- marcador a 10 Hz (sin escrituras si nada cambió) ---------- */
const STN37={st:['DE PIE','<circle cx="12" cy="4" r="2.2"/><path d="M12 7v7M8 10l4-2 4 2M12 14l-3 7M12 14l3 7"/>'],cr:['AGACHADO','<circle cx="11" cy="7" r="2.2"/><path d="M11 10l1 5M8 12l4-1 4 2M12 15l-4 1 1 5M12 15l4 2v4"/>'],pr:['CUERPO A TIERRA','<circle cx="5" cy="15" r="2.2"/><path d="M7.5 16h12M10 16l3-2.5M16 16l3 2"/>'],veh:['VEHÍCULO','<rect x="3" y="10" width="18" height="7" rx="2"/><path d="M8 10V7h7v3M15 8h6"/>'],mg:['EMPLAZADO','<path d="M4 18l6-6M10 12h10M14 12v-3"/><circle cx="12" cy="4" r="2"/>']};
const V37=new THREE.Vector3();
function tick37(){H37.n++;ddAll37();if(typeof P==='undefined')return;const tc=$('tc'),on=playing&&tc&&tc.style.display==='block';
 if(H37.touch){if(!on&&(H37.tc.size||H37.lock))reset37();else if(H37.lock){tmOn=true;tm.x=0;tm.y=-1}}
 if(H37.ads&&(!playing||(tmOn&&Math.hypot(tm.x,tm.y)>.92)||P.veh))ads37(false);if(H37.ads&&!P.mg)P.aim=1;
 if(level!==H37.lv){H37.lv=level;if(H37.ads)ads37(false)}
 /* fricción de puntería / retícula roja sobre enemigos */
 let near=false;if(playing&&typeof enemies!=='undefined'&&enemies.length){cam.getWorldDirection(V37);const cp=cam.position;const n=Math.min(enemies.length,220);for(let i=0;i<n;i++){const e=enemies[i];if(!e||!e.g||e.hp<=0||e.g.visible===false)continue;const p=e.g.position,s=e.s||1;const dx=p.x-cp.x,dy=p.y+1.25*s-cp.y,dz=p.z-cp.z,d=Math.hypot(dx,dy,dz);if(d<1.5||d>150)continue;if((dx*V37.x+dy*V37.y+dz*V37.z)/d>Math.cos(Math.atan(.75*s/d)+.012)){near=true;break}}}
 if(near!==H37.near){H37.near=near;document.body.classList.toggle('near37',near)}
 /* daño: el indicador sigue apuntando a la fuente mientras gira la cámara */
 const now=performance.now();for(const d of H37.dmg)if(now-d.t<1800&&P.g)dmgRot37(d);
 /* postura y salud */
 const sk=P.veh?'veh':P.mg?'mg':P.pr?'pr':P.cr?'cr':'st',sv=sk+(P.cover?'c':'')+(H37.ads?'a':'');if(sv!==H37.st0){H37.st0=sv;const s=STN37[sk];$('sn37').innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">'+s[1]+'</svg>';$('hs37').textContent=s[0]+(P.cover?' · CUBIERTO':'')+(H37.ads?' · MIRA':'')}
 const hp=Math.max(0,Math.round(P.hp))+'';const hn=$('hn37');if(hn.textContent!==hp)hn.textContent=hp;
 /* munición: «ARMA · 8 / 24 · …» → nombre pequeño + números grandes */
 const at=(($('ammo')||{}).textContent||'').trim(),gn=P.grenades|0,ak=at+'|'+gn;if(ak!==H37.am){H37.am=ak;const am=$('am37');const sg=at.split(' · ');let i=sg.findIndex(s=>/^\s*\d+\s*\/\s*\d+/.test(s));
  const esc=s=>s.replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));
  if(i>=0){const m=sg[i].match(/^\s*(\d+)\s*\/\s*(\d+)(.*)$/);am.className='';am.innerHTML='<i>'+esc(sg.filter((s,j)=>j!==i).join(' · '))+'</i><b>'+m[1]+'</b><small>/ '+m[2]+esc(m[3]||'')+'</small>'+(gn?'<em>GRAN ×'+gn+'</em>':'')}
  else{am.className='raw';am.innerHTML='<b>'+esc(at)+'</b>'+(gn?'<em>GRAN ×'+gn+'</em>':'')}}
 /* objetivo: completo (2 líneas) unos segundos cuando cambia, después compacto en 1 línea */
 const ob=$('obj');if(ob){const t=ob.textContent;if(t!==H37.obj){H37.obj=t;H37.objT=now;ob.classList.add('full37');document.body.classList.toggle('objf37',ob.scrollHeight>ob.clientHeight+2||ob.getClientRects().length&&ob.offsetHeight>H37.u*6)}else if(H37.objT&&now-H37.objT>4500){H37.objT=0;ob.classList.remove('full37');document.body.classList.remove('objf37')}}
 if(!H37.touch)return;
 /* botones de contexto */
 const pr=(($('pr')||{}).textContent||''),otx=ob?ob.textContent:'';const use=/USAR|E \//.test(pr)||/USAR/.test(otx)||!!P.mg||!!P.gun9||!!P.veh,cub=/CUB/.test(pr)||!!P.cover;
 const cl=(id,c,v)=>{const e=$(id);if(e&&e.classList.contains(c)!==!!v)e.classList.toggle(c,!!v)};
 cl('bi','hot37',use);cl('bi','dim37',!use);cl('bcv','hot37',cub);cl('bv','x37',level>=13);cl('bo','x37',level<8);cl('ff37','x37',!+S37.f2);cl('bg','dim37',gn<=0);
 if(gn!==H37.gr){H37.gr=gn;const b=$('gn37');if(b)b.textContent=gn}}
setInterval(tick37,100);
/* ---------- editor de disposición ---------- */
function edit37(){if(!H37.touch){alert('El editor de botones es para pantallas táctiles.');return}let ed=$('ed37');if(!ed){document.body.insertAdjacentHTML('beforeend','<div id="ed37"></div>');ed=$('ed37')}
 lay37();const L=H37.L,u=H37.u,W=H37.W,mir=+S37.lefty;const off=JSON.parse(JSON.stringify(S37.off||{}));
 const nm=k=>k==='joy'?'MOVER':((BT37[k]||[])[1]||'II');let h='<div class="bar37"><p>Arrastrá los botones a tu gusto.</p><button id="eds37">Guardar</button><button id="edr37" style="background:#6a4a2a;color:#f3e6c4">Restablecer</button><button id="edc37" style="background:#3a3a30;color:#f3e6c4">Cancelar</button></div>';
 for(const k in L){const o=L[k],s=k==='joy'?o.s*.6:o.s;h+='<div class="k37'+(k==='joy'?' g37':'')+'" data-k="'+k+'" style="width:'+s+'px;height:'+s+'px;transform:translate3d('+(o.x-s/2)+'px,'+(o.y-s/2)+'px,0)">'+nm(k)+'</div>'}
 ed.innerHTML=h;ed.style.display='block';
 for(const el of ed.querySelectorAll('.k37')){const k=el.dataset.k;let sx=0,sy=0,ox=0,oy=0,pid=null;const o=L[k],s=parseFloat(el.style.width);
  el.addEventListener('pointerdown',e=>{pid=e.pointerId;sx=e.clientX;sy=e.clientY;const q=off[k]||[0,0];ox=q[0];oy=q[1];try{el.setPointerCapture(pid)}catch(_){}e.preventDefault()});
  el.addEventListener('pointermove',e=>{if(e.pointerId!==pid)return;const dx=(e.clientX-sx)/u,dy=(e.clientY-sy)/u;off[k]=[+(ox+(mir&&!/^(bp|bv|bo|bmo17)$/.test(k)?-dx:dx)).toFixed(2),+(oy+dy).toFixed(2)];el.style.transform='translate3d('+(o.x+(e.clientX-sx)-s/2)+'px,'+(o.y+(e.clientY-sy)-s/2)+'px,0)'});
  const up=e=>{if(e.pointerId!==pid)return;pid=null};el.addEventListener('pointerup',up);el.addEventListener('pointercancel',up)}
 $('eds37').onclick=()=>{S37.off=off;save37();ed.style.display='none';lay37()};$('edc37').onclick=()=>{ed.style.display='none';lay37()};
 $('edr37').onclick=()=>{S37.off={};save37();ed.style.display='none';lay37();edit37()}}
/* ---------- OPCIONES → CONTROLES TÁCTILES ---------- */
function opt37(){const O=$('cpO');if(!O||$('opt37'))return;
 const S='background:#24190e;color:#f3e6c4;border:1px solid #8a6a35;padding:6px;font:14px Georgia,serif';
 const sel=(id,lab,opts,hint)=>'<label>'+lab+' <select id="'+id+'" style="'+S+'">'+opts.map(o=>'<option value="'+o[0]+'">'+o[1]+'</option>').join('')+'</select>'+(hint?'<small style="display:block;color:#a8946a;letter-spacing:0;font-size:12px">'+hint+'</small>':'')+'</label>';
 const pc=a=>a.map(v=>[v,Math.round(v*100)+' %']);
 O.insertAdjacentHTML('beforeend','<div id="opt37"><h2 style="margin-top:22px">CONTROLES TÁCTILES</h2>'+
  sel('o37size','TAMAÑO DEL HUD',pc([.8,.9,1,1.1,1.2,1.35]),'Botones, joystick y textos se escalan con la pantalla.')+
  sel('o37op','OPACIDAD DE LOS BOTONES',pc([.45,.6,.75,.85,1]))+
  sel('o37sens','SENSIBILIDAD DE CÁMARA',[[.5,'Muy baja'],[.7,'Baja'],[.85,'Media baja'],[1,'Normal'],[1.2,'Media alta'],[1.45,'Alta'],[1.8,'Muy alta']])+
  sel('o37adsM','SENSIBILIDAD AL APUNTAR (MIRA)',pc([.4,.5,.6,.75,.9,1]))+
  sel('o37acc','CURVA DE SENSIBILIDAD',[[1,'Progresiva · lento = preciso, rápido = giro amplio'],[0,'Lineal']])+
  sel('o37aa','FRICCIÓN DE PUNTERÍA',[[1,'Activada · frena la cámara sobre enemigos'],[0,'Desactivada']])+
  sel('o37adsMode','BOTÓN MIRA',[['toggle','Tocar para alternar'],['hold','Mantener']])+
  sel('o37f2','SEGUNDO BOTÓN DE FUEGO (IZQUIERDA)',[[1,'Visible'],[0,'Oculto']])+
  sel('o37joy','JOYSTICK',[['float','Flotante · aparece donde apoyás el pulgar'],['fixed','Fijo']],'Empujalo hasta arriba (▲ CORRER) para trabar la carrera.')+
  sel('o37lefty','DISPOSICIÓN',[[0,'Diestro · disparo a la derecha'],[1,'Zurdo · espejada']])+
  sel('o37invY','EJE VERTICAL',[[0,'Normal'],[1,'Invertido']])+
  '<label><button id="o37ed" style="margin:4px 6px 0 0;padding:8px 14px;font-size:13px">Personalizar botones</button><button id="o37rs" style="margin:4px 0 0;padding:8px 14px;font-size:13px;background:#6a4a2a;color:#f3e6c4">Restablecer controles</button></label></div>');
 const map={o37size:'size',o37op:'op',o37sens:'sens',o37adsM:'adsM',o37acc:'acc',o37aa:'aa',o37adsMode:'adsMode',o37f2:'f2',o37joy:'joy',o37lefty:'lefty',o37invY:'invY'};
 const sync=()=>{for(const id in map){const s=$(id),v=S37[map[id]];if(typeof v==='string'){s.value=v;continue}let b=null,bd=1e9;for(const o of s.options){const d=Math.abs(+o.value-v);if(d<bd){bd=d;b=o.value}}s.value=b}};
 for(const id in map)$(id).onchange=()=>{const v=$(id).value;S37[map[id]]=isNaN(+v)?v:+v;save37();lay37();if(map[id]==='adsMode'&&H37.ads)ads37(false)};
 $('o37ed').onclick=e=>{e.preventDefault();edit37()};$('o37rs').onclick=e=>{e.preventDefault();Object.assign(S37,JSON.parse(JSON.stringify(S37D)));save37();lay37();sync()};sync()}
opt37();if(!$('opt37'))setTimeout(opt37,700);
{const b=document.querySelector('#cod [data-p=cpO] small');if(b&&!/táctil/.test(b.textContent))b.textContent=b.textContent+', controles táctiles'}
