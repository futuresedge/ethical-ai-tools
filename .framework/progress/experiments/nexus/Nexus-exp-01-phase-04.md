# Phase 4 — GitHub Webhook Integration (≈ 45 min)

**Goal:** Git events from agents using the GitHub MCP server appear in the Nexus audit log automatically.

**4.1 Add an HTTP webhook endpoint to Nexus**
Run a lightweight HTTP server alongside the STDIO MCP server as a separate process:

```typescript
// nexus/webhook.ts
import Fastify from 'fastify';
const app = Fastify();

app.post('/webhook/github', async (req, reply) => {
  const event = req.headers['x-github-event'] as string;
  const payload = req.body as any;
  
  // Extract task_id from branch name convention: task/task-07 → task-07
  const branch = payload.ref?.replace('refs/heads/', '') 
              || payload.pull_request?.head?.ref 
              || '';
  const task_id = branch.startsWith('task/') ? branch.replace('task/', '') : null;

  if (task_id) {
    db.prepare(`
      INSERT INTO audit_log (task_id, tool_name, action, actor)
      VALUES (?, ?, ?, 'webhook:github')
    `).run(task_id, `github:${event}`, JSON.stringify({
      action: payload.action,
      sha: payload.after || payload.pull_request?.head?.sha,
      title: payload.pull_request?.title
    }));

    db.prepare("INSERT INTO stream_events (task_id, description) VALUES (?, ?)")
      .run(task_id, formatStreamEvent(event, payload));
  }

  reply.send({ ok: true });
});

app.listen({ port: 3001 });
```

**4.2 Register GitHub MCP server in VS Code**
```json
// .vscode/mcp.json
{
  "servers": {
    "nexus": { "type": "stdio", "command": "npx", "args": ["tsx", "nexus/server.ts"] },
    "github": { "type": "http", "url": "https://api.githubcopilot.com/mcp" }
  }
}
```

**4.3 Register the webhook with GitHub**
```bash
# One-time setup — can use GitHub MCP tool or GitHub CLI
gh api repos/:owner/:repo/hooks \
  --method POST \
  --field name=web \
  --field "config[url]=https://your-ngrok-url/webhook/github" \
  --field "config[content_type]=json" \
  --field "events[]=push" \
  --field "events[]=pull_request" \
  --field "events[]=pull_request_review" \
  --field active=true
```

For local development, use `ngrok http 3001` to expose the webhook endpoint.

**4.4 Verify**
- Invoke task-07's Task Performer agent in VS Code.
- Have it create a branch and push a commit via the GitHub MCP tools.
- Check `SELECT * FROM audit_log WHERE task_id = 'task-07'` in the Nexus database.
- The push event should appear with `actor = 'webhook:github'`.
- **This proves single-source-of-truth: Nexus sees the GitHub event it didn't execute.**

***