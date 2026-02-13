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

## Dependencies

- `virtual:pwa-register` for SW registration.

## Notes

- Uses a 10-minute polling interval for update checks.
- Avoids prompting while offline and retries when back online.

## Tests

- Covers update event dispatch, offline handling, and periodic checks.
