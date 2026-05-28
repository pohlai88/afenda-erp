import {
  buildGovernedListSurface,
  GOVERNED_METADATA_SCHEMA_VERSION,
  type ListSurfaceRendererConfigurationResolvedInput,
} from "@afenda/governed-surface";

export const systemAdminCronSurfaceKey = "system-admin.cron-health.list";

export type CronHealthSurfaceRow = {
  id: string;
  path: string;
  schedule: string;
  status: string;
  lastRun: string;
  duration: string;
  failure: string;
};

function pagination(total: number) {
  return {
    pageSize: Math.max(1, total),
    totalCount: total,
    hasNextPage: false,

  };
}

export function buildCronHealthListSurface(input: {
  rows: readonly CronHealthSurfaceRow[];
}): ListSurfaceRendererConfigurationResolvedInput {
  return buildGovernedListSurface({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "table",
    presentationProfile: "erp-operational-table",
    presentation: {
      toolbar: {
        search: {
          param: "cronQ",
          label: "Search",
          placeholder: "Search scheduled jobs",
        },
        filters: [
          {
            id: "status",
            label: "Status",
            param: "cronStatus",
            options: [
              { label: "Configured", value: "configured" },
              { label: "Started", value: "started" },
              { label: "Success", value: "success" },
              { label: "Failed", value: "failed" },
              { label: "Rejected", value: "rejected" },
            ],
          },
        ],
        sort: {
          label: "Sort",
          param: "cronSort",
          options: [
            {
              label: "Route A-Z",
              value: "route-asc",
              columnId: "path",
              direction: "asc",
            },
            {
              label: "Last run newest",
              value: "last-run-desc",
              columnId: "lastRun",
              direction: "desc",
            },
          ],
        },
        densityToggle: true,
        columnPicker: true,
        resetParams: ["cronQ", "cronStatus", "cronSort"],
      },
    },
    requiresErpPermission: {
      module: "system-admin",
      object: "cron",
      function: "read",
    },
    pagination: pagination(input.rows.length),
    surface: {
      header: { title: "Scheduled jobs" },
      columnsId: "system-admin-cron",
      rowKey: "id",
      empty: { variant: "muted", title: "No cron routes configured." },
    },
    columns: [
      { id: "path", header: "Route", priority: "primary" as const, pin: "start" as const },
      { id: "schedule", header: "Schedule" },
      { id: "status", header: "Status", cellKind: { kind: "badge" as const } },
      { id: "lastRun", header: "Last run" },
      { id: "duration", header: "Duration" },
      { id: "failure", header: "Failure" },
    ],
    rows: input.rows.map((row) => ({
      id: row.id,
      cells: {
        path: row.path,
        schedule: row.schedule,
        status: row.status,
        lastRun: row.lastRun,
        duration: row.duration,
        failure: row.failure,
      },
      rowTone:
        row.status === "failed" || row.status === "rejected"
          ? ("attention" as const)
          : ("default" as const),
    })),
  });
}
