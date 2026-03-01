# Assessment Rubric
> Load when: writing an assessment artefact to .framework/assessments/
> Governs assessment output format, verdict criteria, and scope of recommendations

---

## Output Format

Write to: `.framework/assessments/[artefact-slug]-[date].md`

```
ASSESSED:     [artefact path]
DATE:         [ISO date]
VERDICT:      ALIGNED | PARTIALLY ALIGNED | MISALIGNED

OBSERVATIONS:
  [what the artefact does well — be specific, cite the principle or rule it honours]
  [do not omit observations on passing artefacts — positive findings have learning value]

ISSUES:
  [rule or principle violations — cite the specific rule, not a vague concern]
  [for each issue: state what it is / why it matters / what zone it affects]

RECOMMENDATIONS:
  [specific and actionable — one recommendation per issue]
  [do not recommend actions requiring a Product Owner decision — flag those under OPEN QUESTION]

OPEN QUESTION:
  [if any finding requires a human decision, state it here as a single clear question]
  [if none: NONE]

FRAMEWORK NOTES:
  [does this artefact reveal a pattern worth adding to the knowledge base?]
  [does it surface a new assumption to add to the assumption log?]
  [does it expose a gap in the current skill set or instruction files?]
```

---

## Verdict Criteria

### ALIGNED
- All agent-design rules pass (see checklist below)
- All cited principles are honoured
- No open question that requires human decision
- NEVER issue ALIGNED if there is an unresolved OPEN QUESTION

### PARTIALLY ALIGNED
- Passes most agent-design rules
- One or two issues that are correctable without structural redesign
- Open question present but does not block function
- OR: aligned with current framework state but misaligned with the vision (flag in FRAMEWORK NOTES)

### MISALIGNED
- Multiple agent-design rule failures
- Violates one or more of the seven principles in a structural way
- Would create coordination overhead rather than reduce it
- OR: context boundaries are wrong in a way that would cause silent failures

---

## Agent-Design Checklist (apply to every agent spec assessment)

### YAML Frontmatter
  [ ] description is a single plain line — no block scalar
  [ ] tools is an inline array
  [ ] model is an inline array
  [ ] each handoff prompt is a single line

### READS
  [ ] declares named files only — no categories or directory paths
  [ ] every named file exists in context-tree.md
  [ ] no file added to READS without a corresponding context-tree.md entry
  [ ] every named file exists on disk (NEVER assess a spec with a READS pointing to nothing)

### WRITES
  [ ] exactly one artefact declared
  [ ] exactly one output path declared

### NEVER
  [ ] at least two explicit exclusions
  [ ] written as paths, not categories

### Instruction format
  [ ] imperative shorthand — no prose, no job descriptions
  [ ] critical rules appear before the SKILL pointer
  [ ] NEVER boundaries appear at the bottom
  [ ] nothing important buried in the middle

### File size
  [ ] body is under 60 lines
  [ ] all substantive content is in skill reference files, not the agent body

### Skill pointer
  [ ] matches a name in SKILLS-INVENTORY.md
  [ ] no more than one skill loaded at startup (others must be trigger-loaded within the skill)

### Context boundaries
  [ ] partitioned by context need, not organisational role
  [ ] does not read what it writes
  [ ] orchestrators: receive paths only, never accumulate artefact content
  [ ] executors: receive minimum context needed to produce exactly one artefact

### Failure modes
  [ ] covers: missing input case
  [ ] covers: filesearch zero-result case
  [ ] covers: context conflict case (if the agent reads multiple files)

### Token budget
  [ ] declared
  [ ] justified by the READS set (is the budget plausible given named files?)

---

## Advisory Mode (when answering a strategic question, not reviewing an artefact)

OPERATION:
  1. Load framework-strategy skill — four primitives, seven principles, HMW questions
  2. Load current-state context — open-questions.md, and retros/experiments if available
  3. Load the specific artefact or context under discussion (if provided)
  4. Answer from the intersection of: where we are now + where we are going + the rules
  5. Surface any assumption the question depends on that is currently untested
  6. Do not recommend actions that belong to the Product Owner — flag them

WATCH FOR:
  - Questions whose framing assumes a maturity level the framework hasn't reached
  - Recommendations that would add agent boundaries without reducing context or enabling parallelisation
  - Premature optimisation for scale when Zone 3→4 loop is not yet stable

---

## Assessment Mode (reviewing a submitted artefact)

OPERATION:
  1. Load framework-strategy skill
  2. Load the specific artefact only — do not load sibling artefacts unless needed
  3. Assess against: agent-design rules, four primitives, seven principles
  4. Run the agent-design checklist (above) for agent spec artefacts
  5. Write assessment to .framework/assessments/[artefact-slug]-[date].md
  6. If finding requires human decision — use Escalate to Product Owner handoff

SCOPE DISCIPLINE:
  - Assess the artefact in isolation against its declared purpose
  - Do not redesign — identify issues and recommend; let the author revise
  - One recommendation per issue — do not over-prescribe the solution
