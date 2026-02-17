# DegreePicker

## Overview

Provides catalog, faculty, program, and path selection and renders program requirements scoped to the selected path.

## Template Structure

- Selection block with four stacked selects (catalog, faculty, program, path) and status text.
- Requirements table that lists course-bearing requirement nodes with a breadcrumb-style label.

## Data Flow

1. `DegreePicker(stateManagement)` loads all catalogs through `stateManagement.catalogs.getCatalogs()` and reads the last active selection via `stateManagement.requirements.getActiveSelection()`.
2. The component registers `initCatalogSync(...)` so catalog refreshes trigger a full picker reload from local IndexedDB.
3. Catalog picker options are built from the catalog IDs stored in IndexedDB. The selected catalog drives the available faculty list and enables the faculty picker.
4. Faculty picker options are built from the selected catalog’s top-level keys (excluding label keys), and the picker stays disabled if no faculty keys exist.
5. Program picker options are built from the selected faculty’s keys (excluding label keys), and the picker stays disabled until a valid faculty is selected.
6. When the program changes, the component clears the stored path, disables downstream state, and calls `stateManagement.requirements.sync(...)` to fetch the program requirements file.
7. Requirements are hydrated via `stateManagement.requirements.getRequirement(...)`; if requirements are missing, the table shows a missing-state message.
8. Path options are detected from the top-level requirements nodes whose `en` label includes “path”.
9. The path picker is always visible. It is disabled and shows the empty placeholder when no path options exist.
10. If paths exist, the path picker is required and the table shows a prompt until a path is selected.
11. Selecting a path persists `requirementsActivePath` and filters the requirements tree to the selected path’s nested nodes plus elective nodes ("elective" in `en`).
12. The table renders only requirement nodes that contain courses, using a space-separated breadcrumb label built from ancestor nodes.
13. If a selected path contains no course-bearing nodes, the table shows an empty-path message.

## Dependencies

- `src/lib/catalogSync.ts`
- `src/lib/requirementsUtils.ts`
- `src/lib/stateManagement.ts`

## Notes

- The path picker is always visible; it disables with a message when no paths exist.
- The table renders only requirement nodes that contain courses, using a space-separated path label.
- This component is route-scoped to catalog flows and lives under
  `src/pages/catalog/components`.
