User: what are the major lessons in this README and supporting files for anyone wanting to create teams of agents with subagents to minimise the volume of context each agent needs, and avoid the issues described?

Workspace: Collecting workspace information# Key Lessons for Building Multi-Agent Teams with Minimal Context

Based on the README.md and supporting skills/examples, here are the major lessons:

---

## 1. Sub-Agents Exist to Isolate Context, Not to Role-Play

The single most repeated principle across the repository:

> "Sub-agents exist primarily to isolate context rather than to simulate organizational roles."
> — multi-agent-patterns SKILL.md

Avoid anthropomorphizing agents into "designer", "PM", "engineer" roles. Instead, partition by **context needs**. Each sub-agent gets a **clean context window** focused solely on its subtask, preventing accumulated history from degrading performance.

---

## 2. Understand the Token Economics

From multi-agent-patterns SKILL.md:

| Architecture | Token Multiplier |
|--|--|
| Single agent chat | 1× baseline |
| Single agent + tools | ~4× baseline |
| Multi-agent system | ~15× baseline |

Multi-agent only makes sense when the **task value justifies the cost** and involves heavy parallelization, information exceeding single context windows, or interfacing with many complex tools. As noted in blogs.md, Anthropic's research confirms this ~15× multiplier.

---

## 3. Never Pass Raw Data Through the Coordinator

The x-to-book-system example demonstrates this clearly:

> "Raw tweet data never passes through Orchestrator context. Scraper writes to file system, other agents read from file system. Orchestrator receives only phase summaries."

The coordinator should handle **routing and checkpoints only**, never bulk data. This directly addresses the **Supervisor Bottleneck** failure mode where the supervisor accumulates context from all workers and degrades.

---

## 4. Use the Filesystem as the Coordination Layer

From filesystem-context SKILL.md:

> "Sub-agents write their findings directly to the filesystem. The coordinator reads these files directly, bypassing intermediate message passing."

The pattern from filesystem-context implementation patterns uses structured workspaces:

```
workspace/
  agents/
    research_agent/
      findings.md
      status.json
    code_agent/
      changes.md
      test_results.txt
  coordinator/
    synthesis.md
```

This avoids the **"game of telephone"** where information degrades through summarization at each message-passing hop. The `AgentWorkspace` and `CoordinatorWorkspace` classes show this pattern concretely.

---

## 5. Choose the Right Context-Sharing Mode

From multi-agent-patterns SKILL.md, three isolation mechanisms exist:

| Mode | When to Use | Trade-off |
|------|------------|-----------|
| **Instruction passing** | Simple, well-defined subtasks | Maximum isolation, limited flexibility |
| **Full context delegation** | Complex tasks needing complete understanding | Defeats isolation purpose |
| **File system memory** | Shared state without context passing | Latency, consistency challenges |

As documented in frameworks reference, Manus uses instruction passing for simple tasks and full context only when sub-agents need shared files.

---

## 6. Set Explicit Context Budgets Per Agent

The x-to-book-system PRD shows concrete budgets:

| Agent | Token Budget | Scope |
|-------|-------------|-------|
| Orchestrator | 50k | Routing only, no raw data |
| Scraper | 20k | One account at a time |
| Analyzer | 80k | Per-account analysis |
| Writer | 80k | One chapter at a time |
| Editor | 60k | Per-chapter editing |

This applies the principle from context-fundamentals: *"Context must be treated as a finite resource with diminishing marginal returns."*

---

## 7. Apply Progressive Disclosure Across Agents

From context-fundamentals SKILL.md and the digital-brain example:

- Load only what's needed for the **current phase**
- Book outline loads first; chapter content loads only when the Writer works on that specific chapter
- The digital-brain uses 3-level loading: SKILL.md → `MODULE.md` → data files

Token savings demonstrated: **650 tokens vs 5,000+** when loading selectively vs everything.

---

## 8. Scale Agent Count to Query Complexity

From Anthropic's research documented in blogs.md:

> "Simple fact-finding requires just 1 agent with 3-10 tool calls, direct comparisons might need 2-4 subagents with 10-15 calls each, and complex research might use more than 10 subagents with clearly divided responsibilities."

Without explicit scaling rules, agents **overinvest in simple queries** — a common early failure mode.

---

## 9. Teach the Orchestrator How to Delegate Properly

From blogs.md (Anthropic's research lessons):

> "Each subagent needs an objective, an output format, guidance on the tools and sources to use, and clear task boundaries."

Vague instructions like "research the semiconductor shortage" cause subagents to **duplicate work or misinterpret tasks**. The `SupervisorAgent.decompose_task` method shows structured task decomposition by type.

---

## 10. Keep the Tool Set Small and Atomic

From case studies:

> "Small set (<20) of atomic functions: Bash, filesystem access, code execution. Most actions offload to sandbox layer."

The x-to-book-system consolidates to **3 tools instead of 15+**. This reduces tool description tokens and prevents model confusion from overlapping descriptions. As noted in blogs.md, tool outputs should return **only high-signal information** — contextual names over UUIDs.

---

## 11. Guard Against Specific Multi-Agent Failure Modes

From multi-agent-patterns SKILL.md and context-optimization SKILL.md:

| Failure Mode | Mitigation |
|--|--|
| **Supervisor Bottleneck** | Filesystem coordination; summaries only to coordinator |
| **Context Poisoning** | Validate outputs before passing between agents |
| **Infinite Loops** | Set time-to-live limits on sub-agents |
| **Divergence** | Weighted voting or debate protocols for consensus |
| **Duplication** | Clear task boundaries and explicit division of labor |
| **Lost-in-the-Middle** | Place critical info at start/end of each agent's context |

The `AgentFailureHandler` class provides structured failure handling patterns.

---

## 12. Offload Tool Outputs, Return Only References

From filesystem-context SKILL.md:

> "Write large outputs to files; return summaries and references to context."

Research shows tool observations can reach **83.9% of total context usage**. The scratch pad pattern in filesystem_context.py offloads large outputs and returns file references, keeping agent context lean. Anthropic restricts tool responses to **25,000 tokens by default** in Claude Code.

---

## Summary Framework

When building multi-agent teams, follow this decision sequence from the x-to-book-system:

1. **Identify context challenges** — volume constraints, saturation risks
2. **Select architecture pattern** — supervisor, swarm, or hierarchical based on coordination needs
3. **Design memory/coordination** — filesystem, vector store, or knowledge graph
4. **Apply optimization** — observation masking, compaction, progressive disclosure
5. **Build evaluation** — multi-dimensional quality rubrics per the evaluation skill