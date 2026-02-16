# PwaUpdateToast

## Overview

Global PWA update toast mounted once from `src/main.ts`.

It listens for the `planit:pwa-update` event and allows the user to
explicitly apply the service worker update.

## Behavior

- Hidden by default.
- Shows when a `planit:pwa-update` event is dispatched with `detail.updateSW`.
- Calls `updateSW(true)` only when the user clicks the apply button.
- Dismiss button hides the toast without applying the update.

## Files

- `src/components/PwaUpdateBanner.ts`
- `src/components/PwaUpdateBanner.html`
- `src/components/PwaUpdateBanner.stories.ts`
- `src/components/PwaUpdateBanner.test.ts`
