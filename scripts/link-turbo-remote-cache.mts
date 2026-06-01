import { loadTurboRemoteEnv, runPnpmTurbo } from "./turbo-remote.shared.mts";

const { team } = loadTurboRemoteEnv();

const result = runPnpmTurbo(["link", "--yes", "--scope", team]);

if (result.status !== 0) {
  process.stderr.write(`${result.stdout ?? ""}${result.stderr ?? ""}`);
}

process.exit(result.status ?? 1);
