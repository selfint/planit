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

- `renders a root element`: validates the factory returns an `HTMLElement`.
- `renders supplied route path`: validates path-slot binding for unknown routes.

## Integration Tests

- `not_found_page.spec.ts` validates unknown routes render fallback heading,
  echoed path, and return-home link.
