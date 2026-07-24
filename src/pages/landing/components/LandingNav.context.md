# LandingNav

## Overview

LandingNav renders the landing page header with the logo and primary section
links.

## Template Structure

- Logo block with brand name and subtitle.
- Navigation links for key landing destinations.

## Data Flow

1. `LandingNav()` clones the HTML template.
2. The logo image source (`data-logo`) is set from `logo.webp`.
3. The title `<use>` href (`data-title-use`) is set from the SVG asset URL.
4. Both menu toggle buttons (`data-action="toggle-menu"`) control visibility of
   the mobile menu (`data-role="mobile-menu"`) and update `aria-expanded`.

## Dependencies

- Template: `src/pages/landing/components/LandingNav.html`.

## Notes

- Mobile menu behavior is handled in this component and does not depend on the
  landing page wrapper.
- This component is route-scoped to the landing page and lives under
  `src/pages/landing/components`.
- Rendering now clones from a cached parsed template root and resolves key nodes via precomputed selector paths, so HTML and selector parsing happens once.
