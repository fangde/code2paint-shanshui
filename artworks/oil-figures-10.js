(function () {
  'use strict';

  const OIL_FIG_LAYERS = [
    { id: 1, name: '一 · 熟褐起稿与背景氛围' },
    { id: 2, name: '二 · 块面造型与冷暖光影' },
    { id: 3, name: '三 · 五官笔触、发丝与服饰' },
    { id: 4, name: '四 · 厚涂高光与细节提神' }
  ];

  function paintBackdrop(api, w, h, cTop, cMid, cBot) {
    for (let y = -10; y <= h + 40; y += 44) {
      const f = Math.max(0, Math.min(1, y / h));
      const col = f < 0.5
        ? [api.lerp(cTop[0], cMid[0], f * 2), api.lerp(cTop[1], cMid[1], f * 2), api.lerp(cTop[2], cMid[2], f * 2)]
        : [api.lerp(cMid[0], cBot[0], (f - 0.5) * 2), api.lerp(cMid[1], cBot[1], (f - 0.5) * 2), api.lerp(cMid[2], cBot[2], (f - 0.5) * 2)];
      api.oilStroke(1, '无缝油画大背景铺涂', [[-60, y], [w * 0.5, y + 6], [w + 60, y - 6]], {
        width: 118, stretch: 0.78, fade: 0.02, color: col, colorEnd: col, alpha: 0.50, vary: 4, bristle: 0.25
      });
    }
  }

  // Sculpted planar head + jaw contour + warm neck cylindrical form
  function paintSculptedHead(api, cx, cy, w, h, skinL, skinS, hairCol, dir = -1) {
    // Neck shadow cylinder & collarbone
    api.oilStroke(2, '颈项圆柱明暗塑造', [[cx, cy + h * 0.72], [cx, cy + h * 1.48]], {
      width: w * 0.72, color: skinS, colorEnd: [skinS[0] * 0.7, skinS[1] * 0.7, skinS[2] * 0.7], alpha: 0.90, fade: 0.1
    });
    // Back/Crown hair framing mass
    api.oilPatch(1, '发髻头型冷暗起稿', cx + dir * 12, cy - 18, w * 1.15, h * 1.05, 0, {
      color: hairCol, colorEdge: [hairCol[0] * 0.4, hairCol[1] * 0.4, hairCol[2] * 0.4], alpha: 0.94, count: 22
    });
    // Face warm base + cool shadow plane + crisp jaw edge stroke
    api.oilPatch(2, '受光暖调额颊块面', cx - dir * 12, cy - 6, w * 0.90, h * 0.92, 0, {
      color: skinL, colorEdge: skinS, alpha: 0.92, count: 24
    });
    api.oilStroke(2, '下颌骨与背阴侧转折面', [
      [cx - w * 0.72, cy - h * 0.1],
      [cx - w * 0.35, cy + h * 0.72],
      [cx + w * 0.25, cy + h * 0.86],
      [cx + w * 0.74, cy + h * 0.15]
    ], { width: 16, color: skinS, alpha: 0.88, bristle: 0.25 });
    // Sculpted brow ridge, nose plane, lips, clear eyes
    const ex1 = cx + dir * w * 0.28, ex2 = cx - dir * w * 0.24, ey = cy - h * 0.10;
    api.oilStroke(3, '眉弓深痕定神', [[ex1 - 20, ey - 14], [ex1 + 14, ey - 17]], { width: 6.5, color: [52, 34, 24], alpha: 0.82 });
    api.oilStroke(3, '右眉定势', [[ex2 - 14, ey - 16], [ex2 + 18, ey - 12]], { width: 6.5, color: [52, 34, 24], alpha: 0.82 });
    api.oilHighlight(3, '深邃瞳仁凝视', ex1, ey, 6.2, 4.5, 0, { color: [24, 18, 16], alpha: 0.94, count: 3 });
    api.oilHighlight(3, '右眸眼波', ex2, ey + 1, 5.5, 4.2, 0, { color: [24, 18, 16], alpha: 0.94, count: 3 });
    api.oilStroke(3, '鼻梁受光直挺轮廓', [[cx + dir * 2, ey - 10], [cx + dir * 4, cy + h * 0.26]], {
      width: 11, color: skinL, colorEnd: [skinS[0] * 0.88, skinS[1] * 0.72, skinS[2] * 0.68], alpha: 0.82
    });
    api.oilStroke(3, '鼻底微影', [[cx + dir * 4 - 10, cy + h * 0.28], [cx + dir * 4 + 12, cy + h * 0.28]], {
      width: 7, color: [118, 68, 52], alpha: 0.72
    });
    api.oilStroke(3, '朱红饱满唇弓', [[cx + dir * 2 - 15, cy + h * 0.48], [cx + dir * 2, cy + h * 0.45], [cx + dir * 2 + 15, cy + h * 0.48]], {
      width: 10, color: [168, 62, 56], colorEnd: [198, 86, 72], alpha: 0.88
    });
    api.oilHighlight(4, '双眼一点灵魂光泽', ex1 - 1.5, ey - 1.5, 2.2, 2.0, 0, { color: [255, 252, 246], alpha: 0.96, count: 2 });
  }

  function paintNaturalBeard(api, cx, mouthY, len, baseCol, lightCol) {
    // 11 flowing tapered layered beard locks fanning organically (never icicles!)
    for (let i = -5; i <= 5; i++) {
      const spreadX = i * 9;
      const tipLen = len * (1 - Math.abs(i) * 0.08);
      api.oilStroke(3, '层叠蓬松胡须笔触', [
        [cx + spreadX * 0.8, mouthY + 4],
        [cx + spreadX * 1.1, mouthY + tipLen * 0.55],
        [cx + spreadX * 1.35 + (i % 2 ? 6 : -6), mouthY + tipLen]
      ], { width: 16, color: baseCol, colorEnd: lightCol, alpha: 0.82, stretch: 0.42, bristle: 0.72 });
    }
    api.oilStroke(3, '上唇银髯八字分流', [[cx - 28, mouthY - 2], [cx, mouthY - 12], [cx + 28, mouthY - 2]], {
      width: 12, color: lightCol, alpha: 0.90, bristle: 0.65
    });
  }

  const WORKS = [
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
        paintBackdrop(api, 920, 1120, [14, 12, 11], [19, 16, 14], [12, 10, 9]);
        // Sculpted brown-ochre jacket with solid torso + lapel folds
        api.oilPatch(1, '夹克胸膛实色铺底', 465, 925, 215, 220, 0, { color: [96, 68, 36], colorEdge: [42, 28, 16], alpha: 0.94, count: 28 });
        api.oilStroke(1, '肩胸金褐夹克厚实廓形', [[190, 1120], [265, 765], [385, 650], [545, 660], [675, 785], [750, 1120]], {
          width: 145, color: [108, 78, 42], colorEnd: [44, 30, 18], alpha: 0.92, stretch: 0.62
        });
        api.oilStroke(2, '衣襟斜折与受光暖褐面', [[295, 725], [345, 910], [320, 1110]], { width: 58, color: [154, 114, 58], colorEnd: [76, 52, 26], alpha: 0.85 });
        paintSculptedHead(api, 448, 455, 86, 112, [238, 186, 148], [142, 92, 68], [32, 22, 18], -1);
        // Draped Royal Blue Turban + Crisp White Collar + Yellow Trailing Sash
        api.oilStroke(2, '宝蓝头巾额前裹卷质感', [[355, 425], [405, 315], [515, 325], [555, 435]], {
          width: 74, color: [34, 88, 164], colorEnd: [18, 44, 92], alpha: 0.94, stretch: 0.55
        });
        api.oilStroke(2, '头顶宝蓝丝巾交叠褶', [[385, 355], [465, 285], [565, 375]], { width: 46, color: [48, 108, 186], colorEnd: [22, 54, 104], alpha: 0.88 });
        api.oilStroke(3, '明黄长帛自巾后斜泻', [[535, 395], [595, 535], [625, 695], [635, 815]], {
          width: 62, color: [226, 174, 58], colorEnd: [132, 92, 28], alpha: 0.88, stretch: 0.5
        });
        api.oilStroke(3, '清晰翻领白衬领弧线', [[365, 645], [442, 698], [525, 650]], {
          width: 28, color: [242, 238, 226], colorEnd: [162, 158, 150], alpha: 0.92
        });
        // Luminous Pearl Earring under shadow
        api.oilPatch(4, '暗颈畔珍珠圆珠投影', 534, 558, 15, 17, 0, { color: [176, 172, 164], colorEdge: [62, 58, 56], alpha: 0.94, count: 8 });
        api.oilHighlight(4, '珍珠耳环点睛钛白高光', 528, 550, 7, 8, -0.2, { color: [255, 253, 246], alpha: 0.98, count: 5 });
        api.oilHighlight(4, '鼻尖与下唇受光珠泽', 422, 476, 7, 5, 0, { color: [252, 218, 192], alpha: 0.65, count: 3 });
      }
    },
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
        paintBackdrop(api, 920, 1120, [26, 19, 13], [38, 27, 19], [16, 11, 8]);
        api.oilPatch(1, '学者袍胸膛丝绒实色铺底', 460, 925, 235, 220, 0, { color: [92, 34, 24], colorEdge: [38, 16, 12], alpha: 0.94, count: 28 });
        api.oilStroke(1, '深赭红丝绒学者宽肩袍', [[150, 1120], [235, 735], [460, 625], [685, 735], [770, 1120]], {
          width: 185, color: [102, 38, 26], colorEnd: [42, 18, 14], alpha: 0.94, stretch: 0.6
        });
        paintSculptedHead(api, 460, 405, 86, 108, [224, 168, 116], [116, 68, 46], [56, 48, 42], 0);
        // Slanted black velvet scholar beret with soft light edge
        api.oilStroke(2, '黑色天鹅绒帽斜扣额际', [[325, 325], [448, 245], [585, 305]], {
          width: 78, color: [24, 20, 18], colorEnd: [52, 42, 34], alpha: 0.95
        });
        api.oilPatch(2, '暗面标志性倒三角受光面', 498, 428, 26, 20, 0, { color: [216, 162, 112], alpha: 0.70, count: 10 });
        paintNaturalBeard(api, 460, 456, 135, [158, 148, 136], [224, 218, 206]);
        // Open gilded manuscript at desk foreground bottom
        api.oilStroke(3, '桌面精装深褐书壳衬托', [[325, 1015], [465, 985], [605, 1015]], { width: 95, color: [64, 38, 22], alpha: 0.95 });
        api.oilStroke(3, '摊开暖黄羊皮古籍两页', [[345, 995], [465, 965], [585, 995]], {
          width: 68, color: [228, 204, 152], colorEnd: [164, 134, 86], alpha: 0.92
        });
        api.oilHighlight(4, '额眉金辉高光与书脊反光', 425, 348, 22, 10, -0.2, { color: [252, 236, 202], alpha: 0.86, count: 5 });
        api.oilHighlight(4, '古籍受光亮页金白点', 455, 962, 42, 12, 0, { color: [255, 248, 224], alpha: 0.88, count: 5 });
      }
    },
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
        paintBackdrop(api, 960, 1140, [26, 26, 42], [44, 42, 62], [58, 44, 34]);
        // Warm wooden stage floor plane (no weird diagonal pill box!)
        for (let y = 780; y <= 1140; y += 42) {
          api.oilStroke(1, '舞台暖褐反光木地板横刷', [[-60, y], [480, y + 6], [1020, y - 6]], {
            width: 90, fade: 0.02, stretch: 0.75, color: [108, 82, 58], colorEnd: [84, 62, 42], alpha: 0.72
          });
        }
        api.oilPatch(2, '舞台足下暖金反光池', 485, 965, 210, 68, 0, { color: [176, 146, 104], colorEdge: [84, 62, 42], alpha: 0.56, count: 20 });
        // Graceful leaning ballerina figure
        api.oilStroke(2, '盘发深褐舞者发髻与首', [[438, 305], [448, 338]], { width: 54, color: [52, 34, 28], colorEnd: [228, 184, 158], alpha: 0.94 });
        api.oilStroke(2, '纤细脊背肩颈光影', [[442, 365], [472, 485], [492, 575]], { width: 46, color: [238, 194, 168], colorEnd: [168, 118, 98], alpha: 0.88 });
        api.oilStroke(2, '高举优雅右舞臂', [[450, 385], [345, 295], [278, 215]], { width: 20, color: [242, 202, 178], colorEnd: [215, 162, 138], alpha: 0.88 });
        api.oilStroke(2, '左展轻臂如翼', [[482, 412], [615, 365], [705, 340]], { width: 18, color: [232, 186, 162], colorEnd: [188, 136, 118], alpha: 0.84 });
        // Layered pleated tulle skirt (crisp overlapping curved strokes)
        for (let tier = 0; tier < 3; tier++) {
          for (let k = -6; k <= 6; k++) {
            api.oilStroke(3, '象牙白纱裙层叠薄纱褶', [
              [490 + k * 14, 570 + tier * 20],
              [510 + k * 44, 625 + tier * 22],
              [525 + k * 58, 668 + tier * 24]
            ], { width: 38, color: tier === 2 ? [250, 246, 238] : [206, 210, 224], colorEnd: [236, 232, 224], alpha: 0.74, bristle: 0.45 });
          }
        }
        api.oilStroke(3, '修长舞腿（立脚尖点地）', [[485, 675], [472, 865], [465, 1020]], { width: 24, color: [232, 188, 168], alpha: 0.90 });
        api.oilStroke(3, '向后舒展右舞腿', [[535, 668], [625, 815], [705, 935]], { width: 22, color: [214, 168, 152], alpha: 0.86 });
        api.oilHighlight(4, '肩头芭蕾纱裙顶光厚涂白点', 485, 582, 52, 20, 0.05, { color: [255, 252, 244], alpha: 0.92, count: 7 });
        api.oilHighlight(4, '粉红丝带舞鞋亮泽', 465, 1018, 14, 8, 0.2, { color: [248, 206, 208], alpha: 0.92, count: 4 });
      }
    },
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
        paintBackdrop(api, 960, 1140, [86, 142, 202], [148, 188, 224], [88, 128, 68]);
        api.oilPatch(2, '高天绵云受光柔和散射', 260, 195, 180, 62, 0.05, { color: [246, 244, 236], colorEdge: [188, 214, 238], alpha: 0.72, count: 16 });
        api.oilPatch(2, '右侧白云随风流淌', 760, 265, 165, 58, -0.05, { color: [244, 242, 234], colorEdge: [182, 208, 234], alpha: 0.68, count: 14 });
        for (let y = 780; y <= 1140; y += 36) {
          api.oilStroke(2, '翠绿金黄阳光草坡', [[-40, y + 30], [480, y - 18], [1000, y + 14]], {
            width: 82, fade: 0.02, stretch: 0.7, color: [108, 148, 68], colorEnd: [164, 188, 86], alpha: 0.78, temp: 5
          });
        }
        // Flowing windswept white dress + blue sash (sculpted folds, never a blur blob!)
        api.oilStroke(3, '女郎纤细束腰与飘逸白衣袖', [[425, 495], [468, 575], [512, 495]], { width: 46, color: [242, 240, 234], colorEnd: [176, 188, 208], alpha: 0.92 });
        [[465, 575, 365, 885], [472, 575, 482, 910], [482, 575, 588, 895], [492, 575, 645, 865]].forEach(([x0, y0, x1, y1], i) => {
          api.oilStroke(3, `风中摆动白纱裙褶 ${i + 1}`, [[x0, y0], [(x0 + x1) * 0.5 + 18, (y0 + y1) * 0.5], [x1, y1]], {
            width: 58, color: i % 2 === 0 ? [246, 244, 236] : [182, 198, 218], colorEnd: [224, 228, 232], alpha: 0.88
          });
        });
        api.oilStroke(3, '腰间浅蓝丝带斜系', [[438, 565], [485, 578], [520, 562]], { width: 16, color: [68, 112, 168], alpha: 0.88 });
        paintSculptedHead(api, 468, 435, 48, 58, [238, 188, 158], [134, 96, 86], [56, 36, 26], -1);
        // Sculpted domed sunlit parasol (clean continuous umbrella arc + rib + pole)
        api.oilStroke(3, '透光绿荫白阳伞拱顶轮廓', [[265, 325], [475, 228], [678, 305]], {
          width: 78, color: [226, 242, 212], colorEnd: [148, 194, 152], alpha: 0.92, stretch: 0.45
        });
        api.oilStroke(3, '细直伞柄执握垂下', [[472, 232], [462, 545]], { width: 6, color: [68, 54, 40], alpha: 0.90 });
        api.oilPatch(4, '草地冷紫身影投影', 585, 920, 145, 46, 0.06, { color: [68, 86, 118], alpha: 0.56, count: 16 });
        api.oilHighlight(4, '伞顶日光厚涂亮白弧光', 420, 232, 62, 14, -0.22, { color: [255, 253, 244], alpha: 0.92, count: 6 });
        [[185, 965], [265, 1020], [745, 945], [820, 1015]].forEach(([px, py]) => {
          api.oilHighlight(4, '草间野花红黄点缀', px, py, 7, 5, 0, { color: [242, 188, 62], alpha: 0.90, count: 3 });
        });
      }
    },
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
        paintBackdrop(api, 940, 1120, [16, 10, 7], [28, 16, 10], [12, 8, 5]);
        api.oilPatch(1, '左下烛火金橙光晕辐射', 200, 785, 220, 180, 0, { color: [198, 112, 38], colorEdge: [28, 15, 9], alpha: 0.52, count: 22 });
        api.oilPatch(1, '演奏者大衣胸腹填色', 530, 910, 205, 220, 0, { color: [44, 24, 16], colorEdge: [20, 11, 8], alpha: 0.94, count: 26 });
        api.oilStroke(1, '演奏者深褐呢绒大衣躯干', [[295, 1120], [365, 650], [530, 525], [695, 650], [770, 1120]], {
          width: 165, color: [52, 30, 20], colorEnd: [22, 13, 9], alpha: 0.94
        });
        paintSculptedHead(api, 515, 385, 76, 96, [236, 158, 92], [96, 48, 30], [36, 24, 18], -1);
        api.oilStroke(2, '颈间深红羊绒围巾叠搭', [[445, 515], [535, 565], [615, 545]], { width: 46, color: [148, 32, 30], colorEnd: [76, 18, 18], alpha: 0.90 });
        api.oilPatch(3, '琥珀栗木提琴弧面共鸣箱', 415, 585, 86, 52, 0.45, { color: [176, 78, 28], colorEdge: [92, 36, 14], alpha: 0.92, count: 18 });
        api.oilStroke(3, '提琴指板细颈左伸', [[355, 545], [225, 485]], { width: 15, color: [36, 22, 14], alpha: 0.94 });
        api.oilStroke(3, '拉琴细直琴弓横划', [[275, 655], [565, 485]], { width: 5.5, color: [216, 168, 96], alpha: 0.90 });
        api.oilStroke(3, '白蜡柱立影', [[195, 805], [195, 945]], { width: 22, color: [236, 220, 188], colorEnd: [168, 128, 88], alpha: 0.92 });
        api.oilHighlight(4, '烛火炽亮火心', 195, 782, 10, 20, 0, { color: [255, 248, 206], alpha: 0.98, count: 6 });
        api.oilHighlight(4, '琴身抛光金光点睛', 392, 570, 24, 10, 0.45, { color: [255, 226, 148], alpha: 0.88, count: 5 });
      }
    },
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
        paintBackdrop(api, 960, 1120, [48, 52, 58], [58, 52, 48], [32, 26, 22]);
        // Smooth seamless sunlit casement window pane + clean dark mullions
        for (let wy = 70; wy <= 640; wy += 36) {
          api.oilStroke(1, '左侧阳光木窗连续玻面', [[35, wy], [135, wy], [235, wy]], { width: 68, stretch: 0.78, fade: 0.02, color: [222, 230, 226], colorEnd: [184, 198, 200], alpha: 0.86 });
        }
        api.oilStroke(1, '木质窗框外沿竖棂', [[34, 45], [34, 675]], { width: 14, color: [44, 38, 34], alpha: 0.94 });
        api.oilStroke(1, '木质窗框中心竖棂', [[136, 45], [136, 675]], { width: 12, color: [48, 42, 36], alpha: 0.92 });
        api.oilStroke(1, '木质窗框右边框', [[238, 45], [238, 675]], { width: 14, color: [44, 38, 34], alpha: 0.94 });
        api.oilStroke(1, '木质窗格上下与中间横棂', [[32, 360], [240, 360]], { width: 12, color: [48, 42, 36], alpha: 0.92 });
        // Mother sculpted blue gown with solid filled volume
        api.oilPatch(2, '母亲群青长裙实色体面', 565, 865, 175, 255, 0, { color: [38, 68, 116], colorEdge: [20, 36, 64], alpha: 0.94, count: 26 });
        api.oilStroke(2, '母亲群青长袍优雅轮廓', [[345, 1120], [420, 625], [565, 445], [705, 650], [785, 1120]], {
          width: 145, color: [42, 74, 124], colorEnd: [22, 38, 68], alpha: 0.92
        });
        paintSculptedHead(api, 545, 335, 68, 86, [238, 186, 152], [116, 74, 54], [48, 30, 22], -1);
        // Child head & coral-orange sweater cradling neatly against shoulder
        paintSculptedHead(api, 425, 505, 54, 64, [244, 198, 168], [156, 102, 78], [176, 128, 58], 1);
        api.oilStroke(3, '孩童暖橘红毛衣护臂', [[355, 625], [435, 695], [515, 765]], { width: 92, color: [212, 98, 56], colorEnd: [132, 52, 32], alpha: 0.90 });
        api.oilStroke(3, '母亲轻拥右臂手势', [[515, 565], [405, 695], [475, 768]], { width: 38, color: [236, 184, 152], colorEnd: [186, 124, 96], alpha: 0.88 });
        api.oilHighlight(4, '窗光洒在脸颊与金发边缘', 418, 448, 28, 14, -0.3, { color: [255, 246, 224], alpha: 0.80, count: 5 });
        api.oilHighlight(4, '母首额前柔光轮廓', 488, 315, 20, 10, -0.5, { color: [255, 240, 218], alpha: 0.78, count: 4 });
      }
    },
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
        paintBackdrop(api, 1120, 820, [142, 92, 68], [238, 174, 84], [92, 62, 28]);
        for (let y = 395; y <= 820; y += 28) {
          const depth = (y - 395) / 425;
          api.oilStroke(2, '秋收金色麦田大地横刷', [[-40, y], [560, y + 6], [1160, y - 6]], {
            width: 56, fade: 0.02, stretch: 0.7,
            color: [api.lerp(208, 108, depth), api.lerp(154, 72, depth), api.lerp(66, 30, depth)],
            alpha: 0.76, temp: 5
          });
        }
        const drawWorker = (wx, wy, sc, scarfCol, apronCol, name) => {
          api.oilStroke(2, `${name}·弯腰背脊与蓝裙轮廓`, [[wx + 65 * sc, wy + 45 * sc], [wx, wy - 20 * sc], [wx - 55 * sc, wy - 5 * sc]], {
            width: 82 * sc, color: apronCol, colorEnd: [34, 38, 52], alpha: 0.92
          });
          api.oilStroke(3, `${name}·站立双足与裙摆阴影`, [[wx + 25 * sc, wy + 25 * sc], [wx + 42 * sc, wy + 92 * sc]], {
            width: 52 * sc, color: [38, 42, 64], alpha: 0.90
          });
          api.oilPatch(3, `${name}·头裹红蓝头巾垂首`, wx - 68 * sc, wy - 18 * sc, 28 * sc, 26 * sc, 0, {
            color: scarfCol, colorEdge: [88, 28, 22], alpha: 0.92, count: 10
          });
          api.oilStroke(3, `${name}·伸手拾麦手臂`, [[wx - 48 * sc, wy + 8 * sc], [wx - 82 * sc, wy + 72 * sc]], {
            width: 16 * sc, color: [168, 108, 72], alpha: 0.90
          });
          api.oilHighlight(4, `${name}·夕阳背脊金色轮廓光`, wx - 12 * sc, wy - 44 * sc, 48 * sc, 8 * sc, -0.22, {
            color: [255, 224, 132], alpha: 0.82, count: 5
          });
        };
        drawWorker(335, 515, 0.78, [224, 212, 186], [88, 92, 108], '远景同伴');
        drawWorker(645, 585, 1.15, [182, 46, 36], [52, 68, 106], '主拾穗农妇');
        for (let i = 0; i < 24; i++) {
          const sx = 80 + (i * 173) % 980, sy = 560 + (i * 67) % 220;
          api.oilStroke(4, '金色麦穗厚涂短笔', [[sx, sy], [sx + 38, sy - 16]], {
            width: 6, color: [248, 206, 98], colorEnd: [255, 238, 164], alpha: 0.78
          });
        }
      }
    },
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
        paintBackdrop(api, 920, 1120, [32, 48, 38], [44, 58, 48], [22, 26, 22]);
        // Smooth continuous frosted glass window panes left + dark wood mullions
        for (let wy = 70; wy <= 620; wy += 36) {
          api.oilStroke(1, '左侧静室日光方窗连续玻面', [[32, wy], [116, wy], [202, wy]], { width: 68, stretch: 0.78, fade: 0.02, color: [196, 208, 198], colorEnd: [152, 166, 158], alpha: 0.84 });
        }
        api.oilStroke(1, '窗格深木竖边框', [[116, 45], [116, 655]], { width: 10, color: [42, 46, 38], alpha: 0.92 });
        api.oilStroke(1, '窗格深木横边框', [[30, 345], [204, 345]], { width: 10, color: [42, 46, 38], alpha: 0.92 });
        api.oilStroke(1, '深墨绿垂幕竖向褶皱', [[775, 0], [795, 560], [770, 1120]], { width: 165, color: [24, 46, 34], colorEnd: [14, 24, 18], alpha: 0.90 });
        for (let ty = 855; ty <= 1120; ty += 38) {
          api.oilStroke(2, '桌台群青深布无缝平铺', [[-40, ty], [460, ty - 8], [960, ty + 8]], { width: 88, fade: 0.02, stretch: 0.78, color: [32, 44, 72], colorEnd: [22, 28, 44], alpha: 0.88 });
        }
        // Saffron dress solid bodice + sculpted folds & tilted head
        api.oilPatch(2, '少女姜黄胸裙暖面实色填充', 525, 735, 115, 145, 0, { color: [198, 146, 58], colorEdge: [118, 76, 30], alpha: 0.94, count: 22 });
        api.oilStroke(2, '鹅黄姜色衣裙躯干折袖', [[425, 795], [485, 565], [565, 575], [635, 810]], {
          width: 145, color: [212, 158, 66], colorEnd: [124, 82, 34], alpha: 0.92
        });
        paintSculptedHead(api, 495, 435, 72, 92, [238, 188, 152], [134, 86, 62], [68, 42, 28], -1);
        // Open bright book held naturally over table
        api.oilStroke(3, '桌面展开亮白古籍双页斜势', [[285, 815], [395, 785], [505, 825]], {
          width: 96, color: [248, 240, 218], colorEnd: [192, 176, 144], alpha: 0.94
        });
        api.oilHighlight(4, '书页极亮日光与指尖高光', 385, 804, 48, 16, 0.1, { color: [255, 252, 240], alpha: 0.92, count: 6 });
        api.oilHighlight(4, '肩袖金黄反光笔触', 462, 598, 32, 12, 0.4, { color: [248, 204, 108], alpha: 0.80, count: 5 });
      }
    },
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
        paintBackdrop(api, 920, 1120, [58, 78, 98], [92, 112, 128], [28, 42, 58]);
        api.oilStroke(1, '远方海平面波涛灰蓝', [[-60, 695], [460, 690], [980, 688]], { width: 92, fade: 0.02, color: [34, 54, 76], alpha: 0.80 });
        api.oilPatch(1, '船长呢绒胸襟实色体面', 465, 925, 225, 220, 0, { color: [22, 34, 58], colorEdge: [12, 18, 32], alpha: 0.95, count: 28 });
        api.oilStroke(1, '深藏青厚呢船长大衣与翻领', [[170, 1120], [265, 725], [460, 645], [665, 725], [760, 1120]], {
          width: 185, color: [24, 38, 62], colorEnd: [12, 20, 34], alpha: 0.95
        });
        paintSculptedHead(api, 460, 445, 88, 110, [216, 138, 96], [134, 68, 46], [128, 124, 122], 0);
        // Sculpted peaked naval captain cap
        api.oilStroke(2, '大檐船长帽深蓝帽冠', [[335, 315], [460, 275], [585, 315]], { width: 72, color: [24, 36, 58], colorEnd: [14, 18, 28], alpha: 0.95 });
        api.oilStroke(2, '亮漆帽檐斜遮额影', [[342, 344], [458, 362], [575, 340]], { width: 22, color: [16, 18, 22], alpha: 0.96 });
        paintNaturalBeard(api, 460, 492, 132, [146, 142, 138], [232, 228, 218]);
        api.oilHighlight(4, '铜质船长徽章', 458, 295, 16, 10, 0, { color: [238, 198, 86], alpha: 0.94, count: 4 });
        [745, 835, 925].forEach((by, bi) => api.oilHighlight(4, `制服铜扣 ${bi + 1}`, 460, by, 9, 9, 0, { color: [232, 192, 82], alpha: 0.92, count: 3 }));
        api.oilHighlight(4, '海风颧骨亮高光', 418, 428, 20, 10, -0.2, { color: [252, 228, 206], alpha: 0.72, count: 4 });
      }
    },
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
        paintBackdrop(api, 960, 1140, [22, 10, 10], [34, 14, 14], [14, 7, 7]);
        paintSculptedHead(api, 445, 245, 44, 54, [224, 164, 126], [148, 92, 68], [22, 16, 16], 1);
        api.oilStroke(2, '麦色纤瘦背部与仰腕右臂', [[455, 295], [525, 195], [615, 138]], { width: 20, color: [224, 164, 126], colorEnd: [168, 104, 78], alpha: 0.90 });
        api.oilStroke(2, '左手轻撩长裙姿', [[430, 325], [345, 425], [275, 515]], { width: 18, color: [214, 152, 118], alpha: 0.88 });
        api.oilStroke(2, '紧身深红织锦舞衣躯干', [[455, 315], [468, 425], [472, 495]], { width: 82, color: [148, 22, 22], colorEnd: [72, 14, 16], alpha: 0.94 });
        // Rich solid cascading layered crimson Flamenco flounces (full volumetric tiers, zero wagon wheel holes!)
        for (let tier = 0; tier < 4; tier++) {
          const yTop = 505 + tier * 98;
          const spread = 135 + tier * 72;
          for (let k = -4; k <= 4; k++) {
            const bx = 485 + k * (spread * 0.22);
            api.oilStroke(3, `层叠大红荷叶舞裙翻浪 ${tier + 1}`, [[bx, yTop - 35], [bx + k * 8, yTop + 62]], {
              width: 96, color: (tier + k) % 2 === 0 ? [208, 32, 26] : [164, 20, 22], colorEnd: [238, 86, 46], alpha: 0.86, bristle: 0.55
            });
          }
          api.oilStroke(3, `裙层螺旋荷叶波浪线 ${tier + 1}`, [
            [485 - spread, yTop + 45],
            [485 - spread * 0.4, yTop + 72],
            [485, yTop + 55],
            [485 + spread * 0.4, yTop + 75],
            [485 + spread, yTop + 42]
          ], { width: 32, color: [244, 78, 42], colorEnd: [148, 18, 20], alpha: 0.88 });
        }
        api.oilHighlight(4, '髻畔鲜红茶花头饰与高光', 480, 228, 14, 12, 0, { color: [248, 48, 42], alpha: 0.94, count: 5 });
        api.oilHighlight(4, '舞裙受光金红翻卷亮脊', 565, 665, 58, 14, 0.35, { color: [255, 168, 96], alpha: 0.78, count: 6 });
        api.oilHighlight(4, '肩颈暖聚光提亮', 475, 295, 18, 10, -0.3, { color: [255, 228, 198], alpha: 0.84, count: 4 });
      }
    }
  ];

  window.Code2PaintCatalog.addPack(WORKS);
})();
