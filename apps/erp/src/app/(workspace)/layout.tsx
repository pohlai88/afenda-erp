import { DevSignInFloatingPanel } from "@/app/(auth)/_components/dev-sign-in-floating-panel";
import {
  WorkspaceHeaderSkeleton,
  WorkspaceSidebarSkeleton,
} from "@/workspace-routes/workspace-shell-skeletons";
import { WorkspaceShellHeader } from "@/workspace-routes/workspace-shell-header.server";
import { WorkspaceShellSidebar } from "@/workspace-routes/workspace-shell-sidebar.server";
import { ShellFrame } from "@afenda/ui";
import { Suspense } from "react";

export const unstable_instant = {
  prefetch: "static",
  unstable_disableValidation: true,
};

/**
 * Authenticated ERP shell (Next.js route group — URL unchanged).
 * Sidebar and header stream in parallel; page content uses route-level loading.tsx.
 */
export default function WorkspaceLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <ShellFrame
        header={
          <Suspense fallback={<WorkspaceHeaderSkeleton />}>
            <WorkspaceShellHeader />
          </Suspense>
        }
        sidebar={
          <Suspense fallback={<WorkspaceSidebarSkeleton />}>
            <WorkspaceShellSidebar />
          </Suspense>
        }
      >
        {children}
      </ShellFrame>
      <DevSignInFloatingPanel />
    </>
  );
}
