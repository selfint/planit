# Landing Page

## Overview

The landing page is the `/` route. It introduces Planit and routes users into
core planner flows.

## Page Contents

- `LandingNav` header component with desktop links and mobile menu toggle.
- `LandingHero` section with headline, summary, and primary/secondary CTAs.
- Hero video placeholder block with skeleton state.
- Feature grid composed from five `LandingFeatureCard` instances.
- Final CTA section linking to `/plan` and `/catalog`.

## Data Flow

1. `LandingPage()` clones the template and mounts `LandingNav` and `LandingHero`.
2. Feature hosts (`data-landing-feature-card`) are replaced with
   `LandingFeatureCard(...)` instances using local static feature data.
3. Media containers are marked with `data-video-ready="false"` for future lazy
   media loading behavior.

## Unit Tests

- `landing_page.test.ts`: verifies page root renders and key mounted regions are present.
- `landing_page.test.ts`: verifies feature hosts are replaced with five rendered
  feature cards and expected route links.

## Integration Tests

- `landing_page.spec.ts`: verifies `/` renders hero/navigation sections and key
  CTA links.
