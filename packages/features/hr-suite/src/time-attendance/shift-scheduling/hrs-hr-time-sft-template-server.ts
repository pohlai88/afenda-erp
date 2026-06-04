import {
  archiveHrShiftTemplate,
  createHrShiftTemplate,
  getHrShiftTemplate,
  listHrShiftTemplatesWindow,
  updateHrShiftTemplate,
  type HrShiftTemplateRow,
  type HrShiftTemplateWindow,
} from "@afenda/db";

import type {
  HrSftCreateShiftTemplateInput,
  HrSftUpdateShiftTemplateInput,
} from "./hr.time.sft-template.schema";
import { emitHrSftAuditEvent } from "./hrs-hr-time-sft-audit-server";
import { hrTimeSftAuditActions } from "./hr.time.sft.event";

export type { HrShiftTemplateRow, HrShiftTemplateWindow };

/** HRM-SFT-001 — list shift types for Pattern B catalog. */
export async function listHrTimeSftShiftTemplates(input: {
  organizationId: string;
  limit?: number;
  offset?: number;
  search?: string;
  activeOnly?: boolean;
}): Promise<HrShiftTemplateWindow> {
  return listHrShiftTemplatesWindow(input);
}

/** HRM-SFT-001 — fetch one shift type. */
export async function getHrTimeSftShiftTemplate(input: {
  organizationId: string;
  templateId: string;
}): Promise<HrShiftTemplateRow | null> {
  return getHrShiftTemplate(input);
}

/** HRM-SFT-001/002/003 — create shift type. */
export async function createHrTimeSftShiftTemplate(input: {
  organizationId: string;
  actorAuthUserId: string;
  payload: HrSftCreateShiftTemplateInput;
}): Promise<{ templateId: string }> {
  const result = await createHrShiftTemplate({
    organizationId: input.organizationId,
    code: input.payload.code,
    name: input.payload.name,
    description: input.payload.description,
    startTime: input.payload.startTime,
    endTime: input.payload.endTime,
    breakStartTime: input.payload.breakStartTime,
    breakEndTime: input.payload.breakEndTime,
    workingHoursMinutes: input.payload.workingHoursMinutes,
    shiftCategory: input.payload.shiftCategory,
    patternKind: input.payload.patternKind,
  });

  await emitHrSftAuditEvent({
    organizationId: input.organizationId,
    actorAuthUserId: input.actorAuthUserId,
    action: hrTimeSftAuditActions.template.created,
    targetType: "hr_shift_template",
    targetId: result.templateId,
    summary: `Shift type ${input.payload.code} created.`,
    metadata: {
      code: input.payload.code,
      patternKind: input.payload.patternKind,
      shiftCategory: input.payload.shiftCategory,
    },
  });

  return result;
}

/** HRM-SFT-001/002 — update shift type. */
export async function updateHrTimeSftShiftTemplate(input: {
  organizationId: string;
  actorAuthUserId: string;
  payload: HrSftUpdateShiftTemplateInput;
}): Promise<{ templateId: string }> {
  const result = await updateHrShiftTemplate({
    organizationId: input.organizationId,
    templateId: input.payload.templateId,
    name: input.payload.name,
    description: input.payload.description,
    startTime: input.payload.startTime,
    endTime: input.payload.endTime,
    breakStartTime: input.payload.breakStartTime,
    breakEndTime: input.payload.breakEndTime,
    workingHoursMinutes: input.payload.workingHoursMinutes,
    shiftCategory: input.payload.shiftCategory,
    patternKind: input.payload.patternKind,
  });

  await emitHrSftAuditEvent({
    organizationId: input.organizationId,
    actorAuthUserId: input.actorAuthUserId,
    action: hrTimeSftAuditActions.template.updated,
    targetType: "hr_shift_template",
    targetId: result.templateId,
    summary: `Shift type ${result.templateId} updated.`,
  });

  return result;
}

/** HRM-SFT-001 — archive shift type. */
export async function archiveHrTimeSftShiftTemplate(input: {
  organizationId: string;
  actorAuthUserId: string;
  templateId: string;
}): Promise<{ templateId: string }> {
  const result = await archiveHrShiftTemplate({
    organizationId: input.organizationId,
    templateId: input.templateId,
  });

  await emitHrSftAuditEvent({
    organizationId: input.organizationId,
    actorAuthUserId: input.actorAuthUserId,
    action: hrTimeSftAuditActions.template.archived,
    targetType: "hr_shift_template",
    targetId: result.templateId,
    summary: `Shift type ${result.templateId} archived.`,
  });

  return result;
}
