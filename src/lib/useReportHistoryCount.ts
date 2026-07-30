/* ============================================================
   useReportHistoryCount — live count of unlocked reports
   Subscribes to localStorage changes (both r7_report_history and
   r7_unlocked_reports) so the navbar badge updates the moment a
   payment completes on any page.
   ============================================================ */

import { useEffect, useState, useCallback } from "react";
import { getMergedReportHistory } from "./report-history";

export function useReportHistoryCount(): number {
  const [count, setCount] = useState<number>(() => {
    try {
      return getMergedReportHistory().length;
    } catch {
      return 0;
    }
  });

  const refresh = useCallback(() => {
    try {
      setCount(getMergedReportHistory().length);
    } catch {
      setCount(0);
    }
  }, []);

  useEffect(() => {
    refresh();
    const onStorage = (e: StorageEvent) => {
      if (
        e.key === "r7_report_history" ||
        e.key === "r7_unlocked_reports" ||
        e.key === null
      ) {
        refresh();
      }
    };
    const onLocal = () => refresh();
    window.addEventListener("storage", onStorage);
    // Custom event for same-window updates (PaymentSuccessPage dispatches this)
    window.addEventListener("r7:reports-updated", onLocal);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("r7:reports-updated", onLocal);
    };
  }, [refresh]);

  return count;
}

/** Fire the r7:reports-updated event after writing to the history store. */
export function notifyReportHistoryChanged(): void {
  try {
    window.dispatchEvent(new Event("r7:reports-updated"));
  } catch {
    /* ignore */
  }
}
