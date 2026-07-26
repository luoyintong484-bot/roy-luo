/* ============================================================
   R7 Wellness — Psychology-Framed Content
   All text: self-discovery / personality insight language.
   ZERO divination, fortune-telling, or destiny vocabulary.
   zh-TW + en bilingual. Reserved "ar" keys for Arabic expansion.
   ============================================================ */

export type WellnessLocale = "zh-TW" | "en" | "ar";

// ---- Brand ----
export const WELLNESS_BRAND: Record<string, Record<string, string>> = {
  "zh-TW": {
    name: "R7 Wellness",
    tagline: "認識自己",
    subtitle: "理解塑造你的人生模式",
    desc: "古老智慧體系，轉化為現代自我探索工具 —— 匿名、安全、無評判",
  },
  en: {
    name: "R7 Wellness",
    tagline: "Understand Yourself",
    subtitle: "Understand the patterns that shape your life",
    desc: "Ancient wisdom systems, reframed as modern tools for self-discovery — anonymous, safe, judgment-free",
  },
};

// ---- Hero CTAs ----
export const WELLNESS_CTA: Record<string, Array<{ key: string; label: string; path: string; desc: string }>> = {
  "zh-TW": [
    { key: "cards", label: "原型自我探索", path: "/wellness/cards", desc: "透過心理原型卡牌，即時覺察你的內在狀態" },
    { key: "blueprint", label: "人格模式藍圖", path: "/wellness/self-discovery", desc: "探索你的先天特質、職業傾向與關係模式" },
    { key: "relationship", label: "關係動力分析", path: "/wellness/relationship", desc: "理解你與重要他人的互動模式與成長空間" },
  ],
  en: [
    { key: "cards", label: "Archetypal Self-Discovery", path: "/wellness/cards", desc: "Use archetypal cards to gain instant insight into your inner state" },
    { key: "blueprint", label: "Personality Pattern Blueprint", path: "/wellness/self-discovery", desc: "Explore your innate traits, career orientation & relationship patterns" },
    { key: "relationship", label: "Relationship Dynamics", path: "/wellness/relationship", desc: "Understand interaction patterns and growth edges with significant others" },
  ],
};

// ---- Self-Discovery Form ----
export const WELLNESS_FORM: Record<string, Record<string, string>> = {
  "zh-TW": {
    title: "人格模式藍圖",
    subtitle: "基於多體系人格分析，生成你的專屬自我認知報告",
    name: "你的名字",
    namePlaceholder: "請輸入你的名字（用於報告稱呼）",
    gender: "性別",
    country: "國家 / 地區",
    province: "省份 / 州",
    city: "城市",
    cityLabel: "出生城市（精確地點）",
    cityPlaceholder: "輸入出生城市，如：北京市朝陽區",
    birthDate: "出生日期",
    birthTime: "精確出生時間",
    birthHour: "時",
    birthMinute: "分",
    calendarType: "曆法",
    solar: "公曆",
    lunar: "農曆",
    timezoneLabel: "時區（自動檢測）",
    selectCountryFirst: "請先選擇國家",
    start: "生成我的報告",
    freeRemaining: "剩餘免費次數：{count}",
    privacyNote: "你的出生資料僅用於生成報告，不會被儲存或分享。",
  },
  en: {
    title: "Personality Pattern Blueprint",
    subtitle: "Multi-system personality analysis to generate your personal self-discovery report",
    name: "Your Name",
    namePlaceholder: "Enter your name (used in the report)",
    gender: "Gender",
    country: "Country / Region",
    province: "Province / State",
    city: "City",
    cityLabel: "City (Precise Birth Location)",
    cityPlaceholder: "Enter your birth city, e.g., London, UK",
    birthDate: "Date of Birth",
    birthTime: "Precise Birth Time",
    birthHour: "Hour",
    birthMinute: "Minute",
    calendarType: "Calendar",
    solar: "Solar",
    lunar: "Lunar",
    timezoneLabel: "Timezone (Auto-Detected)",
    selectCountryFirst: "Select Country First",
    start: "GENERATE MY REPORT",
    freeRemaining: "Remaining Free Credits: {count}",
    privacyNote: "Your birth data is used only to generate this report. It is never stored or shared.",
  },
};

