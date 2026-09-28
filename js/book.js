/* "From the Archive": a book you can page through in both directions. */
(() => {
  const PAGES = [
    { title: "Noli Me Tangere", where: "Berlin, 1887",
      glance: [["Form", "Novel, in Spanish"], ["Finished", "21 February 1887"], ["Printer", "Berliner Buchdruckerei-Actien-Gesellschaft"], ["Print run", "2,000 copies for about ₱300"], ["Title", "Latin for “Touch me not” (John 20)"]],
      text: ["Rizal finished his first novel in Berlin, sick and short of money. He nearly gave up on printing it until his friend Máximo Viola lent him about 300 pesos. After comparing several shops, they chose one with the lowest quote for 2,000 copies.",
             "The book came off the press in March 1887. Accounts say Rizal cut a chapter, “Elias and Salome,” to save on costs. He gave Viola the manuscript as thanks, and the two carried copies across Europe."],
      source: "National Library of the Philippines; NHCP account of Viola" },
    { title: "Annotations to Morga", where: "Paris, 1890",
      glance: [["Form", "Annotated history"], ["Original", "Antonio de Morga, Sucesos de las Islas Filipinas (1609)"], ["Edited by", "Rizal, with notes and a preface"], ["Purpose", "Show a Philippines that existed before Spain"]],
      text: ["Rizal spent months in the British Museum reading early Spanish records. He then re-issued Morga’s 1609 history with his own commentary, arguing that Filipinos had trade, law and art before colonisation.",
             "The point was political. If Filipinos had a past of their own, the claim that colonial rule was their only path to civilisation was harder to defend."],
      source: "Standard Rizal biographies (Guerrero; Ocampo); verify against your course text" },
    { title: "The Indolence of the Filipino", where: "La Solidaridad, 1890",
      glance: [["Form", "Essay, serialised"], ["Published", "July–September 1890"], ["Journal", "La Solidaridad, the reform paper printed in Spain"], ["Claim", "Idleness was a result of colonial conditions"]],
      text: ["Colonial writers often called Filipinos naturally lazy. Rizal answered that heat, forced labour, poor pay and discouraging rule explained the pattern, and that the accusation itself was a habit of colonial thinking.",
             "The essay shows his method: take a stereotype, trace its causes, and turn it back on the system that produced it."],
      source: "Rizal’s essay in La Solidaridad; standard histories. Verify dates against your course text" },
    { title: "El Filibusterismo", where: "Ghent, 1891",
      glance: [["Form", "Novel, in Spanish"], ["Begun", "October 1887, Calamba"], ["Finished", "29 March 1891, Biarritz"], ["Press", "F. Meyer-Van Loo, Ghent (paid by instalment)"], ["Off the press", "18 September 1891"], ["Dedicated to", "Gomez, Burgos and Zamora"]],
      text: ["Rizal moved to Ghent because printing was cheaper. He pawned his jewellery to pay the printer, and on 6 August 1891 printing stopped when the money ran out. Valentin Ventura, a friend in Paris, sent funds so it could resume.",
             "Rizal dedicated the novel to the priests executed in 1872, though he misstated their ages and the date. Copies were shipped to Hong Kong in wooden boxes, and most were confiscated."],
      source: "NHCP-based histories; Rizal101 timeline; course summaries" },
    { title: "La Liga Filipina", where: "Tondo, Manila, 1892",
      glance: [["Founded", "3 July 1892"], ["Place", "House of Doroteo Ongjunco, Ilaya Street"], ["Aims", "Unity, mutual aid, defence against injustice, education and trade, reform"], ["Arrest", "6 July 1892"]],
      text: ["Rizal returned from abroad in June 1892 to work for reform at home. His league aimed to unite the islands into one body, with scholarships, legal aid and cooperatives. It did not call for independence.",
             "Authorities saw it as a threat and arrested him three days later. After his exile, Domingo Franco and Andrés Bonifacio reorganised what remained, and the Liga split into reformist and radical currents."],
      source: "joserizal.com; Inquirer research desk; standard histories" },
    { title: "Exile in Dapitan", where: "Mindanao, 1892–1896",
      glance: [["Sailed", "Night of 14–15 July 1892, on the steamer Cebu"], ["Arrived", "17 July 1892"], ["Left", "31 July 1896, on the España"], ["Work", "Physician, teacher, builder of a waterworks"]],
      text: ["Rizal spent four years in Dapitan as a doctor. Reports of his eye operations drew patients from afar, and he taught local boys and worked on public projects. He also met Josephine Bracken here.",
             "The exile was meant to silence him. Instead, letters and visitors kept him at the centre of the movement, and news of him spread. He left in 1896, hoping to serve as a physician in Cuba."],
      source: "NHCP-based histories; course summaries. Verify details against your course text" },
    { title: "Mi Último Adiós", where: "Fort Santiago, 1896",
      glance: [["Held", "3 November – 29 December 1896 (56 days)"], ["Form", "Poem, 14 stanzas, untitled by Rizal"], ["Hidden in", "An alcohol stove from the Pardo de Tavera family"], ["Executed", "30 December 1896, 7:03 a.m., Bagumbayan"]],
      text: ["On his last evening Rizal gave the stove to his sister Trinidad and told her in English that something was inside. It was his farewell poem. The family copied it, and Mariano Ponce printed it in Hong Kong in early 1897.",
             "Rizal bade farewell to his homeland and asked only that his death count for something. Within months the revolution he had not led was under way, and the poem became its most widely read text."],
      source: "Intramuros Administration / NHCP; NPDC; Ocampo, Philippine Daily Inquirer" },
  ];

  const $ = (id) => document.getElementById(id);
  if (!$("book")) return;
  const el = (tag, cls, txt) => { const n = document.createElement(tag); if (cls) n.className = cls; if (txt != null) n.textContent = txt; return n; };
  const left = $("pg-left"), right = $("pg-right");
  const R = { leaf: $("leaf-r"), front: $("lr-front"), back: $("lr-back") };
  const L = { leaf: $("leaf-l"), front: $("ll-front"), back: $("ll-back") };
  const prev = $("book-prev"), next = $("book-next"), count = $("book-count"), dotsBox = $("book-dots");
  const DURATION = matchMedia("(prefers-reduced-motion: reduce)").matches ? 30 : 1150;
  const N = PAGES.length;

  const fillLeft = (pg, i) => {
    const p = PAGES[i], dl = el("dl", "glance");
    p.glance.forEach(([k, v]) => { const row = el("div"); row.append(el("dt", null, k), el("dd", null, v)); dl.append(row); });
    pg.replaceChildren(el("p", "pg-num", `Page ${i + 1} of ${N}`), el("h3", "pg-src", p.title), el("p", "pg-where", p.where), dl);
  };
  const fillRight = (pg, i) => {
    const p = PAGES[i], head = el("div", "pg-mhead");
    head.append(el("h3", "pg-src", p.title), el("p", "pg-where", p.where));
    pg.replaceChildren(head, ...p.text.map((t) => el("p", "pg-text", t)), el("p", "pg-source", `Sources: ${p.source}`));
  };

  const dots = PAGES.map((p, i) => {
    const b = el("button", "dot"); b.type = "button";
    b.setAttribute("aria-label", `Go to page ${i + 1}: ${p.title}`);
    b.addEventListener("click", () => go(i));
    dotsBox.append(b); return b;
  });

  let cur = 0, busy = false;
  const sync = () => {
    prev.disabled = cur === 0; next.disabled = cur === N - 1;
    dots.forEach((d, i) => d.setAttribute("aria-current", String(i === cur)));
    count.textContent = `${PAGES[cur].title}, page ${cur + 1} of ${N}`;
  };
  fillLeft(left, 0); fillRight(right, 0); sync();

  function go(target) {
    if (busy || target === cur || target < 0 || target >= N) return;
    busy = true;
    const forward = target > cur, s = forward ? R : L, from = cur;
    if (forward) { fillRight(s.front, from); fillLeft(s.back, target); fillRight(right, target); }
    else         { fillLeft(s.front, from);  fillRight(s.back, target); fillLeft(left, target); }
    s.leaf.classList.add("reset"); s.leaf.classList.remove("turning");
    s.leaf.classList.add("active");
    void s.leaf.offsetWidth;
    s.leaf.classList.remove("reset");
    s.leaf.classList.add("turning");
    cur = target; sync();
    setTimeout(() => {
      if (forward) fillLeft(left, target); else fillRight(right, target);
      s.leaf.classList.add("reset");
      s.leaf.classList.remove("turning", "active");
      void s.leaf.offsetWidth;
      s.leaf.classList.remove("reset");
      busy = false;
    }, DURATION);
  }

  prev.addEventListener("click", () => go(cur - 1));
  next.addEventListener("click", () => go(cur + 1));
  $("book").addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight") go(cur + 1);
    if (e.key === "ArrowLeft") go(cur - 1);
  });
})();