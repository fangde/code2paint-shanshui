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

  // Woody gnarled trunk/branch with depth ordering & optional occlusion masking of buried tips
  function drawWoodyBranch(api, rng, pts, widths, opts = {}) {
    ensureGM();
    const smoothSpine = GM.catmullRom(pts, 10, false);
    const n = smoothSpine.length;
    const left = [], right = [];
    const depth = opts.depth != null ? opts.depth : 1;
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
      closed: true, raw: true, width: opts.lineWidth || 1.35, color: P.inkDeep, alpha: 0.86, style: 'bark', chunkSize: 12, depth
    });
    GM.baseShadePoly(api, 2, '枝干赭墨统染', poly, {
      baseColor: opts.baseColor || '#7d6147', baseAlpha: 0.94,
      shadeColor: opts.shadeColor || '#3c2e22', shadeAlpha: 0.62,
      gradFrom: smoothSpine[0], gradTo: smoothSpine[n - 1], depth
    });
    GM.fenranRegion(api, 3, '枝干老皮分染', poly, rng, {
      count: opts.washCount || Math.max(36, Math.round(n * 1.4)),
      colorFrom: '#3d2f24', colorTo: '#9c7e5d',
      gradFrom: left[Math.floor(n * 0.5)], gradTo: right[Math.floor(n * 0.5)],
      alphaMin: 0.035, alphaMax: 0.125, dabScale: 1.0, aspect: 1.8, depth,
      clipOccluders: opts.clipOccluders === true
    });
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
        raw: true, width: 0.8, color: P.inkDeep, alpha: 0.58, style: 'bark', chunkSize: 6, depth,
        clipOccluders: opts.clipOccluders !== false
      });
    }
    return smoothSpine;
  }

  function drawPetiole(api, x0, y0, x1, y1, colHex, width = 1.6, depth = 1) {
    const mx = GM.lerp(x0, x1, 0.5) + (y1 - y0) * 0.08;
    const my = GM.lerp(y0, y1, 0.5) - (x1 - x0) * 0.08;
    GM.baimiaoStroke(api, 1, '叶柄花梗连接', [[x0, y0], [mx, my], [x1, y1]], {
      width, color: colHex || P.oliveDark, alpha: 0.82, chunkSize: 6, depth
    });
    GM.baimiaoStroke(api, 2, '花梗设色', [[x0, y0], [mx, my], [x1, y1]], {
      width: width * 0.72, color: '#6b7a48', alpha: 0.82, chunkSize: 6, depth, clipOccluders: true
    });
  }

  // Organic Pine Needle Fan with varied depths & needle density (前簇后簇掩映松枝)
  function drawPineCluster(api, rng, cx, cy, angle, radius, needleCount, colDark, colLight, depth = 2) {
    for (let i = 0; i < needleCount; i++) {
      const f = i / Math.max(1, needleCount - 1);
      const spread = (f - 0.5) * 2.18 + (rng() - 0.5) * 0.14;
      const a = angle + spread;
      const len = radius * (0.62 + 0.42 * Math.sin(f * Math.PI) + (rng() - 0.5) * 0.16);
      const bend = (rng() - 0.5) * 0.13;
      const mx = cx + Math.cos(a + bend) * len * 0.52;
      const my = cy + Math.sin(a + bend) * len * 0.52;
      const ex = cx + Math.cos(a) * len;
      const ey = cy + Math.sin(a) * len;
      const col = GM.rgbaStr(rng() > 0.36 ? colDark : colLight, 0.52 + rng() * 0.3);
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
      }, 'vein', depth);
    }
    GM.pushRaw(api, 3, '松蒂墨染', (c) => {
      c.save();
      c.fillStyle = GM.rgbaStr(P.burntOchre, 0.84);
      c.beginPath();
      c.ellipse(cx, cy, 3.8, 2.8, angle, 0, GM.TAU);
      c.fill();
      c.restore();
    }, 'baseWash', depth);
  }

  function drawWingCoverts(api, rng, originX, originY, rows, cols, angle, baseColor, rimColor, barColor, depth = 3) {
    const cosA = Math.cos(angle), sinA = Math.sin(angle);
    const nx = -sinA, ny = cosA;
    for (let r = 0; r < rows; r++) {
      for (let col = 0; col < cols; col++) {
        const cx = originX + cosA * r * 11 + nx * (col - (cols - 1) * 0.5) * 11.5;
        const cy = originY + sinA * r * 11 + ny * (col - (cols - 1) * 0.5) * 11.5;
        const fw = 11 + r * 3.0;
        const fl = 17 + r * 7.5;
        const poly = [];
        for (let k = 0; k <= 12; k++) {
          const u = k / 12;
          const th = -Math.PI * 0.46 + u * Math.PI * 0.92;
          const rx = fl * Math.cos(th);
          const ry = fw * 0.5 * Math.sin(th);
          poly.push([cx + cosA * rx + nx * ry, cy + sinA * rx + ny * ry]);
        }
        poly.push([cx, cy]);
        GM.baimiaoStroke(api, 1, '覆羽双勾', poly, { closed: true, raw: true, width: 0.65, color: P.inkMid, alpha: 0.6, depth });
        GM.baseShadePoly(api, 2, '覆羽平涂', poly, {
          baseColor, baseAlpha: 0.94, shadeColor: rimColor, shadeAlpha: 0.45,
          gradFrom: [cx, cy], gradTo: [cx + cosA * fl, cy + sinA * fl], depth
        });
        if (barColor && r % 2 === 1) {
          GM.baimiaoStroke(api, 4, '覆羽暗斑复勒', poly.slice(2, 10), {
            raw: true, width: 0.95, color: barColor, alpha: 0.68, depth
          });
        }
        const tips = [];
        for (let b = 2; b < 10; b += 2) tips.push([poly[b][0], poly[b][1], 0, 0]);
        GM.striationLines(api, 4, '覆羽丝毛', [cx, cy], tips, {
          color: GM.mixHex(rimColor, P.clamWhite, 0.35), alpha: 0.38, width: 0.44, batch: 2, depth
        });
      }
    }
  }

  function drawRichBlossom(api, rng, spec) {
    const {
      cx, cy, R, tiers,
      baseColor, rootColor, midColor, tipColor, outlineColor,
      notches = 2,
      tilt = 0.82,
      stamenColor = P.gooseYellow,
      filamentColor = P.cinnabar,
      stamenCount = 46,
      depth = 4,
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
          baseAlpha: 0.96,
          rootColor: GM.mixHex(rootColor, P.deepCarmine, depthDark * 0.25),
          midColor,
          tipColor,
          outlineColor,
          tipHighlight: t >= 1,
          washCount: Math.max(16, Math.round(pLen * 0.36)),
          depth: depth + t * 0.1,
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

  // Morphologically Distinct Swallowtail vs Pierid Butterfly Builder
  function drawDistinctButterfly(api, rng, spec) {
    const { bx, by, scale = 1.0, kind = 'pierid', flip = 1 } = spec;
    const X = (dx) => bx + dx * flip;
    let fwPts, hwPts, wingBase, wingTip, spotCol;
    if (kind === 'swallowtail') {
      // Swept elongated forewing + notched deeply-scalloped tailed hindwing (凤蝶!)
      fwPts = [
        [X(0), by - 4 * scale], [X(42 * scale), by - 72 * scale], [X(92 * scale), by - 52 * scale],
        [X(78 * scale), by - 12 * scale], [X(20 * scale), by + 4 * scale]
      ];
      hwPts = [
        [X(2 * scale), by + 4 * scale], [X(62 * scale), by + 6 * scale], [X(74 * scale), by + 32 * scale],
        [X(56 * scale), by + 46 * scale], [X(46 * scale), by + 88 * scale], [X(34 * scale), by + 50 * scale], [X(10 * scale), by + 32 * scale]
      ];
      wingBase = '#2d577d';
      wingTip = '#182436';
      spotCol = '#f2d068';
    } else {
      // Soft rounded-apex creamy ivory Pierid (粉蝶!)
      fwPts = [
        [X(0), by - 4 * scale], [X(34 * scale), by - 54 * scale], [X(70 * scale), by - 30 * scale],
        [X(56 * scale), by + 6 * scale], [X(12 * scale), by + 6 * scale]
      ];
      hwPts = [
        [X(0), by + 4 * scale], [X(54 * scale), by + 2 * scale], [X(58 * scale), by + 40 * scale],
        [X(28 * scale), by + 52 * scale], [X(8 * scale), by + 26 * scale]
      ];
      wingBase = '#fcf9ee';
      wingTip = '#d8cfb0';
      spotCol = P.goldBright;
    }

    const backWingPts = [
      [X(-4), by - 3 * scale], [X(20 * scale), by - 52 * scale], [X(46 * scale), by - 34 * scale], [X(12 * scale), by + 4 * scale]
    ];
    [backWingPts, hwPts, fwPts].forEach((wp, idx) => {
      const sm = GM.catmullRom(wp, 4, true);
      const d = idx === 0 ? 4 : 4.2;
      GM.baimiaoStroke(api, 1, '彩蝶翅廓', sm, { closed: true, raw: true, width: 0.95, color: P.inkDeep, depth: d });
      GM.baseShadePoly(api, 2, '彩蝶设色', sm, {
        baseColor: wingBase, baseAlpha: 0.95, shadeColor: wingTip, shadeAlpha: 0.48,
        gradFrom: wp[1], gradTo: [X(0), by], depth: d
      });
      GM.fenranRegion(api, 3, '蝶翼鳞粉微晕', sm, rng, {
        count: 30, colorFrom: wingTip, colorTo: wingBase, gradFrom: wp[1], gradTo: [X(0), by],
        alphaMin: 0.04, alphaMax: 0.14, depth: d
      });
      GM.striationLines(api, 4, '蝶翅网脉', [X(0), by], wp.slice(1, -1).map(pt => [pt[0], pt[1], 0, 0]), {
        color: kind === 'swallowtail' ? '#587fa6' : P.inkMid, alpha: 0.62, width: 0.6, batch: 2, depth: d
      });
    });

    const bb = GM.catmullRom([[X(-12 * scale), by + 16 * scale], [X(6 * scale), by - 12 * scale], [X(-2 * scale), by - 16 * scale], [X(-16 * scale), by + 4 * scale]], 4, true);
    GM.baseShadePoly(api, 2, '蝶身染', bb, { baseColor: '#29241e', baseAlpha: 0.96, depth: 4.5 });
    GM.simaoTract(api, 4, '蝶身丝毛', bb, rng, { count: 44, lenMin: 3, lenMax: 7, color: P.inkDeep, colorAlt: wingBase, width: 0.52, depth: 4.5 });
    GM.baimiaoStroke(api, 4, '蝶须', [[X(4 * scale), by - 14 * scale], [X(22 * scale), by - 44 * scale]], { width: 0.72, color: P.inkDeep, style: 'dingtou', depth: 4.5 });
    GM.baimiaoStroke(api, 4, '蝶须', [[X(0), by - 15 * scale], [X(12 * scale), by - 48 * scale]], { width: 0.72, color: P.inkDeep, style: 'dingtou', depth: 4.5 });

    const spots = kind === 'swallowtail'
      ? [[X(52 * scale), by - 32 * scale, 4.5], [X(62 * scale), by - 18 * scale, 3.2], [X(48 * scale), by + 26 * scale, 4.2], [X(58 * scale), by + 14 * scale, 3.0]]
      : [[X(42 * scale), by - 20 * scale, 4.6], [X(40 * scale), by + 18 * scale, 3.4]];
    spots.forEach(([sx, sy, sr]) => {
      GM.pushRaw(api, 5, '蝶斑提粉', (c) => {
        c.save(); c.fillStyle = GM.rgbaStr(spotCol, 0.88);
        c.beginPath(); c.ellipse(sx, sy, sr * 1.15, sr * 0.85, 0.35, 0, GM.TAU); c.fill(); c.restore();
      }, 'lifen', 4.6);
    });
  }

  const WORKS = [
    // =========================================================================
    // 1. 工笔·姚黄魏紫牡丹
    // =========================================================================
    {
      id: 'gongbi-peony',
      title: '工笔·姚黄魏紫牡丹',
      subtitle: '南宋院体工笔重彩：方折瘦漏太湖石 → 前叶实染留水线 → 三十二瓣牡丹遮枝不透底 → 凤蝶丝毛',
      group: '国画·工笔',
      category: '工笔花鸟',
      seal: '工笔花鸟',
      mode: 'gongbi',
      width: 960,
      height: 1180,
      seed: 1001,
      swatches: ['rgb(235, 224, 200)', 'rgb(166, 36, 66)', 'rgb(245, 212, 220)', 'rgb(45, 98, 62)', 'rgb(230, 195, 92)'],
      desc: '摹南宋院体花鸟设色法度，方硬折带斧劈皴太湖石矗立右下，石孔具立体内壁厚度；前景正叶与魏紫姚黄牡丹实底叠压遮挡后枝，水线分明，凤蝶振翅欲栖。',
      layers: GONGBI_LAYERS,
      analysis: {
        original: '南宋院体《出水芙蓉》《洛阳牡丹图》册页设色法',
        movement: '宋代院体工笔重彩花鸟',
        palette: '古绢茶底 · 胭脂曙红 · 藤黄鹅黄 · 石绿花青 · 蛤粉泥金',
        technique: '太湖石折带斧劈皴 · 前景实染遮枝掩膜 · 叶脉留水线 · 批丝凤蝶',
        algorithm: '为魏紫与姚黄主花建立遮挡掩膜并按前后景深分组排序，背景反叶与木枝绝不从前景叶瓣表面透出，太湖石改用方折石壁呈现瘦漏立体。'
      },
      buildStrokes(api) {
        ensureGM();
        const rng = GM.makeRng(1001);
        const W = 960, H = 1180;

        GM.silkHaloGround(api, 2, W, H, rng, {
          count: 420, focusX: 500, focusY: 480, focusR: 360,
          haloLight: true, warmColor: P.silkTea, coolColor: P.teaGreen
        });

        // Chiseled Angular Taihu Scholar Rock lower-right (方硬瘦漏皱透)
        GM.drawTaihuRock(api, rng, {
          outerPts: [
            [522, 1148], [492, 1025], [534, 945], [488, 868], [552, 782],
            [632, 742], [735, 735], [848, 782], [872, 855], [792, 922], [888, 1028], [855, 1148]
          ],
          holes: [
            [[612, 845], [668, 825], [696, 868], [650, 908], [598, 882]],
            [[695, 972], [752, 952], [776, 1005], [728, 1042], [682, 1005]],
            [[568, 1008], [602, 988], [622, 1022], [584, 1040]]
          ],
          mossCount: 54, depth: 1
        });

        // Register flower occlusion discs BEFORE drawing twigs & back leaves so zero buried twigs bleed onto petals!
        const flowerOccluders = [
          { x: 455, y: 420, r: 126 },
          { x: 695, y: 588, r: 98 },
          { x: 315, y: 365, r: 28 }
        ];
        GM.setOccluders(flowerOccluders);

        drawWoodyBranch(api, rng, [[225, 1145], [260, 945], [312, 748], [385, 595], [442, 488]], [36, 12], {
          label: '牡丹老干双勾', gnarl: 2.0, washCount: 88, fissures: 16, depth: 1
        });
        drawWoodyBranch(api, rng, [[312, 755], [468, 695], [595, 652], [662, 622]], [22, 8], {
          label: '右斜花枝', gnarl: 1.2, washCount: 58, fissures: 9, depth: 1
        });
        drawWoodyBranch(api, rng, [[315, 742], [275, 565], [295, 430], [315, 378]], [15, 6], {
          label: '左挺嫩梢', baseColor: '#7a8a53', shadeColor: '#485432', gnarl: 0.7, washCount: 38, fissures: 4, depth: 1
        });

        // Leaves separated into depth=2 (back/recessed) & depth=3 (front crisp opaque)
        const leaves = [
          { node: [285, 815], x: 252, y: 785, angle: 2.12, length: 138, width: 54, bend: -0.12, isBack: true, serrated: true, depth: 2 },
          { node: [358, 635], x: 325, y: 535, angle: -2.02, length: 128, width: 46, bend: 0.09, isBack: true, serrated: true, autumnTip: true, depth: 2 },
          { node: [412, 718], x: 468, y: 655, angle: 1.25, length: 142, width: 54, bend: -0.1, isBack: true, serrated: true, depth: 2 },
          { node: [648, 634], x: 740, y: 568, angle: -0.35, length: 136, width: 48, bend: -0.09, isBack: true, serrated: true, depth: 2 },
          { node: [485, 765], x: 515, y: 785, angle: 1.48, length: 142, width: 52, bend: -0.08, isBack: true, serrated: true, depth: 2 },

          { node: [285, 815], x: 258, y: 775, angle: 2.68, length: 156, width: 60, bend: 0.14, isBack: false, serrated: true, depth: 3 },
          { node: [302, 720], x: 255, y: 695, angle: 3.12, length: 135, width: 52, bend: 0.1, isBack: false, serrated: true, depth: 3 },
          { node: [358, 635], x: 342, y: 565, angle: -2.55, length: 148, width: 56, bend: -0.13, isBack: false, serrated: true, depth: 3 },
          { node: [412, 718], x: 425, y: 635, angle: 1.88, length: 148, width: 58, bend: 0.15, isBack: false, serrated: true, depth: 3 },
          { node: [548, 670], x: 562, y: 695, angle: 0.65, length: 162, width: 62, bend: 0.12, isBack: false, serrated: true, depth: 3 },
          { node: [548, 670], x: 602, y: 722, angle: 1.15, length: 142, width: 54, bend: -0.14, isBack: false, serrated: true, depth: 3 },
          { node: [648, 634], x: 688, y: 645, angle: 0.25, length: 152, width: 56, bend: 0.11, isBack: false, serrated: true, depth: 3 },
          { node: [450, 500], x: 585, y: 492, angle: -0.82, length: 138, width: 52, bend: 0.12, isBack: false, serrated: true, depth: 3 },
          { node: [305, 515], x: 258, y: 495, angle: 2.85, length: 128, width: 48, bend: -0.1, isBack: false, serrated: true, wormBite: true, depth: 3 },
          { node: [485, 765], x: 472, y: 815, angle: 2.35, length: 158, width: 58, bend: 0.12, isBack: false, serrated: true, depth: 3 }
        ];
        leaves.forEach(lf => {
          drawPetiole(api, lf.node[0], lf.node[1], lf.x, lf.y, '#6b4d38', 1.8, lf.depth - 0.5);
          GM.drawGongbiLeaf(api, rng, lf);
        });

        GM.setOccluders([]);

        // Crimson Bud
        for (let b = 0; b < 5; b++) {
          const ang = -Math.PI * 0.5 + (b - 2) * 0.25;
          GM.drawFlowerPetal(api, rng, {
            cx: 315, cy: 372, angle: ang, length: 44 - Math.abs(b - 2) * 4, width: 32,
            notches: 1, tilt: 0.88, baseAlpha: 0.96, depth: 4,
            baseColor: '#d97886', rootColor: P.carmine, midColor: '#b53a4e', tipColor: '#f3d2d8',
            outlineColor: '#5c1f2c', washCount: 16
          });
        }
        GM.drawGongbiLeaf(api, rng, { x: 300, y: 376, angle: -2.1, length: 56, width: 18, bend: -0.22, isBack: true, depth: 4.2 });
        GM.drawGongbiLeaf(api, rng, { x: 330, y: 376, angle: -1.0, length: 54, width: 18, bend: 0.22, isBack: true, depth: 4.2 });

        drawRichBlossom(api, rng, {
          cx: 455, cy: 420, R: 162, tilt: 0.84, notches: 3, depth: 4,
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

        drawRichBlossom(api, rng, {
          cx: 695, cy: 588, R: 124, tilt: 0.82, notches: 3, depth: 4,
          baseColor: '#f7efd6', rootColor: '#b57b28', midColor: '#e7c66c', tipColor: P.clamWhite,
          outlineColor: '#7a5a2c',
          tiers: [
            { count: 9, distFrac: 0.16, lenFrac: 0.82, widFrac: 0.60, rot: 0.25 },
            { count: 8, distFrac: 0.12, lenFrac: 0.64, widFrac: 0.52, rot: 0.62 },
            { count: 6, distFrac: 0.07, lenFrac: 0.44, widFrac: 0.40, rot: 0.12 }
          ],
          stamenColor: '#f7dc7a', filamentColor: '#b85c28', stamenCount: 38
        });

        drawDistinctButterfly(api, rng, { bx: 735, by: 265, scale: 1.06, kind: 'swallowtail', flip: 1 });

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
      subtitle: '仿吴炳《出水芙蓉》设色：波折翻卷大荷叶留水线 → 水藻伴游波 → 锦鲤背实腹虚网鳞',
      group: '国画·工笔',
      category: '工笔花鸟',
      seal: '工笔重彩',
      mode: 'gongbi',
      width: 960,
      height: 1180,
      seed: 1002,
      swatches: ['rgb(235, 224, 200)', 'rgb(206, 74, 96)', 'rgb(42, 108, 72)', 'rgb(212, 68, 36)', 'rgb(232, 188, 74)'],
      desc: '熟宣工笔师法宋人《出水芙蓉》与《鱼藻图》，伞形青荷边沿波折卷起露背，花叶水线明澈；双锦鲤伴清流荇藻游曳，红斑自然渗晕且网鳞背实腹虚。',
      layers: GONGBI_LAYERS,
      analysis: {
        original: '南宋吴炳《出水芙蓉图》与宋代《鱼藻图》工笔技法',
        movement: '宋元花鸟鱼藻工笔重彩',
        palette: '青灰池水晕 · 胭脂曙红 · 头绿三绿 · 朱砂泥金 · 蛤粉',
        technique: '波浪荷叶卷边 · 荇藻水草穿插 · 锦鲤背实腹虚透视网鳞 · 露珠三点提白',
        algorithm: '为荷花及荷叶设前后遮挡深度掩膜；荷叶底翻卷边缘紧随波折曲线，鲤鱼花斑引入噪音扰动边际并按背脊到腹部透视渐淡化网鳞。'
      },
      buildStrokes(api) {
        ensureGM();
        const rng = GM.makeRng(1002);
        const W = 960, H = 1180;

        GM.silkHaloGround(api, 2, W, H, rng, {
          count: 420, focusX: 520, focusY: 420, focusR: 340,
          haloLight: true, warmColor: P.silkTea, coolColor: P.celadonMist
        });

        // Subtle curved water ripples + flowing underwater hydrilla / eelgrass wisps (水草荇藻!)
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
            width: 0.72, color: '#6b7e6f', alpha: 0.34, style: 'yousi', chunkSize: 8, depth: 0
          });
        }

        // Swaying translucent pondweed wisps tucked naturally behind carps (水草穿插)
        [
          [[155, 1135], [142, 1020], [168, 905], [150, 795]],
          [[180, 1135], [192, 1035], [218, 935], [202, 835]],
          [[792, 1135], [778, 1025], [808, 915], [790, 815]],
          [[822, 1135], [835, 1035], [812, 935], [832, 845]]
        ].forEach(wp => {
          const sm = GM.catmullRom(wp, 8, false);
          GM.baimiaoStroke(api, 1, '池底水草细丝', sm, { raw: true, width: 1.0, color: '#586b4a', alpha: 0.45, depth: 0.5 });
          for (let k = 2; k < sm.length - 1; k += 2) {
            const side = k % 4 === 0 ? 1 : -1;
            GM.drawGongbiLeaf(api, rng, {
              x: sm[k][0], y: sm[k][1], angle: -Math.PI * 0.5 + side * 0.52,
              length: 28 + rng() * 14, width: 7, isBack: true, depth: 0.5
            });
          }
        });

        for (let d = 0; d < 22; d++) {
          const dx = 160 + rng() * 640;
          const dy = 720 + rng() * 340;
          if ((dx > 175 && dx < 515 && Math.abs(dy - 878) < 62) || (dx > 480 && dx < 805 && Math.abs(dy - 972) < 55)) continue;
          const dr = 5 + rng() * 6;
          const ang = rng() * GM.TAU;
          const col = GM.rgbaStr(rng() > 0.4 ? P.sapGreen : P.malachitePale, 0.65);
          GM.pushRaw(api, 3, '浮萍碧点', (c) => {
            c.save(); c.fillStyle = col; c.strokeStyle = 'rgba(38,54,34,0.6)'; c.lineWidth = 0.6;
            c.beginPath(); c.ellipse(dx, dy, dr * 1.15, dr * 0.88, ang, 0, GM.TAU); c.fill(); c.stroke(); c.restore();
          }, 'baseWash', 1);
        }

        // Occlude lotus stems behind giant pad & main bloom so stems sit strictly underneath!
        GM.setOccluders([
          { x: 375, y: 568, r: 95 },
          { x: 545, y: 295, r: 82 },
          { x: 718, y: 472, r: 52 }
        ]);
        const stemPaths = [
          [[545, 326], [538, 610], [525, 1080]],
          [[360, 326], [372, 650], [392, 1075]],
          [[718, 498], [690, 780], [665, 1065]]
        ];
        stemPaths.forEach((sp, si) => {
          const curve = GM.catmullRom(sp, 12, false);
          GM.baimiaoStroke(api, 1, '荷梗双勾', curve, { raw: true, width: si === 0 ? 3.2 : 2.3, color: P.oliveDark, alpha: 0.78, depth: 1 });
          for (let k = 4; k < curve.length - 4; k += 4) {
            const p = curve[k];
            if (GM.isPointOccluded(p[0], p[1])) continue;
            const sgn = k % 8 === 0 ? 1 : -1;
            GM.pushRaw(api, 4, '荷梗小刺', (c) => {
              c.save(); c.fillStyle = 'rgba(42,36,24,0.72)';
              c.beginPath(); c.arc(p[0] + sgn * 3.5, p[1], 1.15, 0, GM.TAU); c.fill(); c.restore();
            }, 'vein', 1);
          }
        });
        GM.setOccluders([]);

        // Giant Umbrella Lotus Pad (375, 568) with organic undulating bottom lip fold (ZERO straight chord cut!)
        const padX = 375, padY = 568;
        const padPoly = [];
        const nRim = 54;
        for (let i = 0; i < nRim; i++) {
          const a = (i / nRim) * GM.TAU;
          const wave = 1 + 0.052 * Math.sin(a * 9 + 0.6) + 0.028 * Math.cos(a * 5);
          const rx = 248 * wave, ry = 104 * wave;
          padPoly.push([padX + Math.cos(a) * rx, padY + Math.sin(a) * ry]);
        }
        GM.baimiaoStroke(api, 1, '大荷叶波折边双勾', padPoly, { closed: true, raw: true, width: 1.25, color: P.inkDeep, alpha: 0.85, style: 'tiexian', chunkSize: 12, depth: 3 });
        GM.baseShadePoly(api, 2, '荷叶头绿三绿统染', padPoly, {
          baseColor: P.malachiteMid, baseAlpha: 0.96,
          shadeColor: P.malachiteDeep, shadeAlpha: 0.56,
          gradFrom: [padX, padY - 30], gradTo: [padX + 180, padY + 90], depth: 3
        });

        const navel = [362, 558];
        for (let s = 0; s < 16; s++) {
          const a = (s / 16) * GM.TAU + 0.12;
          const wave = 1 + 0.052 * Math.sin(a * 9 + 0.6) + 0.028 * Math.cos(a * 5);
          const ex = padX + Math.cos(a) * 238 * wave;
          const ey = padY + Math.sin(a) * 98 * wave;
          const mid = [GM.lerp(navel[0], ex, 0.55) + Math.cos(a + 0.3) * 10, GM.lerp(navel[1], ey, 0.55) + Math.sin(a + 0.3) * 6];
          const spoke = [navel, mid, [ex, ey]];
          GM.baimiaoStroke(api, 4, '荷叶放射水线', spoke, { width: 1.4, color: '#b4cf94', alpha: 0.78, chunkSize: 6, depth: 3 });
          GM.baimiaoStroke(api, 4, '荷脉细筋复勒', spoke, { width: 0.52, color: P.oliveDark, alpha: 0.45, chunkSize: 6, depth: 3 });
        }
        GM.fenranRegion(api, 3, '荷叶深绿花青分染', padPoly, rng, {
          count: 140, colorFrom: P.malachiteDeep, colorTo: '#8fc092',
          gradFrom: [padX - 40, padY - 20], gradTo: [padX + 210, padY + 95],
          alphaMin: 0.035, alphaMax: 0.13, dabScale: 1.25, depth: 3
        });

        // Curved scalloped bottom underside fold (matches wavy rim on bottom AND gracefully arches inner top fold!)
        const botArc = padPoly.slice(5, 22);
        const innerFoldArc = [];
        for (let k = botArc.length - 1; k >= 0; k--) {
          const p = botArc[k];
          const f = k / (botArc.length - 1);
          const lift = Math.sin(f * Math.PI) * 32 + Math.sin(f * Math.PI * 3) * 5;
          innerFoldArc.push([p[0], p[1] - lift]);
        }
        const foldPts = botArc.concat(innerFoldArc);
        GM.baimiaoStroke(api, 1, '荷叶卷边双勾', foldPts, { closed: true, raw: true, width: 1.0, color: P.inkMid, depth: 3.2 });
        GM.baseShadePoly(api, 3, '荷叶反面三绿粉染', foldPts, { baseColor: '#a6c496', baseAlpha: 0.94, shadeColor: '#698e62', shadeAlpha: 0.38, depth: 3.2 });
        GM.pushRaw(api, 4, '荷脐圈点', (c) => {
          c.save(); c.fillStyle = GM.rgbaStr('#c6c78c', 0.85);
          c.beginPath(); c.ellipse(navel[0], navel[1], 11, 5.5, -0.08, 0, GM.TAU); c.fill(); c.restore();
        }, 'vein', 3.4);

        // Rolled Trumpet Young Lotus Leaf (深杯卷荷)
        const cupBack = GM.catmullRom([[644, 466], [672, 412], [755, 418], [798, 470], [748, 502], [678, 500]], 5, true);
        const cupFront = GM.catmullRom([[644, 466], [718, 496], [798, 470], [752, 522], [685, 518]], 5, true);
        GM.baimiaoStroke(api, 1, '卷荷外廓', cupBack, { closed: true, raw: true, width: 1.0, color: P.inkDeep, depth: 3 });
        GM.baimiaoStroke(api, 1, '卷荷翻卷边', cupFront, { closed: true, raw: true, width: 0.95, color: P.inkMid, depth: 3.2 });
        GM.baseShadePoly(api, 2, '卷荷浓绿内面', cupBack, { baseColor: P.malachiteMid, baseAlpha: 0.95, shadeColor: P.malachiteDeep, shadeAlpha: 0.56, depth: 3 });
        GM.baseShadePoly(api, 3, '卷荷嫩背', cupFront, { baseColor: '#a9c796', baseAlpha: 0.96, shadeColor: '#688c5c', shadeAlpha: 0.42, depth: 3.2 });
        GM.fenranRegion(api, 3, '卷荷分染', cupBack, rng, { count: 38, colorFrom: P.malachiteDeep, colorTo: '#94c094', alphaMin: 0.04, alphaMax: 0.14, depth: 3 });
        GM.striationLines(api, 4, '卷荷放射水线', [718, 486], [[662, 452], [688, 428], [722, 424], [758, 432], [784, 462]], {
          color: '#b4cf94', alpha: 0.72, width: 1.05, batch: 2, depth: 3.3
        });

        [[295, 558, 6.0], [312, 578, 3.8], [445, 548, 5.2], [488, 592, 4.0], [235, 588, 3.4]].forEach(([dx, dy, dr]) => GM.drawDewdrop(api, 5, dx, dy, dr));

        for (let i = -1; i <= 1; i++) {
          GM.drawFlowerPetal(api, rng, {
            cx: 360 + i * 6, cy: 326, angle: -Math.PI * 0.5 + i * 0.2,
            length: 76 - Math.abs(i) * 5, width: 38, notches: 0, tilt: 0.96, baseAlpha: 0.96, depth: 4,
            baseColor: '#f8f0e8', rootColor: '#e8d7bd', midColor: '#f4d2d8', tipColor: '#b82542',
            outlineColor: '#692a38', washCount: 22, tipHighlight: true
          });
        }
        GM.drawGongbiLeaf(api, rng, { x: 355, y: 328, angle: -2.25, length: 24, width: 10, isBack: true, depth: 4.2 });
        GM.drawGongbiLeaf(api, rng, { x: 365, y: 328, angle: -0.9, length: 24, width: 10, isBack: true, depth: 4.2 });

        const lx = 545, ly = 295;
        for (let s = -2; s <= 2; s++) {
          GM.drawFlowerPetal(api, rng, {
            cx: lx + s * 6, cy: ly + 22, angle: Math.PI * 0.5 + s * 0.32,
            length: 26, width: 18, notches: 0, tilt: 0.74, baseAlpha: 0.96, depth: 3.8,
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
              notches: 0, tilt: 0.72, baseAlpha: 0.96, depth: 4 + ring * 0.2,
              baseColor: P.clamWhite, rootColor: '#e5d4b8', midColor: '#f6e7e6', tipColor: '#c42e4e',
              outlineColor: '#753944', tipHighlight: true, washCount: 30
            });
          }
        }
        const pod = GM.catmullRom([[lx - 26, ly - 18], [lx, ly - 28], [lx + 26, ly - 18], [lx + 18, ly + 8], [lx - 18, ly + 8]], 5, true);
        GM.baimiaoStroke(api, 1, '莲蓬勾勒', pod, { closed: true, raw: true, width: 0.95, color: P.oliveDark, depth: 4.5 });
        GM.baseShadePoly(api, 3, '莲蓬汁绿粉染', pod, { baseColor: '#9eb66d', baseAlpha: 0.96, shadeColor: '#546b38', shadeAlpha: 0.5, depth: 4.5 });
        GM.lifenStamens(api, 5, lx, ly - 12, rng, {
          count: 42, rInner: 26, rOuter: 50, tilt: 0.45,
          filamentColor: '#b55638', pollenColor: P.gooseYellow, dotSize: 2.0
        });

        GM.drawKoiCarp(api, rng, {
          spinePts: [[485, 835], [412, 855], [335, 895], [260, 912], [195, 902]],
          widthProfile: (u) => 46 * Math.sin(Math.pow(u, 0.55) * Math.PI * 0.92 + 0.12) * (1 - u * 0.42),
          baseColor: P.clamWhite, scaleRimColor: '#94624c', goldTrim: true,
          patrolSpots: [
            { u: 0.12, sideOffset: 0, rx: 34, ry: 26, color: P.cinnabar },
            { u: 0.44, sideOffset: -0.18, rx: 56, ry: 32, color: P.vermilion },
            { u: 0.74, sideOffset: 0.14, rx: 34, ry: 22, color: P.cinnabar }
          ]
        });
        GM.drawKoiCarp(api, rng, {
          spinePts: [[495, 985], [565, 962], [645, 955], [715, 978], [785, 995]],
          widthProfile: (u) => 38 * Math.sin(Math.pow(u, 0.55) * Math.PI * 0.92 + 0.12) * (1 - u * 0.42),
          baseColor: '#f5d282', scaleRimColor: '#7a522c', goldTrim: true,
          patrolSpots: [
            { u: 0.25, sideOffset: 0.12, rx: 40, ry: 24, color: P.ochre },
            { u: 0.62, sideOffset: -0.1, rx: 32, ry: 20, color: P.inkDeep }
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
      subtitle: '北宋徽宗《瑞鹤》法度：松针前后掩映穿枝 → 清瘦流线双鹤 → 分层墨翼胫关节立爪',
      group: '国画·工笔',
      category: '工笔花鸟',
      seal: '工笔翎毛',
      mode: 'gongbi',
      width: 960,
      height: 1200,
      seed: 1003,
      swatches: ['rgb(235, 224, 200)', 'rgb(250, 248, 242)', 'rgb(198, 42, 34)', 'rgb(34, 82, 54)', 'rgb(28, 24, 20)'],
      desc: '苍松虬曲与重重翠针前后掩映穿插；双鹤取清瘦修长S型优雅身姿，细画黑墨三级叠羽及胫跗关节鳞爪，立足方硬折带青苔石坡，上伴勾云瑞岚。',
      layers: GONGBI_LAYERS,
      analysis: {
        original: '北宋徽宗赵佶《瑞鹤图》与南宋院体松鹤长卷',
        movement: '北宋宣和画院工笔翎毛',
        palette: '古绢包浆底 · 蛤粉托白 · 松烟重墨 · 朱砂丹顶 · 石绿花青',
        technique: '松针掩映穿枝 · 仙鹤修长清瘦比例 · 胫关节与鳞爪 · 批丝簇白羽',
        algorithm: '重整松针前后深度栈使其自然掩映松干；重构仙鹤修长流线胸背曲线与层叠黑白三级飞羽，补全鹤膝微膨关节与三趾抓石。'
      },
      buildStrokes(api) {
        ensureGM();
        const rng = GM.makeRng(1003);
        const W = 960, H = 1200;

        GM.silkHaloGround(api, 2, W, H, rng, {
          count: 460, focusX: 500, focusY: 640, focusR: 320,
          haloLight: true, haloIntensity: 1.15, warmColor: P.silkAmber, coolColor: '#6f7e72'
        });

        GM.drawAuspiciousCloud(api, rng, { cx: 310, cy: 420, width: 290, height: 42, curls: 4, depth: 0.5 });
        GM.drawAuspiciousCloud(api, rng, { cx: 655, cy: 495, width: 250, height: 38, curls: 3, depth: 0.5 });

        // Chiseled angular cliff bank below cranes (NOT a soft bread loaf!)
        GM.drawTaihuRock(api, rng, {
          outerPts: [[68, 1182], [95, 1085], [185, 1042], [295, 1028], [415, 1068], [595, 1072], [755, 1032], [848, 1058], [898, 1182]],
          holes: [], mossCount: 68, depth: 1
        });

        // Pine needle back-clusters behind trunk (depth=0.8), trunk (depth=1.5), and front overlapping needles (depth=2.5)!
        const backTwigs = [
          [115, 232, 48], [195, 198, 52], [272, 178, 54], [358, 172, 50],
          [442, 188, 48], [528, 222, 48], [608, 212, 46], [685, 224, 42]
        ];
        backTwigs.forEach(([px, py, rad], idx) => {
          drawPineCluster(api, rng, px, py, -Math.PI * 0.5 + (rng() - 0.5) * 0.25, rad, 38, '#1a3f2b', '#2d5c40', 0.8 + idx * 0.01);
        });

        const pineTrunkSpine = drawWoodyBranch(api, rng, [[-10, 310], [185, 265], [345, 245], [510, 285], [675, 248]], [56, 12], {
          label: '苍松主干铁线', gnarl: 3.0, washCount: 115, fissures: 22, depth: 1.5
        });
        // Traditional Song Pine Scale Bark Plates aligned strictly along actual trunk spine (松鳞圈点!)
        for (let sc = 0; sc < 26; sc++) {
          const idx = Math.min(pineTrunkSpine.length - 1, Math.floor((0.04 + (sc / 26) * 0.88) * pineTrunkSpine.length));
          const sp = pineTrunkSpine[idx];
          const tTrunk = idx / Math.max(1, pineTrunkSpine.length - 1);
          const halfThick = GM.lerp(24, 5, Math.pow(tTrunk, 0.85));
          const sx = sp[0] + (rng() - 0.5) * 8;
          const sy = sp[1] + (rng() - 0.5) * halfThick * 0.85;
          const rW = GM.lerp(9.5, 3.8, tTrunk) * (0.85 + rng() * 0.3);
          const scalePoly = [];
          for (let k = 0; k < 7; k++) {
            const a = (k / 7) * GM.TAU;
            scalePoly.push([sx + Math.cos(a) * rW, sy + Math.sin(a) * rW * 0.56]);
          }
          GM.baimiaoStroke(api, 4, '松干鳞甲圈勾', scalePoly, {
            closed: true, raw: true, width: 0.82, color: '#2b2016', alpha: 0.55, depth: 1.55
          });
        }
        drawWoodyBranch(api, rng, [[165, 275], [275, 200], [425, 180]], [24, 7], {
          label: '松上分枝', gnarl: 1.5, washCount: 44, fissures: 8, depth: 1.5
        });
        drawWoodyBranch(api, rng, [[365, 255], [475, 345], [595, 330]], [20, 7], {
          label: '松下俯枝', gnarl: 1.2, washCount: 38, fissures: 6, depth: 1.5
        });

        const frontTwigs = [
          [[135, 270], [122, 238]], [[215, 238], [202, 205]], [[280, 200], [270, 172]],
          [[350, 188], [358, 165]], [[415, 182], [442, 172]], [[315, 252], [322, 225]],
          [[435, 265], [452, 232]], [[510, 282], [538, 248]], [[585, 266], [608, 234]],
          [[645, 254], [685, 240]], [[675, 248], [728, 255]], [[455, 325], [488, 345]],
          [[555, 335], [592, 345]], [[395, 285], [385, 312]], [[235, 260], [238, 228]]
        ];
        frontTwigs.forEach(([p0, p1], idx) => {
          GM.baimiaoStroke(api, 1, '松枝小杈', [p0, p1], { width: 3.0, color: '#473424', alpha: 0.88, depth: 2.0 });
          drawPineCluster(api, rng, p1[0], p1[1], -Math.PI * 0.5 + (rng() - 0.5) * 0.28, 44 + (idx % 3) * 6, 36, P.malachiteDeep, '#1c4430', 2.5);
          drawPineCluster(api, rng, p1[0] + (rng() - 0.5) * 14, p1[1] - 4, -Math.PI * 0.5 + (rng() - 0.5) * 0.36, 34, 24, '#367554', '#5c966e', 2.6);
        });

        // Graceful Slim Anatomical Red-Crowned Crane Builder (with articulated knee joints & layered coverts!)
        function paintCrane(cx, cy, flip = 1, preening = false, depthBase = 3) {
          const X = (dx) => cx + dx * flip;
          // Articulated legs with ankle/knee tibiotarsal joint bump!
          if (!preening) {
            const standKnee = [X(14), cy + 165];
            const standFoot = [X(18), cy + 375];
            GM.baimiaoStroke(api, 1, '鹤腿上段', [[X(12), cy + 62], standKnee], { width: 6.0, color: '#2b2824', depth: depthBase });
            GM.baimiaoStroke(api, 1, '鹤腿下胫', [standKnee, standFoot], { width: 4.5, color: '#2b2824', depth: depthBase });
            // Knee joint swell + subtle leg scale notches
            GM.pushRaw(api, 4, '鹤膝关节', (c) => {
              c.save(); c.fillStyle = '#2b2824';
              c.beginPath(); c.ellipse(standKnee[0], standKnee[1], 4.8, 6.2, 0, 0, GM.TAU); c.fill();
              c.restore();
            }, 'vein', depthBase);
            // Bent raised leg
            GM.baimiaoStroke(api, 1, '鹤弯举左足', [[X(-12), cy + 58], [X(-48), cy + 155], [X(2), cy + 208]], { width: 4.6, color: '#33302b', depth: depthBase });
            // Grasping 3-toe claws + rear hind hallux
            [[X(-18), cy + 379], [X(42), cy + 382], [X(30), cy + 366], [X(4), cy + 368]].forEach(toe => {
              GM.baimiaoStroke(api, 4, '鹤爪指节', [standFoot, toe], { width: 2.1, color: P.inkDeep, style: 'dingtou', depth: depthBase });
            });
          } else {
            const k1 = [X(-16), cy + 128], f1 = [X(-18), cy + 236];
            const k2 = [X(20), cy + 125], f2 = [X(24), cy + 238];
            GM.baimiaoStroke(api, 1, '伴鹤右足', [[X(-14), cy + 44], k1, f1], { width: 4.4, color: '#2b2824', depth: depthBase });
            GM.baimiaoStroke(api, 1, '伴鹤左足', [[X(16), cy + 42], k2, f2], { width: 4.4, color: '#2b2824', depth: depthBase });
            [k1, k2].forEach(kn => GM.pushRaw(api, 4, '鹤膝关节', (c) => {
              c.save(); c.fillStyle = '#2b2824'; c.beginPath(); c.ellipse(kn[0], kn[1], 4.0, 5.2, 0, 0, GM.TAU); c.fill(); c.restore();
            }, 'vein', depthBase));
            [[f1, [X(-42), cy + 240], [X(4), cy + 240]], [f2, [X(2), cy + 242], [X(46), cy + 242]]].forEach(([rt, tA, tB]) => {
              GM.baimiaoStroke(api, 4, '伴鹤爪', [rt, tA], { width: 1.9, color: P.inkDeep, depth: depthBase });
              GM.baimiaoStroke(api, 4, '伴鹤爪', [rt, tB], { width: 1.9, color: P.inkDeep, depth: depthBase });
            });
          }

          const neckCurve = preening
            ? [[X(-48), cy + 12], [X(-92), cy - 42], [X(-58), cy - 92], [X(-14), cy - 82]]
            : [[X(-48), cy + 12], [X(-114), cy - 72], [X(-106), cy - 168], [X(-75), cy - 222]];
          const headPt = neckCurve[neckCurve.length - 1];
          const hx = headPt[0], hy = headPt[1];

          const neckSm = GM.catmullRom(neckCurve, 10, false);
          const nL = [], nR = [];
          for (let i = 0; i < neckSm.length; i++) {
            const u = i / Math.max(1, neckSm.length - 1);
            const prev = neckSm[Math.max(0, i - 1)], next = neckSm[Math.min(neckSm.length - 1, i + 1)];
            const tx = next[0] - prev[0], ty = next[1] - prev[1];
            const d = Math.hypot(tx, ty) || 1;
            const nx = -ty / d, ny = tx / d;
            const hw = GM.lerp(20, 12, u);
            nL.push([neckSm[i][0] + nx * hw, neckSm[i][1] + ny * hw]);
            nR.unshift([neckSm[i][0] - nx * hw, neckSm[i][1] - ny * hw]);
          }
          const neckPoly = nL.concat(nR);

          // Elongated Slim Swan-like Crane Body (proud forward breast tapering sharply back to rump — NOT round duck egg!)
          const torso = GM.catmullRom([
            [X(-78), cy + 4], [X(-44), cy - 38], [X(28), cy - 34], [X(118), cy + 8],
            [X(148), cy + 44], [X(92), cy + 68], [X(-10), cy + 70], [X(-78), cy + 42]
          ], 8, true);

          GM.baimiaoStroke(api, 1, '仙鹤S颈双勾', neckPoly, { closed: true, raw: true, width: 1.0, color: P.inkDeep, depth: depthBase + 0.1 });
          GM.baseShadePoly(api, 2, '鹤颈乌墨与三白分染', neckPoly, {
            baseColor: '#25211e', baseAlpha: 0.94, shadeColor: P.clamWhite, shadeAlpha: 0.62,
            gradFrom: neckSm[Math.floor(neckSm.length * 0.4)], gradTo: neckSm[neckSm.length - 1], depth: depthBase + 0.1
          });
          GM.simaoTract(api, 4, '鹤颈黑羽丝毛', neckPoly, rng, {
            count: preening ? 160 : 220, angle: -1.35, spread: 0.24,
            lenMin: 6, lenMax: 13, color: '#1b1815', colorAlt: '#544e47', width: 0.56, depth: depthBase + 0.1
          });

          GM.baimiaoStroke(api, 1, '仙鹤清瘦身羽', torso, { closed: true, raw: true, width: 1.1, color: P.inkPale, alpha: 0.72, style: 'yousi', depth: depthBase + 0.3 });
          GM.baseShadePoly(api, 3, '仙鹤蛤粉平涂', torso, {
            baseColor: P.clamWhite, baseAlpha: 0.97,
            shadeColor: '#d9ceb8', shadeAlpha: 0.38,
            gradFrom: [cx, cy + 68], gradTo: [cx, cy - 35], depth: depthBase + 0.3
          });
          GM.fenranRegion(api, 3, '白羽阴面淡赭染', torso, rng, {
            count: 68, colorFrom: '#cfc1a9', colorTo: P.clamWhite,
            gradFrom: [cx, cy + 68], gradTo: [cx, cy - 25], bias: 'from', alphaMin: 0.035, alphaMax: 0.1, depth: depthBase + 0.3
          });
          GM.simaoTract(api, 4, '鹤身雪白批丝', torso, rng, {
            count: preening ? 440 : 640,
            angle: flip > 0 ? 0.2 : Math.PI - 0.2, spread: 0.14,
            lenMin: 12, lenMax: 24,
            color: P.clamWhite, colorAlt: '#cfc3ab', alpha: 0.78, width: 0.65, depth: depthBase + 0.35
          });

          // Layered Cascading Black Tertial Wing Plumes cleanly behind White Wing Coverts (NO grid crosshatch!)
          for (let f = 0; f < 9; f++) {
            GM.drawFeatherPlume(api, rng, {
              x0: X(62 + f * 5.8), y0: cy + 8 + f * 3.0,
              x1: X(118 + f * 4.2), y1: cy + 56 + f * 3.8,
              width: 14.5, bend: 0.14 * flip, baseAlpha: 0.98, depth: depthBase + 0.4 + f * 0.02,
              baseColor: '#24211e', tipColor: '#12100e', barbColor: '#1a1714',
              shaftColor: '#524b44', outlineColor: '#24201c', barbCount: 7
            });
          }
          // Upper white wing coverts overlapping cleanly over the black feather roots!
          drawWingCoverts(api, rng, X(18), cy - 4, 2, 4, flip > 0 ? 0.28 : Math.PI - 0.28, P.clamWhite, '#dcd2bc', null, depthBase + 0.7);

          const headPoly = GM.catmullRom([
            [hx - 14 * flip, hy + 8], [hx - 16 * flip, hy - 14], [hx + 12 * flip, hy - 16], [hx + 18 * flip, hy + 2], [hx + 6 * flip, hy + 12]
          ], 5, true);
          GM.baseShadePoly(api, 3, '鹤首三白涂染', headPoly, { baseColor: P.clamWhite, baseAlpha: 0.97, depth: depthBase + 0.5 });
          const beakPoly = GM.catmullRom([
            [hx + 14 * flip, hy - 5], [hx + 98 * flip, hy - 12], [hx + 15 * flip, hy + 5]
          ], 4, true);
          GM.baimiaoStroke(api, 1, '鹤长喙勾勒', beakPoly, { closed: true, raw: true, width: 1.0, color: '#45391e', depth: depthBase + 0.5 });
          GM.baseShadePoly(api, 3, '鹤喙赭黄设色', beakPoly, { baseColor: '#9e8f5c', baseAlpha: 0.95, shadeColor: '#4f4528', shadeAlpha: 0.55, depth: depthBase + 0.5 });

          for (let r = 0; r < 24; r++) {
            const rx = hx + (rng() - 0.5) * 18, ry = hy - 13 + (rng() - 0.5) * 8;
            const cr = 2.0 + rng() * 2.1;
            const cCol = GM.rgbaStr(rng() > 0.3 ? P.cinnabar : P.vermilion, 0.9);
            GM.pushRaw(api, 5, '立粉点丹顶', (c) => {
              c.save(); c.fillStyle = cCol; c.beginPath(); c.arc(rx, ry, cr, 0, GM.TAU); c.fill(); c.restore();
            }, 'lifen', depthBase + 0.8);
          }
          GM.pushRaw(api, 5, '仙鹤点睛', (c) => {
            c.save();
            c.fillStyle = '#d9b54a'; c.beginPath(); c.arc(hx + 7 * flip, hy - 2, 4.0, 0, GM.TAU); c.fill();
            c.fillStyle = '#0e0c0a'; c.beginPath(); c.arc(hx + 7 * flip, hy - 2, 2.5, 0, GM.TAU); c.fill();
            c.fillStyle = '#fff'; c.beginPath(); c.arc(hx + 6.2 * flip, hy - 2.8, 0.9, 0, GM.TAU); c.fill();
            c.restore();
          }, 'eye', depthBase + 0.9);
        }

        paintCrane(455, 675, 1, false, 3);
        paintCrane(685, 795, -1, true, 4);

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
      subtitle: '马麟《层叠冰绡》与崔白花鸟法度：老梅新杈全出枝 → 喜鹊白腹批丝顺毛 → 宽尾叠羽',
      group: '国画·工笔',
      category: '工笔花鸟',
      seal: '宋人花鸟',
      mode: 'gongbi',
      width: 960,
      height: 1180,
      seed: 1004,
      swatches: ['rgb(235, 224, 200)', 'rgb(28, 34, 48)', 'rgb(252, 248, 240)', 'rgb(198, 52, 72)', 'rgb(230, 188, 86)'],
      desc: '老梅铁干苍劲并清晰生出左下及右上花枝；冰绡白梅与绯梅连枝开落，立粉金蕊点提；上枝立一修长喜鹊，胸腹以有序锥尖批丝排毛，长尾叠成石青宽扇羽。',
      layers: GONGBI_LAYERS,
      analysis: {
        original: '南宋马麟《层叠冰绡图》与北宋崔白《双喜图》',
        movement: '两宋折枝工笔花鸟',
        palette: '古绢茶晕 · 蛤粉冰绡 · 曙红梅蕾 · 石青墨羽 · 藤黄立粉',
        technique: '批丝簇顺毛 · 楔形宽尾叠羽 · 倒晕烘托冰绡梅瓣 · 全出枝穿插',
        algorithm: '重构左下梅枝使之自老干自然分叉，喜鹊腹羽改用分格锥尖批丝簇消除凌乱短线，并将窄针尾羽扩宽成层叠石青扇尾。'
      },
      buildStrokes(api) {
        ensureGM();
        const rng = GM.makeRng(1004);
        const W = 960, H = 1180;

        GM.silkHaloGround(api, 2, W, H, rng, {
          count: 420, focusX: 520, focusY: 500, focusR: 350,
          haloLight: true, haloIntensity: 1.15, warmColor: P.silkTea, coolColor: '#76827c'
        });

        const blossoms = [
          { node: [275, 265], x: 278, y: 275, radius: 44, angle: 0.3, view: 'front', blush: false, depth: 3.5 },
          { node: [292, 355], x: 318, y: 345, radius: 38, angle: -0.4, view: 'side', blush: true, depth: 3.5 },
          { node: [295, 395], x: 262, y: 398, radius: 46, angle: 1.1, view: 'front', blush: false, depth: 3.6 },
          { node: [315, 455], x: 358, y: 445, radius: 42, angle: 0.2, view: 'front', blush: true, depth: 3.5 },
          { node: [318, 495], x: 298, y: 495, radius: 20, angle: 0.4, view: 'bud', blush: true, depth: 3.4 },
          { node: [338, 535], x: 376, y: 525, radius: 36, angle: 2.1, view: 'side', blush: false, depth: 3.5 },
          { node: [280, 325], x: 245, y: 325, radius: 19, angle: -0.2, view: 'bud', blush: false, depth: 3.4 },
          { node: [288, 250], x: 330, y: 215, radius: 19, angle: 0.2, view: 'bud', blush: true, depth: 3.4 },
          { node: [650, 415], x: 642, y: 395, radius: 44, angle: 0.8, view: 'front', blush: false, depth: 3.5 },
          { node: [665, 335], x: 678, y: 318, radius: 38, angle: -0.3, view: 'side', blush: true, depth: 3.5 },
          { node: [668, 305], x: 635, y: 284, radius: 20, angle: 0.1, view: 'bud', blush: true, depth: 3.4 },
          { node: [695, 515], x: 718, y: 468, radius: 44, angle: 1.4, view: 'front', blush: false, depth: 3.6 },
          { node: [755, 488], x: 778, y: 482, radius: 38, angle: 0.5, view: 'side', blush: true, depth: 3.5 },
          { node: [805, 448], x: 820, y: 415, radius: 34, angle: 1.2, view: 'front', blush: false, depth: 3.5 },
          { node: [825, 435], x: 855, y: 448, radius: 19, angle: 0.3, view: 'bud', blush: true, depth: 3.4 },
          { node: [462, 858], x: 462, y: 842, radius: 44, angle: 0.4, view: 'front', blush: false, depth: 3.5 },
          { node: [525, 860], x: 525, y: 868, radius: 40, angle: 1.1, view: 'side', blush: true, depth: 3.5 },
          { node: [585, 850], x: 585, y: 838, radius: 38, angle: 2.2, view: 'front', blush: false, depth: 3.5 },
          { node: [635, 845], x: 632, y: 865, radius: 20, angle: 0.3, view: 'bud', blush: true, depth: 3.4 },
          { node: [382, 862], x: 382, y: 882, radius: 19, angle: 0.1, view: 'bud', blush: true, depth: 3.4 },
          { node: [222, 842], x: 215, y: 795, radius: 38, angle: 0.9, view: 'front', blush: true, depth: 3.5 },
          { node: [248, 788], x: 265, y: 765, radius: 18, angle: 0.4, view: 'bud', blush: false, depth: 3.4 }
        ];

        GM.setOccluders([
          ...blossoms.filter(b => b.view !== 'bud').map(b => ({ x: b.x, y: b.y, r: b.radius * 0.92 })),
          { x: 525, y: 562, r: 64 }
        ]);
        drawWoodyBranch(api, rng, [[85, 1020], [260, 865], [440, 710], [635, 575], [825, 435]], [40, 10], {
          label: '老梅苍干铁线', gnarl: 2.5, washCount: 90, fissures: 18, depth: 1, clipOccluders: true
        });
        drawWoodyBranch(api, rng, [[410, 735], [345, 585], [305, 425], [275, 255]], [18, 5], {
          label: '梅花挺出直枝', gnarl: 1.0, washCount: 44, fissures: 8, depth: 1, clipOccluders: true
        });
        drawWoodyBranch(api, rng, [[605, 595], [645, 425], [675, 275]], [13, 4], {
          label: '右上梅梢', gnarl: 0.7, washCount: 28, fissures: 4, depth: 1, clipOccluders: true
        });
        drawWoodyBranch(api, rng, [[275, 855], [465, 865], [640, 845]], [14, 5], {
          label: '右下梅枝', gnarl: 0.9, washCount: 34, fissures: 6, depth: 1, clipOccluders: true
        });
        // Explicit lower-left forked branch connecting leftmost plum blossoms cleanly to main trunk!
        drawWoodyBranch(api, rng, [[215, 898], [225, 835], [256, 772]], [11, 4], {
          label: '左下叉梅梢', gnarl: 0.5, washCount: 22, fissures: 3, depth: 1, clipOccluders: true
        });
        GM.setOccluders([]);

        for (let m = 0; m < 36; m++) {
          const t = 0.08 + rng() * 0.72;
          const mx = GM.lerp(110, 760, t) + (rng() - 0.5) * 12;
          const my = GM.lerp(1000, 480, t) + (rng() - 0.5) * 12;
          if (Math.hypot(mx - 525, my - 562) < 68) continue;
          const col = GM.rgbaStr(rng() > 0.35 ? P.malachiteDeep : P.oliveDark, 0.58);
          GM.pushRaw(api, 5, '老梅点苔', (c) => {
            c.save(); c.fillStyle = col;
            c.beginPath(); c.ellipse(mx, my, 2.1 + rng() * 1.8, 1.4 + rng() * 1.2, rng(), 0, GM.TAU); c.fill(); c.restore();
          }, 'moss', 2);
        }

        blossoms.forEach(b => {
          drawPetiole(api, b.node[0], b.node[1], b.x, b.y, '#4d3b2b', 2.0, 2);
          GM.drawPlumBlossom(api, rng, b);
        });

        // Sleek Oriental Magpie with Silky Tapered Breast Plumage & Widened Wedge Tail
        const mx = 525, my = 562;
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

        // Widened stepped wedge tail plumes (overlapping wedge feathers instead of thin spike)
        [
          { dx: 245, dy: 184, w: 14.5 },
          { dx: 222, dy: 162, w: 13.5 },
          { dx: 196, dy: 140, w: 12.5 }
        ].forEach((tf, idx) => {
          GM.drawFeatherPlume(api, rng, {
            x0: mx + 70, y0: my + 6 + idx * 3,
            x1: mx + tf.dx, y1: my + tf.dy,
            width: tf.w, bend: -0.04, baseAlpha: 0.95, depth: 3 + idx * 0.1,
            baseColor: '#1e3c62', tipColor: '#141926',
            shaftColor: '#486a8c', outlineColor: P.inkDeep, barbCount: 24
          });
        });

        GM.baimiaoStroke(api, 1, '喜鹊流线体廓', magBody, { closed: true, raw: true, width: 1.2, color: P.inkDeep, depth: 4 });
        GM.baseShadePoly(api, 2, '喜鹊乌羽打底', magBody, { baseColor: '#1b1e28', baseAlpha: 0.97, shadeColor: '#2a3c56', shadeAlpha: 0.45, depth: 4 });
        GM.baseShadePoly(api, 3, '喜鹊胸腹蛤粉', bellyPatch, { baseColor: P.clamWhite, baseAlpha: 0.98, shadeColor: '#dcd2be', shadeAlpha: 0.35, depth: 4.2 });
        GM.baseShadePoly(api, 3, '喜鹊白肩斑', scapularWhite, { baseColor: P.clamWhite, baseAlpha: 0.98, depth: 4.5 });

        GM.simaoTract(api, 4, '喜鹊首背丝毛', magBody, rng, {
          count: 580, angle: 0.52, spread: 0.14, lenMin: 8, lenMax: 15,
          color: '#171a22', colorAlt: '#3b4e68', alpha: 0.78, width: 0.58, depth: 4.3
        });
        GM.simaoTract(api, 4, '喜鹊胸腹批丝', bellyPatch, rng, {
          count: 340,
          angleFn: (_px, _py, u, v) => 0.72 + (u - 0.5) * 0.2 + v * 0.14,
          spread: 0.08, lenMin: 7, lenMax: 13,
          color: '#e8e0cf', colorAlt: P.clamWhite, alpha: 0.85, width: 0.62, depth: 4.4
        });

        drawWingCoverts(api, rng, mx + 22, my - 16, 3, 4, 0.56, '#214569', '#386f78', '#141c28', 4.6);

        const beak = GM.catmullRom([[mx - 62, my - 46], [mx - 104, my - 50], [mx - 60, my - 34]], 4, true);
        GM.baimiaoStroke(api, 1, '喜鹊喙勾勒', beak, { closed: true, raw: true, width: 1.05, color: P.inkDeep, depth: 4.7 });
        GM.baseShadePoly(api, 2, '喜鹊喙墨染', beak, { baseColor: '#242222', baseAlpha: 0.96, shadeColor: '#6b655e', shadeAlpha: 0.45, depth: 4.7 });
        GM.baimiaoStroke(api, 4, '喜鹊抱枝双足', [[mx - 4, my + 54], [mx + 12, my + 84]], { width: 2.8, color: P.inkDeep, depth: 4.7 });
        GM.baimiaoStroke(api, 4, '喜鹊右足', [[mx + 18, my + 48], [mx + 30, my + 74]], { width: 2.8, color: P.inkDeep, depth: 4.7 });
        GM.baimiaoStroke(api, 4, '鹊爪扣枝', [[mx + 2, my + 84], [mx + 14, my + 82], [mx + 26, my + 88]], { width: 1.8, color: P.inkDeep, depth: 4.7 });

        GM.pushRaw(api, 5, '喜鹊点睛', (c) => {
          c.save();
          c.strokeStyle = 'rgba(245,240,228,0.88)'; c.lineWidth = 1.15;
          c.beginPath(); c.arc(mx - 45, my - 46, 5.0, 0, GM.TAU); c.stroke();
          c.fillStyle = '#0e0c0c'; c.beginPath(); c.arc(mx - 45, my - 46, 3.2, 0, GM.TAU); c.fill();
          c.fillStyle = '#fff'; c.beginPath(); c.arc(mx - 46.2, my - 47.2, 1.1, 0, GM.TAU); c.fill();
          c.restore();
        }, 'eye', 4.9);

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
      subtitle: '仿宋徽宗《芙蓉锦鸡》法度：折带瘦漏石壁 → 扇鳞披肩自然过渡 → 随风柔弯豹斑长尾',
      group: '国画·工笔',
      category: '工笔花鸟',
      seal: '院体工笔',
      mode: 'gongbi',
      width: 960,
      height: 1200,
      seed: 1005,
      swatches: ['rgb(235, 224, 200)', 'rgb(218, 166, 44)', 'rgb(198, 44, 34)', 'rgb(28, 78, 118)', 'rgb(96, 90, 82)'],
      desc: '立折带斧劈皴太湖石于左下，孔洞具立体内壁；红腹锦鸡独立岩顶回首，金黑扇鳞披肩逐层覆于朱腹蓝背之上，长尾随重力优雅弯曲，缀不规则墨赭豹纹斑点。',
      layers: GONGBI_LAYERS,
      analysis: {
        original: '北宋徽宗《芙蓉锦鸡图》与宋院体珍禽花石图',
        movement: '北宋宣和院体工笔花鸟',
        palette: '太湖石青灰赭 · 泥金凤冠 · 正朱砂胸 · 头绿石青背 · 竹石墨青',
        technique: '锦鸡扇形鱼鳞披肩 · 柔弯垂曳长尾与豹点晕斑 · 太湖石立体石孔内壁',
        algorithm: '取消外露直边轮廓线，用四层层叠扇鳞金羽无缝过渡头冠与朱腹；尾羽施加高弯度三次弧线并用天然墨赭椭圆斑替换直栏横杠。'
      },
      buildStrokes(api) {
        ensureGM();
        const rng = GM.makeRng(1005);
        const W = 960, H = 1200;

        GM.silkHaloGround(api, 2, W, H, rng, {
          count: 420, focusX: 460, focusY: 640, focusR: 340,
          haloLight: true, warmColor: P.silkTea, coolColor: '#768272'
        });

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
          mossCount: 54, depth: 1
        });

        GM.setOccluders([{ x: 215, y: 895, r: 70 }]);
        drawWoodyBranch(api, rng, [[605, 1125], [645, 965], [678, 815], [715, 685]], [12, 5], {
          label: '修竹主竿', baseColor: '#5c7c48', shadeColor: '#364d29', gnarl: 0.4, washCount: 28, fissures: 2, depth: 2
        });
        [
          { node: [678, 812], x: 678, y: 806, angle: -0.45, length: 122, width: 24, bend: 0.14, depth: 2.5 },
          { node: [678, 812], x: 682, y: 810, angle: 0.15, length: 118, width: 22, bend: 0.1, depth: 2.5 },
          { node: [678, 804], x: 675, y: 800, angle: -0.95, length: 108, width: 20, bend: -0.12, depth: 2.5 },
          { node: [705, 720], x: 702, y: 716, angle: -0.35, length: 112, width: 22, bend: 0.14, depth: 2.5 },
          { node: [705, 720], x: 708, y: 720, angle: 0.28, length: 105, width: 20, bend: 0.1, depth: 2.5 }
        ].forEach(bf => {
          drawPetiole(api, bf.node[0], bf.node[1], bf.x, bf.y, '#4c6135', 1.2, 2.2);
          GM.drawGongbiLeaf(api, rng, bf);
        });

        drawWoodyBranch(api, rng, [[165, 1095], [202, 965], [218, 908]], [14, 7], {
          label: '山茶花枝', washCount: 25, fissures: 4, depth: 2
        });
        [
          { node: [194, 985], x: 185, y: 945, angle: 2.75, length: 118, width: 52, serrated: true, bend: 0.12, depth: 2.5 },
          { node: [194, 985], x: 195, y: 965, angle: 2.15, length: 110, width: 48, serrated: true, isBack: true, depth: 2.2 },
          { node: [212, 922], x: 245, y: 878, angle: -1.85, length: 112, width: 48, serrated: true, bend: -0.1, depth: 2.5 },
          { node: [212, 922], x: 255, y: 925, angle: -0.42, length: 115, width: 48, serrated: true, depth: 2.5 }
        ].forEach(cf => {
          drawPetiole(api, cf.node[0], cf.node[1], cf.x, cf.y, '#5c4632', 1.6, 2.2);
          GM.drawGongbiLeaf(api, rng, cf);
        });
        GM.setOccluders([]);

        drawRichBlossom(api, rng, {
          cx: 215, cy: 895, R: 84, tilt: 0.85, notches: 1, depth: 3.5,
          baseColor: '#f2b8c0', rootColor: '#821828', midColor: '#c83446', tipColor: '#f7d8dc',
          outlineColor: '#5c1824',
          tiers: [
            { count: 8, distFrac: 0.16, lenFrac: 0.82, widFrac: 0.65, rot: 0.1 },
            { count: 7, distFrac: 0.12, lenFrac: 0.66, widFrac: 0.56, rot: 0.48 },
            { count: 5, distFrac: 0.06, lenFrac: 0.44, widFrac: 0.44, rot: 0.2 }
          ],
          stamenCount: 28
        });

        // Sleek Fluid Golden Pheasant perched gracefully atop rock at (425, 610)
        const px = 425, py = 610;

        // Swooping Gravity-Bent Tail Plumes (graceful bend=0.22 + organic leopard mottling, NO stiff ruler lines!)
        const tailSpecs = [
          { x0: px + 88, y0: py + 12, x1: px + 392, y1: py + 432, w: 17, bend: 0.22 },
          { x0: px + 82, y0: py + 22, x1: px + 350, y1: py + 472, w: 15, bend: 0.20 },
          { x0: px + 76, y0: py + 28, x1: px + 306, y1: py + 485, w: 13, bend: 0.18 }
        ];
        tailSpecs.forEach((ts) => {
          const dx = ts.x1 - ts.x0, dy = ts.y1 - ts.y0;
          const len = Math.hypot(dx, dy) || 1;
          const nx = -dy / len, ny = dx / len;
          const mxT = (ts.x0 + ts.x1) * 0.5 + nx * len * ts.bend;
          const myT = (ts.y0 + ts.y1) * 0.5 + ny * len * ts.bend;
          GM.drawFeatherPlume(api, rng, {
            x0: ts.x0, y0: ts.y0, x1: ts.x1, y1: ts.y1, width: ts.w, bend: ts.bend, baseAlpha: 0.95, depth: 3.2,
            baseColor: '#d9a452', tipColor: '#9e6b32', shaftColor: P.inkDeep, outlineColor: '#452b18', barbCount: 48
          });
          // Organic mottled leopard-spot ellipses centered accurately along tail plume Bezier spline!
          for (let b = 2; b <= 20; b++) {
            const u = b / 22;
            const pt = GM.quadPoint([ts.x0, ts.y0], [mxT, myT], [ts.x1, ts.y1], u);
            const hw = ts.w * Math.sin(Math.pow(u, 0.72) * Math.PI * 0.92 + 0.15) * 0.55;
            const side = (b % 2 === 0 ? 0.35 : -0.35) + (rng() - 0.5) * 0.25;
            const sx = pt[0] + nx * hw * side, sy = pt[1] + ny * hw * side;
            const spotCol = GM.rgbaStr(rng() > 0.35 ? P.inkDeep : P.burntOchre, 0.65 + rng() * 0.2);
            GM.pushRaw(api, 4, '锦鸡尾斑豹点', (c) => {
              c.save(); c.fillStyle = spotCol;
              c.beginPath(); c.ellipse(sx, sy, 2.2 + rng() * 1.4, 3.8 + rng() * 1.6, Math.atan2(dy, dx) + 0.2, 0, GM.TAU); c.fill();
              c.restore();
            }, 'vein', 3.4);
          }
        });

        GM.baimiaoStroke(api, 1, '锦鸡双足', [[px - 5, py + 72], [px + 2, py + 114]], { width: 4.5, color: '#8f6934', depth: 3.5 });
        GM.baimiaoStroke(api, 1, '锦鸡右足', [[px + 28, py + 68], [px + 38, py + 112]], { width: 4.5, color: '#8f6934', depth: 3.5 });
        GM.baimiaoStroke(api, 4, '锦鸡爪', [[px - 18, py + 116], [px + 2, py + 114], [px + 24, py + 120]], { width: 2.4, color: '#4d381c', depth: 3.5 });

        // Unified Breast + Mantle + Tail Root (ZERO external stray wireframe box!)
        const breastPoly = GM.catmullRom([
          [px - 62, py - 4], [px - 12, py - 12], [px + 72, py + 24],
          [px + 78, py + 58], [px + 64, py + 74], [px - 18, py + 78], [px - 74, py + 38]
        ], 7, true);
        GM.baimiaoStroke(api, 1, '锦鸡朱腹双勾', breastPoly, { closed: true, raw: true, width: 1.0, color: '#6b2216', alpha: 0.72, depth: 3.6 });
        GM.baseShadePoly(api, 2, '锦鸡朱砂敷彩', breastPoly, {
          baseColor: P.cinnabar, baseAlpha: 0.97, shadeColor: '#e05b2d', shadeAlpha: 0.45, depth: 3.6
        });
        GM.simaoTract(api, 4, '朱腹批丝簇', breastPoly, rng, {
          count: 580, angle: 0.95, spread: 0.16, lenMin: 7, lenMax: 15,
          color: '#a82218', colorAlt: '#e8683a', alpha: 0.82, width: 0.65, depth: 3.7
        });

        const wingPoly = GM.catmullRom([
          [px - 4, py - 24], [px + 75, py - 12], [px + 106, py + 36], [px + 64, py + 68], [px + 2, py + 32]
        ], 7, true);
        GM.baimiaoStroke(api, 1, '锦鸡翼羽廓线', wingPoly, { closed: true, raw: true, width: 1.0, color: P.inkDeep, alpha: 0.72, depth: 3.8 });
        GM.baseShadePoly(api, 2, '青绿肩羽设色', wingPoly, {
          baseColor: '#1f5482', baseAlpha: 0.96, shadeColor: '#266146', shadeAlpha: 0.58,
          gradFrom: [px + 100, py + 45], gradTo: [px, py - 15], depth: 3.8
        });
        drawWingCoverts(api, rng, px + 18, py - 2, 3, 4, 0.52, '#215887', '#327858', '#142029', 3.9);
        GM.simaoTract(api, 4, '青背羽丝毛', wingPoly, rng, {
          count: 340, angle: 0.55, spread: 0.16, lenMin: 8, lenMax: 15,
          color: '#1b3e5e', colorAlt: '#489172', alpha: 0.78, width: 0.6, depth: 3.95
        });

        // Layered Scalloped Orange-Gold Cape Ruff Feathers overlapping smoothly down over chest & wing!
        drawWingCoverts(api, rng, px - 24, py - 28, 3, 4, 0.78, '#ebaf3c', '#f5d26e', '#1a1410', 4.1);

        const headX = px - 36, headY = py - 56;
        const headPoly = GM.catmullRom([
          [headX - 18, headY + 10], [headX - 16, headY - 14], [headX + 14, headY - 18], [headX + 22, headY + 12], [headX - 2, headY + 20]
        ], 5, true);
        GM.baimiaoStroke(api, 1, '锦鸡头部轮廓', headPoly, { closed: true, raw: true, width: 0.9, color: '#7a4d16', depth: 4.3 });
        GM.baseShadePoly(api, 3, '头冠亮金敷彩', headPoly, { baseColor: '#f2ca58', baseAlpha: 0.97, shadeColor: '#d48d28', shadeAlpha: 0.42, depth: 4.3 });
        const crestPaths = [
          [[headX - 6, headY - 14], [headX + 26, headY - 26], [headX + 66, headY - 8]],
          [[headX - 2, headY - 10], [headX + 32, headY - 18], [headX + 70, headY + 2]]
        ];
        GM.flowHairStrands(api, 4, '泥金冠羽丝毛', crestPaths, rng, {
          color: '#dfa532', sheenColor: '#faea9e', alpha: 0.86, width: 0.82, strandsPerPath: 52, jitter: 6, depth: 4.4
        });
        GM.goldFiligreeStroke(api, 5, '凤冠泥金提神', crestPaths[0], { width: 1.25, alpha: 0.78, depth: 4.5 });

        const pBeak = GM.catmullRom([[headX - 16, headY], [headX - 42, headY + 4], [headX - 14, headY + 10]], 3, true);
        GM.baimiaoStroke(api, 1, '锦鸡短喙', pBeak, { closed: true, raw: true, width: 1.0, color: '#5c411e', depth: 4.5 });
        GM.baseShadePoly(api, 3, '喙色赭黄', pBeak, { baseColor: '#d9b562', baseAlpha: 0.96, depth: 4.5 });
        GM.pushRaw(api, 5, '锦鸡凝睛', (c) => {
          c.save();
          c.fillStyle = '#faea9e'; c.beginPath(); c.arc(headX - 4, headY - 2, 4.4, 0, GM.TAU); c.fill();
          c.fillStyle = '#120e0c'; c.beginPath(); c.arc(headX - 4, headY - 2, 2.7, 0, GM.TAU); c.fill();
          c.fillStyle = '#fff'; c.beginPath(); c.arc(headX - 5, headY - 3, 1.0, 0, GM.TAU); c.fill();
          c.restore();
        }, 'eye', 4.8);

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
      subtitle: '南宋林椿小品法度：前景茶花实染遮枝 → 腊质齿叶虫蚀留水线 → 绣眼叠翅爪扣枝梢',
      group: '国画·工笔',
      category: '工笔花鸟',
      seal: '工笔小品',
      mode: 'gongbi',
      width: 960,
      height: 1120,
      seed: 1006,
      swatches: ['rgb(235, 224, 200)', 'rgb(198, 36, 48)', 'rgb(42, 92, 48)', 'rgb(112, 148, 62)', 'rgb(252, 250, 245)'],
      desc: '师南宋林椿写生法度，前景朱红山茶花朵与腊质锯齿叶实染遮盖后景茶枝，叶片留水线并点写虫蚀枯尖；一对绣眼鸟分勾肩羽叠翼，弯曲三趾紧扣细枝。',
      layers: GONGBI_LAYERS,
      analysis: {
        original: '南宋林椿《果熟来禽图》与《山茶霁雪》小品',
        movement: '南宋写实花鸟工笔小品',
        palette: '老枝赭墨 · 宝珠胭脂 · 厚绿革叶 · 芽绿绣眼 · 蛤粉眼圈',
        technique: '前景遮挡掩膜 · 绣眼翅羽分叠与握枝趾节 · 虫蚀叶留水线 · 蛤粉珠点',
        algorithm: '为宝珠茶花设置遮挡掩膜消去花心下方透枝感；绣眼鸟重构肩背至尾羽清瘦弧线并加绘分层覆羽与弯曲趾爪紧扣茶枝。'
      },
      buildStrokes(api) {
        ensureGM();
        const rng = GM.makeRng(1006);
        const W = 960, H = 1120;

        GM.silkHaloGround(api, 2, W, H, rng, {
          count: 380, focusX: 500, focusY: 540, focusR: 330,
          haloLight: true, warmColor: P.silkTea, coolColor: '#788872'
        });

        GM.setOccluders([
          { x: 415, y: 675, r: 78 },
          { x: 605, y: 485, r: 68 },
          { x: 265, y: 765, r: 54 }
        ]);
        drawWoodyBranch(api, rng, [[115, 985], [275, 845], [455, 675], [615, 510], [725, 415]], [30, 8], {
          label: '茶花老干斜出', gnarl: 1.5, washCount: 70, fissures: 12, depth: 1
        });
        drawWoodyBranch(api, rng, [[395, 735], [465, 545], [510, 402], [538, 345]], [16, 5], {
          label: '右上花栖枝', gnarl: 0.7, washCount: 38, fissures: 6, depth: 1
        });
        drawWoodyBranch(api, rng, [[485, 645], [615, 632], [755, 616]], [14, 5], {
          label: '右下伴枝', gnarl: 0.6, washCount: 32, fissures: 5, depth: 1
        });

        const cLeaves = [
          { node: [255, 864], x: 278, y: 832, angle: -2.45, length: 132, width: 56, serrated: true, ovate: true, isBack: true, depth: 2 },
          { node: [545, 638], x: 545, y: 688, angle: 0.35, length: 138, width: 58, serrated: true, ovate: true, isBack: true, autumnTip: true, depth: 2 },
          { node: [465, 545], x: 438, y: 545, angle: -2.88, length: 126, width: 52, serrated: true, ovate: true, isBack: true, depth: 2 },
          { node: [235, 882], x: 255, y: 855, angle: 2.75, length: 148, width: 64, serrated: true, ovate: true, bend: 0.1, depth: 3 },
          { node: [368, 755], x: 355, y: 745, angle: 2.45, length: 142, width: 60, serrated: true, ovate: true, wormBite: true, depth: 3 },
          { node: [478, 665], x: 488, y: 705, angle: 1.05, length: 146, width: 62, serrated: true, ovate: true, depth: 3 },
          { node: [572, 558], x: 575, y: 550, angle: -0.52, length: 145, width: 62, serrated: true, ovate: true, depth: 3 },
          { node: [615, 508], x: 605, y: 495, angle: -0.15, length: 128, width: 54, serrated: true, ovate: true, wormBite: true, depth: 3 },
          { node: [485, 495], x: 488, y: 502, angle: -2.32, length: 136, width: 58, serrated: true, ovate: true, depth: 3 },
          { node: [635, 630], x: 645, y: 642, angle: 0.78, length: 132, width: 54, serrated: true, ovate: true, depth: 3 },
          { node: [688, 452], x: 705, y: 455, angle: 0.42, length: 118, width: 48, serrated: true, ovate: true, depth: 3 },
          { node: [195, 912], x: 195, y: 888, angle: -2.85, length: 120, width: 52, serrated: true, ovate: true, depth: 3 }
        ];
        cLeaves.forEach(lf => {
          drawPetiole(api, lf.node[0], lf.node[1], lf.x, lf.y, '#5a4430', 1.8, lf.depth - 0.5);
          GM.drawGongbiLeaf(api, rng, lf);
        });
        GM.setOccluders([]);

        drawRichBlossom(api, rng, {
          cx: 415, cy: 675, R: 98, tilt: 0.88, notches: 1, depth: 4,
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
          cx: 605, cy: 485, R: 84, tilt: 0.84, notches: 1, depth: 4,
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
          cx: 265, cy: 765, R: 68, tilt: 0.86, notches: 1, depth: 4,
          baseColor: '#f5ccd0', rootColor: '#821828', midColor: '#c83244', tipColor: '#f7d8dc',
          outlineColor: '#5c1824',
          tiers: [
            { count: 7, distFrac: 0.14, lenFrac: 0.76, widFrac: 0.62, rot: 0.2 },
            { count: 5, distFrac: 0.08, lenFrac: 0.52, widFrac: 0.48, rot: 0.5 }
          ],
          stamenCount: 24
        });
        [{ n: [548, 636], x: 535, y: 615 }, { n: [705, 435], x: 705, y: 425 }, { n: [315, 815], x: 315, y: 842 }].forEach(b => {
          drawPetiole(api, b.n[0], b.n[1], b.x, b.y, '#5a4430', 1.5, 4);
          GM.drawPlumBlossom(api, rng, { x: b.x, y: b.y, radius: 22, view: 'bud', blush: true });
        });

        // Graceful Songbird Japanese White-eyes (流线肩翼重叠 + 弯趾握枝)
        function paintWhiteEye(cx, cy, flip = 1, footTargetY, depthBase = 4.5) {
          const X = (dx) => cx + dx * flip;
          const bodyPts = GM.catmullRom([
            [X(-44), cy - 16], [X(-24), cy - 38], [X(12), cy - 34], [X(58), cy - 2], [X(42), cy + 32], [X(-10), cy + 40], [X(-44), cy + 12]
          ], 7, true);
          const bellyPts = GM.catmullRom([
            [X(-42), cy + 4], [X(-14), cy - 6], [X(28), cy + 6], [X(32), cy + 34], [X(-10), cy + 40], [X(-42), cy + 14]
          ], 6, true);
          const throatPts = GM.catmullRom([
            [X(-46), cy - 4], [X(-24), cy - 12], [X(-16), cy + 12], [X(-36), cy + 16]
          ], 5, true);

          GM.drawFeatherPlume(api, rng, {
            x0: X(36), y0: cy + 6, x1: X(98), y1: cy + 38, width: 10, bend: 0.06, baseAlpha: 0.94, depth: depthBase,
            baseColor: '#507032', tipColor: '#2d401c', shaftColor: P.inkDeep, outlineColor: '#222b18', barbCount: 16
          });
          GM.baimiaoStroke(api, 1, '绣眼体廓', bodyPts, { closed: true, raw: true, width: 1.05, color: '#29321c', depth: depthBase + 0.1 });
          GM.baseShadePoly(api, 2, '绣眼芽绿背羽', bodyPts, { baseColor: '#7ca244', baseAlpha: 0.97, shadeColor: '#48682c', shadeAlpha: 0.45, depth: depthBase + 0.1 });
          GM.baseShadePoly(api, 3, '绣眼粉白腹羽', bellyPts, { baseColor: '#f3efe4', baseAlpha: 0.97, shadeColor: '#d9ceb8', shadeAlpha: 0.35, depth: depthBase + 0.2 });
          GM.baseShadePoly(api, 3, '绣眼鹅黄喉羽', throatPts, { baseColor: '#f0d86c', baseAlpha: 0.96, shadeColor: '#c9a638', shadeAlpha: 0.35, depth: depthBase + 0.25 });

          GM.simaoTract(api, 4, '绣眼背羽批丝', bodyPts, rng, {
            count: 340, angle: (flip > 0 ? 0.36 : Math.PI - 0.36), spread: 0.12,
            lenMin: 6, lenMax: 12, color: '#6b8e38', colorAlt: '#a9bf66', width: 0.56, depth: depthBase + 0.3
          });
          GM.simaoTract(api, 4, '绣眼胸腹批丝', bellyPts, rng, {
            count: 220, angle: (flip > 0 ? 0.52 : Math.PI - 0.52), spread: 0.1,
            lenMin: 6, lenMax: 11, color: P.clamWhite, colorAlt: '#d6ccb6', width: 0.56, depth: depthBase + 0.35
          });
          // Distinct Wing Primaries + Folded Coverts
          GM.drawFeatherPlume(api, rng, {
            x0: X(8), y0: cy - 10, x1: X(66), y1: cy + 20, width: 11, bend: 0.08 * flip, baseAlpha: 0.94, depth: depthBase + 0.4,
            baseColor: '#4f6e2d', tipColor: '#2e421b', shaftColor: P.inkDeep, outlineColor: '#243018', barbCount: 14
          });
          drawWingCoverts(api, rng, X(-4), cy - 10, 2, 3, flip > 0 ? 0.38 : Math.PI - 0.38, '#557830', '#7ca244', '#2c3d19', depthBase + 0.5);

          const bk = GM.catmullRom([[X(-44), cy - 12], [X(-74), cy - 15], [X(-44), cy - 4]], 3, true);
          GM.baimiaoStroke(api, 1, '绣眼尖喙', bk, { closed: true, raw: true, width: 0.95, color: P.inkDeep, depth: depthBase + 0.6 });
          GM.baseShadePoly(api, 2, '喙色', bk, { baseColor: '#36322c', baseAlpha: 0.96, depth: depthBase + 0.6 });

          // Articulated ankle knee & gripping curved 3-toe claws wrapping around branch!
          GM.baimiaoStroke(api, 4, '绣眼抓枝双腿', [[X(-6), cy + 34], [X(-10), footTargetY - 4]], { width: 2.0, color: '#3b2e22', depth: depthBase + 0.6 });
          GM.baimiaoStroke(api, 4, '绣眼右腿', [[X(12), cy + 32], [X(8), footTargetY - 6]], { width: 2.0, color: '#3b2e22', depth: depthBase + 0.6 });
          GM.baimiaoStroke(api, 4, '趾爪握枝', [[X(-16), footTargetY + 4], [X(-10), footTargetY - 4], [X(-2), footTargetY + 5]], { width: 1.4, color: '#2b2016', depth: depthBase + 0.7 });
          GM.baimiaoStroke(api, 4, '趾爪握枝', [[X(2), footTargetY + 2], [X(8), footTargetY - 6], [X(15), footTargetY + 3]], { width: 1.4, color: '#2b2016', depth: depthBase + 0.7 });

          const ex = X(-24), ey = cy - 16;
          for (let ring = 0; ring < 18; ring++) {
            const ra = (ring / 18) * GM.TAU;
            const rx = ex + Math.cos(ra) * 5.8, ry = ey + Math.sin(ra) * 5.8;
            GM.pushRaw(api, 5, '蛤粉点白眼圈', (c) => {
              c.save(); c.fillStyle = GM.rgbaStr(P.clamWhite, 0.96);
              c.beginPath(); c.arc(rx, ry, 1.85, 0, GM.TAU); c.fill(); c.restore();
            }, 'lifen', depthBase + 0.8);
          }
          GM.pushRaw(api, 5, '绣眼黑睛', (c) => {
            c.save();
            c.fillStyle = '#0e0c0b'; c.beginPath(); c.arc(ex, ey, 3.6, 0, GM.TAU); c.fill();
            c.fillStyle = '#ffffff'; c.beginPath(); c.arc(ex - 1.1, ey - 1.1, 1.1, 0, GM.TAU); c.fill();
            c.restore();
          }, 'eye', depthBase + 0.9);
        }

        paintWhiteEye(512, 336, 1, 396, 4.5);
        paintWhiteEye(705, 566, -1, 622, 4.5);

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
      subtitle: '宋画《柳蝉》草虫法度：风吹斜拂疏密聚散柳丝 → 三五成簇柳叶 → 透纱玄蝉栖苍干',
      group: '国画·工笔',
      category: '工笔花鸟',
      seal: '宋画小品',
      mode: 'gongbi',
      width: 920,
      height: 1160,
      seed: 1007,
      swatches: ['rgb(235, 224, 200)', 'rgb(64, 112, 62)', 'rgb(96, 82, 58)', 'rgb(42, 34, 26)', 'rgb(198, 178, 128)'],
      desc: '打破呆板垂线排列，以三枝高低错落老柳横斜生发十二缕长短不一、迎风微斜的聚散柳丝，柳叶三五成簇或浓或淡；左立古干树瘤节疤苍润，玄蝉轻伏鸣秋。',
      layers: GONGBI_LAYERS,
      analysis: {
        original: '南宋院体《柳蝉图》扇面与宋元草虫小景',
        movement: '宋代花鸟草虫工笔写实',
        palette: '老柳褐赭 · 汁绿秋黄柳叶 · 焦墨玄蝉 · 朱赭点眼 · 淡金蝉翼',
        technique: '聚散高低风斜柳丝 · 成簇柳叶 · 古柳节疤苔点 · 蝉翼透纱',
        algorithm: '用高低长短错落的弯曲风动曲线替代平行直线垂柳，按疏密簇生排布柳叶正反深浅，并在主干添节疤凹凸皴染以烘托玄蝉。'
      },
      buildStrokes(api) {
        ensureGM();
        const rng = GM.makeRng(1007);
        const W = 920, H = 1160;

        GM.silkHaloGround(api, 2, W, H, rng, {
          count: 380, focusX: 430, focusY: 540, focusR: 320,
          haloLight: true, warmColor: P.silkTea, coolColor: '#7d8a72'
        });

        drawWoodyBranch(api, rng, [[222, 1190], [250, 860], [268, 560], [260, 260], [218, -25]], [112, 74], {
          label: '老柳主干', baseColor: '#7a654a', shadeColor: '#3f3225', gnarl: 4.4, washCount: 185, fissures: 48, depth: 1
        });
        drawWoodyBranch(api, rng, [[272, 315], [420, 225], [568, 145], [692, 102]], [34, 8], {
          label: '横伸上柳枝', baseColor: '#6d5b42', shadeColor: '#3c3024', gnarl: 1.5, washCount: 58, fissures: 14, depth: 1
        });
        drawWoodyBranch(api, rng, [[284, 412], [402, 378], [525, 368]], [16, 5], {
          label: '中出辅柳枝', gnarl: 0.9, washCount: 28, fissures: 6, depth: 1
        });
        drawWoodyBranch(api, rng, [[276, 175], [385, 82], [495, 32]], [18, 6], {
          label: '高出斜梢', gnarl: 1.0, washCount: 28, fissures: 6, depth: 1
        });

        // Sculpted weathered willow burl knot safely tucked low below cicada + vertical bark fissures + moss
        const knot = GM.catmullRom([[236, 795], [266, 784], [278, 812], [254, 834], [234, 818]], 4, true);
        GM.baimiaoStroke(api, 1, '老柳树节疤', knot, { closed: true, raw: true, width: 1.1, color: P.inkDeep, alpha: 0.72, depth: 1.2 });
        GM.baseShadePoly(api, 3, '节疤暗染', knot, { baseColor: '#564332', baseAlpha: 0.65, shadeColor: '#3a2d22', shadeAlpha: 0.45, depth: 1.2 });
        for (let f = 0; f < 95; f++) {
          const fy = 20 + rng() * 1100, fx = 222 + rng() * 72, len = 18 + rng() * 52;
          const col = GM.rgbaStr(rng() > 0.35 ? P.inkDeep : P.burntOchre, 0.32 + rng() * 0.25);
          GM.pushRaw(api, 3, '柳干纵向皴裂', (c) => {
            c.save(); c.strokeStyle = col; c.lineWidth = 0.8 + rng() * 0.65; c.lineCap = 'round';
            c.beginPath(); c.moveTo(fx, fy); c.quadraticCurveTo(fx + (rng() - 0.5) * 6, fy + len * 0.5, fx + (rng() - 0.5) * 5, fy + len); c.stroke(); c.restore();
          }, 'vein', 1.2);
        }
        for (let m = 0; m < 40; m++) {
          const my = 80 + rng() * 980, mx = 224 + rng() * 68;
          const col = GM.rgbaStr(rng() > 0.4 ? '#567848' : '#8da36a', 0.52);
          GM.pushRaw(api, 3, '柳干石绿点苔', (c) => {
            c.save(); c.fillStyle = col;
            c.beginPath(); c.ellipse(mx, my, 2.3 + rng() * 2.2, 1.5 + rng() * 1.4, rng(), 0, GM.TAU); c.fill(); c.restore();
          }, 'moss', 1.3);
        }

        // Graceful Breeze-Swayed Sinusoidal S-Curve Willow Streamers (迎风轻拂S形垂柳!)
        const whips = [
          { x0: 342, y0: 268, len: 295, dxEnd: 88, amp: 32, freq: 1.3, nL: 7, depth: 2.0 },
          { x0: 378, y0: 382, len: 345, dxEnd: 108, amp: 38, freq: 1.4, nL: 8, depth: 2.1 },
          { x0: 416, y0: 226, len: 525, dxEnd: 158, amp: 46, freq: 1.5, nL: 11, depth: 2.4 },
          { x0: 446, y0: 208, len: 635, dxEnd: 175, amp: 54, freq: 1.6, nL: 12, depth: 2.5 },
          { x0: 472, y0: 372, len: 475, dxEnd: 132, amp: 42, freq: 1.4, nL: 10, depth: 2.7 },
          { x0: 396, y0: 76,  len: 465, dxEnd: 145, amp: 40, freq: 1.5, nL: 9, depth: 2.8 },
          { x0: 476, y0: 38,  len: 545, dxEnd: 185, amp: 48, freq: 1.6, nL: 10, depth: 2.9 },
          { x0: 542, y0: 158, len: 565, dxEnd: 162, amp: 46, freq: 1.45, nL: 10, depth: 3.1 },
          { x0: 615, y0: 128, len: 495, dxEnd: 128, amp: 38, freq: 1.35, nL: 8, depth: 3.2 },
          { x0: 518, y0: 368, len: 455, dxEnd: 192, amp: 48, freq: 1.5, nL: 9, depth: 3.3 },
          { x0: 672, y0: 108, len: 295, dxEnd: 62, amp: 24, freq: 1.25, nL: 6, depth: 3.4 }
        ];

        whips.forEach((wp) => {
          const pts = [];
          const segN = 18;
          for (let i = 0; i <= segN; i++) {
            const u = i / segN;
            // S-curve: drops smoothly at root tangent, then gusts diagonally right cleanly in the lower cascade
            const sway = wp.dxEnd * Math.pow(u, 1.35) + Math.sin(u * Math.PI * wp.freq) * wp.amp;
            const sy = wp.y0 + wp.len * u - Math.sin(u * Math.PI) * 14;
            pts.push([wp.x0 + sway, sy]);
          }
          const sm = GM.catmullRom(pts, 4, false);
          GM.baimiaoStroke(api, 1, '风柳柔丝长条', sm, { raw: true, width: 1.05, color: '#475c32', alpha: 0.76, style: 'yousi', depth: wp.depth });
          // Clustered irregular leaf positions along whip (三五聚散簇生柳叶)
          for (let k = 1; k <= wp.nL; k++) {
            const groupOffset = (k % 2 === 0 ? 0.025 : -0.025);
            const clumpT = GM.clamp((k / (wp.nL + 1)) + groupOffset, 0.06, 0.96);
            const idx = Math.floor(clumpT * (sm.length - 1));
            const pt = sm[idx];
            const prev = sm[Math.max(0, idx - 1)], next = sm[Math.min(sm.length - 1, idx + 1)];
            const stemAng = Math.atan2(next[1] - prev[1], next[0] - prev[0]);
            const side = (k % 3 === 0) ? -1 : 1;
            const ang = stemAng + side * (0.28 + rng() * 0.24);
            GM.drawGongbiLeaf(api, rng, {
              x: pt[0], y: pt[1], angle: ang,
              length: 44 + rng() * 20, width: 10.5 + rng() * 2.8,
              bend: side * 0.22, isBack: rng() > 0.65, autumnTip: rng() > 0.58, depth: wp.depth + 0.05
            });
          }
        });

        // Autumn Cicada Clinging on Trunk around (275, 558) with Bronze-Highlight Carapace & Anatomical Eyes
        const cx = 275, cy = 558;
        [
          [[cx - 12, cy - 18], [cx - 32, cy - 32], [cx - 42, cy - 16]],
          [[cx + 14, cy - 18], [cx + 34, cy - 32], [cx + 44, cy - 14]],
          [[cx - 14, cy + 4], [cx - 38, cy - 2], [cx - 48, cy + 16]],
          [[cx + 16, cy + 4], [cx + 40, cy - 2], [cx + 50, cy + 16]],
          [[cx - 14, cy + 28], [cx - 34, cy + 44], [cx - 44, cy + 68]],
          [[cx + 14, cy + 28], [cx + 36, cy + 44], [cx + 46, cy + 68]]
        ].forEach(leg => {
          GM.baimiaoStroke(api, 4, '秋蝉附枝纤足', leg, { width: 2.1, color: P.inkDeep, style: 'dingtou', depth: 4 });
          GM.baimiaoStroke(api, 5, '蝉足高光', [leg[0], leg[1]], { width: 0.75, color: '#a88758', alpha: 0.8, depth: 4 });
        });

        const cicHead = GM.catmullRom([[cx - 21, cy - 36], [cx - 11, cy - 49], [cx + 13, cy - 49], [cx + 22, cy - 36], [cx + 15, cy - 25], [cx - 14, cy - 25]], 4, true);
        const cicThorax = GM.catmullRom([[cx - 22, cy - 26], [cx + 24, cy - 26], [cx + 25, cy + 14], [cx + 18, cy + 56], [cx, cy + 78], [cx - 18, cy + 56], [cx - 24, cy + 14]], 6, true);
        GM.baimiaoStroke(api, 1, '秋蝉胸腹廓线', cicThorax, { closed: true, raw: true, width: 1.25, color: '#14100d', depth: 4.2 });
        GM.baimiaoStroke(api, 1, '秋蝉头部轮廓', cicHead, { closed: true, raw: true, width: 1.25, color: '#14100d', depth: 4.2 });
        GM.baseShadePoly(api, 2, '玄蝉黑褐甲壳', cicThorax, { baseColor: '#2d241c', baseAlpha: 0.98, shadeColor: '#8c6d4a', shadeAlpha: 0.48, gradFrom: [cx, cy - 20], gradTo: [cx + 16, cy + 60], depth: 4.2 });
        GM.baseShadePoly(api, 2, '蝉首黑褐染', cicHead, { baseColor: '#32271e', baseAlpha: 0.98, shadeColor: '#967450', shadeAlpha: 0.5, depth: 4.2 });
        GM.baimiaoStroke(api, 3, '前胸背板金边', [[cx - 18, cy - 22], [cx, cy - 16], [cx + 18, cy - 22]], { width: 1.15, color: '#9c7c4e', alpha: 0.78, depth: 4.3 });
        for (let seg = 0; seg < 6; seg++) {
          const sy = cy + 20 + seg * 8, sw = 18 - seg * 2.2;
          GM.baimiaoStroke(api, 3, '蝉腹节纹', [[cx - sw, sy], [cx, sy + 3], [cx + sw, sy]], { width: 0.85, color: '#8f6e4b', alpha: 0.82, depth: 4.3 });
        }
        [-1, 1].forEach(s => {
          GM.pushRaw(api, 5, '蝉复眼朱赭', (c) => {
            c.save();
            c.fillStyle = '#6e2d1d'; c.beginPath(); c.ellipse(cx + s * 17.5, cy - 38, 4.4, 3.6, s * 0.3, 0, GM.TAU); c.fill();
            c.fillStyle = '#e8c47a'; c.beginPath(); c.arc(cx + s * 16.5, cy - 39, 1.1, 0, GM.TAU); c.fill();
            c.restore();
          }, 'eye', 4.8);
          GM.baimiaoStroke(api, 4, '蝉短触须', [[cx + s * 10, cy - 50], [cx + s * 24, cy - 66]], { width: 0.7, color: P.inkDeep, style: 'dingtou', depth: 4.5 });
        });

        function drawCicadaWing(wingPts, isRight) {
          const sgn = isRight ? 1 : -1;
          const sm = GM.catmullRom(wingPts, 6, true);
          GM.baimiaoStroke(api, 4, '蝉翼外廓主脉', sm, { closed: true, raw: true, width: 1.3, color: '#3b3224', alpha: 0.85, depth: 4.6 });
          GM.baseShadePoly(api, 4, '蝉翼薄纱透染', sm, {
            baseColor: '#efe7cf', baseAlpha: 0.16, shadeColor: '#a69062', shadeAlpha: 0.14,
            gradFrom: wingPts[0], gradTo: wingPts[2], depth: 4.6
          });
          const root = wingPts[0];
          [
            [root, [cx + sgn * 36, cy + 48], [cx + sgn * 56, cy + 125]],
            [root, [cx + sgn * 28, cy + 62], [cx + sgn * 40, cy + 148]],
            [root, [cx + sgn * 18, cy + 74], [cx + sgn * 22, cy + 158]],
            [root, [cx + sgn * 10, cy + 66], [cx + sgn * 6, cy + 142]]
          ].forEach(rPts => {
            GM.baimiaoStroke(api, 4, '蝉翼网状纵脉', rPts, { width: 0.72, color: '#4f422e', alpha: 0.72, depth: 4.7 });
            GM.baimiaoStroke(api, 5, '蝉脉金边提光', rPts, { width: 0.45, color: P.goldPale, alpha: 0.48, depth: 4.7 });
          });
          for (let c = 0; c < 6; c++) {
            const cyy = cy + 68 + c * 15;
            GM.baimiaoStroke(api, 4, '蝉翼横脉翅室', [[cx + sgn * (12 + c * 4), cyy], [cx + sgn * (36 + (5 - c) * 3), cyy + 6]], {
              width: 0.62, color: '#4f422e', alpha: 0.65, depth: 4.7
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
      subtitle: '马麟《兰花》与毘陵草虫：方折石坡生凤眼 → 兰茎护花苞鞘 → 玉粉蝶与尾突凤蝶各异',
      group: '国画·工笔',
      category: '工笔花鸟',
      seal: '工笔草虫',
      mode: 'gongbi',
      width: 920,
      height: 1180,
      seed: 1008,
      swatches: ['rgb(235, 224, 200)', 'rgb(62, 114, 58)', 'rgb(162, 64, 96)', 'rgb(248, 240, 212)', 'rgb(212, 184, 78)'],
      desc: '坡脚奇石采用折带硬朗石块与斧劈皴，石隙长叶交错破出“凤眼”，兰箭节处加勾护花苞鞘；上方澄明玉粉蝶与左下带尾突青凤蝶姿态截然相异，神韵幽芳。',
      layers: GONGBI_LAYERS,
      analysis: {
        original: '南宋马麟《兰花图》与宋元毘陵画派草虫小景',
        movement: '宋元院体工笔兰竹草虫',
        palette: '古绢坡石 · 汁绿头绿剑叶 · 芽绿蛤粉兰瓣 · 胭脂兰舌 · 玉白粉蝶',
        technique: '折带嵌石坡岸 · 花茎节处叶鞘苞衣 · 粉蝶/凤蝶翅型分化',
        algorithm: '重构底岩为参差棱角山石并加斧劈苔草，为兰花梗补齐护花苞鞘；为粉蝶与尾突凤蝶分别设计截然不同的前后翅形态参数。'
      },
      buildStrokes(api) {
        ensureGM();
        const rng = GM.makeRng(1008);
        const W = 920, H = 1180;

        GM.silkHaloGround(api, 2, W, H, rng, {
          count: 380, focusX: 460, focusY: 560, focusR: 340,
          haloLight: true, warmColor: P.silkTea, coolColor: '#788870'
        });

        // Chiseled Angular Garden Slope Stones (方硬坡石 + 次石层叠 — zero bread mound!)
        GM.drawTaihuRock(api, rng, {
          outerPts: [[82, 1140], [108, 1028], [162, 992], [248, 965], [352, 978], [452, 1018], [585, 1068], [568, 1140]],
          holes: [], mossCount: 54, depth: 1
        });

        function drawOrchidBlade(pts, maxW, isBack = false, depth = 2) {
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
            closed: true, raw: true, width: isBack ? 0.85 : 1.05, color: colLine, style: 'dingtou', chunkSize: 12, depth
          });
          GM.baseShadePoly(api, 2, '兰叶汁绿统染', poly, {
            baseColor: isBack ? '#8ba868' : '#4a7d47', baseAlpha: isBack ? 0.9 : 0.96,
            shadeColor: isBack ? '#4e6939' : '#224a2d', shadeAlpha: 0.54,
            gradFrom: curve[0], gradTo: curve[n - 1], depth
          });
          GM.fenranRegion(api, 3, '兰叶留水线分染', poly, rng, {
            count: 42, colorFrom: isBack ? '#5c7842' : '#265336', colorTo: '#94b572',
            gradFrom: curve[0], gradTo: curve[n - 1], veinPts: curve, waterLineGap: 1.9, hugVein: true,
            alphaMin: 0.03, alphaMax: 0.11, dabScale: 0.85, depth
          });
          GM.baimiaoStroke(api, 4, '兰脉水线亮筋', curve, {
            raw: true, width: 0.85, color: '#b4cc8a', alpha: 0.58, chunkSize: 12, depth, clipOccluders: true
          });
        }

        const blades = [
          { pts: [[280, 1020], [230, 815], [160, 660], [115, 565]], w: 17, back: true, depth: 2 },
          { pts: [[305, 1030], [380, 845], [535, 675], [705, 550]], w: 18, back: true, depth: 2 },
          { pts: [[265, 1015], [275, 785], [335, 585], [415, 425]], w: 16, back: true, depth: 2 },
          { pts: [[355, 1035], [495, 925], [665, 875], [795, 865]], w: 17, back: true, depth: 2 },
          { pts: [[250, 1010], [185, 880], [125, 795], [85, 745]], w: 14, back: true, depth: 2 },
          { pts: [[338, 1028], [410, 770], [545, 545], [695, 415]], w: 15, back: true, depth: 2 },

          { pts: [[295, 1020], [320, 740], [450, 445], [585, 250]], w: 19, back: false, depth: 3 },
          { pts: [[315, 1025], [375, 725], [305, 515], [248, 365]], w: 18, back: false, depth: 3 },
          { pts: [[345, 1025], [440, 780], [635, 585], [815, 445]], w: 20, back: false, depth: 3 },
          { pts: [[335, 1030], [465, 865], [645, 765], [815, 715]], w: 19, back: false, depth: 3 },
          { pts: [[325, 1028], [260, 860], [215, 725], [185, 605]], w: 15, back: false, depth: 3 },
          { pts: [[318, 1022], [358, 695], [490, 495], [625, 365]], w: 16, back: false, depth: 3 }
        ];
        blades.forEach(b => drawOrchidBlade(b.pts, b.w, b.back, b.depth));

        GM.simaoTract(api, 4, '石畔春草批丝', GM.catmullRom([[140, 1025], [220, 965], [395, 985], [485, 1045], [285, 1065]], 5, true), rng, {
          count: 380, angle: -1.52, spread: 0.55, lenMin: 11, lenMax: 26, color: '#2b4a26', colorAlt: '#789652', width: 0.68, depth: 3.2
        });

        GM.baimiaoStroke(api, 1, '春兰箭梗', [[335, 1015], [410, 685], [485, 435]], { width: 2.2, color: '#5d6b42', depth: 3.4 });
        GM.baimiaoStroke(api, 1, '伴生兰梗', [[322, 1015], [355, 755], [375, 565]], { width: 1.9, color: '#6b7548', depth: 3.4 });
        // Sheathing nodal floral bracts along flower scape joints (护花叶苞鞘!)
        [[368, 868, -1.2], [398, 720, -1.1], [435, 565, -0.95], [342, 835, -1.7]].forEach(([sx, sy, ang]) => {
          GM.drawGongbiLeaf(api, rng, { x: sx, y: sy, angle: ang, length: 42, width: 12, isBack: true, autumnTip: true, depth: 3.5 });
        });

        function drawOrchidFlower(ox, oy, scale = 1.0, rot = 0) {
          const pAngles = [-Math.PI * 0.5, -Math.PI * 0.88, -Math.PI * 0.12, Math.PI * 0.72, Math.PI * 0.28];
          pAngles.forEach((pa, pi) => {
            GM.drawFlowerPetal(api, rng, {
              cx: ox, cy: oy, angle: pa + rot,
              length: (pi === 0 ? 58 : 54) * scale,
              width: (pi === 1 || pi === 2 ? 20 : 16) * scale,
              notches: 0, tilt: 0.94, baseAlpha: 0.96, depth: 4,
              baseColor: '#f3f5dc', rootColor: '#698548', midColor: '#dfe5bc', tipColor: '#f9faee',
              outlineColor: '#4c5934', washCount: 16
            });
          });
          const lip = GM.catmullRom([
            [ox - 8 * scale, oy + 2], [ox + 8 * scale, oy + 2],
            [ox + 11 * scale, oy + 22 * scale], [ox, oy + 30 * scale], [ox - 11 * scale, oy + 22 * scale]
          ], 4, true);
          GM.baimiaoStroke(api, 1, '兰舌双勾', lip, { closed: true, raw: true, width: 0.85, color: P.carmine, depth: 4.2 });
          GM.baseShadePoly(api, 3, '素心兰舌点粉', lip, { baseColor: P.clamWhite, baseAlpha: 0.98, shadeColor: '#d9788e', shadeAlpha: 0.42, depth: 4.2 });
          for (let d = 0; d < 7; d++) {
            const dx = ox + (rng() - 0.5) * 12 * scale, dy = oy + 10 * scale + rng() * 14 * scale;
            GM.pushRaw(api, 5, '兰舌胭脂细点', (c) => {
              c.save(); c.fillStyle = GM.rgbaStr(P.carmine, 0.88);
              c.beginPath(); c.arc(dx, dy, 1.45 * scale, 0, GM.TAU); c.fill(); c.restore();
            }, 'lifen', 4.4);
          }
        }

        drawOrchidFlower(485, 435, 1.05, 0.08);
        drawOrchidFlower(432, 565, 0.96, -0.15);
        drawOrchidFlower(375, 565, 0.92, 0.22);
        drawOrchidFlower(356, 675, 0.85, -0.08);
        GM.drawFlowerPetal(api, rng, {
          cx: 492, cy: 392, angle: -1.15, length: 34, width: 15, notches: 0, tilt: 0.92, depth: 3.6,
          baseColor: '#dce6bc', rootColor: '#6d8a4b', midColor: '#c9d99c', tipColor: '#f5f7df',
          outlineColor: '#4c5934', washCount: 12
        });

        // Morphologically Distinct Butterflies: Creamy Pierid top-right + Tailed Swallowtail mid-left!
        drawDistinctButterfly(api, rng, { bx: 645, by: 295, scale: 1.06, kind: 'pierid', flip: 1 });
        drawDistinctButterfly(api, rng, { bx: 278, by: 535, scale: 0.84, kind: 'swallowtail', flip: 1 });

        GM.finalizeGongbiBudget(api, rng, W, H, {
          target: 7400, minTarget: 6400, maxTarget: 8800,
          focusX: 460, focusY: 560, focusR: 340, haloLight: true,
          inscription: { x: 145, y: 145, text: '空谷幽芳', opts: { size: 32, stepY: 42, color: '#2b221a' } },
          seal: { x: 145, y: 355, text: '幽兰', opts: { size: 40, color: '#9c2d23' } }
        });
      }
    },

    // =========================================================================
    // 9. 工笔·执扇仕女 (Three-Quarter Graceful Tang-Song Court Figure)
    // =========================================================================
    {
      id: 'gongbi-court-lady',
      title: '工笔·执扇仕女',
      subtitle: '唐周昉《簪花仕女》三分侧颜法：三分侧目丰颊 → 素腕玉镯执纨扇 → 疏密游丝褶配扭曲团花',
      group: '国画·工笔',
      category: '工笔人物',
      seal: '工笔仕女',
      mode: 'gongbi',
      width: 920,
      height: 1200,
      seed: 1009,
      swatches: ['rgb(235, 224, 200)', 'rgb(245, 225, 212)', 'rgb(198, 62, 54)', 'rgb(74, 134, 122)', 'rgb(228, 186, 82)'],
      desc: '全面改绘为三分半侧身立姿：远山蛾眉与眼鼻随面颊微侧，双臂素腕携翡翠镯分别挽带、轻持山水纨扇；天水碧斜流披帛配石榴红疏密游丝裙褶及雕栏风竹。',
      layers: GONGBI_LAYERS,
      analysis: {
        original: '唐代周昉《簪花仕女图》与五代南唐《纨扇仕女》设色法',
        movement: '唐宋工笔人物仕女画',
        palette: '粉面三白 · 曙红面妆 · 松烟云髻 · 天水碧纱 · 石榴红泥金裙',
        technique: '三分微侧开脸 · 素腕玉镯交叠广袖 · 疏密衣褶 · 透视变扁宝相团花',
        algorithm: '重塑三分侧脸中轴曲线与左缩右丰下颌；增绘双袖口内腕与翡翠镯手势，斜置非对称S型披帛，按衣褶透视画疏密曲线褶纹与椭圆变形团花。'
      },
      buildStrokes(api) {
        ensureGM();
        const rng = GM.makeRng(1009);
        const W = 920, H = 1200;

        GM.silkHaloGround(api, 2, W, H, rng, {
          count: 380, focusX: 465, focusY: 560, focusR: 350,
          haloLight: true, warmColor: P.silkTea, coolColor: '#788882'
        });

        // Palace Carved Rail & Swaying Wind Bamboo cleanly framing lower-right depth
        GM.drawTaihuRock(api, rng, {
          outerPts: [[645, 1142], [672, 1045], [755, 1022], [842, 1048], [878, 1142]],
          holes: [], mossCount: 28, depth: 0.4
        });
        [[738, 1125, 725, 840, 745, 585], [782, 1125, 795, 860, 782, 625]].forEach(bp => {
          GM.baimiaoStroke(api, 1, '宫苑风竹', [[bp[0], bp[1]], [bp[2], bp[3]], [bp[4], bp[5]]], { width: 3.0, color: '#586652', alpha: 0.65, depth: 0.6 });
        });
        [
          { x: 735, y: 795, angle: -2.55, length: 92, width: 17, isBack: true, depth: 0.7 },
          { x: 736, y: 792, angle: -1.95, length: 85, width: 15, isBack: true, depth: 0.7 },
          { x: 792, y: 740, angle: -0.42, length: 98, width: 17, isBack: false, depth: 0.8 },
          { x: 790, y: 742, angle: 0.25, length: 88, width: 15, isBack: true, depth: 0.7 },
          { x: 785, y: 655, angle: -2.4, length: 84, width: 15, isBack: true, depth: 0.7 }
        ].forEach(lf => GM.drawGongbiLeaf(api, rng, lf));

        // 3/4 Turned Graceful Face (axis subtly shifted toward viewer-left!) + Neck + Ear & Jade Stud!
        const neckPoly = GM.catmullRom([[446, 336], [492, 336], [504, 392], [435, 392]], 4, true);
        // Far-left jaw slimmer, near-right jaw fuller Tang beauty curve!
        const facePoly = GM.catmullRom([
          [420, 258], [425, 228], [462, 214], [504, 232], [508, 266],
          [504, 308], [486, 336], [458, 344], [435, 334], [421, 298]
        ], 7, true);
        GM.baimiaoStroke(api, 1, '仕女玉颈双勾', neckPoly, { closed: true, raw: true, width: 0.95, color: '#5c3c2e', alpha: 0.72, depth: 3 });
        GM.baseShadePoly(api, 2, '颈部淡肉底色', neckPoly, { baseColor: '#f6dfd0', baseAlpha: 0.96, shadeColor: '#deb49e', shadeAlpha: 0.42, depth: 3 });
        GM.baimiaoStroke(api, 1, '三分侧颜高古游丝描', facePoly, { closed: true, raw: true, width: 1.1, color: '#543528', alpha: 0.8, style: 'yousi', depth: 3.5 });
        GM.baseShadePoly(api, 2, '粉面淡赭底妆', facePoly, { baseColor: '#f8e6d9', baseAlpha: 0.98, shadeColor: '#e2b5a2', shadeAlpha: 0.34, gradFrom: [506, 295], gradTo: [435, 265], depth: 3.5 });

        // Far & near cheek blush + upper-eyelid blush
        GM.fenranRegion(api, 3, '腮红淡胭脂分染', GM.catmullRom([[424, 288], [442, 286], [444, 312], [426, 310]], 4, true), rng, { count: 24, colorFrom: '#e06c75', colorTo: '#f8e6d9', alphaMin: 0.03, alphaMax: 0.1, depth: 3.6 });
        GM.fenranRegion(api, 3, '右腮淡胭脂分染', GM.catmullRom([[472, 286], [498, 288], [496, 316], [470, 314]], 4, true), rng, { count: 32, colorFrom: '#e06c75', colorTo: '#f8e6d9', alphaMin: 0.03, alphaMax: 0.11, depth: 3.6 });

        // Soft warm pearl-white Sanbai glow centered on turned facial midline (x=454)
        [
          { pts: [[442, 240], [478, 240], [472, 260], [446, 260]], label: '三白·天庭额粉' },
          { pts: [[450, 275], [462, 275], [460, 308], [448, 308]], label: '三白·鼻梁挺亮' },
          { pts: [[444, 326], [472, 326], [468, 339], [446, 339]], label: '三白·下颌盈白' }
        ].forEach(sb => {
          GM.fenranRegion(api, 5, sb.label, GM.catmullRom(sb.pts, 4, true), rng, { count: 20, colorFrom: P.clamWhite, colorTo: '#f8e6d9', alphaMin: 0.03, alphaMax: 0.12, depth: 3.7 });
        });

        // Three-quarter shifted Brows, Phoenix Eyes, Delicate Nose, Red Lips & Right Pearl Earring!
        GM.baimiaoStroke(api, 4, '左远山蛾眉', [[424, 272], [435, 267], [445, 271]], { width: 1.5, color: '#2b2019', alpha: 0.86, style: 'dingtou', depth: 3.8 });
        GM.baimiaoStroke(api, 4, '右远山蛾眉', [[464, 271], [478, 266], [494, 272]], { width: 1.55, color: '#2b2019', alpha: 0.86, style: 'dingtou', depth: 3.8 });
        GM.baimiaoStroke(api, 4, '左丹凤眼', [[426, 284], [436, 281], [446, 285]], { width: 1.4, color: '#1b1410', depth: 3.8 });
        GM.baimiaoStroke(api, 4, '左眼下睑', [[428, 286], [436, 288], [445, 286]], { width: 0.68, color: '#453229', depth: 3.8 });
        GM.baimiaoStroke(api, 4, '右丹凤眼', [[464, 285], [478, 281], [492, 284]], { width: 1.45, color: '#1b1410', depth: 3.8 });
        GM.baimiaoStroke(api, 4, '右眼下睑', [[466, 286], [478, 288], [490, 286]], { width: 0.68, color: '#453229', depth: 3.8 });
        GM.baimiaoStroke(api, 4, '琼鼻微侧勾', [[452, 278], [447, 304], [458, 307]], { width: 0.95, color: '#6b4435', depth: 3.8 });
        [[435, 284], [476, 284]].forEach(([ex, ey]) => {
          GM.pushRaw(api, 5, '点瞳传神', (c) => {
            c.save(); c.fillStyle = '#181310'; c.beginPath(); c.arc(ex, ey, 2.25, 0, GM.TAU); c.fill();
            c.fillStyle = '#fff'; c.beginPath(); c.arc(ex - 0.6, ey - 0.6, 0.7, 0, GM.TAU); c.fill(); c.restore();
          }, 'eye', 3.9);
        });
        const lipUpper = GM.catmullRom([[446, 321], [452, 318], [456, 320], [460, 318], [466, 321], [456, 324]], 4, true);
        const lipLower = GM.catmullRom([[448, 322], [456, 328], [465, 322], [456, 324]], 4, true);
        GM.baseShadePoly(api, 5, '点绛红唇', lipUpper, { baseColor: '#c43238', baseAlpha: 0.94, shadeColor: P.carmine, shadeAlpha: 0.45, depth: 3.9 });
        GM.baseShadePoly(api, 5, '下唇点胭脂', lipLower, { baseColor: '#d13d44', baseAlpha: 0.92, shadeColor: P.carmine, shadeAlpha: 0.4, depth: 3.9 });

        // High Tang Cloud Chignon & Right Pearl Ear Drop
        const hairMass = GM.catmullRom([
          [408, 284], [392, 232], [418, 178], [462, 162], [510, 178],
          [534, 232], [514, 294], [504, 240], [482, 218], [456, 226], [435, 218], [418, 242]
        ], 7, true);
        const topBun = GM.catmullRom([[428, 188], [422, 148], [462, 134], [502, 148], [496, 188]], 5, true);
        GM.baimiaoStroke(api, 1, '高髻外廓双勾', hairMass, { closed: true, raw: true, width: 1.25, color: P.inkDeep, depth: 4 });
        GM.baimiaoStroke(api, 1, '发顶云髻轮廓', topBun, { closed: true, raw: true, width: 1.15, color: P.inkDeep, depth: 4 });
        GM.baseShadePoly(api, 2, '乌黑高髻统染', hairMass, { baseColor: '#1f1a18', baseAlpha: 0.97, shadeColor: '#3a322d', shadeAlpha: 0.4, depth: 4 });
        GM.baseShadePoly(api, 2, '顶髻墨染', topBun, { baseColor: '#1f1a18', baseAlpha: 0.97, shadeColor: '#3a322d', shadeAlpha: 0.4, depth: 4 });
        GM.pushRaw(api, 5, '耳畔珠环', (c) => {
          c.save(); c.fillStyle = GM.rgbaStr(P.clamWhite, 0.96); c.strokeStyle = '#9c7834'; c.lineWidth = 0.8;
          c.beginPath(); c.arc(511, 305, 3.6, 0, GM.TAU); c.fill(); c.stroke(); c.restore();
        }, 'lifen', 4.2);

        const hairFlows = [
          [[462, 140], [428, 172], [406, 225], [412, 278]],
          [[462, 140], [496, 172], [518, 225], [512, 282]],
          [[430, 182], [462, 172], [494, 182]],
          [[414, 215], [435, 198], [462, 196], [489, 198], [510, 215]],
          [[462, 136], [442, 152], [436, 178]],
          [[462, 136], [482, 152], [488, 178]]
        ];
        GM.flowHairStrands(api, 4, '云髻千丝墨发', hairFlows, rng, {
          color: '#141110', sheenColor: '#564d47', alpha: 0.78, width: 0.65, strandsPerPath: 150, jitter: 14, depth: 4.1
        });
        GM.goldFiligreeStroke(api, 5, '金钗步摇', [[445, 165], [418, 128], [410, 145]], { width: 1.65, depth: 4.2 });
        GM.goldFiligreeStroke(api, 5, '右金步摇', [[482, 165], [512, 128], [520, 145]], { width: 1.65, depth: 4.2 });
        GM.goldFiligreeStroke(api, 5, '正中玉梳金边', [[438, 195], [462, 188], [486, 195]], { width: 2.0, depth: 4.2 });
        [[410, 148], [520, 148], [418, 126], [512, 126]].forEach(([px, py]) => {
          GM.pushRaw(api, 5, '步摇珍珠点白', (c) => {
            c.save(); c.fillStyle = GM.rgbaStr(P.clamWhite, 0.96);
            c.beginPath(); c.arc(px, py, 3.2, 0, GM.TAU); c.fill(); c.restore();
          }, 'lifen', 4.3);
        });
        GM.drawPlumBlossom(api, rng, { x: 406, y: 205, radius: 18, view: 'front', blush: true, depth: 4.4 });

        // Dynamic Draped High-Waisted Scarlet Skirt with Asymmetric Swaying Pleats & Foreshortened Gold Medallions!
        const skirt = GM.catmullRom([
          [388, 515], [465, 505], [545, 515],
          [618, 815], [648, 1085], [465, 1112], [295, 1082], [335, 815]
        ], 7, true);
        GM.baimiaoStroke(api, 1, '齐胸罗裙游丝轮廓', skirt, { closed: true, raw: true, width: 1.15, color: '#45181c', style: 'yousi', depth: 2 });
        GM.baseShadePoly(api, 2, '石榴红裙底染', skirt, {
          baseColor: '#b8342e', baseAlpha: 0.97, shadeColor: '#6d171c', shadeAlpha: 0.54,
          gradFrom: [560, 1080], gradTo: [420, 515], depth: 2
        });
        GM.fenranRegion(api, 3, '长裙褶谷胭脂分染', skirt, rng, {
          count: 170, colorFrom: P.deepCarmine, colorTo: '#df6b56',
          gradFrom: [520, 1090], gradTo: [420, 520], bias: 'from',
          alphaMin: 0.035, alphaMax: 0.13, depth: 2.1
        });

        // Asymmetric natural fluid drapery folds (疏密曲线褶纹，告别十二道等距栅栏!)
        const foldOffsets = [-68, -42, -24, -12, 6, 22, 48, 66];
        foldOffsets.forEach((off, idx) => {
          const topX = 465 + off;
          const botX = 478 + off * 2.25 + (idx % 2 === 0 ? 12 : -6);
          const midX = GM.lerp(topX, botX, 0.48) + 14;
          GM.baimiaoStroke(api, 3, '衣袂疏密游丝褶', [[topX, 540], [midX, 815], [botX, 1085]], {
            width: idx % 3 === 0 ? 1.15 : 0.78, color: '#5c1218', alpha: 0.56, style: 'yousi', depth: 2.2
          });
        });

        // Foreshortened Elliptical Gold Brocade Floral Roundels (透视压扁团窠纹!)
        [
          [385, 695, 0.85, 1.0, -0.2], [472, 745, 0.96, 0.96, 0], [546, 685, 0.76, 1.0, 0.2],
          [358, 865, 0.8, 1.0, -0.15], [476, 915, 0.98, 0.96, 0.05], [575, 855, 0.72, 1.0, 0.25],
          [422, 995, 0.92, 0.95, -0.05], [532, 1005, 0.82, 0.95, 0.15]
        ].forEach(([rx, ry, sx, sy, rot]) => {
          const ring = [];
          for (let k = 0; k <= 16; k++) {
            const a = (k / 16) * GM.TAU;
            const px = Math.cos(a) * 19 * sx, py = Math.sin(a) * 19 * sy;
            ring.push([rx + px * Math.cos(rot) - py * Math.sin(rot), ry + px * Math.sin(rot) + py * Math.cos(rot)]);
          }
          GM.goldFiligreeStroke(api, 5, '罗裙透视描金团花', ring, { closed: true, raw: true, width: 0.85, alpha: 0.65, depth: 2.4 });
          for (let p = 0; p < 5; p++) {
            const a = (p / 5) * GM.TAU + rot;
            GM.goldFiligreeStroke(api, 5, '团花宝相瓣', [[rx, ry], [rx + Math.cos(a) * 12 * sx, ry + Math.sin(a) * 12 * sy]], { raw: true, width: 0.78, alpha: 0.58, depth: 2.4 });
          }
        });

        // Fitted Graceful Tang-Song Silk Robe Bodice + Open Draped Wide Sleeves (广袖袖口自然出腕)
        const upperCoat = GM.catmullRom([
          [432, 368], [380, 405], [350, 502], [332, 598], [385, 616], [418, 542],
          [504, 542], [534, 580], [576, 526], [552, 412], [496, 368]
        ], 7, true);
        GM.baimiaoStroke(api, 1, '天水碧广袖纱衫', upperCoat, { closed: true, raw: true, width: 1.15, color: '#294846', style: 'yousi', depth: 3 });
        GM.baseShadePoly(api, 3, '天水碧纱衫罩染', upperCoat, {
          baseColor: '#88b5ad', baseAlpha: 0.96, shadeColor: '#dfeae2', shadeAlpha: 0.42,
          gradFrom: [340, 440], gradTo: [540, 540], depth: 3
        });
        // Inner sleeve fold lines showing layered fabric draping around forearms
        GM.baimiaoStroke(api, 4, '广袖叠褶线', [[376, 446], [360, 528], [344, 588]], { width: 0.85, color: '#2b524d', alpha: 0.56, style: 'yousi', depth: 3.1 });
        GM.baimiaoStroke(api, 4, '右广袖折线', [[526, 438], [538, 498], [506, 526]], { width: 0.85, color: '#2b524d', alpha: 0.56, style: 'yousi', depth: 3.1 });

        // Curved High-Waisted Silk Waist Sash Band & Twin Gracefully Draping Sash Tails
        const sashBand = GM.catmullRom([[402, 522], [465, 528], [526, 522], [528, 544], [465, 550], [398, 544]], 4, true);
        GM.baimiaoStroke(api, 4, '束胸锦带双勾', sashBand, { closed: true, raw: true, width: 0.95, color: '#6b4822', depth: 3.3 });
        GM.baseShadePoly(api, 4, '锦带鹅黄泥金', sashBand, { baseColor: '#e8cb78', baseAlpha: 0.96, shadeColor: '#c48f36', shadeAlpha: 0.38, depth: 3.3 });
        const sashTail = [[458, 546], [472, 655], [466, 772], [452, 768], [458, 655], [446, 546]];
        GM.baseShadePoly(api, 4, '锦带垂带', GM.catmullRom(sashTail, 4, true), { baseColor: '#e8cb78', baseAlpha: 0.92, depth: 3.3 });

        // Slim Asymmetric Fluttering Pibo Silk Ribbons (轻盈细飘披帛 — 绝不包成圆环!)
        const leftRibbon = GM.catmullRom([
          [388, 398], [322, 468], [268, 635], [278, 845], [312, 995],
          [292, 845], [286, 642], [338, 476], [398, 412]
        ], 6, true);
        const rightRibbon = GM.catmullRom([
          [538, 405], [596, 468], [625, 608], [608, 785], [578, 945],
          [596, 788], [608, 612], [582, 476], [526, 418]
        ], 6, true);
        [leftRibbon, rightRibbon].forEach(rb => {
          GM.baimiaoStroke(api, 1, '流动披帛游丝', rb, { closed: true, raw: true, width: 0.9, color: '#2b524d', style: 'yousi', depth: 3.4 });
          GM.baseShadePoly(api, 4, '披帛石绿飘纱', rb, { baseColor: '#7ea9a0', baseAlpha: 0.85, shadeColor: '#e6eee7', shadeAlpha: 0.35, depth: 3.4 });
        });

        // Left Sleeve Inner Cuff + Emerging Wrist & Graceful Fingers gently holding Waist Silk (NO floating detached blob!)
        const leftCuff = GM.catmullRom([[352, 548], [386, 558], [378, 588], [344, 578]], 4, true);
        GM.baseShadePoly(api, 4, '左里袖锦缘', leftCuff, { baseColor: '#f2e0ba', baseAlpha: 0.96, depth: 3.7 });
        GM.baimiaoStroke(api, 4, '左里袖勾边', leftCuff, { closed: true, raw: true, width: 0.85, color: '#6b4d2b', depth: 3.7 });
        const leftWrist = GM.catmullRom([[362, 566], [386, 564], [408, 572], [402, 584], [382, 584], [358, 580]], 4, true);
        GM.baseShadePoly(api, 4, '左素手出袖', leftWrist, { baseColor: '#f8e6d9', baseAlpha: 0.98, depth: 3.8 });
        GM.baimiaoStroke(api, 4, '左素手纤指', leftWrist, { closed: true, raw: true, width: 0.85, color: '#6b4536', depth: 3.8 });

        const fanX = 418, fanY = 452, fanR = 62;
        const fanRim = [];
        for (let k = 0; k < 28; k++) {
          const a = (k / 28) * GM.TAU;
          fanRim.push([fanX + Math.cos(a) * fanR, fanY + Math.sin(a) * fanR * 0.94]);
        }
        GM.baseShadePoly(api, 4, '素绢扇面平涂', fanRim, { baseColor: '#f6ebd0', baseAlpha: 0.98, shadeColor: '#d9c59c', shadeAlpha: 0.3, depth: 4.0 });
        const fanMtn = GM.catmullRom([[fanX - 44, fanY + 14], [fanX - 20, fanY - 12], [fanX + 2, fanY + 2], [fanX + 26, fanY - 18], [fanX + 46, fanY + 10], [fanX + 46, fanY + 20], [fanX - 44, fanY + 20]], 3, true);
        GM.baseShadePoly(api, 4, '扇面青绿微晕', fanMtn, { baseColor: '#7ca296', baseAlpha: 0.45, shadeColor: '#d8cfb6', shadeAlpha: 0.25, depth: 4.1 });
        GM.baimiaoStroke(api, 4, '纨扇框双勾', fanRim, { closed: true, raw: true, width: 1.5, color: '#5c4328', depth: 4.1 });
        GM.baimiaoStroke(api, 4, '漆木扇柄', [[fanX + 34, fanY + 44], [fanX + 76, fanY + 96]], { width: 3.2, color: '#42291c', depth: 4.1 });

        // Right Embroidered Cuff + Slender Forearm + Emerald Bangle & Fingers clasping Fan Handle!
        const rightCuff = GM.catmullRom([[502, 488], [526, 488], [528, 532], [498, 530]], 4, true);
        GM.baseShadePoly(api, 4, '右广袖锦缘', rightCuff, { baseColor: '#f2e0ba', baseAlpha: 0.97, depth: 4.15 });
        GM.baimiaoStroke(api, 4, '右袖缘勾勒', rightCuff, { closed: true, raw: true, width: 0.85, color: '#6b4d2b', depth: 4.15 });
        const rightArm = GM.catmullRom([[508, 498], [468, 482], [452, 488], [460, 508], [506, 524]], 4, true);
        GM.baseShadePoly(api, 4, '右执扇素腕', rightArm, { baseColor: '#f8e6d9', baseAlpha: 0.98, depth: 4.2 });
        GM.baimiaoStroke(api, 4, '右素手轮廓', rightArm, { closed: true, raw: true, width: 0.9, color: '#6b4536', depth: 4.2 });
        // Delicate finger creases gripping fan handle
        GM.baimiaoStroke(api, 5, '执扇纤指纹', [[456, 492], [466, 495], [466, 502]], { width: 0.68, color: '#6b4536', alpha: 0.72, depth: 4.3 });
        // Jade wrist bracelet (翡翠手镯)
        GM.baimiaoStroke(api, 5, '腕间翠玉镯', [[486, 491], [484, 518]], { width: 3.4, color: P.malachiteMid, alpha: 0.9, depth: 4.3 });

        GM.baimiaoStroke(api, 5, '扇面山水远峰', [[fanX - 42, fanY + 14], [fanX - 20, fanY - 12], [fanX + 2, fanY + 2], [fanX + 26, fanY - 18], [fanX + 46, fanY + 10]], {
          width: 0.85, color: '#4b5b52', alpha: 0.72, depth: 4.4
        });
        GM.baimiaoStroke(api, 5, '扇面水波小舟', [[fanX - 28, fanY + 28], [fanX + 24, fanY + 26]], { width: 0.7, color: '#697268', alpha: 0.56, depth: 4.4 });
        GM.pushRaw(api, 5, '扇面朱印细点', (c) => {
          c.save(); c.fillStyle = GM.rgbaStr('#a82e24', 0.88);
          c.beginPath(); c.arc(fanX + 32, fanY + 18, 2.5, 0, GM.TAU); c.fill(); c.restore();
        }, 'seal', 4.5);
        GM.goldFiligreeStroke(api, 5, '扇框泥金', fanRim, { raw: true, width: 0.85, alpha: 0.65, depth: 4.5 });

        GM.finalizeGongbiBudget(api, rng, W, H, {
          target: 8500, minTarget: 7000, maxTarget: 9600,
          focusX: 465, focusY: 560, focusR: 350, haloLight: true,
          inscription: { x: 145, y: 145, text: '清秋纨扇', opts: { size: 32, stepY: 42, color: '#2b221a' } },
          seal: { x: 145, y: 355, text: '佳人', opts: { size: 40, color: '#9c2d23' } }
        });
      }
    },

    // =========================================================================
    // 10. 工笔·金碧青绿重彩 (Song Terrace Crags, Hooked Clouds & Mixed Shoreline Trees)
    // =========================================================================
    {
      id: 'gongbi-gold-green-hills',
      title: '工笔·金碧青绿重彩',
      subtitle: '盛唐李思训《江帆楼阁》与王希孟《千里江山》：垛石叠峰自然入水 → 勾云瑞岚 → 三叠飞瀑杂木',
      group: '国画·工笔',
      category: '工笔山水',
      seal: '金碧重彩',
      mode: 'gongbi',
      width: 1200,
      height: 820,
      seed: 1010,
      swatches: ['rgb(235, 224, 200)', 'rgb(28, 72, 138)', 'rgb(42, 128, 86)', 'rgb(218, 172, 62)', 'rgb(192, 54, 38)'],
      desc: '师李思训与王希孟金碧青绿山水法度，以宋代垛石坡脚法构建重峦叠嶂并自然舒缓入水；改平直白带为传统双勾祥云瑞岚，三叠飞瀑自石涧曲折而下，杂木霜枫点缀岩岸，泥金分勾向阳山棱。',
      layers: GONGBI_LAYERS,
      analysis: {
        original: '盛唐李思训《江帆楼阁图》与北宋王希孟《千里江山图》',
        movement: '唐宋金碧青绿重彩山水',
        palette: '金茶古绢 · 赭石暖底 · 头绿二绿 · 头青三青 · 朱砂红叶 · 泥金',
        technique: '宋代垛石法山峦 · 坡脚入水汀渚 · 双勾祥云 · 三叠山涧瀑 · 杂树秋叶',
        algorithm: '用多层级岩体块面替代连续锯齿三角，加入石粉矿物颗粒肌理；改直条横云为双勾卷云，曲折峡谷承托飞瀑，山畔穿插古松、丹枫与墨柏。'
      },
      buildStrokes(api) {
        ensureGM();
        const rng = GM.makeRng(1010);
        const W = 1200, H = 820;

        GM.silkHaloGround(api, 2, W, H, rng, {
          count: 420, focusX: 640, focusY: 360, focusR: 420,
          haloLight: true, warmColor: P.silkAmber, coolColor: '#6b7e76'
        });

        // Stacked Layered Mountain Terrace Builder (Song 披麻/斧劈皴 + 青绿叠加 + 赭石舒缓坡脚)
        function paintMountainTerrace(polyOutline, ridgePts, opts) {
          const {
            label,
            peakColor = P.azuriteDeep,
            slopeColor = P.malachiteDeep,
            underColor = '#b07b4c',
            goldEdge = true,
            facetCount = 6,
            depth = 1
          } = opts;

          const bounds = GM.polyBounds(polyOutline);
          GM.baimiaoStroke(api, 1, label + '铁线勾斫', ridgePts, { raw: true, width: 1.35, color: P.inkDeep, alpha: 0.84, style: 'rock', chunkSize: 8, depth });
          GM.baseShadePoly(api, 2, label + '赭石石绿统染', polyOutline, {
            baseColor: slopeColor, baseAlpha: 0.95,
            shadeColor: underColor, shadeAlpha: 0.48,
            gradFrom: [bounds.cx, bounds.maxY], gradTo: [bounds.cx, bounds.minY], depth
          });
          GM.fenranRegion(api, 3, label + '头青石青顶峰', polyOutline, rng, {
            count: Math.round(facetCount * 22),
            colorFrom: peakColor, colorTo: slopeColor,
            gradFrom: [bounds.cx, bounds.minY], gradTo: [bounds.cx, bounds.maxY],
            bias: 'from', alphaMin: 0.06, alphaMax: 0.22, dabScale: 1.5, mineralGrain: true, depth
          });
          GM.fenranRegion(api, 3, label + '石绿山坡分染', polyOutline, rng, {
            count: Math.round(facetCount * 16),
            colorFrom: P.malachiteDeep, colorTo: P.malachitePale,
            gradFrom: [bounds.cx, bounds.maxY], gradTo: [bounds.cx, bounds.minY],
            bias: 'from', alphaMin: 0.045, alphaMax: 0.16, dabScale: 1.45, mineralGrain: true, depth
          });

          // Multi-strand Song Hemp-Fiber & Small Axe-Cut Crag Veins clipped strictly inside mountain silhouette!
          for (let f = 1; f < ridgePts.length - 1; f++) {
            const p = ridgePts[f];
            if (f % 2 === 0 && rng() > 0.45) continue;
            const veinCount = 2 + Math.floor(rng() * 3);
            const slopeDir = p[0] < bounds.cx ? 1 : -1;
            for (let v = 0; v < veinCount; v++) {
              const sx = p[0] + (v - veinCount * 0.5) * 7 + (rng() - 0.5) * 6;
              const sy = p[1] + 10 + v * 5;
              const drop = 24 + rng() * Math.min(95, (bounds.maxY - sy) * 0.52);
              const ex = sx + slopeDir * (14 + rng() * 26);
              const ey = Math.min(bounds.maxY - 12, sy + drop);
              const mx = GM.lerp(sx, ex, 0.52) + slopeDir * 3;
              const my = GM.lerp(sy, ey, 0.48) - 3;
              if (!GM.pointInPoly(sx, sy, polyOutline) || !GM.pointInPoly(ex, ey, polyOutline)) continue;
              GM.baimiaoStroke(api, 4, label + '披麻斧劈皴', [[sx, sy], [mx, my], [ex, ey]], {
                width: 0.85, color: '#243028', alpha: 0.44 + rng() * 0.18, style: 'rock', depth
              });
            }
          }

          if (goldEdge) {
            GM.goldFiligreeStroke(api, 5, label + '泥金勾阳面山棱', ridgePts, { raw: true, width: 1.55, alpha: 0.78, chunkSize: 8, depth });
          }
        }

        // Far Grand Song Mountain Range (Natural broad craggy shoulder + towering main Azurite peak!)
        const farRidge = GM.catmullRom([
          [145, 418], [218, 355], [278, 312], [335, 326], [392, 265], [462, 245], [528, 288],
          [596, 256], [664, 212], [732, 232], [802, 175], [875, 132], [938, 152], [1005, 196], [1065, 178], [1142, 248], [1205, 322]
        ], 2, false);
        const farPoly = [...farRidge, [1205, 438], [860, 432], [520, 424], [140, 426]];
        paintMountainTerrace(farPoly, farRidge, { label: '远峰雄峙', peakColor: '#194678', slopeColor: '#488869', underColor: '#b58354', goldEdge: true, facetCount: 12, depth: 0.8 });

        // Hooked Unified Song Mist Cloud Bands hovering naturally across far valley saddles!
        GM.drawAuspiciousCloud(api, rng, { cx: 360, cy: 392, width: 340, height: 34, curls: 4, goldRim: false, depth: 1.2 });
        GM.drawAuspiciousCloud(api, rng, { cx: 885, cy: 382, width: 370, height: 36, curls: 4, goldRim: true, depth: 1.2 });

        // Mid-Ground Interlocking Crags dipping cleanly with stepped rocky shore promontories!
        const midLeftRidge = GM.catmullRom([
          [75, 542], [135, 488], [202, 418], [285, 352], [358, 372], [418, 412], [492, 368], [556, 354], [608, 396]
        ], 2, false);
        const midLeftPoly = [...midLeftRidge, [612, 518], [545, 535], [452, 526], [362, 546], [248, 534], [142, 552], [65, 548]];
        paintMountainTerrace(midLeftPoly, midLeftRidge, { label: '左中景峦', peakColor: '#1d4c85', slopeColor: P.malachiteMid, underColor: P.sienna, goldEdge: true, facetCount: 8, depth: 1.6 });

        const midRightRidge = GM.catmullRom([
          [644, 392], [708, 336], [768, 282], [835, 316], [902, 296], [968, 262], [1048, 326], [1135, 398], [1205, 445]
        ], 2, false);
        const midRightPoly = [...midRightRidge, [1205, 548], [1072, 540], [952, 552], [822, 534], [705, 546], [642, 522]];
        paintMountainTerrace(midRightPoly, midRightRidge, { label: '右中景峦', peakColor: '#1d4c85', slopeColor: P.malachiteMid, underColor: P.sienna, goldEdge: true, facetCount: 9, depth: 1.8 });

        // Crisp angular cliff cleft notches flanking the Two-Tiered Gorge Waterfall (NO round black blob!)
        const gorgeLeft = [[590, 392], [614, 392], [612, 466], [608, 528], [588, 524]];
        const gorgeRight = [[640, 388], [662, 392], [658, 526], [646, 528], [644, 444]];
        [gorgeLeft, gorgeRight].forEach(gp => {
          GM.baseShadePoly(api, 2, '涧壁青石阴面', gp, { baseColor: '#455c4f', baseAlpha: 0.86, shadeColor: '#25332b', shadeAlpha: 0.5, depth: 1.85 });
        });
        const fallsPoly = GM.catmullRom([
          [606, 394], [642, 390], [644, 446], [622, 466], [648, 528], [610, 530], [606, 466], [612, 434]
        ], 3, true);
        GM.baseShadePoly(api, 3, '曲折山涧飞瀑', fallsPoly, { baseColor: P.clamWhite, baseAlpha: 0.96, shadeColor: '#b5d2cf', shadeAlpha: 0.38, depth: 2.0 });
        for (let w = 0; w < 6; w++) {
          const t = w / 5;
          GM.baimiaoStroke(api, 4, '瀑布银丝', [[608 + t * 28, 396], [612 + t * 22, 460], [616 + t * 26, 526]], {
            width: 0.72, color: '#5c787c', alpha: 0.54, depth: 2.1
          });
        }
        // Soft swirling Waterfall Mist & Foam Pool Ripples at canyon foot!
        GM.drawAuspiciousCloud(api, rng, { cx: 430, cy: 528, width: 300, height: 32, curls: 4, depth: 2.2 });
        GM.drawAuspiciousCloud(api, rng, { cx: 815, cy: 530, width: 320, height: 32, curls: 4, goldRim: true, depth: 2.2 });
        for (let sp = 0; sp < 4; sp++) {
          const rx = 24 + sp * 11, ry = 5 + sp * 2.5;
          const rPts = [];
          for (let a = 0; a <= 14; a++) {
            const th = (a / 14) * GM.TAU;
            rPts.push([628 + Math.cos(th) * rx, 536 + Math.sin(th) * ry]);
          }
          GM.baimiaoStroke(api, 4, '瀑潭激浪纹', rPts, { closed: true, raw: true, width: 0.72, color: P.clamWhite, alpha: 0.65 - sp * 0.1, depth: 2.25 });
        }

        // Foreground Left Promontory, Mid-River Islet & Right Rocky Shore Bank tapering smoothly into river!
        const foreLeftRidge = GM.catmullRom([
          [-15, 682], [68, 612], [148, 558], [238, 545], [322, 608], [392, 695], [442, 815]
        ], 2, false);
        paintMountainTerrace([...foreLeftRidge, [-15, 825]], foreLeftRidge, {
          label: '近景翠岩', peakColor: P.malachiteDeep, slopeColor: '#569c72', underColor: P.ochre, goldEdge: true, facetCount: 7, depth: 3.0
        });
        const isletRidge = GM.catmullRom([[482, 695], [518, 636], [558, 622], [605, 656], [632, 695]], 2, false);
        paintMountainTerrace([...isletRidge, [482, 702]], isletRidge, {
          label: '江心奇石', peakColor: P.malachiteDeep, slopeColor: '#6da678', underColor: '#9c7852', goldEdge: true, facetCount: 4, depth: 3.1
        });
        const rightBankRidge = GM.catmullRom([[880, 752], [965, 668], [1068, 642], [1152, 668], [1215, 705]], 2, false);
        paintMountainTerrace([...rightBankRidge, [1215, 825], [880, 825]], rightBankRidge, {
          label: '右岸青渚', peakColor: P.azuriteMid, slopeColor: P.malachiteMid, underColor: P.ochre, goldEdge: true, facetCount: 6, depth: 3.1
        });

        // Song Tiered Pavilions & Cross-Piling Wooden Trestle Bridge
        function drawPavilion(px, py, sc = 1.0, depth = 3.5) {
          GM.baseShadePoly(api, 3, '水阁石台基', GM.catmullRom([[px - 44 * sc, py + 8 * sc], [px + 44 * sc, py + 8 * sc], [px + 38 * sc, py], [px - 38 * sc, py]], 2, true), {
            baseColor: '#b5a284', baseAlpha: 0.92, shadeColor: '#6b5c48', shadeAlpha: 0.4, depth: depth - 0.1
          });
          [[-32, 0], [-14, 0], [14, 0], [32, 0]].forEach(([dx]) => {
            GM.baimiaoStroke(api, 4, '楼阁朱柱', [[px + dx * sc, py], [px + dx * sc, py - 34 * sc]], { width: 3.0 * sc, color: P.cinnabar, depth });
          });
          GM.baimiaoStroke(api, 4, '朱栏', [[px - 38 * sc, py - 10 * sc], [px + 38 * sc, py - 10 * sc]], { width: 2.0 * sc, color: P.cinnabar, depth });
          [{ y: py - 34 * sc, hw: 44 * sc, h: 18 * sc }, { y: py - 56 * sc, hw: 32 * sc, h: 16 * sc }].forEach(rf => {
            const roofPoly = GM.catmullRom([
              [px - rf.hw * 1.15, rf.y + 4 * sc], [px - rf.hw * 0.55, rf.y - rf.h * 0.55], [px, rf.y - rf.h],
              [px + rf.hw * 0.55, rf.y - rf.h * 0.55], [px + rf.hw * 1.15, rf.y + 4 * sc], [px, rf.y + 6 * sc]
            ], 4, true);
            GM.baimiaoStroke(api, 1, '飞檐轮廓', roofPoly, { closed: true, raw: true, width: 1.1, color: P.inkDeep, depth });
            GM.baseShadePoly(api, 3, '飞檐石青黛瓦', roofPoly, { baseColor: '#294c6b', baseAlpha: 0.96, shadeColor: P.azuriteDeep, shadeAlpha: 0.45, depth });
            GM.goldFiligreeStroke(api, 5, '殿脊泥金', [[px - rf.hw * 1.1, rf.y + 3 * sc], [px, rf.y - rf.h], [px + rf.hw * 1.1, rf.y + 3 * sc]], { width: 1.25, depth: depth + 0.2 });
          });
        }
        drawPavilion(235, 552, 1.0, 3.6);
        drawPavilion(805, 515, 0.72, 2.5);

        GM.baimiaoStroke(api, 4, '栈桥扶栏', [[332, 616], [428, 624], [522, 642]], { width: 2.0, color: '#6b3822', depth: 3.4 });
        GM.baimiaoStroke(api, 4, '栈桥桥面', [[332, 626], [428, 634], [522, 650]], { width: 2.8, color: '#9c623a', depth: 3.4 });
        for (let p = 0; p < 7; p++) {
          const bx = 345 + p * 26, by = 622 + Math.sin(p / 6 * Math.PI) * -4 + p * 3.8;
          GM.baimiaoStroke(api, 4, '栈桥木桩', [[bx, by], [bx, by + 26]], { width: 1.7, color: '#5c341d', depth: 3.4 });
        }

        // Mixed Multi-Species Song Trees: Gnarled Pine Groves + Rich Autumn Cinnabar Maples + Ink Cypresses!
        function drawHillTree(tx, ty, kind, sc = 1.0, depth = 3.5) {
          const trunk = [[tx, ty + 24 * sc], [tx - 5 * sc, ty + 8 * sc], [tx + 3 * sc, ty - 6 * sc]];
          GM.baimiaoStroke(api, 1, '岩树虬干', trunk, { width: 2.8 * sc, color: P.inkDeep, depth });
          GM.baimiaoStroke(api, 1, '左分杈', [[tx - 2 * sc, ty + 6 * sc], [tx - 16 * sc, ty - 6 * sc]], { width: 1.6 * sc, color: P.inkDeep, depth });
          GM.baimiaoStroke(api, 1, '右分杈', [[tx + 1 * sc, ty + 4 * sc], [tx + 15 * sc, ty - 8 * sc]], { width: 1.6 * sc, color: P.inkDeep, depth });
          if (kind === 'pine') {
            [[tx - 16 * sc, ty - 8 * sc], [tx + 2 * sc, ty - 14 * sc], [tx + 16 * sc, ty - 10 * sc]].forEach(([cx, cy]) => {
              drawPineCluster(api, rng, cx, cy, -Math.PI * 0.5, 22 * sc, 24, '#1b4732', '#356e4d', depth + 0.05);
            });
          } else {
            const palette = kind === 'maple'
              ? [P.cinnabar, '#d96932', P.burntOchre, '#e89d42']
              : ['#214534', '#2e5c45', '#172b22', P.oliveDark];
            const dotN = Math.round(38 * sc);
            for (let d = 0; d < dotN; d++) {
              const rx = tx + (rng() - 0.5) * 38 * sc;
              const ry = ty - 10 * sc + (rng() - 0.5) * 24 * sc;
              const col = GM.rgbaStr(palette[Math.floor(rng() * palette.length)], 0.86);
              const dr = (2.2 + rng() * 2.2) * sc;
              GM.pushRaw(api, 4, kind === 'maple' ? '层林丹枫点叶' : '青柏浓墨点叶', (c) => {
                c.save(); c.fillStyle = col;
                c.beginPath(); c.ellipse(rx, ry, dr * 1.25, dr * 0.85, (rng() - 0.5) * 1.2, 0, GM.TAU); c.fill(); c.restore();
              }, 'moss', depth + 0.08);
            }
          }
        }
        drawHillTree(115, 580, 'pine', 1.1, 3.5);
        drawHillTree(165, 558, 'cypress', 1.0, 3.5);
        drawHillTree(295, 592, 'pine', 0.95, 3.5);
        drawHillTree(96, 622, 'maple', 1.05, 3.5);
        drawHillTree(318, 622, 'maple', 0.92, 3.5);
        drawHillTree(556, 622, 'pine', 0.78, 3.5);
        drawHillTree(1055, 628, 'pine', 1.05, 3.5);
        drawHillTree(995, 646, 'maple', 1.0, 3.5);
        drawHillTree(1122, 648, 'cypress', 0.9, 3.5);
        drawHillTree(760, 514, 'maple', 0.72, 2.55);
        drawHillTree(535, 342, 'cypress', 0.68, 2.1);
        drawHillTree(760, 272, 'pine', 0.72, 2.1);

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
              raw: true, width: 0.72, color: rng() > 0.3 ? '#6b7e76' : P.goldWarm, alpha: 0.48, depth: 2.3
            });
          }
        }

        [[665, 655, 1.0], [805, 605, 0.78]].forEach(([sx, sy, sc]) => {
          const hull = [[sx - 24 * sc, sy], [sx + 24 * sc, sy], [sx + 16 * sc, sy + 7 * sc], [sx - 18 * sc, sy + 7 * sc]];
          const sail = [[sx - 6 * sc, sy - 2 * sc], [sx - 10 * sc, sy - 38 * sc], [sx + 10 * sc, sy - 34 * sc], [sx + 8 * sc, sy - 2 * sc]];
          GM.baimiaoStroke(api, 1, '江帆船身', hull, { closed: true, raw: true, width: 1.0, color: P.inkDeep, depth: 3.5 });
          GM.baseShadePoly(api, 3, '木舟色', hull, { baseColor: '#7a5232', baseAlpha: 0.94, depth: 3.5 });
          GM.baimiaoStroke(api, 1, '白帆双勾', sail, { closed: true, raw: true, width: 0.9, color: P.inkPale, depth: 3.6 });
          GM.baseShadePoly(api, 4, '白帆蛤粉', sail, { baseColor: P.clamWhite, baseAlpha: 0.96, shadeColor: '#d9ccb2', shadeAlpha: 0.35, depth: 3.6 });
          GM.baimiaoStroke(api, 4, '船帆桅杆', [[sx, sy], [sx, sy - 44 * sc]], { width: 1.0, color: P.inkDeep, depth: 3.6 });
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
