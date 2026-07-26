export type Coordinates = {
  city: string;
  country: string;
  longitude: number;
  latitude: number;
  timezone?: string;
};

export type TrueSolarTimeResult = {
  inputTime: string;
  trueSolarTime: string;
  date: string;
  longitudeDeltaMinutes: number;
  equationOfTimeMinutes: number;
  totalDeltaMinutes: number;
  hourBranch: string;
  crossedDate: "previous" | "same" | "next";
  coordinate?: Coordinates;
  warnings: string[];
  trace: string[];
};

const HOUR_BRANCHES = ["子", "丑", "丑", "寅", "寅", "卯", "卯", "辰", "辰", "巳", "巳", "午", "午", "未", "未", "申", "申", "酉", "酉", "戌", "戌", "亥", "亥", "子"];

export const CITY_COORDINATES: Coordinates[] = [
  { city: "北京", country: "中国", longitude: 116.4074, latitude: 39.9042, timezone: "Asia/Shanghai" },
  { city: "上海", country: "中国", longitude: 121.4737, latitude: 31.2304, timezone: "Asia/Shanghai" },
  { city: "广州", country: "中国", longitude: 113.2644, latitude: 23.1291, timezone: "Asia/Shanghai" },
  { city: "深圳", country: "中国", longitude: 114.0579, latitude: 22.5431, timezone: "Asia/Shanghai" },
  { city: "杭州", country: "中国", longitude: 120.1551, latitude: 30.2741, timezone: "Asia/Shanghai" },
  { city: "南京", country: "中国", longitude: 118.7969, latitude: 32.0603, timezone: "Asia/Shanghai" },
  { city: "成都", country: "中国", longitude: 104.0665, latitude: 30.5728, timezone: "Asia/Shanghai" },
  { city: "重庆", country: "中国", longitude: 106.5516, latitude: 29.563, timezone: "Asia/Shanghai" },
  { city: "武汉", country: "中国", longitude: 114.3054, latitude: 30.5931, timezone: "Asia/Shanghai" },
  { city: "西安", country: "中国", longitude: 108.9398, latitude: 34.3416, timezone: "Asia/Shanghai" },
  { city: "台北", country: "中国台湾", longitude: 121.5654, latitude: 25.033, timezone: "Asia/Taipei" },
  { city: "香港", country: "中国香港", longitude: 114.1694, latitude: 22.3193, timezone: "Asia/Hong_Kong" },
  { city: "澳门", country: "中国澳门", longitude: 113.5439, latitude: 22.1987, timezone: "Asia/Macau" },
  { city: "首尔", country: "韩国", longitude: 126.978, latitude: 37.5665, timezone: "Asia/Seoul" },
  { city: "Seoul", country: "South Korea", longitude: 126.978, latitude: 37.5665, timezone: "Asia/Seoul" },
  { city: "东京", country: "日本", longitude: 139.6917, latitude: 35.6895, timezone: "Asia/Tokyo" },
  { city: "Tokyo", country: "Japan", longitude: 139.6917, latitude: 35.6895, timezone: "Asia/Tokyo" },
  { city: "新加坡", country: "新加坡", longitude: 103.8198, latitude: 1.3521, timezone: "Asia/Singapore" },
  { city: "Singapore", country: "Singapore", longitude: 103.8198, latitude: 1.3521, timezone: "Asia/Singapore" },
  { city: "曼谷", country: "泰国", longitude: 100.5018, latitude: 13.7563, timezone: "Asia/Bangkok" },
  { city: "Bangkok", country: "Thailand", longitude: 100.5018, latitude: 13.7563, timezone: "Asia/Bangkok" },
  { city: "吉隆坡", country: "马来西亚", longitude: 101.6869, latitude: 3.139, timezone: "Asia/Kuala_Lumpur" },
  { city: "Kuala Lumpur", country: "Malaysia", longitude: 101.6869, latitude: 3.139, timezone: "Asia/Kuala_Lumpur" },
  { city: "纽约", country: "美国", longitude: -74.006, latitude: 40.7128, timezone: "America/New_York" },
  { city: "New York", country: "United States", longitude: -74.006, latitude: 40.7128, timezone: "America/New_York" },
  { city: "洛杉矶", country: "美国", longitude: -118.2437, latitude: 34.0522, timezone: "America/Los_Angeles" },
  { city: "Los Angeles", country: "United States", longitude: -118.2437, latitude: 34.0522, timezone: "America/Los_Angeles" },
  { city: "伦敦", country: "英国", longitude: -0.1276, latitude: 51.5072, timezone: "Europe/London" },
  { city: "London", country: "United Kingdom", longitude: -0.1276, latitude: 51.5072, timezone: "Europe/London" },
  { city: "巴黎", country: "法国", longitude: 2.3522, latitude: 48.8566, timezone: "Europe/Paris" },
  { city: "Paris", country: "France", longitude: 2.3522, latitude: 48.8566, timezone: "Europe/Paris" },
  { city: "悉尼", country: "澳大利亚", longitude: 151.2093, latitude: -33.8688, timezone: "Australia/Sydney" },
  { city: "Sydney", country: "Australia", longitude: 151.2093, latitude: -33.8688, timezone: "Australia/Sydney" },
  { city: "多伦多", country: "加拿大", longitude: -79.3832, latitude: 43.6532, timezone: "America/Toronto" },
  { city: "Toronto", country: "Canada", longitude: -79.3832, latitude: 43.6532, timezone: "America/Toronto" },
  { city: "温哥华", country: "加拿大", longitude: -123.1207, latitude: 49.2827, timezone: "America/Vancouver" },
  { city: "Vancouver", country: "Canada", longitude: -123.1207, latitude: 49.2827, timezone: "America/Vancouver" },
];

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function normalize(value?: string) {
  return String(value || "").trim().toLowerCase();
}

