# /plan

High-level design for the degree planning view. This is a client-side route in the single-page application.

## Purpose

Provide a Trello-like overview of the full degree plan, organized by semester, with a fast click-to-move interaction and no drag-and-drop.

## Core UI

- Responsive columns: mobile shows one full-width column, tablet shows two columns, desktop shows three or more based on available width.
- Course cards inside each semester column.
- Click-to-move interaction: click a course to select it, then click the target semester column to move it.
- When a course is selected, other semesters show a clear "move here" indicator.
- Clear selected state for the active course; clicking the selected course again navigates to the course page.

## Key Behaviors

- No drag-and-drop. Only click-select then click-target to move.
- Moving a course updates the plan state immediately in IndexedDB.
- Semester columns show credit totals.

## Data

- Source: user plan from IndexedDB.
- Derived: semester ordering and per-semester metrics.
    - Total points
    - Average median of courses
    - Total courses with tests

## Edge Cases

- If a move violates prerequisites or semester availability, show a non-blocking warning on the moved card.
- If the same course exists in multiple semesters, resolve to a single location and surface a warning.
