# QA Rules Schema

> Schema and usage conventions for the `qa_rules` table in the Nexus database.
> This table is the structural alternative to prose QA instructions in agent specs.
> Source: ONE-Ontology.md Quality dimension, NexusDecisionsRationale.md Decision 6

---

## Table Schema

```sql
CREATE TABLE IF NOT EXISTS qa_rules (
  id           TEXT PRIMARY KEY,  -- ulid or uuid
  task_type    TEXT NOT NULL,      -- 'implementation' | 'refactor' | 'docs' | 'config' | '*' (global)
  rule_text    TEXT NOT NULL,      -- plain English — what the rule requires
  check_method TEXT NOT NULL,      -- 'output_contains' | 'exit_code_zero' | 'command_matches' | 'manual'
  check_value  TEXT,               -- expected value for programmatic checks; null for 'manual'
  severity     TEXT NOT NULL DEFAULT 'blocking',  -- 'blocking' | 'advisory'
  source       TEXT NOT NULL,      -- retrospective session ID or 'bootstrap'
  created_at   TEXT NOT NULL DEFAULT (datetime('now')),
  active       INTEGER NOT NULL DEFAULT 1  -- 0 = retired rule
);
```

---

## Bootstrap Rules (insert at schema initialisation)

```sql
INSERT INTO qa_rules (id, task_type, rule_text, check_method, check_value, severity, source) VALUES
  ('qr-01', '*',              'Use project package manager (pnpm)', 'command_matches', 'pnpm %', 'blocking', 'bootstrap'),
  ('qr-02', 'implementation', 'Proof must include exact test command', 'output_contains', 'pnpm', 'blocking', 'bootstrap'),
  ('qr-03', 'implementation', 'Proof must include actual test runner output', 'manual', NULL, 'blocking', 'bootstrap'),
  ('qr-04', '*',              'Proof template sections must all be addressed', 'manual', NULL, 'blocking', 'bootstrap');
```

---

## How the QA Reviewer Queries Rules

```typescript
// Load all active rules for a given task type plus global rules
const rules = db.prepare(`
  SELECT * FROM qa_rules
  WHERE active = 1
    AND (task_type = ? OR task_type = '*')
  ORDER BY severity DESC, created_at ASC
`).all(task_type) as QaRule[];
```

Rules are always queried fresh at review time — never cached in the agent spec.
This means a new rule row is immediately applied to the next review without any agent update.

---

## Check Methods

| Method | How the QA Reviewer evaluates it |
|---|---|
| `exit_code_zero` | Proof must show a zero exit code for the command in `check_value` |
| `output_contains` | Proof text must contain the string in `check_value` |
| `command_matches` | First command in the proof must match the pattern in `check_value` (% = wildcard) |
| `manual` | QA Reviewer reads proof and applies judgment — but the rule text constrains that judgment |

---

## Adding a Rule After a Retrospective

Pattern for the sprint retrospective → database row flow:

```sql
-- Example: retrospective discovers agents used 'bun test' instead of 'pnpm test'
INSERT INTO qa_rules (id, task_type, rule_text, check_method, check_value, severity, source)
VALUES (
  'qr-05',
  'implementation',
  'Test command must not use bun — use pnpm test',
  'command_matches',
  'pnpm %',
  'blocking',
  'retro-2026-03-15'
);
```

The `source` field ties every rule back to the event that produced it, creating a visible learning history.

---

## Retiring a Rule

When a rule is superseded or no longer applies:

```sql
UPDATE qa_rules SET active = 0 WHERE id = 'qr-02';
```

Rules are never deleted — `active = 0` preserves the history.
Document the reason in a `stream_events` entry or retrospective, not in the table.
