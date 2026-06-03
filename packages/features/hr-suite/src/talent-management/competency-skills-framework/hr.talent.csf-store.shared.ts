import type {
  HrCsfGapSeverity,
  HrCsfProficiencyLevel,
  HrCsfSkillRequirementKind,
} from "./hr.talent.csf-constants.shared";

export type HrCsfCompetencyRecord = {
  id: string;
  organizationId: string;
  code: string;
  name: string;
  category: string;
  description: string;
  status: "active" | "archived";
  proficiencyScale: readonly HrCsfProficiencyLevel[];
};

export type HrCsfSkillRecord = {
  id: string;
  organizationId: string;
  code: string;
  name: string;
  category: string;
  description: string;
  status: "active" | "archived";
  proficiencyScale: readonly HrCsfProficiencyLevel[];
};

export type HrCsfRoleRequirementRecord = {
  id: string;
  organizationId: string;
  roleCode: string;
  roleName: string;
  jobFamily: string;
  grade: string;
  departmentName: string;
  itemKind: "skill" | "competency";
  itemCode: string;
  itemName: string;
  requirementKind: HrCsfSkillRequirementKind;
  requiredLevel: HrCsfProficiencyLevel;
};

export type HrCsfEmployeeProficiencyRecord = {
  id: string;
  organizationId: string;
  employeeId: string;
  employeeDisplayName: string;
  employeeNumber: string;
  departmentName: string;
  jobFamily: string;
  grade: string;
  roleCode: string;
  roleName: string;
  itemKind: "skill" | "competency";
  itemCode: string;
  itemName: string;
  currentLevel: HrCsfProficiencyLevel;
  lastAssessedAt: string;
  assessorKind: "self" | "manager" | "hr" | "expert";
  evidenceSummary?: string;
};

export type HrCsfGapRecord = {
  id: string;
  organizationId: string;
  employeeId: string;
  employeeDisplayName: string;
  departmentName: string;
  roleCode: string;
  jobFamily: string;
  grade: string;
  gapKind: "skill" | "competency";
  itemCode: string;
  itemName: string;
  requiredLevel: HrCsfProficiencyLevel;
  currentLevel: HrCsfProficiencyLevel;
  severity: HrCsfGapSeverity;
  priority: string;
  developmentUrgency: string;
  recommendedActions: readonly string[];
  linkedCourseCodes: readonly string[];
};

export type HrCsfAuditEventRecord = {
  id: string;
  organizationId: string;
  action: string;
  summary: string;
  actorAuthUserId: string | null;
  employeeId: string | null;
  itemCode: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
};

type OrgCsfStore = {
  competencies: Map<string, HrCsfCompetencyRecord>;
  skills: Map<string, HrCsfSkillRecord>;
  roleRequirements: HrCsfRoleRequirementRecord[];
  employeeProficiencies: HrCsfEmployeeProficiencyRecord[];
  gaps: HrCsfGapRecord[];
  audit: HrCsfAuditEventRecord[];
  auditSequence: number;
};

const stores = new Map<string, OrgCsfStore>();

function proficiencyIndex(level: HrCsfProficiencyLevel): number {
  const order: readonly HrCsfProficiencyLevel[] = [
    "beginner",
    "working",
    "competent",
    "advanced",
    "expert",
  ];
  return order.indexOf(level);
}

function getOrgStore(organizationId: string): OrgCsfStore {
  let store = stores.get(organizationId);
  if (!store) {
    store = {
      competencies: new Map(),
      skills: new Map(),
      roleRequirements: [],
      employeeProficiencies: [],
      gaps: [],
      audit: [],
      auditSequence: 0,
    };
    stores.set(organizationId, store);
  }
  return store;
}

