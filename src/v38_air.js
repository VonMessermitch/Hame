/* =====================================================================
   v38 · AIR38 — guerra aérea del nivel 18 «Martillo de Nieve»
   Cazas Volskaya V-19 «Chaika-Saetta» (A, B rápido, D «Picador» bombardero en picado)
   contra grifos acorazados Veyrn con caballeros (scout/line/heavy/lancer/captain/guard)
   y el jefe Capitán Rauth sobre «Eisenkrall» ('rauth').
   Autocontenido: todo lo de otros módulos se llama con typeof. Coordenadas locales
   (x relativo a X18, z absoluto) salvo que se pase {world:true}.
   API: airSpawn38(type,variant,opts) · airUpd38(dt) · airWave38(spec) · airDmg38(a,d,kind,by,zone)
        airHitRay38(o,dir,range,dmg,by) · airOrder38(a,ord) · airClear38() · airNear38(x,z,r)
        AIR38.{list,onKill,onSpawn,onDismount,onLand,onRetreat,ko,aa,landSites,fog,auto,origin(),stats()}
   ===================================================================== */
const AIR38={list:[],pend:[],bombs:[],deb:[],tq:[],onKill:null,onSpawn:null,onDismount:null,onLand:null,onRetreat:null,
 max:{g:6,p:4},x0:null,auto:true,fog:null,ko:[],aa:[],landSites:[],gfire:true,ff:.5,rearm:35,home:[0,900],center:[0,-400],
 dbg:{kG:0,kP:0,fled:0,shots:0,hitsG:0,claws:0,pist:0,pistHit:0,bombs:0,dism:0,ms:0,msMax:0,n:0,by:{}},fr:0,lfr:-1,rr:0,t:0,dtL:.033,
 origin(x){this.x0=x},
 stats(){const d=this.dbg;return{alive:this.list.filter(a=>a.alive).map(a=>a.type+':'+a.var+':'+a.st+':'+Math.round(a.hp)),kG:d.kG,kP:d.kP,fled:d.fled,by:d.by,claws:d.claws,pist:d.pist,pistHit:d.pistHit,bombs:d.bombs,dism:d.dism,shots:d.shots,hitsG:d.hitsG,aiMs:d.n?+(d.ms/d.n).toFixed(3):0,aiMsMax:+d.msMax.toFixed(2)}}};
const A38a=new T.Vector3(),A38b=new T.Vector3(),A38c=new T.Vector3(),A38d=new T.Vector3(),A38m=new T.Matrix4(),A38G={};
const R38=()=>Math.random();
function X0a38(){if(AIR38.x0!=null)return AIR38.x0;try{return X18}catch(e){return 200000}}
function fl38(xw,zw){try{if(typeof level!=='undefined'){if(level===18&&typeof floor18==='function')return floor18(xw-X0a38(),zw)||0;if(level===17&&typeof floor17==='function')return floor17(xw-(typeof XL17!=='undefined'?XL17:160000),zw)||0}}catch(e){}return 0}
function sh38(c,k){return Math.min(255,((c>>16)&255)*k|0)<<16|Math.min(255,((c>>8)&255)*k|0)<<8|Math.min(255,(c&255)*k|0)}
function lat38(t,f){AIR38.tq.push({t,f})}
function det38(){return typeof G!=='undefined'&&G&&G.detail!=null?G.detail:1}
function snd38(n,v,x,z,o){if(typeof samp34==='function')try{return samp34(n,v,1,x,z,o)}catch(e){}return false}
function tn38(a,b,c,d,e,f){if(typeof tn18==='function')try{tn18(a,b,c,d,e,f)}catch(_){}}
function nz38(a,b,c,d,e,f,g){if(typeof nz18==='function')try{nz18(a,b,c,d,e,f,g)}catch(_){}}
function fog38(){if(AIR38.fog!=null)return AIR38.fog;try{const f=scene.fog;if(!f)return 0;if(f.density!=null)return Math.min(1,f.density*90);return Math.max(0,Math.min(1,1-(f.far-200)/1200))}catch(e){return 0}}
function fx38(x,y,z,k,col){if(typeof burst==='function')burst(x,y,z,col||0xffb050,Math.round(6*k),.5,6*k);if(typeof fb12==='function'&&typeof FB12!=='undefined'&&FB12.length)fb12(x,y,z,6*k,.7,1);if(typeof smoke==='function')smoke(x,y,z,4*k,3,0x2a2a2a,.6,.7);if(typeof flashLight==='function')flashLight(x,y+1,z,2*k,.15,0xffa040)}
function scr38(x,z,k){const c=typeof cam!=='undefined'?cam.position:null;if(!c||Math.hypot(c.x-x,c.z-z)>260)return;tn38('sawtooth',2500,1300,.5*k,.05);tn38('square',1800,1100,.4*k,.025,.06);nz38(0,.3,'highpass',3000,1800,.04)}
function pmesh38(key,build,mat){let g=A38G[key];if(!g){const q=PB();build(q);g=A38G[key]=pbGeo(q)}const m=new T.Mesh(g,mat||VCM);return m}
function vcount38(o){let v=0;o.traverse(m=>{if(m.isMesh&&m.geometry&&m.geometry.attributes.position)v+=m.geometry.attributes.position.count});return v}
/* ---------------- V-19 «Chaika-Saetta» ---------------- */
const PV38={A:{hp:90,spd:46,turn:1.3,ammo:26,bombs:0,dmg:22,C1:0x6a7560,C2:0x4c5848,ac:0xe0dccc},B:{hp:80,spd:56,turn:1.15,ammo:22,bombs:0,dmg:24,C1:0x56687a,C2:0x3c4a58,ac:0xa82a24},D:{hp:115,spd:42,turn:1,ammo:14,bombs:3,dmg:18,C1:0x6e7656,C2:0x55603e,ac:0xc89a30}};
function roundel38(q,x,y,z,r,rx,rz){const D=det38();pa(q,gCyl(r,r,.02,D?16:10),0xe6e2d4,x,y,z,rx||0,0,rz||0);pa(q,gCyl(r*.7,r*.7,.03,D?16:10),0x2e6a3a,x,y,z,rx||0,0,rz||0);pa(q,gCyl(r*.36,r*.36,.04,D?12:8),0x1c2a5a,x,y,z,rx||0,0,rz||0);if(D)pa(q,gBox(r*.22,.05,r*.22),0xe6e2d4,x,y,z,rx||0,.785,rz||0)}
function mkV19_38(v){const K=PV38[v],C1=K.C1,C2=K.C2,UN=0x9aa4a8,MT=0x8a9096,DK=0x1e2022,D=det38(),s=v==='D'?1.08:1,g=new T.Group(),u={var:v,brk:[],bombs:[]};
 const body=pmesh38('v19b'+v+D,q=>{const sd=D?10:8;
  pa(q,gCyl(.58,.54,.55,D?14:10),v==='B'?K.ac:MT,0,0,2.05,1.5708);pa(q,gCyl(.5,.5,.05,10),DK,0,0,2.3,1.5708);
  for(let i=0;i<7;i++){const an=i/7*6.283;pa(q,gCyl(.09,.09,.32,6),0x5a5c5e,Math.cos(an)*.34,Math.sin(an)*.34,2.2,0,0,an+1.5708)}
  pa(q,gCyl(.55,.5,1.5,sd),C1,0,0,1.05,1.5708);pa(q,gCyl(.5,.33,1.9,sd),C2,0,0,-.65,1.5708);pa(q,gCyl(.33,.09,1.7,sd),C1,0,0,-2.45,1.5708);
  pBox(q,.62,.18,3.6,UN,0,-.36,-.5);pBox(q,.42,.12,1.3,C2,0,.5,-1.5);pBox(q,.46,.08,.75,DK,0,.5,-.35);pa(q,gTor(.27,.05,4,12),0x4a3020,0,.53,-.35,1.5708,0,0,1,1.4,1);
  pBox(q,.42,.24,.03,0xa8c0c8,0,.66,.1,-.3);
  pa(q,gSph(.15,8,6),0xc8a080,0,.78,-.4);pa(q,gSph(.17,8,6,0,1.7),0x3a2818,0,.8,-.42);pBox(q,.26,.06,.06,0x2a2a22,0,.82,-.27);pBox(q,.4,.22,.26,0x3a2a1c,0,.6,-.42);pBox(q,.12,.06,.5,0xe0dcd0,.1,.68,-.7,.2,.3);
  for(const x of[-.15,.15]){pBox(q,.05,.05,1.1,DK,x,.52,.95);pCyl(q,.06,.06,.45,0x3a3c3e,x,.52,.75,1.5708,0,0,6)}
  for(const x of[-.5,.5])pCyl(q,.06,.06,.3,0x2a2622,x,-.1,1.45,0,0,1.5708,6);
  if(v==='B'){pa(q,gCone(.22,.5,10),0xa82a24,0,0,2.75,1.5708);pBox(q,.3,.25,1.2,C2,0,.6,-1.2,.1)}else pa(q,gCone(.13,.25,8),DK,0,0,2.6,1.5708);
  if(v==='D'){pCyl(q,.04,.04,.7,DK,.2,.66,.25,1.5708,0,0,6);pBox(q,.46,.08,.6,DK,0,.5,-1.2);pa(q,gTor(.25,.04,4,12),0x4a4c4e,0,.56,-1.2,1.5708);pa(q,gSph(.15,8,6),0xc8a080,0,.76,-1.25);pa(q,gSph(.17,8,6,0,1.7),0x3a2818,0,.78,-1.27);pBox(q,.04,.04,.8,DK,0,.85,-1.7,-.3);
   for(const x of[-.18,.18])pBox(q,.04,.5,.04,DK,x,-.6,.25,0,0,x*1.5);pBox(q,.5,.05,.08,K.ac,0,-.12,-2.9)}
  if(v==='A')pBox(q,.03,.36,.25,K.ac,0,.18,-1.1);
  if(D>=1)for(const z of[1.75,.3,-1.6,-2.9])pa(q,gTor(z>0?.53:z>-2?.42:.25,.012,3,12),DK,0,0,z);
  if(D>=2)for(let i=0;i<12;i++){const an=i/12*6.283;pBox(q,.03,.03,.03,0x3a3c3e,Math.cos(an)*.56,Math.sin(an)*.56,1.6)}
  for(const sg of[-1,1]){/* ala superior de gaviota: tramo interior inclinado + exterior */
   pBox(q,1.36,.12,1.45,C2,sg*.55,.85,.55,0,0,sg*.63);
   pBox(q,1.3,.12,1.5,C1,sg*1.75,1.27,.55,0,0,sg*.04);
   pa(q,gCyl(.75,.75,.12,12),C2,sg*2.4,1.29,.55,0,0,0,.01,1,1);pBox(q,.04,.13,.2,DK,sg*2.4,1.27,-.15);
   pBox(q,1.4,.11,1.0,C1,sg*.75+sg*.0,-.48,.35,0,0,sg*.06);pBox(q,1.8,.11,1.15,C2,sg*2.2,-.43,.35,0,0,sg*.06);pa(q,gCyl(.58,.58,.11,12),C2,sg*3.1,-.41,.35,0,0,0,.45,1,1);
   roundel38(q,sg*2.6,-.5,.4,.45);
   pBox(q,.08,1.65,.6,0x2e2a24,sg*2.75,.42,.5,0,0,-sg*.05);
   if(D)for(const z of[.25,.85])pBox(q,2.9,.025,.025,0x6a6a6a,sg*1.55,.35,z,0,0,sg*.62);
   /* tren fijo */
   pBox(q,.06,1.05,.06,DK,sg*.55,-.9,.7,0,0,sg*.45);pBox(q,.06,1.05,.06,DK,sg*.55,-.9,.15,-.45,0,sg*.45);
   pCyl(q,.38,.38,.14,0x151515,sg*.95,-1.37,.4,0,0,1.5708,D?14:10);pCyl(q,.14,.14,.16,0xb8b4a8,sg*.95,-1.37,.4,0,0,1.5708,8);
   if(v==='B')pa(q,gSph(.42,10,8),C2,sg*.95,-1.3,.42,0,0,0,.4,.8,1.6);
   roundel38(q,sg*.36,0,-1.5,.3,0,1.5708)}
  pBox(q,.2,.08,.6,DK,0,-1.08,.5);pBox(q,.04,.4,.04,DK,0,-.5,-3.3,.5);
  pBox(q,2.8,.07,.75,C1,0,.05,-3.15);pBox(q,.07,.9,.75,C2,0,.5,-3.2);
 },VCV);g.add(body);
 /* ala exterior izquierda (se puede desprender) + alerones */
 const wl=pmesh38('v19w'+v,q=>{pBox(q,2.2,.12,1.5,C2,1.1,0,0);pa(q,gCyl(.75,.75,.12,12),C1,2.2,.02,0,0,0,0,.45,1,1);roundel38(q,1.25,.07,.05,.55)},VCV);wl.position.set(2.4*1,1.3,.55);wl.rotation.z=.04;g.add(wl);u.wingL=wl;
 const wr=pmesh38('v19wr'+v,q=>{pBox(q,2.2,.12,1.5,C2,-1.1,0,0);pa(q,gCyl(.75,.75,.12,12),C1,-2.2,.02,0,0,0,0,.45,1,1);roundel38(q,-1.25,.07,.05,.55)},VCV);wr.position.set(-2.4,1.3,.55);wr.rotation.z=-.04;g.add(wr);
 u.ail=[];for(const [w,sg] of[[wl,1],[wr,-1]]){const a=new T.Group();a.position.set(sg*1.3,0,-.75);w.add(a);const m=pmesh38('v19a'+v,q=>pBox(q,1.5,.06,.34,K.C2,0,0,-.17),VCV);a.add(m);u.ail.push(a)}
 u.elev=new T.Group();u.elev.position.set(0,.05,-3.52);g.add(u.elev);u.elev.add(pmesh38('v19e'+v,q=>pBox(q,2.8,.06,.42,C2,0,0,-.21),VCV));
 u.rud=new T.Group();u.rud.position.set(0,.45,-3.57);g.add(u.rud);u.rud.add(pmesh38('v19r'+v,q=>{pBox(q,.06,1.1,.5,0xe6e2d4,0,.1,-.25);pBox(q,.07,.36,.5,0x2e6a3a,0,-.1,-.25);pBox(q,.07,.3,.5,0x1c2a5a,0,-.42,-.25)},VCV));
 u.prop=new T.Group();u.prop.position.set(0,0,2.4);g.add(u.prop);u.prop.add(pmesh38('v19p',q=>{pBox(q,.16,1.25,.06,0x6a4424,0,.66,0,0,.3);pBox(q,.16,1.25,.06,0x6a4424,0,-.66,0,0,-.3);pBox(q,.17,.12,.07,0xa8a090,0,1.22,0)},VCV));
 if(!A38G.blurM)A38G.blurM=new T.MeshBasicMaterial({color:0x2a2420,transparent:true,opacity:.14,depthWrite:false,side:T.DoubleSide});
 const bl=new T.Mesh(A38G.blurG||(A38G.blurG=new T.CircleGeometry(1.3,16)),A38G.blurM);bl.position.z=2.45;g.add(bl);u.blur=bl;
 if(v==='D'){for(const sg of[-1,1]){const b=new T.Group();b.position.set(sg*1.6,-.55,.85);g.add(b);b.add(pmesh38('v19k',q=>{pBox(q,1.1,.5,.04,0x4a4c4e,0,-.25,0);for(let i=0;i<4;i++)pBox(q,.12,.12,.05,0x1a1a1a,-.4+i*.27,-.25,0)},VCV));u.brk.push(b)}
  const big=pmesh38('v19bb',q=>{pCyl(q,.2,.2,1.1,0x3a3e32,0,0,0,1.5708,0,0,10);pa(q,gSph(.2,10,6),0x3a3e32,0,0,.55);pa(q,gCone(.2,.4,8),0x3a3e32,0,0,-.75,-1.5708);pBox(q,.5,.04,.2,0x2a2c28,0,0,-.85);pBox(q,.04,.5,.2,0x2a2c28,0,0,-.85);pBox(q,.42,.04,.04,0xc89a30,0,0,.3)},VCV);big.position.set(0,-.85,.25);g.add(big);u.bombs.push(big);
  for(const sg of[-1,1]){const sb=pmesh38('v19sb',q=>{pCyl(q,.12,.12,.6,0x3a3e32,0,0,0,1.5708,0,0,8);pa(q,gCone(.12,.25,6),0x3a3e32,0,0,-.42,-1.5708);pBox(q,.3,.03,.12,0x2a2c28,0,0,-.5)},VCV);sb.position.set(sg*1.9,-.75,.4);g.add(sb);u.bombs.push(sb)}}
 g.scale.setScalar(s);u.S=s;g.userData=u;return g}
