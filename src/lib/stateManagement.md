# stateManagement

## Overview

Provides a global `state` object with getter/setter APIs per data domain.
The active backend is a swappable provider (for example local IndexedDB or
cloud), and provider replacement can trigger app rerender.

## Exports

- `state`: global state object with domain APIs:
    - `state.courses.get/set/query/page/count/faculties/getLastSync`
    - `state.catalogs.get/set`
    - `state.requirements.get/set/sync`
    - `state.userDegree.get/set`
    - `state.userPlan.get/set`
    - `state.provider.get/set`
- `createLocalStateProvider()`: local provider bound to IndexedDB and
  requirements sync.
- `setStateProviderChangeHandler(handler)`: internal callback hook used by the
  router to rerender on provider swap.

## Data Flow

- `state.provider` points to the current provider implementation.
- Each `state.<domain>.<method>(...)` call delegates to the active provider.
- `state.provider.set(nextProvider)` swaps backend behavior at runtime.
- `setStateProviderChangeHandler(...)` is invoked after provider replacement so
  the router can rerender the active route.

## Dependencies

- `src/lib/indexeddb.ts`
- `src/lib/requirementsSync.ts`

## Notes

- Pages import the global `state` object directly and do not receive DI params.
- `set(...)` methods may be async and can map to persistent writes.
- Public `onchange` listeners are intentionally not exposed yet.

## Tests

- `proxies local provider course and degree getters`: verifies local provider
  wiring to indexeddb/requirements sync.
- `swaps provider and notifies rerender handler`: verifies runtime provider
  replacement and rerender callback invocation.
