import { signOutAction } from "@/app/(auth)/actions";
import { loadWorkspaceShellNavigation } from "@/workspace-routes/workspace-route-cache";
import { WorkspaceCommandHeader } from "@/workspace-routes/workspace-shell-chrome";

export async function WorkspaceShellHeader() {
  const { session, organization, activeRouteCount } =
    await loadWorkspaceShellNavigation();

  return (
    <WorkspaceCommandHeader
      activeRouteCount={activeRouteCount}
      organizationName={organization.name}
      organizationSlug={organization.slug}
      sessionEmail={session.email}
      sessionName={session.name}
      signOutAction={signOutAction}
    />
  );
}
