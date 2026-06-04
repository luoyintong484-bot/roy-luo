/* ============================================================
   R7 Fortune — Synastry AI Report Generator

   Splits the 6-chapter synastry report into 6 separate AI calls.
   Each call uses ONLY compact preprocessed conclusions — raw
   chart data is stored locally and NEVER sent to the AI.

   Token limits (Kimi platform, ~1M context model):
   - Input  ≤ 990,000 tokens per call
   - Output ≤  32,000 tokens per call
   - Total  ≤ 1,022,000 (< 1,048,565 platform limit)
   ============================================================ */

import { env } from "./env";
import type { CompactPreprocessResult } from "./synastry-preprocess";

// ---- Constants ----
const CHAPTERS = [
  { key: "core_attraction",   icon: "💫", zh: "核心吸引力",       en: "Core Attraction" },
  { key: "daily_interaction", icon: "🏠", zh: "日常相處模式",     en: "Daily Interaction Pattern" },
  { key: "core_conflict",     icon: "⚡", zh: "核心矛盾與課題",   en: "Core Conflicts & Lessons" },
  { key: "destiny_analysis",  icon: "🌙", zh: "緣分深度解析",     en: "Destiny Depth Analysis" },
  { key: "key_cautions",      icon: "⚠️", zh: "關鍵注意事項",     en: "Key Cautions" },
  { key: "long_term_advice",  icon: "🔮", zh: "長期發展建議",     en: "Long-Term Development Advice" },
] as const;

const MAX_INPUT_TOKENS = 990_000;
const MAX_OUTPUT_TOKENS = 32_000;
// Total: 1,022,000 < 1,048,565 platform limit

// ---- Token Estimation ----
// Conservative char→token estimate for Kimi/Moonshot BPE tokenizer.
// Chinese chars ≈ 0.7–1.0 tokens; English ≈ 0.25 tokens/char.
// We use a safe upper-bound estimate to guarantee we stay under limits.
function estimateTokens(text: string): number {
  let tokens = 0;
  for (const char of text) {
    const code = char.charCodeAt(0);
    if (code >= 0x4E00 && code <= 0x9FFF) {
      // CJK Unified Ideograph — ~0.8 tokens each, use 1.0 for safety
      tokens += 1;
    } else if (code >= 0x3000 && code <= 0x303F) {
      // CJK punctuation — ~0.5 tokens
      tokens += 0.5;
    } else if (char === ' ' || char === '\n') {
      tokens += 0.25;
    } else {
      // ASCII / Latin / numbers — ~0.25 tokens each
      tokens += 0.3;
    }
  }
  return Math.ceil(tokens);
}

// ---- Chapter Prompts ----
function buildChapterPrompt(
  chapter: typeof CHAPTERS[number],
  data: CompactPreprocessResult,
  locale: "zh-TW" | "en",
): { systemPrompt: string; userPrompt: string } {
  const isZh = locale === "zh-TW";

  // Build compact data block (kept minimal for token efficiency)
  const dataBlock = buildCompactDataBlock(data, locale);

  // Chapter-specific instructions
  const chapterInstructions = getChapterInstructions(chapter, locale);

  const systemPrompt = isZh
    ? `你是 R7 Fortune 的资深合盘占星师，精通八字命理、西方占星合盘（Synastry）、二十八星宿体系及印度占星（Vedic Astrology）。你撰写的合盘报告风格温暖、具有洞察力，不堆砌术语，而是用富有画面感的语言帮助用户理解关系中的能量流动。报告使用【小标题】标记关键段落标题。

重要规则：
1. 只输出当前章节内容，不要输出其他章节
2. 使用用户选择的语言（繁體中文或英文）
3. 使用【】标记段落小标题（如【吸引力來源】）
4. 段落之间用空行分隔
5. 文风要有深度但不晦涩，像一位智慧的朋友在为你解读
6. 不输出章节标题（如「核心吸引力」），只输出章节正文内容`
    : `You are R7 Fortune's senior synastry astrologer, expert in Bazi, Western Synastry, 28 Star Mansions, and Vedic Astrology. Your reports are warm, insightful, and use vivid language to help users understand relational energy dynamics. Use 【subheadings】 to mark key section titles.

Important rules:
1. Only output the current chapter's content — nothing from other chapters
2. Use the user's language (English or Traditional Chinese)
3. Use 【】 for sub-headings (e.g. 【Attraction Source】)
4. Separate paragraphs with blank lines
5. Deep but accessible prose — like a wise friend interpreting for you
6. Do NOT output chapter title (e.g. "Core Attraction") — only the body content`;

  const userPrompt = isZh
    ? `${dataBlock}

---
章节：${chapter.zh} ${chapter.icon}
语言：繁體中文

${chapterInstructions}

请以上述数据为基础，撰写本章节的合盘报告内容。直接输出正文，不要包含章节标题。`
    : `${dataBlock}

---
Chapter: ${chapter.en} ${chapter.icon}
Language: English

${chapterInstructions}

Based on the above data, write this chapter's synastry report. Output body content directly without the chapter title.`;

  return { systemPrompt, userPrompt };
}

