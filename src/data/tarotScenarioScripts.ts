import type { CardCategory } from "@/lib/tarot-card-library";

export type TarotScenarioKey =
  | "wealth_overall"
  | "wealth_salary"
  | "wealth_side"
  | "wealth_protection"
  | "love_single"
  | "love_relationship"
  | "love_reconcile"
  | "love_ambiguous"
  | "career_growth"
  | "career_job"
  | "career_study"
  | "relations_overall"
  | "life_general"
  | "idol_ticketing"
  | "idol_seat"
  | "idol_fansign"
  | "idol_event"
  | "idol_career";

export interface ScriptPair {
  short: string;
  detailed: string;
}

export interface ScenarioScript {
  label: string;
  opening: ScriptPair;
  scene: ScriptPair;
  closing: ScriptPair;
}

type LocalizedScript = {
  zh: ScenarioScript;
  en: ScenarioScript;
};

const COMMON_OPENING: Record<"zh" | "en", ScriptPair> = {
  zh: {
    short: "牌已经抽好啦。这组牌会先看你当下最真实的状态，再看接下来可能出现的变化。",
    detailed: "这次牌阵的讯息会围绕你的问题展开：先看现状，再看隐藏影响，最后给你一个比较适合当下行动节奏的建议。塔罗不是替你做决定，而是帮你把心里混乱的地方照亮一点。",
  },
  en: {
    short: "Your cards are drawn. This spread first looks at your current energy, then the direction things may move next.",
    detailed: "This reading follows the question you asked: current situation, hidden influence, and a practical next step. Tarot does not make the choice for you; it simply helps bring a little more clarity to what already feels tangled inside.",
  },
};

const COMMON_CLOSING: Record<"zh" | "en", ScriptPair> = {
  zh: {
    short: "这就是这组牌给你的提醒。先别急着给事情下结论，照顾好自己的节奏更重要。",
    detailed: "牌面指出的是趋势，不是死板的结果。接下来你可以带着这份提醒去观察现实里的细节：哪些地方值得继续推进，哪些地方需要先缓一缓。真正能改变走向的，还是你的选择和行动。",
  },
  en: {
    short: "That is the message from this spread. Don’t rush to force an answer; protect your own pace first.",
    detailed: "The cards show a tendency, not a fixed ending. Use this as a reminder to notice what deserves movement and what needs more time. The direction can still change through your choices, timing, and actions.",
  },
};

