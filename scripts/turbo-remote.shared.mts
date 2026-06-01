import { spawnSync, type SpawnSyncReturns } from "node:child_process";

import { getRootDir, loadRootEnv } from "./load-root-env.mts";

export type TurboRemoteVerifyResult = {
  turboTeam: string;
  turboTokenConfigured: true;
  remoteCacheDetected: boolean;
  hint: string;
};

export function runPnpmTurbo(args: readonly string[]): SpawnSyncReturns<string> {
  return spawnSync("pnpm", ["exec", "turbo", ...args], {
    cwd: getRootDir(),
    encoding: "utf8",
    env: process.env,
    shell: true,
  });
}

export function loadTurboRemoteEnv(): { token: string; team: string } {
  loadRootEnv();

  const token = process.env.TURBO_TOKEN?.trim();
  const team = process.env.TURBO_TEAM?.trim();
  const problems: string[] = [];

  if (!token) {
    problems.push(
      "TURBO_TOKEN is missing. Add it to `.secret.config`, run `pnpm env:sync`, then retry.",
    );
  }

  if (!team) {
    problems.push(
      "TURBO_TEAM is missing. Add your Vercel team slug or team id to `.secret.config`, run `pnpm env:sync`, then retry.",
    );
  }

  if (problems.length > 0) {
    process.stderr.write(`${problems.join("\n")}\n`);
    process.stderr.write(
      "Docs: https://vercel.com/docs/monorepos/remote-caching#for-local-development\n",
    );
    process.exit(1);
  }

  return { token: token!, team: team! };
}

export function isTurboRemoteCacheEnabled(output: string): boolean {
  return (
    /Remote caching enabled/i.test(output) ||
    /Remote Cache/i.test(output) ||
    /Cached \(Remote\)/i.test(output) ||
    /Success!  Turborepo CLI authorized/i.test(output)
  );
}

export function writeTurboRemoteVerifyResult(
  team: string,
  remoteCacheDetected: boolean,
): TurboRemoteVerifyResult {
  const result: TurboRemoteVerifyResult = {
    turboTeam: team,
    turboTokenConfigured: true,
    remoteCacheDetected,
    hint: remoteCacheDetected
      ? "Turborepo remote cache is wired for this machine/CI runner."
      : "Credentials are set but remote cache was not detected. Run `pnpm turbo:link` once locally.",
  };

  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  return result;
}
