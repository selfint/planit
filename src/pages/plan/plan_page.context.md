# Plan Page

## Overview

The Plan page (`/plan`) is the interactive semester planning surface for building and adjusting a degree plan.
It is designed as a row-based board that avoids horizontal scrolling and keeps move actions clear on mobile and desktop.

## Page Contents

- A semester count control (`מספר סמסטרים`) with dynamic minimum constraints.
- A current-semester control (`סמסטר נוכחי`) that stores a 0-based `currentSemester` index in persisted planner state.
- A vertical planner board (`data-semester-rail`) made of:
    - semester rows
    - wishlist row (`רשימת משאלות`)
    - exemptions row (`פטורים`)
- A current-semester tests schedule block with two rows:
    - `מועד א` (`data-tests-track="0"`)
    - `מועד ב` (`data-tests-track="1"`)
      Each square uses the course-code color. The first item in each row shows `day/month`; later items show day-delta to the previous sorted test date.
- A shared row-course-list template in `plan_page.html` (`data-role="row-course-list-template"`) that controls card width with responsive grid columns (`5rem` / `7rem` / `9rem`) matching the course page width-management pattern.
- Per-row header metadata chips (credits, median, tests for semesters; course count for wishlist/exemptions).
- Per-row move actions shown only during active selection:
    - `העברה` on valid destination rows
    - `ביטול` to clear the current selection
- Bottom schedule problems section (`בעיות תזמון`) rendered below planner rows.

## Data Flow

1. `PlanPage()` clones the template and mounts `ConsoleNav`.
2. On hydrate, the page fetches persisted/local data through global state:
    - `state.userPlan.get()`
    - `state.courses.page(...)`
3. The page restores persisted placement when available (semesters + wishlist + exemptions), otherwise distributes courses into semester rows.
4. User actions update in-memory state immediately:
    - select course
    - move to target row
    - clear selection
    - resize semester count
    - set current semester index
5. Persisted state is updated with `state.userPlan.set(...)` after move/resize operations.
6. The UI rerenders row content, current-semester highlight, and test schedule for the selected current semester only.
7. Hovering a test square highlights the matching course card in the current semester row.
8. Derived metrics + schedule problems continue to be computed from all semester rows.
9. Row course-list styling is template-driven from `plan_page.html`; TypeScript clones that template for every row so width behavior stays consistent in one HTML source.

## Unit Tests

### `renders planner rows including wishlist and exemptions`

WHAT: Verifies baseline row composition for semester, wishlist, and exemptions lanes.
WHY: The planner depends on stable row structure for all move/persist actions.
HOW: Renders `PlanPage()` with mocked data, then asserts row count, row labels, and semester link hrefs.

```python
mock_plan_data(default_courses)
page = PlanPage(); flush_promises()
assert page.attr('data-page') == 'plan'
assert count('[data-plan-row]') == 8
assert text('[data-row-id="wishlist"]').contains('רשימת משאלות')
assert text('[data-row-id="exemptions"]').contains('פטורים')
assert hrefs('[data-semester-link]') == [
    '/semester?number=1', '/semester?number=2', '/semester?number=3',
    '/semester?number=4', '/semester?number=5', '/semester?number=6',
]
```

### `shows row move controls and clears selection with row cancel`

WHAT: Verifies per-row move UI activation and cancellation lifecycle.
WHY: Selection state is central to drag-like move interactions in the planner.
HOW: Clicks a course action to enter selection mode, asserts visible cancel/highlight states, then clicks row-cancel and verifies state reset.

```python
page = PlanPage(); flush_promises()
click('[data-course-action]')
assert any_visible('[data-cancel-selection]')
assert has_highlight('[data-row-id="wishlist"]')
click('[data-cancel-selection][data-row-id=<source>]')
assert none_visible('[data-move-target]')
assert no_rows_highlighted()
```

### `clamps semester count to last semester containing courses`

WHAT: Verifies semester count input cannot shrink below last populated semester.
WHY: Prevents destructive data loss when users reduce semester count too far.
HOW: Seeds persisted state with content in semester 6, sets input to 3, dispatches change, then asserts value clamps to 6 and persisted payload stores 6.

```python
mock_meta(semester_count=6, last_populated=6)
page = PlanPage(); flush_promises()
set_value('[data-semester-count]', '3')
dispatch_change('[data-semester-count]')
assert value('[data-semester-count]') == '6'
assert last_call(setMeta).value.semesterCount == 6
```

### `persists selected current semester index`

WHAT: Verifies changing `סמסטר נוכחי` writes `currentSemester` to persisted plan state.
WHY: Test schedule and current-row highlighting must survive reloads.
HOW: Changes the select value and asserts latest persisted payload includes the chosen 0-based index.

### `renders tests from the current semester only and sorted by exam date`

