/* =========================================================================
   tools/assets/three_lite.js — escena mínima + rasterizador + escritor PNG.

   Sirve para renderizar SIN navegador y SIN GPU los generadores procedurales
   del juego (mkRifle, mkSMG, mkMG08, módulos de muralla). No es Three.js: solo
   implementa el subconjunto que usan esos generadores (Group, Mesh,
   BoxGeometry, CylinderGeometry, materiales Lambert) y los proyecta con una
   cámara en perspectiva sobre un z-buffer propio.

   Salida: PNG RGBA de 8 bits con fondo transparente, que es justo lo que
   acepta el Space de TRELLIS.2 (alpha = objeto recortado, sin rembg).

   Sin dependencias: usa `zlib` de Node solo para comprimir el PNG.
   ========================================================================= */
'use strict';

const zlib = require('zlib');

/* ------------------------------------------------------------------ vectores */

function v3(x, y, z) {
  const o = { x: x || 0, y: y || 0, z: z || 0 };
  // Los generadores del juego usan la API de Three: position.set(...), copy, etc.
  o.set = function (a, b, c) { this.x = a; this.y = b; this.z = c; return this; };
  o.copy = function (v) { this.x = v.x; this.y = v.y; this.z = v.z; return this; };
  o.clone = function () { return v3(this.x, this.y, this.z); };
  o.add = function (v) { this.x += v.x; this.y += v.y; this.z += v.z; return this; };
  o.sub = function (v) { this.x -= v.x; this.y -= v.y; this.z -= v.z; return this; };
  o.setScalar = function (s) { this.x = this.y = this.z = s; return this; };
  o.length = function () { return Math.hypot(this.x, this.y, this.z); };
  return o;
}

function sub(a, b) { return v3(a.x - b.x, a.y - b.y, a.z - b.z); }
function cross(a, b) {
  return v3(a.y * b.z - a.z * b.y, a.z * b.x - a.x * b.z, a.x * b.y - a.y * b.x);
}
function dot(a, b) { return a.x * b.x + a.y * b.y + a.z * b.z; }
function norm(a) {
  const l = Math.hypot(a.x, a.y, a.z) || 1;
  return v3(a.x / l, a.y / l, a.z / l);
}

function mul3(a, b) {
  const r = new Array(9);
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      r[i * 3 + j] = a[i * 3] * b[j] + a[i * 3 + 1] * b[3 + j] + a[i * 3 + 2] * b[6 + j];
    }
  }
  return r;
}

function rotXYZ(rx, ry, rz) {
  const cx = Math.cos(rx), sx = Math.sin(rx);
  const cy = Math.cos(ry), sy = Math.sin(ry);
  const cz = Math.cos(rz), sz = Math.sin(rz);
  const Rx = [1, 0, 0, 0, cx, -sx, 0, sx, cx];
  const Ry = [cy, 0, sy, 0, 1, 0, -sy, 0, cy];
  const Rz = [cz, -sz, 0, sz, cz, 0, 0, 0, 1];
  return mul3(mul3(Rx, Ry), Rz);
}

function apply3(m, v) {
  return v3(
    m[0] * v.x + m[1] * v.y + m[2] * v.z,
    m[3] * v.x + m[4] * v.y + m[5] * v.z,
    m[6] * v.x + m[7] * v.y + m[8] * v.z
  );
}

/* -------------------------------------------------------------- geometrías */

// Cada geometría devuelve vértices e índices de triángulos, con normales
// implícitas por cara (suficiente para sombreado plano).

function BoxGeometry(w, h, d) {
  const x = w / 2, y = h / 2, z = d / 2;
  const v = [
    [-x, -y, -z], [x, -y, -z], [x, y, -z], [-x, y, -z],
    [-x, -y, z], [x, -y, z], [x, y, z], [-x, y, z],
  ].map(function (p) { return v3(p[0], p[1], p[2]); });
  const f = [
    [4, 5, 6], [4, 6, 7],   // +Z
    [1, 0, 3], [1, 3, 2],   // -Z
    [5, 1, 2], [5, 2, 6],   // +X
    [0, 4, 7], [0, 7, 3],   // -X
    [7, 6, 2], [7, 2, 3],   // +Y
    [0, 1, 5], [0, 5, 4],   // -Y
  ];
  return { vertices: v, faces: f, tipo: 'box' };
}

