import { authLoadingCopy } from "@afenda/kernel";

import { RouteLoadingFallback } from "@/routes/route-state";

export function AuthRouteFallback() {
  return (
    <RouteLoadingFallback
      description={authLoadingCopy.description}
      title={authLoadingCopy.title}
    />
  );
}
