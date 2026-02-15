# /plan

Interactive semester planning board for the degree plan route.

## Purpose

Provide a row-based planner where users select a course card and move it by clicking a target row.

## Core UI

- Vertically stacked planning rows with no horizontal scrolling.
- Semester rows render before two extra rows: `רשימת משאלות` and `פטורים`.
- Courses inside each row use wrapped cards (`flex-wrap`) for responsive multi-line layout.
- Every planned course is rendered with `CourseCard`.
- Click-select then click-semester move interaction, with explicit move target hint.
- Clicking the selected card again routes to `/course`.

## Key Behaviors

- No drag-and-drop.
- Move operation updates the in-memory board immediately and persists row placement.
- Semester rows show derived metrics: total points, average median, and count of courses with tests.
- If a course is placed in a season that is not listed in `course.seasons`, the card shows a non-blocking warning.
- Schedule errors are displayed at the bottom of the page below planner rows.

## Data

- Source courses are loaded from IndexedDB (`courses` store). If empty, a fallback sample set is used.
- Semester placement is persisted in `meta` under `planPageState`.
- Wishlist and exemptions rows are persisted with their own course code lists.
- Derived metrics per semester:
    - Total points
    - Average median
    - Courses with at least one test

## Edge Cases

- Duplicate courses in persisted state are normalized to a single location and surfaced as a warning.
- Unknown persisted codes are ignored safely during restore.
- Schedule validation is computed from semester rows only (not wishlist/exemptions).
