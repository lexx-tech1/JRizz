/* The 3D Gallery: a small rotunda of Rizal's life.
   Drag to look around, click an artifact to study it, answer its question to earn a stamp.
   Uses Three.js from a CDN (see the importmap in index.html). Works without the PHP API. */
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

/* ─── Content ─────────────────────────────────────────────────────────── */
// The last entry is the monument in the middle of the room; the rest stand on pedestals.
const EXHIBITS = [
  { id: "lamp", kind: "lamp", title: "The Moth and the Lamp", when: "1860s", place: "Calamba, Laguna",
    what: "José Rizal was born in Calamba, Laguna, on 19 June 1861. His mother, Teodora Alonso, taught him to read and once read him the story of a young moth that flew too close to a lamp's flame.",
    why: "Rizal later wrote that the story stayed with him: the moth died, but for the light. It is often read as an early picture of the sacrifice he would make for his country.",
    fact: "He was the seventh of eleven children in the Mercado-Rizal family.",
    q: { text: "Where was Rizal born?", options: ["Dapitan, Zamboanga", "Calamba, Laguna", "Intramuros, Manila"], answer: 1,
      explain: "Calamba, Laguna, on 19 June 1861. Dapitan is where he was exiled thirty years later." } },

  { id: "globe", kind: "globe", title: "The Traveler", when: "1882–1892", place: "Europe and Asia",
    what: "In May 1882 Rizal sailed for Spain to continue his medical studies. Over the next ten years he lived and worked in Madrid, Paris, Heidelberg, Berlin, London, Ghent and Hong Kong. The gold line on the globe traces his route.",
    why: "Abroad he could write freely and work with other Filipino reformists. Seeing how other nations governed themselves sharpened his case that Filipinos deserved the same rights.",
    fact: "He trained as an eye doctor in Paris and Heidelberg. His mother's eyesight was failing.",
    q: { text: "Why did Rizal first leave for Spain in 1882?", options: ["To continue his medical studies", "To join the Spanish army", "To become a priest"], answer: 0,
      explain: "He went to finish his medical studies in Madrid, and joined the circle of Filipino reformists there." } },

  { id: "noli", kind: "book", title: "Noli Me Tangere", when: "1887", place: "Berlin",
    cover: { color: "#7a2a22", gold: "#d9bd7c", sub: "Novela tagala" },
    what: "Rizal's first novel follows Crisóstomo Ibarra, who comes home from Europe and finds a country governed by fear, abuse of power and corruption.",
    why: "It gave Filipinos a shared picture of their own society. Spanish authorities banned it, but copies circulated in secret, and its characters became a common language for talking about injustice.",
    fact: "His friend Máximo Viola lent him the money to print 2,000 copies.",
    q: { text: "What does “Noli me tangere” mean?", options: ["Rise up, my country", "Do not forget me", "Touch me not"], answer: 2,
      explain: "It is Latin for “touch me not”, from the Gospel of John. Rizal used it for the social sores no one dared to touch." } },

  { id: "morga", kind: "openbook", title: "Annotations to Morga", when: "1890", place: "Paris",
    what: "In the British Museum in London, Rizal copied Antonio de Morga's 1609 history of the Philippines by hand and added his own notes. The new edition was published in Paris in 1890.",
    why: "His notes argued that Filipinos had trade, laws, writing and art before Spain arrived. If Filipinos had a past of their own, colonial rule could not claim to be what civilised them.",
    fact: "Morga was a Spanish official, which made his early account hard for colonial critics to dismiss.",
    q: { text: "What was Rizal trying to show with his notes on Morga?", options: ["Filipinos had their own culture before Spain", "Spain was the first to reach the islands", "The Philippines should be ruled by England"], answer: 0,
      explain: "He wanted to prove that Filipinos had a civilisation before colonisation, so their history did not begin with Spain." } },

  { id: "sol", kind: "quill", title: "La Solidaridad", when: "1889–1895", place: "Barcelona and Madrid",
    what: "La Solidaridad was the newspaper of Filipino reformists in Spain. Rizal wrote essays for it, including “The Philippines a Century Hence” and “The Indolence of the Filipino”.",
    why: "The paper asked for peaceful reform: representation in the Spanish Cortes, equal rights, and freedom of speech. It showed that a pen could argue with an empire.",
    fact: "Rizal signed some of his writing with pen names, such as Laong Laan and Dimasalang.",
    q: { text: "Which of these was one of Rizal's pen names?", options: ["Plaridel", "Laong Laan", "Balagtas"], answer: 1,
      explain: "Laong Laan (and Dimasalang). Plaridel was Marcelo H. del Pilar, the paper's editor. Balagtas was the poet Francisco Baltazar." } },

  { id: "fili", kind: "book", title: "El Filibusterismo", when: "1891", place: "Ghent",
    cover: { color: "#1f2a44", gold: "#c9ad6d", sub: "Continuación del Noli" },
    what: "The darker sequel follows Simoun, a rich jeweller who secretly plots revenge against the colonial order.",
    why: "It asks hard questions: can reform work, and what does revolution cost? Later generations read it as a warning that freedom needs moral preparation as well as courage.",
    fact: "Printing stopped when Rizal ran out of money. His friend Valentin Ventura sent funds so it could be finished.",
    q: { text: "To whom did Rizal dedicate El Filibusterismo?", options: ["The Queen Regent of Spain", "His mother, Teodora Alonso", "Gomez, Burgos and Zamora"], answer: 2,
      explain: "To the three priests (Gomburza) executed in 1872, an injustice Rizal lived through as a boy of ten." } },

  { id: "liga", kind: "medal", title: "La Liga Filipina", when: "1892", place: "Tondo, Manila",
    what: "On 3 July 1892, back in Manila, Rizal founded a civic league to unite the islands, offer mutual aid and legal help, and encourage education and trade.",
    why: "It did not call for independence, yet the authorities saw unity itself as a threat. Days after Rizal's arrest, Andrés Bonifacio founded the Katipunan.",
    fact: "The league's motto was “Unus instar omnium”: one like all.",
    q: { text: "What happened just days after Rizal founded La Liga Filipina?", options: ["He was arrested and exiled to Dapitan", "He was elected mayor of Manila", "He sailed to Japan"], answer: 0,
      explain: "He was arrested on 6 July 1892 and deported to Dapitan in Mindanao." } },

  { id: "dapitan", kind: "glasses", title: "Exile in Dapitan", when: "1892–1896", place: "Dapitan, Mindanao",
    what: "For four years in exile, Rizal ran a clinic, taught local boys, farmed, and helped build a water system for the town.",
    why: "The exile was meant to silence him. Instead he showed what one person could build for a community, and letters and visitors kept him at the centre of the movement.",
    fact: "Word of his eye operations drew patients from far away. He also met Josephine Bracken in Dapitan.",
    q: { text: "What was Rizal's main work in Dapitan?", options: ["Ship captain", "Soldier", "Eye doctor"], answer: 2,
      explain: "He practised as a physician, especially as an eye doctor, and also taught and worked on public projects." } },

  { id: "adios", kind: "stove", title: "Mi Último Adiós", when: "1896", place: "Fort Santiago, Manila",
    what: "On his last evening, Rizal handed his sister Trinidad a small alcohol stove and told her in English that there was something inside. It held his untitled farewell poem.",
    why: "The poem asks nothing for himself, only that his death serve the homeland. Printed in Hong Kong in 1897, it became one of the most widely read texts of the Revolution.",
    fact: "It opens “¡Adiós, Patria adorada, región del sol querida”: farewell, beloved homeland, dear land of the sun. The line runs around the gallery wall.",
    q: { text: "Where did Rizal hide his farewell poem?", options: ["Inside his shoe", "Inside an alcohol stove", "Sewn into his coat"], answer: 1,
      explain: "Inside a small alcohol stove, which he gave to his sister Trinidad. Many people remember it, wrongly, as a shoe." } },

  { id: "monument", kind: "monument", title: "The Rizal Monument", when: "1896", place: "Bagumbayan (Rizal Park)",
    what: "Rizal was shot by a firing squad at Bagumbayan on 30 December 1896. He was 35. The field is now Rizal Park, and his remains rest beneath the monument there.",
    why: "His death turned a reformer into a national symbol, and within months the revolution was spreading. The floor of this room carries the eight-rayed sun, for the first eight provinces to rise up.",
    fact: "Accounts say he asked to face the firing squad. When this was refused, he turned as he fell so that he landed facing the sky.",
    q: { text: "Which date is Rizal Day?", options: ["30 December", "19 June", "12 June"], answer: 0,
      explain: "30 December marks his death. 19 June is his birthday, and 12 June is Independence Day." } },
];

