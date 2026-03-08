## Phase 2 — Dynamic Tool Registration (≈ 1 hour)

**Goal:** The server returns different tool lists based on which tasks are active. When a task is registered, its scoped tools appear. When deregistered, they vanish.

**2.1 Implement the tool registry pattern**

The key insight: `server.tool()` is called at startup, but you can use a **dynamic dispatch pattern** — register handler functions that check the registry at call time, and use `tools/list_changed` to signal VS Code when the available set changes.

```typescript
// On startup, seed with any tasks currently in CLAIMED state
const activeTasks = db.prepare(
  "SELECT * FROM tool_registry WHERE deregistered_at IS NULL"
).all();
activeTasks.forEach(t => registerTaskTools(t.task_id));

function registerTaskTools(task_id: string) {
  const suffix = task_id.replace(/-/g, '_'); // task-07 → task_07

  server.tool(`read_task_spec_${suffix}`, {}, async () => {
    return readDocument(task_id, 'task_spec');
  });

  server.tool(`write_proof_template_${suffix}`, 
    { content: z.string() }, 
    async ({ content }) => {
      return writeDocument(task_id, 'proof_template', content, `write_proof_template_${suffix}`);
    }
  );

  server.tool(`append_work_log_${suffix}`, 
    { entry: z.string() }, 
    async ({ entry }) => {
      return appendDocument(task_id, 'work_log', entry, `append_work_log_${suffix}`);
    }
  );

  server.tool(`submit_proof_${suffix}`, 
    { content: z.string() }, 
    async ({ content }) => {
      // Compound tool: write + state transition + stream event
      writeDocument(task_id, 'proof', content, `submit_proof_${suffix}`);
      db.prepare("UPDATE tasks SET state = 'PROOFSUBMITTED' WHERE id = ?").run(task_id);
      db.prepare("INSERT INTO stream_events (task_id, description) VALUES (?, ?)")
        .run(task_id, `✅ Proof submitted for ${task_id} — awaiting QA`);
      return { content: [{ type: "text", text: "Proof submitted. Task state: PROOFSUBMITTED." }] };
    }
  );

  // Record registration
  db.prepare("INSERT OR REPLACE INTO tool_registry (task_id, role) VALUES (?, 'task-performer')")
    .run(task_id);
    
  // Signal VS Code to refresh its tool list
  server.notification({ method: "notifications/tools/list_changed" });
}
```

**2.2 Add a task activation endpoint**
```typescript
// A management tool Pete calls to activate a task
server.tool("activate_task", 
  { task_id: z.string(), title: z.string() }, 
  async ({ task_id, title }) => {
    db.prepare("INSERT OR REPLACE INTO tasks (id, title, state) VALUES (?, ?, 'CLAIMED')")
      .run(task_id, title);
    registerTaskTools(task_id);
    return { content: [{ type: "text", text: `Task ${task_id} activated. Scoped tools registered.` }] };
});
```

**2.3 Verify**
- Call `activate_task` with `task_id: "task-07"`.
- Check VS Code tool list: `read_task_spec_task_07`, `write_proof_template_task_07` should appear.
- Confirm `read_task_spec_task_08` does NOT appear (it was never registered).
- **This is the OCAP proof point**: there is no tool to call that could write to task-08.

***