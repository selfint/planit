---
name: lib-module
description: Document src/lib modules with adjacent .md files using a standard format. Use when asked to add or update documentation for lib module files, or whenever any file in src/lib is changed or added.
---

# Lib Module

## Overview

Document each `src/lib` module with a concise Markdown file next to it. Use a consistent format that explains purpose, exports, data flow, dependencies, notes, and tests.

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

- Point to the related test file(s).
```

## Directory Contract

- `src/lib/<Module>.ts`
- `src/lib/<Module>.test.ts`
- `src/lib/<Module>.md`
