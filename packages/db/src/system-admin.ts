import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
  timingSafeEqual,
} from "node:crypto";
import { and, asc, desc, eq, inArray, ne, sql } from "drizzle-orm";
import { createAuditLog } from "./audit";
import { getDb, runWithOrganizationContext } from "./client";
import { createEntityId } from "./ids";
import {
  apiCredentials,
  cronRunHistory,
  organizationInvitations,
  organizationMemberships,
  organizations,
  retentionPolicies,
  ssoConnections,
  tenantApprovalSettings,
  tenantCapabilitySettings,
  tenantModuleSettings,
  tenantPolicySettings,
  tenantRoleOverrides,
  tenantSecuritySettings,
  tenantSettings,
  userProfiles,
  webhookDeliveries,
  webhooks,
} from "./schema";
import type { PermissionRole } from "./permissions";

export type TenantMemberSummary = {
  membershipId: string;
  authUserId: string;
  name: string;
  email: string;
  role: PermissionRole;
  status: "active" | "suspended" | "removed";
  createdAt: Date;
  updatedAt: Date;
};

export type TenantMembershipStatus = "active" | "suspended" | "removed";

export type TenantMembershipControlSnapshot = {
  membershipId: string;
  authUserId: string;
  role: PermissionRole;
  status: TenantMembershipStatus;
};

export type TenantSettingsSnapshot = {
  organizationId: string;
  timezone: string;
  locale: string;
  currency: string;
  fiscalYearStartMonth: number;
  branding: Record<string, unknown>;
  zdrEnabled: boolean;
  dataRegion: string;
  operatingCalendar: Record<string, unknown>;
  numbering: Record<string, unknown>;
  documentPrefixes: Record<string, unknown>;
};

export type SystemAdminReadiness = "preview" | "active" | "blocked" | "deprecated";

export type SystemAdminAvailability = "enabled" | "disabled" | "preview";

export type TenantCapabilitySettingRow = {
  organizationId: string;
  capabilityKey: string;
  availability: SystemAdminAvailability;
};

export type TenantModuleSettingRow = {
  organizationId: string;
  moduleKey: string;
  enabled: boolean;
  visible: boolean;
  readiness: SystemAdminReadiness;
  configuration: Record<string, unknown>;
};

export type TenantPolicySettingRow = {
  id: string;
  organizationId: string;
  policyKey: string;
  label: string;
  enabled: boolean;
  readiness: SystemAdminReadiness;
  configuration: Record<string, unknown>;
};

export type TenantApprovalSettingRow = {
  id: string;
  organizationId: string;
  approvalKey: string;
  label: string;
  enabled: boolean;
  approverRole: PermissionRole | null;
  escalationMinutes: number | null;
  configuration: Record<string, unknown>;
};

export type TenantSecuritySettingsSnapshot = {
  organizationId: string;
  mfaRequired: boolean;
  trustedDomains: readonly string[];
  sensitiveActionConfirmation: boolean;
  sessionPolicy: Record<string, unknown>;
};

export type RoleOverrideRow = {
  role: PermissionRole;
  permissionKey: string;
  enabled: boolean;
};

export type CronRunStatus = "started" | "success" | "failed" | "rejected";

export type CronRunHistoryRow = {
  id: string;
  jobName: string;
  route: string;
  operation: string;
  status: CronRunStatus;
  requestId: string | null;
  startedAt: Date;
  finishedAt: Date | null;
  durationMs: number | null;
  result: Record<string, unknown>;
  errorMessage: string | null;
};

export type ApiCredentialAuthenticationResult =
  | {
      ok: true;
      organizationId: string;
      credentialId: string;
      label: string;
      scopes: readonly string[];
    }
  | {
      ok: false;
      reason: "invalid" | "revoked" | "expired" | "insufficient-scope";
    };

export type WebhookDispatchTarget = {
  id: string;
  organizationId: string;
  url: string;
  signingSecret: string | null;
  eventFilters: readonly string[];
};

