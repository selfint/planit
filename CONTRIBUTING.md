# Contributing

Thanks for helping improve Planit. This guide focuses on code style and linting.

## Code Style (Source of Truth)

- ESLint rules in `eslint.config.js` are the source of truth.
- Format and lint before submitting changes, run `pnpm format` and `pnpm lint`.

## TypeScript Style

- Use explicit return types for exported functions.
- No `any`, no non-null assertions, and no floating promises.
- Prefer `type` over `interface` for object shapes.

## Explicit Checks (Nullable Values)

We avoid implicit truthy/falsey checks for nullable values. For non-nullable booleans, use direct boolean checks.

Do:

- `if (element === null) { ... }`
- `if (element !== null) { ... }`
- `if (value === undefined) { ... }`
- `if (!flag) { ... }` for non-nullable booleans

Avoid:

- `if (!element) { ... }`
- `if (value) { ... }` for nullable values
- `if (!!value) { ... }`
- `if (flag === false) { ... }` for non-nullable booleans

## Tailwind CSS v4

- Use Tailwind utilities for all UI styling.
- No raw CSS unless Tailwind cannot express it.
- Keep custom utilities in v4 format using `@utility`.
- Use `@import "tailwindcss";` in CSS instead of v3 `@tailwind` directives.

## Linting

Run formatting and linting before pushing. If unsure, run:

```bash
pnpm format
pnpm lint
```
