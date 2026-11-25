/* ZONE // Cyber Command — home page engine */
(() => {
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => [...document.querySelectorAll(s)];
  const rand = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;
  const pick = (arr) => arr[rand(0, arr.length - 1)];
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const DPR = Math.min(devicePixelRatio || 1, 2);
  const fitCanvas = (cv) => {
    const r = cv.getBoundingClientRect();
    cv.width = Math.max(1, r.width * DPR);
    cv.height = Math.max(1, r.height * DPR);
    const c = cv.getContext("2d");
    c.setTransform(DPR, 0, 0, DPR, 0, 0);
    return { c, w: r.width, h: r.height };
  };

  /* ================= Boot ================= */
  const bootLines = [
    "[ OK ] ZONE kernel 5.0.0-hardened ............ loaded",
    "[ OK ] Quantum entropy pool .................. 4096 bits",
    "[ OK ] Encrypted vault ....................... AES-256-GCM",
    "[ OK ] TLS 1.3 tunnel ........................ handshake verified",
    "[ OK ] Zero-trust policy engine .............. enforced",
    "[ OK ] Threat intel sync ..................... 14,203 IOCs",
    "[ OK ] Biometric signature ................... MATCH",
    "[ OK ] Operator PARIKSHIT .................... CLEARANCE OMEGA",
    "",
    ">> ACCESS GRANTED. WELCOME BACK, OPERATOR.",
  ];
  const finishBoot = () => { $("#boot").classList.add("done"); startHero(); };
  if (sessionStorage.getItem("zoneBooted") || reduced) {
    finishBoot();
  } else {
    sessionStorage.setItem("zoneBooted", "1");
    let i = 0;
    const tick = () => {
      if (i < bootLines.length) {
        $("#bootLog").textContent += bootLines[i++] + "\n";
        const pct = Math.round((i / bootLines.length) * 100);
        $("#bootBar").style.width = pct + "%";
        $("#bootPct").textContent = pct;
        setTimeout(tick, 170);
      } else setTimeout(finishBoot, 500);
    };
    setTimeout(tick, 900);
  }

  /* ================= Custom cursor ================= */
  const cur = $("#cursor");
  let cx = innerWidth / 2, cy = innerHeight / 2, tx = cx, ty = cy;
  let mx = -999, my = -999;
  addEventListener("mousemove", (e) => {
    tx = mx = e.clientX; ty = my = e.clientY;
    cur.classList.toggle("hot", !!e.target.closest("a, button, input, .card, .rail a"));
  });
  (function follow() {
    cx += (tx - cx) * 0.22; cy += (ty - cy) * 0.22;
    cur.style.transform = `translate(${cx}px, ${cy}px)`;
    requestAnimationFrame(follow);
  })();

  /* ================= Background ================= */
  const bg = $("#bg");
  let B, rainCols, drops, rainBoost = 1;
  const glyphs = "01アイウエオカキクケコサシスセソ<>/{}[]#$%&*ΣΔΨΩλ";
  const bgResize = () => {
    B = fitCanvas(bg);
    rainCols = Math.floor(B.w / 20);
    drops = Array.from({ length: rainCols }, () => rand(-60, 0));
  };
  bgResize();
  addEventListener("resize", bgResize);
  const nodes = Array.from({ length: 55 }, () => ({
    x: Math.random() * innerWidth, y: Math.random() * innerHeight,
    vx: (Math.random() - 0.5) * 0.3, vy: (Math.random() - 0.5) * 0.3,
  }));
  const drawBg = () => {
    const { c, w, h } = B;
    c.fillStyle = "rgba(2,5,11,0.2)";
    c.fillRect(0, 0, w, h);
    c.font = "13px JetBrains Mono, monospace";
    for (let i = 0; i < (rainBoost > 1 ? rainCols : 0); i++) {
      const y = drops[i] * 20;
      c.fillStyle = Math.random() > 0.97 ? "rgba(124,140,255,.55)" : `rgba(45,225,180,${0.14 * rainBoost})`;
      c.fillText(pick(glyphs), i * 20, y);
      if (y > h && Math.random() > 0.975) drops[i] = 0;
      drops[i] += 0.45 * rainBoost;
    }
    for (const n of nodes) {
      n.x += n.vx; n.y += n.vy;
      if (n.x < 0 || n.x > w) n.vx *= -1;
      if (n.y < 0 || n.y > h) n.vy *= -1;
    }
    for (let i = 0; i < nodes.length; i++) {
      const a = nodes[i];
      for (let j = i + 1; j < nodes.length; j++) {
        const b = nodes[j], d = Math.hypot(a.x - b.x, a.y - b.y);
        if (d < 130) { c.strokeStyle = `rgba(45,225,180,${(1 - d / 130) * 0.18})`; c.beginPath(); c.moveTo(a.x, a.y); c.lineTo(b.x, b.y); c.stroke(); }
      }
      const md = Math.hypot(a.x - mx, a.y - my);
      if (md < 170) { c.strokeStyle = `rgba(124,140,255,${(1 - md / 170) * 0.55})`; c.beginPath(); c.moveTo(a.x, a.y); c.lineTo(mx, my); c.stroke(); }
      c.fillStyle = "rgba(45,225,180,.7)";
      c.fillRect(a.x - 1, a.y - 1, 2, 2);
    }
  };

  /* ================= 3D Globe ================= */
  const gcv = $("#globe");
  let G = fitCanvas(gcv);
  addEventListener("resize", () => (G = fitCanvas(gcv)));

  // Fibonacci sphere + pseudo-continents via layered sines
  const land = (x, y, z) =>
    Math.sin(x * 3.1 + 1.3) * Math.cos(y * 2.7 - 0.4) + Math.sin(z * 3.7 + x * 1.4) * 0.8 + Math.cos(y * 5.1 + z * 2.2) * 0.35;
  const PTS = [];
  const N = 2400, GA = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < N; i++) {
    const y = 1 - (i / (N - 1)) * 2, r = Math.sqrt(1 - y * y), th = GA * i;
    const x = Math.cos(th) * r, z = Math.sin(th) * r;
    PTS.push({ x, y, z, land: land(x, y, z) > 0.35 });
  }
  const llToVec = (lat, lon) => {
    const la = (lat * Math.PI) / 180, lo = (lon * Math.PI) / 180;
    return { x: Math.cos(la) * Math.cos(lo), y: Math.sin(la), z: Math.cos(la) * Math.sin(lo) };
  };
  const cities = [
    [28.6, 77.2], [19.1, 72.9], [37.8, -122.4], [40.7, -74], [51.5, -0.1], [55.7, 37.6],
    [35.7, 139.7], [1.35, 103.8], [-33.9, 151.2], [-23.5, -46.6], [52.5, 13.4], [39.9, 116.4], [25.2, 55.3], [-1.3, 36.8],
  ].map(([a, b]) => llToVec(a, b));
  const HOME = cities[0];

  let rotY = 0;
  const tilt = 0.38;
  const proj = (p) => {
    const cY = Math.cos(rotY), sY = Math.sin(rotY), cT = Math.cos(tilt), sT = Math.sin(tilt);
    const x1 = p.x * cY - p.z * sY, z1 = p.x * sY + p.z * cY;
    const y2 = p.y * cT - z1 * sT, z2 = p.y * sT + z1 * cT;
    return { x: x1, y: y2, z: z2 };
  };
  const slerp = (a, b, t) => {
    const d = Math.min(1, Math.max(-1, a.x * b.x + a.y * b.y + a.z * b.z));
    const om = Math.acos(d), so = Math.sin(om) || 1e-6;
    const k1 = Math.sin((1 - t) * om) / so, k2 = Math.sin(t * om) / so;
    return { x: a.x * k1 + b.x * k2, y: a.y * k1 + b.y * k2, z: a.z * k1 + b.z * k2, om };
  };

  const arcs = [], rings = [];
  let blocked = 0;
  const spawnArc = () => {
    const hostile = Math.random() > 0.35;
    let a = pick(cities), b = hostile ? HOME : pick(cities);
    if (a === b) b = cities[(cities.indexOf(a) + 3) % cities.length];
    arcs.push({ a, b, t: 0, sp: 0.006 + Math.random() * 0.006, col: hostile ? [124, 140, 255] : [45, 225, 180], hostile });
  };
  for (let i = 0; i < 6; i++) spawnArc();

  const drawGlobe = () => {
    const { c, w, h } = G;
    const R = Math.min(w, h) * 0.46, ox = w / 2, oy = h / 2;
    c.clearRect(0, 0, w, h);

    // atmosphere
    const atm = c.createRadialGradient(ox, oy, R * 0.85, ox, oy, R * 1.18);
    atm.addColorStop(0, "rgba(45,225,180,0.0)");
    atm.addColorStop(0.35, "rgba(45,225,180,0.22)");
    atm.addColorStop(1, "rgba(167,139,250,0)");
    c.fillStyle = atm; c.beginPath(); c.arc(ox, oy, R * 1.18, 0, Math.PI * 2); c.fill();
    const body = c.createRadialGradient(ox - R * 0.35, oy - R * 0.4, R * 0.1, ox, oy, R);
    body.addColorStop(0, "rgba(20,60,110,0.55)");
    body.addColorStop(1, "rgba(2,8,20,0.9)");
    c.fillStyle = body; c.beginPath(); c.arc(ox, oy, R, 0, Math.PI * 2); c.fill();

    // graticule
    c.lineWidth = 0.6;
    for (let lat = -60; lat <= 60; lat += 30) {
      c.beginPath();
      for (let lon = 0; lon <= 360; lon += 6) {
        const p = proj(llToVec(lat, lon));
        const X = ox + p.x * R, Y = oy - p.y * R;
        lon === 0 ? c.moveTo(X, Y) : c.lineTo(X, Y);
      }
      c.strokeStyle = "rgba(45,225,180,0.07)"; c.stroke();
    }
    for (let lon = 0; lon < 360; lon += 30) {
      c.beginPath(); let started = false;
      for (let lat = -90; lat <= 90; lat += 6) {
        const p = proj(llToVec(lat, lon));
        if (p.z < 0) { started = false; continue; }
        const X = ox + p.x * R, Y = oy - p.y * R;
        started ? c.lineTo(X, Y) : c.moveTo(X, Y); started = true;
      }
      c.strokeStyle = "rgba(45,225,180,0.1)"; c.stroke();
    }

    // dots
    for (const p0 of PTS) {
      const p = proj(p0);
      if (p.z < -0.05) continue;
      const X = ox + p.x * R, Y = oy - p.y * R, a = 0.15 + p.z * 0.85;
      if (p0.land) { c.fillStyle = `rgba(45,225,180,${a})`; c.fillRect(X - 1.1, Y - 1.1, 2.2, 2.2); }
      else { c.fillStyle = `rgba(80,120,170,${a * 0.25})`; c.fillRect(X - 0.6, Y - 0.6, 1.2, 1.2); }
    }

    // cities
    const t = performance.now() / 1000;
    for (const cv of cities) {
      const p = proj(cv);
      if (p.z < 0) continue;
      const X = ox + p.x * R, Y = oy - p.y * R, home = cv === HOME;
      c.fillStyle = home ? "#4ade80" : "#ffffff";
      c.shadowColor = home ? "#4ade80" : "#2de1b4"; c.shadowBlur = 10;
      c.beginPath(); c.arc(X, Y, home ? 3.5 : 2, 0, Math.PI * 2); c.fill();
      c.shadowBlur = 0;
      if (home) {
        const pr = ((t * 0.8) % 1) * 22;
        c.strokeStyle = `rgba(74,222,128,${1 - pr / 22})`;
        c.beginPath(); c.arc(X, Y, pr, 0, Math.PI * 2); c.stroke();
      }
    }

    // arcs
    for (let i = arcs.length - 1; i >= 0; i--) {
      const A = arcs[i];
      A.t += A.sp;
      const head = Math.min(A.t, 1), tail = Math.max(0, A.t - 0.45);
      const steps = 40;
      let prev = null;
      for (let s = 0; s <= steps; s++) {
        const u = tail + ((head - tail) * s) / steps;
        const q = slerp(A.a, A.b, u);
        const lift = 1 + Math.sin(Math.PI * u) * (0.12 + q.om * 0.12);
        const p = proj({ x: q.x * lift, y: q.y * lift, z: q.z * lift });
        const X = ox + p.x * R, Y = oy - p.y * R;
        if (prev && (p.z > -0.15 || Math.hypot(p.x, p.y) > 1)) {
          const al = (s / steps) * (p.z > 0 ? 1 : 0.25);
          c.strokeStyle = `rgba(${A.col.join(",")},${al})`;
          c.lineWidth = 1.6;
          c.beginPath(); c.moveTo(prev.X, prev.Y); c.lineTo(X, Y); c.stroke();
        }
        prev = { X, Y, z: p.z };
      }
      if (A.t <= 1 && prev) {
        c.fillStyle = "#fff"; c.shadowColor = `rgb(${A.col.join(",")})`; c.shadowBlur = 14;
        c.beginPath(); c.arc(prev.X, prev.Y, 2.4, 0, Math.PI * 2); c.fill(); c.shadowBlur = 0;
      }
      if (A.t >= 1 && !A.hit) {
        A.hit = true;
        rings.push({ v: A.b, life: 1, col: A.col });
        if (A.hostile) blocked++;
      }
      if (A.t > 1.45) { arcs.splice(i, 1); spawnArc(); if (Math.random() > 0.7 && arcs.length < 12) spawnArc(); }
    }
    for (let i = rings.length - 1; i >= 0; i--) {
      const r = rings[i]; r.life -= 0.02;
      const p = proj(r.v);
      if (p.z > 0) {
        const X = ox + p.x * R, Y = oy - p.y * R;
        c.strokeStyle = `rgba(${r.col.join(",")},${r.life})`; c.lineWidth = 1.5;
        c.beginPath(); c.ellipse(X, Y, (1 - r.life) * 26, (1 - r.life) * 26 * (0.4 + p.z * 0.6), 0, 0, Math.PI * 2); c.stroke();
      }
      if (r.life <= 0) rings.splice(i, 1);
    }

    // rim highlight
    c.strokeStyle = "rgba(45,225,180,0.45)"; c.lineWidth = 1.2;
    c.beginPath(); c.arc(ox, oy, R, 0, Math.PI * 2); c.stroke();

    rotY += 0.0028;
  };

  // orbit ticks
  const ticks = $(".ticks");
  for (let i = 0; i < 120; i++) {
    const a = (i / 120) * Math.PI * 2, long = i % 10 === 0;
    const r1 = 228, r2 = long ? 216 : 223;
    const l = document.createElementNS("http://www.w3.org/2000/svg", "line");
    l.setAttribute("x1", 250 + Math.cos(a) * r1); l.setAttribute("y1", 250 + Math.sin(a) * r1);
    l.setAttribute("x2", 250 + Math.cos(a) * r2); l.setAttribute("y2", 250 + Math.sin(a) * r2);
    ticks.appendChild(l);
  }

  /* ================= Traffic chart ================= */
  const ch = $("#chart");
  let C = fitCanvas(ch);
  addEventListener("resize", () => (C = fitCanvas(ch)));
  const LEN = 70;
  const inS = [], outS = [];
  let base = 60;
  for (let i = 0; i < LEN; i++) { base += (Math.random() - 0.5) * 10; base = Math.max(25, Math.min(90, base)); inS.push(base); outS.push(base * 0.55 + Math.random() * 10); }
  const pushTraffic = () => {
    let v = inS[inS.length - 1] + (Math.random() - 0.5) * 14;
    if (Math.random() > 0.93) v += 25; // spike
    v = Math.max(20, Math.min(98, v));
    inS.push(v); outS.push(v * 0.5 + Math.random() * 12);
    inS.shift(); outS.shift();
  };
  const drawSeries = (c, arr, w, h, rgb) => {
    const pad = 8, step = w / (LEN - 1);
    const pts = arr.map((v, i) => [i * step, h - pad - (v / 100) * (h - pad * 2)]);
    c.beginPath();
    pts.forEach(([x, y], i) => {
      if (!i) return c.moveTo(x, y);
      const [px, py] = pts[i - 1], mxp = (px + x) / 2;
      c.bezierCurveTo(mxp, py, mxp, y, x, y);
    });
    c.strokeStyle = `rgb(${rgb})`; c.lineWidth = 2; c.shadowColor = `rgb(${rgb})`; c.shadowBlur = 10; c.stroke(); c.shadowBlur = 0;
    c.lineTo(w, h); c.lineTo(0, h); c.closePath();
    const g = c.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, `rgba(${rgb},0.35)`); g.addColorStop(1, `rgba(${rgb},0)`);
    c.fillStyle = g; c.fill();
    const [lx, ly] = pts[pts.length - 1];
    c.fillStyle = "#fff"; c.beginPath(); c.arc(lx - 2, ly, 3, 0, Math.PI * 2); c.fill();
  };
  const drawChart = () => {
    const { c, w, h } = C;
    c.clearRect(0, 0, w, h);
    c.strokeStyle = "rgba(45,225,180,0.08)"; c.lineWidth = 1;
    for (let i = 1; i < 5; i++) { const y = (h / 5) * i; c.beginPath(); c.moveTo(0, y); c.lineTo(w, y); c.stroke(); }
    for (let i = 1; i < 12; i++) { const x = (w / 12) * i; c.beginPath(); c.moveTo(x, 0); c.lineTo(x, h); c.stroke(); }
    drawSeries(c, outS, w, h, "124,140,255");
    drawSeries(c, inS, w, h, "45,225,180");
    c.font = "10px JetBrains Mono"; c.fillStyle = "rgba(102,132,163,.9)";
    c.fillText(`${Math.round(inS[LEN - 1] * 9.7)} Mb/s`, 6, 14);
  };

  /* ================= Gauges ================= */
  const CIRC = 2 * Math.PI * 42;
  $$(".gauge").forEach((g) => {
    g.innerHTML = `<svg viewBox="0 0 100 100"><circle class="seg-ring" cx="50" cy="50" r="48"/><circle class="trk" cx="50" cy="50" r="42"/><circle class="val" cx="50" cy="50" r="42" stroke-dasharray="${CIRC}" stroke-dashoffset="${CIRC}"/></svg><b>0%</b><small>${g.dataset.label}</small>`;
  });
  const setGauges = (jitter) => {
    $$(".gauge").forEach((g) => {
      let v = +g.dataset.v;
      if (jitter && v < 100) v = Math.max(70, Math.min(99, v + rand(-3, 3)));
      g.querySelector(".val").style.strokeDashoffset = CIRC * (1 - v / 100);
      g.querySelector("b").textContent = v + "%";
    });
  };

  /* ================= Heatmap ================= */
  const hm = $("#heatmap");
  const cells = [];
  for (let d = 0; d < 7; d++) for (let hr = 0; hr < 24; hr++) {
    const i = document.createElement("i");
    const night = hr < 5 || hr > 21 ? 0.25 : 0;
    const a = Math.min(1, Math.random() ** 2 * 0.9 + night + 0.05);
    i.style.setProperty("--a", a.toFixed(2));
    if (a > 0.8) i.className = "hot";
    i.title = `Day ${d + 1}, ${String(hr).padStart(2, "0")}:00 — ${Math.round(a * 300)} events`;
    hm.appendChild(i); cells.push(i);
  }
  const mutateHeat = () => {
    for (let k = 0; k < 8; k++) {
      const i = pick(cells), a = Math.min(1, Math.random() ** 1.8 + 0.05);
      i.style.setProperty("--a", a.toFixed(2));
      i.className = a > 0.8 ? "hot" : "";
    }
  };

  /* ================= Attack vectors ================= */
  const vecData = [
    ["Brute Force", 72, "#7c8cff", "#a78bfa"],
    ["Phishing", 58, "#f5b54a", "#ff5a6e"],
    ["SQL Injection", 41, "#2de1b4", "#a78bfa"],
    ["DDoS", 33, "#ff5a6e", "#7c8cff"],
    ["Malware C2", 24, "#4ade80", "#2de1b4"],
  ];
  const vecEl = $("#vectors");
  vecEl.innerHTML = vecData.map(([n, v, c1, c2]) => `<li><span>${n}</span><b>${v}%</b><div class="tr"><i style="--w:${v}%;--c1:${c1};--c2:${c2}"></i></div></li>`).join("");
  const mutateVec = () => {
    $$("#vectors li").forEach((li) => {
      const i = li.querySelector("i"), v = Math.max(8, Math.min(95, parseInt(i.style.getPropertyValue("--w")) + rand(-6, 6)));
      i.style.setProperty("--w", v + "%"); li.querySelector("b").textContent = v + "%";
    });
  };

  /* ================= Node mesh ================= */
  const hx = $("#hexes");
  for (let i = 0; i < 42; i++) { const e = document.createElement("i"); e.className = Math.random() > 0.08 ? "up" : "warn"; hx.appendChild(e); }
  const mutateHex = () => {
    const all = hx.children;
    const e = all[rand(0, all.length - 1)];
    const r = Math.random();
    e.className = r > 0.15 ? "up" : r > 0.04 ? "warn" : "down";
    if (e.className === "down") setTimeout(() => (e.className = "up"), 2500);
  };

  /* ================= Ticker ================= */
  const tickItems = [
    ["CVE-2026-31337", "#ff5a6e", "RCE in edge gateway — CVSS 9.8 — PATCHED"],
    ["IOC", "#f5b54a", "New C2 domain cluster added to blocklist (x37)"],
    ["FIREWALL", "#4ade80", "Ruleset v812 deployed across 42 nodes"],
    ["INTEL", "#2de1b4", "Credential-stuffing campaign trending in AP-SOUTH"],
    ["HONEYPOT", "#7c8cff", "hp-03 captured polymorphic loader sample"],
    ["TLS", "#4ade80", "All certificates valid · next rotation in 21d"],
    ["CVE-2026-28810", "#f5b54a", "Privilege escalation in container runtime — MITIGATED"],
  ];
  const tickHtml = tickItems.map(([k, c, m]) => `<span><b style="color:${c}">◆ ${k}</b>${m}</span>`).join("");
  $("#ticker").innerHTML = tickHtml + tickHtml;

  /* ================= Clock / HUD ================= */
  const levels = [["LOW", "#4ade80", 4], ["GUARDED", "#2de1b4", 4], ["ELEVATED", "#f5b54a", 3], ["LOW", "#4ade80", 5]];
  let lvl = 0, secs = 0;
  $("#lastScan").textContent = new Date(Date.now() - 17 * 60000).toLocaleTimeString("en-GB");
  setInterval(() => {
    secs++;
    $("#clock").textContent = new Date().toLocaleTimeString("en-GB");
    $("#lat").textContent = `LAT ${rand(8, 34)}ms · PKT LOSS 0.0${rand(0, 9)}% · UPLINK 10 Gb/s`;
    $("#inb").textContent = rand(1800, 4200).toLocaleString();
    $("#blk").textContent = (12840 + blocked).toLocaleString();
    $("#arcs").textContent = arcs.length;
    if (secs % 6 === 0) {
      lvl = (lvl + 1) % levels.length;
      const [t, col, d] = levels[lvl];
      const el = $("#threat"); el.textContent = t; el.style.color = col;
      const dc = $("#defcon"); dc.textContent = d; dc.style.color = col;
    }
  }, 1000);

  /* ================= Hero text ================= */
  function startHero() {
    const phrases = [
      "All perimeter defenses are active.",
      "Zero-day watchlist synced 3 minutes ago.",
      "Global sensor grid: 42 nodes reporting.",
      "Hunt. Detect. Neutralize.",
    ];
    const el = $("#typeline");
    let p = 0, ci = 0, del = false;
    const type = () => {
      const s = phrases[p];
      el.textContent = s.slice(0, ci);
      if (!del && ci === s.length) { del = true; return setTimeout(type, 1900); }
      if (del && ci === 0) { del = false; p = (p + 1) % phrases.length; }
      ci += del ? -1 : 1;
      setTimeout(type, del ? 22 : 50);
    };
    type();
    $$("[data-count]").forEach((b) => {
      const target = parseFloat(b.dataset.count), dec = +(b.dataset.dec || 0), t0 = performance.now();
      const step = (t) => {
        const k = Math.min((t - t0) / 1800, 1);
        b.textContent = (target * (1 - Math.pow(1 - k, 3))).toFixed(dec);
        if (k < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    });
    setTimeout(() => setGauges(false), 400);
  }

  /* ================= Intel feed ================= */
  const events = [
    ["INFO", "#2de1b4", "TLS cert rotated on edge-node-07"],
    ["WARN", "#f5b54a", "Brute-force pattern from 185.x.x.x — throttled"],
    ["CRIT", "#ff5a6e", "Anomalous outbound beacon blocked on host-12"],
    ["OK", "#4ade80", "Firewall ruleset integrity verified"],
    ["INFO", "#2de1b4", "New CVE ingested into watchlist"],
    ["WARN", "#f5b54a", "Port 3389 exposed on staging — flagged"],
    ["OK", "#4ade80", "Backup snapshot encrypted & stored"],
    ["INFO", "#a78bfa", "Honeypot hp-03 captured new payload sample"],
    ["CRIT", "#ff5a6e", "SQLi signature detected — WAF dropped request"],
    ["OK", "#4ade80", "MFA challenge passed for operator session"],
    ["WARN", "#f5b54a", "Geo-anomaly login attempt — challenged"],
  ];
  const feed = $("#feedList");
  const pushEvent = () => {
    const [sev, col, msg] = pick(events);
    const li = document.createElement("li");
    li.style.setProperty("--sev", col);
    li.innerHTML = `<time>${new Date().toLocaleTimeString("en-GB")}</time><b>${sev}</b><span></span>`;
    li.querySelector("span").textContent = msg;
    feed.prepend(li);
    while (feed.children.length > 10) feed.lastChild.remove();
  };
  for (let i = 0; i < 8; i++) pushEvent();

  /* ================= Terminal ================= */
  const out = $("#termOut");
  const print = (txt, cls = "") => {
    const d = document.createElement("div");
    if (cls) d.className = cls;
    d.textContent = txt;
    out.appendChild(d);
    out.scrollTop = out.scrollHeight;
  };
  const stream = (lines, delay = 140, done) => {
    let i = 0;
    const t = setInterval(() => {
      if (i < lines.length) { const l = lines[i++]; Array.isArray(l) ? print(l[0], l[1]) : print(l); }
      else { clearInterval(t); done && done(); }
    }, delay);
  };
  print("ZONE secure shell v5.0 — session encrypted end-to-end.", "c");
  print("Type 'help' to list commands.", "d");

  const cmds = {
    help: () => [
      ["COMMANDS", "m"],
      "  status          system health overview",
      "  whoami          operator identity",
      "  scan            simulated recon sweep",
      "  nmap <host>     simulated service scan",
      "  trace <host>    simulated route trace",
      "  hash <text>     SHA-256 digest (real)",
      "  b64 <text>      base64 encode (real)",
      "  unb64 <text>    base64 decode (real)",
      "  genpass [len]   strong random password (real)",
      "  matrix          toggle data-rain intensity",
      "  clear           clear console",
    ],
    whoami: () => ["operator   : parikshit", "clearance  : OMEGA", "session    : encrypted · MFA verified", `uptime     : ${Math.floor(performance.now() / 1000)}s`],
    status: () => [
      `cpu ${rand(12, 38)}%   mem ${rand(30, 60)}%   net ${Math.round(inS[LEN - 1] * 9.7)} Mb/s`,
      ["firewall ACTIVE · ids ACTIVE · vault LOCKED", "c"],
      `threat level: ${$("#threat").textContent} · defcon ${$("#defcon").textContent}`,
      `live attack arcs: ${arcs.length} · blocked today: ${(12840 + blocked).toLocaleString()}`,
    ],
    clear: () => { out.innerHTML = ""; return []; },
    matrix: () => { rainBoost = rainBoost === 1 ? 3.5 : 1; return [rainBoost > 1 ? "data rain: OVERDRIVE" : "data rain: nominal"]; },
    b64: (a) => [a ? btoa(unescape(encodeURIComponent(a))) : "usage: b64 <text>"],
    unb64: (a) => { try { return [decodeURIComponent(escape(atob(a)))]; } catch { return [["invalid base64", "e"]]; } },
    genpass: (a) => {
      const n = Math.max(8, Math.min(128, parseInt(a) || 24));
      const cs = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%^&*-_=+";
      const buf = crypto.getRandomValues(new Uint32Array(n));
      return [[...buf].map((x) => cs[x % cs.length]).join(""), [`entropy ≈ ${Math.round(n * Math.log2(cs.length))} bits`, "d"]];
    },
    hash: async (a) => {
      if (!a) return ["usage: hash <text>"];
      if (!crypto.subtle) return [["hash needs a secure context (localhost/https)", "e"]];
      const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(a));
      return [[...new Uint8Array(buf)].map((x) => x.toString(16).padStart(2, "0")).join("")];
    },
    scan: () => {
      stream([22, 80, 443, 3306, 5432, 8080].map((p) => {
        const open = Math.random() > 0.45;
        return [`  10.0.0.${rand(2, 254)}:${String(p).padEnd(5)} ${open ? "OPEN" : "filtered"}`, open ? "m" : "d"];
      }), 260, () => print("sweep complete (simulated).", "c"));
      return ["initiating recon sweep on 10.0.0.0/24 ..."];
    },
    nmap: (h) => {
      if (!h) return ["usage: nmap <host>"];
      const svc = [["22/tcp", "ssh", "OpenSSH 9.x"], ["80/tcp", "http", "nginx"], ["443/tcp", "https", "nginx"], ["3306/tcp", "mysql", "8.x"], ["6379/tcp", "redis", "7.x"]];
      stream([["PORT      STATE  SERVICE  VERSION", "c"], ...svc.filter(() => Math.random() > 0.35).map(([p, s, v]) => `${p.padEnd(10)}open   ${s.padEnd(9)}${v}`)], 220,
        () => print(`scan of ${h} done (simulated — no packets sent).`, "d"));
      return [`Starting simulated scan against ${h} ...`];
    },
    trace: (h) => {
      if (!h) return ["usage: trace <host>"];
      const hops = Array.from({ length: rand(5, 9) }, (_, i) => `  ${String(i + 1).padStart(2)}  10.${rand(0, 255)}.${rand(0, 255)}.${rand(1, 254)}   ${(i * 4 + Math.random() * 6).toFixed(1)} ms`);
      stream([...hops, [`  ✓ reached ${h}`, "c"]], 200);
      return [`tracing route to ${h} (simulated) ...`];
    },
  };

  const hist = []; let hi = 0;
  const inp = $("#termIn");
  inp.addEventListener("keydown", (e) => {
    if (e.key === "ArrowUp" && hist.length) { hi = Math.max(0, hi - 1); inp.value = hist[hi]; e.preventDefault(); }
    if (e.key === "ArrowDown" && hist.length) { hi = Math.min(hist.length, hi + 1); inp.value = hist[hi] || ""; e.preventDefault(); }
  });
  $("#termForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const raw = inp.value.trim();
    inp.value = "";
    if (!raw) return;
    hist.push(raw); hi = hist.length;
    print(`parikshit@zone:~$ ${raw}`, "c");
    const [name, ...rest] = raw.split(" ");
    const fn = cmds[name.toLowerCase()];
    if (!fn) return print(`command not found: ${name}`, "e");
    const res = await fn(rest.join(" "));
    res.forEach((l) => (Array.isArray(l) ? print(l[0], l[1]) : print(l)));
  });

  /* ================= Applications + showcase ================= */
  const APPS = window.ZONE_APPS || [];
  const esc = (s) => String(s).replace(/[&<>"]/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[ch]));

  $("#appGrid").innerHTML = APPS.map((a, i) => `
    <article class="card app-card" data-tag="${esc(a.tag)}" data-i="${i}" style="--accent:${a.color}" tabindex="0" role="button" aria-label="View ${esc(a.name)} details">
      <div class="ic"><svg><use href="#${a.icon}"/></svg></div>
      <h3>${esc(a.name)}</h3>
      <p>${esc(a.tagline)}</p>
      <div class="chips">${a.chips.map((c) => `<span>${esc(c)}</span>`).join("")}</div>
      <footer><span class="pill ${a.status[0]}">${esc(a.status[1])}</span><button class="go-demo" data-i="${i}" aria-label="View ${esc(a.name)} demo">▶ VIEW DEMO</button></footer>
    </article>`).join("");

  $("#appTabs").innerHTML = APPS.map((a, i) =>
    `<button class="tab" role="tab" data-i="${i}" style="--accent:${a.color}"><svg><use href="#${a.icon}"/></svg>${esc(a.name)}</button>`).join("");

  const showApp = (i) => {
    const a = APPS[i];
    if (!a) return;
    $$(".tab").forEach((t) => t.classList.toggle("on", +t.dataset.i === i));
    const mock = window.ZONE_SNAPS && window.ZONE_SNAPS[a.id] ? window.ZONE_SNAPS[a.id]() : "";
    // Real screenshot: explicit path in apps.js, else auto-detect assets/screens/<id>.png; falls back to the mockup.
    const shotPath = a.screenshot || `assets/screens/${a.id}.png`;
    const snap = `<img class="real-shot" src="${esc(shotPath)}" alt="${esc(a.name)} screenshot" hidden>${mock}`;
    const host = a.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    $("#appShow").innerHTML = `
      <div class="show" style="--accent:${a.color}">
        <div class="show-top">
          <div class="show-snap">
            <div class="win">
              <div class="win-bar"><i></i><i></i><i></i><span>${host}.zone</span><em class="shot-label">PREVIEW</em></div>
              <div class="win-body">${snap}</div>
            </div>
            <div class="snap-glow"></div>
          </div>
          <div class="show-info">
            <span class="show-tag"><svg><use href="#${a.icon}"/></svg> ${esc(a.tag)} // ${String(i + 1).padStart(2, "0")}</span>
            <h3>${esc(a.name)}</h3>
            <p class="show-tl">${esc(a.tagline)}</p>
            <p class="show-sum">${esc(a.summary)}</p>
            <div class="show-stats">${a.stats.map(([v, k]) => `<div><b>${esc(v)}</b><small>${esc(k)}</small></div>`).join("")}</div>
            <ul class="show-feat">${a.features.map((f) => `<li><svg><use href="#i-check"/></svg>${esc(f)}</li>`).join("")}</ul>
            <div class="cta">
              <button class="btn primary btn-demo" data-demo="${i}"><span class="play">▶</span><span>VIEW DEMO</span></button>
              <span class="demo-len">5-step walkthrough · ~30 sec</span>
            </div>
          </div>
        </div>
        <div class="flow">${a.workflow.map((s, k) => `<div class="step" style="--k:${k}"><i>${String(k + 1).padStart(2, "0")}</i><span>${esc(s)}</span></div>`).join("")}</div>
        <h4 class="uc-h">USE CASES</h4>
        <div class="uc-grid">${a.usecases.map(([t, d], k) => `<div class="uc"><em>${String(k + 1).padStart(2, "0")}</em><b>${esc(t)}</b><p>${esc(d)}</p></div>`).join("")}</div>
        <div class="aud"><span><svg><use href="#i-users"/></svg> BUILT FOR</span>${a.audience.map((x) => `<i>${esc(x)}</i>`).join("")}</div>
      </div>`;
    const img = $("#appShow .real-shot");
    const useReal = () => {
      img.hidden = false;
      [...img.parentElement.children].forEach((el) => { if (el !== img) el.remove(); });
      img.parentElement.classList.add("has-shot");
      $("#appShow .shot-label").textContent = "SCREENSHOT";
    };
    if (img.complete && img.naturalWidth) useReal();
    else img.addEventListener("load", useReal, { once: true });
  };
  $("#appTabs").addEventListener("click", (e) => { const t = e.target.closest(".tab"); if (t) showApp(+t.dataset.i); });
  $("#appShow").addEventListener("click", (e) => { const b = e.target.closest("[data-demo]"); if (b && window.openDemo) window.openDemo(APPS[+b.dataset.demo]); });
  $("#appGrid").addEventListener("click", (e) => {
    const b = e.target.closest(".go-demo");
    if (b) { e.stopPropagation(); window.openDemo && window.openDemo(APPS[+b.dataset.i]); }
  }, true);
  const openFromCard = (card) => { showApp(+card.dataset.i); $("#showcase").scrollIntoView({ behavior: "smooth" }); };
  $$(".app-card").forEach((card) => {
    card.addEventListener("click", () => openFromCard(card));
    card.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openFromCard(card); } });
  });
  showApp(0);

  /* ================= Card tilt + spotlight ================= */
  $$(".card").forEach((card) => {
    card.addEventListener("mousemove", (e) => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      card.style.setProperty("--mx", x * 100 + "%");
      card.style.setProperty("--my", y * 100 + "%");
      card.style.transform = `perspective(900px) rotateY(${(x - 0.5) * 12}deg) rotateX(${(0.5 - y) * 12}deg) translateY(-4px)`;
    });
    card.addEventListener("mouseleave", () => (card.style.transform = ""));
  });

  /* ================= Rail highlight + reveal ================= */
  const railLinks = $$(".rail a[href^='#']");
  const secObs = new IntersectionObserver((ents) => {
    ents.forEach((en) => {
      if (!en.isIntersecting) return;
      const id = en.target.id;
      railLinks.forEach((a) => a.classList.toggle("on", a.getAttribute("href") === "#" + id));
    });
  }, { threshold: 0.4 });
  ["top", "dash", "modules", "showcase", "ops"].forEach((id) => secObs.observe(document.getElementById(id)));

  const io = new IntersectionObserver((ents) => ents.forEach((en) => {
    if (!en.isIntersecting) return;
    en.target.classList.add("in");
    setTimeout(() => en.target.classList.add("settled"), 1400);
    io.unobserve(en.target);
  }), { threshold: 0.1 });
  $$(".panel, .card, .section-title").forEach((el, i) => {
    el.classList.add("reveal");
    el.style.transitionDelay = (i % 6) * 60 + "ms";
    io.observe(el);
  });

  /* ================= Loops ================= */
  setInterval(pushEvent, 2400);
  setInterval(() => { pushTraffic(); }, 700);
  setInterval(() => setGauges(true), 3200);
  setInterval(mutateHeat, 1200);
  setInterval(mutateVec, 2600);
  setInterval(mutateHex, 500);

  const loop = () => {
    drawBg();
    drawGlobe();
    drawChart();
    requestAnimationFrame(loop);
  };
  if (reduced) { drawGlobe(); drawChart(); } else loop();
})();
