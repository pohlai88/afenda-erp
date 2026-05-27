import { getOrganizationContext } from "@afenda/auth/server";
import {
  getAccessibleModules,
  getNavigationExtensions,
  roleOperatingPosture,
} from "@afenda/domain";
import { AppShellSkeleton } from "@/components/route-states";
import { signOutAction } from "../(auth)/actions";
import { ShellFrame } from "@afenda/ui";
import { Suspense } from "react";
import { AppSidebar } from "./app-sidebar";

export default function ProtectedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Suspense fallback={<AppShellSkeleton />}>
      <ProtectedLayoutInner>{children}</ProtectedLayoutInner>
    </Suspense>
  );
}

async function ProtectedLayoutInner({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { session, organization } = await getOrganizationContext();
  const accessibleModules = getAccessibleModules(organization.capabilities);
  const navigationExtensions = getNavigationExtensions(
    organization.capabilities,
  );
  const activeRouteCount =
    accessibleModules.length + navigationExtensions.length;
  const posture = roleOperatingPosture[organization.role];

  return (
    <ShellFrame
      sidebar={
        <div>
          <div className="rounded-lg border border-line bg-surface p-4">
            <div className="text-xs uppercase tracking-wide text-muted">
              Active organization
            </div>
            <div className="mt-3 text-lg font-semibold text-foreground">
              {organization.name}
            </div>
            <div className="mt-1 text-sm text-muted">{posture.title}</div>
            <div className="mt-2 text-sm leading-6 text-muted">
              {posture.description}
            </div>
            <div className="mt-4 rounded-lg border border-line bg-surface-strong px-3 py-2 text-xs uppercase tracking-wide text-muted">
              {activeRouteCount} accessible routes
            </div>
          </div>
          <div className="mt-6">
            <AppSidebar
              extensions={navigationExtensions}
              modules={accessibleModules}
            />
          </div>
        </div>
      }
      header={
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="text-xs uppercase tracking-wide text-muted">
              Tenant workspace
            </div>
            <div className="text-lg font-semibold text-foreground">
              {organization.name}
            </div>
            <div className="mt-1 text-sm text-muted">
              {organization.slug} · {activeRouteCount} active routes
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-sm font-medium text-foreground">
                {session.name}
              </div>
              <div className="text-xs text-muted">{session.email}</div>
            </div>
            <form action={signOutAction}>
              <button
                className="rounded-lg border border-line bg-surface-strong px-3 py-2 text-sm text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                type="submit"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
      }
    >
      {children}
    </ShellFrame>
  );
}
