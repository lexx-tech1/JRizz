/* CSS 3D touches for the non-WebGL sections:
   books that tilt toward the cursor, a timeline that rolls like a drum as you scroll,
   and a hero and archive book that lean with the mouse. */
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = matchMedia("(pointer: fine)").matches;

  /* Tilt: any element with [data-tilt], plus the Reading Room books */
  function tilt(elem, e, max) {
    const r = elem.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
    elem.style.setProperty("--ry", `${x * max}deg`);
    elem.style.setProperty("--rx", `${-y * max}deg`);
    elem.style.setProperty("--gx", `${(x + 0.5) * 100}%`);
    elem.style.setProperty("--gy", `${(y + 0.5) * 100}%`);
  }
  function untilt(elem) {
    elem.style.setProperty("--ry", "0deg");
    elem.style.setProperty("--rx", "0deg");
  }
  if (fine && !reduce) {
    const shelf = document.getElementById("exhibit-list");
    shelf?.addEventListener("pointermove", (e) => {
      const b = e.target.closest(".book3d");
      if (b) tilt(b, e, 22);
    });
    shelf?.addEventListener("pointerout", (e) => {
      const b = e.target.closest(".book3d");
      if (b && !b.contains(e.relatedTarget)) untilt(b);
    });
    document.querySelectorAll("[data-tilt]").forEach((elem) => {
      const max = Number(elem.dataset.tilt) || 6;
      elem.addEventListener("pointermove", (e) => tilt(elem, e, max));
      elem.addEventListener("pointerleave", () => untilt(elem));
    });
  }

  /* Books rise onto the shelf one after another */
  const shelfIO = new IntersectionObserver((es) => es.forEach((en) => {
    if (!en.isIntersecting) return;
    en.target.classList.add("in");
    shelfIO.unobserve(en.target);
  }), { threshold: 0.2 });
  const shelve = () => document.querySelectorAll(".book3d:not([data-seen])").forEach((b, i) => {
    b.dataset.seen = 1;
    b.style.setProperty("--d", `${i * 90}ms`);
    shelfIO.observe(b);
  });
  new MutationObserver(shelve).observe(document.getElementById("exhibit-list") || document.body, { childList: true });
  shelve();

  /* Timeline drum: rows near the middle of the screen face you, the rest roll away */
  const events = () => document.querySelectorAll("#timeline-list .event");
  let queued = false;
  function drum() {
    queued = false;
    const mid = innerHeight / 2;
    events().forEach((ev) => {
      const r = ev.getBoundingClientRect();
      const d = Math.max(-1, Math.min(1, (r.top + r.height / 2 - mid) / (innerHeight * 0.65)));
      ev.style.setProperty("--tl-rx", `${d * -38}deg`);
      ev.style.setProperty("--tl-z", `${-Math.abs(d) * 120}px`);
      ev.style.setProperty("--tl-o", `${1 - Math.abs(d) * 0.55}`);
      ev.classList.toggle("focus", Math.abs(d) < 0.16);
    });
  }
  if (!reduce) {
    addEventListener("scroll", () => { if (!queued) { queued = true; requestAnimationFrame(drum); } }, { passive: true });
    addEventListener("resize", drum);
    new MutationObserver(drum).observe(document.getElementById("timeline-list"), { childList: true });
    drum();
  }
})();
