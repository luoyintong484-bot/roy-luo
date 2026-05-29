import "dotenv/config";

function required(name: string): string {
  const value = process.env[name];
  if (!value && process.env.NODE_ENV === "production") {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value ?? "";
}

function requiredUrl(name: string, defaultUrl: string): string {
  const value = process.env[name];
  if (!value || value === "") {
    if (process.env.NODE_ENV === "production") {
      throw new Error(`Missing required environment variable: ${name}`);
    }
    return defaultUrl;
  }
  // Ensure the URL has an http/https prefix
  if (!/^https?:\/\//i.test(value)) {
    return `https://${value}`;
  }
  return value;
}

export const env = {
  appId: required("APP_ID"),
  appSecret: required("APP_SECRET"),
  isProduction: process.env.NODE_ENV === "production",
  databaseUrl: required("DATABASE_URL"),
  kimiAuthUrl: requiredUrl("KIMI_AUTH_URL", "https://open.moonshot.cn"),
  kimiOpenUrl: requiredUrl("KIMI_OPEN_URL", "https://api.moonshot.cn"),
  ownerUnionId: process.env.OWNER_UNION_ID ?? "",
};
