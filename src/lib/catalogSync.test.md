# catalogSync.test

## Overview

Unit tests for catalog sync behavior and metadata handling.

## Exports

- None.

## Data Flow

- Mocks network and metadata to verify skip/update cases.
- Verifies that catalogs are stored and metadata is updated on sync.

## Dependencies

- `src/lib/catalogSync.ts`
- `src/lib/indexeddb.ts`

## Notes

- Uses Vitest to simulate online/offline and response scenarios.

## Tests

- This file.
