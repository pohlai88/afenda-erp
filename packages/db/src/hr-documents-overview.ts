import { and, count, eq, gte, isNotNull, lte } from "drizzle-orm";

import { runWithOrganizationContext } from "./client";
import { hrEmployeeDocuments } from "./schema/hr";

export type HrDocumentsOverviewSnapshot = {
  activeDocumentCount: number;
  pendingVerificationCount: number;
  expiringSoonCount: number;
  expiredActiveCount: number;
};

const EXPIRING_SOON_DAYS = 14;

/** HRM-DOC-022 posture snapshot for governed overview surfaces. */
export async function loadHrDocumentsOverviewSnapshot(input: {
  organizationId: string;
}): Promise<HrDocumentsOverviewSnapshot> {
  const now = new Date();
  const horizon = new Date(now);
  horizon.setUTCDate(horizon.getUTCDate() + EXPIRING_SOON_DAYS);

  return runWithOrganizationContext(input.organizationId, async (db) => {
    const baseActive = and(
      eq(hrEmployeeDocuments.organizationId, input.organizationId),
      eq(hrEmployeeDocuments.lifecycleStatus, "active"),
      eq(hrEmployeeDocuments.isLatestActive, true),
    );

    const [activeRow, pendingRow, expiringRow, expiredRow] = await Promise.all([
      db.select({ total: count() }).from(hrEmployeeDocuments).where(baseActive),
      db
        .select({ total: count() })
        .from(hrEmployeeDocuments)
        .where(
          and(baseActive, eq(hrEmployeeDocuments.verificationStatus, "pending")),
        ),
      db
        .select({ total: count() })
        .from(hrEmployeeDocuments)
        .where(
          and(
            baseActive,
            isNotNull(hrEmployeeDocuments.effectiveTo),
            gte(hrEmployeeDocuments.effectiveTo, now),
            lte(hrEmployeeDocuments.effectiveTo, horizon),
          ),
        ),
      db
        .select({ total: count() })
        .from(hrEmployeeDocuments)
        .where(
          and(
            baseActive,
            isNotNull(hrEmployeeDocuments.effectiveTo),
            lte(hrEmployeeDocuments.effectiveTo, now),
          ),
        ),
    ]);

    return {
      activeDocumentCount: Number(activeRow[0]?.total ?? 0),
      pendingVerificationCount: Number(pendingRow[0]?.total ?? 0),
      expiringSoonCount: Number(expiringRow[0]?.total ?? 0),
      expiredActiveCount: Number(expiredRow[0]?.total ?? 0),
    };
  });
}
