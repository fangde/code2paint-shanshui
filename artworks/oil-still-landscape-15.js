(function () {
  'use strict';

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

  function paintBackdrop(api, w, h, cTop, cMid, cBot) {
    for (let y = -10; y <= h + 40; y += 44) {
      const f = Math.max(0, Math.min(1, y / h));
      const col = f < 0.5
        ? [api.lerp(cTop[0], cMid[0], f * 2), api.lerp(cTop[1], cMid[1], f * 2), api.lerp(cTop[2], cMid[2], f * 2)]
        : [api.lerp(cMid[0], cBot[0], (f - 0.5) * 2), api.lerp(cMid[1], cBot[1], (f - 0.5) * 2), api.lerp(cMid[2], cBot[2], (f - 0.5) * 2)];
      api.oilStroke(1, '无缝油画大背景铺涂', [[-60, y], [w * 0.5, y + 6], [w + 60, y - 6]], {
        width: 118, stretch: 0.78, fade: 0.02, color: col, colorEnd: col, alpha: 0.48, vary: 4, bristle: 0.28
      });
    }
  }

  function paintTableBand(api, w, h, yTop, cTop, cBot) {
    for (let y = yTop; y <= h + 40; y += 42) {
      const t = Math.min(1, (y - yTop) / Math.max(1, h - yTop));
      const col = [api.lerp(cTop[0], cBot[0], t), api.lerp(cTop[1], cBot[1], t), api.lerp(cTop[2], cBot[2], t)];
      api.oilStroke(1, '木案台面横笔平铺', [[-60, y], [w * 0.5, y - 4], [w + 60, y + 4]], {
        width: 110, stretch: 0.78, fade: 0.02, color: col, colorEnd: col, alpha: 0.52, vary: 4, bristle: 0.32
      });
    }
  }

  function paintSunflowerHead(api, layer, cx, cy, rOuter, petalCount, rotBias) {
    for (let i = 0; i < petalCount; i++) {
      const ang = (i / petalCount) * Math.PI * 2 + rotBias + (api.rand() - 0.5) * 0.08;
      const len = rOuter * (0.86 + api.rand() * 0.24);
      const x1 = cx + Math.cos(ang) * (rOuter * 0.34);
      const y1 = cy + Math.sin(ang) * (rOuter * 0.34);
      const x2 = cx + Math.cos(ang + 0.06) * (len * 0.74);
      const y2 = cy + Math.sin(ang + 0.06) * (len * 0.74);
      const x3 = cx + Math.cos(ang) * len;
      const y3 = cy + Math.sin(ang) * len;
      const col = i % 3 === 0 ? [246, 198, 42] : (i % 3 === 1 ? [226, 154, 24] : [252, 222, 76]);
      api.oilStroke(layer, '向日葵旋转厚涂花瓣', [[x1, y1], [x2, y2], [x3, y3]], {
        width: rOuter * 0.22, color: col, colorEnd: [255, 234, 112], alpha: 0.82, stretch: 0.38, vary: 8
      });
    }
    api.oilPatch(layer, '向日葵绒心褐底', cx, cy, rOuter * 0.40, rOuter * 0.39, 0, {
      color: [72, 42, 18], colorEdge: [112, 68, 22], alpha: 0.86, count: 16
    });
    for (let k = 0; k < 28; k++) {
      const a = k * 2.39996, rad = Math.sqrt(k / 28) * rOuter * 0.36;
      const sx = cx + Math.cos(a) * rad, sy = cy + Math.sin(a) * rad;
      api.oilHighlight(layer + 1, '花盘螺旋籽粒高光点', sx, sy, 3.6, 3.2, a, {
        color: k % 4 === 0 ? [224, 168, 52] : [36, 20, 10], alpha: 0.88, count: 2
      });
    }
  }

  const WORKS = [
    // =========================================================================
    // STILL LIFES (5)
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
        paintBackdrop(api, 920, 1120, [218, 196, 104], [228, 204, 118], [186, 152, 74]);
        paintTableBand(api, 920, 1120, 775, [202, 162, 78], [164, 122, 54]);
        // Tabletop horizon line & shadow under ceramic vase
        api.oilStroke(2, '桌壁分界水平重笔', [[80, 775], [460, 777], [840, 774]], { width: 8, color: [112, 82, 34], alpha: 0.72 });
        api.oilPatch(2, '陶瓶右下侧柔褐投影', 530, 882, 125, 36, 0.08, { color: [72, 48, 20], alpha: 0.62, count: 14 });
        // Stems & green leaves behind blooms
        [[460, 560, 320, 290], [460, 560, 480, 210], [460, 560, 650, 320], [460, 560, 250, 455], [460, 560, 620, 480]].forEach(([x0, y0, x1, y1]) => {
          api.oilStroke(2, '绿梗穿插花颈', [[x0, y0], [(x0 + x1) * 0.5, (y0 + y1) * 0.5], [x1, y1]], {
            width: 13, color: [72, 104, 48], colorEnd: [106, 144, 62], alpha: 0.85
          });
        });
        [[280, 500], [645, 515], [350, 375], [585, 370]].forEach(([lx, ly]) => {
          api.oilPatch(2, '葵叶冷暖厚涂铺色', lx, ly, 42, 22, api.randRange(-0.7, 0.7), { color: [74, 108, 44], colorEdge: [122, 152, 62], alpha: 0.78, count: 10 });
        });
        // Iconic two-tone earthen pot
        api.oilPatch(2, '陶瓶下半部赤褐釉底', 462, 760, 108, 120, 0, { color: [168, 104, 44], colorEdge: [112, 62, 24], alpha: 0.88, count: 22 });
        api.oilPatch(3, '陶瓶上半部鹅黄釉面', 462, 646, 98, 72, 0, { color: [232, 208, 112], colorEdge: [184, 148, 68], alpha: 0.88, count: 18 });
        api.oilStroke(3, '瓶腰分界钴蓝细饰线', [[364, 696], [462, 704], [560, 696]], { width: 8, color: [52, 92, 128], alpha: 0.78 });
        // Sunflowers ensemble
        const heads = [
          [465, 210, 92, 22], [315, 295, 86, 20], [620, 315, 84, 20],
          [245, 448, 78, 18], [415, 398, 96, 24], [565, 430, 88, 22],
          [675, 482, 72, 18], [348, 520, 74, 18]
        ];
        heads.forEach(([x, y, r, n], idx) => paintSunflowerHead(api, 3, x, y, r, n, idx * 0.45));
        // Vase impasto rim & tabletop scattered petals
        api.oilHighlight(4, '陶瓶左受光面厚涂高光', 392, 650, 14, 52, -0.08, { color: [255, 248, 212], alpha: 0.82, count: 6 });
        api.oilHighlight(4, '瓶腹左下冷灰反光', 525, 785, 16, 46, 0.12, { color: [198, 178, 134], alpha: 0.42, count: 5 });
        api.oilStroke(4, '桌面落瓣金黄点彩', [[270, 868], [295, 874]], { width: 14, color: [248, 202, 46], alpha: 0.90 });
        api.oilStroke(4, '右桌散落花瓣一笔', [[625, 848], [648, 856]], { width: 12, color: [238, 182, 34], alpha: 0.88 });
      }
    },
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
        paintBackdrop(api, 920, 1120, [34, 38, 40], [48, 52, 54], [26, 28, 30]);
        paintTableBand(api, 920, 1120, 795, [86, 74, 62], [44, 36, 30]);
        api.oilPatch(2, '锡瓶投影暗赭延伸', 540, 872, 135, 32, 0.05, { color: [24, 18, 14], alpha: 0.74, count: 14 });
        // Pewter / glass-silver pitcher
        api.oilPatch(2, '锡银花瓶暗银基调', 455, 725, 92, 136, 0, { color: [104, 110, 112], colorEdge: [42, 46, 48], alpha: 0.88, count: 24 });
        api.oilStroke(2, '壶柄优美弧线勾勒', [[538, 635], [588, 675], [575, 765], [528, 795]], { width: 16, color: [132, 136, 134], colorEnd: [64, 68, 66], alpha: 0.88 });
        // Dark foliage spray
        for (let i = 0; i < 16; i++) {
          const ang = -Math.PI * 0.85 + (i / 15) * Math.PI * 0.72;
          const dist = 160 + api.rand() * 145;
          const lx = 460 + Math.cos(ang) * dist, ly = 530 + Math.sin(ang) * dist * 0.85;
          api.oilPatch(2, '玫瑰暗绿叶片群烘托', lx, ly, 42, 22, ang, { color: [52, 74, 46], colorEdge: [28, 42, 26], alpha: 0.82, count: 8 });
        }
        // Layered cream-white roses
        const blooms = [
          { x: 455, y: 375, r: 84, core: [232, 186, 168] },
          { x: 332, y: 455, r: 70, core: [236, 206, 184] },
          { x: 565, y: 445, r: 72, core: [228, 178, 162] },
          { x: 420, y: 508, r: 66, core: [240, 222, 198] },
          { x: 505, y: 292, r: 54, core: [238, 174, 168] }
        ];
        blooms.forEach(b => {
          api.oilPatch(3, '白玫瑰外瓣冷灰暗面', b.x + 8, b.y + 8, b.r, b.r * 0.92, 0, { color: [176, 174, 168], colorEdge: [122, 124, 118], alpha: 0.84, count: 16 });
          for (let ring = 3; ring >= 1; ring--) {
            const rad = b.r * (ring / 3.2), cnt = 5 + ring * 2;
            for (let p = 0; p < cnt; p++) {
              const a = (p / cnt) * Math.PI * 2 + ring * 0.4;
              const p1 = [b.x + Math.cos(a - 0.3) * rad * 0.85, b.y + Math.sin(a - 0.3) * rad * 0.85];
              const p2 = [b.x + Math.cos(a + 0.3) * rad * 0.95, b.y + Math.sin(a + 0.3) * rad * 0.95];
              const isLight = Math.cos(a + 0.8) > 0;
              const col = isLight ? [250, 246, 236] : [214, 212, 204];
              api.oilStroke(3, '玫瑰弧形包卷花瓣', [p1, p2], { width: 22 - ring * 2, color: col, colorEnd: b.core, alpha: 0.78 });
            }
          }
          api.oilPatch(3, '花心暖粉乳白过渡', b.x, b.y, b.r * 0.32, b.r * 0.28, 0, { color: b.core, colorEdge: [248, 242, 228], alpha: 0.76, count: 8 });
        });
        api.oilHighlight(4, '白玫瑰受光瓣尖钛白', 428, 342, 22, 14, -0.3, { color: [255, 253, 248], alpha: 0.92, count: 5 });
        api.oilHighlight(4, '白玫瑰二号主亮部', 312, 434, 16, 12, 0.2, { color: [255, 252, 244], alpha: 0.88, count: 4 });
        api.oilHighlight(4, '锡瓶瓶腹竖条冷白反光', 392, 720, 12, 68, -0.05, { color: [236, 242, 244], alpha: 0.86, count: 5 });
        api.oilHighlight(4, '桌面落花瓣柔亮点', 310, 875, 16, 8, -0.2, { color: [248, 242, 226], alpha: 0.76, count: 3 });
      }
    },
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
        paintBackdrop(api, 1000, 820, [46, 50, 44], [58, 62, 54], [32, 34, 30]);
        paintTableBand(api, 1000, 820, 520, [108, 82, 54], [62, 44, 28]);
        // Draped cobalt-slate tablecloth
        api.oilPatch(2, '钴蓝衬布斜铺皱褶', 560, 620, 340, 155, -0.08, { color: [52, 76, 112], colorEdge: [28, 42, 68], alpha: 0.88, count: 32 });
        [[300, 560, 410, 695], [640, 530, 760, 675], [470, 645, 595, 760]].forEach(([x0, y0, x1, y1]) => {
          api.oilStroke(2, '衬布布纹受光脊线', [[x0, y0], [(x0 + x1) * 0.5, (y0 + y1) * 0.5 + 14], [x1, y1]], {
            width: 32, color: [96, 128, 168], colorEnd: [48, 68, 102], alpha: 0.65
          });
        });
        // Ceramic shallow bowl
        api.oilPatch(2, '果盘投影稳托于布上', 530, 588, 165, 42, 0.04, { color: [22, 26, 36], alpha: 0.72, count: 16 });
        api.oilPatch(2, '白瓷宽碗碗腹冷灰面', 495, 535, 148, 56, 0, { color: [208, 206, 198], colorEdge: [118, 126, 134], alpha: 0.90, count: 24 });
        api.oilStroke(3, '白瓷碗口椭圆弧线', [[346, 508], [495, 542], [644, 508]], { width: 12, color: [242, 240, 232], alpha: 0.88 });
        // Two green-gold pears (one upright beside bowl, one inside/foreground)
        const paintPear = (cx, cy, sc, tilted) => {
          api.oilPatch(3, '西洋梨梨腹橄榄绿体面', cx, cy, 56 * sc, 60 * sc, tilted, { color: [132, 162, 54], colorEdge: [62, 82, 28], alpha: 0.90, count: 20 });
          api.oilPatch(3, '西洋梨梨颈窄弧延伸', cx + Math.sin(tilted) * 32 * sc, cy - 68 * sc, 34 * sc, 48 * sc, tilted * 0.8, { color: [158, 182, 62], colorEdge: [76, 98, 34], alpha: 0.88, count: 14 });
          api.oilPatch(3, '西洋梨受光金黄颊部', cx - 18 * sc, cy - 6 * sc, 34 * sc, 38 * sc, 0, { color: [224, 204, 72], alpha: 0.62, count: 12 });
          api.oilStroke(3, '褐木果蒂短折', [[cx + Math.sin(tilted) * 44 * sc, cy - 110 * sc], [cx + Math.sin(tilted) * 52 * sc + 8, cy - 134 * sc]], {
            width: 8, color: [78, 48, 24], alpha: 0.92
          });
          api.oilHighlight(4, '梨身蜡质釉光一点', cx - 22 * sc, cy - 12 * sc, 10 * sc, 16 * sc, -0.3, { color: [255, 250, 204], alpha: 0.88, count: 4 });
        };
        paintPear(465, 468, 1.02, 0.12);
        paintPear(282, 558, 0.96, -0.38);
        api.oilHighlight(4, '白瓷碗沿釉面瓷光', 415, 530, 32, 7, 0.12, { color: [255, 254, 248], alpha: 0.94, count: 5 });
        api.oilHighlight(4, '蓝衬布近前景边缘提亮', 640, 625, 28, 10, 0.4, { color: [152, 182, 214], alpha: 0.65, count: 5 });
      }
    },
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
        paintBackdrop(api, 1000, 820, [20, 18, 14], [28, 24, 18], [16, 14, 10]);
        paintTableBand(api, 1000, 820, 520, [74, 52, 34], [38, 26, 16]);
        // Dark green wine bottle
        api.oilPatch(2, '酒瓶深沉斜影', 450, 565, 118, 28, 0.08, { color: [12, 10, 8], alpha: 0.80, count: 14 });
        api.oilPatch(2, '墨绿酒瓶圆柱瓶身', 355, 425, 58, 138, 0, { color: [38, 62, 32], colorEdge: [14, 24, 12], alpha: 0.92, count: 24 });
        api.oilStroke(2, '细长瓶颈起势', [[355, 188], [355, 315]], { width: 34, color: [34, 54, 28], colorEnd: [44, 68, 34], alpha: 0.92 });
        api.oilStroke(3, '瓶颈红蜡封口', [[355, 178], [355, 206]], { width: 36, color: [132, 32, 28], alpha: 0.90 });
        api.oilPatch(3, '米白做旧酒标斜贴', 355, 430, 38, 44, 0, { color: [222, 208, 176], colorEdge: [152, 138, 108], alpha: 0.88, count: 12 });
        // Rustic crusty loaf & grapes cluster
        api.oilPatch(3, '乡村脆皮面包大色', 620, 525, 128, 64, -0.06, { color: [188, 126, 56], colorEdge: [104, 56, 22], alpha: 0.90, count: 24 });
        for (let i = 0; i < 4; i++) {
          api.oilStroke(3, '面包顶部割纹焦脆面', [[535 + i * 44, 480], [562 + i * 44, 514]], { width: 12, color: [232, 188, 118], colorEnd: [122, 68, 28], alpha: 0.85 });
        }
        // Wine glass half-filled with ruby burgundy
        api.oilPatch(3, '酒杯微光透底', 485, 425, 44, 46, 0, { color: [72, 68, 62], alpha: 0.42, count: 10 });
        api.oilPatch(3, '紫红宝石葡萄酒液', 485, 444, 38, 24, 0, { color: [138, 20, 28], colorEdge: [62, 10, 14], alpha: 0.90, count: 12 });
        api.oilStroke(3, '细高脚玻璃杯梗', [[485, 466], [485, 558]], { width: 7, color: [184, 188, 192], alpha: 0.72 });
        api.oilPatch(3, '玻璃杯圆底高光', 485, 560, 36, 10, 0, { color: [162, 166, 170], alpha: 0.64, count: 6 });
        api.oilHighlight(4, '酒瓶左肩冷天光垂直高光', 318, 365, 8, 92, 0, { color: [224, 236, 228], alpha: 0.88, count: 6 });
        api.oilHighlight(4, '酒杯边缘与酒面微光', 456, 405, 6, 30, -0.1, { color: [255, 252, 246], alpha: 0.94, count: 4 });
        api.oilHighlight(4, '酒液内部宝石红透亮反光', 494, 448, 12, 7, 0.2, { color: [244, 76, 68], alpha: 0.86, count: 3 });
        api.oilHighlight(4, '面包脆皮金粟酥点', 605, 486, 26, 14, -0.1, { color: [248, 218, 148], alpha: 0.72, count: 6 });
      }
    },
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
        paintBackdrop(api, 920, 1120, [142, 158, 168], [164, 178, 184], [126, 138, 146]);
        paintTableBand(api, 920, 1120, 790, [186, 168, 138], [142, 124, 98]);
        // Vase + shadow
        api.oilPatch(2, '瓷瓶柔灰投影', 520, 882, 115, 28, 0.05, { color: [88, 76, 62], alpha: 0.64, count: 12 });
        api.oilPatch(2, '青花白底瓷瓶圆肚', 460, 742, 88, 126, 0, { color: [222, 226, 232], colorEdge: [128, 138, 152], alpha: 0.90, count: 22 });
        for (let b = 0; b < 5; b++) {
          api.oilPatch(3, '青花靛蓝云纹图案', 428 + b * 18, 718 + (b % 2) * 38, 22, 16, b * 0.5, { color: [42, 78, 136], alpha: 0.72, count: 6 });
        }
        // Loose wild foliage & crisp white daisies
        for (let s = 0; s < 18; s++) {
          const sx = 240 + api.rand() * 440, sy = 210 + api.rand() * 340;
          api.oilStroke(2, '杂花草绿枝穿梭', [[460, 615], [(460 + sx) * 0.5, 510], [sx, sy]], {
            width: 5, color: [68, 112, 58], colorEnd: [98, 142, 74], alpha: 0.78
          });
        }
        const daisies = [
          [458, 260, 62], [322, 318, 56], [598, 305, 54], [250, 425, 50],
          [385, 392, 60], [525, 378, 58], [660, 422, 48], [335, 512, 50],
          [465, 495, 56], [585, 508, 48], [405, 212, 46], [538, 235, 46]
        ];
        daisies.forEach(([cx, cy, rad]) => {
          for (let p = 0; p < 16; p++) {
            const a = (p / 16) * Math.PI * 2 + api.rand() * 0.14;
            api.oilStroke(3, '野生雏菊白色放射花瓣', [
              [cx + Math.cos(a) * 10, cy + Math.sin(a) * 10],
              [cx + Math.cos(a) * rad, cy + Math.sin(a) * rad]
            ], { width: 11, color: [248, 246, 238], colorEnd: [216, 222, 228], alpha: 0.86, stretch: 0.35 });
          }
          api.oilPatch(3, '雏菊明黄圆润花蕊', cx, cy, rad * 0.25, rad * 0.24, 0, { color: [242, 186, 42], colorEdge: [184, 122, 22], alpha: 0.94, count: 8 });
          api.oilHighlight(4, '花蕊一侧鹅黄受光', cx - 3, cy - 3, 5, 5, 0, { color: [255, 242, 134], alpha: 0.90, count: 3 });
        });
        api.oilHighlight(4, '青花瓷肩通透高光', 402, 682, 12, 36, -0.2, { color: [255, 255, 255], alpha: 0.92, count: 5 });
      }
    },

    // =========================================================================
    // LANDSCAPES & SEASCAPES (10)
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
        paintBackdrop(api, 1120, 820, [18, 34, 78], [28, 54, 112], [16, 26, 52]);
        // Swirling Milky Way bands
        for (let r = 0; r < 22; r++) {
          const y0 = 160 + (r - 10) * 14;
          const col = r % 3 === 0 ? [92, 148, 212] : (r % 3 === 1 ? [54, 96, 168] : [182, 212, 238]);
          api.oilStroke(2, '夜空涡旋流动星河笔触', [
            [-40, y0 + 50], [280, y0 - 30], [520, y0 + 60], [780, y0 - 45], [1160, y0 + 15]
          ], { width: 16, color: col, colorEnd: [42, 82, 152], alpha: 0.68, stretch: 0.42, fade: 0.04 });
        }
        // Glowing stars + crescent moon
        const stars = [[185, 165, 58], [390, 128, 44], [610, 218, 52], [475, 295, 38], [260, 295, 34], [790, 140, 42]];
        stars.forEach(([sx, sy, sr]) => {
          api.oilPatch(2, '星辰外圈淡黄光晕', sx, sy, sr, sr, 0, { color: [248, 224, 108], colorEdge: [62, 108, 168], alpha: 0.58, count: 14 });
          api.oilHighlight(4, '星核炽亮金黄高光', sx, sy, sr * 0.28, sr * 0.28, 0, { color: [255, 246, 178], alpha: 0.96, count: 4 });
        });
        api.oilPatch(2, '右上金黄弯月大光晕', 945, 165, 92, 92, 0, { color: [248, 198, 64], colorEdge: [52, 88, 156], alpha: 0.72, count: 18 });
        api.oilPatch(3, '炽金饱满弯月本体', 948, 162, 42, 42, 0, { color: [254, 218, 68], colorEdge: [228, 152, 32], alpha: 0.94, count: 12 });
        // Distant undulating hills & village
        api.oilPatch(2, '远山起伏深蓝轮廓', 620, 610, 580, 130, -0.05, { color: [22, 38, 76], colorEdge: [14, 24, 52], alpha: 0.92, count: 28 });
        paintTableBand(api, 1120, 820, 620, [24, 42, 68], [14, 24, 42]);
        // Village spire & warm windows
        api.oilStroke(3, '教堂尖顶刺向夜空', [[692, 648], [692, 458]], { width: 14, color: [24, 34, 58], alpha: 0.92 });
        for (let h = 0; h < 12; h++) {
          const hx = 440 + h * 54, hy = 640 + (h % 3) * 26;
          api.oilPatch(3, '山村小屋群剪影', hx, hy, 22, 16, 0, { color: [26, 36, 56], alpha: 0.92, count: 6 });
          if (h % 2 === 0) api.oilHighlight(4, '农舍灯火橙黄窗点', hx, hy, 5, 5, 0, { color: [255, 206, 84], alpha: 0.96, count: 2 });
        }
        // Iconic foreground dark cypress flame
        const cypPts = [[248, 820], [232, 620], [268, 430], [244, 250], [272, 118]];
        api.oilStroke(3, '前景火焰形丝柏墨绿躯干', cypPts, { width: 88, color: [18, 36, 22], colorEnd: [28, 52, 28], alpha: 0.95, stretch: 0.45 });
        for (let f = 0; f < 10; f++) {
          const t = f / 9, fx = 248 + Math.sin(f * 1.4) * 22, fy = 780 - t * 630;
          api.oilStroke(4, '丝柏树梢冷绿逆光勾勒', [[fx - 18, fy + 24], [fx + 14, fy - 24]], { width: 12, color: [48, 82, 46], alpha: 0.80 });
        }
      }
    },
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
        paintBackdrop(api, 1120, 820, [96, 148, 214], [156, 194, 234], [218, 226, 232]);
        for (let c = 0; c < 6; c++) {
          api.oilPatch(2, '天际绵柔积云受光', 180 + c * 165, 130 + (c % 2) * 35, 110, 36, 0, { color: [248, 246, 238], colorEdge: [192, 208, 232], alpha: 0.72, count: 14 });
        }
        // Far Provençal hills
        api.oilPatch(2, '普罗旺斯远山浅黛青蓝', 560, 368, 620, 74, -0.02, { color: [108, 126, 168], colorEdge: [148, 162, 198], alpha: 0.84, count: 24 });
        paintTableBand(api, 1120, 820, 375, [174, 152, 108], [136, 108, 68]);
        // Radiating lavender rows toward vanishing point (560, 378)
        for (let i = -9; i <= 9; i++) {
          const xTop = 560 + i * 24, xBot = 560 + i * 116;
          api.oilStroke(3, '紫罗兰薰衣草垄纵深排笔', [[xTop, 386], [(xTop + xBot) * 0.5, 585], [xBot, 835]], {
            width: 34, color: [104, 68, 158], colorEnd: [146, 98, 198], alpha: 0.90, stretch: 0.48
          });
          api.oilStroke(4, '薰衣草垄向阳紫粉顶光', [[xTop, 386], [(xTop + xBot) * 0.5 - 6, 585], [xBot - 12, 835]], {
            width: 14, color: [196, 164, 228], alpha: 0.72
          });
        }
        // Stone farmhouse & cypress trees at horizon
        api.oilPatch(3, '远景南法红顶农舍墙面', 558, 362, 34, 20, 0, { color: [228, 212, 182], alpha: 0.94, count: 8 });
        api.oilStroke(3, '农舍红瓦斜顶', [[520, 348], [558, 336], [596, 348]], { width: 12, color: [176, 78, 48], alpha: 0.95 });
        [[498, 368], [620, 370]].forEach(([tx, ty]) => {
          api.oilStroke(3, '屋旁墨绿柏树竖立点景', [[tx, ty], [tx, ty - 68]], { width: 20, color: [48, 78, 42], alpha: 0.92 });
        });
        api.oilHighlight(4, '近景花穂艳紫零星提亮', 360, 725, 22, 10, 0.2, { color: [222, 198, 246], alpha: 0.86, count: 6 });
      }
    },
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
        paintBackdrop(api, 1000, 820, [94, 146, 204], [156, 194, 224], [198, 178, 126]);
        // Forest backdrop foliage mass
        for (let i = 0; i < 24; i++) {
          const cx = 60 + api.rand() * 880, cy = 80 + api.rand() * 340;
          const col = i % 3 === 0 ? [228, 164, 38] : (i % 3 === 1 ? [196, 84, 32] : [244, 198, 62]);
          api.oilPatch(2, '秋林繁茂金橙树冠铺涂', cx, cy, 85, 65, api.rand() * 2, { color: col, colorEdge: [128, 64, 24], alpha: 0.80, count: 14 });
        }
        // Creek & autumn bank — natural meandering creek flowing all the way to bottom edge
        paintTableBand(api, 1000, 820, 520, [164, 104, 42], [116, 68, 28]);
        api.oilStroke(2, '清溪S形碧蓝水面蜿蜒至前缘', [[620, 522], [565, 595], [475, 695], [535, 835]], {
          width: 175, color: [84, 128, 166], colorEnd: [48, 86, 124], alpha: 0.90, stretch: 0.65, fade: 0.04
        });
        api.oilStroke(2, '溪畔冷赭岸边交界', [[535, 522], [480, 600], [390, 700], [445, 835]], {
          width: 24, color: [118, 72, 34], alpha: 0.72, fade: 0.05
        });
        // Silver-white birch trunks
        const trunks = [
          [165, 720, 152, 40, 28], [268, 610, 276, 30, 20], [395, 580, 388, 20, 14],
          [715, 630, 726, 40, 26], [835, 740, 818, 50, 34]
        ];
        trunks.forEach(([x0, y0, x1, y1, w]) => {
          api.oilStroke(3, '白桦银灰圆柱树干', [[x0, y0], [(x0 + x1) * 0.5, (y0 + y1) * 0.5], [x1, y1]], {
            width: w, color: [232, 228, 218], colorEnd: [188, 188, 186], alpha: 0.94
          });
          for (let b = 0; b < 8; b++) {
            const t = 0.1 + b * 0.11, bx = api.lerp(x0, x1, t), by = api.lerp(y0, y1, t);
            api.oilStroke(3, '桦树特征黑皮横疤', [[bx - w * 0.35, by], [bx + w * 0.28, by + 2]], { width: 4, color: [38, 34, 30], alpha: 0.86 });
          }
        });
        // Foreground sparkling foliage & creek reflections
        for (let k = 0; k < 14; k++) {
          const rx = 440 + api.rand() * 210, ry = 585 + api.rand() * 195;
          api.oilHighlight(4, '溪面落叶碎金水平光斑', rx, ry, 24, 5, 0, { color: k % 2 === 0 ? [248, 206, 78] : [234, 242, 250], alpha: 0.84, count: 4 });
        }
        api.oilHighlight(4, '枝梢明黄叶簇受光重笔', 220, 180, 34, 24, -0.2, { color: [255, 228, 86], alpha: 0.88, count: 6 });
      }
    },
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
        paintBackdrop(api, 1120, 820, [74, 122, 172], [134, 174, 212], [206, 222, 236]);
        // Mountain ridges + sunlit pink-white & shadow blue faces
        const peaks = [[240, 210, 460], [560, 148, 520], [860, 225, 440]];
        peaks.forEach(([px, py, baseY]) => {
          // Sunlit left slope
          api.oilStroke(2, '雪峰左向阳面粉白堆砌', [[px - 220, baseY], [px - 95, (py + baseY) * 0.5], [px, py]], {
            width: 115, color: [248, 236, 228], colorEnd: [236, 206, 198], alpha: 0.90, stretch: 0.58
          });
          // Cool shadow right slope
          api.oilStroke(2, '雪峰右背阴面灰蓝冷调', [[px, py], [px + 105, (py + baseY) * 0.52], [px + 225, baseY]], {
            width: 118, color: [74, 98, 138], colorEnd: [48, 68, 108], alpha: 0.90, stretch: 0.58
          });
        });
        // Emerald glacier lake
        paintTableBand(api, 1120, 820, 480, [34, 114, 106], [18, 62, 74]);
        // Pine treeline silhouette along far shoreline
        for (let t = 0; t < 44; t++) {
          const tx = 40 + t * 25, th = 42 + (t * 37 % 56);
          api.oilStroke(3, '湖岸尖顶墨绿冷杉列', [[tx, 488], [tx, 488 - th]], { width: 12, color: [24, 52, 36], alpha: 0.92 });
        }
        // Foreground rocky spit + crisp whitewater reflection
        api.oilPatch(3, '近景深褐砾石湖岬', 220, 745, 250, 95, 0.1, { color: [68, 56, 46], colorEdge: [34, 28, 24], alpha: 0.92, count: 22 });
        for (let r = 0; r < 10; r++) {
          api.oilHighlight(4, '冰湖镜面水平波光与雪峰倒影', 340 + r * 62, 540 + (r % 3) * 48, 48, 4, 0, { color: [228, 244, 246], alpha: 0.72, count: 4 });
        }
        api.oilHighlight(4, '主峰峰脊厚涂冰雪锐光', 540, 168, 18, 28, -0.5, { color: [255, 252, 248], alpha: 0.96, count: 4 });
      }
    },
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
        paintBackdrop(api, 1120, 820, [106, 128, 162], [218, 168, 132], [244, 198, 138]);
        // Grand Canal water base
        paintTableBand(api, 1120, 820, 485, [64, 92, 118], [32, 48, 72]);
        // Distant domed basilica (Salute silhouette)
        api.oilPatch(2, '安康圣母教堂穹顶剪影', 660, 355, 58, 68, 0, { color: [134, 118, 132], alpha: 0.86, count: 14 });
        api.oilPatch(2, '教堂两侧古典建筑群', 480, 425, 220, 62, 0, { color: [152, 126, 124], alpha: 0.86, count: 16 });
        // Left Venetian palaces
        [[80, 390, 140, 190, [212, 134, 96]], [210, 405, 120, 175, [224, 186, 132]]].forEach(([bx, by, bw, bh, col]) => {
          api.oilPatch(3, '水岸威尼斯粉墙宫殿', bx, by, bw * 0.5, bh * 0.5, 0, { color: col, colorEdge: [138, 76, 54], alpha: 0.92, count: 18 });
          for (let w = 0; w < 3; w++) api.oilHighlight(3, '宫殿拱形窗幽影', bx - 32 + w * 32, by - 12, 8, 14, 0, { color: [48, 36, 34], alpha: 0.85, count: 2 });
        });
        // Mooring poles (paline)
        [[280, 560], [315, 575], [840, 550]].forEach(([px, py]) => {
          api.oilStroke(3, '威尼斯斜插木桩系缆柱', [[px - 10, py + 95], [px + 12, py - 95]], { width: 14, color: [112, 46, 38], colorEnd: [228, 212, 194], alpha: 0.92 });
        });
        // Iconic dark Gondola + standing gondolier
        api.oilStroke(3, '漆黑贡多拉长弧翘首舟身', [[360, 610], [520, 636], [690, 624], [745, 586]], {
          width: 24, color: [18, 16, 20], colorEnd: [42, 34, 38], alpha: 0.96
        });
        api.oilStroke(3, '船尾船夫站姿剪影与长桨', [[675, 618], [665, 524]], { width: 14, color: [24, 20, 24], alpha: 0.94 });
        api.oilStroke(3, '斜入运河细长船桨', [[658, 556], [568, 675]], { width: 5, color: [176, 132, 82], alpha: 0.90 });
        // Shimmering canal water highlights
        for (let r = 0; r < 14; r++) {
          const rx = 200 + api.rand() * 720, ry = 505 + api.rand() * 265;
          api.oilHighlight(4, '运河暮光横向荡漾碎金波纹', rx, ry, 42, 4, 0, { color: r % 2 === 0 ? [252, 208, 124] : [188, 206, 224], alpha: 0.78, count: 4 });
        }
      }
    },
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
        paintBackdrop(api, 1000, 820, [26, 44, 24], [38, 62, 32], [18, 28, 14]);
        // sunlit misty forest center gap
        api.oilPatch(2, '林梢间隙晨雾金光渊', 540, 210, 145, 165, 0, { color: [232, 218, 138], colorEdge: [64, 98, 44], alpha: 0.76, count: 24 });
        // Mossy undulating forest path floor
        paintTableBand(api, 1000, 820, 520, [68, 92, 36], [34, 46, 20]);
        api.oilStroke(2, '林间泥泞蜿蜒小径受光', [[520, 520], [490, 665], [440, 835]], { width: 120, color: [168, 152, 86], colorEnd: [98, 86, 46], alpha: 0.72, stretch: 0.65 });
        // Massive dark oak trunks framing the depth
        [[145, 830, 165, 10, 56], [280, 690, 295, 20, 32], [755, 680, 740, 10, 38], [885, 830, 860, 0, 62]].forEach(([x0, y0, x1, y1, w]) => {
          api.oilStroke(3, '沧桑深褐林木树干', [[x0, y0], [(x0 + x1) * 0.5, 420], [x1, y1]], { width: w, color: [52, 38, 26], colorEnd: [26, 20, 14], alpha: 0.94 });
        });
        // Deep leafy canopy + backlit sunlit ferns
        for (let f = 0; f < 16; f++) {
          const lx = 60 + f * 60, ly = 60 + (f % 4) * 58;
          api.oilPatch(3, '顶层密林茂叶掩映', lx, ly, 86, 56, 0, { color: [34, 58, 26], colorEdge: [18, 32, 14], alpha: 0.84, count: 10 });
        }
        // Tyndall diagonal sunbeams (lighter glaze/additive feel!)
        for (let b = 0; b < 5; b++) {
          api.oilStroke(4, '林隙斜射金色丁达尔光束', [[545 + b * 24, 155], [420 + b * 48, 565]], {
            width: 38, color: [252, 236, 158], colorEnd: [188, 198, 92], alpha: 0.34, stretch: 0.75
          });
        }
        api.oilHighlight(4, '小径中心苔草被金光点亮', 485, 625, 68, 28, -0.1, { color: [236, 226, 118], alpha: 0.78, count: 10 });
      }
    },
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
        paintBackdrop(api, 1120, 820, [24, 34, 44], [46, 66, 78], [28, 42, 52]);
        // Rolling storm clouds
        for (let c = 0; c < 12; c++) {
          api.oilPatch(2, '风雷暗铅云团翻涌', 80 + c * 92, 130 + (c % 3) * 58, 120, 54, -0.2, { color: [42, 56, 68], colorEdge: [22, 28, 36], alpha: 0.84, count: 12 });
        }
        // Churning teal sea
        paintTableBand(api, 1120, 820, 480, [24, 74, 82], [14, 38, 48]);
        // Rocky cliff + Red/White Lighthouse
        api.oilPatch(3, '乌黑礁石绝壁顶风浪', 345, 585, 165, 135, -0.1, { color: [38, 36, 36], colorEdge: [18, 18, 20], alpha: 0.96, count: 24 });
        api.oilStroke(3, '红白灯塔白身主体', [[350, 475], [350, 218]], { width: 52, color: [236, 234, 224], colorEnd: [198, 202, 202], alpha: 0.96 });
        api.oilStroke(3, '灯塔鲜红警戒横带', [[326, 340], [374, 340]], { width: 34, color: [188, 48, 38], alpha: 0.95 });
        api.oilStroke(3, '灯塔顶红黑灯笼亭', [[350, 218], [350, 178]], { width: 36, color: [168, 42, 34], colorEnd: [26, 26, 28], alpha: 0.95 });
        // Beacon light beams cutting across storm sky
        api.oilStroke(4, '灯塔右射穿透迷雾强光柱', [[368, 202], [1100, 110]], { width: 84, color: [255, 238, 162], colorEnd: [128, 148, 148], alpha: 0.36, stretch: 0.78 });
        api.oilHighlight(4, '灯笼核心炽烈明黄火光', 350, 204, 18, 14, 0, { color: [255, 250, 204], alpha: 0.98, count: 6 });
        // Crashing white foam waves against cliff
        for (let w = 0; w < 14; w++) {
          const wx = 180 + w * 68, wy = 560 + Math.sin(w * 0.9) * 58;
          api.oilStroke(4, '拍岸雪白翻卷浪花飞沫', [[wx, wy], [wx + 65, wy - 28]], { width: 28, color: [244, 248, 248], colorEnd: [148, 182, 188], alpha: 0.88 });
        }
        api.oilHighlight(4, '撞礁冲天飞沫溅白点彩', 485, 495, 58, 72, -0.3, { color: [255, 255, 252], alpha: 0.86, count: 14 });
      }
    },
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
        paintBackdrop(api, 1120, 820, [74, 124, 64], [98, 148, 92], [52, 86, 112]);
        // Pond surface vibrant violet-blue-green tapestry
        paintTableBand(api, 1120, 820, 410, [48, 86, 118], [32, 68, 98]);
        for (let r = 0; r < 24; r++) {
          const rx = api.rand() * 1080, ry = 415 + api.rand() * 380;
          const col = r % 3 === 0 ? [92, 148, 118] : (r % 3 === 1 ? [118, 96, 148] : [68, 118, 156]);
          api.oilStroke(2, '池面垂柳紫蓝倒影短笔', [[rx, ry], [rx, ry + 54]], { width: 14, color: col, alpha: 0.62 });
        }
        // Weeping willow cascades behind bridge
        for (let w = 0; w < 28; w++) {
          const wx = 30 + w * 40;
          api.oilStroke(2, '后岸柳绦鹅黄嫩绿下垂', [[wx, 10], [wx + 12, 220], [wx - 8, 395]], {
            width: 18, color: w % 2 === 0 ? [126, 174, 72] : [68, 114, 54], alpha: 0.72
          });
        }
        // Iconic teal-green Japanese arch bridge
        api.oilStroke(3, '拱形日式木桥主拱身', [[90, 425], [560, 295], [1030, 425]], { width: 22, color: [108, 162, 146], colorEnd: [68, 118, 106], alpha: 0.94 });
        api.oilStroke(3, '拱桥顶层扶手弧线', [[90, 365], [560, 238], [1030, 365]], { width: 10, color: [132, 184, 168], alpha: 0.94 });
        for (let p = 0; p <= 16; p++) {
          const t = p / 16, bx = api.lerp(110, 1010, t);
          const arch = Math.sin(t * Math.PI) * 126;
          api.oilStroke(3, '木桥垂直护栏柱列', [[bx, 422 - arch], [bx, 362 - arch]], { width: 6, color: [92, 142, 128], alpha: 0.92 });
        }
        // Floating waterlilies
        const pads = [[260, 560], [340, 620], [520, 690], [680, 585], [810, 665], [420, 745], [755, 740]];
        pads.forEach(([px, py]) => {
          api.oilPatch(4, '睡莲圆润翠青浮叶群', px, py, 56, 22, 0.1, { color: [68, 118, 62], colorEdge: [38, 72, 42], alpha: 0.88, count: 10 });
          api.oilHighlight(4, '粉白娇蕊睡莲点睛', px + 14, py - 4, 14, 7, 0, { color: [248, 178, 198], alpha: 0.94, count: 4 });
          api.oilHighlight(4, '睡莲花心一点亮白', px + 14, py - 5, 6, 4, 0, { color: [255, 250, 224], alpha: 0.96, count: 2 });
        });
      }
    },
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
        paintBackdrop(api, 1120, 820, [118, 136, 164], [194, 174, 176], [238, 196, 162]);
        // Snow-blanketed ground with cool sky reflection
        paintTableBand(api, 1120, 820, 465, [224, 228, 236], [176, 192, 214]);
        // Winding muddy-slush country lane
        api.oilStroke(2, '积雪压辙土路弯向村中', [[520, 470], [495, 595], [580, 710], [460, 835]], { width: 92, color: [132, 128, 134], colorEnd: [98, 92, 98], alpha: 0.72, stretch: 0.65 });
        // Cozy snow-topped village cottages
        const houses = [[320, 465, 92, 68], [585, 445, 110, 76], [765, 480, 96, 64]];
        houses.forEach(([hx, hy, hw, hh]) => {
          api.oilPatch(3, '乡村石砌小屋墙面', hx, hy, hw * 0.5, hh * 0.5, 0, { color: [108, 96, 88], colorEdge: [68, 58, 52], alpha: 0.92, count: 14 });
          api.oilStroke(3, '屋顶覆盖松软厚积雪', [[hx - hw * 0.6, hy - 14], [hx, hy - hh * 0.85], [hx + hw * 0.6, hy - 14]], {
            width: 24, color: [248, 248, 250], colorEnd: [198, 212, 228], alpha: 0.96
          });
          api.oilHighlight(4, '雪夜小屋炉火橙黄亮窗', hx - 16, hy + 8, 9, 10, 0, { color: [255, 196, 68], alpha: 0.96, count: 3 });
          api.oilHighlight(4, '右窗温暖火光溢雪地', hx + 18, hy + 8, 8, 9, 0, { color: [255, 206, 88], alpha: 0.94, count: 3 });
        });
        // Bare winter trees framing foreground
        [[155, 760, 175, 165], [910, 780, 890, 145]].forEach(([x0, y0, x1, y1]) => {
          api.oilStroke(3, '冬日落叶孤树黑褐主干', [[x0, y0], [(x0 + x1) * 0.5, 460], [x1, y1]], { width: 24, color: [52, 42, 38], alpha: 0.94 });
          api.oilStroke(3, '寒树遒劲分叉枝丫', [[x1, y1 + 120], [x1 + (x1 < 500 ? 78 : -82), y1 - 35]], { width: 9, color: [56, 46, 42], alpha: 0.88 });
        });
        api.oilHighlight(4, '雪路边缘被暮光染成粉白高光', 385, 650, 48, 12, -0.2, { color: [252, 232, 218], alpha: 0.78, count: 6 });
      }
    },
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
        paintBackdrop(api, 1120, 820, [14, 22, 42], [26, 42, 74], [38, 58, 92]);
        // Calm nocturnal sea
        paintTableBand(api, 1120, 820, 455, [24, 42, 72], [12, 20, 38]);
        // Clouds & Luminous full moon
        api.oilPatch(2, '夜空云隙月华冰蓝光晕', 595, 225, 138, 92, 0, { color: [164, 188, 218], colorEdge: [28, 44, 76], alpha: 0.72, count: 22 });
        api.oilHighlight(4, '冰轮满月厚涂明辉', 595, 225, 36, 36, 0, { color: [255, 250, 234], alpha: 0.98, count: 8 });
        // Rimlit dark cloud bands
        api.oilPatch(2, '乌云横遮半天冷紫', 280, 195, 210, 44, -0.05, { color: [24, 30, 48], alpha: 0.80, count: 16 });
        api.oilStroke(3, '乌云下沿银白镶边月光', [[140, 228], [320, 232], [485, 218]], { width: 12, color: [212, 226, 242], alpha: 0.76 });
        // Silhouetted headland & calm moored skiff
        api.oilPatch(3, '左岸苍黑礁崖剪影', 145, 510, 210, 115, 0.1, { color: [18, 20, 26], colorEdge: [12, 14, 18], alpha: 0.96, count: 20 });
        api.oilStroke(3, '礁顶斜卧海松剪影', [[110, 430], [215, 355]], { width: 16, color: [18, 22, 26], alpha: 0.94 });
        api.oilStroke(3, '海湾静泊剪影小渔船', [[385, 595], [445, 608], [505, 594]], { width: 14, color: [16, 18, 24], alpha: 0.96 });
        // Shimmering silver moonpath on water!
        for (let y = 468; y <= 785; y += 14) {
          const spread = 16 + ((y - 468) / 317) * 98;
          api.oilHighlight(4, '海面破碎皎洁银柱水波', 595 + (api.rand() - 0.5) * 16, y, spread * 0.6, 3.8, 0, {
            color: y < 560 ? [255, 252, 234] : [194, 214, 236], alpha: 0.86, count: 3
          });
        }
      }
    }
  ];

  window.Code2PaintCatalog.addPack(WORKS);
})();
