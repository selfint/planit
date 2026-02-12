# CourseTable

## Overview

CourseTable renders a paged, sortable view of courses stored in IndexedDB.
It pairs the template in `src/components/CourseTable.html` with logic in
`src/components/CourseTable.ts` and updates itself on sync events.

## Template Structure

- Header shows a count and last-updated timestamp.
- Table header uses buttons for each sortable column.
- Body rows are generated dynamically from IndexedDB data.
- Pagination controls live below the table.

## Data Flow

1. `CourseTable()` clones the HTML template and queries required elements.
2. `initCourseSync()` triggers reloads after background sync.
3. `loadCourseTable()` reads a sorted page from IndexedDB and renders rows.
4. Count and last updated metadata are read via `getMeta()`.

## Sorting

- Sort state lives in `CourseTableState` (`sortKey`, `sortDirection`).
- Clicking a column header toggles direction or switches the sort key.
- Sorting uses IndexedDB indices for defined values, then appends missing
  values with a second cursor pass so they always appear last.
- The active sort indicator is an inline SVG chevron.

## Pagination

- Page size is `COURSE_TABLE_LIMIT`.
- Prev/next buttons update `pageIndex` and reload.
- Pagination uses the meta count when available; otherwise it infers totals
  from the full dataset size.

## Empty and Missing Values

- Missing values render as `COURSE_EMPTY_VALUE` ("—").
- Empty datasets reveal the empty-state paragraph.

## Dependencies

- Data access: `src/db/indexeddb.ts` (`getAllCourses`, `getMeta`).
- Sync: `src/sync/courseSync` (`initCourseSync`).
- Template: `src/components/CourseTable.html`.

## Notes

- Sorting uses IndexedDB indices plus a second pass to keep missing values
  at the end without changing stored course records.