WHAT: Verifies test chips are generated from current semester courses only.
WHY: Planner must not leak tests from non-current semesters.
HOW: Seeds multiple semesters with dated tests, restores `currentSemester`, then asserts `מועד א/מועד ב` chips show first date and subsequent day-deltas in sorted date order.

### `highlights current semester course on test-square hover`

WHAT: Verifies hovering a test square adds highlight ring to the matching current-semester course card.
WHY: Keeps schedule-to-course mapping clear and interactive.
HOW: Hovers a `data-test-course-code` square and asserts the corresponding current-semester `data-course-action` toggles ring classes.

## Integration Tests

### `renders vertical rows with wishlist and exemptions`

WHAT: Verifies end-to-end route layout for the row-based planner.
WHY: Confirms production route behavior matches the intended vertical interaction model.
HOW: Opens `/plan`, asserts rail visibility, row counts/labels, semester link hrefs, and absence of horizontal rail controls.

```python
page.goto('/plan')
assert page.locator('[data-semester-rail]').is_visible()
assert page.locator('[data-plan-row]').count() == 8
assert page.locator('[data-row-id="wishlist"]').contains('רשימת משאלות')
assert page.locator('[data-row-id="exemptions"]').contains('פטורים')
assert page.locator('[data-rail-prev]').count() == 0
assert page.locator('[data-rail-next]').count() == 0
```

### `navigates to semester page from semester row link`

WHAT: Verifies semester row links navigate to the matching semester route.
WHY: Keeps cross-route planner flow consistent and discoverable.
HOW: Clicks semester link number 3 and asserts URL and semester-page marker.

```python
page.goto('/plan')
page.click('[data-semester-link][data-semester-number="3"]')
assert page.url.endswith('/semester?number=3')
assert page.locator('[data-page="semester"]').is_visible()
```

### `uses course-page-like grid width management for plan cards`

WHAT: Verifies plan card width is controlled by responsive grid columns (same strategy as the course page).
WHY: Prevents regressions back to per-card basis sizing and keeps width behavior consistent between pages.
HOW: Navigates to `/plan`, reads classes from all `data-row-course-list` containers, asserts the shared grid column classes exist, and checks first `data-course-action` no longer includes `basis-*` classes.

```python
page.goto('/plan')
list_classes = all_class_names('[data-row-course-list]')
assert all('grid' in cls for cls in list_classes)
assert all('grid-cols-[repeat(auto-fit,minmax(5rem,1fr))]' in cls for cls in list_classes)
assert all('md:grid-cols-[repeat(auto-fit,minmax(7rem,1fr))]' in cls for cls in list_classes)
assert all('lg:grid-cols-[repeat(auto-fit,minmax(9rem,1fr))]' in cls for cls in list_classes)
assert all('flex' not in cls for cls in list_classes)

action_cls = class_name('[data-course-action]')
assert 'w-full' in action_cls
assert 'basis-full' not in action_cls
assert 'sm:basis-' not in action_cls
assert 'lg:basis-' not in action_cls
```

### `moves selected course to wishlist row`

WHAT: Verifies interactive course transfer from semester row to wishlist.
WHY: This is a core planner action and must keep UI/data state synchronized.
HOW: Selects a course, confirms move-target visibility, clicks wishlist row, then asserts card relocation and cleared selection controls.

```python
page.goto('/plan')
select_course_action_in_semester_row()
assert visible_move_targets() > 0
page.click('[data-row-id="wishlist"]')
assert page.locator('[data-selected-status]').count() == 0
assert course_exists_in_row(course_code, 'wishlist')
assert not course_exists_in_row(course_code, source_row)
```

### `keeps semester count minimum at last populated semester`

WHAT: Verifies the min attribute and runtime clamp on semester count input.
WHY: Guards against invalid UI states when user input contradicts persisted plan occupancy.
HOW: Opens route, fills value below min, triggers change, then asserts value snapped back.

```python
page.goto('/plan')
input = page.locator('[data-semester-count]')
assert input.attr('min') == '6'
input.fill('3')
input.dispatch('change')
assert input.value == '6'
```

### `renders schedule errors section below planner rows`

WHAT: Verifies schedule problems section is positioned after planner rail.
WHY: Keeps error diagnostics in predictable reading order after planning controls.
HOW: Evaluates DOM position relationship in-browser and asserts `data-schedule-problems` follows `data-semester-rail`.

```python
page.goto('/plan')
rail = page.query('[data-semester-rail]')
problems = page.query('[data-schedule-problems]')
assert dom_position(rail, problems) == 'following'
```

### `shows current-semester test schedule and switches with selector`

WHAT: Verifies selecting a different current semester updates both row highlighting and test schedule source.
WHY: Confirms end-to-end behavior for the new current-semester control.
HOW: Opens `/plan`, changes `data-current-semester-select`, then asserts `data-current-semester-row` moves to the selected semester and test chips remain available for that semester.
