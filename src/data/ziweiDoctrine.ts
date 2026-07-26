export type ZiweiStarDoctrine = {
  nature: "主星" | "辅曜" | "煞曜" | "杂曜";
  tone: "吉" | "中性偏吉" | "中性" | "中性偏凶" | "凶";
  core: string;
  orthodox: string;
  modern: string;
  caution: string;
  tarotBody: string;
};

export type ZiweiPalaceDoctrine = {
  core: string;
  linkedPalaces: string[];
  readingRule: string;
  modernFrame: string;
};

export const ZIWEI_LITERATURE_BASELINE = [
  "用户本地资料：/Users/iran/Desktop/紫微/王亭之斗数/王亭之 中州派紫微斗数初级讲义.pdf",
  "用户本地资料：/Users/iran/Desktop/紫微/王亭之斗数/王亭之 中州派紫微斗数深造讲义.pdf",
  "用户本地资料：/Users/iran/Desktop/紫微/王亭之斗数/王亭之谈紫微斗数.pdf",
  "用户本地资料：/Users/iran/Desktop/紫微/王亭之斗数/《斗数宣微　斗数四化断决》　王亭之.pdf",
  "用户上传 .textClipping 附件：倪海厦、潘子渔、陈世兴、九龙道长等资料索引。当前 clipping 仅含文件引用/片段，后续可替换为原 PDF 全文抽取。",
] as const;

export const ZIWEI_READING_PRINCIPLES = [
  "不以单星孤立断论：先看本宫，再看对宫、三合宫与三方四正。",
  "命宫定外显行为，身宫定后天着力点，福德宫定内在精神承载。",
  "四化不作简单吉凶：化禄看资源，化权看执行，化科看名誉与缓冲，化忌看执念、阻滞与需要修正的惯性。",
  "煞曜不单独等同坏结果，需结合庙旺利陷、会照、四化与现实场景判断。",
  "空宫需借对宫星曜，并回到三方四正验证，不以空宫直接断弱。",
  "报告统一包装为东方传统性格分析与人生规划参考，不作绝对化承诺。",
] as const;

export const ZIWEI_FOUR_TRANSFORMATION_THEORY: Record<string, string> = {
  化禄: "资源、机会、顺手处与愿意投入的领域；落点越清楚，越容易形成可见收益。",
  化权: "掌控、推动、执行和责任；代表能量变强，也意味着需要承担更明确的压力。",
  化科: "名誉、规则、专业信用与缓冲；适合通过作品、资质、口碑获得支持。",
  化忌: "执念、卡点、反复消耗与需要修正的习惯；不是绝对凶，而是提醒最容易用力过度的领域。",
};

