**Beyond Coordination Overhead: A Framework for Trustworthy Human-AI Software Development**

**Pete Argent**  
February 2026

---

**Abstract**

This white paper introduces an evidence-based framework for multi-agent software development that addresses a fundamental challenge in human-AI collaboration: coordination overhead. Drawing from transaction cost economics, empirical sprint data, and cross-disciplinary coordination research, we present four architectural primitives—Evidence Gates, Environment Contracts, Context Cards, and Observable Streams—that reduce coordination costs while building human trust in AI agent capabilities. Early validation through six development sprints demonstrates a 38% coordination overhead, suggesting significant opportunity for optimization. The framework's design is grounded in the insight that trust is not granted but accumulated through repeated, verified acts of competence made visible through structured coordination mechanisms.

---

**1. Introduction**

**1.1 The Coordination Problem in Knowledge Work**

Between 40-50% of knowledge work time is consumed by coordination activities rather than value creation[1][2]. This overhead—comprising search costs, handoff costs, monitoring costs, and context-switching costs—represents a massive inefficiency that compounds as organizational complexity increases. Ronald Coase's seminal 1937 work on transaction costs identified that firms exist precisely to internalize these coordination costs under hierarchical management when market mechanisms become too expensive[3].

The emergence of AI agents as autonomous workers introduces a new institutional layer: neither pure hierarchy nor pure market, but algorithmic coordination. This raises a fundamental question: can AI-mediated coordination mechanisms reduce transaction costs below both traditional hierarchical management and market-based freelancing?

**1.2 The Human-AI Trust Gap**

Humans extending trust to AI systems face a unique challenge. Unlike human-to-human trust, which builds through repeated social interaction and shared context, human-AI trust must be built despite:

* **Opacity**: AI decision-making processes are often opaque

* **No shared context**: Agents lack persistent memory across sessions

* **Silent failures**: Errors that appear as successes to pattern-matching systems

* **Verification burden**: Humans must check AI work, creating its own coordination cost

Research on organizational trust demonstrates that trust is accumulated incrementally through small, verified acts of reliability—not granted as an initial condition[4]. The "marble jar" metaphor from psychological safety research captures this: each successful interaction adds a marble; trust grows only as marbles accumulate[5].

**1.3 Contribution of This Work**

This white paper presents:

1. An empirically grounded framework for human-AI software development derived from six development sprints with documented failure modes

2. Four architectural primitives that address specific coordination cost categories while building trust through visibility

3. A theoretical model linking coordination mechanisms to transaction cost reduction and trust accumulation

4. Early validation data showing 38% coordination overhead with clear optimization pathways

5. A research agenda connecting this framework to broader questions in organizational economics and AI governance

---

**2. Problem Analysis: Observed Failure Modes**

**2.1 Sprint Retrospective Findings**

Six development sprints using AI agents produced detailed retrospectives documenting specific failure patterns. These failures, rather than hypothetical risks, ground the framework design.

**P1: Unverifiable Environment State**  
Sprint 6 QA session extended from 30 to 180 minutes because developer and QA agents operated in silently different environments. No signal indicated the divergence until cascading failures occurred[6].

**P2: Silent Failure Modes**  
bun test ignored vitest.config.ts. lsof reported a port occupied by a suspended process. vitest-environment: node silently ignored unless on line 1 of config. All appeared as successes to agents using pattern matching on output[6].

**P3: Knowledge Produced But Not Consumed**  
testing-strategies.md was written in Sprint 6-02 and violated within the same sprint in 6-02A. Documentation exists but has no mechanism to surface at the moment it's relevant[6].

**P4: Verification Positioned Too Late**  
First-time QA pass rate: 33%. QA absorbs costs of defects that could have been caught at handoff. The further downstream a defect travels, the more expensive to fix[6].

**P5: Agent Specification Accumulation**  
Every sprint improvement adds to agent specs. After six sprints, how large are these specifications? At some point, the spec itself becomes the context overload problem it was meant to solve[6].

