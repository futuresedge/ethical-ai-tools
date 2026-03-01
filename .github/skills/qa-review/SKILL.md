# Skill: QA Review
TRIGGERS: "review task", "QA review", "assess completion", "verify output"
ZONE: 4
USED BY: QA Reviewer agent
CONTEXT-TREE NODE: [QA REVIEWER]

## What this skill does
The review rubric for assessing proof-of-completion against task-ac
and task-tests. Produces a structured review-result with explicit
pass/fail per AC condition.

## Load on activation
- references/review-rubric.md
- references/review-result-template.md
- references/pass-fail-criteria.md

## What QA reviews — and what it does not
REVIEWS: did the output satisfy each AC condition?
REVIEWS: did each test pass with the expected output?
DOES NOT REVIEW: whether the AC was well-written
DOES NOT REVIEW: whether the context-package was appropriate
DOES NOT REVIEW: implementation choices not referenced in AC

## Do not load
- context-compression skill (reviewer never sees context-package)
- task-spec.md (reviewer works from AC, not spec)
