import type { TarotCard } from "@/data/tarotCards";
import { getStarDoctrine, ZIWEI_READING_PRINCIPLES } from "@/data/ziweiDoctrine";

export type ZiweiLuck = "great" | "good" | "neutralGood" | "neutral" | "neutralBad" | "bad";
export type ZiweiCategory = "main" | "assistant";
export type DualQuestionScene = "love" | "career" | "money" | "decision" | "general";

export interface ZiweiCard {
  id: string;
  name: string;
  category: ZiweiCategory;
  luck: ZiweiLuck;
  image: string;
  traits: string[];
  bodyMeaning: string;
}

export interface DrawnTarotCard extends TarotCard {
  reversed: boolean;
}

export interface DualReading {
  tone: "大吉" | "偏吉" | "先吉后阻" | "先阻后吉" | "偏凶";
  headline: string;
  freeSummary: string;
  deep: string[];
  actions: string[];
  matrix: string;
  ziweiLabel: "吉" | "凶";
  tarotLabel: "吉" | "凶";
}

export const ZIWEI_TAROT_PRICE = {
  first: 19.9,
  standard: 39.9,
  focused: 59.9,
};

export const ZIWEI_CARDS: ZiweiCard[] = [
  { id: "ziwei", name: "紫微", category: "main", luck: "good", image: "/ziwei-tarot/ziwei.png", traits: ["尊贵", "主导", "格局", "压力"], bodyMeaning: "事情的核心在于主导权和格局判断，适合从高处统筹，不适合被情绪牵着走。" },
  { id: "tianji", name: "天机", category: "main", luck: "neutralGood", image: "/ziwei-tarot/tianji.png", traits: ["变动", "智慧", "谋划", "奔波"], bodyMeaning: "事情根基带有变化与谋划性质，关键不是硬冲，而是调整策略和信息判断。" },
  { id: "taiyang", name: "太阳", category: "main", luck: "good", image: "/ziwei-tarot/taiyang.png", traits: ["光明", "外放", "事业", "人缘"], bodyMeaning: "事件底色偏公开、外放和被看见，越透明越有利，适合主动表达。" },
  { id: "wuqu", name: "武曲", category: "main", luck: "good", image: "/ziwei-tarot/wuqu.png", traits: ["财星", "务实", "果断", "刚性"], bodyMeaning: "问题本质落在资源、效率和现实回报上，务实判断会比感受判断更可靠。" },
  { id: "tiantong", name: "天同", category: "main", luck: "good", image: "/ziwei-tarot/tiantong.png", traits: ["享福", "温和", "贵人", "慵懒"], bodyMeaning: "事情底色温和，有缓冲和贵人，但容易因为拖延或依赖而错过窗口。" },
  { id: "lianzhen", name: "廉贞", category: "main", luck: "neutral", image: "/ziwei-tarot/lianzhen.png", traits: ["复杂", "桃花", "是非", "精密"], bodyMeaning: "这件事内部结构复杂，牵涉欲望、规则和边界，必须先分清责任与动机。" },
  { id: "tianfu", name: "天府", category: "main", luck: "good", image: "/ziwei-tarot/tianfu.png", traits: ["库星", "稳重", "包容", "财库"], bodyMeaning: "根基偏稳，资源和承接力足，适合慢慢累积，不适合短线赌一把。" },
  { id: "taiyin", name: "太阴", category: "main", luck: "good", image: "/ziwei-tarot/taiyin.png", traits: ["财星", "内敛", "情绪", "不动产"], bodyMeaning: "事件深层和安全感、情绪价值、隐性资源有关，越细致越能看出机会。" },
  { id: "tanlang", name: "贪狼", category: "main", luck: "neutralGood", image: "/ziwei-tarot/tanlang.png", traits: ["欲望", "桃花", "机遇", "多才"], bodyMeaning: "事情带有吸引、欲望和机会扩张，成败取决于能否克制贪多和分心。" },
  { id: "jumen", name: "巨门", category: "main", luck: "neutralBad", image: "/ziwei-tarot/jumen.png", traits: ["是非", "口舌", "洞察", "猜忌"], bodyMeaning: "根源在沟通误差、猜测和信息不透明，越含糊越容易引发是非。" },
  { id: "tianxiang", name: "天相", category: "main", luck: "good", image: "/ziwei-tarot/tianxiang.png", traits: ["辅佐", "稳重", "体面", "规划"], bodyMeaning: "本质重在秩序、合作和体面推进，按流程走比临场发挥更有利。" },
  { id: "tianliang", name: "天梁", category: "main", luck: "good", image: "/ziwei-tarot/tianliang.png", traits: ["荫星", "长辈", "化解", "清高"], bodyMeaning: "底层有化解力和保护力，适合借助经验、规则或成熟人士的建议。" },
  { id: "qisha", name: "七杀", category: "main", luck: "neutralBad", image: "/ziwei-tarot/qisha.png", traits: ["冲劲", "风险", "开创", "刚烈"], bodyMeaning: "事情本质带风险和突破性，能开局，但代价明确，不能只看刺激感。" },
  { id: "pojun", name: "破军", category: "main", luck: "neutralBad", image: "/ziwei-tarot/pojun.png", traits: ["颠覆", "破坏", "创新", "变动"], bodyMeaning: "这件事会打破旧结构，适合重启和切换，不适合期待一切维持原状。" },
  { id: "zuofu", name: "左辅", category: "assistant", luck: "good", image: "/ziwei-tarot/zuofu.png", traits: ["助力", "辅佐", "贵人", "坚持"], bodyMeaning: "事件背后有可见助力，关键是接受支持并稳定推进。" },
  { id: "youbi", name: "右弼", category: "assistant", luck: "good", image: "/ziwei-tarot/youbi.png", traits: ["助力", "暗贵", "协调", "人脉"], bodyMeaning: "隐性人脉和协调关系是核心，适合通过柔性沟通打开局面。" },
  { id: "wenchang", name: "文昌", category: "assistant", luck: "good", image: "/ziwei-tarot/wenchang.png", traits: ["文智", "学业", "文书", "条理"], bodyMeaning: "事情根基落在文字、信息和逻辑表达上，准备越清楚，结果越稳。" },
  { id: "wenqu", name: "文曲", category: "assistant", luck: "good", image: "/ziwei-tarot/wenqu.png", traits: ["才华", "技艺", "桃花", "聪慧"], bodyMeaning: "事件带才华展示和情感吸引，审美、表达和细节会放大优势。" },
  { id: "lucun", name: "禄存", category: "assistant", luck: "great", image: "/ziwei-tarot/lucun.png", traits: ["财禄", "积蓄", "稳定", "收获"], bodyMeaning: "根基有实际收益和积累价值，适合稳拿，不适合贪快。" },
  { id: "qingyang", name: "擎羊", category: "assistant", luck: "bad", image: "/ziwei-tarot/qingyang.png", traits: ["阻碍", "摩擦", "伤害", "冲动"], bodyMeaning: "事情内在有硬碰硬的阻力，冲动推进会增加摩擦和损耗。" },
  { id: "tuoluo", name: "陀罗", category: "assistant", luck: "bad", image: "/ziwei-tarot/tuoluo.png", traits: ["拖延", "纠缠", "内耗", "反复"], bodyMeaning: "根源是拖延和反复拉扯，越犹豫越消耗，必须设定边界和期限。" },
  { id: "huoxing", name: "火星", category: "assistant", luck: "bad", image: "/ziwei-tarot/huoxing.png", traits: ["急躁", "突发", "脾气", "冲突"], bodyMeaning: "事情底层有突发和急躁能量，快反应很重要，但情绪化会坏事。" },
  { id: "lingxing", name: "铃星", category: "assistant", luck: "bad", image: "/ziwei-tarot/lingxing.png", traits: ["暗耗", "郁结", "是非", "隐性伤害"], bodyMeaning: "问题有隐性消耗，表面平静，实际容易积累误会和疲惫。" },
  { id: "tiankui", name: "天魁", category: "assistant", luck: "great", image: "/ziwei-tarot/tiankui.png", traits: ["明贵人", "机遇", "提携", "顺境"], bodyMeaning: "事件根基有明面贵人和机会窗口，适合主动争取资源。" },
  { id: "tianyue", name: "天钺", category: "assistant", luck: "great", image: "/ziwei-tarot/tianyue.png", traits: ["暗贵人", "助力", "机缘", "人际帮扶"], bodyMeaning: "背后有人际机缘和暗中帮扶，适合温和推进并留意间接消息。" },
];

