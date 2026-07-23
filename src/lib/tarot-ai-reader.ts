/* ============================================================
   R7 Fortune — Classic Tarot AI Dynamic Reader v2
   Card + User Question → 本心 / 现状 / 发展 / 建议
   Integrated with 78-card 4-category library
   Dual-mode: elegant prose + plain explanation
   ============================================================ */

import type { TarotCard } from "@/data/tarotCards";
import { detectCategory, getCardInterpretation } from "@/lib/tarot-card-library";
import {
  detectTarotScenario,
  getScenarioScript,
  type ScenarioScript,
  type TarotScenarioKey,
} from "@/data/tarotScenarioScripts";

export interface CardReading {
  position: { elegant: string; plain: string }; // 牌位含义
  heart: { elegant: string; plain: string };    // 本心状态
  situation: { elegant: string; plain: string }; // 当下现状
  future: { elegant: string; plain: string };    // 后期发展
  advice: string;                                 // 针对性建议
}

export interface TarotAIResult {
  scenario: ScenarioScript;
  cards: CardReading[];
  overview: { elegant: string; plain: string };
}

function getQuestionProfile(question: string, scenarioKey: TarotScenarioKey | undefined, isZh: boolean) {
  const q = question.trim();
  const has = (patterns: RegExp[]) => patterns.some((pattern) => pattern.test(q));
  const timeRange = has([/今天|今日|当天|當天|今晚|today|tonight/i])
    ? (isZh ? "今天/当日" : "today")
    : has([/近期|最近|这个月|這個月|三个月|3个月|半年|recent|month|months/i])
    ? (isZh ? "近期" : "near term")
    : has([/未来|未來|以后|之後|after|future/i])
    ? (isZh ? "后续发展" : "future development")
    : (isZh ? "当前到下一步" : "now to the next step");
  const decisionType = has([/要不要|该不该|該不該|能不能|会不会|會不會|是否|可不可以|要衝嗎|能成嗎|should|will|can|whether|yes|no/i]);
  const object = has([/他|她|对方|對方|前任|暧昧|曖昧|crush|ex/i])
    ? (isZh ? "对方态度" : "the other person's attitude")
    : scenarioKey?.startsWith("idol_")
    ? (isZh ? "追星事件" : "idol-related event")
    : has([/offer|面试|面試|工作|事业|事業|考试|考試|career|job|exam/i])
    ? (isZh ? "事业/学业事项" : "career/study matter")
    : has([/钱|錢|财|財|收入|投资|投資|money|income|invest/i])
    ? (isZh ? "财务事项" : "money matter")
    : (isZh ? "当前问题" : "the current question");
  const answerStyle = decisionType
    ? (isZh ? "先给倾向，再解释为什么" : "give a leaning first, then explain why")
    : (isZh ? "先看趋势，再给行动建议" : "read the trend first, then give action advice");
  const constraint = isZh
    ? `必须围绕「${q || "用户问题"}」回答，时间范围按「${timeRange}」看，核心对象是${object}，回答方式是${answerStyle}。`
    : `Answer only around "${q || "the user's question"}"; time range: ${timeRange}; object: ${object}; style: ${answerStyle}.`;
  return { timeRange, decisionType, object, answerStyle, constraint };
}

function getQuestionFocus(category: ReturnType<typeof detectCategory>, scenarioKey: TarotScenarioKey | undefined, isZh: boolean) {
  if (scenarioKey?.startsWith("idol_")) {
    if (scenarioKey === "idol_ticketing") return isZh ? "抢票成功率、临场准备和备选渠道" : "ticketing odds, preparation, and backup channels";
    if (scenarioKey === "idol_seat") return isZh ? "座位视野、现场体验和抽签波动" : "seat view, event experience, and lottery variance";
    if (scenarioKey === "idol_fansign") return isZh ? "签售名额、排位顺序和互动质量" : "fansign entry, queue position, and interaction quality";
    if (scenarioKey === "idol_career") return isZh ? "回归热度、资源曝光、团队节奏和后续走向" : "comeback heat, exposure, team rhythm, and next trend";
    return isZh ? "现场运势、应援节奏和体验感" : "event luck, fan support rhythm, and experience";
  }

  const zhFocus = {
    love: "对方态度、关系温度、行动时机和后续走势",
    career: "机会窗口、阻碍来源、执行节奏和结果反馈",
    wealth: "收入流向、支出风险、增收机会和守财建议",
    health: "情绪状态、生活节奏、身心压力和调整方式",
  };
  const enFocus = {
    love: "their attitude, relationship temperature, timing, and next movement",
    career: "opportunity window, blockers, execution rhythm, and outcome feedback",
    wealth: "income flow, spending risk, earning chances, and money protection",
    health: "emotional state, daily rhythm, body-mind pressure, and adjustment",
  };
  return isZh ? zhFocus[category] : enFocus[category];
}

