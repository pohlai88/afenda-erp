import { spawn } from "node:child_process";
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
const command = [
  "pnpm",
  "env:sync",
  "&&",
  "pnpm",
  "--filter",
  "@afenda/erp",
  "exec",
  "next",
  "dev",
  "--hostname",
  HOST,
  "--port",
  String(PORT),
].join(" ");

const child = spawn(command, {
  cwd: process.cwd(),
  env,
  shell: true,
  stdio: "inherit",
});

function forwardSignal(signal: NodeJS.Signals) {
  child.kill(signal);
}

process.on("SIGINT", forwardSignal);
process.on("SIGTERM", forwardSignal);

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 0);
});