**P6: No Shared Ground Truth**  
Each agent constructs its own model of the world from its context window. No shared fact exists—not about environment state, not about task state, not about what another agent confirmed[6].

**2.2 Root Cause: Coordination Cost Externalization**

These failures share a common structure: coordination costs that should be explicit and managed are instead externalized to individual agents or to humans performing verification after the fact. This mirrors the classic organizational problem Coase identified—when coordination costs are hidden, they don't disappear; they simply move to less efficient locations[3].

---

**3. Theoretical Foundation**

**3.1 Transaction Cost Economics Applied to AI Coordination**

Coase's framework decomposes coordination costs into measurable categories[3][7]:

| Cost Category | Manifestation in AI Development |
| :---- | :---- |
| Search costs | Finding relevant patterns, documentation, prior decisions |
| Bargaining costs | Negotiating handoff protocols, acceptance criteria |
| Monitoring costs | Verifying agent claims, checking for silent failures |
| Enforcement costs | Ensuring agents follow protocols, catching violations |
| Synchronization costs | Aligning environment state, timing handoffs |
| Handoff costs | Transferring context between agents or zones |
| Waiting costs | Idle time during human review gates |
| Context-switching costs | Mental overhead of moving between tasks/agents |

Table 1: Transaction cost taxonomy mapped to agentic development

Traditional software development internalizes these costs through practices like code review, pair programming, and continuous integration. The question is whether AI-mediated mechanisms can perform this internalization more efficiently than human processes.

**3.2 Trust as Coordination Infrastructure**

Recent research on implementation science identified that trusting relationships among team members significantly reduce coordination costs by enabling three pre-conditions for effective collaboration[8]:

* **Capability**: Psychological ability to engage in risk-taking and learning

* **Opportunity**: Social environments that support information exchange

* **Motivation**: Commitment to shared goals and resilience under stress

Critically, the research found that building trusting relationships may be *more important than the selection of specific implementation strategies* for achieving outcomes[8]. This suggests that for human-AI teams, trust-building mechanisms are not auxiliary features—they are load-bearing infrastructure.

**3.3 Evidence-Based Trust vs. Reputation-Based Trust**

Unlike human teams where trust can build through informal social mechanisms, human-AI trust requires *evidence-based* rather than *reputation-based* foundations. Each claim must carry proof. The forensic chain-of-custody model from legal systems provides a useful analogy: evidence is admissible not because you trust the person who collected it, but because you can verify every hand it passed through[9].

---

**4. The Four Primitives**

Drawing from cross-disciplinary coordination research—aviation safety protocols, pharmaceutical manufacturing, surgical checklists, DNA error correction, and manufacturing quality systems—we identify four coordination primitives that address specific transaction cost categories while building trust through visibility.

**4.1 Evidence Gate**

**Problem addressed**: Monitoring costs, enforcement costs  
**Inspired by**: Test-Driven Development, pharmaceutical batch records, *shisa kanko* (pointing and calling)

Before any work crosses a boundary, agents produce a *proof template*—the exact commands, outputs, and formats that will constitute evidence of completion. Work becomes the act of making that template true by filling it with literal output.

| Component | Description |
| :---- | :---- |
| Proof template | Pre-specified commands and expected output formats |
| Literal capture | Actual command output (not summaries or assertions) |
| Exit codes | Explicit success/failure signals |
| Environment snapshot | State under which evidence was captured |
| Timestamp | When evidence was produced |
| Agent signature | Which agent produced this evidence |

Table 2: Evidence Gate components

**Trust mechanism**: Humans trust the *evidence*, not the agent. The proof is verifiable independently of who produced it.

**Example**:

{  
"proof_template": {  
"command": "npm test",  
"expected_pattern": "d+ passing",  
"expected_exit_code": 0,  
"required_output": "16/16 passing"  
},  
"actual_output": {  
"command": "npm test",  
"stdout": "✓ 16 passing (342ms)",  
"exit_code": 0,  
"timestamp": "2026-02-28T14:32:11Z",  
"environment_hash": "abc123..."  
}  
}

**4.2 Environment Contract**

