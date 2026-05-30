import { describe, expect, it } from "vitest";

import { parseHrDocumentsSearchParams } from "../../src/employee-management/documents-management/data/hr.workforce.documents-search-params.parse.shared";

describe("hr documents search params", () => {
  it("returns empty object when search params are undefined", () => {
    expect(parseHrDocumentsSearchParams(undefined)).toEqual({});
  });

  it("reads repository search from URL param", () => {
    expect(
      parseHrDocumentsSearchParams({
        documentsRepositorySearch: " passport ",
      }),
    ).toEqual({
      repositorySearch: "passport",
    });
  });
});
