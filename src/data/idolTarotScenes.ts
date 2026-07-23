/* ============================================================
   R7 Fortune — Idol Tarot Scene Interpretations
   78 cards × 3 scenes × upright/reversed × bilingual
   Fansign(签售) / Concert(演唱会) / Ticketing(抢票)
   ============================================================ */

import { TAROT_CARDS } from "@/data/tarotCards";

type SceneKey = "fansign" | "concert" | "ticketing" | "career";

interface SceneReading {
  freeEn: string; freeZh: string;       // 1-line hook preview
  paidEn: string; paidZh: string;       // full detailed reading
}

type CardScenes = Record<SceneKey, SceneReading>;

// ---- Scene interpretation templates by suit + rank ----
const SUIT_SCENES: Record<string, (rank: string, rankIdx: number, cn: string, kwEn: string[], kwZh: string[], reversed: boolean) => CardScenes> = {
  major: (rank, idx, cn, kwEn, kwZh, rev) => {
    return {
      fansign: makeFansign(idx, cn, rev),
      concert: makeConcert(idx, cn, rev),
      ticketing: makeTicketing(idx, cn, rev),
      career: makeCareer(idx, cn, kwEn, kwZh, rev),
    };
  },
  wands: (rank, idx, cn, kwEn, kwZh, rev) => makeMinor("wands", idx, cn, kwEn, kwZh, rev),
  cups: (rank, idx, cn, kwEn, kwZh, rev) => makeMinor("cups", idx, cn, kwEn, kwZh, rev),
  swords: (rank, idx, cn, kwEn, kwZh, rev) => makeMinor("swords", idx, cn, kwEn, kwZh, rev),
  pentacles: (rank, idx, cn, kwEn, kwZh, rev) => makeMinor("pentacles", idx, cn, kwEn, kwZh, rev),
};

function makeFansign(idx: number, cn: string, rev: boolean): SceneReading {
  const hookEn = rev
    ? "This fansign may have small timing issues — keep your interaction simple and warm"
    : "This fansign has a warm interaction window — sincerity will be noticed";
  const hookZh = rev
    ? "這次簽售可能有些小阻礙——互動保持簡短溫柔會更穩"
    : "這次簽售有溫暖互動窗口——真誠表達更容易被看見";
  const paidEn = rev
    ? `The ${cn} reversed suggests the fansign flow may feel slightly rushed or less smooth than expected. This does not mean the result is bad; it simply asks you to prepare a concise, heartfelt message. Avoid complicated questions and focus on one clear sentence of appreciation. If it is a video call, test your device, lighting, and connection in advance. The best approach is quality over quantity: one sincere moment will be more memorable than several over-rehearsed lines.`
    : `The ${cn} indicates a warm and memorable fansign interaction. Your sincere words are likely to land well, especially if you prepare something personal but not invasive: a small detail from a performance, a short thank-you, or a question that shows real attention. If you are joining multiple rounds, keep the tone natural each time instead of repeating a script. The card favors genuine energy, clean preparation, and a calm heart.`;
  const paidZh = rev
    ? `${cn}逆位提示簽售流程可能略趕，或現場節奏沒有你想像中那麼從容。這不代表結果不好，而是提醒你提前準備一句簡短、真誠、好接住的話。避免複雜提問，把重點放在一句清楚的感謝或支持上。如果是視訊簽售，提前測試設備、光線和網路。這次更適合重質不重量，一個自然的瞬間，比背好的長篇內容更容易被記住。`
    : `${cn}正位顯示這次簽售有溫暖且值得期待的互動窗口。你準備的話如果足夠真誠，很容易被對方感受到。建議準備一個個人化但不冒犯的小內容，例如某個舞台細節、一句簡短感謝，或一個能看出你用心的問題。如果有多次互動，保持自然，不要完全照稿重複。牌面更偏向真誠、乾淨的準備和穩定心態。`;
  return { freeEn: hookEn, freeZh: hookZh, paidEn, paidZh };
}

