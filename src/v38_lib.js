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
