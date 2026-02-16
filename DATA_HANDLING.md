# Data Handling in Planit

This document explains how data is managed end-to-end in the app: dataset sync (`courseData.json`, `catalogs.json`), PWA code updates, and user state persistence.

## 1) Course dataset sync (`courseData.json`)

Relevant files:

- [`src/main.ts`](src/main.ts)
- [`src/lib/courseSync.ts`](src/lib/courseSync.ts)
- [`src/lib/indexeddb.ts`](src/lib/indexeddb.ts)
- [`src/pages/course/course_page.ts`](src/pages/course/course_page.ts)
- [`src/pages/search/search_page.ts`](src/pages/search/search_page.ts)

```mermaid
sequenceDiagram
    autonumber
    participant App as main.ts
    participant UI as CoursePage/SearchPage
    participant CS as courseSync
    participant GH as GitHub API (commit metadata)
    participant RAW as Raw JSON (courseData.json)
    participant IDB as IndexedDB (courses + meta)

    App->>CS: initCourseSync() on app startup
    CS->>CS: check navigator.onLine
    alt offline
        CS-->>UI: status=offline (keep local data)
    else online
        CS->>GH: fetch latest commit date for static/courseData.json
        GH-->>CS: remoteUpdatedAt (or metadata fetch error)
        CS->>IDB: read/write meta (remoteUpdatedAt, lastChecked)
        CS->>IDB: compare stored remoteUpdatedAt + lastSync
        alt already current
            CS-->>UI: status=skipped
        else need fetch
            CS->>IDB: read ETag/Last-Modified
            CS->>RAW: GET courseData.json (If-None-Match/If-Modified-Since)
            alt 304 Not Modified
                CS->>IDB: set courseDataLastSync
                CS-->>UI: status=skipped
            else 200 OK
                RAW-->>CS: full dataset
                CS->>IDB: putCourses(...) bulk write
                CS->>IDB: set meta (etag,lastModified,lastSync,count,remoteUpdatedAt)
                CS-->>UI: status=updated
            end
        end
    end

    CS-->>UI: dispatch planit:course-sync event
    UI->>IDB: read courses/meta and rerender
```

Notes:

- Sync starts from app bootstrap (`main.ts`) and runs again on `online` events.
- Views read from IndexedDB, so local data is still usable offline.

## 2) Catalog + requirements data sync (`catalogs.json` + `requirementsData.json`)

Relevant files:

- [`src/main.ts`](src/main.ts)
- [`src/lib/catalogSync.ts`](src/lib/catalogSync.ts)
- [`src/lib/requirementsSync.ts`](src/lib/requirementsSync.ts)
- [`src/lib/indexeddb.ts`](src/lib/indexeddb.ts)
- [`src/pages/catalog/components/DegreePicker.ts`](src/pages/catalog/components/DegreePicker.ts)
- [`src/pages/catalog/catalog_page.ts`](src/pages/catalog/catalog_page.ts)

```mermaid
sequenceDiagram
    autonumber
    participant App as main.ts
    participant Picker as DegreePicker
    participant CatSync as catalogSync
    participant ReqSync as requirementsSync
    participant GH as GitHub API (catalog commit)
    participant RAW as Raw JSON (catalogs/requirements)
    participant IDB as IndexedDB (catalogs, requirements, meta)
    participant CatalogPage as CatalogPage groups

    App->>CatSync: initCatalogSync() on app startup
    CatSync->>CatSync: check navigator.onLine
    alt offline
        CatSync-->>Picker: status=offline
    else online
        CatSync->>GH: latest commit for static/catalogs.json
        GH-->>CatSync: remoteUpdatedAt
        CatSync->>IDB: compare metadata + conditional headers
        CatSync->>RAW: GET catalogs.json
        alt changed
            RAW-->>CatSync: catalogs payload
            CatSync->>IDB: putCatalogs(...)
            CatSync->>IDB: set catalogs meta keys
            CatSync-->>Picker: status=updated
        else unchanged
            CatSync-->>Picker: status=skipped
        end
    end

    CatSync-->>Picker: dispatch planit:catalog-sync event
    Picker->>IDB: getCatalogs() + get active selection
    Picker->>ReqSync: syncRequirements(selection)
    ReqSync->>RAW: GET .../_catalogs/{catalog}/{faculty}/{program}/requirementsData.json
    alt success
        RAW-->>ReqSync: requirement tree
        ReqSync->>IDB: replaceRequirementsWithCow(...)
        ReqSync->>IDB: set requirementsLastSync (+ active selection/path)
        ReqSync-->>Picker: status=updated
    else offline/failure
        ReqSync-->>Picker: status=offline/failed
    end

    Picker->>IDB: getRequirement(programId)
    CatalogPage->>IDB: getRequirement(...) + getCourse(...)
    CatalogPage-->>CatalogPage: render groups from cached requirements/courses
```