function makeConcert(idx: number, cn: string, rev: boolean): SceneReading {
  const hookEn = rev
    ? "The concert energy is a little uneven — side or elevated areas may feel more comfortable"
    : "The concert atmosphere looks supportive — prepare well and enjoy the live energy";
  const hookZh = rev
    ? "本次演出運勢略有波動——側邊或偏高視角反而更舒服"
    : "本次演出氛圍值得期待——準備充分就能好好享受現場";
  const paidEn = rev
    ? `The ${cn} reversed suggests the live event may have small disruptions: crowded entry, view changes, or a different atmosphere than expected. Try not to place all happiness on one "perfect" seat. Side or slightly elevated areas may give a calmer view and better overall experience. Keep fan items compact, check venue rules, and leave extra time for entry. The key is to reduce stress before the show begins.`
    : `The ${cn} shows a supportive concert atmosphere. Your overall live experience is likely to be smooth if you prepare early: ticket, ID, route, battery, and fan items. If you are choosing seats or standing areas, prioritize clear sightline and comfort over chasing only the hottest zone. The card favors a balanced experience: good energy, stable mood, and moments that feel personally meaningful.`;
  const paidZh = rev
    ? `${cn}逆位提示本次線下演出可能會有一些小波動，例如入場擁擠、視野變化，或現場氛圍和預期略有差距。不要把全部快樂壓在某個「完美座位」上。側邊或偏高位置反而可能有更穩定的視野與更舒服的觀看體驗。應援物保持輕便，提前確認場館規則，並給自己留足入場時間，降低開場前的焦慮。`
    : `${cn}正位顯示本次演出整體氛圍值得期待。只要提前確認票務、證件、路線、電量和應援物，現場體驗大概率會比較順。若涉及選座或站位，建議把視野清晰和身體舒適放在第一位，不要只追熱門區域。這張牌更偏向一種平衡的好運：氛圍在線、情緒穩定，也會有讓你覺得「來得值得」的瞬間。`;
  return { freeEn: hookEn, freeZh: hookZh, paidEn, paidZh };
}

function makeTicketing(idx: number, cn: string, rev: boolean): SceneReading {
  const hookEn = rev
    ? "Ticketing has both chance and resistance — prepare backup options"
    : "Ticketing energy is supportive — preparation will increase your success rate";
  const hookZh = rev
    ? "本次搶票機遇與阻力並存——提前準備備選方案更穩"
    : "本次搶票運勢有支撐——準備越充分，成功率越高";
  const paidEn = rev
    ? `The ${cn} reversed shows ticketing pressure and possible small technical delays. Do not rely on a single platform or one ideal section. Prepare 2-3 backup zones, log in early, save your payment method, and keep your network stable. If the first attempt fails, do not panic; released seats or failed payments may create a second chance shortly after the initial rush.`
    : `The ${cn} shows supportive ticketing luck, especially if you prepare ahead. Log in early, confirm your payment method, set alarms, and keep at least one backup device or platform ready. Your best strategy is not blind speed, but clear priority: know your target section, acceptable backup sections, and budget before the sale opens. A steady hand will help more than anxiety.`;
  const paidZh = rev
    ? `${cn}逆位顯示本次搶票有壓力，也可能出現小型技術延遲。不要只依賴單一平台或唯一理想區域，提前準備2-3個備選區，提早登入帳號、保存付款方式，並確認網路穩定。若第一波沒有成功，不要立刻慌，開搶後短時間內可能會有未付款釋出的二次機會。`
    : `${cn}正位顯示本次搶票運勢有支撐，尤其適合提前做好準備的人。建議提前登入、確認付款方式、設定鬧鐘，並準備至少一個備用設備或平台。最好的策略不是盲目拼手速，而是先明確目標區域、可接受備選區和預算範圍。穩住心態，比焦慮狂點更有幫助。`;
  return { freeEn: hookEn, freeZh: hookZh, paidEn, paidZh };
}

