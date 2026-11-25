import type { NightOrderDef } from './types';

export const DAY_META: Record<
  number,
  { title: string; yiDay: string; yiNight: string; dayLine: string; nightLine: string }
> = {
  1: {
    title: '开铺迎客',
    yiDay: '宜 开张·接活人单',
    yiNight: '忌 问名·轻信出门',
    dayLine: '初始系统已绑定老铺，白天先做活人纸活攒钱备料。',
    nightLine: '入夜落锁，门外先后响起不同的叩门声——听清来意，辨明真假再接单。'
  },
  2: {
    title: '借面夜客',
    yiDay: '宜 净宅·留心眼',
    yiNight: '忌 录音·离铺按印',
    dayLine: '吴支书白天的合规话术里藏着夜里诡异的影子。',
    nightLine: '月色下有两道身影先后敲门，谁是借面客，谁又想骗你进后巷？'
  },
  3: {
    title: '第三盏灯',
    yiDay: '宜 扎马·问忌',
    yiNight: '忌 开第三盏灯',
    dayLine: '阿杰探店拍断的视频，把无主纸人引到了铺子里。',
    nightLine: '第三盏灯还没亮，门外又有人拿着黑屏手机催你去后院……'
  },
  4: {
    title: '雨夜错身',
    yiDay: '宜 补料·止损',
    yiNight: '忌 回头·随客赴江',
    dayLine: '把账摊开，白天的活人生意照常开门。',
    nightLine: '檐外无雨，门槛下却渗进黑水，更有湿衣诡客欲引你去江边。'
  },
  5: {
    title: '旧账阴差',
    yiDay: '宜 清账·备符',
    yiNight: '忌 欠愿·赴荒祠',
    dayLine: '明晚起将迎来首次顶格诡异夜，先理顺前五日旧账。',
    nightLine: '阴差摊开生死簿，门外竟也有邻铺小伙急喊你去荒祠抬轿。'
  },
  6: {
    title: '无轿纸新娘',
    yiDay: '宜 贴门神·净铺',
    yiNight: '【顶格】忌 掀红盖头',
    dayLine: '北巷传出无声唢呐，今夜将迎首场顶格诡异履约。',
    nightLine: '红盖头垂在门外，喜婆也在巷口招手——一步迈错便万劫不复。'
  },
  7: {
    title: '镜中照影客',
    yiDay: '宜 补戏冠·养神',
    yiNight: '忌 直视铜镜',
    dayLine: '昨夜余波未散，戏班送来要修补的纸扎凤冠。',
    nightLine: '怀抱铜镜的诡影叩响木门，暗处还有冒充熟人亲眷的声音。'
  },
  8: {
    title: '断线裁缝诡',
    yiDay: '宜 扎纸楼·进料',
    yiNight: '忌 递剪刀',
    dayLine: '镇西迁坟大单上门，白天抓紧攒现钱与系统点数。',
    nightLine: '苍白纸手叩响柜台，门外另有一道自称镇府办事员的黑影。'
  },
  9: {
    title: '庙会前夜',
    yiDay: '宜 备大灯·问风声',
    yiNight: '忌 吹熄灯芯',
    dayLine: '全镇张灯结彩筹备大庙会，老人们提醒明晚阴市借路。',
    nightLine: '无影提灯童蹲在门槛外验灯，暗巷里却传来循环播放的呼救。'
  },
  10: {
    title: '百戏游神夜',
    yiDay: '宜 扎龙头·高洁净',
    yiNight: '【顶格】忌 熄前两灯',
    dayLine: '大庙会人声鼎沸，活人重金求彩扎龙头压轴。',
    nightLine: '十里阴市鼓点压境，假锣手竟企图骗你吹灯钻入庙后暗巷。'
  },
  11: {
    title: '庙会余灰',
    yiDay: '宜 扫灰·洗把柄',
    yiNight: '忌 散香灰',
    dayLine: '庙会散场，街角残纸随风打旋，宜休整补粮。',
    nightLine: '收灰炉头诡捧钵上门，荒祠轿夫也在门缝外低声诱骗。'
  },
  12: {
    title: '渡口湿衣客',
    yiDay: '宜 扎纸船·囤粮',
    yiNight: '忌 问水深',
    dayLine: '江雾压镇，老船工来买压浪纸船，神色有些发虚。',
    nightLine: '江腥味灌入铺门，一个是门槛讨船，另一个却要拉你下芦苇荡。'
  },
  13: {
    title: '空椅听戏诡',
    yiDay: '宜 净铺·备替纸人',
    yiNight: '【顶格】忌 数屋里人',
    dayLine: '老学究翻出旧档：每次大清算前，屋里都会多出一把空太师椅。',
    nightLine: '空椅吱呀作响，门外喜婆再次相邀——听清每一句再做决断。'
  },
  14: {
    title: '归还旧物夜',
    yiDay: '宜 清账·备终审',
    yiNight: '忌 拒收旧物',
    dayLine: '终局前最后一日缓冲，抓紧补齐生存口粮、洗清把柄、稳住阴气。',
    nightLine: '还物客静立门外，竟还有假冒系统使者声称能带你连夜逃出小镇。'
  },
  15: {
    title: '十五日终审',
    yiDay: '宜 立口碑·合阳账',
    yiNight: '【终局】系统大账清算',
    dayLine: '穿越入镇第十五天，全镇街坊联名来订镇口大纸幡。',
    nightLine: '终审钟响，纸马童与阴差并立灯下，门外却响起最后一道诱杀低语。'
  }
};

