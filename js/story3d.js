/* "The Idea": a scroll-driven particle story.
   Scattered islands → Rizal's quill → the open book → the sun and three stars. */
import { THREE, reduce, SERIF, stage3d, ndcOf, clamp, tex } from "./kit3d.js";

// Land mask of the Philippines (1 bit per cell), baked from NASA Blue Marble via three-globe's example textures.
const MASK = { w: 119, h: 190, lon0: 116.5, lon1: 127.0, lat0: 21.2, lat1: 4.5, bits: "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD4AAAAAAAAAAAAAAAAAAD+AQAAAAAAAAAAAAAAAID/AwAAAAAAAAAAAAAAAOD/fwAAAAAAAAAAAAAAAPD/fwAAAAAAAAAAAAAAAPj/PwAAAAAAAAAAAAAAAP7/HwAAAAAAAAAAAAAAAP//DwAAAAAAAAAAAAAAgP//AwAAAAAAAAAAAAAAwP//AQAAAAAAAAAAAAAA4P//AAAAAAAAAAAAAAAA+P//AAAAAAAAAAAAAAAA/P9/AAAAAAAAAAAAAAAA/P8/AAAAAAAAAAAAAAAA/v8/AAAAAAAAAAAAAAAA//8/AAAAAAAAAAAAAACA//8fAAAAAAAAAAAAAADA//8PAAAAAAAAAAAAAADg//8HAAAAAAAAAAAAAAD4//8DAAAAAAAAAAAAAAD8//8BAAAAAAAAAAAAAAD+//8AAAAAAAAAAAAAAAD//z8AAAAAAAAAAAAAAID//w8AAAAAAAAAAAAAAMD//wcAAAAAAAAAAAAAAOD//wMAAAAAAAAAAAAAAPD//wAAAAAAAAAAAAAA4Pj/DwAAAAAAAAAAAAAA8P7/AQAAAAAAAAAAAAAA+P9/AAAAAAAAAAAAAAAA/P8/AAAAAAAAAAAAAAAA/P8PAAAAAAAAAAAAAAAA/v8HAAAAAAAAAAAAAAAA//8DAAAAAAAAAAAAAACA//8BAAAAAAAAAAAAAADA/38AAAAAAAAAAAAAAADA/z8AAAAAAAAAAAAAAADg/x8AAAAAAAAAAAAAAADg/w8AAAAAAAAAAAAAAADw/w8AAAAAAAAAAAAAAAD4/wcAAAAAAAAAAAAAAAD8/wMAAAAAAAAAAAAAAAD8/wMAAAAAAAAAAAAAAAA8/gEAAAAAAAAAAAAAAAAI/wAAAAAAAAAAAAAAAACAfwAAAAAAAAAAAAAAAADAPwAAAAAAAAAAAAAAAADwPwAAAAAAAAAAAAAAAAD8P8ABAAAAAAAAAAAAAAD/H/gBAAAAAAAAAAAAAID/D/wBAAAAAAAAAAAAAMD/D/8BAAAAAAAAAAAAAMD/wP8xAAAAAAAAAAAAAAA/8PF8eAAAAAAAAAAAAAAP8PAfPAAAAAAAAAAAAAAAYPAPAAAAAAAAAAAAAAAAAPADAAAAAAAAAAAAAAAAAOADAAAAAAAAAAAAwD8AAPADAAAAAAAAAAAA4B8AAPADAAAAAAAAAAAA4B8AAPgBAAAAAAAAAAAA4B8AAPgAAAAAAAAAAAAA8A8AAHwAAAAAAAAAAAAA8A8AAPAAAAAAAAAAAAAA+AcAAOABAAAAAAAAAAAA/AMAAGAAAAAAAAAAAAAA/gEAAAAAAAAAAAAAAAAA/gAAAAAAAAAAAAAAAAAAPgAAAADgAQAAAAAAAAAAHwAAGMD/AQAAAAAAAAAAAwAAHOD/AAAAAAAAAAAAAAAAH+D/AAAAAAAAAAAAAACAD+B/AAAAAAAAAAAAAAAAOOA/AAAAAAAAAAAAAAAAGPAfAAAAAAAAAAAAAAAAAPAPAAAAAAAAAAAAAAAAAOAHAAAAAAAAAAAAAAAAAOADAAAAAAAAAAAAcAAAAPABAAAAAAAAAAAA+AMAAPwBAAAAAAAAAAAA/A8AAP4AAAAAAAAAAAAA/g8AgP8AAAAAAAAAAACA/wcA/H8AAAAAAAAAAADA/wEA/gAAAAAAAAAAAADg/wAAPwAAAAAAAAAAAADwHwAAHwAAAAAAACAAAAD4BwMADwAAAAAAABAAAAD+4QMADgAAAAAAAAgAAAD/+GEABwAAAAAAAB4AAAB3/jCABwAAAAAAAAcAAAAAPxjAAwAAAAAAwAMAAACAHw7gAQAAAAAA8AAAAADADwfwAAAAAAAAHAAAAADghwE4AAAAAAAADwAAAADwIQAIAAAAAADAAwAAAAD4AAAAAAAAAAAAAAAAAAA+AA8AAAAAAAAAAAAAAIAfgA8AAAAAAAACAAAAAPCH8AcAAAAAAAABAAAAAPwj/AEAAAAAACAAAAAAAP4DfAAAAAAAABwAAAAAAP8BDAAAAAAAAA8AAAAAAP8AAAA8AAAAgAcAAAAAAP4AAAA+AAAA4AEAAAAAAHwAAAA/AAAAOAAAAAAAADwAAAAfAAAABwAAAAAAAAAAAIAfAADgAwAAAAAAAAAAAMAfAAB4AAAAAAAAAAAAAPwPAAA+AAAAAAAAAAAA4P8PAAAPAAAAAAAAAAAA+P8DAIAAAAAAAAAAAAAA/v8AAAAAAAAAAAAAAAIA//8AAAAAAAAAAAAAwAfw/38AAAAAAAAAAAAA+Af+/38AAAAAAAAAAAAA/oP//38AAAAAAAAAAAAA/8H//z8AAAAAAAAAAADA//H//x8AAAAAAAAAAAD8/////w8AAAAAAAAAAMD//////wcAAAAAAAAAAPD//////wMAAAAAAAAAAPz/+f///wMAAAAAAAAAAP7/+P///wEAAAAAAAAAgIc/8P///wAAAAAAAAAAwMEF4P///wAAAAAAAAAA4AAA8P//fwAAAAAAAAAAOAAA+P//PwAAAAAAAAAAHAAA/P//HwAAAAAAAAAABgAA/v//DwAAAAAAAACAAwCA///5BwAAAAAAAACAAADA/3/4AQAAAAAAAAAAAADg/w94AAAAAAAAAAAAAADw/wcYAAAAAAAAAAAAAAD4/wMAAAAAAAAAAAAcAAD8/wEAAAAAAAAAAAAOAAD+/wAAAAAAAAAAAAAHAAD//wAAAAAAAAAAAAAAAID//wAAAAAAAAAAAAAAAID/fwAAAAAAAAAAAAAAAMD/fwAAAAAAAAAAAAAAAMD/PwAAAAAAAAAAAAAAAMD/HwAAAAAAAAAAAAAAAID/DwAAAAAAAAAAAAAAAADhAwAAAAAAAAAAAAAAAADgAAAAAAABAAAAAAAAAAAwAAAAAIABAAAAAAAAAAAAAAAAAMADAAAAAAAAAAAAAAAAAOADAAAAAAAAAAAAAAAAAPAPAAAAAAAAAAAAAAAAAPgPAAAAAAAAAAAAAAAAAPwBAAAAAAAAAAAAAAAAAH4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA==" };

