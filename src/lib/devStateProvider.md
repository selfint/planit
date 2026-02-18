# devStateProvider

## Overview

Creates an in-memory `StateProvider` from a serialized dev payload and supports
loading that payload from `localStorage` during development/e2e runs.

## Exports

- `DEV_STATE_STORAGE_KEY`: localStorage key (`planit:dev-state`).
- `DevStatePayload`: serialized state payload shape
  (`courses/catalogs/userDegree/requirements`).
- `createDevStateProvider(payload)`: builds a full `StateProvider` backed by
  in-memory maps/objects.
- `parseDevStatePayload(raw)`: parses and validates serialized payload JSON.

## Data Flow

- Parse JSON payload from localStorage into a validated `DevStatePayload`.
- Normalize courses into an in-memory map by course code.
- Build provider methods that satisfy the runtime `StateProvider` contract.
- Keep `userDegree` and `requirements` identifiers synchronized in memory when
  `userDegree.set(...)` or `requirements.sync(...)` are called.

## Dependencies

- `src/lib/stateManagement.ts` (`StateProvider` type contract)
- `src/lib/indexeddb.ts` types (`CourseRecord`, `MetaEntry`, etc.)
- `src/lib/requirementsSync.ts` types (`RequirementsSelection`, sync result)

## Notes

- `courses.query(...)` follows the same filtering + ranking model used by the
  IndexedDB implementation so route behavior is deterministic in dev/e2e mode.
- `requirements.sync(...)` is network-free and resolves with
  `{ status: 'updated' }`.
- `userPlan` is kept in memory only (`planPageState` meta entry shape).

## Tests

- `creates provider and supports course lookup/query/pagination`: verifies core
  course methods against deterministic in-memory data.
- `keeps user degree and requirements in sync in memory`: verifies degree
  updates also update requirement keying.
- `parses valid payload and rejects malformed payload`: validates payload
  parsing and shape checks.