function CylinderGeometry(rTop, rBottom, h, radial) {
  const seg = Math.max(3, radial || 8);
  const verts = [];
  const faces = [];
  const hy = h / 2;
  for (let i = 0; i < seg; i++) {
    const a = (i / seg) * Math.PI * 2;
    const ca = Math.cos(a), sa = Math.sin(a);
    verts.push(v3(ca * rTop, hy, sa * rTop));
    verts.push(v3(ca * rBottom, -hy, sa * rBottom));
  }
  for (let i = 0; i < seg; i++) {
    const a0 = i * 2, a1 = ((i + 1) % seg) * 2;
    faces.push([a0, a1, a1 + 1]);
    faces.push([a0, a1 + 1, a0 + 1]);
  }
  const top = verts.length;
  verts.push(v3(0, hy, 0));
  const bot = verts.length;
  verts.push(v3(0, -hy, 0));
  for (let i = 0; i < seg; i++) {
    const a0 = i * 2, a1 = ((i + 1) % seg) * 2;
    if (rTop > 1e-6) faces.push([top, a0, a1]);
    if (rBottom > 1e-6) faces.push([bot, a1 + 1, a0 + 1]);
  }
  return { vertices: verts, faces: faces, tipo: 'cylinder' };
}

function SphereGeometry(r, ws, hs) {
  const seg = Math.max(4, ws || 12), rings = Math.max(3, hs || 8);
  const verts = [];
  const faces = [];
  for (let j = 0; j <= rings; j++) {
    const phi = (j / rings) * Math.PI;
    for (let i = 0; i < seg; i++) {
      const th = (i / seg) * Math.PI * 2;
      verts.push(v3(r * Math.sin(phi) * Math.cos(th), r * Math.cos(phi), r * Math.sin(phi) * Math.sin(th)));
    }
  }
  for (let j = 0; j < rings; j++) {
    for (let i = 0; i < seg; i++) {
      const a = j * seg + i, b = j * seg + ((i + 1) % seg);
      const c = (j + 1) * seg + i, d = (j + 1) * seg + ((i + 1) % seg);
      faces.push([a, b, d]);
      faces.push([a, d, c]);
    }
  }
  return { vertices: verts, faces: faces, tipo: 'sphere' };
}

/* ----------------------------------------------------------------- escena */

function Euler(x, y, z) {
  return { x: x || 0, y: y || 0, z: z || 0, order: 'XYZ', isEuler: true };
}

function Object3D(nombre) {
  this.type = nombre || 'Object3D';
  this.name = '';
  this.position = v3();
  this.rotation = Euler();
  this.scale = v3(1, 1, 1);
  this.children = [];
  this.userData = {};
  this.visible = true;
  this.parent = null;
}
Object3D.prototype.add = function () {
  for (let i = 0; i < arguments.length; i++) {
    const o = arguments[i];
    if (!o) continue;
    o.parent = this;
    this.children.push(o);
  }
  return this;
};
Object3D.prototype.remove = function (o) {
  const i = this.children.indexOf(o);
  if (i >= 0) this.children.splice(i, 1);
  return this;
};
Object3D.prototype.traverse = function (fn) {
  fn(this);
  for (let i = 0; i < this.children.length; i++) this.children[i].traverse(fn);
};
Object3D.prototype.updateMatrixWorld = function () { /* matrices se calculan al vuelo */ };

function Group() { Object3D.call(this, 'Group'); }
Group.prototype = Object.create(Object3D.prototype);
Group.prototype.constructor = Group;

function Mesh(geometry, material) {
  Object3D.call(this, 'Mesh');
  this.geometry = geometry;
  this.material = material || { color: 0xcccccc };
  this.isMesh = true;
}
Mesh.prototype = Object.create(Object3D.prototype);
Mesh.prototype.constructor = Mesh;

function Material(opciones) {
  opciones = opciones || {};
  this.color = opciones.color === undefined ? 0xcccccc : opciones.color;
  this.emissive = opciones.emissive || 0;
  this.map = opciones.map || null;
}
function MeshLambertMaterial(o) { Material.call(this, o); this.tipo = 'lambert'; }
function MeshStandardMaterial(o) { Material.call(this, o); this.tipo = 'standard'; }
function MeshBasicMaterial(o) { Material.call(this, o); this.tipo = 'basic'; }