const LANGS = [
  ["Ilokano", 17.6, 120.6], ["Pangasinan", 16.0, 120.3], ["Kapampangan", 15.1, 120.6], ["Tagalog", 14.2, 121.3],
  ["Bikol", 13.4, 123.5], ["Waray", 11.8, 125.0], ["Hiligaynon", 10.8, 122.4], ["Cebuano", 10.2, 123.9],
  ["Maranao", 7.9, 124.3], ["Tausug", 6.0, 121.0],
];

const track = document.getElementById("story-track");
const stageEl = document.getElementById("story-stage");
const steps = [...document.querySelectorAll(".story-step")];
const dots = [...document.querySelectorAll(".story-dot")];

/* ─── Shapes ──────────────────────────────────────────────────────────── */
const rnd = (a, b) => a + Math.random() * (b - a);
const S = 0.62;   // scene units per degree
const geoXY = (lat, lon) => [(lon - 121.75) * S, (lat - 12.85) * S];

function landCells() {
  const bin = atob(MASK.bits), cells = [];
  for (let i = 0; i < MASK.w * MASK.h; i++) if (bin.charCodeAt(i >> 3) & (1 << (i & 7))) cells.push(i);
  return cells;
}

function sampleTri(a, b, c) {
  let u = Math.random(), v = Math.random();
  if (u + v > 1) { u = 1 - u; v = 1 - v; }
  return [a[0] + (b[0] - a[0]) * u + (c[0] - a[0]) * v, a[1] + (b[1] - a[1]) * u + (c[1] - a[1]) * v];
}

