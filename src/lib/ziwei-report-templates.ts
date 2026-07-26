import type { ZiweiChart, ZiweiPalace, ZiweiSynastry } from "@/lib/ziwei-doushu";
import {
  explainFourTransformation,
  summarizePalaceDoctrine,
  summarizeStarDoctrine,
  ZIWEI_READING_PRINCIPLES,
} from "@/data/ziweiDoctrine";

export type ZiweiReportSection = {
  id: string;
  icon: string;
  title: string;
  subtitle: string;
  highlight: string;
  body: string[];
  bullets?: string[];
};

export const ZIWEI_REPORT_FIELD_MAP = {
  natal: {
    core: ["chart.mingPalace", "chart.shenPalace", "chart.palaces[福德]", "chart.patterns", "chart.palaces[].four"],
    career: ["chart.palaces[官禄]", "chart.palaces[命宫]", "chart.palaces[财帛]", "chart.palaces[迁移]"],
    wealth: ["chart.palaces[财帛]", "chart.palaces[田宅]", "chart.palaces[福德]", "chart.palaces[].four"],
    love: ["chart.palaces[夫妻]", "chart.palaces[福德]", "chart.palaces[迁移]", "chart.palaces[子女]"],
    social: ["chart.palaces[交友]", "chart.palaces[兄弟]", "chart.palaces[迁移]"],
    family: ["chart.palaces[父母]", "chart.palaces[田宅]", "chart.palaces[子女]"],
    health: ["chart.palaces[疾厄]", "chart.palaces[福德]", "chart.timeTrace"],
  },
  synastry: {
    total: ["chartA.mainStar", "chartB.mainStar", "synastry.score", "synastry.label"],
    emotion: ["chartA.palaces[夫妻]", "chartB.palaces[夫妻]", "chartA.palaces[福德]", "chartB.palaces[福德]"],
    reality: ["chartA.palaces[官禄]", "chartB.palaces[官禄]", "chartA.palaces[财帛]", "chartB.palaces[财帛]"],
    home: ["chartA.palaces[田宅]", "chartB.palaces[田宅]", "chartA.palaces[交友]", "chartB.palaces[交友]"],
    risks: ["chartA.palaces[].four", "chartB.palaces[].four", "synastry.risk"],
  },
} as const;

export const ZIWEI_REPORT_GENERATION_RULES = [
  "先定盘局基调，再拆宫位主题，最后落到现实建议；不把星曜释义逐条堆给用户。",
  "每个判断都必须形成「宫位 + 主星 + 辅煞 + 四化 + 三方四正」的逻辑链。",
  "命宫看外显行为，身宫看后天着力点，福德宫看内在承载；本命为体，大运为用。",
  "十二宫解读统一采用「本宫管什么」「盘上怎么显示」「现实里怎么表现」「建议怎么做」四层结构。",
  "语言保留专业术语，但必须翻译成现代生活场景；避免绝对断语、恐吓式表达和空泛鸡汤。",
] as const;

function palace(chart: ZiweiChart, name: string): ZiweiPalace {
  return chart.palaces.find((item) => item.name === name) || chart.palaces[0];
}

function stars(p: ZiweiPalace) {
  return p.stars.length ? p.stars.join("、") : "无正曜，需借对宫星曜";
}

function helpers(p: ZiweiPalace) {
  const all = [...p.assistants, ...p.misc].slice(0, 5);
  return all.length ? all.join("、") : "辅曜不重";
}

function four(p: ZiweiPalace) {
  return p.four.length ? p.four.join("、") : "无明显生年四化落入";
}

function fourWithMeaning(p: ZiweiPalace) {
  return p.four.length
    ? p.four.map((item) => `${item}：${explainFourTransformation(item)}`).join("；")
    : "本宫无明显生年四化落入，需以主星、辅曜、对宫与三方四正综合取象。";
}

function brightness(p: ZiweiPalace) {
  const pairs = Object.entries(p.brightness).map(([star, level]) => `${star}${level}`);
  return pairs.length ? pairs.join("、") : "以对宫与三方四正综合取象";
}

function linkedField(chart: ZiweiChart, core: string, links: string[]) {
  const corePalace = palace(chart, core);
  const linked = links.map((name) => palace(chart, name));
  const fourText = [corePalace, ...linked].flatMap((p) => p.four).join("、") || "四化不集中";
  return { core: corePalace, linked, fourText };
}

function scoreTone(score: number) {
  if (score >= 86) return "高契合，但仍需要把吸引力落到现实节奏";
  if (score >= 74) return "互补明显，适合在磨合中建立长期默契";
  return "牵引感存在，但需要先建立边界与沟通规则";
}

function palaceAt(chart: ZiweiChart, start: ZiweiPalace, offset: number) {
  const index = chart.palaces.findIndex((item) => item.name === start.name);
  return chart.palaces[(index + offset + chart.palaces.length) % chart.palaces.length] || start;
}

function palaceLogic(p: ZiweiPalace) {
  return `本宫为${p.name}，坐${p.branch}支，主星${stars(p)}，辅煞杂曜见${helpers(p)}，四化为${four(p)}，庙旺利陷取${brightness(p)}。`;
}

function palaceSectionTitle(p: ZiweiPalace) {
  const labels: Record<string, string> = {
    命宫: "外在性格与人生启动方式",
    兄弟: "同辈关系与资源分摊",
    夫妻: "亲密关系与伴侣期待",
    子女: "恋爱表达、创造力与延伸关系",
    财帛: "收入结构与金钱安全感",
    疾厄: "身心节律与压力出口",
    迁移: "外部机会、远方与环境变动",
    交友: "社交圈层、合作与人脉质量",
    官禄: "事业舞台与社会评价",
    田宅: "家庭根基、居住与资产沉淀",
    福德: "精神底色、幸福感与恢复力",
    父母: "长辈缘分、规则来源与早年影响",
  };
  return `${p.name}（${labels[p.name] || "人生主题补充"}）`;
}

function palaceFullReading(chart: ZiweiChart, p: ZiweiPalace) {
  const opposite = palaceAt(chart, p, 6);
  const trineA = palaceAt(chart, p, 4);
  const trineB = palaceAt(chart, p, 8);
  const doctrine = summarizePalaceDoctrine(p.name);
  const starDoctrine = summarizeStarDoctrine(p.stars, 2);
  const fourText = fourWithMeaning(p);
  return `【${palaceSectionTitle(p)}】本宫先看「${p.focus}」这条主线。盘上显示为${p.branch}宫，主星${stars(p)}，辅煞杂曜见${helpers(p)}，四化为${four(p)}，庙旺利陷为${brightness(p)}。${doctrine} ${starDoctrine} 但这一宫不能孤立读：对宫为${opposite.name}（${stars(opposite)}），三合会到${trineA.name}（${stars(trineA)}）与${trineB.name}（${stars(trineB)}），所以现实表现通常不是单一事件，而是一组互相牵动的生活主题。${fourText} 如果这一宫顺，表现为你在对应领域更容易找到节奏；如果这里有煞曜或化忌，重点不是把它当成坏结果，而是提前看清哪里容易反复、哪里需要边界、哪里该用现实计划去承接。`;
}

function linkedPalaceLogic(chart: ZiweiChart, names: string[]) {
  return names.map((name) => {
    const p = palace(chart, name);
    return `${name}：${stars(p)} / ${four(p)}`;
  }).join("；");
}

function classifyPattern(chart: ZiweiChart) {
  if (!chart.patterns.length) {
    return {
      name: "未见强烈单一成格",
      level: "半成格",
      basis: "以命宫、官禄、财帛、迁移四宫联动取象，不用单一格局定高低。",
    };
  }
  const primary = chart.patterns[0];
  const isStrong = ["三奇嘉会", "紫府同宫", "杀破狼格", "机月同梁"].includes(primary);
  return {
    name: primary,
    level: isStrong ? "成格" : "半成格",
    basis: `以${primary}为核心格局参考，并回看三方四正、四化落宫与辅煞制化。`,
  };
}

