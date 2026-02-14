---
name: page-route
description: Build or update a route page under src/pages using a consistent 6-file contract per route basename (`<route>_page`). Use when creating a new page route, refactoring an existing page route, or adding stories/tests/docs for a page.
---

# Page Route

## Overview

Build each route page as six colocated files: `.html`, `.ts`, `.stories.ts`, `.spec.ts`, `.test.ts`, and `.md`.
Use a `<template>` in HTML, keep logic in TypeScript, and colocate both unit and integration tests in the page route directory.

## Workflow

1. Create or update page files under `src/pages/<route>/` with basename `<route>_page`.
2. Ensure these files exist together:
    - `src/pages/<route>/<route>_page.html`
    - `src/pages/<route>/<route>_page.ts`
    - `src/pages/<route>/<route>_page.stories.ts`
    - `src/pages/<route>/<route>_page.spec.ts`
    - `src/pages/<route>/<route>_page.test.ts`
    - `src/pages/<route>/<route>_page.md`
3. Put all markup and Tailwind classes in the HTML `<template>`.
4. Keep state, event wiring, and composition in the TS factory.
5. Use data attributes in HTML for TS hooks.
6. Export a page factory that returns a root element (for example, `LandingPage()`).
7. Add Storybook stories in `.stories.ts` with `Default` and `Dark` variants.
8. Add unit tests in `.test.ts` for rendering and page behavior.
9. Add Playwright integration tests in `.spec.ts` for route-level behavior.
10. Keep Playwright page specs colocated in `src/pages/<route>/`; reserve `tests/` for broader e2e flows.
11. Document the page in `.md` using the required documentation structure.

## Page Route Contract

- Naming:
    - Basename must be `<route>_page`.
    - All six files share the same basename.
- Location:
    - All six files are colocated in `src/pages/<route>/`.
- HTML:
    - Wrap page markup in one `<template>` root.
    - Keep structure and Tailwind-only styling in HTML.
- TypeScript:
    - Import HTML with `?raw`, clone template content, and return one root element.
    - Compose page-level components and route actions here.
- Unit test (`.test.ts`):
    - Validate template cloning, key render output, and local behavior.
- Integration test (`.spec.ts`):
    - Validate route availability and key user flows with Playwright.
- Docs (`.md`):
    - Must explain page contents, data flows, unit tests, and integration tests.

## Documentation File

Write `src/pages/<route>/<route>_page.md` in English with these sections:

```markdown
# <RouteName> Page

## Overview

What this page is for and where it sits in navigation.

## Page Contents

- Main sections and interactive regions.

## Data Flow

1. How data enters the page.
2. Which modules/services are called.
3. What updates the UI.

## Unit Tests

- Bullet for each test in `<route>_page.test.ts` and what it validates.

## Integration Tests

- Bullet for each scenario in `<route>_page.spec.ts` and expected behavior.
```

## Minimal File Pattern

Use this baseline unless the repo already has a stronger route pattern.

### <route>\_page.html

```html
<template>
    <main data-page="<route>" class="...">
        <h1 data-role="title" class="..."></h1>
        <section data-slot="content" class="..."></section>
    </main>
</template>
```

### <route>\_page.ts

```ts
import templateHtml from './<route>_page.html?raw';

export function RoutePage(): HTMLElement {
    const template = document.createElement('template');
    template.innerHTML = templateHtml;

    const templateElement = template.content.firstElementChild;
    if (!(templateElement instanceof HTMLTemplateElement)) {
        throw new Error('Route page template element not found');
    }

    const root = templateElement.content.firstElementChild?.cloneNode(true);
    if (!(root instanceof HTMLElement)) {
        throw new Error('Route page template root not found');
    }

    return root;
}
```

### <route>\_page.stories.ts

```ts
import type { Meta, StoryObj } from '@storybook/html';

import { RoutePage } from './<route>_page';

const meta: Meta = {
    title: 'Pages/RoutePage',
};

export default meta;

type Story = StoryObj;

export const Default: Story = {
    render: () => RoutePage(),
    globals: {
        theme: 'light',
    },
};

export const Dark: Story = {
    render: () => RoutePage(),
    globals: {
        theme: 'dark',
    },
};
```

### <route>\_page.test.ts

```ts
import { describe, expect, it } from 'vitest';

import { RoutePage } from './<route>_page';

describe('route page', () => {
    it('renders a root element', () => {
        const page = RoutePage();
        expect(page).toBeInstanceOf(HTMLElement);
    });
});
```

### <route>\_page.spec.ts

```ts
import { expect, test } from '@playwright/test';

test('route page renders', async ({ page }) => {
    await page.goto('/<route>');
    await expect(page.getByRole('main')).toBeVisible();
});
```

## Verification Script

Run the repository check script to ensure every discovered page route has all
required files:

`python3 .agents/skills/page-route/scripts/verify_pages.py`

## Implementation Notes

- Keep route files together in one folder to simplify ownership and refactors.
- Keep page docs technical and concise.
- Prefer explicit DOM querying scoped to the page root.
- Do not move page `.spec.ts` files into `tests/`; keep them in the page route.
