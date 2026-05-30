import type { OrganizationRole } from "@afenda/auth";
import {
  Avatar,
  AvatarFallback,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Separator,
  StatusBadge,
  type Tone,
} from "@afenda/ui";

function initialsFromLabel(label: string, max = 2) {
  const parts = label.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return "—";
  }
  return parts
    .slice(0, max)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function postureToneForRole(role: OrganizationRole): Tone {
  if (role === "owner" || role === "admin") {
    return "positive";
  }
  if (role === "viewer") {
    return "neutral";
  }
  return "neutral";
}

export function WorkspaceOrgPanel({
  organizationName,
  organizationSlug,
  postureTitle,
  postureDescription,
  role,
  activeRouteCount,
}: {
  organizationName: string;
  organizationSlug: string;
  postureTitle: string;
  postureDescription: string;
  role: OrganizationRole;
  activeRouteCount: number;
}) {
  const orgInitials = initialsFromLabel(organizationName);

  return (
    <div className="flex flex-col gap-surface-2xl">
      <div className="flex items-center gap-surface-md">
        <div
          aria-hidden
          className="flex size-10 shrink-0 items-center justify-center rounded-control bg-primary text-primary-foreground type-label"
        >
          A
        </div>
        <div className="min-w-0">
          <div className="type-subtitle text-foreground">Afenda</div>
          <div className="type-caption">Operational workspace</div>
        </div>
      </div>

      <Card className="overflow-hidden shadow-elevation-1">
        <div className="h-1 bg-primary" aria-hidden />
        <CardHeader>
          <p className="type-label">
            Active tenant
          </p>
          <div className="mt-surface-md flex items-start gap-surface-md">
            <Avatar size="lg">
              <AvatarFallback className="bg-primary/10 text-primary type-label font-semibold">
                {orgInitials}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <CardTitle className="truncate">{organizationName}</CardTitle>
              <p className="mt-1 type-mono-muted">
                {organizationSlug}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge label={postureTitle} tone={postureToneForRole(role)} />
          </div>
          <p className="mt-surface-md type-muted leading-relaxed">
            {postureDescription}
          </p>

          <dl className="mt-surface-lg grid grid-cols-2 gap-surface-sm rounded-section border border-border bg-muted/30 p-surface-md">
            <div>
              <dt className="type-caption">Routes</dt>
              <dd className="mt-1 type-body font-semibold tabular-nums text-foreground">
                {activeRouteCount}
              </dd>
            </div>
            <div>
              <dt className="type-caption">Access</dt>
              <dd className="mt-1 type-caption font-medium text-foreground">
                Scoped
              </dd>
            </div>
          </dl>
        </CardContent>
      </Card>
    </div>
  );
}

export function WorkspaceCommandHeader({
  organizationName,
  organizationSlug,
  activeRouteCount,
  sessionName,
  sessionEmail,
  signOutAction,
}: {
  organizationName: string;
  organizationSlug: string;
  activeRouteCount: number;
  sessionName: string;
  sessionEmail: string;
  signOutAction: () => Promise<void>;
}) {
  const userInitials = initialsFromLabel(sessionName, 2);

  return (
    <div className="@container flex flex-col gap-surface-lg @lg:flex-row @lg:items-center @lg:justify-between">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span
            aria-hidden
            className="inline-flex size-2 shrink-0 rounded-full bg-success ring-2 ring-success/30"
          />
          <span className="type-label">Workspace</span>
        </div>
        <h1 className="mt-1 truncate type-section-title text-foreground">
          {organizationName}
        </h1>
        <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 type-muted">
          <span className="type-mono-cell">{organizationSlug}</span>
          <span aria-hidden className="text-muted-foreground">
            ·
          </span>
          <span>
            {activeRouteCount} active route{activeRouteCount === 1 ? "" : "s"}
          </span>
        </p>
      </div>

      <div className="@container flex shrink-0 items-center gap-surface-sm rounded-panel border border-border bg-muted/30 p-2 pl-3 shadow-elevation-1">
        <Avatar size="sm">
          <AvatarFallback className="bg-primary/10 text-primary type-label font-semibold">
            {userInitials}
          </AvatarFallback>
        </Avatar>
        <div className="hidden min-w-0 max-w-56 @sm:block">
          <div className="truncate type-body font-medium text-foreground">
            {sessionName}
          </div>
          <div className="truncate type-caption">{sessionEmail}</div>
        </div>
        <Separator
          className="mx-1 hidden h-9 @sm:block"
          orientation="vertical"
        />
        <form action={signOutAction}>
          <Button size="sm" type="submit" variant="outline">
            Sign out
          </Button>
        </form>
      </div>
    </div>
  );
}
