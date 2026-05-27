import { routeErrorCopy } from "@afenda/domain";
import { RouteStatePanel } from "@/components/route-states";

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
