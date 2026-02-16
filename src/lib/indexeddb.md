# indexeddb

## Overview

IndexedDB access layer for courses, catalogs, requirements, and metadata.

## Exports

- Store constants: `DB_NAME`, `DB_VERSION`, `STORE_COURSES`, `STORE_META`, `STORE_CATALOGS`, `STORE_REQUIREMENTS`.
- Meta helpers: `getMeta(key)`, `setMeta(entry)`.
- Catalog helpers: `putCatalogs(catalogs)`, `getCatalogs()`.
- Requirements helpers: `getRequirement(programId)`, `replaceRequirementsWithCow(record, previousProgramId, persistActiveSelection?)`.
- Course helpers: `putCourses(courses)`, `getCourse(code)`, `getCourses(limit)`, `getCoursesPage(limit, offset)`, `getCoursesPageSorted(...)`, `searchCourses(query, limit)`, `getCourseFaculties()`, `queryCourses(params)`.
- Course query types: `CourseQueryParams`, `CourseQueryResult`.
- Types: `MetaEntry`, `CourseRecord`, `CatalogRecord`, `RequirementRecord`.

## Data Flow

- Opens the database and creates stores/indexes during upgrades.
- Wraps read/write operations in transactions with explicit completion/error handling.
- Uses copy-on-write semantics for requirements to avoid deleting old data until new data is stored.
- Optionally skips active requirements meta updates during COW writes (for incomplete picker states).
- Supports course querying with combined text search, availability, faculty, points range, median threshold, requirement membership, and pagination.

## Dependencies

- Browser IndexedDB APIs.

## Notes

- Requirements store uses `programId` as the keyPath.
- `replaceRequirementsWithCow(..., persistActiveSelection)` defaults to `true`; pass `false` to store requirement payload without mutating active catalog/faculty/program/path meta keys.
- Sorting uses indexes for `name`, `points`, and `median`.
- `availableOnly` filtering in `queryCourses` is strict: a course matches only when `course.current === true`.
- `pageSize: 'all'` returns all matching rows without slicing.

## Store and Key Reference

### IndexedDB stores

| Store          | keyPath     | Value schema        |
| -------------- | ----------- | ------------------- |
| `courses`      | `code`      | `CourseRecord`      |
| `meta`         | `key`       | `MetaEntry`         |
| `catalogs`     | `id`        | `CatalogRecord`     |
| `requirements` | `programId` | `RequirementRecord` |

### Schemas

#### `MetaEntry` (`meta` store)

```ts
type MetaEntry = {
    key: string;
    value: unknown;
};
```

#### `CourseRecord` (`courses` store)

```ts
type CourseRecord = {
    code: string;
    median?: number;
    about?: string;
    points?: number;
    name?: string;
    connections?: {
        dependencies?: string[][];
        adjacent?: string[];
        exclusive?: string[];
    };
    seasons?: string[];
    faculty?: string;
    current?: boolean;
    tests?: ({ year: number; monthIndex: number; day: number } | null)[];
};
```

Indexes on `courses`:

- `name`
- `points`
- `median`

#### `CatalogRecord` (`catalogs` store)

```ts
type CatalogRecord = {
    id: string;
    data: unknown;
};
```

#### `RequirementRecord` (`requirements` store)

```ts
type RequirementRecord = {
    programId: string;
    catalogId: string;
    facultyId: string;
    path?: string;
    data: unknown;
};
```

### Known `meta` keys and value conventions

#### Course sync keys (`src/lib/courseSync.ts`)

| Key                         | Value type              | Meaning                                                  |
| --------------------------- | ----------------------- | -------------------------------------------------------- |
| `courseDataEtag`            | `string`                | Last ETag used for conditional `courseData.json` fetches |
| `courseDataLastModified`    | `string`                | Last-Modified value used for conditional fetches         |
| `courseDataLastSync`        | `string` (ISO datetime) | Last local course sync/check time                        |
| `courseDataCount`           | `number`                | Number of stored courses                                 |
| `courseDataRemoteUpdatedAt` | `string` (ISO datetime) | Latest upstream commit timestamp for `courseData.json`   |
| `courseDataLastChecked`     | `string` (ISO datetime) | Last remote metadata check time                          |

#### Catalog sync keys (`src/lib/catalogSync.ts`)

| Key                           | Value type              | Meaning                                                |
| ----------------------------- | ----------------------- | ------------------------------------------------------ |
| `catalogsDataEtag`            | `string`                | Last ETag used for conditional `catalogs.json` fetches |
| `catalogsDataLastModified`    | `string`                | Last-Modified value used for conditional fetches       |
| `catalogsDataLastSync`        | `string` (ISO datetime) | Last local catalogs sync/check time                    |
| `catalogsDataCount`           | `number`                | Number of stored catalog entries                       |
| `catalogsDataRemoteUpdatedAt` | `string` (ISO datetime) | Latest upstream commit timestamp for `catalogs.json`   |
| `catalogsDataLastChecked`     | `string` (ISO datetime) | Last remote metadata check time                        |

#### Requirements selection and sync keys (`src/lib/requirementsSync.ts`)

| Key                           | Value type              | Meaning                                               |
| ----------------------------- | ----------------------- | ----------------------------------------------------- |
| `requirementsActiveCatalogId` | `string`                | User selected active catalog                          |
| `requirementsActiveFacultyId` | `string`                | User selected active faculty                          |
| `requirementsActiveProgramId` | `string`                | User selected active program                          |
| `requirementsActivePath`      | `string`                | User selected active path, or empty string when unset |
| `requirementsLastSync`        | `string` (ISO datetime) | Last successful requirements sync                     |

#### User plan key (`src/pages/plan/plan_page.ts`)

| Key             | Value type             | Meaning                                            |
| --------------- | ---------------------- | -------------------------------------------------- |
| `planPageState` | `PersistedPlan` object | User planner state used across plan/semester views |

`planPageState` payload shape:

```ts
type PersistedPlan = {
    version: number;
    semesterCount: number;
    semesters: { id: string; courseCodes: string[] }[];
    wishlistCourseCodes: string[];
    exemptionsCourseCodes: string[];
};
```

## Tests

- Stores and reads meta entries through the meta helpers.
- Writes courses and paginates results via course lookup helpers.
- Queries courses with combined filters and paginated/all modes.
- Reads unique faculty options from stored course data.
- Writes catalogs and reads them back through catalog helpers.
- Replaces requirements with copy-on-write semantics.
- Supports COW replacement without changing active requirements selection metadata.
