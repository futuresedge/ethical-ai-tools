# What Experiment 02 Should Prove

The infrastructure is confirmed. The next experiment tests whether **real agents doing real work behave correctly within that infrastructure** — and whether the handoff between two agents (Task Performer → QA) produces a trustworthy chain of custody.

The three things Exp-02 must answer:

**1. Does a real Task Performer agent stay within its structural bounds during real work?**
Not a script. A Copilot Chat agent, with its context card, writing real code, using real GitHub MCP tools to push to a real branch, and submitting a real proof with literal command output. The structural bounds were confirmed by scripts; now they need to be confirmed against an agent making autonomous decisions.

**2. Does the `request_` verb work as the cross-agent handoff mechanism?**
The Task Performer requests QA review via `request_review`. This is the first use of `request_` in the entire framework — the verb exists in the grammar but has never fired. It is the boundary between Zone 3 (execution) and Zone 4 (verification). Getting this right is architecturally load-bearing.

**3. Can a QA agent receive a proof, review it, and advance state — closing the first complete loop?**
This requires: a QA Execution agent spec (generated, scoped to the same task), `read_proof` and `read_task_spec` tools (read-only), `submit_qa_review` compound tool (write + state transition + stream event), and state `APPROVED` or `RETURNED` as outcomes. The policy question — does state advance automatically or does Pete trigger it — can be manual for Exp-02 and automated in Exp-03.

***