/* ---------------- grifos Veyrn ---------------- */
const GV38={
 scout:{S:.82,hp:70,spd:31,turn:3.3,arm:1,dmg:.7,coat:0xa89070,pl:0x9a9a92,bar:0x5a5a52,hd:0xb8b4a8,a:0,rhp:30,nm:'Grifo explorador'},
 line:{S:1,hp:125,spd:25,turn:2.6,arm:.95,dmg:1,coat:0x9a7448,pl:0x6a4a2c,bar:0x3a2818,hd:0x7a5a38,a:1,rhp:35,nm:'Grifo de línea'},
 heavy:{S:1.22,hp:240,spd:19,turn:1.8,arm:.65,dmg:1.5,coat:0x6a5038,pl:0x3a2a1c,bar:0x221a12,hd:0x4a3a2a,a:2,rhp:45,nm:'Grifo pesado'},
 lancer:{S:1.05,hp:135,spd:27,turn:2.4,arm:.9,dmg:1.3,coat:0x8a6a48,pl:0x5a4632,bar:0xd8d0c0,hd:0x6a5440,a:1,rhp:35,lance:1,nm:'Grifo lancero'},
 captain:{S:1.1,hp:170,spd:26,turn:2.8,arm:.85,dmg:1.2,coat:0x9a7a50,pl:0x4a3424,bar:0x2a1c12,hd:0xe8e4dc,a:1,gold:1,rhp:45,nm:'Capitán de ala'},
 guard:{S:1.14,hp:165,spd:25,turn:2.9,arm:.85,dmg:1.2,coat:0x5a4a3c,pl:0x222020,bar:0x8a8070,hd:0x2a2828,a:2,blk:1,rhp:45,nm:'Grifo de la Guardia'},
 rauth:{S:1.36,hp:380,spd:27,turn:3,arm:.72,dmg:1.6,coat:0x4a4844,pl:0x3a4048,bar:0x6a7680,hd:0x5a6068,a:2,blk:1,gold:1,horn:1,rhp:90,boss:1,nm:'Eisenkrall (Capitán Rauth)'}};
function mkRider38(V){let r=null;if(typeof knight38==='function'){try{r=knight38({rank:V==='rauth'?'boss':V==='captain'?'officer':'',lance:V==='lancer',cape:V==='rauth'})}catch(e){r=null}}
 if(!r){r=new T.Group();const u={};const KN=0x3a3630,ST=0x2e3236;r.add(pmesh38('kn0',q=>{pBox(q,.36,.42,.24,KN,0,.38,0);pBox(q,.38,.08,.26,0x4a3020,0,.2,0);pBox(q,.06,.45,.02,0x4a3020,.08,.4,.13,0,0,.4);pBox(q,.12,.14,.06,0x3a2214,.2,.18,.05);
   for(const x of[-.12,.12]){pBox(q,.15,.15,.45,0x2a2c30,x,.05,.18);pBox(q,.13,.42,.14,0x161616,x*1.2,-.18,.4)}pa(q,gSph(.11,8,6),0xc8a080,0,.72,0);pa(q,gSph(.135,8,6,0,1.6),ST,0,.75,-.01);pBox(q,.03,.06,.28,ST,0,.88,0);pBox(q,.22,.05,.05,0x8a7a40,0,.77,.1);pBox(q,.04,.5,.04,0x8a8a8a,-.24,.15,-.05,.5)},VCM));
  for(const sg of[1,-1]){const a=new T.Group();a.position.set(sg*.22,.56,0);r.add(a);a.add(pmesh38('kna',q=>{pCyl(q,.06,.05,.5,KN,0,-.22,0,0,0,0,6);pa(q,gSph(.05,6,4),0x2a2a2a,0,-.48,0)},VCM));if(sg>0){const pz=pmesh38('knp',q=>{pBox(q,.04,.1,.05,0x1a1a1a,0,-.51,.02);pBox(q,.035,.04,.2,0x2a2a2a,0,-.47,.1)},VCM);a.add(pz);u.aR=a}else u.aL=a;a.rotation.x=-.5}
  r.userData=u}
 const u=r.userData;if(V==='lancer'){const l=pmesh38('lance',q=>{pCyl(q,.035,.035,3.8,0x6a4a2a,0,0,0,1.5708,0,0,6);pa(q,gCone(.06,.35,6),0xb0b4b8,0,0,2.05,1.5708);pBox(q,.02,.22,.4,0x8a1a1a,0,-.1,1.6)},VCM);l.position.set(.3,.45,.6);l.rotation.x=.08;r.add(l)}
 if(V==='rauth'||V==='captain'){r.add(pmesh38('kpl'+V,q=>{pa(q,gCone(.06,.25,5),V==='rauth'?0x101010:0xa82a24,0,1.02,0,-.3);if(V==='rauth'){pBox(q,.5,.7,.04,0x6a1418,0,.32,-.17,.15);pBox(q,.42,.06,.1,0xb08a30,0,.6,0)}},VCM))}
 return r}
