export interface TarotCard {
  id: number;
  name: string;
  nameCn: string;
  roman: string;
  suit: "major" | "wands" | "cups" | "swords" | "pentacles";
  image: string;
  keywords: string[];
  meaningUpright: string;
  meaningReversed: string;
}

export const TAROT_CARDS: TarotCard[] = [
  // Major Arcana 0-21
  { id: 0, name: "The Fool", nameCn: "愚人", roman: "0", suit: "major", image: "/tarot/0.jpg", keywords: ["新开始", "自由", "冒险"], meaningUpright: "新的开始，无畏的冒险，纯真的信任，踏上未知旅程", meaningReversed: "鲁莽行事，缺乏计划，过于天真，需要谨慎" },
  { id: 1, name: "The Magician", nameCn: "魔术师", roman: "I", suit: "major", image: "/tarot/1.jpg", keywords: ["创造力", "意志力", "显化"], meaningUpright: "拥有实现目标的能力与资源，创造力爆发，自信行动", meaningReversed: "能力未发挥，欺骗，缺乏自信，操纵" },
  { id: 2, name: "The High Priestess", nameCn: "女祭司", roman: "II", suit: "major", image: "/tarot/2.jpg", keywords: ["直觉", "神秘", "内在智慧"], meaningUpright: "倾听内在声音，相信直觉，隐藏的知识即将揭示", meaningReversed: "忽视直觉，秘密，情绪失衡" },
  { id: 3, name: "The Empress", nameCn: "女皇", roman: "III", suit: "major", image: "/tarot/3.jpg", keywords: ["丰饶", "母性", "创造力"], meaningUpright: "丰盛与滋养，创造力开花结果，享受生活的美好", meaningReversed: "创造力受阻，过度依赖，缺乏自我关爱" },
  { id: 4, name: "The Emperor", nameCn: "皇帝", roman: "IV", suit: "major", image: "/tarot/4.jpg", keywords: ["权威", "稳定", "结构"], meaningUpright: "建立秩序与规则，发挥领导力，稳扎稳打", meaningReversed: "专制僵化，滥用权力，缺乏纪律" },
  { id: 5, name: "The Hierophant", nameCn: "教皇", roman: "V", suit: "major", image: "/tarot/5.jpg", keywords: ["传统", "信仰", "教导"], meaningUpright: "遵循传统智慧，寻求指导，精神层面的成长", meaningReversed: "打破常规，质疑权威，非传统道路" },
  { id: 6, name: "The Lovers", nameCn: "恋人", roman: "VI", suit: "major", image: "/tarot/6.jpg", keywords: ["爱情", "选择", "和谐"], meaningUpright: "真挚的感情连接，重要选择，价值观的统一", meaningReversed: "关系失衡，错误选择，价值观冲突" },
  { id: 7, name: "The Chariot", nameCn: "战车", roman: "VII", suit: "major", image: "/tarot/7.jpg", keywords: ["意志力", "胜利", "控制"], meaningUpright: "坚定的意志带你前进，克服挑战，取得胜利", meaningReversed: "缺乏方向，失控，意志力分散" },
  { id: 8, name: "Strength", nameCn: "力量", roman: "VIII", suit: "major", image: "/tarot/8.jpg", keywords: ["勇气", "耐心", "内在力量"], meaningUpright: "以柔克刚，内在勇气与耐心，温和而坚定地面对", meaningReversed: "自我怀疑，缺乏信心，情绪失控" },
  { id: 9, name: "The Hermit", nameCn: "隐士", roman: "IX", suit: "major", image: "/tarot/9.jpg", keywords: ["内省", "独处", "指引"], meaningUpright: "向内寻求答案，独处中获得智慧，灵魂的探索", meaningReversed: "孤立自己，过度孤独，拒绝帮助" },
  { id: 10, name: "Wheel of Fortune", nameCn: "命运之轮", roman: "X", suit: "major", image: "/tarot/10.jpg", keywords: ["转变", "命运", "周期"], meaningUpright: "命运之轮转动，好运降临，顺应变化的潮流", meaningReversed: "抗拒改变，厄运，循环停滞" },
  { id: 11, name: "Justice", nameCn: "正义", roman: "XI", suit: "major", image: "/tarot/11.jpg", keywords: ["公正", "真理", "因果"], meaningUpright: "公正的结果，面对真相，承担行为的后果", meaningReversed: "不公，逃避责任，不诚实" },
  { id: 12, name: "The Hanged Man", nameCn: "倒吊人", roman: "XII", suit: "major", image: "/tarot/12.jpg", keywords: ["牺牲", "新视角", "暂停"], meaningUpright: "换个角度看问题，必要的牺牲，耐心等待", meaningReversed: "无谓的牺牲，抗拒放手，停滞不前" },
  { id: 13, name: "Death", nameCn: "死神", roman: "XIII", suit: "major", image: "/tarot/13.jpg", keywords: ["结束", "转化", "新生"], meaningUpright: "旧事物的结束带来新开始，重大转变，蜕变重生", meaningReversed: "抗拒结束，停滞，无法放手" },
  { id: 14, name: "Temperance", nameCn: "节制", roman: "XIV", suit: "major", image: "/tarot/14.jpg", keywords: ["平衡", "调和", "耐心"], meaningUpright: "找到生活的平衡点，融合对立面，中庸之道", meaningReversed: "失衡，极端，缺乏耐心" },
  { id: 15, name: "The Devil", nameCn: "恶魔", roman: "XV", suit: "major", image: "/tarot/15.jpg", keywords: ["束缚", "欲望", "物质主义"], meaningUpright: "意识到自我束缚，面对欲望与执念，打破枷锁", meaningReversed: "释放束缚，摆脱执念，重获自由" },
  { id: 16, name: "The Tower", nameCn: "塔", roman: "XVI", suit: "major", image: "/tarot/16.jpg", keywords: ["突变", "觉醒", "崩塌"], meaningUpright: "突如其来的改变，旧结构的崩塌，被迫觉醒", meaningReversed: "避免灾难，内在觉醒，渐进式改变" },
  { id: 17, name: "The Star", nameCn: "星星", roman: "XVII", suit: "major", image: "/tarot/17.jpg", keywords: ["希望", "灵感", "宁静"], meaningUpright: "希望的指引，灵感涌现，内心的宁静与信心", meaningReversed: "失去信心，绝望，灵感枯竭" },
  { id: 18, name: "The Moon", nameCn: "月亮", roman: "XVIII", suit: "major", image: "/tarot/18.jpg", keywords: ["幻觉", "潜意识", "恐惧"], meaningUpright: "面对内心的恐惧与幻觉，信任潜意识的指引", meaningReversed: "走出迷雾，释放恐惧，真相大白" },
  { id: 19, name: "The Sun", nameCn: "太阳", roman: "XIX", suit: "major", image: "/tarot/19.jpg", keywords: ["快乐", "成功", "活力"], meaningUpright: "光明与成功，纯粹的快乐，充满活力的时期", meaningReversed: "暂时的阴霾，自我怀疑，热情减退" },
  { id: 20, name: "Judgement", nameCn: "审判", roman: "XX", suit: "major", image: "/tarot/20.jpg", keywords: ["觉醒", "重生", "召唤"], meaningUpright: "内心的召唤，自我审视，重大的觉醒与重生", meaningReversed: "自我怀疑，逃避评判，拒绝改变" },
  { id: 21, name: "The World", nameCn: "世界", roman: "XXI", suit: "major", image: "/tarot/21.jpg", keywords: ["完成", "圆满", "成就"], meaningUpright: "旅程的圆满完成，成就的巅峰，和谐统一", meaningReversed: "未完成，延迟，缺乏closure" },
];

