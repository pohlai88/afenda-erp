import type { ComponentProps } from "react";
import type { Badge } from "@afenda/ui/badge";
import type { SystemAdminUserStatus } from "../contracts";

export const systemAdminUserStatusBadgeVariant: Record<
  SystemAdminUserStatus,
  NonNullable<ComponentProps<typeof Badge>["variant"]>
> = {
  active: "success",
  invited: "warning",
  suspended: "critical",
  removed: "outline",
};
