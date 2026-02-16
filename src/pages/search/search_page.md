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
  filter controls, and sync link behavior by rendering `SearchPage()` and
  asserting key selectors/classes (`grid-cols-3`, `sm:grid-cols-4`, filter
  inputs/selects, and `/catalog` sync link).
- `renders all queried cards from results`: validates `queryCourses` call shape,
  result links, and non-current styling by mocking result payloads and asserting
  generated anchor `href`s, size classes, and dimmed classes for non-current
  courses.
- `hides empty filter message before courses are available`: validates empty
  panel stays hidden by mocking zero local course count and asserting the empty
  panel retains `hidden` class after render.

## Integration Tests

- `renders search form, filters, and results region`: navigates to `/search` and
  asserts visibility of `<main>`, search form, faculty filter, and results grid.
- `keeps query parameter in the input when deep-linked`: navigates to
  `/search?q=104031` and asserts the search input value is hydrated from the
  query parameter.
