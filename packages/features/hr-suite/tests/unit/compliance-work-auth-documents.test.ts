import { describe, expect, it } from "vitest";

import {
  deriveEffectiveWorkAuthDocumentStatus,
  isWorkAuthDocumentExpiring,
  isWorkAuthDocumentMissing,
  normalizeWorkAuthStatusForTrailingSelect,
  resolveWorkAuthDocumentVerifiedAt,
} from "../../src/employee-management/compliance-regulatory-tracking/data/hr.workforce.compliance-work-auth-documents.shared";
import { resolveWorkAuthDocumentListBadgeTone } from "../../src/employee-management/compliance-regulatory-tracking/surface/hr.workforce.compliance-list.shared";
import { normalizeWorkAuthDocumentStatus, parseEffectiveWorkAuthDocumentStatusSearchToken } from "@afenda/db";

describe("work authorization document status derivation", () => {
  const now = new Date("2026-06-01T00:00:00.000Z");

  it("returns terminal statuses unchanged", () => {
    expect(
      deriveEffectiveWorkAuthDocumentStatus({
        status: "rejected",
        expiresAt: new Date("2020-01-01T00:00:00.000Z"),
        now,
      }),
    ).toBe("rejected");
  });

  it("flags missing when stored status is verified without document number", () => {
    expect(
      deriveEffectiveWorkAuthDocumentStatus({
        status: "verified",
        documentNumber: null,
        expiresAt: new Date("2027-01-01T00:00:00.000Z"),
        now,
      }),
    ).toBe("missing");
  });

  it("flags missing when stored status is pending verification without document number", () => {
    expect(
      deriveEffectiveWorkAuthDocumentStatus({
        status: "pending_verification",
        documentNumber: "   ",
        expiresAt: null,
        now,
      }),
    ).toBe("missing");
  });

  it("preserves explicit missing status", () => {
    expect(
      deriveEffectiveWorkAuthDocumentStatus({
        status: "missing",
        documentNumber: null,
        expiresAt: null,
        now,
      }),
    ).toBe("missing");
    expect(
      isWorkAuthDocumentMissing({
        status: "missing",
        documentNumber: null,
      }),
    ).toBe(true);
  });

  it("derives expired when verified document is past expiry", () => {
    expect(
      deriveEffectiveWorkAuthDocumentStatus({
        status: "verified",
        documentNumber: "WP-100",
        expiresAt: new Date("2026-01-01T00:00:00.000Z"),
        now,
      }),
    ).toBe("expired");
  });

  it("derives expired when pending verification document is past expiry", () => {
    expect(
      deriveEffectiveWorkAuthDocumentStatus({
        status: "pending_verification",
        documentNumber: "WP-200",
        expiresAt: new Date("2026-01-01T00:00:00.000Z"),
        now,
      }),
    ).toBe("expired");
  });

  it("preserves verified status when expiry is in the future beyond the at-risk window", () => {
    expect(
      deriveEffectiveWorkAuthDocumentStatus({
        status: "verified",
        documentNumber: "WP-300",
        expiresAt: new Date("2027-01-01T00:00:00.000Z"),
        now,
      }),
    ).toBe("verified");
  });

  it("derives expiring when verified document expires within 14 days", () => {
    expect(
      deriveEffectiveWorkAuthDocumentStatus({
        status: "verified",
        documentNumber: "WP-400",
        expiresAt: new Date("2026-06-10T00:00:00.000Z"),
        now,
      }),
    ).toBe("expiring");
  });

  it("sets verifiedAt when status is verified and no explicit timestamp", () => {
    expect(
      resolveWorkAuthDocumentVerifiedAt({
        status: "verified",
      }),
    ).toBeInstanceOf(Date);
  });

  it("preserves existing verifiedAt when verified status is unchanged", () => {
    const existing = new Date("2026-01-01T00:00:00.000Z");
    expect(
      resolveWorkAuthDocumentVerifiedAt({
        status: "verified",
        existingVerifiedAt: existing,
      }),
    ).toEqual(existing);
  });

  it("clears verifiedAt when status is not verified", () => {
    expect(
      resolveWorkAuthDocumentVerifiedAt({
        status: "missing",
      }),
    ).toBeNull();
  });

  it("maps expired display status to critical badge tone", () => {
    expect(resolveWorkAuthDocumentListBadgeTone("expired")).toBe("critical");
  });

  it("maps expiring display status to attention badge tone", () => {
    expect(resolveWorkAuthDocumentListBadgeTone("expiring")).toBe("attention");
  });

  it("maps missing display status to attention badge tone", () => {
    expect(resolveWorkAuthDocumentListBadgeTone("missing")).toBe("attention");
  });
});

describe("normalizeWorkAuthDocumentStatus", () => {
  it("coerces pending verification without document number to missing", () => {
    expect(
      normalizeWorkAuthDocumentStatus({
        status: "pending_verification",
        documentNumber: null,
      }),
    ).toBe("missing");
  });

  it("preserves waived status without document number", () => {
    expect(
      normalizeWorkAuthDocumentStatus({
        status: "waived",
        documentNumber: null,
      }),
    ).toBe("waived");
  });
});

describe("parseEffectiveWorkAuthDocumentStatusSearchToken", () => {
  it("recognizes derived missing, expiring, and expired search tokens", () => {
    expect(parseEffectiveWorkAuthDocumentStatusSearchToken("missing")).toBe(
      "missing",
    );
    expect(parseEffectiveWorkAuthDocumentStatusSearchToken("expiring")).toBe(
      "expiring",
    );
    expect(parseEffectiveWorkAuthDocumentStatusSearchToken("at risk")).toBe(
      "expiring",
    );
    expect(parseEffectiveWorkAuthDocumentStatusSearchToken("expired")).toBe(
      "expired",
    );
    expect(parseEffectiveWorkAuthDocumentStatusSearchToken("passport")).toBeNull();
  });
});

describe("isWorkAuthDocumentExpiring", () => {
  const now = new Date("2026-06-01T00:00:00.000Z");

  it("flags documents expiring within the at-risk window", () => {
    expect(
      isWorkAuthDocumentExpiring({
        status: "verified",
        documentNumber: "WP-500",
        expiresAt: new Date("2026-06-10T00:00:00.000Z"),
        now,
      }),
    ).toBe(true);
  });
});

describe("normalizeWorkAuthStatusForTrailingSelect", () => {
  it("maps derived missing posture to trailing select value", () => {
    expect(
      normalizeWorkAuthStatusForTrailingSelect({
        effectiveStatus: "missing",
        storedStatus: "verified",
      }),
    ).toBe("missing");
  });

  it("maps derived expired posture back to stored status for trailing select", () => {
    expect(
      normalizeWorkAuthStatusForTrailingSelect({
        effectiveStatus: "expired",
        storedStatus: "verified",
      }),
    ).toBe("verified");
  });

  it("maps derived expiring posture back to stored status for trailing select", () => {
    expect(
      normalizeWorkAuthStatusForTrailingSelect({
        effectiveStatus: "expiring",
        storedStatus: "verified",
      }),
    ).toBe("verified");
  });
});
