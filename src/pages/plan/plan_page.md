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
    - Validates base render and presence of row model extras.
- `shows row move controls and clears selection with row cancel`
    - Validates selection state, move/cancel visibility, and highlighted target rows.
- `clamps semester count to last semester containing courses`
    - Validates dynamic minimum semester rule and persisted resize payload.

## Integration Tests

- `renders vertical rows with wishlist and exemptions`
    - Validates route load, row-based layout, and removed horizontal rail controls.
- `moves selected course to wishlist row`
    - Validates select-then-move flow, row highlighting, and updated course placement.
- `keeps semester count minimum at last populated semester`
    - Validates count input cannot go below the computed minimum.
- `renders schedule errors section below planner rows`
    - Validates problems section ordering in the final page layout.
