# UpdateBanner

## Overview

UpdateBanner shows a PWA update prompt when a new service worker version is
available. It listens for the update event and displays a call-to-action button
that triggers the update flow.

## Template Structure

- Status section with update copy and an accent action button.

## Data Flow

1. `UpdateBanner()` clones the HTML template and caches the action button.
2. The banner only mounts when a `PWA_UPDATE_EVENT` arrives.
3. Clicking the action disables the button, updates the label, and invokes the
   provided `updateSW` function.
4. In dev mode, a mock update function is used to test the UI.

## Dependencies

- PWA updates: `$lib/pwa` (`PWA_UPDATE_EVENT`, `UpdateSW`).
- Template: `src/components/UpdateBanner.html`.

## Notes

- The banner is appended to a host wrapper only when an update is available.
- The action button uses the `data-update-action` hook.
