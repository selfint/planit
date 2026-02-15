# Search Page

## Overview

The search page is the `/search` route and provides fast, local course lookup over IndexedDB without waiting for network responses.

## Page Contents

- A search form with text input, submit button, clear button, and advanced filters.
- Filters for `available`, `faculty`, `points` min/max, `median` min, and `requirement`.
- Live status text for search progress, result count, and latest sync metadata.
- Configurable pagination with page size selector (`All`, `12`, `24`, `48`) and prev/next controls.
- A responsive results grid that renders linked `CourseCard` items (minimum 3 cards per row).
- An empty/error panel for no-query, no-results, and failure states.

## Data Flow

1. The page reads initial query/filter/pagination parameters from the browser URL.
2. User input is normalized and debounced, then the page calls `queryCourses` from `$lib/indexeddb`.
3. Requirement filter options are derived from the active requirements record (`requirementsActiveProgramId` + `getRequirement`).
4. Matching `CourseRecord` items are rendered into linked `CourseCard` nodes in the results grid.
5. Current query/filter/pagination state is written back to the URL with `history.replaceState`, and sync metadata is read from `getMeta('courseDataLastSync')`.

## Unit Tests

- Validates the results container keeps a 3+ columns grid contract (`grid-cols-3`, `sm:grid-cols-4`).
- Validates filter controls are rendered and suggestion pills are not present.
- Validates default page size is `all` and linked course cards render from queried results.

## Integration Tests

- Validates `/search` route renders heading, filter controls, pagination controls, and results container.
