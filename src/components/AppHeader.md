# AppHeader

## Overview

AppHeader renders the top navigation header with the Planit logo, title lockup,
status chips, and primary section tabs. It pairs the template in
`src/components/AppHeader.html` with logic in `src/components/AppHeader.ts`.

## Template Structure

- Logo avatar and title lockup on the left.
- Status chip and action buttons on the right.
- Navigation row with primary section buttons.

## Data Flow

1. `AppHeader()` clones the HTML template and validates the root.
2. The logo image source is set from `logo.webp`.
3. The title container is filled with the inline SVG from `Title.svg` and the
   SVG gets a sizing class.

## Dependencies

- Assets: `src/assets/logo.webp`, `src/assets/Title.svg`.
- Template: `src/components/AppHeader.html`.

## Notes

- Uses `data-logo` and `data-title` hooks for asset injection.
