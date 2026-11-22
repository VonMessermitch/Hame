const X18=200000;
/* =====================================================================
   v38 · BIBLIOTECA «MARTILLO DE NIEVE» — personajes, banderas y vehículos FRUST
   Personajes (envuelven volsk32/veyrn32; misma reconstrucción in situ y kit
   fusionado y cacheado por articulación):
     volsk32(t,'r12'|'r12off'|'frust'|'pilot',o)   veyrn32(t,'storm'|'knight',o)
     o: {hat, coat, boots, scarf, roll, nco, blk, arm, face, rank, scale}
     knight38(o) → Group jinete sentado (userData con articulaciones aR/aL/eR/eL/mR/mL/hd/ch/b/l1/l2/k1/k2)
   Banderas: flag38(kind,o) kinds 'volsk12' 'volsk' 'frust' 'veyrn' (tela ondulada en el
     sombreador de vértices, texturas de canvas generadas en código, diseños originales).
   Vehículos FRUST (VEH32): tractor38 spg38 ammoTruck38 obsCar38 howitzer38,
     tow38/unlimber38/limber38, obsMast38. Coordenadas locales VEH32 como siempre.
   ===================================================================== */
const VOLSK38={bg:0x6a7a8c,bgD:0x58667a,breech:0x56627a,coat:0x5c6878,helm:0x5e5c3a,lea:0x6e4528,leaD:0x4a2c18,boot:0x3e2616,putt:0x5a6070,roll:0x6a6650,
 crim:0x8a1c26,blue:0x1c2648,white:0xe6e2d6,brass:0xb8983c,glove:0x3a2a1c,scarf:0x7a6c5c,fr:0x4e5634,frD:0x3a4028,blk:0x1a1816,blkH:0x2c2826,
 flight:0x5a3a22,fur:0xcbb48a,canvas:0x8a7e58,steel:0x5a5e5e,gog:0x8a7a4a,lens:0x2a4a52};
const VEYRN38={coatG:0x5a5e62,coatB:0x5e4a36,mask:0x141414,lens:0x3a4a3a,band:0x2a2622,web:0x5b5a3c,pouch:0x6a5a3a,kn:0x23252b,knP:0x2e3036,armor:0x7a8086,brass:0xa08a4a,plume:0x8a2a22};
/* gafas sobre la frente (espacio de la cabeza) */
function gog38(q,y,z,D,tilt){pBox(q,.4,.04,.4,0x2a2420,0,y,-.01);for(const s of[-1,1]){pCyl(q,.055,.055,.04,VOLSK38.gog,s*.08,y+.01,z,1.5708-(tilt||0),0,0,D?10:6);pCyl(q,.042,.042,.046,VOLSK38.lens,s*.08,y+.01,z+.004,1.5708-(tilt||0),0,0,D?10:6)}pBox(q,.04,.02,.03,0x2a2420,0,y+.01,z)}
/* casco M22 volskayo: cúpula alta con nervio, ala moderada caída atrás, placa del 12 */
function hgM22(q,D,c){const C=c||VOLSK38.helm,seg=D>1?18:D?14:10;
 const L=latheL32('lh38'+seg,[[0,.33],[.12,.315],[.2,.27],[.25,.19],[.27,.1],[.28,.04],[.33,-.0],[.345,-.02],[.33,-.025],[.27,.02],[.258,.1],[0,.13]],seg,
  (x,y,z)=>{if(y>.05)return y;const r=Math.hypot(x,z)||1,b=Math.max(0,-z/r);return y-.035*b});
 pa(q,L,C,0,.2,0,0,0,0,1.02,1,1.08,.03);pa(q,gTor(.262,.012,4,seg,6.2832),shade(C,.85),0,.335,0,1.5708,0,0,1,1.08,1);
 pa(q,gTor(.12,.014,4,D?10:6,3.1416),shade(C,1.1),0,.5,0,0,1.5708,0,1,1,1.4);
 if(D){pBox(q,.07,.08,.012,VOLSK38.brass,0,.38,.275,-.35,0,0);pBox(q,.012,.05,.016,VOLSK38.crim,-.015,.38,.282,-.35,0,0);pBox(q,.02,.012,.016,VOLSK38.crim,.018,.395,.28,-.35,0,0);pBox(q,.02,.012,.016,VOLSK38.crim,.018,.365,.282,-.35,0,0)}
 for(const s of[-1,1])pBox(q,.018,.2,.02,VOLSK38.leaD,s*.2,.1,.05,0,0,s*.14);pBox(q,.12,.02,.025,VOLSK38.leaD,0,.0,.15)}
/* gorra de campaña de copa cuadrada (original) */
function hgSquare38(q,c,D,band){pCyl(q,.255,.255,.08,band||shade(c,.85),0,.37,0,0,0,0,D?12:8);pCyl(q,.26,.3,.1,c,0,.45,-.01,-.06,0,0,D?12:8);pBox(q,.42,.06,.42,c,0,.52,-.02,-.06,.785,0);if(D)pBox(q,.6,.012,.02,shade(c,.75),0,.555,-.02,-.06,.785,0),pBox(q,.6,.012,.02,shade(c,.75),0,.555,-.02,-.06,-.785,0);
 pBox(q,.28,.02,.12,0x14100c,0,.335,.25,.32,0,0);const K=VOLSK32.cockade;pCyl(q,.03,.03,.012,K[0],0,.39,.257,1.5708,0,0,8);pCyl(q,.018,.018,.014,K[2],0,.39,.26,1.5708,0,0,6);if(D)pBox(q,.05,.04,.012,VOLSK38.brass,0,.46,.29,-.1,0,0)}
/* casco de cuero (tripulante FRUST / piloto) con orejeras y gafas */
function hgLeather38(q,c,D,flaps){pa(q,gSph(.245,D?12:8,5,0,1.3),c,0,.2,0,0,0,0,1.06,1.08,1.12,.04);pBox(q,.4,.28,.06,c,0,.2,-.19);
 for(const s of[-1,1]){pBox(q,.05,flaps?.32:.24,.2,c,s*.2,flaps?.12:.17,-.0);if(flaps)pBox(q,.012,.12,.012,0x2a2420,s*.15,-.06,.12,0,0,s*.3)}if(D)pa(q,gTor(.24,.02,4,D>1?12:8,3.1416),shade(c,.8),0,.42,0,0,1.5708,0,1,1,1.1);gog38(q,.36,.24,D,.3)}
/* insignia FRUST: rueda dentada + cañón + estrella de 4 puntas (plano yz si ax='x', plano xy si 'z') */
function frBadge38(q,x,y,z,ax,s,D){const X=ax==='x',o=X?Math.sign(x||1):Math.sign(z||1),P=(a,b,c)=>[x+(X?c*o:a),y+b,z+(X?a:c*o)];
 const ring=(r,t,col,d)=>pa(q,gTor(r,t,4,D>1?14:10),col,...P(0,0,d),0,X?1.5708:0,0);
 ring(s*.36,s*.07,0xb89a3a,0);if(D)for(let i=0;i<8;i++){const a=i/8*6.2832;pBox(q,X?s*.03:s*.11,s*.11,X?s*.11:s*.03,0xb89a3a,...P(Math.cos(a)*s*.47,Math.sin(a)*s*.47,0),X?a:0,0,X?0:a)}
 pBox(q,X?s*.03:s*.62,s*.1,X?s*.62:s*.03,0x14140f,...P(0,-s*.04,s*.02));pBox(q,X?s*.035:s*.16,s*.16,X?s*.16:s*.035,0x14140f,...P(-s*.24,-s*.06,s*.02));
 for(const r of[0,.785])pBox(q,X?s*.03:s*.07,s*.07,X?s*.03:s*.07,0xe8e4d6,...P(0,s*.16,s*.025),X?r:0,0,X?0:r);pBox(q,X?s*.03:s*.03,s*.28,X?s*.03:s*.03,0xe8e4d6,...P(0,s*.16,s*.025));pBox(q,X?s*.03:s*.28,s*.03,X?s*.28:s*.03,0xe8e4d6,...P(0,s*.16,s*.025))}
/* máscara antigás negra con visores y filtro (espacio de la cabeza) */
function hgMask38(q,D){const M=VEYRN38.mask;pBox(q,.32,.28,.08,M,0,.15,.17,0,0,0,.03);pBox(q,.36,.16,.3,M,0,.1,.02);
 for(const s of[-1,1]){pCyl(q,.052,.052,.06,0x2a2a26,s*.075,.21,.215,1.5708,0,0,D?10:6);pCyl(q,.04,.04,.065,VEYRN38.lens,s*.075,.21,.22,1.5708,0,0,D?10:6);pBox(q,.03,.24,.03,M,s*.18,.22,-.02,0,0,s*.1)}
 pCyl(q,.05,.07,.12,M,0,.06,.25,1.2,0,0,D?10:6);pCyl(q,.075,.075,.1,0x3a3e38,0,.02,.31,1.2,0,0,D?10:6);if(D)for(let i=0;i<3;i++)pCyl(q,.078,.078,.012,0x1a1a18,0,.0+i*.03,.3+i*.012,1.2,0,0,D>1?10:6);
 if(D>1){pa(q,gTor(.06,.025,4,8,3.1416),0x1a1a1a,.0,-.06,.2,0,0,1.5708)}}
