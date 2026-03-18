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

## Testing Philosophy

<!-- Guidance for agents writing tests. What should tests assert? When should a failing test be investigated vs fixed? -->

Tests should assert *expected* behavior based on the service contract and architecture docs — not merely confirm what the implementation currently does. If a test fails, it may surface a real bug in the implementation rather than a test error.

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

## Writing New Tests

1. Place test files in `{{test_dir}}` with the `{{test_extension}}` extension
2. {{additional_test_instructions}}
3. Run `{{test_command}}` to verify
