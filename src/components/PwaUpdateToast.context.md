# PwaUpdateToast

## Overview

Global PWA update toast mounted once from `src/main.ts`.

It listens for the `planit:pwa-update` event and allows the user to
explicitly apply the service worker update.

## Behavior

- Hidden by default.
- Shows when a `planit:pwa-update` event is dispatched with `detail.updateSW`.
- Calls `updateSW(true)` only when the user clicks the apply button.
- In development mode, the toast is always visible for quick verification.

## Files

- `src/components/PwaUpdateToast.ts`
- `src/components/PwaUpdateToast.html`
- `src/components/PwaUpdateToast.stories.ts`
- `src/components/PwaUpdateToast.test.ts`
- Rendering now clones from a cached parsed template root and uses precomputed selector paths for toast/button lookup.
- `PwaUpdateToast.test.ts` validates toast visibility and apply-action wiring so refactors to template lookup remain behavior-safe.
