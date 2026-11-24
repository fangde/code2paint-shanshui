(function () {
  const STILL_LAYERS = [
    { id: 1, name: '一 · 亚麻底布与暗桌壁调' },
    { id: 2, name: '二 · 构图投影与大色块' },
    { id: 3, name: '三 · 厚涂形体与冷暖转折' },
    { id: 4, name: '四 · 亮部高光与肌理提神' }
  ];

  const LAND_LAYERS = [
    { id: 1, name: '一 · 天空底调与大气透视' },
    { id: 2, name: '二 · 远山云霞与水面基色' },
    { id: 3, name: '三 · 中景林木建筑实写' },
    { id: 4, name: '四 · 厚涂光影与倒影高光' }
  ];

  function drawSunflowers(ctx, blooms, N) {
    blooms.forEach(([bx, by, r, tilt, droop]) => {
      ctx.save();
      ctx.translate(bx, by);
      ctx.rotate(tilt);
      const scaleY = droop ? 0.62 : 0.94;
      ctx.scale(1, scaleY);

      const nPetals = 24;
      for (let p = 0; p < nPetals; p++) {
        const a = (p / nPetals) * Math.PI * 2 + N.rand() * 0.1;
        const pLen = r * (0.85 + N.rand() * 0.35);
        ctx.save();
        ctx.rotate(a);
        const pg = ctx.createLinearGradient(0, 0, pLen, 0);
        pg.addColorStop(0, '#c87212');
        pg.addColorStop(0.55, '#f6be24');
        pg.addColorStop(1, '#ffea70');
        ctx.fillStyle = pg;
        ctx.beginPath();
        ctx.ellipse(pLen * 0.62, 0, pLen * 0.44, r * 0.17, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      const cg = ctx.createRadialGradient(-r * 0.1, -r * 0.1, r * 0.06, 0, 0, r * 0.48);
      cg.addColorStop(0, '#784616');
      cg.addColorStop(0.6, '#4c260c');
      cg.addColorStop(1, '#261408');
      ctx.fillStyle = cg;
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.46, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
  }

  function drawRoseFlower(ctx, rx, ry, rad, outerCol, midCol, centerCol) {
    const base = ctx.createRadialGradient(rx - rad * 0.2, ry - rad * 0.2, rad * 0.1, rx, ry, rad);
    base.addColorStop(0, centerCol);
    base.addColorStop(0.55, midCol);
    base.addColorStop(1, outerCol);
    ctx.fillStyle = base;
    ctx.beginPath();
    ctx.arc(rx, ry, rad, 0, Math.PI * 2);
    ctx.fill();
    for (let ring = 0; ring < 3; ring++) {
      const cnt = 6 + ring * 2;
      const rr = rad * (0.28 + ring * 0.24);
      for (let i = 0; i < cnt; i++) {
        const a = (i / cnt) * Math.PI * 2 + ring * 0.6;
        ctx.save();
        ctx.translate(rx + Math.cos(a) * rr * 0.55, ry + Math.sin(a) * rr * 0.55);
        ctx.rotate(a + Math.PI * 0.5);
        ctx.fillStyle = ring === 0 ? centerCol : (ring === 1 ? midCol : outerCol);
        ctx.beginPath();
        ctx.ellipse(0, 0, rr * 0.65, rr * 0.34, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }
  }

  const WORKS = [
    // =========================================================================
    // 1. VAN GOGH GOLDEN SUNFLOWERS IN EARTHENWARE VASE
    // =========================================================================
    {
      id: 'oil-sunflowers',
      title: '油画静物·向日葵金瓶',
      subtitle: '印象派厚涂示范：琥珀黄墙 → 陶瓶明暗 → 向日葵辐射瓣 → 金黄高光点缀',
      group: '油画·静物风景',
      category: '厚涂静物油画',
      seal: '厚涂向日葵',
      mode: 'oil',
      theme: 'gallery-dark',
      backdropColor: '#2a2210',
      width: 920,
      height: 1120,
      seed: 7001,
      swatches: ['rgb(228, 198, 102)', 'rgb(246, 196, 42)', 'rgb(198, 126, 28)', 'rgb(74, 46, 20)', 'rgb(96, 126, 62)'],
      desc: '温润明黄壁面映衬釉陶双色矮瓶，九朵盛放与低垂的向日葵高低错落，笔触短促有力、焦褐花心与金橙瓣层叠如雕。',
      layers: STILL_LAYERS,
      buildStrokes(api) {
        const M = window.Code2PaintOilMaster;
        const W = 920, H = 1120;
        const scene = M.createScene(W, H, 7001);

        scene.shadeBackdropWallTable({
          horizonY: 790,
          lightX: 0.25, lightY: 0.22,
          wallLit: [242, 214, 118], wallMid: [212, 176, 78], wallDark: [152, 122, 46],
          tableType: 'wood',
          tableLit: [216, 174, 76], tableMid: [176, 134, 48], tableDark: [118, 86, 28],
          tableEdgeY: 802, hasBevel: true,
          castShadows: [{ cx: 510, cy: 995, rx: 165, ry: 42, rot: 0.05, strength: 0.55 }]
        });

        scene.shadeLathe3D({
          cx: 460, topY: 645, botY: 995,
          material: 'ceramic', openTopRim: false,
          profile: [[0.0, 96], [0.10, 88], [0.22, 108], [0.55, 146], [0.85, 114], [1.0, 86]],
          colLit: [248, 224, 132], colMid: [216, 162, 54], colDark: [128, 82, 22],
          bounceCol: [212, 164, 62], lightDir: [-0.68, -0.45, 0.58]
        });

        scene.draw2D((ctx, w, h, N) => {
          // Two-tone glazed potter band & deep green foliage stems
          ctx.fillStyle = '#2d4e8a';
          ctx.fillRect(318, 795, 284, 14);
          ctx.strokeStyle = '#3c5a2c';
          ctx.lineWidth = 10;
          ctx.lineCap = 'round';
          for (const [sx, sy, tx, ty] of [
            [455, 650, 325, 420], [462, 650, 460, 245], [472, 650, 625, 365],
            [448, 655, 285, 565], [485, 655, 645, 535], [460, 650, 472, 445]
          ]) {
            ctx.beginPath(); ctx.moveTo(sx, sy); ctx.quadraticCurveTo((sx + tx) * 0.5, sy - 60, tx, ty); ctx.stroke();
          }

          drawSunflowers(ctx, [
            [462, 232, 86, 0.1, false],
            [335, 325, 78, -0.3, false],
            [612, 315, 76, 0.4, false],
            [268, 485, 74, -0.5, true],
            [478, 435, 92, 0.05, false],
            [642, 495, 78, 0.45, true],
            [385, 565, 68, -0.2, false],
            [565, 575, 66, 0.25, true],
            [465, 608, 62, 0.12, true]
          ], N);
        });

        M.synthesize(api, scene, {
          style: 'vangogh',
          totalStrokes: 5000,
          seed: 7001,
          layers: WORKS[0].layers,
          roi: [
            { cx: 465, cy: 425, rx: 245, ry: 255, boost: 3.8 },
            { cx: 460, cy: 815, rx: 165, ry: 175, boost: 2.5 }
          ]
        });
      }
    },

    // =========================================================================
    // 2. ANTIQUE PEWTER PITCHER & WHITE ROSES
    // =========================================================================
    {
      id: 'oil-white-roses',
      title: '油画静物·银锡瓶白玫瑰',
      subtitle: '高灰调花卉：鸽灰暗底 → 锡壶金属明暗 → 奶油白玫瑰层瓣 → 滴水露珠高光',
      group: '油画·静物风景',
      category: '古典静物油画',
      seal: '古典花卉',
      mode: 'oil',
      theme: 'gallery-dark',
      backdropColor: '#191c1e',
      width: 920,
      height: 1120,
      seed: 7002,
      swatches: ['rgb(42, 46, 48)', 'rgb(142, 148, 146)', 'rgb(248, 242, 228)', 'rgb(228, 182, 164)', 'rgb(64, 88, 58)'],
      desc: '烟青冷灰背景下旧锡器银瓶泛出柔和漫反光，五朵奶油白玫瑰伴淡粉蕾苞舒展层瓣，色彩克制而莹润通透。',
      layers: STILL_LAYERS,
      buildStrokes(api) {
        const M = window.Code2PaintOilMaster;
        const W = 920, H = 1120;
        const scene = M.createScene(W, H, 7002);

        scene.shadeBackdropWallTable({
          horizonY: 795,
          lightX: 0.24, lightY: 0.22,
          wallLit: [92, 98, 102], wallMid: [54, 58, 62], wallDark: [26, 30, 34],
          tableType: 'wood',
          tableLit: [74, 72, 68], tableMid: [44, 44, 42], tableDark: [22, 22, 24],
          castShadows: [{ cx: 525, cy: 985, rx: 145, ry: 34, rot: 0.04, strength: 0.62 }]
        });

        scene.shadeLathe3D({
          cx: 458, topY: 575, botY: 980,
          material: 'metal', openTopRim: true,
          profile: [[0.0, 62], [0.14, 54], [0.35, 72], [0.68, 118], [0.88, 92], [1.0, 74]],
          colLit: [216, 222, 222], colMid: [118, 126, 128], colDark: [36, 40, 44],
          bounceCol: [148, 154, 152], lightDir: [-0.72, -0.44, 0.54]
        });

        scene.draw2D((ctx) => {
          // Pewter handle & spout lip
          ctx.strokeStyle = '#9aa2a4';
          ctx.lineWidth = 18;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(516, 615);
          ctx.bezierCurveTo(618, 608, 628, 795, 562, 845);
          ctx.stroke();

          // Dark olive rose foliage & slender buds
          for (const [lx, ly, rot] of [
            [332, 485, -0.6], [588, 495, 0.5], [295, 365, -0.4], [615, 365, 0.45], [462, 545, 0.1]
          ]) {
            ctx.save(); ctx.translate(lx, ly); ctx.rotate(rot);
            ctx.fillStyle = '#2d4630';
            ctx.beginPath(); ctx.ellipse(0, 0, 56, 26, 0, 0, Math.PI * 2); ctx.fill();
            ctx.restore();
          }

          drawRoseFlower(ctx, 442, 345, 72, '#b6a89a', '#eee6d6', '#fffdf6');
          drawRoseFlower(ctx, 338, 445, 62, '#ae9e92', '#ebe0ce', '#fdfaf0');
          drawRoseFlower(ctx, 565, 432, 64, '#b8a296', '#efe2d2', '#fffdf8');
          drawRoseFlower(ctx, 455, 478, 68, '#b2a698', '#f2e8d8', '#ffffff');
          drawRoseFlower(ctx, 525, 308, 46, '#c89c94', '#edd2cb', '#f9eae6');

          // Delicate table rosebud & silvery dewdrop
          ctx.fillStyle = '#e8c4be';
          ctx.beginPath(); ctx.ellipse(278, 992, 20, 12, -0.25, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = '#eef4f2';
          ctx.beginPath(); ctx.arc(622, 998, 7, 0, Math.PI * 2); ctx.fill();
        });

        M.synthesize(api, scene, {
          style: 'classic',
          totalStrokes: 5000,
          seed: 7002,
          layers: WORKS[1].layers,
          roi: [
            { cx: 455, cy: 415, rx: 195, ry: 175, boost: 3.8 },
            { cx: 458, cy: 780, rx: 145, ry: 185, boost: 3.0 }
          ]
        });
      }
    },

    // =========================================================================
    // 3. COBALT DRAPED CLOTH, PEARS & PORCELAIN COMPOTE
    // =========================================================================
    {
      id: 'oil-green-pear',
      title: '油画静物·蓝布绿梨瓷碗',
      subtitle: '冷暖补色静物：暗灰墙壁 → 钴蓝皱褶衬布 → 青黄西洋梨塑形 → 釉瓷高光',
      group: '油画·静物风景',
      category: '学院静物油画',
      seal: '学院派静物',
      mode: 'oil',
      theme: 'gallery-dark',
      backdropColor: '#1a1b19',
      width: 1000,
      height: 820,
      seed: 7003,
      swatches: ['rgb(52, 68, 96)', 'rgb(168, 188, 68)', 'rgb(228, 212, 82)', 'rgb(228, 224, 214)', 'rgb(98, 62, 34)'],
      desc: '学院派基础构图，深沉灰绿背景下石青色桌布皱褶托起白瓷果盘与两颗青黄西洋梨，展现互补色与釉面质感。',
      layers: STILL_LAYERS,
      buildStrokes(api) {
        const M = window.Code2PaintOilMaster;
        const W = 1000, H = 820;
        const scene = M.createScene(W, H, 7003);

        scene.shadeBackdropWallTable({
          horizonY: 485,
          lightX: 0.25, lightY: 0.22,
          wallLit: [74, 78, 72], wallMid: [44, 48, 44], wallDark: [22, 24, 22],
          tableType: 'wood',
          tableLit: [118, 86, 54], tableMid: [78, 52, 32], tableDark: [38, 26, 16],
          castShadows: [
            { cx: 535, cy: 615, rx: 140, ry: 34, rot: 0.04, strength: 0.56 },
            { cx: 365, cy: 655, rx: 85, ry: 22, rot: -0.05, strength: 0.52 }
          ]
        });

        scene.shadeDrapery({
          poly: [[40, 470], [490, 485], [565, 820], [0, 820]],
          colLit: [84, 114, 168], colMid: [44, 64, 108], colDark: [18, 26, 52], foldFreq: 0.036, foldAngle: 0.25
        });

        // White porcelain compote bowl
        scene.shadeLathe3D({
          cx: 545, topY: 365, botY: 605,
          material: 'ceramic', openTopRim: true,
          profile: [[0.0, 152], [0.18, 134], [0.42, 68], [0.58, 32], [0.85, 58], [1.0, 84]],
          colLit: [248, 246, 238], colMid: [186, 188, 184], colDark: [94, 98, 104],
          bounceCol: [148, 162, 186]
        });

        // Three 3D sculpted chartreuse-gold Anjou pears
        scene.shadeFruit3D({
          cx: 485, cy: 335, rx: 56, ry: 68, kind: 'pear',
          colLit: [234, 222, 92], colMid: [164, 182, 62], colShadow: [68, 78, 28],
          colBlush: [198, 124, 48], bounceCol: [212, 214, 198], shininess: 48
        });
        scene.shadeFruit3D({
          cx: 598, cy: 342, rx: 54, ry: 66, kind: 'pear',
          colLit: [228, 214, 86], colMid: [152, 174, 58], colShadow: [58, 68, 24],
          colBlush: [192, 108, 42], bounceCol: [204, 208, 192], shininess: 46
        });
        scene.shadeFruit3D({
          cx: 332, cy: 595, rx: 62, ry: 74, kind: 'pear',
          colLit: [238, 224, 98], colMid: [168, 186, 68], colShadow: [62, 72, 26],
          colBlush: [206, 126, 48], bounceCol: [96, 126, 176], shininess: 52
        });

        M.synthesize(api, scene, {
          style: 'cezanne',
          totalStrokes: 5000,
          seed: 7003,
          layers: WORKS[2].layers,
          roi: [
            { cx: 542, cy: 425, rx: 185, ry: 175, boost: 3.4 },
            { cx: 332, cy: 595, rx: 115, ry: 105, boost: 3.2 }
          ]
        });
      }
    },

    // =========================================================================
    // 4. DUTCH STILL LIFE: CLARET BOTTLE, WINE GOBLET & RUSTIC BREAD
    // =========================================================================
    {
      id: 'oil-bread-wine',
      title: '油画静物·古典葡萄酒与法棍',
      subtitle: '荷兰风低光静物：墨绿暗壁 → 琥珀玻璃酒瓶 → 焦脆麦包 → 红酒杯透亮反光',
      group: '油画·静物风景',
      category: '古典静物油画',
      seal: '荷兰静物',
      mode: 'oil',
      theme: 'gallery-dark',
      backdropColor: '#12100d',
      width: 1000,
      height: 820,
      seed: 7004,
      swatches: ['rgb(24, 22, 16)', 'rgb(42, 68, 34)', 'rgb(138, 24, 28)', 'rgb(208, 152, 76)', 'rgb(248, 238, 212)'],
      desc: '十七世纪荷兰小画派低光调，暗橄榄绿玻璃瓶配紫红葡萄酒高脚杯，旁置金褐裂纹乡村面包，质朴深沉。',
      layers: STILL_LAYERS,
      buildStrokes(api) {
        const M = window.Code2PaintOilMaster;
        const W = 1000, H = 820;
        const scene = M.createScene(W, H, 7004);

        scene.shadeBackdropWallTable({
          horizonY: 510,
          lightX: 0.24, lightY: 0.22,
          wallLit: [44, 42, 34], wallMid: [26, 24, 18], wallDark: [12, 11, 9],
          tableType: 'wood',
          tableLit: [108, 76, 44], tableMid: [64, 44, 26], tableDark: [26, 18, 12],
          castShadows: [
            { cx: 435, cy: 615, rx: 115, ry: 28, rot: 0.04, strength: 0.65 },
            { cx: 700, cy: 675, rx: 145, ry: 32, rot: -0.05, strength: 0.60 }
          ]
        });

        // Olive-amber glass wine bottle
        scene.shadeLathe3D({
          cx: 385, topY: 165, botY: 605,
          material: 'glass', openTopRim: false,
          profile: [[0.0, 24], [0.22, 26], [0.34, 86], [0.85, 88], [1.0, 82]],
          colLit: [92, 128, 62], colMid: [38, 64, 30], colDark: [12, 22, 10],
          bounceCol: [148, 102, 52], specCol: [248, 246, 232]
        });

        // Half-filled crystal ruby burgundy wine goblet
        scene.shadeLathe3D({
          cx: 545, topY: 365, botY: 625,
          material: 'glass', openTopRim: true,
          profile: [[0.0, 56], [0.22, 60], [0.46, 22], [0.52, 10], [0.90, 12], [0.96, 54], [1.0, 56]],
          colLit: [212, 216, 218], colMid: [112, 118, 124], colDark: [36, 40, 44],
          liquidLevel: 0.20, liquidBot: 0.44, liquidCol: [142, 22, 26]
        });

        // Crusty golden-brown rustic bread loaf, sliced crumb & wooden board
        scene.draw2D((ctx) => {
          ctx.fillStyle = '#4e341c';
          ctx.beginPath(); ctx.ellipse(705, 652, 175, 42, -0.05, 0, Math.PI * 2); ctx.fill();

          const loaf = ctx.createRadialGradient(675, 535, 22, 710, 568, 145);
          loaf.addColorStop(0, '#e8a852');
          loaf.addColorStop(0.55, '#ad6824');
          loaf.addColorStop(1, '#4a240e');
          ctx.fillStyle = loaf;
          ctx.beginPath(); ctx.ellipse(715, 572, 132, 68, -0.08, 0, Math.PI * 2); ctx.fill();

          // Torn creamy bread slice leaning forward
          const crumb = ctx.createLinearGradient(585, 555, 645, 650);
          crumb.addColorStop(0, '#fcf2d6'); crumb.addColorStop(1, '#c8a46e');
          ctx.fillStyle = crumb;
          ctx.beginPath(); ctx.ellipse(618, 608, 42, 54, -0.25, 0, Math.PI * 2); ctx.fill();
          ctx.strokeStyle = '#9c5c1e'; ctx.lineWidth = 7; ctx.stroke();

          // Ruby glow through wine meniscus
          ctx.fillStyle = 'rgba(214, 48, 44, 0.72)';
          ctx.beginPath(); ctx.ellipse(545, 428, 48, 12, 0, 0, Math.PI * 2); ctx.fill();
        });

        M.synthesize(api, scene, {
          style: 'classic',
          totalStrokes: 5000,
          seed: 7004,
          layers: WORKS[3].layers,
          roi: [
            { cx: 545, cy: 495, rx: 120, ry: 145, boost: 3.4 },
            { cx: 695, cy: 585, rx: 175, ry: 105, boost: 3.0 },
            { cx: 385, cy: 385, rx: 105, ry: 225, boost: 2.6 }
          ]
        });
      }
    },

    // =========================================================================
    // 5. WILD DAISIES IN MING BLUE-AND-WHITE PORCELAIN VASE
    // =========================================================================
    {
      id: 'oil-wild-daisies',
      title: '油画静物·蓝瓷瓶野生雏菊',
      subtitle: '清新外光静物：淡灰蓝墙 → 景泰青花瓷瓶 → 错落雏菊丛 → 阳光明黄花芯',
      group: '油画·静物风景',
      category: '外光花艺油画',
      seal: '印象雏菊',
      mode: 'oil',
      theme: 'gallery-dark',
      backdropColor: '#222830',
      width: 920,
      height: 1120,
      seed: 7005,
      swatches: ['rgb(154, 168, 176)', 'rgb(42, 82, 134)', 'rgb(248, 246, 238)', 'rgb(244, 194, 48)', 'rgb(74, 116, 66)'],
      desc: '明亮北欧灰蓝墙面前青花釉瓶插满野生白雏菊，松散写意的细梗与微风轻颤的白瓣洋溢春日阳光。',
      layers: STILL_LAYERS,
      buildStrokes(api) {
        const M = window.Code2PaintOilMaster;
        const W = 920, H = 1120;
        const scene = M.createScene(W, H, 7005);

        scene.shadeBackdropWallTable({
          horizonY: 795,
          lightX: 0.24, lightY: 0.22,
          wallLit: [188, 198, 206], wallMid: [138, 150, 162], wallDark: [84, 96, 110],
          tableType: 'wood',
          tableLit: [188, 168, 142], tableMid: [138, 118, 96], tableDark: [86, 70, 56],
          castShadows: [{ cx: 515, cy: 975, rx: 135, ry: 34, rot: 0.04, strength: 0.50 }]
        });

        scene.shadeLathe3D({
          cx: 460, topY: 605, botY: 965,
          material: 'ceramic', openTopRim: true,
          profile: [[0.0, 58], [0.16, 52], [0.45, 118], [0.78, 108], [1.0, 74]],
          colLit: [242, 246, 250], colMid: [148, 174, 212], colDark: [44, 72, 122],
          bounceCol: [182, 174, 152]
        });

        // Cobalt porcelain motifs + airy meadow daisy stems and bright flowers
        scene.draw2D((ctx, w, h, N) => {
          ctx.fillStyle = '#2d589a';
          ctx.fillRect(352, 742, 216, 18);
          ctx.beginPath(); ctx.arc(430, 815, 28, 0, Math.PI * 2); ctx.fill();
          ctx.beginPath(); ctx.arc(492, 838, 22, 0, Math.PI * 2); ctx.fill();

          const daisies = [
            [455, 225, 42], [355, 285, 38], [568, 275, 40], [278, 385, 36],
            [638, 378, 38], [412, 365, 44], [525, 388, 42], [335, 472, 36],
            [465, 488, 46], [588, 468, 38], [262, 522, 32], [648, 502, 34],
            [392, 545, 36], [535, 558, 34]
          ];

          ctx.strokeStyle = '#48743c'; ctx.lineWidth = 4;
          daisies.forEach(([dx, dy]) => {
            ctx.beginPath(); ctx.moveTo(460, 610); ctx.quadraticCurveTo((460 + dx) * 0.5, dy + 80, dx, dy); ctx.stroke();
          });

          daisies.forEach(([dx, dy, dr]) => {
            for (let p = 0; p < 14; p++) {
              const a = (p / 14) * Math.PI * 2 + N.rand() * 0.15;
              ctx.save(); ctx.translate(dx, dy); ctx.rotate(a);
              ctx.fillStyle = p % 2 === 0 ? '#fdfcf8' : '#e6ebf0';
              ctx.beginPath(); ctx.ellipse(dr * 0.65, 0, dr * 0.48, dr * 0.14, 0, 0, Math.PI * 2); ctx.fill();
              ctx.restore();
            }
            ctx.fillStyle = '#f2be26';
            ctx.beginPath(); ctx.arc(dx, dy, dr * 0.28, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#d48216';
            ctx.beginPath(); ctx.arc(dx + 2, dy + 2, dr * 0.14, 0, Math.PI * 2); ctx.fill();
          });
        });

        M.synthesize(api, scene, {
          style: 'impressionist',
          totalStrokes: 5000,
          seed: 7005,
          layers: WORKS[4].layers,
          roi: [
            { cx: 458, cy: 405, rx: 245, ry: 220, boost: 3.8 },
            { cx: 460, cy: 785, rx: 135, ry: 175, boost: 2.6 }
          ]
        });
      }
    },

    // =========================================================================
    // 6. STARRY NIGHT CYPRESS & VILLAGE (IMPASTO LANDSCAPE)
    // =========================================================================
    {
      id: 'oil-starry-cypress',
      title: '油画风景·星空柏树',
      subtitle: '表现主义涡旋笔触：深邃钴蓝夜空 → 星云涡旋笔列 → 暗绿冲天丝柏 → 村落暖灯',
      group: '油画·静物风景',
      category: '表现主义风景',
      seal: '星空夜色',
      mode: 'oil',
      theme: 'gallery-dark',
      backdropColor: '#0c162b',
      width: 1120,
      height: 820,
      seed: 7006,
      swatches: ['rgb(20, 42, 92)', 'rgb(54, 108, 178)', 'rgb(246, 206, 74)', 'rgb(22, 46, 32)', 'rgb(142, 172, 208)'],
      desc: '深蓝夜幕中盘旋流动的星河与弯月光晕交相辉映，前景深墨绿火焰状丝柏直插云霄，山下村庄点亮温暖橙窗。',
      layers: LAND_LAYERS,
      buildStrokes(api) {
        const M = window.Code2PaintOilMaster;
        const W = 1120, H = 820, H_Y = 535;
        const scene = M.createScene(W, H, 7006);

        scene.shadeSkyAndClouds({
          horizonY: H_Y,
          skyTop: [16, 34, 82],
          skyMid: [34, 72, 146],
          skyHorizon: [96, 142, 198],
          sunX: 935, sunY: 165, sunR: 2, glowR: 260, glowCol: [248, 208, 86], glowStrength: 0.65,
          cloudCover: 0.35, cloudLitCol: [148, 186, 224], cloudDarkCol: [22, 46, 104], cloudAlpha: 0.85
        });

        scene.shadeMountainRange({
          baseY: H_Y + 25,
          peaks: [[0, 470], [280, 485], [560, 445], [840, 475], [1120, 442]],
          rockLit: [52, 82, 134], rockDark: [20, 32, 68], snowLine: 1.5, mistCol: [68, 102, 152], mistStrength: 0.35
        });

        scene.draw2D((ctx) => {
          // Rolling cobalt sky vortex ribbons for ETF to trace luminous currents
          ctx.lineCap = 'round';
          ctx.strokeStyle = 'rgba(136, 184, 232, 0.55)';
          ctx.lineWidth = 22;
          ctx.beginPath();
          ctx.moveTo(40, 295);
          ctx.bezierCurveTo(280, 125, 420, 355, 625, 215);
          ctx.bezierCurveTo(735, 145, 755, 295, 585, 315);
          ctx.stroke();

          // Luminous stars + blazing golden crescent moon
          for (const [sx, sy, sr] of [[185, 142, 44], [385, 128, 36], [512, 235, 34], [695, 125, 32], [815, 345, 30]]) {
            const g = ctx.createRadialGradient(sx, sy, 4, sx, sy, sr);
            g.addColorStop(0, '#fffce0'); g.addColorStop(0.45, '#f6cb52'); g.addColorStop(1, 'rgba(64, 118, 188, 0)');
            ctx.fillStyle = g;
            ctx.beginPath(); ctx.arc(sx, sy, sr, 0, Math.PI * 2); ctx.fill();
          }
          ctx.fillStyle = '#ffdf64';
          ctx.beginPath(); ctx.arc(935, 165, 46, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = '#386cc0';
          ctx.beginPath(); ctx.arc(918, 152, 34, 0, Math.PI * 2); ctx.fill();

          // Valley village houses & tall spire
          ctx.fillStyle = '#182436';
          ctx.fillRect(0, H_Y - 12, W, H - H_Y + 12);
          ctx.fillStyle = '#263a52';
          for (const [hx, hy, hw, hh] of [[425, 625, 68, 54], [525, 645, 82, 58], [678, 635, 76, 62], [805, 648, 86, 56]]) {
            ctx.fillRect(hx, hy, hw, hh);
            ctx.fillStyle = '#f8c854';
            ctx.fillRect(hx + 18, hy + 18, 14, 16);
            ctx.fillStyle = '#263a52';
          }
          ctx.fillStyle = '#283c54';
          ctx.beginPath(); ctx.moveTo(598, 665); ctx.lineTo(622, 468); ctx.lineTo(646, 665); ctx.closePath(); ctx.fill();

          // Towering foreground flame cypress silhouette
          const cyG = ctx.createLinearGradient(175, 95, 295, 820);
          cyG.addColorStop(0, '#0c1c12'); cyG.addColorStop(0.55, '#193624'); cyG.addColorStop(1, '#08120c');
          ctx.fillStyle = cyG;
          ctx.beginPath();
          ctx.moveTo(232, 82);
          ctx.bezierCurveTo(285, 235, 328, 495, 312, 820);
          ctx.lineTo(155, 820);
          ctx.bezierCurveTo(148, 525, 185, 265, 232, 82);
          ctx.closePath(); ctx.fill();
        });

        M.synthesize(api, scene, {
          style: 'vangogh',
          totalStrokes: 5000,
          seed: 7006,
          layers: WORKS[5].layers,
          roi: [
            { cx: 525, cy: 235, rx: 465, ry: 175, boost: 2.8 },
            { cx: 232, cy: 465, rx: 95, ry: 345, boost: 3.0 },
            { cx: 625, cy: 625, rx: 225, ry: 95, boost: 2.6 }
          ]
        });
      }
    },

    // =========================================================================
    // 7. PROVENCE LAVENDER FIELDS & RED-ROOFED MAS
    // =========================================================================
    {
      id: 'oil-lavender',
      title: '油画风景·普罗旺斯薰衣草田',
      subtitle: '线性透视花田：晴空云絮 → 远黛浅山 → 紫罗兰放射垄沟 → 孤独红屋顶石屋',
      group: '油画·静物风景',
      category: '外光田园油画',
      seal: '南法熏草',
      mode: 'oil',
      theme: 'gallery-dark',
      backdropColor: '#26283c',
      width: 1120,
      height: 820,
      seed: 7007,
      swatches: ['rgb(118, 164, 224)', 'rgb(122, 86, 178)', 'rgb(186, 146, 218)', 'rgb(88, 114, 62)', 'rgb(218, 164, 98)'],
      desc: '夏末艳阳下的普罗旺斯花田，紫罗兰薰衣草行垄汇聚地平线石砌小屋，远山晴云与温暖麦黄泥土交织绚丽生机。',
      layers: LAND_LAYERS,
      buildStrokes(api) {
        const M = window.Code2PaintOilMaster;
        const W = 1120, H = 820, H_Y = 315;
        const scene = M.createScene(W, H, 7007);

        scene.shadeSkyAndClouds({
          horizonY: H_Y,
          skyTop: [68, 126, 204], skyMid: [132, 182, 234], skyHorizon: [228, 232, 238],
          sunX: 880, sunY: 135, glowR: 260, glowCol: [254, 242, 206], glowStrength: 0.42,
          cloudCover: 0.45, cloudLitCol: [255, 252, 246], cloudDarkCol: [148, 168, 206]
        });

        scene.shadeMountainRange({
          baseY: H_Y + 12,
          peaks: [[0, 270], [280, 238], [580, 265], [880, 228], [1120, 265]],
          rockLit: [138, 148, 194], rockDark: [88, 96, 148], snowLine: 1.5, mistCol: [198, 204, 228], mistStrength: 0.45
        });

        scene.draw2D((ctx) => {
          const vpX = 595, vpY = H_Y;
          const fld = ctx.createLinearGradient(0, vpY, 0, H);
          fld.addColorStop(0, '#c69a62'); fld.addColorStop(1, '#845e32');
          ctx.fillStyle = fld;
          ctx.fillRect(0, vpY, W, H - vpY);

          // Converging sunlit violet-magenta lavender rows in vivid perspective
          for (let r = -7; r <= 7; r++) {
            const bx = vpX + r * 145;
            const lwStart = 4 + Math.abs(r) * 0.4;
            const lwEnd = 52;
            const g = ctx.createLinearGradient(vpX, vpY, bx, H);
            g.addColorStop(0, '#7c56b6'); g.addColorStop(0.5, '#9866ca'); g.addColorStop(1, '#58348c');
            ctx.fillStyle = g;
            ctx.beginPath();
            ctx.moveTo(vpX + r * 14 - lwStart, vpY + 8);
            ctx.lineTo(vpX + r * 14 + lwStart, vpY + 8);
            ctx.lineTo(bx + lwEnd, H);
            ctx.lineTo(bx - lwEnd, H);
            ctx.closePath(); ctx.fill();

            ctx.strokeStyle = 'rgba(208, 168, 236, 0.72)';
            ctx.lineWidth = 10;
            ctx.beginPath(); ctx.moveTo(vpX + r * 14, vpY + 12); ctx.lineTo(bx - 12, H); ctx.stroke();
          }

          // Distant olive grove, Provençal stone house & cypress guardians
          ctx.fillStyle = '#5c7a3e';
          ctx.fillRect(0, vpY - 10, W, 24);
          ctx.fillStyle = '#e8d4b2'; ctx.fillRect(545, vpY - 46, 98, 52);
          ctx.fillStyle = '#b44830';
          ctx.beginPath(); ctx.moveTo(536, vpY - 46); ctx.lineTo(594, vpY - 76); ctx.lineTo(652, vpY - 46); ctx.closePath(); ctx.fill();
          ctx.fillStyle = '#244224';
          for (const [cx, h2] of [[498, 92], [525, 84], [662, 98]]) {
            ctx.beginPath(); ctx.ellipse(cx, vpY - h2 * 0.48, 12, h2 * 0.55, 0, 0, Math.PI * 2); ctx.fill();
          }
        });

        M.synthesize(api, scene, {
          style: 'impressionist',
          totalStrokes: 5000,
          seed: 7007,
          layers: WORKS[6].layers,
          roi: [
            { cx: 595, cy: 295, rx: 145, ry: 75, boost: 3.4 },
            { cx: 560, cy: 560, rx: 480, ry: 220, boost: 2.2 }
          ]
        });
      }
    },

    // =========================================================================
    // 8. GOLDEN AUTUMN BIRCH FOREST & WINDING STREAM
    // =========================================================================
    {
      id: 'oil-autumn-birch',
      title: '油画风景·秋日白桦林溪',
      subtitle: '重彩林溪：湛蓝透秋空 → 赭红金黄桦叶 → 银白黑斑树干 → 溪面碎金倒影',
      group: '油画·静物风景',
      category: '外光风景油画',
      seal: '金秋白桦',
      mode: 'oil',
      theme: 'gallery-dark',
      backdropColor: '#2a2216',
      width: 1000,
      height: 820,
      seed: 7008,
      swatches: ['rgb(88, 134, 186)', 'rgb(236, 178, 48)', 'rgb(198, 84, 34)', 'rgb(238, 236, 228)', 'rgb(52, 74, 96)'],
      desc: '深秋晴朗白桦林畔浅溪蜿蜒，银白带黑结的白桦立柱分割画幅，满冠金橙枫叶在林表与水波间碎成满地流金。',
      layers: LAND_LAYERS,
      buildStrokes(api) {
        const M = window.Code2PaintOilMaster;
        const W = 1000, H = 820, H_Y = 395;
        const scene = M.createScene(W, H, 7008);

        scene.shadeSkyAndClouds({
          horizonY: H_Y,
          skyTop: [54, 108, 174], skyMid: [118, 166, 214], skyHorizon: [218, 228, 232],
          cloudCover: 0.35, cloudLitCol: [252, 248, 240], cloudDarkCol: [148, 176, 206]
        });

        scene.draw2D((ctx, w, h, N) => {
          // Sunlit amber leaf hills + cool winding forest creek
          const gr = ctx.createLinearGradient(0, H_Y, 0, H);
          gr.addColorStop(0, '#c67824'); gr.addColorStop(0.55, '#964e18'); gr.addColorStop(1, '#4c260e');
          ctx.fillStyle = gr;
          ctx.fillRect(0, H_Y, W, H - H_Y);

          const crk = ctx.createLinearGradient(520, H_Y, 440, H);
          crk.addColorStop(0, '#88b8d6'); crk.addColorStop(0.6, '#3a688c'); crk.addColorStop(1, '#1e3854');
          ctx.fillStyle = crk;
          ctx.beginPath();
          ctx.moveTo(475, H_Y + 12);
          ctx.bezierCurveTo(645, 515, 295, 625, 245, H);
          ctx.lineTo(665, H);
          ctx.bezierCurveTo(545, 635, 765, 520, 545, H_Y + 12);
          ctx.closePath(); ctx.fill();

          // Brilliant golden & vermilion birch canopy puffs
          for (let c = 0; c < 42; c++) {
            const fx = N.rand() * W, fy = 45 + N.rand() * 345, fr = 42 + N.rand() * 58;
            ctx.fillStyle = c % 3 === 0 ? 'rgba(244, 186, 42, 0.85)' : (c % 3 === 1 ? 'rgba(208, 92, 34, 0.82)' : 'rgba(252, 218, 86, 0.82)');
            ctx.beginPath(); ctx.arc(fx, fy, fr, 0, Math.PI * 2); ctx.fill();
          }

          // Shimmering gold leaf ripples across creek
          for (let r = 0; r < 40; r++) {
            const rx = 285 + N.rand() * 340, ry = H_Y + 40 + N.rand() * (H - H_Y - 55);
            ctx.fillStyle = 'rgba(248, 202, 72, 0.65)';
            ctx.fillRect(rx, ry, 28 + N.rand() * 38, 6);
          }

          // Vertical silver birch trunks with signature black bark marks
          for (const [bx, topW, botW, botY] of [
            [148, 14, 24, 715], [228, 12, 20, 695], [768, 14, 24, 725], [848, 16, 26, 755], [378, 8, 14, 525], [642, 9, 15, 535]
          ]) {
            const tg = ctx.createLinearGradient(bx - botW, 0, bx + botW, 0);
            tg.addColorStop(0, '#eef0ea'); tg.addColorStop(0.65, '#c6cac6'); tg.addColorStop(1, '#585c62');
            ctx.fillStyle = tg;
            ctx.beginPath();
            ctx.moveTo(bx - topW, 0); ctx.lineTo(bx + topW, 0);
            ctx.lineTo(bx + botW, botY); ctx.lineTo(bx - botW, botY);
            ctx.closePath(); ctx.fill();
            ctx.fillStyle = '#242220';
            for (let my = 45; my < botY - 20; my += 36 + N.rand() * 28) {
              ctx.fillRect(bx - botW * 0.45, my, botW * (0.7 + N.rand() * 0.5), 5);
            }
          }
        });

        M.synthesize(api, scene, {
          style: 'impressionist',
          totalStrokes: 5000,
          seed: 7008,
          layers: WORKS[7].layers,
          roi: [
            { cx: 188, cy: 380, rx: 120, ry: 320, boost: 3.0 },
            { cx: 805, cy: 380, rx: 120, ry: 340, boost: 3.0 },
            { cx: 465, cy: 615, rx: 195, ry: 185, boost: 2.8 }
          ]
        });
      }
    },

    // =========================================================================
    // 9. ALPINE SNOW PEAKS, PINE RIDGE & EMERALD GLACIER LAKE
    // =========================================================================
    {
      id: 'oil-alpine-peaks',
      title: '油画风景·雪山冷杉与翡翠湖',
      subtitle: '北美景观笔法：冷青苍穹 → 刮刀雪峰向阳粉 → 深松墨绿林带 → 翡翠冰湖镜面',
      group: '油画·静物风景',
      category: '高山冰湖油画',
      seal: '阿尔卑斯',
      mode: 'oil',
      theme: 'gallery-dark',
      backdropColor: '#1a2834',
      width: 1120,
      height: 820,
      seed: 7009,
      swatches: ['rgb(84, 134, 178)', 'rgb(246, 232, 224)', 'rgb(62, 86, 122)', 'rgb(24, 98, 92)', 'rgb(24, 54, 38)'],
      desc: '雄伟花岗岩雪峰耸立碧空下，左坡承晨曦呈现暖玫瑰雪色，右坡入冷紫阴面，山脚墨绿冷杉倒映如翡翠冰川湖。',
      layers: LAND_LAYERS,
      buildStrokes(api) {
        const M = window.Code2PaintOilMaster;
        const W = 1120, H = 820, H_Y = 478;
        const scene = M.createScene(W, H, 7009);

        scene.shadeSkyAndClouds({
          horizonY: H_Y,
          skyTop: [46, 94, 148], skyMid: [108, 156, 198], skyHorizon: [216, 226, 236],
          cloudCover: 0.36, cloudLitCol: [252, 246, 242], cloudDarkCol: [132, 158, 194]
        });

        scene.shadeMountainRange({
          baseY: H_Y,
          peaks: [[0, 320], [185, 215], [385, 118], [585, 198], [765, 128], [965, 235], [1120, 325]],
          sunDirX: -0.78, sunDirY: -0.35,
          rockLit: [138, 134, 146], rockDark: [48, 66, 98],
          snowLit: [252, 238, 232], snowShadow: [106, 132, 178],
          snowLine: 0.34, mistCol: [176, 198, 216], mistStrength: 0.32, ridgeAmp: 36
        });

        scene.shadeOcean({
          yTop: H_Y, yBot: H,
          seaTop: [36, 122, 114], seaMid: [22, 92, 88], seaBot: [12, 52, 54],
          sunX: 465, glitterCol: [212, 238, 228], glitterSpread: 320, glitterStrength: 0.36, waveScale: 0.015
        });

        // Dark alpine spruce shoreline & mirrored mountain reflections
        scene.draw2D((ctx) => {
          ctx.fillStyle = 'rgba(232, 226, 228, 0.25)';
          ctx.beginPath(); ctx.moveTo(265, H_Y + 4); ctx.lineTo(385, H_Y + 210); ctx.lineTo(525, H_Y + 4); ctx.fill();
          ctx.beginPath(); ctx.moveTo(645, H_Y + 4); ctx.lineTo(765, H_Y + 185); ctx.lineTo(885, H_Y + 4); ctx.fill();

          ctx.fillStyle = '#142c1c';
          ctx.fillRect(0, H_Y - 12, W, 22);
          for (let tx = 18; tx < W; tx += 36) {
            const distEdge = Math.min(tx, W - tx);
            const hTree = distEdge < 220 ? 185 - distEdge * 0.52 : 54;
            ctx.beginPath();
            ctx.moveTo(tx, H_Y + 8 - hTree);
            ctx.lineTo(tx + 20, H_Y + 12);
            ctx.lineTo(tx - 20, H_Y + 12);
            ctx.closePath(); ctx.fill();
          }
        });

        M.synthesize(api, scene, {
          style: 'knife',
          totalStrokes: 5000,
          seed: 7009,
          layers: WORKS[8].layers,
          roi: [
            { cx: 560, cy: 275, rx: 420, ry: 175, boost: 3.0 },
            { cx: 120, cy: 435, rx: 120, ry: 165, boost: 2.6 },
            { cx: 1000, cy: 435, rx: 120, ry: 165, boost: 2.6 }
          ]
        });
      }
    },

    // =========================================================================
    // 10. VENICE GRAND CANAL AT GOLDEN DUSK
    // =========================================================================
    {
      id: 'oil-venice-gondola',
      title: '油画风景·威尼斯暮色运河',
      subtitle: '威尼斯水城诗意：琥珀晚霞 → 赭粉古典山墙 → 墨黑贡多拉长舟 → 运河粼粼金水',
      group: '油画·静物风景',
      category: '水城建筑油画',
      seal: '水城暮色',
      mode: 'oil',
      theme: 'gallery-dark',
      backdropColor: '#281d18',
      width: 1120,
      height: 820,
      seed: 7010,
      swatches: ['rgb(232, 168, 114)', 'rgb(198, 118, 92)', 'rgb(44, 86, 118)', 'rgb(22, 20, 22)', 'rgb(248, 214, 134)'],
      desc: '暮霭中的威尼斯大运河倒映著两侧红赭与浅米建筑立面、穹顶教堂剪影，漆黑细长的贡多拉轻轻划开水波金光。',
      layers: LAND_LAYERS,
      buildStrokes(api) {
        const M = window.Code2PaintOilMaster;
        const W = 1120, H = 820, H_Y = 475;
        const scene = M.createScene(W, H, 7010);

        scene.shadeSkyAndClouds({
          horizonY: H_Y,
          skyTop: [88, 114, 152], skyMid: [212, 154, 114], skyHorizon: [252, 208, 134],
          sunX: 545, sunY: 365, glowR: 380, glowCol: [255, 224, 146], glowStrength: 0.70,
          cloudCover: 0.42, cloudLitCol: [255, 224, 164], cloudDarkCol: [134, 112, 128]
        });

        scene.shadeOcean({
          yTop: H_Y, yBot: H,
          seaTop: [72, 108, 136], seaMid: [42, 74, 108], seaBot: [24, 42, 68],
          sunX: 545, glitterCol: [252, 212, 118], glitterSpread: 360, glitterStrength: 0.65, waveScale: 0.022
        });

        scene.draw2D((ctx) => {
          // Terracotta & ochre Grand Canal palazzi + Santa Maria della Salute silhouette
          const bld = [
            [0, 195, 165, 285, '#c86e4c'], [155, 245, 125, 235, '#e0aa78'],
            [270, 295, 105, 185, '#a85242'], [845, 265, 135, 215, '#c46c52'],
            [970, 215, 155, 265, '#9e4c3c']
          ];
          bld.forEach(([x, y, w, h, c]) => {
            ctx.fillStyle = c; ctx.fillRect(x, y, w, h);
            ctx.fillStyle = '#382a2a';
            for (let wy = y + 32; wy < H_Y - 35; wy += 48) {
              ctx.fillRect(x + 22, wy, 18, 28);
              ctx.fillRect(x + w - 42, wy, 18, 28);
            }
          });

          // Distant Basilica Dome & Campanile silhouette
          ctx.fillStyle = '#4a3d4c';
          ctx.beginPath(); ctx.arc(695, 395, 58, Math.PI, 0); ctx.fill();
          ctx.fillRect(638, 395, 114, 82);
          ctx.fillRect(688, 305, 14, 34);
          ctx.fillRect(585, 345, 26, 132);

          // Warm ochre/red canal facade reflections shimmering downward
          ctx.fillStyle = 'rgba(208, 124, 82, 0.35)';
          ctx.fillRect(0, H_Y, 345, 195);
          ctx.fillRect(845, H_Y, 275, 215);

          // Foreground sleek jet-black Venetian gondola + standing gondolier
          ctx.fillStyle = '#141214';
          ctx.beginPath();
          ctx.moveTo(225, 625);
          ctx.bezierCurveTo(325, 688, 615, 682, 745, 615);
          ctx.lineTo(725, 652);
          ctx.bezierCurveTo(585, 712, 335, 716, 245, 660);
          ctx.closePath(); ctx.fill();
          ctx.fillRect(665, 515, 22, 118); // gondolier
          ctx.beginPath(); ctx.arc(676, 502, 14, 0, Math.PI * 2); ctx.fill();
          ctx.strokeStyle = '#62482c'; ctx.lineWidth = 6;
          ctx.beginPath(); ctx.moveTo(676, 558); ctx.lineTo(548, 725); ctx.stroke();
        });

        M.synthesize(api, scene, {
          style: 'impressionist',
          totalStrokes: 5000,
          seed: 7010,
          layers: WORKS[9].layers,
          roi: [
            { cx: 515, cy: 625, rx: 285, ry: 115, boost: 3.4 },
            { cx: 695, cy: 395, rx: 145, ry: 95, boost: 2.8 }
          ]
        });
      }
    },

    // =========================================================================
    // 11. BARBIZON FOREST OAK GLADE & TYNDALL SUNBEAMS
    // =========================================================================
    {
      id: 'oil-forest-light',
      title: '油画风景·密林晨曦光柱',
      subtitle: '丁达尔森林光：暗翠幽谷 → 橡树粗干立柱 → 苔藓蕨草斜坡 → 穿透密林金色光束',
      group: '油画·静物风景',
      category: '巴比松风景油画',
      seal: '森林丁达尔',
      mode: 'oil',
      theme: 'gallery-dark',
      backdropColor: '#121a12',
      width: 1000,
      height: 820,
      seed: 7011,
      swatches: ['rgb(24, 42, 26)', 'rgb(64, 98, 44)', 'rgb(162, 184, 82)', 'rgb(248, 226, 146)', 'rgb(74, 52, 34)'],
      desc: '巴比松画派林间秘境，高耸古老橡树围合成深幽密林，几缕金黄晨光破开林隙斜射苔藓林道，明暗剧烈而神圣。',
      layers: LAND_LAYERS,
      buildStrokes(api) {
        const M = window.Code2PaintOilMaster;
        const W = 1000, H = 820;
        const scene = M.createScene(W, H, 7011);

        scene.draw2D((ctx, w, h, N) => {
          // Deep mossy cathedral woods gradient
          const wood = ctx.createRadialGradient(220, 85, 25, 500, 410, 740);
          wood.addColorStop(0, '#fff4b6');
          wood.addColorStop(0.28, '#8ba848');
          wood.addColorStop(0.62, '#284426');
          wood.addColorStop(1, '#0e1a10');
          ctx.fillStyle = wood;
          ctx.fillRect(0, 0, W, H);

          // Winding moss-carpeted forest floor
          const flr = ctx.createLinearGradient(0, 525, 0, H);
          flr.addColorStop(0, '#3a5a26'); flr.addColorStop(1, '#1a2814');
          ctx.fillStyle = flr;
          ctx.fillRect(0, 525, W, H - 525);

          // Sun-dappled clearing glow on mossy trail
          const dapple = ctx.createRadialGradient(545, 665, 18, 545, 675, 215);
          dapple.addColorStop(0, 'rgba(246, 226, 128, 0.85)');
          dapple.addColorStop(0.55, 'rgba(148, 174, 72, 0.45)');
          dapple.addColorStop(1, 'rgba(38, 62, 30, 0)');
          ctx.fillStyle = dapple;
          ctx.fillRect(280, 515, 540, 295);

          // Towering dark gnarled oak trunks framing the sacred glade
          for (const [tx, tw, lean] of [[95, 56, 12], [248, 44, -8], [748, 52, -16], [895, 68, -22], [445, 24, 6], [608, 28, -4]]) {
            const tg = ctx.createLinearGradient(tx - tw, 0, tx + tw, 0);
            tg.addColorStop(0, '#725634'); tg.addColorStop(0.38, '#382a1a'); tg.addColorStop(1, '#14100a');
            ctx.fillStyle = tg;
            ctx.beginPath();
            ctx.moveTo(tx - tw * 0.75 + lean, 0);
            ctx.lineTo(tx + tw * 0.75 + lean, 0);
            ctx.lineTo(tx + tw * 1.15, 695);
            ctx.lineTo(tx - tw * 1.15, 695);
            ctx.closePath(); ctx.fill();
          }

          // Canopy foliage clusters blocking high sky except central gap
          for (let f = 0; f < 45; f++) {
            const fx = N.rand() * W, fy = N.rand() * 295;
            if (Math.hypot(fx - 310, fy - 125) < 95) continue;
            ctx.fillStyle = f % 2 === 0 ? 'rgba(24, 42, 22, 0.86)' : 'rgba(54, 86, 36, 0.78)';
            ctx.beginPath(); ctx.arc(fx, fy, 46 + N.rand() * 52, 0, Math.PI * 2); ctx.fill();
          }

          // Diagonal golden Tyndall light beams slicing down onto mossy floor
          ctx.save();
          ctx.globalCompositeOperation = 'screen';
          for (const [xTop, xBot, wid] of [[245, 455, 86], [285, 595, 98], [335, 725, 72]]) {
            const ray = ctx.createLinearGradient(xTop, 75, xBot, 725);
            ray.addColorStop(0, 'rgba(255, 238, 162, 0.52)');
            ray.addColorStop(0.7, 'rgba(244, 214, 124, 0.28)');
            ray.addColorStop(1, 'rgba(204, 184, 96, 0)');
            ctx.fillStyle = ray;
            ctx.beginPath();
            ctx.moveTo(xTop, 65); ctx.lineTo(xTop + wid, 65);
            ctx.lineTo(xBot + wid * 2.1, 745); ctx.lineTo(xBot - wid * 0.6, 745);
            ctx.closePath(); ctx.fill();
          }
          ctx.restore();
        });

        M.synthesize(api, scene, {
          style: 'scumbling',
          totalStrokes: 5000,
          seed: 7011,
          layers: WORKS[10].layers,
          roi: [
            { cx: 535, cy: 525, rx: 255, ry: 245, boost: 3.2 },
            { cx: 310, cy: 135, rx: 145, ry: 95, boost: 2.6 }
          ]
        });
      }
    },

    // =========================================================================
    // 12. STORMY SEA HEADLAND & SEARCHLIGHT LIGHTHOUSE
    // =========================================================================
    {
      id: 'oil-lighthouse-storm',
      title: '油画风景·暴风雨夜与红白灯塔',
      subtitle: '浪漫主义海难：乌云密布深空 → 翡翠咆哮巨浪 → 孤礁红白灯塔 → 白沫飞溅光束',
      group: '油画·静物风景',
      category: '海景浪涛油画',
      seal: '风浪灯塔',
      mode: 'oil',
      theme: 'gallery-dark',
      backdropColor: '#131d24',
      width: 1120,
      height: 820,
      seed: 7012,
      swatches: ['rgb(36, 54, 68)', 'rgb(28, 84, 88)', 'rgb(192, 54, 42)', 'rgb(244, 242, 234)', 'rgb(252, 224, 128)'],
      desc: '怒海狂涛之夜，黑青雷云低垂压顶，礁石上的红白条纹灯塔顶住呼啸巨浪，塔顶炽亮白光刺穿漫天飞沫。',
      layers: LAND_LAYERS,
      buildStrokes(api) {
        const M = window.Code2PaintOilMaster;
        const W = 1120, H = 820, H_Y = 485;
        const scene = M.createScene(W, H, 7012);

        scene.shadeSkyAndClouds({
          horizonY: H_Y,
          skyTop: [22, 34, 48], skyMid: [44, 66, 86], skyHorizon: [112, 134, 148],
          sunX: 350, sunY: 195, glowR: 300, glowCol: [252, 224, 128], glowStrength: 0.42,
          cloudCover: 0.72, cloudLitCol: [148, 168, 184], cloudDarkCol: [24, 34, 48]
        });

        scene.shadeOcean({
          yTop: H_Y, yBot: H,
          seaTop: [24, 78, 84], seaMid: [16, 54, 68], seaBot: [8, 26, 38],
          sunX: 350, glitterCol: [232, 236, 224], glitterSpread: 220, glitterStrength: 0.44,
          waveScale: 0.025, crestWave: { cx: 680, cy: 565, rx: 320, ry: 95, colCore: [52, 152, 138], colFoam: [248, 250, 246] }
        });

        scene.draw2D((ctx) => {
          // Craggy black basalt cliff headland + dramatic white crashing spray
          ctx.fillStyle = '#181e24';
          ctx.beginPath();
          ctx.moveTo(0, 445); ctx.lineTo(145, 415); ctx.lineTo(425, 455); ctx.lineTo(495, 585); ctx.lineTo(0, 625);
          ctx.closePath(); ctx.fill();

          // Piercing warm golden lighthouse searchlight cone across gale sky
          const beam = ctx.createLinearGradient(345, 195, 1080, 125);
          beam.addColorStop(0, 'rgba(255, 248, 196, 0.92)');
          beam.addColorStop(0.4, 'rgba(252, 222, 118, 0.36)');
          beam.addColorStop(1, 'rgba(186, 178, 128, 0)');
          ctx.fillStyle = beam;
          ctx.beginPath();
          ctx.moveTo(345, 195); ctx.lineTo(1120, 72); ctx.lineTo(1120, 315); ctx.closePath(); ctx.fill();

          // Red-and-white striped cylindrical stone lighthouse tower
          const stripes = [
            [225, 48, '#f0ece2'], [273, 52, '#c8382c'], [325, 55, '#ede8dc'], [380, 58, '#bc3226']
          ];
          stripes.forEach(([sy, sh, col]) => {
            const wTop = 26 + (sy - 225) * 0.09, wBot = 26 + (sy + sh - 225) * 0.09;
            ctx.fillStyle = col;
            ctx.beginPath();
            ctx.moveTo(345 - wTop, sy); ctx.lineTo(345 + wTop, sy);
            ctx.lineTo(345 + wBot, sy + sh); ctx.lineTo(345 - wBot, sy + sh);
            ctx.closePath(); ctx.fill();
          });
          // Lantern room & beacon glow
          ctx.fillStyle = '#1e2228';
          ctx.fillRect(320, 168, 50, 58);
          ctx.fillStyle = '#fff9ce';
          ctx.fillRect(328, 178, 34, 34);
          ctx.beginPath(); ctx.moveTo(314, 168); ctx.lineTo(345, 138); ctx.lineTo(376, 168); ctx.closePath(); ctx.fill();

          // Frothing sea foam crashing upward against cliff base
          ctx.fillStyle = 'rgba(246, 250, 248, 0.85)';
          for (const [fx, fy, rx, ry] of [[425, 515, 78, 42], [495, 565, 92, 46], [355, 555, 68, 34]]) {
            ctx.beginPath(); ctx.ellipse(fx, fy, rx, ry, -0.2, 0, Math.PI * 2); ctx.fill();
          }
        });

        M.synthesize(api, scene, {
          style: 'knife',
          totalStrokes: 5000,
          seed: 7012,
          layers: WORKS[11].layers,
          roi: [
            { cx: 345, cy: 315, rx: 125, ry: 215, boost: 3.6 },
            { cx: 615, cy: 555, rx: 295, ry: 115, boost: 2.8 }
          ]
        });
      }
    },

    // =========================================================================
    // 13. MONET JAPANESE BRIDGE & WATER LILY POND
    // =========================================================================
    {
      id: 'oil-waterlily-pond',
      title: '油画风景·莫奈日式拱桥睡莲池',
      subtitle: '印象派色点并置：翠绿柳瀑 → 青绿拱形木桥 → 玫瑰紫蓝水波 → 粉白浮萍睡莲',
      group: '油画·静物风景',
      category: '印象派池苑油画',
      seal: '印象睡莲',
      mode: 'oil',
      theme: 'gallery-dark',
      backdropColor: '#1a2822',
      width: 1120,
      height: 820,
      seed: 7013,
      swatches: ['rgb(84, 138, 72)', 'rgb(96, 152, 138)', 'rgb(52, 84, 128)', 'rgb(236, 158, 178)', 'rgb(248, 242, 198)'],
      desc: '印象派色光交响：万条嫩绿柳丝披拂在蓝绿拱桥之后，池水中玫瑰紫、湖蓝与青绿短笔交织出浮光跃动的满池睡莲。',
      layers: LAND_LAYERS,
      buildStrokes(api) {
        const M = window.Code2PaintOilMaster;
        const W = 1120, H = 820;
        const scene = M.createScene(W, H, 7013);

        scene.draw2D((ctx, w, h, N) => {
          // Lush weeping willow emerald curtain backdrop
          const bkg = ctx.createLinearGradient(0, 0, 0, 415);
          bkg.addColorStop(0, '#5a944a'); bkg.addColorStop(0.55, '#82b458'); bkg.addColorStop(1, '#2d5432');
          ctx.fillStyle = bkg;
          ctx.fillRect(0, 0, W, 415);

          // Shimmering Monet blue-teal-violet-rose pond water
          const water = ctx.createLinearGradient(0, 405, 0, H);
          water.addColorStop(0, '#366458'); water.addColorStop(0.45, '#3b6a9a'); water.addColorStop(0.8, '#5a68a6'); water.addColorStop(1, '#26446c');
          ctx.fillStyle = water;
          ctx.fillRect(0, 405, W, H - 405);

          // Vertical willow foliage streaks behind pond
          for (let i = 0; i < 65; i++) {
            const vx = N.rand() * W, vy = N.rand() * 245;
            ctx.strokeStyle = i % 2 === 0 ? 'rgba(138, 188, 78, 0.72)' : 'rgba(42, 82, 46, 0.68)';
            ctx.lineWidth = 10 + N.rand() * 14;
            ctx.beginPath(); ctx.moveTo(vx, vy); ctx.lineTo(vx + (N.rand() - 0.5) * 16, vy + 165); ctx.stroke();
          }

          // Sunlit green Japanese arched wooden bridge across center
          ctx.strokeStyle = '#6da89a';
          ctx.lineWidth = 22;
          ctx.beginPath(); ctx.moveTo(45, 365); ctx.quadraticCurveTo(560, 215, 1075, 365); ctx.stroke();
          ctx.strokeStyle = '#92cab8';
          ctx.lineWidth = 10;
          ctx.beginPath(); ctx.moveTo(45, 295); ctx.quadraticCurveTo(560, 145, 1075, 295); ctx.stroke();
          for (let p = 0; p <= 16; p++) {
            const t = p / 16;
            const px = 45 + t * 1030;
            const arc = 4 * t * (1 - t) * 150;
            const pyBot = 365 - arc;
            ctx.strokeStyle = '#4e7e72'; ctx.lineWidth = 7;
            ctx.beginPath(); ctx.moveTo(px, pyBot); ctx.lineTo(px, pyBot - 70); ctx.stroke();
          }

          // Floating lily pads & glowing pink/ivory Monet waterlilies across water surface
          for (let k = 0; k < 28; k++) {
            const lx = 75 + N.rand() * 970, ly = 455 + N.rand() * 325;
            const r = 24 + (ly - 455) * 0.14;
            ctx.fillStyle = k % 2 === 0 ? '#4e8446' : '#3a6a38';
            ctx.beginPath(); ctx.ellipse(lx, ly, r * 1.4, r * 0.42, 0, 0, Math.PI * 2); ctx.fill();
            if (k % 2 === 0) {
              ctx.fillStyle = k % 4 === 0 ? '#f69eb4' : '#fdf6ce';
              ctx.beginPath(); ctx.ellipse(lx + 4, ly - 5, r * 0.52, r * 0.24, 0, 0, Math.PI * 2); ctx.fill();
              ctx.fillStyle = '#fffef0';
              ctx.beginPath(); ctx.arc(lx + 4, ly - 6, r * 0.16, 0, Math.PI * 2); ctx.fill();
            }
          }
        });

        M.synthesize(api, scene, {
          style: 'impressionist',
          totalStrokes: 5000,
          seed: 7013,
          layers: WORKS[12].layers,
          roi: [
            { cx: 560, cy: 295, rx: 495, ry: 110, boost: 3.2 },
            { cx: 560, cy: 615, rx: 465, ry: 175, boost: 2.8 }
          ]
        });
      }
    },

    // =========================================================================
    // 14. WINTER TWILIGHT VILLAGE & WARM GLOWING WINDOWS
    // =========================================================================
    {
      id: 'oil-winter-village',
      title: '油画风景·冬日暮雪村落小路',
      subtitle: '冷暖冬景：冷灰粉云暮 → 灰蓝雪地反光 → 枯枝剪影与红屋檐 → 窗灯一点温情',
      group: '油画·静物风景',
      category: '冬雪风情油画',
      seal: '暖窗雪村',
      mode: 'oil',
      theme: 'gallery-dark',
      backdropColor: '#242934',
      width: 1120,
      height: 820,
      seed: 7014,
      swatches: ['rgb(154, 174, 198)', 'rgb(242, 240, 236)', 'rgb(112, 134, 168)', 'rgb(64, 52, 48)', 'rgb(252, 186, 68)'],
      desc: '严冬黄昏粉紫天光抚慰静谧雪乡，厚雪屋顶反射微寒青灰，唯有村中农舍与行脚路上几扇炉火映出温暖橙辉。',
      layers: LAND_LAYERS,
      buildStrokes(api) {
        const M = window.Code2PaintOilMaster;
        const W = 1120, H = 820, H_Y = 395;
        const scene = M.createScene(W, H, 7014);

        scene.shadeSkyAndClouds({
          horizonY: H_Y,
          skyTop: [108, 126, 162], skyMid: [188, 168, 182], skyHorizon: [244, 212, 192],
          cloudCover: 0.48, cloudLitCol: [248, 224, 206], cloudDarkCol: [132, 146, 178]
        });

        scene.draw2D((ctx) => {
          // Cool lavender-blue & ivory snow drifts + curving cart lane
          const snow = ctx.createLinearGradient(0, H_Y, 0, H);
          snow.addColorStop(0, '#dde4ee'); snow.addColorStop(0.5, '#b6c4dc'); snow.addColorStop(1, '#7c92b8');
          ctx.fillStyle = snow;
          ctx.fillRect(0, H_Y, W, H - H_Y);

          // Gentle S-curved sunlit winter lane receding between snowy cottage lawns
          ctx.fillStyle = 'rgba(138, 152, 178, 0.62)';
          ctx.beginPath();
          ctx.moveTo(495, H_Y + 35);
          ctx.bezierCurveTo(445, 555, 585, 655, 365, H);
          ctx.lineTo(745, H);
          ctx.bezierCurveTo(645, 665, 535, 555, 535, H_Y + 35);
          ctx.closePath(); ctx.fill();

          // Snow-covered cottages with terracotta gables and blazing amber hearths
          [[215, 345, 145, 115], [645, 335, 168, 122], [845, 385, 138, 108]].forEach(([hx, hy, hw, hh], idx) => {
            ctx.fillStyle = '#e8e4dc';
            ctx.fillRect(hx, hy, hw, hh);
            ctx.fillStyle = idx === 1 ? '#b24c38' : '#786258';
            ctx.beginPath(); ctx.moveTo(hx - 14, hy); ctx.lineTo(hx + hw * 0.5, hy - 56); ctx.lineTo(hx + hw + 14, hy); ctx.closePath(); ctx.fill();
            // Thick white snow cap along roof slope
            ctx.strokeStyle = '#f8f8f6'; ctx.lineWidth = 10;
            ctx.beginPath(); ctx.moveTo(hx - 14, hy); ctx.lineTo(hx + hw * 0.5, hy - 56); ctx.lineTo(hx + hw + 14, hy); ctx.stroke();

            // Glowing hearth windows + golden cast pool on snow
            ctx.fillStyle = '#ffbe3e';
            ctx.fillRect(hx + hw * 0.25, hy + 42, 24, 30);
            ctx.fillRect(hx + hw * 0.62, hy + 42, 24, 30);
            const pool = ctx.createRadialGradient(hx + hw * 0.5, hy + hh + 24, 8, hx + hw * 0.5, hy + hh + 24, 88);
            pool.addColorStop(0, 'rgba(255, 198, 72, 0.55)');
            pool.addColorStop(1, 'rgba(255, 198, 72, 0)');
            ctx.fillStyle = pool;
            ctx.beginPath(); ctx.arc(hx + hw * 0.5, hy + hh + 24, 88, 0, Math.PI * 2); ctx.fill();
          });

          // Gnarled bare oak branches silhouette
          ctx.strokeStyle = '#38302e'; ctx.lineWidth = 12; ctx.lineCap = 'round';
          for (const [tx, ty] of [[128, 495], [965, 545]]) {
            ctx.beginPath(); ctx.moveTo(tx, ty); ctx.lineTo(tx, ty - 265); ctx.stroke();
            ctx.lineWidth = 6;
            ctx.beginPath(); ctx.moveTo(tx, ty - 165); ctx.lineTo(tx - 75, ty - 235); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(tx, ty - 195); ctx.lineTo(tx + 72, ty - 255); ctx.stroke();
          }
        });

        M.synthesize(api, scene, {
          style: 'impressionist',
          totalStrokes: 5000,
          seed: 7014,
          layers: WORKS[13].layers,
          roi: [
            { cx: 725, cy: 405, rx: 145, ry: 95, boost: 3.4 },
            { cx: 285, cy: 415, rx: 115, ry: 85, boost: 3.0 }
          ]
        });
      }
    },

    // =========================================================================
    // 15. SILVER MOONLIT COVE & LONE FISHING BOAT
    // =========================================================================
    {
      id: 'oil-moonlit-cove',
      title: '油画风景·月夜银海湾渔舟',
      subtitle: '古典夜海月色：藏青夜空 → 乌云边银辉 → 悬崖礁岛剪影 → 海面十里银柱',
      group: '油画·静物风景',
      category: '夜色海景油画',
      seal: '月夜银湾',
      mode: 'oil',
      theme: 'gallery-dark',
      backdropColor: '#0c131d',
      width: 1120,
      height: 820,
      seed: 7015,
      swatches: ['rgb(18, 28, 48)', 'rgb(44, 68, 102)', 'rgb(248, 244, 224)', 'rgb(142, 166, 198)', 'rgb(22, 24, 28)'],
      desc: '深蓝月夜云隙泻下一轮皎洁冰盘，十里幽静海面拖出波光银带，左崖松影与静泊渔舟构成空灵深沉的东方诗意油画。',
      layers: LAND_LAYERS,
      buildStrokes(api) {
        const M = window.Code2PaintOilMaster;
        const W = 1120, H = 820, H_Y = 445;
        const scene = M.createScene(W, H, 7015);

        scene.shadeSkyAndClouds({
          horizonY: H_Y,
          skyTop: [14, 24, 46], skyMid: [28, 46, 78], skyHorizon: [62, 86, 126],
          sunX: 665, sunY: 185, sunR: 32, sunCol: [252, 248, 232],
          glowR: 265, glowCol: [212, 224, 244], glowStrength: 0.72,
          cloudCover: 0.56, cloudLitCol: [176, 194, 218], cloudDarkCol: [14, 22, 38]
        });

        scene.shadeOcean({
          yTop: H_Y, yBot: H,
          seaTop: [24, 42, 72], seaMid: [16, 30, 56], seaBot: [8, 14, 28],
          sunX: 665, glitterCol: [252, 248, 232], glitterSpread: 280, glitterStrength: 0.96, waveScale: 0.022
        });

        scene.draw2D((ctx) => {
          // Distant island range + pine-topped basalt headland cliff left
          ctx.fillStyle = '#121a28';
          ctx.beginPath();
          ctx.moveTo(0, 315); ctx.lineTo(195, 345); ctx.lineTo(345, H_Y + 20); ctx.lineTo(0, H_Y + 20);
          ctx.closePath(); ctx.fill();

          ctx.fillStyle = '#182436';
          ctx.beginPath();
          ctx.moveTo(415, H_Y); ctx.quadraticCurveTo(515, 412, 625, H_Y); ctx.closePath(); ctx.fill();

          // Quiet moonlit fishing boat silhouetted next to silver shimmer lane
          ctx.fillStyle = '#10141c';
          ctx.beginPath();
          ctx.moveTo(548, 632); ctx.quadraticCurveTo(605, 668, 675, 628);
          ctx.lineTo(660, 654); ctx.quadraticCurveTo(605, 678, 562, 654);
          ctx.closePath(); ctx.fill();
          ctx.strokeStyle = '#18202c'; ctx.lineWidth = 4;
          ctx.beginPath(); ctx.moveTo(612, 636); ctx.lineTo(612, 535); ctx.stroke();
        });

        M.synthesize(api, scene, {
          style: 'classic',
          totalStrokes: 5000,
          seed: 7015,
          layers: WORKS[14].layers,
          roi: [
            { cx: 665, cy: 185, rx: 135, ry: 115, boost: 3.4 },
            { cx: 655, cy: 595, rx: 165, ry: 175, boost: 3.2 }
          ]
        });
      }
    }
  ];

  if (typeof window !== 'undefined' && window.Code2PaintCatalog) {
    window.Code2PaintCatalog.addPack(WORKS);
  }
})();
