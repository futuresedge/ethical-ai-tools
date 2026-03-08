# Experiment 1 - Phase 1 — Nexus Foundation (≈ 1 hour)

**Goal:** A minimal MCP server connected to VS Code with a working database.

### Steps

**1.1 Scaffold the Nexus server**
```bash
mkdir nexus && cd nexus
pnpm init -y
pnpm install @modelcontextprotocol/sdk better-sqlite3
pnpm install -D typescript @types/node tsx
```
Use STDIO transport — this is what VS Code expects for local servers.

**1.2 Create the minimum schema**
```sql
CREATE TABLE tasks (
  id TEXT PRIMARY KEY,
  title TEXT,
  state TEXT DEFAULT 'DEFINED'
);

CREATE TABLE documents (
  id TEXT PRIMARY KEY,
  task_id TEXT,
  doc_type TEXT,        -- 'task_spec', 'proof_template', 'proof', 'work_log'
  content TEXT,
  version INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE audit_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  task_id TEXT,
  tool_name TEXT,       -- exact tool called, e.g. write_proof_template_task07
  action TEXT,
  content_hash TEXT,
  actor TEXT,           -- 'agent' or 'webhook:github'
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE stream_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  task_id TEXT,
  description TEXT,     -- plain English
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE tool_registry (
  task_id TEXT PRIMARY KEY,
  role TEXT,
  tools TEXT,           -- JSON array of tool names
  registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deregistered_at TIMESTAMP
);
```

**1.3 Implement the universal tools first**
```typescript
server.tool("get_context_card", { task_id: z.string() }, async ({ task_id }) => {
  const task = db.prepare("SELECT * FROM tasks WHERE id = ?").get(task_id);
  return { content: [{ type: "text", text: JSON.stringify(task) }] };
});

server.tool("raise_uncertainty", 
  { task_id: z.string(), description: z.string() }, 
  async ({ task_id, description }) => {
    db.prepare("INSERT INTO stream_events (task_id, description) VALUES (?, ?)")
      .run(task_id, `⚠️ UNCERTAINTY: ${description}`);
    return { content: [{ type: "text", text: "Uncertainty raised and visible in stream." }] };
});
```

**1.4 Register Nexus in VS Code**
```json
// .vscode/mcp.json
{
  "servers": {
    "nexus": {
      "type": "stdio",
      "command": "npx",
      "args": ["tsx", "nexus/server.ts"]
    }
  }
}
```

**1.5 Verify**
Open VS Code Copilot Chat. Type: `@nexus get_context_card for task-07`. Confirm the tool call appears in the chat. This proves the connection is live.

***

