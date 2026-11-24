(function () {
  'use strict';

  const TAU = Math.PI * 2;

  function mulberry32(seed) {
    let a = seed >>> 0;
    return function () {
      a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function clamp(v, lo, hi) {
    return v < lo ? lo : v > hi ? hi : v;
  }

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  function smooth(t) {
    const x = clamp(t, 0, 1);
    return x * x * (3 - 2 * x);
  }

  function parseColor(c) {
    if (Array.isArray(c)) return [c[0], c[1], c[2]];
    const h = String(c).replace('#', '');
    if (h.length === 3) {
      return [parseInt(h[0] + h[0], 16), parseInt(h[1] + h[1], 16), parseInt(h[2] + h[2], 16)];
    }
    const n = parseInt(h, 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }

  function mixRGB(c1, c2, t) {
    const u = clamp(t, 0, 1);
    return [lerp(c1[0], c2[0], u), lerp(c1[1], c2[1], u), lerp(c1[2], c2[2], u)];
  }

  function rgbStr(c, a) {
    const r = Math.round(clamp(c[0], 0, 255));
    const g = Math.round(clamp(c[1], 0, 255));
    const b = Math.round(clamp(c[2], 0, 255));
    if (a == null) return `rgb(${r},${g},${b})`;
    return `rgba(${r},${g},${b},${clamp(a, 0, 1).toFixed(4)})`;
  }

  function catmullRom(pts, samplesPerSeg = 14) {
    if (!pts || pts.length === 0) return [];
    if (pts.length === 1) return [[pts[0][0], pts[0][1]]];
    const p = [pts[0], ...pts, pts[pts.length - 1]];
    const out = [];
    for (let i = 1; i < p.length - 2; i++) {
      const [x0, y0] = p[i - 1];
      const [x1, y1] = p[i];
      const [x2, y2] = p[i + 1];
      const [x3, y3] = p[i + 2];
      for (let s = 0; s < samplesPerSeg; s++) {
        const t = s / samplesPerSeg;
        const t2 = t * t;
        const t3 = t2 * t;
        const x = 0.5 * ((2 * x1) + (-x0 + x2) * t + (2 * x0 - 5 * x1 + 4 * x2 - x3) * t2 + (-x0 + 3 * x1 - 3 * x2 + x3) * t3);
        const y = 0.5 * ((2 * y1) + (-y0 + y2) * t + (2 * y0 - 5 * y1 + 4 * y2 - y3) * t2 + (-y0 + 3 * y1 - 3 * y2 + y3) * t3);
        out.push([x, y]);
      }
    }
    out.push(pts[pts.length - 1].slice(0, 2));
    return out;
  }

  function resampleCurve(curve, targetStep = 3.2) {
    if (curve.length < 2) return curve.map(([x, y]) => ({ x, y, a: 0, u: 0 }));
    const cum = [0];
    let total = 0;
    for (let i = 1; i < curve.length; i++) {
      total += Math.hypot(curve[i][0] - curve[i - 1][0], curve[i][1] - curve[i - 1][1]);
      cum.push(total);
    }
    const count = Math.max(4, Math.ceil(total / targetStep));
    const samples = [];
    let idx = 0;
    for (let k = 0; k <= count; k++) {
      const dist = (k / count) * total;
      while (idx < cum.length - 2 && cum[idx + 1] < dist) idx++;
      const segLen = Math.max(1e-5, cum[idx + 1] - cum[idx]);
      const localT = clamp((dist - cum[idx]) / segLen, 0, 1);
      const x = lerp(curve[idx][0], curve[idx + 1][0], localT);
      const y = lerp(curve[idx][1], curve[idx + 1][1], localT);
      const a = Math.atan2(curve[idx + 1][1] - curve[idx][1], curve[idx + 1][0] - curve[idx][0]);
      samples.push({ x, y, a, u: k / count, len: total });
    }
    return samples;
  }

  function buildPaperBackdrop(w, h, opts, rand) {
    const off = document.createElement('canvas');
    off.width = w;
    off.height = h;
    const g = off.getContext('2d', { alpha: false });
    const mode = opts.mode || 'ink';

    if (mode === 'oil') {
      const base = parseColor(opts.backdropColor || '#1e1612');
      g.fillStyle = rgbStr(base);
      g.fillRect(0, 0, w, h);
      // Warm-cool ambient linen ground variation
      for (let i = 0; i < 42; i++) {
        const cx = rand() * w;
        const cy = rand() * h;
        const r = 120 + rand() * 260;
        const grad = g.createRadialGradient(cx, cy, r * 0.08, cx, cy, r);
        const shift = rand() > 0.5 ? 12 : -10;
        grad.addColorStop(0, rgbStr([base[0] + shift, base[1] + shift * 0.85, base[2] + shift * 0.65], 0.09));
        grad.addColorStop(1, rgbStr(base, 0));
        g.fillStyle = grad;
        g.fillRect(cx - r, cy - r, r * 2, r * 2);
      }
      // Subtle woven linen canvas threads
      g.lineWidth = 1;
      for (let y = 0; y < h; y += 5) {
        g.strokeStyle = y % 10 === 0 ? 'rgba(255,235,205,0.032)' : 'rgba(0,0,0,0.05)';
        g.beginPath();
        g.moveTo(0, y);
        g.lineTo(w, y);
        g.stroke();
      }
      for (let x = 0; x < w; x += 5) {
        g.strokeStyle = x % 10 === 0 ? 'rgba(255,235,205,0.028)' : 'rgba(0,0,0,0.045)';
        g.beginPath();
        g.moveTo(x, 0);
        g.lineTo(x, h);
        g.stroke();
      }
    } else {
      const base = parseColor(opts.backdropColor || '#f2e9d6');
      g.fillStyle = rgbStr(base);
      g.fillRect(0, 0, w, h);

      // Gentle antique Xuan tea-wash mottling
      for (let i = 0; i < 36; i++) {
        const cx = rand() * w;
        const cy = rand() * h;
        const rx = 140 + rand() * 340;
        const grad = g.createRadialGradient(cx, cy, rx * 0.1, cx, cy, rx);
        const warm = rand() > 0.45 ? -9 : 5;
        grad.addColorStop(0, rgbStr([base[0] + warm, base[1] + warm * 0.9, base[2] + warm * 1.1], 0.12));
        grad.addColorStop(1, rgbStr(base, 0));
        g.fillStyle = grad;
        g.fillRect(cx - rx, cy - rx, rx * 2, rx * 2);
      }

      // Fine Xuan plant fibers
      g.lineWidth = 0.7;
      for (let i = 0; i < 2400; i++) {
        const x = rand() * w;
        const y = rand() * h;
        const len = 3 + rand() * 14;
        const ang = rand() * TAU;
        g.strokeStyle = rand() > 0.42
          ? `rgba(255, 251, 240, ${(0.08 + rand() * 0.12).toFixed(3)})`
          : `rgba(138, 118, 88, ${(0.04 + rand() * 0.08).toFixed(3)})`;
        g.beginPath();
        g.moveTo(x, y);
        g.lineTo(x + Math.cos(ang) * len, y + Math.sin(ang) * len);
        g.stroke();
      }

      // Subtle vignette along paper edge
      const vg = g.createRadialGradient(w * 0.5, h * 0.48, Math.min(w, h) * 0.34, w * 0.5, h * 0.5, Math.max(w, h) * 0.74);
      vg.addColorStop(0, 'rgba(0,0,0,0)');
      vg.addColorStop(1, 'rgba(92, 74, 48, 0.09)');
      g.fillStyle = vg;
      g.fillRect(0, 0, w, h);
    }

    return off;
  }

  function injectStyles(theme) {
    if (document.getElementById('__c2p_tut_css')) return;
    const isDark = theme === 'gallery-dark';
    const bg = isDark
      ? 'radial-gradient(ellipse at 50% 35%, #231b15 0%, #140f0c 70%, #0b0806 100%)'
      : 'radial-gradient(ellipse at 50% 35%, #f4ede0 0%, #e7decb 72%, #dcd0ba 100%)';
    const inkColor = isDark ? '#eee4d3' : '#251e16';
    const subColor = isDark ? '#b7a690' : '#6b5e4c';
    const panelBg = isDark ? 'rgba(34, 27, 21, 0.88)' : 'rgba(250, 245, 234, 0.92)';
    const border = isDark ? 'rgba(196, 164, 108, 0.25)' : 'rgba(92, 74, 52, 0.24)';
    const btnBg = isDark ? '#2c221b' : '#f7f1e4';
    const btnText = isDark ? '#f1e7d5' : '#2f261d';
    const accent = '#9c3224';

    const style = document.createElement('style');
    style.id = '__c2p_tut_css';
    style.textContent = `
      * { box-sizing: border-box; margin: 0; padding: 0; }
      html, body {
        width: 100%;
        min-height: 100vh;
        background: ${bg};
        color: ${inkColor};
        font-family: "PingFang SC", "Hiragino Sans GB", "Noto Sans SC", "Microsoft YaHei", sans-serif;
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 12px 16px 16px;
        gap: 10px;
      }
      header {
        width: min(1240px, 96vw);
        display: flex;
        align-items: baseline;
        justify-content: space-between;
        flex-wrap: wrap;
        gap: 10px;
      }
      .title-wrap {
        display: flex;
        align-items: baseline;
        gap: 12px;
        flex-wrap: wrap;
      }
      h1 {
        font-family: "STKaiti", "Kaiti SC", "PingFang SC", serif;
        font-size: 24px;
        font-weight: 700;
        letter-spacing: 0.08em;
      }
      .subtitle {
        font-size: 13px;
        color: ${subColor};
        letter-spacing: 0.04em;
      }
      .header-right {
        display: flex;
        align-items: center;
        gap: 12px;
      }
      .cat-pill {
        font-size: 12px;
        font-weight: 600;
        padding: 3px 10px;
        border-radius: 999px;
        background: rgba(156, 50, 36, 0.14);
        border: 1px solid rgba(156, 50, 36, 0.35);
        color: ${isDark ? '#f0a695' : '#8d2f22'};
      }
      .stage-frame {
        background: ${isDark ? '#1e1610' : '#efe7d5'};
        padding: 10px;
        border-radius: 6px;
        border: 1px solid ${border};
        box-shadow: 0 18px 46px rgba(0, 0, 0, ${isDark ? '0.52' : '0.18'});
      }
      #painting {
        display: block;
        width: auto;
        height: auto;
        max-width: min(94vw, 1180px);
        max-height: calc(100vh - 214px);
        border: 1px solid ${border};
      }
      .controls-panel {
        width: min(1240px, 96vw);
        background: ${panelBg};
        border: 1px solid ${border};
        border-radius: 10px;
        padding: 10px 14px;
        display: flex;
        flex-direction: column;
        gap: 8px;
        box-shadow: 0 8px 24px rgba(0, 0, 0, ${isDark ? '0.32' : '0.08'});
      }
      .slider-row {
        display: flex;
        align-items: center;
        gap: 12px;
      }
      #progressSlider {
        -webkit-appearance: none;
        appearance: none;
        flex: 1;
        height: 7px;
        border-radius: 999px;
        background: ${isDark ? 'rgba(255,255,255,0.14)' : 'rgba(90,74,52,0.16)'};
        outline: none;
        cursor: pointer;
      }
      #progressSlider::-webkit-slider-thumb {
        -webkit-appearance: none;
        appearance: none;
        width: 17px;
        height: 17px;
        border-radius: 50%;
        background: ${accent};
        border: 2px solid #fbf6ec;
        box-shadow: 0 2px 6px rgba(0,0,0,0.35);
        cursor: grab;
      }
      .pct-text {
        font-size: 12px;
        font-weight: 600;
        color: ${subColor};
        min-width: 48px;
        text-align: right;
        font-variant-numeric: tabular-nums;
      }
      .layer-chips {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
        align-items: center;
      }
      .layer-chip {
        padding: 4px 10px;
        border-radius: 999px;
        border: 1px solid ${border};
        background: ${btnBg};
        color: ${subColor};
        font-size: 12px;
        cursor: pointer;
        transition: all 0.14s ease;
      }
      .layer-chip.done {
        color: ${inkColor};
        border-color: rgba(156, 50, 36, 0.35);
      }
      .layer-chip.current {
        background: ${accent};
        color: #fbf6ec;
        border-color: ${accent};
        font-weight: 600;
      }
      .toolbar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-wrap: wrap;
        gap: 8px;
      }
      .status-group {
        display: flex;
        align-items: center;
        gap: 10px;
        font-size: 13px;
        flex-wrap: wrap;
      }
      #layerStatus {
        font-weight: 600;
        color: ${inkColor};
      }
      #strokeStatus {
        color: ${subColor};
        font-variant-numeric: tabular-nums;
      }
      .btn-group {
        display: flex;
        align-items: center;
        gap: 6px;
        flex-wrap: wrap;
      }
      button, a.home-link {
        padding: 5px 11px;
        border-radius: 6px;
        border: 1px solid ${border};
        background: ${btnBg};
        color: ${btnText};
        font-size: 12px;
        font-family: inherit;
        font-weight: 500;
        cursor: pointer;
        text-decoration: none;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        transition: background 0.14s ease, border-color 0.14s ease;
      }
      button:hover, a.home-link:hover {
        border-color: ${accent};
      }
      button.primary {
        background: ${accent};
        color: #fbf6ec;
        border-color: ${accent};
        font-weight: 600;
      }
      button.active {
        border-color: ${accent};
        color: ${isDark ? '#f0a695' : accent};
        font-weight: 600;
      }
    `;
    document.head.appendChild(style);
  }

  function mount(config) {
    const W = config.width || 1000;
    const H = config.height || 1200;
    const mode = config.mode || 'ink';
    const theme = config.theme || (mode === 'oil' ? 'gallery-dark' : 'xuan');
    const layersMeta = config.layers || [];
    const filmMode = new URLSearchParams(location.search).get('filmMode') === '1';

    document.title = config.title || 'Code2Paint 经典教程';
    injectStyles(theme);

    document.body.innerHTML = `
      <header>
        <div class="title-wrap">
          <h1>${config.title || ''}</h1>
          <span class="subtitle">${config.subtitle || ''}</span>
        </div>
        <div class="header-right">
          ${config.category ? `<span class="cat-pill">${config.category}</span>` : ''}
          <a class="home-link" href="./index.html">← 回画廊首页</a>
        </div>
      </header>
      <div class="stage-frame">
        <canvas id="painting" width="${W}" height="${H}"></canvas>
      </div>
      <div class="controls-panel">
        <div class="slider-row">
          <input id="progressSlider" type="range" min="0" max="1" value="0" aria-label="作画步骤进度">
          <span class="pct-text" id="progressPercent">0.0%</span>
        </div>
        <div class="layer-chips" id="layerChips"></div>
        <div class="toolbar">
          <div class="status-group">
            <span id="layerStatus">准备铺纸研墨…</span>
            <span id="strokeStatus">0 / 0 笔</span>
          </div>
          <div class="btn-group">
            <button id="playPauseBtn" class="primary">暂停</button>
            <button id="stepBackBtn">退一步</button>
            <button id="stepForwardBtn">进一步</button>
            <button id="redrawBtn">重新绘制</button>
            <button id="speedBtn">加速 ×1</button>
            <button id="saveBtn">保存 PNG</button>
          </div>
        </div>
      </div>
    `;

    const canvas = document.getElementById('painting');
    const ctx = canvas.getContext('2d', { alpha: false });
    const slider = document.getElementById('progressSlider');
    const pctEl = document.getElementById('progressPercent');
    const layerChipsEl = document.getElementById('layerChips');
    const layerStatusEl = document.getElementById('layerStatus');
    const strokeStatusEl = document.getElementById('strokeStatus');
    const playPauseBtn = document.getElementById('playPauseBtn');
    const stepBackBtn = document.getElementById('stepBackBtn');
    const stepForwardBtn = document.getElementById('stepForwardBtn');
    const redrawBtn = document.getElementById('redrawBtn');
    const speedBtn = document.getElementById('speedBtn');
    const saveBtn = document.getElementById('saveBtn');

    const SPEEDS = [1, 2, 4];
    let speedIdx = 0;
    let seedCounter = config.seed || 0x20261124;
    let rand = mulberry32(seedCounter);
    let backdropCanvas = null;
    let strokes = [];
    let layerEndIdx = {};
    let current = 0;
    let isPaused = false;
    let rafId = null;
    let activeFrac = 0;
    let acc = 0;
    const checkpoints = new Map();
    const CHECKPOINT_INTERVAL = 24;

    function createAPI() {
      let nextStrokeSeed = 101;
      function pushStroke(layer, label, drawFn, dur = 1) {
        const strokeSeed = (nextStrokeSeed++) * 2654435761 >>> 0;
        strokes.push({
          layer,
          label,
          dur,
          draw: (c, progress = 1) => {
            const sr = mulberry32(strokeSeed);
            drawFn(c, sr, progress);
          }
        });
      }

      // Traditional ink stroke along polyline/Catmull-Rom curve
      function inkStroke(layer, label, pts, opts = {}) {
        const curve = resampleCurve(catmullRom(pts, opts.samples || 12), opts.step || 2.8);
        const w0 = opts.width || 10;
        const c1 = parseColor(opts.color || '#1c1916');
        const c2 = opts.colorEnd ? parseColor(opts.colorEnd) : c1;
        const tipCol = opts.tipColor ? parseColor(opts.tipColor) : c1;
        const alpha0 = opts.alpha == null ? 0.85 : opts.alpha;
        const bristles = opts.bristles || Math.max(3, Math.round(w0 * 0.55));
        const dry = opts.dry || 0;
        const bleed = opts.bleed || 0;
        const profile = opts.profile || 'taper'; // 'taper' | 'bambooLeaf' | 'nailHead' | 'uniform' | 'flat'
        const blend = opts.blend || 'multiply';
        const dur = opts.dur || clamp(curve.length / 32, 0.6, 2.2);

        pushStroke(layer, label, (c, sr, prog) => {
          const limit = Math.max(1, Math.floor(curve.length * clamp(prog, 0.02, 1)));
          c.save();
          c.globalCompositeOperation = blend;

          // Generate per-bristle lateral offsets and gaps cleanly
          const bData = [];
          for (let b = 0; b < bristles; b++) {
            const frac = bristles === 1 ? 0 : (b / (bristles - 1)) * 2 - 1;
            bData.push({
              frac,
              jitter: (sr() - 0.5) * 0.25,
              dropout: dry * (0.25 + sr() * 0.75),
              inkTone: (frac > 0.35 && opts.tipColor) ? mixRGB(c1, tipCol, 0.8) : mixRGB(c1, tipCol, sr() * 0.25)
            });
          }

          for (let i = 0; i < limit; i++) {
            const pt = curve[i];
            const u = pt.u;
            let widthMul = 1;
            let aMul = 1;
            if (profile === 'bambooLeaf') {
              widthMul = u < 0.25 ? smooth(u / 0.25) : Math.pow(clamp((1 - u) / 0.75, 0, 1), 0.78);
              widthMul = Math.max(0.06, widthMul);
              aMul = Math.min(1, u / 0.1) * Math.pow(clamp((1 - u) / 0.16, 0, 1), 0.7);
            } else if (profile === 'nailHead') {
              widthMul = u < 0.12 ? 1.35 - u * 2 : Math.max(0.18, 1.15 - u * 0.95);
              aMul = clamp((1 - u) / 0.12, 0.35, 1);
            } else if (profile === 'taper') {
              const e1 = smooth(u / 0.16);
              const e2 = smooth((1 - u) / 0.18);
              widthMul = 0.24 + 0.76 * Math.min(e1, e2);
              aMul = 0.45 + 0.55 * Math.min(e1, e2);
            } else if (profile === 'flat') {
              widthMul = 0.85 + 0.15 * Math.sin(u * Math.PI);
              aMul = 0.65 + 0.35 * Math.min(smooth(u / 0.15), smooth((1 - u) / 0.15));
            }

            const curW = w0 * widthMul;
            const colBase = mixRGB(c1, c2, u);
            const nx = -Math.sin(pt.a);
            const ny = Math.cos(pt.a);

            // Soft wet bleed halo on Xuan paper
            if (bleed > 0 && i % 3 === 0) {
              const br = curW * (0.72 + bleed * 0.65);
              c.fillStyle = rgbStr(colBase, alpha0 * aMul * bleed * 0.085);
              c.beginPath();
              c.ellipse(pt.x, pt.y, br, br * 0.72, pt.a, 0, TAU);
              c.fill();
            }

            // Bristle marks
            for (let b = 0; b < bristles; b++) {
              const bd = bData[b];
              if (bd.dropout > 0.05 && sr() < bd.dropout * (0.35 + 0.65 * Math.abs(bd.frac)) * (0.5 + 0.5 * u)) {
                continue;
              }
              const lat = (bd.frac + bd.jitter) * curW * 0.45;
              const bx = pt.x + nx * lat + (sr() - 0.5) * 0.7;
              const by = pt.y + ny * lat + (sr() - 0.5) * 0.7;
              const r = Math.max(0.55, (curW / Math.max(2.2, bristles * 0.68)) * (0.7 + sr() * 0.55));
              const tint = mixRGB(colBase, bd.inkTone, 0.45);
              c.fillStyle = rgbStr(tint, alpha0 * aMul * (0.28 + 0.22 * (1 - Math.abs(bd.frac) * 0.6)));
              c.beginPath();
              c.ellipse(bx, by, r * 1.35, r * 0.62, pt.a, 0, TAU);
              c.fill();
            }
          }
          c.restore();
        }, dur);
      }

      // Soft polygon wash for mountains, clouds, leaves, skies, snow shading
      function inkWash(layer, label, pts, opts = {}) {
        const col = parseColor(opts.color || '#5e5a54');
        const colEdge = opts.colorEdge ? parseColor(opts.colorEdge) : col;
        const alpha0 = opts.alpha == null ? 0.28 : opts.alpha;
        const blend = opts.blend || 'multiply';
        const passes = opts.passes || 18;
        const dur = opts.dur || 1.2;

        // Compute bounds once
        const curve = catmullRom(pts, 8);
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        for (const [x, y] of curve) {
          if (x < minX) minX = x;
          if (y < minY) minY = y;
          if (x > maxX) maxX = x;
          if (y > maxY) maxY = y;
        }
        const cw = Math.max(10, maxX - minX);
        const ch = Math.max(10, maxY - minY);

        pushStroke(layer, label, (c, sr, prog) => {
          c.save();
          c.beginPath();
          curve.forEach(([x, y], idx) => (idx === 0 ? c.moveTo(x, y) : c.lineTo(x, y)));
          c.closePath();
          c.clip();
          c.globalCompositeOperation = blend;

          const activePasses = Math.max(1, Math.round(passes * clamp(prog, 0.05, 1)));
          for (let i = 0; i < activePasses; i++) {
            const x = minX + sr() * cw;
            const y = minY + sr() * ch;
            const r = Math.max(cw, ch) * (0.25 + sr() * 0.45);
            const g = c.createRadialGradient(x, y, r * 0.05, x, y, r);
            const mixed = mixRGB(col, colEdge, clamp((y - minY) / ch, 0, 1));
            g.addColorStop(0, rgbStr(mixed, (alpha0 / Math.sqrt(passes)) * 1.15));
            g.addColorStop(0.7, rgbStr(mixed, (alpha0 / Math.sqrt(passes)) * 0.72));
            g.addColorStop(1, rgbStr(mixed, 0));
            c.fillStyle = g;
            c.fillRect(minX - r, minY - r, cw + r * 2, ch + r * 2);
          }

          if (opts.edgeRing) {
            c.strokeStyle = rgbStr(colEdge, alpha0 * 0.45 * clamp(prog, 0, 1));
            c.lineWidth = opts.edgeWidth || 2.2;
            c.stroke();
          }
          c.restore();
        }, dur);
      }

      // Organic splash / petal / blossom / moss / bird blotch
      function inkBlob(layer, label, x, y, rx, ry, rot = 0, opts = {}) {
        const col = parseColor(opts.color || '#25211c');
        const rimCol = opts.rimColor ? parseColor(opts.rimColor) : col;
        const alpha0 = opts.alpha == null ? 0.76 : opts.alpha;
        const count = opts.count || 14;
        const bleed = opts.bleed == null ? 0.3 : opts.bleed;
        const blend = opts.blend || 'multiply';

        pushStroke(layer, label, (c, sr, prog) => {
          c.save();
          c.globalCompositeOperation = blend;
          const sc = 0.55 + 0.45 * clamp(prog, 0.1, 1);
          const cos = Math.cos(rot), sin = Math.sin(rot);

          if (bleed > 0) {
            const grad = c.createRadialGradient(x, y, Math.min(rx, ry) * 0.25, x, y, Math.max(rx, ry) * 1.35 * sc);
            grad.addColorStop(0, rgbStr(col, alpha0 * bleed * 0.35));
            grad.addColorStop(1, rgbStr(rimCol, 0));
            c.fillStyle = grad;
            c.beginPath();
            c.ellipse(x, y, rx * 1.35 * sc, ry * 1.35 * sc, rot, 0, TAU);
            c.fill();
          }

          const active = Math.max(1, Math.round(count * clamp(prog, 0.1, 1)));
          for (let i = 0; i < active; i++) {
            const ang = sr() * TAU;
            const dist = Math.sqrt(sr()) * 0.65;
            const lx = Math.cos(ang) * rx * dist * sc;
            const ly = Math.sin(ang) * ry * dist * sc;
            const px = x + lx * cos - ly * sin;
            const py = y + lx * sin + ly * cos;
            const dr = (0.38 + sr() * 0.45);
            const tint = mixRGB(col, rimCol, dist);
            c.fillStyle = rgbStr(tint, (alpha0 / Math.sqrt(count)) * (0.9 + sr() * 0.5));
            c.beginPath();
            c.ellipse(px, py, rx * dr * sc, ry * dr * sc, rot + (sr() - 0.5) * 0.5, 0, TAU);
            c.fill();
          }
          c.restore();
        }, opts.dur || 0.7);
      }

      function inkDot(layer, label, x, y, rx, ry, opts = {}) {
        inkBlob(layer, label, x, y, rx, ry || rx, opts.rot || 0, {
          color: opts.color || '#181512',
          alpha: opts.alpha == null ? 0.9 : opts.alpha,
          count: opts.count || 6,
          bleed: opts.bleed == null ? 0.15 : opts.bleed,
          blend: opts.blend || 'multiply',
          dur: opts.dur || 0.45
        });
      }

      // Traditional vertical calligraphic inscription
      function inscription(layer, label, x, y, chars, opts = {}) {
        const size = opts.size || 24;
        const col = parseColor(opts.color || '#2c241c');
        const stepY = opts.stepY || size * 1.25;
        pushStroke(layer, label, (c, sr, prog) => {
          c.save();
          c.fillStyle = rgbStr(col, (opts.alpha || 0.82) * clamp(prog, 0.2, 1));
          c.font = `600 ${size}px "STKaiti", "Kaiti SC", "KaiTi", serif`;
          c.textAlign = 'center';
          c.textBaseline = 'middle';
          const list = Array.from(chars);
          const count = Math.max(1, Math.ceil(list.length * clamp(prog, 0.1, 1)));
          for (let i = 0; i < count; i++) {
            c.fillText(list[i], x + (sr() - 0.5) * 1.2, y + i * stepY);
          }
          c.restore();
        }, 0.9);
      }

      // Traditional vermilion chop seal
      function seal(layer, label, x, y, text, opts = {}) {
        const size = opts.size || 38;
        const col = parseColor(opts.color || '#9d2d22');
        pushStroke(layer, label, (c, sr, prog) => {
          c.save();
          c.globalAlpha = clamp(prog, 0.2, 1) * 0.92;
          c.fillStyle = rgbStr(col);
          const r = 4;
          c.beginPath();
          c.roundRect(x - size * 0.5, y - size * 0.5, size, size, r);
          c.fill();
          // Subtle aged stone chips along edges
          c.fillStyle = '#f2e9d6';
          for (let i = 0; i < 12; i++) {
            const edge = Math.floor(sr() * 4);
            const along = (sr() - 0.5) * size * 0.85;
            const cx = edge === 0 ? x - size * 0.49 : edge === 1 ? x + size * 0.49 : x + along;
            const cy = edge === 2 ? y - size * 0.49 : edge === 3 ? y + size * 0.49 : y + along;
            c.fillRect(cx - 1.2, cy - 1.2, 2.4, 2.4);
          }
          // Inner characters in off-white
          c.fillStyle = '#f7efe0';
          const chars = Array.from(text || '画印');
          const fSize = chars.length > 2 ? size * 0.34 : size * 0.44;
          c.font = `700 ${fSize}px "STKaiti", "Kaiti SC", serif`;
          c.textAlign = 'center';
          c.textBaseline = 'middle';
          if (chars.length === 2) {
            c.fillText(chars[0], x, y - fSize * 0.44);
            c.fillText(chars[1], x, y + fSize * 0.46);
          } else if (chars.length === 4) {
            c.fillText(chars[0], x + fSize * 0.48, y - fSize * 0.46);
            c.fillText(chars[1], x + fSize * 0.48, y + fSize * 0.46);
            c.fillText(chars[2], x - fSize * 0.48, y - fSize * 0.46);
            c.fillText(chars[3], x - fSize * 0.48, y + fSize * 0.46);
          } else {
            c.fillText(chars.join(''), x, y);
          }
          c.restore();
        }, 0.6);
      }

      // Classical Oil Brush Stroke: multi-layer feathered dab + bristle streaks + temperature shift
      function oilStroke(layer, label, pts, opts = {}) {
        const samples = resampleCurve(catmullRom(pts, opts.samples || 12), opts.step || 6.5);
        const w0 = opts.width || 24;
        const c1 = parseColor(opts.color || [180, 90, 50]);
        const c2 = opts.colorEnd ? parseColor(opts.colorEnd) : c1;
        const alpha0 = opts.alpha == null ? 0.28 : opts.alpha;
        const stretch = opts.stretch == null ? 0.52 : opts.stretch;
        const fade = opts.fade == null ? 0.16 : opts.fade;
        const vary = opts.vary == null ? 5 : opts.vary;
        const temp = opts.temp || 0;
        const bristleProb = opts.bristle == null ? 0.45 : opts.bristle;
        const brCol = opts.bristleColor ? parseColor(opts.bristleColor) : [235, 222, 196];
        const DAB = [[1, 0.58], [1.25, 0.26], [1.52, 0.095]];

        pushStroke(layer, label, (c, sr, prog) => {
          const limit = Math.max(1, Math.floor(samples.length * clamp(prog, 0.05, 1)));
          c.save();
          if (opts.blend) c.globalCompositeOperation = opts.blend;
          for (let i = 0; i < limit; i++) {
            const p = samples[i];
            const u = p.u;
            const edge = Math.min(1, u / fade, (1 - u) / fade);
            const prof = 0.42 + 0.58 * smooth(edge);
            const ang = p.a + (opts.angOff || 0) + (sr() - 0.5) * 0.09;
            const nx = Math.cos(ang + Math.PI / 2);
            const ny = Math.sin(ang + Math.PI / 2);
            const off = (sr() - 0.5) * 2.2;
            const x = p.x + nx * off;
            const y = p.y + ny * off;
            const colBase = mixRGB(c1, c2, u);
            const col = [
              clamp(colBase[0] + (sr() - 0.5) * vary * 2 + temp * (sr() * 1.4 - 0.4), 0, 255),
              clamp(colBase[1] + (sr() - 0.5) * vary * 2 + temp * (sr() * 0.8 - 0.3), 0, 255),
              clamp(colBase[2] + (sr() - 0.5) * vary * 2 - temp * (sr() * 0.9), 0, 255)
            ];
            const r = Math.max(0.8, w0 * 0.5 * prof * (0.88 + sr() * 0.24));
            const a = alpha0 * prof;
            c.fillStyle = rgbStr(col);
            for (let d = 0; d < DAB.length; d++) {
              c.globalAlpha = clamp(a * DAB[d][1], 0, 1);
              c.beginPath();
              c.ellipse(x, y, Math.max(0.4, r * DAB[d][0]), Math.max(0.25, r * DAB[d][0] * stretch), ang, 0, TAU);
              c.fill();
            }
            if (r > 3.5 && sr() < bristleProb) {
              const bo = (sr() - 0.5) * r * 1.3;
              const bc = mixRGB(col, brCol, 0.22);
              c.fillStyle = rgbStr(bc);
              c.globalAlpha = clamp(a * 0.32, 0, 1);
              c.beginPath();
              c.ellipse(x + nx * bo, y + ny * bo, r * 0.46, r * 0.46 * stretch * 0.8, ang, 0, TAU);
              c.fill();
            }
          }
          c.restore();
        }, opts.dur || clamp(samples.length / 26, 0.7, 2.0));
      }

      // Oil soft blocking / glazing patch
      function oilPatch(layer, label, cx, cy, rx, ry, rot = 0, opts = {}) {
        const c1 = parseColor(opts.color || [180, 90, 50]);
        const c2 = opts.colorEdge ? parseColor(opts.colorEdge) : c1;
        const alpha0 = opts.alpha == null ? 0.22 : opts.alpha;
        const count = opts.count || 20;
        const cos = Math.cos(rot), sin = Math.sin(rot);
        pushStroke(layer, label, (c, sr, prog) => {
          c.save();
          if (opts.blend) c.globalCompositeOperation = opts.blend;
          const active = Math.max(1, Math.round(count * clamp(prog, 0.1, 1)));
          for (let i = 0; i < active; i++) {
            const ang = sr() * TAU;
            const dist = Math.sqrt(sr()) * 0.85;
            const lx = Math.cos(ang) * rx * dist;
            const ly = Math.sin(ang) * ry * dist;
            const px = cx + lx * cos - ly * sin;
            const py = cy + lx * sin + ly * cos;
            const r = Math.max(rx, ry) * (0.28 + sr() * 0.38);
            const col = mixRGB(c1, c2, dist);
            const g = c.createRadialGradient(px, py, r * 0.08, px, py, r);
            g.addColorStop(0, rgbStr(col, alpha0));
            g.addColorStop(0.6, rgbStr(col, alpha0 * 0.55));
            g.addColorStop(1, rgbStr(col, 0));
            c.fillStyle = g;
            c.beginPath();
            c.arc(px, py, r, 0, TAU);
            c.fill();
          }
          c.restore();
        }, opts.dur || 1.0);
      }

      function oilHighlight(layer, label, x, y, rx, ry, rot = 0, opts = {}) {
        const col = parseColor(opts.color || [255, 244, 224]);
        pushStroke(layer, label, (c, sr, prog) => {
          c.save();
          const a = (opts.alpha == null ? 0.88 : opts.alpha) * clamp(prog, 0.1, 1);
          const count = opts.count || 6;
          for (let i = 0; i < count; i++) {
            const dx = (sr() - 0.5) * rx * 0.7;
            const dy = (sr() - 0.5) * ry * 0.7;
            const scale = 1 - i * 0.12;
            c.fillStyle = rgbStr(col, (a / count) * 2.2);
            c.beginPath();
            c.ellipse(x + dx, y + dy, Math.max(1, rx * scale), Math.max(0.8, ry * scale), rot + (sr() - 0.5) * 0.25, 0, TAU);
            c.fill();
          }
          c.restore();
        }, opts.dur || 0.6);
      }

      return {
        W, H,
        rand: () => rand(),
        randRange: (a, b) => a + rand() * (b - a),
        pick: (arr) => arr[Math.floor(rand() * arr.length)],
        clamp,
        lerp,
        smooth,
        inkStroke,
        inkWash,
        inkBlob,
        inkDot,
        inscription,
        seal,
        oilStroke,
        oilPatch,
        oilHighlight
      };
    }

    function renderChips() {
      layerChipsEl.innerHTML = '';
      for (const l of layersMeta) {
        const btn = document.createElement('button');
        btn.className = 'layer-chip';
        btn.dataset.layer = String(l.id);
        btn.textContent = l.name;
        btn.addEventListener('click', () => {
          pause();
          seekTo(layerEndIdx[l.id] || 0);
        });
        layerChipsEl.appendChild(btn);
      }
    }

    function updateUI(done = false) {
      const total = strokes.length;
      const shown = clamp(current, 0, total);
      slider.max = String(total);
      slider.value = String(shown);
      strokeStatusEl.textContent = `${shown} / ${total} 笔`;
      const pct = total > 0 ? (shown / total) * 100 : 0;
      pctEl.textContent = `${pct.toFixed(1)}%`;

      if (shown === 0) {
        layerStatusEl.textContent = mode === 'oil' ? '亚麻画布就绪（准备单色起稿）' : '宣纸铺陈就绪（等待落笔）';
      } else if (done || (total > 0 && shown >= total)) {
        layerStatusEl.textContent = `绘制完成 · 共 ${total} 笔`;
      } else {
        const s = strokes[clamp(shown - 1, 0, total - 1)];
        const lm = layersMeta.find(m => m.id === s.layer);
        layerStatusEl.textContent = `${lm ? lm.name : `第${s.layer}步`} ｜ ${s.label}`;
      }

      playPauseBtn.textContent = shown >= total && total > 0 ? '重播' : (isPaused ? '继续' : '暂停');

      const activeLayer = shown >= total && total > 0
        ? (layersMeta.length ? layersMeta[layersMeta.length - 1].id : 1)
        : (shown === 0 ? 1 : strokes[Math.min(shown, total) - 1].layer);

      layerChipsEl.querySelectorAll('.layer-chip').forEach(chip => {
        const l = Number(chip.dataset.layer);
        const end = layerEndIdx[l] || 0;
        const prev = layerEndIdx[l - 1] || 0;
        const isDone = total > 0 && shown >= end && end > prev;
        const isCurrent = !done && shown > 0 && shown < total && l === activeLayer;
        chip.classList.toggle('done', isDone && !isCurrent);
        chip.classList.toggle('current', isCurrent);
      });
    }

    function saveCheckpoint(idx) {
      if (checkpoints.has(idx)) return;
      const c = document.createElement('canvas');
      c.width = W;
      c.height = H;
      c.getContext('2d').drawImage(canvas, 0, 0);
      checkpoints.set(idx, c);
    }

    function seekTo(target) {
      const total = strokes.length;
      const clamped = clamp(Math.round(target), 0, total);
      activeFrac = 0;

      if (clamped >= current && clamped - current <= 20) {
        for (let i = current; i < clamped; i++) {
          strokes[i].draw(ctx, 1);
          if ((i + 1) % CHECKPOINT_INTERVAL === 0) saveCheckpoint(i + 1);
        }
        current = clamped;
      } else {
        let best = 0;
        for (const k of checkpoints.keys()) {
          if (k <= clamped && k > best) best = k;
        }
        ctx.clearRect(0, 0, W, H);
        ctx.drawImage(best === 0 ? backdropCanvas : checkpoints.get(best), 0, 0);
        for (let i = best; i < clamped; i++) {
          strokes[i].draw(ctx, 1);
          if ((i + 1) % CHECKPOINT_INTERVAL === 0) saveCheckpoint(i + 1);
        }
        current = clamped;
      }
      updateUI(current >= total && total > 0);
    }

    function pause() {
      isPaused = true;
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
      updateUI(current >= strokes.length && strokes.length > 0);
    }

    function resume() {
      if (current >= strokes.length) seekTo(0);
      isPaused = false;
      updateUI(false);
      if (rafId === null) rafId = requestAnimationFrame(tick);
    }

    function tick() {
      if (isPaused) {
        rafId = null;
        return;
      }
      const total = strokes.length;
      if (current >= total) {
        rafId = null;
        isPaused = true;
        updateUI(true);
        return;
      }
      const speed = SPEEDS[speedIdx];
      const baseRate = config.baseSpeed || (total > 260 ? 1.55 : 0.48);
      acc += baseRate * speed;

      while (acc >= 1 && current < total) {
        strokes[current].draw(ctx, 1);
        current++;
        if (current % CHECKPOINT_INTERVAL === 0) saveCheckpoint(current);
        acc -= 1;
      }

      if (current >= total) {
        saveCheckpoint(total);
        rafId = null;
        isPaused = true;
        updateUI(true);
        return;
      }
      updateUI(false);
      rafId = requestAnimationFrame(tick);
    }

    function initPainting(resetSeed = false) {
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
      if (resetSeed) seedCounter = (seedCounter + 1) >>> 0;
      rand = mulberry32(seedCounter);
      strokes = [];
      checkpoints.clear();
      current = 0;
      acc = 0;
      isPaused = false;

      backdropCanvas = buildPaperBackdrop(W, H, {
        mode,
        backdropColor: config.backdropColor
      }, rand);

      ctx.clearRect(0, 0, W, H);
      ctx.drawImage(backdropCanvas, 0, 0);

      const api = createAPI();
      config.buildStrokes(api);

      layerEndIdx = {};
      strokes.forEach((s, i) => {
        layerEndIdx[s.layer] = i + 1;
      });
      // Monotonic fill for empty intermediate layers if any
      let running = 0;
      for (const l of layersMeta) {
        if (layerEndIdx[l.id] != null) running = layerEndIdx[l.id];
        else layerEndIdx[l.id] = running;
      }

      renderChips();
      updateUI(false);

      window.__filmTotal = strokes.length;
      window.__filmSeekStroke = (idx, opts = {}) => {
        seekTo(idx);
        if (typeof opts.paused === 'boolean') {
          isPaused = opts.paused;
          updateUI(current >= strokes.length && strokes.length > 0);
        }
      };
      window.__filmSeek = (frac, opts) => window.__filmSeekStroke(frac * strokes.length, opts);
      window.__filmReady = true;

      if (!filmMode) {
        rafId = requestAnimationFrame(tick);
      }
    }

    slider.addEventListener('input', () => {
      pause();
      seekTo(Number(slider.value));
    });

    playPauseBtn.addEventListener('click', () => {
      if (isPaused) resume();
      else pause();
    });

    stepBackBtn.addEventListener('click', () => {
      pause();
      seekTo(current - 1);
    });

    stepForwardBtn.addEventListener('click', () => {
      pause();
      seekTo(current + 1);
    });

    redrawBtn.addEventListener('click', () => {
      initPainting(false);
    });

    speedBtn.addEventListener('click', () => {
      speedIdx = (speedIdx + 1) % SPEEDS.length;
      speedBtn.textContent = `加速 ×${SPEEDS[speedIdx]}`;
      speedBtn.classList.toggle('active', speedIdx > 0);
    });

    saveBtn.addEventListener('click', () => {
      canvas.toBlob(blob => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${config.fileName || config.title || 'painting'}.png`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 1200);
      }, 'image/png');
    });

    window.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        pause();
        seekTo(current - (e.shiftKey ? 10 : 1));
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        pause();
        seekTo(current + (e.shiftKey ? 10 : 1));
      } else if (e.code === 'Space' && document.activeElement?.tagName !== 'BUTTON') {
        e.preventDefault();
        if (isPaused) resume();
        else pause();
      }
    });

    initPainting(false);
    return { seekTo, pause, resume, get total() { return strokes.length; } };
  }

  window.Code2PaintTutorial = { mount };
})();
