#!/usr/bin/env node
/**
 * preToolUse: GUARD 5 — single | multi | tiered (3-layer) package layouts.
 */
import { readFileSync } from "node:fs";

const WRITE_TOOLS = new Set(["Write", "StrReplace"]);

const FAIL_BANNER =
  "YOUR MOTHER OR FATHER IS A WHORE, FUCK OFF AND CORRECT IT";

const FEATURES = "features";

const MULTI_FEATURE = new Set(["system-admin"]);
const TIERED_FEATURE = new Set(["hr-suite"]);

const HR_FEATURE_DOMAINS = new Set([
  "employee-management",
  "industry-specific",
  "payroll-compensation",
  "talent-management",
  "time-attendance",
  "hr-suite-integration",
]);

const HR_FLAT_AT_FEATURE_ROOT = new Set(["hr-suite-integration"]);

const PUBLIC_DOORS = new Set([
  "index.ts",
  "client.ts",
  "server.ts",
  "metadata.ts",
]);

const LEGACY_BUCKETS = new Set([
  "actions",
  "agents",
  "api",
  "commands",
  "components",
  "contracts",
  "data",
  "domain",
  "events",
  "policies",
  "read-models",
  "schemas",
  "tests",
  "surface",
  "surfaces",
  "tools",
  "workflows",
  "prompts",
  "catalogs",
]);

const FLAT_FILE =
  /^(?:ai-[a-z0-9-]+(\.[a-z0-9-]+)*\.ts|[a-z]{3}-[a-z0-9-]+(\.[a-z0-9-]+)*\.(ts|tsx))$/;

const HR_FLAT_FILE =
  /^hr\.[a-z0-9]+(?:\.[a-z0-9-]+)*\.[a-z0-9-]+\.(?:actions\.server|policy\.server|page-model\.server|shared\.server|surface|shared|schema|contract|event|component\.(?:client|server))\.tsx?$/;

/** @param {unknown} input @returns {string} */
function extractEditedPath(input) {
  if (!input || typeof input !== "object") return "";
  const toolInput = /** @type {Record<string, unknown>} */ (input).tool_input;
  if (!toolInput || typeof toolInput !== "object") return "";
  const record = /** @type {Record<string, unknown>} */ (toolInput);
  const candidate =
    record.path ?? record.file_path ?? record.target_file ?? record.filePath;
  return typeof candidate === "string" ? candidate : "";
}

