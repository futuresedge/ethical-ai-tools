# Knowledge Base Queries

> Query patterns for the Context Agent to populate context card sections.
> Source: ONE-Ontology.md Context dimension, NexusModelOverview.md
> The knowledge base accumulates from retrospectives — never from agent specs.

---

## Knowledge Base Schema

```sql
-- Sprint learnings: facts captured from retrospectives, scoped by task type and domain
CREATE TABLE IF NOT EXISTS sprint_learnings (
  id             TEXT PRIMARY KEY,
  task_type      TEXT NOT NULL,      -- 'implementation' | 'refactor' | 'docs' | 'config' | '*'
  domain         TEXT NOT NULL,      -- stack component: 'astro' | 'react' | 'db' | 'mcp' | '*'
  learning_text  TEXT NOT NULL,      -- 1–2 sentences, present tense, actionable
  source_session TEXT NOT NULL,      -- retrospective session ID
  created_at     TEXT NOT NULL DEFAULT (datetime('now')),
  active         INTEGER NOT NULL DEFAULT 1
);

-- Patterns: reusable approaches observed across tasks
CREATE TABLE IF NOT EXISTS patterns (
  id            TEXT PRIMARY KEY,
  task_type     TEXT NOT NULL,
  domain        TEXT NOT NULL,
  pattern_text  TEXT NOT NULL,       -- 1–2 sentences describing the pattern
  usage_count   INTEGER NOT NULL DEFAULT 1,
  source_session TEXT NOT NULL,
  created_at    TEXT NOT NULL DEFAULT (datetime('now')),
  active        INTEGER NOT NULL DEFAULT 1
);
```

---

## Query: Relevant Patterns (for "Relevant patterns" section)

```typescript
const patterns = db.prepare(`
  SELECT pattern_text, source_session, usage_count
  FROM patterns
  WHERE active = 1
    AND (task_type = ? OR task_type = '*')
    AND (domain = ? OR domain = '*')
  ORDER BY usage_count DESC
  LIMIT 3
`).all(task_type, domain) as Pattern[];
```

**Filtering logic:** Match this task's `task_type` and `domain`. Plus global (`*`) entries.
**Sort:** Highest `usage_count` first — most reused patterns are most likely to apply.
**Limit:** 3 entries maximum. If more than 3 match, take the top 3 by usage_count only.

---

## Query: Sprint Learnings (for "Sprint learnings" section)

```typescript
const learnings = db.prepare(`
  SELECT learning_text, source_session
  FROM sprint_learnings
  WHERE active = 1
    AND (task_type = ? OR task_type = '*')
    AND (domain = ? OR domain = '*')
  ORDER BY created_at DESC
  LIMIT 3
`).all(task_type, domain) as Learning[];
```

**Filtering logic:** Same task_type and domain matching as patterns.
**Sort:** Most recent first — freshest learnings are most likely to reflect current state.
**Limit:** 3 entries maximum.

---

## Query: Known Risks (for "Known risks" section)

```typescript
const risks = db.prepare(`
  SELECT description, timestamp
  FROM stream_events
  WHERE task_id = ?
    AND description LIKE '⚠️ UNCERTAINTY%'
  ORDER BY timestamp DESC
  LIMIT 2
`).all(task_id) as Risk[];
```

**Source:** Unresolved `raise_uncertainty` calls for this specific task.
**Limit:** 2 entries. If none exist, omit the section entirely.

---

## Query: Anti-Patterns (for "What you should NOT do" section)

```typescript
const antiPatterns = db.prepare(`
  SELECT d.content, a.timestamp
  FROM documents d
  JOIN audit_log a ON a.task_id = d.task_id AND a.tool_name LIKE 'submit_qa_review%'
  WHERE d.doc_type = 'qa_review'
    AND d.content LIKE '%QAFAILED%'
    AND d.task_id IN (
      SELECT id FROM tasks WHERE title LIKE ? 
    )
  ORDER BY a.timestamp DESC
  LIMIT 2
`).all(`%${domain}%`) as AntiPattern[];
```

**Purpose:** Surfaces anti-patterns from past `QAFAILED` reviews in the same domain.
**If no QAFAILED records exist:** omit the "What you should NOT do" section entirely — never invent content.

---

## Adding Knowledge Base Entries from Retrospectives

After each sprint retrospective, the Retro Facilitator (or Pete directly) inserts new entries:

```sql
-- New learning from retrospective
INSERT INTO sprint_learnings (id, task_type, domain, learning_text, source_session)
VALUES (
  'sl-07',
  'implementation',
  'mcp',
  'Always call checkState() as the first line in any submit_ or write_ tool — not after parameter validation.',
  'retro-2026-03-15'
);

-- New pattern observed across multiple tasks
INSERT INTO patterns (id, task_type, domain, pattern_text, source_session)
VALUES (
  'pat-03',
  'implementation',
  'astro',
  'Wrap all React component hydration in client:visible rather than client:only unless the component is above the fold.',
  'retro-2026-03-15'
);
```

When a pattern appears in a second task: increment `usage_count` rather than inserting a duplicate.

```sql
UPDATE patterns SET usage_count = usage_count + 1 WHERE id = 'pat-03';
```

---

## Deriving task_type and domain from a task

The Context Agent needs `task_type` and `domain` to run these queries.
These are derived from the task spec, not from the `tasks` table (which has no type column in Phase 1–5).

For the upgrade from Phase 1–5 minimum to the target context card:

1. Read `task_spec` via `read_task_spec_{slug}`
2. Classify `task_type` from spec content (look for implementation/refactor/docs/config verbs)
3. Classify `domain` from stack references (Astro components → `astro`, SQLite → `db`, etc.)
4. Run queries above with the derived values
5. Compose and emit the context card following context-card-format.md
