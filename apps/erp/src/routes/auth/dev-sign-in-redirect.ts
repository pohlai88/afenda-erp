const DEV_SIGN_IN_FALLBACK_PATH = "/dashboard";
const BLOCKED_REDIRECT_PREFIXES = [
  "/api/",
  "/forgot-password",
  "/onboarding",
  "/sign-in",
  "/sign-up",
] as const;

function isBlockedPath(pathname: string) {
  return BLOCKED_REDIRECT_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix),
  );
}

function normalizeInternalPath(value: string | null | undefined) {
  const trimmed = value?.trim();

  if (!trimmed || !trimmed.startsWith("/") || trimmed.startsWith("//")) {
    return null;
  }

  try {
    const url = new URL(trimmed, "http://afenda.local");

    if (url.origin !== "http://afenda.local" || isBlockedPath(url.pathname)) {
      return null;
    }

    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return null;
  }
}

function getPathFromReferer(input: {
  origin: string | null | undefined;
  referer: string | null | undefined;
}) {
  if (!input.referer) {
    return null;
  }

  try {
    const refererUrl = new URL(input.referer);
    const origin = input.origin?.trim();

    if (origin && refererUrl.origin !== origin) {
      return null;
    }

    return normalizeInternalPath(
      `${refererUrl.pathname}${refererUrl.search}${refererUrl.hash}`,
    );
  } catch {
    return null;
  }
}

export function resolveDevSignInRedirectPath(input: {
  formValue?: FormDataEntryValue | null;
  origin?: string | null;
  referer?: string | null;
}) {
  const formPath =
    typeof input.formValue === "string"
      ? normalizeInternalPath(input.formValue)
      : null;

  return (
    formPath ??
    getPathFromReferer({
      origin: input.origin,
      referer: input.referer,
    }) ??
    DEV_SIGN_IN_FALLBACK_PATH
  );
}