const STOPS = [
  ["Calamba", 14.21, 121.17], ["Madrid", 40.42, -3.7], ["Paris", 48.86, 2.35], ["Heidelberg", 49.4, 8.67],
  ["Berlin", 52.52, 13.4], ["London", 51.51, -0.13], ["Ghent", 51.05, 3.72], ["Hong Kong", 22.32, 114.17], ["Dapitan", 8.66, 123.42],
];

/* ─── Setup ───────────────────────────────────────────────────────────── */
const $ = (id) => document.getElementById(id);
const el = (tag, cls, txt) => { const n = document.createElement(tag); if (cls) n.className = cls; if (txt != null) n.textContent = txt; return n; };
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
const SERIF = '"Cormorant Garamond", Georgia, serif';
const SANS = '"Karla", Arial, sans-serif';
const KEY = "rizal3d.stamps";
const N = EXHIBITS.length;
const RING = 8;          // pedestal ring radius
const TOP = 1.25;        // pedestal top height

const ui = {
  stage: $("g3d-stage"), canvas: $("g3d-canvas"), panel: $("g3d-panel"), tip: $("g3d-tip"), hint: $("g3d-hint"),
  loading: $("g3d-loading"), count: $("g3d-count"), stamps: $("g3d-stamps"), index: $("g3d-index"),
  tour: $("g3d-tour"), overview: $("g3d-overview"), done: $("g3d-done"),
};

let stamps = new Set();
try { stamps = new Set(JSON.parse(localStorage.getItem(KEY)) || []); } catch { /* private mode */ }
const save = () => { try { localStorage.setItem(KEY, JSON.stringify([...stamps])); } catch { /* ignore */ } };

let scene3d = null;      // set once WebGL is up; the panel and list still work without it
let current = null;

/* ─── Panel, passport and artifact list (plain DOM) ───────────────────── */
function buildChrome() {
  EXHIBITS.forEach((ex, i) => {
    const s = el("button", "g3d-stamp", String(i + 1));
    s.type = "button";
    s.addEventListener("click", () => select(i));
    ui.stamps.append(s);

    const b = el("button", "g3d-item");
    b.type = "button";
    b.append(el("span", "g3d-item-no", `No. ${i + 1}`), el("span", "g3d-item-title", ex.title), el("span", "g3d-item-when", ex.when));
    b.addEventListener("click", () => { select(i); ui.stage.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "nearest" }); });
    ui.index.append(b);
  });
  refreshPassport();

  ui.tour.addEventListener("click", () => select(firstUnstamped()));
  ui.overview.addEventListener("click", overview);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && current !== null) overview();
  });
  $("g3d-reset").addEventListener("click", () => {
    stamps.clear(); save(); refreshPassport();
    EXHIBITS.forEach((_, i) => scene3d?.setStamped(i, false));
    ui.done.hidden = true;
    overview();
  });
  $("g3d-done-close").addEventListener("click", () => { ui.done.hidden = true; });
}

function firstUnstamped() {
  const i = EXHIBITS.findIndex((ex) => !stamps.has(ex.id));
  return i === -1 ? 0 : i;
}

function refreshPassport() {
  ui.count.textContent = `${stamps.size} / ${N}`;
  [...ui.stamps.children].forEach((s, i) => {
    const got = stamps.has(EXHIBITS[i].id);
    s.classList.toggle("got", got);
    s.setAttribute("aria-label", `${EXHIBITS[i].title}${got ? ", stamp earned" : ""}`);
  });
  [...ui.index.children].forEach((b, i) => {
    const got = stamps.has(EXHIBITS[i].id);
    b.classList.toggle("got", got);
    b.setAttribute("aria-current", String(i === current));
    b.setAttribute("aria-label", `No. ${i + 1}: ${EXHIBITS[i].title}, ${EXHIBITS[i].when}${got ? ", stamp earned" : ""}`);
  });
  ui.tour.textContent = stamps.size === 0 ? "Start the tour" : stamps.size === N ? "Tour again" : "Continue the tour";
}

function renderPanel(i) {
  const ex = EXHIBITS[i];
  const close = el("button", "g3d-close", "×");
  close.type = "button";
  close.setAttribute("aria-label", "Close and return to the overview");
  close.addEventListener("click", overview);

  const quiz = el("div", "g3d-quiz");
  const opts = el("div", "g3d-opts");
  const explain = el("p", "g3d-explain");
  explain.setAttribute("role", "status");
  const answered = stamps.has(ex.id);
  quiz.append(el("p", "g3d-q-label", answered ? "Stamp earned" : "Answer to earn the stamp"), el("p", "g3d-q", ex.q.text), opts, explain);

  ex.q.options.forEach((text, k) => {
    const b = el("button", "g3d-opt", text);
    b.type = "button";
    if (answered) {
      b.disabled = true;
      if (k === ex.q.answer) b.classList.add("right");
    }
    b.addEventListener("click", () => {
      if (k === ex.q.answer) {
        b.classList.add("right");
        [...opts.children].forEach((o) => { o.disabled = true; });
        explain.textContent = `Correct! ${ex.q.explain}`;
        quiz.firstChild.textContent = "Stamp earned";
        earn(i);
      } else {
        b.classList.add("wrong");
        b.disabled = true;
        explain.textContent = "Not quite. Read the card again and try another answer.";
      }
    });
    opts.append(b);
  });
  if (answered) explain.textContent = ex.q.explain;

  const nav = el("div", "g3d-nav");
  const prev = el("button", "btn btn-ghost", "Previous");
  const next = el("button", "btn", i === N - 1 ? "Back to overview" : "Next artifact");
  prev.type = next.type = "button";
  prev.disabled = i === 0;
  prev.addEventListener("click", () => select(i - 1));
  next.addEventListener("click", () => (i === N - 1 ? overview() : select(i + 1)));
  nav.append(prev, next);

  const fact = el("p", "g3d-fact");
  fact.append(el("span", null, "Did you know? "), document.createTextNode(ex.fact));

  ui.panel.replaceChildren(
    close,
    el("p", "g3d-kicker", `No. ${i + 1} · ${ex.when} · ${ex.place}`),
    el("h3", "g3d-title", ex.title),
    el("p", "g3d-text", ex.what),
    el("h4", "g3d-sub", "Influence on the nation"),
    el("p", "g3d-text", ex.why),
    fact,
    quiz,
    nav
  );
  ui.panel.hidden = false;
  ui.panel.scrollTop = 0;
}

function select(i) {
  current = i;
  renderPanel(i);
  refreshPassport();
  ui.overview.hidden = false;
  ui.hint.hidden = true;
  scene3d?.focus(i);
}

function overview() {
  current = null;
  ui.panel.hidden = true;
  ui.overview.hidden = true;
  refreshPassport();
  scene3d?.overview();
}

function earn(i) {
  if (stamps.has(EXHIBITS[i].id)) return;
  stamps.add(EXHIBITS[i].id);
  save();
  refreshPassport();
  scene3d?.setStamped(i, true);
  scene3d?.burst(i);
  if (stamps.size === N) setTimeout(() => { ui.done.hidden = false; }, reduce ? 0 : 1200);
}

/* ─── Canvas textures ─────────────────────────────────────────────────── */
let maxAniso = 1;
function tex(w, h, draw) {
  const c = document.createElement("canvas");
  c.width = w; c.height = h;
  draw(c.getContext("2d"), w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = maxAniso;
  return t;
}

function wrapLines(g, text, maxW) {
  const words = text.split(" "), lines = [];
  let line = "";
  words.forEach((w) => {
    const test = line ? `${line} ${w}` : w;
    if (g.measureText(test).width > maxW && line) { lines.push(line); line = w; } else line = test;
  });
  if (line) lines.push(line);
  return lines;
}

function fillWrapped(g, text, x, y, maxW, lh) {
  const lines = wrapLines(g, text, maxW);
  lines.forEach((l, k) => g.fillText(l, x, y + k * lh));
  return y + lines.length * lh;
}

function grain(g, w, h, n, alpha) {
  for (let k = 0; k < n; k++) {
    g.fillStyle = `rgba(0,0,0,${Math.random() * alpha})`;
    g.fillRect(Math.random() * w, Math.random() * h, 1 + Math.random() * 2, 1 + Math.random() * 2);
  }
}

function textLines(g, x, y, w, rows, gap, color) {
  g.fillStyle = color;
  for (let r = 0; r < rows; r++) g.fillRect(x, y + r * gap, w * (r % 5 === 4 ? 0.6 : 0.92 + Math.random() * 0.08), 3);
}

/* ─── Materials ───────────────────────────────────────────────────────── */
const std = (color, roughness = 0.6, extra = {}) => new THREE.MeshStandardMaterial({ color, roughness, ...extra });
let M;
function makeMaterials() {
  M = {
    marble: std(0xece6d8, 0.45),
    marbleDark: std(0xd6cfbf, 0.5),
    wood: std(0x5b3b25, 0.65),
    brass: std(0xb8924e, 0.3, { metalness: 0.9 }),
    bronze: std(0x7d5a33, 0.38, { metalness: 0.85 }),
    ink: std(0x26355d, 0.45),
    paper: std(0xf2ead8, 0.9),
    glass: new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.05, metalness: 0, transparent: true, opacity: 0.22, depthWrite: false, side: THREE.DoubleSide }),
    inkGlass: std(0x16213a, 0.1, { metalness: 0.2, transparent: true, opacity: 0.92 }),
    feather: std(0xfaf6ec, 0.8, { side: THREE.DoubleSide }),
  };
}

