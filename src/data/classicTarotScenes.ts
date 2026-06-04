/* ============================================================
   R7 Fortune — Classic Tarot 6-Scene Interpretation Library
   姻缘/事业/财运/健康/关系/运势 × 78 cards × upright/reversed
   Free hook + Paid detailed · Bilingual zh-TW + EN
   ============================================================ */

export type ClassicScene = "love" | "career" | "wealth" | "health" | "relations" | "fortune";

const SCENE_ZH: Record<ClassicScene, string> = {
  love: "姻緣", career: "工作事業", wealth: "財運", health: "健康", relations: "關係", fortune: "運勢",
};

const SCENE_EN: Record<ClassicScene, string> = {
  love: "Love", career: "Career", wealth: "Wealth", health: "Health", relations: "Relations", fortune: "Fortune",
};

// ---- Scene-specific hooks & paid templates ----
function loveReading(kwZh: string[], kwEn: string[], rev: boolean): { freeEn:string; freeZh:string; paidEn:string; paidZh:string } {
  const keyZh = kwZh.join("、");
  const keyEn = kwEn.join(", ");
  if (rev) {
    return {
      freeEn: "The romantic clarity you're seeking hasn't arrived yet — there's a hidden factor you're overlooking",
      freeZh: "你等的那个明确答案还没到——当前有一个你没注意到的隐性变量在影响走向",
      paidEn: `Reversed energy in love: ${keyEn} is blocked or delayed. The person or situation you're focused on may not be showing their full truth right now. This isn't rejection — it's the universe asking you to pause and observe rather than push. If you're in a situationship, give it 2-3 weeks before initiating any "what are we" conversation. If single, avoid dating apps this week — the energy is off. Instead, reflect on: are you truly ready for what you're asking for? The hidden factor is often your own unprocessed patterns.`,
      paidZh: `逆位在感情中代表${keyZh}的能量受阻或延遲。你關注的那個人或狀況，此刻可能還沒有展現出全部真相。這不是拒絕——是宇宙請你先觀察、不要硬推。如果你正處於曖昧期，未來2-3週不要主動提出「我們什麼關係」的對話。如果單身，這週先別刷交友軟體——能量不對。反過來問自己：你真的準備好迎接你所祈求的關係了嗎？那個隱性變量，往往是你自己還沒處理好的舊模式。`,
    };
  }
  return {
    freeEn: "This connection has real potential — a key conversation is approaching within the next month",
    freeZh: "這段關係有實質進展空間——接下來一個月內會有一次關鍵對話推動走向",
    paidEn: `Upright energy brings ${keyEn} into your love life. If you're in a situationship, expect a shift within 2-4 weeks: the other person will initiate a more serious conversation or make a gesture that clarifies their intentions. For singles, social events (especially those involving mutual friends or creative spaces) are your highest-probability meeting grounds. Wear something that makes you feel confident — your energy is magnetic right now. Key tip: suggest dates at cozy, plant-filled cafes; they create the right atmosphere for genuine connection.`,
    paidZh: `正位能量將${keyZh}帶入你的感情生活。如果你正處於曖昧期，2-4週內會有一個轉折：對方會主動發起更認真的對話，或用一個明確的舉動來表態。單身者的話，社交場合（尤其是朋友聚會或創意空間）是最有可能認識新對象的場合。穿讓你感到自信的衣服——此刻你的能量自帶吸引力。關鍵建議：約會地點選在有綠植的溫馨咖啡廳，那種氛圍最容易推進關係。`,
  };
}

