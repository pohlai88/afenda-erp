import { requireCapability } from "../server";

import { buildLynxRunLedgerExportCsv } from "../read-models/lynx.run-ledger-export.read-model.server";

export async function handleLynxRunsExportGet(request: Request): Promise<Response> {
  const { organization } = await requireCapability("system-admin.lynx.read");
  const url = new URL(request.url);
  const csv = await buildLynxRunLedgerExportCsv({
    organizationId: organization.id,
    searchParams: Object.fromEntries(url.searchParams.entries()),
  });

  return new Response(csv, {
    headers: {
      "Cache-Control": "no-store",
      "Content-Disposition": `attachment; filename="lynx-run-audit-${new Date()
        .toISOString()
        .slice(0, 10)}.csv"`,
      "Content-Type": "text/csv; charset=utf-8",
    },
  });
}
