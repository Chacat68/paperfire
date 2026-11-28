import type { NightOrderDef } from './types';

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
    guestArt: 'ferry_ghost',
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
        line: '「**快把铺里双红灯和平安烛全吹灭，跟我钻进庙后暗巷**，大伙儿都在黑处等你一个人呢……」'
      }
    ],
    trapClueHint: '【识破破绽】敲锣无声、长街死寂他却谎称热闹，还催你吹灭红灯平安烛钻庙后暗巷——绝非活人，乃庙会诱杀诡！',
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
        cue: '他圆框眼镜片里漆黑一片，竟完全映不出你屋里双红灯与平安烛的火光。',
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
  },
  trap_d7_stagehand: {
    id: 'trap_d7_stagehand',
    day: 7,
    client: '自称「戏班后台掌镜管事」',
    title: '戏班重金单 · 空戏楼修补古镜台',
    boardTitle: '提戏灯的「后台管事」',
    boardDesc: '一名穿旧绸褂的管事站在门外，称戏班今夜丢了压台铜镜，愿出 108 现钱请你携纸偶去戏楼后台对镜点睛。',
    siteTitle: '',
    siteDesc: '',
    siteIntro: '',
    taboo: '不可赴空戏楼直视铜镜。',
    pay: 108,
    ptsReward: 38,
    risk: 2,
    turns: 4,
    guestArt: 'opera_ghost',
    isTrap: true,
    storyBeats: [
      {
        speaker: '「后台管事」',
        cue: '他袖口露出半面冰凉水银镜，镜光晃过他自己胸口时，里面竟映不出他的头影。',
        line: '「掌柜久仰！戏班白天才请你补过凤冠，今夜后台镜台裂了缝，班主开价 108 块现钱，请你带支朱砂笔过去补个眼！」'
      },
      {
        speaker: '「后台管事」',
        cue: '远处旧戏楼方向一片死黑，连半声胡琴锣鼓都没有。',
        line: '「台前正唱着大轴戏热闹得很，走过去不过半条街，补完还能拿双份纸火赏，何必守在冷清柜台里？」'
      },
      {
        speaker: '「后台管事」',
        cue: '他忽然把镜面猛地转向门缝，声音像是从空铜盆里传出来。',
        line: '「**别拿白纸蒙镜子，跨出门槛跟我进戏楼后台，对着镜里的自己睁大眼点上左瞳**——镜里那位等你换身等很久了……」'
      }
    ],
    trapClueHint: '【识破破绽】镜里映不出他自己的头影、戏楼方向明明死寂无声，还诱你跨出门槛直视镜中自己点左瞳——典型的借镜夺舍诱杀诡！',
    trapKillTitle: '空戏楼镜台 · 诱杀毙命',
    trapKillNarrative: '你刚跨进漆黑空戏楼对着镜台举笔，镜中的「自己」先你一步抬手扣住了你的手腕。冷光一闪，你被生生拉入冰冷镜背，再也发不出半点声息……',
    trapExposeText: '你当场点破他袖中铜镜空无头影、戏楼早已散场，冷声扣紧门闩！那假管事发出一声瓷裂般的怪笑，化作碎银冷雾散尽（识破诱杀：纸火点 +6，阴气 −1）。',
    intelHintUnverified: '系统提示｜夜里借戏班名义叫你离铺的来客，多半藏着镜中杀机。',
    intelHintVerified: '已核实｜戏班夜间早已散台，凡诱你去空戏楼照镜点瞳者必是诱杀！',
    steps: [],
    failNote: ''
  },
  trap_d8_seamstress: {
    id: 'trap_d8_seamstress',
    day: 8,
    client: '自称「柳记裁缝铺小学徒」',
    title: '街坊急求 · 暗巷替柳裁缝量纸衣',
    boardTitle: '抱生锈铁剪的「裁缝学徒」',
    boardDesc: '一名低头抱剪的瘦小身影急叩木门，称柳裁缝在街尾赶工扎伤了手，愿出 112 现金请你拿铁剪出门帮量寿衣尺寸。',
    siteTitle: '',
    siteDesc: '',
    siteIntro: '',
    taboo: '不可携铁剪随客进暗巷。',
    pay: 112,
    ptsReward: 40,
    risk: 2,
    turns: 4,
    guestArt: 'night_auntie',
    isTrap: true,
    storyBeats: [
      {
        speaker: '「柳记学徒」',
        cue: '她怀里抱着一把滴着暗红锈水的铁裁剪，十根手指关节竟怪异地朝手背外翻。',
        line: '「掌柜快救救急！我是柳裁缝新收的小学徒，师父夜里在巷尾老屋赶制寿衣扎破了手指，急请你带着纸剪过去搭把手！」'
      },
      {
        speaker: '「柳记学徒」',
        cue: '你明明记得白天柳记裁缝铺向来只柳裁缝一人守店，何曾有过学徒。',
        line: '「师父说了，事急从权，给你 112 块现钱外加一卷上好朱砂线，只要你肯亲自走一趟就行。」'
      },
      {
        speaker: '「柳记学徒」',
        cue: '铁剪刃口「咔嚓」空剪了两下，她脖颈里露出一圈歪扭的黑棉线缝痕。',
        line: '「**快把柜台那把老铁剪抓在手里，迈出门槛跟我进巷尾暗屋**——剪刀借我量一量你脖子的寸数，一剪子就合身……」'
      }
    ],
    trapClueHint: '【识破破绽】柳裁缝向来独身守铺从无学徒，她指节反弯、颈带缝线，还诱你抓着铁剪进暗巷「量脖子寸数」——分明是拼尸诱杀诡！',
    trapKillTitle: '暗巷裁衣屋 · 诱杀毙命',
    trapKillNarrative: '你刚提剪踏入巷尾暗屋，那「学徒」的头颅便顺着颈间黑线滚落在地。四面墙上挂满大小不一的纸衣，冰冷剪刃瞬间朝你合拢……',
    trapExposeText: '你冷声戳穿柳记铺子根本没收过学徒，更绝不持剪出门！那「学徒」周身黑线寸寸崩断，散成一地碎布残纸（识破诱杀：纸火点 +6，阴气 −1）。',
    intelHintUnverified: '系统提示｜熟悉镇上街坊底细，便能一眼戳穿伪装熟人的破绽。',
    intelHintVerified: '已核实｜柳记裁缝铺并无学徒，凡抱铁剪诱你出门量身者必是诱杀诡！',
    steps: [],
    failNote: ''
  },
  trap_d9_watchman: {
    id: 'trap_d9_watchman',
    day: 9,
    client: '自称「庙会巡夜打更人」',
    title: '庙会急差 · 沿街换挂白纸灯',
    boardTitle: '敲空梆子的「巡夜更夫」',
    boardDesc: '一名戴破毡帽的更夫在门外敲梆，称庙会前夜须撤下红灯换挂白灯，愿出 118 现钱请你出门一起沿街换灯。',
    siteTitle: '',
    siteDesc: '',
    siteIntro: '',
    taboo: '不可吹灭铺里红灯出门挂白灯。',
    pay: 118,
    ptsReward: 42,
    risk: 2,
    turns: 4,
    guestArt: 'masked_wu',
    isTrap: true,
    storyBeats: [
      {
        speaker: '「巡夜更夫」',
        cue: '他手里敲着的竹梆裂着大缝，击打声听起来却像两截干枯骨头互相碰撞。',
        line: '「梆——梆——！掌柜听令，明晚大庙会改规矩了，会首叫沿街铺子今夜提前撤掉红灯笼，统统换挂白纸灯，工钱 118 块！」'
      },
      {
        speaker: '「巡夜更夫」',
        cue: '他毡帽檐压得遮住整张脸，袖口里飘出一股潮冷坟土味。',
        line: '「别信什么无影提灯童，那都是骗人的小鬼。把你铺里这几盏红灯一吹，跟我沿青石街挂完白灯便算完工。」'
      },
      {
        speaker: '「巡夜更夫」',
        cue: '他举起一盏写着你名字的惨白纸灯，枯骨般的手爪扣住门框。',
        line: '「**快用嘴把屋里红灯一口气全吹灭，跨出铺门接过这盏白灯**，我敲着三更梆送你上路……」'
      }
    ],
    trapClueHint: '【识破破绽】敲梆如撞骨、逼你用嘴吹灭红灯、还递来写着你名字的丧事白灯笼——这是专趁庙会前夜灭灯害命的诱杀诡！',
    trapKillTitle: '青石冷街 · 诱杀毙命',
    trapKillNarrative: '红灯一灭，你刚接过白灯踏上青石街，整条长街瞬间化作无边白幡丧阵。梆声越敲越急，你的影子被白灯火光吞噬殆尽……',
    trapExposeText: '你厉声喝破庙会绝无吹红灯挂白灯之理，死守红灯不灭！假更夫的竹梆应声断成两截白骨，在冷风中化作青烟消散（识破诱杀：纸火点 +6，阴气 −1）。',
    intelHintUnverified: '系统提示｜庙会前夜鱼龙混杂，任何让你吹灭红灯的差事都暗藏杀机！',
    intelHintVerified: '已核实｜庙会借路专认门楣红灯与平安烛，凡催你吹灯出门挂白灯的假更夫必是诱杀！',
    steps: [],
    failNote: ''
  },
  trap_d11_sweeper: {
    id: 'trap_d11_sweeper',
    day: 11,
    client: '自称「庙会清街扫灰老翁」',
    title: '庙后净街单 · 镇外共倒积灰',
    boardTitle: '拎漏底竹筐的「扫灰翁」',
    boardDesc: '一名佝偻老翁拎着竹筐停在门外，称庙会后镇里统一清灰补贴 122 现金，请你抱着香炉随他去镇外倒净旧灰。',
    siteTitle: '',
    siteDesc: '',
    siteIntro: '',
    taboo: '不可捧自家香炉离铺赴镇外。',
    pay: 122,
    ptsReward: 44,
    risk: 2,
    turns: 4,
    guestArt: 'old_accountant',
    isTrap: true,
    storyBeats: [
      {
        speaker: '「扫灰老翁」',
        cue: '他背着的竹筐底早就烂了个大洞，装进去的香灰边走边漏，青石板上却只留下暗红湿印。',
        line: '「咳咳……庙会刚完，镇里雇我连夜收各家香炉里的积灰，肯跟着去倒净的铺子每户补 122 块清街费呢。」'
      },
      {
        speaker: '「扫灰老翁」',
        cue: '屋里香炉的三炷香突然齐齐一弯，青烟拼命往铺子深处躲。',
        line: '「在柜台上分灰算什么净铺？得连香炉一块儿抱出去倒干净，阴气才能一笔勾销。」'
      },
      {
        speaker: '「扫灰老翁」',
        cue: '老翁缓缓抬起头，眼眶里塞满灰白香灰，咧嘴发出沙哑干笑。',
        line: '「**快把镇铺的香炉熄了抱在怀里，跟我走出镇口去乱葬岗深处倒灰**——那里还有一坑温热的新灰等着埋你呢……」'
      }
    ],
    trapClueHint: '【识破破绽】竹筐漏底、脚印渗暗红、眼眶塞满香灰，竟哄你熄掉镇铺香炉去镇外乱葬岗倒灰——妥妥的索命诱杀诡！',
    trapKillTitle: '镇外乱葬岗 · 诱杀毙命',
    trapKillNarrative: '你刚熄炉抱灰走出镇口，四周荒冢同时冒出滚滚灰雾。老翁反手将你推入冰冷灰坑，铺里失去香火庇护的双红灯与平安烛也随之熄灭……',
    trapExposeText: '你一眼识破他漏底竹筐与乱葬岗骗局，牢牢护住柜台香炉！假老翁发出一声闷咳，瞬间塌作一堆被风吹散的冷灰（识破诱杀：纸火点 +6，阴气 −1）。',
    intelHintUnverified: '系统提示｜庙会余灰夜看似平静，切莫轻信诱你熄炉离铺的「清街补贴」。',
    intelHintVerified: '已核实｜真收灰诡只在柜台平分香灰，诱你捧炉去镇外乱葬岗的必是诱杀！',
    steps: [],
    failNote: ''
  },
  trap_d12_boatman: {
    id: 'trap_d12_boatman',
    day: 12,
    client: '自称「老船工家的儿子」',
    title: '江雾急送单 · 码头亲手放纸船',
    boardTitle: '满鞋淤泥的「船工之子」',
    boardDesc: '一名披油布蓑的青年急拍铺门，称白天买船的老船工在江口被雾困住，出 128 现金请你扛纸船随他下码头试水。',
    siteTitle: '',
    siteDesc: '',
    siteIntro: '',
    taboo: '不可回答水深并随客下码头。',
    pay: 128,
    ptsReward: 46,
    risk: 2,
    turns: 4,
    guestArt: 'ferry_ghost',
    isTrap: true,
    storyBeats: [
      {
        speaker: '「船工之子」',
        cue: '他胶鞋上糊着厚厚一层散发腐臭的江底黑淤泥，衣襟里还不断往外渗着冰水。',
        line: '「掌柜快帮忙！我爹白天来你这儿买过压浪纸船，刚才在渡口让大雾困住了，叫我带 128 块现钱请你再扎一艘送去！」'
      },
      {
        speaker: '「船工之子」',
        cue: '他说话时嘴角一直在往外吐白沫般的冷雾，眼神死死黏在你脸上。',
        line: '「对了掌柜，你天天在镇里住着，你说今晚江心那片深潭……水到底有多深呀？」'
      },
      {
        speaker: '「船工之子」',
        cue: '他猛地伸出惨白泡皱的手指拽向门环，声音化作潮水拍岸般的回响。',
        line: '「**别在屋里交船了，先答我水有多深，再扛着纸船跟我走到老码头木栈桥尽头踩水试船**——我爹在水底下等着拉你呢……」'
      }
    ],
    trapClueHint: '【识破破绽】浑身江底腐泥、口吐冷雾，还连番逼问「水有多深」并诱你去老码头踩水——这是拉人填江的水诡诱杀！',
    trapKillTitle: '江雾老码头 · 诱杀毙命',
    trapKillNarrative: '你刚踏上湿滑的木栈桥，脚下木板倏然腐断。无数双冰冷浮肿的江手从雾水下齐齐探出，将你拖入漆黑无底的江心……',
    trapExposeText: '你守口如瓶绝不答水深半字，更断然拒绝对方下码头的诡计！门外假船工发出一声沉闷落水响，化作一滩黑臭江泥退去（识破诱杀：纸火点 +6，阴气 −1）。',
    intelHintUnverified: '系统提示｜江雾之夜切忌回答水深，更不可随湿衣客前往江边码头。',
    intelHintVerified: '已核实｜任何逼问水深、哄你扛船去码头踩水试船的皆为索命水诡！',
    steps: [],
    failNote: ''
  },
  trap_d13_usher: {
    id: 'trap_d13_usher',
    day: 13,
    client: '自称「古戏园引座茶房」',
    title: '堂会重金单 · 街心戏台点客开锣',
    boardTitle: '端凉茶盘的「戏园茶房」',
    boardDesc: '一名搭白毛巾的茶房笑盈盈立于门外，称街心大堂会缺纸偶监场，愿出 155 现金请你出门数清台下看客人数再开锣。',
    siteTitle: '',
    siteDesc: '',
    siteIntro: '',
    taboo: '不可出门清点看客人数。',
    pay: 155,
    ptsReward: 60,
    risk: 2,
    turns: 3,
    guestArt: 'opera_ghost',
    isTrap: true,
    storyBeats: [
      {
        speaker: '「戏园茶房」',
        cue: '他托盘上的两只青花茶碗里盛着浑浊黑水，白毛巾底下露出一张画满油彩却毫无眨眼的纸面。',
        line: '「掌柜大喜！今夜古戏园包了整条街唱大堂会，戏班出 155 块重金请你过去当个监场，顺道免了屋里那场凶煞！」'
      },
      {
        speaker: '「戏园茶房」',
        cue: '他身后的街心一片死寂，只有成排空荡荡的木长凳在月色下排开。',
        line: '「活儿轻省极了，不用你在铺里费神摆三折戏偶，走出去十来步瞧一眼台下就行。」'
      },
      {
        speaker: '「戏园茶房」',
        cue: '托盘里的黑水无风荡出涟漪，他的嗓音陡然尖细如假声花旦。',
        line: '「**掌柜快迈出门槛跟我到戏台正中，挨个把台下太师椅上坐着的看客一、二、三数清楚**——数到最后一位，正巧轮到你入座呢……」'
      }
    ],
    trapClueHint: '【识破破绽】油彩纸面、黑水凉茶，还专挑今夜大忌诱你出门「挨个数清太师椅上的看客」——专坑顶格夜掌柜的必死诱杀！',
    trapKillTitle: '空凳戏台 · 诱杀毙命',
    trapKillNarrative: '你刚跨到街心戏台数出第一声，原本空无一物的长凳瞬间坐满惨白无面的纸人。它们齐刷刷转头朝你鼓掌，一把空太师椅轰然卡死在你身后……',
    trapExposeText: '你一眼识破他专踩今夜「不可数人」死忌，冷面拍死门板绝不迈步！假茶房的青花瓷碗摔成纸灰，身影随凄厉胡琴声彻底溃散（识破诱杀：纸火点 +6，阴气 −1）。',
    intelHintUnverified: '系统提示｜终前顶格之夜切莫贪图省事捷径，谨防专踩当日禁忌的诱杀诡！',
    intelHintVerified: '已核实｜正主只在屋里讨三折戏偶，凡诱你去街心戏台数看客者必是诱杀！',
    steps: [],
    failNote: ''
  },
  trap_d15_old_keeper: {
    id: 'trap_d15_old_keeper',
    day: 15,
    client: '自称「上一任纸火铺老掌柜」',
    title: '【密道逃生】烧账脱身 · 避开终审',
    boardTitle: '满身焦纸灰的「上任老掌柜」',
    boardDesc: '一名佝偻长衫老人急拍木门，自称这间老铺前任穿越者，称终审大账必死无疑，愿带你烧掉账本从后巷密道逃离小镇。',
    siteTitle: '',
    siteDesc: '',
    siteIntro: '',
    taboo: '不可烧毁阴阳总账、弃灯逃离。',
    pay: 220,
    ptsReward: 108,
    risk: 1,
    turns: 4,
    guestArt: 'masked_wu',
    isTrap: true,
    storyBeats: [
      {
        speaker: '「上任老掌柜」',
        cue: '他袖口不断簌簌掉下黑焦纸灰，脖颈处露出一道早已干硬的暗红勒痕，却极力装出关切神情。',
        line: '「小伙子快住手！我就是上一任被困进来的老掌柜！别信那什么十五日终审——纸马童和阴差合账就是为了把你永远扣在这间铺子里！」'
      },
      {
        speaker: '「上任老掌柜」',
        cue: '你瞥向屋里：门楣双红灯与柜台平安烛却在此时亮得格外安稳，反倒是门外他脚下的青石板正渗出冰霜。',
        line: '「我攒了 220 现钱和 108 点漏洞赏金，还在后巷挖通了逃出诡异小镇的密道，今夜子时前正好能带咱俩一块儿回家！」'
      },
      {
        speaker: '「上任老掌柜」',
        cue: '他干枯发黑的手死死抠住门缝，嘴角咧到耳根，露出藏不住的贪婪嘶鸣。',
        line: '「**趁终审还没落印，快把你手里的阴阳总账扔进火盆烧个精光，吹灭双红灯与平安烛跟我钻进后巷暗道**——只要账一毁、灯一灭，你就彻底归我替身啦！」'
      }
    ],
    trapClueHint: '【识破破绽】满身焦灰、脚渗寒霜，竟诱你在终审最后一刻「烧毁阴阳总账、熄灯钻暗道」——一旦毁账离灯便彻底失去安全屋庇护，这是终局最阴毒的替身诱杀诡！',
    trapKillTitle: '后巷死道 · 诱杀毙命',
    trapKillNarrative: '阴阳总账化作飞灰、双红灯与平安烛熄灭的刹那，那「老掌柜」发出一声震耳狂笑，身形暴涨成遮天蔽日的焦黑纸影将你彻底吞没。十五日苦撑，终在最后一步功亏一篑……',
    trapExposeText: '你冷笑喝破他的替身诡计，死护阴阳总账、双红灯与平安烛！那假「老掌柜」发出不甘的凄厉嘶吼，在红灯光芒中寸寸燃成黑灰散尽（识破终局诱杀：纸火点 +6，阴气 −1）。',
    intelHintUnverified: '系统提示｜终审之夜万不可毁账离灯！任何煽动逃避清算的来客皆是绝命陷阱！',
    intelHintVerified: '已核实｜真正的终审只在灯下光明合账；自称「上任老掌柜」哄你烧账钻暗道的必是最终诱杀！',
    steps: [],
    failNote: ''
  }
};

