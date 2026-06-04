/**
 * Regenerate server.ts / client.ts flat export doors after layout migration.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { listPackageScanTargets } from "./lib/packages-layout.mts";
import { featurePublicDoorFiles } from "../packages/_scaffold/scripts/lib/scaffold-grammar.mts";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const packagesRoot = path.join(root, "packages");

const SERVER_ONLY_HINT = `import "server-only";\n\n`;
const CLIENT_HINT = `"use client";\n\n`;
const SKIP_DIRS = new Set(["tests", "node_modules", ".turbo"]);

function isExportableFile(fileName: string, door: "server.ts" | "client.ts") {
  if (featurePublicDoorFiles.includes(fileName as never)) return false;
  if (fileName === "client.tsx" || fileName === "index.tsx") return false;
  if (fileName === "metadata.ts" || fileName === "index.ts" || fileName === "contracts.ts") {
    return false;
  }
  if (fileName.endsWith(".shared.ts") || fileName.endsWith(".shared.server.ts")) {
    return false;
  }

  if (!/\.(ts|tsx)$/.test(fileName)) return false;

  const isClient = door === "client.ts";
  const isClientFile =
    fileName.includes(".client.") || fileName.endsWith(".component.client.tsx");
  const isServerFile =
    fileName.includes(".server.") ||
    fileName.endsWith(".handler.server.ts") ||
    fileName.endsWith(".repository.server.ts") ||
    fileName.endsWith(".command.server.ts") ||
    fileName.endsWith(".policy.server.ts") ||
    fileName.endsWith(".agent.server.ts") ||
    fileName.endsWith(".tool.server.ts") ||
    fileName.endsWith(".workflow.server.ts") ||
    fileName.endsWith(".page-model.server.ts") ||
    fileName.endsWith(".read-model.server.ts") ||
    fileName.endsWith(".query.server.ts") ||
    fileName.endsWith(".domain.server.ts") ||
    fileName.endsWith(".catalog.server.ts") ||
    fileName.endsWith(".prompt.server.ts") ||
    fileName.endsWith(".actions.server.ts") ||
    fileName.endsWith(".event.ts") ||
    fileName.endsWith(".surface.ts");

  if (fileName.endsWith(".shared.ts") || fileName.endsWith(".schema.ts") || fileName.endsWith(".contract.ts")) {
    return false;
  }

  if (isClient && !isClientFile && isServerFile) return false;
  if (!isClient && isClientFile && !isServerFile) return false;
  return true;
}

function filterDoorExports(modules: string[]): string[] {
  const normalized = modules.map((m) => m.replace(/^\.\//, ""));
  const set = new Set(normalized);

  return modules.filter((mod) => {
    const base = mod.replace(/^\.\//, "");
    const fileName = base.split("/").pop() ?? base;

    if (fileName.endsWith(".schema") || fileName.endsWith("-schema")) {
      const contractFile = fileName.endsWith(".schema")
        ? fileName.replace(/\.schema$/, ".contract")
        : fileName.replace(/-schema$/, "-contract");
      const contractPath = base.replace(fileName, contractFile);
      if (set.has(contractPath)) return false;
    }

    if (fileName.endsWith("-types")) {
      const rootFile = fileName.replace(/-types$/, "");
      const rootPath = base.replace(fileName, rootFile);
      if (set.has(rootPath)) return false;
    }

    if (fileName.includes(".schemas")) return false;

    return true;
  });
}

function listFlatExports(srcRoot: string, door: "server.ts" | "client.ts") {
  const files: string[] = [];
  for (const entry of fs.readdirSync(srcRoot, { withFileTypes: true })) {
    if (!entry.isFile()) continue;
    if (!isExportableFile(entry.name, door)) continue;
    files.push(entry.name.replace(/\.tsx?$/, ""));
  }
  return files.sort();
}

function collectNestedExports(dir: string, door: "server.ts" | "client.ts", base = dir) {
  const modules: string[] = [];

  function walk(current: string) {
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) {
        if (SKIP_DIRS.has(entry.name)) continue;
        walk(full);
        continue;
      }
      if (!entry.isFile()) continue;
      if (!isExportableFile(entry.name, door)) continue;
      const rel = path
        .relative(base, full)
        .replace(/\.tsx?$/, "")
        .split(path.sep)
        .join("/");
      modules.push(`./${rel}`);
    }
  }

  walk(dir);
  return modules.sort();
}

function writeDoor(srcRoot: string, door: "server.ts" | "client.ts", modules?: string[]) {
  const doorPath = path.join(srcRoot, door);
  if (!fs.existsSync(doorPath)) return;

  const exports = filterDoorExports(modules ?? listFlatExports(srcRoot, door).map((e) => `./${e}`));
  const header =
    door === "server.ts"
      ? `/**\n * Server-only public door.\n */\n${SERVER_ONLY_HINT}`
      : `/**\n * Client public door.\n */\n${CLIENT_HINT}`;

  const body = exports.map((e) => `export * from "${e}";`).join("\n");
  fs.writeFileSync(doorPath, `${header}${body}\n`);
  console.log(`[doors] ${path.relative(root, doorPath)} (${exports.length} exports)`);
}

for (const target of listPackageScanTargets(packagesRoot)) {
  if (
    target.packageDirName === "auth" ||
    target.packageDirName === "observability" ||
    target.packageDirName === "db" ||
    target.packageDirName === "governed-surface" ||
    target.packageDirName === "kernel"
  ) {
    continue;
  }
  const srcRoot = target.srcRoot;

  if (target.packageDirName === "system-admin") {
    const featuresRoot = path.join(srcRoot, "features");
    if (fs.existsSync(featuresRoot)) {
      const modules: string[] = [];
      for (const slice of fs.readdirSync(featuresRoot, { withFileTypes: true })) {
        if (!slice.isDirectory()) continue;
        modules.push(
          ...collectNestedExports(
            path.join(featuresRoot, slice.name),
            "server.ts",
            srcRoot,
          ),
        );
      }
      writeDoor(srcRoot, "server.ts", modules);
      const clientModules: string[] = [];
      for (const slice of fs.readdirSync(featuresRoot, { withFileTypes: true })) {
        if (!slice.isDirectory()) continue;
        clientModules.push(
          ...collectNestedExports(
            path.join(featuresRoot, slice.name),
            "client.ts",
            srcRoot,
          ),
        );
      }
      writeDoor(srcRoot, "client.ts", clientModules);
    }
  } else if (target.packageDirName === "hr-suite" || target.packageDirName === "object-storage") {
    const modules: string[] = [];
    const clientModules: string[] = [];
    for (const entry of fs.readdirSync(srcRoot, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;
      const featureDir = path.join(srcRoot, entry.name);
      if (entry.name.startsWith("_") || entry.name === "hr-suite-integration") {
        modules.push(...collectNestedExports(featureDir, "server.ts", srcRoot));
        clientModules.push(...collectNestedExports(featureDir, "client.ts", srcRoot));
        continue;
      }
      for (const sub of fs.readdirSync(featureDir, { withFileTypes: true })) {
        if (!sub.isDirectory()) continue;
        modules.push(...collectNestedExports(path.join(featureDir, sub.name), "server.ts", srcRoot));
        clientModules.push(
          ...collectNestedExports(path.join(featureDir, sub.name), "client.ts", srcRoot),
        );
      }
    }
    writeDoor(srcRoot, "server.ts", filterDoorExports([...new Set(modules)]));
    writeDoor(srcRoot, "client.ts", filterDoorExports([...new Set(clientModules)]));
  } else {
    if (fs.existsSync(path.join(srcRoot, "server.ts"))) {
      writeDoor(srcRoot, "server.ts");
    }
    if (fs.existsSync(path.join(srcRoot, "client.ts"))) {
      writeDoor(srcRoot, "client.ts");
    }
  }

  const featuresRoot = path.join(srcRoot, "features");
  if (fs.existsSync(featuresRoot) && target.packageDirName !== "system-admin") {
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