function mkGrif38(V){const K=GV38[V],S=K.S,D=det38(),g=new T.Group(),u={var:V,S};const bd=new T.Group();g.add(bd);u.bd=bd;
 const ARM=K.blk?0x2e3034:0x6a7076,TRIM=K.gold?0xb08a30:0x4a4e52,LEA=0x5a3a22;
 bd.add(pmesh38('gb'+V+D,q=>{const sd=D?12:8;
  pa(q,gSph(1,sd,sd-2),K.coat,0,0,.05,0,0,0,.75,.72,1.25);pa(q,gSph(1,sd,sd-2),K.pl,0,.08,.95,0,0,0,.8,.82,.72);pa(q,gSph(1,sd,sd-2),K.coat,0,-.05,-.95,0,0,0,.72,.72,.78);pa(q,gSph(1,sd-2,6),sh38(K.coat,1.25),0,-.38,0,0,0,0,.58,.38,1);
  pa(q,gCyl(.36,.5,1.1,sd),K.pl,0,.7,1.45,.7);
  for(let i=0;i<(D?12:6);i++){const an=(i/(D?12:6))*6.283;pa(q,gCone(.13,.7,4),i%2?K.pl:K.bar,Math.cos(an)*.42,.55+Math.sin(an)*.38,1.25,-2.1,0,0)}
  if(D>=1)for(let i=0;i<6;i++)pBox(q,.6-i*.04,.04,.12,K.bar,0,.45-i*.06,1.35-i*.02,.4);
  /* sillín, gualdrapa y arneses */
  pBox(q,.62,.16,.8,LEA,0,.74,.85);pBox(q,.14,.2,.12,LEA,0,.86,1.2);pBox(q,.9,.04,.95,0x272d37,0,.68,.8);for(const s of[-1,1]){pBox(q,.04,.5,.9,0x272d37,s*.66,.42,.8,0,0,s*.25);pBox(q,.05,.08,.9,0x8a2a24,s*.72,.2,.8,0,0,s*.25);pBox(q,.14,.28,.3,LEA,s*.45,.5,.5,0,0,s*.3)}
  pa(q,gTor(.8,.04,4,16),LEA,0,-.02,1.0,0,0,0,.95,.95,1);pa(q,gTor(.52,.04,4,14),LEA,0,.6,1.55,.75,0,0,.9,1,1);
  /* patas traseras felinas en reposo se animan; cola en grupo */
  if(K.a>=1){pBox(q,.8,.55,.12,ARM,0,-.05,1.62,-.3);pBox(q,.82,.05,.13,TRIM,0,.23,1.58,-.3);for(let i=0;i<3;i++)pa(q,gTor(.42,.06,4,10,3.14),ARM,0,.75+i*.12,1.45+i*.14,.7,0,0)}
  if(K.a>=2){for(const s of[-1,1]){pBox(q,.08,.6,1.2,ARM,s*.72,.1,.1,0,0,s*.15);pBox(q,.09,.06,1.2,TRIM,s*.74,.42,.1,0,0,s*.15)}pBox(q,1.0,.1,.7,ARM,0,.62,-.9,-.1)}
  if(K.horn)pBox(q,.2,.06,.8,0xb08a30,0,.8,.85)
 }));
 const hd=new T.Group();hd.position.set(0,1.18,1.92);bd.add(hd);u.hd=hd;
 hd.add(pmesh38('gh'+V,q=>{pa(q,gSph(.42,10,8),K.hd,0,0,0,0,0,0,.85,.9,1.15);pa(q,gCone(.17,.55,6),0xd8a838,0,-.04,.55,1.5708);pa(q,gCone(.07,.22,5),0x6a5a30,0,-.13,.8,3.14);pBox(q,.2,.06,.35,0xc89830,0,-.17,.4);pBox(q,.22,.08,.12,0xe0b040,0,.04,.32);
  for(const s of[-1,1]){pa(q,gSph(.07,6,4),0xe0a020,s*.24,.1,.27);pa(q,gSph(.035,4,3),0x101010,s*.29,.11,.29);pBox(q,.12,.04,.16,sh38(K.hd,.6),s*.2,.18,.27,.2);pa(q,gCone(.06,.4,4),K.pl,s*.18,.3,-.15,-2.4)}
  if(K.a>=1||V==='scout'){pBox(q,.32,.06,.5,ARM,0,.3,.15,.25);pBox(q,.34,.03,.06,TRIM,0,.33,-.08,.25)}
  if(K.lance||K.horn)pa(q,gCone(.06,.4,5),0xb0b4b8,0,.45,.35,.5);
  if(K.horn)for(const s of[-1,1])pa(q,gCone(.06,.55,5),0x1a1a1a,s*.2,.38,-.2,-2.3,0,s*.4);
  if(V==='guard')pBox(q,.03,.25,.02,0xd8d0c0,.2,.05,.15,0,0,.5)}));
 /* alas articuladas: hombro → mano (plumas primarias en abanico) */
 u.W=[];for(const s of[-1,1]){const sh=new T.Group();sh.position.set(s*.55,.55,.6);bd.add(sh);
  sh.add(pmesh38('gwi'+V+s+D,q=>{pBox(q,2.3,.1,1.6,K.pl,s*1.15,0,-.45);pCyl(q,.13,.09,2.3,sh38(K.pl,1.2),s*1.15,.04,.3,0,0,1.5708,6);pBox(q,2.1,.06,.55,sh38(K.pl,1.35),s*1.1,.07,.05);
   const n=D?7:4;for(let i=0;i<n;i++)pBox(q,.38,.04,1.0,i%2?K.pl:K.bar,s*(.2+i*(2/n)),-.02,-1.55+(i%2)*.1)}));
  const fo=new T.Group();fo.position.set(s*2.3,0,.15);sh.add(fo);
  fo.add(pmesh38('gwo'+V+s+D,q=>{pBox(q,2.0,.08,1.15,K.pl,s*.95,0,-.38);pCyl(q,.09,.05,2,sh38(K.pl,1.2),s*.95,.03,.15,0,0,1.5708,6);pBox(q,1.8,.05,.45,sh38(K.pl,1.3),s*.9,.05,0);
   const n=D?7:5;for(let i=0;i<n;i++){const L=2.1-i*.12,ry=s*i*.15,dx=Math.cos(i*.15)*L/2,dz=-Math.sin(i*.15)*L/2;pBox(q,L,.035,.26,i%2?K.bar:K.pl,s*(1.7+dx),0,-.1+dz-i*.05,0,ry,0);if(D)pBox(q,.4,.04,.27,K.bar,s*(1.7+dx*2-.2*Math.cos(i*.15)),.005,-.1+dz*2-i*.05,0,ry,0)}}));
  u.W.push({sh,fo,s})}
 /* patas: delanteras de águila, traseras de león */
 u.fl=new T.Group();u.fl.position.set(0,-.35,.95);bd.add(u.fl);u.fl.add(pmesh38('gfl'+V,q=>{for(const x of[-.36,.36]){pa(q,gSph(.24,8,6),K.pl,x,-.15,0,0,0,0,1,1.3,1);pCyl(q,.09,.08,.7,0xc89830,x,-.65,0,0,0,0,6);for(const r of[-.35,0,.35])pa(q,gCone(.04,.3,4),0x1a1a1a,x+r*.25,-1.05,.15,1.9,r,0);pa(q,gCone(.04,.25,4),0x1a1a1a,x,-1.02,-.12,-1.9)}}));
 u.hl=new T.Group();u.hl.position.set(0,-.3,-1.0);bd.add(u.hl);u.hl.add(pmesh38('ghl'+V,q=>{for(const x of[-.4,.4]){pa(q,gSph(.36,8,6),K.coat,x,-.2,0,0,0,0,.9,1.3,1.2);pCyl(q,.13,.1,.75,K.coat,x,-.75,-.05,0,0,0,6);pa(q,gSph(.15,6,4),sh38(K.coat,.8),x,-1.12,.04,0,0,0,1,.7,1.3)}}));
 u.tl=new T.Group();u.tl.position.set(0,.05,-1.75);bd.add(u.tl);u.tl.add(pmesh38('gtl'+V,q=>{pCyl(q,.1,.07,1.1,K.coat,0,-.2,-.5,-1.1,0,0,6);pCyl(q,.07,.05,1.0,K.coat,0,-.45,-1.4,-1.35,0,0,6);pa(q,gSph(.16,6,5),K.bar,0,-.5,-1.95,0,0,0,1,1,1.6)}));
 /* jinete (tamaño humano: compensa la escala) */
 const rd=mkRider38(V);rd.scale.setScalar(1/S);rd.position.set(0,.82,.85);bd.add(rd);u.rider=rd;
 g.scale.setScalar(S);g.userData=u;return g}
/* ---------------- spawn ---------------- */
function edge38(from){const c=AIR38.center,X=X0a38();let an;if(Array.isArray(from))return[X+from[0],from[1]];an={n:Math.PI,s:0,e:Math.PI/2,w:-Math.PI/2}[from];if(an===undefined)an=R38()*6.283;return[X+c[0]+Math.sin(an)*700,c[1]+Math.cos(an)*700]}
function airCount38(side){let n=0;for(const a of AIR38.list)if(a.side===side&&a.alive&&a.st!=='away')n++;return n}
function airSpawn38(type,variant,opts){opts=opts||{};const pl=/^(p|plane|v19|fighter)/.test(type),side=pl?'volsk':'veyrn';variant=variant||(pl?'A':'line');
 if(pl&&!PV38[variant])variant='A';if(!pl&&!GV38[variant])variant='line';
 if(!opts.force&&airCount38(side)>=(pl?AIR38.max.p:AIR38.max.g)){const o=Object.assign({},opts,{type,variant,pend:true});AIR38.pend.push(o);return o}
 if(typeof fbInit12==='function')try{fbInit12()}catch(e){}
 const X=X0a38(),g=pl?mkV19_38(variant):mkGrif38(variant),K=pl?PV38[variant]:GV38[variant];let x,z,y;
 if(opts.x!=null){x=opts.world?opts.x:X+opts.x;z=opts.z}else{const e=edge38(opts.from);x=e[0]+(opts.jit?(R38()-.5)*opts.jit:0);z=e[1]+(opts.jit?(R38()-.5)*opts.jit:0)}
 y=fl38(x,z)+(opts.y!=null?opts.y:pl?90+R38()*30:45+R38()*25);g.position.set(x,y,z);scene.add(g);
 const a={type:pl?'p':'g',var:variant,side,g,p:g.position,v:new T.Vector3(),K,hp:K.hp*(opts.hpK||1),mx:K.hp*(opts.hpK||1),spd:K.spd,turn:K.turn,S:pl?g.userData.S:K.S,st:opts.st||(pl?'pat':'in'),t:0,ph:R38()*6,bank:0,pitch:0,dc:R38()*.3,cd:R38(),alive:true,tag:opts.tag||'',
  ammo:K.ammo||0,bombs:K.bombs||0,ret:opts.ret!==false,patrol:opts.patrol||null,ord:opts.ord||null,landAt:opts.land||null,noRetreat:!!opts.noRetreat,
  rider:!pl&&opts.rider!==false,rhp:K.rhp||0,flap:1,wm:0,lv0:typeof level!=='undefined'?level:0,smk:0,pst:0,pcd:0,fbd:1e9,fbt:-9,boss:!!K.boss};
 if(!pl&&!a.rider&&g.userData.rider)g.userData.rider.visible=false;
 const hd=opts.hdg!=null?opts.hdg:Math.atan2(X+AIR38.center[0]-x,AIR38.center[1]-z);a.v.set(Math.sin(hd),0,Math.cos(hd)).multiplyScalar(a.spd);
 if(opts.st==='ground'){a.p.y=fl38(x,z)+1.5*a.S;a.v.multiplyScalar(.001)}
 a.hb=pl?[[0,0,-.6,.55,.6,3.0,1,'body'],[0,0,2,.6,.6,.5,1.2,'eng'],[0,.62,-.45,.25,.3,.3,2,'pilot'],[0,1.25,.55,4.6,.3,.8,.45,'wing'],[0,-.5,.35,3.4,.3,.65,.45,'wing']]
  :[[0,.95+.5/a.S,.85,.3/a.S,.55/a.S,.3/a.S,1,'rider'],[0,1.1,1.8,.45,.55,.6,1.4,'head'],[0,0,0,.85,.8,1.9,1,'body'],[0,.55,0,5,.4,1.2,.35,'wing']];
 a.hr=(pl?5:5.5)*a.S;AIR38.list.push(a);if(pl&&typeof dec35==='function')for(const n of['plane_loop','flyby1','flyby2','plane_die'])try{dec35(n)}catch(e){}
 if(!pl&&opts.st!=='ground')scr38(x,z,.6);if(AIR38.onSpawn)try{AIR38.onSpawn(a)}catch(e){}return a}
