# Testing

## Setup

- **Runner**: {{test_framework}}
- **Test location**: `{{test_location_pattern}}`
- **Config**: `{{test_config_path}}`
- **Prerequisite**: {{test_prerequisite}}

## Running Tests

```bash
{{test_command}}                              # run all tests
{{test_single_command}}                       # run a single test file or workspace
{{test_coverage_command}}                     # run with coverage
```

<!-- For monorepos, include workspace-specific commands: -->
<!-- npm run test --workspace=packages/foo -->

## Test Layers

<!-- Describe distinct testing approaches used in the project. Not every project has multiple layers — include only what applies. -->

### Unit Tests

<!-- Location, what they test, what is mocked. -->

{{unit_test_description}}

### Integration Tests

<!-- Location, what infrastructure they need, what they verify end-to-end. Remove if not applicable. -->

{{integration_test_description}}

## Test Helpers & Fixtures

<!-- Describe reusable test utilities, fake implementations, factories, fixture data. -->

- {{test_helper_description}}

## Test Application Pattern

<!-- Remove if the project doesn't have a test application wrapper. Describe how tests bootstrap the application: test factories, test modules, test database setup. This is common in hexagonal/DI-based projects where tests wire the same modules as production but with test-specific overrides. -->

<!-- Example: -->
<!-- - `test/app/module.ts` — `TestApplication extends Application` with test accessors -->
<!-- - `test/app/factory.ts` — `createTestApplication()` wires test modules -->
<!-- - `test/app/database.ts` — `createTestDatabaseModule()` for per-test DB -->

## Testing Philosophy

<!-- Guidance for agents writing tests. What should tests assert? When should a failing test be investigated vs fixed? -->

Tests should assert *expected* behavior based on the service contract and architecture docs — not merely confirm what the implementation currently does. If a test fails, it may surface a real bug in the implementation rather than a test error.

### Fakes Over Mocks

<!-- Remove if not applicable. Both projects using hexagonal architecture strongly prefer fake implementations over vi.fn()/vi.mock(). This section guides agents to use the right testing approach. -->

**Prefer fake implementations over `vi.fn()` / `vi.mock()`.** When using hexagonal architecture with dependency inversion, every dependency is injectable via a port interface — write a class implementing the port with in-memory behavior and call-recording helpers.

```typescript
// Good — fake implements the port interface
const repository = new FakeEntityRepository();
const service = new EntityService({ repository });

// Bad — vi.fn() stubs bypass the interface contract
const repository = { findMany: vi.fn(), save: vi.fn() };
```

## Code Coverage

<!-- How to generate and query coverage reports. -->

```bash
{{coverage_command}}
```

<!-- Coverage targets per layer, if defined: -->

| Layer | Target |
|-------|--------|
| {{coverage_layer}} | {{coverage_target}} |

## Infrastructure

<!-- Docker services, databases, or external systems required for integration tests. Remove if not applicable. -->

| Service    | Port      |
|------------|-----------|
| {{service_name}} | {{service_port}} |

## CI Pipeline

<!-- Remove if there's no CI. Describe what the CI pipeline does: build, test matrix (multiple databases?), lint. Mention any parallel strategies or special CI services. -->

<!-- Example: -->
<!-- GitHub Actions runs: Install → Build → Test (parallel matrix: MySQL, Postgres, SQLite) → Lint -->

{{ci_pipeline_description}}

## Test Environment Variables

<!-- Remove if no special env vars are needed for tests. List variables that control test behavior. -->

| Variable                  | Purpose                        |
|---------------------------|--------------------------------|
| `{{test_env_var}}`        | {{test_env_var_purpose}}       |

## Writing New Tests

1. Place test files in `{{test_dir}}` with the `{{test_extension}}` extension
2. {{additional_test_instructions}}
3. Run `{{test_command}}` to verify
