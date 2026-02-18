# Course Page

## Overview

The course page is a query-based route (`/course?code=XXXXXX`) that displays full
details for a single course and its related courses. It is part of the SPA
navigation and is rendered by the client-side router.

## Page Contents

- Header card with course name and description.
- Key stats tiles for points, median, faculty, and seasons.
- Loading skeleton state, query validation state, and course-not-found state.
- Related course sections for dependencies, dependants (inverse dependency
  lookup), adjacent courses, and exclusive courses.
- Related courses rendered as `CourseCard` components linked to
  `/course?code=...`.

## Data Flow

1. The page reads `code` from `window.location.search` (`?code=...`).
2. It loads the course through `state.courses.get(...)`.
3. It subscribes to `COURSE_SYNC_EVENT` and re-renders when course data is
   refreshed.
4. It resolves connection codes (dependencies/adjacent/exclusive) and fetches
   each related course through `state.courses.get(...)`.
5. It scans courses in batches via `state.courses.count()` and
   `state.courses.page(...)` to find dependants (courses whose dependency groups
   include the current course code).
6. Wishlist actions read/write the persisted plan through `state.userPlan.*` so
   course-page persistence follows the same state boundary as other routes.
7. Seasons are normalized to Hebrew labels (for example: `winter`/`A` ->
   `חורף`, `spring`/`B` -> `אביב`, `summer`/`C` -> `קיץ`).
8. Section headers are always visible to keep layout stable.
9. During loading, each relation grid starts with 3 pre-rendered `CourseCard`
   skeletons from the HTML template, and section counts use shimmer
   placeholders (without loading text).
10. During loading, the full points/median/faculty/seasons stat cards use
    shimmer placeholders via `data-loading="true"` on each stat tile.
11. After data resolves, grids are replaced with real cards and empty labels are
    shown only for empty result sets.

## Storybook

- `src/pages/course/course_page.stories.ts` includes a dedicated `Skeleton`
  story that renders `CoursePageSkeletonPreview()` so the loading layout can be
  reviewed directly from template defaults without waiting for async data.

## Unit Tests

### `renders a root element`

WHAT: Verifies the course page factory returns the expected root container.
WHY: Guards against template wiring regressions that would break route rendering.
HOW: Calls `CoursePage()` with base mocks and asserts `HTMLElement` + `data-page="course"`.

```python
mock_default_course_queries()
page = CoursePage()
assert isinstance(page, HTMLElement)
assert page.attr('data-page') == 'course'
```

### `shows not found when code query param is missing`

WHAT: Verifies validation state when `?code=` is absent.
WHY: Prevents ambiguous UI when the route is opened without a required query parameter.
HOW: Sets URL to `/course`, renders, flushes async work, then checks not-found state and guidance text.

```python
window.history.set('/course')
page = CoursePage()
flush_promises()
assert visible('[data-state="not-found"]')
assert 'נדרש פרמטר code' in text('[data-role="not-found-message"]')
```

### `renders fetched course and related course cards`

WHAT: Verifies happy-path render with related-course sections.
WHY: Ensures dependency, dependant, adjacent, and exclusive groups remain accurate.
HOW: Deep-links to `CS101`, asserts the initial loading skeleton cards, flushes async work, then verifies resolved relation counts and `או` labels.

```python
window.history.set('/course?code=CS101')
mock_course_graph_for_cs101()
page = CoursePage()
assert count('[data-component="CourseCard"][data-skeleton="true"]') == 12
flush_promises()
assert text('[data-role="course-name"]') == 'Intro to CS'
assert count('[data-role="dependencies-grid"] section') == 2
assert count('[data-role="dependants-grid"] [data-component="CourseCard"]') == 2
assert count('[data-component="CourseCard"][data-skeleton="true"]') == 0
```

## Integration Tests

### `shows validation state when code is missing`

WHAT: Verifies browser navigation to `/course` shows validation guidance.
WHY: Confirms end-to-end behavior matches the unit validation branch.
HOW: Navigates with Playwright, then asserts main region visibility and missing-code text.

```python
page.goto('/course')
assert page.main().is_visible()
assert page.text('לא נמצא קורס תואם').is_visible()
assert page.text('נדרש פרמטר code בכתובת').is_visible()
```

### `accepts query-based course deep link`

WHAT: Verifies deep links with `?code=` render route shell correctly.
WHY: Users often enter the page from copied links, so query hydration must work.
HOW: Navigates directly with query param, asserts heading visibility, and verifies raw query text is not leaked in UI.

```python
page.goto('/course?code=104031')
assert page.main().is_visible()
assert page.heading('פרטי קורס').is_visible()
assert page.text('/course?code=104031').count() == 0
```