function careerTrack(careerStar: string) {
  if (["紫微", "天府", "天相", "武曲"].includes(careerStar)) return "组织管理、运营统筹、项目负责人、财务资源管理、品牌管理";
  if (["天机", "文昌", "文曲", "巨门"].includes(careerStar)) return "策略咨询、内容策划、数据分析、产品运营、传播表达";
  if (["太阳", "天梁", "天同"].includes(careerStar)) return "教育培训、用户服务、公关传播、专业顾问、公益或平台型角色";
  if (["七杀", "破军", "贪狼", "廉贞"].includes(careerStar)) return "创业项目、娱乐流量、商业拓展、转型业务、强竞争型岗位";
  return "需要靠作品、项目履历和长期信用逐步打开的复合型路径";
}

function wealthMode(coreStar: string) {
  if (["武曲", "天府", "禄存", "太阴"].includes(coreStar)) return "正财与稳定积累优先，适合长期资产、稳健储蓄和明确预算";
  if (["贪狼", "破军", "七杀"].includes(coreStar)) return "偏财与副业机会较多，但高波动领域必须设置止损";
  if (["天机", "巨门", "文昌", "文曲"].includes(coreStar)) return "靠信息差、专业表达、技能变现与项目型收入累积";
  return "以主业现金流为底盘，再用低风险副业或长期计划扩展";
}

function decadeTheme(star: string) {
  if (["紫微", "天府", "天相"].includes(star)) return "建立位置、整合资源、承担更大责任";
  if (["天机", "巨门", "文昌", "文曲"].includes(star)) return "学习升级、策略转向、信息与专业能力变现";
  if (["太阳", "武曲"].includes(star)) return "公开曝光、执行兑现、事业与收入同步推进";
  if (["七杀", "破军", "贪狼"].includes(star)) return "突破旧局、强烈转型、机会与风险并行";
  if (["天同", "太阴", "天梁"].includes(star)) return "稳住生活根基，修复身心节律，并通过贵人与长期信用累积";
  return "重整节奏、校准方向、把本命优势落到现实结构";
}

function fourImpactText(fourItems: string[]) {
  if (!fourItems.length) return "这一步运程没有出现特别集中的四化牵动，重点还是回到当下这十年的主轴，看哪些领域正在被慢慢推上台面。";
  return fourItems.map((item) => {
    if (item.includes("化禄")) return `${item}主资源与顺手处，本阶段对应领域容易出现机会、收益或愿意投入的动力。`;
    if (item.includes("化权")) return `${item}主掌控与责任，本阶段会要求你主动承担、推动或争取主导权。`;
    if (item.includes("化科")) return `${item}主名誉、专业信用与缓冲，本阶段适合靠作品、资质与口碑降低阻力。`;
    if (item.includes("化忌")) return `${item}主执念、阻滞与反复，本阶段需防过度用力、承诺失衡或旧问题回潮。`;
    return `${item}需结合落宫与三方四正判断。`;
  }).join(" ");
}

function buildDecadeParagraphs(chart: ZiweiChart) {
  const currentIndex = chart.decades.findIndex((decade) => decade.isCurrent);
  const startIndex = currentIndex >= 0 ? currentIndex : 0;
  const selectedDecades = chart.decades.slice(startIndex, startIndex + 3);

  if (!selectedDecades.length) {
    return ["当前命盘没有可用的大限计算结果，因此本报告不生成十年运程推断。请重新排盘后再查看。"];
  }

  return selectedDecades.flatMap((decade) => {
    const start = decade.ageStart;
    const end = decade.ageEnd;
    const limitPalace = chart.palaces.find((item) => item.branch === decade.palaceBranch) || palace(chart, decade.palaceName);
    const careerP = palace(chart, "官禄");
    const wealthP = palace(chart, "财帛");
    const star = limitPalace.stars[0] || chart.mainStar;
    const limitFour = decade.fourTransformations;
    return [
      `【${start}-${end}岁大运总览】这一轮大限命宫落${decade.palaceName}（${decade.stem}${decade.palaceBranch}），主星见${stars(limitPalace)}。本命决定你原本擅长什么，这步大限决定这些能力会先落到哪个领域。对你来说，这十年真正重要的，不是样样都试，而是把重心压到“${decadeTheme(star)}”这一条线上。`,
      `【事业走向】官禄宫现${stars(careerP)}，再联动命宫、财帛宫、迁移宫一起看：${linkedPalaceLogic(chart, ["命宫", "财帛", "迁移"])}。如果这十年出现换赛道、换城市、扩大职责、公开曝光或独立做项目的机会，判断标准不该只是“看起来热不热”，而要看它能不能真的承接你接下来三到五年的发展。${star === "破军" || star === "七杀" ? "这一步带着明显的转型意味，适合破局，但每一次动作都要留出缓冲和回撤空间。":"这一步更适合稳扎稳打，把位置抬高，把成绩坐实。"} `,
      `【财运节奏】财帛宫为${stars(wealthP)}，求财结构偏向${wealthMode(wealthP.stars[0] || star)}。正财仍然以主业现金流、岗位稳定度与专业溢价为主；偏财若要布局，最好建立在你已经跑顺的能力、项目、作品或资源之上。若煞曜或化忌牵动财帛，最要防的不是“没机会”，而是高估了自己当下能承受的节奏和风险。`,
      `【四化引动与提醒】${fourImpactText(limitFour)} 这一步运最值得抓的是${decadeTheme(star)}对应的窗口，最需要提防的是节奏失衡、承诺过量，或者感情和事业彼此牵扯。更稳的做法，是每年固定回头看一次自己的四条主线：工作有没有站稳，钱有没有留下，关系有没有拖累，身体有没有发出提醒。`,
    ];
  });
}

function activeDecades(chart: ZiweiChart) {
  const currentIndex = chart.decades.findIndex((decade) => decade.isCurrent);
  return chart.decades.slice(currentIndex >= 0 ? currentIndex : 0, (currentIndex >= 0 ? currentIndex : 0) + 3);
}

function mutualFourInfluence(from: ZiweiChart, to: ZiweiChart) {
  const impacts = from.palaces.flatMap((p) => p.four.map((f) => ({ palace: p.name, item: f })));
  if (!impacts.length) return `${from.name}的生年四化没有可用落宫记录，关系影响仅从命宫、夫妻宫与福德宫整体观察。`;
  return impacts.slice(0, 4).map(({ palace: fromPalace, item }) => {
    const target = palace(to, fromPalace);
    const type = item.includes("化禄") ? "提供资源、好感或顺手机会" : item.includes("化权") ? "带来推动、要求与责任感" : item.includes("化科") ? "带来体面沟通、名誉缓冲或专业支持" : "触发执念、压力或反复议题";
    return `${from.name}的${fromPalace}见${item}；与${to.name}同名${target.name}宫（${stars(target)}）并置观察时，关系中容易在该生活领域表现为${type}。`;
  }).join(" ");
}

function calculationScope(chart: ZiweiChart) {
  const meta = chart.calculationMeta;
  if (!meta) {
    return "该命盘来自旧版缓存，未附计算能力记录；报告只引用页面可见的本命宫位、生年四化和大限数据，不扩展宫干飞化、流年或流月断语。";
  }
  const available = Object.values(meta.features)
    .filter((feature) => feature.calculationAvailable)
    .map((feature) => feature.note);
  const unavailable = Object.values(meta.features)
    .filter((feature) => !feature.calculationAvailable)
    .map((feature) => feature.note);
  return `已使用：${available.join("；")}。未引用：${unavailable.join("；")}。`;
}

