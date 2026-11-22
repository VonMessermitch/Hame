#!/usr/bin/env python3
"""Construye la Edición Definitiva (v16) a partir del original v15:
aplica ediciones quirúrgicas verificadas al código existente e inyecta el módulo v16.js."""
import sys, pathlib, re
root = pathlib.Path(__file__).resolve().parent.parent
src = (root/'original_v15.html').read_text(encoding='utf-8')
mod = (root/'src'/'v16.js').read_text(encoding='utf-8') + "\n" + (root/'src'/'v17.js').read_text(encoding='utf-8') + "\n" + (root/'src'/'v18.js').read_text(encoding='utf-8') + "\n" + (root/'src'/'v19.js').read_text(encoding='utf-8') + "\n" + (root/'src'/'v20.js').read_text(encoding='utf-8') + "\n" + (root/'src'/'v21.js').read_text(encoding='utf-8') + "\n" + (root/'src'/'v22.js').read_text(encoding='utf-8') + "\n" + (root/'src'/'v23.js').read_text(encoding='utf-8') + "\n" + (root/'src'/'v25.js').read_text(encoding='utf-8') + "\n" + (root/'src'/'v26.js').read_text(encoding='utf-8') + "\n" + (root/'src'/'v27.js').read_text(encoding='utf-8') + "\n" + (root/'src'/'v28_ships.js').read_text(encoding='utf-8') + "\n" + (root/'src'/'v28_env.js').read_text(encoding='utf-8') + "\n" + (root/'src'/'v28_base.js').read_text(encoding='utf-8') + "\n" + (root/'src'/'v28.js').read_text(encoding='utf-8') + "\n" + (root/'src'/'v29.js').read_text(encoding='utf-8') + "\n" + (root/'src'/'v30_lib.js').read_text(encoding='utf-8') + "\n" + (root/'src'/'v30.js').read_text(encoding='utf-8') + "\n" + (root/'src'/'v30_taikin.js').read_text(encoding='utf-8') + "\n" + (root/'src'/'v31_l12.js').read_text(encoding='utf-8') + "\n" + (root/'src'/'v31_l13.js').read_text(encoding='utf-8') + "\n" + (root/'src'/'v31_l14.js').read_text(encoding='utf-8') + "\n" + (root/'src'/'v31.js').read_text(encoding='utf-8') + ''.join("\n" + (root/'src'/f).read_text(encoding='utf-8') for f in ['v32_lib.js','v32_veh.js','v32_env.js','v32_golfo.js','v32_vm.js','v32.js','v33_ai.js','v33_ally.js','v34_snd_data.js','v34_audio.js','v35_snd_data.js','v35_audio.js'])
out = src
def rep(old, new, count=1):
    global out
    n = out.count(old)
    if n != count:
        sys.exit(f'EDIT FAILED ({n} matches, expected {count}): {old[:90]!r}')
    out = out.replace(old, new)

# --- cabecera / CDN con respaldo ---
# v20: los botones táctiles llamaban a las funciones originales capturadas (los añadidos posteriores —caja del Panzerfaust, cargas, trabajos— no llegaban en Android)
rep("tb('br',reload);tb('bro',roll);tb('bj',jump);tb('bm',melee);tb('bg',throwG);tb('bw',swap);tb('bi',interact);","tb('br',()=>reload());tb('bro',()=>roll());tb('bj',()=>jump());tb('bm',()=>melee());tb('bg',()=>throwG());tb('bw',()=>swap());tb('bi',()=>interact());")
rep('<title>Sombras sobre el Nilo — 1909 (v15 · 1.0)</title>', '<title>Sombras sobre el Nilo — 1909 (v35 · Ingeniería de sonido)</title>')
rep('<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>',
    '<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>\n'
    '<script>window.THREE||document.write(\'<script src="https://cdn.jsdelivr.net/npm/three@0.128.0/build/three.min.js"><\\/script>\')</script>')
