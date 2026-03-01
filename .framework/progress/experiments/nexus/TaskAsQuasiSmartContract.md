# Task as quasi-smart contract: 

Why the proof template is simpler, not more complex

This is worth being precise about because there are actually two different things that have both been called "quasi-smart contract" in the journey, and they have very different complexity profiles. 

***

## The Two Things That Got the Same Name

**The OG quasi-smart contract** — from the original framework document — was an economic coordination mechanism: tasks posted to a marketplace, agents staking tokens to claim them, bounties released on verified completion, a 24-hour challenge window for dispute, reputation tiers. This is the version that was explicitly identified as accidental complexity and deferred. It assumes an autonomous marketplace, adversarial verifiers, and economic incentives — none of which exist yet, and none of which are needed for coordination between a small number of honest agents working for Pete. 

**The proof template / Evidence Gate** — which appeared in today's design as `write_proof_template` and `submit_proof` — is something different. It has the *structure* of a contract (pre-defined completion conditions, literal evidence requirement, mechanical verification) but none of the *economics*. It comes from a completely different lineage: TDD, aviation checklists, pharmaceutical batch records, forensic chain of custody. The completion conditions are defined before work starts; the agent fills the template with real command output; the tool validates against those conditions before accepting the submission. 

These two things share a conceptual ancestor but are not the same design. The confusion is worth naming clearly before answering the question.

***

## Why the Proof Template Is Simpler Than Traditional Gates

The instinct to keep things simple is right. But the counterintuitive finding is that **the proof template is actually the simpler mechanism** — not more complex — compared to traditional workflow gates for this experiment.

A traditional gate looks like this:

```
Agent finishes work
  → Pete (or QA agent) reviews output
  → Pete decides: acceptable or not
  → If acceptable, manually advance state
```

This reintroduces three problems the framework was designed to eliminate: 
- Pete is a bottleneck at every step — the pipeline stalls whenever he's unavailable
- The review is subjective — "acceptable" depends on who's reviewing and what they're looking for
- The definition of done is implicit — QA and the Task Performer may have different mental models of what completion means, discovered only after the fact (this was the Sprint 6 failure mode precisely)

The proof template inverts this:

```
Agent writes proof template FIRST (what done looks like, before any implementation)
  → Agent implements to satisfy those pre-defined conditions
  → Agent fills template with literal command output
  → submit_proof validates against template conditions automatically
  → State advances on pass, returns to agent on fail
```

The proof template is simpler to run because it removes the subjective review step. The definition of done is explicit, agreed-upon before work starts, and validated mechanically. Pete only gets involved at gates that genuinely require human judgement — not at every completion event. 

***

## What to Include Now vs. What to Defer

The experiment design already has this right. The clean separation is:

| Element | Include now? | Rationale |
|---|---|---|
| Proof template (define-before-start) | ✅ Yes | Essential primitive; simplifies QA handoff |
| Literal command output as evidence | ✅ Yes | Directly fixes the Sprint 6 false-success failure mode |
| `submit_proof` tool with mechanical validation | ✅ Yes | Mandatory side effects belong inside the tool |
| State advances on proof pass | ✅ Yes | This is the Policy Engine's job, not Pete's |
| Token staking by agents | ❌ Defer | No marketplace exists; adds complexity with no benefit |
| Bounty formula and release | ❌ Defer | Same — accidental complexity until Phase 2 |
| Challenge window and dispute resolution | ❌ Defer | No adversarial verifiers at current scale |
| Reputation tiers and trust scores | ❌ Defer | No history exists yet to score against |

The experiment uses the verification *mechanism* of the quasi-smart contract — pre-defined conditions, evidence requirements, mechanical validation — without the economic *incentive layer*. The mechanism is what makes the framework trustworthy. The incentive layer is what makes a future autonomous marketplace self-organising. Those are separable concerns, and only one of them is needed right now. 

***

## The One Genuine Complexity to Watch

The proof template introduces one real design question the experiment will need to answer: **who writes the template, and how do you prevent the template itself from being wrong?** 

If the Task Performer writes its own proof template (the current design), it defines its own completion conditions — which could be too easy, too narrow, or miss the acceptance criteria entirely. The Evidence Gate then validates that the agent met the bar it set for itself, not the bar the task requires.

The cleaner answer is that the proof template is derived from the task's acceptance criteria — written by the Task Owner as part of the task spec, not by the Task Performer during execution. The Task Performer then fills it in with literal output. This separates "what done looks like" (defined upstream, during task preparation) from "proof that we got there" (captured during execution).

This is a design detail the experiment will stress-test naturally: if the Task Performer writes the template and QA consistently rejects it for missing the AC, the signal is that template generation belongs upstream. If templates written by the performer are consistently good, the current approach is validated. Either outcome is useful data. 