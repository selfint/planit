# router

## Overview

Provides client-side SPA route rendering and internal link interception.

## Exports

- `normalizePath(pathname)`: Normalizes route paths by trimming trailing slashes.
- `shouldHandleClickNavigation(event)`: Decides if a click should be handled by the SPA router.
- `REDIRECT_SESSION_KEY`: Session storage key used for GitHub Pages deep-link recovery.
- `initRouter()`: Initializes initial render, history handling, and delegated link navigation.

## Data Flow

- Reads `window.location.pathname` on startup.
- Restores deep-link route from session storage when arriving through `404.html` fallback.
- Resolves route path to a page factory and renders into `#app`.
- Uses `history.pushState` and `popstate` to keep URL and rendered page in sync.
- Renders `NotFoundPage` for unknown routes.

## Dependencies

- Page modules under `src/pages/*`.
- `NotFoundPage` from `src/pages/404/not_found_page`.
- Browser APIs: `history`, `location`, and DOM event delegation.

## Notes

- Same-origin, plain left-click anchors are intercepted, including query/hash URLs.
- Same-page hash-only links are left to native browser scrolling behavior.
- Existing anchor `href` values are preserved for progressive behavior.

## Tests

- Verifies path normalization keeps `/` and trims trailing slashes for other routes.
- Verifies click interception allows same-origin plain anchor clicks.
- Verifies links with query/hash are handled by the SPA router.
- Verifies redirected deep-link paths are restored from session storage on init.
