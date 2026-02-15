# Search Page

## Overview

The search page is the `/search` route and provides fast, local course lookup over IndexedDB without waiting for network responses.

## Page Contents

- A search form with text input, submit button, clear button, and advanced filters.
- Filters for `available`, `faculty`, `points` min/max, `median` min, and `requirement`.
- Live status text for search progress, result count, and latest sync metadata.
- A responsive results grid that renders linked `CourseCard` items (minimum 3 cards per row) and always shows all filtered matches.
- An empty/error panel for no-query, no-results, and failure states.

## Data Flow

1. The page reads initial query/filter parameters from the browser URL.
2. User input is normalized and debounced, then the page immediately renders loading/status feedback and updates URL state.
3. Search execution is deferred by one browser task (`setTimeout(..., 0)`) before calling `queryCourses`, so typing and filter toggles stay responsive and do not block UI interaction.
4. Requirement filter options are derived from the active requirements record (`requirementsActiveProgramId` + `getRequirement`).
5. Matching `CourseRecord` items are rendered into linked `CourseCard` nodes in the results grid.
6. Current query/filter state is written back to the URL with `history.replaceState`, and sync metadata is read from `getMeta('courseDataLastSync')`.
7. Each new search creates an `AbortController` and aborts the previous in-flight query so expensive IndexedDB scans stop early when filters change quickly.
8. A request id guard is checked again after the defer point to discard stale searches before querying IndexedDB.

## Unit Tests

- Validates the results container keeps a 3+ columns grid contract (`grid-cols-3`, `sm:grid-cols-4`).
- Validates filter controls are rendered and suggestion pills are not present.
- Validates default page size is `all` and linked course cards render from queried results.
- Validates empty state messaging stays hidden before courses are loaded.
- Validates filter interactions stay reactive while results are pending: status/URL update synchronously, query is deferred to the next tick, previous in-flight request is aborted, and the latest query runs with updated filter state.

## Integration Tests

- Validates `/search` route renders filter controls and results container.
