(function () {
  'use strict';

  const LA = [
    { id: 1, name: '一 · 水墨波纹岸草' },
    { id: 2, name: '二 · 没骨定形甲壳' },
    { id: 3, name: '三 · 展肢摆尾灵动' },
    { id: 4, name: '四 · 焦墨点睛落款' }
  ];

  function makeAquatic(spec) {
    return {
      id: spec.id,
      title: spec.title,
      subtitle: spec.subtitle,
      group: '国画·水族',
      category: '写意水族',
      seal: spec.seal,
      mode: 'ink',
      theme: 'xuan',
      width: spec.w || 1000,
      height: spec.h || 900,
      seed: spec.seed,
      swatches: spec.swatches,
      desc: spec.desc,
      layers: LA,
      buildStrokes(api) {
        spec.draw(api);
        api.inscription(4, `题画：${spec.poem}`, spec.ix || 120, 145, spec.poem, { size: 32, stepY: 42 });
        api.seal(4, `朱印：${spec.chop}`, spec.ix || 120, 145 + spec.poem.length * 44 + 26, spec.chop, { size: 40 });
      }
    };
  }

  const WORKS = [
    makeAquatic({
      id: 'aq-crab', title: '齐派墨蟹', subtitle: '三笔写蟹壳：中间横抹、左右斜护 → 五对健步蟹足 → 强健双钳横行',
      seal: '横行自在', seed: 3001, poem: '无肠公子', chop: '蟹趣',
      swatches: ['rgb(242,233,214)', 'rgb(28,26,23)', 'rgb(74,69,62)', 'rgb(138,132,122)', 'rgb(157,45,34)'],
      desc: '两只水墨活蟹横爬浅滩芦根旁，蟹壳墨色淋漓、节足刚健曲折，深得齐白石“横行”精神。',
      draw(api) {
        api.inkStroke(1, '水际枯苇两三丝', [[680, 760], [720, 420], [785, 220]], { width: 5, color: '#6b655c', alpha: 0.45 });
        api.inkStroke(1, '水边微波', [[180, 780], [490, 795], [820, 775]], { width: 10, color: '#9c968b', alpha: 0.22, bleed: 0.5 });
        [[465, 425, 1.15], [615, 625, 0.92]].forEach(([cx, cy, sc], idx) => {
          api.inkBlob(2, `墨蟹背壳润写 ${idx + 1}`, cx, cy, 48 * sc, 36 * sc, -0.2, { color: '#26231f', rimColor: '#666058', alpha: 0.88, count: 16 });
          [-1, 1].forEach(side => {
            for (let leg = 0; leg < 4; leg++) {
              const ly = cy + (leg - 1.5) * 16 * sc;
              api.inkStroke(3, '曲折蟹足', [[cx + side * 38 * sc, ly], [cx + side * 85 * sc, ly + 12 * sc], [cx + side * 110 * sc, ly + 36 * sc]], {
                width: 4.5 * sc, color: '#1b1815', profile: 'nailHead'
              });
            }
            api.inkStroke(3, '强壮大鳌臂', [[cx + side * 24 * sc, cy - 26 * sc], [cx + side * 52 * sc, cy - 68 * sc], [cx + side * 22 * sc, cy - 92 * sc]], {
              width: 11 * sc, color: '#171513', profile: 'taper'
            });
          });
          api.inkDot(4, '点蟹双目', cx - 14 * sc, cy - 34 * sc, 3.5 * sc, 3.5 * sc, { color: '#0d0b0a' });
          api.inkDot(4, '点蟹双目', cx + 14 * sc, cy - 34 * sc, 3.5 * sc, 3.5 * sc, { color: '#0d0b0a' });
        });
      }
    }),
    makeAquatic({
      id: 'aq-mandarin-fish', title: '桃花流水鳜鱼肥', subtitle: '春日写意小景：胭脂点桃花漂水 → 侧锋点写肥胖鳜鱼斑纹',
      seal: '三月春水', seed: 3002, poem: '桃花鳜肥', chop: '春水',
      swatches: ['rgb(242,233,214)', 'rgb(228,112,134)', 'rgb(112,118,86)', 'rgb(36,34,28)', 'rgb(184,124,62)'],
      desc: '岸边春桃点点瓣落春溪，两条圆润肥美的淡墨苔绿鳜鱼游弋其间，重现张志和诗意境界。',
      draw(api) {
        api.inkStroke(1, '上斜桃花春枝', [[720, 40], [540, 145], [380, 210]], { width: 12, color: '#3b3025', dry: 0.35 });
        [[565, 130], [485, 175], [415, 205], [645, 95]].forEach(([tx, ty]) => {
          api.inkBlob(2, '粉红桃花点', tx, ty, 18, 16, 0, { color: '#e67892', rimColor: '#b83254', alpha: 0.82, count: 9 });
        });
        [[435, 520, 1.15], [645, 655, 0.92]].forEach(([fx, fy, sc]) => {
          api.inkBlob(2, '肥美鳜鱼身', fx, fy, 92 * sc, 42 * sc, -0.15, { color: '#7a7e5c', rimColor: '#3b3c2d', alpha: 0.84, count: 16 });
          api.inkStroke(3, '阔扇鱼尾与背鳍', [[fx - 85 * sc, fy + 12 * sc], [fx - 145 * sc, fy - 12 * sc]], { width: 32 * sc, color: '#454736', profile: 'bambooLeaf', dry: 0.25 });
          for (let s = 0; s < 5; s++) api.inkDot(3, '鳜鱼虎皮斑点', fx - 40 * sc + s * 22 * sc, fy - 4 * sc, 8 * sc, 6 * sc, { color: '#1b1a14' });
          api.inkDot(4, '点睛', fx + 65 * sc, fy - 18 * sc, 4 * sc, 4 * sc, { color: '#0d0b0a' });
        });
      }
    }),
    makeAquatic({
      id: 'aq-catfish', title: '枯荷墨鲶', subtitle: '吴昌硕式厚墨游鲶：一笔浓湿写硕头滑身 → 两条长须垂水',
      seal: '大气盘旋', seed: 3003, poem: '悠然深潭', chop: '大自在',
      swatches: ['rgb(242,233,214)', 'rgb(20,19,17)', 'rgb(64,60,54)', 'rgb(142,136,126)', 'rgb(157,45,34)'],
      desc: '两条硕大饱满乌墨鲶鱼滑翔于池水深处，体态厚润墨光流转，长须自然蜿蜒。',
      draw(api) {
        api.inkStroke(1, '水际淡墨浮叶丝', [[160, 740], [450, 765], [820, 735]], { width: 16, color: '#8f8a80', alpha: 0.24, bleed: 0.5 });
        [[445, 425, 1.2], [585, 610, 0.95]].forEach(([cx, cy, sc]) => {
          api.inkBlob(2, '宽钝大墨鲶头', cx + 45 * sc, cy - 12 * sc, 36 * sc, 28 * sc, -0.2, { color: '#191816', alpha: 0.92, count: 14 });
          api.inkStroke(2, '滑腻墨身一笔拖尾', [[cx + 40 * sc, cy - 10 * sc], [cx - 35 * sc, cy + 12 * sc], [cx - 135 * sc, cy + 52 * sc]], {
            width: 38 * sc, color: '#24221f', colorEnd: '#6b655d', alpha: 0.88, profile: 'taper', bleed: 0.35
          });
          api.inkStroke(3, '长鲶双须', [[cx + 72 * sc, cy - 16 * sc], [cx + 128 * sc, cy - 42 * sc]], { width: 2.5, color: '#1c1a17' });
          api.inkStroke(3, '长鲶下须', [[cx + 72 * sc, cy - 6 * sc], [cx + 132 * sc, cy + 12 * sc]], { width: 2.5, color: '#1c1a17' });
          api.inkDot(4, '点睛', cx + 52 * sc, cy - 22 * sc, 3.8 * sc, 3.8 * sc, { color: '#0a0908' });
        });
      }
    }),
    makeAquatic({
      id: 'aq-goldfish', title: '金鱼戏藻', subtitle: '吴作人写意金鱼：朱红饱点团头身躯 → 薄如蝉翼大摆尾 → 水藻衬影',
      seal: '游鱼得乐', seed: 3004, poem: '清池戏藻', chop: '清乐',
      swatches: ['rgb(242,233,214)', 'rgb(218,54,28)', 'rgb(242,148,54)', 'rgb(64,84,56)', 'rgb(24,20,17)'],
      desc: '三尾艳红、赤金大尾金鱼轻舞于碧绿细藻丛中，凤尾舒展如轻纱，娇憨喜庆。',
      draw(api) {
        [[720, 780, 680, 480, 745, 220], [660, 790, 610, 520, 650, 290]].forEach(([x1, y1, x2, y2, x3, y3]) => {
          api.inkStroke(1, '水下柔藻丝', [[x1, y1], [x2, y2], [x3, y3]], { width: 10, color: '#5c724c', alpha: 0.44, bleed: 0.35 });
        });
        [[365, 420, '#d82e1a', '#e88238'], [535, 560, '#e36426', '#f2aa48'], [345, 650, '#292522', '#7a7268']].forEach(([gx, gy, c1, c2], idx) => {
          api.inkBlob(2, '胖圆金鱼头身', gx, gy, 32, 26, -0.3, { color: c1, rimColor: c2, alpha: 0.90, count: 12 });
          api.inkStroke(3, '轻纱舒展大凤尾', [[gx - 22, gy + 12], [gx - 85, gy + 28], [gx - 125, gy - 12]], {
            width: 34, color: c2, alpha: 0.56, profile: 'bambooLeaf', bleed: 0.25
          });
          api.inkStroke(3, '薄翼下纱尾', [[gx - 22, gy + 14], [gx - 78, gy + 58], [gx - 115, gy + 72]], {
            width: 30, color: c1, alpha: 0.52, profile: 'bambooLeaf', bleed: 0.25
          });
          api.inkDot(4, '凸出黑泡眼', gx + 24, gy - 16, 4.8, 4.8, { color: '#0d0b0a' });
        });
      }
    }),
    makeAquatic({
      id: 'aq-lotus-frog', title: '荷影墨蛙', subtitle: '草虫小品：泼墨半叶残荷 → 淡青背脊肥墨蛙 → 水际圈波',
      seal: '池塘夏趣', seed: 3005, poem: '荷畔蛙鸣', chop: '夏趣',
      swatches: ['rgb(242,233,214)', 'rgb(42,58,38)', 'rgb(74,108,52)', 'rgb(28,30,24)', 'rgb(168,162,150)'],
      desc: '墨绿青蛙伏于浓墨荷叶边缘凝望前方飞虫，后腿蓄势微屈，幽默生趣盎然。',
      draw(api) {
        api.inkBlob(1, '泼墨浓润大荷叶', 445, 585, 225, 135, -0.1, { color: '#2b3825', rimColor: '#4e6342', alpha: 0.78, count: 24, bleed: 0.4 });
        api.inkStroke(1, '荷梗斜托', [[445, 620], [455, 860]], { width: 12, color: '#24291e' });
        // Cute ink frog perched on leaf edge at (520, 485)
        api.inkBlob(2, '青蛙圆润绿墨背躯', 515, 492, 34, 24, -0.35, { color: '#4c6e32', rimColor: '#253819', alpha: 0.90, count: 14, blend: 'source-over' });
        api.inkStroke(3, '屈起强壮蛙后腿', [[535, 505], [568, 520], [545, 540]], { width: 12, color: '#3b5626' });
        api.inkStroke(3, '支地前爪', [[495, 495], [472, 515]], { width: 6.5, color: '#3b5626' });
        api.inkDot(4, '青蛙凸鼓大眼', 498, 468, 6.2, 6.2, { color: '#1b1d17' });
        api.inkDot(4, '青蛙白瞳高光', 496, 466, 2.2, 2.2, { color: '#fcfaf3', blend: 'source-over' });
      }
    }),
    makeAquatic({
      id: 'aq-ink-turtle', title: '水墨神龟', subtitle: '减笔写意水族：大笔焦墨涂龟背 → 四足划水 → 引颈探望水草',
      seal: '龟鹤长春', seed: 3006, poem: '千年龟龄', chop: '长乐',
      swatches: ['rgb(242,233,214)', 'rgb(28,26,22)', 'rgb(64,58,50)', 'rgb(112,106,96)', 'rgb(96,112,82)'],
      desc: '两只笨拙可爱的水墨游龟划水穿梭浅池水藻之间，以大块焦墨写背甲、浓淡相渗极见笔力。',
      draw(api) {
        api.inkStroke(1, '水波浮藻丝', [[180, 290], [340, 260], [520, 290]], { width: 8, color: '#828876', alpha: 0.35, bleed: 0.45 });
        [[465, 465, 1.1], [665, 625, 0.85]].forEach(([tx, ty, sc]) => {
          api.inkBlob(2, '重墨写椭圆形龟甲', tx, ty, 64 * sc, 48 * sc, -0.45, { color: '#24211c', rimColor: '#5c554a', alpha: 0.90, count: 18 });
          api.inkStroke(3, '前探龟颈与圆首', [[tx + 46 * sc, ty - 28 * sc], [tx + 88 * sc, ty - 54 * sc]], { width: 16 * sc, color: '#342f28' });
          [[-36, 42], [28, 46], [-42, -32], [32, -36]].forEach(([dx, dy]) => {
            api.inkStroke(3, '划水四足', [[tx + dx * sc, ty + dy * sc], [tx + (dx + 15) * sc, ty + (dy + 18) * sc]], { width: 14 * sc, color: '#2e2923', profile: 'taper' });
          });
          api.inkStroke(3, '细短龟尾', [[tx - 58 * sc, ty + 32 * sc], [tx - 92 * sc, ty + 52 * sc]], { width: 5 * sc, color: '#24201a' });
          api.inkDot(4, '点龟小目', tx + 88 * sc, ty - 58 * sc, 2.8 * sc, 2.8 * sc, { color: '#0d0b0a' });
        });
      }
    }),
    makeAquatic({
      id: 'aq-tadpoles', title: '蛙声十里出山泉', subtitle: '致敬齐白石传世构图：乱石急泉 → 顺流游跃水墨蝌蚪 → 听声寻音',
      seal: '白石意境', seed: 3007, poem: '十里蛙声', chop: '山泉',
      swatches: ['rgb(242,233,214)', 'rgb(28,26,24)', 'rgb(74,69,62)', 'rgb(142,136,126)', 'rgb(157,45,34)'],
      desc: '“不见青蛙见蝌蚪”，峭壁之间急流飞出，六只乌黑灵动小蝌蚪顺清泉游出，余音缭绕山谷之外。',
      draw(api) {
        api.inkWash(1, '左陡崖乱石墨墙', [[0, 0], [320, 0], [285, 420], [180, 860], [0, 880]], { color: '#3a3630', alpha: 0.65 });
        api.inkWash(1, '右峭壁夹岸护泉', [[665, 0], [1000, 0], [1000, 880], [795, 860], [725, 450]], { color: '#454038', alpha: 0.60 });
        for (let k = 0; k < 5; k++) {
          api.inkStroke(1, '飞白山涧急流曲线', [[460 + k * 25, 40], [435 + k * 24, 380], [395 + k * 35, 780]], {
            width: 12, color: '#8a867e', alpha: 0.28, dry: 0.45
          });
        }
        [[465, 445], [525, 515], [435, 585], [505, 665], [475, 745], [545, 785]].forEach(([kx, ky], i) => {
          api.inkDot(2, `圆头墨蝌蚪 ${i + 1}`, kx, ky, 10, 8, { color: '#141210', alpha: 0.96 });
          api.inkStroke(3, '摇摆游尾', [[kx, ky], [kx + (i % 2 ? -12 : 14), ky - 22], [kx + (i % 2 ? 10 : -8), ky - 42]], {
            width: 3.8, color: '#24211c', profile: 'taper'
          });
        });
      }
    }),
    makeAquatic({
      id: 'aq-squid', title: '沧海游鱿', subtitle: '大海写意水墨：淡墨定箭形身躯 → 两片三角翼尾 → 十条飘逸触须',
      seal: '海错意趣', seed: 3008, poem: '碧海随波', chop: '海风',
      swatches: ['rgb(242,233,214)', 'rgb(64,58,64)', 'rgb(128,118,124)', 'rgb(28,24,26)', 'rgb(176,104,96)'],
      desc: '两只半透明淡墨微带紫赭晕的水墨乌贼斜游水中，修长柔韧的触手顺流摆动如舞带。',
      draw(api) {
        api.inkStroke(1, '深海微浪弧', [[140, 740], [480, 720], [820, 755]], { width: 12, color: '#94989c', alpha: 0.24, bleed: 0.5 });
        [[465, 445, 1.15], [665, 615, 0.85]].forEach(([qx, qy, sc]) => {
          api.inkStroke(2, '箭头状墨鱿胴身', [[qx + 75 * sc, qy - 75 * sc], [qx, qy], [qx - 45 * sc, qy + 45 * sc]], {
            width: 38 * sc, color: '#6b5e68', colorEnd: '#b8a8ac', alpha: 0.78, profile: 'bambooLeaf', bleed: 0.35
          });
          for (let f = -2; f <= 2; f++) {
            api.inkStroke(3, '随波摇曳鱿须', [[qx - 42 * sc, qy + 42 * sc], [qx - (105 + f * 12) * sc, qy + (95 - f * 8) * sc], [qx - (165 + f * 15) * sc, qy + (135 + f * 12) * sc]], {
              width: 4 * sc, color: '#3b3238', alpha: 0.78, profile: 'taper'
            });
          }
          api.inkDot(4, '乌墨圆瞳', qx - 32 * sc, qy + 26 * sc, 5 * sc, 5 * sc, { color: '#141214' });
        });
      }
    }),
    makeAquatic({
      id: 'aq-reed-geese', title: '芦洲落雁', subtitle: '秋水名篇：寒江水波 → 远近三只栖鸣秋雁 → 风中瑟瑟芦花',
      seal: '潇湘秋意', seed: 3009, poem: '平沙落雁', chop: '秋水',
      swatches: ['rgb(242,233,214)', 'rgb(64,58,52)', 'rgb(148,138,124)', 'rgb(28,24,20)', 'rgb(212,188,148)'],
      desc: '秋风芦苇丛畔，三只淡赭灰墨肥雁或低首觅食或引颈遥望天际同伴，营造潇湘古意。',
      draw(api) {
        api.inkWash(1, '平沙淡渚底染', [[120, 740], [520, 685], [885, 735], [890, 845], [120, 845]], { color: '#8a8274', alpha: 0.42 });
        [[780, 680, 825, 340], [830, 700, 870, 390]].forEach(([x1, y1, x2, y2]) => {
          api.inkStroke(1, '寒芦高竿', [[x1, y1], [x2, y2]], { width: 5, color: '#453e35' });
          api.inkBlob(2, '蓬松雪白芦花穗', x2, y2 - 18, 22, 12, -0.4, { color: '#eae2d0', rimColor: '#9c9282', alpha: 0.78, count: 10 });
        });
        [[365, 650, 1], [545, 665, 1], [675, 515, 0.72]].forEach(([gx, gy, sc], idx) => {
          api.inkBlob(2, `栖雁灰羽胖身 ${idx + 1}`, gx, gy, 52 * sc, 30 * sc, -0.1, { color: '#5c554c', rimColor: '#29241f', alpha: 0.88, count: 16 });
          api.inkStroke(3, '引颈翘首', [[gx + 36 * sc, gy - 10 * sc], [gx + 52 * sc, gy - 62 * sc], [gx + 68 * sc, gy - 72 * sc]], { width: 12 * sc, color: '#3b352e' });
          api.inkDot(4, '点睛扁喙', gx + 70 * sc, gy - 72 * sc, 4 * sc, 3 * sc, { color: '#1b1713' });
        });
      }
    }),
    makeAquatic({
      id: 'aq-leaping-carp', title: '鱼跃龙门', subtitle: '吉祥激昂之作：破浪浪花留白 → 凌空飞跃朱金双鲤 → 水花飞溅',
      seal: '青云直上', seed: 3010, poem: '跃浪争春', chop: '龙门',
      swatches: ['rgb(242,233,214)', 'rgb(212,48,26)', 'rgb(236,158,48)', 'rgb(64,86,98)', 'rgb(252,248,240)'],
      desc: '惊涛翻涌水柱之间，两条雄健红金鲤鱼凌空跃起冲向天际，浪沫飞溅充满昂扬精神。',
      draw(api) {
        api.inkStroke(1, '汹涌激流卷浪弧一', [[120, 745], [380, 625], [645, 685], [885, 750]], { width: 42, color: '#455966', alpha: 0.56, dry: 0.35 });
        api.inkStroke(1, '汹涌激流卷浪弧二', [[180, 795], [465, 705], [765, 785]], { width: 32, color: '#2b3b48', alpha: 0.62, dry: 0.35 });
        [[435, 365, '#c82b18', '#e68834', -1.2], [585, 445, '#d95826', '#f2b84a', -1.05]].forEach(([kx, ky, c1, c2, ang], i) => {
          api.inkStroke(2, `飞跃锦鲤劲躯 ${i + 1}`, [[kx, ky], [kx - 28, ky + 75], [kx - 15, ky + 155]], {
            width: 44, color: c1, colorEnd: c2, alpha: 0.90, profile: 'taper'
          });
          api.inkStroke(3, '健尾甩水', [[kx - 15, ky + 150], [kx + 18, ky + 205]], { width: 32, color: c2, alpha: 0.78, profile: 'bambooLeaf', dry: 0.3 });
          api.inkDot(4, '鲤鱼明眼', kx - 2, ky - 8, 4.5, 4.5, { color: '#110d0b' });
        });
        for (let i = 0; i < 14; i++) api.inkDot(4, '飞溅白水沫', 340 + (i * 47) % 340, 560 + (i * 31) % 160, 6, 4, { color: '#fcf8ef', blend: 'source-over' });
      }
    })
  ];

  window.Code2PaintCatalog.addPack(WORKS);
})();
