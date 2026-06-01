import {
  isTurboRemoteCacheEnabled,
  loadTurboRemoteEnv,
  runPnpmTurbo,
  writeTurboRemoteVerifyResult,
} from "./turbo-remote.shared.mts";

const { team } = loadTurboRemoteEnv();

const dryRun = runPnpmTurbo([
  "run",
  "build",
  "--dry-run",
  "--filter=@afenda/config",
]);

const output = `${dryRun.stdout ?? ""}${dryRun.stderr ?? ""}`;

if (dryRun.status !== 0) {
  process.stderr.write(output);
  process.exit(dryRun.status ?? 1);
}

const remoteEnabled = isTurboRemoteCacheEnabled(output);
writeTurboRemoteVerifyResult(team, remoteEnabled);

if (!remoteEnabled) {
  process.exitCode = 1;
}
