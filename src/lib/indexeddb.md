# indexeddb

## Overview

IndexedDB access layer for courses, catalogs, requirements, and metadata.

## Exports

- Store constants: `DB_NAME`, `DB_VERSION`, `STORE_COURSES`, `STORE_META`, `STORE_CATALOGS`, `STORE_REQUIREMENTS`.
- Meta helpers: `getMeta(key)`, `setMeta(entry)`.
- Catalog helpers: `putCatalogs(catalogs)`, `getCatalogs()`.
- Requirements helpers: `getRequirement(programId)`, `replaceRequirementsWithCow(record, previousProgramId)`.
- Course helpers: `putCourses(courses)`, `getCourse(code)`, `getCourses(limit)`, `getCoursesPage(limit, offset)`, `getCoursesPageSorted(...)`.
- Types: `MetaEntry`, `CourseRecord`, `CatalogRecord`, `RequirementRecord`.

## Data Flow

- Opens the database and creates stores/indexes during upgrades.
- Wraps read/write operations in transactions with explicit completion/error handling.
- Uses copy-on-write semantics for requirements to avoid deleting old data until new data is stored.

## Dependencies

- Browser IndexedDB APIs.

## Notes

- Requirements store uses `programId` as the keyPath.
- Sorting uses indexes for `name`, `points`, and `median`.

## Tests

- Covers store setup, metadata helpers, and course paging/sorting behaviors.
