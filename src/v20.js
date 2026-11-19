/* =====================================================================
   v20 · TÉCNICA DE EISENMARK 1922
   - Equipo y armas según la lámina de referencia («Technische Infanterie
     1922»): Stahlhelm con faldón y emblema, ribetes granate, correaje en Y,
     cartucheras triples, botas altas, macuto, cantimplora y pala; roles de
     tirador (capa de camuflaje y visor), jefe de escuadra (gorra de plato,
     monóculo, portamapas), granadero (bandolera de granadas), zapador
     (cortaalambres y bolsa), sanitario (brazalete y bolsa), radiotelegrafista
     (radio a la espalda) y ametrallador (cintas cruzadas).
   - Fusil Ew-R9 revisado y ametralladora ligera Ew-MG12.
   - Panzerfaust a la espalda en reposo y al hombro al empuñarlo.
   - Niebla PS2, botiquines del médico e IA táctica local (Ollama) con
     respaldo integrado.
   ===================================================================== */
const V20={ps2:'off',g9:[],ot:'',hpT:0,mkCd:8,big:0};
const GARNET=0x7a1a24,LEA20=0x3a2414;
/* uniforme de la lámina: gris verdoso oscuro, casco pizarra, ribetes granate */
EIS.coat=0x3e4642;EIS.pants=0x30363a;EIS.helm=0x3a413d;EIS.tab=GARNET;EIS.trim=0xb8a060;
/* ---------- armas de la lámina ---------- */
const WG20={};
function mkEwR9(scope){const k=scope?'r9s':'r9';if(!WG20[k]){const q=PB(),wd=0x5a3820,wd2=0x6e4a2a,st=0x26292c,dk=0x111111;
 pCyl(q,.022,.022,1.12,st,0,-.72,0,0,0,0,6);pBox(q,.075,.66,.07,wd,0,-.42,-.025);pBox(q,.06,.42,.03,wd2,0,-.5,.045);
 for(const y of[-.3,-.68])pBox(q,.085,.03,.09,0x8a8a80,0,y,0);pBox(q,.03,.05,.04,st,0,-1.24,.035);pBox(q,.05,.04,.05,st,0,-1.25,0);pBox(q,.02,.18,.02,st,0,-1.0,-.05);
 pBox(q,.085,.36,.11,st,0,.06,0);pBox(q,.03,.07,.03,st,0,.0,.07);pCyl(q,.016,.016,.12,st,.07,.16,.02,0,0,1.5708,6);pa(q,gSph(.025,6,5),st,.13,.16,.02);
 pBox(q,.07,.18,.1,0x2a2c2e,0,-.02,-.12);pBox(q,.072,.03,.105,dk,0,-.11,-.12);pBox(q,.02,.1,.06,st,0,.2,-.09);pa(q,gTor(.04,.008,4,8,3.1),st,0,.2,-.1,0,1.57,0);
 pBox(q,.075,.16,.1,wd,0,.32,-.07,.35);pBox(q,.078,.36,.13,wd,0,.5,-.04);pBox(q,.08,.18,.15,wd,0,.72,-.06);pBox(q,.085,.05,.16,dk,0,.82,-.06);pBox(q,.012,.9,.012,0x4a3018,.045,.2,-.06);
 if(scope){pCyl(q,.03,.03,.42,dk,0,-.06,.1,0,0,0,10);pCyl(q,.042,.042,.08,dk,0,-.3,.1,0,0,0,10);pCyl(q,.04,.04,.08,dk,0,.16,.1,0,0,0,10);pBox(q,.03,.03,.05,dk,0,.06,.065);pBox(q,.03,.03,.05,dk,0,-.18,.065);pCyl(q,.032,.032,.005,0x6a9ab8,0,-.345,.1,0,0,0,10)}
 WG20[k]=pbGeo(q)}return new T.Mesh(WG20[k],VCM)}