/* ─── Artifacts ───────────────────────────────────────────────────────── */
const mesh = (geo, mat, x = 0, y = 0, z = 0) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); return m; };

function makeLamp(anim) {
  const g = new THREE.Group();
  g.add(mesh(new THREE.CylinderGeometry(0.26, 0.32, 0.08, 40), M.brass, 0, 0.04, 0));
  g.add(mesh(new THREE.CylinderGeometry(0.05, 0.09, 0.32, 24), M.brass, 0, 0.24, 0));
  const font = mesh(new THREE.SphereGeometry(0.22, 40, 20), M.brass, 0, 0.5, 0);
  font.scale.y = 0.7;
  g.add(font);
  g.add(mesh(new THREE.CylinderGeometry(0.1, 0.12, 0.08, 24), M.brass, 0, 0.65, 0));
  const glassPts = [[0.12, 0], [0.16, 0.1], [0.17, 0.2], [0.13, 0.32], [0.08, 0.45], [0.08, 0.6]].map(([x, y]) => new THREE.Vector2(x, y));
  g.add(mesh(new THREE.LatheGeometry(glassPts, 40), M.glass, 0, 0.69, 0));
  const flame = mesh(new THREE.SphereGeometry(0.045, 16, 12), new THREE.MeshBasicMaterial({ color: 0xffd48a }), 0, 0.84, 0);
  flame.scale.y = 2.2;
  g.add(flame);
  const light = new THREE.PointLight(0xffb45a, 2.2, 3.5, 2);
  light.position.set(0, 0.9, 0);
  g.add(light);

  // The moth, circling the light
  const moth = new THREE.Group();
  const wingShape = new THREE.Shape();
  wingShape.moveTo(0, 0); wingShape.quadraticCurveTo(0.09, 0.07, 0.11, -0.02); wingShape.quadraticCurveTo(0.06, -0.05, 0, 0);
  const wingMat = std(0x8a7358, 0.9, { side: THREE.DoubleSide });
  const wl = new THREE.Mesh(new THREE.ShapeGeometry(wingShape), wingMat);
  const wr = new THREE.Mesh(new THREE.ShapeGeometry(wingShape), wingMat);
  wr.scale.x = -1;
  moth.add(wl, wr, mesh(new THREE.CapsuleGeometry(0.012, 0.06, 4, 8), std(0x3c2f22), 0, 0, 0));
  moth.children[2].rotation.x = Math.PI / 2;
  g.add(moth);

  anim.push((t) => {
    const f = 1 + Math.sin(t * 13) * 0.06 + Math.sin(t * 7.3) * 0.05;
    flame.scale.set(f, 2.2 * f, f);
    light.intensity = 2.2 * f;
    const a = t * 1.3;
    moth.position.set(Math.cos(a) * 0.42, 0.95 + Math.sin(t * 2.1) * 0.1, Math.sin(a) * 0.42);
    moth.rotation.y = -a;
    const flap = Math.sin(t * 28) * 0.9;
    wl.rotation.y = flap; wr.rotation.y = -flap;
  });
  g.scale.setScalar(1.35);
  return g;
}

function latLon(lat, lon, r) {
  const phi = (90 - lat) * THREE.MathUtils.DEG2RAD, theta = (lon + 180) * THREE.MathUtils.DEG2RAD;
  return new THREE.Vector3(-r * Math.sin(phi) * Math.cos(theta), r * Math.cos(phi), r * Math.sin(phi) * Math.sin(theta));
}

function makeGlobe(anim) {
  const g = new THREE.Group();
  g.add(mesh(new THREE.CylinderGeometry(0.28, 0.34, 0.08, 40), M.wood, 0, 0.04, 0));
  g.add(mesh(new THREE.CylinderGeometry(0.035, 0.05, 0.28, 16), M.brass, 0, 0.22, 0));

  const R = 0.58;
  const map = tex(2048, 1024, (c, W, H) => {
    const grd = c.createLinearGradient(0, 0, 0, H);
    grd.addColorStop(0, "#e6d9b8"); grd.addColorStop(0.5, "#efe4c8"); grd.addColorStop(1, "#e2d4b0");
    c.fillStyle = grd; c.fillRect(0, 0, W, H);
    grain(c, W, H, 9000, 0.05);
    c.strokeStyle = "rgba(38,53,93,.28)"; c.lineWidth = 2;
    for (let lon = 0; lon <= 360; lon += 15) { const x = (lon / 360) * W; c.beginPath(); c.moveTo(x, 0); c.lineTo(x, H); c.stroke(); }
    for (let lat = 15; lat < 180; lat += 15) { const y = (lat / 180) * H; c.beginPath(); c.moveTo(0, y); c.lineTo(W, y); c.stroke(); }
    c.strokeStyle = "rgba(38,53,93,.55)"; c.lineWidth = 3;
    c.beginPath(); c.moveTo(0, H / 2); c.lineTo(W, H / 2); c.stroke();
    const px = (lat, lon) => [((lon + 180) / 360) * W, ((90 - lat) / 180) * H];
    const offs = { Calamba: [14, 26], Madrid: [-10, 34], Paris: [-96, 20], Heidelberg: [12, 30], Berlin: [14, -8],
      London: [-104, -10], Ghent: [-30, -18], "Hong Kong": [-40, -14], Dapitan: [14, 18] };
    c.font = `600 22px ${SANS}`;
    STOPS.forEach(([name, lat, lon]) => {
      const [x, y] = px(lat, lon);
      c.fillStyle = "#9b3d3d"; c.beginPath(); c.arc(x, y, 6, 0, Math.PI * 2); c.fill();
      c.fillStyle = "#26355d"; c.fillText(name, x + offs[name][0], y + offs[name][1]);
    });
    c.font = `italic 400 42px ${SERIF}`; c.fillStyle = "rgba(38,53,93,.6)";
    c.fillText("Mare Pacificum", px(10, 150)[0], px(10, 150)[1]);
    c.fillText("Oceanus Indicus", px(-20, 70)[0], px(-20, 70)[1]);
    c.fillText("Mare Atlanticum", px(25, -50)[0], px(25, -50)[1]);
  });
  const tilt = new THREE.Group();
  tilt.position.y = 0.36 + R;
  tilt.rotation.z = 0.41;
  const spin = new THREE.Group();
  spin.add(new THREE.Mesh(new THREE.SphereGeometry(R, 64, 32), std(0xffffff, 0.7, { map })));

  // Route arcs
  const arcMat = new THREE.MeshStandardMaterial({ color: 0xd4a94a, emissive: 0xb07a1a, emissiveIntensity: 0.6, roughness: 0.4 });
  const route = ["Calamba", "Madrid", "Paris", "Heidelberg", "Berlin", "London", "Paris", "Ghent", "Hong Kong", "Dapitan"]
    .map((n) => STOPS.find((s) => s[0] === n));
  for (let k = 0; k < route.length - 1; k++) {
    const a = latLon(route[k][1], route[k][2], R), b = latLon(route[k + 1][1], route[k + 1][2], R);
    const lift = 1 + 0.08 + a.distanceTo(b) * 0.28;
    const mid = a.clone().add(b).normalize().multiplyScalar(R * lift);
    const curve = new THREE.QuadraticBezierCurve3(a, mid, b);
    spin.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 40, 0.006, 6, false), arcMat));
  }
  // A small ship that sails the route
  const ship = mesh(new THREE.SphereGeometry(0.022, 12, 8), new THREE.MeshBasicMaterial({ color: 0xfff1c4 }));
  spin.add(ship);
  const legs = [];
  for (let k = 0; k < route.length - 1; k++) {
    const a = latLon(route[k][1], route[k][2], R), b = latLon(route[k + 1][1], route[k + 1][2], R);
    const mid = a.clone().add(b).normalize().multiplyScalar(R * (1.08 + a.distanceTo(b) * 0.28));
    legs.push(new THREE.QuadraticBezierCurve3(a, mid, b));
  }

  tilt.add(spin);
  g.add(tilt);
  const meridian = mesh(new THREE.TorusGeometry(R + 0.05, 0.014, 8, 64, Math.PI), M.brass);
  meridian.rotation.z = -Math.PI / 2;
  tilt.add(meridian);

  spin.rotation.y = -1.9;
  anim.push((t, dt) => {
    if (!reduce) spin.rotation.y += dt * 0.25;
    const p = (t * 0.12) % 1, leg = Math.floor(p * legs.length);
    ship.position.copy(legs[leg].getPoint(p * legs.length - leg));
  });
  g.scale.setScalar(1.15);
  return g;
}

