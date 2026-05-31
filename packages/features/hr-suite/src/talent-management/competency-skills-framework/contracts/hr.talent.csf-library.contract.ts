export type HrCsfLibraryListRow = {
  readonly id: string;
  readonly code: string;
  readonly name: string;
  readonly libraryStatus: string;
};

export type HrCsfCompetencyListRow = HrCsfLibraryListRow & {
  readonly category: string;
  readonly proficiencyScaleId: string;
};

export type HrCsfSkillListRow = HrCsfLibraryListRow & {
  readonly category: string;
  readonly proficiencyScaleId: string;
};

export type HrCsfProficiencyScaleSummary = {
  readonly id: string;
  readonly code: string;
  readonly name: string;
  readonly description: string | null;
  readonly scaleStatus: string;
};

export type HrCsfProficiencyLevelSummary = {
  readonly id: string;
  readonly levelOrder: number;
  readonly code: string;
  readonly name: string;
  readonly description: string;
  readonly assessmentCriteria: string;
};

export type HrCsfCompetencySummary = {
  readonly id: string;
  readonly code: string;
  readonly name: string;
  readonly category: string;
  readonly description: string | null;
  readonly libraryStatus: string;
  readonly proficiencyScaleId: string;
  readonly scaleCode: string;
  readonly scaleName: string;
};

export type HrCsfSkillSummary = {
  readonly id: string;
  readonly code: string;
  readonly name: string;
  readonly category: string;
  readonly description: string | null;
  readonly libraryStatus: string;
  readonly proficiencyScaleId: string;
  readonly scaleCode: string;
  readonly scaleName: string;
};

export type HrCsfRequirementMappingRow = {
  readonly id: string;
  readonly scope: string;
  readonly scopeRef: string;
  readonly requiredProficiencyLevelId: string;
  readonly levelCode: string;
  readonly levelName: string;
  readonly levelOrder: number;
  readonly notes: string | null;
};

export type HrCsfCompetencyRequirementRow = HrCsfRequirementMappingRow & {
  readonly competencyId: string;
  readonly competencyCode: string;
  readonly competencyName: string;
};

export type HrCsfSkillRequirementRow = HrCsfRequirementMappingRow & {
  readonly skillId: string;
  readonly skillCode: string;
  readonly skillName: string;
  readonly requirementClass: string;
};
