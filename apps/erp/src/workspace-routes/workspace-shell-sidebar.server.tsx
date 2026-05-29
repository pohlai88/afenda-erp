import { loadWorkspaceShellNavigation } from "@/workspace-routes/workspace-route-cache";
import { AppSidebar } from "@/workspace-routes/app-sidebar";
import { WorkspaceOrgPanel } from "@/workspace-routes/workspace-shell-chrome";

export async function WorkspaceShellSidebar() {
  const {
    organization,
    accessibleModules,
    navigationExtensions,
    activeRouteCount,
    posture,
  } = await loadWorkspaceShellNavigation();

  return (
    <div className="flex h-full flex-col gap-surface-2xl">
      <WorkspaceOrgPanel
        activeRouteCount={activeRouteCount}
        organizationName={organization.name}
        organizationSlug={organization.slug}
        postureDescription={posture.description}
        postureTitle={posture.title}
        role={organization.role}
      />
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="mb-surface-md type-label">Navigation</div>
        <AppSidebar extensions={navigationExtensions} modules={accessibleModules} />
      </div>
    </div>
  );
}
