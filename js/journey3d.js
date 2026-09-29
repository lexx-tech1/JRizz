/* "The Journey": a globe you can spin. Pins mark where Rizal lived and wrote;
   press Play and a steamship sails his route while each stop explains what it added to the nation. */
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { THREE, reduce, SERIF, el, tex, stage3d, ndcOf, onTap, ease } from "./kit3d.js";

const IMG = "https://cdn.jsdelivr.net/npm/three-globe@2.31.0/example/img/";
const STOPS = [
  { place: "Calamba", year: "1861", lat: 14.21, lon: 121.17,
    what: "Born on 19 June 1861 in Calamba, Laguna. His family farmed land leased from a Dominican estate.",
    why: "Years later, a dispute over that estate ended with his family evicted: a personal lesson in how colonial power worked." },
  { place: "Manila", year: "1872", lat: 14.59, lon: 120.98,
    what: "Studies at the Ateneo Municipal, then the University of Santo Tomás. The same year, the priests Gomez, Burgos and Zamora are executed.",
    why: "He grew up in the shadow of 1872, when a Filipino who asked for fairness could pay with his life." },
  { place: "Madrid", year: "1882", lat: 40.42, lon: -3.7,
    what: "Studies medicine and philosophy and letters, and joins Filipino students calling for reform.",
    why: "Abroad, students from different provinces met as Filipinos, the start of a shared identity." },
  { place: "Paris", year: "1885", lat: 48.86, lon: 2.35,
    what: "Trains in ophthalmology under Dr Louis de Wecker. In 1890 his annotated Morga is published here.",
    why: "Europe gave him the freedom and the presses to publish what could never be printed in Manila." },
  { place: "Heidelberg", year: "1886", lat: 49.4, lon: 8.67,
    what: "Works in an eye clinic, finishes much of the Noli, and writes the poem “A las flores de Heidelberg”.",
    why: "Homesick in Germany, he wrote of his country as a homeland worth loving." },
  { place: "Berlin", year: "1887", lat: 52.52, lon: 13.4,
    what: "Noli Me Tangere is printed, paid for with money lent by his friend Máximo Viola.",
    why: "Its 2,000 copies became the most dangerous book in the colony." },
  { place: "London", year: "1888", lat: 51.51, lon: -0.13,
    what: "Copies Antonio de Morga's 1609 history in the British Museum and adds his own notes.",
    why: "He gave Filipinos a past older than Spanish rule, and with it a reason for pride." },
  { place: "Ghent", year: "1891", lat: 51.05, lon: 3.72,
    what: "El Filibusterismo is printed. Short of money, he pawns his jewels to pay the printer.",
    why: "The sequel spoke to a generation that was losing faith in peaceful reform." },
  { place: "Hong Kong", year: "1891", lat: 22.32, lon: 114.17,
    what: "Practises as an eye doctor and drafts the constitution of La Liga Filipina.",
    why: "From close by, he prepared to bring the movement home." },
  { place: "Dapitan", year: "1892", lat: 8.66, lon: 123.42,
    what: "Exiled for four years. He runs a clinic, teaches boys and helps build the town's waterworks.",
    why: "Even in exile he showed what one citizen could build for a community." },
  { place: "Bagumbayan", year: "1896", lat: 14.58, lon: 120.98,
    what: "Executed by firing squad on 30 December 1896, aged 35.",
    why: "His death made him the symbol of the nation he had helped imagine." },
];

const $ = (id) => document.getElementById(id);
const ui = { stage: $("journey-stage"), canvas: $("journey-canvas"), card: $("journey-card"), list: $("journey-list"), play: $("journey-play"), tip: $("journey-tip") };
const R = 2;

function latLon(lat, lon, r = R) {
  const phi = (90 - lat) * THREE.MathUtils.DEG2RAD, theta = (lon + 180) * THREE.MathUtils.DEG2RAD;
  return new THREE.Vector3(-r * Math.sin(phi) * Math.cos(theta), r * Math.cos(phi), r * Math.sin(phi) * Math.sin(theta));
}

let api = null, current = -1;

function showCard(i) {
  current = i;
  const s = STOPS[i];
  const nav = el("div", "journey-nav");
  const prev = el("button", "btn btn-ghost", "Previous"), next = el("button", "btn", "Next stop");
  prev.type = next.type = "button";
  prev.disabled = i === 0; next.disabled = i === STOPS.length - 1;
  prev.addEventListener("click", () => select(i - 1));
  next.addEventListener("click", () => select(i + 1));
  nav.append(prev, next);
  const why = el("p", "journey-why");
  why.append(el("span", null, "For the nation: "), document.createTextNode(s.why));
  ui.card.replaceChildren(
    el("p", "journey-kicker", `Stop ${i + 1} of ${STOPS.length} · ${s.year}`),
    el("h3", "journey-title", s.place), el("p", "journey-what", s.what), why, nav
  );
  ui.card.hidden = false;
  [...ui.list.children].forEach((li, k) => li.firstChild.setAttribute("aria-current", String(k === i)));
}

