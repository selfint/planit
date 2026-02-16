# Search Page

## Overview

The search page is the `/search` route and provides fast local course lookup
from IndexedDB without network blocking.

## Page Contents

- Search form with query input and submit action.
- Filter controls for `available`, `faculty`, `requirement`, `points` min/max,
  and `median` min.
- Status row and sync metadata text.
- Responsive results grid that renders linked `CourseCard` nodes.
- Empty/error panel that appears for no-results and local-read failures.

## Data Flow

1. The page reads initial query/filter parameters from the browser URL.
2. User input is normalized and debounced, then the page calls `queryCourses` from `$lib/indexeddb`.
3. Requirement filter options are derived from the active requirements record (`requirementsActiveProgramId` + `getRequirement`).
4. Matching `CourseRecord` items are rendered into linked `CourseCard` nodes in the results grid.
5. Current query/filter state is written back to the URL with `history.replaceState`, and sync metadata is read from `getMeta('courseDataLastSync')`.
6. Pressing `Escape` in the search input clears the query and reruns the search.

## Unit Tests

- `renders result grid and filter controls`: validates search form structure,
  filter controls, and sync link behavior.
- `renders all queried cards from results`: validates `queryCourses` call shape,
  result links, and non-current styling.
- `hides empty filter message before courses are available`: validates empty
  panel stays hidden when total local course count is zero.

## Integration Tests

- `search_page.spec.ts` validates route rendering and deep-link query handling.
