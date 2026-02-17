# stateManagement

## Overview

Provides one explicit dependency object for page-level data access. The module
is the app composition root for courses, catalogs, requirements, plan state,
and generic metadata reads/writes.

## Exports

- `StateManagement`: contract used by pages, router wiring, tests, and stories.
- `createStateManagement()`: production implementation that binds the contract
  to IndexedDB and requirements sync modules.

## Data Flow

- `createStateManagement()` maps all read/write operations to
  `$lib/indexeddb` and `$lib/requirementsSync`.
- Plan persistence is centralized via `plan.getPlanState()` and
  `plan.setPlanState(...)`, both bound to the `planPageState` meta key.
- Requirements selection and sync are exposed through
  `requirements.getActiveSelection()`, `setActiveSelection(...)`, and `sync(...)`.

## Dependencies

- `src/lib/indexeddb.ts`
- `src/lib/requirementsSync.ts`

## Notes

- Pages are expected to receive `StateManagement` explicitly.
- The module intentionally avoids hidden global fallback logic inside pages.

## Tests

- `proxies course, catalog, and requirements reads`: verifies the factory
  forwards course/catalog/requirements reads to the underlying modules.
- `persists requirements selection and plan state`: verifies selection sync,
  plan meta writes (`planPageState`), and direct meta read/write forwarding.
