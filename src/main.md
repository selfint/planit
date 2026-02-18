# main

## Overview

Application bootstrap entrypoint.

## Startup Sequence

1. Attempts to install a dev-memory state provider from
   `window.__PLANIT_DEV_STATE__` when running in Vite dev mode.
2. Initializes router and app-shell UI (including PWA update toast).
3. Initializes PWA registration.
4. Starts background catalog/course sync only when not using injected dev
   state.

## Why

The dev-state branch keeps end-to-end tests deterministic and independent from
persisted IndexedDB leftovers, while production startup keeps normal offline
sync behavior.