// Minor Arcana - Wands 22-35
const wandsRanks = ["Ace","Two","Three","Four","Five","Six","Seven","Eight","Nine","Ten","Page","Knight","Queen","King"];
const wandsCn = ["权杖王牌","权杖二","权杖三","权杖四","权杖五","权杖六","权杖七","权杖八","权杖九","权杖十","权杖侍从","权杖骑士","权杖王后","权杖国王"];
const wandsKeywords = [
  ["灵感","创造","潜能"],["计划","决策","未来"],["远见","领导","探索"],["庆祝","和谐","成果"],
  ["冲突","竞争","挑战"],["胜利","认可","进展"],["勇气","坚持","防御"],["速度","行动","消息"],
  ["韧性","毅力","最后考验"],["负担","责任","压力"],["探索","热情","新想法"],
  ["冒险","魅力","行动"],["自信","活力","领导力"],["远见","创业","成熟"]
];
wandsRanks.forEach((rank, i) => {
  TAROT_CARDS.push({
    id: 22 + i, name: `${rank} of Wands`, nameCn: wandsCn[i], roman: ["I","II","III","IV","V","VI","VII","VIII","IX","X","XI","XII","XIII","XIV"][i],
    suit: "wands", image: `/tarot/${22 + i}.jpg`, keywords: wandsKeywords[i],
    meaningUpright: `${wandsCn[i]}正位含义：${wandsKeywords[i].join("、")}的能量流动`,
    meaningReversed: `${wandsCn[i]}逆位含义：${wandsKeywords[i].join("、")}的能量受阻`
  });
});

