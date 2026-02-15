# Catalog Page

## Overview

The catalog page is the route for browsing degree requirements and the courses
inside each requirement group. It uses offline IndexedDB data and works without
network blocking.

## Page Contents

- Intro header with route context and summary line.
- Degree picker panel (catalog, faculty, program, path) mounted from
  `DegreePicker`.
- Requirement groups panel that renders `CourseCard` in a single row per
  requirement.
- Per-requirement paging controls (`next`/`previous`) to render one card page
  at a time for faster UI updates.
- Empty, loading, and missing-data states for offline-first behavior.

## Data Flow

1. `CatalogPage()` mounts `DegreePicker()` and immediately renders lightweight
   skeleton rows using `CourseCard` placeholders.
2. The page reads active selection via `getActiveRequirementsSelection()` and
   program requirements via `getRequirement(programId)` from IndexedDB.
3. The requirement tree is filtered with `filterRequirementsByPath()` and then
   flattened into course-bearing requirement groups.
4. Each course code resolves to optional course details using `getCourse(code)`.
5. Courses render as linked `CourseCard` entries (`/course?code=<code>`).
6. Each requirement renders only one page of cards (up to 3 cards per page) to
   keep rendering fast, and paging controls move between pages.
7. Cards inside each requirement are sorted by course median (highest first),
   and non-current courses (`current !== true`) are dimmed visually.
8. Degree picker changes and requirement table mutations trigger a debounced
   re-render of the requirement-group panel.

## Unit Tests

- `catalog_page.test.ts`: verifies waiting state when no active selection is
  stored.
- `catalog_page.test.ts`: verifies requirement groups render one 3-card page
  and support paging to later courses.

## Integration Tests

- `catalog_page.spec.ts`: verifies route-level missing-requirements state text
  when the active selection exists but no requirement record is available.