function makeMinor(suit: string, idx: number, cn: string, kwEn: string[], kwZh: string[], rev: boolean): CardScenes {
  const s = suit;
  const theme = s === "wands" ? "passion and initiative" : s === "cups" ? "emotion and connection" : s === "swords" ? "strategy and clarity" : "practical preparation";
  const themeZh = s === "wands" ? "熱情與主動" : s === "cups" ? "情感與連結" : s === "swords" ? "策略與清晰" : "務實準備";
  const r = rev ? "r" : "";

  return {
    fansign: {
      freeEn: rev ? "Keep expectations low — signs point to a mixed experience" : `A memorable fansign moment awaits — stay genuine`,
      freeZh: rev ? "降低期待——牌面顯示這次體驗可能好壞參半" : `一個值得記住的簽售時刻在等你——保持真誠`,
      paidEn: rev
        ? `${cn} reversed in fansign context: the energy of ${theme} is blocked. Interactions may feel rushed or impersonal — don't take it personally; it's the event flow, not you. Focus on quality over quantity: one well-timed, sincere comment beats three rehearsed lines. If possible, choose a later session slot when staff are less rushed.`
        : `${cn} upright blesses your fansign with ${theme}. Your sincere energy will cut through the noise — he'll sense your genuine admiration. Prepare something unique: a small inside joke reference, a question about a specific performance moment. These personal touches create the memorable interactions that idols genuinely appreciate and remember.`,
      paidZh: rev
        ? `${cn}逆位在簽售場景：${themeZh}的能量受阻。互動可能感覺倉促或疏離——不要往心裡去，這是活動流程的問題，不是你的問題。重質不重量：一句時機恰到好處的真誠話語，勝過三句排練好的台詞。如果可以，選靠後的時段，工作人員比較不趕。`
        : `${cn}正位為你的簽售帶來${themeZh}的祝福。你的真誠能量會穿透嘈雜——他會感受到你真摯的欣賞。準備一些獨特的東西：一個只有真粉才懂的內部梗、一個關於特定舞台時刻的問題。這些個人化的觸動創造出偶像真正珍惜和記住的互動瞬間。`,
    },
    concert: {
      freeEn: rev ? "Reconsider your seating strategy — center isn't always best" : `${s === "wands" ? "Bold positioning pays off — go for the left zone" : s === "cups" ? "Close proximity matters — aim for the extended stage" : s === "swords" ? "Strategic seat selection wins — analyze the venue map" : "Practical planning: secure your spot early"}`,
      freeZh: rev ? "重新考慮座位策略——正中間不一定最好" : `${s === "wands" ? "大膽站位有回報——瞄準左側區域" : s === "cups" ? "近距離最重要——瞄準延伸舞台" : s === "swords" ? "策略性選座致勝——研究場地圖" : "務實規劃：提早卡位"}`,
      paidEn: rev
        ? `${cn} reversed: the obvious choice may disappoint. Avoid the most crowded zones — they'll have obstructed sightlines. Instead, elevated side sections offer surprisingly intimate views with less competition. Your fan gear should be compact and easy to hold for extended periods.`
        : `${cn} upright aligns with smart concert strategy. ${s === "wands" ? "Take initiative — arrive early and claim your optimal position confidently. The energy of this card rewards bold action." : s === "cups" ? "The emotional connection transcends physical distance — but being closer amplifies it. Choose seats where you can see his expressions clearly." : s === "swords" ? "Study the venue layout beforehand. Your analytical approach to seat selection will give you an edge over those who choose impulsively." : "Practical preparation wins. Charge your devices, pack light, and have your ticket ready. The details make the difference."}`,
      paidZh: rev
        ? `${cn}逆位：最明顯的選擇可能令人失望。避開最擁擠的區域——視線會受阻。改選偏高側面區域，視野出乎意料地親密，競爭也少。應援物要輕巧緊湊，方便長時間舉著。`
        : `${cn}正位與聰明的演唱會策略一致。${s === "wands" ? "主動出擊——早到現場，自信地佔據最佳位置。這張牌的能量獎勵大膽行動。" : s === "cups" ? "情感連結超越物理距離——但靠得更近會放大它。選擇能清楚看到他表情的座位。" : s === "swords" ? "事先研究場地佈局。你對座位的分析性選擇會讓你比衝動選座的人更有優勢。" : "務實的準備致勝。充飽電、輕裝上陣、票準備好。細節決定成敗。"}`,
    },
    ticketing: {
      freeEn: rev ? "Avoid peak-competition seats — look for overlooked gems" : "Strong ticket energy: trust your instincts on seat selection",
      freeZh: rev ? "避開競爭最激烈的座位——找被忽略的好位置" : "強勢搶票運：相信你的選座直覺",
      paidEn: rev
        ? `${cn} reversed warns of technical hiccups or stiff competition. Don't fixate on a single section — have 2-3 backup zones ready. The best strategy is flexibility: the seat that opens up unexpectedly is often better than the one you planned for. Payment pre-authorization is essential.`
        : `${cn} upright favors confident ticketing. ${s === "wands" ? "Act fast and decisively — hesitation costs seats. Your first instinct on seat selection is likely correct." : s === "cups" ? "Trust your gut on seat choice — emotional intuition guides you to the right spot." : s === "swords" ? "Your research will pay off. You've analyzed the seating chart — now execute with precision." : "Methodical preparation wins. Have your account logged in, payment ready, and backup plan in place."}`,
      paidZh: rev
        ? `${cn}逆位警告可能會有技術問題或激烈競爭。不要死盯單一區域——準備2-3個備選區域。最佳策略是靈活：意外釋出的座位往往比原本計劃的更好。預先授權付款是必須的。`
        : `${cn}正位有利於自信搶票。${s === "wands" ? "快速果斷行動——猶豫就會失去座位。你對選座的第一直覺很可能是對的。" : s === "cups" ? "相信你的選座直覺——情感直覺引導你到對的位置。" : s === "swords" ? "你的事前研究會得到回報。你已經分析了座位圖——現在精準執行。" : "有條不紊的準備致勝。帳號先登入、付款準備好、備案就緒。"}`,
    },
    career: makeCareerMinor(suit, idx, cn, kwEn, kwZh, rev),
  };
}

