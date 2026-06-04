import { describe, expect, it } from "vitest";

import { buildHrDocumentsRepositoryListSurface } from "../../src/employee-management/documents-management/hr.workforce.documents-repository-list.surface";
import { hrDocumentsRepositorySurfaceKey } from "../../src/metadata";

describe("documents list EUI contract", () => {
  it("builds repository list with governed surface header title", () => {
    const surface = buildHrDocumentsRepositoryListSurface({
      window: {
        rows: [],
        pageSize: 25,
        totalCount: 0,
        hasNextPage: false,
      },
    });

    expect(surface.surface.header.title).toBe("Document repository");
    expect(hrDocumentsRepositorySurfaceKey).toBe(
      "hr.workforce.documents.repository.list",
    );
    expect(surface.presentation!.toolbar?.search?.param).toBeTruthy();
  });
});
