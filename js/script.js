/* Renders the Reading Room, Timeline and header stats from the data below.
   The site is fully static: no PHP or database needed. */

const $ = (id) => document.getElementById(id);

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text != null) node.textContent = text;
  return node;
}

/* Exhibit content (formerly in the MySQL database). Edit here to change the Reading Room and Timeline. */
const EXHIBITS = [
  {
    title: "Noli Me Tangere",
    category: "Novel",
    year_written: "1887",
    place: "Berlin",
    summary: "Rizal's first novel, a portrait of Philippine society under Spanish rule.",
    body: "Published in Berlin in March 1887, the novel follows Crisóstomo Ibarra as he returns from Europe and finds a country governed by fear. Through the friars, the civil guard and the local elite, Rizal shows how abuse of power was woven into everyday life: in the church, the school and the courtroom. Readers in the Philippines were given a shared picture of their own society for the first time. Spanish authorities banned the book, yet copies circulated in secret, and its characters became a common vocabulary for discussing injustice.",
  },
  {
    title: "Sobre la Indolencia de los Filipinos",
    category: "Essay",
    year_written: "1890",
    place: "Barcelona",
    summary: "An essay answering the claim that Filipinos were naturally lazy.",
    body: "Serialized in La Solidaridad in 1890, the essay argues that the so-called indolence of Filipinos was a result of colonial policy, not character. Forced labor, heavy taxes, poor education and the lack of opportunity discouraged effort. Rizal also points to the climate and to the loss of pre-colonial trade. By rejecting a stereotype used to justify Spanish rule, he helped Filipinos see their condition as a product of history that could be changed.",
  },
  {
    title: "El Filibusterismo",
    category: "Novel",
    year_written: "1891",
    place: "Ghent",
    summary: "The sequel, darker in tone, dedicated to Gomez, Burgos and Zamora.",
    body: "Published in Ghent in September 1891, the sequel follows Simoun, a wealthy jeweler who plots revenge against the colonial order. The book is more openly political than the Noli. It questions whether reform through Spanish institutions can work and examines the cost of violent revolution. Its dedication to the priests executed in 1872 links Rizal's work directly to the memory of that injustice. Later generations read it as a warning that liberation requires moral preparation as well as courage.",
  },
  {
    title: "Mi Último Adiós",
    category: "Poem",
    year_written: "1896",
    place: "Fort Santiago, Manila",
    summary: "A farewell poem written in Rizal's cell before his execution.",
    body: "Rizal wrote the poem in the last days before December 30, 1896, and it was found after his death. It has no title in the original manuscript; the name by which it is known was given later. The poem speaks of dying for the country without asking for reward, and it addresses the homeland directly as a beloved. Translated into many languages, it has been read at public gatherings for over a century and remains a common way for Filipinos to express love of country.",
  },
];

const TIMELINE = [
  {
    year: 1861,
    date_label: "June 19",
    title: "Born in Calamba, Laguna",
    description: "José Protasio Rizal Mercado y Alonso Realonda is born, the seventh of eleven children in a landholding family.",
  },
  {
    year: 1872,
    date_label: "February 17",
    title: "Execution of Gomburza",
    description: "Fathers Gomez, Burgos and Zamora are executed after the Cavite mutiny. Rizal, aged 10, later credits the event with shaping his purpose.",
  },
  {
    year: 1877,
    date_label: "March",
    title: "Graduates from Ateneo",
    description: "Rizal finishes his Bachelor of Arts at the Ateneo Municipal and goes on to study at the University of Santo Tomás.",
  },
  {
    year: 1882,
    date_label: "May 3",
    title: "Leaves for Spain",
    description: "He sails to Madrid to continue medical studies and joins the circle of Filipino reformists abroad.",
  },
  {
    year: 1887,
    date_label: "March",
    title: "Noli Me Tangere published",
    description: "The novel is printed in Berlin with the help of friends and is soon banned in the Philippines.",
  },
  {
    year: 1889,
    date_label: "February",
    title: "Writes for La Solidaridad",
    description: "Rizal begins contributing to the reform newspaper of Filipinos in Spain, arguing for representation and equal rights.",
  },
  {
    year: 1891,
    date_label: "September",
    title: "El Filibusterismo published",
    description: "The second novel is printed in Ghent and dedicated to Gomburza.",
  },
  {
    year: 1892,
    date_label: "July 3",
    title: "Founds La Liga Filipina",
    description: "Back in Manila, Rizal forms a civic association for mutual aid and reform. He is arrested three days later and deported to Dapitan.",
  },
  {
    year: 1892,
    date_label: "July 17",
    title: "Exile in Dapitan begins",
    description: "During four years of exile he runs a clinic, teaches boys, and helps build a water system for the town.",
  },
  {
    year: 1896,
    date_label: "August",
    title: "Katipunan revolt begins",
    description: "Rizal, on his way to Cuba as a volunteer army doctor, is arrested aboard ship and returned to Manila for trial.",
  },
  {
    year: 1896,
    date_label: "December 30",
    title: "Executed at Bagumbayan",
    description: "Convicted of rebellion, Rizal is shot by firing squad at Bagumbayan, now Rizal Park. He is 35.",
  },
];