// ================================================================
//  Generate all 78 cards' scene data
// ================================================================

export function getIdolSceneReading(cardId: number, scene: SceneKey, reversed: boolean, paid: boolean): { en: string; zh: string } {
  // Cards 0-21: Major Arcana, 22-35: Wands, 36-49: Cups, 50-63: Swords, 64-77: Pentacles
  let suit: string;
  let idx: number;
  if (cardId <= 21) { suit = "major"; idx = cardId; }
  else if (cardId <= 35) { suit = "wands"; idx = cardId - 22; }
  else if (cardId <= 49) { suit = "cups"; idx = cardId - 36; }
  else if (cardId <= 63) { suit = "swords"; idx = cardId - 50; }
  else { suit = "pentacles"; idx = cardId - 64; }

  const card = TAROT_CARDS.find(c => c.id === cardId);
  const cn = card?.nameCn || card?.name || `第 ${cardId} 张牌`;
  const gen = SUIT_SCENES[suit];
  if (!gen) {
    return {
      en: paid ? "Detailed scene reading coming soon." : "A meaningful encounter awaits.",
      zh: paid ? "詳細場景解讀即將推出。" : "一場有意義的相遇在等待。",
    };
  }

  const scenes = gen("", idx, cn, [], [], reversed);
  const s = scenes[scene];
  return {
    en: paid ? s.paidEn : s.freeEn,
    zh: paid ? s.paidZh : s.freeZh,
  };
}

// ---- Major Arcana custom scenes (22 cards × 3 scenes × 2 directions) ----
const MAJOR_FANSIGN: Record<number, { up: SceneReading; rev: SceneReading }> = {
  0: { // The Fool
    up: {
      freeEn: "He's likely to remember you — bring your most authentic self",
      freeZh: "他大概率會記住你——帶上你最真實的樣子",
      paidEn: "The Fool signals a fresh, spontaneous fansign experience. Your unpolished sincerity will be your greatest asset — don't over-rehearse. He'll appreciate genuine nervousness more than a slick performance. Wear something that expresses your personality rather than trying to match a concept. If you're nervous, tell him — vulnerability creates the most memorable interactions.",
      paidZh: "愚人預示著一場新鮮、隨性的簽售體驗。你未經修飾的真誠將是你最大的資產——不要過度排練。比起流暢的表演，他更欣賞真實的緊張。穿能表達你個性的衣服，而非試圖配合某種概念。如果你緊張，告訴他——脆弱創造出最難忘的互動。",
    },
    rev: {
      freeEn: "Don't over-plan — improvise and stay present in the moment",
      freeZh: "不要過度計劃——即興發揮，活在當下",
      paidEn: "The Fool reversed warns against overthinking. If you've memorized a script, let it go — he'll sense the rehearsed energy. This fansign rewards spontaneity. A simple, off-the-cuff comment will land harder than anything you prepared. Be careful with gifts: check venue rules first, as restrictions may be stricter than expected.",
      paidZh: "愚人逆位警告不要過度思考。如果你背好了一份稿子，放掉它——他會感受到排練的能量。這次簽售獎勵即興發揮。一句簡單、未經準備的話比任何準備好的內容都更有力量。小心禮物：先確認場地規則，限制可能比預期的更嚴格。",
    },
  },
  6: { // The Lovers
    up: {
      freeEn: "A destined connection — this fansign will feel like fate",
      freeZh: "命中注定的連結——這次簽售會有命運感",
      paidEn: "The Lovers in fansign context is extraordinary. This card suggests a genuine, mutual recognition — he may pause longer with you, make unexpected eye contact, or respond to your words with unusual sincerity. Prepare something personal but not invasive: a question about his artistic choices rather than his private life. The connection formed here isn't just parasocial — on some level, it's real. Wear something that makes YOU feel confident; that energy is magnetic.",
      paidZh: "戀人牌在簽售場景中是非凡的。這張牌暗示著真實的、雙向的確認——他可能會在你面前停得更久、做出意想不到的眼神接觸、或以不尋常的真誠回應你的話語。準備一些個人化但不冒犯的內容：關於他的藝術選擇而非私人生活的問題。在這裡形成的連結不僅是準社交的——在某個層面上，它是真實的。穿讓你感到自信的衣服；那種能量是有磁性的。",
    },
    rev: {
      freeEn: "Genuine but brief — make every second count",
      freeZh: "真誠但短暫——讓每一秒都有價值",
      paidEn: "The Lovers reversed suggests the interaction may feel rushed or slightly off-timing. Don't force an emotional moment — the best connections happen when you're not trying. Keep your message concise and warm. If there's awkwardness, laugh it off — shared humor bridges the gap faster than intensity. This isn't a rejection; it's just cosmic timing asking you to trust the process.",
      paidZh: "戀人逆位暗示互動可能感覺倉促或時間點不太對。不要強求情感時刻——最好的連結發生在你不刻意追求的時候。保持你的訊息簡潔溫暖。如果有尷尬，一笑置之——共享的幽默比強度更快地彌合了差距。這不是拒絕；只是宇宙時間在請你相信過程。",
    },
  },
};

