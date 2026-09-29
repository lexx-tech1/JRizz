/* "Chain of Influence": push the first domino and watch one event topple the next,
   from Gomburza (1872) to the Rizal Law (1956). */
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { THREE, reduce, SERIF, SANS, el, tex, wrapText, fontsReady, stage3d, ndcOf, onTap } from "./kit3d.js";

const ERAS = {
  spark: { name: "The spark", color: "#9b3d3d" },
  reform: { name: "Reform by the pen", color: "#26355d" },
  revolution: { name: "Revolution", color: "#b3432f" },
  nation: { name: "The nation", color: "#a8822e" },
};

const CHAIN = [
  { year: "1872", title: "Gomburza executed", era: "spark",
    text: "Three Filipino priests, Gomez, Burgos and Zamora, are executed after the Cavite mutiny. Rizal is ten. He later dedicates El Filibusterismo to their memory.",
    push: "The injustice stays with a generation of young Filipinos, Rizal among them." },
  { year: "1887", title: "Noli Me Tangere", era: "reform",
    text: "Rizal's first novel holds up a mirror to colonial abuse. It is banned, and copies pass from hand to hand.",
    push: "Readers in different islands recognise the same wrongs, and a shared grievance begins to form." },
  { year: "1889", title: "La Solidaridad", era: "reform",
    text: "From Spain, the Propaganda Movement campaigns in print for equal rights, representation and free speech. Rizal is one of its leading writers.",
    push: "Reform ideas reach the educated at home, but Spain does not listen." },
  { year: "1891", title: "El Filibusterismo", era: "reform",
    text: "A darker novel that imagines revolution and asks what it would cost.",
    push: "The question of revolution is now spoken aloud." },
  { year: "1892", title: "La Liga Filipina", era: "reform",
    text: "Back in Manila, Rizal calls on Filipinos across the islands to act as one body. He is arrested days later and exiled to Dapitan.",
    push: "With Rizal gone and peaceful reform blocked, some members turn to secret action." },
  { year: "1892", title: "The Katipunan", era: "revolution",
    text: "On 7 July 1892, Andrés Bonifacio founds a secret society for independence. Its members read Rizal's novels, and accounts say his name was a password for its highest rank.",
    push: "The movement grows from a few members to thousands." },
  { year: "1896", title: "Revolution and martyrdom", era: "revolution",
    text: "The Katipunan rises in August. Rizal, who did not lead it, is tried for rebellion and executed on 30 December.",
    push: "His death turns a reformer into a martyr and hardens the revolutionaries' resolve." },
  { year: "1898", title: "Independence declared", era: "nation",
    text: "On 12 June 1898, independence is proclaimed in Kawit, Cavite, under a new flag with a sun and three stars.",
    push: "Filipinos now have a flag, a name and a nation to defend." },
  { year: "1956", title: "The Rizal Law", era: "nation",
    text: "Republic Act 1425 requires Filipino college students to study Rizal's life and works, including his two novels.",
    push: "The chain reaches today's classrooms, and you." },
];

const $ = (id) => document.getElementById(id);
const ui = {
  stage: $("chain-stage"), canvas: $("chain-canvas"), card: $("chain-card"), list: $("chain-list"),
  push: $("chain-push"), step: $("chain-step"), reset: $("chain-reset"), slow: $("chain-slow"), meter: $("chain-meter"),
};

/* ─── Card + list ─────────────────────────────────────────────────────── */
let api = null;
function showCard(i, reason) {
  const c = CHAIN[i], era = ERAS[c.era];
  const kicker = el("p", "chain-kicker");
  const tag = el("span", "chain-era", era.name);
  tag.style.setProperty("--era", era.color);
  kicker.append(tag, document.createTextNode(` · Domino ${i + 1} of ${CHAIN.length}`));
  const nodes = [kicker, el("h3", "chain-title", `${c.year} · ${c.title}`), el("p", "chain-text", c.text)];
  const next = el("p", "chain-next");
  next.append(el("span", null, i < CHAIN.length - 1 ? "Which knocks over… " : "Where it leads… "), document.createTextNode(c.push));
  nodes.push(next);
  if (reason) nodes.unshift(el("p", "chain-reason", reason));
  ui.card.replaceChildren(...nodes);
  [...ui.list.children].forEach((b, k) => b.setAttribute("aria-current", String(k === i)));
}

function buildList() {
  CHAIN.forEach((c, i) => {
    const b = el("button", "chain-item");
    b.type = "button";
    b.style.setProperty("--era", ERAS[c.era].color);
    b.append(el("span", "chain-item-year", c.year), el("span", "chain-item-title", c.title));
    b.addEventListener("click", () => { showCard(i); api?.focus(i); });
    ui.list.append(b);
  });
  showCard(0, "Push the first domino to start the chain, or go one at a time.");
}

