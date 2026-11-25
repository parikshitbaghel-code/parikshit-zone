/*
 * ZONE — site-wide settings. Edit freely.
 *   owner      : your name as shown on the site
 *   contact    : add links to show them on the About page and footer (leave "" to hide)
 *   categories : which group each product belongs to on the Products page
 */
window.SITE = {
  owner: "Parikshit",
  brand: "ZONE",
  tagline: "Security engineering & the ZONE suite",
  contact: {
    email: "",      // e.g. "you@example.com"
    github: "",     // e.g. "https://github.com/yourname"
    linkedin: "",   // e.g. "https://www.linkedin.com/in/yourname"
  },
  nav: [
    ["index.html", "home", "Home"],
    ["products.html", "products", "Products"],
    ["dashboard.html", "dashboard", "Command Center"],
    ["demos.html", "demos", "Demos"],
    ["console.html", "console", "Console"],
    ["about.html", "about", "About"],
  ],
  categories: {
    traffic: "Detect & Respond",
    logsense: "Detect & Respond",
    emailshield: "Prevent",
    apkvapt: "Offensive Testing",
    apivapt: "Offensive Testing",
    codereview: "Offensive Testing",
  },
  standards: [
    ["OWASP MASVS", "Mobile app security verification"],
    ["OWASP MASTG", "Mobile security testing guide"],
    ["OWASP API Top 10", "2023 API security risks"],
    ["OWASP Mobile Top 10", "Mobile risk categories"],
    ["MITRE CWE", "Weakness classification"],
    ["MITRE ATT&CK", "Adversary techniques"],
    ["CVSS 3.1", "Severity scoring"],
    ["SARIF", "Static analysis results format"],
  ],
  // capability matrix for the Products comparison table
  compare: [
    ["Live monitoring", ["traffic", "logsense", "emailshield"]],
    ["Upload & scan artefacts", ["traffic", "emailshield", "apkvapt", "apivapt", "codereview"]],
    ["AI-assisted analysis", ["logsense", "emailshield"]],
    ["Standards-mapped findings", ["logsense", "apkvapt", "apivapt", "codereview"]],
    ["Proof / evidence per finding", ["traffic", "emailshield", "apkvapt", "apivapt", "codereview"]],
    ["Severity scoring", ["emailshield", "apkvapt", "apivapt", "codereview"]],
    ["Report export", ["traffic", "logsense", "emailshield", "apkvapt", "apivapt", "codereview"]],
    ["CI / pipeline ready", ["apivapt", "codereview"]],
  ],
};
