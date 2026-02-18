# pwa

## Overview

Registers the service worker and manages update prompts for the PWA.

## Exports

- `PWA_UPDATE_EVENT`: Custom event name for update availability.
- `UpdateSW`: Type for the service worker update callback.
- `initPWA()`: Register the service worker and wire update checks.

## Data Flow

- Registers the service worker on window load.
- Tracks update availability and defers updates while offline.
- Emits `PWA_UPDATE_EVENT` once per update and rechecks periodically.
- In `src/main.ts`, `initPWA()` is started alongside course/catalog sync so shell
  update checks and data sync run in parallel on startup.

## Dependencies

- `virtual:pwa-register` for SW registration.

## Notes

- Uses a 10-minute polling interval for update checks.
- Avoids prompting while offline and retries when back online.
- Uses prompt-style updates (`registerType: 'prompt'`) so refresh is user-driven.
- Vite PWA Workbox config keeps `clientsClaim: true` and `skipWaiting: false`
  (`vite.config.ts`) to avoid forcing immediate activation without user action.

## Tests

- Covers update event dispatch, offline handling, and periodic checks.
