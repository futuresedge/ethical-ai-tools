<!-- @format -->

# Project context requirements for bootstrapping an agent team

Based on your productive week of learnings and the comprehensive patterns I've reviewed, here's what **project context users should provide** to bootstrap an agent team for any software project:

## Project context template

### Essential context (required for team initialization)

#### 1. Project identity and vision

```yaml
project_name: "Your Project Name"
project_type: ["web_app" | "mobile_app" | "api" | "cli_tool" | "library" | "platform"]
vision_statement: "One sentence describing what this project achieves and for whom"
success_criteria:
  - "Measurable outcome 1"
  - "Measurable outcome 2"
  - "Measurable outcome 3"
```

**Why**: Agents need strategic context to make architectural decisions aligned with long-term goals. [ppl-ai-file-upload.s3.amazonaws](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/42141261/984e8aec-4716-4c34-bf32-d6e66594bd92/sprint-3-learnings-and-guidelines.md)

#### 2. Technical foundation

```yaml
tech_stack:
  primary_language: {name: "TypeScript", version: "5.3"}
  runtime: {name: "Node.js", version: "20.11"}
  frameworks:
    - {name: "Astro", version: "4.x", purpose: "SSR + islands"}
    - {name: "React", version: "18.x", purpose: "UI components"}
  database: {type: "PostgreSQL", version: "16", provider: "Neon"}
  deployment: {platform: "Cloudflare Pages", region: "auto"}

architecture_style: "Vertical slice architecture" | "Layered" | "Microservices" | "Event-driven"
architecture_constraints:
  - "Controllers MUST NOT contain business logic"
  - "Database access ONLY through repository pattern"
  - "Services MUST be stateless"
```

**Why**: Your learning #10 shows vertical slices were effective, but agents need explicit context about whether to decompose further based on project architecture. [ppl-ai-file-upload.s3.amazonaws](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/42141261/c36a4580-d648-4354-8ecf-dfd3059d2670/agent-prompt-changelog.md)

#### 3. Domain model (ontology/core concepts)

```yaml
core_entities:
  - name: "User"
    description: "Person using the platform"
    lifecycle_states: ["pending", "active", "suspended", "archived"]

  - name: "Task"
    description: "Unit of work to be completed"
    lifecycle_states:
      ["draft", "submitted", "claimed", "in_progress", "verified"]

relationships:
  - { from: "User", to: "Task", type: "claims", cardinality: "many-to-many" }
  - { from: "User", to: "User", type: "reviews", cardinality: "many-to-many" }
```