function airWave38(spec){const L=Array.isArray(spec)?spec:(spec.list||[].concat(spec.g||[],spec.p||[]));let n=0;
 for(const it of L){const c=it.n||1;for(let i=0;i<c;i++){const o=Object.assign({jit:60},it);delete o.n;const t=(it.delay||0)+i*(it.gap||1.2);if(t<=0)airSpawn38(it.type,it.variant,o);else lat38(t,()=>airSpawn38(it.type,it.variant,o));n++}}return n}
function airOrder38(a,o){if(!a||!a.alive)return;a.ord=o||null;const m=o&&o.mode,X=X0a38();
 if(m==='land'){a.landAt=o.at;a.st='lapp';a.t=0}else if(m==='retreat'||m==='leave'){a.st=a.type==='g'?'flee':'leave';a.t=0}
 else if(m==='patrol'){a.patrol=o.at?[o.at[0],o.at[1],o.r||200]:a.patrol;a.st=a.type==='g'?'in':'pat'}
 else if(m==='attack'&&o.tgt){a.tg=o.tgt;a.st=a.type==='g'?(o.tgt.k==='air'?'chase':'set'):'int';a.t=0}
 else if((m==='strafe'||m==='dive')&&o.at){a.tg={k:'pt',p:new T.Vector3(X+o.at[0],fl38(X+o.at[0],o.at[1]),o.at[1])};a.st=m==='dive'?'dclimb':'sset';a.t=0;a.sp=null}
 a.dc=0}
function airClear38(){for(const a of AIR38.list){scene.remove(a.g)}for(const d of AIR38.deb)scene.remove(d.m);for(const b of AIR38.bombs)scene.remove(b.m);AIR38.list.length=0;AIR38.pend.length=0;AIR38.deb.length=0;AIR38.bombs.length=0;AIR38.tq.length=0}
function airNear38(x,z,r,side){const X=X0a38(),o=[];for(const a of AIR38.list)if(a.alive&&(!side||a.side===side)&&Math.hypot(a.p.x-X-x,a.p.z-z)<r)o.push(a);return o}
/* ---------------- objetivos ---------------- */
function tok38(t){if(!t)return false;try{switch(t.k){case'pl':return typeof playing!=='undefined'&&playing&&P.hp>0;case'al':{const n=t.o;return n.g&&n.g.visible&&!n.down29&&!n.dead17&&!n.down17&&!(n.hp<=0)}
 case'veh':return t.o.alive&&t.o.on!==false;case'air':return t.o.alive&&t.o.st!=='away';case'en':return t.o.hp>0&&!!t.o.g.parent;case'pt':return true}}catch(e){}return false}
function tpos38(t){return t.k==='pl'?P.g.position:t.k==='air'?t.o.p:t.k==='pt'?t.p:t.o.g.position}
function allies38(){try{if(typeof vhAllies32==='function')return vhAllies32()||[]}catch(e){}return[]}
function gTgt38(a){const p=a.p,V=a.var,det=650*(1-.45*fog38());let best=null,bs=0;const L=[];
 const add=(k,o,q,w)=>{const d=Math.hypot(q.x-p.x,q.z-p.z);if(d>det)return;let n=0;for(const b of AIR38.list)if(b!==a&&b.tg&&b.tg.o===o&&b.alive)n++;const s=w/(1+d/180)-.3*n;if(s>bs){bs=s;best={k,o}}};
 if(typeof P!=='undefined'&&P.g&&tok38({k:'pl'}))add('pl',null,P.g.position,(V==='captain'||V==='rauth')?1.6:1);
 const AL=allies38();for(let i=0;i<AL.length;i++){const n=AL[i];if(!tok38({k:'al',o:n}))continue;let c=0;const q=n.g.position;for(let j=0;j<AL.length&&j<30;j++){const m=AL[j];if(m!==n&&m.g&&Math.abs(m.g.position.x-q.x)<7&&Math.abs(m.g.position.z-q.z)<7)c++}
  const obs=n.obs38||n.role==='observer'||n.kind17==='observer'||n.kind38==='observer';add('al',n,q,(.8+.12*Math.min(5,c)+(obs?.8:0))*(V==='heavy'?1.2:1))}
 if(typeof VEH32!=='undefined'&&VEH32.list)for(const v of VEH32.list){if(!v.alive||v.on===false||!v.ally)continue;const gun=/gun|how|spg|mort|field/.test((v.type||'')+(v.kind||''));add('veh',v,v.g.position,(gun?1.5:.9)*(V==='lancer'?1.5:V==='heavy'&&gun?1.3:1))}
 for(const b of AIR38.list)if(b.type==='p'&&b.alive&&b.st!=='away'){const alt=b.p.y-fl38(b.p.x,b.p.z);add('air',b,b.p,alt<80?(V==='scout'?1.3:V==='rauth'?1.4:V==='captain'?1.2:.9):.35)}
 return best}
function pTgt38(a){/* objetivos terrestres Veyrn para los cazas */const X=X0a38(),c=a.ord&&a.ord.at?[X+a.ord.at[0],a.ord.at[1]]:a.patrol?[X+a.patrol[0],a.patrol[1]]:[a.p.x,a.p.z];let best=null,bs=0;
 if(typeof enemies!=='undefined')for(let i=0;i<enemies.length;i+=enemies.length>40?2:1){const e=enemies[i];if(!e||e.hp<=0)continue;const q=e.g.position,d=Math.hypot(q.x-c[0],q.z-c[1]);if(d>450)continue;let n=0;for(let j=0;j<enemies.length&&j<40;j++){const f=enemies[j];if(f!==e&&Math.abs(f.g.position.x-q.x)<10&&Math.abs(f.g.position.z-q.z)<10)n++}const s=(1+n)/(1+d/200);if(s>bs){bs=s;best={k:'en',o:e}}}
 if(typeof VEH32!=='undefined'&&VEH32.list)for(const v of VEH32.list){if(!v.alive||v.ally||v.on===false)continue;const q=v.g.position,d=Math.hypot(q.x-c[0],q.z-c[1]);if(d>450)continue;const s=3/(1+d/200);if(s>bs){bs=s;best={k:'veh',o:v}}}
 return best}
/* ---------------- vuelo ---------------- */
function steer38(a,tx,ty,tz,turn,spd,dt){A38a.set(tx-a.p.x,ty-a.p.y,tz-a.p.z);if(A38a.lengthSq()<1e-3)return;a.spd+=(spd-a.spd)*Math.min(1,dt*.8);A38a.setLength(a.spd);const ox=a.v.x,oz=a.v.z,oy=a.v.y;a.v.lerp(A38a,Math.min(1,turn*dt)).setLength(a.spd);
 const cr=(ox*a.v.z-oz*a.v.x)/(a.spd*a.spd*Math.max(dt,.001));a.bank+=(Math.max(-1.1,Math.min(1.1,-cr*(a.type==='p'?1.4:.9)))-a.bank)*Math.min(1,dt*3);a.dvy=(a.v.y-oy)/Math.max(dt,.001)}
function guard38(a,dt){const p=a.p,X=X0a38(),f=fl38(p.x,p.z);
 const minA=a.type==='p'?(a.st==='srun'||a.st==='pull'?9:a.st==='dive'?30:18):(/run|flare|lapp|ground|takeoff/.test(a.st)?1.25*a.S+.4:6*a.S);
 if(p.y<f+minA){p.y+=(f+minA-p.y)*Math.min(1,dt*6);if(a.v.y<0)a.v.y*=.5;a.v.y+=dt*25;if(a.type==='p'&&a.st==='srun'){a.st='ext';a.t=0;a.bp=A38d.copy(p).addScaledVector(a.v,3).setY(f+90).clone()}}
 for(const k of AIR38.ko){const kx=X+(k.x!=null?k.x:k[0]),kz=k.z!=null?k.z:k[1],r=(k.r||8)+5*a.S,h=k.h||30;const lx=p.x+a.v.x*1.5-kx,lz=p.z+a.v.z*1.5-kz,d=Math.hypot(lx,lz);
  if(d<r&&p.y<fl38(kx,kz)+h+8){a.v.y+=dt*40;a.v.x+=lx/(d||1)*dt*30;a.v.z+=lz/(d||1)*dt*30;a.v.setLength(a.spd);const dx=p.x-kx,dz=p.z-kz,d2=Math.hypot(dx,dz);if(d2<r-4&&p.y<fl38(kx,kz)+h){p.x=kx+dx/(d2||1)*(r-4);p.z=kz+dz/(d2||1)*(r-4)}}}
 const lx=p.x-X-AIR38.center[0],lz=p.z-AIR38.center[1];if(Math.hypot(lx,lz)>950&&!/leave|flee|away/.test(a.st)){a.v.x-=lx*dt*.06;a.v.z-=lz*dt*.06;a.v.setLength(a.spd)}}
function orient38(a,dt){A38a.copy(a.p).add(a.v);if(Math.abs(a.v.y)>a.v.length()*.97)A38a.z+=.5;a.g.lookAt(A38a);a.g.rotateZ(a.bank);if(a.pitch)a.g.rotateX(a.pitch)}
/* ---------------- armas ---------------- */
function muzzle38(a,out){a.g.updateMatrixWorld(true);return a.g.localToWorld(out.set(0,.5,2.6))}
function gunBurst38(a,tp,ground){const d=a.p.distanceTo(tp);a.ammo--;AIR38.dbg.shots++;const o=muzzle38(a,A38b).clone(),n=det38()?5:3;
 for(let i=0;i<n;i++){const j=A38c.copy(tp);j.x+=(R38()-.5)*(ground?5:4);j.y+=(R38()-.5)*(ground?.5:3);j.z+=(R38()-.5)*(ground?5:4);if(typeof trc16==='function')trc16(o,j.clone(),0xffe090)}
 if(!(typeof mgS37==='function'&&mgS37('ametralladora',a.p.x,a.p.z,4,.07,.95,{reach:40,max:650}))&&typeof npcShot==='function')npcShot('mg',a.p.x,a.p.z);
 if(typeof burst==='function')burst(o.x,o.y,o.z,0xffd080,2,.1,2);return d}
