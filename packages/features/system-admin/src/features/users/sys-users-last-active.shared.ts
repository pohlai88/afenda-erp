import { formatErpDateTime } from "@afenda/kernel";
import type { SystemAdminUserStatus } from "./sys-users.contract";

export function formatSystemAdminUserLastActive(input: {
  status: SystemAdminUserStatus;
  lastAuditAt: Date | null;
  membershipUpdatedAt: Date | null;
}) {
  if (input.status === "invited") {
    return "Not joined";
  }

  if (input.status === "removed") {
    return input.membershipUpdatedAt
      ? formatErpDateTime(input.membershipUpdatedAt)
      : "Removed";
  }

  const activityAt =
    input.lastAuditAt && input.membershipUpdatedAt
      ? input.lastAuditAt > input.membershipUpdatedAt
        ? input.lastAuditAt
        : input.membershipUpdatedAt
      : (input.lastAuditAt ?? input.membershipUpdatedAt);

  if (!activityAt) {
    return "No activity recorded";
  }

  return formatErpDateTime(activityAt);
}
