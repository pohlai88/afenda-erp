import { uploadRouteCopy } from "@afenda/kernel";
import { z } from "zod";

export class UploadRouteError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "UploadRouteError";
    this.status = status;
  }
}

export function getUploadRouteErrorResponse(error: unknown) {
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

/** @deprecated Use getUploadRouteErrorResponse */
export const getBlobRouteErrorResponse = getUploadRouteErrorResponse;
