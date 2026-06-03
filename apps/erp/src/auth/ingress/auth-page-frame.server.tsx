import "server-only";

import { getAuthPageShellCopy, type AuthPageMetadataKey } from "@afenda/kernel";
import type { ReactNode } from "react";
import { Suspense } from "react";
import { Skeleton } from "@afenda/ui/skeleton";
import { AuthShell } from "./auth-shell.server";

export function AuthPageFrame({
  pageKey,
  skeletonHeightClass = "h-56",
  children,
}: {
  pageKey: AuthPageMetadataKey;
  skeletonHeightClass?: string;
  children: ReactNode;
}) {
  const shellCopy = getAuthPageShellCopy(pageKey);

  return (
    <Suspense
      fallback={
        <AuthShell
          description={shellCopy.suspenseDescription}
          pageKey={pageKey}
          title={shellCopy.title}
        >
          <div className="flex flex-col gap-4">
            <Skeleton className="h-7 w-4/5 max-w-xs rounded-control" />
            <Skeleton className="h-4 w-full rounded-control" />
            <Skeleton className={`${skeletonHeightClass} rounded-section`} />
            <Skeleton className="h-10 w-full rounded-control" />
          </div>
        </AuthShell>
      }
    >
      {children}
    </Suspense>
  );
}