/* ---------- piezas por articulación (Volskaya 38) ---------- */
function digit12_38(q,x,y,z,s,col){/* «12» en placa (plano xz, sobre hombrera) */pBox(q,.012*s,.008,.07*s,col,x-.025*s,y,z);for(const [w,d,dx,dz] of[[.04,.012,.02,-.03],[.012,.03,.035,-.015],[.04,.012,.02,0],[.012,.03,.005,.015],[.04,.012,.02,.03]])pBox(q,w*s,.008,d*s,col,x+dx*s,y,z+dz*s)}
function partV38(kind,bone,L,D,q){const P=VOLSK38,C=L.coatC;
 if(bone==='hd'){if(L.hat==='m22')hgM22(q,D);else if(L.hat==='square')hgSquare38(q,L.capC||P.bg,D,kind==='r12off'?P.blue:undefined);else if(L.hat==='peak')hgPeak32(q,L.capC||P.bg,P.blue,'v',D);
  else if(L.hat==='leather')hgLeather38(q,P.blkH,D,false);else if(L.hat==='flight'){hgLeather38(q,0x4a301c,D,true);if(D)pBox(q,.36,.05,.12,P.fur,0,.03,-.1)}
  else if(L.hat==='frcap'){hgSquare38(q,L.tun,D,P.blk);gog38(q,.56,.18,D,.5);if(D)frBadge38(q,0,.47,.3,'z',.08,0)}
  if(L.hat==='m22'&&L.gog)gog38(q,.27,.29,D,-.2)}
 else if(bone==='ch'){const off=kind==='r12off';
  if(kind==='r12'||off){for(const s of[-1,1]){pBox(q,.14,.016,.32,off?P.brass:P.crim,s*.245,.725,0);pBox(q,.11,.022,.3,L.tun,s*.245,.732,0);if(D>1&&!off)digit12_38(q,s*.245,.745,-.03,1,P.white)}
   if(D)for(const s of[-1,1])pBox(q,.07,.05,.02,P.blue,s*.1,.7,.16),pBox(q,.075,.012,.022,P.crim,s*.1,.725,.16)}
  else if(kind==='frust'){for(const s of[-1,1])pBox(q,.13,.02,.3,0x14140f,s*.245,.73,0);if(!L.blk)coatTopL32(q,L.tun,D)}
  if(L.coat)coatTopL32(q,C,D,kind==='pilot'?P.fur:undefined);
  if(L.scarf)pBox(q,.37,.1,.35,L.scarfC,0,.74,0),pBox(q,.09,.26,.03,L.scarfC,.07,.56,.22,0,0,.12),kind==='pilot'&&pBox(q,.08,.3,.03,L.scarfC,-.12,.45,-.22,0,0,-.2);
  if(L.nco){pBox(q,.05,.8,.03,P.lea,.12,.32,.205,0,0,-.42);pBox(q,.05,.8,.03,P.lea,-.12,.32,-.205,0,0,-.42)}
  if(L.roll)bedrollL32(q,P.roll,D);
  if(kind==='r12'){if(L.pack)packL32(q,P.canvas,D,{tin:1,shovel:L.roll?0:1});pBox(q,.05,.6,.025,P.lea,-.1,.4,.215,0,0,.62)}
  if(kind==='frust'){if(L.blk){pBox(q,.68,.7,.41,P.blk,0,.35,0,0,0,0,.05);pBox(q,.42,.12,.42,P.blk,0,.73,-.02);for(const s of[-1,1])pBox(q,.14,.3,.03,P.blkH,s*.1,.52,.213,0,0,s*.32);for(let i=0;i<3;i++)pBox(q,.04,.04,.02,0x8a8a80,.13,.48-i*.14,.215)}
   pBox(q,.05,.8,.025,P.leaD,0,.35,.22,0,0,.68);pBox(q,.05,.8,.025,P.leaD,0,.35,-.22,0,0,-.68)}
  if(kind==='pilot'){pBox(q,.68,.7,.41,P.flight,0,.35,0,0,0,0,.05);pBox(q,.5,.14,.44,P.fur,0,.72,-.01);for(const s of[-1,1])pBox(q,.12,.3,.03,P.fur,s*.11,.56,.212,0,0,s*.35);pBox(q,.05,.62,.03,0x2a1c10,0,.36,.215)}
  if(off){pBox(q,.05,.36,.02,P.leaD,-.05,.48,.205,0,0,.5)}}
 else if(bone==='b'){const off=kind==='r12off';if(L.coat)pBox(q,.66,.24,.44,C,0,.03,0);else if(kind==='frust'&&L.blk)pBox(q,.62,.2,.44,P.blk,0,.06,0);else if(kind==='pilot')pBox(q,.66,.24,.44,P.flight,0,.03,0);else pBox(q,.58,.17,.4,L.tun,0,.05,0);
  pBox(q,.6,.07,.43,P.lea,0,.16,0);pBox(q,.08,.07,.02,P.brass,0,.16,.22);
  if(kind==='r12'){for(const s of[-1,1]){pBox(q,.15,.15,.1,P.lea,s*.15,.12,.23);pBox(q,.16,.03,.11,P.leaD,s*.15,.19,.23)}pBox(q,.07,.3,.05,0x3a2a1a,.3,-.06,-.1,.15);if(D)pa(q,gCyl(.09,.09,.06,D>1?10:6),0x6a6e58,-.24,-.02,-.27,1.5708,0,0,1,1,.6)}
  if(off){pBox(q,.04,.95,.035,0x2a2420,.32,-.35,-.06,-.35,0,.05);pBox(q,.06,.1,.06,P.brass,.32,.13,.1,-.35,0,.05);pa(q,gTor(.05,.012,4,6,3.1416),P.brass,.33,.16,.14,0,1.5708,0);pBox(q,.04,.28,.24,P.lea,-.33,-.06,.02,0,0,.05);pBox(q,.045,.06,.25,P.leaD,-.34,.06,.02,0,0,.05)}
  if(kind==='frust'){pBox(q,.26,.2,.12,0x3a2a18,-.3,-.02,-.05);pBox(q,.27,.04,.13,0x2a1c10,-.3,.08,-.05);if(D)pBox(q,.03,.16,.03,0x6a6a60,-.36,.12,-.05,0,0,.2);pBox(q,.1,.18,.1,P.leaD,.3,.04,.1)}
  if(kind==='pilot'){pBox(q,.1,.18,.1,0x2a1c10,.3,.02,.12);pBox(q,.11,.04,.11,0x1a1008,.3,.12,.12)}}
 else if(bone==='l1'||bone==='l2'){const s=bone==='l1'?-1:1;
  const coatLen=L.coat?(kind==='pilot'?.66:.62):kind==='pilot'?.5:kind==='frust'&&L.blk?.16:0;
  if(coatLen>0){const c=L.coat?C:kind==='pilot'?P.flight:P.blk,len=coatLen,cy=.05-len/2;pBox(q,.34,len,.03,c,-s*.01,cy,.172+(s>0?.004:0),-.07,0,0);pBox(q,.03,len,.36,shade(c,.95),s*.163,cy,0,0,0,s*.07);pBox(q,.33,Math.max(.1,len-.08),.03,shade(c,.92),-s*.01,cy+.04,-.18+(s>0?.004:0),.06,0,0)}
  else pBox(q,.32,.2,.34,L.pants,s*.012,-.16,0)}
 else if(bone==='k1'||bone==='k2'){if(L.boots){pBox(q,.27,.36,.3,L.bootC,0,-.21,0);pBox(q,.29,.035,.315,shade(L.bootC,.7),0,-.035,0)}else if(D>1)for(let i=0;i<3;i++)pBox(q,.27,.016,.29,shade(P.putt,.75),0,-.15-i*.05,0,0,0,.25*(i%2?1:-1))}
 else if(bone==='aL'){if(kind==='frust'&&D)frBadge38(q,.105,-.12,0,'x',.09,D);if(kind==='r12'&&D){pBox(q,.012,.1,.09,P.blue,.105,-.1,0);pBox(q,.014,.04,.05,P.white,.108,-.1,0)}}
 else if(bone==='eL'||bone==='eR'){if(L.gloves)pBox(q,.17,kind==='pilot'||kind==='frust'?.24:.17,.18,L.gloveC,0,kind==='pilot'||kind==='frust'?-.37:-.42,.01)}}
