import "server-only";

import type { AuthPageMetadataKey } from "@afenda/kernel";
import { cn } from "@afenda/ui/utils";

type AuthFlowLane = {
  readonly id: string;
  readonly label: string;
  readonly keys: readonly AuthPageMetadataKey[];
};

const AUTH_FLOW_LANES = [
  { id: "access", label: "Access", keys: ["signIn", "otp", "signUp"] },
  { id: "verify", label: "Verify", keys: ["verifyEmail"] },
  {
    id: "recover",
    label: "Recover",
    keys: ["forgotPassword", "resetPassword"],
  },
] as const satisfies readonly AuthFlowLane[];

function laneIsActive(
  lane: AuthFlowLane,
  pageKey: AuthPageMetadataKey,
): boolean {
  return lane.keys.includes(pageKey);
}

export function AuthFlowRail({ pageKey }: { pageKey?: AuthPageMetadataKey }) {
  if (!pageKey) {
    return null;
  }

  const activeIndex = AUTH_FLOW_LANES.findIndex((lane) =>
    laneIsActive(lane, pageKey),
  );

  if (activeIndex < 0) {
    return null;
  }

  return (
    <nav
      aria-label="Authentication flow"
      data-auth-component="flow-rail"
      data-auth-page-key={pageKey}
    >
      <ol className="flex flex-wrap items-center gap-2">
        {AUTH_FLOW_LANES.map((lane, index) => {
          const active = index === activeIndex;
          const complete = index < activeIndex;
          const pending = index > activeIndex;

          return (
            <li
              key={lane.id}
              data-auth-flow-lane={lane.id}
              data-auth-flow-state={
                active ? "active" : complete ? "complete" : "pending"
              }
              className="flex items-center gap-2"
            >
              <span
                aria-current={active ? "step" : undefined}
                className={cn(
                  "inline-flex items-center gap-2 rounded-control border px-2.5 py-1 type-label transition-colors",
                  active &&
                    "border-primary/35 bg-primary/10 text-primary",
                  complete &&
                    "border-success/35 bg-success/10 text-success",
                  pending && "border-line bg-card text-muted-foreground",
                )}
              >
                <span
                  aria-hidden
                  className={cn(
                    "flex size-4 items-center justify-center rounded-sm type-caption font-semibold",
                    active && "bg-primary text-primary-foreground",
                    complete && "bg-success text-success-foreground",
                    pending && "bg-muted text-muted-foreground",
                  )}
                >
                  {complete ? "✓" : index + 1}
                </span>
                {lane.label}
              </span>

              {index < AUTH_FLOW_LANES.length - 1 ? (
                <span
                  aria-hidden
                  className={cn(
                    "hidden h-px w-6 sm:block",
                    complete ? "bg-success/60" : "bg-line",
                  )}
                />
              ) : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
