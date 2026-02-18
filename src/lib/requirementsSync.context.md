# requirementsSync

## Overview

Fetches program requirements and stores them in IndexedDB with copy-on-write replacement and explicit active-selection persistence controls.

## Exports

- `getActiveRequirementsSelection()`: Load last active catalog/faculty/program/path from meta.
- `setActiveRequirementsPath(path)`: Persist the selected path to meta.
- `setActiveRequirementsSelection(selection)`: Persist active catalog/faculty/program/path together.
- `syncRequirements(selection, options?)`: Fetch and store requirements for a program.
- `RequirementsSelection`: Selection payload for requirements fetches.
- `RequirementsSyncResult`: Status result for a sync attempt.

## Data Flow

- Reads previous program ID from meta for COW replacement.
- Fetches `requirementsData.json` for the selected program.
- Stores requirements via `replaceRequirementsWithCow()` with optional active meta persistence.
- Persists `requirementsLastSync` timestamp only after a successful sync.

## Dependencies

- `src/lib/indexeddb.ts` for meta and requirements storage.
- Data endpoint serving `requirementsData.json` files (default: `https://tom.selfin.io/planit/_data`).
- `VITE_DATA_BASE_URL` environment variable to override the default endpoint.

## Notes

- Returns `offline` when the browser is offline.
- Leaves previous requirements intact on fetch failure.
- `syncRequirements(..., { persistActiveSelection: false })` keeps active selection meta unchanged while still updating requirement payload data.
- `setActiveRequirementsSelection()` is the preferred way to commit picker state only after selection completeness checks.

## Tests

- Returns `offline` and avoids fetch calls when `navigator.onLine` is false.
- Stores requirements with COW replacement and updates sync metadata.
- Verifies COW write arguments include path and active-selection persistence flag.