function careerReading(kwZh: string[], kwEn: string[], rev: boolean): { freeEn:string; freeZh:string; paidEn:string; paidZh:string } {
  if (rev) {
  const keyZh = kwZh.join("、");
  const keyEn = kwEn.join(", ");
    return {
      freeEn: "That bottleneck you're feeling — it breaks by month-end, but not the way you expect",
      freeZh: "你正在卡住的那件事——月底前會破局，但不是以你預期的方式",
      paidEn: `Reversed ${kwEn.join("/")} in career signals a hidden variable affecting your project. A colleague or stakeholder may have concerns they haven't voiced — watch for subtle cues in meetings. The blockage isn't permanent; it clears within 2-3 weeks. Until then: document everything, avoid office gossip, and if you're submitting proposals, lead with data and concrete results rather than promises. Cross-department collaboration will be your unexpected breakthrough — reach out to someone you don't usually work with.`,
      paidZh: `逆位的${keyZh}在事業中代表有一個隱性變量在影響你的項目。某位同事或相關方可能有沒說出口的疑慮——留意會議中的細微信號。這個瓶頸不是永久的，2-3週內會鬆動。在此之前：做好文件記錄、避開辦公室八卦、提交方案時用數據和具體成果開頭而非承諾。跨部門合作會是你意想不到的突破口——主動聯繫一個你平時不怎麼合作的同事。`,
    };
  }
  return {
    freeEn: "Career momentum is building — a window opens within weeks, be ready to act",
    freeZh: "事業勢頭正在積累——幾週內會有一個窗口期，準備好出手",
    paidEn: `Upright ${kwEn.join("/")} brings career momentum. If you've been waiting for a sign to push forward on a project or promotion request — this is it. The next 2-4 weeks are favorable for: submitting proposals, asking for a raise (especially on a Wednesday or Thursday), or pitching a new idea to leadership. A mentor or senior colleague is watching your work more closely than you realize — they may become your advocate. Key move: in your next presentation, highlight one specific data point that proves your impact.`,
    paidZh: `正位的${keyZh}帶來事業動能。如果你一直在等一個信號來推進項目或提晉升——這就是了。接下來2-4週適合：提交方案、談加薪（週三或週四最佳）、或向上級提出新想法。有一位前輩或上級比你想像中更關注你的工作——他們可能成為你的貴人。關鍵一招：下次匯報時，用一個具體的數據來證明你的貢獻，不要只講過程。`,
  };
}

function wealthReading(kwZh: string[], kwEn: string[], rev: boolean): { freeEn:string; freeZh:string; paidEn:string; paidZh:string } {
  if (rev) {
  const keyZh = kwZh.join("、");
  const keyEn = kwEn.join(", ");
    return {
      freeEn: "Hold off on big purchases — an unexpected expense may be around the corner",
      freeZh: "先別做大額消費——近期有一筆意外支出需要注意",
      paidEn: `Reversed ${kwEn.join("/")} in finances warns of a leak you haven't noticed. Check your subscriptions — there's likely a recurring charge you forgot about. Avoid lending money this month; what goes out may not come back quickly. If you're expecting a payment (freelance invoice, refund, etc.), it may be delayed by 1-2 weeks. The silver lining: this card often signals that the "loss" actually prevents a bigger mistake — like overpaying for something you don't need.`,
      paidZh: `逆位的${keyZh}在財務上警告有一個你沒注意到的資金漏洞。檢查你的訂閱項目——很可能有一個你忘記的自動扣款。這個月不要借錢給別人，出去的錢短期內回不來。如果你在等一筆款項（自由職業發票、退款等），可能會延遲1-2週。好的一面是：這張牌往往代表這次「損失」其實避免了更大的錯誤——比如花大錢買了你不需要的東西。`,
    };
  }
  return {
    freeEn: "Unexpected money is heading your way this week — a pleasant surprise",
    freeZh: "本週會有一筆意外小額進帳——來源可能是你沒想到的地方",
    paidEn: `Upright ${kwEn.join("/")} signals positive financial flow. The incoming money is likely from: a forgotten refund, a friend repaying an old debt, or a small freelance/side gig payout. Don't spend it immediately — this card advises saving it as a "seed fund." If you're considering an investment, stick to low-risk options this month. The best financial move right now is organizing: review your last 3 months of spending and cancel anything you haven't used in 30 days.`,
    paidZh: `正位的${keyZh}代表正面財流。即將進帳的錢很可能來自：一筆你忘記的退款、朋友還的舊債、或小額兼職/副業的收入。不要立刻花掉——這張牌建議把它存起來當「種子基金」。如果你在考慮投資，這個月先選低風險的。此刻最好的理財動作是整理：回顧過去三個月的支出，取消任何30天內沒用過的訂閱。`,
  };
}