/* Nuestro namespace `T`, compatible con lo que usan los generadores. */
const T = {
  Group: Group,
  Object3D: Object3D,
  Mesh: Mesh,
  BoxGeometry: BoxGeometry,
  CylinderGeometry: CylinderGeometry,
  SphereGeometry: SphereGeometry,
  ConeGeometry: function (r, h, seg) { return CylinderGeometry(0, r, h, seg); },
  MeshLambertMaterial: MeshLambertMaterial,
  MeshStandardMaterial: MeshStandardMaterial,
  MeshBasicMaterial: MeshBasicMaterial,
  Vector3: function (x, y, z) { this.x = x || 0; this.y = y || 0; this.z = z || 0; },
  Color: function (c) { this.c = c; },
  DoubleSide: 2,
  AdditiveBlending: 2,
};

/* ---------------------------------------------------------------- render */

function matrizDe(obj) {
  const r = rotXYZ(obj.rotation.x || 0, obj.rotation.y || 0, obj.rotation.z || 0);
  const s = obj.scale || v3(1, 1, 1);
  return {
    r: r,
    s: s,
    t: obj.position || v3(),
  };
}

function componer(padre, obj) {
  const m = matrizDe(obj);
  return {
    r: padre ? mul3(padre.r, m.r) : m.r,
    s: v3(
      (padre ? padre.s.x : 1) * m.s.x,
      (padre ? padre.s.y : 1) * m.s.y,
      (padre ? padre.s.z : 1) * m.s.z
    ),
    t: padre
      ? v3(
          padre.t.x + (padre.r[0] * m.t.x + padre.r[1] * m.t.y + padre.r[2] * m.t.z) * padre.s.x,
          padre.t.y + (padre.r[3] * m.t.x + padre.r[4] * m.t.y + padre.r[5] * m.t.z) * padre.s.y,
          padre.t.z + (padre.r[6] * m.t.x + padre.r[7] * m.t.y + padre.r[8] * m.t.z) * padre.s.z
        )
      : m.t,
  };
}

function recolectar(raiz) {
  const tris = [];
  const caja = {
    min: v3(Infinity, Infinity, Infinity),
    max: v3(-Infinity, -Infinity, -Infinity),
  };

  function visitar(obj, matriz) {
    if (obj.visible === false) return;
    const mundial = componer(matriz, obj);
    const geo = obj.geometry;
    if (geo && geo.vertices && geo.faces) {
      const color = obj.material && obj.material.color !== undefined ? obj.material.color : 0xcccccc;
      const vs = geo.vertices.map(function (v) {
        return v3(
          mundial.t.x + (mundial.r[0] * v.x + mundial.r[1] * v.y + mundial.r[2] * v.z) * mundial.s.x,
          mundial.t.y + (mundial.r[3] * v.x + mundial.r[4] * v.y + mundial.r[5] * v.z) * mundial.s.y,
          mundial.t.z + (mundial.r[6] * v.x + mundial.r[7] * v.y + mundial.r[8] * v.z) * mundial.s.z
        );
      });
      for (let i = 0; i < vs.length; i++) {
        caja.min.x = Math.min(caja.min.x, vs[i].x);
        caja.min.y = Math.min(caja.min.y, vs[i].y);
        caja.min.z = Math.min(caja.min.z, vs[i].z);
        caja.max.x = Math.max(caja.max.x, vs[i].x);
        caja.max.y = Math.max(caja.max.y, vs[i].y);
        caja.max.z = Math.max(caja.max.z, vs[i].z);
      }
      for (let f = 0; f < geo.faces.length; f++) {
        const cara = geo.faces[f];
        const a = vs[cara[0]], b = vs[cara[1]], c = vs[cara[2]];
        if (!a || !b || !c) continue;
        let n = cross(sub(b, a), sub(c, a));
        if (Math.hypot(n.x, n.y, n.z) < 1e-9) continue;
        n = norm(n);
        tris.push({ a: a, b: b, c: c, n: n, color: color });
      }
    }
    for (let i = 0; i < obj.children.length; i++) visitar(obj.children[i], mundial);
  }

  visitar(raiz, null);
  return { tris: tris, caja: caja };
}