function mkEwMG12(){if(!WG20.mg){const q=PB(),st=0x26292c,dk=0x111111,wd=0x5a3820;
 pCyl(q,.06,.06,.62,0x3a3d38,0,-.52,0,0,0,0,10);for(let i=0;i<6;i++)pCyl(q,.063,.063,.02,dk,0,-.28-i*.09,0,0,0,0,10);pCyl(q,.024,.024,.3,dk,0,-.96,0,0,0,0,6);pCyl(q,.04,.03,.09,dk,0,-1.12,0,0,0,0,8);
 pBox(q,.11,.5,.14,st,0,.02,0);pBox(q,.04,.3,.04,st,0,.0,.09);pBox(q,.06,.04,.12,dk,0,-.06,.16);pBox(q,.22,.07,.2,0x3a3a34,.14,-.02,.02,0,0,.15);pBox(q,.16,.06,.18,0x2e2e2a,.25,-.03,.02,0,0,.3);
 pBox(q,.07,.15,.09,wd,0,.25,-.1,.3);pa(q,gTor(.045,.008,4,8,3.1),st,0,.22,-.12,0,1.57,0);pBox(q,.075,.3,.12,wd,0,.46,-.03);pBox(q,.08,.18,.15,wd,0,.66,-.05);pBox(q,.085,.05,.16,dk,0,.76,-.05);
 for(const s of[-1,1])pCyl(q,.012,.012,.42,st,s*.06,-.78,-.16,.35,0,s*.18,6);pBox(q,.03,.06,.04,st,0,-.82,.06);WG20.mg=pbGeo(q)}return new T.Mesh(WG20.mg,VCM)}
