# Catalog Page

## Overview

The catalog page is the route for browsing degree requirements and the courses
inside each requirement group. It uses offline IndexedDB data and works without
network blocking.

## Page Contents

- Intro header with route context and summary line.
- Degree picker panel (catalog, faculty, program, path) mounted from
  `DegreePicker`.
- Requirement groups panel that renders course cards per requirement node.
- Empty, loading, and missing-data states for offline-first behavior.

## Data Flow

1. `CatalogPage()` mounts `DegreePicker()` and immediately renders skeleton
   placeholders using `CourseCard()`.
2. The page reads active selection via `getActiveRequirementsSelection()` and
   program requirements via `getRequirement(programId)` from IndexedDB.
3. The requirement tree is filtered with `filterRequirementsByPath()` and then
   flattened into course-bearing requirement groups.
4. Each course code resolves to optional course details using `getCourse(code)`.
5. Courses render as `CourseCard` elements, each wrapped with a link to
   `/course?code=<code>`.
6. Degree picker changes and requirement table mutations trigger a debounced
   re-render of the requirement-group panel.

## Unit Tests

- `catalog_page.test.ts`: verifies waiting state when no active selection is
  stored.
- `catalog_page.test.ts`: verifies requirement groups render course cards and
  course links.

## Integration Tests

- `catalog_page.spec.ts`: verifies route-level missing-requirements state text
  when the active selection exists but no requirement record is available.
