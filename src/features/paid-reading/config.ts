export type PaidReadingScene = "relationship" | "idol" | "career" | "decision" | "general";

export type PaidReadingPlanKey = "first" | "single" | "questionPack" | "relationshipTracking";

export type PaidReadingPlan = {
  key: PaidReadingPlanKey;
  name: string;
  priceCny: number;
  enabled: boolean;
  description: string;
};

export const PAID_READING_PRODUCT = {
  name: "关系真相深度解读",
  plans: {
    first: {
      key: "first",
      name: "新用户首次深度解读",
      priceCny: 9.9,
      enabled: true,
      description: "首次购买当前问题的完整深度报告",
    },
    single: {
      key: "single",
      name: "标准单次解读",
      priceCny: 19.9,
      enabled: true,
      description: "单次问题完整深度报告",
    },
    questionPack: {
      key: "questionPack",
      name: "三次问题包",
      priceCny: 49.9,
      enabled: false,
      description: "连续三个问题的深度解读",
    },
    relationshipTracking: {
      key: "relationshipTracking",
      name: "7 天关系追踪",
      priceCny: 69.9,
      enabled: false,
      description: "围绕同一段关系进行 7 天趋势追踪",
    },
  } satisfies Record<PaidReadingPlanKey, PaidReadingPlan>,
} as const;

export const SCENE_COPY: Record<PaidReadingScene, {
  subject: string;
  paywallTitle: string;
  subtitle: string;
  cta: string;
  benefits: string[];
  sampleQuestion: string;
  unresolvedLabel: string;
  followups: string[];
}> = {
  relationship: {
    subject: "关系",
    paywallTitle: "解锁本次关系真相报告",
    subtitle: "结合你输入的问题、当前关系与本次抽牌，继续分析尚未揭开的关键答案。",
    cta: "查看这段关系的真实走向",
    benefits: [
      "对方现在对你的真实态度",
      "未来 30 天是否会出现主动行动",
      "关系停滞的真正原因",
      "你主动与继续等待的不同走向",
      "最适合你的下一步行动",
    ],
    sampleQuestion: "他对这段关系还有继续推进的想法吗？",
    unresolvedLabel: "对方是在克制和观望，还是已经降低了继续推进的意愿？",
    followups: ["他为什么迟迟没有行动？", "如果我主动联系，关系会怎样？", "未来三个月关系能否升级？"],
  },
  idol: {
    subject: "追星事件",
    paywallTitle: "解锁本次追星趋势报告",
    subtitle: "结合你的具体追星问题与本次牌面，继续拆解机会窗口、现实阻碍和行动节奏。",
    cta: "查看未来 30 天追星运势",
    benefits: [
      "当前追星事件的真实趋势",
      "未来 30 天最值得把握的窗口",
      "票务、签售或活动中的主要阻碍",
      "继续投入与暂缓行动的不同结果",
      "最适合你的具体准备方式",
    ],
    sampleQuestion: "这次签售报名值得继续投入吗？",
    unresolvedLabel: "当前阻力来自竞争强度，还是准备方式与时机尚未对齐？",
    followups: ["哪个时间点更适合行动？", "我还需要补足哪项准备？", "如果改用备选方案，结果会怎样？"],
  },
  career: {
    subject: "事业选择",
    paywallTitle: "解锁本次事业决策报告",
    subtitle: "结合你的原问题与本次抽牌，继续分析机会质量、现实条件和最优行动顺序。",
    cta: "查看最适合你的行动建议",
    benefits: [
      "当前机会的真实质量",
      "未来 30 天的推进趋势",
      "最容易卡住结果的现实条件",
      "主动争取与暂时准备的不同结果",
      "下一步最值得投入的行动",
    ],
    sampleQuestion: "现在接受这份工作机会，对长期发展有利吗？",
    unresolvedLabel: "这次机会是真正的成长窗口，还是短期看起来不错但承接力不足？",
    followups: ["我应该主动争取这个机会吗？", "当前最大的职业卡点是什么？", "未来三个月适合换方向吗？"],
  },
  decision: {
    subject: "当前决定",
    paywallTitle: "解锁本次决策深度报告",
    subtitle: "结合你的具体问题、牌面与正逆位，继续区分可推进条件、隐藏风险和行动时机。",
    cta: "查看这件事的最终倾向",
    benefits: [
      "当前局势的明确倾向",
      "未来 30 天最可能出现的变化",
      "影响结果的关键阻碍",
      "立即行动与暂缓行动的不同结果",
      "最适合你的下一步建议",
    ],
    sampleQuestion: "这件事现在继续推进，结果会更有利吗？",
    unresolvedLabel: "当前信号代表可以推进，还是需要先补足条件再行动？",
    followups: ["现在行动最大的风险是什么？", "等待一段时间会更有利吗？", "我最应该先改变哪一步？"],
  },
  general: {
    subject: "当前问题",
    paywallTitle: "解锁本次深度解读报告",
    subtitle: "结合你的原问题与本次抽牌，继续分析局势、阻碍、未来趋势与行动建议。",
    cta: "查看最适合你的行动建议",
    benefits: [
      "当前局势的核心状态",
      "未来 30 天的发展趋势",
      "最关键但容易忽略的阻碍",
      "不同选择可能带来的结果",
      "可立即执行的下一步建议",
    ],
    sampleQuestion: "我现在最应该优先处理什么？",
    unresolvedLabel: "现在真正需要调整的是外部条件，还是你采取行动的顺序？",
    followups: ["当前最容易忽略的问题是什么？", "如果我主动改变，结果会怎样？", "未来一个月最值得注意什么？"],
  },
};

export function detectPaidReadingScene(question: string, mode?: "classic" | "idol"): PaidReadingScene {
  if (mode === "idol" || /爱豆|愛豆|追星|签售|簽售|演唱会|演唱會|抢票|搶票|小卡|回归|回歸|idol|fansign|concert|ticket/i.test(question)) return "idol";
  if (/感情|关系|關係|复合|復合|暧昧|曖昧|前任|喜欢|喜歡|对方|對方|他|她|恋爱|戀愛|love|relationship|crush|ex\b/i.test(question)) return "relationship";
  if (/工作|事业|事業|求职|求職|面试|面試|offer|升职|升職|项目|項目|考试|考試|学业|學業|career|job|study/i.test(question)) return "career";
  if (/能不能|会不会|會不會|该不该|該不該|要不要|是否|能否|可不可以|yes|no|should|will|can\b/i.test(question)) return "decision";
  return "general";
}

export function getPaidReadingPlan(isFirstPurchase: boolean): PaidReadingPlan {
  return isFirstPurchase ? PAID_READING_PRODUCT.plans.first : PAID_READING_PRODUCT.plans.single;
}

export function formatCny(price: number) {
  return `¥${price.toFixed(1)}`;
}