function healthReading(kwZh: string[], kwEn: string[], rev: boolean): { freeEn:string; freeZh:string; paidEn:string; paidZh:string } {
  if (rev) {
  const keyZh = kwZh.join("、");
  const keyEn = kwEn.join(", ");
    return {
      freeEn: "Your body is sending a signal you've been ignoring — listen before it gets louder",
      freeZh: "你的身體一直在發出信號——在它變嚴重之前，停下來聽一下",
      paidEn: `Reversed ${kwEn.join("/")} points to accumulated stress manifesting physically. Common signs: shoulder/neck tension (from prolonged screen time), sleep disruption (racing thoughts at 2am), or digestive issues (stress eating or skipping meals). This isn't alarmist — it's preventive. Take 2-3 days to reset: 10-minute stretching in the morning, no screens 30 minutes before bed, and one proper sit-down meal per day. If you've been postponing a check-up, book it this week.`,
      paidZh: `逆位的${keyZh}指向積累的壓力開始在身體上表現出來。常見信號：肩頸僵硬（長期低頭看手機/電腦）、睡眠中斷（凌晨兩點腦子停不下來）、或消化問題（壓力性暴食或跳過正餐）。這不是危言聳聽——是預防。花2-3天重置一下：早上10分鐘拉伸、睡前30分鐘不看螢幕、每天至少一頓認真坐下來吃的飯。如果你一直拖著沒去複查或體檢，這週就預約。`,
    };
  }
  return {
    freeEn: "Your energy is returning — this week is perfect for restarting healthy habits",
    freeZh: "你的精力正在回升——這週是重啟健康習慣的好時機",
    paidEn: `Upright ${kwEn.join("/")} indicates your body and mind are in a receptive state for positive change. If you've been wanting to start exercising, begin with 15-minute walks — consistency over intensity. Sleep quality improves this week if you maintain a fixed bedtime. The card also suggests seasonal allergies or minor issues clearing up. Mental health note: journaling for just 5 minutes before bed can significantly reduce anxiety. The body is resilient — give it a little support and it responds quickly.`,
    paidZh: `正位的${keyZh}代表你的身心正處於願意接受正面改變的狀態。如果你一直想開始運動，從每天15分鐘的散步開始——持續比強度更重要。這週如果固定就寢時間，睡眠品質會明顯改善。這張牌也暗示季節性的小毛病（過敏、小感冒）正在好轉。心理健康建議：睡前花5分鐘寫下當天的三件好事，能顯著降低焦慮感。身體是有復原力的——給它一點支持，它會很快回應你。`,
  };
}

function relationsReading(kwZh: string[], kwEn: string[], rev: boolean): { freeEn:string; freeZh:string; paidEn:string; paidZh:string } {
  if (rev) {
  const keyZh = kwZh.join("、");
  const keyEn = kwEn.join(", ");
    return {
      freeEn: "Tension with someone close could ease this week — but you need to make the first move",
      freeZh: "和身邊某個人的緊張關係這週有機會緩和——但需要你主動遞出橄欖枝",
      paidEn: `Reversed ${kwEn.join("/")} in relationships points to an unspoken friction with a family member, close friend, or trusted colleague. The issue isn't new — it's been simmering. The good news: this week offers a natural opening to defuse it. Don't bring up the old argument. Instead, make a small, warm gesture: offer tea, share a snack, or simply sit in the same room without demanding conversation. The silence, when not hostile, is healing. If it's a colleague, a simple "I appreciate your work on [specific thing]" can reset the dynamic.`,
      paidZh: `逆位的${keyZh}在人際關係中指向你和某位家人、好友或信任的同事之間，存有未曾說開的摩擦。問題不是新的——是一直在醞釀。好消息是：這週會有一個自然的契機來化解。不要翻舊帳。改成一個小動作：遞一杯熱飲、分享一個小零食、或只是靜靜待在同一個空間不要求對話。當沉默不是敵意的時候，它是有療癒力的。如果是同事，一句簡單的「我很欣賞你在某某項目上的付出」就能重置整個互動氛圍。`,
    };
  }
  return {
    freeEn: "A meaningful conversation is coming — it'll bring you closer to someone important",
    freeZh: "一次有意義的對話即將到來——會讓你跟某個重要的人關係更近一步",
    paidEn: `Upright ${kwEn.join("/")} blesses your closest relationships. This is a good week for: calling the family member you've been meaning to check on, reaching out to an old friend, or having that honest but kind conversation with your partner or roommate. The energy supports reconciliation and deepened understanding. If you're navigating a difficult dynamic at work, a private coffee chat (not a formal meeting) will work better than any email. Listen more than you speak — the other person needs to feel heard first.`,
    paidZh: `正位的${keyZh}為你的重要關係帶來祝福。這週適合：打給那個你一直想問候但總是沒空聯繫的家人、主動約好久不見的朋友、或跟伴侶/室友來一場誠實但溫柔的對話。這股能量支持和解與理解的深化。如果你在職場上正在處理一段棘手的關係，一次私下喝咖啡的非正式交流，效果遠勝任何郵件。多聽少說——對方需要先感受到被傾聽。`,
  };
}

