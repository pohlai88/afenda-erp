export const HRM_BIG_BANG_PACKAGE_NAME = "@afenda/feature-hrm" as const

export const HRM_CORE_ROOT_FILES = [
  "app.ts",
  "client.ts",
  "index.ts",
  "README.md",
  "schemas.ts",
  "server.ts",
  "shared.ts",
  "testing.ts",
] as const

export type HrmBoundedContextId =
  | "core"
  | "employee-management"
  | "time-attendance"
  | "payroll-compensation"
  | "talent-management"
  | "industry-specific-hrm"

export type HrmMetadataPattern = "A" | "B" | "C" | "K"

export type HrmPackageMoveReadiness =
  | "blocked-by-integration-doors"
  | "package-door-active"

export type HrmIntegrationDoorPlan = {
  readonly id: string
  readonly futurePublicDoor:
    | "."
    | "./server"
    | "./client"
    | "./schemas"
    | "./testing"
    | "./employee-row-links"
  readonly currentCompatibilityDoor: string
  readonly blocksMoveBecause: string
}

export type HrmFunctionalDomainPlan = {
  readonly id: string
  readonly currentSegment?: string
  readonly owns: string
}

export type HrmBoundedContextPlan = {
  readonly id: HrmBoundedContextId
  readonly packageName: `@afenda/feature-hrm-${string}`
  readonly currentSegments: readonly string[]
  readonly rootFiles?: readonly (typeof HRM_CORE_ROOT_FILES)[number][]
  readonly owns: readonly string[]
  readonly functionalDomains: readonly HrmFunctionalDomainPlan[]
  readonly publicDoors: readonly string[]
  readonly integrationDoors: readonly HrmIntegrationDoorPlan[]
  readonly metadataPatterns: readonly HrmMetadataPattern[]
  readonly moveReadiness: HrmPackageMoveReadiness
  readonly moveBlockers: readonly string[]
}

const HRM_DEFAULT_PUBLIC_DOORS = [
  ".",
  "./server",
  "./client",
  "./schemas",
  "./testing",
  "./employee-row-links",
] as const

const HRM_METADATA_MOVE_BLOCKERS = [
  "Preserve segment-level Promise.all for independent Server Component reads.",
  "Keep Pattern C/K client islands serializable; do not pass render functions over RSC.",
  "Keep governed list builders server-only and metadata-driven.",
] as const