function crc32Tabla() {
  const t = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c;
  }
  return t;
}
const CRC = crc32Tabla();

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function trozo(tipo, datos) {
  const largo = Buffer.alloc(4);
  largo.writeUInt32BE(datos.length, 0);
  const cuerpo = Buffer.concat([Buffer.from(tipo, 'ascii'), datos]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(cuerpo), 0);
  return Buffer.concat([largo, cuerpo, crc]);
}

/** PNG RGBA de 8 bits a partir de un buffer RGBA. */
function pngRGBA(ancho, alto, rgba) {
  const firma = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(ancho, 0);
  ihdr.writeUInt32BE(alto, 4);
  ihdr[8] = 8;   // bits por canal
  ihdr[9] = 6;   // RGBA
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;
  const filas = Buffer.alloc((ancho * 4 + 1) * alto);
  for (let y = 0; y < alto; y++) {
    filas[y * (ancho * 4 + 1)] = 0; // sin filtro
    rgba.copy(filas, y * (ancho * 4 + 1) + 1, y * ancho * 4, (y + 1) * ancho * 4);
  }
  const idat = zlib.deflateSync(filas, { level: 9 });
  return Buffer.concat([firma, trozo('IHDR', ihdr), trozo('IDAT', idat), trozo('IEND', Buffer.alloc(0))]);
}

/**
 * Renderiza un Object3D.
 * opciones: {ancho, alto, muestras, direccion, fov, fondo}
 * Devuelve {png: Buffer, ancho, alto, triangulos, caja}.
 */