// ---- Personality Blueprint Report Sections ----
export interface WellnessReportSection {
  icon: string;
  title: string;
  content: string;
}

export function getPersonalityBlueprintSections(isZh: boolean): WellnessReportSection[] {
  if (isZh) {
    return [
      {
        icon: "🧭",
        title: "職業傾向與天賦",
        content: `每個人都帶著獨特的天賦配置來到這個世界。你的先天特質組合指向了某些你天生就比別人做得更好的領域——這不是"命運"，而是你的心理操作系統的原始設定。\n\n【核心天賦】你在處理複雜信息和抽象概念方面有明顯的優勢。你傾向於先理解全局再深入細節，這讓你在需要系統性思維的領域中脫穎而出。你的思維方式不是線性的，而是網狀的——你能看到別人看不到的關聯。\n\n【適合的工作環境】你需要的是能給你一定自主權和思考空間的環境。過於僵化或微觀管理的工作模式會讓你的優勢無法發揮。你適合那些需要"理解→設計→優化"循環的崗位。\n\n【職業發展建議】不要被單一職業路徑限制。你的配置支持跨界發展——在不同領域之間建立橋樑，往往是你最有價值的地方。與其問"我該做什麼工作"，不如問"什麼問題值得我去解決"。`,
      },
      {
        icon: "💎",
        title: "資源管理風格",
        content: `這裡說的"資源"不只是金錢。它包含你的時間、精力、人脈和注意力——你如何獲取、分配和增值這些資源，構成了你獨特的資源管理風格。\n\n【獲取模式】你傾向於通過創造價值來獲取資源，而不是通過競爭或博弈。這意味著你的資源積累方式更接近"種樹"而非"狩獵"——前期回報較慢，但一旦建立起系統，會有持續的增長。\n\n【分配傾向】你比較容易把資源投入到"能產生複利"的事情上——學習、建立系統、培養關係。你不太擅長短線操作，也對純粹的投機缺乏興趣。這是優勢，但也意味著你需要確保有足夠的基礎資源支撐前期的投入期。\n\n【需要注意的】你的風格在穩定環境中表現很好，但在需要快速反應的場景中可能會錯過窗口。建議建立一個"快速反應基金"——一筆專門用來抓住臨時機會的資源預留。不是因為你需要投機，而是為了給自己選項。`,
      },
      {
        icon: "🤝",
        title: "關係模式與依戀風格",
        content: `你在關係中的行為模式，很大程度上取決於你的先天氣質和早期經驗的交互。理解這些模式不是為了給自己貼標籤，而是為了獲得"旁觀者視角"——看到那些自動駕駛的反應，然後做出更清醒的選擇。\n\n【你的關係語言】你傾向於通過"做事情"來表達關心——把對方的需求默默處理好，用行動而非言語傳遞愛。這是你的默認表達方式，但不一定是對方接收愛的最佳頻道。了解對方的"愛的語言"——有些人需要聽到，有些人需要看到，有些人需要感受到陪伴。\n\n【吸引模式】你比較容易被具有獨立人格和清晰邊界的人吸引。你尊重那些知道自己想要什麼的人，也期待同樣的尊重。在關係初期，你可能顯得有些距離感——這不是冷漠，而是你需要在感到安全之後才會真正敞開。\n\n【成長課題】學會在需要的時候說"我需要你"——不是因為你軟弱，而是因為親密關係的本質就是互相需要。獨立是你的優勢，但如果變成"不需要任何人"，就是一種防禦而非力量。`,
      },
      {
        icon: "🌿",
        title: "身心平衡",
        content: `身心健康不是"沒有問題"的狀態，而是你與自己的身體和情緒建立了怎樣的工作關係。你的配置給了你充沛的精力，但也可能讓你忽略身體的疲勞信號。\n\n【精力特點】你的意志力很強——強大到可以覆蓋身體的疲勞感。這在短期內是優勢，長期來看是需要警惕的。意志力不應該被用來對抗身體的需求，而應該被用來建立健康的節奏。\n\n【壓力信號】當你處於過度壓力時，你的身體會先於你的意識察覺到。常見的信號包括：睡眠質量下降、消化系統的不適、以及一種"說不清楚但感覺不對"的狀態。這些不是需要被忽略的噪音，而是需要被聽到的信號。\n\n【日常養生】最適合你的不是什麼特別的養生方法，而是"穩定節奏"——固定時間吃飯、固定時間睡覺、每週2-3次讓你感覺好的身體活動。冥想或正念練習對你的幫助可能比你想像中大得多——不是為了放鬆，而是為了訓練"覺察身體信號"的能力。`,
      },
    ];
  }
  return [
    {
      icon: "🧭",
      title: "Career Orientation & Talents",
      content: `Everyone comes into the world with a unique configuration of talents. Your innate traits point toward areas where you naturally excel — this isn't "destiny," but the original settings of your psychological operating system.\n\n【Core Talents】You have a notable strength in processing complex information and abstract concepts. You tend to understand the big picture before diving into details, which helps you stand out in fields requiring systemic thinking. Your mind works in networks, not straight lines — you see connections others miss.\n\n【Ideal Work Environment】You need autonomy and thinking space. Overly rigid or micromanaged environments suppress your strengths. You thrive in roles that follow a "understand → design → optimize" cycle.\n\n【Career Advice】Don't limit yourself to a single career path. Your configuration supports cross-domain development — building bridges between different fields is often where you create the most value. Instead of asking "What job should I do?", ask "What problem is worth solving?"`,
    },
    {
      icon: "💎",
      title: "Resource Management Style",
      content: `"Resources" here means more than money. It includes your time, energy, relationships, and attention — how you acquire, allocate, and grow these resources defines your unique management style.\n\n【Acquisition Pattern】You tend to gain resources through creating value rather than through competition or speculation. Think of it as "farming" rather than "hunting" — returns come slower initially, but once a system is established, growth becomes steady and compounding.\n\n【Allocation Tendency】You naturally invest resources in things with compound potential — learning, building systems, cultivating relationships. Short-term plays and pure speculation don't interest you much. This is a strength, but it also means you need enough baseline resources to sustain the investment period.\n\n【Watch For】Your style excels in stable environments but may miss windows requiring quick reaction. Consider maintaining a "rapid response fund" — reserved resources for seizing unexpected opportunities. Not because you need speculation, but to give yourself options.`,
    },
    {
      icon: "🤝",
      title: "Relationship Patterns & Attachment",
      content: `Your behavioral patterns in relationships are shaped by the interaction of your innate temperament and early experiences. Understanding these patterns isn't about labeling yourself — it's about gaining an "observer's perspective" on your automatic responses, so you can make more conscious choices.\n\n【Your Relationship Language】You tend to express care through "doing things" — quietly handling the other person's needs, using actions rather than words to communicate love. This is your default mode, but it may not be the other person's best receiving channel. Learn their "love language" — some need to hear it, some need to see it, some need to feel presence.\n\n【Attraction Pattern】You're drawn to people with independent personalities and clear boundaries. You respect those who know what they want, and you expect the same respect. In early stages, you may seem slightly distant — this isn't coldness, but a need to feel safe before truly opening up.\n\n【Growth Edge】Learn to say "I need you" when you need to — not because you're weak, but because the essence of intimacy is mutual need. Independence is your strength, but if it becomes "I don't need anyone," it's a defense, not power.`,
    },
    {
      icon: "🌿",
      title: "Mind-Body Balance",
      content: `Wellness isn't the absence of problems — it's about the working relationship you've built with your body and emotions. Your configuration gives you abundant energy, but it may also cause you to override your body's fatigue signals.\n\n【Energy Profile】Your willpower is strong — strong enough to override physical exhaustion. This is an advantage in the short term, but worth watching long-term. Willpower shouldn't be used to fight your body's needs; it should be used to build healthy rhythms.\n\n【Stress Signals】When over-stressed, your body notices before your conscious mind does. Common signals include: declining sleep quality, digestive discomfort, and a vague "something feels off" state. These aren't noise to ignore — they're signals to listen to.\n\n【Daily Practice】What suits you best isn't any special wellness method, but "steady rhythm" — fixed meal times, fixed sleep times, and 2-3 weekly sessions of physical activity that feel good. Meditation or mindfulness practice may help more than you think — not for relaxation, but to train the skill of "noticing body signals."`,
    },
  ];
}

