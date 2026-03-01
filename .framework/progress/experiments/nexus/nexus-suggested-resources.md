# Suggested Resources

### MCP Protocol

- **MCP specification and architecture overview** — `modelcontextprotocol.io/docs/learn/architecture` — the definitive reference for how transports, tool listing, and `tools/list_changed` notifications work 
- **MCP authorization specification** — `modelcontextprotocol.io/docs/tutorials/security/authorization` — explains why session IDs must not be used for authorization and what OAuth 2.1 actually provides 
- **MCP TypeScript SDK** — `github.com/modelcontextprotocol/typescript-sdk` — the SDK used to build Nexus; covers server creation, tool registration, STDIO transport, and notification dispatch [github](https://github.com/modelcontextprotocol/typescript-sdk?tab=readme-ov-file)
- **Building MCP servers with TypeScript SDK** — `dev.to/shadid12/how-to-build-mcp-servers-with-typescript-sdk-1c28` — practical walkthrough covering project setup, tool schemas with Zod, and STDIO transport configuration [dev](https://dev.to/shadid12/how-to-build-mcp-servers-with-typescript-sdk-1c28)
- **FreeCodeCamp MCP server handbook** — `freecodecamp.org/news/how-to-build-a-custom-mcp-server-with-typescript-a-handbook-for-developers` — broader reference covering tool design patterns and real-world MCP server architecture [freecodecamp](https://www.freecodecamp.org/news/how-to-build-a-custom-mcp-server-with-typescript-a-handbook-for-developers/)

### VS Code Agent Mode

- **VS Code MCP server documentation** — `code.visualstudio.com/docs/copilot/chat/mcp-servers` — covers `.vscode/mcp.json` configuration, multi-server composition, and the `tools/list_changed` refresh mechanism 
- **Agent mode announcement and architecture** — `code.visualstudio.com/blogs/2025/04/07/agentMode` — explains how VS Code aggregates tools from multiple MCP servers, tool approval controls, and the lifecycle of an agent session [code.visualstudio](https://code.visualstudio.com/blogs/2025/04/07/agentMode)
- **VS Code custom agents documentation** — `code.visualstudio.com/docs/copilot/copilot-customization` — covers `.agent.md` spec structure, the `tools` frontmatter array, hooks, and the file-watching behaviour that enables hot-reload 
- **Agent mode video tutorial** — `youtube.com/watch?v=5NxGqnTazR8` — practical demonstration including custom agents, MCP server integration, and source control tools; chapters at 10:20 (custom agents) and 16:15 (MCP) are most relevant [youtube](https://www.youtube.com/watch?v=5NxGqnTazR8)

### GitHub MCP Server

- **GitHub MCP server repository** — `github.com/github/github-mcp-server` — source, configuration reference, and toolset documentation [github](https://github.com/github/github-mcp-server)
- **Setting up the GitHub MCP server** — `docs.github.com/en/copilot/how-tos/provide-context/use-mcp/set-up-the-github-mcp-server` — covers local vs remote server, authentication, and the `--toolsets` flag for restricting tool access [docs.github](https://docs.github.com/en/copilot/how-tos/provide-context/use-mcp/set-up-the-github-mcp-server)
- **Configuring toolsets for the GitHub MCP server** — `docs.github.com/en/copilot/how-tos/provide-context/use-mcp/configure-toolsets` — fine-grained control over which tools each agent gets; directly relevant to per-agent tool restriction [docs.github](https://docs.github.com/en/copilot/how-tos/provide-context/use-mcp/configure-toolsets)
- **Tool-specific configuration changelog** — `github.blog/changelog/2025-12-10-the-github-mcp-server-adds-support-for-tool-specific-configuration-and-more` — covers the `X-MCP-Tools` header for exact tool selection rather than toolset-level control [github](https://github.blog/changelog/2025-12-10-the-github-mcp-server-adds-support-for-tool-specific-configuration-and-more/)
