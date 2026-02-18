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

1. `SearchPage()` reads initial query/filter parameters from the browser URL.
2. User input is normalized and debounced, then the page queries through global `state.courses.query(...)`.
3. Requirement filter options are derived from global `state.userDegree.get()` and `state.requirements.get(...)`.
4. Matching `CourseRecord` items are rendered into linked `CourseCard` nodes in the results grid.
5. Current query/filter state is written back to the URL with `history.replaceState`, and sync metadata is read through `state.courses.getLastSync()`.
6. Pressing `Escape` in the search input clears the query and reruns the search.

## Unit Tests

### `renders result grid and filter controls`

WHAT: Verifies the search shell and filter widgets render with expected structure.
WHY: Protects core discoverability UI from template regressions.
HOW: Renders `SearchPage()`, waits one tick, then asserts grid classes, filter controls, and sync hint link.

```python
page = SearchPage()
wait_for_tick()
assert has_class('[data-search-results]', 'grid-cols-3')
assert has_class('[data-search-results]', 'sm:grid-cols-4')
assert exists('[data-filter-available]')
assert exists('[data-filter-faculty]')
assert exists('[data-filter-requirement]')
assert text('[data-search-sync] a[href="/catalog"]').contains('עברו לקטלוג')
```

### `renders all queried cards from results`

WHAT: Verifies results from IndexedDB query are rendered as linked cards.
WHY: Confirms search output wiring and styling semantics for current vs non-current courses.
HOW: Mocks `queryCourses()` with two courses, renders page, then asserts call shape, generated hrefs, card sizing classes, and dimming class.

```python
mock(queryCourses).returns(two_courses)
page = SearchPage(); wait_for_tick()
assert queryCourses.called_with(page=1, pageSize='all')
assert hrefs('[data-search-results] > a') == ['/course?code=234114', '/course?code=234124']
assert has_class(first_result(), 'h-[7.5rem]')
assert has_class(second_result(), 'opacity-45')
```

### `hides empty filter message before courses are available`

WHAT: Verifies the empty-state panel remains hidden when local data is not loaded yet.
WHY: Avoids misleading "no results" messaging during initial empty-database state.
HOW: Mocks zero total courses and empty query result, renders page, then checks empty panel keeps `hidden` class.

```python
mock(getCoursesCount).returns(0)
mock(queryCourses).returns(courses=[], total=0)
page = SearchPage(); wait_for_tick()
assert has_class('[data-search-empty]', 'hidden')
```

## Integration Tests

### `renders search form, filters, and results region`

WHAT: Verifies route-level rendering of the search interface.
WHY: Ensures users always land on a usable search screen after navigation.
HOW: Opens `/search` in Playwright and asserts main shell plus key control regions are visible.

```python
page.goto('/search')
assert page.main().is_visible()
assert page.locator('[data-search-form]').is_visible()
assert page.locator('[data-filter-faculty]').is_visible()
assert page.locator('[data-search-results]').is_visible()
```

### `keeps query parameter in the input when deep-linked`

WHAT: Verifies query-string hydration into the search input.
WHY: Supports shared/deep links that should restore search context.
HOW: Navigates directly with `?q=104031` and asserts input value equals the query param.

```python
page.goto('/search?q=104031')
assert page.locator('[data-search-input]').value == '104031'
```
