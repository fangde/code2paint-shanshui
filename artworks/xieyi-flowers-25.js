(function () {
  'use strict';

  const L5 = [
    { id: 1, name: '一 · 枝干藤蔓立势' },
    { id: 2, name: '二 · 浓淡叶片铺陈' },
    { id: 3, name: '三 · 花果羽虫设色' },
    { id: 4, name: '四 · 焦墨提神勾蕊' },
    { id: 5, name: '五 · 点苔题款钤印' }
  ];

  // Rich composable Xieyi Flower/Bird motif factory
  function makeFlowerWork(spec) {
    return {
      id: spec.id,
      title: spec.title,
      subtitle: spec.subtitle,
      group: '国画·花鸟',
      category: spec.category || '写意花鸟',
      seal: spec.seal,
      mode: 'ink',
      theme: 'xuan',
      width: spec.w || 920,
      height: spec.h || 1160,
      seed: spec.seed,
      swatches: spec.swatches,
      desc: spec.desc,
      layers: L5,
      buildStrokes(api) {
        spec.draw(api);
        api.inscription(5, `题画：${spec.poem}`, spec.ix || 135, spec.iy || 145, spec.poem, { size: 32, stepY: 42 });
        api.seal(5, `朱印：${spec.chop}`, spec.ix || 135, (spec.iy || 145) + spec.poem.length * 44 + 28, spec.chop, { size: 40 });
      }
    };
  }

  function stemBranch(api, l, label, pts, w = 14, col = '#2c251e', dry = 0.35) {
    api.inkStroke(l, label, pts, { width: w, color: col, tipColor: '#15120f', alpha: 0.88, dry, bleed: 0.14 });
  }

  function xieyiLeafSpray(api, l, cx, cy, count, baseAng, spread, len, w, col, a, label) {
    for (let i = 0; i < count; i++) {
      const ang = baseAng + (i - (count - 1) * 0.5) * spread;
      const mx = cx + Math.cos(ang) * len * 0.52;
      const my = cy + Math.sin(ang) * len * 0.52 - 8;
      const ex = cx + Math.cos(ang) * len;
      const ey = cy + Math.sin(ang) * len + 10;
      api.inkStroke(l, `${label}`, [[cx, cy], [mx, my], [ex, ey]], {
        width: w, color: col, alpha: a, profile: 'bambooLeaf', bleed: 0.18
      });
    }
  }

  function fruitGroup(api, items, rMin, col1, col2, stemCol, label) {
    items.forEach(([x, y, r], i) => {
      const rr = r || rMin;
      api.inkBlob(3, `${label}果实 ${i + 1}`, x, y, rr, rr * 0.96, (i % 3) * 0.2, {
        color: col1, rimColor: col2, alpha: 0.88, count: 14, bleed: 0.25, blend: 'multiply'
      });
      api.inkDot(3, `${label}果光泽`, x - rr * 0.3, y - rr * 0.3, rr * 0.26, rr * 0.22, {
        color: '#fbf3de', alpha: 0.55, blend: 'source-over'
      });
      api.inkDot(4, `${label}果蒂`, x + rr * 0.15, y + rr * 0.65, 3.8, 2.5, { color: stemCol || '#221c16' });
    });
  }

  function xieyiBird(api, bx, by, dir, bodyCol, wingCol, chestCol, label) {
    api.inkBlob(3, `${label}·羽身浓墨`, bx, by, 30, 22, dir > 0 ? -0.35 : 0.35, {
      color: bodyCol, rimColor: wingCol, alpha: 0.90, count: 14, blend: 'source-over'
    });
    api.inkBlob(3, `${label}·胸腹淡羽`, bx - dir * 6, by + 10, 18, 16, 0, {
      color: chestCol, alpha: 0.85, count: 10, blend: 'source-over'
    });
    api.inkBlob(3, `${label}·圆首`, bx + dir * 24, by - 18, 17, 15, 0, {
      color: bodyCol, alpha: 0.92, count: 10, blend: 'source-over'
    });
    api.inkStroke(4, `${label}·尾羽撇笔`, [[bx - dir * 18, by + 6], [bx - dir * 62, by + 32]], {
      width: 11, color: wingCol, alpha: 0.88, profile: 'taper', dry: 0.25
    });
    api.inkStroke(4, `${label}·短喙`, [[bx + dir * 36, by - 18], [bx + dir * 58, by - 14]], {
      width: 4.5, color: '#2b241c', alpha: 0.94, profile: 'nailHead'
    });
    api.inkStroke(4, `${label}·双爪抓枝`, [[bx - 4, by + 18], [bx - 6, by + 38]], { width: 2.8, color: '#241e17' });
    api.inkStroke(4, `${label}·抓枝左爪`, [[bx + 8, by + 18], [bx + 6, by + 38]], { width: 2.8, color: '#241e17' });
    api.inkDot(4, `${label}·焦墨点睛`, bx + dir * 28, by - 21, 3.0, 3.0, { color: '#0d0b0a', alpha: 0.98 });
  }

  const WORKS = [
    makeFlowerWork({
      id: 'xy-spring-orchid', title: '春兰幽芳', subtitle: '四君子兰草谱：三笔破凤眼 → 淡绿素心兰花 → 紫斑点蕊',
      seal: '四君子', seed: 2001, poem: '王者之香', chop: '素心',
      swatches: ['rgb(242,233,214)', 'rgb(34,36,28)', 'rgb(96,128,68)', 'rgb(142,48,72)', 'rgb(157,45,34)'],
      desc: '兰叶长短穿插起舞成“凤眼”势，三枝素心淡绿兰花吐芳其间。',
      draw(api) {
        api.inkStroke(1, '根石坡墨皴', [[180, 1085], [320, 1025], [495, 1055]], { width: 18, color: '#5c564d', alpha: 0.45, dry: 0.5 });
        [[300, 1045, 385, 620, 620, 290], [320, 1045, 225, 640, 130, 360], [310, 1045, 480, 740, 745, 535], [290, 1045, 240, 785, 195, 610], [335, 1045, 445, 580, 520, 390]].forEach(([x1, y1, x2, y2, x3, y3], i) => {
          api.inkStroke(2, `飘逸兰叶 ${i + 1}`, [[x1, y1], [x2, y2], [x3, y3]], { width: 12, color: i % 2 ? '#363b2d' : '#1b1d17', alpha: 0.86, profile: 'bambooLeaf', dry: 0.14 });
        });
        [[415, 480], [495, 360], [360, 610]].forEach(([fx, fy], idx) => {
          api.inkStroke(1, '兰草花莛', [[320, 1040], [fx - 15, fy + 160], [fx, fy]], { width: 4, color: '#455432', alpha: 0.78 });
          xieyiLeafSpray(api, 3, fx, fy, 5, -1.5, 1.05, 52, 11, '#7a9e52', 0.75, `素心兰瓣 ${idx + 1}`);
          api.inkDot(4, '点花心紫斑', fx, fy + 4, 4.5, 3.5, { color: '#7a2248' });
        });
        api.inkDot(5, '坡畔点苔', 360, 1035, 5, 4, { color: '#181512' });
      }
    }),
    makeFlowerWork({
      id: 'xy-autumn-chrysanthemum', title: '东篱秋菊', subtitle: '散瓣抱心秋菊法：藤黄赭石点瓣 → 浓墨五爪菊叶 → 勾茎点苔',
      seal: '四君子', seed: 2002, poem: '傲霜秋色', chop: '晚香',
      swatches: ['rgb(242,233,214)', 'rgb(228,176,42)', 'rgb(198,94,36)', 'rgb(42,48,32)', 'rgb(24,22,19)'],
      desc: '两朵盛开金黄与赭红秋菊迎风绽放，浓墨重笔五出锯齿菊叶扶疏护花。',
      draw(api) {
        stemBranch(api, 1, '菊花苍韧花梗', [[340, 1100], [420, 740], [485, 420]], 8, '#363828', 0.2);
        stemBranch(api, 1, '侧出斜花枝', [[390, 820], [565, 680], [665, 560]], 7, '#3d3f2e', 0.2);
        [[365, 760], [495, 720], [310, 625], [585, 650]].forEach(([lx, ly], i) => {
          xieyiLeafSpray(api, 2, lx, ly, 4, i % 2 ? 0.5 : 2.5, 0.55, 86, 24, '#292e22', 0.78, '写意菊叶');
        });
        [[485, 405, '#dfa424', '#ba611c', '金黄主菊'], [665, 555, '#c84a2a', '#e68c3a', '朱赭秋菊']].forEach(([cx, cy, c1, c2]) => {
          for (let i = 0; i < 16; i++) {
            const a = (i / 16) * Math.PI * 2;
            api.inkStroke(3, '散瓣抱心秋菊瓣', [[cx, cy], [cx + Math.cos(a) * 55, cy + Math.sin(a) * 55], [cx + Math.cos(a + 0.12) * 95, cy + Math.sin(a + 0.12) * 95]], {
              width: 12, color: i % 2 ? c1 : c2, alpha: 0.80, profile: 'bambooLeaf'
            });
          }
          api.inkDot(4, '深赭点菊心', cx, cy, 12, 10, { color: '#6b3214' });
        });
        api.inkStroke(4, '勾勒菊叶主筋', [[365, 760], [295, 790]], { width: 2.5, color: '#141511' });
      }
    }),
    makeFlowerWork({
      id: 'xy-white-plum', title: '雪胎白梅', subtitle: '圈梅古法：焦墨铁骨龙干 → 中锋淡墨圈五瓣白梅 → 蛤粉提瓣点蕊',
      seal: '铁骨冰魂', seed: 2003, poem: '冰清玉洁', chop: '雪魂',
      swatches: ['rgb(242,233,214)', 'rgb(28,24,20)', 'rgb(252,248,240)', 'rgb(84,96,68)', 'rgb(16,14,12)'],
      desc: '纯水墨焦渴大干搭配“圈梅”空勾白梅朵朵，萼片点淡青绿，清高绝尘。',
      draw(api) {
        stemBranch(api, 1, '焦墨横斜梅干', [[780, 1110], [610, 880], [390, 690], [210, 480], [320, 290]], 28, '#231e19', 0.5);
        stemBranch(api, 1, '穿插细梅梢', [[420, 710], [645, 510], [790, 345]], 10, '#29231d', 0.25);
        stemBranch(api, 1, '上仰花刺枝', [[255, 520], [190, 345], [145, 225]], 6, '#1f1b16', 0.15);
        [[325, 315], [225, 455], [185, 325], [585, 545], [695, 435], [755, 365], [465, 650]].forEach(([bx, by], idx) => {
          for (let p = 0; p < 5; p++) {
            const a = (p / 5) * Math.PI * 2 + idx * 0.4;
            const px = bx + Math.cos(a) * 18, py = by + Math.sin(a) * 18;
            api.inkDot(3, '白粉点亮花瓣', px, py, 13, 12, { color: '#fcfaf3', alpha: 0.92, blend: 'source-over' });
            api.gongbiLine(2, '淡墨细笔圈梅瓣', [[px - 10, py], [px, py - 10], [px + 10, py], [px, py + 10], [px - 10, py]], { width: 1.8, color: '#3b3630', alpha: 0.72 });
          }
          api.inkDot(4, '青绿梅萼', bx, by, 4.5, 4.5, { color: '#4d6138' });
          api.inkDot(4, '焦墨点蕊', bx + 4, by - 5, 2.5, 2.5, { color: '#141210' });
        });
      }
    }),
    makeFlowerWork({
      id: 'xy-green-plum', title: '绿萼梅枝', subtitle: '文人雅玩绿梅：枯笔折枝 → 汁绿石绿点萼圈瓣 → 翠意盎然',
      seal: '古雅绿梅', seed: 2004, poem: '春意清冽', chop: '绿萼',
      swatches: ['rgb(242,233,214)', 'rgb(142,178,108)', 'rgb(74,116,58)', 'rgb(42,36,29)', 'rgb(248,246,236)'],
      desc: '宋人尤重绿萼梅，以青汁绿晕点萼圈瓣，花如碧玉，衬以苍老墨干格外清逸。',
      draw(api) {
        stemBranch(api, 1, '仰出墨干', [[140, 1080], [295, 845], [495, 645], [725, 465], [810, 325]], 24, '#2a241d', 0.48);
        stemBranch(api, 1, '左回护花小梢', [[455, 680], [320, 505], [225, 365]], 9, '#2b251e', 0.24);
        [[255, 395], [325, 500], [565, 595], [665, 505], [765, 385], [790, 325]].forEach(([bx, by], idx) => {
          for (let p = 0; p < 5; p++) {
            const a = (p / 5) * Math.PI * 2 + idx * 0.5;
            api.inkBlob(3, '淡碧绿点梅瓣', bx + Math.cos(a) * 16, by + Math.sin(a) * 16, 12, 11, a, {
              color: '#c2db9e', rimColor: '#6d9452', alpha: 0.80, count: 8, blend: 'source-over'
            });
          }
          api.inkDot(4, '浓汁绿点萼托', bx, by, 5.2, 4.8, { color: '#395c29' });
        });
      }
    }),
    makeFlowerWork({
      id: 'xy-wintersweet', title: '寒冬腊梅', subtitle: '岁寒清供：苍劲墨枝 → 浓藤黄腊瓣点厾 → 檀心紫褐色',
      seal: '岁寒清供', seed: 2005, poem: '凌寒暗香', chop: '蜡梅',
      swatches: ['rgb(242,233,214)', 'rgb(236,184,48)', 'rgb(198,128,28)', 'rgb(96,26,38)', 'rgb(28,24,20)'],
      desc: '蜜蜡般明黄晶莹的腊梅绽放于寒枝之上，花心微点紫檀红晕，明快温暖。',
      draw(api) {
        stemBranch(api, 1, '直插苍劲梅干', [[220, 1100], [365, 795], [510, 495], [645, 255]], 22, '#241e18', 0.45);
        stemBranch(api, 1, '右侧交错横梢', [[430, 645], [645, 575], [820, 520]], 10, '#2e2720', 0.25);
        [[465, 565], [530, 445], [610, 315], [665, 565], [765, 535], [340, 745]].forEach(([bx, by], idx) => {
          for (let p = 0; p < 5; p++) {
            const a = (p / 5) * Math.PI * 2 + idx;
            api.inkBlob(3, '藤黄腊质感点瓣', bx + Math.cos(a) * 15, by + Math.sin(a) * 15, 11, 10, a, {
              color: '#ecc038', rimColor: '#d48622', alpha: 0.88, count: 8
            });
          }
          api.inkDot(4, '檀心紫红蕊', bx, by, 5, 5, { color: '#6b1a28' });
        });
      }
    }),
    makeFlowerWork({
      id: 'xy-wisteria', title: '紫藤垂玉', subtitle: '吴昌硕篆籀写藤：蜿蜒焦墨老藤 → 三青曙红点藤花串 → 嫩黄豆叶',
      seal: '篆籀笔意', seed: 2006, poem: '紫气东来', chop: '藤阴',
      swatches: ['rgb(242,233,214)', 'rgb(122,74,158)', 'rgb(176,128,204)', 'rgb(76,104,54)', 'rgb(34,29,24)'],
      desc: '上端老藤如篆书盘旋绕转，紫蓝花穗倒垂而下由浓渐淡，零星穿插黄绿嫩叶生机勃勃。',
      draw(api) {
        stemBranch(api, 1, '狂草蟠曲主老藤', [[60, 185], [295, 145], [465, 245], [685, 155], [875, 235]], 24, '#241f19', 0.42);
        stemBranch(api, 1, '绕藤细蔓', [[180, 165], [375, 265], [590, 165], [760, 260]], 8, '#342d25', 0.25);
        [[245, 295], [420, 325], [565, 265], [725, 315], [350, 260]].forEach(([fx, fy]) => {
          xieyiLeafSpray(api, 2, fx, fy, 4, 0.2, 0.45, 78, 16, '#56783d', 0.72, '紫藤豆叶');
        });
        [[285, 235, 310], [455, 285, 340], [645, 235, 295], [780, 280, 240]].forEach(([sx, sy, len], idx) => {
          for (let r = 0; r < 14; r++) {
            const f = r / 13;
            const y = sy + f * len;
            const spread = (1 - f * 0.75) * 38;
            const x = sx + Math.sin(r * 2.1 + idx) * spread * 0.55;
            api.inkBlob(3, '花青胭脂点藤花', x, y, 16 - f * 6, 12 - f * 4, r * 0.4, {
              color: f < 0.5 ? '#6d4094' : '#a87ecc', rimColor: '#b98ed8', alpha: 0.78 - f * 0.2, count: 7
            });
          }
          api.inkDot(4, '点花蕾蕊点', sx, sy + len, 3.2, 3.2, { color: '#4f286e' });
        });
      }
    }),
    makeFlowerWork({
      id: 'xy-magnolia', title: '春风玉兰', subtitle: '明清院体写意：厚实苍干直立 → 白粉淡赭点玉瓣 → 花萼墨蒂',
      seal: '玉堂富贵', seed: 2007, poem: '玉雪芳姿', chop: '辛夷',
      swatches: ['rgb(242,233,214)', 'rgb(252,249,242)', 'rgb(212,188,162)', 'rgb(44,36,28)', 'rgb(112,126,82)'],
      desc: '虬枝苍劲如铁直插蓝天，洁白硕大的玉兰花朵朵向上如莲盏般优雅清雅，底部带微浅青紫晕。',
      draw(api) {
        stemBranch(api, 1, '玉兰主斜枝干', [[165, 1110], [285, 795], [465, 495], [685, 265]], 22, '#2d251d', 0.44);
        stemBranch(api, 1, '玉兰直挺花枝', [[385, 625], [320, 395], [275, 245]], 10, '#362d24', 0.24);
        [[305, 315], [445, 455], [585, 335], [685, 245], [565, 475]].forEach(([bx, by]) => {
          [-0.45, 0, 0.45].forEach(da => {
            const mx = bx + Math.sin(da) * 32, my = by - Math.cos(da) * 36;
            const ex = bx + Math.sin(da) * 52, ey = by - Math.cos(da) * 68;
            api.inkStroke(3, '白粉点厚玉兰瓣', [[bx, by], [mx, my], [ex, ey]], {
              width: 30, color: '#fcfaf4', colorEnd: '#ddd2c2', alpha: 0.94, profile: 'bambooLeaf', blend: 'source-over'
            });
          });
          api.inkDot(4, '青褐绒萼', bx, by + 6, 8, 5, { color: '#5c543e' });
        });
      }
    }),
    makeFlowerWork({
      id: 'xy-morning-glory', title: '牵牛攀篱', subtitle: '齐白石田园牵牛：缠绕藤蔓 → 三青点喇叭花冠 → 焦墨掌叶',
      seal: '田园清趣', seed: 2008, poem: '朝露凝芳', chop: '篱趣',
      swatches: ['rgb(242,233,214)', 'rgb(48,88,164)', 'rgb(154,68,148)', 'rgb(28,32,24)', 'rgb(157,45,34)'],
      desc: '粗木篱笆配缠绕牵牛藤丝，湛蓝与紫红点成喇叭状花朵迎朝露盛开，清新朴拙。',
      draw(api) {
        api.inkStroke(1, '木篱直柱', [[720, 120], [725, 1140]], { width: 22, color: '#6b5c49', alpha: 0.48, dry: 0.48 });
        stemBranch(api, 1, '牵牛缠绕细藤', [[720, 1020], [640, 820], [520, 620], [410, 390], [320, 180]], 5.5, '#2b261f', 0.12);
        [[565, 685], [465, 495], [645, 815]].forEach(([lx, ly], i) => {
          xieyiLeafSpray(api, 2, lx, ly, 3, i % 2 ? 2.5 : 0.4, 0.7, 88, 34, '#24291f', 0.80, '三叉墨叶');
        });
        [[365, 320, '#3662b8'], [495, 420, '#9c367c'], [595, 580, '#3662b8'], [410, 560, '#a84488']].forEach(([fx, fy, col]) => {
          api.inkBlob(3, '喇叭形花冠晕染', fx, fy, 42, 36, -0.4, { color: col, rimColor: '#e2dbf0', alpha: 0.84, count: 14 });
          api.inkDot(4, '白色花喉心', fx + 8, fy + 10, 11, 8, { color: '#fbf7ed', blend: 'source-over' });
        });
      }
    }),
    makeFlowerWork({
      id: 'xy-trumpet-creeper', title: '凌霄直上', subtitle: '吴昌硕凌霄法：铁线盘藤 → 朱磦藤黄写喇叭垂花 → 浓墨复叶',
      seal: '昂扬大意', seed: 2009, poem: '凌云直上', chop: '霄汉',
      swatches: ['rgb(242,233,214)', 'rgb(218,74,34)', 'rgb(236,162,48)', 'rgb(28,32,24)', 'rgb(58,48,38)'],
      desc: '枯藤扶壁直上云霄，成串橘红鲜艳凌霄花宛如小号金钟般下垂，热闹富活力。',
      draw(api) {
        stemBranch(api, 1, '苍虬扶壁主藤', [[210, 1120], [305, 820], [440, 520], [585, 220]], 20, '#2a2219', 0.45);
        [[365, 680], [510, 445], [625, 285]].forEach(([lx, ly]) => {
          xieyiLeafSpray(api, 2, lx, ly, 5, 0.4, 0.42, 72, 16, '#23281d', 0.82, '羽状复叶');
        });
        [[465, 560], [495, 610], [585, 365], [625, 415], [395, 455]].forEach(([fx, fy]) => {
          api.inkBlob(3, '朱磦橘红花冠', fx, fy, 26, 30, 0.2, { color: '#d84522', rimColor: '#f0a638', alpha: 0.88, count: 12 });
          api.inkStroke(4, '长花筒瓣影', [[fx, fy - 24], [fx, fy + 14]], { width: 12, color: '#e8882e', alpha: 0.85 });
        });
      }
    }),
    makeFlowerWork({
      id: 'xy-loquat', title: '夏初金枇杷', subtitle: '写意果品：藤黄赭石点圆果 → 大笔阔叶墨绿留筋 → 枯干穿插',
      seal: '初夏时鲜', seed: 2010, poem: '五月金丸', chop: '时鲜',
      swatches: ['rgb(242,233,214)', 'rgb(234,164,42)', 'rgb(198,108,28)', 'rgb(34,42,28)', 'rgb(24,20,16)'],
      desc: '墨绿阔长枇杷叶聚散得当，中间压出一串金黄丰满枇杷果，微点脐印宛然真果。',
      draw(api) {
        stemBranch(api, 1, '斜悬枇杷木枝', [[820, 180], [610, 360], [395, 525]], 18, '#2b231b', 0.4);
        [[445, 465], [625, 385], [320, 625]].forEach(([lx, ly], i) => {
          xieyiLeafSpray(api, 2, lx, ly, 3, 2.4 - i * 0.5, 0.45, 165, 48, '#293221', 0.84, '厚阔枇杷叶');
        });
        fruitGroup(api, [[425, 610, 28], [485, 645, 30], [455, 695, 29], [525, 605, 26], [395, 665, 25]], 27, '#e29828', '#f5ce52', '#1c1814', '金丸枇杷');
      }
    }),
    makeFlowerWork({
      id: 'xy-pomegranate', title: '多子石榴', subtitle: '写意吉祥果：朱红点壳裂露红籽 → 散枝密叶 → 苍劲石榴老桩',
      seal: '多子多福', seed: 2011, poem: '千房同膜', chop: '华实',
      swatches: ['rgb(242,233,214)', 'rgb(196,42,34)', 'rgb(236,124,48)', 'rgb(38,48,28)', 'rgb(142,20,28)'],
      desc: '硕大朱红石榴开口裂笑，点染晶莹红宝石果粒满溢，象征多子多福吉祥如意。',
      draw(api) {
        stemBranch(api, 1, '石榴苍折枝干', [[120, 960], [325, 715], [565, 485], [745, 365]], 18, '#29221b', 0.42);
        [[465, 515], [635, 445], [325, 665]].forEach(([lx, ly]) => {
          xieyiLeafSpray(api, 2, lx, ly, 6, 0.3, 0.48, 66, 14, '#2d3b22', 0.80, '石榴细叶');
        });
        fruitGroup(api, [[485, 585, 58], [625, 515, 48]], 50, '#cc3424', '#ec8e38', '#221c16', '朱红石榴');
        // Bursting ruby seeds inside crack
        api.inkDot(4, '石榴裂口', 505, 615, 22, 16, { color: '#7a121a' });
        for (let i = 0; i < 8; i++) api.inkDot(4, '红玛瑙榴籽', 494 + (i % 4) * 7, 608 + Math.floor(i / 4) * 9, 3.6, 3.6, { color: '#ef3b42', blend: 'source-over' });
      }
    }),
    makeFlowerWork({
      id: 'xy-longevity-peach', title: '三千岁寿桃', subtitle: '齐白石寿桃法：藤黄打底 → 胭脂点染桃尖 → 大笔双叶衬桃',
      seal: '延年益寿', seed: 2012, poem: '瑞实长生', chop: '眉寿',
      swatches: ['rgb(242,233,214)', 'rgb(218,52,78)', 'rgb(244,212,96)', 'rgb(42,56,34)', 'rgb(32,26,20)'],
      desc: '藤黄润圆腹、胭脂染桃尖，鲜翠欲滴的一对大寿桃配苍劲双墨大叶，长辈最爱的喜庆贺寿题材。',
      draw(api) {
        stemBranch(api, 1, '古桃木枝', [[120, 420], [385, 485], [655, 565]], 20, '#2a221a', 0.45);
        [[285, 445], [565, 520], [420, 465]].forEach(([lx, ly], i) => {
          xieyiLeafSpray(api, 2, lx, ly, 4, i % 2 ? 0.8 : -2.1, 0.36, 145, 32, '#2d3d23', 0.84, '硕长桃叶');
        });
        [[465, 645, 76], [625, 705, 66]].forEach(([px, py, r], i) => {
          api.inkBlob(3, `大寿桃黄腹 ${i + 1}`, px, py, r, r * 1.12, 0.25, { color: '#f2ca52', rimColor: '#d95462', alpha: 0.90, count: 16 });
          api.inkBlob(3, `胭脂染红桃尖 ${i + 1}`, px + r * 0.15, py + r * 0.55, r * 0.65, r * 0.65, 0.25, { color: '#bd2642', alpha: 0.82, count: 12 });
        });
      }
    }),
    makeFlowerWork({
      id: 'xy-calabash-gourd', title: '金瓜福禄葫芦', subtitle: '吴昌硕写藤果：藤黄点葫芦上下双肚 → 焦墨飞白卷须 → 浓墨泼掌叶',
      seal: '福禄大吉', seed: 2013, poem: '依样福禄', chop: '多福',
      swatches: ['rgb(242,233,214)', 'rgb(228,176,46)', 'rgb(186,124,28)', 'rgb(24,26,22)', 'rgb(44,58,34)'],
      desc: '两只饱满橙黄大葫芦倒挂古藤之上，叶如泼墨舒张，藤蔓盘曲飞白，谐音“福禄”大吉。',
      draw(api) {
        stemBranch(api, 1, '飞白长蔓老藤', [[90, 140], [340, 210], [585, 165], [820, 240]], 14, '#241e17', 0.45);
        api.inkStroke(1, '绕藤墨须', [[340, 210], [320, 310], [355, 360], [335, 420]], { width: 4.5, color: '#2b241d' });
        [[260, 285], [645, 295], [465, 245]].forEach(([lx, ly]) => {
          api.inkBlob(2, '写意大葫芦掌叶', lx, ly, 86, 68, 0.3, { color: '#262b21', rimColor: '#48543a', alpha: 0.80, count: 16 });
        });
        [[465, 515, 56], [645, 625, 46]].forEach(([gx, gy, r], i) => {
          api.inkBlob(3, `葫芦上腹 ${i + 1}`, gx, gy, r * 0.72, r * 0.72, 0, { color: '#e6b235', rimColor: '#bd7c1a', alpha: 0.90, count: 12 });
          api.inkBlob(3, `葫芦下圆大腹 ${i + 1}`, gx, gy + r * 1.15, r, r * 1.05, 0, { color: '#ecba3c', rimColor: '#b56c18', alpha: 0.90, count: 16 });
          api.inkDot(4, '脐底一点', gx, gy + r * 2.15, 5, 4, { color: '#2b1e14' });
        });
      }
    }),
    makeFlowerWork({
      id: 'xy-persimmon', title: '事事如意红柿', subtitle: '齐白石吉祥果：朱红扁圆笔写柿 → 浓墨四瓣柿蒂 → 枯枝鸟语',
      seal: '事事如意', seed: 2014, poem: '秋实如意', chop: '事顺',
      swatches: ['rgb(242,233,214)', 'rgb(218,62,24)', 'rgb(236,128,36)', 'rgb(24,20,17)', 'rgb(64,68,42)'],
      desc: '数颗鲜亮红柿如小红灯笼挂满枯秋枝头，焦墨点四瓣柿蒂干脆利落，寓意万事如意。',
      draw(api) {
        stemBranch(api, 1, '秋干枯枝伸展', [[820, 220], [585, 395], [345, 565], [165, 745]], 18, '#29221b', 0.46);
        [[495, 465], [695, 345], [275, 665]].forEach(([lx, ly]) => {
          xieyiLeafSpray(api, 2, lx, ly, 3, 2.3, 0.5, 92, 26, '#394128', 0.78, '秋柿残叶');
        });
        [[365, 655, 42], [445, 695, 38], [585, 510, 44], [655, 560, 36]].forEach(([px, py, r]) => {
          api.inkBlob(3, '朱红扁圆柿子', px, py, r * 1.15, r * 0.92, 0, { color: '#d83a1a', rimColor: '#ec8228', alpha: 0.90, count: 14 });
          api.inkDot(4, '焦墨四瓣柿蒂', px, py - r * 0.76, 14, 5.5, { color: '#171412' });
        });
      }
    }),
    makeFlowerWork({
      id: 'xy-lychee', title: '岭南红荔', subtitle: '岭南派写意果：胭脂点厾壳斑 → 藤黄焦墨皴刺 → 浓绿窄长荔枝叶',
      seal: '岭南佳果', seed: 2015, poem: '日啖三百', chop: '岭南',
      swatches: ['rgb(242,233,214)', 'rgb(198,32,48)', 'rgb(138,18,28)', 'rgb(34,68,40)', 'rgb(228,176,68)'],
      desc: '绛红饱满硕荔枝簇聚一堂，壳面用焦墨细点龟裂斑点凸显岭南佳果独特肌理。',
      draw(api) {
        stemBranch(api, 1, '荔枝老横枝', [[120, 240], [395, 365], [685, 465]], 18, '#2b221a', 0.4);
        [[345, 340], [645, 445], [485, 385]].forEach(([lx, ly], i) => {
          xieyiLeafSpray(api, 2, lx, ly, 5, i % 2 ? 0.5 : 2.6, 0.34, 118, 22, '#244f2c', 0.84, '荔枝长叶');
        });
        [[465, 585, 32], [530, 625, 34], [495, 675, 30], [425, 645, 29], [565, 565, 28]].forEach(([px, py, r]) => {
          api.inkBlob(3, '绛红硕大荔枝', px, py, r, r * 1.08, 0, { color: '#c42038', rimColor: '#7a1020', alpha: 0.90, count: 14 });
          for (let d = 0; d < 6; d++) api.inkDot(4, '龟裂荔枝皮麻点', px + (d - 2.5) * 8, py + (d % 2 - 0.5) * 14, 2.2, 2.2, { color: '#450a14' });
        });
      }
    }),
    makeFlowerWork({
      id: 'xy-cherry', title: '春深红樱桃', subtitle: '小品写意：曙红双笔点亮珠 → 白粉点反光 → 细青梗串果',
      seal: '小品清供', seed: 2016, poem: '红了樱桃', chop: '春归',
      swatches: ['rgb(242,233,214)', 'rgb(206,24,38)', 'rgb(142,16,28)', 'rgb(64,86,44)', 'rgb(252,244,234)'],
      desc: '娇艳欲滴的串串红樱桃垂挂细长碧绿果蒂，颗颗点高光如红玛瑙般透亮。',
      draw(api) {
        stemBranch(api, 1, '春樱木枝', [[120, 295], [445, 385], [785, 320]], 16, '#2b241d', 0.35);
        [[365, 365], [645, 355]].forEach(([lx, ly], i) => {
          xieyiLeafSpray(api, 2, lx, ly, 4, i ? 0.6 : 2.4, 0.5, 92, 24, '#36562b', 0.78, '春樱绿叶');
        });
        const cherries = [[420, 580], [470, 610], [445, 655], [565, 595], [610, 635], [585, 685]];
        cherries.forEach(([cx, cy], i) => {
          api.inkStroke(2, '纤细碧绿樱桃柄', [[i < 3 ? 445 : 585, 375], [cx, cy - 12]], { width: 2.5, color: '#486634' });
          api.inkBlob(3, '宝石红樱桃果', cx, cy, 20, 19, 0, { color: '#cc1c32', rimColor: '#840e1d', alpha: 0.92, count: 10 });
          api.inkDot(4, '樱桃高光亮晶点', cx - 6, cy - 6, 4.2, 3.6, { color: '#fcf4eb', blend: 'source-over' });
        });
      }
    }),
    makeFlowerWork({
      id: 'xy-begonia', title: '海棠春睡', subtitle: '没骨写意花卉：燕脂粉点海棠簇花 → 青绿翻折枝叶 → 蜂虫点睛',
      seal: '花中神仙', seed: 2017, poem: '海棠春色', chop: '春睡',
      swatches: ['rgb(242,233,214)', 'rgb(218,78,108)', 'rgb(248,184,198)', 'rgb(52,88,52)', 'rgb(28,24,19)'],
      desc: '海棠花丝柔垂、粉红娇嫩成串绽放于春日斜枝，绿叶点朱脉增添诗意春暖。',
      draw(api) {
        stemBranch(api, 1, '垂丝海棠木枝', [[140, 960], [345, 710], [565, 480], [790, 290]], 16, '#2e261f', 0.38);
        [[465, 585], [645, 435], [295, 765]].forEach(([lx, ly], i) => {
          xieyiLeafSpray(api, 2, lx, ly, 4, i % 2 ? 0.5 : 2.3, 0.45, 86, 22, '#345834', 0.80, '海棠嫩叶');
        });
        [[395, 465], [510, 395], [645, 315], [720, 385], [320, 610]].forEach(([bx, by], idx) => {
          for (let p = 0; p < 5; p++) {
            const a = (p / 5) * Math.PI * 2 + idx;
            api.inkBlob(3, '海棠嫩粉花瓣', bx + Math.cos(a) * 18, by + Math.sin(a) * 18, 16, 14, a, {
              color: '#ea8ca2', rimColor: '#c23458', alpha: 0.84, count: 8
            });
          }
          api.inkDot(4, '点鹅黄花蕊', bx, by, 5.5, 5.5, { color: '#e6c042' });
        });
      }
    }),
    makeFlowerWork({
      id: 'xy-hibiscus', title: '秋江木芙蓉', subtitle: '没骨花鸟小品：大笔胭脂晕芙蓉 → 淡墨阔掌叶 → 焦墨枝托',
      seal: '写意秋花', seed: 2018, poem: '拒霜照水', chop: '清艳',
      swatches: ['rgb(242,233,214)', 'rgb(228,118,142)', 'rgb(248,214,224)', 'rgb(44,54,42)', 'rgb(166,46,72)'],
      desc: '秋霜前盛开的粉白木芙蓉宛如水中莲花，配阔大掌状绿墨叶片显得明丽脱俗。',
      draw(api) {
        stemBranch(api, 1, '木芙蓉挺干', [[210, 1100], [345, 825], [465, 565]], 14, '#363028', 0.3);
        [[315, 745], [565, 695], [420, 865]].forEach(([lx, ly]) => {
          api.inkBlob(2, '芙蓉阔掌叶', lx, ly, 78, 66, 0.2, { color: '#394735', rimColor: '#222b20', alpha: 0.78, count: 14 });
        });
        [[465, 455, 76], [625, 545, 62]].forEach(([cx, cy, R]) => {
          for (let i = 0; i < 8; i++) {
            const a = (i / 8) * Math.PI * 2;
            api.inkBlob(3, '粉白晕染芙蓉瓣', cx + Math.cos(a) * R * 0.55, cy + Math.sin(a) * R * 0.55, R * 0.45, R * 0.42, a, {
              color: '#ef98ab', rimColor: '#b82e52', alpha: 0.78, count: 10
            });
          }
          api.inkDot(4, '藤黄深蕊柱', cx, cy, 8, 8, { color: '#e0b036' });
        });
      }
    }),
    makeFlowerWork({
      id: 'xy-narcissus', title: '凌波水仙', subtitle: '新春案头清供：白粉青叶写剑叶 → 六瓣洁白花冠 → 金盏点心',
      seal: '岁朝清供', seed: 2019, poem: '凌波仙子', chop: '幽芳',
      swatches: ['rgb(242,233,214)', 'rgb(52,82,48)', 'rgb(252,250,244)', 'rgb(236,184,34)', 'rgb(96,90,82)'],
      desc: '怪石清泉养出亭亭水仙，直立剑叶青翠如玉，顶开金盏银台洁白芳菲。',
      draw(api) {
        api.inkBlob(1, '水仙蒜头球根', 460, 965, 68, 46, 0, { color: '#8a7456', rimColor: '#483b2b', alpha: 0.78, count: 14 });
        for (let i = -3; i <= 3; i++) {
          api.inkStroke(2, `挺立碧绿剑叶`, [[460 + i * 16, 945], [460 + i * 28, 650], [460 + i * 42, 390 + Math.abs(i) * 45]], {
            width: 18, color: '#395e34', alpha: 0.84, profile: 'bambooLeaf'
          });
        }
        [[395, 365], [485, 315], [565, 395]].forEach(([fx, fy]) => {
          for (let p = 0; p < 6; p++) {
            const a = (p / 6) * Math.PI * 2;
            api.inkBlob(3, '雪白银台花瓣', fx + Math.cos(a) * 18, fy + Math.sin(a) * 18, 14, 10, a, { color: '#fdfaf3', alpha: 0.94, count: 6, blend: 'source-over' });
          }
          api.inkDot(4, '明黄小金盏花心', fx, fy, 7.5, 7.5, { color: '#eba61c', blend: 'source-over' });
        });
      }
    }),
    makeFlowerWork({
      id: 'xy-banana-garden', title: '雨打芭蕉', subtitle: '阔笔大写意：破墨阔扫大片绿蕉叶 → 朱砂点芭蕉蕾 → 顽石点苔',
      seal: '雨窗闲情', seed: 2020, poem: '绿天蕉影', chop: '蕉荫',
      swatches: ['rgb(242,233,214)', 'rgb(48,96,52)', 'rgb(34,42,30)', 'rgb(206,62,48)', 'rgb(76,72,64)'],
      desc: '斗笔横阔大刷雨后润湿芭蕉巨叶，撕裂叶缝灵动透气，旁点一朵艳红蕉蕾打破沉静。',
      draw(api) {
        api.inkWash(1, '近石太湖底韵', [[140, 1140], [210, 965], [385, 925], [495, 1065], [520, 1140]], { color: '#6b655c', alpha: 0.56 });
        [[280, 620, -0.75], [420, 560, -0.25], [640, 595, 0.45]].forEach(([lx, ly, ang], idx) => {
          api.inkStroke(2, `芭蕉巨大阔叶 ${idx + 1}`, [[345, 960], [lx, ly], [lx + Math.cos(ang) * 260, ly + Math.sin(ang) * 240]], {
            width: 118, color: '#295932', colorEnd: '#192b1d', alpha: 0.80, dry: 0.22, profile: 'bambooLeaf', bleed: 0.3
          });
          api.inkStroke(4, '芭蕉粗中脉', [[345, 960], [lx + Math.cos(ang) * 245, ly + Math.sin(ang) * 225]], { width: 5, color: '#141c13' });
        });
        api.inkBlob(3, '艳红芭蕉花蕾', 565, 765, 22, 42, 0.2, { color: '#cc3628', rimColor: '#8c1614', alpha: 0.90, count: 12 });
      }
    }),
    makeFlowerWork({
      id: 'xy-myna-bird', title: '柳枝八哥', subtitle: '写意禽鸟典范：侧锋浓焦墨写黑八哥 → 黄喙白眼 → 几笔风柳垂枝',
      seal: '禽鸟写意', seed: 2021, poem: '枝头清啼', chop: '八哥',
      swatches: ['rgb(242,233,214)', 'rgb(22,20,18)', 'rgb(42,38,32)', 'rgb(236,184,48)', 'rgb(76,94,58)'],
      desc: '笔简神完的墨黑八哥仰首立于秋柳枯枝，淡赭点黄喙爪部，黑白虚实强烈抓人眼球。',
      draw(api) {
        stemBranch(api, 1, '斜悬老柳干', [[820, 260], [565, 485], [320, 685]], 18, '#362e26', 0.42);
        [[465, 565], [685, 365]].forEach(([x, y]) => xieyiLeafSpray(api, 2, x, y, 5, 1.5, 0.25, 95, 9, '#4c6138', 0.65, '秋柳丝叶'));
        xieyiBird(api, 520, 445, -1, '#191716', '#0d0c0b', '#36322f', '黑羽八哥');
        api.inkStroke(4, '明黄鸟喙点睛', [[484, 427], [462, 431]], { width: 5, color: '#e6ae28', blend: 'source-over' });
      }
    }),
    makeFlowerWork({
      id: 'xy-sparrows', title: '寒雀嬉枝', subtitle: '田园水墨麻雀：赭墨大笔点麻雀圆肚 → 浓墨飞翅 → 数只群雀顾盼呼应',
      seal: '花鸟小景', seed: 2022, poem: '群雀闹春', chop: '天真',
      swatches: ['rgb(242,233,214)', 'rgb(142,96,58)', 'rgb(228,214,188)', 'rgb(36,28,22)', 'rgb(168,54,48)'],
      desc: '三只胖乎乎写意麻雀或歇枯苇或凌空飞来，用赭墨点背部，浓墨点双翼与面颊黑斑，极富生活气息。',
      draw(api) {
        stemBranch(api, 1, '田园枯枝', [[120, 825], [465, 685], [820, 610]], 14, '#322921', 0.45);
        [[295, 745], [645, 650]].forEach(([x, y]) => api.inkDot(3, '残秋红叶果点缀', x, y, 7, 5, { color: '#ba3224' }));
        xieyiBird(api, 395, 650, 1, '#845938', '#2c1e16', '#dfd2be', '枝头左雀');
        xieyiBird(api, 585, 600, -1, '#7a5234', '#261a14', '#e3d8c4', '枝头右雀');
        // Flying sparrow swooping top-right
        xieyiBird(api, 645, 315, -1, '#8c603e', '#2b1e16', '#e6dbc6', '凌空飞雀');
        api.inkStroke(4, '飞雀展翅', [[645, 315], [695, 255]], { width: 16, color: '#382a20', profile: 'bambooLeaf' });
      }
    }),
    makeFlowerWork({
      id: 'xy-rooster', title: '大吉雄鸡图', subtitle: '徐悲鸿大写意鸡：朱红冠顶 → 浓墨破笔扇尾 → 劲健双爪雄立石上',
      seal: '大吉图', seed: 2023, poem: '雄鸡一唱', chop: '大吉',
      swatches: ['rgb(242,233,214)', 'rgb(206,36,28)', 'rgb(24,22,20)', 'rgb(218,142,48)', 'rgb(88,82,74)'],
      desc: '昂首立于顽石的雄鸡红冠高耸、金颈蓬松、浓焦墨长尾如剑扫出，“鸡”“吉”谐音吉祥大气。',
      draw(api) {
        api.inkWash(1, '磐石淡墨稳托', [[220, 1140], [260, 885], [485, 845], [685, 925], [710, 1140]], { color: '#6b655c', alpha: 0.56 });
        api.inkBlob(2, '金赭雄鸡颈胸羽', 415, 585, 55, 78, -0.35, { color: '#d4822c', rimColor: '#9c4e18', alpha: 0.88, count: 16 });
        api.inkBlob(2, '浓墨鸡背羽翅', 515, 620, 72, 48, 0.1, { color: '#1b1917', rimColor: '#3b3732', alpha: 0.92, count: 18 });
        // Sweeping magnificent black rooster tail feathers!
        for (let t = 0; t < 5; t++) {
          api.inkStroke(3, `大红大黑长尾羽 ${t + 1}`, [[560, 610], [685, 515 + t * 22], [790, 565 + t * 28]], {
            width: 18, color: t % 2 ? '#161412' : '#263829', alpha: 0.90, profile: 'bambooLeaf', dry: 0.25
          });
        }
        // Bright vermilion comb & wattle
        api.inkBlob(3, '鲜红高耸鸡冠', 375, 425, 26, 18, -0.2, { color: '#cc241c', alpha: 0.94, count: 10, blend: 'source-over' });
        api.inkDot(4, '红髯垂颊', 362, 472, 9, 13, { color: '#cc241c', blend: 'source-over' });
        api.inkStroke(4, '健步黄爪抓石', [[465, 675], [455, 865]], { width: 5, color: '#9c7834' });
        api.inkStroke(4, '右爪支石', [[515, 675], [525, 865]], { width: 5, color: '#9c7834' });
        api.inkDot(4, '雄鸡明目', 365, 448, 3.2, 3.2, { color: '#100d0b' });
      }
    }),
    makeFlowerWork({
      id: 'xy-white-egret', title: '秋水白鹭', subtitle: '林良水墨苇塘白鹭：白粉塑净羽 → 苍苇斜风 → 长喙黑足涉水',
      seal: '高洁品格', seed: 2024, poem: '一鹭莲升', chop: '雪衣',
      swatches: ['rgb(242,233,214)', 'rgb(252,250,244)', 'rgb(184,174,158)', 'rgb(48,44,38)', 'rgb(88,104,76)'],
      desc: '白粉与淡赭墨衬托洁白修长白鹭涉足清塘，身后摇曳水墨芦苇随秋风起伏，清丽幽静。',
      draw(api) {
        [[180, 1140, 210, 620, 290, 280], [230, 1140, 285, 710, 345, 390], [740, 1140, 795, 760, 845, 480]].forEach(([x1, y1, x2, y2, x3, y3]) => {
          api.inkStroke(1, '塘畔秋苇长茎', [[x1, y1], [x2, y2], [x3, y3]], { width: 6, color: '#5c584e', alpha: 0.56 });
        });
        xieyiLeafSpray(api, 2, 225, 585, 4, -0.5, 0.3, 125, 12, '#4a473e', 0.65, '枯苇风叶');
        // White egret body
        api.inkBlob(3, '白鹭洁白羽躯', 485, 625, 62, 42, -0.25, { color: '#fcfaf4', rimColor: '#d9d1c0', alpha: 0.94, count: 16, blend: 'source-over' });
        api.inkStroke(3, '白鹭S形优美长颈', [[445, 610], [415, 495], [445, 385], [472, 360]], { width: 18, color: '#fcfaf4', alpha: 0.94, blend: 'source-over' });
        api.inkStroke(3, '淡墨勾勒白羽阴影弧', [[435, 615], [405, 500], [435, 385]], { width: 3, color: '#9c9484', alpha: 0.62 });
        api.inkStroke(4, '修长墨足立水', [[485, 665], [492, 995]], { width: 3.8, color: '#211f1c' });
        api.inkStroke(4, '后足涉水', [[515, 665], [535, 995]], { width: 3.4, color: '#2b2824' });
        api.inkStroke(4, '长尖黄黑长喙', [[480, 355], [552, 348]], { width: 4.5, color: '#3b3324', profile: 'nailHead' });
        api.inkStroke(4, '头顶飘逸丝冠羽', [[460, 352], [405, 342]], { width: 2.2, color: '#d8d0c0', blend: 'source-over' });
        api.inkDot(4, '眼点', 474, 355, 2.8, 2.8, { color: '#110f0d' });
      }
    }),
    makeFlowerWork({
      id: 'xy-squirrel-pine', title: '松鼠松果', subtitle: '虚谷风韵松鼠：枯笔扫蓬松大尾 → 青绿松针 → 赭墨点松果',
      seal: '灵动生趣', seed: 2025, poem: '松林野趣', chop: '天趣',
      swatches: ['rgb(242,233,214)', 'rgb(96,62,36)', 'rgb(28,36,24)', 'rgb(42,82,48)', 'rgb(214,198,176)'],
      desc: '一只毛茸茸的红褐小松鼠伏于苍老松枝捧吃松果，背后蓬松大尾以干枯飞白刷扫，活灵活现。',
      draw(api) {
        stemBranch(api, 1, '古松横斜干', [[60, 485], [345, 535], [685, 495], [890, 565]], 26, '#2e251c', 0.48);
        [[220, 465], [565, 465], [765, 515]].forEach(([px, py]) => {
          xieyiLeafSpray(api, 2, px, py, 9, -1.5, 0.24, 98, 4.5, '#1d4d2c', 0.85, '松针簇');
        });
        api.inkBlob(3, '松果鳞塔', 345, 585, 22, 32, 0.2, { color: '#784e2b', rimColor: '#3d2412', alpha: 0.88, count: 14 });
        // Fluffy squirrel crouching at (520, 480)
        api.inkBlob(3, '褐红毛茸茸松鼠身', 525, 465, 38, 28, -0.3, { color: '#8a522c', rimColor: '#482814', alpha: 0.90, count: 16 });
        api.inkBlob(3, '松鼠圆头小耳', 485, 435, 22, 20, 0, { color: '#7d4826', alpha: 0.90, count: 10 });
        api.inkStroke(4, '枯笔飞白蓬松大尾高翘', [[555, 472], [625, 395], [615, 295], [545, 265]], {
          width: 44, color: '#6b3b1e', colorEnd: '#2e1a0e', alpha: 0.86, dry: 0.56, bristles: 14, profile: 'taper'
        });
        api.inkDot(4, '机灵黑眼', 475, 430, 3.2, 3.2, { color: '#0d0b0a' });
      }
    })
  ];

  window.Code2PaintCatalog.addPack(WORKS);
})();
