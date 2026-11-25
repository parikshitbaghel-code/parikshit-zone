/* ZONE — illustrated product snapshots (used when an app has no real screenshot) */
(() => {
  const r = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;
  const bars = (n, lo, hi, spikeAt = -1) =>
    Array.from({ length: n }, (_, i) => `<i style="--h:${i === spikeAt ? 96 : r(lo, hi)}%"${i === spikeAt ? ' class="spike"' : ""}></i>`).join("");
  const sev = (s) => `<span class="sv sv-${s.toLowerCase()}">${s}</span>`;
  const ring = (v, col, label) =>
    `<div class="sn-ring" style="--v:${v};--col:${col}"><b>${v}</b><small>${label}</small></div>`;

  window.ZONE_SNAPS = {
    traffic: () => `
      <div class="sn-row">
        <div class="sn-card grow"><h6>Bandwidth · eth0 · live <em class="live-dot">●</em></h6>
          <div class="sn-bars live">${bars(36, 18, 62, 27)}</div>
          <div class="sn-axis"><span>-60s</span><span>-30s</span><span>now</span></div></div>
        <div class="sn-card"><h6>Protocols</h6>
          <div class="sn-donut" style="background:conic-gradient(#2de1b4 0 46%,#a78bfa 0 70%,#7c8cff 0 84%,#f5b54a 0 94%,#4ade80 0)"><span>14.2<br><small>GB</small></span></div>
          <ul class="sn-legend"><li><i style="background:#2de1b4"></i>HTTPS 46%</li><li><i style="background:#a78bfa"></i>DNS 24%</li><li><i style="background:#7c8cff"></i>SSH 14%</li><li><i style="background:#f5b54a"></i>SMB 10%</li></ul></div>
      </div>
      <div class="sn-card"><h6>Top flows <span class="sn-pill crit">2 alerts</span></h6>
        <table class="sn-table">
          <tr><th>Source</th><th>Destination</th><th>Proto</th><th>Bytes</th><th>Verdict</th></tr>
          <tr class="hl"><td>10.0.4.17</td><td>45.137.21.9:443</td><td>TLS</td><td>2.1 GB</td><td>${sev("CRIT")} Exfil</td></tr>
          <tr><td>10.0.2.33</td><td>8.8.8.8:53</td><td>DNS</td><td>418 MB</td><td>${sev("HIGH")} Tunnel</td></tr>
          <tr><td>10.0.1.5</td><td>10.0.1.20:445</td><td>SMB</td><td>96 MB</td><td>${sev("LOW")} Normal</td></tr>
          <tr><td>10.0.3.9</td><td>172.16.0.4:22</td><td>SSH</td><td>12 MB</td><td>${sev("LOW")} Normal</td></tr>
        </table></div>`,

    logsense: () => `
      <div class="sn-search"><span>⌕</span><code>status:401 AND service:auth-api | stats count by src_ip</code><em>Last 1h</em></div>
      <div class="sn-row">
        <div class="sn-card grow"><h6>Events over time <span class="sn-pill warn">anomaly</span></h6>
          <div class="sn-bars">${bars(40, 10, 34, 31)}</div></div>
        <div class="sn-card ai"><h6>✦ AI summary</h6>
          <p>Spike of <b>4,812</b> failed logins on <b>auth-api</b> from <b>3 IPs</b> in 6 min. Pattern matches <b>credential stuffing</b>. Recommend blocking 185.220.x.x range and forcing MFA.</p></div>
      </div>
      <div class="sn-card sn-logs"><h6>Live tail</h6>
        <div><time>14:02:11</time>${sev("HIGH")}<em>auth-api</em>401 login failed user=admin src=185.220.101.4</div>
        <div><time>14:02:11</time>${sev("HIGH")}<em>auth-api</em>401 login failed user=root src=185.220.101.7</div>
        <div><time>14:02:10</time>${sev("MED")}<em>nginx</em>429 rate limit hit /api/login</div>
        <div><time>14:02:08</time>${sev("LOW")}<em>billing</em>200 invoice generated id=88213</div>
        <div><time>14:02:07</time>${sev("CRIT")}<em>iam</em>role change: user=temp01 → admin</div>
      </div>`,

    emailshield: () => `
      <div class="sn-row">
        <div class="sn-card grow sn-mail">
          <div class="mh"><b>From:</b> Acme Bank Security &lt;alerts@acme-bank-verify.xyz&gt;</div>
          <div class="mh"><b>Subject:</b> Urgent: your account will be suspended in 24h</div>
          <p>Dear customer, we detected unusual activity. Please <u class="bad">verify your identity</u> immediately to avoid suspension. You can also <u class="sus">view the notice</u> or contact <u class="ok">support</u>.</p>
        </div>
        <div class="sn-card center">${ring(92, "#ff5a6e", "RISK")}<span class="sn-verdict">PHISHING</span></div>
      </div>
      <div class="sn-card"><h6>Extracted links · 3</h6>
        <table class="sn-table">
          <tr><th>URL</th><th>Redirects</th><th>Signals</th><th>Verdict</th></tr>
          <tr class="hl"><td>bit.ly/3xAcm → acme-bank-verify.xyz/login</td><td>3</td><td>Lookalike · domain age 2d · credential form</td><td>${sev("CRIT")}</td></tr>
          <tr><td>notice-view.top/doc?id=8812</td><td>1</td><td>New domain · no reputation</td><td>${sev("MED")}</td></tr>
          <tr><td>acmebank.com/support</td><td>0</td><td>Known good · valid TLS</td><td><span class="sv sv-ok">SAFE</span></td></tr>
        </table></div>`,

    apkvapt: () => `
      <div class="sn-row">
        <div class="sn-card grow sn-apk">
          <div class="apk-ic">▲</div>
          <div><b>com.acme.wallet</b><small>v3.2.1 · minSdk 24 · targetSdk 34 · 18.4 MB</small>
          <div class="sn-tags"><span class="bad">CAMERA</span><span class="bad">READ_SMS</span><span>INTERNET</span><span class="bad">ACCESS_FINE_LOCATION</span><span>BIOMETRIC</span></div></div>
        </div>
        <div class="sn-card center">${ring(68, "#f5b54a", "RISK")}<span class="sn-verdict warn">HIGH</span></div>
      </div>
      <div class="sn-row">
        <div class="sn-card"><h6>OWASP MASVS</h6>
          <ul class="sn-meter">
            ${[["STORAGE", 45, "#ff5a6e"], ["CRYPTO", 60, "#f5b54a"], ["AUTH", 82, "#4ade80"], ["NETWORK", 38, "#ff5a6e"], ["PLATFORM", 70, "#f5b54a"], ["CODE", 88, "#4ade80"]]
              .map(([k, v, c]) => `<li><span>${k}</span><i><b style="width:${v}%;background:${c}"></b></i><em>${v}</em></li>`).join("")}
          </ul></div>
        <div class="sn-card grow"><h6>Findings</h6>
          <ul class="sn-find">
            <li>${sev("CRIT")} Hard-coded API key in <code>BuildConfig.java</code></li>
            <li>${sev("HIGH")} Cleartext traffic allowed (network_security_config)</li>
            <li>${sev("HIGH")} Exported activity <code>.DeepLinkActivity</code> without permission</li>
            <li>${sev("MED")} <code>android:allowBackup="true"</code></li>
            <li>${sev("LOW")} Weak hash MD5 used for cache keys</li>
          </ul></div>
      </div>`,

    apivapt: () => `
      <div class="sn-row">
        <div class="sn-card sn-endp"><h6>Endpoints · 24</h6>
          <div><span class="m get">GET</span>/api/v1/users/{id}/orders ${sev("CRIT")}</div>
          <div><span class="m post">POST</span>/api/v1/auth/login ${sev("HIGH")}</div>
          <div><span class="m put">PUT</span>/api/v1/users/{id} ${sev("MED")}</div>
          <div><span class="m get">GET</span>/api/v1/products <span class="sv sv-ok">PASS</span></div>
          <div><span class="m del">DEL</span>/api/v1/cart/{id} <span class="sv sv-ok">PASS</span></div>
          <div><span class="m get">GET</span>/api/v1/admin/stats ${sev("HIGH")}</div>
        </div>
        <div class="sn-card grow sn-code"><h6>BOLA / IDOR — evidence</h6>
<pre><span class="c">// Request as user 1042, object owned by user 1043</span>
<b>GET</b> /api/v1/users/<mark>1043</mark>/orders
Authorization: Bearer eyJhbGciOi…<span class="c">(user 1042)</span>

<span class="ok">HTTP/1.1 200 OK</span>
{ "orders": [ { "id": 77812, "card_last4": "4421",
  "address": "…" } ] }   <span class="bad">◄ data of another user</span></pre></div>
      </div>
      <div class="sn-card"><h6>OWASP API Security Top 10</h6>
        <div class="sn-owasp">${["API1 BOLA", "API2 Auth", "API3 Prop", "API4 Rate", "API5 FuncAuth", "API6 Flow", "API7 SSRF", "API8 Config", "API9 Inventory", "API10 Consume"]
          .map((k, i) => `<span class="${[0].includes(i) ? "crit" : [1, 3].includes(i) ? "high" : [2].includes(i) ? "med" : "pass"}">${k}</span>`).join("")}</div></div>`,

    codereview: () => `
      <div class="sn-row">
        <div class="sn-card sn-tree"><h6>repo / shop-backend</h6>
          <div>▾ src</div><div class="in">▾ routes</div><div class="in2 on">users.js <em>2</em></div><div class="in2">orders.js <em>1</em></div>
          <div class="in">▸ utils</div><div class="in2">crypto.js <em>1</em></div><div>▸ config</div><div class="in">.env.example</div>
        </div>
        <div class="sn-card grow sn-code"><h6>src/routes/users.js</h6>
<pre class="lines"><span>21</span> router.get('/user/:id', async (req, res) => {
<span>22</span>   const id = req.params.id;
<span class="hl">23</span>   <mark>const q = "SELECT * FROM users WHERE id=" + id;</mark>
<span>24</span>   const rows = await db.query(q);
<span>25</span>   res.json(rows);
<span>26</span> });</pre>
          <div class="sn-note">${sev("CRIT")} <b>CWE-89 · SQL Injection</b> — user input <code>req.params.id</code> flows into a raw SQL string.
            <div class="fix">Fix → <code>db.query("SELECT * FROM users WHERE id = $1", [id])</code></div></div>
        </div>
      </div>
      <div class="sn-row">
        ${[["Critical", 2, "#ff5a6e"], ["High", 5, "#7c8cff"], ["Medium", 11, "#f5b54a"], ["Low", 19, "#2de1b4"]]
          .map(([k, v, c]) => `<div class="sn-card sn-count" style="--c:${c}"><b>${v}</b><small>${k}</small></div>`).join("")}
      </div>`,
  };
})();
