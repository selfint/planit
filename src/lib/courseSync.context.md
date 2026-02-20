# courseSync

## Overview

Syncs the remote `courseData.json` into IndexedDB with metadata for caching and freshness checks.

## Exports

- `syncCourseData()`: Fetch course data if needed and persist it to IndexedDB.
- `initCourseSync(options)`: Run a one-time sync attempt when invoked.
- `CourseSyncResult`: Status result for a sync attempt.
- `CourseSyncOptions`: Optional callbacks for sync success or errors.

## Data Flow

- Reads `etag` and `lastModified` from metadata.
- Uses conditional fetch headers to skip redundant payload downloads.
- On successful updates, fetches `_data/generatedAt.json` and stores its `timestamp` as ISO in `courseDataGeneratedAt`.
- Stores courses via `putCourses()` and updates meta keys (etag, last sync, counts, generated-at).

## Dependencies

- `src/lib/indexeddb.ts` for metadata and course storage.
- Data endpoint serving `courseData.json` (default: `'_data'`, requested as `_data/courseData.json`).
- `VITE_DATA_BASE_URL` environment variable to override the default endpoint.

## Notes

- When offline, returns `offline` without touching storage.
- Handles 304 responses without writing metadata.
- No runtime `online` listener is registered in this module; background resync
  orchestration is intentionally owned by bootstrap/callers.

## Tests

- Returns `offline` and avoids fetch calls when `navigator.onLine` is false.
- Skips updates on 304 responses without writing metadata.
- Updates courses, count, and `courseDataGeneratedAt` when remote data changes.