function seedDemoData(organizationId: string) {
  const store = getOrgStore(organizationId);
  if (store.competencies.size > 0) {
    return;
  }

  const competencies: HrCsfCompetencyRecord[] = [
    {
      id: "csf-comp-leadership",
      organizationId,
      code: "LEAD-001",
      name: "Leadership",
      category: "leadership",
      description: "Guides teams toward outcomes with clarity and accountability.",
      status: "active",
      proficiencyScale: ["beginner", "working", "competent", "advanced", "expert"],
    },
    {
      id: "csf-comp-communication",
      organizationId,
      code: "COMM-001",
      name: "Communication",
      category: "behavioral",
      description: "Conveys ideas clearly across stakeholders.",
      status: "active",
      proficiencyScale: ["beginner", "working", "competent", "advanced", "expert"],
    },
  ];

  const skills: HrCsfSkillRecord[] = [
    {
      id: "csf-skill-react",
      organizationId,
      code: "TECH-REACT",
      name: "React development",
      category: "engineering",
      description: "Builds accessible UI with React and TypeScript.",
      status: "active",
      proficiencyScale: ["beginner", "working", "competent", "advanced", "expert"],
    },
    {
      id: "csf-skill-sql",
      organizationId,
      code: "TECH-SQL",
      name: "SQL & data modeling",
      category: "engineering",
      description: "Designs queries and schema for operational reporting.",
      status: "active",
      proficiencyScale: ["beginner", "working", "competent", "advanced", "expert"],
    },
    {
      id: "csf-skill-coaching",
      organizationId,
      code: "SOFT-COACH",
      name: "Coaching",
      category: "leadership",
      description: "Develops others through structured feedback.",
      status: "active",
      proficiencyScale: ["beginner", "working", "competent", "advanced", "expert"],
    },
  ];

  for (const row of competencies) {
    store.competencies.set(row.id, row);
  }
  for (const row of skills) {
    store.skills.set(row.id, row);
  }

  store.roleRequirements = [
    {
      id: "csf-req-senior-eng-react",
      organizationId,
      roleCode: "SR-ENG",
      roleName: "Senior Engineer",
      jobFamily: "Engineering",
      grade: "G5",
      departmentName: "Product Engineering",
      itemKind: "skill",
      itemCode: "TECH-REACT",
      itemName: "React development",
      requirementKind: "critical",
      requiredLevel: "advanced",
    },
    {
      id: "csf-req-senior-eng-sql",
      organizationId,
      roleCode: "SR-ENG",
      roleName: "Senior Engineer",
      jobFamily: "Engineering",
      grade: "G5",
      departmentName: "Product Engineering",
      itemKind: "skill",
      itemCode: "TECH-SQL",
      itemName: "SQL & data modeling",
      requirementKind: "mandatory",
      requiredLevel: "competent",
    },
    {
      id: "csf-req-senior-eng-lead",
      organizationId,
      roleCode: "SR-ENG",
      roleName: "Senior Engineer",
      jobFamily: "Engineering",
      grade: "G5",
      departmentName: "Product Engineering",
      itemKind: "competency",
      itemCode: "LEAD-001",
      itemName: "Leadership",
      requirementKind: "preferred",
      requiredLevel: "working",
    },
    {
      id: "csf-req-eng-mgr-coach",
      organizationId,
      roleCode: "ENG-MGR",
      roleName: "Engineering Manager",
      jobFamily: "Engineering",
      grade: "G6",
      departmentName: "Product Engineering",
      itemKind: "skill",
      itemCode: "SOFT-COACH",
      itemName: "Coaching",
      requirementKind: "critical",
      requiredLevel: "advanced",
    },
  ];

  store.employeeProficiencies = [
    {
      id: "csf-prof-emp001-react",
      organizationId,
      employeeId: "emp-001",
      employeeDisplayName: "Alex Chen",
      employeeNumber: "EMP-001",
      departmentName: "Product Engineering",
      jobFamily: "Engineering",
      grade: "G4",
      roleCode: "ENG",
      roleName: "Engineer",
      itemKind: "skill",
      itemCode: "TECH-REACT",
      itemName: "React development",
      currentLevel: "competent",
      lastAssessedAt: "2026-05-01T00:00:00.000Z",
      assessorKind: "manager",
      evidenceSummary: "Shipped Lynx shell components.",
    },
    {
      id: "csf-prof-emp001-sql",
      organizationId,
      employeeId: "emp-001",
      employeeDisplayName: "Alex Chen",
      employeeNumber: "EMP-001",
      departmentName: "Product Engineering",
      jobFamily: "Engineering",
      grade: "G4",
      roleCode: "ENG",
      roleName: "Engineer",
      itemKind: "skill",
      itemCode: "TECH-SQL",
      itemName: "SQL & data modeling",
      currentLevel: "working",
      lastAssessedAt: "2026-05-01T00:00:00.000Z",
      assessorKind: "manager",
    },
    {
      id: "csf-prof-emp002-react",
      organizationId,
      employeeId: "emp-002",
      employeeDisplayName: "Jordan Lee",
      employeeNumber: "EMP-002",
      departmentName: "Product Engineering",
      jobFamily: "Engineering",
      grade: "G5",
      roleCode: "SR-ENG",
      roleName: "Senior Engineer",
      itemKind: "skill",
      itemCode: "TECH-REACT",
      itemName: "React development",
      currentLevel: "advanced",
      lastAssessedAt: "2026-05-10T00:00:00.000Z",
      assessorKind: "hr",
    },
    {
      id: "csf-prof-emp002-coach",
      organizationId,
      employeeId: "emp-002",
      employeeDisplayName: "Jordan Lee",
      employeeNumber: "EMP-002",
      departmentName: "Product Engineering",
      jobFamily: "Engineering",
      grade: "G5",
      roleCode: "SR-ENG",
      roleName: "Senior Engineer",
      itemKind: "skill",
      itemCode: "SOFT-COACH",
      itemName: "Coaching",
      currentLevel: "competent",
      lastAssessedAt: "2026-05-10T00:00:00.000Z",
      assessorKind: "manager",
    },
    {
      id: "csf-prof-emp002-lead",
      organizationId,
      employeeId: "emp-002",
      employeeDisplayName: "Jordan Lee",
      employeeNumber: "EMP-002",
      departmentName: "Product Engineering",
      jobFamily: "Engineering",
      grade: "G5",
      roleCode: "SR-ENG",
      roleName: "Senior Engineer",
      itemKind: "competency",
      itemCode: "LEAD-001",
      itemName: "Leadership",
      currentLevel: "working",
      lastAssessedAt: "2026-05-10T00:00:00.000Z",
      assessorKind: "self",
    },
  ];

  store.gaps = store.roleRequirements.flatMap((req) => {
    const matches = store.employeeProficiencies.filter(
      (prof) =>
        prof.employeeId === "emp-001" &&
        prof.itemKind === req.itemKind &&
        prof.itemCode === req.itemCode,
    );
    const current = matches[0]?.currentLevel ?? "beginner";
    const gapLevels = proficiencyIndex(req.requiredLevel) - proficiencyIndex(current);
    if (gapLevels <= 0) {
      return [];
    }

    const severity: HrCsfGapSeverity =
      gapLevels >= 3 ? "critical" : gapLevels >= 2 ? "high" : gapLevels >= 1 ? "moderate" : "low";

    return [
      {
        id: `csf-gap-emp001-${req.itemCode}`,
        organizationId,
        employeeId: "emp-001",
        employeeDisplayName: "Alex Chen",
        departmentName: req.departmentName,
        roleCode: req.roleCode,
        jobFamily: req.jobFamily,
        grade: req.grade,
        gapKind: req.itemKind,
        itemCode: req.itemCode,
        itemName: req.itemName,
        requiredLevel: req.requiredLevel,
        currentLevel: current,
        severity,
        priority: severity === "critical" ? "P1" : "P2",
        developmentUrgency: req.requirementKind === "critical" ? "immediate" : "planned",
        recommendedActions: [
          req.itemKind === "skill" ? "Enroll in targeted course" : "Manager coaching plan",
        ],
        linkedCourseCodes:
          req.itemCode === "TECH-REACT"
            ? ["LMS-REACT-201"]
            : req.itemCode === "TECH-SQL"
              ? ["LMS-SQL-101"]
              : [],
      } satisfies HrCsfGapRecord,
    ];
  });
}

