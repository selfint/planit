# LandingHero

## Overview

LandingHero renders the landing page hero section with the primary message,
call-to-action buttons, and summary copy.

## Template Structure

- Badge, title, summary, and CTA buttons.
- Primary CTA link to `/plan` and secondary CTA link to `/semester`.

## Data Flow

1. `LandingHero()` clones the HTML template and returns the root element.

## Dependencies

- Template: `src/pages/landing/components/LandingHero.html`.

## Notes

- The component is template-only and currently has no runtime event wiring.
- This component is route-scoped to the landing page and lives under
  `src/pages/landing/components`.
- Rendering now clones from a cached parsed template root, eliminating repeated template parsing for each mount.
