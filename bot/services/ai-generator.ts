/* ============================================================
   R7 Wellness Bot — AI Report Generator v2
   Inspired by structured personality frameworks (14 archetypes,
   12 life dimensions, 4 behavioral dynamics).
   All output framed as psychological pattern analysis.
   Middle East compliant — ZERO religious/divination language.
   ============================================================ */

import { KIMI_MODEL, MOONSHOT_API_KEY, MOONSHOT_BASE_URL } from "../config.js";

// ---- 14 Personality Archetypes (inspired by structured frameworks) ----
const ARCHETYPES = [
  { name: "The Anchor", traits: "stable, decisive, responsible, prefers order and clarity. Natural leader who thrives when given ownership. Blind spot: rigidity, discomfort with ambiguity." },
  { name: "The Strategist", traits: "analytical, adaptable, creative problem-solver. Sees multiple angles of every situation. Blind spot: overthinking, analysis paralysis, difficulty committing." },
  { name: "The Illuminator", traits: "outgoing, generous, energizes others. Gains satisfaction through positive impact. Blind spot: overextending, needing external validation, burning out." },
  { name: "The Executor", traits: "action-oriented, disciplined, reliable. Respects structure and delivers consistently. Blind spot: inflexibility, difficulty with emotional nuance, can seem cold." },
  { name: "The Harmonizer", traits: "empathetic, peacemaking, relationship-focused. Creates comfort and emotional safety. Blind spot: avoiding necessary conflict, passive, slow to initiate." },
  { name: "The Intensifier", traits: "deeply feeling, all-or-nothing, intensely loyal. Brings passion and emotional depth. Blind spot: extremes, control issues, difficulty letting go." },
  { name: "The Stabilizer", traits: "steady, conservative, reliable steward. Maintains and preserves what matters. Blind spot: resistance to change, risk-averse to a fault." },
  { name: "The Reflector", traits: "introspective, sensitive, perceptive. Notices emotional undercurrents others miss. Blind spot: withdrawal, moodiness, absorbing others' emotions." },
  { name: "The Explorer", traits: "curious, versatile, experience-driven. Thrives on variety and novelty. Blind spot: scattered focus, difficulty with long-term commitment, restlessness." },
  { name: "The Depth-Seeker", traits: "truth-driven, analytical, questions everything. Goes beneath the surface. Blind spot: skepticism turning to cynicism, isolation, over-privacy." },
  { name: "The Diplomat", traits: "balanced, service-oriented, socially graceful. Builds bridges between people. Blind spot: people-pleasing, losing own identity, avoiding hard stands." },
  { name: "The Guardian", traits: "protective, principled, stands up for the vulnerable. Strong moral compass. Blind spot: self-righteousness, burnout from caretaking, difficulty receiving help." },
  { name: "The Challenger", traits: "bold, independent, breaks conventions. Drives change through disruption. Blind spot: recklessness, alienation of allies, impatience with process." },
  { name: "The Pioneer", traits: "trailblazing, resilient, deconstructs to rebuild. Thrives in transformation. Blind spot: chaos creation, leaving messes for others, starting but not finishing." },
];

// ---- 12 Life Dimensions ----
const DIMENSIONS = [
  "Core Self — Who you are at your center. Your fundamental personality configuration.",
  "Close Circle — Your dynamics with siblings, close friends, and inner-circle relationships.",
  "Partnership Style — Your expectations, patterns, and needs in intimate partnerships.",
  "Creative Expression — How you create, express yourself, and relate to those you mentor.",
  "Resource Approach — Your relationship with money, time, energy, and material resources.",
  "Body-Mind Connection — Your physical and mental health patterns, stress signals, and self-care style.",
  "External Engagement — How you interact with the outside world, travel, and unfamiliar environments.",
  "Social Dynamics — Your social network patterns, friendships, and group interactions.",
  "Work Orientation — Your career tendencies, work style, and professional growth patterns.",
  "Inner Sanctuary — Your sense of home, security, roots, and private space.",
  "Inner World — Your values, meaning-making style, happiness sources, and mental wellbeing.",
  "Early Influence — How early environment and key figures shaped your patterns.",
];

// ---- 4 Behavioral Dynamics ----
const DYNAMICS = [
  "Flow Pattern — What comes naturally to you with minimal effort? Where do you find ease?",
  "Drive Pattern — What do you actively pursue and seek to control? Where does your ambition focus?",
  "Expression Pattern — What do you do well that others notice and recognize? What is your visible strength?",
  "Growth Edge — What recurring challenge appears in your life? What is your deepest learning opportunity?",
];

// ---- System Prompt ----
const SYSTEM_PROMPT = `You are a psychological wellness analyst. You help people understand their personality patterns through structured analysis.

CRITICAL RULES:
- NEVER use: fortune, destiny, predict, divination, luck, fate, zodiac, horoscope, star sign, karma, past life, soul, universe, energy healing, vibration, astrology, tarot, witchcraft, curse
- NEVER claim to foretell the future or reveal hidden truths
- NEVER use religious or spiritual framing of any kind
- ALWAYS frame insights as: "patterns," "tendencies," "inclinations," "predispositions"
- ALWAYS use warm, professional, non-judgmental, scientific-adjacent language
- ALWAYS include the disclaimer: "This is a self-reflection tool, not a clinical diagnosis."
- Use "you may tend to..." not "you will..."
- Use "many people with this pattern..." not "your destiny is..."

PERSONALITY FRAMEWORK:
You have access to 14 personality archetypes. Based on the birth information provided, identify which 2-3 archetypes best describe this person's pattern, and use them as the foundation for all analysis.

${ARCHETYPES.map((a) => `- ${a.name}: ${a.traits}`).join("\n")}

LIFE DIMENSIONS TO ANALYZE:
${DIMENSIONS.map((d) => `- ${d}`).join("\n")}

BEHAVIORAL DYNAMICS TO ADDRESS:
${DYNAMICS.map((d) => `- ${d}`).join("\n")}

OUTPUT STRUCTURE:
Always identify the dominant archetypes first, then analyze each selected life dimension.
Use 【】brackets for section headers. Each section 180-280 words.
Be specific to the person's birth details — reference their date patterns to make it feel personalized.
End every report with the standard disclaimer.`;

// ---- Types ----
export interface SelfDiscoveryInput {
  name: string;
  birthDate: string;
  birthTime?: string;
  birthPlace: string;
}

export interface RelationshipInput {
  name1: string; birthDate1: string; birthTime1?: string; birthPlace1: string;
  name2: string; birthDate2: string; birthTime2?: string; birthPlace2: string;
}

export type ProductReportType =
  | "emotional-depth"
  | "dream-emotion"
  | "career-meaning"
  | "body-emotion-balance"
  | "inner-richness-personality"
  | "relationship-emotional-growth";

