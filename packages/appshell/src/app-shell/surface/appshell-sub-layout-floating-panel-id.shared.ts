export function appShellSubLayoutFloatingPanelId(storageKey?: string) {
  return storageKey
    ? `af-appshell-sub-layout-${storageKey}`
    : "af-appshell-sub-layout";
}
