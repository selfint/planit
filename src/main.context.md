# main

## Overview

Application bootstrap entrypoint. It initializes optional dev seeding, online-only
Firebase preload with a temporary loading overlay, routing, PWA update handling,
and startup data sync orchestration while keeping startup resilient.

## Data Flow

1. Loads global styles.
2. In dev with seeded payload key, runs `initDevSync()` first.
3. If online, mounts `AppLoadingScreen.html`, awaits `preloadFirebase()`, then
   removes the loading overlay.
4. If offline, skips loading overlay and Firebase preload wait.
5. Initializes SPA routing (`initRouter()`).
6. Appends `PwaUpdateToast()` to `document.body` so update prompts can be shown
   from anywhere in the app.
7. Starts PWA registration/update checks (`initPWA()`).
8. Starts background data refresh (`initCourseSync()`, `initCatalogSync()`).

## Business/User Flow Rationale

- Online users see a short auth-bootstrap loading state before app shell render so
  auth controls are ready on first paint.
- Offline users are not blocked by auth bootstrap and enter the app immediately.
- In development/e2e runs, local payload seeding allows deterministic IndexedDB state while still exercising the normal state provider path.
- Runtime network sync remains available when dev payload is not configured.
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
