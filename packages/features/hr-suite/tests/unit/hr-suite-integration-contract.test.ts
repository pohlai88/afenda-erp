import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { parseListSurfaceRendererConfiguration } from "@afenda/governed-surface/schemas";
import { describe, expect, it } from "vitest";

import {
  defineHrSuiteErpPermission,
  defineHrSuiteReadPermission,
} from "../../src/hr-suite-integration";
import {
  buildHrSuiteListSearchToolbar,
  buildHrSuiteOperationalListSurface,
  buildHrSuiteSearchParamModelFields,
  buildHrSuiteSearchParamsBySurfaceKey,
  defineHrSuiteActionDescriptor,
  defineHrSuiteSearchParamRegistry,
  resolveHrSuiteListTrailingAction,
} from "../../src/hr-suite-integration/metadata";
import {
  hrSuiteActionFailure,
  toHrSuiteActionFailure,
  toHrSuiteNativeFormAction,
  toHrSuiteResultFormAction,
} from "../../src/hr-suite-integration/actions/hr-suite-action-result.shared";

const testDir = path.dirname(fileURLToPath(import.meta.url));
const packageRoot = path.resolve(testDir, "../..");
const integrationRoot = path.join(
  packageRoot,
  "src",
  "hr-suite-integration",
);

describe("HR Suite integration contract", () => {
  it("keeps the integration root shape and package API closed", () => {
    const allowedRootFiles = new Set([
      "client.ts",
      "hr-suite-integration-architecture.md",
      "index.ts",
      "metadata.ts",
      "server.ts",
    ]);
    const allowedDirs = new Set([
      "actions",
      "components",
      "contracts",
      "navigation",
      "policies",
      "surface",
    ]);

    for (const entry of fs.readdirSync(integrationRoot, {
      withFileTypes: true,
    })) {
      if (entry.isFile()) {
        expect(allowedRootFiles.has(entry.name), entry.name).toBe(true);
      }
      if (entry.isDirectory()) {
        expect(allowedDirs.has(entry.name), entry.name).toBe(true);
      }
    }

    const packageJson = JSON.parse(
      fs.readFileSync(path.join(packageRoot, "package.json"), "utf8"),
    ) as { exports: Record<string, unknown> };
    expect(Object.keys(packageJson.exports)).toEqual([
      ".",
      "./client",
      "./server",
      "./metadata",
    ]);
  });

  it("builds metadata-safe permission descriptors", () => {
    expect(defineHrSuiteReadPermission(" time_clock ")).toEqual({
      module: "hr",
      object: "time_clock",
      function: "read",
    });
    expect(
      defineHrSuiteErpPermission({
        object: "bonus_adjustment",
        function: "audit",
      }),
    ).toEqual({
      module: "hr",
      object: "bonus_adjustment",
      function: "audit",
    });
    expect(() => defineHrSuiteReadPermission(" ")).toThrow(
      "HR permission object must not be empty.",
    );
  });

  it("builds governed Pattern C list surfaces with bounded pagination", () => {
    const searchToolbar = buildHrSuiteListSearchToolbar({
      param: "q",
      label: "Search employees",
      placeholder: "Search by name or code",
      value: "Ava",
    });
    const listSurface = buildHrSuiteOperationalListSurface({
      primaryColumnId: "employee",
      readPermission: defineHrSuiteReadPermission("employee_directory"),
      searchToolbar,
      window: {
        pageSize: 25,
        totalCount: 1,
        hasNextPage: true,
        nextCursor: " cursor-2 ",
      },
      surface: {
        headerTitle: "Employees",
        columnsId: "hr-employees",
        emptyTitle: "No employees",
        emptyDescription: "No employee records match the current filters.",
      },
      columns: [{ id: "employee", header: "Employee", priority: "primary" }],
      rows: [{ id: "emp-1", cells: { employee: "Ava Chen" } }],
    });

    expect(listSurface.requiresErpPermission).toEqual({
      module: "hr",
      object: "employee_directory",
      function: "read",
    });
    expect(listSurface.pagination).toEqual({
      pageSize: 25,
      totalCount: 1,
      hasNextPage: true,
      nextCursor: "cursor-2",
    });
    expect(listSurface.presentation?.toolbar?.search).toEqual(
      searchToolbar.search,
    );
    expect(parseListSurfaceRendererConfiguration(listSurface).success).toBe(
      true,
    );
  });

  it("defines reusable search-param registry metadata", () => {
    const registry = defineHrSuiteSearchParamRegistry([
      {
        surfaceKey: "applications",
        param: "applicationsSearch",
        modelField: "applicationsSearch",
        label: "Search applications",
        placeholder: "Search candidate or requisition",
      },
      {
        surfaceKey: "offers",
        param: "offersSearch",
        modelField: "offersSearch",
        label: "Search offers",
        placeholder: "Search offer or candidate",
      },
    ] as const);

    expect(buildHrSuiteSearchParamsBySurfaceKey(registry)).toEqual({
      applications: "applicationsSearch",
      offers: "offersSearch",
    });
    expect(buildHrSuiteSearchParamModelFields(registry)).toEqual([
      "applicationsSearch",
      "offersSearch",
    ]);
  });

  it("builds governed trailing action descriptors", () => {
    const descriptor = defineHrSuiteActionDescriptor({
      id: "approve",
      label: "Approve",
      intent: "approval",
      requiresStepUp: true,
    });

    expect(
      resolveHrSuiteListTrailingAction({
        allowed: true,
        descriptor,
      }),
    ).toEqual({ state: "ready", descriptor });
    expect(
      resolveHrSuiteListTrailingAction({
        allowed: false,
        disabledReason: "Approval permission required.",
        descriptor,
      }),
    ).toEqual({
      state: "disabled",
      disabledReason: "Approval permission required.",
      descriptor,
    });
    expect(
      resolveHrSuiteListTrailingAction({
        visible: false,
        allowed: true,
      }),
    ).toEqual({ state: "hidden" });
  });

  it("keeps action failures generic and wraps native form actions", async () => {
    expect(
      toHrSuiteActionFailure<{ id: string }>(new Error("raw detail"), {
        fallbackMessage: "Could not save HR record.",
      }),
    ).toEqual({ ok: false, error: "Could not save HR record." });
    expect(
      toHrSuiteActionFailure(new Error("Visible detail"), {
        exposeUnexpectedErrorMessage: true,
      }),
    ).toEqual({ ok: false, error: "Visible detail" });
    expect(
      hrSuiteActionFailure("Mapped failure.", { code: "mapped" }),
    ).toEqual({
      ok: false,
      error: "Mapped failure.",
      code: "mapped",
    });

    const successResultAction = toHrSuiteResultFormAction(async () => ({
      ok: true,
      data: { id: "emp-1" },
    }));
    await expect(successResultAction(new FormData())).resolves.toBeUndefined();

    const failedStateAction = toHrSuiteNativeFormAction(async () => ({
      ok: false,
      error: "Native form failure.",
    }));
    await expect(failedStateAction(new FormData())).rejects.toThrow(
      "Native form failure.",
    );
  });
});