function makeBook(ex, anim) {
  const { color, gold, sub } = ex.cover;
  const w = 0.78, h = 1.12, d = 0.2;
  const cover = tex(512, 736, (c, W, H) => {
    c.fillStyle = color; c.fillRect(0, 0, W, H);
    grain(c, W, H, 5000, 0.12);
    c.strokeStyle = gold; c.lineWidth = 5; c.strokeRect(28, 28, W - 56, H - 56);
    c.lineWidth = 1.5; c.strokeRect(42, 42, W - 84, H - 84);
    c.fillStyle = gold; c.textAlign = "center";
    c.font = `italic 400 34px ${SERIF}`; c.fillText("José Rizal", W / 2, 130);
    c.fillRect(W / 2 - 60, 160, 120, 2);
    let size = 70;
    const longest = ex.title.toUpperCase().split(" ").reduce((a, b) => (b.length > a.length ? b : a));
    do { c.font = `500 ${size}px ${SERIF}`; size -= 2; } while (c.measureText(longest).width > W - 120 && size > 30);
    const end = fillWrapped(c, ex.title.toUpperCase(), W / 2, 280, W - 120, size * 1.12);
    c.fillRect(W / 2 - 60, end - 20, 120, 2);
    c.font = `italic 400 32px ${SERIF}`; c.fillText(sub, W / 2, end + 40);
    c.font = `400 26px ${SANS}`; c.fillText(`${ex.place.toUpperCase()} · ${ex.when}`, W / 2, H - 90);
  });
  const spine = tex(96, 736, (c, W, H) => {
    c.fillStyle = color; c.fillRect(0, 0, W, H);
    grain(c, W, H, 800, 0.12);
    c.fillStyle = gold; c.fillRect(0, 60, W, 4); c.fillRect(0, H - 64, W, 4);
    c.save(); c.translate(W / 2, H / 2); c.rotate(-Math.PI / 2);
    c.textAlign = "center"; c.textBaseline = "middle"; c.font = `500 34px ${SERIF}`;
    c.fillText(ex.title.toUpperCase(), 0, 0); c.restore();
  });
  const pages = tex(128, 128, (c, W, H) => {
    c.fillStyle = "#efe6d0"; c.fillRect(0, 0, W, H);
    for (let y = 0; y < H; y += 3) { c.fillStyle = `rgba(90,70,40,${0.05 + Math.random() * 0.08})`; c.fillRect(0, y, W, 1); }
  });
  const pageM = std(0xffffff, 0.9, { map: pages });
  const coverM = std(0xffffff, 0.55, { map: cover });
  const spineM = std(0xffffff, 0.55, { map: spine });
  const backM = std(color, 0.6);

  const g = new THREE.Group();
  g.add(mesh(new THREE.BoxGeometry(0.95, 0.06, 0.5), M.wood, 0, 0.03, 0));
  const book = mesh(new THREE.BoxGeometry(w, h, d), [pageM, spineM, pageM, pageM, coverM, backM], 0, h / 2 + 0.07, 0);
  book.rotation.x = -0.12;
  g.add(book);
  const baseY = book.position.y, off = Math.random() * 6;
  anim.push((t) => {
    if (reduce) return;
    book.position.y = baseY + Math.sin(t * 1.4 + off) * 0.035 + 0.035;
    book.rotation.y = Math.sin(t * 0.6 + off) * 0.18;
  });
  return g;
}

function makeOpenBook(anim) {
  const g = new THREE.Group();
  const stand = new THREE.Group();
  stand.position.set(0, 0.42, 0);
  stand.rotation.x = 0.55;
  g.add(mesh(new THREE.BoxGeometry(1.0, 0.36, 0.34), M.wood, 0, 0.18, -0.2));
  stand.add(mesh(new THREE.BoxGeometry(1.45, 0.05, 0.98), M.wood));

  const left = tex(512, 700, (c, W, H) => {
    c.fillStyle = "#f1e7cf"; c.fillRect(0, 0, W, H); grain(c, W, H, 3000, 0.06);
    c.fillStyle = "#2b2418"; c.textAlign = "center";
    c.font = `500 44px ${SERIF}`; c.fillText("SUCESOS", W / 2, 130);
    c.font = `400 30px ${SERIF}`; c.fillText("DE LAS", W / 2, 180);
    c.font = `500 44px ${SERIF}`; c.fillText("ISLAS FILIPINAS", W / 2, 236);
    c.font = `italic 400 28px ${SERIF}`; c.fillText("por el Doctor Antonio de Morga", W / 2, 310);
    c.font = `400 30px ${SERIF}`; c.fillText("MDCIX", W / 2, 370);
    c.fillRect(W / 2 - 70, 420, 140, 2);
    c.fillStyle = "#8a2f2a"; c.font = `italic 400 26px ${SERIF}`;
    c.fillText("Nueva edición, anotada por", W / 2, 490);
    c.fillText("José Rizal", W / 2, 528);
    c.fillStyle = "#2b2418"; c.font = `400 24px ${SERIF}`; c.fillText("París · 1890", W / 2, 620);
  });
  const right = tex(512, 700, (c, W, H) => {
    c.fillStyle = "#f1e7cf"; c.fillRect(0, 0, W, H); grain(c, W, H, 3000, 0.06);
    textLines(c, 50, 70, W - 100, 12, 22, "rgba(40,34,24,.55)");
    // Rizal's notes in red ink, drawn as handwriting strokes
    c.strokeStyle = "rgba(138,47,42,.85)"; c.lineWidth = 2.4;
    for (let r = 0; r < 9; r++) {
      const y = 380 + r * 30;
      c.beginPath(); c.moveTo(56, y);
      for (let x = 56; x < W - 60 - (r === 8 ? 180 : 0); x += 7) c.lineTo(x, y + Math.sin(x * 0.45 + r) * 5 + (Math.random() - 0.5) * 3);
      c.stroke();
    }
    c.strokeStyle = "rgba(138,47,42,.7)"; c.beginPath(); c.moveTo(40, 350); c.lineTo(40, 640); c.stroke();
  });
  const edge = std(0xefe5cc, 0.9);
  const pageL = mesh(new THREE.BoxGeometry(0.64, 0.05, 0.88), [edge, edge, std(0xffffff, 0.85, { map: left }), edge, edge, edge], -0.33, 0.06, 0);
  const pageR = mesh(new THREE.BoxGeometry(0.64, 0.05, 0.88), [edge, edge, std(0xffffff, 0.85, { map: right }), edge, edge, edge], 0.33, 0.06, 0);
  pageL.rotation.z = -0.07; pageR.rotation.z = 0.07;
  stand.add(mesh(new THREE.BoxGeometry(1.34, 0.03, 0.92), std(0x5a2f1f, 0.6), 0, 0.03, 0), pageL, pageR);
  g.add(stand);

  // A quill resting in the gutter
  const quill = makeQuillPen();
  quill.position.set(0.1, 0.12, 0.1);
  quill.rotation.set(-Math.PI / 2 + 0.1, 0, -0.6);
  stand.add(quill);
  return g;
}

