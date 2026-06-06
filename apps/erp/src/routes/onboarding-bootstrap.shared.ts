export const MIN_ONBOARDING_ORGANIZATION_NAME_LENGTH = 3;
export const MAX_ONBOARDING_ORGANIZATION_NAME_LENGTH = 120;

export function normalizeOnboardingOrganizationName(
  value: FormDataEntryValue | string | null,
) {
  return String(value ?? "")
    .trim()
    .replace(/\s+/g, " ");
}

export function isValidOnboardingOrganizationName(value: string) {
  return (
    value.length >= MIN_ONBOARDING_ORGANIZATION_NAME_LENGTH &&
    value.length <= MAX_ONBOARDING_ORGANIZATION_NAME_LENGTH
  );
}
