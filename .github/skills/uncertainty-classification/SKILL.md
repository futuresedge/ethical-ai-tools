# Uncertainty Classification Skill

**Loaded by:** UncertaintyOwner
**Companion to:** uncertainty-protocol.skill.md (mechanics of raising)
**Purpose:** Classify the type of uncertainty raised, route it to the
correct resolution authority, and ensure the raising agent receives
a usable resolution — not just an acknowledgement.

---

## When This Skill Applies

This skill activates whenever an agent calls `raise_uncertainty`. The
UncertaintyOwner receives the raise event and must:
1. Classify the uncertainty type
2. Identify the resolution authority
3. Route with sufficient context for fast resolution
4. Return the resolution to the raising agent explicitly

---

## The Five Uncertainty Types

### Type 1 — Spec Gap
**Definition:** The task specification does not tell the agent what to
do in the situation encountered. The agent has the capability to act,
but not the instruction to guide the action.

**Signals:**
- "The spec says X but doesn't say what to do when Y"
- "Two parts of the spec contradict each other"
- "The AC is satisfied by multiple approaches and the spec doesn't
  indicate which"
- "A condition exists that the spec author didn't anticipate"

**Resolution authority:** TaskOwner
**Resolution form:** A spec amendment or a clarification appended to
the task spec. Not a verbal resolution — the document changes.
**Typical resolution time:** Fast. TaskOwner reads the spec and the
gap signal and adds a clarification.

---

### Type 2 — Tool Gap
**Definition:** The agent needs a capability it does not hold.
The agent knows what to do but cannot do it with its current tool set.

**Signals:**
- "I need to write to a file I don't have a write tool for"
- "I need to read a document that isn't in my READS list"
- "I need to trigger a state transition I don't hold a submit tool for"

**Resolution authority:** FrameworkOwner
**Resolution form:** Either a tool is added to the agent's scope for
this task (FrameworkOwner decision) or the action is confirmed to be
out of scope (and the spec is adjusted accordingly).
**Important:** A tool gap that recurs across multiple agents is a
roster gap — the wrong agent is doing the work, or a new agent class
is needed. Flag recurring tool gaps to FrameworkOwner as a pattern.

---

### Type 3 — Environment Gap
**Definition:** The live environment does not match the environment
contract. Something the agent was told to assume is true is not true.

**Signals:**
- "The build command in the environment contract fails"
- "A service declared in the contract is unreachable"
- "A file path in the contract does not exist"
- "A version declared in the contract does not match the installed version"

**Resolution authority:** EnvironmentContractAuthor + human:director
**Resolution form:** The environment contract is updated to reflect
reality, OR the environment is corrected to match the contract.
The resolution authority decides which. The agent cannot resolve this
unilaterally — an environment gap means either the documentation
or the system is wrong, and only a human can decide which.

---

### Type 4 — Authority Gap
**Definition:** The agent needs to take an action that is outside its
defined scope — it would require overriding its NEVER list or acting
on an artefact it doesn't own.

**Signals:**
- "Completing this task would require me to modify a file in my NEVER list"
- "The logical next step belongs to a different agent class"
- "I'm being asked to do something that isn't in my job statement"

**Resolution authority:** FrameworkOwner
**Resolution form:** Either the scope boundary is confirmed (the agent
is correct to stop) or the task spec is reassigned to the correct agent.
Never resolved by relaxing the NEVER list at runtime.

---

### Type 5 — Novel Situation
**Definition:** The situation has no precedent in the pattern library,
no applicable spec guidance, and no clear resolution path. The agent
cannot make a reasonable inference.

**Signals:**
- "No pattern in the library applies to this"
- "The spec is silent on this entire category of situation"
- "This combination of conditions has never been encountered before"
- "Following the spec would produce an outcome that seems clearly wrong,
  but I have no authority to deviate"

**Resolution authority:** human:director
**Resolution form:** A direct human decision. This is the uncertainty
type that most often results in a new pattern being added to the library
after resolution.
**Important:** Do not classify as Type 5 to avoid the work of classifying
more precisely. Type 5 is a last resort. If a more specific type applies,
use it — Type 5 routes to human:director, which is the most expensive
resolution path.

---

## Classification Decision Tree

```
Start: an agent called raise_uncertainty.

Step 1: Does the agent have the capability but lack instruction?
  YES → Type 1 (Spec Gap) → route to TaskOwner

Step 2: Does the agent lack the tool to do what the spec asks?
  YES → Type 2 (Tool Gap) → route to FrameworkOwner

Step 3: Does the environment not match the environment contract?
  YES → Type 3 (Environment Gap) → route to EnvironmentContractAuthor
        + flag to human:director if contract correction needed

Step 4: Would the action violate the agent's NEVER list or scope?
  YES → Type 4 (Authority Gap) → route to FrameworkOwner

Step 5: None of the above apply and no reasonable inference exists.
  → Type 5 (Novel Situation) → route to human:director
```

---

## What to Include When Routing

Regardless of type, every routed uncertainty must include:

```
uncertainty_id:      [generated]
task_id:             [task this occurred in]
raising_agent:       [agent class + instance]
type:                [1-5 and type name]
state_at_raise:      [task working state when raised]
condition:           [exact condition encountered — specific, not vague]
what_was_tried:      [what the agent checked before raising]
resolution_needed:   [what would unblock the agent — specific ask]
relevant_refs:       [document paths the agent was reading]
```

The `resolution_needed` field is the most important. A routed
uncertainty with a vague resolution request ("I need clarification")
creates unnecessary back-and-forth. The resolution ask should be
answerable with a single decision or document change.

---

## Returning the Resolution

When the resolution authority responds, UncertaintyOwner:

1. Records the resolution in the uncertainty log
2. Closes the uncertainty instance
3. Updates the raising agent's context — not just the log.
   The agent must receive the resolution explicitly, either via:
   - An updated context card (if the resolution changes a document)
   - A direct resolution message (if the resolution is a decision)
4. Emits an `UncertaintyResolved` stream event
5. Task resumes from its prior working state

**A resolution that the raising agent cannot act on is not a resolution.**
If the resolution authority provides an answer that still leaves the
agent unable to proceed, the uncertainty is still open.

---

## What Is NOT Uncertainty

Do not route these as uncertainties — they are normal work:

- **A choice between two valid approaches** where both satisfy the
  spec. Make the decision, log it in the work log, proceed.
- **A step that is difficult** but the spec is clear. Difficulty is
  not uncertainty.
- **A detail the spec omits** that can be reasonably inferred from
  context. Infer, log the inference, proceed. Only raise if the
  inference would be unreasonable or if being wrong would be costly.
- **A tool call that returns an error** on first attempt. Retry once
  with corrected inputs. Raise uncertainty only if the error persists
  after a reasonable retry.

---

## Aggregate Pattern Recognition

After each resolved uncertainty, assess:
- Has this same type of uncertainty been raised before on this project?
- Has this uncertainty type been raised by multiple different agents?

If yes to either: flag to FrameworkOwner as a potential structural gap.
Recurring uncertainties of the same type are framework signals, not
task anomalies. They indicate:
- Type 1 recurring → systematic spec quality issue
- Type 2 recurring → roster or tool assignment gap
- Type 3 recurring → environment contract is out of date
- Type 4 recurring → agent scope is mis-drawn
- Type 5 recurring → a pattern is missing from the library