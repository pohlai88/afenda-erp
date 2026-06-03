/**
 * Regenerate server.ts / client.ts flat export doors after layout migration.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  listPackageScanTargets,
  isPublicDoor,
} from "./lib/packages-layout.mts";
import { featurePublicDoorFiles } from "../packages/_scaffold/scripts/lib/scaffold-grammar.mts";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const packagesRoot = path.join(root, "packages");

const SERVER_ONLY_HINT = `import "server-only";\n\n`;
const CLIENT_HINT = `"use client";\n\n`;

function listFlatExports(srcRoot: string, door: "server.ts" | "client.ts") {
  const isClient = door === "client.ts";
  const files: string[] = [];

  for (const entry of fs.readdirSync(srcRoot, { withFileTypes: true })) {
    if (!entry.isFile()) continue;
    if (featurePublicDoorFiles.includes(entry.name as never)) continue;
    if (entry.name === "client.tsx" || entry.name === "index.tsx") continue;
    if (entry.name === "metadata.ts" || entry.name === "index.ts") continue;
    if (entry.name === "contracts.ts") continue;
    if (!/\.(ts|tsx)$/.test(entry.name)) continue;

    const isClientFile =
      entry.name.includes(".client.") || entry.name.endsWith(".component.client.tsx");
    const isServerFile =
      entry.name.includes(".server.") ||
      entry.name.endsWith(".handler.server.ts") ||
      entry.name.endsWith(".repository.server.ts") ||
      entry.name.endsWith(".command.server.ts") ||
      entry.name.endsWith(".policy.server.ts") ||
      entry.name.endsWith(".agent.server.ts") ||
      entry.name.endsWith(".tool.server.ts") ||
      entry.name.endsWith(".workflow.server.ts") ||
      entry.name.endsWith(".page-model.server.ts") ||
      entry.name.endsWith(".read-model.server.ts") ||
      entry.name.endsWith(".query.server.ts") ||
      entry.name.endsWith(".domain.server.ts") ||
      entry.name.endsWith(".catalog.server.ts") ||
      entry.name.endsWith(".prompt.server.ts") ||
      entry.name.endsWith(".actions.server.ts");

    if (isClient && !isClientFile && isServerFile) continue;
    if (!isClient && isClientFile && !isServerFile) continue;

    files.push(entry.name.replace(/\.tsx?$/, ""));
  }

  return files.sort();
}

function writeDoor(srcRoot: string, door: "server.ts" | "client.ts") {
  const doorPath = path.join(srcRoot, door);
  if (!fs.existsSync(doorPath)) return;

  const exports = listFlatExports(srcRoot, door);
  const header =
    door === "server.ts"
      ? `/**\n * Server-only public door.\n */\n${SERVER_ONLY_HINT}`
      : `/**\n * Client public door.\n */\n${CLIENT_HINT}`;

  const body = exports.map((e) => `export * from "./${e}";`).join("\n");
  fs.writeFileSync(doorPath, `${header}${body}\n`);
  console.log(`[doors] ${path.relative(root, doorPath)} (${exports.length} exports)`);
}

for (const target of listPackageScanTargets(packagesRoot)) {
  const srcRoot = target.srcRoot;
  if (fs.existsSync(path.join(srcRoot, "server.ts"))) {
    writeDoor(srcRoot, "server.ts");
  }
  if (fs.existsSync(path.join(srcRoot, "client.ts"))) {
    writeDoor(srcRoot, "client.ts");
  }

  const featuresRoot = path.join(srcRoot, "features");
  if (fs.existsSync(featuresRoot)) {
    for (const slice of fs.readdirSync(featuresRoot, { withFileTypes: true })) {
      if (!slice.isDirectory()) continue;
      const sliceDir = path.join(featuresRoot, slice.name);
      if (fs.existsSync(path.join(sliceDir, "server.ts"))) {
        writeDoor(sliceDir, "server.ts");
      }
      if (fs.existsSync(path.join(sliceDir, "client.ts"))) {
        writeDoor(sliceDir, "client.ts");
      }
    }
  }

  if (target.packageDirName === "hr-suite" || target.packageDirName === "object-storage") {
    for (const entry of fs.readdirSync(srcRoot, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;
      const featureDir = path.join(srcRoot, entry.name);
      for (const sub of fs.readdirSync(featureDir, { withFileTypes: true })) {
        if (!sub.isDirectory()) continue;
        const subDir = path.join(featureDir, sub.name);
        if (fs.existsSync(path.join(subDir, "server.ts"))) {
          writeDoor(subDir, "server.ts");
        }
        if (fs.existsSync(path.join(subDir, "client.ts"))) {
          writeDoor(subDir, "client.ts");
        }
      }
    }
  }
}

console.log("[doors] complete");
