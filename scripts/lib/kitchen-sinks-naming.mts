export const KITCHEN_SINK_FAIL_BANNER =
  "YOU MOTHER FUCKER AI, READ THE RULES!!!";

/** What the file does — fixed vocabulary, no inventing new suffixes. */
export const KITCHEN_SINK_ROLES = [
  "run",
  "contract",
  "redirect",
  "metadata",
  "helper",
] as const;

export type KitchenSinkRole = (typeof KITCHEN_SINK_ROLES)[number];

/**
 * kitchen-sinks/{topic}.{role}.ts
 *
 * topic — kebab-case WHAT (cron, auth-dev-sign-in, erp-http). No app- prefix.
 * role  — run | contract | redirect | metadata | helper
 */
export const KITCHEN_SINK_FILE_PATTERN =
  /^[a-z][a-z0-9-]*\.(run|contract|redirect|metadata|helper)\.ts$/;

const EXAMPLE_NAMES = [
  "cron.run.ts",
  "erp-http.contract.ts",
  "auth-dev-sign-in.redirect.ts",
  "module-feature.metadata.ts",
];

export function kitchenSinkNamingViolation(fileName: string): string | null {
  if (!fileName.endsWith(".ts")) {
    return `kitchen-sinks file must be .ts — got ${fileName}`;
  }

  if (KITCHEN_SINK_FILE_PATTERN.test(fileName)) {
    return null;
  }

  return `invalid kitchen-sinks name "${fileName}" — use {topic}.{role}.ts where role is one of: ${KITCHEN_SINK_ROLES.join(", ")}. Examples: ${EXAMPLE_NAMES.join(", ")}`;
}

export function kitchenSinkPathViolation(relPath: string): string | null {
  const normalized = relPath.replace(/\\/g, "/");
  const prefix = "apps/erp/src/kitchen-sinks/";

  if (!normalized.startsWith(prefix)) {
    return null;
  }

  const remainder = normalized.slice(prefix.length);
  if (!remainder || remainder.includes("/")) {
    return null;
  }

  return kitchenSinkNamingViolation(remainder);
}
