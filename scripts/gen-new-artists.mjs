// 生成 2025-2026 新团成员条目（KiiiKiii/Hearts2Hearts/IDID/izna/KickFlip/AHOF）
// 派生字段算法已用现有 398 条数据反推验证：
//   日柱 = (JDN+49)%60 干支（86.4% 吻合）; 五行 = 年干五行; 生肖 = 年支（立春界）
import fs from 'node:fs';

const STEMS = '甲乙丙丁戊己庚辛壬癸';
const BRANCHES = '子丑寅卯辰巳午未申酉戌亥';
const ZODIAC = '鼠牛虎兔龙蛇马羊猴鸡狗猪';
const MANSIONS = ['角宿','亢宿','氐宿','房宿','心宿','尾宿','箕宿','斗宿','牛宿','女宿','虚宿','危宿','室宿','壁宿','奎宿','娄宿','胃宿','昴宿','毕宿','觜宿','参宿','井宿','鬼宿','柳宿','星宿','张宿','翼宿','轸宿'];
const SIGNS = ['白羊座','金牛座','双子座','巨蟹座','狮子座','处女座','天秤座','天蝎座','射手座','摩羯座','水瓶座','双鱼座'];
const ELEM = { 甲:'木',乙:'木',丙:'火',丁:'火',戊:'土',己:'土',庚:'金',辛:'金',壬:'水',癸:'水' };
// 太阳星座边界（起始日）
const SUN = [[1,20,'水瓶座'],[2,19,'双鱼座'],[3,21,'白羊座'],[4,20,'金牛座'],[5,21,'双子座'],[6,22,'巨蟹座'],[7,23,'狮子座'],[8,23,'处女座'],[9,23,'天秤座'],[10,24,'天蝎座'],[11,23,'射手座'],[12,22,'摩羯座']];

function jdn(y, mo, d) {
  const a = Math.floor((14 - mo) / 12), yy = y + 4800 - a, mm = mo + 12 * a - 3;
  return d + Math.floor((153 * mm + 2) / 5) + 365 * yy + Math.floor(yy / 4) - Math.floor(yy / 100) + Math.floor(yy / 400) - 32045;
}
function derive(birthDate) {
  const [y, mo, d] = birthDate.split('-').map(Number);
  const j = jdn(y, mo, d);
  // 日柱
  const di = (j + 49) % 60;
  const dayPillar = STEMS[di % 10] + BRANCHES[di % 12];
  // 年柱（立春 2/4 界）
  const yAdj = (mo < 2 || (mo === 2 && d < 4)) ? y - 1 : y;
  const yearPillar = STEMS[(yAdj - 4) % 10] + BRANCHES[(yAdj - 4) % 12];
  const chineseZodiac = ZODIAC[(yAdj - 4) % 12];
  const element = ELEM[yearPillar[0]];
  // 太阳星座
  let zodiacSign = '摩羯座';
  for (const [m2, dd, s] of SUN) { if (mo > m2 || (mo === m2 && d >= dd)) zodiacSign = s; }
  if (mo === 1 && d < 20) zodiacSign = '摩羯座';
  // 月亮星座（平均黄经近似，正午 KST）
  let lon = (218.316 + 13.176396 * (j - 2451545 + 0.125)) % 360; if (lon < 0) lon += 360;
  const zodiacMoon = SIGNS[Math.floor(lon / 30)];
  // 星宿（与库内拟合 offset=11）
  const starMansion = MANSIONS[(j + 11) % 28];
  return { dayPillar, yearPillar, chineseZodiac, element, zodiacSign, zodiacMoon, starMansion };
}