export const HRM_BOUNDED_CONTEXTS = [
  {
    id: "core",
    packageName: "@afenda/feature-hrm-core",
    currentSegments: [
      "_hrm_landing_page",
      "_internal-cross-cutting",
      "_module-governance",
      "components",
      "server",
    ],
    rootFiles: HRM_CORE_ROOT_FILES,
    owns: [
      "capability registry, app path helpers, and audit prefix catalog",
      "shared HRM form state and row-link helper types",
      "module governance guards and cross-cutting rail/snapshot bridges",
      "overview and segment dispatcher route components",
    ],
    functionalDomains: [
      {
        id: "registry",
        currentSegment: "registry",
        owns: "capability registry, nav ordering, route segment allowlist, and audit prefixes",
      },
      {
        id: "navigation",
        currentSegment: "routing",
        owns: "organization HRM paths, nav labels, and segment lookup helpers",
      },
      {
        id: "overview",
        currentSegment: "_hrm_landing_page",
        owns: "HRM overview and landing route composition",
      },
      {
        id: "governance",
        currentSegment: "_module-governance",
        owns: "cross-subdomain mutation guards and module governance contracts",
      },
      {
        id: "cross-cutting",
        currentSegment: "_internal-cross-cutting",
        owns: "Nexus pressure, rail pressure, snapshot, and shared HRM adapters",
      },
    ],
    publicDoors: HRM_DEFAULT_PUBLIC_DOORS,
    integrationDoors: [
      {
        id: "registry",
        futurePublicDoor: ".",
        currentCompatibilityDoor: "../../_core/registry",
        blocksMoveBecause:
          "Capability registry exports still aggregate every HRM bounded context.",
      },
      {
        id: "governance",
        futurePublicDoor: "./server",
        currentCompatibilityDoor: "../../_core/server",
        blocksMoveBecause:
          "Mutation guards are shared by multiple HRM contexts and must become explicit server ports.",
      },
      {
        id: "employee-row-links",
        futurePublicDoor: "./employee-row-links",
        currentCompatibilityDoor: "../../_core/shared",
        blocksMoveBecause:
          "Cross-context list builders still import the root compatibility shim; migrate to ../../_core/shared.",
      },
      {
        id: "nexus-pressure",
        futurePublicDoor: "./server",
        currentCompatibilityDoor:
          "@afenda/feature-hrm-core/_internal-cross-cutting",
        blocksMoveBecause:
          "Nexus pressure adapters consume HRM-wide pressure rows through the root server door.",
      },
      {
        id: "rail-pressure",
        futurePublicDoor: "./server",
        currentCompatibilityDoor:
          "@afenda/feature-hrm-core/_internal-cross-cutting",
        blocksMoveBecause:
          "Shell rail pressure must remain serialized metadata, not cross-context DB access.",
      },
    ],
    metadataPatterns: ["A", "B", "C"],
    moveReadiness: "package-door-active",
    moveBlockers: [
      "The @afenda/feature-hrm-core workspace package door is active; route-only composition now lives in @afenda/feature-hrm-route-composition.",
      "Cross-context callers must use explicit bounded-context package doors rather than an aggregate HRM server door.",
      "Cross-context guards and shared form state must become explicit public doors first.",
      ...HRM_METADATA_MOVE_BLOCKERS,
    ],
  },
  {
    id: "employee-management",
    packageName: "@afenda/feature-hrm-employee-management",
    currentSegments: ["employee-management"],
    owns: [
      "employee records, lifecycle, documents, compliance, offboarding, org hierarchy, and employee self-service",
      "employee-directory read models consumed by payroll, time attendance, talent, and industry contexts",
      "employee/person row-link metadata for governed list surfaces",
    ],
    functionalDomains: [
      {
        id: "employee-records-management",
        currentSegment: "employee-records-management",
        owns: "employee master records, contracts, dependents, identity, employment, and statutory profiles",
      },
      {
        id: "organizational-chart-hierarchy",
        currentSegment: "organizational-chart-hierarchy",
        owns: "departments, org units, positions, grades, placements, and reporting relationships",
      },
      {
        id: "employee-lifecycle-management",
        currentSegment: "employee-lifecycle-management",
        owns: "onboarding, boarding, employment status changes, probation, and lifecycle transitions",
      },
      {
        id: "employee-selfservice-portal",
        currentSegment: "employee-selfservice-portal",
        owns: "employee portal access, profile, leave, claim, document, signature, and request workflows",
      },
      {
        id: "documents-management",
        currentSegment: "documents-management",
        owns: "employee document governance, upload, verification, expiry, and document surfaces",
      },
      {
        id: "compliance-regulatory-tracking",
        currentSegment: "compliance-regulatory-tracking",
        owns: "employee compliance evidence, filings, obligations, statutory events, and control watches",
      },
      {
        id: "offboarding-exit-management",
        currentSegment: "offboarding-exit-management",
        owns: "offboarding initiation, tasks, approvals, surveys, and exit workflows",
      },
    ],
    publicDoors: HRM_DEFAULT_PUBLIC_DOORS,
    integrationDoors: [
      {
        id: "employee-directory-read-model",
        futurePublicDoor: "./server",
        currentCompatibilityDoor:
          "../../employees/server",
        blocksMoveBecause:
          "Payroll, time attendance, talent, and industry contexts still need employee identity and active-worker reads.",
      },
      {
        id: "employee-placement-reference",
        futurePublicDoor: "./server",
        currentCompatibilityDoor:
          "../../employees/server",
        blocksMoveBecause:
          "Cross-context placement reads need a stable department, position, grade, and manager reference contract.",
      },
      {
        id: "employee-document-governance",
        futurePublicDoor: "./server",
        currentCompatibilityDoor:
          "../../employees/server",
        blocksMoveBecause:
          "Compliance, payroll, and portal flows still depend on employee document governance state.",
      },
      {
        id: "employee-portal-mutation-span",
        futurePublicDoor: "./client",
        currentCompatibilityDoor:
          "../../employees/client",
        blocksMoveBecause:
          "Portal client islands submit leave, claim, advance, profile, document, and offboarding mutations through one HRM client door.",
      },
    ],
    metadataPatterns: ["B", "C", "K"],
    moveReadiness: "package-door-active",
    moveBlockers: [
      "The @afenda/feature-hrm-employee-management workspace package door is active; downstream callers should use package integration ports directly.",
      "Functional-domain directories live under packages/features/hrm/employee-management with public package doors only.",
      ...HRM_METADATA_MOVE_BLOCKERS,
    ],
  },
  {
    id: "time-attendance",
    packageName: "@afenda/feature-hrm-time-attendance",
    currentSegments: ["time-attendance"],
    owns: [
      "leave, attendance, shift scheduling, overtime, time clock, geolocation, flexible work, and absence analytics",
      "attendance and overtime payroll readiness feeds",
      "high-volume governed operational list surfaces",
    ],
    functionalDomains: [
      {
        id: "leave-attendance-management",
        currentSegment: "leave-attendance-management",
        owns: "leave policies, requests, approvals, balances, attendance days, corrections, and reports",
      },
      {
        id: "time-clock-integration",
        currentSegment: "time-clock-integration",
        owns: "time-clock devices, ingest, punch classification, sync, exceptions, and payroll references",
      },
      {
        id: "shift-scheduling",
        currentSegment: "shift-scheduling",
        owns: "shift templates, rosters, assignment workflows, swaps, coverage, and schedule exports",
      },
      {
        id: "overtime-management",
        currentSegment: "overtime-management",
        owns: "overtime types, policies, requests, approvals, exceptions, and payroll export feeds",
      },
      {
        id: "geolocation-remote-checkin",
        currentSegment: "geolocation-remote-checkin",
        owns: "geofences, remote check-ins, devices, policies, exceptions, and field attendance references",
      },
      {
        id: "flexible-work-arrangement-tracking",
        currentSegment: "flexible-work-arrangement-tracking",
        owns: "flexible work types, eligibility, requests, evidence, approvals, and compliance watches",
      },
      {
        id: "absence-analytics-trends",
        currentSegment: "absence-analytics-trends",
        owns: "absence thresholds, trend analytics, risk surfaces, and absence reporting",
      },
    ],
    publicDoors: HRM_DEFAULT_PUBLIC_DOORS,
    integrationDoors: [
      {
        id: "attendance-payroll-feed",
        futurePublicDoor: "./server",
        currentCompatibilityDoor: "../../time-attendance/server",
        blocksMoveBecause:
          "Payroll readiness and statutory processing consume attendance aggregates.",
      },
      {
        id: "overtime-payroll-feed",
        futurePublicDoor: "./server",
        currentCompatibilityDoor: "../../time-attendance/server",
        blocksMoveBecause:
          "Payroll requires an explicit overtime calculation feed before time-attendance can move.",
      },
      {
        id: "active-employee-choices",
        futurePublicDoor: "./server",
        currentCompatibilityDoor: "../../time-attendance/server",
        blocksMoveBecause:
          "Shift, leave, geolocation, payroll, and industry forms share active employee choice models.",
      },
      {
        id: "time-clock-exception-corrections",
        futurePublicDoor: "./client",
        currentCompatibilityDoor: "../../time-attendance/client",
        blocksMoveBecause:
          "Time-clock correction workflows cross Server Actions, ingestion routes, and payroll regeneration.",
      },
    ],
    metadataPatterns: ["B", "C", "K"],
    moveReadiness: "package-door-active",
    moveBlockers: [
      "The @afenda/feature-hrm-time-attendance workspace package door is active; integration ports now replace legacy aggregate imports.",
      "Payroll and talent pages deep-import attendance, leave, overtime, and active employee choice helpers.",
      ...HRM_METADATA_MOVE_BLOCKERS,
    ],
  },
  {
    id: "payroll-compensation",
    packageName: "@afenda/feature-hrm-payroll-compensation",
    currentSegments: ["payroll-compensation"],
    owns: [
      "payroll processing, payroll profiles, multi-country rule packs, benefits, claims, bonus, compensation, advances, and salary benchmarks",
      "payroll finalization workflow payload integration through the execution facade",
      "claims and compensation governed list and kanban surfaces",
    ],
    functionalDomains: [
      {
        id: "payroll-processing",
        currentSegment: "payroll-processing",
        owns: "payroll periods, runs, lines, profiles, advances, posting, payslips, and close workflows",
      },
      {
        id: "multi-country-payroll",
        currentSegment: "multi-country-payroll",
        owns: "statutory rule packs, legal entity payroll, exchange rates, and pay component treatment",
      },
      {
        id: "benefits-administration",
        currentSegment: "benefits-administration",
        owns: "benefit plans, eligibility, enrollments, census, payroll projections, and life events",
      },
      {
        id: "expenses-reimbursement",
        currentSegment: "expenses-reimbursement",
        owns: "claim types, submissions, approvals, evidence, limits, payments, and claim surfaces",
      },
      {
        id: "bonus-incentive-management",
        currentSegment: "bonus-incentive-management",
        owns: "bonus plans, incentive eligibility, payout calculations, and bonus governed surfaces",
      },
      {
        id: "compensation-planning-modeling",
        currentSegment: "compensation-planning-modeling",
        owns: "compensation cycles, pools, participants, budgets, approvals, and modeling surfaces",
      },
      {
        id: "salary-benchmarking-survey",
        currentSegment: "salary-benchmarking-survey",
        owns: "salary benchmark surveys, market references, benchmarking analytics, and salary surfaces",
      },
    ],
    publicDoors: HRM_DEFAULT_PUBLIC_DOORS,
    integrationDoors: [
      {
        id: "payroll-period-readiness",
        futurePublicDoor: "./server",
        currentCompatibilityDoor:
          "../../payroll/server",
        blocksMoveBecause:
          "Attendance, benefits, claims, and compliance flows gate mutations against payroll period readiness.",
      },
      {
        id: "claim-payment-feed",
        futurePublicDoor: "./server",
        currentCompatibilityDoor:
          "../../payroll/server",
        blocksMoveBecause:
          "Expense claims and payroll need a stable payment handoff contract.",
      },
      {
        id: "multi-country-rule-pack",
        futurePublicDoor: "./server",
        currentCompatibilityDoor:
          "../../payroll/server",
        blocksMoveBecause:
          "Compliance and payroll submissions consume statutory rule-pack resolution.",
      },
      {
        id: "compensation-snapshot",
        futurePublicDoor: "./server",
        currentCompatibilityDoor:
          "../../payroll/server",
        blocksMoveBecause:
          "Benefits, salary benchmarks, and payroll reports require serialized compensation snapshots.",
      },
    ],
    metadataPatterns: ["B", "C", "K"],
    moveReadiness: "package-door-active",
    moveBlockers: [
      "The @afenda/feature-hrm-payroll-compensation workspace package door is active; integration ports now replace legacy aggregate imports.",
      "Payroll reads time-attendance, employee-management, and compliance internals directly.",
      ...HRM_METADATA_MOVE_BLOCKERS,
    ],
  },
  {
    id: "talent-management",
    packageName: "@afenda/feature-hrm-talent-management",
    currentSegments: ["talent-management"],
    owns: [
      "recruitment, onboarding, performance, LMS, training, skills, engagement, career pathing, candidate self-service, and succession",
      "training and performance integration feeds for employee lifecycle and compliance contexts",
      "recruitment kanban and candidate governed list surfaces",
    ],
    functionalDomains: [
      {
        id: "recruitment-onboarding",
        currentSegment: "recruitment-onboarding",
        owns: "job requisitions, applications, interviews, offers, and recruitment-to-employee handoff",
      },
      {
        id: "candidate-selfservice-portal",
        currentSegment: "candidate-selfservice-portal",
        owns: "candidate portal profile, application self-service, and candidate-facing read models",
      },
      {
        id: "performance-appraisals",
        currentSegment: "performance-appraisals",
        owns: "review cycles, review rows, pipelines, acknowledgements, and appraisal workflows",
      },
      {
        id: "competency-skills-framework",
        currentSegment: "competency-skills-framework",
        owns: "skills, KPI periods, KPI goals, milestones, scorecards, and competency references",
      },
      {
        id: "learning-management-system-lms",
        currentSegment: "learning-management-system-lms",
        owns: "LMS courses, enrollments, progress, assessments, reminders, and completion feeds",
      },
      {
        id: "training-development",
        currentSegment: "training-development",
        owns: "training programs, assignments, evidence, compliance training feeds, and training surfaces",
      },
      {
        id: "career-pathing-development-plans",
        currentSegment: "career-pathing-development-plans",
        owns: "career plans, discussions, target roles, development milestones, and pathing surfaces",
      },
      {
        id: "succession-planning",
        currentSegment: "succession-planning",
        owns: "succession pools, nominations, readiness, risk, and succession planning surfaces",
      },
      {
        id: "employee-engagement-surveys",
        currentSegment: "employee-engagement-surveys",
        owns: "engagement surveys, invitations, responses, analytics, distribution, and improvement actions",
      },
    ],
    publicDoors: HRM_DEFAULT_PUBLIC_DOORS,
    integrationDoors: [
      {
        id: "recruitment-to-employee-handoff",
        futurePublicDoor: "./server",
        currentCompatibilityDoor:
          "../../talent/server",
        blocksMoveBecause:
          "Onboarding and employee lifecycle need an explicit recruitment handoff contract.",
      },
      {
        id: "training-compliance-feed",
        futurePublicDoor: "./server",
        currentCompatibilityDoor:
          "../../talent/server",
        blocksMoveBecause:
          "Compliance surfaces consume training evidence and expiry state.",
      },
      {
        id: "performance-reference-feed",
        futurePublicDoor: "./server",
        currentCompatibilityDoor:
          "../../talent/server",
        blocksMoveBecause:
          "Government pay-grade and succession flows require performance reference data.",
      },
      {
        id: "candidate-portal-read-model",
        futurePublicDoor: "./server",
        currentCompatibilityDoor:
          "../../talent/server",
        blocksMoveBecause:
          "Candidate self-service pages need a package-safe read model before talent moves.",
      },
    ],
    metadataPatterns: ["B", "C", "K"],
    moveReadiness: "package-door-active",
    moveBlockers: [
      "The @afenda/feature-hrm-talent-management workspace package door is active; integration ports now replace legacy aggregate imports.",
      "Talent reads employee-management and time-attendance helpers directly.",
      ...HRM_METADATA_MOVE_BLOCKERS,
    ],
  },
  {
    id: "industry-specific-hrm",
    packageName: "@afenda/feature-hrm-industry-specific",
    currentSegments: ["industry-specific-hrm"],
    owns: [
      "field workforce, food handler compliance, government pay grades, manufacturing safety, retail seasonal scheduling, and union management",
      "industry compliance overlays that compose employee, talent, and time-attendance references",
      "industry-specific governed operational surfaces",
    ],
    functionalDomains: [
      {
        id: "field-worker-remote-workforce-management",
        currentSegment: "field-worker-remote-workforce-management",
        owns: "field workforce assignments, remote workforce telemetry, attendance references, and mobile capture",
      },
      {
        id: "food-handler-certification-health-compliance",
        currentSegment: "food-handler-certification-health-compliance",
        owns: "food-handler certification, health compliance, evidence, expiry, and compliance surfaces",
      },
      {
        id: "manufacturing-safety-training-OSHA-compliance",
        currentSegment: "manufacturing-safety-training-OSHA-compliance",
        owns: "manufacturing safety, OSHA training, incidents, evidence, and safety compliance workflows",
      },
      {
        id: "government-classification-pay-grades",
        currentSegment: "government-classification-pay-grades",
        owns: "government classifications, pay grades, grade movement, performance references, and pay overlays",
      },
      {
        id: "retail-seasonal-hourly-workforce-scheduling",
        currentSegment: "retail-seasonal-hourly-workforce-scheduling",
        owns: "retail demand periods, store budgets, coverage, open shifts, and seasonal scheduling surfaces",
      },
      {
        id: "union-management",
        currentSegment: "union-management",
        owns: "union agreements, bargaining units, memberships, grievances, and union compliance workflows",
      },
    ],
    publicDoors: HRM_DEFAULT_PUBLIC_DOORS,
    integrationDoors: [
      {
        id: "industry-compliance-evidence",
        futurePublicDoor: "./server",
        currentCompatibilityDoor:
          "@afenda/feature-hrm-industry-specific/server",
        blocksMoveBecause:
          "Industry compliance overlays consume employee compliance evidence and statutory state.",
      },
      {
        id: "government-pay-grade-performance-reference",
        futurePublicDoor: "./server",
        currentCompatibilityDoor:
          "@afenda/feature-hrm-industry-specific/server",
        blocksMoveBecause:
          "Government pay-grade movement references talent performance and payroll compensation data.",
      },
      {
        id: "field-workforce-attendance-reference",
        futurePublicDoor: "./server",
        currentCompatibilityDoor:
          "@afenda/feature-hrm-industry-specific/server",
        blocksMoveBecause:
          "Field workforce scheduling consumes time-attendance and geolocation reference state.",
      },
      {
        id: "safety-training-reference",
        futurePublicDoor: "./server",
        currentCompatibilityDoor:
          "@afenda/feature-hrm-industry-specific/server",
        blocksMoveBecause:
          "Manufacturing safety and food-handler surfaces consume talent training records.",
      },
    ],
    metadataPatterns: ["B", "C", "K"],
    moveReadiness: "package-door-active",
    moveBlockers: [
      "The @afenda/feature-hrm-industry-specific workspace package door is active; integration ports now replace legacy aggregate imports.",
      "Industry modules read talent, employee-management, and time-attendance internals directly.",
      ...HRM_METADATA_MOVE_BLOCKERS,
    ],
  },
] as const satisfies readonly HrmBoundedContextPlan[]

