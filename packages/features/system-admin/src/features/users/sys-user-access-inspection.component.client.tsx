"use client";

import { formatSystemAdminListPreview } from "../overview/sys-list-preview.shared";
import { SystemAdminMetadataFieldStack } from "../overview/sys-metadata-field-stack.component.client";
import { Badge } from "@afenda/ui/badge";
import { Button } from "@afenda/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@afenda/ui/card";
import { ScrollArea } from "@afenda/ui/scroll-area";
import { Separator } from "@afenda/ui/separator";
import { XIcon } from "lucide-react";
import type { SystemAdminUserAccessInspection } from "./sys-users.contract";
import { systemAdminUsersUiCopy } from "./sys-users-ui.copy.shared";
import { systemAdminUserStatusBadgeVariant } from "./sys-users-status-badge.shared";

export function SystemAdminUserAccessInspectionPanel({
  inspection,
  onClose,
}: {
  inspection: SystemAdminUserAccessInspection;
  onClose: () => void;
}) {
  const copy = systemAdminUsersUiCopy.inspection;

  return (
    <Card className="w-full max-w-2xl border-line">
      <CardHeader className="flex flex-row items-start justify-between gap-surface-sm">
        <div className="flex flex-col gap-surface-xs">
          <CardTitle>{copy.title}</CardTitle>
          <p className="type-muted">
            {copy.subtitle(inspection.userLabel, inspection.email)}
          </p>
        </div>
        <Button type="button" size="icon-sm" variant="ghost" onClick={onClose}>
          <XIcon />
          <span className="sr-only">{systemAdminUsersUiCopy.trailing.closeInspection}</span>
        </Button>
      </CardHeader>
      <CardContent className="flex flex-col gap-surface-md">
        <p className="type-body">{inspection.accessImpact}</p>
        <div className="flex flex-wrap gap-surface-sm">
          <Badge variant={systemAdminUserStatusBadgeVariant[inspection.membershipStatus]}>
            {copy.statusPrefix}: {inspection.membershipStatus}
          </Badge>
          {inspection.assignedRoles.map((role) => (
            <Badge key={role} variant="secondary">
              {role}
            </Badge>
          ))}
        </div>
        <Separator />
        <SystemAdminMetadataFieldStack label={copy.effectivePermissions} mono>
          {formatSystemAdminListPreview(inspection.effectivePermissions, {
            emptyLabel: copy.emptyPermissions,
          })}
        </SystemAdminMetadataFieldStack>
        <SystemAdminMetadataFieldStack label={copy.enabledModules}>
          {formatSystemAdminListPreview(inspection.enabledModules, {
            emptyLabel: copy.emptyModules,
          })}
        </SystemAdminMetadataFieldStack>
        <ScrollArea className="max-h-32"> {/* audit-ds: ignore no-arbitrary-value — capability preview scroll viewport */}
          <SystemAdminMetadataFieldStack label={copy.accessibleCapabilities} mono>
            {formatSystemAdminListPreview(inspection.accessibleCapabilities)}
          </SystemAdminMetadataFieldStack>
        </ScrollArea>
        <ScrollArea className="max-h-32"> {/* audit-ds: ignore no-arbitrary-value — capability preview scroll viewport */}
          <SystemAdminMetadataFieldStack label={copy.blockedCapabilities} mono>
            {formatSystemAdminListPreview(inspection.blockedCapabilities)}
          </SystemAdminMetadataFieldStack>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
