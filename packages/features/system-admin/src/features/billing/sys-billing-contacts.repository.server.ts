import { updateTenantSettings } from "@afenda/db";
import {
  ensureTenantSettings,
  getTenantSettings,
} from "../../organization/data/system-admin.tenant-settings.repository.server";
import { listTenantMembers } from "../../users/data/system-admin.identity.repository.server";
import type { SystemAdminBillingContactRow } from "../contracts/system-admin.billing-list.contract";
import { formatBillingContactRoleLabel } from "../contracts/system-admin.billing-list.contract";
import {
  systemAdminBillingContactsStoredSchema,
  type SystemAdminBillingContactsInput,
  type SystemAdminBillingContactsStored,
} from "../schemas/system-admin.billing-contact.schema";

const BILLING_CONTACTS_BRANDING_KEY = "billingContacts";

function readStoredContacts(
  branding: Record<string, unknown> | undefined,
): SystemAdminBillingContactsStored {
  const raw = branding?.[BILLING_CONTACTS_BRANDING_KEY];
  const parsed = systemAdminBillingContactsStoredSchema.safeParse(raw);
  return parsed.success ? parsed.data : {};
}

export async function getSystemAdminBillingContacts(input: {
  organizationId: string;
}): Promise<readonly SystemAdminBillingContactRow[]> {
  await ensureTenantSettings({ organizationId: input.organizationId });
  const settings = await getTenantSettings({
    organizationId: input.organizationId,
  });
  const stored = readStoredContacts(settings?.branding);

  const roles = ["primary", "invoice", "procurement"] as const;
  const configured = roles.flatMap((role) => {
    const entry = stored[role];
    if (!entry) {
      return [];
    }

    return [
      {
        id: role,
        role,
        roleLabel: formatBillingContactRoleLabel(role),
        name: entry.name,
        email: entry.email,
        source: "configured" as const,
      },
    ];
  });

  if (configured.length > 0) {
    return configured;
  }

  const members = await listTenantMembers({
    organizationId: input.organizationId,
    limit: 50,
  });
  const primaryMember =
    members.find((member) => member.role === "owner") ?? members[0];

  if (!primaryMember) {
    return [];
  }

  return [
    {
      id: "primary-derived",
      role: "primary",
      roleLabel: formatBillingContactRoleLabel("primary"),
      name: primaryMember.name || primaryMember.email,
      email: primaryMember.email,
      source: "derived",
    },
  ];
}

export async function upsertSystemAdminBillingContacts(input: {
  organizationId: string;
  actorAuthUserId: string;
  contacts: SystemAdminBillingContactsInput;
}) {
  await ensureTenantSettings({ organizationId: input.organizationId });
  const settings = await getTenantSettings({
    organizationId: input.organizationId,
  });
  const branding = { ...(settings?.branding ?? {}) };
  const stored: SystemAdminBillingContactsStored = {
    primary: input.contacts.primary,
    invoice: input.contacts.invoice,
    procurement: input.contacts.procurement,
  };

  branding[BILLING_CONTACTS_BRANDING_KEY] = stored;

  await updateTenantSettings({
    organizationId: input.organizationId,
    actorAuthUserId: input.actorAuthUserId,
    patch: { branding },
  });
}
