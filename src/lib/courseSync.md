# courseSync

## Overview

Syncs the remote `courseData.json` into IndexedDB with metadata for caching and freshness checks.

## Exports

- `syncCourseData()`: Fetch course data if needed and persist it to IndexedDB.
- `initCourseSync(options)`: Run an initial sync and resync on `online` events.
- `CourseSyncResult`: Status result for a sync attempt.
- `CourseSyncOptions`: Optional callbacks for sync success or errors.

## Data Flow

- Reads `etag`, `lastModified`, and `remoteUpdatedAt` from metadata.
- Uses conditional fetch headers and GitHub commit metadata to skip redundant fetches.
- Stores courses via `putCourses()` and updates meta keys (etag, last sync, counts).

## Dependencies

- `src/lib/indexeddb.ts` for metadata and course storage.
- GitHub raw and API endpoints for course data and update timestamps.

## Notes

- When offline, returns `offline` without touching storage.
- Handles 304 responses by updating last sync time only.

## Tests

- Covers skip/update logic, metadata handling, and offline behavior.
