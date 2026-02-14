# LandingHero

## Overview

LandingHero renders the landing page hero section with the primary message,
call-to-action buttons, status highlights, and a preview card placeholder.

## Template Structure

- Badge, title, summary, and CTA buttons.
- Three highlight tiles for offline status, sync, and focus.
- Preview media block with shimmer placeholder and a status chip.
- Two supporting metric cards.

## Data Flow

1. `LandingHero()` clones the HTML template and returns the root element.

## Dependencies

- Template: `src/pages/landing/components/LandingHero.html`.

## Notes

- The hero preview uses a shimmer placeholder until real assets are available.