function getQuestionContext(
  question: string,
  category: ReturnType<typeof detectCategory>,
  scenarioKey: TarotScenarioKey | undefined,
  isZh: boolean
) {
  const q = question.trim();
  const has = (patterns: RegExp[]) => patterns.some((pattern) => pattern.test(q));
  const isDecision = has([/yes\s*or\s*no|yes\/no|要不要|该不该|該不該|能不能|能成|会不会|會不會|是否|能否|可不可以|should|will|can|whether/i]);

  if (scenarioKey?.startsWith("idol_")) {
    if (scenarioKey === "idol_ticketing") {
      return {
        subject: isZh ? "这次抢票结果" : "this ticketing attempt",
        intent: isZh ? "判断能否抢到票、哪一步最容易出问题，以及是否需要准备备选渠道" : "whether ticketing can work, where issues may happen, and whether backup channels are needed",
        signal: isZh ? "设备、时间点、网络、平台规则和备选方案" : "device setup, timing, network, platform rules, and backup plans",
        action: isZh ? "提前把账号、支付、网络和候补方案都准备好，不要只押一个入口。" : "prepare account, payment, network, and backup routes instead of relying on one entry.",
        isDecision,
      };
    }
    if (scenarioKey === "idol_seat") {
      return {
        subject: isZh ? "本次座位或视野运势" : "seat and view luck for this event",
        intent: isZh ? "判断位置体验、现场视野和抽签波动" : "reading seat experience, view quality, and lottery variance",
        signal: isZh ? "座位区间、视线遮挡、现场动线和心态预期" : "seat zone, sightline, venue flow, and expectation management",
        action: isZh ? "先降低对绝对前排的执念，把观看体验和现场氛围一起纳入判断。" : "release fixation on front-row perfection and consider the full event experience.",
        isDecision,
      };
    }
    if (scenarioKey === "idol_fansign") {
      return {
        subject: isZh ? "签售名额、排位和互动质量" : "fansign entry, ranking, and interaction quality",
        intent: isZh ? "判断是否能进、排位是否理想，以及互动会不会顺利" : "whether entry is likely, whether ranking is favorable, and how smooth the interaction may be",
        signal: isZh ? "报名规则、竞争强度、排位波动和临场表达" : "rules, competition, ranking variance, and on-site expression",
        action: isZh ? "按规则提前完成准备，互动内容不要太复杂，准备一句最想说的话就够。" : "finish preparation early and keep the interaction simple with one line you most want to say.",
        isDecision,
      };
    }
    return {
      subject: isZh ? "爱豆事业与后续曝光" : "idol career momentum and exposure",
      intent: isZh ? "判断回归热度、资源节奏、曝光变化和粉丝能做什么" : "reading comeback heat, resource rhythm, exposure changes, and fan action",
      signal: isZh ? "团队资源、舆论反馈、作品表现和粉丝助推" : "team resources, public response, work performance, and fan support",
      action: isZh ? "把注意力放在可参与的支持动作上，不要被短期数据波动带乱情绪。" : "focus on support actions you can take and avoid being shaken by short-term data swings.",
      isDecision,
    };
  }

  if (scenarioKey === "love_reconcile") {
    return {
      subject: isZh ? "你和对方是否还有回头空间" : "whether there is room for reconciliation",
      intent: isZh ? "判断对方是否还有情绪连接、旧问题是否松动，以及你该主动还是等待" : "whether emotional connection remains, whether old issues are loosening, and whether to act or wait",
      signal: isZh ? "对方反馈、旧矛盾、联系窗口和你的情绪稳定度" : "their response, old conflict, contact window, and your emotional steadiness",
      action: isZh ? "先不要用焦虑逼答案，观察对方是否有持续回应，再决定是否主动联系。" : "do not force an answer from anxiety; watch for consistent response before reaching out.",
      isDecision,
    };
  }
  if (scenarioKey === "love_ambiguous" || has([/对方|他|她|暧昧|喜欢|想法|态度|crush|feel/i])) {
    return {
      subject: isZh ? "对方真实态度和这段关系的稳定性" : "their true attitude and the stability of this connection",
      intent: isZh ? "判断对方是认真靠近、暂时观望，还是只给情绪价值但没有行动" : "whether they are genuinely moving closer, hesitating, or only giving emotional comfort without action",
      signal: isZh ? "回复节奏、主动程度、见面机会和承诺感" : "reply rhythm, initiative, chances to meet, and sense of commitment",
      action: isZh ? "看行动，不只听话；给对方一点空间，同时保留自己的节奏和底线。" : "watch actions, not only words; give space while keeping your pace and boundaries.",
      isDecision,
    };
  }
  if (scenarioKey === "love_relationship") {
    return {
      subject: isZh ? "你们接下来的关系走向" : "where this relationship is heading",
      intent: isZh ? "判断关系温度、潜在矛盾和是否适合继续推进" : "reading relationship warmth, hidden tension, and whether to move forward",
      signal: isZh ? "沟通质量、投入平衡、未来安排和安全感" : "communication quality, balance of effort, future planning, and emotional safety",
      action: isZh ? "把模糊的不安说清楚，但不要用质问开场；先确认彼此需求。" : "name the unease clearly, but not as interrogation; start by clarifying needs.",
      isDecision,
    };
  }
  if (category === "career") {
    return {
      subject: isZh ? "事业或学业是否会出现实际转机" : "whether career or study will bring a real opening",
      intent: isZh ? "判断机会是否会变好、卡点在哪里，以及下一步该主动争取还是先补基础" : "whether opportunities improve, where the block is, and whether to push or strengthen foundations",
      signal: isZh ? "项目结果、上级反馈、资源分配、面试机会和执行节奏" : "project outcomes, manager feedback, resource allocation, interviews, and execution rhythm",
      action: isZh ? "把成果、作品或数据整理出来，主动争取一次可被看见的机会。" : "organize results, portfolio, or data, then seek one visible opportunity.",
      isDecision,
    };
  }
  if (category === "wealth") {
    return {
      subject: isZh ? "钱的流向和近期财务安全感" : "money flow and near-term financial security",
      intent: isZh ? "判断收入机会、破财风险、是否适合投入，以及哪里需要守住现金流" : "reading income chances, spending risks, whether to invest, and where cash flow needs protection",
      signal: isZh ? "正财稳定度、偏财机会、冲动消费和不确定支出" : "salary stability, side-income chances, impulse spending, and uncertain costs",
      action: isZh ? "先守住现金流，所有投入都用小额试水，不要为了焦虑做大额决定。" : "protect cash flow first; test with small amounts and avoid big decisions from anxiety.",
      isDecision,
    };
  }
  if (isDecision) {
    return {
      subject: isZh ? "这件事能否成、是否值得继续推进" : "whether this can work and is worth moving forward",
      intent: isZh ? "判断这件事现在是偏能成、偏卡住，还是需要先补条件再行动" : "reading whether this leans workable, blocked, or needs conditions fixed first",
      signal: isZh ? "现实条件、对方/环境反馈、时机成熟度和你能控制的下一步" : "real conditions, outside response, timing, and the next step you can control",
      action: isZh ? "先做一个低风险试探，不要把全部筹码压在一次结果上。" : "make one low-risk test instead of betting everything on one result.",
      isDecision,
    };
  }
  return {
    subject: isZh ? "你当下最需要处理的生活状态" : "the life state that needs your attention now",
    intent: isZh ? "判断情绪、节奏、压力来源和接下来最适合的调整方式" : "reading emotion, rhythm, pressure source, and the best adjustment now",
    signal: isZh ? "身心状态、睡眠、压力、关系边界和恢复节奏" : "body-mind state, sleep, stress, boundaries, and recovery rhythm",
    action: isZh ? "先把节奏调慢一点，处理最影响你状态的那一个具体问题。" : "slow the rhythm and address the one concrete issue affecting you most.",
    isDecision,
  };
}

