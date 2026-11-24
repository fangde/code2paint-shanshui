(function () {
  'use strict';

  // 10 Traditional Gongbi (工笔画) Works
  // Follows classical double-outline -> Fenran multi-layer shading -> Zhaoran glaze -> Sima/Tijin highlights
  function gongbiLeaf(api, layerLine, layerShade, x, y, len, wid, ang, c1, c2, name) {
    const ca = Math.cos(ang), sa = Math.sin(ang);
    const nx = -sa, ny = ca;
    const p = (f, s) => [x + ca * len * f + nx * wid * s, y + sa * len * f + ny * wid * s];
    const topEdge = [p(0, 0), p(0.32, -0.45), p(0.68, -0.42), p(1, 0)];
    const botEdge = [p(0, 0), p(0.32, 0.45), p(0.68, 0.42), p(1, 0)];
    const poly = [p(0, 0), p(0.32, -0.45), p(0.68, -0.42), p(1, 0), p(0.68, 0.42), p(0.32, 0.45)];
    api.gongbiLine(layerLine, `${name}·叶廓双勾`, topEdge, { width: 1.8, color: '#2b241b', style: 'yousi' });
    api.gongbiLine(layerLine, `${name}·叶底弧线`, botEdge, { width: 1.8, color: '#2b241b', style: 'yousi' });
    api.gongbiShade(layerShade, `${name}·叶脉分染`, poly, { color: c1, colorEnd: c2, angle: ang + Math.PI, alpha: 0.72, alphaEnd: 0.16 });
    api.gongbiLine(layerShade + 1, `${name}·中脉细勾`, [p(0.02, 0), p(0.92, 0)], { width: 1.5, color: '#2d3921', alpha: 0.75 });
    [0.25, 0.5, 0.72].forEach(f => {
      api.gongbiLine(layerShade + 1, `${name}·侧叶筋`, [p(f, 0), p(f + 0.18, -0.32)], { width: 1.1, color: '#394629', alpha: 0.55 });
      api.gongbiLine(layerShade + 1, `${name}·侧叶筋`, [p(f, 0), p(f + 0.18, 0.32)], { width: 1.1, color: '#394629', alpha: 0.55 });
    });
  }

  function gongbiFlower(api, lOutline, lShade, lGold, cx, cy, R, petals, cDark, cLight, name) {
    for (let ring = 1; ring >= 0; ring--) {
      const rr = ring === 1 ? R : R * 0.62;
      const cnt = ring === 1 ? petals : Math.max(5, petals - 2);
      for (let i = 0; i < cnt; i++) {
        const a = (i / cnt) * Math.PI * 2 + ring * 0.35;
        const aL = a - 0.36, aR = a + 0.36;
        const poly = [
          [cx, cy],
          [cx + Math.cos(aL) * rr * 0.65, cy + Math.sin(aL) * rr * 0.65],
          [cx + Math.cos(a - 0.14) * rr, cy + Math.sin(a - 0.14) * rr],
          [cx + Math.cos(a) * rr * 1.06, cy + Math.sin(a) * rr * 1.06],
          [cx + Math.cos(a + 0.14) * rr, cy + Math.sin(a + 0.14) * rr],
          [cx + Math.cos(aR) * rr * 0.65, cy + Math.sin(aR) * rr * 0.65]
        ];
        api.gongbiLine(lOutline, `${name}·花瓣游丝勾线`, [...poly, poly[0]], { width: 1.7, color: '#452429', style: 'yousi' });
        api.gongbiShade(lShade, `${name}·分染花瓣由基至尖`, poly, {
          color: cDark, colorEnd: cLight, radial: true, focus: [cx, cy], alpha: 0.72, alphaEnd: 0.18
        });
      }
    }
    for (let s = 0; s < 14; s++) {
      const sa = (s / 14) * Math.PI * 2;
      const r1 = R * 0.12, r2 = R * 0.28;
      api.gongbiGold(lGold, `${name}·粉金点蕊丝`, [[cx + Math.cos(sa) * r1, cy + Math.sin(sa) * r1], [cx + Math.cos(sa) * r2, cy + Math.sin(sa) * r2]], {
        width: 1.5, color: '#e6c35c'
      });
      api.gongbiGold(lGold, `${name}·金粉花药`, cx + Math.cos(sa) * r2, cy + Math.sin(sa) * r2, { r: 2.6, color: '#f5dc7e' });
    }
  }

  const GONGBI_LAYERS = [
    { id: 1, name: '一 · 双勾白描起稿' },
    { id: 2, name: '二 · 分染底色渐晕' },
    { id: 3, name: '三 · 罩染矿彩叶脉' },
    { id: 4, name: '四 · 丝毛羽纹细节' },
    { id: 5, name: '五 · 泥金提白钤印' }
  ];

  const WORKS = [
    {
      id: 'gongbi-peony',
      title: '工笔·姚黄魏紫牡丹',
      subtitle: '传统工笔重彩花鸟：游丝双勾花瓣 → 三次分染浓淡 → 汁绿石绿罩叶 → 丝毛粉蝶与泥金蕊',
      group: '国画·工笔',
      category: '工笔花鸟',
      seal: '工笔花鸟',
      mode: 'gongbi',
      width: 960,
      height: 1180,
      seed: 1001,
      swatches: ['rgb(235, 224, 200)', 'rgb(166, 36, 66)', 'rgb(245, 212, 220)', 'rgb(45, 98, 62)', 'rgb(230, 195, 92)'],
      desc: '双勾魏紫与姚黄双株牡丹，严格分染九重花瓣明暗，配勾筋翻卷叶片与振翅凤蝶，尽显富贵雍容。',
      layers: GONGBI_LAYERS,
      buildStrokes(api) {
        api.gongbiLine(1, '牡丹主干铁线勾勒', [[260, 1110], [285, 860], [340, 620], [450, 440]], { width: 2.5, color: '#382a20' });
        api.gongbiLine(1, '右出辅干细线', [[310, 740], [490, 660], [665, 595]], { width: 2.2, color: '#382a20' });
        gongbiLeaf(api, 1, 2, 250, 685, 165, 62, 2.55, '#2b6140', '#8bb07c', '左下牡丹叶');
        gongbiLeaf(api, 1, 2, 620, 705, 170, 64, 0.55, '#2b6140', '#8bb07c', '右下牡丹叶');
        gongbiLeaf(api, 1, 2, 345, 485, 145, 54, -2.5, '#3b734e', '#a3c28d', '左高牡丹叶');
        gongbiLeaf(api, 1, 2, 695, 520, 150, 56, 0.25, '#336b47', '#95b884', '右花托叶');
        gongbiFlower(api, 1, 2, 5, 455, 405, 138, 9, '#9e1c3f', '#f4cfd8', '魏紫主牡丹');
        gongbiFlower(api, 1, 2, 5, 675, 585, 112, 8, '#d49e35', '#fbf2cf', '姚黄牡丹');
        // Butterfly hovering top-right (layer 4 silk wing veins & gold scales)
        api.gongbiLine(1, '彩蝶双翅细勾', [[690, 275], [755, 225], [785, 275], [735, 310], [690, 275]], { width: 1.6, closed: true });
        api.gongbiLine(1, '彩蝶后翅', [[690, 278], [735, 310], [748, 352], [695, 325]], { width: 1.6, closed: true });
        api.gongbiShade(3, '彩蝶青黄罩染', [[690, 275], [755, 225], [785, 275], [735, 310]], { color: '#45769c', colorEnd: '#e6c86c', alpha: 0.78 });
        api.gongbiSilkHair(4, '蝶翅绒毛纹理', 725, 275, 0.2, { count: 16, len: 28, color: '#2b241d', fanWidth: 16 });
        api.gongbiGold(5, '泥金蝶斑提神', 752, 260, { r: 4.5, color: '#f2d374' });
        api.inscription(5, '题画：国色天香', 155, 155, '国色天香', { size: 32, stepY: 42 });
        api.seal(5, '朱印：富贵', 155, 360, '富贵', { size: 40 });
      }
    },
    {
      id: 'gongbi-lotus-carp',
      title: '工笔·荷香锦鲤',
      subtitle: '工笔双勾渲染：游丝描荷瓣莲蓬 → 石绿分染荷叶 → 锦鲤丝鳞描金水波',
      group: '国画·工笔',
      category: '工笔花鸟',
      seal: '工笔重彩',
      mode: 'gongbi',
      width: 960,
      height: 1180,
      seed: 1002,
      swatches: ['rgb(235, 224, 200)', 'rgb(206, 74, 96)', 'rgb(42, 108, 72)', 'rgb(212, 68, 36)', 'rgb(232, 188, 74)'],
      desc: '熟宣工笔细勾荷花双瓣分染胭脂红尖，叶面青绿晕染配底下双尾工笔锦鲤，清波水纹一丝不苟。',
      layers: GONGBI_LAYERS,
      buildStrokes(api) {
        // Fine stems
        api.gongbiLine(1, '工笔细勾长荷梗', [[515, 355], [525, 650], [535, 1040]], { width: 2.2, color: '#2e3824' });
        api.gongbiLine(1, '花蕾青梗', [[345, 285], [358, 680], [372, 1040]], { width: 1.9, color: '#2e3824' });
        // Big工笔 double-line scalloped pad
        const padPts = [[165, 595], [225, 495], [375, 465], [545, 495], [640, 575], [575, 658], [415, 678], [225, 652]];
        api.gongbiLine(1, '荷叶边廓铁线描', [...padPts, padPts[0]], { width: 2.0, color: '#27301e' });
        api.gongbiShade(2, '荷叶石绿分染', padPts, { color: '#2e6b48', colorEnd: '#8bb37f', radial: true, focus: [395, 565], alpha: 0.78, alphaEnd: 0.35 });
        [[395, 565, 185, 575], [395, 565, 265, 485], [395, 565, 435, 475], [395, 565, 605, 565], [395, 565, 485, 665], [395, 565, 275, 645]].forEach(([x1, y1, x2, y2]) => {
          api.gongbiGold(3, '叶脉细青金丝', [[x1, y1], [x2, y2]], { width: 1.4, color: '#b5c47c', alpha: 0.75 });
        });
        gongbiFlower(api, 1, 2, 5, 515, 305, 128, 7, '#bd2c48', '#f9e3e8', '工笔粉荷');
        // Twin meticulous carp below pad
        const drawCarp = (cx, cy, ang, c1, c2, name) => {
          const ca = Math.cos(ang), sa = Math.sin(ang), nx = -sa, ny = ca;
          const p = (f, s) => [cx + ca * f + nx * s, cy + sa * f + ny * s];
          const body = [p(85, 0), p(40, -28), p(-45, -20), p(-95, 0), p(-45, 20), p(40, 28)];
          const tailTop = [p(-95, 0), p(-155, -36), p(-175, -18), p(-128, 0)];
          const tailBot = [p(-95, 0), p(-128, 0), p(-170, 22), p(-150, 38)];
          api.gongbiLine(1, `${name}·鱼身工笔双勾`, [...body, body[0]], { width: 1.8, color: '#382018' });
          api.gongbiLine(1, `${name}·尾鳍纹线`, [...tailTop, tailTop[0]], { width: 1.4, color: '#382018' });
          api.gongbiLine(1, `${name}·下尾鳍`, [...tailBot, tailBot[0]], { width: 1.4, color: '#382018' });
          api.gongbiShade(2, `${name}·朱砂分染`, body, { color: c1, colorEnd: c2, angle: ang + Math.PI * 0.5, alpha: 0.85, alphaEnd: 0.25 });
          api.gongbiShade(3, `${name}·尾鳍晕染`, tailTop, { color: c1, colorEnd: '#f7d8b5', alpha: 0.65 });
          api.gongbiShade(3, `${name}·尾鳍晕染`, tailBot, { color: c1, colorEnd: '#f7d8b5', alpha: 0.65 });
          api.gongbiSilkHair(4, `${name}·尾鳍细丝`, p(-102, 0)[0], p(-102, 0)[1], ang + Math.PI, { count: 14, len: 52, spread: 0.7, color: '#9e2f1e', width: 1.1 });
          api.gongbiGold(5, `${name}·金线鳞片提亮`, [p(20, -10), p(-10, -12), p(-35, -8)], { width: 1.4, color: '#f0cc6c' });
          api.inkDot(5, `${name}·点睛`, p(62, -10)[0], p(62, -10)[1], 3.8, 3.8, { color: '#110d0b' });
        };
        drawCarp(385, 865, -0.22, '#c8341e', '#f5c79e', '红金锦鲤');
        drawCarp(645, 965, -2.85, '#d66828', '#f8dfc2', '橘彩伴游鱼');
        api.inscription(5, '题款：清夏九如', 150, 145, '清夏九如', { size: 32, stepY: 42 });
        api.seal(5, '朱印：和合', 150, 350, '和合', { size: 40 });
      }
    },
    {
      id: 'gongbi-pine-crane',
      title: '工笔·松鹤延年',
      subtitle: '工笔翎毛典范：丝毛细画丹顶白羽 → 苍松鳞片与百针松针 → 三白提羽',
      group: '国画·工笔',
      category: '工笔花鸟',
      seal: '工笔翎毛',
      mode: 'gongbi',
      width: 960,
      height: 1200,
      seed: 1003,
      swatches: ['rgb(235, 224, 200)', 'rgb(250, 248, 242)', 'rgb(198, 42, 34)', 'rgb(34, 82, 54)', 'rgb(28, 24, 20)'],
      desc: '细勾长颈优雅站立仙鹤，以“丝毛法”千笔勾写颈羽与墨尾，头点朱丹顶冠，立于虬曲青松之下。',
      layers: GONGBI_LAYERS,
      buildStrokes(api) {
        // Pine bough sweeping from top-left
        api.gongbiLine(1, '青松虬曲主枝双勾', [[40, 260], [280, 225], [540, 275], [760, 245]], { width: 2.6, color: '#32261b' });
        api.gongbiLine(1, '松枝下弧', [[40, 315], [275, 268], [525, 310], [745, 272]], { width: 2.4, color: '#32261b' });
        api.gongbiShade(2, '松皮赭墨分染', [[40, 260], [540, 275], [760, 245], [745, 272], [525, 310], [40, 315]], {
          color: '#5a412d', colorEnd: '#8c694a', alpha: 0.78
        });
        [[195, 210], [345, 195], [510, 240], [685, 215], [440, 310]].forEach(([px, py], i) => {
          api.gongbiSilkHair(3, `工笔松针扇簇 ${i + 1}`, px, py, -1.57, { count: 22, len: 62, spread: 1.5, color: '#1f5438', width: 1.4, fanWidth: 18 });
        });
        // Standing Red-Crowned Crane center
        const crBody = [[425, 620], [505, 575], [610, 610], [675, 725], [585, 775], [445, 740]];
        const crNeck = [[448, 635], [395, 540], [405, 430], [445, 382], [468, 395], [435, 445], [428, 535], [478, 615]];
        api.gongbiLine(1, '仙鹤羽身细描轮廓', [...crBody, crBody[0]], { width: 1.9, color: '#332b24' });
        api.gongbiLine(1, '长颈S姿游丝描', crNeck, { width: 1.9, color: '#241e19' });
        // Legs (one standing, one lifted delicately)
        api.gongbiLine(1, '仙鹤支立长腿', [[535, 760], [538, 920], [542, 1085]], { width: 3.4, color: '#262320' });
        api.gongbiLine(1, '鹤爪抓石', [[512, 1090], [542, 1085], [578, 1092]], { width: 2.2, color: '#262320' });
        api.gongbiLine(1, '翘起左足', [[515, 755], [475, 845], [525, 895]], { width: 3.2, color: '#2e2a26' });
        // Long sharp beak
        api.gongbiLine(1, '仙鹤黄喙', [[465, 388], [568, 378], [468, 398]], { width: 1.8, color: '#5c4b22' });
        api.gongbiShade(2, '仙鹤三白罩染身羽', crBody, { color: '#fcfaf3', colorEnd: '#ded6c6', alpha: 0.90, blend: 'source-over' });
        api.gongbiShade(3, '乌黑颈带与飞羽尾端', [[565, 635], [675, 725], [645, 785], [545, 745]], { color: '#171514', colorEnd: '#3b3733', alpha: 0.92 });
        api.gongbiSilkHair(4, '翼羽细密丝毛法', 540, 680, 0.55, { count: 28, len: 88, spread: 0.45, color: '#221f1c', width: 1.25, fanWidth: 32 });
        api.gongbiSilkHair(4, '胸脯雪白丝毛', 475, 665, 1.3, { count: 22, len: 55, spread: 0.5, color: '#fbf8f0', width: 1.4, fanWidth: 28 });
        // Vermilion red crown
        api.inkDot(5, '仙鹤朱砂丹顶', 442, 378, 12, 7, { color: '#c8261c', alpha: 0.96, blend: 'source-over' });
        api.inkDot(5, '点眼凝神', 456, 388, 3.0, 3.0, { color: '#0d0b0a', alpha: 0.98 });
        api.inscription(5, '题款：松鹤延年', 825, 155, '松鹤延年', { size: 32, stepY: 42 });
        api.seal(5, '朱印：长寿', 825, 360, '长寿', { size: 40 });
      }
    },
    {
      id: 'gongbi-magpie-plum',
      title: '工笔·喜上眉梢',
      subtitle: '宋人小品构图：工笔白梅双勾点粉 → 青墨丝毛画喜鹊 → 细笔点爪凝睛',
      group: '国画·工笔',
      category: '工笔花鸟',
      seal: '宋人花鸟',
      mode: 'gongbi',
      width: 960,
      height: 1180,
      seed: 1004,
      swatches: ['rgb(235, 224, 200)', 'rgb(28, 34, 48)', 'rgb(252, 248, 240)', 'rgb(198, 52, 72)', 'rgb(230, 188, 86)'],
      desc: '冷青墨喜鹊立于老梅虬枝之上，头颈与翼梢施以石青丝毛法，周围梅花双勾填白与微红分染，清雅吉利。',
      layers: GONGBI_LAYERS,
      buildStrokes(api) {
        api.gongbiLine(1, '古梅铁线曲枝', [[120, 980], [340, 795], [565, 625], [810, 440]], { width: 2.8, color: '#30251c' });
        api.gongbiLine(1, '分叉挺梅梢', [[420, 725], [320, 520], [260, 340]], { width: 2.0, color: '#30251c' });
        api.gongbiShade(2, '梅干赭墨晕染', [[120, 980], [565, 625], [810, 440], [800, 458], [550, 646], [130, 1005]], {
          color: '#4f3b2b', colorEnd: '#2e2219', alpha: 0.78
        });
        gongbiFlower(api, 1, 2, 5, 275, 365, 52, 5, '#e895a3', '#fcf8f2', '工笔粉白梅一');
        gongbiFlower(api, 1, 2, 5, 350, 515, 48, 5, '#d8667a', '#fcf8f2', '工笔红梅二');
        gongbiFlower(api, 1, 2, 5, 765, 465, 52, 5, '#d8667a', '#fcf8f2', '工笔红梅三');
        gongbiFlower(api, 1, 2, 5, 690, 525, 44, 5, '#e68c9a', '#fcf8f2', '工笔梅四');
        // Magpie perched cleanly around (540, 550)
        const mBody = [[495, 535], [560, 495], [625, 525], [608, 595], [530, 608], [485, 570]];
        api.gongbiLine(1, '喜鹊头背工笔双勾', [...mBody, mBody[0]], { width: 1.9, color: '#1b1a1e' });
        api.gongbiLine(1, '喜鹊长尾双羽', [[602, 582], [755, 735], [778, 720], [622, 565]], { width: 1.8, closed: true });
        api.gongbiLine(1, '喜鹊短喙', [[498, 535], [452, 525], [496, 548]], { width: 1.7, color: '#141316' });
        api.gongbiShade(2, '喜鹊乌黑墨羽铺底', mBody, { color: '#181a24', colorEnd: '#2a3448', alpha: 0.90, blend: 'source-over' });
        api.gongbiShade(3, '尾羽石青晕染', [[602, 582], [755, 735], [778, 720], [622, 565]], { color: '#19355c', colorEnd: '#141720', alpha: 0.90 });
        api.gongbiShade(3, '胸腹与肩白羽区', [[525, 555], [595, 578], [575, 610], [515, 592]], { color: '#fbf8f0', alpha: 0.94, blend: 'source-over' });
        api.gongbiSilkHair(4, '头颈翼梢丝毛细羽', 555, 520, 0.4, { count: 24, len: 48, spread: 0.45, color: '#2a466b', width: 1.2, fanWidth: 26 });
        api.gongbiLine(4, '双足紧握梅枝', [[545, 604], [548, 635]], { width: 2.2, color: '#1d1916' });
        api.gongbiGold(5, '点眼高光', 514, 535, { r: 2.8, color: '#faf6ee' });
        api.inkDot(5, '点眼仁', 513, 535, 2.2, 2.2, { color: '#080707' });
        api.inscription(5, '题画：喜上眉梢', 150, 145, '喜上眉梢', { size: 32, stepY: 42 });
        api.seal(5, '朱印：春喜', 150, 355, '春喜', { size: 40 });
      }
    },
    {
      id: 'gongbi-pheasant-rock',
      title: '工笔·锦鸡太湖石',
      subtitle: '院体花鸟风范：勾勒瘦漏皱透太湖石 → 金黄朱红丝毛绘锦鸡 → 配双勾茶花',
      group: '国画·工笔',
      category: '工笔花鸟',
      seal: '院体工笔',
      mode: 'gongbi',
      width: 960,
      height: 1200,
      seed: 1005,
      swatches: ['rgb(235, 224, 200)', 'rgb(218, 166, 44)', 'rgb(198, 44, 34)', 'rgb(28, 78, 118)', 'rgb(96, 90, 82)'],
      desc: '以太湖玲珑奇石为托，金黄冠顶、丹红胸腹、宝蓝肩羽之锦鸡稳立石顶，尾羽流泻近尺，旁缀朱砂山茶花。',
      layers: GONGBI_LAYERS,
      buildStrokes(api) {
        // Slim perforated Taihu garden rock (瘦、漏、皱、透)
        const rock = [[310, 1120], [285, 985], [330, 895], [275, 815], [355, 755], [465, 738], [565, 770], [525, 865], [615, 945], [575, 1105]];
        api.gongbiLine(1, '太湖奇石瘦漏皱透勾勒', [...rock, rock[0]], { width: 2.3, color: '#2b2621' });
        api.gongbiLine(1, '太湖石内部皴纹折叠线', [[355, 760], [395, 845], [370, 965]], { width: 1.6, color: '#453e35' });
        api.gongbiShade(2, '湖石冷灰赭石凹凸分染', rock, { color: '#6b6458', colorEnd: '#c6beae', angle: 0.45, alpha: 0.72 });
        const rockHole = [[410, 865], [455, 845], [478, 882], [442, 912], [405, 892]];
        api.gongbiShade(2, '太湖石孔窍留白透底', rockHole, { color: '#ebe2cc', alpha: 0.96, blend: 'source-over' });
        api.gongbiLine(2, '石洞内壁勾勒', [...rockHole, rockHole[0]], { width: 1.8, color: '#2b2621' });
        // Golden pheasant perched proudly on top at (445, 650)
        const pBody = [[375, 592], [452, 558], [525, 608], [505, 692], [418, 698], [362, 645]];
        api.gongbiLine(1, '锦鸡冠胸双勾', [...pBody, pBody[0]], { width: 1.9, color: '#2b1e16' });
        api.gongbiLine(1, '锦鸡金披肩扇形轮廓', [[395, 598], [458, 615], [475, 642], [412, 638]], { width: 1.5, color: '#4a2b14', closed: true });
        [[518, 642, 745, 965], [524, 652, 785, 1015], [512, 635, 705, 915]].forEach(([x0, y0, x1, y1], ti) => {
          api.gongbiLine(1, `锦鸡长尾舒展主羽 ${ti + 1}`, [[x0, y0], [(x0 + x1) * 0.52 + 12, (y0 + y1) * 0.48], [x1, y1]], {
            width: 2.2 - ti * 0.25, color: '#5c3c1e'
          });
        });
        api.gongbiLine(3, '锦鸡抓石细爪双足', [[445, 695], [448, 738]], { width: 2.4, color: '#3b2919' });
        api.gongbiLine(3, '锦鸡右足支石', [[472, 692], [485, 736]], { width: 2.4, color: '#3b2919' });
        api.gongbiShade(2, '丹红胸腹浓丽晕染', [[368, 615], [468, 625], [492, 695], [398, 688]], { color: '#c42e22', colorEnd: '#e36b32', alpha: 0.90, blend: 'source-over' });
        api.gongbiShade(3, '金黄凤冠与金披领', [[372, 575], [442, 555], [472, 610], [398, 610]], { color: '#e6b235', colorEnd: '#f5dc78', alpha: 0.92, blend: 'source-over' });
        api.gongbiShade(3, '宝蓝翠绿肩翼罩染', [[450, 588], [528, 615], [505, 668], [448, 645]], { color: '#1e588c', colorEnd: '#2e7ca8', alpha: 0.88 });
        api.gongbiSilkHair(4, '胸翼锦绣丝毛法', 442, 645, 0.65, { count: 28, len: 46, spread: 0.44, color: '#f2c15a', width: 1.25, fanWidth: 28 });
        api.gongbiSilkHair(4, '尾羽精细斑纹丝毛', 645, 825, 0.92, { count: 22, len: 92, spread: 0.28, color: '#9c682e', width: 1.3, fanWidth: 18 });
        gongbiFlower(api, 1, 3, 5, 225, 895, 66, 6, '#b82538', '#f09ca8', '石畔朱茶花');
        api.gongbiGold(5, '冠顶泥金提神', 410, 562, { r: 4, color: '#fae082' });
        api.inkDot(5, '点眼', 402, 582, 2.8, 2.8, { color: '#0d0b0a' });
        api.inscription(5, '题画：锦堂春晓', 145, 145, '锦堂春晓', { size: 32, stepY: 42 });
        api.seal(5, '朱印：清芬', 145, 355, '清芬', { size: 40 });
      }
    },
    {
      id: 'gongbi-camellia-whiteeye',
      title: '工笔·山茶绣眼',
      subtitle: '工笔小禽茶花：双勾腊质绿叶红花 → 石青汁绿染绣眼鸟 → 蛤粉点白眼圈',
      group: '国画·工笔',
      category: '工笔花鸟',
      seal: '工笔小品',
      mode: 'gongbi',
      width: 960,
      height: 1120,
      seed: 1006,
      swatches: ['rgb(235, 224, 200)', 'rgb(198, 36, 48)', 'rgb(42, 92, 48)', 'rgb(112, 148, 62)', 'rgb(252, 250, 245)'],
      desc: '鲜红重瓣山茶衬托厚实墨绿革质叶片，一双翠绿小绣眼立枝顾盼，白眼圈用纯白粉精点，生动清雅。',
      layers: GONGBI_LAYERS,
      buildStrokes(api) {
        api.gongbiLine(1, '茶花古枝斜出', [[140, 960], [385, 765], [645, 520], [820, 345]], { width: 2.5, color: '#33281f' });
        gongbiLeaf(api, 1, 2, 395, 725, 138, 52, 2.6, '#1f5432', '#52874c', '左茶叶');
        gongbiLeaf(api, 1, 2, 650, 560, 145, 54, 0.42, '#1f5432', '#52874c', '右茶叶');
        gongbiLeaf(api, 1, 2, 510, 480, 135, 48, -2.1, '#26613a', '#63995b', '上茶叶');
        gongbiFlower(api, 1, 2, 5, 445, 655, 88, 7, '#a81c2c', '#e66370', '朱红茶花一');
        gongbiFlower(api, 1, 2, 5, 615, 465, 76, 6, '#b82538', '#ee7884', '朱红茶花二');
        // Japanese White-eye (绣眼鸟) perched at (530, 330)
        const bPoly = [[495, 315], [545, 285], [602, 315], [585, 368], [520, 376], [485, 345]];
        api.gongbiLine(1, '绣眼小鸟铁线勾勒', [...bPoly, bPoly[0]], { width: 1.7, color: '#262b1c' });
        api.gongbiLine(1, '精致短喙', [[496, 318], [468, 314], [495, 326]], { width: 1.5, color: '#1b1d18' });
        api.gongbiShade(2, '柳绿背羽渲染', bPoly, { color: '#6b943a', colorEnd: '#dfddb8', angle: Math.PI * 0.45, alpha: 0.85, blend: 'source-over' });
        api.gongbiShade(3, '翼梢浓橄榄绿', [[535, 325], [612, 348], [592, 375], [525, 362]], { color: '#395224', colorEnd: '#6b943a', alpha: 0.88 });
        api.gongbiSilkHair(4, '羽绒细丝毛法', 545, 335, 0.35, { count: 20, len: 38, spread: 0.4, color: '#456128', width: 1.15, fanWidth: 20 });
        // Characteristic crisp white eye-ring!
        api.gongbiGold(5, '蛤粉点白绣眼圈', 514, 315, { r: 6.2, color: '#fcfaf3' });
        api.inkDot(5, '墨点黑睛', 514, 315, 3.0, 3.0, { color: '#0d0b0a' });
        api.inscription(5, '题画：春茶绣羽', 815, 145, '春茶绣羽', { size: 32, stepY: 42 });
        api.seal(5, '朱印：春晖', 815, 345, '春晖', { size: 40 });
      }
    },
    {
      id: 'gongbi-willow-cicada',
      title: '工笔·垂柳秋蝉',
      subtitle: '宋人小景工笔：柔毫游丝垂柳条 → 薄翅透纱双勾秋蝉 → 碧绿淡青分染',
      group: '国画·工笔',
      category: '工笔花鸟',
      seal: '宋画小品',
      mode: 'gongbi',
      width: 920,
      height: 1160,
      seed: 1007,
      swatches: ['rgb(235, 224, 200)', 'rgb(64, 112, 62)', 'rgb(96, 82, 58)', 'rgb(42, 34, 26)', 'rgb(198, 178, 128)'],
      desc: '古柳干垂直垂丝数缕，工笔柳叶双勾青绿，树干伏着半透明翅脉清晰可见的工笔秋蝉，禅意清幽。',
      layers: GONGBI_LAYERS,
      buildStrokes(api) {
        api.gongbiLine(1, '虬曲古柳主干左廓线', [[245, 80], [288, 320], [262, 560], [285, 850], [265, 1120]], { width: 2.8, color: '#33281d' });
        api.gongbiLine(1, '古柳分叉右弧皮纹', [[335, 80], [362, 330], [372, 570], [352, 860], [378, 1120]], { width: 2.6, color: '#33281d' });
        api.gongbiLine(1, '古柳斜伸旁枝', [[356, 290], [495, 195], [680, 110]], { width: 2.0, color: '#33281d' });
        api.gongbiShade(2, '老柳苍褐斑驳分染', [[245, 80], [335, 80], [372, 570], [378, 1120], [265, 1120], [262, 560]], { color: '#614d38', colorEnd: '#9e8564', alpha: 0.72 });
        [[465, 80, 520, 760], [565, 80, 625, 860], [665, 80, 735, 790], [745, 120, 815, 720]].forEach(([x1, y1, x2, y2], idx) => {
          api.gongbiLine(1, `风柳长条 ${idx + 1}`, [[x1, y1], [(x1 + x2) * 0.5 + 15, (y1 + y2) * 0.5], [x2, y2]], { width: 1.5, color: '#455732' });
          for (let k = 0; k < 6; k++) {
            const f = (k + 1) / 7;
            gongbiLeaf(api, 1, 2, api.lerp(x1, x2, f), api.lerp(y1, y2, f), 58, 12, 1.35 + (k % 2) * 0.3, '#467a3e', '#9dc278', `柳叶`);
          }
        });
        // Autumn Cicada clinging to trunk around (320, 560)
        const cBody = [[305, 525], [322, 505], [342, 528], [335, 615], [312, 615]];
        api.gongbiLine(1, '秋蝉黑胸躯廓', [...cBody, cBody[0]], { width: 1.8, color: '#211c17' });
        api.gongbiShade(2, '秋蝉黑褐分染', cBody, { color: '#2b241d', colorEnd: '#524436', alpha: 0.88 });
        // Transparent veined wings overlapping downward
        const wL = [[310, 540], [278, 635], [295, 712], [322, 675]];
        const wR = [[338, 540], [372, 635], [352, 712], [325, 675]];
        api.gongbiLine(3, '蝉翼轻纱网脉左翅', [...wL, wL[0]], { width: 1.4, color: '#4a4236' });
        api.gongbiLine(3, '蝉翼轻纱网脉右翅', [...wR, wR[0]], { width: 1.4, color: '#4a4236' });
        api.gongbiShade(3, '蝉翼薄如蝉翼透染', wL, { color: '#f5eedc', colorEnd: '#b8aa88', alpha: 0.42, blend: 'source-over' });
        api.gongbiShade(3, '蝉翼薄纱右翅', wR, { color: '#f5eedc', colorEnd: '#b8aa88', alpha: 0.42, blend: 'source-over' });
        api.gongbiSilkHair(4, '柳干枯皮竖丝纹', 318, 280, 1.57, { count: 16, len: 180, spread: 0.04, color: '#3b2e21', width: 1.1, fanWidth: 42 });
        api.gongbiGold(5, '蝉翅金色叶脉与眼点', [[310, 545], [295, 645], [302, 695]], { width: 1.1, color: '#d8be74' });
        api.inscription(5, '题画：高枝清响', 780, 165, '高枝清响', { size: 32, stepY: 42 });
        api.seal(5, '朱印：清秋', 780, 365, '清秋', { size: 40 });
      }
    },
    {
      id: 'gongbi-orchid-butterfly',
      title: '工笔·幽兰粉蝶',
      subtitle: '清雅工笔草虫：双勾长剑兰叶统染汁绿 → 粉蝶淡黄分染 → 紫心兰花提白点蕊',
      group: '国画·工笔',
      category: '工笔花鸟',
      seal: '工笔草虫',
      mode: 'gongbi',
      width: 920,
      height: 1180,
      seed: 1008,
      swatches: ['rgb(235, 224, 200)', 'rgb(62, 114, 58)', 'rgb(162, 64, 96)', 'rgb(248, 240, 212)', 'rgb(212, 184, 78)'],
      desc: '挺拔双勾兰叶交错破“凤眼”，白绿幽兰花朵紫斑点心，引一双工笔淡黄粉蝶轻翩其上，清芬自远。',
      layers: GONGBI_LAYERS,
      buildStrokes(api) {
        [
          [[280, 1080], [320, 740], [460, 420], [580, 260]],
          [[310, 1080], [365, 690], [260, 420], [175, 250]],
          [[340, 1080], [450, 780], [645, 580], [790, 460]],
          [[295, 1080], [220, 810], [160, 620], [125, 520]]
        ].forEach((pts, idx) => {
          api.gongbiLine(1, `兰叶双勾剑叶 ${idx + 1}`, pts, { width: 1.8, color: '#24301d', style: 'yousi' });
          const offsetPts = pts.map(([x, y]) => [x + 16, y + 6]);
          api.gongbiLine(1, `兰叶副线 ${idx + 1}`, offsetPts, { width: 1.8, color: '#24301d', style: 'yousi' });
          api.gongbiShade(2, `兰叶汁绿罩染 ${idx + 1}`, [...pts, ...offsetPts.slice().reverse()], {
            color: '#2e6638', colorEnd: '#88b36f', alpha: 0.78
          });
        });
        api.gongbiLine(1, '兰草主花箭梗', [[325, 1080], [420, 680], [495, 420]], { width: 2.0, color: '#3b4e29' });
        gongbiFlower(api, 1, 2, 5, 495, 420, 56, 5, '#8c3568', '#ece8cf', '素心兰主花');
        gongbiFlower(api, 1, 2, 5, 435, 560, 50, 5, '#8c3568', '#ece8cf', '素心兰次花');
        // White & gold butterfly
        api.gongbiLine(1, '粉蝶翅廓细勾', [[585, 295], [645, 235], [685, 285], [640, 330]], { width: 1.6, closed: true });
        api.gongbiShade(3, '粉蝶米白黄粉染', [[585, 295], [645, 235], [685, 285], [640, 330]], {
          color: '#f8f3dc', colorEnd: '#e3c868', alpha: 0.88, blend: 'source-over'
        });
        api.gongbiSilkHair(4, '兰根坡苔丝草', 310, 1085, -1.57, { count: 24, len: 55, spread: 0.9, color: '#2e3b24', width: 1.3, fanWidth: 95 });
        api.gongbiGold(5, '兰心泥金提白', 495, 420, { r: 4, color: '#f7e694' });
        api.inscription(5, '题画：空谷幽芳', 145, 145, '空谷幽芳', { size: 32, stepY: 42 });
        api.seal(5, '朱印：幽兰', 145, 355, '幽兰', { size: 40 });
      }
    },
    {
      id: 'gongbi-court-lady',
      title: '工笔·执扇仕女',
      subtitle: '经典工笔仕女图：游丝描开脸垂髻 → 三白分染粉面 → 织锦齐胸襦裙罩染 → 沥粉金钗团扇',
      group: '国画·工笔',
      category: '工笔人物',
      seal: '工笔仕女',
      mode: 'gongbi',
      width: 920,
      height: 1200,
      seed: 1009,
      swatches: ['rgb(235, 224, 200)', 'rgb(245, 225, 212)', 'rgb(198, 62, 54)', 'rgb(74, 134, 122)', 'rgb(228, 186, 82)'],
      desc: '传统工笔仕女亭亭立姿，云鬓金步摇、轻纱团扇掩胸前，衣袂游丝细线长流，施朱粉三白开脸清秀雅致。',
      layers: GONGBI_LAYERS,
      buildStrokes(api) {
        // Face & graceful Tang/Song chignon outline
        const face = [[418, 255], [412, 298], [435, 342], [468, 352], [496, 336], [505, 295], [496, 252]];
        const hair = [[406, 275], [392, 225], [432, 182], [488, 182], [522, 225], [512, 278], [488, 255], [435, 252]];
        api.gongbiLine(1, '仕女开脸轮廓（游丝描）', [...face, face[0]], { width: 1.7, color: '#3b241c', style: 'yousi' });
        api.gongbiLine(1, '远山蛾眉', [[424, 282], [438, 277], [449, 281]], { width: 1.6, color: '#241a15' });
        api.gongbiLine(1, '右蛾眉', [[468, 280], [482, 276], [496, 281]], { width: 1.6, color: '#241a15' });
        api.gongbiLine(1, '丹凤眼目', [[428, 296], [440, 299], [450, 295]], { width: 1.5, color: '#1b1410' });
        api.gongbiLine(1, '右目神采', [[469, 295], [481, 299], [493, 295]], { width: 1.5, color: '#1b1410' });
        api.gongbiLine(1, '鼻梁樱唇', [[456, 294], [453, 314], [462, 316]], { width: 1.3, color: '#5c3b2e' });
        api.gongbiLine(1, '云鬓发髻外廓', [...hair, hair[0]], { width: 1.9, color: '#1b1714' });
        // Flowing silk gown robes
        const upperRobe = [[425, 368], [345, 425], [335, 595], [575, 595], [568, 425], [495, 368]];
        const skirt = [[355, 585], [295, 865], [275, 1085], [645, 1085], [615, 865], [565, 585]];
        api.gongbiLine(1, '对襟纱衫双勾', [...upperRobe, upperRobe[0]], { width: 1.8, color: '#2b241e', style: 'yousi' });
        api.gongbiLine(1, '齐胸拖地长裙轮廓', [...skirt, skirt[0]], { width: 1.9, color: '#381e1a', style: 'yousi' });
        api.gongbiLine(1, '修长衣褶垂线', [[415, 610], [392, 850], [375, 1075]], { width: 1.5, color: '#52221c' });
        api.gongbiLine(1, '修长衣褶垂线', [[495, 610], [515, 850], [532, 1075]], { width: 1.5, color: '#52221c' });
        // Silk scarf & round embroidered fan
        api.gongbiLine(1, '轻盈披帛飘带', [[355, 415], [245, 585], [260, 820], [320, 960]], { width: 1.6, color: '#2b4f4a' });
        api.gongbiLine(1, '手里执圆团扇', [[465, 515], [412, 465], [420, 395], [495, 395], [515, 465], [465, 515]], { width: 1.7, color: '#5e492e', closed: true });
        // Shading passes
        api.gongbiShade(2, '粉面淡赭红润染', face, { color: '#f7d8c8', colorEnd: '#faece2', alpha: 0.88, blend: 'source-over' });
        api.gongbiShade(2, '腮红“三白”点染', [[416, 304], [442, 304], [438, 325], [418, 322]], { color: '#e6787e', colorEnd: '#faece2', radial: true, alpha: 0.35 });
        api.gongbiShade(2, '乌黑高髻晕染', hair, { color: '#181514', colorEnd: '#2e2926', alpha: 0.94, blend: 'source-over' });
        api.gongbiShade(3, '月白石绿上衫罩染', upperRobe, { color: '#6ba398', colorEnd: '#d8e6de', alpha: 0.72 });
        api.gongbiShade(3, '朱红石榴长裙晕染', skirt, { color: '#bd332b', colorEnd: '#7a1916', angle: Math.PI * 0.5, alpha: 0.80 });
        api.gongbiShade(3, '泥金绢面团扇染', [[420, 395], [495, 395], [515, 465], [465, 515], [412, 465]], { color: '#f5e7c2', alpha: 0.85, blend: 'source-over' });
        // Silk hair strands + gold hairpins + cinnabar lips
        api.gongbiSilkHair(4, '云鬓发丝千缕', 458, 220, -1.5, { count: 24, len: 42, spread: 1.1, color: '#110e0c', width: 1.1, fanWidth: 68 });
        api.gongbiGold(5, '沥粉金色步摇花钗', [[435, 198], [412, 165]], { width: 2.2, color: '#f2ce66' });
        api.gongbiGold(5, '金钗顶珠', 412, 162, { r: 4.2, color: '#fae28a' });
        api.gongbiGold(5, '金钗右侧步摇', [[492, 202], [518, 172]], { width: 2.2, color: '#f2ce66' });
        api.inkDot(5, '点绛朱唇', 458, 330, 7, 3.8, { color: '#bf262a', alpha: 0.94, blend: 'source-over' });
        api.inscription(5, '题画：清秋纨扇', 145, 145, '清秋纨扇', { size: 32, stepY: 42 });
        api.seal(5, '朱印：佳人', 145, 355, '佳人', { size: 40 });
      }
    },
    {
      id: 'gongbi-gold-green-hills',
      title: '工笔·金碧青绿重彩',
      subtitle: '盛唐金碧山水法度：铁线勾勒危峰 → 三青三绿重彩 → 泥金勾山脊水纹点神',
      group: '国画·工笔',
      category: '工笔山水',
      seal: '金碧重彩',
      mode: 'gongbi',
      width: 1200,
      height: 820,
      seed: 1010,
      swatches: ['rgb(235, 224, 200)', 'rgb(28, 72, 138)', 'rgb(42, 128, 86)', 'rgb(218, 172, 62)', 'rgb(192, 54, 38)'],
      desc: '仿李思训金碧山水，山骨铁线重重，头绿、石青、朱砂楼阁重彩敷染后以纯泥金沿山脊勾亮，金碧辉煌。',
      layers: GONGBI_LAYERS,
      buildStrokes(api) {
        const backPeak = [[120, 395], [260, 265], [410, 215], [560, 295], [735, 195], [895, 155], [1065, 285], [1165, 395]];
        const midCliff = [[45, 510], [180, 395], [320, 345], [475, 435], [645, 365], [810, 295], [965, 395], [1145, 510]];
        const foreLeft = [[20, 800], [65, 625], [195, 575], [325, 635], [395, 795]];
        api.gongbiLine(1, '重彩远山铁线轮廓', backPeak, { width: 2.0, color: '#2b241d' });
        api.gongbiLine(1, '中景奇峰石廓线', midCliff, { width: 2.2, color: '#26201a' });
        api.gongbiLine(1, '近岩亭台山壁线', foreLeft, { width: 2.4, color: '#211c17' });
        // Red palace pavilion perched on left cliff
        api.gongbiLine(1, '朱红飞檐楼阁勾线', [[165, 575], [165, 525], [145, 525], [205, 485], [265, 525], [245, 525], [245, 575]], { width: 1.8, color: '#6b1d18', closed: true });
        api.gongbiShade(2, '群青头青远峰染', [...backPeak, [1165, 430], [120, 430]], { color: '#1b498c', colorEnd: '#5287b8', alpha: 0.78 });
        api.gongbiShade(3, '头绿二绿中峰重彩', [...midCliff, [1145, 540], [45, 540]], { color: '#1f704c', colorEnd: '#78b076', alpha: 0.80 });
        api.gongbiShade(3, '近岩赭石石绿混染', [...foreLeft, [20, 800]], { color: '#296e4b', colorEnd: '#b8763e', alpha: 0.78 });
        // Silk cloud bands obscuring mountain feet softly (唐代祥云留白)
        [[260, 430, 210, 22], [720, 430, 250, 22], [440, 538, 280, 24], [890, 538, 220, 24]].forEach(([cx, cy, rx, ry]) => {
          api.inkBlob(4, '山腰工笔瑞云祥岚留白', cx, cy, rx, ry, 0, {
            color: '#ebe0c6', rimColor: '#ebe0c6', alpha: 0.90, count: 16, bleed: 0.65, blend: 'source-over'
          });
        });
        api.gongbiShade(3, '朱红阁楼敷彩', [[165, 575], [165, 525], [145, 525], [205, 485], [265, 525], [245, 525], [245, 575]], { color: '#c43225', alpha: 0.90, blend: 'source-over' });
        api.gongbiSilkHair(4, '近松细密松针簇', 110, 580, -1.57, { count: 24, len: 52, spread: 1.3, color: '#184a31', width: 1.3, fanWidth: 28 });
        // Iconic Imperial Gold-Outline Highlights (泥金勾山轮廓)
        api.gongbiGold(5, '泥金勾远山阳面金线', [[260, 265], [410, 215], [735, 195], [895, 155]], { width: 2.2, color: '#ecd072' });
        api.gongbiGold(5, '泥金勾中峦脊背', [[180, 395], [320, 345], [645, 365], [810, 295]], { width: 2.2, color: '#ecd072' });
        api.gongbiGold(5, '水纹金丝线', [[460, 620], [640, 625], [820, 615]], { width: 1.4, color: '#d4b458' });
        api.inscription(5, '题画：金碧千秋', 88, 105, '金碧千秋', { size: 32, stepY: 42 });
        api.seal(5, '朱印：重彩', 88, 305, '重彩', { size: 40 });
      }
    }
  ];

  window.Code2PaintCatalog.addPack(WORKS);
})();