function buildCompactDataBlock(data: CompactPreprocessResult, locale: "zh-TW" | "en"): string {
  const isZh = locale === "zh-TW" || true;
  const p1 = data.person1;
  const p2 = data.person2;

  if (isZh) {
    return `## 合盘数据摘要
- 甲方：${p1.name}｜${p1.zodiac}｜元素${p1.element}｜日柱${p1.dayPillar}｜${p1.mansion}
- 乙方：${p2.name}｜${p2.zodiac}｜元素${p2.element}｜日柱${p2.dayPillar}｜${p2.mansion}

### 八字五行
${data.bazi.relation}（评分${data.bazi.score}/100）
${data.bazi.complement}

### 西方合盘
评分${data.synastry.score}/100｜${data.synastry.keywords.join("、")}
元素动态：${data.synastry.elementDynamic}
星座和谐度：${data.synastry.signHarmony}
关键相位：${data.synastry.keyAspect}

### 星宿关系
${data.starMansion.relation}：${data.starMansion.description}

### 印度占星
业力节点：${data.vedic.rahuKetuConnection}
第七宫：${data.vedic.seventhLordDynamic}
业力总结：${data.vedic.karmicSummary}

### 综合评分
${data.overall.score}/100｜${data.overall.label}｜${data.overall.summary}`;
  }

  return `## Synastry Data Summary
- Person A: ${p1.name} | ${p1.zodiac} | ${p1.element} | ${p1.dayPillar} | ${p1.mansion}
- Person B: ${p2.name} | ${p2.zodiac} | ${p2.element} | ${p2.dayPillar} | ${p2.mansion}

### Bazi Five Elements
${data.bazi.relation} (Score ${data.bazi.score}/100)
${data.bazi.complement}

### Western Synastry
Score ${data.synastry.score}/100 | ${data.synastry.keywords.join(", ")}
Element Dynamic: ${data.synastry.elementDynamic}
Sign Harmony: ${data.synastry.signHarmony}
Key Aspect: ${data.synastry.keyAspect}

### Star Mansion
${data.starMansion.relation}: ${data.starMansion.description}

### Vedic Astrology
Karmic Nodes: ${data.vedic.rahuKetuConnection}
7th House: ${data.vedic.seventhLordDynamic}
Karmic Summary: ${data.vedic.karmicSummary}

### Overall
${data.overall.score}/100 | ${data.overall.label} | ${data.overall.summary}`;
}

