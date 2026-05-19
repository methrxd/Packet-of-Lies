# Packet of Lies Phase 0 Foundation

## Purpose

Packet of Lies is a malware investigation operations platform for internal security teams.

The v1 product is not a public cyber portal, not a training product, and not a malware execution lab. It is an analyst-facing workspace for receiving suspicious material, turning it into structured evidence, tracking investigations, and documenting mitigations.

## V1 Product Shape

- Product type: internal security operations platform
- Tenancy: single organization
- Access model: invite only
- Primary roles: admin and analyst
- Deployment target: Vercel for app layer, Supabase for backend and storage
- Storage model: all evidence is private by default

## Core Product Principles

- Evidence first: the platform should treat submissions and uploaded files as controlled evidence, not generic content.
- Analyst speed: the shortest path to triage and investigation matters more than decorative dashboards.
- Structured investigation: every action should move raw signals toward findings, mitigations, and a reportable outcome.
- Calm UX: the product should feel reliable and operational, even when the underlying incident is urgent.
- Security by default: private storage, role checks, auditability, and least privilege are required from the beginning.

## V1 Roles

### Admin

- Invite and manage users
- Assign or update roles
- View all cases and submissions
- Manage system-level settings in v1 scope
- Review audit history

### Analyst

- Create and update cases
- Submit suspicious evidence
- Add indicators, findings, mitigations, and comments
- Reassign cases when permitted
- Generate reports

## Product Vocabulary

### Case

A case is the main investigation record. It groups one or more submissions, artifacts, indicators, findings, comments, and mitigation steps under a single investigation lifecycle.

### Submission

A submission is the intake event that brings suspicious material into the system. A submission can represent an uploaded file, URL, IP, domain, email artifact, or manually entered incident note.

### Artifact

An artifact is a concrete evidence object attached to a submission or case. Examples include files, email headers, extracted strings, screenshots, memory notes, or network traces.

### Indicator

An indicator is a structured observable derived from analysis. Examples include SHA256 hashes, domains, IP addresses, URLs, filenames, mutexes, registry keys, and process names.

### Finding

A finding is an analyst conclusion or evidence-backed observation. Findings explain what the evidence means, not just what was collected.

### Mitigation

A mitigation is a recommended or completed response action. Examples include blocking a domain, isolating a host, resetting credentials, or increasing monitoring.

### Comment

A comment is freeform analyst collaboration attached to a case or related object.

### Activity Log

An activity log is a timestamped record of important user or system actions for audit and investigation continuity.

## Case Lifecycle

Cases move through the following statuses in v1:

- `new`: created but not yet triaged
- `triage`: initial classification and severity review in progress
- `investigating`: active analyst work is underway
- `contained`: the immediate threat has been controlled or isolated
- `resolved`: the investigation is complete and the response is documented
- `archived`: closed and retained for reference, reporting, or audit

### Lifecycle Rules

- Every new case starts in `new`.
- A case can only move to `contained` after it has entered `investigating`.
- A case can only move to `resolved` after there is at least one finding or mitigation recorded.
- `archived` is a terminal state for v1 UI purposes, but archived cases remain searchable.

## Severity Model

Severity indicates likely operational impact:

- `low`: suspicious but limited impact or low confidence
- `medium`: meaningful threat signal requiring analyst action
- `high`: confirmed malicious behavior or strong business risk
- `critical`: active or near-immediate threat to key systems, data, or users

## Priority Model

Priority indicates handling urgency:

- `p3`: can be handled in normal analyst flow
- `p2`: should be investigated soon
- `p1`: should be handled next
- `p0`: requires immediate attention

Severity and priority are separate so analysts can distinguish business urgency from technical severity.

## Submission Types

The v1 system accepts these submission types:

- `file`
- `url`
- `domain`
- `ip`
- `email_artifact`
- `manual_incident`

## Indicator Types

The initial supported indicator set is:

- `sha256`
- `md5`
- `sha1`
- `domain`
- `ip`
- `url`
- `filename`
- `email`
- `process_name`
- `registry_key`
- `mutex`

## Navigation Model

The primary app navigation for v1 is:

- Dashboard
- Cases
- Submissions
- Indicators
- Reports
- Admin

### Navigation Notes

- `Admin` is visible only to admins.
- Case detail pages act as the main investigation workspace.
- Dashboard should show operational state, not marketing metrics.

## Main V1 Screens

### Dashboard

- case counts by status
- severity distribution
- recent submissions
- recent activity
- urgent items needing attention

### Cases

- searchable case list
- filters by status, severity, assignee, and tags
- create case flow
- case detail view with timeline and related evidence

### Submissions

- intake form
- submission list
- evidence metadata view
- linkage to case records

### Indicators

- searchable indicator list
- indicator detail and linked cases
- de-duplication behavior by type and normalized value

### Reports

- case summary view
- structured incident report output

### Admin

- invite users
- manage roles
- review basic audit records

## Security and Access Defaults

- All application routes are protected after sign-in except auth entry points.
- All file uploads are stored in private buckets.
- Direct public URLs for evidence are forbidden.
- Role checks must exist both in the UI and backend access layer.
- Row-level security is required for all exposed data tables.
- Audit events should be recorded for case creation, status changes, evidence submission, invite actions, and role changes.

## Deferred from V1

These are intentionally not part of the first build phase:

- live malware execution
- dynamic sandbox orchestration
- reverse engineering workbench
- SIEM or EDR integrations
- multi-tenant customer organizations
- public signup
- automated threat-intel enrichment

## Acceptance Criteria for Phase 0

Phase 0 is complete when:

- the product vocabulary is locked
- roles are defined
- case lifecycle is locked
- severity and priority models are defined
- navigation is defined
- V1 scope boundaries are explicit
