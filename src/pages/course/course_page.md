# Course Page

## Overview

The course page is a query-based route (`/course?code=XXXXXX`) that displays full
details for a single course and its related courses. It is part of the SPA
navigation and is rendered by the client-side router.

## Page Contents

- Header card with course name and description.
- Key stats tiles for points, median, faculty, and seasons.
- Loading state, query validation state, and course-not-found state.
- Related course sections for dependencies, dependants (inverse dependency
  lookup), adjacent courses, and exclusive courses.
- Related courses rendered as `CourseCard` components linked to
  `/course?code=...`.

## Data Flow

1. The page reads `code` from `window.location.search` (`?code=...`).
2. It loads the course from IndexedDB through `getCourse`.
3. It triggers `initCourseSync` to refresh local data when online and re-renders
   on sync callbacks.
4. It resolves connection codes (dependencies/adjacent/exclusive) and fetches
   each related course from IndexedDB.
5. It scans the courses store in batches to find dependants (courses whose
   dependency groups include the current course code).
6. Seasons are normalized to Hebrew labels (for example: `winter`/`A` ->
   `חורף`, `spring`/`B` -> `אביב`, `summer`/`C` -> `קיץ`).
7. The UI updates between loading, found, and not-found states, and related
   course cards are rendered in dedicated grids.

## Unit Tests

- `renders a root element`: calls `CoursePage()` with mocked IndexedDB methods
  and asserts the returned node is an `HTMLElement` with `data-page="course"`.
- `shows not found when code query param is missing`: sets URL to `/course`,
  awaits async render, then asserts not-found state is visible and message text
  contains `נדרש פרמטר code`.
- `renders fetched course and related course cards`: deep-links to
  `/course?code=CS101`, mocks related course lookups and dependency graph data,
  then asserts found state visibility, dependency grouping (`או` labels), card
  counts per relation grid, and `initCourseSync` invocation.

## Integration Tests

- `shows validation state when code is missing`: navigates to `/course` and
  asserts `<main>` visibility plus validation copy for missing `code`.
- `accepts query-based course deep link`: navigates to
  `/course?code=104031`, asserts the page heading is visible, and verifies the
  raw query string is not rendered in visible content.
