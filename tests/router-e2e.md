# SPA router behavior

## intercepts internal links with query and hash without reload

Verifies that clicking an internal link like `/search?q=algo#top` is handled by
the client router (SPA navigation) rather than causing a full page reload.

The test also sets a marker on `window` before navigation and confirms it still
exists after the click, proving the JS runtime was not restarted by a hard
navigation.

## restores deep-link from session storage on boot

Verifies GitHub Pages deep-link recovery behavior by pre-populating
`sessionStorage` with `planit:redirect-path`, reloading, and asserting that the
router restores `pathname`, `search`, and `hash`.

The test also confirms the redirect key is removed after restoration.

## keeps same-page hash navigation native and scrolls to target

Verifies that same-page hash links are not hijacked by the SPA router.

The test adds a long page and an anchor target, clicks `#native-anchor-target`,
then asserts both hash update and page scroll happened through native browser
anchor behavior.