# --- globales de enlace para el módulo v16 (objetivo enemigo, audio) ---
rep("var G={q:'alta'", "var TGP=null,TGH=null,SFXV=1,sndOK=()=>true,sfxOK=()=>true,AB=()=>ac.destination,e8T=null,e8Hit=()=>false,e8Blast=()=>{},unstk=null,pSpread=()=>0;\nvar G={q:'alta'")
# --- audio: bus maestro + limitador de voces ---
rep("function snd(f,d,t,v){if(!ac)return;", "function snd(f,d,t,v){if(!ac||!sndOK())return;")
rep("g.gain.exponentialRampToValueAtTime(.001,n+d);o.connect(g);g.connect(ac.destination);o.start();o.stop(n+d)}catch(e){}}",
    "g.gain.exponentialRampToValueAtTime(.001,n+d);o.connect(g);g.connect(AB());o.start();o.stop(n+d)}catch(e){}}")
rep("function weaponSfx(kind){if(!ac)return;", "function weaponSfx(kind){if(!ac||!sfxOK())return;")
rep("master.gain.value=mv*G.vol;const cp=ac.createDynamicsCompressor();master.connect(cp);cp.connect(ac.destination);",
    "master.gain.value=mv*G.vol*SFXV;SFXV=1;const cp=ac.createDynamicsCompressor();master.connect(cp);cp.connect(AB());")
rep("const M=ac.createGain();M.gain.value=.05*G.vol;M.connect(ac.destination);", "const M=ac.createGain();M.gain.value=.05*G.vol;M.connect(AB());")
# --- IA enemiga: objetivo dinámico (jugador, aliados, guarnición) + antiatasco ---
rep("function findCover(e,far){let best=null,bs=1e9;const px=P.g.position.x,pz=P.g.position.z,",
    "function findCover(e,far){let best=null,bs=1e9;const _q=TGP||P.g.position,px=_q.x,pz=_q.z,")
rep("function shootSol(e,p){const o=p.clone();o.y=1.4*e.s;const t=P.g.position.clone();t.y=P.g.position.y+1.2;",
    "function shootSol(e,p){const o=p.clone();o.y=1.4*e.s;const t=(TGP||P.g.position).clone();t.y=(TGP||P.g.position).y+1.2;")
a = out.index("for(const e of [...enemies]){const p=e.g.position;let dx=P.g.position.x-p.x,dz=P.g.position.z-p.z;")
b_tok = "animE(e,Math.hypot(e.vx,e.vz)>.4?1:0,0,dt,crouch);const f=e.flash>0?1.1:1;e.g.scale.set(e.s*f,e.s*f*1,e.s*f)}"
b = out.index(b_tok, a) + len(b_tok)
seg = out[a:b]
seg = seg.replace("P.g.position", "TGP").replace("hitP(", "TGH(")
seg = seg.replace("for(const e of [...enemies]){const p=e.g.position;let dx=TGP.x-p.x",
                  "for(const e of [...enemies]){const p=e.g.position;{const _t=e8T?e8T(e):null;TGP=_t?_t.p:P.g.position;TGH=_t?_t.h:hitP}let dx=TGP.x-p.x", 1)
assert seg.count("const am=Math.hypot(ax,az);if(am>1){ax/=am;az/=am}") == 1
seg = seg.replace("const am=Math.hypot(ax,az);if(am>1){ax/=am;az/=am}",
                  "if(unstk&&!e.hold){const _u=unstk(e,ax,az,dt);ax=_u[0];az=_u[1]}const am=Math.hypot(ax,az);if(am>1){ax/=am;az/=am}")
out = out[:a] + seg + "TGP=P.g.position;TGH=hitP;" + out[b:]
# balas enemigas pueden alcanzar a aliados / guarnición; agacharse reduce la silueta
rep("if(Math.hypot(p.x-P.g.position.x,p.z-P.g.position.z)<.75&&p.y<P.g.position.y+2.2&&p.y>P.g.position.y-.2){hitP(b.dmg);h=true}if(!h&&inB(p))h=true;",
    "if(Math.hypot(p.x-P.g.position.x,p.z-P.g.position.z)<.75&&p.y<P.g.position.y+(P.pr?.75:P.cr?1.45:2.2)&&p.y>P.g.position.y-.2){hitP(b.dmg);h=true}if(!h)h=e8Hit(b);if(!h&&inB(p))h=true;")
