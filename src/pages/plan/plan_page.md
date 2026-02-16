# Plan Page

## Overview

The Plan page (`/plan`) is the interactive semester planning surface for building and adjusting a degree plan.
It is designed as a row-based board that avoids horizontal scrolling and keeps move actions clear on mobile and desktop.

## Page Contents

- A semester count control (`מספר סמסטרים`) with dynamic minimum constraints.
- A vertical planner board (`data-semester-rail`) made of:
    - semester rows
    - wishlist row (`רשימת משאלות`)
    - exemptions row (`פטורים`)
- Per-row header metadata chips (credits, median, tests for semesters; course count for wishlist/exemptions).
- Per-row move actions shown only during active selection:
    - `העברה` on valid destination rows
    - `ביטול` to clear the current selection
- Bottom schedule problems section (`בעיות תזמון`) rendered below planner rows.

## Data Flow

1. `PlanPage()` clones the template and mounts `ConsoleNav`.
2. On hydrate, the page fetches IndexedDB data through `$lib/indexeddb`:
    - `getMeta('planPageState')`
    - `getCoursesPage(...)`
3. The page restores persisted placement when available (semesters + wishlist + exemptions), otherwise distributes courses into semester rows.
4. User actions update in-memory state immediately:
    - select course
    - move to target row
    - clear selection
    - resize semester count
5. Persisted state is updated with `setMeta(...)` after move/resize operations.
6. The UI rerenders row content and updates derived metrics + schedule problems from semester rows.

## Unit Tests

- `renders planner rows including wishlist and exemptions`
    - Renders `PlanPage()` with mocked IndexedDB payloads and asserts row count,
      wishlist/exemptions labels, and semester link `href` values.
- `shows row move controls and clears selection with row cancel`
    - Clicks a row course action, asserts cancel visibility and highlighted
      rows, then clicks row cancel and asserts move targets/highlights are reset.
- `clamps semester count to last semester containing courses`
    - Seeds persisted semesters via mocked `getMeta`, changes semester-count
      input below minimum, then asserts clamped input value and saved meta payload.

## Integration Tests

- `renders vertical rows with wishlist and exemptions`
    - Navigates to `/plan` and asserts row counts, wishlist/exemptions labels,
      semester links, and absence of horizontal rail controls.
- `navigates to semester page from semester row link`
    - Clicks a semester link in the plan rail, then asserts browser URL and
      semester-page root match the selected semester.
- `moves selected course to wishlist row`
    - Selects a course action, verifies highlighted move targets, clicks
      wishlist row target, then asserts course relocation and cleared selection UI.
- `keeps semester count minimum at last populated semester`
    - Fills a smaller value in semester-count input, dispatches change, and
      asserts value snaps back to computed minimum.
- `renders schedule errors section below planner rows`
    - Evaluates DOM ordering and asserts the schedule-problems section follows
      the planner rail in document flow.
