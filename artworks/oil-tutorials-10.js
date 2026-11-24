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
        width: 112, stretch: 0.78, fade: 0.02, color: col, colorEnd: col, alpha: 0.76, vary: 4, bristle: 0.30
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

  function paintKnifeSlab(api, layer, label, x1, y1, x2, y2, width, col, opts = {}) {
    api.oilStroke(layer, label, [[x1, y1], [(x1 + x2) * 0.5, (y1 + y2) * 0.5], [x2, y2]], {
      width,
      stretch: opts.stretch || 0.34,
      fade: 0.02,
      color: col,
      colorEnd: opts.colorEnd || col,
      alpha: opts.alpha == null ? 0.92 : opts.alpha,
      vary: opts.vary == null ? 6 : opts.vary,
      bristle: 0.16
    });
  }

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

  const WORKS = [
    // =========================================================================
    // 1. PALETTE KNIFE IMPASTO: PARIS RAINY BOULEVARD AT NIGHT
    // =========================================================================
    {
      id: 'oil-tut-10-knife-rain',
      title: '刮刀厚涂教程·雨夜巴黎霓虹街景',
      subtitle: '画刀厚涂技法（Impasto）：雾靛夜幕打底 → 豪斯曼建筑压刀 → 猩红咖啡篷与华灯 → 湿漉路面纵刮倒影 → 伞下行人与刀锋提亮',
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
      desc: '经典大笔刷油画刀厚涂街景教程（Leonid Afremov风格）：示范画刀平推建筑墙体、拉刀竖刮湿润石板路面的霓虹灯倒影与暖红伞下剪影。',
      layers: [
        { id: 1, name: '一 · 雾靛暮雨夜空大底铺涂' },
        { id: 2, name: '二 · 透视街廓与豪斯曼建筑体块' },
        { id: 3, name: '三 · 霓虹橱窗、红篷与街道街灯' },
        { id: 4, name: '四 · 湿石路面画刀纵刮倒影光带' },
        { id: 5, name: '五 · 伞下行人剪影与刀锋炽白高光' }
      ],
      buildStrokes(api) {
        paintBackdrop(api, 1120, 820, [16, 26, 48], [28, 44, 74], [18, 24, 38], { layer: 1, label: '暮雨钴靛夜空铺底' });
        paintTableBand(api, 1120, 820, 485, [32, 42, 62], [18, 24, 38], 1, '雨夜石板湿润长街打底');

        // Perspective Haussmann facades receding to center vanishing point (560, 470)
        paintPolygonFill(api, 2, '左侧透视巴黎复古建筑楼群', [[-20, 40], [-20, 505]], [[455, 290], [455, 482]], [46, 56, 78], [28, 34, 48], {
          colorRight: [32, 38, 56], rows: 14, width: 68, alpha: 0.94
        });
        paintPolygonFill(api, 2, '右侧透视临街公寓与屋顶', [[665, 295], [665, 482]], [[1140, 35], [1140, 510]], [42, 52, 74], [24, 30, 46], {
          colorRight: [26, 32, 48], rows: 14, width: 68, alpha: 0.94
        });
        // Knife-applied slate Mansard roof slabs & crisp architectural ledges
        paintKnifeSlab(api, 2, '左侧建筑斜坡石板屋檐', -20, 85, 460, 300, 36, [24, 30, 48], { alpha: 0.94 });
        paintKnifeSlab(api, 2, '右侧建筑斜坡屋檐刀锋', 660, 302, 1140, 82, 36, [22, 28, 44], { alpha: 0.94 });

        // Warm lit apartment windows & seamless Haussmann café awning blocks
        for (let k = 0; k < 6; k++) {
          const lx = 90 + k * 64, ly = 195 + k * 28;
          paintKnifeSlab(api, 3, '左楼暖橘透光窗棂刀块', lx, ly, lx + 26, ly + 4, 34, k % 2 === 0 ? [246, 178, 66] : [132, 168, 206], { alpha: 0.88 });
          const rx = 710 + k * 66, ry = 335 - k * 24;
          paintKnifeSlab(api, 3, '右楼霓虹窗口色彩刀斑', rx, ry, rx + 26, ry - 4, 34, k % 2 === 0 ? [252, 196, 82] : [96, 148, 198], { alpha: 0.86 });
        }
        // Rich illuminated café shopfronts & crimson awnings (solid architectural warmth)
        paintPolygonFill(api, 3, '左街角猩红咖啡馆大雨篷', [[0, 368], [0, 412]], [[368, 434], [368, 456]], [212, 44, 34], [148, 24, 22], { rows: 6, width: 22, alpha: 0.96 });
        paintPolygonFill(api, 3, '左咖啡厅暖金玻璃橱窗', [[12, 412], [12, 476]], [[360, 456], [360, 480]], [252, 192, 68], [224, 134, 44], { rows: 6, width: 24, alpha: 0.92 });
        paintPolygonFill(api, 3, '右街商铺紫红大雨篷', [[768, 436], [768, 458]], [[1120, 368], [1120, 414]], [198, 44, 58], [138, 26, 40], { rows: 6, width: 22, alpha: 0.96 });
        paintPolygonFill(api, 3, '右铺琥珀暖光橱窗透影', [[776, 458], [776, 482]], [[1112, 414], [1112, 480]], [246, 178, 62], [204, 118, 42], { rows: 6, width: 24, alpha: 0.90 });

        // Glowing boulevard streetlamps receding into fog
        const lamps = [[210, 315, 22], [350, 365, 16], [448, 398, 12], [895, 312, 22], [755, 368, 16], [662, 400, 12]];
        lamps.forEach(([lx, ly, r]) => {
          paintBar(api, 3, '铸铁黑灯柱垂直立杆', lx, ly + 15, lx, 515, r * 0.45, [18, 20, 26], { alpha: 0.95 });
          api.oilPatch(3, '雨雾灯晕炽暖橘光晕', lx, ly, r * 3.1, r * 2.8, 0, { color: [252, 182, 58], colorEdge: [28, 44, 74], alpha: 0.62, count: 14 });
          api.oilHighlight(5, '路灯灯芯炽白金亮核心', lx, ly, r * 0.55, r * 0.55, 0, { color: [255, 250, 208], alpha: 0.98, count: 3 });
        });

        // Dramatic soft golden glow wash + organic knife-scraped rain reflections (no lattice diagonals!)
        api.oilPatch(4, '湿润长街霓虹橙金弥漫倒影晕', 310, 625, 240, 110, 0, { color: [224, 118, 46], colorEdge: [24, 34, 54], alpha: 0.44, count: 16 });
        api.oilPatch(4, '右街湿地面紫红琥珀倒影晕', 810, 635, 240, 110, 0, { color: [212, 98, 56], colorEdge: [24, 34, 54], alpha: 0.42, count: 16 });
        const reflPal = [[254, 198, 62], [224, 58, 44], [116, 168, 212], [248, 134, 48], [255, 236, 134]];
        for (let i = 0; i < 64; i++) {
          const rx = 45 + api.rand() * 1030;
          const ry = 505 + api.rand() * 275;
          const len = 34 + ((ry - 505) / 275) * 58;
          const col = reflPal[i % reflPal.length];
          paintKnifeSlab(api, 4, '湿润路面画刀纵刮彩色灯影', rx, ry, rx + (api.rand() - 0.5) * 6, Math.min(815, ry + len), 15 + (i % 3) * 6, col, { alpha: 0.80 });
        }

        // Silhouetted strolling pedestrians with colorful umbrellas
        const walkers = [[395, 595, 1.0, [218, 48, 42]], [432, 608, 0.96, [218, 48, 42]], [715, 558, 0.82, [58, 146, 186]], [548, 520, 0.62, [238, 178, 56]]];
        walkers.forEach(([wx, wy, sc, uCol]) => {
          paintBar(api, 5, '雨夜行人深色风衣剪影', wx, wy, wx, wy - 76 * sc, 24 * sc, [16, 18, 24], { alpha: 0.96 });
          paintBar(api, 5, '行人长影路面深色倒影', wx, wy + 4, wx, wy + 78 * sc, 18 * sc, [14, 16, 22], { alpha: 0.68 });
          api.oilStroke(5, '雨伞饱满彩色弧顶厚涂', [[wx - 34 * sc, wy - 78 * sc], [wx, wy - 96 * sc], [wx + 34 * sc, wy - 78 * sc]], {
            width: 18 * sc, color: uCol, alpha: 0.96
          });
        });
        paintKnifeSlab(api, 5, '路面中心炽白高光刮刀一抹', 525, 650, 540, 745, 16, [255, 246, 198], { alpha: 0.94 });
      }
    },

    // =========================================================================
    // 2. SFUMATO & LUMINOUS GLAZING: MISTY VENICE DAWN (TURNER / COROT)
    // =========================================================================
    {
      id: 'oil-tut-10-sfumato-mist',
      title: '薄涂晕染教程·雾锁威尼斯圣马可晨曦',
      subtitle: '古典薄涂透明罩染法（Glazing & Sfumato）：金玫渐变薄雾 → 隐约巴洛克穹顶与钟楼 → 透明阳光束 → 前景暗影木桩贡多拉',
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
      desc: '透纳式空气透明薄涂法教程：以柔边低饱和度的粉金、紫灰与银蓝多层罩染展现水雾迷蒙的威尼斯泻湖晨曦，再用硬朗重色前景木桩与贡多拉拉开万顷烟波纵深。',
      layers: [
        { id: 1, name: '一 · 玫瑰金与淡青灰柔和渐层底' },
        { id: 2, name: '二 · 晨雾弥漫泻湖倒影薄罩' },
        { id: 3, name: '三 · 若隐若现安康圣母院穹顶群' },
        { id: 4, name: '四 · 破雾斜射晨光透明光晕面纱' },
        { id: 5, name: '五 · 前景系船木桩、贡多拉与亮波' }
      ],
      buildStrokes(api) {
        paintBackdrop(api, 1120, 820, [138, 162, 194], [238, 198, 174], [248, 224, 178], { layer: 1, label: '晨曦天际粉金柔雾打底' });
        for (let y = 475; y <= 835; y += 38) {
          const t = (y - 475) / 360;
          const col = [api.lerp(244, 138, t), api.lerp(218, 152, t), api.lerp(182, 168, t)];
          api.oilStroke(2, '威尼斯平静泻湖反光微澜', [[-40, y], [560, y], [1160, y]], {
            width: 96, fade: 0.02, stretch: 0.72, color: col, colorEnd: col, alpha: 0.72, vary: 4
          });
        }

        // Layer 3: Soft Sfumato-veiled Santa Maria della Salute domes & St. Mark's Campanile emerging out of dawn fog
        paintSolidOval(api, 3, '安康圣母院大圆穹顶灰紫剪影', 610, 326, 78, 72, [126, 128, 146], { colorEnd: [168, 164, 176], rows: 10, alpha: 0.80 });
        paintBar(api, 3, '主穹顶顶部灯笼小尖塔', 610, 232, 610, 265, 16, [122, 124, 144], { alpha: 0.82 });
        paintSolidOval(api, 3, '次侧小圆穹顶远雾剪影', 705, 362, 46, 44, [134, 136, 152], { rows: 8, alpha: 0.76 });
        paintPolygonFill(api, 3, '巴洛克立面水平石墙群落', [[495, 378], [485, 476]], [[835, 392], [845, 476]], [136, 134, 148], [166, 156, 162], { rows: 10, alpha: 0.78 });
        // Tall slender St Mark Campanile belltower on left bank
        paintBar(api, 3, '圣马可钟楼挺拔淡紫雾影塔身', 268, 185, 268, 476, 36, [124, 128, 148], { colorEnd: [162, 158, 168], alpha: 0.74 });
        api.oilStroke(3, '钟楼尖顶小三角顶盖', [[248, 192], [268, 122], [288, 192]], { width: 12, color: [118, 122, 142], alpha: 0.78 });
        // Soft water reflections below hazy palace silhouettes
        api.oilPatch(3, '泻湖水中远建筑轻雾倒影', 635, 535, 195, 58, 0, { color: [148, 142, 154], colorEdge: [222, 198, 178], alpha: 0.42, count: 14 });

        // Layer 4: Radiant rising sun veiled gently behind sfumato translucent golden haze (soft veil, no laser beam!)
        api.oilPatch(4, '破雾晨阳温暖金辉漫射大光晕', 425, 315, 235, 195, 0, { color: [255, 242, 192], colorEdge: [242, 202, 172], alpha: 0.58, count: 22 });
        api.oilPatch(4, '薄雾遮掩的乳金朝阳核心', 425, 315, 52, 52, 0, { color: [255, 250, 224], colorEdge: [252, 226, 156], alpha: 0.84, count: 12 });
        api.oilPatch(4, '斜洒泻湖的轻柔晨曦暖光面纱', 520, 485, 165, 185, -0.35, { color: [255, 238, 178], colorEdge: [232, 196, 172], alpha: 0.36, count: 16 });

        // Layer 5: Crisp dark foreground Venetian mooring poles (paline) & gliding black gondola silhouette
        [[135, 795, 515], [182, 815, 555], [965, 810, 535], [1015, 795, 575]].forEach(([px, py0, py1]) => {
          paintBar(api, 5, '前景系船暗褐木桩立势', px, py0, px + 6, py1, 18, [26, 22, 22], { alpha: 0.96 });
          paintBar(api, 5, '木桩水中深影拉长波纹', px, py0, px, Math.min(820, py0 + 60), 14, [38, 34, 42], { alpha: 0.52 });
        });
        api.oilStroke(5, '前景优雅修长黑漆贡多拉船身', [[590, 668], [710, 688], [842, 666], [858, 636]], {
          width: 24, color: [18, 18, 22], alpha: 0.96
        });
        paintBar(api, 5, '船夫立姿剪影与长船桨', 810, 666, 812, 574, 15, [20, 20, 24], { alpha: 0.95 });
        paintBar(api, 5, '贡多拉船夫划水斜长木桨', 804, 608, 725, 735, 6, [24, 22, 22], { alpha: 0.92 });
        // Organic staggered sparkling sunlit water flecks beneath veiled sun
        for (let r = 0; r < 24; r++) {
          const t = r / 23;
          const ry = 492 + t * 295;
          const halfW = (18 + t * 58) * (0.55 + api.rand() * 0.75);
          const rx = 425 + (api.rand() - 0.5) * 48 * (0.4 + t);
          paintBar(api, 5, '晨阳泻湖金色细碎波光', rx - halfW, ry, rx + halfW, ry, 5.5, [255, 246, 198], { alpha: 0.78 });
        }
      }
    },

    // =========================================================================
    // 3. POINTILLISM / DIVISIONISM: SAINT-TROPEZ SUNLIT HARBOR
    // =========================================================================
    {
      id: 'oil-tut-10-pointillism-harbor',
      title: '点彩分色教程·圣特罗佩午后帆影',
      subtitle: '新印象派光学点彩法：暖赭底格划分 → 纯色并置短笔织天 → 南法橙红港口渔村 → 碧蓝海湾帆船 → 高纯互补亮彩点缀',
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
      desc: '保罗·西涅克《圣特罗佩港》点彩光学分色教程：不靠调色盘预混颜色，而是并置纯净钴蓝、柠檬黄、松石绿与橙红短方块笔触，由视觉远观自然混色发光。',
      layers: [
        { id: 1, name: '一 · 海岸晴天与碧湾色彩分区' },
        { id: 2, name: '二 · 并置纯净天青与粉紫点彩天幕' },
        { id: 3, name: '三 · 圣特罗佩粉橙港湾村舍列阵' },
        { id: 4, name: '四 · 碧蓝翡翠马赛克波光水纹' },
        { id: 5, name: '五 · 扬帆白艇与亮黄橘红互补点彩' }
      ],
      buildStrokes(api) {
        paintBackdrop(api, 1120, 820, [132, 178, 224], [198, 214, 228], [64, 152, 186], { layer: 1, label: '地中海暖阳晴空港湾打底' });
        paintTableBand(api, 1120, 820, 445, [48, 142, 182], [32, 98, 154], 1, '圣特罗佩地中海海湾底层');

        // Layer 2: Pointillist mosaic sky dabs using api.rand() (zero periodic lattice diagonal lines!)
        const skyDabs = [[88, 152, 218], [148, 192, 232], [238, 198, 196], [248, 224, 142], [116, 178, 194]];
        for (let i = 0; i < 145; i++) {
          const sx = 24 + api.rand() * 1072;
          const sy = 20 + api.rand() * 290;
          const col = skyDabs[i % skyDabs.length];
          api.oilStroke(2, '新印象派天幕并置纯色点彩短笔', [[sx - 15, sy], [sx, sy - 2], [sx + 15, sy]], {
            width: 15, stretch: 0.72, fade: 0.10, color: col, alpha: 0.84, vary: 5, bristle: 0.22
          });
        }

        // Layer 3: Sunlit Mediterranean terracotta/coral village & coastal hills (left/center horizon)
        paintPolygonFill(api, 3, '远岸紫青摩西山丘轮廓', [[20, 295], [20, 430]], [[645, 365], [645, 445]], [134, 128, 168], [94, 124, 152], { rows: 8, alpha: 0.88 });
        const houses = [
          [75, 360, 86, 78, [242, 168, 96]], [172, 345, 78, 92, [238, 134, 98]], [262, 372, 92, 68, [246, 206, 128]],
          [368, 355, 84, 84, [232, 116, 86]], [468, 375, 88, 66, [244, 182, 114]], [570, 382, 74, 58, [236, 142, 92]]
        ];
        houses.forEach(([hx, hy, hw, hh, col]) => {
          paintPolygonFill(api, 3, '地中海暖阳港口彩色小屋墙', [[hx, hy], [hx, hy + hh]], [[hx + hw, hy], [hx + hw, hy + hh]], col, [col[0] * 0.85, col[1] * 0.8, col[2] * 0.8], { rows: 6, alpha: 0.94 });
          paintKnifeSlab(api, 3, '南法赤陶红瓦屋顶斜块', hx - 6, hy - 8, hx + hw + 6, hy - 8, 22, [198, 72, 48], { alpha: 0.94 });
        });
        paintKnifeSlab(api, 3, '港湾海堤浅琥珀石砌岸线', 20, 444, 1100, 448, 16, [224, 196, 148], { alpha: 0.92 });

        // Layer 4: Vibrating mosaic sea strokes scattered naturally with api.rand()
        const seaDabs = [[36, 126, 174], [48, 168, 154], [28, 78, 148], [244, 212, 86], [148, 116, 176], [236, 166, 152]];
        for (let i = 0; i < 190; i++) {
          const sx = 24 + api.rand() * 1072;
          const sy = 468 + api.rand() * 332;
          const len = 22 + ((sy - 468) / 332) * 20;
          const col = seaDabs[i % seaDabs.length];
          api.oilStroke(4, '港湾海面分色光学马赛克横笔', [[sx - len * 0.5, sy], [sx, sy], [sx + len * 0.5, sy]], {
            width: 12 + (i % 3) * 3, stretch: 0.68, fade: 0.08, color: col, alpha: 0.86, vary: 6
          });
        }

        // Layer 5: Crisp white sunlit lateen/gaff rigged sailboats & vivid optical accent strokes
        const boats = [[320, 610, 1.05], [580, 565, 0.88], [840, 645, 1.15], [715, 505, 0.58]];
        boats.forEach(([bx, by, sc]) => {
          paintKnifeSlab(api, 5, '彩绘木帆船船身橙褐轮廓', bx - 46 * sc, by, bx + 48 * sc, by, 16 * sc, [186, 84, 48], { alpha: 0.96 });
          paintBar(api, 5, '帆船主桅杆与斜桁立线', bx, by, bx, by - 145 * sc, 5 * sc, [72, 52, 42], { alpha: 0.94 });
          paintPolygonFill(api, 5, '阳光照耀洁白主帆三角', [[bx + 4, by - 135 * sc], [bx + 4, by - 18 * sc]], [[bx + 4, by - 135 * sc], [bx + 76 * sc, by - 18 * sc]], [252, 246, 224], [244, 228, 176], { rows: 10, width: 16 * sc, alpha: 0.96 });
          // Complementary violet & gold reflection shimmer under boat
          for (let k = 0; k < 5; k++) {
            const ry = by + 20 * sc + k * 14 * sc;
            paintBar(api, 5, '白帆水中互补金紫倒影碎点', bx - 18 * sc, ry, bx + 38 * sc, ry, 7, k % 2 === 0 ? [252, 232, 134] : [148, 122, 178], { alpha: 0.82 });
          }
        });
      }
    },

    // =========================================================================
    // 4. CHIAROSCURO LIGHTING: CANDLELIT MAHOGANY VIOLIN & SHEET MUSIC
    // =========================================================================
    {
      id: 'oil-tut-10-chiaroscuro-violin',
      title: '明暗对照教程·烛光古提琴与乐谱',
      subtitle: '卡拉瓦乔明暗对照法（Chiaroscuro）：极暗背景聚光 → 象牙乐谱与翡翠丝绸 → 桃花心木漆提琴塑形 → 蜂蜡摇曳烛光 → 清漆高光',
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
      desc: '巴洛克剧场感明暗对照（Chiaroscuro）教程：用80%深褐色阴影衬托右侧一点摇曳烛火，集中打亮桌面乐谱、翡翠绿缎布与红木亮漆小提琴的弧面曲线。',
      layers: [
        { id: 1, name: '一 · 极暗焦褐古典画室背景铺涂' },
        { id: 2, name: '二 · 乐谱纸页、绿绸垂布与深影定势' },
        { id: 3, name: '三 · 桃花心木小提琴雕塑双弧琴身' },
        { id: 4, name: '四 · 铜烛台摇曳暖焰与琴弦琴弓' },
        { id: 5, name: '五 · 红木烤漆强反光与烛芯炽辉' }
      ],
      buildStrokes(api) {
        paintBackdrop(api, 920, 1120, [18, 12, 9], [28, 19, 13], [14, 10, 7], { layer: 1, label: '深黑焦褐明暗对照暗底' });
        paintTableBand(api, 920, 1120, 720, [52, 34, 20], [22, 14, 10], 1, '古老橡木台面深底铺涂');

        // Ambient warm candlelight glow pool radiating from upper-right candle (710, 395)
        api.oilPatch(1, '右侧烛火弥漫深室温暖橘晕', 675, 445, 290, 290, 0, { color: [98, 52, 22], colorEdge: [18, 12, 9], alpha: 0.56, count: 18 });

        // Layer 2: Aged parchment sheet music & emerald velvet cloth resting on tabletop
        paintPolygonFill(api, 2, '桌面左侧卷角羊皮古老乐谱纸', [[130, 740], [95, 925]], [[515, 725], [545, 895]], [214, 196, 158], [168, 146, 112], { rows: 12, alpha: 0.94 });
        for (let st = 0; st < 4; st++) {
          const sy = 768 + st * 30;
          api.oilStroke(2, '乐谱五线谱与手写音符微迹', [[145, sy], [315, sy - 6], [485, sy - 10]], { width: 3.2, color: [86, 68, 48], alpha: 0.64 });
        }
        paintPolygonFill(api, 2, '桌面右侧深翡翠绿丝绒布褶', [[460, 745], [510, 965]], [[780, 755], [845, 975]], [26, 74, 52], [14, 42, 30], { rows: 12, alpha: 0.94 });

        // Layer 3: Sculpted leaning vintage mahogany violin (lower bout ~cx=360, cy=690, upper ~cx=392, cy=495)
        paintSolidOval(api, 3, '小提琴宽厚下共鸣箱桃花心木色', 360, 695, 116, 122, [172, 74, 24], { colorRight: [82, 30, 14], colorEnd: [68, 24, 12], rot: 0.14, rows: 16, alpha: 0.98 });
        paintSolidOval(api, 3, '小提琴上共鸣箱暖红木塑形', 388, 502, 86, 92, [186, 82, 28], { colorRight: [88, 34, 16], rot: 0.14, rows: 14, alpha: 0.98 });
        // C-bout waist indent & sculpted bridge/tailpiece
        paintBar(api, 3, '小提琴修长乌木指板与琴颈', 415, 210, 376, 562, 24, [24, 18, 16], { alpha: 0.98 });
        api.oilPatch(3, '琴头蜗牛卷（Scroll）精雕', 420, 194, 20, 26, 0.2, { color: [152, 66, 24], colorEdge: [62, 24, 12], alpha: 0.96, count: 8 });
        paintPolygonFill(api, 3, '乌木拉弦板（Tailpiece）梯形块', [[338, 725], [322, 818]], [[374, 728], [362, 822]], [24, 18, 16], [16, 12, 10], { rows: 6, alpha: 0.96 });
        // Delicate S-shaped f-holes & golden maple bridge
        api.oilStroke(4, '提琴面板左侧古典音孔（f-hole）', [[312, 595], [318, 635], [304, 675]], { width: 6.5, color: [16, 10, 8], alpha: 0.92 });
        api.oilStroke(4, '提琴面板右侧受光音孔（f-hole）', [[422, 608], [412, 648], [418, 686]], { width: 6.5, color: [18, 10, 8], alpha: 0.92 });
        paintBar(api, 4, '浅枫木精致琴码（Bridge）', 345, 638, 392, 644, 7, [224, 178, 106], { alpha: 0.94 });

        // Fine four taut silver violin strings + mahogany bow resting diagonally across sheet music & body
        [-9, -3, 3, 9].forEach(dx => {
          paintBar(api, 4, '绷直银亮细琴弦', 415 + dx * 0.7, 225, 356 + dx, 730, 1.8, [224, 218, 204], { alpha: 0.72 });
        });
        paintBar(api, 4, '斜倚于乐谱间的红木琴弓弓杆', 180, 855, 595, 425, 6.5, [142, 64, 28], { alpha: 0.96 });
        paintBar(api, 4, '泛出淡白光泽的马尾弓毛', 184, 864, 598, 434, 3.2, [228, 220, 198], { alpha: 0.72 });

        // Layer 4/5: Tall brass candlestick & tall cream beeswax candle on right (cx=705)
        paintSolidOval(api, 4, '复古黄铜烛台圆形底座', 705, 785, 68, 22, [196, 152, 64], { colorRight: [82, 56, 22], rows: 5, alpha: 0.96 });
        paintBar(api, 4, '黄铜烛台雕塑立柱与托盘', 705, 595, 705, 782, 22, [178, 134, 54], { colorEnd: [92, 64, 24], alpha: 0.96 });
        paintBar(api, 4, '象牙白蜂蜡长支高蜡烛', 705, 428, 705, 595, 32, [238, 222, 186], { colorEnd: [162, 134, 96], alpha: 0.98 });
        // Radiant flickering candle flame & Chiaroscuro varnish catchlights on violin!
        api.oilPatch(5, '烛焰外圈橘红光环漫射', 705, 395, 64, 68, 0, { color: [252, 168, 48], colorEdge: [88, 38, 16], alpha: 0.68, count: 14 });
        api.oilHighlight(5, '水滴形金黄烛火外焰', 705, 396, 11, 24, 0, { color: [255, 228, 112], alpha: 0.96, count: 4 });
        api.oilHighlight(5, '烛焰中心炽白灼亮核心', 705, 404, 5, 11, 0, { color: [255, 254, 244], alpha: 0.98, count: 2 });
        // Violin glossy varnish catchlights catching the right candlelight!
        api.oilStroke(5, '小提琴右肩圆弧亮漆强反光', [[448, 472], [456, 515], [442, 558]], { width: 9, color: [255, 232, 168], alpha: 0.92 });
        api.oilStroke(5, '下琴箱边缘琥珀亮漆反光线', [[452, 652], [458, 702], [438, 752]], { width: 10, color: [254, 224, 152], alpha: 0.92 });
        api.oilHighlight(5, '黄铜烛台右受光锐利高光点', 714, 774, 8, 5, 0.2, { color: [255, 244, 188], alpha: 0.94, count: 3 });
      }
    },

    // =========================================================================
    // 5. ALLA PRIMA WET-ON-WET: BLUSH & CREAM PEONIES IN GLASS VASE
    // =========================================================================
    {
      id: 'oil-tut-10-allaprima-peonies',
      title: '直接画法教程·玻璃瓶盛放粉白芍药',
      subtitle: '湿压湿直接画法（Alla Prima）：鸽青柔壁铺底 → 通透玻璃花瓶与折光绿枝 → 大笔饱蘸塑芍药花团 → 叠瓣层次 → 桌面落瓣高光',
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
      desc: '一气呵成的直接画法（Alla Prima）花卉教程：不经底稿等待，饱蘸厚颜料在冷青灰底色上直接叠压塑造娇嫩粉白重瓣芍药、通透玻璃水瓶与桌面残红落瓣。',
      layers: [
        { id: 1, name: '一 · 鸽青灰墙与暖橡木桌铺底' },
        { id: 2, name: '二 · 通透玻璃水瓶与水中青梗' },
        { id: 3, name: '三 · 深叶群烘托与芍药胭脂暗心' },
        { id: 4, name: '四 · 饱蘸厚涂粉白重瓣芍药花头' },
        { id: 5, name: '五 · 玻璃亮线、瓣尖提亮与桌面落瓣' }
      ],
      buildStrokes(api) {
        paintBackdrop(api, 920, 1120, [78, 92, 88], [104, 118, 112], [68, 78, 74], { layer: 1, label: '冷鸽灰绿油画底色铺涂' });
        paintTableBand(api, 920, 1120, 775, [132, 108, 86], [84, 66, 52], 1, '橡木桌面直接横扫');
        api.oilPatch(1, '玻璃瓶与落花台面柔灰投影', 515, 875, 165, 38, 0.04, { color: [48, 38, 30], alpha: 0.72, count: 14 });

        // Layer 2: Clear glass pitcher/vase with aquatic green stems visibly refracted inside!
        paintPolygonFill(api, 2, '通透玻璃瓶身水蓝灰底影', [[368, 565], [352, 835]], [[552, 565], [568, 835]], [136, 158, 156], [108, 132, 134], { rows: 14, alpha: 0.72 });
        // Refracted green peony stems crossing cleanly through glass water!
        [[415, 515, 485, 815], [460, 505, 442, 822], [512, 515, 412, 812]].forEach(([x0, y0, x1, y1]) => {
          paintBar(api, 2, '透瓶绿色花茎水中斜折射', x0, y0, x1, y1, 10, [68, 114, 58], { colorEnd: [98, 146, 76], alpha: 0.86 });
        });
        paintSolidOval(api, 2, '玻璃瓶底部厚玻璃底盘反光', 460, 832, 106, 28, [168, 192, 192], { colorEnd: [84, 108, 108], rows: 6, alpha: 0.86 });
        paintBar(api, 2, '玻璃瓶水面椭圆反光银线', 362, 682, 558, 682, 6, [208, 224, 222], { alpha: 0.82 });

        // Layer 3: Lush emerald foliage cluster anchoring bloom silhouette + crimson bloom hearts
        const leaves = [[295, 515, -0.5], [625, 505, 0.4], [245, 375, -0.7], [658, 355, 0.6], [355, 225, -0.3], [565, 235, 0.3], [460, 555, 0]];
        leaves.forEach(([lx, ly, rot]) => {
          api.oilPatch(3, '翠绿厚重芍药复叶群簇', lx, ly, 64, 30, rot, { color: [52, 92, 52], colorEdge: [28, 54, 32], alpha: 0.90, count: 10 });
          paintBar(api, 3, '叶片受光嫩黄绿叶脉一笔', lx - 28, ly, lx + 26, ly - 4, 8, [118, 156, 76], { alpha: 0.78 });
        });

        // Layer 4: Generous lush Alla Prima peony blooms built from swirling thick petal strokes!
        function paintPeony(cx, cy, r, cOuter, cMid, cCore) {
          paintSolidOval(api, 3, '芍药重瓣暗粉心底色球', cx, cy, r, r * 0.90, cCore, { colorEnd: cOuter, rows: 10, alpha: 0.94 });
          // Outer & mid-tier thick curved petal sweeps loaded with unblended paint
          for (let p = 0; p < 12; p++) {
            const ang = (p / 12) * Math.PI * 2 + (cx % 1);
            const pr = r * (p % 2 === 0 ? 0.74 : 0.50);
            const px = cx + Math.cos(ang) * pr, py = cy + Math.sin(ang) * pr * 0.85;
            const tx = -Math.sin(ang) * r * 0.45, ty = Math.cos(ang) * r * 0.38;
            const col = p % 2 === 0 ? cOuter : cMid;
            api.oilStroke(4, '饱和厚涂叠压芍药花瓣', [[px - tx, py - ty], [px + Math.cos(ang) * 8, py + Math.sin(ang) * 8], [px + tx, py + ty]], {
              width: r * 0.36, stretch: 0.62, fade: 0.14, color: col, colorEnd: [255, 246, 242], alpha: 0.92, vary: 5, bristle: 0.42
            });
          }
          api.oilHighlight(5, '芍药花蕊隐约金黄点彩', cx, cy - 4, r * 0.14, r * 0.12, 0, { color: [248, 212, 76], alpha: 0.88, count: 4 });
        }
        paintPeony(310, 415, 82, [238, 166, 182], [248, 214, 222], [176, 56, 86]);
        paintPeony(588, 398, 78, [244, 232, 228], [254, 248, 242], [208, 118, 134]);
        paintPeony(462, 275, 86, [234, 146, 168], [248, 202, 212], [164, 48, 74]);
        paintPeony(448, 442, 92, [246, 236, 230], [254, 250, 246], [218, 138, 152]);
        paintPeony(625, 285, 54, [224, 112, 138], [242, 182, 196], [156, 38, 68]);

        // Layer 5: Crisp glass bottle highlights & romantic fallen petals resting on wooden table
        api.oilStroke(5, '玻璃瓶左壁通透窗格亮白竖线', [[374, 578], [368, 705], [372, 818]], { width: 10, color: [242, 250, 248], alpha: 0.90 });
        api.oilStroke(5, '玻璃瓶右壁冷青勾边反光', [[544, 582], [552, 710], [548, 818]], { width: 6, color: [212, 234, 232], alpha: 0.78 });
        paintBar(api, 5, '桌面左落樱粉单瓣一笔', 258, 864, 294, 874, 22, [244, 188, 198], { colorEnd: [254, 238, 240], alpha: 0.94 });
        paintBar(api, 5, '桌面右落乳白芍药残瓣', 642, 856, 676, 868, 20, [252, 244, 238], { alpha: 0.94 });
      }
    },

    // =========================================================================
    // 6. SCUMBLING & TURBULENT SEA: STORM WAVES & TALL SHIP (AIVAZOVSKY)
    // =========================================================================
    {
      id: 'oil-tut-10-scumbling-storm',
      title: '枯笔擦涂教程·怒海巨浪与古帆船',
      subtitle: '艾瓦佐夫斯基干刷擦涂法（Scumbling）：金青破云天光 → 深靛浪谷卷起 → 透光翡翠绿浪峰 → 远洋古帆船 → 枯笔飞溅白沫',
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
      desc: '浪漫海景大师艾瓦佐夫斯基技法教程：先铺深海青绿薄釉再于逆光浪尖罩染半透明翡翠绿，并用干燥粗猪鬃半枯刷毛轻扫擦出翻滚飞散的白沫浪花。',
      layers: [
        { id: 1, name: '一 · 暴风骤雨裂云金光渐变天' },
        { id: 2, name: '二 · 深靛涛谷与海面涌动底潮' },
        { id: 3, name: '三 · 逆光透亮翡翠绿浪冠核心' },
        { id: 4, name: '四 · 浪尖颠簸远洋三桅古帆船' },
        { id: 5, name: '五 · 枯笔干扫飞舞白色浪花水雾' }
      ],
      buildStrokes(api) {
        paintBackdrop(api, 1120, 820, [38, 52, 76], [96, 112, 134], [244, 206, 138], { layer: 1, label: '雷云破隙暮金天光铺底' });
        // Golden light breaking through brooding indigo storm clouds
        api.oilPatch(1, '乌云裂隙透出的璀璨太阳金芒', 385, 225, 245, 135, -0.1, { color: [252, 226, 156], colorEdge: [88, 102, 126], alpha: 0.72, count: 18 });
        for (let c = 0; c < 8; c++) {
          api.oilPatch(1, '压海低垂深紫灰雷云滚翻', 90 + c * 150, 120 + (c % 2) * 48, 135, 58, 0.1, { color: [42, 50, 68], colorEdge: [76, 86, 108], alpha: 0.78, count: 14 });
        }

        // Layer 2: Deep Prussian-blue rolling sea troughs & swell slopes
        paintTableBand(api, 1120, 820, 415, [22, 64, 92], [12, 32, 54], 2, '深靛大洋惊涛汹涌底色');
        paintPolygonFill(api, 2, '中央拔海而起倾覆巨浪坡体', [[120, 560], [60, 760]], [[920, 385], [1080, 740]], [26, 84, 106], [14, 38, 62], { rows: 16, alpha: 0.94 });

        // Layer 3: Aivazovsky's iconic luminous backlit translucent emerald-jade wave crest!
        api.oilPatch(3, '浪尖迎光处晶莹翡翠透光玻璃质感', 495, 455, 230, 86, -0.15, { color: [48, 168, 146], colorEdge: [22, 86, 98], alpha: 0.88, count: 22 });
        api.oilPatch(3, '浪心顶脊亮青玉反光透射', 465, 430, 145, 42, -0.14, { color: [128, 212, 186], colorEdge: [46, 154, 136], alpha: 0.78, count: 14 });
        // Swirling golden sunlight reflected on right distant swell
        paintBar(api, 3, '远海波谷金色碎阳反光', 180, 435, 360, 438, 14, [242, 206, 126], { alpha: 0.74 });

        // Layer 4: Struggling three-masted tall sailing ship cresting horizon swell
        const sx = 765, sy = 408;
        api.oilStroke(4, '怒海三桅古帆船倾侧乌黑船体', [[sx - 56, sy - 6], [sx, sy + 10], [sx + 58, sy - 8]], { width: 18, color: [24, 24, 28], alpha: 0.96 });
        [-28, 0, 28].forEach((mx, idx) => {
          const mh = idx === 1 ? 105 : 86;
          paintBar(api, 4, '倾侧船桅挺立剪影', sx + mx, sy, sx + mx - 14, sy - mh, 4.5, [28, 28, 32], { alpha: 0.94 });
          api.oilStroke(4, '迎风鼓胀半透米黄古帆', [[sx + mx - 8, sy - mh + 18], [sx + mx + 12, sy - mh * 0.55], [sx + mx - 2, sy - 16]], {
            width: 24, color: [216, 198, 168], colorEnd: [124, 126, 138], alpha: 0.82
          });
        });

        // Layer 5: Organic scumbled churning white seafoam crest & curling misty spray (no uniform comb teeth!)
        api.oilStroke(5, '主巨浪倾泻卷曲银白飞沫长带', [
          [165, 525], [345, 405], [525, 382], [695, 446], [855, 565]
        ], { width: 34, color: [248, 250, 246], colorEnd: [188, 224, 218], alpha: 0.92, bristle: 0.85, vary: 8 });
        // Flowing winding S-curves sliding down wave trough like natural water lace
        for (let k = 0; k < 14; k++) {
          const lx = 180 + api.rand() * 680;
          const ly = 445 + api.rand() * 140;
          const s1 = (api.rand() - 0.5) * 65, s2 = (api.rand() - 0.5) * 90;
          api.oilStroke(5, '半枯猪鬃顺浪曲折擦出白沫蕾丝', [
            [lx, ly], [lx + s1, ly + 55], [lx + s2, ly + 125]
          ], { width: 12 + (k % 3) * 6, color: [228, 242, 240], alpha: 0.48 + api.rand() * 0.25, bristle: 0.82, fade: 0.22 });
        }
        api.oilPatch(5, '浪冠顶脊腾空水雾弥散光晕', 495, 386, 135, 38, -0.08, { color: [246, 250, 248], colorEdge: [86, 162, 152], alpha: 0.56, count: 14 });
        api.oilHighlight(5, '碎浪顶脊喷溅白沫水珠点彩', 512, 392, 56, 24, -0.1, { color: [255, 255, 252], alpha: 0.88, count: 10 });
      }
    },

    // =========================================================================
    // 7. TONALISM: MISTY GOLDEN AUTUMN BIRCH WOODS & FOOTBRIDGE (INNESS)
    // =========================================================================
    {
      id: 'oil-tut-10-tonalism-birch',
      title: '色调主义教程·秋雾金林与林间独木桥',
      subtitle: '乔治·英尼斯色调主义法：暖琥珀薄雾统调 → 柔和远林层叠 → 细干逆光剪影与溪流 → 小木桥造型 → 林隙晨曦金芒',
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
      desc: '美国色调主义（Tonalism）大师英尼斯技法教程：抛弃尖锐边界与跳脱原色，让全幅笼罩在统一的蜜糖金褐与苔绿诗意秋雾中，聚焦逆光树干与林涧木桥的静谧氛围。',
      layers: [
        { id: 1, name: '一 · 蜜糖琥珀暖雾基调大铺底' },
        { id: 2, name: '二 · 远近迷蒙柔边秋叶林幕叠染' },
        { id: 3, name: '三 · 静谧林涧曲水与苔坡铺砌' },
        { id: 4, name: '四 · 瘦劲秋林枝干剪影与独木桥' },
        { id: 5, name: '五 · 穿林丁达尔晨光与飘零落叶' }
      ],
      buildStrokes(api) {
        paintBackdrop(api, 1120, 820, [218, 188, 122], [238, 206, 134], [148, 116, 62], { layer: 1, label: '蜜糖琥珀秋雾统调底色' });

        // Layer 2: Soft edge-lost distant autumn foliage masses bathed in warm fog
        const canopies = [
          [165, 235, 195, 165, [156, 118, 56]], [425, 205, 225, 155, [188, 138, 62]],
          [745, 215, 240, 165, [164, 96, 44]], [985, 255, 185, 155, [128, 92, 48]],
          [260, 395, 165, 95, [118, 108, 52]], [855, 385, 195, 105, [142, 82, 38]]
        ];
        canopies.forEach(([cx, cy, rx, ry, col]) => {
          api.oilPatch(2, '色调主义柔和朦胧金秋叶团', cx, cy, rx, ry, 0, { color: col, colorEdge: [224, 192, 122], alpha: 0.72, count: 18 });
        });

        // Layer 3: Mossy olive-brown meadow banks flanking a winding reflective forest brook
        paintTableBand(api, 1120, 820, 495, [112, 104, 56], [56, 52, 30], 3, '林间落叶苔草坡岸厚涂');
        // Winding calm stream catching misty gold light
        paintPolygonFill(api, 3, '林涧蜿蜒平静溪水倒影带', [
          [535, 498], [465, 595], [315, 835]
        ], [
          [605, 498], [675, 595], [645, 835]
        ], [218, 186, 118], [134, 112, 74], { rows: 14, alpha: 0.88 });

        // Layer 4: Organic curved woodland trunks with natural asymmetrical branches (no V-antennas!)
        const trunks = [
          [145, 650, 18, 0.04], [215, 620, 26, -0.02], [295, 575, 14, 0.03], [435, 515, 12, -0.02],
          [685, 525, 16, 0.02], [815, 595, 24, -0.03], [905, 645, 20, 0.02], [995, 685, 28, -0.02]
        ];
        trunks.forEach(([tx, baseY, tw, lean], idx) => {
          paintBar(api, 4, '瘦劲深褐秋林树干逆光剪影', tx, baseY, tx + lean * 450, 28, tw, [48, 38, 28], { colorEnd: [72, 58, 42], alpha: 0.94 });
          const dir = idx % 2 === 0 ? 1 : -1;
          api.oilStroke(4, '林冠伸展自然弯枝剪影', [[tx + lean * 220, 260], [tx + dir * 48, 195], [tx + dir * 92, 162]], { width: tw * 0.36, color: [56, 46, 34], alpha: 0.78 });
        });
        // Rustic arched wooden footbridge spanning the misty creek (y ~585)
        api.oilStroke(4, '林间木桥拱形粗木桥身', [[375, 608], [545, 575], [715, 610]], { width: 28, color: [62, 44, 28], colorEnd: [42, 30, 20], alpha: 0.96 });
        [405, 475, 545, 615, 685].forEach(bx => {
          paintBar(api, 4, '小木桥竖立木桩栏杆', bx, 592, bx, 544, 7, [48, 34, 22], { alpha: 0.94 });
        });
        api.oilStroke(4, '木桥弯曲扶手细杆', [[395, 558], [545, 528], [695, 558]], { width: 7, color: [52, 38, 24], alpha: 0.92 });

        // Layer 5: Atmospheric golden morning backlit mist glow (soft patches, no hard tube beam!)
        api.oilPatch(5, '林心穿透雾霭的暖金太阳漫射', 545, 315, 195, 165, 0, { color: [255, 238, 178], colorEdge: [228, 196, 126], alpha: 0.58, count: 18 });
        api.oilPatch(5, '斜映溪面的轻柔金色林雾反光', 505, 525, 145, 95, -0.25, { color: [255, 238, 172], colorEdge: [188, 158, 96], alpha: 0.32, count: 14 });
        // Warm floating autumn foliage flecks & stream ripples
        for (let f = 0; f < 16; f++) {
          api.oilHighlight(5, '枝头与苔面零星秋金点彩', 160 + f * 58, 280 + (f % 4) * 115, 16, 8, f * 0.4, {
            color: f % 2 === 0 ? [224, 152, 52] : [206, 98, 38], alpha: 0.72, count: 4
          });
        }
      }
    },

    // =========================================================================
    // 8. BAROQUE MATERIAL REALISM: BURNISHED COPPER KETTLE, POMEGRANATE & BOWL
    // =========================================================================
    {
      id: 'oil-tut-10-baroque-copper',
      title: '古典质感教程·铜锅、石榴与白瓷碗',
      subtitle: '巴洛克材质写实法（Chardin风格）：暖赭暗底 → 麻布桌巾 → 锤纹紫红铜壶 → 瓷釉冷白与切开石榴 → 金属强反光对比',
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
      desc: '夏尔丹式巴洛克材质对比教程：在同一束柔侧光下精密区分四种截然不同肌理——璀璨反光的锻打紫铜壶、温润哑光的白瓷钵、晶莹颗粒感的裂开石榴与粗纹理亚麻台布。',
      layers: [
        { id: 1, name: '一 · 熟褐暗壁与粗纺亚麻布底' },
        { id: 2, name: '二 · 主体构图投影与亚麻布褶' },
        { id: 3, name: '三 · 锻打红铜壶金属弧面塑形' },
        { id: 4, name: '四 · 哑光白瓷碗与红宝石石榴籽' },
        { id: 5, name: '五 · 铜壶炽白反光与桌面反色交辉' }
      ],
      buildStrokes(api) {
        paintBackdrop(api, 1120, 820, [36, 25, 18], [54, 38, 28], [28, 20, 15], { layer: 1, label: '夏尔丹暖暗褐墙面打底' });
        paintTableBand(api, 1120, 820, 525, [156, 138, 114], [108, 92, 74], 1, '粗纺本色亚麻台布平铺');
        paintBar(api, 1, '桌壁分界深褐柔和水平线', 30, 525, 1090, 525, 7, [38, 28, 22], { alpha: 0.72 });

        // Layer 2: Draped linen table folds & soft chiaroscuro shadows
        api.oilPatch(2, '铜壶与瓷碗向右侧延伸柔和投影', 585, 622, 275, 48, 0.03, { color: [34, 24, 18], alpha: 0.78, count: 18 });
        paintPolygonFill(api, 2, '亚麻桌布右垂角亮面褶纹', [[680, 525], [760, 825]], [[980, 525], [1060, 825]], [176, 158, 134], [122, 106, 86], { rows: 10, alpha: 0.78 });

        // Layer 3: Sculpted hammered burnished copper kettle/pot (cx=405, cy=465)
        paintSolidOval(api, 3, '紫红铜锅浑圆鼓腹锻打质感', 405, 478, 152, 128, [206, 106, 48], {
          colorRight: [74, 28, 16], colorEnd: [68, 24, 14], rows: 18, alpha: 0.98
        });
        // Copper pot flanged rim, lid with brass knob, arched forged iron handle
        paintBar(api, 3, '铜锅阔口厚铜卷边受光棱线', 286, 368, 524, 368, 18, [218, 132, 68], { colorEnd: [98, 42, 22], alpha: 0.96 });
        paintSolidOval(api, 3, '半球形铜盖暖紫红金属坡度', 405, 344, 114, 34, [198, 98, 44], { colorRight: [76, 30, 16], rows: 7, alpha: 0.96 });
        api.oilHighlight(3, '铜盖顶黄铜球形提钮', 405, 306, 14, 12, 0, { color: [232, 184, 88], alpha: 0.96, count: 4 });
        // Tall wrought iron arched handle & curved copper pouring spout
        api.oilStroke(3, '铜壶顶部弧形锻铁提梁', [[276, 376], [285, 225], [405, 168], [525, 225], [534, 376]], {
          width: 12, color: [38, 34, 32], colorEnd: [72, 62, 56], alpha: 0.96
        });
        api.oilStroke(3, '铜壶左侧弯颈红铜流嘴', [[268, 468], [192, 412], [176, 368]], {
          width: 24, color: [196, 98, 46], colorEnd: [134, 62, 28], alpha: 0.96
        });

        // Layer 4: Matte white glazed porcelain bowl + split crimson pomegranate
        paintPolygonFill(api, 4, '右侧哑光白瓷钵外弧壁体块', [[595, 495], [648, 608]], [[875, 495], [822, 608]], [244, 240, 230], [164, 162, 158], {
          colorRight: [168, 168, 166], rows: 12, alpha: 0.98
        });
        paintSolidOval(api, 4, '白瓷钵椭圆开口与灰蓝内壁', 735, 495, 140, 32, [196, 198, 202], { colorRight: [242, 238, 228], rows: 7, alpha: 0.96 });

        // Whole & split glowing ruby pomegranates in front of pot & bowl
        paintSolidOval(api, 4, '饱满朱红整颗石榴与皇冠蒂', 565, 625, 52, 48, [202, 52, 42], { colorRight: [108, 22, 24], rows: 9, alpha: 0.98 });
        paintSolidOval(api, 4, '切开半颗石榴淡米白内瓤截面', 675, 646, 52, 44, [238, 214, 168], { colorEnd: [188, 68, 52], rows: 8, rot: 0.25, alpha: 0.98 });
        // Jewel-like sparkling crimson arils inside cut pomegranate!
        for (let a = 0; a < 16; a++) {
          const ang = (a * 2.39996), rad = Math.sqrt(a / 16) * 34;
          const ax = 675 + Math.cos(ang) * rad, ay = 646 + Math.sin(ang) * rad * 0.85;
          api.oilHighlight(4, '石榴晶莹红宝石果粒点彩', ax, ay, 5.5, 5.5, 0, { color: a % 3 === 0 ? [228, 34, 48] : [156, 18, 34], alpha: 0.96, count: 2 });
        }

        // Layer 5: Specular window catchlights on burnished copper + copper color bounce on white bowl!
        api.oilStroke(5, '紫铜壶左肩强窗格灼亮反光', [[306, 412], [296, 468], [308, 526]], { width: 22, color: [255, 228, 178], alpha: 0.94 });
        api.oilHighlight(5, '铜壶最亮高光金属银斑点晴', 302, 456, 9, 24, -0.05, { color: [255, 250, 232], alpha: 0.98, count: 4 });
        api.oilHighlight(5, '铜盖左缘金红弧面反光', 342, 336, 18, 6, -0.2, { color: [255, 222, 166], alpha: 0.90, count: 4 });
        // Warm copper bounce reflection painted onto matte white ceramic bowl's left wall!
        api.oilPatch(5, '白瓷钵左壁映出的暖红铜环境反光', 636, 548, 28, 34, 0, { color: [208, 128, 86], colorEdge: [228, 222, 212], alpha: 0.48, count: 8 });
        api.oilHighlight(5, '碎裂石榴果粒顶面星闪高光', 668, 636, 3.2, 3.2, 0, { color: [255, 242, 236], alpha: 0.96, count: 2 });
      }
    },

    // =========================================================================
    // 9. DIRECT PLEIN-AIR: TUSCANY SUNLIT MORNING CYPRESS VILLA
    // =========================================================================
    {
      id: 'oil-tut-10-pleinair-tuscany',
      title: '外光写生教程·托斯卡纳晨光丝柏庄园',
      subtitle: '直接外光写生法（Plein Air）：爽朗意大利晨空 → 远近起伏山坡冷暖明度 → S形碎石路 → 韵律墨绿丝柏 → 红瓦山顶农庄',
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
      desc: '印象派外光写生快速抓型教程：演示如何在2小时晨光变幻中，迅速归纳远山空气感淡蓝与近坡明快金绿块面，并以垂直深绿丝柏阵列与斜切阴影锁定光影时间感。',
      layers: [
        { id: 1, name: '一 · 爽朗清晨晴空与叠翠远山' },
        { id: 2, name: '二 · 金绿田园起伏丘陵大色块' },
        { id: 3, name: '三 · 蜿蜒白沙土路与山顶红顶农庄' },
        { id: 4, name: '四 · 夹道笔直墨绿丝柏队列' },
        { id: 5, name: '五 · 晨阳长投阴影与暖金草坡高光' }
      ],
      buildStrokes(api) {
        paintBackdrop(api, 1120, 820, [96, 152, 216], [156, 198, 234], [224, 232, 236], { layer: 1, label: '地中海清晨蓝晴空平铺' });
        for (let c = 0; c < 5; c++) {
          api.oilPatch(1, '洁白明朗卷云点缀天际', 150 + c * 215, 112 + (c % 2) * 28, 112, 32, 0, { color: [248, 248, 244], colorEdge: [182, 206, 234], alpha: 0.72, count: 12 });
        }
        // Layer 1/2: Layered distant Tuscan hills transitioning cool blue -> warm sage -> sunlit gold
        api.oilPatch(1, '远方阿佩宁浅黛灰蓝山脊', 560, 325, 620, 74, -0.02, { color: [118, 148, 188], colorEdge: [158, 182, 214], alpha: 0.88, count: 24 });
        api.oilPatch(2, '中景起伏橄榄绿柔坡丘陵', 380, 445, 520, 128, -0.06, { color: [114, 144, 72], colorEdge: [86, 118, 62], alpha: 0.94, count: 24 });
        api.oilPatch(2, '右侧向阳暖麦金托斯卡纳高丘', 840, 475, 440, 142, 0.08, { color: [198, 174, 92], colorEdge: [122, 142, 68], alpha: 0.94, count: 22 });
        paintTableBand(api, 1120, 820, 565, [154, 168, 76], [96, 122, 54], 2, '前景晨露青草斜坡铺底');

        // Layer 3: Winding Tuscan S-curve white limestone road leading up to terracotta stone villa!
        api.oilStroke(3, '托斯卡纳蜿蜒石灰白沙土路', [
          [565, 368], [625, 435], [475, 525], [665, 645], [515, 835]
        ], { width: 44, stretch: 0.45, color: [232, 222, 196], colorEnd: [216, 198, 162], alpha: 0.94 });

        // Hilltop stone Tuscan farmhouse villa at top of ridge (560, 345)
        paintPolygonFill(api, 3, '山巅暖赭石灰岩农庄主楼', [[510, 325], [510, 372]], [[615, 325], [615, 372]], [232, 214, 182], [202, 178, 142], { rows: 6, alpha: 0.96 });
        paintKnifeSlab(api, 3, '山顶别墅赤陶红瓦斜顶', 498, 320, 628, 322, 20, [188, 86, 48], { alpha: 0.96 });
        [528, 558, 592].forEach(wx => paintBar(api, 3, '农庄窄拱窗深影点缀', wx, 340, wx, 358, 7, [52, 44, 36], { alpha: 0.90 }));

        // Layer 4: Exclamation-mark Mediterranean Cypress trees lining the winding lane
        const cypresses = [
          [495, 372, 68], [462, 412, 82], [435, 456, 98], [412, 512, 118],
          [632, 378, 66], [676, 425, 84], [715, 482, 108], [765, 548, 134],
          [325, 565, 112], [255, 615, 136]
        ];
        cypresses.forEach(([cx, baseY, h]) => {
          api.oilStroke(4, '挺拔墨绿地中海丝柏塔松', [[cx, baseY], [cx, baseY - h * 0.55], [cx, baseY - h]], {
            width: Math.max(18, h * 0.28), stretch: 0.42, color: [28, 52, 28], colorEnd: [44, 72, 36], alpha: 0.96
          });
          // Sunlit warm olive highlight along left side of each cypress
          paintBar(api, 5, '丝柏左侧清晨金绿迎光边缘', cx - h * 0.08, baseY - h * 0.15, cx - 2, baseY - h * 0.92, Math.max(6, h * 0.1), [96, 134, 58], { alpha: 0.78 });
          // Long diagonal morning cast shadow sweeping across hillside!
          paintBar(api, 5, '清晨斜阳长投蓝灰草坡影', cx, baseY, cx + h * 1.15, baseY + h * 0.24, Math.max(10, h * 0.16), [46, 68, 56], { alpha: 0.52 });
        });
        // Sunlit wild poppy red flecks & golden wheat grass swaths in foreground
        for (let k = 0; k < 14; k++) {
          api.oilHighlight(5, '草坡晨阳亮黄绿与虞美人点彩', 165 + k * 64, 650 + (k % 3) * 45, 12, 6, 0.15, {
            color: k % 4 === 0 ? [224, 68, 48] : [224, 212, 88], alpha: 0.84, count: 4
          });
        }
      }
    },

    // =========================================================================
    // 10. POETIC NOCTURNE: RAINY JIANGNAN ALLEYWAY & HANGING RED LANTERN
    // =========================================================================
    {
      id: 'oil-tut-10-nocturne-lantern',
      title: '夜色光影教程·雨巷红灯笼与青石板',
      subtitle: '东方意境冷暖夜画法：青灰雨雾夜幕 → 黛瓦粉墙透视老巷 → 远端单孔石桥 → 高悬炽红油纸灯笼 → 青石湿反光',
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
      desc: '冷暖色温强对比诗意夜画教程：以烟雨江南的冷青灰黛瓦粉墙构成宁静透视巷弄，在右上方高悬一盏炽烈红灯笼，将暖橘光辉洒满黑青湿润雨夜石板路面。',
      layers: [
        { id: 1, name: '一 · 烟雨靛青暮空与石板底调' },
        { id: 2, name: '二 · 深巷两边马头白墙与黛瓦飞檐' },
        { id: 3, name: '三 · 尽头水乡古桥与木窗棂影' },
        { id: 4, name: '四 · 屋檐高悬大红油纸灯笼光晕' },
        { id: 5, name: '五 · 湿润青石红金波光与灯笼高光' }
      ],
      buildStrokes(api) {
        paintBackdrop(api, 920, 1120, [18, 32, 52], [32, 52, 78], [16, 26, 42], { layer: 1, label: '江南烟雨深靛暮夜铺底' });
        // Perspective wet flagstone alley floor expanding forward
        paintPolygonFill(api, 1, '雨巷透视湿润深青石板路', [
          [405, 635], [140, 1140]
        ], [
          [515, 635], [780, 1140]
        ], [36, 48, 66], [18, 24, 34], { colorRight: [26, 36, 52], rows: 16, width: 68, alpha: 0.96 });

        // Layer 2: Perspective Jiangnan whitewashed walls, recessed dark plinth foundations & dark tile eaves
        paintPolygonFill(api, 2, '左侧古巷青灰白墙透视立面', [[-20, 145], [-20, 1140]], [[406, 495], [406, 640]], [142, 152, 166], [96, 108, 124], {
          colorRight: [82, 94, 112], rows: 18, width: 72, alpha: 0.95
        });
        paintPolygonFill(api, 2, '右侧受灯笼映照微暖白墙立面', [[514, 495], [514, 640]], [[940, 130], [940, 1140]], [112, 118, 134], [146, 138, 134], {
          colorRight: [168, 138, 126], rows: 18, width: 72, alpha: 0.95
        });
        // Carved stone foundation plinth along bottom wall base & dark carved wooden doorway/windows
        paintBar(api, 2, '左巷墙壁青石脚墙根基', -20, 965, 406, 638, 38, [46, 54, 68], { alpha: 0.94 });
        paintBar(api, 2, '右巷墙壁青石脚墙根基', 514, 638, 940, 975, 38, [42, 48, 62], { alpha: 0.94 });
        paintPolygonFill(api, 2, '左中木制老宅大门凹室', [[95, 535], [95, 925]], [[225, 558], [225, 815]], [38, 32, 30], [24, 20, 20], { rows: 12, alpha: 0.92 });
        paintPolygonFill(api, 2, '右中木格栅花窗框饰', [[655, 415], [655, 625]], [[785, 378], [785, 648]], [46, 38, 36], [32, 26, 26], { rows: 10, alpha: 0.90 });

        // Deep charcoal tile eaves sloping inward (subtle upper silhouette edges)
        api.oilStroke(2, '左侧黛瓦重檐斜切入巷深角', [[-20, 145], [210, 335], [408, 496]], { width: 44, color: [20, 26, 38], alpha: 0.98 });
        api.oilStroke(2, '右侧马头飞檐厚重青黛瓦脊', [[940, 130], [725, 320], [512, 496]], { width: 46, color: [18, 24, 36], alpha: 0.98 });
        api.oilStroke(2, '屋檐下深黑木橼投影纵线', [[-20, 185], [210, 365], [408, 512]], { width: 12, color: [28, 34, 46], alpha: 0.85 });
        api.oilStroke(2, '右侧屋檐投影暗带', [[940, 170], [725, 352], [512, 512]], { width: 12, color: [24, 30, 42], alpha: 0.85 });

        // Layer 3: Distant misty Jiangnan arched stone bridge at vanishing alley end (y ~560..635)
        api.oilPatch(3, '巷尾烟雨蒙蒙远处水雾留白', 460, 565, 68, 65, 0, { color: [158, 174, 194], colorEdge: [46, 66, 94], alpha: 0.72, count: 14 });
        api.oilStroke(3, '尽头远端水乡石拱桥剪影', [[395, 615], [460, 582], [525, 615]], { width: 14, color: [34, 46, 66], alpha: 0.92 });

        // Layer 4: Radiant hanging vermilion oil-paper lantern suspended under right eave (cx=625, cy=405)
        paintBar(api, 4, '右檐下悬出乌铁灯笼长挑杆', 725, 305, 625, 338, 8, [22, 22, 26], { alpha: 0.95 });
        api.oilPatch(4, '大红灯笼漫射墙面的暖红炽晕', 625, 415, 195, 195, 0, { color: [232, 72, 42], colorEdge: [82, 44, 52], alpha: 0.58, count: 18 });
        paintSolidOval(api, 4, '饱满暖红灯笼纸面球体', 625, 412, 46, 54, [242, 54, 34], { colorRight: [198, 28, 22], colorEnd: [224, 42, 28], rows: 10, alpha: 0.98 });
        paintBar(api, 4, '灯笼上下乌木箍盖收边', 598, 358, 652, 358, 9, [26, 18, 16], { alpha: 0.96 });
        paintBar(api, 4, '灯笼底端乌木底座', 602, 466, 648, 466, 9, [26, 18, 16], { alpha: 0.96 });
        paintBar(api, 4, '灯笼底随风微摇金红丝穗', 625, 468, 622, 525, 7, [226, 48, 34], { colorEnd: [248, 178, 52], alpha: 0.94 });

        // Layer 5: Shimmering crimson-amber reflections rippling down dark wet flagstones!
        for (let r = 0; r < 14; r++) {
          const ry = 665 + r * 30;
          const xCenter = api.lerp(495, 585, r / 13);
          const halfW = 14 + r * 3.8;
          const col = r < 5 ? [252, 184, 68] : (r < 10 ? [232, 74, 42] : [176, 46, 36]);
          paintBar(api, 5, '雨夜青石板碎裂灯笼金红水影', xCenter - halfW, ry, xCenter + halfW, ry, 12 + (r % 2) * 4, col, { alpha: 0.84 - r * 0.03 });
        }
        // Misty blue flagstone highlight glints on left foreground floor
        for (let r = 0; r < 8; r++) {
          const ry = 760 + r * 42;
          paintBar(api, 5, '石板冷天光反光湿滑横痕', 210 + r * 8, ry, 345 + r * 12, ry, 8, [126, 152, 182], { alpha: 0.42 });
        }
        // Bright glowing candle heart inside paper lantern!
        api.oilHighlight(5, '红纸灯笼中心温暖明黄烛光辉', 625, 412, 22, 28, 0, { color: [255, 218, 108], alpha: 0.92, count: 6 });
        api.oilHighlight(5, '灯心炽白微点提神', 625, 412, 8, 12, 0, { color: [255, 250, 224], alpha: 0.98, count: 3 });
      }
    }
  ];

  window.Code2PaintCatalog.addPack(WORKS);
})();
