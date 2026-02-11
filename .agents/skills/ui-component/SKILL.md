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
5. Export a clear mounting API from the TS file.

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
    - Bind events and expose a mount/create function.

## Implementation Notes

- Prefer small, explicit functions: create(), mount(target), update(state).
- Keep state in TS; avoid inline styles or JS in HTML.
- Use class toggles or data attributes for stateful styling.
- Keep DOM queries scoped to the cloned root element.

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
export type ComponentOptions = {
    title: string;
    onPrimary?: () => void;
};

export function createComponent(options: ComponentOptions) {
    const template = document.createElement('template');
    template.innerHTML = /* html */ `...`; // or import HTML per project setup
    const root = template.content.firstElementChild?.cloneNode(
        true
    ) as HTMLElement;

    const title = root.querySelector<HTMLElement>("[data-role='title']");
    if (title) title.textContent = options.title;

    const button = root.querySelector<HTMLButtonElement>(
        "[data-action='primary']"
    );
    if (button && options.onPrimary) {
        button.addEventListener('click', options.onPrimary);
    }

    return { root };
}

export function mountComponent(target: HTMLElement, options: ComponentOptions) {
    const { root } = createComponent(options);
    target.appendChild(root);
    return root;
}
```