function starTris(cx, cy, R, r, rot = -Math.PI / 2) {
  const pts = [];
  for (let k = 0; k < 10; k++) {
    const a = rot + (k * Math.PI) / 5, rr = k % 2 ? r : R;
    pts.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]);
  }
  return pts.map((p, k) => [[cx, cy], p, pts[(k + 1) % 10]]);
}

function triArea([a, b, c]) {
  return Math.abs((b[0] - a[0]) * (c[1] - a[1]) - (c[0] - a[0]) * (b[1] - a[1])) / 2;
}

function pickTri(tris, areas, total) {
  let r = Math.random() * total;
  for (let k = 0; k < tris.length; k++) { r -= areas[k]; if (r <= 0) return tris[k]; }
  return tris[tris.length - 1];
}

const C = (hex) => new THREE.Color(hex);
const PALETTE_ISLANDS = ["#e98a6d", "#8fc3a5", "#f2cc8f", "#9fb7e8", "#d9a7d0", "#f4e3b5"].map(C);

function buildShapes(n) {
  const P = [0, 1, 2, 3].map(() => new Float32Array(n * 3));
  const K = [0, 1, 2, 3].map(() => new Float32Array(n * 3));
  const set = (s, i, x, y, z, col) => { P[s].set([x, y, z], i * 3); K[s].set([col.r, col.g, col.b], i * 3); };

  // 0 — islands (each island group tinted differently: many peoples, no shared name)
  const cells = landCells(), cw = (MASK.lon1 - MASK.lon0) / MASK.w, ch = (MASK.lat0 - MASK.lat1) / MASK.h;
  for (let i = 0; i < n; i++) {
    const cell = cells[(Math.random() * cells.length) | 0], cx = cell % MASK.w, cy = (cell / MASK.w) | 0;
    const lon = MASK.lon0 + (cx + Math.random()) * cw, lat = MASK.lat0 - (cy + Math.random()) * ch;
    const [x, y] = geoXY(lat, lon);
    const band = Math.min(PALETTE_ISLANDS.length - 1, Math.floor(((lat - 4.5) / 16.7) * PALETTE_ISLANDS.length));
    const col = PALETTE_ISLANDS[PALETTE_ISLANDS.length - 1 - band].clone().offsetHSL(0, 0, rnd(-0.08, 0.08));
    set(0, i, x, y, rnd(-0.12, 0.12), col);
  }

  // 1 — the quill, with a line of ink from its nib
  const ink = C("#6f8fe0"), vane = C("#f4efe2");
  for (let i = 0; i < n; i++) {
    let x, y, z = 0, col = vane;
    const r = Math.random();
    if (r < 0.72) {
      const t = Math.pow(Math.random(), 0.8), side = Math.random() < 0.62 ? 1 : -1;
      const width = (side > 0 ? 1.45 : 0.75) * Math.sin(Math.PI * Math.min(1, t * 1.05)) * (1 - 0.25 * t) * (t < 0.08 ? t / 0.08 : 1);
      const s = Math.pow(Math.random(), 0.7);
      const along = -3.2 + t * 8.2 + s * width * 0.55;     // barbs sweep up towards the tip
      x = side * s * width; y = along; z = Math.sin(s * 3) * 0.12 * side;
      col = vane.clone().lerp(C("#c8d3ef"), s * 0.5);
    } else if (r < 0.8) {
      const t = Math.random(); x = rnd(-0.03, 0.03); y = -4.6 + t * 9.6; col = C("#ffffff");
    } else if (r < 0.86) {
      const t = Math.random(); x = (Math.random() - 0.5) * 0.25 * (1 - t); y = -5.4 + t * 0.8; col = C("#aab7d8");
    } else {
      const t = Math.random(), tx = -1.2 + t * 7.8;
      x = tx - 0.3; y = -5.8 + Math.sin(t * 13) * 0.35 * (1 - t * 0.5) + rnd(-0.05, 0.05); col = ink;
    }
    // lean the quill
    const a = -0.5, xr = x * Math.cos(a) - y * Math.sin(a), yr = x * Math.sin(a) + y * Math.cos(a);
    set(1, i, xr + 0.8, yr + 0.6, z, col);
  }

  // 2 — the open book, with words rising off its pages
  const paper = C("#f1e6cc"), text = C("#7c99e8"), word = C("#ffd98a");
  for (let i = 0; i < n; i++) {
    const r = Math.random();
    let x, y, z, col;
    if (r < 0.8) {
      const side = Math.random() < 0.5 ? -1 : 1, u = Math.random(), v = rnd(-2.6, 2.6);
      x = side * u * 4.2; y = v; z = 1.1 * (1 - Math.pow(1 - u, 2.2)) - 0.2;
      col = paper;
      const row = (v + 2.3) / 0.36, onLine = Math.abs(row - Math.round(row)) < 0.14 && u > 0.1 && u < 0.9 && Math.abs(v) < 2.35;
      if (onLine && Math.sin(u * 60 + Math.round(row) * 7) > -0.3) col = text;
    } else {
      const t = Math.random(), a = t * 9 + Math.random() * 0.5, rad = 0.6 + t * 3.2;
      x = Math.cos(a) * rad * 0.8; y = 0.2 + t * 5.2; z = 1 + Math.sin(a) * rad * 0.6;
      col = word.clone().lerp(C("#ffffff"), Math.random() * 0.4);
    }
    if (r < 0.8) {
      // tilt the pages towards the viewer
      const a = -1.0, yr = y * Math.cos(a) - z * Math.sin(a), zr = y * Math.sin(a) + z * Math.cos(a);
      set(2, i, x, yr - 1.6, zr, col);
    } else set(2, i, x, y - 1.2, z - 1, col);
  }

  // 3 — the flag: sun with eight rays and three stars inside a white triangle, blue above, red below
  const gold = C("#ffcf4d"), white = C("#fbf7ee"), blue = C("#3f6fd8"), red = C("#e0464b");
  const H = 5.6, tri = [[-5.2, H], [-5.2, -H], [3.2, 0]];
  const sunC = [-2.4, 0], rays = [];
  for (let k = 0; k < 8; k++) {
    const a = (k / 8) * Math.PI * 2 + Math.PI / 8;
    [[0, 1.05, 0.2], [-0.2, 0.8, 0.1], [0.2, 0.8, 0.1]].forEach(([da, len, wd]) => {
      const aa = a + da, r0 = 1.0, r1 = r0 + 1.3 * len;
      rays.push([[sunC[0] + Math.cos(aa - wd) * r0, Math.sin(aa - wd) * r0], [sunC[0] + Math.cos(aa) * r1, Math.sin(aa) * r1], [sunC[0] + Math.cos(aa + wd) * r0, Math.sin(aa + wd) * r0]]);
    });
  }
  const stars = [...starTris(-4.4, 3.9, 0.55, 0.22), ...starTris(-4.4, -3.9, 0.55, 0.22), ...starTris(1.8, 0, 0.55, 0.22)];
  const rayA = rays.map(triArea), rayT = rayA.reduce((a, b) => a + b), starA = stars.map(triArea), starT = starA.reduce((a, b) => a + b);
  for (let i = 0; i < n; i++) {
    const r = Math.random();
    let x, y, z = 0, col;
    if (r < 0.14) { const a = Math.random() * Math.PI * 2, rr = Math.sqrt(Math.random()) * 0.95; x = sunC[0] + Math.cos(a) * rr; y = Math.sin(a) * rr; col = gold; z = 0.15; }
    else if (r < 0.34) { [x, y] = sampleTri(...pickTri(rays, rayA, rayT)); col = gold; z = 0.1; }
    else if (r < 0.44) { [x, y] = sampleTri(...pickTri(stars, starA, starT)); col = gold; z = 0.15; }
    else if (r < 0.62) {
      // triangle edge + fill
      if (Math.random() < 0.45) { const e = (Math.random() * 3) | 0, a = tri[e], b = tri[(e + 1) % 3], t = Math.random(); x = a[0] + (b[0] - a[0]) * t; y = a[1] + (b[1] - a[1]) * t; col = white; }
      else { [x, y] = sampleTri(...tri); col = white.clone().multiplyScalar(0.55); }
    } else {
      // field: blue over red, beside the triangle
      y = rnd(-H, H); x = rnd(-5.2 + 8.4 * (1 - Math.abs(y) / H), 7.6);
      col = (y > 0 ? blue : red).clone().offsetHSL(0, 0, rnd(-0.06, 0.04));
      z = -0.3;
    }
    set(3, i, (x - 0.6) * 0.8, y * 0.8, z, col);
  }
  return { P, K };
}

