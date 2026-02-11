---
name: ui-component
description: Create or update UI components in vanilla TypeScript + Vite + Tailwind projects where each component is split into src/components/Component.html (markup + Tailwind) and src/components/Component.ts (logic). Use when asked to build new UI components, refactor components into HTML+TS pairs, or wire template-based UI logic with <template>.
---

# Ui Component

## Overview

Build UI components as paired files: HTML for structure/styling and TypeScript for behavior, using <template> for DOM cloning.

## Workflow

1. Confirm or create the component pair at src/components/<Component>.html and src/components/<Component>.ts.
2. Put all markup and Tailwind classes in the HTML file inside a <template>.
3. Keep logic, state, and event wiring in the TS file; do not embed scripts in HTML.
4. Use data attributes in the HTML to target elements from TS.
5. Export a component factory (e.g., `AppHeader()`) that returns a root element.
6. Mount by `replaceWith()` or `appendChild()` in the caller (avoid `outerHTML`).

## Component Contract

- Files:
    - src/components/<Component>.html
    - src/components/<Component>.ts
- HTML:
    - Wrap the component in a single <template> element.
    - Keep UI-only concerns here: structure, Tailwind classes, semantic tags.
    - Use data attributes like data-role, data-action, data-slot for hooks.
- TypeScript:
    - Import the HTML as text (prefer `?raw` with Vite).
    - Clone the template into a root element.
    - Bind events and return a single root element.

## Implementation Notes

- Prefer small, explicit factories: `Component()` returns an element.
- Keep state in TS; avoid inline styles or JS in HTML.
- Use class toggles or data attributes for stateful styling.
- Keep DOM queries scoped to the cloned root element.
- Use `replaceWith(Component())` when swapping placeholders.

## Storybook Integration

- Story files live next to components: src/components/<Component>.stories.ts.
- Use the global Storybook theme toolbar and backgrounds.
- Define two stories: `Default` (light) and `Dark` (set `globals: { theme: 'dark' }`).
- Do not build custom preview wrappers; rely on `.storybook/preview.ts` for theme wrapping.

## Dark Mode Behavior

- Components should use CSS variable-based utilities (e.g., `text-text`, `bg-surface-1`).
- Dark mode is applied at the app shell or Storybook wrapper by swapping CSS variables.
- No `dark:` prefixes are required inside components when variables are used.

## Minimal Template Pattern

Use this shape unless the codebase already provides a different pattern:

```html
<template>
    <section class="..." data-component="Component">
        <h2 class="..." data-role="title"></h2>
        <button class="..." data-action="primary"></button>
    </section>
</template>
```

```ts
import templateHtml from './Component.html?raw';

export function Component(): HTMLElement {
    const template = document.createElement('template');
    template.innerHTML = templateHtml;
    const templateElement = template.content.firstElementChild;
    if (!(templateElement instanceof HTMLTemplateElement)) {
        throw new Error('Component template element not found');
    }
    const root = templateElement.content.firstElementChild?.cloneNode(true);
    if (!(root instanceof HTMLElement)) {
        throw new Error('Component template root not found');
    }

    const title = root.querySelector<HTMLElement>("[data-role='title']");
    if (title !== null) {
        title.textContent = 'Title';
    }

    return root;
}
```
