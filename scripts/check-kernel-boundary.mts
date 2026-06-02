/**
 * Enforces ARCH-1002 §6: @afenda/kernel stays execution-law + frozen compat.
 * Run via `pnpm kernel:check` (included in `pnpm architecture:check` and CI).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const kernelSrc = path.join(root, "packages/kernel/src");
const problems: string[] = [];

const featureImportPattern =
  /from\s+["'](@afenda\/feature-[^"']+)["']|import\s+["'](@afenda\/feature-[^"']+)["']/g;
const appImportPattern =
  /from\s+["'](@afenda\/erp[^"']*)["']|import\s+["'](@afenda\/erp[^"']*)["']|from\s+["'](apps\/erp[^"']*)["']|import\s+["'](apps\/erp[^"']*)["']/g;

function listTypeScriptFiles(dir: string): string[] {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...listTypeScriptFiles(fullPath));
      continue;
    }
    if (entry.isFile() && /\.tsx?$/.test(entry.name)) {
      files.push(fullPath);
    }
  }

  return files;
}

function rel(filePath: string) {
  return path.relative(root, filePath).replaceAll("\\", "/");
}

function checkKernelImports() {
  if (!fs.existsSync(kernelSrc)) {
    problems.push("packages/kernel/src is missing.");
    return;
  }

  const executionKernelDir = path.join(kernelSrc, "execution-kernel");
  if (!fs.existsSync(executionKernelDir)) {
    problems.push(
      "packages/kernel/src/execution-kernel/ is missing (ARCH-1002 §6.1).",
    );
  }

  for (const filePath of listTypeScriptFiles(kernelSrc)) {
    const content = fs.readFileSync(filePath, "utf8");
    featureImportPattern.lastIndex = 0;
    appImportPattern.lastIndex = 0;

    for (const match of content.matchAll(featureImportPattern)) {
      const specifier = match[1] ?? match[2];
      problems.push(
        `${rel(filePath)} must not import ${specifier}; feature logic belongs in @afenda/feature-* (ARCH-1002 §6).`,
      );
    }

    for (const match of content.matchAll(appImportPattern)) {
      const specifier = match[1] ?? match[2] ?? match[3] ?? match[4];
      problems.push(
        `${rel(filePath)} must not import ${specifier}; apps/erp composes kernel — not the reverse (ARCH-1002 §6).`,
      );
    }
  }
}

function checkExecutionKernelSurface() {
  const serverPath = path.join(root, "packages/kernel/src/server.ts");
  const executionPath = path.join(root, "packages/kernel/src/execution.ts");

  if (!fs.readFileSync(serverPath, "utf8").includes("execution-kernel")) {
    problems.push(
      "packages/kernel/src/server.ts must re-export execution-kernel (server boundary).",
    );
  }

  for (const filePath of [serverPath, executionPath]) {
    if (!fs.readFileSync(filePath, "utf8").includes("server-only")) {
      problems.push(
        `${rel(filePath)} must import "server-only" (ARCH-1002 §6.1 server boundary).`,
      );
    }
  }
}

checkKernelImports();
checkExecutionKernelSurface();

if (problems.length > 0) {
  console.error("Kernel boundary check failed:\n");
  for (const problem of problems) {
    console.error(`  - ${problem}`);
  }
  process.exit(1);
}

console.log(
  "Kernel boundary check passed (@afenda/kernel has no @afenda/feature-* imports).",
);
