/* Fetches data from the PHP API (api/*.php) and renders the exhibit.
   All text is inserted with textContent, so visitor input can never inject HTML. */

const $ = (id) => document.getElementById(id);

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text != null) node.textContent = text;
  return node;
}

async function getJSON(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Request failed (${res.status})`);
  return res.json();
}

function showError(container, message) {
  container.replaceChildren(el("p", "status error", message));
}

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

/* ─── Reflections ─────────────────────────────────────────────────────── */
function formatDate(value) {
  return new Date(String(value).replace(" ", "T")).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function reflectionNode(r) {
  const row = el("article", "row reflection");
  const by = el("p", "reflection-by");
  by.append(el("strong", null, r.name), document.createTextNode(` · ${formatDate(r.created_at)}`));
  row.append(el("p", "reflection-text", r.message), by);
  return row;
}

function renderReflections(items) {
  const list = $("reflection-list");
  if (!items.length) {
    list.replaceChildren(el("p", "status", "No reflections yet. Be the first to post one."));
    return;
  }
  list.replaceChildren(...items.map(reflectionNode));
}

function setMeta(counts) {
  const box = $("header-meta");
  const stat = (n, label) => {
    const p = el("p", "header-meta");
    p.append(el("span", "meta-count", String(n)), el("span", "meta-label", label));
    return p;
  };
  box.replaceChildren(
    stat(counts.exhibits, "Works on display"),
    stat(counts.timeline, "Milestones"),
    stat(counts.reflections, "Reflections"),
    stat("1861–96", "Rizal's lifetime")
  );
}

/* ─── Guestbook form ──────────────────────────────────────────────────── */
function setupForm(state) {
  const form = $("reflection-form");
  const msg = $("form-msg");
  const btn = $("submit-btn");
  const count = $("char-count");
  const textarea = form.elements.message;

  textarea.addEventListener("input", () => {
    count.textContent = `${textarea.value.length} / 500`;
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    msg.className = "form-msg";
    msg.textContent = "";

    const name = form.elements.name.value.trim();
    const message = textarea.value.trim();
    if (!name) return fail("Enter your name.");
    if (message.length < 10) return fail("Write at least 10 characters.");

    btn.disabled = true;
    btn.textContent = "Posting…";
    try {
      const res = await fetch("api/submit_reflection.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, message }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not post your reflection.");

      // Show it straight away, at the top of the list
      const list = $("reflection-list");
      if (list.querySelector(".status")) list.replaceChildren();
      list.prepend(reflectionNode(data));
      state.reflections += 1;
      setMeta(state);

      form.reset();
      count.textContent = "0 / 500";
      msg.textContent = "Reflection posted.";
    } catch (err) {
      fail(err.message);
    } finally {
      btn.disabled = false;
      btn.textContent = "Post reflection";
    }

    function fail(text) {
      msg.className = "form-msg error";
      msg.textContent = text;
    }
  });
}

/* ─── Start ───────────────────────────────────────────────────────────── */
async function init() {
  const state = { exhibits: 0, timeline: 0, reflections: 0 };

  const jobs = [
    getJSON("api/get_exhibits.php").then((d) => { state.exhibits = d.length; renderExhibits(d); })
      .catch(() => showError($("exhibit-list"), "Exhibits could not be loaded. Check that Apache and MySQL are running.")),
    getJSON("api/get_timeline.php").then((d) => { state.timeline = d.length; renderTimeline(d); })
      .catch(() => showError($("timeline-list"), "The timeline could not be loaded.")),
    getJSON("api/get_reflections.php").then((d) => { state.reflections = d.length; renderReflections(d); })
      .catch(() => showError($("reflection-list"), "Reflections could not be loaded.")),
  ];

  await Promise.all(jobs);
  setMeta(state);
  setupForm(state);
}

init();