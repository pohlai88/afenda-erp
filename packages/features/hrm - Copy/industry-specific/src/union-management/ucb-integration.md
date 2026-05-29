# Union & Collective Bargaining — cross-module integration

UCB owns union/CBA masters, membership, rule references, seniority, grievances, and read APIs. Downstream modules **call** these exports; UCB does not import Payroll, OTM, LAM, or Shift Scheduling mutation graphs.

| Consumer | Server export (`@afenda/feature-hrm-industry-specific/server`) | UCB codes |
| --- | --- | --- |
| Payroll Processing | `listUcbPayrollRuleRefsForEmployee`, `listApprovedUnionDuesForPayroll` | 009, 018 |
| Overtime Management | `listUcbOvertimeRuleRefsForEmployee` | 010 |
| Leave & Attendance | `listUcbLeaveRuleRefsForEmployee` | 011 |
| Shift Scheduling | `listUcbSchedulingRuleRefsForEmployee`, `listSeniorityPriorityForUseCase` | 012, 015 |

All list functions accept `organizationId`, `employeeId`, and `asOfDate` (ISO `YYYY-MM-DD`) unless noted. Rule rows are references only (`externalRuleCode`, `summary`, optional `payloadJson`) — consumers interpret; UCB does not run pay/OT/leave math.
