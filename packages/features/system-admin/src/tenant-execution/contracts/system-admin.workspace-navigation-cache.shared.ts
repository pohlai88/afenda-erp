/** Cache scope for workspace shell navigation (module + capability settings). */
export const WORKSPACE_NAVIGATION_SETTINGS_CACHE_SCOPE =
  "workspace-nav-settings" as const;

export function workspaceNavigationSettingsCacheTag(organizationId: string) {
  return `${WORKSPACE_NAVIGATION_SETTINGS_CACHE_SCOPE}:${organizationId}`;
}