export interface ProductReportInput {
  reportType: ProductReportType;
  name: string;
  gender?: "male" | "female" | string;
  country?: string;
  focus?: string;
  relationshipContext?: string;
  answers?: Array<{ question: string; score: number }>;
}

type SignalTag =
  | "restrained-emotion"
  | "inner-emptiness"
  | "relationship-absence"
  | "body-depletion"
  | "role-pressure"
  | "self-neglect"
  | "meaning-gap";

type TheoryTag =
  | "existential-meaning"
  | "self-determination"
  | "emotion-granularity"
  | "attachment"
  | "self-compassion"
  | "big-five"
  | "perma"
  | "flow";

interface SceneAtom {
  id: string;
  signals: SignalTag[];
  theory: TheoryTag[];
  label: string;
  arLabel: string;
  scenario: string;
  arScenario: string;
  suggestion: string;
}

const SIGNAL_RULES: Array<{ tag: SignalTag; keywords: string[] }> = [
  { tag: "restrained-emotion", keywords: ["composed", "hold back", "manage pain", "strong", "not said", "demanding"] },
  { tag: "inner-emptiness", keywords: ["inner fullness", "privately alone", "gap between", "hollow", "empty", "quiet inside"] },
  { tag: "relationship-absence", keywords: ["people close", "deeper connection", "affection", "emotional safety", "tone", "attention", "distant"] },
  { tag: "body-depletion", keywords: ["body", "tiredness", "fatigue", "rest", "energy", "sleep"] },
  { tag: "role-pressure", keywords: ["responsible", "others", "family", "reliable", "work", "successful"] },
  { tag: "self-neglect", keywords: ["generous with others", "restrained with myself", "needs stay unnamed", "validation"] },
  { tag: "meaning-gap", keywords: ["achievement", "meaningful", "successful", "external validation", "work"] },
];

const THEORY_NOTES: Record<TheoryTag, string> = {
  "existential-meaning": "Existential psychology: meaning, isolation, and inner emptiness can appear even when external life looks successful.",
  "self-determination": "Self-Determination Theory: autonomy, competence, and relatedness shape motivation and inner vitality.",
  "emotion-granularity": "Emotion granularity: naming feelings more precisely supports more flexible emotional regulation.",
  attachment: "Adult attachment theory: closeness, safety, withdrawal, and reassurance patterns influence relationship security.",
  "self-compassion": "Self-compassion research: self-kindness, common humanity, and mindful awareness support recovery from inner criticism.",
  "big-five": "Big Five personality research: traits are dimensional tendencies with useful strengths and predictable pressure points.",
  perma: "PERMA positive psychology: positive emotion, engagement, relationships, meaning, and accomplishment support wellbeing.",
  flow: "Flow theory: meaningful absorption and clear challenge-skill balance can restore vitality beyond status or output.",
};

const REPORT_THEORIES: Record<ProductReportType, TheoryTag[]> = {
  "emotional-depth": ["emotion-granularity", "self-compassion", "existential-meaning", "perma"],
  "dream-emotion": ["emotion-granularity", "self-compassion", "existential-meaning"],
  "career-meaning": ["self-determination", "existential-meaning", "flow", "perma"],
  "body-emotion-balance": ["emotion-granularity", "self-compassion", "perma"],
  "inner-richness-personality": ["big-five", "self-determination", "self-compassion", "perma"],
  "relationship-emotional-growth": ["attachment", "emotion-granularity", "self-compassion", "perma"],
};

