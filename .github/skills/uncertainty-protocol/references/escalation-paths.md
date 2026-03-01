# Escalation Paths
> Who resolves what, at which zone, in what order.

---

## Zone 2 — Feature Definition

RAISED BY: Define Feature, Write Feature AC, Design UI, Write Feature Tests,
           Decompose to Tasks agents

FIRST: surface to Feature Orchestrator
  → Orchestrator checks whether the question is answerable from existing artefacts
  → If yes: return correct artefact reference to the raising agent
  → If no: escalate to Product Owner

SECOND: Product Owner
  → Product Owner makes the decision and updates the relevant artefact
  → Feature Orchestrator notifies raising agent that context has changed
  → Raising agent re-reads updated artefact and resumes

NEVER: Zone 2 agents resolve uncertainty by inference or assumption.
       If the Product Owner is unavailable: task enters BLOCKED state. Wait.

---

## Zone 3 — Task Preparation

RAISED BY: Define Task, Write Task AC, Curate Context, Write Task Tests agents

FIRST: check whether the uncertainty was already raised in Zone 2
  → If yes: uncertainty-log.md already has a RESOLVED entry — read it
  → If no: escalate to Advisor Agent

SECOND: Advisor Agent
  READS: uncertainty-log.md + context-package + AGENTS.md
  DOES: researches whether the question is answerable from existing framework artefacts
  IF RESOLVED: updates uncertainty-log.md with RESOLUTION, marks STATUS: RESOLVED
  IF NOT RESOLVED: marks STATUS: ESCALATED, surfaces to Product Owner

THIRD: Product Owner (via Advisor Agent escalation only)

---

## Zone 4 — Task Execution

RAISED BY: Task Performer agent

FIRST: check uncertainty-log.md for this task
  → If a prior RESOLVED entry covers this question: read it and proceed
  → If not: write new UNCERTAINTY-[n] entry and yield

SECOND: Advisor Agent
  READS: context-package.md + uncertainty-log.md + AGENTS.md
  DOES NOT READ: feature-spec.md, sibling task files
  IF RESOLVED: updates uncertainty-log.md, Task Performer resumes
  IF NOT RESOLVED: marks ESCALATED

THIRD: Product Owner
  → Only via Advisor Agent escalation
  → Product Owner decision updates the relevant artefact (usually task-ac.md or task-spec.md)
  → Context Agent re-curates context-package.md with updated artefact
  → Task Performer receives updated context-package and resumes

---

## QA Reviewer escalation

RAISED BY: QA Reviewer agent

QA CANNOT ESCALATE TO: Advisor Agent
QA ESCALATES TO: Task Owner Agent (Zone 3) if the issue is with AC quality
QA ESCALATES TO: Product Owner if the issue is with feature-scope AC

REASON: QA reviews against AC. If the output fails, the issue is either:
  - The implementation (return task to Task Performer with review-result)
  - The AC is wrong or ambiguous (escalate to Task Owner / Product Owner)
  QA never resolves ambiguous AC by inference.

---

## Timing and waiting

Agents do not retry autonomously.
When STATUS is OPEN or ESCALATED — the agent stops and waits.
The Observable Stream emits a TaskBlocked event.
Re-activation happens when the uncertainty-log entry is marked RESOLVED
by the appropriate authority.

---

## Infinite loop prevention

IF a task has accumulated 3 or more OPEN uncertainties with no RESOLVED entries:
  Task is marked BLOCKED at feature level
  Feature Orchestrator surfaces to Product Owner with full uncertainty-log
  Product Owner reviews whether the feature definition is fundamentally incomplete
  Feature may be returned to Zone 2 for redefinition

IF the same uncertainty is raised more than once on the same task:
  The second entry must reference the first: DUPLICATE OF: UNCERTAINTY-[n]
  If the first was marked RESOLVED but the same question re-emerges:
    The resolution was insufficient — flag this explicitly in the new entry