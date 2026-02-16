# Not Found Page

## Overview

The not found page is the fallback route view for unknown paths and is rendered
by the router when no page factory matches the normalized pathname.

## Page Contents

- Path display slot (`data-slot="path"`) showing the unresolved route.
- Error heading and descriptive text.
- Link back to the landing route (`/`).

## Data Flow

1. `NotFoundPage(pathname)` clones the template and validates the root.
2. The provided route path is written into `data-slot="path"`.
3. The page is rendered by `src/lib/router.ts` when route resolution fails.

## Unit Tests

### `renders a root element`

WHAT: Verifies the page factory returns a valid DOM root.
WHY: Prevents regressions where template cloning fails and route fallback cannot render.
HOW: Calls `NotFoundPage()` directly and checks the returned type.

```python
page = NotFoundPage()
assert isinstance(page, HTMLElement)
```

### `renders supplied route path`

WHAT: Verifies the unknown path is echoed in the page slot.
WHY: The user should see which route failed to resolve.
HOW: Passes a custom pathname and asserts `data-slot="path"` contains that exact value.

```python
page = NotFoundPage('/does-not-exist')
path_text = page.query('[data-slot="path"]').text
assert path_text == '/does-not-exist'
```

## Integration Tests

### `renders not-found content for unknown route`

WHAT: Verifies full fallback behavior on an invalid browser route.
WHY: Ensures router failures degrade to a usable not-found page with recovery path.
HOW: Navigates to a missing URL, then checks heading text, echoed path slot, and home link visibility.

```python
page.goto('/missing-route')
assert page.heading('העמוד לא נמצא').is_visible()
assert page.locator('[data-slot="path"]').contains('/missing-route')
assert page.locator('a[href="/"]').is_visible()
```