export function getScheduledTrapOrder(day: number): NightOrderDef {
  if (day === 1) return NIGHT_TRAP_ORDERS.trap_d1_niece;
  if (day === 2) return NIGHT_TRAP_ORDERS.trap_d2_clerk;
  if (day === 3) return NIGHT_TRAP_ORDERS.trap_d3_cameraman;
  if (day === 4) return NIGHT_TRAP_ORDERS.trap_d4_ferryman;
  if (day === 5) return NIGHT_TRAP_ORDERS.trap_d5_messenger;
  if (day === 6) return NIGHT_TRAP_ORDERS.trap_d6_matchmaker;
  if (day === 7) return NIGHT_TRAP_ORDERS.trap_d7_stagehand;
  if (day === 8) return NIGHT_TRAP_ORDERS.trap_d8_seamstress;
  if (day === 9) return NIGHT_TRAP_ORDERS.trap_d9_watchman;
  if (day === 10) return NIGHT_TRAP_ORDERS.trap_d10_drummer;
  if (day === 11) return NIGHT_TRAP_ORDERS.trap_d11_sweeper;
  if (day === 12) return NIGHT_TRAP_ORDERS.trap_d12_boatman;
  if (day === 13) return NIGHT_TRAP_ORDERS.trap_d13_usher;
  if (day === 14) return NIGHT_TRAP_ORDERS.trap_d14_system_mimic;
  return NIGHT_TRAP_ORDERS.trap_d15_old_keeper;
}