/* ─── Scene ───────────────────────────────────────────────────────────── */
const H = 1.9, W = 1.0, D = 0.24;

function faceTexture(c, i) {
  const era = ERAS[c.era];
  return tex(512, 1024, (g, w, h) => {
    g.fillStyle = "#f5efe2"; g.fillRect(0, 0, w, h);
    for (let k = 0; k < 2500; k++) { g.fillStyle = `rgba(0,0,0,${Math.random() * 0.04})`; g.fillRect(Math.random() * w, Math.random() * h, 2, 2); }
    g.fillStyle = era.color; g.fillRect(0, 0, w, 150);
    g.fillStyle = "#f5efe2"; g.textAlign = "center";
    g.font = `500 30px ${SANS}`; g.fillText(era.name.toUpperCase(), w / 2, 92);
    g.fillStyle = "#1b1b19";
    g.font = `400 150px ${SERIF}`; g.fillText(c.year, w / 2, 360);
    g.fillStyle = era.color; g.fillRect(w / 2 - 60, 410, 120, 4);
    g.fillStyle = "#1b1b19"; g.font = `500 66px ${SERIF}`;
    wrapText(g, c.title, w / 2, 520, w - 70, 72);
    g.fillStyle = "#66625a"; g.font = `400 34px ${SANS}`; g.fillText(`${i + 1} / ${CHAIN.length}`, w / 2, h - 70);
    g.strokeStyle = era.color; g.lineWidth = 10; g.strokeRect(5, 5, w - 10, h - 10);
  });
}