const GROUPS = [
  { group: 'KiiiKiii', agency: 'STARSHIP娱乐', debut: '2025.03.24', gender: 'female', cat: 'girlGroup', nameKrGroup: '키키', baseHeat: 90, members: [
    { name: 'Jiyu', nameKr: '지유', birth: '2006-05-14', pos: '队长·主唱', mbti: 'ISTJ', heat: 91 },
    { name: 'Leesol', nameKr: '이솔', birth: '2005-09-18', pos: '主Rapper', mbti: 'ISTJ', heat: 90 },
    { name: 'Sui', nameKr: '수이', birth: '2006-04-10', pos: '主唱', mbti: 'INTP', heat: 90 },
    { name: 'Haum', nameKr: '하음', birth: '2006-11-14', pos: '门面·副唱', mbti: 'ESTJ', heat: 91 },
    { name: 'Kya', nameKr: '키야', birth: '2010-12-18', pos: '忙内·副唱', mbti: 'INTP', heat: 92 },
  ]},
  { group: 'Hearts2Hearts', agency: 'SM娱乐', debut: '2025.02.24', gender: 'female', cat: 'girlGroup', nameKrGroup: '하츠투하츠', baseHeat: 92, members: [
    { name: 'Jiwoo', nameKr: '지우', birth: '2006-09-07', pos: '队长', mbti: 'ISTJ', heat: 92 },
    { name: 'Carmen', nameKr: '카르멘', birth: '2006-03-28', pos: '主唱', mbti: 'ESFP', heat: 91, note: '印度尼西亚籍' },
    { name: 'Yuha', nameKr: '유하', birth: '2007-04-12', pos: '主唱', mbti: 'INTJ', heat: 90 },
    { name: 'Stella', nameKr: '스텔라', birth: '2007-06-18', pos: '领唱', mbti: 'ENTP', heat: 90 },
    { name: 'Juun', nameKr: '주운', birth: '2008-12-03', pos: '主舞·领Rapper', mbti: 'ISFP', heat: 91 },
    { name: 'A-na', nameKr: '아나', birth: '2008-12-20', pos: '门面·Rapper', mbti: 'ESFP', heat: 92 },
    { name: 'Ian', nameKr: '이안', birth: '2009-10-09', pos: '中心', mbti: 'ENFP', heat: 94 },
    { name: 'Ye-on', nameKr: '예온', birth: '2010-04-19', pos: '忙内·副唱', mbti: 'INTJ', heat: 91 },
  ]},
  { group: 'IDID', agency: 'STARSHIP娱乐', debut: '2025.09.15', gender: 'male', cat: 'boyGroup', nameKrGroup: '아이디드', baseHeat: 87, members: [
    { name: 'Jang Yonghoon', nameKr: '장용훈', birth: '2005-04-20', pos: '队长', mbti: 'ENTJ', heat: 88 },
    { name: 'Kim Minjae', nameKr: '김민재', birth: '2005-08-17', pos: '中心', mbti: 'INTJ', heat: 89 },
    { name: 'Park Wonbin', nameKr: '박원빈', birth: '2006-04-19', pos: '领Rapper', mbti: 'INFJ', heat: 87 },
    { name: 'Chu Yoochan', nameKr: '추유찬', birth: '2006-10-03', pos: '主唱', mbti: 'INFJ', heat: 87 },
    { name: 'Park Seonghyeon', nameKr: '박성현', birth: '2007-10-05', pos: '主舞·Rapper', mbti: 'INTJ', heat: 87 },
    { name: 'Baek Junhyuk', nameKr: '백준혁', birth: '2008-06-07', pos: '领唱', mbti: '?', heat: 86 },
    { name: 'Jeong Semin', nameKr: '정세민', birth: '2008-10-10', pos: '忙内·副唱', mbti: 'ESFP', heat: 88 },
  ]},
  { group: 'izna', agency: 'WAKEONE', debut: '2024.11.25', gender: 'female', cat: 'girlGroup', nameKrGroup: '이즈나', baseHeat: 90, members: [
    { name: 'Mai', nameKr: '마이', birth: '2004-10-28', pos: '门面·副唱', mbti: 'ISTP', heat: 90, note: '日本籍' },
    { name: 'Bang Jeemin', nameKr: '방지민', birth: '2005-05-08', pos: '中心', mbti: 'INFP', heat: 92 },
    { name: 'Koko', nameKr: '코코', birth: '2006-11-14', pos: '主舞', mbti: 'ESFJ', heat: 90, note: '日本籍' },
    { name: 'Ryu Sarang', nameKr: '류사랑', birth: '2007-04-18', pos: '副唱', mbti: 'INFP', heat: 89 },
    { name: 'Choi Jungeun', nameKr: '최정은', birth: '2007-08-04', pos: '主唱', mbti: 'ISTJ', heat: 91 },
    { name: 'Jeong Saebi', nameKr: '정세비', birth: '2008-01-22', pos: '忙内·门面', mbti: 'ENFP', heat: 91 },
  ]},
  { group: 'KickFlip', agency: 'JYP娱乐', debut: '2025.01.20', gender: 'male', cat: 'boyGroup', nameKrGroup: '킥플립', baseHeat: 88, members: [
    { name: 'Kyehoon', nameKr: '계훈', birth: '2004-09-16', pos: '队长·ACE', mbti: 'ISFP', heat: 89 },
    { name: 'Amaru', nameKr: '아마루', birth: '2005-10-21', pos: '副唱·Rapper', mbti: 'INFP', heat: 88, note: '日本籍' },
    { name: 'Donghwa', nameKr: '동화', birth: '2006-03-11', pos: '领舞', mbti: 'ISTJ', heat: 87 },
    { name: 'Juwang', nameKr: '주왕', birth: '2006-05-02', pos: '副唱', mbti: 'ISFP', heat: 87 },
    { name: 'Minje', nameKr: '민제', birth: '2006-05-12', pos: 'Rapper·门面', mbti: 'INTP', heat: 88 },
    { name: 'Keiju', nameKr: '케이주', birth: '2006-10-04', pos: '领舞', mbti: 'INFP', heat: 87, note: '日本籍' },
    { name: 'Donghyeon', nameKr: '동현', birth: '2007-03-13', pos: '忙内·副唱', mbti: 'ISFP', heat: 88 },
  ]},
  { group: 'AHOF', agency: 'F&F娱乐', debut: '2025.07.01', gender: 'male', cat: 'boyGroup', nameKrGroup: '어호프', baseHeat: 87, members: [
    { name: 'Steven', nameKr: '스티븐', birth: '2000-01-17', pos: '队长·主Rapper', mbti: 'INFP', heat: 88, note: '韩裔澳大利亚籍' },
    { name: 'Jeongwoo', nameKr: '정우', birth: '2001-09-06', pos: '副唱', mbti: 'ISTJ', heat: 86 },
    { name: 'Woongki', nameKr: '웅기', birth: '2002-04-23', pos: '全能', mbti: 'ENFP', heat: 87 },
    { name: 'Shuaibo', nameKr: '슈아이보', birth: '2002-07-02', pos: '副唱', mbti: '?', heat: 87, note: '中国籍' },
    { name: 'Han', nameKr: '한', birth: '2003-09-25', pos: '主唱', mbti: '?', heat: 86 },
    { name: 'JL', nameKr: '제이엘', birth: '2004-04-21', pos: '主唱·中心', mbti: '?', heat: 89, note: '菲律宾籍' },
    { name: 'Juwon', nameKr: '주원', birth: '2006-07-24', pos: '主舞·Rapper', mbti: '?', heat: 87 },
    { name: 'Chih En', nameKr: '치엔', birth: '2006-10-28', pos: '门面', mbti: '?', heat: 88, note: '中国台湾籍' },
    { name: 'Daisuke', nameKr: '다이스케', birth: '2009-12-25', pos: '忙内', mbti: '?', heat: 89, note: '日本籍' },
  ]},
];

