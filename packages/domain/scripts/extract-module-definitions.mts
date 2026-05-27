import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const packageDir = dirname(fileURLToPath(import.meta.url));
const indexPath = resolve(packageDir, "../src/index.ts");
const lines = readFileSync(indexPath, "utf8").split(/\r?\n/);

const header = `import type { ModuleId } from "@afenda/config/module-ids";
import type { ErpModuleDefinition } from "./module-types";

const modules = 
`;

const footer = `

export const erpModules = modules;

export const moduleById = new Map<ModuleId, ErpModuleDefinition>(
  erpModules.map((module) => [module.id, module]),
);

export const moduleByHref = new Map<string, ErpModuleDefinition>(
  erpModules.map((module) => [module.href, module]),
);
`;

const body = lines.slice(150, 792).join("\n");
const outputPath = resolve(packageDir, "../src/module-definitions.ts");

writeFileSync(outputPath, header + body + footer);