export const ZIWEI_STAR_THEORY: Record<string, ZiweiStarDoctrine> = {
  紫微: {
    nature: "主星",
    tone: "吉",
    core: "主导、格局、统筹、责任",
    orthodox: "紫微为帝座之星，重在主导权、结构感与统摄能力。",
    modern: "适合做整合资源、制定方向、承担核心责任的角色。",
    caution: "容易把掌控感当成安全感，需要避免过度替别人做决定。",
    tarotBody: "事情的根本在主导权和格局，不宜被短期情绪牵着走。",
  },
  天机: {
    nature: "主星",
    tone: "中性偏吉",
    core: "机变、谋划、信息、移动",
    orthodox: "天机重变化与思考，善谋划，也主奔波与反复。",
    modern: "适合策略、咨询、内容、技术、项目协调等需要快速调整的场景。",
    caution: "想太多会削弱执行，需用阶段性验证代替无限推演。",
    tarotBody: "事情根基在变化和策略，关键是调整路线，而不是硬冲。",
  },
  太阳: {
    nature: "主星",
    tone: "吉",
    core: "外放、照耀、名声、付出",
    orthodox: "太阳主光明、公开、贵显与向外输出，亦看昼夜旺陷。",
    modern: "适合主动表达、公开展示、服务他人、建立可见影响力。",
    caution: "过度付出会消耗自己，需要确认回报与边界。",
    tarotBody: "事件适合公开透明推进，越清楚表达越容易得到回应。",
  },
  武曲: {
    nature: "主星",
    tone: "吉",
    core: "财星、执行、规则、刚性",
    orthodox: "武曲为财星，重务实、决断与资源管理。",
    modern: "适合财务、运营、管理、工程、效率导向的岗位与决策。",
    caution: "刚性太强会压低情绪弹性，关系议题不宜只讲道理。",
    tarotBody: "问题本质落在资源、效率和现实回报上，务实判断更可靠。",
  },
  天同: {
    nature: "主星",
    tone: "吉",
    core: "福气、温和、享受、缓冲",
    orthodox: "天同主福与和气，有缓冲力，也有安逸与依赖。",
    modern: "适合服务、疗愈、审美、体验型工作，也适合用柔性方式推进。",
    caution: "拖延和回避冲突会让好机会被动流失。",
    tarotBody: "事情有缓冲和贵人，但不能因为舒服而错过窗口。",
  },
  廉贞: {
    nature: "主星",
    tone: "中性",
    core: "规则、欲望、边界、复杂关系",
    orthodox: "廉贞兼桃花与法度，最怕纠缠是非，也善精密处理。",
    modern: "适合品牌、审美、制度、风控、关系结构复杂的场景。",
    caution: "需先分清动机与责任，避免暧昧边界带来误会。",
    tarotBody: "事件内部结构复杂，必须先厘清规则、边界和真实动机。",
  },
  天府: {
    nature: "主星",
    tone: "吉",
    core: "库星、承载、稳重、积累",
    orthodox: "天府为库星，重守成、承接与资源蓄积。",
    modern: "适合长期资产、稳定组织、资源配置和可持续经营。",
    caution: "太求稳会错过需要主动出手的窗口。",
    tarotBody: "根基偏稳，适合积累承接，不适合短线赌一把。",
  },
  太阴: {
    nature: "主星",
    tone: "吉",
    core: "内敛、财库、情绪、安全感",
    orthodox: "太阴主阴柔、财帛、田宅与细腻感受，需重视旺陷。",
    modern: "适合精细管理、内容审美、资产沉淀、女性用户与情绪价值。",
    caution: "情绪内耗和过度猜测会影响判断。",
    tarotBody: "深层与安全感、隐性资源和情绪价值有关，越细致越看得清。",
  },
  贪狼: {
    nature: "主星",
    tone: "中性偏吉",
    core: "欲望、桃花、才艺、机会",
    orthodox: "贪狼主欲望、交际、才艺与扩张，吉凶看制化。",
    modern: "适合流量、娱乐、社交、审美消费和多技能发展。",
    caution: "贪多、分心、短期刺激会稀释真正机会。",
    tarotBody: "事情带有吸引和机会扩张，成败取决于克制与聚焦。",
  },
  巨门: {
    nature: "主星",
    tone: "中性偏凶",
    core: "口舌、暗处、洞察、疑虑",
    orthodox: "巨门主口舌是非，也主深层观察与辨析能力。",
    modern: "适合研究、咨询、辩论、内容拆解，但需要信息透明。",
    caution: "猜忌和含糊表达会放大误会。",
    tarotBody: "根源在沟通误差和信息不透明，越含糊越容易引发是非。",
  },
  天相: {
    nature: "主星",
    tone: "吉",
    core: "辅佐、秩序、体面、制度",
    orthodox: "天相为印星，重辅佐、规制、体面与配合。",
    modern: "适合制度内协作、项目管理、公共关系和流程优化。",
    caution: "太在意体面会压抑真实需求。",
    tarotBody: "本质重在秩序和合作，按流程走比临场硬拗更有利。",
  },
  天梁: {
    nature: "主星",
    tone: "吉",
    core: "荫护、长辈、原则、化解",
    orthodox: "天梁为荫星，主保护、原则、长辈缘与解厄。",
    modern: "适合教育、咨询、合规、公益、经验传承型角色。",
    caution: "清高或过度说教会拉开心理距离。",
    tarotBody: "底层有化解和保护力，适合借助经验、规则或成熟建议。",
  },
  七杀: {
    nature: "主星",
    tone: "中性偏凶",
    core: "开创、风险、决断、压力",
    orthodox: "七杀主冲锋与破局，有成败幅度，需看会照与制化。",
    modern: "适合创业、竞技、危机处理、快速决策和硬仗。",
    caution: "冲得太快会忽视代价，必须先设止损条件。",
    tarotBody: "事情带风险和突破性，能开局，但代价必须算清。",
  },
  破军: {
    nature: "主星",
    tone: "中性偏凶",
    core: "破旧、重启、变动、消耗",
    orthodox: "破军主破耗与更新，先破后立，最忌无序消耗。",
    modern: "适合转型、重构、产品改版、离开旧环境再建立新秩序。",
    caution: "如果只是为了摆脱焦虑而改变，容易越改越乱。",
    tarotBody: "这件事会打破旧结构，适合重启，不适合期待一切不变。",
  },
  左辅: {
    nature: "辅曜",
    tone: "吉",
    core: "明面助力、协作、稳定支持",
    orthodox: "左辅主辅佐与外显助力，可增主星执行力。",
    modern: "适合借团队、导师、同伴支持推进。",
    caution: "不要把支持当成替代行动。",
    tarotBody: "背后有可见助力，关键是接受支持并稳定推进。",
  },
  右弼: {
    nature: "辅曜",
    tone: "吉",
    core: "暗助、人脉、协调、柔性支持",
    orthodox: "右弼主暗中扶持与协调力。",
    modern: "适合通过关系协调、柔性沟通打开局面。",
    caution: "人情资源也要有清楚边界。",
    tarotBody: "隐性人脉与协调关系是核心，温和推进更有效。",
  },
  文昌: {
    nature: "辅曜",
    tone: "吉",
    core: "文书、条理、学习、表达",
    orthodox: "文昌主文智、条理与文书。",
    modern: "适合把想法写清楚，用材料、作品、履历证明能力。",
    caution: "过度追求完美格式会拖慢行动。",
    tarotBody: "根基落在文字、信息与逻辑表达，准备越清楚越稳。",
  },
  文曲: {
    nature: "辅曜",
    tone: "吉",
    core: "才艺、审美、表达、情感流动",
    orthodox: "文曲主才华、艺术与情感表达。",
    modern: "适合审美、内容、创意表达和柔性社交。",
    caution: "情绪化表达需回到事实与边界。",
    tarotBody: "事件带才华展示和情感吸引，审美与细节会放大优势。",
  },
  禄存: {
    nature: "辅曜",
    tone: "吉",
    core: "财禄、积蓄、稳定收益",
    orthodox: "禄存主禄，重积累与守成。",
    modern: "适合稳定收入、长期储蓄和可持续资源。",
    caution: "太守旧会降低机会弹性。",
    tarotBody: "根基有实际收益和积累价值，适合稳拿，不宜贪快。",
  },
  天魁: {
    nature: "辅曜",
    tone: "吉",
    core: "明贵人、提携、机会",
    orthodox: "天魁主贵人与显性提携。",
    modern: "适合主动争取上级、前辈、平台资源。",
    caution: "机会出现时要准备好材料与回应速度。",
    tarotBody: "有明面贵人和机会窗口，适合主动争取资源。",
  },
  天钺: {
    nature: "辅曜",
    tone: "吉",
    core: "暗贵人、机缘、间接支持",
    orthodox: "天钺主暗助与人际机缘。",
    modern: "适合留意转介绍、间接消息和非正式机会。",
    caution: "不要因低调机会而忽视跟进。",
    tarotBody: "背后有人际机缘和暗中帮扶，适合温和推进。",
  },
  擎羊: {
    nature: "煞曜",
    tone: "凶",
    core: "冲突、硬伤、摩擦、急切",
    orthodox: "擎羊主刚烈与冲克，需看制化。",
    modern: "代表硬碰硬、争执、规则摩擦或快速切割。",
    caution: "冲动推进会增加损耗。",
    tarotBody: "内在有硬碰硬阻力，冲动推进会增加摩擦。",
  },
  陀罗: {
    nature: "煞曜",
    tone: "凶",
    core: "拖延、纠缠、反复、内耗",
    orthodox: "陀罗主拖滞与缠绕。",
    modern: "代表旧问题反复、迟迟不定、心理消耗。",
    caution: "需要设期限与边界，不可无限等待。",
    tarotBody: "根源是拖延和反复拉扯，越犹豫越消耗。",
  },
  火星: {
    nature: "煞曜",
    tone: "凶",
    core: "突发、急躁、冲动、爆点",
    orthodox: "火星主突发与急烈。",
    modern: "代表临场变化、情绪爆发、突发机会或突发阻碍。",
    caution: "快反应重要，但不能情绪化。",
    tarotBody: "底层有突发能量，快反应重要，但情绪化会坏事。",
  },
  铃星: {
    nature: "煞曜",
    tone: "凶",
    core: "暗耗、郁结、隐性伤害",
    orthodox: "铃星主暗耗与隐伏不安。",
    modern: "代表看不见的疲惫、误会积累、低频消耗。",
    caution: "不要忽略小问题长期堆积。",
    tarotBody: "问题有隐性消耗，表面平静，实际容易积累误会。",
  },
};

