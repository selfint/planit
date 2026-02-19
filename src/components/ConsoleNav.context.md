# ConsoleNav

## Overview

ConsoleNav renders the primary app navigation for internal console pages. It is
used on all routes except the landing page and 404 page.

## Template Structure

- Home link with logo icon and optional `Title.svg` wordmark on wider screens.
- Main text links for catalog and plan.
- Icon-only action for search.
- Auth actions: icon-only login/logout buttons (`data-login`, `data-logout`).

## Data Flow

1. `ConsoleNav()` clones the HTML template and validates required nodes.
2. The logo image and title SVG use references are populated from assets.
3. `activePath` controls visual active states for matching navigation links.
4. Auth controls are bound to `state.firebase.login/logout`.
5. Visibility of login/logout buttons follows `state.firebase.getUser()` and
   `onUserChange` subscription updates.

## Dependencies

- Assets: `src/assets/logo.webp`, `src/assets/Title.svg`.
- Template: `src/components/ConsoleNav.html`.
- State/Auth: `src/lib/stateManagement.ts`, `src/lib/firebase.ts`.

## Notes

- The search link stays icon-only and uses `aria-label` for accessibility.
- The title wordmark is hidden on narrow screens to preserve space.
- Auth button state is updated in-place without route refresh.