export const NIGHT_ORDERS: Record<string, NightOrderDef> = {
  n1_alley_sendoff: {
    id: 'n1_alley_sendoff',
    day: 1,
    client: '纸马童（代无名送行诡）',
    title: '巷口无名送行诡 · 讨白纸马',
    boardTitle: '纸马童递来的三角黄纸单',
    boardDesc: '门缝里塞进一张折成三角的黄纸，纸马童低声传话：巷口有位无名诡客急需一匹顺路白纸马。',
    siteTitle: '巷口送马',
    siteDesc: '先把白纸马摆正向，压稳局面后送行交差，领取首笔系统生存奖励。',
    siteIntro: '穿堂阴风灌进门缝，白纸马的影子在墙上微微晃了一下。',
    taboo: '不可开口询问诡客的生前姓氏。',
    pay: 36,
    ptsReward: 18,
    risk: 1,
    turns: 4,
    guestArt: 'paper_boy',
    storyBeats: [
      {
        speaker: '纸马童',
        cue: '纸马童贴着半开的木门站定，双颊两点朱砂在油灯下微微发亮，绝不越过门槛半步。',
        line: '「掌柜，头一夜开夜账，先给你递桩规矩浅的。巷口有位赶夜路的无名客，脚程断了，急求一匹顺路白纸马。」'
      },
      {
        speaker: '纸马童',
        cue: '它把三角黄纸折单轻轻推到柜台边，指了指屋里靠墙的白纸马。',
        line: '「不劳掌柜出铺子，就在这柜台里头把白纸马朝巷口摆正向，压稳穿堂阴风送出去便成。」'
      },
      {
        speaker: '纸马童',
        cue: '纸马童压低声气，漆黑瞳孔定定望着你。',
        line: '「只守一条：全程莫开口问他生前姓甚名谁。成单现结 36 现金与 18 点纸火赏——掌柜，这笔正经夜单你接不接？」'
      }
    ],
    intelHintUnverified: '系统预报｜今晚有低危无名诡客讨要白纸马，只需在铺内摆正交差。',
    intelHintVerified: '已核实｜无名送行诡只在铺内接活，只忌问姓；凡催你出门送货的皆是骗局！',
    steps: [
      { key: 'place_horse', label: '摆正白纸马' },
      { key: 'done', label: '送行交差' }
    ],
    failNote: '纸马没送稳，阴风在铺子里盘了一宿，阴气往上爬了些。'
  },
  n2_wu_plain: {
    id: 'n2_wu_plain',
    day: 2,
    client: '借面夜客（仿吴支书皮囊）',
    title: '借面诡客讨替身纸牌',
    boardTitle: '捏着空烟盒的借面夜客',
    boardDesc: '门外站着一道顶着吴支书轮廓的黑影，手里捏着同款空烟盒，半张惨白纸面具贴在眉骨上。',
    siteTitle: '屋里只留两个影子',
    siteDesc: '先按掉桌上自行录响的手机，再请借面客指认纸牌、交付交差。',
    siteIntro: '一只空烟盒无声搁在门槛边，柜台上的手机屏幕突然发烫亮起红点。',
    taboo: '不可录音留影，不可让第三人进屋。',
    pay: 70,
    ptsReward: 24,
    risk: 2,
    turns: 4,
    promisedKey: 'wu_d2',
    guestArt: 'masked_wu',
    storyBeats: [
      {
        speaker: '借面夜客',
        cue: '它一动不动站在门槛外半尺，举起一只扁塌的空红烟盒轻搁在柜台边缘，右颊纸面具裂着一道朱砂缝。',
        line: '「白天姓吴的活人……可曾把订金留在这儿？他拆了老祠堂的瓦，借我一寸阴气，说好今夜由你这纸铺替他还一张替身纸牌。」'
      },
      {
        speaker: '借面夜客',
        cue: '它低头瞟了一眼柜台上微微发烫的旧手机，嗓音像两张干纸互相摩擦。',
        line: '「你不用迈出门一步。就在屋里灯下把发响的录音物件扣死，让我隔着柜台指认清楚纸牌，再递过门槛就算两清。」'
      },
      {
        speaker: '借面夜客',
        cue: '镜片反出一片惨白冷光，阴冷气息在门口徘徊。',
        line: '「切记屋里只留咱们两个影子，莫录声、莫留影。事成给你支书盖章卡与尾款——掌柜，可愿开门应承？」'
      }
    ],
    intelHintUnverified: '系统预报｜白天的合规净宅单牵出一道借面诡客，今晚会在柜台前讨纸牌。',
    intelHintVerified: '已核实｜借面诡只在门槛交易、最忌录音；若有冒牌办事员叫你熄灯去后巷公所，那是诱杀陷阱！',
    steps: [
      { key: 'quiet', label: '扣灭录音手机' },
      { key: 'identified', label: '指认替身纸牌' },
      { key: 'done', label: '交付纸牌' }
    ],
    tokenReward: {
      id: 'wu_stamp',
      name: '支书盖章卡',
      desc: '守密信物 · 可抵消一次镇里抽查'
    },
    favorCardReward: 'card_chen',
    failNote: '借面诡没领到纸牌，拂袖而去；次日镇里立刻派人来抽查铺面。',
    aftermathFlag: 'audit'
  },
  n3_third_lamp: {
    id: 'n3_third_lamp',
    day: 3,
    client: '阿杰与自起纸人（第三盏灯）',
    title: '第三盏灯 · 自起纸人讨安座',
    boardTitle: '缩在门外发抖的阿杰',
    boardDesc: '阿杰缩在门外发抖，指着铺里：那尊无主红袍纸人自己从竹凳上立直了身子，正盯着熄灭的第三盏灯。',
    siteTitle: '封门之前',
    siteDesc: '稳住熄灭的第三盏灯，让纸人安座、局面归零后再封门交差。',
    siteIntro: '灯还没亮，纸人惨白的脸先朝你缓缓转了过来。',
    taboo: '第三盏灯绝对不能开。',
    pay: 60,
    ptsReward: 26,
    risk: 2,
    turns: 4,
    guestArt: 'ajie_night',
    storyBeats: [
      {
        speaker: '阿杰',
        cue: '阿杰脸色惨白地扒着门框，冷汗顺着鬓角往下淌，手忙脚乱把黑屏手机塞回兜里。',
        line: '「掌柜救命！我傍晚偷偷把拍断的视频倒回去看，画面里你铺里第三盏灯下面那尊红袍纸人……自己从竹凳上站起来了！」'
      },
      {
        speaker: '阿杰',
        cue: '他声音发抖，死死盯着铺里竹凳方向，根本不敢越过门槛半步。',
        line: '「柳裁缝说那纸人没安稳座，现在就停在你屋里头！你千万别出门，就在铺里稳住熄灭的第三盏灯，让它重新安座再拍上封门符！」'
      },
      {
        speaker: '阿杰',
        cue: '屋里老竹凳突然「咔」地轻响一声，阿杰吓得差点跪下。',
        line: '「我就在门口帮你死死按住电闸开关，只要第三盏灯不亮、压平局面封好门就行！60 块压惊费我掏，掌柜接不接这单？」'
      }
    ],
    intelHintUnverified: '系统预报｜阿杰视频断在第三盏灯。可去街巷向柳裁缝打听纸人禁忌。',
    intelHintVerified: '已核实｜真单在铺内稳灯安座；外面若有自称阿杰同行喊你去后院枯井找三脚架的，千万别出门！',
    steps: [
      { key: 'lamp', label: '稳住第三盏灯' },
      { key: 'seated', label: '让纸人安座' },
      { key: 'done', label: '封门交差' }
    ],
    favorCardReward: 'card_liu',
    failNote: '门没封稳，阿杰吓得把今晚的怪事发进了镇群。',
    aftermathFlag: 'rumor'
  },
  n4_cross_alley: {
    id: 'n4_cross_alley',
    day: 4,
    client: '雨夜黑伞诡客',
    title: '黑伞诡客求送行',
    boardTitle: '无雨撑黑伞的来客',
    boardDesc: '屋檐外月色干爽，来客却撑着一把往下淌黑水的旧油纸伞，停在铺门外不肯进屋。',
    siteTitle: '别回头看伞底',
    siteDesc: '先点定神香截住水渍，再背身送黑伞出门槛，最后落闩交差。',
    siteIntro: '黑水从门缝渗进两寸，柜台上的白纸角无风自卷。',
    taboo: '送伞出门时绝对不可回头对视。',
    pay: 55,
    ptsReward: 24,
    risk: 2,
    turns: 4,
    guestArt: 'umbrella',
    storyBeats: [
      {
        speaker: '黑伞诡客',
        cue: '油纸伞沿压得极低，伞骨滴滴答答往下淌着黑水，它在门槛外站得笔直。',
        line: '「掌柜莫惊……我不是来讨命的，只是走错岔巷淋了一身阴雨，折了引路伞骨，须借你铺里三支定神香截住水煞。」'
      },
      {
        speaker: '黑伞诡客',
        cue: '门缝下渗进两寸冰冷黑水，却乖乖止步在柜台脚边。',
        line: '「你只管站在屋里点香，再背过身把旧伞轻推出门槛外，落上门闩便算完事，绝不用你跟出门半步。」'
      },
      {
        speaker: '黑伞诡客',
        cue: '伞下传来一声极轻的叹息。',
        line: '「唯一规矩：送伞出门时切莫回头看伞底。55 块买路钱搁在窗台上了，掌柜接还是不接？」'
      }
    ],
    intelHintUnverified: '系统预报｜镇尾旧巷雨夜黑伞诡正在游荡，可先找柳裁缝问忌。',
    intelHintVerified: '已核实｜真黑伞诡只在门槛点香背身送离；拉你去渡口芦苇荡踩水烧船的湿衣挑夫是水诡诱杀！',
    steps: [
      { key: 'incense', label: '点定神香' },
      { key: 'escort', label: '背身送伞出门' },
      { key: 'done', label: '落闩交差' }
    ],
    failNote: '水渍一夜未干，铺里阴气又沉了一截。'
  },
  n4_watched_door: {
    id: 'n4_watched_door',
    day: 4,
    client: '门缝索名诡（被盯）',
    title: '被盯单 · 门缝索名诡',
    boardTitle: '门缝外多了一双眼睛',
    boardDesc: '铺里阴气过了红线，门缝外贴上来一只不肯走的惨白眼睛，低声唤着你的名字。',
    siteTitle: '压住门缝',
    siteDesc: '一声不吭拍上镇门敕令，压稳局面后立即落闩驱离。',
    siteIntro: '老木门轻叩三声，门缝里渗出半声模仿熟人的呼唤。',
    taboo: '不可开口应答门外的任何称呼。',
    pay: 65,
    ptsReward: 28,
    risk: 3,
    turns: 4,
    watched: true,
    guestArt: 'umbrella',
    storyBeats: [
      {
        speaker: '门缝索名诡',
        cue: '一只毫无血色的眼睛死死贴在木门缝隙外，门板发出指甲慢刮的刺耳声响。',
        line: '「铺里阴气这么重……门早关不住啦。里面掌柜，你姓什么呀？应我一声好不好？」'
      },
      {
        speaker: '门缝索名诡',
        cue: '系统面板骤然弹出猩红预警：【铺面已被盯上，硬拒将涨阴气并留把柄】。',
        line: '「你不接这单，我就贴在门缝外守到明早。要想打发我走，就按老行规在屋里拍镇门敕令、压稳门缝再落闩！」'
      },
      {
        speaker: '门缝索名诡',
        cue: '它的声音忽男忽女，贴着木板轻轻发笑。',
        line: '「记住，进了局千万别嘴滑答我一句。开不开门接这笔被盯单，你挑吧……」'
      }
    ],
    intelHintUnverified: '系统红警｜铺面阴气 ≥ 12，今夜将强制刷出门缝索名诡。',
    intelHintVerified: '被盯单｜不可应声！在铺内直接拍镇门纸再落闩驱离；切忌被另一张诱杀单骗出铺门！',
    steps: [
      { key: 'ward_door', label: '贴镇门敕令' },
      { key: 'done', label: '落闩驱离' }
    ],
    failNote: '门缝外的东西没请走，账上添了一笔暗债。',
    aftermathFlag: 'watched_debt'
  },
  n5_old_account: {
    id: 'n5_old_account',
    day: 5,
    client: '旧账阴差',
    title: '五日清算 · 旧账阴差对簿',
    boardTitle: '持簿而立的旧账阴差',
    boardDesc: '明晚将迎首次顶格诡异夜，今晚先由长衫阴差上门核对前五日阴账。',
    siteTitle: '灯下对簿',
    siteDesc: '如实摊开五日夜账、定住三盏灯火，局面归零后盖朱砂印结清。',
    siteIntro: '阴差把一页发黄生死簿摊在柜台灯下，白光眼镜反出一片冷雾。',
    taboo: '不可隐瞒账上未清的把柄。',
    pay: 80,
    ptsReward: 32,
    risk: 2,
    turns: 4,
    watched: true,
    guestArt: 'old_accountant',
    storyBeats: [
      {
        speaker: '旧账阴差',
        cue: '戴圆框眼镜的长衫老者抬手轻叩三下柜台，翻开一本泛黄线装生死簿。',
        line: '「初来乍到的掌柜，你在这间老纸扎铺已熬过五日。按阴司旧例，逢五必有一次灯下对簿。」'
      },
      {
        speaker: '旧账阴差',
        cue: '他推了推泛白光的眼镜，语气公事公办、不带一丝感情。',
        line: '「无需出铺，就在这三盏红灯下摊开你前五日的阴阳两账，如实核清盈亏与把柄，再稳住灯火落朱砂印结清。」'
      },
      {
        speaker: '旧账阴差',
        cue: '他合拢账页的一角，提醒道。',
        line: '「明晚便是首场顶格夜。今晚这关躲不掉，硬拒必添暗债；办妥了，我赐你一枚『旧账铜扣』与纸火重赏。」'
      }
    ],
    intelHintUnverified: '系统预告｜明晚迎首次顶格诡异「无轿纸新娘」，今晚须先过阴差对簿关。',
    intelHintVerified: '已核实｜阴差只在柜台灯下核账；门外喊你去荒祠抬轿的邻铺伙计绝非活人！',
    steps: [
      { key: 'audit_ledger', label: '摊账对簿' },
      { key: 'calm_flame', label: '定住灯火' },
      { key: 'done', label: '盖章结清' }
    ],
    tokenReward: {
      id: 'bronze_clasp',
      name: '旧账铜扣',
      desc: '五日稳局信物 · 证明铺子已在阴间挂号立稳'
    },
    favorCardReward: 'card_boy',
    failNote: '对簿没压住，这笔旧账记到了后续顶格夜。',
    aftermathFlag: 'watched_debt'
  },
  n6_peak_bride: {
    id: 'n6_peak_bride',
    day: 6,
    client: '无轿纸新娘（顶格诡异）',
    title: '【顶格夜】无轿纸新娘讨合卺轿',
    boardTitle: '红盖头垂目的纸新娘',
    boardDesc: '【系统警报：顶格高压，仅 3 回合】北巷无声唢呐停在铺门外，身披朱砂嫁衣的纸新娘垂头讨要合卺纸轿。',
    siteTitle: '垂目送嫁',
    siteDesc: '顶格高压仅 3 回合！先敬喜香压煞、再交合卺纸轿，切莫抬头！',
    siteIntro: '红盖头微微一颤，屋里三盏灯火同时压低了半寸。',
    taboo: '【顶格重忌】全程不可抬头窥视红盖头之下。',
    pay: 110,
    ptsReward: 46,
    risk: 3,
    turns: 3,
    peak: true,
    watched: true,
    guestArt: 'paper_bride',
    storyBeats: [
      {
        speaker: '无轿纸新娘',
        cue: '大红盖头悬在铺门外微微轻摆，一双惨白纸手隔着门槛递来半截朱砂合卺红绳。',
        line: '「吉时已到……北巷十里红妆独缺一顶合卺纸轿。老纸铺欠我当年一桩喜活，今夜特来取轿。」'
      },
      {
        speaker: '无轿纸新娘',
        cue: '屋里三盏红灯齐齐矮了半寸，系统弹出【3 回合顶格高压】警报。',
        line: '「你不必离铺送亲。只须低眉垂目，在柜台前敬上喜香压煞、献出合卺纸轿再送过门槛，三回合内立见分晓。」'
      },
      {
        speaker: '无轿纸新娘',
        cue: '盖头金穗轻晃，传出冰冷幽远的叮嘱。',
        line: '「切忌抬头窥视红盖头之下。办妥赠你『合卺红绳结』与重赏——掌柜，接单还是硬拒？」'
      }
    ],
    intelHintUnverified: '【顶格警报】无轿纸新娘仅给 3 回合，强烈建议备齐安神符/替纸人并提升洁净！',
    intelHintVerified: '已核实｜正主只在柜台垂目讨轿；若巷口有喜婆骗你敞门走十步去揭轿帘，那是必死诱杀！',
    steps: [
      { key: 'rite_main', label: '垂目敬香献轿' },
      { key: 'done', label: '送轿出门' }
    ],
    tokenReward: {
      id: 'crimson_knot',
      name: '合卺红绳结',
      desc: '顶格信物 · 夜履约结算额外多得 6 纸火点'
    },
    failNote: '纸轿未成，红盖头在门外停留到五更，铺子染上「不对劲」标记。',
    aftermathFlag: 'watched_debt'
  },
  n7_mirror_guest: {
    id: 'n7_mirror_guest',
    day: 7,
    client: '铜镜照影诡',
    title: '镜中客讨画眼纸偶',
    boardTitle: '怀抱古铜镜的长衫影',
    boardDesc: '来客胸前抱着一面泛白雾的古铜镜，要求你替它扎一只「不点左瞳」的纸偶替身。',
    siteTitle: '背镜扎偶',
    siteDesc: '遮住铜镜反光，按规矩点睛交偶即可稳妥领赏。',
    siteIntro: '铜镜照过柜台，镜里的纸马突然比现实慢了半拍。',
    taboo: '不可直视镜面中的自己。',
    pay: 72,
    ptsReward: 26,
    risk: 2,
    turns: 4,
    guestArt: 'mirror_guest',
    storyBeats: [
      {
        speaker: '铜镜照影诡',
        cue: '长衫客怀抱一面生锈圆铜镜立于柜台外，镜面雾蒙蒙的，映出的铺子竟比屋里多出一盏灯。',
        line: '「戏班后台太吵，我抱着旧镜子寻到你这儿。镜里缺个陪影的纸偶，劳烦掌柜现扎一只『只点右瞳、不点左瞳』的替身。」'
      },
      {
        speaker: '铜镜照影诡',
        cue: '它把铜镜轻轻朝下压了压，没有踏入柜台内侧。',
        line: '「规矩简单：先拿一张白纸遮住我怀里的镜面，再在柜台上交偶收摊，决不麻烦掌柜出门。」'
      },
      {
        speaker: '铜镜照影诡',
        cue: '镜框发出细微嗡鸣，它静静等候你的答复。',
        line: '「千万别直视镜子里的自己。72 现金与 26 点纸火赏，接不接由你。」'
      }
    ],
    intelHintUnverified: '系统预报｜戏班后台的铜镜诡影今夜会寻上门来。',
    intelHintVerified: '已核实｜铜镜诡只在柜台遮镜交偶；夜里冒充熟人亲眷催你去老槐树送货的皆是陷阱！',
    steps: [
      { key: 'rite_main', label: '白纸遮镜交偶' },
      { key: 'done', label: '送客收摊' }
    ],
    failNote: '镜光晃花了眼，铺子阴气上升。'
  },
  n8_shadow_tailor: {
    id: 'n8_shadow_tailor',
    day: 8,
    client: '断线裁缝诡',
    title: '断线诡讨红线缝纸衣',
    boardTitle: '指节僵直的缝衣诡',
    boardDesc: '一双沾着干涸浆糊的苍白纸手叩响柜台，讨要一卷朱砂红线缝补破损纸袍。',
    siteTitle: '递线藏剪',
    siteDesc: '先把柜台铁剪收妥，再递上朱砂红线压稳局面交差。',
    siteIntro: '柜台上的老铁剪自己轻轻挪动了半寸，发出细碎金属擦声。',
    taboo: '不可将铁剪刀刃朝向来客递出。',
    pay: 78,
    ptsReward: 28,
    risk: 2,
    turns: 4,
    guestArt: 'mirror_guest',
    storyBeats: [
      {
        speaker: '断线裁缝诡',
        cue: '枯瘦如竹签的手指轻叩木台，袖口垂着几根被扯断的朱砂线头。',
        line: '「我的旧纸袍在风里崩了肩线，走不远路，特地来纸火铺讨一卷浸过朱砂的红线。」'
      },
      {
        speaker: '断线裁缝诡',
        cue: '它目光掠过柜台上的老铁剪，身体几不可察地一僵。',
        line: '「活儿就在柜台前办：你先把铁剪收进抽屉藏妥，再递红线给我缝毕送行即可。」'
      },
      {
        speaker: '断线裁缝诡',
        cue: '它从怀里摸出一沓整整齐齐的冥银换作现钞。',
        line: '「记住莫把剪刃朝向我。78 现钱外加 28 纸火点，掌柜可愿应下？」'
      }
    ],
    intelHintUnverified: '系统预报｜今夜有断线诡登门借线，小心柜台上的铁剪。',
    intelHintVerified: '已核实｜断线诡在柜台收剪递线即可；叫你熄灯去后巷按手印的假办事员是致命诱杀！',
    steps: [
      { key: 'rite_main', label: '收剪递朱砂线' },
      { key: 'done', label: '缝毕送行' }
    ],
    failNote: '纸衣未缝妥，夜里满屋都是剪纸咔嚓声。'
  },
  n9_lantern_child: {
    id: 'n9_lantern_child',
    day: 9,
    client: '无影提灯童',
    title: '庙会前夜 · 阴市验灯童',
    boardTitle: '门槛外的提灯小影',
    boardDesc: '明日大庙会阴市借路，无影提灯童提前上门验灯，要求换一根浸过净油的新灯芯。',
    siteTitle: '换芯验灯',
    siteDesc: '稳住火苗换上新灯芯，为明晚的庙会顶格夜攒足底气。',
    siteIntro: '提灯童脚下空无影子，灯笼里跳着一豆青白火苗。',
    taboo: '换芯时不可用嘴吹熄旧火。',
    pay: 82,
    ptsReward: 30,
    risk: 2,
    turns: 4,
    guestArt: 'paper_boy',
    storyBeats: [
      {
        speaker: '无影提灯童',
        cue: '提着青白纸灯的小童蹲在门槛外，脚下空荡荡没有半点影子。',
        line: '「明晚大庙会阴市借路，游神仪仗要先验过沿街灯火。我替前队来看看你这纸火铺的灯芯够不够亮。」'
      },
      {
        speaker: '无影提灯童',
        cue: '它踮起脚把小灯笼隔空递到柜台上方，灯芯微弱跳动。',
        line: '「你就在屋里拿纸镊替我夹换一根浸过净油的新灯芯，验明画押便好，绝不叫你出铺子。」'
      },
      {
        speaker: '无影提灯童',
        cue: '小童歪头眨了眨眼，提醒了一句。',
        line: '「换芯时万万不可用嘴吹熄旧火。办妥给 82 现钱与柳裁缝人情卡——掌柜接不接？」'
      }
    ],
    intelHintUnverified: '系统预告｜明晚 D10 庙会将迎第二次顶格夜！今晚先稳住验灯童。',
    intelHintVerified: '已核实｜真单是在屋里用纸镊换芯；外面拿着黑屏手机催你去后院枯井的必是诱杀！',
    steps: [
      { key: 'rite_main', label: '镊夹换新灯芯' },
      { key: 'done', label: '验灯画押' }
    ],
    favorCardReward: 'card_liu',
    failNote: '旧火意外熄灭，明晚庙会游神的怒气更重了。'
  },
  n10_temple_fair_peak: {
    id: 'n10_temple_fair_peak',
    day: 10,
    client: '庙会百戏游神（顶格诡异）',
    title: '【庙会顶格】百戏游神借路讨灯',
    boardTitle: '高冠古纸面的百戏游神',
    boardDesc: '【系统警报：庙会顶格高压，仅 3 回合】鼓点如雷却不见活人，高大游神停在门前索要引路大灯与三牲纸扎。',
    siteTitle: '焚香礼送游神',
    siteDesc: '仅 3 回合！先燃高香亮灯迎路，压稳滔天阴气后敬献纸扎送神过街。',
    siteIntro: '街巷纸钱漫天飞舞，门外高大纸面低垂，两道朱砂幡旗猎猎作响。',
    taboo: '【顶格重忌】前两盏红灯不可熄灭，不可直呼神讳。',
    pay: 135,
    ptsReward: 56,
    risk: 3,
    turns: 3,
    peak: true,
    watched: true,
    guestArt: 'temple_deity',
    storyBeats: [
      {
        speaker: '百戏游神',
        cue: '双肩朱砂靠旗在无风夜里猎猎作响，高大古纸面低垂于门楣之外，沉沉鼓点震得茶杯轻颤。',
        line: '「阴市借道，百戏过街。纸火老铺既亮着三盏长明灯，当按古礼敬献引路大灯与三牲纸扎。」'
      },
      {
        speaker: '百戏游神',
        cue: '系统警报拉响：【庙会顶格 3 回合高压】，门外纸钱如雪飘落却绝不越门一步。',
        line: '「守铺之人不可离阈。就在柜台亮稳前两盏红灯、焚香献礼，三回合内礼送仪仗过街。」'
      },
      {
        speaker: '百戏游神',
        cue: '朱砂神目微亮，威压笼罩全屋。',
        line: '「前两灯不灭、不呼神讳，便赐你『庙会游神令』与 56 纸火重赏。接礼，还是抗礼？」'
      }
    ],
    intelHintUnverified: '【庙会顶格】仅 3 回合！务必携带替纸人/安神符或柳裁缝人情卡入场！',
    intelHintVerified: '已核实｜真游神严令护灯且不离铺门；那个催你吹灯钻庙后暗巷的锣手分明是骗命邪祟！',
    steps: [
      { key: 'rite_main', label: '亮灯献三牲纸扎' },
      { key: 'done', label: '礼送游神过街' }
    ],
    tokenReward: {
      id: 'temple_bell_charm',
      name: '庙会游神令',
      desc: '庙会信物 · 镇压阴气，每夜额外稳住街巷口碑'
    },
    failNote: '游神拂怒而过，铺子阴气骤涨并染上「不对劲」标记。',
    aftermathFlag: 'watched_debt'
  },
  n11_ash_collector: {
    id: 'n11_ash_collector',
    day: 11,
    client: '收灰炉头诡',
    title: '庙会余波 · 收灰诡讨底灰',
    boardTitle: '捧冷陶钵的收灰影',
    boardDesc: '庙会次夜，一道满身香灰的身影捧着冷陶钵进门，讨要香炉里沉淀三日的旧香底灰。',
    siteTitle: '平钵分灰',
    siteDesc: '用净纸垫底平分香灰，借机平复庙会后的躁动阴气。',
    siteIntro: '香炉里的灰无风浮起半寸，陶钵发出低沉嗡鸣。',
    taboo: '分灰不可撒落柜台之外。',
    pay: 76,
    ptsReward: 28,
    risk: 2,
    turns: 4,
    guestArt: 'mirror_guest',
    storyBeats: [
      {
        speaker: '收灰炉头诡',
        cue: '它捧着一只冰冷黑陶钵立在柜台外，衣袖簌簌抖落干燥香灰。',
        line: '「大庙会散场了，阴市余烬未清。我沿街收旧香底灰，到你这铺里分走半钵便去。」'
      },
      {
        speaker: '收灰炉头诡',
        cue: '香炉里的残灰无风轻浮半寸，氛围虽冷却无杀气。',
        line: '「就在柜台上拿净纸垫底平分香灰，别撒出柜台外，盖钵送离即可，正巧替你降一截庙会后的躁阴。」'
      },
      {
        speaker: '收灰炉头诡',
        cue: '它把陶钵往前轻轻一递。',
        line: '「76 现金、28 纸火点，算一桩平顺买卖——掌柜接不接？」'
      }
    ],
    intelHintUnverified: '系统预报｜庙会散场后的收灰诡较温和，是回血攒粮的好机会。',
    intelHintVerified: '已核实｜收灰诡只在柜台平分香灰；门外喊你去荒祠抬轿的跑腿小伙是索命陷阱！',
    steps: [
      { key: 'rite_main', label: '净纸平分旧香灰' },
      { key: 'done', label: '盖钵送离' }
    ],
    failNote: '香灰撒了一地，屋里冷意久久不散。'
  },
  n12_drowned_ferry: {
    id: 'n12_drowned_ferry',
    day: 12,
    client: '渡口湿衣诡',
    title: '江雾渡口客讨纸船',
    boardTitle: '拍下湿铜钱的渡口诡',
    boardDesc: '浑身湿透的渡口诡把一枚锈迹古铜钱拍上柜台，低声索要一只载魂纸船。',
    siteTitle: '缄口渡船',
    siteDesc: '绝口不答水深之问，只管把纸船扎稳交渡。',
    siteIntro: '一股湿冷江腥味灌入铺面，明晚便是第三场顶格夜。',
    taboo: '不可回答来客关于「水有多深」的提问。',
    pay: 88,
    ptsReward: 32,
    risk: 2,
    turns: 4,
    guestArt: 'umbrella',
    storyBeats: [
      {
        speaker: '渡口湿衣诡',
        cue: '它衣摆滴滴答答淌着江水，把一枚生满绿锈的湿铜钱重重拍在门槛石上。',
        line: '「江雾太大，渡船断了桨。掌柜……你可知道江心水有多深？给我扎一只载魂纸船吧。」'
      },
      {
        speaker: '渡口湿衣诡',
        cue: '见你不接水深的话茬，它喉咙里滚出一声沉闷湿笑，却老实站在门外没再靠近。',
        line: '「不用你跟我去江边。就在铺里把纸船扎稳、隔着柜台递给我，我自个儿带回渡口去。」'
      },
      {
        speaker: '渡口湿衣诡',
        cue: '它盯着你的嘴唇，似乎仍盼着你答错一句话。',
        line: '「只要你守口如瓶把船交齐，88 现钱与 32 纸火点归你。这单接不接？」'
      }
    ],
    intelHintUnverified: '系统预告｜明晚 D13 为最后一次顶格夜「空椅听戏诡」，今晚记得备齐保命符与口粮。',
    intelHintVerified: '已核实｜真渡口诡只讨船在铺内交货；拉你去芦苇荡踩水点船的挑夫绝对是骗你下水毙命！',
    steps: [
      { key: 'rite_main', label: '缄口交付渡河纸船' },
      { key: 'done', label: '送客离铺' }
    ],
    failNote: '一时答错话，湿气缠门，阴气升高。'
  },
  n13_peak_empty_chair: {
    id: 'n13_peak_empty_chair',
    day: 13,
    client: '空椅听戏诡（顶格诡异）',
    title: '【顶格夜】空椅听戏诡索三折戏偶',
    boardTitle: '水袖轻摆的听戏诡影',
    boardDesc: '【系统警报：第三场顶格高压，仅 3 回合】月光落处凭空多出一张老太师椅，水袖戏影索要三折纸戏偶唱完堂会。',
    siteTitle: '莫数屋里几人',
    siteDesc: '仅 3 回合！目不斜视摆好三折纸戏偶，压零局面后落幕送戏。',
    siteIntro: '空椅发出沉重吱呀声，仿佛有人刚刚坐实，戏腔贴着耳畔响起。',
    taboo: '【顶格重忌】绝对不可清点屋里共有几个人影。',
    pay: 140,
    ptsReward: 58,
    risk: 3,
    turns: 3,
    peak: true,
    watched: true,
    guestArt: 'opera_ghost',
    storyBeats: [
      {
        speaker: '空椅听戏诡',
        cue: '白水袖在惨淡月色里缓缓一甩，铺里角落那把凭空多出的老太师椅「吱呀」一沉。',
        line: '「咿呀……堂会开锣，偏偏台下少三折纸扎戏偶。掌柜，老县志里记过的旧约，该你唱这一回了。」'
      },
      {
        speaker: '空椅听戏诡',
        cue: '系统亮起猩红倒计时：【3 回合顶格高压】，凄婉戏腔贴着门梁绕梁不散。',
        line: '「就在屋里灯前摆齐三折纸戏偶、鸣锣散戏，切莫踏出铺门一步，更绝不可清点屋里坐着几个人影。」'
      },
      {
        speaker: '空椅听戏诡',
        cue: '花脸画眉下的墨瞳微微一弯，递出一块冷玉残片。',
        line: '「唱罢散场，赠你『戏面残玉』助过终审大账，外加 140 现金、58 纸火点——掌柜可敢开锣？」'
      }
    ],
    intelHintUnverified: '【终前顶格】仅 3 回合！动用替纸人、安神符与人情卡一鼓作气过关！',
    intelHintVerified: '已核实｜听戏诡只在屋里要三折戏偶；门外假喜婆诱你出门揭轿帘是必死局！',
    steps: [
      { key: 'rite_main', label: '献三折纸戏偶' },
      { key: 'done', label: '鸣锣散戏送客' }
    ],
    tokenReward: {
      id: 'opera_mask_jade',
      name: '戏面残玉',
      desc: '顶格信物 · 终局大账清算时额外压低初始局面 1 点'
    },
    failNote: '堂会未散，阴气剧震，铺面挂上「不对劲」重记。',
    aftermathFlag: 'watched_debt'
  },
  n14_quiet_borrower: {
    id: 'n14_quiet_borrower',
    day: 14,
    client: '还物无声诡',
    title: '终局前夜 · 归还旧纸活',
    boardTitle: '门外静立的还物客',
    boardDesc: '明晚便是十五日系统终审大账。门外立着一道沉默身影，来归还前几夜借走的旧纸活并结清尾款。',
    siteTitle: '收物平账',
    siteDesc: '温和收下旧物、顺势降一截阴气，为明晚终审调整至最佳状态。',
    siteIntro: '灯火难得安稳，窗外月色如霜。',
    taboo: '不可拒收对方退回的旧物。',
    pay: 90,
    ptsReward: 34,
    risk: 1,
    turns: 4,
    guestArt: 'paper_boy',
    storyBeats: [
      {
        speaker: '还物无声诡',
        cue: '纸马童模样的沉默身影捧着一只磨亮的旧铜扣与一沓纸活，安静立在灯影下。',
        line: '「明夜就是十五日大账终审。前些日子借走你铺里的纸马、纸灯与旧符，如今一并归还平账。」'
      },
      {
        speaker: '还物无声诡',
        cue: '屋里灯焰难得澄澈稳定，连阴气都退却了几分。',
        line: '「只须在柜台如礼收回旧物、落锁备终审，绝不折腾，更不要轻信门外任何自称能带你提前逃离小镇的捷径。」'
      },
      {
        speaker: '还物无声诡',
        cue: '它微微躬身，将尾款 90 现金与 34 纸火点压在账本上。',
        line: '「切记不可拒收旧物。掌柜，请收账吧。」'
      }
    ],
    intelHintUnverified: '系统提示｜明晚即为 D15 终审夜，今晚是最后的调整与囤粮窗口。',
    intelHintVerified: '已核实｜还物客是来平账的；那个自称「系统接引使」骗你走出镇口白雾的绝对是伪装诱杀！',
    steps: [
      { key: 'rite_main', label: '如礼收回旧纸活' },
      { key: 'done', label: '落锁备终审' }
    ],
    failNote: '一时疏忽误了平账良机。'
  },
  n15_final_ledger: {
    id: 'n15_final_ledger',
    day: 15,
    client: '系统终审 · 纸马童与大账阴差',
    title: '【十五日终审】纸火大账总清算',
    boardTitle: '并立灯下的纸马童与大账阴差',
    boardDesc: '第十五夜钟声敲响。纸马童与旧账阴差并立灯下，初始经营系统弹出最终考核：核清十五日因果，定你去留！',
    siteTitle: '终审合账',
    siteDesc: '摊开十五日阴阳总账、燃亮三盏长明灯，压零局面后落朱砂总印通关！',
    siteIntro: '系统面板泛起朱砂微光：「十五日试用期满。请向本镇活人与诡异交出最终答卷。」',
    taboo: '不可逃避账上未了的因果与把柄。',
    pay: 180,
    ptsReward: 80,
    risk: 3,
    turns: 4,
    watched: true,
    guestArt: 'old_accountant',
    storyBeats: [
      {
        speaker: '大账阴差',
        cue: '第十五夜更鼓敲响，纸马童与大账阴差并立柜台之前，系统金红篆文在半空缓缓展开。',
        line: '「穿越者，十五日纸火铺试用期已满。活人阳账、诡异阴账，今夜须在此间灯下一并总清算。」'
      },
      {
        speaker: '纸马童',
        cue: '纸马童轻声开口，首次露出一丝极淡的笑意。',
        line: '「守住三盏长明灯，摊开十五日总账压平局面、落下朱砂总印——莫被门外最后一道假捷径骗出去功亏一篑。」'
      },
      {
        speaker: '大账阴差',
        cue: '朱砂大印悬于账本上方，只待你亲手开局。',
        line: '「终审躲不得，亦无需惧。掌柜，呈交你这十五天的生死答卷吧！」'
      }
    ],
    intelHintUnverified: '【终局提示】集齐前几日信物、压低阴气并清掉把柄，即可迈向完美真结局！',
    intelHintVerified: '已核实｜真正的终审在铺内灯下合账；外头自称能提前接你回家的「接引使」是最后一道诱杀诡！',
    steps: [
      { key: 'audit_ledger', label: '呈交十五日总账' },
      { key: 'calm_flame', label: '稳燃三盏长明灯' },
      { key: 'done', label: '落印通关' }
    ],
    failNote: '总账未能合拢，系统判定试用期勉强延留。',
    aftermathFlag: 'watched_debt'
  }
};