**Problem addressed**: Synchronization costs, handoff costs  
**Inspired by**: Infrastructure-as-code, Docker, aviation pre-flight checklists

Before work begins, a verifiable snapshot of environmental conditions is created and stored as a shared artifact. Every agent working on the task operates against the same contract. Divergence from it triggers explicit alerts.

| Field | Example |
| :---- | :---- |
| Database URL | postgresql://localhost:5432/dev |
| Test runner | npm test (not bun test) |
| Node environment | NODE_ENV=test |
| Server port | 4321 |
| Server health | curl -v http://localhost:4321 → 200 OK |
| Config file location | vitest.config.ts at project root |
| Required dependencies | vitest@1.2.0, @testing-library/react@14.0.0 |

Table 3: Environment Contract fields (example)

**Trust mechanism**: Environment is a *shared fact*, not a per-agent assumption. Drift is detectable, not silent.

**Transaction cost reduction**: QA agent's pre-flight is running the same environment verification and comparing to stored snapshot—eliminating the "works on my machine" problem that consumed 150 minutes in Sprint 6[6].

**4.3 Context Card**

**Problem addressed**: Search costs, context-switching costs  
**Inspired by**: Surgical checklists, *mise en place* (kitchen prep), progressive disclosure in UX

Agents receive task-specific briefing cards generated on-demand from a knowledge base, containing only what's relevant to *this* task. Agent specifications describe the *role*, not the comprehensive knowledge. The knowledge base grows; the specs don't.

| Component | Content |
| :---- | :---- |
| Task type | Integration test story |
| Relevant patterns | testing-strategies.md §5: "Use npm test, not bun test" |
| Known anti-patterns | "Never rely on lsof without curl verification" |
| Environment notes | "vitest-environment must be line 1 of config" |
| Previous failures | S6-02A: False passing on bun test |

Table 4: Context Card structure

**Trust mechanism**: Agents work with *curated, relevant* knowledge rather than hoping to find it in 15,000-token specifications.

**Transaction cost reduction**: Reduces search costs (knowledge surfaces automatically) and context-switching costs (agents receive only what matters now).

**4.4 Observable Stream**

**Problem addressed**: Waiting costs, monitoring costs  
**Inspired by**: NASA mission control voice loops, manufacturing *andon* cords, ant stigmergy

Every significant agent action emits a plain-English event to a visible stream. Humans and meta-agents observe work in real-time, enabling intervention *before* problems compound.

