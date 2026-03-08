import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { readFileSync, writeFileSync, existsSync, unlinkSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import db from './db.js';

// Workspace root: nexus/server.ts lives one level below the repo root.
// import.meta.url → /…/nexus/server.ts → dirname → /…/nexus → dirname → /…/repo-root
const __root = dirname(dirname(fileURLToPath(import.meta.url)));

// ─── Phase 3: Agent spec helpers ─────────────────────────────────────────────

/** Absolute path to the generated spec file for a given task. */
function agentSpecPath(task_id: string): string {
  return join(__root, `.github/agents/task-performer-${task_id}.agent.md`);
}

/**
 * Render the task-performer template for a specific task.
 * Throws if the template file is missing — caller must catch and surface the error
 * before any DB write, ensuring atomicity between spec generation and task activation.
 */
function renderAgentSpec(task_id: string, title: string): string {
  const templatePath = join(__root, '.github/agents/task-performer.template.md');
  if (!existsSync(templatePath)) {
    throw new Error(
      'task-performer.template.md not found. Cannot generate agent spec. ' +
      'Expected at .github/agents/task-performer.template.md from workspace root.'
    );
  }
  const slug = task_id.replace(/-/g, '_');
  const template = readFileSync(templatePath, 'utf8');
  return template
    .replaceAll('{{TASK_ID}}', task_id)
    .replaceAll('{{TASK_SLUG}}', slug)
    .replaceAll('{{TASK_TITLE}}', title);
}

// ─── Phase 3: OCAP tool handle storage ───────────────────────────────────────
// RegisteredTool handles returned by server.tool() are stored per task_id so
// deactivate_task can call remove() on each handle, which signals VS Code via
// notifications/tools/list_changed to remove the tools from its selector.

type ToolHandle = { remove(): void };
const taskToolHandles = new Map<string, ToolHandle[]>();

const server = new McpServer({
  name: 'nexus',
  version: '0.1.0',
});

// ─── Universal tools ──────────────────────────────────────────────────────────
// These exist once on the server and are available to every agent.
// They carry no task suffix because they are not scoped to any single task.
// See NexusToolGrammar.md §Scoping Rules — Universal tools.

/**
 * get_context_card — verb=get, subject=context_card, scope=universal
 *
 * ONE ontology:
 *   Capability   ✅ universal — possession = permission
 *   Accountability ✅ writes audit_log entry on every call (get_ audit obligation per grammar v0.2)
 *   Quality      ✅ returns typed empty object if task not found — never leaks schema
 *   Temporality  ✅ stateless read; valid at any lifecycle state
 *   Context      ✅ this tool IS the context delivery mechanism for Phase 1
 *   Artifact     ✅ reads tasks table; writes audit_log — both declared
 *
 * Phase 1 implementation: returns the raw task row.
 * TECHNICAL DEBT: Phase 3+ will replace this with a generated briefing pulled from
 * the knowledge base by the Context Agent (Assumption B3). The current return is a
 * structural placeholder — it proves the plumbing, not the context quality.
 */
server.tool(
  'get_context_card',
  'Fetch the context card for a task. Call this before any other tool on a task.',
  { task_id: z.string().describe('The task ID to fetch context for, e.g. task-07') },
  async ({ task_id }) => {
    const task = db
      .prepare('SELECT * FROM tasks WHERE id = ?')
      .get(task_id) as Record<string, unknown> | undefined;

    // Accountability: get_ tools write audit_log per grammar v0.2.
    // Records that an agent fetched this context card — completes chain of custody.
    db.prepare(
      'INSERT INTO audit_log (task_id, tool_name, action, actor) VALUES (?, ?, ?, ?)'
    ).run(task_id, 'get_context_card', `Context card fetched — state: ${(task as any)?.state ?? 'NOT FOUND'}`, 'agent');

    if (!task) {
      return {
        content: [
          {
            type: 'text' as const,
            text: JSON.stringify({ task_id, found: false, message: 'Task not found in Nexus.' }),
          },
        ],
      };
    }

    return {
      content: [{ type: 'text' as const, text: JSON.stringify(task) }],
    };
  }
);

/**
 * raise_uncertainty — verb=raise, subject=uncertainty, scope=universal
 *
 * ONE ontology:
 *   Capability   ✅ universal safety valve — any agent may possess this tool
 *   Accountability ✅ writes audit_log entry (actor: 'agent') — raise_ has audit obligation
 *                    per grammar §raise_: "Writes audit_log entry"
 *   Quality      ✅ description is intentionally free text — uncertainties are unstructured
 *   Temporality  ✅ valid at any state — this tool cannot be blocked by lifecycle
 *   Context      ✅ agent has received context card before calling this
 *   Artifact     ✅ writes to stream_events (append-only) and audit_log
 *
 * NOTE: The phase-01 doc snippet omits the audit_log write. Grammar §raise_ requires it.
 * Both writes are implemented here.
 */
server.tool(
  'raise_uncertainty',
  'Raise and record an uncertainty that blocks progress. Writes to stream_events and audit_log.',
  {
    task_id: z.string().describe('The task ID this uncertainty relates to'),
    description: z
      .string()
      .describe('Plain English description of what is unclear and why it blocks progress'),
  },
  async ({ task_id, description }) => {
    const insertStream = db.prepare(
      'INSERT INTO stream_events (task_id, description) VALUES (?, ?)'
    );
    const insertAudit = db.prepare(
      'INSERT INTO audit_log (task_id, tool_name, action, actor) VALUES (?, ?, ?, ?)'
    );

    // Atomic: both writes succeed or neither does.
    db.transaction(() => {
      insertStream.run(task_id, `⚠️ UNCERTAINTY: ${description}`);
      insertAudit.run(task_id, 'raise_uncertainty', `Uncertainty raised: ${description}`, 'agent');
    })();

    return {
      content: [
        {
          type: 'text' as const,
          text: 'Uncertainty raised. Visible in stream and recorded in audit log.',
        },
      ],
    };
  }
);

// ─── Document helpers ─────────────────────────────────────────────────────────
// Shared logic for document reads/writes. All mutations write an audit_log entry
// inside the helper — accountability is enforced structurally, not by instruction.

function readDocument(task_id: string, doc_type: string) {
  const doc = db
    .prepare('SELECT content FROM documents WHERE task_id = ? AND doc_type = ? ORDER BY version DESC LIMIT 1')
    .get(task_id, doc_type) as { content: string } | undefined;

  if (!doc) {
    return {
      content: [
        {
          type: 'text' as const,
          text: JSON.stringify({ task_id, doc_type, found: false, message: `No ${doc_type} found for ${task_id}.` }),
        },
      ],
    };
  }
  return { content: [{ type: 'text' as const, text: doc.content }] };
}

function writeDocument(task_id: string, doc_type: string, content: string, tool_name: string) {
  // Temporality: only allow writes when task is in CLAIMED state.
  // TECHNICAL DEBT: state list is hardcoded here. Phase 3+ should evaluate against
  // a state_transitions table via a Policy Engine — not inline conditionals.
  const task = db
    .prepare('SELECT state FROM tasks WHERE id = ?')
    .get(task_id) as { state: string } | undefined;

  if (!task) {
    throw new Error(`Task ${task_id} not found.`);
  }
  if (task.state !== 'CLAIMED') {
    throw new Error(`Task ${task_id} is in state ${task.state}. Writes require CLAIMED state.`);
  }

  const existing = db
    .prepare('SELECT version FROM documents WHERE task_id = ? AND doc_type = ? ORDER BY version DESC LIMIT 1')
    .get(task_id, doc_type) as { version: number } | undefined;

  const version = existing ? existing.version + 1 : 1;
  const id = `${task_id}:${doc_type}:v${version}`;
  const contentHash = Buffer.from(content).toString('base64').slice(0, 16);

  db.transaction(() => {
    db.prepare(
      'INSERT INTO documents (id, task_id, doc_type, content, version) VALUES (?, ?, ?, ?, ?)'
    ).run(id, task_id, doc_type, content, version);

    // Accountability: every write_ records to audit_log — enforced here, not in agent instructions.
    db.prepare(
      'INSERT INTO audit_log (task_id, tool_name, action, content_hash, actor) VALUES (?, ?, ?, ?, ?)'
    ).run(task_id, tool_name, `Wrote ${doc_type} v${version}`, contentHash, 'agent');
  })();

  return { content: [{ type: 'text' as const, text: `${doc_type} written (v${version}).` }] };
}

function appendDocument(task_id: string, doc_type: string, entry: string, tool_name: string) {
  // Temporality: only allow appends when task is CLAIMED.
  const task = db
    .prepare('SELECT state FROM tasks WHERE id = ?')
    .get(task_id) as { state: string } | undefined;

  if (!task) throw new Error(`Task ${task_id} not found.`);
  if (task.state !== 'CLAIMED') {
    throw new Error(`Task ${task_id} is in state ${task.state}. Appends require CLAIMED state.`);
  }

  const existing = db
    .prepare('SELECT content, version FROM documents WHERE task_id = ? AND doc_type = ? ORDER BY version DESC LIMIT 1')
    .get(task_id, doc_type) as { content: string; version: number } | undefined;

  const version = existing ? existing.version + 1 : 1;
  const newContent = existing ? `${existing.content}\n\n${entry}` : entry;
  const id = `${task_id}:${doc_type}:v${version}`;
  const contentHash = Buffer.from(newContent).toString('base64').slice(0, 16);

  db.transaction(() => {
    db.prepare(
      'INSERT INTO documents (id, task_id, doc_type, content, version) VALUES (?, ?, ?, ?, ?)'
    ).run(id, task_id, doc_type, newContent, version);

    db.prepare(
      'INSERT INTO audit_log (task_id, tool_name, action, content_hash, actor) VALUES (?, ?, ?, ?, ?)'
    ).run(task_id, tool_name, `Appended to ${doc_type} (now v${version})`, contentHash, 'agent');
  })();

  return { content: [{ type: 'text' as const, text: `Entry appended to ${doc_type} (v${version}).` }] };
}

// ─── OCAP task-scoped tool registration ───────────────────────────────────────
// Each active task gets its own scoped tool set. Tool possession = access permission.
// Tools are registered dynamically after connection — VS Code is notified via
// notifications/tools/list_changed so it refreshes its tool list without restart.
// See NexusToolGrammar.md §Scoping Rules — Task-scoped tools.

function registerTaskTools(task_id: string) {
  // Suffix: task-07 → task_07 (hyphens to underscores; preserves inner structure)
  const suffix = task_id.replace(/-/g, '_');

  // Capture RegisteredTool handles — stored in taskToolHandles so deactivate_task
  // can call remove() on each to revoke access and signal tools/list_changed.
  const handles: ToolHandle[] = [];

  /**
   * read_task_spec_{slug} — verb=read, subject=task_spec, scope=task
   * ONE: Capability ✅ | Accountability ✅ (read-only) | Quality ✅ | Temporality ✅ | Context ✅ | Artifact ✅
   */
  handles.push(server.tool(`read_task_spec_${suffix}`, 'Read the task specification document for this task.', {}, async () => {
    return readDocument(task_id, 'task_spec');
  }));

  /**
   * write_proof_template_{slug} — verb=write, subject=proof_template, scope=task
   * ONE: Capability ✅ | Accountability ✅ (audit in writeDocument) | Quality ✅ |
   *      Temporality ✅ (state check in writeDocument) | Context ✅ | Artifact ✅
   */
  handles.push(server.tool(
    `write_proof_template_${suffix}`,
    'Write the proof template for this task. Must be called before submit_proof.',
    { content: z.string().describe('The proof template content to write') },
    async ({ content }) => {
      return writeDocument(task_id, 'proof_template', content, `write_proof_template_${suffix}`);
    }
  ));

  /**
   * append_work_log_{slug} — verb=append, subject=work_log, scope=task
   * ONE: Capability ✅ | Accountability ✅ (audit in appendDocument) | Quality ✅ |
   *      Temporality ✅ (state check in appendDocument) | Context ✅ | Artifact ✅
   */
  handles.push(server.tool(
    `append_work_log_${suffix}`,
    'Append an entry to the work log for this task.',
    { entry: z.string().describe('Work log entry to append') },
    async ({ entry }) => {
      return appendDocument(task_id, 'work_log', entry, `append_work_log_${suffix}`);
    }
  ));

  /**
   * submit_proof_{slug} — verb=submit, subject=proof, scope=task
   * Compound tool: write + state transition + stream event — all in one atomic transaction.
   *
   * ONE ontology (highest-risk tool — full checklist):
   *   Capability   ✅ task-scoped — only exists for active tasks
   *   Accountability ✅ audit_log write inside transaction (phase doc omits this — added here)
   *   Quality      ✅ proof_template must exist before proof is accepted
   *   Temporality  ✅ task must be CLAIMED — rejects if already PROOFSUBMITTED
   *   Context      ✅ agent has context card and proof_template before calling this
   *   Artifact     ✅ writes documents table; updates tasks; stream_events
   *
   * TECHNICAL DEBT: 'CLAIMED' → 'PROOFSUBMITTED' transition is hardcoded here.
   * Should be driven by a state_transitions table evaluated by a Policy Engine.
   */
  handles.push(server.tool(
    `submit_proof_${suffix}`,
    'Submit the completed proof for this task. Requires proof_template to exist. Transitions task to PROOFSUBMITTED.',
    { content: z.string().describe('The completed proof content to submit') },
    async ({ content }) => {
      // Temporality: reject if state ≠ CLAIMED
      const task = db
        .prepare('SELECT state FROM tasks WHERE id = ?')
        .get(task_id) as { state: string } | undefined;

      if (!task) {
        return { content: [{ type: 'text' as const, text: `Error: task ${task_id} not found.` }] };
      }
      if (task.state !== 'CLAIMED') {
        return {
          content: [{
            type: 'text' as const,
            text: `Error: task ${task_id} is in state ${task.state}. Proof submission requires CLAIMED state.`,
          }],
        };
      }

      // Quality: proof_template must exist before proof is accepted
      const template = db
        .prepare('SELECT id FROM documents WHERE task_id = ? AND doc_type = ? LIMIT 1')
        .get(task_id, 'proof_template');

      if (!template) {
        return {
          content: [{
            type: 'text' as const,
            text: `Error: no proof_template found for ${task_id}. Write the proof template before submitting proof.`,
          }],
        };
      }

      const version = 1;
      const id = `${task_id}:proof:v${version}`;
      const contentHash = Buffer.from(content).toString('base64').slice(0, 16);

      // Atomic compound operation: write proof + state transition + stream event + audit
      db.transaction(() => {
        db.prepare(
          'INSERT INTO documents (id, task_id, doc_type, content, version) VALUES (?, ?, ?, ?, ?)'
        ).run(id, task_id, 'proof', content, version);

        db.prepare("UPDATE tasks SET state = 'PROOFSUBMITTED' WHERE id = ?").run(task_id);

        db.prepare(
          'INSERT INTO stream_events (task_id, description) VALUES (?, ?)'
        ).run(task_id, `✅ Proof submitted for ${task_id} — awaiting QA`);

        db.prepare(
          'INSERT INTO audit_log (task_id, tool_name, action, content_hash, actor) VALUES (?, ?, ?, ?, ?)'
        ).run(task_id, `submit_proof_${suffix}`, 'Proof submitted — state → PROOFSUBMITTED', contentHash, 'agent');
      })();

      return {
        content: [{ type: 'text' as const, text: `Proof submitted. Task state: PROOFSUBMITTED.` }],
      };
    }
  ));

  // Store all 4 handles for this task so deactivate_task can remove them later.
  taskToolHandles.set(task_id, handles);

  // Record registration in tool_registry
  db.prepare(
    "INSERT OR REPLACE INTO tool_registry (task_id, role, tools) VALUES (?, 'task-performer', ?)"
  ).run(task_id, JSON.stringify([
    `read_task_spec_${suffix}`,
    `write_proof_template_${suffix}`,
    `append_work_log_${suffix}`,
    `submit_proof_${suffix}`,
  ]));

  // Notify VS Code to refresh its tool list.
  // Guarded: during startup re-registration the transport is not yet connected —
  // VS Code requests a fresh tool list on connect, so the notification is a no-op then.
  server.server.notification({ method: 'notifications/tools/list_changed' }).catch(() => {
    // Not connected yet — safe to ignore; tool list will be fetched fresh on connect.
  });
}

// ─── Management tools ─────────────────────────────────────────────────────────
// These are called by Pete (Nexus Orchestrator role), not by Task Performer agents.

/**
 * activate_task — verb=activate, subject=task, scope=management
 *
 * Phase 3 extension: generates a scoped agent spec file (.github/agents/task-performer-{task_id}.agent.md)
 * from the task-performer.template.md template. VS Code hot-reloads the file automatically,
 * making the Task Performer agent available in the @ menu without a restart.
 *
 * ONE ontology:
 *   Capability   ✅ management tool — possessed only by Pete/Orchestrator
 *   Accountability ✅ audit_log write (phase doc omits this — added)
 *   Quality      ✅ template-existence checked before any DB write; rejects gracefully if missing;
 *                   file write + DB transaction are compensated (file deleted if DB fails)
 *   Temporality  ✅ rejects if task is already in CLAIMED or later state
 *   Context      ✅ management operation — no context card required
 *   Artifact     ✅ writes tasks + tool_registry tables + .github/agents/task-performer-{task_id}.agent.md
 *
 * TECHNICAL DEBT: CLAIMED is the only valid target state here — hardcoded.
 * Should be validated against a state_transitions table.
 *
 * GRAMMAR DEVIATION: 'activate_' is not in the 8-verb closed set (read_, write_, append_, submit_,
 * request_, search_, get_, raise_). It is a management lifecycle verb, not a document-operation verb —
 * intentional extension, rationale recorded in NexusDecisionsRationale.md.
 */
server.tool(
  'activate_task',
  'Activate a task: transitions it to CLAIMED, generates a scoped agent spec file, and registers its OCAP tool set.',
  {
    task_id: z.string().describe('Task ID to activate, e.g. task-07'),
    title: z.string().describe('Human-readable task title'),
  },
  async ({ task_id, title }) => {
    // Temporality: reject if already active
    const existing = db
      .prepare('SELECT state FROM tasks WHERE id = ?')
      .get(task_id) as { state: string } | undefined;

    if (existing && existing.state !== 'DEFINED') {
      return {
        content: [{
          type: 'text' as const,
          text: `Task ${task_id} is already in state ${existing.state}. Cannot re-activate.`,
        }],
      };
    }

    // Quality: render spec before any DB write — fails fast if template is missing.
    // This prevents a partial state where the task is CLAIMED but has no agent spec.
    let specContent: string;
    try {
      specContent = renderAgentSpec(task_id, title);
    } catch (err) {
      return {
        content: [{
          type: 'text' as const,
          text: `Error: ${err instanceof Error ? err.message : String(err)}`,
        }],
      };
    }

    const outPath = agentSpecPath(task_id);

    // Write spec file before DB transaction.
    // If the DB transaction then fails: delete the file (compensating action) — ensures atomicity.
    writeFileSync(outPath, specContent, 'utf8');

    try {
      db.transaction(() => {
        db.prepare(
          "INSERT OR REPLACE INTO tasks (id, title, state) VALUES (?, ?, 'CLAIMED')"
        ).run(task_id, title);

        db.prepare(
          'INSERT INTO audit_log (task_id, tool_name, action, actor) VALUES (?, ?, ?, ?)'
        ).run(task_id, 'activate_task', `Task activated — state → CLAIMED`, 'agent');
      })();
    } catch (err) {
      // Compensate: remove the spec file so the filesystem stays consistent with the DB.
      try { unlinkSync(outPath); } catch { /* ignore cleanup errors */ }
      return {
        content: [{
          type: 'text' as const,
          text: `Error: DB write failed — task not activated. ${err instanceof Error ? err.message : String(err)}`,
        }],
      };
    }

    registerTaskTools(task_id);

    return {
      content: [{ type: 'text' as const, text: `Task ${task_id} activated. Scoped tools registered.` }],
    };
  }
);

/**
 * deactivate_task — verb=deactivate, subject=task, scope=management
 *
 * Revokes the task's OCAP tool set, deletes the generated agent spec file, updates
 * tool_registry.deregistered_at, and sets task state to DEACTIVATED.
 * VS Code is notified via notifications/tools/list_changed — removes the tools from its selector.
 *
 * ONE ontology:
 *   Capability   ✅ management tool — no task slug suffix; Pete/Orchestrator only
 *                   C4: remove() on each RegisteredTool handle + tools/list_changed notification ✅
 *   Accountability ✅ audit_log write inside DB transaction
 *   Quality      ✅ task-not-found guard; already-deactivated guard (checks deregistered_at)
 *   Temporality  ✅ checks current tool_registry state before executing;
 *                   operates on any task that has registered tools (CLAIMED or PROOFSUBMITTED)
 *   Context      ✅ management operation — no context card required (named N/A)
 *   Artifact     ✅ deletes .github/agents/task-performer-{task_id}.agent.md;
 *                   sets tool_registry.deregistered_at; writes audit_log
 *
 * GRAMMAR DEVIATION: 'deactivate_' is not in the 8-verb closed set. Management lifecycle
 * verb — intentional extension, same rationale as activate_task (Phase 2).
 * TECHNICAL DEBT: target state 'DEACTIVATED' is hardcoded. Should come from state_transitions table.
 */
server.tool(
  'deactivate_task',
  'Deactivate a task: remove its OCAP tool set, delete the agent spec file, and record to audit log.',
  {
    task_id: z.string().describe('Task ID to deactivate, e.g. task-31'),
  },
  async ({ task_id }) => {
    // Quality: task must exist
    const task = db
      .prepare('SELECT state FROM tasks WHERE id = ?')
      .get(task_id) as { state: string } | undefined;

    if (!task) {
      return { content: [{ type: 'text' as const, text: `Error: task ${task_id} not found.` }] };
    }

    // Quality: check not already deactivated (ground truth is deregistered_at in tool_registry)
    const reg = db
      .prepare('SELECT deregistered_at FROM tool_registry WHERE task_id = ?')
      .get(task_id) as { deregistered_at: string | null } | undefined;

    if (!reg) {
      return {
        content: [{
          type: 'text' as const,
          text: `Error: task ${task_id} has no registered tools. Cannot deactivate.`,
        }],
      };
    }
    if (reg.deregistered_at !== null) {
      return {
        content: [{
          type: 'text' as const,
          text: `Task ${task_id} is already deactivated (deregistered_at: ${reg.deregistered_at}).`,
        }],
      };
    }

    // Capability C4: remove all registered tool handles — revokes OCAP access immediately.
    const handles = taskToolHandles.get(task_id);
    if (handles) {
      handles.forEach(h => h.remove());
      taskToolHandles.delete(task_id);
    }

    // Artifact: delete the agent spec file if it exists.
    const specPath = agentSpecPath(task_id);
    if (existsSync(specPath)) {
      unlinkSync(specPath);
    }

    // Accountability + Temporality: atomic DB update — deregistered_at + state + audit_log.
    // TECHNICAL DEBT: 'DEACTIVATED' target state hardcoded; should come from state_transitions table.
    db.transaction(() => {
      db.prepare(
        "UPDATE tool_registry SET deregistered_at = datetime('now') WHERE task_id = ?"
      ).run(task_id);

      db.prepare(
        "UPDATE tasks SET state = 'DEACTIVATED' WHERE id = ?"
      ).run(task_id);

      db.prepare(
        'INSERT INTO audit_log (task_id, tool_name, action, actor) VALUES (?, ?, ?, ?)'
      ).run(task_id, 'deactivate_task', 'Task deactivated — tools removed, spec deleted', 'agent');
    })();

    // Notify VS Code to refresh its tool list — removes deregistered tools from the selector.
    server.server.notification({ method: 'notifications/tools/list_changed' }).catch(() => {
      // Not connected — safe to ignore.
    });

    return {
      content: [{
        type: 'text' as const,
        text: `Task ${task_id} deactivated. Scoped tools removed and agent spec deleted.`,
      }],
    };
  }
);

// ─── Startup: re-register tools for any tasks already active in the DB ────────
// Handles server restarts — any CLAIMED task in tool_registry gets its tools back.
// Note: spec files are NOT regenerated on startup — they persist on the filesystem.
const activeTasks = db
  .prepare("SELECT task_id FROM tool_registry WHERE deregistered_at IS NULL")
  .all() as { task_id: string }[];

activeTasks.forEach(({ task_id }) => registerTaskTools(task_id));

// ─── Start ────────────────────────────────────────────────────────────────────

const transport = new StdioServerTransport();
await server.connect(transport);