/**
 * 夜间「诡异诱杀陷阱单」（骗你跨出铺门杀掉）
 * 标题与酬金极有迷惑性，唯有听完角色讲述、抓住矛盾与诱骗出门破绽方能识破！
 */
export const NIGHT_TRAP_ORDERS: Record<string, NightOrderDef> = {
  trap_d1_niece: {
    id: 'trap_d1_niece',
    day: 1,
    client: '自称「陈婶娘家侄女」的夜客',
    title: '巷口急单 · 替陈婶送白纸马',
    boardTitle: '提着红灯的「陈婶侄女」',
    boardDesc: '门外站着一位披青布衣的妇人，声称陈婶在巷尾崴了脚，愿出双倍现钱请你急送一匹白纸马过去。',
    siteTitle: '',
    siteDesc: '',
    siteIntro: '',
    taboo: '不可轻信陌生夜客跨出铺门。',
    pay: 58,
    ptsReward: 24,
    risk: 1,
    turns: 4,
    guestArt: 'night_auntie',
    isTrap: true,
    storyBeats: [
      {
        speaker: '「陈婶侄女」',
        cue: '她把竹篮紧贴胸口，脸色在冷月下泛着纸一样的死白，嘴角一直挂着僵硬弧度。',
        line: '「掌柜开开门呀！我是陈婶娘家侄女，婶子傍晚回西巷老槐树那边崴了脚，老周家急着要白纸马，叫我跑来请你帮个忙。」'
      },
      {
        speaker: '「陈婶侄女」',
        cue: '她往门缝里凑近半寸，眼睛一眨不眨，却死活不肯把灯笼照向自己脚下。',
        line: '「陈婶说了，大晚上劳烦你过意不去，给你双倍现钱 58 块，系统也认这笔急单！东西轻巧，一眨眼就到。」'
      },
      {
        speaker: '「陈婶侄女」',
        cue: '窗外月色明明干爽无云，她却忽然把声音压得又细又滑，伸手轻轻勾了勾门环。',
        line: '「铺里灯太晃眼，劳烦掌柜**把门栓卸了、亲自提着纸马跨出门槛跟我走一趟**。外头**暴雨下得这么大**，咱们赶紧上路吧……」'
      }
    ],
    trapClueHint: '【识破破绽】窗外明月干爽无雨，她却说「暴雨下得这么大」，还百般诱你卸闩跨出门槛去老槐树——必是画皮诱杀诡！',
    trapKillTitle: '老槐树下 · 诱杀毙命',
    trapKillNarrative: '你刚提着纸马跨出铺门三步，前头引路的「侄女」颈骨咯哒一声生生拧转一百八十度！暗巷浓雾瞬间吞没了身后的红灯笼，次日清晨纸扎铺门前只剩一具空纸马与半只冷鞋。',
    trapExposeText: '你冷声指出窗外滴雨未下，死死按住门闩绝不迈出半步！门外那张僵笑的脸骤然拉长撕裂，尖啸着化作一团湿冷墨雾散入夜色（识破诱杀：纸火点 +6，阴气 −1）。',
    intelHintUnverified: '系统提示｜夜里敲门者真假难辨，切记听完对方每一句话再做决定。',
    intelHintVerified: '已核实｜绝不可被诱骗跨出铺门！注意核对窗外天气与对方说辞是否矛盾。',
    steps: [],
    failNote: ''
  },
  trap_d2_clerk: {
    id: 'trap_d2_clerk',
    day: 2,
    client: '自称「镇府夜班办事员」',
    title: '加急合规单 · 补按镇府红印',
    boardTitle: '穿中山装的「夜班办事员」',
    boardDesc: '门外立着一名戴圆框眼镜的干部模样来客，称吴支书派他来补办净宅手续，酬金高达 88 现金。',
    siteTitle: '',
    siteDesc: '',
    siteIntro: '',
    taboo: '不可熄灯离铺。',
    pay: 88,
    ptsReward: 32,
    risk: 1,
    turns: 4,
    guestArt: 'masked_wu',
    isTrap: true,
    storyBeats: [
      {
        speaker: '「夜班办事员」',
        cue: '来客穿着挺括却沾满冷土的灰制服，鼻梁上的镜片一片死白，呼吸声全无。',
        line: '「掌柜，吴支书叫我连夜来通知你：白天那张合规净宅合同漏盖了镇府公章，今夜补签完立刻拨 88 块补贴，还免你今后所有抽查。」'
      },
      {
        speaker: '「夜班办事员」',
        cue: '他把公文包抱得死紧，既不掏合同也不肯在铺里灯光下多站一秒。',
        line: '「替身纸牌不急着在柜台办。公章锁在后巷旧公所里，离你铺子就拐两个弯，三分钟就能走个来回。」'
      },
      {
        speaker: '「夜班办事员」',
        cue: '他的脖子怪异地朝左歪了三十度，唇角僵硬地咧开。',
        line: '「只是镇里避嫌——**掌柜你先把铺里红灯全吹熄，空手跟我去后巷旧公所当面按个血手印**，别磨蹭，快出来吧……」'
      }
    ],
    trapClueHint: '【识破破绽】旧公所早荒废多年，他竟让你熄灭铺灯、空手去后巷按「血手印」——分明是借皮诱杀诡！',
    trapKillTitle: '后巷荒所 · 诱杀毙命',
    trapKillNarrative: '你刚吹熄红灯踏入后巷转角，那「办事员」背后的灰制服倏然塌成一张干瘪人皮，无数冰冷纸手从砖墙暗影里伸出将你拖入无光死巷……',
    trapExposeText: '你当面喝破后巷早已没了公所、更绝不熄灯离铺！那「办事员」的圆框眼镜「啪」地裂成两半，化作一阵黑灰狂风仓皇逃散（识破诱杀：纸火点 +6，阴气 −1）。',
    intelHintUnverified: '系统提示｜夜里酬金高得反常的急单往往暗藏杀机，务必听完细辨破绽。',
    intelHintVerified: '已核实｜凡诱导吹灯离铺、去荒僻后巷按印者，皆为诱杀陷阱！',
    steps: [],
    failNote: ''
  },
  trap_d3_cameraman: {
    id: 'trap_d3_cameraman',
    day: 3,
    client: '自称「阿杰的摄影搭档」',
    title: '夜拍急单 · 替阿杰送大红灯',
    boardTitle: '举着黑屏手机的「摄影搭档」',
    boardDesc: '一名连帽衫青年急切拍门，说阿杰在后院枯井边拍到爆款素材，出高价请你亲送一盏大灯过去。',
    siteTitle: '',
    siteDesc: '',
    siteIntro: '',
    taboo: '不可随声出后门。',
    pay: 82,
    ptsReward: 30,
    risk: 1,
    turns: 4,
    guestArt: 'ajie_night',
    isTrap: true,
    storyBeats: [
      {
        speaker: '「摄影搭档」',
        cue: '门外青年把连帽拉得很低，手里高举着一台屏幕漆黑的智能手机。',
        line: '「掌柜快救急！我是阿杰的搭档，他刚在铺子后院枯井旁边拍大夜戏，三脚架卡住了，灯也灭了，急需你拎盏红灯去打光！」'
      },
      {
        speaker: '「摄影搭档」',
        cue: '他语速快得像背稿，双脚死死钉在阴暗檐角，怎么也不肯露正脸。',
        line: '「只要你亲自拎灯去井边照两分钟，赞助商直接结你 82 块现钱，系统也算你成单，比应付屋里那破纸人划算多了！」'
      },
      {
        speaker: '「摄影搭档」',
        cue: '漆黑的手机听筒忽然响起毫无起伏、不断循环的阿杰原声，与他咧开的嘴型完全对不上。',
        line: '「『**别管屋里那盏灯了，快出来吧、快出来吧、快出来吧……**』听见没？阿杰在井边喊你呢，**跨出后门三步就到**！」'
      }
    ],
    trapClueHint: '【识破破绽】手机黑屏却循环复读同一句「快出来吧」，还哄你丢下屋里纸人去后院枯井——纯粹是录声诱杀诡！',
    trapKillTitle: '后院枯井 · 诱杀毙命',
    trapKillNarrative: '你刚拎灯迈出后门三步，手机里的复读声戛然而止。湿冷的井口不知何时挪到了脚边，一只惨白纸手猛地攥住你的脚踝将你扯进漆黑深井……',
    trapExposeText: '你冷笑戳穿他手里不过是一台死机录音的空壳，当场落死门栓！黑屏手机发出一声刺耳电流爆鸣，门外连帽身影瞬间塌成一滩黑墨（识破诱杀：纸火点 +6，阴气 −1）。',
    intelHintUnverified: '系统提示｜真诡客守规矩在铺内了结，诱杀诡最爱借熟人名义催你出门。',
    intelHintVerified: '已核实｜听到循环失真语音与「去后院枯井」的催促，立刻识破拒接！',
    steps: [],
    failNote: ''
  },
  trap_d4_ferryman: {
    id: 'trap_d4_ferryman',
    day: 4,
    client: '浑身滴水的「渡口挑夫」',
    title: '渡口重金单 · 江边亲烧引路船',
    boardTitle: '留着反向湿脚印的「渡口挑夫」',
    boardDesc: '一名披蓑衣、浑身滴水的汉子拍门，称江口翻船急求你带纸船随他去水边亲手焚化，重金 90 现金。',
    siteTitle: '',
    siteDesc: '',
    siteIntro: '',
    taboo: '不可随客赴江边浅水。',
    pay: 90,
    ptsReward: 34,
    risk: 2,
    turns: 4,
    guestArt: 'umbrella',
    isTrap: true,
    storyBeats: [
      {
        speaker: '「渡口挑夫」',
        cue: '湿透的蓑衣往下淌着腥臭江水，门外石板上竟留着一串**鞋尖朝外而非朝里**的诡异湿脚印。',
        line: '「掌柜行行好！渡口那边刚翻了乌篷船，主家急得要命，托我重金请你扎一只引路纸船，90 块现钱马上结清！」'
      },
      {
        speaker: '「渡口挑夫」',
        cue: '几根发黑发烂的水草顺着他衣领滑出来，他却浑然不觉。',
        line: '「老船工都说你手艺灵，我认得路，半炷香工夫就能带你走个来回，绝不耽误你天亮开铺。」'
      },
      {
        speaker: '「渡口挑夫」',
        cue: '他伸出泡得浮肿惨白的手掌，声音里透出藏不住的渴求。',
        line: '「只是这船在铺门口烧不认主——**掌柜你必须随我走到江边芦苇荡，光脚踩进浅水里亲自点着**，水里头有人等着接你呢……」'
      }
    ],
    trapClueHint: '【识破破绽】鞋印朝外、衣领挂腐水草，还让你光脚踩进夜江浅水——分明是拉替死鬼的水诡诱杀！',
    trapKillTitle: '芦苇浅滩 · 诱杀毙命',
    trapKillNarrative: '你刚踏进冰冷江水半寸，水面下瞬间涌出十数只浮肿苍白的手死死拽住双腿！回望岸上，那「挑夫」正站在雾里朝你缓缓鞠躬，江雾彻底合拢……',
    trapExposeText: '你点破他衣领里的腐草与反向脚印，严词拒绝踏出铺门半步！门外「挑夫」发出一声咕噜水泡般的怨嚎，整个人化作一滩腥冷江水退入暗巷（识破诱杀：纸火点 +6，阴气 −1）。',
    intelHintUnverified: '系统提示｜留心来客的细节动作与「请你亲赴某地」的诡异要求。',
    intelHintVerified: '已核实｜任何叫你去江边芦苇荡亲烧纸船的夜客，必是索命水诡！',
    steps: [],
    failNote: ''
  },
  trap_d5_messenger: {
    id: 'trap_d5_messenger',
    day: 5,
    client: '自称「邻铺跑腿小伙」',
    title: '同行救急单 · 荒祠代抬纸轿',
    boardTitle: '颊沾胭脂的「邻铺小伙」',
    boardDesc: '门外站着一名自称隔壁红白铺伙计的少年，称邻铺失火急缺人手，愿出 105 现钱请你去荒祠搭手抬纸轿。',
    siteTitle: '',
    siteDesc: '',
    siteIntro: '',
    taboo: '不可赴荒祠充数抬轿。',
    pay: 105,
    ptsReward: 40,
    risk: 2,
    turns: 4,
    guestArt: 'paper_boy',
    isTrap: true,
    storyBeats: [
      {
        speaker: '「邻铺小伙」',
        cue: '他穿着不合身的旧褂子，冷白的脸颊粉尘底下隐约透出两点工笔朱砂圆腮红。',
        line: '「掌柜快搭把手！隔壁红白铺后院走水了，我们东家急着交一顶大纸轿，愿出 105 块现钱加两份口粮请你帮忙！」'
      },
      {
        speaker: '「邻铺小伙」',
        cue: '你抬眼往窗外望去，隔壁屋檐安静漆黑，哪有半分火光烟气。',
        line: '「东家已经在镇北荒祠等着了，纸轿早扎得差不多，就差一位懂行的掌柜去搭把手。」'
      },
      {
        speaker: '「邻铺小伙」',
        cue: '他忽然咧开一个僵硬的纸人笑，嗓音尖细如竹片摩擦。',
        line: '「**不用带纸料，把你自己带去就行。**荒祠轿夫刚巧少了一个活人抬前杠，**你迈出门槛我就引路……**」'
      }
    ],
    trapClueHint: '【识破破绽】隔壁根本没起火，他脸上还透着纸人圆腮红，竟说「不用带纸料，把你自己带去充活人轿夫」——必死诱杀！',
    trapKillTitle: '镇北荒祠 · 诱杀毙命',
    trapKillNarrative: '刚随他迈入荒祠门槛，红纸轿帘无风自掀，三具惨白纸轿夫齐齐扭头盯住你。冰冷的竹杠沉重压上肩头，你的皮肤瞬间褪成宣纸般僵白……',
    trapExposeText: '你戳穿隔壁根本无火、更不缺活人抬杠，反手拍稳门板！那「小伙」的笑脸「嘶啦」裂成纸片，打着旋儿被阴风吹得无影无踪（识破诱杀：纸火点 +6，阴气 −1）。',
    intelHintUnverified: '系统提示｜天上不会掉 105 现钱的便宜急单，听完原委再决定接不接。',
    intelHintVerified: '已核实｜谎称邻铺失火、诱你去镇北荒祠抬轿者必是假纸童诱杀！',
    steps: [],
    failNote: ''
  },
  trap_d6_matchmaker: {
    id: 'trap_d6_matchmaker',
    day: 6,
    client: '戴朱砂花的「夜迎喜婆」',
    title: '重金喜单 · 巷口替轿点喜烛',
    boardTitle: '脚不沾地的「迎亲喜婆」',
    boardDesc: '一名鬓插朱砂绒花的喜婆笑盈盈立在门外，称迎亲花轿停在巷口熄了烛，愿出 145 现钱请你出门点烛。',
    siteTitle: '',
    siteDesc: '',
    siteIntro: '',
    taboo: '不可出门迎轿揭帘。',
    pay: 145,
    ptsReward: 54,
    risk: 2,
    turns: 3,
    guestArt: 'paper_bride',
    isTrap: true,
    storyBeats: [
      {
        speaker: '「迎亲喜婆」',
        cue: '她一身暗红袄裙，嘴里说着吉利话，绣花鞋跟却始终悬在青石台阶半寸之上。',
        line: '「哎哟大喜大喜！北巷十里红妆的喜轿刚停在路口，轿门上的龙凤喜烛叫阴风吹灭了，特请手艺最好的掌柜去续个火！」'
      },
      {
        speaker: '「迎亲喜婆」',
        cue: '她扬起一只沉甸甸的朱砂红包，声音里夹着空洞的木头敲击回响。',
        line: '「只需走出去十步远，给轿子点上烛便给 145 块大红包，顺带免了今夜顶格凶煞，多省事呀！」'
      },
      {
        speaker: '「迎亲喜婆」',
        cue: '她的声音骤然叠成两个尖利重叠的女声，袖中伸出一截干枯红绳。',
        line: '「**红盖头就在巷口等你呢，掌柜把门彻底敞开，一步步走过来亲自揭轿帘、拜天地吧……**」'
      }
    ],
    trapClueHint: '【识破破绽】鞋跟悬空、双声重叠，还诱你敞门走出去亲自「揭轿帘拜天地」——这是抢新郎的必死诱杀诡！',
    trapKillTitle: '无声花轿 · 诱杀毙命',
    trapKillNarrative: '你刚迈出铺门十步，四面八方骤然响起震耳欲聋的无声唢呐，血红轿帘猛地将你裹入其中！天亮时北巷空无一物，铺里只剩一张写着你生辰的合卺婚书。',
    trapExposeText: '你厉声喝退门外邪祟，死守门内绝不踏出半步！喜婆的笑声骤然化作凄厉唢呐哀鸣，连同门外红雾一齐消散（识破诱杀：纸火点 +6，阴气 −1）。',
    intelHintUnverified: '系统提示｜顶格之夜凶险加倍，千万别被高赏金的「省事捷径」骗出门！',
    intelHintVerified: '已核实｜正主只在铺内履约，凡诱你敞门走十步去揭轿帘的皆为致命诱杀！',
    steps: [],
    failNote: ''
  },
  trap_d10_drummer: {
    id: 'trap_d10_drummer',
    day: 10,
    client: '自称「庙会催场锣手」',
    title: '庙会急修单 · 城隍庙后台修龙头',
    boardTitle: '提着无声铜锣的「催场锣手」',
    boardDesc: '一名戴古戏面的高大锣手急拍铺门，称庙会龙头断须，愿出 160 重金请你立刻随他去庙后抢修。',
    siteTitle: '',
    siteDesc: '',
    siteIntro: '',
    taboo: '不可熄灯钻暗巷。',
    pay: 160,
    ptsReward: 62,
    risk: 2,
    turns: 3,
    guestArt: 'temple_deity',
    isTrap: true,
    storyBeats: [
      {
        speaker: '「催场锣手」',
        cue: '他手里铜锣狠狠一敲，却诡异地没发出半点金属鸣响，只扬起一阵冰冷纸灰。',
        line: '「掌柜快跟我走！城隍庙后台那只游神龙头刚崩了龙须，会首急得团团转，开价 160 现金请你马上过去补两笔！」'
      },
      {
        speaker: '「催场锣手」',
        cue: '你瞥向窗棂——外头长街黑漆漆死寂一片，半个活人灯火也没有。',
        line: '「外头活人戏台亮堂着呢、热闹得很！补完龙头还能顺带免了今夜阴市借路，全镇都念你的好！」'
      },
      {
        speaker: '「催场锣手」',
        cue: '古纸面下的眼孔渗出两点漆黑墨汁，他死死扣住门框。',
        line: '「**快把铺里三盏红灯全吹灭，跟我钻进庙后暗巷**，大伙儿都在黑处等你一个人呢……」'
      }
    ],
    trapClueHint: '【识破破绽】敲锣无声、长街死寂他却谎称热闹，还催你吹灭三盏红灯钻庙后暗巷——绝非活人，乃庙会诱杀诡！',
    trapKillTitle: '庙后暗巷 · 诱杀毙命',
    trapKillNarrative: '你刚吹灭铺灯随他拐进庙后无光窄巷，四面高墙瞬间挂满密密麻麻的无眼纸面具。鼓点轰鸣中，你的影子被生生钉死在青砖墙上……',
    trapExposeText: '你冷眼识破他敲锣无声、长街空无活人，死护铺里红灯绝不迈步！那假锣手发出尖锐纸裂声，顷刻化作满地碎彩纸（识破诱杀：纸火点 +6，阴气 −1）。',
    intelHintUnverified: '系统提示｜庙会之夜阴市混杂，听清对方言辞与窗外实景是否相悖！',
    intelHintVerified: '已核实｜庙会夜切忌吹灯离铺！凡谎称外头热闹催你钻暗巷者必为诱杀！',
    steps: [],
    failNote: ''
  },
  trap_d14_system_mimic: {
    id: 'trap_d14_system_mimic',
    day: 14,
    client: '自称「系统提前接引使」',
    title: '【特批捷径】免终审提前离镇单',
    boardTitle: '手持空白红笺的「接引使」',
    boardDesc: '一名长衫老者手持仿若系统界面的朱砂红笺立于门外，声称你的生存指标已提前达标，今夜即可领赏回家。',
    siteTitle: '',
    siteDesc: '',
    siteIntro: '',
    taboo: '不可轻信伪造系统捷径走出镇口。',
    pay: 200,
    ptsReward: 99,
    risk: 1,
    turns: 4,
    guestArt: 'old_accountant',
    isTrap: true,
    storyBeats: [
      {
        speaker: '「系统接引使」',
        cue: '他托着一张画着歪斜朱砂框的红纸笺，纸面隐隐散出一股潮湿墓土腥气。',
        line: '「恭喜穿越者！后台复核完毕，你的纸火经营指标已经超额达标，特批免去十五日终审，额外补发 200 现金与 99 纸火点！」'
      },
      {
        speaker: '「系统接引使」',
        cue: '他圆框眼镜片里漆黑一片，竟完全映不出你屋里三盏红灯的火光。',
        line: '「离开诡异小镇的通道已经在镇口牌坊白雾里提前打开了，再磨蹭到天亮可就关门了。」'
      },
      {
        speaker: '「系统接引使」',
        cue: '那张红纸笺在他指尖悄然褪成一张空白黄表纸，他压低声音连声催促。',
        line: '「**别管那本破账了，现在就扔下门闩、空手走出镇口白雾**，跨过去一步就能回到原来的世界……」'
      }
    ],
    trapClueHint: '【识破破绽】镜片不映灯火、红笺散发墓土味且褪成空白黄表纸，还诱你扔下账本走入镇口白雾——冒充系统的终极诱杀诡！',
    trapKillTitle: '镇口浓雾 · 诱杀毙命',
    trapKillNarrative: '你扔下账本一步踏入镇口白雾，身后的纸火铺红灯瞬间彻底熄灭。白雾里哪有什么归途，只有无数双苍白纸手悄无声息合拢上来，把你留成了下一任纸人……',
    trapExposeText: '你一眼看穿他手里褪色的空白黄表纸，冷声关门守住灯火！假接引使发出不甘的尖笑，身影如墨水般迅速洇散在月色里（识破诱杀：纸火点 +6，阴气 −1）。',
    intelHintUnverified: '系统提示｜真正的终审只会在铺内灯下清算，切莫轻信天降捷径！',
    intelHintVerified: '已核实｜凡冒充系统诱你走出镇口白雾的，都是专挑终局前下手的致命伪装诡！',
    steps: [],
    failNote: ''
  }
};

