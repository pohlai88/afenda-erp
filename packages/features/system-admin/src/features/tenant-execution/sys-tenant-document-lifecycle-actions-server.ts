"use server";

import { TenantDocumentMutationError } from "@afenda/db";
import { hasDocumentWriteAccess } from "@afenda/auth";
import type { ModuleId } from "@afenda/kernel";
import { requireExecutionContext } from "@afenda/kernel/execution";
import {
  actionFailure,
  type ActionResult,
  zodActionFailure,
} from "@afenda/governed-surface/schemas";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import {
  systemAdminActionSuccess,
} from "../contracts/system-admin.action-result.contract";
import { applyLegalHoldToTenantDocumentCommand } from "../commands/apply-legal-hold-to-tenant-document.command.server";
import { deleteTenantDocumentCommand } from "../commands/delete-tenant-document.command.server";
import { releaseLegalHoldToTenantDocumentCommand } from "../commands/release-legal-hold-to-tenant-document.command.server";
import { releaseTenantDocumentScanQuarantineCommand } from "../commands/release-tenant-document-scan-quarantine.command.server";

const tenantDocumentLifecycleFormSchema = z.object({
  documentId: z.string().trim().min(1),
  moduleId: z.string().trim().min(1),
});

async function requireTenantDocumentWrite(moduleId: ModuleId) {
  const context = await requireExecutionContext();

  if (!hasDocumentWriteAccess(context.capabilities, moduleId)) {
    throw new Error("Document write access is required.");
  }

  return context;
}

function toLifecycleActionFailure(error: unknown): ActionResult {
  if (error instanceof TenantDocumentMutationError) {
    if (error.code === "not_found") {
      return actionFailure(
        "Document was not found.",
        undefined,
        "document_not_found",
      );
    }

    if (error.code === "legal_hold") {
      return actionFailure(
        "Documents under legal hold cannot be deleted.",
        undefined,
        "document_legal_hold",
      );
    }

    if (error.code === "not_on_legal_hold") {
      return actionFailure(
        "Document is not under legal hold.",
        undefined,
        "document_not_on_legal_hold",
      );
    }

    if (error.code === "scan_not_releasable") {
      return actionFailure(
        "Only quarantined or failed scans can be released by an operator.",
        undefined,
        "document_scan_not_releasable",
      );
    }
  }

  return actionFailure(
    error instanceof Error ? error.message : "Document mutation failed.",
    undefined,
    "document_mutation_failed",
  );
}

export async function applyLegalHoldToTenantDocumentAction(
  _previous: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = tenantDocumentLifecycleFormSchema.safeParse({
    documentId: formData.get("documentId"),
    moduleId: formData.get("moduleId"),
  });

  if (!parsed.success) {
    return zodActionFailure(parsed.error);
  }

  try {
    const context = await requireTenantDocumentWrite(
      parsed.data.moduleId as ModuleId,
    );

    await applyLegalHoldToTenantDocumentCommand({
      organizationId: context.organizationId,
      documentId: parsed.data.documentId,
      moduleId: parsed.data.moduleId as ModuleId,
      actorAuthUserId: context.userId,
    });

    revalidatePath(`/${parsed.data.moduleId}`);
    return systemAdminActionSuccess(undefined);
  } catch (error) {
    return toLifecycleActionFailure(error);
  }
}

export async function releaseLegalHoldToTenantDocumentAction(
  _previous: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = tenantDocumentLifecycleFormSchema.safeParse({
    documentId: formData.get("documentId"),
    moduleId: formData.get("moduleId"),
  });

  if (!parsed.success) {
    return zodActionFailure(parsed.error);
  }

  try {
    const context = await requireTenantDocumentWrite(
      parsed.data.moduleId as ModuleId,
    );

    await releaseLegalHoldToTenantDocumentCommand({
      organizationId: context.organizationId,
      documentId: parsed.data.documentId,
      moduleId: parsed.data.moduleId as ModuleId,
      actorAuthUserId: context.userId,
    });

    revalidatePath(`/${parsed.data.moduleId}`);
    return systemAdminActionSuccess(undefined);
  } catch (error) {
    return toLifecycleActionFailure(error);
  }
}

export async function releaseTenantDocumentScanQuarantineAction(
  _previous: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = tenantDocumentLifecycleFormSchema.safeParse({
    documentId: formData.get("documentId"),
    moduleId: formData.get("moduleId"),
  });

  if (!parsed.success) {
    return zodActionFailure(parsed.error);
  }

  try {
    const context = await requireTenantDocumentWrite(
      parsed.data.moduleId as ModuleId,
    );

    await releaseTenantDocumentScanQuarantineCommand({
      organizationId: context.organizationId,
      documentId: parsed.data.documentId,
      moduleId: parsed.data.moduleId as ModuleId,
      actorAuthUserId: context.userId,
    });

    revalidatePath(`/${parsed.data.moduleId}`);
    revalidatePath("/system-admin/security");
    return systemAdminActionSuccess(undefined);
  } catch (error) {
    return toLifecycleActionFailure(error);
  }
}

export async function deleteTenantDocumentAction(
  _previous: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = tenantDocumentLifecycleFormSchema.safeParse({
    documentId: formData.get("documentId"),
    moduleId: formData.get("moduleId"),
  });

  if (!parsed.success) {
    return zodActionFailure(parsed.error);
  }

  try {
    const context = await requireTenantDocumentWrite(
      parsed.data.moduleId as ModuleId,
    );

    await deleteTenantDocumentCommand({
      organizationId: context.organizationId,
      documentId: parsed.data.documentId,
      moduleId: parsed.data.moduleId as ModuleId,
      actorAuthUserId: context.userId,
    });

    revalidatePath(`/${parsed.data.moduleId}`);
    return systemAdminActionSuccess(undefined);
  } catch (error) {
    return toLifecycleActionFailure(error);
  }
}