function getQuestionSpecificCardMessage(
  cardName: string,
  reversed: boolean,
  context: ReturnType<typeof getQuestionContext>,
  positionLabel: string,
  isZh: boolean
) {
  if (isZh) {
    return reversed
      ? `${cardName}逆位落在「${positionLabel}」：结论先收住。卡点在${context.signal}，现在硬推会把${context.subject}推得更乱。`
      : `${cardName}正位落在「${positionLabel}」：结论可小步推进。突破口就在${context.signal}，不要只等结果自己发生。`;
  }
  return reversed
    ? `${cardName} reversed in "${positionLabel}": hold back. The block is ${context.signal}; forcing it will destabilize ${context.subject}.`
    : `${cardName} upright in "${positionLabel}": move in small steps. The opening is ${context.signal}, not passive waiting.`;
}

function getSuitLens(card: TarotCard, isZh: boolean) {
  if (card.suit === "major") {
    return isZh
      ? "大阿卡纳看主线课题和关键转折"
      : "Major Arcana reads the core lesson and turning point";
  }
  const zh = {
    wands: "权杖看行动、热情、竞争和推进速度",
    cups: "圣杯看情绪、关系、期待和真实感受",
    swords: "宝剑看信息、冲突、判断和沟通风险",
    pentacles: "星币看现实条件、资源、金钱和落地结果",
  };
  const en = {
    wands: "Wands read action, passion, competition, and pace",
    cups: "Cups read emotion, connection, expectation, and feelings",
    swords: "Swords read information, conflict, judgment, and communication risk",
    pentacles: "Pentacles read practical conditions, resources, money, and concrete result",
  };
  return isZh ? zh[card.suit] : en[card.suit];
}

