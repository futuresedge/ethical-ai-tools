# Dynamic Tool Registration

> Pattern for registering and deregistering task-scoped tools at runtime.
> Source: Nexus-exp-01-phase-02.md, Nexus-exp-01-phase-03.md, NexusModelOverview.md
> This is the core mechanism behind both OCAP isolation and per-task agent spec generation.

---

## The Pattern

Task-scoped tools are not registered at startup — they are registered when a task is activated.
The `activate_task` management tool calls `registerTaskTools()`, which:
1. Registers tool handlers under task-scoped names
2. Writes the task to the `tool_registry` table
3. Generates a per-task agent spec file from the template
4. Sends `tools/list_changed` to VS Code

On `deactivate_task`, the reverse: spec file deleted, registry row closed, `tools/list_changed` sent.

---

## `activate_task` — the entry point

```typescript
server.tool(
  'activate_task',
  {
    task_id: z.string(),
    title: z.string(),
  },
  async ({ task_id, title }) => {
    // Upsert task row in CLAIMED state
    db.prepare(
      'INSERT OR REPLACE INTO tasks (id, title, state) VALUES (?, ?, ?)'
    ).run(task_id, title, 'CLAIMED');

    // Register scoped tools and generate agent spec
    registerTaskTools(task_id, title);

    db.prepare(
      'INSERT INTO stream_events (task_id, description) VALUES (?, ?)'
    ).run(task_id, `🟢 Task ${task_id} activated — "${title}"`);

    return { content: [{ type: 'text', text: `Task ${task_id} activated. Tools registered.` }] };
  }
);
```

---

## `registerTaskTools()` — dynamic dispatch

```typescript
import { readFileSync, writeFileSync } from 'fs';

function registerTaskTools(task_id: string, title: string): void {
  const slug = task_id.replace(/-/g, '_'); // task-07 → task_07

  // read_task_spec_{slug}
  server.tool(`read_task_spec_${slug}`, {}, async () => {
    const doc = db.prepare(
      "SELECT content FROM documents WHERE task_id = ? AND doc_type = 'task_spec' ORDER BY version DESC LIMIT 1"
    ).get(task_id) as { content: string } | undefined;
    if (!doc) return { content: [{ type: 'text', text: 'No task spec found.' }], isError: true };
    return { content: [{ type: 'text', text: doc.content }] };
  });

  // write_proof_template_{slug}
  server.tool(
    `write_proof_template_${slug}`,
    { content: z.string(), reason: z.string() },
    async ({ content, reason }) => {
      checkState(task_id, 'CLAIMED');
      writeDocument(task_id, 'proof_template', content, `write_proof_template_${slug}`);
      return { content: [{ type: 'text', text: 'Proof template written.' }] };
    }
  );

  // append_work_log_{slug}
  server.tool(
    `append_work_log_${slug}`,
    { entry: z.string() },
    async ({ entry }) => {
      appendDocument(task_id, 'work_log', entry, `append_work_log_${slug}`);
      return { content: [{ type: 'text', text: 'Work log entry appended.' }] };
    }
  );

  // submit_proof_{slug} — compound: write + state transition + stream event + audit (atomic)
  server.tool(
    `submit_proof_${slug}`,
    { content: z.string(), reason: z.string() },
    async ({ content, reason }) => {
      checkState(task_id, 'CLAIMED');

      // All three operations in a transaction — atomic
      const tx = db.transaction(() => {
        writeDocument(task_id, 'proof', content, `submit_proof_${slug}`);
        db.prepare("UPDATE tasks SET state = 'PROOFSUBMITTED' WHERE id = ?").run(task_id);
        db.prepare('INSERT INTO stream_events (task_id, description) VALUES (?, ?)')
          .run(task_id, `✅ Proof submitted for ${task_id} — awaiting QA`);
      });
      tx();

      return { content: [{ type: 'text', text: 'Proof submitted. Task state: PROOFSUBMITTED.' }] };
    }
  );

  // Update tool registry
  db.prepare(
    'INSERT OR REPLACE INTO tool_registry (task_id, role, tools) VALUES (?, ?, ?)'
  ).run(
    task_id,
    'task-performer',
    JSON.stringify([
      `read_task_spec_${slug}`,
      `write_proof_template_${slug}`,
      `append_work_log_${slug}`,
      `submit_proof_${slug}`,
    ])
  );

  // Generate agent spec file
  generateAgentSpec(task_id, title);

  // Signal VS Code
  server.notification({ method: 'notifications/tools/list_changed' });
}
```

---

## State Precondition Helper

```typescript
function checkState(task_id: string, expected: string): void {
  const row = db.prepare('SELECT state FROM tasks WHERE id = ?').get(task_id) as { state: string } | undefined;
  if (!row) throw new Error(`Task ${task_id} not found.`);
  if (row.state !== expected) {
    throw new Error(`Precondition failed: expected ${expected}, got ${row.state}.`);
  }
}
```

Call `checkState()` as the first operation inside any `submit_` or `write_` tool.

---

## Agent Spec Generation

```typescript
function generateAgentSpec(task_id: string, title: string): void {
  const slug = task_id.replace(/-/g, '_');
  const template = readFileSync('.github/agents/task-performer.template.md', 'utf8');
  const spec = template
    .replaceAll('{{TASK_ID}}', task_id)
    .replaceAll('{{TASK_SLUG}}', slug)
    .replaceAll('{{TASK_TITLE}}', title);
  writeFileSync(`.github/agents/task-performer-${task_id}.agent.md`, spec);
}
```

VS Code watches `.github/agents/` and hot-reloads new `.agent.md` files.
The generated agent appears in the `@` menu without a server restart.

---

## `deactivate_task` — cleanup

```typescript
server.tool(
  'deactivate_task',
  { task_id: z.string() },
  async ({ task_id }) => {
    const slug = task_id.replace(/-/g, '_');

    // Mark registry entry as deregistered (do not delete — audit trail)
    db.prepare(
      "UPDATE tool_registry SET deregistered_at = datetime('now') WHERE task_id = ?"
    ).run(task_id);

    // Delete the generated agent spec
    try {
      unlinkSync(`.github/agents/task-performer-${task_id}.agent.md`);
    } catch {
      // Already absent — acceptable
    }

    // Stream event
    db.prepare('INSERT INTO stream_events (task_id, description) VALUES (?, ?)')
      .run(task_id, `🔴 Task ${task_id} deactivated — tools and spec removed`);

    // Signal VS Code
    server.notification({ method: 'notifications/tools/list_changed' });

    return { content: [{ type: 'text', text: `Task ${task_id} deactivated.` }] };
  }
);
```

**Note on tool deregistration:** The MCP SDK does not currently support unregistering individual tools after server startup. The practical effect is that the tool names remain in the server registry in memory but the agent spec file is deleted, so VS Code will no longer show the agent. For the experiment, this is acceptable. Post-adoption: implement a tool filter in the `tools/list` handler based on `tool_registry.deregistered_at`.

---

## On-Startup Seed (for server restarts)

Rehydrate tools for any tasks that were active before a server restart:

```typescript
const activeTasks = db.prepare(
  "SELECT task_id, role FROM tool_registry WHERE deregistered_at IS NULL"
).all() as Array<{ task_id: string }>;

activeTasks.forEach(({ task_id }) => {
  const task = db.prepare('SELECT title FROM tasks WHERE id = ?').get(task_id) as { title: string };
  if (task) registerTaskTools(task_id, task.title);
});
```