/* ---------- equipo de campaña sobre el esqueleto mkSoldier ---------- */
function gear20off(g){const u=g&&g.userData;if(!u||!u.g20)return;for(const m of u.g20){if(m.parent)m.parent.remove(m);if(m.geometry)m.geometry.dispose()}u.g20=null}
function gear20(g,o){const u=g&&g.userData;if(!u||!u.ch||!u.b)return;gear20off(g);o=o||{};const L=u.g20=[],add=(par,q)=>{if(par)L.push(pbMesh(q,par,VCM))},P_=o.pipe||GARNET,lea=o.lea||LEA20;
 if(o.helm!==undefined){const q=PB(),c=o.helm;pCyl(q,.3,.385,.1,c,0,.22,-.03,0,0,0,14);pCyl(q,.387,.387,.012,shade(c,.72),0,.17,-.03,0,0,0,14);for(const s of[-1,1])pCyl(q,.03,.03,.03,shade(c,.8),s*.29,.33,.02,0,0,1.5708,8);
  pBox(q,.014,.1,.085,0xc8c0a0,.3,.31,-.03);pBox(q,.016,.06,.05,0x1a1a1a,.304,.31,-.03);pBox(q,.016,.022,.06,P_,.305,.365,-.03);add(u.hd,q)}
 if(o.peak){const q=PB();pCyl(q,.25,.2,.1,o.peak,0,.43,0,0,0,0,14);pCyl(q,.205,.205,.06,shade(o.peak,.7),0,.37,0,0,0,0,14);pCyl(q,.207,.207,.016,P_,0,.4,0,0,0,0,14);pBox(q,.3,.02,.13,0x0a0806,0,.335,.21,.3);pBox(q,.06,.05,.012,0xc8c0a0,0,.43,.215);add(u.hd,q)}
 if(o.monocle){const q=PB();pa(q,gTor(.035,.006,4,10),0xd8c070,.08,.2,.185);pBox(q,.004,.18,.004,0xd8c070,.115,.11,.18);add(u.hd,q)}
 {const q=PB();pBox(q,.32,.03,.02,P_,0,.715,.165);for(const s of[-1,1]){pBox(q,.03,.06,.02,P_,s*.15,.69,.166);pBox(q,.176,.012,.372,P_,s*.25,.726,0)}pBox(q,.014,.6,.02,P_,.035,.38,.2);add(u.ch,q)}
 for(const e of[u.eR,u.eL])if(e){const q=PB();pBox(q,.198,.018,.218,P_,0,-.25,0);add(e,q)}
 if(o.web!==false){const q=PB();for(const s of[-1,1]){pBox(q,.045,.62,.025,lea,s*.12,.37,.212,0,0,s*.1);pBox(q,.045,.4,.025,lea,s*.08,.5,-.212,0,0,-s*.38)}pBox(q,.045,.32,.025,lea,0,.17,-.212);add(u.ch,q);
  const b=PB();pBox(b,.57,.07,.4,0x24160c,0,.17,0);pBox(b,.08,.06,.02,0x8a8a80,0,.17,.205);for(const s of[-1,1])for(let i=0;i<3;i++){pBox(b,.07,.1,.07,lea,s*(.09+i*.07),.21,.225);pBox(b,.072,.025,.075,shade(lea,.7),s*(.09+i*.07),.26,.226)}
  pBox(b,.2,.18,.08,0x5a5440,-.29,.02,-.12);pCyl(b,.06,.06,.18,0x4a4a3a,-.3,.05,-.24,0,0,0,8);pCyl(b,.062,.062,.04,0x2a2a22,-.3,.16,-.24,0,0,0,8);pBox(b,.1,.22,.03,0x3a3a32,.29,-.05,-.18);pCyl(b,.018,.018,.18,0x5a3a20,.29,.13,-.18,0,0,0,6);add(u.b,b)}
 if(o.boots!==false)for(const k of[u.k1,u.k2])if(k){const q=PB();pBox(q,.27,.3,.29,0x16130f,0,-.2,0);pBox(q,.285,.03,.305,0x0a0806,0,-.05,0);add(k,q)}
 if(o.cape){const q=PB(),C=[0x4a5a32,0x6a5a3a,0x2e3a24,0x5a6a3a];pBox(q,.74,.86,.06,C[0],0,.3,-.25,.08);pBox(q,.42,.12,.42,C[0],0,.72,-.01);for(const s of[-1,1])pBox(q,.06,.7,.4,C[0],s*.37,.33,-.02);for(let i=0;i<16;i++)pBox(q,.12+R()*.12,.08+R()*.12,.065,C[1+(i%3)],(R()-.5)*.6,R()*.72,-.26,.08);add(u.ch,q)}
 if(o.nades){const q=PB();pBox(q,.05,.78,.03,lea,0,.36,.215,0,0,.65);for(let i=0;i<4;i++){pCyl(q,.042,.042,.1,0x3a3a34,-.2+i*.12,.16+i*.1,.24,0,0,1.5708,8);pCyl(q,.013,.013,.16,0x6a4a2a,-.2+i*.12,.08+i*.1,.24,0,0,0,6)}pBox(q,.1,.08,.022,P_,.2,.52,.215);pBox(q,.1,.08,.022,P_,-.2,.52,.215);add(u.ch,q)}
 if(o.belts){const q=PB();for(const s of[-1,1]){const a=s*.62;pBox(q,.07,.84,.03,0x6a5a3a,0,.36,.222,0,0,a);for(let i=0;i<9;i++){const t=-.36+i*.09;pBox(q,.035,.025,.055,0xc8a040,-Math.sin(a)*t,.36+Math.cos(a)*t,.24,0,0,a)}}add(u.ch,q)}
 if(o.radio){const q=PB();pBox(q,.48,.58,.26,0x3a4036,0,.36,-.42);pBox(q,.44,.08,.27,0x2a2e28,0,.6,-.42);for(let i=0;i<3;i++)pCyl(q,.03,.03,.03,0x1a1a1a,-.12+i*.12,.42,-.56,1.5708,0,0,8);pBox(q,.3,.12,.02,0x8a8a70,0,.25,-.555);pCyl(q,.008,.008,1.8,0x222222,.17,1.45,-.46,0,0,0,4);pCyl(q,.02,.02,.06,0x111111,.17,.58,-.46,0,0,0,6);add(u.ch,q)}
 if(o.armband&&u.aL){const q=PB();pBox(q,.215,.09,.235,0xe8e8e8,0,-.12,0);pBox(q,.012,.06,.02,0xc02020,.11,-.12,0);pBox(q,.012,.02,.06,0xc02020,.11,-.12,0);add(u.aL,q)}
 if(o.medbag){const q=PB();pBox(q,.26,.24,.12,0xd8d0b0,-.32,0,.06);pBox(q,.04,.12,.012,0xc02020,-.32,0,.125);pBox(q,.12,.04,.012,0xc02020,-.32,0,.125);add(u.b,q);const s=PB();pBox(s,.04,.8,.025,0xb0a888,0,.36,.214,0,0,-.66);add(u.ch,s)}
 if(o.mapcase){const q=PB();pBox(q,.2,.26,.04,0x3a2414,.33,-.02,.14);pBox(q,.18,.08,.045,0x2a1a0e,.33,.09,.145);add(u.b,q)}
 if(o.tools){const q=PB();pBox(q,.02,.2,.02,0x8a8a80,-.32,-.08,.14,0,0,.15);pBox(q,.02,.2,.02,0x8a8a80,-.29,-.08,.14,0,0,-.15);pBox(q,.04,.1,.03,0xc02020,-.305,.04,.14);pBox(q,.22,.2,.12,0x5a4a2e,.3,0,-.06);add(u.b,q)}}