Notes:

- `catalogs.json` is synced globally from `main.ts`; `requirementsData.json` is synced per selected program.
- Requirement writes use copy-on-write replacement (`replaceRequirementsWithCow`) and persist active selection when complete.

## 3) App code update flow (PWA)

Relevant files:

- [`vite.config.ts`](vite.config.ts)
- [`src/main.ts`](src/main.ts)
- [`src/lib/pwa.ts`](src/lib/pwa.ts)

```mermaid
sequenceDiagram
    autonumber
    participant User as User Session
    participant App as main.ts
    participant PWA as pwa.ts
    participant SW as Service Worker
    participant Net as Deployed app assets
    participant UI as App UI

    User->>App: open app
    App->>PWA: initPWA()
    PWA->>SW: registerSW(immediate=true)
    SW-->>PWA: registration + lifecycle callbacks
    PWA->>PWA: periodic checks (~10 min), plus online/visibility triggers
    PWA->>Net: fetch swUrl (no-store)
    alt new app version available
        SW-->>PWA: onNeedRefresh()
        alt initial load and online
            PWA->>SW: updateSW(true) (reload to new version)
        else mid-session
            PWA-->>UI: dispatch planit:pwa-update event
            UI->>User: optional in-app update prompt
            User->>UI: accept update
            UI->>SW: updateSW(true)
        end
    else no update
        PWA-->>PWA: keep current worker + cache
    end
```

Notes:

- Workbox is configured with `clientsClaim` and `skipWaiting` for fast activation.
- Update UX remains event-driven via `planit:pwa-update`; UI listeners can decide how to present the prompt.

## 4) User state management (local-first)

Relevant files:

- [`src/lib/indexeddb.ts`](src/lib/indexeddb.ts)
- [`src/pages/plan/plan_page.ts`](src/pages/plan/plan_page.ts)
- [`src/pages/semester/semester_page.ts`](src/pages/semester/semester_page.ts)
- [`src/pages/search/search_page.ts`](src/pages/search/search_page.ts)
- [`src/lib/requirementsSync.ts`](src/lib/requirementsSync.ts)
- [`src/lib/router.ts`](src/lib/router.ts)

```mermaid
sequenceDiagram
    autonumber
    participant User as User
    participant Plan as PlanPage
    participant Semester as SemesterPage
    participant Search as SearchPage
    participant Req as Requirements selection
    participant Router as Router session redirect
    participant IDB as IndexedDB meta/records
    participant Session as sessionStorage

    User->>Plan: move courses / change semesters
    Plan->>IDB: setMeta('planPageState', persisted layout)

    User->>Semester: open /semester?n=...
    Semester->>IDB: getMeta('planPageState') + queryCourses('all')
    Semester->>IDB: getRequirement(active program)
    Semester-->>User: render semester + requirement/free-elective groups

    User->>Req: choose catalog/faculty/program/path
    Req->>IDB: set active requirements selection/path meta

    User->>Search: open search page
    Search->>IDB: queryCourses(filters)
    Search->>IDB: getMeta('courseDataLastSync') for sync label

    Router->>Session: read 'planit:redirect-path'
    Router->>Session: clear key after restore
```

Notes:

- Most user state is local in IndexedDB `meta` plus domain stores (`courses`, `catalogs`, `requirements`).
- Session redirect state is transient and stored in `sessionStorage` (`planit:redirect-path`).