export function listHrmBoundedContextPackageNames(): readonly string[] {
  return HRM_BOUNDED_CONTEXTS.map((context) => context.packageName)
}

export function getHrmBoundedContextById(
  id: HrmBoundedContextId
): HrmBoundedContextPlan {
  const context = HRM_BOUNDED_CONTEXTS.find((candidate) => candidate.id === id)
  if (!context) {
    throw new Error(`Unknown HRM bounded context: ${id}`)
  }
  return context
}

export function resolveHrmBoundedContextForPath(
  hrmRelativePath: string
): HrmBoundedContextPlan | null {
  const normalizedPath = hrmRelativePath
    .replaceAll("\\", "/")
    .replace(/^lib\/features\/hrm\//, "")
    .replace(/^\/+/, "")
  const [topLevelSegment] = normalizedPath.split("/")
  if (!topLevelSegment) return null

  const rootFile = HRM_CORE_ROOT_FILES.find((file) => file === topLevelSegment)
  if (rootFile) return getHrmBoundedContextById("core")

  return (
    HRM_BOUNDED_CONTEXTS.find((context) =>
      (context.currentSegments as readonly string[]).includes(topLevelSegment)
    ) ?? null
  )
}

export function assertHrmPackageNameIsNotBigBang(packageName: string): void {
  if (packageName === HRM_BIG_BANG_PACKAGE_NAME) {
    throw new Error(
      `${HRM_BIG_BANG_PACKAGE_NAME} is forbidden; split HRM by bounded context.`
    )
  }
}