**Why**: Your 6-dimension ontology framework (#1 learning) needs domain-specific entities to map effectively. [ppl-ai-file-upload.s3.amazonaws](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/collection_f8ffc8cb-ddc4-4340-8bce-21d7722606ba/24ddec05-e67f-42ba-83f2-e3437e870098/CoreConcepts-AgenticDevelopmentFramework.md)

#### 4. Quality standards

```yaml
quality_gates:
  test_coverage_min: 85
  test_execution_max: "2s" # Your Sprint 3 baseline
  linting: "eslint --max-warnings 0"
  type_checking: "strict mode required"
  accessibility: "WCAG AA compliance"

verification_workflow:
  test_first: true # Your learning #2: 100% pass rate
  strategic_review_thresholds:
    simple_stories: "optional" # ≤4 points
    moderate_stories: "recommended" # 5-7 points, 2-3x ROI
    complex_stories: "mandatory" # ≥8 points, 3-4x ROI
```

**Why**: Your learning #2 proved test-first workflow achieves 100% pass rate. New projects need these standards upfront. [ppl-ai-file-upload.s3.amazonaws](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/42141261/984e8aec-4716-4c34-bf32-d6e66594bd92/sprint-3-learnings-and-guidelines.md)

#### 5. Cultural values (sanctuary culture equivalent)

```yaml
cultural_principles:
  - name: "Human-centered design"
    description: "Empathize with users before ideating solutions"
    implementation:
      - "Conduct user interviews before writing requirements"
      - "Prototype with real user feedback loops"

  - name: "Reversibility"
    description: "Users can undo actions without penalty"
    implementation:
      - "Status transitions include recovery paths"
      - "Deletions are soft deletes with restore capability"

  - name: "Teaching moments"
    description: "Error messages explain WHY, not just WHAT"
    implementation:
      - "Validation errors include next steps"
      - "System messages embed cultural values"
```

**Why**: Your Sprint 3 "sanctuary culture" patterns (#4 from learnings) show values can be architectural. New projects should define theirs explicitly. [ppl-ai-file-upload.s3.amazonaws](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/42141261/c560ec57-e410-4b74-b7e3-cf109555bb59/AGENT-SYSTEM-BLUEPRINT.md)

### Optional context (enhances team performance)

#### 6. Existing codebase (if applicable)

```yaml
repository:
  url: "https://github.com/org/repo"
  branch: "main"
  directory_structure:
    - path: "src/"
      description: "Application source code"
    - path: "tests/"
      description: "Test suites (integration + unit)"
    - path: "docs/"
      description: "Architecture decision records, API specs"

  key_files:
    - path: "src/db/schema.sql"
      description: "Database schema definition"
    - path: "docs/architecture.md"
      description: "System architecture overview"
```

**Why**: Learning #7 shows documentation quickly becomes context overhead. Agents need pointers to existing structure. [ppl-ai-file-upload.s3.amazonaws](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/42141261/c373cb06-fc31-4d11-9e67-f5ea2b1994c0/AGENT-HUB.md)

#### 7. Known patterns and anti-patterns

```yaml
proven_patterns:
  - name: "CTE atomic transactions"
    description: "State change + event logging in single query"
    example_file: "patterns/cte-atomic.md"
    proven_in: ["story-01", "story-03", "story-04"]

anti_patterns:
  - name: "Hardcoded credentials"
    detection: 'grep -r ''password.*=.*[''"]'' src/'
    severity: "CRITICAL"
    auto_fail: true
```

**Why**: Learning #9 shows advisor/meta agents recognize "gold standard" output. Seeding with known patterns accelerates learning. [ppl-ai-file-upload.s3.amazonaws](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/42141261/b70ed2e0-6ea6-428b-86c8-7af55261a60f/agentic-eval-skill.md)

#### 8. Team composition preferences

```yaml
agent_roles:
  - role: "product_owner"
    specialization: "story_decomposition"
    tool_access: ["read_files", "search_docs"]

  - role: "developer"
    specialization: "vertical_slice_implementation"
    tool_access: ["read_files", "write_files", "execute_tests", "git"]
    task_size_preference: "full_story" # Your learning #10

  - role: "qa_engineer"
    specialization: "verification"
    tool_access: ["read_files", "execute_tests", "browser_automation"]

  - role: "advisor"
    specialization: "strategic_review"
    tool_access: ["read_files", "search_docs"]
    triggers: ["moderate_stories", "complex_stories"] # ROI-based

  - role: "meta_coach"
    specialization: "retrospectives"
    tool_access: ["read_files", "write_docs", "analyze_retros"]
    frequency: "after_each_story" # Your learning #3

  - role: "doc_whisperer"
    specialization: "documentation_organization"
    tool_access: ["read_files", "write_docs", "create_summaries"]
    triggers: ["context_overhead_detected"] # Your learning #7
```

**Why**: Learning #3 shows meta agent reviewing retros increases performance. Learning #4 shows extra agents are cost-effective for quality. New projects should configure this explicitly. [ppl-ai-file-upload.s3.amazonaws](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/42141261/c373cb06-fc31-4d11-9e67-f5ea2b1994c0/AGENT-HUB.md)

#### 9. Documentation preferences

```yaml
documentation_strategy:
  structure: "3_tier_hierarchy" # High/mid/low velocity from AGENT-SYSTEM-BLUEPRINT
  locations:
    agent_specs: ".github/agents/"
    quickrefs: "docs/quickrefs/"
    patterns: "docs/patterns/"
    retros: "docs/retros/"

  update_triggers:
    - "pattern_used_3x" # Move to /patterns/
    - "retro_identifies_friction" # Update quickrefs
    - "gold_standard_emerged" # Document in patterns
```

**Why**: Learning #7 shows documentation becomes context overhead without management. AGENT-SYSTEM-BLUEPRINT provides proven structure. [ppl-ai-file-upload.s3.amazonaws](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/42141261/c560ec57-e410-4b74-b7e3-cf109555bb59/AGENT-SYSTEM-BLUEPRINT.md)

#### 10. Model preferences and budget

```yaml
model_allocation:
  primary_model: "claude-sonnet-4.5" # Your learning #8
  fallback_models: ["gemini-2.0-flash-thinking"] # Pending testing

  budget_per_role:
    developer: { requests_per_day: 50, max_tokens_per_request: 8000 }
    advisor: { requests_per_day: 20, max_tokens_per_request: 4000 }
    meta_coach: { requests_per_day: 10, max_tokens_per_request: 4000 }
    doc_whisperer: { requests_per_day: 10, max_tokens_per_request: 4000 }
```

**Why**: Learning #8 shows free models weren't effective, Claude Sonnet 4.5 was "very good". Budget management prevents mid-project disruption. [ppl-ai-file-upload.s3.amazonaws](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/42141261/984e8aec-4716-4c34-bf32-d6e66594bd92/sprint-3-learnings-and-guidelines.md)

### How the context gets used

#### Initialization agent workflow

When user provides this context, a **bootstrap agent** should:

1. **Generate agent-hub.md** using AGENT-SYSTEM-BLUEPRINT structure [ppl-ai-file-upload.s3.amazonaws](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/42141261/c560ec57-e410-4b74-b7e3-cf109555bb59/AGENT-SYSTEM-BLUEPRINT.md)
   - Create role-specific quickrefs based on tech_stack
   - Initialize patterns/ directory with proven_patterns
   - Set up retros/ directory structure

2. **Create agent specifications** using context engineering patterns [ppl-ai-file-upload.s3.amazonaws](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/42141261/7b590e80-3c61-49cd-ac07-4e3e0514d185/ContextEngineeringSkills-README.md)
   - Inject tech_stack into developer agent tools
   - Configure advisor triggers based on strategic_review_thresholds
   - Set up meta_coach with retrospective templates
   - Configure doc_whisperer with documentation_strategy

3. **Initialize gold standard patterns** from provided examples
   - Convert proven_patterns into /patterns/\*.md files
   - Create anti-pattern detection rules
   - Set up pattern library structure [ppl-ai-file-upload.s3.amazonaws](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/collection_f8ffc8cb-ddc4-4340-8bce-21d7722606ba/24ddec05-e67f-42ba-83f2-e3437e870098/CoreConcepts-AgenticDevelopmentFramework.md)

4. **Generate project manifest** from vision + domain model [ppl-ai-file-upload.s3.amazonaws](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/collection_f8ffc8cb-ddc4-4340-8bce-21d7722606ba/57b1e1af-74e6-440f-a995-8df3fd792fd2/ConceptPaper-AgenticDevelopmentFramework.md)

   ```yaml
   project_manifest:
     vision: { from project_identity }
     ontology: { from core_entities + relationships }
     tech_stack: { from technical_foundation }
     quality_gates: { from quality_standards }
     cultural_values: { from cultural_principles }
     team_composition: { from agent_roles }
   ```

5. **Set up verification workflows** based on quality_gates
   - Configure test-first enforcement if specified
   - Set up strategic review decision matrix
   - Initialize accessibility validation checklists [ppl-ai-file-upload.s3.amazonaws](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/42141261/c36a4580-d648-4354-8ecf-dfd3059d2670/agent-prompt-changelog.md)

6. **Create documentation templates** aligned with documentation_strategy
   - Story template with ontology mapping sections
   - QA report template with migration readiness checks
   - Retrospective template with structured sections
   - Strategic review template with grading rubric [ppl-ai-file-upload.s3.amazonaws](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/42141261/c373cb06-fc31-4d11-9e67-f5ea2b1994c0/AGENT-HUB.md)

### Minimal viable context (for rapid start)

If user can't provide all details upfront:

```yaml
# Absolutely required (blocks agent initialization without these)
project_name: "Example App"
primary_language: "TypeScript"
project_type: "web_app"
vision_statement: "Help users achieve X outcome"

# Everything else gets sensible defaults
# Agents will ask clarifying questions as they encounter ambiguity
```

The bootstrap agent should:

- Use **template-driven defaults** for missing sections
- Track **assumption log** for later validation
- Create **TODO sections** in agent-hub.md highlighting missing context
- Enable **incremental refinement** as project evolves

### Example: Adapting to Future's Edge platform

If you were to use this for your actual Future's Edge platform:

```yaml
project_name: "Future's Edge - Trust Builder"
project_type: "platform"
vision_statement: "Enable youth to build trust and progress through collaborative task completion in a sanctuary environment"

tech_stack:
  primary_language: { name: "TypeScript", version: "5.3" }
  runtime: { name: "Node.js", version: "20.11" }
  frameworks:
    - { name: "Astro", version: "4.x", purpose: "SSR framework" }
    - { name: "React", version: "18.x", purpose: "Islands architecture" }
  database: { type: "PostgreSQL", version: "16", provider: "Neon" }

ontology:
  dimensions:
    ["Groups", "People", "Things", "Connections", "Events", "Knowledge"]
  core_entities:
    - {
        name: "Member",
        dimension: "People",
        states: ["explorer", "contributor", "steward", "guardian"],
      }
    - {
        name: "Mission",
        dimension: "Groups",
        states: ["draft", "active", "completed", "archived"],
      }
    - {
        name: "Claim",
        dimension: "Things",
        states: ["submitted", "claimed", "verified", "released"],
      }

cultural_principles:
  - name: "Sanctuary culture"
    patterns:
      [
        "reversibility",
        "non_punitive",
        "teaching_moments",
        "supportive_language",
        "generous_thresholds",
      ]

quality_gates:
  test_coverage_min: 85
  test_first: true
  strategic_review_thresholds:
    simple: "optional"
    moderate: "recommended"
    complex: "mandatory"
  migration_readiness_target: 95 # Blockchain migration goal

agent_roles:
  - {
      role: "developer",
      task_size: "vertical_slice",
      model: "claude-sonnet-4.5",
    }
  - {
      role: "advisor",
      specialization: "sanctuary_validation",
      model: "claude-sonnet-4.5",
    }
  - {
      role: "meta_coach",
      frequency: "after_each_story",
      model: "claude-sonnet-4.5",
    }
  - {
      role: "doc_whisperer",
      trigger: "context_overhead",
      model: "claude-sonnet-4.5",
    }
```

This context would generate an agent team tailored to your proven patterns while remaining adaptable to new projects. [ppl-ai-file-upload.s3.amazonaws](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/42141261/984e8aec-4716-4c34-bf32-d6e66594bd92/sprint-3-learnings-and-guidelines.md)
