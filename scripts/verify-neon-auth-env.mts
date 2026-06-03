import {
  getNeonAuthEnv,
  isNeonAuthEnabled,
} from "../packages/config/src/env.ts";
import { loadRootEnv } from "./load-root-env.mts";

loadRootEnv();

const env = getNeonAuthEnv();
const enabled = isNeonAuthEnabled();
const hints: string[] = [];
const errors: string[] = [];

const baseUrl = env.NEON_AUTH_BASE_URL?.trim();
const publicAuthUrl = process.env.NEXT_PUBLIC_AUTH_URL?.trim();
const cookieSecretLen = env.NEON_AUTH_COOKIE_SECRET?.length ?? 0;

if (env.AFENDA_NEON_AUTH_ENABLED === "1" && !env.configured) {
  errors.push(
    "AFENDA_NEON_AUTH_ENABLED=1 but NEON_AUTH_BASE_URL or NEON_AUTH_COOKIE_SECRET failed validation (min 32 chars for secret).",
  );
}

if (baseUrl) {
  if (/localhost|127\.0\.0\.1/i.test(baseUrl)) {
    errors.push(
      "NEON_AUTH_BASE_URL must be the hosted Neon Auth URL from the console/MCP, not localhost. Browser traffic uses NEXT_PUBLIC_AUTH_URL → /api/auth proxy.",
    );
  }
  if (!baseUrl.endsWith("/auth")) {
    hints.push(
      "NEON_AUTH_BASE_URL should end with /neondb/auth (or your branch db path + /auth).",
    );
  }
}

if (
  process.env.NEXT_PUBLIC_AFENDA_NEON_AUTH_ENABLED === "1" &&
  env.AFENDA_NEON_AUTH_ENABLED !== "1"
) {
  hints.push(
    "NEXT_PUBLIC_AFENDA_NEON_AUTH_ENABLED=1 but AFENDA_NEON_AUTH_ENABLED is not 1 — client may show Neon UI while server skips Neon.",
  );
}

/** Trusted origins for production branch (MCP — prod + localhost dev). */
const expectedTrustedOrigins = [
  "https://www.nexuscanon.com",
  "https://nexuscanon.com",
  "http://localhost:3000",
] as const;

let jwks: {
  ok: boolean;
  status?: number;
  error?: string;
  url?: string;
} = { ok: false };

if (enabled && baseUrl) {
  const jwksUrl = `${baseUrl.replace(/\/$/, "")}/.well-known/jwks.json`;
  jwks.url = jwksUrl;
  try {
    const response = await fetch(jwksUrl, {
      signal: AbortSignal.timeout(8_000),
      cache: "no-store",
    });
    jwks = { ok: response.ok, status: response.status };
    if (!response.ok) {
      errors.push(`JWKS fetch failed (${response.status}) at ${jwksUrl}`);
    }
  } catch (cause) {
    const message = cause instanceof Error ? cause.message : String(cause);
    jwks = { ok: false, error: message };
    errors.push(`JWKS fetch error: ${message}`);
  }
}

if (enabled && !publicAuthUrl) {
  errors.push(
    "NEXT_PUBLIC_AUTH_URL is required when Neon Auth is enabled (e.g. http://localhost:3000/api/auth). Browser client proxies to this origin; server uses NEON_AUTH_BASE_URL.",
  );
}

if (enabled) {
  hints.push(
    `Neon MCP trusted origins: ${expectedTrustedOrigins.join(", ")}; allow_localhost=true for local dev. Remove localhost before prod-only lockdown.`,
  );
  hints.push(
    "Optional hardening: replace shared SMTP with custom email provider via configure_neon_auth update_email_provider.",
  );
}

const authUiFlags = {
  AFENDA_AUTH_GOOGLE_ENABLED: process.env.AFENDA_AUTH_GOOGLE_ENABLED ?? "(unset)",
  AFENDA_AUTH_EMAIL_DELIVERY_READY:
    process.env.AFENDA_AUTH_EMAIL_DELIVERY_READY ?? "(unset)",
  AFENDA_AUTH_EMAIL_OTP_ENABLED:
    process.env.AFENDA_AUTH_EMAIL_OTP_ENABLED ?? "(unset)",
  AFENDA_AUTH_MAGIC_LINK_ENABLED:
    process.env.AFENDA_AUTH_MAGIC_LINK_ENABLED ?? "(unset)",
  AFENDA_AUTH_FORGOT_PASSWORD_ENABLED:
    process.env.AFENDA_AUTH_FORGOT_PASSWORD_ENABLED ?? "(unset)",
  AFENDA_AUTH_EMAIL_VERIFICATION_ENABLED:
    process.env.AFENDA_AUTH_EMAIL_VERIFICATION_ENABLED ?? "(unset)",
} as const;

const report = {
  neonAuthEnabled: enabled,
  configured: env.configured,
  flags: {
    AFENDA_NEON_AUTH_ENABLED: env.AFENDA_NEON_AUTH_ENABLED,
    NEXT_PUBLIC_AFENDA_NEON_AUTH_ENABLED:
      process.env.NEXT_PUBLIC_AFENDA_NEON_AUTH_ENABLED ?? "(unset)",
    AFENDA_DEV_AUTH_BYPASS: env.AFENDA_DEV_AUTH_BYPASS,
    ...authUiFlags,
  },
  presence: {
    NEON_AUTH_BASE_URL: Boolean(baseUrl),
    NEON_AUTH_COOKIE_SECRET: cookieSecretLen >= 32,
    NEON_AUTH_COOKIE_SECRET_length: cookieSecretLen,
    NEXT_PUBLIC_AUTH_URL: Boolean(publicAuthUrl),
  },
  baseUrlHost: baseUrl ? new URL(baseUrl).host : null,
  jwks,
  neonMcp: {
    projectId: process.env.NEON_PROJECT_ID?.trim() || "snowy-dawn-60990429",
    expectedTrustedOrigins,
  },
  hints,
  errors,
  doc: "docs/development/neon-auth.md",
};

console.log(JSON.stringify(report, null, 2));

if (errors.length > 0) {
  process.exitCode = 1;
}
