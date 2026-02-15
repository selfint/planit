# /plan

Interactive semester planning board for the degree plan route.

## Purpose

Provide a semester board where users select a course card and move it by clicking a target semester.

## Core UI

- Horizontally scrollable semester rail in all breakpoints.
- Mobile keeps touch-based horizontal scrolling with snap alignment.
- Desktop keeps scroll support and adds previous/next arrow navigation when overflow exists.
- Every planned course is rendered with `CourseCard`.
- Click-select then click-semester move interaction, with explicit move target hint.
- Clicking the selected card again routes to `/course`.

## Key Behaviors

- No drag-and-drop.
- Move operation updates the in-memory board immediately and persists semester placement.
- Semester columns show derived metrics: total points, average median, and count of courses with tests.
- If a course is placed in a season that is not listed in `course.seasons`, the card shows a non-blocking warning.

## Data

- Source courses are loaded from IndexedDB (`courses` store). If empty, a fallback sample set is used.
- Semester placement is persisted in `meta` under `planPageState`.
- Derived metrics per semester:
    - Total points
    - Average median
    - Courses with at least one test

## Edge Cases

- Duplicate courses in persisted state are normalized to a single location and surfaced as a warning.
- Unknown persisted codes are ignored safely during restore.