/* vanguardia de Eisenmark (cap. X): equipo y armas por rol */
const _eg20=eisGar;eisGar=function(s,role){_eg20(s,role);const u=s.g.userData;const W=role==='mg'?mkEwMG12():role==='marks'?mkEwR9(true):(role==='rifle'||role==='radio')?mkEwR9(false):null;
 if(W){for(const c of u.mR.children.slice())u.mR.remove(c);u.mR.add(W)}gear20(s.g,{helm:EIS.helm,belts:role==='mg',nades:role==='smg',cape:role==='marks',radio:role==='radio',tools:role==='sap'});return s};
/* jugador, escuadra, oficial y sanitario de Eisenmark */
const _eon20=eisOn;eisOn=function(){const was=L10.eis;_eon20();if(was)return;gear20(P.g,{helm:EIS.helm,nades:true});
 for(const a of allies){if(!a.name)continue;const u=a.g.userData;a.hid20=u.mR.children.slice();for(const c of a.hid20)c.visible=false;a.w20=a.role==='Apoyo'?mkEwMG12():mkEwR9(false);u.mR.add(a.w20);gear20(a.g,{helm:EIS.helm,belts:a.role==='Apoyo'})}
 if(officer)gear20(officer.g,{peak:0x2e3430,mapcase:true,monocle:true});if(MED)gear20(MED.g,{helm:EIS.helm,medbag:true})};
const _eof20=eisOff;eisOff=function(){if(L10.eis){gear20off(P.g);for(const a of allies){if(a.w20){if(a.w20.parent)a.w20.parent.remove(a.w20);a.w20=null}if(a.hid20){for(const c of a.hid20)c.visible=true;a.hid20=null}}}_eof20()};
/* capítulo IX: guarnición con Stahlhelm, correaje, botas, ribetes y armas de la lámina */
const _mg20=mkGar;mkGar=function(i,kind){const s=_mg20(i,kind);if(level!==9)return s;const coats=[0x7a8a8e,0x72827e,0x808a88,0x6e7c82],hc=[0x4a524c,0x50584e,0x464e48][R()*3|0];
 const ng=mkSoldier({coat:coats[R()*4|0],hat:'helm',hatC:hc,tab:GARNET,rank:R()<.3?1:0,pack:R()<.7,puttee:0x4a4a3e});for(const c of s.u.mR.children.slice())s.u.mR.remove(c);ng.userData.mR.add(kind==='mg'?mkEwMG12():mkEwR9(R()<.12));
 swapModel(s,ng);s.u=ng.userData;gear20(ng,{helm:hc,belts:kind==='mg',nades:R()<.25});return s};