function build() {
  const s3 = stage3d({ canvas: ui.canvas, host: ui.stage, fov: 40, tick });
  if (!s3) return null;
  const { scene, camera, renderer } = s3;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  scene.background = new THREE.Color(0x221d18);
  scene.fog = new THREE.Fog(0x221d18, 22, 42);
  scene.environment = new THREE.PMREMGenerator(renderer).fromScene(new RoomEnvironment(), 0.04).texture;

  scene.add(new THREE.HemisphereLight(0xfff1dc, 0x2a1d12, 0.5));
  const key = new THREE.DirectionalLight(0xfff0d8, 1.8);
  key.position.set(-6, 12, 8);
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  Object.assign(key.shadow.camera, { left: -10, right: 10, top: 8, bottom: -8, near: 1, far: 40 });
  key.shadow.bias = -0.0004;
  scene.add(key);

  // Table
  const wood = tex(1024, 512, (g, w, h) => {
    g.fillStyle = "#5c3b24"; g.fillRect(0, 0, w, h);
    for (let y = 0; y < h; y += 2) { g.fillStyle = `rgba(${Math.random() < 0.5 ? "0,0,0" : "255,220,180"},${Math.random() * 0.06})`; g.fillRect(0, y, w, 2); }
    for (let k = 0; k < 40; k++) { g.strokeStyle = "rgba(30,15,5,.18)"; g.beginPath(); const y = Math.random() * h; g.moveTo(0, y); g.bezierCurveTo(w * 0.3, y + 20, w * 0.6, y - 20, w, y + 10); g.stroke(); }
  });
  const table = new THREE.Mesh(new THREE.BoxGeometry(22, 0.5, 11), new THREE.MeshStandardMaterial({ map: wood, roughness: 0.55 }));
  table.position.y = -0.25;
  table.receiveShadow = true;
  scene.add(table);
  // A sheet of paper under the chain, with the route inked on it
  const path = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-8.2, 0, 1.6), new THREE.Vector3(-4.5, 0, -1.4), new THREE.Vector3(0, 0, 1.2),
    new THREE.Vector3(4.5, 0, -1.4), new THREE.Vector3(8.2, 0, 1.0),
  ]);
  const inkLine = new THREE.Mesh(new THREE.TubeGeometry(path, 200, 0.03, 6), new THREE.MeshStandardMaterial({ color: 0x26355d, roughness: 0.4 }));
  inkLine.scale.y = 0.05;
  scene.add(inkLine);

  // Dominoes
  const dominoes = CHAIN.map((c, i) => {
    const u = 0.03 + (i * 0.94) / (CHAIN.length - 1);
    const pos = path.getPointAt(u), tan = path.getTangentAt(u);
    const face = new THREE.MeshStandardMaterial({ map: faceTexture(c, i), roughness: 0.35 });
    const side = new THREE.MeshStandardMaterial({ color: 0xece4d2, roughness: 0.35 });
    const top = new THREE.MeshStandardMaterial({ color: ERAS[c.era].color, roughness: 0.4 });
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(W, H, D), [side, side, top, side, face, face]);
    mesh.position.set(0, H / 2, -D / 2);
    mesh.castShadow = mesh.receiveShadow = true;
    mesh.userData.idx = i;
    const pivot = new THREE.Group();
    pivot.add(mesh);
    const holder = new THREE.Group();
    holder.position.copy(pos);
    holder.lookAt(pos.clone().add(tan));
    holder.add(pivot);
    // pivot sits on the front bottom edge
    pivot.position.z = D / 2;
    scene.add(holder);
    return { holder, pivot, mesh, a: 0, w: 0, falling: false, pos };
  });
  // contact angle: where a domino's top meets the next one
  dominoes.forEach((d, i) => {
    const n = dominoes[i + 1];
    d.gap = n ? d.pos.distanceTo(n.pos) : 99;
    d.contact = n ? Math.asin(Math.min(1, (d.gap - D) / H)) : Math.PI / 2;
  });
  const REST = Math.PI / 2 - 0.06;

  // Dust puffs on impact
  const PUFF = 240;
  const puffGeo = new THREE.BufferGeometry();
  puffGeo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(PUFF * 3).fill(999), 3));
  const puffMat = new THREE.PointsMaterial({ color: 0xffe3b0, size: 0.07, transparent: true, opacity: 0.8, depthWrite: false });
  const puffs = new THREE.Points(puffGeo, puffMat);
  puffs.frustumCulled = false;
  scene.add(puffs);
  const bits = [];
  function puff(at) {
    for (let k = 0; k < 24; k++) {
      const a = Math.random() * Math.PI * 2, s = 0.6 + Math.random() * 1.6;
      bits.push({ p: at.clone(), v: new THREE.Vector3(Math.cos(a) * s, 1 + Math.random() * 1.8, Math.sin(a) * s), life: 0 });
    }
    while (bits.length > PUFF) bits.shift();
  }

  /* Camera */
  const controls = new OrbitControls(camera, ui.canvas);
  controls.enableDamping = true;
  controls.enablePan = false;
  controls.enableZoom = false;
  controls.minPolarAngle = 0.3;
  controls.maxPolarAngle = 1.35;
  const HOME = { pos: new THREE.Vector3(-3.5, 9.5, 15.5), target: new THREE.Vector3(0, 0.6, 0) };
  camera.position.copy(HOME.pos);
  controls.target.copy(HOME.target);
  let follow = null, shake = 0;
  let portrait = null;
  s3.onResize = (w, h) => {
    const a = w / h;
    camera.fov = a < 1 ? 60 : a < 1.4 ? 56 : 40;
    camera.updateProjectionMatrix();
    // On tall screens, look down the chain from its starting end so every domino fits
    if (portrait !== a < 1) {
      portrait = a < 1;
      HOME.pos.copy(portrait ? new THREE.Vector3(-15, 9, 7) : new THREE.Vector3(-3.5, 9.5, 15.5));
      if (follow === null) { camera.position.copy(HOME.pos); controls.target.copy(HOME.target); }
    }
  };
  s3.onResize(s3.width, s3.height);

  /* Physics-lite: gravity tips each domino; it stops when it meets the next one. */
  let mode = "idle", pushed = -1, resetT = 0;
  function knock(i, speed) {
    const d = dominoes[i];
    if (!d || d.falling) return;
    d.falling = true;
    d.w = Math.max(d.w, speed);
    pushed = Math.max(pushed, i);
    follow = i;
    showCard(i);
    updateMeter();
  }

  function updateMeter() {
    const n = dominoes.filter((d) => d.falling).length;
    ui.meter.style.setProperty("--p", n / CHAIN.length);
    ui.meter.querySelector("span").textContent = n ? `Influence reached ${CHAIN[n - 1].year}` : "Standing";
  }

  function tick(dt) {
    const slow = ui.slow.checked ? 0.35 : 1;
    const h = dt * slow;
    if (mode === "reset") {
      resetT += dt / (reduce ? 0.01 : 0.9);
      dominoes.forEach((d) => { d.a *= Math.max(0, 1 - resetT); d.pivot.rotation.x = d.a; });
      if (resetT >= 1) {
        dominoes.forEach((d) => { d.a = 0; d.w = 0; d.falling = false; d.pivot.rotation.x = 0; });
        mode = "idle"; pushed = -1; follow = null; updateMeter(); syncButtons();
      }
    } else {
      dominoes.forEach((d, i) => {
        if (!d.falling && d.a === 0) return;
        const n = dominoes[i + 1];
        // how far can it lean? more as the next one falls away
        const limit = n ? d.contact + (REST - d.contact) * Math.min(1, n.a / (REST * 0.85)) : REST;
        d.w += 9 * Math.sin(d.a + 0.08) * h;
        d.a += d.w * h;
        if (d.a >= limit) {
          if (n && !n.falling && d.w > 0.4) {
            puff(n.pos.clone().setY(H * 0.9));
            shake = 0.06;
            if (mode === "cascade") knock(i + 1, d.w * 0.7);
            else n.w = 0; // one-at-a-time: it just leans
          }
          d.a = limit;
          d.w = 0;
        }
        d.pivot.rotation.x = d.a;
      });
      if ((mode === "cascade" || mode === "step") && dominoes.every((d) => d.falling && d.w === 0)) {
        if (mode === "cascade" || pushed === CHAIN.length - 1) { mode = "done"; syncButtons(); showDone(); }
      }
      if (mode === "step" && dominoes[pushed] && dominoes[pushed].w === 0 && !stepReady) { stepReady = true; syncButtons(); }
    }

    // follow the falling domino
    if (follow !== null) {
      const p = dominoes[follow].pos, goal = new THREE.Vector3(p.x * 0.8, 0.6, p.z * 0.5);
      const delta = goal.sub(controls.target).multiplyScalar(Math.min(1, dt * 2.2));
      controls.target.add(delta);
      camera.position.add(delta);
    }
    if (shake > 0) { camera.position.y += (Math.random() - 0.5) * shake; shake = Math.max(0, shake - dt * 0.4); }
    controls.update();

    // puffs
    const arr = puffGeo.attributes.position.array;
    bits.forEach((b, k) => {
      b.life += dt; b.v.y -= 4 * dt; b.p.addScaledVector(b.v, dt);
      arr.set(b.life < 1.1 ? [b.p.x, Math.max(0.02, b.p.y), b.p.z] : [999, 999, 999], k * 3);
    });
    puffGeo.attributes.position.needsUpdate = true;
  }

  let stepReady = true;
  function syncButtons() {
    const idle = mode === "idle";
    ui.push.hidden = !idle;
    ui.step.hidden = !(idle || mode === "step");
    ui.step.disabled = mode === "step" && !stepReady;
    ui.step.textContent = idle ? "One at a time" : `Push domino ${Math.min(pushed + 2, CHAIN.length)}`;
    ui.reset.hidden = idle;
  }

  function showDone() {
    const sum = el("p", "chain-reason", "Every domino has fallen. Rizal did not lead the revolution, but each of his works pushed the next event forward. Click any domino to read it again.");
    ui.card.prepend(sum);
  }

  const out = {
    cascade() { if (mode !== "idle") return; mode = "cascade"; knock(0, 1.3); syncButtons(); },
    step() {
      if (mode === "idle") { mode = "step"; stepReady = false; knock(0, 1.3); syncButtons(); return; }
      if (mode !== "step" || !stepReady) return;
      const i = pushed + 1;
      if (i >= CHAIN.length) return;
      stepReady = false;
      knock(i, 1.3);
      syncButtons();
    },
    reset() { mode = "reset"; resetT = 0; follow = null; syncButtons(); showCard(0, "Push the first domino to start the chain, or go one at a time."); },
    focus(i) { follow = i; },
  };

  // Click a domino: push it if it is next in line, otherwise read it
  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2(), meshes = dominoes.map((d) => d.mesh);
  onTap(ui.canvas, (e) => {
    ray.setFromCamera(ndcOf(e, ui.canvas, ndc), camera);
    const hit = ray.intersectObjects(meshes, false)[0];
    if (!hit) return;
    const i = hit.object.userData.idx;
    if (mode === "idle" && i === 0) out.cascade();
    else if (mode === "step" && i === pushed + 1 && stepReady) out.step();
    else { showCard(i); out.focus(i); }
  });
  ui.canvas.addEventListener("pointermove", (e) => {
    if (e.pointerType !== "mouse") return;
    ray.setFromCamera(ndcOf(e, ui.canvas, ndc), camera);
    ui.canvas.style.cursor = ray.intersectObjects(meshes, false).length ? "pointer" : "grab";
  });

  syncButtons();
  updateMeter();
  return out;
}

async function start() {
  if (!ui.stage) return;
  buildList();
  await fontsReady();
  api = build();
  $("chain-loading")?.remove();
  if (!api) {
    ui.stage.classList.add("no-webgl");
    [ui.push, ui.step].forEach((b) => { b.hidden = true; });
    return;
  }
  ui.push.addEventListener("click", () => api.cascade());
  ui.step.addEventListener("click", () => api.step());
  ui.reset.addEventListener("click", () => api.reset());
}

start();