const SCENE_LIBRARY: Record<ProductReportType, { male: SceneAtom[]; female: SceneAtom[]; all?: SceneAtom[] }> = {
  "emotional-depth": {
    male: [
      {
        id: "family-business-restraint",
        signals: ["restrained-emotion", "role-pressure"],
        theory: ["emotion-granularity", "self-compassion"],
        label: "Family-business responsibility with little emotional permission",
        arLabel: "مسؤولية العمل العائلي مع مساحة عاطفية محدودة",
        scenario: "You may be expected to stay steady in family or business settings, so emotional tiredness appears only after meetings, late drives, or quiet nights.",
        arScenario: "قد يُتوقع منك الثبات في العائلة أو العمل، لذلك يظهر التعب العاطفي بعد الاجتماعات أو القيادة ليلًا أو لحظات الصمت.",
        suggestion: "Name one feeling before solving it; precise naming lowers the pressure to turn every feeling into a task.",
      },
      {
        id: "after-business-loneliness",
        signals: ["inner-emptiness", "role-pressure"],
        theory: ["existential-meaning", "perma"],
        label: "Private loneliness after polished social or business gatherings",
        arLabel: "وحدة خاصة بعد لقاءات اجتماعية أو عملية أنيقة",
        scenario: "After a polished dinner, majlis, or business evening, the outer respect may be real while the inner feeling still feels untouched.",
        arScenario: "بعد عشاء أنيق أو مجلس أو أمسية عمل، قد يكون الاحترام الخارجي حقيقيًا بينما يبقى الداخل غير ملامس.",
        suggestion: "Add one non-performance ritual after social events: quiet reflection, a short walk, or a message to someone emotionally safe.",
      },
    ],
    female: [
      {
        id: "multi-role-invisible-load",
        signals: ["self-neglect", "role-pressure", "restrained-emotion"],
        theory: ["self-compassion", "emotion-granularity"],
        label: "Multiple roles with invisible emotional labor",
        arLabel: "أدوار متعددة مع جهد عاطفي غير مرئي",
        scenario: "You may move between family expectations, social grace, and private needs while keeping your own tiredness elegantly hidden.",
        arScenario: "قد تنتقلين بين توقعات العائلة واللباقة الاجتماعية واحتياجاتك الخاصة مع إخفاء تعبك بهدوء.",
        suggestion: "Before caring for everyone else, write one sentence beginning with: 'Today I also need...'",
      },
      {
        id: "social-mask-fatigue",
        signals: ["restrained-emotion", "inner-emptiness"],
        theory: ["emotion-granularity", "self-compassion"],
        label: "Graceful social presence with private emotional fatigue",
        arLabel: "حضور اجتماعي لطيف مع تعب عاطفي خاص",
        scenario: "In gatherings, you may appear warm and composed, then feel emotionally empty when you are finally alone.",
        arScenario: "في اللقاءات قد تبدين دافئة ومتماسكة، ثم تشعرين بفراغ عاطفي عندما تكونين وحدك.",
        suggestion: "Use a two-minute exit ritual: hand on chest, one named feeling, one small act of care before sleep.",
      },
    ],
  },
  "dream-emotion": {
    male: [
      {
        id: "decision-pressure-dream",
        signals: ["role-pressure", "meaning-gap"],
        theory: ["emotion-granularity", "existential-meaning"],
        label: "Decision-pressure dream as emotional projection",
        arLabel: "حلم ضغط القرار كإسقاط عاطفي",
        scenario: "A dream about delays, doors, driving, or difficult choices can reflect decision fatigue, not any external certainty.",
        arScenario: "قد يعكس حلم التأخير أو الأبواب أو القيادة أو الخيارات الصعبة إرهاق القرار، وليس أي يقين خارجي.",
        suggestion: "Write the dream feeling in plain language, then choose one real decision that needs a smaller next step.",
      },
    ],
    female: [
      {
        id: "security-absence-dream",
        signals: ["relationship-absence", "restrained-emotion"],
        theory: ["attachment", "self-compassion"],
        label: "Safety-seeking dream as a need for steadier reassurance",
        arLabel: "حلم البحث عن الأمان كاحتياج لطمأنة أكثر ثباتًا",
        scenario: "Dreams of searching, waiting, being unheard, or losing a familiar place can mirror a need for safer emotional presence.",
        arScenario: "قد تعكس أحلام البحث أو الانتظار أو عدم السماع أو فقدان مكان مألوف حاجة إلى حضور عاطفي أكثر أمانًا.",
        suggestion: "Ask: 'What reassurance did this feeling want?' Then give yourself one grounded form of that reassurance today.",
      },
    ],
  },
  "career-meaning": {
    male: [
      {
        id: "summit-meaning-loss",
        signals: ["meaning-gap", "role-pressure", "inner-emptiness"],
        theory: ["self-determination", "existential-meaning", "flow"],
        label: "Achievement after the summit with meaning fading",
        arLabel: "إنجاز بعد القمة مع تراجع المعنى",
        scenario: "You may have reached a level of income, title, or influence that once mattered, yet feel less emotionally fed by it now.",
        arScenario: "قد تكون وصلت إلى دخل أو منصب أو نفوذ كان مهمًا سابقًا، لكنه لم يعد يغذيك داخليًا كما كان.",
        suggestion: "Separate status goals from vitality goals; choose one activity this week that restores autonomy, competence, or connection.",
      },
    ],
    female: [
      {
        id: "career-family-energy-split",
        signals: ["role-pressure", "self-neglect", "meaning-gap"],
        theory: ["self-determination", "self-compassion"],
        label: "Work-family energy split and value mismatch",
        arLabel: "انقسام الطاقة بين العمل والعائلة واختلاف القيمة",
        scenario: "You may succeed professionally while still feeling pulled by family rhythms, reputation, and expectations about how much space ambition may take.",
        arScenario: "قد تنجحين مهنيًا بينما تشعرين بالشد بين إيقاع العائلة والسمعة والتوقعات حول مساحة الطموح.",
        suggestion: "Define one work boundary that protects your energy without framing care for yourself as selfish.",
      },
    ],
  },
  "body-emotion-balance": {
    all: [
      {
        id: "night-rhythm-depletion",
        signals: ["body-depletion", "role-pressure"],
        theory: ["emotion-granularity", "self-compassion"],
        label: "Irregular sleep, late obligations, and slow depletion",
        arLabel: "نوم غير منتظم والتزامات ليلية واستنزاف بطيء",
        scenario: "Late meals, social obligations, travel, or seasonal rhythm changes can make emotional pressure show through the body first.",
        arScenario: "قد تجعل الوجبات المتأخرة أو الالتزامات الاجتماعية أو السفر أو تغير الإيقاع الموسمي الضغط العاطفي يظهر في الجسد أولًا.",
        suggestion: "Protect one predictable wind-down cue for seven nights: dim light, no heavy decisions, and one named feeling.",
      },
    ],
    male: [
      {
        id: "busy-to-avoid-emptiness",
        signals: ["body-depletion", "inner-emptiness", "meaning-gap"],
        theory: ["existential-meaning", "self-compassion"],
        label: "Using busyness to avoid inner emptiness",
        arLabel: "استخدام الانشغال لتجنب الفراغ الداخلي",
        scenario: "A full calendar may keep you respected and needed, while also delaying the quiet moment when emotional emptiness becomes noticeable.",
        arScenario: "قد يبقيك الجدول الممتلئ محترمًا ومطلوبًا، لكنه يؤجل لحظة الصمت التي يظهر فيها الفراغ الداخلي.",
        suggestion: "Schedule one non-productive recovery block and treat it as maintenance of judgment, not weakness.",
      },
    ],
    female: [
      {
        id: "care-before-self-fatigue",
        signals: ["self-neglect", "body-depletion"],
        theory: ["self-compassion", "perma"],
        label: "Chronic fatigue from placing self-care last",
        arLabel: "تعب مزمن من وضع العناية الذاتية في النهاية",
        scenario: "You may notice everyone else's mood and needs before your own body receives attention.",
        arScenario: "قد تلاحظين مزاج الجميع واحتياجاتهم قبل أن يحصل جسدك على انتباهك.",
        suggestion: "Choose one care action before the day is finished for others: water, silence, stretching, or an earlier pause.",
      },
    ],
  },
  "inner-richness-personality": {
    male: [
      {
        id: "reserved-majlis-misread",
        signals: ["restrained-emotion", "role-pressure"],
        theory: ["big-five", "emotion-granularity"],
        label: "Reserved presence in majlis settings misread as distance",
        arLabel: "حضور متحفظ في المجلس يُفهم كبرود",
        scenario: "In majlis or business gatherings, speaking less may be your way of staying authentic, even if others read it as distance.",
        arScenario: "في المجلس أو لقاءات العمل، قد يكون قلة الكلام طريقتك في البقاء صادقًا، حتى لو فسره الآخرون كمسافة.",
        suggestion: "Offer one clear signal of warmth without forcing performance: a direct question, a brief acknowledgment, or a later follow-up.",
      },
    ],
    female: [
      {
        id: "empathic-self-erasure",
        signals: ["self-neglect", "relationship-absence"],
        theory: ["big-five", "self-compassion", "attachment"],
        label: "Empathic personality caring for others before self",
        arLabel: "شخصية متعاطفة تعتني بالآخرين قبل الذات",
        scenario: "You may track subtle shifts in others' tone and comfort while your own needs wait quietly in the background.",
        arScenario: "قد تلتقطين التغيرات الدقيقة في نبرة الآخرين وراحتهم بينما تنتظر احتياجاتك بصمت في الخلفية.",
        suggestion: "When you notice someone else's emotion, also ask: 'What did this moment bring up in me?'",
      },
    ],
  },
  "relationship-emotional-growth": {
    male: [
      {
        id: "material-care-expression-gap",
        signals: ["relationship-absence", "restrained-emotion", "role-pressure"],
        theory: ["attachment", "emotion-granularity"],
        label: "Material care replacing emotional expression",
        arLabel: "الرعاية المادية بدل التعبير العاطفي",
        scenario: "You may provide, solve, and protect, while your partner still longs for words, presence, or tenderness that feels emotionally direct.",
        arScenario: "قد توفر وتحل وتحمي، بينما لا يزال الطرف الآخر يحتاج كلمات أو حضورًا أو لطفًا مباشرًا عاطفيًا.",
        suggestion: "Pair one practical act with one emotional sentence: 'I did this because your comfort matters to me.'",
      },
    ],
    female: [
      {
        id: "multigenerational-space-pressure",
        signals: ["relationship-absence", "self-neglect", "role-pressure"],
        theory: ["attachment", "self-compassion"],
        label: "Emotional needs compressed by extended-family rhythms",
        arLabel: "احتياجات عاطفية مضغوطة بإيقاع العائلة الممتدة",
        scenario: "In a busy family structure, couple privacy may shrink, and emotional needs can feel postponed until they become heaviness.",
        arScenario: "في بنية عائلية مزدحمة، قد تضيق خصوصية الزوجين وتؤجل الاحتياجات العاطفية حتى تصبح ثقلًا.",
        suggestion: "Ask for a small protected ritual, not a dramatic confrontation: ten quiet minutes, one check-in, one repair question.",
      },
    ],
  },
};

