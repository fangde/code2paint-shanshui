(function () {
  const OIL_FIG_LAYERS = [
    { id: 1, name: '一 · 熟褐起稿与背景氛围' },
    { id: 2, name: '二 · 块面造型与冷暖光影' },
    { id: 3, name: '三 · 五官笔触、发丝与服饰' },
    { id: 4, name: '四 · 厚涂高光与细节提神' }
  ];

  const WORKS = [
    // =========================================================================
    // 1. VERMEER GIRL WITH A PEARL EARRING
    // =========================================================================
    {
      id: 'oil-fig-pearl',
      title: '油画人物·珍珠耳环少女',
      subtitle: '古典肖像四步法：黑漆底起稿 → 暖肤明暗面 → 群青黄巾绕鬓 → 珍珠一点高光',
      group: '油画·人物',
      category: '古典肖像油画',
      seal: '油画人物',
      mode: 'oil',
      theme: 'gallery-dark',
      backdropColor: '#110d0b',
      width: 920,
      height: 1120,
      seed: 6001,
      swatches: ['rgb(16, 13, 11)', 'rgb(28, 74, 138)', 'rgb(228, 176, 72)', 'rgb(236, 184, 146)', 'rgb(248, 246, 240)'],
      desc: '深邃黑曜背景前少女回眸凝望，宝蓝头巾搭金黄垂帛形成强烈冷暖对比，左颊受光柔和、耳畔珍珠高光点睛。',
      layers: OIL_FIG_LAYERS,
      buildStrokes(api) {
        const M = window.Code2PaintOilMaster;
        const W = 920, H = 1120;
        const scene = M.createScene(W, H, 6001);

        // Obsidian Dutch studio ground
        scene.draw2D((ctx) => {
          const bg = ctx.createRadialGradient(410, 420, 60, 460, 560, 720);
          bg.addColorStop(0, '#2a221c');
          bg.addColorStop(0.55, '#15110e');
          bg.addColorStop(1, '#0c0a08');
          ctx.fillStyle = bg;
          ctx.fillRect(0, 0, W, H);
        });

        // 3D sculpted classical head & Vermeer studio lighting from left
        scene.shadePortrait3D({
          cx: 455, cy: 435, headW: 132, headH: 168,
          yaw: -0.26, lightDir: [-0.74, -0.40, 0.54],
          palette: 'classic', bald: true,
          skinLit: [248, 206, 172], skinMid: [204, 142, 108], skinShadow: [58, 40, 38],
          hairCol: [42, 28, 20],
          dressCol: [142, 104, 48],
          lipCol: [188, 82, 74],
          irisCol: [74, 62, 48],
          hasCollar: true, collarCol: [244, 240, 232]
        });

        // Ultramarine turban, golden flowing trailing sash, warm ochre jacket & luminous pearl
        scene.draw2D((ctx) => {
          // Trailing lemon-ochre headscarf tail behind shadowed right side
          const tailGrad = ctx.createLinearGradient(490, 310, 650, 740);
          tailGrad.addColorStop(0, '#4482cc');
          tailGrad.addColorStop(0.32, '#e2b242');
          tailGrad.addColorStop(0.75, '#b88628');
          tailGrad.addColorStop(1, '#4c3818');
          ctx.fillStyle = tailGrad;
          ctx.beginPath();
          ctx.moveTo(475, 255);
          ctx.bezierCurveTo(610, 265, 655, 425, 635, 675);
          ctx.bezierCurveTo(618, 725, 565, 735, 535, 665);
          ctx.bezierCurveTo(548, 520, 545, 385, 485, 325);
          ctx.closePath();
          ctx.fill();

          // Draped shadow fold in trailing sash
          ctx.strokeStyle = 'rgba(54, 38, 16, 0.55)';
          ctx.lineWidth = 14;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(578, 415);
          ctx.quadraticCurveTo(598, 535, 565, 655);
          ctx.stroke();

          // Royal Ultramarine wrapped silk turban over forehead
          const turbGrad = ctx.createRadialGradient(392, 255, 24, 470, 295, 210);
          turbGrad.addColorStop(0, '#5a9ae8');
          turbGrad.addColorStop(0.42, '#2458aa');
          turbGrad.addColorStop(0.85, '#133068');
          turbGrad.addColorStop(1, '#0c1c3e');
          ctx.fillStyle = turbGrad;
          ctx.beginPath();
          ctx.moveTo(318, 405);
          ctx.bezierCurveTo(298, 258, 398, 175, 528, 215);
          ctx.bezierCurveTo(618, 245, 622, 355, 568, 408);
          ctx.bezierCurveTo(518, 310, 396, 295, 326, 398);
          ctx.closePath();
          ctx.fill();

          // Forehead silk band twist highlight
          ctx.strokeStyle = 'rgba(134, 186, 248, 0.65)';
          ctx.lineWidth = 16;
          ctx.beginPath();
          ctx.moveTo(335, 352);
          ctx.quadraticCurveTo(435, 252, 558, 315);
          ctx.stroke();

          // Ochre jacket front folds & crisp white linen collar tip
          ctx.fillStyle = '#c4923e';
          ctx.beginPath();
          ctx.moveTo(285, 765);
          ctx.lineTo(445, 685);
          ctx.lineTo(495, 920);
          ctx.lineTo(240, 1080);
          ctx.closePath();
          ctx.fill();

          // Luminous teardrop pearl earring nestled in neck shadow under ear
          const px = 550, py = 528;
          ctx.fillStyle = 'rgba(16, 12, 10, 0.55)';
          ctx.beginPath();
          ctx.ellipse(px + 6, py + 8, 16, 20, 0.1, 0, Math.PI * 2);
          ctx.fill();

          const pearlGrad = ctx.createRadialGradient(px - 4, py - 5, 2, px, py, 19);
          pearlGrad.addColorStop(0, '#fffef8');
          pearlGrad.addColorStop(0.35, '#dddad2');
          pearlGrad.addColorStop(0.75, '#787878');
          pearlGrad.addColorStop(1, '#2c2c2c');
          ctx.fillStyle = pearlGrad;
          ctx.beginPath();
          ctx.ellipse(px, py, 14, 18, 0.08, 0, Math.PI * 2);
          ctx.fill();

          // Dual silver-white window & collar bounce catchlights on pearl
          ctx.fillStyle = '#ffffff';
          ctx.beginPath(); ctx.ellipse(px - 5, py - 6, 4.5, 5.5, -0.2, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = 'rgba(226, 232, 238, 0.72)';
          ctx.beginPath(); ctx.ellipse(px + 3, py + 9, 4, 2.5, 0.2, 0, Math.PI * 2); ctx.fill();
        });

        M.synthesize(api, scene, {
          style: 'classic',
          totalStrokes: 5000,
          seed: 6001,
          layers: WORKS[0].layers,
          roi: [
            { cx: 445, cy: 435, rx: 165, ry: 205, boost: 4.0 },
            { cx: 550, cy: 528, rx: 45, ry: 48, boost: 4.5 },
            { cx: 455, cy: 295, rx: 160, ry: 110, boost: 2.5 }
          ]
        });
      }
    },

    // =========================================================================
    // 2. REMBRANDT SCHOLAR (45-DEGREE CHIAROSCURO & BEARD)
    // =========================================================================
    {
      id: 'oil-fig-rembrandt',
      title: '油画人物·伦勃朗三角光老学者',
      subtitle: '戏剧性明暗对照法：焦褐深底 → 45°三角侧光颧颊 → 银须绒帽 → 羊皮古籍高光',
      group: '油画·人物',
      category: '古典肖像油画',
      seal: '伦勃朗光',
      mode: 'oil',
      theme: 'gallery-dark',
      backdropColor: '#16100b',
      width: 920,
      height: 1120,
      seed: 6002,
      swatches: ['rgb(22, 16, 11)', 'rgb(228, 174, 116)', 'rgb(218, 212, 198)', 'rgb(112, 48, 32)', 'rgb(176, 134, 68)'],
      desc: '采用经典伦勃朗 45° 三角光塑造睿智长者，右颧留一抹柔和倒三角受光，银白浓须与暗红披肩肌理厚重深沉。',
      layers: OIL_FIG_LAYERS,
      buildStrokes(api) {
        const M = window.Code2PaintOilMaster;
        const W = 920, H = 1120;
        const scene = M.createScene(W, H, 6002);

        scene.shadeBackdropWallTable({
          horizonY: 855,
          lightX: 0.25, lightY: 0.25,
          wallLit: [44, 32, 22], wallMid: [24, 17, 12], wallDark: [12, 9, 6],
          tableType: 'wood',
          tableLit: [74, 48, 28], tableMid: [42, 26, 16], tableDark: [18, 11, 7]
        });

        scene.shadePortrait3D({
          cx: 455, cy: 405, headW: 132, headH: 168,
          yaw: -0.18, lightDir: [-0.76, -0.42, 0.49],
          palette: 'rembrandt', bald: true,
          skinLit: [242, 186, 128], skinMid: [176, 112, 72], skinShadow: [44, 24, 18],
          hairCol: [182, 172, 154],
          beardCol: [178, 166, 146],
          dressCol: [112, 42, 28],
          lipCol: [154, 82, 68],
          hasCollar: true, collarCol: [226, 214, 188]
        });

        // Velvet scholar's beret, heavy gold chain & open illuminated parchment tome
        scene.draw2D((ctx) => {
          // Black velvet beret resting low across brows
          const capGrad = ctx.createRadialGradient(365, 225, 22, 455, 255, 190);
          capGrad.addColorStop(0, '#44362a');
          capGrad.addColorStop(0.55, '#1e1714');
          capGrad.addColorStop(1, '#0e0b0a');
          ctx.fillStyle = capGrad;
          ctx.beginPath();
          ctx.ellipse(452, 242, 168, 72, -0.09, 0, Math.PI * 2);
          ctx.fill();
          ctx.beginPath();
          ctx.ellipse(455, 278, 134, 42, -0.04, 0, Math.PI * 2);
          ctx.fill();

          // Crimson fur-lined cloak lapels & gleaming gold medallion chain
          ctx.strokeStyle = '#d4a244';
          ctx.lineWidth = 10;
          ctx.beginPath();
          ctx.moveTo(318, 710);
          ctx.quadraticCurveTo(458, 820, 608, 710);
          ctx.stroke();

          ctx.fillStyle = '#f2c868';
          ctx.beginPath(); ctx.arc(462, 772, 18, 0, Math.PI * 2); ctx.fill();

          // Open parchment folio resting on oak desk in foreground
          ctx.fillStyle = '#3c2214';
          ctx.fillRect(285, 868, 355, 205);
          const pgL = ctx.createLinearGradient(300, 882, 460, 1045);
          pgL.addColorStop(0, '#f4e8c4'); pgL.addColorStop(1, '#be9c64');
          ctx.fillStyle = pgL;
          ctx.beginPath();
          ctx.moveTo(302, 882); ctx.quadraticCurveTo(380, 865, 458, 892);
          ctx.lineTo(458, 1052); ctx.quadraticCurveTo(380, 1028, 302, 1045);
          ctx.closePath();
          ctx.fill();

          const pgR = ctx.createLinearGradient(462, 892, 622, 1045);
          pgR.addColorStop(0, '#dec490'); pgR.addColorStop(1, '#8c6e42');
          ctx.fillStyle = pgR;
          ctx.beginPath();
          ctx.moveTo(462, 892); ctx.quadraticCurveTo(540, 866, 620, 882);
          ctx.lineTo(620, 1045); ctx.quadraticCurveTo(540, 1028, 462, 1052);
          ctx.closePath();
          ctx.fill();

          // Faint calligraphic ink staves on parchment page
          ctx.strokeStyle = 'rgba(72, 52, 34, 0.55)';
          ctx.lineWidth = 2.5;
          for (let r = 0; r < 6; r++) {
            const ry = 918 + r * 20;
            ctx.beginPath(); ctx.moveTo(324, ry); ctx.lineTo(436, ry + 4); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(484, ry + 4); ctx.lineTo(598, ry); ctx.stroke();
          }
        });

        M.synthesize(api, scene, {
          style: 'classic',
          totalStrokes: 5000,
          seed: 6002,
          layers: WORKS[1].layers,
          roi: [
            { cx: 455, cy: 405, rx: 165, ry: 215, boost: 4.0 },
            { cx: 462, cy: 770, rx: 135, ry: 60, boost: 2.2 },
            { cx: 460, cy: 960, rx: 165, ry: 95, boost: 2.8 }
          ]
        });
      }
    },

    // =========================================================================
    // 3. DEGAS SPOTLIGHT BALLERINA
    // =========================================================================
    {
      id: 'oil-fig-ballerina',
      title: '油画人物·舞台聚光芭蕾舞者',
      subtitle: '德加式舞台光影：暗紫暮景幕布 → 舞台木地板反光 → 轻盈蓬松芭蕾纱裙 → 缎面高光',
      group: '油画·人物',
      category: '印象派人物油画',
      seal: '印象派人物',
      mode: 'oil',
      theme: 'gallery-dark',
      backdropColor: '#191822',
      width: 960,
      height: 1140,
      seed: 6003,
      swatches: ['rgb(32, 34, 54)', 'rgb(246, 238, 222)', 'rgb(228, 178, 162)', 'rgb(192, 168, 108)', 'rgb(255, 250, 238)'],
      desc: '暮蓝剧场帷幕与反光木质舞台间，白裙舞者优雅舒展双臂踮尖起舞，多层象牙白薄纱如睡莲绽放。',
      layers: OIL_FIG_LAYERS,
      buildStrokes(api) {
        const M = window.Code2PaintOilMaster;
        const W = 960, H = 1140;
        const scene = M.createScene(W, H, 6003);

        // Moody indigo stage curtain & warm wood stage floor
        scene.shadeBackdropWallTable({
          horizonY: 735,
          lightX: 0.48, lightY: 0.30,
          wallLit: [56, 62, 102], wallMid: [34, 36, 64], wallDark: [18, 18, 36],
          tableType: 'wood',
          tableLit: [174, 134, 92], tableMid: [108, 78, 52], tableDark: [52, 36, 26],
          castShadows: [{ cx: 485, cy: 965, rx: 115, ry: 28, rot: 0.04, strength: 0.58 }]
        });

        scene.shadeDrapery({
          poly: [[0, 0], [260, 0], [240, 738], [0, 738]],
          colLit: [74, 62, 104], colMid: [44, 38, 68], colDark: [20, 18, 36], foldFreq: 0.045
        });
        scene.shadeDrapery({
          poly: [[705, 0], [960, 0], [960, 738], [730, 738]],
          colLit: [70, 58, 98], colMid: [42, 36, 64], colDark: [18, 16, 34], foldFreq: 0.045
        });

        scene.draw2D((ctx, w, h, N) => {
          // Warm theater spotlight cone illuminating floor & tutu
          const spot = ctx.createRadialGradient(485, 480, 40, 485, 580, 420);
          spot.addColorStop(0, 'rgba(255, 240, 206, 0.28)');
          spot.addColorStop(0.6, 'rgba(214, 188, 148, 0.10)');
          spot.addColorStop(1, 'rgba(24, 24, 48, 0)');
          ctx.fillStyle = spot;
          ctx.fillRect(0, 0, W, H);

          // Perspective wooden stage floorboards
          ctx.strokeStyle = 'rgba(42, 28, 18, 0.42)';
          ctx.lineWidth = 3;
          for (let b = -4; b <= 4; b++) {
            ctx.beginPath();
            ctx.moveTo(480 + b * 68, 735);
            ctx.lineTo(480 + b * 165, 1140);
            ctx.stroke();
          }

          // Legs & satin pointe shoes
          const legGrad = ctx.createLinearGradient(440, 620, 520, 955);
          legGrad.addColorStop(0, '#e8beaa'); legGrad.addColorStop(1, '#ba8874');
          ctx.strokeStyle = legGrad;
          ctx.lineWidth = 22;
          ctx.lineCap = 'round';
          // Standing right leg en pointe
          ctx.beginPath(); ctx.moveTo(465, 625); ctx.quadraticCurveTo(476, 780, 474, 945); ctx.stroke();
          // Extended pose left leg
          ctx.lineWidth = 19;
          ctx.beginPath(); ctx.moveTo(508, 615); ctx.quadraticCurveTo(568, 755, 558, 885); ctx.stroke();

          // Ivory satin pointe slippers & ribbons
          ctx.fillStyle = '#f6e6d8';
          ctx.beginPath(); ctx.ellipse(474, 956, 12, 20, 0.06, 0, Math.PI * 2); ctx.fill();
          ctx.beginPath(); ctx.ellipse(560, 895, 14, 18, -0.35, 0, Math.PI * 2); ctx.fill();

          // Graceful lifted arms in fifth / curved expressive pose
          ctx.strokeStyle = '#eec2ae';
          ctx.lineWidth = 18;
          ctx.beginPath();
          ctx.moveTo(432, 415);
          ctx.bezierCurveTo(328, 375, 298, 255, 392, 205);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(532, 418);
          ctx.bezierCurveTo(645, 365, 658, 252, 565, 202);
          ctx.stroke();

          // Sculpted neck, tilted head & auburn chignon
          ctx.fillStyle = '#e8bca8';
          ctx.fillRect(465, 355, 32, 58);
          const headG = ctx.createRadialGradient(468, 318, 8, 480, 328, 52);
          headG.addColorStop(0, '#fae0ce'); headG.addColorStop(0.65, '#dfac92'); headG.addColorStop(1, '#986652');
          ctx.fillStyle = headG;
          ctx.beginPath(); ctx.ellipse(480, 326, 40, 48, 0.12, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = '#382218';
          ctx.beginPath(); ctx.ellipse(488, 296, 42, 32, -0.1, Math.PI, Math.PI * 2.1); ctx.fill();
          ctx.beginPath(); ctx.arc(518, 298, 18, 0, Math.PI * 2); ctx.fill();

          // Fitted ivory-champagne satin bodice
          const bodG = ctx.createLinearGradient(428, 412, 535, 558);
          bodG.addColorStop(0, '#fffaf0'); bodG.addColorStop(0.55, '#e8dcc6'); bodG.addColorStop(1, '#b6a488');
          ctx.fillStyle = bodG;
          ctx.beginPath();
          ctx.moveTo(434, 412); ctx.lineTo(528, 412);
          ctx.lineTo(516, 548); ctx.lineTo(446, 548);
          ctx.closePath(); ctx.fill();

          // Multilayered luminous tulle tutu skirt catching footlight from below
          for (let tier = 0; tier < 4; tier++) {
            const ty = 552 + tier * 24;
            const rx = 185 + tier * 18;
            const ry = 46 + tier * 8;
            const tg = ctx.createRadialGradient(475, ty - 12, 24, 485, ty, rx);
            tg.addColorStop(0, tier < 2 ? 'rgba(255, 252, 244, 0.92)' : 'rgba(246, 236, 214, 0.85)');
            tg.addColorStop(0.65, 'rgba(218, 206, 192, 0.72)');
            tg.addColorStop(1, 'rgba(128, 126, 152, 0.58)');
            ctx.fillStyle = tg;
            ctx.beginPath();
            for (let a = 0; a <= 48; a++) {
              const ang = (a / 48) * Math.PI * 2;
              const fl = 1 + Math.sin(ang * 14 + tier) * 0.045;
              const px = 485 + Math.cos(ang) * rx * fl;
              const py = ty + Math.sin(ang) * ry * fl;
              if (a === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
            }
            ctx.closePath();
            ctx.fill();
          }

          // Warm rose-gold satin sash waist ribbon
          ctx.fillStyle = '#d49a86';
          ctx.beginPath(); ctx.ellipse(481, 542, 44, 12, 0, 0, Math.PI * 2); ctx.fill();
        });

        M.synthesize(api, scene, {
          style: 'impressionist',
          totalStrokes: 5000,
          seed: 6003,
          layers: WORKS[2].layers,
          roi: [
            { cx: 482, cy: 525, rx: 220, ry: 225, boost: 3.8 },
            { cx: 480, cy: 330, rx: 95, ry: 105, boost: 3.5 }
          ]
        });
      }
    },

    // =========================================================================
    // 4. MONET WOMAN WITH A PARASOL
    // =========================================================================
    {
      id: 'oil-fig-parasol',
      title: '油画人物·风中执阳伞淑女',
      subtitle: '外光印象派法度：晴空流云 → 逆光撑伞侧影 → 碎草花甸 → 透光白裙与绿荫反光',
      group: '油画·人物',
      category: '印象派人物油画',
      seal: '外光印象派',
      mode: 'oil',
      theme: 'gallery-dark',
      backdropColor: '#243448',
      width: 960,
      height: 1140,
      seed: 6004,
      swatches: ['rgb(92, 146, 204)', 'rgb(248, 246, 236)', 'rgb(142, 178, 96)', 'rgb(198, 224, 178)', 'rgb(74, 86, 128)'],
      desc: '致敬莫奈外光写生：明亮蓝天白云与起伏风草山丘之间，白衣女郎高擎绿荫阳伞驻足花海，风起裙扬。',
      layers: OIL_FIG_LAYERS,
      buildStrokes(api) {
        const M = window.Code2PaintOilMaster;
        const W = 960, H = 1140, H_Y = 745;
        const scene = M.createScene(W, H, 6004);

        scene.shadeSkyAndClouds({
          horizonY: H_Y,
          skyTop: [72, 128, 198],
          skyMid: [128, 178, 228],
          skyHorizon: [218, 234, 244],
          sunX: 740, sunY: 180, sunR: 26, glowR: 320, glowCol: [255, 250, 224], glowStrength: 0.45,
          cloudCover: 0.52, cloudScale: 0.0046,
          cloudLitCol: [255, 254, 248], cloudDarkCol: [148, 176, 214], cloudAlpha: 0.90
        });

        scene.draw2D((ctx, w, h, N) => {
          // Sunlit billowing green meadow slope with lavender shadow & wildflowers
          const hill = ctx.createLinearGradient(0, 705, 0, H);
          hill.addColorStop(0, '#9cc464');
          hill.addColorStop(0.55, '#6a9644');
          hill.addColorStop(1, '#3b5c28');
          ctx.fillStyle = hill;
          ctx.beginPath();
          ctx.moveTo(0, 755);
          ctx.quadraticCurveTo(440, 692, 960, 742);
          ctx.lineTo(960, H); ctx.lineTo(0, H);
          ctx.closePath(); ctx.fill();

          // Violet-blue parasol cast shadow across meadow grass
          ctx.fillStyle = 'rgba(72, 86, 134, 0.58)';
          ctx.beginPath(); ctx.ellipse(425, 925, 195, 58, -0.14, 0, Math.PI * 2); ctx.fill();

          // Scarlet poppies & buttercups scattered along hill ridge
          for (let k = 0; k < 55; k++) {
            const fx = N.rand() * W;
            const fy = 748 + N.rand() * 355;
            ctx.fillStyle = k % 3 === 0 ? '#e8523a' : (k % 3 === 1 ? '#f8e06c' : '#fff8e8');
            ctx.beginPath(); ctx.ellipse(fx, fy, 7 + N.rand() * 6, 4 + N.rand() * 4, N.rand(), 0, Math.PI * 2); ctx.fill();
          }

          // Flowing backlit muslin skirt & trailing sash catching blue sky + green grass bounce
          const skirt = ctx.createLinearGradient(345, 510, 625, 915);
          skirt.addColorStop(0, '#eef4fa');
          skirt.addColorStop(0.45, '#b6c6de');
          skirt.addColorStop(0.85, '#c4dcba');
          skirt.addColorStop(1, '#98b498');
          ctx.fillStyle = skirt;
          ctx.beginPath();
          ctx.moveTo(455, 515);
          ctx.bezierCurveTo(375, 625, 295, 815, 268, 925);
          ctx.bezierCurveTo(410, 962, 575, 945, 628, 905);
          ctx.bezierCurveTo(585, 765, 545, 615, 512, 515);
          ctx.closePath(); ctx.fill();

          // Bright rim-lit white edges on wind-blown skirt folds
          ctx.strokeStyle = 'rgba(255, 253, 246, 0.88)';
          ctx.lineWidth = 12;
          ctx.beginPath(); ctx.moveTo(510, 525); ctx.quadraticCurveTo(598, 705, 624, 902); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(465, 528); ctx.quadraticCurveTo(445, 725, 428, 922); ctx.stroke();

          // Fitted blouse, blue waist ribbon, head with veiled bonnet & arms holding parasol handle
          ctx.fillStyle = '#dde6f0';
          ctx.beginPath();
          ctx.moveTo(445, 395); ctx.lineTo(525, 395);
          ctx.lineTo(514, 522); ctx.lineTo(454, 522);
          ctx.closePath(); ctx.fill();
          ctx.fillStyle = '#5c78a8';
          ctx.fillRect(450, 512, 68, 16);

          ctx.fillStyle = '#d49a7c';
          ctx.beginPath(); ctx.ellipse(492, 345, 34, 42, -0.08, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = '#785038';
          ctx.beginPath(); ctx.arc(496, 326, 36, Math.PI * 0.9, Math.PI * 2.1); ctx.fill();

          // Raised arm holding wooden parasol shaft
          ctx.strokeStyle = '#6e4e34'; ctx.lineWidth = 6;
          ctx.beginPath(); ctx.moveTo(452, 525); ctx.lineTo(395, 245); ctx.stroke();

          ctx.strokeStyle = '#e8c4b0'; ctx.lineWidth = 15; ctx.lineCap = 'round';
          ctx.beginPath(); ctx.moveTo(462, 412); ctx.lineTo(418, 438); ctx.lineTo(426, 405); ctx.stroke();

          // Translucent sunlit green-cream parasol dome glowing against azure clouds
          ctx.save();
          ctx.translate(412, 232);
          ctx.rotate(-0.24);
          const pDome = ctx.createLinearGradient(0, -145, 0, 22);
          pDome.addColorStop(0, '#fcfbf2');
          pDome.addColorStop(0.55, '#c4dcab');
          pDome.addColorStop(1, '#58824c');
          ctx.fillStyle = pDome;
          ctx.beginPath();
          ctx.moveTo(-245, 22);
          ctx.bezierCurveTo(-185, -135, 185, -135, 245, 22);
          ctx.quadraticCurveTo(0, 48, -245, 22);
          ctx.closePath(); ctx.fill();

          ctx.strokeStyle = 'rgba(72, 98, 62, 0.55)'; ctx.lineWidth = 3;
          for (const rx of [-155, -72, 0, 72, 155]) {
            ctx.beginPath(); ctx.moveTo(0, -98); ctx.quadraticCurveTo(rx * 0.7, -38, rx, 28); ctx.stroke();
          }
          ctx.restore();
        });

        M.synthesize(api, scene, {
          style: 'impressionist',
          totalStrokes: 5000,
          seed: 6004,
          layers: WORKS[3].layers,
          roi: [
            { cx: 465, cy: 485, rx: 225, ry: 315, boost: 3.8 },
            { cx: 412, cy: 232, rx: 215, ry: 95, boost: 2.6 }
          ]
        });
      }
    },

    // =========================================================================
    // 5. CANDLELIT VIOLINIST (WARM CHIAROSCURO)
    // =========================================================================
    {
      id: 'oil-fig-violinist',
      title: '油画人物·烛光小提琴手',
      subtitle: '暖烛暗调肖像：烛辉橘黄光源 → 弧面琥珀木琴 → 倾首演奏姿态 → 琴弦亮芒',
      group: '油画·人物',
      category: '古典人物油画',
      seal: '烛光人物',
      mode: 'oil',
      theme: 'gallery-dark',
      backdropColor: '#120b07',
      width: 940,
      height: 1120,
      seed: 6005,
      swatches: ['rgb(18, 11, 7)', 'rgb(248, 174, 62)', 'rgb(168, 74, 34)', 'rgb(142, 34, 32)', 'rgb(255, 244, 206)'],
      desc: '一盏微烛映亮黑夜演奏者面颊与抛光栗木小提琴，金红烛火与琴弓交错生辉，静谧富有音乐质感。',
      layers: OIL_FIG_LAYERS,
      buildStrokes(api) {
        const M = window.Code2PaintOilMaster;
        const W = 940, H = 1120;
        const scene = M.createScene(W, H, 6005);

        scene.draw2D((ctx) => {
          const room = ctx.createRadialGradient(735, 580, 18, 620, 560, 740);
          room.addColorStop(0, '#ffd474');
          room.addColorStop(0.18, '#964416');
          room.addColorStop(0.55, '#2b140c');
          room.addColorStop(1, '#0d0806');
          ctx.fillStyle = room;
          ctx.fillRect(0, 0, W, H);
        });

        scene.shadePortrait3D({
          cx: 410, cy: 360, headW: 120, headH: 156,
          yaw: 0.24, lightDir: [0.76, 0.20, 0.62],
          palette: 'classic', hairPart: -0.2, longHair: true,
          skinLit: [252, 204, 146], skinMid: [186, 110, 66], skinShadow: [42, 22, 16],
          hairCol: [48, 28, 20],
          dressCol: [132, 30, 26],
          lipCol: [174, 72, 58],
          hasCollar: true, collarCol: [242, 228, 198]
        });

        scene.draw2D((ctx) => {
          // Carved glossy amber violin nestled under musician's chin
          ctx.save();
          ctx.translate(525, 558);
          ctx.rotate(-0.42);
          const vGrad = ctx.createRadialGradient(22, -26, 8, 0, 0, 145);
          vGrad.addColorStop(0, '#f49a3c');
          vGrad.addColorStop(0.5, '#9c3614');
          vGrad.addColorStop(1, '#341008');
          ctx.fillStyle = vGrad;
          ctx.beginPath(); ctx.ellipse(0, -48, 52, 58, 0, 0, Math.PI * 2); ctx.fill();
          ctx.beginPath(); ctx.ellipse(0, 48, 64, 68, 0, 0, Math.PI * 2); ctx.fill();
          ctx.fillRect(-34, -48, 68, 96);

          ctx.fillStyle = '#1c0c08';
          ctx.beginPath(); ctx.arc(-42, 0, 18, 0, Math.PI * 2); ctx.fill();
          ctx.beginPath(); ctx.arc(42, 0, 18, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = '#181412';
          ctx.fillRect(-10, -215, 20, 220);

          ctx.strokeStyle = 'rgba(255, 228, 174, 0.78)';
          ctx.lineWidth = 2;
          for (const sx of [-5, -1.5, 2, 5.5]) {
            ctx.beginPath(); ctx.moveTo(sx, -210); ctx.lineTo(sx, 78); ctx.stroke();
          }
          ctx.restore();

          // Warm golden bow slicing across strings
          ctx.strokeStyle = '#f2cc7c';
          ctx.lineWidth = 6;
          ctx.beginPath(); ctx.moveTo(295, 675); ctx.lineTo(755, 395); ctx.stroke();
          ctx.strokeStyle = 'rgba(255, 246, 212, 0.62)';
          ctx.lineWidth = 3;
          ctx.beginPath(); ctx.moveTo(302, 685); ctx.lineTo(758, 405); ctx.stroke();

          // Musicians illuminated fingers & wax candle on foreground table right
          ctx.fillStyle = '#e8a26c';
          ctx.beginPath(); ctx.ellipse(612, 435, 22, 16, 0.3, 0, Math.PI * 2); ctx.fill();
          ctx.beginPath(); ctx.ellipse(382, 642, 24, 18, -0.3, 0, Math.PI * 2); ctx.fill();

          ctx.fillStyle = '#b48a34';
          ctx.fillRect(722, 748, 42, 195);
          ctx.fillStyle = '#f4ebd4';
          ctx.fillRect(732, 622, 22, 128);
          const fl = ctx.createRadialGradient(743, 588, 3, 743, 588, 52);
          fl.addColorStop(0, '#ffffff');
          fl.addColorStop(0.32, '#ffd862');
          fl.addColorStop(1, 'rgba(248, 122, 34, 0)');
          ctx.fillStyle = fl;
          ctx.beginPath(); ctx.arc(743, 588, 52, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = '#fffef0';
          ctx.beginPath(); ctx.ellipse(743, 594, 8, 22, 0, 0, Math.PI * 2); ctx.fill();
        });

        M.synthesize(api, scene, {
          style: 'classic',
          totalStrokes: 5000,
          seed: 6005,
          layers: WORKS[4].layers,
          roi: [
            { cx: 410, cy: 360, rx: 145, ry: 175, boost: 3.6 },
            { cx: 530, cy: 555, rx: 145, ry: 165, boost: 3.6 },
            { cx: 743, cy: 590, rx: 65, ry: 75, boost: 3.4 }
          ]
        });
      }
    },

    // =========================================================================
    // 6. WINDOW-LIT MOTHER AND CHILD
    // =========================================================================
    {
      id: 'oil-fig-mother-child',
      title: '油画人物·窗畔柔光母与子',
      subtitle: '柔和自然天光：格栅窗棂亮光 → 温暖相拥构图 → 群青与暖橘厚涂 → 额发柔光',
      group: '油画·人物',
      category: '温情人物油画',
      seal: '人物肖像',
      mode: 'oil',
      theme: 'gallery-dark',
      backdropColor: '#1f2428',
      width: 960,
      height: 1120,
      seed: 6006,
      swatches: ['rgb(232, 238, 232)', 'rgb(42, 74, 122)', 'rgb(214, 112, 68)', 'rgb(242, 198, 168)', 'rgb(74, 62, 52)'],
      desc: '左侧木格窗棂透入如水天光，映照俯首亲昵孩童的母亲侧影，群青长袍与暖橘针织衣衬出人间温情。',
      layers: OIL_FIG_LAYERS,
      buildStrokes(api) {
        const M = window.Code2PaintOilMaster;
        const W = 960, H = 1120;
        const scene = M.createScene(W, H, 6006);

        scene.shadeBackdropWallTable({
          horizonY: 960,
          lightX: 0.14, lightY: 0.25,
          wallLit: [198, 206, 202], wallMid: [112, 122, 124], wallDark: [44, 52, 56],
          tableType: 'wood',
          tableLit: [114, 86, 62], tableMid: [74, 54, 40], tableDark: [38, 28, 20]
        });

        // Daylight window left
        scene.draw2D((ctx) => {
          const win = ctx.createLinearGradient(0, 60, 215, 760);
          win.addColorStop(0, '#eef4ef'); win.addColorStop(1, '#bcc8c4');
          ctx.fillStyle = win;
          ctx.fillRect(0, 65, 205, 680);
          ctx.fillStyle = '#4c4640';
          ctx.fillRect(92, 65, 14, 680);
          ctx.fillRect(0, 395, 205, 14);
        });

        // Mother's tender sunlit portrait head + azure indigo gown
        scene.shadePortrait3D({
          cx: 418, cy: 350, headW: 120, headH: 152,
          yaw: 0.26, lightDir: [-0.74, -0.38, 0.54],
          palette: 'classic', longHair: true, hairPart: 0.15,
          skinLit: [248, 208, 178], skinMid: [204, 148, 118], skinShadow: [88, 66, 62],
          hairCol: [96, 62, 42],
          dressCol: [42, 74, 124],
          lipCol: [188, 92, 84],
          hasCollar: false
        });

        // Cradled child in warm coral-terracotta wool sweater + mother's comforting arm
        scene.draw2D((ctx) => {
          // Mother's ultramarine shawl draping across shoulders and holding infant
          const robeG = ctx.createLinearGradient(255, 565, 660, 1080);
          robeG.addColorStop(0, '#4476ba'); robeG.addColorStop(0.5, '#2b4d86'); robeG.addColorStop(1, '#162848');
          ctx.fillStyle = robeG;
          ctx.beginPath();
          ctx.moveTo(265, 635); ctx.bezierCurveTo(225, 815, 215, 1020, 240, 1120);
          ctx.lineTo(665, 1120); ctx.bezierCurveTo(675, 895, 635, 675, 525, 585);
          ctx.closePath(); ctx.fill();

          // Child's sunlit coral-terracotta knit body
          const chCloth = ctx.createRadialGradient(545, 695, 24, 575, 760, 165);
          chCloth.addColorStop(0, '#f2945a'); chCloth.addColorStop(0.55, '#d66e40'); chCloth.addColorStop(1, '#843820');
          ctx.fillStyle = chCloth;
          ctx.beginPath();
          ctx.ellipse(575, 765, 118, 145, 0.15, 0, Math.PI * 2);
          ctx.fill();

          // Child's soft rounded cheek resting lovingly on mother's chest/shoulder
          const chHead = ctx.createRadialGradient(535, 515, 12, 562, 540, 82);
          chHead.addColorStop(0, '#fde2cc'); chHead.addColorStop(0.6, '#eab28c'); chHead.addColorStop(1, '#a46e54');
          ctx.fillStyle = chHead;
          ctx.beginPath(); ctx.ellipse(562, 540, 68, 76, -0.15, 0, Math.PI * 2); ctx.fill();

          // Soft curly golden-chestnut child hair
          ctx.fillStyle = '#c8965c';
          ctx.beginPath(); ctx.ellipse(568, 495, 66, 48, 0.1, Math.PI * 0.88, Math.PI * 2.15); ctx.fill();

          // Mother's gentle sunlit arm and hand cradling child
          const armG = ctx.createLinearGradient(325, 785, 565, 835);
          armG.addColorStop(0, '#3e6cae'); armG.addColorStop(0.65, '#f4c6a4'); armG.addColorStop(1, '#d29a78');
          ctx.strokeStyle = '#f2c4a2';
          ctx.lineWidth = 34;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(415, 815); ctx.quadraticCurveTo(495, 855, 585, 815);
          ctx.stroke();
        });

        M.synthesize(api, scene, {
          style: 'impressionist',
          totalStrokes: 5000,
          seed: 6006,
          layers: WORKS[5].layers,
          roi: [
            { cx: 485, cy: 455, rx: 215, ry: 225, boost: 3.8 },
            { cx: 525, cy: 765, rx: 175, ry: 155, boost: 2.6 }
          ]
        });
      }
    },

    // =========================================================================
    // 7. MILLET GOLDEN WHEATFIELD HARVESTERS (LANDSCAPE + FIGURES)
    // =========================================================================
    {
      id: 'oil-fig-harvester',
      title: '油画人物·金色麦田拾穗者',
      subtitle: '巴比松金辉风景人物：晚霞橙空 → 俯身劳动剪影 → 碎笔金黄麦束 → 逆光轮廓金边',
      group: '油画·人物',
      category: '风景人物油画',
      seal: '麦田人物',
      mode: 'oil',
      theme: 'gallery-dark',
      backdropColor: '#2c1e12',
      width: 1120,
      height: 820,
      seed: 6007,
      swatches: ['rgb(246, 188, 92)', 'rgb(206, 132, 52)', 'rgb(168, 52, 38)', 'rgb(52, 66, 98)', 'rgb(255, 236, 168)'],
      desc: '暮色金光洒满辽阔秋收麦原，拾穗农妇系红巾蓝裙俯身于金浪之间，展现沉稳厚重的劳动诗意。',
      layers: OIL_FIG_LAYERS,
      buildStrokes(api) {
        const M = window.Code2PaintOilMaster;
        const W = 1120, H = 820, H_Y = 345;
        const scene = M.createScene(W, H, 6007);

        scene.shadeSkyAndClouds({
          horizonY: H_Y,
          skyTop: [96, 118, 152],
          skyMid: [198, 166, 128],
          skyHorizon: [252, 214, 132],
          sunX: 560, sunY: 225, sunR: 28, glowR: 460, glowCol: [255, 224, 136], glowStrength: 0.74,
          cloudCover: 0.44, cloudLitCol: [255, 236, 174], cloudDarkCol: [148, 124, 114]
        });

        scene.draw2D((ctx, w, h, N) => {
          // Rolling Barbizon golden wheat fields
          const fld = ctx.createLinearGradient(0, H_Y, 0, H);
          fld.addColorStop(0, '#dcb25c');
          fld.addColorStop(0.45, '#be8a36');
          fld.addColorStop(1, '#583e1c');
          ctx.fillStyle = fld;
          ctx.fillRect(0, H_Y, W, H - H_Y);

          // Distant golden haystacks & wooded horizon
          ctx.fillStyle = '#785a38';
          ctx.fillRect(0, H_Y - 12, W, 22);
          [[190, 342, 85, 58], [320, 348, 72, 48], [860, 340, 105, 68]].forEach(([hx, hy, hw, hh]) => {
            const hg = ctx.createLinearGradient(hx - hw / 2, hy - hh, hx + hw / 2, hy);
            hg.addColorStop(0, '#f4c864'); hg.addColorStop(1, '#845622');
            ctx.fillStyle = hg;
            ctx.beginPath(); ctx.ellipse(hx, hy, hw, hh, 0, Math.PI, Math.PI * 2); ctx.fill();
          });

          // Sunlit golden wheat stubble tufts across middleground
          for (let k = 0; k < 120; k++) {
            const wx = N.rand() * W, wy = H_Y + 28 + N.rand() * (H - H_Y - 40);
            ctx.strokeStyle = k % 2 === 0 ? 'rgba(252, 218, 120, 0.65)' : 'rgba(128, 86, 32, 0.55)';
            ctx.lineWidth = 3;
            ctx.beginPath(); ctx.moveTo(wx, wy); ctx.lineTo(wx + (N.rand() - 0.5) * 18, wy - 14 - N.rand() * 16); ctx.stroke();
          }

          // Three sculptural Millet Gleaners with sunlit linen cuffs, golden wheat sheaves & natural drapery folds
          function drawGleaner(gx, gy, sc, headscarf, apron, upright) {
            ctx.fillStyle = 'rgba(44, 30, 18, 0.58)';
            ctx.beginPath(); ctx.ellipse(gx - 15 * sc, gy + 114 * sc, 96 * sc, 24 * sc, 0, 0, Math.PI * 2); ctx.fill();

            if (!upright) {
              // Dark woollen peasant skirt with pleated shadow folds
              ctx.fillStyle = '#322b26';
              ctx.beginPath();
              ctx.moveTo(gx - 48 * sc, gy - 8 * sc);
              ctx.bezierCurveTo(gx - 102 * sc, gy + 24 * sc, gx - 106 * sc, gy + 102 * sc, gx - 52 * sc, gy + 116 * sc);
              ctx.lineTo(gx + 34 * sc, gy + 110 * sc);
              ctx.bezierCurveTo(gx + 48 * sc, gy + 40 * sc, gx + 12 * sc, gy - 14 * sc, gx - 48 * sc, gy - 8 * sc);
              ctx.closePath(); ctx.fill();

              // Tied indigo/slate peasant apron pocket holding golden wheat stalks
              ctx.fillStyle = apron;
              ctx.beginPath();
              ctx.ellipse(gx - 14 * sc, gy + 45 * sc, 48 * sc, 36 * sc, 0.2, 0, Math.PI * 2);
              ctx.fill();

              // Sunlit cream linen bodice catching warm sunset rim light along arched spine
              const blG = ctx.createLinearGradient(gx - 28 * sc, gy - 46 * sc, gx + 54 * sc, gy + 14 * sc);
              blG.addColorStop(0, '#fae8b2'); blG.addColorStop(0.55, '#dcd0b4'); blG.addColorStop(1, '#7c6e58');
              ctx.fillStyle = blG;
              ctx.beginPath(); ctx.ellipse(gx + 14 * sc, gy - 14 * sc, 56 * sc, 32 * sc, 0.30, 0, Math.PI * 2); ctx.fill();

              // Wrapped headscarf + shadowed profile cheek & outstretched right arm gathering grain
              ctx.fillStyle = '#a86a48';
              ctx.beginPath(); ctx.ellipse(gx + 62 * sc, gy + 22 * sc, 16 * sc, 18 * sc, 0.2, 0, Math.PI * 2); ctx.fill();
              ctx.fillStyle = headscarf;
              ctx.beginPath(); ctx.ellipse(gx + 62 * sc, gy + 6 * sc, 25 * sc, 20 * sc, 0.35, 0, Math.PI * 2); ctx.fill();
              ctx.fillStyle = '#e8d8b6';
              ctx.beginPath(); ctx.moveTo(gx + 32 * sc, gy + 4 * sc); ctx.lineTo(gx + 62 * sc, gy + 58 * sc); ctx.lineWidth = 18 * sc; ctx.lineCap = 'round'; ctx.strokeStyle = '#d4c4a2'; ctx.stroke();
              ctx.strokeStyle = '#c47c52'; ctx.lineWidth = 12 * sc;
              ctx.beginPath(); ctx.moveTo(gx + 58 * sc, gy + 52 * sc); ctx.lineTo(gx + 78 * sc, gy + 94 * sc); ctx.stroke();

              // Golden gathered wheat sheaf fanned below outstretched hand
              ctx.strokeStyle = '#f6cb52'; ctx.lineWidth = 5 * sc;
              for (const dy of [-12, 0, 12]) {
                ctx.beginPath(); ctx.moveTo(gx + 56 * sc, gy + 96 * sc); ctx.lineTo(gx + 96 * sc, gy + (88 + dy) * sc); ctx.stroke();
              }
            } else {
              // Rising taller harvester fastening amber sheaf at waist
              ctx.fillStyle = apron;
              ctx.beginPath();
              ctx.moveTo(gx - 34 * sc, gy - 38 * sc);
              ctx.lineTo(gx + 40 * sc, gy - 38 * sc);
              ctx.lineTo(gx + 64 * sc, gy + 114 * sc);
              ctx.lineTo(gx - 52 * sc, gy + 114 * sc);
              ctx.closePath(); ctx.fill();
              ctx.fillStyle = '#ddd0b2';
              ctx.beginPath(); ctx.ellipse(gx - 2 * sc, gy - 66 * sc, 42 * sc, 36 * sc, 0.15, 0, Math.PI * 2); ctx.fill();
              ctx.fillStyle = headscarf;
              ctx.beginPath(); ctx.ellipse(gx + 8 * sc, gy - 112 * sc, 22 * sc, 24 * sc, -0.2, 0, Math.PI * 2); ctx.fill();
              ctx.strokeStyle = '#f2c248'; ctx.lineWidth = 10 * sc; ctx.lineCap = 'round';
              ctx.beginPath(); ctx.moveTo(gx - 46 * sc, gy - 42 * sc); ctx.lineTo(gx + 48 * sc, gy - 18 * sc); ctx.stroke();
            }
          }

          drawGleaner(278, 555, 1.08, '#9e3428', '#344464', false);
          drawGleaner(542, 542, 1.12, '#c8422c', '#44587e', false);
          drawGleaner(812, 520, 1.02, '#c69844', '#5c4e3e', true);
        });

        M.synthesize(api, scene, {
          style: 'impressionist',
          totalStrokes: 5000,
          seed: 6007,
          layers: WORKS[6].layers,
          roi: [
            { cx: 545, cy: 550, rx: 410, ry: 175, boost: 3.4 },
            { cx: 560, cy: 235, rx: 240, ry: 95, boost: 2.2 }
          ]
        });
      }
    },

    // =========================================================================
    // 8. VERMEER GIRL READING BY AN OPEN WINDOW
    // =========================================================================
    {
      id: 'oil-fig-reader',
      title: '油画人物·窗边读书女孩',
      subtitle: '荷风静室光影：绿帘深墙 → 侧窗书桌静读 → 赭黄衣袖垂首 → 书页反光映颊',
      group: '油画·人物',
      category: '古典人物油画',
      seal: '静室肖像',
      mode: 'oil',
      theme: 'gallery-dark',
      backdropColor: '#19221c',
      width: 920,
      height: 1120,
      seed: 6008,
      swatches: ['rgb(36, 56, 44)', 'rgb(218, 168, 74)', 'rgb(248, 240, 216)', 'rgb(232, 182, 146)', 'rgb(34, 48, 76)'],
      desc: '深绿垂幔映衬静室书香，少女垂首专注阅读窗前打开的亮白古籍，书页温柔反光打亮下颌与手指。',
      layers: OIL_FIG_LAYERS,
      buildStrokes(api) {
        const M = window.Code2PaintOilMaster;
        const W = 920, H = 1120;
        const scene = M.createScene(W, H, 6008);

        scene.shadeBackdropWallTable({
          horizonY: 755,
          lightX: 0.14, lightY: 0.25,
          wallLit: [132, 142, 124], wallMid: [86, 94, 82], wallDark: [36, 42, 36],
          tableType: 'linen',
          tableLit: [56, 78, 124], tableMid: [34, 46, 78], tableDark: [18, 24, 44]
        });

        // Leaded window left + heavy emerald Dutch curtain right
        scene.draw2D((ctx) => {
          const wG = ctx.createLinearGradient(0, 45, 200, 665);
          wG.addColorStop(0, '#eef4ec'); wG.addColorStop(1, '#b6c4ba');
          ctx.fillStyle = wG;
          ctx.fillRect(14, 48, 188, 610);
          ctx.fillStyle = '#383c32';
          ctx.fillRect(102, 48, 12, 610);
          ctx.fillRect(14, 345, 188, 12);
        });

        scene.shadeDrapery({
          poly: [[685, 0], [920, 0], [920, 1120], [665, 1120]],
          colLit: [58, 96, 72], colMid: [34, 58, 44], colDark: [14, 24, 18], foldFreq: 0.042
        });

        scene.shadePortrait3D({
          cx: 462, cy: 385, headW: 118, headH: 152,
          yaw: -0.32, lightDir: [-0.76, -0.30, 0.56],
          palette: 'classic', hairPart: -0.18, longHair: false,
          skinLit: [248, 212, 178], skinMid: [204, 152, 120], skinShadow: [86, 66, 60],
          hairCol: [148, 96, 48],
          dressCol: [216, 166, 68],
          lipCol: [184, 84, 76],
          hasCollar: true, collarCol: [246, 240, 224]
        });

        // Open illuminated book raised in reader's hands catching window glow
        scene.draw2D((ctx) => {
          // Chignon curls catching warm amber window light
          ctx.fillStyle = '#c8823c';
          ctx.beginPath(); ctx.arc(522, 342, 46, 0, Math.PI * 2); ctx.fill();

          // Mustard-gold bodice & puffed sleeve
          const slG = ctx.createLinearGradient(305, 555, 585, 815);
          slG.addColorStop(0, '#f4c85c'); slG.addColorStop(0.55, '#c48a34'); slG.addColorStop(1, '#684418');
          ctx.fillStyle = slG;
          ctx.beginPath();
          ctx.ellipse(455, 705, 145, 125, -0.08, 0, Math.PI * 2);
          ctx.fill();

          // Open book illuminated by window light (reflecting onto face)
          ctx.save();
          ctx.translate(392, 695);
          ctx.rotate(-0.18);
          ctx.fillStyle = '#482818';
          ctx.fillRect(-118, -58, 236, 138);
          ctx.fillStyle = '#fff9e6';
          ctx.beginPath();
          ctx.moveTo(-108, -48); ctx.quadraticCurveTo(-54, -64, 0, -44);
          ctx.lineTo(0, 68); ctx.quadraticCurveTo(-54, 48, -108, 64);
          ctx.closePath(); ctx.fill();
          ctx.fillStyle = '#ede2c2';
          ctx.beginPath();
          ctx.moveTo(2, -44); ctx.quadraticCurveTo(56, -62, 108, -48);
          ctx.lineTo(108, 64); ctx.quadraticCurveTo(56, 48, 2, 68);
          ctx.closePath(); ctx.fill();
          ctx.restore();

          // Delicate backlit fingertips holding margins
          ctx.fillStyle = '#f2c29e';
          ctx.beginPath(); ctx.ellipse(294, 718, 20, 14, -0.2, 0, Math.PI * 2); ctx.fill();
          ctx.beginPath(); ctx.ellipse(485, 684, 20, 14, 0.2, 0, Math.PI * 2); ctx.fill();
        });

        M.synthesize(api, scene, {
          style: 'classic',
          totalStrokes: 5000,
          seed: 6008,
          layers: WORKS[7].layers,
          roi: [
            { cx: 458, cy: 385, rx: 145, ry: 175, boost: 3.8 },
            { cx: 392, cy: 695, rx: 165, ry: 115, boost: 3.2 }
          ]
        });
      }
    },

    // =========================================================================
    // 9. WEATHERED OLD SEA CAPTAIN (THICK KNIFE & BRUSH IMPASTO)
    // =========================================================================
    {
      id: 'oil-fig-captain',
      title: '油画人物·海风老船长肖像',
      subtitle: '粗犷厚涂人物：阴晴海天底色 → 深蓝船长制服 → 海风红润面骨 → 苍须厚涂提亮',
      group: '油画·人物',
      category: '性格肖像油画',
      seal: '肖像油画',
      mode: 'oil',
      theme: 'gallery-dark',
      backdropColor: '#162028',
      width: 920,
      height: 1120,
      seed: 6009,
      swatches: ['rgb(42, 64, 86)', 'rgb(28, 42, 66)', 'rgb(212, 138, 98)', 'rgb(228, 224, 216)', 'rgb(208, 168, 72)'],
      desc: '风浪蓝灰远海映衬沧桑航海长者，宽笔刻画饱经风霜颧骨与厚实深蓝防水大衣，苍白胡须豪放有力。',
      layers: OIL_FIG_LAYERS,
      buildStrokes(api) {
        const M = window.Code2PaintOilMaster;
        const W = 920, H = 1120;
        const scene = M.createScene(W, H, 6009);

        scene.shadeSkyAndClouds({
          horizonY: 695,
          skyTop: [46, 68, 92],
          skyMid: [88, 114, 138],
          skyHorizon: [176, 192, 204],
          sunX: 180, sunY: 220, glowR: 280, glowCol: [218, 226, 230], glowStrength: 0.36,
          cloudCover: 0.62, cloudLitCol: [218, 224, 232], cloudDarkCol: [48, 66, 86]
        });

        scene.shadeOcean({
          yTop: 695, yBot: H,
          seaTop: [34, 58, 84], seaMid: [22, 42, 64], seaBot: [14, 24, 42],
          hasGlitter: false, waveScale: 0.025
        });

        scene.shadePortrait3D({
          cx: 460, cy: 430, headW: 136, headH: 170,
          yaw: -0.18, lightDir: [-0.66, -0.46, 0.59],
          palette: 'classic', bald: true,
          skinLit: [242, 180, 142], skinMid: [192, 116, 86], skinShadow: [64, 42, 40],
          hairCol: [194, 186, 174],
          beardCol: [192, 184, 170],
          dressCol: [24, 38, 62],
          lipCol: [164, 82, 72],
          hasCollar: true, collarCol: [214, 210, 198]
        });

        // Captain's visored navy cap with gold anchor braid + pea coat brass buttons
        scene.draw2D((ctx) => {
          const capG = ctx.createLinearGradient(340, 215, 580, 325);
          capG.addColorStop(0, '#364e78'); capG.addColorStop(0.55, '#1b2842'); capG.addColorStop(1, '#0d1422');
          ctx.fillStyle = capG;
          ctx.beginPath();
          ctx.ellipse(462, 265, 148, 68, -0.04, 0, Math.PI * 2);
          ctx.fill();

          // Gold braid band & anchor crest
          ctx.strokeStyle = '#d4a644';
          ctx.lineWidth = 10;
          ctx.beginPath(); ctx.moveTo(334, 310); ctx.quadraticCurveTo(462, 336, 590, 306); ctx.stroke();
          ctx.fillStyle = '#f2cc68';
          ctx.beginPath(); ctx.ellipse(455, 286, 18, 20, 0, 0, Math.PI * 2); ctx.fill();

          // Glossy lacquered black cap visor
          ctx.fillStyle = '#12161c';
          ctx.beginPath();
          ctx.moveTo(332, 322); ctx.quadraticCurveTo(458, 376, 588, 318);
          ctx.quadraticCurveTo(460, 334, 332, 322);
          ctx.closePath(); ctx.fill();

          // Navy pea-coat upturned collar & gleaming brass buttons
          ctx.fillStyle = '#16243d';
          ctx.beginPath();
          ctx.moveTo(265, 695); ctx.lineTo(355, 650); ctx.lineTo(405, 865); ctx.lineTo(255, 960); ctx.closePath(); ctx.fill();
          ctx.beginPath();
          ctx.moveTo(655, 695); ctx.lineTo(565, 650); ctx.lineTo(515, 865); ctx.lineTo(665, 960); ctx.closePath(); ctx.fill();
          ctx.fillStyle = '#e6b852';
          for (const [bx, by] of [[372, 855], [378, 965], [548, 855], [542, 965]]) {
            ctx.beginPath(); ctx.arc(bx, by, 13, 0, Math.PI * 2); ctx.fill();
          }
        });

        M.synthesize(api, scene, {
          style: 'knife',
          totalStrokes: 5000,
          seed: 6009,
          layers: WORKS[8].layers,
          roi: [
            { cx: 460, cy: 430, rx: 165, ry: 215, boost: 4.0 },
            { cx: 460, cy: 280, rx: 160, ry: 75, boost: 2.8 }
          ]
        });
      }
    },

    // =========================================================================
    // 10. PASSIONATE RED FLAMENCO DANCER (SWIRLING VANGOGH ENERGY)
    // =========================================================================
    {
      id: 'oil-fig-flamenco',
      title: '油画人物·红裙弗拉明戈舞者',
      subtitle: '激情狂舞笔触：深红夜幕底 → 旋风状层叠大红荷叶裙 → 昂首扬臂动势 → 飞扬红花高光',
      group: '油画·人物',
      category: '动态人物油画',
      seal: '动态油画',
      mode: 'oil',
      theme: 'gallery-dark',
      backdropColor: '#160908',
      width: 960,
      height: 1140,
      seed: 6010,
      swatches: ['rgb(24, 10, 10)', 'rgb(206, 30, 28)', 'rgb(242, 82, 48)', 'rgb(18, 14, 14)', 'rgb(255, 224, 178)'],
      desc: '深沉夜色中舞者身着炽烈大红弗拉明戈多层荷叶舞裙旋转绽放，豪放弯曲的刷痕与发间红花极具戏剧张力。',
      layers: OIL_FIG_LAYERS,
      buildStrokes(api) {
        const M = window.Code2PaintOilMaster;
        const W = 960, H = 1140;
        const scene = M.createScene(W, H, 6010);

        scene.shadeDrapery({
          poly: [[0, 0], [W, 0], [W, H], [0, H]],
          colLit: [84, 18, 20], colMid: [42, 10, 12], colDark: [16, 6, 8], foldFreq: 0.032, foldAngle: -0.15
        });

        scene.draw2D((ctx) => {
          // Warm tablao stage floor glow below whirling skirt
          const fl = ctx.createRadialGradient(480, 960, 40, 480, 1020, 460);
          fl.addColorStop(0, 'rgba(182, 84, 42, 0.55)');
          fl.addColorStop(1, 'rgba(20, 8, 8, 0)');
          ctx.fillStyle = fl;
          ctx.fillRect(0, 740, W, 400);

          // Sinuous fuller arched flamenco arms catching amber spotlight
          ctx.lineCap = 'round';
          ctx.strokeStyle = '#e8aa82';
          ctx.lineWidth = 28;
          ctx.beginPath(); ctx.moveTo(478, 322); ctx.quadraticCurveTo(548, 232, 628, 152); ctx.stroke();
          ctx.lineWidth = 24;
          ctx.beginPath(); ctx.moveTo(432, 338); ctx.quadraticCurveTo(352, 435, 268, 525); ctx.stroke();
          // Sculpted palm/castanet flare silhouette
          ctx.fillStyle = '#e49e76';
          ctx.beginPath(); ctx.ellipse(635, 146, 18, 11, -0.5, 0, Math.PI * 2); ctx.fill();
          ctx.beginPath(); ctx.ellipse(262, 530, 18, 11, 0.5, 0, Math.PI * 2); ctx.fill();

          // Proud tilted head, black hair chignon & bright red camellia flower
          ctx.fillStyle = '#e4a27c';
          ctx.beginPath(); ctx.ellipse(455, 255, 34, 44, -0.22, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = '#120e0e';
          ctx.beginPath(); ctx.ellipse(442, 242, 36, 40, -0.15, 0, Math.PI * 2); ctx.fill();
          ctx.beginPath(); ctx.arc(408, 255, 20, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = '#f22c28';
          ctx.beginPath(); ctx.arc(412, 232, 18, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = '#ff8a62';
          ctx.beginPath(); ctx.arc(416, 228, 7, 0, Math.PI * 2); ctx.fill();

          // Fitted deep crimson embroidered bodice tapering to waist
          const bod = ctx.createLinearGradient(418, 305, 515, 515);
          bod.addColorStop(0, '#c82422'); bod.addColorStop(0.55, '#861214'); bod.addColorStop(1, '#3e0a0c');
          ctx.fillStyle = bod;
          ctx.beginPath();
          ctx.moveTo(432, 315); ctx.lineTo(498, 315);
          ctx.lineTo(504, 515); ctx.lineTo(426, 515);
          ctx.closePath(); ctx.fill();

          // Swirling cascade of vermilion, carmine & orange flamenco skirt ruffles
          const tiers = [
            { y: 535, wL: 165, wR: 185, h: 165, c0: '#f44830', c1: '#8e1214' },
            { y: 655, wL: 255, wR: 285, h: 205, c0: '#ec3026', c1: '#720c10' },
            { y: 785, wL: 345, wR: 385, h: 255, c0: '#fa6234', c1: '#5c0a0e' },
            { y: 895, wL: 425, wR: 465, h: 235, c0: '#f63c28', c1: '#42080a' }
          ];
          tiers.forEach((tr, ti) => {
            const g = ctx.createLinearGradient(480 - tr.wL, tr.y, 480 + tr.wR, tr.y + tr.h);
            g.addColorStop(0, tr.c1);
            g.addColorStop(0.45, tr.c0);
            g.addColorStop(0.85, '#ff8644');
            g.addColorStop(1, tr.c1);
            ctx.fillStyle = g;
            ctx.beginPath();
            ctx.moveTo(480 - tr.wL * 0.48, tr.y - 25);
            for (let s = 0; s <= 12; s++) {
              const frac = s / 12;
              const px = (480 - tr.wL) + frac * (tr.wL + tr.wR);
              const py = tr.y + tr.h * 0.68 + Math.sin(s * 1.9 + ti) * 38;
              ctx.lineTo(px, py);
            }
            ctx.lineTo(480 + tr.wR * 0.55, tr.y - 25);
            ctx.closePath(); ctx.fill();
          });

          // Fiery orange-gold swirling ridge highlights across the spinning ruffles
          ctx.strokeStyle = 'rgba(255, 164, 92, 0.72)';
          ctx.lineWidth = 10;
          for (const arc of [
            [[365, 585], [495, 655], [645, 595]],
            [[245, 745], [465, 835], [755, 725]],
            [[165, 925], [475, 1025], [825, 895]]
          ]) {
            ctx.beginPath();
            ctx.moveTo(arc[0][0], arc[0][1]);
            ctx.quadraticCurveTo(arc[1][0], arc[1][1], arc[2][0], arc[2][1]);
            ctx.stroke();
          }
        });

        M.synthesize(api, scene, {
          style: 'vangogh',
          totalStrokes: 5000,
          seed: 6010,
          layers: WORKS[9].layers,
          roi: [
            { cx: 455, cy: 265, rx: 115, ry: 125, boost: 3.6 },
            { cx: 485, cy: 760, rx: 325, ry: 255, boost: 2.8 }
          ]
        });
      }
    }
  ];

  if (typeof window !== 'undefined' && window.Code2PaintCatalog) {
    window.Code2PaintCatalog.addPack(WORKS);
  }
})();
