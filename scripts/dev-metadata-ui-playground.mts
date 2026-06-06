import { spawn, spawnSync } from "node:child_process";
import { createServer } from "node:net";

const PORT = 4000;
const HOST = "127.0.0.1";
const PLAYGROUND_URL = `http://${HOST}:${PORT}/playground-metadataui`;

function assertPortAvailable(port: number): Promise<void> {
  return new Promise((resolve, reject) => {
    const server = createServer();

    server.once("error", (error: NodeJS.ErrnoException) => {
      if (error.code === "EADDRINUSE") {
        reject(
          new Error(
            `Port ${port} is already in use. Stop the process using ${port} before starting the metadata UI playground.`,
          ),
        );
        return;
      }

      reject(error);
    });

    server.once("listening", () => {
      server.close(() => resolve());
    });

    server.listen(port);
  });
}

await assertPortAvailable(PORT).catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});

console.log(`Starting metadata UI playground at ${PLAYGROUND_URL}`);

const env = Object.fromEntries(
  Object.entries({
    ...process.env,
    AFENDA_ENABLE_DEV_PLAYGROUNDS: "1",
  }).filter((entry): entry is [string, string] => typeof entry[1] === "string"),
);
const pnpmCommand = process.platform === "win32" ? "pnpm.cmd" : "pnpm";

const envSync = spawnSync(pnpmCommand, ["env:sync"], {
  cwd: process.cwd(),
  env,
  stdio: "inherit",
});

if (envSync.error) {
  console.error(envSync.error.message);
  process.exit(1);
}

if (envSync.status !== 0) {
  process.exit(envSync.status ?? 1);
}

const child = spawn(
  pnpmCommand,
  [
    "--filter",
    "@afenda/erp",
    "exec",
    "next",
    "dev",
    "--hostname",
    HOST,
    "--port",
    String(PORT),
  ],
  {
    cwd: process.cwd(),
    env,
    stdio: "inherit",
    shell: false,
  },
);

function forwardSignal(signal: NodeJS.Signals) {
  if (!child.pid) {
    return;
  }

  if (process.platform === "win32") {
    spawnSync("taskkill", ["/pid", String(child.pid), "/T", "/F"], {
      stdio: "ignore",
    });
    return;
  }

  child.kill(signal);
}

process.on("SIGINT", forwardSignal);
process.on("SIGTERM", forwardSignal);

child.on("error", (error) => {
  console.error(error.message);
  process.exit(1);
});

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 0);
});
