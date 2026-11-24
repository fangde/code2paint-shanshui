(function () {
  'use strict';

  const LS = [
    { id: 1, name: '一 · 淡墨勾皴远山' },
    { id: 2, name: '二 · 积墨立峰山骨' },
    { id: 3, name: '三 · 树木水亭舟桥' },
    { id: 4, name: '四 · 设色云烟罩染' },
    { id: 5, name: '五 · 点苔题款钤印' }
  ];

  // Rich procedural Chinese landscape painter accommodating distinct regional styles
  function makeLandscape(spec) {
    return {
      id: spec.id,
      title: spec.title,
      subtitle: spec.subtitle,
      group: '国画·山水',
      category: spec.category || '水墨山水',
      seal: spec.seal,
      mode: 'ink',
      theme: 'xuan',
      width: 1200,
      height: 820,
      seed: spec.seed,
      swatches: spec.swatches,
      desc: spec.desc,
      layers: LS,
      buildStrokes(api) {
        const s = spec;
        const farInk = s.farColor || '#757068';
        const midInk = s.midColor || '#48433b';
        const foreInk = s.foreColor || '#211d18';
        const mistCol = s.mistColor || '#f2ead8';

        // Sky / Night wash if requested (e.g. moonlit night or sunrise)
        if (s.skyWash) {
          for (let sy = 40; sy <= 420; sy += 64) {
            const frac = sy / 420;
            api.inkStroke(1, '天穹气氛漫染', [[-40, sy], [600, sy + 12], [1240, sy - 8]], {
              width: 110, color: frac < 0.5 ? s.skyWash[0] : s.skyWash[1], alpha: (s.skyWash[2] || 0.40) * (1 - frac * 0.65), bleed: 0.9
            });
          }
        }
        if (s.celestial) {
          const [cx, cy, r, col] = s.celestial;
          api.inkDot(1, s.celestialLabel || '天际日轮明月', cx, cy, r, r, { color: col, alpha: 0.92, blend: 'source-over' });
        }

        // Far Peak Ridge — soft atmospheric downward wash (no sharp bottom box cutoff)
        const farPts = s.farPts || [[40, 395], [220, 275], [415, 225], [610, 305], [820, 210], [1035, 285], [1165, 365]];
        api.inkStroke(1, '远山淡墨起势轮廓', farPts, { width: 5.5, color: farInk, alpha: 0.52, dry: 0.28, bleed: 0.55 });
        for (let i = 0; i < farPts.length; i++) {
          const [fx, fy] = farPts[i];
          api.inkStroke(1, '远山云气下拖晕染', [[fx, fy + 6], [fx - 18, fy + 85], [fx - 32, fy + 165]], {
            width: 82, color: farInk, colorEnd: '#ede4d0', alpha: 0.19, bleed: 0.85, profile: 'taper'
          });
        }

        // Mid Peak / Cliff Silhouette with PiMaCun texture strokes dissolving into valley mist
        const midPts = s.midPts || [[80, 495], [260, 360], [450, 320], [645, 420], [840, 265], [1025, 355], [1155, 480]];
        api.inkStroke(2, '中峰立骨披麻皴笔', midPts, { width: 6.5, color: midInk, alpha: 0.84, dry: 0.32 });
        for (let i = 0; i < midPts.length; i++) {
          const [mx, my] = midPts[i];
          api.inkStroke(2, '中峦阴背积墨下拖晕染', [[mx, my + 8], [mx - 20, my + 95], [mx - 42, my + 185]], {
            width: 86, color: midInk, colorEnd: '#ede4d0', alpha: 0.24, bleed: 0.75, profile: 'taper'
          });
          if (i > 0 && i < midPts.length - 1) {
            api.inkStroke(2, `山腹披麻皴纹肌理 ${i}`, [[mx, my + 10], [mx - 24, my + 78], [mx - 42, my + 142]], {
              width: 4.5, color: midInk, alpha: 0.72, dry: 0.44, profile: 'taper'
            });
          }
        }

        // Mist cloud band separating mid peaks & foreground river organically
        if (s.mist !== false) {
          [[240, 492, 230, 34], [580, 502, 260, 36], [920, 488, 220, 32]].forEach(([mx, my, rx, ry], i) => {
            api.inkBlob(4, `山腰流云烟岚 ${i + 1}`, mx, my, rx, ry, 0, {
              color: mistCol, rimColor: mistCol, alpha: 0.84, count: 22, bleed: 0.75, blend: 'source-over'
            });
          });
        }

        // Foreground Left & Right Shore Cliffs (organic textured rock masses, no hard rectangle box)
        const fl = s.foreLeft || [[20, 795], [65, 655], [185, 588], [335, 640], [395, 795]];
        const fr = s.foreRight || [[835, 795], [910, 685], [1055, 645], [1180, 690]];
        api.inkStroke(2, '近岩峭岸焦墨立势', fl, { width: 7.4, color: foreInk, alpha: 0.90, dry: 0.36 });
        api.inkBlob(2, '近岩浑厚皴擦石腹', fl[2][0] - 25, fl[2][1] + 92, 148, 86, -0.08, {
          color: midInk, rimColor: '#ded4be', alpha: 0.62, count: 24, bleed: 0.55
        });
        api.inkStroke(2, '右岸平坡皴笔收势', fr, { width: 6.2, color: midInk, alpha: 0.86, dry: 0.34 });
        api.inkBlob(2, '右岸石坡浓墨漫染', fr[2][0] - 15, fr[2][1] + 58, 128, 54, 0.08, {
          color: midInk, rimColor: '#e4dac6', alpha: 0.50, count: 18, bleed: 0.55
        });

        // Soft River Water Horizon Glaze (gentle open strokes, never clipped box)
        for (let wy = 560; wy <= 730; wy += 42) {
          api.inkStroke(4, '江水湖波横笔淡染', [[260, wy], [680, wy + 10], [1160, wy - 6]], {
            width: 58, color: s.waterColor || '#85969c', alpha: 0.16, bleed: 0.8, profile: 'taper'
          });
        }

        // Optional Waterfall / Stone Bridge / Temple / Pine Trees / Willow / Cottages / Boats!
        if (s.waterfall) {
          const [wx, wy1, wy2] = s.waterfall;
          api.inkStroke(3, '百丈飞瀑直泻白练', [[wx, wy1], [wx + 4, (wy1 + wy2) * 0.5], [wx - 2, wy2]], {
            width: 28, color: '#fbf8f0', alpha: 0.92, blend: 'source-over', dry: 0.25
          });
          api.inkStroke(3, '飞瀑两侧峭壁重墨托', [[wx - 20, wy1], [wx - 16, wy2]], { width: 7, color: foreInk, alpha: 0.82 });
          api.inkStroke(3, '飞瀑右侧石壁', [[wx + 20, wy1], [wx + 18, wy2]], { width: 7, color: foreInk, alpha: 0.82 });
        }

        if (s.cottage) {
          const [hx, hy] = s.cottage;
          api.inkStroke(3, '林间茅舍屋顶坡', [[hx - 38, hy], [hx, hy - 28], [hx + 38, hy]], { width: 6, color: '#241e18' });
          api.inkStroke(3, '茅屋柱墙', [[hx - 28, hy], [hx - 28, hy + 34], [hx + 28, hy + 34], [hx + 28, hy]], { width: 4.2, color: '#342c24' });
          if (s.lantern) api.inkDot(3, '屋窗渔灯暖光', hx, hy + 16, 7, 8, { color: '#ea8b34', blend: 'source-over' });
        }

        if (s.bridge) {
          const [bx, by] = s.bridge;
          api.inkStroke(3, '山涧古石拱桥', [[bx - 65, by + 18], [bx, by - 14], [bx + 65, by + 18]], { width: 9, color: '#2b241d', dry: 0.25 });
        }

        // Foreground Trees / Pines / Red Autumn Trees / Plum Trees
        const treeCol = s.leafColor || '#283825';
        const treeCoords = s.trees || [[170, 610], [245, 595]];
        treeCoords.forEach(([tx, ty], idx) => {
          api.inkStroke(3, `近景古木苍干 ${idx + 1}`, [[tx, ty], [tx - 6, ty - 78], [tx + 12, ty - 122]], { width: 8.5, color: foreInk, alpha: 0.90 });
          for (let k = 0; k < 5; k++) {
            api.inkBlob(4, `丛树墨彩点叶 ${idx + 1}`, tx - 18 + k * 14, ty - 95 - (k % 2) * 18, 28, 13, 0, {
              color: treeCol, rimColor: foreInk, alpha: 0.82, count: 10
            });
          }
        });

        // Distant sailboat / fisherman skiff
        const [bx, by] = s.boat || [645, 645];
        api.inkStroke(3, '江心小舟一笔写意', [[bx - 36, by], [bx, by + 5], [bx + 38, by]], { width: 6, color: foreInk, profile: 'taper' });
        if (s.sail) {
          api.inkWash(4, '远舟白帆', [[bx - 4, by - 2], [bx - 2, by - 36], [bx + 12, by - 6]], {
            color: '#faf6eb', alpha: 0.94, blend: 'source-over', passes: 6, edgeRing: true, edgeWidth: 1.4
          });
        }

        // Optional soft pigment glazing along mid mountain slopes (never hard clipped rectangle)
        if (s.colorWash) {
          for (let i = 0; i < midPts.length; i++) {
            const [mx, my] = midPts[i];
            api.inkStroke(4, '山水设色薄罩染', [[mx, my + 6], [mx - 16, my + 82], [mx - 28, my + 145]], {
              width: 78, color: s.colorWash[0], colorEnd: s.colorWash[1], alpha: (s.colorWash[2] || 0.36) * 0.68, bleed: 0.8
            });
          }
        }

        // Moss dots along crests & cliff tops
        for (let i = 1; i < midPts.length - 1; i++) {
          const [mx, my] = midPts[i];
          api.inkDot(5, `山巅点苔 ${i}`, mx, my - 3, 5.2, 3.8, { color: '#141210' });
        }
        api.inkDot(5, '近石点苔', fl[2][0], fl[2][1] - 3, 5.5, 4.0, { color: '#141210' });

        api.inscription(5, `题画：${s.poem}`, 90, 105, s.poem, { size: 32, stepY: 42, color: s.skyWash ? '#f4eee2' : '#241e17' });
        api.seal(5, `朱印：${s.chop}`, 90, 105 + s.poem.length * 44 + 26, s.chop, { size: 40 });
      }
    };
  }

  const WORKS = [
    makeLandscape({ id: 'ls-jiangnan-rain', title: '烟雨江南', subtitle: '米氏云山湿墨法：斜风细雨烘染 → 黑米点横点峰峦 → 粉墙黛瓦水乡', seal: '米点云山', seed: 4001, poem: '杏花春雨', chop: '江南',
      swatches: ['rgb(238,233,222)', 'rgb(112,116,118)', 'rgb(64,68,66)', 'rgb(34,36,34)', 'rgb(157,45,34)'],
      desc: '烟雾缭绕的江南黛山与水上白墙民居，全用泼墨润染营造淋漓湿润雨气。',
      skyWash: ['#9ea4a8', '#e6dfd0', 0.35], cottage: [220, 610], boat: [620, 650], leafColor: '#3a4a38', waterColor: '#8d999c'
    }),
    makeLandscape({ id: 'ls-guilin-karst', title: '桂林漓江奇峰', subtitle: '现代青绿漓江：挺拔笋状喀斯特孤峰 → 清碧江水倒影 → 撑篙竹筏', seal: '漓江写生', seed: 4002, poem: '桂林山水', chop: '漓江',
      swatches: ['rgb(242,233,214)', 'rgb(54,104,88)', 'rgb(76,128,96)', 'rgb(42,46,42)', 'rgb(168,122,68)'],
      desc: '群笋拔地而起的秀丽青峰列阵江畔，碧水如镜映衬竹筏孤影，经典中国名胜写意。',
      farPts: [[40, 380], [180, 195], [275, 360], [415, 165], [515, 355], [680, 185], [785, 365], [945, 205], [1075, 355], [1165, 380]],
      midPts: [[80, 480], [220, 285], [335, 455], [520, 265], [645, 455], [840, 245], [985, 465], [1145, 480]],
      colorWash: ['#2d755a', '#7aa885', 0.45], waterColor: '#6ca39e', boat: [585, 655], trees: [[145, 615], [965, 665]]
    }),
    makeLandscape({ id: 'ls-huangshan-clouds', title: '黄山云海奇松', subtitle: '黄山派峻峭干笔：乱柴陡峭花岗岩峰 → 翻腾云海大片留白 → 迎客悬松', seal: '黄山派', seed: 4003, poem: '黄山云海', chop: '天都',
      swatches: ['rgb(242,233,214)', 'rgb(34,30,26)', 'rgb(74,69,62)', 'rgb(250,246,238)', 'rgb(38,68,48)'],
      desc: '绝壁千仞破云而出，大片留白流云滚滚浮荡谷底，悬崖伸出一株昂扬迎客青松。',
      farPts: [[80, 365], [240, 175], [360, 295], [560, 145], [720, 265], [920, 165], [1120, 365]],
      midPts: [[120, 465], [295, 215], [445, 395], [725, 185], [885, 365], [1045, 465]],
      trees: [[245, 595], [165, 635]], leafColor: '#1d4a31', mistColor: '#faf6ee'
    }),
    makeLandscape({ id: 'ls-autumn-forest', title: '层林尽染红叶峡', subtitle: '金秋设色山水：浓墨山骨 → 朱砂赭石染漫山红林 → 溪桥红叶', seal: '秋山红叶', seed: 4004, poem: '霜叶红枫', chop: '秋山',
      swatches: ['rgb(242,233,214)', 'rgb(198,54,32)', 'rgb(228,128,44)', 'rgb(48,42,36)', 'rgb(168,108,52)'],
      desc: '霜染层峦万山红遍，山腰茅舍与近坡红枫树林绚烂如霞，浓墨山石压住亮色不显轻浮。',
      colorWash: ['#b85828', '#d69848', 0.45], leafColor: '#c4321c', trees: [[175, 605], [265, 595], [965, 655]], cottage: [595, 465], bridge: [615, 645]
    }),
    makeLandscape({ id: 'ls-xishan-clear', title: '溪山清远图', subtitle: '北宋范宽雄浑法：主峰中立顶天 → 密雨点皴积墨 → 平远江岸渡亭', seal: '北宋气象', seed: 4005, poem: '溪山清远', chop: '清远',
      swatches: ['rgb(242,233,214)', 'rgb(30,28,24)', 'rgb(78,74,68)', 'rgb(142,136,126)', 'rgb(157,45,34)'],
      desc: '主峰如铜墙铁壁矗立中央，底端云雾托起，近景双松与江岸草亭构建稳重三远空间。',
      midPts: [[220, 495], [385, 225], [585, 145], [795, 215], [965, 495]],
      cottage: [235, 610], trees: [[140, 625], [315, 635]], boat: [685, 665]
    }),
    makeLandscape({ id: 'ls-pine-waterfall', title: '松壑飞瀑', subtitle: '观瀑意境山水：双壁夹陡 → 白练千寻留白直落 → 苍松翠微幽涧', seal: '飞流直下', seed: 4006, poem: '松风飞瀑', chop: '听泉',
      swatches: ['rgb(242,233,214)', 'rgb(252,248,240)', 'rgb(34,31,27)', 'rgb(44,72,54)', 'rgb(112,118,124)'],
      desc: '两山夹峙之间白雪银链般的瀑布奔腾直下，水雾氤氲山腰，近松虬曲衬托壮美山势。',
      waterfall: [595, 315, 545], trees: [[165, 610], [235, 635]], leafColor: '#22452f'
    }),
    makeLandscape({ id: 'ls-fishing-lanterns', title: '江村夜渔灯', subtitle: '夜景山水小品：暮蓝淡墨染夜天 → 山村点点渔火灯 → 江月倒影', seal: '夜景山水', seed: 4007, poem: '江枫渔火', chop: '夜泊',
      swatches: ['rgb(242,233,214)', 'rgb(42,52,72)', 'rgb(242,148,54)', 'rgb(28,32,38)', 'rgb(250,242,216)'],
      desc: '夜幕降临青墨江天，孤村亮起温暖点点橘黄灯火与水上孤舟渔灯，静谧诗意满溢。',
      skyWash: ['#364156', '#727e8c', 0.56], waterColor: '#4e5b6e', cottage: [225, 605], lantern: true, boat: [640, 645], celestial: [880, 145, 28, '#faf2dc']
    }),
    makeLandscape({ id: 'ls-distant-sail', title: '孤帆远影碧空尽', subtitle: '留白平远构图：低缓远坡浅花青 → 满江空阔留白 → 天际一点归帆', seal: '平远留白', seed: 4008, poem: '远帆天际', chop: '远浦',
      swatches: ['rgb(242,233,214)', 'rgb(96,124,136)', 'rgb(74,69,62)', 'rgb(252,248,240)', 'rgb(157,45,34)'],
      desc: '极简开阔构图，大片虚白表现浩渺大江东去，唯有天水相接处一叶白帆随波远去。',
      farPts: [[40, 420], [320, 385], [640, 405], [960, 375], [1165, 415]],
      midPts: [[40, 495], [220, 455], [460, 485], [780, 465], [1165, 495]],
      waterColor: '#8aa4b0', boat: [665, 595], sail: true
    }),
    makeLandscape({ id: 'ls-spring-emerald', title: '春山新绿图', subtitle: '春日淡设色：嫩汁绿染草坡 → 朱红桃花点树冠 → 春水柔波', seal: '春山如笑', seed: 4009, poem: '春山翠微', chop: '春融',
      swatches: ['rgb(242,233,214)', 'rgb(112,162,88)', 'rgb(228,112,134)', 'rgb(64,58,50)', 'rgb(122,164,174)'],
      desc: '嫩草绿与春水蓝融成一曲温暖江南春日咏叹，山间几树桃花春意浓浓。',
      colorWash: ['#6aa35a', '#b6cf82', 0.48], leafColor: '#d95872', waterColor: '#7eb2b8', trees: [[175, 605], [945, 665]], cottage: [245, 610]
    }),
    makeLandscape({ id: 'ls-taishan-sunrise', title: '泰山日出云海', subtitle: '红色旭日金峰：朱砂点曦光朝霞 → 雄峙五岳主脊 → 云海紫金晕', seal: '旭日东升', seed: 4010, poem: '旭日东升', chop: '岳宗',
      swatches: ['rgb(242,233,214)', 'rgb(218,58,34)', 'rgb(238,162,62)', 'rgb(42,36,30)', 'rgb(168,148,128)'],
      desc: '大红旭日喷薄而出于泰山极顶云海之上，满天朝霞染透巍峨石脊，气势磅礴吉祥长久。',
      skyWash: ['#df783c', '#f2cf94', 0.42], celestial: [795, 165, 42, '#d82e1c'], colorWash: ['#b86432', '#645248', 0.42]
    }),
    makeLandscape({ id: 'ls-bamboo-cottage', title: '修竹茅舍图', subtitle: '隐逸文人田园：翠竹掩映草亭 → 淡赭柴扉篱笆 → 溪畔清闲', seal: '竹林隐居', seed: 4011, poem: '竹里幽居', chop: '竹居',
      swatches: ['rgb(242,233,214)', 'rgb(34,42,32)', 'rgb(154,116,74)', 'rgb(68,64,58)', 'rgb(24,22,19)'],
      desc: '茂密翠墨竹林环绕山麓草庵，溪畔小亭可望清山，让人仿佛听见风吹竹沙沙声。',
      cottage: [215, 595], leafColor: '#1d3622', trees: [[145, 610], [285, 625], [335, 645]]
    }),
    makeLandscape({ id: 'ls-ancient-temple', title: '深山藏古寺', subtitle: '意境国画：千岩万壑叠翠 → 山凹飞檐红墙半露 → 石阶蜿蜒入云', seal: '深山古刹', seed: 4012, poem: '深山藏寺', chop: '禅钟',
      swatches: ['rgb(242,233,214)', 'rgb(48,44,38)', 'rgb(168,54,42)', 'rgb(88,82,74)', 'rgb(38,62,46)'],
      desc: '重峦叠嶂之中仅露出古刹一角红墙飞檐与细小幡旗，不尽禅意藏在山重水复间。',
      cottage: [615, 425], midPts: [[60, 495], [250, 325], [460, 265], [615, 385], [820, 245], [1025, 315], [1165, 485]], leafColor: '#25422e'
    }),
    makeLandscape({ id: 'ls-plum-snow', title: '梅林春雪山谷', subtitle: '淡彩梅雪山水：寒山淡花青 → 满谷粉红白点梅海 → 踏青独行者', seal: '暗香浮动', seed: 4013, poem: '香雪梅谷', chop: '罗浮',
      swatches: ['rgb(242,233,214)', 'rgb(218,86,108)', 'rgb(252,248,240)', 'rgb(74,88,104)', 'rgb(36,32,28)'],
      desc: '清冷淡墨远山下山谷开满片片粉白红梅花林，梅香飘满青溪两岸。',
      colorWash: ['#5f7488', '#cfd6dc', 0.36], leafColor: '#d95874', trees: [[175, 610], [245, 605], [925, 665]], mistColor: '#f8f2e8'
    }),
    makeLandscape({ id: 'ls-peach-spring', title: '桃花源记', subtitle: '陶渊明诗境山水：峭崖暗洞一线 → 柳岸缤纷桃花源 → 渔郎小舟', seal: '世外桃源', seed: 4014, poem: '芳草鲜美', chop: '桃源',
      swatches: ['rgb(242,233,214)', 'rgb(228,96,124)', 'rgb(64,116,74)', 'rgb(168,118,68)', 'rgb(78,128,136)'],
      desc: '芳草鲜美、落英缤纷的桃花溪谷隐匿于青翠山岭之间，一叶渔舟顺流探幽。',
      colorWash: ['#4a8a5e', '#d99862', 0.40], leafColor: '#e2748e', boat: [525, 660], cottage: [945, 635]
    }),
    makeLandscape({ id: 'ls-evening-boat', title: '秋浦归帆晚', subtitle: '晚霞余晖水墨：斜阳橙染云尾 → 晚归渔帆迎暮色 → 近岸垂柳', seal: '暮归水墨', seed: 4015, poem: '渔舟唱晚', chop: '晚归',
      swatches: ['rgb(242,233,214)', 'rgb(216,126,64)', 'rgb(68,62,56)', 'rgb(32,29,25)', 'rgb(184,142,88)'],
      desc: '夕阳余晖洒满江湾，渔舟鼓帆随秋风归家，近坡垂柳摇曳尽现安详田园暮色。',
      skyWash: ['#e09456', '#f2e8d4', 0.36], boat: [645, 610], sail: true, colorWash: ['#a87448', '#52483e', 0.34]
    }),
    makeLandscape({ id: 'ls-peak-pine-mist', title: '奇峰云松图', subtitle: '黄宾虹浑厚华滋法：宿墨重积崖顶 → 焦墨苍松迎风 → 留白流溪', seal: '浑厚华滋', seed: 4016, poem: '黑密厚重', chop: '宾虹',
      swatches: ['rgb(242,233,214)', 'rgb(22,20,18)', 'rgb(54,50,45)', 'rgb(112,106,96)', 'rgb(248,242,230)'],
      desc: '追求黄宾虹先生“黑、密、厚、重”的层层积墨山骨，黑中透出明净山泉云白。',
      farColor: '#48443e', midColor: '#26231f', foreColor: '#141210', waterfall: [485, 365, 535], trees: [[170, 610], [235, 595]]
    }),
    makeLandscape({ id: 'ls-stone-bridge', title: '小桥流水人家', subtitle: '江南牧歌山水：拱形石桥横跨碧溪 → 水边白屋青树 → 轻舟过桥', seal: '诗意水乡', seed: 4017, poem: '流水人家', chop: '小桥',
      swatches: ['rgb(242,233,214)', 'rgb(74,98,72)', 'rgb(96,90,82)', 'rgb(252,248,240)', 'rgb(154,116,74)'],
      desc: '弯弯石拱小桥联系着溪水两岸瓦屋青林，清溪碧波与行船展现恬淡中国农耕生活。',
      bridge: [615, 605], cottage: [205, 610], leafColor: '#426e45', waterColor: '#6ca0a4', boat: [465, 675]
    }),
    makeLandscape({ id: 'ls-autumn-river-fish', title: '秋江独钓', subtitle: '马远“一角”留白构图：只画左岩红树老松 → 全江水色留空 → 一叟独钓', seal: '马一角法', seed: 4018, poem: '秋江澄澈', chop: '半壁',
      swatches: ['rgb(242,233,214)', 'rgb(198,64,34)', 'rgb(34,30,26)', 'rgb(112,118,124)', 'rgb(157,45,34)'],
      desc: '效法南宋马远半壁江山“边角”构图，重重布置左坡奇岩红树，留足右江澄澈空灵天地。',
      farPts: [[40, 385], [180, 315], [320, 365], [460, 415]], midPts: [[40, 495], [195, 365], [385, 445], [520, 505]],
      leafColor: '#c44224', boat: [765, 645], mist: false
    }),
    makeLandscape({ id: 'ls-cypress-crag', title: '苍岩古柏', subtitle: '古拙文人树石：千年苍古双柏盘根峭壁 → 白云深处见山脊', seal: '岁寒双柏', seed: 4019, poem: '苍翠万古', chop: '古柏',
      swatches: ['rgb(242,233,214)', 'rgb(26,24,21)', 'rgb(44,68,46)', 'rgb(88,82,74)', 'rgb(157,45,34)'],
      desc: '陡峭危岩之上双棵盘结纠缠古柏如苍龙傲立，体现中国传统文化刚健坚贞风骨。',
      trees: [[160, 610], [220, 595], [270, 625]], leafColor: '#1f422b', colorWash: ['#5c685e', '#949c92', 0.25]
    }),
    makeLandscape({ id: 'ls-moon-pool', title: '明月松间照', subtitle: '王维诗意图：青灰靛夜静谧山谷 → 银盘冷月悬松梢 → 清泉石上流', seal: '诗中有画', seed: 4020, poem: '明月松间', chop: '禅诗',
      swatches: ['rgb(242,233,214)', 'rgb(44,54,74)', 'rgb(252,248,236)', 'rgb(24,28,34)', 'rgb(96,112,126)'],
      desc: '深夜花青淡墨染就宁静山岚，一轮皓月斜挂苍松之上，清泉白练在岩石间汩汩流淌。',
      skyWash: ['#3d4a62', '#828e9e', 0.50], celestial: [260, 165, 32, '#fdf9ee'], waterfall: [585, 345, 535], waterColor: '#566478', leafColor: '#1d2d28'
    })
  ];

  window.Code2PaintCatalog.addPack(WORKS);
})();