// ---- Relationship Dynamics Report Sections ----
export function getRelationshipDynamicsSections(isZh: boolean): WellnessReportSection[] {
  if (isZh) {
    return [
      {
        icon: "🔗",
        title: "關係磁場分析",
        content: `人與人之間的吸引力，從本質上來說，是兩個心理系統的共振。你們的互動模式顯示出一種深層的互補——對方的存在不僅讓你感到舒適，更在某種程度上"補足"了你未曾意識到的心理需求。\n\n【吸引力來源】從人格分析的角度來看，你們的特質組合形成了天然的互補。你的優勢恰好是對方相對不足的領域，反之亦然。這種互補不是刻意為之，而是自然形成的動態平衡。\n\n【為什麼是這個人】有些關係中的吸引力很難用邏輯解釋——不是外表、不是條件，而是更深層的、連當事人都說不清楚的共鳴。當兩個人的無意識需求恰好匹配時，就會產生這種"說不清為什麼，但就是對了"的感覺。`,
      },
      {
        icon: "💬",
        title: "溝通與互動風格",
        content: `每個人都有自己的"情感語言"——你習慣用什麼方式表達關心，以及你最能接收什麼形式的關心。了解雙方的溝通風格，是減少誤解最有效的方式。\n\n【你的溝通風格】你傾向於用行動表達關心——把事情都處理好、把問題解決掉，這就是你表達愛的方式。但對某些人來說，他們需要的是語言上的確認和情感上的直接表達。這兩種風格沒有對錯，但如果互不了解，就容易產生"我已經很努力了，為什麼Ta還是不滿意"的誤解。\n\n【對方的可能風格】你們的互動數據顯示，對方可能更傾向於通過語言和情感表達來建立連結。這意味著對Ta來說，"聽到"你的關心比"看到"你的行動更重要。\n\n【建立共同語言】建議定期做"溝通校準"——不是爭論誰對誰錯，而是互相告訴對方"當你做___的時候，我感覺___"。這種簡單的練習能幫你們建立一套屬於自己的溝通詞典。`,
      },
      {
        icon: "🌋",
        title: "成長邊界與挑戰",
        content: `每段深度關係都會觸及彼此的成長邊界——那些你需要但還不擅長的事情。這不是關係的問題，而是關係的功能。好的關係不是沒有摩擦，而是能把摩擦轉化為成長。\n\n【潛在摩擦點】你們最大的張力可能來自於"獨立與親密"的平衡。一方需要更多的自主空間，另一方需要更多的情感連結——這兩種需求本身都是合理的，但如果不被看見和理解，就會變成衝突。\n\n【需要共同面對的課題】① 學會在爭論中"暫停"——不是冷戰，而是約定"我們先各自冷靜一下再回來聊"。② 不要用自己的童年經驗去解讀對方的行為——你們來自不同的家庭系統。③ 定期做"關係盤點"——誠實地問彼此"最近哪裡讓我覺得被理解，哪裡讓我覺得孤單"。\n\n【這段關係的意義】這段關係對你來說不是那種輕鬆愉快的"過客"，而是帶有成長任務的認真連結。它可能會在某些時刻讓你感到壓力，但正是這種壓力在推動你成為更完整的自己。`,
      },
      {
        icon: "🔍",
        title: "關係深度評估",
        content: `不是每一段關係都需要走到最深處。但對於那些你想要長久經營的關係，了解它的深度和潛力，能幫你做出更清醒的投入。\n\n【匹配度分析】你們的關係屬於"高度互補型"——不是你們很相似，而是你們的不同恰好能形成完整的生態。這種關係的優勢在於能互相補足盲區，劣勢在於如果不主動理解對方，差異會變成隔閡。\n\n【連結強度】你們之間存在一種超越表面的深層連結——這種連結不是建立在共同的興趣或相似的背景上，而是建立在更深層的心理需求的匹配上。這類關係的一個特徵是：在一起很久之後，你仍然能在對方身上發現新的層次。\n\n【需要知道的事】深度關係不是"找到對的人"就萬事大吉。它需要持續的投入和意願。你們的關係有很好的基礎，但基礎只是起點。`,
      },
      {
        icon: "🛤️",
        title: "關係成長路徑",
        content: `關係不是靜態的，它有自己的發展節奏和階段。了解你們當前處於哪個階段，以及接下來可能經歷什麼，能幫你減少焦慮、增加耐心。\n\n【當前階段】你們目前正處於"深入了解期"——表面的吸引力已經確立，現在開始進入真正的相互理解。這個階段的關鍵任務是：建立信任、了解差異、學習對方的"操作手冊"。\n\n【短期展望（6-12個月）】這個階段你們會逐漸形成穩定的互動模式。一些早期的摩擦會自然消退，新的、更深層的課題可能會浮現。這是健康關係的必經過程——不是關係變差了，而是關係在深化。\n\n【長期建議】最好的關係不是沒有問題的關係，而是建立了"一起解決問題的機制"的關係。把注意力從"我們有沒有問題"轉移到"我們能不能一起處理問題"。`,
      },
    ];
  }
  return [
    {
      icon: "🔗",
      title: "Connection Dynamics",
      content: `Attraction between people is, at its core, the resonance of two psychological systems. Your interaction pattern shows a deep complementarity — the other person's presence not only brings you comfort but also, in some way, "completes" psychological needs you may not have been aware of.\n\n【Source of Attraction】From a personality analysis perspective, your trait combinations form a natural complement. Your strengths are exactly areas where the other person is relatively less developed, and vice versa. This complementarity isn't deliberate — it's a naturally formed dynamic balance.\n\n【Why This Person】Some attractions are hard to explain logically — not about appearance or status, but about a deeper resonance that even you can't fully articulate. When two people's unconscious needs match, this "I don't know why, but it just feels right" feeling emerges.`,
    },
    {
      icon: "💬",
      title: "Communication Patterns",
      content: `Everyone has their own "emotional language" — how you naturally express care and how you best receive it. Understanding both sides' communication styles is the most effective way to reduce misunderstandings.\n\n【Your Communication Style】You tend to express care through actions — handling things, solving problems. This is how you say "I love you." But for some people, they need verbal confirmation and direct emotional expression. Neither style is wrong, but without mutual understanding, the "I'm trying so hard, why aren't they satisfied?" misunderstanding easily arises.\n\n【Their Likely Style】The data suggests the other person may lean more toward building connection through verbal and emotional expression. For them, "hearing" your care matters more than "seeing" it.\n\n【Building a Shared Language】Try regular "communication calibration" — not arguing about who's right, but telling each other: "When you do ___, I feel ___." This simple practice builds a personalized communication dictionary.`,
    },
    {
      icon: "🌋",
      title: "Growth Edges & Challenges",
      content: `Every deep relationship touches each person's growth edges — the things you need but aren't yet skilled at. This isn't a relationship problem; it's a relationship function. Good relationships don't lack friction; they transform friction into growth.\n\n【Potential Friction Points】Your biggest tension likely comes from the "independence vs. intimacy" balance. One side needs more autonomy; the other needs more emotional connection. Both needs are valid, but if unseen and unacknowledged, they become conflict.\n\n【Shared Lessons】① Learn to "pause" during arguments — not silent treatment, but an agreed cooling-off period. ② Don't interpret each other's behavior through your childhood experiences — you come from different family systems. ③ Do regular "relationship check-ins" — honestly ask: "Where did I feel understood lately? Where did I feel alone?"\n\n【Why This Relationship Matters】This isn't a light, casual connection. It carries growth tasks. It may feel heavy at times, but that heaviness is exactly what pushes you toward becoming a more complete version of yourself.`,
    },
    {
      icon: "🔍",
      title: "Relationship Depth Assessment",
      content: `Not every relationship needs to go to the deepest level. But for the ones you want to invest in long-term, understanding the depth and potential helps you invest more consciously.\n\n【Compatibility Level】Your relationship is "highly complementary" — not because you're similar, but because your differences form a complete ecosystem. The advantage: you fill each other's blind spots. The risk: if you don't actively understand each other, differences become walls.\n\n【Connection Strength】There's a deep connection between you that goes beyond surface-level compatibility — it's not built on shared interests or similar backgrounds, but on a deeper match of psychological needs. A hallmark: even after a long time together, you still discover new layers in each other.\n\n【What to Know】Deep relationships aren't about "finding the right person" and being done. They require ongoing investment and willingness. Your relationship has a strong foundation — but a foundation is only the starting point.`,
    },
    {
      icon: "🛤️",
      title: "Relationship Growth Path",
      content: `Relationships aren't static; they have their own developmental rhythm and phases. Understanding which phase you're in and what may come next reduces anxiety and increases patience.\n\n【Current Phase】You're currently in the "deep understanding phase" — surface attraction is established, and real mutual understanding begins. The key tasks: build trust, understand differences, learn each other's "user manual."\n\n【Near-Term Outlook (6-12 months)】Stable interaction patterns will gradually form. Some early friction will naturally fade; new, deeper topics may surface. This is a healthy progression — not the relationship getting worse, but deepening.\n\n【Long-Term Advice】The best relationships aren't problem-free — they've built a "problem-solving mechanism together." Shift focus from "Do we have problems?" to "Can we handle problems together?"`,
    },
  ];
}

