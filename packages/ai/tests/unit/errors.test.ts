import { APICallError } from "ai";
import { describe, expect, it } from "vitest";
import { getAiRouteError } from "../../src/errors/ai.gateway.error";

function createGatewayError(statusCode: number, retryAfter?: string) {
  return new APICallError({
    message: "Gateway error",
    url: "https://ai-gateway.vercel.sh/v1/responses",
    requestBodyValues: {},
    statusCode,
    responseHeaders: retryAfter ? { "retry-after": retryAfter } : undefined,
  });
}

describe("getAiRouteError", () => {
  it("maps gateway rate limits with retry headers", () => {
    expect(getAiRouteError(createGatewayError(429, "30"))).toEqual({
      message: "AI Gateway rate limit reached. Try again later.",
      status: 429,
      retryAfter: "30",
    });
  });

  it("maps budget and availability gateway errors", () => {
    expect(getAiRouteError(createGatewayError(402))).toMatchObject({
      status: 402,
    });
    expect(getAiRouteError(createGatewayError(503))).toMatchObject({
      status: 503,
    });
  });

  it("ignores unrelated errors", () => {
    expect(getAiRouteError(new Error("nope"))).toBeNull();
    expect(getAiRouteError(createGatewayError(500))).toBeNull();
  });
});
