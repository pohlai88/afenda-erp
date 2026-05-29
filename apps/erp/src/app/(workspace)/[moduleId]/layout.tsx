import { SystemAdminSectionSkeleton } from "@/app-route-state/route-states";
import { SystemAdminSectionNav } from "@/workspace-routes/system-admin-section-nav.server";
import { SYSTEM_ADMIN_MODULE_ID } from "@/lib/system-admin-route.shared";
import type { ReactNode } from "react";
import { Suspense } from "react";

type ModuleIdLayoutProps = {
  children: ReactNode;
  params: Promise<{ moduleId: string }>;
};

export default function ModuleIdLayout({
  children,
  params,
}: ModuleIdLayoutProps) {
  return (
    <div className="flex flex-col gap-surface-2xl">
      <Suspense fallback={<SystemAdminSectionSkeleton />}>
        {params.then(({ moduleId }) =>
          moduleId === SYSTEM_ADMIN_MODULE_ID ? (
            <SystemAdminSectionNav moduleId={moduleId} />
          ) : null,
        )}
      </Suspense>
      {children}
    </div>
  );
}
