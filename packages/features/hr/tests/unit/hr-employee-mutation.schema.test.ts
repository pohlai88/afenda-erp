import { describe, expect, it } from "vitest";
import {
  hrArchiveEmployeeActionSchema,
  hrCreateEmployeeActionSchema,
} from "../../src/workforce/employees/schemas/hr-employee-mutation.schema";

describe("hr employee mutation schemas", () => {
  it("accepts minimal create payload", () => {
    const parsed = hrCreateEmployeeActionSchema.safeParse({
      employeeNumber: "E-100",
      legalName: "Alex Morgan",
    });
    expect(parsed.success).toBe(true);
  });

  it("rejects archive without employee id", () => {
    const parsed = hrArchiveEmployeeActionSchema.safeParse({});
    expect(parsed.success).toBe(false);
  });
});
