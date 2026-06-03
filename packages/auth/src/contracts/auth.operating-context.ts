import { z } from "zod";

/** Key under `tenant_settings.branding` for workspace operating-context hierarchy labels. */
export const OPERATING_CONTEXT_BRANDING_KEY = "operatingContext";

export const organizationOperatingContextBrandingSchema = z
  .object({
    tenantLabel: z.string().trim().min(1).max(80).optional(),
    groupLabel: z.string().trim().min(1).max(80).optional(),
    companyLabel: z.string().trim().min(1).max(80).optional(),
  })
  .strict();

export type OrganizationOperatingContextLabels = z.infer<
  typeof organizationOperatingContextBrandingSchema
>;

export type ResolvedOrganizationOperatingContext = {
  tenantLabel: string;
  groupLabel?: string;
  companyLabel?: string;
  organizationLabel?: string;
  workspaceLabel?: string;
};

export function readOrganizationOperatingContextLabels(
  branding: Record<string, unknown> | undefined,
): OrganizationOperatingContextLabels | undefined {
  const raw = branding?.[OPERATING_CONTEXT_BRANDING_KEY];
  const parsed = organizationOperatingContextBrandingSchema.safeParse(raw);

  if (!parsed.success) {
    return undefined;
  }

  const labels = parsed.data;

  if (!labels.tenantLabel && !labels.groupLabel && !labels.companyLabel) {
    return undefined;
  }

  return labels;
}

type OrganizationOperatingContextInput = {
  name: string;
  slug: string;
  operatingContextLabels?: OrganizationOperatingContextLabels;
};

export function resolveOrganizationOperatingContext(
  organization: OrganizationOperatingContextInput,
  workspaceLabel?: string,
): ResolvedOrganizationOperatingContext {
  const labels = organization.operatingContextLabels;

  return {
    tenantLabel: labels?.tenantLabel ?? organization.name,
    groupLabel: labels?.groupLabel,
    companyLabel: labels?.companyLabel,
    organizationLabel: organization.slug,
    ...(workspaceLabel ? { workspaceLabel } : {}),
  };
}

export type OrganizationOperatingContextSource = OrganizationOperatingContextInput & {
  id: string;
};

export type OperatingContextSwitchOption = {
  organizationId: string;
  tenantLabel: string;
  groupLabel?: string;
  companyLabel?: string;
  organizationLabel?: string;
  isActive: boolean;
};

export function buildOperatingContextSwitchOptions(
  organizations: readonly OrganizationOperatingContextSource[],
  activeOrganizationId: string,
): OperatingContextSwitchOption[] | undefined {
  if (organizations.length < 2) {
    return undefined;
  }

  return organizations.map((organization) => ({
    organizationId: organization.id,
    ...resolveOrganizationOperatingContext(organization),
    isActive: organization.id === activeOrganizationId,
  }));
}