const SCENARIO_SCRIPTS: Record<TarotScenarioKey, LocalizedScript> = {
  wealth_overall: {
    zh: {
      label: "财运 · 整体走势",
      opening: COMMON_OPENING.zh,
      scene: {
        short: "这组牌提示，近期钱的流动会变明显：有进账机会，也有容易多花的地方。",
        detailed: "财运不是完全停滞的状态，更像是「一边进、一边漏」。主业收入偏稳，额外收入或投资机会则需要慢一点判断。最近适合先守住现金流，再考虑小范围尝试新的增收方式；冲动消费、朋友推荐项目、情绪性下单都要多留一个心眼。",
      },
      closing: COMMON_CLOSING.zh,
    },
    en: {
      label: "Money · Overall Flow",
      opening: COMMON_OPENING.en,
      scene: {
        short: "Money is moving around you: there may be chances to earn, but also places where money leaks easily.",
        detailed: "Your financial energy is not stuck. It feels more like money coming in while some of it quietly slips out. Main income looks steadier, while side income or investment choices need a slower judgment. Protect cash flow first, then test new income ideas in small steps. Be careful with emotional spending, friend-recommended projects, and anything that pressures you to decide quickly.",
      },
      closing: COMMON_CLOSING.en,
    },
  },
  wealth_salary: {
    zh: {
      label: "财运 · 正财 / 工作收入",
      opening: COMMON_OPENING.zh,
      scene: {
        short: "本职收入偏稳，真正的机会在于把现有成绩做得更清楚、更能被看见。",
        detailed: "这组牌不太像突然暴富，更像稳扎稳打地把收入盘子做厚。近期你适合把重点放在绩效、项目结果和可量化成果上。想谈加薪、转岗或争取资源的话，不要只靠情绪表达，先把自己做过什么、带来什么价值整理出来，机会会更容易落到你身上。",
      },
      closing: COMMON_CLOSING.zh,
    },
    en: {
      label: "Money · Salary / Main Income",
      opening: COMMON_OPENING.en,
      scene: {
        short: "Main income feels steady. The real opening is making your work more visible and measurable.",
        detailed: "This is not sudden-money energy; it is stable-growth energy. Focus on performance, project outcomes, and results that can be clearly shown. If you want a raise, role change, or more resources, prepare facts before emotions. The more concrete your value looks, the easier it is for opportunities to find you.",
      },
      closing: COMMON_CLOSING.en,
    },
  },
  wealth_side: {
    zh: {
      label: "财运 · 偏财 / 副业 / 投资",
      opening: COMMON_OPENING.zh,
      scene: {
        short: "偏财有机会，但不适合靠冲动下注；越冷静，越容易保住好运。",
        detailed: "副业、投资、抽奖、意外收入这类事情，牌面给到的是「可以看，但别上头」。近期容易被高收益描述吸引，也容易因为朋友推荐、人情关系而放低警惕。更适合小额试水、分散投入、及时止损；只要你愿意慢一点，反而更容易避开不必要的损失。",
      },
      closing: COMMON_CLOSING.zh,
    },
    en: {
      label: "Money · Side Income / Investment",
      opening: COMMON_OPENING.en,
      scene: {
        short: "Side money has potential, but this is not a moment for impulsive bets.",
        detailed: "Side gigs, investments, lottery-style luck, and unexpected income all carry mixed energy. You may be drawn to high-return promises or friend recommendations, so keep your judgment independent. Small tests, divided risk, and a clear exit point are favored. Moving slower may actually protect your luck.",
      },
      closing: COMMON_CLOSING.en,
    },
  },
  wealth_protection: {
    zh: {
      label: "财运 · 守财 / 防破财",
      opening: COMMON_OPENING.zh,
      scene: {
        short: "最近要注意「不知不觉花掉」的钱，尤其是情绪消费和临时开销。",
        detailed: "牌面提醒你，钱不一定是大笔流失，反而可能是小额、频繁、没感觉的支出慢慢累积。最近适合整理订阅、控制下单冲动，也不要轻易借钱或碰不清楚的理财。守财不是抠门，而是把钱留给真正值得的地方。",
      },
      closing: COMMON_CLOSING.zh,
    },
    en: {
      label: "Money · Saving / Avoiding Loss",
      opening: COMMON_OPENING.en,
      scene: {
        short: "Watch the money that disappears quietly, especially emotional spending and small repeated costs.",
        detailed: "This spread warns less about one huge loss and more about small leaks adding up. Review subscriptions, slow down impulse buys, and avoid lending or unclear financial products. Saving money is not fear; it is keeping your resources for what actually matters.",
      },
      closing: COMMON_CLOSING.en,
    },
  },
  love_single: {
    zh: {
      label: "情感 · 单身 / 脱单",
      opening: COMMON_OPENING.zh,
      scene: {
        short: "感情能量正在慢慢打开，新的缘分更容易出现在自然、不刻意的互动里。",
        detailed: "这组牌不是让你急着脱单，而是提醒你：你最近的吸引力在恢复。真正适合你的人，未必出现在用力寻找的时候，反而可能来自朋友介绍、线下活动、兴趣圈或一次轻松聊天。放松一点，你越像自己，越容易遇到舒服的人。",
      },
      closing: COMMON_CLOSING.zh,
    },
    en: {
      label: "Love · Single / New Romance",
      opening: COMMON_OPENING.en,
      scene: {
        short: "Your love energy is opening slowly. New connection is more likely through natural, unforced interaction.",
        detailed: "This spread does not ask you to rush into dating. It shows your attraction returning. The right person may appear through mutual friends, offline events, interest circles, or an easy conversation rather than forced searching. The more you feel like yourself, the easier it is to meet someone who feels comfortable.",
      },
      closing: COMMON_CLOSING.en,
    },
  },
  love_relationship: {
    zh: {
      label: "情感 · 恋爱中 / 关系走势",
      opening: COMMON_OPENING.zh,
      scene: {
        short: "这组牌会看你们现在的相处温度：哪里还在靠近，哪里已经有点卡住。",
        detailed: "你们之间不是单纯好或不好，而是有些情绪没有被好好说出来。牌面会更偏向提醒你：对方现在愿不愿意投入、你们沟通哪里容易误会，以及这段关系接下来适合推进还是先稳住。重点不是输赢，是让彼此都更舒服。",
      },
      closing: COMMON_CLOSING.zh,
    },
    en: {
      label: "Love · In Relationship",
      opening: COMMON_OPENING.en,
      scene: {
        short: "This spread reads the temperature between you two: where closeness remains, and where things feel stuck.",
        detailed: "The relationship is not simply good or bad. Some feelings may not have been expressed clearly. The cards point to their willingness to invest, where misunderstandings happen, and whether the connection wants movement or stability first. The goal is not winning; it is making the bond feel safer for both sides.",
      },
      closing: COMMON_CLOSING.en,
    },
  },
  love_reconcile: {
    zh: {
      label: "情感 · 复合 / 挽回",
      opening: COMMON_OPENING.zh,
      scene: {
        short: "这组牌会看对方现在还有没有回头的能量，以及你该不该主动。",
        detailed: "复合不是只看对方想不想，也要看过去的问题有没有被真正处理。牌面会提醒你：对方现在是怀念、逃避、观望，还是已经在往前走。你要做的不是一味追，而是判断此刻适合联系、等待，还是先把自己的状态拉回来。",
      },
      closing: COMMON_CLOSING.zh,
    },
    en: {
      label: "Love · Reconciliation",
      opening: COMMON_OPENING.en,
      scene: {
        short: "This spread checks whether there is still returning energy, and whether you should reach out.",
        detailed: "Reconciliation is not only about whether they miss you; it also depends on whether the old issue has truly changed. The cards show whether they are nostalgic, avoidant, watching from a distance, or already moving on. Your next step is not chasing blindly, but knowing whether to contact, wait, or stabilize yourself first.",
      },
      closing: COMMON_CLOSING.en,
    },
  },
  love_ambiguous: {
    zh: {
      label: "情感 · 暧昧 / 对方想法",
      opening: COMMON_OPENING.zh,
      scene: {
        short: "暧昧最怕忽冷忽热，这组牌会看对方到底是有感觉，还是只是在享受被关注。",
        detailed: "你现在需要的不是继续猜，而是看对方有没有稳定投入。牌面会提醒你：对方是真心靠近、暂时犹豫，还是只给情绪价值但没有行动。不要被一句好听的话带走，真正有诚意的人，会持续给你时间、回应和确定感。",
      },
      closing: COMMON_CLOSING.zh,
    },
    en: {
      label: "Love · Situationship / Their Feelings",
      opening: COMMON_OPENING.en,
      scene: {
        short: "Situationships can feel hot and cold. This spread checks whether they truly feel something or simply enjoy the attention.",
        detailed: "You do not need more guessing; you need to see whether their effort is consistent. The cards show whether they are genuinely moving closer, hesitating, or only giving emotional comfort without action. Do not be carried away by one sweet line. Real intention shows up as time, response, and clarity.",
      },
      closing: COMMON_CLOSING.en,
    },
  },
  career_growth: {
    zh: {
      label: "事业 · 职场发展 / 晋升",
      opening: COMMON_OPENING.zh,
      scene: {
        short: "事业上有回升感，最近适合主动一点，让别人看见你的能力。",
        detailed: "这组牌像是在说：机会不是没有，但需要你先站出来。近期你可能会遇到新任务、被看见的项目，或需要承担更多责任的场景。不要只默默做事，适度表达你的想法和成果，会让你在团队里的存在感更强。",
      },
      closing: COMMON_CLOSING.zh,
    },
    en: {
      label: "Career · Growth / Promotion",
      opening: COMMON_OPENING.en,
      scene: {
        short: "Career energy is rising. This is a good moment to be more visible.",
        detailed: "The opportunity is there, but you may need to step forward first. New responsibilities, visible projects, or recognition may appear. Do not only work silently; express your ideas and results with calm confidence. Visibility matters now.",
      },
      closing: COMMON_CLOSING.en,
    },
  },
  career_job: {
    zh: {
      label: "事业 · 求职 / 面试",
      opening: COMMON_OPENING.zh,
      scene: {
        short: "求职运不差，关键是别被紧张带乱节奏，把优势讲清楚就好。",
        detailed: "牌面更像是在提醒你：你不是没有机会，而是需要更稳定地呈现自己。面试时不要过度讨好岗位，也不要把自己说得太虚。把经历、能力、作品或结果讲具体，反而更容易打动对方。适合你的机会，会更看重真实可落地的能力。",
      },
      closing: COMMON_CLOSING.zh,
    },
    en: {
      label: "Career · Job Search / Interview",
      opening: COMMON_OPENING.en,
      scene: {
        short: "Job-search energy is supportive. Keep your rhythm steady and explain your strengths clearly.",
        detailed: "The spread suggests you do have openings, but you need to present yourself with more steadiness. Do not over-sell yourself to please a role. Be specific about your experience, skills, portfolio, or results. The right opportunity will value what you can actually deliver.",
      },
      closing: COMMON_CLOSING.en,
    },
  },
  career_study: {
    zh: {
      label: "学业 · 考试 / 学习",
      opening: COMMON_OPENING.zh,
      scene: {
        short: "学习状态会慢慢回稳，别贪多，先把最容易提分的地方补起来。",
        detailed: "这组牌提示你，问题不在于完全没基础，而是注意力容易被焦虑拉走。接下来适合把任务拆小：先补最薄弱、最容易拿分的部分，再处理难题。只要节奏稳下来，结果会比你现在担心的更好。",
      },
      closing: COMMON_CLOSING.zh,
    },
    en: {
      label: "Study · Exams / Learning",
      opening: COMMON_OPENING.en,
      scene: {
        short: "Your study rhythm can recover. Do not try to do everything at once.",
        detailed: "The issue is not a total lack of foundation; anxiety may be scattering your focus. Break your study plan into smaller parts. Start with the weakest and easiest-to-improve areas, then move to harder topics. Once your rhythm stabilizes, the result may be better than you fear.",
      },
      closing: COMMON_CLOSING.en,
    },
  },
  relations_overall: {
    zh: {
      label: "人际 · 关系互动",
      opening: COMMON_OPENING.zh,
      scene: {
        short: "人际关系里，有些话适合说清楚，有些距离也需要保留。",
        detailed: "这组牌提醒你，最近不要把所有人的情绪都往自己身上揽。朋友、同事或家人之间，可能有人需要你的靠近，也有人需要你设边界。真正舒服的关系，不是一直迁就，而是能把话说清楚，也能给彼此空间。",
      },
      closing: COMMON_CLOSING.zh,
    },
    en: {
      label: "Relationships · Social Dynamics",
      opening: COMMON_OPENING.en,
      scene: {
        short: "Some things need to be said clearly, and some distance needs to be protected.",
        detailed: "The cards remind you not to carry everyone else’s emotions as your own. With friends, colleagues, or family, one person may need your warmth while another requires firmer boundaries. A healthy relationship is not constant compromise; it is clear communication with enough space.",
      },
      closing: COMMON_CLOSING.en,
    },
  },
  life_general: {
    zh: {
      label: "综合运势 · 当下状态",
      opening: COMMON_OPENING.zh,
      scene: {
        short: "这组牌会先看你现在的整体状态，再提醒你接下来哪里该动、哪里该慢。",
        detailed: "如果你的问题比较宽泛，牌面会更像一张当下生活的能量地图。它会提示你最近的精神状态、外界阻力、适合推进的方向，以及暂时不必强求的部分。你不需要一次解决所有事，先抓住最重要的一步就够了。",
      },
      closing: COMMON_CLOSING.zh,
    },
    en: {
      label: "General Fortune · Current State",
      opening: COMMON_OPENING.en,
      scene: {
        short: "This spread reads your overall state first, then shows where to move and where to slow down.",
        detailed: "When the question is broad, the spread becomes an energy map of your current life. It shows your mental state, outside resistance, areas worth moving forward, and places that do not need forcing. You do not have to solve everything at once. Start with the next most important step.",
      },
      closing: COMMON_CLOSING.en,
    },
  },
  idol_ticketing: {
    zh: {
      label: "爱豆 · 演唱会抢票",
      opening: COMMON_OPENING.zh,
      scene: {
        short: "这次抢票有机会，但不是完全顺滑的牌面，准备越细，临场越稳。",
        detailed: "牌面显示这次票务竞争不会太轻松，但也不是完全没机会。重点是提前把账号、设备、网络、付款方式都确认好，不要临开票才慌。可以准备几个备选价位或区域，也别只押一个平台。第一波没抢到也先别崩，后续退票、未付款回流或加场信息都值得留意。",
      },
      closing: COMMON_CLOSING.zh,
    },
    en: {
      label: "Idol · Ticketing",
      opening: COMMON_OPENING.en,
      scene: {
        short: "There is a chance, but the ticketing energy is not completely smooth. Details matter.",
        detailed: "This ticketing attempt looks competitive, but not hopeless. Prepare your account, device, network, and payment method before the sale starts. Have backup sections or price tiers ready, and do not rely on only one platform. If the first wave fails, do not collapse immediately; released seats, unpaid orders, or extra rounds may still matter.",
      },
      closing: COMMON_CLOSING.en,
    },
  },
  idol_seat: {
    zh: {
      label: "爱豆 · 抽位置 / 座位抽签",
      opening: COMMON_OPENING.zh,
      scene: {
        short: "抽座结果有随机性，但这组牌更强调观看体验，不一定只看前排。",
        detailed: "这次位置运不是那种「一定神席」的感觉，但也不差。牌面更像是在说：就算不是最核心的位置，也可能有不错的视野、氛围或意外惊喜。不要把全部期待压在排数上，提前看好场馆图，准备好拍摄和应援物，现场体验会比你想象中更重要。",
      },
      closing: COMMON_CLOSING.zh,
    },
    en: {
      label: "Idol · Seat Lottery",
      opening: COMMON_OPENING.en,
      scene: {
        short: "Seat lottery is random, but this spread focuses more on the overall viewing experience than just front rows.",
        detailed: "This does not feel like a guaranteed dream seat, but it also does not look bad. Even if you are not in the core front area, the view, atmosphere, or small surprises may still be satisfying. Do not tie all your joy to the row number. Check the venue map, prepare your fan items, and let the live experience matter too.",
      },
      closing: COMMON_CLOSING.en,
    },
  },
  idol_fansign: {
    zh: {
      label: "爱豆 · 签售名额 / 排位",
      opening: COMMON_OPENING.zh,
      scene: {
        short: "签售这组牌重点看名额、顺位和互动氛围，能不能顺利见到是核心。",
        detailed: "牌面显示这次签售不只是拼运气，也很吃规则和时间点。想提高成功率，就要提前确认报名条件、截止时间、抽选方式和资料填写。靠前顺位可能有难度，但拿到入场或有效互动的机会并不弱。真正见到时，别准备太复杂的话，一句自然真诚的表达反而更容易被接住。",
      },
      closing: COMMON_CLOSING.zh,
    },
    en: {
      label: "Idol · Fansign / Queue",
      opening: COMMON_OPENING.en,
      scene: {
        short: "This spread looks at entry chance, queue placement, and the feeling of the interaction.",
        detailed: "This fansign is not only about luck; rules and timing matter a lot. Check entry conditions, deadlines, lottery method, and submitted information carefully. A front position may be difficult, but the chance of attending or having a meaningful interaction is still present. When the moment comes, keep your words simple and sincere instead of over-prepared.",
      },
      closing: COMMON_CLOSING.en,
    },
  },
  idol_event: {
    zh: {
      label: "爱豆 · 演出 / 线下活动运势",
      opening: COMMON_OPENING.zh,
      scene: {
        short: "这次线下活动整体值得期待，但要把出行和现场细节提前准备好。",
        detailed: "牌面更偏向「可以期待，但别临时抱佛脚」。路线、证件、票务、充电宝、应援物和入场规则都提前确认，会让你现场轻松很多。活动当天可能会有小插曲，但不太像严重阻碍。放平心态去享受，比过度担心每个细节更重要。",
      },
      closing: COMMON_CLOSING.zh,
    },
    en: {
      label: "Idol · Live Event Fortune",
      opening: COMMON_OPENING.en,
      scene: {
        short: "The event looks worth anticipating, but preparation will make the day much smoother.",
        detailed: "The cards say: look forward to it, but do not leave everything to the last minute. Confirm route, ID, ticket, battery, fan items, and entry rules in advance. There may be small surprises on-site, but they do not look like major obstacles. A relaxed mindset will help you enjoy the day more than trying to control every detail.",
      },
      closing: COMMON_CLOSING.en,
    },
  },
  idol_career: {
    zh: {
      label: "爱豆 · 艺人事业运势",
      opening: COMMON_OPENING.zh,
      scene: {
        short: "这组牌会看这位艺人近期有没有起势、曝光和新动向。",
        detailed: "艺人事业运更适合看趋势，不适合当成官宣预言。牌面会提示近期是上升、蓄力、调整，还是需要等待。你可以留意社媒状态、舞台安排、品牌露出、造型变化和团队动作。有些安静期并不是没事发生，可能是在为下一轮曝光做准备。",
      },
      closing: COMMON_CLOSING.zh,
    },
    en: {
      label: "Idol · Artist Career",
      opening: COMMON_OPENING.en,
      scene: {
        short: "This spread checks whether the artist’s career energy is rising, preparing, or waiting.",
        detailed: "Idol career readings work better as trend readings, not official-news predictions. The cards show whether the artist is gaining momentum, preparing quietly, adjusting direction, or waiting for timing. Watch social activity, stage schedules, brand exposure, styling changes, and team movement. A quiet period does not always mean nothing is happening; it may be preparation for the next visible push.",
      },
      closing: COMMON_CLOSING.en,
    },
  },
};

