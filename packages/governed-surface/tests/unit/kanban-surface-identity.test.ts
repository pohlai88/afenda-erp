import { describe, expect, it } from "vitest";

import {
  buildKanbanBoardDataAttributes,
  buildKanbanSectionDataAttributes,
  governedKanbanBoardTestId,
  governedKanbanCardTestId,
  governedKanbanSectionTestId,
} from "../../src/kanban-surface-identity.shared";

describe("kanban-surface-identity", () => {
  it("emits canonical test ids", () => {
    expect(governedKanbanSectionTestId("hr.pipeline")).toBe(
      "governed:kanban-section:hr.pipeline",
    );
    expect(governedKanbanBoardTestId("hr.pipeline")).toBe(
      "governed:kanban-board:hr.pipeline",
    );
    expect(governedKanbanCardTestId("hr.pipeline", "card-1")).toBe(
      "governed:kanban-card:hr.pipeline:card-1",
    );
  });

  it("buildKanbanBoardDataAttributes merges legacy and canonical attrs", () => {
    const attrs = buildKanbanBoardDataAttributes({
      surfaceKey: "hr.pipeline",
      state: "ready",
    });

    expect(attrs["data-governed-surface-key"]).toBe("hr.pipeline");
    expect(attrs["data-surface-key"]).toBe("hr.pipeline");
    expect(attrs["data-render-state"]).toBe("ready");
    expect(attrs["data-testid"]).toBe("governed:kanban-board:hr.pipeline");
  });

  it("buildKanbanSectionDataAttributes emits invalid state", () => {
    const attrs = buildKanbanSectionDataAttributes({
      surfaceKey: "hr.pipeline",
      state: "invalid",
    });

    expect(attrs["data-render-state"]).toBe("invalid");
    expect(attrs["data-testid"]).toBe("governed:kanban-section:hr.pipeline");
  });
});
