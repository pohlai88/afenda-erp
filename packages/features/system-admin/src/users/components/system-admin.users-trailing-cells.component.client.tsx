"use client";

import {
  ActionFormErrors,
  GovernedTrailingActionSlot,
  isListSurfaceTrailingActionRenderable,
  type GovernedListTrailingCellProps,
} from "@afenda/governed-surface/client";
import { SystemAdminOneTimeSecretPanel } from "../../overview/components/system-admin.one-time-secret.component.client";
import { SystemAdminTrailingActionStack } from "../../overview/components/system-admin.trailing-action-stack.component.client";
import { systemAdminRoutePaths } from "../../overview/contracts/system-admin.route-paths.contract";
import { Button } from "@afenda/ui/button";
import Link from "next/link";
import {
  BanIcon,
  RotateCcwIcon,
  SearchIcon,
  SendIcon,
  ShieldOffIcon,
  UserMinusIcon,
} from "lucide-react";
import { useState, useTransition } from "react";
import { SystemAdminDestructiveConfirmButton } from "../../overview/components/system-admin.destructive-confirm-button.component.client";
import type { SystemAdminActionResult } from "../../tenant-execution/contracts/system-admin.action-result.contract";
import {
  cancelSystemAdminInvitation,
  inspectSystemAdminUserAccessAction,
  reactivateSystemAdminUser,
  removeSystemAdminUser,
  resendSystemAdminInvitation,
  suspendSystemAdminUser,
} from "../actions/system-admin.users.actions.server";
import type { SystemAdminUserAccessInspection } from "../contracts";
import { systemAdminUserTrailingConfirms } from "../surface/system-admin.users-trailing-confirm.client.shared";
import { systemAdminUsersUiCopy } from "../surface/system-admin.users-ui.copy.shared";
import { SystemAdminUserAccessInspectionPanel } from "./system-admin.user-access-inspection.component.client";

export function SystemAdminUserTrailingCell({ row }: GovernedListTrailingCellProps) {
  const trailingAction = row.trailingAction;
  const membershipId = String(row.cells["membershipId"] ?? "");
  const invitationId = String(row.cells["invitationId"] ?? "");
  const userStatus = String(row.cells["userStatus"] ?? "");
  const rolesHref = String(row.cells["rolesHref"] ?? systemAdminRoutePaths.roles);
  const labels = systemAdminUsersUiCopy.trailing;
  const [result, setResult] = useState<SystemAdminActionResult<unknown>>();
  const [resendToken, setResendToken] = useState<string | null>(null);
  const [inspection, setInspection] =
    useState<SystemAdminUserAccessInspection | null>(null);
  const [isPending, startTransition] = useTransition();

  if (!isListSurfaceTrailingActionRenderable(trailingAction)) {
    return null;
  }

  const disabled = trailingAction.state === "disabled" || isPending;

  function run(action: () => Promise<SystemAdminActionResult<unknown> | undefined>) {
    startTransition(async () => {
      setResult(await action());
    });
  }

  if (userStatus === "invited" && invitationId) {
    return (
      <GovernedTrailingActionSlot trailingAction={trailingAction}>
        <SystemAdminTrailingActionStack
          footer={
            <>
              {resendToken ? <SystemAdminOneTimeSecretPanel secret={resendToken} /> : null}
              <ActionFormErrors result={result} />
            </>
          }
        >
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={disabled}
            onClick={() =>
              run(async () => {
                const response = await resendSystemAdminInvitation(invitationId);
                if (response.ok && response.data) {
                  setResendToken(response.data.token);
                }
                return response;
              })
            }
          >
            <SendIcon data-icon="inline-start" />
            {labels.resend}
          </Button>
          <SystemAdminDestructiveConfirmButton
            confirm={systemAdminUserTrailingConfirms.cancelInvitation}
            disabled={disabled}
            onConfirm={() => run(() => cancelSystemAdminInvitation(invitationId))}
          >
            <BanIcon data-icon="inline-start" />
            {labels.cancel}
          </SystemAdminDestructiveConfirmButton>
        </SystemAdminTrailingActionStack>
      </GovernedTrailingActionSlot>
    );
  }

  if (!membershipId) {
    return null;
  }

  return (
    <GovernedTrailingActionSlot trailingAction={trailingAction}>
      <SystemAdminTrailingActionStack
        footer={
          <>
            <ActionFormErrors result={result} />
            {inspection ? (
              <SystemAdminUserAccessInspectionPanel
                inspection={inspection}
                onClose={() => setInspection(null)}
              />
            ) : null}
          </>
        }
      >
        {userStatus === "active" ? (
          <SystemAdminDestructiveConfirmButton
            confirm={systemAdminUserTrailingConfirms.suspend}
            disabled={disabled}
            onConfirm={() => run(() => suspendSystemAdminUser(membershipId))}
          >
            <ShieldOffIcon data-icon="inline-start" />
            {labels.suspend}
          </SystemAdminDestructiveConfirmButton>
        ) : null}
        {userStatus === "suspended" ? (
          <Button
            type="button"
            size="sm"
            variant="secondary"
            disabled={disabled}
            onClick={() => run(() => reactivateSystemAdminUser(membershipId))}
          >
            <RotateCcwIcon data-icon="inline-start" />
            {labels.reactivate}
          </Button>
        ) : null}
        {userStatus === "active" || userStatus === "suspended" ? (
          <SystemAdminDestructiveConfirmButton
            confirm={systemAdminUserTrailingConfirms.remove}
            disabled={disabled}
            variant="outline"
            onConfirm={() => run(() => removeSystemAdminUser(membershipId))}
          >
            <UserMinusIcon data-icon="inline-start" />
            {labels.remove}
          </SystemAdminDestructiveConfirmButton>
        ) : null}
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={isPending}
          onClick={() =>
            startTransition(async () => {
              const response = await inspectSystemAdminUserAccessAction(membershipId);
              setResult(response);
              if (response.ok && response.data) {
                setInspection(response.data);
              }
            })
          }
        >
          <SearchIcon data-icon="inline-start" />
          {labels.inspectAccess}
        </Button>
        {userStatus !== "removed" ? (
          <Button type="button" size="sm" variant="ghost" asChild>
            <Link href={rolesHref}>{labels.viewRoles}</Link>
          </Button>
        ) : null}
      </SystemAdminTrailingActionStack>
    </GovernedTrailingActionSlot>
  );
}
