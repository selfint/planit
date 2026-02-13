# /plan

High-level design for the degree planning view. This is a client-side route in the single-page application.

## Purpose

Provide a Trello-like overview of the full degree plan, organized by semester, with a fast click-to-move interaction.

## Core UI

- Column per semester, laid out horizontally with a scrollable board.
- Course cards inside each semester column.
- Click-to-move interaction: click a course to select it, then click the target semester column to move it.
- Clear selected state for the active course and subtle hover for target columns.

## Key Behaviors

- No drag-and-drop. Only click-select then click-target to move.
- Moving a course updates the plan state immediately in IndexedDB.
- Semester columns show capacity or credit totals and warnings if over limits.

## Data

- Source: user plan from IndexedDB.
- Derived: semester ordering, credit totals, requirement status indicators.

## Edge Cases

- If a move violates prerequisites or semester availability, show a non-blocking warning on the moved card.
- If the same course exists in multiple semesters, resolve to a single location and surface a warning.
