import { parseListSurfaceRendererConfiguration } from "@afenda/governed-surface/schemas";
import { describe, expect, it } from "vitest";

import { evaluateSecurityReadiness } from "../../src/security/data/system-admin.security.readiness.server";
import {
  buildSystemAdminSecuritySettingsListSurface,
  systemAdminSecurityGalleryEncryptionSettings,
  systemAdminSecurityGalleryProviders,
} from "../../src/security/metadata";

describe("system admin security gallery surfaces", () => {
  it("parses platform encryption posture rows", () => {
    const surface = buildSystemAdminSecuritySettingsListSurface({
      security: null,
      readiness: evaluateSecurityReadiness(null),
      objectStorageProvider: null,
      deploymentProvider: systemAdminSecurityGalleryProviders.deploymentR2,
      encryptionSettings: systemAdminSecurityGalleryEncryptionSettings.platform,
    });

    const parsed = parseListSurfaceRendererConfiguration(surface);
    expect(parsed.success).toBe(true);
    expect(surface.rows.some((row) => row.id === "object-storage-encryption-mode")).toBe(
      true,
    );
    expect(surface.rows.some((row) => row.id === "object-storage-kms-adapter")).toBe(
      true,
    );
  });

  it("parses vault BYOK posture fixture", () => {
    const surface = buildSystemAdminSecuritySettingsListSurface({
      security: null,
      readiness: evaluateSecurityReadiness(null),
      objectStorageProvider: systemAdminSecurityGalleryProviders.deploymentR2,
      deploymentProvider: systemAdminSecurityGalleryProviders.deploymentR2,
      encryptionSettings: systemAdminSecurityGalleryEncryptionSettings.vaultByok,
    });

    const encryptionRow = surface.rows.find(
      (row) => row.id === "object-storage-encryption-mode",
    );
    expect(encryptionRow?.cells.value).toBe("Customer-managed (envelope)");
  });

  it("parses S3 provider posture fixture", () => {
    const surface = buildSystemAdminSecuritySettingsListSurface({
      security: null,
      readiness: evaluateSecurityReadiness(null),
      objectStorageProvider: systemAdminSecurityGalleryProviders.orgS3,
      deploymentProvider: systemAdminSecurityGalleryProviders.deploymentR2,
      encryptionSettings: systemAdminSecurityGalleryEncryptionSettings.awsByok,
    });

    const providerRow = surface.rows.find((row) => row.id === "object-storage-provider");
    expect(providerRow?.cells.value).toBe("Amazon S3 (SSE-KMS)");
  });
});