# granadas enemigas dañan también a la guarnición
rep("const dp=Math.hypot(P.g.position.x-q.x,P.g.position.z-q.z);if(dp<6)hitP(34*(1-dp/6*.5));scene.remove(g.m);egr.splice(i,1)",
    "const dp=Math.hypot(P.g.position.x-q.x,P.g.position.z-q.z);if(dp<6)hitP(34*(1-dp/6*.5));e8Blast(q.x,q.z,6,34);if(window.expSnd)expSnd(q.x,q.z,1);scene.remove(g.m);egr.splice(i,1)")
# cadáveres persistentes (con límite)
rep("p.y=c.y-(c.t>2.6?(c.t-2.6)*.8:0);if(c.t>4){scene.remove(c.g);corpses.splice(i,1)}",
    "const K=c.keep||(level===8?9:2.6);p.y=c.y-(c.t>K?(c.t-K)*.8:0);if(c.t>K+1.4){scene.remove(c.g);if(window.disp16)disp16(c.g);corpses.splice(i,1)}")
# disparo: dispersión según movimiento / salto / agachado
rep("const v=tg.sub(o).normalize();if(smg){v.x+=(R()-.5)*.06;v.y+=(R()-.5)*.03;v.z+=(R()-.5)*.06;v.normalize()}",
    "const v=tg.sub(o).normalize();{const k=(smg?.06:0)+pSpread();if(k>0){v.x+=(R()-.5)*k;v.y+=(R()-.5)*k*.5;v.z+=(R()-.5)*k;v.normalize()}}")
# movimiento del jugador: inercia, aceleración, sprint con fatiga, agacharse
rep("let sp=run?9:6.2;if(P.rel>0)sp*=.75;if(P.swT>=0||P.bt>=0)sp*=.35;\nif(P.roll>0){P.roll-=dt;vx=P.rd.x;vz=P.rd.z;sp=14;P.g.scale.y=.65;if(P.roll<=0)P.g.scale.y=1}\nif(moving||P.roll>0){P.g.position.x+=vx*sp*dt;P.g.position.z+=vz*sp*dt}resolve(P.g.position,.5,P.g.position.y);",
    "let sp=run?9:6.2;if(P.rel>0)sp*=.75;if(P.swT>=0||P.bt>=0)sp*=.35;if(window.pMove)sp=pMove(sp,run,moving,dt);\nif(P.roll>0){P.roll-=dt;vx=P.rd.x;vz=P.rd.z;sp=14;P.g.scale.y=.65;if(P.roll<=0)P.g.scale.y=1;P.mvx=vx*sp*.6;P.mvz=vz*sp*.6;P.g.position.x+=vx*sp*dt;P.g.position.z+=vz*sp*dt}\nelse{P.mvx=P.mvx||0;P.mvz=P.mvz||0;const ac2=P.gnd?(moving?9:12):(moving?2.2:.8),kk=Math.min(1,dt*ac2);P.mvx+=((moving?vx*sp:0)-P.mvx)*kk;P.mvz+=((moving?vz*sp:0)-P.mvz)*kk;P.g.position.x+=P.mvx*dt;P.g.position.z+=P.mvz*dt}resolve(P.g.position,.5,P.g.position.y);")
# post-proceso: tinte de color controlable (noche azulada en el cap. VIII)
rep("uniforms:{t:{value:rt.texture},time:{value:0},", "uniforms:{tint:{value:new T.Vector3(1.06,1,.9)},t:{value:rt.texture},time:{value:0},")
rep("fragmentShader:`uniform sampler2D t;uniform float time,hurt,aber,veil,blur;", "fragmentShader:`uniform sampler2D t;uniform vec3 tint;uniform float time,hurt,aber,veil,blur;")
rep("c=mix(vec3(l),c,1.12)*vec3(1.06,1.,.9);", "c=mix(vec3(l),c,1.12)*tint;")
# cap. VIII: casamatas reemplazadas por búnkeres reales (v16) y defensores DENTRO
rep("for(const s of[-1,1]){const sg=mkSeg(obstB,{x:X8+s*46,z:-80,hw:5,hd:4,h:4.5},2);chAdd(3,X8+s*46,1.5,-80,10,3,8,0,sg);chAdd(3,X8+s*46,3.8,-80,8,1.6,6,0,sg);box(3,.5,.3,0x050505,X8+s*46,2.6,-75.9)}", "")
rep("for(const s of[-1,1])sp8('bar',X8+s*46,-77,3,2).hp*=1.8;",
    "for(const s of[-1,1])for(const o of[-2.6,2.6]){const e=sp8('bar',X8+s*46+o,-77.3,.001,2);e.hp*=1.4;e.inBk=1}")
