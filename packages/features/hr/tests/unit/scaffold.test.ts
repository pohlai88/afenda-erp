import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { appCapabilities } from "@afenda/auth";
import { describe, expect, it } from "vitest";
import * as hrClient from "../../src/client";
import * as hrMetadata from "../../src/metadata";
import { HR_CAPABILITIES, HR_MODULE_ID, isHrCapability } from "../../src/contracts";

const packageRoot = path.dirname(
  path.dirname(path.dirname(fileURLToPath(import.meta.url))),
);

describe("@afenda/feature-hr Slice 0 scaffold", () => {
  it("exposes stable module id and metadata compatibility", () => {
    expect(HR_MODULE_ID).toBe("hr");
    expect(hrMetadata.moduleId).toBe("hr");
    expect(hrMetadata.getListSurfaceKeys()).toEqual({
      records: "hr.records.list",
      workItems: "hr.work-items.list",
      savedViews: "hr.saved-views.list",
      documents: "hr.documents.list",
      employees: "hr.workforce.employees.list",
      workforceDocuments: "hr.workforce.documents.list",
      workforceLifecycle: "hr.workforce.lifecycle.list",
      workforceOffboarding: "hr.workforce.offboarding.list",
    });
  });

  it("registers HR capabilities in appCapabilities", () => {
    for (const capability of HR_CAPABILITIES) {
      expect(appCapabilities).toContain(capability);
      expect(isHrCapability(capability)).toBe(true);
    }
  });

  it("keeps ./client free of server-only import paths", () => {
    const clientSource = readFileSync(
      path.join(packageRoot, "src/client.ts"),
      "utf8",
    );
    const importLines = clientSource
      .split("\n")
      .filter((line) => line.trimStart().startsWith("import "));
    const joined = importLines.join("\n");
    expect(joined).not.toMatch(/@afenda\/db/);
    expect(joined).not.toMatch(/@afenda\/auth\/server/);
    expect(joined).not.toMatch(/node:/);
    expect(hrClient.HR_MODULE_ID).toBe("hr");
  });
});
