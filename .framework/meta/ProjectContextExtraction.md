<!-- @format -->

# Project context extraction prompt for AI agent team configuration

```prompt
If we assume the user has been developing their ideas for their software application with an LLM chat tool like I do, what prompt could they use to get the information needed for these context requirements in the correct format and structure?
```

Based on the PRD discovery patterns and your human-centered approach, here's a **conversation-style prompt** that extracts project context through natural dialogue: [ppl-ai-file-upload.s3.amazonaws](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/42141261/2fa3c5cd-34fc-49da-a91c-de439238d84e/SKILL-PRD.md)

## Context extraction prompt

```markdown
# AI Agent Team Configuration Assistant

I've been developing a software application idea through our conversations, and I want to set up an AI agent team to help build it. You'll help me extract the essential project context needed to configure the team properly.

## Your role

Act as a **project context specialist**. Your job is to:

1. Ask me clarifying questions to understand my project deeply
2. Extract structured information from my responses
3. Fill in sensible defaults for anything I'm uncertain about
4. Produce a complete YAML configuration file at the end

## Interview structure

Work through these topics **one at a time**. Don't overwhelm me with all questions at once. After each topic, show me what you've captured and ask if it's accurate before moving on.

### Topic 1: Project identity and vision (5-7 questions)

Start here. Ask about:

- What is this project called?
- What type of software is it? (web app, mobile app, API, platform, etc.)
- In one sentence, what problem does it solve and for whom?
- What does success look like? (3-5 measurable outcomes)
- What are the core values or principles guiding this project?

**After I answer**: Show me the YAML for this section and ask: "Does this capture your project's essence accurately?"

### Topic 2: Technical foundation (3-5 questions)

Ask about:

- What programming language(s) do you plan to use? (or should I recommend based on your project type?)
- What frameworks or libraries are you considering? (or need recommendations?)
- Where will data be stored? (database type, or need suggestions?)
- Do you have any architectural preferences? (monolith, microservices, event-driven, etc.)
- Are there any technical constraints I should know about? (performance, security, compliance)

**After I answer**: Show me the tech_stack YAML and ask: "Does this technical foundation align with your vision?"

### Topic 3: Domain model (core concepts) (5-8 questions)

This is crucial for the agent team. Ask about:

- What are the main "things" users will interact with? (entities like User, Task, Project, Order, etc.)
- For each entity, what states can it be in? (draft → published, pending → approved, etc.)
- How do these entities relate to each other? (users create tasks, tasks belong to projects, etc.)
- Are there any complex workflows or lifecycles I should understand?
- What business rules or constraints exist? (only admins can approve, max 5 items per order, etc.)

**After I answer**: Show me the core_entities and relationships YAML and ask: "Have I understood your domain model correctly?"

### Topic 4: Quality standards and workflow (4-6 questions)

Ask about:

- What quality standards matter to you? (test coverage, accessibility, performance)
- Do you want a test-first development approach? (write tests before code)
- How much review/oversight do you want? (automated only, strategic reviews for complex features, etc.)
- Are there any non-negotiable quality gates? (security scans, accessibility compliance, etc.)
- What trade-offs are you willing to make? (speed vs. quality, simplicity vs. scalability)

**After I answer**: Show me the quality_gates YAML and ask: "Do these standards reflect your priorities?"

### Topic 5: Cultural values and principles (3-5 questions)

This shapes how agents make decisions. Ask about:

- How should the system treat users? (supportive, strict, educational, etc.)
- What should happen when users make mistakes? (reversible actions, learning opportunities, penalties)
- What tone should error messages and feedback have?
- Are there any values you want embedded in the system's behavior? (transparency, privacy, accessibility, fairness)

**After I answer**: Show me the cultural_principles YAML and ask: "Do these values align with how you want your product to feel?"

### Topic 6: Team composition (optional - offer defaults)

Say: "I can set up a standard agent team for you, or we can customize it. The standard team includes:

- **Product Owner**: Breaks down features into implementable stories
- **Developer**: Writes code and tests (full vertical slices)
- **QA Engineer**: Validates quality and catches issues
- **Advisor**: Reviews complex features before implementation (prevents costly mistakes)
- **Meta Coach**: Learns from each story and improves the team over time
- **Doc Whisperer**: Keeps documentation organized and accessible

Would you like this standard team, or should we customize roles for your project?"

**If they want customization**: Ask what they'd change or add.

### Topic 7: Model preferences and constraints (2-3 questions)

Ask about:

- Do you have access to premium models like Claude Sonnet 4.5 or GPT-4? (or need to use free models?)
- Do you have any budget constraints for API usage?
- Are there any models you'd prefer or want to avoid?

**After I answer**: Show me the model_allocation section.

### Topic 8: Existing work (if applicable)

Ask:

- Do you already have code, designs, or documentation for this project?
- Is there a repository I should reference?
- Are there any existing patterns or approaches you want the team to follow?
- Have you documented any "lessons learned" or anti-patterns to avoid?

**After I answer**: Show me the repository or known_patterns section.

## Final deliverable

After we've covered all topics, produce:

1. **Complete YAML configuration file** with all sections populated
2. **Assumption log** listing anything you filled in with defaults (so I can review/change)
3. **Next steps**: Brief guide on how to use this configuration with the agent team

## Important guidelines for your questions

- **Ask ONE topic at a time** (don't list all questions upfront)
- **Use my actual words** when capturing responses (don't paraphrase unnecessarily)
- **Offer examples** when I seem uncertain ("For example, most e-commerce apps have entities like Product, Order, Customer...")
- **Suggest defaults** when I'm not sure ("Most web apps start with TypeScript + React, but we could use Python + FastAPI if you prefer...")
- **Show what you've captured** after each topic (so I can validate)
- **Don't assume context** - if I mention something unclear, ask follow-up questions
- **Keep it conversational** - this should feel like a planning session with a technical co-founder

## Special case: If I've already shared a lot of context

If I've already discussed this project extensively in our conversation history:

1. Review our previous messages first
2. Extract what you already know
3. Show me a **draft configuration** based on our history
4. Ask: "I've drafted this based on our conversations - which sections need clarification or changes?"
5. Then focus ONLY on gaps or ambiguities

Ready? Let's start with **Topic 1: Project identity and vision**.
```

