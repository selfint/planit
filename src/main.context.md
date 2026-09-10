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
   `planit:dev-state` in localStorage), mounts `AppLoadingScreen.html` and starts
   `syncCatalogs`, `syncCourseData`, and `preloadFirebase` in parallel.
6. The loading overlay now updates with a message + progress bar +
   downloaded-bytes/total-bytes text while startup dataset downloads stream.
7. Removes the loading overlay after preload/sync finishes.
8. If offline, or if seeded dev payload is present, skips startup online preload.
9. Initializes SPA route rendering (`initRendering()`).
10. Appends `PwaUpdateToast()` to `document.body` so update prompts can be shown
   from anywhere in the app.

## Business/User Flow Rationale

- Online users see a startup loading state that now explains *what* is happening
  (auth warmup vs. courses/catalog downloads) and *how far* downloads progressed,
  reducing uncertainty on large payload networks.
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
- Progress math is UI-only and based on streamed network bytes from sync modules.

## Tests/Specs Role

- `src/pages/**/*.spec.ts` and page tests indirectly validate that app startup completes and loading overlays do not persist after hydration.
- No dedicated `main.ts` unit test currently exists; startup behavior is exercised through integration-style page specs.
