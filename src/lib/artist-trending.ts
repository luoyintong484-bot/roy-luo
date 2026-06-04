/* ============================================================
   R7 Fortune — Artist Popularity Tracker
   localStorage-based · Ready for real API integration
   ============================================================ */

const STORAGE_KEY = "r7_artist_heat";

export interface ArtistHeat {
  id: number;
  score: number;       // 综合热度分 0-1000
  trend: "up" | "down" | "stable";
  change: number;      // 变化量
  lastUpdated: string;
}

/** Generate initial heat data for all artists (simulated) */
export function initHeatData(artistIds: number[]): void {
  const existing = getHeatMap();
  artistIds.forEach(id => {
    if (!existing[id]) {
      existing[id] = {
        id, score: Math.floor(Math.random() * 800) + 100,
        trend: "stable", change: 0, lastUpdated: new Date().toISOString(),
      };
    }
  });
  saveHeatMap(existing);
}

/** Get all heat data */
function getHeatMap(): Record<number, ArtistHeat> {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}"); } catch { return {}; }
}

function saveHeatMap(data: Record<number, ArtistHeat>) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch {}
}

/** Simulate a refresh cycle — update scores with random fluctuations */
export function refreshHeatData(artistIds: number[]): Record<number, ArtistHeat> {
  const hm = getHeatMap();
  artistIds.forEach(id => {
    const prev = hm[id]?.score || 500;
    const delta = Math.floor((Math.random() - 0.48) * 60); // bias slightly upward
    const newScore = Math.max(50, Math.min(999, prev + delta));
    const trend = delta > 5 ? "up" : delta < -5 ? "down" : "stable";
    hm[id] = { id, score: newScore, trend, change: delta, lastUpdated: new Date().toISOString() };
  });
  saveHeatMap(hm);
  return hm;
}

/** Get top N trending artists */
export function getTopTrending(n: number = 20): ArtistHeat[] {
  const hm = getHeatMap();
  return Object.values(hm).sort((a, b) => b.score - a.score).slice(0, n);
}

/** Get heat for specific artist */
export function getArtistHeat(id: number): ArtistHeat | null {
  return getHeatMap()[id] || null;
}
