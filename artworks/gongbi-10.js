(function () {
  'use strict';

  // 10 Song-Court / Dunhuang-Grade Gongbi Works (7,200 - 9,600 strokes each)
  let GM = null;
  let P = null;
  function ensureGM() {
    if (!GM) {
      GM = window.Code2PaintGongbiMaster;
      P = GM.PIGMENTS;
    }
    return GM;
  }

  const GONGBI_LAYERS = [
    { id: 1, name: '一 · 双勾白描起稿' },
    { id: 2, name: '二 · 分染底色渐晕' },
    { id: 3, name: '三 · 罩染矿彩叶脉' },
    { id: 4, name: '四 · 丝毛羽纹细节' },
    { id: 5, name: '五 · 泥金提白钤印' }
  ];

  // Helper: Woody gnarled stem with double-contour, bark wash & fissures cleanly inside trunk
  function drawWoodyBranch(api, rng, pts, widths, opts = {}) {
    ensureGM();
    const smoothSpine = GM.catmullRom(pts, 10, false);
    const n = smoothSpine.length;
    const left = [], right = [];
    for (let i = 0; i < n; i++) {
      const u = i / Math.max(1, n - 1);
      const prev = smoothSpine[Math.max(0, i - 1)];
      const next = smoothSpine[Math.min(n - 1, i + 1)];
      const tx = next[0] - prev[0], ty = next[1] - prev[1];
      const norm = Math.hypot(tx, ty) || 1;
      const nx = -ty / norm, ny = tx / norm;
      const gnarl = opts.gnarl ? Math.sin(u * 17 + i * 0.4) * opts.gnarl : 0;
      const hw = Math.max(1.2, GM.lerp(widths[0], widths[1], Math.pow(u, 0.85)) * 0.5 + gnarl);
      left.push([smoothSpine[i][0] + nx * hw, smoothSpine[i][1] + ny * hw]);
      right.unshift([smoothSpine[i][0] - nx * hw, smoothSpine[i][1] - ny * hw]);
    }
    const poly = left.concat(right);
    GM.baimiaoStroke(api, 1, opts.label || '老干铁线双勾', poly, {
      closed: true, raw: true, width: opts.lineWidth || 1.35, color: P.inkDeep, alpha: 0.86, style: 'bark', chunkSize: 12
    });
    GM.baseShadePoly(api, 2, '枝干赭墨统染', poly, {
      baseColor: opts.baseColor || '#7d6147', baseAlpha: 0.86,
      shadeColor: opts.shadeColor || '#3c2e22', shadeAlpha: 0.62,
      gradFrom: smoothSpine[0], gradTo: smoothSpine[n - 1]
    });
    GM.fenranRegion(api, 3, '枝干老皮分染', poly, rng, {
      count: opts.washCount || Math.max(36, Math.round(n * 1.4)),
      colorFrom: '#3d2f24', colorTo: '#9c7e5d',
      gradFrom: left[Math.floor(n * 0.5)], gradTo: right[Math.floor(n * 0.5)],
      alphaMin: 0.035, alphaMax: 0.12, dabScale: 1.0
    });
    // Calligraphic bark fissures staying strictly within inner 65% of branch width
    const fissureCount = opts.fissures != null ? opts.fissures : 14;
    for (let f = 0; f < fissureCount; f++) {
      const idx = Math.floor(rng() * Math.max(1, n - 10)) + 2;
      const len = Math.min(n - 1 - idx, 5 + Math.floor(rng() * 10));
      const lat = (rng() - 0.5) * 0.34;
      const sub = [];
      for (let k = 0; k <= len; k++) {
        const pt = smoothSpine[idx + k];
        const rx = left[idx + k][0] - right[n - 1 - idx - k][0];
        const ry = left[idx + k][1] - right[n - 1 - idx - k][1];
        sub.push([pt[0] + rx * lat, pt[1] + ry * lat]);
      }
      GM.baimiaoStroke(api, 4, '树皮皴纹', sub, {
        raw: true, width: 0.8, color: P.inkDeep, alpha: 0.58, style: 'bark', chunkSize: 6
      });
    }
    return smoothSpine;
  }

  // Slender herbaceous leaf petiole / flower stem connecting smoothly into branch
  function drawPetiole(api, x0, y0, x1, y1, colHex, width = 1.6) {
    const mx = GM.lerp(x0, x1, 0.5) + (y1 - y0) * 0.08;
    const my = GM.lerp(y0, y1, 0.5) - (x1 - x0) * 0.08;
    GM.baimiaoStroke(api, 1, '叶柄花梗连接', [[x0, y0], [mx, my], [x1, y1]], {
      width, color: colHex || P.oliveDark, alpha: 0.82, chunkSize: 6
    });
    GM.baimiaoStroke(api, 2, '花梗设色', [[x0, y0], [mx, my], [x1, y1]], {
      width: width * 0.72, color: '#6b7a48', alpha: 0.72, chunkSize: 6
    });
  }

  // Radiating Gongbi pine needle fan attached tightly onto a pine twig socket
  function drawPineCluster(api, rng, cx, cy, angle, radius, needleCount, colDark, colLight) {
    for (let i = 0; i < needleCount; i++) {
      const f = i / Math.max(1, needleCount - 1);
      const spread = (f - 0.5) * 2.05 + (rng() - 0.5) * 0.1;
      const a = angle + spread;
      const len = radius * (0.68 + 0.36 * Math.sin(f * Math.PI) + (rng() - 0.5) * 0.12);
      const bend = (rng() - 0.5) * 0.11;
      const mx = cx + Math.cos(a + bend) * len * 0.52;
      const my = cy + Math.sin(a + bend) * len * 0.52;
      const ex = cx + Math.cos(a) * len;
      const ey = cy + Math.sin(a) * len;
      const col = GM.rgbaStr(rng() > 0.38 ? colDark : colLight, 0.54 + rng() * 0.28);
      GM.pushRaw(api, 4, '松针双勾丝细', (c) => {
        c.save();
        c.strokeStyle = col;
        c.lineWidth = 0.85;
        c.lineCap = 'round';
        c.beginPath();
        c.moveTo(cx, cy);
        c.quadraticCurveTo(mx, my, ex, ey);
        c.stroke();
        c.restore();
      }, 'vein');
    }
    GM.pushRaw(api, 3, '松蒂墨染', (c) => {
      c.save();
      c.fillStyle = GM.rgbaStr(P.burntOchre, 0.82);
      c.beginPath();
      c.ellipse(cx, cy, 4.2, 3.0, angle, 0, GM.TAU);
      c.fill();
      c.restore();
    }, 'baseWash');
  }

  // Scalloped Bird Wing Covert Tiers (层叠羽盖)
  function drawWingCoverts(api, rng, originX, originY, rows, cols, angle, baseColor, rimColor, barColor) {
    const cosA = Math.cos(angle), sinA = Math.sin(angle);
    const nx = -sinA, ny = cosA;
    for (let r = 0; r < rows; r++) {
      for (let col = 0; col < cols; col++) {
        const cx = originX + cosA * r * 12 + nx * (col - (cols - 1) * 0.5) * 12;
        const cy = originY + sinA * r * 12 + ny * (col - (cols - 1) * 0.5) * 12;
        const fw = 11 + r * 3.2;
        const fl = 18 + r * 8;
        const poly = [];
        for (let k = 0; k <= 12; k++) {
          const u = k / 12;
          const th = -Math.PI * 0.46 + u * Math.PI * 0.92;
          const rx = fl * Math.cos(th);
          const ry = fw * 0.5 * Math.sin(th);
          poly.push([cx + cosA * rx + nx * ry, cy + sinA * rx + ny * ry]);
        }
        poly.push([cx, cy]);
        GM.baimiaoStroke(api, 1, '覆羽双勾', poly, { closed: true, raw: true, width: 0.65, color: P.inkMid, alpha: 0.58 });
        GM.baseShadePoly(api, 2, '覆羽平涂', poly, {
          baseColor, baseAlpha: 0.86, shadeColor: rimColor, shadeAlpha: 0.45,
          gradFrom: [cx, cy], gradTo: [cx + cosA * fl, cy + sinA * fl]
        });
        if (barColor && r % 2 === 1) {
          GM.baimiaoStroke(api, 4, '覆羽暗斑复勒', poly.slice(2, 10), {
            raw: true, width: 0.95, color: barColor, alpha: 0.68
          });
        }
        const tips = [];
        for (let b = 2; b < 10; b += 2) tips.push([poly[b][0], poly[b][1], 0, 0]);
        GM.striationLines(api, 4, '覆羽丝毛', [cx, cy], tips, {
          color: GM.mixHex(rimColor, P.clamWhite, 0.35), alpha: 0.36, width: 0.44, batch: 2
        });
      }
    }
  }

  // Multi-tier Peony / Camellia Blossom with clean outer-to-inner petal layering
  function drawRichBlossom(api, rng, spec) {
    const {
      cx, cy, R, tiers,
      baseColor, rootColor, midColor, tipColor, outlineColor,
      notches = 2,
      tilt = 0.82,
      stamenColor = P.gooseYellow,
      filamentColor = P.cinnabar,
      stamenCount = 46,
      layers = { line: 1, base: 2, wash: 3, detail: 4, highlight: 5 }
    } = spec;

    for (let t = 0; t < tiers.length; t++) {
      const tier = tiers[t];
      const nP = tier.count;
      const rDist = R * tier.distFrac;
      const pLen = R * tier.lenFrac;
      const pWid = R * tier.widFrac;
      for (let i = 0; i < nP; i++) {
        const ang = (i / nP) * GM.TAU + (tier.rot || 0) + (rng() - 0.5) * 0.14;
        const px = cx + Math.cos(ang) * rDist;
        const py = cy + Math.sin(ang) * rDist * tilt + (tier.yShift || 0);
        const depthDark = 1 - t / Math.max(1, tiers.length);
        GM.drawFlowerPetal(api, rng, {
          cx: px,
          cy: py,
          angle: ang,
          length: pLen * (0.92 + rng() * 0.14),
          width: pWid * (0.92 + rng() * 0.14),
          notches,
          tilt,
          curl: i * 1.1,
          baseColor,
          baseAlpha: 0.90,
          rootColor: GM.mixHex(rootColor, P.deepCarmine, depthDark * 0.25),
          midColor,
          tipColor,
          outlineColor,
          tipHighlight: t >= 1,
          washCount: Math.max(16, Math.round(pLen * 0.36)),
          layers
        });
      }
    }
    GM.lifenStamens(api, layers.highlight, cx, cy - R * 0.04, rng, {
      count: stamenCount,
      rInner: R * 0.08,
      rOuter: R * 0.24,
      tilt: tilt * 0.88,
      filamentColor,
      pollenColor: stamenColor,
      pollenShadow: P.burntOchre,
      dotSize: GM.clamp(R * 0.018, 1.5, 2.5)
    });
  }

  function drawMistBand(api, rng, cx, cy, rx, ry, count = 64) {
    for (let i = 0; i < count; i++) {
      const f = i / Math.max(1, count - 1);
      const px = cx + (f - 0.5) * rx * 1.85 + (rng() - 0.5) * 28;
      const py = cy + Math.sin(f * Math.PI * 2.5) * ry * 0.3 + (rng() - 0.5) * 12;
      const erx = 28 + rng() * (rx * 0.24);
      const ery = 10 + rng() * (ry * 0.42);
      const hex = rng() > 0.25 ? '#efe6d0' : P.clamWhite;
      const a = 0.055 + rng() * 0.085;
      const cCenter = GM.rgbaStr(hex, a);
      const cMid = GM.rgbaStr(hex, a * 0.42);
      const cEdge = GM.rgbaStr(hex, 0);
      const rot = (rng() - 0.5) * 0.15;
      GM.pushRaw(api, 3, '祥云留白微晕', (c) => {
        c.save();
        c.translate(px, py); c.rotate(rot); c.scale(erx, ery);
        const g = c.createRadialGradient(0, 0, 0, 0, 0, 1);
        g.addColorStop(0, cCenter); g.addColorStop(0.55, cMid); g.addColorStop(1, cEdge);
        c.fillStyle = g;
        c.beginPath(); c.arc(0, 0, 1, 0, GM.TAU); c.fill();
        c.restore();
      }, 'groundWash');
    }
  }

  const WORKS = [
    // =========================================================================
    // 1. 工笔·姚黄魏紫牡丹
    // =========================================================================
    {
      id: 'gongbi-peony',
      title: '工笔·姚黄魏紫牡丹',
      subtitle: '南宋院体工笔重彩：游丝双勾三十二瓣 → 三矾九染分染留水线 → 复勒立粉金蕊 → 凤蝶丝毛',
      group: '国画·工笔',
      category: '工笔花鸟',
      seal: '工笔花鸟',
      mode: 'gongbi',
      width: 960,
      height: 1180,
      seed: 1001,
      swatches: ['rgb(235, 224, 200)', 'rgb(166, 36, 66)', 'rgb(245, 212, 220)', 'rgb(45, 98, 62)', 'rgb(230, 195, 92)'],
      desc: '摹南宋院体花鸟设色法度，下置瘦漏太湖石为基，中写老干红梗连缀复叶与魏紫、姚黄重瓣牡丹并花蕾，翻卷复叶留水线分染，凤蝶振翅欲栖。',
      layers: GONGBI_LAYERS,
      analysis: {
        original: '南宋院体《出水芙蓉》《洛阳牡丹图》册页设色法',
        movement: '宋代院体工笔重彩花鸟',
        palette: '古绢茶底 · 胭脂曙红 · 藤黄鹅黄 · 石绿花青 · 蛤粉泥金',
        technique: '三矾九染 · 瓣尖蛤粉提染 · 叶脉留水线 · 立粉点蕊 · 凤蝶丝毛',
        algorithm: '先勾勒三十二瓣缺刻曲线与连枝叶柄复叶，渐晕柔染由瓣基向瓣尖淡化，叶筋双侧深染留白水线，最后外缘复勒并压立粉金蕊。'
      },
      buildStrokes(api) {
        ensureGM();
        const rng = GM.makeRng(1001);
        const W = 960, H = 1180;

        GM.silkHaloGround(api, 2, W, H, rng, {
          count: 420, focusX: 500, focusY: 480, focusR: 360,
          haloLight: true, warmColor: P.silkTea, coolColor: P.teaGreen
        });

        // Sculptural Angular Taihu Rock lower-right (瘦漏皱透 crags)
        GM.drawTaihuRock(api, rng, {
          outerPts: [
            [520, 1148], [488, 1020], [538, 938], [500, 868], [555, 795],
            [638, 760], [728, 742], [835, 785], [855, 865], [798, 932], [882, 1032], [855, 1148]
          ],
          holes: [
            [[612, 855], [662, 832], [692, 875], [652, 912], [602, 890]],
            [[692, 975], [748, 955], [770, 1005], [728, 1038], [685, 1005]],
            [[572, 1012], [602, 992], [618, 1024], [584, 1042]]
          ],
          mossCount: 52
        });

        // Woody trunks stopping cleanly underneath blossom receptacles
        drawWoodyBranch(api, rng, [[225, 1145], [260, 945], [312, 748], [385, 595], [442, 488]], [36, 12], {
          label: '牡丹老干双勾', gnarl: 2.0, washCount: 88, fissures: 16
        });
        drawWoodyBranch(api, rng, [[312, 755], [468, 695], [595, 652], [678, 622]], [22, 8], {
          label: '右斜花枝', gnarl: 1.2, washCount: 58, fissures: 9
        });
        drawWoodyBranch(api, rng, [[315, 742], [275, 565], [295, 430], [315, 378]], [15, 6], {
          label: '左挺嫩梢', baseColor: '#7a8a53', shadeColor: '#485432', gnarl: 0.7, washCount: 38, fissures: 4
        });

        // Leaves WITH curved herbaceous petioles attached to branch nodes (zero floating leaves!)
        const leaves = [
          { node: [285, 815], x: 258, y: 775, angle: 2.68, length: 156, width: 60, bend: 0.14, isBack: false, serrated: true },
          { node: [285, 815], x: 252, y: 785, angle: 2.12, length: 138, width: 54, bend: -0.12, isBack: true, serrated: true },
          { node: [302, 720], x: 255, y: 695, angle: 3.12, length: 135, width: 52, bend: 0.1, isBack: false, serrated: true },
          { node: [358, 635], x: 342, y: 565, angle: -2.55, length: 148, width: 56, bend: -0.13, isBack: false, serrated: true },
          { node: [358, 635], x: 325, y: 535, angle: -2.02, length: 128, width: 46, bend: 0.09, isBack: true, serrated: true, autumnTip: true },
          { node: [412, 718], x: 425, y: 635, angle: 1.88, length: 148, width: 58, bend: 0.15, isBack: false, serrated: true },
          { node: [412, 718], x: 468, y: 655, angle: 1.25, length: 142, width: 54, bend: -0.1, isBack: true, serrated: true },
          { node: [548, 670], x: 562, y: 695, angle: 0.65, length: 162, width: 62, bend: 0.12, isBack: false, serrated: true },
          { node: [548, 670], x: 602, y: 722, angle: 1.15, length: 142, width: 54, bend: -0.14, isBack: false, serrated: true },
          { node: [648, 634], x: 688, y: 645, angle: 0.25, length: 152, width: 56, bend: 0.11, isBack: false, serrated: true },
          { node: [648, 634], x: 740, y: 568, angle: -0.35, length: 136, width: 48, bend: -0.09, isBack: true, serrated: true },
          { node: [450, 500], x: 585, y: 492, angle: -0.82, length: 138, width: 52, bend: 0.12, isBack: false, serrated: true },
          { node: [305, 515], x: 258, y: 495, angle: 2.85, length: 128, width: 48, bend: -0.1, isBack: false, serrated: true, wormBite: true },
          { node: [485, 765], x: 472, y: 815, angle: 2.35, length: 158, width: 58, bend: 0.12, isBack: false, serrated: true },
          { node: [485, 765], x: 515, y: 785, angle: 1.48, length: 142, width: 52, bend: -0.08, isBack: true, serrated: true }
        ];
        leaves.forEach(lf => {
          drawPetiole(api, lf.node[0], lf.node[1], lf.x, lf.y, '#6b4d38', 1.8);
          GM.drawGongbiLeaf(api, rng, lf);
        });

        // Crimson Bud at left (315, 365) with cupping sepals
        for (let b = 0; b < 5; b++) {
          const ang = -Math.PI * 0.5 + (b - 2) * 0.25;
          GM.drawFlowerPetal(api, rng, {
            cx: 315, cy: 372, angle: ang, length: 44 - Math.abs(b - 2) * 4, width: 32,
            notches: 1, tilt: 0.88, baseAlpha: 0.92,
            baseColor: '#d97886', rootColor: P.carmine, midColor: '#b53a4e', tipColor: '#f3d2d8',
            outlineColor: '#5c1f2c', washCount: 16
          });
        }
        GM.drawGongbiLeaf(api, rng, { x: 300, y: 376, angle: -2.1, length: 56, width: 18, bend: -0.22, isBack: true });
        GM.drawGongbiLeaf(api, rng, { x: 330, y: 376, angle: -1.0, length: 54, width: 18, bend: 0.22, isBack: true });

        // Grand Weizi Peony (455, 420)
        drawRichBlossom(api, rng, {
          cx: 455, cy: 420, R: 162, tilt: 0.84, notches: 3,
          baseColor: '#efd6dc', rootColor: '#6d1730', midColor: '#b53953', tipColor: '#f8eff2',
          outlineColor: '#5c2432',
          tiers: [
            { count: 10, distFrac: 0.16, lenFrac: 0.84, widFrac: 0.62, rot: 0.15, yShift: 6 },
            { count: 9, distFrac: 0.13, lenFrac: 0.68, widFrac: 0.56, rot: 0.45, yShift: 2 },
            { count: 8, distFrac: 0.09, lenFrac: 0.52, widFrac: 0.48, rot: 0.05, yShift: -2 },
            { count: 6, distFrac: 0.05, lenFrac: 0.34, widFrac: 0.36, rot: 0.35, yShift: -6 }
          ],
          stamenCount: 54
        });

        // Secondary Yaohuang Cream-Gold Peony (695, 588)
        drawRichBlossom(api, rng, {
          cx: 695, cy: 588, R: 124, tilt: 0.82, notches: 3,
          baseColor: '#f7efd6', rootColor: '#b57b28', midColor: '#e7c66c', tipColor: P.clamWhite,
          outlineColor: '#7a5a2c',
          tiers: [
            { count: 9, distFrac: 0.16, lenFrac: 0.82, widFrac: 0.60, rot: 0.25 },
            { count: 8, distFrac: 0.12, lenFrac: 0.64, widFrac: 0.52, rot: 0.62 },
            { count: 6, distFrac: 0.07, lenFrac: 0.44, widFrac: 0.40, rot: 0.12 }
          ],
          stamenColor: '#f7dc7a', filamentColor: '#b85c28', stamenCount: 38
        });

        // Swallowtail Butterfly top-right (740, 265)
        const bx = 740, by = 265;
        const forewingTop = [[bx, by - 5], [bx + 54, by - 76], [bx + 92, by - 46], [bx + 84, by - 4], [bx + 24, by + 6]];
        const forewingBack = [[bx - 4, by - 4], [bx + 26, by - 64], [bx + 58, by - 40], [bx + 20, by + 4]];
        const hindwing = [[bx, by + 4], [bx + 72, by + 2], [bx + 82, by + 44], [bx + 62, by + 66], [bx + 36, by + 84], [bx + 44, by + 48], [bx + 12, by + 38]];
        [forewingBack, forewingTop, hindwing].forEach((wp, idx) => {
          const sm = GM.catmullRom(wp, 5, true);
          GM.baimiaoStroke(api, 1, '凤蝶翅廓', sm, { closed: true, raw: true, width: 0.95, color: P.inkDeep, alpha: 0.86 });
          GM.baseShadePoly(api, 2, '凤蝶青金设色', sm, {
            baseColor: idx === 2 ? '#294866' : '#355978', baseAlpha: 0.88,
            shadeColor: idx === 2 ? '#e0bd62' : '#d6b458', shadeAlpha: 0.48,
            gradFrom: [bx, by], gradTo: wp[2]
          });
          GM.fenranRegion(api, 3, '凤蝶鳞粉分染', sm, rng, {
            count: 34, colorFrom: P.inkIndigo, colorTo: '#84b2bf', gradFrom: [bx, by], gradTo: wp[2],
            alphaMin: 0.04, alphaMax: 0.15
          });
          GM.striationLines(api, 4, '凤蝶翅脉', [bx, by], wp.slice(1, 4).map(pt => [pt[0], pt[1], 0, 0]), { color: P.inkDeep, alpha: 0.65, width: 0.72, batch: 2 });
        });
        const bfBody = GM.catmullRom([[bx - 16, by + 18], [bx - 4, by + 4], [bx + 10, by - 12], [bx + 2, by - 16], [bx - 14, by + 2]], 4, true);
        GM.baimiaoStroke(api, 1, '凤蝶身躯', bfBody, { closed: true, raw: true, width: 1.0, color: P.inkDeep });
        GM.baseShadePoly(api, 2, '凤蝶身敷彩', bfBody, { baseColor: P.inkDeep, baseAlpha: 0.92, shadeColor: '#5c4936', shadeAlpha: 0.4 });
        GM.simaoTract(api, 4, '凤蝶胸绒丝毛', bfBody, rng, { count: 48, lenMin: 3, lenMax: 7, color: P.inkDeep, colorAlt: '#a68952', width: 0.55 });
        GM.baimiaoStroke(api, 4, '凤蝶触须', [[bx + 6, by - 13], [bx + 26, by - 36], [bx + 36, by - 46]], { width: 0.8, color: P.inkDeep, style: 'dingtou' });
        GM.baimiaoStroke(api, 4, '凤蝶触须', [[bx + 2, by - 15], [bx + 14, by - 42], [bx + 20, by - 54]], { width: 0.8, color: P.inkDeep, style: 'dingtou' });
        [[bx + 56, by - 36], [bx + 68, by - 22], [bx + 54, by + 26], [bx + 66, by + 36]].forEach(([gx, gy]) => {
          GM.pushRaw(api, 5, '凤蝶泥金斑', (c) => {
            c.save(); c.fillStyle = GM.rgbaStr(P.goldPale, 0.88);
            c.beginPath(); c.ellipse(gx, gy, 5.2, 3.6, 0.4, 0, GM.TAU); c.fill(); c.restore();
          }, 'gold');
        });

        GM.finalizeGongbiBudget(api, rng, W, H, {
          target: 8600, minTarget: 7200, maxTarget: 9600,
          focusX: 500, focusY: 480, focusR: 350, haloLight: true,
          inscription: { x: 155, y: 155, text: '国色天香', opts: { size: 32, stepY: 42, color: '#2b221a' } },
          seal: { x: 155, y: 360, text: '富贵', opts: { size: 40, color: '#9c2d23' } }
        });
      }
    },

    // =========================================================================
    // 2. 工笔·荷香锦鲤
    // =========================================================================
    {
      id: 'gongbi-lotus-carp',
      title: '工笔·荷香锦鲤',
      subtitle: '仿吴炳《出水芙蓉》设色：双勾荷瓣胭脂提尖 → 伞盖荷叶留水线露珠 → 双鲤网鳞泥金提亮',
      group: '国画·工笔',
      category: '工笔花鸟',
      seal: '工笔重彩',
      mode: 'gongbi',
      width: 960,
      height: 1180,
      seed: 1002,
      swatches: ['rgb(235, 224, 200)', 'rgb(206, 74, 96)', 'rgb(42, 108, 72)', 'rgb(212, 68, 36)', 'rgb(232, 188, 74)'],
      desc: '熟宣工笔师法宋人《出水芙蓉》与《鱼藻图》，伞形青荷与卷荷叶留出细白水线叶筋并缀晶莹露珠，莲花渐晕红尖并托绿萼；池下双锦鲤网鳞金边游曳。',
      layers: GONGBI_LAYERS,
      analysis: {
        original: '南宋吴炳《出水芙蓉图》与宋代《鱼藻图》工笔技法',
        movement: '宋元花鸟鱼藻工笔重彩',
        palette: '青灰池水晕 · 胭脂曙红 · 头绿三绿 · 朱砂泥金 · 蛤粉',
        technique: '荷叶十八射脉水线 · 瓣尖晕红 · 网鳞分染金边 · 露珠三点提白',
        algorithm: '先勾大荷叶卷边、莲花花萼莲蓬与双尾锦鲤线稿，内控留水线柔染石绿与胭脂尖红，再对锦鲤施以网状鱼鳞复勒与泥金鳍条。'
      },
      buildStrokes(api) {
        ensureGM();
        const rng = GM.makeRng(1002);
        const W = 960, H = 1180;

        GM.silkHaloGround(api, 2, W, H, rng, {
          count: 420, focusX: 520, focusY: 420, focusR: 340,
          haloLight: true, warmColor: P.silkTea, coolColor: P.celadonMist
        });

        // Subtle curved water ripples across lower pond
        for (let r = 0; r < 68; r++) {
          const wy = 715 + rng() * 420;
          const wx = 140 + rng() * 680;
          const len = 48 + rng() * 140;
          const curve = [
            [wx - len * 0.5, wy],
            [wx - len * 0.16, wy - 4 - rng() * 4],
            [wx + len * 0.18, wy + 4 + rng() * 4],
            [wx + len * 0.5, wy]
          ];
          GM.baimiaoStroke(api, 4, '清波细水纹', curve, {
            width: 0.72, color: '#6b7e6f', alpha: 0.34, style: 'yousi', chunkSize: 8
          });
        }

        for (let d = 0; d < 24; d++) {
          const dx = 160 + rng() * 640;
          const dy = 720 + rng() * 340;
          const dr = 5 + rng() * 6;
          const ang = rng() * GM.TAU;
          const col = GM.rgbaStr(rng() > 0.4 ? P.sapGreen : P.malachitePale, 0.65);
          GM.pushRaw(api, 3, '浮萍碧点', (c) => {
            c.save(); c.fillStyle = col; c.strokeStyle = 'rgba(38,54,34,0.6)'; c.lineWidth = 0.6;
            c.beginPath(); c.ellipse(dx, dy, dr * 1.15, dr * 0.88, ang, 0, GM.TAU); c.fill(); c.stroke(); c.restore();
          }, 'baseWash');
        }

        // Slender lotus stems with fine prickly thorns ending INSIDE calyxes/scrolls
        const stemPaths = [
          [[545, 326], [538, 610], [525, 1080]],
          [[360, 326], [372, 650], [392, 1075]],
          [[718, 498], [690, 780], [665, 1065]]
        ];
        stemPaths.forEach((sp, si) => {
          const curve = GM.catmullRom(sp, 12, false);
          GM.baimiaoStroke(api, 1, '荷梗双勾', curve, { raw: true, width: si === 0 ? 3.2 : 2.3, color: P.oliveDark, alpha: 0.78 });
          for (let k = 4; k < curve.length - 4; k += 4) {
            const p = curve[k];
            const sgn = k % 8 === 0 ? 1 : -1;
            GM.pushRaw(api, 4, '荷梗小刺', (c) => {
              c.save(); c.fillStyle = 'rgba(42,36,24,0.72)';
              c.beginPath(); c.arc(p[0] + sgn * 3.5, p[1], 1.15, 0, GM.TAU); c.fill(); c.restore();
            }, 'vein');
          }
        });

        // Giant Umbrella Lotus Pad centered around (375, 570)
        const padX = 375, padY = 568;
        const padPoly = [];
        const nRim = 48;
        for (let i = 0; i < nRim; i++) {
          const a = (i / nRim) * GM.TAU;
          const wave = 1 + 0.048 * Math.sin(a * 9 + 0.6) + 0.025 * Math.cos(a * 5);
          const rx = 248 * wave, ry = 104 * wave;
          padPoly.push([padX + Math.cos(a) * rx, padY + Math.sin(a) * ry]);
        }
        GM.baimiaoStroke(api, 1, '大荷叶波折边双勾', padPoly, { closed: true, raw: true, width: 1.25, color: P.inkDeep, alpha: 0.85, style: 'tiexian', chunkSize: 12 });
        GM.baseShadePoly(api, 2, '荷叶头绿三绿统染', padPoly, {
          baseColor: P.malachiteMid, baseAlpha: 0.84,
          shadeColor: P.malachiteDeep, shadeAlpha: 0.56,
          gradFrom: [padX, padY - 30], gradTo: [padX + 180, padY + 90]
        });

        const navel = [362, 558];
        for (let s = 0; s < 16; s++) {
          const a = (s / 16) * GM.TAU + 0.12;
          const wave = 1 + 0.048 * Math.sin(a * 9 + 0.6) + 0.025 * Math.cos(a * 5);
          const ex = padX + Math.cos(a) * 238 * wave;
          const ey = padY + Math.sin(a) * 98 * wave;
          const mid = [GM.lerp(navel[0], ex, 0.55) + Math.cos(a + 0.3) * 10, GM.lerp(navel[1], ey, 0.55) + Math.sin(a + 0.3) * 6];
          const spoke = [navel, mid, [ex, ey]];
          GM.baimiaoStroke(api, 4, '荷叶放射水线', spoke, { width: 1.4, color: '#b4cf94', alpha: 0.78, chunkSize: 6 });
          GM.baimiaoStroke(api, 4, '荷脉细筋复勒', spoke, { width: 0.52, color: P.oliveDark, alpha: 0.45, chunkSize: 6 });
        }
        GM.fenranRegion(api, 3, '荷叶深绿花青分染', padPoly, rng, {
          count: 140, colorFrom: P.malachiteDeep, colorTo: '#8fc092',
          gradFrom: [padX - 40, padY - 20], gradTo: [padX + 210, padY + 95],
          alphaMin: 0.035, alphaMax: 0.13, dabScale: 1.25
        });

        // Folded lower rim flush along actual padPoly vertices (idx 6..18)
        const botArc = padPoly.slice(6, 19);
        const foldPts = GM.catmullRom([...botArc, [395, 628], [265, 626]], 4, true);
        GM.baimiaoStroke(api, 1, '荷叶卷边双勾', foldPts, { closed: true, raw: true, width: 1.0, color: P.inkMid });
        GM.baseShadePoly(api, 3, '荷叶反面三绿粉染', foldPts, { baseColor: '#a6c496', baseAlpha: 0.88, shadeColor: '#698e62', shadeAlpha: 0.38 });
        GM.pushRaw(api, 4, '荷脐圈点', (c) => {
          c.save(); c.fillStyle = GM.rgbaStr('#c6c78c', 0.85);
          c.beginPath(); c.ellipse(navel[0], navel[1], 11, 5.5, -0.08, 0, GM.TAU); c.fill(); c.restore();
        }, 'vein');

        // Sculpted Rolled Cupped Young Lotus Leaf (卷荷) at right (718, 498)
        const cupBack = GM.catmullRom([[648, 468], [678, 422], [755, 428], [798, 472], [752, 505], [682, 502]], 5, true);
        const cupFront = GM.catmullRom([[648, 468], [718, 502], [798, 472], [748, 522], [688, 518]], 5, true);
        GM.baimiaoStroke(api, 1, '卷荷外廓', cupBack, { closed: true, raw: true, width: 1.0, color: P.inkDeep });
        GM.baimiaoStroke(api, 1, '卷荷翻卷边', cupFront, { closed: true, raw: true, width: 0.95, color: P.inkMid });
        GM.baseShadePoly(api, 2, '卷荷浓绿内面', cupBack, { baseColor: P.malachiteMid, baseAlpha: 0.88, shadeColor: P.malachiteDeep, shadeAlpha: 0.56 });
        GM.baseShadePoly(api, 3, '卷荷嫩背', cupFront, { baseColor: '#a9c796', baseAlpha: 0.9, shadeColor: '#688c5c', shadeAlpha: 0.42 });
        GM.fenranRegion(api, 3, '卷荷分染', cupBack, rng, { count: 38, colorFrom: P.malachiteDeep, colorTo: '#94c094', alphaMin: 0.04, alphaMax: 0.14 });
        GM.striationLines(api, 4, '卷荷放射水线', [718, 488], [[665, 456], [690, 434], [722, 430], [755, 436], [782, 464]], {
          color: '#b4cf94', alpha: 0.72, width: 1.05, batch: 2
        });

        [[295, 558, 6.0], [312, 578, 3.8], [445, 548, 5.2], [488, 592, 4.0], [235, 588, 3.4]].forEach(([dx, dy, dr]) => GM.drawDewdrop(api, 5, dx, dy, dr));

        // Pink Lotus Bud with Green Calyx Base (360, 326)
        for (let i = -1; i <= 1; i++) {
          GM.drawFlowerPetal(api, rng, {
            cx: 360 + i * 6, cy: 326, angle: -Math.PI * 0.5 + i * 0.2,
            length: 76 - Math.abs(i) * 5, width: 38, notches: 0, tilt: 0.96, baseAlpha: 0.92,
            baseColor: '#f8f0e8', rootColor: '#e8d7bd', midColor: '#f4d2d8', tipColor: '#b82542',
            outlineColor: '#692a38', washCount: 22, tipHighlight: true
          });
        }
        GM.drawGongbiLeaf(api, rng, { x: 355, y: 328, angle: -2.25, length: 24, width: 10, isBack: true });
        GM.drawGongbiLeaf(api, rng, { x: 365, y: 328, angle: -0.9, length: 24, width: 10, isBack: true });

        // Out-of-Water Pink-Tipped Lotus Bloom at (545, 295) + Green Receptacle Sepals tucked smoothly underneath
        const lx = 545, ly = 295;
        // Back sepals connecting stem to bloom base
        for (let s = -2; s <= 2; s++) {
          GM.drawFlowerPetal(api, rng, {
            cx: lx + s * 6, cy: ly + 22, angle: Math.PI * 0.5 + s * 0.32,
            length: 26, width: 18, notches: 0, tilt: 0.74, baseAlpha: 0.94,
            baseColor: '#9ab574', rootColor: '#4c6632', midColor: '#7a9858', tipColor: '#b5ca8c',
            outlineColor: '#3b4a26', washCount: 10, tipHighlight: false
          });
        }
        for (let ring = 0; ring < 2; ring++) {
          const cnt = ring === 0 ? 11 : 8;
          const len = ring === 0 ? 128 : 94;
          const wid = ring === 0 ? 56 : 46;
          for (let p = 0; p < cnt; p++) {
            const a = -Math.PI + (p / Math.max(1, cnt - 1)) * Math.PI * 1.15 - 0.1 + ring * 0.12;
            GM.drawFlowerPetal(api, rng, {
              cx: lx + Math.cos(a) * 14,
              cy: ly + Math.sin(a) * 8 + (ring === 0 ? 12 : 4),
              angle: a, length: len * (0.86 + 0.18 * Math.abs(Math.sin(a))), width: wid,
              notches: 0, tilt: 0.72, baseAlpha: 0.92,
              baseColor: P.clamWhite, rootColor: '#e5d4b8', midColor: '#f6e7e6', tipColor: '#c42e4e',
              outlineColor: '#753944', tipHighlight: true, washCount: 30
            });
          }
        }
        const pod = GM.catmullRom([[lx - 26, ly - 18], [lx, ly - 28], [lx + 26, ly - 18], [lx + 18, ly + 8], [lx - 18, ly + 8]], 5, true);
        GM.baimiaoStroke(api, 1, '莲蓬勾勒', pod, { closed: true, raw: true, width: 0.95, color: P.oliveDark });
        GM.baseShadePoly(api, 3, '莲蓬汁绿粉染', pod, { baseColor: '#9eb66d', baseAlpha: 0.94, shadeColor: '#546b38', shadeAlpha: 0.5 });
        GM.lifenStamens(api, 5, lx, ly - 12, rng, {
          count: 42, rInner: 26, rOuter: 50, tilt: 0.45,
          filamentColor: '#b55638', pollenColor: P.gooseYellow, dotSize: 2.0
        });

        GM.drawKoiCarp(api, rng, {
          spinePts: [[485, 835], [412, 855], [335, 895], [260, 912], [195, 902]],
          widthProfile: (u) => 46 * Math.sin(Math.pow(u, 0.55) * Math.PI * 0.92 + 0.12) * (1 - u * 0.42),
          baseColor: P.clamWhite, scaleRimColor: '#94624c', goldTrim: true,
          patrolSpots: [
            { u: 0.12, sideOffset: 0, rx: 38, ry: 28, color: P.cinnabar },
            { u: 0.42, sideOffset: -0.15, rx: 58, ry: 34, color: P.vermilion },
            { u: 0.72, sideOffset: 0.12, rx: 36, ry: 22, color: P.cinnabar }
          ]
        });
        GM.drawKoiCarp(api, rng, {
          spinePts: [[495, 985], [565, 962], [645, 955], [715, 978], [785, 995]],
          widthProfile: (u) => 38 * Math.sin(Math.pow(u, 0.55) * Math.PI * 0.92 + 0.12) * (1 - u * 0.42),
          baseColor: '#f5d282', scaleRimColor: '#7a522c', goldTrim: true,
          patrolSpots: [
            { u: 0.25, sideOffset: 0.1, rx: 42, ry: 26, color: P.ochre },
            { u: 0.62, sideOffset: -0.1, rx: 34, ry: 22, color: P.inkDeep }
          ]
        });

        GM.finalizeGongbiBudget(api, rng, W, H, {
          target: 8200, minTarget: 7000, maxTarget: 9400,
          focusX: 520, focusY: 450, focusR: 340, haloLight: true,
          inscription: { x: 150, y: 145, text: '清夏九如', opts: { size: 32, stepY: 42, color: '#2b221a' } },
          seal: { x: 150, y: 350, text: '和合', opts: { size: 40, color: '#9c2d23' } }
        });
      }
    },

    // =========================================================================
    // 3. 工笔·松鹤延年
    // =========================================================================
    {
      id: 'gongbi-pine-crane',
      title: '工笔·松鹤延年',
      subtitle: '北宋徽宗《瑞鹤》法度：千针苍松连枝出梢 → 外晕托白显鹤羽 → 丝毛法画颈翎 → 立粉朱砂丹顶',
      group: '国画·工笔',
      category: '工笔花鸟',
      seal: '工笔翎毛',
      mode: 'gongbi',
      width: 960,
      height: 1200,
      seed: 1003,
      swatches: ['rgb(235, 224, 200)', 'rgb(250, 248, 242)', 'rgb(198, 42, 34)', 'rgb(34, 82, 54)', 'rgb(28, 24, 20)'],
      desc: '苍松虬曲盘盖如伞，鳞甲斑驳并从松梢直出二十八簇头绿松针；双鹤立于青苔崖石间，长颈胸脯丝毛浑然天成，头点朱丹冠羽，气度高古。',
      layers: GONGBI_LAYERS,
      analysis: {
        original: '北宋徽宗赵佶《瑞鹤图》与南宋院体松鹤长卷',
        movement: '北宋宣和画院工笔翎毛',
        palette: '古绢包浆底 · 蛤粉托白 · 松烟重墨 · 朱砂丹顶 · 石绿花青',
        technique: '松干鳞皮皴染 · 松梢出针 · 外晕托白 · 千笔丝毛浑融肩颈 · 立粉点丹顶',
        algorithm: '先勾苍松虬枝与连接松梢并生簇松针；双鹤将S颈自然融入饱满胸腹廓线，分层丝毛密织墨颈、雪羽及垂尾飞羽。'
      },
      buildStrokes(api) {
        ensureGM();
        const rng = GM.makeRng(1003);
        const W = 960, H = 1200;

        GM.silkHaloGround(api, 2, W, H, rng, {
          count: 460, focusX: 500, focusY: 640, focusR: 320,
          haloLight: true, haloIntensity: 1.15, warmColor: P.silkAmber, coolColor: '#6f7e72'
        });

        drawMistBand(api, rng, 340, 440, 260, 28, 60);
        drawMistBand(api, rng, 650, 505, 220, 24, 52);

        GM.drawTaihuRock(api, rng, {
          outerPts: [[80, 1175], [90, 1045], [240, 1020], [420, 1065], [645, 1075], [820, 1035], [890, 1175]],
          holes: [], mossCount: 64
        });

        // Ancient Pine sweeping across upper-left + short pine-twig sockets directly feeding needle fans!
        drawWoodyBranch(api, rng, [[-10, 310], [185, 265], [345, 245], [510, 285], [675, 248]], [56, 12], {
          label: '苍松主干铁线', gnarl: 3.0, washCount: 115, fissures: 22
        });
        drawWoodyBranch(api, rng, [[165, 275], [275, 200], [425, 180]], [24, 7], {
          label: '松上分枝', gnarl: 1.5, washCount: 44, fissures: 8
        });
        drawWoodyBranch(api, rng, [[365, 255], [475, 345], [595, 330]], [20, 7], {
          label: '松下俯枝', gnarl: 1.2, washCount: 38, fissures: 6
        });

        // Short branching pine twigs holding dense overlapping needle sprays cleanly on twigs!
        const twigs = [
          [[135, 270], [125, 232]], [[215, 238], [202, 195]], [[280, 200], [270, 165]],
          [[350, 188], [358, 158]], [[415, 182], [442, 162]], [[315, 252], [322, 220]],
          [[435, 265], [452, 225]], [[510, 282], [538, 245]], [[585, 266], [608, 226]],
          [[645, 254], [685, 236]], [[675, 248], [728, 255]], [[455, 325], [488, 355]],
          [[555, 335], [592, 348]], [[395, 285], [385, 318]], [[235, 260], [238, 222]]
        ];
        twigs.forEach(([p0, p1], idx) => {
          GM.baimiaoStroke(api, 1, '松枝小杈', [p0, p1], { width: 3.2, color: '#473424', alpha: 0.88 });
          drawPineCluster(api, rng, p1[0], p1[1], -Math.PI * 0.5 + (rng() - 0.5) * 0.25, 44 + (idx % 3) * 6, 42, P.malachiteDeep, '#1c4430');
          drawPineCluster(api, rng, p1[0] + (rng() - 0.5) * 14, p1[1] - 6, -Math.PI * 0.5 + (rng() - 0.5) * 0.35, 34, 28, '#2b6b4b', '#569168');
        });

        function paintCrane(cx, cy, flip = 1, preening = false) {
          const X = (dx) => cx + dx * flip;
          if (!preening) {
            GM.baimiaoStroke(api, 1, '鹤腿勾勒', [[X(12), cy + 68], [X(15), cy + 210], [X(18), cy + 375]], { width: 5.5, color: '#2b2824', alpha: 0.88 });
            GM.baimiaoStroke(api, 1, '鹤弯足', [[X(-12), cy + 62], [X(-52), cy + 165], [X(4), cy + 215]], { width: 5.0, color: '#33302b', alpha: 0.86 });
            [[X(-16), cy + 378, X(18), cy + 375], [X(18), cy + 375, X(52), cy + 382], [X(18), cy + 375, X(32), cy + 365]].forEach(seg => {
              GM.baimiaoStroke(api, 4, '鹤爪复勒', [[seg[0], seg[1]], [seg[2], seg[3]]], { width: 2.2, color: P.inkDeep });
            });
          } else {
            GM.baimiaoStroke(api, 1, '伴鹤双足', [[X(-15), cy + 48], [X(-18), cy + 225]], { width: 4.5, color: '#2b2824', alpha: 0.85 });
            GM.baimiaoStroke(api, 1, '伴鹤双足', [[X(18), cy + 45], [X(24), cy + 228]], { width: 4.5, color: '#2b2824', alpha: 0.85 });
          }

          // Continuous Seamless Crane Neck-to-Body Profile!
          const neckCurve = preening
            ? [[X(-48), cy + 18], [X(-92), cy - 42], [X(-58), cy - 92], [X(-12), cy - 82]]
            : [[X(-48), cy + 18], [X(-114), cy - 68], [X(-108), cy - 165], [X(-75), cy - 220]];
          const headPt = neckCurve[neckCurve.length - 1];
          const hx = headPt[0], hy = headPt[1];

          // S-curved black neck tube tapering gently and tucking smoothly into chest interior
          const neckSm = GM.catmullRom(neckCurve, 10, false);
          const nL = [], nR = [];
          for (let i = 0; i < neckSm.length; i++) {
            const u = i / Math.max(1, neckSm.length - 1);
            const prev = neckSm[Math.max(0, i - 1)], next = neckSm[Math.min(neckSm.length - 1, i + 1)];
            const tx = next[0] - prev[0], ty = next[1] - prev[1];
            const d = Math.hypot(tx, ty) || 1;
            const nx = -ty / d, ny = tx / d;
            const hw = GM.lerp(22, 13, u);
            nL.push([neckSm[i][0] + nx * hw, neckSm[i][1] + ny * hw]);
            nR.unshift([neckSm[i][0] - nx * hw, neckSm[i][1] - ny * hw]);
          }
          const neckPoly = nL.concat(nR);

          // Oval white crane body overlapping the lower neck root cleanly!
          const torso = GM.catmullRom([
            [X(-82), cy + 8], [X(-36), cy - 42], [X(45), cy - 36], [X(122), cy + 16],
            [X(142), cy + 62], [X(75), cy + 86], [X(-24), cy + 80], [X(-84), cy + 44]
          ], 8, true);

          // Neck drawn at Layer 2 first, torso drawn cleanly OVER neck root in Layer 2/3!
          GM.baimiaoStroke(api, 1, '仙鹤S颈双勾', neckPoly, { closed: true, raw: true, width: 1.0, color: P.inkDeep });
          GM.baseShadePoly(api, 2, '鹤颈乌墨与三白分染', neckPoly, {
            baseColor: '#25211e', baseAlpha: 0.9, shadeColor: P.clamWhite, shadeAlpha: 0.62,
            gradFrom: neckSm[Math.floor(neckSm.length * 0.4)], gradTo: neckSm[neckSm.length - 1]
          });
          GM.simaoTract(api, 4, '鹤颈黑羽丝毛', neckPoly, rng, {
            count: preening ? 150 : 210, angle: -1.35, spread: 0.32,
            lenMin: 6, lenMax: 14, color: '#1b1815', colorAlt: '#544e47', width: 0.56
          });

          GM.baimiaoStroke(api, 1, '仙鹤身羽双勾', torso, { closed: true, raw: true, width: 1.15, color: P.inkPale, alpha: 0.72, style: 'yousi' });
          GM.baseShadePoly(api, 3, '仙鹤蛤粉平涂盖颈根', torso, {
            baseColor: P.clamWhite, baseAlpha: 0.96,
            shadeColor: '#d9ceb8', shadeAlpha: 0.42,
            gradFrom: [cx, cy + 75], gradTo: [cx, cy - 35]
          });
          GM.fenranRegion(api, 3, '白羽阴面淡赭染', torso, rng, {
            count: 68, colorFrom: '#cfc1a9', colorTo: P.clamWhite,
            gradFrom: [cx, cy + 75], gradTo: [cx, cy - 25], bias: 'from', alphaMin: 0.035, alphaMax: 0.1
          });
          GM.simaoTract(api, 4, '鹤身雪白丝毛法', torso, rng, {
            count: preening ? 420 : 620,
            angle: flip > 0 ? 0.25 : Math.PI - 0.25, spread: 0.26,
            lenMin: 12, lenMax: 26,
            color: P.clamWhite, colorAlt: '#d4c9b2', alpha: 0.78, width: 0.65
          });

          // Black Tertial Tail Plumes arching from mid-wing back cleanly
          const tailZone = GM.catmullRom([
            [X(35), cy - 8], [X(115), cy + 12], [X(155), cy + 74], [X(122), cy + 104], [X(62), cy + 76], [X(25), cy + 28]
          ], 7, true);
          GM.baimiaoStroke(api, 1, '鹤黑尾羽勾勒', tailZone, { closed: true, raw: true, width: 1.0, color: P.inkDeep });
          GM.baseShadePoly(api, 3, '鹤墨尾底色', tailZone, { baseColor: '#262320', baseAlpha: 0.92, shadeColor: '#4a433d', shadeAlpha: 0.35 });
          for (let f = 0; f < 9; f++) {
            GM.drawFeatherPlume(api, rng, {
              x0: X(42 + f * 7), y0: cy + 8 + f * 3,
              x1: X(115 + f * 5), y1: cy + 68 + f * 4.5,
              width: 11, bend: 0.14 * flip,
              baseColor: '#292522', tipColor: '#161412',
              shaftColor: '#5c554e', outlineColor: P.inkDeep, barbCount: 16
            });
          }

          // Sculpted Head + Long Pointed Beak + Cinnabar Red Crown
          const headPoly = GM.catmullRom([
            [hx - 14 * flip, hy + 8], [hx - 16 * flip, hy - 14], [hx + 12 * flip, hy - 16], [hx + 18 * flip, hy + 2], [hx + 6 * flip, hy + 12]
          ], 5, true);
          GM.baseShadePoly(api, 3, '鹤首三白涂染', headPoly, { baseColor: P.clamWhite, baseAlpha: 0.95 });
          const beakPoly = GM.catmullRom([
            [hx + 14 * flip, hy - 5], [hx + 98 * flip, hy - 12], [hx + 15 * flip, hy + 5]
          ], 4, true);
          GM.baimiaoStroke(api, 1, '鹤长喙勾勒', beakPoly, { closed: true, raw: true, width: 1.0, color: '#45391e' });
          GM.baseShadePoly(api, 3, '鹤喙赭黄设色', beakPoly, { baseColor: '#9e8f5c', baseAlpha: 0.9, shadeColor: '#4f4528', shadeAlpha: 0.55 });

          for (let r = 0; r < 24; r++) {
            const rx = hx + (rng() - 0.5) * 18;
            const ry = hy - 13 + (rng() - 0.5) * 8;
            const cr = 2.0 + rng() * 2.1;
            const cCol = GM.rgbaStr(rng() > 0.3 ? P.cinnabar : P.vermilion, 0.88);
            GM.pushRaw(api, 5, '立粉点丹顶', (c) => {
              c.save(); c.fillStyle = cCol; c.beginPath(); c.arc(rx, ry, cr, 0, GM.TAU); c.fill(); c.restore();
            }, 'lifen');
          }
          GM.pushRaw(api, 5, '仙鹤点睛', (c) => {
            c.save();
            c.fillStyle = '#d9b54a'; c.beginPath(); c.arc(hx + 7 * flip, hy - 2, 4.0, 0, GM.TAU); c.fill();
            c.fillStyle = '#0e0c0a'; c.beginPath(); c.arc(hx + 7 * flip, hy - 2, 2.5, 0, GM.TAU); c.fill();
            c.fillStyle = '#fff'; c.beginPath(); c.arc(hx + 6.2 * flip, hy - 2.8, 0.9, 0, GM.TAU); c.fill();
            c.restore();
          }, 'eye');
        }

        paintCrane(455, 675, 1, false);
        paintCrane(685, 795, -1, true);

        GM.finalizeGongbiBudget(api, rng, W, H, {
          target: 8800, minTarget: 7200, maxTarget: 9600,
          focusX: 480, focusY: 640, focusR: 320, haloLight: true,
          inscription: { x: 825, y: 155, text: '松鹤延年', opts: { size: 32, stepY: 42, color: '#2b221a' } },
          seal: { x: 825, y: 360, text: '长寿', opts: { size: 40, color: '#9c2d23' } }
        });
      }
    },

    // =========================================================================
    // 4. 工笔·喜上眉梢
    // =========================================================================
    {
      id: 'gongbi-magpie-plum',
      title: '工笔·喜上眉梢',
      subtitle: '马麟《层叠冰绡》与崔白花鸟法度：苍铁老梅托白冰花 → 雀羽石青覆羽千丝毛 → 凝睛抱枝',
      group: '国画·工笔',
      category: '工笔花鸟',
      seal: '宋人花鸟',
      mode: 'gongbi',
      width: 960,
      height: 1180,
      seed: 1004,
      swatches: ['rgb(235, 224, 200)', 'rgb(28, 34, 48)', 'rgb(252, 248, 240)', 'rgb(198, 52, 72)', 'rgb(230, 188, 86)'],
      desc: '老梅铁干苍劲并生花梗细蒂，冰绡白梅与绯梅连枝开落，立粉金蕊点提；上枝立一修长喜鹊，流线胸腹与叠层石青尾羽丝丝入微。',
      layers: GONGBI_LAYERS,
      analysis: {
        original: '南宋马麟《层叠冰绡图》与北宋崔白《双喜图》',
        movement: '两宋折枝工笔花鸟',
        palette: '古绢茶晕 · 蛤粉冰绡 · 曙红梅蕾 · 石青墨羽 · 藤黄立粉',
        technique: '倒晕烘托冰绡梅瓣 · 梅蒂连梗 · 喜鹊流线顺毛与覆羽 · 利爪抱枝',
        algorithm: '先以铁线描勾苍梅主枝与喜鹊羽片，对白梅花朵加花托短蒂连枝，再用顺向曲线丝毛密织鹊首、月白胸腹及石青叠尾。'
      },
      buildStrokes(api) {
        ensureGM();
        const rng = GM.makeRng(1004);
        const W = 960, H = 1180;

        GM.silkHaloGround(api, 2, W, H, rng, {
          count: 420, focusX: 520, focusY: 500, focusR: 350,
          haloLight: true, haloIntensity: 1.15, warmColor: P.silkTea, coolColor: '#76827c'
        });

        drawWoodyBranch(api, rng, [[85, 1020], [260, 865], [440, 710], [635, 575], [825, 435]], [40, 10], {
          label: '老梅苍干铁线', gnarl: 2.5, washCount: 90, fissures: 18
        });
        drawWoodyBranch(api, rng, [[410, 735], [345, 585], [305, 425], [275, 255]], [18, 5], {
          label: '梅花挺出直枝', gnarl: 1.0, washCount: 44, fissures: 8
        });
        drawWoodyBranch(api, rng, [[605, 595], [645, 425], [675, 275]], [13, 4], {
          label: '右上梅梢', gnarl: 0.7, washCount: 28, fissures: 4
        });
        drawWoodyBranch(api, rng, [[275, 855], [465, 865], [640, 845]], [14, 5], {
          label: '右下梅枝', gnarl: 0.9, washCount: 34, fissures: 6
        });

        for (let m = 0; m < 36; m++) {
          const t = 0.08 + rng() * 0.72;
          const mx = GM.lerp(110, 760, t) + (rng() - 0.5) * 12;
          const my = GM.lerp(1000, 480, t) + (rng() - 0.5) * 12;
          const col = GM.rgbaStr(rng() > 0.35 ? P.malachiteDeep : P.oliveDark, 0.58);
          GM.pushRaw(api, 5, '老梅点苔', (c) => {
            c.save(); c.fillStyle = col;
            c.beginPath(); c.ellipse(mx, my, 2.1 + rng() * 1.8, 1.4 + rng() * 1.2, rng(), 0, GM.TAU); c.fill(); c.restore();
          }, 'moss');
        }

        // Every blossom connected via tiny stem spur to its parent branch!
        const blossoms = [
          { node: [275, 265], x: 278, y: 275, radius: 44, angle: 0.3, view: 'front', blush: false },
          { node: [292, 355], x: 318, y: 345, radius: 38, angle: -0.4, view: 'side', blush: true },
          { node: [295, 395], x: 262, y: 398, radius: 46, angle: 1.1, view: 'front', blush: false },
          { node: [315, 455], x: 358, y: 445, radius: 42, angle: 0.2, view: 'front', blush: true },
          { node: [318, 495], x: 298, y: 495, radius: 20, angle: 0.4, view: 'bud', blush: true },
          { node: [338, 535], x: 376, y: 525, radius: 36, angle: 2.1, view: 'side', blush: false },
          { node: [280, 325], x: 245, y: 325, radius: 19, angle: -0.2, view: 'bud', blush: false },
          { node: [288, 250], x: 330, y: 215, radius: 19, angle: 0.2, view: 'bud', blush: true },
          { node: [650, 415], x: 642, y: 395, radius: 44, angle: 0.8, view: 'front', blush: false },
          { node: [665, 335], x: 678, y: 318, radius: 38, angle: -0.3, view: 'side', blush: true },
          { node: [668, 305], x: 635, y: 284, radius: 20, angle: 0.1, view: 'bud', blush: true },
          { node: [695, 515], x: 718, y: 468, radius: 44, angle: 1.4, view: 'front', blush: false },
          { node: [755, 488], x: 778, y: 482, radius: 38, angle: 0.5, view: 'side', blush: true },
          { node: [805, 448], x: 820, y: 415, radius: 34, angle: 1.2, view: 'front', blush: false },
          { node: [825, 435], x: 855, y: 448, radius: 19, angle: 0.3, view: 'bud', blush: true },
          { node: [462, 858], x: 462, y: 842, radius: 44, angle: 0.4, view: 'front', blush: false },
          { node: [525, 860], x: 525, y: 868, radius: 40, angle: 1.1, view: 'side', blush: true },
          { node: [585, 850], x: 585, y: 838, radius: 38, angle: 2.2, view: 'front', blush: false },
          { node: [635, 845], x: 632, y: 865, radius: 20, angle: 0.3, view: 'bud', blush: true },
          { node: [382, 862], x: 382, y: 882, radius: 19, angle: 0.1, view: 'bud', blush: true },
          { node: [235, 868], x: 215, y: 795, radius: 38, angle: 0.9, view: 'front', blush: true },
          { node: [255, 835], x: 265, y: 765, radius: 18, angle: 0.4, view: 'bud', blush: false }
        ];
        blossoms.forEach(b => {
          drawPetiole(api, b.node[0], b.node[1], b.x, b.y, '#4d3b2b', 2.0);
          GM.drawPlumBlossom(api, rng, b);
        });

        // Sleek Anatomical Song-Court Oriental Magpie perched on main bough (525, 560)
        const mx = 525, my = 562;
        // Streamlined head -> nape -> back -> tail base silhouette (NOT a sphere!)
        const magBody = GM.catmullRom([
          [mx - 64, my - 46], [mx - 45, my - 72], [mx - 12, my - 74],
          [mx + 38, my - 42], [mx + 92, my - 4], [mx + 62, my + 44],
          [mx + 2, my + 58], [mx - 48, my + 32], [mx - 58, my - 12]
        ], 7, true);
        const bellyPatch = GM.catmullRom([
          [mx - 48, my + 6], [mx - 12, my - 2], [mx + 44, my + 12],
          [mx + 42, my + 48], [mx - 8, my + 57], [mx - 46, my + 32]
        ], 6, true);
        const scapularWhite = GM.catmullRom([
          [mx - 10, my - 30], [mx + 44, my - 32], [mx + 56, my - 12], [mx + 10, my - 8]
        ], 5, true);

        // Long sleek graduated obsidian-azurite tail feathers (narrow tapered overlapping stack — NO fork tines!)
        [0, 1, 2].forEach(t => {
          GM.drawFeatherPlume(api, rng, {
            x0: mx + 72, y0: my + 6 + t * 3,
            x1: mx + 242 - t * 14, y1: my + 178 - t * 14,
            width: 11, bend: -0.04,
            baseColor: '#1b3556', tipColor: '#141926',
            shaftColor: '#486a8c', outlineColor: P.inkDeep, barbCount: 24
          });
        });

        GM.baimiaoStroke(api, 1, '喜鹊流线体廓', magBody, { closed: true, raw: true, width: 1.2, color: P.inkDeep });
        GM.baseShadePoly(api, 2, '喜鹊乌羽打底', magBody, { baseColor: '#1b1e28', baseAlpha: 0.94, shadeColor: '#2a3c56', shadeAlpha: 0.45 });
        GM.baseShadePoly(api, 3, '喜鹊胸腹蛤粉', bellyPatch, { baseColor: P.clamWhite, baseAlpha: 0.96, shadeColor: '#d9ccb4', shadeAlpha: 0.35 });
        GM.baseShadePoly(api, 3, '喜鹊白肩斑', scapularWhite, { baseColor: P.clamWhite, baseAlpha: 0.96 });

        GM.simaoTract(api, 4, '喜鹊首背丝毛', magBody, rng, {
          count: 580, angle: 0.52, spread: 0.16, lenMin: 8, lenMax: 16,
          color: '#171a22', colorAlt: '#3b4e68', alpha: 0.78, width: 0.56
        });
        // Smooth chest-hugging downward curved white Simao (clean & velvety!)
        GM.simaoTract(api, 4, '喜鹊胸腹白丝毛', bellyPatch, rng, {
          count: 340,
          angleFn: (_px, _py, u, v) => 0.72 + (u - 0.5) * 0.25 + v * 0.15,
          spread: 0.1, lenMin: 8, lenMax: 15,
          color: P.clamWhite, colorAlt: '#cfc5b2', alpha: 0.85, width: 0.58
        });

        drawWingCoverts(api, rng, mx + 22, my - 16, 3, 4, 0.56, '#214569', '#386f78', '#141c28');

        // Sleek Beak & Perched Scaled Toes gripping bark directly at branch intersection
        const beak = GM.catmullRom([[mx - 62, my - 46], [mx - 104, my - 50], [mx - 60, my - 34]], 4, true);
        GM.baimiaoStroke(api, 1, '喜鹊喙勾勒', beak, { closed: true, raw: true, width: 1.05, color: P.inkDeep });
        GM.baseShadePoly(api, 2, '喜鹊喙墨染', beak, { baseColor: '#242222', baseAlpha: 0.94, shadeColor: '#6b655e', shadeAlpha: 0.45 });
        GM.baimiaoStroke(api, 4, '喜鹊抱枝双足', [[mx - 4, my + 54], [mx + 12, my + 84]], { width: 2.8, color: P.inkDeep });
        GM.baimiaoStroke(api, 4, '喜鹊右足', [[mx + 18, my + 48], [mx + 30, my + 74]], { width: 2.8, color: P.inkDeep });
        GM.baimiaoStroke(api, 4, '鹊爪扣枝', [[mx + 2, my + 84], [mx + 14, my + 82], [mx + 26, my + 88]], { width: 1.8, color: P.inkDeep });

        GM.pushRaw(api, 5, '喜鹊点睛', (c) => {
          c.save();
          c.strokeStyle = 'rgba(245,240,228,0.88)'; c.lineWidth = 1.15;
          c.beginPath(); c.arc(mx - 45, my - 46, 5.0, 0, GM.TAU); c.stroke();
          c.fillStyle = '#0e0c0c'; c.beginPath(); c.arc(mx - 45, my - 46, 3.2, 0, GM.TAU); c.fill();
          c.fillStyle = '#fff'; c.beginPath(); c.arc(mx - 46.2, my - 47.2, 1.1, 0, GM.TAU); c.fill();
          c.restore();
        }, 'eye');

        GM.finalizeGongbiBudget(api, rng, W, H, {
          target: 7800, minTarget: 6800, maxTarget: 9200,
          focusX: 500, focusY: 500, focusR: 340, haloLight: true,
          inscription: { x: 150, y: 145, text: '喜上眉梢', opts: { size: 32, stepY: 42, color: '#2b221a' } },
          seal: { x: 150, y: 355, text: '春喜', opts: { size: 40, color: '#9c2d23' } }
        });
      }
    },

    // =========================================================================
    // 5. 工笔·锦鸡太湖石
    // =========================================================================
    {
      id: 'gongbi-pheasant-rock',
      title: '工笔·锦鸡太湖石',
      subtitle: '仿宋徽宗《芙蓉锦鸡》法度：太湖奇石瘦漏皴染 → 朱腹金冠花斑披肩 → 尾羽豹斑精确随弯',
      group: '国画·工笔',
      category: '工笔花鸟',
      seal: '院体工笔',
      mode: 'gongbi',
      width: 960,
      height: 1200,
      seed: 1005,
      swatches: ['rgb(235, 224, 200)', 'rgb(218, 166, 44)', 'rgb(198, 44, 34)', 'rgb(28, 78, 118)', 'rgb(96, 90, 82)'],
      desc: '立瘦漏皱透太湖石于左下，红腹锦鸡独立岩顶回首凝望；金冠垂颈并顺披橘黑花斑披肩，丹朱腹下尾羽垂曳近尺且斑纹严丝合缝，傍映双勾修竹与朱砂山茶。',
      layers: GONGBI_LAYERS,
      analysis: {
        original: '北宋徽宗《芙蓉锦鸡图》与宋院体珍禽花石图',
        movement: '北宋宣和院体工笔花鸟',
        palette: '太湖石青灰赭 · 泥金凤冠 · 正朱砂胸 · 头绿石青背 · 竹石墨青',
        technique: '锦鸡颈项披肩扇羽分层分染 · 千笔丝毛 · 斑尾豹点精确复勒 · 太湖石瘦漏苔点',
        algorithm: '先勾棱角瘦漏太湖石与连缀花竹，锦鸡头颈顺接披肩并顺曲率丝毛分染朱腹蓝背，按尾羽同源二次曲线准确落绘黑斑。'
      },
      buildStrokes(api) {
        ensureGM();
        const rng = GM.makeRng(1005);
        const W = 960, H = 1200;

        GM.silkHaloGround(api, 2, W, H, rng, {
          count: 420, focusX: 460, focusY: 640, focusR: 340,
          haloLight: true, warmColor: P.silkTea, coolColor: '#768272'
        });

        // Angular Craggy Perforated Taihu Garden Rock (瘦漏皱透 sharp scholar silhouette)
        GM.drawTaihuRock(api, rng, {
          outerPts: [
            [255, 1148], [218, 1025], [278, 935], [220, 845], [272, 765],
            [355, 725], [478, 720], [568, 755], [518, 848], [625, 928], [588, 1148]
          ],
          holes: [
            [[358, 845], [418, 822], [456, 868], [412, 916], [352, 882]],
            [[442, 975], [502, 952], [528, 1012], [486, 1044], [432, 1006]],
            [[308, 988], [342, 968], [356, 1004], [318, 1020]]
          ],
          mossCount: 54
        });

        // Graceful Bamboo twigs & Camellias beside the rock with attached petioles
        drawWoodyBranch(api, rng, [[605, 1125], [645, 965], [678, 815], [715, 685]], [12, 5], {
          label: '修竹主竿', baseColor: '#5c7c48', shadeColor: '#364d29', gnarl: 0.4, washCount: 28, fissures: 2
        });
        [
          { node: [678, 812], x: 678, y: 806, angle: -0.45, length: 122, width: 24, bend: 0.14 },
          { node: [678, 812], x: 682, y: 810, angle: 0.15, length: 118, width: 22, bend: 0.1 },
          { node: [678, 804], x: 675, y: 800, angle: -0.95, length: 108, width: 20, bend: -0.12 },
          { node: [705, 720], x: 702, y: 716, angle: -0.35, length: 112, width: 22, bend: 0.14 },
          { node: [705, 720], x: 708, y: 720, angle: 0.28, length: 105, width: 20, bend: 0.1 }
        ].forEach(bf => {
          drawPetiole(api, bf.node[0], bf.node[1], bf.x, bf.y, '#4c6135', 1.2);
          GM.drawGongbiLeaf(api, rng, bf);
        });

        drawWoodyBranch(api, rng, [[165, 1095], [202, 965], [218, 908]], [14, 7], {
          label: '山茶花枝', washCount: 25, fissures: 4
        });
        [
          { node: [194, 985], x: 185, y: 945, angle: 2.75, length: 118, width: 52, serrated: true, bend: 0.12 },
          { node: [194, 985], x: 195, y: 965, angle: 2.15, length: 110, width: 48, serrated: true, isBack: true },
          { node: [212, 922], x: 245, y: 878, angle: -1.85, length: 112, width: 48, serrated: true, bend: -0.1 },
          { node: [212, 922], x: 255, y: 925, angle: -0.42, length: 115, width: 48, serrated: true }
        ].forEach(cf => {
          drawPetiole(api, cf.node[0], cf.node[1], cf.x, cf.y, '#5c4632', 1.6);
          GM.drawGongbiLeaf(api, rng, cf);
        });

        drawRichBlossom(api, rng, {
          cx: 215, cy: 895, R: 84, tilt: 0.85, notches: 1,
          baseColor: '#f2b8c0', rootColor: '#821828', midColor: '#c83446', tipColor: '#f7d8dc',
          outlineColor: '#5c1824',
          tiers: [
            { count: 8, distFrac: 0.16, lenFrac: 0.82, widFrac: 0.65, rot: 0.1 },
            { count: 7, distFrac: 0.12, lenFrac: 0.66, widFrac: 0.56, rot: 0.48 },
            { count: 5, distFrac: 0.06, lenFrac: 0.44, widFrac: 0.44, rot: 0.2 }
          ],
          stamenCount: 28
        });

        // Seamless Anatomical Golden Pheasant perched cleanly atop rock around (425, 610)
        const px = 425, py = 610;

        // Long Arched Tail Plumes where EVERY leopard crossbar tracks exact Bezier quadPoint!
        const tailSpecs = [
          { x0: px + 88, y0: py + 12, x1: px + 395, y1: py + 435, w: 17, bend: 0.11 },
          { x0: px + 82, y0: py + 22, x1: px + 355, y1: py + 475, w: 15, bend: 0.09 },
          { x0: px + 76, y0: py + 28, x1: px + 312, y1: py + 485, w: 13, bend: 0.07 }
        ];
        tailSpecs.forEach((ts) => {
          const dx = ts.x1 - ts.x0, dy = ts.y1 - ts.y0;
          const len = Math.hypot(dx, dy) || 1;
          const nx = -dy / len, ny = dx / len;
          const mxT = (ts.x0 + ts.x1) * 0.5 + nx * len * ts.bend;
          const myT = (ts.y0 + ts.y1) * 0.5 + ny * len * ts.bend;
          GM.drawFeatherPlume(api, rng, {
            x0: ts.x0, y0: ts.y0, x1: ts.x1, y1: ts.y1, width: ts.w, bend: ts.bend,
            baseColor: '#d9a452', tipColor: '#9e6b32', shaftColor: P.inkDeep, outlineColor: '#452b18', barbCount: 48
          });
          // Track exact quadratic Bezier centerline so leopard spots stay 100% INSIDE tail feather!
          for (let b = 2; b <= 16; b++) {
            const u = b / 18;
            const pt = GM.quadPoint([ts.x0, ts.y0], [mxT, myT], [ts.x1, ts.y1], u);
            const hw = ts.w * Math.sin(Math.pow(u, 0.72) * Math.PI * 0.92 + 0.15) * 0.78;
            const col = GM.rgbaStr(P.inkDeep, 0.72);
            GM.pushRaw(api, 4, '锦鸡尾斑横纹', (c) => {
              c.save(); c.strokeStyle = col; c.lineWidth = 1.85; c.lineCap = 'round';
              c.beginPath(); c.moveTo(pt[0] - nx * hw, pt[1] - ny * hw); c.lineTo(pt[0] + nx * hw, pt[1] + ny * hw); c.stroke();
              c.restore();
            }, 'vein');
          }
        });

        GM.baimiaoStroke(api, 1, '锦鸡双足', [[px - 5, py + 72], [px + 2, py + 114]], { width: 4.5, color: '#8f6934' });
        GM.baimiaoStroke(api, 1, '锦鸡右足', [[px + 28, py + 68], [px + 38, py + 112]], { width: 4.5, color: '#8f6934' });
        GM.baimiaoStroke(api, 4, '锦鸡爪', [[px - 18, py + 116], [px + 2, py + 114], [px + 24, py + 120]], { width: 2.4, color: '#4d381c' });

        // Continuous Bird Silhouette hugging colored plumage cleanly (no protruding background corner)
        const bodyShell = GM.catmullRom([
          [px - 54, py - 46], [px - 50, py - 72], [px - 22, py - 76], [px - 4, py - 48],
          [px + 75, py - 12], [px + 105, py + 34], [px + 64, py + 72], [px - 18, py + 78], [px - 74, py + 36], [px - 62, py - 4]
        ], 7, true);
        GM.baimiaoStroke(api, 1, '锦鸡整身廓线', bodyShell, { closed: true, raw: true, width: 1.0, color: P.inkDeep, alpha: 0.72 });

        // Scarlet Breast extended cleanly to wing/tail junction (zero corner gap!)
        const breastPoly = GM.catmullRom([
          [px - 62, py - 4], [px - 12, py - 12], [px + 72, py + 24],
          [px + 78, py + 58], [px + 64, py + 74], [px - 18, py + 78], [px - 74, py + 38]
        ], 7, true);
        GM.baseShadePoly(api, 2, '锦鸡朱砂敷彩', breastPoly, {
          baseColor: P.cinnabar, baseAlpha: 0.94, shadeColor: '#e05b2d', shadeAlpha: 0.45
        });
        GM.simaoTract(api, 4, '朱腹细密丝毛', breastPoly, rng, {
          count: 580, angle: 0.95, spread: 0.25, lenMin: 7, lenMax: 16,
          color: '#a82218', colorAlt: '#e8683a', alpha: 0.82, width: 0.65
        });

        // Sapphire-Malachite Mantle & Wing Coverts
        const wingPoly = GM.catmullRom([
          [px - 4, py - 24], [px + 75, py - 12], [px + 106, py + 36], [px + 64, py + 68], [px + 2, py + 32]
        ], 7, true);
        GM.baseShadePoly(api, 2, '青绿肩羽设色', wingPoly, {
          baseColor: '#1f5482', baseAlpha: 0.92, shadeColor: '#266146', shadeAlpha: 0.58,
          gradFrom: [px + 100, py + 45], gradTo: [px, py - 15]
        });
        drawWingCoverts(api, rng, px + 18, py - 2, 3, 4, 0.52, '#215887', '#327858', '#142029');
        GM.simaoTract(api, 4, '青背羽丝毛', wingPoly, rng, {
          count: 360, angle: 0.55, spread: 0.22, lenMin: 8, lenMax: 16,
          color: '#1b3e5e', colorAlt: '#489172', alpha: 0.78, width: 0.62
        });

        // Curved Orange-Gold & Black Barred Cape Ruff (strictly scalloped downward overlapping the neck)
        const capeRuff = GM.catmullRom([
          [px - 48, py - 42], [px - 6, py - 52], [px + 14, py - 16], [px - 4, py + 12], [px - 46, py + 2]
        ], 6, true);
        GM.baimiaoStroke(api, 1, '锦鸡花斑披肩廓线', capeRuff, { closed: true, raw: true, width: 1.0, color: '#6b3e18' });
        GM.baseShadePoly(api, 3, '金披肩暖橙底', capeRuff, { baseColor: '#ebb13e', baseAlpha: 0.96, shadeColor: '#d97824', shadeAlpha: 0.45 });
        for (let tier = 0; tier < 4; tier++) {
          const yOff = py - 35 + tier * 10;
          const arcPts = [];
          for (let k = 0; k <= 8; k++) {
            const tx = GM.lerp(px - 42, px + 6, k / 8);
            const ty = yOff + Math.sin((k / 8) * Math.PI) * 11;
            arcPts.push([tx, ty]);
          }
          GM.baimiaoStroke(api, 4, '披肩黑斑弧纹', arcPts, { raw: true, width: 1.15, color: '#1b1410', alpha: 0.85 });
        }

        // Smooth Head merging cleanly into Cape Ruff + Gold Crest
        const headX = px - 36, headY = py - 58;
        const headPoly = GM.catmullRom([
          [headX - 18, headY + 10], [headX - 16, headY - 14], [headX + 14, headY - 18], [headX + 22, headY + 12], [headX - 2, headY + 20]
        ], 5, true);
        GM.baseShadePoly(api, 3, '头冠亮金敷彩', headPoly, { baseColor: '#f2ca58', baseAlpha: 0.96, shadeColor: '#d48d28', shadeAlpha: 0.42 });
        const crestPaths = [
          [[headX - 6, headY - 14], [headX + 26, headY - 26], [headX + 66, headY - 8]],
          [[headX - 2, headY - 10], [headX + 32, headY - 18], [headX + 70, headY + 2]]
        ];
        GM.flowHairStrands(api, 4, '泥金冠羽丝毛', crestPaths, rng, {
          color: '#dfa532', sheenColor: '#faea9e', alpha: 0.86, width: 0.82, strandsPerPath: 52, jitter: 6
        });
        GM.goldFiligreeStroke(api, 5, '凤冠泥金提神', crestPaths[0], { width: 1.25, alpha: 0.78 });

        const pBeak = GM.catmullRom([[headX - 16, headY], [headX - 42, headY + 4], [headX - 14, headY + 10]], 3, true);
        GM.baimiaoStroke(api, 1, '锦鸡短喙', pBeak, { closed: true, raw: true, width: 1.0, color: '#5c411e' });
        GM.baseShadePoly(api, 3, '喙色赭黄', pBeak, { baseColor: '#d9b562', baseAlpha: 0.94 });
        GM.pushRaw(api, 5, '锦鸡凝睛', (c) => {
          c.save();
          c.fillStyle = '#faea9e'; c.beginPath(); c.arc(headX - 4, headY - 2, 4.4, 0, GM.TAU); c.fill();
          c.fillStyle = '#120e0c'; c.beginPath(); c.arc(headX - 4, headY - 2, 2.7, 0, GM.TAU); c.fill();
          c.fillStyle = '#fff'; c.beginPath(); c.arc(headX - 5, headY - 3, 1.0, 0, GM.TAU); c.fill();
          c.restore();
        }, 'eye');

        GM.finalizeGongbiBudget(api, rng, W, H, {
          target: 9200, minTarget: 7600, maxTarget: 9800,
          focusX: 460, focusY: 640, focusR: 340, haloLight: true,
          inscription: { x: 145, y: 145, text: '锦堂春晓', opts: { size: 32, stepY: 42, color: '#2b221a' } },
          seal: { x: 145, y: 355, text: '清芬', opts: { size: 40, color: '#9c2d23' } }
        });
      }
    },

    // =========================================================================
    // 6. 工笔·山茶绣眼
    // =========================================================================
    {
      id: 'gongbi-camellia-whiteeye',
      title: '工笔·山茶绣眼',
      subtitle: '南宋林椿小品法度：双勾腊质齿叶带虫蚀 → 宝珠红茶花立粉金蕊 → 成双绣眼点白眼圈',
      group: '国画·工笔',
      category: '工笔花鸟',
      seal: '工笔小品',
      mode: 'gongbi',
      width: 960,
      height: 1120,
      seed: 1006,
      swatches: ['rgb(235, 224, 200)', 'rgb(198, 36, 48)', 'rgb(42, 92, 48)', 'rgb(112, 148, 62)', 'rgb(252, 250, 245)'],
      desc: '师南宋林椿花鸟写生精神，斜出老茶树枝头缀以宝珠红山茶与腊质锯齿叶，细柄连枝并写虫蚀枯尖；一对暗绿绣眼轻立枝梢顾盼，蛤粉细点珍珠眼圈。',
      layers: GONGBI_LAYERS,
      analysis: {
        original: '南宋林椿《果熟来禽图》与《山茶霁雪》小品',
        movement: '南宋写实花鸟工笔小品',
        palette: '老枝赭墨 · 宝珠胭脂 · 厚绿革叶 · 芽绿绣眼 · 蛤粉眼圈',
        technique: '腊质锯齿叶连柄留水线 · 宋画虫蚀枯尖法 · 绣眼顺羽丝毛 · 抱枝抓爪',
        algorithm: '细勾革质锯齿茶叶并配叶柄连枝，叶面留水线分染并作虫蚀枯点；绣眼足爪准确踏枝，点睛绕蛤粉珠点。'
      },
      buildStrokes(api) {
        ensureGM();
        const rng = GM.makeRng(1006);
        const W = 960, H = 1120;

        GM.silkHaloGround(api, 2, W, H, rng, {
          count: 380, focusX: 500, focusY: 540, focusR: 330,
          haloLight: true, warmColor: P.silkTea, coolColor: '#788872'
        });

        drawWoodyBranch(api, rng, [[115, 985], [275, 845], [455, 675], [615, 510], [725, 415]], [30, 8], {
          label: '茶花老干斜出', gnarl: 1.5, washCount: 70, fissures: 12
        });
        // Upper twig running cleanly under upper White-eye feet at (505, 408)
        drawWoodyBranch(api, rng, [[395, 735], [465, 545], [510, 402], [538, 345]], [16, 5], {
          label: '右上花栖枝', gnarl: 0.7, washCount: 38, fissures: 6
        });
        // Lower-right twig running cleanly under second White-eye feet at (705, 622)
        drawWoodyBranch(api, rng, [[485, 645], [615, 632], [755, 616]], [14, 5], {
          label: '右下伴枝', gnarl: 0.6, washCount: 32, fissures: 5
        });

        // Every Camellia leaf anchored cleanly with a petiole onto a branch!
        const cLeaves = [
          { node: [235, 882], x: 255, y: 855, angle: 2.75, length: 148, width: 64, serrated: true, ovate: true, bend: 0.1 },
          { node: [255, 864], x: 278, y: 832, angle: -2.45, length: 132, width: 56, serrated: true, ovate: true, isBack: true },
          { node: [368, 755], x: 355, y: 745, angle: 2.45, length: 142, width: 60, serrated: true, ovate: true, wormBite: true },
          { node: [478, 665], x: 488, y: 705, angle: 1.05, length: 146, width: 62, serrated: true, ovate: true },
          { node: [545, 638], x: 545, y: 688, angle: 0.35, length: 138, width: 58, serrated: true, ovate: true, isBack: true, autumnTip: true },
          { node: [572, 558], x: 575, y: 550, angle: -0.52, length: 145, width: 62, serrated: true, ovate: true },
          { node: [615, 508], x: 605, y: 495, angle: -0.15, length: 128, width: 54, serrated: true, ovate: true, wormBite: true },
          { node: [485, 495], x: 488, y: 502, angle: -2.32, length: 136, width: 58, serrated: true, ovate: true },
          { node: [465, 545], x: 438, y: 545, angle: -2.88, length: 126, width: 52, serrated: true, ovate: true, isBack: true },
          { node: [635, 630], x: 645, y: 642, angle: 0.78, length: 132, width: 54, serrated: true, ovate: true },
          { node: [688, 452], x: 705, y: 455, angle: 0.42, length: 118, width: 48, serrated: true, ovate: true },
          { node: [195, 912], x: 195, y: 888, angle: -2.85, length: 120, width: 52, serrated: true, ovate: true }
        ];
        cLeaves.forEach(lf => {
          drawPetiole(api, lf.node[0], lf.node[1], lf.x, lf.y, '#5a4430', 1.8);
          GM.drawGongbiLeaf(api, rng, lf);
        });

        drawRichBlossom(api, rng, {
          cx: 415, cy: 675, R: 98, tilt: 0.88, notches: 1,
          baseColor: '#f5ccd0', rootColor: '#7a1222', midColor: '#c42b3c', tipColor: '#f7dce0',
          outlineColor: '#5c1420',
          tiers: [
            { count: 8, distFrac: 0.16, lenFrac: 0.80, widFrac: 0.66, rot: 0.12 },
            { count: 7, distFrac: 0.11, lenFrac: 0.64, widFrac: 0.58, rot: 0.45 },
            { count: 6, distFrac: 0.06, lenFrac: 0.44, widFrac: 0.46, rot: 0.25 }
          ],
          stamenCount: 38
        });
        drawRichBlossom(api, rng, {
          cx: 605, cy: 485, R: 84, tilt: 0.84, notches: 1,
          baseColor: '#f5ccd0', rootColor: '#821828', midColor: '#cd3648', tipColor: '#f9e2e4',
          outlineColor: '#5c1824',
          tiers: [
            { count: 8, distFrac: 0.15, lenFrac: 0.78, widFrac: 0.64, rot: 0.28 },
            { count: 6, distFrac: 0.10, lenFrac: 0.58, widFrac: 0.54, rot: 0.62 },
            { count: 5, distFrac: 0.05, lenFrac: 0.38, widFrac: 0.42, rot: 0.18 }
          ],
          stamenCount: 32
        });
        drawRichBlossom(api, rng, {
          cx: 265, cy: 765, R: 68, tilt: 0.86, notches: 1,
          baseColor: '#f5ccd0', rootColor: '#821828', midColor: '#c83244', tipColor: '#f7d8dc',
          outlineColor: '#5c1824',
          tiers: [
            { count: 7, distFrac: 0.14, lenFrac: 0.76, widFrac: 0.62, rot: 0.2 },
            { count: 5, distFrac: 0.08, lenFrac: 0.52, widFrac: 0.48, rot: 0.5 }
          ],
          stamenCount: 24
        });
        [{ n: [548, 636], x: 535, y: 615 }, { n: [705, 435], x: 705, y: 425 }, { n: [315, 815], x: 315, y: 842 }].forEach(b => {
          drawPetiole(api, b.n[0], b.n[1], b.x, b.y, '#5a4430', 1.5);
          GM.drawPlumBlossom(api, rng, { x: b.x, y: b.y, radius: 22, view: 'bud', blush: true });
        });

        // Pair of Japanese White-eyes with curved feet gripping the EXACT branch y coordinates!
        function paintWhiteEye(cx, cy, flip = 1, footTargetY) {
          const X = (dx) => cx + dx * flip;
          const bodyPts = GM.catmullRom([
            [X(-42), cy - 18], [X(2), cy - 42], [X(58), cy - 14], [X(46), cy + 34], [X(-8), cy + 42], [X(-48), cy + 12]
          ], 7, true);
          const bellyPts = GM.catmullRom([
            [X(-44), cy + 4], [X(-15), cy - 6], [X(28), cy + 8], [X(32), cy + 36], [X(-10), cy + 42], [X(-45), cy + 16]
          ], 6, true);
          const throatPts = GM.catmullRom([
            [X(-48), cy - 4], [X(-24), cy - 12], [X(-16), cy + 12], [X(-38), cy + 18]
          ], 5, true);

          GM.drawFeatherPlume(api, rng, {
            x0: X(38), y0: cy + 10, x1: X(98), y1: cy + 42, width: 10, bend: 0.06,
            baseColor: '#507032', tipColor: '#2d401c', shaftColor: P.inkDeep, outlineColor: '#222b18', barbCount: 16
          });
          GM.baimiaoStroke(api, 1, '绣眼体廓', bodyPts, { closed: true, raw: true, width: 1.05, color: '#29321c' });
          GM.baseShadePoly(api, 2, '绣眼芽绿背羽', bodyPts, { baseColor: '#7ca244', baseAlpha: 0.94, shadeColor: '#48682c', shadeAlpha: 0.45 });
          GM.baseShadePoly(api, 3, '绣眼粉白腹羽', bellyPts, { baseColor: '#f3efe4', baseAlpha: 0.95, shadeColor: '#d9ceb8', shadeAlpha: 0.35 });
          GM.baseShadePoly(api, 3, '绣眼鹅黄喉羽', throatPts, { baseColor: '#f0d86c', baseAlpha: 0.94, shadeColor: '#c9a638', shadeAlpha: 0.35 });

          GM.simaoTract(api, 4, '绣眼背羽丝毛', bodyPts, rng, {
            count: 340, angle: (flip > 0 ? 0.38 : Math.PI - 0.38), spread: 0.16,
            lenMin: 6, lenMax: 13, color: '#6b8e38', colorAlt: '#a9bf66', width: 0.54
          });
          GM.simaoTract(api, 4, '绣眼胸腹绒毛', bellyPts, rng, {
            count: 220, angle: (flip > 0 ? 0.52 : Math.PI - 0.52), spread: 0.15,
            lenMin: 6, lenMax: 12, color: P.clamWhite, colorAlt: '#d6ccb6', width: 0.54
          });
          drawWingCoverts(api, rng, cx - 2 * flip, cy - 8, 2, 3, flip > 0 ? 0.38 : Math.PI - 0.38, '#557830', '#7ca244', null);

          const bk = GM.catmullRom([[X(-44), cy - 12], [X(-74), cy - 15], [X(-44), cy - 4]], 3, true);
          GM.baimiaoStroke(api, 1, '绣眼尖喙', bk, { closed: true, raw: true, width: 0.95, color: P.inkDeep });
          GM.baseShadePoly(api, 2, '喙色', bk, { baseColor: '#36322c', baseAlpha: 0.92 });

          // Feet clasp the branch cleanly at footTargetY!
          GM.baimiaoStroke(api, 4, '绣眼抓枝双爪', [[X(-8), cy + 36], [X(-10), footTargetY]], { width: 2.0, color: '#3b2e22' });
          GM.baimiaoStroke(api, 4, '绣眼右爪', [[X(10), cy + 34], [X(8), footTargetY - 4]], { width: 2.0, color: '#3b2e22' });
          GM.baimiaoStroke(api, 4, '趾爪扣枝', [[X(-16), footTargetY], [X(-10), footTargetY - 2], [X(-2), footTargetY + 3]], { width: 1.4, color: '#2b2016' });
          GM.baimiaoStroke(api, 4, '趾爪扣枝', [[X(2), footTargetY - 4], [X(8), footTargetY - 5], [X(15), footTargetY - 1]], { width: 1.4, color: '#2b2016' });

          const ex = X(-24), ey = cy - 16;
          for (let ring = 0; ring < 18; ring++) {
            const ra = (ring / 18) * GM.TAU;
            const rx = ex + Math.cos(ra) * 5.8, ry = ey + Math.sin(ra) * 5.8;
            GM.pushRaw(api, 5, '蛤粉点白眼圈', (c) => {
              c.save(); c.fillStyle = GM.rgbaStr(P.clamWhite, 0.96);
              c.beginPath(); c.arc(rx, ry, 1.85, 0, GM.TAU); c.fill(); c.restore();
            }, 'lifen');
          }
          GM.pushRaw(api, 5, '绣眼黑睛', (c) => {
            c.save();
            c.fillStyle = '#0e0c0b'; c.beginPath(); c.arc(ex, ey, 3.6, 0, GM.TAU); c.fill();
            c.fillStyle = '#ffffff'; c.beginPath(); c.arc(ex - 1.1, ey - 1.1, 1.1, 0, GM.TAU); c.fill();
            c.restore();
          }, 'eye');
        }

        paintWhiteEye(512, 336, 1, 396);
        paintWhiteEye(705, 566, -1, 622);

        GM.finalizeGongbiBudget(api, rng, W, H, {
          target: 7600, minTarget: 6600, maxTarget: 9000,
          focusX: 500, focusY: 540, focusR: 330, haloLight: true,
          inscription: { x: 815, y: 145, text: '春茶绣羽', opts: { size: 32, stepY: 42, color: '#2b221a' } },
          seal: { x: 815, y: 345, text: '春晖', opts: { size: 40, color: '#9c2d23' } }
        });
      }
    },

    // =========================================================================
    // 7. 工笔·垂柳秋蝉
    // =========================================================================
    {
      id: 'gongbi-willow-cicada',
      title: '工笔·垂柳秋蝉',
      subtitle: '宋画《柳蝉》草虫法度：老柳全幅裂皮皴染 → 风拂柳丝八十叶 → 轻纱透明蝉翼叠网脉',
      group: '国画·工笔',
      category: '工笔花鸟',
      seal: '宋画小品',
      mode: 'gongbi',
      width: 920,
      height: 1160,
      seed: 1007,
      swatches: ['rgb(235, 224, 200)', 'rgb(64, 112, 62)', 'rgb(96, 82, 58)', 'rgb(42, 34, 26)', 'rgb(198, 178, 128)'],
      desc: '取宋人草虫小景意韵，老柳古干通幅出画并垂风拂柳条，缀八十余叶双勾汁绿柳叶；树干栖一工笔玄蝉，四翼透明如纱并细勾翅室脉络，清幽禅寂。',
      layers: GONGBI_LAYERS,
      analysis: {
        original: '南宋院体《柳蝉图》扇面与宋元草虫小景',
        movement: '宋代花鸟草虫工笔写实',
        palette: '老柳褐赭 · 汁绿秋黄柳叶 · 焦墨玄蝉 · 朱赭点眼 · 淡金蝉翼',
        technique: '通景老柳树皮纵皴 · 轻风斜拂柳丝 · 蝉翼薄染透干纹 · 细爪丝毛',
        algorithm: '古柳通幅延伸免生硬截断面，垂柳依S形微风弧线生出柳叶；玄蝉以极低透明淡胶分染翅室并精准勾网脉，透出干纹。'
      },
      buildStrokes(api) {
        ensureGM();
        const rng = GM.makeRng(1007);
        const W = 920, H = 1160;

        GM.silkHaloGround(api, 2, W, H, rng, {
          count: 380, focusX: 430, focusY: 540, focusR: 320,
          haloLight: true, warmColor: P.silkTea, coolColor: '#7d8a72'
        });

        // Willow trunk extends cleanly OUT of top (-20) and bottom (1185) margins!
        drawWoodyBranch(api, rng, [[222, 1190], [250, 860], [268, 560], [260, 260], [218, -25]], [112, 74], {
          label: '老柳主干', baseColor: '#7a654a', shadeColor: '#3f3225', gnarl: 3.4, washCount: 190, fissures: 48
        });
        drawWoodyBranch(api, rng, [[275, 310], [425, 225], [565, 155], [685, 115]], [34, 9], {
          label: '横伸柳枝', baseColor: '#6d5b42', shadeColor: '#3c3024', gnarl: 1.5, washCount: 60, fissures: 14
        });
        drawWoodyBranch(api, rng, [[285, 420], [405, 395], [525, 395]], [16, 5], {
          label: '右伸辅梢', gnarl: 0.8, washCount: 28, fissures: 6
        });

        for (let f = 0; f < 105; f++) {
          const fy = 20 + rng() * 1100;
          const fx = 222 + rng() * 72;
          const len = 18 + rng() * 52;
          const col = GM.rgbaStr(rng() > 0.35 ? P.inkDeep : P.burntOchre, 0.32 + rng() * 0.25);
          GM.pushRaw(api, 3, '柳干纵向皴裂', (c) => {
            c.save(); c.strokeStyle = col; c.lineWidth = 0.8 + rng() * 0.65; c.lineCap = 'round';
            c.beginPath(); c.moveTo(fx, fy); c.quadraticCurveTo(fx + (rng() - 0.5) * 6, fy + len * 0.5, fx + (rng() - 0.5) * 5, fy + len); c.stroke(); c.restore();
          }, 'vein');
        }
        for (let m = 0; m < 40; m++) {
          const my = 80 + rng() * 980;
          const mx = 224 + rng() * 68;
          const col = GM.rgbaStr(rng() > 0.4 ? '#567848' : '#8da36a', 0.52);
          GM.pushRaw(api, 3, '柳干石绿点苔', (c) => {
            c.save(); c.fillStyle = col;
            c.beginPath(); c.ellipse(mx, my, 2.3 + rng() * 2.2, 1.5 + rng() * 1.4, rng(), 0, GM.TAU); c.fill(); c.restore();
          }, 'moss');
        }

        // Gentle breeze-swayed S-curve willow whips (zero plumb vertical grid!)
        const whips = [
          [[395, 225], [408, 430], [435, 620], [472, 795]],
          [[438, 200], [452, 460], [486, 675], [528, 860]],
          [[485, 175], [504, 470], [540, 710], [578, 905]],
          [[532, 155], [556, 445], [592, 665], [630, 845]],
          [[582, 138], [608, 425], [642, 625], [678, 795]],
          [[628, 122], [652, 395], [685, 575], [718, 735]],
          [[495, 395], [516, 610], [548, 775], [582, 925]],
          [[525, 395], [688, 520], [728, 710], [765, 885]],
          [[340, 265], [352, 495], [375, 675], [402, 815]],
          [[412, 215], [396, 415], [408, 565], [428, 695]],
          [[660, 118], [685, 345], [712, 495], [738, 615]]
        ];

        whips.forEach((wp) => {
          const sm = GM.catmullRom(wp, 10, false);
          GM.baimiaoStroke(api, 1, '风柳柔丝长条', sm, { raw: true, width: 1.0, color: '#455930', alpha: 0.72, style: 'yousi' });
          const nLeaves = 8;
          for (let k = 1; k <= nLeaves; k++) {
            const idx = Math.floor((k / (nLeaves + 1)) * (sm.length - 1));
            const pt = sm[idx];
            const prev = sm[Math.max(0, idx - 1)], next = sm[Math.min(sm.length - 1, idx + 1)];
            const stemAng = Math.atan2(next[1] - prev[1], next[0] - prev[0]);
            const side = k % 2 === 0 ? 1 : -1;
            const ang = stemAng + side * (0.28 + rng() * 0.22);
            GM.drawGongbiLeaf(api, rng, {
              x: pt[0], y: pt[1], angle: ang,
              length: 44 + rng() * 18, width: 11 + rng() * 3.2,
              bend: side * 0.14, isBack: rng() > 0.72, autumnTip: rng() > 0.62
            });
          }
        });

        // Autumn Cicada Clinging on Trunk around (275, 558)
        const cx = 275, cy = 558;
        [
          [[cx - 12, cy - 18], [cx - 32, cy - 32], [cx - 42, cy - 16]],
          [[cx + 14, cy - 18], [cx + 34, cy - 32], [cx + 44, cy - 14]],
          [[cx - 14, cy + 4], [cx - 38, cy - 2], [cx - 48, cy + 16]],
          [[cx + 16, cy + 4], [cx + 40, cy - 2], [cx + 50, cy + 16]],
          [[cx - 14, cy + 28], [cx - 34, cy + 44], [cx - 44, cy + 68]],
          [[cx + 14, cy + 28], [cx + 36, cy + 44], [cx + 46, cy + 68]]
        ].forEach(leg => {
          GM.baimiaoStroke(api, 4, '秋蝉附枝纤足', leg, { width: 2.1, color: P.inkDeep, style: 'dingtou' });
          GM.baimiaoStroke(api, 5, '蝉足高光', [leg[0], leg[1]], { width: 0.75, color: '#9c7d52', alpha: 0.75 });
        });

        const cicHead = GM.catmullRom([[cx - 22, cy - 38], [cx - 12, cy - 52], [cx + 14, cy - 52], [cx + 24, cy - 38], [cx + 16, cy - 26], [cx - 14, cy - 26]], 4, true);
        const cicThorax = GM.catmullRom([[cx - 22, cy - 26], [cx + 24, cy - 26], [cx + 25, cy + 14], [cx + 18, cy + 56], [cx, cy + 78], [cx - 18, cy + 56], [cx - 24, cy + 14]], 6, true);
        GM.baimiaoStroke(api, 1, '秋蝉胸腹廓线', cicThorax, { closed: true, raw: true, width: 1.15, color: P.inkDeep });
        GM.baimiaoStroke(api, 1, '秋蝉头部轮廓', cicHead, { closed: true, raw: true, width: 1.15, color: P.inkDeep });
        GM.baseShadePoly(api, 2, '玄蝉黑褐甲壳', cicThorax, { baseColor: '#251e18', baseAlpha: 0.94, shadeColor: '#69533c', shadeAlpha: 0.45 });
        GM.baseShadePoly(api, 2, '蝉首黑褐染', cicHead, { baseColor: '#251e18', baseAlpha: 0.94, shadeColor: '#7a6144', shadeAlpha: 0.45 });
        for (let seg = 0; seg < 6; seg++) {
          const sy = cy + 20 + seg * 8, sw = 18 - seg * 2.2;
          GM.baimiaoStroke(api, 3, '蝉腹节纹', [[cx - sw, sy], [cx, sy + 3], [cx + sw, sy]], { width: 0.8, color: '#7a5d42', alpha: 0.75 });
        }
        [-1, 1].forEach(s => {
          GM.pushRaw(api, 5, '蝉复眼朱赭', (c) => {
            c.save();
            c.fillStyle = '#8f3b26'; c.beginPath(); c.ellipse(cx + s * 22, cy - 42, 5.4, 4.2, s * 0.25, 0, GM.TAU); c.fill();
            c.fillStyle = '#ebce8c'; c.beginPath(); c.arc(cx + s * 21, cy - 43.2, 1.3, 0, GM.TAU); c.fill();
            c.restore();
          }, 'eye');
          GM.baimiaoStroke(api, 4, '蝉短触须', [[cx + s * 10, cy - 50], [cx + s * 24, cy - 66]], { width: 0.7, color: P.inkDeep, style: 'dingtou' });
        });

        function drawCicadaWing(wingPts, isRight) {
          const sgn = isRight ? 1 : -1;
          const sm = GM.catmullRom(wingPts, 6, true);
          GM.baimiaoStroke(api, 4, '蝉翼外廓主脉', sm, { closed: true, raw: true, width: 1.3, color: '#3b3224', alpha: 0.85 });
          GM.baseShadePoly(api, 4, '蝉翼薄纱透染', sm, {
            baseColor: '#efe7cf', baseAlpha: 0.16, shadeColor: '#a69062', shadeAlpha: 0.14,
            gradFrom: wingPts[0], gradTo: wingPts[2]
          });
          const root = wingPts[0];
          [
            [root, [cx + sgn * 36, cy + 48], [cx + sgn * 56, cy + 125]],
            [root, [cx + sgn * 28, cy + 62], [cx + sgn * 40, cy + 148]],
            [root, [cx + sgn * 18, cy + 74], [cx + sgn * 22, cy + 158]],
            [root, [cx + sgn * 10, cy + 66], [cx + sgn * 6, cy + 142]]
          ].forEach(rPts => {
            GM.baimiaoStroke(api, 4, '蝉翼网状纵脉', rPts, { width: 0.72, color: '#4f422e', alpha: 0.72 });
            GM.baimiaoStroke(api, 5, '蝉脉金边提光', rPts, { width: 0.45, color: P.goldPale, alpha: 0.48 });
          });
          for (let c = 0; c < 6; c++) {
            const cyy = cy + 68 + c * 15;
            GM.baimiaoStroke(api, 4, '蝉翼横脉翅室', [[cx + sgn * (12 + c * 4), cyy], [cx + sgn * (36 + (5 - c) * 3), cyy + 6]], {
              width: 0.62, color: '#4f422e', alpha: 0.65
            });
          }
        }
        drawCicadaWing([[cx - 18, cy - 12], [cx - 56, cy + 38], [cx - 48, cy + 142], [cx - 16, cy + 156], [cx + 2, cy + 92]], false);
        drawCicadaWing([[cx + 18, cy - 12], [cx + 58, cy + 38], [cx + 50, cy + 142], [cx + 16, cy + 156], [cx - 2, cy + 92]], true);

        GM.finalizeGongbiBudget(api, rng, W, H, {
          target: 7200, minTarget: 6200, maxTarget: 8600,
          focusX: 420, focusY: 540, focusR: 320, haloLight: true,
          inscription: { x: 780, y: 165, text: '高枝清响', opts: { size: 32, stepY: 42, color: '#2b221a' } },
          seal: { x: 780, y: 365, text: '清秋', opts: { size: 40, color: '#9c2d23' } }
        });
      }
    },

    // =========================================================================
    // 8. 工笔·幽兰粉蝶
    // =========================================================================
    {
      id: 'gongbi-orchid-butterfly',
      title: '工笔·幽兰粉蝶',
      subtitle: '马麟《兰花》与毘陵草虫：钉头鼠尾双勾交凤眼 → 素心兰胭脂点舌 → 粉蝶彩凤细粉点鳞',
      group: '国画·工笔',
      category: '工笔花鸟',
      seal: '工笔草虫',
      mode: 'gongbi',
      width: 920,
      height: 1180,
      seed: 1008,
      swatches: ['rgb(235, 224, 200)', 'rgb(62, 114, 58)', 'rgb(162, 64, 96)', 'rgb(248, 240, 212)', 'rgb(212, 184, 78)'],
      desc: '师南宋马麟画兰法，坡石苔草间十八瓣双勾剑叶交错破出“凤眼”，两箭春兰吐狭长芽绿玉瓣与胭脂点心；上有澄澈玉粉蝶与青凤蝶轻翩，风致幽微。',
      layers: GONGBI_LAYERS,
      analysis: {
        original: '南宋马麟《兰花图》与宋元毘陵画派草虫小景',
        movement: '宋元院体工笔兰竹草虫',
        palette: '古绢坡石 · 汁绿头绿剑叶 · 芽绿蛤粉兰瓣 · 胭脂兰舌 · 玉白粉蝶',
        technique: '钉头鼠尾兰叶 · 交错凤眼构图 · 兰舌点胭脂 · 蝶翅玉粉微脉',
        algorithm: '先勾勒十八茎长剑兰叶并沿中脉留水线分染浓淡，配双株春兰细作长尖花瓣及红斑卷舌，上加明净玉白粉蝶与翠凤蝶。'
      },
      buildStrokes(api) {
        ensureGM();
        const rng = GM.makeRng(1008);
        const W = 920, H = 1180;

        GM.silkHaloGround(api, 2, W, H, rng, {
          count: 380, focusX: 460, focusY: 560, focusR: 340,
          haloLight: true, warmColor: P.silkTea, coolColor: '#788870'
        });

        GM.drawTaihuRock(api, rng, {
          outerPts: [[85, 1138], [105, 1020], [185, 985], [275, 968], [395, 988], [495, 1022], [585, 1072], [568, 1138]],
          holes: [], mossCount: 54
        });

        function drawOrchidBlade(pts, maxW, isBack = false) {
          const curve = GM.catmullRom(pts, 12, false);
          const n = curve.length;
          const left = [], right = [];
          for (let i = 0; i < n; i++) {
            const u = i / Math.max(1, n - 1);
            const prev = curve[Math.max(0, i - 1)], next = curve[Math.min(n - 1, i + 1)];
            const tx = next[0] - prev[0], ty = next[1] - prev[1];
            const norm = Math.hypot(tx, ty) || 1;
            const nx = -ty / norm, ny = tx / norm;
            const twist = Math.abs(Math.cos(u * Math.PI * 1.15 - 0.35));
            const hw = maxW * 0.5 * Math.sin(Math.pow(u, 0.55) * Math.PI * 0.94 + 0.08) * (0.28 + 0.72 * twist);
            left.push([curve[i][0] + nx * hw, curve[i][1] + ny * hw]);
            right.unshift([curve[i][0] - nx * hw, curve[i][1] - ny * hw]);
          }
          const poly = left.concat(right);
          const colLine = isBack ? P.inkPale : P.inkDeep;
          GM.baimiaoStroke(api, 1, '兰叶钉头鼠尾双勾', poly, {
            closed: true, raw: true, width: isBack ? 0.85 : 1.05, color: colLine, style: 'dingtou', chunkSize: 12
          });
          GM.baseShadePoly(api, 2, '兰叶汁绿统染', poly, {
            baseColor: isBack ? '#8ba868' : '#4a7d47', baseAlpha: 0.82,
            shadeColor: isBack ? '#4e6939' : '#224a2d', shadeAlpha: 0.54,
            gradFrom: curve[0], gradTo: curve[n - 1]
          });
          GM.fenranRegion(api, 3, '兰叶留水线分染', poly, rng, {
            count: 42, colorFrom: isBack ? '#5c7842' : '#265336', colorTo: '#94b572',
            gradFrom: curve[0], gradTo: curve[n - 1], veinPts: curve, waterLineGap: 1.9, hugVein: true,
            alphaMin: 0.03, alphaMax: 0.11, dabScale: 0.85
          });
          GM.baimiaoStroke(api, 4, '兰脉水线亮筋', curve, {
            raw: true, width: 0.85, color: '#b4cc8a', alpha: 0.58, chunkSize: 12
          });
        }

        const blades = [
          { pts: [[295, 1020], [320, 740], [450, 445], [585, 250]], w: 19, back: false },
          { pts: [[315, 1025], [375, 725], [305, 515], [248, 365]], w: 18, back: false },
          { pts: [[345, 1025], [440, 780], [635, 585], [815, 445]], w: 20, back: false },
          { pts: [[280, 1020], [230, 815], [160, 660], [115, 565]], w: 17, back: true },
          { pts: [[305, 1030], [380, 845], [535, 675], [705, 550]], w: 18, back: true },
          { pts: [[335, 1030], [465, 865], [645, 765], [815, 715]], w: 19, back: false },
          { pts: [[265, 1015], [275, 785], [335, 585], [415, 425]], w: 16, back: true },
          { pts: [[325, 1028], [260, 860], [215, 725], [185, 605]], w: 15, back: false },
          { pts: [[355, 1035], [495, 925], [665, 875], [795, 865]], w: 17, back: true },
          { pts: [[250, 1010], [185, 880], [125, 795], [85, 745]], w: 14, back: true },
          { pts: [[318, 1022], [358, 695], [490, 495], [625, 365]], w: 16, back: false },
          { pts: [[338, 1028], [410, 770], [545, 545], [695, 415]], w: 15, back: true }
        ];
        blades.forEach(b => drawOrchidBlade(b.pts, b.w, b.back));

        GM.simaoTract(api, 4, '石畔春草丝毛', GM.catmullRom([[140, 1025], [220, 965], [395, 985], [485, 1045], [285, 1065]], 5, true), rng, {
          count: 380, angle: -1.52, spread: 0.72, lenMin: 12, lenMax: 30, color: '#2b4a26', colorAlt: '#789652', width: 0.7
        });

        GM.baimiaoStroke(api, 1, '春兰箭梗', [[335, 1015], [410, 685], [485, 435]], { width: 2.2, color: '#5d6b42' });
        GM.baimiaoStroke(api, 1, '伴生兰梗', [[322, 1015], [355, 755], [375, 565]], { width: 1.9, color: '#6b7548' });

        function drawOrchidFlower(ox, oy, scale = 1.0, rot = 0) {
          const pAngles = [-Math.PI * 0.5, -Math.PI * 0.88, -Math.PI * 0.12, Math.PI * 0.72, Math.PI * 0.28];
          pAngles.forEach((pa, pi) => {
            GM.drawFlowerPetal(api, rng, {
              cx: ox, cy: oy, angle: pa + rot,
              length: (pi === 0 ? 58 : 54) * scale,
              width: (pi === 1 || pi === 2 ? 20 : 16) * scale,
              notches: 0, tilt: 0.94, baseAlpha: 0.92,
              baseColor: '#f3f5dc', rootColor: '#698548', midColor: '#dfe5bc', tipColor: '#f9faee',
              outlineColor: '#4c5934', washCount: 16
            });
          });
          const lip = GM.catmullRom([
            [ox - 8 * scale, oy + 2], [ox + 8 * scale, oy + 2],
            [ox + 11 * scale, oy + 22 * scale], [ox, oy + 30 * scale], [ox - 11 * scale, oy + 22 * scale]
          ], 4, true);
          GM.baimiaoStroke(api, 1, '兰舌双勾', lip, { closed: true, raw: true, width: 0.85, color: P.carmine });
          GM.baseShadePoly(api, 3, '素心兰舌点粉', lip, { baseColor: P.clamWhite, baseAlpha: 0.96, shadeColor: '#d9788e', shadeAlpha: 0.42 });
          for (let d = 0; d < 7; d++) {
            const dx = ox + (rng() - 0.5) * 12 * scale, dy = oy + 10 * scale + rng() * 14 * scale;
            GM.pushRaw(api, 5, '兰舌胭脂细点', (c) => {
              c.save(); c.fillStyle = GM.rgbaStr(P.carmine, 0.88);
              c.beginPath(); c.arc(dx, dy, 1.45 * scale, 0, GM.TAU); c.fill(); c.restore();
            }, 'lifen');
          }
        }

        drawOrchidFlower(485, 435, 1.05, 0.08);
        drawOrchidFlower(432, 565, 0.96, -0.15);
        drawOrchidFlower(375, 565, 0.92, 0.22);
        drawOrchidFlower(356, 675, 0.85, -0.08);
        GM.drawPlumBlossom(api, rng, { x: 505, y: 375, radius: 16, view: 'bud', blush: false });

        // Radiant Ivory-Cream Pierid Butterfly (NO muddy gray!) & Iridescent Blue Swallowtail
        function drawButterfly(bx, by, scale, wingBase, wingTip, accentCol) {
          const fw = GM.catmullRom([
            [bx, by - 4 * scale], [bx + 42 * scale, by - 58 * scale], [bx + 76 * scale, by - 32 * scale],
            [bx + 62 * scale, by + 6 * scale], [bx + 14 * scale, by + 6 * scale]
          ], 5, true);
          const hw = GM.catmullRom([
            [bx, by + 4 * scale], [bx + 56 * scale, by + 2 * scale], [bx + 62 * scale, by + 44 * scale],
            [bx + 32 * scale, by + 58 * scale], [bx + 8 * scale, by + 28 * scale]
          ], 5, true);
          [fw, hw].forEach((wp) => {
            GM.baimiaoStroke(api, 1, '彩蝶翅廓', wp, { closed: true, raw: true, width: 0.95, color: P.inkDeep });
            GM.baseShadePoly(api, 2, '彩蝶设色', wp, {
              baseColor: wingBase, baseAlpha: 0.94, shadeColor: wingTip, shadeAlpha: 0.42,
              gradFrom: wp[1], gradTo: [bx, by]
            });
            GM.fenranRegion(api, 3, '蝶翼鳞粉微晕', wp, rng, {
              count: 32, colorFrom: wingTip, colorTo: wingBase, gradFrom: wp[1], gradTo: [bx, by],
              alphaMin: 0.035, alphaMax: 0.13
            });
            GM.striationLines(api, 4, '蝶翅网脉', [bx, by], wp.slice(4, 14).filter((_, idx) => idx % 3 === 0).map(pt => [pt[0], pt[1], 0, 0]), {
              color: P.inkMid, alpha: 0.56, width: 0.58, batch: 2
            });
          });
          const bb = GM.catmullRom([[bx - 12 * scale, by + 16 * scale], [bx + 6 * scale, by - 12 * scale], [bx - 2 * scale, by - 16 * scale], [bx - 16 * scale, by + 4 * scale]], 4, true);
          GM.baseShadePoly(api, 2, '蝶身染', bb, { baseColor: '#29241e', baseAlpha: 0.92 });
          GM.simaoTract(api, 4, '蝶身丝毛', bb, rng, { count: 44, lenMin: 3, lenMax: 7, color: P.inkDeep, colorAlt: wingBase, width: 0.52 });
          GM.baimiaoStroke(api, 4, '蝶须', [[bx + 4 * scale, by - 14 * scale], [bx + 18 * scale, by - 42 * scale]], { width: 0.72, color: P.inkDeep });
          GM.baimiaoStroke(api, 4, '蝶须', [[bx, by - 15 * scale], [bx + 8 * scale, by - 45 * scale]], { width: 0.72, color: P.inkDeep });
          if (accentCol) {
            GM.pushRaw(api, 5, '蝶斑提粉', (c) => {
              c.save(); c.fillStyle = GM.rgbaStr(accentCol, 0.85);
              c.beginPath(); c.ellipse(bx + 46 * scale, by - 22 * scale, 5 * scale, 3.5 * scale, 0.3, 0, GM.TAU); c.fill(); c.restore();
            }, 'lifen');
          }
        }
        drawButterfly(645, 295, 1.05, '#fcf9ee', '#e9da9e', P.goldBright);
        drawButterfly(278, 535, 0.78, '#284a68', '#75ad9e', '#f0d878');

        GM.finalizeGongbiBudget(api, rng, W, H, {
          target: 7400, minTarget: 6400, maxTarget: 8800,
          focusX: 460, focusY: 560, focusR: 340, haloLight: true,
          inscription: { x: 145, y: 145, text: '空谷幽芳', opts: { size: 32, stepY: 42, color: '#2b221a' } },
          seal: { x: 145, y: 355, text: '幽兰', opts: { size: 40, color: '#9c2d23' } }
        });
      }
    },

    // =========================================================================
    // 9. 工笔·执扇仕女
    // =========================================================================
    {
      id: 'gongbi-court-lady',
      title: '工笔·执扇仕女',
      subtitle: '唐周昉《簪花仕女》与宋摹纨扇法：三白粉面远山眉 → 千丝墨发堕马髻 → 轻纱透影配泥金宝相裙',
      group: '国画·工笔',
      category: '工笔人物',
      seal: '工笔仕女',
      mode: 'gongbi',
      width: 920,
      height: 1200,
      seed: 1009,
      swatches: ['rgb(235, 224, 200)', 'rgb(245, 225, 212)', 'rgb(198, 62, 54)', 'rgb(74, 134, 122)', 'rgb(228, 186, 82)'],
      desc: '摹唐宋工笔仕女画风，丰颊修颈施“三白法”与胭脂面妆，千笔丝毛梳理云髻金钗，外披天水碧半透轻纱与S形披帛，内着束胸锦带石榴红泥金裙，执画山水纨扇亭立。',
      layers: GONGBI_LAYERS,
      analysis: {
        original: '唐代周昉《簪花仕女图》与五代南唐《纨扇仕女》设色法',
        movement: '唐宋工笔人物仕女画',
        palette: '粉面三白 · 曙红面妆 · 松烟云髻 · 天水碧纱 · 石榴红泥金裙',
        technique: '三白法开脸 · 高髻美人尖千丝毛 · 束胸锦带遮叠褶 · 高古游丝飘带 · 团窠描金',
        algorithm: '先勾椭圆开脸与拱形云髻发际线，三白提亮面部；红裙褶纹置于束胸锦带之下层，轻纱大袖与山水纨扇覆叠于上，遮挡严密自然。'
      },
      buildStrokes(api) {
        ensureGM();
        const rng = GM.makeRng(1009);
        const W = 920, H = 1200;

        GM.silkHaloGround(api, 2, W, H, rng, {
          count: 380, focusX: 465, focusY: 560, focusR: 350,
          haloLight: true, warmColor: P.silkTea, coolColor: '#788882'
        });

        // Subtle garden bamboo grove in soft pale ink behind lower-right corner
        [725, 765].forEach(bx => {
          GM.baimiaoStroke(api, 1, '庭院疏竹竿', [[bx, 1145], [bx + 8, 860], [bx + 18, 625]], { width: 3.2, color: '#6d7864', alpha: 0.48 });
        });
        [
          { x: 730, y: 840, angle: -2.4, length: 95, width: 18, isBack: true },
          { x: 732, y: 838, angle: -1.8, length: 88, width: 16, isBack: true },
          { x: 768, y: 745, angle: -0.45, length: 98, width: 18, isBack: true },
          { x: 770, y: 742, angle: 0.22, length: 92, width: 16, isBack: true }
        ].forEach(lf => GM.drawGongbiLeaf(api, rng, lf));

        // Neck & Rounded Tang-Song Face
        const neckPoly = GM.catmullRom([[442, 336], [488, 336], [496, 392], [435, 392]], 4, true);
        const facePoly = GM.catmullRom([
          [420, 260], [424, 228], [462, 214], [502, 228], [506, 262],
          [502, 304], [484, 336], [462, 344], [440, 336], [422, 304]
        ], 7, true);
        GM.baimiaoStroke(api, 1, '仕女玉颈双勾', neckPoly, { closed: true, raw: true, width: 0.95, color: '#5c3c2e', alpha: 0.72 });
        GM.baseShadePoly(api, 2, '颈部淡肉底色', neckPoly, { baseColor: '#f6dfd0', baseAlpha: 0.94, shadeColor: '#deb49e', shadeAlpha: 0.42 });
        GM.baimiaoStroke(api, 1, '开脸高古游丝描', facePoly, { closed: true, raw: true, width: 1.1, color: '#543528', alpha: 0.78, style: 'yousi' });
        GM.baseShadePoly(api, 2, '粉面淡赭底妆', facePoly, { baseColor: '#f8e6d9', baseAlpha: 0.96, shadeColor: '#e5baa8', shadeAlpha: 0.32 });

        const leftCheek = GM.catmullRom([[424, 288], [446, 286], [448, 314], [426, 312]], 4, true);
        const rightCheek = GM.catmullRom([[478, 286], [500, 288], [498, 312], [476, 314]], 4, true);
        GM.fenranRegion(api, 3, '腮红淡胭脂分染', leftCheek, rng, { count: 28, colorFrom: '#e06c75', colorTo: '#f8e6d9', alphaMin: 0.03, alphaMax: 0.1 });
        GM.fenranRegion(api, 3, '右腮淡胭脂分染', rightCheek, rng, { count: 28, colorFrom: '#e06c75', colorTo: '#f8e6d9', alphaMin: 0.03, alphaMax: 0.1 });

        [
          { pts: [[445, 240], [482, 240], [476, 260], [450, 260]], label: '三白·天庭额粉' },
          { pts: [[456, 275], [468, 275], [467, 308], [457, 308]], label: '三白·鼻梁挺亮' },
          { pts: [[448, 326], [476, 326], [472, 339], [452, 339]], label: '三白·下颌盈白' }
        ].forEach(sb => {
          GM.fenranRegion(api, 5, sb.label, GM.catmullRom(sb.pts, 4, true), rng, { count: 22, colorFrom: P.clamWhite, colorTo: '#f8e6d9', alphaMin: 0.04, alphaMax: 0.14 });
        });

        GM.baimiaoStroke(api, 4, '左远山蛾眉', [[428, 272], [441, 267], [452, 271]], { width: 1.55, color: '#2b2019', alpha: 0.85, style: 'dingtou' });
        GM.baimiaoStroke(api, 4, '右远山蛾眉', [[472, 271], [484, 267], [496, 272]], { width: 1.55, color: '#2b2019', alpha: 0.85, style: 'dingtou' });
        GM.baimiaoStroke(api, 4, '左丹凤眼', [[430, 284], [442, 281], [453, 285]], { width: 1.45, color: '#1b1410' });
        GM.baimiaoStroke(api, 4, '左眼下睑', [[432, 286], [442, 288], [452, 286]], { width: 0.72, color: '#453229' });
        GM.baimiaoStroke(api, 4, '右丹凤眼', [[471, 285], [482, 281], [494, 284]], { width: 1.45, color: '#1b1410' });
        GM.baimiaoStroke(api, 4, '右眼下睑', [[472, 286], [482, 288], [492, 286]], { width: 0.72, color: '#453229' });
        GM.baimiaoStroke(api, 4, '琼鼻细勾', [[460, 278], [457, 304], [466, 306]], { width: 0.95, color: '#6b4435' });
        [[442, 284], [482, 284]].forEach(([ex, ey]) => {
          GM.pushRaw(api, 5, '点瞳传神', (c) => {
            c.save(); c.fillStyle = '#181310'; c.beginPath(); c.arc(ex, ey, 2.3, 0, GM.TAU); c.fill();
            c.fillStyle = '#fff'; c.beginPath(); c.arc(ex - 0.7, ey - 0.7, 0.7, 0, GM.TAU); c.fill(); c.restore();
          }, 'eye');
        });
        const lipUpper = GM.catmullRom([[452, 321], [458, 318], [462, 320], [466, 318], [472, 321], [462, 324]], 4, true);
        const lipLower = GM.catmullRom([[453, 322], [462, 328], [471, 322], [462, 324]], 4, true);
        GM.baseShadePoly(api, 5, '点绛红唇', lipUpper, { baseColor: '#c43238', baseAlpha: 0.92, shadeColor: P.carmine, shadeAlpha: 0.45 });
        GM.baseShadePoly(api, 5, '下唇点胭脂', lipLower, { baseColor: '#d13d44', baseAlpha: 0.9, shadeColor: P.carmine, shadeAlpha: 0.4 });

        // Curved Arched Tang-Song Hairline (美人尖拱形发际 — zero gray cap across forehead!)
        const hairMass = GM.catmullRom([
          [408, 286], [392, 232], [418, 178], [462, 162], [508, 178],
          [532, 232], [516, 286], [504, 240], [484, 218], [462, 226], [440, 218], [420, 240]
        ], 7, true);
        const topBun = GM.catmullRom([[428, 188], [422, 148], [462, 134], [502, 148], [496, 188]], 5, true);
        GM.baimiaoStroke(api, 1, '高髻外廓双勾', hairMass, { closed: true, raw: true, width: 1.25, color: P.inkDeep });
        GM.baimiaoStroke(api, 1, '发顶云髻轮廓', topBun, { closed: true, raw: true, width: 1.15, color: P.inkDeep });
        GM.baseShadePoly(api, 2, '乌黑高髻统染', hairMass, { baseColor: '#1f1a18', baseAlpha: 0.96, shadeColor: '#3a322d', shadeAlpha: 0.4 });
        GM.baseShadePoly(api, 2, '顶髻墨染', topBun, { baseColor: '#1f1a18', baseAlpha: 0.96, shadeColor: '#3a322d', shadeAlpha: 0.4 });

        const hairFlows = [
          [[462, 140], [428, 172], [406, 225], [412, 278]],
          [[462, 140], [496, 172], [518, 225], [512, 278]],
          [[430, 182], [462, 172], [494, 182]],
          [[414, 215], [435, 198], [462, 196], [489, 198], [510, 215]],
          [[462, 136], [442, 152], [436, 178]],
          [[462, 136], [482, 152], [488, 178]]
        ];
        GM.flowHairStrands(api, 4, '云髻千丝墨发', hairFlows, rng, {
          color: '#141110', sheenColor: '#564d47', alpha: 0.78, width: 0.65, strandsPerPath: 150, jitter: 14
        });

        GM.goldFiligreeStroke(api, 5, '金钗步摇', [[445, 165], [418, 128], [410, 145]], { width: 1.65 });
        GM.goldFiligreeStroke(api, 5, '右金步摇', [[482, 165], [512, 128], [520, 145]], { width: 1.65 });
        GM.goldFiligreeStroke(api, 5, '正中玉梳金边', [[438, 195], [462, 188], [486, 195]], { width: 2.0 });
        [[410, 148], [520, 148], [418, 126], [512, 126]].forEach(([px, py]) => {
          GM.pushRaw(api, 5, '步摇珍珠点白', (c) => {
            c.save(); c.fillStyle = GM.rgbaStr(P.clamWhite, 0.96);
            c.beginPath(); c.arc(px, py, 3.2, 0, GM.TAU); c.fill(); c.restore();
          }, 'lifen');
        });
        GM.drawPlumBlossom(api, rng, { x: 406, y: 205, radius: 18, view: 'front', blush: true });

        // Scarlet Chest-High Skirt drawn in Layer 2 & 3 ONLY (so Layer 3/4 gauze & fan cover waist/chest cleanly!)
        const skirt = GM.catmullRom([
          [385, 515], [465, 505], [545, 515],
          [605, 815], [645, 1085], [465, 1110], [285, 1085], [325, 815]
        ], 7, true);
        GM.baimiaoStroke(api, 1, '齐胸罗裙游丝轮廓', skirt, { closed: true, raw: true, width: 1.15, color: '#45181c', style: 'yousi' });
        GM.baseShadePoly(api, 2, '石榴红裙底染', skirt, {
          baseColor: '#b8342e', baseAlpha: 0.92, shadeColor: '#6d171c', shadeAlpha: 0.52,
          gradFrom: [465, 1080], gradTo: [465, 515]
        });
        GM.fenranRegion(api, 3, '长裙褶谷胭脂分染', skirt, rng, {
          count: 170, colorFrom: P.deepCarmine, colorTo: '#df6b56',
          gradFrom: [465, 1090], gradTo: [465, 520], bias: 'from',
          alphaMin: 0.035, alphaMax: 0.13
        });

        // Curved delicate pleated drapery folds STRICTLY below waistband (y >= 542) and at Layer 3!
        for (let f = -5; f <= 5; f++) {
          const topX = 465 + f * 15;
          const botX = 465 + f * 31 + Math.sin(f) * 8;
          const midX = GM.lerp(topX, botX, 0.5) + (f < 0 ? -12 : 12);
          GM.baimiaoStroke(api, 3, '衣袂高古游丝褶', [[topX, 542], [midX, 815], [botX, 1085]], {
            width: 0.95, color: '#6b181e', alpha: 0.52, style: 'yousi'
          });
        }

        // Gold Brocade Roundels (泥金团窠宝相花纹) on lower exposed skirt
        [
          [385, 695], [472, 745], [542, 685], [358, 865], [472, 915], [568, 855], [418, 995], [525, 1005]
        ].forEach(([rx, ry]) => {
          const ring = [];
          for (let k = 0; k <= 16; k++) {
            const a = (k / 16) * GM.TAU;
            ring.push([rx + Math.cos(a) * 20, ry + Math.sin(a) * 20]);
          }
          GM.goldFiligreeStroke(api, 5, '罗裙描金团花', ring, { closed: true, raw: true, width: 0.85, alpha: 0.62 });
          for (let p = 0; p < 6; p++) {
            const a = (p / 6) * GM.TAU;
            GM.goldFiligreeStroke(api, 5, '团花宝相瓣', [[rx, ry], [rx + Math.cos(a) * 13, ry + Math.sin(a) * 13]], { raw: true, width: 0.75, alpha: 0.58 });
          }
        });

        // Translucent Tianshuibi Celadon Gauze Coat covering shoulders & chest above skirt
        const upperCoat = GM.catmullRom([
          [428, 368], [345, 425], [308, 565], [358, 635], [435, 585],
          [495, 585], [575, 635], [615, 555], [572, 425], [496, 368]
        ], 7, true);
        GM.baimiaoStroke(api, 1, '天水碧纱衫双勾', upperCoat, { closed: true, raw: true, width: 1.15, color: '#294846', style: 'yousi' });
        GM.baseShadePoly(api, 3, '天水碧纱衫遮罩', upperCoat, {
          baseColor: '#88b5ad', baseAlpha: 0.88, shadeColor: '#dfeae2', shadeAlpha: 0.42,
          gradFrom: [320, 460], gradTo: [580, 560]
        });

        // Embroidered Silk Waist Sash Band (束胸锦带 + 蝴蝶结飘带) separating gauze & pleats!
        const sashBand = GM.catmullRom([[385, 514], [545, 514], [552, 540], [378, 540]], 4, true);
        GM.baimiaoStroke(api, 4, '束胸锦带双勾', sashBand, { closed: true, raw: true, width: 1.0, color: '#5c3c1e' });
        GM.baseShadePoly(api, 4, '锦带鹅黄泥金', sashBand, { baseColor: '#e8cb78', baseAlpha: 0.94, shadeColor: '#c48f36', shadeAlpha: 0.4 });
        const sashTail = [[495, 538], [525, 645], [518, 765], [504, 760], [510, 645], [482, 538]];
        GM.baseShadePoly(api, 4, '锦带垂带', GM.catmullRom(sashTail, 4, true), { baseColor: '#e8cb78', baseAlpha: 0.88 });

        // Dynamic Asymmetrical S-curved Celadon Pibo Scarf billowing gracefully!
        const dynScarf = GM.catmullRom([
          [362, 435], [278, 555], [242, 725], [288, 915], [304, 965],
          [265, 725], [298, 565], [385, 455], [545, 445], [645, 535],
          [695, 675], [645, 835], [622, 925], [638, 825], [672, 675], [622, 545], [540, 465]
        ], 6, true);
        GM.baimiaoStroke(api, 1, '轻盈披帛游丝描', dynScarf, { closed: true, raw: true, width: 1.0, color: '#2b524d', style: 'yousi' });
        GM.baseShadePoly(api, 4, '披帛石绿飘纱', dynScarf, { baseColor: '#82afa6', baseAlpha: 0.72, shadeColor: '#e6eee7', shadeAlpha: 0.35 });

        // Round Silk Fan (纨扇) raised cleanly above sashBand + painted celadon mountain wash & miniature seal
        const fanX = 408, fanY = 458, fanR = 64;
        const fanRim = [];
        for (let k = 0; k < 28; k++) {
          const a = (k / 28) * GM.TAU;
          fanRim.push([fanX + Math.cos(a) * fanR, fanY + Math.sin(a) * fanR * 0.94]);
        }
        GM.baseShadePoly(api, 4, '素绢扇面平涂', fanRim, { baseColor: '#f6ebd0', baseAlpha: 0.96, shadeColor: '#d9c59c', shadeAlpha: 0.3 });
        const fanMtn = GM.catmullRom([[fanX - 44, fanY + 14], [fanX - 20, fanY - 12], [fanX + 2, fanY + 2], [fanX + 26, fanY - 18], [fanX + 46, fanY + 10], [fanX + 46, fanY + 20], [fanX - 44, fanY + 20]], 3, true);
        GM.baseShadePoly(api, 4, '扇面青绿微晕', fanMtn, { baseColor: '#7ca296', baseAlpha: 0.42, shadeColor: '#d8cfb6', shadeAlpha: 0.25 });
        GM.baimiaoStroke(api, 4, '纨扇框双勾', fanRim, { closed: true, raw: true, width: 1.5, color: '#5c4328' });
        GM.baimiaoStroke(api, 4, '漆木扇柄', [[fanX + 36, fanY + 46], [fanX + 78, fanY + 100]], { width: 3.4, color: '#42291c' });
        const handPoly = GM.catmullRom([[445, 500], [462, 490], [472, 507], [452, 520]], 3, true);
        GM.baseShadePoly(api, 4, '纤手敷粉', handPoly, { baseColor: '#f8e6d9', baseAlpha: 0.96 });
        GM.baimiaoStroke(api, 4, '素手纤指', handPoly, { closed: true, raw: true, width: 0.9, color: '#6b4536' });
        // Refined misty peak + miniature boat + vermilion seal inside the fan face!
        GM.baimiaoStroke(api, 5, '扇面山水远峰', [[fanX - 42, fanY + 14], [fanX - 20, fanY - 12], [fanX + 2, fanY + 2], [fanX + 26, fanY - 18], [fanX + 46, fanY + 10]], {
          width: 0.85, color: '#4b5b52', alpha: 0.72
        });
        GM.baimiaoStroke(api, 5, '扇面水波小舟', [[fanX - 28, fanY + 28], [fanX + 24, fanY + 26]], { width: 0.7, color: '#697268', alpha: 0.56 });
        GM.pushRaw(api, 5, '扇面朱印细点', (c) => {
          c.save(); c.fillStyle = GM.rgbaStr('#a82e24', 0.88);
          c.beginPath(); c.arc(fanX + 32, fanY + 18, 2.5, 0, GM.TAU); c.fill(); c.restore();
        }, 'seal');
        GM.goldFiligreeStroke(api, 5, '扇框泥金', fanRim, { raw: true, width: 0.85, alpha: 0.65 });

        GM.finalizeGongbiBudget(api, rng, W, H, {
          target: 8500, minTarget: 7000, maxTarget: 9600,
          focusX: 465, focusY: 560, focusR: 350, haloLight: true,
          inscription: { x: 145, y: 145, text: '清秋纨扇', opts: { size: 32, stepY: 42, color: '#2b221a' } },
          seal: { x: 145, y: 355, text: '佳人', opts: { size: 40, color: '#9c2d23' } }
        });
      }
    },

    // =========================================================================
    // 10. 工笔·金碧青绿重彩
    // =========================================================================
    {
      id: 'gongbi-gold-green-hills',
      title: '工笔·金碧青绿重彩',
      subtitle: '盛唐李思训《江帆楼阁》与王希孟《千里江山》法：赭石打底 → 头绿头青晶矿叠染 → 泥金勾山',
      group: '国画·工笔',
      category: '工笔山水',
      seal: '金碧重彩',
      mode: 'gongbi',
      width: 1200,
      height: 820,
      seed: 1010,
      swatches: ['rgb(235, 224, 200)', 'rgb(28, 72, 138)', 'rgb(42, 128, 86)', 'rgb(218, 172, 62)', 'rgb(192, 54, 38)'],
      desc: '师李思训与王希孟金碧青绿山水法度，构建层峦棱角岩嶂，先赭打底后饱染头绿头青宝石矿彩，中置飞瀑流泉与江心孤石衔接朱栏栈桥，山脊遍勾泥金，金碧辉煌。',
      layers: GONGBI_LAYERS,
      analysis: {
        original: '盛唐李思训《江帆楼阁图》与北宋王希孟《千里江山图》',
        movement: '唐宋金碧青绿重彩山水',
        palette: '金茶古绢 · 赭石暖底 · 头绿二绿 · 头青三青 · 朱砂楼阁 · 泥金勾山',
        technique: '先赭后绿再石青 · 晶石棱角山嶂 · 飞瀑栈桥连孤石 · 瑞云留白 · 泥金勾脊',
        algorithm: '构建棱角分明的千里江山重嶂多边形，以柔边径向梯度饱满分染石绿石青矿彩，山崖夹飞瀑下泻并配江心石承托栈桥，遍描泥金水纹。'
      },
      buildStrokes(api) {
        ensureGM();
        const rng = GM.makeRng(1010);
        const W = 1200, H = 820;

        GM.silkHaloGround(api, 2, W, H, rng, {
          count: 420, focusX: 640, focusY: 360, focusR: 420,
          haloLight: true, warmColor: P.silkAmber, coolColor: '#6b7e76'
        });

        function paintMountainMass(ridgePts, footY, opts) {
          const {
            label,
            peakColor = P.azuriteDeep,
            slopeColor = P.malachiteDeep,
            underColor = '#b07b4c',
            goldEdge = true,
            facetCount = 6,
            isClosedRight = true
          } = opts;

          const smoothRidge = GM.catmullRom(ridgePts, 2, false);
          const sm = [...smoothRidge, [ridgePts[ridgePts.length - 1][0], footY], [ridgePts[0][0], footY]];
          GM.baimiaoStroke(api, 1, label + '铁线起稿', smoothRidge, { raw: true, width: 1.5, color: P.inkDeep, alpha: 0.88, style: 'tiexian', chunkSize: 10 });
          // Smooth luminous mineral base tones (Ochre -> Malachite -> Azurite!)
          GM.baseShadePoly(api, 2, label + '赭石石绿统染', sm, {
            baseColor: slopeColor, baseAlpha: 0.72,
            shadeColor: underColor, shadeAlpha: 0.45,
            gradFrom: [ridgePts[Math.floor(ridgePts.length * 0.5)][0], footY],
            gradTo: ridgePts[Math.floor(ridgePts.length * 0.5)]
          });
          // Rich Jewel-Like Azurite Blue along Upper Crags!
          GM.fenranRegion(api, 3, label + '头青石青顶峰', sm, rng, {
            count: Math.round(facetCount * 22),
            colorFrom: peakColor, colorTo: slopeColor,
            gradFrom: ridgePts[Math.floor(ridgePts.length * 0.5)], gradTo: [ridgePts[0][0], footY],
            bias: 'from', alphaMin: 0.06, alphaMax: 0.22, dabScale: 1.45
          });
          // Rich Malachite Green along Lower Slopes!
          GM.fenranRegion(api, 3, label + '石绿山坡分染', sm, rng, {
            count: Math.round(facetCount * 18),
            colorFrom: P.malachiteDeep, colorTo: P.malachitePale,
            gradFrom: [ridgePts[0][0], footY], gradTo: ridgePts[Math.floor(ridgePts.length * 0.5)],
            bias: 'from', alphaMin: 0.045, alphaMax: 0.16, dabScale: 1.45
          });

          // Crisp Faceted Ridge Folds (angular mountain architecture — NO straight rain streaks!)
          for (let f = 1; f < ridgePts.length - 1; f += 2) {
            const p = ridgePts[f];
            const fy = GM.lerp(p[1], footY, 0.74);
            const fx = p[0] + (f % 4 === 1 ? -28 : 28);
            GM.baimiaoStroke(api, 1, label + '山脉棱脊', [p, [(p[0] + fx) * 0.5, (p[1] + fy) * 0.5], [fx, fy]], {
              width: 1.15, color: P.inkDeep, alpha: 0.72, style: 'tiexian'
            });
          }

          if (goldEdge) {
            GM.goldFiligreeStroke(api, 5, label + '泥金勾山脊', smoothRidge, { raw: true, width: 1.85, alpha: 0.88, chunkSize: 8 });
          }
        }

        // Far Angular Craggy Azure-Green Peaks sloping cleanly down left foothills into mist
        paintMountainMass(
          [[140, 410], [175, 378], [248, 305], [308, 255], [365, 288], [418, 265], [475, 205], [538, 268], [608, 245], [685, 185], [755, 232], [818, 198], [885, 138], [952, 188], [1035, 165], [1125, 255], [1205, 325]],
          410,
          { label: '重彩远峰', peakColor: P.azuriteDeep, slopeColor: '#488869', underColor: '#b58354', goldEdge: true, facetCount: 11 }
        );
        drawMistBand(api, rng, 640, 392, 430, 24, 90);

        // Mid-Ground Layered Peaks sloping organically into valley mist on left
        paintMountainMass(
          [[75, 545], [120, 508], [185, 428], [245, 368], [320, 325], [385, 385], [435, 405], [518, 338], [595, 368], [665, 342], [765, 268], [855, 318], [918, 295], [985, 258], [1075, 345], [1205, 445]],
          545,
          { label: '中景主嶂', peakColor: '#1d4c85', slopeColor: P.malachiteMid, underColor: P.sienna, goldEdge: true, facetCount: 13 }
        );
        // Slender Natural Mountain Waterfall pouring between center cliffs with misty splash
        const fallsPts = [[619, 396], [630, 396], [632, 468], [637, 532], [613, 532], [617, 468]];
        GM.baseShadePoly(api, 3, '崖间飞瀑留白', fallsPts, { baseColor: P.clamWhite, baseAlpha: 0.9, shadeColor: '#b5d2cf', shadeAlpha: 0.45 });
        for (let w = 0; w < 5; w++) {
          const wxTop = 620 + w * 2.2;
          const wxBot = 615 + w * 5.0;
          GM.baimiaoStroke(api, 4, '飞瀑细丝', [[wxTop, 398], [(wxTop + wxBot) * 0.5, 466], [wxBot, 530]], { width: 0.72, color: '#5c787c', alpha: 0.58 });
        }
        drawMistBand(api, rng, 625, 530, 42, 12, 26);
        drawMistBand(api, rng, 650, 528, 440, 26, 95);

        // Foreground Left Cliff Rock, Mid-Stream Anchor Islet (520..605), & Right Bank running cleanly past margins!
        paintMountainMass(
          [[-10, 685], [65, 615], [145, 562], [238, 548], [322, 608], [395, 695], [435, 795]],
          825,
          { label: '近景翠岩', peakColor: P.malachiteDeep, slopeColor: '#569c72', underColor: P.ochre, goldEdge: true, facetCount: 8 }
        );
        // Mid-Stream Craggy Islet receiving the Plank Bridge cleanly!
        paintMountainMass(
          [[485, 695], [518, 638], [558, 622], [602, 658], [625, 695]],
          705,
          { label: '江心奇石', peakColor: P.malachiteDeep, slopeColor: '#6da678', underColor: '#9c7852', goldEdge: true, facetCount: 4 }
        );
        paintMountainMass(
          [[885, 745], [965, 665], [1065, 642], [1148, 668], [1205, 705]],
          805,
          { label: '右岸青渚', peakColor: P.azuriteMid, slopeColor: P.malachiteMid, underColor: P.ochre, goldEdge: true, facetCount: 6 }
        );

        // Vermilion Tang/Song Palace Pavilions & Connected Plank Bridge!
        function drawPavilion(px, py, sc = 1.0) {
          [[-32, 0], [-14, 0], [14, 0], [32, 0]].forEach(([dx]) => {
            GM.baimiaoStroke(api, 4, '楼阁朱柱', [[px + dx * sc, py], [px + dx * sc, py - 34 * sc]], { width: 3.0 * sc, color: P.cinnabar });
          });
          GM.baimiaoStroke(api, 4, '朱栏', [[px - 38 * sc, py - 10 * sc], [px + 38 * sc, py - 10 * sc]], { width: 2.0 * sc, color: P.cinnabar });
          [{ y: py - 34 * sc, hw: 44 * sc, h: 18 * sc }, { y: py - 56 * sc, hw: 32 * sc, h: 16 * sc }].forEach(rf => {
            const roofPoly = GM.catmullRom([
              [px - rf.hw * 1.15, rf.y + 4 * sc], [px - rf.hw * 0.55, rf.y - rf.h * 0.55], [px, rf.y - rf.h],
              [px + rf.hw * 0.55, rf.y - rf.h * 0.55], [px + rf.hw * 1.15, rf.y + 4 * sc], [px, rf.y + 6 * sc]
            ], 4, true);
            GM.baimiaoStroke(api, 1, '飞檐轮廓', roofPoly, { closed: true, raw: true, width: 1.1, color: P.inkDeep });
            GM.baseShadePoly(api, 3, '飞檐石青黛瓦', roofPoly, { baseColor: '#294c6b', baseAlpha: 0.94, shadeColor: P.azuriteDeep, shadeAlpha: 0.45 });
            GM.goldFiligreeStroke(api, 5, '殿脊泥金', [[px - rf.hw * 1.1, rf.y + 3 * sc], [px, rf.y - rf.h], [px + rf.hw * 1.1, rf.y + 3 * sc]], { width: 1.25 });
          });
        }
        drawPavilion(235, 552, 1.0);
        drawPavilion(805, 515, 0.72);
        // Plank Bridge anchored cleanly from left rock (332, 622) -> mid-river islet (525, 646)!
        GM.baimiaoStroke(api, 4, '栈桥扶栏', [[332, 616], [428, 630], [522, 642]], { width: 2.0, color: '#6b3822' });
        GM.baimiaoStroke(api, 4, '栈桥桥面', [[332, 626], [428, 640], [522, 650]], { width: 2.4, color: '#8f5834' });
        for (let p = 0; p < 7; p++) {
          const bx = 345 + p * 26, by = 622 + p * 3.8;
          GM.baimiaoStroke(api, 4, '栈桥木桩', [[bx, by], [bx, by + 26]], { width: 1.6, color: '#5c341d' });
        }

        // Pine clusters anchored tightly onto ridge crevices
        [[115, 588, 38], [160, 562, 42], [295, 602, 34], [556, 626, 26], [995, 652, 32], [1055, 632, 36], [535, 342, 24], [760, 272, 24]].forEach(([px, py, r]) => {
          drawPineCluster(api, rng, px, py, -Math.PI * 0.5, r, 32, P.malachiteDeep, '#1c4430');
        });

        for (let row = 0; row < 28; row++) {
          const wy = 555 + row * 9.2;
          const xStart = wy > 700 ? 430 : 380;
          const xEnd = wy > 660 ? 920 : 1140;
          for (let wx = xStart; wx < xEnd; wx += 48 + rng() * 32) {
            const wLen = 28 + rng() * 24;
            const curve = [];
            for (let k = 0; k <= 6; k++) {
              const u = k / 6;
              curve.push([wx + u * wLen, wy + Math.sin(u * Math.PI * 2 + row * 0.4) * 2.2]);
            }
            GM.baimiaoStroke(api, 4, '江面水纹描', curve, {
              raw: true, width: 0.72, color: rng() > 0.3 ? '#6b7e76' : P.goldWarm, alpha: 0.48
            });
          }
        }

        [[665, 655, 1.0], [805, 605, 0.78]].forEach(([sx, sy, sc]) => {
          const hull = [[sx - 24 * sc, sy], [sx + 24 * sc, sy], [sx + 16 * sc, sy + 7 * sc], [sx - 18 * sc, sy + 7 * sc]];
          const sail = [[sx - 6 * sc, sy - 2 * sc], [sx - 10 * sc, sy - 38 * sc], [sx + 10 * sc, sy - 34 * sc], [sx + 8 * sc, sy - 2 * sc]];
          GM.baimiaoStroke(api, 1, '江帆船身', hull, { closed: true, raw: true, width: 1.0, color: P.inkDeep });
          GM.baseShadePoly(api, 3, '木舟色', hull, { baseColor: '#7a5232', baseAlpha: 0.92 });
          GM.baimiaoStroke(api, 1, '白帆双勾', sail, { closed: true, raw: true, width: 0.9, color: P.inkPale });
          GM.baseShadePoly(api, 4, '白帆蛤粉', sail, { baseColor: P.clamWhite, baseAlpha: 0.94, shadeColor: '#d9ccb2', shadeAlpha: 0.35 });
          GM.baimiaoStroke(api, 4, '船帆桅杆', [[sx, sy], [sx, sy - 44 * sc]], { width: 1.0, color: P.inkDeep });
        });

        GM.finalizeGongbiBudget(api, rng, W, H, {
          target: 9600, minTarget: 8200, maxTarget: 9900,
          focusX: 640, focusY: 380, focusR: 420, haloLight: false, patinaColor: P.silkAmber,
          inscription: { x: 88, y: 105, text: '金碧千秋', opts: { size: 32, stepY: 42, color: '#2b221a' } },
          seal: { x: 88, y: 305, text: '重彩', opts: { size: 40, color: '#9c2d23' } }
        });
      }
    }
  ];

  window.Code2PaintCatalog.addPack(WORKS);
})();
