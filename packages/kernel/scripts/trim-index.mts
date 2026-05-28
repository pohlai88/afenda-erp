import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const packageDir = dirname(fileURLToPath(import.meta.url));
const indexPath = resolve(packageDir, "../src/index.ts");
const lines = readFileSync(indexPath, "utf8").split(/\r?\n/);

const before = lines.slice(0, 129);
const after = lines.slice(801);
const output = [...before, ...after].join("\n");

writeFileSync(indexPath, output);