// Minor Arcana - Cups 36-49
const cupsRanks = ["Ace","Two","Three","Four","Five","Six","Seven","Eight","Nine","Ten","Page","Knight","Queen","King"];
const cupsCn = ["圣杯王牌","圣杯二","圣杯三","圣杯四","圣杯五","圣杯六","圣杯七","圣杯八","圣杯九","圣杯十","圣杯侍从","圣杯骑士","圣杯王后","圣杯国王"];
const cupsKeywords = [
  ["爱","情感","灵性"],["伴侣","和谐","平衡"],["庆祝","友谊","社交"],["冥想","不满足","审视"],
  ["失落","悲伤","失望"],["怀旧","童年","回忆"],["幻想","选择","梦想"],["离开","追寻","放手"],
  ["满足","愿望","幸福"],["家庭","和谐","圆满"],["创意","敏感","新情感"],
  ["浪漫","追求","邀约"],["慈悲","直觉","滋养"],["情感成熟","掌控","外交"]
];
cupsRanks.forEach((rank, i) => {
  TAROT_CARDS.push({
    id: 36 + i, name: `${rank} of Cups`, nameCn: cupsCn[i], roman: ["I","II","III","IV","V","VI","VII","VIII","IX","X","XI","XII","XIII","XIV"][i],
    suit: "cups", image: `/tarot/${36 + i}.jpg`, keywords: cupsKeywords[i],
    meaningUpright: `${cupsCn[i]}正位含义：${cupsKeywords[i].join("、")}的情感流动`,
    meaningReversed: `${cupsCn[i]}逆位含义：${cupsKeywords[i].join("、")}的情感受阻`
  });
});

// Minor Arcana - Swords 50-63
const swordsRanks = ["Ace","Two","Three","Four","Five","Six","Seven","Eight","Nine","Ten","Page","Knight","Queen","King"];
const swordsCn = ["宝剑王牌","宝剑二","宝剑三","宝剑四","宝剑五","宝剑六","宝剑七","宝剑八","宝剑九","宝剑十","宝剑侍从","宝剑骑士","宝剑王后","宝剑国王"];
const swordsKeywords = [
  [" clarity","突破","新想法"],["僵局","选择","平衡"],["心碎","悲伤","痛苦"],["休息","恢复","冥想"],
  ["冲突","胜利","不公平"],["过渡","治愈","前行"],["欺骗","策略","偷窃"],["限制","束缚","无助"],
  ["焦虑","担忧","噩梦"],["结束","痛苦","背叛"],["好奇","警觉","新思维"],
  ["果断","激进","行动"],["独立","清晰","公正"],["权威","真理"," intellect"]
];
swordsRanks.forEach((rank, i) => {
  TAROT_CARDS.push({
    id: 50 + i, name: `${rank} of Swords`, nameCn: swordsCn[i], roman: ["I","II","III","IV","V","VI","VII","VIII","IX","X","XI","XII","XIII","XIV"][i],
    suit: "swords", image: `/tarot/${50 + i}.jpg`, keywords: swordsKeywords[i],
    meaningUpright: `${swordsCn[i]}正位含义：${swordsKeywords[i].join("、")}的思维力量`,
    meaningReversed: `${swordsCn[i]}逆位含义：${swordsKeywords[i].join("、")}的思维混乱`
  });
});

// Minor Arcana - Pentacles 64-77
const pentRanks = ["Ace","Two","Three","Four","Five","Six","Seven","Eight","Nine","Ten","Page","Knight","Queen","King"];
const pentCn = ["星币王牌","星币二","星币三","星币四","星币五","星币六","星币七","星币八","星币九","星币十","星币侍从","星币骑士","星币王后","星币国王"];
const pentKeywords = [
  ["物质","机遇","繁荣"],["平衡"," juggling","适应"],["合作","技能"," craftsmanship"],["保守","控制","稳定"],
  ["贫困","损失","孤立"],["慷慨","给予","分享"],["耐心","评估","成长"],["勤劳","技能","专注"],
  ["独立","自给","享受"],["财富","遗产","传承"],["学习","务实","新机会"],
  ["责任","效率","可靠"],["滋养","丰饶","务实"],["成功","财富","成就"]
];
pentRanks.forEach((rank, i) => {
  TAROT_CARDS.push({
    id: 64 + i, name: `${rank} of Pentacles`, nameCn: pentCn[i], roman: ["I","II","III","IV","V","VI","VII","VIII","IX","X","XI","XII","XIII","XIV"][i],
    suit: "pentacles", image: `/tarot/${64 + i}.jpg`, keywords: pentKeywords[i],
    meaningUpright: `${pentCn[i]}正位含义：${pentKeywords[i].join("、")}的物质显现`,
    meaningReversed: `${pentCn[i]}逆位含义：${pentKeywords[i].join("、")}的物质阻碍`
  });
});

export function getCardById(id: number): TarotCard | undefined {
  return TAROT_CARDS.find(c => c.id === id);
}

export function drawRandomCards(count: number): TarotCard[] {
  const shuffled = [...TAROT_CARDS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

export const FREE_READING_LIMIT = 3;
export const UNLOCK_PRICE = 9.9;
