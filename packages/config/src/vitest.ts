import path from "node:path";
import { fileURLToPath } from "node:url";
import type { UserConfig } from "vitest/config";

type VitestCoverageConfig = NonNullable<
  NonNullable<UserConfig["test"]>["coverage"]
>;

const repoRoot = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../..",
);

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
      environment: "node",
      include: ["tests/**/*.test.ts"],
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
