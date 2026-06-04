/* ============================================================
   R7 Fortune — 78-Card Interpretation Library
   4 categories: 感情姻缘/事业学业/财运运势/身心生活健康
   Each card: elegant prose + plain explanation
   ============================================================ */

export type CardCategory = "love" | "career" | "wealth" | "health";

export interface CardInterpretation {
  elegant: string;   // 高级氛围感文案
  plain: string;     // 大白话直白解释
  advice: string;    // 针对性建议
}

// ---- Dynamic category detection from question ----
export function detectCategory(question: string): CardCategory {
  const q = question.toLowerCase();
  if (/感情|恋爱|姻缘|婚姻|分手|复合|暗恋|暧昧|喜欢|对象|伴侣|前任|正缘|桃花|love|romance|dating|crush|relationship/.test(q)) return "love";
  if (/事业|工作|职场|学业|考试|面试|创业|升职|跳槽|学习|老板|同事|career|job|exam|study|business/.test(q)) return "career";
  if (/财运|财富|钱|投资|股票|理财|收入|薪资|加薪|偏财|正财|money|wealth|finance|income/.test(q)) return "wealth";
  return "health"; // default: 身心生活健康
}

// ---- Card-specific interpretations (Major Arcana as samples, rest use dynamic generator) ----
const CARD_BASE: Record<number, Record<CardCategory, CardInterpretation>> = {
  0: { // The Fool
    love: { elegant: "愚人正位在感情中预示一段全新旅程的开端——带着赤子之心的勇气踏入未知。你不必知道所有答案，只需相信脚下的路。", plain: "这张牌说：别想太多，大胆去尝试。新的感情机会正在靠近，保持开放的心态比什么都重要。", advice: "放下过去的包袱，用第一次约会的心态去面对眼前的人。不预判、不比较，让一切自然发生。" },
    career: { elegant: "愚人正位昭示事业的新起点——一次大胆的跃迁，一场无畏的冒险。你对未知的信任，正是此刻最大的资本。", plain: "工作上有个新机会要来了——可能是跳槽、转行或新项目。现在不是求稳的时候，是该闯一闯。", advice: "如果心里有个一直想做但不敢做的事，这周就迈出第一步。哪怕很小——关键是动起来。" },
    wealth: { elegant: "愚人正位在财运中代表一次带着信任的投入——你未必看得清全貌，但勇气本身就是最珍贵的筹码。", plain: "财务上可能有意外之财，或者一个你之前没注意到的赚钱机会。别怕尝试新的理财方式。", advice: "小额试水，不要一次性投入太多。保持灵活，见好就收。" },
    health: { elegant: "愚人正位邀你以全新的视角看待自己的身体——放下旧有的焦虑，带着好奇心探索健康的可能。", plain: "身体状况总体不错，就是精神上可能需要一点新鲜感。换个运动方式或饮食节奏会有效果。", advice: "这周尝试一个你从没做过的运动——哪怕是散步换条路线。新鲜感本身就是疗愈。" },
  },
  6: { // The Lovers
    love: { elegant: "恋人正位是塔罗中最温柔的确信——两颗心在命运的织锦上彼此认出。这份连结不是偶然，是灵魂的约定。", plain: "这张牌直接告诉你：这是一段有未来的关系。无论是新恋情还是现有感情，都是对的。", advice: "相信你的感觉。如果你觉得这个人是对的，那就勇敢一点。不要用理性去压住心动。" },
    career: { elegant: "恋人正位在事业中指向一次关键的选择——两条路，一条由逻辑指向，一条由心灵呼唤。后者往往通往更深的满足。", plain: "工作上有个重要决定要做——跳槽还是留下、合作还是单干。你的直觉知道答案。", advice: "列一张纸：左边写「理性理由」，右边写「内心感受」。看看哪边更有重量。" },
    wealth: { elegant: "恋人正位在财运中暗示一次需要用心衡量的选择——金钱与价值的对等，不仅是数字的加减。", plain: "可能有笔钱的去向需要做选择——投资什么、买不买大件。别光看价格，看它对你真正的价值。", advice: "花钱之前问自己：这个东西一年后还会让我感到值得吗？答案会帮你做决定。" },
    health: { elegant: "恋人正位提醒你：身心的和谐不是二选一，而是两者的对话。听听身体在说什么。", plain: "你的心理状态在影响身体状况。焦虑可能会让一些小毛病放大。别自己吓自己。", advice: "找个人聊一聊——不是看病，就是倾诉。把心里的东西说出来，身体会跟着放松。" },
  },
};

