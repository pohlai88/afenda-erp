const DEFAULT_DEV_SIGN_IN_REDIRECT = "/dashboard";
const BLOCKED_REDIRECT_PREFIXES = ["/api", "/onboarding", "/sign-in"] as const;

function isSafeInternalRedirectPath(path: string) {
  if (!path.startsWith("/") || path.startsWith("//")) {
    return false;
  }

  return !BLOCKED_REDIRECT_PREFIXES.some(
    (prefix) => path === prefix || path.startsWith(`${prefix}/`),
  );
}

function pathFromSameOriginReferer(input: {
  origin?: string;
  referer?: string;
}): string | null {
  if (!input.origin || !input.referer) return null;

  try {
    const origin = new URL(input.origin);
    const referer = new URL(input.referer);
    if (referer.origin !== origin.origin) return null;

    return `${referer.pathname}${referer.search}${referer.hash}`;
  } catch {
    return null;
  }
}

export function resolveDevSignInRedirectPath(input: {
  formValue?: string | null;
  origin?: string;
  referer?: string;
}) {
  const candidates = [
    input.formValue?.trim() || null,
    pathFromSameOriginReferer(input),
  ];

  for (const candidate of candidates) {
    if (candidate && isSafeInternalRedirectPath(candidate)) {
      return candidate;
    }
  }

  return DEFAULT_DEV_SIGN_IN_REDIRECT;
}
