import {
  mysqlTable,
  mysqlEnum,
  serial,
  bigint,
  varchar,
  text,
  longtext,
  timestamp,
  int,
  date,
  boolean,
  json,
  decimal,
} from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: serial("id"),
  unionId: varchar("union_id", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 320 }),
  avatar: text("avatar"),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  freeReadings: int("free_readings").default(3).notNull(),
  divinationCount: int("divination_count").default(0).notNull(),
  isPremium: boolean("is_premium").default(false).notNull(),
  membershipType: mysqlEnum("membership_type", ["none", "monthly", "yearly"]).default("none").notNull(),
  membershipExpiresAt: timestamp("membership_expires_at"),
  language: varchar("language", { length: 10 }).default("zh-CN"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
});

export const userProfiles = mysqlTable("user_profiles", {
  id: serial("id"),
  userId: bigint("user_id", { mode: "number" }).notNull(),
  birthDate: date("birth_date").notNull(),
  birthTime: varchar("birth_time", { length: 10 }),
  birthPlace: varchar("birth_place", { length: 100 }),
  birthCity: varchar("birth_city", { length: 100 }),
  birthCountry: varchar("birth_country", { length: 100 }),
  timezone: varchar("timezone", { length: 20 }),
  latitude: varchar("latitude", { length: 20 }),
  longitude: varchar("longitude", { length: 20 }),
  gender: mysqlEnum("gender", ["male", "female", "other"]),
  lunarDate: varchar("lunar_date", { length: 50 }),
  zodiacSign: varchar("zodiac_sign", { length: 20 }),
  chineseZodiac: varchar("chinese_zodiac", { length: 10 }),
  baziDayPillar: varchar("bazi_day_pillar", { length: 20 }),
  starMansion: varchar("star_mansion", { length: 20 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
});

export const artistGroups = mysqlTable("artist_groups", {
  id: serial("id"),
  name: varchar("name", { length: 100 }).notNull(),
  nameEn: varchar("name_en", { length: 100 }),
  region: mysqlEnum("region", ["korea", "china", "japan", "other"]).notNull(),
  agency: varchar("agency", { length: 100 }),
  debutDate: date("debut_date"),
  memberCount: int("member_count"),
  element: varchar("element", { length: 20 }),
  avatar: varchar("avatar", { length: 500 }),
  bio: text("bio"),
  isDisbanded: boolean("is_disbanded").default(false),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const artists = mysqlTable("artists", {
  id: serial("id"),
  name: varchar("name", { length: 100 }).notNull(),
  stageName: varchar("stage_name", { length: 100 }),
  groupName: varchar("group_name", { length: 100 }),
  groupId: bigint("group_id", { mode: "number" }),
  avatar: varchar("avatar", { length: 500 }),
  birthDate: date("birth_date").notNull(),
  lunarBirthDate: varchar("lunar_birth_date", { length: 50 }),
  zodiacSign: varchar("zodiac_sign", { length: 20 }),
  chineseZodiac: varchar("chinese_zodiac", { length: 10 }),
  baziDayPillar: varchar("bazi_day_pillar", { length: 20 }),
  starMansion: varchar("star_mansion", { length: 20 }),
  element: varchar("element", { length: 20 }),
  nationality: varchar("nationality", { length: 50 }),
  agency: varchar("agency", { length: 100 }),
  debutDate: date("debut_date"),
  position: varchar("position", { length: 50 }),
  bio: text("bio"),
  tags: json("tags").$type<string[]>(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
});

export const artistSchedules = mysqlTable("artist_schedules", {
  id: serial("id"),
  artistId: bigint("artist_id", { mode: "number" }).notNull(),
  title: varchar("title", { length: 200 }).notNull(),
  eventType: mysqlEnum("event_type", ["concert", "fansign", "release", "variety", "award", "other"]).notNull(),
  eventDate: date("event_date").notNull(),
  location: varchar("location", { length: 200 }),
  description: text("description"),
  ticketStatus: mysqlEnum("ticket_status", ["onsale", "soldout", "upcoming", "cancelled"]).default("upcoming"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const readings = mysqlTable("readings", {
  id: serial("id"),
  userId: bigint("user_id", { mode: "number" }).notNull(),
  type: mysqlEnum("type", [
    "tarot",
    "natal_chart",
    "synastry",
    "annual_fortune",
    "itinerary_energy",
    "fan_artist_compatibility",
  ]).notNull(),
  subtype: varchar("subtype", { length: 50 }),
  title: varchar("title", { length: 200 }).notNull(),
  question: text("question"),
  inputData: json("input_data"),
  resultSummary: text("result_summary"),
  resultFull: longtext("result_full"),
  isPaid: boolean("is_paid").default(false).notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).default("0"),
  paidAt: timestamp("paid_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const payments = mysqlTable("payments", {
  id: serial("id"),
  userId: bigint("user_id", { mode: "number" }).notNull(),
  readingId: bigint("reading_id", { mode: "number" }),
  type: mysqlEnum("type", ["reading", "membership"]).notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  status: mysqlEnum("status", ["pending", "completed", "failed", "refunded"]).default("pending").notNull(),
  description: varchar("description", { length: 200 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
});

export const readingUnlocks = mysqlTable("reading_unlocks", {
  id: serial("id"),
  userId: bigint("user_id", { mode: "number" }).notNull(),
  readingId: bigint("reading_id", { mode: "number" }).notNull(),
  unlockedAt: timestamp("unlocked_at").defaultNow().notNull(),
});

// ===== Idol Compatibility Zone =====
export const idolCrawlLogs = mysqlTable("idol_crawl_logs", {
  id: serial("id"),
  source: varchar("source", { length: 50 }).notNull(),
  groupName: varchar("group_name", { length: 100 }),
  idolsFound: int("idols_found").default(0),
  idolsAdded: int("idols_added").default(0),
  idolsUpdated: int("idols_updated").default(0),
  status: mysqlEnum("status", ["running", "success", "partial", "failed"]).default("running"),
  errorMessage: text("error_message"),
  startedAt: timestamp("started_at").defaultNow().notNull(),
  finishedAt: timestamp("finished_at"),
});

export const compatibilityResults = mysqlTable("compatibility_results", {
  id: serial("id"),
  userId: bigint("user_id", { mode: "number" }),
  userBirthDate: date("user_birth_date").notNull(),
  userBirthTime: varchar("user_birth_time", { length: 10 }),
  userBirthPlace: varchar("user_birth_place", { length: 100 }),
  artistId: bigint("artist_id", { mode: "number" }).notNull(),
  // Western astrology
  synastryScore: int("synastry_score"),
  synastryKeywords: json("synastry_keywords").$type<string[]>(),
  synastryAspects: json("synastry_aspects"),
  // Bazi
  userDayPillar: varchar("user_day_pillar", { length: 20 }),
  userElement: varchar("user_element", { length: 10 }),
  artistElement: varchar("artist_element", { length: 10 }),
  elementScore: int("element_score"),
  elementComplement: varchar("element_complement", { length: 50 }),
  elementDetails: json("element_details"),
  // Star mansion relation
  starMansionRelation: varchar("star_mansion_relation", { length: 20 }),
  // Relationship tag (Soulmate/Deep Trust/Good Vibes/Best Friends/Tension/Rivals)
  relationTag: mysqlEnum("relation_tag", [
    "soulmate",
    "deep_trust",
    "good_vibes",
    "best_friends",
    "tension",
    "rivals",
  ]),
  relationLabel: varchar("relation_label", { length: 50 }),
  // Overall
  overallScore: int("overall_score"),
  overallSummary: text("overall_summary"),
  isPaid: boolean("is_paid").default(false).notNull(),
  isZiweiUnlocked: boolean("is_ziwei_unlocked").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Artist = typeof artists.$inferSelect;
export type ArtistGroup = typeof artistGroups.$inferSelect;
export type Reading = typeof readings.$inferSelect;
export type Payment = typeof payments.$inferSelect;
export type UserProfile = typeof userProfiles.$inferSelect;
export type ArtistSchedule = typeof artistSchedules.$inferSelect;
export type CompatibilityResult = typeof compatibilityResults.$inferSelect;
export type IdolCrawlLog = typeof idolCrawlLogs.$inferSelect;
