import { authLoadingCopy } from "@afenda/kernel";
import { RouteStatePanel } from "@/app-route-state/route-states";

export default function AuthLoading() {
  return (
    <RouteStatePanel
      description={authLoadingCopy.description}
      title={authLoadingCopy.title}
    />
  );
}
