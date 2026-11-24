(function () {
  'use strict';

  const LF = [
    { id: 1, name: '一 · 景物点位定格' },
    { id: 2, name: '二 · 简笔开脸定神' },
    { id: 3, name: '三 · 狂草钉头勾衣' },
    { id: 4, name: '四 · 器物点苔落款' }
  ];

  function makeFigure(spec) {
    return {
      id: spec.id,
      title: spec.title,
      subtitle: spec.subtitle,
      group: '国画·人物敦煌',
      category: '写意人物',
      seal: spec.seal,
      mode: 'ink',
      theme: 'xuan',
      width: spec.w || 920,
      height: spec.h || 1180,
      seed: spec.seed,
      swatches: spec.swatches,
      desc: spec.desc,
      layers: LF,
      buildStrokes(api) {
        spec.draw(api);
        api.inscription(4, `题画：${spec.poem}`, spec.ix || 135, 145, spec.poem, { size: 32, stepY: 42 });
        api.seal(4, `朱印：${spec.chop}`, spec.ix || 135, 145 + spec.poem.length * 44 + 26, spec.chop, { size: 40 });
      }
    };
  }

  // Reusable calligraphic seated/standing figure torso + robe + head builder
  function drawSageHead(api, x, y, lookDir = -1, hat = false, beard = true, col = '#cfa882', name = '高士') {
    if (hat) {
      api.inkStroke(2, `${name}·巾帽斗笠`, [[x - 42, y - 22], [x, y - 42], [x + 42, y - 20]], { width: 18, color: '#241f1a', dry: 0.35 });
    } else {
      api.inkBlob(2, `${name}·发髻`, x - lookDir * 8, y - 34, 18, 14, 0, { color: '#1b1815', alpha: 0.92, count: 8 });
    }
    api.inkBlob(2, `${name}·淡赭面色`, x, y, 22, 26, 0, { color: col, alpha: 0.44, count: 8 });
    api.inkStroke(2, `${name}·侧脸颊轮廓`, [[x + lookDir * 20, y - 18], [x + lookDir * 25, y], [x + lookDir * 16, y + 20], [x - lookDir * 8, y + 24]], {
      width: 2.8, color: '#1d1814', profile: 'taper'
    });
    api.inkStroke(2, `${name}·眉眼神情`, [[x + lookDir * 8, y - 6], [x + lookDir * 20, y - 7]], { width: 2.6, color: '#14110e' });
    if (beard) {
      api.inkStroke(2, `${name}·清疏长须`, [[x + lookDir * 16, y + 22], [x + lookDir * 22, y + 58]], { width: 3.5, color: '#3b352e', dry: 0.35, profile: 'taper' });
    }
  }

  function drawRobeFigure(api, x, y, robeColor, beltColor, lookDir = -1, name = '高士') {
    api.inkStroke(3, `${name}·衣袍阔笔泼色底韵`, [[x - 8, y + 4], [x - 28, y + 108], [x - 36, y + 218]], {
      width: 68, color: robeColor, alpha: 0.42, bleed: 0.4, profile: 'taper'
    });
    api.inkStroke(3, `${name}·右侧长袍大笔挥洒`, [[x + 12, y + 6], [x + 34, y + 115], [x + 38, y + 220]], {
      width: 66, color: robeColor, alpha: 0.38, bleed: 0.4, profile: 'taper'
    });
    api.inkStroke(3, `${name}·交领斜襟一笔定势`, [[x - 28, y - 6], [x + lookDir * 12, y + 52], [x + 26, y - 6]], {
      width: 6.5, color: '#1b1714', profile: 'taper'
    });
    api.inkStroke(3, `${name}·左肩垂袖钉头鼠尾`, [[x - 30, y - 4], [x - 76, y + 85], [x - 58, y + 195]], {
      width: 12, color: '#181512', profile: 'nailHead', dry: 0.28
    });
    api.inkStroke(3, `${name}·右肩行草长袖`, [[x + 30, y - 4], [x + 80, y + 95], [x + 64, y + 212]], {
      width: 12, color: '#181512', profile: 'nailHead', dry: 0.28
    });
    api.inkStroke(3, `${name}·下摆折笔飞白`, [[x - 72, y + 198], [x - 10, y + 224], [x + 76, y + 206]], {
      width: 9.5, color: '#1b1814', profile: 'taper', dry: 0.32
    });
    if (beltColor) {
      api.inkStroke(3, `${name}·腰带`, [[x - 42, y + 88], [x + 42, y + 92]], { width: 7.5, color: beltColor, alpha: 0.85 });
    }
  }

  function drawPineBough(api, x1, y1, x2, y2, clusters) {
    api.inkStroke(1, '苍松虬曲主干', [[x1, y1], [(x1 + x2) * 0.52, (y1 + y2) * 0.5 + 24], [x2, y2]], { width: 22, color: '#2b221a', dry: 0.44 });
    clusters.forEach(([cx, cy, r], ci) => {
      for (let i = 0; i < 11; i++) {
        const ang = -Math.PI * 0.92 + (i / 10) * Math.PI * 0.84;
        api.inkStroke(1, `古松散锋针叶束 ${ci + 1}`, [
          [cx, cy + 8],
          [cx + Math.cos(ang) * r, cy + Math.sin(ang) * r * 0.68]
        ], { width: 4.8, color: i % 3 === 0 ? '#1b3d28' : '#2c593c', alpha: 0.86, profile: 'taper' });
      }
    });
  }

  const WORKS = [
    makeFigure({
      id: 'fig-bodhidharma', title: '达摩面壁', subtitle: '禅宗减笔人物：粗犷朱砂红袍 → 浓髯浓眉神态 → 一苇石壁静坐',
      seal: '禅宗祖师', seed: 5001, poem: '一苇渡江', chop: '禅心',
      swatches: ['rgb(242,233,214)', 'rgb(192,48,34)', 'rgb(32,28,24)', 'rgb(112,104,94)', 'rgb(157,45,34)'],
      desc: '朱红阔笔写意僧袍裹身，浓眉虬须达摩面壁静参禅机，笔简意赅震撼心灵。',
      draw(api) {
        api.inkStroke(1, '寒崖石壁焦墨皴擦', [[635, 130], [665, 420], [648, 720], [660, 960]], { width: 12, color: '#453e37', dry: 0.48 });
        api.inkStroke(1, '崖腹渴笔淡墨晕染', [[715, 160], [728, 540], [718, 940]], { width: 135, color: '#7a7368', colorEnd: '#eae2d0', alpha: 0.28, bleed: 0.7 });
        drawSageHead(api, 445, 415, 1, false, true, '#c29472', '达摩祖师');
        api.inkStroke(2, '达摩浓黑连鬓络腮胡', [[430, 425], [462, 465], [475, 435]], { width: 12, color: '#1b1815', dry: 0.4 });
        drawRobeFigure(api, 445, 495, '#be2e22', '#7a1914', 1, '红袍达摩');
        api.inkStroke(4, '枯笔席坐蒲团', [[325, 745], [455, 775], [585, 745]], { width: 22, color: '#5c4d3c', dry: 0.5 });
      }
    }),
    makeFigure({
      id: 'fig-zhongkui', title: '醉酒钟馗', subtitle: '民间祈福门神写意：朱红乌纱袍 → 虬须怒目 → 手持酒坛折扇',
      seal: '驱邪赐福', seed: 5002, poem: '正气清风', chop: '天师',
      swatches: ['rgb(242,233,214)', 'rgb(206,36,28)', 'rgb(24,20,18)', 'rgb(218,162,48)', 'rgb(157,45,34)'],
      desc: '大红官袍阔笔飞舞，乌纱帽斜戴，钟馗手举陶酒壶醉态可掬又不失威武正气。',
      draw(api) {
        api.inkStroke(2, '钟馗乌纱双翅官帽', [[375, 365], [460, 330], [555, 365]], { width: 22, color: '#171514' });
        api.inkStroke(2, '帽翅横展', [[330, 358], [595, 358]], { width: 7, color: '#1b1815' });
        drawSageHead(api, 460, 415, -1, false, true, '#bd8c68', '钟馗');
        drawRobeFigure(api, 465, 495, '#c4261c', '#24201c', -1, '大红官袍');
        api.inkBlob(4, '手执酒坛醉态', 355, 575, 28, 32, -0.2, { color: '#6b4c32', rimColor: '#362417', alpha: 0.88 });
      }
    }),
    makeFigure({
      id: 'fig-guqin', title: '松下抚琴', subtitle: '文人雅集高士图：苍松荫蔽 → 盘坐抚古琴高士 → 山水留白琴音',
      seal: '高山流水', seed: 5003, poem: '松风调琴', chop: '知音',
      swatches: ['rgb(242,233,214)', 'rgb(64,88,68)', 'rgb(34,30,26)', 'rgb(142,118,86)', 'rgb(157,45,34)'],
      desc: '翠绿古松垂荫石台，一位雅士盘坐石上轻拨七弦古琴，仿佛可闻松涛与高山流水声。',
      draw(api) {
        drawPineBough(api, 40, 260, 565, 240, [[215, 225, 72], [355, 200, 86], [495, 215, 76]]);
        drawSageHead(api, 465, 575, -1, true, true, '#cfa882', '抚琴高士');
        drawRobeFigure(api, 475, 645, '#78968a', '#3b4a42', -1, '青衫雅士');
        api.inkStroke(4, '石台七弦古琴', [[345, 765], [485, 760], [605, 768]], { width: 12, color: '#4a3221' });
        api.inkStroke(4, '磐石雅坐石面勾皴', [[285, 905], [355, 818], [625, 825], [665, 912]], { width: 11, color: '#4c463d', dry: 0.42 });
      }
    }),
    makeFigure({
      id: 'fig-weiqi', title: '松阴对弈', subtitle: '双高士弈棋图：对坐手谈二老 → 棋盘黑白子点睛 → 青松顽石',
      seal: '手谈清趣', seed: 5004, poem: '忘忧清乐', chop: '对弈',
      swatches: ['rgb(242,233,214)', 'rgb(74,98,86)', 'rgb(168,128,88)', 'rgb(32,28,24)', 'rgb(252,248,240)'],
      desc: '两位长须高士隔棋盘相对盘坐，左手落子右手捋须，演绎中国文人千年雅趣。',
      draw(api) {
        drawPineBough(api, 60, 220, 715, 245, [[255, 210, 76], [445, 195, 92], [635, 218, 82]]);
        drawSageHead(api, 315, 585, 1, false, true, '#cfa882', '左弈者');
        drawRobeFigure(api, 315, 655, '#6d8c82', '#364842', 1, '青袍老者');
        drawSageHead(api, 625, 595, -1, true, true, '#cfa882', '右弈者');
        drawRobeFigure(api, 625, 665, '#b88c5c', '#5e442b', -1, '赭袍高士');
        api.inkStroke(4, '木方围棋盘', [[415, 765], [525, 765]], { width: 16, color: '#9c7848' });
        [[445, 760, '#171513'], [475, 760, '#fcfaf3'], [495, 762, '#171513']].forEach(([px, py, c]) => api.inkDot(4, '黑白棋子', px, py, 3.6, 2.8, { color: c, blend: 'source-over' }));
      }
    }),
    makeFigure({
      id: 'fig-shepherd-buffalo', title: '牧童归牛图', subtitle: '李可染水墨水牛：大笔横扫漆黑水牛 → 牧童横骑吹笛 → 柳丝飘风',
      seal: '田园牧歌', seed: 5005, poem: '横笛归晚', chop: '牧乐',
      swatches: ['rgb(242,233,214)', 'rgb(26,25,24)', 'rgb(74,70,64)', 'rgb(112,138,88)', 'rgb(157,45,34)'],
      desc: '斗笔湿墨饱满铺出厚重敦厚水牛身躯，小牧童稳坐牛背横吹竹笛，田园春意扑面。',
      draw(api) {
        api.inkStroke(1, '右上风柳细条', [[820, 40], [740, 260], [675, 420]], { width: 5, color: '#5c6b48', alpha: 0.55 });
        // Big wet ink Water Buffalo!
        api.inkBlob(2, '敦厚黑墨大水牛躯', 485, 735, 138, 72, -0.08, { color: '#242220', rimColor: '#4e4944', alpha: 0.92, count: 24 });
        api.inkBlob(2, '低首硕牛头', 335, 745, 52, 42, -0.35, { color: '#1b1918', alpha: 0.94, count: 12 });
        api.inkStroke(3, '月牙大水牛角双弯', [[315, 725], [275, 675], [325, 645]], { width: 10, color: '#141210', profile: 'taper' });
        [375, 435, 535, 595].forEach(lx => api.inkStroke(3, '健壮牛腿', [[lx, 795], [lx - 8, 920]], { width: 16, color: '#1e1c1a' }));
        // Cute shepherd boy sitting atop buffalo back playing bamboo flute!
        drawSageHead(api, 495, 555, -1, true, false, '#cfa882', '小牧童');
        api.inkBlob(3, '牧童青布小衣', 505, 625, 36, 44, 0, { color: '#456482', alpha: 0.88, count: 10 });
        api.inkStroke(4, '牧童手握横吹青竹笛', [[415, 565], [515, 560]], { width: 4.5, color: '#2d4a26' });
      }
    }),
    makeFigure({
      id: 'fig-li-bai', title: '太白邀月图', subtitle: '傅抱石狂放人物：长袍飘带狂扫 → 仰首举杯邀明月 → 云月相照',
      seal: '诗仙醉意', seed: 5006, poem: '举杯邀月', chop: '太白',
      swatches: ['rgb(242,233,214)', 'rgb(28,25,22)', 'rgb(248,242,214)', 'rgb(74,84,104)', 'rgb(157,45,34)'],
      desc: '诗人李白仰天大笑举爵敬月，阔袖袍带随风狂飘，天畔圆月悄然悬照，狂放浪漫。',
      draw(api) {
        api.inkWash(1, '暮蓝夜天轻笼', [[0, 0], [920, 0], [920, 420], [0, 420]], { color: '#4c5b70', alpha: 0.34 });
        api.inkDot(1, '皎洁冰轮明月', 725, 195, 38, 38, { color: '#fcf8eb', alpha: 0.94, blend: 'source-over' });
        drawSageHead(api, 445, 445, 1, false, true, '#cfa882', '诗仙李白');
        drawRobeFigure(api, 445, 520, '#dbd4c6', '#3b342e', 1, '白袍诗仙');
        api.inkStroke(4, '高举金酒杯敬月手臂', [[475, 535], [565, 455], [615, 395]], { width: 14, color: '#2b251f' });
        api.inkDot(4, '金爵酒杯', 620, 388, 9, 6, { color: '#d4a644', blend: 'source-over' });
      }
    }),
    makeFigure({
      id: 'fig-plum-snow-walk', title: '踏雪寻梅', subtitle: '冬日高士行吟图：白雪苍山 → 拄杖冒雪高士红袍 → 路畔寒梅几朵',
      seal: '风雅冬行', seed: 5007, poem: '踏雪寻梅', chop: '寻芳',
      swatches: ['rgb(242,233,214)', 'rgb(184,48,44)', 'rgb(74,86,98)', 'rgb(32,28,24)', 'rgb(252,248,240)'],
      desc: '严寒山径之上，红氅高士拄着竹杖踏雪前行探寻一株绽放红梅，背影坚定清雅。',
      draw(api) {
        api.inkWash(1, '寒天冷灰雪雾', [[0, 0], [920, 0], [920, 460], [0, 460]], { color: '#5e6d7d', alpha: 0.38 });
        api.inkStroke(1, '崖畔寒梅斜干', [[680, 720], [725, 520], [790, 385]], { width: 12, color: '#241f1a', dry: 0.4 });
        [[725, 495], [765, 425], [795, 385]].forEach(([x, y]) => api.inkDot(4, '点艳寒红梅', x, y, 10, 9, { color: '#bd2232' }));
        drawSageHead(api, 395, 565, 1, true, true, '#cfa882', '踏雪高士');
        drawRobeFigure(api, 395, 635, '#a8342e', '#1c1815', 1, '红氅冬行');
        api.inkStroke(4, '高士手中竹拐杖', [[445, 710], [495, 920]], { width: 4.5, color: '#2d241c' });
        for (let s = 0; s < 32; s++) api.inkDot(4, '雪点飘落', 40 + (s * 83) % 840, 40 + (s * 47) % 820, 2.2, 2.2, { color: '#fcfaf3', blend: 'source-over' });
      }
    }),
    makeFigure({
      id: 'fig-tao-yuanming', title: '采菊东篱下', subtitle: '田园隐士像：木篱笆藤蔓 → 抱菊高士侧影 → 黄花悠然南山',
      seal: '悠然南山', seed: 5008, poem: '采菊东篱', chop: '陶潜',
      swatches: ['rgb(242,233,214)', 'rgb(228,176,48)', 'rgb(112,92,62)', 'rgb(64,88,68)', 'rgb(32,28,24)'],
      desc: '竹木矮篱前陶渊明手捧一束刚采金黄秋菊侧立微笑，极简几笔体现“采菊东篱下”悠然境界。',
      draw(api) {
        for (let x = 580; x <= 840; x += 55) api.inkStroke(1, '田园木篱柱', [[x, 665], [x + 4, 935]], { width: 9, color: '#6b553b', dry: 0.35 });
        api.inkStroke(1, '横扎篱杆', [[555, 735], [860, 745]], { width: 7, color: '#5c4830' });
        drawSageHead(api, 415, 485, 1, true, true, '#cfa882', '陶渊明');
        drawRobeFigure(api, 415, 555, '#68826e', '#3b4a3e', 1, '田园布衣');
        [[495, 620], [520, 635], [505, 650]].forEach(([kx, ky]) => api.inkDot(4, '手中金黄秋菊', kx, ky, 12, 11, { color: '#e6b22c' }));
      }
    }),
    makeFigure({
      id: 'fig-hanshan-shide', title: '和合二仙', subtitle: '经典谐趣禅画：蓬头笑口二人并立 → 手捧荷花宝盒 → 大气狂草衣纹',
      seal: '欢喜自在', seed: 5009, poem: '和合欢喜', chop: '大喜',
      swatches: ['rgb(242,233,214)', 'rgb(198,64,48)', 'rgb(52,96,74)', 'rgb(228,178,68)', 'rgb(32,28,24)'],
      desc: '寒山与拾得两位笑容可掬的禅宗仙童并肩而立，一人持青荷一人捧金盒，象征和顺美满。',
      draw(api) {
        drawSageHead(api, 345, 485, 1, false, false, '#dfbaa0', '寒山');
        drawRobeFigure(api, 345, 555, '#c44638', '#452820', 1, '赤衣仙童');
        drawSageHead(api, 595, 495, -1, false, false, '#dfbaa0', '拾得');
        drawRobeFigure(api, 595, 565, '#4c8266', '#284536', -1, '绿袍仙童');
        api.inkStroke(4, '手中清荷长柄', [[395, 645], [465, 435]], { width: 4.5, color: '#2d3b24' });
        api.inkDot(4, '粉色笑荷', 465, 425, 16, 14, { color: '#d85c74' });
        api.inkDot(4, '金色宝盒', 525, 645, 22, 16, { color: '#e6b23c' });
      }
    }),
    makeFigure({
      id: 'fig-waterfall-sage', title: '观瀑图高士', subtitle: '青绿山水人物融合：石台倚杖高士仰首 → 前方巨瀑轰鸣落涧',
      seal: '山水人物', seed: 5010, poem: '观瀑吟秋', chop: '林泉',
      swatches: ['rgb(242,233,214)', 'rgb(42,78,64)', 'rgb(252,248,240)', 'rgb(184,126,72)', 'rgb(28,24,20)'],
      desc: '孤岩之上白衣高士倚杖昂首凝视百丈飞瀑直下碧潭，小人物衬大山水显得气象高远。',
      draw(api) {
        api.inkWash(1, '右侧万丈峭崖壁', [[540, 120], [920, 120], [920, 960], [600, 920]], { color: '#45483e', alpha: 0.56 });
        api.inkStroke(1, '天际飞瀑急泻', [[650, 150], [645, 520], [635, 860]], { width: 32, color: '#fcfaf2', alpha: 0.94, blend: 'source-over' });
        api.inkWash(1, '左崖高士立石台', [[80, 980], [165, 825], [420, 845], [445, 1020]], { color: '#5c5448', alpha: 0.58 });
        drawSageHead(api, 295, 585, 1, false, true, '#cfa882', '观瀑高士');
        drawRobeFigure(api, 295, 650, '#eae2d2', '#4a3c2e', 1, '素衣高士');
        api.inkStroke(4, '倚杖观泉长竹杖', [[345, 705], [375, 845]], { width: 4.5, color: '#2d241b' });
      }
    })
  ];

  window.Code2PaintCatalog.addPack(WORKS);
})();