function relationshipCycleParagraphs(chartA: ZiweiChart, chartB: ZiweiChart, synastry: ZiweiSynastry) {
  const aDecades = activeDecades(chartA);
  const bDecades = activeDecades(chartB);
  const count = Math.min(aDecades.length, bDecades.length, 3);
  if (!count) {
    return ["双方命盘没有可用的大限记录，因此本报告不生成关系周期推断。请重新排盘后再查看。"];
  }
  return Array.from({ length: count }, (_, step) => step).flatMap((step) => {
    const aDecade = aDecades[step];
    const bDecade = bDecades[step];
    const aLimit = chartA.palaces.find((item) => item.branch === aDecade.palaceBranch) || palace(chartA, aDecade.palaceName);
    const bLimit = chartB.palaces.find((item) => item.branch === bDecade.palaceBranch) || palace(chartB, bDecade.palaceName);
    const sameTone = aLimit.stars.some((star) => bLimit.stars.includes(star)) || aDecade.fourTransformations.some((f) => bDecade.fourTransformations.some((bf) => bf.slice(-2) === f.slice(-2)));
    return [
      `【阶段 ${step + 1}：${chartA.name}${aDecade.ageStart}-${aDecade.ageEnd}岁 / ${chartB.name}${bDecade.ageStart}-${bDecade.ageEnd}岁】${chartA.name}这一限落${aDecade.palaceName}（${aDecade.stem}${aDecade.palaceBranch}），主星为${stars(aLimit)}；${chartB.name}这一限落${bDecade.palaceName}（${bDecade.stem}${bDecade.palaceBranch}），主星为${stars(bLimit)}。看关系阶段，不是只看当下感情热不热，而是看两个人是不是刚好走在能彼此靠近、彼此接住的运程里。`,
      `${sameTone ? "这一阶段整体节奏比较同频，事业推进、生活安排和长期目标更容易谈到一起。" : "这一阶段时差感会更明显，常见情况是一方已经想往前走，另一方还在处理自己的现实课题。"} 真正的考验不是谁更上头，而是谁更愿意把自己的计划、压力和底线说清楚，让对方知道这段关系该怎么往下接。`,
      `本阶段大限四化分别为：${chartA.name}${aDecade.fourTransformations.join("、")}；${chartB.name}${bDecade.fourTransformations.join("、")}。这些是各自大限层级的背景，不等同于跨盘飞化。更稳的处理方式不是急着给关系下定义，而是把关键决定拆成能执行的时间表。合盘综合分${synastry.score}/100说明：基础吸引并不弱，真正决定长期走向的，是你们能不能把现实节奏校准。`,
    ];
  });
}

export function buildZiweiNatalReport(chart: ZiweiChart): ZiweiReportSection[] {
  const life = palace(chart, "命宫");
  const bodyName = chart.shenPalace.slice(1);
  const body = palace(chart, bodyName || "福德");
  const fortune = palace(chart, "福德");
  const career = linkedField(chart, "官禄", ["命宫", "财帛", "迁移"]);
  const wealth = linkedField(chart, "财帛", ["田宅", "福德"]);
  const love = linkedField(chart, "夫妻", ["福德", "迁移", "子女"]);
  const social = linkedField(chart, "交友", ["兄弟", "迁移"]);
  const family = linkedField(chart, "田宅", ["父母", "子女"]);
  const health = linkedField(chart, "疾厄", ["福德"]);
  const patterns = chart.patterns.length ? chart.patterns.join("、") : "未形成强烈单一格局，需看宫位联动";
  const pattern = classifyPattern(chart);
  const careerStar = career.core.stars[0] || chart.mainStar;
  const wealthStar = wealth.core.stars[0] || chart.mainStar;

  return [
    {
      id: "calculation-scope",
      icon: "i",
      title: "排盘依据与计算范围",
      subtitle: "明确本次报告实际使用的数据，避免把未计算项目写进结论",
      highlight: "报告只解释排盘引擎已经返回的数据；未计算的飞化、流年与流月不会由文案自行补推。",
      body: [calculationScope(chart)],
    },
    {
      id: "core",
      icon: "✦",
      title: "命盘总览与核心格局定性",
      subtitle: "命宫、身宫、福德与生年四化总断",
      highlight: `这张盘的主轴不在“藏”，而在“成”。${chart.mainStar}坐命，${chart.elementBureau}为底，格局取${pattern.level}的「${pattern.name}」，说明你的人生发力点，终究会落在把${life.focus}真正推到现实层面的这件事上。`,
      body: [
        `【核心定调】${palaceLogic(life)}命宫定外在行为模式，主星${stars(life)}说明你面对机会时更倾向以${life.focus}为起点。三方四正需联动官禄、财帛、迁移：${linkedPalaceLogic(chart, ["官禄", "财帛", "迁移"])}。这不是一张只讲“性格像不像”的盘，它更像是在说明：你怎样把自己的反应、判断和资源组织起来，最后变成别人看得见的成果。`,
        `【命身合参】身宫落${chart.shenPalace}，坐宫主星为${stars(body)}，代表后天越走越重视${body.focus}。福德宫为${stars(fortune)}，对应精神底色与长期幸福感。命宫看你怎么启动，身宫看你最终把力气放在哪里，福德宫看你内在能不能撑得住。三者合参后，你的核心课题不是“换一个完全不同的人生”，而是把先天反应训练成稳定方法。`,
        `【格局判定】本命核心格局标注为「${pattern.name}」，性质为「${pattern.level}」。判断依据为：${pattern.basis}。这里要说得谨慎一点：格局不是奖状，也不是判决书。它更像一个结构提示，告诉你哪些领域上限较高，哪些条件必须补齐。成格要靠平台与执行兑现；半成格要靠后天节奏补足；若有破格因素，则先处理煞曜、化忌或三方四正失衡，再谈放大。`,
        `【生年四化总断】生年四化分布为：${chart.palaces.flatMap((p) => p.four.map((f) => `${p.name}${f}`)).join("、") || "四化分散"}。${chart.palaces.flatMap((p) => p.four).slice(0, 4).map((f) => `${f}主${explainFourTransformation(f)}`).join("；") || "四化分散时，应回到命宫、身宫与三方四正看主轴。"} 四化不是简单吉凶：化禄看资源从哪里来，化权看你在哪些地方必须承担，化科看名誉与缓冲，化忌看执念和修正点。读四化时，最重要的是把它落回现实场景，而不是只停在术语上。`,
      ],
      bullets: ["依据字段：命宫、身宫、福德宫、主星、庙旺利陷、生年四化", ...ZIWEI_REPORT_GENERATION_RULES.slice(0, 3)],
    },
    {
      id: "career",
      icon: "◇",
      title: "事业运深度专项解析",
      subtitle: "官禄宫为核心，联动命宫、财帛宫、迁移宫三方四正",
      highlight: `官禄宫落${stars(career.core)}，说明你的事业不是靠一时热度撑起来的，而是要靠路线、专业和持续兑现。真正适合你的位置，是那些能把执行力、判断力和个人招牌一起做厚的方向：${careerTrack(careerStar)}。`,
      body: [
        `【事业天赋与核心竞争力】${palaceLogic(career.core)}官禄宫代表职业舞台、社会评价与长期事业结构。${summarizeStarDoctrine(career.core.stars)}。联动命宫、财帛宫、迁移宫后可见：${linkedPalaceLogic(chart, ["命宫", "财帛", "迁移"])}。你的核心竞争力不宜只靠临场发挥，而要靠长期可复用的方法、作品、项目履历与专业信用沉淀。`,
        `【行业与岗位方向】以官禄主星${careerStar}取象，适配方向偏向${careerTrack(careerStar)}。若选择打工，适合进入有明确目标和资源平台的组织，通过责任边界扩大获得晋升；若选择创业或自由职业，应先建立稳定现金流与客户来源，再扩大投入。排序上更建议：专业型岗位 / 项目制角色优先，其次是自由职业，创业需等资源、团队、现金流三项稳定后再推进。`,
        `【晋升节奏与贵人小人】官禄三方见${career.fourText}。${fourWithMeaning(career.core)}化禄与化科有助贵人、作品曝光和口碑积累；化权提示责任加重与竞争加剧；化忌则容易在流程、承诺、沟通或上级预期中出现反复。需重点注意：不清楚的工作边界、口头承诺、临时背锅和方向频繁变化。`,
        `【短板与规避】事业短板主要不是能力不足，而是能量分散或阶段目标不清。建议把职业规划拆成三层：当前能交付的成果、半年内能被看见的能力标签、三年内希望占据的行业位置。每一层都要有具体证据，而不是只停留在愿望。`,
      ],
    },
    {
      id: "wealth",
      icon: "◈",
      title: "财运深度专项解析",
      subtitle: "财帛宫为核心，联动田宅宫、福德宫、兄弟宫",
      highlight: `财帛宫见${stars(wealth.core)}，这张盘的重点从来不只是“赚”，而是“赚到之后能不能沉下来、守下来、继续放大”。更顺手的求财路径，会偏向${wealthMode(wealthStar)}这类结构型累积。`,
      body: [
        `【正财逻辑】${palaceLogic(wealth.core)}财帛宫看现金流、收入方式、金钱安全感。${summarizeStarDoctrine(wealth.core.stars)}。正财部分以主业收入、岗位稳定度、能力溢价为主，判断时必须联动官禄宫：${linkedPalaceLogic(chart, ["官禄", "命宫"])}。你的正财增长更依赖长期专业信用和可量化成果，而非短期运气。`,
        `【偏财与副业】偏财需看财帛、福德、兄弟与交友资源。当前财富结构倾向于${wealthMode(wealthStar)}。如果发展副业，适合从已有技能、内容表达、项目经验或人脉资源切入，不宜一开始就做高成本、高杠杆、强不确定性的投入。`,
        `【守财与资产沉淀】田宅宫为${stars(palace(chart, "田宅"))}，福德宫为${stars(fortune)}，兄弟宫为${stars(palace(chart, "兄弟"))}。田宅看资产沉淀，福德看安全感，兄弟看同辈合作与资源分摊。若财帛见化忌或煞曜，需重点防范冲动消费、合伙账目模糊、替人承担风险。`,
        `【资产配置建议】先建立稳定现金储备，再配置长期资产，最后才考虑高波动机会。涉及合作、借贷、投资时，务必用合同、预算表和退出机制替代口头信任。财运的重点不是赚一次大钱，而是建立能持续留住钱的结构。`,
      ],
    },
    {
      id: "love",
      icon: "♡",
      title: "感情婚姻特质",
      subtitle: "夫妻宫联动福德、迁移、子女宫",
      highlight: `感情里你不是没感觉，而是很看“对方能不能真的接住你”。夫妻宫坐${stars(love.core)}，再加上${love.fourText}这组引动，说明你在关系里最在意的，从来不只是心动，还有节奏、回应和长期感。`,
      body: [
        `【夫妻宫怎么看】夫妻宫看亲密关系中的期待、择偶偏好和相处节奏。你的夫妻宫为${stars(love.core)}，${summarizeStarDoctrine(love.core.stars)}。${summarizePalaceDoctrine("夫妻")} 这类配置不能简单断“早婚/晚婚”，更重要的是看你在关系里需要怎样的安全感。`,
        `【关系里的现实表现】福德宫代表你真正放松时的样子，迁移宫代表关系中的外部环境，子女宫代表恋爱表达和共同创造感。三者联动后，感情最怕的不是没有吸引，而是现实节奏、沟通频率和未来安排没有说清楚。`,
        `【四化牵动】${fourWithMeaning(love.core)} 感情里的化禄常表现为愿意投入，化权表现为控制节奏，化科表现为体面沟通，化忌则提示旧模式、执念或安全感议题需要被看见。`,
        `【相处建议】关系里不要用试探替代表达。更适合直接说清楚“我需要什么、我能给什么、我暂时做不到什么”。当双方都能把需求说成可执行的行为，而不是情绪指责，夫妻宫的能量才会稳定下来。`,
      ],
    },
    {
      id: "social-family-health",
      icon: "✧",
      title: "人际、家庭与身心状态",
      subtitle: "交友宫、田宅宫、疾厄宫综合判断",
      highlight: `这三宫看的是你生活能不能稳住。朋友值不值得深交、家能不能让你放松、身体会不会替你把压力说出来，盘里其实都写着：交友宫${stars(social.core)}，田宅宫${stars(family.core)}，疾厄宫${stars(health.core)}。`,
      body: [
        `【人际社交】人际社交看交友宫与兄弟宫。交友宫为${stars(social.core)}，${summarizeStarDoctrine(social.core.stars)}。${summarizePalaceDoctrine("交友")} 你适合筛选能共同推进目标的人，而不是把所有关系都维持在同等投入。`,
        `【家庭根基】家庭与根基看田宅、父母、子女宫。田宅宫为${stars(family.core)}，${summarizeStarDoctrine(family.core.stars)}。${summarizePalaceDoctrine("田宅")} 原生家庭带来的规则感会影响你对安全感的定义，但成年后的重点，是建立属于自己的生活秩序。`,
        `【身心节律】身心状态看疾厄宫与福德宫。疾厄宫为${stars(health.core)}，${summarizePalaceDoctrine("疾厄")} 这里不做医学判断，只提示日常节律：压力累积、睡眠、饮食、运动与情绪出口会直接影响状态。若福德宫承载力不足，建议用固定休息、轻运动和情绪记录来稳定内在能量。`,
      ],
    },
    {
      id: "cycles",
      icon: "↻",
      title: "十年大运详细走势分析",
      subtitle: "由当前大运起，顺看后三步运程",
      highlight: "这一节不泛讲吉凶，而是顺着你当前所处的大运往后看三步。重点不是“会不会顺”，而是每一个十年究竟先点亮哪一宫、放大哪一类机会，又会把哪一种压力推到台前。",
      body: buildDecadeParagraphs(chart),
    },
    {
      id: "twelve-palaces",
      icon: "☷",
      title: "十二宫全维度补充",
      subtitle: "每宫位按核心定位、星曜组合、现实影响补充",
      highlight: "前面几大主题先把命格、事业、财运、感情和十年大运主轴抓出来；这一节再把十二宫逐宫补齐，让你回看细节时有完整的盘面脉络。",
      body: chart.palaces.map((p) => palaceFullReading(chart, p)),
    },
    {
      id: "planning",
      icon: "✓",
      title: "整体总结与行动指南",
      subtitle: "提炼核心结论，并给出事业、财运长期规划",
      highlight: `把整张盘收回来讲，你的问题不是没方向，而是容易同时看见太多方向。${chart.mainStar}坐命，格局取${pattern.level}的${pattern.name}，所以事业宜走${careerTrack(careerStar)}，财务上更适合${wealthMode(wealthStar)}这种能慢慢做厚的路径。`,
      body: [
        `【核心结论一】命宫与身宫显示，你的人生发展不能只靠短期灵感，而要靠稳定结构承接天赋。越能把优势转成流程、作品、案例和长期信用，越容易走出稳定上升线。`,
        `【核心结论二】事业以官禄宫为主轴，适合在${careerTrack(careerStar)}中发力。长期规划上，先建立清晰能力标签，再扩大职责与资源边界，最后沉淀个人影响力或专业壁垒。`,
        `【核心结论三】财富以财帛宫为核心，求财方式倾向于${wealthMode(wealthStar)}。建议采用“安全现金流 + 长期资产 + 小比例弹性机会”的三层配置，不宜把主要资金压在高波动判断上。`,
        `【核心结论四】大运阶段会把本命优势带到不同领域。本命是体，决定你的底层结构；大运是用，决定某十年重点被引动的主题。顺势不是被动等待，而是在正确阶段做正确动作。`,
        `【行动指南】事业上每半年复盘一次项目成果、能力标签和资源网络；财运上每季度复盘现金流、固定支出、投资风险和合作账目。凡涉及重大决定，建议结合现实数据、专业意见与个人选择共同判断。`,
        `【合规说明】本报告基于传统紫微斗数理论推导，仅供人生规划参考，不构成任何决策的唯一依据。`,
      ],
    },
  ];
}

