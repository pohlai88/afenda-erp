import { routeErrorCopy } from "@afenda/kernel";
import { RouteStatePanel } from "@/app-route-state/route-states";

export default function AppNotFound() {
  return (
    <RouteStatePanel
      action={{
        label: routeErrorCopy.appNotFound.actionLabel,
        href: "/dashboard",
      }}
      description={routeErrorCopy.appNotFound.description}
      title={routeErrorCopy.appNotFound.title}
    />
  );
}