// ---- AI API Call ----
async function callAI(userMessage: string): Promise<string> {
  if (!MOONSHOT_API_KEY) {
    return generateFallbackReport(userMessage);
  }

  const response = await fetch(`${MOONSHOT_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${MOONSHOT_API_KEY}`,
    },
    body: JSON.stringify({
      model: KIMI_MODEL,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userMessage },
      ],
      temperature: 0.7,
      max_tokens: 3072,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`AI API error: ${response.status} ${err}`);
  }

  const data = await response.json() as any;
  return data.choices?.[0]?.message?.content || "";
}

// ---- Report Generation ----

/**
 * Personality Pattern Blueprint
 * 4 sections: Archetype ID → Life Dimensions → Behavioral Dynamics → Growth Path
 */
export async function generateSelfDiscoveryReport(
  input: SelfDiscoveryInput
): Promise<string[]> {
  const userMessage = `Generate a Personality Pattern Blueprint for:
Name: ${input.name}
Birth Date: ${input.birthDate}
Birth Time: ${input.birthTime || "unknown"}
Birth Place: ${input.birthPlace}

First, identify this person's 2-3 dominant archetypes from the framework and explain WHY these fit (be specific — reference their birth details).

Then, analyze these 4 life dimensions in depth:
1. Core Self & Work Orientation — combined analysis of who they are and how they work
2. Partnership Style & Social Dynamics — combined analysis of their relationship patterns
3. Resource Approach & Inner World — how they handle resources and what fulfills them
4. Body-Mind Connection & Growth Edge — their wellbeing patterns and key growth opportunity

For each dimension, identify which Behavioral Dynamics (Flow/Drive/Expression/Growth Edge) are most active.

End with: "Your primary archetypes are [X] and [Y]. Your current life season suggests focusing on [Z]."

Make it personal. Use their name. Reference their birth date patterns to show this is tailored.`;

  const text = await callAI(userMessage);
  return splitSections(text);
}

/**
 * Relationship Dynamics Map
 * 5 sections inspired by compatibility analysis frameworks
 */
export async function generateRelationshipReport(
  input: RelationshipInput
): Promise<string[]> {
  const userMessage = `Generate a Relationship Dynamics analysis for:
Person 1: ${input.name1}, born ${input.birthDate1}, ${input.birthTime1 || "unknown time"}, ${input.birthPlace1}
Person 2: ${input.name2}, born ${input.birthDate2}, ${input.birthTime2 || "unknown time"}, ${input.birthPlace2}

First, identify each person's 1-2 dominant archetypes and describe how these archetypes interact — where they complement and where they create friction.

Then analyze these 5 dimensions:
1. 【Understanding Each Other】— Communication styles, emotional languages, how each expresses and receives care. What does ${input.name1} need to hear from ${input.name2}, and vice versa?
2. 【Strengths Together】— Combined strengths, complementary blind spots, what types of challenges they handle best as a team.
3. 【Growth Areas】— Potential friction points, their root causes (not blame), how to transform friction into deeper understanding.
4. 【Building Trust】— What each person needs to feel psychologically safe. Daily practices that build lasting trust. Early warning signs when trust is eroding.
5. 【Your Journey Together】— Current relationship phase, next growth milestone, specific actionable advice for both people.

End with a note: "Every relationship is a dynamic system. This analysis reflects likely patterns based on your individual configurations. Real relationships grow through conscious choice, not predetermined paths."

Make it specific to these two people. Reference their details. Be warm, constructive, and never judgmental.`;

  const text = await callAI(userMessage);
  return splitSections(text);
}

/**
 * Generic compliant product reports for the Web MVP.
 * Used for Mood, Work, Body-Mind, and Dream Journal products.
 */
export async function generateProductReport(
  input: ProductReportInput
): Promise<string[]> {
  if (!MOONSHOT_API_KEY) {
    return splitSections(generateFallbackProductReport(input));
  }

  const spec = getProductSpec(input.reportType);
  const answerSummary = (input.answers || [])
    .slice(0, 32)
    .map((answer, index) => `${index + 1}. ${answer.question} — ${answer.score}/5`)
    .join("\n");
  const structuredProfile = buildStructuredProfile(input);
  const userMessage = `Generate a ${spec.title} for:
Nickname: ${input.name || "Private Guest"}
Gender style: ${input.gender || "not provided"}
Market context: GCC users in Saudi Arabia, United Arab Emirates, or Qatar
Main Focus: ${input.focus || "emotional growth"}
Private note: ${input.relationshipContext || "not provided"}
Questionnaire signals:
${answerSummary || "not provided"}

Structured matching profile. Treat this as the source of truth for personalization:
${structuredProfile.promptBlock}

This is a premium private AI emotional growth report for high-consumption GCC users.
Core pain theme: material comfort can coexist with emotional emptiness, restrained expression, unseen emotional needs, private loneliness, and a search for inner richness.
Positioning: premium self-awareness and emotional regulation reference. Not entertainment, not diagnosis, not religious guidance.

Required sections:
${spec.sections.map((section, index) => `${index + 1}. 【${section}】`).join("\n")}

Write 190-260 words per section.
Use culturally respectful GCC language: family-aware, modest, emotionally precise, premium, calm, non-judgmental.
Adapt tone by gender:
- male: steady, restrained, respectful, action-oriented, acknowledging responsibility and unspoken pressure.
- female: warm, emotionally receptive, validating, self-acceptance oriented, acknowledging care burden and unseen needs.
Every section must include:
- a conclusion beginning with "Your state may lean toward..." or "In this kind of situation, you may tend to..."
- 1-2 GCC-relevant scenes selected from the matched scene atoms when relevant
- concrete behavior signals that map to the questionnaire tags
- one practical self-growth or emotional regulation suggestion
- one light theory support sentence using the provided theory support tags, without academic jargon
Avoid generic "wellness" filler. Make the user feel privately understood without over-intimacy.
Do not invent unrelated scenarios. If no direct scene fits a section, adapt the closest matched scene while keeping the same tags.
Do not provide diagnosis, religious guidance, psychotherapy, or major life decisions.
Do not mention birth dates, stars, cards, mystical systems, fate, or future outcomes.
If the user describes distress, include a gentle support note and suggest licensed help for serious situations.
The final section must be 【Core Theory Support】 with 3-5 concise theory supports drawn only from the theory support tags above.
End with: "This content is for self-growth and emotional regulation reference only. It is not medical diagnosis, religious guidance, or professional psychotherapy advice."`;

  const text = await callAI(userMessage);
  return splitSections(text);
}

