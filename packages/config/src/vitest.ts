import path from "node:path";
import { fileURLToPath } from "node:url";
import type { UserConfig } from "vitest/config";

type VitestCoverageConfig = NonNullable<
  NonNullable<UserConfig["test"]>["coverage"]
>;

type VitestTestConfig = NonNullable<UserConfig["test"]>;

const repoRoot = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../..",
);

/** Neon / SQL integration files — run under the integration Vitest project. */
export const INTEGRATION_TEST_GLOB = [
  "**/*.integration.test.ts",
  "**/*-integration.test.ts",
] as const;

export const integrationTestOptions = {
  testTimeout: 120_000,
  hookTimeout: 120_000,
  fileParallelism: false,
} satisfies Pick<
  VitestTestConfig,
  "testTimeout" | "hookTimeout" | "fileParallelism"
>;

const defaultTestOptions = {
  environment: "node",
  include: ["tests/**/*.test.ts"],
  testTimeout: 15_000,
  hookTimeout: 15_000,
  pool: process.platform === "win32" ? "forks" : "threads",
  exclude: [
    "**/node_modules/**",
    "**/dist/**",
    "**/.next/**",
    "**/.artifacts/**",
  ],
} satisfies VitestTestConfig;

export function getRepoRoot() {
  return repoRoot;
}

export function vitestCoverageReportsDirectory(packageName: string) {
  return path.join(repoRoot, ".artifacts/coverage", packageName);
}

export function createVitestConfig(
  packageName: string,
  overrides: UserConfig = {},
): UserConfig {
  const { test: overrideTest, ...rootOverrides } = overrides;
  const { coverage: overrideCoverage, ...testOverrides } = overrideTest ?? {};

  return {
    ...rootOverrides,
    test: {
      ...defaultTestOptions,
      ...testOverrides,
      coverage: {
        provider: "v8",
        reportsDirectory: vitestCoverageReportsDirectory(packageName),
        reporter: ["text", "json", "html"],
        ...overrideCoverage,
      } as VitestCoverageConfig,
    },
  };
}
