# AppFooter

## Overview

AppFooter renders the bottom meta bar with a PWA status line and build
information. It pairs the template in `src/components/AppFooter.html` with
logic in `src/components/AppFooter.js`.

## Template Structure

- Left-aligned status line with an info dot.
- Right-aligned metadata row including the build identifier.

## Data Flow

1. `AppFooter()` clones the HTML template and validates the root.
2. The build label is set from the `__BUILD_SHA__` compile-time constant.

## Dependencies

- Build define: `__BUILD_SHA__`.
- Template: `src/components/AppFooter.html`.

## Notes

- The build label uses the `data-build-sha` hook.