function hashSecret(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

function getWebhookEncryptionMaterial() {
  return (
    process.env.AFENDA_WEBHOOK_SECRET_KEY ??
    process.env.NEON_AUTH_COOKIE_SECRET ??
    process.env.CRON_SECRET ??
    ""
  );
}

function webhookEncryptionKey() {
  const material = getWebhookEncryptionMaterial();
  return material
    ? createHash("sha256").update(material).digest()
    : null;
}

function encryptWebhookSecret(value: string) {
  const key = webhookEncryptionKey();
  if (!key) {
    return null;
  }

  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([
    cipher.update(value, "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();

  return [
    "v1",
    iv.toString("base64url"),
    tag.toString("base64url"),
    encrypted.toString("base64url"),
  ].join(":");
}

function decryptWebhookSecret(value: string | null) {
  const key = webhookEncryptionKey();
  if (!key || !value) {
    return null;
  }

  const [version, iv, tag, encrypted] = value.split(":");
  if (version !== "v1" || !iv || !tag || !encrypted) {
    return null;
  }

  try {
    const decipher = createDecipheriv(
      "aes-256-gcm",
      key,
      Buffer.from(iv, "base64url"),
    );
    decipher.setAuthTag(Buffer.from(tag, "base64url"));

    return Buffer.concat([
      decipher.update(Buffer.from(encrypted, "base64url")),
      decipher.final(),
    ]).toString("utf8");
  } catch {
    return null;
  }
}

function timingSafeHashEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left, "hex");
  const rightBuffer = Buffer.from(right, "hex");

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return timingSafeEqual(leftBuffer, rightBuffer);
}

function isAdminLikeRole(role: PermissionRole) {
  return role === "owner" || role === "admin";
}

function normalizeSystemAdminListLimit(limit: number | undefined, fallback = 50) {
  if (!Number.isFinite(limit) || !limit || limit < 1) {
    return fallback;
  }

  return Math.min(Math.floor(limit), 200);
}

export async function listTenantMembers(input: {
  organizationId: string;
  limit?: number;
}): Promise<TenantMemberSummary[]> {
  return runWithOrganizationContext(input.organizationId, async (db) => {
    const rows = await db
      .select({
        membershipId: organizationMemberships.id,
        authUserId: organizationMemberships.authUserId,
        role: organizationMemberships.role,
        status: organizationMemberships.status,
        createdAt: organizationMemberships.createdAt,
        updatedAt: organizationMemberships.updatedAt,
        name: userProfiles.name,
        email: userProfiles.email,
      })
      .from(organizationMemberships)
      .innerJoin(
        userProfiles,
        eq(organizationMemberships.authUserId, userProfiles.authUserId),
      )
      .where(eq(organizationMemberships.organizationId, input.organizationId))
      .orderBy(asc(userProfiles.name))
      .limit(normalizeSystemAdminListLimit(input.limit, 100));

    return rows.map((row) => ({
      membershipId: row.membershipId,
      authUserId: row.authUserId,
      name: row.name,
      email: row.email,
      role: row.role,
      status: row.status,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    }));
  });
}

export async function hasTenantMemberWithEmail(input: {
  organizationId: string;
  email: string;
}) {
  const normalizedEmail = input.email.toLowerCase();

  return runWithOrganizationContext(input.organizationId, async (db) => {
    const [membership] = await db
      .select({ id: organizationMemberships.id })
      .from(organizationMemberships)
      .innerJoin(
        userProfiles,
        eq(organizationMemberships.authUserId, userProfiles.authUserId),
      )
      .where(
        and(
          eq(organizationMemberships.organizationId, input.organizationId),
          sql`lower(${userProfiles.email}) = ${normalizedEmail}`,
        ),
      )
      .limit(1);

    return Boolean(membership);
  });
}

export async function getTenantMembershipById(input: {
  organizationId: string;
  membershipId: string;
}): Promise<TenantMembershipControlSnapshot | null> {
  return runWithOrganizationContext(input.organizationId, async (db) => {
    const [membership] = await db
      .select({
        membershipId: organizationMemberships.id,
        authUserId: organizationMemberships.authUserId,
        role: organizationMemberships.role,
        status: organizationMemberships.status,
      })
      .from(organizationMemberships)
      .where(
        and(
          eq(organizationMemberships.organizationId, input.organizationId),
          eq(organizationMemberships.id, input.membershipId),
        ),
      )
      .limit(1);

    return membership ?? null;
  });
}

export async function countRemainingActiveAdminMemberships(input: {
  organizationId: string;
  excludingMembershipId?: string;
}) {
  return runWithOrganizationContext(input.organizationId, async (db) => {
    const rows = await db
      .select({ id: organizationMemberships.id })
      .from(organizationMemberships)
      .where(
        and(
          eq(organizationMemberships.organizationId, input.organizationId),
          eq(organizationMemberships.status, "active"),
          inArray(organizationMemberships.role, ["owner", "admin"]),
          input.excludingMembershipId
            ? ne(organizationMemberships.id, input.excludingMembershipId)
            : sql`true`,
        ),
      );

    return rows.length;
  });
}

export async function updateTenantMembershipStatus(input: {
  organizationId: string;
  actorAuthUserId: string;
  membershipId: string;
  status: TenantMembershipStatus;
}) {
  const membership = await getTenantMembershipById(input);

  if (!membership) {
    throw new Error("Organization membership was not found.");
  }

  if (membership.authUserId === input.actorAuthUserId && input.status !== "active") {
    throw new Error("You cannot suspend or remove your own active membership.");
  }

  if (input.status !== "active" && isAdminLikeRole(membership.role)) {
    const remainingAdmins = await countRemainingActiveAdminMemberships({
      organizationId: input.organizationId,
      excludingMembershipId: input.membershipId,
    });

    if (remainingAdmins === 0) {
      throw new Error("At least one active owner or admin must remain.");
    }
  }

  return runWithOrganizationContext(input.organizationId, async (db) => {
    const [updated] = await db
      .update(organizationMemberships)
      .set({ status: input.status, updatedAt: new Date() })
      .where(
        and(
          eq(organizationMemberships.organizationId, input.organizationId),
          eq(organizationMemberships.id, input.membershipId),
        ),
      )
      .returning({ id: organizationMemberships.id });

    if (!updated) {
      throw new Error("Organization membership status was not updated.");
    }
  });
}

export async function assignTenantMembershipRole(input: {
  organizationId: string;
  actorAuthUserId: string;
  membershipId: string;
  role: PermissionRole;
}) {
  const membership = await getTenantMembershipById(input);

  if (!membership) {
    throw new Error("Organization membership was not found.");
  }

  if (membership.status !== "active") {
    throw new Error("Removed or suspended memberships cannot receive roles.");
  }

  if (membership.role === input.role) {
    throw new Error("This role is already assigned to the membership.");
  }

  return updateMembershipRole({
    organizationId: input.organizationId,
    authUserId: membership.authUserId,
    role: input.role,
    actorAuthUserId: input.actorAuthUserId,
  });
}

export async function removeTenantMembershipRole(input: {
  organizationId: string;
  actorAuthUserId: string;
  membershipId: string;
  role: PermissionRole;
}) {
  const membership = await getTenantMembershipById(input);

  if (!membership) {
    throw new Error("Organization membership was not found.");
  }

  if (membership.role !== input.role) {
    throw new Error("This role is not assigned to the membership.");
  }

  if (isAdminLikeRole(membership.role)) {
    const remainingAdmins = await countRemainingActiveAdminMemberships({
      organizationId: input.organizationId,
      excludingMembershipId: input.membershipId,
    });

    if (remainingAdmins === 0) {
      throw new Error("At least one active owner or admin must remain.");
    }
  }

  return updateMembershipRole({
    organizationId: input.organizationId,
    authUserId: membership.authUserId,
    role: "viewer",
    actorAuthUserId: input.actorAuthUserId,
  });
}

export async function listRoleOverridesForOrganization(input: {
  organizationId: string;
  limit?: number;
}): Promise<RoleOverrideRow[]> {
  return runWithOrganizationContext(input.organizationId, async (db) => {
    const query = db
      .select({
        role: tenantRoleOverrides.role,
        permissionKey: tenantRoleOverrides.permissionKey,
        enabled: tenantRoleOverrides.enabled,
      })
      .from(tenantRoleOverrides)
      .where(eq(tenantRoleOverrides.organizationId, input.organizationId))
      .orderBy(
        asc(tenantRoleOverrides.role),
        asc(tenantRoleOverrides.permissionKey),
      );

    const rows =
      input.limit === undefined
        ? await query
        : await query.limit(normalizeSystemAdminListLimit(input.limit, 100));

    return rows;
  });
}

export async function upsertRoleOverride(input: {
  organizationId: string;
  role: PermissionRole;
  permissionKey: string;
  enabled: boolean;
  actorAuthUserId: string;
}) {
  return runWithOrganizationContext(input.organizationId, async (db) => {
    await db
      .insert(tenantRoleOverrides)
      .values({
        organizationId: input.organizationId,
        role: input.role,
        permissionKey: input.permissionKey,
        enabled: input.enabled,
      })
      .onConflictDoUpdate({
        target: [
          tenantRoleOverrides.organizationId,
          tenantRoleOverrides.role,
          tenantRoleOverrides.permissionKey,
        ],
        set: {
          enabled: input.enabled,
          updatedAt: new Date(),
        },
      });

    await createAuditLog({
      organizationId: input.organizationId,
      actorAuthUserId: input.actorAuthUserId,
      entityType: "organization",
      entityId: input.organizationId,
      action: "tenant.role-override.changed",
      summary: `Role override ${input.enabled ? "enabled" : "disabled"} for ${input.role}:${input.permissionKey}.`,
      metadata: {
        role: input.role,
        permissionKey: input.permissionKey,
        enabled: input.enabled,
      },
    });
  });
}

export async function getTenantSettings(input: {
  organizationId: string;
}): Promise<TenantSettingsSnapshot | null> {
  return runWithOrganizationContext(input.organizationId, async (db) => {
    const row = await db.query.tenantSettings.findFirst({
      where: eq(tenantSettings.organizationId, input.organizationId),
    });

    if (!row) {
      return null;
    }

    return {
      organizationId: row.organizationId,
      timezone: row.timezone,
      locale: row.locale,
      currency: row.currency,
      fiscalYearStartMonth: row.fiscalYearStartMonth,
      branding: row.branding,
      zdrEnabled: row.zdrEnabled,
      dataRegion: row.dataRegion,
      operatingCalendar: row.operatingCalendar,
      numbering: row.numbering,
      documentPrefixes: row.documentPrefixes,
    };
  });
}

export async function ensureTenantSettings(input: {
  organizationId: string;
}) {
  return runWithOrganizationContext(input.organizationId, async (db) => {
    const existing = await db.query.tenantSettings.findFirst({
      where: eq(tenantSettings.organizationId, input.organizationId),
    });

    if (existing) {
      return existing.organizationId;
    }

    await db.insert(tenantSettings).values({
      organizationId: input.organizationId,
    });

    return input.organizationId;
  });
}

export async function updateTenantSettings(input: {
  organizationId: string;
  actorAuthUserId: string;
  patch: Partial<
    Pick<
      TenantSettingsSnapshot,
      | "timezone"
      | "locale"
      | "currency"
      | "fiscalYearStartMonth"
      | "branding"
      | "zdrEnabled"
      | "dataRegion"
      | "operatingCalendar"
      | "numbering"
      | "documentPrefixes"
    >
  >;
}) {
  return runWithOrganizationContext(input.organizationId, async (db) => {
    await ensureTenantSettings({ organizationId: input.organizationId });

    await db
      .update(tenantSettings)
      .set({
        ...input.patch,
        updatedAt: new Date(),
      })
      .where(eq(tenantSettings.organizationId, input.organizationId));

    await createAuditLog({
      organizationId: input.organizationId,
      actorAuthUserId: input.actorAuthUserId,
      entityType: "organization",
      entityId: input.organizationId,
      action: "tenant.settings.updated",
      summary: "Tenant settings were updated.",
      metadata: input.patch,
    });
  });
}

export async function listTenantModuleSettings(input: {
  organizationId: string;
  limit?: number;
}): Promise<TenantModuleSettingRow[]> {
  return runWithOrganizationContext(input.organizationId, async (db) =>
    db
      .select({
        organizationId: tenantModuleSettings.organizationId,
        moduleKey: tenantModuleSettings.moduleKey,
        enabled: tenantModuleSettings.enabled,
        visible: tenantModuleSettings.visible,
        readiness: tenantModuleSettings.readiness,
        configuration: tenantModuleSettings.configuration,
      })
      .from(tenantModuleSettings)
      .where(eq(tenantModuleSettings.organizationId, input.organizationId))
      .orderBy(asc(tenantModuleSettings.moduleKey))
      .limit(normalizeSystemAdminListLimit(input.limit, 100)),
  );
}

export async function upsertTenantModuleSettings(input: {
  organizationId: string;
  moduleKey: string;
  enabled: boolean;
  visible: boolean;
  readiness: SystemAdminReadiness;
  configuration?: Record<string, unknown>;
  actorAuthUserId: string;
}) {
  return runWithOrganizationContext(input.organizationId, async (db) => {
    await db
      .insert(tenantModuleSettings)
      .values({
        organizationId: input.organizationId,
        moduleKey: input.moduleKey,
        enabled: input.enabled,
        visible: input.visible,
        readiness: input.readiness,
        configuration: input.configuration ?? {},
      })
      .onConflictDoUpdate({
        target: [
          tenantModuleSettings.organizationId,
          tenantModuleSettings.moduleKey,
        ],
        set: {
          enabled: input.enabled,
          visible: input.visible,
          readiness: input.readiness,
          configuration: input.configuration ?? {},
          updatedAt: new Date(),
        },
      });

    await createAuditLog({
      organizationId: input.organizationId,
      actorAuthUserId: input.actorAuthUserId,
      entityType: "organization",
      entityId: input.organizationId,
      action: "system-admin.module-settings.updated",
      summary: `Module settings updated for ${input.moduleKey}.`,
      metadata: {
        moduleKey: input.moduleKey,
        enabled: input.enabled,
        visible: input.visible,
        readiness: input.readiness,
      },
    });
  });
}

export async function listTenantCapabilitySettings(input: {
  organizationId: string;
  limit?: number;
}): Promise<TenantCapabilitySettingRow[]> {
  return runWithOrganizationContext(input.organizationId, async (db) =>
    db
      .select({
        organizationId: tenantCapabilitySettings.organizationId,
        capabilityKey: tenantCapabilitySettings.capabilityKey,
        availability: tenantCapabilitySettings.availability,
      })
      .from(tenantCapabilitySettings)
      .where(eq(tenantCapabilitySettings.organizationId, input.organizationId))
      .orderBy(asc(tenantCapabilitySettings.capabilityKey))
      .limit(normalizeSystemAdminListLimit(input.limit, 500)),
  );
}

export async function upsertTenantCapabilitySettings(input: {
  organizationId: string;
  capabilityKey: string;
  availability: SystemAdminAvailability;
  actorAuthUserId: string;
}) {
  return runWithOrganizationContext(input.organizationId, async (db) => {
    await db
      .insert(tenantCapabilitySettings)
      .values({
        organizationId: input.organizationId,
        capabilityKey: input.capabilityKey,
        availability: input.availability,
      })
      .onConflictDoUpdate({
        target: [
          tenantCapabilitySettings.organizationId,
          tenantCapabilitySettings.capabilityKey,
        ],
        set: {
          availability: input.availability,
          updatedAt: new Date(),
        },
      });

    await createAuditLog({
      organizationId: input.organizationId,
      actorAuthUserId: input.actorAuthUserId,
      entityType: "organization",
      entityId: input.organizationId,
      action: "system-admin.capability-settings.updated",
      summary: `Capability settings updated for ${input.capabilityKey}.`,
      metadata: {
        capabilityKey: input.capabilityKey,
        availability: input.availability,
      },
    });
  });
}

export async function listTenantPolicySettings(input: {
  organizationId: string;
  limit?: number;
}): Promise<TenantPolicySettingRow[]> {
  return runWithOrganizationContext(input.organizationId, async (db) =>
    db
      .select({
        id: tenantPolicySettings.id,
        organizationId: tenantPolicySettings.organizationId,
        policyKey: tenantPolicySettings.policyKey,
        label: tenantPolicySettings.label,
        enabled: tenantPolicySettings.enabled,
        readiness: tenantPolicySettings.readiness,
        configuration: tenantPolicySettings.configuration,
      })
      .from(tenantPolicySettings)
      .where(eq(tenantPolicySettings.organizationId, input.organizationId))
      .orderBy(asc(tenantPolicySettings.policyKey))
      .limit(normalizeSystemAdminListLimit(input.limit, 100)),
  );
}

export async function upsertTenantPolicySettings(input: {
  organizationId: string;
  policyKey: string;
  label: string;
  enabled: boolean;
  readiness: SystemAdminReadiness;
  configuration?: Record<string, unknown>;
  actorAuthUserId: string;
}) {
  const id = createEntityId("policy");

  return runWithOrganizationContext(input.organizationId, async (db) => {
    await db
      .insert(tenantPolicySettings)
      .values({
        id,
        organizationId: input.organizationId,
        policyKey: input.policyKey,
        label: input.label,
        enabled: input.enabled,
        readiness: input.readiness,
        configuration: input.configuration ?? {},
      })
      .onConflictDoUpdate({
        target: [
          tenantPolicySettings.organizationId,
          tenantPolicySettings.policyKey,
        ],
        set: {
          label: input.label,
          enabled: input.enabled,
          readiness: input.readiness,
          configuration: input.configuration ?? {},
          updatedAt: new Date(),
        },
      });

    await createAuditLog({
      organizationId: input.organizationId,
      actorAuthUserId: input.actorAuthUserId,
      entityType: "organization",
      entityId: input.organizationId,
      action: "system-admin.policy.updated",
      summary: `Policy settings updated for ${input.policyKey}.`,
      metadata: {
        policyKey: input.policyKey,
        enabled: input.enabled,
        readiness: input.readiness,
      },
    });
  });
}

export async function listTenantApprovalSettings(input: {
  organizationId: string;
  limit?: number;
}): Promise<TenantApprovalSettingRow[]> {
  return runWithOrganizationContext(input.organizationId, async (db) =>
    db
      .select({
        id: tenantApprovalSettings.id,
        organizationId: tenantApprovalSettings.organizationId,
        approvalKey: tenantApprovalSettings.approvalKey,
        label: tenantApprovalSettings.label,
        enabled: tenantApprovalSettings.enabled,
        approverRole: tenantApprovalSettings.approverRole,
        escalationMinutes: tenantApprovalSettings.escalationMinutes,
        configuration: tenantApprovalSettings.configuration,
      })
      .from(tenantApprovalSettings)
      .where(eq(tenantApprovalSettings.organizationId, input.organizationId))
      .orderBy(asc(tenantApprovalSettings.approvalKey))
      .limit(normalizeSystemAdminListLimit(input.limit, 100)),
  );
}

export async function upsertTenantApprovalSettings(input: {
  organizationId: string;
  approvalKey: string;
  label: string;
  enabled: boolean;
  approverRole?: PermissionRole | null;
  escalationMinutes?: number | null;
  configuration?: Record<string, unknown>;
  actorAuthUserId: string;
}) {
  const id = createEntityId("approval");

  return runWithOrganizationContext(input.organizationId, async (db) => {
    await db
      .insert(tenantApprovalSettings)
      .values({
        id,
        organizationId: input.organizationId,
        approvalKey: input.approvalKey,
        label: input.label,
        enabled: input.enabled,
        approverRole: input.approverRole ?? null,
        escalationMinutes: input.escalationMinutes ?? null,
        configuration: input.configuration ?? {},
      })
      .onConflictDoUpdate({
        target: [
          tenantApprovalSettings.organizationId,
          tenantApprovalSettings.approvalKey,
        ],
        set: {
          label: input.label,
          enabled: input.enabled,
          approverRole: input.approverRole ?? null,
          escalationMinutes: input.escalationMinutes ?? null,
          configuration: input.configuration ?? {},
          updatedAt: new Date(),
        },
      });

    await createAuditLog({
      organizationId: input.organizationId,
      actorAuthUserId: input.actorAuthUserId,
      entityType: "organization",
      entityId: input.organizationId,
      action: "system-admin.approval.updated",
      summary: `Approval settings updated for ${input.approvalKey}.`,
      metadata: {
        approvalKey: input.approvalKey,
        enabled: input.enabled,
        approverRole: input.approverRole ?? null,
      },
    });
  });
}

export async function getTenantSecuritySettings(input: {
  organizationId: string;
}): Promise<TenantSecuritySettingsSnapshot | null> {
  return runWithOrganizationContext(input.organizationId, async (db) => {
    const row = await db.query.tenantSecuritySettings.findFirst({
      where: eq(tenantSecuritySettings.organizationId, input.organizationId),
    });

    return row
      ? {
          organizationId: row.organizationId,
          mfaRequired: row.mfaRequired,
          trustedDomains: row.trustedDomains,
          sensitiveActionConfirmation: row.sensitiveActionConfirmation,
          sessionPolicy: row.sessionPolicy,
        }
      : null;
  });
}

export async function ensureTenantSecuritySettings(input: {
  organizationId: string;
}) {
  return runWithOrganizationContext(input.organizationId, async (db) => {
    await db
      .insert(tenantSecuritySettings)
      .values({ organizationId: input.organizationId })
      .onConflictDoNothing();

    return input.organizationId;
  });
}

export async function updateTenantSecuritySettings(input: {
  organizationId: string;
  actorAuthUserId: string;
  patch: Partial<
    Pick<
      TenantSecuritySettingsSnapshot,
      | "mfaRequired"
      | "trustedDomains"
      | "sensitiveActionConfirmation"
      | "sessionPolicy"
    >
  >;
  recordAuditLog?: boolean;
}) {
  return runWithOrganizationContext(input.organizationId, async (db) => {
    await ensureTenantSecuritySettings({ organizationId: input.organizationId });

    await db
      .update(tenantSecuritySettings)
      .set({
        ...input.patch,
        updatedAt: new Date(),
      })
      .where(eq(tenantSecuritySettings.organizationId, input.organizationId));

    if (input.recordAuditLog !== false) {
      await createAuditLog({
        organizationId: input.organizationId,
        actorAuthUserId: input.actorAuthUserId,
        entityType: "organization",
        entityId: input.organizationId,
        action: "system-admin.security.updated",
        summary: "Tenant security settings were updated.",
        metadata: input.patch,
      });
    }
  });
}

export async function listOrganizationInvitations(input: {
  organizationId: string;
  limit?: number;
}) {
  return runWithOrganizationContext(input.organizationId, async (db) => {
    return db.query.organizationInvitations.findMany({
      where: eq(organizationInvitations.organizationId, input.organizationId),
      orderBy: (table, { desc: descOrder }) => [descOrder(table.createdAt)],
      limit: normalizeSystemAdminListLimit(input.limit),
    });
  });
}

export async function hasOrganizationInvitationWithEmail(input: {
  organizationId: string;
  email: string;
}) {
  const normalizedEmail = input.email.toLowerCase();

  return runWithOrganizationContext(input.organizationId, async (db) => {
    const [invitation] = await db
      .select({ id: organizationInvitations.id })
      .from(organizationInvitations)
      .where(
        and(
          eq(organizationInvitations.organizationId, input.organizationId),
          eq(organizationInvitations.email, normalizedEmail),
        ),
      )
      .limit(1);

    return Boolean(invitation);
  });
}

export async function createOrganizationInvitation(input: {
  organizationId: string;
  email: string;
  role: PermissionRole;
  invitedByAuthUserId: string;
  expiresInDays?: number;
}) {
  const token = randomBytes(32).toString("hex");
  const tokenHash = hashSecret(token);
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + (input.expiresInDays ?? 7));

  const invitationId = createEntityId("invite");

  await runWithOrganizationContext(input.organizationId, async (db) => {
    await db.insert(organizationInvitations).values({
      id: invitationId,
      organizationId: input.organizationId,
      email: input.email.toLowerCase(),
      role: input.role,
      tokenHash,
      status: "pending",
      invitedByAuthUserId: input.invitedByAuthUserId,
      expiresAt,
    });

    await createAuditLog({
      organizationId: input.organizationId,
      actorAuthUserId: input.invitedByAuthUserId,
      entityType: "membership",
      entityId: invitationId,
      action: "tenant.member.invited",
      summary: `Invitation sent to ${input.email} as ${input.role}.`,
      metadata: { email: input.email, role: input.role },
    });
  });

  return { invitationId, token };
}

export async function revokeOrganizationInvitation(input: {
  organizationId: string;
  invitationId: string;
  actorAuthUserId: string;
}) {
  return runWithOrganizationContext(input.organizationId, async (db) => {
    const [updated] = await db
      .update(organizationInvitations)
      .set({ status: "revoked", updatedAt: new Date() })
      .where(
        and(
          eq(organizationInvitations.id, input.invitationId),
          eq(organizationInvitations.organizationId, input.organizationId),
          eq(organizationInvitations.status, "pending"),
        ),
      )
      .returning({ id: organizationInvitations.id });

    if (!updated) {
      throw new Error(
        "Pending organization invitation was not found for this tenant.",
      );
    }

    await createAuditLog({
      organizationId: input.organizationId,
      actorAuthUserId: input.actorAuthUserId,
      entityType: "membership",
      entityId: input.invitationId,
      action: "tenant.invitation.revoked",
      summary: "Organization invitation was revoked.",
      metadata: { invitationId: input.invitationId },
    });
  });
}

export async function updateMembershipRole(input: {
  organizationId: string;
  authUserId: string;
  role: PermissionRole;
  actorAuthUserId: string;
}) {
  return runWithOrganizationContext(input.organizationId, async (db) => {
    const [currentMembership] = await db
      .select({
        role: organizationMemberships.role,
      })
      .from(organizationMemberships)
      .where(
        and(
          eq(organizationMemberships.organizationId, input.organizationId),
          eq(organizationMemberships.authUserId, input.authUserId),
        ),
      )
      .limit(1);

    if (!currentMembership) {
      throw new Error("Organization membership was not found.");
    }

    if (
      isAdminLikeRole(currentMembership.role) &&
      !isAdminLikeRole(input.role)
    ) {
      const adminRows = await db
        .select({ authUserId: organizationMemberships.authUserId })
        .from(organizationMemberships)
        .where(
          and(
            eq(organizationMemberships.organizationId, input.organizationId),
            inArray(organizationMemberships.role, ["owner", "admin"]),
          ),
        );

      if (adminRows.length <= 1) {
        throw new Error(
          "At least one owner or admin must remain for this tenant.",
        );
      }
    }

    await db
      .update(organizationMemberships)
      .set({ role: input.role, updatedAt: new Date() })
      .where(
        and(
          eq(organizationMemberships.organizationId, input.organizationId),
          eq(organizationMemberships.authUserId, input.authUserId),
        ),
      );

    await createAuditLog({
      organizationId: input.organizationId,
      actorAuthUserId: input.actorAuthUserId,
      entityType: "membership",
      entityId: input.authUserId,
      action: "tenant.role.changed",
      summary: `Membership role updated to ${input.role}.`,
      metadata: { authUserId: input.authUserId, role: input.role },
    });
  });
}

export async function listApiCredentials(input: {
  organizationId: string;
  limit?: number;
}) {
  return runWithOrganizationContext(input.organizationId, async (db) =>
    db
      .select({
        id: apiCredentials.id,
        label: apiCredentials.label,
        keyPrefix: apiCredentials.keyPrefix,
        scopes: apiCredentials.scopes,
        status: apiCredentials.status,
        expiresAt: apiCredentials.expiresAt,
        lastUsedAt: apiCredentials.lastUsedAt,
        createdAt: apiCredentials.createdAt,
      })
      .from(apiCredentials)
      .where(eq(apiCredentials.organizationId, input.organizationId))
      .orderBy(desc(apiCredentials.createdAt))
      .limit(normalizeSystemAdminListLimit(input.limit, 100)),
  );
}

export async function createApiCredential(input: {
  organizationId: string;
  label: string;
  scopes: readonly string[];
  createdByAuthUserId: string;
  expiresAt?: Date;
}) {
  const rawKey = `afk_${randomBytes(24).toString("base64url")}`;
  const keyPrefix = rawKey.slice(0, 12);
  const keyHash = hashSecret(rawKey);
  const id = createEntityId("apicred");

  await runWithOrganizationContext(input.organizationId, async (db) => {
    await db.insert(apiCredentials).values({
      id,
      organizationId: input.organizationId,
      label: input.label,
      keyPrefix,
      keyHash,
      scopes: [...input.scopes],
      expiresAt: input.expiresAt ?? null,
      createdByAuthUserId: input.createdByAuthUserId,
    });

    await createAuditLog({
      organizationId: input.organizationId,
      actorAuthUserId: input.createdByAuthUserId,
      entityType: "system",
      entityId: id,
      action: "tenant.api-credential.created",
      summary: `API credential ${input.label} created.`,
      metadata: { label: input.label, keyPrefix },
    });
  });

  return { id, rawKey, keyPrefix };
}

export async function revokeApiCredential(input: {
  organizationId: string;
  credentialId: string;
  actorAuthUserId: string;
}) {
  return runWithOrganizationContext(input.organizationId, async (db) => {
    const [updated] = await db
      .update(apiCredentials)
      .set({ status: "revoked", updatedAt: new Date() })
      .where(
        and(
          eq(apiCredentials.id, input.credentialId),
          eq(apiCredentials.organizationId, input.organizationId),
          eq(apiCredentials.status, "active"),
        ),
      )
      .returning({ id: apiCredentials.id });

    if (!updated) {
      throw new Error("Active API credential was not found for this tenant.");
    }

    await createAuditLog({
      organizationId: input.organizationId,
      actorAuthUserId: input.actorAuthUserId,
      entityType: "system",
      entityId: input.credentialId,
      action: "tenant.api-credential.revoked",
      summary: "API credential revoked.",
      metadata: { credentialId: input.credentialId },
    });
  });
}

export async function authenticateApiCredential(input: {
  rawKey: string;
  requiredScope?: string;
}): Promise<ApiCredentialAuthenticationResult> {
  const keyPrefix = input.rawKey.slice(0, 12);
  const keyHash = hashSecret(input.rawKey);
  const db = getDb();

  const [credential] = await db
    .select({
      id: apiCredentials.id,
      organizationId: apiCredentials.organizationId,
      label: apiCredentials.label,
      keyHash: apiCredentials.keyHash,
      scopes: apiCredentials.scopes,
      status: apiCredentials.status,
      expiresAt: apiCredentials.expiresAt,
    })
    .from(apiCredentials)
    .where(eq(apiCredentials.keyPrefix, keyPrefix))
    .limit(1);

  if (!credential || !timingSafeHashEqual(keyHash, credential.keyHash)) {
    return { ok: false, reason: "invalid" };
  }

  if (credential.status !== "active") {
    return { ok: false, reason: "revoked" };
  }

  if (credential.expiresAt && credential.expiresAt.getTime() <= Date.now()) {
    return { ok: false, reason: "expired" };
  }

  if (
    input.requiredScope &&
    !credential.scopes.includes(input.requiredScope)
  ) {
    return { ok: false, reason: "insufficient-scope" };
  }

  await runWithOrganizationContext(credential.organizationId, async (scopedDb) => {
    await scopedDb
      .update(apiCredentials)
      .set({ lastUsedAt: new Date(), updatedAt: new Date() })
      .where(
        and(
          eq(apiCredentials.id, credential.id),
          eq(apiCredentials.organizationId, credential.organizationId),
        ),
      );
  });

  return {
    ok: true,
    organizationId: credential.organizationId,
    credentialId: credential.id,
    label: credential.label,
    scopes: credential.scopes,
  };
}

export async function listWebhooks(input: {
  organizationId: string;
  limit?: number;
}) {
  return runWithOrganizationContext(input.organizationId, async (db) =>
    db.query.webhooks.findMany({
      where: eq(webhooks.organizationId, input.organizationId),
      orderBy: (table, { desc: descOrder }) => [descOrder(table.createdAt)],
      limit: normalizeSystemAdminListLimit(input.limit, 100),
    }),
  );
}

export async function listWebhookDeliveries(input: {
  organizationId: string;
  webhookId?: string;
  limit?: number;
}) {
  return runWithOrganizationContext(input.organizationId, async (db) =>
    db
      .select()
      .from(webhookDeliveries)
      .where(
        and(
          eq(webhookDeliveries.organizationId, input.organizationId),
          input.webhookId
            ? eq(webhookDeliveries.webhookId, input.webhookId)
            : sql`true`,
        ),
      )
      .orderBy(desc(webhookDeliveries.createdAt))
      .limit(normalizeSystemAdminListLimit(input.limit)),
  );
}

export async function createWebhook(input: {
  organizationId: string;
  label: string;
  url: string;
  eventFilters: readonly string[];
  createdByAuthUserId: string;
}) {
  const signingSecret = randomBytes(32).toString("hex");
  const id = createEntityId("webhook");

  await runWithOrganizationContext(input.organizationId, async (db) => {
    await db.insert(webhooks).values({
      id,
      organizationId: input.organizationId,
      label: input.label,
      url: input.url,
      signingSecretHash: hashSecret(signingSecret),
      signingSecretCiphertext: encryptWebhookSecret(signingSecret),
      eventFilters: [...input.eventFilters],
      createdByAuthUserId: input.createdByAuthUserId,
    });

    await createAuditLog({
      organizationId: input.organizationId,
      actorAuthUserId: input.createdByAuthUserId,
      entityType: "system",
      entityId: id,
      action: "tenant.webhook.created",
      summary: `Webhook ${input.label} registered.`,
      metadata: { label: input.label, url: input.url },
    });
  });

  return { id, signingSecret };
}

export async function setWebhookEnabled(input: {
  organizationId: string;
  webhookId: string;
  enabled: boolean;
  actorAuthUserId: string;
}) {
  await runWithOrganizationContext(input.organizationId, async (db) => {
    const [updated] = await db
      .update(webhooks)
      .set({ enabled: input.enabled, updatedAt: new Date() })
      .where(
        and(
          eq(webhooks.id, input.webhookId),
          eq(webhooks.organizationId, input.organizationId),
        ),
      )
      .returning({ id: webhooks.id, label: webhooks.label });

    if (!updated) {
      throw new Error(`Webhook ${input.webhookId} was not found for this tenant.`);
    }

    await createAuditLog({
      organizationId: input.organizationId,
      actorAuthUserId: input.actorAuthUserId,
      entityType: "system",
      entityId: input.webhookId,
      action: input.enabled
        ? "tenant.webhook.enabled"
        : "tenant.webhook.disabled",
      summary: input.enabled
        ? `Webhook ${updated.label} enabled.`
        : `Webhook ${updated.label} disabled.`,
      metadata: {
        webhookId: input.webhookId,
        enabled: input.enabled,
      },
    });
  });
}

export async function listWebhookDispatchTargets(input: {
  organizationId: string;
  eventType: string;
}): Promise<WebhookDispatchTarget[]> {
  const rows = await runWithOrganizationContext(input.organizationId, async (db) =>
    db
      .select({
        id: webhooks.id,
        organizationId: webhooks.organizationId,
        url: webhooks.url,
        signingSecretCiphertext: webhooks.signingSecretCiphertext,
        eventFilters: webhooks.eventFilters,
      })
      .from(webhooks)
      .where(
        and(
          eq(webhooks.organizationId, input.organizationId),
          eq(webhooks.enabled, true),
        ),
      ),
  );

  return rows
    .filter(
      (row) =>
        row.eventFilters.length === 0 ||
        row.eventFilters.includes(input.eventType),
    )
    .map((row) => ({
      id: row.id,
      organizationId: row.organizationId,
      url: row.url,
      signingSecret: decryptWebhookSecret(row.signingSecretCiphertext),
      eventFilters: row.eventFilters,
    }));
}

export async function recordWebhookDelivery(input: {
  organizationId: string;
  webhookId: string;
  eventType: string;
  status: "pending" | "delivered" | "failed";
  attemptCount?: number;
  retryOutcome?: string | null;
  responseCode?: number | null;
  errorMessage?: string | null;
}) {
  const id = createEntityId("whdel");

  await runWithOrganizationContext(input.organizationId, async (db) => {
    await db.insert(webhookDeliveries).values({
      id,
      organizationId: input.organizationId,
      webhookId: input.webhookId,
      eventType: input.eventType,
      status: input.status,
      attemptCount: input.attemptCount ?? 1,
      retryOutcome: input.retryOutcome ?? null,
      responseCode: input.responseCode ?? null,
      errorMessage: input.errorMessage ?? null,
    });
  });

  return id;
}

export async function listSsoConnections(input: {
  organizationId: string;
  limit?: number;
}) {
  return runWithOrganizationContext(input.organizationId, async (db) =>
    db.query.ssoConnections.findMany({
      where: eq(ssoConnections.organizationId, input.organizationId),
      orderBy: (table, { asc: ascOrder }) => [ascOrder(table.provider)],
      limit: normalizeSystemAdminListLimit(input.limit, 50),
    }),
  );
}

export async function upsertSsoConnection(input: {
  organizationId: string;
  provider: string;
  idpMetadataUrl?: string | null;
  audience?: string | null;
  enabled: boolean;
  actorAuthUserId: string;
}) {
  const id = createEntityId("sso");

  return runWithOrganizationContext(input.organizationId, async (db) => {
    await db
      .insert(ssoConnections)
      .values({
        id,
        organizationId: input.organizationId,
        provider: input.provider,
        idpMetadataUrl: input.idpMetadataUrl ?? null,
        audience: input.audience ?? null,
        enabled: input.enabled,
      })
      .onConflictDoUpdate({
        target: [ssoConnections.organizationId, ssoConnections.provider],
        set: {
          idpMetadataUrl: input.idpMetadataUrl ?? null,
          audience: input.audience ?? null,
          enabled: input.enabled,
          updatedAt: new Date(),
        },
      });

    await createAuditLog({
      organizationId: input.organizationId,
      actorAuthUserId: input.actorAuthUserId,
      entityType: "organization",
      entityId: input.organizationId,
      action: "tenant.sso.updated",
      summary: `SSO connection ${input.provider} updated.`,
      metadata: {
        provider: input.provider,
        enabled: input.enabled,
      },
    });
  });
}

export async function listRetentionPolicies(input: {
  organizationId: string;
  limit?: number;
}) {
  return runWithOrganizationContext(input.organizationId, async (db) =>
    db.query.retentionPolicies.findMany({
      where: eq(retentionPolicies.organizationId, input.organizationId),
      orderBy: (table, { asc: ascOrder }) => [ascOrder(table.entityType)],
      limit: normalizeSystemAdminListLimit(input.limit, 50),
    }),
  );
}

export async function upsertRetentionPolicy(input: {
  organizationId: string;
  entityType: (typeof retentionPolicies.$inferInsert)["entityType"];
  retentionDays: number;
  legalHold: boolean;
  actorAuthUserId: string;
}) {
  return runWithOrganizationContext(input.organizationId, async (db) => {
    await db
      .insert(retentionPolicies)
      .values({
        organizationId: input.organizationId,
        entityType: input.entityType,
        retentionDays: input.retentionDays,
        legalHold: input.legalHold,
      })
      .onConflictDoUpdate({
        target: [
          retentionPolicies.organizationId,
          retentionPolicies.entityType,
        ],
        set: {
          retentionDays: input.retentionDays,
          legalHold: input.legalHold,
          updatedAt: new Date(),
        },
      });

    await createAuditLog({
      organizationId: input.organizationId,
      actorAuthUserId: input.actorAuthUserId,
      entityType: "organization",
      entityId: input.organizationId,
      action: "tenant.retention.updated",
      summary: `Retention policy for ${input.entityType} updated.`,
      metadata: {
        entityType: input.entityType,
        retentionDays: input.retentionDays,
        legalHold: input.legalHold,
      },
    });
  });
}

export async function getOrganizationProfile(input: {
  organizationId: string;
}) {
  return runWithOrganizationContext(input.organizationId, async (db) =>
    db.query.organizations.findFirst({
      where: eq(organizations.id, input.organizationId),
    }),
  );
}

export async function createCronRunHistory(input: {
  jobName: string;
  route: string;
  operation: string;
  status?: CronRunStatus;
  requestId?: string;
  startedAt?: Date;
  finishedAt?: Date | null;
  durationMs?: number | null;
  result?: Record<string, unknown>;
  errorMessage?: string | null;
}) {
  const db = getDb();
  const id = createEntityId("cron");
  const startedAt = input.startedAt ?? new Date();

  await db.insert(cronRunHistory).values({
    id,
    jobName: input.jobName,
    route: input.route,
    operation: input.operation,
    status: input.status ?? "started",
    requestId: input.requestId ?? null,
    startedAt,
    finishedAt: input.finishedAt ?? null,
    durationMs: input.durationMs ?? null,
    result: input.result ?? {},
    errorMessage: input.errorMessage ?? null,
  });

  return id;
}

export async function finishCronRunHistory(input: {
  id: string;
  status: Exclude<CronRunStatus, "started">;
  finishedAt?: Date;
  durationMs: number;
  result?: Record<string, unknown>;
  errorMessage?: string | null;
}) {
  const db = getDb();

  await db
    .update(cronRunHistory)
    .set({
      status: input.status,
      finishedAt: input.finishedAt ?? new Date(),
      durationMs: input.durationMs,
      result: input.result ?? {},
      errorMessage: input.errorMessage ?? null,
      updatedAt: new Date(),
    })
    .where(eq(cronRunHistory.id, input.id));
}

export async function listCronRunHistory(input: {
  limit?: number;
  jobName?: string;
} = {}): Promise<CronRunHistoryRow[]> {
  const db = getDb();

  return db
    .select({
      id: cronRunHistory.id,
      jobName: cronRunHistory.jobName,
      route: cronRunHistory.route,
      operation: cronRunHistory.operation,
      status: cronRunHistory.status,
      requestId: cronRunHistory.requestId,
      startedAt: cronRunHistory.startedAt,
      finishedAt: cronRunHistory.finishedAt,
      durationMs: cronRunHistory.durationMs,
      result: cronRunHistory.result,
      errorMessage: cronRunHistory.errorMessage,
    })
    .from(cronRunHistory)
    .where(
      input.jobName ? eq(cronRunHistory.jobName, input.jobName) : sql`true`,
    )
    .orderBy(desc(cronRunHistory.startedAt))
    .limit(input.limit ?? 50);
}