export function drawZiweiCard(): ZiweiCard {
  return ZIWEI_CARDS[Math.floor(Math.random() * ZIWEI_CARDS.length)];
}

export function detectDualScene(question: string): DualQuestionScene {
  const q = question.toLowerCase();
  if (/感情|复合|復合|关系|關係|喜欢|喜歡|爱|愛|暧昧|曖昧|男|女|他|她|crush|love|relationship/.test(q)) return "love";
  if (/工作|事业|事業|offer|面试|面試|升职|升職|跳槽|职业|職業|career|job/.test(q)) return "career";
  if (/钱|錢|财|財|收入|投资|投資|副业|副業|money|wealth/.test(q)) return "money";
  if (/要不要|该不该|該不該|能不能|是否|选择|選擇|决定|決定|yes|no/.test(q)) return "decision";
  return "general";
}

function ziweiIsGood(card: ZiweiCard) {
  return card.luck === "great" || card.luck === "good" || card.luck === "neutralGood";
}

function getTarotBase(card: TarotCard): number {
  if ([1, 3, 4, 6, 10, 14, 17, 19, 21].includes(card.id)) return 2;
  if ([0, 2, 7, 8, 11, 20].includes(card.id)) return 1;
  if ([12, 13, 15, 16, 18].includes(card.id)) return -2;
  if ([5, 9].includes(card.id)) return 0;
  const negative = ["loss", "conflict", "burden", "delay", "fear", "betrayal", "anxiety", "blocked"];
  const positive = ["success", "joy", "victory", "abundance", "harmony", "clarity", "growth", "stability"];
  const text = [...card.keywordsEn, ...card.keywordsZh].join(" ").toLowerCase();
  if (negative.some(k => text.includes(k))) return -1;
  if (positive.some(k => text.includes(k))) return 1;
  return 0;
}