function pistol38(a,t){const tp=tpos38(t),d=a.p.distanceTo(tp);a.fireT=.3;a.pst++;AIR38.dbg.pist++;const r=a.g.userData.rider;let o=A38b.copy(a.p);o.y+=1.6*a.S;
 if(r){const aR=r.userData.mR||r.userData.aR;if(aR){aR.updateMatrixWorld(true);aR.getWorldPosition(o)}}o=o.clone();
 if(!snd38(R38()<.5?'pistola':'nagant',.8,a.p.x,a.p.z,{reach:18,max:200})&&typeof npcShot==='function')npcShot('pistol',a.p.x,a.p.z);
 if(typeof burst==='function')burst(o.x,o.y,o.z,0xffe0a0,2,.08,2);if(typeof noise33==='function')try{noise33(a.p.x,a.p.z,60,'enemy')}catch(e){}
 const aim=A38c.copy(tp);aim.y+=t.k==='air'?0:1.2;const fg=1-.4*fog38(),dk=typeof difficulty!=='undefined'?({easy:.7,normal:1,hard:1.25}[difficulty]||1):1;
 let ph=(t.k==='air'?.15:t.k==='pl'?.32*dk:.35)*Math.max(.15,1-d/80)*fg;const hit=R38()<ph;if(!hit){aim.x+=(R38()-.5)*4;aim.z+=(R38()-.5)*4;aim.y+=(R38()-.5)*2}
 if(typeof trc16==='function')trc16(o,aim.clone(),0xffe8b0);if(!hit)return;AIR38.dbg.pistHit++;
 lat38(d/400,()=>{if(!tok38(t))return;if(t.k==='pl'&&typeof hitP==='function')hitP(8+R38()*6);else if(t.k==='al'&&typeof vhAllyHit32==='function')vhAllyHit32(t.o,22);else if(t.k==='air')airDmg38(t.o,8,'b','e')})}
function claw38(a,t){const K=a.K,k=K.dmg,tp=tpos38(t);AIR38.dbg.claws++;scr38(a.p.x,a.p.z,.5);tn38('sawtooth',300,90,.25,.08);if(typeof burst==='function')burst(tp.x,tp.y+1,tp.z,0x8a1a10,6,.4,4);
 try{if(t.k==='pl'){const d=Math.hypot(P.g.position.x-a.p.x,P.g.position.z-a.p.z);if(d<4*a.S&&typeof hitP==='function'){hitP(22*k);if(typeof shake!=='undefined')shake=Math.max(shake,.8)}}
  else if(t.k==='al'){if(typeof vhAllyHit32==='function'){vhAllyHit32(t.o,70*k);for(const n of allies38())if(n!==t.o&&n.g&&n.g.visible&&n.g.position.distanceTo(tp)<2.8)vhAllyHit32(n,30*k)}}
  else if(t.k==='veh'&&typeof vhVehDmg32==='function')vhVehDmg32(t.o,90*k*(K.lance?2:1),'m',a.p.x,a.p.z);
  else if(t.k==='air'){airDmg38(t.o,50*k,'claw','e');if(t.o.alive&&R38()<.3*k)airDmg38(t.o,999,'claw','e')}}catch(e){}}
function bomb38(a){const u=a.g.userData,m=u.bombs[3-a.bombs]||u.bombs[0];a.bombs--;AIR38.dbg.bombs++;let w=new T.Vector3();if(m){m.getWorldPosition(w);m.visible=false}else w.copy(a.p);
 const big=a.bombs===2,bm=pmesh38(big?'v19bb':'v19sb',()=>{},VCV);bm.position.copy(w);scene.add(bm);AIR38.bombs.push({m:bm,v:a.v.clone().multiplyScalar(.9),k:big?1.6:1,a,t:0});tn38('sine',1400,500,2.2,.04)}
function boom38(b){const p=b.m.position,X=X0a38();scene.remove(b.m);const k=b.k;fx38(p.x,p.y,p.z,k*1.6);if(typeof expSnd==='function')try{expSnd(p.x,p.z,k)}catch(e){}else snd38('ex_big1',1,p.x,p.z,{reach:60,max:600});
 if(typeof vhImpact32==='function')try{vhImpact32(p.x,p.y,p.z,k,'volsk',90*k,9*k,null,null,'he',{name:'Un V-19 «Picador»'});return}catch(e){}
 if(typeof enemies!=='undefined')for(const e of[...enemies]){if(e.hp<=0)continue;const d=Math.hypot(e.g.position.x-p.x,e.g.position.z-p.z);if(d<9*k&&typeof hurt==='function')hurt(e,160*k*(1-d/(9*k)*.6),'m',{name:'Un V-19 «Picador»'});if(e.hp<=0&&enemies.includes(e)&&typeof kill==='function')kill(e)}}
function strafeHits38(a,tp){if(typeof enemies!=='undefined')for(const e of[...enemies]){if(e.hp<=0)continue;if(Math.hypot(e.g.position.x-tp.x,e.g.position.z-tp.z)<3.2&&R38()<.6&&typeof hurt==='function'){hurt(e,34,'m',{name:'Un caza V-19'});if(e.hp<=0&&enemies.includes(e)&&typeof kill==='function')kill(e)}}
 if(typeof VEH32!=='undefined'&&VEH32.list&&typeof vhVehDmg32==='function')for(const v of VEH32.list)if(v.alive&&!v.ally&&v.g.position.distanceTo(tp)<5)vhVehDmg32(v,40,'b',a.p.x,a.p.z);
 if(typeof burst==='function')for(let i=0;i<4;i++)burst(tp.x+(R38()-.5)*5,fl38(tp.x,tp.z)+.2,tp.z+(R38()-.5)*5,0xdfe4e8,4,.4,4)}
/* ---------------- daño ---------------- */
function airDmg38(a,d,kind,by,zone){if(!a||!a.alive||a.st==='down')return 0;by=by||'p';if(a.side==='volsk'&&by==='p')d*=AIR38.ff;let k=1;
 if(a.type==='g'){if(kind==='b')k=a.K.arm;else if(kind==='aa'||kind==='mg')k=1.15*Math.max(.8,a.K.arm);else if(kind==='x')k=1.5;
  if(zone==='rider'&&a.rider){a.rhp-=d*(a.boss?.7:1);if(a.rhp<=0)rDown38(a,by);return d}}
 if(zone==='wing')k*=.4;else if(zone==='head')k*=1.4;else if(zone==='pilot'&&a.type==='p'&&R38()<.35)k*=6;
 a.hp-=d*k;a.hitT=.2;a.lastBy=by;if(a.hp<=0){down38(a,by,kind);return d}
 if(a.type==='g'&&!a.noRetreat&&a.hp<a.mx*(a.boss?.35:.3)&&!a.fled1&&!/flee|ground|lapp|flare|takeoff/.test(a.st)&&(a.boss||R38()<(a.var==='scout'?.9:.55))){a.fled1=1;a.st='flee';a.t=0;if(AIR38.onRetreat)try{AIR38.onRetreat(a)}catch(e){}scr38(a.p.x,a.p.z,1)}
 else if(a.type==='g'&&a.fled1&&!a.boss)a.fled1=a.fled1;return d}
function rDown38(a,by){a.rider=false;const r=a.g.userData.rider;if(r){r.updateMatrixWorld(true);const w=new T.Vector3();r.getWorldPosition(w);a.g.userData.bd.remove(r);r.position.copy(w);r.scale.setScalar(1);scene.add(r);AIR38.deb.push({m:r,v:a.v.clone().multiplyScalar(.5),sp:new T.Vector3(2,1,3),t:0,rider:1})}
 AIR38.dbg.by['rider_'+by]=(AIR38.dbg.by['rider_'+by]||0)+1;if(typeof feed==='function')feed(a.boss?'★ ¡CAPITÁN RAUTH ABATIDO! Eisenkrall huye':'★ Caballero grifo derribado de la montura');
 if(typeof score!=='undefined'&&by==='p')score+=a.boss?800:120;if(a.boss||R38()<.6){a.st='flee';a.t=0}if(a.boss&&AIR38.onKill)try{AIR38.onKill(a,by,'rider')}catch(e){}}
function down38(a,by,how){if(a.st==='down')return;a.st='down';a.alive=false;a.t=0;a.hp=0;a.spin=(R38()-.5)*(a.type==='p'?3:1.5);a.v.y-=4;a.by=by;const d=AIR38.dbg;d.by[by]=(d.by[by]||0)+1;
 if(a.type==='g'){d.kG++;scr38(a.p.x,a.p.z,1.3);if(typeof feed==='function')feed('★ '+a.K.nm+' derribado');if(by==='p'&&typeof score!=='undefined')score+=a.boss?1500:200}
 else{d.kP++;snd38('plane_die',1,a.p.x,a.p.z,{reach:50,max:500});if(typeof feed==='function')feed('✖ Caza V-19 derribado');const u=a.g.userData;if(u.wingL&&(how==='claw'||R38()<.45)){a.g.updateMatrixWorld(true);scene.attach(u.wingL);AIR38.deb.push({m:u.wingL,v:a.v.clone().multiplyScalar(.7).add(A38a.set(0,4,0)),sp:new T.Vector3(3,1,5),t:0});a.spin*=2.2;a.brk=1}}
 if(typeof burst==='function')burst(a.p.x,a.p.y,a.p.z,a.type==='g'?0x8a1a10:0xffa040,12,.7,8);if(AIR38.onKill)try{AIR38.onKill(a,by,how)}catch(e){}}
