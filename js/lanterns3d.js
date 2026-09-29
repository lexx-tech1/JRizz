/* Reflections as parols: every visitor note becomes a star lantern in the night sky.
   Reads the notes script.js renders into #reflection-list, so no extra API calls. */
import { THREE, reduce, el, tex, stage3d, ndcOf, onTap } from "./kit3d.js";

const $ = (id) => document.getElementById(id);
const ui = { stage: $("sky-stage"), canvas: $("sky-canvas"), card: $("sky-card"), tip: $("sky-tip"), count: $("sky-count"), empty: $("sky-empty"), list: $("reflection-list"), write: $("sky-write") };
const COLORS = [0xff5a4e, 0xffc23d, 0x4fd18b, 0x5aa9ff, 0xff7ac6, 0xffffff, 0xff8f3d];
const MAX = 60;

function readNotes() {
  return [...ui.list.querySelectorAll(".reflection")].map((r) => {
    const by = r.querySelector(".reflection-by");
    return {
      node: r,
      text: r.querySelector(".reflection-text")?.textContent ?? "",
      name: by?.querySelector("strong")?.textContent ?? "A visitor",
      date: (by?.textContent ?? "").split("·").slice(1).join("·").trim(),
    };
  });
}

function showCard(note, fresh) {
  const close = el("button", "sky-close", "×");
  close.type = "button";
  close.setAttribute("aria-label", "Close");
  close.addEventListener("click", () => { ui.card.hidden = true; });
  ui.card.replaceChildren(
    close,
    el("p", "sky-kicker", fresh ? "Your lantern is lit" : "A lantern from a visitor"),
    el("p", "sky-text", `“${note.text}”`),
    el("p", "sky-by", note.date ? `${note.name} · ${note.date}` : note.name)
  );
  ui.card.hidden = false;
}

function starShape(R = 0.5, r = 0.23) {
  const s = new THREE.Shape();
  for (let k = 0; k < 10; k++) {
    const a = Math.PI / 2 + (k * Math.PI) / 5, rr = k % 2 ? r : R;
    k ? s.lineTo(Math.cos(a) * rr, Math.sin(a) * rr) : s.moveTo(Math.cos(a) * rr, Math.sin(a) * rr);
  }
  return s;
}