/* ---------- piezas Veyrn 38 ---------- */
function partE38(kind,bone,L,D,q){const P=VEYRN38,E=VEYRN32,C=L.coatC;
 if(bone==='hd'){if(kind==='storm'){hgHelmE32(q,D,E.helm,false);hgMask38(q,D)}
  else{if(L.hat==='steel'){hgHelmE32(q,D,0x3a3e44,false);gog38(q,.27,.29,D,-.2);if(D)pa(q,gCone(.04,.3,6),P.plume,.2,.5,-.1,-.5,0,-.4)}else{hgLeather38(q,P.kn,D,true);pBox(q,.03,.06,.36,P.armor,0,.47,-.02)}}}
 else if(bone==='ch'){for(const s of[-1,1]){pBox(q,.15,.014,.32,E.ochre,s*.245,.724,0);pBox(q,.12,.02,.3,shade(L.tun,.85),s*.245,.73,0)}
  if(kind==='storm'){if(L.coat)coatTopL32(q,C,D);bandolierL32(q,0x4a3420,D>1?7:5,false);bandolierL32(q,0x4a3420,D>1?7:5,true);
   for(let i=0;i<4;i++)pBox(q,.1,.14,.08,P.pouch,-.17+i*.115,.12,.245);pBox(q,.42,.4,.18,E.canvas,0,.38,-.3);pBox(q,.44,.07,.2,shade(E.canvas,.8),0,.58,-.3);if(D){pBox(q,.3,.18,.1,P.pouch,0,.2,-.42);pCyl(q,.08,.08,.5,0x4a4a40,0,.68,-.28,0,0,1.5708,D>1?8:6)}
   pa(q,gTor(.1,.016,4,8,3.1416),0x1a1a1a,0,.74,.16,0,0,3.1416)}
  else{/* caballero: chaqueta corta de vuelo, arnés, coraza opcional */pBox(q,.68,.7,.41,P.kn,0,.35,0,0,0,0,.05);pBox(q,.46,.12,.43,P.knP,0,.73,-.01);for(const s of[-1,1])pBox(q,.13,.28,.03,P.knP,s*.1,.54,.212,0,0,s*.35);
   for(const s of[-1,1]){pBox(q,.05,.86,.03,0x3a3020,0,.36,.235,0,0,s*.66);pBox(q,.05,.86,.03,0x3a3020,0,.36,-.235,0,0,s*.66)}pa(q,gTor(.05,.015,4,8),P.brass,0,.36,.25);
   if(L.arm){pBox(q,.6,.42,.08,P.armor,0,.42,.25,-.05,0,0,.03);pBox(q,.5,.12,.08,shade(P.armor,.9),0,.17,.26,.1,0,0);if(D)for(const s of[-1,1])for(const y of[.6,.28])pBox(q,.025,.025,.02,P.brass,s*.24,y,.295)}}}
 else if(bone==='b'){if(L.coat)pBox(q,.66,.24,.44,C,0,.03,0);else if(kind==='knight')pBox(q,.62,.2,.44,P.kn,0,.06,0);else pBox(q,.58,.17,.4,L.tun,0,.05,0);
  pBox(q,.6,.07,.43,E.web,0,.16,0);
  if(kind==='storm'){for(let i=0;i<5;i++)pBox(q,.12,.15,.09,P.pouch,-.26+i*.13,.08,.24);pCyl(q,.07,.07,.25,E.canister,.27,.0,-.2,0,0,0,D?10:6);for(let i=0;i<(D?3:1);i++){pCyl(q,.035,.035,.1,0x3a3e3a,-.3,.02,-.08+i*.08,0,0,0,6);pBox(q,.03,.2,.03,0x6a4a2a,-.3,-.1,-.08+i*.08)}}
  else{/* pistolera derecha y sable corto izquierdo */pBox(q,.08,.2,.14,0x1a1410,-.32,-.02,.06,0,0,.06);pBox(q,.05,.08,.1,0x2a2a2a,-.33,.1,.08);pBox(q,.035,.75,.035,0x1a1814,.32,-.26,-.06,-.32,0,.05);pBox(q,.05,.08,.05,P.brass,.32,.12,.08,-.32,0,.05);pa(q,gTor(.045,.012,4,6,3.1416),P.brass,.33,.15,.12,0,1.5708,0)}}
 else if(bone==='l1'||bone==='l2'){const s=bone==='l1'?-1:1,len=L.coat?.66:kind==='knight'?.28:0;if(len){const c=L.coat?C:P.kn,cy=.05-len/2;pBox(q,.34,len,.03,c,-s*.01,cy,.172+(s>0?.004:0),-.07,0,0);pBox(q,.03,len,.36,shade(c,.95),s*.163,cy,0,0,0,s*.07);pBox(q,.33,Math.max(.12,len-.08),.03,shade(c,.92),-s*.01,cy+.04,-.18+(s>0?.004:0),.06,0,0)}
  else pBox(q,.32,.2,.33,L.pants,s*.01,-.17,0);if(kind==='knight'&&L.arm&&D)pBox(q,.3,.2,.06,P.armor,-s*.0,-.18,.17,-.08,0,0)}
 else if(bone==='k1'||bone==='k2'){if(kind==='knight'){pBox(q,.27,.36,.3,0x0e0c0a,0,-.21,0);pBox(q,.29,.035,.315,0x060504,0,-.035,0);if(D)pBox(q,.02,.02,.1,0x8a8a8a,0,-.4,-.2)}}
 else if(bone==='aL'||bone==='aR'){if(kind==='knight'&&L.arm)pa(q,gSph(.16,D?8:6,4,0,1.45),P.armor,0,-.03,0,0,0,0,1,.75,1.1)}
 else if(bone==='eL'||bone==='eR'){pBox(q,.19,kind==='knight'?.26:.17,.2,kind==='knight'?0x14110e:0x24201a,0,kind==='knight'?-.36:-.42,.01)}}
/* ---------- looks ---------- */
const KN38={V:{r12:'Fusilero del 12.º',r12off:'Teniente del 12.º',frust:'Artillero FRUST',pilot:'Piloto'},E:{storm:'a un soldado de choque de Veyrn',knight:'a un caballero grifo de Veyrn'}};
function lookV38(kind,o){const P=VOLSK38,L={};const off=kind==='r12off';L.tun=kind==='frust'?P.fr:kind==='pilot'?0x5a5a4a:P.bg;L.pants=kind==='frust'?0x2e3238:kind==='pilot'?0x4a4038:P.breech;
 L.coat=o.coat!==undefined?!!o.coat:(kind==='r12'?R()<.5:off?R()<.35:false);L.coatC=P.coat;
 L.hat=o.hat||(kind==='r12'?pickL32([['m22',.6],['square',.3],['peak',.1]]):off?pickL32([['peak',.75],['square',.25]]):kind==='frust'?pickL32([['leather',.55],['frcap',.3],['m22',.15]]):'flight');
 L.gog=kind==='frust'&&L.hat==='m22';L.capC=P.bg;L.blk=kind==='frust'&&(o.blk!==undefined?!!o.blk:R()<.6);
 L.scarf=o.scarf!==undefined?!!o.scarf:(kind==='pilot'||(kind!=='r12off'&&R()<.55));L.scarfC=kind==='pilot'?0xe8e4da:pickL32([[P.scarf,.5],[0x5a5a56,.3],[0x6a4a3a,.2]]);
 L.nco=!off&&kind==='r12'&&(o.nco!==undefined?!!o.nco:R()<.2);L.roll=kind==='r12'&&(o.roll!==undefined?!!o.roll:R()<.55);L.pack=kind==='r12'&&!L.coat||R()<.3;
 L.boots=o.boots!==undefined?!!o.boots:(off||kind==='pilot'||L.nco||(kind==='frust'?R()<.6:R()<.2));L.bootC=kind==='frust'||kind==='pilot'?0x16120e:P.boot;
 L.gloves=kind!=='r12'||R()<.6;L.gloveC=kind==='frust'||kind==='pilot'?0x2a1a10:off?0x8a6a48:pickL32([[P.glove,.5],[0x4a4a44,.5]]);L.breeches=!L.coat;return L}
function lookE38(kind,o){const P=VEYRN38,E=VEYRN32,L={};L.tun=kind==='knight'?P.kn:E.tunicB;L.pants=kind==='knight'?0x2a2c30:E.pants;
 L.coat=kind==='storm'&&(o.coat!==undefined?!!o.coat:R()<.8);L.coatC=R()<.55?P.coatG:P.coatB;L.hat=o.hat||(kind==='knight'?(R()<.5?'steel':'flight'):'helm');L.arm=kind==='knight'&&(o.arm!==undefined?!!o.arm:R()<.5);return L}
/* ---------- reconstrucción ---------- */
const BN38=['hd','ch','b','l1','l2','k1','k2','aL','aR','eL','eR'];
function bake38(u,side,kind,L,D,fn){const lk=JSON.stringify(L);let tv=0;
 for(const bn of BN38){const j=u[bn];if(!j)continue;const geo=pqL32('38|'+side+'|'+kind+'|'+bn+'|'+D+'|'+lk,q=>fn(kind,bn,L,D,q));if(!geo)continue;tv+=geo.attributes.position.count;
  const m=j.children.find(c=>c.isMesh&&c.material===VCM&&!c.u27&&!c.u32);if(m){const old=m.geometry;m.geometry=catL32([old,geo]);old.dispose();m.u32=1}else{const mm=new T.Mesh(geo,VCM);mm.u32=1;j.add(mm)}}
 let all=0;for(const k of JL32)if(u[k])for(const c of u[k].children)if(c.isMesh&&c.geometry.attributes.position)all+=c.geometry.attributes.position.count;
 u.v32={side,kind,verts:tv,total:all};return tv}
function dressV38(t,kind,o){const P=VOLSK38,D=G.detail|0,L=lookV38(kind,o),skin=SK[R()*SK.length|0];const off=kind==='r12off';
 const coat=L.coat?L.coatC:kind==='frust'&&L.blk?P.blk:kind==='pilot'?P.flight:L.tun;
 const u=rebuildL32(t,{coat,pants:L.pants,hat:'none',tab:P.blue,trim:off?P.brass:P.brass,pack:false,officer:off,puttee:P.putt,leather:P.lea,glove:L.gloves?L.gloveC:undefined,face:o.face,rank:o.rank||(L.nco?2:0),skin,scale:o.scale});
 bake38(u,'V',kind,L,D,partV38);t.v32k='V:'+kind;t.v38=L;return t}
