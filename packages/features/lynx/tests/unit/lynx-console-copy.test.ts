import { describe, expect, it } from "vitest";
import {
  getLynxConsoleUxCards,
  lynxConsolePageMetadata,
  lynxConsoleSections,
  lynxConsoleUxCards,
} from "../../src/lyn-console-ui.copy.shared";

describe("lynx console copy", () => {
  it("defines UX cards for the operator panel", () => {
    expect(getLynxConsoleUxCards()).toHaveLength(3);
    expect(lynxConsoleUxCards.map((card) => card.id)).toEqual([
      "root-causes",
      "recovery-actions",
      "approval-boundary",
    ]);
  });

  it("defines console section and page metadata", () => {
    expect(lynxConsoleSections.playbookCatalog.title).toBe(
      "Recovery playbook catalog",
    );
    expect(lynxConsolePageMetadata.title).toBe("Lynx Console");
  });
});
