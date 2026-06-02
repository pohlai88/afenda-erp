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
  systemAdminDataExportJobs,
  systemAdminDataImportJobs,
  systemAdminDataImportRows,
  tenantApprovalSettings,
  tenantCapabilitySettings,
  tenantModuleSettings,
  tenantPolicySettings,
  tenantRoleCatalog,
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
  updatedAt: Date;
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

export type SystemAdminDataImportJobStatus =
  | "uploaded"
  | "validating"
  | "ready"
  | "running"
  | "completed"
  | "failed"
  | "cancelled";

export type SystemAdminDataImportRowStatus =
  | "pending"
  | "validated"
  | "applied"
  | "failed"
  | "skipped";

export type SystemAdminDataExportJobStatus = "ready" | "failed" | "expired";

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

export type SystemAdminDataImportJobRow = {
  id: string;
  organizationId: string;
  adapterId: string;
  templateId: string;
  sourceLabel: string;
  filename: string | null;
  inputDigest: string;
  status: SystemAdminDataImportJobStatus;
  totalRows: number;
  validatedRows: number;
  appliedRows: number;
  failedRows: number;
  skippedRows: number;
  createdByAuthUserId: string;
  startedAt: Date | null;
  completedAt: Date | null;
  cancelledAt: Date | null;
  errorSummary: string | null;
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
};