function dressE38(t,kind,o){const P=VEYRN38,E=VEYRN32,D=G.detail|0,L=lookE38(kind,o),skin=SK[R()*SK.length|0];
 const u=rebuildL32(t,{coat:L.coat?L.coatC:L.tun,pants:L.pants,hat:'none',tab:0x1a1a1a,trim:E.badge,pack:false,officer:false,puttee:kind==='knight'?0x0e0c0a:E.puttee,leather:E.web,glove:0x1a1612,face:kind==='storm'?0:(o.face!==undefined?o.face:R()*5|0),rank:o.rank||0,skin,scale:o.scale});
 bake38(u,'E',kind,L,D,partE38);
 if(t.hp!==undefined&&typeof enemies!=='undefined'&&enemies.indexOf(t)>=0){t.k8n=KN38.E[kind];if(!t.v38hp){t.v38hp=1;t.hp*=kind==='storm'?1.3:1.15;t.max=t.hp}}
 t.v32k='E:'+kind;t.v38=L;return t}
{const _v=volsk32;volsk32=function(t,kind,o){if(KN38.V[kind]){const u0=t&&t.g&&t.g.userData;if(!u0||!u0.ch||!u0.hd)return t;return dressV38(t,kind,o||{})}return _v.apply(this,arguments)}}
{const _e=veyrn32;veyrn32=function(t,kind,o){if(KN38.E[kind]){const u0=t&&t.g&&t.g.userData;if(!u0||!u0.ch||!u0.hd)return t;return dressE38(t,kind,o||{})}return _e.apply(this,arguments)}}
LIB32.volsk=volsk32;LIB32.veyrn=veyrn32;LIB32.kindsV=LIB32.kindsV.concat(Object.keys(KN38.V));LIB32.kindsE=LIB32.kindsE.concat(Object.keys(KN38.E));
/* jinete grifo sentado, independiente (para AIR38). Origen = asiento (base de la pelvis). */
function knight38(o){o=o||{};
 const g0=mkSoldier({coat:VEYRN38.kn,pants:0x2a2c30,hat:'none',pack:false,scale:o.scale||1}),t={g:g0};dressE38(t,'knight',o);
 const u=g0.userData;g0.children.forEach(c=>{if(c.geometry===shG)c.visible=false});
 const sp=o.spread===undefined?.38:o.spread;u.l1.rotation.set(-1.45,0,-sp);u.l2.rotation.set(-1.45,0,sp);u.k1.rotation.x=1.35;u.k2.rotation.x=1.35;
 u.aR.rotation.set(-.5,0,.12);u.aL.rotation.set(-.5,0,-.12);u.eR.rotation.x=-.7;u.eL.rotation.x=-.7;
 if(o.pistol!==false){const q=PB();pBox(q,.04,.1,.05,0x1a1a1a,0,-.03,0);pBox(q,.035,.04,.2,0x2a2a2a,0,.03,.08);pbMesh(q,u.mR).name='pistol38'}
 const r=new T.Group();r.name='rider38';g0.position.y=-.78*g0.scale.y;r.add(g0);r.userData=Object.assign({},u,{inner:g0,look:t.v38,verts:u.v32.total});return r}
/* =====================================================================
   BANDERAS — tela ondulada en el sombreador (sin costo de CPU)
   ===================================================================== */
const FLAG38={t:{value:0},tex:{},list:[]};
function flagTex38(kind){if(FLAG38.tex[kind])return FLAG38.tex[kind];const c=document.createElement('canvas'),W=c.width=256,H=c.height=kind==='rib'?32:192,x=c.getContext('2d');
 const star=(cx,cy,r,n,k,col)=>{x.fillStyle=col;x.beginPath();for(let i=0;i<n*2;i++){const a=i/(n*2)*6.2832-1.5708,rr=i%2?r*k:r;x.lineTo(cx+Math.cos(a)*rr,cy+Math.sin(a)*rr)}x.closePath();x.fill()};
 const wreath=(cx,cy,r,col)=>{x.fillStyle=col;for(const s of[-1,1])for(let i=0;i<9;i++){const a=1.5708+s*(.5+i*.27);x.save();x.translate(cx+Math.cos(a)*r,cy+Math.sin(a)*r);x.rotate(a+s*.9);x.beginPath();x.ellipse(0,0,r*.2,r*.08,0,0,6.2832);x.fill();x.restore()}};
 const gear=(cx,cy,r,col)=>{x.fillStyle=col;x.beginPath();for(let i=0;i<40;i++){const a=i/40*6.2832,rr=(i%5<2)?r*1.18:r;x.lineTo(cx+Math.cos(a)*rr,cy+Math.sin(a)*rr)}x.closePath();x.fill();x.fillStyle='#1c2a1a';x.beginPath();x.arc(cx,cy,r*.62,0,6.2832);x.fill()};
 if(kind==='volsk12'){x.fillStyle='#1c2648';x.fillRect(0,0,W,H);x.fillStyle='#2c6a3a';x.beginPath();x.moveTo(0,0);x.lineTo(W/2,H/2);x.lineTo(0,H);x.fill();x.beginPath();x.moveTo(W,0);x.lineTo(W/2,H/2);x.lineTo(W,H);x.fill();
  x.strokeStyle='#c8a848';x.lineWidth=40;x.beginPath();x.moveTo(0,0);x.lineTo(W,H);x.moveTo(W,0);x.lineTo(0,H);x.stroke();x.strokeStyle='#ece8dc';x.lineWidth=32;x.stroke();
  x.fillStyle='#c8a848';x.beginPath();x.arc(W/2,H/2,58,0,6.2832);x.fill();x.fillStyle='#ece8dc';x.beginPath();x.arc(W/2,H/2,53,0,6.2832);x.fill();wreath(W/2,H/2,44,'#2c6a3a');
  x.fillStyle='#8a1c26';x.beginPath();x.arc(W/2,H/2,30,0,6.2832);x.fill();star(W/2,H/2-2,25,8,.45,'#ece8dc');
  x.strokeStyle='#c8a848';x.lineWidth=4;x.beginPath();x.moveTo(W/2-22,H/2+22);x.lineTo(W/2+22,H/2-22);x.moveTo(W/2+22,H/2+22);x.lineTo(W/2-22,H/2-22);x.stroke();
  x.fillStyle='#c8a848';x.fillRect(W/2-14,H/2-74,28,10);for(let i=0;i<3;i++)x.fillRect(W/2-14+i*11,H/2-82,6,8);
  for(const [cx,cy] of[[26,22],[W-26,22],[26,H-22],[W-26,H-22]]){x.fillStyle='#8a1c26';x.beginPath();x.arc(cx,cy,17,0,6.2832);x.fill();x.strokeStyle='#c8a848';x.lineWidth=3;x.stroke();x.fillStyle='#ece8dc';x.font='bold 18px serif';x.textAlign='center';x.textBaseline='middle';x.fillText('12',cx,cy+1)}
  x.fillStyle='#c8a848';for(let i=0;i<W;i+=8){x.fillRect(i,0,5,4);x.fillRect(i,H-4,5,4)}for(let i=0;i<H;i+=8)x.fillRect(W-4,i,4,5)}
 else if(kind==='volsk'){const C=['#e6e2d6','#2c6a3a','#1c2648'];for(let i=0;i<3;i++){x.fillStyle=C[i];x.fillRect(0,i*H/3,W,H/3+1)}star(46,H/6+4,22,8,.45,'#c8a848');star(46,H/6+4,12,8,.45,'#8a1c26')}
 else if(kind==='frust'){x.clearRect(0,0,W,H);x.fillStyle='#2e3a28';x.beginPath();x.moveTo(0,0);x.lineTo(W,H*.3);x.lineTo(W*.82,H/2);x.lineTo(W,H*.7);x.lineTo(0,H);x.closePath();x.fill();
  x.fillStyle='#141410';x.beginPath();x.moveTo(0,H*.42);x.lineTo(W*.9,H*.47);x.lineTo(W*.9,H*.53);x.lineTo(0,H*.58);x.fill();x.fillStyle='#c8a848';x.fillRect(0,0,10,H);
  gear(70,H/2,36,'#c8a848');x.fillStyle='#141410';x.fillRect(38,H/2-5,74,10);x.fillRect(44,H/2-12,22,24);star(70,H/2-22,16,4,.3,'#ece8dc')}
 else if(kind==='veyrn'){x.fillStyle='#3a4048';x.fillRect(0,0,W,H);x.fillStyle='#b88a2a';x.fillRect(0,0,18,H);x.fillStyle='#14161a';x.fillRect(0,H*.08,W,10);x.fillRect(0,H*.92-10,W,10);
  const dm=(r,col)=>{x.fillStyle=col;x.beginPath();x.moveTo(W/2+10,H/2-r);x.lineTo(W/2+10+r,H/2);x.lineTo(W/2+10,H/2+r);x.lineTo(W/2+10-r,H/2);x.fill()};dm(70,'#e0ddd2');dm(52,'#101012');dm(16,'#a02020')}
 else if(kind==='rib'){const C=['#e6e2d6','#2c6a3a','#1c2648','#2c6a3a','#e6e2d6'];for(let i=0;i<5;i++){x.fillStyle=C[i];x.fillRect(0,i*H/5,W,H/5+1)}x.fillStyle='#c8a848';x.fillRect(W-20,0,20,H)}
 const t=new T.CanvasTexture(c);t.anisotropy=2;return FLAG38.tex[kind]=t}
