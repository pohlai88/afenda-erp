#!/usr/bin/env node
/**
 * sessionStart / subagentStart: inject compact architecture + rules routing once.
 * Output: { "additional_context": "..." } (Cursor hooks schema)
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const hookDir = dirname(fileURLToPath(import.meta.url));
const routingPath = join(hookDir, "afenda-architecture-routing.md");

function main() {
  readFileSync(0, "utf8"); // consume stdin (session metadata); routing is static

  const routing = readFileSync(routingPath, "utf8").trim();
  const additional_context = [
    "<!-- afenda-architecture-hook: session -->",
    routing,
    "",
    "Do not read all ARCH docs up front — use the table above for the paths you touch.",
  ].join("\n");

  process.stdout.write(JSON.stringify({ additional_context }));
}

main();
