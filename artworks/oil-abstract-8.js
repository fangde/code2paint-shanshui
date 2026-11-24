(function () {
  'use strict';

  function paintBackdrop(api, w, h, cTop, cMid, cBot) {
    for (let y = -10; y <= h + 40; y += 44) {
      const f = Math.max(0, Math.min(1, y / h));
      const col = f < 0.5
        ? [api.lerp(cTop[0], cMid[0], f * 2), api.lerp(cTop[1], cMid[1], f * 2), api.lerp(cTop[2], cMid[2], f * 2)]
        : [api.lerp(cMid[0], cBot[0], (f - 0.5) * 2), api.lerp(cMid[1], cBot[1], (f - 0.5) * 2), api.lerp(cMid[2], cBot[2], (f - 0.5) * 2)];
      api.oilStroke(1, '亚麻油画底色铺涂', [[-60, y], [w * 0.5, y + 5], [w + 60, y - 5]], {
        width: 118, stretch: 0.78, fade: 0.02, color: col, colorEnd: col, alpha: 0.52, vary: 4, bristle: 0.28
      });
    }
  }

  function paintRect(api, layer, label, x, y, w, h, col, opts = {}) {
    const horizontal = opts.horizontal != null ? opts.horizontal : w >= h;
    const step = opts.step || (Math.min(w, h) <= 40 ? 6 : Math.max(12, Math.min(26, (horizontal ? h : w) / 7)));
    const brushW = opts.width || step * 1.52;
    const colEnd = opts.colorEnd || col;
    if (horizontal) {
      for (let yy = y + brushW * 0.30; yy <= y + h - brushW * 0.22; yy += step) {
        const xm = x + w * 0.5;
        api.oilStroke(layer, label, [[x + brushW * 0.22, yy], [xm, yy + (api.rand() - 0.5) * 1.2], [x + w - brushW * 0.22, yy]], {
          width: brushW, stretch: 0.65, fade: 0.02, color: col, colorEnd: colEnd,
          alpha: opts.alpha || 0.88, vary: opts.vary == null ? 5 : opts.vary, bristle: opts.bristle == null ? 0.34 : opts.bristle
        });
      }
    } else {
      for (let xx = x + brushW * 0.30; xx <= x + w - brushW * 0.22; xx += step) {
        const ym = y + h * 0.5;
        api.oilStroke(layer, label, [[xx, y + brushW * 0.22], [xx + (api.rand() - 0.5) * 1.2, ym], [xx, y + h - brushW * 0.22]], {
          width: brushW, stretch: 0.65, fade: 0.02, color: col, colorEnd: colEnd,
          alpha: opts.alpha || 0.88, vary: opts.vary == null ? 5 : opts.vary, bristle: opts.bristle == null ? 0.34 : opts.bristle
        });
      }
    }
  }

  function paintBar(api, layer, label, x1, y1, x2, y2, width, col, opts = {}) {
    const xm = (x1 + x2) * 0.5;
    const ym = (y1 + y2) * 0.5;
    api.oilStroke(layer, label, [[x1, y1], [xm, ym], [x2, y2]], {
      width,
      stretch: opts.stretch || 0.56,
      fade: opts.fade == null ? 0.02 : opts.fade,
      color: col,
      colorEnd: opts.colorEnd || col,
      alpha: opts.alpha == null ? 0.94 : opts.alpha,
      vary: opts.vary == null ? 4 : opts.vary,
      bristle: opts.bristle == null ? 0.28 : opts.bristle
    });
  }

  function paintCircleStroke(api, layer, label, cx, cy, r, width, col, opts = {}) {
    const pts = [];
    const segs = opts.segs || 20;
    const startAng = opts.startAng || 0;
    const endAng = opts.endAng == null ? Math.PI * 2 : opts.endAng;
    for (let i = 0; i <= segs; i++) {
      const a = startAng + (endAng - startAng) * (i / segs);
      pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]);
    }
    api.oilStroke(layer, label, pts, {
      width,
      stretch: opts.stretch || 0.55,
      fade: opts.fade == null ? 0.04 : opts.fade,
      color: col,
      colorEnd: opts.colorEnd || col,
      alpha: opts.alpha == null ? 0.92 : opts.alpha,
      vary: opts.vary == null ? 5 : opts.vary,
      bristle: opts.bristle == null ? 0.35 : opts.bristle
    });
  }

  function paintTriangle(api, layer, label, p1, p2, p3, col, opts = {}) {
    const steps = opts.rows || 34;
    const colEnd = opts.colorEnd || col;
    for (let i = 1; i <= steps; i++) {
      const t = i / steps;
      const ax = api.lerp(p1[0], p2[0], t);
      const ay = api.lerp(p1[1], p2[1], t);
      const bx = api.lerp(p1[0], p3[0], t);
      const by = api.lerp(p1[1], p3[1], t);
      const len = Math.hypot(bx - ax, by - ay);
      if (len < 3) continue;
      api.oilStroke(layer, label, [[ax, ay], [(ax + bx) * 0.5, (ay + by) * 0.5], [bx, by]], {
        width: opts.width || 19,
        stretch: 0.64,
        fade: 0.03,
        color: col,
        colorEnd: colEnd,
        alpha: opts.alpha == null ? 0.90 : opts.alpha,
        vary: 4,
        bristle: 0.28
      });
    }
    paintBar(api, layer, label + '轮廓勾边', p1[0], p1[1], p2[0], p2[1], opts.edgeW || 8, opts.edgeCol || col, { alpha: opts.edgeAlpha || 0.92 });
    paintBar(api, layer, label + '轮廓勾边', p2[0], p2[1], p3[0], p3[1], opts.edgeW || 8, opts.edgeCol || col, { alpha: opts.edgeAlpha || 0.92 });
    paintBar(api, layer, label + '轮廓勾边', p3[0], p3[1], p1[0], p1[1], opts.edgeW || 8, opts.edgeCol || col, { alpha: opts.edgeAlpha || 0.92 });
  }

  function spiralPoints(cx, cy, rStart, rEnd, startAng, turns, steps, rotScaleY) {
    const pts = [];
    const totalAng = turns * Math.PI * 2;
    const sy = rotScaleY == null ? 1 : rotScaleY;
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const a = startAng + t * totalAng;
      const r = rStart + (rEnd - rStart) * t;
      pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r * sy]);
    }
    return pts;
  }

  const WORKS = [
    // =========================================================================
    // 1. VAN GOGH - STARRY VORTEX
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
        paintBackdrop(api, 1120, 820, [14, 28, 72], [24, 52, 124], [14, 28, 62]);

        // Continuous swirl + wave flow field across upper sky
        function flowAngle(x, y) {
          const dx1 = x - 420, dy1 = y - 275;
          const d1 = Math.hypot(dx1, dy1) + 28;
          const w1 = Math.exp(-(d1 * d1) / (2 * 185 * 185));
          const a1 = Math.atan2(dy1, dx1) + Math.PI * 0.5 + 0.14;

          const dx2 = x - 680, dy2 = y - 340;
          const d2 = Math.hypot(dx2, dy2) + 28;
          const w2 = Math.exp(-(d2 * d2) / (2 * 155 * 155));
          const a2 = Math.atan2(dy2, dx2) - Math.PI * 0.5 - 0.12;

          const wave = Math.sin(x * 0.0085 + Math.cos(y * 0.011)) * 0.45;
          const vx = Math.cos(wave) + w1 * 2.4 * Math.cos(a1) + w2 * 2.0 * Math.cos(a2);
          const vy = Math.sin(wave) + w1 * 2.4 * Math.sin(a1) + w2 * 2.0 * Math.sin(a2);
          return Math.atan2(vy, vx);
        }

        const skyColors = [
          [38, 86, 174], [62, 122, 206], [96, 168, 218], [156, 204, 232], [28, 62, 138], [84, 156, 186]
        ];
        for (let i = 0; i < 235; i++) {
          let px = 40 + ((i * 173 + api.rand() * 90) % 1040);
          let py = 26 + ((i * 89 + api.rand() * 55) % 560);
          const pts = [[px, py]];
          for (let s = 0; s < 4; s++) {
            const ang = flowAngle(px, py);
            px += Math.cos(ang) * 24;
            py += Math.sin(ang) * 24;
            pts.push([px, py]);
          }
          const nearCore = Math.hypot(px - 420, py - 275) < 175 || Math.hypot(px - 680, py - 340) < 140;
          const c = nearCore && i % 3 === 0 ? [188, 218, 236] : skyColors[i % skyColors.length];
          const cEnd = i % 4 === 0 ? [224, 228, 198] : [c[0] * 0.85, Math.min(255, c[1] + 18), Math.min(255, c[2] + 22)];
          api.oilStroke(2, '涡旋星云定向厚涂排笔', pts, {
            width: 14 + (i % 4) * 3, stretch: 0.44, fade: 0.12, color: c, colorEnd: cEnd, alpha: 0.78, vary: 8, bristle: 0.58
          });
        }

        // Rolling blue Alpilles hills at lower plane
        for (let row = 0; row < 28; row++) {
          const yBase = 555 + row * 9;
          const ridge = [[-40, yBase + Math.sin(row) * 14], [260, yBase - 32], [580, yBase + 16], [880, yBase - 26], [1160, yBase + 8]];
          const col = row < 10 ? [32, 54, 108] : (row < 18 ? [24, 46, 82] : [20, 34, 58]);
          api.oilStroke(3, '夜色群山连绵厚涂波脊', ridge, {
            width: 24, stretch: 0.48, fade: 0.04, color: col, colorEnd: [38, 68, 118], alpha: 0.88, vary: 6
          });
        }
        // Village cottages, steep gable roofs & lit golden windows
        for (let h = 0; h < 11; h++) {
          const hx = 395 + h * 58, hy = 655 + (h % 3) * 20;
          paintRect(api, 3, '山村小屋青灰墙体', hx - 16, hy - 8, 32, 22, [28, 38, 66], { step: 8, width: 12, alpha: 0.94 });
          api.oilStroke(3, '农舍人字瓦顶轮廓', [[hx - 20, hy - 8], [hx, hy - 24], [hx + 20, hy - 8]], {
            width: 10, color: [18, 26, 46], alpha: 0.96
          });
          if (h % 2 === 0 || h === 5) {
            api.oilHighlight(4, '农舍温暖灯火金点', hx + 2, hy + 2, 5.5, 5.5, 0, { color: [255, 206, 76], alpha: 0.96, count: 2 });
          }
        }
        paintBar(api, 3, '教堂尖塔底座墙体', 664, 688, 664, 600, 26, [22, 30, 56], { alpha: 0.96 });
        paintBar(api, 3, '教堂高耸尖顶剪影', 664, 610, 664, 456, 13, [18, 26, 48], { alpha: 0.96 });

        // Foreground iconic dark cypress flame
        const cypressPts = [[224, 835], [202, 650], [242, 460], [208, 275], [238, 112]];
        api.oilStroke(3, '前景火焰状墨绿丝柏主干', cypressPts, {
          width: 96, color: [16, 36, 22], colorEnd: [28, 52, 26], alpha: 0.96, stretch: 0.46
        });
        for (let f = 0; f < 16; f++) {
          const t = f / 15;
          const fy = 790 - t * 650;
          const fx = 222 + Math.sin(f * 1.35) * 24;
          api.oilStroke(3, '丝柏树冠卷曲冷绿火舌', [[fx - 26, fy + 24], [fx, fy], [fx + 18, fy - 34]], {
            width: 14, color: f % 2 === 0 ? [44, 84, 44] : [82, 72, 34], alpha: 0.84, bristle: 0.55
          });
        }

        // Luminous swirling stars (broken rhythmic corona arcs + glowing cores) & organic crescent moon
        const stars = [[172, 148, 46], [348, 116, 38], [568, 152, 42], [755, 198, 40], [295, 265, 32], [520, 395, 36]];
        stars.forEach(([sx, sy, sr], idx) => {
          api.oilPatch(4, '星辰柔黄氛围光晕', sx, sy, sr, sr, 0, { color: [248, 224, 112], colorEdge: [54, 102, 178], alpha: 0.56, count: 14 });
          for (let a = 0; a < 5; a++) {
            const a0 = idx * 0.9 + a * (Math.PI * 0.42);
            paintCircleStroke(api, 4, '星晕回旋断续短笔', sx, sy, sr * (0.48 + (a % 2) * 0.28), 10, [252, 232, 134], {
              startAng: a0, endAng: a0 + 0.95, segs: 8, alpha: 0.78
            });
          }
          api.oilHighlight(4, '炽白金黄星核点睛', sx, sy, sr * 0.25, sr * 0.25, 0, { color: [255, 250, 206], alpha: 0.98, count: 4 });
        });
        api.oilPatch(4, '明月金橙晕光外环', 962, 162, 88, 88, 0, { color: [246, 188, 56], colorEdge: [46, 86, 158], alpha: 0.68, count: 18 });
        paintCircleStroke(api, 4, '满月外缘金橙回旋短笔', 962, 162, 68, 13, [250, 204, 72], {
          startAng: 0.4, endAng: 2.8, segs: 12, alpha: 0.80
        });
        paintCircleStroke(api, 4, '满月外缘金橙回旋短笔', 962, 162, 68, 13, [250, 204, 72], {
          startAng: 3.4, endAng: 5.9, segs: 12, alpha: 0.80
        });
        paintCircleStroke(api, 4, '金黄弯月本体厚涂', 962, 162, 30, 24, [255, 214, 62], {
          colorEnd: [238, 152, 32], startAng: -Math.PI * 0.52, endAng: Math.PI * 0.68, segs: 14, alpha: 0.96
        });
        api.oilHighlight(4, '弯月炽亮锋芒', 986, 156, 10, 18, 0.2, { color: [255, 248, 188], alpha: 0.90, count: 4 });
      }
    },

    // =========================================================================
    // 2. VAN GOGH - WHEATFIELD WITH CROWS
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
        // Sky base top half
        for (let y = -10; y <= 385; y += 38) {
          const t = Math.max(0, y / 385);
          const col = [api.lerp(18, 46, t), api.lerp(36, 78, t), api.lerp(82, 138, t)];
          api.oilStroke(1, '风起青靛天幕底涂', [[-50, y], [560, y - 6], [1170, y + 6]], {
            width: 96, fade: 0.02, stretch: 0.72, color: col, colorEnd: col, alpha: 0.65, vary: 5
          });
        }
        // Ochre earth base lower half
        for (let y = 378; y <= 840; y += 40) {
          const t = (y - 378) / 462;
          const col = [api.lerp(178, 138, t), api.lerp(126, 84, t), api.lerp(30, 20, t)];
          api.oilStroke(1, '金褐大地麦田铺底', [[-50, y], [560, y + 4], [1170, y - 4]], {
            width: 102, fade: 0.02, stretch: 0.72, color: col, colorEnd: col, alpha: 0.74, vary: 5
          });
        }

        // Churning storm clouds with heavy organic undulating bands & turquoise rifts
        for (let c = 0; c < 76; c++) {
          const cx = ((c * 197 + 45) % 1160) - 20;
          const cy = 24 + ((c * 61 + (c % 5) * 19) % 340);
          const span = 75 + (c % 4) * 32;
          const waveY = (c % 2 === 0 ? -1 : 1) * (10 + (c % 3) * 8);
          const col = c % 5 === 0 ? [20, 38, 82]
            : (c % 5 === 1 ? [42, 78, 138]
              : (c % 5 === 2 ? [54, 114, 148]
                : (c % 5 === 3 ? [112, 156, 188] : [206, 218, 224])));
          api.oilStroke(2, '狂风压顶乌云排笔', [
            [cx - span, cy - waveY * 0.4], [cx, cy + waveY], [cx + span, cy - waveY * 0.3]
          ], { width: 24 + (c % 3) * 7, color: col, alpha: 0.72, vary: 8, bristle: 0.52 });
        }

        // Three iconic diverging earthy ochre paths with viridian verge
        const paths = [
          [[548, 386], [390, 520], [180, 665], [-20, 810]],
          [[562, 386], [568, 550], [560, 700], [552, 835]],
          [[576, 386], [735, 520], [935, 670], [1145, 815]]
        ];
        paths.forEach(pts => {
          api.oilStroke(2, '草绿田埂镶边勾勒', pts, { width: 62, color: [58, 102, 42], alpha: 0.86, stretch: 0.48 });
          api.oilStroke(2, '裂开麦田的三岔赤赭泥路', pts, { width: 36, color: [176, 104, 56], colorEnd: [198, 128, 72], alpha: 0.92, stretch: 0.45 });
        });

        // Directional wind-swept golden wheat field strokes (dense churning coverage)
        for (let w = 0; w < 225; w++) {
          const wy = 392 + ((w * 43 + (w % 7) * 11) % 420);
          const wx = 18 + ((w * 179 + wy * 0.65) % 1084);
          if (Math.abs(wx - 560) < 28 && wy > 450) continue;
          const t = (wy - 392) / 420;
          const tilt = (wx < 560 ? -0.45 : 0.45) + (api.rand() - 0.5) * 0.35;
          const len = 42 + t * 56;
          const dx = Math.sin(tilt) * len, dy = -Math.cos(tilt) * len * 0.55;
          const col = w % 4 === 0 ? [246, 198, 42]
            : (w % 4 === 1 ? [226, 162, 26]
              : (w % 4 === 2 ? [254, 224, 92] : [192, 126, 24]));
          api.oilStroke(3, '风卷金色麦浪短促排笔', [
            [wx - dx * 0.5, wy - dy * 0.5],
            [wx + (w % 3 - 1) * 5, wy - 6],
            [wx + dx * 0.5, wy + dy * 0.5]
          ], {
            width: 15 + t * 11, stretch: 0.46, fade: 0.12, color: col, colorEnd: [255, 232, 118], alpha: 0.90, vary: 8, bristle: 0.60
          });
        }

        // Flock of dark rising crows cutting across horizon & bright storm rifts
        const crows = [
          [560, 410, 1.15], [608, 384, 1.05], [652, 355, 1.25], [698, 326, 1.15], [744, 294, 1.3],
          [790, 262, 1.35], [835, 236, 1.25], [885, 206, 1.4], [932, 184, 1.45], [985, 158, 1.5],
          [512, 380, 1.0], [468, 345, 1.1], [418, 316, 1.15], [362, 286, 1.25], [306, 250, 1.3],
          [628, 332, 1.05], [685, 286, 1.15], [738, 246, 1.25], [795, 206, 1.3], [848, 168, 1.35],
          [572, 358, 0.95], [642, 308, 1.0], [912, 240, 1.2], [768, 334, 1.1]
        ];
        crows.forEach(([cx, cy, sc]) => {
          const span = 26 * sc;
          api.oilStroke(4, '振翅黑鸦掠空剪影', [
            [cx - span, cy - 6 * sc], [cx - span * 0.35, cy - 13 * sc], [cx, cy + 3 * sc], [cx + span * 0.35, cy - 13 * sc], [cx + span, cy - 5 * sc]
          ], { width: 8.5 * sc, stretch: 0.44, fade: 0.06, color: [10, 10, 14], alpha: 0.98, bristle: 0.12 });
        });
        api.oilHighlight(4, '地平线残光烈黄点睛', 555, 385, 85, 14, 0, { color: [255, 232, 128], alpha: 0.38, count: 6 });
      }
    },

    // =========================================================================
    // 3. VAN GOGH - STARRY NIGHT OVER THE RHONE
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
        paintBackdrop(api, 1120, 820, [14, 42, 86], [22, 62, 112], [12, 28, 62]);
        for (let y = 425; y <= 835; y += 38) {
          const t = (y - 425) / 410;
          const col = [api.lerp(18, 10, t), api.lerp(48, 24, t), api.lerp(92, 54, t)];
          api.oilStroke(1, '罗纳河夜水面重涂铺底', [[-50, y], [560, y + 4], [1170, y - 4]], {
            width: 96, fade: 0.02, stretch: 0.72, color: col, colorEnd: col, alpha: 0.76, vary: 4
          });
        }

        // Woven nocturnal brushstrokes across upper sky
        for (let s = 0; s < 115; s++) {
          const sx = 20 + ((s * 167) % 1080);
          const sy = 25 + ((s * 73) % 375);
          const ang = Math.sin(sx * 0.008) * 0.5 + (s % 2 === 0 ? 0.25 : -0.25);
          const len = 48 + (s % 3) * 18;
          const col = s % 3 === 0 ? [32, 92, 144] : (s % 3 === 1 ? [20, 56, 112] : [54, 128, 158]);
          api.oilStroke(2, '夜空斜向编织厚涂短笔', [
            [sx - Math.cos(ang) * len * 0.5, sy - Math.sin(ang) * len * 0.5],
            [sx, sy - 4],
            [sx + Math.cos(ang) * len * 0.5, sy + Math.sin(ang) * len * 0.5]
          ], { width: 16, color: col, alpha: 0.74, stretch: 0.45, vary: 7, bristle: 0.55 });
        }

        // Big Dipper + radiating bright stars in sky (soft halo + broken sparkle rays)
        const stars = [
          [210, 118, 36], [338, 164, 34], [468, 146, 38], [585, 198, 42],
          [712, 162, 44], [848, 126, 38], [935, 224, 36], [420, 78, 32], [655, 86, 34]
        ];
        stars.forEach(([sx, sy, sr], idx) => {
          api.oilPatch(2, '星辰柔黄光环晕染', sx, sy, sr, sr, 0, { color: [238, 212, 108], colorEdge: [22, 62, 116], alpha: 0.62, count: 14 });
          paintCircleStroke(api, 2, '星辰外圈断续微光', sx, sy, sr * 0.72, 7, [238, 218, 124], {
            startAng: idx * 0.8, endAng: idx * 0.8 + 1.4, segs: 8, alpha: 0.62
          });
          api.oilHighlight(4, '星辰明黄炽核点彩', sx, sy, sr * 0.25, sr * 0.25, 0, { color: [255, 244, 174], alpha: 0.98, count: 4 });
        });

        // Distant Arles riverside silhouette & warm gaslight lamps
        api.oilStroke(3, '对岸阿尔勒城市深黛剪影带', [[-40, 412], [560, 416], [1160, 408]], {
          width: 44, fade: 0.02, color: [18, 26, 46], alpha: 0.94
        });
        const lamps = [110, 178, 252, 336, 418, 496, 568, 635, 708, 782, 855, 928, 1015];
        lamps.forEach((lx, idx) => {
          const ly = 414 + (idx % 2) * 5;
          api.oilHighlight(3, '对岸煤气路灯金橙亮点', lx, ly, 8, 6, 0, { color: [255, 206, 68], alpha: 0.96, count: 3 });

          // Dramatic shimmering vertical reflection columns down into Rhone water!
          const colLen = 190 + (idx % 3) * 65;
          for (let k = 0; k < 6; k++) {
            const ry0 = 436 + k * (colLen / 6);
            const ry1 = ry0 + colLen / 6 + 6;
            const sway = Math.sin(k * 1.4 + idx) * (6 + k * 2.5);
            const c = k < 2 ? [254, 212, 66] : (k < 4 ? [232, 148, 38] : [206, 114, 34]);
            api.oilStroke(3, '河面垂直拉长金色倒影水柱', [
              [lx + sway * 0.4, ry0], [lx + sway, (ry0 + ry1) * 0.5], [lx - sway * 0.3, ry1]
            ], { width: 12 + k * 2.2, stretch: 0.46, fade: 0.08, color: c, colorEnd: [252, 224, 96], alpha: 0.84 - k * 0.08, vary: 8 });
          }
        });

        // Foreground embankment corner & two dark moored boats
        api.oilPatch(3, '前景右岸深褐石坡堤岸', 945, 765, 290, 115, -0.18, { color: [26, 26, 32], colorEdge: [14, 18, 28], alpha: 0.95, count: 22 });
        [[690, 688], [820, 635]].forEach(([bx, by]) => {
          api.oilStroke(4, '近景暗影木舟船身轮廓', [[bx - 56, by - 4], [bx, by + 16], [bx + 58, by - 6]], {
            width: 24, color: [16, 18, 24], alpha: 0.96, stretch: 0.42
          });
          paintBar(api, 4, '岸边斜泊船篙细影', bx - 12, by - 2, bx + 42, by + 46, 7, [24, 22, 20]);
        });
        // Couple silhouettes on shore & sparkling water flecks
        api.oilStroke(4, '河畔夜行伴侣剪影', [[768, 775], [768, 725]], { width: 18, color: [18, 22, 28], alpha: 0.96 });
        api.oilStroke(4, '河畔夜行伴侣剪影', [[796, 778], [794, 732]], { width: 16, color: [34, 48, 76], alpha: 0.96 });
        for (let f = 0; f < 18; f++) {
          api.oilHighlight(4, '水波碎金横向点彩高光', 120 + f * 52, 520 + (f % 5) * 45, 16, 3.2, 0, { color: [255, 232, 118], alpha: 0.85, count: 3 });
        }
      }
    },

    // =========================================================================
    // 4. KANDINSKY - RHYTHMIC COMPOSITION VIII
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
        paintBackdrop(api, 1120, 820, [238, 228, 204], [228, 216, 190], [234, 224, 198]);

        // Ambient soft-edged translucent halos
        api.oilPatch(2, '左上玫瑰粉光雾晕染', 235, 215, 165, 145, 0, { color: [234, 164, 156], colorEdge: [236, 224, 202], alpha: 0.45, count: 16 });
        api.oilPatch(2, '中右天青色雾透叠', 680, 390, 210, 160, 0.2, { color: [148, 194, 228], colorEdge: [236, 224, 202], alpha: 0.44, count: 18 });
        api.oilPatch(2, '中下暖柠檬黄云雾色域', 460, 600, 175, 120, -0.15, { color: [248, 224, 96], colorEdge: [236, 224, 202], alpha: 0.42, count: 14 });

        // Upper-left iconic black-ringed concentric orb
        api.oilPatch(3, '左上红蓝主日正红底芯', 225, 205, 86, 86, 0, { color: [212, 46, 36], colorEdge: [168, 32, 28], alpha: 0.92, count: 18 });
        api.oilPatch(3, '太阳中心深普鲁士蓝核', 225, 205, 48, 48, 0, { color: [24, 42, 92], colorEdge: [18, 28, 62], alpha: 0.94, count: 12 });
        paintCircleStroke(api, 4, '主日炽亮金黄内环', 225, 205, 68, 10, [246, 194, 48], { alpha: 0.92 });
        paintCircleStroke(api, 4, '主日浓黑雕塑外圈', 225, 205, 104, 16, [20, 20, 22], { alpha: 0.95 });

        // Primary geometric triangles & floating circles (dense painterly fills)
        paintTriangle(api, 3, '中央明黄大锐角三角色块', [565, 118], [415, 585], [645, 520], [244, 198, 44], {
          alpha: 0.90, rows: 36, width: 20, edgeCol: [24, 22, 22], edgeW: 7
        });
        paintTriangle(api, 3, '右侧钴蓝锐角三角形', [740, 240], [995, 190], [875, 515], [46, 104, 178], {
          alpha: 0.88, rows: 34, width: 19, edgeCol: [24, 22, 22], edgeW: 7
        });
        paintTriangle(api, 3, '左下朱红斜刺三角', [145, 675], [375, 455], [345, 735], [214, 56, 38], {
          alpha: 0.90, rows: 30, width: 18, edgeCol: [24, 22, 22], edgeW: 6
        });

        // Floating colorful orbs & nested rings
        const orbs = [
          [710, 175, 44, [218, 56, 44], [24, 24, 24]],
          [920, 620, 56, [238, 134, 34], [248, 212, 64]],
          [340, 395, 32, [48, 152, 138], [24, 24, 24]],
          [660, 665, 38, [136, 78, 168], [238, 228, 208]]
        ];
        orbs.forEach(([ox, oy, or, c1, c2]) => {
          api.oilPatch(3, '律动彩圆色盘填充', ox, oy, or, or, 0, { color: c1, alpha: 0.92, count: 14 });
          paintCircleStroke(api, 4, '彩圆外缘墨线描边', ox, oy, or + 2, 7, c2, { alpha: 0.94 });
        });

        // Checkerboard rhythmic strip upper right (crisp dense miniature squares)
        for (let r = 0; r < 3; r++) {
          for (let c = 0; c < 6; c++) {
            const x0 = 670 + c * 28, y0 = 330 + r * 28;
            const dark = (r + c) % 2 === 0;
            paintRect(api, 3, '棋盘节奏冷暖方格', x0, y0, 27, 27, dark ? [22, 22, 26] : [244, 226, 158], {
              step: 6, width: 10, alpha: 0.94, vary: 3, bristle: 0.16
            });
          }
        }

        // Bold dynamic intersecting black vector lines & curved crescent arcs
        paintBar(api, 4, '贯穿对角黑线轨主干', 110, 745, 985, 115, 11, [20, 20, 22], { alpha: 0.95 });
        paintBar(api, 4, '斜切交叉黑线音束', 135, 370, 1020, 655, 8, [22, 22, 24], { alpha: 0.94 });
        paintBar(api, 4, '陡立黑色定音垂线', 565, 70, 520, 755, 9, [22, 22, 24], { alpha: 0.94 });
        paintBar(api, 4, '左下短促音符平行双线', 165, 485, 395, 355, 6, [22, 22, 24], { alpha: 0.92 });
        paintBar(api, 4, '左下短促音符平行双线', 180, 505, 410, 375, 6, [22, 22, 24], { alpha: 0.92 });

        // Sweeping undulating wave line & half-arc
        api.oilStroke(4, '律动正弦波纹黑线', [
          [260, 635], [355, 595], [450, 665], [545, 600], [640, 660], [735, 598]
        ], { width: 8, color: [20, 20, 22], alpha: 0.94 });
        paintCircleStroke(api, 4, '大跨度弧形黑色弯月轨', 560, 495, 295, 10, [20, 20, 22], {
          startAng: -Math.PI * 0.85, endAng: -Math.PI * 0.12, alpha: 0.90
        });

        // Accent glints & tiny staccato notes
        [[225, 205, [255, 244, 188]], [460, 265, [246, 198, 42]], [855, 315, [228, 64, 44]], [920, 620, [255, 232, 128]]].forEach(([x, y, col]) => {
          api.oilHighlight(4, '高频锐利高光顿点', x, y, 6, 6, 0, { color: col, alpha: 0.96, count: 3 });
        });
      }
    },

    // =========================================================================
    // 5. MONDRIAN - DE STYL COMPOSITION IN RED, BLUE & YELLOW
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
        paintBackdrop(api, 960, 960, [242, 238, 228], [236, 232, 222], [240, 236, 226]);

        // Asymmetric De Stijl grid dividers: X: 0, 230, 840, 960 | Y: 0, 320, 690, 825, 960
        // Layer 2: Primary saturated color panes (bleed past outer edges for clean border termination)
        paintRect(api, 2, '右上大面积正红厚涂排笔', 228, -24, 756, 714, [212, 42, 32], {
          colorEnd: [198, 36, 28], step: 20, width: 32, alpha: 0.92, vary: 5
        });
        paintRect(api, 2, '左下饱满钴蓝方格排笔', -24, 686, 258, 298, [28, 66, 148], {
          colorEnd: [22, 54, 128], step: 18, width: 30, alpha: 0.94, vary: 5
        });
        paintRect(api, 2, '右下亮柠檬黄点睛色格', 838, 822, 146, 162, [244, 206, 36], {
          colorEnd: [234, 188, 28], step: 15, width: 24, alpha: 0.94, vary: 4
        });

        // Layer 3: Balanced warm chalk-white & subtle cool grey panes
        paintRect(api, 3, '左上暖象牙白纵向排笔', -24, -24, 258, 348, [244, 240, 230], {
          colorEnd: [236, 232, 220], step: 20, width: 32, alpha: 0.90, vary: 4
        });
        paintRect(api, 3, '左中鸽灰白平衡色格', -24, 316, 258, 378, [224, 226, 226], {
          colorEnd: [212, 216, 218], step: 20, width: 32, alpha: 0.90, vary: 4
        });
        paintRect(api, 3, '中下宽幅暖白画布排笔', 228, 686, 618, 298, [244, 240, 232], {
          colorEnd: [238, 234, 224], step: 20, width: 32, alpha: 0.90, vary: 4
        });
        paintRect(api, 3, '右中珍珠灰过渡色格', 838, 686, 146, 142, [218, 220, 222], {
          colorEnd: [206, 210, 214], step: 15, width: 24, alpha: 0.90, vary: 4
        });

        // Additional subtle top-left painterly impasto highlight strokes inside the white & red blocks
        paintRect(api, 3, '红色色域受光厚涂二次罩色', 260, 24, 680, 634, [222, 52, 38], {
          step: 34, width: 38, alpha: 0.34, vary: 7
        });

        // Layer 4: Bold sculptural architectural black grid bars
        paintBar(api, 4, '左侧长立碳黑垂直主线', 230, -10, 230, 970, 26, [20, 20, 22], { alpha: 0.96, vary: 3 });
        paintBar(api, 4, '中下横向碳黑分割主轴', -10, 690, 970, 690, 26, [20, 20, 22], { alpha: 0.96, vary: 3 });
        paintBar(api, 4, '左方格短横向粗黑分割线', -10, 320, 230, 320, 34, [20, 20, 22], { alpha: 0.96, vary: 3 });
        paintBar(api, 4, '右下短立碳黑垂直分隔线', 840, 690, 840, 970, 26, [20, 20, 22], { alpha: 0.96, vary: 3 });
        paintBar(api, 4, '右下角横向碳黑分割线', 840, 825, 970, 825, 28, [20, 20, 22], { alpha: 0.96, vary: 3 });
      }
    },

    // =========================================================================
    // 6. ROTHKO - SUNSET MEDITATION IN ORANGE & CRIMSON
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
        paintBackdrop(api, 900, 1120, [74, 20, 24], [88, 24, 28], [56, 16, 22]);

        function paintRothkoField(layer, label, yTop, yBot, colCore, colEdge, glazes) {
          const cx = 450, cy = (yTop + yBot) * 0.5;
          const hField = yBot - yTop;
          // Soft ambient outer veil
          api.oilPatch(layer, label + '柔边扩散晕染', cx, cy, 395, hField * 0.56, 0, {
            color: colEdge, colorEdge: colCore, alpha: 0.34, count: 24
          });
          // Multi-layer translucent horizontal thin washes (soft velvet feathering)
          for (let g = 0; g < glazes; g++) {
            const frac = (g + 0.5) / glazes;
            const yy = api.lerp(yTop + 14, yBot - 14, frac);
            const margin = 82 + Math.sin(frac * Math.PI) * 6 + (api.rand() - 0.5) * 8;
            const edgeDist = Math.min(frac, 1 - frac);
            const c = edgeDist < 0.16 ? colEdge : colCore;
            api.oilStroke(layer, label, [
              [margin, yy], [cx, yy + (api.rand() - 0.5) * 4], [900 - margin, yy]
            ], {
              width: 36 + (g % 3) * 8,
              stretch: 0.72,
              fade: 0.18,
              color: c,
              colorEnd: colCore,
              alpha: edgeDist < 0.14 ? 0.34 : 0.52,
              vary: 6,
              bristle: 0.34
            });
          }
          // Luminous inner heart glaze
          api.oilPatch(layer, label + '中心光晕提亮', cx, cy, 310, hField * 0.34, 0, {
            color: colCore, colorEdge: colEdge, alpha: 0.36, count: 16
          });
        }

        // Bottom deep plum-indigo field
        paintRothkoField(2, '下层暗紫褐冥想色域', 725, 1025, [56, 22, 46], [84, 30, 48], 26);

        // Middle intense crimson-vermilion field
        paintRothkoField(3, '中层炽绯红共鸣色域', 485, 685, [202, 42, 34], [148, 26, 28], 22);

        // Top large radiant cadmium-orange & saffron-gold field
        paintRothkoField(4, '上层明橘金光浮动色域', 72, 445, [246, 152, 34], [224, 92, 24], 32);

        // Soft glowing saffron center inside top orange field
        for (let i = 0; i < 12; i++) {
          const yy = 155 + i * 19;
          api.oilStroke(4, '橘黄色域中心暖金呼吸辉光', [[140, yy], [450, yy], [760, yy]], {
            width: 32, stretch: 0.72, fade: 0.18, color: [252, 188, 56], alpha: 0.28, vary: 6
          });
        }
      }
    },

    // =========================================================================
    // 7. KLIMT - GOLDEN TREE OF LIFE
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
        paintBackdrop(api, 920, 1120, [86, 70, 38], [102, 82, 46], [58, 46, 26]);

        // Decorative earthen mosaic lower ground strip
        paintTableBand(api, 920, 1120, 960, [68, 56, 36], [42, 34, 22]);

        // Sweeping central gilded trunk & flared roots
        api.oilStroke(2, '生命之树粗壮黄金主干', [[460, 1080], [456, 860], [462, 660], [458, 470]], {
          width: 78, stretch: 0.48, color: [198, 142, 40], colorEnd: [234, 186, 62], alpha: 0.94, vary: 8
        });
        api.oilStroke(2, '生命之树左侧盘根延伸', [[448, 960], [398, 1035], [312, 1088]], {
          width: 36, stretch: 0.48, color: [188, 134, 36], colorEnd: [218, 168, 48], alpha: 0.90
        });
        api.oilStroke(2, '生命之树右侧盘根延伸', [[472, 960], [522, 1035], [608, 1088]], {
          width: 36, stretch: 0.48, color: [188, 134, 36], colorEnd: [218, 168, 48], alpha: 0.90
        });
        api.oilStroke(2, '树干左侧暗古铜立体过渡', [[438, 1060], [435, 780], [442, 510]], {
          width: 24, color: [122, 82, 24], alpha: 0.80
        });

        // Graceful curling Art Nouveau golden spiral branches
        const branches = [
          // [cx, cy, rStart, rEnd, startAng, turns, width]
          [245, 290, 210, 26, Math.PI * 0.15, 2.25, 22],
          [675, 290, 210, 26, Math.PI * 0.85, -2.25, 22],
          [165, 515, 195, 24, Math.PI * 0.05, -2.15, 20],
          [755, 515, 195, 24, Math.PI * 0.95, 2.15, 20],
          [295, 155, 130, 18, Math.PI * 0.4, 2.0, 16],
          [625, 155, 130, 18, Math.PI * 0.6, -2.0, 16],
          [460, 145, 110, 16, Math.PI * 0.5, 1.9, 15],
          [145, 195, 115, 16, -Math.PI * 0.2, 1.85, 14],
          [775, 195, 115, 16, Math.PI * 1.2, -1.85, 14],
          [255, 675, 145, 20, -Math.PI * 0.15, 1.95, 16],
          [665, 675, 145, 20, Math.PI * 1.15, -1.95, 16],
          [385, 360, 95, 14, Math.PI * 0.55, -1.75, 14],
          [535, 360, 95, 14, Math.PI * 0.45, 1.75, 14]
        ];
        branches.forEach(([cx, cy, rs, re, sa, turns, w], idx) => {
          const pts = spiralPoints(cx, cy, rs, re, sa, turns, 24, 1.0);
          api.oilStroke(2, '对称卷曲螺旋黄金树枝', pts, {
            width: w, stretch: 0.48, fade: 0.06,
            color: idx % 2 === 0 ? [226, 174, 48] : [206, 148, 38],
            colorEnd: [248, 212, 86], alpha: 0.92, vary: 6
          });
          // Delicate inner shadow edge along spiral
          api.oilStroke(3, '金枝内缘深古铜描边', pts, {
            width: 5, stretch: 0.42, fade: 0.08, color: [94, 62, 18], alpha: 0.65
          });
        });

        // Klimt mosaic geometric inlays (turquoise squares, crimson circles, eyes)
        const tiles = [
          [460, 740, [48, 152, 146]], [460, 825, [198, 62, 52]], [460, 910, [242, 232, 206]],
          [245, 290, [48, 152, 146]], [675, 290, [48, 152, 146]],
          [165, 515, [198, 62, 52]], [755, 515, [198, 62, 52]],
          [385, 360, [242, 232, 206]], [535, 360, [242, 232, 206]],
          [145, 195, [52, 148, 142]], [775, 195, [52, 148, 142]]
        ];
        tiles.forEach(([tx, ty, col]) => {
          paintRect(api, 3, '金箔镶嵌宝石方块', tx - 14, ty - 14, 28, 28, col, { step: 10, width: 14, alpha: 0.94 });
          paintCircleStroke(api, 3, '宝石方块金环包边', tx, ty, 20, 4.5, [28, 24, 18], { alpha: 0.85 });
        });

        // Symbolic Horus-eye ovals along middle canopy & trunk
        [[460, 625], [340, 235], [580, 235], [275, 455], [645, 455]].forEach(([ex, ey]) => {
          api.oilPatch(3, '克里姆特装饰眼纹象牙底', ex, ey, 22, 13, 0, { color: [244, 234, 212], alpha: 0.94, count: 6 });
          api.oilHighlight(4, '装饰眼纹黑曜石瞳芯', ex, ey, 6, 6, 0, { color: [22, 20, 18], alpha: 0.96, count: 2 });
        });

        // Scattered floral coral berries & sparkling gold-leaf highlights
        for (let k = 0; k < 24; k++) {
          const fx = 115 + ((k * 167) % 690);
          const fy = 120 + ((k * 113) % 740);
          api.oilHighlight(4, '枝间朱红与金箔饰点', fx, fy, 7, 7, 0, {
            color: k % 3 === 0 ? [208, 64, 52] : (k % 3 === 1 ? [255, 234, 128] : [58, 168, 158]),
            alpha: 0.94, count: 3
          });
        }
      }
    },

    // =========================================================================
    // 8. POLLOCK - AUTUMN RHYTHM DRIP SYMPHONY
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
        paintBackdrop(api, 1120, 820, [202, 182, 146], [192, 170, 134], [182, 160, 124]);

        function dripSkein(layer, label, col, widthMin, widthMax, count, stepsPerSkein) {
          for (let i = 0; i < count; i++) {
            let x = 60 + api.rand() * 1000;
            let y = 50 + api.rand() * 720;
            let ang = api.rand() * Math.PI * 2;
            const pts = [[x, y]];
            const steps = stepsPerSkein || 6;
            for (let s = 0; s < steps; s++) {
              ang += (api.rand() - 0.5) * 2.15;
              const dist = 42 + api.rand() * 98;
              x = Math.max(-20, Math.min(1140, x + Math.cos(ang) * dist));
              y = Math.max(-20, Math.min(840, y + Math.sin(ang) * dist));
              pts.push([x, y]);
            }
            const w = api.randRange(widthMin, widthMax);
            api.oilStroke(layer, label, pts, {
              width: w, stretch: 0.72, fade: 0.04, color: col, colorEnd: col, alpha: 0.90, vary: 5, bristle: 0.16
            });
          }
        }

        // Layer 2: Earthy sienna, amber gold, raw umber foundation webs
        dripSkein(2, '焦赭大地甩彩基底网', [148, 72, 34], 5, 14, 24, 7);
        dripSkein(2, '暖秋明金旋转甩线', [212, 156, 48], 4, 12, 22, 6);
        dripSkein(2, '生褐古铜底层缠绕轨迹', [78, 56, 36], 6, 15, 18, 7);

        // Layer 3: Sweeping high-contrast lamp-black & titanium-white skeins
        dripSkein(3, '狂飙浓黑油漆甩泼长线', [18, 18, 20], 4.5, 16, 42, 7);
        dripSkein(3, '钛白高光飞舞盘旋滴彩', [244, 238, 224], 3.5, 11, 32, 6);

        // Layer 4: Vibrant turquoise & ochre-vermilion rhythm accents + splatter droplets
        dripSkein(4, '绿松石冷彩穿梭节奏线', [46, 148, 154], 3.5, 9, 14, 5);
        for (let d = 0; d < 46; d++) {
          const dx = 45 + ((d * 211 + api.rand() * 55) % 1030);
          const dy = 40 + ((d * 137 + api.rand() * 45) % 740);
          const pal = d % 4 === 0 ? [18, 18, 20]
            : (d % 4 === 1 ? [246, 240, 226]
              : (d % 4 === 2 ? [198, 66, 42] : [52, 156, 162]));
          api.oilHighlight(4, '即兴飞溅喷洒漆滴点彩', dx, dy, 3.2 + (d % 3) * 1.4, 2.8 + (d % 2) * 1.2, api.rand() * 3.14, {
            color: pal, alpha: 0.94, count: 3
          });
        }
      }
    }
  ];

  // Helper reused by Klimt backdrop band
  function paintTableBand(api, w, h, yTop, cTop, cBot) {
    for (let y = yTop; y <= h + 40; y += 42) {
      const t = Math.min(1, (y - yTop) / Math.max(1, h - yTop));
      const col = [api.lerp(cTop[0], cBot[0], t), api.lerp(cTop[1], cBot[1], t), api.lerp(cTop[2], cBot[2], t)];
      api.oilStroke(1, '装饰地面古铜横涂', [[-60, y], [w * 0.5, y - 4], [w + 60, y + 4]], {
        width: 110, stretch: 0.78, fade: 0.02, color: col, colorEnd: col, alpha: 0.62, vary: 4, bristle: 0.30
      });
    }
  }

  window.Code2PaintCatalog.addPack(WORKS);
})();
