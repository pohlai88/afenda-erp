import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

import {
  adaptGovernedActionBar,
  adaptGovernedAuditPanel,
  adaptGovernedChart,
  adaptGovernedDetailTabs,
  adaptGovernedForm,
  adaptGovernedKanban,
  adaptGovernedList,
  adaptGovernedPageHeader,
  createMetadataUiMigrationReplacementGate,
} from "../migration/parity-adapters.shared";

const PACKAGE_ROOT = process.cwd();
const SRC_ROOT = path.join(PACKAGE_ROOT, "src");

function readSource(relativePath: string): string {
  return fs.readFileSync(path.join(SRC_ROOT, relativePath), "utf8");
}

describe("governed surface parity adapter pack", () => {
  it("adapts page header and action bar configs", () => {
    const header = adaptGovernedPageHeader({
      title: "Quarter close",
      level: "record",
      breadcrumbs: [{ label: "Finance", href: "/finance" }, { label: "Close" }],
      badges: [{ label: "Locked", tone: "warning" }],
      actions: [{ key: "open", label: "Open", href: "/finance/close" }],
      unsupportedVisuals: ["heroIcon"],
    });
    const actionBar = adaptGovernedActionBar({
      title: "Close actions",
      compact: true,
      actions: [
        { key: "submit", label: "Submit" },
        { key: "delete", label: "Delete", destructive: true },
      ],
    });

    expect(header.data.level).toBe("record");
    expect(header.data.breadcrumbs).toHaveLength(2);
    expect(header.data.actions[0]?.action.execution.kind).toBe("navigation");
    expect(header.parityNotes[0]?.disposition).toBe("unsupported");
    expect(actionBar.data.actions[0]?.priority).toBe("primary");
    expect(actionBar.data.actions[1]?.priority).toBe("danger");
    expect(actionBar.parityNotes[0]?.sourceField).toBe("compact");
  });

  it("adapts list, form, detail tabs, chart, kanban, and audit panel configs", () => {
    const list = adaptGovernedList({
      title: "Invoices",
      searchable: true,
      exportable: true,
      fullDatasetClientSide: true,
      columns: [
        { key: "number", label: "Number" },
        { key: "amount", label: "Amount", format: "currency" },
      ],
    });
    const form = adaptGovernedForm({
      title: "Invoice",
      state: "invalid",
      fields: [
        { key: "name", label: "Name", required: true },
        { key: "attachment", label: "Attachment", kind: "file", uploadKey: "invoice.upload" },
      ],
      errors: [{ fieldKey: "name", message: "Name is required." }],
    });
    const tabs = adaptGovernedDetailTabs({
      tabs: [
        { key: "overview", label: "Overview", sectionKey: "invoice.overview" },
        { key: "audit", label: "Audit", sectionKey: "invoice.audit" },
      ],
    });
    const chart = adaptGovernedChart({
      title: "Revenue",
      categoryKey: "period",
      series: [{ key: "value", label: "Value", valueKey: "value" }],
      data: [{ period: "Q1", value: 10 }],
      visxOnly: true,
    });
    const kanban = adaptGovernedKanban({
      columnField: "status",
      draggable: true,
      columns: [
        { key: "todo", label: "To do" },
        { key: "done", label: "Done", disabledReason: "Closed" },
      ],
      cards: [{ key: "card-1", title: "Review", columnKey: "todo" }],
      transitions: [
        { from: "todo", to: "done", label: "Done", available: false, disabledReason: "Closed" },
      ],
    });
    const audit = adaptGovernedAuditPanel({
      title: "Audit",
      events: [
        {
          key: "created",
          occurredAt: "2026-06-04T00:00:00.000Z",
          summary: "Created",
          actorName: "Operator",
        },
      ],
    });

    expect(list.data.columns).toHaveLength(2);
    expect(list.parityNotes[0]?.sourceField).toBe("fullDatasetClientSide");
    expect(form.data.state).toBe("invalid");
    expect(form.data.sections[0]?.fields[1]?.fileUpload?.hostUploadKey).toBe("invoice.upload");
    expect(tabs.data.tabs).toHaveLength(2);
    expect(chart.data.data).toHaveLength(1);
    expect(chart.parityNotes[0]?.sourceField).toBe("visxOnly");
    expect(kanban.data.mode).toBe("draggable");
    expect(kanban.parityNotes[0]?.sourceField).toBe("draggable");
    expect(audit.data.events[0]?.actor.displayName).toBe("Operator");
  });

  it("defines replacement stop/go criteria from parity evidence", () => {
    const unsupported = adaptGovernedChart({
      categoryKey: "period",
      series: [{ key: "value", label: "Value", valueKey: "value" }],
      data: [{ period: "Q1", value: 10 }],
      visxOnly: true,
    });
    const blocked = createMetadataUiMigrationReplacementGate({
      parityNotes: unsupported.parityNotes,
      guardPassed: true,
      visualEvidence: true,
    });
    const allowed = createMetadataUiMigrationReplacementGate({
      parityNotes: [],
      guardPassed: true,
      visualEvidence: true,
    });

    expect(blocked.canReplace).toBe(false);
    expect(blocked.blockers).toContain("chart:visxOnly");
    expect(allowed.canReplace).toBe(true);
    expect(allowed.requiredEvidence).toContain("no governed-surface runtime imports");
  });

  it("keeps parity adapters shared-runtime and config-only", () => {
    const source = readSource("migration/parity-adapters.shared.ts");
    const indexSource = readSource("index.ts");

    expect(source).not.toContain("@afenda/governed-surface");
    expect(source).not.toContain("@afenda/feature");
    expect(source).not.toMatch(/^\s*<[A-Za-z]/m);
    expect(source).not.toMatch(/from "react"|from 'react'/);
    expect(source).not.toContain("server-only");
    expect(source).not.toContain('"use client"');
    expect(indexSource).toContain("parity-adapters.shared");
  });
});