function fortuneReading(kwZh: string[], kwEn: string[], rev: boolean): { freeEn:string; freeZh:string; paidEn:string; paidZh:string } {
  if (rev) {
  const keyZh = kwZh.join("、");
  const keyEn = kwEn.join(", ");
    return {
      freeEn: "The next 3 days are hazy — hold off on major decisions until clarity returns",
      freeZh: "未來三天運勢迷濛——重大決定先緩一緩，等迷霧散去再說",
      paidEn: `Reversed ${kwEn.join("/")} indicates a temporary dip in overall fortune. This isn't bad luck — it's a natural pause in the cycle. The next 72 hours are not ideal for: signing contracts, making large purchases, or initiating difficult conversations. Instead, focus on: completing lingering tasks (the satisfaction of clearing your to-do list will boost your energy), organizing your space (physical clutter = mental fog), and getting extra rest. Fortune turns by week's end.`,
      paidZh: `逆位的${keyZh}代表整體運勢暫時回落。這不是壞運氣——是週期中的自然停頓。未來72小時不適合：簽合約、大額消費、或發起困難對話。改為專注：清掉積壓已久的小事（清空待辦清單的滿足感會大幅提升你的能量）、整理空間（環境亂=心煩）、以及補足睡眠。週末運勢會回升。`,
    };
  }
  return {
    freeEn: "The next 3 days are your power window — tackle what you've been putting off",
    freeZh: "接下來三天是你的幸運窗口——優先處理那件你拖了很久的事",
    paidEn: `Upright ${kwEn.join("/")} opens a brief but potent window of good fortune. In the next 3 days, tasks you've been procrastinating on will feel easier and have higher success rates. This is especially true for: making decisions you've been avoiding, sending important messages, or starting something new. The universe is giving you a tailwind — use it. The energy peaks midweek, so front-load your important tasks. Trust your gut: if something feels like a "yes," act on it immediately.`,
    paidZh: `正位的${keyZh}打開了一個短暫但強力的好運窗口。接下來三天，你一直在拖延的事情會突然變得容易處理、而且成功率比平時高出許多。尤其適合：做你一直逃避的決定、發出重要訊息、或啟動新計劃。宇宙在給你順風——善用它。能量在週中達到峰值，所以把重要任務排在前半週。相信直覺：如果某件事讓你心裡冒出「就是現在」，立刻行動。`,
  };
}

// ---- Main generator ----
export function getClassicSceneReading(
  cardName: string, cardNameCn: string,
  keywordsZh: string[], keywordsEn: string[],
  scene: ClassicScene, reversed: boolean, paid: boolean
): { en: string; zh: string } {
  const fn = scene === "love" ? loveReading : scene === "career" ? careerReading
    : scene === "wealth" ? wealthReading : scene === "health" ? healthReading
    : scene === "relations" ? relationsReading : fortuneReading;
  const result = fn(keywordsZh, keywordsEn, reversed);
  return {
    en: paid ? result.paidEn : result.freeEn,
    zh: paid ? result.paidZh : result.freeZh,
  };
}

export { SCENE_ZH, SCENE_EN };