function build() {
  const s3 = stage3d({ canvas: ui.canvas, host: ui.stage, fov: 50, alpha: true, tick });
  if (!s3) return null;
  const { scene, camera } = s3;
  camera.position.set(0, 1.5, 12);
  scene.add(new THREE.AmbientLight(0x8090c0, 0.6));
  const moon = new THREE.DirectionalLight(0xc8d4ff, 0.8);
  moon.position.set(-5, 8, 6);
  scene.add(moon);

  // Stars
  const sg = new THREE.BufferGeometry(), sp = new Float32Array(1200 * 3);
  for (let i = 0; i < 1200; i++) sp.set([(Math.random() - 0.5) * 90, Math.random() * 40 - 6, -20 - Math.random() * 30], i * 3);
  sg.setAttribute("position", new THREE.BufferAttribute(sp, 3));
  const starMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.12, transparent: true, opacity: 0.8 });
  scene.add(new THREE.Points(sg, starMat));

  // Water with the lanterns' shimmer
  const water = new THREE.Mesh(new THREE.PlaneGeometry(120, 60), new THREE.MeshStandardMaterial({ color: 0x0c1733, roughness: 0.25, metalness: 0.6 }));
  water.rotation.x = -Math.PI / 2;
  water.position.y = -4.2;
  scene.add(water);

  const halo = tex(128, 128, (g, w) => {
    const grd = g.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2);
    grd.addColorStop(0, "rgba(255,255,255,.9)"); grd.addColorStop(0.25, "rgba(255,255,255,.35)"); grd.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = grd; g.fillRect(0, 0, w, w);
  });
  const starGeo = new THREE.ExtrudeGeometry(starShape(), { depth: 0.12, bevelEnabled: true, bevelSize: 0.02, bevelThickness: 0.02, bevelSegments: 2 });
  starGeo.center();
  const coreGeo = new THREE.ShapeGeometry(starShape(0.22, 0.1));
  const ringGeo = new THREE.TorusGeometry(0.6, 0.018, 8, 48);
  const tailGeo = new THREE.CylinderGeometry(0.008, 0.008, 0.7, 5);
  const tasselGeo = new THREE.SphereGeometry(0.035, 8, 6);
  const gold = new THREE.MeshStandardMaterial({ color: 0xffd27a, emissive: 0x8a5a00, roughness: 0.4 });
  const core = new THREE.MeshBasicMaterial({ color: 0xfff6d8 });

  function makeParol(color) {
    const g = new THREE.Group();
    const mat = new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.85, roughness: 0.5 });
    const body = new THREE.Mesh(starGeo, mat);
    const inner = new THREE.Mesh(coreGeo, core);
    inner.position.z = 0.09;
    const ring = new THREE.Mesh(ringGeo, gold);
    g.add(body, inner, ring);
    [-0.35, 0.35].forEach((x) => {
      const tail = new THREE.Mesh(tailGeo, mat);
      tail.position.set(x * 0.7, -0.62, 0);
      const tassel = new THREE.Mesh(tasselGeo, gold);
      tassel.position.set(x * 0.7, -0.98, 0);
      g.add(tail, tassel);
    });
    const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: halo, color, transparent: true, opacity: 0.75, blending: THREE.AdditiveBlending, depthWrite: false }));
    glow.scale.setScalar(2.6);
    g.add(glow);
    // reflection on the water
    const refl = new THREE.Sprite(new THREE.SpriteMaterial({ map: halo, color, transparent: true, opacity: 0.18, blending: THREE.AdditiveBlending, depthWrite: false }));
    refl.scale.set(1.2, 3, 1);
    scene.add(refl);
    g.traverse((o) => { o.userData.parol = g; });
    return { g, refl, glow };
  }

  const lanterns = [];
  const hash = (i, k) => { const x = Math.sin(i * 127.1 + k * 311.7) * 43758.5453; return x - Math.floor(x); };
  function slot(i) {
    return new THREE.Vector3((hash(i, 1) - 0.5) * 22, 0.2 + hash(i, 2) * 6.2, -1 - hash(i, 3) * 12);
  }
  function add(note, i, fresh) {
    const p = makeParol(COLORS[i % COLORS.length]);
    const home = fresh ? new THREE.Vector3((Math.random() - 0.5) * 4, 2.5 + Math.random() * 1.5, 3.5) : slot(i);
    p.g.position.copy(fresh ? new THREE.Vector3(home.x, -5, home.z + 1) : home);
    p.g.scale.setScalar(0.8 + hash(i, 4) * 0.5);
    scene.add(p.g);
    const L = { ...p, note, home, phase: Math.random() * 6, rise: fresh ? 0 : 1 };
    p.g.userData.lantern = L;
    lanterns.push(L);
    return L;
  }
  function removeOldest() {
    const L = lanterns.shift();
    scene.remove(L.g, L.refl);
  }

  /* Pointer */
  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
  let look = { x: 0, y: 0 }, hovered = null;
  function pick(e) {
    ray.setFromCamera(ndcOf(e, ui.canvas, ndc), camera);
    const objs = lanterns.flatMap((L) => L.g.children.filter((c) => c.isMesh));
    const h = ray.intersectObjects(objs, false)[0];
    return h ? h.object.userData.parol.userData.lantern : null;
  }
  ui.canvas.addEventListener("pointermove", (e) => {
    const r = ui.stage.getBoundingClientRect();
    look = { x: ((e.clientX - r.left) / r.width) * 2 - 1, y: ((e.clientY - r.top) / r.height) * 2 - 1 };
    if (e.pointerType !== "mouse") return;
    hovered = pick(e);
    ui.canvas.style.cursor = hovered ? "pointer" : "default";
    if (hovered) {
      ui.tip.textContent = `${hovered.note.name}'s lantern`;
      ui.tip.style.transform = `translate(${e.clientX - r.left + 14}px, ${e.clientY - r.top + 14}px)`;
      ui.tip.hidden = false;
    } else ui.tip.hidden = true;
  });
  ui.canvas.addEventListener("pointerleave", () => { hovered = null; ui.tip.hidden = true; });
  onTap(ui.canvas, (e) => { const L = pick(e); if (L) showCard(L.note, false); });

  function tick(dt, t) {
    camera.position.x += (look.x * 1.6 - camera.position.x) * Math.min(1, dt * 2);
    camera.position.y += (1.5 - look.y * 0.8 - camera.position.y) * Math.min(1, dt * 2);
    camera.lookAt(0, 2.2, -4);
    starMat.opacity = 0.65 + Math.sin(t * 2) * 0.15;
    lanterns.forEach((L) => {
      const sway = reduce ? 0 : 1;
      if (L.rise < 1) L.rise = Math.min(1, L.rise + dt / (reduce ? 0.01 : 4.5));
      const r = L.rise < 1 ? 1 - Math.pow(1 - L.rise, 3) : 1;
      const x = L.home.x + Math.sin(t * 0.5 + L.phase) * 0.25 * sway;
      const y = L.home.y + Math.sin(t * 0.8 + L.phase) * 0.18 * sway;
      L.g.position.set(x, -5 + (y + 5) * r, L.home.z + (1 - r));
      L.g.rotation.y = Math.sin(t * 0.6 + L.phase) * 0.5 * sway;
      L.g.rotation.z = Math.sin(t * 0.9 + L.phase) * 0.06 * sway;
      const hot = L === hovered ? 1.4 : 1;
      L.glow.material.opacity = (0.6 + Math.sin(t * 3 + L.phase) * 0.12) * hot;
      L.refl.position.set(L.g.position.x, -4.15, L.g.position.z);
      L.refl.material.opacity = 0.12 + Math.sin(t * 2 + L.phase) * 0.05;
    });
  }

  return { add, removeOldest, get count() { return lanterns.length; } };
}

