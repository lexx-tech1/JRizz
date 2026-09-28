/* Top navigation: mobile menu + highlight the section being read. */
(() => {
  const btn = document.getElementById("menu-btn"), menu = document.getElementById("menu");
  if (!btn || !menu) return;
  const close = () => { menu.classList.remove("open"); btn.setAttribute("aria-expanded", "false"); };
  btn.addEventListener("click", () => {
    const open = menu.classList.toggle("open");
    btn.setAttribute("aria-expanded", String(open));
  });
  menu.addEventListener("click", (e) => { if (e.target.closest("a")) close(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") close(); });

  const links = [...menu.querySelectorAll("a")];
  const byId = new Map(links.map((a) => [a.getAttribute("href").slice(1), a]));
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      links.forEach((a) => a.classList.remove("active"));
      const a = byId.get(en.target.id);
      if (a) { a.classList.add("active"); a.setAttribute("aria-current", "true"); }
      links.filter((x) => x !== a).forEach((x) => x.removeAttribute("aria-current"));
    });
  }, { rootMargin: "-35% 0px -55% 0px" });
  byId.forEach((_, id) => { const s = document.getElementById(id); if (s) io.observe(s); });
})();