const _sl920=startLevel9;startLevel9=function(){_sl920();for(const a of allies)if(a.name){gear20(a.g,{boots:true});V20.g9.push(a.g)}if(MED){gear20(MED.g,{medbag:true});V20.g9.push(MED.g)}};
/* ---------- PANZERFAUST: modelo nuevo, a la espalda en reposo, al hombro empuñado ---------- */
let PZG20=null;function pzGeo20(){if(!PZG20){const q=PB(),ol=0x4a5236,dk=0x1a1c18;pCyl(q,.046,.046,1.0,ol,0,0,-.02,1.5708,0,0,10);pCyl(q,.05,.05,.04,dk,0,0,-.52,1.5708,0,0,10);
 pBox(q,.095,.012,.3,0xc8a830,0,.047,-.05);pBox(q,.06,.008,.18,0x1a1a1a,0,.054,-.05);pCyl(q,.05,.06,.12,ol,0,0,.5,1.5708,0,0,10);pa(q,gSph(.115,12,9),0x3a4228,0,0,.68,0,0,0,1,1,1.25);pa(q,gCone(.1,.2,12),0x343b24,0,0,.86,1.5708);
 pBox(q,.012,.11,.02,dk,0,.1,.32);pBox(q,.05,.012,.02,dk,0,.15,.32);pBox(q,.03,.05,.12,dk,0,.06,.12);pBox(q,.02,.06,.02,0x8a8a80,0,.09,.06);PZG20=pbGeo(q)}return PZG20}
V18.pz.geometry=pzGeo20();PZG=PZG20;
V20.pzBk=new T.Group();V20.pzBk.position.set(.02,.4,-.47);V20.pzBk.rotation.z=.8;{const m=new T.Mesh(pzGeo20(),VCM);m.rotation.y=1.5708;V20.pzBk.add(m)}P.g.userData.ch.add(V20.pzBk);V20.pzBk.visible=false;
V20.r9=mkEwR9(false);V20.r9.visible=false;P.g.userData.mR.add(V20.r9);
const _aP20=animP;animP=function(dt,mv,run){_aP20(dt,mv,run);const u=P.g.userData,on=P.pzfOn&&P.pzf>0;V20.pzBk.visible=P.pzf>0&&!on&&P.g.visible;
 if(on){const pz=V18.pz;pz.position.set(-.27,.78,.02);pz.rotation.set(clamp((pitch-.18)*.5,-.45,.45),0,0);u.aR.rotation.set(-.3,.3,0);u.eR.rotation.x=-2.4;u.aL.rotation.set(-1.6,-1.05,0);u.eL.rotation.x=-.25;u.hd.rotation.y=-.18;u.hd.rotation.z=.12}else u.hd.rotation.z*=.8;
 if((level===10||level===11)&&pW.rifle.visible){pW.rifle.visible=false;V20.r9.position.copy(pW.rifle.position);V20.r9.rotation.copy(pW.rifle.rotation);V20.r9.visible=true}else V20.r9.visible=false};
