---
name: lib-module
description: Use whenever a src/lib module is created or edited. Ensure the module has .ts, .test.ts, and .context.md files, and document it with adjacent .context.md using a standard format.
---

# Lib Module

## Overview

Document each `src/lib` module with a concise context dump next to it. Use a consistent format that explains purpose, exports, data flow, dependencies, notes, and tests.

Directory structure per module:

- `src/lib/<Module>.ts`
- `src/lib/<Module>.test.ts`
- `src/lib/<Module>.context.md`

## Workflow

1. Identify the `src/lib` module file(s) that need documentation.
2. Create `src/lib/<Module>.context.md` next to each module file.
3. Use the standard format and keep it short and technical.
4. Do not create any `.context.md` files for tests.

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

- Provide a bullet for each test in `<Module>.test.ts`, explaining what it validates and how.
```

## Verification Script

Run the repository check script to ensure every lib module has the required
files:

`python3 .agents/skills/lib-module/scripts/verify_modules.py`