// ---- Dynamic generator for cards without specific data ----
export function getCardInterpretation(cardId: number, category: CardCategory, cardName: string, cardNameCn: string, keywords: string[], reversed: boolean): CardInterpretation {
  // Check for custom data
  const custom = CARD_BASE[cardId]?.[category];
  if (custom) {
    return reversed
      ? { elegant: `逆位：${custom.elegant.replace("正位", "逆位").replace("预示", "提醒")}`, plain: `逆位提醒：${custom.plain}但此刻需要多一份谨慎。`, advice: custom.advice }
      : custom;
  }

  // Dynamic generation based on category
  const kw = keywords.slice(0, 2).join("、");
  const r = reversed;
  const cn = cardNameCn;

  const templates: Record<CardCategory, CardInterpretation> = {
    love: {
      elegant: r
        ? `${cn}逆位在感情中低语：有些答案不在外界，而在你尚未倾听的内心深处。${kw}的能量暂时内敛——这不是拒绝，是孕育。`
        : `${cn}正位如一缕暖风拂过你的感情世界。${kw}的能量正在流动——爱不需要用力，它自己会找到方向。`,
      plain: r
        ? `感情方面目前有点卡。不是没希望，是时机还没到。对方可能有自己的心事，你先别急着要答案。`
        : `感情运势不错。如果你在等一个信号——这张牌说快了。主动一点点会有意想不到的回应。`,
      advice: r ? "这周先专注于自己。不联系、不试探、不刷存在感——让空间说话。" : "如果你有想对某人说的话，这周是个好时机。真诚比话术更有效。",
    },
    career: {
      elegant: r
        ? `${cn}逆位在事业中暗示：你正在用旧地图寻找新大陆。${kw}的能量受阻——是时候换个角度审视当前的困局。`
        : `${cn}正位为你的事业注入${kw}的驱动力。前路正在清晰——那些曾经模糊的选项，此刻开始显现轮廓。`,
      plain: r
        ? `工作上最近有点不顺。可能是项目卡住了，或者和同事/上司沟通不畅。先别急着硬推，换个方法试试。`
        : `事业有好转的迹象。之前卡住的事情会松动，该推进的可以推进了。`,
      advice: r ? "暂停一下，重新看看问题的根源在哪。有时候退一步不是放弃，是为了找到更好的路径。" : "这周主动约一个关键人物聊一聊——那个人可能就是你突破的关键。",
    },
    wealth: {
      elegant: r
        ? `${cn}逆位在财运中提醒：金钱的流动暂时受阻，${kw}的能量邀请你审视内在的匮乏感——丰盛始于对已经拥有的感恩。`
        : `${cn}正位预示着财运的上升气流。${kw}的能量正为你打开新的丰盛通道——保持开放，机会往往藏在不起眼的地方。`,
      plain: r
        ? "最近花钱要谨慎一点。可能有意外支出，或者之前预期的一笔收入会延迟。先别做大额消费。"
        : "财运不错。可能有意外收入，或者之前的投资/副业开始有回报。但也别得意忘形。",
      advice: r ? "做一个简单的财务检查：看看哪些自动扣款可以停掉。省下来的就是赚到的。" : "收到意外之财别急着花——存起来当应急基金，未来你会感谢现在的自己。",
    },
    health: {
      elegant: r
        ? `${cn}逆位低语：身体在用它唯一的语言——不适——向你传达一个被忽略的讯息。${kw}的能量提醒你：休息不是懈怠，是修复。`
        : `${cn}正位带来疗愈的气息。${kw}的能量正在修复你的身心——给自己一点时间，你会感受到活力的回归。`,
      plain: r
        ? "最近可能感觉有点累，或者有些小毛病反复。不是在吓你——是真的需要好好休息一下了。"
        : "身体状态在恢复。如果你之前有不舒服，这周会好转。但别马上又透支——给身体一点缓冲。",
      advice: r ? "今晚比平时早睡一小时。就一小时。连续三天，你会感觉明显不同。" : "保持现在的节奏，但加一个拉伸的动作。每天10分钟，坚持一周看看变化。",
    },
  };

  return templates[category];
}