const _fp20=firePzf;firePzf=function(){const o=new T.Vector3();V18.pz.getWorldPosition(o);cam.getWorldDirection(dv);const bx=o.x-dv.x*1.3,bz=o.z-dv.z*1.3;_fp20();burst(bx,o.y,bz,0xffaa44,14,.25,7);smoke(bx,o.y,bz,4,3,0x9a9a90,1.2,.6);flashLight(o.x,o.y,o.z,6,.12,0xffb060);nz18(.001,.5,'lowpass',1800,200,.12);say('¡Retroceso libre! El chorro de gases sale por detrás.',1.4)};
const _in20=interact;interact=function(){const c=playing?crateNear():null;_in20();if(c){P.pzfOn=false;say('Panzerfaust (1 disparo) a la espalda y 2 cargas satchel. ARM / Q para empuñarlo · FUEGO dispara · GRA lanza la carga.',4.5)}};
/* ---------- NIEBLA PS2: niebla de profundidad, distancia de dibujo corta y tramado retro ---------- */
const PS2F={ps2:{c:0x9e8b6b,n:14,f:78,sky:false},desert:{c:0xd9b97a,n:24,f:140,sky:false},night:{c:0x1a1722,n:10,f:58,sky:true}};
pMat.uniforms.ps2={value:0};{const fs=pMat.fragmentShader;const a='uniform float time,hurt,aber,veil,blur;',b='gl_FragColor=vec4(c,1.);}';if(fs.includes(a)&&fs.includes(b)){pMat.fragmentShader=fs.replace(a,'uniform float time,hurt,aber,veil,blur,ps2;').replace(b,'if(ps2>0.){vec2 q=mod(floor(gl_FragCoord.xy),4.);float bd=(mod(q.x+q.y*2.,4.)+mod(q.y,2.)*.5)/4.5-.4;c=floor(c*24.+bd)/24.;}'+b);pMat.needsUpdate=true}}
const _fc20=new T.Color(),_fc20b=new T.Color();
const _rr20=rend.render.bind(rend);rend.render=function(s,c,...a){const F=PS2F[V20.ps2];if(!F||s!==scene||!scene.fog||!playing)return _rr20(s,c,...a);
 const f=scene.fog,n0=f.near,f0=f.far,bg=scene.background,sv=skyMesh.visible,cf=c.far;_fc20b.copy(f.color);const k=((level===10&&L10.under)||(level===9&&L9.under))?.75:1;
 f.near=Math.min(n0,F.n*k);f.far=Math.min(f0,F.f*k);_fc20.setHex(F.c).lerp(_fc20b,.25);f.color.copy(_fc20);if(!F.sky){skyMesh.visible=false;scene.background=f.color}c.far=Math.min(cf,f.far+20);c.updateProjectionMatrix();
 try{_rr20(s,c,...a)}finally{f.near=n0;f.far=f0;f.color.copy(_fc20b);scene.background=bg;skyMesh.visible=sv;c.far=cf;c.updateProjectionMatrix()}};
/* ---------- MÉDICO: botiquines (cura y munición) ---------- */
const MK20=[];
function spawnMedkit20(x,z){const g=new T.Group(),q=PB();pBox(q,.5,.3,.36,0xe8e0d0,0,.15,0);pBox(q,.3,.012,.08,0xc02020,0,.305,0);pBox(q,.08,.012,.3,0xc02020,0,.305,0);pBox(q,.52,.04,.38,0x6a5a3a,0,.02,0);pBox(q,.06,.04,.2,0x3a3a32,0,.33,0);pbMesh(q,g,VCV);g.position.set(x,0,z);scene.add(g);MK20.push({g,x,z,t:45,lv:level});return g}
function mkUpd20(dt){const pp=P.g.position;for(let i=MK20.length-1;i>=0;i--){const k=MK20[i];k.t-=dt;k.g.rotation.y+=dt*1.5;k.g.position.y=.12+Math.sin(time*3+i)*.07;if(k.lv!==level||k.t<=0){scene.remove(k.g);MK20.splice(i,1);continue}
  if(Math.hypot(pp.x-k.x,pp.z-k.z)<2.2&&P.hp<100){P.hp=Math.min(100,P.hp+25);if(P.weapons.rifle)P.weapons.rifle.reserve+=10;if(P.weapons.smg)P.weapons.smg.reserve+=25;feed('✚ Botiquín: +25 salud y munición');snd(880,.12,'sine',.05);scene.remove(k.g);MK20.splice(i,1)}}
 const m=MED;if(m&&m.g.visible&&!(m.down>0)&&!(level===10&&L10.solo)){V20.mkCd-=dt;if(P.hp<60&&V20.mkCd<=0&&Math.hypot(m.g.position.x-pp.x,m.g.position.z-pp.z)<30){V20.mkCd=24;const a=Math.atan2(m.g.position.x-pp.x,m.g.position.z-pp.z);spawnMedkit20(pp.x+Math.sin(a)*1.6,pp.z+Math.cos(a)*1.6);say(m.name+': «¡Botiquín a tus pies! ¡Cógelo!»',2.5)}}}
