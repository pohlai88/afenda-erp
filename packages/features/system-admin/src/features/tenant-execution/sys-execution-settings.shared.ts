export const MINUTES_PER_HOUR = 60;

export function readExecutionSettingConfiguration(value: unknown) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

export function readConfigurationString(value: unknown, fallback: string) {
  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : fallback;
}

export function readConfigurationNumber(value: unknown, fallback: number) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

export function readConfigurationOptionalNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

export function readOptionalFormValue(value: FormDataEntryValue | null) {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}
