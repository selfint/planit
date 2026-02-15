# ConsoleNav

## Overview

ConsoleNav renders the primary app navigation for internal console pages. It is
used on all routes except the landing page and 404 page.

## Template Structure

- Home link with logo icon and optional `Title.svg` wordmark on wider screens.
- Main text links for catalog and plan.
- Icon-only actions for search and login.

## Data Flow

1. `ConsoleNav()` clones the HTML template and validates required nodes.
2. The logo image and title SVG use references are populated from assets.
3. `activePath` controls visual active states for matching navigation links.

## Dependencies

- Assets: `src/assets/logo.webp`, `src/assets/Title.svg`.
- Template: `src/components/ConsoleNav.html`.

## Notes

- Search and login links stay icon-only and use `aria-label` for accessibility.
- The title wordmark is hidden on narrow screens to preserve space.
