# Semester Page

## Overview

The semester page is the `/semester` route and renders a focused view of one
semester selected by the `number` query parameter.

## Page Contents

- Sticky current-semester panel with title and linked `CourseCard` rows.
- Grouped catalog requirements (excluding courses already in the selected semester).
- Free-elective groups bucketed by faculty with title format
  `בחירה חופשית: <פקולטה>`.
- Horizontal scroll rows on mobile and denser row/grid behavior on wider screens.
- Error state message when local data reads fail.

## Data Flow

1. `SemesterPage()` parses `?number=<n>` from URL and defaults to semester 1.
2. `hydratePage()` reads plan state, active requirement
   selection, and full local courses list through global `state` getters.
3. Current semester courses are loaded from plan codes and rendered separately.
4. Requirement groups are derived from `state.requirements.get(programId)` and
   `filterRequirementsByPath(...)`, then current-semester courses are excluded.
5. Remaining non-catalog and non-semester courses are grouped into
   free-elective sections by faculty.
6. All course entries render as links to `/course?code=<code>` using `CourseCard`.

## Unit Tests

### `uses query param number and shows semester metadata in sticky title`

WHAT: Verifies URL query parsing and semester-title formatting.
WHY: Keeps direct links like `/semester?number=3` stable and understandable.
HOW: Sets URL query, mocks plan metadata with known season/year, renders page, then checks title text fragments.

```python
window.history.set('/semester?number=3')
mock_plan_meta(semester_id='חורף-2027-2')
page = SemesterPage(); flush_promises()
title = text('[data-role="current-semester-title"]')
assert 'סמסטר 3' in title
assert 'חורף 2027' in title
```

### `renders current semester separately from catalog and free-elective groups`

WHAT: Verifies data is split into current, requirement, and free-elective groups.
WHY: Prevents mixing scopes and keeps semester planning context clear.
HOW: Mocks semester/course/requirement payloads, renders page, then asserts course codes and group titles appear in separate containers.

```python
mock_semester_courses(['A100'])
mock_requirement_courses(['A100', 'B200'])
mock_all_courses(['A100', 'B200', 'C300', 'D400'])
page = SemesterPage(); flush_promises()
assert codes('[data-role="current-semester-courses"]') == ['A100']
assert 'B200' in codes('[data-group-kind="requirement"]')
assert 'בחירה חופשית: מתמטיקה' in group_titles('[data-group-kind="free"]')
assert 'בחירה חופשית: פיזיקה' in group_titles('[data-group-kind="free"]')
```

## Integration Tests

### `renders semester route and current semester section`

WHAT: Verifies route shell and core containers are visible.
WHY: Confirms router + page composition works before data-specific assertions.
HOW: Opens `/semester` and checks main region, current title slot, and group root visibility.

```python
page.goto('/semester')
assert page.main().is_visible()
assert page.locator('[data-role="current-semester-title"]').is_visible()
assert page.locator('[data-role="groups-root"]').is_visible()
```

### `supports query-based semester deep link`

WHAT: Verifies deep-link semester number appears in page title.
WHY: Shared links to a specific semester should be stable and explicit.
HOW: Opens `/semester?number=3` and asserts title includes `סמסטר 3`.

```python
page.goto('/semester?number=3')
assert page.locator('[data-role="current-semester-title"]').contains('סמסטר 3')
```
