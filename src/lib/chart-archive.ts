/* ============================================================
   R7 Fortune — Star Chart Archive System
   Save/load natal + compatibility charts
   ============================================================ */

const STORAGE_KEY = "r7_chart_archive";

export interface SavedChart {
  id: string;
  type: "natal" | "synastry" | "cp";
  name: string;
  data: any;
  savedAt: string;
}

export function saveChart(type: SavedChart["type"], name: string, data: any): void {
  const archives = getArchives();
  archives.push({
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    type, name, data,
    savedAt: new Date().toISOString(),
  });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(archives));
  // Log operation
  logOperation(`Saved ${type} chart: ${name}`);
}

export function getArchives(): SavedChart[] {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); } catch { return []; }
}

export function deleteChart(id: string): void {
  const archives = getArchives().filter(a => a.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(archives));
}

function logOperation(action: string) {
  try {
    const logs = JSON.parse(localStorage.getItem("r7_operation_logs") || "[]");
    logs.push({ action, time: new Date().toISOString() });
    localStorage.setItem("r7_operation_logs", JSON.stringify(logs.slice(-200)));
  } catch {}
}
