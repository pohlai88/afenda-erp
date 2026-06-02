/**
 * CI / drift guard: target-architecture compliance (ARCH-1004 §7, ARCH-1002 §13).
 * Fails on flat /api/* trees and lazy-doc phrases in canonical architecture books.
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const apiRoot = path.join(root, "apps", "erp", "src", "app", "api");

const FLAT_FORBIDDEN = new Set(["lynx", "ai", "cron", "uploads"]);
const ALLOWED_TOP = new Set(["auth", "internal", "public"]);

const LAZY_DOC_PHRASES = [
  /\bas-built\s+vs\s+target\b/i,
  /\bmigrate\s+when\s+touched\b/i,
  /\bas-built\s+ok\b/i,
  /\btolerated\s+until\s+migrat/i,
  /\buntil\s+`packages\/api`\s+exists\b/i,
  /\blegacy\s+mode\b/i,
  /\boptional\s+migration\s+later\b/i,
  /\bgood\s+enough\s+for\s+now\b/i,
  /\*\*As-built:\*\*/i,
];

const failures: string[] = [];

function scanFlatApi() {
  if (!statSync(apiRoot, { throwIfNoEntry: false })) return;

  for (const name of readdirSync(apiRoot)) {
    if (ALLOWED_TOP.has(name)) continue;
    if (!FLAT_FORBIDDEN.has(name)) continue;
    const full = path.join(apiRoot, name);
    if (statSync(full).isDirectory()) {
      failures.push(
        `Non-compliant flat API tree: apps/erp/src/app/api/${name}/ — required: apps/erp/src/app/api/internal/v1/${name}/ (ARCH-1004 §7).`,
      );
    }
  }
}

function scanArchitectureDocs() {
  const archDir = path.join(root, "docs", "architecture");
  for (const file of readdirSync(archDir)) {
    if (!file.endsWith(".md")) continue;
    const full = path.join(archDir, file);
    const text = readFileSync(full, "utf8");
    for (const pattern of LAZY_DOC_PHRASES) {
      if (pattern.test(text)) {
        failures.push(
          `Lazy-doc phrase in ${path.relative(root, full)} (${pattern}) — use §7 Non-compliance; target-only doctrine.`,
        );
      }
    }
  }
}

scanFlatApi();
scanArchitectureDocs();

if (failures.length === 0) {
  console.log("[architecture-compliance] OK");
  process.exit(0);
}

console.error("[architecture-compliance] FAILED:\n");
for (const line of failures) {
  console.error(`  - ${line}`);
}
process.exit(1);
