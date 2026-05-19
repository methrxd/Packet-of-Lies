export const caseStatusOptions = [
  "new",
  "triage",
  "investigating",
  "contained",
  "resolved",
  "archived",
] as const;

export const caseSeverityOptions = [
  "low",
  "medium",
  "high",
  "critical",
] as const;

export const casePriorityOptions = ["p0", "p1", "p2", "p3"] as const;

export const submissionTypeOptions = [
  "file",
  "url",
  "domain",
  "ip",
  "email_artifact",
  "manual_incident",
] as const;

export type CaseStatus = (typeof caseStatusOptions)[number];
export type CaseSeverity = (typeof caseSeverityOptions)[number];
export type CasePriority = (typeof casePriorityOptions)[number];
export type SubmissionType = (typeof submissionTypeOptions)[number];