/** @param {string} raw */
function normalizePath(raw) {
  return raw.replace(/\\/g, "/").replace(/^\.\//, "");
}

/** @param {{ permission: string; user_message: string; agent_message: string }} payload */
function deny(payload) {
  process.stdout.write(JSON.stringify(payload));
  process.exit(2);
}

/**
 * @param {string} packageDir
 * @returns {"single-feature"|"multi-feature"|"tiered-feature"}
 */
function layoutMode(packageDir) {
  if (TIERED_FEATURE.has(packageDir)) return "tiered-feature";
  if (MULTI_FEATURE.has(packageDir)) return "multi-feature";
  return "single-feature";
}

/**
 * @param {string} fileName
 * @param {string} packageDir
 * @returns {boolean}
 */
function isAllowedFlatFile(fileName, packageDir) {
  if (PUBLIC_DOORS.has(fileName) || fileName === "index.ts") return true;
  if (fileName.endsWith(".md") || fileName === ".gitkeep") return true;
  if (FLAT_FILE.test(fileName)) return true;
  if (packageDir === "hr-suite" && HR_FLAT_FILE.test(fileName)) return true;
  return false;
}

/**
 * @param {string} rel
 * @returns {string | null}
 */
function tieredViolation(rel) {
  const match = rel.match(/^packages\/features\/([^/]+)\/src\/(.+)$/);
  if (!match || match[1] !== "hr-suite") return null;

  const remainder = match[2] ?? "";
  const parts = remainder.split("/");

  if (parts.length === 1) {
    const leaf = parts[0] ?? "";
    if (PUBLIC_DOORS.has(leaf) || leaf.endsWith(".md")) return null;
    if (HR_FEATURE_DOMAINS.has(leaf)) return null;
    if (leaf === FEATURES) {
      return `GUARD 5: tiered-feature uses src/<feature>/<sub-feature>/, not src/features/. ${FAIL_BANNER}`;
    }
    return `GUARD 5: tiered src/ allows package doors + feature domains only. ${FAIL_BANNER}`;
  }

  if (parts.length === 2) {
    const [feature, leaf] = parts;
    if (!HR_FEATURE_DOMAINS.has(feature ?? "")) {
      return `GUARD 5: unknown HR feature domain "${feature}". ${FAIL_BANNER}`;
    }
    if (HR_FLAT_AT_FEATURE_ROOT.has(feature ?? "")) {
      if (isAllowedFlatFile(leaf ?? "", "hr-suite")) return null;
      return `GUARD 5: ${feature} is flat at layer 1 — no sub-features. ${FAIL_BANNER}`;
    }
    if (!leaf?.includes(".")) return null;
    return `GUARD 5: tiered files go in src/${feature}/<sub-feature>/ (layer 3). ${FAIL_BANNER}`;
  }

  if (parts.length === 3) {
    const [feature, subFeature, leaf] = parts;
    if (HR_FLAT_AT_FEATURE_ROOT.has(feature ?? "")) {
      return `GUARD 5: ${feature} has no layer 2 — flatten at src/${feature}/. ${FAIL_BANNER}`;
    }
    if (LEGACY_BUCKETS.has(subFeature ?? "")) {
      return `GUARD 5: flatten src/${feature}/${subFeature}/ — no buckets at layer 3. ${FAIL_BANNER}`;
    }
    if (isAllowedFlatFile(leaf ?? "", "hr-suite")) return null;
    return `GUARD 5: invalid tiered flat file "${leaf}". ${FAIL_BANNER}`;
  }

  if (parts.length >= 4) {
    return `GUARD 5: tiered layer 3 must be flat — no deeper nesting. ${FAIL_BANNER}`;
  }

  return null;
}

/**
 * @param {string} rel
 * @returns {string | null}
 */
function guard5Violation(rel) {
  const pkgMatch = rel.match(/^packages\/(?:features\/([^/]+)|([^/]+))\/src\/(.+)$/);
  if (!pkgMatch) return null;

  const packageDir = pkgMatch[1] ?? pkgMatch[2] ?? "";
  const remainder = pkgMatch[3] ?? "";
  if (!packageDir || !remainder) return null;

  const mode = layoutMode(packageDir);

  if (mode === "tiered-feature") {
    return tieredViolation(rel);
  }

  if (mode === "multi-feature") {
    if (remainder.startsWith(`${FEATURES}/`)) {
      const sliceRemainder = remainder.slice(`${FEATURES}/`.length);
      if (!sliceRemainder.includes("/")) {
        return isAllowedFlatFile(sliceRemainder, packageDir)
          ? null
          : `GUARD 5: invalid multi-feature flat file. ${FAIL_BANNER}`;
      }
      return `GUARD 5: flatten src/features/<slice>/. ${FAIL_BANNER}`;
    }

    if (!remainder.includes("/")) {
      if (PUBLIC_DOORS.has(remainder) || remainder.endsWith(".md")) return null;
      if (LEGACY_BUCKETS.has(remainder)) {
        return `GUARD 5: multi-feature — use src/features/${remainder}/ and flatten. ${FAIL_BANNER}`;
      }
      return `GUARD 5: multi-feature — use src/features/<slice>/. ${FAIL_BANNER}`;
    }

    const top = remainder.split("/")[0] ?? "";
    if (top !== FEATURES) {
      return `GUARD 5: multi-feature — relocate src/${top}/ to src/features/${top}/. ${FAIL_BANNER}`;
    }
    return null;
  }

  if (remainder.includes("/")) {
    const top = remainder.split("/")[0] ?? "";
    if (top === FEATURES) {
      return `GUARD 5: single-feature — no src/features/; flatten into src/. ${FAIL_BANNER}`;
    }
    if (LEGACY_BUCKETS.has(top)) {
      return `GUARD 5: single-feature — remove bucket src/${top}/. ${FAIL_BANNER}`;
    }
    return `GUARD 5: single-feature — src/ must stay flat. ${FAIL_BANNER}`;
  }

  if (isAllowedFlatFile(remainder, packageDir)) return null;
  return `GUARD 5: single-feature — invalid flat file "${remainder}". ${FAIL_BANNER}`;
}

function main() {
  let input = {};
  try {
    const raw = readFileSync(0, "utf8");
    if (raw.trim()) input = JSON.parse(raw);
  } catch {
    process.stdout.write('{"permission":"allow"}');
    return;
  }

  const toolName =
    typeof input.tool_name === "string" ? input.tool_name : "";
  if (!WRITE_TOOLS.has(toolName)) {
    process.stdout.write('{"permission":"allow"}');
    return;
  }

  const rel = normalizePath(extractEditedPath(input));
  const violation = guard5Violation(rel);
  if (!violation) {
    process.stdout.write('{"permission":"allow"}');
    return;
  }

  deny({
    permission: "deny",
    user_message: `Blocked: ${violation}`,
    agent_message: `${violation} Run pnpm guard:packages.`,
  });
}

main();