function flagMat38(kind,len,amp){const m=new T.MeshLambertMaterial({map:flagTex38(kind),side:T.DoubleSide,alphaTest:kind==='frust'?.5:0,transparent:false});
 const U={uL:{value:len},uA:{value:amp},uS:{value:R()*6}};m.userData.U=U;
 m.onBeforeCompile=sh=>{sh.uniforms.uT38=FLAG38.t;Object.assign(sh.uniforms,U);
  sh.vertexShader='uniform float uT38,uL,uA,uS;\nfloat wv38(vec3 p){float f=clamp(p.x/uL,0.,1.);return (sin(p.x*5.2/uL*3.1416-uT38*4.6+uS+p.y*1.3)*.75+sin(p.x*11./uL-uT38*7.3+uS*1.7)*.25)*uA*(.18+f);}\n'+sh.vertexShader
   .replace('#include <beginnormal_vertex>','#include <beginnormal_vertex>\n{float e=.02*uL;float d=(wv38(position+vec3(e,0.,0.))-wv38(position))/e;objectNormal=normalize(vec3(-d,0.,1.));}')
   .replace('#include <begin_vertex>','#include <begin_vertex>\ntransformed.z+=wv38(position);transformed.y-=pow(clamp(position.x/uL,0.,1.),2.)*uA*.6;');};
 m.customProgramCacheKey=()=>'flag38';return m}
/* flag38(kind,o): o={w,h,pole:true,poleH,amp(0..1 ondulado),seg} → Group; la tela en userData.cloth */
function flag38(kind,o){o=o||{};kind=kind||'volsk12';const D=G.detail|0,w=o.w||(kind==='frust'?1.2:kind==='volsk12'?1.5:1.6),h=o.h||(kind==='frust'?.8:kind==='volsk12'?1.25:1.05),
 ph=o.poleH||(kind==='frust'?2.6:kind==='volsk12'?3.0:5),amp=(o.amp===undefined?1:o.amp)*h*.16,sx=o.seg||(D>1?24:D?16:10);
 const g=new T.Group();g.name='flag38';const gk='fl38|'+w+'|'+h+'|'+sx;
 const geo=gkL32(gk,()=>{const p=new T.PlaneGeometry(w,h,sx,Math.max(2,sx>>2));p.translate(w/2,0,0);return p});
 const cl=new T.Mesh(geo,flagMat38(kind,w,amp));cl.position.set(.04,ph-h/2-(kind==='volsk12'?.32:.05),0);cl.name='cloth';g.add(cl);
 cl.onBeforeRender=()=>{FLAG38.t.value=performance.now()*.001};
 if(o.pole!==false){const q=PB();pCyl(q,.035,.045,ph,kind==='veyrn'?0x2a2a2a:0x5a3a22,0,ph/2,0,0,0,0,D?8:6);
  if(kind==='volsk12'){pa(q,gCone(.06,.26,D?8:4),0xc8a848,0,ph+.13,0);pBox(q,.3,.03,.03,0xc8a848,0,ph-.05,0);pa(q,gSph(.05,8,5),0xc8a848,0,ph-.05,0);pBox(q,.03,.03,w+.1,0xc8a848,0,ph-.3,0,0,1.5708,0)}
  else pa(q,gSph(.06,8,5),0xc8a848,0,ph+.03,0);pbMesh(q,g).name='pole'}
 if(kind==='volsk12'){for(const s of[0,1]){const rg=gkL32('rb38|'+sx,()=>{const p=new T.PlaneGeometry(1.1,.09,Math.max(6,sx>>1),1);p.translate(.55,0,0);return p});
   const rb=new T.Mesh(rg,flagMat38('rib',1.1,.06));rb.position.set(-.02+s*.05,ph-.1,.02*s);rb.rotation.z=-1.5708+(s?.12:-.05);rb.rotation.y=s?.4:-.3;rb.onBeforeRender=cl.onBeforeRender;g.add(rb)}}
 g.userData={cloth:cl,kind,setWind:k=>{cl.material.userData.U.uA.value=k*h*.16}};FLAG38.list.push(g);return g}
/* =====================================================================
   VEHÍCULOS FRUST (2.º Grupo de Artillería Mecanizada) — registrados en VEH32
   ===================================================================== */
const FRC38={a:0x58624a,b:0x454d3a,c:0x6a7458,dk:0x161614,mt:0x2a2c26,wd:0x6a5236,cv:0x8a866a};
const frCRW38={};
/* dotación FRUST: chaqueta de cuero negro, casco de cuero con gafas (poses: sit drv kneel stand bino carry) */
function frCrewGeo38(pose){if(frCRW38[pose])return frCRW38[pose];const q=PB(),coat=0x1c1a18,pant=0x2e3238,bt=0x120e0a,sk=0xc8986a,lea=0x4a2c18;
 const head=(y,z)=>{pBox(q,.2,.24,.22,sk,0,y,z);pa(q,gSph(.15,8,5,0,1.6),0x2c2826,0,y+.05,z,0,0,0,1.02,.95,1.1);pBox(q,.24,.04,.04,0x8a7a4a,0,y+.15,z+.12)};
 if(pose==='sit'||pose==='drv'){pBox(q,.44,.56,.28,coat,0,.68,0);pBox(q,.46,.07,.3,lea,0,.46,0);for(const s of[-1,1]){pBox(q,.16,.16,.5,pant,s*.12,.38,.2);pBox(q,.15,.44,.15,bt,s*.12,.18,.42);pBox(q,.12,.42,.12,coat,s*.27,.68,.14,pose==='drv'?-.9:-.3)}head(1.1,0)}
 else if(pose==='kneel'){pBox(q,.44,.56,.28,coat,0,.86,.05,.15);pBox(q,.46,.07,.3,lea,0,.62,0);pBox(q,.16,.46,.16,pant,-.12,.24,.3);pBox(q,.16,.16,.46,pant,-.12,.5,.1);pBox(q,.16,.44,.16,pant,.12,.16,-.2,1.4);pBox(q,.16,.16,.4,pant,.12,.42,0);pBox(q,.15,.1,.26,bt,-.12,.04,.36);
  for(const s of[-1,1])pBox(q,.12,.46,.12,coat,s*.27,.84,.22,-1.1);head(1.28,.1)}
 else{pBox(q,.44,.6,.28,coat,0,1.18,0);pBox(q,.46,.07,.3,lea,0,.9,0);for(const s of[-1,1]){pBox(q,.16,.5,.17,pant,s*.12,.62,0);pBox(q,.17,.42,.19,bt,s*.12,.21,0);pBox(q,.12,.56,.12,coat,s*.29,1.15,pose==='bino'?.18:0,pose==='bino'?-1.3:pose==='carry'?-.7:0,0,0)}
  if(pose==='bino')pBox(q,.18,.08,.14,0x111111,0,1.52,.3);if(pose==='carry')pCyl(q,.07,.07,.55,0xb08a3a,0,1.05,.3,1.5708,0,0,8);head(1.6,0)}
 return frCRW38[pose]=pbGeo(q)}
function frCrew38(par,side,pose,x,y,z,ry,name){let m;if(side==='volsk'){m=new T.Mesh(frCrewGeo38(pose),VCM);m.position.set(x,y,z);m.rotation.y=ry||0;par.add(m)}else m=vhCrew32(par,side,pose==='stand'?'carry':pose,x,y,z,ry);m.name=name||'crew';return m}
/* tren de rodaje de orugas genérico (z: -L..L) */
function frTracks38(g,q,side,X,L,C){const D=vhDet32(),tk=vhVC32[side].tk,W=[];
 const pts=[[.06,-L+.1],[.06,L-.4],[.36,L+.05],[.72,L+.05],[.8,L-.3],[.8,-L+.25],[.5,-L-.05],[.2,-L],[.06,-L+.1]];for(const s of[-1,1])vhTrackRun32(g,s*X,.36,pts,'trk');
 const rg=vhRoad32(.2,tk),n=D?5:4;for(const s of[-1,1]){for(let i=0;i<n;i++)vhWheel32(g,rg,s*X,.24,-L+.55+i*(2*L-1.2)/(n-1),.2,W);vhWheel32(g,vhWSpoke32(.36,.3,8,0x1e1e1c,C.b,shade(C.b,.8)),s*X,.48,L-.15,.36,W);vhWheel32(g,sprocketGeo(tk),s*X,.46,-L+.12,.32,W).scale.setScalar(.7);
  pBox(q,.46,.05,2*L+.5,C.b,s*X,.86,0);if(D)for(let i=0;i<3;i++)pBox(q,.06,.06,.06,0x1a1a18,s*X,.9,-L+.5+i*L*.8)}}
