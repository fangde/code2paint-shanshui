(function () {
  'use strict';

  function paintBackdrop(api, w, h, cTop, cMid, cBot, opts = {}) {
    const layer = opts.layer || 1;
    const label = opts.label || '有色油画底涂铺底';
    for (let y = -10; y <= h + 40; y += 44) {
      const f = Math.max(0, Math.min(1, y / h));
      const col = f < 0.5
        ? [api.lerp(cTop[0], cMid[0], f * 2), api.lerp(cTop[1], cMid[1], f * 2), api.lerp(cTop[2], cMid[2], f * 2)]
        : [api.lerp(cMid[0], cBot[0], (f - 0.5) * 2), api.lerp(cMid[1], cBot[1], (f - 0.5) * 2), api.lerp(cMid[2], cBot[2], (f - 0.5) * 2)];
      api.oilStroke(layer, label, [[-60, y], [w * 0.5, y + 4], [w + 60, y - 4]], {
        width: 118, stretch: 0.78, fade: 0.02, color: col, colorEnd: col, alpha: opts.alpha || 0.62, vary: opts.vary == null ? 4 : opts.vary, bristle: 0.28
      });
    }
  }

  function paintTableBand(api, w, h, yTop, cTop, cBot, layer, label) {
    for (let y = yTop; y <= h + 40; y += 38) {
      const t = Math.min(1, (y - yTop) / Math.max(1, h - yTop));
      const col = [api.lerp(cTop[0], cBot[0], t), api.lerp(cTop[1], cBot[1], t), api.lerp(cTop[2], cBot[2], t)];
      api.oilStroke(layer || 1, label || '台面横涂铺底', [[-60, y], [w * 0.5, y - 4], [w + 60, y + 4]], {
        width: 112, stretch: 0.78, fade: 0.02, color: col, colorEnd: col, alpha: 0.74, vary: 4, bristle: 0.30
      });
    }
  }

  function paintBar(api, layer, label, x1, y1, x2, y2, width, col, opts = {}) {
    api.oilStroke(layer, label, [[x1, y1], [(x1 + x2) * 0.5, (y1 + y2) * 0.5], [x2, y2]], {
      width,
      stretch: opts.stretch || 0.58,
      fade: opts.fade == null ? 0.04 : opts.fade,
      color: col,
      colorEnd: opts.colorEnd || col,
      alpha: opts.alpha == null ? 0.90 : opts.alpha,
      vary: opts.vary == null ? 4 : opts.vary,
      bristle: opts.bristle == null ? 0.28 : opts.bristle
    });
  }

  // Seamless solid oval: guarantee brush core thickness >= 3x row pitch so adjacent passes melt smoothly
  function paintSolidOval(api, layer, label, cx, cy, rx, ry, col, opts = {}) {
    const colEnd = opts.colorEnd || col;
    const rows = opts.rows || Math.max(8, Math.round((ry * 2) / 14));
    const rowPitch = (ry * 2) / (rows + 1);
    const brushW = opts.width || Math.max(18, rowPitch * 3.1);
    const tilt = opts.rot || 0;
    const cos = Math.cos(tilt), sin = Math.sin(tilt);
    const colR = opts.colorRight || col;
    for (let i = 0; i <= rows; i++) {
      const dy = -ry + (i + 0.5) * rowPitch;
      const norm = Math.max(0, 1 - (dy * dy) / (ry * ry));
      const dx = Math.sqrt(norm) * rx;
      if (dx < 2) continue;
      const t = i / rows;
      const rowL = [api.lerp(col[0], colEnd[0], t), api.lerp(col[1], colEnd[1], t), api.lerp(col[2], colEnd[2], t)];
      const rowR = [api.lerp(colR[0], colEnd[0], t), api.lerp(colR[1], colEnd[1], t), api.lerp(colR[2], colEnd[2], t)];
      const lx1 = -dx, lx2 = dx;
      const x1 = cx + lx1 * cos - dy * sin, y1 = cy + lx1 * sin + dy * cos;
      const x2 = cx + lx2 * cos - dy * sin, y2 = cy + lx2 * sin + dy * cos;
      api.oilStroke(layer, label, [[x1, y1], [(x1 + x2) * 0.5, (y1 + y2) * 0.5], [x2, y2]], {
        width: brushW, stretch: 0.78, fade: 0.05, color: rowL, colorEnd: rowR,
        alpha: opts.alpha == null ? 0.90 : opts.alpha, vary: opts.vary == null ? 4 : opts.vary, bristle: opts.bristle == null ? 0.22 : opts.bristle
      });
    }
  }

  // Seamless quad/polygon fill: auto-size brush width to 3.2x vertical row spacing to prevent striping
  function paintPolygonFill(api, layer, label, leftPts, rightPts, colTop, colBot, opts = {}) {
    const rows = opts.rows || 14;
    function sampleChain(pts, t) {
      const scaled = t * (pts.length - 1);
      const i = Math.min(pts.length - 2, Math.floor(scaled));
      const f = scaled - i;
      return [api.lerp(pts[i][0], pts[i + 1][0], f), api.lerp(pts[i][1], pts[i + 1][1], f)];
    }
    const yStart = Math.min(leftPts[0][1], rightPts[0][1]);
    const yEnd = Math.max(leftPts[leftPts.length - 1][1], rightPts[rightPts.length - 1][1]);
    const spanH = Math.max(24, Math.abs(yEnd - yStart));
    const rowPitch = spanH / rows;
    const brushW = opts.width || Math.max(22, rowPitch * 3.1);
    const colRight = opts.colorRight || colBot;
    for (let r = 0; r <= rows; r++) {
      const t = r / rows;
      const pL = sampleChain(leftPts, t);
      const pR = sampleChain(rightPts, t);
      const c1 = [api.lerp(colTop[0], colBot[0], t), api.lerp(colTop[1], colBot[1], t), api.lerp(colTop[2], colBot[2], t)];
      const c2 = opts.colorRight
        ? [api.lerp(colRight[0], colBot[0], t * 0.4), api.lerp(colRight[1], colBot[1], t * 0.4), api.lerp(colRight[2], colBot[2], t * 0.4)]
        : c1;
      api.oilStroke(layer, label, [pL, [(pL[0] + pR[0]) * 0.5, (pL[1] + pR[1]) * 0.5], pR], {
        width: brushW, stretch: 0.78, fade: 0.04, color: c1, colorEnd: c2,
        alpha: opts.alpha == null ? 0.92 : opts.alpha, vary: opts.vary == null ? 4 : opts.vary, bristle: opts.bristle == null ? 0.22 : opts.bristle
      });
    }
  }

  function paintEye(api, layer, label, cx, cy, w, irisCol, browCol, lidAlpha) {
    api.oilPatch(layer, label + '眼窝微影', cx, cy - 2, w * 0.72, w * 0.44, 0, { color: [78, 54, 46], alpha: lidAlpha || 0.28, count: 5 });
    api.oilStroke(layer, label + '柔和眉弓', [[cx - w * 0.65, cy - w * 0.42], [cx - w * 0.05, cy - w * 0.52], [cx + w * 0.62, cy - w * 0.36]], {
      width: 4.5, color: browCol, alpha: 0.86
    });
    api.oilPatch(layer, label + '眼白柔和底面', cx, cy, w * 0.42, w * 0.19, 0, { color: [232, 222, 210], alpha: 0.90, count: 4 });
    api.oilHighlight(layer, label + '虹膜底色', cx, cy, w * 0.17, w * 0.17, 0, { color: irisCol, alpha: 0.96, count: 2 });
    api.oilHighlight(layer, label + '瞳孔深点', cx, cy, w * 0.07, w * 0.07, 0, { color: [16, 14, 14], alpha: 0.98, count: 1 });
    api.oilStroke(layer, label + '上睑睫毛弧线', [[cx - w * 0.48, cy + 1], [cx, cy - w * 0.20], [cx + w * 0.48, cy + 2]], {
      width: 3.8, color: [26, 20, 18], alpha: 0.92
    });
    api.oilHighlight(layer + 1, label + '眼神高光点', cx - w * 0.06, cy - w * 0.06, 2.5, 2.5, 0, { color: [255, 252, 244], alpha: 0.98, count: 1 });
  }

  const WORKS = [
    // =========================================================================
    // 1. STILL LIFE TUTORIAL: DUTCH GOLDEN AGE SILVER PITCHER & PEELED LEMON
    // =========================================================================
    {
      id: 'oil-tut-still-dutch',
      title: '经典油画教程·荷兰古典银壶柠檬静物',
      subtitle: '荷兰黄金时代多层罩染法：熟褐暗底 → 单色明暗底稿 → 银壶冷釉与绿色高脚杯 → 天鹅绒帘 → 螺旋柠檬皮高光',
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
      desc: '经典西方学院派古典静物教程（荷兰黄金时代风格）：严格遵循有色底、单色塑形、冷暖罩染与金属/玻璃器皿反光描写，点睛前景悬垂剥皮柠檬。',
      layers: [
        { id: 1, name: '一 · 熟褐有色底与暗调空间' },
        { id: 2, name: '二 · 构图投影与单色明暗底稿' },
        { id: 3, name: '三 · 银壶、绿釉杯与柠檬塑形' },
        { id: 4, name: '四 · 勃艮第帷幕与器皿罩染反光' },
        { id: 5, name: '五 · 窗格高光与螺旋柠檬皮点睛' }
      ],
      buildStrokes(api) {
        paintBackdrop(api, 920, 1120, [26, 20, 15], [40, 30, 21], [20, 15, 11], { layer: 1, label: '熟褐油画暗底铺涂' });
        paintTableBand(api, 920, 1120, 718, [88, 60, 36], [34, 22, 14], 1, '胡桃木桌面平涂起底');
        paintBar(api, 1, '桌壁远近交界暗线', 30, 718, 890, 718, 7, [24, 16, 10], { alpha: 0.80 });

        // Layer 2: Seamless velvet drape base + cast shadow + monochrome silver pitcher underpainting
        paintPolygonFill(api, 2, '左上角天鹅绒垂帘深底', [[-20, -20], [10, 490]], [[315, -20], [220, 515]], [64, 18, 24], [32, 10, 14], { rows: 14, width: 105, alpha: 0.96 });
        api.oilPatch(2, '银壶与绿杯右斜投暗影', 585, 810, 230, 56, 0.04, { color: [14, 10, 8], alpha: 0.85, count: 16 });
        paintPolygonFill(api, 2, '银壶壶颈单色灰阶底稿', [[362, 342], [372, 472]], [[458, 326], [444, 472]], [136, 142, 148], [62, 66, 72], {
          colorRight: [56, 60, 66], rows: 10, alpha: 0.94
        });
        paintSolidOval(api, 2, '银壶鼓腹单色金属渐变体块', 405, 610, 106, 128, [148, 154, 160], {
          colorRight: [56, 60, 66], colorEnd: [48, 52, 58], rows: 16, alpha: 0.96
        });
        paintPolygonFill(api, 2, '银壶喇叭底座单色造型', [[362, 725], [325, 782]], [[448, 725], [485, 782]], [132, 138, 144], [52, 56, 62], {
          colorRight: [56, 60, 66], rows: 8, alpha: 0.96
        });

        // Layer 3: Sculpted metallic handle/spout + Roemer green wine glass + Delft plate
        paintBar(api, 3, '银壶瓶口椭圆冷银棱脊', 356, 344, 466, 322, 14, [186, 192, 196], { colorEnd: [112, 118, 124], alpha: 0.94 });
        api.oilStroke(3, '银壶卷曲雕花提柄主笔', [[366, 378], [268, 396], [250, 492], [295, 588], [322, 622]], {
          width: 22, color: [156, 162, 168], colorEnd: [72, 78, 84], alpha: 0.96
        });
        api.oilStroke(3, '银壶右侧修长流口塑形', [[452, 336], [510, 312], [488, 362], [446, 378]], {
          width: 18, color: [164, 170, 176], colorEnd: [76, 82, 88], alpha: 0.94
        });

        // Sculpted Roemer green glass cup (bowl, prunted stem, conical foot)
        paintPolygonFill(api, 3, '绿玻璃酒杯敞口弧面杯碗', [[592, 508], [608, 608]], [[702, 508], [686, 608]], [86, 142, 98], [46, 84, 54], {
          colorRight: [42, 78, 52], rows: 10, alpha: 0.88
        });
        paintSolidOval(api, 3, '酒杯内白葡萄酒液金绿反光', 647, 566, 44, 24, [168, 152, 76], { colorEnd: [72, 108, 62], rows: 6, alpha: 0.80 });
        paintBar(api, 3, '玻璃杯凸点粗柄立柱', 647, 606, 647, 738, 26, [68, 114, 76], { colorEnd: [38, 68, 44], alpha: 0.92 });
        paintPolygonFill(api, 3, '玻璃杯圆锥宽底座', [[632, 725], [595, 768]], [[662, 725], [698, 768]], [68, 110, 76], [38, 66, 42], { rows: 6, alpha: 0.92 });
        paintBar(api, 4, '玻璃杯椭圆杯口银青亮线', 592, 508, 702, 508, 6, [186, 214, 188], { alpha: 0.86 });

        // Layer 4: Draped velvet vertical highlight folds (overlapping wide brushstrokes), Delft ceramic plate, bounce glow
        for (let f = 0; f < 4; f++) {
          const xTop = 36 + f * 66;
          api.oilStroke(4, '天鹅绒帷幕深红亮脊折叠', [[xTop, -10], [xTop - 16, 235], [xTop - 32, 485]], {
            width: 54, stretch: 0.56, color: [128, 32, 40], colorEnd: [68, 16, 22], alpha: 0.72
          });
        }
        api.oilPatch(4, '银壶右腹柠檬金黄环境反光', 462, 638, 28, 44, 0.15, { color: [204, 174, 88], colorEdge: [82, 76, 56], alpha: 0.56, count: 8 });
        paintSolidOval(api, 4, '代尔夫特蓝灰瓷盘立体圆盘', 515, 804, 148, 42, [212, 218, 226], { colorEnd: [122, 138, 158], rows: 10, alpha: 0.96 });
        api.oilStroke(4, '瓷盘钴蓝青花边饰曲线', [[386, 802], [515, 834], [644, 802]], { width: 6.5, color: [46, 82, 146], alpha: 0.78 });

        // Layer 5: Golden lemon, spiraling peeled rind, crisp window catchlights
        paintSolidOval(api, 5, '鲜黄饱满柠檬受光体块', 506, 764, 52, 40, [246, 206, 46], { colorEnd: [176, 128, 26], rows: 10, rot: -0.15, alpha: 0.98 });
        const peelPts = [[478, 780], [536, 816], [486, 864], [552, 916], [506, 972], [536, 1018]];
        api.oilStroke(5, '悬垂螺旋柠檬果皮主笔', peelPts, { width: 20, color: [246, 206, 48], colorEnd: [222, 168, 30], alpha: 0.96 });
        api.oilStroke(5, '柠檬皮内侧奶白海绵层', [[482, 784], [526, 822], [492, 868], [542, 918], [510, 968]], { width: 8, color: [248, 242, 218], alpha: 0.92 });
        api.oilStroke(5, '银壶受光面强冷白窗影高光', [[342, 542], [336, 588], [344, 636]], { width: 14, color: [248, 250, 252], alpha: 0.94 });
        api.oilHighlight(5, '银壶瓶颈锐利窗格反光', 382, 398, 6, 18, -0.05, { color: [255, 254, 248], alpha: 0.96, count: 4 });
        api.oilHighlight(5, '绿玻璃杯受光反光晶点', 612, 558, 5, 16, 0.10, { color: [238, 252, 238], alpha: 0.94, count: 3 });
        api.oilHighlight(5, '酒杯凸点宝石颗粒亮点', 642, 650, 5, 5, 0, { color: [212, 242, 206], alpha: 0.88, count: 2 });
        api.oilHighlight(5, '柠檬粗糙果皮闪烁亮点', 488, 748, 10, 7, -0.25, { color: [255, 248, 182], alpha: 0.92, count: 4 });
      }
    },

    // =========================================================================
    // 2. STILL LIFE TUTORIAL: CEZANNE CONSTRUCTIVE FRUIT COMPOTE & WHITE CLOTH
    // =========================================================================
    {
      id: 'oil-tut-still-cezanne',
      title: '经典油画教程·塞尚结构果盘与白布',
      subtitle: '塞尚现代结构块面法：冷暖斜笔墙面 → 建筑感陶罐与高足盘 → 冷暖块面塑果 → 雕塑感白布折面 → 普鲁士蓝轮廓',
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
      desc: '保罗·塞尚现代主义结构静物教程：用平行斜笔分解空气感背景，并以丝滑冷天蓝与象牙白的几何转折块面塑造重磅白桌布褶皱与饱满果实。',
      layers: [
        { id: 1, name: '一 · 浅灰暖壁与平行斜笔打底' },
        { id: 2, name: '二 · 陶罐与白瓷高足盘体块定势' },
        { id: 3, name: '三 · 平行冷暖短笔塑果盘果实' },
        { id: 4, name: '四 · 雕塑感折皱白布与冷蓝块面' },
        { id: 5, name: '五 · 普鲁士蓝结构轮廓与高光点睛' }
      ],
      buildStrokes(api) {
        paintBackdrop(api, 1120, 820, [154, 168, 146], [174, 182, 158], [136, 128, 108], { layer: 1, label: '莫兰迪灰绿背景底涂' });
        for (let i = 0; i < 60; i++) {
          const x = 30 + ((i * 157) % 1060), y = 25 + ((i * 73) % 420);
          const c = i % 3 === 0 ? [128, 150, 136] : (i % 3 === 1 ? [192, 188, 162] : [144, 158, 150]);
          api.oilStroke(1, '塞尚平行斜向构造壁面笔触', [[x - 42, y + 36], [x, y], [x + 42, y - 36]], {
            width: 24, stretch: 0.46, fade: 0.08, color: c, alpha: 0.62, vary: 6
          });
        }
        paintTableBand(api, 1120, 820, 495, [158, 116, 68], [116, 82, 46], 1, '倾斜视点木桌厚涂铺底');

        // Sculpted draped white tablecloth constructed smoothly (no striping!)
        paintPolygonFill(api, 4, '桌布整体冷灰蓝暗面基底', [[240, 505], [140, 825]], [[710, 505], [760, 825]], [198, 206, 218], [132, 152, 178], {
          colorRight: [144, 162, 186], rows: 16, alpha: 0.96
        });
        const clothFacets = [
          { L: [[260, 505], [190, 825]], R: [[355, 505], [295, 825]], cT: [244, 242, 234], cB: [216, 222, 228] },
          { L: [[385, 505], [335, 825]], R: [[490, 505], [465, 825]], cT: [248, 246, 238], cB: [222, 228, 232] },
          { L: [[525, 505], [505, 825]], R: [[660, 505], [690, 825]], cT: [240, 240, 232], cB: [198, 212, 226] }
        ];
        clothFacets.forEach(f => paintPolygonFill(api, 4, '白桌布受光折叠斜块面', f.L, f.R, f.cT, f.cB, { rows: 14, alpha: 0.90 }));

        // Left glazed olive terracotta jar
        paintSolidOval(api, 2, '左侧釉陶橄榄罐柱形体块', 255, 396, 68, 108, [148, 122, 82], {
          colorRight: [92, 74, 52], colorEnd: [84, 68, 48], rows: 16, alpha: 0.96
        });
        paintPolygonFill(api, 2, '陶罐肩部青绿流釉反光面', [[198, 305], [192, 355]], [[265, 305], [260, 355]], [98, 138, 118], [134, 158, 124], { rows: 6, alpha: 0.88 });
        paintBar(api, 2, '陶罐椭圆口沿与厚边', 216, 286, 294, 286, 14, [62, 66, 72], { alpha: 0.92 });
        api.oilStroke(2, '陶罐弧形单耳提把', [[320, 314], [358, 336], [352, 386], [320, 405]], { width: 14, color: [112, 92, 64], alpha: 0.94 });

        // Center-right high pedestal white ceramic compote dish
        paintBar(api, 2, '高足瓷盘柱状底座立柱', 645, 452, 645, 578, 38, [224, 226, 228], { colorEnd: [128, 144, 166], alpha: 0.96 });
        paintSolidOval(api, 2, '瓷盘底座椭圆托盘底', 645, 580, 78, 22, [226, 228, 226], { colorEnd: [126, 144, 168], rows: 6, alpha: 0.96 });
        paintPolygonFill(api, 2, '白瓷果盘弧面盛钵体块', [[496, 408], [568, 466]], [[794, 408], [722, 466]], [242, 242, 236], [142, 162, 188], { rows: 8, alpha: 0.96 });

        const fruits = [
          [568, 376, 33, [218, 56, 36], [244, 142, 42]],
          [630, 362, 35, [234, 154, 34], [248, 208, 58]],
          [696, 372, 33, [196, 48, 34], [148, 32, 28]],
          [756, 390, 29, [138, 168, 58], [186, 202, 74]],
          [598, 320, 31, [224, 72, 38], [248, 176, 52]],
          [668, 316, 30, [146, 176, 62], [202, 214, 86]],
          [385, 576, 32, [214, 52, 36], [244, 138, 44]],
          [462, 594, 30, [148, 178, 58], [202, 216, 84]],
          [542, 566, 31, [238, 146, 36], [250, 204, 62]],
          [815, 596, 33, [206, 48, 34], [136, 32, 28]],
          [878, 636, 29, [232, 164, 38], [182, 198, 68]]
        ];
        fruits.forEach(([fx, fy, fr, cWarm, cHi]) => {
          paintSolidOval(api, 3, '结构苹果与梨球体底色', fx, fy, fr, fr * 0.90, cHi, { colorEnd: cWarm, rows: 8, alpha: 0.96 });
          api.oilStroke(3, '塞尚体面斜向冷暖切笔', [[fx - fr * 0.55, fy - fr * 0.2], [fx, fy - fr * 0.45], [fx + fr * 0.45, fy - fr * 0.1]], {
            width: 14, color: cHi, alpha: 0.85
          });
          api.oilStroke(5, '普鲁士蓝结构底部轮廓线', [[fx - fr * 0.65, fy + fr * 0.45], [fx, fy + fr * 0.85], [fx + fr * 0.72, fy + fr * 0.28]], {
            width: 4.5, color: [24, 52, 92], alpha: 0.86
          });
        });
        api.oilStroke(5, '高足瓷盘普鲁士蓝结构勾边', [[498, 408], [568, 466], [722, 466], [792, 408]], { width: 5, color: [28, 58, 98], alpha: 0.84 });
        api.oilHighlight(5, '果盘受光与苹果亮斑顿笔', 588, 304, 10, 6, -0.2, { color: [255, 252, 236], alpha: 0.94, count: 3 });
      }
    },

    // =========================================================================
    // 3. LANDSCAPE TUTORIAL: IMPRESSIONIST SUNLIT POPLARS & RIVER REFLECTIONS
    // =========================================================================
    {
      id: 'oil-tut-land-impression',
      title: '经典油画教程·莫奈式阳光白杨与河岸',
      subtitle: '法国印象派外光分色法：紫青晴空铺底 → 远岸淡紫暗调 → 韵律白杨金绿树冠 → 河水碎笔倒影 → 阳光亮黄点彩',
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
      desc: '纯正印象派外光色分解示范（莫奈《埃普特河畔的白杨树》图式）：全画不用纯黑，以有机松动的金绿斜笔写白杨树冠，水平碎笔织出河面冷紫金辉倒影。',
      layers: [
        { id: 1, name: '一 · 晴空天青粉紫渐变铺底' },
        { id: 2, name: '二 · 远岸青紫树影与河面透视' },
        { id: 3, name: '三 · 律动白杨列阵与金绿树冠' },
        { id: 4, name: '四 · 河水横向碎笔倒影与冷紫投影' },
        { id: 5, name: '五 · 暖阳柠檬黄与玫瑰粉外光点彩' }
      ],
      buildStrokes(api) {
        paintBackdrop(api, 1120, 820, [116, 172, 232], [178, 212, 238], [238, 218, 206], { layer: 1, label: '晴空天青粉紫渐变铺底' });
        for (let y = 485; y <= 835; y += 36) {
          const t = (y - 485) / 350;
          const col = [api.lerp(132, 86, t), api.lerp(174, 146, t), api.lerp(222, 208, t)];
          api.oilStroke(2, '河面透视钴蓝反光底层', [[-40, y], [560, y], [1160, y]], {
            width: 88, fade: 0.02, stretch: 0.72, color: col, colorEnd: col, alpha: 0.80, vary: 5
          });
        }
        for (let c = 0; c < 6; c++) {
          api.oilPatch(1, '夏日光雾柔粉絮云', 160 + c * 185, 135 + (c % 2) * 35, 125, 36, 0, {
            color: [248, 238, 230], colorEdge: [182, 202, 232], alpha: 0.72, count: 14
          });
        }

        api.oilPatch(2, '远岸冷紫淡青林带剪影', 600, 452, 590, 44, 0, { color: [108, 122, 158], colorEdge: [148, 162, 186], alpha: 0.86, count: 22 });
        paintBar(api, 2, '远岸草地暖绿岸堤带', -20, 488, 1140, 490, 24, [84, 126, 68], { colorEnd: [132, 166, 78], alpha: 0.92 });

        const trees = [
          { x: 175, topY: 58, trunkW: 15, crownW: 86 },
          { x: 312, topY: 94, trunkW: 13, crownW: 76 },
          { x: 436, topY: 132, trunkW: 12, crownW: 68 },
          { x: 545, topY: 170, trunkW: 10, crownW: 58 },
          { x: 642, topY: 202, trunkW: 9, crownW: 52 },
          { x: 730, topY: 226, trunkW: 8, crownW: 46 },
          { x: 810, topY: 244, trunkW: 7, crownW: 40 },
          { x: 882, topY: 262, trunkW: 6, crownW: 36 }
        ];
        trees.forEach((tr, idx) => {
          const baseY = 486;
          paintBar(api, 3, '白杨修长树干冷暖立势', tr.x, baseY, tr.x + (idx % 2 === 0 ? 5 : -5), tr.topY + 42, tr.trunkW, [106, 94, 116], {
            colorEnd: [136, 128, 142], alpha: 0.94
          });
          // Organic broken diagonal Impressionist canopy masses (no uniform horizontal stripes)
          const botCrown = baseY - 92 + (idx % 3) * 14;
          const boughs = 10;
          for (let b = 0; b < boughs; b++) {
            const frac = b / (boughs - 1);
            const fy = api.lerp(botCrown, tr.topY + 12, frac);
            const taper = Math.sin(frac * Math.PI * 0.9 + 0.2);
            const span = tr.crownW * (0.42 + taper * 0.62) * (0.8 + api.rand() * 0.35);
            const jx = (api.rand() - 0.5) * span * 0.45;
            api.oilStroke(3, '白杨背光翡翠紫灰叶簇', [
              [tr.x - span * 0.25 + jx, fy + 18], [tr.x + span * 0.45 + jx, fy - 14]
            ], { width: 32 + (1 - idx / 8) * 12, stretch: 0.72, color: b % 2 === 0 ? [48, 98, 72] : [68, 94, 116], alpha: 0.86, bristle: 0.50 });
            api.oilStroke(3, '白杨向阳鲜绿金黄碎彩笔触', [
              [tr.x - span * 0.52 + jx, fy + 8], [tr.x + span * 0.22 + jx, fy - 18]
            ], { width: 28 + (1 - idx / 8) * 10, stretch: 0.72, color: b % 2 === 0 ? [126, 178, 56] : [206, 212, 68], alpha: 0.88, bristle: 0.52 });
          }
          for (let ry = 504; ry <= 795; ry += 19) {
            if (ry > 504 + (486 - tr.topY) * 0.84) continue;
            const sway = Math.sin(ry * 0.08 + idx) * (8 + ((ry - 504) / 290) * 12);
            const rCol = (ry + idx * 17) % 3 === 0 ? [68, 126, 98]
              : ((ry + idx * 17) % 3 === 1 ? [138, 172, 92] : [118, 134, 184]);
            paintBar(api, 4, '河面横向碎笔树影倒影', tr.x - tr.crownW * 0.52 + sway, ry, tr.x + tr.crownW * 0.52 + sway, ry, 10, rCol, { alpha: 0.74 });
          }
        });

        for (let r = 0; r < 54; r++) {
          const rx = 45 + ((r * 173) % 1030);
          const ry = 505 + ((r * 41) % 300);
          const len = 36 + (ry - 505) * 0.14;
          const pal = r % 4 === 0 ? [246, 224, 128]
            : (r % 4 === 1 ? [242, 198, 212]
              : (r % 4 === 2 ? [154, 206, 238] : [188, 168, 218]));
          paintBar(api, 5, '阳光外光水面横向碎彩跳动', rx - len * 0.5, ry, rx + len * 0.5, ry, 7, pal, { alpha: 0.82 });
        }
        api.oilHighlight(5, '梢头树冠外光柠檬黄高光点', 175, 118, 16, 12, 0, { color: [252, 238, 112], alpha: 0.86, count: 5 });
        api.oilHighlight(5, '次树冠暖阳金绿外光点彩', 310, 148, 14, 12, 0, { color: [248, 232, 104], alpha: 0.86, count: 4 });
      }
    },

    // =========================================================================
    // 4. LANDSCAPE TUTORIAL: ROMANTIC ALPINE PEAKS & WATERFALL (HUDSON RIVER)
    // =========================================================================
    {
      id: 'oil-tut-land-hudson',
      title: '经典油画教程·古典浪漫派雪山飞瀑',
      subtitle: '哈德逊河派大气透视法：暮金晚霞湿接 → 巍峨雪峰冷暖斜切 → 苍翠林谷碧潭 → 悬崖飞瀑白雾 → 前景松石金光',
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
      desc: '经典19世纪浪漫主义壮丽山水教程：演示“前实后虚、远冷近暖”大气透视，左侧落日金辉雕琢崎岖雪峰棱脊，悬崖飞瀑注入碧潭水波。',
      layers: [
        { id: 1, name: '一 · 暮金琥珀天光与霞云湿接' },
        { id: 2, name: '二 · 大气透视远山与雪脊冷暖分面' },
        { id: 3, name: '三 · 中景松林河谷与碧潭铺底' },
        { id: 4, name: '四 · 悬崖飞瀑白练与水雾漫射' },
        { id: 5, name: '五 · 前景苍松斜枝与水面碎金' }
      ],
      buildStrokes(api) {
        paintBackdrop(api, 1120, 820, [68, 92, 134], [198, 146, 108], [248, 198, 116], { layer: 1, label: '暮金琥珀晚霞天光湿接' });
        for (let c = 0; c < 6; c++) {
          api.oilPatch(1, '玫瑰金镶边晚霞浮云', 180 + c * 175, 115 + (c % 2) * 32, 135, 34, -0.05, {
            color: [248, 212, 152], colorEdge: [118, 112, 144], alpha: 0.62, count: 14
          });
        }

        // Layer 2: Craggy seamless Alpine mountains
        const farRidgeLeft = [[785, 156], [732, 232], [658, 298], [588, 392]];
        const farRidgeCenter = [[785, 156], [802, 244], [786, 326], [798, 392]];
        const farRidgeRight = [[785, 156], [862, 226], [928, 308], [1005, 392]];
        paintPolygonFill(api, 2, '远峰背光蓝紫冷影崖面', farRidgeCenter, farRidgeRight, [92, 114, 154], [76, 98, 138], { rows: 16, alpha: 0.94 });
        paintPolygonFill(api, 2, '远峰西照暖金雪脊亮坡', farRidgeLeft, farRidgeCenter, [246, 214, 184], [214, 178, 152], { rows: 16, alpha: 0.94 });

        const mainLeft = [[438, 102], [358, 192], [254, 276], [135, 420]];
        const mainSpine = [[438, 102], [468, 196], [436, 306], [462, 420]];
        const mainRight = [[438, 102], [534, 188], [648, 296], [765, 420]];
        paintPolygonFill(api, 2, '主峰背阴钴蓝冷谷雪壁', mainSpine, mainRight, [66, 90, 132], [52, 76, 116], { rows: 20, alpha: 0.96 });
        paintPolygonFill(api, 2, '主峰受暮阳暖辉雪岩脊坡', mainLeft, mainSpine, [252, 236, 212], [224, 198, 174], { rows: 20, alpha: 0.98 });
        api.oilStroke(2, '主峰嶙峋岩脉深青裸岩', [[456, 180], [505, 255], [568, 345]], { width: 16, color: [58, 72, 98], alpha: 0.88 });
        api.oilStroke(2, '雪峰左侧暖琥珀受光支脊', [[358, 192], [312, 290], [230, 395]], { width: 20, color: [248, 226, 188], alpha: 0.90 });

        // Layer 3: Midground evergreen gorge walls & emerald pool
        api.oilPatch(3, '左侧苍郁冷杉山坡斜壁', 160, 465, 290, 115, 0.25, { color: [38, 62, 46], colorEdge: [24, 42, 34], alpha: 0.95, count: 22 });
        api.oilPatch(3, '右侧深岩峡谷悬崖壁面', 880, 495, 310, 145, -0.18, { color: [48, 52, 58], colorEdge: [24, 28, 34], alpha: 0.95, count: 22 });
        paintTableBand(api, 1120, 820, 565, [34, 96, 88], [18, 48, 52], 3, '幽深翡翠冰川潭水平铺');

        // Layer 4: Cascading white waterfall & mist
        api.oilStroke(4, '悬崖飞瀑银河主水流', [[545, 435], [554, 512], [546, 595]], { width: 54, fade: 0.04, color: [198, 224, 232], colorEnd: [252, 250, 242], alpha: 0.90 });
        for (let k = -1; k <= 1; k++) {
          api.oilStroke(4, '飞瀑垂落碎水白练丝缕', [[546 + k * 14, 442], [550 + k * 16, 520], [545 + k * 18, 600]], {
            width: 14, color: [254, 254, 250], alpha: 0.88
          });
        }
        api.oilPatch(4, '瀑底腾空氤氲水雾光晕', 548, 604, 128, 46, 0, { color: [246, 248, 244], colorEdge: [122, 168, 168], alpha: 0.64, count: 16 });

        // Layer 5: Craggy boulders & sentinel pines
        api.oilPatch(5, '前景左下暗赭嶙峋岩石岸坡', 140, 745, 250, 110, 0.14, { color: [44, 34, 26], colorEdge: [18, 16, 14], alpha: 0.96, count: 18 });
        api.oilPatch(5, '前景右下深褐暗岩与枯枝石台', 980, 735, 240, 120, -0.12, { color: [38, 32, 28], colorEdge: [16, 14, 12], alpha: 0.96, count: 18 });
        [[86, 685, 265], [156, 705, 355], [1032, 695, 295], [968, 715, 398]].forEach(([px, py0, py1], idx) => {
          paintBar(api, 5, '前景苍松劲拔深干剪影', px, py0, px + (idx % 2 ? -4 : 4), py1, 15, [22, 26, 20], { alpha: 0.96 });
          for (let b = 0; b < 9; b++) {
            const frac = b / 8;
            const by = api.lerp(py1 + 18, py0 - 65, frac);
            const span = (18 + frac * 54) * (0.85 + (b % 2) * 0.28);
            const dip = 14 + frac * 10;
            api.oilStroke(5, '冷杉层叠苍黑针叶枝扇', [[px - span, by + dip], [px + (b % 2 ? -6 : 6), by], [px + span * 0.92, by + dip * 0.85]], {
              width: 18 + frac * 6, color: b % 3 === 0 ? [28, 46, 30] : [18, 30, 22], alpha: 0.94, bristle: 0.52
            });
          }
        });
        for (let r = 0; r < 18; r++) {
          const rx = 380 + ((r * 137) % 360) + (api.rand() - 0.5) * 80;
          const ry = 632 + ((r * 17) % 165);
          const halfLen = 28 + ((ry - 632) / 165) * 42 + (r % 3) * 14;
          paintBar(api, 5, '碧潭碎金夕照反光水波', rx - halfLen, ry, rx + halfLen, ry, 6.5, r % 2 === 0 ? [246, 212, 138] : [178, 222, 220], { alpha: 0.68 });
        }
        api.oilHighlight(5, '雪峰左脊金辉强光点睛', 428, 135, 16, 22, -0.3, { color: [255, 246, 206], alpha: 0.86, count: 5 });
        api.oilHighlight(5, '前景岩石受暮光暖金棱边', 210, 682, 24, 9, 0.2, { color: [218, 152, 86], alpha: 0.72, count: 4 });
      }
    },

    // =========================================================================
    // 5. PORTRAIT TUTORIAL: ZORN LIMITED-PALETTE CLASSIC SIDE-LIT PORTRAIT
    // =========================================================================
    {
      id: 'oil-tut-fig-zorn',
      title: '经典油画教程·佐恩四色盘古典侧光女肖像',
      subtitle: '佐恩限制色盘直接画法（白+黄赭+朱红+象牙黑）：灰绿调和底 → 头颈肩自然比例 → 冷暖二分塑面 → 发髻五官 → 白绸领',
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
      desc: '安德斯·佐恩经典四色限制色盘肖像教程（钛白、黄赭、朱红、象牙黑），丝滑衔接人体比例头颈肩，展现45°顶侧光下柔和冷暖灰与生动直接笔触。',
      layers: [
        { id: 1, name: '一 · 象牙黑与黄赭调和灰绿底' },
        { id: 2, name: '二 · 头颈肩自然比例与发髻起稿' },
        { id: 3, name: '三 · 佐恩四色冷暖肤色大块面塑形' },
        { id: 4, name: '四 · 眉眼鼻唇五官与卷发柔和梳理' },
        { id: 5, name: '五 · 额鼻高光与白绸衣领厚涂笔触' }
      ],
      buildStrokes(api) {
        paintBackdrop(api, 920, 1120, [74, 70, 56], [86, 80, 64], [52, 48, 38], { layer: 1, label: '黑+黄赭调和灰绿暗底' });
        api.oilPatch(1, '人物背后柔和暖灰氛围反光', 410, 420, 240, 260, 0, { color: [112, 102, 82], colorEdge: [68, 64, 52], alpha: 0.58, count: 16 });

        // Layer 2: Grounded classic half-length bust extending naturally past bottom frame
        paintPolygonFill(api, 2, '黑衣斜肩上身沉稳体块', [
          [265, 675], [165, 810], [115, 1140]
        ], [
          [655, 675], [755, 810], [805, 1140]
        ], [32, 30, 28], [16, 15, 14], { colorRight: [18, 17, 16], rows: 16, width: 88, alpha: 0.98 });
        paintSolidOval(api, 2, '肩线圆润自然承接暗底', 460, 710, 205, 68, [28, 26, 24], {
          colorRight: [20, 19, 18], colorEnd: [22, 20, 18], rows: 8, alpha: 0.96
        });
        // Smooth neck cylinder (top inside jaw y=500 -> collar bone & V-neck plunge y=665)
        paintPolygonFill(api, 2, '颈肩一体化暗赭过渡底层', [[406, 505], [398, 665]], [[514, 505], [528, 665]], [162, 116, 86], [108, 78, 64], {
          colorRight: [82, 66, 58], rows: 10, alpha: 0.96
        });
        paintPolygonFill(api, 2, '颈部左侧受光暖黄赭立面', [[410, 515], [404, 650]], [[462, 515], [462, 655]], [210, 162, 122], [186, 138, 104], {
          rows: 8, alpha: 0.92
        });

        // Sculpted hair & low chignon bun behind right ear
        paintSolidOval(api, 2, '盘发后脑饱满乌黑底块', 470, 365, 144, 166, [34, 28, 26], { colorEnd: [20, 18, 16], rows: 16, alpha: 0.96 });
        paintSolidOval(api, 2, '右后脑低盘发髻暗褐反光', 585, 422, 54, 64, [58, 40, 32], { colorEnd: [28, 22, 20], rows: 8, alpha: 0.92 });

        // Layer 3: Sculpted three-quarter female head (centered 456, 402, chin at ~545) — seamless!
        paintSolidOval(api, 3, '头部卵形冷灰暗面基础造型', 460, 402, 108, 144, [156, 132, 116], {
          colorRight: [82, 74, 70], colorEnd: [92, 80, 74], rows: 18, alpha: 0.96
        });
        paintPolygonFill(api, 3, '左半脸受光暖黄赭主亮块面', [[368, 308], [362, 428], [414, 535]], [[474, 298], [468, 430], [468, 538]], [230, 184, 144], [202, 154, 118], {
          colorRight: [178, 140, 114], rows: 14, alpha: 0.92
        });
        api.oilStroke(3, '下颌转折线柔和暖褐暗凹', [[402, 532], [454, 548], [520, 524]], { width: 12, color: [92, 66, 56], alpha: 0.65 });
        api.oilPatch(3, '颧颊朱红血色柔和微晕', 392, 438, 36, 28, 0, { color: [208, 114, 88], colorEdge: [216, 166, 128], alpha: 0.45, count: 8 });

        // Layer 4: Natural swept parted hair, eyes, sculpted nose, warm lips
        api.oilStroke(4, '中偏左顺滑刘海左分披发', [[438, 256], [374, 282], [348, 358], [350, 438]], { width: 32, color: [36, 28, 24], colorEnd: [64, 46, 36], alpha: 0.94 });
        api.oilStroke(4, '右侧柔波浪蓬松盘发披拂', [[438, 256], [524, 274], [568, 355], [576, 440]], { width: 34, color: [28, 24, 22], colorEnd: [48, 36, 30], alpha: 0.95 });
        api.oilStroke(4, '额发顺光焦赭丝缕亮泽', [[396, 266], [360, 308], [352, 362]], { width: 11, color: [96, 66, 48], alpha: 0.78 });

        paintEye(api, 4, '左眼（受光侧）', 406, 384, 34, [66, 52, 42], [54, 40, 32], 0.22);
        paintEye(api, 4, '右眼（暗侧转折）', 494, 386, 32, [58, 48, 40], [48, 36, 28], 0.34);
        paintBar(api, 4, '鼻梁正面受光暖黄赭笔触', 444, 380, 436, 444, 13, [236, 192, 152], { alpha: 0.84 });
        paintBar(api, 4, '鼻翼右侧暗影转折', 454, 386, 462, 448, 10, [118, 92, 82], { alpha: 0.70 });
        api.oilStroke(4, '鼻尖底部温和红褐暗面', [[426, 452], [440, 456], [456, 452]], { width: 6, color: [98, 58, 48], alpha: 0.82 });
        api.oilStroke(4, '朱红上唇弓柔和勾勒', [[410, 488], [438, 483], [468, 488]], { width: 8, color: [158, 56, 46], alpha: 0.94 });
        api.oilStroke(4, '下唇受光朱红肉色饱满笔触', [[418, 496], [440, 500], [462, 496]], { width: 9.5, color: [206, 92, 76], alpha: 0.92 });

        // Layer 5: Loose alla prima ivory-white silk collar & warm portrait impasto highlights right at shoulders y=635..735
        api.oilStroke(5, '左肩白绸披领阔笔斜扫', [[298, 650], [368, 705], [456, 736]], { width: 38, color: [236, 230, 216], colorEnd: [192, 186, 172], alpha: 0.95, bristle: 0.52 });
        api.oilStroke(5, '右肩白绸披领冷灰顺扫', [[622, 636], [552, 700], [464, 736]], { width: 36, color: [212, 208, 198], colorEnd: [156, 154, 148], alpha: 0.92, bristle: 0.52 });
        api.oilStroke(5, '左额头最亮受光直接排笔', [[386, 322], [412, 318], [438, 326]], { width: 22, color: [246, 218, 182], alpha: 0.78 });
        api.oilHighlight(5, '鼻尖与上唇缘微亮高光', 434, 444, 5, 5, 0, { color: [252, 236, 208], alpha: 0.84, count: 2 });
        api.oilHighlight(5, '白领口胸前高光厚涂一笔', 388, 692, 22, 9, 0.35, { color: [254, 252, 244], alpha: 0.92, count: 4 });
      }
    },

    // =========================================================================
    // 6. PORTRAIT TUTORIAL: FAUVISM EXPRESSIVE HAT PORTRAIT (MATISSE / DERAIN)
    // =========================================================================
    {
      id: 'oil-tut-fig-fauve',
      title: '经典油画教程·野兽派撞色戴帽女子',
      subtitle: '野兽派表现色彩解放法：松石绯红撞色底 → 阔檐紫蓝礼帽 → 橘黄翡翠鼻影面 → 群青粗轮廓 → 高纯度羽饰高光',
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
      desc: '致敬马蒂斯《戴帽子的女人》经典野兽派教程：丝滑奔放排笔打造阔檐紫帽与自然比例人像，翠绿鼻梁暗面与明橘受光面强烈撞色并附群青雕塑感外线。',
      layers: [
        { id: 1, name: '一 · 绯红松石与明黄撞色背景' },
        { id: 2, name: '二 · 宽檐礼帽与撞色披肩起势' },
        { id: 3, name: '三 · 暖橘受光面与翡翠绿暗面塑形' },
        { id: 4, name: '四 · 群青深紫粗轮廓与表现五官' },
        { id: 5, name: '五 · 彩羽帽饰与高纯度厚涂亮彩' }
      ],
      buildStrokes(api) {
        for (let y = -10; y <= 1150; y += 46) {
          const leftCol = y < 580 ? [212, 58, 72] : [234, 146, 48];
          const rightCol = y < 620 ? [38, 162, 154] : [36, 98, 134];
          api.oilStroke(1, '左侧绯红橘金撞色背景铺涂', [[-40, y], [220, y + 6], [470, y - 6]], {
            width: 112, stretch: 0.72, fade: 0.04, color: leftCol, colorEnd: [188, 48, 86], alpha: 0.80, vary: 8
          });
          api.oilStroke(1, '右侧松石翡翠撞色背景铺涂', [[450, y], [700, y - 6], [960, y + 6]], {
            width: 112, stretch: 0.72, fade: 0.04, color: rightCol, colorEnd: [48, 178, 146], alpha: 0.80, vary: 8
          });
        }

        // Layer 2: Grounded half-length cobalt dress bodice + wide-brimmed violet hat
        paintPolygonFill(api, 2, '钴蓝与群青宽大披肩裙身', [
          [260, 695], [150, 845], [105, 1140]
        ], [
          [660, 695], [770, 845], [815, 1140]
        ], [42, 76, 168], [22, 38, 98], { colorRight: [24, 46, 126], rows: 16, width: 88, alpha: 0.98 });
        paintSolidOval(api, 2, '群青斜肩承接帽下体块', 460, 735, 208, 66, [38, 72, 162], {
          colorRight: [26, 48, 128], colorEnd: [32, 62, 146], rows: 8, alpha: 0.96
        });
        api.oilStroke(2, '领口翡翠绿与橘红装饰织带', [[285, 680], [395, 745], [462, 765], [535, 745], [640, 675]], { width: 32, color: [52, 172, 128], colorEnd: [232, 62, 54], alpha: 0.94 });
        paintSolidOval(api, 2, '深紫群青阔檐礼帽斜盘', 475, 232, 285, 118, [68, 48, 138], { colorEnd: [36, 38, 108], rows: 16, rot: -0.14, alpha: 0.96 });
        api.oilStroke(2, '礼帽左卷边鲜绿明暗撞色反光', [[228, 288], [378, 300], [555, 258]], { width: 36, color: [62, 172, 98], colorEnd: [38, 112, 134], alpha: 0.88 });

        // Layer 3: Proportional neck (chin ~560 -> collarbone ~695) + Fauve orange-gold / emerald head
        paintPolygonFill(api, 3, '颈部撞色橘黄与翠绿双色立柱', [[410, 520], [400, 695]], [[510, 520], [526, 695]], [244, 186, 62], [52, 168, 122], {
          colorRight: [44, 158, 118], rows: 10, alpha: 0.96
        });

        paintSolidOval(api, 3, '面庞暖橘金黄与翡翠暗面打底', 456, 432, 106, 142, [248, 192, 78], {
          colorRight: [56, 168, 98], colorEnd: [232, 116, 52], rows: 16, alpha: 0.98
        });
        paintPolygonFill(api, 3, '面庞右侧野兽派翡翠绿阴影面', [[482, 318], [492, 446], [468, 562]], [[562, 338], [564, 452], [528, 550]], [54, 172, 98], [36, 126, 94], {
          rows: 12, alpha: 0.90
        });
        api.oilStroke(3, '鼻梁与鼻侧曲折翡翠绿暗带', [[472, 386], [482, 434], [476, 478]], { width: 17, color: [44, 166, 94], alpha: 0.92 });
        api.oilPatch(3, '左颧颊炽艳珊瑚红晕', 382, 474, 34, 28, 0, { color: [236, 78, 72], alpha: 0.68, count: 7 });

        // Layer 4: Auburn/ultramarine hair + expressive ultramarine contour & vivid lips
        api.oilStroke(4, '左颊帽子下方朱赭波浪卷发', [[338, 342], [318, 425], [334, 496]], { width: 26, color: [176, 46, 38], alpha: 0.94 });
        api.oilStroke(4, '右颊帽子下方群青波浪卷发', [[568, 342], [584, 428], [566, 496]], { width: 26, color: [42, 62, 148], alpha: 0.94 });
        api.oilStroke(4, '群青深紫面部外轮廓奔放勾线', [
          [348, 346], [338, 432], [364, 524], [446, 580], [536, 548], [566, 438], [558, 344]
        ], { width: 8.5, color: [32, 52, 148], alpha: 0.90 });

        paintEye(api, 4, '左眼野兽派青蓝眉眼', 404, 420, 36, [34, 68, 152], [38, 86, 154], 0.24);
        paintEye(api, 4, '右眼翠绿眼窝对比', 510, 422, 34, [34, 68, 152], [32, 74, 138], 0.34);
        paintBar(api, 4, '鼻梁明黄亮面与鼻头勾勒', 456, 388, 452, 478, 11, [252, 218, 92], { alpha: 0.92 });
        api.oilStroke(4, '炽烈胭脂红立体双唇', [[422, 524], [460, 518], [498, 524]], { width: 10, color: [218, 32, 66], alpha: 0.96 });
        api.oilStroke(4, '下唇高纯度橘红亮色', [[428, 534], [460, 538], [492, 534]], { width: 9.5, color: [244, 78, 58], alpha: 0.94 });

        // Layer 5: Hat plumes & vivid chromatic highlights
        api.oilPatch(5, '礼帽顶绯红大花卉色团', 368, 175, 56, 40, -0.3, { color: [228, 46, 56], colorEdge: [168, 28, 48], alpha: 0.94, count: 12 });
        api.oilPatch(5, '帽饰明黄柠檬花羽', 525, 162, 68, 34, 0.2, { color: [250, 212, 48], colorEdge: [226, 138, 34], alpha: 0.94, count: 12 });
        api.oilStroke(5, '礼帽孔雀绿弯曲饰羽甩笔', [[435, 158], [555, 112], [682, 135]], { width: 22, color: [48, 186, 136], colorEnd: [148, 224, 92], alpha: 0.92 });
        api.oilStroke(5, '左额头明黄纯色直接排笔', [[386, 360], [416, 354], [442, 362]], { width: 18, color: [255, 240, 118], alpha: 0.88 });
        api.oilHighlight(5, '颈锁与衣襟野兽派橘金点睛', 425, 685, 16, 8, 0.2, { color: [252, 206, 68], alpha: 0.90, count: 4 });
      }
    }
  ];

  window.Code2PaintCatalog.addPack(WORKS);
})();