const _kill20=kill;kill=function(e){const x=e.g.position.x,z=e.g.position.z;_kill20(e);if(playing&&R()<.08&&MK20.length<6)spawnMedkit20(x+.6,z)};
/* ---------- IA TÁCTICA: conexión automática a un modelo local (Ollama) con respaldo integrado ---------- */
const AI20={ep:null,model:'',busy:false,last:-99};
const FB20={obj:['¡Nuevo objetivo! Avanzad por saltos y cubríos.','¡En marcha! Fuego y movimiento, como en la instrucción.','¡Adelante! Que nadie se quede atrás.','¡Objetivo a la vista! Escuadra, conmigo.'],hp:['¡Médico! ¡Cubrid al herido!','¡Fuego de cobertura! ¡Sacadlo de ahí!','¡Aguanta, soldado! ¡El sanitario va hacia ti!'],wave:['¡Oleada enemiga! ¡Todos a los parapetos!','¡Muchos enemigos! ¡Fuego a discreción!','¡Que no rompan la línea! ¡Granadas listas!']};
$('hud').insertAdjacentHTML('beforeend','<div id="ai20" style="display:none;position:absolute;top:46px;right:72px;font:11px monospace;background:#000a;border:1px solid #e0b05066;padding:3px 7px;border-radius:4px;color:#cfe8c0;pointer-events:none"></div>');
async function aiDetect20(){const b=$('ai20');AI20.ep=null;if($('aimode').value==='off'){b.style.display='none';return}b.style.display='block';b.textContent='IA: buscando modelo local…';
 for(const h of['http://127.0.0.1:11434','http://localhost:11434']){try{const c=new AbortController(),t=setTimeout(()=>c.abort(),900);const r=await fetch(h+'/api/tags',{signal:c.signal});clearTimeout(t);if(r.ok){const j=await r.json().catch(()=>({}));const want=$('aimodel').value,ms=(j.models||[]).map(m=>m.name||'');AI20.model=ms.find(n=>n.startsWith(want))||ms[0]||want;AI20.ep=h+'/api/generate';b.textContent='IA: local ('+AI20.model+')';return}}catch(e){}}
 b.textContent='IA: motor táctico integrado';setTimeout(()=>{if(!AI20.ep)b.style.display='none'},6000)}