/* --- tractor de artillería F-7 «Buey» (orugas, cabina abierta con toldo, 6 asientos, cabrestante y gancho) --- */
function frTplTractor38(side){const C=side==='volsk'?FRC38:vhVC32.veyrn,A=C.a,B=C.b,DK=0x161614,D=vhDet32(),g=new T.Group(),q=PB();
 frTracks38(g,q,side,.84,2.1,{b:B});pBox(q,1.24,.5,4.2,B,0,.66,0);
 pBox(q,1.12,.62,1.35,A,0,1.18,1.42);pBox(q,1.14,.06,1.37,shade(A,.85),0,1.5,1.42);pBox(q,1.04,.74,.08,DK,0,1.18,2.12);if(D)for(let i=0;i<7;i++)pBox(q,.04,.66,.05,0x3a3a34,-.42+i*.14,1.18,2.17);
 for(const s of[-1,1]){if(D)for(let i=0;i<5;i++)pBox(q,.03,.3,.06,DK,s*.57,1.2,1.0+i*.2);}pCyl(q,.05,.05,.12,0x8a8a7a,0,1.58,1.95);pCyl(q,.06,.06,.7,0x2a2420,.45,1.7,.95,0,0,0,6);
 /* cabina y bancos */pBox(q,1.9,.08,3.0,0x3a3428,0,.95,-.75);pBox(q,1.8,.55,.06,A,0,1.22,.74);pa(q,gTor(.17,.025,4,10),0x1a1410,-.35,1.55,.55,-.9,0,0);pCyl(q,.025,.025,.5,0x1a1410,-.35,1.4,.62,-.6,0,0,5);
 for(const s of[-1,1])pBox(q,.05,.42,3.0,A,s*.95,1.18,-.75);pBox(q,1.9,.42,.05,A,0,1.18,-2.25);
 for(const z of[.25,-.65,-1.55]){pBox(q,1.7,.1,.45,FRC38.wd,0,1.32,z);pBox(q,1.7,.4,.06,FRC38.wd,0,1.58,z-.24)}
 /* toldo de lona sobre arcos */for(const z of[.65,-.75,-2.15]){for(const s of[-1,1])pBox(q,.05,1.15,.05,0x2a2a24,s*.92,1.95,z);}pBox(q,1.98,.05,3.0,FRC38.cv,0,2.54,-.75,.0);for(const s of[-1,1])pBox(q,.04,.25,3.0,FRC38.cv,s*.98,2.42,-.75);
 /* cabrestante, gancho, cajas de herramientas */pCyl(q,.2,.2,1.0,0x3a3c36,0,.95,-2.35,0,0,1.5708,D?12:8);pBox(q,.25,.2,.3,0x2a2a26,0,.72,-2.38);pa(q,gTor(.08,.025,4,8),0x2a2a26,0,.72,-2.55,0,1.5708,0);
 if(D)for(const s of[-1,1])pBox(q,.4,.3,.6,shade(A,.9),s*.62,1.08,-2.0);
 for(const s of[-1,1]){vhMark32(q,s*.57,1.2,1.4,'x',.3,side);if(side==='volsk')frBadge38(q,s*.98,1.22,-1.4,'x',.32,D)}if(side==='volsk')frBadge38(q,0,1.25,-2.28,'z',.22,D);
 pbMesh(q,g,VCV);const hk=new T.Object3D();hk.name='hitch';hk.position.set(0,.72,-2.6);g.add(hk);
 frCrew38(g,side,'drv',-.35,.95,.25,0);for(const [x,z] of[[.4,.25],[-.5,-.65],[.0,-.65],[.5,-.65],[-.4,-1.55],[.4,-1.55]])frCrew38(g,side,'sit',x,.95,z,0,'pax');
 return{g,spec:{type:'truck',name:'el tractor de artillería F-7',hp:620,armB:.45,armX:1.1,vmax:4.6,turn:.5,acc:1,hw:1.08,hd:2.3,h:2.6,cz:0,zf:2.2,zb:-2.6,mounts:[]}}}
/* --- cañón autopropulsado F-9 «Martillo» (casamata abierta, cañón de 76 mm, sector de tiro limitado) --- */
function frTplSPG38(side){const C=side==='volsk'?FRC38:vhVC32.veyrn,A=C.a,B=C.b,Cc=C.c,DK=0x161614,D=vhDet32(),g=new T.Group(),q=PB();
 frTracks38(g,q,side,.86,2.25,{b:B});pBox(q,1.3,.62,4.4,A,0,.95,-.05);pBox(q,1.3,.1,.9,shade(A,.9),0,1.18,2.15,.5);pBox(q,1.3,.55,.08,A,0,.85,2.3,-.5);
 /* motor trasero con rejillas */pBox(q,1.3,.3,1.6,shade(A,.95),0,1.4,-1.35);if(D)for(let i=0;i<7;i++)pBox(q,1.0,.03,.07,DK,0,1.56,-.8-i*.18);pCyl(q,.09,.09,.7,0x2a2420,-.6,1.4,-2.3,1.5708,0,0,8);
 /* casamata abierta (laterales fijos) */for(const s of[-1,1]){pBox(q,.06,.75,1.9,Cc,s*.66,1.62,.6,0,0,s*-.12);vhRiv32(q,s*.7,1.9,-.3,s*.7,1.9,1.5,8,shade(Cc,.6))}pBox(q,1.3,.55,.06,Cc,0,1.55,-.38);
 if(D){for(const s of[-1,1])pBox(q,.3,.35,.5,0x4a4a2e,s*.4,1.43,-.15);for(let i=0;i<4;i++)pCyl(q,.05,.05,.45,0xb08a3a,-.5+i*.1,1.5,-.15,0,0,0,6)}
 for(const s of[-1,1]){vhMark32(q,s*.66,1.1,-.9,'x',.32,side);if(side==='volsk')frBadge38(q,s*.69,1.55,.9,'x',.28,D)}
 pbMesh(q,g,VCV);
 const M=vhMount32(g,'0',0,1.25,.95),tq=PB();pBox(tq,1.15,.75,.07,Cc,0,.55,.42,-.18);pBox(tq,.9,.25,.06,shade(Cc,.9),0,1.0,.33,-.5);pBox(tq,.3,.3,.7,shade(Cc,.8),0,.32,0);pbMesh(tq,M.y);
 M.p.position.set(0,.5,.1);const gq=PB();pCyl(gq,.06,.075,2.6,0x2c2e2c,0,0,1.25,1.5708,0,0,10);pCyl(gq,.085,.085,.14,0x2c2e2c,0,0,2.5,1.5708,0,0,10);pCyl(gq,.1,.1,1.0,shade(Cc,.7),0,-.12,.3,1.5708,0,0,8);pBox(gq,.26,.26,.45,0x2a2a28,0,0,-.35);pbMesh(gq,M.p);M.m.position.set(0,0,2.6);
 frCrew38(M.y,side,'stand',-.38,-.28,-.45,0,'crw');frCrew38(g,side,'stand',.35,.97,-.05,-.3,'crw');frCrew38(g,side,'bino',-.3,.97,-.15,.2,'crw');
 return{g,spec:{type:'tank',name:'el cañón autopropulsado Martillo',hp:950,armB:.12,armX:.6,vmax:4,turn:.45,acc:.9,hw:1.08,hd:2.4,h:2.4,cz:0,zf:2.6,zb:-2.6,
  mounts:[{n:'0',kind:'gun',cal:1.1,rng:320,yr:.4,arc:.32,cd:7.5,dmg:110,r:5.5,vs:'both'}]}}}
/* --- camión de municiones (caja abierta con cajones y vainas) --- */
function frTplAmmo38(side){const C=side==='volsk'?FRC38:vhVC32.veyrn,A=C.a,MT=0x262622,D=vhDet32(),g=new T.Group(),q=PB(),W=[],WD=FRC38.wd;
 for(const s of[-1,1])pBox(q,.14,.22,5.6,MT,s*.5,.8,-.2);pBox(q,1.0,.8,1.3,A,0,1.35,2.15);pBox(q,1.0,1.0,.12,shade(A,.85),0,1.35,2.85);if(D)for(let i=0;i<7;i++)pBox(q,.03,.85,.04,0x1a1a16,-.36+i*.12,1.35,2.92);
 for(const s of[-1,1])pBox(q,.36,.05,1.2,shade(A,.8),s*.82,.92,2.1);
 /* cabina cerrada */pBox(q,1.9,1.2,1.2,A,0,1.6,.95);pBox(q,1.92,.06,1.3,shade(A,.85),0,2.24,.95);pBox(q,1.6,.4,.04,0x1c2224,0,1.95,1.56);for(const s of[-1,1])pBox(q,.04,.4,.6,0x1c2224,s*.96,1.95,1.0);
 const BZ=-1.5,BL=3.6,FY=1.0;pBox(q,2.1,.12,BL,WD,0,FY,BZ);for(const s of[-1,1])pBox(q,.06,.5,BL,WD,s*1.05,FY+.3,BZ);pBox(q,2.1,.5,.06,WD,0,FY+.3,BZ-BL/2);pBox(q,2.1,.5,.06,WD,0,FY+.3,BZ+BL/2);
 for(let i=0;i<(D?10:6);i++){const r=i%2,c=(i>>1);pBox(q,.85,.36,.5,i%3?0x5a5a38:0x4e4e30,-.48+r*.96,FY+.25+(c%2)*.37,BZ+1.4-(c>>1)*.9-(c%2)*.2);if(D>1)pBox(q,.87,.04,.12,0x2a2a22,-.48+r*.96,FY+.25+(c%2)*.37,BZ+1.4-(c>>1)*.9-(c%2)*.2)}
 for(let i=0;i<(D?6:3);i++)pCyl(q,.07,.07,.5,0xb08a3a,-.7+i*.28,FY+.3,BZ-1.3,0,0,0,6);
 pCyl(q,.16,.16,2.0,FRC38.cv,0,FY+.62,BZ+BL/2-.25,0,0,1.5708,D?8:6);
 for(const s of[-1,1]){vhMark32(q,s*1.09,FY+.3,BZ,'x',.4,side);if(side==='volsk')frBadge38(q,s*.96,1.6,.85,'x',.28,D)}
 pbMesh(q,g,VCV);const wf=vhWSpoke32(.5,.16,10,0x141412,shade(A,.85),shade(A,.7));for(const s of[-1,1]){vhWheel32(g,wf,s*.9,.5,2.1,.5,W,true);vhWheel32(g,wf,s*.82,.5,-1.6,.5,W);vhWheel32(g,wf,s*1.0,.5,-1.6,.5,W)}
 frCrew38(g,side,'drv',.4,.75,.9,0);
 return{g,spec:{type:'truck',name:'el camión de municiones',hp:300,armB:.5,armX:1.3,vmax:9,turn:.6,acc:2,wb:3.7,hw:1.12,hd:3.1,h:2.4,cz:-.1,zf:3.0,zb:-3.35,mounts:[]}}}
