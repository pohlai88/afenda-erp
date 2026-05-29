/**
 * Runs architecture guards for a touched file path (no human trigger).
 * Used by `.cursor/hooks/enforce-architecture-drift.mjs` after agent edits.
 */
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

const args = new Map<string, string>();
for (let i = 2; i < process.argv.length; i += 1) {
  const key = process.argv[i];
  const value = process.argv[i + 1];
  if (key?.startsWith("--") && value) {
    args.set(key, value);
  }
}

const rawPath = args.get("--path");
if (!rawPath) {
  process.exit(0);
}

const rel = path
  .isAbsolute(rawPath)
  ? path.relative(root, rawPath)
  : rawPath.replace(/\\/g, "/");

type DriftRule = {
  id: string;
  test: (p: string) => boolean;
  commands: string[][];
};

const RULES: DriftRule[] = [
  {
    id: "kernel-boundary",
    test: (p) => p.startsWith("packages/kernel/"),
    commands: [["pnpm", "kernel:check"], ["pnpm", "--filter", "@afenda/kernel", "test"]],
  },
  {
    id: "architecture-guard",
    test: (p) =>
      p.startsWith("packages/features/") ||
      p.startsWith("apps/erp/") ||
      p === "packages/config/src/next.ts" ||
      p === "scripts/check-directory-architecture.mts" ||
      p === "scripts/check-kernel-boundary.mts" ||
      p.startsWith("docs/architecture/"),
    commands: [["pnpm", "architecture:check"]],
  },
  {
    id: "schema-journal",
    test: (p) =>
      p.startsWith("packages/db/src/schema/") ||
      p.startsWith("packages/db/drizzle/"),
    commands: [["pnpm", "exec", "tsx", "packages/db/scripts/check-drizzle-journal.mts"]],
  },
];

function runCommand(command: string[]) {
  const result = spawnSync(command[0], command.slice(1), {
    cwd: root,
    encoding: "utf8",
    shell: process.platform === "win32",
    env: process.env,
  });

  const output = [result.stdout, result.stderr].filter(Boolean).join("\n").trim();

  return {
    ok: result.status === 0,
    output: output || `(exit ${result.status ?? "unknown"})`,
  };
}

const matched = RULES.filter((rule) => rule.test(rel));
if (matched.length === 0) {
  process.exit(0);
}

const failures: string[] = [];

for (const rule of matched) {
  for (const command of rule.commands) {
    const label = command.join(" ");
    const result = runCommand(command);
    if (!result.ok) {
      failures.push(
        `[${rule.id}] ${label} failed after editing \`${rel}\`:\n${result.output}`,
      );
    }
  }
}

if (failures.length === 0) {
  process.exit(0);
}

console.error("Architecture drift detected:\n");
console.error(failures.join("\n\n"));
process.exit(1);
