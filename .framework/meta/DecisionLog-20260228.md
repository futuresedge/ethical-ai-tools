Decisions made that should be logged
These are commitments made during the session that need to be written somewhere permanent:

Agents partition by context need, not organisational role

Orchestrators receive paths and summaries only — never artefact content

Every agent has an explicit read budget — READS, WRITES, NEVER

No executor agent begins work without a prior context curation event

The Context Agent is a compression agent — its input is intentionally larger than its output

Batch processing for high-value caching targets — Context Agent, Test Writer, QA Reviewer process all tasks in a feature sequentially before execution begins

Agent instructions should read like a linter config, not documentation

Static rules first in every agent file, dynamic context last — maximises cache hit rate and attention placement

Skills carry the weight that agent files shouldn't — substantive, stable, cacheable

Measure everything — VS Code export + observable stream events as the telemetry layer



Given that this is a play environment for learning and discovery, you want the fastest path to a working loop — not a complete implementation. The goal is to run one feature through from idea to verified task as quickly as possible, then iterate.

## Start With the Foundation, Not the Agents

The agents are useless without two things in place first: a codebase to work on, and the always-on instructions that shape every agent's behaviour. Setting up the agents before these is building on sand. [ppl-ai-file-upload.s3.amazonaws](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/collection_f8ffc8cb-ddc4-4340-8bce-21d7722606ba/fb072e70-71ab-4bee-b66d-4586546dcecc/Customize_AI_in_Visual_Studio_Code.md)

**Step 1 — Pick and scaffold your starter template (30 min)**
Choose a template you're already comfortable with so the tech stack doesn't become a learning variable on top of the framework. A simple Next.js or React + Node API starter is enough — you just need something with a working test runner, a dev server, and a clear folder structure. Run `init` in VS Code Chat once it's scaffolded — Copilot will analyse the workspace and generate a base `.github/copilot-instructions.md` from what it finds. [ppl-ai-file-upload.s3.amazonaws](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/collection_f8ffc8cb-ddc4-4340-8bce-21d7722606ba/fb072e70-71ab-4bee-b66d-4586546dcecc/Customize_AI_in_Visual_Studio_Code.md)

**Step 2 — Write the always-on instructions (30 min)**
Edit that generated file to add the framework invariants: the no-agent-reviews-its-own-artefact rule, the failure-routes-to-review principle, the proof-of-completion definition, and the sanctuary culture tone. This is the one file that shapes every interaction from here. Keep it under 50 lines — only things that are genuinely true for every agent in every situation. [ppl-ai-file-upload.s3.amazonaws](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/collection_f8ffc8cb-ddc4-4340-8bce-21d7722606ba/fb072e70-71ab-4bee-b66d-4586546dcecc/Customize_AI_in_Visual_Studio_Code.md)

**Step 3 — Write `AGENTS.md` at the repo root (20 min)**
This is the bootstrap context document any agent reads first to understand the project. One paragraph on what the app is, the tech stack with versions, the folder structure, how to run tests, and a pointer to the framework docs. Short and factual. [ppl-ai-file-upload.s3.amazonaws](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/collection_f8ffc8cb-ddc4-4340-8bce-21d7722606ba/447139e2-fa6b-4e6b-8a51-9ff304f0c057/How-to-write-a-great-agents.md)

***

## Then Build One Vertical Slice

Don't set up all seven agents. Build the minimum path for one task to travel from definition to verified completion — three agents, two prompt files, one skill.

**Step 4 — Feature Owner Agent (20 min)**
Just the agent file: zone scope, tools (`read`, `fetch`, `search`), the handoff to Task Owner, and the one-sentence job description. No implementation detail — the always-on instructions carry the invariants. [ppl-ai-file-upload.s3.amazonaws](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/collection_f8ffc8cb-ddc4-4340-8bce-21d7722606ba/e7c23fab-48ad-4ed4-8829-0ce51dc2dd13/Custom_agents_in_VS_Code.md)

**Step 5 — Task Performer Agent (20 min)**
This is the workhorse. Tools: `read`, `edit`, `new`, `runCommands`, `runTests`. Handoff to QA Agent. Boundaries: write to `src/` and `tests/` only, never modify a failing test, always submit literal command output. [ppl-ai-file-upload.s3.amazonaws](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/collection_f8ffc8cb-ddc4-4340-8bce-21d7722606ba/447139e2-fa6b-4e6b-8a51-9ff304f0c057/How-to-write-a-great-agents.md)

**Step 6 — QA Agent (20 min)**
Read-only tools only: `read`, `search`, `runTests`. No editing capability at all — this enforces the no-agent-reviews-its-own-artefact invariant mechanically, not just by instruction. [ppl-ai-file-upload.s3.amazonaws](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/collection_f8ffc8cb-ddc4-4340-8bce-21d7722606ba/e7c23fab-48ad-4ed4-8829-0ce51dc2dd13/Custom_agents_in_VS_Code.md)

**Step 7 — The evidence gate skill (20 min)**
One `SKILL.md` file in `.github/skills/evidence-gate/`. Triggered by "submit proof" or "verify task". Defines what counts as valid proof: literal captured command output, test results with explicit pass/fail per test, coverage report. This is the single most important capability to get right because it's load-bearing for everything that follows. [ppl-ai-file-upload.s3.amazonaws](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/collection_f8ffc8cb-ddc4-4340-8bce-21d7722606ba/c7e35ffd-a23f-4283-9af7-164ab360b1eb/ContextEngineeringSkills-README.md)

**Step 8 — Two prompt files (30 min)**
`/define-feature` — guides Feature Owner through spec → AC → decomposition in one structured workflow.
`/verify-task` — guides QA Agent through loading task contract → running tests → scoring → accept or return. [ppl-ai-file-upload.s3.amazonaws](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/collection_f8ffc8cb-ddc4-4340-8bce-21d7722606ba/fb072e70-71ab-4bee-b66d-4586546dcecc/Customize_AI_in_Visual_Studio_Code.md)

***

## Then Run Your First Feature

With those eight things in place — starter app, always-on instructions, `AGENTS.md`, three agents, one skill, two prompt files — you can run a real feature end to end. Pick something tiny: a single API endpoint, a single UI component. Invoke `@feature-owner`, run `/define-feature`, let the chain execute.

Everything you discover in that first run tells you what to build next. Maybe the context package is missing something the Task Performer needs — that's when you build the Context Agent. Maybe the QA Agent's verification is vague — that's when you build the verification rubric skill. Build in response to observed problems, not in anticipation of them.

**Rough total: around 3 hours to first working loop.** That's a good Friday afternoon or a focused Saturday morning.