/* --- coche de observación y radio con mástil telescópico --- */
function frTplObs38(side){const C=side==='volsk'?FRC38:vhVC32.veyrn,A=C.a,MT=0x262622,D=vhDet32(),g=new T.Group(),q=PB(),W=[];
 for(const s of[-1,1])pBox(q,.12,.18,4.0,MT,s*.45,.6,0);pBox(q,.9,.6,1.4,A,0,1.05,1.3);pCyl(q,.45,.45,1.4,A,0,1.33,1.3,1.5708,0,0,D?10:6);pBox(q,.9,.8,.1,0x1a1a16,0,1.05,2.02);
 for(const s of[-1,1]){pa(q,new T.CylinderGeometry(.6,.6,.36,8,1,true,0,3.1416),shade(A,.85),s*.78,.62,1.4,0,1.5708,1.5708,1,1,1,.05);pa(q,new T.CylinderGeometry(.6,.6,.36,8,1,true,0,3.1416),shade(A,.85),s*.78,.62,-1.3,0,1.5708,1.5708,1,1,1,.05);pBox(q,.36,.05,1.2,shade(A,.8),s*.78,.72,.05)}
 pBox(q,1.7,.55,2.6,A,0,1.1,-.6);pBox(q,1.6,.1,2.4,0x3a2a1a,0,1.32,-.6);pBox(q,1.4,.3,.04,0x1c2224,0,1.65,.62,-.2);for(const z of[.1,-1.0])pBox(q,1.5,.4,.12,0x3a2a1a,0,1.55,z);
 pBox(q,.7,.5,.5,0x3a3e34,.35,1.62,-1.6);if(D){for(let i=0;i<3;i++)pCyl(q,.04,.04,.02,0xc8c0a0,.2+i*.12,1.72,-1.34,1.5708,0,0,6);pBox(q,.3,.12,.02,0x1a1a18,.4,1.55,-1.34)}
 pBox(q,1.6,.25,.5,FRC38.cv,0,1.45,-1.95);pCyl(q,.35,.35,.2,0x141412,0,1.3,-2.05,0,0,1.5708,8);
 for(const s of[-1,1]){vhMark32(q,s*.86,1.1,-.6,'x',.3,side);if(side==='volsk')frBadge38(q,s*.86,1.15,.9,'x',.2,D)}
 pbMesh(q,g,VCV);const wf=vhWSpoke32(.42,.14,10,0x141412,shade(A,.85),shade(A,.7));for(const s of[-1,1]){vhWheel32(g,wf,s*.78,.42,1.4,.42,W,true);vhWheel32(g,wf,s*.78,.42,-1.3,.42,W)}
 /* mástil: 3 tramos telescópicos */const ms=new T.Group();ms.name='mast38';ms.position.set(-.5,1.4,-1.7);g.add(ms);let par=ms;const segs=[];
 for(let i=0;i<3;i++){const s=new T.Group();s.position.y=i?0:0;par.add(s);const mq=PB();pCyl(mq,.06-i*.015,.06-i*.015,1.9,0x3a3c36,0,.95,0,0,0,0,6);if(i===2){pBox(mq,1.2,.04,.04,0x2a2a26,0,1.9,0);pBox(mq,.04,.04,1.2,0x2a2a26,0,1.9,0);pCyl(mq,.01,.01,.9,0x8a8a80,0,2.35,0,0,0,0,4)}pbMesh(mq,s);segs.push(s);par=s}
 frCrew38(g,side,'drv',.4,.95,.25,0);frCrew38(g,side,'bino',-.4,.92,-.95,0);frCrew38(g,side,'sit',.35,.92,-1.05,Math.PI,'crew');
 return{g,spec:{type:'car',name:'el coche de observación',hp:260,armB:.6,armX:1.3,vmax:10,turn:.6,acc:2.4,wb:2.7,hw:.98,hd:2.1,h:2,cz:0,zf:2.1,zb:-2.3,mounts:[]}}}
/* --- obús de campaña de 105 mm con mástil partido (dotación FRUST, enganche al tractor) --- */
function frTplHow38(side){const C=side==='volsk'?FRC38:vhVC32.veyrn,A=side==='volsk'?0x5a624c:0x50555a,WD=FRC38.wd,D=vhDet32(),g=new T.Group(),W=[],q=PB();
 pCyl(q,.07,.07,1.75,0x2a2a26,0,.62,0,0,0,1.5708,8);pBox(q,.5,.3,.6,shade(A,.85),0,.72,-.1);pbMesh(q,g);
 const wg=vhWSpoke32(.62,.12,12,0x2a2a26,WD,WD);for(const s of[-1,1])vhWheel32(g,wg,s*.86,.62,0,.62,W);
 for(const s of[-1,1]){const tr=new T.Group();tr.name=s>0?'trL':'trR';tr.position.set(s*.18,.6,-.3);g.add(tr);const t=PB();pBox(t,.16,.22,3.0,shade(A,.9),-s*.09,-.18,-1.5,-.12,-s*.06,0);
  pBox(t,.5,.4,.06,shade(A,.75),-s*.18,-.45,-2.95,.3,0,0);if(D)pBox(t,.04,.04,.9,WD,-s*.15,-.15,-2.4,-.12,0,0);if(s>0)pa(t,gTor(.08,.025,4,8),0x2a2a26,-.18,-.3,-3.12,0,1.5708,0);pbMesh(t,tr)}
 const M=vhMount32(g,'0',0,0,0),uq=PB();pBox(uq,1.7,1.0,.05,A,0,1.25,.32,-.08);pBox(uq,1.4,.35,.05,A,0,.45,.36);pBox(uq,1.2,.28,.05,shade(A,.9),0,1.86,.27,-.35);pBox(uq,.12,.12,.06,0x101010,-.3,1.35,.34);pBox(uq,.36,.3,.7,shade(A,.8),0,.85,-.05);
 if(D)vhRiv32(uq,-.8,1.7,.33,.8,1.7,.33,10,shade(A,.6));vhMark32(uq,.35,1.3,.36,'z',.22,side);if(side==='volsk')frBadge38(uq,-.45,1.3,.36,'z',.18,D);pbMesh(uq,M.y);
 M.p.position.set(0,1.08,.0);const gq=PB();pCyl(gq,.09,.105,2.1,0x2c2e2c,0,0,.75,1.5708,0,0,12);pCyl(gq,.12,.12,.16,0x2c2e2c,0,0,1.78,1.5708,0,0,12);pCyl(gq,.075,.075,1.4,shade(A,.75),0,.2,.3,1.5708,0,0,8);pBox(gq,.3,.3,.45,0x2a2a28,0,0,-.42);pBox(gq,.06,.16,.18,0x222222,-.2,.14,-.1);pbMesh(gq,M.p);M.m.position.set(0,0,1.86);
 const am=PB();for(let i=0;i<3;i++)pBox(am,.6,.32,.42,0x4e4e30,1.4,.16+(i===2?.32:0),-1.6-(i%2)*.5);for(let i=0;i<4;i++)pCyl(am,.065,.065,.5,0xb08a3a,1.0+i*.14,.25,-2.4,0,0,1.5708,6);const amm=pbMesh(am,g);amm.name='amm38';
 frCrew38(M.y,side,'kneel',-.55,0,-.7,0);frCrew38(M.y,side,'kneel',.55,0,-.95,.2);frCrew38(M.y,side,'carry',1.1,0,-2.0,-.6);frCrew38(M.y,side,'bino',-1.5,0,-1.8,.3);
 return{g,spec:{type:'gun',name:'el obús de campaña',hp:560,armB:.15,armX:1,crewHp:280,hw:1.0,hd:1.7,h:1.9,cz:-.8,zf:2.0,zb:-3.3,
  mounts:[{n:'0',kind:'gun',cal:1.25,rng:380,yr:.25,arc:.45,cd:9,dmg:120,r:6.5,vs:'both'}]}}}
function tractor38(side){return vhInst32('tractor38',vhSide32(side===undefined?'volsk':side),frTplTractor38)}
function spg38(side){return vhInst32('spg38',vhSide32(side===undefined?'volsk':side),frTplSPG38)}
function ammoTruck38(side){return vhInst32('ammotruck38',vhSide32(side===undefined?'volsk':side),frTplAmmo38)}
function obsCar38(side){const v=vhInst32('obscar38',vhSide32(side===undefined?'volsk':side),frTplObs38);v.mast=v.g.getObjectByName('mast38');v.mastK=0;v.mastT=0;return v}
function howitzer38(side){const v=vhInst32('howitzer38',vhSide32(side===undefined?'volsk':side),frTplHow38);v.trL=v.g.getObjectByName('trL');v.trR=v.g.getObjectByName('trR');v.amm=v.g.getObjectByName('amm38');v.h38={st:'ready',t:0,open:1};frTrail38(v,1);return v}
Object.assign(VEH32.cls,{
 tractor:{speed:3.4,road:4.6,acc:.8,brake:2.2,turn:.45,wheeled:false,armor:'light',detect:90,attack:0,standoff:0,tactics:'transport',retreat:0,smoke:0,cover:12},
 spg:{speed:2.8,road:3.8,acc:.6,brake:1.8,turn:.42,wheeled:false,armor:'light',detect:240,attack:280,standoff:90,tactics:'assault',retreat:.4,smoke:1,cover:16},
 obs:{speed:6,road:9,acc:1.6,brake:3.6,turn:.55,steer:.6,wheeled:true,armor:'none',detect:220,attack:0,standoff:0,tactics:'transport',retreat:0,smoke:0,cover:12},
 howitzer:{speed:0,acc:0,turn:0,armor:'shield',detect:380,attack:380,tactics:'static'}});
