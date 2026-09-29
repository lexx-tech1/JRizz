/* Shared helpers for the 3D sections (story, chain, journey, lanterns). */
import * as THREE from "three";

export { THREE };
export const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
export const SERIF = '"Cormorant Garamond", Georgia, serif';
export const SANS = '"Karla", Arial, sans-serif';

export const el = (tag, cls, txt) => {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (txt != null) n.textContent = txt;
  return n;
};

export function tex(w, h, draw) {
  const c = document.createElement("canvas");
  c.width = w; c.height = h;
  draw(c.getContext("2d"), w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

export function wrapText(g, text, x, y, maxW, lh) {
  const words = text.split(" ");
  let line = "", yy = y;
  words.forEach((w) => {
    const test = line ? `${line} ${w}` : w;
    if (g.measureText(test).width > maxW && line) { g.fillText(line, x, yy); line = w; yy += lh; } else line = test;
  });
  if (line) g.fillText(line, x, yy);
  return yy + lh;
}

let fontsPromise;
export function fontsReady() {
  if (!document.fonts) return Promise.resolve();
  fontsPromise ??= Promise.race([
    Promise.all([
      document.fonts.load(`400 48px ${SERIF}`), document.fonts.load(`italic 400 48px ${SERIF}`),
      document.fonts.load(`500 48px ${SERIF}`), document.fonts.load(`400 24px ${SANS}`), document.fonts.load(`500 24px ${SANS}`),
    ]).catch(() => {}),
    new Promise((r) => setTimeout(r, 2500)),
  ]);
  return fontsPromise;
}

/* A renderer that sizes itself to `host` and only animates while on screen.
   Returns null when WebGL is unavailable. */
export function stage3d({ canvas, host, fov = 45, alpha = false, antialias = true, maxPR = 2, tick }) {
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, alpha, antialias });
  } catch {
    return null;
  }
  renderer.setPixelRatio(Math.min(devicePixelRatio, maxPR));
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(fov, 1, 0.1, 400);
  const clock = new THREE.Clock();
  const api = { renderer, scene, camera, width: 1, height: 1, onResize: null, visible: false };

  function resize() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (!w || !h) return;
    api.width = w; api.height = h;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    api.onResize?.(w, h);
  }
  new ResizeObserver(resize).observe(canvas);
  resize();

  const frame = () => {
    const dt = Math.min(clock.getDelta(), 0.05);
    tick(dt, clock.elapsedTime);
    renderer.render(scene, camera);
  };
  new IntersectionObserver(([en]) => {
    if (en.isIntersecting === api.visible) return;
    api.visible = en.isIntersecting;
    if (api.visible) clock.getDelta();
    renderer.setAnimationLoop(api.visible ? frame : null);
  }, { threshold: 0 }).observe(host);
  api.renderOnce = () => renderer.render(scene, camera);
  return api;
}

/* Normalised device coordinates of a pointer event over an element. */
export function ndcOf(e, elem, out = new THREE.Vector2()) {
  const r = elem.getBoundingClientRect();
  return out.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
}

/* Treat pointerdown+pointerup with little movement as a click. */
export function onTap(elem, fn) {
  let down = null;
  elem.addEventListener("pointerdown", (e) => { down = { x: e.clientX, y: e.clientY }; });
  elem.addEventListener("pointerup", (e) => {
    if (down && Math.hypot(e.clientX - down.x, e.clientY - down.y) < 7) fn(e);
    down = null;
  });
}

export const ease = (k) => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2);
export const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