let id = 866;
const out = {};
for (const g of GROUPS) {
  const lines = [`  // ${g.group} — ${g.agency.replace('娱乐','')} (${g.debut})`];
  for (const mem of g.members) {
    const f = derive(mem.birth);
    const parts = [
      `id: ${id++}`,
      `name: "${mem.name}"`,
      `stageName: "${mem.name}"`,
      `groupName: "${g.group}"`,
      `region: "korea"`,
      `gender: "${g.gender}"`,
      `category: "${g.cat}"`,
      `birthDate: "${mem.birth}"`,
      `birthdayType: "solar"`,
      `birthTime: "00:00"`,
      `zodiacSign: "${f.zodiacSign}"`,
      `zodiacMoon: "${f.zodiacMoon}"`,
      `baziYearPillar: "${f.yearPillar}"`,
      `baziDayPillar: "${f.dayPillar}"`,
      `starMansion: "${f.starMansion}"`,
      `chineseZodiac: "${f.chineseZodiac}"`,
      `element: "${f.element}"`,
      `mbti: "${mem.mbti}"`,
      `debutDate: "${g.debut}"`,
      `agency: "${g.agency}"`,
      `position: "${mem.pos}"`,
      `nameKr: "${mem.nameKr}"`,
      `cpHeat: ${mem.heat}`,
      `generationTag: "新人团"`,
      `verificationStatus: "needs_review"`,
    ];
    if (mem.note) parts.push(`verificationNote: "${mem.note}"`);
    lines.push(`  { ${parts.join(', ')} },`);
  }
  out[g.group] = lines.join('\n');
}
fs.writeFileSync(new URL('../data/new_artists_blocks.json', import.meta.url), JSON.stringify(out, null, 2));
console.log('生成完毕，最后 id =', id - 1);
for (const k of Object.keys(out)) console.log('---', k, '---\n' + out[k].split('\n').slice(0, 2).join('\n'));