export type SystemAdminDataImportRowEvidence = {
  id: string;
  organizationId: string;
  jobId: string;
  rowNumber: number;
  status: SystemAdminDataImportRowStatus;
  rowDigest: string;
  validationCode: string | null;
  validationMessage: string | null;
  redactedPreview: Record<string, string>;
  appliedTargetType: string | null;
  appliedTargetId: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type SystemAdminDataExportJobRow = {
  id: string;
  organizationId: string;
  exportType: string;
  sourceLabel: string;
  status: SystemAdminDataExportJobStatus;
  rowCount: number;
  packageDigest: string;
  createdByAuthUserId: string;
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
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

export type TenantRoleCatalogRow = {
  organizationId: string;
  role: PermissionRole;
  displayName: string | null;
  description: string | null;
  deprecated: boolean;
};

export async function listTenantRoleCatalog(input: {
  organizationId: string;
}): Promise<TenantRoleCatalogRow[]> {
  return runWithOrganizationContext(input.organizationId, async (db) => {
    const rows = await db
      .select({
        organizationId: tenantRoleCatalog.organizationId,
        role: tenantRoleCatalog.role,
        displayName: tenantRoleCatalog.displayName,
        description: tenantRoleCatalog.description,
        deprecated: tenantRoleCatalog.deprecated,
      })
      .from(tenantRoleCatalog)
      .where(eq(tenantRoleCatalog.organizationId, input.organizationId))
      .orderBy(asc(tenantRoleCatalog.role));

    return rows;
  });
}

export async function upsertTenantRoleCatalogEntry(input: {
  organizationId: string;
  role: PermissionRole;
  displayName?: string | null;
  description?: string | null;
  deprecated?: boolean;
  actorAuthUserId: string;
}) {
  return runWithOrganizationContext(input.organizationId, async (db) => {
    const existing = await db
      .select()
      .from(tenantRoleCatalog)
      .where(
        and(
          eq(tenantRoleCatalog.organizationId, input.organizationId),
          eq(tenantRoleCatalog.role, input.role),
        ),
      )
      .limit(1);

    const previous = existing[0];

    await db
      .insert(tenantRoleCatalog)
      .values({
        organizationId: input.organizationId,
        role: input.role,
        displayName: input.displayName ?? null,
        description: input.description ?? null,
        deprecated: input.deprecated ?? false,
      })
      .onConflictDoUpdate({
        target: [tenantRoleCatalog.organizationId, tenantRoleCatalog.role],
        set: {
          ...(input.displayName !== undefined
            ? { displayName: input.displayName }
            : {}),
          ...(input.description !== undefined
            ? { description: input.description }
            : {}),
          ...(input.deprecated !== undefined
            ? { deprecated: input.deprecated }
            : {}),
          updatedAt: new Date(),
        },
      });

    await createAuditLog({
      organizationId: input.organizationId,
      actorAuthUserId: input.actorAuthUserId,
      entityType: "organization",
      entityId: input.organizationId,
      action: "tenant.role.changed",
      summary: `Role catalog updated for ${input.role}.`,
      metadata: {
        role: input.role,
        displayName: input.displayName ?? previous?.displayName ?? null,
        description: input.description ?? previous?.description ?? null,
        deprecated: input.deprecated ?? previous?.deprecated ?? false,
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
        updatedAt: tenantModuleSettings.updatedAt,
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

export async function getOrganizationInvitationById(input: {
  organizationId: string;
  invitationId: string;
}) {
  return runWithOrganizationContext(input.organizationId, async (db) => {
    const [invitation] = await db
      .select({
        id: organizationInvitations.id,
        email: organizationInvitations.email,
        role: organizationInvitations.role,
        status: organizationInvitations.status,
      })
      .from(organizationInvitations)
      .where(
        and(
          eq(organizationInvitations.id, input.invitationId),
          eq(organizationInvitations.organizationId, input.organizationId),
        ),
      )
      .limit(1);

    return invitation ?? null;
  });
}

export async function resendOrganizationInvitation(input: {
  organizationId: string;
  invitationId: string;
  actorAuthUserId: string;
  expiresInDays?: number;
}) {
  const invitation = await getOrganizationInvitationById({
    organizationId: input.organizationId,
    invitationId: input.invitationId,
  });

  if (!invitation) {
    throw new Error("Organization invitation was not found for this tenant.");
  }

  if (invitation.status !== "pending") {
    throw new Error("Only pending invitations can be resent.");
  }

  const token = randomBytes(32).toString("hex");
  const tokenHash = hashSecret(token);
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + (input.expiresInDays ?? 7));

  await runWithOrganizationContext(input.organizationId, async (db) => {
    const [updated] = await db
      .update(organizationInvitations)
      .set({
        tokenHash,
        expiresAt,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(organizationInvitations.id, input.invitationId),
          eq(organizationInvitations.organizationId, input.organizationId),
          eq(organizationInvitations.status, "pending"),
        ),
      )
      .returning({ id: organizationInvitations.id });

    if (!updated) {
      throw new Error("Pending organization invitation was not found for this tenant.");
    }

    await createAuditLog({
      organizationId: input.organizationId,
      actorAuthUserId: input.actorAuthUserId,
      entityType: "membership",
      entityId: input.invitationId,
      action: "tenant.invitation.resent",
      summary: `Invitation resent to ${invitation.email}.`,
      metadata: { invitationId: input.invitationId, email: invitation.email },
    });
  });

  return { invitationId: input.invitationId, token };
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

export async function listSystemAdminDataImportJobs(input: {
  organizationId: string;
  limit?: number;
}): Promise<SystemAdminDataImportJobRow[]> {
  return runWithOrganizationContext(input.organizationId, async (db) =>
    db
      .select()
      .from(systemAdminDataImportJobs)
      .where(eq(systemAdminDataImportJobs.organizationId, input.organizationId))
      .orderBy(desc(systemAdminDataImportJobs.createdAt))
      .limit(normalizeSystemAdminListLimit(input.limit, 100)),
  );
}

export async function getSystemAdminDataImportJob(input: {
  organizationId: string;
  jobId: string;
}): Promise<SystemAdminDataImportJobRow | null> {
  return runWithOrganizationContext(input.organizationId, async (db) => {
    const [job] = await db
      .select()
      .from(systemAdminDataImportJobs)
      .where(
        and(
          eq(systemAdminDataImportJobs.organizationId, input.organizationId),
          eq(systemAdminDataImportJobs.id, input.jobId),
        ),
      )
      .limit(1);

    return job ?? null;
  });
}

export async function listSystemAdminDataImportRows(input: {
  organizationId: string;
  jobId?: string;
  status?: SystemAdminDataImportRowStatus;
  limit?: number;
}): Promise<SystemAdminDataImportRowEvidence[]> {
  return runWithOrganizationContext(input.organizationId, async (db) =>
    db
      .select()
      .from(systemAdminDataImportRows)
      .where(
        and(
          eq(systemAdminDataImportRows.organizationId, input.organizationId),
          input.jobId
            ? eq(systemAdminDataImportRows.jobId, input.jobId)
            : sql`true`,
          input.status
            ? eq(systemAdminDataImportRows.status, input.status)
            : sql`true`,
        ),
      )
      .orderBy(asc(systemAdminDataImportRows.rowNumber))
      .limit(normalizeSystemAdminListLimit(input.limit, 100)),
  );
}

export async function createSystemAdminDataImportJob(input: {
  organizationId: string;
  adapterId: string;
  templateId: string;
  sourceLabel: string;
  filename?: string | null;
  inputDigest: string;
  createdByAuthUserId: string;
  metadata?: Record<string, unknown>;
  rows: readonly {
    rowNumber: number;
    status: Extract<SystemAdminDataImportRowStatus, "validated" | "failed" | "skipped">;
    rowDigest: string;
    validationCode?: string | null;
    validationMessage?: string | null;
    redactedPreview?: Record<string, string>;
  }[];
}): Promise<SystemAdminDataImportJobRow> {
  const id = createEntityId("dmjob");
  const now = new Date();
  const totalRows = input.rows.length;
  const validatedRows = input.rows.filter((row) => row.status === "validated").length;
  const failedRows = input.rows.filter((row) => row.status === "failed").length;
  const skippedRows = input.rows.filter((row) => row.status === "skipped").length;
  const status: SystemAdminDataImportJobStatus =
    totalRows === 0 || validatedRows === 0 ? "failed" : "ready";

  return runWithOrganizationContext(input.organizationId, async (db) =>
    db.transaction(async (tx) => {
      const [job] = await tx
        .insert(systemAdminDataImportJobs)
        .values({
          id,
          organizationId: input.organizationId,
          adapterId: input.adapterId,
          templateId: input.templateId,
          sourceLabel: input.sourceLabel,
          filename: input.filename ?? null,
          inputDigest: input.inputDigest,
          status,
          totalRows,
          validatedRows,
          appliedRows: 0,
          failedRows,
          skippedRows,
          createdByAuthUserId: input.createdByAuthUserId,
          errorSummary:
            status === "failed"
              ? "No valid rows were available for import execution."
              : null,
          metadata: input.metadata ?? {},
          createdAt: now,
          updatedAt: now,
        })
        .returning();

      if (input.rows.length > 0) {
        await tx.insert(systemAdminDataImportRows).values(
          input.rows.map((row) => ({
            id: createEntityId("dmrow"),
            organizationId: input.organizationId,
            jobId: id,
            rowNumber: row.rowNumber,
            status: row.status,
            rowDigest: row.rowDigest,
            validationCode: row.validationCode ?? null,
            validationMessage: row.validationMessage ?? null,
            redactedPreview: row.redactedPreview ?? {},
            createdAt: now,
            updatedAt: now,
          })),
        );
      }

      if (!job) {
        throw new Error("Failed to create data import job.");
      }

      return job;
    }),
  );
}

export async function runSystemAdminDataImportJob(input: {
  organizationId: string;
  jobId: string;
}): Promise<SystemAdminDataImportJobRow> {
  const now = new Date();

  return runWithOrganizationContext(input.organizationId, async (db) =>
    db.transaction(async (tx) => {
      const [job] = await tx
        .select()
        .from(systemAdminDataImportJobs)
        .where(
          and(
            eq(systemAdminDataImportJobs.organizationId, input.organizationId),
            eq(systemAdminDataImportJobs.id, input.jobId),
          ),
        )
        .limit(1);

      if (!job) {
        throw new Error("Data import job was not found for this tenant.");
      }

      if (job.status !== "ready" && job.status !== "running") {
        throw new Error(`Data import job cannot run from ${job.status} state.`);
      }

      const eligibleRows = await tx
        .select({ id: systemAdminDataImportRows.id })
        .from(systemAdminDataImportRows)
        .where(
          and(
            eq(systemAdminDataImportRows.organizationId, input.organizationId),
            eq(systemAdminDataImportRows.jobId, input.jobId),
            inArray(systemAdminDataImportRows.status, ["pending", "validated"]),
          ),
        );

      if (eligibleRows.length > 0) {
        await tx
          .update(systemAdminDataImportRows)
          .set({
            status: "applied",
            appliedTargetType: "data-management-import-evidence",
            appliedTargetId: input.jobId,
            updatedAt: now,
          })
          .where(
            inArray(
              systemAdminDataImportRows.id,
              eligibleRows.map((row) => row.id),
            ),
          );
      }

      const appliedRows = job.appliedRows + eligibleRows.length;
      const finalStatus: SystemAdminDataImportJobStatus =
        eligibleRows.length === 0 && job.failedRows > 0 ? "failed" : "completed";

      const [updated] = await tx
        .update(systemAdminDataImportJobs)
        .set({
          status: finalStatus,
          startedAt: job.startedAt ?? now,
          completedAt: now,
          appliedRows,
          errorSummary:
            finalStatus === "failed"
              ? "No retry-safe validated rows were available to apply."
              : null,
          updatedAt: now,
        })
        .where(
          and(
            eq(systemAdminDataImportJobs.organizationId, input.organizationId),
            eq(systemAdminDataImportJobs.id, input.jobId),
          ),
        )
        .returning();

      if (!updated) {
        throw new Error("Failed to update data import job.");
      }

      return updated;
    }),
  );
}

export async function cancelSystemAdminDataImportJob(input: {
  organizationId: string;
  jobId: string;
}): Promise<SystemAdminDataImportJobRow> {
  const now = new Date();

  return runWithOrganizationContext(input.organizationId, async (db) => {
    const [updated] = await db
      .update(systemAdminDataImportJobs)
      .set({
        status: "cancelled",
        cancelledAt: now,
        updatedAt: now,
      })
      .where(
        and(
          eq(systemAdminDataImportJobs.organizationId, input.organizationId),
          eq(systemAdminDataImportJobs.id, input.jobId),
          inArray(systemAdminDataImportJobs.status, [
            "uploaded",
            "validating",
            "ready",
            "running",
          ]),
        ),
      )
      .returning();

    if (!updated) {
      throw new Error("Cancellable data import job was not found.");
    }

    return updated;
  });
}

export async function retrySystemAdminDataImportJob(input: {
  organizationId: string;
  jobId: string;
}): Promise<SystemAdminDataImportJobRow> {
  const now = new Date();

  return runWithOrganizationContext(input.organizationId, async (db) =>
    db.transaction(async (tx) => {
      const [job] = await tx
        .select()
        .from(systemAdminDataImportJobs)
        .where(
          and(
            eq(systemAdminDataImportJobs.organizationId, input.organizationId),
            eq(systemAdminDataImportJobs.id, input.jobId),
          ),
        )
        .limit(1);

      if (!job) {
        throw new Error("Data import job was not found for retry.");
      }

      if (job.status !== "failed" && job.status !== "cancelled") {
        throw new Error(`Data import job cannot retry from ${job.status} state.`);
      }

      const failedRows = await tx
        .select({ id: systemAdminDataImportRows.id })
        .from(systemAdminDataImportRows)
        .where(
          and(
            eq(systemAdminDataImportRows.organizationId, input.organizationId),
            eq(systemAdminDataImportRows.jobId, input.jobId),
            eq(systemAdminDataImportRows.status, "failed"),
          ),
        );

      if (failedRows.length > 0) {
        await tx
          .update(systemAdminDataImportRows)
          .set({
            status: "validated",
            validationCode: null,
            validationMessage: null,
            updatedAt: now,
          })
          .where(
            inArray(
              systemAdminDataImportRows.id,
              failedRows.map((row) => row.id),
            ),
          );
      }

      const [updated] = await tx
        .update(systemAdminDataImportJobs)
        .set({
          status: "ready",
          validatedRows: job.validatedRows + failedRows.length,
          failedRows: Math.max(0, job.failedRows - failedRows.length),
          errorSummary: null,
          cancelledAt: null,
          completedAt: null,
          updatedAt: now,
        })
        .where(
          and(
            eq(systemAdminDataImportJobs.organizationId, input.organizationId),
            eq(systemAdminDataImportJobs.id, input.jobId),
          ),
        )
        .returning();

      if (!updated) {
        throw new Error("Failed to retry data import job.");
      }

      return updated;
    }),
  );
}

export async function listSystemAdminDataExportJobs(input: {
  organizationId: string;
  limit?: number;
}): Promise<SystemAdminDataExportJobRow[]> {
  return runWithOrganizationContext(input.organizationId, async (db) =>
    db
      .select()
      .from(systemAdminDataExportJobs)
      .where(eq(systemAdminDataExportJobs.organizationId, input.organizationId))
      .orderBy(desc(systemAdminDataExportJobs.createdAt))
      .limit(normalizeSystemAdminListLimit(input.limit, 100)),
  );
}

export async function recordSystemAdminDataExportJob(input: {
  organizationId: string;
  exportType: string;
  sourceLabel: string;
  rowCount: number;
  packageDigest: string;
  createdByAuthUserId: string;
  metadata?: Record<string, unknown>;
}): Promise<SystemAdminDataExportJobRow> {
  const now = new Date();

  return runWithOrganizationContext(input.organizationId, async (db) => {
    const [row] = await db
      .insert(systemAdminDataExportJobs)
      .values({
        id: createEntityId("dmexp"),
        organizationId: input.organizationId,
        exportType: input.exportType,
        sourceLabel: input.sourceLabel,
        status: "ready",
        rowCount: input.rowCount,
        packageDigest: input.packageDigest,
        createdByAuthUserId: input.createdByAuthUserId,
        metadata: input.metadata ?? {},
        createdAt: now,
        updatedAt: now,
      })
      .returning();

    if (!row) {
      throw new Error("Failed to record data export job.");
    }

    return row;
  });
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

export async function getRetentionPolicy(input: {
  organizationId: string;
  entityType: (typeof retentionPolicies.$inferInsert)["entityType"];
}) {
  return runWithOrganizationContext(input.organizationId, async (db) =>
    db.query.retentionPolicies.findFirst({
      where: and(
        eq(retentionPolicies.organizationId, input.organizationId),
        eq(retentionPolicies.entityType, input.entityType),
      ),
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

export async function getOrganizationObjectStorageProvider(input: {
  organizationId: string;
}): Promise<"vercel-blob" | "r2" | null> {
  const profile = await getOrganizationProfile(input);
  return profile?.objectStorageProvider ?? null;
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
