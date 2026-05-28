import { requireCapability } from "@afenda/auth/server";
import { SystemAdminNav } from "@/components/system-admin/system-admin-nav.client";
import type { ReactNode } from "react";

export default async function SystemAdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  await requireCapability("system-admin.view");

  return (
    <div className="flex flex-col gap-6">
      <SystemAdminNav />
      {children}
    </div>
  );
}
