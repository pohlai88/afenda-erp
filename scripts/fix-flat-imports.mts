/**
 * Rewrite relative imports after migrate-packages-flat.mts.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const manifestPath = path.join(root, ".artifacts", "migrate-packages-flat.json");

type Move = { from: string; to: string; relFrom: string; relTo: string };

if (!fs.existsSync(manifestPath)) {
  console.error("Missing manifest — run migrate-packages-flat.mts first");
  process.exit(1);
}

const moves = JSON.parse(fs.readFileSync(manifestPath, "utf8")) as Move[];

function walk(dir: string, out: string[] = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === "node_modules" || entry.name === ".git" || entry.name === "dist") {
      continue;
    }
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full, out);
    } else if (/\.(ts|tsx|mts|js|jsx|mjs|cjs)$/.test(entry.name)) {
      out.push(full);
    }
  }
  return out;
}

function stripExt(p: string) {
  return p.replace(/\.(tsx?|mts|jsx?|mjs|cjs)$/, "");
}

function buildReplacementsForFile(filePath: string) {
  const fileDir = path.dirname(filePath);
  const replacements: Array<{ from: string; to: string }> = [];

  for (const move of moves) {
    const oldAbs = path.join(root, move.relFrom);
    const newAbs = path.join(root, move.relTo);
    const oldRel = stripExt(path.relative(fileDir, oldAbs)).split(path.sep).join("/");
    const newRel = stripExt(path.relative(fileDir, newAbs)).split(path.sep).join("/");

    if (oldRel === newRel) continue;
    if (oldRel.startsWith("..")) continue;

    replacements.push({ from: oldRel, to: newRel });

    const oldBase = path.basename(move.relFrom).replace(/\.(tsx?|mts)$/, "");
    const newBase = path.basename(move.relTo).replace(/\.(tsx?|mts)$/, "");
    if (oldBase !== newBase) {
      replacements.push({ from: oldBase, to: newBase });
    }
  }

  return replacements.sort((a, b) => b.from.length - a.from.length);
}

const files = walk(root);
let changed = 0;

for (const filePath of files) {
  let source = fs.readFileSync(filePath, "utf8");
  const original = source;
  const replacements = buildReplacementsForFile(filePath);

  for (const { from, to } of replacements) {
    const patterns = [
      new RegExp(`(from\\s+["'])${escapeRe(from)}(["'])`, "g"),
      new RegExp(`(import\\(\\s*["'])${escapeRe(from)}(["']\\s*\\))`, "g"),
      new RegExp(`(export\\s+\\*\\s+from\\s+["'])${escapeRe(from)}(["'])`, "g"),
    ];
    for (const re of patterns) {
      source = source.replace(re, `$1${to}$2`);
    }
  }

  if (source !== original) {
    fs.writeFileSync(filePath, source);
    changed++;
  }
}

console.log(`[fix-imports] updated ${changed} files`);

function escapeRe(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