export function resolveCityCoordinates(city?: string, country?: string): Coordinates | undefined {
  const targetCity = normalize(city);
  const targetCountry = normalize(country);
  if (!targetCity && !targetCountry) return undefined;

  return CITY_COORDINATES.find((item) => {
    const cityMatch = normalize(item.city) === targetCity || targetCity.includes(normalize(item.city)) || normalize(item.city).includes(targetCity);
    const countryMatch = !targetCountry || normalize(item.country) === targetCountry || targetCountry.includes(normalize(item.country));
    return cityMatch && countryMatch;
  });
}

export function getEquationOfTimeMinutes(date: Date) {
  const start = new Date(date.getFullYear(), 0, 0);
  const dayOfYear = Math.floor((date.getTime() - start.getTime()) / 86400000);
  const b = (2 * Math.PI * (dayOfYear - 81)) / 364;
  return Math.round(9.87 * Math.sin(2 * b) - 7.53 * Math.cos(b) - 1.5 * Math.sin(b));
}

export function getHourBranch(hour: number) {
  return HOUR_BRANCHES[((hour % 24) + 24) % 24] || "子";
}

function getTimezoneOffsetHours(date: Date, timezone?: string) {
  if (!timezone) return 8;
  try {
    const probe = new Date(Date.UTC(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      12,
      0,
      0,
    ));
    const parts = new Intl.DateTimeFormat("en-CA", {
      timeZone: timezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    }).formatToParts(probe);
    const value = (type: Intl.DateTimeFormatPartTypes) => Number(parts.find((part) => part.type === type)?.value || 0);
    const representedUtc = Date.UTC(value("year"), value("month") - 1, value("day"), value("hour"), value("minute"));
    return (representedUtc - probe.getTime()) / 3600000;
  } catch {
    return 8;
  }
}

