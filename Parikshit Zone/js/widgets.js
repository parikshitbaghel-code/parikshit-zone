/* ZONE — reusable live widgets */
(() => {
  const { $, $$, rand, pick, esc } = Z;
  const W = (Z.w = {});

  /* ================= 3D globe with attack arcs ================= */
  W.globe = (cv, hud = {}) => {
    let G = Z.fitCanvas(cv);
    addEventListener("resize", () => (G = Z.fitCanvas(cv)));
    const land = (x, y, z) => Math.sin(x * 3.1 + 1.3) * Math.cos(y * 2.7 - 0.4) + Math.sin(z * 3.7 + x * 1.4) * 0.8 + Math.cos(y * 5.1 + z * 2.2) * 0.35;
    const PTS = [], N = 2400, GA = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < N; i++) {
      const y = 1 - (i / (N - 1)) * 2, r = Math.sqrt(1 - y * y), th = GA * i;
      const x = Math.cos(th) * r, z = Math.sin(th) * r;
      PTS.push({ x, y, z, land: land(x, y, z) > 0.35 });
    }
    const ll = (lat, lon) => { const a = (lat * Math.PI) / 180, o = (lon * Math.PI) / 180; return { x: Math.cos(a) * Math.cos(o), y: Math.sin(a), z: Math.cos(a) * Math.sin(o) }; };
    const cities = [[28.6, 77.2], [19.1, 72.9], [37.8, -122.4], [40.7, -74], [51.5, -0.1], [55.7, 37.6], [35.7, 139.7], [1.35, 103.8], [-33.9, 151.2], [-23.5, -46.6], [52.5, 13.4], [39.9, 116.4], [25.2, 55.3], [-1.3, 36.8]].map(([a, b]) => ll(a, b));
    const HOME = cities[0];
    let rot = 0; const tilt = 0.38;
    const proj = (p) => {
      const cY = Math.cos(rot), sY = Math.sin(rot), cT = Math.cos(tilt), sT = Math.sin(tilt);
      const x1 = p.x * cY - p.z * sY, z1 = p.x * sY + p.z * cY;
      return { x: x1, y: p.y * cT - z1 * sT, z: p.y * sT + z1 * cT };
    };
    const slerp = (a, b, t) => {
      const d = Math.min(1, Math.max(-1, a.x * b.x + a.y * b.y + a.z * b.z)), om = Math.acos(d), so = Math.sin(om) || 1e-6;
      const k1 = Math.sin((1 - t) * om) / so, k2 = Math.sin(t * om) / so;
      return { x: a.x * k1 + b.x * k2, y: a.y * k1 + b.y * k2, z: a.z * k1 + b.z * k2, om };
    };
    const arcs = [], rings = []; let blocked = 0;
    const spawn = () => {
      const hostile = Math.random() > 0.35;
      let a = pick(cities), b = hostile ? HOME : pick(cities);
      if (a === b) b = cities[(cities.indexOf(a) + 3) % cities.length];
      arcs.push({ a, b, t: 0, sp: 0.006 + Math.random() * 0.006, col: hostile ? [255, 90, 110] : [45, 225, 180], hostile });
    };
    for (let i = 0; i < 6; i++) spawn();
    const draw = () => {
      const { c, w, h } = G, R = Math.min(w, h) * 0.46, ox = w / 2, oy = h / 2;
      c.clearRect(0, 0, w, h);
      const atm = c.createRadialGradient(ox, oy, R * 0.85, ox, oy, R * 1.18);
      atm.addColorStop(0, "rgba(45,225,180,0)"); atm.addColorStop(0.35, "rgba(45,225,180,0.16)"); atm.addColorStop(1, "rgba(124,140,255,0)");
      c.fillStyle = atm; c.beginPath(); c.arc(ox, oy, R * 1.18, 0, 7); c.fill();
      const body = c.createRadialGradient(ox - R * 0.35, oy - R * 0.4, R * 0.1, ox, oy, R);
      body.addColorStop(0, "rgba(22,44,70,0.6)"); body.addColorStop(1, "rgba(4,8,16,0.92)");
      c.fillStyle = body; c.beginPath(); c.arc(ox, oy, R, 0, 7); c.fill();
      c.lineWidth = 0.6;
      for (let lat = -60; lat <= 60; lat += 30) { c.beginPath(); for (let lon = 0; lon <= 360; lon += 6) { const p = proj(ll(lat, lon)); lon ? c.lineTo(ox + p.x * R, oy - p.y * R) : c.moveTo(ox + p.x * R, oy - p.y * R); } c.strokeStyle = "rgba(148,163,184,0.06)"; c.stroke(); }
      for (const p0 of PTS) {
        const p = proj(p0); if (p.z < -0.05) continue;
        const X = ox + p.x * R, Y = oy - p.y * R, a = 0.15 + p.z * 0.85;
        if (p0.land) { c.fillStyle = `rgba(45,225,180,${a * 0.9})`; c.fillRect(X - 1, Y - 1, 2, 2); }
        else { c.fillStyle = `rgba(120,140,170,${a * 0.22})`; c.fillRect(X - 0.6, Y - 0.6, 1.2, 1.2); }
      }
      const t = performance.now() / 1000;
      for (const cv2 of cities) {
        const p = proj(cv2); if (p.z < 0) continue;
        const X = ox + p.x * R, Y = oy - p.y * R, home = cv2 === HOME;
        c.fillStyle = home ? "#4ade80" : "#e6edf5"; c.beginPath(); c.arc(X, Y, home ? 3.5 : 2, 0, 7); c.fill();
        if (home) { const pr = ((t * 0.8) % 1) * 22; c.strokeStyle = `rgba(74,222,128,${1 - pr / 22})`; c.beginPath(); c.arc(X, Y, pr, 0, 7); c.stroke(); }
      }
      for (let i = arcs.length - 1; i >= 0; i--) {
        const A = arcs[i]; A.t += A.sp;
        const head = Math.min(A.t, 1), tail = Math.max(0, A.t - 0.45);
        let prev = null;
        for (let s = 0; s <= 40; s++) {
          const u = tail + ((head - tail) * s) / 40, q = slerp(A.a, A.b, u), lift = 1 + Math.sin(Math.PI * u) * (0.12 + q.om * 0.12);
          const p = proj({ x: q.x * lift, y: q.y * lift, z: q.z * lift }), X = ox + p.x * R, Y = oy - p.y * R;
          if (prev && (p.z > -0.15 || Math.hypot(p.x, p.y) > 1)) { c.strokeStyle = `rgba(${A.col},${(s / 40) * (p.z > 0 ? 1 : 0.25)})`; c.lineWidth = 1.5; c.beginPath(); c.moveTo(prev.X, prev.Y); c.lineTo(X, Y); c.stroke(); }
          prev = { X, Y };
        }
        if (A.t <= 1 && prev) { c.fillStyle = "#fff"; c.beginPath(); c.arc(prev.X, prev.Y, 2.2, 0, 7); c.fill(); }
        if (A.t >= 1 && !A.hit) { A.hit = true; rings.push({ v: A.b, life: 1, col: A.col }); if (A.hostile) blocked++; }
        if (A.t > 1.45) { arcs.splice(i, 1); spawn(); if (Math.random() > 0.7 && arcs.length < 12) spawn(); }
      }
      for (let i = rings.length - 1; i >= 0; i--) {
        const r = rings[i]; r.life -= 0.02; const p = proj(r.v);
        if (p.z > 0) { c.strokeStyle = `rgba(${r.col},${r.life})`; c.beginPath(); c.ellipse(ox + p.x * R, oy - p.y * R, (1 - r.life) * 26, (1 - r.life) * 26 * (0.4 + p.z * 0.6), 0, 0, 7); c.stroke(); }
        if (r.life <= 0) rings.splice(i, 1);
      }
      c.strokeStyle = "rgba(45,225,180,0.35)"; c.lineWidth = 1; c.beginPath(); c.arc(ox, oy, R, 0, 7); c.stroke();
      rot += 0.0026;
    };
    Z.loops.push(draw);
    const ticks = $(".ticks");
    if (ticks) for (let i = 0; i < 120; i++) {
      const a = (i / 120) * Math.PI * 2, r2 = i % 10 === 0 ? 216 : 223;
      const l = document.createElementNS("http://www.w3.org/2000/svg", "line");
      l.setAttribute("x1", 250 + Math.cos(a) * 228); l.setAttribute("y1", 250 + Math.sin(a) * 228);
      l.setAttribute("x2", 250 + Math.cos(a) * r2); l.setAttribute("y2", 250 + Math.sin(a) * r2);
      ticks.appendChild(l);
    }
    const levels = [["LOW", "#4ade80"], ["GUARDED", "#2de1b4"], ["ELEVATED", "#f5b54a"], ["LOW", "#4ade80"]]; let lv = 0, s = 0;
    setInterval(() => {
      s++;
      if (hud.inb) hud.inb.textContent = rand(1800, 4200).toLocaleString();
      if (hud.blk) hud.blk.textContent = (12840 + blocked).toLocaleString();
      if (hud.arcs) hud.arcs.textContent = arcs.length;
      if (hud.threat && s % 6 === 0) { lv = (lv + 1) % levels.length; hud.threat.textContent = levels[lv][0]; hud.threat.style.color = levels[lv][1]; }
    }, 1000);
    return { arcs: () => arcs.length, blocked: () => blocked };
  };

  /* ================= traffic chart ================= */
  W.traffic = (cv) => {
    let C = Z.fitCanvas(cv);
    addEventListener("resize", () => (C = Z.fitCanvas(cv)));
    const LEN = 70, inS = [], outS = []; let base = 60, vol = 1;
    const seed = () => { inS.length = outS.length = 0; base = 60; for (let i = 0; i < LEN; i++) { base = Math.max(25, Math.min(90, base + (Math.random() - 0.5) * 10 * vol)); inS.push(base); outS.push(base * 0.55 + Math.random() * 10); } };
    seed();
    setInterval(() => { let v = inS[LEN - 1] + (Math.random() - 0.5) * 14 * vol; if (Math.random() > 0.93) v += 25; v = Math.max(20, Math.min(98, v)); inS.push(v); outS.push(v * 0.5 + Math.random() * 12); inS.shift(); outS.shift(); }, 700);
    const series = (c, arr, w, h, rgb) => {
      const pad = 8, step = w / (LEN - 1), pts = arr.map((v, i) => [i * step, h - pad - (v / 100) * (h - pad * 2)]);
      c.beginPath(); pts.forEach(([x, y], i) => { if (!i) return c.moveTo(x, y); const [px, py] = pts[i - 1], m = (px + x) / 2; c.bezierCurveTo(m, py, m, y, x, y); });
      c.strokeStyle = `rgb(${rgb})`; c.lineWidth = 2; c.stroke();
      c.lineTo(w, h); c.lineTo(0, h); c.closePath();
      const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, `rgba(${rgb},0.28)`); g.addColorStop(1, `rgba(${rgb},0)`); c.fillStyle = g; c.fill();
      const [lx, ly] = pts[pts.length - 1]; c.fillStyle = "#fff"; c.beginPath(); c.arc(lx - 2, ly, 3, 0, 7); c.fill();
    };
    Z.loops.push(() => {
      const { c, w, h } = C; c.clearRect(0, 0, w, h);
      c.strokeStyle = "rgba(148,163,184,0.07)"; c.lineWidth = 1;
      for (let i = 1; i < 5; i++) { const y = (h / 5) * i; c.beginPath(); c.moveTo(0, y); c.lineTo(w, y); c.stroke(); }
      for (let i = 1; i < 12; i++) { const x = (w / 12) * i; c.beginPath(); c.moveTo(x, 0); c.lineTo(x, h); c.stroke(); }
      series(c, outS, w, h, "124,140,255"); series(c, inS, w, h, "45,225,180");
      c.font = "11px JetBrains Mono"; c.fillStyle = "rgba(133,147,168,.95)"; c.fillText(`${Math.round(inS[LEN - 1] * 9.7)} Mb/s`, 8, 16);
    });
    return { now: () => Math.round(inS[LEN - 1] * 9.7), reseed: (v) => { vol = v; seed(); } };
  };

  /* ================= gauges ================= */
  W.gauges = () => {
    const CIRC = 2 * Math.PI * 42;
    $$(".gauge").forEach((g) => { g.innerHTML = `<svg viewBox="0 0 100 100"><circle class="seg-ring" cx="50" cy="50" r="48"/><circle class="trk" cx="50" cy="50" r="42"/><circle class="val" cx="50" cy="50" r="42" stroke-dasharray="${CIRC}" stroke-dashoffset="${CIRC}"/></svg><b>0%</b><small>${g.dataset.label}</small>`; });
    const set = (jit) => $$(".gauge").forEach((g) => {
      let v = +g.dataset.v; if (jit && v < 100) v = Math.max(70, Math.min(99, v + rand(-3, 3)));
      g.querySelector(".val").style.strokeDashoffset = CIRC * (1 - v / 100); g.querySelector("b").textContent = v + "%";
    });
    setTimeout(() => set(false), 300); setInterval(() => set(true), 3200);
  };

  /* ================= heatmap / vectors / node mesh ================= */
  W.heatmap = (el) => {
    const cells = [];
    for (let d = 0; d < 7; d++) for (let hr = 0; hr < 24; hr++) {
      const i = document.createElement("i"), a = Math.min(1, Math.random() ** 2 * 0.9 + (hr < 5 || hr > 21 ? 0.25 : 0) + 0.05);
      i.style.setProperty("--a", a.toFixed(2)); if (a > 0.8) i.className = "hot"; i.title = `Day ${d + 1}, ${String(hr).padStart(2, "0")}:00 — ${Math.round(a * 300)} events`;
      el.appendChild(i); cells.push(i);
    }
    setInterval(() => { for (let k = 0; k < 8; k++) { const i = pick(cells), a = Math.min(1, Math.random() ** 1.8 + 0.05); i.style.setProperty("--a", a.toFixed(2)); i.className = a > 0.8 ? "hot" : ""; } }, 1200);
  };
  W.vectors = (el) => {
    const data = [["Brute Force", 72, "#ff5a6e", "#7c8cff"], ["Phishing", 58, "#f5b54a", "#ff5a6e"], ["SQL Injection", 41, "#2de1b4", "#7c8cff"], ["DDoS", 33, "#7c8cff", "#a78bfa"], ["Malware C2", 24, "#4ade80", "#2de1b4"]];
    el.innerHTML = data.map(([n, v, c1, c2]) => `<li><span>${n}</span><b>${v}%</b><div class="tr"><i style="--w:${v}%;--c1:${c1};--c2:${c2}"></i></div></li>`).join("");
    setInterval(() => $$("li", el).forEach((li) => { const i = li.querySelector("i"), v = Math.max(8, Math.min(95, parseInt(i.style.getPropertyValue("--w")) + rand(-6, 6))); i.style.setProperty("--w", v + "%"); li.querySelector("b").textContent = v + "%"; }), 2600);
  };
  W.hexes = (el) => {
    for (let i = 0; i < 42; i++) { const e = document.createElement("i"); e.className = Math.random() > 0.08 ? "up" : "warn"; el.appendChild(e); }
    setInterval(() => { const e = el.children[rand(0, el.children.length - 1)], r = Math.random(); e.className = r > 0.15 ? "up" : r > 0.04 ? "warn" : "down"; if (e.className === "down") setTimeout(() => (e.className = "up"), 2500); }, 500);
  };

  /* ================= ticker ================= */
  W.ticker = (el) => {
    const items = [["CVE-2026-31337", "#ff5a6e", "RCE in edge gateway — CVSS 9.8 — PATCHED"], ["IOC", "#f5b54a", "New C2 domain cluster added to blocklist (x37)"], ["FIREWALL", "#4ade80", "Ruleset v812 deployed across 42 nodes"], ["INTEL", "#2de1b4", "Credential-stuffing campaign trending in AP-SOUTH"], ["HONEYPOT", "#7c8cff", "hp-03 captured polymorphic loader sample"], ["TLS", "#4ade80", "All certificates valid · next rotation in 21d"], ["CVE-2026-28810", "#f5b54a", "Privilege escalation in container runtime — MITIGATED"]];
    const html = items.map(([k, c, m]) => `<span><b style="color:${c}">◆ ${k}</b>${m}</span>`).join("");
    el.innerHTML = html + html;
  };

  /* ================= intel feed ================= */
  W.feed = (el, max = 10) => {
    const ev = [["INFO", "#2de1b4", "TLS cert rotated on edge-node-07"], ["WARN", "#f5b54a", "Brute-force pattern from 185.x.x.x — throttled"], ["CRIT", "#ff5a6e", "Anomalous outbound beacon blocked on host-12"], ["OK", "#4ade80", "Firewall ruleset integrity verified"], ["INFO", "#2de1b4", "New CVE ingested into watchlist"], ["WARN", "#f5b54a", "Port 3389 exposed on staging — flagged"], ["OK", "#4ade80", "Backup snapshot encrypted & stored"], ["INFO", "#a78bfa", "Honeypot hp-03 captured new payload sample"], ["CRIT", "#ff5a6e", "SQLi signature detected — WAF dropped request"], ["OK", "#4ade80", "MFA challenge passed for operator session"], ["WARN", "#f5b54a", "Geo-anomaly login attempt — challenged"]];
    const push = () => {
      const [s, c, m] = pick(ev), li = document.createElement("li");
      li.style.setProperty("--sev", c);
      li.innerHTML = `<time>${new Date().toLocaleTimeString("en-GB")}</time><b>${s}</b><span></span>`;
      li.querySelector("span").textContent = m; el.prepend(li);
      while (el.children.length > max) el.lastChild.remove();
    };
    for (let i = 0; i < 8; i++) push();
    setInterval(push, 2400);
  };

  /* ================= terminal ================= */
  W.terminal = (out, form, input, extra = {}) => {
    const print = (txt, cls = "") => { const d = document.createElement("div"); if (cls) d.className = cls; d.textContent = txt; out.appendChild(d); out.scrollTop = out.scrollHeight; };
    const stream = (lines, delay = 140, done) => { let i = 0; const t = setInterval(() => { if (i < lines.length) { const l = lines[i++]; Array.isArray(l) ? print(l[0], l[1]) : print(l); } else { clearInterval(t); done && done(); } }, delay); };
    print(`${SITE.brand} secure shell 6.0 — session encrypted end-to-end.`, "c");
    print("Type 'help' to list commands. Tab completes, ↑/↓ for history.", "d");
    const apps = Z.apps();
    const pages = Object.fromEntries(SITE.nav.map(([h, k]) => [k, h]));
    const cmds = {
      help: () => [["NAVIGATION", "m"], "  ls                list products", "  open <name>       open a product or page (e.g. open logsense, open dashboard)", "  demo <name>       play a product demo",
        ["SYSTEM", "m"], "  status · whoami · date · history · clear",
        ["TOOLS (real)", "m"], "  hash <text>       SHA-256 digest", "  b64 / unb64 <t>   base64 encode / decode", "  genpass [len]     strong random password",
        ["SIMULATED", "m"], "  scan · nmap <host> · trace <host> · matrix"],
      ls: () => apps.map((a) => `  ${a.id.padEnd(13)} ${a.name.padEnd(22)} ${Z.cat(a.id)}`),
      products: () => cmds.ls(),
      open: (a) => {
        const k = a.toLowerCase().trim(); if (!k) return ["usage: open <product|page>"];
        const app = apps.find((x) => x.id === k || x.name.toLowerCase().includes(k));
        if (app) { setTimeout(() => Z.go(Z.productUrl(app.id)), 400); return [[`opening ${app.name} …`, "c"]]; }
        if (pages[k]) { setTimeout(() => Z.go(pages[k]), 400); return [[`opening ${k} …`, "c"]]; }
        return [[`no product or page named '${a}'`, "e"]];
      },
      demo: (a) => { const app = apps.find((x) => x.id === a.toLowerCase().trim() || x.name.toLowerCase().includes(a.toLowerCase().trim())); if (!a || !app) return ["usage: demo <" + apps.map((x) => x.id).join("|") + ">"]; window.openDemo(app); return [[`playing ${app.name} demo`, "c"]]; },
      whoami: () => [`operator   : ${SITE.owner.toLowerCase()}`, "clearance  : OMEGA", "session    : encrypted · MFA verified", `uptime     : ${Math.floor(performance.now() / 1000)}s`],
      status: () => [`cpu ${rand(12, 38)}%   mem ${rand(30, 60)}%   net ${extra.net ? extra.net() : rand(300, 900)} Mb/s`, ["firewall ACTIVE · ids ACTIVE · vault LOCKED", "c"], `products online: ${apps.length}/${apps.length}`],
      date: () => [new Date().toString()],
      history: () => hist.map((h, i) => `  ${String(i + 1).padStart(3)}  ${h}`),
      clear: () => { out.innerHTML = ""; return []; },
      matrix: () => { Z.rain = Z.rain ? 0 : 1; return [Z.rain ? "data rain: ON" : "data rain: OFF"]; },
      b64: (a) => [a ? btoa(unescape(encodeURIComponent(a))) : "usage: b64 <text>"],
      unb64: (a) => { try { return [decodeURIComponent(escape(atob(a)))]; } catch { return [["invalid base64", "e"]]; } },
      genpass: (a) => { const n = Math.max(8, Math.min(128, parseInt(a) || 24)), cs = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%^&*-_=+", buf = crypto.getRandomValues(new Uint32Array(n)); return [[...buf].map((x) => cs[x % cs.length]).join(""), [`entropy ≈ ${Math.round(n * Math.log2(cs.length))} bits`, "d"]]; },
      hash: async (a) => { if (!a) return ["usage: hash <text>"]; if (!crypto.subtle) return [["needs a secure context (localhost/https)", "e"]]; const b = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(a)); return [[...new Uint8Array(b)].map((x) => x.toString(16).padStart(2, "0")).join("")]; },
      scan: () => { stream([22, 80, 443, 3306, 5432, 8080].map((p) => { const o = Math.random() > 0.45; return [`  10.0.0.${rand(2, 254)}:${String(p).padEnd(5)} ${o ? "OPEN" : "filtered"}`, o ? "m" : "d"]; }), 260, () => print("sweep complete (simulated).", "c")); return ["initiating recon sweep on 10.0.0.0/24 …"]; },
      nmap: (h) => { if (!h) return ["usage: nmap <host>"]; const svc = [["22/tcp", "ssh", "OpenSSH 9.x"], ["80/tcp", "http", "nginx"], ["443/tcp", "https", "nginx"], ["3306/tcp", "mysql", "8.x"], ["6379/tcp", "redis", "7.x"]]; stream([["PORT      STATE  SERVICE  VERSION", "c"], ...svc.filter(() => Math.random() > 0.35).map(([p, s, v]) => `${p.padEnd(10)}open   ${s.padEnd(9)}${v}`)], 220, () => print(`scan of ${h} done (simulated — no packets sent).`, "d")); return [`Starting simulated scan against ${h} …`]; },
      trace: (h) => { if (!h) return ["usage: trace <host>"]; stream([...Array.from({ length: rand(5, 9) }, (_, i) => `  ${String(i + 1).padStart(2)}  10.${rand(0, 255)}.${rand(0, 255)}.${rand(1, 254)}   ${(i * 4 + Math.random() * 6).toFixed(1)} ms`), [`  ✓ reached ${h}`, "c"]], 200); return [`tracing route to ${h} (simulated) …`]; },
    };
    const hist = []; let hi = 0;
    input.addEventListener("keydown", (e) => {
      if (e.key === "ArrowUp" && hist.length) { hi = Math.max(0, hi - 1); input.value = hist[hi]; e.preventDefault(); }
      if (e.key === "ArrowDown" && hist.length) { hi = Math.min(hist.length, hi + 1); input.value = hist[hi] || ""; e.preventDefault(); }
      if (e.key === "Tab") {
        e.preventDefault();
        const [c0, ...rest] = input.value.split(" ");
        if (!rest.length) { const m = Object.keys(cmds).filter((k) => k.startsWith(c0)); if (m.length === 1) input.value = m[0] + " "; else if (m.length) print(m.join("  "), "d"); }
        else { const arg = rest.join(" "), pool = [...apps.map((a) => a.id), ...Object.keys(pages)], m = pool.filter((k) => k.startsWith(arg)); if (m.length === 1) input.value = `${c0} ${m[0]}`; else if (m.length) print(m.join("  "), "d"); }
      }
    });
    const run = async (raw) => {
      raw = raw.trim(); if (!raw) return;
      hist.push(raw); hi = hist.length;
      print(`${SITE.owner.toLowerCase()}@zone:~$ ${raw}`, "c");
      const [name, ...rest] = raw.split(" "), fn = cmds[name.toLowerCase()];
      if (!fn) return print(`command not found: ${name} — try 'help'`, "e");
      (await fn(rest.join(" "))).forEach((l) => (Array.isArray(l) ? print(l[0], l[1]) : print(l)));
    };
    form.addEventListener("submit", (e) => { e.preventDefault(); const v = input.value; input.value = ""; run(v); });
    return { run };
  };

  /* ================= hero typing + counters ================= */
  W.typeline = (el, phrases) => {
    let p = 0, ci = 0, del = false;
    const type = () => { const s = phrases[p]; el.textContent = s.slice(0, ci); if (!del && ci === s.length) { del = true; return setTimeout(type, 1900); } if (del && ci === 0) { del = false; p = (p + 1) % phrases.length; } ci += del ? -1 : 1; setTimeout(type, del ? 22 : 48); };
    type();
  };
  W.counters = (root = document) => $$("[data-count]", root).forEach((b) => {
    const target = parseFloat(b.dataset.count), dec = +(b.dataset.dec || 0), t0 = performance.now();
    const step = (t) => { const k = Math.min((t - t0) / 1600, 1); b.textContent = (target * (1 - Math.pow(1 - k, 3))).toFixed(dec); if (k < 1) requestAnimationFrame(step); else b.textContent = target.toFixed(dec); };
    requestAnimationFrame(step);
    setTimeout(() => (b.textContent = target.toFixed(dec)), 1900); // fallback if frames are throttled
  });
})();