function tarotIsGood(card: DrawnTarotCard) {
  const base = getTarotBase(card);
  return card.reversed ? base > 1 : base >= 0;
}

function sceneNoun(scene: DualQuestionScene) {
  return {
    love: "这段关系",
    career: "这件事业/工作问题",
    money: "这笔财务安排",
    decision: "这个选择",
    general: "这件事",
  }[scene];
}

function sceneFocus(scene: DualQuestionScene) {
  return {
    love: "对方态度、投入稳定度、旧问题是否会重复",
    career: "机会窗口、资源是否落地、执行节奏是否可控",
    money: "现金流安全、投入回报、风险是否可控",
    decision: "条件是否成熟、现在行动的代价、止损点是否清楚",
    general: "现状核心、外部阻力、下一步最稳动作",
  }[scene];
}

function sceneDirectVerdict(scene: DualQuestionScene, matrix: string) {
  const base: Record<string, Record<DualQuestionScene, string>> = {
    good_good: {
      love: "可以继续投入，但要把关系推进到可验证的行动上。",
      career: "可以推进，适合主动争取资源或确认下一步。",
      money: "可以小额推进，前提是预算和回报周期先写清楚。",
      decision: "偏可以，选择更主动、更可落地的一边。",
      general: "可以推进，从最容易验证的一步开始。",
    },
    good_bad: {
      love: "底层有缘分，但短期不要追问结果，先修沟通和边界。",
      career: "方向不差，但流程有阻，先补材料、确认规则和负责人。",
      money: "不是不能做，但要降预算、分阶段，不要一次投入。",
      decision: "可以考虑，但今天不适合冲动定死。",
      general: "根基可用，过程要避开明显阻力。",
    },
    bad_good: {
      love: "眼前有甜度，但长期稳定性不足，先看对方是否持续行动。",
      career: "短期机会漂亮，但根基不稳，别被表面资源冲昏头。",
      money: "短期有收益感，长期风险偏高，先保现金流。",
      decision: "眼前可试，但必须设置止损条件。",
      general: "可以试探，不适合重押。",
    },
    bad_bad: {
      love: "先不要硬推，关系里的卡点比吸引力更强。",
      career: "暂缓推进，当前阻力和代价都偏高。",
      money: "不建议现在投入，先守财。",
      decision: "不建议现在做最终决定。",
      general: "先停下排查问题，不要强行推进。",
    },
  };
  return base[matrix]?.[scene] || base.good_bad.general;
}

