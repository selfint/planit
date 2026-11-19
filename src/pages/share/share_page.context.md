# Share Page

## Overview

The share page enables students to export their local planner state to a compact link and import a shared plan back into local storage. It supports collaboration and device migration without requiring backend synchronization.

## Page Contents

- Header with a short explanation of sharing/importing plans.
- "Create share link" section that generates a URL containing an encoded plan payload.
- "Import plan" section that accepts either a full share URL or a raw encoded payload.
- Inline status messages for creation/import success.

## Data Flow

1. The page reads the current user plan via `state.userPlan.get()`.
2. On export, the plan payload is JSON serialized, base64 encoded, and written into `/share?plan=...`.
3. On import, input is parsed either as URL query param or direct token, decoded, JSON parsed, and persisted through `state.userPlan.set(...)`.
4. Status text updates in-place so users can confirm actions immediately.

## Unit Tests

- Verifies share-link generation by clicking the export button and asserting the output contains `/share?plan=`.
- Verifies import flow by submitting an encoded payload and asserting `state.userPlan.set(...)` receives the decoded object.

## Integration Tests

- Verifies `/share` route rendering with both primary action buttons visible, confirming route wiring and baseline user access.
