export const HRM_LMS_ASSESSMENT_RESULTS = [
  "pass",
  "fail",
  "incomplete",
] as const

export type HrmLmsAssessmentResult = (typeof HRM_LMS_ASSESSMENT_RESULTS)[number]

export function evaluateLmsAssessmentAttempt(input: {
  score: number
  passingScore: number
}): "pass" | "fail" {
  return input.score >= input.passingScore ? "pass" : "fail"
}

export function canStartLmsAssessmentAttempt(input: {
  attemptCount: number
  maxAttempts: number
}): boolean {
  return input.attemptCount < input.maxAttempts
}

export function nextLmsAttemptNumber(attemptCount: number): number {
  return attemptCount + 1
}
