# First-time user experience demo (FTUX)

## Purpose

This file documents the cinematic Playwright demo at
`tests/user-flows/first-time-user-experience.spec.ts`.

The goal is a recordable onboarding walkthrough that looks intentional in
video:

1. Landing -> catalog
2. Degree selection (catalog/faculty/program/path)
3. Open selected course (default `03240033`)
4. Add to wishlist (if action exists)
5. Go to plan
6. Move from wishlist to semester
7. Enter semester 1 and verify render + course presence

## Current run command

- Script: `pnpm demo:ftux`
- Current command value (from `package.json`):
  `pnpm build && PW_DEMO=on PW_VIDEO=on PW_SLOWMO=275 PW_DEMO_TIME_SCALE=0.5 PW_VIDEO_WIDTH=1400 PW_VIDEO_HEIGHT=1050 playwright test tests/user-flows/first-time-user-experience.spec.ts`

What this means:

- `pnpm build` runs before test.
- Playwright runs in demo mode (`PW_DEMO=on`) against preview server.
- Video capture is forced on.
- Resolution is `1400x1050` (4:3).
- Slow motion is reduced from classic demo values (`PW_SLOWMO=275`).
- Explicit test pauses are globally scaled to half (`PW_DEMO_TIME_SCALE=0.5`).
- On successful run, the spec saves the video directly to
  `src/assets/demos/first-time-user-experience.webm` via `video.saveAs(...)`.

## Playwright environment assumptions

From `playwright.config.ts`:

- Demo base URL: `http://localhost:4173/planit/`
- Non-demo base URL: `http://localhost:5173/planit/`
- Demo web server command: `pnpm preview --host`

Important implication:

- The FTUX spec uses `page.goto('')` intentionally so it follows configured
  `baseURL` in both demo and non-demo runs.
- Hardcoding `http://localhost:5173/...` breaks demo runs.

## Cinematic interaction model (how the demo is styled)

The spec intentionally avoids default instant UI interactions:

- Uses custom `humanClick(page, locator)` instead of direct click calls.
- Uses custom `humanMove(page, locator)` for visible pointer choreography.
- Injects visible cursor overlay with `installDemoCursor(page)`.
- Uses `pause(page, ms)` everywhere (scaled by `PW_DEMO_TIME_SCALE`).
- Uses `smoothScrollToLocator(page, locator)` before mouse movement.

### Why smooth scrolling needed special handling

`scrollIntoViewIfNeeded()` caused jumpy/invisible scroll in recordings.

Current behavior:

- `smoothScrollToLocator()` calls `scrollIntoView({ behavior: 'smooth' })`.
- It waits for scroll stability via requestAnimationFrame checks.
- This prevents click attempts while scroll animation is still in flight.

## Data and assertions in the flow

- Preferred course code source:
  `PW_DEMO_COURSE_CODE` -> fallback `03240033`
- The degree dropdown selections are set programmatically by choosing first
  non-empty option and dispatching `change`.
- Wishlist actions are guarded:
  if wishlist controls are absent, flow continues without failing.
- Semester render completion signal:
  waits for `[data-role="current-semester-title"]` containing `סמסטר`.

## Known fragile points

1. Catalog data readiness:
   if no visible course link for preferred code appears in time, navigation to
   course step fails.
2. UI conditional controls:
   wishlist add/move controls may not always render depending on state/data.
   The test handles this with count checks.
3. Timing changes:
   if pauses are reduced too much, route/assertion races can reappear.
4. Scroll choreography:
   removing scroll stabilization can cause clicks to happen before target is in
   stable viewport position.

## Tuning knobs for future editors

Use these env vars before editing logic:

- `PW_DEMO_TIME_SCALE`: scales all `pause()` durations.
  - `1` = original pacing
  - `0.5` = half pause duration
- `PW_SLOWMO`: Playwright interaction slow-motion
- `PW_VIDEO_WIDTH` and `PW_VIDEO_HEIGHT`: capture/viewport size in demo mode
- `PW_DEMO_COURSE_CODE`: alternate course to open from catalog

## Editing guardrails

1. Keep `page.goto('')` (baseURL-relative).
2. Keep `pause()` wrapper; do not scatter raw `waitForTimeout()` calls.
3. Keep smooth scroll stabilization in place before click/move.
4. If changing duration, adjust both:
   `PW_SLOWMO` (global interaction speed) and `PW_DEMO_TIME_SCALE`
   (authored pauses).
5. Re-run `pnpm demo:ftux` after any timing or interaction changes.

## Quick verification checklist

1. Pointer is visible in video from first interaction.
2. Scroll transitions are visible, not jump cuts.
3. Cursor press animation is visible on clicks.
4. Route sequence is preserved:
   landing -> catalog -> course -> plan -> semester.
5. Test still passes under `pnpm demo:ftux`.

## Related files

- Spec: `tests/user-flows/first-time-user-experience.spec.ts`
- Landing page binding: `src/pages/landing/landing_page.ts`
- Playwright config: `playwright.config.ts`
- Script definitions: `package.json`
