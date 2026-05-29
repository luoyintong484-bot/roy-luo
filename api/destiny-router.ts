import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { artists } from "@db/schema";
import { eq } from "drizzle-orm";

function getZodiacSign(date: Date): string {
  const m = date.getMonth() + 1;
  const d = date.getDate();
  if ((m === 3 && d >= 21) || (m === 4 && d <= 19)) return "白羊座";
  if ((m === 4 && d >= 20) || (m === 5 && d <= 20)) return "金牛座";
  if ((m === 5 && d >= 21) || (m === 6 && d <= 21)) return "双子座";
  if ((m === 6 && d >= 22) || (m === 7 && d <= 22)) return "巨蟹座";
  if ((m === 7 && d >= 23) || (m === 8 && d <= 22)) return "狮子座";
  if ((m === 8 && d >= 23) || (m === 9 && d <= 22)) return "处女座";
  if ((m === 9 && d >= 23) || (m === 10 && d <= 23)) return "天秤座";
  if ((m === 10 && d >= 24) || (m === 11 && d <= 22)) return "天蝎座";
  if ((m === 11 && d >= 23) || (m === 12 && d <= 21)) return "射手座";
  if ((m === 12 && d >= 22) || (m === 1 && d <= 19)) return "摩羯座";
  if ((m === 1 && d >= 20) || (m === 2 && d <= 18)) return "水瓶座";
  return "双鱼座";
}

function getChineseZodiac(year: number): string {
  return ["鼠", "牛", "虎", "兔", "龙", "蛇", "马", "羊", "猴", "鸡", "狗", "猪"][(year - 4) % 12];
}

function getStarMansion(date: Date): string {
  const ms = ["角", "亢", "氐", "房", "心", "尾", "箕", "斗", "牛", "女", "虚", "危", "室", "壁", "奎", "娄", "胃", "昴", "毕", "觜", "参", "井", "鬼", "柳", "星", "张", "翼", "轸"];
  const doy = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000);
  return ms[doy % 28] + "宿";
}

function getBaziDayPillar(date: Date): string {
  const s = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"];
  const b = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];
  const base = new Date(1900, 0, 31);
  const diff = Math.floor((date.getTime() - base.getTime()) / 86400000);
  return s[(diff + 10) % 10] + b[(diff + 12) % 12];
}

function calcCompat(s1: string, s2: string): number {
  const em: Record<string, string> = {
    "白羊座": "火", "狮子座": "火", "射手座": "火",
    "金牛座": "土", "处女座": "土", "摩羯座": "土",
    "双子座": "风", "天秤座": "风", "水瓶座": "风",
    "巨蟹座": "水", "天蝎座": "水", "双鱼座": "水",
  };
  const e1 = em[s1], e2 = em[s2];
  if (!e1 || !e2) return 5;
  if (e1 === e2) return 8;
  const c: Record<string, Record<string, number>> = {
    "火": { "风": 9, "土": 6, "水": 4 },
    "土": { "水": 8, "火": 6, "风": 5 },
    "风": { "火": 9, "水": 6, "土": 5 },
    "水": { "土": 8, "风": 6, "火": 4 },
  };
  return c[e1]?.[e2] ?? 5;
}

function getMansionRel(m1: string, _m2: string): string {
  const rels: Record<string, string> = {
    "角": "平等", "亢": "荣亲", "氐": "安坏", "房": "业胎", "心": "友衰",
    "尾": "危成", "箕": "荣亲", "斗": "安坏", "牛": "业胎", "女": "友衰",
    "虚": "危成", "危": "荣亲", "室": "安坏", "壁": "业胎", "奎": "友衰",
    "娄": "危成", "胃": "荣亲", "昴": "安坏", "毕": "业胎", "觜": "友衰",
    "参": "危成", "井": "荣亲", "鬼": "安坏", "柳": "业胎", "星": "友衰",
    "张": "危成", "翼": "荣亲", "轸": "安坏",
  };
  return rels[m1.replace("宿", "")] ?? "平等";
}

const emMap: Record<string, string> = {
  "白羊座": "火", "狮子座": "火", "射手座": "火",
  "金牛座": "土", "处女座": "土", "摩羯座": "土",
  "双子座": "风", "天秤座": "风", "水瓶座": "风",
  "巨蟹座": "水", "天蝎座": "水", "双鱼座": "水",
};

