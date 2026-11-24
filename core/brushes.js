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
    const s = String(c).trim();
    if (s.startsWith('rgb')) {
      const m = s.match(/[\d.]+/g);
      return m ? [+m[0], +m[1], +m[2]] : [30, 26, 22];
    }
    const h = s.replace('#', '');
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

  function catmullRom(pts, samplesPerSeg = 12, closed = false) {
    if (!pts || pts.length === 0) return [];
    if (pts.length === 1) return [[pts[0][0], pts[0][1]]];
    const p = closed
      ? [pts[pts.length - 1], ...pts, pts[0], pts[1]]
      : [pts[0], ...pts, pts[pts.length - 1]];
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
    if (!closed) out.push(pts[pts.length - 1].slice(0, 2));
    return out;
  }

  function resampleCurve(curve, targetStep = 3.0) {
    if (curve.length < 2) return curve.map(([x, y]) => ({ x, y, a: 0, u: 0, len: 0 }));
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

  // Unified paper / silk / linen / fresco substrates
  function buildBackdrop(w, h, opts, rand) {
    const off = document.createElement('canvas');
    off.width = w;
    off.height = h;
    const g = off.getContext('2d', { alpha: false });
    const mode = opts.mode || 'ink';

    if (mode === 'oil') {
      const base = parseColor(opts.backdropColor || '#1f1611');
      g.fillStyle = rgbStr(base);
      g.fillRect(0, 0, w, h);
      for (let i = 0; i < 40; i++) {
        const cx = rand() * w, cy = rand() * h, r = 120 + rand() * 250;
        const grad = g.createRadialGradient(cx, cy, r * 0.08, cx, cy, r);
        const shift = rand() > 0.5 ? 11 : -9;
        grad.addColorStop(0, rgbStr([base[0] + shift, base[1] + shift * 0.85, base[2] + shift * 0.65], 0.09));
        grad.addColorStop(1, rgbStr(base, 0));
        g.fillStyle = grad;
        g.fillRect(cx - r, cy - r, r * 2, r * 2);
      }
      g.lineWidth = 1;
      for (let y = 0; y < h; y += 5) {
        g.strokeStyle = y % 10 === 0 ? 'rgba(255,235,205,0.032)' : 'rgba(0,0,0,0.048)';
        g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke();
      }
      for (let x = 0; x < w; x += 5) {
        g.strokeStyle = x % 10 === 0 ? 'rgba(255,235,205,0.026)' : 'rgba(0,0,0,0.042)';
        g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke();
      }
    } else if (mode === 'gongbi') {
      // Sized Gongbi Silk / Shuxuan (熟宣仿古绢)
      const base = parseColor(opts.backdropColor || '#ebe0c8');
      g.fillStyle = rgbStr(base);
      g.fillRect(0, 0, w, h);
      for (let i = 0; i < 32; i++) {
        const cx = rand() * w, cy = rand() * h, r = 140 + rand() * 320;
        const grad = g.createRadialGradient(cx, cy, r * 0.1, cx, cy, r);
        const warm = rand() > 0.5 ? -8 : 6;
        grad.addColorStop(0, rgbStr([base[0] + warm, base[1] + warm * 0.9, base[2] + warm * 0.8], 0.10));
        grad.addColorStop(1, rgbStr(base, 0));
        g.fillStyle = grad;
        g.fillRect(cx - r, cy - r, r * 2, r * 2);
      }
      // Fine silk weave cross-grid
      g.lineWidth = 0.6;
      for (let y = 0; y < h; y += 4) {
        g.strokeStyle = y % 8 === 0 ? 'rgba(255,250,238,0.07)' : 'rgba(130,108,78,0.045)';
        g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke();
      }
      for (let x = 0; x < w; x += 4) {
        g.strokeStyle = x % 8 === 0 ? 'rgba(255,250,238,0.06)' : 'rgba(130,108,78,0.04)';
        g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke();
      }
      const vg = g.createRadialGradient(w * 0.5, h * 0.48, Math.min(w, h) * 0.36, w * 0.5, h * 0.5, Math.max(w, h) * 0.74);
      vg.addColorStop(0, 'rgba(0,0,0,0)');
      vg.addColorStop(1, 'rgba(98, 76, 46, 0.10)');
      g.fillStyle = vg;
      g.fillRect(0, 0, w, h);
    } else {
      // Raw Xuan paper (生宣)
      const base = parseColor(opts.backdropColor || '#f2e9d6');
      g.fillStyle = rgbStr(base);
      g.fillRect(0, 0, w, h);
      for (let i = 0; i < 36; i++) {
        const cx = rand() * w, cy = rand() * h, rx = 140 + rand() * 340;
        const grad = g.createRadialGradient(cx, cy, rx * 0.1, cx, cy, rx);
        const warm = rand() > 0.45 ? -9 : 5;
        grad.addColorStop(0, rgbStr([base[0] + warm, base[1] + warm * 0.9, base[2] + warm * 1.1], 0.12));
        grad.addColorStop(1, rgbStr(base, 0));
        g.fillStyle = grad;
        g.fillRect(cx - rx, cy - rx, rx * 2, rx * 2);
      }
      g.lineWidth = 0.7;
      for (let i = 0; i < 2200; i++) {
        const x = rand() * w, y = rand() * h, len = 3 + rand() * 14, ang = rand() * TAU;
        g.strokeStyle = rand() > 0.42
          ? `rgba(255, 251, 240, ${(0.08 + rand() * 0.12).toFixed(3)})`
          : `rgba(138, 118, 88, ${(0.04 + rand() * 0.08).toFixed(3)})`;
        g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(ang) * len, y + Math.sin(ang) * len); g.stroke();
      }
      const vg = g.createRadialGradient(w * 0.5, h * 0.48, Math.min(w, h) * 0.34, w * 0.5, h * 0.5, Math.max(w, h) * 0.74);
      vg.addColorStop(0, 'rgba(0,0,0,0)');
      vg.addColorStop(1, 'rgba(92, 74, 48, 0.09)');
      g.fillStyle = vg;
      g.fillRect(0, 0, w, h);
    }
    return off;
  }

  function createBrushAPI(W, H, baseSeed, apiOpts = {}) {
    let rand = mulberry32(baseSeed);
    let nextStrokeSeed = 101;
    const isOilMode = apiOpts.mode === 'oil';
    const maxOilStrokes = apiOpts.maxOilStrokes || 5000;
    const strokes = [];
    const oilEntries = [];
    let finalizedOil = null;

    function push(layer, label, drawFn) {
      const strokeSeed = (nextStrokeSeed++) * 2654435761 >>> 0;
      const strokeObj = {
        layer,
        label,
        draw: (c) => {
          const sr = mulberry32(strokeSeed);
          drawFn(c, sr);
        }
      };
      if (isOilMode) {
        oilEntries.push({ kind: 'raw', weight: 1, fixed: true, strokeObj });
      } else {
        strokes.push(strokeObj);
      }
    }

    // =========================================================================
    // 1. XIEYI INK BRUSHES
    // =========================================================================
    function inkStroke(layer, label, pts, opts = {}) {
      const curve = resampleCurve(catmullRom(pts, opts.samples || 12, opts.closed), opts.step || 2.8);
      const w0 = opts.width || 10;
      const c1 = parseColor(opts.color || '#1c1916');
      const c2 = opts.colorEnd ? parseColor(opts.colorEnd) : c1;
      const tipCol = opts.tipColor ? parseColor(opts.tipColor) : c1;
      const alpha0 = opts.alpha == null ? 0.85 : opts.alpha;
      const bristles = opts.bristles || Math.max(3, Math.round(w0 * 0.52));
      const dry = opts.dry || 0;
      const bleed = opts.bleed || 0;
      const profile = opts.profile || 'taper';
      const blend = opts.blend || 'multiply';

      push(layer, label, (c, sr) => {
        c.save();
        c.globalCompositeOperation = blend;
        const bData = [];
        for (let b = 0; b < bristles; b++) {
          const frac = bristles === 1 ? 0 : (b / (bristles - 1)) * 2 - 1;
          bData.push({
            frac,
            jitter: (sr() - 0.5) * 0.24,
            dropout: dry * (0.25 + sr() * 0.75),
            inkTone: (frac > 0.35 && opts.tipColor) ? mixRGB(c1, tipCol, 0.8) : mixRGB(c1, tipCol, sr() * 0.25)
          });
        }
        for (let i = 0; i < curve.length; i++) {
          const pt = curve[i], u = pt.u;
          let widthMul = 1, aMul = 1;
          if (profile === 'bambooLeaf') {
            widthMul = u < 0.25 ? smooth(u / 0.25) : Math.pow(clamp((1 - u) / 0.75, 0, 1), 0.78);
            widthMul = Math.max(0.06, widthMul);
            aMul = Math.min(1, u / 0.1) * Math.pow(clamp((1 - u) / 0.16, 0, 1), 0.7);
          } else if (profile === 'nailHead') {
            widthMul = u < 0.12 ? 1.35 - u * 2 : Math.max(0.18, 1.15 - u * 0.95);
            aMul = clamp((1 - u) / 0.12, 0.35, 1);
          } else if (profile === 'taper') {
            const e1 = smooth(u / 0.16), e2 = smooth((1 - u) / 0.18);
            widthMul = 0.24 + 0.76 * Math.min(e1, e2);
            aMul = 0.45 + 0.55 * Math.min(e1, e2);
          } else if (profile === 'flat') {
            widthMul = 0.85 + 0.15 * Math.sin(u * Math.PI);
            aMul = 0.65 + 0.35 * Math.min(smooth(u / 0.15), smooth((1 - u) / 0.15));
          }
          const curW = w0 * widthMul;
          const colBase = mixRGB(c1, c2, u);
          const nx = -Math.sin(pt.a), ny = Math.cos(pt.a);

          if (bleed > 0 && i % 3 === 0) {
            const br = curW * (0.72 + bleed * 0.65);
            c.fillStyle = rgbStr(colBase, alpha0 * aMul * bleed * 0.085);
            c.beginPath(); c.ellipse(pt.x, pt.y, br, br * 0.72, pt.a, 0, TAU); c.fill();
          }

          for (let b = 0; b < bristles; b++) {
            const bd = bData[b];
            if (bd.dropout > 0.05 && sr() < bd.dropout * (0.35 + 0.65 * Math.abs(bd.frac)) * (0.5 + 0.5 * u)) continue;
            const lat = (bd.frac + bd.jitter) * curW * 0.45;
            const bx = pt.x + nx * lat + (sr() - 0.5) * 0.7;
            const by = pt.y + ny * lat + (sr() - 0.5) * 0.7;
            const r = Math.max(0.55, (curW / Math.max(2.2, bristles * 0.68)) * (0.7 + sr() * 0.55));
            const tint = mixRGB(colBase, bd.inkTone, 0.45);
            c.fillStyle = rgbStr(tint, alpha0 * aMul * (0.28 + 0.22 * (1 - Math.abs(bd.frac) * 0.6)));
            c.beginPath(); c.ellipse(bx, by, r * 1.35, r * 0.62, pt.a, 0, TAU); c.fill();
          }
        }
        c.restore();
      });
    }

    function inkWash(layer, label, pts, opts = {}) {
      const col = parseColor(opts.color || '#5e5a54');
      const colEdge = opts.colorEdge ? parseColor(opts.colorEdge) : col;
      const alpha0 = opts.alpha == null ? 0.28 : opts.alpha;
      const blend = opts.blend || 'multiply';
      const passes = opts.passes || 18;
      const curve = catmullRom(pts, 8);
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
      for (const [x, y] of curve) {
        if (x < minX) minX = x; if (y < minY) minY = y;
        if (x > maxX) maxX = x; if (y > maxY) maxY = y;
      }
      const cw = Math.max(10, maxX - minX), ch = Math.max(10, maxY - minY);
      push(layer, label, (c, sr) => {
        c.save();
        c.beginPath();
        curve.forEach(([x, y], idx) => (idx === 0 ? c.moveTo(x, y) : c.lineTo(x, y)));
        c.closePath();
        c.clip();
        c.globalCompositeOperation = blend;
        for (let i = 0; i < passes; i++) {
          const x = minX + sr() * cw, y = minY + sr() * ch;
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
          c.strokeStyle = rgbStr(colEdge, alpha0 * 0.45);
          c.lineWidth = opts.edgeWidth || 2.2;
          c.stroke();
        }
        c.restore();
      });
    }

    function inkBlob(layer, label, x, y, rx, ry, rot = 0, opts = {}) {
      const col = parseColor(opts.color || '#25211c');
      const rimCol = opts.rimColor ? parseColor(opts.rimColor) : col;
      const alpha0 = opts.alpha == null ? 0.76 : opts.alpha;
      const count = opts.count || 14;
      const bleed = opts.bleed == null ? 0.3 : opts.bleed;
      const blend = opts.blend || 'multiply';
      push(layer, label, (c, sr) => {
        c.save();
        c.globalCompositeOperation = blend;
        const cos = Math.cos(rot), sin = Math.sin(rot);
        if (bleed > 0) {
          const grad = c.createRadialGradient(x, y, Math.min(rx, ry) * 0.25, x, y, Math.max(rx, ry) * 1.35);
          grad.addColorStop(0, rgbStr(col, alpha0 * bleed * 0.35));
          grad.addColorStop(1, rgbStr(rimCol, 0));
          c.fillStyle = grad;
          c.beginPath(); c.ellipse(x, y, rx * 1.35, ry * 1.35, rot, 0, TAU); c.fill();
        }
        for (let i = 0; i < count; i++) {
          const ang = sr() * TAU, dist = Math.sqrt(sr()) * 0.65;
          const lx = Math.cos(ang) * rx * dist, ly = Math.sin(ang) * ry * dist;
          const px = x + lx * cos - ly * sin, py = y + lx * sin + ly * cos;
          const dr = 0.38 + sr() * 0.45;
          const tint = mixRGB(col, rimCol, dist);
          c.fillStyle = rgbStr(tint, (alpha0 / Math.sqrt(count)) * (0.9 + sr() * 0.5));
          c.beginPath(); c.ellipse(px, py, rx * dr, ry * dr, rot + (sr() - 0.5) * 0.5, 0, TAU); c.fill();
        }
        c.restore();
      });
    }

    function inkDot(layer, label, x, y, rx, ry, opts = {}) {
      inkBlob(layer, label, x, y, rx, ry || rx, opts.rot || 0, {
        color: opts.color || '#181512',
        alpha: opts.alpha == null ? 0.9 : opts.alpha,
        count: opts.count || 6,
        bleed: opts.bleed == null ? 0.15 : opts.bleed,
        blend: opts.blend || 'multiply'
      });
    }

    // =========================================================================
    // 2. GONGBI (工笔画) FINE-LINE, FENRAN SHADING & SILK-HAIR BRUSHES
    // =========================================================================
    // Crisp continuous iron-wire / gossamer-thread Gongbi contour (双勾白描线)
    function gongbiLine(layer, label, pts, opts = {}) {
      const curve = resampleCurve(catmullRom(pts, opts.samples || 14, opts.closed), 2.0);
      const w0 = opts.width || 2.1;
      const col = parseColor(opts.color || '#2d231b');
      const colEnd = opts.colorEnd ? parseColor(opts.colorEnd) : col;
      const alpha0 = opts.alpha == null ? 0.88 : opts.alpha;
      const style = opts.style || 'tiexian'; // 'tiexian' | 'yousi' | 'lanye'

      push(layer, label, (c, sr) => {
        c.save();
        c.lineCap = 'round';
        c.lineJoin = 'round';
        for (let i = 1; i < curve.length; i++) {
          const p0 = curve[i - 1], p1 = curve[i];
          const u = p1.u;
          let wm = 1.0;
          if (style === 'yousi') {
            wm = 0.72 + 0.28 * Math.sin(u * Math.PI);
          } else if (style === 'lanye') {
            wm = Math.pow(Math.sin(u * Math.PI), 0.55) * 1.25 + 0.15;
          } else {
            // tiexian (铁线描): firm entry & uniform metallic elasticity
            const edge = Math.min(u / 0.06, (1 - u) / 0.06, 1);
            wm = 0.78 + 0.22 * edge;
          }
          const tint = mixRGB(col, colEnd, u);
          c.strokeStyle = rgbStr(tint, alpha0 * (0.85 + (sr() - 0.5) * 0.12));
          c.lineWidth = Math.max(0.6, w0 * wm);
          c.beginPath();
          c.moveTo(p0.x, p0.y);
          c.lineTo(p1.x, p1.y);
          c.stroke();
        }
        c.restore();
      });
    }

    // Two-brush "Fenran" (分染/罩染) smooth gradient fill strictly clipped inside polygon
    function gongbiShade(layer, label, pts, opts = {}) {
      const curve = catmullRom(pts, opts.samples || 10, true);
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
      for (const [x, y] of curve) {
        if (x < minX) minX = x; if (y < minY) minY = y;
        if (x > maxX) maxX = x; if (y > maxY) maxY = y;
      }
      const cx = (minX + maxX) * 0.5, cy = (minY + maxY) * 0.5;
      const cw = Math.max(8, maxX - minX), ch = Math.max(8, maxY - minY);
      const c1 = parseColor(opts.color || '#c44254');
      const c2 = parseColor(opts.colorEnd || opts.color || '#f4d9dc');
      const a1 = opts.alpha == null ? 0.72 : opts.alpha;
      const a2 = opts.alphaEnd == null ? 0.08 : opts.alphaEnd;
      const angle = opts.angle == null ? Math.PI * 0.5 : opts.angle;
      const blend = opts.blend || 'multiply';

      push(layer, label, (c, sr) => {
        c.save();
        c.beginPath();
        curve.forEach(([x, y], i) => (i === 0 ? c.moveTo(x, y) : c.lineTo(x, y)));
        c.closePath();
        c.clip();
        c.globalCompositeOperation = blend;

        if (opts.radial) {
          const rad = Math.max(cw, ch) * 0.65;
          const rx = opts.focus ? opts.focus[0] : cx;
          const ry = opts.focus ? opts.focus[1] : cy;
          const g = c.createRadialGradient(rx, ry, rad * 0.04, rx, ry, rad);
          g.addColorStop(0, rgbStr(c1, a1));
          g.addColorStop(0.65, rgbStr(mixRGB(c1, c2, 0.5), lerp(a1, a2, 0.55)));
          g.addColorStop(1, rgbStr(c2, a2));
          c.fillStyle = g;
        } else {
          const dx = Math.cos(angle) * cw * 0.55;
          const dy = Math.sin(angle) * ch * 0.55;
          const g = c.createLinearGradient(cx - dx, cy - dy, cx + dx, cy + dy);
          g.addColorStop(0, rgbStr(c1, a1));
          g.addColorStop(1, rgbStr(c2, a2));
          c.fillStyle = g;
        }
        c.fillRect(minX - 4, minY - 4, cw + 8, ch + 8);

        // Delicate natural paper-absorption dabs inside wash
        for (let i = 0; i < 6; i++) {
          const px = minX + sr() * cw, py = minY + sr() * ch;
          c.fillStyle = rgbStr(c1, a1 * 0.05);
          c.beginPath(); c.arc(px, py, Math.max(cw, ch) * 0.18, 0, TAU); c.fill();
        }
        c.restore();
      });
    }

    // Fine feather / fur / hair silk filaments ("丝毛法")
    function gongbiSilkHair(layer, label, cx, cy, baseAng, opts = {}) {
      const count = opts.count || 18;
      const len = opts.len || 36;
      const spread = opts.spread == null ? 0.5 : opts.spread;
      const width = opts.width || 1.25;
      const col = parseColor(opts.color || '#221b15');
      const alpha0 = opts.alpha == null ? 0.72 : opts.alpha;
      const fanWidth = opts.fanWidth || 12;

      push(layer, label, (c, sr) => {
        c.save();
        c.lineCap = 'round';
        for (let i = 0; i < count; i++) {
          const f = count === 1 ? 0 : (i / (count - 1)) - 0.5;
          const ang = baseAng + f * spread + (sr() - 0.5) * 0.06;
          const sx = cx + Math.cos(baseAng + Math.PI * 0.5) * f * fanWidth + (sr() - 0.5) * 2;
          const sy = cy + Math.sin(baseAng + Math.PI * 0.5) * f * fanWidth + (sr() - 0.5) * 2;
          const l = len * (0.76 + sr() * 0.42);
          const ex = sx + Math.cos(ang) * l, ey = sy + Math.sin(ang) * l;
          const mx = (sx + ex) * 0.5 + (sr() - 0.5) * 4, my = (sy + ey) * 0.5 + (sr() - 0.5) * 4;
          c.strokeStyle = rgbStr(col, alpha0 * (0.65 + sr() * 0.35));
          c.lineWidth = width * (0.8 + sr() * 0.35);
          c.beginPath(); c.moveTo(sx, sy); c.quadraticCurveTo(mx, my, ex, ey); c.stroke();
        }
        c.restore();
      });
    }

    // Gold paste (沥粉泥金) & mineral white lead (蛤粉提白)
    function gongbiGold(layer, label, ptsOrX, yOrOpts, maybeOpts) {
      if (Array.isArray(ptsOrX)) {
        const opts = yOrOpts || {};
        gongbiLine(layer, label, ptsOrX, {
          width: opts.width || 2.0,
          color: opts.color || '#d8af4a',
          colorEnd: opts.colorEnd || '#f0cf72',
          alpha: opts.alpha == null ? 0.92 : opts.alpha,
          style: 'tiexian'
        });
      } else {
        const x = ptsOrX, y = yOrOpts, opts = maybeOpts || {};
        const col = parseColor(opts.color || '#e2bc54');
        const r = opts.r || 2.8;
        push(layer, label, (c) => {
          c.save();
          c.fillStyle = rgbStr(col, opts.alpha == null ? 0.94 : opts.alpha);
          c.beginPath(); c.ellipse(x, y, r, opts.ry || r, opts.rot || 0, 0, TAU); c.fill();
          c.restore();
        });
      }
    }

    // =========================================================================
    // 3. OIL & PORTRAIT BRUSHES (Scalable painterly mode up to 5,000 strokes)
    // =========================================================================
    const OIL_DAB = [[1, 0.58], [1.25, 0.26], [1.52, 0.095]];

    function drawOilSampleRange(c, sr, samples, startIdx, endIdx, opts, c1, c2, brCol, alpha0) {
      const w0 = opts.width || 24;
      const stretch = opts.stretch == null ? 0.52 : opts.stretch;
      const fade = opts.fade == null ? 0.16 : opts.fade;
      const vary = opts.vary == null ? 5 : opts.vary;
      const temp = opts.temp || 0;
      const bristleProb = opts.bristle == null ? 0.45 : opts.bristle;
      c.save();
      if (opts.blend) c.globalCompositeOperation = opts.blend;
      for (let i = startIdx; i < endIdx; i++) {
        const p = samples[i], u = p.u;
        const edge = Math.min(1, u / fade, (1 - u) / fade);
        const prof = 0.42 + 0.58 * smooth(edge);
        const ang = p.a + (opts.angOff || 0) + (sr() - 0.5) * 0.09;
        const nx = Math.cos(ang + Math.PI / 2), ny = Math.sin(ang + Math.PI / 2);
        const off = (sr() - 0.5) * 2.2;
        const x = p.x + nx * off, y = p.y + ny * off;
        const colBase = mixRGB(c1, c2, u);
        const col = [
          clamp(colBase[0] + (sr() - 0.5) * vary * 2 + temp * (sr() * 1.4 - 0.4), 0, 255),
          clamp(colBase[1] + (sr() - 0.5) * vary * 2 + temp * (sr() * 0.8 - 0.3), 0, 255),
          clamp(colBase[2] + (sr() - 0.5) * vary * 2 - temp * (sr() * 0.9), 0, 255)
        ];
        const r = Math.max(0.8, w0 * 0.5 * prof * (0.88 + sr() * 0.24));
        const a = alpha0 * prof;
        c.fillStyle = rgbStr(col);
        for (let d = 0; d < OIL_DAB.length; d++) {
          c.globalAlpha = clamp(a * OIL_DAB[d][1], 0, 1);
          c.beginPath();
          c.ellipse(x, y, Math.max(0.4, r * OIL_DAB[d][0]), Math.max(0.25, r * OIL_DAB[d][0] * stretch), ang, 0, TAU);
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
    }

    function oilStroke(layer, label, pts, opts = {}) {
      const c1 = parseColor(opts.color || [180, 90, 50]);
      const c2 = opts.colorEnd ? parseColor(opts.colorEnd) : c1;
      const alpha0 = opts.alpha == null ? 0.30 : opts.alpha;
      const brCol = opts.bristleColor ? parseColor(opts.bristleColor) : [235, 222, 196];
      const baseCurve = catmullRom(pts, opts.samples || 12, opts.closed);
      if (!isOilMode) {
        const samples = resampleCurve(baseCurve, opts.step || 6.0);
        push(layer, label, (c, sr) => drawOilSampleRange(c, sr, samples, 0, samples.length, opts, c1, c2, brCol, alpha0));
        return;
      }
      let curveLen = 0;
      for (let i = 1; i < baseCurve.length; i++) {
        curveLen += Math.hypot(baseCurve[i][0] - baseCurve[i - 1][0], baseCurve[i][1] - baseCurve[i - 1][1]);
      }
      const w0 = opts.width || 24;
      const isBackdrop = (opts.fade != null && opts.fade <= 0.05 && w0 >= 75);
      const weight = isBackdrop ? clamp(curveLen / 34, 12, 42) : clamp(curveLen / 7.5, 10, 120);
      oilEntries.push({
        kind: 'oilStroke', layer, label, weight, fixed: false,
        baseCurve, curveLen, opts, c1, c2, brCol, alpha0, seed: (nextStrokeSeed++) * 2654435761 >>> 0
      });
    }

    function oilPatch(layer, label, cx, cy, rx, ry, rot = 0, opts = {}) {
      const c1 = parseColor(opts.color || [180, 90, 50]);
      const c2 = opts.colorEdge ? parseColor(opts.colorEdge) : c1;
      const alpha0 = opts.alpha == null ? 0.24 : opts.alpha;
      const count = opts.count || 20;
      const maxR = Math.max(rx, ry);
      if (!isOilMode) {
        const cos = Math.cos(rot), sin = Math.sin(rot);
        push(layer, label, (c, sr) => {
          c.save();
          if (opts.blend) c.globalCompositeOperation = opts.blend;
          for (let i = 0; i < count; i++) {
            const ang = sr() * TAU, dist = Math.sqrt(sr()) * 0.85;
            const lx = Math.cos(ang) * rx * dist, ly = Math.sin(ang) * ry * dist;
            const px = cx + lx * cos - ly * sin, py = cy + lx * sin + ly * cos;
            const r = maxR * (0.28 + sr() * 0.38);
            const col = mixRGB(c1, c2, dist);
            const g = c.createRadialGradient(px, py, r * 0.08, px, py, r);
            g.addColorStop(0, rgbStr(col, alpha0));
            g.addColorStop(0.6, rgbStr(col, alpha0 * 0.55));
            g.addColorStop(1, rgbStr(col, 0));
            c.fillStyle = g;
            c.beginPath(); c.arc(px, py, r, 0, TAU); c.fill();
          }
          c.restore();
        });
        return;
      }
      const isTiny = maxR < 18 || count <= 6;
      const weight = isTiny ? clamp(count, 1, 6) : clamp(Math.sqrt(Math.max(1, rx * ry)) * 0.85, 18, 180);
      oilEntries.push({
        kind: 'oilPatch', layer, label, weight, fixed: isTiny, isTiny,
        cx, cy, rx, ry, rot, opts, c1, c2, alpha0, count, seed: (nextStrokeSeed++) * 2654435761 >>> 0
      });
    }

    function oilHighlight(layer, label, x, y, rx, ry, rot = 0, opts = {}) {
      const col = parseColor(opts.color || [255, 244, 224]);
      const a = opts.alpha == null ? 0.88 : opts.alpha;
      const count = opts.count || 6;
      if (!isOilMode) {
        push(layer, label, (c, sr) => {
          c.save();
          for (let i = 0; i < count; i++) {
            const dx = (sr() - 0.5) * rx * 0.7, dy = (sr() - 0.5) * ry * 0.7;
            const scale = 1 - i * 0.12;
            c.fillStyle = rgbStr(col, (a / count) * 2.2);
            c.beginPath();
            c.ellipse(x + dx, y + dy, Math.max(1, rx * scale), Math.max(0.8, ry * scale), rot + (sr() - 0.5) * 0.25, 0, TAU);
            c.fill();
          }
          c.restore();
        });
        return;
      }
      const isTiny = Math.max(rx, ry) < 8;
      const weight = isTiny ? clamp(count, 1, 4) : clamp(count * 2.5, 6, 48);
      oilEntries.push({
        kind: 'oilHighlight', layer, label, weight, fixed: isTiny, isTiny,
        x, y, rx, ry, rot, opts, col, a, count, seed: (nextStrokeSeed++) * 2654435761 >>> 0
      });
    }

    function finalizeOilStrokes() {
      if (finalizedOil) return finalizedOil;
      const out = [];
      let fixedTotal = 0;
      let flexTotal = 0;
      for (let i = 0; i < oilEntries.length; i++) {
        const e = oilEntries[i];
        if (e.fixed) fixedTotal += Math.max(1, Math.round(e.weight));
        else flexTotal += e.weight;
      }
      const availMax = Math.max(0, maxOilStrokes - fixedTotal);
      const desiredFlex = flexTotal > 0
        ? Math.min(availMax, Math.max(Math.min(availMax, 4200), Math.round(flexTotal)))
        : 0;
      const scale = flexTotal > 0 ? Math.min(28, desiredFlex / flexTotal) : 1;

      const allocs = new Array(oilEntries.length);
      const rems = [];
      let flexUsed = 0;
      for (let i = 0; i < oilEntries.length; i++) {
        const e = oilEntries[i];
        if (e.fixed) {
          allocs[i] = Math.max(1, Math.round(e.weight));
        } else {
          const exact = Math.max(1, e.weight * scale);
          const fl = Math.floor(exact);
          allocs[i] = fl;
          flexUsed += fl;
          rems.push({ i, rem: exact - fl });
        }
      }
      const flexCap = Math.min(availMax, Math.round(flexTotal * scale));
      if (flexUsed < flexCap && rems.length) {
        rems.sort((a, b) => b.rem - a.rem);
        for (let r = 0; r < rems.length && flexUsed < flexCap; r++) {
          allocs[rems[r].i]++;
          flexUsed++;
        }
      }
      while (flexUsed > availMax) {
        let bestIdx = -1, bestVal = 1;
        for (let i = 0; i < oilEntries.length; i++) {
          if (!oilEntries[i].fixed && allocs[i] > bestVal) {
            bestVal = allocs[i];
            bestIdx = i;
          }
        }
        if (bestIdx < 0) break;
        allocs[bestIdx]--;
        flexUsed--;
      }

      for (let idx = 0; idx < oilEntries.length; idx++) {
        const e = oilEntries[idx];
        const kWanted = Math.max(1, allocs[idx]);
        if (e.kind === 'raw') {
          out.push(e.strokeObj);
          continue;
        }
        if (e.kind === 'oilStroke') {
          const baseStep = e.opts.step || 6.0;
          const targetStep = clamp(Math.min(baseStep, e.curveLen / Math.max(1, kWanted * 2)), 2.2, baseStep);
          const samples = resampleCurve(e.baseCurve, targetStep);
          const kEff = Math.min(kWanted, samples.length);
          const actualStep = e.curveLen / Math.max(1, samples.length - 1);
          const stepMul = targetStep < baseStep ? clamp(actualStep / baseStep, 0.36, 1.0) : 1.0;
          const alphaAdj = e.alpha0 * stepMul;
          for (let s = 0; s < kEff; s++) {
            const st = Math.floor((s * samples.length) / kEff);
            const en = Math.floor(((s + 1) * samples.length) / kEff);
            if (en <= st) continue;
            const cSeed = (e.seed + (s + 1) * 2654435761) >>> 0;
            out.push({
              layer: e.layer,
              label: e.label,
              draw: (c) => {
                const sr = mulberry32(cSeed);
                drawOilSampleRange(c, sr, samples, st, en, e.opts, e.c1, e.c2, e.brCol, alphaAdj);
              }
            });
          }
          continue;
        }
        if (e.kind === 'oilPatch') {
          const { cx, cy, rx, ry, rot, opts, c1, c2, alpha0, count, isTiny } = e;
          const cos = Math.cos(rot), sin = Math.sin(rot);
          const maxR = Math.max(rx, ry);
          if (isTiny || kWanted <= 3) {
            const kEff = Math.min(kWanted, count);
            for (let s = 0; s < kEff; s++) {
              const st = Math.floor((s * count) / kEff);
              const en = Math.floor(((s + 1) * count) / kEff);
              const cSeed = (e.seed + (s + 1) * 2654435761) >>> 0;
              out.push({
                layer: e.layer,
                label: e.label,
                draw: (c) => {
                  const sr = mulberry32(cSeed);
                  c.save();
                  if (opts.blend) c.globalCompositeOperation = opts.blend;
                  for (let i = st; i < en; i++) {
                    const ang = sr() * TAU, dist = Math.sqrt(sr()) * 0.85;
                    const lx = Math.cos(ang) * rx * dist, ly = Math.sin(ang) * ry * dist;
                    const px = cx + lx * cos - ly * sin, py = cy + lx * sin + ly * cos;
                    const r = maxR * (0.28 + sr() * 0.38);
                    const col = mixRGB(c1, c2, dist);
                    const g = c.createRadialGradient(px, py, r * 0.08, px, py, r);
                    g.addColorStop(0, rgbStr(col, alpha0));
                    g.addColorStop(0.6, rgbStr(col, alpha0 * 0.55));
                    g.addColorStop(1, rgbStr(col, 0));
                    c.fillStyle = g;
                    c.beginPath(); c.arc(px, py, r, 0, TAU); c.fill();
                  }
                  c.restore();
                }
              });
            }
          } else {
            // Painterly directional elliptical radial-gradient strokes (velvety solid volume + crisp brush cadence)
            const rMajor = clamp(maxR * (0.33 + 0.16 * Math.exp(-kWanted / 90)), 14, maxR * 0.56);
            const dabAlpha = clamp((alpha0 * 1.15) / Math.sqrt(Math.max(1, kWanted / Math.max(8, count))), 0.10, 0.78);
            for (let s = 0; s < kWanted; s++) {
              const cSeed = (e.seed + (s + 1) * 2654435761) >>> 0;
              const spiralFrac = (s + 0.5) / kWanted;
              out.push({
                layer: e.layer,
                label: e.label,
                draw: (c) => {
                  const sr = mulberry32(cSeed);
                  c.save();
                  if (opts.blend) c.globalCompositeOperation = opts.blend;
                  const ang = s * 2.3999632 + (sr() - 0.5) * 0.42;
                  const dist = Math.sqrt(spiralFrac) * 0.86;
                  const lx = Math.cos(ang) * rx * dist, ly = Math.sin(ang) * ry * dist;
                  const px = cx + lx * cos - ly * sin, py = cy + lx * sin + ly * cos;
                  const brushAng = rot + (sr() - 0.5) * 0.48 + Math.atan2(ly / Math.max(1, ry), lx / Math.max(1, rx)) * 0.18;
                  const colBase = mixRGB(c1, c2, clamp(dist * 1.05, 0, 1));
                  const col = [
                    clamp(colBase[0] + (sr() - 0.5) * 10, 0, 255),
                    clamp(colBase[1] + (sr() - 0.5) * 9, 0, 255),
                    clamp(colBase[2] + (sr() - 0.5) * 9, 0, 255)
                  ];
                  const rad = rMajor * (0.84 + sr() * 0.34);
                  c.translate(px, py);
                  c.rotate(brushAng);
                  c.scale(1.28, 0.74);
                  const g = c.createRadialGradient(0, 0, rad * 0.10, 0, 0, rad);
                  g.addColorStop(0, rgbStr(col, dabAlpha));
                  g.addColorStop(0.58, rgbStr(col, dabAlpha * 0.56));
                  g.addColorStop(1, rgbStr(col, 0));
                  c.fillStyle = g;
                  c.beginPath();
                  c.arc(0, 0, rad, 0, TAU);
                  c.fill();
                  c.restore();
                }
              });
            }
          }
          continue;
        }
        if (e.kind === 'oilHighlight') {
          const { x, y, rx, ry, rot, col, a, count, isTiny } = e;
          const kEff = isTiny ? Math.min(kWanted, count) : kWanted;
          const fleckAlpha = isTiny
            ? clamp((a / Math.max(1, kEff)) * 2.2, 0.24, 0.96)
            : clamp((a / Math.max(1, kEff)) * 2.4, 0.05, 0.88);
          for (let s = 0; s < kEff; s++) {
            const cSeed = (e.seed + (s + 1) * 2654435761) >>> 0;
            const frac = (s + 0.5) / kEff;
            out.push({
              layer: e.layer,
              label: e.label,
              draw: (c) => {
                const sr = mulberry32(cSeed);
                c.save();
                const ang = s * 2.3999632 + (sr() - 0.5) * 0.48;
                const d = isTiny ? sr() * 0.45 : Math.sqrt(frac) * 0.72;
                const dx = Math.cos(ang) * rx * d, dy = Math.sin(ang) * ry * d;
                const scale = isTiny ? (1 - (s / kEff) * 0.16) : (0.38 + 0.42 * (1 - d));
                c.fillStyle = rgbStr(col, fleckAlpha);
                c.beginPath();
                c.ellipse(x + dx, y + dy, Math.max(1, rx * scale), Math.max(0.8, ry * scale), rot + (sr() - 0.5) * 0.3, 0, TAU);
                c.fill();
                c.restore();
              }
            });
          }
        }
      }
      finalizedOil = out.slice(0, maxOilStrokes);
      return finalizedOil;
    }

    // Calligraphic inscription & red seal
    function inscription(layer, label, x, y, chars, opts = {}) {
      const size = opts.size || 24;
      const col = parseColor(opts.color || '#2c241c');
      const stepY = opts.stepY || size * 1.25;
      push(layer, label, (c, sr) => {
        c.save();
        c.fillStyle = rgbStr(col, opts.alpha || 0.84);
        c.font = `600 ${size}px "STKaiti", "Kaiti SC", "KaiTi", serif`;
        c.textAlign = 'center';
        c.textBaseline = 'middle';
        Array.from(chars).forEach((ch, i) => {
          c.fillText(ch, x + (sr() - 0.5) * 1.1, y + i * stepY);
        });
        c.restore();
      });
    }

    function seal(layer, label, x, y, text, opts = {}) {
      const size = opts.size || 38;
      const col = parseColor(opts.color || '#9d2d22');
      push(layer, label, (c, sr) => {
        c.save();
        c.globalAlpha = 0.92;
        c.fillStyle = rgbStr(col);
        c.beginPath(); c.roundRect(x - size * 0.5, y - size * 0.5, size, size, 4); c.fill();
        c.fillStyle = '#f2e9d6';
        for (let i = 0; i < 12; i++) {
          const edge = Math.floor(sr() * 4), along = (sr() - 0.5) * size * 0.85;
          const cx = edge === 0 ? x - size * 0.49 : edge === 1 ? x + size * 0.49 : x + along;
          const cy = edge === 2 ? y - size * 0.49 : edge === 3 ? y + size * 0.49 : y + along;
          c.fillRect(cx - 1.2, cy - 1.2, 2.4, 2.4);
        }
        c.fillStyle = '#f7efe0';
        const chars = Array.from(text || '画印');
        const fSize = chars.length > 2 ? size * 0.34 : size * 0.44;
        c.font = `700 ${fSize}px "STKaiti", "Kaiti SC", serif`;
        c.textAlign = 'center'; c.textBaseline = 'middle';
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
      });
    }

    return {
      W, H,
      rand: () => rand(),
      randRange: (a, b) => a + rand() * (b - a),
      pick: (arr) => arr[Math.floor(rand() * arr.length)],
      clamp, lerp, smooth,
      inkStroke, inkWash, inkBlob, inkDot,
      gongbiLine, gongbiShade, gongbiSilkHair, gongbiGold,
      oilStroke, oilPatch, oilHighlight,
      inscription, seal,
      push,
      get strokes() { return isOilMode ? finalizeOilStrokes() : strokes; }
    };
  }

  window.Code2PaintBrushes = {
    TAU,
    mulberry32,
    clamp,
    lerp,
    smooth,
    parseColor,
    mixRGB,
    rgbStr,
    catmullRom,
    resampleCurve,
    buildBackdrop,
    createBrushAPI
  };
})();