/* ─── Scene ───────────────────────────────────────────────────────────── */
const VERT = /* glsl */ `
  attribute vec3 p1; attribute vec3 p2; attribute vec3 p3;
  attribute vec3 c0; attribute vec3 c1; attribute vec3 c2; attribute vec3 c3;
  attribute float seed;
  uniform float uM, uTime, uSize, uScale, uPulse;
  uniform vec3 uMouse, uPulseAt;
  uniform float uMouseOn;
  varying vec3 vColor;
  varying float vGlow;
  void main() {
    float k = floor(clamp(uM, 0.0, 2.999));
    float f = uM - k;
    float fs = smoothstep(seed * 0.35, seed * 0.35 + 0.65, f);
    vec3 A = k < 0.5 ? position : (k < 1.5 ? p1 : p2);
    vec3 B = k < 0.5 ? p1 : (k < 1.5 ? p2 : p3);
    vec3 CA = k < 0.5 ? c0 : (k < 1.5 ? c1 : c2);
    vec3 CB = k < 0.5 ? c1 : (k < 1.5 ? c2 : c3);
    vec3 pos = mix(A, B, fs);
    float mid = sin(fs * 3.14159);
    pos += vec3(sin(seed * 51.0 + uTime * 0.9), cos(seed * 37.0 + uTime * 0.7), sin(seed * 23.0 + uTime)) * mid * 1.6;
    pos += vec3(sin(uTime * 0.8 + seed * 20.0), cos(uTime * 0.7 + seed * 30.0), sin(uTime * 0.6 + seed * 10.0)) * 0.035;

    vec2 d = pos.xy - uMouse.xy;
    float dist = length(d);
    float push = uMouseOn * smoothstep(1.4, 0.0, dist);
    pos.xy += normalize(d + 1e-4) * push * 1.1;
    pos.z += push * 1.2;

    // click ripple
    float age = uTime - uPulse;
    float rd = length(pos.xy - uPulseAt.xy);
    float wave = exp(-pow((rd - age * 7.0) * 1.6, 2.0)) * exp(-age * 1.4) * step(0.0, age);
    pos.z += wave * 1.4;
    pos.xy += normalize(pos.xy - uPulseAt.xy + 1e-4) * wave * 0.4;

    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = max(1.5, uSize * uScale * (0.55 + seed * 0.9) * (1.0 + wave * 0.8) / -mv.z);
    vColor = mix(CA, CB, fs);
    vGlow = 1.0 + push * 1.2 + wave * 1.5;
  }`;