function render(raiz, opciones) {
  const opt = Object.assign(
    { ancho: 1024, alto: 1024, muestras: 2, direccion: [1, 0.5, 1.15], fov: 32, fondo: null },
    opciones || {}
  );
  const W = opt.ancho * opt.muestras;
  const H = opt.alto * opt.muestras;
  const { tris, caja } = recolectar(raiz);

  if (!tris.length) throw new Error('la escena no tiene triángulos que renderizar');

  const centro = v3(
    (caja.min.x + caja.max.x) / 2,
    (caja.min.y + caja.max.y) / 2,
    (caja.min.z + caja.max.z) / 2
  );
  const radio = Math.max(
    1e-6,
    0.5 * Math.hypot(caja.max.x - caja.min.x, caja.max.y - caja.min.y, caja.max.z - caja.min.z)
  );
  const dir = norm(v3(opt.direccion[0], opt.direccion[1], opt.direccion[2]));
  const focal = H / 2 / Math.tan((opt.fov * Math.PI) / 180 / 2);
  const dist = (radio / Math.sin((opt.fov * Math.PI) / 180 / 2)) * 1.08;
  const ojo = v3(centro.x + dir.x * dist, centro.y + dir.y * dist, centro.z + dir.z * dist);

  const adelante = norm(sub(centro, ojo));
  const derecha = norm(cross(adelante, v3(0, 1, 0)));
  const arriba = cross(derecha, adelante);

  const color = Buffer.alloc(W * H * 4, 0);
  const zbuf = new Float32Array(W * H).fill(Infinity);

  const clave = norm(v3(-0.45, 0.85, 0.6));
  const relleno = norm(v3(0.7, 0.15, -0.5));

  function proyectar(p) {
    const d = sub(p, ojo);
    return { x: dot(d, derecha), y: dot(d, arriba), z: dot(d, adelante) };
  }

  // Aproximación de sRGB: los colores del juego son hex de pantalla.
  function tono(c) {
    const r = ((c >> 16) & 255) / 255, g = ((c >> 8) & 255) / 255, b = (c & 255) / 255;
    return [Math.pow(r, 1.12), Math.pow(g, 1.12), Math.pow(b, 1.12)];
  }

  for (let t = 0; t < tris.length; t++) {
    const tri = tris[t];
    const A = proyectar(tri.a), B = proyectar(tri.b), C = proyectar(tri.c);
    if (A.z <= 1e-4 || B.z <= 1e-4 || C.z <= 1e-4) continue;

    // Culling de caras traseras: el juego construye cajas cerradas.
    const nv = cross(sub(tri.b, tri.a), sub(tri.c, tri.a));
    const alOjo = sub(ojo, tri.a);
    if (dot(nv, alOjo) <= 0) continue;

    const ax = W / 2 + (A.x / A.z) * focal, ay = H / 2 - (A.y / A.z) * focal;
    const bx = W / 2 + (B.x / B.z) * focal, by = H / 2 - (B.y / B.z) * focal;
    const cx = W / 2 + (C.x / C.z) * focal, cy = H / 2 - (C.y / C.z) * focal;

    const x0 = Math.max(0, Math.floor(Math.min(ax, bx, cx)));
    const x1 = Math.min(W - 1, Math.ceil(Math.max(ax, bx, cx)));
    const y0 = Math.max(0, Math.floor(Math.min(ay, by, cy)));
    const y1 = Math.min(H - 1, Math.ceil(Math.max(ay, by, cy)));
    if (x1 < x0 || y1 < y0) continue;

    const area = (bx - ax) * (cy - ay) - (by - ay) * (cx - ax);
    if (Math.abs(area) < 1e-9) continue;

    const lam = Math.max(0, dot(tri.n, clave));
    const fil = Math.max(0, dot(tri.n, relleno));
    const luz = 0.34 + 0.66 * lam + 0.16 * fil;
    const base = tono(tri.color);
    const r = Math.min(255, Math.round(255 * Math.min(1.25, base[0] * luz)));
    const g = Math.min(255, Math.round(255 * Math.min(1.25, base[1] * luz)));
    const b = Math.min(255, Math.round(255 * Math.min(1.25, base[2] * luz)));

    const iza = 1 / A.z, izb = 1 / B.z, izc = 1 / C.z;

    for (let y = y0; y <= y1; y++) {
      const py = y + 0.5;
      for (let x = x0; x <= x1; x++) {
        const px = x + 0.5;
        const w0 = ((bx - ax) * (py - ay) - (by - ay) * (px - ax)) / area;
        const w1 = ((px - ax) * (cy - ay) - (py - ay) * (cx - ax)) / area;
        const w2 = 1 - w0 - w1;
        if (w0 < 0 || w1 < 0 || w2 < 0) continue;
        const iz = w2 * iza + w1 * izb + w0 * izc;
        const z = 1 / iz;
        const idx = y * W + x;
        if (z >= zbuf[idx]) continue;
        zbuf[idx] = z;
        const o = idx * 4;
        color[o] = r;
        color[o + 1] = g;
        color[o + 2] = b;
        color[o + 3] = 255;
      }
    }
  }

  // Reducción de muestras (antialiasing por caja) conservando el alfa.
  const M = opt.muestras;
  const out = Buffer.alloc(opt.ancho * opt.alto * 4, 0);
  for (let y = 0; y < opt.alto; y++) {
    for (let x = 0; x < opt.ancho; x++) {
      let r = 0, g = 0, b = 0, a = 0;
      for (let sy = 0; sy < M; sy++) {
        for (let sx = 0; sx < M; sx++) {
          const o = ((y * M + sy) * W + (x * M + sx)) * 4;
          const al = color[o + 3] / 255;
          r += color[o] * al;
          g += color[o + 1] * al;
          b += color[o + 2] * al;
          a += color[o + 3];
        }
      }
      const n = M * M;
      const o = (y * opt.ancho + x) * 4;
      const cobertura = a / n;
      if (cobertura <= 0.5) continue; // fondo transparente
      out[o] = Math.round(r / (a / 255 || 1));
      out[o + 1] = Math.round(g / (a / 255 || 1));
      out[o + 2] = Math.round(b / (a / 255 || 1));
      out[o + 3] = Math.round(cobertura);
    }
  }

  return {
    png: pngRGBA(opt.ancho, opt.alto, out),
    ancho: opt.ancho,
    alto: opt.alto,
    triangulos: tris.length,
    caja: caja,
  };
}

module.exports = {
  T: T,
  Group: Group,
  Mesh: Mesh,
  Object3D: Object3D,
  render: render,
  pngRGBA: pngRGBA,
  recolectar: recolectar,
};
