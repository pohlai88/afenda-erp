import { readFile } from "node:fs/promises";
import { listCronRunHistory } from "@afenda/db";
import { formatErpDateTime } from "@afenda/kernel";
import type { CronHealthSurfaceRow } from "../contracts/system-admin.cron-health.contract";
import { resolveRepoRootFile } from "./system-admin.repo-root-file.repository.server";

type VercelCron = {
  path: string;
  schedule: string;
};

function jobNameFromPath(path: string) {
  return path.split("/").filter(Boolean).at(-1) ?? path;
}

function formatDuration(value: number | null | undefined) {
  return typeof value === "number" ? `${value}ms` : "-";
}

async function readVercelCronConfig(): Promise<VercelCron[]> {
  const vercelJsonPath = await resolveRepoRootFile("vercel.json");
  const raw = await readFile(vercelJsonPath, "utf8");
  const parsed = JSON.parse(raw) as { crons?: VercelCron[] };
  return parsed.crons ?? [];
}

export async function getCronHealthSurfaceRows(): Promise<
  CronHealthSurfaceRow[]
> {
  const [crons, history] = await Promise.all([
    readVercelCronConfig(),
    listCronRunHistory({ limit: 100 }),
  ]);

  return crons.map((cron) => {
    const jobName = jobNameFromPath(cron.path);
    const latest = history.find(
      (run) => run.jobName === jobName || run.route === cron.path,
    );

    return {
      id: jobName,
      path: cron.path,
      schedule: cron.schedule,
      status: latest?.status ?? "configured",
      lastRun: formatErpDateTime(latest?.finishedAt ?? latest?.startedAt),
      duration: formatDuration(latest?.durationMs),
      failure: latest?.errorMessage ?? "-",
    };
  });
}
