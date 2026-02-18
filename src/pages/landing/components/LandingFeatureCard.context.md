# LandingFeatureCard

## Overview

LandingFeatureCard renders a reusable feature block with media, label, title,
description, and a CTA link. It is used on the landing page for feature
previews.

## Template Structure

- Media slot with a skeleton layer and optional image.
- Content stack with title and description.
- CTA link aligned to the edge.

## Data Flow

1. `LandingFeatureCard()` clones the template.
2. `title`, `description`, `href`, and `linkLabel` are populated from options.
3. Optional `label` is set only if a label slot exists in the template.
4. If `mediaSrc` is provided, an image is appended and the skeleton layer is
   removed.

## Dependencies

- Template: `src/pages/landing/components/LandingFeatureCard.html`.

## Notes

- The media area renders a shimmer placeholder until `mediaSrc` is provided.
- This component is route-scoped to the landing page and lives under
  `src/pages/landing/components`.
