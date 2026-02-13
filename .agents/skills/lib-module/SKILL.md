---
name: lib-module
description: Use whenever a src/lib module is created or edited. Ensure the module has .ts, .test.ts, and .md files, and document it with adjacent .md using a standard format.
---

# Lib Module

## Overview

Document each `src/lib` module with a concise Markdown file next to it. Use a consistent format that explains purpose, exports, data flow, dependencies, notes, and tests.

Directory structure per module:

- `src/lib/<Module>.ts`
- `src/lib/<Module>.test.ts`
- `src/lib/<Module>.md`

## Workflow

1. Identify the `src/lib` module file(s) that need documentation.
2. Create `src/lib/<Module>.md` next to each module file.
3. Use the standard format and keep it short and technical.
4. Do not create any `.md` files for tests.

## Standard Format

```markdown
# <ModuleName>

## Overview

Short summary of the module's responsibilities.

## Exports

- List exported functions/types with a brief purpose.

## Data Flow

- Key steps and side effects (storage, network, etc.).

## Dependencies

- Internal modules or external APIs used.

## Notes

- Gotchas, constraints, or design choices.

## Tests

- Describe what the module tests cover and the behaviors they validate.
```