export function calculateTrueSolarTime(params: {
  birthDate: string;
  birthTime?: string;
  city?: string;
  country?: string;
  longitude?: number;
  latitude?: number;
}): TrueSolarTimeResult {
  const date = new Date(params.birthDate);
  const safeDate = Number.isNaN(date.getTime()) ? new Date() : date;
  const [rawHour, rawMinute] = String(params.birthTime || "12:00").split(":");
  const hour = Math.max(0, Math.min(23, Number(rawHour) || 0));
  const minute = Math.max(0, Math.min(59, Number(rawMinute) || 0));
  const resolvedCoordinate = resolveCityCoordinates(params.city, params.country);
  const coordinate = typeof params.longitude === "number"
    ? {
        city: params.city || resolvedCoordinate?.city || "Custom",
        country: params.country || resolvedCoordinate?.country || "",
        longitude: params.longitude,
        latitude: params.latitude ?? resolvedCoordinate?.latitude ?? 0,
        timezone: resolvedCoordinate?.timezone,
      }
    : resolvedCoordinate;

  const warnings: string[] = [];
  const longitude = coordinate?.longitude ?? 120;
  if (!coordinate) warnings.push("未匹配到出生地经纬度，暂按东八区标准经度 120° 计算，请在正式解读前复核出生地。");

  const timezoneOffsetHours = getTimezoneOffsetHours(safeDate, coordinate?.timezone);
  const standardMeridian = timezoneOffsetHours * 15;
  const longitudeDeltaMinutes = Math.round((longitude - standardMeridian) * 4);
  const equationOfTimeMinutes = getEquationOfTimeMinutes(safeDate);
  const totalDeltaMinutes = longitudeDeltaMinutes + equationOfTimeMinutes;
  const inputTotal = hour * 60 + minute;
  const shifted = inputTotal + totalDeltaMinutes;
  const wrapped = ((shifted % 1440) + 1440) % 1440;
  const crossedDate: TrueSolarTimeResult["crossedDate"] = shifted < 0 ? "previous" : shifted >= 1440 ? "next" : "same";
  const resultDate = new Date(safeDate);
  if (crossedDate === "previous") resultDate.setDate(resultDate.getDate() - 1);
  if (crossedDate === "next") resultDate.setDate(resultDate.getDate() + 1);
  const trueHour = Math.floor(wrapped / 60);
  const trueMinute = wrapped % 60;

  if (hour === 23) warnings.push("当前输入位于夜子时区间，默认按当日晚子时校验；如出生记录采用早子时口径，请人工复核。");
  if (hour === 0) warnings.push("当前输入位于早子时区间，默认按当日早子时校验。");
  if (crossedDate !== "same") warnings.push("真太阳时换算后发生日期跨越，排盘时已按换算后的日期与时辰提示处理。");

  return {
    inputTime: `${pad(hour)}:${pad(minute)}`,
    trueSolarTime: `${pad(trueHour)}:${pad(trueMinute)}`,
    date: `${resultDate.getFullYear()}-${pad(resultDate.getMonth() + 1)}-${pad(resultDate.getDate())}`,
    longitudeDeltaMinutes,
    equationOfTimeMinutes,
    totalDeltaMinutes,
    hourBranch: getHourBranch(trueHour),
    crossedDate,
    coordinate,
    warnings,
    trace: [
      `出生地：${coordinate ? `${coordinate.city} ${coordinate.longitude.toFixed(2)}°E` : "未匹配，使用 120°E 兜底"}`,
      `时区标准经线：UTC${timezoneOffsetHours >= 0 ? "+" : ""}${timezoneOffsetHours} / ${standardMeridian.toFixed(2)}°`,
      `经度校正：${longitudeDeltaMinutes >= 0 ? "+" : ""}${longitudeDeltaMinutes} 分钟`,
      `均时差：${equationOfTimeMinutes >= 0 ? "+" : ""}${equationOfTimeMinutes} 分钟`,
      `真太阳时：${pad(trueHour)}:${pad(trueMinute)}（${getHourBranch(trueHour)}时）`,
    ],
  };
}
