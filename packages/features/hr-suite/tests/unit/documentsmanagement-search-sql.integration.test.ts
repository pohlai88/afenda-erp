import { describe, expect, it } from "vitest";

import { listHrEmployeeDocumentsWindow } from "@afenda/db";

const hasDatabase = Boolean(process.env.DATABASE_URL?.trim());
const DEMO_ORG_ID = "org_demo";

describe.skipIf(!hasDatabase)(
  "documents repository search SQL integration",
  () => {
    it("does not throw when searching enum-backed columns", async () => {
      await expect(
        listHrEmployeeDocumentsWindow({
          organizationId: DEMO_ORG_ID,
          search: "pending",
        }),
      ).resolves.toMatchObject({
        rows: expect.any(Array),
      });
    });
  },
);