export function ensureHrCsfOrgStore(organizationId: string): OrgCsfStore {
  seedDemoData(organizationId);
  return getOrgStore(organizationId);
}

export function listHrCsfCompetenciesFromStore(organizationId: string) {
  const store = ensureHrCsfOrgStore(organizationId);
  return [...store.competencies.values()];
}

export function listHrCsfSkillsFromStore(organizationId: string) {
  const store = ensureHrCsfOrgStore(organizationId);
  return [...store.skills.values()];
}

export function listHrCsfGapsFromStore(
  organizationId: string,
  visibleEmployeeIds?: readonly string[] | null,
) {
  const store = ensureHrCsfOrgStore(organizationId);
  return store.gaps.filter((gap) => {
    if (!visibleEmployeeIds) {
      return true;
    }
    return visibleEmployeeIds.includes(gap.employeeId);
  });
}

export function listHrCsfEmployeeProficienciesFromStore(
  organizationId: string,
  visibleEmployeeIds?: readonly string[] | null,
) {
  const store = ensureHrCsfOrgStore(organizationId);
  return store.employeeProficiencies.filter((row) => {
    if (!visibleEmployeeIds) {
      return true;
    }
    return visibleEmployeeIds.includes(row.employeeId);
  });
}

export function listHrCsfRoleRequirementsFromStore(organizationId: string) {
  const store = ensureHrCsfOrgStore(organizationId);
  return store.roleRequirements;
}

export function appendHrCsfAuditEventToStore(input: {
  organizationId: string;
  action: string;
  summary: string;
  actorAuthUserId?: string | null;
  employeeId?: string | null;
  itemCode?: string | null;
  metadata?: Record<string, unknown> | null;
}): HrCsfAuditEventRecord {
  const store = ensureHrCsfOrgStore(input.organizationId);
  store.auditSequence += 1;
  const event: HrCsfAuditEventRecord = {
    id: `csf-audit-${store.auditSequence}`,
    organizationId: input.organizationId,
    action: input.action,
    summary: input.summary,
    actorAuthUserId: input.actorAuthUserId ?? null,
    employeeId: input.employeeId ?? null,
    itemCode: input.itemCode ?? null,
    metadata: input.metadata ?? null,
    createdAt: new Date().toISOString(),
  };
  store.audit.unshift(event);
  return event;
}

export function listHrCsfAuditEventsFromStore(input: {
  organizationId: string;
  limit?: number;
  search?: string;
}) {
  const store = ensureHrCsfOrgStore(input.organizationId);
  const limit = Math.min(Math.max(input.limit ?? 25, 1), 100);
  const trimmed = input.search?.trim().toLowerCase();
  const filtered = store.audit.filter((event) => {
    if (!trimmed) {
      return true;
    }
    const haystack = [event.action, event.summary, event.itemCode, event.employeeId]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    return haystack.includes(trimmed);
  });
  const rows = filtered.slice(0, limit);
  return {
    rows,
    pageSize: limit,
    totalCount: filtered.length,
    hasNextPage: filtered.length > limit,
  };
}

export { proficiencyIndex };