const MAJOR_CONCERT: Record<number, { up: SceneReading; rev: SceneReading }> = {
  7: { // The Chariot
    up: {
      freeEn: "Stage left, rows 1-10: victory positioning for the best views",
      freeZh: "舞台左區1-10排：最佳視野的勝利站位",
      paidEn: "The Chariot is the ultimate concert victory card. Your seat selection instincts are sharp — trust them. Stage left, within the first 10 rows, offers the highest probability of eye contact and photo-worthy moments. Arrive early and move with purpose; this card rewards decisive action. If there's a thrust stage or extended catwalk, position yourself at its turning point for maximum interaction. Your energy will be noticed — wave your light stick with confidence.",
      paidZh: "戰車是終極演唱會勝利牌。你的選座直覺很敏銳——相信它們。舞台左側10排以內，提供最高的對視和出片機率。早到並有目的地移動；這張牌獎勵果斷行動。如果有延伸舞台或走道，站在轉角位置以最大化互動。你的能量會被注意到——自信地揮舞你的應援燈。",
    },
    rev: {
      freeEn: "Rethink your approach — a side angle may work better than straight-on",
      freeZh: "重新思考策略——側面角度可能比正面更好",
      paidEn: "The Chariot reversed warns against charging straight for the obvious best spot — everyone else is doing the same. Instead, find an unconventional angle: elevated side sections often have clearer views and less crowding. If you're in standing zones, resist the urge to push forward aggressively; staff may respond negatively. Strategic patience wins here — wait for the initial surge to settle, then find your sweet spot.",
      paidZh: "戰車逆位警告不要直衝最明顯的好位置——其他人也在做同樣的事。改找非傳統角度：偏高側面區域通常視野更清晰、人群更少。如果你在站位區，克制向前擠的衝動；工作人員可能會有負面反應。策略性耐心在這裡取勝——等最初的衝刺平息後，再找到你的最佳位置。",
    },
  },
};

