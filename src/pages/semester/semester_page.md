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
2. `hydratePage()` reads plan meta (`planPageState`), active requirement
   selection, and full local courses list.
3. Current semester courses are loaded from plan codes and rendered separately.
4. Requirement groups are derived from `getRequirement(programId)` and
   `filterRequirementsByPath(...)`, then current-semester courses are excluded.
5. Remaining non-catalog and non-semester courses are grouped into
   free-elective sections by faculty.
6. All course entries render as links to `/course?code=<code>` using `CourseCard`.

## Unit Tests

- `uses query param number and shows semester metadata in sticky title`:
  sets URL to `/semester?number=3`, mocks plan metadata, then asserts current
  semester title contains both semester index and parsed season/year.
- `renders current semester separately from catalog and free-elective groups`:
  mocks semester plan + requirement data, then asserts current-semester course
  links, requirement-group links, and faculty-group titles are rendered in
  separate containers.

## Integration Tests

- `renders semester route and current semester section`: navigates to
  `/semester` and asserts `<main>`, current-semester title slot, and groups root
  are visible.
- `supports query-based semester deep link`: navigates to
  `/semester?number=3` and asserts current-semester title contains `סמסטר 3`.