async function askAI20(sit,fb){if($('aimode').value==='off'||AI20.busy||time-AI20.last<18)return;AI20.last=time;const who=officer&&officer.g.visible&&officer.name?officer.name:(level===10?'Hauptmann Reuss':'el teniente');
 if(!AI20.ep){if(fb)say(who+': «'+fb+'»',4);return}AI20.busy=true;
 try{const c=new AbortController(),t=setTimeout(()=>c.abort(),2600);const r=await fetch(AI20.ep,{method:'POST',headers:{'Content-Type':'application/json'},signal:c.signal,body:JSON.stringify({model:AI20.model,stream:false,options:{num_predict:48,temperature:.8},
  prompt:'Eres '+who+', oficial de '+(level===10?'la Marca de Eisenmark en 1922':'un ejército europeo en 1909')+' en un videojuego bélico de fantasía histórica. Di UNA sola frase corta (máximo 16 palabras) en español, como orden de radio a tu tropa, para esta situación: '+sit+'. Sin comillas ni explicaciones.'})});
  clearTimeout(t);if(!r.ok)throw 0;const j=await r.json();const s=(j.response||'').trim().split('\n')[0].replace(/^["«»“”']+|["«»“”']+$/g,'').slice(0,140);if(playing)say(who+': «'+(s||fb)+'»',4.5)}
 catch(e){AI20.ep=null;$('ai20').textContent='IA: motor táctico integrado';if(fb&&playing)say(who+': «'+fb+'»',4)}AI20.busy=false}
function aiTick20(dt){if(level===11||!playing||L9.cine||(typeof L8!=='undefined'&&L8.cine))return;const o=$('obj').textContent,key=o.replace(/[\d%■□\[\]\/()·:.,]/g,'').trim().slice(0,38);
 if(key&&key!==V20.ot){const prev=V20.ot;V20.ot=key;if(prev&&R()<(AI20.ep?.85:.25))askAI20('nuevo objetivo: '+o,FB20.obj[R()*FB20.obj.length|0])}
 V20.hpT-=dt;if(P.hp<30&&V20.hpT<=0){V20.hpT=30;askAI20('el soldado '+(level===10?'Wolff':'Kovač')+' está gravemente herido bajo fuego enemigo',FB20.hp[R()*FB20.hp.length|0])}
 let n=0;for(const e of enemies)if(e.active!==false)n++;if(n>=12&&!V20.big){V20.big=1;askAI20('una gran oleada de '+n+' enemigos se acerca',FB20.wave[R()*FB20.wave.length|0])}if(n<5)V20.big=0}
/* ---------- menú: niebla PS2 e IA local ---------- */
{const S='background:#302417;color:#f3e6c4;padding:10px;border:1px solid #a77b35';$('lvsel').parentElement.insertAdjacentHTML('afterend','<label>NIEBLA PS2 <select id="ps2fog" style="'+S+'"><option value="off" selected>Desactivada (niebla del capítulo)</option><option value="ps2">PS2 clásica · densa + tramado</option><option value="desert">Dunas del Nilo · ámbar</option><option value="night">Noche del Velo · corta</option></select></label><label>IA LOCAL <select id="aimode" style="'+S+'"><option value="auto" selected>Automática (Ollama)</option><option value="off">Desactivada</option></select> <select id="aimodel" style="'+S+'"><option>llama3.2</option><option>mistral</option><option>qwen2.5</option><option>gemma2</option></select></label>');
 try{const v=localStorage.getItem('ps2fog20');if(v&&PS2F[v])$('ps2fog').value=v;const a=localStorage.getItem('aimode20');if(a)$('aimode').value=a}catch(e){}
 $('ps2fog').onchange=()=>{V20.ps2=$('ps2fog').value;try{localStorage.setItem('ps2fog20',V20.ps2)}catch(e){}};$('aimode').onchange=()=>{try{localStorage.setItem('aimode20',$('aimode').value)}catch(e){}}}
document.querySelector('#menu p b').textContent='1909 / 1922 — Capítulos I–X · v20 TÉCNICA DE EISENMARK';
$('hs').insertAdjacentHTML('beforebegin','<p class="c" style="color:#c8e0b0">NUEVO v20 · uniformes y armas de la lámina «Technische Infanterie 1922» (Ew-R9, Ew-MG12) en los caps. IX y X · Panzerfaust a la espalda / al hombro · botones táctiles corregidos · niebla PS2 · botiquines del médico · IA local (Ollama)</p>');
const _g20=$('go').onclick;$('go').onclick=function(){V20.ps2=$('ps2fog').value;V20.ot='';const r=_g20.apply(this,arguments);aiDetect20();return r};
/* ---------- actualización ---------- */
const _up20=update;update=function(dt){_up20(dt);if(!playing)return;mkUpd20(dt);aiTick20(dt);pMat.uniforms.ps2.value=V20.ps2!=='off'?1:0;
 if(level!==9&&V20.g9.length){for(const g of V20.g9)gear20off(g);V20.g9=[]}
 if((level===10||level===11)&&P.cur==='rifle'&&!(P.pzfOn&&P.pzf>0)&&!P.mg){const a=$('ammo'),t=a.textContent;if(t.startsWith('MANNLICHER'))a.textContent=t.replace('MANNLICHER-MAUSER','EW-R9 REVISADO')}};
