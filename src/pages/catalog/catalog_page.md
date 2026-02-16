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
  message by mocking `getActiveRequirementsSelection()` to `undefined`,
  rendering `CatalogPage()`, and asserting `data-catalog-state` text.
- `renders one page of three course cards and supports paging`: validates
  median ordering and pager behavior by mocking requirement/course payloads,
  asserting first-page link order and dimming, clicking `הבא`, and asserting
  second-page links.
- `hides rendered requirements while picker selection is changing`: validates
  pending state by mutating picker input values, dispatching `change`, then
  asserting requirement cards are hidden and pending copy is shown.
- `renders three cards per page on narrow mobile width`: validates mobile
  cards-per-page behavior by setting `window.innerWidth` to a narrow value and
  asserting rendered card link count.
- `renders nine cards per page on tablet and wider view`: validates
  tablet/desktop cards-per-page behavior by setting `window.innerWidth` above
  tablet threshold and asserting first-page card count.

## Integration Tests

- `renders catalog route and picker section`: navigates to `/catalog` and
  asserts the route `<main>`, degree picker root (`[data-degree-catalog]`), and
  requirements container (`[data-catalog-groups]`) are visible.
