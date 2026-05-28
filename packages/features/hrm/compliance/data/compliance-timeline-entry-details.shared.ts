import type {
  ComplianceTimelineEntry,
  ComplianceTimelineKind,
} from "./compliance-timeline.shared"
import { authorityForStatutoryPack } from "./statutory-event-types.shared"

export type ComplianceTimelineFacetLabels = {
  attempts: string
  httpStatus: string
  durationMs: string
  authority: string
  externalReference: string
  authorityPayloadHash: string
  inputHash: string
  outputHash: string
  packType: string
  countryCode: string
  rulePackVersion: string
  retryReason: string
  ageDays: string
  stuckThresholdDays: string
  tierThresholdDays: string
  severityTier: string
  format: string
  responseHash: string
  priorInputHash: string
  priorOutputHash: string
  priorRulePackVersion: string
  priorSubmissionState: string
  priorExternalReference: string
  priorAcknowledgedAt: string
}

function shortHash(value: string | null | undefined): string | null {
  if (!value) return null
  return value.length <= 8 ? value : value.slice(0, 8)
}

export function complianceTimelineRowTone(
  kind: ComplianceTimelineKind
): "default" | "attention" | "critical" {
  switch (kind) {
    case "delivery_failed":
    case "retry_exhausted":
    case "aging_critical":
      return "critical"
    case "acknowledged":
      return "default"
    default:
      return "attention"
  }
}

export function formatComplianceTimelineEntryDetails(
  entry: ComplianceTimelineEntry,
  packType: string | null,
  labels: ComplianceTimelineFacetLabels
): string {
  const meta = entry.metadata ?? {}
  const facets: string[] = []

  function pushString(label: string, raw: unknown): void {
    if (typeof raw === "string" && raw.trim().length > 0) {
      facets.push(`${label}: ${raw}`)
    }
  }
  function pushNumber(label: string, raw: unknown): void {
    if (typeof raw === "number" && Number.isFinite(raw)) {
      facets.push(`${label}: ${String(raw)}`)
    }
  }
  function pushHash(label: string, raw: unknown): void {
    if (typeof raw === "string" && raw.length > 0) {
      facets.push(`${label}: ${shortHash(raw) ?? raw}`)
    }
  }

  switch (entry.kind) {
    case "generated": {
      pushString(labels.packType, meta.packType)
      pushString(labels.countryCode, meta.countryCode)
      pushString(labels.rulePackVersion, meta.rulePackVersion)
      pushHash(labels.inputHash, meta.inputHash)
      pushHash(labels.outputHash, meta.outputHash)
      break
    }
    case "submitted_to_bureau":
    case "delivery_failed": {
      pushNumber(labels.attempts, meta.attempts)
      pushNumber(labels.httpStatus, meta.httpStatus)
      pushNumber(labels.durationMs, meta.durationMs)
      break
    }
    case "retry_attempted":
    case "retry_exhausted": {
      pushNumber(labels.attempts, meta.attempts)
      pushString(labels.retryReason, meta.errorMessage ?? meta.reason)
      break
    }
    case "aging_detected":
    case "aging_escalated":
    case "aging_critical": {
      pushNumber(labels.ageDays, meta.ageDays)
      pushNumber(
        labels.tierThresholdDays,
        meta.tierThresholdDays ?? meta.stuckThresholdDays
      )
      pushString(labels.severityTier, meta.severityTier)
      pushString(labels.rulePackVersion, meta.rulePackVersion)
      break
    }
    case "acknowledged": {
      const authority =
        (typeof meta.authorityName === "string" && meta.authorityName) ||
        authorityForStatutoryPack(packType ?? "") ||
        null
      if (authority) facets.push(`${labels.authority}: ${authority}`)
      pushString(labels.externalReference, meta.externalReference)
      pushHash(labels.authorityPayloadHash, meta.authorityPayloadHash)
      break
    }
    case "pack_exported": {
      pushString(labels.format, meta.format)
      pushHash(labels.responseHash, meta.responseHash)
      pushString(labels.packType, meta.packType)
      pushString(labels.rulePackVersion, meta.rulePackVersion)
      break
    }
    case "regenerated": {
      pushString(labels.packType, meta.packType)
      pushHash(labels.priorInputHash, meta.priorInputHash)
      pushHash(labels.priorOutputHash, meta.priorOutputHash)
      pushString(labels.priorRulePackVersion, meta.priorRulePackVersion)
      pushString(labels.priorSubmissionState, meta.priorSubmissionState)
      pushString(labels.priorExternalReference, meta.priorExternalReference)
      pushString(
        labels.priorAcknowledgedAt,
        typeof meta.priorAcknowledgedAt === "string"
          ? meta.priorAcknowledgedAt.replace(/\.\d{3}Z$/u, "Z")
          : meta.priorAcknowledgedAt
      )
      break
    }
  }

  return facets.length > 0 ? facets.join(" · ") : "—"
}