export function buildZiweiSynastryReport(chartA: ZiweiChart, chartB: ZiweiChart, synastry: ZiweiSynastry): ZiweiReportSection[] {
  const aLife = palace(chartA, "命宫");
  const bLife = palace(chartB, "命宫");
  const aLove = palace(chartA, "夫妻");
  const bLove = palace(chartB, "夫妻");
  const aFortune = palace(chartA, "福德");
  const bFortune = palace(chartB, "福德");
  const aCareer = palace(chartA, "官禄");
  const bCareer = palace(chartB, "官禄");
  const aWealth = palace(chartA, "财帛");
  const bWealth = palace(chartB, "财帛");
  const aHome = palace(chartA, "田宅");
  const bHome = palace(chartB, "田宅");
  const risks = [...chartA.palaces, ...chartB.palaces].flatMap((p) => p.four.filter((f) => f.includes("化忌")));

  return [
    {
      id: "relationship-total",
      icon: "♡",
      title: "合盘核心总评",
      subtitle: "整体匹配度、命身宫合参、格局适配性",
      highlight: `把两张盘放在一起看，这段关系并不缺吸引力，而且牵动点不浅。综合评分 ${synastry.score}/100，${scoreTone(synastry.score)}；真正决定它能不能往下走的，不是感觉够不够，而是两个人的现实节奏能不能慢慢对上。`,
      body: [
        `【整体匹配定性】双方命宫分别为：${chartA.name}${stars(aLife)}坐命，${chartB.name}${stars(bLife)}坐命。${chartA.name}盘面取象：${summarizeStarDoctrine(aLife.stars)}；${chartB.name}盘面取象：${summarizeStarDoctrine(bLife.stars)}。命宫合参看两个人面对世界的基本反应：谁更主动，谁更谨慎，谁需要掌控，谁需要空间。当前合盘为「${synastry.label}」，代表关系有牵引，但不做简单“必成/必分”判断。`,
        `【命宫 + 身宫合参】${chartA.name}身宫落${chartA.shenPalace}，${chartB.name}身宫落${chartB.shenPalace}。命宫看初始吸引与日常反应，身宫看长期追求和后天投入方向。若命宫互补、身宫同向，关系更容易把吸引落到共同目标；若命宫相吸但身宫错位，则容易热度强、现实安排慢。`,
        `【格局适配性】${chartA.name}格局参考：${chartA.patterns.join("、") || "未见强烈单一格局"}；${chartB.name}格局参考：${chartB.patterns.join("、") || "未见强烈单一格局"}。格局同频时，双方对人生节奏和成就方式更容易理解；格局互补时，能互相补短；若格局相冲，则需要更明确的边界和现实分工。${synastry.chemistry}`,
        `【核心定位】这段关系的价值不在于制造强烈情绪，而在于能否把吸引力转成稳定行动。如果双方愿意把需求、边界、金钱、事业节奏和未来计划说清楚，关系会比表面分数更有成长空间。`,
      ],
    },
    {
      id: "personality",
      icon: "✦",
      title: "命宫性格合参",
      subtitle: "核心维度之一：命宫主星对比、互补优势与天然冲突",
      highlight: `${chartA.name}命宫为${stars(aLife)}，${chartB.name}命宫为${stars(bLife)}。光看这一层，就能看出你们为什么会互相吸住；但同样也是这一层，最容易带出“一个想快一点，一个想再看看”的节奏差。`,
      body: [
        `${chartA.name}的命宫主星组合提示其行为模式偏向${aLife.focus}，核心取象为：${summarizeStarDoctrine(aLife.stars)}；${chartB.name}的命宫主星组合则偏向${bLife.focus}，核心取象为：${summarizeStarDoctrine(bLife.stars)}。两个人相处时，第一层吸引往往来自对方身上自己不常使用、但内心认可的能力。`,
        `天然冲突来自节奏差：一方可能希望快速确认方向，另一方更需要观察和安全感。这里不能只看单星，而要看庙旺利陷与对宫照会。${summarizePalaceDoctrine("命宫")} 若一方主星处于庙旺，表达会更直接；若处于陷地，则容易用防御或沉默保护自己。`,
        `建议：日常沟通中避免把差异上升为态度问题。先确认“这是性格处理方式不同”，再讨论“我们具体怎么配合”，会比互相评判有效。`,
      ],
    },
    {
      id: "emotion",
      icon: "◇",
      title: "核心宫位深度合参",
      subtitle: "夫妻宫、财帛宫、官禄宫、福德宫四大核心宫位",
      highlight: `决定关系能不能走稳的，从来不只是心动，还包括夫妻宫合不合、钱能不能谈、事业节奏会不会彼此拖拽。先抓重点宫位：夫妻宫 ${stars(aLove)} × ${stars(bLove)}，财帛宫 ${stars(aWealth)} × ${stars(bWealth)}。`,
      body: [
        `【夫妻宫合参】夫妻宫看伴侣期待、相处模式与长期亲密需求。${chartA.name}夫妻宫为${stars(aLove)}，辅煞见${helpers(aLove)}，四化${four(aLove)}；${chartB.name}夫妻宫为${stars(bLove)}，辅煞见${helpers(bLove)}，四化${four(bLove)}。两人对感情的期待差异，主要体现在表达速度、承诺方式和安全感来源。若一方夫妻宫见化忌，需提前处理旧有执念、猜测和情绪回路。`,
        `【财帛宫合参】财帛宫看金钱观、消费模式和求财方式。${chartA.name}财帛宫${stars(aWealth)}，${chartB.name}财帛宫${stars(bWealth)}。若一方偏重稳定积累，另一方偏重体验或机会，关系中需设定共同支出、个人支出和大额决策规则，避免金钱成为隐性矛盾。`,
        `【官禄宫合参】官禄宫看事业追求与社会角色。${chartA.name}官禄宫${stars(aCareer)}，${chartB.name}官禄宫${stars(bCareer)}。若双方事业节奏同步，适合互相支持；若一方处于突破期、一方处于稳定期，容易出现陪伴时间、压力承接和未来规划不一致。`,
        `【福德宫合参】福德宫看精神状态、情绪恢复方式与三观底色。${chartA.name}福德宫${stars(aFortune)}，${chartB.name}福德宫${stars(bFortune)}。福德相合，情绪价值供给会更自然；福德差异大，则要尊重彼此的休息方式，不把沉默直接解读为疏离。`,
      ],
    },
    {
      id: "four-mutual",
      icon: "↯",
      title: "双方四化互涉影响",
      subtitle: "化禄、化权、化科、化忌落入对方命盘的牵动效应",
      highlight: "这一段看的是你们到底怎么彼此影响。有人会把资源带进来，有人会把压力带进来，也有人明明很在意，却总在最关键的地方把关系推向反复。四化互涉，就是把这层说清楚。",
      body: [
        `【计算边界】当前合盘未计算宫干飞化，因此本节不声称某一方的四化“飞入”对方某宫，只把双方生年四化与同名生活宫位并置观察。`,
        `【${chartA.name}对${chartB.name}的牵动】${mutualFourInfluence(chartA, chartB)}这里的“旺”不是谁单方面占便宜，而是观察双方是否能在同一生活主题上提供资源、推动、名誉缓冲或现实帮助。`,
        `【${chartB.name}对${chartA.name}的牵动】${mutualFourInfluence(chartB, chartA)}若双方同名夫妻、财帛、官禄或田宅宫同时承受化忌或煞曜压力，容易在承诺、金钱、事业安排和居住规划上形成反复，需要提前设边界。`,
        `【助力点与消耗点】化禄、化科多为助力点，表现为好感、资源、体面沟通和关系缓冲；化权多为推动点，既能带来执行，也会带来压力；化忌是消耗点，提示双方最容易执着、误解或反复争论的领域。判断时需与本命夫妻宫和福德宫合参，不做单一四化断论。`,
      ],
    },
    {
      id: "relationship-cycles",
      icon: "↻",
      title: "关系发展周期与大运走向",
      subtitle: "双方大运同步性与关系阶段推进",
      highlight: "感情不只看“适不适合”，还要看“是不是刚好走在同一个阶段”。这一节重点看双方大运有没有同频：若一方正在外冲，一方正在回收整理，关系就很容易出现时差感。",
      body: relationshipCycleParagraphs(chartA, chartB, synastry),
    },
    {
      id: "risks",
      icon: "!",
      title: "关系风险点与磨合指南",
      subtitle: "核心矛盾、沟通、金钱、事业、家庭五维建议",
      highlight: risks.length ? `这段关系最要小心的，不是没感情，而是这些地方会反复磨人：${risks.join("、")}。` : "盘里没有特别集中的化忌硬冲，但这不代表可以放着不管，真正要守的是沟通方式和现实节奏。",
      body: [
        `【核心矛盾根源】风险点不等于关系不好，而是提醒哪些场景最容易触发误会。当前盘面提示：${synastry.risk} 若化忌牵动夫妻、财帛、交友或田宅，常见矛盾会出现在承诺、金钱、朋友圈和生活安排上。化忌在本体系中按“执念、阻滞、反复消耗”处理，不作绝对坏结果。`,
        `【沟通建议】重要问题不要在情绪高点谈；把“你为什么不”改成“我需要的是”；把“你是不是不在乎”改成“我们能否约定一个回应方式”。沟通的目标不是赢，而是降低误读。`,
        `【金钱建议】共同支出、个人支出、大额决策和借贷边界必须提前说清。若双方财帛宫节奏不同，建议建立共同预算表，不把爱意和金钱承担混在一起。`,
        `【事业与家庭建议】事业压力高的阶段，关系容易被时间和情绪挤压；田宅宫差异大时，居住、家务、家庭责任会成为磨合点。建议把家庭规划拆成具体事项，而不是只谈愿景。`,
        `【长期预判】这段关系的长期走向取决于是否能把吸引力转成共同规则。若能稳定沟通、尊重边界、共同处理现实议题，关系质量会逐步提高；若长期回避金钱、时间和承诺问题，则容易在关键阶段反复消耗。`,
      ],
    },
    {
      id: "relationship-advice",
      icon: "✓",
      title: "合盘总结",
      subtitle: "3-5 条核心结论与长期经营要点",
      highlight: `最后把话说直白一点：${synastry.advice} 这段关系不是没有潜力，而是很吃你们愿不愿意把“喜欢”翻译成现实里的安排、边界和行动。`,
      body: [
        `核心结论一：双方命宫存在吸引结构，但长期关系不能只靠初始牵引，需要夫妻宫、福德宫与现实宫位共同支撑。`,
        `核心结论二：关系优势在于${synastry.chemistry}；关系挑战在于${synastry.risk}`,
        `核心结论三：四化互涉显示双方会在资源、责任、情绪和现实安排上互相牵动。助力点要主动承接，消耗点要提前设边界。`,
        `核心结论四：未来三步大运中，若双方节奏同频，适合共同推进现实目标；若节奏错位，要用计划表、预算表和沟通规则降低误会。`,
        `经营要点：每三个月复盘一次时间投入、金钱安排、事业节奏、家庭规划和情绪需求。长期关系不是靠感觉自动前进，而是靠双方持续校准。`,
        `合规说明：本报告基于传统紫微斗数理论推导，仅供关系观察与人生规划参考，不构成任何现实决策的唯一依据。`,
      ],
    },
  ];
}