function makeQuillPen() {
  const q = new THREE.Group();
  const shape = new THREE.Shape();
  shape.moveTo(0, 0.12); shape.bezierCurveTo(0.11, 0.3, 0.09, 0.62, 0, 0.84); shape.bezierCurveTo(-0.05, 0.6, -0.07, 0.3, 0, 0.12);
  q.add(new THREE.Mesh(new THREE.ShapeGeometry(shape, 24), M.feather));
  const shaft = mesh(new THREE.CylinderGeometry(0.006, 0.01, 0.86, 8), std(0xe8dcc0, 0.6), 0, 0.43, 0.002);
  q.add(shaft);
  q.add(mesh(new THREE.ConeGeometry(0.01, 0.05, 8), std(0x222222, 0.4), 0, -0.02, 0));
  q.children[2].rotation.x = Math.PI;
  return q;
}

function makeQuill(anim) {
  const g = new THREE.Group();
  const paper = tex(700, 500, (c, W, H) => {
    c.fillStyle = "#f3ead6"; c.fillRect(0, 0, W, H); grain(c, W, H, 4000, 0.05);
    c.fillStyle = "#1f2430"; c.textAlign = "center";
    c.font = `600 62px ${SERIF}`; c.fillText("LA SOLIDARIDAD", W / 2, 80);
    c.fillRect(40, 100, W - 80, 3); c.fillRect(40, 108, W - 80, 1);
    c.font = `italic 400 22px ${SERIF}`; c.fillText("Barcelona · 15 de febrero de 1889 · Año I, Núm. 1", W / 2, 136);
    c.fillRect(40, 150, W - 80, 1);
    const colW = (W - 100) / 3;
    for (let k = 0; k < 3; k++) {
      const x = 40 + k * (colW + 10);
      c.textAlign = "left"; c.font = `600 22px ${SERIF}`;
      c.fillText(["Nuestros propósitos", "Filipinas", "Por Laong Laan"][k], x, 184);
      textLines(c, x, 200, colW, 12, 22, "rgba(30,30,40,.45)");
    }
  });
  const sheet = mesh(new THREE.PlaneGeometry(1.1, 0.78), std(0xffffff, 0.9, { map: paper, side: THREE.DoubleSide }), -0.08, 0.012, 0.08);
  sheet.rotation.set(-Math.PI / 2, 0, 0.12);
  g.add(sheet);

  const well = new THREE.Group();
  well.position.set(0.36, 0, -0.26);
  well.add(mesh(new THREE.CylinderGeometry(0.15, 0.18, 0.2, 32), M.inkGlass, 0, 0.1, 0));
  well.add(mesh(new THREE.CylinderGeometry(0.07, 0.08, 0.06, 24), M.brass, 0, 0.23, 0));
  well.add(mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.02, 32), M.brass, 0, 0.01, 0));
  g.add(well);

  const quill = makeQuillPen();
  quill.position.set(0.36, 0.2, -0.26);
  quill.rotation.set(-0.15, 0.4, 0.42);
  g.add(quill);
  anim.push((t) => { if (!reduce) quill.rotation.z = 0.42 + Math.sin(t * 1.1) * 0.05; });
  g.scale.setScalar(1.2);
  return g;
}

function arcText(c, text, cx, cy, r, step, top) {
  const total = step * (text.length - 1);
  [...text].forEach((ch, k) => {
    const a = top ? -Math.PI / 2 - total / 2 + k * step : Math.PI / 2 + total / 2 - k * step;
    c.save();
    c.translate(cx + r * Math.cos(a), cy + r * Math.sin(a));
    c.rotate(top ? a + Math.PI / 2 : a - Math.PI / 2);
    c.fillText(ch, 0, 0);
    c.restore();
  });
}

function makeMedal(anim) {
  const g = new THREE.Group();
  g.add(mesh(new THREE.BoxGeometry(0.8, 0.12, 0.36), M.wood, 0, 0.06, 0));
  g.add(mesh(new THREE.BoxGeometry(0.06, 0.28, 0.06), M.brass, -0.22, 0.24, 0));
  g.add(mesh(new THREE.BoxGeometry(0.06, 0.28, 0.06), M.brass, 0.22, 0.24, 0));

  const face = tex(1024, 1024, (c, W) => {
    const grd = c.createRadialGradient(W * 0.4, W * 0.35, 40, W / 2, W / 2, W / 2);
    grd.addColorStop(0, "#d9b77a"); grd.addColorStop(1, "#8a6436");
    c.fillStyle = grd; c.fillRect(0, 0, W, W);
    grain(c, W, W, 6000, 0.12);
    c.strokeStyle = "#5e421f"; c.lineWidth = 10;
    c.beginPath(); c.arc(W / 2, W / 2, W / 2 - 30, 0, Math.PI * 2); c.stroke();
    c.lineWidth = 4; c.beginPath(); c.arc(W / 2, W / 2, W / 2 - 150, 0, Math.PI * 2); c.stroke();
    c.fillStyle = "#4a3317"; c.textAlign = "center"; c.textBaseline = "middle";
    c.font = `700 74px ${SERIF}`; arcText(c, "LA LIGA FILIPINA", W / 2, W / 2, W / 2 - 92, 0.16, true);
    c.font = `italic 600 56px ${SERIF}`; arcText(c, "unus instar omnium", W / 2, W / 2, W / 2 - 92, 0.115, false);
    c.font = `600 150px ${SERIF}`; c.fillText("1892", W / 2, W / 2 - 20);
    c.font = `italic 400 54px ${SERIF}`; c.fillText("Tondo, Manila", W / 2, W / 2 + 90);
  });
  const disk = new THREE.Group();
  disk.position.y = 0.72;
  const rim = mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.08, 64), M.bronze);
  rim.rotation.x = Math.PI / 2;
  const front = mesh(new THREE.CircleGeometry(0.47, 64), std(0xffffff, 0.35, { map: face, metalness: 0.55 }), 0, 0, 0.041);
  const back = mesh(new THREE.CircleGeometry(0.47, 64), M.bronze, 0, 0, -0.041);
  back.rotation.y = Math.PI;
  disk.add(rim, front, back);
  g.add(disk);
  anim.push((t) => { if (!reduce) disk.rotation.y = Math.sin(t * 0.7) * 0.5; });
  g.scale.setScalar(1.1);
  return g;
}

function makeGlasses(anim) {
  const g = new THREE.Group();
  const chart = tex(420, 600, (c, W, H) => {
    c.fillStyle = "#fbf8f0"; c.fillRect(0, 0, W, H);
    c.fillStyle = "#151515"; c.textAlign = "center";
    [["E", 150, 150], ["F P", 84, 260], ["T O Z", 58, 336], ["L P E D", 42, 396], ["P E C F D", 30, 444], ["E D F C Z P", 22, 484]]
      .forEach(([t, s, y]) => { c.font = `700 ${s}px ${SANS}`; c.fillText(t, W / 2, y); });
    c.fillStyle = "#9b3d3d"; c.fillRect(60, 504, W - 120, 2);
    c.font = `italic 400 26px ${SERIF}`; c.fillStyle = "#555"; c.fillText("Dapitan, 1892–1896", W / 2, 560);
  });
  const frame = mesh(new THREE.BoxGeometry(0.66, 0.94, 0.04), M.wood, 0, 0.6, -0.3);
  const chartM = mesh(new THREE.PlaneGeometry(0.6, 0.86), std(0xffffff, 0.9, { map: chart }), 0, 0.6, -0.278);
  g.add(frame, chartM, mesh(new THREE.BoxGeometry(0.06, 0.2, 0.06), M.wood, 0, 0.1, -0.3));

  g.add(mesh(new THREE.BoxGeometry(0.62, 0.2, 0.3), M.marbleDark, 0, 0.1, 0.18));
  const specs = new THREE.Group();
  specs.position.set(0, 0.36, 0.2);
  specs.rotation.x = -0.25;
  const wire = std(0x2c2a26, 0.35, { metalness: 0.8 });
  [-0.17, 0.17].forEach((x) => {
    specs.add(mesh(new THREE.TorusGeometry(0.13, 0.012, 10, 40), wire, x, 0, 0));
    specs.add(mesh(new THREE.CircleGeometry(0.125, 32), M.glass, x, 0, 0));
    const arm = mesh(new THREE.BoxGeometry(0.012, 0.012, 0.36), wire, x + Math.sign(x) * 0.13, 0.02, -0.18);
    specs.add(arm);
  });
  const bridge = mesh(new THREE.TorusGeometry(0.04, 0.01, 8, 16, Math.PI), wire, 0, 0.02, 0);
  specs.add(bridge);
  g.add(specs);
  anim.push((t) => { if (!reduce) specs.position.y = 0.36 + Math.sin(t * 1.6) * 0.03 + 0.03; });
  g.scale.setScalar(1.25);
  return g;
}

