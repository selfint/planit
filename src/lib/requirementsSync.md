# requirementsSync

## Overview

Fetches program requirements and stores them in IndexedDB with copy-on-write replacement and selection metadata.

## Exports

- `getActiveRequirementsSelection()`: Load last active catalog/faculty/program/path from meta.
- `setActiveRequirementsPath(path)`: Persist the selected path to meta.
- `syncRequirements(selection)`: Fetch and store requirements for a program.
- `RequirementsSelection`: Selection payload for requirements fetches.
- `RequirementsSyncResult`: Status result for a sync attempt.

## Data Flow

- Reads previous program ID from meta for COW replacement.
- Fetches `requirementsData.json` for the selected program.
- Stores the new requirements and metadata via `replaceRequirementsWithCow()`.

## Dependencies

- `src/lib/indexeddb.ts` for meta and requirements storage.
- GitHub raw endpoint for requirements data.

## Notes

- Returns `offline` when the browser is offline.
- Leaves previous requirements intact on fetch failure.

## Tests

- Returns `offline` and avoids fetch calls when `navigator.onLine` is false.
- Stores requirements with COW replacement and updates sync metadata.
