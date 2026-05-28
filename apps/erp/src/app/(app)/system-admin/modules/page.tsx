import { moduleIds } from "@afenda/config/module-ids";
import {
  buildModulesListSurface,
  listTenantModuleSettings,
  requireSystemAdminModulesRead,
  systemAdminModulesSurfaceKey,
  updateSystemAdminModuleSettingsAction,
} from "@afenda/feature-system-admin/server";
import { GovernedPatternCListSection } from "@afenda/governed-surface/server";
import { getErpModuleById } from "@afenda/kernel";
import { SectionPanel } from "@afenda/ui";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Modules — System admin",
  description: "Module visibility and readiness configuration.",
};

export default async function SystemAdminModulesPage() {
  const { organization } = await requireSystemAdminModulesRead();
  const canMutate =
    organization.capabilities.includes("system-admin.modules.manage") ||
    organization.capabilities.includes("system-admin.settings.write");
  const settings = await listTenantModuleSettings({
    organizationId: organization.id,
    limit: 100,
  });
  const modules = moduleIds
    .map((id) => getErpModuleById(id))
    .filter((module) => module !== null)
    .map((module) => ({
      id: module.id,
      label: module.label,
      href: module.href,
      requiredCapability: module.requiredCapability,
    }));

  async function updateModule(formData: FormData) {
    "use server";
    await updateSystemAdminModuleSettingsAction(undefined, formData);
  }

  return (
    <div className="flex flex-col gap-6">
      <SectionPanel
        headingLevel={1}
        title="Modules"
        description="Tenant module availability and readiness controls."
      />

      <GovernedPatternCListSection
        title="Module readiness"
        surfaceKey={systemAdminModulesSurfaceKey}
        listConfiguration={buildModulesListSurface({ modules, settings })}
        parentAccessAllowed
        layout="embedded"
      />

      {canMutate ? (
        <SectionPanel title="Update module settings">
          <form action={updateModule} className="grid gap-3 md:grid-cols-4">
            <input name="moduleKey" placeholder="module key" className="rounded-md border border-line bg-background px-3 py-2 text-sm" />
            <select name="enabled" className="rounded-md border border-line bg-background px-3 py-2 text-sm" defaultValue="true">
              <option value="true">Enabled</option>
              <option value="false">Disabled</option>
            </select>
            <select name="visible" className="rounded-md border border-line bg-background px-3 py-2 text-sm" defaultValue="true">
              <option value="true">Visible</option>
              <option value="false">Hidden</option>
            </select>
            <select name="readiness" className="rounded-md border border-line bg-background px-3 py-2 text-sm" defaultValue="active">
              <option value="active">Active</option>
              <option value="preview">Preview</option>
              <option value="blocked">Blocked</option>
              <option value="deprecated">Deprecated</option>
            </select>
            <button className="rounded-md bg-foreground px-3 py-2 text-sm font-medium text-background md:col-span-4">
              Save module settings
            </button>
          </form>
        </SectionPanel>
      ) : null}
    </div>
  );
}
