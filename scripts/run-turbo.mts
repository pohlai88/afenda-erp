import { spawnSync } from "node:child_process";

import { getRootDir, loadRootEnv } from "./load-root-env.mts";

loadRootEnv();

const turboArgs = process.argv.slice(2);
if (turboArgs.length === 0) {
  process.stderr.write(
    "Usage: tsx scripts/run-turbo.mts <turbo args…>  (e.g. build --filter=@afenda/erp)\n",
  );
  process.exit(1);
}

const result = spawnSync("pnpm", ["exec", "turbo", ...turboArgs], {
  cwd: getRootDir(),
  stdio: "inherit",
  env: process.env,
  shell: true,
});

process.exit(result.status ?? 1);
