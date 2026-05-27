import { moduleIds } from "@afenda/config/module-ids";
import { uploadRouteCopy } from "@afenda/domain";
import { describe, expect, it } from "vitest";
import { z } from "zod";
import {
  getUploadErrorResponse,
  UploadRouteError,
  uploadAccessSchema,
  uploadPayloadSchema,
} from "@/lib/api/upload-route";

describe("upload route helpers", () => {
  it("validates upload payload schema", () => {
    const payload = uploadPayloadSchema.parse({
      moduleId: moduleIds[0],
      title: "Quarterly statement",
      contentType: "application/pdf",
      sizeBytes: 1024,
      access: "private",
    });

    expect(payload.access).toBe("private");
    expect(uploadAccessSchema.parse("public")).toBe("public");
  });

  it("maps upload route errors to status and message", () => {
    const response = getUploadErrorResponse(
      new UploadRouteError(403, uploadRouteCopy.uploadNotAllowed),
    );

    expect(response).toEqual({
      status: 403,
      message: uploadRouteCopy.uploadNotAllowed,
    });
  });

  it("maps zod errors to invalid request copy", () => {
    const response = getUploadErrorResponse(
      new z.ZodError([
        {
          code: "custom",
          message: "Invalid",
          path: ["title"],
        },
      ]),
    );

    expect(response).toEqual({
      status: 400,
      message: uploadRouteCopy.invalidRequest,
    });
  });

  it("maps unknown errors to upload failed copy", () => {
    const response = getUploadErrorResponse(new Error("blob unavailable"));

    expect(response).toEqual({
      status: 400,
      message: uploadRouteCopy.uploadFailed,
    });
  });
});
