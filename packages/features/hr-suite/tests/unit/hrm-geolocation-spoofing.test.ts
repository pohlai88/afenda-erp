import { describe, expect, it } from "vitest";

import {
  collectHrGeoClientSpoofingSignals,
  hasHrGeoSpoofingRisk,
  mergeHrGeoSpoofingSignals,
} from "../../src/time-attendance/geolocation-remote-checkin/hr.time.geo-spoofing.shared";
import { collectHrGeoServerSpoofingSignals } from "@afenda/db";

describe("HRM-GEO spoofing detection", () => {
  it("collects client spoofing signals without continuous tracking", () => {
    const client = collectHrGeoClientSpoofingSignals({
      mockProvider: true,
      accuracyMeters: 0.5,
      capturedAtMs: Date.now() - 300_000,
      serverNowMs: Date.now(),
    });

    expect(client.mockProvider).toBe(true);
    expect(client.accuracyTooGood).toBe(true);
    expect(client.timestampDriftSeconds).toBeGreaterThan(120);
  });

  it("merges client and server spoofing signals", () => {
    const client = collectHrGeoClientSpoofingSignals({ mockProvider: true });
    const server = collectHrGeoServerSpoofingSignals({
      accuracyMeters: 0.4,
      capturedAt: new Date("2025-06-01T08:00:00.000Z"),
      serverNow: new Date("2025-06-01T08:10:00.000Z"),
      currentLat: 1.3521,
      currentLng: 103.8198,
      previousCheckin: {
        latitude: 3.139,
        longitude: 101.6869,
        capturedAt: new Date("2025-06-01T07:54:00.000Z"),
      },
    });

    const merged = mergeHrGeoSpoofingSignals(client, server);
    expect(hasHrGeoSpoofingRisk(merged)).toBe(true);
    expect(merged.impossibleVelocityKmh).toBeGreaterThan(900);
  });
});
