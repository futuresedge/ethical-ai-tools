10 Most Important Assumptions in the New Framework
These are the load-bearing beliefs in the post-event-storming framework. Each one is high-dependency — if it's wrong, significant structural work fails. Ordered by consequence if the assumption turns out to be false:

1. Acceptance criteria can always be made explicit and testable. The Test Writer Agent's role as the "ambiguity detector" only works if AC can be translated into at least one executable test. If some valid AC is inherently qualitative (e.g., "the UI feels intuitive"), the ambiguity detection mechanism will either block everything or silently pass things it shouldn't

2. The Product Owner is consistently available and decisive at every gate. The framework requires human review at context approval, task publishing, and every returned-task decision. A slow, inconsistent, or absent Product Owner stalls the entire pipeline at multiple points — the framework has no graceful fallback for this

3. Environment state can be fully and reliably captured in a snapshot. The Environment Contract assumes that a deterministic snapshot of environment conditions can be taken and compared. External service states, network-dependent conditions, and race conditions may not be capturable, which means the contract misses the exact class of failures it was designed to prevent

4. Literal command output is sufficient and reliable proof of completion. The Evidence Gate rejects assertions and requires captured command output. This assumes the tests themselves are correct — a passing command output from a flawed test suite is still wrong, and the gate won't catch it

5. Context can be curated to "minimum necessary" without loss of critical information. The Context Card model requires the Context Agent to reliably identify what is relevant for each specific task. For novel tasks with no prior patterns in the knowledge base, the card may be incomplete in ways that are invisible until execution fails silently

6. Hierarchical agent spawning is the right coordination model at all scales. Resolving H9 in favour of Feature Owner → Task Owner hierarchy assumes context inheritance at birth outweighs the cost of a rigid tree structure. At greater feature complexity, Feature Owner Agents may become coordination bottlenecks that a more fluid model would avoid

7. Two specialist QA Agents (Definition and Execution) carry sufficiently different context to justify the split. H11 was resolved by splitting QA into Zone 2–3 and Zone 4 specialists. If the context difference is smaller than expected in practice, you've added a coordination actor and a handoff point for no meaningful quality gain

8. The Observable Stream provides sufficient legibility for non-technical humans. The framework assumes that plain-English events emitted to the stream are enough for a human Product Owner to maintain appropriate oversight. This has not been tested — humans may need aggregated summaries, dashboards, or exception-only alerts before the raw stream becomes genuinely useful rather than overwhelming

9. Feature delivery (Zone 5) can be reliably triggered by policy when all tasks complete. The framework assumes that once all child tasks are COMPLETED and integration tests pass, the Feature Aggregate can safely proceed to staging and production. This assumes integration tests are comprehensive enough that an automated pass is genuinely trustworthy — a significant assumption that the under-specified Zone 5 doesn't yet validate

10. The Uncertainty sub-flow handles all classes of mid-execution blockage. The uncertainty pathway (Raised → Researched → Mitigation → Resolved/Blocked) assumes all mid-execution problems can be characterised as "uncertainties." Tool failures, environment corruption, and malformed task specs may not fit the uncertainty pattern cleanly and could fall through to BLOCKED with no clear resolution path — the sub-flow's own dedicated Event Storming session will likely surface this
