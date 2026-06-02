import type { NextConfig } from "next";

import { assertCiBuildEnv } from "./env.build.js";

/**
 * Workspace packages compiled by Next during `apps/erp` build.
 * When adding `@afenda/feature-<moduleId>` or a first-class runtime package,
 * append it here (ARCH-1002).
 */
export const afendaTranspilePackages = [
  "@afenda/ai",
  "@afenda/appshell",
  "@afenda/auth",
  "@afenda/billing",
  "@afenda/config",
  "@afenda/db",
  "@afenda/kernel",
  "@afenda/feature-system-admin",
  "@afenda/feature-crm",
  "@afenda/feature-dashboard",
  "@afenda/feature-finance",
  "@afenda/feature-hr-suite",
  "@afenda/feature-knowledge",
  "@afenda/feature-lynx",
  "@afenda/feature-inventory",
  "@afenda/feature-purchasing",
  "@afenda/feature-reports",
  "@afenda/feature-sales",
  "@afenda/governed-surface",
  "@afenda/observability",
  "@afenda/object-storage",
  "@afenda/ui",
  "@afenda/workflows",
] as const;

export const afendaSecurityHeaders = [
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
  {
    key: "X-Frame-Options",
    value: "DENY",
  },
] as const;

export function createAfendaNextConfig(overrides: NextConfig = {}): NextConfig {
  assertCiBuildEnv();

  return {
    cacheComponents: true,
    ...(process.env.NODE_ENV === "development"
      ? {
          experimental: {
            instantNavigationDevToolsToggle: true,
          },
        }
      : {}),
    transpilePackages: [...afendaTranspilePackages],
    images: {
      remotePatterns: [
        {
          protocol: "https",
          hostname: "*.public.blob.vercel-storage.com",
          pathname: "/**",
        },
      ],
    },
    async headers() {
      return [
        {
          source: "/:path*",
          headers: [...afendaSecurityHeaders],
        },
      ];
    },
    ...overrides,
  };
}
