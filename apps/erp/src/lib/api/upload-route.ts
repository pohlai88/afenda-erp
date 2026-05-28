import { moduleIds } from "@afenda/config/module-ids";
import { uploadRouteCopy } from "@afenda/kernel";
import { z } from "zod";
import {
  documentUploadContentTypes,
  documentUploadMaxSizeBytes,
} from "@/lib/document-upload-policy";

export const uploadAccessSchema = z.enum(["private", "public"]);

export const uploadPayloadSchema = z.object({
  moduleId: z.enum(moduleIds),
  title: z.string().trim().min(1).max(160),
  ownerEntityId: z.string().trim().min(1).max(160).optional(),
  contentType: z.enum(documentUploadContentTypes),
  sizeBytes: z.number().int().positive().max(documentUploadMaxSizeBytes),
  access: uploadAccessSchema.default("private"),
});

export type UploadTokenPayload = z.infer<typeof uploadPayloadSchema> & {
  organizationId: string;
  uploadedByAuthUserId: string;
};

export class UploadRouteError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "UploadRouteError";
    this.status = status;
  }
}

export function assertUploadTokenMatchesSession(
  payload: UploadTokenPayload,
  organization: { id: string },
  session: { id: string },
) {
  if (
    payload.organizationId !== organization.id ||
    payload.uploadedByAuthUserId !== session.id
  ) {
    throw new UploadRouteError(403, uploadRouteCopy.tokenMismatch);
  }
}

export function getBlobRouteErrorResponse(error: unknown) {
  if (error instanceof UploadRouteError) {
    return {
      status: error.status,
      message: error.message,
    };
  }

  if (error instanceof z.ZodError || error instanceof SyntaxError) {
    return {
      status: 400,
      message: uploadRouteCopy.invalidRequest,
    };
  }

  return {
    status: 500,
    message: uploadRouteCopy.uploadFailed,
  };
}

/** @deprecated Use getBlobRouteErrorResponse */
export const getUploadErrorResponse = getBlobRouteErrorResponse;