function start() {
  if (!ui.stage) return;
  const sky = build();
  if (!sky) { ui.stage.classList.add("no-webgl"); return; }
  let loaded = false, seen = new Set();

  function sync() {
    const notes = readNotes();
    const status = ui.list.querySelector(".status");
    if (!loaded && !notes.length) {
      if (status) {
        ui.empty.textContent = status.classList.contains("error")
          ? "The lanterns light up when reflections load. Check that Apache and MySQL are running."
          : status.textContent.includes("Loading") ? "Lighting the lanterns…" : "No lanterns yet. Write a reflection below to light the first one.";
        ui.empty.hidden = false;
      }
      return;
    }
    const fresh = notes.filter((n) => !seen.has(n.node));
    if (!loaded) {
      // oldest first, so the newest sit in front
      fresh.slice(0, MAX).reverse().forEach((n, i) => { sky.add(n, i, false); seen.add(n.node); });
      loaded = true;
    } else {
      fresh.forEach((n) => {
        seen.add(n.node);
        if (sky.count >= MAX) sky.removeOldest();
        sky.add(n, sky.count + seen.size, true);
        showCard(n, true);
        ui.stage.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "center" });
      });
    }
    ui.empty.hidden = notes.length > 0;
    ui.count.textContent = `${notes.length} ${notes.length === 1 ? "lantern" : "lanterns"} lit`;
  }
  new MutationObserver(sync).observe(ui.list, { childList: true });
  sync();

  ui.write.addEventListener("click", () => {
    const form = $("reflection-form");
    form.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "center" });
    setTimeout(() => form.elements.name.focus({ preventScroll: true }), reduce ? 0 : 500);
  });
}

start();
