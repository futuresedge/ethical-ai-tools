# Phase 3 — Per-Task Agent Spec Generation (≈ 30 min)

**Goal:** Calling `activate_task` also generates a scoped agent spec file, which VS Code hot-reloads automatically.

**3.1 Create the template**
```markdown
<!-- .github/agents/task-performer.template.md -->
---
name: Task Performer ({{TASK_ID}})
description: Task Performer scoped exclusively to {{TASK_ID}} — {{TASK_TITLE}}
model: claude-sonnet-4-5
tools:
  - read_task_spec_{{TASK_SLUG}}
  - write_proof_template_{{TASK_SLUG}}
  - append_work_log_{{TASK_SLUG}}
  - submit_proof_{{TASK_SLUG}}
  - get_context_card
  - raise_uncertainty
---

You are the Task Performer for **{{TASK_ID}}** exclusively.

Your task: {{TASK_TITLE}}
Your task_id for all tool calls: {{TASK_ID}}

You have no authority over any other task. You have no tools for any other task.
Begin by calling get_context_card with task_id {{TASK_ID}}.
```

**3.2 Generate the spec inside `activate_task`**
```typescript
import { readFileSync, writeFileSync } from 'fs';

function generateAgentSpec(task_id: string, title: string) {
  const slug = task_id.replace(/-/g, '_');
  const template = readFileSync('.github/agents/task-performer.template.md', 'utf8');
  const spec = template
    .replaceAll('{{TASK_ID}}', task_id)
    .replaceAll('{{TASK_SLUG}}', slug)
    .replaceAll('{{TASK_TITLE}}', title);
  writeFileSync(`.github/agents/task-performer-${task_id}.agent.md`, spec);
}
```

**3.3 Verify hot-reload**
- Call `activate_task` with `task_id: "task-07"`, `title: "Implement blog search index"`.
- Without restarting VS Code, check the agent selector (@ menu in Copilot Chat).
- `Task Performer (task-07)` should appear immediately.
- **This confirms the hot-reload assumption Pete already validated.**

**3.4 Verify cleanup**
Add a `deactivate_task` tool that deletes the spec file and deregisters tools. Confirm VS Code removes the agent from the selector within seconds.

***