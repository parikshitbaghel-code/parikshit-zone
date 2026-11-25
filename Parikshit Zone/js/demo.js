/* ZONE — animated product demos: scene kit, demo scripts and player */
(() => {
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const r = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;
  const SEV = { CRIT: "crit", HIGH: "high", MED: "med", LOW: "low", OK: "ok", INFO: "low" };
  const sev = (s) => `<span class="sv sv-${SEV[s] || "low"}">${s}</span>`;

  /* ======================================================
     Scene kit — each returns { html, run(el, T) }
     T.after(ms, fn) / T.every(ms, fn) are auto-cleared on scene change
     ====================================================== */
  const K = {
    upload: (d) => ({
      html: `
        <div class="dz">
          <div class="dz-ring"></div>
          <div class="dz-file"><div class="dz-ic">${esc(d.ext)}</div><div><b>${esc(d.file)}</b><small>${esc(d.size)}</small></div></div>
          <div class="dz-bar"><i></i></div>
          <div class="dz-pct"><span>0</span>%</div>
          <ul class="dz-meta">${d.meta.map((m, i) => `<li style="--d:${2.4 + i * 0.25}s">${esc(m)}</li>`).join("")}</ul>
          <div class="dz-ok">✓ ${esc(d.done)}</div>
        </div>`,
      run: (el, T) => {
        const p = el.querySelector(".dz-pct span"); let v = 0;
        T.every(24, () => { if (v < 100) p.textContent = ++v; });
      },
    }),

    stream: (d) => ({
      html: `
        <div class="term-demo">
          <div class="td-head"><span class="spin"></span>${esc(d.head)}<em class="td-pct">0%</em></div>
          <div class="td-body"></div>
          <div class="td-bar"><i></i></div>
        </div>`,
      run: (el, T) => {
        const body = el.querySelector(".td-body"), pct = el.querySelector(".td-pct"), bar = el.querySelector(".td-bar i");
        let i = 0;
        const step = Math.max(180, Math.floor(3600 / d.lines.length));
        T.every(step, () => {
          if (i >= d.lines.length) return;
          const [cls, txt] = d.lines[i++];
          const line = document.createElement("div");
          line.className = "tl " + cls;
          line.textContent = txt;
          body.appendChild(line);
          body.scrollTop = body.scrollHeight;
          const p = Math.round((i / d.lines.length) * 100);
          pct.textContent = p + "%"; bar.style.width = p + "%";
          if (i === d.lines.length) el.querySelector(".spin").classList.add("done");
        });
      },
    }),

    bars: (d) => ({
      html: `
        <div class="bars-demo">
          <div class="bd-head"><b>${esc(d.title)}</b><span>${esc(d.sub)}</span></div>
          <div class="bd-plot">
            <div class="bd-base" style="bottom:${d.base}%"><em>baseline</em></div>
            ${Array.from({ length: d.n }, (_, i) => {
              const spike = d.spikes.includes(i);
              const h = spike ? r(84, 96) : r(d.base - 18, d.base + 8);
              return `<i class="${spike ? "spike" : ""}" style="--h:${h}%;--k:${i}"></i>`;
            }).join("")}
          </div>
          <div class="bd-call"><b>${esc(d.callTitle)}</b>${esc(d.call)}</div>
        </div>`,
    }),

    graph: (d) => {
      const W = 640, H = 330;
      const nodes = d.nodes.map((n, i) => ({ ...n, x: n.x * W, y: n.y * H, i }));
      const edges = d.edges.map(([a, b, bad]) => ({ a: nodes[a], b: nodes[b], bad }));
      return {
        html: `
          <div class="graph-demo">
            <svg viewBox="0 0 ${W} ${H}">
              ${edges.map((e, i) => `<path id="ge${i}" class="ge ${e.bad ? "bad" : ""}" d="M${e.a.x} ${e.a.y} Q ${(e.a.x + e.b.x) / 2} ${Math.min(e.a.y, e.b.y) - 40} ${e.b.x} ${e.b.y}"/>`).join("")}
              ${edges.map((e, i) => [0, 1, 2].map((k) => `<circle r="${e.bad ? 4 : 3}" class="pk ${e.bad ? "bad" : ""}"><animateMotion dur="${e.bad ? 1.1 : 2.2}s" begin="${k * (e.bad ? 0.37 : 0.73)}s" repeatCount="indefinite"><mpath href="#ge${i}"/></animateMotion></circle>`).join("")).join("")}
              ${nodes.map((n) => `<g class="gn ${n.bad ? "bad" : ""}" style="--k:${n.i}"><circle cx="${n.x}" cy="${n.y}" r="${n.big ? 22 : 15}"/><text x="${n.x}" y="${n.y + (n.big ? 40 : 32)}">${esc(n.label)}</text></g>`).join("")}
            </svg>
            <div class="gd-alert">${sev("CRIT")} ${esc(d.alert)}</div>
          </div>`,
      };
    },

    findings: (d) => {
      const counts = { CRIT: 0, HIGH: 0, MED: 0, LOW: 0 };
      d.items.forEach(([s]) => (counts[s] = (counts[s] || 0) + 1));
      return {
        html: `
          <div class="find-demo">
            <div class="fd-counts">${Object.entries(counts).map(([k, v]) => `<div class="fc fc-${SEV[k]}"><b data-to="${v}">0</b><small>${k}</small></div>`).join("")}</div>
            <ul class="fd-list">${d.items.map(([s, t, m], i) => `<li style="--d:${0.4 + i * 0.45}s">${sev(s)}<span>${esc(t)}</span>${m ? `<em>${esc(m)}</em>` : ""}</li>`).join("")}</ul>
          </div>`,
        run: (el, T) => {
          el.querySelectorAll(".fc b").forEach((b) => {
            const to = +b.dataset.to; let v = 0;
            T.every(Math.max(60, Math.floor(1600 / Math.max(to, 1))), () => { if (v < to) b.textContent = ++v; });
          });
        },
      };
    },

    score: (d) => ({
      html: `
        <div class="score-demo" style="--to:${d.v};--col:${d.col}">
          <div class="sd-ring"><div><b>0</b><small>RISK SCORE</small></div></div>
          <div class="sd-side">
            <div class="sd-stamp">${esc(d.verdict)}</div>
            <ul>${d.reasons.map((x, i) => `<li style="--d:${1.6 + i * 0.35}s">${esc(x)}</li>`).join("")}</ul>
          </div>
        </div>`,
      run: (el, T) => {
        const b = el.querySelector(".sd-ring b"); let v = 0;
        T.every(18, () => { if (v < d.v) { v++; b.textContent = v; el.querySelector(".sd-ring").style.setProperty("--v", v); } });
      },
    }),

    report: (d) => ({
      html: `
        <div class="rep-demo">
          <div class="rp-page">
            <div class="rp-top"><span class="rp-logo"></span><div><b>${esc(d.title)}</b><small>${esc(d.sub)}</small></div></div>
            ${d.sections.map((s, i) => `<div class="rp-sec" style="--d:${0.3 + i * 0.4}s"><h5>${esc(s)}</h5><i></i><i></i><i class="short"></i></div>`).join("")}
          </div>
          <div class="rp-side">
            ${d.formats.map((f, i) => `<span class="rp-fmt" style="--d:${2 + i * 0.2}s">${esc(f)}</span>`).join("")}
            <div class="rp-toast">✓ ${esc(d.done)}</div>
          </div>
        </div>`,
    }),

    query: (d) => ({
      html: `
        <div class="query-demo">
          <div class="qd-bar"><span>⌕</span><code></code><i class="qd-caret"></i><em>${esc(d.range)}</em></div>
          <div class="qd-res">
            <div class="qd-count"><b>0</b> events matched</div>
            <table>${d.rows.map((row, i) => `<tr style="--d:${2.3 + i * 0.25}s">${row.map((c, j) => `<td>${j === 1 ? sev(c) : esc(c)}</td>`).join("")}</tr>`).join("")}</table>
          </div>
        </div>`,
      run: (el, T) => {
        const code = el.querySelector("code"); let i = 0;
        T.every(38, () => { if (i <= d.q.length) code.textContent = d.q.slice(0, i++); });
        const b = el.querySelector(".qd-count b"); let v = 0; const step = Math.ceil(d.count / 40);
        T.after(1900, () => T.every(25, () => { if (v < d.count) b.textContent = (v = Math.min(d.count, v + step)).toLocaleString(); }));
      },
    }),

    ai: (d) => ({
      html: `
        <div class="ai-demo">
          <div class="ad-head"><span class="ad-orb"></span>✦ AI ANALYST <em>analysing ${esc(d.scope)}</em></div>
          <p class="ad-text"></p>
          <div class="ad-tags">${d.tags.map((t, i) => `<span style="--d:${3 + i * 0.2}s">${esc(t)}</span>`).join("")}</div>
        </div>`,
      run: (el, T) => {
        const p = el.querySelector(".ad-text"); let i = 0;
        T.every(16, () => { if (i <= d.text.length) p.innerHTML = esc(d.text.slice(0, i++)).replace(/\*\*(.+?)\*\*/g, "<b>$1</b>").replace(/\*\*[^*]*$/, ""); });
      },
    }),

    email: (d) => ({
      html: `
        <div class="mail-demo">
          <div class="md-card">
            <div class="md-h"><b>From</b> ${esc(d.from)}</div>
            <div class="md-h"><b>Subject</b> ${esc(d.subject)}</div>
            <p>${d.body.map((part) => (typeof part === "string" ? esc(part) : `<u class="lk" style="--d:${part.d}s" data-v="${part.v}">${esc(part.t)}<span class="lk-tag">${part.v}</span></u>`)).join("")}</p>
            <div class="md-beam"></div>
          </div>
          <div class="md-links">${d.links.map(([u, v], i) => `<div style="--d:${1.2 + i * 0.5}s"><code>${esc(u)}</code>${sev(v === "SAFE" ? "OK" : v)}</div>`).join("")}</div>
        </div>`,
    }),

    code: (d) => ({
      html: `
        <div class="code-demo ${d.fix ? "fixmode" : ""}">
          <div class="cd-file">${esc(d.file)}</div>
          <pre>${d.lines.map((ln, i) => {
            const n = d.start + i, bad = i === d.bad, src = d.taint && d.taint.includes(i);
            return `<div class="cl ${bad ? "bad" : ""} ${src ? "src" : ""}" style="--k:${i}"><span>${n}</span>${esc(ln)}</div>${bad && d.fix ? `<div class="cl add" style="--k:${i}"><span>+</span>${esc(d.fix)}</div>` : ""}`;
          }).join("")}</pre>
          <div class="cd-beam"></div>
          <div class="cd-note">${sev(d.sev)} <b>${esc(d.title)}</b><span>${esc(d.note)}</span></div>
        </div>`,
    }),

    api: (d) => ({
      html: `
        <div class="api-demo">
          <div class="ap-list">${d.rows.map(([m, p, st, tag], i) => `<div class="ap-row ${tag ? "hit" : ""}" style="--d:${0.3 + i * 0.35}s"><span class="m ${m.toLowerCase()}">${m}</span><code>${esc(p)}</code><b class="st">${st}</b>${tag ? sev(tag) : '<span class="sv sv-ok">PASS</span>'}</div>`).join("")}</div>
          ${d.evidence ? `<div class="ap-ev"><h6>${esc(d.evidence.title)}</h6><pre>${d.evidence.body}</pre></div>` : ""}
        </div>`,
    }),
  };

  /* ======================================================
     Demo scripts — 5 scenes per app
     ====================================================== */
  window.ZONE_DEMOS = {
    traffic: [
      { k: "upload", t: "Capture traffic", c: "Point it at a live interface or drop a PCAP — capture starts instantly.",
        d: { ext: "PCAP", file: "office-uplink.pcapng", size: "1.24 GB · 2.8M packets", done: "Capture loaded", meta: ["Interface: eth0 · promiscuous", "Window: 14:00 – 14:30", "Hosts seen: 312"] } },
      { k: "stream", t: "Decode every protocol", c: "Packets are reassembled into flows and decoded from Layer 3 up to Layer 7.",
        d: { head: "Decoding flows", lines: [["d", "reassembling TCP streams … 48,210 flows"], ["c", "L7 ▸ HTTPS 46%  DNS 24%  SSH 14%  SMB 10%"], ["", "TLS ▸ JA3 fingerprints extracted (1,904)"], ["", "DNS ▸ 182,440 queries parsed"], ["w", "DNS ▸ 3 hosts with unusually long TXT queries"], ["", "GeoIP ▸ 41 countries mapped"], ["w", "TLS ▸ unknown JA3 from 10.0.4.17"], ["c", "✓ decode complete"]] } },
      { k: "bars", t: "Baseline & spot spikes", c: "Normal traffic is learned per host — anything that breaks the pattern stands out.",
        d: { title: "Outbound volume · 10.0.4.17", sub: "per minute · last 30 min", n: 30, base: 34, spikes: [21, 22, 23], callTitle: "+2,140% above baseline", call: "Sustained upload to a single external IP over TLS." } },
      { k: "graph", t: "Detect the threat", c: "The flow map pinpoints the exfiltration path from an internal host to the attacker.",
        d: { alert: "Data exfiltration · 10.0.4.17 → 45.137.21.9:443 · 2.1 GB",
          nodes: [{ x: .12, y: .3, label: "10.0.1.5" }, { x: .12, y: .75, label: "10.0.2.33" }, { x: .38, y: .52, label: "core-switch", big: 1 }, { x: .62, y: .25, label: "10.0.4.17", bad: 1 }, { x: .64, y: .8, label: "dns-01" }, { x: .9, y: .45, label: "45.137.21.9", bad: 1, big: 1 }],
          edges: [[0, 2], [1, 2], [2, 4], [2, 3], [3, 5, 1]] } },
      { k: "report", t: "Export the evidence", c: "One click gives you a report plus the exact PCAP slice for the incident.",
        d: { title: "Network Incident Report", sub: "INC-2026-1142 · exfiltration", sections: ["Executive summary", "Timeline of the flow", "Indicators (IPs, JA3, domains)", "Recommended containment"], formats: ["PDF", "PCAP slice", "CSV", "JSON"], done: "Report ready" } },
    ],

    logsense: [
      { k: "stream", t: "Ingest every source", c: "Servers, apps and cloud logs stream in — no agents to babysit.",
        d: { head: "Connecting log sources", lines: [["c", "+ syslog · 14 Linux hosts"], ["c", "+ nginx access/error · 6 nodes"], ["c", "+ Windows Event Log · 22 endpoints"], ["c", "+ auth-api (JSON)"], ["c", "+ cloud audit trail"], ["d", "ingest rate ▸ 18,400 events/sec"], ["", "✓ 5 sources live · 0 parse errors"]] } },
      { k: "query", t: "Search in plain terms", c: "Every format is normalised, so one query searches everything at once.",
        d: { q: "status:401 AND service:auth-api | stats count by src_ip", range: "Last 1h", count: 4812, rows: [["185.220.101.4", "HIGH", "2,206 fails"], ["185.220.101.7", "HIGH", "1,940 fails"], ["185.220.101.9", "HIGH", "611 fails"], ["10.0.3.14", "LOW", "55 fails"]] } },
      { k: "bars", t: "Correlate the pattern", c: "Correlation rules tie the failures together across services in a single timeline.",
        d: { title: "Failed logins · auth-api", sub: "per minute · last 40 min", n: 34, base: 22, spikes: [24, 25, 26, 27], callTitle: "Brute-force rule fired", call: "4,812 failures from 3 IPs in 6 minutes." } },
      { k: "ai", t: "Get the AI summary", c: "Instead of grep, you get a plain-language explanation and a next step.",
        d: { scope: "4,812 events", text: "Between 14:02 and 14:08 **auth-api** received **4,812 failed logins** from **3 IPs** in the same /24 range. Usernames tried are common defaults (admin, root, test). This matches **credential stuffing**. One success followed for **temp01**, which was then given **admin** rights. Recommend: block 185.220.101.0/24, disable temp01, force MFA.", tags: ["T1110 Brute Force", "T1078 Valid Accounts", "Priority: High"] } },
      { k: "findings", t: "Alert the right people", c: "Alerts land with evidence and a severity, ready to act on.",
        d: { items: [["CRIT", "Privilege escalation: temp01 → admin", "iam"], ["HIGH", "Credential stuffing on auth-api", "3 IPs"], ["HIGH", "Login success after 4,811 failures", "temp01"], ["MED", "Rate limit hit on /api/login", "nginx"], ["LOW", "New source country seen", "geo"]] } },
    ],

    emailshield: [
      { k: "upload", t: "Receive the email", c: "Drop a suspicious .eml or paste the full source — Shield takes it from there.",
        d: { ext: "EML", file: "Urgent-account-notice.eml", size: "48 KB · 1 attachment", done: "Email parsed", meta: ["Sender: alerts@acme-bank-verify.xyz", "SPF: fail · DKIM: none", "Links found: 3"] } },
      { k: "email", t: "Extract every link", c: "Links in text, buttons and attachments are pulled out and checked one by one.",
        d: { from: "Acme Bank Security <alerts@acme-bank-verify.xyz>", subject: "Urgent: your account will be suspended in 24h",
          body: ["Dear customer, we detected unusual activity. Please ", { t: "verify your identity", v: "PHISH", d: 1.1 }, " immediately to avoid suspension. You can also ", { t: "view the notice", v: "SUSP", d: 1.7 }, " or contact ", { t: "support", v: "SAFE", d: 2.3 }, "."],
          links: [["bit.ly/3xAcm", "CRIT"], ["notice-view.top/doc", "MED"], ["acmebank.com/support", "SAFE"]] } },
      { k: "stream", t: "Detonate in a sandbox", c: "Each link is opened safely in isolation, following every redirect to the real destination.",
        d: { head: "Sandbox · bit.ly/3xAcm", lines: [["d", "GET bit.ly/3xAcm → 301"], ["d", "→ track.click-r.io/a8 → 302"], ["w", "→ acme-bank-verify.xyz/login → 200"], ["w", "domain age ▸ 2 days · registrar privacy on"], ["e", "lookalike ▸ 'acme-bank-verify' vs 'acmebank' (92% similar)"], ["e", "page ▸ password form posting to /collect.php"], ["e", "intel ▸ listed on 3 of 8 feeds"], ["c", "✓ detonation complete"]] } },
      { k: "score", t: "Score the risk", c: "Every signal rolls up into one clear risk score with the reasons behind it.",
        d: { v: 92, col: "#ff5a6e", verdict: "PHISHING", reasons: ["Lookalike of a known bank domain", "Domain registered 2 days ago", "Credential form on landing page", "Sender failed SPF", "Flagged by 3 intel sources"] } },
      { k: "findings", t: "Act on the verdict", c: "Quarantine, open a case, and show the user exactly why it was blocked.",
        d: { items: [["CRIT", "Credential phishing link blocked", "verify your identity"], ["MED", "Unknown domain flagged", "view the notice"], ["OK", "Legitimate support link", "acmebank.com"], ["HIGH", "Email quarantined · case #2 opened", "SOC"]] } },
    ],

    apkvapt: [
      { k: "upload", t: "Upload the APK", c: "Drop any Android build — release, debug or a third-party app.",
        d: { ext: "APK", file: "acme-wallet-3.2.1.apk", size: "18.4 MB · com.acme.wallet", done: "APK verified", meta: ["minSdk 24 · targetSdk 34", "Signed: v2 + v3 scheme", "Permissions requested: 14"] } },
      { k: "stream", t: "Decompile & map", c: "Code, manifest and resources are unpacked and every component is mapped.",
        d: { head: "Decompiling acme-wallet", lines: [["d", "unpacking dex ▸ classes.dex … classes3.dex"], ["", "decompiled 4,812 classes · 61,204 methods"], ["", "manifest ▸ 9 activities · 3 services · 2 receivers"], ["w", "manifest ▸ .DeepLinkActivity exported=true"], ["w", "network_security_config ▸ cleartextTrafficPermitted"], ["", "resources ▸ 1,206 strings indexed"], ["c", "✓ attack surface mapped"]] } },
      { k: "findings", t: "Static analysis", c: "Taint-tracked rules catch secrets, insecure storage and risky components.",
        d: { items: [["CRIT", "Hard-coded API key in BuildConfig.java", "MASVS-STORAGE"], ["HIGH", "Cleartext traffic allowed", "MASVS-NETWORK"], ["HIGH", "Exported activity without permission", "MASVS-PLATFORM"], ["MED", "android:allowBackup=\"true\"", "MASVS-STORAGE"], ["LOW", "MD5 used for cache keys", "MASVS-CRYPTO"]] } },
      { k: "stream", t: "Dynamic testing", c: "Live instrumentation confirms what static analysis suspects — on a real runtime.",
        d: { head: "Frida · runtime session", lines: [["d", "spawn com.acme.wallet on emulator-5554"], ["", "hook okhttp3.CertificatePinner.check()"], ["e", "SSL pinning bypassed — traffic intercepted"], ["", "hook SharedPreferences.putString()"], ["e", "auth token written in plain text"], ["", "hook Cipher.getInstance()"], ["w", "AES/ECB mode in use"], ["c", "✓ 3 findings confirmed at runtime"]] } },
      { k: "score", t: "Risk & report", c: "A MASVS-mapped risk score and a developer-ready remediation report.",
        d: { v: 68, col: "#f5b54a", verdict: "HIGH RISK", reasons: ["1 critical · 2 high findings", "Weakest areas: STORAGE, NETWORK", "3 issues confirmed dynamically", "Report: PDF · HTML · JSON"] } },
    ],

    apivapt: [
      { k: "upload", t: "Import the API", c: "Bring an OpenAPI spec or Postman collection — or let it discover APIs from a domain.",
        d: { ext: "YAML", file: "shop-api.openapi.yaml", size: "OpenAPI 3.1 · 24 endpoints", done: "Spec imported", meta: ["Base URL: api.shop.example/v1", "Auth: Bearer (2 identities)", "Scope: signed · read-only probes"] } },
      { k: "api", t: "Map the attack surface", c: "Every endpoint, method and parameter is catalogued before testing starts.",
        d: { rows: [["GET", "/v1/users/{id}/orders", "200"], ["POST", "/v1/auth/login", "200"], ["PUT", "/v1/users/{id}", "200"], ["GET", "/v1/products", "200"], ["DEL", "/v1/cart/{id}", "204"], ["GET", "/v1/admin/stats", "403"]] } },
      { k: "api", t: "Attack every endpoint", c: "Identity swapping, injection and rate-limit tests run against each route.",
        d: { rows: [["GET", "/v1/users/1043/orders", "200", "CRIT"], ["POST", "/v1/auth/login", "200", "HIGH"], ["PUT", "/v1/users/1042", "200", "MED"], ["GET", "/v1/products", "200"]],
          evidence: { title: "BOLA / IDOR — user 1042 reads user 1043", body: `<span class="c">GET</span> /v1/users/<mark>1043</mark>/orders
Authorization: Bearer …<span class="c">(user 1042)</span>
<span class="ok">HTTP/1.1 200 OK</span>
{ "orders": [{ "card_last4": "4421" }] }  <span class="bad">◄ leak</span>` } } },
      { k: "stream", t: "Verify — no false positives", c: "Findings are replayed and confirmed before they count.",
        d: { head: "Replay verification", lines: [["d", "soft-404 baseline ▸ random path → 404 ✓"], ["", "BOLA ▸ replay 1/3 → 200, foreign data"], ["", "BOLA ▸ replay 2/3 → 200, foreign data"], ["", "BOLA ▸ replay 3/3 → 200, foreign data"], ["e", "CONFIRMED · API1:2023 · CVSS 8.1"], ["w", "login ▸ 100 req/10s → no 429 (API4)"], ["c", "✓ 3 confirmed · 0 unverified"]] } },
      { k: "report", t: "Deliver the report", c: "OWASP API Top 10 mapped, CVSS scored, with request/response evidence.",
        d: { title: "API Security Assessment", sub: "shop-api · OWASP API Top 10 (2023)", sections: ["Executive summary", "Confirmed findings · CVSS 3.1", "Evidence: request / response", "Remediation & retest plan"], formats: ["PDF", "HTML", "JSON", "SARIF"], done: "Report ready" } },
    ],

    codereview: [
      { k: "upload", t: "Connect the code", c: "Drop a repo, folder, archive — or even an APK / IPA build.",
        d: { ext: "ZIP", file: "shop-backend.zip", size: "2,410 files · 186k lines", done: "Repository loaded", meta: ["Languages: JS/TS · Python · Java", "Mode: VAPT Source Reviewer", "Code never executed · sandboxed"] } },
      { k: "stream", t: "Parse & analyse", c: "12 engines run together — taint, secrets, dependencies, syntax and more.",
        d: { head: "Running 12 engines · 489 rules", lines: [["d", "parsing ▸ 2,410 files → AST"], ["", "SCA ▸ 312 dependencies · 4 known CVEs"], ["w", "secrets ▸ AWS key pattern in config/old.env"], ["", "taint ▸ 1,204 sources · 388 sinks"], ["e", "taint ▸ req.params.id → db.query() (unsanitised)"], ["", "syntax ▸ view.js:214 unclosed '{'"], ["c", "✓ analysis complete in 21s"]] } },
      { k: "code", t: "Trace the taint", c: "See exactly how user input travels to a dangerous call.",
        d: { file: "src/routes/users.js", start: 21, bad: 2, taint: [1], sev: "CRIT", title: "CWE-89 · SQL Injection", note: "req.params.id flows into a raw SQL string on line 23.",
          lines: ["router.get('/user/:id', async (req, res) => {", "  const id = req.params.id;", "  const q = \"SELECT * FROM users WHERE id=\" + id;", "  const rows = await db.query(q);", "  res.json(rows);", "});"] } },
      { k: "findings", t: "Review the findings", c: "Every issue comes with a CWE, a severity and where it lives.",
        d: { items: [["CRIT", "SQL injection in users.js:23", "CWE-89"], ["CRIT", "Hard-coded AWS key in config/old.env", "CWE-798"], ["HIGH", "Unsafe deserialisation in jobs.py:88", "CWE-502"], ["MED", "lodash 4.17.15 · prototype pollution", "CVE"], ["LOW", "Weak hash MD5 in crypto.js", "CWE-328"]] } },
      { k: "code", t: "Apply the fix", c: "A secure fix is suggested right next to the problem.",
        d: { file: "src/routes/users.js", start: 21, bad: 2, sev: "OK", title: "Fixed · parameterised query", note: "Input is now bound as a parameter, never concatenated.",
          fix: "  const rows = await db.query(\"SELECT * FROM users WHERE id = $1\", [id]);",
          lines: ["router.get('/user/:id', async (req, res) => {", "  const id = req.params.id;", "  const q = \"SELECT * FROM users WHERE id=\" + id;", "  res.json(rows);", "});"] } },
    ],
  };

  /* ======================================================
     Player
     ====================================================== */
  const SCENE_MS = 6000;
  let modal, app, scenes, idx = 0, playing = true, timers = [], sceneStart = 0, raf, opts = {};

  const T = {
    after: (ms, fn) => timers.push(setTimeout(fn, ms)),
    every: (ms, fn) => timers.push(setInterval(fn, ms)),
  };
  const clearTimers = () => { timers.forEach((t) => { clearTimeout(t); clearInterval(t); }); timers = []; };

  const build = () => {
    modal = document.createElement("div");
    modal.id = "demo";
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.innerHTML = `
      <div class="dm-backdrop"></div>
      <div class="dm-box">
        <header class="dm-top">
          <div class="dm-title"><span class="dm-ic"><svg><use href=""/></svg></span><div><b></b><small>PRODUCT DEMO</small></div></div>
          <div class="dm-step-n"></div>
          <button class="dm-x" aria-label="Close demo">✕</button>
        </header>
        <div class="dm-stage-wrap">
          <div class="dm-win-bar"><i></i><i></i><i></i><span></span><em>● REC</em></div>
          <div class="dm-stage"></div>
        </div>
        <div class="dm-cap"><h4></h4><p></p></div>
        <div class="dm-tl"></div>
        <footer class="dm-ctrl">
          <button class="dm-prev" aria-label="Previous step">◀</button>
          <button class="dm-play" aria-label="Pause">❚❚</button>
          <button class="dm-next" aria-label="Next step">▶</button>
          <button class="dm-replay">↻ REPLAY</button>
          <span class="dm-hint">← → to step · Space to pause · Esc to close</span>
        </footer>
      </div>`;
    document.body.appendChild(modal);
    modal.querySelector(".dm-backdrop").onclick = close;
    modal.querySelector(".dm-x").onclick = close;
    modal.querySelector(".dm-prev").onclick = () => go(idx - 1);
    modal.querySelector(".dm-next").onclick = () => go(idx + 1);
    modal.querySelector(".dm-replay").onclick = () => { setPlaying(true); go(0); };
    modal.querySelector(".dm-play").onclick = () => setPlaying(!playing);
    modal.querySelector(".dm-tl").onclick = (e) => { const s = e.target.closest(".dm-seg"); if (s) go(+s.dataset.i); };
    document.addEventListener("keydown", (e) => {
      if (!modal.classList.contains("open")) return;
      if (e.key === "Escape") close();
      else if (e.key === "ArrowRight") go(idx + 1);
      else if (e.key === "ArrowLeft") go(idx - 1);
      else if (e.key === " ") { e.preventDefault(); setPlaying(!playing); }
    });
  };

  const setPlaying = (p) => {
    playing = p;
    const b = modal.querySelector(".dm-play");
    b.textContent = p ? "❚❚" : "▶";
    b.setAttribute("aria-label", p ? "Pause" : "Play");
    modal.classList.toggle("paused", !p);
    if (p) sceneStart = performance.now() - pausedAt;
  };
  let pausedAt = 0;

  const go = (i) => {
    if (i < 0 || i >= scenes.length) return;
    idx = i;
    clearTimers();
    const s = scenes[i];
    const scene = K[s.k](s.d);
    const stage = modal.querySelector(".dm-stage");
    stage.innerHTML = `<div class="scene" style="--accent:${app.color}">${scene.html}</div>`;
    if (scene.run) scene.run(stage.firstElementChild, T);
    modal.querySelector(".dm-cap h4").innerHTML = `<em>${String(i + 1).padStart(2, "0")}</em> ${esc(s.t)}`;
    modal.querySelector(".dm-cap p").textContent = s.c;
    modal.querySelector(".dm-step-n").textContent = `STEP ${i + 1} / ${scenes.length}`;
    modal.querySelectorAll(".dm-seg").forEach((seg, k) => {
      seg.classList.toggle("done", k < i);
      seg.classList.toggle("on", k === i);
      seg.querySelector("i").style.width = k < i ? "100%" : "0%";
    });
    modal.querySelector(".dm-replay").classList.toggle("show", i === scenes.length - 1);
    sceneStart = performance.now();
    pausedAt = 0;
  };

  const tick = () => {
    const now = performance.now();
    if (modal && modal.classList.contains("open")) {
      if (playing) {
        const t = now - sceneStart;
        pausedAt = t;
        const seg = modal.querySelectorAll(".dm-seg")[idx];
        if (seg) seg.querySelector("i").style.width = Math.min(100, (t / SCENE_MS) * 100) + "%";
        if (t >= SCENE_MS) {
          if (idx < scenes.length - 1) go(idx + 1);
          else if (opts.onEnd) { const next = opts.onEnd; opts = {}; next(); }
          else setPlaying(false);
        }
      }
    }
  };

  const close = () => {
    modal.classList.remove("open");
    clearTimers();
    clearInterval(raf);
    opts = {};
    document.body.style.overflow = "";
    if (lastFocus) lastFocus.focus();
  };
  let lastFocus = null;

  window.openDemo = (appData, options = {}) => {
    opts = options;
    if (!modal) build();
    app = appData;
    scenes = window.ZONE_DEMOS[app.id] || [];
    if (!scenes.length) return;
    lastFocus = document.activeElement;
    modal.style.setProperty("--accent", app.color);
    modal.querySelector(".dm-title b").textContent = app.name;
    modal.querySelector(".dm-ic use").setAttribute("href", "#" + app.icon);
    modal.querySelector(".dm-win-bar span").textContent = options.label ? `${options.label} · ${app.name}` : `${app.name} — demo walkthrough`;
    modal.querySelector(".dm-tl").innerHTML = scenes.map((s, i) => `<button class="dm-seg" data-i="${i}"><i></i><span>${esc(s.t)}</span></button>`).join("");
    modal.classList.add("open");
    document.body.style.overflow = "hidden";
    setPlaying(true);
    go(0);
    modal.querySelector(".dm-x").focus();
    clearInterval(raf);
    raf = setInterval(tick, 60);
  };
})();
