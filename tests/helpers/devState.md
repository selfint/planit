# devState Test Helper

## Purpose

This helper provides deterministic application state for Playwright tests by
injecting `window.__PLANIT_DEV_STATE__` before the app bootstraps.

## Exports

- `createDefaultDevStateSnapshot()` returns a baseline in-memory dataset used by
  all end-to-end tests.
- `setDevState(page, snapshot)` installs the snapshot via
  `page.addInitScript(...)`.

## Notes

- The snapshot intentionally includes course/catalog/requirements data required
  by route and user-flow specs.
- Injection happens before app scripts execute, so the runtime can switch from
  IndexedDB provider to the dev in-memory provider in `src/lib/stateManagement.ts`.
