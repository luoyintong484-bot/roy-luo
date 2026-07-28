// 注入新团条目：替换 3 个整团占位符 + 追加 3 个新团
import fs from 'node:fs';

const file = new URL('../src/data/artists.ts', import.meta.url);
let src = fs.readFileSync(file, 'utf8');
const blocks = JSON.parse(fs.readFileSync(new URL('../data/new_artists_blocks.json', import.meta.url), 'utf8'));

// 1) 替换 KiiiKiii 占位符（注释行 + 数据行）
const kiiiOld = src.match(/  \/\/ KiiiKiii — STARSHIP \(2025\)\n  \{ id: 580,[^\n]*\n/);
if (!kiiiOld) throw new Error('KiiiKiii placeholder not found');
src = src.replace(kiiiOld[0], blocks['KiiiKiii'] + '\n');

// 2) 替换 Heart2Heart 占位符
const h2hOld = src.match(/  \/\/ Heart2Heart — SM新女团\n  \{ id: 640,[^\n]*\n/);
if (!h2hOld) throw new Error('Heart2Heart placeholder not found');
src = src.replace(h2hOld[0], blocks['Hearts2Hearts'] + '\n');

// 3) 替换 IDID 占位符
const ididOld = src.match(/  \/\/ IDID — 新女团\n  \{ id: 645,[^\n]*\n/);
if (!ididOld) throw new Error('IDID placeholder not found');
src = src.replace(ididOld[0], blocks['IDID'] + '\n');

// 4) 在韩区数组结尾（第一个 ^];）前追加 izna / KickFlip / AHOF
const append = '\n' + blocks['izna'] + '\n\n' + blocks['KickFlip'] + '\n\n' + blocks['AHOF'] + '\n';
const endIdx = src.search(/\n\];/);
if (endIdx < 0) throw new Error('array end not found');
src = src.slice(0, endIdx) + '\n' + append + src.slice(endIdx);

fs.writeFileSync(file, src);
console.log('注入完成');
