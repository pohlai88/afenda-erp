import { authNotFoundCopy } from "@afenda/kernel";
import { RouteStatePanel } from "@/app-route-state/route-states";

export default function AuthNotFound() {
  return (
    <RouteStatePanel
      action={{
        label: authNotFoundCopy.actionLabel,
        href: "/sign-in",
      }}
      description={authNotFoundCopy.description}
      title={authNotFoundCopy.title}
    />
  );
}
