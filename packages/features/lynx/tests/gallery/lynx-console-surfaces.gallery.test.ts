import {
  parseListSurfaceRendererConfiguration,
  parseStatCardConfiguration,
} from "@afenda/governed-surface/schemas";
import { describe, expect, it } from "vitest";
import {
  buildLynxConsoleAiUsageListSurface,
  buildLynxConsoleEvidenceListSurface,
  buildLynxConsoleStatGrid,
  buildLynxOperationalSkillsListSurface,
  buildLynxRecoveryPlaybookListSurface,
} from "../../src/surface/lynx.console.surface";

describe("lynx console surface gallery", () => {
  it.each([
    [
      "evidence — ready",
      buildLynxConsoleEvidenceListSurface({
        rows: [
          {
            moduleId: "finance",
            moduleLabel: "Finance",
            recordCount: 12,
            workItemCount: 3,
            documentCount: 2,
            dataSource: "tenant",
          },
        ],
      }),
    ],
    [
      "ai usage — empty",
      buildLynxConsoleAiUsageListSurface({ events: [] }),
    ],
    [
      "recovery playbooks — ready",
      buildLynxRecoveryPlaybookListSurface({
        playbooks: [
          {
            id: "p1",
            label: "Debtor escalation",
            problem: "90d overdue",
            diagnosis: "No trigger",
            action: "Escalate",
            risk: "high",
          },
        ],
      }),
    ],
    [
      "operational skills — ready",
      buildLynxOperationalSkillsListSurface({
        skills: [
          {
            id: "s1",
            label: "Reconciliation",
            moduleId: "finance",
            description: "Month-end assist.",
            approvalPolicy: "human-required",
          },
        ],
      }),
    ],
  ])("parses list surface %s", (_name, surface) => {
    expect(parseListSurfaceRendererConfiguration(surface).success).toBe(true);
  });

  it("parses console stat grid", () => {
    const surface = buildLynxConsoleStatGrid({
      metrics: [
        {
          label: "Evidence records",
          value: "4 records",
          detail: "Records available across recovery-focused modules.",
          tone: "positive",
        },
      ],
    });

    expect(parseStatCardConfiguration(surface).success).toBe(true);
  });
});
