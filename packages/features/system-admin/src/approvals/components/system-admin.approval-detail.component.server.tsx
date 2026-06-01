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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@afenda/ui";
import Link from "next/link";
import { systemAdminControlLinks } from "../../overview/contracts/system-admin.control-links.contract";
import type { SystemAdminApprovalRuleDetail } from "../contracts/system-admin.approval-rule.contract";
import { formatApprovalEscalationSummary } from "../data/system-admin.approval-rules.shared";
import { systemAdminApprovalsUiCopy } from "../surface/system-admin.approvals-ui.copy.shared";
import {
  SystemAdminApprovalEnabledBadge,
  SystemAdminApprovalReadinessBadge,
  SystemAdminApprovalStatusBadge,
} from "./system-admin.approvals-detail-badges.component.server";

export function SystemAdminApprovalDetailPanel({
  detail,
  backHref,
}: {
  detail: SystemAdminApprovalRuleDetail;
  backHref: string;
}) {
  const copy = systemAdminApprovalsUiCopy.detail;
  const fields = copy.fields;

  return (
    <Card data-testid={`system-admin-approval-detail:${detail.approvalKey}`}>
      <CardHeader className="flex flex-row items-center justify-between gap-surface-md">
        <CardTitle>{detail.name}</CardTitle>
        <Button variant="outline" size="sm" asChild>
          <Link href={backHref}>{copy.backLabel}</Link>
        </Button>
      </CardHeader>
      <CardContent className="@container flex flex-col gap-surface-md type-body">
        <dl className="grid gap-2 @sm:grid-cols-2">
          <div>
            <dt className="type-muted">{fields.approvalKey}</dt>
            <dd className="type-mono-cell">{detail.approvalKey}</dd>
          </div>
          <div>
            <dt className="type-muted">{fields.module}</dt>
            <dd>
              <Link
                href={systemAdminControlLinks.modules(detail.moduleKey)}
                className="underline-offset-4 hover:underline"
              >
                {detail.moduleKey}
              </Link>
            </dd>
          </div>
          <div>
            <dt className="type-muted">{fields.approvalMode}</dt>
            <dd>{detail.approvalMode}</dd>
          </div>
          <div>
            <dt className="type-muted">{fields.status}</dt>
            <dd>
              <SystemAdminApprovalStatusBadge status={detail.status} />
            </dd>
          </div>
          <div>
            <dt className="type-muted">{fields.minApprovals}</dt>
            <dd>{detail.minApprovals}</dd>
          </div>
          <div>
            <dt className="type-muted">{fields.readiness}</dt>
            <dd>
              <SystemAdminApprovalReadinessBadge verdict={detail.readinessVerdict} />
            </dd>
          </div>
          <div className="@sm:col-span-2">
            <dt className="type-muted">{fields.escalation}</dt>
            <dd>{formatApprovalEscalationSummary(detail)}</dd>
          </div>
          <div>
            <dt className="type-muted">{fields.enabled}</dt>
            <dd>
              <SystemAdminApprovalEnabledBadge
                enabled={detail.enabled}
                enabledLabel={copy.enabledYes}
                disabledLabel={copy.enabledNo}
              />
            </dd>
          </div>
          <div className="@sm:col-span-2">
            <dt className="type-muted">{fields.action}</dt>
            <dd className="type-mono-cell">{detail.action}</dd>
          </div>
          <div className="@sm:col-span-2">
            <dt className="type-muted">{fields.approverRoles}</dt>
            <dd>{detail.approverRoleKeys.join(", ")}</dd>
          </div>
          {detail.delegateToRoleKeys.length > 0 ? (
            <div className="@sm:col-span-2">
              <dt className="type-muted">{fields.delegationRoles}</dt>
              <dd>{detail.delegateToRoleKeys.join(", ")}</dd>
            </div>
          ) : null}
          {detail.delegationValidDays ? (
            <div>
              <dt className="type-muted">{fields.delegationValidDays}</dt>
              <dd>{detail.delegationValidDays}</dd>
            </div>
          ) : null}
          <div className="@sm:col-span-2">
            <dt className="type-muted">{fields.capability}</dt>
            <dd>
              {detail.capabilityKey ? (
                <Link
                  href={systemAdminControlLinks.capabilities(detail.capabilityKey)}
                  className="underline-offset-4 hover:underline"
                >
                  {detail.capabilityLabel ?? detail.capabilityKey}
                </Link>
              ) : (
                copy.noCapability
              )}
            </dd>
          </div>
          {detail.requiredPermission ? (
            <div className="@sm:col-span-2">
              <dt className="type-muted">{fields.requiredPermission}</dt>
              <dd>
                <Link
                  href={systemAdminControlLinks.permissions(
                    detail.requiredPermission,
                  )}
                  className="type-mono-cell underline-offset-4 hover:underline"
                >
                  {detail.requiredPermission}
                </Link>
              </dd>
            </div>
          ) : null}
          {detail.relatedPolicyKeys.length > 0 ? (
            <div className="@sm:col-span-2">
              <dt className="type-muted">{fields.relatedPolicies}</dt>
              <dd className="flex flex-col gap-1">
                {detail.relatedPolicyKeys.map((policyKey) => (
                  <Link
                    key={policyKey}
                    href={systemAdminControlLinks.policy(policyKey)}
                    className="type-mono-cell underline-offset-4 hover:underline"
                  >
                    {policyKey}
                  </Link>
                ))}
              </dd>
            </div>
          ) : null}
        </dl>

        <div className="flex flex-col gap-surface-sm">
          <h3 className="type-subheading">{copy.recentActivityTitle}</h3>
          {detail.recentActivity.length > 0 ? (
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
                    <TableCell className="type-mono-cell">{event.actorId}</TableCell>
                    <TableCell className="type-mono-cell">{event.action}</TableCell>
                    <TableCell>{event.summary}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
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
        </div>

        <div>
          <Button variant="outline" size="sm" asChild>
            <Link href={detail.auditHref}>{copy.auditHistoryLabel}</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
