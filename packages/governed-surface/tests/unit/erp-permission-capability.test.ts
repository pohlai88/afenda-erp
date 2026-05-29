import { describe, expect, it } from "vitest";

import { resolveErpCapabilityForPermission } from "../../src/erp-permission-capability.shared";

describe("resolveErpCapabilityForPermission", () => {
  it("maps module read to view capability", () => {
    expect(
      resolveErpCapabilityForPermission({
        module: "sales",
        object: "records",
        function: "read",
      }),
    ).toBe("sales.view");
  });

  it("maps system-admin read to object-scoped capability when defined", () => {
    expect(
      resolveErpCapabilityForPermission({
        module: "system-admin",
        object: "audit",
        function: "read",
      }),
    ).toBe("system-admin.audit.read");
  });

  it("maps mutating functions to documents.write", () => {
    expect(
      resolveErpCapabilityForPermission({
        module: "hr",
        object: "records",
        function: "update",
      }),
    ).toBe("hr.documents.write");
  });

  it("returns null for predict when module has no lynx capability", () => {
    expect(
      resolveErpCapabilityForPermission({
        module: "sales",
        object: "records",
        function: "predict",
      }),
    ).toBeNull();
  });

  it("maps predict on system-admin to lynx.read", () => {
    expect(
      resolveErpCapabilityForPermission({
        module: "system-admin",
        object: "lynx",
        function: "predict",
      }),
    ).toBe("system-admin.lynx.read");
  });
});
