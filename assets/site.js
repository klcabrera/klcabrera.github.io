/* Kian · portfolio behaviour: theme, phone menu, scroll reveal, count-up, tabs, chart tips, page fade. */
(function () {
  var root = document.documentElement;
  var still = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // theme toggle (remembered per browser; falls back silently when storage is blocked)
  var btn = document.querySelector(".theme");
  function isDark() {
    var t = root.getAttribute("data-theme");
    if (t) return t === "dark";
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  }
  if (btn) btn.addEventListener("click", function () {
    var next = isDark() ? "light" : "dark";
    root.setAttribute("data-theme", next);
    try { localStorage.setItem("kc-theme", next); } catch (e) {}
  });

  // phone menu
  var mb = document.querySelector(".menu-btn"), panel = document.getElementById("mnav");
  function setMenu(open) {
    if (!mb || !panel) return;
    mb.setAttribute("aria-expanded", open ? "true" : "false");
    panel.hidden = !open;
    document.body.classList.toggle("menu-open", open);
  }
  if (mb) mb.addEventListener("click", function () { setMenu(panel.hidden); });
  document.addEventListener("keydown", function (ev) { if (ev.key === "Escape") setMenu(false); });
  if (panel) panel.addEventListener("click", function (ev) { if (ev.target.closest("a")) setMenu(false); });

  // count-up for big numbers
  function countUp(el) {
    var end = parseFloat(el.getAttribute("data-count")), txt = el.textContent;
    if (still || isNaN(end)) return;
    var t0 = null, dur = 1100;
    function step(ts) {
      if (!t0) t0 = ts;
      var p = Math.min(1, (ts - t0) / dur), v = Math.round(end * (1 - Math.pow(1 - p, 3)));
      el.textContent = v.toLocaleString("en-US");
      if (p < 1) requestAnimationFrame(step); else el.textContent = txt;
    }
    requestAnimationFrame(step);
  }

  // scroll reveal, staggered within each group
  var items = Array.prototype.slice.call(document.querySelectorAll(".reveal"));
  if (still || !("IntersectionObserver" in window)) {
    items.forEach(function (el) { el.classList.add("reveal-visible"); });
  } else {
    items.forEach(function (el) { el.classList.add("reveal-pending"); });
    var io = new IntersectionObserver(function (entries) {
      var batch = entries.filter(function (en) { return en.isIntersecting; });
      batch.forEach(function (en, i) {
        var el = en.target;
        el.style.transitionDelay = Math.min(i * 80, 400) + "ms";
        el.classList.remove("reveal-pending"); el.classList.add("reveal-visible");
        el.querySelectorAll("[data-count]").forEach(countUp);
        setTimeout(function () { el.style.transitionDelay = ""; }, 1400);
        io.unobserve(el);
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    items.forEach(function (el) { io.observe(el); });
  }

  // tabs
  document.querySelectorAll("[data-tabs]").forEach(function (box) {
    var tabs = box.querySelectorAll("[role=tab]");
    function sel(t) {
      tabs.forEach(function (x) {
        var on = x === t;
        x.setAttribute("aria-selected", on ? "true" : "false"); x.tabIndex = on ? 0 : -1;
        document.getElementById(x.getAttribute("aria-controls")).hidden = !on;
      });
    }
    tabs.forEach(function (t, i) {
      t.addEventListener("click", function () { sel(t); });
      t.addEventListener("keydown", function (ev) {
        if (ev.key === "ArrowRight" || ev.key === "ArrowLeft") {
          var n = tabs[(i + (ev.key === "ArrowRight" ? 1 : tabs.length - 1)) % tabs.length]; sel(n); n.focus();
        }
      });
    });
  });

  // chart tooltips
  var tip = document.getElementById("tip");
  document.querySelectorAll(".bar").forEach(function (b) {
    function show(x, y) { tip.textContent = b.getAttribute("data-tip"); tip.style.left = (x + 12) + "px"; tip.style.top = (y + 12) + "px"; tip.style.opacity = 1; }
    b.addEventListener("mousemove", function (ev) { show(ev.clientX, ev.clientY); });
    b.addEventListener("focus", function () { var r = b.getBoundingClientRect(); show(r.left, r.top); });
    b.addEventListener("mouseleave", function () { tip.style.opacity = 0; });
    b.addEventListener("blur", function () { tip.style.opacity = 0; });
  });

  // page fade-out on internal navigation
  if (!still) document.addEventListener("click", function (ev) {
    var a = ev.target.closest("a");
    if (!a || ev.defaultPrevented || ev.button !== 0 || ev.metaKey || ev.ctrlKey || ev.shiftKey || ev.altKey) return;
    var h = a.getAttribute("href") || "";
    if (a.hasAttribute("download") || a.target || h.charAt(0) === "#" || /^(mailto:|tel:|https?:)/.test(h) || h.indexOf("#") > -1 && a.pathname === location.pathname) return;
    ev.preventDefault();
    document.body.classList.add("leaving");
    setTimeout(function () { location.href = a.href; }, 170);
  });
  window.addEventListener("pageshow", function () { document.body.classList.remove("leaving"); });
})();
