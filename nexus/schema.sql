-- Nexus SQLite schema — Phase 1 Foundation
-- WAL mode is set programmatically in db.ts, not here.
-- All tables use IF NOT EXISTS — safe to re-run on every server restart.

CREATE TABLE IF NOT EXISTS tasks (
  id      TEXT PRIMARY KEY,
  title   TEXT,
  state   TEXT DEFAULT 'DEFINED'
);

CREATE TABLE IF NOT EXISTS documents (
  id         TEXT PRIMARY KEY,
  task_id    TEXT,
  doc_type   TEXT,        -- 'task_spec' | 'proof_template' | 'proof' | 'work_log'
  content    TEXT,
  version    INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS audit_log (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  task_id      TEXT,
  tool_name    TEXT,       -- exact tool called, e.g. write_proof_template_task_07
  action       TEXT,
  content_hash TEXT,
  actor        TEXT,       -- 'agent' | 'webhook:github'
  timestamp    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS stream_events (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  task_id     TEXT,
  description TEXT,        -- plain English, visible to Pete
  timestamp   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tool_registry (
  task_id         TEXT PRIMARY KEY,
  role            TEXT,
  tools           TEXT,    -- JSON array of tool names
  registered_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deregistered_at TIMESTAMP
);
