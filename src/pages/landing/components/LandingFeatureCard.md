# LandingFeatureCard

## Overview

LandingFeatureCard renders a reusable feature block with media, label, title,
description, and a CTA link. It is used on the landing page for feature
previews.

## Template Structure

- Media slot with placeholder image.
- Content stack with label, title, and description.
- CTA link aligned to the edge.

## Data Flow

1. `LandingFeatureCard()` clones the template.
2. Text fields and link attributes are populated from options.
3. If `mediaSrc` is provided, an image is appended and the skeleton layer is
   removed.

## Dependencies

- Template: `src/pages/landing/components/LandingFeatureCard.html`.

## Notes

- The media area renders a shimmer placeholder until `mediaSrc` is provided.
