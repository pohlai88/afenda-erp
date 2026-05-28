import { SystemAdminNav } from "@afenda/feature-system-admin/client";
import { requireSystemAdminRead } from "@afenda/feature-system-admin/server";
import type { ReactNode } from "react";

export default async function SystemAdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  await requireSystemAdminRead();

  return (
    <div className="flex flex-col gap-6">
      <SystemAdminNav />
      {children}
    </div>
  );
}