export const destinyRouter = createRouter({
  natalChart: publicQuery
    .input(z.object({
      birthDate: z.string().datetime(),
      birthTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
      birthPlace: z.string().max(100).optional(),
    }))
    .mutation(async ({ input }) => {
      const date = new Date(input.birthDate);
      const zodiac = getZodiacSign(date);
      return {
        zodiacSign: zodiac,
        chineseZodiac: getChineseZodiac(date.getFullYear()),
        starMansion: getStarMansion(date),
        baziDayPillar: getBaziDayPillar(date),
        element: emMap[zodiac] || "未知",
        planets: [
          { name: "太阳", sign: zodiac, degree: Math.floor(Math.random() * 30) },
          { name: "月亮", sign: getZodiacSign(new Date(date.getTime() - 172800000)), degree: Math.floor(Math.random() * 30) },
          { name: "水星", sign: getZodiacSign(new Date(date.getTime() + 86400000)), degree: Math.floor(Math.random() * 30) },
          { name: "金星", sign: getZodiacSign(new Date(date.getTime() - 86400000)), degree: Math.floor(Math.random() * 30) },
          { name: "火星", sign: getZodiacSign(new Date(date.getTime() + 259200000)), degree: Math.floor(Math.random() * 30) },
        ],
        houses: Array.from({ length: 12 }, (_, i) => ({
          number: i + 1,
          sign: getZodiacSign(new Date(date.getTime() + i * 2592000000)),
        })),
      };
    }),

  synastry: publicQuery
    .input(z.object({
      person1: z.object({ birthDate: z.string().datetime() }),
      person2: z.object({ birthDate: z.string().datetime() }),
    }))
    .mutation(async ({ input }) => {
      const d1 = new Date(input.person1.birthDate);
      const d2 = new Date(input.person2.birthDate);
      const s1 = getZodiacSign(d1);
      const s2 = getZodiacSign(d2);
      const score = calcCompat(s1, s2);
      const m1 = getStarMansion(d1);
      const m2 = getStarMansion(d2);
      const rel = getMansionRel(m1, m2);
      return {
        score,
        maxScore: 10,
        zodiacCompatibility: s1 + " x " + s2,
        starMansionRelation: rel,
        elementCompatibility: score >= 7 ? "高度互补" : score >= 5 ? "基本和谐" : "需要磨合",
        summary: "双方星盘" + rel + "关系，缘分评分 " + score + "/10。" + s1 + "与" + s2 + "的" + (score >= 7 ? "能量高度共振" : "存在成长空间") + "。",
        fullAnalysis: "深度解读：双方星宿关系为" + rel + "，表示前世已有缘分纠缠。" + s1 + "与" + s2 + "在元素层面" + (score >= 7 ? "形成良性互补" : "需要更多包容") + "。建议在相处中多关注对方的情绪需求，特别是月亮星座所代表的内心世界。合作方面建议选择" + (score >= 7 ? "创意类" : "稳定性强的") + "项目，以发挥双方优势。",
        interactionAdvice: "互动建议：1. 关注对方月亮星座的情绪需求 2. 利用金星周期增进感情 3. 水星逆行期间多沟通",
      };
    }),

  annualFortune: publicQuery
    .input(z.object({
      birthDate: z.string().datetime(),
      birthTime: z.string().optional(),
      year: z.number().int(),
    }))
    .mutation(async ({ input }) => {
      const date = new Date(input.birthDate);
      const zodiac = getZodiacSign(date);
      const level = Math.floor(Math.random() * 5) + 1;
      const aspects = ["事业", "感情", "财运", "健康", "学业"];
      const labels = ["平稳", "上升", "旺盛", "需谨慎", "突破"];
      const aspectFortunes = aspects.map((a) => ({ aspect: a, level: Math.floor(Math.random() * 5) + 1, description: a + "运势" + labels[Math.floor(Math.random() * 5)] + "。" }));
      const stars = ["", "★", "★★", "★★★", "★★★★", "★★★★★"];
      const overallLabels = ["", "蓄势待发", "稳步前行", "机遇良多", "星光璀璨", "巅峰之年"];
      return {
        year: input.year,
        zodiacSign: zodiac,
        baziDayPillar: getBaziDayPillar(date),
        overallLevel: level,
        overallSummary: input.year + "年整体运势" + stars[level] + "，" + overallLabels[level] + "。",
        aspects: aspectFortunes,
        luckyMonths: [Math.floor(Math.random() * 12) + 1, Math.floor(Math.random() * 12) + 1],
        advice: "建议" + zodiac + "的朋友在" + input.year + "年多关注" + aspectFortunes.sort((a, b) => b.level - a.level)[0].aspect + "领域的发展机会。",
      };
    }),

  itineraryEnergy: publicQuery
    .input(z.object({
      userBirthDate: z.string().datetime(),
      eventDate: z.string().datetime(),
      eventType: z.enum(["concert", "fansign", "travel", "other"]),
    }))
    .mutation(async ({ input }) => {
      const ud = new Date(input.userBirthDate);
      const ed = new Date(input.eventDate);
      const us = getZodiacSign(ud);
      const es = getZodiacSign(ed);
      const compat = calcCompat(us, es);
      const stars = compat >= 7 ? 5 : compat >= 5 ? 4 : compat >= 4 ? 3 : 2;
      const etm: Record<string, string> = { concert: "演唱会", fansign: "签售会", travel: "旅行", other: "活动" };
      return {
        stars,
        maxStars: 5,
        compatibility: stars >= 4 ? "高度契合" : stars >= 3 ? "基本顺利" : "需要准备",
        briefTip: "此次" + etm[input.eventType] + "与你的星盘" + (stars >= 4 ? "能量高度共振" : "有成长空间") + "，建议" + (stars >= 4 ? "积极参与" : "提前做好准备") + "。",
        fullAdvice: "行程能量解读：你的" + us + "能量与" + ed.toLocaleDateString("zh-CN") + "的天象" + (stars >= 4 ? "形成有利角度" : "存在轻微张力") + "。建议：1. " + (stars >= 4 ? "选择正面方位的座位" : "提前到达现场适应气场") + " 2. " + (stars >= 4 ? "穿" + emMap[us] + "元素色系服装增强共振" : "佩戴幸运水晶稳定能量") + " 3. 关注当天月亮星座变化对情绪的影响",
      };
    }),

  fanArtistCompatibility: publicQuery
    .input(z.object({
      userBirthDate: z.string().datetime(),
      artistId: z.number().int().positive(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const result = await db.select().from(artists).where(eq(artists.id, input.artistId)).limit(1);
      const artist = result[0];
      if (!artist) throw new Error("Artist not found");

      const ud = new Date(input.userBirthDate);
      const ad = new Date(artist.birthDate);
      const us = getZodiacSign(ud);
      const as = artist.zodiacSign || getZodiacSign(ad);
      const score = calcCompat(us, as);
      const um = getStarMansion(ud);
      const am = artist.starMansion || getStarMansion(ad);
      const rel = getMansionRel(um, am);

      return {
        score,
        maxScore: 10,
        artistName: artist.stageName || artist.name,
        artistAvatar: artist.avatar,
        zodiacCompatibility: us + " x " + as,
        starMansionRelation: rel,
        summary: "你与" + (artist.stageName || artist.name) + "的星宿关系为" + rel + "，缘分评分" + score + "/10。" + (score >= 7 ? "你们的前世缘分深厚，今生的相遇绝非偶然。" : "虽然星盘存在挑战，但真诚的努力可以创造奇迹。"),
        fullAnalysis: "深度解读：作为" + us + "的你与" + as + "的" + (artist.stageName || artist.name) + "形成了独特的" + rel + "关系。这种星宿联结意味着" + (rel === "安坏" ? "你们之间存在深刻的吸引力与成长课题" : rel === "荣亲" ? "彼此有着家人般的亲切感与默契" : rel === "业胎" ? "前世因果今生续，灵魂层面深度绑定" : rel === "危成" ? "在彼此生命中扮演重要角色，互相成就" : "轻松愉快的相处模式，彼此欣赏") + "。在追星路上，" + (score >= 7 ? "你很容易感受到与TA的心灵共鸣，这种联结会带给你积极的能量。" : "建议保持理性欣赏的态度，将偶像的能量转化为自我成长的动力。"),
        interactionAdvice: "追星建议：1. " + (score >= 7 ? "适合参加线下活动，容易获得良好互动体验" : "线上支持同样有意义") + " 2. " + (score >= 7 ? "TA的正能量与你的成长方向高度一致" : "从TA的作品中汲取灵感") + " 3. 记住保持健康的粉丝距离",
      };
    }),
});
