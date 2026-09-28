/* Pen & ink layer. Builds on script.js (reuses its $ and el helpers). */
const root = document.documentElement;
root.classList.add("js");
const $$ = (s, c = document) => [...c.querySelectorAll(s)];

// Static content for the new sections. Later idea: move into DB tables.
const STOPS = [
  ["1861", "Calamba", "Birthplace, in Laguna."],
  ["1872", "Manila", "Studies at the Ateneo, then Santo Tomás."],
  ["1882", "Madrid", "Medical studies and the reformist circle."],
  ["1885", "Paris", "Eye-doctor training."],
  ["1886", "Heidelberg", "Eye surgery, and work on the Noli."],
  ["1887", "Berlin", "Noli Me Tangere goes to press."],
  ["1888", "London", "Annotates Morga's history at the British Museum."],
  ["1891", "Ghent", "El Filibusterismo is printed."],
  ["1891", "Hong Kong", "Practices medicine, plans his return."],
  ["1892", "Dapitan", "Exile: clinic, school and waterworks."],
  ["1896", "Bagumbayan", "Executed on December 30."],
];
const FACTS = [
  ["Noli me tangere is Latin for “touch me not.” Rizal used it for a book about the social sores no one wanted to name.", "Noli Me Tangere · 1887"],
  ["Rizal wrote under pen names, including Laong Laan and Dimasalang, in the reform paper La Solidaridad.", "La Solidaridad · 1889–1895"],
  ["In London he annotated Antonio de Morga's 1609 history of the Philippines, arguing Filipinos had a culture before Spain. It was published in Paris in 1890.", "Sucesos de las Islas Filipinas"],
  ["Before his execution he hid Mi Último Adiós inside an alcohol stove and passed it to his sister Trinidad. It came to light after his death.", "Fort Santiago · 1896"],
];

/* Reveal on scroll */
let fresh = false;
const io = new IntersectionObserver((es) => es.forEach((e) => {
  if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
}), { threshold: 0.15 });
function watch() {
  $$(".row:not([data-w]), .section-row:not([data-w]), .journey li:not([data-w])").forEach((n) => {
    n.dataset.w = 1;
    if (fresh && n.classList.contains("reflection")) n.classList.add("write-in");
    io.observe(n);
  });
}

/* Exhibit filter chips, built once the API data has rendered */
function buildFilters() {
  const box = $("filters");
  if (box.children.length) return;
  const cats = [...new Set($$("#exhibit-list .badge").map((b) => b.textContent))];
  if (cats.length < 2) return;
  ["All", ...cats].forEach((c, i) => {
    const b = el("button", "chip", c);
    b.type = "button";
    b.setAttribute("aria-pressed", i === 0);
    b.onclick = () => {
      $$(".chip", box).forEach((x) => x.setAttribute("aria-pressed", x === b));
      $$("#exhibit-list .exhibit").forEach((x) => { x.hidden = c !== "All" && x.querySelector(".badge").textContent !== c; });
    };
    box.append(b);
  });
}
new MutationObserver(() => { watch(); buildFilters(); }).observe(document.body, { childList: true, subtree: true });

/* Journey + archive */
$("journey-list").append(...STOPS.map(([y, place, note], i) => {
  const li = el("li");
  li.style.setProperty("--i", i);
  li.append(el("span", "stop-year", y), el("strong", null, place), el("span", "note", note));
  return li;
}));
let fi = 0;
function showFact() {
  const [text, src] = FACTS[fi++ % FACTS.length];
  const fig = $("fact");
  $("fact-text").textContent = text;
  $("fact-src").textContent = src;
  fig.classList.remove("turn"); void fig.offsetWidth; fig.classList.add("turn");
}
$("fact-next").onclick = showFact;
showFact();

/* Scroll progress, timeline ink, scrollspy */
const bar = $("ink-progress"), tl = $("timeline-list"), links = $$(".nav a");
function onScroll() {
  const max = root.scrollHeight - innerHeight;
  bar.style.transform = `scaleX(${max > 0 ? scrollY / max : 0})`;
  const r = tl.getBoundingClientRect();
  tl.style.setProperty("--p", Math.min(1, Math.max(0, (innerHeight * 0.6 - r.top) / r.height)));
}
addEventListener("scroll", onScroll, { passive: true });
onScroll();
const spy = new IntersectionObserver((es) => es.forEach((e) => {
  if (!e.isIntersecting) return;
  links.forEach((a) => a.getAttribute("href") === "#" + e.target.id ? a.setAttribute("aria-current", "true") : a.removeAttribute("aria-current"));
}), { rootMargin: "-35% 0px -60% 0px" });
$$("section[id]").forEach((s) => spy.observe(s));

/* Form polish: warn near the limit, and let new reflections "write in" */
const ta = document.querySelector("#reflection-form textarea");
ta.addEventListener("input", () => { $("char-count").style.color = ta.value.length > 450 ? "var(--c-error-ink)" : ""; });
$("reflection-form").addEventListener("submit", () => {
  fresh = true;
  setTimeout(() => { fresh = false; $("char-count").style.color = ""; }, 6000);
});

