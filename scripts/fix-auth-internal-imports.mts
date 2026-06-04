/**
 * Repair auth package internal imports after flat migration.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const authSrc = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "packages/auth/src",
);

const replacements: Array<[RegExp, string]> = [
  [/\.\.\/security\/webhook-verify\.server/g, "./aut-webhook-verify-server"],
  [/\.\.\/runtime\/neon-session\.server/g, "./aut-neon-session-server"],
  [/\.\.\/runtime\/neon-auth\.server/g, "./aut-neon-auth-server"],
  [/\.\.\/runtime\/neon-auth\.client/g, "./aut-neon-auth-client"],
  [/\.\/neon-auth\.server/g, "./aut-neon-auth-server"],
  [/\.\/neon-auth-ui-account-page\.client/g, "./aut-neon-auth-ui-account-page-client"],
  [/\.\/neon-auth-ui-auth-page\.client/g, "./aut-neon-auth-ui-auth-page-client"],
  [/\.\/neon-auth-ui-page-gate\.server/g, "./aut-neon-auth-ui-page-gate-server"],
  [/\.\/neon-auth-ui-not-ready-panel\.server/g, "./aut-neon-auth-ui-not-ready-panel-server"],
  [/\.\/neon-auth-ui-provider\.client/g, "./aut-neon-auth-ui-provider-client"],
  [/\.\/neon-auth-ui\.routes\.shared/g, "./aut-neon-auth-ui-routes-shared"],
  [/\.\/neon-auth-ui\.config\.shared/g, "./aut-neon-auth-ui-config-shared"],
];

let changed = 0;
for (const file of fs.readdirSync(authSrc)) {
  if (!/\.(ts|tsx)$/.test(file)) continue;
  const filePath = path.join(authSrc, file);
  let source = fs.readFileSync(filePath, "utf8");
  const original = source;
  for (const [pattern, replacement] of replacements) {
    source = source.replace(pattern, replacement);
  }
  if (source !== original) {
    fs.writeFileSync(filePath, source);
    changed++;
  }
}

console.log(`[fix-auth-imports] updated ${changed} files`);