## Why this prompt works

### 1. Builds on proven discovery patterns

The PRD skill shows that **"you MUST interrogate the user to fill knowledge gaps"** is essential. This prompt structures that interrogation systematically while staying conversational. [ppl-ai-file-upload.s3.amazonaws](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/42141261/8cafa1fc-b581-41b3-a4ed-8ac2ea29fe21/prd-creation.instructions.md)

### 2. Respects human-centered approach

Your space instructions emphasize empathizing with stakeholders and understanding challenges deeply [Space context]. The one-topic-at-a-time approach prevents overwhelm and enables reflection.

### 3. Leverages conversation history

Most users will have discussed their project already. The "special case" section avoids redundant questions by drafting from context, which your learnings show agents excel at. [ppl-ai-file-upload.s3.amazonaws](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/42141261/984e8aec-4716-4c34-bf32-d6e66594bd92/sprint-3-learnings-and-guidelines.md)

### 4. Provides validation checkpoints

After each topic, showing the captured YAML lets users validate understanding before proceeding - mirrors your Sprint 3 pattern of iterative review before committing. [ppl-ai-file-upload.s3.amazonaws](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/42141261/c36a4580-d648-4354-8ecf-dfd3059d2670/agent-prompt-changelog.md)

### 5. Offers intelligent defaults

When users are uncertain, suggesting common patterns (like the PRD skill does with tech stacks) keeps momentum while staying flexible. [ppl-ai-file-upload.s3.amazonaws](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/42141261/2fa3c5cd-34fc-49da-a91c-de439238d84e/SKILL-PRD.md)

### 6. Produces machine-readable output

The final YAML can directly initialize agent teams using the structure we designed earlier, enabling automation while maintaining human oversight.

## Alternative: Rapid extraction prompt (for experienced users)

If someone prefers to dump information quickly rather than dialogue:

```markdown
# Quick Project Context Extraction

I've been developing a software project and need to configure an AI agent team. I'll describe my project below, and you extract the structured context needed.

## My project description

[User pastes: vision, tech choices, domain concepts, quality expectations, cultural values, any constraints]

## Your task

1. **Extract all structured information** you can find and format as YAML
2. **Flag gaps** with [NEEDS_CLARIFICATION: specific question]
3. **Suggest defaults** for common decisions with [SUGGESTED: reasoning]
4. **Highlight assumptions** you made with [ASSUMED: what you inferred]

Produce the complete YAML configuration with inline annotations for review.

Then ask me: "I've marked X areas needing clarification - should we discuss those now, or are the suggested defaults acceptable?"
```

This rapid version works for users who've thought deeply about their project and prefer efficiency over dialogue, while still maintaining validation points.

Both approaches ensure **the human remains in control** while extracting machine-actionable context - aligned with your human-centered philosophy and the proven patterns from your Sprint 3 learnings. [ppl-ai-file-upload.s3.amazonaws](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/42141261/c373cb06-fc31-4d11-9e67-f5ea2b1994c0/AGENT-HUB.md)
