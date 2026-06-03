import { z } from "zod";
import { objectStorageRouteCopy } from "../contracts/upload-route-copy.shared";

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
      message: objectStorageRouteCopy.invalidRequest,
    };
  }

  return {
    status: 500,
    message: objectStorageRouteCopy.uploadFailed,
  };
}

/** @deprecated Use getUploadRouteErrorResponse */
export const getBlobRouteErrorResponse = getUploadRouteErrorResponse;
