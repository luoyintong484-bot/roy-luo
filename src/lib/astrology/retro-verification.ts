import type { ZiweiChart } from "@/lib/ziwei-doushu";

export type RetroVerificationItem = {
  id: string;
  title: string;
  description: string;
  dataPoint: string;
};

function palaceText(chart: ZiweiChart, palaceName: string) {
  const palace = chart.palaces.find((item) => item.name === palaceName);
  if (!palace) return "盘面未形成明显集中";
  const stars = palace.stars.length ? palace.stars.join("、") : "无正曜，需借对宫";
  const four = palace.four.length ? `，并见${palace.four.join("、")}` : "";
  return `${palaceName}${stars}${four}`;
}

export function buildRetroVerificationItems(chart: ZiweiChart): RetroVerificationItem[] {
  const career = palaceText(chart, "官禄");
  const love = palaceText(chart, "夫妻");
  const wealth = palaceText(chart, "财帛");
  const fortune = palaceText(chart, "福德");

  return [
    {
      id: "life-rhythm",
      title: "人生节奏校验",
      description: `你是否更像“先观察局势，再决定投入”的类型，而不是完全凭冲动快速决定？${chart.mainStar}坐命通常会让人在关键选择前先确认规则与安全边界。`,
      dataPoint: `命宫：${chart.mingPalace}；身宫：${chart.shenPalace}；主星：${chart.mainStar}`,
    },
    {
      id: "career-money",
      title: "事业与资源校验",
      description: `过去几年里，你是否明显感到事业方向、收入方式或合作关系需要重新整理？${career}，${wealth}，说明资源与职业定位会互相影响。`,
      dataPoint: `${career} / ${wealth}`,
    },
    {
      id: "emotion-relation",
      title: "关系与内在需求校验",
      description: `在亲密关系或重要人际里，你是否会一边想靠近，一边又需要对方给出稳定回应？${love}，${fortune}，这类组合常把安全感议题放大。`,
      dataPoint: `${love} / ${fortune}`,
    },
  ];
}

export function buildVerificationWarning(choice: "match" | "unsure" | "mismatch") {
  if (choice === "match") return "用户确认回溯校验基本符合，可继续生成报告。";
  if (choice === "unsure") return "用户对回溯校验不确定，报告需提示出生时间或地点可能影响细节。";
  return "用户反馈回溯校验不符合，建议回到资料页修正出生时间、出生地或历法。";
}
