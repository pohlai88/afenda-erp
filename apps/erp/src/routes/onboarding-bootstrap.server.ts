import "server-only";

import { readNeonAuthSessionPayload } from "@afenda/auth/neon-auth/server";
import {
  bootstrapOrganizationForUser,
  isOrganizationAlreadyBootstrappedError,
  listOrganizationsForUser,
} from "@afenda/db";

import {
  isValidOnboardingOrganizationName,
  normalizeOnboardingOrganizationName,
} from "@/routes/onboarding-bootstrap.shared";

export type OnboardingBootstrapResult =
  | { ok: true }
  | {
      ok: false;
      code:
        | "unauthenticated"
        | "invalid-organization-name"
        | "already-bootstrapped"
        | "bootstrap-failed";
      organizationName?: string;
    };

export {
  isValidOnboardingOrganizationName,
  normalizeOnboardingOrganizationName,
} from "@/routes/onboarding-bootstrap.shared";

export async function submitOnboardingBootstrap(
  organizationNameInput: FormDataEntryValue | string | null,
): Promise<OnboardingBootstrapResult> {
  const organizationName =
    normalizeOnboardingOrganizationName(organizationNameInput);

  const session = await readNeonAuthSessionPayload();

  if (!session?.session || !session.user) {
    return { ok: false, code: "unauthenticated" };
  }

  if (!isValidOnboardingOrganizationName(organizationName)) {
    return {
      ok: false,
      code: "invalid-organization-name",
      organizationName: organizationName || undefined,
    };
  }

  const existingOrganizations = await listOrganizationsForUser(session.user.id);
  if (existingOrganizations.length > 0) {
    return { ok: false, code: "already-bootstrapped" };
  }

  try {
    await bootstrapOrganizationForUser({
      authUserId: session.user.id,
      email: session.user.email,
      name: session.user.name,
      organizationName,
    });

    return { ok: true };
  } catch (error) {
    if (isOrganizationAlreadyBootstrappedError(error)) {
      return { ok: false, code: "already-bootstrapped" };
    }

    return {
      ok: false,
      code: "bootstrap-failed",
      organizationName,
    };
  }
}
