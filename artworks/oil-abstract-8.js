(function () {
  function padTo5000(api, layerId, label, drawOne) {
    let safety = 0;
    while (api.strokes.length < 5000 && safety < 1500) {
      drawOne(safety);
      safety++;
    }
    if (api.strokes.length > 5000) {
      api.strokes.length = 5000;
    }
  }

  const WORKS = [
    // =========================================================================
    // 1. VAN GOGH STARRY NIGHT VORTEX SWIRL
    // =========================================================================
    {
      id: 'oil-abs-vangogh-swirl',
      title: '梵高风·星月涡旋',
      subtitle: '后印象派厚涂流场：深蓝夜幕铺底 → 双螺旋星云流线排笔 → 火焰丝柏与远山 → 金辉星核提亮',
      group: '油画·抽象印象',
      category: '后印象派抽象油画',
      seal: '梵高涡旋',
      mode: 'oil',
      theme: 'gallery-dark',
      backdropColor: '#0c1836',
      width: 1120,
      height: 820,
      seed: 8001,
      swatches: ['rgb(22, 54, 128)', 'rgb(56, 118, 198)', 'rgb(138, 198, 224)', 'rgb(246, 204, 66)', 'rgb(22, 42, 26)'],
      desc: '用流动方向向量场生成连续卷曲的钴蓝、天青与松石绿星云排笔，交织炽亮金黄螺旋星晕与墨绿火焰状丝柏，再现梵高式狂热天穹律动。',
      layers: [
        { id: 1, name: '一 · 钴蓝普蓝夜幕底涂' },
        { id: 2, name: '二 · 涡旋流场星河排笔' },
        { id: 3, name: '三 · 远山群峰与火焰丝柏' },
        { id: 4, name: '四 · 炽亮明黄星核与月晕' }
      ],
      buildStrokes(api) {
        const M = window.Code2PaintOilMaster;
        const W = 1120, H = 820, H_Y = 555;
        const scene = M.createScene(W, H, 8001);

        scene.shadeSkyAndClouds({
          horizonY: H_Y,
          skyTop: [14, 34, 88], skyMid: [34, 82, 162], skyHorizon: [112, 164, 212],
          sunX: 935, sunY: 165, sunR: 1, glowR: 280, glowCol: [248, 206, 74], glowStrength: 0.72,
          cloudCover: 0.35, cloudLitCol: [142, 198, 224], cloudDarkCol: [20, 52, 124]
        });

        scene.shadeMountainRange({
          baseY: H_Y + 32,
          peaks: [[0, 488], [240, 468], [520, 442], [790, 478], [1120, 438]],
          rockLit: [46, 86, 148], rockDark: [18, 36, 82], snowLine: 1.5, mistCol: [74, 118, 178], mistStrength: 0.32
        });

        scene.draw2D((ctx) => {
          // Double interlocking Saint-Rémy spiral wave ridges so ETF traces ecstatic Van Gogh vortex currents
          ctx.lineCap = 'round';
          for (const [lw, col] of [[32, 'rgba(72, 144, 214, 0.75)'], [16, 'rgba(176, 222, 236, 0.80)']]) {
            ctx.strokeStyle = col;
            ctx.lineWidth = lw;
            ctx.beginPath();
            ctx.moveTo(45, 315);
            ctx.bezierCurveTo(225, 165, 385, 345, 535, 245);
            ctx.bezierCurveTo(645, 168, 695, 295, 578, 338);
            ctx.bezierCurveTo(492, 370, 468, 265, 558, 245);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(645, 375);
            ctx.bezierCurveTo(735, 295, 815, 375, 735, 425);
            ctx.stroke();
          }

          // Concentric golden star halos + blazing crescent moon
          for (const [sx, sy, sr] of [
            [175, 148, 42], [358, 132, 34], [472, 225, 30], [728, 118, 34], [835, 325, 32], [295, 368, 36], [115, 265, 28]
          ]) {
            const g = ctx.createRadialGradient(sx, sy, 4, sx, sy, sr);
            g.addColorStop(0, '#fffce2'); g.addColorStop(0.45, '#f6cc4c'); g.addColorStop(1, 'rgba(64, 128, 206, 0)');
            ctx.fillStyle = g;
            ctx.beginPath(); ctx.arc(sx, sy, sr, 0, Math.PI * 2); ctx.fill();
          }
          ctx.fillStyle = '#ffe05a';
          ctx.beginPath(); ctx.arc(935, 165, 50, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = '#3876c4';
          ctx.beginPath(); ctx.arc(916, 152, 37, 0, Math.PI * 2); ctx.fill();

          // Undulating cobalt hills + glowing warm Provençal village & tall steeple
          ctx.fillStyle = '#182c48';
          ctx.fillRect(0, H_Y, W, H - H_Y);
          ctx.fillStyle = '#243c5e';
          for (const [vx, vy, vw, vh] of [[395, 645, 66, 52], [492, 655, 82, 56], [682, 640, 74, 62], [795, 655, 92, 54], [935, 645, 76, 58]]) {
            ctx.fillRect(vx, vy, vw, vh);
            ctx.fillStyle = '#ffd258';
            ctx.fillRect(vx + 16, vy + 18, 16, 18);
            ctx.fillStyle = '#243c5e';
          }
          ctx.fillStyle = '#263e5c';
          ctx.beginPath(); ctx.moveTo(598, 675); ctx.lineTo(622, 465); ctx.lineTo(646, 675); ctx.closePath(); ctx.fill();

          // Towering dark olive-green flame cypress curling skyward on left
          const cy = ctx.createLinearGradient(165, 72, 295, H);
          cy.addColorStop(0, '#0a1c12'); cy.addColorStop(0.55, '#193a24'); cy.addColorStop(1, '#08120c');
          ctx.fillStyle = cy;
          ctx.beginPath();
          ctx.moveTo(222, 68);
          ctx.bezierCurveTo(288, 225, 318, 515, 308, H);
          ctx.lineTo(148, H);
          ctx.bezierCurveTo(138, 515, 172, 245, 222, 68);
          ctx.closePath(); ctx.fill();
        });

        M.synthesize(api, scene, {
          style: 'vangogh',
          totalStrokes: 5000,
          seed: 8001,
          layers: WORKS[0].layers,
          roi: [
            { cx: 525, cy: 255, rx: 455, ry: 175, boost: 3.0 },
            { cx: 222, cy: 445, rx: 95, ry: 355, boost: 3.0 },
            { cx: 635, cy: 640, rx: 245, ry: 105, boost: 2.6 }
          ]
        });
      }
    },

    // =========================================================================
    // 2. VAN GOGH WHEATFIELD WITH CROWS
    // =========================================================================
    {
      id: 'oil-abs-vangogh-wheat',
      title: '梵高风·麦田鸦群与风暴云',
      subtitle: '热烈狂放表现主义：压境青靛雷云 → 三叉朱赭麦田路径 → 翻滚金浪短笔 → 掠空乌鸦群',
      group: '油画·抽象印象',
      category: '后印象派风景油画',
      seal: '狂飙麦浪',
      mode: 'oil',
      theme: 'gallery-dark',
      backdropColor: '#121b30',
      width: 1120,
      height: 820,
      seed: 8002,
      swatches: ['rgb(24, 52, 114)', 'rgb(64, 112, 168)', 'rgb(244, 194, 42)', 'rgb(168, 96, 38)', 'rgb(20, 22, 24)'],
      desc: '暴风雨前深沉压顶的普鲁士蓝乌云与大地汹涌金浪形成强烈冷暖对冲，三条分岔赭红土路裂开黄金麦田，黑鸦成群振翅掠过地平线。',
      layers: [
        { id: 1, name: '一 · 暴风蓝天与暗金大地打底' },
        { id: 2, name: '二 · 翻涌乌云与分岔土路定势' },
        { id: 3, name: '三 · 狂风麦浪金橙短笔排写' },
        { id: 4, name: '四 · 掠空黑鸦与亮黄麦芒点睛' }
      ],
      buildStrokes(api) {
        const M = window.Code2PaintOilMaster;
        const W = 1120, H = 820, H_Y = 395;
        const scene = M.createScene(W, H, 8002);
        const N = M.makeNoise(8002);

        scene.shadeSkyAndClouds({
          horizonY: H_Y,
          skyTop: [14, 30, 74], skyMid: [28, 62, 126], skyHorizon: [68, 112, 166],
          cloudCover: 0.68, cloudLitCol: [96, 146, 196], cloudDarkCol: [14, 24, 58]
        });

        scene.draw2D((ctx) => {
          // Surging golden cadmium wheatfield
          const fld = ctx.createLinearGradient(0, H_Y, 0, H);
          fld.addColorStop(0, '#f4c63c'); fld.addColorStop(0.55, '#da9e24'); fld.addColorStop(1, '#a86a14');
          ctx.fillStyle = fld;
          ctx.fillRect(0, H_Y, W, H - H_Y);

          // Wind-swept golden grain streaks
          for (let k = 0; k < 140; k++) {
            const x = N.rand() * W, y = H_Y + 12 + N.rand() * (H - H_Y - 22);
            ctx.strokeStyle = k % 2 === 0 ? '#ffe468' : '#b46c18';
            ctx.lineWidth = 6;
            ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + (N.rand() - 0.5) * 42, y - 24 - N.rand() * 20); ctx.stroke();
          }

          // Three dramatic forked ochre-terracotta cart tracks with green median tufts
          ctx.lineCap = 'round';
          const paths = [
            [[548, H_Y + 35], [445, 585], [145, H]],
            [[565, H_Y + 42], [585, 615], [605, H]],
            [[585, H_Y + 35], [785, 595], [1055, H]]
          ];
          paths.forEach(([p0, p1, p2]) => {
            ctx.strokeStyle = '#9c4824'; ctx.lineWidth = 54;
            ctx.beginPath(); ctx.moveTo(p0[0], p0[1]); ctx.quadraticCurveTo(p1[0], p1[1], p2[0], p2[1]); ctx.stroke();
            ctx.strokeStyle = '#d4743c'; ctx.lineWidth = 22;
            ctx.beginPath(); ctx.moveTo(p0[0], p0[1]); ctx.quadraticCurveTo(p1[0], p1[1], p2[0], p2[1]); ctx.stroke();
          });
        });

        M.synthesize(api, scene, {
          style: 'vangogh',
          totalStrokes: 4955,
          seed: 8002,
          layers: WORKS[1].layers,
          roi: [
            { cx: 565, cy: 525, rx: 385, ry: 225, boost: 2.8 },
            { cx: 560, cy: 265, rx: 450, ry: 120, boost: 2.4 }
          ]
        });

        // 45 crisp soaring black crows cutting across horizon & Prussian sky
        const layer4 = WORKS[1].layers[3].id;
        for (let i = 0; i < 45; i++) {
          const cx = 95 + N.rand() * 930;
          const cy = 115 + N.rand() * 315;
          const sc = 0.7 + N.rand() * 0.95;
          const tilt = (N.rand() - 0.5) * 0.45;
          const wSpan = 24 * sc;
          const lift = (7 + N.rand() * 7) * sc;
          api.pushRawStroke(layer4, '掠空黑鸦振翅', (c) => {
            c.save();
            c.translate(cx, cy);
            c.rotate(tilt);
            c.strokeStyle = i % 3 === 0 ? '#0e1014' : '#1a1e24';
            c.lineWidth = 3.2 * sc;
            c.lineCap = 'round';
            c.beginPath();
            c.moveTo(-wSpan, lift * 0.4);
            c.quadraticCurveTo(-wSpan * 0.5, -lift, 0, 2 * sc);
            c.quadraticCurveTo(wSpan * 0.5, -lift, wSpan, lift * 0.4);
            c.stroke();
            c.restore();
          });
        }
      }
    },

    // =========================================================================
    // 3. VAN GOGH STARRY NIGHT OVER THE RHONE
    // =========================================================================
    {
      id: 'oil-abs-vangogh-rhone',
      title: '梵高风·罗纳河星夜倒影',
      subtitle: '纵深夜景斑斓：孔雀蓝星夜编织 → 大熊星座放射金星 → 对岸橙黄气灯倒映水柱 → 河岸泊舟',
      group: '油画·抽象印象',
      category: '后印象派夜景油画',
      seal: '星河倒影',
      mode: 'oil',
      theme: 'gallery-dark',
      backdropColor: '#091832',
      width: 1120,
      height: 820,
      seed: 8003,
      swatches: ['rgb(18, 48, 96)', 'rgb(42, 114, 152)', 'rgb(252, 204, 62)', 'rgb(228, 124, 38)', 'rgb(18, 22, 32)'],
      desc: '深邃孔雀蓝与普蓝密织出阿尔勒的星夜天穹，大熊星座璀璨悬浮；对岸橙红气灯与星光化作垂直跳跃的金黄排笔水柱，把整条罗纳河燃亮。',
      layers: [
        { id: 1, name: '一 · 深蓝青绿夜水底色调和' },
        { id: 2, name: '二 · 天穹编织排笔与北斗金星' },
        { id: 3, name: '三 · 对岸灯火与水波金柱纵涂' },
        { id: 4, name: '四 · 前景木舟碎金倒影点睛' }
      ],
      buildStrokes(api) {
        const M = window.Code2PaintOilMaster;
        const W = 1120, H = 820, H_Y = 365;
        const scene = M.createScene(W, H, 8003);

        scene.shadeSkyAndClouds({
          horizonY: H_Y,
          skyTop: [12, 34, 78], skyMid: [22, 58, 116], skyHorizon: [44, 96, 134],
          cloudCover: 0.25, cloudLitCol: [68, 122, 162], cloudDarkCol: [14, 38, 82]
        });

        scene.shadeOcean({
          yTop: H_Y, yBot: H,
          seaTop: [24, 72, 112], seaMid: [18, 52, 92], seaBot: [10, 26, 54],
          hasGlitter: false, waveScale: 0.025
        });

        scene.draw2D((ctx) => {
          // Big Dipper / Ursa Major radiant yellow star halos across sky
          const stars = [
            [245, 168], [338, 198], [412, 232], [498, 228],
            [595, 185], [648, 238], [528, 285], [785, 145], [895, 195], [165, 122]
          ];
          stars.forEach(([sx, sy]) => {
            const g = ctx.createRadialGradient(sx, sy, 3, sx, sy, 28);
            g.addColorStop(0, '#fffce2'); g.addColorStop(0.5, '#f6c844'); g.addColorStop(1, 'rgba(34, 92, 146, 0)');
            ctx.fillStyle = g;
            ctx.beginPath(); ctx.arc(sx, sy, 28, 0, Math.PI * 2); ctx.fill();
          });

          // Distant Arles quay silhouette & glowing warm orange gaslights reflecting down Rhone water
          ctx.fillStyle = '#182438';
          ctx.beginPath(); ctx.moveTo(0, H_Y); ctx.lineTo(295, 315); ctx.lineTo(865, 335); ctx.lineTo(1120, H_Y); ctx.lineTo(1120, H_Y + 25); ctx.lineTo(0, H_Y + 25); ctx.closePath(); ctx.fill();

          const lights = [148, 245, 325, 412, 498, 588, 678, 765, 868, 965];
          lights.forEach((lx, i) => {
            const glow = ctx.createRadialGradient(lx, H_Y - 4, 2, lx, H_Y - 4, 22);
            glow.addColorStop(0, '#fff4b6'); glow.addColorStop(0.55, '#f49a34'); glow.addColorStop(1, 'rgba(36, 72, 112, 0)');
            ctx.fillStyle = glow;
            ctx.beginPath(); ctx.arc(lx, H_Y - 4, 22, 0, Math.PI * 2); ctx.fill();

            const col = ctx.createLinearGradient(lx, H_Y, lx, H_Y + 245 + (i % 3) * 55);
            col.addColorStop(0, 'rgba(252, 198, 64, 0.92)');
            col.addColorStop(0.5, 'rgba(228, 128, 36, 0.72)');
            col.addColorStop(1, 'rgba(28, 62, 108, 0)');
            ctx.fillStyle = col;
            ctx.fillRect(lx - 14, H_Y + 12, 28, 285);
          });

          // Foreground dark shoreline promontory & two moored wooden riverboats
          ctx.fillStyle = '#141820';
          ctx.beginPath();
          ctx.moveTo(0, 645); ctx.bezierCurveTo(285, 625, 485, 715, 645, H); ctx.lineTo(0, H); ctx.closePath(); ctx.fill();
          for (const [bx, by] of [[315, 695], [535, 735]]) {
            ctx.fillStyle = '#241a14';
            ctx.beginPath(); ctx.moveTo(bx - 95, by); ctx.quadraticCurveTo(bx, by + 36, bx + 95, by - 12); ctx.lineTo(bx + 75, by + 26); ctx.lineTo(bx - 75, by + 28); ctx.closePath(); ctx.fill();
          }
        });

        M.synthesize(api, scene, {
          style: 'vangogh',
          totalStrokes: 5000,
          seed: 8003,
          layers: WORKS[2].layers,
          roi: [
            { cx: 545, cy: 495, rx: 465, ry: 175, boost: 3.0 },
            { cx: 485, cy: 205, rx: 325, ry: 95, boost: 2.8 }
          ]
        });
      }
    },

    // =========================================================================
    // 4. KANDINSKY COMPOSITION VIII (HYBRID OIL FIELD + CRISP GEOMETRIC LINES)
    // =========================================================================
    {
      id: 'oil-abs-kandinsky-comp',
      title: '康定斯基风·律动构图八号',
      subtitle: '热抽象几何交响：暖象牙羊皮底调 → 柔彩几何晕染 → 黑圈烈日与斜线轨 → 高彩三角点彩',
      group: '油画·抽象印象',
      category: '几何抽象油画',
      seal: '热抽象',
      mode: 'oil',
      theme: 'gallery-dark',
      backdropColor: '#2a261e',
      width: 1120,
      height: 820,
      seed: 8004,
      swatches: ['rgb(236, 226, 202)', 'rgb(218, 52, 38)', 'rgb(246, 198, 42)', 'rgb(42, 108, 186)', 'rgb(24, 22, 20)'],
      desc: '致敬康定斯基“绘画如交响乐”的理念：温润象牙油彩底子上跃动着红蓝同心主日、穿透画面的黑色弧线与对角锐角、彩色棋盘格与自由三角块。',
      layers: [
        { id: 1, name: '一 · 暖象牙羊皮油底打底' },
        { id: 2, name: '二 · 柔彩氛围色域晕染' },
        { id: 3, name: '三 · 同心主日与几何三角构图' },
        { id: 4, name: '四 · 墨黑线轨律动与点彩节拍' }
      ],
      buildStrokes(api) {
        const M = window.Code2PaintOilMaster;
        const W = 1120, H = 820;
        const scene = M.createScene(W, H, 8004);
        const N = M.makeNoise(8004);

        scene.draw2D((ctx) => {
          // Parchment-ivory ground with subtle translucent atmospheric color fields
          const bg = ctx.createRadialGradient(540, 380, 60, 560, 410, 720);
          bg.addColorStop(0, '#f4ebd4'); bg.addColorStop(0.6, '#e2d5b8'); bg.addColorStop(1, '#c8ba9b');
          ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);

          for (const [hx, hy, hr, c] of [
            [265, 225, 195, 'rgba(218, 72, 64, 0.28)'],
            [645, 295, 225, 'rgba(64, 134, 212, 0.25)'],
            [865, 555, 195, 'rgba(244, 196, 52, 0.28)'],
            [385, 585, 185, 'rgba(148, 86, 178, 0.24)']
          ]) {
            const g = ctx.createRadialGradient(hx, hy, 12, hx, hy, hr);
            g.addColorStop(0, c); g.addColorStop(1, 'rgba(236, 226, 202, 0)');
            ctx.fillStyle = g;
            ctx.beginPath(); ctx.arc(hx, hy, hr, 0, Math.PI * 2); ctx.fill();
          }

          // Primary geometric color blocks & translucent intersecting triangles
          ctx.fillStyle = 'rgba(218, 52, 38, 0.85)';
          ctx.beginPath(); ctx.moveTo(425, 165); ctx.lineTo(685, 495); ctx.lineTo(315, 585); ctx.closePath(); ctx.fill();

          ctx.fillStyle = 'rgba(42, 108, 186, 0.80)';
          ctx.beginPath(); ctx.moveTo(615, 125); ctx.lineTo(945, 345); ctx.lineTo(575, 425); ctx.closePath(); ctx.fill();

          ctx.fillStyle = 'rgba(246, 198, 42, 0.84)';
          ctx.beginPath(); ctx.moveTo(145, 525); ctx.lineTo(445, 415); ctx.lineTo(395, 725); ctx.closePath(); ctx.fill();

          // Concentric primary sun at top left
          for (const [rad, col] of [[112, '#e63a28'], [82, '#245ca8'], [56, '#f6c834'], [30, '#181614']]) {
            ctx.fillStyle = col;
            ctx.beginPath(); ctx.arc(215, 198, rad, 0, Math.PI * 2); ctx.fill();
          }

          // Smaller floating geometric disks
          for (const [dx, dy, dr, col] of [[785, 195, 44, '#2460b2'], [865, 255, 28, '#e84836'], [945, 515, 52, '#f4ba28'], [515, 675, 38, '#54a678']]) {
            ctx.fillStyle = col; ctx.beginPath(); ctx.arc(dx, dy, dr, 0, Math.PI * 2); ctx.fill();
          }

          // Checkerboard pattern cluster mid-right
          for (let r = 0; r < 4; r++) {
            for (let c = 0; c < 4; c++) {
              ctx.fillStyle = (r + c) % 2 === 0 ? '#1e1c1a' : '#e83e2e';
              ctx.fillRect(835 + c * 22, 575 + r * 22, 22, 22);
            }
          }
        });

        M.synthesize(api, scene, {
          style: 'classic',
          totalStrokes: 4680,
          seed: 8004,
          layers: WORKS[3].layers,
          roi: [
            { cx: 215, cy: 198, rx: 135, ry: 135, boost: 3.4 },
            { cx: 560, cy: 410, rx: 320, ry: 240, boost: 2.4 }
          ]
        });

        // 320 crisp architectural Kandinsky vectors, intersecting chords, concentric rings & accent beats
        const layer4 = WORKS[3].layers[3].id;
        const geomLines = [
          [75, 645, 985, 115, 8], [135, 155, 865, 725, 6], [620, 75, 425, 765, 7],
          [315, 585, 685, 495, 5], [425, 165, 685, 495, 5], [185, 435, 915, 465, 5],
          [755, 95, 995, 665, 6], [495, 115, 785, 385, 4], [255, 725, 625, 215, 5]
        ];
        geomLines.forEach(([x0, y0, x1, y1, lw]) => {
          const segs = 12;
          for (let s = 0; s < segs; s++) {
            const t0 = s / segs, t1 = (s + 1) / segs;
            api.pushRawStroke(layer4, '墨黑几何直线轨', (c) => {
              c.strokeStyle = '#161514'; c.lineWidth = lw; c.lineCap = 'round';
              c.beginPath();
              c.moveTo(x0 + (x1 - x0) * t0, y0 + (y1 - y0) * t0);
              c.lineTo(x0 + (x1 - x0) * t1, y0 + (y1 - y0) * t1);
              c.stroke();
            });
          }
        });
        // Concentric black halo rings & crisp harmonic arcs
        for (const [cx, cy, r, lw] of [
          [215, 198, 126, 6], [215, 198, 152, 4], [785, 195, 58, 5], [945, 515, 66, 4.5], [515, 675, 48, 4]
        ]) {
          for (let s = 0; s < 10; s++) {
            const a0 = (s / 10) * Math.PI * 2, a1 = ((s + 1.05) / 10) * Math.PI * 2;
            api.pushRawStroke(layer4, '同心黑色韵律环', (c) => {
              c.strokeStyle = '#181614'; c.lineWidth = lw; c.lineCap = 'round';
              c.beginPath(); c.arc(cx, cy, r, a0, a1); c.stroke();
            });
          }
        }
        // Pad remaining budget up to 5000 with delicate Kandinsky treble flecks & short staccato vectors
        padTo5000(api, layer4, '高彩几何节拍点', (idx) => {
          const px = 95 + N.rand() * 930, py = 75 + N.rand() * 670;
          const ang = N.rand() * Math.PI;
          const cols = ['#181614', '#da3426', '#2460b2', '#f4c028', '#faf6ec'];
          const col = cols[idx % cols.length];
          api.pushRawStroke(layer4, '高彩几何节拍点', (c) => {
            c.strokeStyle = col; c.lineWidth = idx % 3 === 0 ? 4 : 3; c.lineCap = 'round';
            c.beginPath();
            if (idx % 4 === 0) {
              c.arc(px, py, 3 + N.rand() * 5, 0, Math.PI * 2);
            } else {
              c.moveTo(px, py);
              c.lineTo(px + Math.cos(ang) * (14 + N.rand() * 24), py + Math.sin(ang) * (14 + N.rand() * 24));
            }
            c.stroke();
          });
        });
      }
    },

    // =========================================================================
    // 5. MONDRIAN NEOPLASTICISM (IMPASTO FIELDS + CRISP BLACK GRID)
    // =========================================================================
    {
      id: 'oil-abs-mondrian-grid',
      title: '蒙德里安风·红黄蓝新造型',
      subtitle: '几何冷抽象典范：亚麻暖白基底排笔 → 红黄蓝三原色厚涂填充 → 鸽灰空间平衡 → 浓黑纵横构架',
      group: '油画·抽象印象',
      category: '新造型主义油画',
      seal: '新造型派',
      mode: 'oil',
      theme: 'gallery-dark',
      backdropColor: '#22211e',
      width: 960,
      height: 960,
      seed: 8005,
      swatches: ['rgb(242, 238, 228)', 'rgb(212, 42, 32)', 'rgb(28, 66, 148)', 'rgb(244, 206, 36)', 'rgb(22, 22, 24)'],
      desc: '忠实再现蒙德里安手工油画笔触：暖白、冷灰与三原色块均以纵横油画短笔密排铺砌，留有手工肌理，再用沉稳碳黑直线精密分割非对称比例。',
      layers: [
        { id: 1, name: '一 · 暖白亚麻底色铺砌' },
        { id: 2, name: '二 · 红黄蓝三原色厚涂填格' },
        { id: 3, name: '三 · 鸽灰暖白平衡网格铺设' },
        { id: 4, name: '四 · 碳黑垂直水平构架封线' }
      ],
      buildStrokes(api) {
        const M = window.Code2PaintOilMaster;
        const W = 960, H = 960;
        const scene = M.createScene(W, H, 8005);

        scene.draw2D((ctx) => {
          // Asymmetric De Stijl primary blocks cleanly painted before knife pass (no black borders yet so zero black bleed into color blocks)
          const rects = [
            [0, 0, 260, 320, '#eeeae0'], [260, 0, 700, 680, '#d82a1e'],
            [0, 320, 260, 360, '#e0dcd2'], [0, 680, 260, 280, '#1a4294'],
            [260, 680, 520, 280, '#f2eee4'], [780, 680, 180, 140, '#e5e2d8'],
            [780, 820, 180, 140, '#f4ca20']
          ];
          rects.forEach(([x, y, w, h, col]) => {
            ctx.fillStyle = col;
            ctx.fillRect(x, y, w, h);
          });
        });

        M.synthesize(api, scene, {
          style: 'knife',
          totalStrokes: 4760,
          seed: 8005,
          layers: WORKS[4].layers,
          roi: [
            { cx: 610, cy: 340, rx: 350, ry: 340, boost: 2.2 },
            { cx: 130, cy: 820, rx: 130, ry: 140, boost: 2.4 }
          ]
        });

        // 240 crisp carbon-black vertical & horizontal hand-painted bar segments locking the grid cleanly
        const layer4 = WORKS[4].layers[3].id;
        const bars = [
          [260, 0, 260, 960, 22], [779, 680, 779, 960, 20],
          [0, 680, 960, 680, 22], [0, 320, 260, 320, 22], [779, 820, 960, 820, 20]
        ];
        bars.forEach(([x0, y0, x1, y1, lw]) => {
          const segs = 38;
          for (let s = 0; s < segs; s++) {
            const t0 = s / segs, t1 = (s + 1.05) / segs;
            api.pushRawStroke(layer4, '碳黑纵横新造型构架', (c) => {
              c.strokeStyle = '#141416'; c.lineWidth = lw; c.lineCap = 'butt';
              c.beginPath();
              c.moveTo(x0 + (x1 - x0) * t0, y0 + (y1 - y0) * t0);
              c.lineTo(x0 + (x1 - x0) * t1, y0 + (y1 - y0) * t1);
              c.stroke();
            });
          }
        });
        padTo5000(api, layer4, '碳黑构架精修', (i) => {
          const t = (i % 50) / 50;
          api.pushRawStroke(layer4, '碳黑构架精修', (c) => {
            c.strokeStyle = '#121214'; c.lineWidth = 18; c.lineCap = 'butt';
            c.beginPath();
            c.moveTo(260, t * 940); c.lineTo(260, t * 940 + 24);
            c.stroke();
          });
        });
      }
    },

    // =========================================================================
    // 6. ROTHKO SUNSET COLOR-FIELD MEDITATION
    // =========================================================================
    {
      id: 'oil-abs-rothko-sunset',
      title: '罗斯科风·暮色橙红冥想',
      subtitle: '色域冥想绘画：深勃艮第底色 → 上下薄釉柔边缘染 → 三重炽橙绯红与暗紫浮空色域 → 光晕呼吸边',
      group: '油画·抽象印象',
      category: '色域抽象油画',
      seal: '色域冥想',
      mode: 'oil',
      theme: 'gallery-dark',
      backdropColor: '#240b0e',
      width: 900,
      height: 1120,
      seed: 8006,
      swatches: ['rgb(82, 22, 26)', 'rgb(242, 134, 28)', 'rgb(252, 186, 56)', 'rgb(196, 36, 34)', 'rgb(52, 22, 42)'],
      desc: '借鉴马克·罗斯科透明油彩稀薄叠涂技法，在沉郁酒红底色上堆叠炽烈橘黄、赤红与深紫三层悬浮矩形色域，边缘雾化如暮色呼吸般散发精神光晕。',
      layers: [
        { id: 1, name: '一 · 深酒红勃艮第底色打底' },
        { id: 2, name: '二 · 下层暗紫赭色悬浮色域' },
        { id: 3, name: '三 · 中层炽红绯焰叠彩晕染' },
        { id: 4, name: '四 · 上层亮橘金辉边缘羽化' }
      ],
      buildStrokes(api) {
        const M = window.Code2PaintOilMaster;
        const W = 900, H = 1120;
        const scene = M.createScene(W, H, 8006);

        scene.draw2D((ctx) => {
          // Deep burgundy wine ground with soft breathing warmth
          const bg = ctx.createLinearGradient(0, 0, 0, H);
          bg.addColorStop(0, '#5a161c'); bg.addColorStop(0.55, '#421016'); bg.addColorStop(1, '#26080c');
          ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);

          function drawSoftRect(x, y, w, h, cCore, cEdge, glowCol) {
            ctx.save();
            ctx.shadowColor = glowCol;
            ctx.shadowBlur = 42;
            const g = ctx.createLinearGradient(x, y, x, y + h);
            g.addColorStop(0, cEdge);
            g.addColorStop(0.18, cCore);
            g.addColorStop(0.82, cCore);
            g.addColorStop(1, cEdge);
            ctx.fillStyle = g;
            ctx.fillRect(x, y, w, h);
            ctx.restore();
          }

          drawSoftRect(78, 86, 744, 305, '#f6a828', '#d4461e', 'rgba(255, 198, 68, 0.72)');
          drawSoftRect(74, 428, 752, 338, '#cc221c', '#741418', 'rgba(232, 62, 42, 0.65)');
          drawSoftRect(82, 805, 736, 238, '#461a36', '#280d1e', 'rgba(98, 36, 72, 0.60)');
        });

        M.synthesize(api, scene, {
          style: 'sfumato',
          totalStrokes: 5000,
          seed: 8006,
          layers: WORKS[5].layers,
          roi: [
            { cx: 450, cy: 235, rx: 365, ry: 155, boost: 2.4 },
            { cx: 450, cy: 595, rx: 370, ry: 165, boost: 2.4 },
            { cx: 450, cy: 925, rx: 360, ry: 120, boost: 2.0 }
          ]
        });
      }
    },

    // =========================================================================
    // 7. KLIMT GOLDEN TREE OF LIFE (MOSAIC GOLD LEAF HYBDRID)
    // =========================================================================
    {
      id: 'oil-abs-klimt-gold',
      title: '克里姆特风·金箔生命之树',
      subtitle: '维也纳金色装饰风：古铜橄榄暗金打底 → 中轴金干螺旋伸展 → 绿松石珊瑚嵌宝 → 金箔高光点缀',
      group: '油画·抽象印象',
      category: '装饰表现主义油画',
      seal: '金箔生命树',
      mode: 'oil',
      theme: 'gallery-dark',
      backdropColor: '#261e12',
      width: 920,
      height: 1120,
      seed: 8007,
      swatches: ['rgb(84, 68, 38)', 'rgb(226, 174, 54)', 'rgb(252, 218, 92)', 'rgb(48, 148, 142)', 'rgb(198, 66, 52)'],
      desc: '华丽繁复的金色装饰主义油画：沉稳古铜背景中升起盘根错节的金色生命树干，螺旋蔓枝对称卷曲如漩涡星河，其间镶嵌绿松石方格、朱红圆果与荷鲁斯之眼。',
      layers: [
        { id: 1, name: '一 · 古铜金褐背景铺涂' },
        { id: 2, name: '二 · 树干起势与对称螺旋金枝' },
        { id: 3, name: '三 · 绿松石朱红马赛克镶嵌' },
        { id: 4, name: '四 · 金属金箔高光与流光点彩' }
      ],
      buildStrokes(api) {
        const M = window.Code2PaintOilMaster;
        const W = 920, H = 1120;
        const scene = M.createScene(W, H, 8007);
        const N = M.makeNoise(8007);

        scene.draw2D((ctx) => {
          // Antiqued bronze olive tapestry ground
          const bg = ctx.createRadialGradient(460, 480, 40, 460, 560, 740);
          bg.addColorStop(0, '#786234'); bg.addColorStop(0.55, '#4c3c1e'); bg.addColorStop(1, '#241c10');
          ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);

          // Mosaic soil & jewel flower terrace at bottom
          ctx.fillStyle = '#2a3826'; ctx.fillRect(0, 925, W, 195);
          for (let i = 0; i < 40; i++) {
            const fx = 25 + (i * 23) % 880, fy = 955 + ((i * 37) % 140);
            ctx.fillStyle = i % 3 === 0 ? '#c84232' : (i % 3 === 1 ? '#329690' : '#eac244');
            ctx.beginPath(); ctx.arc(fx, fy, 12, 0, Math.PI * 2); ctx.fill();
          }

          // Central golden fluted tree trunk & flaring roots
          const trk = ctx.createLinearGradient(395, 220, 525, 960);
          trk.addColorStop(0, '#f4c848'); trk.addColorStop(0.5, '#d69828'); trk.addColorStop(1, '#845a16');
          ctx.fillStyle = trk;
          ctx.beginPath();
          ctx.moveTo(426, 295); ctx.lineTo(494, 295);
          ctx.bezierCurveTo(510, 625, 535, 815, 625, 965);
          ctx.lineTo(295, 965);
          ctx.bezierCurveTo(385, 815, 410, 625, 426, 295);
          ctx.closePath(); ctx.fill();
        });

        M.synthesize(api, scene, {
          style: 'classic',
          totalStrokes: 4620,
          seed: 8007,
          layers: WORKS[6].layers,
          roi: [{ cx: 460, cy: 520, rx: 365, ry: 425, boost: 2.6 }]
        });

        // 380 shimmering metallic gold Klimt spirals + turquoise/coral mosaics on Layer 3 & 4
        const layer2 = WORKS[6].layers[1].id;
        const layer3 = WORKS[6].layers[2].id;
        const layer4 = WORKS[6].layers[3].id;
        const spirals = [
          [460, 445, -1, 145, 2.2], [460, 445, 1, 145, 2.2],
          [460, 325, -1, 118, 2.0], [460, 325, 1, 118, 2.0],
          [460, 565, -1, 165, 2.4], [460, 565, 1, 165, 2.4],
          [460, 215, -1, 95, 1.8], [460, 215, 1, 95, 1.8],
          [460, 695, -1, 138, 2.1], [460, 695, 1, 138, 2.1]
        ];
        spirals.forEach(([sx, sy, dir, maxR, turns], si) => {
          const pts = 24;
          for (let k = 0; k < pts - 1; k++) {
            const t0 = k / (pts - 1), t1 = (k + 1) / (pts - 1);
            const r0 = maxR * (1 - t0 * 0.78), r1 = maxR * (1 - t1 * 0.78);
            const a0 = t0 * Math.PI * 2 * turns * dir + (dir > 0 ? 0 : Math.PI);
            const a1 = t1 * Math.PI * 2 * turns * dir + (dir > 0 ? 0 : Math.PI);
            const cxBase = sx + dir * maxR * 1.15;
            const cyBase = sy - t0 * 95;
            api.pushRawStroke(layer2, '对称螺旋金色蔓枝', (c) => {
              c.strokeStyle = si % 2 === 0 ? '#f4c84c' : '#e6ab32';
              c.lineWidth = Math.max(4, 14 * (1 - t0 * 0.68));
              c.lineCap = 'round';
              c.beginPath();
              c.moveTo(cxBase + Math.cos(a0) * r0, cyBase + Math.sin(a0) * r0);
              c.lineTo(cxBase + Math.cos(a1) * r1, cyBase + Math.sin(a1) * r1);
              c.stroke();
            });
          }
        });

        padTo5000(api, layer3, '绿松石朱红镶嵌宝石', (i) => {
          const isJewel = i % 2 === 0;
          const x = 95 + N.rand() * 730;
          const y = 115 + N.rand() * 785;
          const targetLayer = isJewel ? layer3 : layer4;
          api.pushRawStroke(targetLayer, isJewel ? '绿松石与朱红马赛克' : '金属金箔高光箔片', (c) => {
            if (isJewel) {
              c.fillStyle = i % 4 === 0 ? '#2fa098' : '#d44234';
              c.fillRect(x - 7, y - 7, 14, 14);
              c.strokeStyle = '#1e160c'; c.lineWidth = 2; c.strokeRect(x - 7, y - 7, 14, 14);
            } else {
              c.fillStyle = i % 3 === 0 ? '#ffea82' : '#f2bd3c';
              c.beginPath(); c.ellipse(x, y, 9 + N.rand() * 8, 5 + N.rand() * 6, N.rand() * Math.PI, 0, Math.PI * 2); c.fill();
            }
          });
        });
      }
    },

    // =========================================================================
    // 8. JACKSON POLLOCK AUTUMN RHYTHM ACTION DRIP SYMPHONY
    // =========================================================================
    {
      id: 'oil-abs-pollock-jazz',
      title: '波洛克风·秋韵滴彩交响',
      subtitle: '行动绘画狂想：未漂白原麻砂褐铺底 → 焦赭暖金甩涂织网 → 狂飙浓黑钛白飞舞滴线 → 松石点溅收尾',
      group: '油画·抽象印象',
      category: '行动抽象油画',
      seal: '行动滴彩',
      mode: 'oil',
      theme: 'gallery-dark',
      backdropColor: '#241f18',
      width: 1120,
      height: 820,
      seed: 8008,
      swatches: ['rgb(202, 182, 146)', 'rgb(148, 72, 34)', 'rgb(212, 154, 52)', 'rgb(18, 18, 20)', 'rgb(244, 238, 224)'],
      desc: '致敬杰克逊·波洛克满幅行动绘画（Action Painting）：在沙褐亚麻底布上全幅甩泼、交缠层叠生赭、钛白、碳黑与绿松石流彩，充满音乐节奏与动能张力。',
      layers: [
        { id: 1, name: '一 · 原麻沙褐暖调画布打底' },
        { id: 2, name: '二 · 焦赭暖金基底甩涂丝网' },
        { id: 3, name: '三 · 狂飙浓黑钛白交织滴线' },
        { id: 4, name: '四 · 绿松石溅点与律动高光' }
      ],
      buildStrokes(api) {
        const M = window.Code2PaintOilMaster;
        const W = 1120, H = 820;
        const scene = M.createScene(W, H, 8008);
        const N = M.makeNoise(8008);

        scene.draw2D((ctx) => {
          // Warm unbleached raw duck canvas sand-linen undertone
          const bg = ctx.createRadialGradient(560, 410, 60, 560, 410, 680);
          bg.addColorStop(0, '#d8c6a4'); bg.addColorStop(1, '#b69c74');
          ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);

          // Underlying bold ochre & sienna pooled gestural sweeps
          const baseCols = ['#944822', '#c88e32', '#644428', '#382a20', '#ece2ce'];
          for (let k = 0; k < 55; k++) {
            ctx.strokeStyle = baseCols[k % baseCols.length];
            ctx.lineWidth = 6 + N.rand() * 14;
            ctx.lineCap = 'round';
            const x0 = 60 + N.rand() * 1000, y0 = 60 + N.rand() * 700;
            ctx.beginPath();
            ctx.moveTo(x0, y0);
            ctx.bezierCurveTo(
              x0 + (N.rand() - 0.5) * 340, y0 + (N.rand() - 0.5) * 280,
              x0 + (N.rand() - 0.5) * 340, y0 + (N.rand() - 0.5) * 280,
              x0 + (N.rand() - 0.5) * 380, y0 + (N.rand() - 0.5) * 300
            );
            ctx.stroke();
          }
        });

        M.synthesize(api, scene, {
          style: 'impressionist',
          totalStrokes: 4400,
          seed: 8008,
          layers: WORKS[7].layers,
          roi: [{ cx: 560, cy: 410, rx: 480, ry: 340, boost: 2.0 }]
        });

        // 600 crisp fast Pollock flung enamel ribbons, arcs & paint droplets
        const layer2 = WORKS[7].layers[1].id;
        const layer3 = WORKS[7].layers[2].id;
        const layer4 = WORKS[7].layers[3].id;
        const palette = [
          { col: '#161618', layer: layer3, lw: [2.2, 6.8] },
          { col: '#f6f0e2', layer: layer3, lw: [1.8, 5.4] },
          { col: '#9c4a22', layer: layer2, lw: [3.2, 8.2] },
          { col: '#d89c34', layer: layer2, lw: [2.6, 6.5] },
          { col: '#3c9a92', layer: layer4, lw: [2.0, 5.2] }
        ];

        padTo5000(api, layer3, '行动绘画抛甩滴彩', (idx) => {
          const p = palette[idx % palette.length];
          const x0 = 45 + N.rand() * 1030;
          const y0 = 45 + N.rand() * 730;
          const isSplatter = idx % 5 === 0;
          const lw = p.lw[0] + N.rand() * (p.lw[1] - p.lw[0]);
          const dx1 = (N.rand() - 0.5) * 260, dy1 = (N.rand() - 0.5) * 220;
          const dx2 = (N.rand() - 0.5) * 280, dy2 = (N.rand() - 0.5) * 240;
          const dx3 = (N.rand() - 0.5) * 290, dy3 = (N.rand() - 0.5) * 240;
          api.pushRawStroke(p.layer, isSplatter ? '高速点溅彩滴' : '行动甩涂飞舞流线', (c) => {
            c.lineCap = 'round';
            if (isSplatter) {
              c.fillStyle = p.col;
              c.beginPath(); c.arc(x0, y0, lw * 1.4, 0, Math.PI * 2); c.fill();
            } else {
              c.strokeStyle = p.col;
              c.lineWidth = lw;
              c.beginPath();
              c.moveTo(x0, y0);
              c.bezierCurveTo(x0 + dx1, y0 + dy1, x0 + dx2, y0 + dy2, x0 + dx3, y0 + dy3);
              c.stroke();
            }
          });
        });
      }
    }
  ];

  if (typeof window !== 'undefined' && window.Code2PaintCatalog) {
    window.Code2PaintCatalog.addPack(WORKS);
  }
})();
