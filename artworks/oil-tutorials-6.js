(function () {
  'use strict';

  const lerp = (a, b, t) => a + (b - a) * t;

  function drawTubeCurve(ctx, pts, radius, colLit, colDark) {
    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    // Core shadow tube
    ctx.strokeStyle = colDark;
    ctx.lineWidth = radius * 2;
    ctx.beginPath();
    ctx.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
    ctx.stroke();
    // Lit inner top-left ridge
    ctx.strokeStyle = colLit;
    ctx.lineWidth = radius * 0.9;
    ctx.beginPath();
    ctx.moveTo(pts[0][0] - radius * 0.25, pts[0][1] - radius * 0.25);
    for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0] - radius * 0.25, pts[i][1] - radius * 0.25);
    ctx.stroke();
    ctx.restore();
  }

  const WORKS = [
    // =========================================================================
    // 1. DUTCH GOLDEN AGE: PEWTER EWER, ROEMER GOBLET & SPIRAL PEELED LEMON
    // =========================================================================
    {
      id: 'oil-tut-still-dutch',
      title: '经典油画教程·荷兰古典银壶柠檬静物',
      subtitle: '荷兰黄金时代多层罩染法（3D器皿光影 + 5000笔方向性堆彩）：熟褐底 → 银壶与青釉杯 → 天鹅绒帘 → 螺旋柠檬皮高光',
      group: '油画·经典教程',
      category: '古典静物教程',
      seal: '荷兰罩染',
      mode: 'oil',
      theme: 'gallery-dark',
      backdropColor: '#17120c',
      width: 920,
      height: 1120,
      seed: 9001,
      swatches: ['rgb(32, 24, 18)', 'rgb(154, 162, 168)', 'rgb(64, 108, 72)', 'rgb(244, 204, 48)', 'rgb(118, 32, 36)'],
      desc: '经典西方学院派古典静物教程（荷兰黄金时代风格）：严格呈现有色底、单色塑形、冷暖罩染与金属银壶/绿玻璃杯的折射与柠檬环境反光，点睛悬垂螺旋柠檬皮。',
      layers: [
        { id: 1, name: '一 · 熟褐有色底与暗调空间' },
        { id: 2, name: '二 · 构图投影与单色明暗底稿' },
        { id: 3, name: '三 · 银壶、绿釉杯与柠檬塑形' },
        { id: 4, name: '四 · 勃艮第帷幕与器皿罩染反光' },
        { id: 5, name: '五 · 窗格高光与螺旋柠檬皮点睛' }
      ],
      buildStrokes(api) {
        const M = window.Code2PaintOilMaster;
        const W = 920, H = 1120;
        const scene = M.createScene(W, H, 9001);

        // Wall & walnut beveled tabletop + contact cast shadows
        scene.shadeBackdropWallTable({
          horizonY: 716,
          lightX: 210,
          lightY: 220,
          wallLit: [56, 42, 30],
          wallMid: [28, 20, 15],
          wallDark: [12, 9, 7],
          tableType: 'wood',
          tableLit: [106, 72, 42],
          tableMid: [62, 40, 24],
          tableDark: [20, 13, 9],
          tableEdgeY: 1020,
          castShadows: [
            { cx: 565, cy: 796, rx: 220, ry: 54, rot: 0.04, strength: 0.80, col: [12, 9, 7] },
            { cx: 430, cy: 778, rx: 100, ry: 28, rot: 0.02, strength: 0.86, col: [10, 7, 5] }
          ]
        });

        // Draped Burgundy velvet curtain upper-left with 3D fold highlights
        scene.shadeDrapery({
          poly: [[0, 0], [338, 0], [275, 290], [218, 520], [0, 505]],
          colLit: [158, 36, 44],
          colMid: [88, 18, 24],
          colDark: [22, 7, 9],
          foldFreq: 0.056,
          foldAngle: 0.16,
          feather: 14,
          alpha: 0.96
        });

        // 3D Lathe Metallic Silver/Pewter Pitcher Ewer (center cx=405, 315..780)
        // Draw S-handle & spout first so body joins seamlessly
        scene.draw2D((ctx) => {
          const handlePts = [[368, 376], [284, 378], [248, 438], [246, 514], [286, 588], [326, 628]];
          drawTubeCurve(ctx, handlePts, 10, '#c8d0d6', '#383c42');
          const spoutPts = [[448, 342], [508, 314], [492, 358], [446, 378]];
          drawTubeCurve(ctx, spoutPts, 9, '#d2d8de', '#44484e');
        });
        scene.shadeLathe3D({
          cx: 405,
          topY: 318,
          botY: 780,
          material: 'metal',
          openTopRim: true,
          profile: [
            [0.00, 58], [0.06, 46], [0.24, 36], [0.36, 64],
            [0.54, 108], [0.72, 100], [0.85, 62], [0.92, 46], [1.00, 74]
          ],
          colLit: [218, 224, 230],
          colMid: [112, 118, 126],
          colDark: [26, 28, 32],
          bounceCol: [216, 178, 72],
          bounceStrength: 0.58,
          specCol: [255, 253, 248]
        });

        // 3D Green Roemer Wine Glass with translucent white wine & studded prunts
        scene.shadeLathe3D({
          cx: 652,
          topY: 498,
          botY: 772,
          material: 'glass',
          openTopRim: true,
          profile: [
            [0.00, 54], [0.18, 56], [0.38, 46], [0.44, 16],
            [0.82, 16], [0.92, 44], [1.00, 54]
          ],
          colLit: [172, 214, 166],
          colMid: [66, 118, 74],
          colDark: [22, 46, 28],
          liquidLevel: 0.14,
          liquidBot: 0.39,
          liquidCol: [204, 178, 78]
        });
        scene.draw2D((ctx) => {
          // Prunt glass studs & elliptical bright glass rim
          ctx.strokeStyle = 'rgba(218, 242, 216, 0.72)';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.ellipse(652, 502, 54, 11, 0, 0, Math.PI * 2);
          ctx.stroke();
          [[644, 650], [660, 668], [648, 690]].forEach(([px, py]) => {
            ctx.fillStyle = '#a4cfa0';
            ctx.beginPath(); ctx.arc(px, py, 4.5, 0, Math.PI * 2); ctx.fill();
          });
        });

        // Delft Blue-and-White Porcelain Plate (perspective disc)
        scene.draw2D((ctx) => {
          const pg = ctx.createRadialGradient(475, 795, 18, 520, 810, 152);
          pg.addColorStop(0, '#eef2f6');
          pg.addColorStop(0.65, '#cad2dc');
          pg.addColorStop(1, '#5d6b7d');
          ctx.fillStyle = pg;
          ctx.beginPath();
          ctx.ellipse(518, 808, 150, 42, 0, 0, Math.PI * 2);
          ctx.fill();
          // Cobalt blue Delft border ring
          ctx.strokeStyle = 'rgba(42, 76, 138, 0.78)';
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.ellipse(518, 809, 132, 34, 0, 0, Math.PI * 2);
          ctx.stroke();
        });

        // 3D Dimpled Golden Lemon + Spiraling Peeled Rind Cascading Over Table Front Edge
        scene.shadeFruit3D({
          cx: 508, cy: 766, rx: 52, ry: 40,
          kind: 'lemon',
          colLit: [254, 224, 68],
          colMid: [224, 168, 26],
          colShadow: [108, 68, 14],
          bounceCol: [198, 186, 132],
          specCol: [255, 250, 214],
          shininess: 30,
          specStrength: 0.76
        });

        scene.draw2D((ctx) => {
          ctx.lineCap = 'round';
          // Cast shadow under hanging spiral peel onto wood tabletop
          ctx.strokeStyle = 'rgba(18, 11, 7, 0.55)';
          ctx.lineWidth = 18;
          ctx.beginPath();
          ctx.moveTo(492, 792);
          ctx.bezierCurveTo(548, 822, 488, 868, 558, 922);
          ctx.quadraticCurveTo(514, 976, 540, 1020);
          ctx.stroke();

          // Hanging yellow peel outer body
          ctx.strokeStyle = '#ebc02a';
          ctx.lineWidth = 19;
          ctx.beginPath();
          ctx.moveTo(482, 782);
          ctx.bezierCurveTo(540, 814, 480, 864, 550, 916);
          ctx.quadraticCurveTo(506, 972, 534, 1016);
          ctx.stroke();

          // Pith ivory inner edge catching left light
          ctx.strokeStyle = '#f8f0d2';
          ctx.lineWidth = 7.5;
          ctx.beginPath();
          ctx.moveTo(485, 786);
          ctx.bezierCurveTo(532, 820, 486, 868, 542, 918);
          ctx.quadraticCurveTo(508, 968, 528, 1004);
          ctx.stroke();
        });

        M.synthesize(api, scene, {
          style: 'classic',
          totalStrokes: 5000,
          seed: 9001,
          layers: WORKS[0].layers,
          roi: [
            { cx: 405, cy: 560, rx: 165, ry: 220, boost: 3.4 },
            { cx: 652, cy: 615, rx: 75, ry: 155, boost: 3.2 },
            { cx: 515, cy: 865, rx: 145, ry: 160, boost: 3.8 }
          ]
        });
      }
    },

    // =========================================================================
    // 2. CEZANNE CONSTRUCTIVE STILL LIFE: COMPOTE BOWL, JAR & WHITE TABLECLOTH
    // =========================================================================
    {
      id: 'oil-tut-still-cezanne',
      title: '经典油画教程·塞尚结构果盘与白布',
      subtitle: '塞尚现代结构块面法（3D块面与折叠布 + 5000笔平行斜向构形）：冷暖墙面 → 陶罐与瓷盘 → 苹果梨块面 → 折皱白布 → 普鲁士蓝勾边',
      group: '油画·经典教程',
      category: '现代结构静物教程',
      seal: '塞尚块面',
      mode: 'oil',
      theme: 'gallery-dark',
      backdropColor: '#252620',
      width: 1120,
      height: 820,
      seed: 9002,
      swatches: ['rgb(164, 176, 152)', 'rgb(236, 236, 232)', 'rgb(112, 138, 168)', 'rgb(212, 68, 38)', 'rgb(24, 52, 88)'],
      desc: '保罗·塞尚现代主义结构静物教程：平行斜向短笔组织冷暖灰绿墙面、折纸般硬朗雕刻感的白桌布冷天蓝折面、高足瓷果盘与饱满苹果梨。',
      layers: [
        { id: 1, name: '一 · 浅灰暖壁与平行斜笔打底' },
        { id: 2, name: '二 · 陶罐与白瓷高足盘体块定势' },
        { id: 3, name: '三 · 平行冷暖短笔塑果盘果实' },
        { id: 4, name: '四 · 雕塑感折皱白布与冷蓝块面' },
        { id: 5, name: '五 · 普鲁士蓝结构轮廓与高光点睛' }
      ],
      buildStrokes(api) {
        const M = window.Code2PaintOilMaster;
        const W = 1120, H = 820;
        const scene = M.createScene(W, H, 9002);

        scene.shadeBackdropWallTable({
          horizonY: 488,
          lightX: 280,
          lightY: 160,
          wallLit: [188, 192, 168],
          wallMid: [152, 166, 146],
          wallDark: [108, 122, 114],
          wallNoise: 0.22,
          tableType: 'wood',
          tableLit: [176, 132, 78],
          tableMid: [134, 96, 54],
          tableDark: [82, 56, 32],
          hasBevel: false,
          castShadows: [
            { cx: 705, cy: 590, rx: 145, ry: 36, rot: 0.03, strength: 0.65, col: [48, 38, 32] },
            { cx: 295, cy: 506, rx: 95, ry: 24, rot: 0, strength: 0.62, col: [52, 42, 34] }
          ]
        });

        // Draped sculptural folded white linen cloth descending over table edge
        scene.shadeDrapery({
          poly: [[245, 502], [715, 502], [765, 820], [140, 820]],
          colLit: [248, 246, 238],
          colMid: [212, 218, 224],
          colDark: [106, 130, 164],
          foldFreq: 0.048,
          foldAngle: 0.24,
          feather: 10,
          alpha: 0.98
        });

        // Olive-glazed earthenware ginger jar on left
        scene.draw2D((ctx) => {
          drawTubeCurve(ctx, [[318, 318], [358, 338], [354, 388], [320, 405]], 7, '#a88a58', '#4a3a26');
        });
        scene.shadeLathe3D({
          cx: 256, topY: 282, botY: 506, material: 'ceramic', openTopRim: true,
          profile: [[0.0, 38], [0.12, 36], [0.30, 68], [0.65, 70], [1.0, 46]],
          colLit: [168, 152, 112], colMid: [116, 108, 76], colDark: [52, 46, 36], bounceCol: [148, 128, 98]
        });

        // White ceramic high pedestal compote fruit bowl
        scene.shadeLathe3D({
          cx: 646, topY: 406, botY: 586, material: 'ceramic', openTopRim: true,
          profile: [
            [0.00, 148], [0.18, 126], [0.36, 48], [0.42, 20],
            [0.84, 22], [0.92, 68], [1.00, 80]
          ],
          colLit: [248, 248, 242], colMid: [198, 208, 218], colDark: [96, 118, 148], bounceCol: [186, 168, 138]
        });

        // Faceted 3D fruits inside bowl & tumbled across white folded cloth
        const fruits = [
          { cx: 568, cy: 378, rx: 33, ry: 30, kind: 'apple', colLit: [248, 146, 46], colMid: [216, 56, 36], colShadow: [88, 24, 22] },
          { cx: 632, cy: 364, rx: 35, ry: 32, kind: 'peach', colLit: [252, 212, 64], colMid: [232, 146, 34], colShadow: [108, 52, 18] },
          { cx: 698, cy: 374, rx: 33, ry: 30, kind: 'apple', colLit: [236, 104, 42], colMid: [192, 42, 32], colShadow: [78, 20, 22] },
          { cx: 758, cy: 392, rx: 28, ry: 32, kind: 'pear', colLit: [204, 216, 86], colMid: [138, 168, 56], colShadow: [58, 76, 34] },
          { cx: 600, cy: 322, rx: 31, ry: 29, kind: 'apple', colLit: [250, 178, 58], colMid: [222, 68, 36], colShadow: [96, 26, 24] },
          { cx: 670, cy: 318, rx: 29, ry: 32, kind: 'pear', colLit: [212, 222, 92], colMid: [148, 178, 62], colShadow: [62, 82, 36] },
          { cx: 386, cy: 576, rx: 33, ry: 30, kind: 'apple', colLit: [246, 138, 44], colMid: [212, 50, 34], colShadow: [84, 24, 24] },
          { cx: 462, cy: 594, rx: 30, ry: 32, kind: 'pear', colLit: [208, 220, 88], colMid: [146, 176, 58], colShadow: [60, 78, 38] },
          { cx: 542, cy: 566, rx: 32, ry: 29, kind: 'peach', colLit: [252, 206, 62], colMid: [234, 142, 34], colShadow: [104, 48, 22] },
          { cx: 816, cy: 598, rx: 34, ry: 31, kind: 'apple', colLit: [232, 98, 42], colMid: [196, 44, 34], colShadow: [80, 22, 24] },
          { cx: 880, cy: 638, rx: 28, ry: 31, kind: 'pear', colLit: [196, 210, 78], colMid: [142, 168, 56], colShadow: [58, 76, 34] }
        ];
        fruits.forEach(f => {
          scene.shadeFruit3D({ ...f, bounceCol: [168, 178, 186], shininess: 22, specStrength: 0.56 });
        });

        // Subtle Prussian-blue structural contour accents
        scene.draw2D((ctx) => {
          ctx.strokeStyle = 'rgba(24, 52, 92, 0.72)';
          ctx.lineWidth = 3.5;
          ctx.beginPath();
          ctx.moveTo(498, 408); ctx.quadraticCurveTo(646, 466, 794, 408);
          ctx.stroke();
        });

        M.synthesize(api, scene, {
          style: 'cezanne',
          totalStrokes: 5000,
          seed: 9002,
          layers: WORKS[1].layers,
          roi: [
            { cx: 645, cy: 400, rx: 195, ry: 185, boost: 3.4 },
            { cx: 256, cy: 396, rx: 105, ry: 125, boost: 2.8 },
            { cx: 465, cy: 605, rx: 185, ry: 115, boost: 2.6 }
          ]
        });
      }
    },

    // =========================================================================
    // 3. MONET IMPRESSIONISM: SUNLIT POPLARS & SHIMMERING EPTE RIVER
    // =========================================================================
    {
      id: 'oil-tut-land-impression',
      title: '经典油画教程·莫奈式阳光白杨与河岸',
      subtitle: '法国印象派外光分色法（3D云水倒影 + 5000笔外光短笔）：紫青晴空 → 远岸淡紫林带 → 韵律白杨 → 河面碎笔倒影 → 柠檬金粉点彩',
      group: '油画·经典教程',
      category: '印象派风景教程',
      seal: '印象外光',
      mode: 'oil',
      theme: 'gallery-dark',
      backdropColor: '#1f2838',
      width: 1120,
      height: 820,
      seed: 9003,
      swatches: ['rgb(138, 186, 234)', 'rgb(242, 214, 198)', 'rgb(74, 134, 68)', 'rgb(218, 198, 58)', 'rgb(112, 104, 158)'],
      desc: '纯正印象派外光色分解示范（莫奈《埃普特河畔的白杨树》图式）：不用纯黑，以紫罗兰、钴蓝、玫瑰粉与柠檬绿光学并置表现夏日河畔通透明媚的天光树影。',
      layers: [
        { id: 1, name: '一 · 晴空天青粉紫渐变铺底' },
        { id: 2, name: '二 · 远岸青紫树影与河面透视' },
        { id: 3, name: '三 · 律动白杨列阵与金绿树冠' },
        { id: 4, name: '四 · 河水横向碎笔倒影与冷紫投影' },
        { id: 5, name: '五 · 暖阳柠檬黄与玫瑰粉外光点彩' }
      ],
      buildStrokes(api) {
        const M = window.Code2PaintOilMaster;
        const W = 1120, H = 820, H_Y = 486;
        const scene = M.createScene(W, H, 9003);

        scene.shadeSkyAndClouds({
          horizonY: H_Y,
          skyTop: [54, 114, 204],
          skyMid: [118, 174, 226],
          skyHorizon: [232, 208, 198],
          sunX: 240,
          sunY: 165,
          glowR: 340,
          glowCol: [252, 238, 214],
          glowStrength: 0.30,
          cloudCover: 0.38,
          cloudScale: 0.0052,
          cloudLitCol: [252, 242, 232],
          cloudDarkCol: [142, 156, 198],
          cloudBot: 310
        });

        scene.shadeMountainRange({
          baseY: H_Y,
          peaks: [[0, 466], [380, 444], [780, 456], [1120, 462]],
          rockLit: [132, 148, 162],
          rockDark: [96, 108, 148],
          snowLine: 1.5,
          mistCol: [198, 208, 224],
          mistStrength: 0.48,
          ridgeAmp: 16,
          ridgeFreq: 0.015
        });

        // Calm river mirroring sky & rose highlights
        scene.shadeOcean({
          yTop: H_Y,
          yBot: H,
          seaTop: [164, 194, 224],
          seaMid: [118, 158, 212],
          seaBot: [86, 132, 196],
          sunX: 280,
          glitterCol: [248, 232, 168],
          glitterSpread: 480,
          glitterStrength: 0.36,
          waveScale: 0.022
        });

        // Graceful S-curve Poplars along green riverbank + soft shimmering vertical reflections
        const trees = [
          { x: 175, topY: 58, w: 72 }, { x: 312, topY: 94, w: 64 }, { x: 436, topY: 132, w: 56 },
          { x: 545, topY: 170, w: 48 }, { x: 642, topY: 202, w: 42 }, { x: 730, topY: 226, w: 36 },
          { x: 810, topY: 244, w: 32 }, { x: 882, topY: 262, w: 28 }
        ];
        scene.draw2D((ctx, w, h, N) => {
          // Meadow riverbank grass strip
          ctx.fillStyle = '#5c8c46';
          ctx.fillRect(0, H_Y - 8, w, 14);
          ctx.fillStyle = '#8cb64e';
          ctx.fillRect(0, H_Y - 8, w, 5);

          trees.forEach((tr, idx) => {
            // Poplar trunk (warm left, violet-grey right — zero pure black!)
            ctx.strokeStyle = '#6c5e74';
            ctx.lineWidth = Math.max(5, 13 - idx * 1.1);
            ctx.beginPath();
            ctx.moveTo(tr.x, H_Y);
            ctx.lineTo(tr.x + (idx % 2 ? -4 : 4), tr.topY + 42);
            ctx.stroke();

            // Feathery irregular sunlit & violet-shadowed poplar crown
            const crownBot = H_Y - 90 + (idx % 3) * 10;
            for (let k = 0; k < 28; k++) {
              const frac = N.rand();
              const cy = lerp(crownBot, tr.topY + 8, frac);
              const env = Math.sin(frac * Math.PI * 0.92 + 0.12);
              const rad = tr.w * (0.28 + env * 0.56) * (0.65 + N.rand() * 0.55);
              const ox = (N.rand() - 0.5) * rad * 0.85;
              const isLit = ox < 0 || N.rand() < 0.45;
              ctx.fillStyle = isLit
                ? (N.rand() < 0.4 ? 'rgba(218, 214, 68, 0.86)' : 'rgba(122, 178, 56, 0.86)')
                : (N.rand() < 0.5 ? 'rgba(48, 98, 72, 0.84)' : 'rgba(78, 92, 132, 0.78)');
              ctx.beginPath();
              ctx.ellipse(tr.x + ox, cy, rad * 0.55, rad * 0.42, (N.rand() - 0.5) * 0.8, 0, Math.PI * 2);
              ctx.fill();
            }

            // Shimmering broken vertical river reflection column beneath each tree
            const reflMax = Math.min(H - 18, H_Y + (H_Y - tr.topY) * 0.82);
            for (let ry = H_Y + 12; ry < reflMax; ry += 9) {
              const t = (ry - H_Y) / Math.max(1, reflMax - H_Y);
              const rw = tr.w * (0.35 + 0.45 * Math.sin(t * Math.PI)) * (0.7 + N.rand() * 0.5);
              const sway = Math.sin(ry * 0.09 + idx) * (6 + t * 10);
              ctx.fillStyle = (ry + idx) % 3 === 0 ? 'rgba(72, 128, 96, 0.52)'
                : ((ry + idx) % 3 === 1 ? 'rgba(138, 172, 86, 0.48)' : 'rgba(116, 124, 178, 0.44)');
              ctx.fillRect(tr.x - rw * 0.5 + sway, ry, rw, 5);
            }
          });
        });

        M.synthesize(api, scene, {
          style: 'impressionist',
          totalStrokes: 5000,
          seed: 9003,
          layers: WORKS[2].layers,
          roi: [
            { cx: 380, cy: 260, rx: 310, ry: 220, boost: 3.2 },
            { cx: 460, cy: 625, rx: 380, ry: 165, boost: 2.4 }
          ]
        });
      }
    },

    // =========================================================================
    // 4. HUDSON RIVER ROMANTICISM: ALPINE SNOW PEAKS, WATERFALL & PINES
    // =========================================================================
    {
      id: 'oil-tut-land-hudson',
      title: '经典油画教程·古典浪漫派雪山飞瀑',
      subtitle: '哈德逊河派大气透视法（3D山体雪脊 + 5000笔经典描绘）：暮金霞云 → 巍峨雪峰 → 苍翠峡谷碧潭 → 悬崖飞瀑白雾 → 前景苍松',
      group: '油画·经典教程',
      category: '浪漫风景教程',
      seal: '浪漫雪瀑',
      mode: 'oil',
      theme: 'gallery-dark',
      backdropColor: '#1b1d24',
      width: 1120,
      height: 820,
      seed: 9004,
      swatches: ['rgb(84, 108, 146)', 'rgb(246, 194, 112)', 'rgb(252, 244, 226)', 'rgb(34, 82, 74)', 'rgb(28, 36, 24)'],
      desc: '19世纪浪漫主义壮丽山水教程：演示“前实后虚、远冷近暖”大气透视，左侧落日金辉照亮崎岖3D冰川雪峰棱脊，飞瀑泄入翡翠冰湖，苍松岩石构图框景。',
      layers: [
        { id: 1, name: '一 · 暮金琥珀天光与霞云湿接' },
        { id: 2, name: '二 · 大气透视远山与雪脊冷暖分面' },
        { id: 3, name: '三 · 中景松林河谷与碧潭铺底' },
        { id: 4, name: '四 · 悬崖飞瀑白练与水雾漫射' },
        { id: 5, name: '五 · 前景苍松斜枝与水面碎金' }
      ],
      buildStrokes(api) {
        const M = window.Code2PaintOilMaster;
        const W = 1120, H = 820;
        const scene = M.createScene(W, H, 9004);

        scene.shadeSkyAndClouds({
          horizonY: 460,
          skyTop: [62, 84, 128],
          skyMid: [188, 138, 106],
          skyHorizon: [252, 206, 126],
          sunX: 160,
          sunY: 280,
          glowR: 480,
          glowCol: [252, 212, 138],
          glowStrength: 0.68,
          cloudCover: 0.56,
          cloudLitCol: [252, 224, 174],
          cloudDarkCol: [96, 98, 132],
          cloudBot: 290
        });

        // Distant & Hero 3D Ridged-FBM Alpine Snow Peaks lit from upper-left sunset!
        scene.shadeMountainRange({
          baseY: 445,
          peaks: [[520, 410], [690, 215], [785, 148], [945, 295], [1120, 405]],
          sunDirX: -0.78,
          sunDirY: -0.35,
          rockLit: [154, 136, 132],
          rockDark: [68, 84, 124],
          snowLit: [254, 232, 204],
          snowShadow: [108, 132, 178],
          snowLine: 0.25,
          mistCol: [198, 186, 182],
          mistStrength: 0.45,
          ridgeAmp: 42
        });
        scene.shadeMountainRange({
          baseY: 455,
          peaks: [[0, 390], [160, 295], [325, 195], [435, 92], [585, 225], [775, 425]],
          sunDirX: -0.78,
          sunDirY: -0.35,
          rockLit: [134, 118, 112],
          rockDark: [44, 58, 92],
          snowLit: [254, 240, 216],
          snowShadow: [86, 114, 164],
          snowLine: 0.28,
          mistCol: [162, 174, 194],
          mistStrength: 0.35,
          ridgeAmp: 58
        });

        // Emerald alpine glacial basin with golden evening reflections
        scene.shadeOcean({
          yTop: 550,
          yBot: H,
          seaTop: [46, 108, 96],
          seaMid: [26, 68, 66],
          seaBot: [14, 34, 38],
          sunX: 548,
          glitterCol: [248, 218, 146],
          glitterSpread: 180,
          glitterStrength: 0.48,
          waveScale: 0.028
        });

        // Evergreen gorge flanks, cascading frothy waterfall, misty splash basin & dark sentinel pines
        scene.draw2D((ctx, w, h, N) => {
          // Dark evergreen rocky gorge cliffs
          const gL = ctx.createLinearGradient(0, 390, 420, 580);
          gL.addColorStop(0, '#2a4032'); gL.addColorStop(1, '#14201a');
          ctx.fillStyle = gL;
          ctx.beginPath(); ctx.moveTo(0, 380); ctx.lineTo(440, 438); ctx.lineTo(525, 558); ctx.lineTo(0, 565); ctx.fill();

          const gR = ctx.createLinearGradient(1120, 390, 620, 580);
          gR.addColorStop(0, '#262b33'); gR.addColorStop(1, '#14171c');
          ctx.fillStyle = gR;
          ctx.beginPath(); ctx.moveTo(1120, 370); ctx.lineTo(665, 432); ctx.lineTo(575, 560); ctx.lineTo(1120, 568); ctx.fill();

          // Stepped waterfall plunge & frothy spray halo
          const wg = ctx.createLinearGradient(535, 430, 560, 608);
          wg.addColorStop(0, '#cde4ea'); wg.addColorStop(0.5, '#f6fbfb'); wg.addColorStop(1, '#ffffff');
          ctx.fillStyle = wg;
          ctx.beginPath();
          ctx.moveTo(532, 436); ctx.quadraticCurveTo(564, 436, 568, 438);
          ctx.lineTo(578, 598); ctx.lineTo(518, 598); ctx.closePath();
          ctx.fill();

          const mistG = ctx.createRadialGradient(548, 604, 12, 548, 604, 138);
          mistG.addColorStop(0, 'rgba(248, 252, 250, 0.86)');
          mistG.addColorStop(0.5, 'rgba(202, 226, 224, 0.42)');
          mistG.addColorStop(1, 'rgba(104, 152, 148, 0)');
          ctx.fillStyle = mistG;
          ctx.beginPath(); ctx.ellipse(548, 604, 138, 48, 0, 0, Math.PI * 2); ctx.fill();

          // Foreground boulders + dramatic Hudson River pine silhouettes
          ctx.fillStyle = '#241b15';
          ctx.beginPath(); ctx.moveTo(0, 675); ctx.quadraticCurveTo(210, 668, 365, 820); ctx.lineTo(0, 820); ctx.fill();
          ctx.fillStyle = '#1d1713';
          ctx.beginPath(); ctx.moveTo(1120, 665); ctx.quadraticCurveTo(910, 662, 745, 820); ctx.lineTo(1120, 820); ctx.fill();

          [[86, 690, 265], [156, 708, 355], [1032, 695, 295], [968, 718, 395]].forEach(([px, py0, py1]) => {
            ctx.strokeStyle = '#151914'; ctx.lineWidth = 13;
            ctx.beginPath(); ctx.moveTo(px, py0); ctx.lineTo(px, py1); ctx.stroke();
            for (let b = 0; b < 11; b++) {
              const frac = b / 10;
              const by = lerp(py1 + 14, py0 - 60, frac);
              const span = (16 + frac * 54) * (0.8 + N.rand() * 0.35);
              ctx.strokeStyle = b % 2 === 0 ? '#18261a' : '#223322';
              ctx.lineWidth = 10 + frac * 6;
              ctx.beginPath();
              ctx.moveTo(px - span, by + 16); ctx.quadraticCurveTo(px, by - 4, px + span * 0.9, by + 14);
              ctx.stroke();
            }
          });
        });

        M.synthesize(api, scene, {
          style: 'classic',
          totalStrokes: 5000,
          seed: 9004,
          layers: WORKS[3].layers,
          roi: [
            { cx: 440, cy: 240, rx: 220, ry: 165, boost: 3.4 },
            { cx: 548, cy: 525, rx: 140, ry: 135, boost: 3.8 },
            { cx: 120, cy: 500, rx: 115, ry: 220, boost: 2.6 },
            { cx: 1000, cy: 500, rx: 115, ry: 220, boost: 2.6 }
          ]
        });
      }
    },

    // =========================================================================
    // 5. ANDERS ZORN 4-PIGMENT LIMITED-PALETTE CLASSIC PORTRAIT
    // =========================================================================
    {
      id: 'oil-tut-fig-zorn',
      title: '经典油画教程·佐恩四色盘古典侧光女肖像',
      subtitle: '佐恩限制色盘直接画法（3D雕塑面骨 + 5000笔四色谐调）：象牙黑黄赭灰绿底 → 头颈肩一体化 → 冷暖塑面 → 五官发髻 → 白绸领',
      group: '油画·经典教程',
      category: '古典肖像教程',
      seal: '佐恩四色',
      mode: 'oil',
      theme: 'gallery-dark',
      backdropColor: '#1e1c18',
      width: 920,
      height: 1120,
      seed: 9005,
      swatches: ['rgb(84, 78, 62)', 'rgb(218, 168, 128)', 'rgb(184, 78, 56)', 'rgb(96, 86, 82)', 'rgb(246, 242, 232)'],
      desc: '安德斯·佐恩经典四色限制色盘肖像教程（仅用钛白、黄赭、朱红与象牙黑调配出完整冷暖灰调），真三维雕琢颧颊、眼窝、鼻梁、双唇与头颈肩丝滑过渡。',
      layers: [
        { id: 1, name: '一 · 象牙黑与黄赭调和灰绿底' },
        { id: 2, name: '二 · 头颈肩自然比例与发髻起稿' },
        { id: 3, name: '三 · 佐恩四色冷暖肤色大块面塑形' },
        { id: 4, name: '四 · 眉眼鼻唇五官与卷发柔和梳理' },
        { id: 5, name: '五 · 额鼻高光与白绸衣领厚涂笔触' }
      ],
      buildStrokes(api) {
        const M = window.Code2PaintOilMaster;
        const W = 920, H = 1120;
        const scene = M.createScene(W, H, 9005);

        scene.shadeBackdropWallTable({
          horizonY: null,
          lightX: 300,
          lightY: 360,
          wallLit: [112, 102, 82],
          wallMid: [76, 70, 56],
          wallDark: [36, 33, 27],
          wallNoise: 0.14
        });

        scene.shadePortrait3D({
          cx: 460,
          cy: 396,
          headW: 112,
          headH: 148,
          yaw: -0.18,
          lightDir: [-0.70, -0.48, 0.52],
          palette: 'zorn',
          skinLit: [242, 198, 158],
          skinMid: [192, 134, 98],
          skinShadow: [78, 64, 58],
          hairCol: [32, 24, 21],
          dressCol: [24, 22, 20],
          lipCol: [188, 68, 56],
          irisCol: [56, 48, 42],
          hasCollar: true,
          collarCol: [248, 244, 232]
        });

        // Graceful low chignon bun & parted curly forehead locks
        scene.draw2D((ctx) => {
          ctx.fillStyle = '#362620';
          ctx.beginPath(); ctx.ellipse(588, 418, 48, 56, 0.25, 0, Math.PI * 2); ctx.fill();
          ctx.strokeStyle = '#624234';
          ctx.lineWidth = 10;
          ctx.beginPath(); ctx.moveTo(432, 250); ctx.quadraticCurveTo(364, 286, 350, 368); ctx.stroke();
        });

        M.synthesize(api, scene, {
          style: 'zorn',
          totalStrokes: 5000,
          seed: 9005,
          layers: WORKS[4].layers,
          roi: [
            { cx: 454, cy: 396, rx: 120, ry: 155, boost: 5.2 },
            { cx: 454, cy: 386, rx: 75, ry: 55, boost: 4.5 },
            { cx: 460, cy: 650, rx: 140, ry: 95, boost: 2.6 }
          ]
        });
      }
    },

    // =========================================================================
    // 6. FAUVISM EXPRESSIVE PORTRAIT WITH PLUMED HAT (MATISSE / DERAIN)
    // =========================================================================
    {
      id: 'oil-tut-fig-fauve',
      title: '经典油画教程·野兽派撞色戴帽女子',
      subtitle: '野兽派色彩解放法（3D人像 + 5000笔高纯度野兽排笔）：绯红松石撞色底 → 阔檐紫帽 → 橘黄翡翠鼻影面 → 群青粗轮廓 → 彩羽高光',
      group: '油画·经典教程',
      category: '现代色彩肖像教程',
      seal: '野兽撞色',
      mode: 'oil',
      theme: 'gallery-dark',
      backdropColor: '#12282a',
      width: 920,
      height: 1120,
      seed: 9006,
      swatches: ['rgb(42, 166, 158)', 'rgb(218, 56, 72)', 'rgb(248, 184, 52)', 'rgb(44, 154, 86)', 'rgb(34, 56, 152)'],
      desc: '致敬马蒂斯《戴帽子的女人》经典野兽派教程：以饱和珊瑚红、松石绿与暖橘色切割背景，解放3D面部光影为亮橘受光与翡翠绿暗面对比，加群青雕塑线与阔檐花羽帽。',
      layers: [
        { id: 1, name: '一 · 绯红松石与明黄撞色背景' },
        { id: 2, name: '二 · 宽檐礼帽与撞色披肩起势' },
        { id: 3, name: '三 · 暖橘受光面与翡翠绿暗面塑形' },
        { id: 4, name: '四 · 群青深紫粗轮廓与表现五官' },
        { id: 5, name: '五 · 彩羽帽饰与高纯度厚涂亮彩' }
      ],
      buildStrokes(api) {
        const M = window.Code2PaintOilMaster;
        const W = 920, H = 1120;
        const scene = M.createScene(W, H, 9006);

        // Divided vibrant Fauve studio backdrop
        scene.draw2D((ctx) => {
          const gL = ctx.createLinearGradient(0, 0, 0, H);
          gL.addColorStop(0, '#d83848'); gL.addColorStop(0.55, '#e86842'); gL.addColorStop(1, '#eaa232');
          ctx.fillStyle = gL; ctx.fillRect(0, 0, W * 0.5, H);

          const gR = ctx.createLinearGradient(W * 0.5, 0, W, H);
          gR.addColorStop(0, '#2aa89e'); gR.addColorStop(0.58, '#268888'); gR.addColorStop(1, '#225e84');
          ctx.fillStyle = gR; ctx.fillRect(W * 0.5, 0, W * 0.5, H);
        });

        // Wide-brimmed sweeping Fauvist hat back layer
        scene.draw2D((ctx) => {
          ctx.save();
          ctx.translate(475, 232);
          ctx.rotate(-0.15);
          const hg = ctx.createRadialGradient(-40, -10, 35, 0, 0, 290);
          hg.addColorStop(0, '#4e3c9a'); hg.addColorStop(0.65, '#342c82'); hg.addColorStop(1, '#1d2262');
          ctx.fillStyle = hg;
          ctx.beginPath(); ctx.ellipse(0, 0, 285, 118, 0, 0, Math.PI * 2); ctx.fill();
          ctx.restore();
        });

        scene.shadePortrait3D({
          cx: 458,
          cy: 432,
          headW: 108,
          headH: 142,
          yaw: -0.16,
          lightDir: [-0.68, -0.45, 0.56],
          palette: 'fauve',
          fauveShadowCol: [44, 166, 94],
          skinLit: [252, 206, 86],
          skinMid: [238, 134, 62],
          skinShadow: [46, 158, 92],
          hairCol: [148, 38, 34],
          dressCol: [38, 72, 162],
          lipCol: [218, 32, 66],
          irisCol: [32, 64, 152],
          hasCollar: true,
          collarCol: [56, 186, 134]
        });

        // Hat top plumes, ultramarine Fauve contours & vibrant flower trim
        scene.draw2D((ctx) => {
          // Coral & lemon floral trims atop purple brim
          ctx.fillStyle = '#e62e3c';
          ctx.beginPath(); ctx.ellipse(368, 178, 56, 38, -0.3, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = '#fad432';
          ctx.beginPath(); ctx.ellipse(528, 164, 68, 32, 0.2, 0, Math.PI * 2); ctx.fill();
          ctx.strokeStyle = '#32be88'; ctx.lineWidth = 18; ctx.lineCap = 'round';
          ctx.beginPath(); ctx.moveTo(445, 156); ctx.quadraticCurveTo(560, 110, 680, 138); ctx.stroke();

          // Expressive ultramarine jaw contour + turquoise neck trim
          ctx.strokeStyle = 'rgba(28, 48, 148, 0.88)';
          ctx.lineWidth = 6.5;
          ctx.beginPath();
          ctx.moveTo(350, 355); ctx.quadraticCurveTo(334, 480, 444, 578);
          ctx.quadraticCurveTo(558, 555, 564, 355);
          ctx.stroke();
        });

        M.synthesize(api, scene, {
          style: 'fauve',
          totalStrokes: 5000,
          seed: 9006,
          layers: WORKS[5].layers,
          roi: [
            { cx: 458, cy: 432, rx: 120, ry: 155, boost: 4.8 },
            { cx: 475, cy: 205, rx: 245, ry: 125, boost: 2.8 }
          ]
        });
      }
    }
  ];

  window.Code2PaintCatalog.addPack(WORKS);
})();
