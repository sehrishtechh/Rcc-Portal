# Workflows

## Employee onboarding

Public signup creates an Auth identity and a pending profile with no role. An organization administrator reviews the request and assigns a role. Pending and rejected users must not read project, inspection, report, or file data.

## Inspection to report

An administrator schedules an inspection and assigns an inspector. The inspector saves observations and private photo evidence, then submits the inspection. An authorized report writer receives a report task, prepares a version, and submits it for QA. A QA reviewer can approve technical review or request revisions. Final approval is a separate permission-controlled action.

## Design and drafting

Administrators assign design or drafting tasks to authorized employees. Deliverables and revisions attach to the task and project; only authorized assignees and reviewers can access them.

Workflow transitions must be enforced by server-side actions and database permissions, not by frontend state alone.
