import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { gzipSync } from "node:zlib";

const appNextDir = join(process.cwd(), "apps", "erp", ".next");
const staticDir = join(appNextDir, "static");
const budgets = {
  totalJavaScriptGzipBytes: 1_400_000,
  largestJavaScriptGzipBytes: 450_000,
  staticAssetGzipBytes: 2_400_000,
};

type Asset = {
  path: string;
  bytes: number;
  gzipBytes: number;
};

function walkFiles(directory: string): string[] {
  return readdirSync(directory).flatMap((entry) => {
    const fullPath = join(directory, entry);
    const stats = statSync(fullPath);

    return stats.isDirectory() ? walkFiles(fullPath) : [fullPath];
  });
}

function getAssets() {
  if (!existsSync(staticDir)) {
    throw new Error("Missing .next/static. Run `pnpm build` before checking budgets.");
  }

  return walkFiles(staticDir).map((path): Asset => {
    const bytes = readFileSync(path);

    return {
      path,
      bytes: bytes.byteLength,
      gzipBytes: gzipSync(bytes).byteLength,
    };
  });
}

function formatBytes(bytes: number) {
  return `${(bytes / 1024).toFixed(1)} KiB`;
}

const assets = getAssets();
const javascriptAssets = assets.filter((asset) => asset.path.endsWith(".js"));
const totalJavaScriptGzipBytes = javascriptAssets.reduce(
  (total, asset) => total + asset.gzipBytes,
  0,
);
const largestJavaScriptGzipBytes = Math.max(
  0,
  ...javascriptAssets.map((asset) => asset.gzipBytes),
);
const staticAssetGzipBytes = assets.reduce(
  (total, asset) => total + asset.gzipBytes,
  0,
);
const failures = [
  {
    label: "Total JavaScript gzip",
    actual: totalJavaScriptGzipBytes,
    budget: budgets.totalJavaScriptGzipBytes,
  },
  {
    label: "Largest JavaScript gzip",
    actual: largestJavaScriptGzipBytes,
    budget: budgets.largestJavaScriptGzipBytes,
  },
  {
    label: "All static assets gzip",
    actual: staticAssetGzipBytes,
    budget: budgets.staticAssetGzipBytes,
  },
].filter((check) => check.actual > check.budget);

if (failures.length > 0) {
  for (const failure of failures) {
    console.error(
      `${failure.label} exceeded: ${formatBytes(failure.actual)} > ${formatBytes(
        failure.budget,
      )}`,
    );
  }

  process.exit(1);
}

process.stdout.write(
  [
    "Performance budgets passed.",
    `Total JS gzip: ${formatBytes(totalJavaScriptGzipBytes)}`,
    `Largest JS gzip: ${formatBytes(largestJavaScriptGzipBytes)}`,
    `Static assets gzip: ${formatBytes(staticAssetGzipBytes)}`,
  ].join("\n") + "\n",
);
