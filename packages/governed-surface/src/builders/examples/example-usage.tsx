import { GovernedAuditPanel } from "../../components/governed-audit-panel";
import { GovernedDetailTabs } from "../../components/governed-detail-tabs";
import {
  buildGovernedAuditPanel,
  buildGovernedDetailTabs,
  buildInvalidConfigEmpty,
} from "..";

export function ExampleAuditPanel() {
  const model = buildGovernedAuditPanel({
    entityKind: "Employee",
    entityId: "EMP-001",
    entityLabel: "Alicia Tan",
    rows: [
      {
        id: "audit-1",
        occurredAt: "2026-06-02T10:00:00+08:00",
        action: "employee.updated",
        actorLabel: "HR Admin",
        resourceLabel: "EMP-001",
        narrative: "Updated employment status.",
        tone: "default",
      },
    ],
  });

  return <GovernedAuditPanel model={model} />;
}

export function ExampleDetailTabs() {
  const model = buildGovernedDetailTabs({
    entityKind: "Employee",
    entityId: "EMP-001",
    entityLabel: "Alicia Tan",
    overview: {
      id: "overview",
      label: "Overview",
      hidden: false,
      rendererKey: "governed:stat-card",
    },
    relations: [
      {
        id: "attendance",
        label: "Attendance",
        hidden: false,
        rendererKey: "governed:stat-card",
      },
    ],
  });

  return <GovernedDetailTabs model={model} />;
}

export const invalidEmpty = buildInvalidConfigEmpty({
  description: "Employee metadata failed governed-surface validation.",
});
