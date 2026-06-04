import { describe, expect, it } from "vitest";
import { resolveRepoRootFile } from "../../src/features/reliability/sys-repo-root-file.repository.server";

describe("resolveRepoRootFile", () => {
  it("locates vercel.json from the monorepo root", async () => {
    const path = await resolveRepoRootFile("vercel.json");
    expect(path.endsWith("vercel.json")).toBe(true);
  });

  it("rejects path traversal outside the repository root", async () => {
    await expect(resolveRepoRootFile("../vercel.json")).rejects.toThrow(
      "Unsafe repository relative path",
    );
  });

  it("rejects safe but unapproved repository paths", async () => {
    await expect(resolveRepoRootFile("package.json")).rejects.toThrow(
      "Repository path is not allowlisted",
    );
  });
});
