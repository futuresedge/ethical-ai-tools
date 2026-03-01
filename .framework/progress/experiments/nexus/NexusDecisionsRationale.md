# The Key Decisions and Their Rationale

### Decision 1: Tool selection as access control (OCAP)

**What:** Each agent spec declares exactly which tools it can call. Absent tools do not exist in that agent's world.

**Why:** The MCP spec investigated directly revealed that session IDs must not be used for authorisation, OAuth tokens identify VS Code (not the agent), and STDIO transport has no authentication layer at all.  Native runtime identity does not exist. OCAP turns this from a gap into a strength — the boundary is stronger than any identity check, because identity checks can be spoofed or have edge cases. Absent capabilities cannot. 

**What it replaces:** `NEVER` clauses in agent specs and ACL tables in the database. Both are conventions. OCAP is structure.

***

### Decision 2: Per-task instance agent generation

**What:** When a task is activated, a unique agent spec (`task-performer-task-07.agent.md`) and unique tool set (`write_proof_template_task_07`) are generated from a template. VS Code hot-reloads the spec immediately (confirmed empirically). When the task completes, both are archived.

**Why:** Role-level tool scoping eliminates zone-crossing (Feature Owner can't touch task specs). But two Task Performers running simultaneously need task-level isolation — task-07's performer must not be able to write to task-08's documents. Suffixed tool names make this structurally impossible at the instance level, completing the isolation model. 

**The overhead:** Trivial at Pete's scale. A handful of files and tool registrations per active task. Cleanup is deterministic — archive on completion, resurrect on reinstatement. The tool name in every audit log entry carries the full chain of custody (role, document type, task scope) with no join required.

***

### Decision 3: Tool grammar (`{verb}_{subject}_{task_id}`)

**What:** A closed vocabulary of 8 verbs (read, write, append, submit, request, search, get, raise) × the document type taxonomy × task scope suffix. Every tool name is derivable; no tool registry documentation needed.

**Why:** With many agent roles × document types × task instances, an unstructured tool catalogue becomes unmaintainable quickly. The grammar makes the catalogue self-organising — adding a new document type means adding rows to the matrix, not designing new tools from scratch. The name encodes the capability. 

***

### Decision 4: GitHub MCP server for code artefacts, not a fork

**What:** The official GitHub MCP server handles all git and PR operations. Its `--toolsets` flag and per-agent spec scoping restrict each agent to only the tools it needs (e.g., `create_branch, push_files, create_pull_request` only). [github](https://github.blog/changelog/2025-12-10-the-github-mcp-server-adds-support-for-tool-specific-configuration-and-more/)

**Why:** Forking the GitHub MCP server gives control inside GitHub API calls but creates a permanent maintenance obligation against a fast-moving repo with 27k stars and 54+ releases. The webhook pattern gives 95% of the same observability benefit — every GitHub event Nexus needs to know about fires automatically — with zero maintenance cost and no coupling to GitHub's release cycle. [docs.github](https://docs.github.com/en/copilot/how-tos/provide-context/use-mcp/configure-toolsets)

***

### Decision 5: GitHub webhooks → Nexus audit log

**What:** Nexus registers a webhook endpoint with the GitHub repository. Every push, PR, review, and merge fires a payload to Nexus. Branch naming convention (`task/task-07`) is the join key. Nexus writes every event to `audit_log` with `actor: 'webhook:github'`.

**Why:** The single-source-of-truth requirement demands Nexus see everything — including events that didn't go through its own tools. Hooking into the GitHub MCP server's call path would require a fork (Decision 4 rejected this). Webhooks are GitHub's native push notification mechanism, require no custom code on the GitHub side, and fire reliably for every event class needed. Pete can query the full chain of custody for any task in one SQL statement. 

***

### Decision 6: Compound tools for lifecycle-critical operations

**What:** `submit_proof`, `submit_qa_review`, `request_review` each encapsulate multiple operations — write + state transition + stream event + audit entry — in one atomic tool call.

**Why:** Sprint 6 retrospective evidence showed that agents comply superficially with multi-step instructions but may execute them partially or out of order.  Mandatory side effects cannot be conditional on agent behaviour. Moving them inside the tool implementation makes them unconditional. The agent calls one tool; the framework guarantees all consequences follow. 