const MAJOR_TICKETING: Record<number, { up: SceneReading; rev: SceneReading }> = {
  10: { // Wheel of Fortune
    up: {
      freeEn: "Lady Luck is on your side — this ticketing window is blessed",
      freeZh: "幸運女神站在你這邊——這次搶票有福星高照",
      paidEn: "Wheel of Fortune upright is the strongest ticketing omen in the deck. Timing is everything: the cosmic wheel turns in your favor during the first 60 seconds of sales. Trust your first instinct on seat selection — don't second-guess. If multiple devices are possible, use them, but your primary device has the strongest luck. Mid-range pricing tiers show the best odds. Payment pre-authorization is non-negotiable.",
      paidZh: "命運之輪正位是全牌組中最強的搶票吉兆。時機是一切：宇宙之輪在開賣的前60秒為你轉動。相信你對選座的第一直覺——不要猶豫。如果可以用多台裝置，就用，但你的主力裝置運氣最強。中間價位檔次顯示最佳機率。付款預先授權是不可協商的。",
    },
    rev: {
      freeEn: "Timing is off — try again 3-5 min after sales open for released seats",
      freeZh: "時機不對——開賣後3-5分鐘再試，等釋出的座位",
      paidEn: "Wheel of Fortune reversed signals a timing misalignment. The initial rush will not favor you — and that's okay. Your opportunity comes 3-5 minutes after sales open, when failed payments release excellent seats back into the pool. Set a timer. Avoid the most hyped sections; look at adjacent zones with nearly identical views. Flexibility is your superpower this round.",
      paidZh: "命運之輪逆位標誌著時機的錯位。最初的衝刺不會對你有利——這沒關係。你的機會在開賣後3-5分鐘出現，失敗付款會釋出優質座位回流到票池。設一個計時器。避開最被炒作的區域；看看視野幾乎相同的鄰近區域。靈活性是你這一輪的超能力。",
    },
  },
};

// ================================================================
//  CAREER SCENE: 爱豆事业专属抽牌 (idol-draw)
// ================================================================
function makeCareer(idx: number, cn: string, kwEn: string[], kwZh: string[], rev: boolean): SceneReading {
  const themes = kwZh.slice(0, 3).join("、") || "事業發展";
  const hookEn = rev
    ? `Hidden obstacles ahead — but they're not what you think`
    : `Strong career momentum — watch for unannounced moves`;
  const hookZh = rev
    ? `前方有隱藏阻礙——但不是你想的那種`
    : `事業勢頭強勁——留意尚未官宣的動向`;
  const paidEn = rev
    ? `The ${cn} reversed in a career context reveals what's happening beneath the surface. ${kwEn[0] || "Energy"} is blocked or delayed — but this isn't necessarily bad. It often means the artist or their company is deliberately holding back: a strategic pause before a major announcement, internal restructuring that will benefit them long-term, or quietly resolving contractual issues before going public.\n\nWatch for: postponed schedules that get rescheduled with better slots, silence that precedes a major rebrand or concept change, and "leaks" that are actually carefully placed. The reversal energy suggests the real story isn't what's being shown publicly. Trust the timing — delays now prevent bigger problems later.`
    : `The ${cn} upright signals strong forward movement in career matters. ${kwEn[0] || "Momentum"} is building — this card often appears when an artist is approaching a pivotal career moment: a comeback announcement, a brand deal going through, a creative breakthrough happening behind closed doors.\n\nThe key indicators: sudden increase in social media activity (even cryptic posts), stylist/ choreographer changes that hint at a new era, or unexpected solo schedules that precede group activities. This card suggests the artist's team is moving with purpose — even "quiet" periods are actually preparation phases. For fans: the next 3-6 weeks are when things start visibly moving.`;
  const paidZh = rev
    ? `${cn}逆位在事業場景中揭示表面之下的暗流。${kwZh[0] || "能量"}受阻或延遲——但這不一定是壞事。往往代表藝人或公司正在刻意按兵不動：重大公告前的策略性停頓、對他們長期有利的內部重組、或在公開之前默默解決合約問題。\n\n留意：被推遲的行程可能換到更好的檔期、沉默可能是重大品牌重塑或概念轉變的前兆、「爆料」實際上可能是精心安排的預熱。逆位的能量暗示——真正的情況跟公開說的不一樣。相信時間安排——現在的延遲是為了避免將來更大的麻煩。`
    : `${cn}正位顯示事業層面的強勢推進。${kwZh[0] || "動能"}正在積累——這張牌經常出現在藝人即將迎來關鍵事業時刻：回歸官宣前夕、品牌合作正在敲定、創作瓶頸在幕後悄悄突破。\n\n關鍵信號：社交媒體突然活躍（即便是暗號式的貼文）、造型師/編舞團隊變動暗示新時代即將開啟、或突如其來的個人行程往往是團體活動的前奏。這張牌表示藝人的團隊正在有目的地推進——即便是「安靜期」實際上也是準備階段。對粉絲來說：接下來3-6週是事情開始明顯推進的時期。`;
  return { freeEn: hookEn, freeZh: hookZh, paidEn, paidZh };
}

