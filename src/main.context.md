# main

## Overview

Application bootstrap entrypoint. It initializes routing, PWA update handling, and startup data sync orchestration while keeping startup resilient.

## Data Flow

1. Loads global styles.
2. Initializes SPA routing first (`initRouter()`), so the shell can render immediately.
3. Appends `PwaUpdateToast()` to `document.body` so update prompts can be shown from anywhere in the app.
4. Starts PWA registration/update checks (`initPWA()`).
5. Starts data refresh logic:
   - In production: starts network sync (`initCourseSync()`, `initCatalogSync()`).
   - In development: runs `initDevSync()`; if no local dev payload is present, falls back to network sync.
6. Wraps startup in a `try/catch` and logs failures instead of crashing without diagnostics.

## Business/User Flow Rationale

- Users should see route UI immediately, even if sync work is slow or offline.
- In development/e2e runs, local payload seeding allows deterministic IndexedDB state while still exercising the normal state provider path.
- Runtime network sync remains available as fallback when dev payload is not configured.
- PWA updates are surfaced with explicit user confirmation via toast instead of forcing sudden reloads.

## Dependencies

- `src/lib/router.ts`
- `src/components/PwaUpdateToast.ts`
- `src/lib/pwa.ts`
- `src/lib/courseSync.ts`
- `src/lib/catalogSync.ts`
- `src/lib/devSync.ts`

## Notes

- This file intentionally keeps orchestration shallow; domain logic stays in `src/lib/*` modules.
