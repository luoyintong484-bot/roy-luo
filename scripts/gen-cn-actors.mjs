// 生成 2025-2026 微博热度最高的内娱艺人/演员条目（依据：2025/2026微博之夜、微博热搜年榜、剧集热度榜交叉确认）
// 并修复全网检查发现的重复数据：INTO1 双套条目、王橹杰重复、穆祉丞生日错误
import fs from 'node:fs';

const STEMS = '甲乙丙丁戊己庚辛壬癸';
const BRANCHES = '子丑寅卯辰巳午未申酉戌亥';
const ZODIAC = '鼠牛虎兔龙蛇马羊猴鸡狗猪';
const MANSIONS = ['角宿','亢宿','氐宿','房宿','心宿','尾宿','箕宿','斗宿','牛宿','女宿','虚宿','危宿','室宿','壁宿','奎宿','娄宿','胃宿','昴宿','毕宿','觜宿','参宿','井宿','鬼宿','柳宿','星宿','张宿','翼宿','轸宿'];
const SIGNS = ['白羊座','金牛座','双子座','巨蟹座','狮子座','处女座','天秤座','天蝎座','射手座','摩羯座','水瓶座','双鱼座'];
const ELEM = { 甲:'木',乙:'木',丙:'火',丁:'火',戊:'土',己:'土',庚:'金',辛:'金',壬:'水',癸:'水' };
const SUN = [[1,20,'水瓶座'],[2,19,'双鱼座'],[3,21,'白羊座'],[4,20,'金牛座'],[5,21,'双子座'],[6,22,'巨蟹座'],[7,23,'狮子座'],[8,23,'处女座'],[9,23,'天秤座'],[10,24,'天蝎座'],[11,23,'射手座'],[12,22,'摩羯座']];

function jdn(y, mo, d) {
  const a = Math.floor((14 - mo) / 12), yy = y + 4800 - a, mm = mo + 12 * a - 3;
  return d + Math.floor((153 * mm + 2) / 5) + 365 * yy + Math.floor(yy / 4) - Math.floor(yy / 100) + Math.floor(yy / 400) - 32045;
}
export function derive(birthDate) {
  const [y, mo, d] = birthDate.split('-').map(Number);
  const j = jdn(y, mo, d);
  const di = (j + 49) % 60;
  const dayPillar = STEMS[di % 10] + BRANCHES[di % 12];
  const yAdj = (mo < 2 || (mo === 2 && d < 4)) ? y - 1 : y;
  const yi = ((yAdj - 4) % 10 + 10) % 10, bi = ((yAdj - 4) % 12 + 12) % 12;
  const yearPillar = STEMS[yi] + BRANCHES[bi];
  const chineseZodiac = ZODIAC[bi];
  const element = ELEM[yearPillar[0]];
  let zodiacSign = '摩羯座';
  for (const [m2, dd, s] of SUN) { if (mo > m2 || (mo === m2 && d >= dd)) zodiacSign = s; }
  if (mo === 1 && d < 20) zodiacSign = '摩羯座';
  let lon = (218.316 + 13.176396 * (j - 2451545 + 0.125)) % 360; if (lon < 0) lon += 360;
  const zodiacMoon = SIGNS[Math.floor(lon / 30)];
  const starMansion = MANSIONS[(j + 11) % 28];
  return { dayPillar, yearPillar, chineseZodiac, element, zodiacSign, zodiacMoon, starMansion };
}