/* ================================================================
   R7 Fortune — 追星指引报告 (Fan Guidance Report)
   付费产品 ¥9.9 · 健康追星行动建议 + 简单合盘
   输入：用户命盘、爱豆命盘、双方简单合盘、艺人信息
   ================================================================ */

export type IdolFanGuideResult = {
  sections: ZiweiReportSection[];
  bondScore: number;
  bondLabel: string;
  purityScore: number;
  purityLabel: string;
};

function idolNameOf(artist: { name: string; stageName?: string }): string {
  if (artist.stageName && artist.stageName !== artist.name) return `${artist.stageName}（${artist.name}）`;
  return artist.stageName || artist.name;
}

// ============================================================
//  追星指引 · 八字前三柱合盤 + 近半年追星運程 輔助函數
// ============================================================

const BAZI_STEM_ELEMENT: Record<string, string> = {
  甲: "木", 乙: "木", 丙: "火", 丁: "火", 戊: "土", 己: "土", 庚: "金", 辛: "金", 壬: "水", 癸: "水",
};
const STEM_HE: [string, string][] = [["甲", "己"], ["乙", "庚"], ["丙", "辛"], ["丁", "壬"], ["戊", "癸"]];
const BRANCH_HE: [string, string][] = [["子", "丑"], ["寅", "亥"], ["卯", "戌"], ["辰", "酉"], ["巳", "申"], ["午", "未"]];
const BRANCH_CHONG: [string, string][] = [["子", "午"], ["丑", "未"], ["寅", "申"], ["卯", "酉"], ["辰", "戌"], ["巳", "亥"]];
const BRANCH_SANHE: string[][] = [["申", "子", "辰"], ["亥", "卯", "未"], ["寅", "午", "戌"], ["巳", "酉", "丑"]];
const SHENG = ["木", "火", "土", "金", "水"];
const KE = ["木", "土", "水", "火", "金"];

