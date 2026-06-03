"use server";

import {
  createHrRonRequisition,
  getHrRonStore,
  publishHrRonPostingReference,
} from "./hr.talent.ron-store.shared";
import {
  hrRonJobPostingSchema,
  hrRonRequisitionSchema,
} from "./hr.talent.ron.schema";
import {
  requireHrRonRead,
  requireHrRonWrite,
} from "./hr.talent.ron-access.policy.server";

export async function createHrRonRequisitionAction(input: unknown) {
  const guard = await requireHrRonWrite();
  return createHrRonRequisition(
    hrRonRequisitionSchema.parse({
      ...(typeof input === "object" && input ? input : {}),
      organizationId: guard.organization.id,
    }),
  );
}

export async function publishHrRonPostingAction(input: unknown) {
  const guard = await requireHrRonWrite();
  const posting = hrRonJobPostingSchema.parse({
    ...(typeof input === "object" && input ? input : {}),
    organizationId: guard.organization.id,
  });
  return publishHrRonPostingReference(posting);
}

export async function exportHrRonReportAction() {
  const guard = await requireHrRonRead();
  return {
    organizationId: guard.organization.id,
    exportedAt: new Date().toISOString(),
    rowCount: getHrRonStore(guard.organization.id).applications.length,
  };
}