const FRAG = /* glsl */ `
  varying vec3 vColor;
  varying float vGlow;
  uniform float uAlpha;
  void main() {
    float r = length(gl_PointCoord - 0.5);
    if (r > 0.5) discard;
    float a = smoothstep(0.5, 0.0, r);
    gl_FragColor = vec4(vColor * vGlow, a * uAlpha);
  }`;

function start() {
  if (!track || !stageEl) return;
  const canvas = document.getElementById("story-canvas");
  let m = 0, mTarget = 0;

  const s3 = stage3d({ canvas, host: stageEl, fov: 42, alpha: true, maxPR: 1.75, tick });
  if (!s3) { stageEl.classList.add("no-webgl"); return; }
  const { scene, camera, renderer } = s3;
  camera.position.set(0, 0, 17);

  const N = innerWidth < 700 ? 5200 : 9000;
  const { P, K } = buildShapes(N);
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(P[0], 3));
  geo.setAttribute("p1", new THREE.BufferAttribute(P[1], 3));
  geo.setAttribute("p2", new THREE.BufferAttribute(P[2], 3));
  geo.setAttribute("p3", new THREE.BufferAttribute(P[3], 3));
  K.forEach((k, i) => geo.setAttribute(`c${i}`, new THREE.BufferAttribute(k, 3)));
  const seeds = new Float32Array(N);
  for (let i = 0; i < N; i++) seeds[i] = Math.random();
  geo.setAttribute("seed", new THREE.BufferAttribute(seeds, 1));
  geo.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 20);

  const uniforms = {
    uM: { value: 0 }, uTime: { value: 0 }, uSize: { value: 0.075 }, uScale: { value: 1 },
    uMouse: { value: new THREE.Vector3(99, 99, 0) }, uMouseOn: { value: 0 }, uAlpha: { value: 0.9 },
    uPulse: { value: -99 }, uPulseAt: { value: new THREE.Vector3() },
  };
  const mat = new THREE.ShaderMaterial({ vertexShader: VERT, fragmentShader: FRAG, uniforms, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });
  const group = new THREE.Group();
  group.add(new THREE.Points(geo, mat));
  scene.add(group);

  // Language labels, only in the first scene
  const labels = LANGS.map(([name, lat, lon]) => {
    const t = tex(256, 64, (g, W, H) => {
      g.font = `italic 400 38px ${SERIF}`; g.textAlign = "center"; g.textBaseline = "middle";
      g.fillStyle = "rgba(255,245,225,.95)"; g.fillText(name, W / 2, H / 2);
    });
    const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, transparent: true, depthWrite: false }));
    const [x, y] = geoXY(lat, lon);
    sp.position.set(x + (lon < 121.5 ? -1.3 : 1.3), y, 0.4);
    sp.scale.set(2.4, 0.6, 1);
    group.add(sp);
    return sp;
  });

  // Faint star field for depth
  const starGeo = new THREE.BufferGeometry(), sp = new Float32Array(900 * 3);
  for (let i = 0; i < 900; i++) sp.set([rnd(-40, 40), rnd(-25, 25), rnd(-30, -8)], i * 3);
  starGeo.setAttribute("position", new THREE.BufferAttribute(sp, 3));
  scene.add(new THREE.Points(starGeo, new THREE.PointsMaterial({ color: 0x9fb0d8, size: 0.08, transparent: true, opacity: 0.6, depthWrite: false })));

  /* Pointer: parallax, repulsion and click ripples */
  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2(), plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
  const hit = new THREE.Vector3(), inv = new THREE.Matrix4();
  let look = { x: 0, y: 0 }, mouseOn = 0;
  function toLocal(e) {
    ndcOf(e, canvas, ndc);
    ray.setFromCamera(ndc, camera);
    inv.copy(group.matrixWorld).invert();
    const r = ray.ray.clone().applyMatrix4(inv);
    return r.intersectPlane(plane, hit) ? hit : null;
  }
  canvas.addEventListener("pointermove", (e) => {
    const p = toLocal(e);
    look = { x: ndc.x, y: ndc.y };
    if (p) uniforms.uMouse.value.copy(p);
    mouseOn = 1;
  });
  canvas.addEventListener("pointerleave", () => { mouseOn = 0; });
  canvas.addEventListener("pointerdown", (e) => {
    const p = toLocal(e);
    if (!p) return;
    uniforms.uPulseAt.value.copy(p);
    uniforms.uPulse.value = uniforms.uTime.value;
  });

  s3.onResize = (w, h) => {
    camera.position.z = w < 700 ? 22 : 17;
    group.position.x = w < 900 ? 0 : 3.2;
    group.position.y = w < 900 ? 2.2 : 0;
    // pixels per world unit at distance 1, so points keep their size on any screen
    uniforms.uScale.value = (h * renderer.getPixelRatio()) / (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)));
  };
  s3.onResize(s3.width, s3.height);

  function tick(dt, t) {
    m += (mTarget - m) * (reduce ? 1 : Math.min(1, dt * 3.2));
    uniforms.uM.value = m;
    uniforms.uTime.value = t;
    uniforms.uMouseOn.value += (mouseOn - uniforms.uMouseOn.value) * Math.min(1, dt * 6);
    labels.forEach((l) => { l.material.opacity = clamp(1 - m * 2.2, 0, 1); l.visible = l.material.opacity > 0.01; });
    const sway = reduce ? 0 : 1;
    group.rotation.y += ((look.x * 0.35 + Math.sin(t * 0.3) * 0.12 * sway) - group.rotation.y) * Math.min(1, dt * 2);
    group.rotation.x += ((-look.y * 0.2 - (m < 0.5 ? 0.35 : 0)) - group.rotation.x) * Math.min(1, dt * 2);
  }

  /* Scroll → scene */
  function onScroll() {
    const r = track.getBoundingClientRect(), span = r.height - stageEl.offsetHeight;
    const p = clamp(-r.top / Math.max(1, span), 0, 1);
    const u = p * 3, k = Math.min(2, Math.floor(u)), f = u - k;
    const smooth = (x) => x * x * (3 - 2 * x);
    mTarget = k + smooth(clamp((f - 0.3) / 0.4, 0, 1));
    const active = Math.round(mTarget);
    steps.forEach((s, i) => s.classList.toggle("on", i === active));
    dots.forEach((d, i) => d.setAttribute("aria-current", String(i === active)));
  }
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();
  m = mTarget;

  dots.forEach((d, i) => d.addEventListener("click", () => {
    const span = track.offsetHeight - stageEl.offsetHeight;
    const top = track.getBoundingClientRect().top + scrollY;
    scrollTo({ top: top + (span * i) / 3 + (i === 3 ? 2 : 0), behavior: reduce ? "auto" : "smooth" });
  }));
}

start();