function select(i) {
  api?.stopPlay();
  showCard(i);
  api?.focus(i);
}

function buildList() {
  ui.list.replaceChildren(...STOPS.map((s, i) => {
    const li = el("li");
    li.style.setProperty("--i", i);
    const b = el("button", "journey-stop");
    b.type = "button";
    b.append(el("span", "stop-year", s.year), el("strong", null, s.place));
    b.addEventListener("click", () => select(i));
    li.append(b);
    return li;
  }));
}

function build() {
  const s3 = stage3d({ canvas: ui.canvas, host: ui.stage, fov: 38, alpha: true, tick });
  if (!s3) return null;
  const { scene, camera, renderer } = s3;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;

  scene.add(new THREE.AmbientLight(0xffffff, 0.55));
  const sun = new THREE.DirectionalLight(0xfff4e0, 2.4);
  scene.add(sun);

  // Globe: a parchment grid until the photo arrives
  const fallback = tex(1024, 512, (g, w, h) => {
    g.fillStyle = "#23406b"; g.fillRect(0, 0, w, h);
    g.strokeStyle = "rgba(255,255,255,.12)";
    for (let x = 0; x <= w; x += w / 24) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); }
    for (let y = 0; y <= h; y += h / 12) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); }
  });
  const globeMat = new THREE.MeshPhongMaterial({ map: fallback, shininess: 8, specular: 0x222222 });
  const globe = new THREE.Mesh(new THREE.SphereGeometry(R, 96, 64), globeMat);
  scene.add(globe);
  const loader = new THREE.TextureLoader();
  loader.setCrossOrigin("anonymous");
  loader.load(IMG + "earth-blue-marble.jpg", (t) => {
    t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
    globeMat.map = t; globeMat.needsUpdate = true;
  });
  loader.load(IMG + "earth-topology.png", (t) => { globeMat.bumpMap = t; globeMat.bumpScale = 6; globeMat.needsUpdate = true; });

  // Atmosphere glow
  const atmo = new THREE.Mesh(new THREE.SphereGeometry(R * 1.12, 64, 32), new THREE.ShaderMaterial({
    vertexShader: "varying vec3 vN; varying vec3 vV; void main(){ vN = normalize(normalMatrix*normal); vec4 mv = modelViewMatrix*vec4(position,1.); vV = normalize(-mv.xyz); gl_Position = projectionMatrix*mv; }",
    fragmentShader: "varying vec3 vN; varying vec3 vV; void main(){ float f = pow(1. - abs(dot(vN, vV)), 3.); gl_FragColor = vec4(0.55,0.72,1.0, f*0.9); }",
    side: THREE.BackSide, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false,
  }));
  scene.add(atmo);

  // Stars
  const sg = new THREE.BufferGeometry(), sp = new Float32Array(1500 * 3);
  for (let i = 0; i < 1500; i++) { const v = new THREE.Vector3().randomDirection().multiplyScalar(60 + Math.random() * 40); sp.set([v.x, v.y, v.z], i * 3); }
  sg.setAttribute("position", new THREE.BufferAttribute(sp, 3));
  scene.add(new THREE.Points(sg, new THREE.PointsMaterial({ color: 0xcfd8ff, size: 0.25, sizeAttenuation: true, transparent: true, opacity: 0.8 })));

  // Pins
  const pinMat = new THREE.MeshStandardMaterial({ color: 0xffcf5a, emissive: 0x7a5200, roughness: 0.3, metalness: 0.4 });
  const pinOn = new THREE.MeshStandardMaterial({ color: 0xff6a4d, emissive: 0x991e0e, roughness: 0.3 });
  const pins = STOPS.map((s, i) => {
    const g = new THREE.Group(), n = latLon(s.lat, s.lon).normalize();
    g.position.copy(n.clone().multiplyScalar(R));
    g.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), n);
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.14, 6), pinMat);
    stem.position.y = 0.07;
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.028, 16, 12), pinMat);
    head.position.y = 0.15;
    const hit = new THREE.Mesh(new THREE.SphereGeometry(0.07, 8, 6), new THREE.MeshBasicMaterial({ visible: false }));
    hit.position.y = 0.12;
    hit.userData.idx = i;
    g.add(stem, head, hit);
    globe.add(g);
    return { g, head, hit, n };
  });
  const ring = new THREE.Mesh(new THREE.RingGeometry(0.05, 0.065, 40), new THREE.MeshBasicMaterial({ color: 0xff6a4d, transparent: true, side: THREE.DoubleSide, depthWrite: false }));
  globe.add(ring);

  // Label for the active stop
  const labelCanvas = document.createElement("canvas");
  labelCanvas.width = 512; labelCanvas.height = 128;
  const labelTex = new THREE.CanvasTexture(labelCanvas);
  labelTex.colorSpace = THREE.SRGBColorSpace;
  const label = new THREE.Sprite(new THREE.SpriteMaterial({ map: labelTex, depthTest: false, transparent: true }));
  label.scale.set(0.9, 0.225, 1);
  label.renderOrder = 5;
  globe.add(label);
  function setLabel(i) {
    const g = labelCanvas.getContext("2d"), s = STOPS[i];
    g.clearRect(0, 0, 512, 128);
    g.font = `500 54px ${SERIF}`;
    const w = g.measureText(s.place).width + 150;
    g.fillStyle = "rgba(246,244,238,.95)"; g.fillRect(256 - w / 2, 24, w, 80);
    g.fillStyle = "#1b1b19"; g.textAlign = "center"; g.textBaseline = "middle";
    g.fillText(`${s.place} · ${s.year}`, 256, 66);
    labelTex.needsUpdate = true;
    label.position.copy(pins[i].n.clone().multiplyScalar(R + 0.2));
  }

  // Route: faint ink + a bright wake that grows as the ship sails
  const legs = [];
  for (let k = 0; k < STOPS.length - 1; k++) {
    const a = latLon(STOPS[k].lat, STOPS[k].lon), b = latLon(STOPS[k + 1].lat, STOPS[k + 1].lon);
    const dist = a.distanceTo(b);
    const mid = a.clone().add(b).normalize().multiplyScalar(R * (1.02 + dist * 0.16));
    const curve = new THREE.QuadraticBezierCurve3(a, mid, b);
    globe.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 64, 0.006, 6), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.35 })));
    const wake = new THREE.Mesh(new THREE.TubeGeometry(curve, 64, 0.012, 6), new THREE.MeshBasicMaterial({ color: 0xffcf5a }));
    wake.geometry.setDrawRange(0, 0);
    globe.add(wake);
    legs.push({ curve, wake, dur: Math.min(3.6, Math.max(1.2, dist * 0.9)) });
  }

  // Steamship
  const ship = new THREE.Group();
  const hull = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.03, 0.16), new THREE.MeshStandardMaterial({ color: 0x1b1b19, roughness: 0.5 }));
  const deck = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.025, 0.07), new THREE.MeshStandardMaterial({ color: 0xf6f4ee }));
  deck.position.y = 0.025;
  const funnel = new THREE.Mesh(new THREE.CylinderGeometry(0.009, 0.011, 0.05, 10), new THREE.MeshStandardMaterial({ color: 0x9b3d3d }));
  funnel.position.y = 0.05;
  ship.add(hull, deck, funnel);
  const smoke = [];
  for (let k = 0; k < 6; k++) {
    const puff = new THREE.Mesh(new THREE.SphereGeometry(0.012, 8, 6), new THREE.MeshBasicMaterial({ color: 0xdddddd, transparent: true, opacity: 0.6 }));
    ship.add(puff);
    smoke.push(puff);
  }
  ship.visible = false;
  globe.add(ship);

  /* Camera */
  const controls = new OrbitControls(camera, ui.canvas);
  controls.enableDamping = true;
  controls.enablePan = false;
  controls.enableZoom = false;
  controls.rotateSpeed = 0.5;
  const startDir = latLon(30, 60).normalize();
  let dist = 7.2;
  camera.position.copy(startDir.clone().multiplyScalar(dist));
  let tween = null, autoSpin = !reduce, playing = null;

  function lookAtDir(dir, d, dur = 1400) {
    tween = { from: camera.position.clone().normalize(), to: dir.clone().normalize(), d0: camera.position.length(), d1: d, start: performance.now(), dur: reduce ? 1 : dur };
  }
  s3.onResize = (w) => { dist = w < 700 ? 9 : 7.2; };
  s3.onResize(s3.width);
  controls.addEventListener("start", () => { autoSpin = false; tween = null; });

  /* Hover + click */
  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2(), hits = pins.map((p) => p.hit);
  function pick(e) {
    ray.setFromCamera(ndcOf(e, ui.canvas, ndc), camera);
    const h = ray.intersectObjects([globe, ...hits], false)[0];
    return h && h.object !== globe ? h.object.userData.idx : -1;
  }
  onTap(ui.canvas, (e) => { const i = pick(e); if (i >= 0) select(i); });
  ui.canvas.addEventListener("pointermove", (e) => {
    if (e.pointerType !== "mouse") return;
    const i = pick(e);
    ui.canvas.style.cursor = i >= 0 ? "pointer" : "grab";
    if (i >= 0) {
      const r = ui.stage.getBoundingClientRect();
      ui.tip.textContent = `${STOPS[i].place} · ${STOPS[i].year}`;
      ui.tip.style.transform = `translate(${e.clientX - r.left + 14}px, ${e.clientY - r.top + 14}px)`;
      ui.tip.hidden = false;
    } else ui.tip.hidden = true;
  });
  ui.canvas.addEventListener("pointerleave", () => { ui.tip.hidden = true; });

  const tmp = new THREE.Vector3();
  function placeShip(leg, t) {
    const c = legs[leg].curve, p = c.getPoint(t), ahead = c.getPoint(Math.min(1, t + 0.01));
    ship.position.copy(p);
    ship.up.copy(p).normalize();
    ship.lookAt(tmp.copy(ahead).applyMatrix4(globe.matrixWorld));
  }

  function tick(dt, t) {
    const now = performance.now();
    if (tween) {
      const k = Math.min(1, (now - tween.start) / tween.dur), e = ease(k);
      const dir = tween.from.clone().lerp(tween.to, e).normalize();
      camera.position.copy(dir.multiplyScalar(tween.d0 + (tween.d1 - tween.d0) * e + Math.sin(Math.PI * e) * 0.8));
      if (k >= 1) tween = null;
    } else if (autoSpin) {
      camera.position.applyAxisAngle(new THREE.Vector3(0, 1, 0), dt * 0.12);
    }
    controls.update();
    sun.position.copy(camera.position).add(new THREE.Vector3(3, 4, 0));

    // active pin
    pins.forEach((p, i) => { p.head.material = i === current ? pinOn : pinMat; });
    if (current >= 0) {
      const n = pins[current].n, pulse = (t * 0.8) % 1;
      ring.visible = true;
      ring.position.copy(n.clone().multiplyScalar(R + 0.004));
      ring.lookAt(n.clone().multiplyScalar(R * 2));
      ring.scale.setScalar(1 + pulse * 2.5);
      ring.material.opacity = 1 - pulse;
      label.visible = true;
    } else { ring.visible = false; label.visible = false; }

    // voyage
    if (playing) {
      const L = legs[playing.leg];
      if (playing.wait > 0) {
        playing.wait -= dt;
        if (playing.wait <= 0) {
          if (playing.leg >= legs.length - 1) { out.stopPlay(); }
          else { playing.leg += 1; playing.t = 0; }
        }
      } else {
        playing.t = Math.min(1, playing.t + dt / L.dur);
        placeShip(playing.leg, playing.t);
        L.wake.geometry.setDrawRange(0, Math.floor(L.wake.geometry.index.count * playing.t / 6) * 6);
        const dir = tmp.copy(ship.position).normalize();
        const want = dir.clone().multiplyScalar(playing.d);
        camera.position.lerp(want, Math.min(1, dt * 2.5));
        if (playing.t >= 1) {
          const i = playing.leg + 1;
          showCard(i); setLabel(i);
          playing.wait = 3.2;
        }
      }
      smoke.forEach((s, k) => {
        const age = (t * 0.9 + k / smoke.length) % 1;
        s.position.set(0, 0.07 + age * 0.08, -0.02 - age * 0.06);
        s.scale.setScalar(0.6 + age * 1.6);
        s.material.opacity = 0.6 * (1 - age);
      });
    }
  }

  const out = {
    focus(i) {
      autoSpin = false;
      setLabel(i);
      const n = pins[i].n.clone();
      lookAtDir(n.add(new THREE.Vector3(0, 0.25, 0)), dist * 0.72);
    },
    play() {
      autoSpin = false; tween = null;
      legs.forEach((l) => l.wake.geometry.setDrawRange(0, 0));
      playing = { leg: 0, t: 0, wait: 2.4, d: dist * 0.78 };
      ship.visible = true;
      placeShip(0, 0);
      showCard(0); setLabel(0);
      lookAtDir(pins[0].n.clone().add(new THREE.Vector3(0, 0.25, 0)), dist * 0.78, 900);
      ui.play.textContent = "Stop the voyage";
    },
    stopPlay() {
      if (!playing) return;
      playing = null;
      ui.play.textContent = "Play the voyage";
    },
    get playing() { return !!playing; },
  };
  return out;
}

function start() {
  if (!ui.stage) return;
  buildList();
  const go = () => {
    api = build();
    $("journey-loading")?.remove();
    if (!api) { ui.stage.classList.add("no-webgl"); ui.play.hidden = true; return; }
    ui.play.addEventListener("click", () => (api.playing ? api.stopPlay() : api.play()));
  };
  // Build when the globe is about to scroll into view (the Earth photo is 1.4 MB)
  const io = new IntersectionObserver(([en]) => { if (en.isIntersecting) { io.disconnect(); go(); } }, { rootMargin: "600px 0px" });
  io.observe(ui.stage);
}

start();
