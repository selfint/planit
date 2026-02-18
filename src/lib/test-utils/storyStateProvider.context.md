# storyStateProvider

## Overview

Builds Storybook/test-friendly `StateProvider` objects with safe defaults.
Callers can override only the slices/methods they need, while all missing
methods resolve to `undefined` (or no-op for `set`).

## Exports

- `createStoryStateProvider(overrides?)`: returns a complete `StateProvider`
  with defaults plus any provided overrides.
- `StoryStateProviderOverrides`: nested partial type for `StateProvider`
  overrides by slice.

## Data Flow

- Initializes a full provider contract with fallback methods.
- Applies overrides per slice (`courses`, `catalogs`, `requirements`,
  `userDegree`, `userPlan`).
- Returns a provider that can be passed to `state.provider.set(...)`.

## Dependencies

- `src/lib/stateManagement.ts` (`StateProvider` type)

## Notes

- Default `set` methods are no-op and resolve immediately.
- Default getter/query methods resolve to `undefined` so stories/tests can opt in
  only to behavior under test.
- This utility is currently adopted in multiple stories, including Plan,
  Semester, Search, DegreePicker, and Catalog page stories.

## Tests

- `returns undefined defaults for missing overrides`: verifies fallback behavior
  for omitted slices/methods.
- `uses provided overrides and keeps other defaults`: verifies override
  application while untouched slices keep fallback behavior.