// [名, 性别, 生日, 职位, 经纪公司, mbti, cpHeat, 荣誉备注]
const ACTORS = [
  // ===== 男艺人 =====
  ['肖战','male','1991-10-05','演员·歌手','哇唧唧哇','?',97,'2025微博King·2026年度榜样影人·年度星光人物'],
  ['沈腾','male','1979-10-23','演员','开心麻花','?',90,'2026微博King'],
  ['王一博','male','1997-08-05','演员·歌手','乐华娱乐','?',96,'2025-2026微博热搜常驻顶流'],
  ['白敬亭','male','1993-10-15','演员','个人工作室','?',93,'2026年度号召力演员·《不眠日》'],
  ['成毅','male','1990-05-17','演员','欢瑞世纪','?',94,'2026年度人气艺人·《赴山海》热度1天破亿'],
  ['丁禹兮','male','1995-07-20','演员','唐人影视','?',95,'2025年度热度演员·《山河枕》热度1天破亿'],
  ['张凌赫','male','1997-12-03','演员','个人工作室','?',93,'2025年度热度演员·95后待播热度TOP2'],
  ['罗云熙','male','1988-07-28','演员·歌手','个人工作室','?',92,'2025男演员待播剧热度榜第1'],
  ['任嘉伦','male','1989-04-11','演员·歌手','个人工作室','?',92,'2025男演员待播剧热度榜第2'],
  ['刘宇宁','male','1990-01-08','演员·歌手','个人工作室','?',93,'2026年度受欢迎演员·《折腰》热度5天破亿'],
  ['王鹤棣','male','1998-12-20','演员','乐华娱乐','?',93,'《大奉打更人》热度破亿'],
  ['许凯','male','1995-03-05','演员','欢娱影视','?',91,'《子夜归》热度13天破亿'],
  ['檀健次','male','1990-10-05','演员·歌手','个人工作室','?',92,'《滤镜》热度15天破亿'],
  ['邓为','male','1995-02-14','演员','个人工作室','?',93,'2025年度瞩目演员·95后待播热度TOP3'],
  ['李昀锐','male','1997-09-11','演员','个人工作室','?',92,'《宴遇永安》热度9天破亿'],
  ['陈伟霆','male','1985-11-21','演员·歌手','个人工作室','?',90,'2026年度号召力演员'],
  ['雷佳音','male','1983-08-29','演员','个人工作室','?',88,'2026年度口碑演员'],
  ['郭京飞','male','1979-11-22','演员','个人工作室','?',87,'2026微博年度男演员'],
  ['梓渝','male','2002-07-06','演员·歌手','北京瑞鹤文化','INFP',95,'2025微博年度星光人物第1·《逆爱》'],
  ['田栩宁','male','1997-09-19','演员','华策影视','?',93,'2025微博年度星光人物·《逆爱》单周涨粉99万'],
  ['张晚意','male','1994-04-25','演员','个人工作室','?',90,'《似锦》热度16天破亿'],
  ['侯明昊','male','1997-08-03','演员','个人工作室','?',90,'2025年95后男演员待播热度TOP4'],
  // ===== 女艺人 =====
  ['杨幂','female','1986-09-12','演员','个人工作室','?',95,'2025微博Queen·2026年度荣耀演员'],
  ['赵丽颖','female','1987-10-16','演员','个人工作室','?',95,'2026微博Queen'],
  ['杨紫','female','1992-11-06','演员','个人工作室','?',95,'2025年度口碑演员·《生万物》'],
  ['白鹿','female','1994-09-23','演员','欢娱影视','?',95,'2026微博年度女演员·2025女演员待播热度TOP3'],
  ['赵露思','female','1998-11-09','演员','个人工作室','?',96,'《许我耀眼》2025云合年冠·95后女演员热度TOP1'],
  ['虞书欣','female','1995-12-18','演员','个人工作室','?',94,'2026年度人气艺人·《永夜星河》'],
  ['迪丽热巴','female','1992-06-03','演员','嘉行传媒','?',94,'2025微博热搜艺人榜第3·女演员待播热度TOP1'],
  ['陈都灵','female','1993-10-18','演员','个人工作室','?',92,'2025年度热度演员·《雁回时》热度破亿'],
  ['孟子义','female','1995-12-05','演员','个人工作室','?',92,'2025年度热度演员'],
  ['关晓彤','female','1997-09-17','演员','个人工作室','?',91,'2025年度热度演员'],
  ['鞠婧祎','female','1994-06-18','演员·歌手','丝芭传媒','?',92,'2025女演员待播剧热度榜第2'],
  ['田曦薇','female','1997-10-14','演员','个人工作室','?',91,'2025年95后女演员待播热度TOP5'],
  ['宋祖儿','female','1998-07-02','演员','个人工作室','?',90,'2026年度飞跃演员·95后待播热度TOP3'],
  ['赵今麦','female','2002-09-29','演员','个人工作室','?',92,'2025年00后演员热度榜第1'],
  ['周也','female','1998-05-22','演员','个人工作室','?',90,'2026年度表现力影人·95后待播热度TOP2'],
  ['刘亦菲','female','1987-08-25','演员','个人工作室','?',93,'2025-2026微博热搜常驻'],
  ['刘诗诗','female','1987-03-10','演员','个人工作室','?',90,'时尚影响力顶流·《掌心》'],
  ['李一桐','female','1990-09-06','演员','个人工作室','?',89,'2026年度飞跃演员'],
];