function getPositionMeaning(label: string, idx: number, total: number, isZh: boolean) {
  const lower = label.toLowerCase();
  const includes = (patterns: string[]) => patterns.some((p) => lower.includes(p.toLowerCase()) || label.includes(p));

  if (includes(["核心", "答案", "signal", "本次應援信號", "core"])) {
    return {
      role: isZh ? "这张牌直接回答问题核心。" : "This card answers the core of the question.",
      action: isZh ? "先抓住它的主讯息，再决定下一步。" : "Hold its main signal first, then decide the next step.",
    };
  }
  if (includes(["過去", "过去", "準備", "准备", "past", "preparation"])) {
    return {
      role: isZh ? "这个位置看事情的根源、前置条件和你已经带进来的能量。" : "This position reads the root, preparation, and energy already brought into the situation.",
      action: isZh ? "不要只看结果，先确认前面哪一步影响了现在。" : "Do not jump to the result; first identify what has shaped the present.",
    };
  }
  if (includes(["當前", "当前", "現狀", "现状", "氣場", "气场", "current", "situation", "energy"])) {
    return {
      role: isZh ? "这个位置看当下真实状态，尤其是表面之下正在运作的能量。" : "This position reads the true current state, especially what is moving beneath the surface.",
      action: isZh ? "先认清现实，再决定是推进、等待还是调整。" : "Read reality first, then decide whether to move, wait, or adjust.",
    };
  }
  if (includes(["阻礙", "阻碍", "隱藏", "隐藏", "變量", "变量", "hidden", "block", "obstacle"])) {
    return {
      role: isZh ? "这个位置指出容易被忽略的阻力、变量或没有说出口的信息。" : "This position points to the overlooked block, variable, or unspoken information.",
      action: isZh ? "它不是吓你，而是提醒你哪里不能靠猜。" : "It is not here to scare you; it shows where guessing is not enough.",
    };
  }
  if (includes(["建議", "建议", "行動", "行动", "advice", "action"])) {
    return {
      role: isZh ? "这个位置给行动策略，重点不是预测，而是告诉你怎么做更稳。" : "This position gives strategy. It is less prediction, more how to move wisely.",
      action: isZh ? "把建议拆成一个今天就能执行的小动作。" : "Turn the advice into one small action you can take today.",
    };
  }
  if (includes(["未來", "未来", "趨勢", "趋势", "結果", "结果", "體驗", "体验", "future", "outcome", "trend", "experience"])) {
    return {
      role: isZh ? "这个位置看自然发展下最可能出现的趋势和结果体验。" : "This position reads the most likely trend or experience if things continue naturally.",
      action: isZh ? "结果不是定死的，你现在的选择仍然会改变它。" : "The result is not fixed; your next choice can still change it.",
    };
  }

  if (total === 1) return getPositionMeaning(isZh ? "核心答案" : "Core Answer", idx, total, isZh);
  if (total === 3) {
    const fallback = isZh ? ["過去影響", "當前狀態", "未來趨勢"][idx] : ["Past Influence", "Current State", "Future Trend"][idx];
    return getPositionMeaning(fallback, idx, total, isZh);
  }
  const fallback = isZh ? ["問題現狀", "主要阻礙", "隱藏影響", "行動建議", "趨勢結果"][idx] : ["Situation", "Obstacle", "Hidden Factor", "Advice", "Likely Outcome"][idx];
  return getPositionMeaning(fallback, idx, total, isZh);
}

function getPositionAdvice(label: string, reversed: boolean, isZh: boolean) {
  const lower = label.toLowerCase();
  const isObstacle = ["阻礙", "阻碍", "隱藏", "隐藏", "變量", "变量", "hidden", "block", "obstacle"].some((p) => lower.includes(p.toLowerCase()) || label.includes(p));
  const isAdvice = ["建議", "建议", "行動", "行动", "advice", "action"].some((p) => lower.includes(p.toLowerCase()) || label.includes(p));
  const isOutcome = ["未來", "未来", "趨勢", "趋势", "結果", "结果", "體驗", "体验", "future", "outcome", "trend"].some((p) => lower.includes(p.toLowerCase()) || label.includes(p));

  if (isObstacle) {
    return isZh
      ? (reversed ? "先别急着硬冲。把最不确定的条件列出来，能验证的先验证，不能验证的暂时不要投入太多情绪和资源。" : "这个阻力可以处理，但需要你把话说清、规则定清，别靠默契和猜测推进。")
      : (reversed ? "Do not force it yet. List the unclear factors, verify what you can, and avoid over-investing emotion or resources." : "This block can be handled, but you need clearer words and cleaner rules. Do not rely on guessing.");
  }
  if (isAdvice) {
    return isZh
      ? (reversed ? "你的行动重点是收住节奏：少做冲动决定，多保留证据和余地。" : "你的行动重点是小步推进：先做一个低风险尝试，用现实反馈决定下一步。")
      : (reversed ? "Your move is restraint: fewer impulsive decisions, more evidence and room to adjust." : "Your move is a small step: test with low risk, then let real feedback guide the next move.");
  }
  if (isOutcome) {
    return isZh
      ? (reversed ? "结果会有延迟或反复，不适合把所有期待押在一次反馈上；保留备选方案会更安心。" : "趋势是能往前走的，但仍需要你主动接住机会，不要只是等待好消息自动发生。")
      : (reversed ? "The outcome may be delayed or uneven. Do not place all hope on one response; keep a backup plan." : "The trend can move forward, but you still need to meet the opening actively.");
  }
  return "";
}