/* proyectiles del jugador / aliados (hook del bucle de balas) */
function airBul38(b){const p=b.m.position,v=b.v,dt=AIR38.dtL||.033;if(!v)return false;const sx=p.x-v.x*dt,sy=p.y-v.y*dt,sz=p.z-v.z*dt,dx=v.x*dt,dy=v.y*dt,dz=v.z*dt,l2=dx*dx+dy*dy+dz*dz||1e-6;
 for(const a of AIR38.list){if(!a.alive||!a.g.visible||a.st==='away')continue;const c=a.p;let t=((c.x-sx)*dx+(c.y-sy)*dy+(c.z-sz)*dz)/l2;t=Math.max(0,Math.min(1,t));const qx=sx+dx*t,qy=sy+dy*t,qz=sz+dz*t;
  if((qx-c.x)**2+(qy-c.y)**2+(qz-c.z)**2>a.hr*a.hr)continue;a.g.updateMatrixWorld(true);A38m.copy(a.g.matrixWorld).invert();const L=Math.sqrt(l2);
  for(let k=-4;k<=4;k++){const s=k*.5/L;A38a.set(qx+dx*s,qy+dy*s,qz+dz*s).applyMatrix4(A38m);for(const h of a.hb){if(h[7]==='rider'&&!a.rider)continue;if(Math.abs(A38a.x-h[0])<h[3]&&Math.abs(A38a.y-h[1])<h[4]&&Math.abs(A38a.z-h[2])<h[5]){
   const by=b.by?'a':'p';airDmg38(a,(b.dmg||17)*h[6],'b',by,h[7]);if(typeof burst==='function')burst(qx,qy,qz,a.type==='g'?0x8a1a10:0xffd890,4,.25,4);
   if(by==='p'){AIR38.dbg.pHits=(AIR38.dbg.pHits||0)+1;const cr=typeof $==='function'&&$('cr');if(cr){cr.classList.add('hit');setTimeout(()=>cr.classList.remove('hit'),110)}tn38('square',a.type==='g'?600:1800,300,.03,.02)}return true}}}}return false}
function airHitRay38(o,dir,range,dmg,by,kind){let best=null,bt=range||400;for(const a of AIR38.list){if(!a.alive||a.st==='away')continue;A38a.copy(a.p).sub(o);const t=A38a.dot(dir);if(t<0||t>bt)continue;const d2=A38a.lengthSq()-t*t;const r=a.hr*.55;if(d2<r*r){bt=t;best=a}}
 if(best)airDmg38(best,dmg,kind||'aa',by||'p','body');return best}
if(typeof v9Hit!=='undefined'){const _h=v9Hit;v9Hit=function(b){if(AIR38.list.length&&b&&b.m)try{if(airBul38(b))return true}catch(e){}return _h(b)}}
/* ---------------- IA de grifos ---------------- */
function gThink38(a){if(/down|dead|flee|lapp|flare|ground|takeoff/.test(a.st))return;
 if(a.landAt&&a.rider&&!a.landed){a.st='lapp';a.t=0;return}
 if(!a.landed&&a.rider&&AIR38.landSites.length&&a.var!=='scout'&&a.hp>a.mx*.6&&R38()<.04){const s=AIR38.landSites[R38()*AIR38.landSites.length|0];a.landAt=s;a.st='lapp';a.t=0;return}
 /* amenaza: caza en la cola → quiebre bajo */
 if(a.st!=='evade')for(const f of AIR38.list){if(f.type!=='p'||!f.alive||f.st!=='int'||f.tg&&f.tg.o!==a)continue;A38a.copy(a.p).sub(f.p);const d=A38a.length();if(d<170&&A38a.dot(f.v)/(d*f.spd+1e-3)>.88&&R38()<.75){a.st='evade';a.t=0;a.thr=f;return}}
 if(!tok38(a.tg)||(a.st==='zoom'&&a.t>2&&R38()<.5))a.tg=gTgt38(a);
 if(!a.tg){if(a.st!=='in'){a.st='in';a.t=0}return}
 if(a.st==='in'||a.st==='zoom'&&a.t>2.5||a.st==='evade'&&a.t>1.8){a.st=a.tg.k==='air'?'chase':'set';a.t=0;a.sp=null;a.pst=0;if(a.st==='set'&&R38()<.5)scr38(a.p.x,a.p.z,.7)}}
function gStep38(a,dt){const p=a.p,K=a.K,X=X0a38(),u=a.g.userData;let sp=K.spd,tr=K.turn*(p.y-fl38(p.x,p.z)<40?1.25:1);a.pcd-=dt;a.wm=0;a.legs=1.1;a.pitch*=.9;
 switch(a.st){
 case'in':{const c=a.tg?tpos38(a.tg):A38a.set(X+AIR38.center[0],0,AIR38.center[1]);steer38(a,c.x,fl38(c.x,c.z)+55,c.z,tr*.6,sp,dt);break}
 case'set':{if(!tok38(a.tg)){a.st='in';break}const T_=tpos38(a.tg);if(!a.sp){A38a.set(p.x-T_.x,0,p.z-T_.z).normalize();const an=(R38()-.5)*1.2,c=Math.cos(an),s=Math.sin(an);a.sp=new T.Vector3(T_.x+(A38a.x*c-A38a.z*s)*130,fl38(T_.x,T_.z)+35+R38()*20,T_.z+(A38a.x*s+A38a.z*c)*130)}
  steer38(a,a.sp.x,a.sp.y,a.sp.z,tr,sp,dt);if(p.distanceTo(a.sp)<30||a.t>8){a.st='run';a.t=0;a.pst=0;a.sp=null}break}
 case'run':{if(!tok38(a.tg)){a.st='zoom';a.t=0;a.bp=p.clone().addScaledVector(a.v,3).setY(p.y+50);break}const T_=tpos38(a.tg),ty=T_.y+(a.tg.k==='veh'?2.4:1)+1.25*a.S;const hd=Math.hypot(T_.x-p.x,T_.z-p.z);
  steer38(a,T_.x,ty+Math.min(25,hd*.15),T_.z,tr*1.3,sp*1.35,dt);a.wm=hd>30?2:3;a.legs=hd<35?-.8:1.1;
  if(a.rider&&hd>12&&hd<70&&a.pcd<=0&&a.pst<4){a.pcd=.45+R38()*.2;pistol38(a,a.tg)}
  if(hd<4.5*a.S&&Math.abs(p.y-ty)<3.5){claw38(a,a.tg);a.st='zoom';a.t=0;a.bp=p.clone().addScaledVector(a.v,3.5).setY(fl38(p.x,p.z)+45+R38()*25)}
  else if(a.t>9||(hd<25&&A38a.set(T_.x-p.x,0,T_.z-p.z).dot(a.v)<0)){a.st='zoom';a.t=0;a.bp=p.clone().addScaledVector(a.v,3).setY(fl38(p.x,p.z)+45)}break}
 case'zoom':{steer38(a,a.bp.x,a.bp.y,a.bp.z,tr,sp*.9,dt);a.wm=1;if(a.t>4){a.st='in';a.t=0}break}
 case'chase':{if(!tok38(a.tg)){a.st='zoom';a.t=0;a.bp=p.clone().addScaledVector(a.v,3).setY(p.y+30);break}const o=a.tg.o,d=p.distanceTo(o.p);A38b.copy(o.p).addScaledVector(o.v,Math.min(1.2,d/60));
  steer38(a,A38b.x,A38b.y,A38b.z,tr*1.15,sp*1.2,dt);a.wm=d<40?3:1;a.legs=d<20?-.8:1.1;if(a.rider&&d<55&&a.pcd<=0){a.pcd=.6;pistol38(a,a.tg)}
  if(d<7.5*a.S){claw38(a,a.tg);a.st='zoom';a.t=0;a.bp=p.clone().addScaledVector(a.v,3).setY(p.y+25)}else if(a.t>12){a.st='zoom';a.t=0;a.bp=p.clone().addScaledVector(a.v,3).setY(p.y+30)}break}
 case'evade':{const f=a.thr;if(f&&f.alive){A38b.set(-f.v.z,0,f.v.x).normalize().multiplyScalar(a.ph%2<1?80:-80);steer38(a,p.x+A38b.x,fl38(p.x,p.z)+12,p.z+A38b.z,tr*1.6,sp*1.15,dt)}a.wm=1;if(a.t>2.2){a.st='in';a.t=0}break}
 case'flee':{steer38(a,X+AIR38.center[0]+(p.x-X-AIR38.center[0])*.2,fl38(p.x,p.z)+90,AIR38.center[1]-1400,tr*.7,sp*1.1,dt);a.wm=1;if(p.z<AIR38.center[1]-1050||a.t>40){AIR38.dbg.fled++;a.alive=false;a.st='gone'}break}
 case'lapp':{const L=a.landAt,lx=X+L[0],lz=L[1],f=fl38(lx,lz),hd=Math.hypot(lx-p.x,lz-p.z);if(a.t<.05)scr38(p.x,p.z,.8);
  const sp2=Math.max(7,sp*Math.min(1,hd/70));steer38(a,lx,f+1.5*a.S+Math.min(40,hd*.3),lz,tr*1.2,sp2,dt);a.wm=hd<40?1:0;if(hd<14){a.st='flare';a.t=0}break}
 case'flare':{const L=a.landAt,lx=X+L[0],lz=L[1],f=fl38(lx,lz);a.spd=Math.max(.5,a.spd-dt*12);A38b.set(lx-p.x,0,lz-p.z);p.x+=A38b.x*Math.min(1,dt*1.5);p.z+=A38b.z*Math.min(1,dt*1.5);p.y+=(f+1.5*a.S-p.y)*Math.min(1,dt*2);a.v.y=0;a.v.setLength(Math.max(a.spd,.5));
  a.wm=4;a.legs=-.5;a.pitch=-.45;a.bank*=.9;if(a.t>1.6){a.st='ground';a.t=0;a.landed=1;p.y=f+1.5*a.S;if(AIR38.onLand)try{AIR38.onLand(a)}catch(e){}}break}
 case'ground':{a.wm=5;a.legs=0;a.v.set(a.v.x,0,a.v.z).setLength(.001);p.y=fl38(p.x,p.z)+1.5*a.S;if(a.rider&&a.t>1.2)dism38(a);
  if(a.t>1.2)for(const n of allies38()){if(n.g&&n.g.visible&&n.g.position.distanceTo(p)<4*a.S&&a.pcd<=0&&typeof vhAllyHit32==='function'){a.pcd=1.2;vhAllyHit32(n,40*K.dmg);AIR38.dbg.claws++;tn38('sawtooth',300,90,.25,.08)}}
  if(typeof P!=='undefined'&&P.g&&P.g.position.distanceTo(p)<3.5*a.S&&a.pcd<=0&&typeof hitP==='function'){a.pcd=1.2;hitP(18*K.dmg)}
  if(a.t>(a.gwait||4.5)){a.st='takeoff';a.t=0;scr38(p.x,p.z,.8)}break}
 case'takeoff':{a.wm=4;a.legs=.5;a.v.set(a.v.x,0,a.v.z);if(a.v.lengthSq()<.01)a.v.set(0,0,1);a.spd=Math.min(sp,2+a.t*7);a.v.setLength(a.spd);a.v.y=4+a.t*2;a.pitch=-.25;if(a.t>3.5){a.st='in';a.t=0;a.landAt=null;a.v.y=0}break}
 }
 if(a.st!=='down')guard38(a,dt)}
function dism38(a){a.rider=false;const u=a.g.userData;if(u.rider)u.rider.visible=false;const X=X0a38();A38a.set(a.v.z,0,-a.v.x).normalize();const x=a.p.x+A38a.x*2.4*a.S,z=a.p.z+A38a.z*2.4*a.S;let e=null;
 try{if(AIR38.onDismount)e=AIR38.onDismount(x-X,z,a);else if(typeof sp18==='function')e=sp18('knight',x-X,z,{tag:'knight38'});else if(typeof sp13==='function'&&typeof X13!=='undefined'){e=sp13('stv',x-X13,z,{tag:'knight38'});if(e&&typeof veyrn32==='function')try{veyrn32(e,'knight')}catch(_){}}}catch(err){e=null}
 if(e&&e.g){e.g.position.y=fl38(x,z);e.k8n=e.k8n||'a un caballero grifo';e.knight38=1}a.knight=e;AIR38.dbg.dism++;if(typeof feed==='function')feed('¡Un caballero grifo desmonta!')}
