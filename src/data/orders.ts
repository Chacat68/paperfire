import type { DayOrderDef } from './types';

export const DAY_ORDERS: DayOrderDef[] = [
  // D1 教学与开铺稳底（活人需求）
  {
    id: 'd1_chen_white',
    dayMin: 1,
    dayMax: 1,
    fixedDay: 1,
    client: '陈婶（活人街坊）',
    title: '陈婶介绍的白事纸扎',
    summary: '老街坊托陈婶来订一对白事花篮与纸灯，要求干净利落。陈婶顺嘴嘀咕：昨夜巷口有人听见纸马蹄声。',
    guestArt: 'chen_auntie',
    hassleNote: '活人日常麻烦：挑剔纸面洁净（需洁净 ≥ 1），交货时别笑场，无性命之虞。',
    storyBeats: [
      {
        speaker: '陈婶',
        cue: '她挎着竹篮快步跨进铺门，伸手先把柜台角浮灰拂了拂。',
        line: '「新掌柜吧？巷尾老周家昨儿夜里走了位老太太，托我一早来订一对素白花篮和两盏引路纸灯。」'
      },
      {
        speaker: '陈婶',
        cue: '她凑近半步，拿帕子抹了把汗，唠叨起规矩来。',
        line: '「那家儿媳妇眼尖得很，嫌糊得毛糙不体面，纸面非得洁净整齐不可。交货时候你也绷住脸，白事上切忌笑场。」'
      },
      {
        speaker: '陈婶',
        cue: '临了她往门外巷口瞥了一眼，压低嗓门补了一句。',
        line: '「对了，昨夜半更有人听见巷口哒哒响，像纸马走夜路。白天咱们活人的活最多麻烦些，天黑后门外敲门的……你可千万听仔细再应！」'
      }
    ],
    payBase: 28,
    apCost: 2,
    needS: 2,
    needC: 1,
    tyReward: 1,
    ptsReward: 6,
    lightTaboo: '白事交货勿笑场',
    priority: 10
  },
  {
    id: 'd1_li_house',
    dayMin: 1,
    dayMax: 15,
    client: '李家新房（活人户主）',
    title: '搬家安神纸符',
    summary: '镇东新楼搬家图个心安，要一叠朱砂安神符和门贴。',
    guestArt: 'day_villager',
    hassleNote: '活人日常麻烦：催着中午前拿去贴门，活计简单稳妥。',
    storyBeats: [
      {
        speaker: '李家户主',
        cue: '他手里攥着一把新房钥匙，进门就四处张望墙上的红灯笼。',
        line: '「掌柜在呢！我家刚在镇东头置了套院子，今儿午时吉辰搬进去，想请一叠朱砂安神符和一对镇宅门贴。」'
      },
      {
        speaker: '李家户主',
        cue: '他不好意思地搓了搓手，笑道。',
        line: '「其实也没碰见啥邪乎事，就是老娘念叨新屋空了半年寒气重，不贴上纸火铺的朱砂符睡不踏实。」'
      },
      {
        speaker: '李家户主',
        cue: '他掏出皱巴巴的零钞拍在柜台上。',
        line: '「麻烦你现折现画一叠，不用多花哨，只要今儿白天能拿走就行，工钱我现结！」'
      }
    ],
    payBase: 18,
    apCost: 2,
    needS: 1,
    tyReward: 1,
    ptsReward: 4,
    priority: 5
  },
  {
    id: 'd1_ajie_prop',
    dayMin: 1,
    dayMax: 1,
    fixedDay: 1,
    client: '阿杰（活人探店博主）',
    title: '阿杰的探店道具纸灯',
    summary: '阿杰举着手机来买一盏老式灯笼拍短视频，口头答应少开闪光灯。',
    guestArt: 'ajie_day',
    hassleNote: '活人日常麻烦：爱凑近乱拍、嘴碎嫌光暗，注意挡住他的闪光灯。',
    storyBeats: [
      {
        speaker: '阿杰',
        cue: '他单手举着稳定器和手机倒退着走进来，镜头扫过横梁纸马。',
        line: '「哈喽家人们！今天带大家探一家民国老纸扎铺——哎掌柜别躲呀，我来照顾你生意，买一盏最有年代感的老式红纸灯！」'
      },
      {
        speaker: '阿杰',
        cue: '他把镜头凑到柜台前，差点开了补光灯，见你皱眉赶紧按掉。',
        line: '「行行行，听老街坊说你这儿讲究多，成品不能开闪光灯直拍。我关掉闪光灯，就拿回民宿当民俗探店道具！」'
      },
      {
        speaker: '阿杰',
        cue: '他嘿嘿一笑，顺手把手机往兜里一揣。',
        line: '「就是我傍晚还要去巷尾拍一段夜景，麻烦掌柜扎结实点儿，风一吹可别散了架。钱马上给你转现金！」'
      }
    ],
    payBase: 20,
    apCost: 2,
    needS: 1,
    tyReward: 1,
    ptsReward: 5,
    lightTaboo: '勿让闪光灯直拍成品',
    priority: 8
  },

  // D2 活人单 + 日接夜交引子
  {
    id: 'd2_wu_cleanse',
    dayMin: 2,
    dayMax: 2,
    fixedDay: 2,
    client: '吴支书（活人干部）',
    title: '吴支书「合规净宅」单',
    summary: '吴支书把一只空烟盒压在合同上，嘴上讲反封建宣传，私下交代今夜有位顶着他名头的「借面客」要来讨纸牌。',
    guestArt: 'wu_day',
    hassleNote: '活人麻烦带夜账牵连：白天先收 28 订金，但会牵出今夜「借面夜客」上门讨牌。',
    storyBeats: [
      {
        speaker: '吴支书',
        cue: '他背着手踱进门，推了推圆框眼镜，先把一只空红烟盒压在柜台合同上。',
        line: '「掌柜，镇里近来狠抓移风易俗，纸扎铺也得讲合规。我这儿有一笔『文化民俗展示道具』的采购单，明面儿上走净宅纸活。」'
      },
      {
        speaker: '吴支书',
        cue: '他回头确认巷口没人，声音陡然压低了两度。',
        line: '「说句私房话：前两天老祠堂拆违，冲撞了点不干净的东西。今夜怕是有位顶着我轮廓、揣着同款空烟盒的『借面客』登门讨替身纸牌。」'
      },
      {
        speaker: '吴支书',
        cue: '他敲了敲桌面，把 28 块订金往前一推。',
        line: '「白天你先把纸底备好、订金拿走。夜里它上门时切记屋里别留录音、别进第三人——要是放了我鸽子，明早镇里抽查可就不好挡了。」'
      }
    ],
    payBase: 28,
    apCost: 2,
    needS: 1,
    needC: 1,
    tyReward: 0,
    ptsReward: 8,
    dayToNight: {
      deposit: 28,
      nightOrderId: 'n2_wu_plain',
      warning: '日接夜交：先收 28 订金；今夜借面客上门若未交付，按普通失败记账且次日抽查。'
    },
    priority: 20
  },
  {
    id: 'd2_zhang_horse',
    dayMin: 2,
    dayMax: 8,
    client: '老张头（活人乡邻）',
    title: '寿诞彩纸马',
    summary: '老张头给家里老人备的彩纸马，料要齐，交得早能多赚点街坊口碑。',
    guestArt: 'day_villager',
    hassleNote: '活人日常麻烦：用料要足（2 纸料），老人挑颜色鲜亮。',
    storyBeats: [
      {
        speaker: '老张头',
        cue: '老爷子拄着枣木拐杖颤巍巍进门，笑得满脸褶子。',
        line: '「掌柜早啊！我家大嫂下月做八十大寿，按老规矩想提前订一匹彩纸马摆在堂屋讨个彩头。」'
      },
      {
        speaker: '老张头',
        cue: '他伸手比划着纸马的高度，絮絮叨叨交代起来。',
        line: '「就是我家婆娘挑剔，马鞍一定要用正朱砂彩纸，竹骨也得多扎两根，省得摆两天塌了腰叫亲戚笑话。」'
      },
      {
        speaker: '老张头',
        cue: '他把布兜里的零钱数了两遍放上柜台。',
        line: '「活儿稍微费点纸料，你看着手头工时决定接不接。要是做得精亮，我在茶馆替你好好夸两天！」'
      }
    ],
    payBase: 22,
    apCost: 2,
    needS: 2,
    tyReward: 1,
    ptsReward: 5,
    priority: 6
  },

  // D3 第三盏灯日间单
  {
    id: 'd3_chen_horse',
    dayMin: 3,
    dayMax: 3,
    fixedDay: 3,
    client: '陈婶（活人街坊）',
    title: '补做一只纸马',
    summary: '陈婶急着取一只纸马，现结 15 现金；但做完这单就腾不出工时再去问柳裁缝今夜纸人的禁忌了。',
    guestArt: 'chen_auntie',
    hassleNote: '活人日常麻烦：催得急且耗 2 工时，若今日工时紧张须权衡是否留工时去街巷打听。',
    storyBeats: [
      {
        speaker: '陈婶',
        cue: '陈婶气喘吁吁推开门，手里拎着一条扯断的纸马缰绳。',
        line: '「哎哟掌柜救急！老周家那只小纸马昨儿叫野猫扑烂了半边身子，下午出殡可不能缺了脚力！」'
      },
      {
        speaker: '陈婶',
        cue: '她看了眼墙角那尊蒙尘的红袍纸人，心里微微打了个突。',
        line: '「我晓得你今儿事多，刚才还看见阿杰脸色发白地说什么『第三盏灯』。可这纸马实在等不得，得辛苦你现扎一只补上。」'
      },
      {
        speaker: '陈婶',
        cue: '她把 15 块现金按在账本边上。',
        line: '「工钱虽然不多，但街坊都看着呢。不过你要是工时紧、急着去街巷找柳裁缝问忌，不接我也去邻村凑合找找。」'
      }
    ],
    payBase: 15,
    apCost: 2,
    needS: 1,
    tyReward: 1,
    ptsReward: 5,
    priority: 15
  },
  {
    id: 'd3_shop_wreath',
    dayMin: 3,
    dayMax: 15,
    client: '镇集红白铺（活人同行）',
    title: '代工两对门联纸花',
    summary: '隔壁铺子赶集忙不过来，转包一对门联纸花，利润平平但稳当。',
    guestArt: 'day_villager',
    hassleNote: '活人日常麻烦：同行转包利薄，但只花 1 工时，适合填缝。',
    storyBeats: [
      {
        speaker: '红白铺伙计',
        cue: '隔壁铺的瘦伙计夹着一卷红白纸样快步跑进柜台。',
        line: '「掌柜搭把手！今儿镇集赶场，我家铺子接爆了单，手头还有两对门联纸花实在糊不过来。」'
      },
      {
        speaker: '红白铺伙计',
        cue: '他挠了挠头，露出些许不好意思的神色。',
        line: '「都是普通的阳间活儿，不讲究啥玄门规矩，就是剪纸花挺磨性子，利润也薄了点，给不了太高工钱。」'
      },
      {
        speaker: '红白铺伙计',
        cue: '他指了指门外吵闹的集市。',
        line: '「胜在只费 1 个工时、1 份纸料，你要是手头闲着，帮衬一把现结 16 块！」'
      }
    ],
    payBase: 16,
    apCost: 1,
    needS: 1,
    tyReward: 0,
    ptsReward: 3,
    priority: 4
  },

  // D4 余波与常规活人经营
  {
    id: 'd4_lin_charm',
    dayMin: 4,
    dayMax: 12,
    client: '林医生诊所（活人医生）',
    title: '诊所门口平安纸挂',
    summary: '林医生嘴上说不信老话，还是来订一对干净利落的平安纸挂，临走提醒近来夜里多湿气。',
    guestArt: 'doctor_lin',
    hassleNote: '活人日常麻烦：医生有洁癖，要求洁净 ≥ 2，但报酬爽快。',
    storyBeats: [
      {
        speaker: '林医生',
        cue: '他穿着浆洗得笔挺的白大褂，推了推眼镜，嫌弃地绕开地上的香灰。',
        line: '「我先声明，我是学西医的，不信镇上那些神神鬼鬼。只是最近来输液的老太太们总说诊所走廊阴冷。」'
      },
      {
        speaker: '林医生',
        cue: '他从口袋里抽出手帕擦了擦指尖，条理分明地提要求。',
        line: '「给我扎一对素雅干净的平安纸挂，挂在候诊门框上安抚病人情绪。注意卫生，洁净度不够我可不要。」'
      },
      {
        speaker: '林医生',
        cue: '他临末抬头看了眼屋檐，语气难得认真。',
        line: '「顺便提醒你，近几天夜里莫名湿气重，我昨晚还看见无雨打黑伞的人路过。你晚上看铺子，别轻易跟外头人搭话。」'
      }
    ],
    payBase: 24,
    apCost: 2,
    needS: 2,
    needC: 2,
    tyReward: 1,
    ptsReward: 6,
    priority: 9
  },
  {
    id: 'd4_relief_self',
    dayMin: 4,
    dayMax: 15,
    client: '路过香客（活人香客）',
    title: '自带料的糊口单',
    summary: '客人自带黄表纸和竹篾来找你扎一对小灯，不耗库存纸料，现结 12 现金。',
    guestArt: 'day_villager',
    hassleNote: '活人救急单：自带纸料零消耗，虽赚得少，但绝无风险。',
    storyBeats: [
      {
        speaker: '路过香客',
        cue: '背着黄布香袋的香客把一捆扎好的竹篾与黄表纸轻放在柜台上。',
        line: '「掌柜打扰了！我从隔壁县来还愿，路上自己买了黄表纸和竹篾，可惜手笨怎么也糊不成灯笼。」'
      },
      {
        speaker: '路过香客',
        cue: '他见你柜台纸料见底，连忙摆手。',
        line: '「不费你铺里的库存纸料，用我自带的料就行。只要扎一对规规矩矩的小香灯，天黑前我拎去庙里烧了。」'
      },
      {
        speaker: '路过香客',
        cue: '他爽快地数出 12 块零钞。',
        line: '「手工费虽不多，好在现钱到手救急。掌柜若得空就帮我扎一对吧！」'
      }
    ],
    payBase: 12,
    apCost: 2,
    needS: 0,
    tyReward: 0,
    ptsReward: 4,
    reliefOnly: true,
    priority: 18
  },

  // D5 顶格预告前夕大单
  {
    id: 'd5_temple_prep',
    dayMin: 5,
    dayMax: 5,
    fixedDay: 5,
    client: '镇里红白理事会（活人）',
    title: '喜事仪仗头批彩灯',
    summary: '镇上要办老式仪仗，理事会先来订一批彩灯。活人嘴里说着喜庆，却提起明晚十里红妆的怪谈。',
    guestArt: 'wu_day',
    hassleNote: '活人麻烦大单：耗 3 工时、3 纸料且须洁净 ≥ 2，忌混用白事旧纸，但收益丰厚。',
    storyBeats: [
      {
        speaker: '理事会执事',
        cue: '执事翻开厚厚一沓红纸清单，指节在柜台上敲得梆梆响。',
        line: '「掌柜，镇里筹办传统民俗喜事仪仗，头批彩灯全交给你这老字号了，要大红烫金、扎得气派！」'
      },
      {
        speaker: '理事会执事',
        cue: '他特意凑近检查你架上的纸料堆。',
        line: '「活儿大，得耗 3 个工时、3 份新料，千万忌讳混用旧白事纸料，不然镇上老人们要挑理。」'
      },
      {
        speaker: '理事会执事',
        cue: '他搓着下巴叹了口气，眼神飘向北巷口。',
        line: '「说来也怪，咱们刚定下喜仪仗，北巷就传起『无轿纸新娘』的旧怪谈……不管那些，白天现钱 36 块，你看看接不接！」'
      }
    ],
    payBase: 36,
    apCost: 3,
    needS: 3,
    needC: 2,
    tyReward: 2,
    ptsReward: 10,
    lightTaboo: '忌混用旧白事纸料',
    priority: 16
  },

  // D6–D9 中段活人订单
  {
    id: 'd6_teahouse_doorgod',
    dayMin: 6,
    dayMax: 6,
    fixedDay: 6,
    client: '茶馆老板娘（活人商户）',
    title: '茶馆翻新镇宅门神',
    summary: '老板娘一早来换新门神，压低声音说昨夜听见无声唢呐从北巷飘过，劝你天黑别抬头看红盖头。',
    guestArt: 'chen_auntie',
    hassleNote: '活人日常麻烦：要求洁净 ≥ 2 且不可贴反门神左右，顺带透出今夜顶格预警。',
    storyBeats: [
      {
        speaker: '茶馆老板娘',
        cue: '老板娘一早便神色紧张地推开门，手里卷着两张发脆的旧门神画。',
        line: '「掌柜快帮我换一对新刻的朱砂镇宅门神！我家茶馆门板上的旧门神昨夜不知怎么自个儿裂了缝。」'
      },
      {
        speaker: '茶馆老板娘',
        cue: '她倒了杯凉茶定神，连声叮嘱细节。',
        line: '「秦琼敬德的脸可千万别裱反了，纸面也得干净鲜亮。我多给点现钱，就是图个镇宅安心。」'
      },
      {
        speaker: '茶馆老板娘',
        cue: '她临出门前回头拉住你的袖口，声音发颤。',
        line: '「昨儿后半夜北巷飘过一阵听不见调子的唢呐声……今晚不管谁穿大红衣裳敲门，千万别抬头看红盖头底下，更别跟着出门！」'
      }
    ],
    payBase: 30,
    apCost: 2,
    needS: 2,
    needC: 2,
    tyReward: 1,
    ptsReward: 8,
    lightTaboo: '忌倒贴门神',
    priority: 15
  },
  {
    id: 'd7_opera_crown',
    dayMin: 7,
    dayMax: 11,
    client: '老戏班班主（活人艺人）',
    title: '修补纸扎凤冠与水袖',
    summary: '戏班为后几日庙会排老戏，托你补一顶轻纸凤冠。班主说后台铜镜夜里总映出多出来的人影。',
    guestArt: 'doctor_lin',
    hassleNote: '活人日常麻烦：细活儿费眼神，要求洁净 ≥ 1，酬劳体面。',
    storyBeats: [
      {
        speaker: '老戏班班主',
        cue: '班主捧着一只褪色红漆木匣走进铺来，掀开绸布露出一顶破了珠翠的纸扎凤冠。',
        line: '「掌柜好手艺！我们戏班为镇上大庙会排《游园惊梦》，角儿戴的这顶轻纸凤冠昨儿彩排摔裂了半边。」'
      },
      {
        speaker: '老戏班班主',
        cue: '他手指轻点凤冠上的竹丝骨架，细致交代。',
        line: '「重在轻巧贴头，不能用糙纸糊得沉甸甸的，得麻烦你细细修补并配两条新纸水袖。」'
      },
      {
        speaker: '老戏班班主',
        cue: '他合上木匣，若有所思地压低了声音。',
        line: '「说句闲话，这几天戏班后台那面老铜镜夜里总爱晃人影。咱们活人唱活人戏，天黑后若是有人捧着铜镜来敲你门，多留个心眼。」'
      }
    ],
    payBase: 28,
    apCost: 2,
    needS: 2,
    needC: 1,
    tyReward: 1,
    ptsReward: 7,
    priority: 11
  },
  {
    id: 'd8_demolish_house',
    dayMin: 8,
    dayMax: 14,
    client: '镇西拆迁户（活人户主）',
    title: '迁坟安家双层纸楼',
    summary: '老宅动迁前家里老人坚持要烧一座体面的双层纸楼，用料吃紧但现钱爽快。',
    guestArt: 'day_villager',
    hassleNote: '活人麻烦大单：费工时（3 AP）且费纸料（3 料），窗格要留单数，回款很高。',
    storyBeats: [
      {
        speaker: '镇西户主',
        cue: '中年汉子掏出烟刚想点，瞧见铺里满屋纸扎又赶紧把打火机塞回兜里。',
        line: '「掌柜，镇西老屋下周动迁，家里老爷子死活要给祖宗迁坟前烧一座气派的双层纸楼。」'
      },
      {
        speaker: '镇西户主',
        cue: '他苦笑着摊开一张手绘草图，上面密密麻麻标着尺寸。',
        line: '「老爷子讲究特别多：屋檐要翘角、窗格必须留单数、门前还要糊两棵纸松树，确实挺费你的工夫和纸料。」'
      },
      {
        speaker: '镇西户主',
        cue: '他干脆利落地拍出一叠现金。',
        line: '「工钱绝不亏待你，现结 38 块！你要是觉得太费工时也可以不接，我再去镇外打听打听。」'
      }
    ],
    payBase: 38,
    apCost: 3,
    needS: 3,
    needC: 2,
    tyReward: 2,
    ptsReward: 10,
    lightTaboo: '纸楼窗格须留单数',
    priority: 12
  },
  {
    id: 'd9_fair_lanterns',
    dayMin: 9,
    dayMax: 9,
    fixedDay: 9,
    client: '庙会筹备组（活人）',
    title: '庙会前夜大红引路灯',
    summary: '明日便是镇上大庙会！活人忙着挂灯招客，老人们却私下交代：明晚阴市借路，门前两盏灯万不能灭。',
    guestArt: 'wu_day',
    hassleNote: '活人日常麻烦：交期卡在庙会前夜，需洁净 ≥ 2，奖励可观。',
    storyBeats: [
      {
        speaker: '庙会筹备员',
        cue: '筹备员胳膊下夹着红绸布，急匆匆迈进铺门。',
        line: '「掌柜，明儿就是镇上一年一度的大庙会！街口差两盏压场的大红引路纸灯，大伙都指名要你铺子里的手艺。」'
      },
      {
        speaker: '庙会筹备员',
        cue: '他抹了把额头上的汗，指着你屋檐下的三盏红灯。',
        line: '「得用上好红纸糊得通透，风吹不破、雨淋不塌，天黑前挂上牌坊，工钱 34 块立马结清。」'
      },
      {
        speaker: '庙会筹备员',
        cue: '他走出两步又回头压低嗓门。',
        line: '「镇上老人们都念叨，庙会白天迎活人、夜里阴市借路。明晚百戏游神过街，铺门前头两盏灯可千万护紧了别熄！」'
      }
    ],
    payBase: 34,
    apCost: 2,
    needS: 2,
    needC: 2,
    tyReward: 2,
    ptsReward: 10,
    priority: 18
  },

  // D10 庙会日特殊活人订单
  {
    id: 'd10_temple_dragon',
    dayMin: 10,
    dayMax: 10,
    fixedDay: 10,
    client: '庙会会首（活人）',
    title: '【庙会特单】彩扎游神纸龙头',
    summary: '庙会当日全镇沸腾，会首重金急订彩扎龙头压轴；接下可得丰厚现金与系统奖励，但务必留够净纸与洁净应对今夜百戏游神。',
    guestArt: 'doctor_lin',
    hassleNote: '庙会高难活人单：需洁净 ≥ 3、3 工时、3 纸料，点睛前忌朝北摆，但报酬极高。',
    storyBeats: [
      {
        speaker: '庙会会首',
        cue: '穿长袍马褂的老会首在锣鼓声中踏进铺子，拱手深深一揖。',
        line: '「掌柜久仰！今日大庙会全镇沸腾，偏偏原定压轴的彩扎游神龙头在库房受潮散了架，全镇上下只能来请你救急！」'
      },
      {
        speaker: '庙会会首',
        cue: '他递上一张沉甸甸的红礼帖，神色庄重。',
        line: '「龙头须扎得龙须翻卷、洁净无尘，点睛之前切记不可朝北摆放。虽然极耗工时和纸料，但会里愿出 46 块重金！」'
      },
      {
        speaker: '庙会会首',
        cue: '他望了眼门外熙攘人群，语气陡然转沉。',
        line: '「只是庙会散场后的今夜最凶，若你怕耗空纸料应付不了夜里的百戏游神，不接这特单会里也绝不怪罪。」'
      }
    ],
    payBase: 46,
    apCost: 3,
    needS: 3,
    needC: 3,
    tyReward: 2,
    ptsReward: 14,
    lightTaboo: '点睛前不可朝北摆放',
    priority: 22
  },

  // D11–D15 后期活人订单
  {
    id: 'd11_ferry_boat',
    dayMin: 11,
    dayMax: 14,
    client: '渡口老船工（活人）',
    title: '江口平安纸船',
    summary: '庙会刚过江雾浓重，老船工来求几只压浪纸船，顺嘴提起夜里渡口总有人问水有多深。',
    guestArt: 'day_villager',
    hassleNote: '活人日常麻烦：要求船底糊厚实些防湿气，稳赚现金与纸火点。',
    storyBeats: [
      {
        speaker: '渡口老船工',
        cue: '老船工披着半干蓑衣走进来，鞋底还沾着江边青泥。',
        line: '「掌柜在屋呢？庙会一过，江面上起了三天白雾散不开，行船心里直发毛，来求几只压浪平安纸船。」'
      },
      {
        speaker: '渡口老船工',
        cue: '他拿粗糙手掌在柜台比划了个船头。',
        line: '「江上水汽大，纸船船底得双层加厚糊牢，免得我放进水里没漂三步就沉了，算个吉利。」'
      },
      {
        speaker: '渡口老船工',
        cue: '他搓了把冷脸，嘟囔了一句。',
        line: '「近来夜里渡口总有个湿衣裳的人站在雾里问水有多深——我可从来不答！掌柜你也记着，夜里谁叫你去江边，千万别去。」'
      }
    ],
    payBase: 26,
    apCost: 2,
    needS: 2,
    tyReward: 1,
    ptsReward: 7,
    priority: 10
  },
  {
    id: 'd13_scholar_lamp',
    dayMin: 13,
    dayMax: 13,
    fixedDay: 13,
    client: '镇志老学究（活人）',
    title: '仿民国手绘走马灯',
    summary: '老学究为县志拍照订一盏旧式走马灯，翻出旧档案说铺子以前每次大清算前，屋里都会多出一把空太师椅。',
    guestArt: 'doctor_lin',
    hassleNote: '活人日常麻烦：考据癖重、挑洁净 ≥ 2，顺手交出关于今夜顶格的旧档案。',
    storyBeats: [
      {
        speaker: '镇志老学究',
        cue: '老先生抱着一摞发黄线装县志，推了推厚眼镜片仔细打量铺子梁柱。',
        line: '「果然是民国旧制！我正编修镇志民俗卷，想向掌柜定制一盏老式手绘戏文走马灯，拍完照收进档案馆。」'
      },
      {
        speaker: '镇志老学究',
        cue: '他翻开县志一页，拿铅笔指着上面的工笔图样。',
        line: '「灯屏上的戏子水袖要描得清清楚楚，纸面务必洁净无污，工钱 34 块走县志经费，现结。」'
      },
      {
        speaker: '镇志老学究',
        cue: '他合上书时手指顿了顿，推镜片低声道。',
        line: '「对了，我在民国旧档里翻到条奇闻：你这间铺子每次大清算前两夜，屋里总会凭空多出一把空太师椅——切记，只看戏，莫数人。」'
      }
    ],
    payBase: 34,
    apCost: 2,
    needS: 2,
    needC: 2,
    tyReward: 1,
    ptsReward: 10,
    priority: 18
  },
  {
    id: 'd15_grand_closing',
    dayMin: 15,
    dayMax: 15,
    fixedDay: 15,
    client: '全镇街坊联名（活人）',
    title: '【十五日收官】镇口太平清醮纸幡',
    summary: '你在镇上撑到第十五天，街坊们联名来订镇口大纸幡。办妥这一单，阳间口碑便算彻底立稳，静候今夜系统大账终审。',
    guestArt: 'chen_auntie',
    hassleNote: '十五日收官大单：耗 3 工时、3 纸料、需洁净 ≥ 2，办妥后阳间口碑圆满。',
    storyBeats: [
      {
        speaker: '陈婶（街坊代表）',
        cue: '陈婶领着几位老街坊把一张写满红字的联名帖郑重铺在柜台上。',
        line: '「掌柜，真叫你在这条老街撑满十五天啦！大伙商量着凑份子，请你扎一对镇口太平清醮大纸幡！」'
      },
      {
        speaker: '陈婶（街坊代表）',
        cue: '她看着整洁亮堂的铺面，眼里满是佩服与感激。',
        line: '「这半个月镇上风风雨雨，多亏你铺里这三盏红灯一直没灭。纸幡个头大，费 3 工时和 3 份纸料，但街坊们凑了 44 块酬金！」'
      },
      {
        speaker: '陈婶（街坊代表）',
        cue: '她悄悄把一张平安红纸塞到你手心。',
        line: '「听说今晚就是你最后一道大关。接不接看你留的料够不够——不管怎样，天亮以后咱们全镇还来光顾你的纸火铺！」'
      }
    ],
    payBase: 44,
    apCost: 3,
    needS: 3,
    needC: 2,
    tyReward: 2,
    ptsReward: 14,
    priority: 22
  }
];

export const ORDER_BY_ID: Record<string, DayOrderDef> = Object.fromEntries(
  DAY_ORDERS.map((o) => [o.id, o])
);
