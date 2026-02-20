# main

## Overview

Application bootstrap entrypoint. It initializes optional dev seeding, performs
an online-only startup preload (Firebase + catalogs/courses sync) behind a
temporary loading overlay, then mounts routing and PWA update handling.

## Data Flow

1. Loads global styles.
2. In dev with seeded payload key, runs `initDevSync()` first.
3. Starts PWA registration/update checks (`initPWA()`).
4. Initializes router navigation interception (`initRouterNavigationInterception()`)
   before any startup waits. This wires `popstate`/anchor interception, restores
   any session redirect path, and registers route rerendering on state-provider
   swaps.
5. If online and not running with seeded dev payload (`import.meta.env.DEV` +
   `planit:dev-state` in localStorage), mounts `AppLoadingScreen.html`, awaits
   `preloadFirebase()`, then awaits one-time startup sync for
   `courseData.json` and `catalogs.json`.
6. Removes the loading overlay after preload/sync finishes.
7. If offline, or if seeded dev payload is present, skips startup online preload.
8. Initializes SPA route rendering (`initRendering()`).
9. Appends `PwaUpdateToast()` to `document.body` so update prompts can be shown
   from anywhere in the app.

## Business/User Flow Rationale

- Online users see a short startup loading state before app shell render so auth
  and required catalogs/courses data are ready on first paint.
- Offline users are not blocked by auth bootstrap and enter the app immediately.
- In development/e2e runs with seeded payload, startup network sync is skipped so tests use deterministic IndexedDB fixtures and avoid unnecessary blocking network work.
- PWA updates are surfaced with explicit user confirmation via toast instead of forcing sudden reloads.

## Dependencies

- `src/lib/router.ts`
- `src/components/PwaUpdateToast.ts`
- `src/components/AppLoadingScreen.html`
- `src/lib/firebase.ts`
- `src/lib/pwa.ts`
- `src/lib/courseSync.ts`
- `src/lib/catalogSync.ts`
- `src/lib/test-utils/devSync.ts`

## Notes

- This file intentionally keeps orchestration shallow; domain logic stays in `src/lib/*` modules.