function makeStove(anim) {
  const g = new THREE.Group();
  const prof = [[0.001, 0], [0.26, 0], [0.27, 0.03], [0.22, 0.06], [0.19, 0.09], [0.23, 0.28], [0.25, 0.33], [0.23, 0.36], [0.17, 0.36], [0.17, 0.34], [0.001, 0.34]]
    .map(([x, y]) => new THREE.Vector2(x, y));
  g.add(mesh(new THREE.LatheGeometry(prof, 48), M.brass));
  const burner = mesh(new THREE.TorusGeometry(0.11, 0.018, 8, 32), std(0x3a3632, 0.4, { metalness: 0.7 }), 0, 0.37, 0);
  burner.rotation.x = Math.PI / 2;
  g.add(burner);
  for (let k = 0; k < 3; k++) {
    const a = (k / 3) * Math.PI * 2;
    const arm = mesh(new THREE.BoxGeometry(0.03, 0.12, 0.03), M.brass, Math.cos(a) * 0.2, 0.42, Math.sin(a) * 0.2);
    g.add(arm);
  }
  const flame = mesh(new THREE.ConeGeometry(0.08, 0.16, 16, 1, true), new THREE.MeshBasicMaterial({ color: 0x7fb4ff, transparent: true, opacity: 0.55, depthWrite: false }), 0, 0.46, 0);
  g.add(flame);

  // The hidden poem, peeking out
  const scroll = tex(256, 64, (c, W, H) => {
    c.fillStyle = "#f4ecd8"; c.fillRect(0, 0, W, H);
    c.strokeStyle = "rgba(40,40,60,.6)"; c.lineWidth = 1.5;
    for (let y = 10; y < H; y += 9) { c.beginPath(); c.moveTo(4, y); for (let x = 4; x < W - 4; x += 6) c.lineTo(x, y + Math.sin(x * 0.5 + y) * 1.5); c.stroke(); }
  });
  const paper = mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.42, 24), std(0xffffff, 0.9, { map: scroll }), 0.14, 0.2, 0.14);
  paper.rotation.set(0.7, 0, -0.9);
  g.add(paper);

  anim.push((t) => {
    const f = 1 + Math.sin(t * 17) * 0.1;
    flame.scale.set(f, 1 + Math.sin(t * 11) * 0.18, f);
  });
  g.scale.setScalar(1.6);
  return g;
}

function makeMonument(anim) {
  const g = new THREE.Group();
  g.add(mesh(new THREE.BoxGeometry(3.2, 0.3, 3.2), M.marbleDark, 0, 0.15, 0));
  g.add(mesh(new THREE.BoxGeometry(2.5, 0.3, 2.5), M.marble, 0, 0.45, 0));
  const plaque = tex(512, 400, (c, W, H) => {
    c.fillStyle = "#e7e0d0"; c.fillRect(0, 0, W, H); grain(c, W, H, 3000, 0.05);
    c.strokeStyle = "#8c7a52"; c.lineWidth = 4; c.strokeRect(20, 20, W - 40, H - 40);
    c.fillStyle = "#3b3222"; c.textAlign = "center";
    c.font = `600 64px ${SERIF}`; c.fillText("JOSÉ RIZAL", W / 2, 150);
    c.font = `italic 400 40px ${SERIF}`; c.fillText("1861 – 1896", W / 2, 215);
    c.font = `400 26px ${SANS}`; c.fillText("BAGUMBAYAN · 30 XII 1896", W / 2, 300);
  });
  const plaqueM = std(0xffffff, 0.6, { map: plaque });
  g.add(mesh(new THREE.BoxGeometry(1.5, 1.2, 1.5), [M.marble, M.marble, M.marble, M.marble, plaqueM, M.marble], 0, 1.2, 0));
  const shaft = mesh(new THREE.CylinderGeometry(0.34, 0.52, 4.4, 4, 1), M.marble, 0, 4.0, 0);
  shaft.rotation.y = Math.PI / 4;
  const tip = mesh(new THREE.ConeGeometry(0.34, 0.5, 4), M.marble, 0, 6.45, 0);
  tip.rotation.y = Math.PI / 4;
  g.add(shaft, tip);

  // A small bronze Rizal in his overcoat, holding a book
  const fig = new THREE.Group();
  fig.position.set(0, 1.8, 0.55);
  fig.add(mesh(new THREE.ConeGeometry(0.26, 0.95, 24), M.bronze, 0, 0.47, 0));
  fig.add(mesh(new THREE.SphereGeometry(0.12, 24, 16), M.bronze, 0, 1.03, 0));
  fig.add(mesh(new THREE.CylinderGeometry(0.05, 0.06, 0.08, 12), M.bronze, 0, 0.93, 0));
  fig.add(mesh(new THREE.BoxGeometry(0.14, 0.18, 0.05), M.bronze, 0.18, 0.55, 0.12));
  g.add(fig);
  return g;
}

