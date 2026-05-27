import { APICallError } from "ai";

export type AiRouteError = {
  message: string;
  status: number;
  retryAfter?: string;
};

export function getAiRouteError(error: unknown): AiRouteError | null {
  if (!APICallError.isInstance(error)) {
    return null;
  }

  const retryAfter = error.responseHeaders?.["retry-after"];

  switch (error.statusCode) {
    case 402:
      return {
        message: "AI Gateway budget limit reached. Try again later.",
        status: 402,
        retryAfter,
      };
    case 429:
      return {
        message: "AI Gateway rate limit reached. Try again later.",
        status: 429,
        retryAfter,
      };
    case 503:
      return {
        message: "AI Gateway is temporarily unavailable.",
        status: 503,
        retryAfter,
      };
    default:
      return null;
  }
}