export async function generateCompanionResponse(input: {
  message: string;
  reportType?: string;
  reportTitle?: string;
  sectionSummary?: string;
  turn?: number;
}): Promise<string> {
  if (!MOONSHOT_API_KEY) {
    return generateFallbackCompanionResponse(input.message, input.turn || 1);
  }

  const prompt = `You are a premium AI emotional companion attached to a paid GCC self-growth report.

Report: ${input.reportTitle || input.reportType || "emotional growth report"}
Report context:
${input.sectionSummary || "not provided"}
Likely GCC scene anchors for this report type:
${getCompanionScenarioPrompt(input.reportType)}
Turn: ${input.turn || 1}/8
User says: "${input.message}"

Respond in 110-170 words.
Style: private, calm, high-end, emotionally precise, culturally respectful, non-judgmental.
Core function: help the user feel seen around restrained emotion, inner emptiness, hidden needs, relationship absence, and building inner richness.
Use this response arc:
1. Name the emotion beneath the words.
2. Anchor it to one realistic GCC life scene from the likely scene anchors or report context.
3. Normalize without making it small.
4. Reflect one hidden need.
5. Offer one gentle action for the next 24 hours, grounded in self-compassion, emotional labeling, attachment security, or meaning-building.
Do not use religious guidance, diagnosis, therapy claims, future prediction, mystical language, or over-intimate language.
Do not say "you should"; prefer "you may try", "it may help", "one gentle step".
If the user appears at risk of harm, recommend local emergency services or a licensed professional.`;

  return callAI(prompt);
}

/**
 * Wellness Chat
 * Open-ended AI dialogue with pattern-aware responses
 */
export async function generateChatResponse(
  userMessage: string,
  conversationHistory: string[]
): Promise<string> {
  if (!MOONSHOT_API_KEY) {
    return generateFallbackChatResponse(userMessage);
  }

  const historyContext = conversationHistory.length > 0
    ? `Previous conversation:\n${conversationHistory.slice(-6).join("\n")}\n\n`
    : "";

  const prompt = `${historyContext}User says: "${userMessage}"

Respond as a warm, professional psychological wellness guide.
- Keep it under 250 words
- Be supportive but honestly constructive
- Reference personality patterns when relevant
- If the user seems distressed, gently remind them this is not a crisis service
- Never predict the future
- Frame everything as "understanding patterns" not "knowing what will happen"`;

  return callAI(prompt);
}

// ---- Helpers ----

function splitSections(text: string): string[] {
  const sections = text.split(/(?=【)/);
  return sections.filter((s) => s.trim().length > 10);
}

