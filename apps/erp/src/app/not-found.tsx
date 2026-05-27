import { RouteStatePanel } from "@/components/route-states";

export default function RootNotFound() {
  return (
    <RouteStatePanel
      action={{ label: "Go to sign in", href: "/sign-in" }}
      description="The page you requested does not exist or may have moved."
      title="Page not found"
    />
  );
}
