import type { HrGeoSpoofingSignals } from "@afenda/db";

/** HRM-GEO-015 — client-side spoofing signal collection (no continuous tracking). */
export function collectHrGeoClientSpoofingSignals(input: {
  mockProvider?: boolean;
  accuracyMeters?: number | null;
  capturedAtMs?: number;
  serverNowMs?: number;
}): HrGeoSpoofingSignals {
  const signals: HrGeoSpoofingSignals = {};
  if (input.mockProvider) {
    signals.mockProvider = true;
    signals.clientFlags = ["mock_provider"];
  }
  if (input.accuracyMeters !== undefined && input.accuracyMeters !== null && input.accuracyMeters <= 1) {
    signals.accuracyTooGood = true;
  }
  if (input.capturedAtMs && input.serverNowMs) {
    const driftSeconds = Math.abs((input.serverNowMs - input.capturedAtMs) / 1000);
    if (driftSeconds > 120) {
      signals.timestampDriftSeconds = driftSeconds;
    }
  }
  return signals;
}

export { mergeHrGeoSpoofingSignals, hasHrGeoSpoofingRisk } from "@afenda/db";
