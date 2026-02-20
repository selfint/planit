# requirementsUtils

## Overview

Helpers for detecting requirement paths, filtering by selected path, and counting courses.

## Exports

- `detectPathOptions(root)`: Return top-level path nodes (`he` includes "מסלול" or "נתיב", or contains "path"; `en` fallback kept for compatibility).
- `buildPathOptions(root)`: Convert path nodes into picker options.
- `filterRequirementsByPath(root, selectedPath)`: Return selected path requirements plus elective nodes (`he` includes "בחירה", with `en` fallback).
- `countUniqueCourses(node)`: Count unique course codes recursively.
- `getRequirementLabel(node, fallback)`: Prefer `he`, then `en`, then fallback.
- `getRequirementId(node)`: Prefer `name`, then `en`.
- `RequirementNode`, `PathOption`: Data shapes used by the helpers.

## Data Flow

- Filters requirement trees based on selected path and elective node rules.
- Traverses nested requirements to count unique courses.

## Dependencies

- None (pure helpers).

## Notes

- Primary matching now uses generated `he` labels from SAP `he` requests (which may include EN fallback): `"מסלול"`/`"נתיב"`/`"path"` for paths and `"בחירה"` for elective groups.
- English matching remains as a fallback for compatibility with older snapshots and tests.

## Tests

- Detects path options from top-level nested entries.
- Filters requirements to selected path and appends elective nodes.
- Returns empty nested when a selected path has no requirements.
- Counts unique courses recursively across nested requirements.
