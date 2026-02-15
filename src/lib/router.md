# router

## Overview

Provides client-side SPA route rendering and internal link interception.

## Exports

- `normalizePath(pathname)`: Normalizes route paths by trimming trailing slashes.
- `shouldHandleClickNavigation(event)`: Decides if a click should be handled by the SPA router.
- `initRouter()`: Initializes initial render, history handling, and delegated link navigation.

## Data Flow

- Reads `window.location.pathname` on startup.
- Resolves route path to a page factory and renders into `#app`.
- Uses `history.pushState` and `popstate` to keep URL and rendered page in sync.
- Renders `NotFoundPage` for unknown routes.

## Dependencies

- Page modules under `src/pages/*`.
- `NotFoundPage` from `src/pages/404/not_found_page`.
- Browser APIs: `history`, `location`, and DOM event delegation.

## Notes

- Only same-origin, plain left-click anchors without query/hash are intercepted.
- Existing anchor `href` values are preserved for progressive behavior.

## Tests

- Verifies path normalization keeps `/` and trims trailing slashes for other routes.
- Verifies click interception allows same-origin plain anchor clicks.
- Verifies links with query/hash are ignored and left to native navigation.
