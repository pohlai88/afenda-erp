"use server";

import { hrSuiteActionFailure } from "../../../hr-suite-integration/server";
import { require__IDENTIFIER__Read } from "../policies/__DOMAIN_KEY__-access.policy.server";

export async function refresh__IDENTIFIER__WorkbenchAction() {
  try {
    const guard = await require__IDENTIFIER__Read();
    return {
      ok: true as const,
      data: {
        organizationId: guard.organization.id,
        refreshedAt: new Date().toISOString(),
      },
    };
  } catch {
    return hrSuiteActionFailure("Unable to refresh __CAPABILITY_TITLE__.", {
      code: "__DOMAIN_KEY__.refresh_failed",
    });
  }
}
