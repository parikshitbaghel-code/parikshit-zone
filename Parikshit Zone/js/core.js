/* ZONE — shared application shell (every page) */
(() => {
  const Z = (window.Z = {});
  Z.$ = (s, r = document) => r.querySelector(s);
  Z.$$ = (s, r = document) => [...r.querySelectorAll(s)];
  Z.rand = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;
  Z.pick = (arr) => arr[Z.rand(0, arr.length - 1)];
  Z.esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  Z.reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  Z.DPR = Math.min(devicePixelRatio || 1, 2);
  Z.param = (k) => new URLSearchParams(location.search).get(k);
  Z.fitCanvas = (cv) => {
    const r = cv.getBoundingClientRect();
    cv.width = Math.max(1, r.width * Z.DPR);
    cv.height = Math.max(1, r.height * Z.DPR);
    const c = cv.getContext("2d");
    c.setTransform(Z.DPR, 0, 0, Z.DPR, 0, 0);
    return { c, w: r.width, h: r.height };
  };
  Z.apps = () => window.ZONE_APPS || [];
  Z.app = (id) => Z.apps().find((a) => a.id === id);
  Z.cat = (id) => (window.SITE.categories || {})[id] || "Security";
  Z.productUrl = (id) => `product.html?id=${encodeURIComponent(id)}`;
  Z.icon = (id, cls = "") => `<svg class="${cls}"><use href="#${id}"/></svg>`;

  const S = window.SITE;
  const page = document.body.dataset.page || "";

  /* ---------- icon sprite ---------- */
  const sym = (id, d) => `<symbol id="${id}" viewBox="0 0 24 24">${d}</symbol>`;
  document.body.insertAdjacentHTML("afterbegin", `
  <svg width="0" height="0" style="position:absolute" aria-hidden="true">
    <defs><linearGradient id="gradCM" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#2de1b4"/><stop offset="1" stop-color="#7c8cff"/></linearGradient>
    <filter id="glow"><feGaussianBlur stdDeviation="2.2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
    ${sym("i-shield", '<path d="M12 2 4 5v6c0 5 3.4 9.4 8 11 4.6-1.6 8-6 8-11V5z"/><path d="m9 12 2 2 4-4"/>')}
    ${sym("i-radar", '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><path d="M12 12 19 5"/><circle cx="12" cy="12" r="1"/>')}
    ${sym("i-bug", '<rect x="7" y="7" width="10" height="13" rx="5"/><path d="M12 7V4M9 4l1.5 3M15 4l-1.5 3M3 12h4M17 12h4M4 7l3 2M20 7l-3 2M4 18l3-2M20 18l-3-2M12 11v9"/>')}
    ${sym("i-key", '<circle cx="8" cy="15" r="4"/><path d="m11 12 9-9M17 6l3 3M14 9l2 2"/>')}
    ${sym("i-net", '<circle cx="12" cy="5" r="2.5"/><circle cx="5" cy="19" r="2.5"/><circle cx="19" cy="19" r="2.5"/><path d="M12 7.5v4M12 11.5 6.5 17M12 11.5l5.5 5.5M7.5 19h9"/>')}
    ${sym("i-logs", '<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 8h8M8 12h8M8 16h5"/>')}
    ${sym("i-term", '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="m7 9 3 3-3 3M12 15h5"/>')}
    ${sym("i-globe", '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3.5 3 14.5 0 18M12 3c-3 3.5-3 14.5 0 18"/>')}
    ${sym("i-grid", '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>')}
    ${sym("i-bolt", '<path d="M13 2 4 14h7l-1 8 9-12h-7z"/>')}
    ${sym("i-eye", '<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>')}
    ${sym("i-traffic", '<path d="M2 12h4l3-8 4 16 3-8h6"/>')}
    ${sym("i-mail", '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>')}
    ${sym("i-android", '<rect x="5" y="9" width="14" height="10" rx="2"/><path d="M5 9a7 7 0 0 1 14 0M8 4 9.5 6.5M16 4l-1.5 2.5"/><circle cx="9.5" cy="12.5" r=".6"/><circle cx="14.5" cy="12.5" r=".6"/>')}
    ${sym("i-api", '<path d="M8 6 3 12l5 6M16 6l5 6-5 6M14 4l-4 16"/>')}
    ${sym("i-code", '<path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><path d="M14 3v6h6M10 13l-2 2 2 2M14 13l2 2-2 2"/>')}
    ${sym("i-check", '<path d="m5 12 4 4 10-10"/>')}
    ${sym("i-x", '<path d="M6 6l12 12M18 6 6 18"/>')}
    ${sym("i-arrow", '<path d="M5 12h14M13 6l6 6-6 6"/>')}
    ${sym("i-back", '<path d="M19 12H5M11 6l-6 6 6 6"/>')}
    ${sym("i-play", '<path d="M7 4v16l13-8z"/>')}
    ${sym("i-search", '<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>')}
    ${sym("i-users", '<circle cx="9" cy="8" r="3.5"/><path d="M2 20c0-3.9 3.1-6 7-6s7 2.1 7 6M16 4.5a3.5 3.5 0 0 1 0 7M22 20c0-3-1.8-5-4.5-5.7"/>')}
    ${sym("i-book", '<path d="M4 5a2 2 0 0 1 2-2h14v16H6a2 2 0 0 0-2 2z"/><path d="M4 19V5M8 7h8"/>')}
    ${sym("i-lock", '<rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>')}
    ${sym("i-layers", '<path d="m12 3 9 5-9 5-9-5z"/><path d="m3 13 9 5 9-5"/>')}
    ${sym("i-target", '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5"/>')}
    ${sym("i-menu", '<path d="M4 7h16M4 12h16M4 17h16"/>')}
    ${sym("i-mailto", '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>')}
    ${sym("i-git", '<circle cx="6" cy="6" r="2.5"/><circle cx="6" cy="18" r="2.5"/><circle cx="18" cy="8" r="2.5"/><path d="M6 8.5v7M18 10.5c0 4-6 3-10.5 6"/>')}
    ${sym("i-link", '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>')}
  </svg>
  <canvas id="bg"></canvas><div class="grid-floor"></div><div class="vignette"></div>`);

  /* ---------- navigation ---------- */
  const apps = Z.apps();
  const navLinks = S.nav.map(([href, key, label]) => key === "products"
    ? `<div class="nl-wrap"><a href="${href}" class="nl ${page === key || page === "product" ? "on" : ""}" aria-haspopup="true">${label} <span class="caret-d">▾</span></a>
        <div class="mega">
          <div class="mega-grid">${apps.map((a) => `
            <a class="mega-item" href="${Z.productUrl(a.id)}" style="--accent:${a.color}">
              <span class="mi-ic">${Z.icon(a.icon)}</span>
              <span><b>${Z.esc(a.name)}</b><small>${Z.esc(a.tagline)}</small></span>
            </a>`).join("")}
          </div>
          <div class="mega-foot"><a href="products.html">All products ${Z.icon("i-arrow")}</a><a href="products.html#compare">Compare capabilities ${Z.icon("i-arrow")}</a><a href="demos.html">Watch demos ${Z.icon("i-arrow")}</a></div>
        </div></div>`
    : `<a href="${href}" class="nl ${page === key ? "on" : ""}">${label}</a>`).join("");

  document.body.insertAdjacentHTML("afterbegin", `
    <header class="nav" id="nav">
      <div class="nav-in">
        <a class="brand" href="index.html" aria-label="${S.brand} home">
          <svg viewBox="0 0 40 40" class="logo" aria-hidden="true"><polygon points="20,2 37,11 37,29 20,38 3,29 3,11"/><path d="M13 14 H27 L13 26 H27"/></svg>
          <span><b>${S.brand}</b><small>by ${Z.esc(S.owner)}</small></span>
        </a>
        <nav class="nav-links" aria-label="Main">${navLinks}</nav>
        <div class="nav-right">
          <button class="cmdk-btn" id="cmdkBtn" aria-label="Open command palette">${Z.icon("i-search")}<span>Search</span><kbd>Ctrl K</kbd></button>
          <span class="live-pill"><i></i><span id="navClock">--:--:--</span></span>
          <button class="burger" id="burger" aria-label="Menu">${Z.icon("i-menu")}</button>
        </div>
      </div>
      <div class="mobile-menu" id="mobileMenu">${S.nav.map(([h, k, l]) => `<a href="${h}" class="${page === k ? "on" : ""}">${l}</a>`).join("")}</div>
    </header>`);

  /* ---------- footer ---------- */
  const year = new Date().getFullYear();
  const contactLinks = [
    S.contact.email && `<a href="mailto:${Z.esc(S.contact.email)}">${Z.icon("i-mailto")} Email</a>`,
    S.contact.github && `<a href="${Z.esc(S.contact.github)}" target="_blank" rel="noopener">${Z.icon("i-git")} GitHub</a>`,
    S.contact.linkedin && `<a href="${Z.esc(S.contact.linkedin)}" target="_blank" rel="noopener">${Z.icon("i-link")} LinkedIn</a>`,
  ].filter(Boolean).join("");
  document.body.insertAdjacentHTML("beforeend", `
    <footer class="site-foot">
      <div class="sf-grid">
        <div class="sf-brand">
          <a class="brand" href="index.html"><svg viewBox="0 0 40 40" class="logo"><polygon points="20,2 37,11 37,29 20,38 3,29 3,11"/><path d="M13 14 H27 L13 26 H27"/></svg><span><b>${S.brand}</b><small>by ${Z.esc(S.owner)}</small></span></a>
          <p>${Z.esc(S.tagline)}. Six purpose-built tools covering network, logs, phishing, mobile, API and source code security.</p>
          ${contactLinks ? `<div class="sf-contact">${contactLinks}</div>` : ""}
        </div>
        <div><h6>Products</h6>${apps.map((a) => `<a href="${Z.productUrl(a.id)}">${Z.esc(a.name)}</a>`).join("")}</div>
        <div><h6>Platform</h6><a href="dashboard.html">Command Center</a><a href="demos.html">Product demos</a><a href="console.html">Root console</a><a href="products.html#compare">Compare</a></div>
        <div><h6>About</h6><a href="about.html">About ${Z.esc(S.owner)}</a><a href="about.html#principles">Principles</a><a href="about.html#standards">Standards</a></div>
      </div>
      <div class="sf-bottom"><span>© ${year} ${Z.esc(S.owner)} · ${S.brand} Security Suite</span><span class="sf-sec">${Z.icon("i-lock")} AES-256-GCM · TLS 1.3 · Zero trust</span><span id="footLat">LAT — ms</span></div>
    </footer>`);

  /* ---------- nav behaviour ---------- */
  const nav = Z.$("#nav");
  const onScroll = () => nav.classList.toggle("scrolled", scrollY > 10);
  addEventListener("scroll", onScroll, { passive: true }); onScroll();
  Z.$("#burger").onclick = () => nav.classList.toggle("menu-open");
  setInterval(() => {
    Z.$("#navClock").textContent = new Date().toLocaleTimeString("en-GB");
    const l = Z.$("#footLat"); if (l) l.textContent = `LAT ${Z.rand(8, 34)} ms · UPLINK 10 Gb/s`;
  }, 1000);

  /* ---------- boot (first visit per session) ---------- */
  if (!sessionStorage.getItem("zoneBooted") && !Z.reduced) {
    sessionStorage.setItem("zoneBooted", "1");
    document.body.insertAdjacentHTML("beforeend", `
      <div id="boot"><div class="boot-inner">
        <svg class="boot-logo" viewBox="0 0 120 120"><polygon class="hex-a" points="60,6 107,33 107,87 60,114 13,87 13,33"/><polygon class="hex-b" points="60,22 93,41 93,79 60,98 27,79 27,41"/><path class="z" d="M42 44 H78 L42 76 H78"/></svg>
        <pre id="bootLog"></pre><div class="boot-bar"><i id="bootBar"></i></div><div class="boot-pct"><span id="bootPct">0</span>%</div>
      </div></div>`);
    const lines = ["[ OK ] ZONE platform 6.0 ........................ loaded", "[ OK ] Encrypted session ........................ AES-256-GCM", "[ OK ] Product registry ......................... 6 products", "[ OK ] Telemetry stream ......................... connected", "", `>> Welcome, ${S.owner}.`];
    let i = 0;
    const t = () => {
      if (i < lines.length) {
        Z.$("#bootLog").textContent += lines[i++] + "\n";
        const p = Math.round((i / lines.length) * 100);
        Z.$("#bootBar").style.width = p + "%"; Z.$("#bootPct").textContent = p;
        setTimeout(t, 150);
      } else setTimeout(() => { Z.$("#boot").classList.add("done"); document.dispatchEvent(new Event("zone:ready")); }, 400);
    };
    setTimeout(t, 700);
    Z.booting = true;
  }
  Z.ready = (fn) => (Z.booting ? document.addEventListener("zone:ready", fn, { once: true }) : fn());

  /* ---------- background constellation ---------- */
  const bg = Z.$("#bg");
  let B; const resize = () => (B = Z.fitCanvas(bg));
  resize(); addEventListener("resize", resize);
  Z.rain = 0; // console `matrix` command turns this on
  let drops = [];
  const nodes = Array.from({ length: 46 }, () => ({ x: Math.random() * innerWidth, y: Math.random() * innerHeight, vx: (Math.random() - 0.5) * 0.25, vy: (Math.random() - 0.5) * 0.25 }));
  let mx = -999, my = -999;
  addEventListener("mousemove", (e) => { mx = e.clientX; my = e.clientY; });
  const glyphs = "01アイウエオカキクケコ<>/{}[]#$%&*ΣΔΨΩλ";
  const packets = [], pings = [];
  let tick = 0;
  const drawBg = () => {
    const { c, w, h } = B;
    c.clearRect(0, 0, w, h);
    tick++;
    if (Z.rain) {
      const cols = Math.floor(w / 20);
      if (drops.length !== cols) drops = Array.from({ length: cols }, () => Z.rand(-60, 0));
      c.font = "13px JetBrains Mono, monospace";
      for (let i = 0; i < cols; i++) {
        c.fillStyle = "rgba(45,225,180,.35)"; c.fillText(Z.pick(glyphs), i * 20, drops[i] * 20);
        if (drops[i] * 20 > h && Math.random() > 0.975) drops[i] = 0; drops[i] += 1.2;
      }
    }
    for (const n of nodes) { n.x += n.vx; n.y += n.vy; if (n.x < 0 || n.x > w) n.vx *= -1; if (n.y < 0 || n.y > h) n.vy *= -1; }
    const links = [];
    for (let i = 0; i < nodes.length; i++) {
      const a = nodes[i];
      for (let j = i + 1; j < nodes.length; j++) {
        const b = nodes[j], d = Math.hypot(a.x - b.x, a.y - b.y);
        if (d < 150) {
          links.push([a, b]);
          c.strokeStyle = `rgba(148,175,200,${(1 - d / 150) * 0.16})`; c.lineWidth = 1;
          c.beginPath(); c.moveTo(a.x, a.y); c.lineTo(b.x, b.y); c.stroke();
        }
      }
      const md = Math.hypot(a.x - mx, a.y - my);
      if (md < 170) { c.strokeStyle = `rgba(45,225,180,${(1 - md / 170) * 0.45})`; c.beginPath(); c.moveTo(a.x, a.y); c.lineTo(mx, my); c.stroke(); }
    }
    // data packets travelling along links
    if (links.length && packets.length < 18 && tick % 9 === 0) {
      const [a, b] = links[Math.floor(Math.random() * links.length)];
      const hostile = Math.random() < 0.15;
      packets.push({ a, b, t: 0, sp: 0.012 + Math.random() * 0.016, col: hostile ? "255,90,110" : Math.random() < 0.5 ? "45,225,180" : "124,140,255" });
    }
    for (let i = packets.length - 1; i >= 0; i--) {
      const p = packets[i]; p.t += p.sp;
      const x = p.a.x + (p.b.x - p.a.x) * p.t, y = p.a.y + (p.b.y - p.a.y) * p.t;
      const tx = p.a.x + (p.b.x - p.a.x) * Math.max(0, p.t - 0.18), ty = p.a.y + (p.b.y - p.a.y) * Math.max(0, p.t - 0.18);
      const g = c.createLinearGradient(tx, ty, x, y); g.addColorStop(0, `rgba(${p.col},0)`); g.addColorStop(1, `rgba(${p.col},0.85)`);
      c.strokeStyle = g; c.lineWidth = 1.6; c.beginPath(); c.moveTo(tx, ty); c.lineTo(x, y); c.stroke();
      c.fillStyle = `rgba(${p.col},1)`; c.beginPath(); c.arc(x, y, 1.8, 0, 7); c.fill();
      if (p.t >= 1) { if (Math.random() < 0.35) pings.push({ x: p.b.x, y: p.b.y, r: 0, col: p.col }); packets.splice(i, 1); }
    }
    // radar pings where packets land
    for (let i = pings.length - 1; i >= 0; i--) {
      const g = pings[i]; g.r += 0.9;
      c.strokeStyle = `rgba(${g.col},${Math.max(0, 0.5 - g.r / 60)})`; c.lineWidth = 1;
      c.beginPath(); c.arc(g.x, g.y, g.r, 0, 7); c.stroke();
      if (g.r > 30) pings.splice(i, 1);
    }
    // nodes with soft halo
    for (const a of nodes) {
      c.fillStyle = "rgba(45,225,180,0.10)"; c.beginPath(); c.arc(a.x, a.y, 4, 0, 7); c.fill();
      c.fillStyle = "rgba(200,225,240,0.75)"; c.fillRect(a.x - 1, a.y - 1, 2, 2);
    }
  };
  Z.loops = [drawBg];
  const loop = () => { Z.loops.forEach((f) => f()); requestAnimationFrame(loop); };
  if (!Z.reduced) requestAnimationFrame(loop); else drawBg();

  /* ---------- command palette ---------- */
  document.body.insertAdjacentHTML("beforeend", `
    <div id="cmdk" role="dialog" aria-modal="true" aria-label="Command palette">
      <div class="ck-back"></div>
      <div class="ck-box">
        <div class="ck-in">${Z.icon("i-search")}<input id="ckInput" placeholder="Jump to a page, product or demo…" autocomplete="off" spellcheck="false"/><kbd>Esc</kbd></div>
        <ul id="ckList" role="listbox"></ul>
        <div class="ck-foot"><span><kbd>↑</kbd><kbd>↓</kbd> navigate</span><span><kbd>Enter</kbd> open</span><span><kbd>Ctrl K</kbd> toggle</span></div>
      </div>
    </div>`);
  const items = [
    ...S.nav.map(([h, k, l]) => ({ group: "Pages", label: l, hint: h, icon: "i-arrow", run: () => go(h) })),
    ...apps.map((a) => ({ group: "Products", label: a.name, hint: a.tagline, icon: a.icon, color: a.color, run: () => go(Z.productUrl(a.id)) })),
    ...apps.map((a) => ({ group: "Demos", label: `Play demo — ${a.name}`, hint: "5-step walkthrough", icon: "i-play", color: a.color, run: () => { closeCk(); window.openDemo ? window.openDemo(a) : go(`demos.html#${a.id}`); } })),
    { group: "Actions", label: "Compare all products", hint: "Capability matrix", icon: "i-layers", run: () => go("products.html#compare") },
    { group: "Actions", label: "Open root console", hint: "Interactive shell", icon: "i-term", run: () => go("console.html") },
  ];
  let sel = 0, shown = [];
  const ck = Z.$("#cmdk"), ckIn = Z.$("#ckInput"), ckList = Z.$("#ckList");
  const renderCk = () => {
    const q = ckIn.value.trim().toLowerCase();
    shown = items.filter((it) => !q || (it.label + " " + it.hint + " " + it.group).toLowerCase().includes(q));
    sel = Math.min(sel, Math.max(0, shown.length - 1));
    let last = "";
    ckList.innerHTML = shown.map((it, i) => {
      const head = it.group !== last ? `<li class="ck-g">${it.group}</li>` : ""; last = it.group;
      return `${head}<li class="ck-i ${i === sel ? "on" : ""}" data-i="${i}" role="option" style="${it.color ? `--accent:${it.color}` : ""}"><span class="ck-ic">${Z.icon(it.icon)}</span><b>${Z.esc(it.label)}</b><small>${Z.esc(it.hint)}</small></li>`;
    }).join("") || `<li class="ck-empty">No matches for “${Z.esc(q)}”</li>`;
    const on = ckList.querySelector(".ck-i.on"); on && on.scrollIntoView({ block: "nearest" });
  };
  const openCk = () => { ck.classList.add("open"); ckIn.value = ""; sel = 0; renderCk(); ckIn.focus(); };
  const closeCk = () => ck.classList.remove("open");
  Z.$("#cmdkBtn").onclick = openCk;
  ck.querySelector(".ck-back").onclick = closeCk;
  ckIn.addEventListener("input", () => { sel = 0; renderCk(); });
  ckList.addEventListener("click", (e) => { const li = e.target.closest(".ck-i"); if (li) shown[+li.dataset.i].run(); });
  ckList.addEventListener("mousemove", (e) => { const li = e.target.closest(".ck-i"); if (li && +li.dataset.i !== sel) { sel = +li.dataset.i; renderCk(); } });
  addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") { e.preventDefault(); ck.classList.contains("open") ? closeCk() : openCk(); return; }
    if (!ck.classList.contains("open")) return;
    if (e.key === "Escape") closeCk();
    else if (e.key === "ArrowDown") { e.preventDefault(); sel = Math.min(shown.length - 1, sel + 1); renderCk(); }
    else if (e.key === "ArrowUp") { e.preventDefault(); sel = Math.max(0, sel - 1); renderCk(); }
    else if (e.key === "Enter" && shown[sel]) { e.preventDefault(); shown[sel].run(); }
  });
  Z.openPalette = openCk;

  /* ---------- page transitions ---------- */
  function go(href) {
    closeCk();
    const target = new URL(href, location.href);
    if (target.pathname === location.pathname && target.search === location.search && target.hash) { location.hash = target.hash; return; }
    document.body.classList.add("leaving");
    setTimeout(() => (location.href = href), 180);
  }
  Z.go = go;
  document.addEventListener("click", (e) => {
    const a = e.target.closest("a[href]");
    if (!a || a.target === "_blank" || e.ctrlKey || e.metaKey || e.shiftKey) return;
    const href = a.getAttribute("href");
    if (!href || href.startsWith("#") || href.startsWith("mailto:") || /^https?:/.test(href)) return;
    e.preventDefault(); go(href);
  });
  addEventListener("pageshow", () => document.body.classList.remove("leaving"));

  /* ---------- toast ---------- */
  Z.toast = (msg) => {
    let t = Z.$("#toast");
    if (!t) { document.body.insertAdjacentHTML("beforeend", '<div id="toast"></div>'); t = Z.$("#toast"); }
    t.textContent = msg; t.classList.add("show");
    clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove("show"), 2200);
  };

  /* ---------- reveal + card spotlight (call after rendering) ---------- */
  const io = new IntersectionObserver((ents) => ents.forEach((en) => {
    if (!en.isIntersecting) return;
    en.target.classList.add("in");
    setTimeout(() => en.target.classList.add("settled"), 1200);
    io.unobserve(en.target);
  }), { threshold: 0.08 });
  Z.enhance = (root = document) => {
    Z.$$(".panel, .card, .reveal-me, .section-title", root).forEach((el, i) => {
      if (el.classList.contains("reveal")) return;
      el.classList.add("reveal");
      el.style.transitionDelay = (i % 6) * 50 + "ms";
      io.observe(el);
    });
    Z.$$(".card", root).forEach((card) => {
      if (card._tilt) return; card._tilt = 1;
      card.addEventListener("mousemove", (e) => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
        card.style.setProperty("--mx", x * 100 + "%"); card.style.setProperty("--my", y * 100 + "%");
        if (!card.classList.contains("no-tilt")) card.style.transform = `perspective(900px) rotateY(${(x - 0.5) * 8}deg) rotateX(${(0.5 - y) * 8}deg) translateY(-3px)`;
      });
      card.addEventListener("mouseleave", () => (card.style.transform = ""));
    });
  };

  /* ---------- shared product card markup ---------- */
  Z.productCard = (a, i) => `
    <article class="card app-card" data-tag="${Z.esc(a.tag)}" data-id="${a.id}" style="--accent:${a.color}">
      <div class="ic">${Z.icon(a.icon)}</div>
      <h3><a class="stretched" href="${Z.productUrl(a.id)}">${Z.esc(a.name)}</a></h3>
      <p>${Z.esc(a.tagline)}</p>
      <div class="chips">${a.chips.map((c) => `<span>${Z.esc(c)}</span>`).join("")}</div>
      <footer><span class="pill ${a.status[0]}">${Z.esc(a.status[1])}</span><button class="go-demo" data-demo="${a.id}">▶ View demo</button></footer>
    </article>`;
  document.addEventListener("click", (e) => {
    const b = e.target.closest("[data-demo]");
    if (!b) return;
    e.preventDefault(); e.stopPropagation();
    const a = Z.app(b.dataset.demo);
    if (a && window.openDemo) window.openDemo(a);
  }, true);

  /* ---------- snapshot markup (real screenshot if present, else illustration) ---------- */
  Z.snapshot = (a) => {
    const mock = window.ZONE_SNAPS && window.ZONE_SNAPS[a.id] ? window.ZONE_SNAPS[a.id]() : "";
    const path = a.screenshot || `assets/screens/${a.id}.png`;
    return `<div class="win"><div class="win-bar"><i></i><i></i><i></i><span>${a.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.zone</span><em class="shot-label">PREVIEW</em></div>
      <div class="win-body"><img class="real-shot" src="${Z.esc(path)}" alt="${Z.esc(a.name)} screenshot" hidden>${mock}</div></div>`;
  };
  Z.activateShots = (root = document) => {
    Z.$$(".real-shot", root).forEach((img) => {
      const useReal = () => {
        const body = img.parentElement;
        img.hidden = false;
        [...body.children].forEach((el) => el !== img && el.remove());
        body.classList.add("has-shot");
        const lbl = body.parentElement.querySelector(".shot-label"); if (lbl) lbl.textContent = "SCREENSHOT";
      };
      if (img.complete && img.naturalWidth) useReal(); else img.addEventListener("load", useReal, { once: true });
    });
  };
})();
