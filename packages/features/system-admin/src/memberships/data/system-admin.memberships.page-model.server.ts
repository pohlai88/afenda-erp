import { organizationRoles, type OrganizationRole } from "@afenda/auth";
import { writeExecutionAuditEvent } from "@afenda/kernel/execution";
import { z } from "zod";
import { filterSystemAdminListRows } from "../../overview/contracts/system-admin.list-filter.shared";
import {
  resolveSystemAdminListSearch,
  resolveSystemAdminListStatusFilter,
} from "../../overview/contracts/system-admin.list-search.shared";
import type { SystemAdminMembershipRow } from "../contracts";
import { systemAdminMembershipStatusFilterSchema } from "../schemas/system-admin.memberships.schema";
import { listSystemAdminMemberships } from "./system-admin.memberships.query.server";

const MEMBERSHIP_LIST_SEARCH_FIELDS = ["name", "email"] as const;

const systemAdminMembershipRoleFilterSchema = z.enum(organizationRoles);

function resolveSystemAdminMembershipRoleFilter(
  searchParams:
    | Record<string, string | string[] | undefined>
    | undefined,
): OrganizationRole | undefined {
  const raw = searchParams?.membersRole;
  const value = Array.isArray(raw) ? raw[0] : raw;

  if (typeof value !== "string" || value.length === 0) {
    return undefined;
  }

  const parsed = systemAdminMembershipRoleFilterSchema.safeParse(value);
  return parsed.success ? parsed.data : undefined;
}

export async function buildSystemAdminMembershipsPageModel(input: {
  organizationId: string;
  actorId: string;
  actorType: "user" | "system" | "agent";
  searchParams?: Record<string, string | string[] | undefined>;
  limit?: number;
}) {
  const searchValue = resolveSystemAdminListSearch(input.searchParams, "members");
  const statusParam = resolveSystemAdminListStatusFilter(
    input.searchParams,
    "members",
  );
  const statusParsed = statusParam
    ? systemAdminMembershipStatusFilterSchema.safeParse(statusParam)
    : undefined;
  const statusFilter = statusParsed?.success ? statusParsed.data : undefined;
  const roleFilter = resolveSystemAdminMembershipRoleFilter(input.searchParams);

  const allMemberships = await listSystemAdminMemberships({
    organizationId: input.organizationId,
    limit: input.limit ?? 100,
  });

  const statusFiltered = statusFilter
    ? allMemberships.filter((membership) => membership.status === statusFilter)
    : allMemberships;

  const roleFiltered = roleFilter
    ? statusFiltered.filter((membership) => membership.role === roleFilter)
    : statusFiltered;

  const memberships = filterSystemAdminListRows(
    roleFiltered,
    searchValue,
    MEMBERSHIP_LIST_SEARCH_FIELDS,
  ) as SystemAdminMembershipRow[];

  await writeExecutionAuditEvent({
    organizationId: input.organizationId,
    actorId: input.actorId,
    actorType: input.actorType,
    action: "system-admin.membership_directory.view",
    targetType: "organization",
    targetId: input.organizationId,
    metadata: {
      membershipCount: memberships.length,
      totalCount: allMemberships.length,
      search: searchValue ?? null,
      statusFilter: statusFilter ?? null,
      roleFilter: roleFilter ?? null,
    },
  });

  return {
    searchValue,
    statusFilter,
    roleFilter,
    memberships,
    totalCount: allMemberships.length,
  };
}
