// 反推 artists.ts 中派生字段的生成算法：baziDayPillar / starMansion / zodiacMoon
import fs from 'node:fs';

const src = fs.readFileSync(new URL('../src/data/artists.ts', import.meta.url), 'utf8');
const re = /\{ id: (\d+),.*?birthDate: "(\d{4}-\d{2}-\d{2})".*?\}/g;
const entries = [];
let m;
while ((m = re.exec(src))) {
  const line = m[0];
  const get = (k) => { const mm = line.match(new RegExp(k + ': "([^"]*)"')); return mm ? mm[1] : null; };
  entries.push({
    id: +m[1], birthDate: m[2],
    zodiacSign: get('zodiacSign'), zodiacMoon: get('zodiacMoon'),
    baziDayPillar: get('baziDayPillar'), starMansion: get('starMansion'),
    chineseZodiac: get('chineseZodiac'), element: get('element'),
  });
}
console.log('parsed entries:', entries.length);

// 排除占位符（01-01 假生日 + id 580/640/645）
const valid = entries.filter(e => ![580, 640, 645].includes(e.id));

const STEMS = '甲乙丙丁戊己庚辛壬癸';
const BRANCHES = '子丑寅卯辰巳午未申酉戌亥';
const MANSIONS = ['角宿','亢宿','氐宿','房宿','心宿','尾宿','箕宿','斗宿','牛宿','女宿','虚宿','危宿','室宿','壁宿','奎宿','娄宿','胃宿','昴宿','毕宿','觜宿','参宿','井宿','鬼宿','柳宿','星宿','张宿','翼宿','轸宿'];
const SIGNS = ['白羊座','金牛座','双子座','巨蟹座','狮子座','处女座','天秤座','天蝎座','射手座','摩羯座','水瓶座','双鱼座'];
const ELEM = { 甲:'木',乙:'木',丙:'火',丁:'火',戊:'土',己:'土',庚:'金',辛:'金',壬:'水',癸:'水' };

function jdn(y, mo, d) {
  const a = Math.floor((14 - mo) / 12), yy = y + 4800 - a, mm = mo + 12 * a - 3;
  return d + Math.floor((153 * mm + 2) / 5) + 365 * yy + Math.floor(yy / 4) - Math.floor(yy / 100) + Math.floor(yy / 400) - 32045;
}
const parse = s => s.split('-').map(Number);

// 1) 日柱：拟合 (jdn + offset) % 60
{
  const withPillar = valid.filter(e => e.baziDayPillar);
  let best = { off: 0, hit: 0 };
  for (let off = 0; off < 60; off++) {
    let hit = 0;
    for (const e of withPillar) {
      const [y, mo, d] = parse(e.birthDate);
      const idx = (jdn(y, mo, d) + off) % 60;
      const gz = STEMS[idx % 10] + BRANCHES[idx % 12];
      if (gz === e.baziDayPillar) hit++;
    }
    if (hit > best.hit) best = { off, hit };
  }
  console.log(`日柱: best offset=${best.off}, 匹配 ${best.hit}/${withPillar.length} (${(100*best.hit/withPillar.length).toFixed(1)}%)`);
}

// 2) 星宿：拟合 (jdn + offset) % 28
{
  const withMan = valid.filter(e => e.starMansion);
  let best = { off: 0, hit: 0 };
  for (let off = 0; off < 28; off++) {
    let hit = 0;
    for (const e of withMan) {
      const [y, mo, d] = parse(e.birthDate);
      if (MANSIONS[(jdn(y, mo, d) + off) % 28] === e.starMansion) hit++;
    }
    if (hit > best.hit) best = { off, hit };
  }
  console.log(`星宿: best offset=${best.off}, 匹配 ${best.hit}/${withMan.length} (${(100*best.hit/withMan.length).toFixed(1)}%)`);
}

// 3) 月亮星座：平均月亮黄经近似 vs 数据
{
  const withMoon = valid.filter(e => e.zodiacMoon);
  let hit = 0;
  for (const e of withMoon) {
    const [y, mo, d] = parse(e.birthDate);
    const dJ2000 = jdn(y, mo, d) - 2451545; // 正午起算
    let lon = (218.316 + 13.176396 * dJ2000) % 360; if (lon < 0) lon += 360;
    if (SIGNS[Math.floor(lon / 30)] === e.zodiacMoon) hit++;
  }
  console.log(`月亮星座(平均黄经): 匹配 ${hit}/${withMoon.length} (${(100*hit/withMoon.length).toFixed(1)}%)`);
}

// 4) element 是否 = 日柱天干五行
{
  const withBoth = valid.filter(e => e.element && e.baziDayPillar);
  let hit = 0;
  for (const e of withBoth) if (ELEM[e.baziDayPillar[0]] === e.element) hit++;
  console.log(`element=日干五行: 匹配 ${hit}/${withBoth.length} (${(100*hit/withBoth.length).toFixed(1)}%)`);
}