function isIdolScenario(scenarioKey: TarotScenarioKey | undefined) {
  return Boolean(scenarioKey?.startsWith("idol_"));
}

function getIdolScenarioTone(scenarioKey: TarotScenarioKey | undefined, isZh: boolean) {
  const map = {
    idol_ticketing: {
      axis: isZh ? ["成功率", "最大卡点", "补救动作", "最终走向", "备用渠道"] : ["odds", "main block", "fix", "outcome", "backup"],
      strong: isZh ? "偏能成，但前提是准备要细，别只靠临场手速。" : "Likely workable, but preparation matters more than speed alone.",
      mixed: isZh ? "有机会，但不稳；真正决定结果的是平台规则、账号状态和候补渠道。" : "Possible but unstable; rules, account readiness, and backup routes decide it.",
      blocked: isZh ? "短期不算顺，容易卡在网络、支付、名额或时间点；要准备第二方案。" : "Not smooth short-term; network, payment, quota, or timing may block it. Prepare plan B.",
      risk: isZh ? "不要只押一个入口，提前登录、绑支付、开候补，多设备分工。" : "Do not rely on one entry; log in early, bind payment, open waitlist, split devices.",
    },
    idol_seat: {
      axis: isZh ? ["视野质量", "座位区间", "遮挡风险", "现场体验", "心态预期"] : ["view quality", "seat zone", "obstruction risk", "experience", "expectation"],
      strong: isZh ? "座位体验偏加分，视野/氛围至少有一项会让你满意。" : "Seat experience looks positive; either the view or atmosphere should satisfy you.",
      mixed: isZh ? "位置中等偏稳，不一定是梦中情位，但现场体验不会差。" : "Likely mid-range and stable; maybe not dream seats, but not a bad experience.",
      blocked: isZh ? "座位结果容易低于期待，重点防遮挡、边角位或动线不便。" : "Seat outcome may fall below expectation; watch obstruction, side zones, or awkward flow.",
      risk: isZh ? "先接受“不是最前也能好看”，重点查场馆视野图和屏幕配置。" : "Accept that non-front seats can still work; check sightline maps and screen setup.",
    },
    idol_fansign: {
      axis: isZh ? ["中签概率", "排位顺序", "互动质量", "表达重点", "临场变量"] : ["entry odds", "ranking", "interaction", "message", "live variable"],
      strong: isZh ? "进场/中签信号偏强，互动质量比排位更值得期待。" : "Entry signal is strong; interaction quality matters more than ranking.",
      mixed: isZh ? "有希望，但排位未必漂亮；准备内容比纠结数字更重要。" : "There is hope, but ranking may not be ideal; prepare your message over chasing numbers.",
      blocked: isZh ? "竞争和规则压力偏大，容易差一点或被流程影响。" : "Competition and rules are heavy; a near miss or process issue is possible.",
      risk: isZh ? "别准备长篇输出，保留一句最想被记住的话，规则时间点一定卡准。" : "Avoid a long script. Keep one memorable line and follow timing rules exactly.",
    },
    idol_career: {
      axis: isZh ? ["回归热度", "资源曝光", "路人反馈", "粉丝助推", "后续走势"] : ["comeback heat", "exposure", "public response", "fan push", "next trend"],
      strong: isZh ? "事业盘面偏上扬，曝光或作品反馈会有一个明显亮点。" : "Career momentum is rising; exposure or work response should show one bright point.",
      mixed: isZh ? "热度有，但节奏不齐；短期容易一边被看见、一边有争议或延迟。" : "Heat exists but rhythm is uneven; visibility may come with dispute or delay.",
      blocked: isZh ? "短期资源不够顺，容易被排期、公司策略或舆论噪音拖慢。" : "Resources are not smooth short-term; schedule, agency strategy, or noise may slow it.",
      risk: isZh ? "粉丝能做的是稳数据、稳口碑、少被对家节奏带跑。" : "Fans should stabilize data and reputation; do not get dragged by rival narratives.",
    },
    idol_event: {
      axis: isZh ? ["现场顺利度", "应援节奏", "出行变量", "互动氛围", "体验结果"] : ["smoothness", "support rhythm", "travel variable", "interaction mood", "experience"],
      strong: isZh ? "现场体验偏顺，氛围会比你预期更有记忆点。" : "The event looks smooth; the atmosphere may become more memorable than expected.",
      mixed: isZh ? "能玩得开心，但中间会有一个小插曲，需要你别被打乱节奏。" : "You can enjoy it, but one small hiccup may test your rhythm.",
      blocked: isZh ? "现场变量偏多，尤其要防迟到、漏物、沟通误会或临时改动。" : "There are more live variables; avoid lateness, missing items, miscommunication, or last-minute change.",
      risk: isZh ? "提前规划交通、入场、物料和集合点，现场别临时改太多。" : "Plan transport, entry, materials, and meeting points; avoid too many last-minute changes.",
    },
  } as const;

  return map[(scenarioKey || "idol_event") as keyof typeof map] || map.idol_event;
}

