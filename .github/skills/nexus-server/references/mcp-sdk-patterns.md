# Nexus MCP SDK Patterns

> Implementation patterns for the Nexus MCP server using `@modelcontextprotocol/sdk`.
> Source: Nexus-exp-01-phase-01.md, Nexus-exp-01-phase-02.md, NexusModelOverview.md
> Transport: STDIO only — what VS Code expects for local servers.

---

## Server Setup

```typescript
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';

const server = new McpServer({
  name: 'nexus',
  version: '0.1.0',
});

// Register tools before connecting transport
// (see dynamic-tool-registration.md for task-scoped tools)

const transport = new StdioServerTransport();
await server.connect(transport);
```

---

## VS Code Registration

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

Use `tsx` for TypeScript execution without a compile step during development.
Add `"github"` server entry alongside `"nexus"` when Phase 4 GitHub MCP integration is needed.

---

## Universal Tool Registration

Universal tools are registered at server startup — not inside `registerTaskTools()`.
They never carry a task suffix. Any agent may call them.

```typescript
// get_context_card — returns task row as context briefing (Phase 1 minimum)
server.tool(
  'get_context_card',
  { task_id: z.string() },
  async ({ task_id }) => {
    const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(task_id);
    if (!task) {
      return { content: [{ type: 'text', text: 'Task not found.' }], isError: true };
    }
    return { content: [{ type: 'text', text: JSON.stringify(task, null, 2) }] };
  }
);

// raise_uncertainty — surfaces exceptional conditions to Pete immediately
server.tool(
  'raise_uncertainty',
  { task_id: z.string(), description: z.string() },
  async ({ task_id, description }) => {
    db.prepare('INSERT INTO stream_events (task_id, description) VALUES (?, ?)')
      .run(task_id, `⚠️ UNCERTAINTY [${task_id}]: ${description}`);
    db.prepare(
      'INSERT INTO audit_log (task_id, tool_name, action, actor) VALUES (?, ?, ?, ?)'
    ).run(task_id, 'raise_uncertainty', description, 'agent');
    return { content: [{ type: 'text', text: 'Uncertainty raised. Visible in stream.' }] };
  }
);
```

---

## Sending `tools/list_changed` Notification

After registering or deregistering task-scoped tools, signal VS Code to refresh its list:

```typescript
server.notification({ method: 'notifications/tools/list_changed' });
```

VS Code will re-query the tool list without a server restart or manual refresh.
Call this once at the end of `registerTaskTools()` and once at the end of `deactivateTask()`.

---

## `package.json` Minimum for Nexus Server

```json
{
  "name": "nexus",
  "type": "module",
  "scripts": {
    "dev": "tsx nexus/server.ts"
  },
  "dependencies": {
    "@modelcontextprotocol/sdk": "latest",
    "better-sqlite3": "^9.0.0",
    "zod": "^3.0.0"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "@types/node": "^22.0.0",
    "@types/better-sqlite3": "^7.0.0",
    "tsx": "^4.0.0"
  }
}
```

---

## Typed Error Responses

Rejecting a tool call due to a failed precondition (wrong state, missing document):

```typescript
// State precondition check pattern — used in every submit_ and write_ tool
const task = db.prepare('SELECT state FROM tasks WHERE id = ?').get(task_id) as { state: string } | undefined;

if (!task) {
  return { content: [{ type: 'text', text: `Task ${task_id} not found.` }], isError: true };
}
if (task.state !== 'CLAIMED') {
  return {
    content: [{ type: 'text', text: `Precondition failed: expected state CLAIMED, got ${task.state}.` }],
    isError: true,
  };
}
```

Return `isError: true` with a plain-English message. Never throw — thrown errors crash the server process.
