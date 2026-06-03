import { config } from "dotenv";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

import { verifyAiGatewayModels } from "../src/ai-gateway.repository.server";

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");

for (const file of [".env.config", ".env.local", "apps/erp/.env.local"]) {
  config({ path: resolve(rootDir, file), override: false });
}
config({ path: resolve(rootDir, ".secret.config"), override: true });

const result = await verifyAiGatewayModels();

console.log(JSON.stringify(result, null, 2));

if (!result.available) {
  process.exitCode = 1;
}
