# StatusSidebar

## Overview

StatusSidebar renders a static sidebar with sync and offline storage status
cards. It is a template-only component with no runtime behavior.

## Template Structure

- Sync overview card with last refresh and network status.
- Offline storage card with IndexedDB status.

## Data Flow

1. `StatusSidebar()` clones the HTML template and validates the root.
2. No additional wiring or state is applied.

## Dependencies

- Template: `src/components/StatusSidebar.html`.
