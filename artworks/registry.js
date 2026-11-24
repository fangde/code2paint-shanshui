(function () {
  'use strict';

  const DYNAMIC = [];
  const BY_ID = new Map();

  // Existing 18 standalone artworks preserved at the front of the catalog
  const LEGACY = [
    {
      id: 'shuimo-shanshui',
      url: './shuimo-shanshui.html',
      title: '写意水墨山水',
      group: '国画·山水',
      seal: '五层水墨',
      desc: '严格国画五层作画法度：清墨晕染远山、淡墨勾勒坡岸、中墨披麻皴理、浓墨写石树干、焦墨点苔飞白，左下大片留白以显江水空濛。',
      swatches: ['rgb(235, 229, 214)', 'rgb(160, 155, 145)', 'rgb(96, 92, 85)', 'rgb(44, 42, 39)', 'rgb(18, 17, 16)']
    },
    {
      id: 'qianjiang-shanshui',
      url: './qianjiang-shanshui.html',
      title: '浅绛山水（花青·赭石）',
      group: '国画·山水',
      seal: '六层浅绛',
      desc: '以五层墨骨立其形神，第六层采用正片叠底薄罩设彩：山石向阳暖面罩赭石，青朗、远峰与水际冷染花青，清润淡雅而不掩墨韵。',
      swatches: ['rgb(238, 232, 218)', 'rgb(198, 134, 82)', 'rgb(84, 114, 132)', 'rgb(62, 58, 52)', 'rgb(176, 68, 48)']
    },
    {
      id: 'chinese-orange-tree',
      url: './chinese-orange-tree.html',
      title: '写意橘子树 · 重彩',
      group: '国画·花鸟',
      seal: '写意重彩',
      desc: '竖幅生宣写意花果重彩，墨分五色写苍劲枝干，石绿、花青、汁绿层叠点叶，朱磦、赭石与藤黄绘累累橘果，含软边润染、枯笔飞白。',
      swatches: ['rgb(245, 239, 226)', 'rgb(52, 46, 38)', 'rgb(56, 96, 62)', 'rgb(218, 92, 34)', 'rgb(234, 158, 54)']
    },
    {
      id: 'chinese-grapes',
      url: './chinese-grapes.html',
      title: '青葡萄 · 没骨写意',
      group: '国画·花鸟',
      seal: '没骨写意',
      desc: '立轴生宣没骨写意花果，墨分五色写老藤卷须，汁绿花青层叠染叶，晶莹青葡萄珠圆玉润，支持进度条拖拽步进与保存 PNG。',
      swatches: ['rgb(246, 240, 226)', 'rgb(144, 178, 72)', 'rgb(74, 108, 44)', 'rgb(58, 52, 44)', 'rgb(168, 52, 42)']
    },
    {
      id: 'dunhuang-feitian-sketch',
      url: './dunhuang-feitian-sketch.html',
      title: '敦煌散花飞天（写意初稿）',
      group: '国画·人物敦煌',
      seal: '纯代码写意',
      desc: '纯数学曲线与程序化笔触手绘散花飞天，七层传统壁画技法（泥底、铁线描、分染、沥粉贴金、风化做旧）。',
      swatches: ['rgb(208, 186, 150)', 'rgb(198, 72, 46)', 'rgb(72, 146, 114)', 'rgb(52, 92, 138)', 'rgb(216, 174, 88)']
    },
    {
      id: 'dunhuang-feitian',
      url: './dunhuang-feitian.html',
      title: '敦煌莫高窟飞天（285窟古壁版）',
      group: '国画·人物敦煌',
      seal: '古壁临摹',
      desc: '参照莫高窟第 285 窟箜篌飞天原壁构图与残缺岁月质感，29,850 笔七层矿彩渲染，支持进度条步进与七层快捷跳转。',
      swatches: ['rgb(174, 146, 108)', 'rgb(62, 42, 30)', 'rgb(164, 68, 48)', 'rgb(74, 126, 98)', 'rgb(184, 132, 74)']
    },
    {
      id: 'dunhuang-feitian-fresh',
      url: './dunhuang-feitian-fresh.html',
      title: '敦煌飞天（285窟水墨盛彩版）',
      group: '国画·人物敦煌',
      seal: '水墨盛彩',
      desc: '依传统 209 笔法度（18 笔开脸、长线飘带与羊毫点染设色）临摹第 285 窟箜篌飞天原画，支持单笔步进观摩。',
      swatches: ['rgb(246, 238, 222)', 'rgb(216, 56, 38)', 'rgb(32, 154, 108)', 'rgb(32, 78, 162)', 'rgb(232, 184, 62)']
    },
    {
      id: 'oil-painting',
      url: './oil-painting.html',
      title: '古典油画静物（桃子与高脚杯）',
      group: '油画·静物风景',
      seal: '古典油画',
      desc: '纯毛刷点彩油画引擎，严格遵循古典罩染四层工序：亚麻底布、单色明暗底稿（Grisaille）、厚涂设色与透明罩染。',
      swatches: ['rgb(30, 21, 16)', 'rgb(214, 174, 122)', 'rgb(188, 100, 55)', 'rgb(194, 128, 78)', 'rgb(165, 108, 62)']
    },
    {
      id: 'tutorial-ink-bamboo',
      url: './tutorial-ink-bamboo.html',
      title: '芥子园·风竹墨韵',
      group: '国画·花鸟',
      seal: '水墨花鸟',
      desc: '《芥子园画谱》经典竹谱法度：淡墨定坡石远竿、自下而上立浓墨主竿、点“人”字节生鹿角枝、“个”“介”字写竹叶。',
      swatches: ['rgb(242, 233, 214)', 'rgb(110, 106, 99)', 'rgb(52, 48, 43)', 'rgb(22, 20, 18)', 'rgb(157, 45, 34)']
    },
    {
      id: 'tutorial-red-plum',
      url: './tutorial-red-plum.html',
      title: '疏影红梅',
      group: '国画·花鸟',
      seal: '写意花鸟',
      desc: '《芥子园》梅谱法度：渴笔飞白老干起势、“女”字穿插细枝、胭脂曙红五瓣点厾花头、焦墨点蒂勾须点蕊。',
      swatches: ['rgb(242, 233, 214)', 'rgb(42, 36, 30)', 'rgb(214, 69, 82)', 'rgb(158, 25, 42)', 'rgb(21, 18, 16)']
    },
    {
      id: 'tutorial-lotus-kingfisher',
      url: './tutorial-lotus-kingfisher.html',
      title: '荷风翠影',
      group: '国画·花鸟',
      seal: '泼墨花鸟',
      desc: '大写意花鸟范本：悬肘荷梗立势、斗笔泼墨大荷叶、没骨曙红点染荷花莲蓬、石青朱磦写翠鸟栖枝。',
      swatches: ['rgb(42, 42, 36)', 'rgb(184, 37, 63)', 'rgb(201, 166, 67)', 'rgb(27, 100, 143)', 'rgb(207, 90, 44)']
    },
    {
      id: 'tutorial-qi-shrimp',
      url: './tutorial-qi-shrimp.html',
      title: '齐派墨虾',
      group: '国画·水族',
      seal: '水墨水族',
      desc: '齐白石经典水族技法：侧锋重墨定头胸甲壳、五节虾身逐节减淡呈现晶莹质感、劲笔折钳钢丝须与焦墨点睛。',
      swatches: ['rgb(242, 233, 214)', 'rgb(138, 131, 122)', 'rgb(84, 79, 72)', 'rgb(24, 22, 20)', 'rgb(13, 11, 10)']
    },
    {
      id: 'tutorial-ink-koi',
      url: './tutorial-ink-koi.html',
      title: '年年有余·水墨游鱼',
      group: '国画·水族',
      seal: '没骨水族',
      desc: '没骨写意游鱼教程：淡墨垂柳水波营造清境、朱磦重墨侧锋定鱼头背部、飞白写散尾双鳍与点睛浮萍。',
      swatches: ['rgb(217, 87, 41)', 'rgb(229, 164, 77)', 'rgb(46, 43, 39)', 'rgb(88, 108, 67)', 'rgb(157, 45, 34)']
    },
    {
      id: 'tutorial-blue-green-landscape',
      url: './tutorial-blue-green-landscape.html',
      title: '千里青绿',
      group: '国画·山水',
      seal: '青绿山水',
      desc: '传统青绿设色五步法度：中锋勾勒三叠山骨、淡墨分染阴阳、石绿石青赭石重彩设色与云烟红树孤帆。',
      swatches: ['rgb(48, 43, 36)', 'rgb(39, 122, 88)', 'rgb(27, 79, 130)', 'rgb(184, 118, 62)', 'rgb(201, 56, 34)']
    },
    {
      id: 'tutorial-snow-landscape',
      url: './tutorial-snow-landscape.html',
      title: '寒江独钓·雪景寒林',
      group: '国画·山水',
      seal: '雪景山水',
      desc: '传统“不画雪而画天”雪景法：山顶屋面留白、干墨压阴面枯树、淡墨花青烘天染水衬雪与弹粉飘雪扁舟。',
      swatches: ['rgb(250, 246, 238)', 'rgb(77, 89, 102)', 'rgb(59, 58, 54)', 'rgb(25, 23, 20)', 'rgb(212, 138, 66)']
    },
    {
      id: 'tutorial-ink-fisherman',
      url: './tutorial-ink-fisherman.html',
      title: '江雪蓑笠翁',
      group: '国画·人物敦煌',
      seal: '写意人物',
      desc: '南宋梁楷减笔人物法：计白当黑留江面、斗笠侧锋与三笔开脸传神、破笔拖墨写蓑衣与钉头鼠尾三笔扁舟。',
      swatches: ['rgb(242, 233, 214)', 'rgb(207, 168, 130)', 'rgb(168, 125, 76)', 'rgb(33, 28, 23)', 'rgb(24, 21, 18)']
    },
    {
      id: 'tutorial-oil-apple',
      url: './tutorial-oil-apple.html',
      title: '基础油画·光影红苹果',
      group: '油画·静物风景',
      seal: '古典油画',
      desc: '油画静物经典四步训练：熟褐单色起稿铺暗底、固有色与明暗交界线、深入塑造冷暖反光果蒂与厚涂高光点睛。',
      swatches: ['rgb(36, 25, 19)', 'rgb(62, 16, 18)', 'rgb(196, 48, 36)', 'rgb(228, 118, 52)', 'rgb(255, 248, 232)']
    },
    {
      id: 'tutorial-oil-sunset-sea',
      url: './tutorial-oil-sunset-sea.html',
      title: '基础油画·海景日落',
      group: '油画·静物风景',
      seal: '印象派油画',
      desc: '风景油画标准四步法：暖调打底标水平线、天空暮紫至金橙渐变晕染、深海大色压沉、厚涂波光与归巢海鸥。',
      swatches: ['rgb(68, 72, 112)', 'rgb(216, 114, 68)', 'rgb(255, 232, 148)', 'rgb(24, 48, 74)', 'rgb(255, 246, 205)']
    }
  ];

  function addPack(list) {
    for (const item of list) {
      if (!BY_ID.has(item.id)) {
        BY_ID.set(item.id, item);
        DYNAMIC.push(item);
      }
    }
  }

  function urlFor(item) {
    return item.url ? item.url : `./paint.html?id=${encodeURIComponent(item.id)}`;
  }

  function getAll() {
    return [...LEGACY, ...DYNAMIC];
  }

  function getDynamicList() {
    return DYNAMIC;
  }

  window.Code2PaintCatalog = {
    addPack,
    urlFor,
    getAll,
    getLegacyList: () => LEGACY,
    getDynamicList
  };
})();