function getIdolCardSignal(
  card: TarotCard,
  reversed: boolean,
  positionLabel: string,
  idx: number,
  scenarioKey: TarotScenarioKey | undefined,
  total: number,
  isZh: boolean
) {
  const tone = getIdolScenarioTone(scenarioKey, isZh);
  const axis = tone.axis[idx] || tone.axis[Math.min(idx, tone.axis.length - 1)] || tone.axis[0];
  const isMajor = card.suit === "major";
  const suit = isMajor ? "wands" : card.suit;
  const score = (reversed ? -2 : 2) + (isMajor ? 1 : 0) + (suit === "wands" || suit === "pentacles" ? 1 : 0);

  const verdict = score >= 3 ? tone.strong : score >= 1 ? tone.mixed : tone.blocked;
  const cardBiasZh: Record<string, string> = {
    wands: "行动力和现场节奏",
    cups: "情绪期待和互动氛围",
    swords: "规则、沟通和突发变量",
    pentacles: "名额、资源、座位和现实条件",
  };
  const cardBiasEn: Record<string, string> = {
    wands: "action and live rhythm",
    cups: "emotion and interaction mood",
    swords: "rules, communication, and sudden variables",
    pentacles: "quota, resources, seats, and practical conditions",
  };
  const bias = isZh ? cardBiasZh[suit] : cardBiasEn[suit];
  const polarity = reversed ? (isZh ? "先扣分再补救" : "block first, then fix") : (isZh ? "可推进但要抓时机" : "movable if timed well");
  const conclusion = isZh
    ? `先看结果：${verdict}`
    : `Verdict: ${verdict}`;
  const reason = isZh
    ? `${card.nameCn}${reversed ? "逆位" : "正位"}落在「${positionLabel}」，只判断${axis}。牌面指向${bias}，状态是「${polarity}」。`
    : `${card.name} ${reversed ? "reversed" : "upright"} in "${positionLabel}" reads ${axis}. It points to ${bias}, with a "${polarity}" tone.`;
  const action = isZh
    ? `下一步：${tone.risk}`
    : `Action: ${tone.risk}`;

  return { conclusion, reason, action, verdict, axis, total };
}

