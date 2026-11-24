(function () {
  'use strict';

  const lerp = (a, b, t) => a + (b - a) * t;

  function drawTubeCurve(ctx, pts, radius, colLit, colDark) {
    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = colDark;
    ctx.lineWidth = radius * 2;
    ctx.beginPath();
    ctx.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
    ctx.stroke();
    ctx.strokeStyle = colLit;
    ctx.lineWidth = radius * 0.9;
    ctx.beginPath();
    ctx.moveTo(pts[0][0] - radius * 0.25, pts[0][1] - radius * 0.25);
    for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0] - radius * 0.25, pts[i][1] - radius * 0.25);
    ctx.stroke();
    ctx.restore();
  }

  function paintRoseOrPeony(ctx, cx, cy, r, cDark, cMid, cLit, N) {
    const cg = ctx.createRadialGradient(cx - r * 0.25, cy - r * 0.25, r * 0.1, cx, cy, r);
    cg.addColorStop(0, cLit);
    cg.addColorStop(0.55, cMid);
    cg.addColorStop(1, cDark);
    ctx.fillStyle = cg;
    ctx.beginPath(); ctx.ellipse(cx, cy, r, r * 0.9, 0, 0, Math.PI * 2); ctx.fill();

    // Sculpted concentric cupping petals illuminated from upper-left
    for (let ring = 0; ring < 3; ring++) {
      const cnt = 8 - ring * 2;
      const rad = r * (0.68 - ring * 0.22);
      for (let k = 0; k < cnt; k++) {
        const a = (k / cnt) * Math.PI * 2 + ring * 0.55 + N.rand() * 0.2;
        const px = cx + Math.cos(a) * rad, py = cy + Math.sin(a) * rad * 0.85;
        const isLit = Math.cos(a + 2.3) > 0;
        ctx.fillStyle = isLit ? cLit : (ring === 2 ? cDark : cMid);
        ctx.beginPath();
        ctx.ellipse(px, py, r * (0.34 - ring * 0.06), r * (0.22 - ring * 0.04), a + Math.PI * 0.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.fillStyle = '#f8d24c';
    ctx.beginPath(); ctx.arc(cx, cy, r * 0.11, 0, Math.PI * 2); ctx.fill();
  }

  const WORKS = [
    // =========================================================================
    // 1. PALETTE KNIFE IMPASTO: PARIS RAINY BOULEVARD AT NIGHT
    // =========================================================================
    {
      id: 'oil-tut-10-knife-rain',
      title: '刮刀厚涂教程·雨夜巴黎霓虹街景',
      subtitle: '画刀厚涂技法（3D雨街透视 + 5000笔宽厚刀痕）：雾靛夜幕 → 豪斯曼建筑压刀 → 猩红咖啡篷与华灯 → 湿路面纵刮倒影 → 伞下行人',
      group: '油画·经典教程',
      category: '画刀厚涂教程',
      seal: '刮刀厚涂',
      mode: 'oil',
      theme: 'gallery-dark',
      backdropColor: '#0e1624',
      width: 1120,
      height: 820,
      seed: 9101,
      swatches: ['rgb(24, 38, 66)', 'rgb(218, 56, 42)', 'rgb(252, 198, 72)', 'rgb(118, 162, 198)', 'rgb(18, 18, 22)'],
      desc: '经典大画刀厚涂街景教程（Leonid Afremov风格）：用平凿刮刀笔触刻画豪斯曼建筑透视、通透暖橘咖啡店橱窗，并在湿漉青石路面上纵向铺设炽烈倒影光带。',
      layers: [
        { id: 1, name: '一 · 雾靛暮雨夜空大底铺涂' },
        { id: 2, name: '二 · 透视街廓与豪斯曼建筑体块' },
        { id: 3, name: '三 · 霓虹橱窗、红篷与街道街灯' },
        { id: 4, name: '四 · 湿石路面画刀纵刮倒影光带' },
        { id: 5, name: '五 · 伞下行人剪影与刀锋炽白高光' }
      ],
      buildStrokes(api) {
        const M = window.Code2PaintOilMaster;
        const W = 1120, H = 820, H_Y = 486;
        const scene = M.createScene(W, H, 9101);

        scene.shadeSkyAndClouds({
          horizonY: H_Y + 10,
          skyTop: [14, 24, 44],
          skyMid: [28, 46, 78],
          skyHorizon: [72, 86, 118],
          sunX: 560, sunY: 465, glowR: 260, glowCol: [146, 122, 108], glowStrength: 0.42,
          cloudCover: 0.52, cloudLitCol: [96, 118, 152], cloudDarkCol: [18, 26, 48]
        });

        scene.shadeOcean({
          yTop: H_Y, yBot: H,
          seaTop: [46, 56, 82], seaMid: [26, 36, 56], seaBot: [14, 20, 32],
          sunX: 560, glitterCol: [252, 186, 68], glitterSpread: 380, glitterStrength: 0.56,
          waveScale: 0.032, skyMix: 0.25
        });

        // Haussmann facades, glowing cafés, streetlamp halos, vertical rain reflections & umbrella couples
        scene.draw2D((ctx, w, h, N) => {
          // Left & right Haussmann limestone facades receding to center vanishing point
          const lg = ctx.createLinearGradient(0, 200, 460, 480);
          lg.addColorStop(0, '#263046'); lg.addColorStop(1, '#364462');
          ctx.fillStyle = lg;
          ctx.beginPath(); ctx.moveTo(0, 60); ctx.lineTo(465, 295); ctx.lineTo(465, 486); ctx.lineTo(0, 496); ctx.fill();

          const rg = ctx.createLinearGradient(w, 200, 655, 480);
          rg.addColorStop(0, '#222b40'); rg.addColorStop(1, '#323f5c');
          ctx.fillStyle = rg;
          ctx.beginPath(); ctx.moveTo(w, 52); ctx.lineTo(655, 295); ctx.lineTo(655, 486); ctx.lineTo(w, 498); ctx.fill();

          // Slate roofs
          ctx.fillStyle = '#151c2c';
          ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(465, 265); ctx.lineTo(465, 295); ctx.lineTo(0, 60); ctx.fill();
          ctx.beginPath(); ctx.moveTo(w, 0); ctx.lineTo(655, 265); ctx.lineTo(655, 295); ctx.lineTo(w, 52); ctx.fill();

          // Apartment lit windows
          for (let row = 0; row < 2; row++) {
            for (let k = 0; k < 5; k++) {
              const t = k / 5;
              ctx.fillStyle = (k + row) % 2 ? '#f2ae3d' : '#7ea8d4';
              ctx.fillRect(35 + t * 380, 145 + row * 72 + t * 155, 32 * (1 - t * 0.55), 38 * (1 - t * 0.55));
              ctx.fillRect(w - 65 - t * 380, 140 + row * 72 + t * 155, 32 * (1 - t * 0.55), 38 * (1 - t * 0.55));
            }
          }

          // Illuminated café storefronts & crimson awnings
          ctx.fillStyle = '#d42c24';
          ctx.beginPath(); ctx.moveTo(0, 368); ctx.lineTo(368, 434); ctx.lineTo(368, 456); ctx.lineTo(0, 412); ctx.fill();
          ctx.fillStyle = '#f8b83c';
          ctx.beginPath(); ctx.moveTo(0, 412); ctx.lineTo(362, 456); ctx.lineTo(362, 486); ctx.lineTo(0, 488); ctx.fill();

          ctx.fillStyle = '#c42c3c';
          ctx.beginPath(); ctx.moveTo(w, 366); ctx.lineTo(762, 434); ctx.lineTo(762, 456); ctx.lineTo(w, 412); ctx.fill();
          ctx.fillStyle = '#f4ad38';
          ctx.beginPath(); ctx.moveTo(w, 412); ctx.lineTo(768, 456); ctx.lineTo(768, 486); ctx.lineTo(w, 488); ctx.fill();

          // Soft neon/gold puddle bounce under cafés & vertical palette-knife color reflections on wet street
          const glowL = ctx.createRadialGradient(220, 620, 20, 220, 620, 240);
          glowL.addColorStop(0, 'rgba(248, 148, 46, 0.58)'); glowL.addColorStop(1, 'rgba(248, 148, 46, 0)');
          ctx.fillStyle = glowL; ctx.fillRect(0, 486, 480, 334);

          const glowR = ctx.createRadialGradient(900, 625, 20, 900, 625, 240);
          glowR.addColorStop(0, 'rgba(232, 112, 54, 0.54)'); glowR.addColorStop(1, 'rgba(232, 112, 54, 0)');
          ctx.fillStyle = glowR; ctx.fillRect(640, 486, 480, 334);

          const knifeCols = ['#fcc43e', '#e23a2c', '#74a8d4', '#f88630', '#ffec86'];
          for (let i = 0; i < 85; i++) {
            const rx = 35 + N.rand() * 1050;
            const ry = 505 + N.rand() * 270;
            const rh = 24 + ((ry - 505) / 270) * 65;
            const rw = 8 + (i % 3) * 4;
            ctx.fillStyle = knifeCols[i % knifeCols.length];
            ctx.globalAlpha = 0.72 + N.rand() * 0.25;
            ctx.fillRect(rx, ry, rw, rh);
          }
          ctx.globalAlpha = 1;

          // Lamps receding down boulevard
          [[210, 315, 22], [350, 365, 16], [448, 398, 12], [895, 312, 22], [755, 368, 16], [662, 400, 12]].forEach(([lx, ly, r]) => {
            ctx.strokeStyle = '#12141a'; ctx.lineWidth = r * 0.4;
            ctx.beginPath(); ctx.moveTo(lx, ly); ctx.lineTo(lx, 510); ctx.stroke();
            const lg = ctx.createRadialGradient(lx, ly, r * 0.2, lx, ly, r * 3.2);
            lg.addColorStop(0, '#fffad0'); lg.addColorStop(0.25, '#fcba3a'); lg.addColorStop(1, 'rgba(252,186,58,0)');
            ctx.fillStyle = lg;
            ctx.beginPath(); ctx.arc(lx, ly, r * 3.2, 0, Math.PI * 2); ctx.fill();
          });

          // Umbrella silhouettes walking down center boulevard + reflections
          [[396, 610, 1.0, '#d83228'], [432, 622, 0.96, '#d83228'], [716, 574, 0.85, '#3a92ba'], [550, 535, 0.65, '#eeb238']].forEach(([wx, wy, sc, uCol]) => {
            ctx.fillStyle = 'rgba(14, 16, 22, 0.72)';
            ctx.fillRect(wx - 7 * sc, wy, 14 * sc, 52 * sc);
            ctx.fillStyle = '#101218';
            ctx.fillRect(wx - 8 * sc, wy - 72 * sc, 16 * sc, 72 * sc);
            ctx.fillStyle = uCol;
            ctx.beginPath();
            ctx.arc(wx, wy - 64 * sc, 30 * sc, Math.PI * 1.06, Math.PI * 1.94);
            ctx.fill();
          });
        });

        M.synthesize(api, scene, {
          style: 'knife',
          totalStrokes: 5000,
          seed: 9101,
          layers: WORKS[0].layers,
          roi: [
            { cx: 560, cy: 560, rx: 320, ry: 210, boost: 2.8 },
            { cx: 210, cy: 400, rx: 185, ry: 120, boost: 2.4 },
            { cx: 900, cy: 400, rx: 185, ry: 120, boost: 2.4 }
          ]
        });
      }
    },

    // =========================================================================
    // 2. SFUMATO & LUMINOUS GLAZING: MISTY VENICE DAWN (TURNER / COROT)
    // =========================================================================
    {
      id: 'oil-tut-10-sfumato-mist',
      title: '薄涂晕染教程·雾锁威尼斯圣马可晨曦',
      subtitle: '古典薄涂透明罩染法（Sfumato + 5000笔柔边薄扫）：金玫薄雾 → 隐约穹顶与钟楼 → 破雾晨阳 → 前景木桩与贡多拉',
      group: '油画·经典教程',
      category: '薄涂晕染教程',
      seal: '雾色薄涂',
      mode: 'oil',
      theme: 'gallery-dark',
      backdropColor: '#262426',
      width: 1120,
      height: 820,
      seed: 9102,
      swatches: ['rgb(148, 168, 198)', 'rgb(244, 198, 172)', 'rgb(252, 232, 164)', 'rgb(112, 118, 138)', 'rgb(26, 24, 26)'],
      desc: '透纳式空气透明薄涂法教程：以轻盈柔边的粉金、紫灰与银蓝薄釉描绘威尼斯清晨的水天溶融，远端安康圣母院穹顶在雾霭中若隐若现，黑漆贡多拉轻划水面。',
      layers: [
        { id: 1, name: '一 · 玫瑰金与淡青灰柔和渐层底' },
        { id: 2, name: '二 · 晨雾弥漫泻湖倒影薄罩' },
        { id: 3, name: '三 · 若隐若现安康圣母院穹顶群' },
        { id: 4, name: '四 · 破雾斜射晨光透明光晕面纱' },
        { id: 5, name: '五 · 前景系船木桩、贡多拉与亮波' }
      ],
      buildStrokes(api) {
        const M = window.Code2PaintOilMaster;
        const W = 1120, H = 820, H_Y = 478;
        const scene = M.createScene(W, H, 9102);

        scene.shadeSkyAndClouds({
          horizonY: H_Y,
          skyTop: [78, 108, 158],
          skyMid: [188, 158, 158],
          skyHorizon: [248, 214, 168],
          sunX: 415, sunY: 315, sunR: 30, sunCol: [255, 248, 218],
          glowR: 280, glowCol: [255, 226, 164], glowStrength: 0.52,
          cloudCover: 0.32, cloudLitCol: [254, 236, 214], cloudDarkCol: [132, 138, 168], cloudAlpha: 0.52
        });

        scene.shadeOcean({
          yTop: H_Y, yBot: H,
          seaTop: [228, 198, 168], seaMid: [132, 138, 158], seaBot: [62, 78, 112],
          sunX: 415, glitterCol: [255, 244, 192], glitterSpread: 155, glitterStrength: 0.62,
          waveScale: 0.018, skyMix: 0.38
        });

        scene.draw2D((ctx) => {
          // Veiled Basilica di Santa Maria della Salute domes & St. Mark's Campanile in mist
          ctx.fillStyle = 'rgba(82, 88, 118, 0.80)';
          ctx.beginPath(); ctx.arc(618, 336, 74, Math.PI, 0); ctx.fill();
          ctx.fillRect(598, 234, 40, 38);
          ctx.beginPath(); ctx.arc(712, 368, 46, Math.PI, 0); ctx.fill();
          ctx.fillRect(508, 342, 338, 136);
          // St Mark's Campanile left
          ctx.fillStyle = 'rgba(116, 120, 142, 0.54)';
          ctx.fillRect(250, 195, 36, 283);
          ctx.beginPath(); ctx.moveTo(246, 195); ctx.lineTo(268, 125); ctx.lineTo(290, 195); ctx.fill();

          // Dawn fog atmospheric veil dissolving silhouette bases
          const fog = ctx.createLinearGradient(0, 410, 0, 505);
          fog.addColorStop(0, 'rgba(248, 228, 194, 0)');
          fog.addColorStop(0.55, 'rgba(248, 228, 194, 0.55)');
          fog.addColorStop(1, 'rgba(248, 228, 194, 0)');
          ctx.fillStyle = fog;
          ctx.fillRect(0, 410, 1120, 95);

          // Crisp foreground Venetian paline poles & dark gondola + gondolier silhouette
          [[136, 795, 515], [182, 815, 555], [965, 810, 535], [1015, 795, 575]].forEach(([px, y0, y1]) => {
            ctx.strokeStyle = 'rgba(42, 36, 44, 0.35)'; ctx.lineWidth = 13;
            ctx.beginPath(); ctx.moveTo(px, y0); ctx.lineTo(px, y0 + 55); ctx.stroke();
            ctx.strokeStyle = '#1b1819'; ctx.lineWidth = 16; ctx.lineCap = 'round';
            ctx.beginPath(); ctx.moveTo(px, y0); ctx.lineTo(px + 5, y1); ctx.stroke();
          });
          // Gondola & gondolier
          ctx.strokeStyle = '#141418'; ctx.lineWidth = 19; ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(585, 668); ctx.quadraticCurveTo(712, 692, 855, 658); ctx.lineTo(862, 628);
          ctx.stroke();
          ctx.fillStyle = '#16161a';
          ctx.fillRect(804, 576, 15, 86);
          ctx.lineWidth = 5;
          ctx.beginPath(); ctx.moveTo(806, 610); ctx.lineTo(724, 738); ctx.stroke();
        });

        M.synthesize(api, scene, {
          style: 'sfumato',
          totalStrokes: 5000,
          seed: 9102,
          layers: WORKS[1].layers,
          roi: [
            { cx: 710, cy: 645, rx: 190, ry: 115, boost: 3.4 },
            { cx: 615, cy: 335, rx: 190, ry: 140, boost: 2.6 },
            { cx: 268, cy: 295, rx: 65, ry: 185, boost: 2.2 }
          ]
        });
      }
    },

    // =========================================================================
    // 3. POINTILLISM / DIVISIONISM: SAINT-TROPEZ SUNLIT HARBOR
    // =========================================================================
    {
      id: 'oil-tut-10-pointillism-harbor',
      title: '点彩分色教程·圣特罗佩午后帆影',
      subtitle: '新印象派光学点彩法（3D地中海光照 + 5000点光学分色笔触）：海岸分色 → 并置天青黄紫点彩 → 南法港湾渔村 → 碧湾帆影',
      group: '油画·经典教程',
      category: '点彩分色教程',
      seal: '光学点彩',
      mode: 'oil',
      theme: 'gallery-dark',
      backdropColor: '#1f2838',
      width: 1120,
      height: 820,
      seed: 9103,
      swatches: ['rgb(82, 148, 218)', 'rgb(246, 148, 72)', 'rgb(44, 158, 168)', 'rgb(252, 224, 78)', 'rgb(138, 92, 168)'],
      desc: '保罗·西涅克《圣特罗佩港》点彩光学分色教程：先确立明快的地中海港湾光影结构，再以5,000笔纯净并置互补点彩笔触铺满天穹、红顶石屋、帆船与波光。',
      layers: [
        { id: 1, name: '一 · 海岸晴天与碧湾色彩分区' },
        { id: 2, name: '二 · 并置纯净天青与粉紫点彩天幕' },
        { id: 3, name: '三 · 圣特罗佩粉橙港湾村舍列阵' },
        { id: 4, name: '四 · 碧蓝翡翠马赛克波光水纹' },
        { id: 5, name: '五 · 扬帆白艇与亮黄橘红互补点彩' }
      ],
      buildStrokes(api) {
        const M = window.Code2PaintOilMaster;
        const W = 1120, H = 820, H_Y = 446;
        const scene = M.createScene(W, H, 9103);

        scene.shadeSkyAndClouds({
          horizonY: H_Y,
          skyTop: [78, 144, 218],
          skyMid: [148, 194, 234],
          skyHorizon: [246, 222, 186],
          sunX: 280, sunY: 160, glowR: 340, glowCol: [252, 232, 162], glowStrength: 0.45,
          cloudCover: 0.46, cloudLitCol: [254, 242, 214], cloudDarkCol: [146, 142, 188]
        });

        scene.shadeMountainRange({
          baseY: H_Y,
          peaks: [[0, 295], [220, 325], [480, 365], [760, 405], [1120, 442]],
          rockLit: [152, 128, 168],
          rockDark: [84, 96, 148],
          snowLine: 1.5,
          mistCol: [188, 184, 206],
          mistStrength: 0.40,
          ridgeAmp: 18
        });

        scene.shadeOcean({
          yTop: H_Y, yBot: H,
          seaTop: [54, 158, 184], seaMid: [38, 122, 174], seaBot: [26, 78, 148],
          sunX: 340, glitterCol: [252, 228, 118], glitterSpread: 520, glitterStrength: 0.44,
          waveScale: 0.025
        });

        // Saint-Tropez waterfront villas, quay wall & white sailboats
        scene.draw2D((ctx) => {
          const houses = [
            [68, 355, 92, 85, '#f2a860'], [166, 338, 84, 102, '#ee8662'], [258, 368, 96, 72, '#f6ce80'],
            [362, 348, 86, 92, '#e87456'], [456, 370, 92, 70, '#f4b672'], [558, 380, 78, 60, '#ec8e5c']
          ];
          houses.forEach(([hx, hy, hw, hh, col]) => {
            ctx.fillStyle = col; ctx.fillRect(hx, hy, hw, hh);
            ctx.fillStyle = '#c64830';
            ctx.beginPath(); ctx.moveTo(hx - 6, hy); ctx.lineTo(hx + hw * 0.5, hy - 22); ctx.lineTo(hx + hw + 6, hy); ctx.fill();
            ctx.fillStyle = '#4e3832';
            ctx.fillRect(hx + hw * 0.25, hy + 18, hw * 0.2, hh * 0.26);
          });
          ctx.fillStyle = '#e0c494'; ctx.fillRect(0, H_Y - 8, 1120, 14);

          // Sailboats + complementary violet/gold vertical reflections
          [[315, 610, 1.05], [585, 565, 0.88], [842, 645, 1.15], [718, 505, 0.58]].forEach(([bx, by, sc]) => {
            ctx.fillStyle = '#b84c2e';
            ctx.beginPath(); ctx.moveTo(bx - 48 * sc, by); ctx.lineTo(bx + 50 * sc, by);
            ctx.lineTo(bx + 36 * sc, by + 16 * sc); ctx.lineTo(bx - 34 * sc, by + 16 * sc); ctx.fill();
            ctx.strokeStyle = '#48342a'; ctx.lineWidth = 4 * sc;
            ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(bx, by - 142 * sc); ctx.stroke();
            const sg = ctx.createLinearGradient(bx, by - 135 * sc, bx + 76 * sc, by - 16 * sc);
            sg.addColorStop(0, '#fffdf4'); sg.addColorStop(1, '#f4dfaa');
            ctx.fillStyle = sg;
            ctx.beginPath(); ctx.moveTo(bx + 3, by - 135 * sc); ctx.lineTo(bx + 76 * sc, by - 16 * sc); ctx.lineTo(bx + 3, by - 16 * sc); ctx.fill();
            // Reflection ticks beneath boat
            ctx.fillStyle = 'rgba(252, 232, 134, 0.65)';
            ctx.fillRect(bx - 22 * sc, by + 22 * sc, 56 * sc, 8 * sc);
            ctx.fillStyle = 'rgba(148, 118, 178, 0.58)';
            ctx.fillRect(bx - 16 * sc, by + 36 * sc, 48 * sc, 8 * sc);
          });
        });

        M.synthesize(api, scene, {
          style: 'pointillism',
          totalStrokes: 5000,
          seed: 9103,
          layers: WORKS[2].layers,
          roi: [
            { cx: 330, cy: 385, rx: 320, ry: 85, boost: 2.8 },
            { cx: 560, cy: 590, rx: 360, ry: 120, boost: 3.0 }
          ]
        });
      }
    },

    // =========================================================================
    // 4. CHIAROSCURO LIGHTING: CANDLELIT MAHOGANY VIOLIN & SHEET MUSIC
    // =========================================================================
    {
      id: 'oil-tut-10-chiaroscuro-violin',
      title: '明暗对照教程·烛光古提琴与乐谱',
      subtitle: '卡拉瓦乔明暗对照法（3D烛光打光 + 5000笔古典堆彩）：极暗背景 → 乐谱与绿绸 → 红木漆提琴 → 铜烛台摇曳火焰 → 清漆高光',
      group: '油画·经典教程',
      category: '明暗对照教程',
      seal: '明暗对照',
      mode: 'oil',
      theme: 'gallery-dark',
      backdropColor: '#120d09',
      width: 920,
      height: 1120,
      seed: 9104,
      swatches: ['rgb(22, 15, 11)', 'rgb(168, 72, 26)', 'rgb(252, 212, 108)', 'rgb(228, 214, 182)', 'rgb(28, 78, 56)'],
      desc: '巴洛克剧场感明暗对照（Chiaroscuro）教程：深褐影中一点摇曳蜜蜡烛火，打亮桌面羊皮乐谱、深绿缎布、黄铜烛台与烤漆桃花心木古提琴的三维双弧曲线。',
      layers: [
        { id: 1, name: '一 · 极暗焦褐古典画室背景铺涂' },
        { id: 2, name: '二 · 乐谱纸页、绿绸垂布与深影定势' },
        { id: 3, name: '三 · 桃花心木小提琴雕塑双弧琴身' },
        { id: 4, name: '四 · 铜烛台摇曳暖焰与琴弦琴弓' },
        { id: 5, name: '五 · 红木烤漆强反光与烛芯炽辉' }
      ],
      buildStrokes(api) {
        const M = window.Code2PaintOilMaster;
        const W = 920, H = 1120;
        const scene = M.createScene(W, H, 9104);

        scene.shadeBackdropWallTable({
          horizonY: 720,
          lightX: 705, lightY: 420,
          wallLit: [92, 52, 24], wallMid: [28, 19, 13], wallDark: [12, 8, 6],
          tableType: 'wood',
          tableLit: [74, 46, 26], tableMid: [42, 26, 15], tableDark: [14, 9, 7],
          tableEdgeY: 1030,
          castShadows: [
            { cx: 330, cy: 825, rx: 145, ry: 44, rot: -0.05, strength: 0.78, col: [10, 7, 5] },
            { cx: 660, cy: 805, rx: 95, ry: 26, rot: 0, strength: 0.75, col: [10, 7, 5] }
          ]
        });

        // Sheet music parchment & Emerald satin table cloth
        scene.shadeDrapery({
          poly: [[470, 740], [785, 750], [848, 975], [505, 965]],
          colLit: [38, 102, 72], colMid: [24, 68, 48], colDark: [12, 34, 24],
          foldFreq: 0.045, foldAngle: 0.28, feather: 12
        });
        scene.draw2D((ctx) => {
          const mg = ctx.createLinearGradient(490, 740, 120, 910);
          mg.addColorStop(0, '#eee0bc'); mg.addColorStop(1, '#a6906a');
          ctx.fillStyle = mg;
          ctx.beginPath(); ctx.moveTo(132, 742); ctx.lineTo(515, 726); ctx.lineTo(548, 895); ctx.lineTo(95, 924); ctx.closePath(); ctx.fill();
          ctx.strokeStyle = 'rgba(84, 66, 46, 0.55)'; ctx.lineWidth = 2.2;
          for (let s = 0; s < 5; s++) {
            const sy = 766 + s * 28;
            ctx.beginPath(); ctx.moveTo(148, sy); ctx.quadraticCurveTo(325, sy - 6, 486, sy - 12); ctx.stroke();
          }

          // Sculpted Vintage Mahogany Violin Body (lit strongly from right candlelight!)
          ctx.save();
          ctx.translate(375, 585);
          ctx.rotate(0.14);
          const vg = ctx.createLinearGradient(-115, -60, 115, 40);
          vg.addColorStop(0, '#3e160a'); vg.addColorStop(0.55, '#9e3e12'); vg.addColorStop(0.86, '#dc681e'); vg.addColorStop(1, '#f4ae52');
          ctx.fillStyle = vg;
          // Hourglass violin silhouette (upper bout, C-bout indent, lower bout)
          ctx.beginPath();
          ctx.moveTo(0, -185);
          ctx.bezierCurveTo(85, -185, 98, -108, 62, -62);
          ctx.bezierCurveTo(42, -35, 44, 15, 72, 42);
          ctx.bezierCurveTo(128, 72, 124, 198, 0, 202);
          ctx.bezierCurveTo(-124, 198, -128, 72, -72, 42);
          ctx.bezierCurveTo(-44, 15, -42, -35, -62, -62);
          ctx.bezierCurveTo(-98, -108, -85, -185, 0, -185);
          ctx.fill();
          // Glossy varnish specular highlights along right curves facing candle!
          ctx.strokeStyle = 'rgba(255, 224, 154, 0.88)';
          ctx.lineWidth = 7; ctx.lineCap = 'round';
          ctx.beginPath(); ctx.arc(28, -105, 58, -0.7, 0.5); ctx.stroke();
          ctx.beginPath(); ctx.arc(26, 110, 76, -0.5, 0.7); ctx.stroke();

          // f-holes, maple bridge, ebony fingerboard, tailpiece & 4 taut silver strings
          ctx.strokeStyle = '#180d08'; ctx.lineWidth = 4.5;
          [-48, 48].forEach(fx => {
            ctx.beginPath(); ctx.moveTo(fx - 4, 22); ctx.quadraticCurveTo(fx + 6, 56, fx - 5, 92); ctx.stroke();
          });
          ctx.fillStyle = '#14100e';
          ctx.fillRect(-14, -365, 28, 325);
          ctx.beginPath(); ctx.moveTo(-18, 92); ctx.lineTo(18, 92); ctx.lineTo(24, 185); ctx.lineTo(-24, 185); ctx.fill();
          ctx.fillStyle = '#e0b46c'; ctx.fillRect(-24, 52, 48, 6);
          ctx.fillStyle = '#984218'; ctx.beginPath(); ctx.arc(0, -378, 18, 0, Math.PI * 2); ctx.fill();
          ctx.strokeStyle = '#e4decb'; ctx.lineWidth = 1.6;
          [-9, -3, 3, 9].forEach(dx => {
            ctx.beginPath(); ctx.moveTo(dx * 0.65, -355); ctx.lineTo(dx, 96); ctx.stroke();
          });
          ctx.restore();

          // Diagonal Violin Bow resting across sheet music & violin
          ctx.strokeStyle = '#7e3616'; ctx.lineWidth = 5.5;
          ctx.beginPath(); ctx.moveTo(182, 855); ctx.lineTo(596, 426); ctx.stroke();
          ctx.strokeStyle = 'rgba(232, 224, 200, 0.72)'; ctx.lineWidth = 2.6;
          ctx.beginPath(); ctx.moveTo(186, 864); ctx.lineTo(600, 435); ctx.stroke();
        });

        // 3D Brass Candlestick & Tall Beeswax Candle on right + Flickering Flame
        scene.shadeLathe3D({
          cx: 705, topY: 594, botY: 794, material: 'metal',
          profile: [[0.0, 26], [0.08, 12], [0.55, 10], [0.85, 28], [1.0, 68]],
          colLit: [246, 202, 104], colMid: [152, 108, 38], colDark: [44, 28, 12], bounceCol: [212, 148, 56]
        });
        scene.shadeLathe3D({
          cx: 705, topY: 428, botY: 594, material: 'ceramic',
          profile: [[0.0, 16], [1.0, 17]],
          colLit: [248, 236, 198], colMid: [188, 162, 118], colDark: [88, 68, 46], bounceCol: [216, 152, 68]
        });
        scene.draw2D((ctx) => {
          const fg = ctx.createRadialGradient(705, 398, 4, 705, 398, 92);
          fg.addColorStop(0, '#fffef4'); fg.addColorStop(0.22, '#ffde6c');
          fg.addColorStop(0.55, 'rgba(248, 138, 36, 0.45)'); fg.addColorStop(1, 'rgba(248, 138, 36, 0)');
          ctx.fillStyle = fg;
          ctx.beginPath(); ctx.arc(705, 398, 92, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = '#fffef0';
          ctx.beginPath(); ctx.ellipse(705, 404, 7, 17, 0, 0, Math.PI * 2); ctx.fill();
        });

        M.synthesize(api, scene, {
          style: 'classic',
          totalStrokes: 5000,
          seed: 9104,
          layers: WORKS[3].layers,
          roi: [
            { cx: 375, cy: 590, rx: 145, ry: 215, boost: 3.8 },
            { cx: 705, cy: 580, rx: 85, ry: 225, boost: 3.6 }
          ]
        });
      }
    },

    // =========================================================================
    // 5. ALLA PRIMA WET-ON-WET: BLUSH & CREAM PEONIES IN GLASS VASE
    // =========================================================================
    {
      id: 'oil-tut-10-allaprima-peonies',
      title: '直接画法教程·玻璃瓶盛放粉白芍药',
      subtitle: '湿压湿直接画法（3D玻璃透光 + 5000笔厚涂花瓣）：冷青墙 → 玻璃水瓶与折光绿枝 → 碧叶衬底 → 粉白重瓣芍药 → 桌面落瓣高光',
      group: '油画·经典教程',
      category: '直接画法教程',
      seal: '直接画法',
      mode: 'oil',
      theme: 'gallery-dark',
      backdropColor: '#1b2220',
      width: 920,
      height: 1120,
      seed: 9105,
      swatches: ['rgb(92, 108, 102)', 'rgb(246, 238, 228)', 'rgb(228, 134, 154)', 'rgb(164, 48, 74)', 'rgb(58, 96, 56)'],
      desc: '一气呵成的湿压湿直接画法花卉教程：在鸽青灰墙前盛放着一瓶饱水重瓣粉白芍药，玻璃花瓶透过背后背景与水中折射绿枝，桌面散落两片鲜嫩残瓣。',
      layers: [
        { id: 1, name: '一 · 鸽青灰墙与暖橡木桌铺底' },
        { id: 2, name: '二 · 通透玻璃水瓶与水中青梗' },
        { id: 3, name: '三 · 深叶群烘托与芍药胭脂暗心' },
        { id: 4, name: '四 · 饱蘸厚涂粉白重瓣芍药花头' },
        { id: 5, name: '五 · 玻璃亮线、瓣尖提亮与桌面落瓣' }
      ],
      buildStrokes(api) {
        const M = window.Code2PaintOilMaster;
        const W = 920, H = 1120;
        const scene = M.createScene(W, H, 9105);

        scene.shadeBackdropWallTable({
          horizonY: 775,
          lightX: 250, lightY: 220,
          wallLit: [114, 128, 122], wallMid: [86, 98, 94], wallDark: [48, 56, 54],
          tableType: 'wood',
          tableLit: [148, 120, 94], tableMid: [104, 82, 64], tableDark: [56, 42, 32],
          tableEdgeY: 1045,
          castShadows: [
            { cx: 515, cy: 868, rx: 165, ry: 38, rot: 0.04, strength: 0.72, col: [36, 28, 22] }
          ]
        });

        // Submerged refracted peony stems drawn before glass vase refraction pass
        scene.draw2D((ctx) => {
          ctx.lineCap = 'round';
          [[412, 515, 482, 818], [460, 505, 444, 824], [510, 515, 412, 814]].forEach(([x0, y0, x1, y1]) => {
            ctx.strokeStyle = '#5a8a46'; ctx.lineWidth = 9;
            ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
          });
        });

        scene.shadeLathe3D({
          cx: 460, topY: 562, botY: 852, material: 'glass', openTopRim: true,
          profile: [[0.0, 92], [0.16, 86], [0.35, 98], [0.82, 108], [0.95, 102], [1.0, 96]],
          colLit: [212, 228, 226], colMid: [118, 146, 144], colDark: [52, 74, 74],
          liquidLevel: 0.42, liquidBot: 0.94, liquidCol: [146, 174, 162]
        });

        // Foliage + 5 plush multi-layered blush & ivory peony blooms + fallen table petals
        scene.draw2D((ctx, w, h, N) => {
          // Elliptical water meniscus & crisp glass rim
          ctx.strokeStyle = 'rgba(222, 240, 236, 0.75)'; ctx.lineWidth = 3;
          ctx.beginPath(); ctx.ellipse(460, 684, 96, 14, 0, 0, Math.PI * 2); ctx.stroke();
          ctx.beginPath(); ctx.ellipse(460, 565, 92, 16, 0, 0, Math.PI * 2); ctx.stroke();

          // Peony leaves frame
          [[295, 515, -0.5], [625, 505, 0.4], [245, 375, -0.7], [658, 355, 0.6], [355, 225, -0.3], [565, 235, 0.3], [460, 555, 0]].forEach(([lx, ly, rot]) => {
            ctx.save(); ctx.translate(lx, ly); ctx.rotate(rot);
            const lg = ctx.createRadialGradient(-18, -8, 6, 0, 0, 68);
            lg.addColorStop(0, '#6c9c46'); lg.addColorStop(0.6, '#3c6632'); lg.addColorStop(1, '#1d381e');
            ctx.fillStyle = lg;
            ctx.beginPath(); ctx.ellipse(0, 0, 68, 30, 0, 0, Math.PI * 2); ctx.fill();
            ctx.restore();
          });

          paintRoseOrPeony(ctx, 312, 415, 82, '#9a2848', '#ee9ab0', '#fceef0', N);
          paintRoseOrPeony(ctx, 590, 398, 78, '#b86878', '#f2e0dc', '#fffaf6', N);
          paintRoseOrPeony(ctx, 462, 275, 86, '#902442', '#ec88a4', '#fde8ec', N);
          paintRoseOrPeony(ctx, 448, 442, 92, '#c27486', '#f6e8e4', '#ffffff', N);
          paintRoseOrPeony(ctx, 626, 286, 54, '#881e3e', '#df6c8a', '#fae0e6', N);

          // Fallen petals resting softly on oak table
          ctx.fillStyle = '#f6b8c4';
          ctx.beginPath(); ctx.ellipse(276, 868, 22, 11, 0.25, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = '#faf0ea';
          ctx.beginPath(); ctx.ellipse(658, 862, 20, 10, -0.2, 0, Math.PI * 2); ctx.fill();
        });

        M.synthesize(api, scene, {
          style: 'impressionist',
          totalStrokes: 5000,
          seed: 9105,
          layers: WORKS[4].layers,
          roi: [
            { cx: 460, cy: 380, rx: 255, ry: 220, boost: 3.8 },
            { cx: 460, cy: 705, rx: 135, ry: 155, boost: 2.8 }
          ]
        });
      }
    },

    // =========================================================================
    // 6. SCUMBLING STORM SEA: BACKLIT WAVE CREST & TALL SHIP (AIVAZOVSKY)
    // =========================================================================
    {
      id: 'oil-tut-10-scumbling-storm',
      title: '枯笔擦涂教程·怒海巨浪与古帆船',
      subtitle: '艾瓦佐夫斯基半枯擦涂法（3D透光绿浪 + 5000笔动势扫笔）：裂云金光 → 惊涛暗谷 → 逆光翡翠浪峰 → 古帆船 → 擦涂白沫',
      group: '油画·经典教程',
      category: '枯笔擦涂教程',
      seal: '枯笔巨浪',
      mode: 'oil',
      theme: 'gallery-dark',
      backdropColor: '#0e1b24',
      width: 1120,
      height: 820,
      seed: 9106,
      swatches: ['rgb(244, 208, 128)', 'rgb(26, 68, 96)', 'rgb(44, 152, 134)', 'rgb(168, 218, 204)', 'rgb(248, 250, 246)'],
      desc: '浪漫海景大师艾瓦佐夫斯基技法教程：暗青紫雷云裂隙透出暖阳金光，透射高高卷起的碧绿透明浪芯，配合三桅帆船与半枯擦涂飞散的浪花蕾丝。',
      layers: [
        { id: 1, name: '一 · 暴风骤雨裂云金光渐变天' },
        { id: 2, name: '二 · 深靛涛谷与海面涌动底潮' },
        { id: 3, name: '三 · 逆光透亮翡翠绿浪冠核心' },
        { id: 4, name: '四 · 浪尖颠簸远洋三桅古帆船' },
        { id: 5, name: '五 · 枯笔干扫飞舞白色浪花水雾' }
      ],
      buildStrokes(api) {
        const M = window.Code2PaintOilMaster;
        const W = 1120, H = 820, H_Y = 415;
        const scene = M.createScene(W, H, 9106);

        scene.shadeSkyAndClouds({
          horizonY: H_Y,
          skyTop: [28, 38, 62],
          skyMid: [76, 88, 114],
          skyHorizon: [246, 214, 146],
          sunX: 385, sunY: 235, glowR: 320, glowCol: [252, 226, 156], glowStrength: 0.72,
          cloudCover: 0.65, cloudScale: 0.0048,
          cloudLitCol: [246, 214, 156], cloudDarkCol: [32, 42, 62], cloudAlpha: 0.92
        });

        scene.shadeOcean({
          yTop: H_Y, yBot: H,
          seaTop: [24, 68, 96], seaMid: [18, 48, 76], seaBot: [10, 24, 44],
          sunX: 320, glitterCol: [238, 204, 132], glitterSpread: 210, glitterStrength: 0.32,
          waveScale: 0.022,
          crestWave: { cx: 495, cy: 485, rx: 320, ry: 120, colCore: [52, 178, 148], colFoam: [246, 250, 248] }
        });

        // Distant tall sailing ship + wind-swept lacy seafoam streams curving down wave trough
        scene.draw2D((ctx, w, h, N) => {
          const sx = 765, sy = 408;
          ctx.fillStyle = '#16181c';
          ctx.beginPath(); ctx.moveTo(sx - 56, sy - 6); ctx.lineTo(sx + 58, sy - 8); ctx.lineTo(sx + 44, sy + 12); ctx.lineTo(sx - 42, sy + 12); ctx.fill();
          [-26, 0, 26].forEach((mx, idx) => {
            const mh = idx === 1 ? 105 : 86;
            ctx.strokeStyle = '#1a1c22'; ctx.lineWidth = 4;
            ctx.beginPath(); ctx.moveTo(sx + mx, sy); ctx.lineTo(sx + mx - 14, sy - mh); ctx.stroke();
            ctx.fillStyle = 'rgba(222, 206, 178, 0.82)';
            ctx.beginPath(); ctx.moveTo(sx + mx - 8, sy - mh + 16);
            ctx.quadraticCurveTo(sx + mx + 18, sy - mh * 0.52, sx + mx - 2, sy - 14);
            ctx.fill();
          });

          // Flowing scumbled seafoam lace sweeping diagonally along the wave trough & crest curl
          ctx.lineCap = 'round';
          for (let k = 0; k < 22; k++) {
            const lx = 195 + N.rand() * 540;
            const ly = 448 + N.rand() * 110;
            const span = 85 + N.rand() * 80;
            const drop = 12 + N.rand() * 24;
            ctx.strokeStyle = `rgba(234, 246, 244, ${(0.24 + N.rand() * 0.32).toFixed(2)})`;
            ctx.lineWidth = 3.5 + N.rand() * 5.5;
            ctx.beginPath();
            ctx.moveTo(lx, ly);
            ctx.quadraticCurveTo(lx + span * 0.5, ly - 8 + N.rand() * 18, lx + span, ly + drop);
            ctx.stroke();
          }
          // Fine white wind-blown spray flecks near breaking wave crest
          for (let k = 0; k < 30; k++) {
            const fx = 230 + N.rand() * 520;
            const fy = 432 + N.rand() * 44;
            ctx.fillStyle = `rgba(248, 252, 250, ${(0.35 + N.rand() * 0.45).toFixed(2)})`;
            ctx.beginPath();
            ctx.ellipse(fx, fy, 4 + N.rand() * 8, 2 + N.rand() * 3.5, (N.rand() - 0.5) * 0.4, 0, Math.PI * 2);
            ctx.fill();
          }
        });

        M.synthesize(api, scene, {
          style: 'scumbling',
          totalStrokes: 5000,
          seed: 9106,
          layers: WORKS[5].layers,
          roi: [
            { cx: 500, cy: 485, rx: 320, ry: 150, boost: 3.4 },
            { cx: 765, cy: 365, rx: 95, ry: 90, boost: 3.2 }
          ]
        });
      }
    },

    // =========================================================================
    // 7. TONALISM: GOLDEN MISTY AUTUMN WOODS & FOOTBRIDGE (INNESS)
    // =========================================================================
    {
      id: 'oil-tut-10-tonalism-birch',
      title: '色调主义教程·秋雾金林与林间独木桥',
      subtitle: '乔治·英尼斯色调主义法（3D雾景统调 + 5000笔柔润叠加）：蜜糖金雾底 → 朦胧秋叶 → 曲水苔坡 → 逆光枝干木桥 → 穿林晨曦',
      group: '油画·经典教程',
      category: '色调主义教程',
      seal: '色调主义',
      mode: 'oil',
      theme: 'gallery-dark',
      backdropColor: '#231e14',
      width: 1120,
      height: 820,
      seed: 9107,
      swatches: ['rgb(236, 198, 118)', 'rgb(168, 128, 62)', 'rgb(138, 72, 34)', 'rgb(74, 82, 48)', 'rgb(36, 30, 22)'],
      desc: '美国色调主义（Tonalism）大师英尼斯技法教程：让全幅笼罩在统一的蜜糖金褐与苔绿诗意秋雾中，柔和溶解远林轮廓，焦点落于逆光瘦干、曲水倒影与小木桥。',
      layers: [
        { id: 1, name: '一 · 蜜糖琥珀暖雾基调大铺底' },
        { id: 2, name: '二 · 远近迷蒙柔边秋叶林幕叠染' },
        { id: 3, name: '三 · 静谧林涧曲水与苔坡铺砌' },
        { id: 4, name: '四 · 瘦劲秋林枝干剪影与独木桥' },
        { id: 5, name: '五 · 穿林丁达尔晨光与飘零落叶' }
      ],
      buildStrokes(api) {
        const M = window.Code2PaintOilMaster;
        const W = 1120, H = 820, H_Y = 495;
        const scene = M.createScene(W, H, 9107);

        scene.shadeSkyAndClouds({
          horizonY: H_Y,
          skyTop: [198, 168, 108],
          skyMid: [236, 204, 134],
          skyHorizon: [252, 232, 168],
          sunX: 545, sunY: 325, glowR: 380, glowCol: [255, 240, 182], glowStrength: 0.72,
          cloudCover: 0.42, cloudLitCol: [246, 218, 148], cloudDarkCol: [142, 112, 62], cloudAlpha: 0.56
        });

        scene.shadeOcean({
          yTop: H_Y, yBot: H,
          seaTop: [108, 98, 52], seaMid: [76, 68, 38], seaBot: [42, 38, 22],
          sunX: 545, glitterCol: [236, 204, 134], glitterSpread: 185, glitterStrength: 0.45,
          waveScale: 0.016, skyMix: 0.2
        });

        scene.draw2D((ctx, w, h, N) => {
          // Soft misty autumn woodland foliage banks
          [
            [165, 235, 195, 165, 'rgba(148, 112, 52, 0.72)'],
            [425, 205, 225, 155, 'rgba(182, 132, 58, 0.65)'],
            [745, 215, 240, 165, 'rgba(158, 92, 42, 0.72)'],
            [985, 255, 185, 155, 'rgba(122, 86, 44, 0.76)'],
            [260, 395, 165, 95, 'rgba(112, 102, 48, 0.68)'],
            [855, 385, 195, 105, 'rgba(136, 78, 36, 0.72)']
          ].forEach(([fx, fy, rx, ry, col]) => {
            const g = ctx.createRadialGradient(fx, fy, rx * 0.1, fx, fy, rx);
            g.addColorStop(0, col); g.addColorStop(1, 'rgba(224, 192, 122, 0)');
            ctx.fillStyle = g;
            ctx.beginPath(); ctx.ellipse(fx, fy, rx, ry, 0, 0, Math.PI * 2); ctx.fill();
          });

          // Mossy stream banks flanking curved golden stream
          ctx.fillStyle = 'rgba(72, 68, 36, 0.85)';
          ctx.beginPath(); ctx.moveTo(0, 495); ctx.lineTo(510, 495); ctx.quadraticCurveTo(430, 620, 290, 820); ctx.lineTo(0, 820); ctx.fill();
          ctx.beginPath(); ctx.moveTo(1120, 495); ctx.lineTo(615, 495); ctx.quadraticCurveTo(685, 620, 665, 820); ctx.lineTo(1120, 820); ctx.fill();

          // Backlit tree trunks with subtle organic asymmetrical twigs
          [[145, 650, 17, 0.04], [215, 620, 24, -0.02], [295, 575, 13, 0.03], [435, 515, 10, -0.02],
           [685, 525, 15, 0.02], [815, 595, 22, -0.03], [905, 645, 18, 0.02], [995, 685, 26, -0.02]].forEach(([tx, baseY, tw, lean], idx) => {
            ctx.strokeStyle = '#32271d'; ctx.lineWidth = tw; ctx.lineCap = 'round';
            ctx.beginPath(); ctx.moveTo(tx, baseY); ctx.quadraticCurveTo(tx + lean * 200, baseY * 0.5, tx + lean * 440, 18); ctx.stroke();
            const dir = idx % 2 ? -1 : 1;
            ctx.lineWidth = tw * 0.35;
            ctx.beginPath(); ctx.moveTo(tx + lean * 220, 265); ctx.quadraticCurveTo(tx + dir * 48, 198, tx + dir * 92, 162); ctx.stroke();
          });

          // Rustic arched wooden footbridge spanning stream
          ctx.strokeStyle = '#38281a'; ctx.lineWidth = 24;
          ctx.beginPath(); ctx.moveTo(375, 608); ctx.quadraticCurveTo(545, 562, 715, 610); ctx.stroke();
          [405, 475, 545, 615, 685].forEach(bx => {
            ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(bx, 588); ctx.lineTo(bx, 542); ctx.stroke();
          });
          ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(395, 558); ctx.quadraticCurveTo(545, 518, 695, 558); ctx.stroke();

          // Scattered warm burnt-sienna leaves floating down air & on moss
          for (let f = 0; f < 34; f++) {
            ctx.fillStyle = f % 2 ? '#c46224' : '#d89832';
            ctx.beginPath(); ctx.ellipse(80 + N.rand() * 960, 160 + N.rand() * 600, 7, 3.5, N.rand() * 3, 0, Math.PI * 2); ctx.fill();
          }
        });

        M.synthesize(api, scene, {
          style: 'sfumato',
          totalStrokes: 5000,
          seed: 9107,
          layers: WORKS[6].layers,
          roi: [
            { cx: 545, cy: 565, rx: 195, ry: 120, boost: 3.8 },
            { cx: 545, cy: 325, rx: 210, ry: 145, boost: 2.6 }
          ]
        });
      }
    },

    // =========================================================================
    // 8. BAROQUE MATERIAL REALISM: COPPER KETTLE, POMEGRANATE & CERAMIC BOWL
    // =========================================================================
    {
      id: 'oil-tut-10-baroque-copper',
      title: '古典质感教程·铜锅、石榴与白瓷碗',
      subtitle: '巴洛克材质写实法（3D金属、瓷釉与石榴籽 + 5000笔经典塑造）：暖赭暗底 → 麻布桌巾 → 锻打紫红铜壶 → 白瓷与石榴 → 金属强反光',
      group: '油画·经典教程',
      category: '材质写实教程',
      seal: '材质写实',
      mode: 'oil',
      theme: 'gallery-dark',
      backdropColor: '#1a120d',
      width: 1120,
      height: 820,
      seed: 9108,
      swatches: ['rgb(44, 30, 22)', 'rgb(194, 96, 44)', 'rgb(242, 236, 224)', 'rgb(186, 28, 42)', 'rgb(252, 218, 158)'],
      desc: '夏尔丹式巴洛克材质对比教程：在统一柔侧光下精密对比四种质感——镜面微暖反射的紫铜壶、哑光温和反色的白瓷钵、晶莹爆汁感石榴籽与本色粗纺亚麻台布。',
      layers: [
        { id: 1, name: '一 · 熟褐暗壁与粗纺亚麻布底' },
        { id: 2, name: '二 · 主体构图投影与亚麻布褶' },
        { id: 3, name: '三 · 锻打红铜壶金属弧面塑形' },
        { id: 4, name: '四 · 哑光白瓷碗与红宝石石榴籽' },
        { id: 5, name: '五 · 铜壶炽白反光与桌面反色交辉' }
      ],
      buildStrokes(api) {
        const M = window.Code2PaintOilMaster;
        const W = 1120, H = 820;
        const scene = M.createScene(W, H, 9108);

        scene.shadeBackdropWallTable({
          horizonY: 525,
          lightX: 250, lightY: 180,
          wallLit: [62, 44, 32], wallMid: [38, 26, 19], wallDark: [18, 12, 9],
          tableType: 'linen',
          tableLit: [172, 154, 128], tableMid: [128, 112, 90], tableDark: [68, 56, 44],
          tableEdgeY: 775,
          castShadows: [
            { cx: 565, cy: 618, rx: 270, ry: 52, rot: 0.03, strength: 0.78, col: [28, 20, 14] },
            { cx: 435, cy: 598, rx: 145, ry: 34, rot: 0, strength: 0.85, col: [20, 14, 10] }
          ]
        });

        // Copper spout & wrought iron arched handle drawn prior to pot body seam
        scene.draw2D((ctx) => {
          drawTubeCurve(ctx, [[278, 376], [286, 224], [405, 168], [524, 224], [532, 376]], 6.5, '#544a42', '#1c1816');
          drawTubeCurve(ctx, [[268, 468], [192, 412], [176, 368]], 13, '#d26a30', '#54200e');
        });

        // 3D Burnished Hammered Copper Kettle + Lid
        scene.shadeLathe3D({
          cx: 405, topY: 318, botY: 604, material: 'metal',
          profile: [
            [0.00, 14], [0.06, 22], [0.16, 114], [0.22, 126],
            [0.42, 148], [0.68, 150], [0.88, 118], [1.00, 96]
          ],
          colLit: [248, 156, 86], colMid: [182, 78, 32], colDark: [48, 18, 10],
          bounceCol: [212, 178, 138], specCol: [255, 246, 222], bounceStrength: 0.42
        });

        // Matte White Ceramic Bowl (catching copper warm bounce on left outer curve!)
        scene.shadeLathe3D({
          cx: 735, topY: 468, botY: 608, material: 'ceramic', openTopRim: true,
          profile: [[0.0, 138], [0.35, 126], [0.72, 92], [0.92, 68], [1.0, 62]],
          colLit: [248, 244, 234], colMid: [204, 202, 198], colDark: [122, 124, 126],
          bounceCol: [214, 126, 78]
        });

        // Whole & Split Ruby Pomegranates in foreground
        scene.shadeFruit3D({
          cx: 565, cy: 625, rx: 52, ry: 48, kind: 'pomegranate',
          colLit: [228, 74, 52], colMid: [168, 32, 34], colShadow: [68, 14, 18], bounceCol: [198, 162, 132]
        });
        scene.shadeFruit3D({
          cx: 675, cy: 646, rx: 54, ry: 45, kind: 'pomegranate', splitFace: true,
          colLit: [236, 98, 66], colMid: [176, 38, 38], colShadow: [78, 18, 22], bounceCol: [212, 184, 152], specStrength: 0.72
        });

        M.synthesize(api, scene, {
          style: 'classic',
          totalStrokes: 5000,
          seed: 9108,
          layers: WORKS[7].layers,
          roi: [
            { cx: 405, cy: 460, rx: 185, ry: 175, boost: 3.4 },
            { cx: 675, cy: 590, rx: 175, ry: 115, boost: 3.8 }
          ]
        });
      }
    },

    // =========================================================================
    // 9. PLEIN AIR: TUSCANY SUNLIT MORNING HILLS & CYPRESS VILLA
    // =========================================================================
    {
      id: 'oil-tut-10-pleinair-tuscany',
      title: '外光写生教程·托斯卡纳晨光丝柏庄园',
      subtitle: '直接外光写生法（3D起伏山峦 + 5000笔外光速写）：爽朗晨空 → 叠翠金绿山坡 → 蜿蜒白沙路与石庄 → 墨绿丝柏 → 斜阳长影',
      group: '油画·经典教程',
      category: '外光写生教程',
      seal: '外光写生',
      mode: 'oil',
      theme: 'gallery-dark',
      backdropColor: '#1f2822',
      width: 1120,
      height: 820,
      seed: 9109,
      swatches: ['rgb(112, 168, 224)', 'rgb(218, 182, 92)', 'rgb(88, 126, 58)', 'rgb(34, 58, 32)', 'rgb(192, 92, 54)'],
      desc: '印象派外光写生快速抓型教程：清新地中海晴空与远山灰蓝渐层映衬绵延的托斯卡纳麦黄嫩绿起伏丘陵，红顶农庄踞于S形白沙路端，成排墨绿丝柏拖出晨阳长影。',
      layers: [
        { id: 1, name: '一 · 爽朗清晨晴空与叠翠远山' },
        { id: 2, name: '二 · 金绿田园起伏丘陵大色块' },
        { id: 3, name: '三 · 蜿蜒白沙土路与山顶红顶农庄' },
        { id: 4, name: '四 · 夹道笔直墨绿丝柏队列' },
        { id: 5, name: '五 · 晨阳长投阴影与暖金草坡高光' }
      ],
      buildStrokes(api) {
        const M = window.Code2PaintOilMaster;
        const W = 1120, H = 820;
        const scene = M.createScene(W, H, 9109);

        scene.shadeSkyAndClouds({
          horizonY: 365,
          skyTop: [86, 146, 214],
          skyMid: [152, 196, 232],
          skyHorizon: [224, 232, 236],
          sunX: 210, sunY: 165, glowR: 380, glowCol: [248, 244, 218], glowStrength: 0.44,
          cloudCover: 0.48, cloudLitCol: [252, 250, 246], cloudDarkCol: [168, 192, 222]
        });

        // Distant blue Apennine ridge
        scene.shadeMountainRange({
          baseY: 375,
          peaks: [[0, 285], [310, 255], [640, 295], [980, 265], [1120, 290]],
          rockLit: [128, 158, 198], rockDark: [88, 114, 158],
          snowLine: 1.5, mistCol: [188, 208, 232], mistStrength: 0.56, ridgeAmp: 22
        });

        // Rolling sunlit olive/wheat Tuscan hillside + S-curve gravel lane + stone villa + cypresses with cast shadows
        scene.draw2D((ctx, w, h, N) => {
          // Far olive hill -> golden sunlit slope -> rich green foreground meadow
          const hg1 = ctx.createLinearGradient(0, 310, w, 580);
          hg1.addColorStop(0, '#6a8a48'); hg1.addColorStop(0.5, '#9cb04c'); hg1.addColorStop(1, '#4c6c34');
          ctx.fillStyle = hg1;
          ctx.beginPath(); ctx.moveTo(0, 338); ctx.quadraticCurveTo(320, 290, 620, 355);
          ctx.quadraticCurveTo(920, 315, w, 348); ctx.lineTo(w, h); ctx.lineTo(0, h); ctx.fill();

          const hg2 = ctx.createLinearGradient(650, 360, 250, h);
          hg2.addColorStop(0, '#d2b454'); hg2.addColorStop(0.5, '#98a648'); hg2.addColorStop(1, '#587836');
          ctx.fillStyle = hg2;
          ctx.beginPath(); ctx.moveTo(0, 560); ctx.quadraticCurveTo(450, 415, w, 465); ctx.lineTo(w, h); ctx.lineTo(0, h); ctx.fill();

          // Winding white limestone lane
          ctx.strokeStyle = '#eadec2'; ctx.lineCap = 'round';
          for (let s = 0; s < 30; s++) {
            const t = s / 29;
            const y0 = lerp(368, 825, t), y1 = lerp(368, 825, (s + 1.2) / 29);
            const x0 = 562 + Math.sin(t * 9.5) * (24 + t * 92);
            const x1 = 562 + Math.sin((t + 1 / 29) * 9.5) * (24 + (t + 1 / 29) * 92);
            ctx.lineWidth = 8 + t * 52;
            ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
          }

          // Hilltop Tuscan stone villa & terracotta roof
          ctx.fillStyle = '#e8d4ae'; ctx.fillRect(512, 325, 102, 46);
          ctx.fillStyle = '#be5630';
          ctx.beginPath(); ctx.moveTo(498, 328); ctx.lineTo(563, 304); ctx.lineTo(628, 328); ctx.fill();
          ctx.fillStyle = '#362e24';
          [528, 558, 592].forEach(wx => ctx.fillRect(wx, 340, 7, 18));

          // Mediterranean cypress trees with long crisp morning cast shadows!
          const cypresses = [
            [495, 372, 68], [462, 412, 82], [435, 456, 98], [412, 512, 118],
            [632, 378, 66], [676, 425, 84], [715, 482, 108], [765, 548, 134],
            [325, 565, 112], [255, 615, 136]
          ];
          cypresses.forEach(([cx, by, ch]) => {
            ctx.fillStyle = 'rgba(34, 52, 42, 0.56)';
            ctx.beginPath();
            ctx.moveTo(cx, by); ctx.lineTo(cx + ch * 1.15, by + ch * 0.22);
            ctx.lineTo(cx + ch * 1.05, by + ch * 0.30); ctx.lineTo(cx, by + ch * 0.06); ctx.fill();

            const cg = ctx.createLinearGradient(cx - ch * 0.15, by - ch, cx + ch * 0.15, by);
            cg.addColorStop(0, '#5a8238'); cg.addColorStop(0.5, '#264422'); cg.addColorStop(1, '#142414');
            ctx.fillStyle = cg;
            ctx.beginPath();
            ctx.moveTo(cx, by - ch);
            ctx.bezierCurveTo(cx + ch * 0.16, by - ch * 0.55, cx + ch * 0.16, by - 8, cx, by);
            ctx.bezierCurveTo(cx - ch * 0.16, by - 8, cx - ch * 0.16, by - ch * 0.55, cx, by - ch);
            ctx.fill();
          });

          // Sunlit field flowers & golden highlights
          for (let k = 0; k < 28; k++) {
            ctx.fillStyle = k % 4 === 0 ? '#e0422e' : '#e6d854';
            ctx.beginPath(); ctx.arc(80 + N.rand() * 960, 560 + N.rand() * 235, 3 + N.rand() * 3, 0, Math.PI * 2); ctx.fill();
          }
        });

        M.synthesize(api, scene, {
          style: 'impressionist',
          totalStrokes: 5000,
          seed: 9109,
          layers: WORKS[8].layers,
          roi: [
            { cx: 560, cy: 350, rx: 145, ry: 85, boost: 3.4 },
            { cx: 560, cy: 520, rx: 280, ry: 185, boost: 2.8 }
          ]
        });
      }
    },

    // =========================================================================
    // 10. POETIC NOCTURNE: RAINY JIANGNAN ALLEYWAY & HANGING RED LANTERN
    // =========================================================================
    {
      id: 'oil-tut-10-nocturne-lantern',
      title: '夜色光影教程·雨巷红灯笼与青石板',
      subtitle: '东方诗意冷暖夜画法（3D水波透视 + 5000笔夜巷质感）：青灰雨夜 → 黛瓦白墙与石雕老宅 → 远方古桥 → 高悬红灯笼 → 青石反光',
      group: '油画·经典教程',
      category: '夜色光影教程',
      seal: '夜巷灯火',
      mode: 'oil',
      theme: 'gallery-dark',
      backdropColor: '#0e1722',
      width: 920,
      height: 1120,
      seed: 9110,
      swatches: ['rgb(24, 42, 64)', 'rgb(168, 178, 188)', 'rgb(236, 58, 38)', 'rgb(252, 186, 68)', 'rgb(34, 44, 56)'],
      desc: '冷暖色温强对比诗意夜画教程：烟雨江南黛瓦马头墙与雕花木窗退入青灰雾色尽头的小桥，屋檐高悬的一盏炽烈红油纸灯笼将金红暖光铺满湿漉青石板长巷。',
      layers: [
        { id: 1, name: '一 · 烟雨靛青暮空与石板底调' },
        { id: 2, name: '二 · 深巷两边马头白墙与黛瓦飞檐' },
        { id: 3, name: '三 · 尽头水乡古桥与木窗棂影' },
        { id: 4, name: '四 · 屋檐高悬大红油纸灯笼光晕' },
        { id: 5, name: '五 · 湿润青石红金波光与灯笼高光' }
      ],
      buildStrokes(api) {
        const M = window.Code2PaintOilMaster;
        const W = 920, H = 1120;
        const scene = M.createScene(W, H, 9110);

        scene.shadeSkyAndClouds({
          horizonY: 640,
          skyTop: [16, 28, 48], skyMid: [34, 54, 82], skyHorizon: [132, 152, 178],
          sunX: 460, sunY: 560, glowR: 220, glowCol: [176, 194, 214], glowStrength: 0.58,
          cloudCover: 0.45, cloudLitCol: [108, 128, 154], cloudDarkCol: [22, 34, 56]
        });

        // Wet flagstone perspective floor catching shimmering amber-red lantern path!
        scene.shadeOcean({
          yTop: 632, yBot: H,
          seaTop: [42, 54, 74], seaMid: [26, 36, 52], seaBot: [14, 20, 30],
          sunX: 545, glitterCol: [248, 134, 48], glitterSpread: 115, glitterStrength: 0.92,
          waveScale: 0.036, skyMix: 0.22
        });

        scene.draw2D((ctx) => {
          // Left whitewashed wall shaded in cool indigo dusk
          const lw = ctx.createLinearGradient(0, 500, 408, 580);
          lw.addColorStop(0, '#96a2b2'); lw.addColorStop(1, '#586678');
          ctx.fillStyle = lw;
          ctx.beginPath(); ctx.moveTo(0, 145); ctx.lineTo(408, 495); ctx.lineTo(408, 636); ctx.lineTo(0, 995); ctx.fill();

          // Right wall warmly kissed by glowing hanging red lantern!
          const rw = ctx.createLinearGradient(920, 450, 512, 580);
          rw.addColorStop(0, '#c8988a'); rw.addColorStop(0.55, '#8a7682'); rw.addColorStop(1, '#546074');
          ctx.fillStyle = rw;
          ctx.beginPath(); ctx.moveTo(920, 130); ctx.lineTo(512, 495); ctx.lineTo(512, 636); ctx.lineTo(920, 1005); ctx.fill();

          // Dark granite foundation plinths along alley edges
          ctx.fillStyle = '#2a3242';
          ctx.beginPath(); ctx.moveTo(0, 965); ctx.lineTo(408, 636); ctx.lineTo(408, 646); ctx.lineTo(0, 1095); ctx.fill();
          ctx.beginPath(); ctx.moveTo(920, 975); ctx.lineTo(512, 636); ctx.lineTo(512, 646); ctx.lineTo(920, 1105); ctx.fill();

          // Recessed carved dark wood door (left) & lattice window (right)
          ctx.fillStyle = '#241e1c';
          ctx.beginPath(); ctx.moveTo(95, 535); ctx.lineTo(228, 558); ctx.lineTo(228, 815); ctx.lineTo(95, 922); ctx.fill();
          ctx.fillStyle = '#2e2624';
          ctx.beginPath(); ctx.moveTo(656, 415); ctx.lineTo(786, 376); ctx.lineTo(786, 650); ctx.lineTo(656, 622); ctx.fill();

          // Dark slate tile eaves slashing cleanly inward
          ctx.fillStyle = '#141a26';
          ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(408, 468); ctx.lineTo(408, 502); ctx.lineTo(0, 165); ctx.fill();
          ctx.beginPath(); ctx.moveTo(920, 0); ctx.lineTo(512, 468); ctx.lineTo(512, 502); ctx.lineTo(920, 150); ctx.fill();

          // Distant Jiangnan stone arch bridge in misty alley mouth
          ctx.fillStyle = '#243248';
          ctx.beginPath(); ctx.moveTo(395, 635); ctx.lineTo(395, 610); ctx.quadraticCurveTo(460, 582, 525, 610); ctx.lineTo(525, 635); ctx.fill();

          // Hanging wrought bracket & glowing crimson paper lantern
          ctx.strokeStyle = '#141418'; ctx.lineWidth = 7;
          ctx.beginPath(); ctx.moveTo(725, 305); ctx.lineTo(625, 338); ctx.stroke();

          const lg = ctx.createRadialGradient(625, 412, 16, 625, 412, 220);
          lg.addColorStop(0, 'rgba(255, 198, 88, 0.86)');
          lg.addColorStop(0.32, 'rgba(232, 66, 36, 0.58)');
          lg.addColorStop(1, 'rgba(232, 66, 36, 0)');
          ctx.fillStyle = lg;
          ctx.beginPath(); ctx.arc(625, 412, 220, 0, Math.PI * 2); ctx.fill();

          const bodyG = ctx.createRadialGradient(625, 412, 6, 625, 412, 52);
          bodyG.addColorStop(0, '#fff4d4'); bodyG.addColorStop(0.45, '#ff8e34'); bodyG.addColorStop(1, '#c82018');
          ctx.fillStyle = bodyG;
          ctx.beginPath(); ctx.ellipse(625, 412, 45, 54, 0, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = '#1c1210';
          ctx.fillRect(598, 354, 54, 8); ctx.fillRect(602, 462, 46, 8);
          ctx.strokeStyle = '#e83820'; ctx.lineWidth = 5;
          ctx.beginPath(); ctx.moveTo(625, 468); ctx.lineTo(622, 524); ctx.stroke();
        });

        M.synthesize(api, scene, {
          style: 'classic',
          totalStrokes: 5000,
          seed: 9110,
          layers: WORKS[9].layers,
          roi: [
            { cx: 625, cy: 425, rx: 140, ry: 150, boost: 4.0 },
            { cx: 460, cy: 585, rx: 120, ry: 110, boost: 3.0 },
            { cx: 515, cy: 845, rx: 150, ry: 210, boost: 2.6 }
          ]
        });
      }
    }
  ];

  window.Code2PaintCatalog.addPack(WORKS);
})();
