(function () {
  function padToExact(api, targetCount, layerId, label, drawFn) {
    let guard = 0;
    while (api.strokes.length < targetCount && guard < 8000) {
      drawFn(guard);
      guard++;
    }
    if (api.strokes.length > targetCount) {
      api.strokes.length = targetCount;
    }
  }

  const WORKS = [
    // =========================================================================
    // 1. LEONARDO DA VINCI — MONA LISA (SFUMATO GLAZING, 42,000 STROKES)
    // =========================================================================
    {
      id: 'oil-master-mona-lisa',
      title: '世界名作·达芬奇《蒙娜丽莎》',
      subtitle: '文艺复兴渐隐法（Sfumato）终极临摹 · 42,000 笔无痕薄釉晕染、空气透视双地平线与木板微裂纹',
      group: '油画·世界名作',
      category: '文艺复兴肖像',
      seal: '渐隐法·4.2万笔',
      mode: 'oil',
      theme: 'gallery-dark',
      backdropColor: '#16140f',
      width: 860,
      height: 1180,
      seed: 1503,
      maxOilStrokes: 100000,
      swatches: ['rgb(96, 128, 126)', 'rgb(198, 152, 98)', 'rgb(228, 188, 134)', 'rgb(74, 58, 36)', 'rgb(28, 22, 16)'],
      desc: '依卢浮宫《蒙娜丽莎》构图与技法深度临摹：左高右低双地平线青绿空气透视山水、古罗马石拱桥、无眉渐隐眼窝与神秘嘴角阴影、透明黑纱、金色丝绒百褶胸衣与交叠双手，全画采用无轮廓薄釉多层罩染。',
      analysis: {
        original: '莱昂纳多·达·芬奇 · c. 1503–1519 · 巴黎卢浮宫博物馆（杨木板油画）',
        movement: '意大利盛期文艺复兴（High Renaissance）人文肖像里程碑。打破正侧面僵化传统，以四分之三侧身微转搭配交叉双臂构建稳定的金字塔几何构图，使人物与身后苍茫幽远的宇宙自然山水融为一体。',
        palette: '受岁月上光油氧化与古典地球颜料影响，整体呈温暖琥珀黄褐调：铅白与朱砂微调的橄榄暖肤、生褐与焦褐深影、铜绿蓝青（Azurite/Verdigris）远山冷雾、土黄与暗绿丝绒袖褶、骨黑轻纱。',
        technique: '独创“渐隐法（Sfumato）——如烟雾般消散于空气之中”：放弃任何锐利外轮廓线与生硬笔触凸起，通过 20–40 层极薄亚麻仁油透明釉（厚度仅数微米）反复揉擦眼角与嘴角，在低分辨率视网膜余光中触发“微笑时隐时现”的视觉奇迹，并伴有空气透视远山与岁月木板微裂纹。',
        algorithm: '采用 560px 超高清三维雕刻胸像高度场（柔滑卵形面颊、眼窝与嘴角渐隐阴影）结合双地平线远山岩石着色器，调用 sfumato-master 六层引擎：全层级关闭画刀浮雕（bevel = 0），降为 0.52–0.72 低不透明度半透明罩染叠加至 41,650 笔，末层补涂 350 条极细 0.65px 杨木板微龟裂纹，精准落笔 42,000 笔。'
      },
      layers: [
        { id: 1, name: '一 · 琥珀熟褐有色底（Imprimatura）定稿' },
        { id: 2, name: '二 · 双地平线空气透视远山与拱桥' },
        { id: 3, name: '三 · 三分之四侧面渐隐明暗素描底（Abbozzo）' },
        { id: 4, name: '四 · 透明釉多层罩染肌肤、卷发与丝绒衣褶' },
        { id: 5, name: '五 · 神秘眼眶嘴角微影、透光薄纱与交叉双手' },
        { id: 6, name: '六 · 古典清漆润光与杨木板细微龟裂纹收笔' }
      ],
      buildStrokes(api) {
        const M = window.Code2PaintOilMaster;
        const W = 860, H = 1180;
        const scene = M.createScene(W, H, 1503, { maxDim: 560 });
        const N = scene.N;

        // 1. Aerial perspective atmospheric sky
        scene.shadeSkyAndClouds({
          horizonY: 580,
          skyTop: [78, 128, 134],
          skyMid: [132, 168, 156],
          skyHorizon: [192, 188, 148],
          sunX: 320, sunY: 220, glowR: 480, glowCol: [212, 206, 168], glowStrength: 0.25,
          cloudCover: 0.20, cloudLitCol: [188, 204, 192], cloudDarkCol: [96, 134, 136], cloudAlpha: 0.55
        });

        // 2. Two-horizon Dolomite peaks
        scene.shadeMountainRange({
          baseY: 590,
          peaks: [[0, 235], [145, 212], [295, 295], [460, 340], [635, 285], [765, 265], [860, 310]],
          sunDirX: -0.65, sunDirY: -0.45,
          rockLit: [122, 146, 136], rockDark: [62, 92, 98],
          snowLine: 1.5, mistCol: [164, 178, 154], mistStrength: 0.55, ridgeAmp: 22
        });

        // 3. Asymmetric middle valley + stone bridge + loggia balustrade
        scene.draw2D((ctx) => {
          const leftSlope = ctx.createLinearGradient(0, 360, 320, 610);
          leftSlope.addColorStop(0, '#5a684a');
          leftSlope.addColorStop(0.55, '#685634');
          leftSlope.addColorStop(1, '#322b18');
          ctx.fillStyle = leftSlope;
          ctx.beginPath();
          ctx.moveTo(0, 355);
          ctx.quadraticCurveTo(185, 385, 340, 445);
          ctx.lineTo(340, 610);
          ctx.lineTo(0, 610);
          ctx.closePath();
          ctx.fill();

          ctx.strokeStyle = '#9c7846';
          ctx.lineWidth = 13;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(45, 428);
          ctx.bezierCurveTo(175, 445, 95, 488, 205, 515);
          ctx.bezierCurveTo(265, 535, 165, 570, 225, 602);
          ctx.stroke();

          const rightVal = ctx.createLinearGradient(480, 420, 860, 610);
          rightVal.addColorStop(0, '#526856');
          rightVal.addColorStop(0.6, '#38462c');
          rightVal.addColorStop(1, '#242a18');
          ctx.fillStyle = rightVal;
          ctx.fillRect(480, 420, 380, 195);

          ctx.fillStyle = '#4c7e7c';
          ctx.beginPath();
          ctx.moveTo(560, 468);
          ctx.bezierCurveTo(645, 455, 765, 472, 845, 505);
          ctx.lineTo(845, 558);
          ctx.bezierCurveTo(720, 540, 625, 518, 540, 520);
          ctx.closePath();
          ctx.fill();

          ctx.strokeStyle = '#7e6644';
          ctx.lineWidth = 9;
          ctx.beginPath();
          ctx.moveTo(648, 522);
          ctx.quadraticCurveTo(718, 495, 795, 512);
          ctx.stroke();
          for (const px of [668, 705, 742, 778]) {
            ctx.fillStyle = '#5c4a32';
            ctx.fillRect(px - 3, 508, 7, 24);
          }

          ctx.fillStyle = '#2d2418';
          ctx.fillRect(0, 588, W, 28);
          ctx.fillStyle = '#463826';
          ctx.fillRect(0, 584, W, 6);
          for (const [cx, cw] of [[0, 38], [822, 38]]) {
            const cg = ctx.createLinearGradient(cx, 380, cx + cw, 588);
            cg.addColorStop(0, '#6a5438'); cg.addColorStop(1, '#281e14');
            ctx.fillStyle = cg;
            ctx.fillRect(cx, 380, cw, 208);
          }
        });

        // 4. Sculpted luminous serene female Renaissance bust (seamless throat transition, soft center-parted hairline)
        scene.draw2D((ctx) => {
          // Graceful pyramidal upper torso & glowing amber-olive decollete
          const dressG = ctx.createLinearGradient(165, 525, 695, 1180);
          dressG.addColorStop(0, '#38361e');
          dressG.addColorStop(0.5, '#222011');
          dressG.addColorStop(1, '#100e08');
          ctx.fillStyle = dressG;
          ctx.beginPath();
          ctx.moveTo(298, 525);
          ctx.bezierCurveTo(215, 625, 165, 920, 145, 1180);
          ctx.lineTo(745, 1180);
          ctx.bezierCurveTo(705, 910, 645, 615, 558, 520);
          ctx.closePath();
          ctx.fill();

          // Dark flowing chestnut ringlets cascading behind shoulders (drawn BEFORE neck & face so zero chinstrap!)
          ctx.fillStyle = '#1d150e';
          ctx.beginPath();
          ctx.ellipse(430, 355, 134, 178, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.beginPath();
          ctx.ellipse(342, 435, 42, 135, 0.16, 0, Math.PI * 2);
          ctx.fill();
          ctx.beginPath();
          ctx.ellipse(522, 425, 46, 140, -0.16, 0, Math.PI * 2);
          ctx.fill();

          // Smooth warm throat & upper chest seamless chiaroscuro (subtle chin ambient shadow)
          const neckG = ctx.createRadialGradient(418, 482, 16, 432, 495, 118);
          neckG.addColorStop(0, '#dcb87a');
          neckG.addColorStop(0.55, '#9e7640');
          neckG.addColorStop(0.88, '#583f22');
          neckG.addColorStop(1, '#241b10');
          ctx.fillStyle = neckG;
          ctx.beginPath();
          ctx.moveTo(384, 398);
          ctx.quadraticCurveTo(374, 475, 344, 548);
          ctx.quadraticCurveTo(432, 608, 518, 548);
          ctx.quadraticCurveTo(486, 472, 478, 398);
          ctx.closePath();
          ctx.fill();

          const chinSh = ctx.createLinearGradient(0, 415, 0, 468);
          chinSh.addColorStop(0, 'rgba(62, 42, 22, 0.55)');
          chinSh.addColorStop(1, 'rgba(62, 42, 22, 0)');
          ctx.fillStyle = chinSh;
          ctx.fillRect(365, 415, 130, 52);

          // Oval delicate Leonardo face modeled with warm amber-gold left keylight & seamless shadow turn
          const faceG = ctx.createRadialGradient(398, 296, 12, 434, 324, 114);
          faceG.addColorStop(0, '#efd296');
          faceG.addColorStop(0.45, '#c6985a');
          faceG.addColorStop(0.80, '#7c562e');
          faceG.addColorStop(1, '#362414');
          ctx.fillStyle = faceG;
          ctx.beginPath();
          ctx.moveTo(344, 298);
          ctx.bezierCurveTo(340, 222, 378, 184, 430, 184);
          ctx.bezierCurveTo(482, 184, 514, 226, 510, 304);
          ctx.bezierCurveTo(506, 376, 470, 424, 426, 426);
          ctx.bezierCurveTo(378, 424, 348, 374, 344, 298);
          ctx.closePath();
          ctx.fill();

          // Center-parted soft temple hair framing serene Renaissance forehead
          ctx.fillStyle = '#241a10';
          ctx.beginPath();
          ctx.moveTo(430, 178);
          ctx.quadraticCurveTo(372, 184, 338, 256);
          ctx.quadraticCurveTo(352, 224, 428, 212);
          ctx.closePath();
          ctx.fill();
          ctx.beginPath();
          ctx.moveTo(430, 178);
          ctx.quadraticCurveTo(492, 186, 518, 262);
          ctx.quadraticCurveTo(502, 224, 430, 212);
          ctx.closePath();
          ctx.fill();

          // Tight sheer silk mourning veil hugging crown strictly (no sky aura bump!)
          ctx.fillStyle = 'rgba(22, 18, 13, 0.24)';
          ctx.beginPath();
          ctx.ellipse(430, 224, 90, 34, 0, Math.PI, Math.PI * 2);
          ctx.fill();

          // Soft sfumato browless orbital hollows, calm half-hooded almond eyelids & enigmatic mouth shadow
          for (const [ex, ey] of [[396, 294], [460, 294]]) {
            const soc = ctx.createRadialGradient(ex, ey, 3, ex, ey, 22);
            soc.addColorStop(0, 'rgba(54, 36, 22, 0.58)');
            soc.addColorStop(1, 'rgba(134, 94, 52, 0)');
            ctx.fillStyle = soc;
            ctx.beginPath(); ctx.ellipse(ex, ey, 22, 14, 0, 0, Math.PI * 2); ctx.fill();

            ctx.fillStyle = '#d4c6a8';
            ctx.beginPath(); ctx.ellipse(ex, ey + 2, 10, 4.2, 0, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#261c14';
            ctx.beginPath(); ctx.arc(ex - 1, ey + 2, 4.2, 0, Math.PI * 2); ctx.fill();
            // Calm half-hooded upper eyelid shadow trimming top of sclera
            ctx.strokeStyle = 'rgba(56, 36, 22, 0.85)';
            ctx.lineWidth = 2.6;
            ctx.beginPath(); ctx.moveTo(ex - 11, ey + 1); ctx.quadraticCurveTo(ex, ey - 3.5, ex + 11, ey + 1); ctx.stroke();
            ctx.fillStyle = '#fff5dc';
            ctx.beginPath(); ctx.arc(ex - 2, ey + 1, 1.2, 0, Math.PI * 2); ctx.fill();
          }

          // Subtle sculpted Leonardo nose ridge & right-wing shadow
          const noseG = ctx.createLinearGradient(418, 292, 444, 348);
          noseG.addColorStop(0, 'rgba(246, 218, 162, 0.60)');
          noseG.addColorStop(0.65, 'rgba(168, 122, 72, 0.25)');
          noseG.addColorStop(1, 'rgba(62, 42, 24, 0.45)');
          ctx.fillStyle = noseG;
          ctx.beginPath(); ctx.ellipse(425, 326, 9, 25, 0.06, 0, Math.PI * 2); ctx.fill();

          // Enigmatic serene upturned mouth corners & soft chin shadow
          ctx.strokeStyle = 'rgba(72, 36, 24, 0.68)';
          ctx.lineWidth = 2.2;
          ctx.beginPath();
          ctx.moveTo(400, 367);
          ctx.quadraticCurveTo(426, 374, 452, 365);
          ctx.stroke();
          ctx.fillStyle = 'rgba(148, 76, 54, 0.52)';
          ctx.beginPath(); ctx.ellipse(426, 371, 18, 5.5, 0, 0, Math.PI * 2); ctx.fill();

          // Gold-embroidered bodice neckline trim & ochre-bronze silk pleated sleeves
          ctx.strokeStyle = '#a8843e'; ctx.lineWidth = 6.5;
          ctx.beginPath(); ctx.moveTo(344, 548); ctx.quadraticCurveTo(432, 606, 518, 548); ctx.stroke();

          const sleeveL = ctx.createLinearGradient(185, 625, 365, 925);
          sleeveL.addColorStop(0, '#8e6d34'); sleeveL.addColorStop(0.55, '#543c1a'); sleeveL.addColorStop(1, '#20160a');
          ctx.fillStyle = sleeveL;
          ctx.beginPath(); ctx.ellipse(268, 805, 84, 175, 0.24, 0, Math.PI * 2); ctx.fill();

          const sleeveR = ctx.createLinearGradient(515, 625, 685, 925);
          sleeveR.addColorStop(0, '#a27e40'); sleeveR.addColorStop(0.5, '#5c421e'); sleeveR.addColorStop(1, '#1c1408');
          ctx.fillStyle = sleeveR;
          ctx.beginPath(); ctx.ellipse(588, 788, 92, 168, -0.22, 0, Math.PI * 2); ctx.fill();

          // Draped dark cloth scarf cascading down left shoulder
          ctx.fillStyle = '#18150e';
          ctx.beginPath();
          ctx.moveTo(510, 540);
          ctx.bezierCurveTo(615, 602, 655, 825, 575, 1085);
          ctx.lineTo(495, 1085);
          ctx.bezierCurveTo(535, 845, 535, 645, 485, 560);
          ctx.closePath();
          ctx.fill();

          // Wooden armchair armrest
          ctx.fillStyle = '#4c321a'; ctx.fillRect(155, 965, 420, 46);
          ctx.fillStyle = '#24160a'; ctx.fillRect(140, 1008, 440, 172);

          // ARTICULATED WRISTS & DELICATE CROSSED FOREGROUND HANDS (left hand resting on wood arm, right hand lightly draped over wrist)
          const wristL = ctx.createLinearGradient(340, 885, 440, 975);
          wristL.addColorStop(0, '#c89a5c'); wristL.addColorStop(1, '#6a4822');
          ctx.fillStyle = wristL;
          ctx.beginPath();
          ctx.moveTo(495, 880); ctx.quadraticCurveTo(425, 898, 355, 932);
          ctx.quadraticCurveTo(335, 965, 368, 978); ctx.quadraticCurveTo(445, 955, 522, 925);
          ctx.closePath(); ctx.fill();

          // Tapered resting lower-hand fingers on wooden armrest
          ctx.strokeStyle = '#c49254'; ctx.lineWidth = 10; ctx.lineCap = 'round';
          for (let f = 0; f < 4; f++) {
            ctx.beginPath();
            ctx.moveTo(372, 938 + f * 9);
            ctx.quadraticCurveTo(342, 952 + f * 10, 326 + f * 3, 972 + f * 7);
            ctx.stroke();
          }

          // Upper right forearm & luminous serene hand resting across left wrist
          const handTop = ctx.createRadialGradient(488, 868, 12, 462, 892, 92);
          handTop.addColorStop(0, '#f2d498');
          handTop.addColorStop(0.58, '#c89656');
          handTop.addColorStop(1, '#5c3e1e');
          ctx.fillStyle = handTop;
          ctx.beginPath();
          ctx.moveTo(525, 862);
          ctx.quadraticCurveTo(455, 855, 408, 892);
          ctx.quadraticCurveTo(405, 922, 438, 926);
          ctx.quadraticCurveTo(495, 912, 535, 892);
          ctx.closePath();
          ctx.fill();

          // Four delicate tapered upper-hand fingers curving downward gently
          ctx.strokeStyle = '#e8c486'; ctx.lineWidth = 9.5;
          for (let f = 0; f < 4; f++) {
            ctx.beginPath();
            ctx.moveTo(418 + f * 11, 902 + f * 5);
            ctx.quadraticCurveTo(385 + f * 10, 924 + f * 7, 368 + f * 12, 948 + f * 5);
            ctx.stroke();
          }
        });

        M.synthesize(api, scene, {
          style: 'sfumato-master',
          masterpiece: true,
          totalStrokes: 41650,
          seed: 1503,
          layers: WORKS[0].layers,
          roi: [
            { cx: 428, cy: 318, rx: 145, ry: 175, boost: 4.5 },
            { cx: 432, cy: 905, rx: 165, ry: 95, boost: 3.6 },
            { cx: 718, cy: 505, rx: 120, ry: 65, boost: 2.6 }
          ]
        });

        // 350 hair-fine aged poplar-panel craquelure network lines
        const layer6 = WORKS[0].layers[5].id;
        padToExact(api, 42000, layer6, '岁月杨木板细腻龟裂纹', () => {
          const x0 = 40 + N.rand() * (W - 80);
          const y0 = 30 + N.rand() * (H - 60);
          const segs = 3 + Math.floor(N.rand() * 4);
          let cx = x0, cy = y0;
          const pts = [cx, cy];
          for (let s = 0; s < segs; s++) {
            cx += (N.rand() - 0.5) * 26;
            cy += (N.rand() - 0.5) * 32;
            pts.push(cx, cy);
          }
          api.pushRawStroke(layer6, '岁月杨木板细腻龟裂纹', (c) => {
            c.globalAlpha = 0.12;
            c.strokeStyle = '#241c12';
            c.lineWidth = 0.65;
            c.beginPath();
            c.moveTo(pts[0], pts[1]);
            for (let k = 2; k < pts.length; k += 2) c.lineTo(pts[k], pts[k + 1]);
            c.stroke();
            c.globalAlpha = 1;
          });
        });
      }
    },

    // =========================================================================
    // 2. JOHANNES VERMEER — THE MILKMAID (DELFT LIGHT & POINTILLÉ, 38,000 STROKES)
    // =========================================================================
    {
      id: 'oil-master-milkmaid',
      title: '世界名作·维米尔《倒牛奶的女仆》',
      subtitle: '荷兰风俗画微光珠点法（Pointillé）· 38,000 笔：铅锡黄×青金石蓝纯净日光与斜窗空气微粒',
      group: '油画·世界名作',
      category: '荷兰巴洛克风俗画',
      seal: '珠点光影·3.8万笔',
      mode: 'oil',
      theme: 'gallery-dark',
      backdropColor: '#1b1914',
      width: 960,
      height: 1080,
      seed: 1658,
      maxOilStrokes: 100000,
      swatches: ['rgb(232, 224, 206)', 'rgb(228, 184, 58)', 'rgb(34, 72, 146)', 'rgb(168, 62, 46)', 'rgb(74, 86, 62)'],
      desc: '依阿姆斯特丹国立博物馆原画临摹：左侧菱形铅条高窗透出冷冽银白日光，斜映白灰泥墙、代尔夫特蓝白墙砖，女仆身着铅锡黄胸衣与青金石蓝围裙低首倾倒细腻乳流，桌上脆皮面包与提篮闪烁珍珠般高光彩点。',
      analysis: {
        original: '约翰内斯·维米尔（Johannes Vermeer） · c. 1658 · 阿姆斯特丹国立博物馆',
        movement: '十七世纪荷兰黄金时代风俗画（Dutch Golden Age）。用近乎凝固的时间静谧感赋予卑微厨房劳作以纪念碑式的神圣尊严，被誉为“光影的哲学”。',
        palette: '维米尔极为吝惜却纯度极高的古典矿物颜料清单：天然青金石蓝（Ultramarine）绘深邃围裙与桌布阴影、铅锡黄（Lead-tin Yellow）绘亮黄胸衣、威尼斯红陶土（Red Ochre）、暗褐骨灰白墙、铅白与暗琥珀。',
        technique: '“微光珠点法（Pointillé）”与光学柔焦（Camera Obscura）：高光处并非拉长笔痕，而是在略微失焦的色块上点缀无数枚细碎圆润的暖白与米金小光球，精准模拟针孔暗箱光学中面包脆皮、柳条篮与釉陶器皿的散射光晕（Halation）。',
        algorithm: '精确锁定脆皮面包向光脊顶、陶瓷壶缘、奶碗液面与墙挂柳条篮金属桶受光弧线，启用 vermeer-pointille 六层渲染 37,400 笔后，严格于物体受光边缘撒落 600 颗半透明柔光光学小珍珠（Pointillé），精准落笔 38,000 笔。'
      },
      layers: [
        { id: 1, name: '一 · 浅灰暖褐厨房粉墙与斜光构图' },
        { id: 2, name: '二 · 左窗冷银日光、代尔夫特瓷砖与暖脚炉' },
        { id: 3, name: '三 · 铅锡黄胸衣、青金石蓝围裙与绿绒桌布' },
        { id: 4, name: '四 · 双手质感、红陶奶罐与细腻倾泻奶柱' },
        { id: 5, name: '五 · 柳条面包篮、铜提桶与陶器细节刻画' },
        { id: 6, name: '六 · 维米尔光学微光珠点（Pointillé）点睛' }
      ],
      buildStrokes(api) {
        const M = window.Code2PaintOilMaster;
        const W = 960, H = 1080;
        const scene = M.createScene(W, H, 1658, { maxDim: 560 });
        const N = scene.N;

        // 1. Sunlit Dutch whitewashed plaster wall & tiled floor
        scene.draw2D((ctx) => {
          const wall = ctx.createLinearGradient(85, 80, W, 860);
          wall.addColorStop(0, '#969284');
          wall.addColorStop(0.32, '#c8c3b2');
          wall.addColorStop(0.72, '#e8e2cc');
          wall.addColorStop(1, '#d8d0ba');
          ctx.fillStyle = wall;
          ctx.fillRect(0, 0, W, 945);

          ctx.fillStyle = '#48443c';
          ctx.beginPath(); ctx.arc(625, 165, 4, 0, Math.PI * 2); ctx.fill();

          ctx.fillStyle = '#744834';
          ctx.fillRect(0, 935, W, 145);

          for (let tx = 580; tx < W; tx += 46) {
            ctx.fillStyle = '#e8e4da';
            ctx.fillRect(tx, 892, 44, 48);
            ctx.strokeStyle = '#9aa0a6'; ctx.lineWidth = 1.5; ctx.strokeRect(tx, 892, 44, 48);
            ctx.fillStyle = '#2d5898';
            ctx.beginPath(); ctx.arc(tx + 22, 916, 9, 0, Math.PI * 2); ctx.fill();
          }

          ctx.fillStyle = '#5c3c24'; ctx.fillRect(755, 922, 118, 92);
          ctx.fillStyle = '#926842'; ctx.fillRect(748, 916, 130, 16);

          ctx.fillStyle = '#3c362c';
          ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(175, 45); ctx.lineTo(175, 625); ctx.lineTo(0, 685); ctx.closePath(); ctx.fill();
          const winGlass = ctx.createLinearGradient(12, 45, 155, 585);
          winGlass.addColorStop(0, '#eef4f6'); winGlass.addColorStop(0.5, '#cbd8dc'); winGlass.addColorStop(1, '#84969e');
          ctx.fillStyle = winGlass;
          ctx.beginPath(); ctx.moveTo(14, 36); ctx.lineTo(156, 62); ctx.lineTo(156, 588); ctx.lineTo(14, 638); ctx.closePath(); ctx.fill();

          ctx.strokeStyle = '#484844'; ctx.lineWidth = 5;
          for (let y = 115; y < 560; y += 78) {
            ctx.beginPath(); ctx.moveTo(14, y + 18); ctx.lineTo(156, y); ctx.stroke();
          }
          ctx.fillStyle = '#2c2822';
          ctx.fillRect(82, 48, 12, 560);

          ctx.fillStyle = '#8c6838';
          ctx.beginPath(); ctx.ellipse(48, 152, 34, 48, 0.1, 0, Math.PI * 2); ctx.fill();
          const pail = ctx.createRadialGradient(118, 225, 4, 122, 232, 32);
          pail.addColorStop(0, '#f8e69a'); pail.addColorStop(0.5, '#a88438'); pail.addColorStop(1, '#362814');
          ctx.fillStyle = pail;
          ctx.beginPath(); ctx.ellipse(122, 238, 26, 30, 0, 0, Math.PI * 2); ctx.fill();
        });

        // 2. Monumental Milkmaid silhouette, Dutch wing-coif, sculpted face & sunlit table loaves
        scene.draw2D((ctx) => {
          const skG = ctx.createLinearGradient(420, 650, 745, 955);
          skG.addColorStop(0, '#b83828'); skG.addColorStop(0.55, '#822218'); skG.addColorStop(1, '#3c100c');
          ctx.fillStyle = skG;
          ctx.beginPath();
          ctx.moveTo(435, 655); ctx.lineTo(685, 655); ctx.lineTo(745, 955); ctx.lineTo(415, 955);
          ctx.closePath(); ctx.fill();

          const apG = ctx.createLinearGradient(418, 535, 648, 925);
          apG.addColorStop(0, '#4476ba'); apG.addColorStop(0.45, '#264b8a'); apG.addColorStop(1, '#12264e');
          ctx.fillStyle = apG;
          ctx.beginPath();
          ctx.moveTo(432, 535);
          ctx.bezierCurveTo(378, 635, 385, 815, 455, 932);
          ctx.lineTo(638, 922);
          ctx.bezierCurveTo(668, 765, 632, 605, 595, 535);
          ctx.closePath(); ctx.fill();

          // Face turned downward in gentle 3/4 view toward pouring pitcher
          const fG = ctx.createRadialGradient(468, 268, 8, 495, 280, 64);
          fG.addColorStop(0, '#fae0c6'); fG.addColorStop(0.55, '#dca47e'); fG.addColorStop(1, '#7c4e38');
          ctx.fillStyle = fG;
          ctx.beginPath(); ctx.ellipse(492, 276, 52, 68, -0.22, 0, Math.PI * 2); ctx.fill();
          // Soft downcast eyelid shadow & terracotta cheek blush
          ctx.fillStyle = 'rgba(186, 86, 68, 0.35)';
          ctx.beginPath(); ctx.arc(478, 286, 15, 0, Math.PI * 2); ctx.fill();
          ctx.strokeStyle = '#5c3828'; ctx.lineWidth = 3;
          ctx.beginPath(); ctx.arc(466, 268, 9, 0.1, Math.PI - 0.1); ctx.stroke();
          ctx.fillStyle = '#6e422c';
          ctx.beginPath(); ctx.ellipse(455, 250, 14, 24, 0.25, 0, Math.PI * 2); ctx.fill();

          const coifG = ctx.createLinearGradient(435, 162, 595, 345);
          coifG.addColorStop(0, '#fcfaf2'); coifG.addColorStop(0.6, '#d8d4c8'); coifG.addColorStop(1, '#8c8a82');
          ctx.fillStyle = coifG;
          ctx.beginPath();
          ctx.moveTo(458, 252);
          ctx.bezierCurveTo(455, 165, 568, 158, 608, 232);
          ctx.bezierCurveTo(635, 295, 595, 348, 522, 338);
          ctx.closePath(); ctx.fill();

          const bod = ctx.createLinearGradient(420, 325, 625, 565);
          bod.addColorStop(0, '#f6d658'); bod.addColorStop(0.55, '#d4a62a'); bod.addColorStop(1, '#684a12');
          ctx.fillStyle = bod;
          ctx.beginPath();
          ctx.moveTo(435, 348);
          ctx.bezierCurveTo(395, 405, 398, 495, 432, 545);
          ctx.lineTo(618, 545);
          ctx.bezierCurveTo(652, 475, 622, 365, 555, 338);
          ctx.closePath(); ctx.fill();

          ctx.fillStyle = '#f2ede0';
          ctx.beginPath(); ctx.moveTo(445, 342); ctx.lineTo(525, 335); ctx.lineTo(482, 412); ctx.closePath(); ctx.fill();

          ctx.strokeStyle = '#ce8466'; ctx.lineWidth = 36; ctx.lineCap = 'round';
          ctx.beginPath(); ctx.moveTo(435, 452); ctx.lineTo(395, 522); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(592, 442); ctx.lineTo(435, 535); ctx.stroke();

          ctx.fillStyle = '#243c2c';
          ctx.beginPath(); ctx.moveTo(0, 665); ctx.lineTo(425, 685); ctx.lineTo(465, 1080); ctx.lineTo(0, 1080); ctx.closePath(); ctx.fill();
          ctx.fillStyle = '#182a3e';
          ctx.fillRect(0, 885, 445, 195);

          // Glazed red earthenware tilted milk pitcher with handle
          ctx.save(); ctx.translate(362, 528); ctx.rotate(-0.62);
          ctx.strokeStyle = '#8c3a1c'; ctx.lineWidth = 10;
          ctx.beginPath(); ctx.arc(46, 0, 22, -Math.PI * 0.5, Math.PI * 0.5); ctx.stroke();
          const pitG = ctx.createRadialGradient(-12, -16, 6, 0, 0, 56);
          pitG.addColorStop(0, '#dc6e40'); pitG.addColorStop(0.55, '#9e3e1e'); pitG.addColorStop(1, '#4c1a0c');
          ctx.fillStyle = pitG;
          ctx.beginPath(); ctx.ellipse(0, 0, 52, 62, 0, 0, Math.PI * 2); ctx.fill();
          ctx.restore();

          // Blue stoneware tankard with pewter lid
          ctx.fillStyle = '#3a5478'; ctx.fillRect(98, 565, 64, 118);
          ctx.fillStyle = '#a8aeb4';
          ctx.beginPath(); ctx.ellipse(130, 562, 34, 14, 0, 0, Math.PI * 2); ctx.fill();

          const bowl = ctx.createRadialGradient(288, 725, 14, 305, 745, 82);
          bowl.addColorStop(0, '#c87242'); bowl.addColorStop(0.55, '#7c381c'); bowl.addColorStop(1, '#30140a');
          ctx.fillStyle = bowl;
          ctx.beginPath(); ctx.ellipse(305, 755, 72, 52, 0, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = '#ece6d4';
          ctx.beginPath(); ctx.ellipse(305, 728, 60, 16, 0, 0, Math.PI * 2); ctx.fill();

          ctx.strokeStyle = '#fcfaf2'; ctx.lineWidth = 7;
          ctx.beginPath(); ctx.moveTo(318, 562); ctx.lineTo(304, 728); ctx.stroke();

          ctx.fillStyle = '#b8823c';
          ctx.beginPath(); ctx.ellipse(185, 808, 92, 46, -0.15, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = '#d4a448';
          for (const [bx, by, r] of [[78, 728, 36], [135, 702, 32], [202, 695, 34], [242, 745, 28]]) {
            ctx.beginPath(); ctx.ellipse(bx, by, r, r * 0.72, 0.2, 0, Math.PI * 2); ctx.fill();
          }
        });

        M.synthesize(api, scene, {
          style: 'vermeer-pointille',
          masterpiece: true,
          totalStrokes: 37400,
          seed: 1658,
          layers: WORKS[1].layers,
          roi: [
            { cx: 515, cy: 365, rx: 165, ry: 215, boost: 3.6 },
            { cx: 315, cy: 655, rx: 165, ry: 175, boost: 4.2 },
            { cx: 185, cy: 765, rx: 145, ry: 95, boost: 3.0 }
          ]
        });

        // 600 strictly localized elliptical Vermeer Pointillé pearls on sunlit object crests ONLY (zero air dots!)
        const layer6 = WORKS[1].layers[5].id;
        const pointilleLoci = [
          { cx: 185, cy: 790, rx: 72, ry: 20 },  // large bread loaf upper crest
          { cx: 78, cy: 722, rx: 28, ry: 16 },   // roll 1 upper crust
          { cx: 135, cy: 696, rx: 25, ry: 14 },  // roll 2
          { cx: 202, cy: 690, rx: 26, ry: 15 },  // roll 3
          { cx: 242, cy: 740, rx: 22, ry: 12 },  // roll 4
          { cx: 124, cy: 564, rx: 22, ry: 12 },  // stoneware pewter rim & tankard shoulder
          { cx: 120, cy: 230, rx: 20, ry: 22 },  // hanging brass pail specular pearls
          { cx: 48, cy: 148, rx: 26, ry: 34 },   // wicker basket upper weave
          { cx: 305, cy: 726, rx: 46, ry: 9 }    // milk bowl frothy rim
        ];
        padToExact(api, 38000, layer6, '维米尔微光珠点（Pointillé）', (i) => {
          const locus = pointilleLoci[i % pointilleLoci.length];
          const ang = N.rand() * Math.PI * 2;
          const dist = Math.sqrt(N.rand());
          const px = locus.cx + Math.cos(ang) * dist * locus.rx;
          const py = locus.cy + Math.sin(ang) * dist * locus.ry;
          const r = 1.1 + N.rand() * 1.5;
          const cols = ['#fffdf4', '#faeaac', '#fff4cc'];
          const col = cols[i % cols.length];
          api.pushRawStroke(layer6, '维米尔微光珠点（Pointillé）', (c) => {
            c.globalAlpha = 0.55 + N.rand() * 0.35;
            c.fillStyle = col;
            c.beginPath();
            c.arc(px, py, r, 0, Math.PI * 2);
            c.fill();
            c.globalAlpha = 1;
          });
        });
      }
    },

    // =========================================================================
    // 3. REMBRANDT CIRCLE — MAN WITH THE GOLDEN HELMET (TENEBRISM + IMPASTO, 40,000)
    // =========================================================================
    {
      id: 'oil-master-golden-helmet',
      title: '世界名作·伦勃朗派《戴金盔的男子》',
      subtitle: '巴洛克厚涂堆彩与暗调明暗对照（Tenebrism）· 40,000 笔：极暗透明暗部 vs 高浮雕金盔花纹',
      group: '油画·世界名作',
      category: '巴洛克肖像',
      seal: '巴洛克厚涂·4万笔',
      mode: 'oil',
      theme: 'gallery-dark',
      backdropColor: '#0e0a08',
      width: 880,
      height: 1140,
      seed: 1650,
      maxOilStrokes: 100000,
      swatches: ['rgb(18, 12, 9)', 'rgb(248, 206, 84)', 'rgb(184, 118, 34)', 'rgb(168, 92, 62)', 'rgb(112, 36, 26)'],
      desc: '依柏林画廊馆藏经典临摹：背景沉入深邃丝绒焦褐暗黑中，老兵阴翳低垂的面庞埋入头盔檐影里，唯独高耸精雕的巴洛克黄金莫里昂头盔与护颊在斜上方聚光下如浮雕金属般灼灼发光。',
      analysis: {
        original: '伦勃朗·范·莱因画派（Rembrandt Circle） · c. 1650 · 柏林画廊（Gemäldegalerie）',
        movement: '荷兰巴洛克戏剧性肖像艺术代表作。一反将亮度全部集中于人物双眼的传统肖像规则，刻意让老兵幽暗垂眸笼罩在盔檐深影内，把极致光彩让位于历经沧桑的黄金战盔。',
        palette: '极端巴洛克“明暗对照（Chiaroscuro / Tenebrism）”色阶：大面积低明度生褐（Raw Umber）、骨黑（Ivory Black）与阿斯法尔特沥青暗调；局部威尼斯红棕胸甲；以及高度饱和的铅锡黄、黄赭（Yellow Ochre）与锡铅暖白构筑熔金高光。',
        technique: '传奇的“厚薄对比（Fat-over-lean Relief Contrast）”：暗部背景与脸颊阴影采用薄而平滑、绝不显露笔痕的透明褐色；而头盔上的繁复浮雕卷草花纹则直接用硬猪鬃画笔与调色刀堆砌出数毫米厚的立体油彩脊（Impasto），形成宛如真实锤揲黄金的反光浮雕感。',
        algorithm: '使用 rembrandt-impasto 亮度自适应引擎：当采样亮度 < 52 时剥除浮雕斜坡并降低透明度（还原幽深暗影）；当亮度 >= 95 时自动强化 bevel = 1.55 凸起高光脊（39,200 笔），再严格限定于黄金战盔与护颊椭圆曲面上追加 800 笔锻金浮雕楞纹与暗槽，精准 40,000 笔。'
      },
      layers: [
        { id: 1, name: '一 · 焦褐沥青深沉十度暗调（Tenebrism）打底' },
        { id: 2, name: '二 · 沧桑老兵头部体积与盔檐投落深影' },
        { id: 3, name: '三 · 朱红斗篷、青铜喉甲与金盔基本金属球体' },
        { id: 4, name: '四 · 面颊风霜肌理、苍白短须与护耳光影' },
        { id: 5, name: '五 · 巴洛克黄金莫里昂头盔浮雕卷草花纹堆砌' },
        { id: 6, name: '六 · 铅锡黄炽亮熔金点睛与雕花深缝压黑' }
      ],
      buildStrokes(api) {
        const M = window.Code2PaintOilMaster;
        const W = 880, H = 1140;
        const scene = M.createScene(W, H, 1650, { maxDim: 560 });
        const N = scene.N;

        // 1. Deep bituminous umber-black void
        scene.draw2D((ctx) => {
          const bg = ctx.createRadialGradient(440, 480, 40, 440, 560, 680);
          bg.addColorStop(0, '#2a1c12');
          bg.addColorStop(0.55, '#150d08');
          bg.addColorStop(1, '#0b0705');
          ctx.fillStyle = bg;
          ctx.fillRect(0, 0, W, H);
        });

        // 2. Veteran portrait WITHOUT boxy beard block — draw anatomical short stubble & moustache smoothly in draw2D
        scene.shadePortrait3D({
          cx: 455, cy: 595, headW: 126, headH: 158,
          yaw: -0.15, lightDir: [-0.68, -0.35, 0.64],
          palette: 'rembrandt', bald: true,
          skinLit: [218, 152, 102], skinMid: [148, 86, 54], skinShadow: [36, 20, 14],
          hairCol: [144, 134, 118],
          dressCol: [96, 32, 22],
          lipCol: [134, 68, 54],
          hasCollar: false
        });

        // 3. Veteran close-cropped grizzled jaw/chin beard & monumental sculpted Morion Helmet
        scene.draw2D((ctx) => {
          // Soft weathered drooping salt-and-pepper mustache & short rounded chin beard hugging jaw naturally
          const chG = ctx.createLinearGradient(395, 645, 515, 765);
          chG.addColorStop(0, '#a89e8c');
          chG.addColorStop(0.6, '#645c50');
          chG.addColorStop(1, '#2a221c');
          ctx.fillStyle = chG;
          ctx.beginPath();
          ctx.moveTo(395, 675);
          ctx.quadraticCurveTo(455, 775, 515, 672);
          ctx.quadraticCurveTo(455, 702, 395, 675);
          ctx.closePath();
          ctx.fill();

          ctx.strokeStyle = '#b4aa98'; ctx.lineWidth = 10; ctx.lineCap = 'round';
          ctx.beginPath(); ctx.moveTo(455, 650); ctx.quadraticCurveTo(422, 654, 405, 672); ctx.stroke();
          ctx.strokeStyle = '#787064'; ctx.lineWidth = 9;
          ctx.beginPath(); ctx.moveTo(455, 650); ctx.quadraticCurveTo(486, 656, 502, 674); ctx.stroke();

          // Deep helmet visor shadow falling darkly over upper forehead & downcast eyes
          const brimShadow = ctx.createLinearGradient(320, 465, 580, 585);
          brimShadow.addColorStop(0, 'rgba(20, 11, 7, 0.92)');
          brimShadow.addColorStop(0.7, 'rgba(28, 15, 10, 0.55)');
          brimShadow.addColorStop(1, 'rgba(30, 16, 10, 0)');
          ctx.fillStyle = brimShadow;
          ctx.beginPath();
          ctx.ellipse(455, 520, 148, 70, -0.05, 0, Math.PI * 2);
          ctx.fill();

          // Crimson rear plume silhouette right side
          ctx.fillStyle = '#5c1816';
          ctx.beginPath(); ctx.ellipse(618, 285, 86, 135, 0.48, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = '#8e2a20';
          ctx.beginPath(); ctx.ellipse(602, 265, 54, 96, 0.42, 0, Math.PI * 2); ctx.fill();

          // Glowing sculpted bronze-gold helmet crown & central comb crest
          const helmDome = ctx.createRadialGradient(382, 285, 22, 465, 345, 210);
          helmDome.addColorStop(0, '#fff29c');
          helmDome.addColorStop(0.28, '#e6a834');
          helmDome.addColorStop(0.65, '#8c5418');
          helmDome.addColorStop(1, '#281608');
          ctx.fillStyle = helmDome;
          ctx.beginPath();
          ctx.ellipse(445, 320, 168, 178, 0, Math.PI * 0.94, Math.PI * 2.06);
          ctx.quadraticCurveTo(445, 480, 278, 435);
          ctx.closePath();
          ctx.fill();

          // Sweeping upturned Morion helmet brim left-to-right
          const brim = ctx.createLinearGradient(205, 455, 675, 455);
          brim.addColorStop(0, '#4a2a0e'); brim.addColorStop(0.32, '#f6c852'); brim.addColorStop(0.65, '#ba7622'); brim.addColorStop(1, '#2a1608');
          ctx.fillStyle = brim;
          ctx.beginPath();
          ctx.moveTo(195, 425);
          ctx.bezierCurveTo(315, 475, 545, 482, 682, 412);
          ctx.bezierCurveTo(568, 528, 305, 526, 195, 425);
          ctx.closePath();
          ctx.fill();

          // Hinged carved gold cheek/ear-piece (left side facing viewer)
          const earG = ctx.createRadialGradient(340, 585, 10, 355, 610, 96);
          earG.addColorStop(0, '#fae07c'); earG.addColorStop(0.5, '#b67422'); earG.addColorStop(1, '#361e0a');
          ctx.fillStyle = earG;
          ctx.beginPath();
          ctx.ellipse(342, 608, 44, 102, 0.08, 0, Math.PI * 2);
          ctx.fill();

          // Gleaming dark bronze chest gorget & crimson cloak folds
          const gorg = ctx.createLinearGradient(305, 785, 595, 915);
          gorg.addColorStop(0, '#c2903c'); gorg.addColorStop(0.45, '#58381c'); gorg.addColorStop(1, '#1c120a');
          ctx.fillStyle = gorg;
          ctx.beginPath();
          ctx.moveTo(268, 795); ctx.quadraticCurveTo(455, 965, 645, 795); ctx.quadraticCurveTo(455, 865, 268, 795);
          ctx.closePath(); ctx.fill();
        });

        M.synthesize(api, scene, {
          style: 'rembrandt-impasto',
          masterpiece: true,
          totalStrokes: 39200,
          seed: 1650,
          layers: WORKS[2].layers,
          roi: [
            { cx: 445, cy: 335, rx: 185, ry: 205, boost: 4.5 },
            { cx: 455, cy: 595, rx: 145, ry: 155, boost: 3.6 }
          ]
        });

        // 800 strictly masked Baroque gold fluting & embossed scroll highlights strictly INSIDE helmet dome + cheek-guard
        const layer5 = WORKS[2].layers[4].id;
        const layer6 = WORKS[2].layers[5].id;
        padToExact(api, 40000, layer6, '巴洛克锤揲金盔浮雕楞纹与熔金高光', (i) => {
          // Sample strictly inside elliptical helmet dome ((x-445)/148)^2 + ((y-318)/152)^2 < 0.85 OR cheek-guard OR brim
          const mode = i % 5;
          let x, y, ang;
          if (mode === 0) {
            // Ear-cheek piece
            const a = N.rand() * Math.PI * 2, d = Math.sqrt(N.rand()) * 0.78;
            x = 342 + Math.cos(a) * d * 36;
            y = 608 + Math.sin(a) * d * 88;
            ang = 0.25;
          } else if (mode === 1) {
            // Sweeping Morion brim highlight curve
            const t = (N.rand() - 0.5) * 1.75;
            x = 440 + t * 210;
            y = 468 - (1 - Math.abs(t)) * 8 + (N.rand() - 0.5) * 12;
            ang = t * 0.15;
          } else {
            // Inside Morion dome: follow curved sculptural ribs radiating toward crown (420, 165)
            const a = Math.PI + N.rand() * Math.PI;
            const d = 0.15 + Math.sqrt(N.rand()) * 0.72;
            x = 445 + Math.cos(a) * d * 142;
            y = 425 + Math.sin(a) * d * 245;
            ang = Math.atan2(y - 380, x - 445) + Math.PI * 0.5;
          }
          const isCrevice = i % 4 === 0;
          const isLit = x < 485 && !isCrevice;
          const targetLayer = isCrevice ? layer5 : layer6;
          api.pushRawStroke(targetLayer, isCrevice ? '金盔氧化暗槽雕纹' : '浮雕黄金高光楞脊', (c) => {
            c.strokeStyle = isCrevice ? '#3b2108' : (isLit ? (i % 2 === 0 ? '#fff5ad' : '#f2be44') : '#965d18');
            c.lineWidth = isCrevice ? 1.3 : 1.6 + N.rand() * 1.8;
            c.lineCap = 'round';
            c.globalAlpha = isCrevice ? 0.58 : (isLit ? 0.85 : 0.65);
            c.beginPath();
            c.moveTo(x, y);
            c.quadraticCurveTo(x + Math.cos(ang) * 7, y + Math.sin(ang) * 7, x + Math.cos(ang + 0.35) * 14, y + Math.sin(ang + 0.35) * 14);
            c.stroke();
            c.globalAlpha = 1;
          });
        });
      }
    },

    // =========================================================================
    // 4. J.M.W. TURNER — THE FIGHTING TEMERAIRE (ATMOSPHERIC SCUMBLING, 36,000)
    // =========================================================================
    {
      id: 'oil-master-temeraire',
      title: '世界名作·特纳《被拖去解体的战舰无畏号》',
      subtitle: '浪漫主义大气擦涂与熔金晚霞（Turner Atmospheric Glazing）· 36,000 笔',
      group: '油画·世界名作',
      category: '浪漫主义海景',
      seal: '大气熔霞·3.6万笔',
      mode: 'oil',
      theme: 'gallery-dark',
      backdropColor: '#1e1918',
      width: 1160,
      height: 860,
      seed: 1839,
      maxOilStrokes: 100000,
      swatches: ['rgb(84, 124, 168)', 'rgb(248, 178, 62)', 'rgb(228, 72, 34)', 'rgb(236, 224, 198)', 'rgb(42, 30, 24)'],
      desc: '依伦敦国家美术馆原画临摹：左侧幽蓝暮色银月与珍珠白象牙幽灵战舰静穆伫立，黑色蒸汽拖轮喷出斜向焦烟，右侧炽烈铬黄朱红夕阳把整片泰晤士河面点燃成工业时代挽歌。',
      analysis: {
        original: '约瑟夫·马洛德·威廉·特纳（J.M.W. Turner） · 1839 · 伦敦国家美术馆',
        movement: '十九世纪英国浪漫主义（Romanticism）与印象派先声。借特拉法加海战英雄风帆战列舰被现代化黑色蒸汽拖轮牵引拆解的历史瞬间，书写旧航海时代终结的壮美哀诗。',
        palette: '极端冷暖对决与新晋现代合成颜料：刚问世不久的高纯度铬黄（Chrome Yellow）、朱红（Vermilion）与猩红茜素铺展右侧火焰暮空；群青（French Ultramarine）、钴蓝（Cobalt）与铅白调出左侧透明幻影战舰与寒月冷波。',
        technique: '“干笔擦涂（Scumbling）+ 调色刀熔金厚涂”：先在天穹反复半干擦涂制造如蒸汽漫溢云层，再用调色刀直接堆砌出太阳核心的亮黄橘红厚彩脊（仅在暖光亮部堆叠）；幽灵战舰本身则以极其飘逸微弱的半透明象牙白与细线索具隐现于蒸汽之中。',
        algorithm: '使用 turner-atmospheric 大气混合引擎：仅在红橘像素色差（r0 - b0 > 55）处激发 1.25 浮雕厚涂，在左侧冷蓝烟雾里全自动柔化透明度（35,550 笔），再追加 450 笔 0.75px 幽灵帆桁索具、烟道余烬与太阳熔金横波，共 36,000 笔。'
      },
      layers: [
        { id: 1, name: '一 · 暖铅白与钴蓝暮空大气渐层' },
        { id: 2, name: '二 · 扇形烈焰落霞与银月泰晤士冷暖水面' },
        { id: 3, name: '三 · 珍珠象牙白无畏号幽灵风帆战舰主体' },
        { id: 4, name: '四 · 漆黑蒸汽拖轮、翻滚黑烟与河面波纹' },
        { id: 5, name: '五 · 战舰纤细桅杆横桁与水面烈焰倒影' },
        { id: 6, name: '六 · 特纳太阳核心熔金刀痕与细微索具收笔' }
      ],
      buildStrokes(api) {
        const M = window.Code2PaintOilMaster;
        const W = 1160, H = 860, H_Y = 612;
        const scene = M.createScene(W, H, 1839, { maxDim: 560 });
        const N = scene.N;

        scene.draw2D((ctx) => {
          const sky = ctx.createLinearGradient(0, 0, W, H_Y);
          sky.addColorStop(0, '#466a98');
          sky.addColorStop(0.35, '#86a2bc');
          sky.addColorStop(0.68, '#e8a878');
          sky.addColorStop(1, '#f48436');
          ctx.fillStyle = sky;
          ctx.fillRect(0, 0, W, H_Y);

          const blaze = ctx.createRadialGradient(935, 578, 12, 865, 515, 520);
          blaze.addColorStop(0, '#fff8d4');
          blaze.addColorStop(0.18, '#ffd248');
          blaze.addColorStop(0.45, '#e85828');
          blaze.addColorStop(0.75, 'rgba(148, 62, 74, 0.55)');
          blaze.addColorStop(1, 'rgba(72, 94, 134, 0)');
          ctx.fillStyle = blaze;
          ctx.fillRect(280, 120, W - 280, H_Y - 120);

          ctx.fillStyle = '#faf6dc';
          ctx.beginPath(); ctx.arc(105, 138, 13, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = '#5c7da4';
          ctx.beginPath(); ctx.arc(112, 132, 11, 0, Math.PI * 2); ctx.fill();
        });

        scene.shadeOcean({
          yTop: H_Y, yBot: H,
          seaTop: [124, 142, 162], seaMid: [76, 98, 128], seaBot: [42, 54, 78],
          sunX: 935, glitterCol: [255, 224, 108], glitterSpread: 380, glitterStrength: 0.96, waveScale: 0.018
        });

        scene.draw2D((ctx) => {
          ctx.fillStyle = 'rgba(232, 238, 240, 0.25)';
          for (let r = 0; r < 9; r++) ctx.fillRect(90 + (N.rand() - 0.5) * 12, H_Y + 14 + r * 20, 32 - r * 1.5, 6);

          // HMS Temeraire pale ivory 3-masted warship + soft broken water ripples below hull
          const sx = 285, sy = 595;
          for (let r = 0; r < 10; r++) {
            ctx.fillStyle = `rgba(226, 212, 188, ${(0.28 - r * 0.022).toFixed(2)})`;
            ctx.fillRect(sx - 78 + (N.rand() - 0.5) * 14, sy + 22 + r * 11, 148, 5);
          }

          const hullG = ctx.createLinearGradient(sx - 95, sy - 42, sx + 95, sy + 18);
          hullG.addColorStop(0, '#f4ebd4'); hullG.addColorStop(0.6, '#d6c29e'); hullG.addColorStop(1, '#8c7656');
          ctx.fillStyle = hullG;
          ctx.beginPath();
          ctx.moveTo(sx - 95, sy - 38); ctx.lineTo(sx + 88, sy - 34);
          ctx.lineTo(sx + 72, sy + 16); ctx.lineTo(sx - 78, sy + 18);
          ctx.closePath(); ctx.fill();
          ctx.fillStyle = '#483a2c';
          ctx.fillRect(sx - 76, sy - 22, 148, 12);

          ctx.strokeStyle = '#efe2c2';
          ctx.lineWidth = 6;
          for (const [mx, mh] of [[sx - 48, 265], [sx + 8, 305], [sx + 58, 235]]) {
            ctx.beginPath(); ctx.moveTo(mx, sy - 32); ctx.lineTo(mx, sy - mh); ctx.stroke();
            for (const frac of [0.38, 0.65, 0.86]) {
              const yw = (1 - frac * 0.45) * 48;
              ctx.lineWidth = 3.5;
              ctx.beginPath(); ctx.moveTo(mx - yw, sy - mh * frac); ctx.lineTo(mx + yw, sy - mh * frac); ctx.stroke();
            }
          }

          const tx = 478, ty = 626;
          ctx.fillStyle = 'rgba(38, 26, 22, 0.65)';
          ctx.beginPath(); ctx.ellipse(tx, ty + 28, 86, 16, 0, 0, Math.PI * 2); ctx.fill();

          for (let s = 0; s < 16; s++) {
            const px = tx + 14 - s * 22;
            const py = ty - 95 - s * 16;
            ctx.fillStyle = `rgba(38, 28, 24, ${(0.55 - s * 0.025).toFixed(2)})`;
            ctx.beginPath(); ctx.arc(px, py, 22 + s * 3.5, 0, Math.PI * 2); ctx.fill();
          }

          ctx.fillStyle = '#181412';
          ctx.beginPath();
          ctx.moveTo(tx - 66, ty - 14); ctx.lineTo(tx + 72, ty - 12);
          ctx.lineTo(tx + 56, ty + 16); ctx.lineTo(tx - 54, ty + 16);
          ctx.closePath(); ctx.fill();
          ctx.fillRect(tx + 4, ty - 98, 15, 86);
          ctx.fillStyle = '#ff9836';
          ctx.fillRect(tx + 22, ty - 8, 12, 12);

          ctx.fillStyle = 'rgba(248, 244, 232, 0.78)';
          ctx.beginPath(); ctx.ellipse(tx - 65, ty + 14, 48, 10, 0, 0, Math.PI * 2); ctx.fill();

          const sunG = ctx.createRadialGradient(935, 578, 6, 935, 578, 72);
          sunG.addColorStop(0, '#fffef4'); sunG.addColorStop(0.45, '#ffdf5c'); sunG.addColorStop(1, 'rgba(236, 92, 34, 0)');
          ctx.fillStyle = sunG;
          ctx.beginPath(); ctx.arc(935, 578, 72, 0, Math.PI * 2); ctx.fill();
        });

        M.synthesize(api, scene, {
          style: 'turner-atmospheric',
          masterpiece: true,
          totalStrokes: 35550,
          seed: 1839,
          layers: WORKS[3].layers,
          roi: [
            { cx: 285, cy: 465, rx: 145, ry: 215, boost: 3.4 },
            { cx: 478, cy: 615, rx: 115, ry: 75, boost: 3.4 },
            { cx: 935, cy: 595, rx: 165, ry: 125, boost: 3.2 }
          ]
        });

        // 450 fine ghostly rigging stays, mast spars & liquid solar water-glints (clean water reflections, no air clutter!)
        const layer5 = WORKS[3].layers[4].id;
        const layer6 = WORKS[3].layers[5].id;
        const sx = 285, sy = 595;
        const mastXs = [sx - 48, sx + 8, sx + 58];
        for (let m = 0; m < mastXs.length; m++) {
          const mx = mastXs[m], mh = [265, 305, 235][m];
          for (let s = 0; s < 14; s++) {
            const xEnd = mx + (s - 7) * 9.5;
            api.pushRawStroke(layer5, '战舰纤细索具牵绳', (c) => {
              c.globalAlpha = 0.58;
              c.strokeStyle = '#efe4c8';
              c.lineWidth = 0.85;
              c.beginPath();
              c.moveTo(mx, sy - mh * (0.4 + (s % 3) * 0.25));
              c.lineTo(xEnd, sy - 30);
              c.stroke();
              c.globalAlpha = 1;
            });
          }
        }
        padToExact(api, 36000, layer6, '熔金太阳刀痕与泰晤士水波金光', (i) => {
          const inWater = i % 4 !== 0;
          const x = inWater ? 765 + N.rand() * 345 : 885 + (N.rand() - 0.5) * 95;
          const y = inWater ? H_Y + 12 + N.rand() * (H - H_Y - 22) : 548 + (N.rand() - 0.5) * 65;
          const span = 14 + N.rand() * 32;
          api.pushRawStroke(layer6, '熔金太阳刀痕与泰晤士水波金光', (c) => {
            c.strokeStyle = i % 2 === 0 ? '#fff6ba' : '#ffaa3e';
            c.lineWidth = 1.6 + N.rand() * 1.4;
            c.lineCap = 'round';
            c.globalAlpha = 0.82;
            c.beginPath();
            c.moveTo(x - span * 0.5, y);
            c.lineTo(x + span * 0.5, y + (N.rand() - 0.5) * 1.5);
            c.stroke();
            c.globalAlpha = 1;
          });
        });
      }
    },

    // =========================================================================
    // 5. CLAUDE MONET — IMPRESSION, SUNRISE (BROKEN ALLA PRIMA, 32,000 STROKES)
    // =========================================================================
    {
      id: 'oil-master-impression-sunrise',
      title: '世界名作·莫奈《日出·印象》',
      subtitle: '印象派直接画法（Alla Prima）与等亮度日轮 · 32,000 笔：勒阿弗尔晨雾、水波横向橘影与三叶小舟',
      group: '油画·世界名作',
      category: '印象派诞生作',
      seal: '印象派·3.2万笔',
      mode: 'oil',
      theme: 'gallery-dark',
      backdropColor: '#252c36',
      width: 1120,
      height: 860,
      seed: 1872,
      maxOilStrokes: 100000,
      swatches: ['rgb(138, 152, 168)', 'rgb(218, 154, 126)', 'rgb(248, 108, 34)', 'rgb(74, 98, 114)', 'rgb(28, 36, 46)'],
      desc: '依巴黎玛摩丹美术馆“印象派”得名名作临摹：青灰与橘粉薄雾笼罩勒阿弗尔港湾，远岸吊车烟囱与桅杆若隐若现，亮橙太阳如火焰跃然雾海之上，水波由横涂橘红碎片与左前对角三叶暗色划桨小舟奏响。',
      analysis: {
        original: '克劳德·莫奈（Claude Monet） · 1872 · 巴黎玛摩丹莫奈美术馆',
        movement: '十九世纪法国印象派（Impressionism）开山宣言。1874 年首展时因评论家嘲讽此作标题“不过是个印象”，反而正式诞生了“印象派”之名。',
        palette: '湿画法直接混彩（Alla Prima）：天空与水面以冷蓝灰、淡粉紫与青绿灰维持大面积接近同等的明度（Equiluminance），仅在孤悬空中的圆日与纵列倒影注入高纯度镉橙（Cadmium Orange）与朱红，在灰度背景中制造奇异的光学震颤。',
        technique: '“碎笔并置与横向笔触节奏”：毫无古典打底罩染步骤，趁油彩未干一气呵成。远方港口塔吊与船桅采用几近散失的稀薄青灰掠笔；而前景水面全以粗犷快速的水平横刷短笔铺就，太阳倒影化作一层层跳跃的橙色色块直刺前岸。',
        algorithm: '启动 monet-broken 专属方向流引擎：将画幅下半部水面平滑区域方向张量强制融合 70% 水平方向波纹，配合 ±18 冷暖高频色素抖动（31,650 笔），再手动补足 350 笔莫奈式亮橙横扫太阳水柱、三叶纵深暗蓝小舟及迷雾塔吊，精准 32,000 笔。'
      },
      layers: [
        { id: 1, name: '一 · 冷蓝紫灰海港晨雾通幅湿铺' },
        { id: 2, name: '二 · 杏粉橘曦天光与港湾水位定界' },
        { id: 3, name: '三 · 迷雾深处港口起重机、烟囱与远帆剪影' },
        { id: 4, name: '四 · 等亮度镉橙红日与水面横向冷暖短刷' },
        { id: 5, name: '五 · 前景深靛小舟与立桨渔夫剪影' },
        { id: 6, name: '六 · 莫奈标志性碎金跳跃橘影横笔收尾' }
      ],
      buildStrokes(api) {
        const M = window.Code2PaintOilMaster;
        const W = 1120, H = 860, H_Y = 445;
        const scene = M.createScene(W, H, 1872, { maxDim: 560 });
        const N = scene.N;

        scene.draw2D((ctx) => {
          const sky = ctx.createLinearGradient(0, 0, 0, H_Y);
          sky.addColorStop(0, '#788ea2'); sky.addColorStop(0.45, '#a8b2ba'); sky.addColorStop(0.75, '#d6afa0'); sky.addColorStop(1, '#c89e8c');
          ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H_Y);

          const haze = ctx.createRadialGradient(738, 316, 12, 738, 326, 260);
          haze.addColorStop(0, 'rgba(248, 128, 62, 0.72)');
          haze.addColorStop(0.45, 'rgba(222, 152, 118, 0.42)');
          haze.addColorStop(1, 'rgba(154, 168, 178, 0)');
          ctx.fillStyle = haze; ctx.fillRect(420, 40, 660, H_Y - 40);

          const sea = ctx.createLinearGradient(0, H_Y, 0, H);
          sea.addColorStop(0, '#8ea2ae'); sea.addColorStop(0.35, '#688698'); sea.addColorStop(0.72, '#4a6a7c'); sea.addColorStop(1, '#344c5e');
          ctx.fillStyle = sea; ctx.fillRect(0, H_Y, W, H - H_Y);

          ctx.strokeStyle = 'rgba(72, 92, 108, 0.62)';
          ctx.fillStyle = 'rgba(72, 92, 108, 0.52)';
          ctx.fillRect(0, H_Y - 12, 345, 16);
          ctx.fillRect(780, H_Y - 8, 340, 14);
          for (const [mx, mh] of [[112, 155], [168, 185], [225, 145], [295, 165], [342, 118]]) {
            ctx.lineWidth = 4;
            ctx.beginPath(); ctx.moveTo(mx, H_Y); ctx.lineTo(mx, H_Y - mh); ctx.stroke();
            ctx.lineWidth = 2.5;
            ctx.beginPath(); ctx.moveTo(mx - 24, H_Y - mh * 0.7); ctx.lineTo(mx + 24, H_Y - mh * 0.7); ctx.stroke();
          }
          for (const [sx, sh] of [[842, 85], [898, 95], [965, 76], [1025, 88]]) {
            ctx.fillRect(sx, H_Y - sh, 12, sh);
            ctx.fillStyle = 'rgba(148, 156, 164, 0.35)';
            ctx.beginPath(); ctx.ellipse(sx - 28, H_Y - sh - 12, 48, 14, -0.1, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = 'rgba(72, 92, 108, 0.52)';
          }

          ctx.fillStyle = '#f2621e'; ctx.beginPath(); ctx.arc(738, 316, 30, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = '#ff8636'; ctx.beginPath(); ctx.arc(735, 313, 18, 0, Math.PI * 2); ctx.fill();

          for (let k = 0; k < 22; k++) {
            const ry = H_Y + 18 + k * 17;
            const rw = 68 - k * 1.1 + (N.rand() - 0.5) * 28;
            const rx = 738 - rw * 0.5 + (N.rand() - 0.5) * 18;
            ctx.fillStyle = k < 12 ? '#f47228' : '#d65222';
            ctx.fillRect(rx, ry, rw, 8);
          }

          const boats = [
            { bx: 505, by: 678, sc: 1.05, col: '#1c242e' },
            { bx: 358, by: 585, sc: 0.68, col: '#34424e' },
            { bx: 245, by: 525, sc: 0.44, col: '#52626e' }
          ];
          boats.forEach(({ bx, by, sc, col }) => {
            ctx.fillStyle = col;
            ctx.beginPath();
            ctx.moveTo(bx - 76 * sc, by); ctx.quadraticCurveTo(bx, by + 22 * sc, bx + 78 * sc, by - 4 * sc);
            ctx.lineTo(bx + 62 * sc, by + 18 * sc); ctx.quadraticCurveTo(bx, by + 32 * sc, bx - 64 * sc, by + 16 * sc);
            ctx.closePath(); ctx.fill();
            ctx.fillRect(bx - 6 * sc, by - 48 * sc, 12 * sc, 52 * sc);
            ctx.beginPath(); ctx.arc(bx, by - 55 * sc, 7 * sc, 0, Math.PI * 2); ctx.fill();
            ctx.strokeStyle = col; ctx.lineWidth = 4 * sc;
            ctx.beginPath(); ctx.moveTo(bx - 8 * sc, by - 28 * sc); ctx.lineTo(bx - 42 * sc, by + 28 * sc); ctx.stroke();
          });
        });

        M.synthesize(api, scene, {
          style: 'monet-broken',
          masterpiece: true,
          totalStrokes: 31650,
          seed: 1872,
          layers: WORKS[4].layers,
          roi: [
            { cx: 738, cy: 316, rx: 95, ry: 75, boost: 3.4 },
            { cx: 738, cy: 615, rx: 115, ry: 175, boost: 3.8 },
            { cx: 475, cy: 645, rx: 185, ry: 115, boost: 4.0 }
          ]
        });

        const layer4 = WORKS[4].layers[3].id;
        const layer6 = WORKS[4].layers[5].id;
        padToExact(api, 32000, layer6, '莫奈横向碎金橘色反光与迷雾船影', (i) => {
          const isOrangeDash = i % 5 !== 0;
          const x = isOrangeDash ? 692 + (N.rand() - 0.5) * 84 : 75 + N.rand() * 960;
          const y = isOrangeDash ? 452 + N.rand() * 380 : H_Y + 12 + N.rand() * 360;
          const len = isOrangeDash ? 18 + N.rand() * 34 : 14 + N.rand() * 24;
          api.pushRawStroke(isOrangeDash ? layer6 : layer4, '莫奈横向碎金橘色反光与迷雾船影', (c) => {
            c.strokeStyle = isOrangeDash
              ? (i % 2 === 0 ? '#f87826' : '#e45222')
              : (i % 2 === 0 ? '#425866' : '#6c8696');
            c.lineWidth = isOrangeDash ? 3.2 + N.rand() * 2.5 : 2.0 + N.rand() * 2.0;
            c.lineCap = 'butt';
            c.globalAlpha = 0.84;
            c.beginPath();
            c.moveTo(x - len * 0.5, y);
            c.lineTo(x + len * 0.5, y + (N.rand() - 0.5) * 2.5);
            c.stroke();
            c.globalAlpha = 1;
          });
        });
      }
    },

    // =========================================================================
    // 6. GEORGES SEURAT — A SUNDAY ON LA GRANDE JATTE (60,000 POINTILLIST DOTS)
    // =========================================================================
    {
      id: 'oil-master-grande-jatte',
      title: '世界名作·修拉《大碗岛的星期天下午》',
      subtitle: '新印象派纯粹科学分色点彩（Divisionism）· 60,000 枚纯净色点光学混彩与经典点彩画框',
      group: '油画·世界名作',
      category: '新印象点彩风俗',
      seal: '分色点彩·6万点',
      mode: 'oil',
      theme: 'gallery-dark',
      backdropColor: '#1d2224',
      width: 1180,
      height: 800,
      seed: 1884,
      maxOilStrokes: 100000,
      swatches: ['rgb(138, 178, 62)', 'rgb(44, 68, 92)', 'rgb(112, 68, 128)', 'rgb(246, 242, 232)', 'rgb(218, 72, 48)'],
      desc: '依芝加哥艺术博物馆镇馆之宝临摹：60,000 枚毫不相混的纯色圆点光学交响！包含经典互补色点彩画框、塞纳河白帆、大草坪深紫蓝树荫带与阳光绿野、前景红背心卧客与巴哥犬、正中红伞白衣小女孩以及右前方执猩红阳伞与牵猴散步的盛装贵妇绅士。',
      analysis: {
        original: '乔治·修拉（Georges Seurat） · 1884–1886 · 芝加哥艺术博物馆',
        movement: '法国新印象派（Neo-Impressionism / 点彩派）至高经典。耗时两年严谨演算色彩光学理论与建筑般静穆的古典人像剪影，重塑工业时代巴黎市郊的永恒田园仪典。',
        palette: '谢弗勒尔（Chevreul）同时对比律下的纯粹光学光谱：草地绝不直接调暗绿，而是并置柠檬黄、翡翠绿、微橙与紫蓝点；阴凉前景铺陈深钴紫（Cobalt Violet）、群青与碧绿光点；衣裙亮出猩红、绯粉与纯钛白。',
        technique: '“分色点彩法（Divisionism / Pointillism）”：严禁在调色板上物理拌匀相邻色彩，全画几乎全部以等匀细小圆形彩色触点（Dot dabs）铺叠而成，让观众眼睛在远处自然进行光学叠加混合；外围更亲绘互补深蓝与赤红彩点画框锁住画面明度张力。',
        algorithm: '采用 seurat-pointillism 光学点阵模式（总计 60,000 笔，占全站最高精度）：细致雕塑前景男女侧影腰身裙摆、头帽、手臂阳伞与林间游人比例，第 2–6 层以 1.2–9.5px 纯色圆点加 ±34 互补色震颤全面分色点织。'
      },
      layers: [
        { id: 1, name: '一 · 大草坪冷暖树荫带与点彩边框基底' },
        { id: 2, name: '二 · 塞纳河碧波、林木穹顶与中景绿茵点铺' },
        { id: 3, name: '三 · 中景游人、划桨小舟与树干立体点彩' },
        { id: 4, name: '四 · 经典前景群像：紫裙牵猴贵妇、红伞母女、水手与狗' },
        { id: 5, name: '五 · 互补色分色光点密度加密（5万点级联）' },
        { id: 6, name: '六 · 补色光晕细点（Petits Points）与画框锁边' }
      ],
      buildStrokes(api) {
        const M = window.Code2PaintOilMaster;
        const W = 1180, H = 800;
        const scene = M.createScene(W, H, 1884, { maxDim: 560 });

        scene.draw2D((ctx) => {
          const lawn = ctx.createLinearGradient(0, 140, 0, H);
          lawn.addColorStop(0, '#96c24a');
          lawn.addColorStop(0.55, '#a8d252');
          lawn.addColorStop(1, '#689836');
          ctx.fillStyle = lawn; ctx.fillRect(0, 0, W, H);

          ctx.fillStyle = '#c8e0ea'; ctx.fillRect(0, 0, W, 118);

          const river = ctx.createLinearGradient(18, 118, 465, 515);
          river.addColorStop(0, '#5a94c2'); river.addColorStop(1, '#4476a4');
          ctx.fillStyle = river;
          ctx.beginPath(); ctx.moveTo(18, 128); ctx.lineTo(525, 118); ctx.lineTo(18, 535); ctx.closePath(); ctx.fill();

          for (const [bx, by, sc] of [[185, 225, 0.9], [315, 195, 0.72], [118, 325, 1.0], [268, 285, 0.65]]) {
            ctx.fillStyle = '#f8f6ee';
            ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(bx + 22 * sc, by); ctx.lineTo(bx + 2 * sc, by - 46 * sc); ctx.closePath(); ctx.fill();
            ctx.fillStyle = '#3c2a1e'; ctx.fillRect(bx - 14 * sc, by + 2 * sc, 36 * sc, 7 * sc);
          }

          const sh = ctx.createLinearGradient(0, 520, 0, H);
          sh.addColorStop(0, 'rgba(54, 72, 92, 0.88)'); sh.addColorStop(1, 'rgba(38, 48, 74, 0.94)');
          ctx.fillStyle = sh;
          ctx.beginPath();
          ctx.moveTo(18, 545); ctx.quadraticCurveTo(465, 625, 1162, 515); ctx.lineTo(1162, 784); ctx.lineTo(18, 784);
          ctx.closePath(); ctx.fill();

          // Soft overlapping park tree canopies
          for (const [tx, ty, rx, ry] of [[82, 0, 125, 385], [345, 0, 145, 295], [565, 0, 185, 275], [765, 0, 195, 255], [1025, 0, 205, 395]]) {
            ctx.fillStyle = '#486832'; ctx.beginPath(); ctx.ellipse(tx, ty + ry * 0.45, rx, ry * 0.55, 0, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#76a642'; ctx.beginPath(); ctx.ellipse(tx + 22, ty + ry * 0.35, rx * 0.65, ry * 0.4, 0, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#4c382e'; ctx.fillRect(tx - 10, ry * 0.65, 20, 195);
          }

          // Proper anatomical human silhouettes across sunlit meadow (head + neck + shoulders + waist + flared skirt/trousers)
          function drawSeuratPerson(px, py, sc, topCol, skirtCol, isWoman) {
            ctx.fillStyle = '#e8b89a';
            ctx.beginPath(); ctx.arc(px, py - 58 * sc, 9 * sc, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = topCol;
            ctx.beginPath();
            ctx.moveTo(px - 10 * sc, py - 46 * sc); ctx.lineTo(px + 10 * sc, py - 46 * sc);
            ctx.lineTo(px + 7 * sc, py - 24 * sc); ctx.lineTo(px - 7 * sc, py - 24 * sc);
            ctx.closePath(); ctx.fill();
            ctx.fillStyle = skirtCol;
            if (isWoman) {
              ctx.beginPath();
              ctx.moveTo(px - 8 * sc, py - 24 * sc); ctx.lineTo(px + 8 * sc, py - 24 * sc);
              ctx.lineTo(px + 18 * sc, py + 14 * sc); ctx.lineTo(px - 16 * sc, py + 14 * sc);
              ctx.closePath(); ctx.fill();
            } else {
              ctx.fillRect(px - 7 * sc, py - 24 * sc, 6 * sc, 36 * sc);
              ctx.fillRect(px + 1 * sc, py - 24 * sc, 6 * sc, 36 * sc);
            }
          }

          drawSeuratPerson(398, 345, 0.92, '#f2eee4', '#d8d4ca', true);
          drawSeuratPerson(446, 325, 0.88, '#38486e', '#28324c', false);
          drawSeuratPerson(515, 295, 0.80, '#f4efe6', '#d88284', true);
          drawSeuratPerson(685, 292, 0.82, '#343c54', '#262b3c', false);
          drawSeuratPerson(758, 308, 0.86, '#e8c4a4', '#c85848', true);
          drawSeuratPerson(825, 325, 0.92, '#f4ede2', '#526894', true);
          drawSeuratPerson(785, 455, 1.05, '#f2ece0', '#c86862', true);

          // 1. LEFT FOREGROUND LOUNGERS: sailor in red vest + straw hat + seated pair
          ctx.fillStyle = '#28344c'; ctx.fillRect(145, 655, 132, 34);
          ctx.fillStyle = '#d43c2c'; ctx.beginPath(); ctx.ellipse(268, 632, 32, 24, -0.2, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = '#e8c456'; ctx.beginPath(); ctx.ellipse(278, 598, 22, 10, 0.1, 0, Math.PI * 2); ctx.fill();

          drawSeuratPerson(348, 608, 1.35, '#262432', '#262432', false);
          ctx.fillStyle = '#181822'; ctx.fillRect(334, 514, 24, 24);
          drawSeuratPerson(395, 612, 1.38, '#9a84a8', '#7e688e', true);

          // 2. CENTER HERO DUO: Mother holding coral parasol & little white-dressed girl
          drawSeuratPerson(562, 575, 2.25, '#6a4e68', '#523c58', true);
          ctx.fillStyle = '#c83428'; ctx.beginPath(); ctx.arc(572, 365, 58, Math.PI, 0); ctx.fill();
          drawSeuratPerson(642, 578, 1.65, '#faf8f0', '#f6f4ec', true);
          ctx.fillStyle = '#e88248'; ctx.fillRect(628, 535, 28, 8);

          // 3. FOREGROUND PUG / BLACK DOG
          ctx.fillStyle = '#181a24';
          ctx.beginPath(); ctx.ellipse(725, 685, 34, 18, -0.15, 0, Math.PI * 2); ctx.fill();
          ctx.beginPath(); ctx.arc(695, 668, 12, 0, Math.PI * 2); ctx.fill();

          // 4. ICONIC RIGHT FOREGROUND COUPLE: Realistic sculpted profile + hourglass waist + pronounced 1880s bustle!
          // Top-hat gentleman behind her with beard & monocle profile
          ctx.fillStyle = '#e8b694'; ctx.beginPath(); ctx.arc(985, 272, 20, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = '#1e202e';
          ctx.beginPath();
          ctx.moveTo(962, 294); ctx.lineTo(1018, 294); ctx.lineTo(1032, 475); ctx.lineTo(960, 475);
          ctx.closePath(); ctx.fill();
          ctx.fillRect(965, 475, 24, 155); ctx.fillRect(1002, 475, 24, 155);
          ctx.fillRect(968, 224, 34, 32); // tall top hat

          // Hero Bustle Lady left profile with cinched waist, dramatic protruding rear bustle & tilted parasol
          ctx.fillStyle = '#e8b896'; ctx.beginPath(); ctx.arc(872, 295, 19, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = '#c89e4c'; ctx.beginPath(); ctx.ellipse(876, 274, 24, 11, -0.1, 0, Math.PI * 2); ctx.fill();
          const bustG = ctx.createLinearGradient(835, 315, 975, 685);
          bustG.addColorStop(0, '#5a4274'); bustG.addColorStop(0.5, '#6a4876'); bustG.addColorStop(1, '#2a2240');
          ctx.fillStyle = bustG;
          ctx.beginPath();
          ctx.moveTo(855, 318);
          ctx.lineTo(892, 318);
          ctx.quadraticCurveTo(902, 378, 886, 405); // cinched waist
          ctx.bezierCurveTo(958, 412, 986, 488, 978, 565); // pronounced protruding 1880s bustle!
          ctx.lineTo(975, 688);
          ctx.lineTo(838, 688);
          ctx.bezierCurveTo(845, 515, 850, 385, 855, 318);
          ctx.closePath(); ctx.fill();

          // Dark-red / green parasol & leash monkey
          ctx.fillStyle = '#3a4a38';
          ctx.beginPath(); ctx.ellipse(845, 248, 64, 22, -0.25, Math.PI, 0); ctx.fill();
          ctx.fillStyle = '#322820';
          ctx.beginPath(); ctx.ellipse(795, 685, 20, 14, 0.2, 0, Math.PI * 2); ctx.fill();
          ctx.strokeStyle = '#322820'; ctx.lineWidth = 4;
          ctx.beginPath(); ctx.moveTo(776, 682); ctx.quadraticCurveTo(748, 655, 768, 635); ctx.stroke();

          ctx.strokeStyle = '#2c223c'; ctx.lineWidth = 34; ctx.strokeRect(0, 0, W, H);
          ctx.strokeStyle = '#9c4832'; ctx.lineWidth = 10; ctx.strokeRect(10, 10, W - 20, H - 20);
        });

        M.synthesize(api, scene, {
          style: 'seurat-pointillism',
          masterpiece: true,
          totalStrokes: 60000,
          seed: 1884,
          layers: WORKS[5].layers,
          roi: [
            { cx: 915, cy: 485, rx: 145, ry: 225, boost: 3.4 },
            { cx: 595, cy: 505, rx: 115, ry: 155, boost: 3.6 },
            { cx: 245, cy: 615, rx: 145, ry: 115, boost: 3.0 },
            { cx: 215, cy: 255, rx: 175, ry: 125, boost: 2.5 }
          ]
        });
      }
    },

    // =========================================================================
    // 7. PAUL CÉZANNE — APPLES AND ORANGES (CONSTRUCTIVE FACETS, 36,000 STROKES)
    // =========================================================================
    {
      id: 'oil-master-cezanne-apples',
      title: '世界名作·塞尚《苹果与柳橙》',
      subtitle: '后印象派建构主义多点透视（Constructive Facets）· 36,000 笔：-38° 平行排笔块面与结构笔触',
      group: '油画·世界名作',
      category: '后印象建构静物',
      seal: '结构排笔·3.6万笔',
      mode: 'oil',
      theme: 'gallery-dark',
      backdropColor: '#241812',
      width: 1080,
      height: 860,
      seed: 1899,
      maxOilStrokes: 100000,
      swatches: ['rgb(236, 232, 224)', 'rgb(96, 128, 178)', 'rgb(228, 56, 36)', 'rgb(244, 152, 28)', 'rgb(132, 68, 38)'],
      desc: '依巴黎奥赛博物馆经典临摹：打破单一焦点的俯视大白桌布、高脚瓷果盘上堆叠的朱红苹果与橙黄柳橙、歪斜前置瓷盘与花釉陶壶，全画使用斜向 -38° 平行扁平塑形笔触构建“现代绘画之父”的永恒几何张力。',
      analysis: {
        original: '保罗·塞尚（Paul Cézanne） · c. 1899 · 巴黎奥赛博物馆',
        movement: '后印象派（Post-Impressionism）建构主义与立体主义（Cubism）的直接思想源头。塞尚刻意让高脚盘、斜餐盘与花瓶在左右两半采用截然不同的视角倾斜，创造超越摄影视角的心理平衡与体积雕塑感。',
        palette: '强烈而克制的冷暖结构配比：白色亚麻桌布不用死灰而用天青、群青、钴蓝阴影搭配奶油黄赭受光面；朱红、茜素红与亮橘橙水果构成高温中心；背景是深赭、墨绿、红棕碎花织锦挂毯。',
        technique: '“结构性斜向平行排笔（Constructive Parallel Strokes）”：以方头扁平油画笔蘸高稠度颜料，沿大约 -38° 方向一笔紧挨一笔砌出果实的受光面、过渡面与阴面块面，拒绝机械平滑渐变或硬圈线框，在面与面交接处显露沉雄雕塑结构。',
        algorithm: '启动 cezanne-constructive 建构式方向场（35,650 笔）将弱梯度区域重塑为 -38° 平行方头扁笔，并依照后遮前景深顺次渲染苹果与柳橙球面、高光折面，末层补涂 350 笔极具塞尚代表性的 -38° 短方头结构排笔切片，完全摒弃生硬环形线框，共计 36,000 笔。'
      },
      layers: [
        { id: 1, name: '一 · 暖褐花毯背景与波斯红桌角大色定势' },
        { id: 2, name: '二 · 险峻雪峰状折叠大白桌布冷暖块面' },
        { id: 3, name: '三 · 高脚白瓷果盘、前置斜盘与青花瓷壶透视造型' },
        { id: 4, name: '四 · 平行 -38° 块面法塑造苹果与柳橙三维球体' },
        { id: 5, name: '五 · 钴蓝桌布暗折与水果炽亮受光面叠彩' },
        { id: 6, name: '六 · 塞尚标志性 -38° 平行扁笔结构切片收笔' }
      ],
      buildStrokes(api) {
        const M = window.Code2PaintOilMaster;
        const W = 1080, H = 860;
        const scene = M.createScene(W, H, 1899, { maxDim: 560 });
        const N = scene.N;

        scene.draw2D((ctx) => {
          const wall = ctx.createLinearGradient(0, 0, W, 560);
          wall.addColorStop(0, '#5a3622'); wall.addColorStop(0.5, '#7c4e2e'); wall.addColorStop(1, '#3e2e24');
          ctx.fillStyle = wall; ctx.fillRect(0, 0, W, H);

          for (const [fx, fy, col] of [
            [180, 140, '#8e5a34'], [320, 110, '#3a5438'], [560, 130, '#9a683a'], [220, 260, '#445868'], [920, 210, '#6a4228']
          ]) {
            ctx.fillStyle = col; ctx.beginPath(); ctx.arc(fx, fy, 68, 0, Math.PI * 2); ctx.fill();
          }

          const rug = ctx.createLinearGradient(0, 560, 480, H);
          rug.addColorStop(0, '#a82e24'); rug.addColorStop(0.55, '#681c18'); rug.addColorStop(1, '#2c1210');
          ctx.fillStyle = rug; ctx.fillRect(0, 520, W, 340);
          ctx.fillStyle = '#d49a3c'; ctx.fillRect(85, 675, 165, 22); ctx.fillRect(195, 745, 95, 32);

          const cloth = ctx.createLinearGradient(120, 185, 860, 825);
          cloth.addColorStop(0, '#f4f0e6'); cloth.addColorStop(0.45, '#d6dce6'); cloth.addColorStop(0.78, '#96aac4'); cloth.addColorStop(1, '#687ca4');
          ctx.fillStyle = cloth;
          ctx.beginPath();
          ctx.moveTo(225, 225); ctx.lineTo(545, 245); ctx.lineTo(865, 425);
          ctx.lineTo(1065, 635); ctx.lineTo(1065, 860); ctx.lineTo(445, 860);
          ctx.bezierCurveTo(325, 745, 195, 615, 78, 565);
          ctx.bezierCurveTo(145, 435, 178, 325, 225, 225);
          ctx.closePath(); ctx.fill();

          ctx.fillStyle = 'rgba(104, 134, 178, 0.72)';
          ctx.beginPath(); ctx.moveTo(495, 595); ctx.lineTo(665, 695); ctx.lineTo(525, 845); ctx.lineTo(395, 715); ctx.closePath(); ctx.fill();
          ctx.fillStyle = 'rgba(248, 245, 238, 0.88)';
          ctx.beginPath(); ctx.moveTo(145, 515); ctx.lineTo(365, 435); ctx.lineTo(485, 575); ctx.lineTo(295, 645); ctx.closePath(); ctx.fill();
        });

        scene.shadeLathe3D({
          cx: 455, topY: 325, botY: 575,
          material: 'ceramic', openTopRim: true,
          profile: [[0.0, 148], [0.16, 132], [0.36, 44], [0.58, 24], [0.85, 52], [1.0, 74]],
          colLit: [248, 246, 240], colMid: [176, 188, 206], colDark: [82, 98, 128],
          bounceCol: [198, 206, 218]
        });
        scene.shadeLathe3D({
          cx: 825, topY: 165, botY: 535,
          material: 'ceramic', openTopRim: true,
          profile: [[0.0, 56], [0.22, 48], [0.55, 108], [0.88, 92], [1.0, 68]],
          colLit: [248, 244, 236], colMid: [168, 178, 196], colDark: [78, 92, 118],
          bounceCol: [182, 192, 208]
        });

        scene.draw2D((ctx) => {
          ctx.fillStyle = '#a8b8d0';
          ctx.beginPath(); ctx.ellipse(715, 622, 168, 116, -0.06, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = '#f4f2ec';
          ctx.beginPath(); ctx.ellipse(715, 612, 152, 102, -0.06, 0, Math.PI * 2); ctx.fill();
        });

        // Order fruits cleanly back-to-front so front spheres overlap back ones seamlessly (no wireframe overlap!)
        const fruitList = [
          { cx: 472, cy: 278, rx: 40, ry: 38, colLit: [246, 86, 46], colMid: [204, 38, 28], colShadow: [88, 18, 18], colBlush: [248, 174, 52] },
          { cx: 405, cy: 296, rx: 39, ry: 37, colLit: [248, 154, 34], colMid: [224, 92, 24], colShadow: [108, 32, 14], colBlush: [252, 198, 52] },
          { cx: 532, cy: 302, rx: 38, ry: 36, colLit: [246, 164, 36], colMid: [218, 98, 22], colShadow: [96, 36, 12], colBlush: [248, 208, 58] },
          { cx: 445, cy: 332, rx: 41, ry: 37, colLit: [228, 212, 76], colMid: [186, 78, 34], colShadow: [82, 26, 16], colBlush: [236, 52, 34] },
          { cx: 506, cy: 342, rx: 38, ry: 36, colLit: [248, 144, 32], colMid: [216, 76, 22], colShadow: [96, 26, 14], colBlush: [248, 198, 48] },
          { cx: 298, cy: 492, rx: 44, ry: 40, colLit: [246, 98, 38], colMid: [198, 36, 28], colShadow: [82, 16, 14], colBlush: [244, 178, 46] },
          { cx: 562, cy: 505, rx: 42, ry: 40, colLit: [238, 168, 42], colMid: [194, 86, 24], colShadow: [86, 32, 14], colBlush: [248, 212, 62] },
          { cx: 745, cy: 554, rx: 42, ry: 39, colLit: [248, 168, 38], colMid: [224, 96, 22], colShadow: [98, 34, 12], colBlush: [252, 208, 54] },
          { cx: 658, cy: 562, rx: 41, ry: 38, colLit: [246, 82, 42], colMid: [198, 34, 26], colShadow: [84, 16, 16], colBlush: [244, 156, 48] },
          { cx: 785, cy: 620, rx: 39, ry: 37, colLit: [246, 92, 40], colMid: [198, 38, 28], colShadow: [84, 18, 16], colBlush: [244, 168, 48] },
          { cx: 622, cy: 618, rx: 38, ry: 36, colLit: [248, 148, 32], colMid: [216, 78, 22], colShadow: [94, 26, 14], colBlush: [248, 198, 46] },
          { cx: 702, cy: 622, rx: 43, ry: 40, colLit: [228, 198, 68], colMid: [178, 102, 32], colShadow: [78, 34, 16], colBlush: [232, 48, 32] },
          { cx: 925, cy: 665, rx: 42, ry: 38, colLit: [246, 96, 38], colMid: [198, 36, 26], colShadow: [82, 18, 16], colBlush: [244, 172, 46] }
        ];
        fruitList.forEach(f => scene.shadeFruit3D({ ...f, kind: 'apple', bounceCol: [192, 206, 224], shininess: 46, specStrength: 0.52 }));

        M.synthesize(api, scene, {
          style: 'cezanne-constructive',
          masterpiece: true,
          totalStrokes: 35650,
          seed: 1899,
          layers: WORKS[6].layers,
          roi: [
            { cx: 465, cy: 365, rx: 175, ry: 155, boost: 3.6 },
            { cx: 715, cy: 605, rx: 195, ry: 145, boost: 3.8 },
            { cx: 825, cy: 345, rx: 125, ry: 175, boost: 2.8 }
          ]
        });

        // 350 authentic Cézanne -38° constructive parallel color-plane slabs across cloth folds & fruit planes (ZERO circle Venn diagrams!)
        const layer6 = WORKS[6].layers[5].id;
        const cAng = -0.663; // -38 deg
        const dx = Math.cos(cAng), dy = Math.sin(cAng);
        padToExact(api, 36000, layer6, '塞尚 -38° 平行块面结构短刷', (i) => {
          const isClothFold = i % 2 === 0;
          let px, py, col;
          if (isClothFold) {
            px = 215 + N.rand() * 685;
            py = 365 + N.rand() * 445;
            col = i % 4 === 0 ? '#748ab4' : '#edeae2';
          } else {
            const f = fruitList[i % fruitList.length];
            px = f.cx + (N.rand() - 0.5) * 28;
            py = f.cy + (N.rand() - 0.5) * 24;
            col = i % 3 === 0 ? '#f6a828' : '#d43a24';
          }
          const len = 10 + N.rand() * 14;
          api.pushRawStroke(layer6, '塞尚 -38° 平行块面结构短刷', (c) => {
            c.strokeStyle = col;
            c.lineWidth = 3.2 + N.rand() * 2.4;
            c.lineCap = 'butt';
            c.globalAlpha = 0.52;
            c.beginPath();
            c.moveTo(px - dx * len * 0.5, py - dy * len * 0.5);
            c.lineTo(px + dx * len * 0.5, py + dy * len * 0.5);
            c.stroke();
            c.globalAlpha = 1;
          });
        });
      }
    },

    // =========================================================================
    // 8. GUSTAV KLIMT — THE KISS (BYZANTINE GOLD LEAF & MOSAIC, 48,000 STROKES)
    // =========================================================================
    {
      id: 'oil-master-klimt-kiss',
      title: '世界名作·克里姆特《吻》',
      subtitle: '维也纳金色时期镶嵌装饰风（Byzantine Gold Leaf）· 48,000 笔：钟形金袍、矩形冷金与悬崖繁花',
      group: '油画·世界名作',
      category: '象征主义装饰油画',
      seal: '金箔圣吻·4.8万笔',
      mode: 'oil',
      theme: 'gallery-dark',
      backdropColor: '#241c0e',
      width: 960,
      height: 960,
      seed: 1908,
      maxOilStrokes: 100000,
      swatches: ['rgb(86, 70, 38)', 'rgb(246, 204, 68)', 'rgb(24, 24, 26)', 'rgb(228, 72, 58)', 'rgb(74, 152, 92)'],
      desc: '依维也纳美景宫《吻》标志性正方形构图临摹：金粉古铜星雾背景下，流金钟形拥吻长袍巍然耸立于繁花绿苔悬崖边缘——男子头戴常春藤冠倾首吻颊、金箔袍内嵌入竖条黑白银方格带；女子仰首闭目沉醉、金衣遍开雅致彩花圆斑与黄金螺旋蔓枝。',
      analysis: {
        original: '古斯塔夫·克里姆特（Gustav Klimt） · 1907–1908 · 维也纳美景宫美术馆',
        movement: '维也纳分离派（Vienna Secession / 象征主义“金色时期”）代表巅峰。将拜占庭圣像金箔镶嵌艺术与现代官能极简写实面庞奇迹融合。',
        palette: '金属真金箔与珠宝原色对比：沉稳深邃的古铜橄榄暗金背景衬托大面积锤揲黄金；男子袍服在金色基底内点缀克制的纯黑、银灰与象牙白矩形；女子长裙散落品紫、珊瑚红与翡翠小花；脚下深邃绿苔配万紫千红悬崖微花。',
        technique: '“写实肉身 × 拜占庭黄金镶嵌留白节律”：男女脸颊与交握双手采用温润极精细的三维素描柔滑衔接；全身金色钟形罩袍绝非杂乱平铺色块，而是保留约七成锤揲真金光泽，仅在流动的黄金区带内部严谨分化出男子硬朗垂直矩形带与女子波浪彩花蔓枝带。',
        algorithm: '用 45,600 笔 klimt-goldleaf 六层笔触精准刻画闭目仰面神态、护脸双手、金色钟形大袍与花海悬崖，再依钟形外轮廓曲线精确裁切边界，在 2,400 笔装饰中保留大量金箔波纹留白并分化黑白银矩形带、柔美花簇与崖边碎花，严格落笔 48,000 笔。'
      },
      layers: [
        { id: 1, name: '一 · 古铜橄榄金粉星雾正方底调' },
        { id: 2, name: '二 · 繁花绿苔悬崖草坪与黄金光轮罩染' },
        { id: 3, name: '三 · 相拥男女金色钟形外袍锤揲金箔底色' },
        { id: 4, name: '四 · 男子常春藤发冠、倾吻侧颜与女子仰首闭目娇容' },
        { id: 5, name: '五 · 钟形袍内男子竖条矩形带与女子雅致彩花圆斑' },
        { id: 6, name: '六 · 悬崖微花、金色涡旋藤蔓与双手柔光收笔' }
      ],
      buildStrokes(api) {
        const M = window.Code2PaintOilMaster;
        const W = 960, H = 960;
        const scene = M.createScene(W, H, 1908, { maxDim: 560 });
        const N = scene.N;

        scene.draw2D((ctx) => {
          const bg = ctx.createRadialGradient(480, 445, 45, 480, 480, 680);
          bg.addColorStop(0, '#786234'); bg.addColorStop(0.55, '#46381c'); bg.addColorStop(1, '#20180c');
          ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);

          for (let g = 0; g < 160; g++) {
            ctx.fillStyle = g % 2 === 0 ? 'rgba(246, 206, 86, 0.34)' : 'rgba(188, 148, 52, 0.22)';
            ctx.beginPath(); ctx.arc(N.rand() * W, N.rand() * H, 1.5 + N.rand() * 3.5, 0, Math.PI * 2); ctx.fill();
          }

          // Emerald-moss cliff precipice bottom
          const cliff = ctx.createLinearGradient(0, 775, 0, H);
          cliff.addColorStop(0, '#3e6230'); cliff.addColorStop(0.5, '#26401e'); cliff.addColorStop(1, '#12200e');
          ctx.fillStyle = cliff;
          ctx.beginPath();
          ctx.moveTo(0, 818); ctx.bezierCurveTo(285, 768, 585, 774, 742, 818);
          ctx.bezierCurveTo(795, 836, 808, 912, 802, H); ctx.lineTo(0, H);
          ctx.closePath(); ctx.fill();

          const halo = ctx.createRadialGradient(475, 445, 85, 480, 470, 395);
          halo.addColorStop(0, 'rgba(255, 224, 96, 0.44)'); halo.addColorStop(0.7, 'rgba(218, 162, 42, 0.16)'); halo.addColorStop(1, 'rgba(84, 68, 36, 0)');
          ctx.fillStyle = halo; ctx.beginPath(); ctx.ellipse(475, 475, 295, 385, 0, 0, Math.PI * 2); ctx.fill();

          // Harmonious unified Golden Bell Silhouette enclosing embracing couple
          const bellG = ctx.createLinearGradient(255, 115, 685, 825);
          bellG.addColorStop(0, '#fae062'); bellG.addColorStop(0.45, '#e2a832'); bellG.addColorStop(1, '#9c6e18');
          ctx.fillStyle = bellG;
          ctx.beginPath();
          ctx.moveTo(352, 132);
          ctx.bezierCurveTo(265, 235, 252, 545, 275, 818);
          ctx.lineTo(685, 818);
          ctx.bezierCurveTo(645, 495, 585, 295, 515, 255);
          ctx.bezierCurveTo(475, 165, 425, 108, 352, 132);
          ctx.closePath();
          ctx.fill();

          // Wavy golden vertical dress stream dividing man & woman softly
          ctx.strokeStyle = 'rgba(255, 232, 124, 0.65)'; ctx.lineWidth = 10;
          ctx.beginPath(); ctx.moveTo(465, 295); ctx.bezierCurveTo(452, 465, 475, 625, 458, 812); ctx.stroke();

          // Man's neck, dark hair & green ivy crown
          ctx.fillStyle = '#a4643c'; ctx.beginPath(); ctx.ellipse(412, 198, 42, 46, 0.35, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = '#2c1e16'; ctx.beginPath(); ctx.ellipse(396, 178, 46, 35, 0.15, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = '#528a3e';
          for (const [lx, ly] of [[368, 158], [392, 148], [418, 154], [435, 168]]) {
            ctx.beginPath(); ctx.ellipse(lx, ly, 10, 6.5, 0.4, 0, Math.PI * 2); ctx.fill();
          }

          // Woman's luminous porcelain face with closed eyes & rosy blush
          const faceG = ctx.createRadialGradient(488, 252, 10, 488, 258, 56);
          faceG.addColorStop(0, '#fce6d4'); faceG.addColorStop(0.65, '#ebc2a4'); faceG.addColorStop(1, '#b68062');
          ctx.fillStyle = faceG; ctx.beginPath(); ctx.ellipse(488, 255, 42, 50, 0.25, 0, Math.PI * 2); ctx.fill();

          ctx.fillStyle = 'rgba(224, 112, 102, 0.45)'; ctx.beginPath(); ctx.arc(482, 266, 14, 0, Math.PI * 2); ctx.fill();
          ctx.strokeStyle = '#382218'; ctx.lineWidth = 2.8;
          ctx.beginPath(); ctx.arc(478, 245, 7.5, 0.1, Math.PI - 0.1); ctx.stroke();
          ctx.beginPath(); ctx.arc(504, 242, 7.5, 0.1, Math.PI - 0.1); ctx.stroke();
          ctx.fillStyle = '#c8584e'; ctx.beginPath(); ctx.ellipse(478, 282, 8.5, 4.2, 0.2, 0, Math.PI * 2); ctx.fill();

          ctx.fillStyle = '#efc6aa'; ctx.beginPath(); ctx.ellipse(522, 315, 28, 36, -0.35, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = '#6c3420'; ctx.beginPath(); ctx.ellipse(534, 248, 36, 44, -0.2, 0, Math.PI * 2); ctx.fill();

          ctx.fillStyle = '#c88c62';
          ctx.beginPath(); ctx.ellipse(438, 242, 18, 24, -0.3, 0, Math.PI * 2); ctx.fill();
          ctx.beginPath(); ctx.ellipse(512, 288, 22, 14, 0.2, 0, Math.PI * 2); ctx.fill();
          ctx.strokeStyle = '#f2cbb0'; ctx.lineWidth = 21; ctx.lineCap = 'round';
          ctx.beginPath(); ctx.moveTo(525, 318); ctx.quadraticCurveTo(445, 295, 428, 212); ctx.stroke();

          ctx.fillStyle = '#ecc0a2';
          ctx.beginPath(); ctx.ellipse(545, 824, 34, 15, -0.1, 0, Math.PI * 2); ctx.fill();
          ctx.beginPath(); ctx.ellipse(602, 830, 32, 14, -0.08, 0, Math.PI * 2); ctx.fill();
        });

        M.synthesize(api, scene, {
          style: 'klimt-goldleaf',
          masterpiece: true,
          totalStrokes: 45600,
          seed: 1908,
          layers: WORKS[7].layers,
          roi: [
            { cx: 465, cy: 235, rx: 125, ry: 125, boost: 4.5 },
            { cx: 485, cy: 565, rx: 225, ry: 265, boost: 3.0 },
            { cx: 415, cy: 865, rx: 355, ry: 95, boost: 2.6 }
          ]
        });

        // 2,400 tapered, well-proportioned Klimt ornaments leaving beaten gold negative space visible!
        const layer5 = WORKS[7].layers[4].id;
        const layer6 = WORKS[7].layers[5].id;
        // Cluster centers for man's geometric pillar & woman's oval floral garlands (preserves 65% hammered gold!)
        const womClusters = [[512, 435], [568, 520], [508, 625], [595, 685], [525, 755], [625, 765]];
        const manCols = [295, 342, 392, 432];

        padToExact(api, 48000, layer6, '拜占庭金箔矩形、花斑圆簇与崖边繁花', (i) => {
          const kind = i % 10;
          if (kind < 3) {
            // Man's monochrome & gold rectangles strictly tapered inside curved bell mantle
            const cx = manCols[i % manCols.length] + (N.rand() - 0.5) * 18;
            const y = 265 + N.rand() * 525;
            const leftBound = 268 + (y < 420 ? (420 - y) * 0.25 : 0);
            if (cx < leftBound || cx > 448) return;
            const rw = 6 + N.rand() * 12;
            const rh = 14 + N.rand() * 24;
            const pal = ['#161618', '#f0ece2', '#7a7a78', '#ffe064'];
            const col = pal[i % pal.length];
            api.pushRawStroke(layer5, '男袍黑白银直角方格拼贴', (c) => {
              c.globalAlpha = 0.88;
              c.fillStyle = col;
              c.fillRect(cx, y, rw, rh);
              c.strokeStyle = '#9e7a26'; c.lineWidth = 0.9; c.strokeRect(cx, y, rw, rh);
              c.globalAlpha = 1;
            });
          } else if (kind < 6) {
            // Woman's clustered delicate floral blossoms inside wavy gold panels (not full coverage bullseyes!)
            const cl = womClusters[i % womClusters.length];
            const ang = N.rand() * Math.PI * 2, rad = N.rand() * 52;
            const cx = cl[0] + Math.cos(ang) * rad;
            const cy = cl[1] + Math.sin(ang) * rad * 1.15;
            const rightBound = 472 + ((cy - 280) / 540) * 192;
            if (cx < 462 || cx > rightBound || cy < 345 || cy > 798) return;
            const cr = 4.2 + N.rand() * 6.5;
            const ringCols = ['#d43b2c', '#3b8c7c', '#6e4ba6', '#4a7cc2', '#ffe062'];
            const innerCols = ['#ffea82', '#f49844', '#5cc2a8'];
            api.pushRawStroke(layer5, '女裙雅致同心花斑与金叶', (c) => {
              c.globalAlpha = 0.9;
              c.fillStyle = ringCols[i % ringCols.length];
              c.beginPath(); c.arc(cx, cy, cr, 0, Math.PI * 2); c.fill();
              c.fillStyle = innerCols[i % innerCols.length];
              c.beginPath(); c.arc(cx, cy, cr * 0.45, 0, Math.PI * 2); c.fill();
              c.globalAlpha = 1;
            });
          } else if (kind === 6) {
            // Shimmering golden Byzantine spiral tendrils trailing down dress
            const bx = 468 + N.rand() * 155;
            const by = 365 + N.rand() * 415;
            const rightBound = 472 + ((by - 280) / 540) * 192;
            if (bx > rightBound) return;
            api.pushRawStroke(layer5, '金色螺旋蔓枝', (c) => {
              c.strokeStyle = '#ffdf64'; c.lineWidth = 1.6; c.lineCap = 'round';
              c.beginPath();
              c.arc(bx, by, 9, 0, Math.PI * 1.65);
              c.stroke();
            });
          } else {
            // Fine jewel millefleur flowers along emerald cliff precipice
            const fx = 14 + N.rand() * 762;
            const fy = 788 + N.rand() * 155;
            const fr = 1.8 + N.rand() * 3.4;
            const fCols = ['#f4483a', '#6488d8', '#f6d244', '#b462c4', '#fff6da', '#f2823a'];
            api.pushRawStroke(layer6, '悬崖繁花微点与碎金箔', (c) => {
              c.fillStyle = fCols[i % fCols.length];
              c.beginPath(); c.arc(fx, fy, fr, 0, Math.PI * 2); c.fill();
            });
          }
        });
      }
    }
  ];

  if (typeof window !== 'undefined' && window.Code2PaintCatalog) {
    window.Code2PaintCatalog.addPack(WORKS);
  }
})();
