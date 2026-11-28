import type { NightOrderDef } from './types';

/**
 * 热门诡异短剧 / 规则怪谈 / 民俗惊悚小说灵感打造的 6 位「异闻奇客」夜单
 * 分别在 D2 / D4 / D7 / D8 / D9 / D12 作为「奇诡特邀」现身夜账，
 * 每位均配有专属手绘水墨朱砂立绘、3 幕强张力台词、专属破局招式与收藏信物！
 */
export const POPULAR_NIGHT_ORDERS: Record<string, NightOrderDef> = {
  n_vir_courier: {
    id: 'n_vir_courier',
    day: 2,
    client: '4:44 诡异外卖员',
    characterId: 'midnight_courier',
    title: '【奇诡特邀】午夜四点四十四分 · 绝不差评',
    boardTitle: '提渗血餐箱的雨衣骑手',
    boardDesc: '【异闻奇客】头盔面罩裂着血纹的骑手准点叩门，硬要你在回执上亲手勾选「五星好评」并现扎一双跑不烂的纸草鞋。',
    siteTitle: '五星签收',
    siteDesc: '绝口不问餐箱里装的是什么，先勾「五星好评」稳住骑手，再交付纸草鞋送客！',
    siteIntro: '门外电动车警报无声闪烁，渗着暗红水渍的 #444 号外卖箱散出一股冰冷铁锈味。',
    taboo: '绝对不可点差评，绝对不可询问餐箱里装的是什么。',
    pay: 84,
    ptsReward: 30,
    risk: 2,
    turns: 4,
    specialViral: true,
    guestArt: 'midnight_courier',
    storyBeats: [
      {
        speaker: '4:44 诡异外卖员',
        cue: '黑湿雨衣滴着冷雨，裂纹头盔后一双不眨眼的惨白瞳孔紧盯着你，手腕挂着一只标有「#444」的渗血外卖箱。',
        line: '「叮咚——黄泉加急单已超时四十四秒！前头那户客人没给好评，这会儿已经躺进箱子里凑份量啦……」'
      },
      {
        speaker: '4:44 诡异外卖员',
        cue: '它把一张湿漉漉的黄纸签收单拍在柜台上，指节僵硬地敲了敲「五星好评」那一栏。',
        line: '「掌柜别紧张，我今夜不是来送餐的——我这双腿跑断了底，只求你就在屋里现扎一双跑不烂的纸草鞋，再亲手替我勾个五星好评。」'
      },
      {
        speaker: '4:44 诡异外卖员',
        cue: '外卖箱盖突然自己闷响了一下，它压低嘶哑嗓音叮嘱。',
        line: '「切记莫问箱子里是什么肉，更万万别手滑点差评。办妥现结 84 块加 30 纸火点，再送你一张『四四四免单回执』！」'
      }
    ],
    intelHintUnverified: '异闻预告｜午夜 4:44 的神秘骑手正在老街徘徊，最忌差评与追问餐箱内容。',
    intelHintVerified: '已核实｜给足「五星好评」并在铺内递出纸草鞋即可稳赚高酬，切忌好奇窥箱！',
    steps: [
      { key: 'rite_main', label: '勾五星好评交草鞋' },
      { key: 'done', label: '签收送走骑手' }
    ],
    tokenReward: {
      id: 'courier_receipt',
      name: '四四四免单回执',
      desc: '异闻信物 · 前街杂货与诊所进货立减 3 现金'
    },
    failNote: '骑手盯着空荡荡的评分栏笑了一声，在门外多停了四十四秒才拧油门离去。'
  },

  n_vir_surgeon: {
    id: 'n_vir_surgeon',
    day: 4,
    client: '笑面诡医 · 三号病房',
    characterId: 'smiling_surgeon',
    title: '【奇诡特邀】三号病房诡医 · 讨会呼吸的纸肺',
    boardTitle: '缝线笑口口罩的白袍诡医',
    boardDesc: '【异闻奇客】身披朱砂血点白大褂的医生提着墨黑输液袋登门，递来一粒白药片，讨要一副「会呼吸的纸肺」。',
    siteTitle: '拒药验单',
    siteDesc: '坚决拒吞陌生白药、不让其把脉，隔着柜台以正统纸扎交付纸肺即可脱身！',
    siteIntro: '浓烈的福尔马林混着冷血腥味漫过柜台，手术刀在它指间转出一道惨白寒光。',
    taboo: '不可吞下它递来的白药片，不可伸手让它把脉。',
    pay: 92,
    ptsReward: 34,
    risk: 2,
    turns: 4,
    specialViral: true,
    guestArt: 'smiling_surgeon',
    storyBeats: [
      {
        speaker: '笑面诡医',
        cue: '惨白纱布口罩上用红线歪歪扭扭缝着一道咧到耳根的笑弧，肩头挂着的玻璃吊瓶正一滴一滴渗着黑墨阴液。',
        line: '「别抖呀，掌柜，你的心跳听起来多健康、多新鲜……真像三号病房里刚切下来的那副好零件。」'
      },
      {
        speaker: '笑面诡医',
        cue: '它用镊子夹起一粒惨白药片放到柜台边，语气轻快得令人脊背发凉。',
        line: '「放心，院里规矩严，今晚只买货不拆人。三号床病人嫌原装肺太吵，劳你用净纸扎一副『会呼吸的纸肺』替他换上。」'
      },
      {
        speaker: '笑面诡医',
        cue: '手术刀轻轻敲击玻璃输液瓶，发出清脆叮当声。',
        line: '「规矩写明白了：别吃我给的试吃药，也别把手腕递给我量脉。交妥纸肺，92 现钱、34 点数外加『三号病房通行牌』归你。」'
      }
    ],
    intelHintUnverified: '异闻预告｜镇东废弃诊所的笑面医生今夜出来采买纸扎器官，万不可收它的药。',
    intelHintVerified: '已核实｜拒吞白药、隔台递出纸肺即可安全结清，还能顺手净化一截铺内阴气！',
    steps: [
      { key: 'rite_main', label: '拒药隔台献纸肺' },
      { key: 'done', label: '盖章送离诡医' }
    ],
    tokenReward: {
      id: 'ward_badge',
      name: '三号病房通行牌',
      desc: '异闻信物 · 扫灰净铺与城隍堂敬香额外洁净 +1'
    },
    failNote: '笑面诡医遗憾地收起手术刀，临走前多看了你的胸口两眼，铺里冷得像停尸房。'
  },

  n_vir_senior: {
    id: 'n_vir_senior',
    day: 7,
    client: '四楼琴房 · 血红衣学姐',
    characterId: 'crimson_senior',
    title: '【奇诡特邀】午夜四楼琴房 · 断弦安魂曲',
    boardTitle: '抱断弦曲谱的红衣女学生',
    boardDesc: '【异闻奇客】身穿旧女校蓝襟血红裙摆的长发学姐静立灯外，怀抱染红乐谱，轻声求你糊一架不会断弦的纸提琴。',
    siteTitle: '静听终曲',
    siteDesc: '琴声未歇前绝不可出声打断，闭目听完终曲再献上朱砂弦纸提琴送别！',
    siteIntro: '空荡老街忽然飘来断断续续的小提琴独奏，柜台上的平安烛焰随琴弓微微震颤。',
    taboo: '琴声未停时不可打断，不可回头去数她身后有没有脚印。',
    pay: 96,
    ptsReward: 38,
    risk: 2,
    turns: 4,
    specialViral: true,
    guestArt: 'crimson_senior',
    storyBeats: [
      {
        speaker: '血红衣学姐',
        cue: '乌黑长发遮住半边瓷白脸颊，民国蓝布袄下摆已被朱砂般的暗红浸透，指尖捏着一页沾血的《安魂曲》残谱。',
        line: '「老女校四楼琴房的门锁了三十年，每回拉到最后一节，弦就『崩』地断在指头上……旁人听见琴声就捂耳朵逃命。」'
      },
      {
        speaker: '血红衣学姐',
        cue: '她望向柜台上暖暖燃着的平安蜡烛，漆黑眼底罕见地透出一丝安静。',
        line: '「唯独你这纸火铺肯点着灯听完。我不进你的柜台，只求掌柜用韧竹篾与朱砂丝，替我糊一架绝不断弦的纸提琴。」'
      },
      {
        speaker: '血红衣学姐',
        cue: '半空浮起数道水墨音符，琴弓轻抬。',
        line: '「只守一事：等我这一小节拉完再递琴，莫打断，也莫看我脚下。曲终现付 96 现钱、38 纸火点与『断弦红丝谱』。」'
      }
    ],
    intelHintUnverified: '异闻预告｜午夜四楼琴房传出孤寂琴声，那位红衣学姐似乎正在找手艺最好的纸扎匠。',
    intelHintVerified: '已核实｜她并无主动害人之心，只要静听曲终不打断、正统献纸琴，反而能涤荡铺中阴气！',
    steps: [
      { key: 'rite_main', label: '静听终曲献纸琴' },
      { key: 'done', label: '曲终收谱送别' }
    ],
    tokenReward: {
      id: 'elegy_score',
      name: '断弦红丝谱',
      desc: '异闻信物 · 天亮时若阴气 ≥ 8 自动涤荡阴气 −1'
    },
    failNote: '琴弦再次「崩」然崩断，一声凄厉走音震得窗纸簌簌直抖。'
  },

  n_vir_zodiac_goat: {
    id: 'n_vir_zodiac_goat',
    day: 8,
    client: '十二生肖面具官 · 「人羊」',
    characterId: 'zodiac_goat',
    title: '【奇诡特邀】十日终局规则 · 生肖「人羊」押筹',
    boardTitle: '戴双角白羊面具的裁判官',
    boardDesc: '【异闻奇客】身披墨黑立领大衣的「人羊」面具官摇响黄铜怀表，摊出三张「谎/真/命」规则牌，邀你扎一尊纸裁判并当场押筹！',
    siteTitle: '谎牌博弈',
    siteDesc: '绝不可揭开羊头面具！按规拆穿谎牌赢取额外纸火点，再交妥纸裁判送客！',
    siteIntro: '黄铜怀表「咔哒、咔哒」走过零点，三张猩红规则牌悬停在柜台上方寸许。',
    taboo: '绝不可伸手揭开羊头面具，绝不可在游戏结束前违背自己押下的牌规。',
    pay: 118,
    ptsReward: 46,
    risk: 4,
    turns: 4,
    specialViral: true,
    guestArt: 'zodiac_goat',
    storyBeats: [
      {
        speaker: '生肖面具官 · 「人羊」',
        cue: '修长身影立在月光与红灯交界处，苍白骨质双角羊面额心烙着金色「羊」印，两道朱红眼缝冷冷弯起。',
        line: '「十日轮回又少了一名裁判。掌柜，你在这座规则吃人的小镇里居然靠一支朱砂笔活到现在——有意思，真有意思。」'
      },
      {
        speaker: '生肖面具官 · 「人羊」',
        cue: '它修长戴黑手套的手指一翻，三张写着「谎」「真」「命」的猩红纸牌在半空缓缓旋转，黄铜怀表发出催命般的滴答声。',
        line: '「今夜不玩要命的大局，只下一注小赌：替我扎一尊公正不偏的『听规纸裁判』，再当着我的面挑破那张『谎牌』。」'
      },
      {
        speaker: '生肖面具官 · 「人羊」',
        cue: '羊面下传出克制而优雅的轻笑。',
        line: '「记住，别好奇面具底下长着谁的脸。赢了这局，118 现金、46 纸火点外加一枚『十二生肖铜筹』全归你——敢接这局游戏吗？」'
      }
    ],
    intelHintUnverified: '异闻预告｜戴着双角羊头面具的规则裁判现身老镇，报酬极丰但威压堪比顶格夜！',
    intelHintVerified: '已核实｜千万别揭面具，开局先用专属招式「按规押筹 · 拆穿谎牌」即可立破其势并额外赢取纸火点！',
    steps: [
      { key: 'rite_main', label: '献听规纸裁判' },
      { key: 'done', label: '收筹散局送客' }
    ],
    tokenReward: {
      id: 'zodiac_chip',
      name: '十二生肖铜筹',
      desc: '异闻信物 · 识破门外诱杀诡时额外赢得 +4 纸火点'
    },
    failNote: '黄铜怀表「啪」地合盖，「人羊」留下一句「下回轮回再续」便化雾隐入夜街。'
  },

  n_vir_jester: {
    id: 'n_vir_jester',
    day: 9,
    client: '坐忘红中客 · 骰子戏子',
    characterId: 'zuowang_jester',
    title: '【奇诡特邀】坐忘道红中 · 骗天骗地扎替身',
    boardTitle: '戴麻将「红中」面的疯批道人',
    boardDesc: '【异闻奇客】歪戴白骨麻将「红中」面具的诡异戏子抛着浮空骨骰大笑闯门，扬言要你扎一尊「一模一样的另一个你」替它骗老天爷！',
    siteTitle: '以假乱真',
    siteDesc: '绝不可信他嘴里任何一句发誓！用「反将一军」识破老千手法，再交纸替身赢走巨赏！',
    siteIntro: '三颗白骨骰子在柜台上滴溜溜倒旋不落，红中面具后滚出阵阵癫狂怪笑。',
    taboo: '绝对不可相信他的任何发誓，绝不可与他交换真名。',
    pay: 112,
    ptsReward: 50,
    risk: 4,
    turns: 4,
    specialViral: true,
    guestArt: 'zuowang_jester',
    storyBeats: [
      {
        speaker: '坐忘红中客',
        cue: '一身水墨补丁破道袍猎猎鼓动，脸上斜扣着一块硕大惨白的麻将「红中」面具，面具底缘露出一排咧到腮帮的森白笑牙。',
        line: '「哈哈哈哈！小掌柜别听外面那帮正经诡胡扯——其实我是玉皇大帝派来给你发十万大洋的财神爷！信不信？不信就对了！」'
      },
      {
        speaker: '坐忘红中客',
        cue: '三颗渗血骨骰悬在它掌心凭空旋转，身后破幡上的「骗」字无风自舞。',
        line: '「说正经的——我刚才把天上那位爷骗急眼了，急需一尊跟我七分像、跟你三分像的『替劫纸替身』顶锅！就在你柜台上扎，绝不骗你出门！」'
      },
      {
        speaker: '坐忘红中客',
        cue: '它把红中面具又歪了两分，笑嘻嘻拍下一大摞纸火冥钞。',
        line: '「规矩？哪有什么规矩——只要你不傻到信我发誓、也不把真名写纸人脑门上，这 112 现钱、50 纸火点跟『红中老千骰』就全归你啦！」'
      }
    ],
    intelHintUnverified: '异闻预告｜疯疯癫癫的「红中」面具客正在街头耍骰子，嘴里十句话有十一句是假的。',
    intelHintVerified: '已核实｜千万别被他绕晕，用专属招式「反将一军 · 以假乱真」就能反薅他一大笔纸火点！',
    steps: [
      { key: 'rite_main', label: '献无名替劫纸身' },
      { key: 'done', label: '掀桌送走红中客' }
    ],
    tokenReward: {
      id: 'red_zhong_die',
      name: '红中老千骰',
      desc: '异闻信物 · 白天标准与精工交单额外多收 4 现金'
    },
    failNote: '红中客大笑着化作一地假铜板与漫天红纸屑，气得柜台上的平安烛直跳火花。'
  },

  n_vir_puppets: {
    id: 'n_vir_puppets',
    day: 12,
    client: '镜廊双生 · 提线木偶师',
    characterId: 'puppet_twins',
    title: '【奇诡特邀】镜廊腹语木偶 · 换朱砂提线',
    boardTitle: '怀抱咧嘴小红偶的提线师',
    boardDesc: '【异闻奇客】黑礼服提线师垂手悬着木十字架，臂弯里那只朱砂小红木偶竟自己拧转九十度朝你搭话，讨要一束朱砂韧纸线！',
    siteTitle: '只答执线人',
    siteDesc: '木偶开口千万别接茬！全程只与执线人交涉并换妥朱砂提线，即可平安收单！',
    siteIntro: '细密绷紧的红丝在灯下泛着冷光，小红木偶发出咯咯童音：「掌柜，陪我玩呀……」',
    taboo: '绝对不可直接回答怀中木偶的任何问话，只可与执线人交易。',
    pay: 124,
    ptsReward: 48,
    risk: 4,
    turns: 4,
    specialViral: true,
    guestArt: 'puppet_twins',
    storyBeats: [
      {
        speaker: '双生提线木偶师',
        cue: '修长苍白的木偶师高举木质十字提线架，数根绷直朱砂细线垂落在臂弯里的红衣小木偶肩头——小木偶的头忽然「咯哒」拧转九十度盯着你。',
        line: '「『掌柜的眼睛亮晶晶的，挖下来给我做珠子好不好呀？』——嘘，闭嘴，还没轮到你说话。」'
      },
      {
        speaker: '双生提线木偶师',
        cue: '木偶师神情优雅而疲惫，轻轻扯紧一根快要绷断的红线，小木偶顿时僵回笑脸。',
        line: '「让掌柜见笑了。这小东西的旧提线松了，再不换上你纸火铺特制的『朱砂韧纸线』，明早它就要反过来牵我的手脚啦。」'
      },
      {
        speaker: '双生提线木偶师',
        cue: '小木偶嘴角咧得更大，执线人却诚恳地朝你微微鞠躬。',
        line: '「切记：无论它怎么喊你，你都当没听见，只管跟我交涉换线。办妥奉上 124 现钱、48 纸火点与『双生提线木栓』。」'
      }
    ],
    intelHintUnverified: '异闻预告｜诡异镜廊走出的提线木偶师正四处寻找韧性最强的朱砂纸线。',
    intelHintVerified: '已核实｜千万别理会小木偶的挑衅搭话！用「只答执线人 · 换朱砂线」即可稳稳化解危机！',
    steps: [
      { key: 'rite_main', label: '换妥朱砂韧提线' },
      { key: 'done', label: '收线送走双生客' }
    ],
    tokenReward: {
      id: 'puppet_cross',
      name: '双生提线木栓',
      desc: '异闻信物 · 每夜首次用净纸或喊小栓搭手额外压局 −1'
    },
    failNote: '一根红线在门外悄然崩断，夜风里隐约传回小木偶清脆的咯咯笑声。'
  }
};

export function getScheduledViralNightOrder(day: number): NightOrderDef | undefined {
  return Object.values(POPULAR_NIGHT_ORDERS).find((o) => o.day === day);
}
