export const ROUTES_FAIL_BANNER =
  "YOU DAMN SON OF BITH AI, READ THE RULES!!!!";

/**
 * routes/{topic}-route.{artifact}.{ext}
 * routes/route-{topic}.{artifact}.{ext}
 *
 * Every filename MUST contain the word "route" via `-route` or `route-` prefix.
 */
export const ROUTES_FILE_PATTERN =
  /^(?:route-[a-z0-9-]+|[a-z0-9-]+-route(?:-[a-z0-9-]+)?)(?:\.[a-z0-9-]+)*\.(?:tsx|ts)$/;

const EXAMPLE_NAMES = [
  "lynx-console-route.server.tsx",
  "onboarding-route.server.tsx",
  "execution-context-route.server.ts",
  "lynx-page-shell-route.server.tsx",
  "auth-route-fallback.tsx",
  "route-state.tsx",
  "route-state.client.tsx",
  "lynx-route-props.ts",
];

export function routesNamingViolation(fileName: string): string | null {
  if (!/\.(?:tsx|ts)$/.test(fileName)) {
    return `routes file must be .ts or .tsx — got ${fileName}`;
  }

  if (ROUTES_FILE_PATTERN.test(fileName)) {
    return null;
  }

  return `invalid routes name "${fileName}" — filename must include -route or start with route- (e.g. ${EXAMPLE_NAMES.join(", ")})`;
}

export function routesPathViolation(relPath: string): string | null {
  const normalized = relPath.replace(/\\/g, "/");
  const prefix = "apps/erp/src/routes/";

  if (!normalized.startsWith(prefix)) {
    return null;
  }

  const remainder = normalized.slice(prefix.length);
  if (!remainder || remainder.includes("/")) {
    return `routes/ must stay flat — no subdirectories`;
  }

  return routesNamingViolation(remainder);
}