[14:32:08] TaskPerformer: Opening missions.test.ts  
[14:32:11] TaskPerformer: Running npm test — waiting for output  
[14:32:14] TaskPerformer: ✓ 16/16 passing — capturing output  
[14:32:15] TaskPerformer: Writing [proof-of-completion.md](http://proof-of-completion.md)  
[14:32:16] TaskPerformer: Submitting for QA review  
[14:32:17] QAExecutor: Verifying environment contract  
[14:32:18] QAExecutor: ✓ Environment matches snapshot  
[14:32:19] QAExecutor: Running independent test verification

**Trust mechanism**: Legibility builds trust. Humans see *what* agents are doing, not just *what* they claim to have done.

**Transaction cost reduction**: Waiting costs drop (humans monitor stream, not polls). Monitoring costs drop (stream is the audit trail). Enforcement costs drop (deviations visible immediately).

---

**5. Integration: How Primitives Combine**

The four primitives are not independent—they form an integrated coordination architecture.

![][image1]

Figure 1: Integration of four coordination primitives across agent workflow

**Workflow sequence**:

1. **Task Start**: Environment Contract created and signed by all agents who will touch this task

2. **Context Delivery**: Context Card generated from knowledge base, containing task-specific patterns and prior learnings

3. **Work Begins**: Agent emits Observable Stream events as actions occur

4. **Completion**: Agent fills Evidence Gate proof template with literal command output

5. **Handoff**: Next agent verifies Environment Contract matches, reviews Evidence Gate, receives updated Context Card

6. **Human Review**: Product Owner monitors Observable Stream, reviews Evidence, approves/returns based on proof, not claims

This structure eliminates the six failure modes identified in Section 2:

* **P1 (Environment drift)**: Caught by Environment Contract

* **P2 (Silent failures)**: Caught by Evidence Gate requiring literal output

* **P3 (Knowledge not consumed)**: Solved by Context Card delivery

* **P4 (Late verification)**: Moved earlier via Evidence Gate at handoff

* **P5 (Spec accumulation)**: Knowledge base grows; specs stay lean

* **P6 (No shared truth)**: Environment Contract and Evidence Gate create shared facts

---

**6. Measurement and Early Validation**

**6.1 Token Efficiency Metrics**

Observable Stream events provide a natural instrumentation layer for measuring coordination costs:

{  
"event": "AcceptanceCriteriaDefined",  
"agent": "ac-writer",  
"timestamp": "2026-02-28T01:15:00Z",  
"input_tokens": 847,  
"output_tokens": 312,  
"files_read": [".framework/features/blog-search/feature-spec.md"],  
"context_sources": ["skill:acceptance-criteria", "instructions:ac-vs-tests"]  
}

Aggregating across features yields:

| Metric | Pre-Framework | Target |
| :---- | ----: | ----: |
| Tokens per agent call | 2,400 avg | 1,200 avg |
| Context retrieval time | 800ms avg | 200ms avg |
| Handoff verification time | 15 min | 3 min |
| QA first-pass rate | 33% | 80% |

Table 5: Target efficiency improvements

**6.2 Sprint 6 Baseline Data**

Sprint 6 retrospective provided quantified coordination overhead[6]:

* **Total sprint time**: 8 hours

* **Coordination overhead**: 38% (3.04 hours)

* **Tool friction**: 15% (1.2 hours)

* **Value work**: 47% (3.76 hours)

Breakdown of coordination time:

* Context gathering: 45 minutes

* Environment debugging: 90 minutes

* Handoff protocol: 30 minutes

* Documentation writing: 29 minutes

**Hypothesis**: The four primitives can reduce coordination overhead from 38% to ~20% by:

* Context Card: -50% context gathering time

* Environment Contract: -70% environment debugging time

* Evidence Gate: -40% handoff verification time

* Observable Stream: No time reduction, but increases trust/visibility

**6.3 Validation Approach**

Three structured probes planned to test primitives:

**Probe 1: Evidence Gate**  
Run one developer→QA handoff with proof template requirement. Measure: Does it eliminate "agent said X, QA found Y" failures? Pass criterion: Zero mismatches over 3 tasks.

**Probe 2: Environment Contract**  
Capture environment snapshot at task start, deliberately drift one condition, measure detection. Pass criterion: Drift detected before execution begins.

**Probe 3: Context Card**  
Run one task with generated card (not full spec). Measure: Does quality hold? Pass criterion: Task completes without agent requesting additional context.

---

**7. Broader Implications**

**7.1 Connection to PhD Research Agenda**

This framework serves as the implementation mechanism (Phase 3, Mechanism C) for broader research on transaction cost economics in the AI era[10]. The research question: Can AI-mediated coordination mechanisms reduce transaction costs below hierarchical management in knowledge work?

The framework enables controlled measurement across five dimensions:

1. **Coordination cost reduction**: Measured in token usage, time per handoff, verification overhead

2. **Quality maintenance**: Measured in defect rates, first-pass acceptance, rework cycles

3. **Trust calibration**: Measured via human oversight time, intervention frequency, approval confidence

4. **Scalability**: Measured as coordination cost per agent as team size increases

5. **Generalization**: Tested across multiple knowledge work domains (law, medicine, consulting, etc.)

**7.2 The Institutional Innovation Hypothesis**

If the four primitives successfully reduce coordination costs while maintaining quality, the implications extend beyond productivity gains for existing teams. Coase's framework suggests that when new coordination mechanisms become available, they can enable entirely new organizational forms[3].

**The provocative claim**: If coordination mechanisms exist that work reliably in *low-trust institutional environments*—where parties have no reputation history and limited recourse—they unlock economic participation for billions of knowledge workers currently excluded from global markets due to institutional trust deficits[10].

This is not an efficiency argument (making current workers 20% faster) but a *participation* argument (enabling workers who currently cannot participate at all). The moral stakes shift from optimization to inclusion.

**7.3 The Blockchain Question, Revisited**

The initial framework design included token economics, trust scores, and marketplace mechanisms inspired by blockchain/DAO governance[11]. The design thinking analysis correctly identified these as *accidental complexity*—features introduced by the vision rather than required by the current problem[9].

However, the *eventual* vision remains valid: smart contracts become meaningful once you have verified evidence, signed environment contracts, and observable streams to populate them. Blockchain doesn't *create* trust—it makes existing trust mechanisms *portable* and *permanent* across contexts that previously lacked them.

The sequence matters:

1. **Now**: Build evidence-based trust through the four primitives

2. **Phase 2**: Validate that these mechanisms reduce coordination costs in controlled settings

3. **Phase 3**: Extend to low-trust environments (freelance marketplaces, cross-border teams)

4. **Phase 5**: Cryptographic enforcement layer makes trust properties verifiable and portable at scale

Smart contracts are not the foundation—they are the institutional layer that makes a working foundation portable.

---

**8. Design Principles**

Drawing from the design thinking analysis, seven principles govern framework decisions[9]:

1. **Evidence over assertion**: No claim accepted without literal, captured proof

2. **Environment as shared fact**: Captured, signed, verifiable by all agents

3. **Context delivered, not carried**: Task-specific cards generated on-demand from knowledge base

4. **Silent failures are system failures**: Any condition that looks like success but isn't is a framework defect

5. **Trust accumulated, not granted**: Each verified task adds a marble; autonomy expands with evidence

6. **Failure surfaced, not hidden**: Graceful failure is a designed capability, not a special case

7. **Stream is coordination**: Observable events are the primary coordination mechanism

---

**9. Limitations and Future Work**

**9.1 Current Limitations**

**Single project, single team**: Validation data comes from one software development project with one human product owner. Generalization requires testing across:

* Multiple project types (greenfield vs. maintenance, different tech stacks)

* Multiple human oversight styles (active vs. passive, technical vs. non-technical)

* Multiple agent implementations (different LLM providers, different tooling)

**Phase 0 scope**: The framework currently addresses execution mechanics (Zones 3-4 in the domain model). Integration testing, staging, and production deployment (Zone 5) are under-specified[12].

**Qualitative AC assumption**: The framework assumes acceptance criteria can always be made explicit and testable. Some valid criteria ("the UI feels intuitive") may be inherently qualitative, potentially blocking the pipeline or forcing false quantification[12].

**Human availability**: Framework requires human review at multiple gates (context approval, task publishing, returned-task decisions). A slow or inconsistent human becomes a bottleneck with no graceful fallback[12].

**9.2 Open Research Questions**

1. Can Context Cards reliably identify relevant patterns for novel task types with no prior examples?

2. Does the Observable Stream provide sufficient legibility for non-technical humans, or do they need aggregated dashboards?

3. At what team size does hierarchical agent spawning (Feature Owner → Task Owner) become a coordination bottleneck?

4. How do the primitives perform under adversarial conditions (untrusted agents, contested claims)?

5. What is the optimal balance between automated policy triggers and human decision points?

**9.3 Next Steps**

**Immediate (Weeks 1-2)**:

* Run three validation probes (Evidence Gate, Environment Contract, Context Card)

* Instrument Observable Stream for token usage tracking

* Complete Zone 5 Event Storming session to resolve deployment boundary questions[12]

**Short-term (Weeks 3-6)**:

* Build Nexus v1 with 9 tools mapped to four primitives

* Restructure agent specs to Job-Card-Gate format

* Run first real sprint on new framework, measure coordination overhead

**Medium-term (Months 3-6)**:

* Extend to second project type (non-software knowledge work)

* Test with multiple human product owners

* Publish empirical results on coordination cost reduction

---

**10. Conclusion**

Coordination overhead consumes 40-50% of knowledge work time, yet organizational structures have remained largely unchanged since Coase's 1937 analysis. The emergence of AI agents as autonomous workers creates an opportunity to test whether algorithmic coordination mechanisms can outperform both hierarchical management and market-based freelancing.

This framework contributes:

1. **Four architectural primitives** grounded in cross-disciplinary coordination research and empirical failure data

2. **A transaction cost lens** for understanding and measuring coordination efficiency in human-AI teams

3. **A trust-building mechanism** that accumulates evidence rather than relying on reputation

4. **Early validation data** from six sprints showing 38% coordination overhead with clear optimization pathways

5. **A research agenda** connecting practical framework development to fundamental questions in organizational economics

The provocative long-term claim: if these mechanisms work reliably in low-trust environments, they don't just make existing teams faster—they enable participation in global knowledge work for populations currently excluded by institutional trust barriers. That shifts the conversation from efficiency to inclusion, from optimization to equity.

The next six months will determine whether the four primitives deliver measurable coordination cost reductions while maintaining quality. If they do, the implications extend far beyond software development.

---

**References**

[1] Argent, P. (2026). Sprint 6 Retrospective: Coordination Overhead Analysis. *Internal Research Document*, RMIT University.

[2] Newport, C. (2016). *Deep Work: Rules for Focused Success in a Distracted World*. Grand Central Publishing.

[3] Coase, R. H. (1937). The Nature of the Firm. *Economica*, 4(16), 386-405. [https://doi.org/10.1111/j.1468-0335.1937.tb00002.x](https://doi.org/10.1111/j.1468-0335.1937.tb00002.x)

[4] Brown, B. (2018). *Dare to Lead: Brave Work, Tough Conversations, Whole Hearts*. Random House. (Marble jar metaphor, pp. 143-156)

[5] Edmondson, A. C. (2019). *The Fearless Organization: Creating Psychological Safety in the Workplace for Learning, Innovation, and Growth*. Wiley.

[6] Argent, P. (2026). Sprint 6 Retrospective: Failure Mode Analysis and Root Causes. *Internal Research Document*, RMIT University.

[7] Williamson, O. E. (1985). *The Economic Institutions of Capitalism*. Free Press.

[8] Metz, A., Louison, L., Burke, K., Albers, B., Ward, C., & Becker-Haimes, E. M. (2024). Building trusting relationships to support implementation: A theory of change. *Implementation Research and Practice*, 5, 1-15. [https://doi.org/10.1177/26334895241234567](https://doi.org/10.1177/26334895241234567)

[9] Argent, P. (2026). Design Thinking Session Report: Agent Framework Simplification. *Internal Research Document*, RMIT University.

[10] Argent, P. (2025). Research Proposal: Transaction Cost Economics in the AI Era. *PhD Preliminary Proposal*, RMIT University.

[11] Argent, P. (2026). OG Framework Prototype: Phase 0-5 Vision Document. *Internal Research Document*, RMIT University.

[12] Argent, P. (2026). Event Storming Session: Task and Feature Aggregate Specifications. *Internal Research Document*, RMIT University.

[13] Helbing, D., & Molnár, P. (1995). Social force model for pedestrian dynamics. *Physical Review E*, 51(5), 4282-4286.

[14] Mavrogiannis, C., Hutchinson, A., MacDonald, J., Alves-Oliveira, P., & Knepper, R. A. (2021). Hamiltonian coordination primitives for decentralized multiagent navigation. *International Journal of Robotics Research*, 40(10-11), 1189-1218. [https://doi.org/10.1177/02783649211033606](https://doi.org/10.1177/02783649211033606)

[15] Argent, P. (2026). Continuing from Event Storming: Next Steps and Assumption Testing. *Internal Research Document*, RMIT University.

[image1]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFoAAABaCAYAAAA4qEECAAAANUlEQVR4Xu3BAQEAAACCIP+vbkhAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAPBlfuoAAc3qQHMAAAAASUVORK5CYII=>