rep("q=P.g.position,px=Math.abs(q.x-X8)<62", "q=TGP||P.g.position,px=Math.abs(q.x-X8)<62")
rep("const o=p.clone();o.y=p.y+1.4;const t=P.g.position.clone();t.y+=1.2;", "const o=p.clone();o.y=p.y+1.4;const t=(TGP||P.g.position).clone();t.y+=1.2;")
# detonación: destrucción PARCIAL del fuerte
rep("chBlast(MX,0,MZ,260,34,0);CH.forEach(c=>c.seg&&c.seg.o&&segOff(c.seg));CH.forEach(c=>{if(c.s===0&&c.m===3)rel(c,c.x-MX,2,c.z-MZ,10,26,.1)});L8.props.forEach(p=>p.visible=false);",
    "partialBoom(MX,MZ);")
# antes de los blindados: cinemática de avance del tanque
rep("if(L8.ph===10&&L8.rt>=60){L8.ph=11;L8.at=0;spawnTanks()}", "if(L8.ph===10&&L8.rt>=60){tankCineStart()}")
rep("if(L8.capT>3&&L8.ph===6){L8.ph=7;startBoom()}", "if(L8.capT>(window.capWait?capWait():3)&&L8.ph===6){L8.ph=7;startBoom()}")
# minotauros: golpean a su objetivo real y a la guarnición
rep("const p=e.g.position,u=e.g.userData,d=Math.hypot(pp.x-p.x,pp.z-p.z);e.slamT-=dt;",
    "const p=e.g.position,u=e.g.userData,_tp=e.tp8||pp,d=Math.hypot(_tp.x-p.x,_tp.z-p.z);e.slamT-=dt;")
rep("if(d<7)hitP(30*(1-d/7*.5));", "if(Math.hypot(pp.x-p.x,pp.z-p.z)<7)hitP(30*(1-Math.hypot(pp.x-p.x,pp.z-p.z)/7*.5));e8Blast(p.x,p.z,7,30);")
# NPC centinela decorativo del campamento: sustituido por la guarnición combatiente
rep("8:[['s','a',X8-44,30],", "8:[")
# v17: penetración de bala, impactos en vehículos/máquinas, combos de sable ampliados
rep("if(dx*dx+dz*dz<(.95*e.s)**2&&y>p.y&&y<p.y+2.3*e.s){const head=y-p.y>1.65*e.s;hurt(e,b.dmg*(head?2:1),head?'h':'b',b.by);hit=true;",
    "if(!(b.hs&&b.hs.has(e))&&dx*dx+dz*dz<(.95*e.s)**2&&y>p.y&&y<p.y+2.3*e.s){const head=y-p.y>1.65*e.s;hurt(e,b.dmg*(head?2:1),head?'h':'b',b.by);hit=true;if(b.pen>0){b.pen--;b.dmg*=.6;(b.hs||(b.hs=new Set())).add(e);hit=false}")
rep("if(!hit&&inB(b.m.position)){hit=true;", "if(!hit&&v9Hit(b))hit=true;if(!hit&&inB(b.m.position)){hit=true;")
rep("var TGP=null,", "var v9Hit=()=>false,TGP=null,")
rep("startSw(P.swC>0?(P.sc+1)%3:0)}", "startSw(P.swC>0?(P.sc+1)%SW.length:0)}")
rep("if(P.q)startSw((P.sc+1)%3)}", "if(P.q)startSw((P.sc+1)%SW.length)}")
rep("startSw(2);P.swHit=true;P.plunge=true;", "startSw(SW.length-1);P.swHit=true;P.plunge=true;")
rep("slash(SW[2]);shake=Math.max(shake,1.5);", "slash(SW[SW.length-1]);shake=Math.max(shake,1.5);")
# --- inyección del módulo ---
rep("\n</script></body></html>", "\n" + mod + "\n</script></body></html>")
_o = pathlib.Path(sys.argv[1]) if len(sys.argv)>1 else root/'Sombras_sobre_el_Nilo_1909_v35.html'
_o.write_text(out, encoding='utf-8')
print('OK', len(out), 'bytes')
