import { isDevAuthBypassEnabled } from "@afenda/config/env";
import { cacheLife, cacheTag } from "next/cache";

import {
  listTenantCapabilitySettings,
  listTenantModuleSettings,
} from "./system-admin.execution-settings.repository.server";
import {
  WORKSPACE_NAVIGATION_SETTINGS_CACHE_SCOPE,
  workspaceNavigationSettingsCacheTag,
} from "../contracts/system-admin.workspace-navigation-cache.shared";

const MODULE_SETTINGS_LIMIT = 100;
const CAPABILITY_SETTINGS_LIMIT = 500;

const emptyWorkspaceNavigationSettings = {
  moduleSettings: [] as Awaited<
    ReturnType<typeof listTenantModuleSettings>
  >,
  capabilitySettings: [] as Awaited<
    ReturnType<typeof listTenantCapabilitySettings>
  >,
};

/**
 * Cached tenant navigation inputs for workspace shell (Cache Components).
 * Invalidated via `revalidateTag(workspaceNavigationSettingsCacheTag(orgId))`
 * from system-admin module/capability mutations.
 */
export async function loadCachedTenantNavigationSettings(
  organizationId: string,
) {
  if (isDevAuthBypassEnabled()) {
    return emptyWorkspaceNavigationSettings;
  }

  return loadCachedTenantNavigationSettingsForOrg(organizationId);
}

async function loadCachedTenantNavigationSettingsForOrg(
  organizationId: string,
) {
  "use cache";
  cacheLife("minutes");
  cacheTag(
    WORKSPACE_NAVIGATION_SETTINGS_CACHE_SCOPE,
    workspaceNavigationSettingsCacheTag(organizationId),
  );

  const [moduleSettings, capabilitySettings] = await Promise.all([
    listTenantModuleSettings({
      organizationId,
      limit: MODULE_SETTINGS_LIMIT,
    }),
    listTenantCapabilitySettings({
      organizationId,
      limit: CAPABILITY_SETTINGS_LIMIT,
    }),
  ]);

  return { moduleSettings, capabilitySettings };
}
