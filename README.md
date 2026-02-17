# planit

## Playwright workflow

Free mobile confidence (no paid device cloud):

```bash
# Full desktop suite
pnpm integtest:desktop

# Mobile smoke suite using Playwright's Pixel 5 emulation
pnpm integtest:mobile
```

CI runs both suites and uploads Playwright artifacts (`test-results`,
`playwright-report`) automatically when a test fails.

Recording tests (codegen):

```bash
pnpm dev --host
pnpm pw:codegen
```

Running tests with video capture:

```bash
pnpm integtest:video
```

Optimizing recorded videos for embedding:

```bash
pnpm optimize:videos
```

Notes:

- Optimized videos are written to `public/tutorials/` so Vite serves them as static assets.
- You can tweak encoding with env vars: `PW_VIDEO_WIDTH`, `PW_VIDEO_CRF`, `PW_VIDEO_AUDIO_BITRATE`.
