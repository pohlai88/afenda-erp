import type { ReactNode } from "react";

import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
  Separator,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@afenda/ui";
import Link from "next/link";
import { systemAdminControlLinks } from "../overview/sys-control-links.contract";
import type {
  ApprovalEscalationBehavior,
  SystemAdminApprovalMode,
  SystemAdminApprovalRuleDetail,
} from "./sys-approval-rule.contract";
import { systemAdminApprovalsUiCopy } from "./sys-approvals-ui.copy.shared";
import {
  SystemAdminApprovalEnabledBadge,
  SystemAdminApprovalReadinessBadge,
  SystemAdminApprovalStatusBadge,
} from "./sys-approvals-detail-badges.component.server";
import { SystemAdminApprovalReactivateControl } from "./sys-approval-reactivate.component.client";
import type { SystemAdminActionResult } from "../tenant-execution/sys-action-result.contract";

type ReactivateAction = (input: {
  approvalKey: string;
}) => Promise<SystemAdminActionResult>;

const APPROVAL_MODE_LABELS = {
  sequential: systemAdminApprovalsUiCopy.editor.modes.sequential,
  parallel: systemAdminApprovalsUiCopy.editor.modes.parallel,
} as const satisfies Record<SystemAdminApprovalMode, string>;

const ESCALATION_BEHAVIOR_LABELS = {
  notify: systemAdminApprovalsUiCopy.editor.escalationBehaviors.notify,
  reassign: systemAdminApprovalsUiCopy.editor.escalationBehaviors.reassign,
  expire: systemAdminApprovalsUiCopy.editor.escalationBehaviors.expire,
} as const satisfies Record<ApprovalEscalationBehavior, string>;

function SystemAdminApprovalDetailField({
  label,
  value,
  span = 1,
  mono = false,
}: {
  label: string;
  value: ReactNode;
  span?: 1 | 2;
  mono?: boolean;
}) {
  return (
    <div className={span === 2 ? "@sm:col-span-2" : undefined}>
      <dt className="type-label">{label}</dt>
      <dd className={mono ? "type-mono-cell" : "type-body"}>{value}</dd>
    </div>
  );
}

