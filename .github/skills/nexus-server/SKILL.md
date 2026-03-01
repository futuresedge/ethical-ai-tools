```skill
# Skill: Nexus Server
TRIGGERS: "MCP server", "nexus server", "stdio transport", "better-sqlite3",
          "registerTaskTools", "tools/list_changed", "server.tool",
          "mcp.json", "dynamic tool registration", "activate_task",
          "compound tool", "agent spec generation", "task performer template"
ZONE: cross-zone (Nexus build)
USED BY: Nexus Server Builder
CONTEXT-TREE NODE: meta (no context-tree entry required)

## What this skill does
Carries the implementation conventions for the Nexus MCP server: MCP SDK setup
with STDIO transport, synchronous SQLite via better-sqlite3, dynamic per-task tool
registration using the `registerTaskTools()` pattern, compound tool implementation
(atomic write + state transition + stream event + audit), and agent spec generation
from a `{{PLACEHOLDER}}` template. Applied to any agent extending or modifying the
Nexus server code.

## Load on activation
- references/mcp-sdk-patterns.md
- references/db-conventions.md
- references/dynamic-tool-registration.md

## What nexus-server covers — and what it does not
COVERS: McpServer STDIO transport setup and `.vscode/mcp.json` registration
COVERS: better-sqlite3 synchronous query patterns, WAL mode, prepared statements
COVERS: `registerTaskTools()` dynamic dispatch pattern and `tools/list_changed` notification
COVERS: compound tool pattern — atomic write + state transition + stream event + audit_log entry
COVERS: agent spec template generation (`{{TASK_ID}}`, `{{TASK_SLUG}}`, `{{TASK_TITLE}}`)
COVERS: `deactivate_task` cleanup — file deletion and tool deregistration
DOES NOT COVER: tool naming grammar — that is nexus-tool-grammar
DOES NOT COVER: Fastify webhook server (nexus/webhook.ts) — that is a separate process
DOES NOT COVER: GitHub webhook payload parsing — load nexus-webhooks if needed

## Do not load
- nexus-tool-grammar — load separately if designing tool names
- nexus-ontology — load separately if running a dimension check on new tools
```