function sceneAction(scene: DualQuestionScene, matrix: string) {
  const map: Record<DualQuestionScene, string[]> = {
    love: ["先确认对方是否有稳定投入，再决定是否推进。", "不要只看当下回应，把沟通频率和实际行动一起纳入判断。"],
    career: ["把目标拆成可交付步骤，先拿到资源、流程或负责人确认。", "短期不要靠情绪辞职或冲动承诺，先检查合同、时间和回报。"],
    money: ["只做可承受范围内的投入，避免借贷、杠杆和不透明项目。", "把收益预期写成数字，再决定是否继续。"],
    decision: ["可以行动，但先设一个止损条件；一旦触发就停止追加投入。", "若今天必须决定，选择更稳、更可验证的一边。"],
    general: ["先处理最关键的阻碍，再推进下一步。", "不要同时开太多线，把注意力放在最能改变结果的一件事上。"],
  };
  if (matrix === "bad_bad") return ["暂缓强推，先排查阻力来源。", map[scene][0]];
  if (matrix === "good_bad") return ["根基不差，但短期要降低期待。", map[scene][1]];
  if (matrix === "bad_good") return ["眼前有机会，但不要忽略长期隐患。", map[scene][0]];
  return map[scene];
}

export function buildDualReading(ziwei: ZiweiCard, tarot: DrawnTarotCard, question: string): DualReading {
  const scene = detectDualScene(question);
  const starTheory = getStarDoctrine(ziwei.name);
  const noun = sceneNoun(scene);
  const zGood = ziweiIsGood(ziwei);
  const tGood = tarotIsGood(tarot);
  const matrix = `${zGood ? "good" : "bad"}_${tGood ? "good" : "bad"}`;
  const tarotMeaning = tarot.reversed ? tarot.meaningReversedZh : tarot.meaningUprightZh;
  const tarotShort = tarotMeaning.split("。")[0] || tarotMeaning;
  const focus = sceneFocus(scene);
  const verdict = sceneDirectVerdict(scene, matrix);
  const matrixText: Record<string, DualReading["matrix"]> = {
    good_good: "紫微吉 + 塔罗吉：内在根基和外在走向一致向好。",
    good_bad: "紫微吉 + 塔罗凶：根基可用，但短期过程有阻。",
    bad_good: "紫微凶 + 塔罗吉：表面有机会，长期根基不稳。",
    bad_bad: "紫微凶 + 塔罗凶：内外阻力都重，不宜强推。",
  };
  const toneMap: Record<string, DualReading["tone"]> = {
    good_good: "大吉",
    good_bad: "先吉后阻",
    bad_good: "先阻后吉",
    bad_bad: "偏凶",
  };
  const headlineMap: Record<string, string> = {
    good_good: "根基与走势同向，可稳步推进",
    good_bad: "底盘不差，短期先避开阻力",
    bad_good: "眼前有利，长期需补根基",
    bad_bad: "阻力明显，暂缓强行动作",
  };

  return {
    tone: toneMap[matrix],
    headline: headlineMap[matrix],
    matrix: matrixText[matrix],
    ziweiLabel: zGood ? "吉" : "凶",
    tarotLabel: tGood ? "吉" : "凶",
    freeSummary: `${ziwei.name}定体，${tarot.nameCn}${tarot.reversed ? "逆位" : "正位"}定用。先给结论：${verdict} 本题重点看${focus}。`,
    deep: [
      `紫微牌为体，先定格局。${ziwei.name}说明${noun}的底层动力是「${starTheory?.core || ziwei.traits.join("、")}」：${starTheory?.orthodox || ziwei.bodyMeaning} 对应到现代场景是：${starTheory?.modern || ziwei.bodyMeaning} 这一步不看表面热闹，只看这件事有没有根、有无长期代价。`,
      `塔罗牌为用，再看现象。${tarot.nameCn}${tarot.reversed ? "逆位" : "正位"}给出的短期信号是：${tarotShort}。它对应到你的问题里，主要落在${focus}，不是泛泛讲运势。`,
      `双牌合断：${matrixText[matrix]} 针对「${question || "当前问题"}」，最终判断是：${verdict} 这组牌不是简单拼接牌意，而是看“内在格局”能不能支撑“外在结果”。校准原则：${ZIWEI_READING_PRINCIPLES[0]} ${ZIWEI_READING_PRINCIPLES[2]}`,
    ],
    actions: sceneAction(scene, matrix),
  };
}
