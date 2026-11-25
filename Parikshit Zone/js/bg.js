/* ZONE — layered sci-fi background
 *  1. WebGL shader: nebula, star fields, aurora, hex field, perspective grid floor with scan pulses
 *  2. (core.js canvas) network constellation with travelling data packets
 *  3. HUD overlay: corner brackets, edge rulers, reticle, scan sweep, live readouts
 * Falls back gracefully: no WebGL -> CSS gradient; reduced motion -> single static frame.
 */
(() => {
  const Z = window.Z;
  if (!Z) return;

  /* ================= 1. WebGL shader layer ================= */
  const cv = document.createElement("canvas");
  cv.id = "bgfx";
  cv.setAttribute("aria-hidden", "true");
  document.body.prepend(cv);

  const gl = cv.getContext("webgl", { antialias: false, alpha: false, preserveDrawingBuffer: false, powerPreference: "low-power" });
  if (!gl) { document.documentElement.classList.add("no-gl"); }

  const VERT = `attribute vec2 a; void main(){ gl_Position = vec4(a, 0.0, 1.0); }`;
  const FRAG = `
    precision highp float;
    uniform vec2 uRes; uniform float uTime; uniform vec2 uMouse; uniform float uScroll; uniform float uPulse;

    float hash(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
    float noise(vec2 p){
      vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
      return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
    }
    float fbm(vec2 p){
      float v = 0.0, a = 0.5; mat2 m = mat2(1.6, 1.2, -1.2, 1.6);
      for (int i = 0; i < 5; i++) { v += a * noise(p); p = m * p; a *= 0.5; }
      return v;
    }
    // distance to nearest hexagon edge
    float hexEdge(vec2 p){
      const vec2 s = vec2(1.0, 1.7320508);
      vec4 hc = floor(vec4(p, p - vec2(0.5, 1.0)) / s.xyxy) + 0.5;
      vec4 h = vec4(p - hc.xy * s, p - (hc.zw + 0.5) * s);
      vec2 q = dot(h.xy, h.xy) < dot(h.zw, h.zw) ? h.xy : h.zw;
      q = abs(q);
      return 0.5 - max(dot(q, s * 0.5), q.x);
    }

    void main(){
      vec2 uv = gl_FragCoord.xy / uRes;
      vec2 p = (gl_FragCoord.xy - 0.5 * uRes) / uRes.y;
      vec2 par = (uMouse - 0.5) * 0.07;
      float t = uTime;

      vec3 mint = vec3(0.176, 0.882, 0.706);
      vec3 indigo = vec3(0.486, 0.549, 1.0);
      vec3 violet = vec3(0.655, 0.545, 0.98);
      vec3 col = vec3(0.010, 0.016, 0.028);

      /* --- nebula --- */
      vec2 q = p * 1.35 + par + vec2(0.0, uScroll * 0.12);
      float w = fbm(q * 2.0 - t * 0.02);
      float n1 = fbm(q * 1.5 + vec2(t * 0.025, -t * 0.015) + w * 1.3);
      float n2 = fbm(q * 1.1 - vec2(t * 0.018, t * 0.01) + 3.7);
      col += mint * pow(n1, 3.2) * 0.42;
      col += indigo * pow(n2, 3.0) * 0.5;
      col += violet * pow(fbm(q * 0.8 + 9.0 + t * 0.01), 4.0) * 0.25;

      /* --- aurora ribbon --- */
      float ay = 0.28 + 0.07 * sin(p.x * 2.3 + t * 0.12) + 0.03 * sin(p.x * 5.1 - t * 0.2);
      float band = exp(-pow((p.y - ay) * 6.0, 2.0));
      col += mix(mint, indigo, 0.5 + 0.5 * sin(p.x * 1.4 + t * 0.08)) * band * (0.05 + 0.09 * n1);

      /* --- star fields (parallax layers) --- */
      for (int L = 0; L < 3; L++) {
        float s = float(L) + 1.0;
        vec2 g = (p + par * s * 0.6 + vec2(t * 0.002 * s, uScroll * 0.05 * s)) * (45.0 + 30.0 * s);
        vec2 id = floor(g), f = fract(g) - 0.5;
        float h = hash(id + s * 13.1);
        if (h > 0.962) {
          vec2 o = (vec2(hash(id + 1.7), hash(id + 2.3)) - 0.5) * 0.6;
          float d = length(f - o);
          float tw = 0.55 + 0.45 * sin(t * (0.8 + h * 3.0) + h * 60.0);
          vec3 sc = mix(vec3(0.85, 0.92, 1.0), mint, step(0.993, h));
          col += sc * smoothstep(0.075, 0.0, d) * tw * (0.9 / s);
        }
      }

      /* --- hex field revealed by noise --- */
      float he = hexEdge((p + par * 0.4) * 11.0);
      float hmask = smoothstep(0.52, 0.72, fbm(p * 2.2 + vec2(t * 0.03, 0.0)));
      col += mint * smoothstep(0.035, 0.0, he) * hmask * 0.055;

      /* --- perspective grid floor --- */
      float hz = -0.16 + par.y * 0.5;
      float below = hz - p.y;
      if (below > 0.0) {
        float z = 0.32 / below;
        float x = (p.x + par.x * 2.0) * z;
        float zz = z + t * 0.35;
        float gx = abs(fract(x) - 0.5), gz = abs(fract(zz) - 0.5);
        float aa = 0.012 * z + 0.01;
        float line = max(1.0 - smoothstep(0.0, aa, 0.5 - gx), 1.0 - smoothstep(0.0, aa, 0.5 - gz));
        float fade = exp(-z * 0.16) * smoothstep(0.0, 0.06, below);
        col += mint * line * fade * 0.32;
        // outward scan pulse
        float pr = mod(t * 2.2, 26.0);
        float wave = exp(-pow(z - pr, 2.0) * 1.2);
        col += mint * wave * fade * (0.18 + line * 0.5);
        // big periodic pulse
        col += indigo * exp(-pow(z - uPulse * 30.0, 2.0) * 0.6) * fade * 0.35 * (1.0 - uPulse);
      }
      // horizon glow
      col += mix(mint, indigo, 0.5) * exp(-abs(p.y - hz) * 22.0) * 0.22;

      /* --- mouse spotlight --- */
      vec2 mp = (uMouse - 0.5) * vec2(uRes.x / uRes.y, 1.0);
      col += mint * exp(-length(p - mp) * 3.2) * 0.045;

      /* --- grade + vignette --- */
      col *= 1.0 - 0.55 * pow(length(uv - 0.5) * 1.25, 2.2);
      col = pow(col, vec3(0.95));
      gl_FragColor = vec4(col, 1.0);
    }`;

  let prog, uRes, uTime, uMouse, uScroll, uPulse;
  const SCALE = 0.55; // render below native res for performance; the look is soft anyway
  let W = 1, H = 1;
  const resize = () => {
    const d = Math.min(devicePixelRatio || 1, 1.5) * SCALE;
    W = Math.max(1, Math.floor(innerWidth * d)); H = Math.max(1, Math.floor(innerHeight * d));
    cv.width = W; cv.height = H;
    if (gl) gl.viewport(0, 0, W, H);
  };

  if (gl) {
    const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) { console.warn("bg shader:", gl.getShaderInfoLog(s)); return null; } return s; };
    const vs = sh(gl.VERTEX_SHADER, VERT), fs = sh(gl.FRAGMENT_SHADER, FRAG);
    if (vs && fs) {
      prog = gl.createProgram(); gl.attachShader(prog, vs); gl.attachShader(prog, fs); gl.linkProgram(prog);
      if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { console.warn("bg link failed"); prog = null; }
    }
    if (prog) {
      gl.useProgram(prog);
      const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
      const loc = gl.getAttribLocation(prog, "a"); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
      uRes = gl.getUniformLocation(prog, "uRes"); uTime = gl.getUniformLocation(prog, "uTime");
      uMouse = gl.getUniformLocation(prog, "uMouse"); uScroll = gl.getUniformLocation(prog, "uScroll"); uPulse = gl.getUniformLocation(prog, "uPulse");
    } else document.documentElement.classList.add("no-gl");
  }
  resize(); addEventListener("resize", resize);

  let mx = 0.5, my = 0.5, tmx = 0.5, tmy = 0.5, pulse = 1, sc = 0;
  addEventListener("mousemove", (e) => { tmx = e.clientX / innerWidth; tmy = 1 - e.clientY / innerHeight; });
  addEventListener("click", () => { pulse = 0; }); // every click sends a pulse across the floor
  const t0 = performance.now();
  const frame = () => {
    if (!prog) return;
    mx += (tmx - mx) * 0.04; my += (tmy - my) * 0.04;
    sc += (scrollY / innerHeight - sc) * 0.08;
    pulse = Math.min(1, pulse + 0.006);
    gl.uniform2f(uRes, W, H);
    gl.uniform1f(uTime, (performance.now() - t0) / 1000);
    gl.uniform2f(uMouse, mx, my);
    gl.uniform1f(uScroll, sc);
    gl.uniform1f(uPulse, pulse);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  };
  if (Z.reduced) frame(); else Z.loops.unshift(frame);
  Z.bgPulse = () => (pulse = 0);

  /* ================= 3. HUD overlay ================= */
  const pad = (n, l = 4) => String(Math.max(0, Math.round(n))).padStart(l, "0");
  document.body.insertAdjacentHTML("afterbegin", `
    <div class="hud" aria-hidden="true">
      <div class="hud-c h-tl"><i></i></div>
      <div class="hud-c h-tr"><i></i></div>
      <div class="hud-c h-bl"><i></i><span>SECTOR <b id="hudSector">01</b> · SIG <b class="sig"><em></em><em></em><em></em><em></em><em></em></b> <b id="hudSig">98%</b></span></div>
      <div class="hud-c h-br"><i></i><span>X <b id="hudX">0000</b> · Y <b id="hudY">0000</b> · <b id="hudFps">60</b> FPS · T+<b id="hudUp">00:00:00</b></span></div>
      <div class="hud-rule l"></div><div class="hud-rule r"></div>
      <div class="hud-sweep"></div>
      <svg class="hud-reticle" viewBox="0 0 200 200">
        <circle cx="100" cy="100" r="92" class="r1"/><circle cx="100" cy="100" r="74" class="r2"/><circle cx="100" cy="100" r="56" class="r3"/>
        <path d="M100 0v22M100 178v22M0 100h22M178 100h22" class="r4"/>
      </svg>
    </div>`);
  let frames = 0, last = performance.now();
  const fpsLoop = (now) => {
    frames++;
    if (now - last >= 1000) {
      const f = document.getElementById("hudFps"); if (f) f.textContent = Math.min(144, Math.round((frames * 1000) / (now - last)));
      frames = 0; last = now;
    }
    requestAnimationFrame(fpsLoop);
  };
  requestAnimationFrame(fpsLoop);
  addEventListener("mousemove", (e) => {
    const x = document.getElementById("hudX"), y = document.getElementById("hudY");
    if (x) { x.textContent = pad(e.clientX); y.textContent = pad(e.clientY); }
  });
  const started = Date.now();
  setInterval(() => {
    const s = Math.floor((Date.now() - started) / 1000);
    const u = document.getElementById("hudUp");
    if (u) u.textContent = `${pad(s / 3600, 2)}:${pad((s % 3600) / 60, 2)}:${pad(s % 60, 2)}`;
    const g = document.getElementById("hudSig"); if (g) g.textContent = 94 + Math.floor(Math.random() * 6) + "%";
    const sec = document.getElementById("hudSector"); if (sec) sec.textContent = pad(1 + Math.floor((scrollY / Math.max(1, document.body.scrollHeight - innerHeight)) * 11), 2);
  }, 1000);
})();