/* ─── Exhibits: each work is a 3D book; turn it over to read its influence ─ */
const COVERS = { Novel: ["#7a2a22", "#1f2a44"], Essay: ["#2f4a3c"], Poem: ["#5a3a1e"] };

// Long single words (FILIBUSTERISMO) must still fit the cover
function fitTitle(node, title) {
  const longest = Math.max(...title.split(" ").map((w) => w.length));
  node.style.fontSize = `${Math.min(36, Math.floor(230 / (longest * 0.66)))}px`;
  return node;
}

function renderExhibits(items) {
  const list = $("exhibit-list");
  if (!items.length) {
    list.replaceChildren(el("p", "status", "No exhibits have been added yet."));
    return;
  }
  const seen = {};
  list.replaceChildren(
    ...items.map((ex) => {
      const palette = COVERS[ex.category] || ["#26355d"];
      const color = palette[(seen[ex.category] = (seen[ex.category] ?? -1) + 1) % palette.length];

      const card = el("article", "exhibit book3d");
      card.style.setProperty("--cover", color);
      const inner = el("div", "b3-inner");

      const front = el("div", "b3-face b3-front");
      const flip = el("button", "b3-flip", "Read its influence");
      flip.type = "button";
      front.append(
        el("span", "b3-author", "José Rizal"),
        fitTitle(el("h3", "b3-title", ex.title), ex.title),
        el("p", "b3-sum", ex.summary),
        el("span", "badge", ex.category),
        el("span", "b3-year", `${ex.place} · ${ex.year_written}`),
        flip
      );

      const back = el("div", "b3-face b3-back");
      const flipBack = el("button", "b3-flip", "Back to the cover");
      flipBack.type = "button";
      back.append(
        el("p", "b3-kicker", "Influence on the nation"),
        el("h3", "b3-back-title", ex.title),
        el("p", "b3-body", ex.body),
        el("p", "exhibit-place", `Written in ${ex.place}, ${ex.year_written}`),
        flipBack
      );

      inner.append(front, el("div", "b3-spine"), el("div", "b3-pages"), back);
      card.append(inner);

      const turn = (open) => {
        card.classList.toggle("open", open);
        front.inert = open;
        back.inert = !open;
        (open ? flipBack : flip).focus({ preventScroll: true });
      };
      back.inert = true;
      flip.addEventListener("click", (e) => { e.stopPropagation(); turn(true); });
      flipBack.addEventListener("click", (e) => { e.stopPropagation(); turn(false); });
      card.addEventListener("click", (e) => {
        if (e.target.closest("button") || getSelection().toString()) return;
        turn(!card.classList.contains("open"));
      });
      return card;
    })
  );
}

/* ─── Timeline ────────────────────────────────────────────────────────── */
function renderTimeline(items) {
  const list = $("timeline-list");
  if (!items.length) {
    list.replaceChildren(el("p", "status", "The timeline is empty."));
    return;
  }
  list.replaceChildren(
    ...items.map((ev, i) => {
      const row = el("article", "row event" + (i === items.length - 1 ? " final" : ""));
      const when = el("div");
      when.append(el("span", "event-year", String(ev.year)), el("span", "event-date", ev.date_label));
      const what = el("div");
      what.append(el("h3", "event-title", ev.title), el("p", "event-desc", ev.description));
      row.append(when, what);
      return row;
    })
  );
}

/* ─── Header stats ────────────────────────────────────────────────────── */
function setMeta() {
  const stat = (n, label) => {
    const p = el("p", "header-meta");
    p.append(el("span", "meta-count", String(n)), el("span", "meta-label", label));
    return p;
  };
  $("header-meta").replaceChildren(
    stat(EXHIBITS.length, "Works on display"),
    stat(TIMELINE.length, "Milestones"),
    stat(11, "Places on the journey"),
    stat("1861–96", "Rizal's lifetime")
  );
}

renderExhibits(EXHIBITS);
renderTimeline(TIMELINE);
setMeta();
