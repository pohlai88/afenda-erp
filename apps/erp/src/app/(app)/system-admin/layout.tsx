import { SystemAdminNav } from "@afenda/feature-system-admin/client";
import {
  requireSystemAdminRead,
  resolveSystemAdminNavItems,
} from "@afenda/feature-system-admin/server";
import type { ReactNode } from "react";

export default async function SystemAdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const { organization } = await requireSystemAdminRead();
  const navItems = resolveSystemAdminNavItems(organization.capabilities).map(
    (item) => ({
      href: item.href,
      label: item.label,
      exact: "exact" in item ? item.exact : undefined,
    }),
  );

  return (
    <div className="flex flex-col gap-6">
      <SystemAdminNav items={navItems} />
      {children}
    </div>
  );
}
