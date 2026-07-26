/* ============================================================
   R7 Fortune — Route Helper
   Works with both HashRouter (#/path) and BrowserRouter (/path).
   Use getAppPath() instead of window.location.pathname when
   constructing URLs for redirects, payment return paths, etc.
   ============================================================ */

/** Get the current app-level path (works in both hash & history mode) */
export function getAppPath(): string {
  if (typeof window === "undefined") return "/";
  // HashRouter mode: path is in window.location.hash (e.g. #/destiny-full-report)
  if (window.location.hash && window.location.hash.startsWith("#/")) {
    return window.location.hash.slice(1); // remove leading #
  }
  // BrowserRouter mode: path is in window.location.pathname
  return window.location.pathname + window.location.search;
}

/** Build a full return path string for payment redirects */
export function getAppReturnPath(): string {
  return getAppPath();
}