export const ALL_NIGHT_ORDERS: Record<string, NightOrderDef> = {
  ...NIGHT_ORDERS,
  ...NIGHT_TRAP_ORDERS
};

export function getNightOrderById(id: string | null | undefined): NightOrderDef | undefined {
  if (!id) return undefined;
  return ALL_NIGHT_ORDERS[id];
}

export function getScheduledNightOrder(day: number, h: number): NightOrderDef {
  if (day === 1) return NIGHT_ORDERS.n1_alley_sendoff;
  if (day === 2) return NIGHT_ORDERS.n2_wu_plain;
  if (day === 3) return NIGHT_ORDERS.n3_third_lamp;
  if (day === 4) return h >= 12 ? NIGHT_ORDERS.n4_watched_door : NIGHT_ORDERS.n4_cross_alley;
  if (day === 5) return NIGHT_ORDERS.n5_old_account;
  if (day === 6) return NIGHT_ORDERS.n6_peak_bride;
  if (day === 7) return NIGHT_ORDERS.n7_mirror_guest;
  if (day === 8) return NIGHT_ORDERS.n8_shadow_tailor;
  if (day === 9) return NIGHT_ORDERS.n9_lantern_child;
  if (day === 10) return NIGHT_ORDERS.n10_temple_fair_peak;
  if (day === 11) return NIGHT_ORDERS.n11_ash_collector;
  if (day === 12) return NIGHT_ORDERS.n12_drowned_ferry;
  if (day === 13) return NIGHT_ORDERS.n13_peak_empty_chair;
  if (day === 14) return NIGHT_ORDERS.n14_quiet_borrower;
  return NIGHT_ORDERS.n15_final_ledger;
}