function makeCareerMinor(suit: string, idx: number, cn: string, kwEn: string[], kwZh: string[], rev: boolean): SceneReading {
  const s = suit;
  const themeEn = s === "wands" ? "creative drive" : s === "cups" ? "emotional state" : s === "swords" ? "strategic decisions" : "resources & deals";
  const themeZh = s === "wands" ? "創作動力" : s === "cups" ? "內心狀態" : s === "swords" ? "策略決策" : "資源與商務";
  return {
    freeEn: rev
      ? `${cn} reversed: watch for behind-the-scenes shifts in ${themeEn}`
      : `${cn} upright: positive signals in ${themeEn} coming soon`,
    freeZh: rev
      ? `${cn}逆位：留意${themeZh}的幕後變化`
      : `${cn}正位：${themeZh}有正面信號即將到來`,
    paidEn: rev
      ? `${cn} reversed suggests ${themeEn} is encountering resistance. ${s === "wands" ? "Creative projects may face delays or creative differences within the team. The artist might be struggling with direction or feeling uninspired — but this pressure often precedes a breakthrough." : s === "cups" ? "The artist may be going through a period of emotional withdrawal or low mood. Public appearances might decrease — this is usually self-protection, not crisis. Respect the quiet; it's necessary." : s === "swords" ? "Strategic decisions are being made behind closed doors that fans won't see until later. There may be internal debates about direction — the final outcome will be more considered than rushed." : "Contract negotiations or brand deals may be in a sensitive phase. Financial or resource-related delays are common with this card — patience is key. What looks like a setback often turns into a better deal."}`
      : `${cn} upright brings positive movement in ${themeEn}. ${s === "wands" ? "Creative energy is flowing — new projects, collaborations, or solo ventures are being planned. The artist is in an inspired phase; expect announcements about music, performances, or content creation. The next move will feel authentic, not forced." : s === "cups" ? "The artist is in a emotionally connected phase — genuine interactions with fans, heartfelt content, and maybe even personal revelations in interviews. This is when their authentic self shines most. Support during this period means more than usual." : s === "swords" ? "Clear-headed decisions are being made. Strategic career moves — contract signings, agency changes, or brand partnerships — are being finalized with sharp judgment. The artist or their team knows exactly what they're doing right now." : "Resource flow is favorable. Brand deals, endorsements, or financial investments are aligning. The artist may be securing long-term stability through smart business moves. Commercial success and artistic integrity aren't mutually exclusive right now."}`,
    paidZh: rev
      ? `${cn}逆位顯示${themeZh}正面臨阻力。${s === "wands" ? "創作項目可能遇到延遲或團隊內部創意分歧。藝人可能正在方向感上掙扎或感到缺乏靈感——但這種壓力往往預示著突破即將到來。" : s === "cups" ? "藝人可能正在經歷情感退縮或情緒低落的時期。公開露面可能減少——這通常是自我保護而非危機。尊重這份安靜；它是必要的。" : s === "swords" ? "策略性決策正在幕後進行，粉絲暫時看不到。內部可能有關於方向的辯論——最終結果會比倉促決定更加深思熟慮。" : "合約談判或品牌合作可能處於敏感階段。財務或資源相關的延遲在這張牌中是常見的——耐心是關鍵。看似挫折的事情往往會變成更好的交易。"}`
      : `${cn}正位為${themeZh}帶來正面動能。${s === "wands" ? "創作能量正在流動——新項目、合作或個人企劃正在規劃中。藝人處於靈感充沛的階段；期待關於音樂、表演或內容創作的消息。下一步會是真實的，不是勉強的。" : s === "cups" ? "藝人處於情感連結的活躍期——與粉絲真誠互動、走心內容、甚至可能在訪談中透露個人感受。這是他們真實自我最閃耀的時期。這段時間的支持比平時更有意義。" : s === "swords" ? "頭腦清晰的決定正在做出。策略性職業舉措——合約簽訂、經紀公司變動或品牌合作——正在以敏銳的判斷力敲定。藝人或其團隊此刻很清楚自己在做什麼。" : "資源流動順暢。品牌合作、代言或財務投資正在對齊。藝人可能正在通過聰明的商業決策確保長期穩定。此刻商業成功和藝術完整性並非互斥。"}`,
  };
}