Object.assign(VEH32.clsOf,{tractor38:'tractor',spg38:'spg',ammotruck38:'truck',obscar38:'obs',howitzer38:'howitzer'});
/* ---------- remolque, emplazamiento y enganche ---------- */
function frTrail38(v,k){v.h38.open=k;if(v.trL)v.trL.rotation.y=-k*.48;if(v.trR)v.trR.rotation.y=k*.48}
function frShow38(list,on){for(const c of list)c.visible=on}
function frPax38(tr,on){tr.g.traverse(o=>{if(o.name==='pax')o.visible=on&&tr.alive})}
function frHitch38(tr,o){tr.g.updateMatrixWorld(true);const h=tr.g.getObjectByName('hitch');return h?h.getWorldPosition(o):o.copy(tr.g.position)}
const fr_v38=new T.Vector3();
/* tow38(tractor,gun): engancha (la pieza se cierra, la dotación sube al tractor). Acercar el gancho a < ~4 m antes. */
function tow38(tr,gun){if(!tr||!gun||!gun.h38)return null;if(gun.tow&&gun.tow!==tr)gun.tow.towing=null;gun.tow=tr;tr.towing=gun;Object.assign(gun.h38,{st:'towed',t:0});gun.fire=false;
 for(const m of gun.mounts){m.tele=0;m.burst=0;m.yaw=0;m.y.rotation.y=m.base;if(m.gl)m.gl.visible=false}frTrail38(gun,0);frShow38(gun.crew,false);if(gun.amm)gun.amm.visible=false;frPax38(tr,true);
 if(gun.ob){const i=obstB.indexOf(gun.ob);if(i>=0)obstB.splice(i,1);gun.ob38=gun.ob;gun.ob=null}frTowUpd38(gun,0,true);return gun}
/* unlimber38(gun,{face:yaw|at:[x,z], fire:true, crew:true, onDone}) */
function unlimber38(gun,o){if(!gun||!gun.h38)return;o=o||{};const tr=gun.tow;if(tr)tr.towing=null;gun.tow=null;let face=o.face;
 if(o.at)face=Math.atan2(VEH32.X+o.at[0]-gun.g.position.x,o.at[1]-gun.g.position.z);if(face===undefined)face=gun.g.rotation.y;
 Object.assign(gun.h38,{st:'drop',t:0,face,o,tr});if(tr)frPax38(tr,false);if(o.crew!==false)frShow38(gun.crew,true)}
/* limber38(gun,tractor): cierra los mástiles y engancha */
function limber38(gun,tr){if(!gun||!gun.h38)return;gun.fire=false;for(const m of gun.mounts){m.tele=0;m.burst=0}Object.assign(gun.h38,{st:'close',t:0,tr})}
function frTowUpd38(gun,dt,snap){const tr=gun.tow,g=gun.g,p=g.position;if(!tr||!tr.alive){if(tr&&!tr.alive){gun.tow=null;tr.towing=null;Object.assign(gun.h38,{st:'drop',t:0,face:g.rotation.y,o:{fire:false,crew:false}})}return}
 const H=frHitch38(tr,fr_v38),L=3.35;let dx=p.x-H.x,dz=p.z-H.z;const d=Math.hypot(dx,dz)||1;if(snap&&d<.5){dx=-Math.sin(tr.g.rotation.y);dz=-Math.cos(tr.g.rotation.y)}else{dx/=d;dz/=d}
 p.x=H.x+dx*L;p.z=H.z+dz*L;p.y=vhFlo32(p.x,p.z);g.rotation.y=Math.atan2(dx,dz);g.rotation.x=Math.atan2(Math.max(0,H.y-p.y)-.3,3.1);g.rotation.z=0;gun.v=-tr.v}
function frGunUpd38(v,dt){const h=v.h38;if(!h)return;h.t+=dt;const g=v.g;
 if(h.st==='towed'){frTowUpd38(v,dt);return}
 if(h.st==='drop'){g.rotation.x=Math.max(0,g.rotation.x-dt*.25);v.v=0;if(h.t>1.2){h.st='swing';h.t=0}return}
 if(h.st==='swing'){const e=vhAD32(g.rotation.y,h.face);const s=vhCL32(e,-.5*dt,.5*dt);g.rotation.y+=s;g.rotation.x=0;if(Math.abs(e)<.02){h.st='spread';h.t=0}return}
 if(h.st==='spread'){frTrail38(v,Math.min(1,h.t/1.6));g.rotation.x=0;if(h.t>1.6){h.st='ready';const o=h.o||{};if(v.ob38&&!v.ob){v.ob=v.ob38;obstB.push(v.ob)}vhObUpd32(v);if(v.amm)v.amm.visible=true;v.fire=o.fire!==false&&v.alive&&v.crew.some(c=>c.visible);if(o.onDone)try{o.onDone(v)}catch(e){console.warn(e)}}return}
 if(h.st==='close'){frTrail38(v,Math.max(0,1-h.t/1.6));for(const m of v.mounts){m.yaw*=Math.max(0,1-dt*2);m.y.rotation.y=m.base+m.yaw}if(h.t>1.6){h.st='lift';h.t=0;frShow38(v.crew,false);if(v.amm)v.amm.visible=false}return}
 if(h.st==='lift'){if(h.tr&&h.tr.alive)tow38(h.tr,v);else h.st='ready';return}
 if(h.st==='ready'&&v.fire&&v.alive){const m=v.mounts[0];if(m&&m.tgt){const t=vhTPos32(m,fr_v38),o=m.y.getWorldPosition(vh_ve32),d=Math.hypot(t.x-o.x,t.z-o.z);m.p.rotation.x=-(m.pit+vhCL32(d/m.rng*.6,0,.5))}}}
/* mástil del coche de observación: obsMast38(v,true|false) */
function obsMast38(v,up){if(v&&v.mast)v.mastT=up?1:0}
function frMastUpd38(v,dt){if(v.mastK===v.mastT)return;v.mastK+=vhCL32(v.mastT-v.mastK,-dt*.35,dt*.35);const s=v.mast.children[0];let c=s;for(let i=0;i<3&&c;i++){const n=c.children.find(x=>x.isGroup);if(n)n.position.y=.2+1.6*v.mastK;c=n}}
const FRX38=[];
{const _k=vhVehKill32;vhVehKill32=function(v,how){const was=v.alive;const r=_k.apply(this,arguments);if(was&&!v.alive){v.g.traverse(o=>{if(o.name==='pax'||o.name==='crw')o.visible=false});if(v.towing){const gn=v.towing;v.towing=null;frTowUpd38(gn,0)}
  if(v.kind==='ammotruck38'&&how!=='crew')for(let i=0;i<5;i++)FRX38.push({t:.4+i*.55+R()*.4,x:v.g.position.x+(R()-.5)*3,z:v.g.position.z+(R()-.5)*5})}return r}}
{const _u=vehUpd32;vehUpd32=function(dt){const t0=typeof time!=='undefined'?time:0;const r=_u.apply(this,arguments);if(FLAG38.lt===t0)return r;FLAG38.lt=t0;
 try{const d=Math.min(dt||0,.05);if(d>0){for(const v of VEH32.list){if(!v.on)continue;if(v.h38)frGunUpd38(v,d);else if(v.mast)frMastUpd38(v,d)}
  for(let i=FRX38.length-1;i>=0;i--){const e=FRX38[i];e.t-=d;if(e.t<=0){FRX38.splice(i,1);burst(e.x,1.5,e.z,0xffb050,18,.8,10);smoke(e.x,2.5,e.z,5,5,0x2a2622,2,.7);flashLight(e.x,2,e.z,6,.4,0xffa050);expSnd(e.x,e.z,1.2);
   const dp=Math.hypot(P.g.position.x-e.x,P.g.position.z-e.z);if(dp<7)hitP(22*(1-dp/7));for(let j=enemies.length-1;j>=0;j--){const n=enemies[j];if(n&&n.hp>0&&Math.hypot(n.g.position.x-e.x,n.g.position.z-e.z)<5)hurt(n,120,'m',{name:'La munición'})}}}}}catch(e){if(!FLAG38.w){FLAG38.w=1;console.warn('v38_lib',e)}}return r};VEH32.vehUpd32=vehUpd32}
Object.assign(VEH32,{tractor38,spg38,ammoTruck38,obsCar38,howitzer38,tow38,unlimber38,limber38,obsMast38});
const LIB38={volsk:volsk32,veyrn:veyrn32,knight38,flag38,kindsV:Object.keys(KN38.V),kindsE:Object.keys(KN38.E),flags:['volsk12','volsk','frust','veyrn'],veh:{tractor38,spg38,ammoTruck38,obsCar38,howitzer38,tow38,unlimber38,limber38,obsMast38},X18};