export function detectTarotScenario(question: string, category: CardCategory): TarotScenarioKey {
  const q = question.toLowerCase();
  if (category === "wealth") {
    if (/正财|薪资|工资|加薪|工作收入|salary|wage|raise/.test(q)) return "wealth_salary";
    if (/偏财|副业|投资|股票|基金|彩票|意外收入|side|invest|stock|lottery/.test(q)) return "wealth_side";
    if (/守财|破财|开支|消费|借贷|省钱|spend|expense|debt|save/.test(q)) return "wealth_protection";
    return "wealth_overall";
  }
  if (category === "love") {
    if (/单身|脱单|正缘|桃花|遇到|single|new love|meet/.test(q)) return "love_single";
    if (/复合|挽回|前任|分手|reconcile|ex|breakup|get back/.test(q)) return "love_reconcile";
    if (/暧昧|暗恋|他想|她想|对方|喜不喜欢|crush|situationship|feelings/.test(q)) return "love_ambiguous";
    return "love_relationship";
  }
  if (category === "career") {
    if (/学业|考试|学习|考研|考公|study|exam|school/.test(q)) return "career_study";
    if (/求职|面试|offer|找工作|interview|job search/.test(q)) return "career_job";
    return "career_growth";
  }
  if (/人际|朋友|同事|家人|关系|社交|friend|colleague|family|social/.test(q)) return "relations_overall";
  return "life_general";
}

export function detectIdolScenario(idolCategory: string, question: string): TarotScenarioKey {
  const q = question.toLowerCase();
  if (/抢票|票|中签|ticket|ticketing/.test(q)) return "idol_ticketing";
  if (/座位|位置|抽座|排|seat|position|lottery/.test(q)) return "idol_seat";
  if (/签售|签名|排位|名额|fansign|fan sign|queue/.test(q)) return "idol_fansign";
  if (/事业|回归|资源|曝光|career|comeback/.test(q) || idolCategory === "idol-draw") return "idol_career";
  if (idolCategory === "fansign") return "idol_fansign";
  if (idolCategory === "concert") return "idol_event";
  return "idol_event";
}

export function getScenarioScript(key: TarotScenarioKey, locale: "zh-TW" | "zh" | "en"): ScenarioScript {
  return locale === "en" ? SCENARIO_SCRIPTS[key].en : SCENARIO_SCRIPTS[key].zh;
}
