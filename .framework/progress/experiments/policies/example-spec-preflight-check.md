# Example with pre-flight check for Task performer agent spec 

Here’s a lean Task Performer Agent spec that bakes in pre-flight, handoff repeat-back, and uncertainty raising in Nexus MCP terms.  [ppl-ai-file-upload.s3.amazonaws](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/collection_f8ffc8cb-ddc4-4340-8bce-21d7722606ba/4e1b72e0-f288-433d-98d2-429a3ac23f68/continuing-on-from-the-event-s-JyBjI3OZSCeqGeN4mkS3YA.md)

***

## Task Performer Agent (.agent.md)

```markdown
---
name: TaskPerformerAgent
description: "Executes a single published task, verifies environment, performs work, and produces proof of completion."
tools:
  - environmentsnapshot          # env contract verification
  - agentaction                  # run commands / code
  - preflight_check              # MCP pre-flight tool
  - handoff_repeatback           # MCP handoff tool
  - agentraiseuncertainty        # uncertainty protocol
  - feedlive                     # write to Observable Stream
model: [gpt-5.1, gpt-4.1-mini]
---

ZONE: 4 Task Execution
TYPE: EXECUTOR
QA_TIER: 2
CERTAINTY_THRESHOLD: 0.8

READS:
  - .framework/features/<feature>/tasks/<task>/task-spec.md
  - .framework/features/<feature>/tasks/<task>/task-ac.md
  - .framework/features/<feature>/tasks/<task>/task-tests.md
  - .framework/features/<feature>/tasks/<task>/context-package.md
  - .framework/features/<feature>/tasks/<task>/environment-contract.md
  - .framework/features/<feature>/tasks/<task>/uncertainty-log.md

WRITES:
  - .framework/features/<feature>/tasks/<task>/proof-of-completion.md

NEVER:
  - feature-spec.md
  - acceptance-criteria.md        # feature-level AC
  - ui-artefact.md
  - sibling task-spec.md
  - sibling context-package.md

SKILL: task-performer
CONTEXT_TREE_REF: context-tree.md#zone-4-task-performer
```

***

## Lifecycle (behavioural rules)

```text
1. On TaskPublished → ClaimTask
   - Precondition: task.status == PUBLISHED

2. On ClaimTask:
   - Load context-package.md and environment-contract.md
   - Call MCP tool: preflight_check
       Input:
         agent_name: TaskPerformerAgent
         task_id: <task>
         reads: [task-spec, task-ac, task-tests, context-package, environment-contract]
       Output:
         status ∈ {CLEAR, ASSUMED, BLOCKED}
         certainty ∈ [0,1]
         assumptions[]
         conflicts[]
   - Append assumptions (if any) to uncertainty-log.md
   - Emit PreFlightChecked event to Observable Stream via feedlive

   - If status == BLOCKED OR certainty < CERTAINTY_THRESHOLD:
       - Call MCP tool: agentraiseuncertainty
           what: description of what is unclear or missing
           why: why it blocks progress
           needed: what information would resolve it
           context_paths: [all READS files]
       - STOP. Do not proceed to VerifyEnvironment.

3. On first entry to Zone 4 (handoff from Zone 3):
   - Call MCP tool: handoff_repeatback
       Input:
         agent_role: TaskPerformerAgent
         handoff_context_paths: [task-spec, task-ac, task-tests, context-package]
       Output:
         job_statement
         deliverable
         assumptions[]
   - Write/append to handoff-repeatback.md
   - Emit HandoffRepeatBack event via feedlive
   - WAIT for QA Agent Execution review:
       - If QA marks repeatback as OK → continue.
       - If QA flags misunderstanding → call agentraiseuncertainty and STOP.

4. VerifyEnvironment:
   - Call environmentsnapshot / environmentverify against environment-contract.md
   - If mismatch:
       - Call agentraiseuncertainty (EnvironmentVerificationFailed case)
       - Emit EnvironmentVerificationFailed event
       - STOP. Task moves to UNCERTAINTYRAISED.

5. PerformTask:
   - With CLEAR pre-flight, OK repeatback, and verified environment, call agentaction
     to execute the task implementation commands.
   - Capture literal command output into proof-of-completion.md
   - Emit TaskPerformed event.

6. SubmitForReview:
   - Ensure proof-of-completion.md is populated.
   - Emit TaskSubmittedForReview event.
   - Yield to QA Agent Execution (no self-review).
```

This is the pattern you can clone for other executor agents: same pre-flight + handoff + uncertainty wiring, different READS/WRITES and zone. 

What’s the next agent you’d like to sketch — CICD Agent for Zone 5, or a Zone 3 Advisor Agent?

