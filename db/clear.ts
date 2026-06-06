import { getDb } from "./queries/connection";

async function clear() {
  const db = getDb();
  console.log("Dropping all tables...");
  try {
    await db.execute("DROP TABLE IF EXISTS artist_schedules");
    console.log("Dropped artist_schedules");
  } catch (e) {
    console.log("artist_schedules may not exist");
  }
  try {
    await db.execute("DROP TABLE IF EXISTS readings");
    console.log("Dropped readings");
  } catch (e) {
    console.log("readings may not exist");
  }
  try {
    await db.execute("DROP TABLE IF EXISTS payments");
    console.log("Dropped payments");
  } catch (e) {
    console.log("payments may not exist");
  }
  try {
    await db.execute("DROP TABLE IF EXISTS artists");
    console.log("Dropped artists");
  } catch (e) {
    console.log("artists may not exist");
  }
  try {
    await db.execute("DROP TABLE IF EXISTS users");
    console.log("Dropped users");
  } catch (e) {
    console.log("users may not exist");
  }
  console.log("Done!");
}

clear().catch(console.error);
