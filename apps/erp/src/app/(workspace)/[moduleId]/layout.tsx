import { SystemAdminSectionSkeleton } from "@/app-route-state/route-states";
import { HrSectionNav } from "@/workspace-routes/hr-section-nav.server";
import { SystemAdminSectionNav } from "@/workspace-routes/system-admin-section-nav.server";
import { HR_MODULE_ID } from "@/lib/hr-route.shared";
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
        {params.then(({ moduleId }) => {
          if (moduleId === SYSTEM_ADMIN_MODULE_ID) {
            return <SystemAdminSectionNav moduleId={moduleId} />;
          }
          if (moduleId === HR_MODULE_ID) {
            return <HrSectionNav moduleId={moduleId} />;
          }
          return null;
        })}
      </Suspense>
      {children}
    </div>
  );
}
