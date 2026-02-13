# PlannerOverview

## Overview

PlannerOverview renders the welcome hero, quick stats, and entry actions for
the planner landing area. It embeds the CourseTable component into the layout.

## Template Structure

- Intro copy with headline and supporting paragraph.
- Three stat cards for plan, requirements, and sync.
- Primary and secondary action buttons.
- Placeholder slot for the course table.

## Data Flow

1. `PlannerOverview()` clones the HTML template and validates the root.
2. The `[data-course-table]` slot is replaced with `CourseTable()`.

## Dependencies

- Component: `src/components/CourseTable`.
- Template: `src/components/PlannerOverview.html`.

## Notes

- `data-course-table` is a required slot for mounting the table.
