# Architecture

## Overview

<!-- Describe the high-level architecture pattern (pipeline, hexagonal, MVC, event-driven, etc.) and why it was chosen. -->

<!-- For projects with meaningful layering, describe each layer: -->
<!-- - Layer 1: Core / Domain logic -->
<!-- - Layer 2: Adapters (HTTP, database, external systems) -->
<!-- - Layer 3: Wiring / Bootstrapping (dependency injection, factories) -->

## Core Design Decisions

<!-- Document key architectural decisions. For each, explain WHAT was decided and WHY. -->

### 1. {{decision_title}}

{{decision_description}}

## Design Patterns

<!-- Document the key patterns used in the codebase. Include TypeScript/code examples showing the actual interfaces and implementations. This section is critical for agents to understand how to write new code that fits the existing patterns. -->

<!-- Example patterns to document (include only those that apply): -->
<!-- - Repository Pattern (port interfaces + adapter implementations) -->
<!-- - Service Pattern (business logic encapsulation) -->
<!-- - Controller Pattern (thin HTTP adapters) -->
<!-- - Factory/Wiring Pattern (dependency injection) -->
<!-- - Middleware Pattern -->
<!-- - Event/Message Pattern -->

### {{pattern_name}}

<!-- Show the interface (port): -->

```typescript
{{pattern_interface}}
```

<!-- Show a typical implementation (adapter): -->

```typescript
{{pattern_implementation}}
```

<!-- Document conventions for this pattern: -->
<!-- - Naming: I{Entity}Repository, {Entity}RepositoryAdapter, {Entity}Service, etc. -->
<!-- - What belongs in this layer vs others -->
<!-- - Common methods and their contracts -->

## Data Flow

<!-- Describe what goes in, how it is processed, and what comes out. -->

```
Input:
  └── {{input_description}}

Processing:
  1. {{step_1}}
  2. {{step_2}}
  3. {{step_3}}

Output:
  └── {{output_description}}
```

## Error Handling

<!-- Describe the error handling strategy: what errors are caught vs propagated, how failures are reported, which error libraries are used. -->

- {{error_handling_point}}

## File Structure

<!-- Map the architecture layers to actual file paths. This helps agents navigate the codebase. -->

```text
{{file_structure_mapping}}
```
