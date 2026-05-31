/**
 * Non-interactive drizzle-kit generate for CI/agent shells.
 * Auto-selects "create new" on enum rename prompts (uses Prompt.base / first item).
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const packageDir = path.dirname(fileURLToPath(import.meta.url));
const dbRoot = path.resolve(packageDir, "..");

const kitBin = path.join(dbRoot, "node_modules/drizzle-kit/bin.cjs");

const ttyGuard = `      if (!process.stdin.isTTY || !process.stdout.isTTY) {
        return Promise.reject(new Error("Interactive prompts require a TTY terminal (process.stdin.isTTY or process.stdout.isTTY is false). This can happen when running in CI, piped input, or non-interactive shells."));
      }`;

const ttyBypass = `      if (!process.stdin.isTTY || !process.stdout.isTTY) {
        if (view5 && typeof view5 === "object") {
          if (view5.base !== undefined) {
            return Promise.resolve({ status: "done", data: view5.base });
          }
          if (view5.state && Array.isArray(view5.state.items) && view5.state.items.length > 0) {
            return Promise.resolve({ status: "done", data: view5.state.items[0] });
          }
        }
        return Promise.reject(new Error("Interactive prompts require a TTY terminal (process.stdin.isTTY or process.stdout.isTTY is false). This can happen when running in CI, piped input, or non-interactive shells."));
      }`;

const source = fs.readFileSync(kitBin, "utf8");
if (!source.includes(ttyGuard)) {
  console.error("drizzle-kit TTY guard not found; update db-generate-noninteractive.mjs");
  process.exit(1);
}

const kitDir = path.dirname(kitBin);
const patchedBin = path.join(kitDir, "bin.noninteractive.cjs");
fs.writeFileSync(patchedBin, source.replace(ttyGuard, ttyBypass));

const args = process.argv.slice(2);
const kitArgs = ["generate", "--config=drizzle.config.ts", ...args];

const result = spawnSync(process.execPath, [patchedBin, ...kitArgs], {
  cwd: kitDir,
  stdio: "inherit",
  env: process.env,
});

try {
  fs.unlinkSync(patchedBin);
} catch {
  // ignore cleanup errors
}

process.exit(result.status ?? 1);
