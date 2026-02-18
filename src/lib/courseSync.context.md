# courseSync

## Overview

Syncs the remote `courseData.json` into IndexedDB with metadata for caching and freshness checks.

## Exports

- `syncCourseData()`: Fetch course data if needed and persist it to IndexedDB.
- `initCourseSync(options)`: Run an initial sync and resync on `online` events.
- `CourseSyncResult`: Status result for a sync attempt.
- `CourseSyncOptions`: Optional callbacks for sync success or errors.

## Data Flow

- Reads `etag` and `lastModified` from metadata.
- Uses conditional fetch headers to skip redundant payload downloads.
- Stores courses via `putCourses()` and updates meta keys (etag, last sync, counts).

## Dependencies

- `src/lib/indexeddb.ts` for metadata and course storage.
- Data endpoint serving `courseData.json` (default: `https://tom.selfin.io/planit/_data`).
- `VITE_DATA_BASE_URL` environment variable to override the default endpoint.

## Notes

- When offline, returns `offline` without touching storage.
- Handles 304 responses by updating last sync time only.

## Tests

- Returns `offline` and avoids fetch calls when `navigator.onLine` is false.
- Skips updates on 304 responses while refreshing `lastSync` metadata.
- Updates courses, count, and metadata when remote data changes.
