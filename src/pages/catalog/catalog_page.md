# Catalog Page

## Overview

The catalog page is the `/catalog` route for browsing requirement groups and
their courses from local IndexedDB data.

## Page Contents

- Console navigation mounted with `/catalog` active state.
- Degree selection panel mounted from `src/pages/catalog/components/DegreePicker.ts`.
- Requirement-group sections with title, subtitle, page label, and next/previous controls.
- Course cards rendered as links to `/course?code=<code>`.
- Info states for waiting, loading, pending picker sync, empty path, and missing requirements.

## Data Flow

1. `CatalogPage()` mounts `DegreePicker()` and immediately renders lightweight
   skeleton rows using `CourseCard` placeholders.
2. The page reads active selection via `getActiveRequirementsSelection()` and
   program requirements via `getRequirement(programId)` from IndexedDB.
3. The requirement tree is filtered with `filterRequirementsByPath()` and then
   flattened into course-bearing requirement groups.
4. Each course code resolves to optional course details using `getCourse(code)`.
5. Courses render as linked `CourseCard` entries (`/course?code=<code>`).
6. Cards per page are viewport-aware: 3 on mobile widths and 9 on tablet and wider widths.
7. Cards inside each requirement are sorted by course median (highest first),
   and non-current courses (`current !== true`) are dimmed visually.
8. If picker values are changing and are not yet in sync with persisted
   selection, the requirements panel stays hidden until picker state is ready.
9. Degree picker changes, requirement table mutations, and window resize trigger
   a debounced re-render of the requirement-group panel.

## Unit Tests

- `renders waiting state when no active selection exists`: validates waiting
  message when no persisted selection is available.
- `renders one page of three course cards and supports paging`: validates
  median ordering, paging controls, and non-current course dimming.
- `hides rendered requirements while picker selection is changing`: validates
  pending state while picker values are transient.
- `renders three cards per page on narrow mobile width`: validates mobile
  cards-per-page behavior.
- `renders nine cards per page on tablet and wider view`: validates
  tablet/desktop cards-per-page behavior.

## Integration Tests

- `catalog_page.spec.ts` verifies route-level rendering and missing-requirements
  fallback when a selection exists but no requirement payload is stored.
