import type { ComponentProps } from "react";
import type { Badge } from "@afenda/ui/badge";
import type { SystemAdminUserStatus } from "./sys-users.contract";

export const systemAdminUserStatusBadgeVariant: Record<
  SystemAdminUserStatus,
  NonNullable<ComponentProps<typeof Badge>["variant"]>
> = {
  active: "success",
  invited: "warning",
  suspended: "critical",
  removed: "outline",
};
