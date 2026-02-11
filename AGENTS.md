# Agent Guide: Planit

## Project goal

Planit is a degree planner for the Technion. It will be a PWA that works offline and syncs when online.

## Core data sources

- `catalogs.json`: degree programs and requirements.
- `courseData.json`: course details.

## Storage and sync

- Use IndexedDB as the local database.
- The app should operate fully offline using IndexedDB as the source of truth.
- When online, sync and refresh the local IndexedDB data from the two JSON files.
- Assume both JSON files are very large; avoid loading them repeatedly or unnecessarily.

## PWA expectations

- Offline-first behavior is required.
- Sync should happen in the background or on app start when connectivity is available.

## High-level design

- **App shell**: lightweight UI that loads from cache and renders from IndexedDB, never blocks on network.
- **Data layer**: IndexedDB stores `catalogs`, `courses`, and `userPlans` with versioned metadata and last-sync timestamps.
- **Sync flow**: on startup/online, fetch JSON files, diff by version or checksum, then update IndexedDB in batches.
- **Planner engine**: derives degree requirements and course eligibility from cached data and user plan state.
- **UI structure**: degree picker, requirement checklist, term planner grid, course search, and sync status.
- **PWA**: service worker caches shell assets, handles offline routing, and schedules background sync when available.

## Diagrams

```mermaid
flowchart TB
  UI[App Shell / UI] --> Planner[Planner Engine]
  UI --> Sync[Sync Manager]
  Planner --> DB[IndexedDB]
  Sync --> DB
  Sync --> Net[Network: catalogs.json & courseData.json]
  SW[Service Worker] --> UI
  SW --> Cache[Cache Storage]
  SW --> Sync
  UI --- Layout[Planned layout: src/app, src/ui, src/planner, src/sync, src/db]
  SW --- Layout
  Sync --- Layout
```

```mermaid
sequenceDiagram
  participant User
  participant UI as App Shell / UI
  participant DB as IndexedDB
  participant Sync as Sync Manager
  participant Net as Network (JSON files)
  participant SW as Service Worker
  participant Cache as Cache Storage

  User->>UI: Launch app
  UI->>SW: Request shell assets
  SW->>Cache: Serve cached shell
  UI->>DB: Load cached catalogs/courses/userPlans
  UI-->>User: Render offline-first UI

  UI->>Sync: Check connectivity
  alt Online
    Sync->>Net: Fetch catalogs.json/courseData.json
    Sync->>DB: Batch update data + metadata
    UI->>DB: Read updated data
    UI-->>User: Refresh views
  else Offline
    Sync-->>UI: Skip network, keep cached data
  end
```

## Notes for agents

- Favor incremental changes and avoid blocking the UI when parsing or writing large datasets.
- Keep data update paths resilient to partial failures (e.g., retry or resume logic).
