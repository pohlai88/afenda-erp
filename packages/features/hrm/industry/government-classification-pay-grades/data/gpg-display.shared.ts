import type { GpgClassificationRow } from "./gpg.types.shared"
import type { GpgPayBandRow } from "./gpg.types.shared"
import type { GpgPayGradeRow } from "./gpg.types.shared"

export function formatGpgClassificationLabel(
  row: Pick<GpgClassificationRow, "code" | "name">
) {
  return `${row.code} — ${row.name}`
}

export function formatGpgPayGradeLabel(
  row: Pick<GpgPayGradeRow, "code" | "name">
) {
  return `${row.code} — ${row.name}`
}

export function formatGpgPayBandLabel(
  row: Pick<GpgPayBandRow, "code" | "name">
) {
  return `${row.code} — ${row.name}`
}

export function formatGpgGsSesRefs(
  row: Pick<
    GpgPayGradeRow,
    "gsEquivalent" | "sesEquivalent" | "civilServiceGradeRef" | "rankEquivalent"
  >
) {
  const parts: string[] = []
  if (row.gsEquivalent) parts.push(`GS ${row.gsEquivalent}`)
  if (row.sesEquivalent) parts.push(`SES ${row.sesEquivalent}`)
  if (row.civilServiceGradeRef) parts.push(row.civilServiceGradeRef)
  if (row.rankEquivalent) parts.push(row.rankEquivalent)
  return parts.length > 0 ? parts.join(" · ") : "—"
}
