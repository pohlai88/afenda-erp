import type { NextConfig } from "next";

/**
 * Workspace packages compiled by Next during `apps/erp` build.
 * When adding `@afenda/feature-<moduleId>`, append it here (ARCH-002).
 */
export const afendaTranspilePackages = [
  "@afenda/ai",
  "@afenda/auth",
  "@afenda/config",
  "@afenda/db",
  "@afenda/domain",
  "@afenda/feature-admin",
  "@afenda/feature-approvals",
  "@afenda/feature-crm",
  "@afenda/feature-finance",
  "@afenda/feature-hr",
  "@afenda/feature-inventory",
  "@afenda/feature-purchasing",
  "@afenda/feature-reports",
  "@afenda/feature-sales",
  "@afenda/governed-surface",
  "@afenda/observability",
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
  return {
    cacheComponents: true,
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
