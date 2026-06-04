import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

import {
  adaptGovernedChart,
  adaptGovernedList,
} from "../migration/parity-adapters.shared";
import { createMetadataUiReplacementReadiness } from "../migration/replacement-readiness.shared";

const PACKAGE_ROOT = process.cwd();
const SRC_ROOT = path.join(PACKAGE_ROOT, "src");

function readSource(relativePath: string): string {
  return fs.readFileSync(path.join(SRC_ROOT, relativePath), "utf8");
}

describe("metadata-ui replacement readiness gate", () => {
  it("allows replacement only when parity and certification evidence are complete", () => {
    const list = adaptGovernedList({
      title: "Invoices",
      columns: [{ key: "number", label: "Number" }],
    });
    const readiness = createMetadataUiReplacementReadiness({
      target: {
        featureKey: "finance.invoices",
        surfaces: ["list"],
      },
      parityNotes: list.parityNotes,
      evidence: {
        guardPassed: true,
        packageBuildPassed: true,
        packageTestsPassed: true,
        visualCertificationPassed: true,
        importAuditPassed: true,
      },
    });

    expect(readiness.canReplace).toBe(true);
    expect(readiness.blockers).toEqual([]);
    expect(readiness.featureKey).toBe("finance.invoices");
  });

  it("blocks replacement when target surfaces still have unsupported parity notes", () => {
    const chart = adaptGovernedChart({
      categoryKey: "period",
      series: [{ key: "value", label: "Value", valueKey: "value" }],
      data: [{ period: "Q1", value: 10 }],
      visxOnly: true,
    });
    const readiness = createMetadataUiReplacementReadiness({
      target: {
        featureKey: "finance.revenue",
        surfaces: ["chart"],
      },
      parityNotes: chart.parityNotes,
      evidence: {
        guardPassed: true,
        packageBuildPassed: true,
        packageTestsPassed: true,
        visualCertificationPassed: true,
        importAuditPassed: true,
      },
    });

    expect(readiness.canReplace).toBe(false);
    expect(readiness.blockers).toContain("chart:visxOnly");
  });

  it("blocks replacement when certification or import audit evidence is missing", () => {
    const readiness = createMetadataUiReplacementReadiness({
      target: {
        featureKey: "finance.close",
        surfaces: ["list", "form"],
      },
      parityNotes: [],
      evidence: {
        guardPassed: true,
        packageBuildPassed: false,
        packageTestsPassed: true,
        visualCertificationPassed: false,
        importAuditPassed: false,
      },
    });

    expect(readiness.canReplace).toBe(false);
    expect(readiness.blockers).toEqual(
      expect.arrayContaining([
        "metadata-ui:build",
        "visual-certification",
        "feature-import-audit",
      ]),
    );
    expect(readiness.requiredEvidence).toContain(
      "target feature import audit has no governed-surface-only behavior",
    );
  });

  it("keeps replacement readiness shared-runtime and side-effect free", () => {
    const source = readSource("migration/replacement-readiness.shared.ts");
    const indexSource = readSource("index.ts");

    expect(source).not.toContain("@afenda/governed-surface");
    expect(source).not.toContain("@afenda/feature");
    expect(source).not.toContain("apps/erp");
    expect(source).not.toContain("fetch(");
    expect(source).not.toContain("localStorage");
    expect(source).not.toContain("server-only");
    expect(source).not.toContain('"use client"');
    expect(source).not.toMatch(/^\s*<[A-Za-z]/m);
    expect(source).not.toMatch(/from "react"|from 'react'/);
    expect(indexSource).toContain("replacement-readiness.shared");
  });
});