/* ---------------- IA de cazas ---------------- */
function pThink38(a){if(/down|away|leave|dive|pull|srun|ext/.test(a.st))return;
 if(a.ammo<=0&&a.bombs<=0){a.st='leave';a.t=0;return}
 const det=520*(1-.55*fog38());let b=null,bd=det;if(a.ammo>0)for(const g of AIR38.list){if(g.type!=='g'||!g.alive||/flee|ground/.test(g.st))continue;const d=g.p.distanceTo(a.p);if(d<bd){bd=d;b=g}}
 const near=a.ord&&a.ord.mode?false:true;
 if(b&&(a.var!=='D'||bd<160||a.bombs<=0)&&near){a.tg={k:'air',o:b};if(a.st!=='int'){a.st='int';a.t=0}return}
 if(a.st==='int'&&!tok38(a.tg)){a.st='pat';a.t=0}
 if(a.st==='pat'||a.st==='sset'&&!tok38(a.tg)||a.st==='dclimb'&&!tok38(a.tg)){if(a.var==='D'&&a.bombs>0){const t=a.ord&&a.ord.mode==='dive'&&a.tg?a.tg:pTgt38(a);if(t){a.tg=t;a.st='dclimb';a.t=0;a.sp=null;return}}
  if(a.ammo>0&&a.st==='pat'&&a.t>4&&R38()<.35){const t=pTgt38(a);if(t){a.tg=t;a.st='sset';a.t=0;a.sp=null}}}}
function pStep38(a,dt){const p=a.p,K=a.K,X=X0a38(),u=a.g.userData,f=fl38(p.x,p.z),alt=p.y-f,lowK=alt<35?.7:1;let sp=K.spd,tr=K.turn*lowK;a.cd-=dt;a.brkT=0;
 switch(a.st){
 case'pat':{const c=a.patrol||[AIR38.center[0],AIR38.center[1],220],r=c[2]||220;a.pa=(a.pa||Math.atan2(p.x-X-c[0],p.z-c[1]))+dt*sp/r;steer38(a,X+c[0]+Math.sin(a.pa+.4)*r,f*.3+95,c[1]+Math.cos(a.pa+.4)*r,tr,sp*.85,dt);break}
 case'int':{if(!tok38(a.tg)){a.st='pat';break}const g=a.tg.o,d=p.distanceTo(g.p);A38b.copy(g.p).addScaledVector(g.v,d/380);steer38(a,A38b.x,Math.max(A38b.y,f+(alt<40?45:20)),A38b.z,tr,sp,dt);
  A38c.copy(g.p).sub(p).normalize();const dot=A38c.dot(A38a.copy(a.v).normalize());
  if(a.cd<=0&&d<230&&dot>.965&&a.ammo>0){a.cd=.55+R38()*.35;gunBurst38(a,g.p);const ga=g.p.y-fl38(g.p.x,g.p.z),ph=.66*Math.max(0,1-d/260)*(1-.45*fog38())*(ga<30?.55:1)*(g.st==='evade'?.55:1)*(.8+.2*g.S);
   lat38(d/700,()=>{if(g.alive&&R38()<ph){AIR38.dbg.hitsG++;airDmg38(g,K.dmg*(.7+R38()*.6),'mg','a');if(typeof burst==='function')burst(g.p.x,g.p.y,g.p.z,0x8a1a10,4,.3,5)}})}
  if(d<28||alt<30||(g.st==='chase'&&g.tg&&g.tg.o===a&&d<45)){a.st='ext';a.t=0;a.bp=p.clone().addScaledVector(A38a.copy(a.v).setY(0).normalize(),160).setY(f+90+R38()*40)}break}
 case'ext':{steer38(a,a.bp.x,a.bp.y,a.bp.z,tr,sp*1.08,dt);if(a.t>3){a.st=tok38(a.tg)&&a.tg.k==='air'?'int':'pat';a.t=0}break}
 case'sset':{if(!tok38(a.tg)){a.st='pat';break}const T_=tpos38(a.tg);if(!a.sp){A38a.set(p.x-T_.x,0,p.z-T_.z).normalize();a.sp=new T.Vector3(T_.x+A38a.x*480,fl38(T_.x,T_.z)+75,T_.z+A38a.z*480)}steer38(a,a.sp.x,a.sp.y,a.sp.z,tr,sp,dt);if(p.distanceTo(a.sp)<60||a.t>14){a.st='srun';a.t=0;a.sp=null}break}
 case'srun':{if(!tok38(a.tg)){a.st='pat';break}const T_=tpos38(a.tg),d=p.distanceTo(T_);steer38(a,T_.x,T_.y+2,T_.z,tr*1.2,sp,dt);A38c.copy(T_).sub(p).normalize();
  if(a.cd<=0&&d<280&&a.ammo>0&&A38c.dot(A38a.copy(a.v).normalize())>.97){a.cd=.4;gunBurst38(a,A38d.copy(T_).setY(fl38(T_.x,T_.z)),true);const q=T_.clone();lat38(d/700,()=>strafeHits38(a,q))}
  if(d<75||alt<14){a.st='ext';a.t=0;a.bp=p.clone().addScaledVector(A38a.copy(a.v).setY(0).normalize(),200).setY(f+100)}break}
 case'dclimb':{if(!tok38(a.tg)){a.st='pat';break}const T_=tpos38(a.tg);if(!a.sp){A38a.set(p.x-T_.x,0,p.z-T_.z).normalize();a.sp=new T.Vector3(T_.x+A38a.x*170,fl38(T_.x,T_.z)+230,T_.z+A38a.z*170)}
  steer38(a,a.sp.x,a.sp.y,a.sp.z,tr*.9,sp*.8,dt);if(p.distanceTo(a.sp)<45||a.t>22){a.st='dive';a.t=0;a.sp=null;tn38('sawtooth',900,1500,2.5,.03)}break}
 case'dive':{if(!tok38(a.tg)){a.st='pull';a.t=0;break}const T_=tpos38(a.tg);steer38(a,T_.x,T_.y,T_.z,2.2,Math.min(64,sp*1.4),dt);a.brkT=1;const h=p.y-T_.y;
  if(h<115+R38()*15&&a.bombs>0){bomb38(a);a.st='pull';a.t=0}else if(h<60){a.st='pull';a.t=0}break}
 case'pull':{steer38(a,p.x+a.v.x*3,f+150,p.z+a.v.z*3,1.6,sp,dt);a.brkT=a.t<.6?1:0;if(a.t>3.5){a.st=a.bombs>0||a.ammo>0?'pat':'leave';a.t=0}break}
 case'leave':{const hx=X+AIR38.home[0],hz=AIR38.home[1];steer38(a,hx,160,hz,tr,sp*1.1,dt);if(Math.hypot(p.x-X-AIR38.center[0],p.z-AIR38.center[1])>1050){a.st='away';a.t=0;a.g.visible=false}break}
 case'away':{if(a.t>AIR38.rearm){if(a.ret){a.ammo=K.ammo;a.bombs=K.bombs;for(const m of u.bombs)m.visible=true;a.g.visible=true;a.st='pat';a.t=0;p.set(X+AIR38.home[0],160,AIR38.home[1]);a.v.set(0,0,-a.spd)}else{a.alive=false;a.st='gone'}}return}
 }
 if(a.st!=='down')guard38(a,dt)}
/* ---------------- animación ---------------- */
function animG38(a,dt){const u=a.g.userData,W=u.W;a.ph+=dt;const sp=a.st==='ground'?0:a.dvy||0;
 let tgt=a.wm===2?.0:a.wm===3?1:a.wm===4?1.3:a.wm===5?0:(a.dvy>2||a.st==='takeoff'||a.spd<a.K.spd*.8||Math.abs(a.bank)>.6?1:a.v.y<-1?.15:.4);a.flap+=(tgt-a.flap)*Math.min(1,dt*3);
 const fq=(a.wm===4?7:5.2)/Math.sqrt(a.S),s=Math.sin(a.ph*fq),s2=Math.sin(a.ph*fq-.9);let shp=0,fop=0;
 if(a.wm===5){shp=1.25;fop=-2.4}else if(a.wm===2){shp=.15;fop=-.9}else{shp=s*.75*a.flap+.08;fop=s2*.45*a.flap-.05}
 for(const w of W){w.sh.rotation.z+=(w.s*shp-w.sh.rotation.z)*Math.min(1,dt*12);w.fo.rotation.z+=(w.s*(a.wm===5?-1.0:fop)-w.fo.rotation.z)*Math.min(1,dt*12);w.fo.rotation.y+=(w.s*(a.wm===5?2.3:a.wm===2?.7:0)-w.fo.rotation.y)*Math.min(1,dt*6);w.sh.rotation.y+=(w.s*(a.wm===2?.45:a.wm===5?.5:a.wm===4?-.2:0)-w.sh.rotation.y)*Math.min(1,dt*6)}
 u.bd.position.y=a.wm===5?0:-s*.12*a.flap;u.fl.rotation.x+=((a.legs!=null?a.legs:1.1)-u.fl.rotation.x)*Math.min(1,dt*5);u.hl.rotation.x+=((a.wm===5?0:a.legs<0?.4:1)-u.hl.rotation.x)*Math.min(1,dt*4);
 u.tl.rotation.y=Math.sin(a.ph*1.7)*.3;u.tl.rotation.x=a.wm===5?.5:-.2+Math.sin(a.ph*1.1)*.1;u.hd.rotation.y=Math.sin(a.ph*.6)*.15-a.bank*.3;
 const r=u.rider;if(r&&r.visible){const ru=r.userData;if(ru.aR){a.fireT=(a.fireT||0)-dt;ru.aR.rotation.x=a.fireT>0?-1.45-(a.fireT>.22?.15:0):-.5}if(ru.eR)ru.eR.rotation.x=a.fireT>0?-.1:-.7}
 if(a.boss||det38()>=1){const c=typeof cam!=='undefined'?cam.position:null;if(c&&a.flap>.5&&a.ph%(6.283/fq)<dt&&a.p.distanceTo(c)<45)nz38(0,.25,'lowpass',500,180,.07)}}
