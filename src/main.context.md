# main

## Overview

Application bootstrap entrypoint. It initializes routing, PWA update handling,
and background dataset sync while keeping startup resilient.

## Data Flow

1. Loads global styles.
2. Initializes SPA routing first (`initRouter()`), so the shell can render
   immediately.
3. Appends `PwaUpdateToast()` to `document.body` so update prompts can be shown
   from anywhere in the app.
4. Starts PWA registration/update checks (`initPWA()`).
5. Starts course and catalog sync (`initCourseSync()`, `initCatalogSync()`).
6. Wraps startup in a `try/catch` and logs failures instead of crashing without
   diagnostics.

## Business/User Flow Rationale

- Users should see route UI immediately, even if network sync is slow or offline.
- Dataset refresh runs in background so search/planner/catalog views can keep
  using cached IndexedDB data.
- PWA updates are surfaced with explicit user confirmation via toast instead of
  forcing sudden reloads.

## Dependencies

- `src/lib/router.ts`
- `src/components/PwaUpdateToast.ts`
- `src/lib/pwa.ts`
- `src/lib/courseSync.ts`
- `src/lib/catalogSync.ts`

## Notes

- This file intentionally keeps orchestration shallow; domain logic stays in
  `src/lib/*` modules.
