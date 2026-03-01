# Nexus Database Conventions

> SQLite via better-sqlite3. Synchronous API only — no async queries.
> Source: Nexus-exp-01-phase-01.md schema, NexusModelOverview.md
> File location: nexus/nexus.db (gitignored) or nexus/db.ts (the wrapper)

---

## Schema

```sql
-- Tasks: one row per task, tracks current lifecycle state
CREATE TABLE IF NOT EXISTS tasks (
  id         TEXT PRIMARY KEY,
  title      TEXT NOT NULL,
  state      TEXT NOT NULL DEFAULT 'DEFINED'
  -- Valid states: DEFINED, CLAIMED, PROOFSUBMITTED, QAAPPROVED, QAFAILED, COMPLETE
);

-- Documents: versioned content store for all typed artefacts
CREATE TABLE IF NOT EXISTS documents (
  id         TEXT PRIMARY KEY,   -- ulid or uuid
  task_id    TEXT NOT NULL,
  doc_type   TEXT NOT NULL,      -- 'task_spec' | 'proof_template' | 'proof' | 'work_log' | ...
  content    TEXT NOT NULL,
  version    INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Audit log: append-only record of every mutation and every GitHub event
CREATE TABLE IF NOT EXISTS audit_log (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  task_id      TEXT NOT NULL,
  tool_name    TEXT NOT NULL,    -- exact tool called, e.g. write_proof_template_task_07
  action       TEXT NOT NULL,
  content_hash TEXT,             -- SHA-256 of document content where applicable
  actor        TEXT NOT NULL,    -- 'agent' | 'webhook:github'
  timestamp    TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Stream events: plain-English event log Pete reads in real time
CREATE TABLE IF NOT EXISTS stream_events (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  task_id     TEXT,              -- nullable for system-level events
  description TEXT NOT NULL,
  timestamp   TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Tool registry: tracks which task-scoped tools are currently active
CREATE TABLE IF NOT EXISTS tool_registry (
  task_id          TEXT PRIMARY KEY,
  role             TEXT NOT NULL,
  tools            TEXT NOT NULL,  -- JSON array of tool names
  registered_at    TEXT NOT NULL DEFAULT (datetime('now')),
  deregistered_at  TEXT            -- NULL means currently active
);
```

---

## Database Wrapper (nexus/db.ts)

```typescript
import Database from 'better-sqlite3';
import { readFileSync } from 'fs';

const db = new Database('nexus/nexus.db');

// WAL mode: allows concurrent reads alongside writes
db.pragma('journal_mode = WAL');

// Apply schema on startup (idempotent due to IF NOT EXISTS)
const schema = readFileSync('nexus/schema.sql', 'utf8');
db.exec(schema);

export default db;
```

Import this singleton everywhere. Never open a second database connection.

---

## Query Conventions

**Always use prepared statements** — never string interpolation in SQL.

```typescript
// ✅ Correct
const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(task_id);

// ❌ Never do this
const task = db.exec(`SELECT * FROM tasks WHERE id = '${task_id}'`);
```

**Content hashing** for audit_log entries:

```typescript
import { createHash } from 'crypto';

function hashContent(content: string): string {
  return createHash('sha256').update(content).digest('hex').slice(0, 16);
}
```

**Inserting a new document version:**

```typescript
function writeDocument(task_id: string, doc_type: string, content: string, tool_name: string): void {
  // Get current max version for this task + doc_type
  const row = db.prepare(
    'SELECT MAX(version) as max_v FROM documents WHERE task_id = ? AND doc_type = ?'
  ).get(task_id, doc_type) as { max_v: number | null };
  
  const version = (row.max_v ?? 0) + 1;
  const id = `doc-${task_id}-${doc_type}-v${version}`;

  db.prepare(
    'INSERT INTO documents (id, task_id, doc_type, content, version) VALUES (?, ?, ?, ?, ?)'
  ).run(id, task_id, doc_type, content, version);

  // Audit log entry — always inside the tool, never outside
  db.prepare(
    'INSERT INTO audit_log (task_id, tool_name, action, content_hash, actor) VALUES (?, ?, ?, ?, ?)'
  ).run(task_id, tool_name, `${doc_type} written (v${version})`, hashContent(content), 'agent');
}
```

**Querying the chain of custody (Phase 5 pass criterion):**

```sql
SELECT tool_name, action, actor, timestamp
FROM audit_log
WHERE task_id = 'task-07'
ORDER BY timestamp;
```

---

## What NOT to Do

- Never use `UPDATE` or `DELETE` on `audit_log` — it is append-only
- Never open a second `Database()` instance — use the shared singleton from `db.ts`
- Never let the version clock reset — always read `MAX(version)` before inserting
- Never null `actor` — it must be `'agent'` or `'webhook:github'`
- Never use `db.exec()` with interpolated values — always prepared statements