function buildStructuredProfile(input: ProductReportInput) {
  const answers = input.answers || [];
  const scores = new Map<SignalTag, number>();
  for (const rule of SIGNAL_RULES) scores.set(rule.tag, 0);

  for (const answer of answers) {
    const text = answer.question.toLowerCase();
    for (const rule of SIGNAL_RULES) {
      if (rule.keywords.some((keyword) => text.includes(keyword))) {
        scores.set(rule.tag, (scores.get(rule.tag) || 0) + Number(answer.score || 0));
      }
    }
  }

  const topSignals = [...scores.entries()]
    .sort((a, b) => b[1] - a[1])
    .filter(([, score]) => score > 0)
    .slice(0, 4)
    .map(([tag]) => tag);

  const avg = answers.length
    ? answers.reduce((sum, answer) => sum + Number(answer.score || 0), 0) / answers.length
    : 3;
  const intensity = avg >= 4 ? "strong" : avg >= 2.8 ? "moderate" : "light";
  const gender = input.gender === "male" ? "male" : "female";
  const allScenes = [
    ...(SCENE_LIBRARY[input.reportType].all || []),
    ...SCENE_LIBRARY[input.reportType][gender],
  ];

  const matchedScenes = allScenes
    .map((scene) => ({
      scene,
      score: scene.signals.reduce((sum, signal) => sum + (topSignals.includes(signal) ? 1 : 0), 0),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)
    .map(({ scene }) => scene);

  const theoryTags = [...new Set([
    ...REPORT_THEORIES[input.reportType],
    ...matchedScenes.flatMap((scene) => scene.theory),
  ])].slice(0, 6);

  return {
    gender,
    intensity,
    topSignals: topSignals.length ? topSignals : ["inner-emptiness", "restrained-emotion"],
    matchedScenes,
    theoryTags,
    promptBlock: [
      `Attribute tags: gender=${gender}, intensity=${intensity}, report=${input.reportType}`,
      `Signal tags from questionnaire: ${(topSignals.length ? topSignals : ["inner-emptiness", "restrained-emotion"]).join(", ")}`,
      "Matched GCC scene atoms:",
      ...matchedScenes.map((scene, index) => `${index + 1}. ${scene.label}: ${scene.scenario} Suggested action: ${scene.suggestion}`),
      "Theory support tags:",
      ...theoryTags.map((tag) => `- ${THEORY_NOTES[tag]}`),
    ].join("\n"),
  };
}

function getCompanionScenarioPrompt(reportType?: string) {
  const safeType = (reportType && reportType in SCENE_LIBRARY ? reportType : "emotional-depth") as ProductReportType;
  const scenes = [
    ...(SCENE_LIBRARY[safeType].all || []),
    ...SCENE_LIBRARY[safeType].male.slice(0, 1),
    ...SCENE_LIBRARY[safeType].female.slice(0, 1),
  ].slice(0, 3);
  return scenes.map((scene) => `- ${scene.label}: ${scene.scenario}`).join("\n");
}

function renderTheorySupport(reportType: ProductReportType): string {
  const theoryLines = REPORT_THEORIES[reportType]
    .map((tag) => `- ${THEORY_NOTES[tag]}`)
    .join("\n");
  return `【Core Theory Support】
This report is grounded in self-growth and emotional regulation frameworks, translated into everyday GCC scenarios rather than technical academic language.
${theoryLines}

These theories are used as reflective support only. They do not create a clinical diagnosis, religious guidance, or professional psychotherapy advice.`;
}

function getProductSpec(reportType: ProductReportType) {
  const specs: Record<ProductReportType, { title: string; sections: string[] }> = {
    "emotional-depth": {
      title: "Deep Emotional State Assessment",
      sections: ["Visible Composure vs. Private Weight", "Emotional Fulfillment Score", "Hidden Emptiness Source", "Body-Mind Impact", "Unspoken Need Pattern", "21-Day Inner Richness Manual", "Private Companion Opening"],
    },
    "dream-emotion": {
      title: "Dream Emotional Mapping",
      sections: ["Dream Emotion Surface", "Unprocessed Feeling Signal", "Hidden Emotional Need", "Current Life Mirror", "Grounded Reflection Prompts", "Emotional Regulation Plan", "Private Companion Opening"],
    },
    "career-meaning": {
      title: "Career Value & Inner Meaning Analysis",
      sections: ["Achievement and Emptiness Map", "Work Value Pattern", "Meaning Gap", "Inner Worth Beyond Performance", "Role and Family Pressure Balance", "30-Day Value-Building Plan", "Private Companion Opening"],
    },
    "body-emotion-balance": {
      title: "Body-Mind Emotional Balance Review",
      sections: ["Depletion Level", "Emotional Energy Leakage", "Fatigue and Inner Emptiness Link", "Boundary and Recovery Pattern", "Body-Mind Reset Plan", "Gentle Emotional Repair Manual", "Private Companion Opening"],
    },
    "inner-richness-personality": {
      title: "Inner Richness Personality Portrait",
      sections: ["10-Dimension Personality Snapshot", "Deep Emotional Need Root", "Inner Emptiness Core Cause", "Relationship and Social Pattern", "Self-Acceptance Path", "Personal Growth Action Map", "Private Companion Opening"],
    },
    "relationship-emotional-growth": {
      title: "Intimate Relationship Emotional Care Analysis",
      sections: ["Attachment and Safety Pattern", "Emotional Fulfillment Level", "Emotional Absence Source", "Communication and Care Style", "Healthy Closeness Guide", "Long-Term Relationship Enrichment Manual", "Private Companion Opening"],
    },
  };
  return specs[reportType];
}

/**
 * Fallback report when no AI API key is configured.
 * Includes the disclaimer required for Middle East compliance.
 */
function generateFallbackReport(userMessage: string): string {
  const hasPartner = userMessage.includes("Person 2:");
  if (hasPartner) {
    return `【Understanding Each Other】
${userMessage.includes("Person 1:") ? userMessage.match(/Person 1: ([^,]+)/)?.[1] || "Person A" : "Person A"} and ${userMessage.match(/Person 2: ([^,]+)/)?.[1] || "Person B"} likely have complementary communication styles. One may express care through actions and problem-solving, while the other may seek verbal affirmation and emotional expression. Recognizing these different "languages" is the foundation of mutual understanding.

【Strengths Together】
The combination of their respective patterns creates a balanced dynamic where each person's strengths fill the other's gaps. This is not about one being "better" — it's about two different operating systems learning to interface effectively.

【Growth Areas】
Every relationship surfaces growth opportunities. The key is not avoiding friction but building a shared mechanism for working through it. Regular check-ins — asking "Where did you feel understood lately? Where did you feel disconnected?" — can transform patterns of misunderstanding into patterns of deeper connection.

【Building Trust】
Psychological safety comes from consistent, small actions over time — not grand gestures. Each person may need different things to feel secure: one may need verbal reassurance, the other may need demonstrated reliability. Learning and honoring these differences is the daily practice of trust.

【Your Journey Together】
Relationships evolve through phases. The current phase involves building deeper understanding of each other's patterns. Over time, shared rituals and mutual awareness create a foundation that weathers challenges.

---
⚠️ DISCLAIMER: This is an automated self-reflection tool based on pattern analysis. It is not a clinical assessment and not a substitute for professional relationship counseling. Your birth data is processed momentarily and never stored.`;
  }

  return `【Your Core Pattern】
Based on the birth information provided, your personality configuration shows traits aligned with 2-3 primary archetypes from our framework. These archetypes represent behavioral tendencies — not fixed labels, but starting points for self-understanding.

【Work & Resource Patterns】
Your natural work style likely reflects a balance between structured execution and adaptive creativity. You may find that you're most productive in environments that give you autonomy while providing clear expectations. Resource-wise, you tend toward a building approach — preferring steady accumulation over quick gains.

【Connection Patterns】
In relationships, you likely express care through tangible actions rather than verbal declarations. You value authenticity and may take time to fully open up to new people — this isn't coldness, but a healthy boundary-setting pattern. People with similar configurations often find that their most fulfilling connections develop gradually, built on demonstrated trust rather than instant chemistry.

【Growth & Wellbeing】
Your current life configuration suggests a growth edge around balancing drive with rest. You may tend to override your body's fatigue signals, especially when engaged in meaningful work. The most impactful wellbeing practice for you is likely developing a steady daily rhythm — consistent sleep, meal, and movement times — rather than periodic extreme wellness sprints.

---
⚠️ DISCLAIMER: This is an automated self-reflection tool based on pattern analysis. It is not a clinical diagnosis and not a substitute for professional mental health support. Your birth data is processed momentarily and never stored.`;
}

function generateFallbackChatResponse(userMessage: string): string {
  const lower = userMessage.toLowerCase();
  const focus = lower.includes("work") || lower.includes("job") || lower.includes("career")
    ? "work pressure"
    : lower.includes("relationship") || lower.includes("partner") || lower.includes("family")
      ? "relationship stress"
      : lower.includes("anxious") || lower.includes("anxiety") || lower.includes("stress")
        ? "anxious feelings"
        : "what you are carrying right now";

  return `It makes sense that ${focus} would feel heavy, especially when your mind is trying to solve everything at once.

A useful first step is to separate the pattern into three parts:

1. What happened: the concrete situation, without interpretation.
2. What it triggered: the feeling, body signal, or recurring thought.
3. What you need next: reassurance, clarity, rest, a boundary, or one practical action.

For the next 10 minutes, try choosing only one small action instead of solving the whole situation. You might write one honest sentence about what you need, take a short walk, or send a simple clarification message.

This is a self-reflection tool, not a clinical diagnosis. If you feel at risk of harming yourself or unable to stay safe, please contact local emergency support or a licensed professional immediately.`;
}

function generateFallbackProductReport(input: ProductReportInput): string {
  const name = input.name || "Private Guest";
  const focus = input.focus || "your current situation";
  const genderTone = input.gender === "male"
    ? "Your pattern may carry a strong sense of responsibility, with feelings held privately until they become heavy."
    : "Your pattern may carry a quiet wish to be emotionally seen without having to explain every need.";
  const scenarioTone = input.gender === "male"
    ? "In a GCC context, this can look like being reliable for family, work, and social expectations while leaving very little room to admit emotional tiredness."
    : "In a GCC context, this can look like staying graceful, helpful, and emotionally available while your own needs remain unnamed.";
  const fallbackByType: Record<ProductReportType, string> = {
    "emotional-depth": `【Visible Composure vs. Private Weight】
${name}, your answers suggest a composed outer state with a quieter inner heaviness. ${genderTone} ${scenarioTone} This does not mean your life is lacking; it suggests your emotional world may need more space than it currently receives. The first layer of the pattern is a gap between how stable life appears and how emotionally nourished it feels.

A useful reflection for this section is simple: when you say "I am fine," what feeling is being protected underneath? Do not force a dramatic answer. The most honest signal may be small: a tired pause, a wish to be asked more gently, or a need to stop performing strength for a moment.

【Emotional Fulfillment Score】
Your emotional fulfillment appears moderate but uneven. You may be functioning well, meeting duties, and still missing a steady feeling of being understood. The gap is not dramatic on the surface, which can make it harder to explain. This is why the emptiness can feel confusing: nothing obvious may be "wrong," yet something important is not being emotionally received.

For the next week, track three moments: when you felt seen, when you felt useful but not emotionally met, and when you wanted quiet instead of more conversation. This gives the feeling a shape without turning it into a problem.

【Hidden Emptiness Source】
The emptiness may come from restrained expression, limited emotional receiving, and a habit of handling private needs alone. The core need is not more achievement; it is more honest inner contact. A polished life can still become emotionally dry when care is mostly expressed through duty, performance, or practical help, while tenderness and listening remain rare.

One gentle practice is to name the need before naming the person. Instead of "they never understand me," try "I need steadier warmth," "I need more emotional presence," or "I need space where I do not have to be impressive."

【Body-Mind Impact】
When emotional needs stay unnamed, the body may carry the pressure through fatigue, tension, impatience, or difficulty resting. These are reflection signals, not medical conclusions. The body often becomes the messenger when a person has learned to keep composure in public and delay emotional expression in private.

For 24 hours, notice one body signal without judging it: tight shoulders, shallow breathing, heaviness, restlessness, or a need for silence. Ask, "What emotional load might this signal be carrying?"

【Unspoken Need Pattern】
You may need reassurance, warmth, and emotional presence delivered consistently, not through intense gestures. Naming this need privately is the first step toward inner richness. The pattern is not about wanting too much; it may be about wanting something simple but emotionally specific.

Try writing one sentence that starts with: "I feel most emotionally settled when..." This turns a vague emptiness into a clearer emotional language.

【21-Day Inner Richness Manual】
For 21 days, write one sentence each evening: "Today I needed..." Then choose one small act of care that does not depend on another person. Rotate between three practices: one private honesty practice, one body-calming practice, and one meaningful connection practice. Keep the ritual small enough to finish even on a busy day.

Inner richness is built through repetition, not intensity. The point is to teach your inner life that it has a place to return to.

【Private Companion Opening】
Your companion flow can begin by naming the feeling you usually hide because it seems too quiet, too hard to justify, or too personal to explain. A strong opening prompt would be: "The feeling I rarely say out loud is..." The companion will help you stay with that feeling calmly and turn it into one small next step.

This content is for self-growth and emotional regulation reference only. It is not medical diagnosis, religious guidance, or professional psychotherapy advice.`,

    "dream-emotion": `【Dream Emotion Surface】
${name}, the dream note should be treated as an emotional reflection, not as a sign or certainty. It may point toward feelings your waking life has not had enough room to organize.

【Unprocessed Feeling Signal】
The strongest signal appears to be emotional residue: something felt, delayed, or carried quietly. ${genderTone} The dream becomes useful only when translated into ordinary feelings and present-life needs.

【Hidden Emotional Need】
The underlying need may be safety, rest, tenderness, recognition, or a clearer boundary. Rather than asking what the dream means, ask what feeling it left behind.

【Current Life Mirror】
This reflection may mirror a current situation where you seem calm but internally unresolved. The value is not mystery; the value is giving language to a private emotional state.

【Grounded Reflection Prompts】
Write three lines: what happened in the dream, what feeling remained, and where that feeling appears in current life. Keep the answer simple and grounded.

【Emotional Regulation Plan】
Before sleep for seven nights, reduce emotional input, write one unfinished feeling, and choose one calming practice such as slow breathing or quiet reading.

【Private Companion Opening】
The companion can help you describe the dream feeling without turning it into certainty or pressure.

This content is for self-growth and emotional regulation reference only. It is not medical diagnosis, religious guidance, or professional psychotherapy advice.`,

    "career-meaning": `【Achievement and Emptiness Map】
${name}, your work pattern suggests achievement may be present, but inner nourishment may not always follow. ${genderTone} ${scenarioTone} This is common when responsibility grows faster than emotional meaning. The visible story may be progress, competence, and respect; the private story may be a question you rarely say clearly: "Why does this still not feel enough?"

This section is not saying your success is empty. It is saying success may need to be connected to a more personal source of meaning before it becomes emotionally nourishing.

【Work Value Pattern】
You may value excellence, respect, and visible competence. These can bring stability, but they may not fully answer the quieter question: "Does this still feel like me?" In GCC professional and family settings, work can also carry identity, duty, and reputation. That makes it powerful, but also emotionally heavy when your inner values are not being fed.

A useful signal: notice whether work leaves you tired but proud, or tired and emotionally flat. The second pattern points to a meaning gap.

【Meaning Gap】
The meaning gap appears when work delivers results but does not create emotional renewal. This gap is not laziness; it is a signal that your inner values need more active space. You may be doing what is expected, what is respected, or what is profitable, while postponing the quieter work of asking what feels personally alive.

For one week, separate "valuable to others" from "valuable to me." Both matter. The goal is not to reject responsibility, but to stop letting responsibility become your only emotional identity.

【Inner Worth Beyond Performance】
Your worth may need to be felt outside output, status, or being useful. A richer inner life starts when rest, relationships, and personal values become part of identity too. If you only meet yourself through performance, quiet moments may feel uncomfortable because they do not give you a role to play.

Try choosing one non-performance identity this week: learner, family presence, calm friend, body caretaker, creative observer, or values-led person who makes room for reflection.

【Role and Family Pressure Balance】
In a GCC context, family expectations and social role can be important. The goal is not rejection of duty, but a healthier balance between responsibility and emotional truth. You can honor family and still need a private space where your feelings are not only measured by usefulness.

One practical sentence to try privately: "I can be responsible without disappearing." Let that guide one boundary around work, availability, or emotional labor this week.

【30-Day Value-Building Plan】
Choose one non-performance value each week: presence, learning, quiet, generosity, or health. Build one small ritual around it and track how your energy changes. Week 1: notice what drains meaning. Week 2: restore one source of personal interest. Week 3: protect one boundary. Week 4: choose one relationship or activity that makes life feel less transactional.

This is not a dramatic reset. It is a steady return to inner authorship.

【Private Companion Opening】
Your companion flow can explore the difference between success that looks impressive and meaning that feels personally alive. Begin with: "The part of success that no longer nourishes me is..." The companion will help you name one small adjustment rather than pressuring you to change everything.

This content is for self-growth and emotional regulation reference only. It is not medical diagnosis, religious guidance, or professional psychotherapy advice.`,

    "body-emotion-balance": `【Depletion Level】
${name}, your pattern suggests emotional depletion may be showing through the body: tiredness, low patience, restless sleep, or difficulty fully switching off. This is a reflection signal, not a diagnosis.

【Emotional Energy Leakage】
Energy may be leaking through unspoken needs, over-control, constant availability, or holding composure for too long. ${genderTone} The body may ask for softness before the mind allows it.

【Fatigue and Inner Emptiness Link】
Fatigue can deepen when life is busy but emotionally undernourishing. The issue may not be only workload; it may be a lack of replenishing emotional contact.

【Boundary and Recovery Pattern】
You may recover best through predictable boundaries, fewer late-night decisions, and a private routine that signals safety to the nervous system.

【Body-Mind Reset Plan】
For seven days, protect one quiet window each day. No performance, no proving, no emotional labor for others. Let the body experience permission to return to itself.

【Gentle Emotional Repair Manual】
Name what was carried today, where it appeared in the body, and what kind of care would be enough for tonight.

【Private Companion Opening】
Your companion can help separate physical tiredness from emotional carrying, gently and without pressure.

This content is for self-growth and emotional regulation reference only. It is not medical diagnosis, religious guidance, or professional psychotherapy advice.`,

    "inner-richness-personality": `【10-Dimension Personality Snapshot】
${name}, your personality pattern suggests depth, privacy, loyalty, and a careful relationship with emotional exposure. You may show strength publicly while protecting the softer parts of yourself.

【Deep Emotional Need Root】
${genderTone} The root need may be to feel valued beyond usefulness, appearance, success, or composure. This need is quiet but important.

【Inner Emptiness Core Cause】
The emptiness may come from a gap between external identity and internal experience. People may see your function, role, or elegance before they see your emotional reality.

【Relationship and Social Pattern】
You may prefer selective closeness over constant social access. When trust feels inconsistent, you may withdraw instead of asking directly for care.

【Self-Acceptance Path】
Inner richness begins when you stop treating emotional need as weakness. Need can be information, and information can become wise action.

【Personal Growth Action Map】
For the next month, build three practices: one for self-honesty, one for emotional receiving, and one for meaningful solitude that does not become isolation.

【Private Companion Opening】
Your companion can help you speak to the part of you that performs well but still wants to feel deeply met.

This content is for self-growth and emotional regulation reference only. It is not medical diagnosis, religious guidance, or professional psychotherapy advice.`,

    "relationship-emotional-growth": `【Attachment and Safety Pattern】
${name}, your relationship pattern suggests emotional safety is central. You may not need constant intensity; you may need steady warmth, attention, and repair after distance. ${genderTone} ${scenarioTone} The core issue may not be whether care exists, but whether care reaches you in a language your inner world can actually receive.

In a close relationship, emotional safety often comes from small repeated signals: being remembered, being listened to without correction, being checked on without having to perform distress first.

【Emotional Fulfillment Level】
The relationship theme around ${focus} may feel incomplete because presence is not the same as emotional receiving. Being close in daily life may still leave a private ache when conversations stay practical, affection is assumed but not expressed, or tension is repaired too late.

Your fulfillment level appears sensitive to emotional consistency. This means one warm moment may help, but the deeper need is steadiness: attention, tone, small repair, and a sense that your feelings do not have to become dramatic before they matter.

【Emotional Absence Source】
The absence may come from unspoken expectations, restrained tenderness, different care languages, or a habit of proving loyalty through duty instead of open emotional presence. In many GCC relationship contexts, responsibility and respect can be strong, while emotional naming remains more restrained. This can create a relationship that functions well but feels undernourishing inside.

The important distinction: emotional absence does not always mean lack of care. Sometimes it means care is being delivered in a form that does not fully reach the emotional need.

【Communication and Care Style】
You may benefit from calm, specific language: "I feel distant when..." and "I feel cared for when..." This keeps the conversation respectful and grounded. Avoid opening with accusation; open with the emotional signal. For example: "When we only discuss tasks, I start to feel far from you," or "I feel more settled when you check on me before I ask."

The aim is not to demand a personality change. The aim is to make the emotional need visible enough to be cared for.

【Healthy Closeness Guide】
Healthy closeness grows through small consistent acts: listening without correction, checking in before conflict builds, and naming needs without blame. One weekly ritual may be enough to begin: ten quiet minutes with one question, "What felt heavy this week, and what helped you feel supported?"

For men, this may translate into action plus emotional words. For women, it may translate into validation before problem-solving. The shared principle is the same: care needs to become emotionally legible.

【Long-Term Relationship Enrichment Manual】
Create one weekly ritual for emotional presence: a quiet walk, a short check-in, or one question about what felt heavy and what felt supportive. Track three things for 30 days: when closeness increases, when distance appears, and what repair action works best.

Do not measure the relationship only by conflict. Measure it by repair, emotional warmth, and whether both people have room to speak without losing dignity.

【Private Companion Opening】
Your companion can help you name the need beneath the hurt before deciding what to say or do. Begin with: "What I wish could be understood without conflict is..." The companion will help you turn that sentence into a calm emotional language that respects both your heart and the relationship.

This content is for self-growth and emotional regulation reference only. It is not medical diagnosis, religious guidance, or professional psychotherapy advice.`,
  };

  return `${fallbackByType[input.reportType]}

${renderTheorySupport(input.reportType)}`;
}

function generateFallbackCompanionResponse(message: string, turn: number): string {
  const opening = turn <= 1
    ? "I understand the quiet weight in what you wrote."
    : "There is a steady emotional thread here, and it deserves to be heard without pressure.";

  return `${opening} You may have learned to carry certain feelings privately because they are difficult to explain in a life that looks composed from the outside. That does not make the feeling excessive; it may simply be under-witnessed.

For this turn, try naming one layer only: what feels empty, what feels over-carried, or what kind of emotional presence would feel relieving. A gentle next step may be to write one honest sentence beginning with: "What I have not said clearly is..."`;
}
