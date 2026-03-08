# Hypothesis Card — Phase 1: Nexus Foundation

**Hypothesis:** A minimal TypeScript MCP server using STDIO transport, connected to a SQLite database, can be registered in VS Code and called by a Copilot agent in a live conversation with no authentication infrastructure required.

**Test:** Scaffold the Nexus server with two universal tools (`get_context_card`, `raise_uncertainty`), register it in `.vscode/mcp.json`, open a VS Code Copilot Chat session, and invoke both tools explicitly.

**Pass:** Both tool calls succeed, return data from the SQLite database, and appear in the VS Code tool call log. The server process starts automatically when VS Code opens the workspace.

**Fail:** The server fails to start, tools don't appear in the agent's available set, or tool calls return errors unrelated to data content (i.e., transport or connection failures).

**Fallback:** If STDIO transport fails, switch to HTTP transport on localhost. If SQLite causes issues with the STDIO process, switch to a JSON file store for Phase 1 only and return to SQLite in Phase 2. Do not proceed to Phase 2 until at least one tool call succeeds end-to-end.

***