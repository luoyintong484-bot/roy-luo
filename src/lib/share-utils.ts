/* ============================================================
   R7 Fortune — Global Share Utility v3
   Soft pink-purple sparkles · 测测-aligned 4-tier gradients
   Bilingual · 9:16 HD · Global reusable interface
   ============================================================ */

import { TIER_COLORS } from "@/lib/cp-copywriting";

const PW = 540;
const PH = 960;

export interface PosterData {
  title: string;
  subtitle: string;
  tier: number;
  tierColor: string;
  tierGlow: string;
  tierGrad: [string, string];
  /** Large destiny tag — centerpiece (was score) */
  label: string;
  /** One-line tier phrase e.g. "靈魂深處與生俱來的契合" */
  phrase: string;
  essays: string[];
  keywords?: string[];
  leftName: string;
  rightName: string;
}

// ---- cache ----
let _cacheKey = "";
let _cacheCanvas: HTMLCanvasElement | null = null;

function dataKey(d: PosterData): string {
  return `${d.title}|${d.tier}|${d.label}`;
}

/** Render poster to canvas — optimized v4: bold score, balanced layout, keyword row */
export function renderPosterToCanvas(data: PosterData): HTMLCanvasElement {
  const key = dataKey(data);
  if (_cacheCanvas && _cacheKey === key) return _cacheCanvas;

  const canvas = document.createElement("canvas");
  const dpr = 2;
  canvas.width = PW * dpr;
  canvas.height = PH * dpr;
  const ctx = canvas.getContext("2d")!;
  ctx.scale(dpr, dpr);

  const cx = PW / 2;
  const s = key.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const isHighTier = data.tier === 1;

  // ---- Background ----
  ctx.fillStyle = "#0a0a0f";
  ctx.fillRect(0, 0, PW, PH);

  // Central glow — enhanced for high tier
  const glowR = isHighTier ? PH * 0.45 : PH * 0.38;
  const glowGrad = ctx.createRadialGradient(cx, PH * 0.36, 60, cx, PH * 0.36, glowR);
  glowGrad.addColorStop(0, isHighTier ? data.tierColor + "18" : data.tierGlow);
  glowGrad.addColorStop(1, "transparent");
  ctx.fillStyle = glowGrad;
  ctx.fillRect(0, 0, PW, PH);

  // Sparkle particles — denser near center
  for (let i = 0; i < 85; i++) {
    const sx = ((s * (i + 1) * 16807) % 2147483647) / 2147483647 * PW;
    const sy = ((s * (i + 7) * 48271) % 2147483647) / 2147483647 * PH;
    const sr = 0.3 + ((i * 7 + s) % 10) / 10 * 1.6;
    const sa = 0.04 + ((i * 3 + s) % 10) / 10 * 0.18;
    const g = ctx.createRadialGradient(sx, sy, 0, sx, sy, sr * 3);
    g.addColorStop(0, `rgba(255, 200, 220, ${sa})`);
    g.addColorStop(1, "rgba(200, 180, 220, 0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(sx, sy, sr * 3, 0, Math.PI * 2);
    ctx.fill();
  }

  // Decorative hearts/stars — background
  ctx.textAlign = "center";
  for (let i = 0; i < 10; i++) {
    const hx = ((s * (i * 17 + 3)) % 2147483647) / 2147483647 * PW;
    const hy = ((s * (i * 13 + 5)) % 2147483647) / 2147483647 * PH;
    const ha = 0.04 + ((i * 3) % 10) / 10 * 0.09;
    ctx.fillStyle = `rgba(255, 182, 193, ${ha})`;
    ctx.font = `${10 + (i % 3) * 4}px serif`;
    ctx.fillText(i % 3 === 0 ? "♥" : "✦", hx, hy);
  }

  // ---- Top watermark ----
  ctx.textAlign = "left";
  ctx.shadowColor = "rgba(255, 255, 255, 0.5)";
  ctx.shadowBlur = 4;
  ctx.fillStyle = "#FFFFFF";
  ctx.font = "10px 'Inter', sans-serif";
  ctx.fillText("R7 Fortune", 40, 42);
  ctx.shadowColor = "transparent";
  ctx.shadowBlur = 0;
  ctx.fillStyle = "rgba(180, 180, 200, 0.10)";
  ctx.font = "8px 'Inter', sans-serif";
  ctx.fillText("Website:  ____________", 40, 58);

  // ================================================================
  //  CENTER LAYOUT — tighter spacing, bolder score
  // ================================================================
  ctx.textAlign = "center";
  let y = 140;

  // Subtitle pill
  ctx.fillStyle = "rgba(255, 200, 220, 0.07)";
  ctx.strokeStyle = "rgba(255, 200, 220, 0.14)";
  ctx.lineWidth = 0.8;
  const pillW = 170; const pillH = 26;
  ctx.beginPath();
  ctx.roundRect(cx - pillW / 2, y, pillW, pillH, 13);
  ctx.fill(); ctx.stroke();
  ctx.fillStyle = "rgba(255, 200, 220, 0.7)";
  ctx.font = "10px 'Inter', sans-serif";
  ctx.fillText(data.subtitle, cx, y + pillH / 2 + 1);
  y += 50;

  // CP Names
  ctx.fillStyle = "#f0e6d3";
  ctx.font = "bold 38px 'Playfair Display', serif";
  ctx.fillText(data.title, cx, y);
  y += 20;

  // Heart accent
  ctx.fillStyle = data.tierColor + "88";
  ctx.font = "14px serif";
  ctx.fillText("♥", cx, y);
  y += 34;

  // ---- DESTINY TAG: large centerpiece (replaces score circle) ----
  const tagGrad = ctx.createLinearGradient(cx - 140, y - 30, cx + 140, y + 30);
  tagGrad.addColorStop(0, data.tierGrad[0]);
  tagGrad.addColorStop(1, data.tierGrad[1]);

  // Subtle glow behind tag
  ctx.fillStyle = data.tierColor + "0A";
  ctx.beginPath();
  ctx.ellipse(cx, y + 4, 160, 50, 0, 0, Math.PI * 2);
  ctx.fill();

  // ---- High-tier: hearts + stars around tag ----
  if (isHighTier) {
    for (let i = 0; i < 7; i++) {
      const angle = (i / 7) * Math.PI * 2 - Math.PI / 2;
      const hx = cx + Math.cos(angle) * 155;
      const hy = y + Math.sin(angle) * 48;
      ctx.fillStyle = data.tierColor + `${40 + (i % 3) * 15}`;
      ctx.font = `${13 + (i % 2) * 5}px serif`;
      ctx.fillText(i % 2 === 0 ? "♥" : "✦", hx, hy);
    }
  }

  // Destiny tag — large bold
  ctx.fillStyle = tagGrad;
  ctx.font = "bold 44px 'Playfair Display', serif";
  ctx.shadowColor = data.tierColor + "25";
  ctx.shadowBlur = 12;
  ctx.fillText(data.label, cx, y + 12);
  ctx.shadowColor = "transparent";
  ctx.shadowBlur = 0;

  y += 44;

  // Tier phrase — one line, elegant
  ctx.fillStyle = "rgba(230, 220, 215, 0.7)";
  ctx.font = "italic 15px 'Playfair Display', serif";
  ctx.fillText(data.phrase, cx, y);
  y += 30;

  // ---- Essays (2 paragraphs) ----
  ctx.fillStyle = "rgba(230, 220, 215, 0.62)";
  ctx.font = "12px 'Inter', sans-serif";
  for (const essay of data.essays.slice(0, 2)) {
    const words = essay.split("");
    let line = ""; let lineY = y;
    const maxW = PW - 100;
    for (const ch of words) {
      const test = line + ch;
      if (ctx.measureText(test).width > maxW && line.length > 0) {
        ctx.fillText(line, cx, lineY);
        line = ch;
        lineY += 22;
      } else { line = test; }
    }
    ctx.fillText(line, cx, lineY);
    y = lineY + 24;
  }
  y += 6;

  // ---- Keywords row (NEW: fills gap between essays and bottom) ----
  if (data.keywords && data.keywords.length > 0) {
    const kwText = data.keywords.join(" · ");
    ctx.fillStyle = "rgba(220, 200, 190, 0.45)";
    ctx.font = "11px 'Inter', sans-serif";
    ctx.fillText(kwText, cx, y);
    y += 26;
  }

  // ---- Divider ----
  ctx.strokeStyle = "rgba(255, 200, 220, 0.07)";
  ctx.lineWidth = 0.5;
  ctx.beginPath();
  ctx.moveTo(100, y);
  ctx.lineTo(PW - 100, y);
  ctx.stroke();
  y += 28;

  // ---- Names row at bottom (with glow) ----
  ctx.shadowColor = data.tierColor + "18";
  ctx.shadowBlur = 8;
  ctx.fillStyle = "#f0e6d3";
  ctx.font = "14px 'Inter', sans-serif";
  ctx.fillText(data.leftName, cx - 95, y);
  ctx.fillStyle = data.tierColor + "88";
  ctx.fillText("×", cx, y);
  ctx.fillStyle = "#f0e6d3";
  ctx.fillText(data.rightName, cx + 95, y);
  ctx.shadowColor = "transparent";
  ctx.shadowBlur = 0;

  // ---- Bottom watermark ----
  ctx.fillStyle = "rgba(255, 200, 210, 0.11)";
  ctx.font = "10px 'Inter', sans-serif";
  ctx.fillText("R7 Fortune", cx, PH - 38);

  ctx.textAlign = "start";

  _cacheCanvas = canvas;
  _cacheKey = key;
  return canvas;
}

export function clearPosterCache() {
  _cacheCanvas = null;
  _cacheKey = "";
}

/** Get platform share text */
export function getShareText(
  platform: string,
  name1: string, name2: string,
  score: number, label: string, tagline: string
): string {
  const h = "#R7Fortune #CP合盤";
  const texts: Record<string, string> = {
    Xiaohongshu: `✨ ${name1} × ${name2} CP合盤報告\n\n💫 匹配度 ${score}%\n💕 ${label} · ${tagline}\n\n星辰不說謊，命中註定的緣分藏不住。\n${h}`,
    TikTok: `💫 ${name1} × ${name2} 緣分${score}%！${label}！\n${h}`,
    Instagram: `💫 ${name1} × ${name2}\nFate Score: ${score}% · ${label}\n${tagline}\n${h}`,
    Facebook: `✨ R7 Fortune CP Report: ${name1} × ${name2}\nScore: ${score}% · ${label}\n"${tagline}"\n${h}`,
    "Twitter / X": `💫 ${name1} × ${name2}\n${score}% · ${label}\n${h}`,
  };
  return texts[platform] || `${name1} × ${name2} ${score}% ${label}\n${h}`;
}