function stemChar(p: string): string { return p ? p[0] : ""; }
function branchChar(p: string): string { return p ? p[1] : ""; }

function elementAct(a: string, b: string): "生" | "剋" | "比和" | "與" {
  if (a === b) return "比和";
  if (SHENG[(SHENG.indexOf(a) + 1) % 5] === b) return "生";
  if (KE[(KE.indexOf(a) + 1) % 5] === b) return "剋";
  return "與";
}

function stemRelation(uS: string, iS: string): string {
  if (!uS || !iS) return "—";
  if (uS === iS) return "天干比和";
  if (STEM_HE.some(([a, b]) => (a === uS && b === iS) || (a === iS && b === uS))) return "天干五合";
  const ue = BAZI_STEM_ELEMENT[uS];
  const ie = BAZI_STEM_ELEMENT[iS];
  const r = elementAct(ue, ie);
  if (r === "生") return "你生 Ta（主動付出）";
  if (r === "剋") return "你剋 Ta（主導牽引）";
  const r2 = elementAct(ie, ue);
  if (r2 === "生") return "Ta 生你（被滋養）";
  if (r2 === "剋") return "Ta 剋你（被調和）";
  return "五行相濟";
}

function branchRelation(uB: string, iB: string): string {
  if (!uB || !iB) return "地支平和";
  if (BRANCH_HE.some(([a, b]) => (a === uB && b === iB) || (a === iB && b === uB))) return "地支六合";
  if (BRANCH_CHONG.some(([a, b]) => (a === uB && b === iB) || (a === iB && b === uB))) return "地支六沖";
  if (BRANCH_SANHE.some((g) => g.includes(uB) && g.includes(iB))) return "地支三合";
  return "地支平和";
}

function pillarPoints(stemRel: string, branchRel: string): number {
  let p = 0;
  if (stemRel.includes("五合") || stemRel.includes("比和")) p += 10;
  else if (stemRel.includes("生") || stemRel.includes("滋養")) p += 5;
  else if (stemRel.includes("剋")) p -= 3;
  else p += 2;
  if (branchRel.includes("六合") || branchRel.includes("三合")) p += 10;
  else if (branchRel.includes("六沖")) p -= 5;
  else p += 2;
  return p;
}

export type BaziPillar = {
  name: string;
  u: string;
  i: string;
  stemRel: string;
  branchRel: string;
};

export type BaziSynastry = {
  year: BaziPillar;
  month: BaziPillar;
  day: BaziPillar;
  score: number;
  label: string;
};

export function buildBaziSynastry(user: ZiweiChart, idol: ZiweiChart): BaziSynastry {
  const make = (name: string, uP: string, iP: string): BaziPillar => ({
    name,
    u: uP,
    i: iP,
    stemRel: stemRelation(stemChar(uP), stemChar(iP)),
    branchRel: branchRelation(branchChar(uP), branchChar(iP)),
  });
  const year = make("年柱", user.yearPillar, idol.yearPillar);
  const month = make("月柱", user.monthPillar, idol.monthPillar);
  const day = make("日柱", user.dayPillar, idol.dayPillar);
  const dayP = pillarPoints(day.stemRel, day.branchRel) * 2;
  const yearP = pillarPoints(year.stemRel, year.branchRel);
  const monthP = pillarPoints(month.stemRel, month.branchRel);
  const score = Math.max(58, Math.min(96, Math.round(50 + dayP + yearP + monthP)));
  const label =
    score >= 90 ? "八字相生之緣" : score >= 82 ? "三合六合多見" : score >= 74 ? "互補有情" : "節奏需磨合";
  return { year, month, day, score, label };
}

const SOLAR_MONTH_BRANCH: Record<number, string> = {
  1: "寅", 2: "卯", 3: "辰", 4: "巳", 5: "午", 6: "未",
  7: "申", 8: "酉", 9: "戌", 10: "亥", 11: "子", 12: "丑",
};

const FAN_THEMES = [
  { t: "打榜支持月", hint: (n: string) => `這個月適合把喜歡變成具體行動：為 ${n} 的舞台、新歌與正規榜單投入注意力，讓支持被看見。` },
  { t: "情緒充電月", hint: (n: string) => `你的情緒能量需要回補。多用 ${n} 的作品給自己充電，少刷爭議話題，把追星當成情緒避風港。` },
  { t: "緣分共振月", hint: (n: string) => `磁場與這個月共振度偏高，適合深度沉浸：${n} 的物料、直播或展演會特別滋養你，把握當下的連結感。` },
  { t: "理性消費月", hint: (n: string) => `這個月提醒你量力而行：為 ${n} 的周邊、演唱會都先定預算，不為焦慮加購。喜歡是長期的，不急這一時。` },
  { t: "自我成長月", hint: (n: string) => `把對 ${n} 的欣賞翻譯成自己的目標：學一項技能、推進一個計劃，讓偶像成為你的行動開關。` },
  { t: "沉澱觀望月", hint: (n: string) => `節奏偏靜，適合沉澱。少比較、少跟風，把這段時間用來整理自己從 ${n} 身上學到的事。` },
];

export type FanFortuneMonth = {
  label: string;
  branch: string;
  rel: "合" | "沖" | "平";
  theme: string;
  hint: string;
};

