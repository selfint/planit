# Course Page

## Overview

The course page is a query-based route (`/course?code=XXXXXX`) that displays full
details for a single course and its related courses. It is part of the SPA
navigation and is rendered by the client-side router.

## Page Contents

- Header card with course name and description.
- Key stats tiles for points, median, faculty, and seasons.
- Planner actions that switch between add-mode and remove-mode based on
  persisted placement (semester / wishlist / exemptions).
- A split primary action that adds to the current semester and exposes a
  dropdown for adding to any other semester.
- The action row is planner-focused only (no legacy navigation shortcut
  buttons), with compact button sizing for denser mobile/desktop layout.
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
6. Planner actions read/write the persisted plan through `state.userPlan.*` so
   course-page persistence follows the same state boundary as other routes.
7. Action mode uses placement priority (`semester` -> `wishlist` ->
   `exemptions`): existing placement renders a remove button; no placement
   renders add actions.
8. The primary action adds to `currentSemester`, while the arrow menu lists all
   available semesters for explicit placement using season/year labels derived
   from semester IDs (with deterministic fallback when IDs are missing).
9. Removal success status for semester placement uses the same season/year
   label mapping (instead of numeric `סמסטר N`) for consistency with add flows.
10. Semester placement detection supports both current `courseCodes` metadata and
   legacy semester `courses` arrays (string codes or `{ code }` records) so
   existing users still get remove-mode when a course is already planned.
11. Action visibility toggles switch between `inline-flex` and `hidden` classes
    together to avoid conflicting display utilities when mode changes.
12. Seasons are normalized to Hebrew labels (for example: `winter`/`A` ->
    `חורף`, `spring`/`B` -> `אביב`, `summer`/`C` -> `קיץ`).
13. Section headers are always visible to keep layout stable.
14. During loading, each relation grid starts with 3 pre-rendered `CourseCard`
    skeletons from the HTML template, and section counts use shimmer
    placeholders (without loading text).
15. During loading, the full points/median/faculty/seasons stat cards use
    shimmer placeholders via `data-loading="true"` on each stat tile.
16. After data resolves, grids are replaced with real cards and empty labels are
    shown only for empty result sets.
17. Planner writes keep metadata intact in `planPageState`, including
    `semesterCount`, `semesters`, and `currentSemester`.

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

### `shows remove action when course is already in wishlist`

WHAT: Verifies action mode switches to remove when the course already appears in
`wishlistCourseCodes`.
WHY: Prevents duplicate-add flows and matches user intent for quick removal.
HOW: Mocks persisted wishlist membership, renders the page, flushes async work,
then asserts the remove button is visible with wishlist-specific text.

```python
mock_plan(wishlistCourseCodes=['CS101'])
page = CoursePage('/course?code=CS101')
flush_promises()
assert visible('[data-role="placement-remove"]')
assert 'מרשימת המשאלות' in text('[data-role="placement-remove"]')
```

### `adds course to current semester from primary action`

WHAT: Verifies the primary split action writes to the current semester row.
WHY: This is now the default planner action when a course is not yet placed.
HOW: Mocks `currentSemester=1`, clicks
`[data-role="semester-add-current"]`, then verifies the persisted payload
contains the course in `semesters[1].courseCodes`.

```python
mock_plan(currentSemester=1, semesters=[[]])
page = CoursePage('/course?code=CS101')
click('[data-role="semester-add-current"]')
assert 'CS101' in last_user_plan_set().semesters[1].courseCodes
```

### `renders semester dropdown with season-year labels aligned to split control start`

WHAT: Verifies split-action labels use semester season/year names and dropdown
menu anchoring starts at the split-control start edge.
WHY: Improves planner clarity by showing real term names and keeps menu position
visually aligned with the primary add action.
HOW: Mocks semester IDs like `אביב-2027-2`, renders page, then asserts button
labels use season/year text and dropdown menu keeps `start-0` alignment class.

```python
mock_plan(currentSemester=1, semesters=[id('חורף-2026-1'), id('אביב-2027-2')])
page = CoursePage('/course?code=CS101')
flush_promises()
assert 'אביב 2027' in text('[data-role="semester-add-current"]')
assert has_class('[data-role="semester-dropdown-menu"]', 'start-0')
```

### `shows remove action when course is in a legacy semester courses list`

WHAT: Verifies remove-mode still works for persisted plans using legacy semester
`courses` arrays instead of `courseCodes`.
WHY: Existing users may carry older metadata, and they still need placement-aware
actions to hide the add split button.
HOW: Mocks a v2 plan with `semesters[0].courses=[{ code: 'CS101' }]`, renders the
page, and asserts the remove button is visible with a semester-specific label.

```python
mock_plan(version=2, semesters=[{'courses': [{'code': 'CS101'}]}])
page = CoursePage('/course?code=CS101')
flush_promises()
assert visible('[data-role="placement-remove"]')
assert 'מסמסטר 1' in text('[data-role="placement-remove"]')
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

### `switches to remove action after adding course to current semester`

WHAT: Verifies the add action transitions the UI into remove-mode immediately.
WHY: Prevents users from seeing conflicting add/remove controls after placement updates.
HOW: Opens `/course?code=104031`, clicks the current-semester add action, then asserts remove button visibility and add button hidden state.

```python
page.goto('/course?code=104031')
click('[data-role="semester-add-current"]')
assert visible('[data-role="placement-remove"]')
assert 'הסר מסמסטר 1' in text('[data-role="placement-remove"]')
assert hidden('[data-role="semester-add-current"]')
```
