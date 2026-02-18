# testWithDevState

## Purpose

This module re-exports Playwright `test` and `expect` while automatically
injecting deterministic dev state before each test.

## Usage

Replace:

`import { expect, test } from '@playwright/test';`

With:

`import { expect, test } from '<path>/tests/helpers/testWithDevState';`

## Behavior

- Runs `setDevState(page, createDefaultDevStateSnapshot())` in `beforeEach`.
- Ensures route/user-flow specs do not depend on persistent IndexedDB leftovers
  or remote sync timing.
