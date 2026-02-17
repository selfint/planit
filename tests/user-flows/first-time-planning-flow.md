# First-time planning flow

## get started -> catalog -> course -> plan -> semester

Verifies the first-time guided journey for a new user:

1. From landing, the primary get-started action opens the catalog.
2. User picks degree selections in catalog.
3. User opens course `03240033` from catalog by default (or
   `PW_DEMO_COURSE_CODE` when provided) and adds it to wishlist.
4. User goes to plan page and moves the selected course from wishlist to
   semester 1.
5. User clicks the first semester and lands on `/semester?number=1`.

This flow validates the intended onboarding progression and confirms persisted
wishlist-to-plan behavior across routes.

## demo recording

- Run `pnpm integtest:demo` to record a slower demo video with a large visible
  cursor and click-expand animation.
- Run `pnpm landing:demo-video` to record and publish the latest flow demo to
  `src/assets/first-time-planning-flow-demo.webm` for landing page usage.
- Demo mode is enabled via `PW_DEMO=on` and sets single-worker execution,
  higher-resolution capture, visible pointer movement before clicks, and slower
  pacing (without trace).
- Publish does not force a custom FPS in ffmpeg. Output cadence is preserved
  from Playwright recording; publish only rescales and recompresses.
- Optional tuning:
    - `PW_SLOWMO=650` for slower click/input pacing.
    - `PW_DEMO_STEP_PAUSE_MS=1100` for longer pauses between major steps.
    - `PW_DEMO_MAJOR_STEP_PAUSE_MULTIPLIER=1.8` for extra pause after
      navigation-heavy transitions.
    - `PW_VIDEO_WIDTH=2560 PW_VIDEO_HEIGHT=1440` for higher output resolution.
    - `PW_DEMO_COURSE_CODE=03240033` to override the default course code.
    - `PW_DEMO_PUBLISH_CRF=28` for sharper publish output (larger file).

### acceptance checks

- Pointer is visibly over targets before click ripple appears.
- Major route transitions have enough pause for readability.
- Landing demo either renders video or shows an explicit fallback message.
- Published file remains visually sharp without adding frame-rate artifacts.
