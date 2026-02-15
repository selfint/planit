# indexeddb

## Overview

IndexedDB access layer for courses, catalogs, requirements, and metadata.

## Exports

- Store constants: `DB_NAME`, `DB_VERSION`, `STORE_COURSES`, `STORE_META`, `STORE_CATALOGS`, `STORE_REQUIREMENTS`.
- Meta helpers: `getMeta(key)`, `setMeta(entry)`.
- Catalog helpers: `putCatalogs(catalogs)`, `getCatalogs()`.
- Requirements helpers: `getRequirement(programId)`, `replaceRequirementsWithCow(record, previousProgramId)`.
- Course helpers: `putCourses(courses)`, `getCourse(code)`, `getCourses(limit)`, `getCoursesPage(limit, offset)`, `getCoursesPageSorted(...)`, `searchCourses(query, limit)`, `getCourseFaculties()`, `queryCourses(params)`.
- Course query types: `CourseQueryParams`, `CourseQueryResult`.
- Types: `MetaEntry`, `CourseRecord`, `CatalogRecord`, `RequirementRecord`.

## Data Flow

- Opens the database and creates stores/indexes during upgrades.
- Wraps read/write operations in transactions with explicit completion/error handling.
- Uses copy-on-write semantics for requirements to avoid deleting old data until new data is stored.
- Supports course querying with combined text search, availability, faculty, points range, median threshold, requirement membership, and pagination.

## Dependencies

- Browser IndexedDB APIs.

## Notes

- Requirements store uses `programId` as the keyPath.
- Sorting uses indexes for `name`, `points`, and `median`.
- `availableOnly` filtering in `queryCourses` is strict: a course matches only when `course.current === true`.
- `pageSize: 'all'` returns all matching rows without slicing.

## Tests

- Stores and reads meta entries through the meta helpers.
- Writes courses and paginates results via course lookup helpers.
- Queries courses with combined filters and paginated/all modes.
- Reads unique faculty options from stored course data.
- Writes catalogs and reads them back through catalog helpers.
- Replaces requirements with copy-on-write semantics.