function animP38(a,dt){const u=a.g.userData;u.prop.rotation.z+=dt*(a.st==='down'?12:48);if(u.blur)u.blur.visible=a.st!=='down'&&det38()>=1;
 for(let i=0;i<u.ail.length;i++)u.ail[i].rotation.x=(i?-1:1)*a.bank*.35;u.elev.rotation.x=Math.max(-.4,Math.min(.4,-(a.dvy||0)*.02));u.rud.rotation.y=-a.bank*.15;
 for(const b of u.brk)b.rotation.x+=((a.brkT?-1.35:0)-b.rotation.x)*Math.min(1,dt*4);
 if(a.hp<a.mx*.6&&a.st!=='down'){a.smk-=dt;if(a.smk<=0){a.smk=a.hp<a.mx*.3?.08:.2;if(typeof smoke==='function')smoke(a.p.x,a.p.y,a.p.z,2,2.5,a.hp<a.mx*.3?0x1e1e1e:0x6a6a6a,.3,.5);if(a.hp<a.mx*.3&&R38()<.3&&typeof fb12==='function')fb12(a.p.x,a.p.y,a.p.z,2.5,.4,0)}}
 const c=typeof cam!=='undefined'?cam.position:null;if(c&&a.g.visible){const d=a.p.distanceTo(c);if(d<70&&d>a.fbd&&AIR38.t-a.fbt>3&&a.fbd<60){a.fbt=AIR38.t;snd38(R38()<.5?'flyby1':'flyby2',1,a.p.x,a.p.z,{reach:40,max:300})}a.fbd=d}}
/* ---------------- caída, restos, AA ---------------- */
function fall38(a,dt){const p=a.p,f=fl38(p.x,p.z);if(a.st==='dead'){a.t+=dt;if(a.t>40){p.y-=dt*.5;if(a.t>44){a.st='gone'}}return}
 a.v.y-=9.8*dt;a.v.x*=1-dt*.15;a.v.z*=1-dt*.15;p.addScaledVector(a.v,dt);a.g.rotateZ(a.spin*dt);if(a.type==='p')a.g.rotateX(.25*dt);
 a.smk-=dt;if(a.smk<=0){a.smk=.08;if(typeof smoke==='function')smoke(p.x,p.y,p.z,a.type==='p'?3:2,4,0x1e1e1e,.5,.7);if(a.type==='p'&&R38()<.5&&typeof fb12==='function')fb12(p.x,p.y,p.z,3,.4,0)}
 if(a.type==='g'){const W=a.g.userData.W;for(const w of W){w.sh.rotation.z=w.s*(.9+Math.sin(a.t*9)*.3);w.fo.rotation.z=-w.s*.3}}
 if(p.y<=f+(a.type==='g'?.9*a.S:.8)){p.y=f+(a.type==='g'?.9*a.S:.6);a.st='dead';a.t=0;const c=typeof cam!=='undefined'?cam.position:null;
  if(a.type==='p'){fx38(p.x,p.y,p.z,2);if(typeof expSnd==='function')try{expSnd(p.x,p.z,1)}catch(e){}a.g.rotation.set(-.2,a.g.rotation.y,.5);AIR38.wsm=AIR38.wsm||[];AIR38.wsm.push({x:p.x,y:p.y,z:p.z,t:25})}
  else{if(typeof burst==='function'){burst(p.x,f+.3,p.z,0xe8ecef,16,.8,6);burst(p.x,f+.5,p.z,0x8a1a10,6,.5,3)}tn38('sine',90,40,.4,.2);a.g.rotation.set(0,a.g.rotation.y,1.2);for(const w of a.g.userData.W){w.sh.rotation.z=w.s*-.2;w.fo.rotation.z=0}}
  if(c&&p.distanceTo(c)<30&&typeof shake!=='undefined')shake=Math.max(shake,.6);if(typeof P!=='undefined'&&P.g&&Math.hypot(P.g.position.x-p.x,P.g.position.z-p.z)<4&&typeof hitP==='function')hitP(30)}}
function aa38(dt){for(const s of AIR38.aa){if(s.on&&!s.on())continue;s.cd=(s.cd||R38())-dt;if(s.cd>0)continue;s.cd=1/(s.rate||.4);const X=X0a38(),sx=X+s.x,sz=s.z,sy=fl38(sx,sz)+(s.y||1.5);let b=null,bd=s.r||240;
  for(const a of AIR38.list){if(a.side!=='veyrn'||!a.alive||a.st==='ground')continue;const d=Math.hypot(a.p.x-sx,a.p.y-sy,a.p.z-sz);if(d<bd){bd=d;b=a}}if(!b)continue;
  const o=new T.Vector3(sx,sy,sz);for(let i=0;i<4;i++)if(typeof trc16==='function')trc16(o,b.p.clone().add(A38a.set((R38()-.5)*6,(R38()-.5)*4,(R38()-.5)*6)),0xffe090);
  if(!(typeof mgS37==='function'&&mgS37('mg15',sx,sz,4,.08,.8,{reach:18,max:300}))&&typeof npcShot==='function')npcShot('mg',sx,sz);
  const ph=.5*(1-bd/(s.r||240))*(1-.4*fog38());lat38(bd/600,()=>{if(b.alive&&R38()<ph)airDmg38(b,s.dmg||14,'aa','aa')})}}
function gfire38(dt){AIR38.gft=(AIR38.gft||0)-dt;if(AIR38.gft>0)return;AIR38.gft=.7;const AL=allies38();if(!AL.length)return;
 for(const a of AIR38.list){if(a.side!=='veyrn'||!a.alive)continue;const alt=a.p.y-fl38(a.p.x,a.p.z);if(alt>60)continue;const n=AL[R38()*AL.length|0];if(!n||!n.g||!n.g.visible||n.down29||n.dead17)continue;const d=n.g.position.distanceTo(a.p);if(d>150)continue;
  if(typeof npcShot==='function')npcShot('rifle',n.g.position.x,n.g.position.z);if(R38()<.22*(1-d/150)*(1-.4*fog38()))airDmg38(a,12,'b','a');break}}
/* ---------------- bucle principal ---------------- */
function airUpd38(dt){if(AIR38.lfr===AIR38.fr)return;AIR38.lfr=AIR38.fr;const t0=performance.now();AIR38.dtL=dt;AIR38.t+=dt;const L=AIR38.list;
 for(let i=AIR38.tq.length-1;i>=0;i--){const q=AIR38.tq[i];q.t-=dt;if(q.t<=0){AIR38.tq.splice(i,1);try{q.f()}catch(e){}}}
 if(AIR38.pend.length&&(AIR38.pc=(AIR38.pc||0)-dt)<=0){AIR38.pc=1;for(let i=0;i<AIR38.pend.length;i++){const o=AIR38.pend[i],pl=/^(p|plane|v19|fighter)/.test(o.type);if(airCount38(pl?'volsk':'veyrn')<(pl?AIR38.max.p:AIR38.max.g)){AIR38.pend.splice(i,1);delete o.pend;airSpawn38(o.type,o.variant,o);break}}}
 if(!AIR38.koI&&typeof K18!=='undefined'&&K18){AIR38.koI=1;try{const ad=(q,r,h)=>{if(q)AIR38.ko.push({x:q.x!=null?q.x:q[0],z:q.z!=null?q.z:q[1],r,h})};ad(K18.commTower,8,38);ad(K18.church,8,30);ad(K18.tower,7,30)}catch(e){}}
 let bud=2;for(let i=0;i<L.length&&bud>0;i++){const a=L[(AIR38.rr+i)%L.length];if(a.alive&&a.dc<=0){a.dc=.35+R38()*.2;a.type==='g'?gThink38(a):pThink38(a);bud--}}AIR38.rr=(AIR38.rr+1)%Math.max(1,L.length);
 for(let i=L.length-1;i>=0;i--){const a=L[i];a.t+=dt;a.dc-=dt;
  if(a.st==='down'||a.st==='dead'){fall38(a,dt)}else if(a.alive){if(a.type==='g')gStep38(a,dt);else pStep38(a,dt);if(a.st!=='away'&&a.st!=='ground'&&a.st!=='flare'){a.p.addScaledVector(a.v,dt)}if(a.st!=='away'&&a.st!=='dead'&&a.st!=='down')orient38(a,dt)}
  if(a.st==='gone'){scene.remove(a.g);L.splice(i,1);continue}if(!a.g.visible)continue;
  if(a.type==='g')animG38(a,dt);else animP38(a,dt)}
 for(let i=AIR38.bombs.length-1;i>=0;i--){const b=AIR38.bombs[i];b.t+=dt;b.v.y-=9.8*dt;b.m.position.addScaledVector(b.v,dt);A38a.copy(b.m.position).add(b.v);b.m.lookAt(A38a);if(b.m.position.y<=fl38(b.m.position.x,b.m.position.z)+.3||b.t>15){AIR38.bombs.splice(i,1);boom38(b)}}
 for(let i=AIR38.deb.length-1;i>=0;i--){const d=AIR38.deb[i],p=d.m.position,f=fl38(p.x,p.z);d.t+=dt;if(p.y>f+.2){d.v.y-=9.8*dt;p.addScaledVector(d.v,dt);d.m.rotation.x+=d.sp.x*dt;d.m.rotation.z+=d.sp.z*dt;if(!d.rider&&R38()<dt*8&&typeof smoke==='function')smoke(p.x,p.y,p.z,1.5,2,0x2a2a2a,.3,.5)}else p.y=f+.2;if(d.t>25){scene.remove(d.m);AIR38.deb.splice(i,1)}}
 if(AIR38.wsm)for(let i=AIR38.wsm.length-1;i>=0;i--){const w=AIR38.wsm[i];w.t-=dt;if((w.c=(w.c||0)-dt)<=0){w.c=.35;if(typeof smoke==='function')smoke(w.x,w.y+1,w.z,4,5,0x222222,1.2,.6)}if(w.t<=0)AIR38.wsm.splice(i,1)}
 if(AIR38.aa.length)aa38(dt);if(AIR38.gfire)gfire38(dt);
 const ms=performance.now()-t0,d=AIR38.dbg;d.ms+=ms;d.n++;if(ms>d.msMax)d.msMax=ms}
/* enganches: bucle de juego (auto), motor de aviones en el mezclador v36, limpieza al cambiar de nivel */
if(typeof update==='function'){const _u=update;update=function(dt){const r=_u.apply(this,arguments);AIR38.fr++;
 try{if(AIR38.list.length&&typeof level!=='undefined'&&AIR38.list[0].lv0!==level&&AIR38.list.every(a=>a.lv0!==level))airClear38();
  if(AIR38.auto&&(AIR38.list.length||AIR38.pend.length||AIR38.tq.length||AIR38.bombs.length||AIR38.deb.length))airUpd38(dt)}catch(e){if(!AIR38.err){AIR38.err=1;console.warn('AIR38',e&&e.message)}}return r}}
if(typeof engUpd36==='function'){const _e=engUpd36;engUpd36=function(dt){try{if(AIR38.list.length&&typeof cam!=='undefined'&&typeof engSet36==='function'){let b=null,bd=420;for(const a of AIR38.list){if(a.type!=='p'||!a.alive||!a.g.visible)continue;const d=a.p.distanceTo(cam.position);if(d<bd){bd=d;b=a}}
 if(b){engSet36('A38','plane_loop',b.p.x,b.p.z,1.2,1+Math.min(.25,(b.spd-45)/120),true);const x=ENG36.act.get('A38');if(x)x.seen=ENG36.t+1}}}catch(e){}return _e.apply(this,arguments)}}
