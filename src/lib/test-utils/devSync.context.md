# devSync

## Overview

Seeds IndexedDB from a development-only localStorage payload (`planit:dev-state`) and writes the same sync/selection metadata keys used by runtime data flows.

## Exports

- `DEV_STATE_STORAGE_KEY`: localStorage key for serialized dev payload.
- `DevStatePayload`: payload shape for courses, catalogs, selected degree, and requirements data.
- `initDevSync()`: in dev mode, parses payload, writes data into IndexedDB, updates sync metadata, and returns whether payload was applied.
- `parseDevStatePayload(raw)`: validates and parses payload JSON.

## Data Flow

- Reads localStorage payload only when `import.meta.env.DEV` is true.
- Normalizes course records and selected degree path.
- Persists courses and catalogs via `putCourses` / `putCatalogs`.
- Replaces requirement record with `replaceRequirementsWithCow`, preserving previous-program cleanup and active selection metadata updates.
- Writes `courseDataLastSync`, `courseDataCount`, `catalogsDataLastSync`, `catalogsDataCount`, and `requirementsLastSync`.

## Dependencies

- `src/lib/indexeddb.ts`
- `src/lib/requirementsSync.ts` (type usage)

## Notes

- Invalid payloads are treated as hard errors with a descriptive exception.
- ETag/Last-Modified/remote-updated metadata is intentionally not synthesized from local payloads.

## Tests

- `returns false when dev state key is absent`: verifies no writes occur when payload is missing.
- `populates indexeddb and sync metadata from localStorage payload`: verifies data stores and required sync meta keys are written.
- `throws when localStorage payload is invalid json shape`: ensures malformed payloads fail loudly.
- `parses valid payload and rejects malformed payload`: covers parser validation boundaries.
