import { systemAdminRoutePaths } from "@afenda/feature-system-admin";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { ComponentType } from "react";
import {
  systemAdminSectionManifest,
  type SystemAdminSectionSlug,
} from "./manifest.shared";

export type { SystemAdminSectionSlug } from "./manifest.shared";
export {
  describeSystemAdminSection,
  systemAdminSectionManifest,
} from "./manifest.shared";

export type SystemAdminSectionPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

type SystemAdminSectionModule = {
  default: ComponentType<SystemAdminSectionPageProps>;
  metadata?: Metadata;
};

/** Slug → lazy route adapter (thin app shell over @afenda/feature-system-admin). */
const sectionLoaders = {
  approvals: () => import("./approvals.server"),
  audit: () => import("./audit.server"),
  billing: () => import("./billing.server"),
  capabilities: () => import("./capabilities.server"),
  diagnostics: () => import("./diagnostics.server"),
  identity: () => import("./identity.server"),
  integrations: () => import("./integrations.server"),
  lynx: () => import("./lynx.server"),
  memberships: () => import("./memberships.server"),
  modules: () => import("./modules.server"),
  organization: () => import("./organization.server"),
  permissions: () => import("./permissions.server"),
  policies: () => import("./policies.server"),
  reliability: () => import("./reliability.server"),
  roles: () => import("./roles.server"),
  security: () => import("./security.server"),
  users: () => import("./users.server"),
} satisfies Record<SystemAdminSectionSlug, () => Promise<SystemAdminSectionModule>>;

export const systemAdminSectionSlugs = Object.values(systemAdminRoutePaths)
  .filter((path) => path !== systemAdminRoutePaths.hub)
  .map((path) => path.replace("/system-admin/", "")) as SystemAdminSectionSlug[];

function isSystemAdminSectionSlug(
  slug: string,
): slug is SystemAdminSectionSlug {
  return slug in sectionLoaders;
}

export function resolveSystemAdminSectionSlug(
  section: string[],
): SystemAdminSectionSlug {
  const slug = section[0];

  if (!slug || section.length > 1 || !isSystemAdminSectionSlug(slug)) {
    notFound();
  }

  return slug;
}

export async function loadSystemAdminSection(slug: SystemAdminSectionSlug) {
  return sectionLoaders[slug]();
}

const manifestSlugs = Object.keys(
  systemAdminSectionManifest,
) as SystemAdminSectionSlug[];

for (const slug of manifestSlugs) {
  if (!(slug in sectionLoaders)) {
    throw new Error(
      `system-admin section manifest missing loader for "${slug}"`,
    );
  }
}
