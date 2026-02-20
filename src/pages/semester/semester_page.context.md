# Semester Page

## Overview

The semester page is the `/semester` route and renders a focused view of one
semester selected by the `number` query parameter.

## Page Contents

- Sticky current-semester panel with title and linked `CourseCard` rows.
- Grouped catalog requirements (excluding courses already in the selected semester).
- Free-elective groups bucketed by faculty with title format
  `בחירה חופשית: <פקולטה>`.
- Move flow for planning: first click selects/highlights a course, click on
  current semester adds it, second click on the same selected course opens
  the course page.
- Cancel button in the current semester panel clears pending move selection.
- Horizontal scroll rows for requirement and free-elective groups.
- Row-level skeleton placeholders render before each row hydrates (up to 10 cards
  per row) and are non-interactive until data is loaded.
- Error state message when local data reads fail.

## Data Flow

1. `SemesterPage()` parses `?number=<n>` from URL and defaults to semester 1.
2. `hydratePage()` reads plan state and active requirement selection through
   global `state` getters, then builds row descriptors first.
3. Current semester row shows skeleton placeholders sized by persisted
   `courseCodes` count (capped at 10), then hydrates via `state.courses.get(code)`.
4. Requirement groups are derived from `state.requirements.get(programId)` and
   `filterRequirementsByPath(...)`; each requirement row hydrates its own course
   codes independently with row-local skeletons.
5. Free-elective rows are built from `state.courses.faculties()` and each
   faculty row hydrates independently via `state.courses.query({ faculty, pageSize: 'all' })`,
   excluding requirement and current-semester codes.
6. All course entries render as `CourseCard` links with semester move behavior:
   select on first click, navigate to `/course?code=<code>` on second click of
   the same card.
7. Adding a selected course into the current semester updates plan metadata via
   `state.userPlan.set(...)` while preserving existing plan fields.

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
HOW: Mocks semester/course/requirement payloads, renders page, then asserts course codes and group titles appear in separate containers and free-elective containers use row classes.

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

### `selects a course and adds it into current semester panel`

WHAT: Verifies selection-highlight and move-into-current-semester behavior.
WHY: The semester page is used to add courses directly into the current term.
HOW: Selects a requirement course, clicks current semester panel, and verifies
the course appears there and persisted `courseCodes` were updated.

```python
click('[data-role="groups-root"] a[data-course-code="B200"]')
assert has_class('ring-2')
click('[data-role="current-semester"]')
assert codes('[data-role="current-semester-courses"]') == ['A100', 'B200']
assert persisted.semesters[1].courseCodes == ['A100', 'B200']
```

### `opens course page when clicking same selected course twice`

WHAT: Verifies double-click-like behavior (two consecutive clicks).
WHY: Users still need quick navigation to course details.
HOW: Clicks the same course twice and checks URL changed to `/course?code=...`.

```python
click('a[data-course-code="B200"]')
click('a[data-course-code="B200"]')
assert location.pathname == '/course'
assert search_param('code') == 'B200'
```

### `shows cancel button while selected and clears selection on cancel`

WHAT: Verifies current-semester cancel control behavior.
WHY: Users need an explicit way to abort move mode.
HOW: Selects a course, confirms cancel appears, clicks cancel, confirms
selection and move mode are cleared.

```python
click('a[data-course-code="B200"]')
assert not has_class('[data-role="current-semester-cancel"]', 'invisible')
click('[data-role="current-semester-cancel"]')
assert not has_class('a[data-course-code="B200"]', 'ring-2')
assert has_class('[data-role="current-semester-cancel"]', 'invisible')
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
