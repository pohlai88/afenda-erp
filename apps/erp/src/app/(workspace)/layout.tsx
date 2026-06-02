import { DevSignInFloatingPanel } from "@/routes/auth/_components/dev-sign-in-floating-panel";
import { WorkspaceSkeleton } from "@/app-route-state/route-states";
import { WorkspaceAppShell } from "@/routes/workspace/shell/workspace-appshell.server";
import { Toaster } from "@afenda/ui/sonner";
import { Suspense } from "react";

export const unstable_instant = {
  prefetch: "static",
  unstable_disableValidation: true,
};

/**
 * Authenticated ERP shell (Next.js route group — URL unchanged).
 * The shell streams after server session and organization resolution.
 */
export default function WorkspaceLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Suspense fallback={<WorkspaceSkeleton />}>
        <WorkspaceAppShell>{children}</WorkspaceAppShell>
      </Suspense>
      <Toaster richColors />
      <DevSignInFloatingPanel />
    </>
  );
}