function getChapterInstructions(chapter: typeof CHAPTERS[number], locale: "zh-TW" | "en"): string {
  const isZh = locale === "zh-TW" || true;

  const instructions: Record<string, { zh: string; en: string }> = {
    core_attraction: {
      zh: `撰写「核心吸引力」章节。聚焦：两人之间最根本的吸引力来源——包括八字五行互補、星盘相位共振、以及那种「说不清的宿命感」。不需要罗列术语，而是用让读者感到共鸣的语言描述他们为什么会被彼此深深吸引。从合盘数据中提取最关键的1-2个吸引力因子来展开。`,
      en: `Write the "Core Attraction" chapter. Focus: the deepest source of attraction between them — Bazi elemental complement, synastry phase resonance, and that "inexplicable pull." Don't list terms; describe with resonant language WHY they're drawn to each other. Pick the 1-2 strongest attraction factors from the data and elaborate.`,
    },
    daily_interaction: {
      zh: `撰写「日常相处模式」章节。聚焦：两人在日常生活中的互动风格——沟通方式（水星相位揭示的）、情感表达模式（月亮星座揭示的）、日常分工的自然默契。特别注意描述双方「情感语言」的差异，以及如何理解对方的表达方式。`,
      en: `Write the "Daily Interaction Pattern" chapter. Focus: how they interact day-to-day — communication style (Mercury), emotional expression (Moon), natural默契 in daily division of labor. Pay special attention to describing the difference in their "emotional languages" and how to understand each other's expression modes.`,
    },
    core_conflict: {
      zh: `撰写「核心矛盾与课题」章节。聚焦：关系中最大的潜在摩擦点——火星相位揭示的冲突模式、土星带来的压力与责任感、以及双方需要共同面对的核心课题。给出具体的、可操作的建议（如「吵架时暂停30分钟」）。注意语气：这不是吓人，而是提醒。`,
      en: `Write the "Core Conflicts & Lessons" chapter. Focus: the biggest potential friction — Mars conflict patterns, Saturn pressure/responsibility, and the core lessons they face together. Give specific, actionable advice (e.g. "pause for 30 min during arguments"). Tone: not to scare, but to inform.`,
    },
    destiny_analysis: {
      zh: `撰写「缘分深度解析」章节。聚焦：星宿关系揭示的前世今生脉络、南北交点（罗喉/计都）的业力信号、以及正缘匹配度的判定。核心信息：他们的相遇不是偶然。描述那种「似曾相识」的感觉为什么是真实的天象信号，而非主观错觉。`,
      en: `Write the "Destiny Depth Analysis" chapter. Focus: past/present-life threads from the mansion relationship, karmic signals from Rahu/Ketu nodes, and fated-match assessment. Core message: their meeting is NOT coincidence. Describe why that "déjà vu" feeling is an objective astrological signal.`,
    },
    key_cautions: {
      zh: `撰写「关键注意事项」章节。这是整份报告中最实用的部分。包含：① 容易踩雷的具体行为（基于双方火星/月亮配置）；② 不同关系阶段（热恋期0-6月、磨合期6月-2年、稳定期2年+）的避坑指南；③ 分手风险预警信号。风格：实操性强、不说教、像朋友在提醒。`,
      en: `Write the "Key Cautions" chapter. The most practical section. Include: ① specific behaviors that trigger conflict (based on Mars/Moon configuration); ② stage-by-stage cautions (honeymoon 0-6mo, adjustment 6mo-2yr, stability 2yr+); ③ breakup red flags. Style: actionable, not preachy, like a friend warning you.`,
    },
    long_term_advice: {
      zh: `撰写「长期发展建议」章节。这是整份报告的收尾。包含：短期（1-3年）的地基期建议、中期（3-7年）的扩张期展望、长期（7年+）的成熟期描述。最后给出一个有温度的结语——强调「报告是镜子，不是剧本」，让读者感受到方向和希望。`,
      en: `Write the "Long-Term Development Advice" chapter. The report's closing. Include: short-term (1-3yr) foundation advice, medium-term (3-7yr) expansion outlook, long-term (7yr+) maturity description. End with a warm closing note — emphasize "this report is a mirror, not a script," leaving readers with direction and hope.`,
    },
  };

  return instructions[chapter.key]?.[isZh ? "zh" : "en"] || "";
}

// ---- AI API Call ----
interface ChapterResult {
  chapterKey: string;
  chapterTitle: string;
  content: string;
  inputTokens: number;
  outputTokens: number;
}

