import { authLoadingCopy } from "@afenda/domain";
import { RouteStatePanel } from "@/components/route-states";

export default function AuthLoading() {
  return (
    <RouteStatePanel
      description={authLoadingCopy.description}
      title={authLoadingCopy.title}
    />
  );
}
