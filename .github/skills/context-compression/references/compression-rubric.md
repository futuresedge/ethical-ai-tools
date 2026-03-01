# Context Compression Rubric
> The decision framework for the Curate Context agent.
> Applied to every source artefact before including in context-package.md.

---

## The compression goal

OUTPUT: the minimum sufficient set of tokens for the Task Performer to:
  - understand exactly what they must produce
  - understand exactly what constraints apply
  - understand exactly what done looks like
  - and nothing else

NOT the goal: comprehensive context
NOT the goal: context the performer might find useful
NOT the goal: context that explains the feature's history or rationale

---

## The four-pass rubric

Apply these passes in order. Stop including content when a pass fails.

### Pass 1 — Does the Task Performer need to act on this?

INCLUDE if: the content directly constrains or informs a decision the performer must make
EXCLUDE if: the content is background, rationale, or history

INCLUDE: "The form uses @formspree/react. Form ID comes from VITE_FORMSPREE_FORM_ID."
EXCLUDE: "Formspree was chosen because it avoids storing sensitive data server-side."

### Pass 2 — Is it already distilled downstream?

If the information exists in a more specific form in a downstream artefact — use the
downstream version. Do not include both.

INCLUDE: task-ac.md condition TAC-commissions-form-01
EXCLUDE: feature AC condition FAC-commissions-03 (already distilled into TAC)

INCLUDE: task-spec.md constraint "must not trigger a full page reload"
EXCLUDE: feature-spec.md section 4.2 that this constraint was derived from

### Pass 3 — Is it verifiable in this task's scope?

INCLUDE if: the performer can produce or verify this outcome within this task alone
EXCLUDE if: verification requires another task to be complete first

EXCLUDE: integration behaviour that depends on a sibling task
INCLUDE: explicit note that integration behaviour is out of scope for this task

### Pass 4 — Does it conflict with anything already included?

IF conflict detected: do not include either version — write to uncertainty-log
See conflict-detection.md for conflict handling rules

---

## What always goes in the context-package

ALWAYS INCLUDE:
- task-ac.md (complete, unmodified)
- task-tests.md (complete, unmodified)
- Relevant sections of ui-artefact.md (sections that apply to this task only)
- Stack constraints from AGENTS.md relevant to this task's output type
- Output path and file naming convention for this task
- Environment constraints relevant to this task

ALWAYS EXCLUDE:
- feature-spec.md (distilled into task-spec, then task-ac)
- feature-level acceptance-criteria.md (distilled into task-ac)
- sibling task files
- Agent instructions or skill content
- Rationale for design decisions (unless it directly constrains implementation)

---

## Token discipline

BEFORE writing context-package: estimate token count of each candidate section
AFTER assembling: check total is within budget (~4k tokens target)
IF over budget: apply Pass 1 again — something that seemed necessary is not

The context-package being small is a quality signal, not a risk.
A large context-package means the curation has not been done — it means
the raw artefacts have been concatenated and passed on.