export function getScheduledTrapOrder(day: number): NightOrderDef {
  if (day === 1 || day === 7) return NIGHT_TRAP_ORDERS.trap_d1_niece;
  if (day === 2 || day === 8) return NIGHT_TRAP_ORDERS.trap_d2_clerk;
  if (day === 3 || day === 9) return NIGHT_TRAP_ORDERS.trap_d3_cameraman;
  if (day === 4 || day === 12) return NIGHT_TRAP_ORDERS.trap_d4_ferryman;
  if (day === 5 || day === 11) return NIGHT_TRAP_ORDERS.trap_d5_messenger;
  if (day === 6 || day === 13) return NIGHT_TRAP_ORDERS.trap_d6_matchmaker;
  if (day === 10) return NIGHT_TRAP_ORDERS.trap_d10_drummer;
  return NIGHT_TRAP_ORDERS.trap_d14_system_mimic;
}

/**
 * 生成今夜夜账单列表（正规诡异单 + 暗藏的诱杀诡异单）。
 * 按单双/周期交错排位，不固定把陷阱放在第二个，让玩家必须听完角色讲述再判断！
 */
export function buildTonightNightOrders(day: number, h: number): string[] {
  const realOrder = getScheduledNightOrder(day, h);
  const trapOrder = getScheduledTrapOrder(day);
  const trapFirst = day === 2 || day === 4 || day === 6 || day === 9 || day === 12 || day === 14;
  return trapFirst ? [trapOrder.id, realOrder.id] : [realOrder.id, trapOrder.id];
}