export function buildFanFortune(
  user: ZiweiChart,
  _idol: ZiweiChart,
  idolName: string,
  score: number,
): { months: FanFortuneMonth[]; summary: string } {
  const mingBranch = user.mingPalace ? user.mingPalace[0] : "";
  const now = new Date();
  const months: FanFortuneMonth[] = [];
  for (let i = 0; i < 6; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
    const y = d.getFullYear();
    const m = d.getMonth() + 1;
    const mb = SOLAR_MONTH_BRANCH[m] || "";
    const relFull = branchRelation(mingBranch, mb);
    const rel: "合" | "沖" | "平" = relFull.includes("六沖")
      ? "沖"
      : relFull.includes("六合") || relFull.includes("三合")
        ? "合"
        : "平";
    let themeIdx = (i + Math.round(score / 10)) % FAN_THEMES.length;
    if (rel === "合") themeIdx = 2;
    else if (rel === "沖") themeIdx = 3;
    const theme = FAN_THEMES[themeIdx];
    const tail =
      rel === "合"
        ? "本月緣分磁場順，追起來更鬆弛。"
        : rel === "沖"
          ? "本月節奏略衝，遇到熱點先退一步再決定。"
          : "本月中規中矩，穩定關注即可。";
    const label = i === 0 ? `本月（${m}月）` : `${y}年${m}月`;
    months.push({ label, branch: mb, rel, theme: theme.t, hint: theme.hint(idolName) + tail });
  }
  const summary = `未來半年是「${months[0].theme} → ${months[2].theme} → ${months[5].theme}」的節奏；本月重點：${months[0].hint}`;
  return { months, summary };
}

const ELEMENT_COLOR: Record<string, string> = {
  木: "綠色、青色系", 火: "紅色、粉紫色系", 土: "黃色、棕色系", 金: "白色、金色系", 水: "黑色、藍色系",
};
const NOBLE_OF: Record<string, string> = { 木: "水", 火: "木", 土: "火", 金: "土", 水: "金" };

// 紫微五行局（如「土五局」「水二局」）取基礎五行單字
function baseElement(bureau: string): string {
  const m = (bureau || "").match(/[木火土金水]/);
  return m ? m[0] : bureau;
}

export type FanTips = {
  ticketMonths: string[];
  halfSide: string;
  halfDetail: string;
  clothing: string;
  luckColorText: string;
};

// 從「你 × 愛豆」的合盤節奏，直接推出幾條實戰提點：搶票吉月 / 見面穿搭 / 上半年 vs 下半年
export function buildFanTips(
  user: ZiweiChart,
  idol: ZiweiChart,
  idolName: string,
  bazi: BaziSynastry,
): FanTips {
  const ming = user.mingPalace ? user.mingPalace[0] : "";
  const now = new Date();
  const months: { label: string; rel: "合" | "沖" | "平"; m: number }[] = [];
  for (let i = 0; i < 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
    const y = d.getFullYear();
    const m = d.getMonth() + 1;
    const mb = SOLAR_MONTH_BRANCH[m] || "";
    const relFull = branchRelation(ming, mb);
    const rel: "合" | "沖" | "平" = relFull.includes("六沖")
      ? "沖"
      : relFull.includes("六合") || relFull.includes("三合")
        ? "合"
        : "平";
    months.push({ label: i === 0 ? `本月（${m}月）` : `${y}年${m}月`, rel, m });
  }
  const lucky = months.filter((x) => x.rel === "合");
  const ticketMonths = lucky.length ? lucky.slice(0, 3).map((x) => x.label) : [];

  const h1 = months.filter((x) => x.m <= 6 && x.rel === "合").length;
  const h2 = months.filter((x) => x.m > 6 && x.rel === "合").length;
  const halfSide = h1 > h2 ? "上半年（1–6 月）" : h2 > h1 ? "下半年（7–12 月）" : "上半年下半年都差不多";
  const halfDetail = `講實話，你命宮跟流月在 ${halfSide} 跟 ${idolName} 最合，這段時間去搶票、見面、深度追都順手；另一半年就別硬衝了，穩穩關注、養精蓄銳，等旺月再爆發。`;

  const uEl = baseElement(user.elementBureau);
  const iEl = baseElement(idol.elementBureau);
  const noble = NOBLE_OF[uEl] || uEl;
  const nobleColor = ELEMENT_COLOR[noble] || "中性色";
  const myColor = ELEMENT_COLOR[uEl] || "中性色";
  const idolColor = ELEMENT_COLOR[iEl] || "中性色";
  const eleRel = elementAct(uEl, iEl);
  let clothing: string;
  if (bazi.score >= 82) {
    clothing = `你倆八字合得來，去見面就大膽穿 ${idolName} 的本命色（${idolColor}），站在一起那種共振感最強；想低調點，就戴個你自己的本命色（${myColor}）小物。`;
  } else if (eleRel === "剋") {
    clothing = `你倆五行有點互剋，去見面先穿「生你」的貴人色（${nobleColor}）把氣場墊高一點，看 ${idolName} 會更順；再點一抹 ${idolColor} 接緣分。`;
  } else {
    clothing = `穿你自己的本命色（${myColor}）就夠穩了，想加點緣分感，配件帶一點 ${idolColor} 就行。`;
  }
  const luckColorText =
    bazi.score >= 82
      ? idolColor
      : eleRel === "剋"
        ? `${nobleColor} 為主、${idolColor} 點綴`
        : `${myColor} 為主、${idolColor} 點綴`;

  return { ticketMonths, halfSide, halfDetail, clothing, luckColorText };
}

