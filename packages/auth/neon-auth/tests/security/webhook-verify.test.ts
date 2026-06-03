import { describe, expect, it } from "vitest";
import { verifyNeonAuthWebhookPayload } from "../../security/webhook-verify.server";

describe("neon-auth webhook verify", () => {
  it("rejects missing signature headers", async () => {
    await expect(
      verifyNeonAuthWebhookPayload({ rawBody: "{}", headers: new Headers() }),
    ).rejects.toThrow(/Missing/);
  });
});
