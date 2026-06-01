import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

type PackageKind = "library" | "feature" | "feature-tested" | "custom";

const packageKinds: Record<string, PackageKind> = {
  auth: "library",
  kernel: "library",
  db: "library",
  ui: "library",
  ai: "library",
  billing: "library",
  observability: "library",
  workflows: "library",
  "governed-surface": "custom",
  config: "custom",
  "features/lynx": "feature-tested",
  "features/system-admin": "feature-tested",
  "features/knowledge": "feature-tested",
  "features/hr-suite": "feature",
  "features/crm": "feature",
  "features/finance": "feature",
  "features/inventory": "feature",
  "features/sales": "feature",
  "features/purchasing": "feature",
  "features/reports": "feature",
  "features/dashboard": "feature",
  "features/approvals": "feature",
};

const reactBuildPackages = new Set([
  "ui",
  "governed-surface",
  "features/lynx",
  "features/system-admin",
  "features/hr-suite",
]);

function configPrefix(packageDir: string) {
  return packageDir.startsWith("features/")
    ? "../../config"
    : "../config";
}

function writeJson(relativePath: string, value: unknown) {
  const fullPath = path.join(root, relativePath);
  fs.writeFileSync(fullPath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

for (const [packageDir, kind] of Object.entries(packageKinds)) {
  if (kind === "custom") {
    continue;
  }

  const prefix = configPrefix(packageDir);
  const typecheckExtends =
    kind === "feature"
      ? `${prefix}/tsconfig.feature.base.json`
      : `${prefix}/tsconfig.library.base.json`;

  writeJson(`packages/${packageDir}/tsconfig.json`, {
    extends: typecheckExtends,
  });
}

for (const packageDir of Object.keys(packageKinds)) {
  if (packageDir === "config") {
    writeJson("packages/config/tsconfig.build.json", {
      extends: "./tsconfig.build.library.base.json",
      include: [
        "src/env.ts",
        "src/env.build.ts",
        "src/next.ts",
        "src/module-ids.ts",
        "src/vitest.ts",
      ],
    });
    continue;
  }

  if (packageDir === "governed-surface") {
    writeJson("packages/governed-surface/tsconfig.json", {
      extends: "../config/tsconfig.library.base.json",
      compilerOptions: {
        paths: {
          "@afenda/ui": ["../ui/src/index.ts"],
          "@afenda/ui/*": ["../ui/src/*"],
        },
      },
    });
    writeJson("packages/governed-surface/tsconfig.build.json", {
      extends: "../config/tsconfig.build.react.base.json",
      compilerOptions: {
        paths: {
          "@afenda/ui": ["../ui/dist/index.d.ts"],
          "@afenda/ui/*": ["../ui/dist/*.d.ts"],
        },
      },
    });
    continue;
  }

  const prefix = configPrefix(packageDir);
  const buildExtends = reactBuildPackages.has(packageDir)
    ? `${prefix}/tsconfig.build.react.base.json`
    : `${prefix}/tsconfig.build.library.base.json`;

  writeJson(`packages/${packageDir}/tsconfig.build.json`, {
    extends: buildExtends,
  });
}

console.log("[normalize-package-tsconfigs] updated package tsconfig files");
