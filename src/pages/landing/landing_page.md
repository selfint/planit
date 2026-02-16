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

- `renders mounted page regions`: calls `LandingPage()` with mocked
  `LandingNav`/`LandingHero` factories and asserts mounted region markers exist.
- `replaces feature hosts with five feature cards`: calls `LandingPage()` with
  mocked `LandingFeatureCard`, then asserts exactly five cards were mounted and
  their captured `href` values match expected route links.

## Integration Tests

- `renders hero and navigation actions`: navigates to `/` and asserts
  `LandingNav` and `LandingHero` containers are visible, then asserts
  `/plan` and `/catalog` CTA anchors are present in the DOM.