// ---- Disclaimer (required on every report page) ----
export const WELLNESS_DISCLAIMER: Record<string, string> = {
  "zh-TW": "本服務僅供自我反思和個人成長之用。它不是專業心理健康診斷或治療的替代品。如果您正在經歷心理健康危機，請聯繫持證專業人士。",
  en: "This service is designed for self-reflection and personal growth purposes. It is not a substitute for professional mental health diagnosis or treatment. If you are experiencing a mental health crisis, please contact a licensed professional.",
};

// ---- Relationship Report Form ----
export const WELLNESS_RELATIONSHIP_FORM: Record<string, Record<string, string>> = {
  "zh-TW": {
    title: "關係動力分析",
    subtitle: "理解你與重要他人的互動模式、溝通風格與成長空間",
    yourInfo: "你的資訊",
    partnerInfo: "對方的資訊",
    partnerName: "對方名字",
    partnerNamePlaceholder: "請輸入對方的名字",
    partnerBirthDate: "對方出生日期",
    partnerBirthPlace: "對方出生地點",
    partnerBirthTime: "對方出生時間",
    partnerGender: "對方性別",
    start: "生成關係報告",
    privacyNote: "雙方的出生資料僅用於生成報告，不會被儲存或分享。",
  },
  en: {
    title: "Relationship Dynamics",
    subtitle: "Understand interaction patterns, communication styles, and growth edges with significant others",
    yourInfo: "Your Information",
    partnerInfo: "Partner's Information",
    partnerName: "Partner's Name",
    partnerNamePlaceholder: "Enter your partner's name",
    partnerBirthDate: "Partner's Birth Date",
    partnerBirthPlace: "Partner's Birth Place",
    partnerBirthTime: "Partner's Birth Time",
    partnerGender: "Partner's Gender",
    start: "GENERATE RELATIONSHIP REPORT",
    privacyNote: "Both parties' birth data is used only to generate this report. It is never stored or shared.",
  },
};