export function buildIdolFanGuide(
  user: ZiweiChart,
  idol: ZiweiChart,
  synastry: ZiweiSynastry,
  artist: { name: string; stageName?: string; groupName?: string },
): IdolFanGuideResult {
  const idolName = idolNameOf(artist);
  const score = synastry.score;
  const label = synastry.label;
  const bazi = buildBaziSynastry(user, idol);
  const tips = buildFanTips(user, idol, idolName, bazi);
  const pillarScore = (p: BaziPillar) => pillarPoints(p.stemRel, p.branchRel);
  const ranked = [bazi.day, bazi.month, bazi.year].slice().sort((a, b) => pillarScore(b) - pillarScore(a));
  const bestP = ranked[0];
  const worstP = ranked[2];
  const eleRel = elementAct(baseElement(user.elementBureau), baseElement(idol.elementBureau));

  // ---- 追星正源度（健康追星能量）----
  const userForPalace = palace(user, "福德");
  const selfStars = [...userForPalace.stars, ...userForPalace.assistants];
  let selfFactor = 4;
  if (selfStars.some((s) => ["太阴", "天同", "天梁", "天府", "天相"].includes(s))) selfFactor += 6;
  if (selfStars.some((s) => ["贪狼", "破军", "七杀", "擎羊", "陀罗"].includes(s))) selfFactor -= 4;
  const purityScore = Math.max(60, Math.min(96, Math.round(54 + score * 0.45 + selfFactor)));
  const purityLabel =
    purityScore >= 88 ? "初心穩定型 · 你的喜歡很乾淨"
      : purityScore >= 80 ? "理性熾熱型 · 熱情但有分寸"
      : purityScore >= 72 ? "成長共生型 · 把愛變成動力"
      : "需微調型 · 偶爾容易上頭";

  const userFordePalace = palace(user, "交友");

  const sections: ZiweiReportSection[] = [
    {
      id: "bond",
      icon: "✨",
      title: "緣分红毯 · 你和 Ta 的磁場速覽",
      subtitle: "紫微合盤 + 八字前三柱，看你和這位愛豆的緣分基調",
      highlight: `你與 ${idolName} 的紫微磁場緣分為 ${score} 分（${label}）；八字前三柱合盤再補一刀：日柱「${bazi.day.u} × ${bazi.day.i}」呈${bazi.day.stemRel}／${bazi.day.branchRel}，整體八字合緣 ${bazi.score} 分（${bazi.label}）。`,
      body: [
        `合盤顯示：${synastry.chemistry} 你的命宮主星為 ${user.mainStar}，而 ${idolName} 的命宮主星為 ${idol.mainStar}；兩者疊加，會形成一種「你被 Ta 的某個特質持續吸引」的牽引感。`,
        `【年·月·日 前三柱合盤】年柱 你 ${bazi.year.u} × ${idolName} ${bazi.year.i}（${bazi.year.stemRel}／${bazi.year.branchRel}）；月柱 你 ${bazi.month.u} × ${bazi.month.i}（${bazi.month.stemRel}／${bazi.month.branchRel}）；日柱 你 ${bazi.day.u} × ${bazi.day.i}（${bazi.day.stemRel}／${bazi.day.branchRel}）。`,
        `【日柱·核心緣分】日柱代表「你們相處的本質」。天干「${stemChar(bazi.day.u)} × ${stemChar(bazi.day.i)}」呈${bazi.day.stemRel}，地支「${branchChar(bazi.day.u)} × ${branchChar(bazi.day.i)}」呈${bazi.day.branchRel}——這決定了你們連結是天然滋養、還是需要一點現實邊界感。`,
        `【五行與節奏】你為 ${user.elementBureau}（本命五行局），Ta 為 ${idol.elementBureau}。五行相生相濟時追星感受更順；若相剋，則更容易「上頭—冷靜」反覆，需要多一點自我覺察。八字合緣 ${bazi.score} 分（${bazi.label}）。`,
      ],
      bullets: [
        `紫微磁場：${score} / 100（${label}）`,
        `八字合緣：${bazi.score} / 100（${bazi.label}）`,
        `日柱核心：${bazi.day.u} × ${bazi.day.i}（${bazi.day.stemRel}）`,
      ],
    },
    {
      id: "purity",
      icon: "🌿",
      title: "追星正源度 · 你的健康追星能量",
      subtitle: "評估你這段追星關係的「乾淨程度」與自洽度",
      highlight: `你的追星正源度為 ${purityScore} 分（${purityLabel}）。正源度越高，代表你越能把喜歡轉化為正向情緒與自我成長，而不是消耗。`,
      body: [
        `從你的命盤看，福德宮（管精神能量）坐${selfStars.length ? selfStars.slice(0, 2).join("、") : "輔曜平和"}，說明你的情緒自洽能力${selfFactor >= 6 ? "本就不錯，不容易被飯圈情緒裹挾" : selfFactor <= 0 ? "偶爾會被熱度帶著走，需要主動踩一下刹車" : "中規中矩，熱的時候記得留一點冷靜空間"}。`,
        `交友宮（管粉絲社群）坐${userFordePalace.stars.length ? userFordePalace.stars.slice(0, 2).join("、") : "星曜平和"}，提醒你：同好圈既能互相打氣，也容易集體上頭。選對社群，比追更多物料更重要。`,
        `正源度不是「喜歡得夠不夠」，而是「喜歡得健不健康」。這一節給你一個客觀鏡子，後面的行動建議會告訴你怎麼把分數繼續往上拉。`,
      ],
      bullets: [
        `情緒自洽：${selfFactor >= 6 ? "穩" : selfFactor <= 0 ? "需留意" : "尚可"}`,
        `社群邊界：${userFordePalace.stars.includes("文昌") || userFordePalace.stars.includes("文曲") ? "擅長理性討論" : "容易被氛圍帶動"}`,
        `現實落地：把愛意轉成動力，分數還能更高`,
      ],
    },
    {
      id: "deep",
      icon: "🔮",
      title: "合盤深度解析 · 你們合不合、怎麼合",
      subtitle: "從命盤一層層拆：最合的層次、要留神的層次、相處節奏",
      highlight: `你跟 ${idolName} 這段緣，本質是「${score >= 82 ? "很合、天然滋養型" : score >= 74 ? "互補、需要一點經營型" : "有火花、節奏要磨合型"}」。下面從你們的八字與命盤一層層拆：哪裡最合、哪裡要留神。`,
      body: [
        `① 整體緣分：紫微磁場 ${score} 分（${label}），八字合緣 ${bazi.score} 分（${bazi.label}）。兩套系統都指向同一件事——你們不是隨便喜歡，是有真實磁場基礎的。`,
        `② 最合的層次：你們的「${bestP.name}」最貼（${bestP.stemRel}／${bestP.branchRel}）。這一層是你被 ${idolName} 持續吸引的來源，也是追起來最不費力的部分。`,
        `③ 要留神的層次：你的「${worstP.name}」和 Ta 有點${worstP.stemRel.includes("剋") || worstP.branchRel.includes("沖") ? "相剋／相沖" : "不順暢"}（${worstP.stemRel}／${worstP.branchRel}）。這不代表不合，而是提醒你：這段緣分偶爾會「上頭快、冷靜也快」，給自己留一點界線就好。`,
        `④ 五行相處：你屬 ${user.elementBureau}，${idolName} 屬 ${idol.elementBureau}，${eleRel === "生" ? "你默默滋養 Ta，適合做那種安靜支持型粉絲" : eleRel === "剋" ? "你主動牽引 Ta，容易是衝在前排的那種" : eleRel === "比和" ? "你們同頻，追起來像照鏡子" : "元素相濟、節奏平和"}。`,
        `⑤ 命宮主星：你 ${user.mainStar} × ${idolName} ${idol.mainStar}。${synastry.chemistry}`,
      ],
      bullets: [
        `最合層次：${bestP.name}（${bestP.stemRel}／${bestP.branchRel}）`,
        `需留神：${worstP.name}（${worstP.stemRel}／${worstP.branchRel}）`,
        `五行相處：${user.elementBureau} × ${idol.elementBureau}（${eleRel}）`,
      ],
    },
    {
      id: "tips",
      icon: "🎯",
      title: "追星小抄 · 什麼時候搶票 / 穿什麼 / 上半年還下半年",
      subtitle: "坦白講，都是從你跟 Ta 的合盤直接推的",
      highlight: `下面這幾條不唬你，都是從你跟 ${idolName} 的合盤直接推的——啥時候搶票順、見面穿啥、上半年衝還是下半年衝。`,
      body: [
        `【什麼時候搶票】${tips.ticketMonths.length ? `搶票這種事，挑你磁場跟 Ta 最合的月份最穩。你今年在 ${tips.ticketMonths.join("、")} 這幾個月手氣最旺，能搶的場次、簽售、抽選都往這幾個月排，命中率會高不少。` : `你這半年磁場偏平，沒有哪個月特別旺，那就別糾結了——官方一放票就衝，手快有手慢無。`}`,
        `【見面穿什麼】${tips.clothing}`,
        `【上半年還是下半年追】${tips.halfDetail}`,
      ],
      bullets: [
        `搶票旺月：${tips.ticketMonths.join("、") || "全年平穩，放票就衝"}`,
        `見面色系：${tips.luckColorText}`,
        `主追節奏：${tips.halfSide}`,
      ],
    },
    {
      id: "action",
      icon: "✅",
      title: "行動建議 · 健康追星三件事",
      subtitle: "幾句話，把喜歡留在清爽的區間",
      highlight: `健康追星三句話：喜歡落在作品上、錢包設上限、把 Ta 的職業精神借來點燃自己。`,
      body: [
        `① 應援看作品：舞台、音樂、專業成長才是這段緣分最持久的部分，少刷量、多真誠。`,
        `② 錢包留白：周邊演唱會先定月度預算，不為焦慮加購；不打探隱私、不跟機、不越界。`,
        `③ 借光成長：把 ${idolName} 的自律翻譯成你自己的小目標——追星最高級的回報，是順手變成更好的自己。`,
      ],
      bullets: [
        `看作品、少刷量`,
        `預算先定、不越界`,
        `借偶像職業精神點燃自己`,
      ],
    },
    {
      id: "blessing",
      icon: "💌",
      title: "正能量寄語 · 給你一段可以反覆看的話",
      subtitle: "把喜歡留在欣賞與成長的區間裡",
      highlight: `${synastry.advice} 喜歡一個人，本來就是一件很輕、很亮的事。把它留在「欣賞」與「成長」的區間裡，它就不會變重。`,
      body: [
        `你不需要成為誰的誰，也不需要證明自己粉得夠格。認真生活、認真喜歡，本身就是這段緣分最好的樣子。`,
        `合規說明：本報告基於傳統紫微斗數、八字與命理娛樂推導，僅供情緒參考與正向引導，不構成任何現實決策的唯一依據。`,
      ],
      bullets: [
        `你認真生活的樣子，就是最好的應援`,
        `喜歡很輕、很亮，別讓它變重`,
      ],
    },
  ];

  return { sections, bondScore: score, bondLabel: label, purityScore, purityLabel };
}
