# LandingNav

## Overview

LandingNav renders the landing page header with the logo and primary section
links.

## Template Structure

- Logo block with brand name and subtitle.
- Navigation links for key landing destinations.

## Data Flow

1. `LandingNav()` clones the HTML template and returns the root element.

## Dependencies

- Template: `src/pages/landing/components/LandingNav.html`.

## Notes

- The logo image is populated by the landing page wrapper via
  `data-placeholder="logo"`.
