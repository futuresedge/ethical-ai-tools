# Retro Report Format
> Load when: writing the retrospective report
> Every section is required. Use NONE for sections with no content — never omit.

---

## File naming

`.framework/progress/retros/retro-[sprint-slug]-[date].md`

Example: `retro-navbar-sprint-20260301.md`

Sprint slug: a short descriptor of the sprint or feature scope —
  single feature: use the feature slug (e.g., `navbar`)
  multi-feature: use a sprint label (e.g., `sprint-07`)

---

## Report template

```
# Retrospective Report
SPRINT:    [sprint slug]
DATE:      [ISO date]
SCOPE:     [list of features and tasks covered]
STATUS:    DRAFT

---

## 1. Sprint Summary

[2–4 sentences. What was worked on. How many features, how many tasks.
Number of review cycles (total artefacts reviewed, total RETURNED, total ACCEPTED).
Do not evaluate yet — this section is factual only.]

---

## 2. What Worked

[Confirmation signals only. Each entry cites the mechanism that worked and the artefact that confirms it.
Format per entry:]

### [Short title]
MECHANISM: [which primitive or principle this confirms]
EVIDENCE:  [file path — specific finding in one sentence]

[If no confirmation signals: NONE — no clean-run signals detected this sprint.]

---

## 3. Where Friction Occurred

[Friction signals only. Each entry includes the finding, root, and zone affected.
Format per entry:]

### [Short title]
SOURCE:   [file path]
FINDING:  [what the review revealed — one sentence]
ROOT:     [skill gap | agent spec gap | rule ambiguity | process gap | context preparation gap]
ZONE:     [which zone generated this friction]

[If no friction signals: NONE — no returned verdicts or uncertainty events this sprint.]

---

## 4. Patterns Detected

[Patterns identified across multiple signals — not individual issues.
A pattern requires at least two signals that share the same root.
Format per entry:]

### [Pattern name]
SIGNALS:  [list of SOURCE files that contributed to this pattern]
PATTERN:  [what they have in common — one sentence]
IMPACT:   [which zone or agent type is most affected]

[If no patterns: NONE — insufficient signal volume to detect cross-artefact patterns.]

---

## 5. Assumption Evidence

[Evidence gathered this sprint on the top 10 load-bearing assumptions.
Only list assumptions where evidence was found. Skip assumptions with no evidence.
Format per entry:]

### Assumption [number]: [short name]
DIRECTION: FOR | AGAINST | NEUTRAL
EVIDENCE:  [specific finding — one sentence]
SOURCE:    [file path]

[If no assumption evidence: NONE — no sprint artefacts provided evidence on the top 10 assumptions.]

---

## 6. Open Questions

[Unresolved questions surfaced this sprint — from uncertainty-logs with no resolution,
from Framework Owner assessments with an OPEN QUESTION field, or from patterns with no clear fix.
Format per entry:]

### OQ-NEW-[sequential label for this retro]
WHAT:    [what is unresolved — one sentence]
WHY:     [what depends on it]
RESOLVE: [what information or decision would close it]
ACTION:  Hand off to Framework Owner to log in open-questions.md

[If no new open questions: NONE.]

---

## 7. Recommendations

[Specific and actionable. One recommendation per issue or pattern.
Categorised by target. No bundling — each recommendation is a single action.
Format per entry:]

### [Short title]
TARGET:  SKILL | AGENT SPEC | PROCESS | RULE
FILE:    [exact file path that should be changed, if known]
ACTION:  [imperative — one sentence. e.g., "Add atomicity check to ac-review checklist"]
REASON:  [which friction signal or pattern this resolves — cite source]

[If no recommendations: NONE — all issues resolved within the sprint.]

---

## 8. Questions Closed This Sprint

[Open questions from open-questions.md that received a conclusive answer this sprint.
Format per entry:]

### OQ-[number]: [short name]
CLOSED BY: [evidence or decision that resolved it]
SOURCE:    [file path]

[If none: NONE.]

---

## Facilitator Notes

[Optional. Any meta-observation about this retro itself — was signal volume sufficient?
Were there artefacts that should have existed but didn't (missing review files, absent uncertainty logs)?
Is the scope of this retro the right granularity?]

STATUS: DRAFT — requires Product Owner review and acceptance before STATUS: ACCEPTED.
```

---

## Section writing rules

### Section 2 (What Worked)
- Minimum one entry if any ACCEPTED artefact exists
- Never write "nothing worked" — if the feature shipped, something worked
- Cite the mechanism by name (Evidence Gate, Environment Contract, etc.) when applicable

### Section 3 (Where Friction Occurred)
- ROOT must be one of: skill gap | agent spec gap | rule ambiguity | process gap | context preparation gap
- Never assign ROOT to "the feature was complex" or "the agent made a mistake"
- If the root is unclear: write ROOT: UNKNOWN and surface in Open Questions

### Section 5 (Assumption Evidence)
- Only include assumptions where THIS SPRINT produced evidence — do not speculate
- DIRECTION: NEUTRAL means evidence exists but is inconclusive — explain why in EVIDENCE field
- High value: Assumptions 1, 2, 3, 5 (most likely to surface in early sprints)

### Section 7 (Recommendations)
- TARGET must be one of: SKILL | AGENT SPEC | PROCESS | RULE
- FILE must be exact — if you cannot name the exact file, write FILE: TBD and explain in REASON
- ACTION must be imperative and completable — "Review the skill" is not an action; "Add X to Y" is
- Maximum 5 recommendations per retro — prioritise by impact
- If more than 5 candidates exist, note the rest under Facilitator Notes

### Section 8 (Closed Questions)
- Check every OQ- entry in open-questions.md against sprint artefacts
- A question is CLOSED only if the artefact provides a conclusive answer — not just partial evidence
- Partial evidence → update the existing OQ entry's STATUS to INVESTIGATING (hand off to Framework Owner)
