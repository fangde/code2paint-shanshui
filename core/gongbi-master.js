/**
 * Code2Paint Gongbi Master Engine (工笔重彩大师引擎)
 *
 * Implements authentic Song Imperial Court (宋院体工笔重彩) and Dunhuang mineral-pigment
 * painting stages across 5 ordered replay layers:
 *   Layer 1: 双勾白描起稿 (Baimiao contours — 游丝描 / 铁线描 / 钉头鼠尾描)
 *   Layer 2: 统染底色与古绢烘染 (Alum-silk halo ground, flat base glaze & broad Tongran)
 *   Layer 3: 多次分染、水线与矿彩罩染 (Multi-pass Fenran micro-washes with Suixian vein gaps & Zhaoran)
 *   Layer 4: 丝毛羽纹、网鳞水纹与复勒 (Directional Simao plumage/hair, imbricated scales, water lines & Fule)
 *   Layer 5: 立粉点蕊、泥金勾勒与题款钤印 (Lifen stamens, Sanbai highlights, Nijin gold & seals)
 */
(function () {
  'use strict';

  const TAU = Math.PI * 2;

  const PIGMENTS = {
    // Aged silk & tea ground
    silkLight: '#f6efdd',
    silkCream: '#ebe0c8',
    silkTea: '#c4a980',
    silkAmber: '#ad8e62',
    silkUmber: '#8b6d47',
    // Pinesoot & mineral inks
    inkPale: '#6e5e4f',
    inkMid: '#41352c',
    inkDeep: '#221b17',
    inkIndigo: '#263440',
    inkWarm: '#5e3d32',
    // Crimson / cinnabar / carmine / pink
    vermilion: '#d65d3a',
    cinnabar: '#b83c2b',
    rouge: '#b53a4e',
    carmine: '#751f34',
    deepCarmine: '#4e1222',
    roseWash: '#df8c96',
    blushPink: '#eccac9',
    // Yellows & ochres
    gamboge: '#dfa534',
    gooseYellow: '#eed37d',
    ochre: '#9e6238',
    burntOchre: '#6e3d23',
    sienna: '#b57448',
    // Mineral & botanical greens
    malachiteDeep: '#2d6349',
    malachiteMid: '#4c8e66',
    malachitePale: '#7cb58e',
    sapGreen: '#59773b',
    oliveDark: '#364d2b',
    sproutGreen: '#99ae58',
    teaGreen: '#82956d',
    // Azurite / indigo / celadon
    azuriteDeep: '#1f446e',
    azuriteMid: '#376496',
    azuritePale: '#6a97bd',
    indigo: '#243c54',
    celadonMist: '#6e9592',
    // Clam white & mineral gold
    clamWhite: '#f9f5eb',
    ivoryWhite: '#efe6d0',
    goldBright: '#dfb452',
    goldWarm: '#c49032',
    goldPale: '#edd17f'
  };

  function clamp(v, a, b) {
    return v < a ? a : (v > b ? b : v);
  }

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  function smoothstep(a, b, x) {
    const t = clamp((x - a) / (b - a || 1), 0, 1);
    return t * t * (3 - 2 * t);
  }

  function makeRng(seed) {
    let s = (seed >>> 0) || 1;
    return function () {
      s = (s + 0x6d2b79f5) >>> 0;
      let t = Math.imul(s ^ (s >>> 15), 1 | s);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function hash2(ix, iy, seed) {
    let n = Math.imul(ix, 374761393) + Math.imul(iy, 668265263) + Math.imul(seed | 0, 1442695041);
    n = (n ^ (n >>> 13)) >>> 0;
    n = Math.imul(n, 1274126177) >>> 0;
    return ((n ^ (n >>> 16)) >>> 0) / 4294967296;
  }

  function valueNoise2D(x, y, seed) {
    const ix = Math.floor(x);
    const iy = Math.floor(y);
    const fx = x - ix;
    const fy = y - iy;
    const ux = fx * fx * (3 - 2 * fx);
    const uy = fy * fy * (3 - 2 * fy);
    const a = hash2(ix, iy, seed);
    const b = hash2(ix + 1, iy, seed);
    const c = hash2(ix, iy + 1, seed);
    const d = hash2(ix + 1, iy + 1, seed);
    return lerp(lerp(a, b, ux), lerp(c, d, ux), uy);
  }

  function fbm2(x, y, seed, octaves = 3) {
    let sum = 0, amp = 0.5, freq = 1, norm = 0;
    for (let i = 0; i < octaves; i++) {
      sum += valueNoise2D(x * freq, y * freq, seed + i * 97) * amp;
      norm += amp;
      amp *= 0.5;
      freq *= 2.02;
    }
    return sum / (norm || 1);
  }

  function hexToRgb(hex) {
    const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(String(hex || '#342b24').trim());
    if (!m) return [52, 43, 36];
    return [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)];
  }

  function mixRgb(c1, c2, t) {
    const u = clamp(t, 0, 1);
    return [
      Math.round(c1[0] + (c2[0] - c1[0]) * u),
      Math.round(c1[1] + (c2[1] - c1[1]) * u),
      Math.round(c1[2] + (c2[2] - c1[2]) * u)
    ];
  }

  function mixHex(h1, h2, t) {
    const rgb = mixRgb(hexToRgb(h1), hexToRgb(h2), t);
    return `#${rgb.map(v => v.toString(16).padStart(2, '0')).join('')}`;
  }

  function rgbaStr(hexOrRgb, alpha) {
    const c = Array.isArray(hexOrRgb) ? hexOrRgb : hexToRgb(hexOrRgb);
    const r = clamp(Math.round(c[0]), 0, 255);
    const g = clamp(Math.round(c[1]), 0, 255);
    const b = clamp(Math.round(c[2]), 0, 255);
    const a = clamp(alpha == null ? 1 : alpha, 0, 1);
    return `rgba(${r},${g},${b},${a.toFixed(3)})`;
  }

  // Smooth Catmull-Rom interpolation
  function catmullRom(pts, samplesPerSeg = 10, closed = false) {
    const n = pts.length;
    if (n < 2) return pts.slice();
    const out = [];
    const get = (i) => closed ? pts[((i % n) + n) % n] : pts[clamp(i, 0, n - 1)];
    const segs = closed ? n : n - 1;
    for (let i = 0; i < segs; i++) {
      const p0 = get(i - 1);
      const p1 = get(i);
      const p2 = get(i + 1);
      const p3 = get(i + 2);
      const steps = samplesPerSeg;
      for (let s = 0; s < steps; s++) {
        const t = s / steps;
        const t2 = t * t;
        const t3 = t2 * t;
        const x = 0.5 * ((2 * p1[0]) + (-p0[0] + p2[0]) * t + (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * t2 + (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * t3);
        const y = 0.5 * ((2 * p1[1]) + (-p0[1] + p2[1]) * t + (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * t2 + (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * t3);
        out.push([x, y]);
      }
    }
    if (!closed) out.push([pts[n - 1][0], pts[n - 1][1]]);
    return out;
  }

  function quadPoint(p0, p1, p2, t) {
    const u = 1 - t;
    return [
      u * u * p0[0] + 2 * u * t * p1[0] + t * t * p2[0],
      u * u * p0[1] + 2 * u * t * p1[1] + t * t * p2[1]
    ];
  }

  function cubicPoint(p0, p1, p2, p3, t) {
    const u = 1 - t;
    const u2 = u * u, t2 = t * t;
    return [
      u2 * u * p0[0] + 3 * u2 * t * p1[0] + 3 * u * t2 * p2[0] + t2 * t * p3[0],
      u2 * u * p0[1] + 3 * u2 * t * p1[1] + 3 * u * t2 * p2[1] + t2 * t * p3[1]
    ];
  }

  function polyBounds(poly) {
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (let i = 0; i < poly.length; i++) {
      const p = poly[i];
      if (p[0] < minX) minX = p[0];
      if (p[0] > maxX) maxX = p[0];
      if (p[1] < minY) minY = p[1];
      if (p[1] > maxY) maxY = p[1];
    }
    return { minX, minY, maxX, maxY, cx: (minX + maxX) * 0.5, cy: (minY + maxY) * 0.5, w: maxX - minX, h: maxY - minY };
  }

  function pointInPoly(x, y, poly) {
    let inside = false;
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      const xi = poly[i][0], yi = poly[i][1];
      const xj = poly[j][0], yj = poly[j][1];
      const intersect = ((yi > y) !== (yj > y)) && (x < ((xj - xi) * (y - yi)) / (yj - yi + 1e-9) + xi);
      if (intersect) inside = !inside;
    }
    return inside;
  }

  function distSqToSeg(px, py, ax, ay, bx, by) {
    const vx = bx - ax, vy = by - ay;
    const wx = px - ax, wy = py - ay;
    const len2 = vx * vx + vy * vy;
    const t = len2 > 1e-6 ? clamp((wx * vx + wy * vy) / len2, 0, 1) : 0;
    const dx = px - (ax + vx * t), dy = py - (ay + vy * t);
    return dx * dx + dy * dy;
  }

  function minDistToPolyEdge(px, py, poly) {
    let best = Infinity;
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      const d2 = distSqToSeg(px, py, poly[j][0], poly[j][1], poly[i][0], poly[i][1]);
      if (d2 < best) best = d2;
    }
    return Math.sqrt(best);
  }

  function minDistToCurve(px, py, curvePts) {
    let best = Infinity;
    for (let i = 0; i < curvePts.length - 1; i++) {
      const d2 = distSqToSeg(px, py, curvePts[i][0], curvePts[i][1], curvePts[i + 1][0], curvePts[i + 1][1]);
      if (d2 < best) best = d2;
    }
    return Math.sqrt(best);
  }

  function tracePolyPath(c, poly, closed = true) {
    if (!poly || poly.length < 2) return;
    c.moveTo(poly[0][0], poly[0][1]);
    for (let i = 1; i < poly.length; i++) {
      c.lineTo(poly[i][0], poly[i][1]);
    }
    if (closed) c.closePath();
  }

  let _activeOccluders = [];

  function setOccluders(list) {
    _activeOccluders = Array.isArray(list) ? list : [];
  }

  function isPointOccluded(x, y, customList) {
    const list = customList || _activeOccluders;
    if (!list || !list.length) return false;
    for (let i = 0; i < list.length; i++) {
      const o = list[i];
      if (!o) continue;
      if (o.poly) {
        if (pointInPoly(x, y, o.poly)) return true;
      } else {
        const dx = x - o.x, dy = y - o.y;
        if (dx * dx + dy * dy <= o.r * o.r) return true;
      }
    }
    return false;
  }

  function pushRaw(api, layer, label, fn, tag, depth = 0) {
    fn._gbTag = tag || 'detail';
    api.pushRawStroke(layer, label, fn, depth);
  }

  // =========================================================================
  // 1. LAYER 1: BAIMIAO CALLIGRAPHIC CONTOURS (十八描：游丝/铁线/钉头鼠尾/折带)
  // =========================================================================
  function baimiaoStroke(api, layer, label, pts, opts = {}) {
    if (!pts || pts.length < 2) return;
    const closed = !!opts.closed;
    const smoothPts = opts.raw ? pts : catmullRom(pts, opts.samples || 7, closed);
    if (closed) smoothPts.push(smoothPts[0]);

    const w0 = opts.width != null ? opts.width : 1.1;
    const colHex = opts.color || PIGMENTS.inkMid;
    const alpha = opts.alpha != null ? opts.alpha : 0.78;
    const style = opts.style || 'yousi'; // 'yousi' | 'tiexian' | 'dingtou' | 'bark' | 'rock'
    const depth = opts.depth || 0;
    const checkOcc = !!opts.clipOccluders;
    const customOcc = opts.occluders || null;
    const chunkSize = clamp(opts.chunkSize || Math.max(6, Math.round(smoothPts.length / (opts.chunks || 6))), 4, 24);
    const taperStart = opts.taperStart != null ? opts.taperStart : (style === 'dingtou' ? 1.48 : 0.82);
    const taperEnd = opts.taperEnd != null ? opts.taperEnd : (style === 'dingtou' ? 0.34 : 0.78);
    const nTotal = smoothPts.length;

    // Precompute turning sharpness at each vertex for authentic corner press (顿笔)
    const bends = new Float32Array(nTotal);
    for (let i = 1; i < nTotal - 1; i++) {
      const ax = smoothPts[i][0] - smoothPts[i - 1][0];
      const ay = smoothPts[i][1] - smoothPts[i - 1][1];
      const bx = smoothPts[i + 1][0] - smoothPts[i][0];
      const by = smoothPts[i + 1][1] - smoothPts[i][1];
      const la = Math.hypot(ax, ay) || 1, lb = Math.hypot(bx, by) || 1;
      const dot = clamp((ax * bx + ay * by) / (la * lb), -1, 1);
      bends[i] = clamp(1 - dot, 0, 1.5);
    }

    for (let i = 0; i < nTotal - 1; i += chunkSize) {
      const end = Math.min(nTotal - 1, i + chunkSize);
      const sub = smoothPts.slice(i, end + 1);
      if (sub.length < 2) continue;

      if (checkOcc) {
        const midPt = sub[Math.floor(sub.length * 0.5)];
        if (isPointOccluded(midPt[0], midPt[1], customOcc) && isPointOccluded(sub[0][0], sub[0][1], customOcc)) {
          continue;
        }
      }

      const uMid = ((i + end) * 0.5) / Math.max(1, nTotal - 1);
      let maxBend = 0;
      for (let b = i; b <= end; b++) if (bends[b] > maxBend) maxBend = bends[b];

      let wMod = 1.0;
      if (style === 'dingtou') {
        wMod = lerp(taperStart, taperEnd, Math.pow(uMid, 0.76)) + maxBend * 0.25;
      } else if (style === 'tiexian' || style === 'rock') {
        wMod = (uMid < 0.08 || uMid > 0.92 ? 1.18 : 0.96) + Math.min(0.45, maxBend * 0.55);
      } else if (style === 'bark') {
        wMod = 0.72 + 0.56 * Math.sin(uMid * 9.5 + i * 0.7) * 0.5 + 0.28 + maxBend * 0.3;
      } else {
        wMod = (1 - Math.pow(Math.abs(uMid * 2 - 1), 3.0) * 0.26) + maxBend * 0.28;
      }
      const lw = Math.max(0.32, w0 * wMod);
      const segAlpha = clamp(alpha * (style === 'bark' ? (0.82 + 0.18 * ((i * 17 % 10) / 10)) : (0.94 + Math.min(0.08, maxBend * 0.12))), 0.1, 0.96);
      const strokeCol = rgbaStr(colHex, segAlpha);
      const halfIdx = Math.max(1, Math.floor(sub.length * 0.5));
      const tailLw = Math.max(0.28, lw * (style === 'dingtou' ? 0.62 : (style === 'yousi' ? 0.82 : 0.92)));

      pushRaw(api, layer, label, (c) => {
        c.save();
        c.strokeStyle = strokeCol;
        c.lineCap = 'round';
        c.lineJoin = 'round';
        c.lineWidth = lw;
        c.beginPath();
        c.moveTo(sub[0][0], sub[0][1]);
        for (let k = 1; k <= halfIdx; k++) c.lineTo(sub[k][0], sub[k][1]);
        c.stroke();
        c.lineWidth = tailLw;
        c.beginPath();
        c.moveTo(sub[halfIdx][0], sub[halfIdx][1]);
        for (let k = halfIdx + 1; k < sub.length; k++) c.lineTo(sub[k][0], sub[k][1]);
        c.stroke();
        c.restore();
      }, 'contour', depth);
    }
  }

  // =========================================================================
  // 2. LAYER 2: AGED SILK HALO GROUND & CLIPPED BASE TONGRAN WASH
  // =========================================================================
  function silkHaloGround(api, layer, W, H, rng, opts = {}) {
    const count = opts.count || 340;
    const focusX = opts.focusX != null ? opts.focusX : W * 0.5;
    const focusY = opts.focusY != null ? opts.focusY : H * 0.45;
    const focusR = opts.focusR != null ? opts.focusR : Math.min(W, H) * 0.34;
    const warmHex = opts.warmColor || PIGMENTS.silkTea;
    const coolHex = opts.coolColor || PIGMENTS.teaGreen;
    const lightHex = opts.lightColor || PIGMENTS.clamWhite;
    const haloIntensity = opts.haloIntensity != null ? opts.haloIntensity : 1.0;

    for (let i = 0; i < count; i++) {
      const modeRoll = rng();
      const x = rng() * W;
      const y = rng() * H;
      const dist = Math.hypot(x - focusX, y - focusY);
      const nearCenter = dist < focusR;
      let hex, rx, ry, alpha;

      if (opts.haloLight && nearCenter && modeRoll < 0.42) {
        // Subtle 외晕托白 (glow halo around white blossoms/cranes)
        hex = lightHex;
        rx = 28 + rng() * 68;
        ry = 20 + rng() * 54;
        alpha = (0.018 + rng() * 0.028) * haloIntensity;
      } else if (dist > focusR * 0.85 && modeRoll < 0.72) {
        // Tea-amber edge aging (古绢包浆烘染)
        hex = rng() > 0.28 ? warmHex : PIGMENTS.silkAmber;
        rx = 36 + rng() * 92;
        ry = 26 + rng() * 76;
        alpha = (0.016 + rng() * 0.032) * haloIntensity * smoothstep(focusR * 0.7, Math.max(W, H) * 0.65, dist);
      } else {
        hex = rng() > 0.55 ? coolHex : warmHex;
        rx = 22 + rng() * 64;
        ry = 16 + rng() * 50;
        alpha = (0.012 + rng() * 0.022) * haloIntensity;
      }
      const rot = (rng() - 0.5) * Math.PI;
      const colCenter = rgbaStr(hex, alpha);
      const colMid = rgbaStr(hex, alpha * 0.45);
      const colEdge = rgbaStr(hex, 0);
      pushRaw(api, layer, opts.label || '古绢烘染', (c) => {
        c.save();
        c.translate(x, y);
        c.rotate(rot);
        c.scale(rx, ry);
        const grad = c.createRadialGradient(0, 0, 0, 0, 0, 1);
        grad.addColorStop(0, colCenter);
        grad.addColorStop(0.55, colMid);
        grad.addColorStop(1, colEdge);
        c.fillStyle = grad;
        c.beginPath();
        c.arc(0, 0, 1, 0, TAU);
        c.fill();
        c.restore();
      }, 'groundWash');
    }
  }

  function baseShadePoly(api, layer, label, poly, opts = {}) {
    if (!poly || poly.length < 3) return;
    const baseHex = opts.baseColor || PIGMENTS.clamWhite;
    const baseAlpha = opts.baseAlpha != null ? opts.baseAlpha : 0.55;
    const shadeHex = opts.shadeColor || baseHex;
    const shadeAlpha = opts.shadeAlpha != null ? opts.shadeAlpha : 0.35;
    const gFrom = opts.gradFrom || [poly[0][0], poly[0][1]];
    const gTo = opts.gradTo || [poly[Math.floor(poly.length / 2)][0], poly[Math.floor(poly.length / 2)][1]];
    const baseRgba = rgbaStr(baseHex, baseAlpha);
    const shadeStart = rgbaStr(shadeHex, shadeAlpha);
    const shadeEnd = rgbaStr(shadeHex, 0.02);
    const bounds = polyBounds(poly);
    const depth = opts.depth || 0;

    pushRaw(api, layer, label, (c) => {
      c.save();
      c.beginPath();
      tracePolyPath(c, poly, true);
      c.clip();
      if (baseAlpha > 0.005) {
        c.fillStyle = baseRgba;
        c.fill();
      }
      if (shadeAlpha > 0.005) {
        const grad = c.createLinearGradient(gFrom[0], gFrom[1], gTo[0], gTo[1]);
        grad.addColorStop(0, shadeStart);
        grad.addColorStop(1, shadeEnd);
        c.fillStyle = grad;
        c.fillRect(bounds.minX - 6, bounds.minY - 6, bounds.w + 12, bounds.h + 12);
      }
      c.restore();
    }, 'baseWash', depth);
  }

  // =========================================================================
  // 3. LAYER 3: AUTHENTIC MULTI-PASS FENRAN & ZHAORAN (分染、水线、罩染)
  // =========================================================================
  function fenranRegion(api, layer, label, poly, rng, opts = {}) {
    if (!poly || poly.length < 3) return;
    const bounds = polyBounds(poly);
    if (bounds.w < 2 || bounds.h < 2) return;

    const count = opts.count != null ? opts.count : clamp(Math.round(Math.sqrt(bounds.w * bounds.h) * 0.55), 14, 160);
    const cStart = opts.colorFrom || opts.color || PIGMENTS.carmine;
    const cEnd = opts.colorTo || mixHex(cStart, PIGMENTS.silkCream, 0.45);
    const gradFrom = opts.gradFrom || [bounds.cx, bounds.minY];
    const gradTo = opts.gradTo || [bounds.cx, bounds.maxY];
    const gdx = gradTo[0] - gradFrom[0], gdy = gradTo[1] - gradFrom[1];
    const glen2 = Math.max(1, gdx * gdx + gdy * gdy);
    const alphaMin = opts.alphaMin != null ? opts.alphaMin : 0.025;
    const alphaMax = opts.alphaMax != null ? opts.alphaMax : 0.115;
    const veinPts = opts.veinPts || null;
    const waterGap = opts.waterLineGap != null ? opts.waterLineGap : 2.6;
    const hugVein = !!opts.hugVein;
    const bias = opts.bias || 'from'; // 'from' | 'to' | 'even' | 'vein'
    const dabScale = opts.dabScale || 1.0;
    const aspect = opts.aspect || 1.0; // >1 for anisotropic brushed sweep
    const depth = opts.depth || 0;
    const mineralGrain = !!opts.mineralGrain;
    const clipOcc = !!opts.clipOccluders;

    let emitted = 0;
    let tries = 0;
    const maxTries = count * 14 + 40;
    while (emitted < count && tries < maxTries) {
      tries++;
      const px = bounds.minX + rng() * bounds.w;
      const py = bounds.minY + rng() * bounds.h;
      if (!pointInPoly(px, py, poly)) continue;
      if (clipOcc && isPointOccluded(px, py)) continue;

      const dEdge = minDistToPolyEdge(px, py, poly);
      if (dEdge < 0.85) continue;

      const projT = clamp(((px - gradFrom[0]) * gdx + (py - gradFrom[1]) * gdy) / glen2, 0, 1);

      let keepProb = 1.0;
      let colT = projT;
      let alphaWeight = 1 - projT * 0.72;

      if (veinPts && veinPts.length >= 2) {
        const dVein = minDistToCurve(px, py, veinPts);
        if (dVein < waterGap) {
          continue;
        }
        if (hugVein) {
          const near = clamp(1 - (dVein - waterGap) / Math.max(8, Math.min(bounds.w, bounds.h) * 0.42), 0, 1);
          keepProb = 0.25 + 0.75 * near;
          colT = 1 - near * 0.85;
          alphaWeight = near * 0.85 + 0.15 * (1 - projT);
        }
      } else if (bias === 'from') {
        keepProb = 0.28 + 0.72 * Math.pow(1 - projT, 0.85);
        alphaWeight = 0.25 + 0.75 * (1 - projT);
      } else if (bias === 'to') {
        keepProb = 0.28 + 0.72 * Math.pow(projT, 0.85);
        alphaWeight = 0.25 + 0.75 * projT;
      }

      if (rng() > keepProb) continue;

      const hex = mixHex(cStart, cEnd, colT);
      const maxRad = Math.max(2.0, dEdge * 1.25);
      const baseRx = (5.5 + rng() * Math.min(28, Math.max(bounds.w, bounds.h) * 0.24)) * dabScale;
      const rx = clamp(baseRx * Math.min(1.8, aspect), 2.0, maxRad);
      const ry = clamp(baseRx * (0.52 + rng() * 0.34) / Math.sqrt(Math.max(1, aspect)), 1.2, maxRad);
      const rot = Math.atan2(gdy, gdx) + (rng() - 0.5) * (aspect > 1.4 ? 0.38 : 0.75);
      const a = lerp(alphaMin, alphaMax, clamp(alphaWeight, 0, 1));
      const cCore = rgbaStr(hex, a);
      const cMid = rgbaStr(hex, a * 0.42);
      const cEdge = rgbaStr(hex, 0);

      pushRaw(api, layer, label, (c) => {
        c.save();
        c.translate(px, py);
        c.rotate(rot);
        c.scale(rx, ry);
        const g = c.createRadialGradient(0, 0, 0, 0, 0, 1);
        g.addColorStop(0, cCore);
        g.addColorStop(0.52, cMid);
        g.addColorStop(1, cEdge);
        c.fillStyle = g;
        c.beginPath();
        c.arc(0, 0, 1, 0, TAU);
        c.fill();
        c.restore();
      }, 'fenran', depth);
      emitted++;
    }

    // Subtle mineral pigment crystal dust (矿彩石粉颗粒感)
    if (mineralGrain) {
      const grainN = clamp(Math.round(count * 0.28), 8, 56);
      const grains = [];
      let gt = 0;
      while (grains.length < grainN && gt < grainN * 10) {
        gt++;
        const gx = bounds.minX + rng() * bounds.w;
        const gy = bounds.minY + rng() * bounds.h;
        if (!pointInPoly(gx, gy, poly) || minDistToPolyEdge(gx, gy, poly) < 2) continue;
        const tProj = clamp(((gx - gradFrom[0]) * gdx + (gy - gradFrom[1]) * gdy) / glen2, 0, 1);
        const gCol = rgbaStr(mixHex(cStart, cEnd, clamp(tProj + (rng() - 0.5) * 0.25, 0, 1)), 0.08 + rng() * 0.14);
        grains.push([gx, gy, 0.75 + rng() * 1.15, gCol]);
      }
      if (grains.length) {
        for (let b = 0; b < grains.length; b += 4) {
          const sub = grains.slice(b, b + 4);
          pushRaw(api, layer, label + '·矿彩微粒', (c) => {
            c.save();
            for (let k = 0; k < sub.length; k++) {
              c.fillStyle = sub[k][3];
              c.beginPath(); c.arc(sub[k][0], sub[k][1], sub[k][2], 0, TAU); c.fill();
            }
            c.restore();
          }, 'fenran', depth);
        }
      }
    }
  }

  function striationLines(api, layer, label, origin, targetPts, opts = {}) {
    const colHex = opts.color || PIGMENTS.carmine;
    const alpha = opts.alpha != null ? opts.alpha : 0.24;
    const lw = opts.width || 0.55;
    const batch = opts.batch || 3;
    const depth = opts.depth || 0;

    for (let i = 0; i < targetPts.length; i += batch) {
      const segs = [];
      for (let b = 0; b < batch && (i + b) < targetPts.length; b++) {
        const tp = targetPts[i + b];
        const mx = lerp(origin[0], tp[0], 0.52) + (tp[2] || 0);
        const my = lerp(origin[1], tp[1], 0.52) + (tp[3] || 0);
        segs.push([origin[0], origin[1], mx, my, tp[0], tp[1]]);
      }
      const strokeRgba = rgbaStr(colHex, alpha);
      pushRaw(api, layer, label, (c) => {
        c.save();
        c.strokeStyle = strokeRgba;
        c.lineWidth = lw;
        c.lineCap = 'round';
        c.beginPath();
        for (let k = 0; k < segs.length; k++) {
          const s = segs[k];
          c.moveTo(s[0], s[1]);
          c.quadraticCurveTo(s[2], s[3], s[4], s[5]);
        }
        c.stroke();
        c.restore();
      }, 'vein', depth);
    }
  }

  // =========================================================================
  // 4. LAYER 4: SIMAO FEATHERS/HAIR (丝毛法), COVERTS, SCALES & GOLD
  // =========================================================================
  function simaoTract(api, layer, label, poly, rng, opts = {}) {
    if (!poly || poly.length < 3) return;
    const bounds = polyBounds(poly);
    const count = opts.count || 260;
    const baseAngle = opts.angle != null ? opts.angle : Math.PI * 0.5;
    const angleSpread = opts.spread != null ? opts.spread : 0.16;
    const lenMin = opts.lenMin || 8;
    const lenMax = opts.lenMax || 18;
    const colA = opts.color || PIGMENTS.inkDeep;
    const colB = opts.colorAlt || mixHex(colA, PIGMENTS.clamWhite, 0.35);
    const alpha = opts.alpha != null ? opts.alpha : 0.68;
    const lw = opts.width || 0.62;
    const batchSize = opts.batch || 1;
    const curveSign = opts.curve != null ? opts.curve : 0.12;
    const angleField = opts.angleFn || null;
    const colorField = opts.colorFn || null;
    const depth = opts.depth || 0;

    // Stratified jittered grid ordering (批丝层叠排列，消除乱丝杂点!)
    const cols = Math.max(4, Math.round(Math.sqrt(count * (bounds.w / Math.max(1, bounds.h))) * 1.15));
    const rows = Math.max(4, Math.ceil(count / cols) + 2);
    const cellW = bounds.w / cols;
    const cellH = bounds.h / rows;
    const hairs = [];

    for (let r = 0; r < rows && hairs.length < count; r++) {
      for (let col = 0; col < cols && hairs.length < count; col++) {
        const px = bounds.minX + (col + 0.18 + rng() * 0.64) * cellW;
        const py = bounds.minY + (r + 0.18 + rng() * 0.64) * cellH;
        if (!pointInPoly(px, py, poly)) continue;
        const dEdge = minDistToPolyEdge(px, py, poly);
        if (dEdge < 1.1) continue;

        const u = clamp((px - bounds.minX) / Math.max(1, bounds.w), 0, 1);
        const v = clamp((py - bounds.minY) / Math.max(1, bounds.h), 0, 1);
        const ang = (angleField ? angleField(px, py, u, v) : baseAngle) + (rng() - 0.5) * angleSpread;
        const len = clamp(lerp(lenMin, lenMax, rng()), 3.5, Math.max(4, dEdge * 1.32 + 3.5));
        const tipX = px + Math.cos(ang) * len;
        const tipY = py + Math.sin(ang) * len;
        if (!pointInPoly(tipX, tipY, poly) && dEdge < len * 0.68) continue;

        const midX = (px + tipX) * 0.5 - Math.sin(ang) * len * curveSign * 0.55;
        const midY = (py + tipY) * 0.5 + Math.cos(ang) * len * curveSign * 0.55;
        // Alternate tone cohesively across adjacent cluster barbs (批丝成簇!)
        const batchTone = ((col + r) % 3) * 0.35 + rng() * 0.25;
        const hex = colorField ? colorField(px, py, u, v, batchTone) : mixHex(colA, colB, clamp(batchTone, 0, 1));
        const rootW = lw * (0.95 + rng() * 0.3);
        const aBase = alpha * (0.78 + rng() * 0.25);
        hairs.push({
          px, py, midX, midY, tipX, tipY,
          colRoot: rgbaStr(hex, aBase),
          colTip: rgbaStr(mixHex(hex, colB, 0.35), aBase * 0.56),
          wRoot: rootW,
          wTip: Math.max(0.22, rootW * 0.42)
        });
      }
    }

    for (let i = 0; i < hairs.length; i += batchSize) {
      const grp = hairs.slice(i, i + batchSize);
      pushRaw(api, layer, label, (c) => {
        c.save();
        c.lineCap = 'round';
        for (let k = 0; k < grp.length; k++) {
          const h = grp[k];
          c.strokeStyle = h.colRoot;
          c.lineWidth = h.wRoot;
          c.beginPath(); c.moveTo(h.px, h.py); c.lineTo(h.midX, h.midY); c.stroke();
          c.strokeStyle = h.colTip;
          c.lineWidth = h.wTip;
          c.beginPath(); c.moveTo(h.midX, h.midY); c.lineTo(h.tipX, h.tipY); c.stroke();
        }
        c.restore();
      }, 'simao', depth);
    }
  }

  // Flowing hair strands along a guide curve (e.g., Tang-Song court lady coiffure)
  function flowHairStrands(api, layer, label, paths, rng, opts = {}) {
    const colDark = opts.color || PIGMENTS.inkDeep;
    const colSheen = opts.sheenColor || '#4d433d';
    const alpha = opts.alpha != null ? opts.alpha : 0.58;
    const lw = opts.width || 0.62;
    const strandsPerPath = opts.strandsPerPath || 26;
    const jitter = opts.jitter != null ? opts.jitter : 8;
    const depth = opts.depth || 0;

    for (let pIdx = 0; pIdx < paths.length; pIdx++) {
      const pts = catmullRom(paths[pIdx], 10, false);
      for (let s = 0; s < strandsPerPath; s++) {
        const offset = ((s / Math.max(1, strandsPerPath - 1)) - 0.5) * 2 * jitter + (rng() - 0.5) * 2.2;
        const startRatio = rng() * 0.22;
        const endRatio = 0.78 + rng() * 0.22;
        const i0 = Math.floor(startRatio * (pts.length - 1));
        const i1 = Math.max(i0 + 2, Math.floor(endRatio * (pts.length - 1)));
        const curve = [];
        for (let i = i0; i <= i1; i++) {
          const prev = pts[Math.max(0, i - 1)];
          const next = pts[Math.min(pts.length - 1, i + 1)];
          const tx = next[0] - prev[0], ty = next[1] - prev[1];
          const norm = Math.hypot(tx, ty) || 1;
          const taper = Math.sin(((i - i0) / Math.max(1, i1 - i0)) * Math.PI);
          const d = offset * (0.45 + 0.65 * taper);
          curve.push([pts[i][0] - (ty / norm) * d, pts[i][1] + (tx / norm) * d]);
        }
        const sheen = Math.abs(offset) < jitter * 0.35 && rng() > 0.45;
        const col = rgbaStr(sheen ? colSheen : colDark, alpha * (sheen ? 0.48 : (0.68 + rng() * 0.3)));
        const w = lw * (sheen ? 0.82 : (0.78 + rng() * 0.42));
        pushRaw(api, layer, label, (c) => {
          c.save();
          c.strokeStyle = col;
          c.lineWidth = w;
          c.lineCap = 'round';
          c.beginPath();
          c.moveTo(curve[0][0], curve[0][1]);
          for (let k = 1; k < curve.length; k++) c.lineTo(curve[k][0], curve[k][1]);
          c.stroke();
          c.restore();
        }, 'hair', depth);
      }
    }
  }

  // Individual Gongbi feather with central rachis shaft and bilateral barbs (羽翎)
  function drawFeatherPlume(api, rng, spec) {
    const {
      x0, y0, x1, y1, width, bend = 0.14,
      baseColor = PIGMENTS.clamWhite,
      tipColor = PIGMENTS.ivoryWhite,
      shaftColor = PIGMENTS.inkPale,
      outlineColor = PIGMENTS.inkPale,
      barbCount = 26,
      depth = 2,
      baseAlpha = 0.92,
      layers = { line: 1, base: 2, wash: 3, detail: 4 }
    } = spec;

    const dx = x1 - x0, dy = y1 - y0;
    const len = Math.hypot(dx, dy) || 1;
    const ux = dx / len, uy = dy / len;
    const nx = -uy, ny = ux;
    const mx = (x0 + x1) * 0.5 + nx * len * bend;
    const my = (y0 + y1) * 0.5 + ny * len * bend;

    const polyL = [], polyR = [];
    const steps = 16;
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const pt = quadPoint([x0, y0], [mx, my], [x1, y1], t);
      const hw = width * Math.sin(Math.pow(clamp(t, 0, 1), 0.72) * Math.PI * 0.92 + 0.15) * (t > 0.92 ? (1 - t) * 8 : 1);
      polyL.push([pt[0] + nx * hw, pt[1] + ny * hw]);
      polyR.unshift([pt[0] - nx * hw, pt[1] - ny * hw]);
    }
    const poly = polyL.concat(polyR);

    baimiaoStroke(api, layers.line, '羽翎双勾', poly, {
      closed: true, raw: true, width: 0.75, color: outlineColor, alpha: 0.65, chunkSize: 10, depth
    });
    baseShadePoly(api, layers.base, '羽翎底染', poly, {
      baseColor, baseAlpha, shadeColor: tipColor, shadeAlpha: 0.45,
      gradFrom: [x0, y0], gradTo: [x1, y1], depth
    });
    fenranRegion(api, layers.wash, '羽片分染', poly, rng, {
      count: Math.max(10, Math.round(len * 0.14)),
      colorFrom: tipColor, colorTo: baseColor,
      gradFrom: [x1, y1], gradTo: [x0, y0], bias: 'from',
      alphaMin: 0.03, alphaMax: 0.12, dabScale: 0.85, depth
    });

    // Rachis shaft
    const shaftPts = [];
    for (let i = 0; i <= 10; i++) shaftPts.push(quadPoint([x0, y0], [mx, my], [x1, y1], i / 10));
    baimiaoStroke(api, layers.detail, '羽轴丝毛', shaftPts, {
      raw: true, width: 0.75, color: shaftColor, alpha: 0.54, chunkSize: 6, depth
    });

    // Bilateral barbs (羽枝丝毛)
    const nBarbs = barbCount;
    for (let i = 1; i < nBarbs; i++) {
      const t = i / nBarbs;
      const pt = quadPoint([x0, y0], [mx, my], [x1, y1], t);
      const hw = width * Math.sin(Math.pow(t, 0.72) * Math.PI * 0.92 + 0.15) * 0.92;
      const bLen = Math.max(2, hw);
      const colHex = mixHex(baseColor, tipColor, t);
      const barbCol = rgbaStr(mixHex(colHex, outlineColor, 0.35), 0.36 + rng() * 0.22);
      const tan = [
        2 * (1 - t) * (mx - x0) + 2 * t * (x1 - mx),
        2 * (1 - t) * (my - y0) + 2 * t * (y1 - my)
      ];
      const tn = Math.hypot(tan[0], tan[1]) || 1;
      const bxU = tan[0] / tn, byU = tan[1] / tn;
      const tipLX = pt[0] + (bxU * 0.42 + nx * 0.9) * bLen;
      const tipLY = pt[1] + (byU * 0.42 + ny * 0.9) * bLen;
      const tipRX = pt[0] + (bxU * 0.42 - nx * 0.9) * bLen;
      const tipRY = pt[1] + (byU * 0.42 - ny * 0.9) * bLen;

      pushRaw(api, layers.detail, '羽枝丝毛', (c) => {
        c.save();
        c.strokeStyle = barbCol;
        c.lineWidth = 0.48;
        c.lineCap = 'round';
        c.beginPath();
        c.moveTo(pt[0], pt[1]); c.lineTo(tipLX, tipLY);
        c.moveTo(pt[0], pt[1]); c.lineTo(tipRX, tipRY);
        c.stroke();
        c.restore();
      }, 'barb', depth);
    }
  }

  // Gold filigree stroke (泥金勾勒 / 描金)
  function goldFiligreeStroke(api, layer, label, pts, opts = {}) {
    if (!pts || pts.length < 2) return;
    const smooth = opts.raw ? pts : catmullRom(pts, opts.samples || 7, !!opts.closed);
    if (opts.closed) smooth.push(smooth[0]);
    const w = opts.width || 1.25;
    const alpha = opts.alpha != null ? opts.alpha : 0.72;
    const chunkSize = clamp(opts.chunkSize || 12, 5, 24);
    const warmCol = rgbaStr(opts.underColor || PIGMENTS.goldWarm, alpha * 0.78);
    const brightCol = rgbaStr(opts.color || PIGMENTS.goldBright, alpha);

    for (let i = 0; i < smooth.length - 1; i += chunkSize) {
      const sub = smooth.slice(i, Math.min(smooth.length, i + chunkSize + 1));
      if (sub.length < 2) continue;
      pushRaw(api, layer, label, (c) => {
        c.save();
        c.lineCap = 'round';
        c.lineJoin = 'round';
        c.strokeStyle = warmCol;
        c.lineWidth = w * 1.45;
        c.beginPath();
        c.moveTo(sub[0][0], sub[0][1]);
        for (let k = 1; k < sub.length; k++) c.lineTo(sub[k][0], sub[k][1]);
        c.stroke();
        c.strokeStyle = brightCol;
        c.lineWidth = w * 0.72;
        c.beginPath();
        c.moveTo(sub[0][0], sub[0][1]);
        for (let k = 1; k < sub.length; k++) c.lineTo(sub[k][0], sub[k][1]);
        c.stroke();
        c.restore();
      }, 'gold');
    }
  }

  // Embossed 3D Lifen pollen stamens (立粉点蕊)
  function lifenStamens(api, layer, cx, cy, rng, opts = {}) {
    const count = opts.count || 36;
    const rInner = opts.rInner || 6;
    const rOuter = opts.rOuter || 24;
    const tilt = opts.tilt != null ? opts.tilt : 0.72;
    const rot = opts.rot || 0;
    const filColor = rgbaStr(opts.filamentColor || PIGMENTS.cinnabar, opts.filamentAlpha || 0.72);
    const bodyHex = opts.pollenColor || PIGMENTS.gooseYellow;
    const baseHex = opts.pollenShadow || PIGMENTS.ochre;
    const tipHex = opts.pollenHighlight || PIGMENTS.clamWhite;
    const depth = opts.depth != null ? opts.depth : 4;

    for (let i = 0; i < count; i++) {
      const ang = (i / count) * TAU + (rng() - 0.5) * 0.24;
      const dist = lerp(rInner, rOuter, 0.2 + 0.8 * Math.sqrt(rng()));
      const sx = cx + Math.cos(ang + rot) * (rInner * 0.45);
      const sy = cy + Math.sin(ang + rot) * (rInner * 0.45) * tilt;
      const ex = cx + Math.cos(ang + rot) * dist;
      const ey = cy + Math.sin(ang + rot) * dist * tilt - rng() * 4;
      const mx = lerp(sx, ex, 0.5) + (rng() - 0.5) * 4;
      const my = lerp(sy, ey, 0.5) - 3 - rng() * 3;
      const dotR = (opts.dotSize || 2.1) * (0.78 + rng() * 0.48);

      pushRaw(api, layer - 1, '花丝立粉', (c) => {
        c.save();
        c.strokeStyle = filColor;
        c.lineWidth = 0.68;
        c.lineCap = 'round';
        c.beginPath();
        c.moveTo(sx, sy);
        c.quadraticCurveTo(mx, my, ex, ey);
        c.stroke();
        c.restore();
      }, 'stamen', depth);

      const cShadow = rgbaStr(baseHex, 0.86);
      const cBody = rgbaStr(bodyHex, 0.94);
      const cTip = rgbaStr(tipHex, 0.95);
      pushRaw(api, layer, '立粉点蕊', (c) => {
        c.save();
        c.fillStyle = cShadow;
        c.beginPath();
        c.ellipse(ex + 0.5, ey + 0.6, dotR * 1.15, dotR * 0.88, ang * 0.3, 0, TAU);
        c.fill();
        c.fillStyle = cBody;
        c.beginPath();
        c.ellipse(ex, ey, dotR, dotR * 0.78, ang * 0.3, 0, TAU);
        c.fill();
        c.fillStyle = cTip;
        c.beginPath();
        c.arc(ex - dotR * 0.25, ey - dotR * 0.22, dotR * 0.38, 0, TAU);
        c.fill();
        c.restore();
      }, 'lifen', depth);
    }
  }

  function drawDewdrop(api, layer, x, y, r) {
    pushRaw(api, layer, '露珠提白', (c) => {
      c.save();
      c.fillStyle = 'rgba(42, 58, 44, 0.22)';
      c.beginPath();
      c.ellipse(x + r * 0.18, y + r * 0.24, r * 1.04, r * 0.82, 0.15, 0, TAU);
      c.fill();
      c.fillStyle = 'rgba(225, 240, 224, 0.32)';
      c.strokeStyle = 'rgba(72, 92, 74, 0.45)';
      c.lineWidth = 0.65;
      c.beginPath();
      c.ellipse(x, y, r, r * 0.84, 0, 0, TAU);
      c.fill();
      c.stroke();
      c.fillStyle = 'rgba(255, 253, 246, 0.95)';
      c.beginPath();
      c.arc(x - r * 0.32, y - r * 0.28, r * 0.28, 0, TAU);
      c.fill();
      c.restore();
    }, 'dew');
  }

  // =========================================================================
  // 5. BOTANICAL LEAVES, FLOWERS & SCHOLAR ROCKS
  // =========================================================================
  function buildLeafGeometry(cx, cy, angle, length, width, spec = {}) {
    const bend = spec.bend != null ? spec.bend : 0.12;
    const serrated = !!spec.serrated;
    const wormBite = !!spec.wormBite;
    const steps = 20;
    const spine = [];
    const left = [];
    const right = [];
    const cosA = Math.cos(angle), sinA = Math.sin(angle);
    const nx = -sinA, ny = cosA;

    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const forward = t * length;
      const arch = Math.sin(t * Math.PI) * length * bend;
      const sx = cx + cosA * forward + nx * arch;
      const sy = cy + sinA * forward + ny * arch;
      spine.push([sx, sy]);

      // Leaf profile: bulbous lower-mid, slender pointed tip
      let wFrac = Math.sin(Math.pow(clamp(t, 0, 1), 0.72) * Math.PI);
      if (spec.ovate) wFrac = Math.pow(Math.max(0, Math.sin(t * Math.PI)), 0.78) * (1 - t * 0.12);
      let hw = width * 0.5 * wFrac;
      if (serrated && i > 2 && i < steps - 1 && i % 2 === 1) hw *= 1.13;
      if (wormBite && i >= 12 && i <= 15) hw *= 0.48;

      left.push([sx + nx * hw, sy + ny * hw]);
      right.unshift([sx - nx * hw, sy - ny * hw]);
    }
    const poly = left.concat(right);
    return { poly, spine, tip: spine[spine.length - 1], base: spine[0] };
  }

  function drawGongbiLeaf(api, rng, spec) {
    const {
      x, y, angle, length, width,
      isBack = false,
      serrated = false,
      ovate = false,
      wormBite = false,
      autumnTip = false,
      bend = 0.11,
      depth = isBack ? 1 : 3,
      occluders = null,
      layers = { line: 1, base: 2, wash: 3, detail: 4 }
    } = spec;

    const geom = buildLeafGeometry(x, y, angle, length, width, { bend, serrated, ovate, wormBite });
    const poly = geom.poly;
    const spine = geom.spine;
    const customOcc = occluders || _activeOccluders;

    const outlineHex = isBack ? PIGMENTS.inkPale : PIGMENTS.inkDeep;
    const baseHex = isBack ? '#8ea674' : '#528558';
    const shadeDeep = isBack ? PIGMENTS.sapGreen : PIGMENTS.malachiteDeep;
    const fenranFrom = isBack ? '#5d7a47' : '#244f3d';
    const fenranTo = isBack ? '#b8ba78' : '#73ab82';

    // Layer 1: 双勾白描
    baimiaoStroke(api, layers.line, isBack ? '反叶双勾' : '正叶双勾', poly, {
      closed: true, raw: true, width: isBack ? 0.82 : 1.05,
      color: outlineHex, alpha: isBack ? 0.68 : 0.84, chunkSize: 10, depth
    });
    baimiaoStroke(api, layers.line, '主脉起稿', spine, {
      raw: true, width: 0.72, color: isBack ? PIGMENTS.ochre : PIGMENTS.inkPale, alpha: 0.45, chunkSize: 8, depth
    });

    // Layer 2: 统染底色 (Substantial mineral opacity on front leaves prevents back twigs/stems from bleeding through!)
    baseShadePoly(api, layers.base, '叶片统染', poly, {
      baseColor: baseHex, baseAlpha: isBack ? 0.94 : 0.97,
      shadeColor: shadeDeep, shadeAlpha: isBack ? 0.36 : 0.48,
      gradFrom: geom.base, gradTo: geom.tip, depth
    });

    // Layer 3: 多次分染 + 留水线 (Midrib Suixian) + Optional ochre autumn/insect rim
    const washCount = clamp(Math.round((length * width) / 145), 14, 72);
    fenranRegion(api, layers.wash, '叶片分染留水线', poly, rng, {
      count: washCount,
      colorFrom: fenranFrom,
      colorTo: fenranTo,
      gradFrom: geom.base,
      gradTo: geom.tip,
      veinPts: spine,
      waterLineGap: clamp(width * 0.042, 1.8, 3.2),
      hugVein: true,
      alphaMin: 0.032,
      alphaMax: isBack ? 0.095 : 0.135,
      dabScale: 0.82,
      aspect: 1.8,
      depth
    });
    if (autumnTip || wormBite) {
      fenranRegion(api, layers.wash, '叶梢赭染', poly, rng, {
        count: Math.max(8, Math.round(washCount * 0.38)),
        colorFrom: PIGMENTS.burntOchre,
        colorTo: PIGMENTS.sienna,
        gradFrom: geom.tip,
        gradTo: geom.base,
        bias: 'from',
        alphaMin: 0.025,
        alphaMax: 0.095,
        dabScale: 0.75,
        depth
      });
    }

    // Layer 4: 细叶筋 + 复勒主脉与边缘 (Strictly clipped against foreground occluders!)
    const cosA = Math.cos(angle), sinA = Math.sin(angle);
    const nx = -sinA, ny = cosA;
    const veinPairs = 7;
    const veinColor = rgbaStr(isBack ? PIGMENTS.ochre : PIGMENTS.inkMid, isBack ? 0.42 : 0.56);
    for (let v = 1; v < veinPairs; v++) {
      const idx = Math.floor((v / veinPairs) * (spine.length - 3)) + 1;
      const sp = spine[idx];
      if (isPointOccluded(sp[0], sp[1], customOcc)) continue;
      const hw = width * 0.44 * Math.sin(Math.pow(v / veinPairs, 0.72) * Math.PI);
      const vxL = sp[0] + cosA * hw * 0.55 + nx * hw * 0.9;
      const vyL = sp[1] + sinA * hw * 0.55 + ny * hw * 0.9;
      const vxR = sp[0] + cosA * hw * 0.55 - nx * hw * 0.9;
      const vyR = sp[1] + sinA * hw * 0.55 - ny * hw * 0.9;
      pushRaw(api, layers.detail, '复勒叶筋', (c) => {
        c.save();
        c.strokeStyle = veinColor;
        c.lineWidth = 0.55;
        c.lineCap = 'round';
        c.beginPath();
        if (!isPointOccluded(vxL, vyL, customOcc)) {
          c.moveTo(sp[0] + nx * 1.4, sp[1] + ny * 1.4);
          c.quadraticCurveTo(lerp(sp[0], vxL, 0.55) + cosA * 3, lerp(sp[1], vyL, 0.55) + sinA * 3, vxL, vyL);
        }
        if (!isPointOccluded(vxR, vyR, customOcc)) {
          c.moveTo(sp[0] - nx * 1.4, sp[1] - ny * 1.4);
          c.quadraticCurveTo(lerp(sp[0], vxR, 0.55) + cosA * 3, lerp(sp[1], vyR, 0.55) + sinA * 3, vxR, vyR);
        }
        c.stroke();
        c.restore();
      }, 'vein', depth);
    }
    // Crisp glowing midrib water line highlight + fule contour
    baimiaoStroke(api, layers.detail, '中脉水线', spine, {
      raw: true, width: 1.0, color: isBack ? '#d2d49a' : '#a7cba4', alpha: 0.52, chunkSize: 6,
      depth, clipOccluders: true, occluders: customOcc
    });
    baimiaoStroke(api, layers.detail, '叶缘复勒', poly, {
      closed: true, raw: true, width: 0.72, color: outlineHex, alpha: 0.58, chunkSize: 8,
      depth, clipOccluders: true, occluders: customOcc
    });
  }

  // Smooth anatomical flower petal with ruffled/notched rim, mineral fenran, and silk striations
  function drawFlowerPetal(api, rng, spec) {
    const {
      cx, cy, angle, length, width,
      notches = 2,
      tilt = 1.0,
      curl = 0.0,
      baseColor = PIGMENTS.clamWhite,
      rootColor = PIGMENTS.carmine,
      midColor = PIGMENTS.roseWash,
      tipColor = PIGMENTS.clamWhite,
      outlineColor = '#7d4a46',
      tipHighlight = true,
      washCount = 28,
      layers = { line: 1, base: 2, wash: 3, detail: 4, highlight: 5 }
    } = spec;

    const poly = [];
    const steps = 26;
    const cosA = Math.cos(angle), sinA = Math.sin(angle);
    const nx = -sinA, ny = cosA;

    for (let i = 0; i <= steps; i++) {
      const u = i / steps;
      const theta = -Math.PI * 0.495 + u * Math.PI * 0.99; // fan across petal lobe safely inside (-PI/2, PI/2)
      const edgeLobe = Math.pow(Math.max(0, Math.cos(theta)), 0.42);
      let wave = 1.0;
      if (notches > 0 && Math.abs(theta) < 1.15) {
        wave -= Math.abs(Math.sin(theta * notches * 1.7 + curl)) * 0.085;
      }
      const fwd = length * (0.28 + 0.72 * edgeLobe) * wave;
      const lat = width * 0.52 * Math.sin(theta) * (0.55 + 0.45 * edgeLobe);
      const px = cx + (cosA * fwd + nx * lat) * (1 + Math.sin(u * Math.PI) * 0.04);
      const py = cy + (sinA * fwd + ny * lat) * tilt;
      poly.push([px, py]);
    }
    // Root return vertices
    poly.push([cx + nx * width * 0.14, cy + ny * width * 0.14 * tilt]);
    poly.unshift([cx - nx * width * 0.14, cy - ny * width * 0.14 * tilt]);

    const tipPt = [cx + cosA * length, cy + sinA * length * tilt];
    const rootPt = [cx, cy];
    const depth = spec.depth != null ? spec.depth : 4;

    // Layer 1: 双勾白描
    baimiaoStroke(api, layers.line, '花瓣双勾', poly, {
      closed: true, raw: true, width: 0.78, color: outlineColor, alpha: 0.74, chunkSize: 9, depth
    });

    // Layer 2: 统染底色 (Substantial opaque clam-shell/alum mineral ground so upper petals cleanly layer over stems!)
    baseShadePoly(api, layers.base, '花瓣底染', poly, {
      baseColor, baseAlpha: spec.baseAlpha != null ? spec.baseAlpha : 0.99,
      shadeColor: midColor, shadeAlpha: 0.48,
      gradFrom: rootPt, gradTo: tipPt, depth
    });

    // Layer 3: 分染渐变 + 丝瓣纹
    fenranRegion(api, layers.wash, '花瓣分染', poly, rng, {
      count: washCount,
      colorFrom: rootColor,
      colorTo: midColor,
      gradFrom: rootPt,
      gradTo: tipPt,
      bias: 'from',
      alphaMin: 0.035,
      alphaMax: 0.14,
      dabScale: 1.05,
      aspect: 1.6,
      depth
    });
    if (tipHighlight) {
      fenranRegion(api, layers.wash, '瓣尖蛤粉提染', poly, rng, {
        count: Math.max(8, Math.round(washCount * 0.42)),
        colorFrom: tipColor,
        colorTo: midColor,
        gradFrom: tipPt,
        gradTo: rootPt,
        bias: 'from',
        alphaMin: 0.04,
        alphaMax: 0.16,
        dabScale: 0.95,
        depth
      });
    }

    // Fine silk veins fanning from base toward outer edge
    const veinTargets = [];
    for (let k = 3; k < poly.length - 3; k += 3) {
      const vp = poly[k];
      veinTargets.push([lerp(cx, vp[0], 0.86), lerp(cy, vp[1], 0.86), (rng() - 0.5) * 6, (rng() - 0.5) * 6]);
    }
    striationLines(api, layers.detail, '花瓣丝纹', rootPt, veinTargets, {
      color: mixHex(rootColor, outlineColor, 0.5),
      alpha: 0.24,
      width: 0.46,
      batch: 3,
      depth
    });

    // Layer 4: 复勒提边 (Only along outer visible petal crest — never cutting across overlapped petal bases!)
    const rimArc = poly.slice(3, Math.max(4, poly.length - 3));
    baimiaoStroke(api, layers.detail, '花瓣外缘复勒', rimArc, {
      closed: false, raw: true, width: 0.62, color: mixHex(outlineColor, rootColor, 0.35), alpha: 0.56, chunkSize: 12, depth
    });
  }

  function drawPlumBlossom(api, rng, spec) {
    const {
      x, y, radius, angle = 0, view = 'front', // 'front' | 'side' | 'bud'
      blush = false,
      depth = 4,
      layers = { line: 1, base: 2, wash: 3, detail: 4, highlight: 5 }
    } = spec;

    if (view === 'bud') {
      const pts = [
        [x - radius * 0.45, y + radius * 0.35],
        [x - radius * 0.52, y - radius * 0.2],
        [x, y - radius * 0.95],
        [x + radius * 0.52, y - radius * 0.2],
        [x + radius * 0.45, y + radius * 0.35]
      ];
      const poly = catmullRom(pts, 6, true);
      baimiaoStroke(api, layers.line, '梅蕾双勾', poly, { closed: true, raw: true, width: 0.78, color: PIGMENTS.inkWarm, alpha: 0.75, depth });
      baseShadePoly(api, layers.base, '梅蕾平涂', poly, { baseColor: blush ? PIGMENTS.rouge : '#d96973', baseAlpha: 0.94, shadeColor: PIGMENTS.carmine, shadeAlpha: 0.52, gradFrom: [x, y + radius * 0.35], gradTo: [x, y - radius], depth });
      fenranRegion(api, layers.wash, '梅蕾分染', poly, rng, { count: 14, colorFrom: PIGMENTS.carmine, colorTo: PIGMENTS.clamWhite, gradFrom: [x, y + radius * 0.3], gradTo: [x, y - radius * 0.9], bias: 'from', alphaMin: 0.04, alphaMax: 0.14, depth });
      // Green-brown calyx (梅蒂)
      const calyx = catmullRom([[x - radius * 0.55, y + radius * 0.2], [x, y + radius * 0.68], [x + radius * 0.55, y + radius * 0.2], [x, y + radius * 0.18]], 4, true);
      baimiaoStroke(api, layers.line, '梅蒂勾勒', calyx, { closed: true, raw: true, width: 0.72, color: PIGMENTS.inkDeep, alpha: 0.75, depth });
      baseShadePoly(api, layers.base, '梅蒂设色', calyx, { baseColor: '#6d5c38', baseAlpha: 0.92, shadeColor: '#3d3020', shadeAlpha: 0.5, depth });
      return;
    }

    const nPetals = view === 'side' ? 4 : 5;
    const tilt = view === 'side' ? 0.58 : 0.94;
    for (let i = 0; i < nPetals; i++) {
      const pa = angle + (i / nPetals) * TAU + (view === 'side' ? -Math.PI * 0.42 : 0);
      const pLen = radius * (view === 'side' && i === 0 ? 0.72 : 1.0);
      const pWid = radius * (view === 'side' ? 0.72 : 0.92);
      drawFlowerPetal(api, rng, {
        cx: x + Math.cos(pa) * radius * 0.16,
        cy: y + Math.sin(pa) * radius * 0.16 * tilt,
        angle: pa,
        length: pLen,
        width: pWid,
        notches: 0,
        tilt,
        baseColor: blush ? '#f5dfe0' : PIGMENTS.clamWhite,
        rootColor: blush ? '#c95b6b' : '#b78976',
        midColor: blush ? '#ecc4c8' : '#efe7d4',
        tipColor: PIGMENTS.clamWhite,
        outlineColor: blush ? '#7d444a' : '#736252',
        washCount: Math.max(12, Math.round(radius * 0.52)),
        baseAlpha: 0.99,
        depth,
        layers
      });
    }
    // Calyx center + Lifen golden stamens
    const calR = radius * 0.22;
    const calPoly = catmullRom([
      [x - calR, y], [x, y - calR * tilt], [x + calR, y], [x, y + calR * tilt]
    ], 4, true);
    baseShadePoly(api, layers.base, '花托点染', calPoly, { baseColor: '#7a633c', baseAlpha: 0.9, shadeColor: PIGMENTS.burntOchre, shadeAlpha: 0.5, depth });
    lifenStamens(api, layers.highlight, x, y - (view === 'side' ? radius * 0.12 : 0), rng, {
      count: view === 'side' ? 11 : 16,
      rInner: radius * 0.12,
      rOuter: radius * 0.46,
      tilt,
      filamentColor: '#8d5d3c',
      dotSize: clamp(radius * 0.068, 1.3, 2.2),
      depth
    });
  }

  // Subdivide stone contours into angular chiseled Song-style ZheDai/FuPi facets (瘦漏折带轮廓)
  function subdivideChiseledRock(pts, rng) {
    const out = [];
    const n = pts.length;
    for (let i = 0; i < n; i++) {
      const a = pts[i], b = pts[(i + 1) % n];
      const dx = b[0] - a[0], dy = b[1] - a[1];
      const len = Math.hypot(dx, dy) || 1;
      const nx = -dy / len, ny = dx / len;
      out.push(a);
      if (len > 26) {
        const segs = len > 75 ? 3 : 2;
        for (let s = 1; s < segs; s++) {
          const t = s / segs;
          const stepOff = (rng() - 0.48) * Math.min(14, len * 0.14);
          out.push([lerp(a[0], b[0], t) + nx * stepOff, lerp(a[1], b[1], t) + ny * stepOff]);
        }
      }
    }
    return out;
  }

  // Sculptural Taihu Scholar Rock (太湖石：瘦漏皱透 + 立体洞壁 + 斧劈皴法)
  function drawTaihuRock(api, rng, spec) {
    const {
      outerPts, holes = [],
      layers = { line: 1, base: 2, wash: 3, detail: 4, highlight: 5 },
      mossCount = 48,
      depth = 1
    } = spec;

    const poly = subdivideChiseledRock(outerPts, rng);
    const bounds = polyBounds(poly);

    baimiaoStroke(api, layers.line, '太湖石折带铁线', poly, {
      closed: true, raw: true, width: 1.45, color: PIGMENTS.inkDeep, alpha: 0.88, style: 'rock', chunkSize: 8, depth
    });
    baseShadePoly(api, layers.base, '太湖石赭墨统染', poly, {
      baseColor: '#b7a48a', baseAlpha: 0.9,
      shadeColor: '#564c40', shadeAlpha: 0.62,
      gradFrom: [bounds.maxX, bounds.minY], gradTo: [bounds.minX, bounds.maxY], depth
    });

    // Multi-pass anisotropic crag cunran + fine stone granulation
    fenranRegion(api, layers.wash, '太湖石石青赭分染', poly, rng, {
      count: clamp(Math.round(Math.sqrt(bounds.w * bounds.h) * 0.72), 90, 260),
      colorFrom: '#49423a',
      colorTo: '#ab987e',
      gradFrom: [bounds.minX + bounds.w * 0.15, bounds.maxY],
      gradTo: [bounds.maxX - bounds.w * 0.15, bounds.minY],
      bias: 'from',
      alphaMin: 0.04,
      alphaMax: 0.14,
      dabScale: 1.1,
      aspect: 1.9,
      mineralGrain: true,
      depth
    });
    fenranRegion(api, layers.wash, '太湖石花青阴面罩染', poly, rng, {
      count: clamp(Math.round(Math.sqrt(bounds.w * bounds.h) * 0.36), 45, 130),
      colorFrom: PIGMENTS.indigo,
      colorTo: '#8f8474',
      gradFrom: [bounds.maxX, bounds.maxY],
      gradTo: [bounds.cx, bounds.minY],
      bias: 'from',
      alphaMin: 0.03,
      alphaMax: 0.095,
      dabScale: 1.15,
      aspect: 1.6,
      depth
    });

    // Clustered angular axe-cut & hemp-fiber cleft bands (聚散斧劈/披麻皴组)
    const cleftGroups = 6;
    for (let g = 0; g < cleftGroups; g++) {
      const gx = bounds.minX + bounds.w * (0.16 + rng() * 0.68);
      const gy = bounds.minY + bounds.h * (0.14 + rng() * 0.72);
      if (!pointInPoly(gx, gy, poly) || holes.some(hp => pointInPoly(gx, gy, hp))) continue;
      const baseAng = (rng() > 0.45 ? 0.52 : -0.62) + (rng() - 0.5) * 0.28;
      const subN = 3 + Math.floor(rng() * 3);
      for (let s = 0; s < subN; s++) {
        const px = gx + (s - subN * 0.5) * 9 + (rng() - 0.5) * 6;
        const py = gy + (s - subN * 0.5) * 11 + (rng() - 0.5) * 5;
        if (!pointInPoly(px, py, poly) || holes.some(hp => pointInPoly(px, py, hp))) continue;
        const cLen = 22 + rng() * 48;
        const cleft = [
          [px, py],
          [px + Math.cos(baseAng) * cLen * 0.48 + (rng() - 0.5) * 5, py + Math.sin(baseAng) * cLen * 0.48],
          [px + Math.cos(baseAng + 0.32) * cLen, py + Math.sin(baseAng + 0.32) * cLen]
        ];
        baimiaoStroke(api, layers.detail, '太湖石斧劈皴', cleft, {
          width: 1.15, color: PIGMENTS.inkDeep, alpha: 0.72, style: 'rock', chunkSize: 4, depth
        });
      }
    }

    // Perforations (漏透洞穴 — soft eroded stone depth rim + silk ground aperture)
    for (let h = 0; h < holes.length; h++) {
      const hPoly = catmullRom(subdivideChiseledRock(holes[h], rng), 2, true);
      const hb = polyBounds(hPoly);
      const rim = hPoly.map(p => [lerp(hb.cx, p[0], 1.24), lerp(hb.cy, p[1], 1.24)]);
      fenranRegion(api, layers.wash, '石孔阴晕', rim, rng, {
        count: 26, colorFrom: '#584c3e', colorTo: '#8f8170',
        gradFrom: [hb.cx, hb.cy], gradTo: [hb.maxX, hb.maxY],
        alphaMin: 0.045, alphaMax: 0.14, depth
      });
      const innerShadowPoly = hPoly.map(p => [p[0], p[1]]);
      const shiftedSkyPoly = hPoly.map(p => [lerp(hb.cx, p[0], 0.9) + 3.2, lerp(hb.cy, p[1], 0.9) + 3.6]);
      baseShadePoly(api, layers.detail, '石孔立体内壁', innerShadowPoly, {
        baseColor: '#706353', baseAlpha: 0.78, shadeColor: '#4a4035', shadeAlpha: 0.42,
        gradFrom: [hb.minX, hb.minY], gradTo: [hb.maxX, hb.maxY], depth
      });
      baseShadePoly(api, layers.detail, '漏透空隙', shiftedSkyPoly, {
        baseColor: '#eee4cb', baseAlpha: 0.96, shadeColor: PIGMENTS.silkTea, shadeAlpha: 0.18, depth
      });
      baimiaoStroke(api, layers.detail, '石孔复勒', hPoly, {
        closed: true, raw: true, width: 0.95, color: '#453c33', alpha: 0.74, style: 'rock', chunkSize: 10, depth
      });
    }

    // Lichen / moss stipples concentrated authentically along upper ledges & crevices (聚散点苔)
    let placed = 0, tries = 0;
    const mossCenters = [];
    for (let k = 0; k < 5; k++) {
      const mx = bounds.minX + bounds.w * (0.18 + rng() * 0.64);
      const my = bounds.minY + bounds.h * (0.08 + rng() * 0.58);
      if (pointInPoly(mx, my, poly) && !holes.some(hp => pointInPoly(mx, my, hp))) mossCenters.push([mx, my]);
    }
    while (placed < mossCount && tries < mossCount * 14 && mossCenters.length) {
      tries++;
      const anchor = mossCenters[placed % mossCenters.length];
      const mx = anchor[0] + (rng() - 0.5) * 40;
      const my = anchor[1] + (rng() - 0.5) * 20;
      if (!pointInPoly(mx, my, poly)) continue;
      if (holes.some(hp => pointInPoly(mx, my, hp))) continue;
      const dotR = 1.4 + rng() * 2.2;
      const dotCol = rgbaStr(rng() > 0.38 ? PIGMENTS.malachiteDeep : PIGMENTS.oliveDark, 0.58 + rng() * 0.28);
      pushRaw(api, layers.highlight, '石隙聚散点苔', (c) => {
        c.save();
        c.fillStyle = dotCol;
        c.beginPath();
        c.ellipse(mx, my, dotR * 1.25, dotR * 0.78, (rng() - 0.5) * 0.6, 0, TAU);
        c.fill();
        c.restore();
      }, 'moss', depth);
      placed++;
    }
  }

  // Classical Unified Drifting Gongbi Cloud Mist Ribbon (双勾流云 / 瑞岚云带)
  function drawAuspiciousCloud(api, rng, spec) {
    const { cx, cy, width = 260, height = 38, curls = 4, goldRim = false, depth = 3 } = spec;
    const hw = width * 0.5, hh = height * 0.5;
    const topPts = [];
    const nTop = 22;
    for (let i = 0; i <= nTop; i++) {
      const u = i / nTop;
      const sx = cx + (u - 0.5) * width;
      const env = Math.sin(u * Math.PI);
      const lobe = 0.42 + 0.58 * Math.abs(Math.sin(u * Math.PI * curls + 0.45));
      const sy = cy - env * hh * lobe + (rng() - 0.5) * 2.2;
      topPts.push([sx, sy]);
    }
    const botPts = [];
    const nBot = 14;
    for (let i = nBot; i >= 0; i--) {
      const u = i / nBot;
      const sx = cx + (u - 0.5) * width * 0.96;
      const env = Math.pow(Math.sin(u * Math.PI), 0.72);
      const sy = cy + env * hh * 0.48 + Math.sin(u * Math.PI * 2.2) * hh * 0.12;
      botPts.push([sx, sy]);
    }
    const poly = catmullRom(topPts.concat(botPts), 3, true);
    baseShadePoly(api, 3, '瑞云蛤粉烘托', poly, {
      baseColor: '#f5eedc', baseAlpha: 0.84,
      shadeColor: PIGMENTS.clamWhite, shadeAlpha: 0.48,
      gradFrom: [cx, cy + hh], gradTo: [cx, cy - hh], depth
    });
    const topSmooth = catmullRom(topPts.slice(1, topPts.length - 1), 3, false);
    baimiaoStroke(api, 4, '勾云游丝卷端', topSmooth, {
      raw: true, width: 0.76, color: goldRim ? PIGMENTS.goldWarm : '#9a876c', alpha: 0.48, style: 'yousi', chunkSize: 10, depth
    });
    // Left & right curled ruyi wisps (如意云尾)
    const hookPts = catmullRom([
      [cx - hw * 0.68, cy - hh * 0.18],
      [cx - hw * 0.84, cy - hh * 0.04],
      [cx - hw * 0.76, cy + hh * 0.16]
    ], 4, false);
    baimiaoStroke(api, 4, '祥云卷尾', hookPts, {
      raw: true, width: 0.68, color: goldRim ? PIGMENTS.goldWarm : '#9a876c', alpha: 0.42, style: 'yousi', depth
    });
  }

  // =========================================================================
  // 6. KOI FISH SCALED BODY BUILDER (网鳞分染 + 泥金提鳞)
  // =========================================================================
  function drawKoiCarp(api, rng, spec) {
    const {
      spinePts, // 5-7 spine pts from nose (t=0) to peduncle (t=1)
      widthProfile, // function(u) -> half width
      patrolSpots = [], // [{ uStart, uEnd, sideOffset, radiusU, color }]
      baseColor = PIGMENTS.clamWhite,
      scaleRimColor = '#8f6b56',
      goldTrim = true,
      layers = { line: 1, base: 2, wash: 3, detail: 4, highlight: 5 }
    } = spec;

    const spine = catmullRom(spinePts, 10, false);
    const nS = spine.length;
    const leftPts = [], rightPts = [];
    const normals = [];
    for (let i = 0; i < nS; i++) {
      const prev = spine[Math.max(0, i - 1)];
      const next = spine[Math.min(nS - 1, i + 1)];
      const tx = next[0] - prev[0], ty = next[1] - prev[1];
      const norm = Math.hypot(tx, ty) || 1;
      const nx = -ty / norm, ny = tx / norm;
      normals.push([nx, ny, tx / norm, ty / norm]);
      const u = i / Math.max(1, nS - 1);
      const hw = widthProfile(u);
      leftPts.push([spine[i][0] + nx * hw, spine[i][1] + ny * hw]);
      rightPts.unshift([spine[i][0] - nx * hw, spine[i][1] - ny * hw]);
    }
    const bodyPoly = leftPts.concat(rightPts);
    const headPt = spine[0];
    const tailPt = spine[nS - 1];

    // Translucent water shadow below carp
    const shadowPoly = bodyPoly.map(p => [p[0] + 10, p[1] + 14]);
    fenranRegion(api, layers.base, '锦鲤水影', shadowPoly, rng, {
      count: 42, colorFrom: '#4d5d4e', colorTo: '#7d8a72',
      gradFrom: headPt, gradTo: tailPt, alphaMin: 0.02, alphaMax: 0.06, dabScale: 1.2
    });

    // Translucent gossamer fins (胸鳍/腹鳍/尾鳍)
    const finSpecList = [
      { idx: Math.round(nS * 0.25), side: 1, angleOff: 0.92, len: widthProfile(0.25) * 1.48, spread: 0.62, label: '左胸鳍' },
      { idx: Math.round(nS * 0.25), side: -1, angleOff: -0.92, len: widthProfile(0.25) * 1.38, spread: 0.58, label: '右胸鳍' },
      { idx: Math.round(nS * 0.56), side: 1, angleOff: 1.05, len: widthProfile(0.56) * 0.92, spread: 0.48, label: '左腹鳍' },
      { idx: Math.round(nS * 0.56), side: -1, angleOff: -1.05, len: widthProfile(0.56) * 0.88, spread: 0.45, label: '右腹鳍' }
    ];

    finSpecList.forEach(fs => {
      const bp = spine[fs.idx];
      const [nx, ny, tx, ty] = normals[fs.idx];
      const baseAng = Math.atan2(ty, tx) + fs.angleOff * 1.1;
      const sx = bp[0] + nx * fs.side * widthProfile(fs.idx / nS) * 0.72;
      const sy = bp[1] + ny * fs.side * widthProfile(fs.idx / nS) * 0.72;
      const finPoly = [[sx, sy]];
      const rays = 14;
      for (let r = 0; r <= rays; r++) {
        const a = baseAng + lerp(-fs.spread, fs.spread, r / rays);
        const rr = fs.len * (0.72 + 0.28 * Math.sin((r / rays) * Math.PI));
        finPoly.push([sx + Math.cos(a) * rr, sy + Math.sin(a) * rr]);
      }
      const finSm = catmullRom(finPoly, 3, true);
      baimiaoStroke(api, layers.line, fs.label + '勾勒', finSm, {
        closed: true, raw: true, width: 0.65, color: PIGMENTS.inkPale, alpha: 0.62
      });
      baseShadePoly(api, layers.base, fs.label + '素纱底', finSm, {
        baseColor: PIGMENTS.clamWhite, baseAlpha: 0.35, shadeColor: PIGMENTS.silkCream, shadeAlpha: 0.22
      });
      // Fin rays
      const rayTargets = [];
      for (let r = 1; r < rays; r++) {
        const a = baseAng + lerp(-fs.spread * 0.9, fs.spread * 0.9, r / rays);
        const rr = fs.len * (0.72 + 0.26 * Math.sin((r / rays) * Math.PI));
        rayTargets.push([sx + Math.cos(a) * rr, sy + Math.sin(a) * rr, 0, 0]);
      }
      striationLines(api, layers.detail, fs.label + '鳍条', [sx, sy], rayTargets, {
        color: '#6e5c4e', alpha: 0.42, width: 0.52, batch: 2
      });
    });

    // Bilobed flowing caudal tail fin (尾鳍)
    const tailBase = normals[nS - 1];
    const tailLen = widthProfile(0.24) * 2.3;
    const tAng = Math.atan2(tailBase[3], tailBase[2]);
    const tailPoly = [[tailPt[0], tailPt[1]]];
    for (let r = 0; r <= 24; r++) {
      const f = r / 24;
      const a = tAng + lerp(-0.78, 0.78, f);
      const notch = 1 - 0.34 * Math.exp(-Math.pow((f - 0.5) * 4.5, 2));
      const rr = tailLen * notch * (0.82 + 0.18 * Math.sin(f * Math.PI));
      tailPoly.push([tailPt[0] + Math.cos(a) * rr, tailPt[1] + Math.sin(a) * rr]);
    }
    const tailSm = catmullRom(tailPoly, 4, true);
    baimiaoStroke(api, layers.line, '锦鲤尾鳍双勾', tailSm, { closed: true, raw: true, width: 0.72, color: PIGMENTS.inkPale, alpha: 0.68 });
    baseShadePoly(api, layers.base, '锦鲤尾鳍淡染', tailSm, {
      baseColor: '#f6edda', baseAlpha: 0.48, shadeColor: patrolSpots[0]?.color || PIGMENTS.vermilion, shadeAlpha: 0.28,
      gradFrom: tailPt, gradTo: [tailPt[0] + Math.cos(tAng) * tailLen, tailPt[1] + Math.sin(tAng) * tailLen]
    });
    const tailRays = [];
    for (let r = 1; r < 22; r++) {
      const f = r / 22;
      const a = tAng + lerp(-0.72, 0.72, f);
      const notch = 1 - 0.34 * Math.exp(-Math.pow((f - 0.5) * 4.5, 2));
      const rr = tailLen * notch * 0.94;
      tailRays.push([tailPt[0] + Math.cos(a) * rr, tailPt[1] + Math.sin(a) * rr, 0, 0]);
    }
    striationLines(api, layers.detail, '尾鳍丝纹', tailPt, tailRays, { color: '#7a5646', alpha: 0.44, width: 0.55, batch: 2 });

    // Body contour + gill cover (鳃盖) + barbels (触须)
    baimiaoStroke(api, layers.line, '鱼身双勾', bodyPoly, { closed: true, raw: true, width: 1.1, color: PIGMENTS.inkDeep, alpha: 0.84, style: 'yousi', chunkSize: 12 });
    baseShadePoly(api, layers.base, '锦鲤底色平涂', bodyPoly, {
      baseColor, baseAlpha: 0.82, shadeColor: '#b5a289', shadeAlpha: 0.34, gradFrom: leftPts[10], gradTo: spine[10]
    });

    // Organic irregular Koi pattern spots (红斑 / 墨斑 自然渐变晕染)
    for (let p = 0; p < patrolSpots.length; p++) {
      const sp = patrolSpots[p];
      const cIdx = clamp(Math.round(sp.u * (nS - 1)), 0, nS - 1);
      const center = spine[cIdx];
      const [nx, ny] = normals[cIdx];
      const sx = center[0] + nx * (sp.sideOffset || 0) * widthProfile(sp.u);
      const sy = center[1] + ny * (sp.sideOffset || 0) * widthProfile(sp.u);
      const rx = (sp.rx || 48);
      const ry = (sp.ry || 34);
      const spotPts = [];
      for (let k = 0; k < 18; k++) {
        const a = (k / 18) * TAU;
        const n = 0.65 + 0.58 * valueNoise2D(Math.cos(a) * 2.6 + p * 3.1, Math.sin(a) * 2.6 - p, 91);
        spotPts.push([sx + Math.cos(a) * rx * n, sy + Math.sin(a) * ry * n]);
      }
      const spotPoly = catmullRom(spotPts, 4, true);
      const spotBaseRgba = rgbaStr(sp.color, 0.36);
      const spotShadeRgba = rgbaStr(mixHex(sp.color, PIGMENTS.inkDeep, 0.22), 0.22);
      pushRaw(api, layers.wash, '锦鲤彩斑罩染', (c) => {
        c.save();
        c.beginPath();
        tracePolyPath(c, bodyPoly, true);
        c.clip();
        c.beginPath();
        tracePolyPath(c, spotPoly, true);
        c.fillStyle = spotBaseRgba;
        c.fill();
        c.fillStyle = spotShadeRgba;
        c.fill();
        c.restore();
      }, 'baseWash');
      const sb = polyBounds(spotPoly);
      for (let d = 0; d < 46; d++) {
        const px = sb.minX + rng() * sb.w;
        const py = sb.minY + rng() * sb.h;
        if (!pointInPoly(px, py, spotPoly) || !pointInPoly(px, py, bodyPoly)) continue;
        const dEdge = Math.min(minDistToPolyEdge(px, py, spotPoly), minDistToPolyEdge(px, py, bodyPoly));
        if (dEdge < 1.0) continue;
        const drx = clamp(6 + rng() * 18, 2.0, dEdge * 1.35);
        const dry = clamp(drx * (0.55 + rng() * 0.35), 1.4, dEdge * 1.35);
        const rot = rng() * Math.PI;
        const mixC = mixHex(sp.color, baseColor, rng() * 0.32);
        const a = 0.06 + rng() * 0.14;
        const scCore = rgbaStr(mixC, a);
        const scMid = rgbaStr(mixC, a * 0.45);
        const scEdge = rgbaStr(mixC, 0);
        pushRaw(api, layers.wash, '彩斑分染过渡', (c) => {
          c.save();
          c.translate(px, py); c.rotate(rot); c.scale(drx, dry);
          const g = c.createRadialGradient(0, 0, 0, 0, 0, 1);
          g.addColorStop(0, scCore); g.addColorStop(0.55, scMid); g.addColorStop(1, scEdge);
          c.fillStyle = g;
          c.beginPath(); c.arc(0, 0, 1, 0, TAU); c.fill();
          c.restore();
        }, 'fenran');
      }
    }

    // Imbricated crescent fish scale net fading organically toward belly (背实腹虚透视网鳞)
    const colStart = Math.round(nS * 0.21);
    const colEnd = Math.round(nS * 0.94);
    for (let i = colStart; i < colEnd; i += 2) {
      const u = i / (nS - 1);
      const hw = widthProfile(u);
      const [nx, ny, tx, ty] = normals[i];
      const ang = Math.atan2(ty, tx);
      const rows = Math.max(4, Math.round(hw / 5.8));
      for (let r = -rows + 1; r <= rows - 1; r += 1) {
        const rFrac = r / rows;
        const lat = Math.sin(rFrac * Math.PI * 0.45) * hw * 0.88 + ((i % 4 === 0) ? 0 : hw / (rows * 2.2));
        const cx = spine[i][0] + nx * lat;
        const cy = spine[i][1] + ny * lat;
        if (!pointInPoly(cx, cy, bodyPoly)) continue;
        const dorsalFade = clamp(1 - Math.abs(rFrac) * 0.82, 0.12, 0.72);
        const sr = clamp((hw / rows) * 0.95 * (1 - Math.abs(rFrac) * 0.25), 3.8, 10.0);
        const arcColor = rgbaStr(scaleRimColor, dorsalFade * 0.72);
        const hiColor = goldTrim && Math.abs(rFrac) <= 0.45 && rng() > 0.35
          ? rgbaStr(PIGMENTS.goldPale, dorsalFade * 0.55)
          : rgbaStr(PIGMENTS.clamWhite, dorsalFade * 0.45);

        pushRaw(api, layers.detail, '网鳞分染勾勒', (c) => {
          c.save();
          c.strokeStyle = arcColor;
          c.lineWidth = 0.58;
          c.beginPath();
          c.arc(cx, cy, sr, ang - 1.1, ang + 1.1);
          c.stroke();
          c.strokeStyle = hiColor;
          c.lineWidth = 0.48;
          c.beginPath();
          c.arc(cx - tx * 0.8, cy - ty * 0.8, sr * 0.82, ang - 0.8, ang + 0.8);
          c.stroke();
          c.restore();
        }, 'scale');
      }
    }

    // Gill line + expressive carp eye + sensory barbels
    const gillIdx = Math.round(nS * 0.19);
    const [gnx, gny] = normals[gillIdx];
    const ghw = widthProfile(0.19);
    const gillCurve = [
      [spine[gillIdx][0] + gnx * ghw * 0.9, spine[gillIdx][1] + gny * ghw * 0.9],
      [spine[gillIdx + 2][0], spine[gillIdx + 2][1]],
      [spine[gillIdx][0] - gnx * ghw * 0.9, spine[gillIdx][1] - gny * ghw * 0.9]
    ];
    baimiaoStroke(api, layers.detail, '鳃盖复勒', gillCurve, { width: 1.05, color: PIGMENTS.inkDeep, alpha: 0.78 });

    const eyeIdx = Math.round(nS * 0.08);
    const [enx, eny, etx, ety] = normals[eyeIdx];
    const ehw = widthProfile(0.08) * 0.72;
    [-1, 1].forEach(side => {
      const ex = spine[eyeIdx][0] + enx * side * ehw;
      const ey = spine[eyeIdx][1] + eny * side * ehw;
      pushRaw(api, layers.highlight, '锦鲤点睛', (c) => {
        c.save();
        c.fillStyle = rgbaStr(PIGMENTS.gooseYellow, 0.9);
        c.beginPath(); c.arc(ex, ey, 4.2, 0, TAU); c.fill();
        c.fillStyle = rgbaStr(PIGMENTS.inkDeep, 0.95);
        c.beginPath(); c.arc(ex, ey, 2.7, 0, TAU); c.fill();
        c.fillStyle = '#ffffff';
        c.beginPath(); c.arc(ex - 1.0, ey - 1.0, 1.0, 0, TAU); c.fill();
        c.restore();
      }, 'eye');
    });

    // Barbels
    [-1, 1].forEach(side => {
      const [hnx, hny, htx, hty] = normals[0];
      const bx0 = headPt[0] + hnx * side * 9;
      const by0 = headPt[1] + hny * side * 9;
      const barb = [
        [bx0, by0],
        [bx0 + htx * 10 + hnx * side * 12, by0 + hty * 10 + hny * side * 12],
        [bx0 + htx * 18 + hnx * side * 20, by0 + hty * 18 + hny * side * 20]
      ];
      baimiaoStroke(api, layers.detail, '鲤须勾勒', barb, { width: 0.75, color: PIGMENTS.inkDeep, alpha: 0.76, style: 'dingtou' });
    });
  }

  // =========================================================================
  // 7. BUDGET CALIBRATOR & LAYER ORDER FINALIZER (STRICT 5,000 - 10,000)
  // =========================================================================
  function finalizeGongbiBudget(api, rng, W, H, opts = {}) {
    const minTarget = opts.minTarget != null ? opts.minTarget : 7000;
    const maxTarget = opts.maxTarget != null ? opts.maxTarget : 9600;
    const target = clamp(opts.target || Math.round((minTarget + maxTarget) * 0.5), minTarget, maxTarget);
    const focusX = opts.focusX != null ? opts.focusX : W * 0.5;
    const focusY = opts.focusY != null ? opts.focusY : H * 0.45;
    const focusR = opts.focusR != null ? opts.focusR : Math.min(W, H) * 0.35;
    const patinaHex = opts.patinaColor || PIGMENTS.silkTea;
    const haloHex = opts.haloColor || PIGMENTS.clamWhite;

    // Step 1: Sort structural strokes strictly into Layer 1 -> 2 -> 3 -> 4 -> 5
    api.sortByLayer();

    const list = api.strokes;
    if (list.length > maxTarget) {
      // Evenly thin non-critical washes while keeping all contours, fule, eyes, lifen, gold, stamens!
      const keepProtected = new Set(['contour', 'vein', 'simao', 'hair', 'barb', 'scale', 'gold', 'stamen', 'lifen', 'eye', 'dew', 'moss']);
      const excess = list.length - maxTarget;
      const removableIndices = [];
      for (let i = 0; i < list.length; i++) {
        if (!keepProtected.has(list[i].draw._gbTag)) removableIndices.push(i);
      }
      if (removableIndices.length > 0) {
        const dropSet = new Set();
        const stride = Math.max(1, removableIndices.length / Math.min(excess, removableIndices.length));
        for (let k = 0; k < excess && Math.floor(k * stride) < removableIndices.length; k++) {
          dropSet.add(removableIndices[Math.floor(k * stride)]);
        }
        const filtered = [];
        for (let i = 0; i < list.length; i++) {
          if (!dropSet.has(i)) filtered.push(list[i]);
        }
        list.length = 0;
        for (let i = 0; i < filtered.length; i++) list.push(filtered[i]);
      }
      // If still over maxTarget after wash thinning, decimate evenly from tail of detail barbs
      while (list.length > maxTarget) {
        const idx = Math.floor(rng() * Math.max(1, list.length * 0.85));
        list.splice(idx, 1);
      }
    } else if (list.length < target) {
      // Enrich antique silk atmospheric micro-glazes (外晕托染 / 绢丝包浆微晕) smoothly in Layer 2 & 3
      const needed = target - list.length;
      for (let i = 0; i < needed; i++) {
        const isSilkGrain = (i % 3 === 0);
        if (isSilkGrain) {
          // Subtle aged silk weave fiber tint (ultra-soft patina, preserving figure crispness)
          const x = rng() * W;
          const y = rng() * H;
          const horiz = rng() > 0.48;
          const len = 14 + rng() * 44;
          const dist = Math.hypot(x - focusX, y - focusY);
          const hex = dist < focusR * 0.72 && opts.haloLight ? haloHex : (rng() > 0.5 ? patinaHex : PIGMENTS.silkAmber);
          const a = 0.014 + rng() * 0.018;
          const col = rgbaStr(hex, a);
          pushRaw(api, 2, '古绢肌理丝晕', (c) => {
            c.save();
            c.strokeStyle = col;
            c.lineWidth = 0.6;
            c.beginPath();
            c.moveTo(x, y);
            c.lineTo(horiz ? x + len : x, horiz ? y : y + len);
            c.stroke();
            c.restore();
          }, 'patina');
        } else {
          // Delicate alum-mineral ambient water glaze (三矾九染微晕)
          const x = rng() * W;
          const y = rng() * H;
          const dist = Math.hypot(x - focusX, y - focusY);
          const near = dist < focusR;
          const hex = (near && opts.haloLight) ? haloHex : (dist > focusR * 0.9 ? patinaHex : mixHex(patinaHex, PIGMENTS.teaGreen, 0.35));
          const rx = 18 + rng() * 46;
          const ry = 12 + rng() * 34;
          const rot = (rng() - 0.5) * Math.PI;
          const a = 0.015 + rng() * 0.026;
          const colCenter = rgbaStr(hex, a);
          const colMid = rgbaStr(hex, a * 0.45);
          const colEdge = rgbaStr(hex, 0);
          pushRaw(api, 2, '烘染微晕', (c) => {
            c.save();
            c.translate(x, y);
            c.rotate(rot);
            c.scale(rx, ry);
            const g = c.createRadialGradient(0, 0, 0, 0, 0, 1);
            g.addColorStop(0, colCenter);
            g.addColorStop(0.55, colMid);
            g.addColorStop(1, colEdge);
            c.fillStyle = g;
            c.beginPath(); c.arc(0, 0, 1, 0, TAU); c.fill();
            c.restore();
          }, 'groundWash');
        }
      }
      api.sortByLayer();
    }

    // Appended LAST in Layer 5 so calligraphy & seal never go beneath Layer 2-5 washes!
    if (opts.inscription) {
      const ins = opts.inscription;
      api.inscription(5, '题款书印', ins.x, ins.y, ins.text, ins.opts || { size: 22, color: '#332820', alpha: 0.84 });
    }
    if (opts.seal) {
      const sl = opts.seal;
      api.seal(5, '朱文钤印', sl.x, sl.y, sl.text, sl.opts || { size: 36, color: '#9c2d23' });
    }
  }

  window.Code2PaintGongbiMaster = {
    TAU,
    PIGMENTS,
    clamp,
    lerp,
    smoothstep,
    makeRng,
    valueNoise2D,
    fbm2,
    hexToRgb,
    mixHex,
    rgbaStr,
    catmullRom,
    quadPoint,
    cubicPoint,
    polyBounds,
    pointInPoly,
    minDistToPolyEdge,
    minDistToCurve,
    tracePolyPath,
    setOccluders,
    isPointOccluded,
    pushRaw,
    baimiaoStroke,
    silkHaloGround,
    baseShadePoly,
    fenranRegion,
    striationLines,
    simaoTract,
    flowHairStrands,
    drawFeatherPlume,
    goldFiligreeStroke,
    lifenStamens,
    drawDewdrop,
    buildLeafGeometry,
    drawGongbiLeaf,
    drawFlowerPetal,
    drawPlumBlossom,
    drawTaihuRock,
    drawAuspiciousCloud,
    drawKoiCarp,
    finalizeGongbiBudget
  };
})();