export function SystemAdminApprovalDetailPanel({
  detail,
  backHref,
  canReview,
  reactivateDeprecatedApprovalRuleAction,
}: {
  detail: SystemAdminApprovalRuleDetail;
  backHref: string;
  canReview?: boolean;
  reactivateDeprecatedApprovalRuleAction?: ReactivateAction;
}) {
  const copy = systemAdminApprovalsUiCopy.detail;
  const fields = copy.fields;
  const activitySectionId = `system-admin-approval-activity-${detail.approvalKey}`;
  const hasEscalation = Boolean(detail.escalationAfterHours);
  const escalationBehavior =
    detail.escalationBehavior && hasEscalation
      ? ESCALATION_BEHAVIOR_LABELS[detail.escalationBehavior]
      : null;

  return (
    <Card
      className="@container"
      data-testid={`system-admin-approval-detail:${detail.approvalKey}`}
    >
      <CardHeader className="flex flex-col gap-surface-md">
        <div className="flex flex-row items-start justify-between gap-surface-md">
          <div className="flex min-w-0 flex-col gap-surface-xs">
            <CardTitle>{detail.name}</CardTitle>
            <p className="type-mono-muted truncate">{detail.approvalKey}</p>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href={backHref}>{copy.backLabel}</Link>
          </Button>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <SystemAdminApprovalStatusBadge status={detail.status} />
          <SystemAdminApprovalReadinessBadge verdict={detail.readinessVerdict} />
          <SystemAdminApprovalEnabledBadge enabled={detail.enabled} />
        </div>
      </CardHeader>

      <Separator />

      <CardContent className="flex flex-col gap-surface-lg type-body">
        <dl className="grid gap-surface-sm @sm:grid-cols-2">
          <SystemAdminApprovalDetailField
            label={fields.module}
            value={
              <Link
                href={systemAdminControlLinks.modules(detail.moduleKey)}
                className="underline-offset-4 hover:underline"
              >
                {detail.moduleKey}
              </Link>
            }
          />
          <SystemAdminApprovalDetailField
            label={fields.approvalMode}
            value={APPROVAL_MODE_LABELS[detail.approvalMode]}
          />
          <SystemAdminApprovalDetailField
            label={fields.minApprovals}
            value={detail.minApprovals}
          />
          <SystemAdminApprovalDetailField
            label={fields.targetType}
            value={detail.targetType}
            mono
          />
          <SystemAdminApprovalDetailField
            label={fields.action}
            value={detail.action}
            span={2}
            mono
          />
          <SystemAdminApprovalDetailField
            label={fields.approverRoles}
            value={detail.approverRoleKeys.join(", ")}
            span={2}
          />
          {detail.delegateToRoleKeys.length > 0 ? (
            <SystemAdminApprovalDetailField
              label={fields.delegationRoles}
              value={detail.delegateToRoleKeys.join(", ")}
              span={2}
            />
          ) : null}
          {detail.delegationValidDays ? (
            <SystemAdminApprovalDetailField
              label={fields.delegationValidDays}
              value={detail.delegationValidDays}
            />
          ) : null}
          <SystemAdminApprovalDetailField
            label={fields.escalation}
            value={
              hasEscalation
                ? `${detail.escalationAfterHours}h`
                : copy.notConfigured
            }
          />
          {escalationBehavior ? (
            <SystemAdminApprovalDetailField
              label={fields.escalationBehavior}
              value={escalationBehavior}
            />
          ) : null}
          {detail.escalationRoleKeys.length > 0 ? (
            <SystemAdminApprovalDetailField
              label={fields.escalationRoles}
              value={detail.escalationRoleKeys.join(", ")}
              span={2}
            />
          ) : null}
          <SystemAdminApprovalDetailField
            label={fields.capability}
            span={2}
            value={
              detail.capabilityKey ? (
                <Link
                  href={systemAdminControlLinks.capabilities(detail.capabilityKey)}
                  className="underline-offset-4 hover:underline"
                >
                  {detail.capabilityLabel ?? detail.capabilityKey}
                </Link>
              ) : (
                copy.noCapability
              )
            }
          />
          {detail.requiredPermission ? (
            <SystemAdminApprovalDetailField
              label={fields.requiredPermission}
              span={2}
              mono
              value={
                <Link
                  href={systemAdminControlLinks.permissions(
                    detail.requiredPermission,
                  )}
                  className="underline-offset-4 hover:underline"
                >
                  {detail.requiredPermission}
                </Link>
              }
            />
          ) : null}
          {detail.relatedPolicyKeys.length > 0 ? (
            <SystemAdminApprovalDetailField
              label={fields.relatedPolicies}
              span={2}
              value={
                <ul className="flex flex-col gap-surface-xs">
                  {detail.relatedPolicyKeys.map((policyKey) => (
                    <li key={policyKey}>
                      <Link
                        href={systemAdminControlLinks.policy(policyKey)}
                        className="type-mono-cell underline-offset-4 hover:underline"
                      >
                        {policyKey}
                      </Link>
                    </li>
                  ))}
                </ul>
              }
            />
          ) : null}
        </dl>

        {detail.status === "deprecated" &&
        canReview &&
        reactivateDeprecatedApprovalRuleAction ? (
          <>
            <Separator />
            <SystemAdminApprovalReactivateControl
              approvalKey={detail.approvalKey}
              reactivateDeprecatedApprovalRuleAction={
                reactivateDeprecatedApprovalRuleAction
              }
            />
          </>
        ) : null}

        <Separator />

        <section
          aria-labelledby={activitySectionId}
          className="flex flex-col gap-surface-sm"
        >
          <h3 id={activitySectionId} className="type-section-title">
            {copy.recentActivityTitle}
          </h3>
          {detail.recentActivity.length > 0 ? (
            <div className="overflow-x-auto rounded-control border border-border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{copy.activityColumns.when}</TableHead>
                    <TableHead>{copy.activityColumns.actor}</TableHead>
                    <TableHead>{copy.activityColumns.action}</TableHead>
                    <TableHead>{copy.activityColumns.summary}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {detail.recentActivity.map((event) => (
                    <TableRow key={event.id}>
                      <TableCell>{event.occurredAt}</TableCell>
                      <TableCell className="type-mono-cell">
                        {event.actorId}
                      </TableCell>
                      <TableCell className="type-mono-cell">
                        {event.action}
                      </TableCell>
                      <TableCell>{event.summary}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <Empty>
              <EmptyHeader>
                <EmptyTitle>{copy.noRecentActivityTitle}</EmptyTitle>
                <EmptyDescription>
                  {copy.noRecentActivityDescription}
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          )}
        </section>

        <Separator />

        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={detail.auditHref}>{copy.auditHistoryLabel}</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
