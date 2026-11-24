(function () {
  'use strict';

  const TAU = Math.PI * 2;
  const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  const lerp = (a, b, t) => a + (b - a) * t;
  const smooth = (t) => { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };

  function mulberry32(a) {
    let s = a >>> 0;
    return function () {
      s = (s + 0x6D2B79F5) | 0;
      let t = Math.imul(s ^ (s >>> 15), 1 | s);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function makeNoise(seed) {
    const rand = mulberry32(seed || 0x13579BDF);
    const perm = new Uint8Array(512);
    const vals = new Float32Array(256);
    for (let i = 0; i < 256; i++) {
      perm[i] = i;
      vals[i] = rand();
    }
    for (let i = 255; i > 0; i--) {
      const j = (rand() * (i + 1)) | 0;
      const tmp = perm[i];
      perm[i] = perm[j];
      perm[j] = tmp;
    }
    for (let i = 0; i < 256; i++) perm[256 + i] = perm[i];

    function noise2(x, y) {
      const xi = Math.floor(x), yi = Math.floor(y);
      const xf = x - xi, yf = y - yi;
      const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
      const X = xi & 255, Y = yi & 255;
      const a = vals[perm[perm[X] + Y]];
      const b = vals[perm[perm[X + 1] + Y]];
      const c = vals[perm[perm[X] + Y + 1]];
      const d = vals[perm[perm[X + 1] + Y + 1]];
      return lerp(lerp(a, b, u), lerp(c, d, u), v);
    }

    function fbm(x, y, octaves = 4) {
      let sum = 0, amp = 0.5, freq = 1, norm = 0;
      for (let o = 0; o < octaves; o++) {
        sum += amp * noise2(x * freq, y * freq);
        norm += amp;
        amp *= 0.5;
        freq *= 2.03;
      }
      return sum / norm;
    }

    function ridgedFbm(x, y, octaves = 4) {
      let sum = 0, amp = 0.5, freq = 1, norm = 0;
      for (let o = 0; o < octaves; o++) {
        let n = 1 - Math.abs(noise2(x * freq, y * freq) * 2 - 1);
        n = n * n;
        sum += amp * n;
        norm += amp;
        amp *= 0.52;
        freq *= 2.07;
      }
      return sum / norm;
    }

    return { rand, noise2, fbm, ridgedFbm };
  }

  function rampColor(stops, t) {
    const n = stops.length - 1;
    const f = clamp(t, 0, 1) * n;
    const i = Math.min(n - 1, Math.floor(f));
    const u = f - i;
    return [
      lerp(stops[i][0], stops[i + 1][0], u),
      lerp(stops[i][1], stops[i + 1][1], u),
      lerp(stops[i][2], stops[i + 1][2], u)
    ];
  }

  function mix3(a, b, t) {
    return [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
  }

  // Zorn 4-pigment gamut harmonizer (Titanium White, Yellow Ochre, Vermilion, Ivory Black)
  function projectToZorn(r, g, b) {
    const l = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    const warmth = clamp((r - b) / 170, 0, 1);
    const redness = clamp((r - g * 0.88 - b * 0.12) / 140, 0, 1);
    const ochre = [208 * Math.pow(l, 0.72), 146 * Math.pow(l, 0.84), 68 * Math.pow(l, 1.08)];
    const verm = [205 * Math.pow(l, 0.7), 62 * Math.pow(l, 0.95), 44 * Math.pow(l, 1.05)];
    const slate = [l * 238 - warmth * 12, l * 234 - warmth * 6, l * 230 + (1 - warmth) * 8];
    const warmCol = mix3(ochre, verm, redness * 0.75);
    const out = mix3(slate, warmCol, smooth(warmth * 1.15));
    return [clamp(out[0], 0, 255), clamp(out[1], 0, 255), clamp(out[2], 0, 255)];
  }

  // ===========================================================================
  // 1. HYBRID 3D ANALYTICAL + CANVAS2D REFERENCE SCENE ENGINE
  // ===========================================================================
  function createScene(W, H, seed, sceneOpts = {}) {
    const maxDim = (sceneOpts && sceneOpts.maxDim) || 340;
    const scale = maxDim / Math.max(W, H);
    const GW = Math.max(140, Math.round(W * scale));
    const GH = Math.max(140, Math.round(H * scale));
    const N = makeNoise(seed || 0x20261124);

    const buf = new Uint8ClampedArray(GW * GH * 4);
    for (let i = 3; i < buf.length; i += 4) buf[i] = 255;

    const canvas = document.createElement('canvas');
    canvas.width = GW;
    canvas.height = GH;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    function flushToCanvas() {
      ctx.putImageData(new ImageData(buf, GW, GH), 0, 0);
    }

    function syncFromCanvas() {
      const data = ctx.getImageData(0, 0, GW, GH).data;
      buf.set(data);
    }

    function draw2D(fn) {
      flushToCanvas();
      ctx.save();
      ctx.scale(scale, scale);
      fn(ctx, W, H, N);
      ctx.restore();
      syncFromCanvas();
    }

    function blendPx(gx, gy, r, g, b, a) {
      if (gx < 0 || gy < 0 || gx >= GW || gy >= GH || a <= 0.002) return;
      const idx = (gy * GW + gx) << 2;
      if (a >= 0.996) {
        buf[idx] = r; buf[idx + 1] = g; buf[idx + 2] = b; buf[idx + 3] = 255;
      } else {
        const ia = 1 - a;
        buf[idx] = buf[idx] * ia + r * a;
        buf[idx + 1] = buf[idx + 1] * ia + g * a;
        buf[idx + 2] = buf[idx + 2] * ia + b * a;
        buf[idx + 3] = 255;
      }
    }

    function sampleRef(x, y) {
      const gx = clamp(Math.round(x * scale), 0, GW - 1);
      const gy = clamp(Math.round(y * scale), 0, GH - 1);
      const idx = (gy * GW + gx) << 2;
      return [buf[idx], buf[idx + 1], buf[idx + 2]];
    }

    // --- 3D Wall, Perspective Tabletop & Soft Contact Cast Shadows ---
    function shadeBackdropWallTable(opts = {}) {
      const horizonY = opts.horizonY == null ? H * 0.68 : opts.horizonY;
      const wallLit = opts.wallLit || [72, 56, 42];
      const wallMid = opts.wallMid || [36, 26, 19];
      const wallDark = opts.wallDark || [14, 10, 8];
      const lx = opts.lightX != null ? opts.lightX : W * 0.24;
      const ly = opts.lightY != null ? opts.lightY : H * 0.24;
      const tType = opts.tableType || 'wood';
      const tLit = opts.tableLit || [138, 98, 58];
      const tMid = opts.tableMid || [78, 52, 31];
      const tDark = opts.tableDark || [26, 17, 11];
      const edgeY = opts.tableEdgeY || (H * 0.925);
      const shadows = opts.castShadows || [];

      for (let gy = 0; gy < GH; gy++) {
        const y = gy / scale;
        const isTable = horizonY != null && y >= horizonY;
        for (let gx = 0; gx < GW; gx++) {
          const x = gx / scale;
          const idx = (gy * GW + gx) << 2;
          let col;
          if (!isTable) {
            const dist = Math.hypot((x - lx) / (W * 0.62), (y - ly) / (H * 0.58));
            let v = Math.exp(-dist * dist * 1.15) * 0.92;
            const n = (N.fbm(x * 0.0055, y * 0.0055, 3) - 0.5) * (opts.wallNoise == null ? 0.12 : opts.wallNoise);
            v = clamp(v + n - 0.14 * (y / H) - 0.12 * clamp((x - W * 0.55) / (W * 0.45), 0, 1), 0, 1);
            col = rampColor([wallDark, wallMid, wallLit], v);
          } else {
            const depth = clamp((y - horizonY) / Math.max(1, H - horizonY), 0, 1);
            let v = 0.82 - 0.34 * (x / W) - 0.18 * depth;
            if (tType === 'wood') {
              const grain = N.fbm(x * 0.006 + N.noise2(x * 0.02, y * 0.01) * 0.4, (y - horizonY) * 0.048, 3);
              const plank = Math.sin((y - horizonY) * 0.055) * 0.03;
              v += (grain - 0.5) * 0.24 + plank;
            } else if (tType === 'linen') {
              const weave = (Math.sin(x * 0.45) + Math.sin(y * 0.45)) * 0.025;
              const fold = N.fbm(x * 0.008, y * 0.008, 3) - 0.5;
              v += weave + fold * 0.14;
            } else {
              const stone = N.fbm(x * 0.012, y * 0.018, 3) - 0.5;
              v += stone * 0.18;
            }
            if (opts.hasBevel !== false && y > edgeY) {
              const edgeT = clamp((y - edgeY) / Math.max(1, H - edgeY), 0, 1);
              v = edgeT < 0.25 ? v * 0.95 : (edgeT < 0.55 ? v * 0.52 : v * 0.28);
            }
            col = rampColor([tDark, tMid, tLit], v);
          }

          // Smooth elliptical cast shadows with ambient occlusion contact core
          for (let s = 0; s < shadows.length; s++) {
            const sh = shadows[s];
            const rot = sh.rot || 0;
            const c = Math.cos(rot), si = Math.sin(rot);
            const dx = x - sh.cx, dy = y - sh.cy;
            const lxS = dx * c + dy * si, lyS = -dx * si + dy * c;
            const r2 = (lxS * lxS) / (sh.rx * sh.rx) + (lyS * lyS) / (sh.ry * sh.ry);
            if (r2 < 1.6) {
              const fall = Math.exp(-r2 * 1.9) * (sh.strength == null ? 0.72 : sh.strength);
              const sCol = sh.col || [14, 10, 8];
              col = mix3(col, sCol, clamp(fall, 0, 0.92));
            }
          }
          buf[idx] = clamp(col[0], 0, 255);
          buf[idx + 1] = clamp(col[1], 0, 255);
          buf[idx + 2] = clamp(col[2], 0, 255);
          buf[idx + 3] = 255;
        }
      }
    }

    // --- 3D Volumetric Sky, Scattering Sun/Moon & Self-Shadowed Clouds ---
    function shadeSkyAndClouds(opts = {}) {
      const yEnd = opts.horizonY != null ? opts.horizonY : H * 0.56;
      const skyTop = opts.skyTop || [38, 62, 118];
      const skyMid = opts.skyMid || [124, 152, 198];
      const skyHorizon = opts.skyHorizon || [236, 206, 172];
      const sunX = opts.sunX != null ? opts.sunX : W * 0.58;
      const sunY = opts.sunY != null ? opts.sunY : yEnd * 0.78;
      const sunR = opts.sunR || 0;
      const sunCol = opts.sunCol || [255, 248, 224];
      const glowR = opts.glowR || W * 0.34;
      const glowCol = opts.glowCol || [255, 208, 134];
      const glowStr = opts.glowStrength == null ? 0.65 : opts.glowStrength;
      const cloudCover = opts.cloudCover == null ? 0.55 : opts.cloudCover;
      const cloudLit = opts.cloudLitCol || [252, 242, 226];
      const cloudDark = opts.cloudDarkCol || [88, 92, 118];
      const cloudBot = opts.cloudBot != null ? opts.cloudBot : yEnd * 0.92;
      const cScale = opts.cloudScale || 0.0052;
      const gyMax = Math.min(GH - 1, Math.ceil(yEnd * scale));

      for (let gy = 0; gy <= gyMax; gy++) {
        const y = gy / scale;
        const fy = clamp(y / Math.max(1, yEnd), 0, 1);
        const skyBase = fy < 0.5
          ? mix3(skyTop, skyMid, smooth(fy * 2))
          : mix3(skyMid, skyHorizon, smooth((fy - 0.5) * 2));

        for (let gx = 0; gx < GW; gx++) {
          const x = gx / scale;
          const idx = (gy * GW + gx) << 2;
          let col = skyBase.slice();

          // Mie forward scatter halo around sun/moon
          if (glowStr > 0) {
            const dSun = Math.hypot((x - sunX) / glowR, (y - sunY) / (glowR * 0.72));
            const glow = Math.exp(-dSun * dSun * 1.6) * glowStr;
            col = mix3(col, glowCol, clamp(glow, 0, 0.94));
          }

          // Volumetric FBM clouds with directional self-shadowing toward (sunX, sunY)
          if (cloudCover > 0.02 && y < cloudBot) {
            const dxS = sunX - x, dyS = sunY - y;
            const dLen = Math.max(1, Math.hypot(dxS, dyS));
            const ux = (dxS / dLen) * 24, uy = (dyS / dLen) * 24;
            const nBase = N.fbm(x * cScale + 3.1, y * cScale * 1.45 + 1.7, 4);
            const nSun = N.fbm((x + ux) * cScale + 3.1, (y + uy) * cScale * 1.45 + 1.7, 3);
            const altMask = 1 - smooth(clamp((y - cloudBot * 0.65) / (cloudBot * 0.35), 0, 1));
            const density = clamp((nBase - (1 - cloudCover) * 0.75) * 2.5 * altMask, 0, 1);
            if (density > 0.02) {
              const selfLit = clamp(0.54 + (nBase - nSun) * 3.8 + (1 - fy) * 0.14, 0, 1);
              const rimSun = Math.exp(-Math.hypot(x - sunX, y - sunY) / (glowR * 0.9));
              let cCloud = mix3(cloudDark, cloudLit, smooth(selfLit));
              cCloud = mix3(cCloud, glowCol, rimSun * 0.45);
              col = mix3(col, cCloud, smooth(density) * (opts.cloudAlpha == null ? 0.88 : opts.cloudAlpha));
            }
          }

          // Crisp solar/lunar core disc
          if (sunR > 0) {
            const d = Math.hypot(x - sunX, y - sunY);
            if (d < sunR * 1.4) {
              const core = 1 - smooth(clamp((d - sunR * 0.72) / (sunR * 0.65), 0, 1));
              col = mix3(col, sunCol, core);
            }
          }

          buf[idx] = clamp(col[0], 0, 255);
          buf[idx + 1] = clamp(col[1], 0, 255);
          buf[idx + 2] = clamp(col[2], 0, 255);
          buf[idx + 3] = 255;
        }
      }
    }

    // --- 3D Ridged-FBM Alpine Mountain Range ---
    function shadeMountainRange(opts = {}) {
      const baseY = opts.baseY != null ? opts.baseY : H * 0.56;
      const ridgePts = opts.peaks || [[0, baseY - 40], [W * 0.35, baseY - 240], [W * 0.68, baseY - 190], [W, baseY - 30]];
      const lx = opts.sunDirX != null ? opts.sunDirX : -0.65;
      const ly = opts.sunDirY != null ? opts.sunDirY : -0.45;
      const lz = 0.55;
      const lLen = Math.hypot(lx, ly, lz);
      const ldx = lx / lLen, ldy = ly / lLen, ldz = lz / lLen;
      const rockLit = opts.rockLit || [136, 122, 114];
      const rockDark = opts.rockDark || [48, 58, 86];
      const snowLit = opts.snowLit || [252, 240, 222];
      const snowShadow = opts.snowShadow || [98, 124, 174];
      const snowLine = opts.snowLine == null ? 0.38 : opts.snowLine;
      const mistCol = opts.mistCol || [182, 194, 212];
      const mistStr = opts.mistStrength == null ? 0.42 : opts.mistStrength;
      const rAmp = opts.ridgeAmp || 55;
      const rFreq = opts.ridgeFreq || 0.008;

      function sampleRidgeY(x) {
        for (let i = 0; i < ridgePts.length - 1; i++) {
          if (x <= ridgePts[i + 1][0] || i === ridgePts.length - 2) {
            const span = Math.max(1, ridgePts[i + 1][0] - ridgePts[i][0]);
            const t = clamp((x - ridgePts[i][0]) / span, 0, 1);
            return lerp(ridgePts[i][1], ridgePts[i + 1][1], t);
          }
        }
        return baseY;
      }

      // Compute terrain heightfield above baseY
      const hMap = new Float32Array(GW * GH);
      let maxH = 1;
      for (let gx = 0; gx < GW; gx++) {
        const x = gx / scale;
        const rBaseY = sampleRidgeY(x);
        const ridgeJag = (N.ridgedFbm(x * rFreq + 1.4, 2.3, 4) - 0.35) * rAmp;
        const rY = rBaseY - ridgeJag;
        const peakH = Math.max(1, baseY - rY);
        if (peakH > maxH) maxH = peakH;
        for (let gy = 0; gy < GH; gy++) {
          const y = gy / scale;
          if (y >= rY && y <= baseY) {
            const frac = (y - rY) / peakH; // 0 at peak ridge, 1 at foot
            const relief = N.ridgedFbm(x * rFreq * 1.4, y * rFreq * 1.6, 4);
            // Ridge spine profile curves naturally downward with rocky spurs
            const h = (1 - frac) * (0.65 + 0.55 * relief);
            hMap[gy * GW + gx] = Math.max(0.01, h * peakH * 0.5);
          }
        }
      }

      for (let gy = 1; gy < GH - 1; gy++) {
        const y = gy / scale;
        if (y > baseY) continue;
        for (let gx = 1; gx < GW - 1; gx++) {
          const idxM = gy * GW + gx;
          const h = hMap[idxM];
          if (h <= 0) continue;
          const dhx = (hMap[idxM + 1] - hMap[idxM - 1]) * 0.72;
          const dhy = (hMap[idxM + GW] - hMap[idxM - GW]) * 0.72;
          const nLen = Math.hypot(dhx, dhy, 1);
          const nx = -dhx / nLen, ny = -dhy / nLen, nz = 1 / nLen;
          const dot = clamp(nx * ldx + ny * ldy + nz * ldz, 0, 1);
          const elevNorm = clamp((baseY - y) / Math.max(1, maxH), 0, 1);
          const slopeSteep = Math.hypot(dhx, dhy);
          const isSnow = elevNorm > snowLine && slopeSteep < (opts.snowSlopeMax || 1.65);

          let col = isSnow
            ? mix3(snowShadow, snowLit, smooth(clamp(dot * 1.35 - 0.15, 0, 1)))
            : mix3(rockDark, rockLit, smooth(clamp(dot * 1.25, 0, 1)));

          // Valley aerial perspective haze near mountain foot
          const mist = smooth(clamp(1 - elevNorm * 1.6, 0, 1)) * mistStr;
          col = mix3(col, mistCol, mist);
          blendPx(gx, gy, col[0], col[1], col[2], 1);
        }
      }
    }

    // --- 3D Fresnel Ocean & Glittering Water Path ---
    function shadeOcean(opts = {}) {
      const yTop = opts.yTop != null ? opts.yTop : H * 0.52;
      const yBot = opts.yBot != null ? opts.yBot : H;
      const cShallow = opts.seaTop || [56, 108, 148];
      const cMid = opts.seaMid || [26, 62, 98];
      const cDeep = opts.seaBot || [14, 34, 62];
      const sunX = opts.sunX != null ? opts.sunX : W * 0.55;
      const sunY = opts.sunY != null ? opts.sunY : yTop - 30;
      const glCol = opts.glitterCol || [255, 234, 152];
      const glSpread = opts.glitterSpread || W * 0.16;
      const waveFreq = opts.waveScale || 0.025;
      const arch = opts.crestWave || null;

      const gy0 = Math.max(0, Math.floor(yTop * scale));
      const gy1 = Math.min(GH - 1, Math.ceil(yBot * scale));
      for (let gy = gy0; gy <= gy1; gy++) {
        const y = gy / scale;
        const depth = clamp((y - yTop) / Math.max(1, yBot - yTop), 0, 1);
        const base = depth < 0.5
          ? mix3(cShallow, cMid, depth * 2)
          : mix3(cMid, cDeep, (depth - 0.5) * 2);

        for (let gx = 0; gx < GW; gx++) {
          const x = gx / scale;
          const perspectiveY = (y - yTop) / (0.18 + depth * 1.8);
          const wx = x * waveFreq * (1.2 - depth * 0.45);
          const wy = perspectiveY * waveFreq * 3.8;
          const n1 = N.fbm(wx + 2.1, wy + 5.3, 3);
          const n2 = N.fbm(wx + 2.1, wy + 5.65, 3);
          const tiltY = (n2 - n1) * 14.0;
          const skyBounce = clamp(0.45 + tiltY * 1.6, 0, 1);

          let col = mix3(base, cShallow, skyBounce * (opts.skyMix == null ? 0.35 : opts.skyMix));

          // Sun/moon specular glitter funnel
          if (opts.hasGlitter !== false) {
            const funnelW = Math.max(18, glSpread * (0.18 + depth * 0.85));
            const dxPath = Math.abs(x - sunX);
            const pathMask = Math.exp(-(dxPath * dxPath) / (2 * funnelW * funnelW * 0.45));
            const glint = clamp((n1 - 0.48) * 3.5 + tiltY * 1.8, 0, 1);
            const spec = smooth(glint) * pathMask * (opts.glitterStrength == null ? 0.92 : opts.glitterStrength);
            col = mix3(col, glCol, spec);
          }

          // Optional translucent backlit breaking storm wave arch (Aivazovsky)
          if (arch) {
            const dxW = (x - arch.cx) / arch.rx;
            const dyW = (y - arch.cy) / arch.ry;
            const dW = Math.hypot(dxW, dyW * 1.35);
            if (dW < 1.15) {
              const subSurf = Math.exp(-Math.pow((dW - 0.45) / 0.38, 2)) * clamp(1 - dyW * 0.7, 0, 1);
              col = mix3(col, arch.colCore || [48, 178, 148], subSurf * 0.85);
              const lipD = Math.abs(dyW + 0.32 - 0.18 * dxW * dxW + (n1 - 0.5) * 0.22);
              if (lipD < 0.14 && Math.abs(dxW) < 0.95) {
                const foam = (1 - lipD / 0.14) * clamp(1.1 - Math.abs(dxW), 0, 1);
                col = mix3(col, arch.colFoam || [246, 250, 246], foam * 0.92);
              }
            }
          }

          blendPx(gx, gy, col[0], col[1], col[2], opts.alpha == null ? 1 : opts.alpha);
        }
      }
    }

    // --- 3D Sculpted Drapery / Curtain / Folded Cloth ---
    function shadeDrapery(opts = {}) {
      const poly = opts.poly || [
        [opts.x0 || 0, opts.y0 || 0], [opts.x1 || W * 0.4, opts.y0 || 0],
        [opts.x1 || W * 0.4, opts.y1 || H * 0.5], [opts.x0 || 0, opts.y1 || H * 0.5]
      ];
      const colLit = opts.colLit || [176, 48, 52];
      const colMid = opts.colMid || [112, 24, 30];
      const colDark = opts.colDark || [34, 8, 12];
      const freq = opts.foldFreq || 0.045;
      const foldAng = opts.foldAngle == null ? 0.18 : opts.foldAngle;
      const feather = opts.feather || 12;

      let minX = W, maxX = 0, minY = H, maxY = 0;
      for (const p of poly) {
        if (p[0] < minX) minX = p[0]; if (p[0] > maxX) maxX = p[0];
        if (p[1] < minY) minY = p[1]; if (p[1] > maxY) maxY = p[1];
      }

      function inside(x, y) {
        let ins = false;
        for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
          const xi = poly[i][0], yi = poly[i][1], xj = poly[j][0], yj = poly[j][1];
          if (((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) ins = !ins;
        }
        return ins;
      }

      function edgeDist(x, y) {
        let best = 1e9;
        for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
          const x1 = poly[j][0], y1 = poly[j][1], x2 = poly[i][0], y2 = poly[i][1];
          const dx = x2 - x1, dy = y2 - y1, l2 = dx * dx + dy * dy;
          const t = l2 > 1e-4 ? clamp(((x - x1) * dx + (y - y1) * dy) / l2, 0, 1) : 0;
          const d = Math.hypot(x - (x1 + dx * t), y - (y1 + dy * t));
          if (d < best) best = d;
        }
        return best;
      }

      const gx0 = Math.max(0, Math.floor((minX - feather) * scale));
      const gx1 = Math.min(GW - 1, Math.ceil((maxX + feather) * scale));
      const gy0 = Math.max(0, Math.floor((minY - feather) * scale));
      const gy1 = Math.min(GH - 1, Math.ceil((maxY + feather) * scale));
      const ca = Math.cos(foldAng), sa = Math.sin(foldAng);

      for (let gy = gy0; gy <= gy1; gy++) {
        const y = gy / scale;
        for (let gx = gx0; gx <= gx1; gx++) {
          const x = gx / scale;
          if (!inside(x, y)) continue;
          const eD = edgeDist(x, y);
          const alpha = (opts.alpha == null ? 1 : opts.alpha) * smooth(clamp(eD / feather, 0, 1));
          const u = x * ca + y * sa;
          const v = -x * sa + y * ca;
          const wave = Math.sin(u * freq + N.fbm(x * 0.008, y * 0.008, 3) * 3.4);
          const waveNext = Math.sin((u + 4) * freq + N.fbm((x + 4) * 0.008, y * 0.008, 3) * 3.4);
          const slope = (waveNext - wave) * 2.4;
          const lightBase = clamp(0.56 - 0.35 * (x - minX) / Math.max(1, maxX - minX) + wave * 0.24 - slope * 0.28, 0, 1);
          const col = rampColor([colDark, colMid, colLit], lightBase);
          blendPx(gx, gy, col[0], col[1], col[2], alpha);
        }
      }
    }

    // --- 3D Fruit Shader (Apple, Pear, Lemon, Peach, Pomegranate) ---
    function shadeFruit3D(opts) {
      const { cx, cy, rx, ry } = opts;
      const kind = opts.kind || 'apple';
      const colLit = opts.colLit || [236, 178, 108];
      const colMid = opts.colMid || [196, 54, 34];
      const colShadow = opts.colShadow || [56, 16, 18];
      const bounceCol = opts.bounceCol || [186, 128, 86];
      const specCol = opts.specCol || [255, 248, 224];
      const ld = opts.lightDir || [-0.62, -0.58, 0.52];
      const lLen = Math.hypot(ld[0], ld[1], ld[2]);
      const lx = ld[0] / lLen, ly = ld[1] / lLen, lz = ld[2] / lLen;
      const pad = 1.12;
      const gx0 = Math.max(0, Math.floor((cx - rx * pad) * scale));
      const gx1 = Math.min(GW - 1, Math.ceil((cx + rx * pad) * scale));
      const gy0 = Math.max(0, Math.floor((cy - ry * pad) * scale));
      const gy1 = Math.min(GH - 1, Math.ceil((cy + ry * pad) * scale));

      for (let gy = gy0; gy <= gy1; gy++) {
        const y = gy / scale;
        for (let gx = gx0; gx <= gx1; gx++) {
          const x = gx / scale;
          let nx = (x - cx) / rx;
          const ny = (y - cy) / ry;

          if (kind === 'apple') {
            const shoulder = 1 + 0.08 * clamp(-ny, -0.5, 1) - 0.14 * clamp(ny, 0, 1) - 0.12 * Math.exp(-nx * nx * 18) * (ny < -0.5 ? 1 : 0);
            nx /= shoulder;
          } else if (kind === 'pear') {
            const widthMod = clamp(0.64 + 0.42 * smooth((ny + 0.7) * 0.72), 0.48, 1.08);
            nx /= widthMod;
          } else if (kind === 'lemon') {
            if (Math.abs(nx) > 0.75) {
              const tip = 1 - 0.45 * smooth((Math.abs(nx) - 0.75) / 0.35);
              nx /= tip;
            }
          }

          const r2 = nx * nx + ny * ny;
          if (r2 >= 1) continue;
          const nz = Math.sqrt(1 - r2);

          // Sculpt stem cavity indentation on top-center for apple/peach/pear
          let sx = nx, sy = ny, sz = nz;
          if (kind === 'apple' || kind === 'peach') {
            const dc = Math.hypot(nx + 0.04, (ny + 0.64) * 1.4);
            if (dc < 0.38) {
              const dip = (1 - dc / 0.38) * 0.85;
              sx -= nx * dip * 0.8;
              sy -= (ny + 0.64) * dip * 1.1;
              const sLen = Math.hypot(sx, sy, sz);
              sx /= sLen; sy /= sLen; sz /= sLen;
            }
          }

          const ndotl = clamp(sx * lx + sy * ly + sz * lz, 0, 1);
          const mottling = N.fbm(x * 0.032 + nx * 1.2, y * 0.022, 3);
          const lit = clamp(0.18 + 0.86 * ndotl + (mottling - 0.5) * 0.12, 0, 1);
          let col = rampColor([colShadow, colMid, colLit], lit);

          // Blush or bi-color cheek variation (e.g. gold-red apple)
          if (opts.colBlush) {
            const blushMask = clamp(0.35 + (mottling - 0.42) * 1.8 - sy * 0.35, 0, 1);
            col = mix3(col, opts.colBlush, blushMask * 0.45);
          }

          // Split pomegranate interior ruby arils
          if (opts.splitFace && ny > -0.15) {
            const rind = r2 > 0.72;
            if (!rind) {
              const aril = N.ridgedFbm(nx * 9.5, ny * 9.5, 2);
              const pithCol = [238, 212, 166];
              const rubyCol = aril > 0.52 ? [218, 32, 48] : [132, 16, 28];
              col = mix3(pithCol, rubyCol, smooth(clamp((aril - 0.36) * 4.5, 0, 1)));
              if (aril > 0.82) col = mix3(col, [255, 232, 232], 0.72);
            } else {
              col = mix3(col, [238, 216, 174], clamp((0.88 - r2) * 4, 0, 0.78));
            }
          }

          // Warm bounce light along bottom-right rim + cool core terminator
          const bounce = clamp(sy * 0.7 + sx * 0.5, 0, 1) * clamp(1 - nz, 0.15, 1) * 0.45;
          col = mix3(col, bounceCol, bounce);

          // Studio window Blinn-Phong specular catchlight
          const hx = lx, hy = ly, hz = lz + 1;
          const hLen = Math.hypot(hx, hy, hz);
          const specDot = clamp(sx * (hx / hLen) + sy * (hy / hLen) + sz * (hz / hLen), 0, 1);
          const shininess = opts.shininess || 34;
          const spec = Math.pow(specDot, shininess) * (opts.specStrength == null ? 0.82 : opts.specStrength);
          col = mix3(col, specCol, clamp(spec, 0, 0.96));

          // Feathered anti-aliased edge integration
          const rimAlpha = smooth(clamp((1 - r2) * 18, 0, 1));
          blendPx(gx, gy, col[0], col[1], col[2], rimAlpha);
        }
      }
    }

    // --- 3D Lathe Vessel Shader (Pitchers, Kettles, Wine Glasses, Vases, Bowls) ---
    function shadeLathe3D(opts) {
      const { cx, topY, botY, profile } = opts;
      const mat = opts.material || 'metal';
      const colLit = opts.colLit || [212, 218, 224];
      const colMid = opts.colMid || [124, 132, 138];
      const colDark = opts.colDark || [34, 38, 42];
      const bounceCol = opts.bounceCol || [188, 152, 86];
      const ld = opts.lightDir || [-0.66, -0.45, 0.58];
      const lLen = Math.hypot(ld[0], ld[1], ld[2]);
      const lx = ld[0] / lLen, ly = ld[1] / lLen, lz = ld[2] / lLen;
      const vH = Math.max(1, botY - topY);

      function radiusAt(yFrac) {
        const t = clamp(yFrac, 0, 1);
        for (let i = 0; i < profile.length - 1; i++) {
          const y0 = profile[i][0], r0 = profile[i][1];
          const y1 = profile[i + 1][0], r1 = profile[i + 1][1];
          if (t <= y1 || i === profile.length - 2) {
            const u = clamp((t - y0) / Math.max(1e-4, y1 - y0), 0, 1);
            const su = u * u * (3 - 2 * u);
            const r = lerp(r0, r1, su);
            const drdy = ((r1 - r0) / Math.max(0.02, y1 - y0)) / vH;
            return { r, drdy };
          }
        }
        return { r: profile[profile.length - 1][1], drdy: 0 };
      }

      let maxR = 1;
      for (const p of profile) if (p[1] > maxR) maxR = p[1];
      const gx0 = Math.max(0, Math.floor((cx - maxR - 4) * scale));
      const gx1 = Math.min(GW - 1, Math.ceil((cx + maxR + 4) * scale));
      const gy0 = Math.max(0, Math.floor((topY - 2) * scale));
      const gy1 = Math.min(GH - 1, Math.ceil((botY + 2) * scale));

      for (let gy = gy0; gy <= gy1; gy++) {
        const y = gy / scale;
        const yFrac = (y - topY) / vH;
        if (yFrac < 0 || yFrac > 1) continue;
        const { r, drdy } = radiusAt(yFrac);
        if (r < 2) continue;

        for (let gx = gx0; gx <= gx1; gx++) {
          const x = gx / scale;
          const ux = (x - cx) / r;
          if (Math.abs(ux) >= 1) continue;
          const uz = Math.sqrt(1 - ux * ux);
          const nLen = Math.hypot(ux, -drdy * 1.4, uz);
          const nx = ux / nLen, ny = (-drdy * 1.4) / nLen, nz = uz / nLen;
          const ndotl = clamp(nx * lx + ny * ly + nz * lz, 0, 1);
          const fresnel = Math.pow(1 - nz, 2.2);

          let col;
          let alpha = smooth(clamp((1 - Math.abs(ux)) * 18, 0, 1));
          if (mat === 'metal') {
            // Anisotropic studio reflection bands + bright left window pane + warm dark horizon core
            const reflBand = Math.exp(-Math.pow((ux + 0.42) / 0.22, 2)) * 0.55;
            const darkCoreBand = Math.exp(-Math.pow((ux - 0.12) / 0.24, 2)) * 0.34;
            const edgeRim = fresnel * 0.25;
            const v = clamp(0.18 + 0.62 * ndotl + reflBand - darkCoreBand + edgeRim, 0, 1);
            col = rampColor([colDark, colMid, colLit], v);
            // Warm bounce reflection on shadow flank
            const bounce = clamp((ux - 0.32) * 1.4, 0, 1) * clamp(yFrac * 1.3, 0.2, 1) * (opts.bounceStrength == null ? 0.55 : opts.bounceStrength);
            col = mix3(col, bounceCol, bounce);
            // Crisp vertical studio window highlight rectangle
            if (ux > -0.62 && ux < -0.34 && yFrac > 0.14 && yFrac < 0.78 && Math.abs(ny) < 0.55) {
              const winMask = smooth(1 - Math.abs(ux + 0.48) / 0.14) * (0.65 + 0.35 * Math.cos((yFrac - 0.46) * 4));
              col = mix3(col, opts.specCol || [255, 253, 248], winMask * 0.86);
            }
          } else if (mat === 'ceramic') {
            const v = clamp(0.14 + 0.76 * ndotl + fresnel * 0.14, 0, 1);
            col = rampColor([colDark, colMid, colLit], v);
            const bounce = clamp((ux - 0.38) * 1.4, 0, 1) * 0.35;
            col = mix3(col, bounceCol, bounce);
            const spec = Math.pow(clamp(nx * lx + ny * ly + nz * (lz + 0.6), 0, 1) / 1.15, 28);
            col = mix3(col, [255, 252, 246], spec * 0.65);
          } else {
            // Translucent glass goblet/vase refracting backdrop + meniscus + specular rim
            const idx = (gy * GW + gx) << 2;
            const bgCol = [buf[idx], buf[idx + 1], buf[idx + 2]];
            const glassCol = rampColor([colDark, colMid, colLit], clamp(0.2 + 0.6 * ndotl, 0, 1));
            const glassOp = clamp(0.24 + fresnel * 0.68, 0.18, 0.92);
            col = mix3(bgCol, glassCol, glassOp);
            if (opts.liquidLevel != null && yFrac > opts.liquidLevel && yFrac < opts.liquidBot && Math.abs(ux) < 0.88) {
              const lCol = opts.liquidCol || [182, 162, 72];
              col = mix3(col, mix3(lCol, colLit, clamp(ndotl, 0, 0.5)), 0.72);
            }
            if (ux > -0.64 && ux < -0.44 && yFrac > 0.08 && yFrac < 0.62) {
              col = mix3(col, [246, 252, 248], 0.75 * smooth(1 - Math.abs(ux + 0.54) / 0.10));
            }
          }

          // Top hollow rim opening interior dark ellipse for pitchers/bowls/goblets
          if (opts.openTopRim && yFrac < 0.06) {
            const rimDepth = 1 - yFrac / 0.06;
            if (Math.abs(ux) < 0.84) {
              const interior = mix3(colDark, [14, 10, 8], 0.65);
              col = mix3(col, interior, rimDepth * 0.78);
            }
          }

          blendPx(gx, gy, col[0], col[1], col[2], alpha);
        }
      }
    }

    // --- 3D Sculpted Anatomical Portrait Bust Shader ---
    function shadePortrait3D(opts = {}) {
      const cx = opts.cx != null ? opts.cx : W * 0.5;
      const cy = opts.cy != null ? opts.cy : H * 0.39;
      const headW = opts.headW || W * 0.135;
      const headH = opts.headH || headW * 1.32;
      const yaw = opts.yaw == null ? -0.18 : opts.yaw; // slight 3/4 turn
      const ld = opts.lightDir || [-0.66, -0.52, 0.54];
      const lLen = Math.hypot(ld[0], ld[1], ld[2]);
      const lx = ld[0] / lLen, ly = ld[1] / lLen, lz = ld[2] / lLen;
      const pal = opts.palette || 'classic'; // classic | zorn | rembrandt | vermeer | fauve

      const skinLit = opts.skinLit || [244, 206, 172];
      const skinMid = opts.skinMid || [198, 138, 106];
      const skinShadow = opts.skinShadow || [86, 56, 48];
      const hairCol = opts.hairCol || [42, 28, 22];
      const dressCol = opts.dressCol || [28, 32, 46];
      const lipCol = opts.lipCol || [178, 66, 58];
      const irisCol = opts.irisCol || [58, 72, 68];

      // Build continuous portrait heightfield in normalized head coordinates
      const zMap = new Float32Array(GW * GH);
      const maskType = new Uint8Array(GW * GH); // 0=none, 1=skin, 2=hair, 3=dress, 4=collar, 5=eyeWhite, 6=iris, 7=pupil

      const noseOffset = yaw * headW * 0.55;
      const neckTopY = cy + headH * 0.74;
      const shY = cy + headH * 1.48;

      for (let gy = 0; gy < GH; gy++) {
        const y = gy / scale;
        const ny = (y - cy) / headH;
        for (let gx = 0; gx < GW; gx++) {
          const x = gx / scale;
          const idx = gy * GW + gx;
          const nx = (x - cx) / headW;

          // 1. Sculpted Head Cranium + Jaw taper
          const jawTaper = ny > 0.15 ? 1 - 0.36 * smooth((ny - 0.15) / 0.88) : 1;
          const hx = nx / jawTaper;
          const rHead2 = hx * hx + ny * ny;
          const beardCol = opts.beardCol || null;
          // True beard covers lower jaw & chin below ny = 0.56 plus mustache fringe below nose (ny > 0.36), leaving upper cheeks bare
          const beardChinW = 0.72 * (1 - 0.30 * clamp((ny - 0.54) / 0.78, 0, 1));
          const isStache = !!(beardCol && ny > 0.34 && ny < 0.49 && Math.abs(nx) < 0.32 && Math.abs(nx) > 0.03);
          const isLowerBeard = !!(beardCol && ny >= 0.56 && ny < 1.24 && Math.abs(nx) < beardChinW);
          const isBeardZone = isStache || isLowerBeard;

          if (rHead2 < 1.0 && !isBeardZone) {
            const hairlinePart = opts.hairPart == null ? 0.12 : opts.hairPart;
            const hairlineBase = opts.hairlineY != null ? opts.hairlineY : -0.54;
            const waveH = (N.noise2(x * 0.05, y * 0.05) - 0.5) * 0.10;
            const hairlineY = hairlineBase + 0.18 * Math.abs(nx - hairlinePart) + waveH;
            if (!opts.bald && (ny < hairlineY || (Math.abs(nx) > 0.82 && ny < 0.12))) {
              maskType[idx] = 2;
              zMap[idx] = (Math.sqrt(Math.max(0, 1 - rHead2)) + 0.08) * headW;
              continue;
            }
            let z = Math.sqrt(Math.max(0, 1 - rHead2)) * 1.0;
            // Subtle zygomatic cheekbones prominence
            const cheekL = Math.exp(-Math.hypot(nx - noseOffset / headW * 0.4 + 0.36, ny - 0.14) * 3.8);
            const cheekR = Math.exp(-Math.hypot(nx - noseOffset / headW * 0.4 - 0.36, ny - 0.14) * 3.8);
            z += (cheekL + cheekR) * 0.12;
            // Recessed orbital eye sockets around ny = -0.05
            const eSep = 0.34;
            const eShift = yaw * 0.16;
            const eLx = (nx - (-eSep + eShift)), eLy = (ny + 0.045);
            const eRx = (nx - (eSep + eShift * 0.6)), eRy = (ny + 0.045);
            const sockL = Math.exp(-(eLx * eLx * 18 + eLy * eLy * 42));
            const sockR = Math.exp(-(eRx * eRx * 18 + eRy * eRy * 42));
            z -= (sockL + sockR) * 0.15;
            // Eyeball spherical domes inside sockets
            const ballL = Math.hypot(eLx * 0.86, eLy * 2.05);
            const ballR = Math.hypot(eRx * 0.86, eRy * 2.05);
            if (ballL < 0.155 || ballR < 0.155) {
              const bd = Math.min(ballL, ballR) / 0.155;
              z += Math.sqrt(Math.max(0, 1 - bd * bd)) * 0.10;
              maskType[idx] = bd < 0.30 ? 7 : (bd < 0.64 ? 6 : 5);
            } else {
              maskType[idx] = 1;
            }
            // Prominent sculpted 3D nasal bridge, tip & alar wings
            const noseU = nx - yaw * 0.24;
            if (ny > -0.14 && ny < 0.36 && Math.abs(noseU) < 0.26) {
              const bridgeProf = Math.exp(-Math.pow(noseU / 0.095, 2)) * smooth((ny + 0.14) / 0.40) * (1 - smooth((ny - 0.28) / 0.10));
              const tipDome = Math.exp(-(noseU * noseU * 68 + Math.pow(ny - 0.24, 2) * 85));
              z += bridgeProf * 0.24 + tipDome * 0.14;
            }
            // Sculpted philtrum + bow upper lip + full rounded lower lip + chin
            const mouthU = nx - yaw * 0.18;
            if (Math.abs(mouthU) < 0.28 && ny > 0.42 && ny < 0.64) {
              const lipLen = 1 - smooth(Math.abs(mouthU) / 0.27);
              const uLip = Math.exp(-Math.pow((ny - 0.48) / 0.042, 2)) * lipLen * 0.075;
              const lLip = Math.exp(-Math.pow((ny - 0.55) / 0.052, 2)) * lipLen * 0.085;
              const cleft = Math.exp(-Math.pow((ny - 0.515) / 0.018, 2)) * lipLen * 0.04;
              z += uLip + lLip - cleft;
            }
            const chinBump = Math.exp(-((mouthU) * (mouthU) * 18 + Math.pow(ny - 0.76, 2) * 32));
            z += chinBump * 0.08;
            zMap[idx] = z * headW;
            continue;
          }

          if (isBeardZone) {
            maskType[idx] = 8;
            const bW = isStache ? 0.34 : Math.max(0.15, beardChinW);
            const bnX = clamp(nx / bW, -1, 1);
            const bTex = N.fbm(x * 0.08, y * 0.03, 3) * 0.14;
            zMap[idx] = (Math.sqrt(Math.max(0, 1 - bnX * bnX * 0.85)) * 0.72 + bTex) * headW;
            continue;
          }

          // 2. Organic Wavy Hair Frame & Side Chignon/Locks
          const hairWave = (N.noise2(x * 0.045, y * 0.045) - 0.5) * 0.14;
          const hairRX = (opts.longHair ? 1.24 : 1.16) + hairWave;
          const hairRY = (opts.longHair ? 1.24 : 1.12) + hairWave * 0.7;
          const hR2 = (nx / hairRX) ** 2 + ((ny + 0.08) / hairRY) ** 2;
          if (hR2 < 1.0 && ny < (opts.longHair ? 1.16 : 0.76)) {
            maskType[idx] = 2;
            zMap[idx] = Math.sqrt(Math.max(0, 1 - hR2)) * headW * 0.86;
            continue;
          }

          // 3. Seamless Neck Cylinder tapering cleanly into Clavicles & Bust Dress
          if (y >= cy + headH * 0.58 && y < shY) {
            const nFrac = clamp((y - (cy + headH * 0.58)) / (shY - (cy + headH * 0.58)), 0, 1);
            const neckHW = headW * (0.46 + 0.24 * smooth(nFrac));
            const uN = (x - cx) / neckHW;
            if (Math.abs(uN) < 1) {
              maskType[idx] = 1;
              zMap[idx] = Math.sqrt(Math.max(0, 1 - uN * uN)) * neckHW * 0.82;
              continue;
            }
          }

          // 4. Naturally Sloped Trapezius-to-Deltoid Shoulders flaring organically toward bottom frame
          const ySpread = clamp((y - shY * 0.78) / Math.max(1, H - shY * 0.78), 0, 1);
          const bHW = headW * (2.05 + 0.92 * ySpread);
          const uB = (x - cx) / bHW;
          if (Math.abs(uB) < 1) {
            const shoulderTop = (cy + headH * 1.12) + (uB * uB) * headH * 1.65;
            if (y >= shoulderTop) {
              const sFrac = clamp((y - shoulderTop) / Math.max(1, H - shoulderTop), 0, 1);
              const drpWave = Math.sin(uB * 8.5 + sFrac * 2.5) * 0.10 * sFrac;
              zMap[idx] = Math.sqrt(Math.max(0, 1 - uB * uB)) * headW * (0.95 + drpWave);
              const collarD = Math.hypot((x - cx) / (headW * 0.84), (y - (cy + headH * 1.24)) / (headH * 0.24));
              maskType[idx] = (opts.hasCollar !== false && collarD < 1.0 && collarD > 0.62 && y > cy + headH * 1.08) ? 4 : 3;
            }
          }
        }
      }

      // Compute exact finite-difference normals on the 3D bust heightfield and shade
      for (let gy = 1; gy < GH - 1; gy++) {
        const y = gy / scale;
        const ny = (y - cy) / headH;
        for (let gx = 1; gx < GW - 1; gx++) {
          const idx = gy * GW + gx;
          const m = maskType[idx];
          if (m === 0) continue;
          const x = gx / scale;
          const nx = (x - cx) / headW;

          const dhx = (zMap[idx + 1] - zMap[idx - 1]) * 0.55;
          const dhy = (zMap[idx + GW] - zMap[idx - GW]) * 0.55;
          const nL = Math.hypot(dhx, dhy, 1);
          const snx = -dhx / nL, sny = -dhy / nL, snz = 1 / nL;
          const ndotl = clamp(snx * lx + sny * ly + snz * lz, 0, 1);
          const fres = Math.pow(1 - snz, 2);

          let col;
          if (m === 1) {
            // Anatomical Skin: Lambertian + chin-on-neck ambient occlusion + warm cheek/nose blush + cool shadow halftone
            let occ = 1;
            if (ny > 0.85 && ny < 1.25) occ = clamp(0.45 + 0.55 * (ny - 0.85) / 0.4, 0.45, 1);
            const lit = clamp((0.12 + 0.88 * ndotl) * occ + fres * 0.10, 0, 1);
            col = rampColor([skinShadow, skinMid, skinLit], lit);
            const eSep = 0.34, eShift = yaw * 0.16;
            const eLx = nx - (-eSep + eShift), eLy = ny + 0.045;
            const eRx = nx - (eSep + eShift * 0.6), eRy = ny + 0.045;
            const noseU = nx - yaw * 0.24;
            if (pal === 'fauve') {
              const shadowMask = smooth(clamp(1 - ndotl * 2.1, 0, 1));
              col = mix3(col, opts.fauveShadowCol || [48, 168, 96], shadowMask * 0.82);
              if ((Math.abs(eLx) < 0.18 || Math.abs(eRx) < 0.18) && eLy > -0.085 && eLy < -0.042) {
                col = mix3(col, [26, 18, 16], 0.65);
              }
            } else {
              // Warm rosy subsurface blush on cheeks & lip proximity
              const cGlow = Math.exp(-((nx + 0.32) ** 2 * 5 + (ny - 0.16) ** 2 * 7)) + Math.exp(-((nx - 0.24) ** 2 * 5 + (ny - 0.16) ** 2 * 7));
              col = mix3(col, [216, 108, 92], clamp(cGlow * 0.28 * ndotl, 0, 0.35));
              // Upper eyelid lash crease
              if ((Math.abs(eLx) < 0.18 || Math.abs(eRx) < 0.18) && eLy > -0.085 && eLy < -0.042) {
                col = mix3(col, [26, 18, 16], 0.68);
              }
              // Subtle nostril / alar shadow under nose tip
              if (Math.abs(noseU) < 0.15 && ny > 0.28 && ny < 0.34) {
                col = mix3(col, [52, 26, 22], 0.52 * (1 - Math.abs(ny - 0.31) / 0.03));
              }
              // Sculpted lip pigment
              const mouthU = nx - yaw * 0.18;
              if (Math.abs(mouthU) < 0.23 && ny > 0.45 && ny < 0.59) {
                const lMask = smooth(1 - Math.abs(mouthU) / 0.23) * smooth(1 - Math.abs(ny - 0.52) / 0.07);
                const lTone = ny < 0.51 ? mix3(lipCol, [68, 22, 22], 0.35) : mix3(lipCol, skinLit, 0.22);
                col = mix3(col, lTone, lMask * 0.86);
              }
              // Darken eyebrows sharply above eye socket
              const browCurveY = -0.20 + (nx * nx) * 0.09;
              if (Math.abs(nx - yaw * 0.16) < 0.54 && Math.abs(nx - yaw * 0.16) > 0.11 && Math.abs(ny - browCurveY) < 0.038) {
                col = mix3(col, hairCol, 0.72 * (1 - Math.abs(ny - browCurveY) / 0.038));
              }
            }
            if (pal === 'zorn') col = projectToZorn(col[0], col[1], col[2]);
          } else if (m === 2) {
            // Multi-strand hair sheen
            const strand = N.fbm(x * 0.045, y * 0.015, 3);
            const hl = clamp(ndotl * 0.65 + strand * 0.35, 0, 1);
            col = mix3(hairCol, [Math.min(255, hairCol[0] + 62), Math.min(255, hairCol[1] + 46), Math.min(255, hairCol[2] + 34)], hl * 0.68);
          } else if (m === 8) {
            // Painterly chiaroscuro beard with deep umber shadow & textured strand highlights
            const bCol = opts.beardCol || hairCol;
            const strand = N.fbm(x * 0.08, y * 0.025, 3);
            const mouthDark = Math.exp(-Math.pow((ny - 0.56) / 0.07, 2)) * 0.45;
            const hl = clamp((ndotl * 0.68 + strand * 0.38) * (1 - mouthDark), 0, 1);
            col = mix3([bCol[0] * 0.28, bCol[1] * 0.25, bCol[2] * 0.22], [Math.min(255, bCol[0] + 22), Math.min(255, bCol[1] + 18), Math.min(255, bCol[2] + 12)], hl * 0.78);
          } else if (m === 3) {
            // Garment drapery fold lighting
            const fold = N.fbm(x * 0.018, y * 0.018, 2) - 0.5;
            col = mix3([dressCol[0] * 0.55, dressCol[1] * 0.55, dressCol[2] * 0.55], dressCol, clamp(0.25 + ndotl * 0.8 + fold * 0.25, 0, 1));
          } else if (m === 4) {
            // Silk / Linen Collar
            const cLit = clamp(0.45 + 0.55 * ndotl, 0, 1);
            col = rampColor([[138, 134, 126], [208, 204, 194], opts.collarCol || [248, 244, 234]], cLit);
          } else if (m === 5) {
            // Sclera & upper lid shadow
            const upperLid = ny < -0.055 ? 0.45 : 0.92;
            col = [228 * upperLid * (0.7 + 0.3 * ndotl), 220 * upperLid * (0.7 + 0.3 * ndotl), 212 * upperLid * (0.7 + 0.3 * ndotl)];
          } else if (m === 6) {
            col = mix3(irisCol, [18, 16, 14], clamp(0.25 + (1 - ndotl) * 0.4, 0, 0.7));
          } else {
            // Pupil + bright corneal catchlight glint
            const gl = (snx < -0.14 && sny < -0.10) ? 1 : 0;
            col = gl ? [255, 252, 244] : [16, 14, 14];
          }

          blendPx(gx, gy, col[0], col[1], col[2], 1);
        }
      }
    }

    return {
      W, H, GW, GH, scale, buf, N,
      draw2D,
      flushToCanvas,
      syncFromCanvas,
      sampleRef,
      shadeBackdropWallTable,
      shadeSkyAndClouds,
      shadeMountainRange,
      shadeOcean,
      shadeDrapery,
      shadeFruit3D,
      shadeLathe3D,
      shadePortrait3D
    };
  }

  // ===========================================================================
  // 2. MULTI-SCALE STRUCTURE TENSOR (ETF) + HERTZMANN 5,000-STROKE SYNTHESIZER
  // ===========================================================================
  function computeBlurredPyramid(refRGB, gw, gh, isMaster) {
    function boxBlurH(src, r) {
      const out = new Float32Array(src.length);
      const wSpan = r * 2 + 1;
      for (let y = 0; y < gh; y++) {
        const row = y * gw * 3;
        for (let c = 0; c < 3; c++) {
          let sum = 0;
          for (let k = -r; k <= r; k++) sum += src[row + clamp(k, 0, gw - 1) * 3 + c];
          for (let x = 0; x < gw; x++) {
            out[row + x * 3 + c] = sum / wSpan;
            const addX = clamp(x + r + 1, 0, gw - 1), remX = clamp(x - r, 0, gw - 1);
            sum += src[row + addX * 3 + c] - src[row + remX * 3 + c];
          }
        }
      }
      return out;
    }
    function boxBlurV(src, r) {
      const out = new Float32Array(src.length);
      const hSpan = r * 2 + 1;
      for (let x = 0; x < gw; x++) {
        for (let c = 0; c < 3; c++) {
          let sum = 0;
          for (let k = -r; k <= r; k++) sum += src[(clamp(k, 0, gh - 1) * gw + x) * 3 + c];
          for (let y = 0; y < gh; y++) {
            out[(y * gw + x) * 3 + c] = sum / hSpan;
            const addY = clamp(y + r + 1, 0, gh - 1), remY = clamp(y - r, 0, gh - 1);
            sum += src[(addY * gw + x) * 3 + c] - src[(remY * gw + x) * 3 + c];
          }
        }
      }
      return out;
    }
    const blurR = (r) => boxBlurV(boxBlurH(refRGB, r), r);
    const bFine = blurR(1);
    const bMed = blurR(3);
    const bCoarse = blurR(7);
    if (isMaster) {
      return [blurR(8), blurR(4), blurR(2), bFine, refRGB, refRGB];
    }
    return [bCoarse, bMed, bMed, bFine, refRGB];
  }

  function computeStructureTensor(refRGB, gw, gh, style) {
    const nPix = gw * gh;
    const lum = new Float32Array(nPix);
    for (let i = 0; i < nPix; i++) {
      const p = i * 3;
      lum[i] = 0.299 * refRGB[p] + 0.587 * refRGB[p + 1] + 0.114 * refRGB[p + 2];
    }

    const jxx = new Float32Array(nPix);
    const jxy = new Float32Array(nPix);
    const jyy = new Float32Array(nPix);
    const rawGrad = new Float32Array(nPix);

    for (let y = 1; y < gh - 1; y++) {
      const r0 = (y - 1) * gw, r1 = y * gw, r2 = (y + 1) * gw;
      for (let x = 1; x < gw - 1; x++) {
        const gx = (-lum[r0 + x - 1] + lum[r0 + x + 1] - 2 * lum[r1 + x - 1] + 2 * lum[r1 + x + 1] - lum[r2 + x - 1] + lum[r2 + x + 1]) * 0.25;
        const gy = (-lum[r0 + x - 1] - 2 * lum[r0 + x] - lum[r0 + x + 1] + lum[r2 + x - 1] + 2 * lum[r2 + x] + lum[r2 + x + 1]) * 0.25;
        const i = r1 + x;
        jxx[i] = gx * gx;
        jxy[i] = gx * gy;
        jyy[i] = gy * gy;
        rawGrad[i] = Math.hypot(gx, gy);
      }
    }

    // Separable Gaussian smoothing on tensor components (sigma ~ 2.4)
    function smoothChan(arr) {
      const tmp = new Float32Array(nPix);
      const out = new Float32Array(nPix);
      const w = [0.06, 0.14, 0.20, 0.20, 0.20, 0.14, 0.06];
      for (let y = 0; y < gh; y++) {
        const ro = y * gw;
        for (let x = 0; x < gw; x++) {
          let s = 0;
          for (let k = -3; k <= 3; k++) s += arr[ro + clamp(x + k, 0, gw - 1)] * w[k + 3];
          tmp[ro + x] = s;
        }
      }
      for (let y = 0; y < gh; y++) {
        for (let x = 0; x < gw; x++) {
          let s = 0;
          for (let k = -3; k <= 3; k++) s += tmp[clamp(y + k, 0, gh - 1) * gw + x] * w[k + 3];
          out[y * gw + x] = s;
        }
      }
      return out;
    }

    const sxx = smoothChan(jxx);
    const sxy = smoothChan(jxy);
    const syy = smoothChan(jyy);

    const tx = new Float32Array(nPix);
    const ty = new Float32Array(nPix);
    const gradNorm = new Float32Array(nPix);

    let maxG = 1e-4;
    for (let i = 0; i < nPix; i++) if (rawGrad[i] > maxG) maxG = rawGrad[i];

    for (let y = 0; y < gh; y++) {
      for (let x = 0; x < gw; x++) {
        const i = y * gw + x;
        const a = sxx[i], b = sxy[i], c = syy[i];
        const disc = Math.hypot(a - c, 2 * b);
        // Compute dominant gradient eigenvector first, then rotate 90 deg CCW -> true Edge Tangent Flow
        let gxVec, gyVec;
        if (a >= c) {
          gxVec = a - c + disc;
          gyVec = 2 * b;
        } else {
          gxVec = 2 * b;
          gyVec = c - a + disc;
        }
        let ex = -gyVec;
        let ey = gxVec;
        let el = Math.hypot(ex, ey);
        if (el < 1e-4) {
          ex = Math.cos(y * 0.025) * 0.96;
          ey = Math.sin(x * 0.02 + y * 0.015) * 0.28;
          el = Math.hypot(ex, ey);
        }
        let vx = ex / el, vy = ey / el;

        // Style tangent modulation
        if (style === 'vangogh') {
          const cx1 = gw * 0.36, cy1 = gh * 0.34, cx2 = gw * 0.62, cy2 = gh * 0.42;
          const d1 = Math.hypot(x - cx1, y - cy1) + 8, d2 = Math.hypot(x - cx2, y - cy2) + 8;
          const w1 = Math.exp(-(d1 * d1) / (2 * (gw * 0.19) ** 2));
          const w2 = Math.exp(-(d2 * d2) / (2 * (gw * 0.16) ** 2));
          const a1 = Math.atan2(y - cy1, x - cx1) + 1.65;
          const a2 = Math.atan2(y - cy2, x - cx2) - 1.65;
          const flow = Math.sin(x * 0.035 + Math.cos(y * 0.04)) * 0.5;
          let cx = Math.cos(flow) + w1 * 2.2 * Math.cos(a1) + w2 * 1.9 * Math.cos(a2);
          let cy = Math.sin(flow) + w1 * 2.2 * Math.sin(a1) + w2 * 1.9 * Math.sin(a2);
          const cl = Math.hypot(cx, cy) || 1;
          vx = lerp(vx, cx / cl, 0.55);
          vy = lerp(vy, cy / cl, 0.55);
          const vl = Math.hypot(vx, vy) || 1;
          vx /= vl; vy /= vl;
        } else if (style === 'cezanne') {
          const ang = Math.atan2(vy, vx);
          const dAng = -0.68; // Cézanne diagonal constructive stroke bias
          const gStr = clamp(rawGrad[i] / (maxG * 0.22), 0, 1);
          const bAng = lerp(dAng, ang, gStr * 0.72);
          vx = Math.cos(bAng); vy = Math.sin(bAng);
        } else if (style === 'knife') {
          const ang = Math.atan2(vy, vx);
          const snap = Math.round(ang / (Math.PI * 0.25)) * (Math.PI * 0.25);
          const gStr = clamp(rawGrad[i] / (maxG * 0.28), 0, 1);
          const kAng = lerp(snap, ang, 0.45 + gStr * 0.45);
          vx = Math.cos(kAng); vy = Math.sin(kAng);
        }
        tx[i] = vx;
        ty[i] = vy;
        gradNorm[i] = clamp(rawGrad[i] / (maxG * 0.36), 0, 1);
      }
    }

    return { tx, ty, gradNorm };
  }

  // Smooth Canvas2D Midpoint Quadratic Bézier Path
  function strokePath(c, pts) {
    c.beginPath();
    c.moveTo(pts[0], pts[1]);
    const len = pts.length;
    if (len === 4) {
      c.lineTo(pts[2], pts[3]);
    } else if (len === 6) {
      c.quadraticCurveTo(pts[2], pts[3], pts[4], pts[5]);
    } else {
      for (let i = 2; i < len - 2; i += 2) {
        const mx = (pts[i] + pts[i + 2]) * 0.5;
        const my = (pts[i + 1] + pts[i + 3]) * 0.5;
        c.quadraticCurveTo(pts[i], pts[i + 1], mx, my);
      }
      c.lineTo(pts[len - 2], pts[len - 1]);
    }
    c.stroke();
  }

  function synthesize(api, scene, opts = {}) {
    const W = scene.W, H = scene.H, GW = scene.GW, GH = scene.GH, scale = scene.scale;
    const nPix = GW * GH;
    const style = opts.style || 'classic';
    const totalStrokes = opts.totalStrokes || 5000;
    const isMaster = Boolean(opts.masterpiece || totalStrokes >= 15000);
    const layers = opts.layers || [
      { id: 1, name: '一 · 铺陈大色打底' },
      { id: 2, name: '二 · 形体明暗塑形' },
      { id: 3, name: '三 · 冷暖过渡刻画' },
      { id: 4, name: '四 · 焦点精描提神' }
    ];
    const seedRand = mulberry32((opts.seed || 0x2026) ^ 0x9E3779B9);
    const rois = opts.roi || [];

    // Extract clean RGB ref array
    const refRGB = new Float32Array(nPix * 3);
    for (let i = 0; i < nPix; i++) {
      const bi = i << 2, ri = i * 3;
      refRGB[ri] = scene.buf[bi];
      refRGB[ri + 1] = scene.buf[bi + 1];
      refRGB[ri + 2] = scene.buf[bi + 2];
    }

    const pyramid = computeBlurredPyramid(refRGB, GW, GH, isMaster);
    const { tx, ty, gradNorm } = computeStructureTensor(refRGB, GW, GH, style);

    // Master-style structural flow refinements
    if (style === 'monet-broken') {
      const yWater = Math.floor(GH * 0.48);
      for (let gy = yWater; gy < GH; gy++) {
        for (let gx = 0; gx < GW; gx++) {
          const i = gy * GW + gx;
          if (gradNorm[i] < 0.28) {
            const sx = tx[i] * 0.30 + (tx[i] < 0 ? -0.70 : 0.70);
            const sy = ty[i] * 0.30;
            const len = Math.hypot(sx, sy) || 1;
            tx[i] = sx / len;
            ty[i] = sy / len;
          }
        }
      }
    } else if (style === 'cezanne-constructive') {
      const cxDir = 0.788, cyDir = -0.616; // -38 deg parallel Cézanne constructive facets
      for (let i = 0; i < nPix; i++) {
        if (gradNorm[i] < 0.26) {
          const align = tx[i] * cxDir + ty[i] * cyDir >= 0 ? 1 : -1;
          const sx = tx[i] * 0.40 + cxDir * align * 0.60;
          const sy = ty[i] * 0.40 + cyDir * align * 0.60;
          const len = Math.hypot(sx, sy) || 1;
          tx[i] = sx / len;
          ty[i] = sy / len;
        }
      }
    }

    // Initialize simulated canvas error tracker to initial dark imprimatura color
    const workRGB = new Float32Array(nPix * 3);
    const initR = 32, initG = 24, initB = 18;
    for (let i = 0; i < nPix; i++) {
      const p = i * 3;
      workRGB[p] = initR; workRGB[p + 1] = initG; workRGB[p + 2] = initB;
    }

    const layerCount = layers.length;
    const isKnife = style === 'knife';
    const isPoint = style === 'pointillism';
    const isSfumato = style === 'sfumato';
    const isScumble = style === 'scumbling';

    const isSfumatoMaster = style === 'sfumato-master';
    const isVermeerMaster = style === 'vermeer-pointille';
    const isRembrandtMaster = style === 'rembrandt-impasto';
    const isTurnerMaster = style === 'turner-atmospheric';
    const isMonetMaster = style === 'monet-broken';
    const isSeuratMaster = style === 'seurat-pointillism';
    const isCezanneMaster = style === 'cezanne-constructive';
    const isKlimtMaster = style === 'klimt-goldleaf';

    let passes;
    if (isMaster) {
      const m1 = Math.round(totalStrokes * 0.055);
      const m2 = Math.round(totalStrokes * 0.105);
      const m3 = Math.round(totalStrokes * 0.175);
      const m4 = Math.round(totalStrokes * 0.220);
      const m5 = Math.round(totalStrokes * 0.245);
      const m6 = totalStrokes - m1 - m2 - m3 - m4 - m5;
      const flatCap = isMonetMaster || isCezanneMaster;

      passes = [
        {
          count: m1, layerIdx: 0,
          label: (layers[0] && layers[0].name) || '一 · 底层有色铺调',
          blur: pyramid[0],
          wMin: isSeuratMaster ? 26 : 38, wMax: isSeuratMaster ? 42 : 68,
          lenMin: isSeuratMaster ? 4 : 10, lenMax: isSeuratMaster ? 8 : 20,
          stepLen: 9.5, alpha: isSfumatoMaster ? 0.90 : 0.94, colorCut: 86, bevel: 0,
          errThresh: 0, edgeBias: 0.15, capMode: 'round'
        },
        {
          count: m2, layerIdx: Math.min(1, layerCount - 1),
          label: (layers[1] && layers[1].name) || '二 · 块面造型与冷暖定调',
          blur: pyramid[1],
          wMin: isSeuratMaster ? 6.5 : 15, wMax: isSeuratMaster ? 9.5 : 26,
          lenMin: isSeuratMaster ? 0.35 : 6, lenMax: isSeuratMaster ? 0.85 : 12,
          stepLen: isSeuratMaster ? 1.0 : 5.0,
          alpha: isSfumatoMaster ? 0.72 : (isTurnerMaster ? 0.74 : 0.88),
          colorCut: 52, bevel: 0, errThresh: 7, edgeBias: 0.65,
          capMode: flatCap ? 'butt' : 'round'
        },
        {
          count: m3, layerIdx: Math.min(2, layerCount - 1),
          label: (layers[2] && layers[2].name) || '三 · 中间调结构塑形',
          blur: pyramid[2],
          wMin: isSeuratMaster ? 3.8 : 7.2, wMax: isSeuratMaster ? 5.8 : 13.0,
          lenMin: isSeuratMaster ? 0.30 : 4, lenMax: isSeuratMaster ? 0.75 : 9,
          stepLen: isSeuratMaster ? 0.8 : 3.2,
          alpha: isSfumatoMaster ? 0.58 : (isTurnerMaster ? 0.66 : 0.85),
          colorCut: 38,
          bevel: isSfumatoMaster || isSeuratMaster ? 0 : (isVermeerMaster ? 0.25 : (isKlimtMaster ? 0.75 : (isCezanneMaster ? 0.55 : 0.45))),
          errThresh: 5, edgeBias: 1.4,
          capMode: flatCap ? 'butt' : 'round'
        },
        {
          count: m4, layerIdx: Math.min(3, layerCount - 1),
          label: (layers[3] && layers[3].name) || '四 · 细部转折与质感叠色',
          blur: pyramid[3],
          wMin: isSeuratMaster ? 2.5 : 3.5, wMax: isSeuratMaster ? 3.8 : 6.4,
          lenMin: isSeuratMaster ? 0.28 : 2.5, lenMax: isSeuratMaster ? 0.65 : 6.0,
          stepLen: isSeuratMaster ? 0.6 : 2.1,
          alpha: isSfumatoMaster ? 0.52 : (isTurnerMaster ? 0.72 : 0.86),
          colorCut: 26,
          bevel: isSfumatoMaster || isSeuratMaster ? 0 : (isVermeerMaster ? 0.25 : (isKlimtMaster ? 0.72 : (isCezanneMaster ? 0.52 : 0.62))),
          errThresh: 3.5, edgeBias: 2.5,
          capMode: flatCap ? 'butt' : 'round'
        },
        {
          count: m5, layerIdx: Math.min(4, layerCount - 1),
          label: (layers[4] && layers[4].name) || '五 · 高频纹理精刻',
          blur: pyramid[4],
          wMin: isSeuratMaster ? 1.7 : 1.6, wMax: isSeuratMaster ? 2.7 : 3.2,
          lenMin: isSeuratMaster ? 0.24 : 1.4, lenMax: isSeuratMaster ? 0.55 : 4.0,
          stepLen: isSeuratMaster ? 0.5 : 1.4,
          alpha: isSfumatoMaster ? 0.56 : (isTurnerMaster ? 0.84 : 0.90),
          colorCut: 18,
          bevel: isRembrandtMaster || isTurnerMaster ? 0.55 : (isCezanneMaster ? 0.35 : 0),
          errThresh: 2.0, edgeBias: 3.6,
          capMode: isCezanneMaster ? 'butt' : 'round'
        },
        {
          count: m6, layerIdx: layerCount - 1,
          label: (layers[layerCount - 1] && layers[layerCount - 1].name) || '六 · 毫厘细节与光学高光收笔',
          blur: pyramid[5],
          wMin: isSeuratMaster ? 1.2 : 0.85, wMax: isSeuratMaster ? 2.0 : 1.95,
          lenMin: isSeuratMaster ? 0.20 : 0.9, lenMax: isSeuratMaster ? 0.45 : 2.6,
          stepLen: isSeuratMaster ? 0.4 : 1.0,
          alpha: isSfumatoMaster ? 0.62 : 0.92,
          colorCut: 12,
          bevel: isRembrandtMaster || isTurnerMaster ? 0.65 : 0,
          errThresh: 1.0, edgeBias: 4.8,
          capMode: 'round'
        }
      ];
    } else {
      // Existing 5-pass pipeline strictly preserved for all 5,000-stroke paintings
      const p1 = Math.round(totalStrokes * 0.104);
      const p2 = Math.round(totalStrokes * 0.180);
      const p3 = Math.round(totalStrokes * 0.272);
      const p4 = Math.round(totalStrokes * 0.276);
      const p5 = totalStrokes - p1 - p2 - p3 - p4;

      passes = [
        {
          count: p1, layerIdx: 0,
          label: (layers[0] && layers[0].name) || '一 · 底层有色铺调与构图起稿',
          blur: pyramid[0],
          wMin: isPoint ? 34 : 52, wMax: isPoint ? 54 : 84,
          lenMin: isPoint ? 3 : 12, lenMax: isPoint ? 6 : 22,
          stepLen: 10.5, alpha: isSfumato ? 0.80 : 0.94, colorCut: 86, bevel: 0,
          errThresh: 0, edgeBias: 0.15
        },
        {
          count: p2, layerIdx: Math.min(1, layerCount - 1),
          label: (layers[1] && layers[1].name) || '二 · 块面造型与冷暖明暗关系',
          blur: pyramid[1],
          wMin: isPoint ? 13 : 22, wMax: isPoint ? 20 : 38,
          lenMin: isPoint ? 1.2 : 6, lenMax: isPoint ? 2.4 : 12,
          stepLen: 5.2, alpha: isSfumato ? 0.72 : 0.88, colorCut: 56, bevel: isKnife ? 0.85 : 0.22,
          errThresh: 8, edgeBias: 0.65
        },
        {
          count: p3, layerIdx: Math.min(2, layerCount - 1),
          label: (layers[2] && layers[2].name) || '三 · 中间调塑形与色彩韵律过渡',
          blur: pyramid[2],
          wMin: isPoint ? 7.5 : 10, wMax: isPoint ? 12 : 17,
          lenMin: isPoint ? 0.9 : 4, lenMax: isPoint ? 1.8 : 8.5,
          stepLen: 3.4, alpha: isSfumato ? 0.70 : 0.86, colorCut: 40, bevel: isKnife ? 1.15 : 0.52,
          errThresh: 6, edgeBias: 1.4
        },
        {
          count: p4, layerIdx: Math.min(layerCount >= 5 ? 3 : 2, layerCount - 1),
          label: (layers[Math.min(layerCount >= 5 ? 3 : 2, layerCount - 1)] && layers[Math.min(layerCount >= 5 ? 3 : 2, layerCount - 1)].name) || '四 · 边缘转折与高频细节刻画',
          blur: pyramid[3],
          wMin: isPoint ? 4.5 : 4.2, wMax: isPoint ? 7.2 : 7.8,
          lenMin: isPoint ? 0.6 : 2.2, lenMax: isPoint ? 1.2 : 5.2,
          stepLen: 2.3, alpha: isSfumato ? 0.74 : 0.90, colorCut: 26, bevel: isKnife ? 1.3 : 0.72,
          errThresh: 4, edgeBias: 2.6
        },
        {
          count: p5, layerIdx: layerCount - 1,
          label: (layers[layerCount - 1] && layers[layerCount - 1].name) || '五 · 厚涂高光提神与收笔点睛',
          blur: pyramid[4],
          wMin: isPoint ? 3.2 : 1.7, wMax: isPoint ? 5.2 : 4.0,
          lenMin: isPoint ? 0.4 : 1.1, lenMax: isPoint ? 0.9 : 3.2,
          stepLen: 1.5, alpha: isScumble ? 0.78 : 0.94, colorCut: 18, bevel: isKnife ? 1.4 : 0.88,
          errThresh: 2, edgeBias: 4.0
        }
      ];
    }

    function roiBoostAt(gx, gy) {
      if (!rois.length) return 1;
      const x = gx / scale, y = gy / scale;
      let b = 1;
      for (let i = 0; i < rois.length; i++) {
        const roi = rois[i];
        const d2 = ((x - roi.cx) / roi.rx) ** 2 + ((y - roi.cy) / roi.ry) ** 2;
        if (d2 < 1.2) b += Math.exp(-d2 * 1.5) * (roi.boost || 3.2);
      }
      return b;
    }

    function traceAndPushStroke(gx0, gy0, pass, passIdx) {
      const bArr = pass.blur;
      const idx0 = gy0 * GW + gx0;
      const p0 = idx0 * 3;
      let r0 = bArr[p0], g0 = bArr[p0 + 1], b0 = bArr[p0 + 2];

      // Divisionism chromatic vibration for Pointillism / Impressionism / Fauve / Van Gogh / Seurat / Monet
      if (isSeuratMaster && passIdx >= 1) {
        const split = (seedRand() - 0.5) * 34;
        const shiftType = seedRand();
        if (shiftType < 0.34) {
          r0 = clamp(r0 + split, 0, 255);
          b0 = clamp(b0 - split * 0.85, 0, 255);
        } else if (shiftType < 0.68) {
          g0 = clamp(g0 + split * 0.8, 0, 255);
          r0 = clamp(r0 - split * 0.6, 0, 255);
        } else {
          b0 = clamp(b0 + split * 0.85, 0, 255);
          g0 = clamp(g0 - split * 0.55, 0, 255);
        }
      } else if (isPoint && passIdx >= 1) {
        const split = (seedRand() - 0.5) * 26;
        if (seedRand() < 0.5) {
          r0 = clamp(r0 + split, 0, 255);
          b0 = clamp(b0 - split * 0.7, 0, 255);
        } else {
          g0 = clamp(g0 + split * 0.7, 0, 255);
          r0 = clamp(r0 - split * 0.4, 0, 255);
        }
      } else if ((style === 'impressionist' || isMonetMaster) && passIdx >= 2) {
        const temp = (seedRand() - 0.5) * (isMonetMaster ? 18 : 14);
        r0 = clamp(r0 + temp, 0, 255);
        b0 = clamp(b0 - temp * 0.8, 0, 255);
      }

      const maxSteps = Math.max(1, Math.round(lerp(pass.lenMin, pass.lenMax, seedRand())));
      const pts = [];
      let cx = gx0 + (seedRand() - 0.5) * 0.8;
      let cy = gy0 + (seedRand() - 0.5) * 0.8;
      let prevDx = tx[idx0], prevDy = ty[idx0];
      if (seedRand() < 0.5) { prevDx = -prevDx; prevDy = -prevDy; }

      pts.push(cx / scale, cy / scale);

      const stepGrid = pass.stepLen * scale;
      for (let s = 0; s < maxSteps; s++) {
        const ix = clamp(Math.round(cx), 0, GW - 1);
        const iy = clamp(Math.round(cy), 0, GH - 1);
        const gi = iy * GW + ix;
        const gp = gi * 3;

        const dr = Math.abs(bArr[gp] - r0) + Math.abs(bArr[gp + 1] - g0) + Math.abs(bArr[gp + 2] - b0);
        if (s >= 1 && dr > pass.colorCut * 3) break;

        let dx = tx[gi], dy = ty[gi];
        if (dx * prevDx + dy * prevDy < 0) { dx = -dx; dy = -dy; }
        const sm = 0.68;
        dx = prevDx * sm + dx * (1 - sm);
        dy = prevDy * sm + dy * (1 - sm);
        const dl = Math.hypot(dx, dy) || 1;
        dx /= dl; dy /= dl;
        prevDx = dx; prevDy = dy;

        cx += dx * stepGrid;
        cy += dy * stepGrid;
        if (cx < -3 || cx > GW + 3 || cy < -3 || cy > GH + 3) break;

        pts.push(cx / scale, cy / scale);

        // Stamp approximate coverage into workRGB so future strokes track remaining error
        const nx = clamp(Math.round(cx), 0, GW - 1);
        const ny = clamp(Math.round(cy), 0, GH - 1);
        const np = (ny * GW + nx) * 3;
        const mixA = clamp(pass.alpha * 0.85, 0.35, 0.9);
        workRGB[np] = lerp(workRGB[np], r0, mixA);
        workRGB[np + 1] = lerp(workRGB[np + 1], g0, mixA);
        workRGB[np + 2] = lerp(workRGB[np + 2], b0, mixA);
      }

      if (pts.length === 2) {
        const jAng = Math.atan2(prevDy, prevDx);
        const mini = isSeuratMaster && passIdx >= 1 ? 0.65 : Math.max(2.5, pass.wMin * 0.55);
        pts.push(pts[0] + Math.cos(jAng) * mini, pts[1] + Math.sin(jAng) * mini);
      }

      // Stamp seed location as well
      workRGB[p0] = lerp(workRGB[p0], r0, 0.82);
      workRGB[p0 + 1] = lerp(workRGB[p0 + 1], g0, 0.82);
      workRGB[p0 + 2] = lerp(workRGB[p0 + 2], b0, 0.82);

      const width = lerp(pass.wMin, pass.wMax, seedRand());
      const radG = Math.max(isMaster && passIdx >= 4 ? 0 : 1, Math.round(width * scale * 0.28));
      if (radG >= 1) {
        const mixD = clamp(pass.alpha * 0.78, 0.35, 0.88);
        for (let k = 0; k < pts.length; k += 2) {
          const sx = clamp(Math.round(pts[k] * scale), 0, GW - 1);
          const sy = clamp(Math.round(pts[k + 1] * scale), 0, GH - 1);
          for (let oy = -radG; oy <= radG; oy++) {
            const yy = sy + oy;
            if (yy < 0 || yy >= GH) continue;
            for (let ox = -radG; ox <= radG; ox++) {
              if (ox * ox + oy * oy > radG * radG) continue;
              const xx = sx + ox;
              if (xx < 0 || xx >= GW) continue;
              const pp = (yy * GW + xx) * 3;
              workRGB[pp] = lerp(workRGB[pp], r0, mixD);
              workRGB[pp + 1] = lerp(workRGB[pp + 1], g0, mixD);
              workRGB[pp + 2] = lerp(workRGB[pp + 2], b0, mixD);
            }
          }
        }
      }

      const jit = passIdx >= 4 ? 3 : 5;
      const cr = clamp(Math.round(r0 + (seedRand() - 0.5) * jit), 0, 255);
      const cg = clamp(Math.round(g0 + (seedRand() - 0.5) * jit), 0, 255);
      const cb = clamp(Math.round(b0 + (seedRand() - 0.5) * jit), 0, 255);

      const mainRgb = `rgb(${cr},${cg},${cb})`;
      const lum0 = 0.299 * r0 + 0.587 * g0 + 0.114 * b0;
      let alpha = pass.alpha * (0.9 + seedRand() * 0.1);
      const cap = pass.capMode || ((isKnife && passIdx >= 1) ? 'butt' : 'round');
      let bevel = pass.bevel;
      if (isRembrandtMaster && passIdx >= 2) {
        if (lum0 < 52) { bevel = 0; alpha *= 0.78; }
        else if (lum0 >= 95) { bevel = 1.55; }
      } else if (isTurnerMaster && passIdx >= 2) {
        if (r0 - b0 > 55) bevel = 1.25;
        else { bevel = 0; alpha *= 0.80; }
      }
      const doRelief = !isPoint && !isSeuratMaster && !isSfumatoMaster && passIdx >= 2 && bevel >= 0.4 && width >= 2.6;

      const layerId = layers[pass.layerIdx].id;
      if (!doRelief) {
        api.pushRawStroke(layerId, pass.label, (c) => {
          c.lineCap = cap;
          c.lineJoin = 'round';
          c.globalAlpha = alpha;
          c.strokeStyle = mainRgb;
          c.lineWidth = width;
          strokePath(c, pts);
          c.globalAlpha = 1;
        });
        return;
      }

      const sr = Math.max(0, cr - Math.round(24 * bevel));
      const sg = Math.max(0, cg - Math.round(24 * bevel));
      const sb = Math.max(0, cb - Math.round(20 * bevel));
      const shRgb = `rgb(${sr},${sg},${sb})`;
      const hr = Math.min(255, cr + Math.round(22 * bevel));
      const hg = Math.min(255, cg + Math.round(20 * bevel));
      const hb = Math.min(255, cb + Math.round(16 * bevel));
      const hiRgb = `rgb(${hr},${hg},${hb})`;
      const offSh = clamp(width * 0.12, 0.5, 2.2);
      const offHi = clamp(width * 0.11, 0.5, 2.0);
      const hiW = Math.max(0.9, width * 0.30);

      const shPts = pts.map(v => v + offSh);
      const hiPts = pts.map(v => v - offHi);

      api.pushRawStroke(layerId, pass.label, (c) => {
        c.lineCap = cap;
        c.lineJoin = 'round';
        c.globalAlpha = alpha * (isKnife ? 0.32 : 0.22);
        c.strokeStyle = shRgb;
        c.lineWidth = width * 1.02;
        strokePath(c, shPts);
        c.globalAlpha = alpha;
        c.strokeStyle = mainRgb;
        c.lineWidth = width;
        strokePath(c, pts);
        c.globalAlpha = alpha * (isKnife ? 0.42 : 0.26);
        c.strokeStyle = hiRgb;
        c.lineWidth = hiW;
        strokePath(c, hiPts);
        c.globalAlpha = 1;
      });
    }

    // Run Passes 1..N sequentially (with linear-time O(N) 64-bin bucket selection for ultra-dense masterworks)
    for (let pi = 0; pi < passes.length; pi++) {
      const pass = passes[pi];
      const bArr = pass.blur;
      let emitted = 0;

      if (pi === 0) {
        // Coarse uniform jittered grid covering 100% of canvas cells with zero skipped cells
        const cols = Math.max(12, Math.floor(Math.sqrt(pass.count * (GW / GH))));
        const rows = Math.max(10, Math.floor(pass.count / cols));
        const ptsList = [];
        for (let r = 0; r < rows; r++) {
          for (let col = 0; col < cols; col++) {
            const gx = clamp(Math.round(((col + 0.5 + (seedRand() - 0.5) * 0.42) / cols) * (GW - 1)), 0, GW - 1);
            const gy = clamp(Math.round(((r + 0.5 + (seedRand() - 0.5) * 0.42) / rows) * (GH - 1)), 0, GH - 1);
            ptsList.push([gx, gy]);
          }
        }
        for (let k = ptsList.length - 1; k > 0; k--) {
          const j = (seedRand() * (k + 1)) | 0;
          const tmp = ptsList[k]; ptsList[k] = ptsList[j]; ptsList[j] = tmp;
        }
        for (let k = 0; k < pass.count; k++) {
          const pt = ptsList[k % ptsList.length];
          traceAndPushStroke(pt[0], pt[1], pass, pi);
          emitted++;
        }
      } else if (isMaster) {
        const stride = (pi >= 4 && GW > 360) ? 1 : (pi >= 2 ? 2 : 3);
        const maxCands = Math.ceil(GW / stride) * Math.ceil(GH / stride);
        const candX = new Uint16Array(maxCands);
        const candY = new Uint16Array(maxCands);
        const candScore = new Float32Array(maxCands);
        let cCount = 0;
        let maxS = 1e-3;
        for (let gy = 0; gy < GH; gy += stride) {
          for (let gx = 0; gx < GW; gx += stride) {
            const jx = stride === 1 ? gx : clamp(gx + Math.floor(seedRand() * stride), 0, GW - 1);
            const jy = stride === 1 ? gy : clamp(gy + Math.floor(seedRand() * stride), 0, GH - 1);
            const gi = jy * GW + jx;
            const gp = gi * 3;
            const err = (Math.abs(bArr[gp] - workRGB[gp]) + Math.abs(bArr[gp + 1] - workRGB[gp + 1]) + Math.abs(bArr[gp + 2] - workRGB[gp + 2])) * 0.333;
            if (err < pass.errThresh && gradNorm[gi] < 0.22 && pi < 4) continue;
            const score = (err + 6) * (1 + gradNorm[gi] * pass.edgeBias) * roiBoostAt(jx, jy) * (0.65 + seedRand() * 0.7);
            candX[cCount] = jx;
            candY[cCount] = jy;
            candScore[cCount] = score;
            if (score > maxS) maxS = score;
            cCount++;
          }
        }
        const targetPool = Math.min(cCount, Math.round(pass.count * 1.25));
        const NBINS = 64;
        const binCounts = new Int32Array(NBINS);
        const invMax = (NBINS - 1) / maxS;
        for (let i = 0; i < cCount; i++) {
          const b = clamp((candScore[i] * invMax) | 0, 0, NBINS - 1);
          binCounts[b]++;
        }
        let cutoffBin = 0, accBin = 0;
        for (let b = NBINS - 1; b >= 0; b--) {
          accBin += binCounts[b];
          cutoffBin = b;
          if (accBin >= targetPool) break;
        }
        const picked = new Int32Array(Math.max(pass.count, accBin));
        let pk = 0;
        for (let i = 0; i < cCount; i++) {
          if (((candScore[i] * invMax) | 0) >= cutoffBin) {
            picked[pk++] = i;
          }
        }
        if (pk === 0) {
          for (let k = 0; k < pass.count; k++) {
            traceAndPushStroke((seedRand() * GW) | 0, (seedRand() * GH) | 0, pass, pi);
          }
        } else {
          for (let k = pk - 1; k > 0; k--) {
            const j = (seedRand() * (k + 1)) | 0;
            const tmp = picked[k]; picked[k] = picked[j]; picked[j] = tmp;
          }
          const selLen = Math.min(pk, targetPool);
          while (emitted < pass.count) {
            const ci = picked[emitted % selLen];
            traceAndPushStroke(candX[ci], candY[ci], pass, pi);
            emitted++;
          }
        }
      } else {
        // Build scored pool: sample candidate grid, rank by error + edge gradient + focal ROI
        const pool = [];
        const stride = pi >= 3 ? 2 : 3;
        for (let gy = 0; gy < GH; gy += stride) {
          for (let gx = 0; gx < GW; gx += stride) {
            const jx = clamp(gx + Math.floor(seedRand() * stride), 0, GW - 1);
            const jy = clamp(gy + Math.floor(seedRand() * stride), 0, GH - 1);
            const gi = jy * GW + jx;
            const gp = gi * 3;
            const err = (Math.abs(bArr[gp] - workRGB[gp]) + Math.abs(bArr[gp + 1] - workRGB[gp + 1]) + Math.abs(bArr[gp + 2] - workRGB[gp + 2])) * 0.333;
            if (err < pass.errThresh && gradNorm[gi] < 0.25 && pi < 4) continue;
            const score = (err + 6) * (1 + gradNorm[gi] * pass.edgeBias) * roiBoostAt(jx, jy) * (0.65 + seedRand() * 0.7);
            pool.push({ gx: jx, gy: jy, score });
          }
        }
        if (pool.length < pass.count) {
          while (pool.length < pass.count) {
            pool.push({ gx: (seedRand() * GW) | 0, gy: (seedRand() * GH) | 0, score: 1 });
          }
        }
        pool.sort((a, b) => b.score - a.score);
        const takePool = pool.slice(0, Math.min(pool.length, Math.round(pass.count * 1.25)));
        for (let k = takePool.length - 1; k > 0; k--) {
          const j = (seedRand() * (k + 1)) | 0;
          const tmp = takePool[k]; takePool[k] = takePool[j]; takePool[j] = tmp;
        }
        while (emitted < pass.count) {
          const cand = takePool[emitted % takePool.length];
          traceAndPushStroke(cand.gx, cand.gy, pass, pi);
          emitted++;
        }
      }
    }
  }

  window.Code2PaintOilMaster = {
    TAU,
    clamp,
    lerp,
    smooth,
    mix3,
    rampColor,
    makeNoise,
    createScene,
    synthesize
  };
})();