// ---- Dynamic generator: card + question + category → structured reading ----
export function generateAIReading(
  cards: Array<{ card: TarotCard; reversed: boolean }>,
  question: string,
  locale: "zh-TW" | "zh" | "en",
  scenarioOverride?: TarotScenarioKey,
  positionLabels?: string[]
): TarotAIResult {
  const isZh = locale !== "en";
  const category = detectCategory(question);
  const scenarioKey = scenarioOverride || detectTarotScenario(question, category);
  const scenario = getScenarioScript(scenarioKey, locale);
  const focus = getQuestionFocus(category, scenarioKey, isZh);
  const context = getQuestionContext(question, category, scenarioKey, isZh);
  const q = question.trim();
  const profile = getQuestionProfile(q, scenarioKey, isZh);
  const idolMode = isIdolScenario(scenarioKey);
  const idolTone = getIdolScenarioTone(scenarioKey, isZh);

  const cardReadings = cards.map(({ card, reversed }, idx) => {
    const interp = getCardInterpretation(card.id, category, card.name, card.nameCn,
      isZh ? card.keywordsZh : card.keywordsEn, reversed);
    const positionLabel = positionLabels?.[idx] || (isZh ? `第 ${idx + 1} 张` : `Card ${idx + 1}`);
    const positionMeaning = getPositionMeaning(positionLabel, idx, cards.length, isZh);
    const positionAdvice = getPositionAdvice(positionLabel, reversed, isZh);
    const idolSignal = idolMode
      ? getIdolCardSignal(card, reversed, positionLabel, idx, scenarioKey, cards.length, isZh)
      : null;

    return {
      position: {
        elegant: idolSignal
          ? `${idolSignal.conclusion} ${idolSignal.reason}`
          : isZh
          ? `「${positionLabel}」不是单独看吉凶，而是用来判断${focus}中的一个关键切面。${profile.constraint}${positionMeaning.role}`
          : `"${positionLabel}" is not just good or bad; it reads one key layer of ${focus}. ${profile.constraint} ${positionMeaning.role}`,
        plain: idolSignal ? idolSignal.action : (isZh ? positionMeaning.action : positionMeaning.action),
      },
      heart: {
        elegant: idolSignal
          ? (isZh
            ? `直接看你的问题「${q.slice(0, 30) || scenario.label}」：${profile.answerStyle}。这张牌只判断${idolSignal.axis}，不扩散到无关运势。${idolSignal.verdict}`
            : `For "${q.slice(0, 46) || scenario.label}", ${profile.answerStyle}. This card reads only ${idolSignal.axis}. ${idolSignal.verdict}`)
          : isZh
          ? `${positionLabel}抽到${card.nameCn}${reversed ? "逆位" : "正位"}。${getSuitLens(card, isZh)}。你问的是「${q.slice(0, 30) || scenario.label}」，所以只按${context.intent}判断。${getQuestionSpecificCardMessage(card.nameCn, reversed, context, positionLabel, isZh)}`
          : `${positionLabel} is ${card.name} ${reversed ? "reversed" : "upright"}. ${getSuitLens(card, isZh)}. Because your question is "${q.slice(0, 46) || scenario.label}", this card reads ${context.intent} only. ${getQuestionSpecificCardMessage(card.name, reversed, context, positionLabel, isZh)}`,
        plain: idolSignal
          ? (isZh
            ? `说白了：${idolSignal.verdict} 别绕远，先处理这张牌点名的现实卡点。`
            : `Plain: ${idolSignal.verdict} Handle the practical block before overthinking signs.`)
          : isZh
          ? `说白了：这张牌只回答${context.subject}。${reversed ? "先处理卡点，再问结果。" : "可以观察反馈，并小步推进。"}`
          : `Plain truth: this card is answering ${context.subject}, not a generic fortune. ${reversed ? "Handle the block before chasing the outcome." : "Watch real feedback and prepare a small next step."}`,
      },
      situation: {
        elegant: idolSignal
          ? (isZh
            ? `${interp.elegant} 放回爱豆场景里，不要解读成“大好运/大坏运”，而是看它落到${idolSignal.axis}时给出的提醒：${idolSignal.action}`
            : `${interp.elegant} In this idol scenario, read it through ${idolSignal.axis}: ${idolSignal.action}`)
          : isZh
          ? `${firstClause(interp.elegant)} 放在「${positionLabel}」里，重点是：${context.signal}会直接影响${context.subject}的走向。`
          : `${interp.elegant} In the "${positionLabel}" position, this is not just card meaning; ${context.signal} directly shapes ${context.subject}.`,
        plain: idolSignal
          ? (isZh ? `重点只有一个：${idolSignal.axis}。${reversed ? "先补漏洞，再看结果。" : "可以推进，但别省略准备动作。"}` : `One focus: ${idolSignal.axis}. ${reversed ? "Fix the gap first." : "Move, but do not skip prep."}`)
          : isZh
          ? `${interp.plain} 放回你的问题里看，重点是：${context.intent}。时间范围按${profile.timeRange}看。`
          : `${interp.plain} For your question, the focus is ${context.intent}. Time range: ${profile.timeRange}.`,
      },
      future: {
        elegant: idolSignal
          ? (isZh
            ? `${reversed ? "后续会先卡一下" : "后续有推进空间"}，但结果不是靠许愿出来的。围绕${idolSignal.axis}，你要做的是：${idolTone.risk}`
            : `${reversed ? "The next step may stall first" : "There is room to move"}, but the result needs action. Around ${idolSignal.axis}: ${idolTone.risk}`)
          : isZh
          ? `${reversed ? "逆位的" : "正位的"}${card.nameCn}落在「${positionLabel}」这个位置，说明${context.subject}${reversed ? "短期内会有延迟或反复，尤其要先确认信息、情绪或现实条件是否成熟。" : "有继续发展的空间，但需要你主动捕捉具体反馈，而不是只等一个笼统答案。"}`
          : `${reversed ? "Reversed" : "Upright"} ${card.name} in "${positionLabel}" suggests ${context.subject} ${reversed ? "may delay or fluctuate; clarify facts, emotions, or conditions first." : "can keep developing, but you need concrete feedback rather than a vague sign."}`,
        plain: idolSignal
          ? (isZh ? `${reversed ? "先稳住。" : "可以冲。"}${idolTone.risk}` : `${reversed ? "Stabilize first. " : "You can move. "}${idolTone.risk}`)
          : isZh
          ? `接下来${reversed ? "先稳住，不要硬推。" : "可以观察并小步行动。"}${positionAdvice ? ` ${positionAdvice}` : ` ${context.action}`}`
          : `In short: ${reversed ? "steady yourself; do not push." : "observe and take one small step."} ${positionAdvice || context.action}`,
      },
      advice: idolSignal
        ? `${idolTone.risk}${isZh ? ` 这条建议只针对「${q.slice(0, 24) || scenario.label}」，不要扩大解读。` : ` This advice applies only to "${q.slice(0, 36) || scenario.label}".`}`
        : positionAdvice || (isZh ? `${context.action} 这比继续空想结果更有用。` : `${context.action} This is more useful than only waiting for an answer.`),
    };
  });

  const reversedCount = cards.filter(c => c.reversed).length;
  const idolFinal = idolMode
    ? reversedCount === 0
      ? idolTone.strong
      : reversedCount >= Math.ceil(cards.length / 2)
        ? idolTone.blocked
        : idolTone.mixed
    : "";
  const overview = {
    elegant: idolMode
      ? (isZh
        ? `直接结论：${idolFinal} 这组牌只回答「${q.slice(0, 26) || scenario.label}」，时间看${profile.timeRange}，重点是${idolTone.axis.slice(0, Math.min(cards.length, idolTone.axis.length)).join("、")}。${reversedCount >= Math.ceil(cards.length / 2) ? "逆位偏多，代表别硬冲；先补规则、时间、账号、交通或应援准备里的漏洞。" : "顺位信号够用，代表可以行动；但要把准备做细，不要临场再补救。"}`
        : `Direct verdict: ${idolFinal} This spread only answers "${q.slice(0, 42) || scenario.label}", time range ${profile.timeRange}, through ${idolTone.axis.slice(0, Math.min(cards.length, idolTone.axis.length)).join(", ")}. ${reversedCount >= Math.ceil(cards.length / 2) ? "More reversals mean do not force it; fix rules, timing, accounts, transport, or fan-support prep first." : "The signal is workable; move with detailed preparation."}`)
      : isZh
      ? `${cards.map(c => c.card.nameCn).join(" → ")}。${cards.length}張牌讀完，這次只回答「${q.slice(0, 26)}」，不做泛泛運勢。時間範圍：${profile.timeRange}；核心落點：${context.intent}。${reversedCount === 0 ? `整體訊息比較順，${context.subject}有往前推的空間，但仍要看${context.signal}的現實反饋。` : reversedCount === cards.length ? `全部逆位並不等於壞事，它更像是在提醒你先停下來，把${context.signal}整理清楚，再判斷${context.subject}。` : `有順有逆，說明${context.subject}不是單一路徑：一部分可以行動，一部分還需要觀察${context.signal}。`}`
      : `${cards.map(c => c.card.name).join(" → ")}. These ${cards.length} cards answer only "${q.slice(0, 42)}", not a generic fortune. Time range: ${profile.timeRange}; core focus: ${context.intent}. ${reversedCount === 0 ? `The message is mostly open; ${context.subject} can move forward, while ${context.signal} still needs real feedback.` : reversedCount === cards.length ? `All reversals are not bad luck; they ask you to pause and clarify ${context.signal} before judging ${context.subject}.` : `${context.subject} is layered: some parts can move, while ${context.signal} still needs observation.`}`,
    plain: idolMode
      ? (isZh
        ? `一句话：${idolFinal} 下一步别等玄学给你兜底，按这条做：${idolTone.risk}`
        : `Bottom line: ${idolFinal} Next step: ${idolTone.risk}`)
      : isZh
      ? `一句話總結：關於「${q.slice(0, 18)}」——${reversedCount >= 2 ? `目前確實有卡點，先別急著要最終答案；先處理${context.signal}，再看局面會不會鬆動。` : `${context.subject}整體有可推進空間。你現在最有用的做法是：${context.action}`}`
      : `Bottom line: regarding "${q.slice(0, 30)}" — ${reversedCount >= 2 ? `there are real blocks. Handle ${context.signal} before demanding the final answer.` : `${context.subject} has room to move. The most useful next step is: ${context.action}`}`,
  };

  return { scenario, cards: cardReadings, overview };
}

function firstClause(text: string) {
  const clean = (text || "").trim();
  const match = clean.match(/^.*?[。.!?！？]/);
  return (match?.[0] || clean).replace(/\s+/g, " ").trim();
}
