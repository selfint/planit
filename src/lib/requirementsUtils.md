# requirementsUtils

## Overview

Helpers for detecting requirement paths, filtering by selected path, and counting courses.

## Exports

- `detectPathOptions(root)`: Return top-level path nodes (`en` includes "path").
- `buildPathOptions(root)`: Convert path nodes into picker options.
- `filterRequirementsByPath(root, selectedPath)`: Return selected path requirements plus elective nodes (`en` includes "elective").
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

- Electives are detected by `en` containing "elective" to match degree-planner rules.

## Tests

- `src/lib/requirementsUtils.test.ts`
