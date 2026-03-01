# Phase 5 — End-to-End Probe (≈ 45 min)

**Goal:** One complete task lifecycle with a unified chain of custody in the audit log.

**5.1 Seed a task spec manually**
```sql
INSERT INTO tasks VALUES ('task-07', 'Implement blog search index', 'DEFINED');
INSERT INTO documents (id, task_id, doc_type, content) VALUES (
  'doc-01', 'task-07', 'task_spec', 
  '# Task Spec: Blog Search\n\nImplement a keyword search over blog posts...'
);
```

**5.2 Run the full lifecycle**
1. Call `activate_task` — spec file generated, tools registered
2. Open `@Task Performer (task-07)` in Copilot Chat
3. Agent calls `get_context_card` → reads task spec
4. Agent calls `write_proof_template_task_07` → proof template created
5. Agent creates branch `task/task-07` via GitHub MCP
6. Agent implements the feature (real code change in the Astro app)
7. Agent calls `append_work_log_task_07` → work log entry recorded
8. Agent creates PR via GitHub MCP → webhook fires → Nexus logs it
9. Agent calls `submit_proof_task_07` → state transitions to `PROOFSUBMITTED`
10. Call `deactivate_task` → spec deleted, tools deregistered

**5.3 Read the audit log — the pass criterion**
```sql
SELECT tool_name, action, actor, timestamp 
FROM audit_log 
WHERE task_id = 'task-07'
ORDER BY timestamp;
```

Expected output:
```
activate_task           | task activated          | agent           | 17:01:03
read_task_spec_task_07  | document read           | agent           | 17:01:15
write_proof_template... | document created        | agent           | 17:01:42
github:create           | branch task/task-07     | webhook:github  | 17:02:01
append_work_log_task_07 | log entry appended      | agent           | 17:03:18
github:push             | sha abc123 pushed       | webhook:github  | 17:04:22
github:pull_request     | PR #14 opened           | webhook:github  | 17:04:45
submit_proof_task_07    | state→PROOFSUBMITTED    | agent           | 17:05:02
deactivate_task         | tools deregistered      | agent           | 17:05:10
```

**Pass criterion**: the complete chain of custody — every Nexus tool call AND every GitHub event — is visible in one query, ordered by time, attributable to either `agent` or `webhook:github`. Pete can reconstruct exactly what happened without opening any file or any GitHub page. 

***