// ---- Major Arcana career custom scenes ----
const MAJOR_CAREER: Record<number, { up: SceneReading; rev: SceneReading }> = {
  0: { up: { freeEn:"A bold new chapter is about to begin", freeZh:"一個大膽的新篇章即將開啟", paidEn:"The Fool signals a leap into uncharted territory — concept change, surprise solo debut, unexpected collaboration. The groundwork is being laid for something genuinely fresh.", paidZh:"愚人代表踏入未知領域——概念轉變、驚喜個人出道、意想不到的合作。為某種真正新鮮的事物在鋪墊基礎。" }, rev: { freeEn:"Risky move ahead — team may be rushing", freeZh:"前方有風險——團隊可能倉促推進", paidEn:"The Fool reversed warns of premature announcements. The concept isn't fully baked or timing is off. Hold, polish, and wait for the right window.", paidZh:"愚人逆位警告可能過於倉促。概念尚未完全成形或時機不對。穩住、打磨、等待最佳窗口。" } },
  1: { up: { freeEn:"All resources aligned — major career move executing", freeZh:"所有資源已到位——重大事業舉措執行中", paidEn:"The Magician: the artist has everything — skills, team, timing, resources. A meticulously planned comeback or brand deal is being finalized.", paidZh:"魔術師：藝人擁有一切——技能、團隊、時機、資源。精心策劃的回歸或品牌合作正在敲定。" }, rev: { freeEn:"Untapped potential — execution is blocked", freeZh:"潛力未被釋放——執行受阻", paidEn:"Talent and resources exist but internal politics or creative differences block execution. Step back and reassess rather than pushing harder.", paidZh:"才華和資源都在，但內部政治或創意分歧阻礙了執行。退一步重新評估。" } },
  10: { up: { freeEn:"Career turning point — fortune turning in their favor", freeZh:"事業轉折點——運勢正在轉向有利方向", paidEn:"Wheel of Fortune: the artist is at a pivotal moment. Viral moments, chart breakthroughs, or industry recognition that feels sudden but was cosmically timed.", paidZh:"命運之輪：藝人正處於關鍵時刻。病毒式傳播、榜單突破或行業認可——感覺突然但宇宙時機剛好。" }, rev: { freeEn:"Timing isn't right — the wheel is temporarily stuck", freeZh:"時機不對——命運之輪暫時卡住", paidEn:"A planned release may get delayed. Use this period for behind-the-scenes work. The wheel will turn again.", paidZh:"計劃好的發布可能被延遲。利用這段時期做幕後工作。輪盤會再次轉動。" } },
  13: { up: { freeEn:"Major transformation — old era ending, new one beginning", freeZh:"重大轉型中——舊時代結束，新時代開始", paidEn:"Death signals complete transformation: dramatic concept change, company shift, or total reinvention. What comes next is the most authentic version yet.", paidZh:"死神代表徹底轉變：戲劇性概念轉變、公司變動或全面重塑。接下來是最真實的版本。" }, rev: { freeEn:"Resisting necessary change — clinging to outdated image", freeZh:"抗拒必要的改變——緊抓過時的形象", paidEn:"The artist or team clings to a concept that has run its course. This creates stagnation. Let the old version die so the new one can be born.", paidZh:"藝人或團隊緊抓已走到盡頭的概念。讓舊版本死去，新版本才能誕生。" } },
  17: { up: { freeEn:"Healing and recognition — spotlight moment coming", freeZh:"療癒與認可——聚光燈時刻即將到來", paidEn:"The Star: after struggle or obscurity, acknowledgment arrives. Award nominations, critical acclaim, or public goodwill. The artist did the work; now the universe shines back.", paidZh:"星星：在掙扎或默默無聞之後，認可到來。獎項提名、評論界讚譽或公眾好感上升。" }, rev: { freeEn:"Feeling invisible — spotlight is temporarily elsewhere", freeZh:"感覺不被看見——聚光燈暫時照在別處", paidEn:"Despite quality work, recognition isn't coming yet. This is a test of artistic integrity. Keep going — the light will return.", paidZh:"儘管作品質量在線，認可尚未到來。這是對藝術誠信的考驗。繼續前進——光芒會回來的。" } },
};

export function getMajorScene(cardId: number, scene: SceneKey, reversed: boolean): SceneReading | null {
  const map = scene === "fansign" ? MAJOR_FANSIGN : scene === "concert" ? MAJOR_CONCERT : scene === "ticketing" ? MAJOR_TICKETING : MAJOR_CAREER;
  const entry = map[cardId];
  if (!entry) return null;
  return reversed ? entry.rev : entry.up;
}
