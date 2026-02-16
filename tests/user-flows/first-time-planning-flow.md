# First-time planning flow

## get started -> catalog -> course -> plan -> semester

Verifies the first-time guided journey for a new user:

1. From landing, the primary get-started action opens the catalog.
2. User picks degree selections in catalog.
3. User opens hardcoded course `03240033` and adds it to wishlist.
4. User goes to plan page and moves course `03240033` from wishlist to semester 1.
5. User clicks the first semester and lands on `/semester?number=1`.

This flow validates the intended onboarding progression and confirms persisted
wishlist-to-plan behavior across routes.

## demo recording

- Run `pnpm integtest:demo` to record a slower demo video with a large visible
  cursor and click-expand animation.
- Demo mode is enabled via `PW_DEMO=on` and sets single-worker execution,
  `slowMo`, `video=on`, and `trace=on` for readability.