let id = 924;
const lines = ['  // ===== 2025-2026 微博热度TOP内娱艺人/演员（微博之夜+热搜年榜+剧集热度榜交叉确认） ====='];
for (const [name, gender, birth, pos, agency, mbti, heat, note] of ACTORS) {
  const f = derive(birth);
  const parts = [
    `id: ${id++}`, `name: "${name}"`, `stageName: "${name}"`, `groupName: "个人"`,
    `region: "china"`, `gender: "${gender}"`, `category: "solo"`,
    `birthDate: "${birth}"`, `birthdayType: "solar"`, `birthTime: "00:00"`,
    `zodiacSign: "${f.zodiacSign}"`, `zodiacMoon: "${f.zodiacMoon}"`,
    `baziYearPillar: "${f.yearPillar}"`, `baziDayPillar: "${f.dayPillar}"`,
    `starMansion: "${f.starMansion}"`, `chineseZodiac: "${f.chineseZodiac}"`, `element: "${f.element}"`,
    `mbti: "${mbti}"`, `debutDate: ""`, `agency: "${agency}"`, `position: "${pos}"`,
    `cpHeat: ${heat}`, `generationTag: "微博热度TOP"`,
    `verificationStatus: "needs_review"`, `verificationNote: "${note}"`,
  ];
  lines.push(`  { ${parts.join(', ')} },`);
}

const file = new URL('../src/data/artists.ts', import.meta.url);
let src = fs.readFileSync(file, 'utf8');

// ---- 修复1：删除 INTO1 第二套重复条目 id 700-710（保留 128-133 + 919-923 原始套）----
let removed = 0;
for (let i = 700; i <= 710; i++) {
  const re = new RegExp('  \\{ id: ' + i + ',[^\\n]*\\n', '');
  if (re.test(src)) { src = src.replace(re, ''); removed++; }
}

// ---- 修复2：删除王橹杰重复条目 id 420（保留 id 738）----
if (/  \{ id: 420, name: "王橹杰"[^\n]*\n/.test(src)) { src = src.replace(/  \{ id: 420, name: "王橹杰"[^\n]*\n/, ''); removed++; }

// ---- 修复3：穆祉丞真实生日 2007-11-16（删除 id 421 错误条目，修正 id 722）----
if (/  \{ id: 421, name: "穆祉丞"[^\n]*\n/.test(src)) { src = src.replace(/  \{ id: 421, name: "穆祉丞"[^\n]*\n/, ''); removed++; }
{
  const f = derive('2007-11-16');
  const re = /  \{ id: 722, name: "穆祉丞"[^\n]*\n/;
  const nl = `  { id: 722, name: "穆祉丞", stageName: "穆祉丞", groupName: "TF_ING", region: "china", gender: "male", category: "boyGroup", birthDate: "2007-11-16", birthdayType: "solar", birthTime: "00:00", zodiacSign: "${f.zodiacSign}", zodiacMoon: "${f.zodiacMoon}", baziYearPillar: "${f.yearPillar}", baziDayPillar: "${f.dayPillar}", starMansion: "${f.starMansion}", chineseZodiac: "${f.chineseZodiac}", element: "${f.element}", mbti: "?", debutDate: "2024.09.01", agency: "时代峰峻", position: "歌手·演员", cpHeat: 93, verificationStatus: "verified", verificationMethod: "official", verificationNote: "2007-11-16重庆·TF_ING厂牌·巴黎欧莱雅青春代言人" },\n`;
  if (re.test(src)) src = src.replace(re, nl);
}

// ---- 注入新条目到 CHINESE_ARTISTS 数组末尾（第二个 ^]; 前）----
const firstEnd = src.search(/\n\];/);
const secondEnd = src.indexOf('\n];', firstEnd + 3);
if (secondEnd < 0) throw new Error('CHINESE_ARTISTS array end not found');
src = src.slice(0, secondEnd) + '\n\n' + lines.join('\n') + src.slice(secondEnd);

fs.writeFileSync(file, src);
console.log(`新增 ${ACTORS.length} 位内娱艺人 (id 924-${id - 1})，删除重复/错误条目 ${removed} 条，修正穆祉丞生日`);
