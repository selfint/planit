# catalogSync

## Overview

Syncs the remote `catalogs.json` into IndexedDB with metadata for caching and freshness checks.

## Exports

- `syncCatalogs()`: Fetch catalogs if needed and persist them to IndexedDB.
- `initCatalogSync(options)`: Run an initial sync and resync on `online` events.
- `CatalogSyncResult`: Status result for a sync attempt.
- `CatalogSyncOptions`: Optional callbacks for sync success or errors.

## Data Flow

- Reads `etag`, `lastModified`, and `remoteUpdatedAt` from metadata.
- Uses conditional fetch headers and GitHub commit metadata to skip redundant fetches.
- Stores catalogs via `putCatalogs()` and updates meta keys (etag, last sync, counts).

## Dependencies

- `src/lib/indexeddb.ts` for metadata and catalog storage.
- GitHub raw and API endpoints for catalogs data and update timestamps.

## Notes

- When offline, returns `offline` without touching storage.
- Handles 304 responses by updating last sync time only.

## Tests

- `src/lib/catalogSync.test.ts`
