import { writeExecutionAuditEvent } from "@afenda/kernel/execution";
import { filterSystemAdminListRows } from "../../overview/contracts/system-admin.list-filter.shared";
import {
  resolveSystemAdminListSearch,
  resolveSystemAdminListStatusFilter,
} from "../../overview/contracts/system-admin.list-search.shared";
import type { SystemAdminUserRow, SystemAdminUserStatus } from "../contracts";
import { listSystemAdminUsers } from "./system-admin.users.query.server";

const USER_LIST_SEARCH_FIELDS = ["name", "email"] as const;

function isSystemAdminUserStatus(value: string): value is SystemAdminUserStatus {
  return (
    value === "invited" ||
    value === "active" ||
    value === "suspended" ||
    value === "removed"
  );
}

export async function buildSystemAdminUsersPageModel(input: {
  organizationId: string;
  actorId: string;
  actorType: "user" | "system" | "agent";
  searchParams?: Record<string, string | string[] | undefined>;
  limit?: number;
}) {
  const searchValue = resolveSystemAdminListSearch(input.searchParams, "users");
  const statusParam = resolveSystemAdminListStatusFilter(
    input.searchParams,
    "users",
  );
  const statusFilter =
    statusParam && isSystemAdminUserStatus(statusParam) ? statusParam : undefined;

  const allUsers = await listSystemAdminUsers({
    organizationId: input.organizationId,
    limit: input.limit ?? 100,
  });

  const statusFiltered = statusFilter
    ? allUsers.filter((user) => user.status === statusFilter)
    : allUsers;

  const users = filterSystemAdminListRows(
    statusFiltered,
    searchValue,
    USER_LIST_SEARCH_FIELDS,
  ) as SystemAdminUserRow[];

  await writeExecutionAuditEvent({
    organizationId: input.organizationId,
    actorId: input.actorId,
    actorType: input.actorType,
    action: "system-admin.user_directory.view",
    targetType: "organization",
    targetId: input.organizationId,
    metadata: {
      userCount: users.length,
      totalCount: allUsers.length,
      search: searchValue ?? null,
      statusFilter: statusFilter ?? null,
    },
  });

  return {
    searchValue,
    statusFilter,
    users,
    totalCount: allUsers.length,
  };
}