/* ─── Scene ───────────────────────────────────────────────────────────── */
function buildScene() {
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas: ui.canvas, antialias: true });
  } catch {
    return null;
  }
  maxAniso = renderer.capabilities.getMaxAnisotropy();
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x2a241d);
  scene.fog = new THREE.Fog(0x2a241d, 18, 34);
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  makeMaterials();

  const camera = new THREE.PerspectiveCamera(48, 1, 0.1, 80);
  const HOME = { pos: new THREE.Vector3(0, 7.2, 13), target: new THREE.Vector3(0, 1.6, 0) };
  camera.position.copy(HOME.pos);

  const controls = new OrbitControls(camera, ui.canvas);
  controls.target.copy(HOME.target);
  controls.enableDamping = true;
  controls.enablePan = false;
  controls.enableZoom = false;
  controls.rotateSpeed = 0.6;
  controls.minPolarAngle = 0.35;
  controls.maxPolarAngle = 1.48;
  controls.autoRotate = !reduce;
  controls.autoRotateSpeed = 0.45;

  /* Lights */
  scene.add(new THREE.HemisphereLight(0xfff3dc, 0x3b2a1a, 0.55));
  const sun = new THREE.DirectionalLight(0xfff0d6, 1.5);
  sun.position.set(6, 14, 7);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, { left: -14, right: 14, top: 14, bottom: -14, near: 1, far: 40 });
  sun.shadow.bias = -0.0005;
  scene.add(sun);

  /* Room: floor with the eight-rayed sun, wall with the first line of Mi Último Adiós */
  const floorTex = tex(2048, 2048, (c, W) => {
    c.fillStyle = "#6b4a30"; c.fillRect(0, 0, W, W);
    for (let y = 0; y < W; y += 48) {
      let x = -Math.random() * 400;
      while (x < W) {
        const len = 300 + Math.random() * 400;
        c.fillStyle = `hsl(${24 + Math.random() * 8}, ${30 + Math.random() * 12}%, ${22 + Math.random() * 10}%)`;
        c.fillRect(x, y, len - 3, 45);
        c.fillStyle = "rgba(0,0,0,.08)";
        for (let k = 0; k < 6; k++) c.fillRect(x, y + Math.random() * 45, len - 3, 1);
        x += len;
      }
    }
    const px = (u) => (u / 28 + 0.5) * W, cx = W / 2;
    // walkway ring under the pedestals
    c.strokeStyle = "rgba(236,230,216,.35)"; c.lineWidth = px(1.9) - px(0);
    c.beginPath(); c.arc(cx, cx, px(RING) - cx, 0, Math.PI * 2); c.stroke();
    c.strokeStyle = "rgba(168,144,90,.8)"; c.lineWidth = 4;
    [RING - 0.95, RING + 0.95].forEach((r) => { c.beginPath(); c.arc(cx, cx, px(r) - cx, 0, Math.PI * 2); c.stroke(); });
    // sun
    c.fillStyle = "#c9a44f";
    for (let k = 0; k < 8; k++) {
      const a = (k / 8) * Math.PI * 2 + Math.PI / 8;
      [[0, 1.3], [-0.14, 0.9], [0.14, 0.9]].forEach(([da, s]) => {
        const r0 = px(2.4) - cx, r1 = px(2.4 + 2.2 * s) - cx, aa = a + da;
        c.beginPath();
        c.moveTo(cx + Math.cos(aa - 0.06) * r0, cx + Math.sin(aa - 0.06) * r0);
        c.lineTo(cx + Math.cos(aa) * r1, cx + Math.sin(aa) * r1);
        c.lineTo(cx + Math.cos(aa + 0.06) * r0, cx + Math.sin(aa + 0.06) * r0);
        c.fill();
      });
    }
    c.strokeStyle = "#c9a44f"; c.lineWidth = 6;
    c.beginPath(); c.arc(cx, cx, px(2.35) - cx, 0, Math.PI * 2); c.stroke();
  });
  const floor = new THREE.Mesh(new THREE.CircleGeometry(14, 96), std(0xffffff, 0.55, { map: floorTex }));
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  scene.add(floor);

  const wallTex = tex(2048, 420, (c, W, H) => {
    const grd = c.createLinearGradient(0, 0, 0, H);
    grd.addColorStop(0, "#d9d1bf"); grd.addColorStop(1, "#efe8d8");
    c.fillStyle = grd; c.fillRect(0, 0, W, H);
    for (let x = 0; x < W; x += 256) {
      c.fillStyle = "rgba(255,255,255,.35)"; c.fillRect(x + 8, 150, 26, H - 230);
      c.fillStyle = "rgba(0,0,0,.06)"; c.fillRect(x + 34, 150, 4, H - 230);
    }
    c.fillStyle = "#3e5c4c"; c.fillRect(0, H - 76, W, 76);
    c.fillStyle = "#a8905a"; c.fillRect(0, H - 80, W, 4); c.fillRect(0, 62, W, 3); c.fillRect(0, 128, W, 3);
    c.fillStyle = "#26355d"; c.font = `italic 400 38px ${SERIF}`; c.textBaseline = "middle";
    const unit = "¡Adiós, Patria adorada, región del sol querida, Perla del mar de oriente, nuestro perdido Edén!   ✦   ";
    const uw = c.measureText(unit).width, reps = Math.max(1, Math.round(W / uw));
    c.save(); c.scale(W / (uw * reps), 1);
    for (let k = 0; k < reps; k++) c.fillText(unit, k * uw, 96);
    c.restore();
  });
  wallTex.wrapS = THREE.RepeatWrapping;
  wallTex.repeat.x = -2;
  const wall = new THREE.Mesh(new THREE.CylinderGeometry(14, 14, 9, 96, 1, true), std(0xffffff, 0.9, { map: wallTex, side: THREE.BackSide }));
  wall.position.y = 4.5;
  wall.receiveShadow = true;
  scene.add(wall);
  const ceil = new THREE.Mesh(new THREE.CircleGeometry(14, 64), std(0x3a3128, 0.9, { side: THREE.BackSide }));
  ceil.rotation.x = -Math.PI / 2;
  ceil.position.y = 9;
  scene.add(ceil);

  /* Pedestals + artifacts */
  const anim = [];
  const pickables = [];
  const slots = [];
  const makers = { lamp: makeLamp, globe: makeGlobe, book: makeBook, openbook: makeOpenBook, quill: makeQuill, medal: makeMedal, glasses: makeGlasses, stove: makeStove, monument: makeMonument };
  const beamGeo = new THREE.CylinderGeometry(0.25, 1.05, 9 - TOP, 32, 1, true);

  EXHIBITS.forEach((ex, i) => {
    const art = ex.kind === "book" ? makers.book(ex, anim) : makers[ex.kind](anim);
    const holder = new THREE.Group();
    let ringMat = null, beam = null, focusPos, focusTarget;

    if (ex.kind === "monument") {
      holder.add(art);
    } else {
      const a = -Math.PI / 2 + (i - 4) * ((Math.PI * 2) / (N - 1));
      const dir = new THREE.Vector3(Math.cos(a), 0, Math.sin(a));
      holder.position.copy(dir.clone().multiplyScalar(RING));
      holder.lookAt(0, 0, 0);

      holder.add(mesh(new THREE.BoxGeometry(1.5, 0.1, 1.5), M.marbleDark, 0, 0.05, 0));
      holder.add(mesh(new THREE.BoxGeometry(1.3, TOP - 0.18, 1.3), M.marble, 0, (TOP - 0.18) / 2 + 0.1, 0));
      holder.add(mesh(new THREE.BoxGeometry(1.5, 0.08, 1.5), M.marbleDark, 0, TOP - 0.04, 0));
      ringMat = new THREE.MeshStandardMaterial({ color: 0x8c7a52, emissive: 0xffc15a, emissiveIntensity: 0, roughness: 0.4, metalness: 0.6 });
      const ring = mesh(new THREE.RingGeometry(0.6, 0.66, 64), ringMat, 0, TOP + 0.004, 0);
      ring.rotation.x = -Math.PI / 2;
      holder.add(ring);

      const label = tex(512, 220, (c, W, H) => {
        c.fillStyle = "#26355d"; c.fillRect(0, 0, W, H);
        c.strokeStyle = "#a8905a"; c.lineWidth = 3; c.strokeRect(10, 10, W - 20, H - 20);
        c.fillStyle = "#d9c38e"; c.textAlign = "center";
        c.font = `500 24px ${SANS}`; c.fillText(`NO. ${i + 1}`, W / 2, 56);
        c.fillStyle = "#f6f4ee"; c.font = `500 50px ${SERIF}`; c.fillText(ex.title, W / 2, 118, W - 40);
        c.fillStyle = "#cfd4e2"; c.font = `italic 400 30px ${SERIF}`; c.fillText(`${ex.when} · ${ex.place}`, W / 2, 170, W - 40);
      });
      holder.add(mesh(new THREE.PlaneGeometry(1.0, 0.43), std(0xffffff, 0.5, { map: label }), 0, 0.72, 0.652));

      art.position.y = TOP;
      holder.add(art);

      beam = mesh(beamGeo, new THREE.MeshBasicMaterial({ color: 0xffe2a8, transparent: true, opacity: 0.045, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }), 0, TOP + (9 - TOP) / 2, 0);
      holder.add(beam);

      focusTarget = new THREE.Vector3(dir.x * RING, TOP + 0.65, dir.z * RING);
      focusPos = new THREE.Vector3(dir.x * (RING - 3.6), 2.9, dir.z * (RING - 3.6));
    }

    holder.traverse((o) => {
      if (!o.isMesh || o === beam) return;
      o.castShadow = true;
      o.receiveShadow = true;
      o.userData.idx = i;
      pickables.push(o);
    });
    scene.add(holder);
    slots.push({ art, ringMat, beam, focusPos, focusTarget, hover: 0, baseScale: art.scale.x });
  });

  const dot = tex(64, 64, (c, W) => {
    const grd = c.createRadialGradient(W / 2, W / 2, 0, W / 2, W / 2, W / 2);
    grd.addColorStop(0, "rgba(255,255,255,1)"); grd.addColorStop(0.4, "rgba(255,255,255,.8)"); grd.addColorStop(1, "rgba(255,255,255,0)");
    c.fillStyle = grd; c.fillRect(0, 0, W, W);
  });

  /* Dust in the light */
  const dustN = reduce ? 0 : 450;
  const dustPos = new Float32Array(dustN * 3);
  for (let k = 0; k < dustN; k++) {
    const r = Math.sqrt(Math.random()) * 13, a = Math.random() * Math.PI * 2;
    dustPos.set([Math.cos(a) * r, Math.random() * 8.5, Math.sin(a) * r], k * 3);
  }
  const dustGeo = new THREE.BufferGeometry();
  dustGeo.setAttribute("position", new THREE.BufferAttribute(dustPos, 3));
  scene.add(new THREE.Points(dustGeo, new THREE.PointsMaterial({ color: 0xffe9bf, map: dot, size: 0.05, transparent: true, opacity: 0.55, depthWrite: false })));

  /* Stamp burst */
  const BURST = 90;
  const burstGeo = new THREE.BufferGeometry();
  burstGeo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(BURST * 3), 3));
  const burstMat = new THREE.PointsMaterial({ color: 0xffcf5a, map: dot, size: 0.14, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending });
  const burstPts = new THREE.Points(burstGeo, burstMat);
  burstPts.frustumCulled = false;
  scene.add(burstPts);
  let burstState = null;

  /* Camera moves (swing around the room instead of cutting through it) */
  let tween = null, mode = "overview", idleSince = performance.now();
  const cyl = (v) => ({ r: Math.hypot(v.x, v.z), a: Math.atan2(v.z, v.x), y: v.y });
  const ease = (k) => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2);
  function flyTo(pos, target) {
    const c0 = cyl(camera.position), c1 = cyl(pos);
    let da = c1.a - c0.a;
    da = Math.atan2(Math.sin(da), Math.cos(da));
    tween = { c0, c1, da, t0: controls.target.clone(), t1: target.clone(), start: performance.now(), dur: reduce ? 1 : 1300 };
    controls.enabled = false;
    controls.autoRotate = false;
  }

  function setLimits() {
    if (mode === "overview") { controls.minDistance = 0; controls.maxDistance = Infinity; }
    else if (current !== null && EXHIBITS[current].kind === "monument") { controls.minDistance = 5; controls.maxDistance = 12; }
    else { controls.minDistance = 2.2; controls.maxDistance = 6.5; }
  }

  const api = {
    focus(i) {
      const s = slots[i];
      if (EXHIBITS[i].kind === "monument") {
        const d = new THREE.Vector3(camera.position.x, 0, camera.position.z).normalize();
        if (!isFinite(d.x)) d.set(0, 0, 1);
        flyTo(d.multiplyScalar(11.2).setY(4.6), new THREE.Vector3(0, 3.1, 0));
      } else flyTo(s.focusPos, s.focusTarget);
      mode = "focus";
    },
    overview() {
      mode = "overview";
      flyTo(HOME.pos, HOME.target);
      idleSince = performance.now();
    },
    setStamped(i, on) {
      const s = slots[i];
      if (s.ringMat) s.ringMat.emissiveIntensity = on ? 1.6 : 0;
      if (s.beam) s.beam.material.opacity = on ? 0.11 : 0.045;
    },
    burst(i) {
      const s = slots[i];
      const origin = new THREE.Vector3();
      s.art.getWorldPosition(origin);
      origin.y += EXHIBITS[i].kind === "monument" ? 3 : 0.9;
      const vel = [];
      for (let k = 0; k < BURST; k++) {
        const a = Math.random() * Math.PI * 2, up = 1.5 + Math.random() * 2.5, sp = 0.6 + Math.random() * 1.6;
        vel.push(new THREE.Vector3(Math.cos(a) * sp, up, Math.sin(a) * sp));
      }
      burstState = { origin, vel, start: performance.now() };
    },
  };
  EXHIBITS.forEach((ex, i) => api.setStamped(i, stamps.has(ex.id)));

  controls.addEventListener("start", () => { controls.autoRotate = false; idleSince = Infinity; });
  controls.addEventListener("end", () => { idleSince = performance.now(); });

  /* Picking */
  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
  let hovered = -1, down = null, lastMove = null;
  function pick(e) {
    const r = ui.canvas.getBoundingClientRect();
    ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(ndc, camera);
    const hit = ray.intersectObjects(pickables, false)[0];
    return hit ? hit.object.userData.idx : -1;
  }
  ui.canvas.addEventListener("pointerdown", (e) => { down = { x: e.clientX, y: e.clientY }; });
  ui.canvas.addEventListener("pointerup", (e) => {
    if (!down || Math.hypot(e.clientX - down.x, e.clientY - down.y) > 6) return;
    down = null;
    const i = pick(e);
    if (i >= 0) select(i);
  });
  ui.canvas.addEventListener("pointermove", (e) => { if (e.pointerType === "mouse") lastMove = e; });
  ui.canvas.addEventListener("pointerleave", () => { lastMove = null; hovered = -1; ui.tip.hidden = true; ui.canvas.style.cursor = ""; });

  function updateHover() {
    if (!lastMove) return;
    const i = pick(lastMove);
    hovered = i;
    ui.canvas.style.cursor = i >= 0 ? "pointer" : "grab";
    if (i >= 0) {
      const r = ui.stage.getBoundingClientRect();
      ui.tip.textContent = `No. ${i + 1} · ${EXHIBITS[i].title}${stamps.has(EXHIBITS[i].id) ? " ✓" : ""}`;
      ui.tip.style.transform = `translate(${lastMove.clientX - r.left + 14}px, ${lastMove.clientY - r.top + 14}px)`;
      ui.tip.hidden = false;
    } else ui.tip.hidden = true;
  }

  /* Size + visibility */
  function resize() {
    const { clientWidth: w, clientHeight: h } = ui.stage;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.fov = w < 600 ? 62 : 48;
    camera.updateProjectionMatrix();
  }
  new ResizeObserver(resize).observe(ui.stage);
  resize();

  let shift = 0;
  function updateShift(dt) {
    const w = ui.stage.clientWidth, h = ui.stage.clientHeight;
    const overlay = !ui.panel.hidden && getComputedStyle(ui.panel).position === "absolute";
    const want = overlay ? (ui.panel.offsetWidth + 16) / 2 : 0;
    shift += (want - shift) * (reduce ? 1 : Math.min(1, dt * 5));
    if (Math.abs(shift) < 0.5 && want === 0) { if (camera.view) camera.clearViewOffset(); shift = 0; }
    else camera.setViewOffset(w, h, shift, 0, w, h);
  }

  const clock = new THREE.Clock();
  function tick() {
    const dt = Math.min(clock.getDelta(), 0.05), t = clock.elapsedTime, now = performance.now();

    if (tween) {
      const k = Math.min(1, (now - tween.start) / tween.dur), e = ease(k);
      const { c0, c1, da } = tween;
      const r = c0.r + (c1.r - c0.r) * e, a = c0.a + da * e;
      const lift = Math.sin(Math.PI * e) * (mode === "focus" ? 1.2 : 0);
      camera.position.set(Math.cos(a) * r, c0.y + (c1.y - c0.y) * e + lift, Math.sin(a) * r);
      controls.target.lerpVectors(tween.t0, tween.t1, e);
      if (k >= 1) { tween = null; controls.enabled = true; setLimits(); }
    } else if (mode === "overview" && !reduce && now - idleSince > 6000) {
      controls.autoRotate = true;
    }
    controls.update();
    updateShift(dt);
    // Keep the camera inside the room
    const rr = Math.hypot(camera.position.x, camera.position.z);
    if (rr > 13.3) { camera.position.x *= 13.3 / rr; camera.position.z *= 13.3 / rr; }
    if (camera.position.y < 0.6) camera.position.y = 0.6;

    updateHover();
    anim.forEach((f) => f(t, dt));
    slots.forEach((s, i) => {
      s.hover += ((i === hovered ? 1 : 0) - s.hover) * Math.min(1, dt * 10);
      if (EXHIBITS[i].kind !== "monument") s.art.scale.setScalar(s.baseScale * (1 + s.hover * 0.08));
    });

    if (dustN) {
      const p = dustGeo.attributes.position.array;
      for (let k = 1; k < p.length; k += 3) { p[k] += dt * 0.08; if (p[k] > 8.6) p[k] = 0; }
      dustGeo.attributes.position.needsUpdate = true;
    }

    if (burstState) {
      const age = (now - burstState.start) / 1000, p = burstGeo.attributes.position.array;
      burstState.vel.forEach((v, k) => {
        p[k * 3] = burstState.origin.x + v.x * age;
        p[k * 3 + 1] = burstState.origin.y + v.y * age - 2.4 * age * age;
        p[k * 3 + 2] = burstState.origin.z + v.z * age;
      });
      burstGeo.attributes.position.needsUpdate = true;
      burstMat.opacity = Math.max(0, 1 - age / 1.8);
      if (age > 1.8) burstState = null;
    }

    renderer.render(scene, camera);
  }

  let running = false;
  new IntersectionObserver(([en]) => {
    const want = en.isIntersecting;
    if (want === running) return;
    running = want;
    if (running) clock.getDelta();
    renderer.setAnimationLoop(running ? tick : null);
  }, { threshold: 0.01 }).observe(ui.stage);
  renderer.render(scene, camera);
  return api;
}

/* ─── Start ───────────────────────────────────────────────────────────── */
async function fontsReady() {
  if (!document.fonts) return;
  const load = Promise.all([
    document.fonts.load(`400 48px ${SERIF}`), document.fonts.load(`italic 400 48px ${SERIF}`),
    document.fonts.load(`500 48px ${SERIF}`), document.fonts.load(`400 24px ${SANS}`),
  ]).catch(() => {});
  await Promise.race([load, new Promise((r) => setTimeout(r, 2500))]);
}

async function start() {
  if (!ui.stage) return;
  buildChrome();
  await fontsReady();
  scene3d = buildScene();
  if (scene3d) {
    ui.loading.remove();
    if (current !== null) scene3d.focus(current);
  } else {
    ui.stage.classList.add("no-webgl");
    ui.loading.textContent = "3D isn't available in this browser. You can still explore every artifact with the list below.";
  }
  if (stamps.size === N) ui.tour.textContent = "Tour again";
}

start();
