# catalogSync

## Overview

Syncs the remote `catalogs.json` into IndexedDB with metadata for caching and freshness checks.

## Exports

- `syncCatalogs()`: Fetch catalogs if needed and persist them to IndexedDB.
- `initCatalogSync(options)`: Run an initial sync and resync on `online` events.
- `CatalogSyncResult`: Status result for a sync attempt.
- `CatalogSyncOptions`: Optional callbacks for sync success or errors.

## Data Flow

- Reads `etag` and `lastModified` from metadata.
- Uses conditional fetch headers to skip redundant payload downloads.
- Stores catalogs via `putCatalogs()` and updates meta keys (etag, last sync, counts).

## Dependencies

- `src/lib/indexeddb.ts` for metadata and catalog storage.
- Data endpoint serving `catalogs.json` (default: `https://tom.selfin.io/planit/_data`).
- `VITE_DATA_BASE_URL` environment variable to override the default endpoint.

## Notes

- When offline, returns `offline` without touching storage.
- Handles 304 responses by updating last sync time only.

## Tests

- Returns `offline` and avoids fetch calls when `navigator.onLine` is false.
- Skips updates on 304 responses while refreshing `lastSync` metadata.
- Updates catalogs, count, and metadata when remote data changes.
