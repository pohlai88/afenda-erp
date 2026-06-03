export function browserStorageAvailable(kind: "localStorage" | "sessionStorage") {
  if (typeof window === "undefined") {
    return false;
  }

  try {
    const storage = window[kind];
    const probe = "__afenda_appshell_probe__";
    storage.setItem(probe, probe);
    storage.removeItem(probe);
    return true;
  } catch {
    return false;
  }
}
