import { getDocumentAvWebhookSecret } from "@afenda/config/env";

import {
  ReportTenantDocumentScanResultError,
  reportTenantDocumentScanResultCommand,
  reportTenantDocumentScanResultInputSchema,
} from "./sys-report-tenant-document-scan-result-command-server";

function authorizeDocumentAvWebhook(request: Request) {
  const webhookSecret = getDocumentAvWebhookSecret();
  const authorization = request.headers.get("authorization");

  return Boolean(webhookSecret && authorization === `Bearer ${webhookSecret}`);
}

export async function handleDocumentScanWebhookPost(
  request: Request,
): Promise<Response> {
  if (!authorizeDocumentAvWebhook(request)) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "invalid_json" }, { status: 400 });
  }

  const parsed = reportTenantDocumentScanResultInputSchema.safeParse(body);

  if (!parsed.success) {
    return Response.json(
      { error: "invalid_request", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  try {
    const status = await reportTenantDocumentScanResultCommand(parsed.data);

    return Response.json({ success: true, status });
  } catch (error) {
    if (error instanceof ReportTenantDocumentScanResultError) {
      const status =
        error.code === "document_not_found"
          ? 404
          : error.code === "scan_not_in_progress"
            ? 409
            : 400;

      return Response.json({ error: error.code }, { status });
    }

    throw error;
  }
}