export const ZIWEI_PALACE_THEORY: Record<string, ZiweiPalaceDoctrine> = {
  命宫: {
    core: "自我气质、行动方式、人生主轴",
    linkedPalaces: ["迁移", "官禄", "财帛", "福德"],
    readingRule: "命宫先定行为模式，再看迁移的外部环境、官禄的社会位置、财帛的资源兑现。",
    modernFrame: "你如何面对世界、如何选择路径、如何把能力变成可见结果。",
  },
  兄弟: {
    core: "同辈、手足、同侪协作",
    linkedPalaces: ["交友", "田宅", "疾厄"],
    readingRule: "兄弟宫需与交友宫同看，判断同辈资源与合作边界。",
    modernFrame: "同事、同学、同辈合作关系是否能支持你。",
  },
  夫妻: {
    core: "伴侣期待、亲密模式、长期相处",
    linkedPalaces: ["福德", "迁移", "子女"],
    readingRule: "夫妻宫不可单断，须联动福德看情绪需求、迁移看外部现实、子女看恋爱表达。",
    modernFrame: "你需要怎样的伴侣、如何表达爱、关系如何落到现实生活。",
  },
  子女: {
    core: "创造力、恋爱愉悦、子女缘",
    linkedPalaces: ["夫妻", "田宅", "福德"],
    readingRule: "子女宫看表达与创造，不只限于子女，也与恋爱轻松感有关。",
    modernFrame: "你在关系和创作里如何释放生命力。",
  },
  财帛: {
    core: "收入模式、金钱观、资源兑现",
    linkedPalaces: ["官禄", "田宅", "福德"],
    readingRule: "财帛宫必须与官禄同看收入来源，与田宅同看沉淀，与福德同看安全感。",
    modernFrame: "你怎样赚钱、守钱、配置资源。",
  },
  疾厄: {
    core: "身心节律、压力出口、日常健康倾向",
    linkedPalaces: ["福德", "命宫", "父母"],
    readingRule: "疾厄宫只作身心节律参考，不作医学判断；需联动福德看情绪承载。",
    modernFrame: "你在压力下最需要照顾的生活节奏。",
  },
  迁移: {
    core: "外部机会、远方发展、环境适应",
    linkedPalaces: ["命宫", "官禄", "财帛"],
    readingRule: "迁移宫看离开原环境后的表现，与命宫形成内外对照。",
    modernFrame: "异地、跨圈层、曝光场景是否能放大你的优势。",
  },
  交友: {
    core: "人脉圈层、团队合作、外部支持",
    linkedPalaces: ["兄弟", "官禄", "财帛"],
    readingRule: "交友宫看合作对象和圈层质量，需与官禄财帛判断合作是否带来实际结果。",
    modernFrame: "哪些人值得合作，哪些关系需要设边界。",
  },
  官禄: {
    core: "事业定位、社会评价、职业路径",
    linkedPalaces: ["命宫", "财帛", "迁移"],
    readingRule: "官禄宫为事业核心，需联命宫看能力启动，联财帛看收入兑现，联迁移看外部机会。",
    modernFrame: "你适合在什么舞台被看见，如何建立职业信用。",
  },
  田宅: {
    core: "家庭根基、不动产、生活秩序",
    linkedPalaces: ["父母", "财帛", "子女"],
    readingRule: "田宅宫看安全感落地，也看资产沉淀与家庭结构。",
    modernFrame: "你的居住、资产、家庭边界如何影响长期稳定。",
  },
  福德: {
    core: "精神底色、幸福感、潜意识模式",
    linkedPalaces: ["命宫", "夫妻", "疾厄"],
    readingRule: "福德宫为内在承载，须与命宫、夫妻、疾厄同看。",
    modernFrame: "你真正放松的方式，以及情绪能否承接现实压力。",
  },
  父母: {
    core: "原生支持、规则、长辈资源",
    linkedPalaces: ["田宅", "命宫", "疾厄"],
    readingRule: "父母宫看早年规则与长辈支持，也影响安全感形成。",
    modernFrame: "你从原生家庭或权威系统中继承了什么模式。",
  },
};

export function getStarDoctrine(star: string): ZiweiStarDoctrine | undefined {
  return ZIWEI_STAR_THEORY[star.replace(/化禄|化权|化科|化忌/g, "")];
}

export function summarizeStarDoctrine(stars: string[], max = 3): string {
  const items = stars
    .map((star) => {
      const doctrine = getStarDoctrine(star);
      return doctrine ? `${star}主${doctrine.core}` : "";
    })
    .filter(Boolean)
    .slice(0, max);
  return items.length ? items.join("；") : "无正曜时需借对宫星曜，并回到三方四正验证。";
}

export function summarizePalaceDoctrine(name: string): string {
  const doctrine = ZIWEI_PALACE_THEORY[name];
  if (!doctrine) return "本宫需结合对宫与三方四正综合判断。";
  return `${doctrine.readingRule} 现代场景：${doctrine.modernFrame}`;
}

export function explainFourTransformation(label: string): string {
  const key = Object.keys(ZIWEI_FOUR_TRANSFORMATION_THEORY).find((item) => label.includes(item));
  return key ? ZIWEI_FOUR_TRANSFORMATION_THEORY[key] : "需结合落宫、星曜与三方四正综合判断。";
}
