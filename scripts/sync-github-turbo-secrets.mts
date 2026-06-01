import { spawnSync } from "node:child_process";

import { loadTurboRemoteEnv } from "./turbo-remote.shared.mts";

const { token, team } = loadTurboRemoteEnv();

for (const [name, value] of [
  ["TURBO_TOKEN", token],
  ["TURBO_TEAM", team],
] as const) {
  const result = spawnSync("gh", ["secret", "set", name, "--body", value], {
    stdio: "inherit",
    shell: true,
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}