async function callAIForChapter(
  chapter: typeof CHAPTERS[number],
  data: CompactPreprocessResult,
  locale: "zh-TW" | "en",
): Promise<ChapterResult> {
  const { systemPrompt, userPrompt } = buildChapterPrompt(chapter, data, locale);

  // Estimate input tokens
  const totalInput = systemPrompt + userPrompt;
  const estimatedInputTokens = estimateTokens(totalInput);

  if (estimatedInputTokens > MAX_INPUT_TOKENS) {
    throw new Error(
      `Chapter "${chapter.zh}" input tokens (${estimatedInputTokens}) exceed limit (${MAX_INPUT_TOKENS}). ` +
      `This should not happen with preprocessed data — check data block size.`
    );
  }

  const requestBody = {
    model: "moonshot-v1-auto",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    max_tokens: MAX_OUTPUT_TOKENS,
    temperature: 0.75,
  };

  const apiUrl = `${env.kimiOpenUrl}/v1/chat/completions`;
  const apiKey = env.moonshotApiKey || env.appSecret; // fallback to app secret if no dedicated key

  if (!apiKey) {
    throw new Error("Missing Moonshot API key. Set MOONSHOT_API_KEY in .env.");
  }

  const response = await fetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify(requestBody),
    signal: AbortSignal.timeout(90_000), // 90s timeout per chapter
  });

  if (!response.ok) {
    const errorText = await response.text();
    let errorDetail: string;
    try {
      const errorJson = JSON.parse(errorText);
      errorDetail = errorJson.error?.message || errorText;
    } catch {
      errorDetail = errorText.slice(0, 500);
    }

    // Specific handling for 400 token errors
    if (response.status === 400) {
      throw new Error(
        `Kimi API 400 Error (Chapter "${chapter.zh}"): ${errorDetail}\n` +
        `Estimated input tokens: ${estimatedInputTokens}\n` +
        `Max allowed input: ${MAX_INPUT_TOKENS}\n` +
        `This should NOT happen — input is well under the limit. Check if the model supports the requested context length.`
      );
    }

    throw new Error(`Kimi API ${response.status} Error (Chapter "${chapter.zh}"): ${errorDetail}`);
  }

  const result = await response.json() as {
    choices: Array<{ message: { content: string } }>;
    usage?: { prompt_tokens: number; completion_tokens: number; total_tokens: number };
  };

  const content = result.choices?.[0]?.message?.content || "";
  const usage = result.usage;

  return {
    chapterKey: chapter.key,
    chapterTitle: locale === "zh-TW" ? chapter.zh : chapter.en,
    content,
    inputTokens: usage?.prompt_tokens || estimatedInputTokens,
    outputTokens: usage?.completion_tokens || estimateTokens(content),
  };
}

// ---- Main Export: Generate Full Report ----
export interface SynastryReportResult {
  chapters: ChapterResult[];
  totalInputTokens: number;
  totalOutputTokens: number;
  locale: string;
  generatedAt: string;
}

export async function generateSynastryReport(
  data: CompactPreprocessResult,
  locale: "zh-TW" | "en" = "zh-TW",
): Promise<SynastryReportResult> {
  const results: ChapterResult[] = [];
  let totalInputTokens = 0;
  let totalOutputTokens = 0;

  // Generate 6 chapters sequentially (one at a time to respect rate limits)
  for (const chapter of CHAPTERS) {
    const result = await callAIForChapter(chapter, data, locale);
    results.push(result);
    totalInputTokens += result.inputTokens;
    totalOutputTokens += result.outputTokens;

    // Safety check: if any single call approaches the limit, log a warning
    if (result.inputTokens + result.outputTokens > 1_000_000) {
      console.warn(
        `[synastry-ai] Chapter "${chapter.zh}" total tokens (${result.inputTokens + result.outputTokens}) ` +
        `approaching platform limit — but should still be under 1,048,565.`
      );
    }
  }

  return {
    chapters: results,
    totalInputTokens,
    totalOutputTokens,
    locale,
    generatedAt: new Date().toISOString(),
  };
}

// Export for partial regeneration (single chapter)
export async function regenerateChapter(
  chapterKey: string,
  data: CompactPreprocessResult,
  locale: "zh-TW" | "en" = "zh-TW",
): Promise<ChapterResult> {
  const chapter = CHAPTERS.find(c => c.key === chapterKey);
  if (!chapter) {
    throw new Error(`Unknown chapter key: ${chapterKey}. Valid keys: ${CHAPTERS.map(c => c.key).join(", ")}`);
  }
  return callAIForChapter(chapter, data, locale);
}

// ---- Token Utility ----
export function estimateTotalTokens(text: string): number {
  return estimateTokens(text);
}

export { CHAPTERS, MAX_INPUT_TOKENS, MAX_OUTPUT_TOKENS };
