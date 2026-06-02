#!/usr/bin/env node
/**
 * beforeShellExecution: block shell bypass of object-storage layout law.
 * Agents used Move-Item / New-Item to create bucket names as files or package-root r2/.
 */
import { readFileSync } from "node:fs";

const FORBIDDEN_SRC_TOP = new Set([
  "providers",
  "handlers",
  "auth",
  "env",
  "errors",
  "client",
  "object-storage-integration",
]);

const TEMPLATE_BUCKETS = new Set([
  "actions",
  "commands",
  "api",
  "contracts",
  "components",
  "data",
  "domain",
  "events",
  "policies",
  "read-models",
  "schemas",
  "tests",
]);

/**
 * @param {{ permission: string; user_message: string; agent_message: string }} payload
 */
function deny(payload) {
  process.stdout.write(JSON.stringify(payload));
  process.exit(2);
}

/**
 * @param {string} command
 */
function checkObjectStorageShell(command) {
  const normalized = command.replace(/\\/g, "/");

  if (!/packages\/object-storage/i.test(normalized)) {
    return;
  }

  // Package-root r2/ (not src/r2/)
  if (
    /packages\/object-storage\/r2(?:\/|$)/i.test(normalized) &&
    !/packages\/object-storage\/src\/r2\//i.test(normalized)
  ) {
    deny({
      permission: "deny",
      user_message:
        "Blocked: shell touched forbidden packages/object-storage/r2/. Use packages/object-storage/src/r2/ (e.g. policies/cors.json).",
      agent_message:
        "Do not create or move files under packages/object-storage/r2/. R2 infra belongs in src/r2/policies/. Use Write tool paths under src/r2/ only.",
    });
  }

  for (const forbidden of FORBIDDEN_SRC_TOP) {
    const pattern = new RegExp(
      `packages/object-storage/src/${forbidden}(?:/|$)`,
      "i",
    );
    if (pattern.test(normalized)) {
      deny({
        permission: "deny",
        user_message: `Blocked: shell touched forbidden src/${forbidden}/ in object-storage.`,
        agent_message: `Legacy bucket src/${forbidden}/ is forbidden. Use ARCH-1002 §8 template buckets under blob/, r2/, or _object-storage-integration/.`,
      });
    }
  }

  // Block shell writes that target a bucket name as a file (no extension after slice/bucket)
  const sliceFilePattern =
    /packages\/object-storage\/src\/(blob|r2|_object-storage-integration)\/([a-z-]+)(?:['"\s]|$)/gi;
  let match;
  while ((match = sliceFilePattern.exec(normalized)) !== null) {
    const bucket = match[2] ?? "";
    if (TEMPLATE_BUCKETS.has(bucket)) {
      const after = normalized.slice(match.index + match[0].length);
      if (!after.startsWith("/") && !after.startsWith("\\")) {
        deny({
          permission: "deny",
          user_message: `Blocked: shell would create "${bucket}" as a file — it must be a directory bucket (e.g. ${bucket}/module.ts).`,
          agent_message: `ARCH-1002 §8: ${bucket}/ is a folder bucket, not a filename. Use Write to packages/object-storage/src/<slice>/${bucket}/<file>.ts`,
        });
      }
    }
  }
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

  const command =
    typeof input.command === "string"
      ? input.command
      : typeof input.tool_input === "object" &&
          input.tool_input !== null &&
          typeof /** @type {Record<string, unknown>} */ (input.tool_input)
            .command === "string"
        ? /** @type {Record<string, unknown>} */ (input.tool_input).command
        : "";

  if (command) {
    checkObjectStorageShell(command);
  }

  process.stdout.write('{"permission":"allow"}');
}

main();
