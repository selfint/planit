---
name: ui-component
description: Build or update UI components using vanilla HTML and JavaScript + JSDoc (using <template>), with Storybook support, and documentation in a Markdown file (in total, 4 files per component). Use when asked to create new components, refactor UI into HTML+TS templates, or add stories/docs for existing components in this codebase.
---

# Ui Component

## Overview

Build UI components as four files (.html, .js, .stories.js, .md). Use <template> cloning and data attributes for wiring, keep UI copy in Hebrew (RTL), and keep the docs concise and technical.

## Workflow

1. Confirm or create the component set at src/components/<Component>.html, src/components/<Component>.js, src/components/<Component>.stories.js, and src/components/<Component>.md.
2. Put all markup and Tailwind classes in the HTML file inside a <template>.
3. Keep logic, state, and event wiring in the JS file; do not embed scripts in HTML.
4. Put all text in Hebrew; except for PlanIt and other english-only phrases.
5. Use data attributes in the HTML to target elements from JS.
6. Export a component factory (e.g., `AppHeader()`) that returns a root element.
7. Add a concise Markdown doc in `src/components/<Component>.md` following the structure below.
8. Create `src/components/<Component>.stories.js` alongside the component.
9. Define `Default` and `Dark` stories, setting `globals: { theme: 'dark' }` for dark.
10. Rely on `.storybook/preview.js` for the wrapper; do not create custom preview shells.
11. Mount by `replaceWith()` or `appendChild()` in the caller (avoid `outerHTML`).

## Component Contract

- Files:
    - src/components/<Component>.html
    - src/components/<Component>.js
    - src/components/<Component>.stories.js
    - src/components/<Component>.md
- HTML:
    - Wrap the component in a single <template> element.
    - Keep UI-only concerns here: structure, Tailwind classes, semantic tags.
    - Use data attributes like data-role, data-action, data-slot for hooks.
- JavaScript:
    - Import the HTML as text (`?raw` with Vite).
    - Clone the template into a root element.
    - Bind events and return a single root element.

## Documentation File

- Use `src/components/<Component>.md` to explain the component behavior.
- Keep it short and technical; follow the CourseTable example.
- Write the documentation in English.
- Recommended sections: Overview, Template Structure, Data Flow, Dependencies, Notes.

## Verification Script

Run the repository check script to ensure every component has the required
files:

`python3 .agents/skills/ui-component/scripts/verify_components.py`

## Implementation Notes

- Prefer small, explicit factories: `Component()` returns an element.
- Keep state in JS; avoid inline styles or JS in HTML.
- Use class toggles or data attributes for stateful styling.
- Keep DOM queries scoped to the cloned root element.
- Use `replaceWith(Component())` when swapping placeholders.

## Storybook Integration

- Story files live next to components: src/components/<Component>.stories.js.
- Use the global Storybook theme toolbar and backgrounds.
- Define two stories: `Default` (light) and `Dark` (set `globals: { theme: 'dark' }`).
- Do not build custom preview wrappers; rely on `.storybook/preview.js` for theme wrapping.

## Dark Mode Behavior

- Components should use CSS variable-based utilities (e.g., `text-text`, `bg-surface-1`).
- Dark mode is applied at the app shell or Storybook wrapper by swapping CSS variables.
- No `dark:` prefixes are required inside components when variables are used.

## Minimal Template Pattern

Use this shape unless the codebase already provides a different pattern:

### Component.html

```html
<template>
    <section class="..." data-component="Component">
        <h2 class="..." data-role="title"></h2>
        <button class="..." data-action="primary"></button>
    </section>
</template>
```

### Component.js

```js
import templateHtml from './Component.html?raw';

/**
 * @returns {HTMLElement}
 */
export function Component() {
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

    const title = root.querySelector("[data-role='title']");
    if (title instanceof HTMLElement) {
        title.textContent = 'Title';
    }

    return root;
}
```

### Component.stories.js

```js
import { Component } from './Component';

/** @type {import('@storybook/html').Meta} */
const meta = {
    title: 'Components/Component',
};

export default meta;

/** @typedef {import('@storybook/html').StoryObj} Story */

/** @type {Story} */
export const Default = {
    render: () => Component(),
    globals: {
        theme: 'light',
    },
};

/** @type {Story} */
export const Dark = {
    render: () => Component(),
    globals: { theme: 'dark' },
    parameters: {
        backgrounds: {
            default: 'dark',
        },
    },
};
```

### Component.md

```markdown
# Component

## Overview

Describe what the component renders and where it is used.

## Template Structure

- Note key layout regions and slots.

## Data Flow

1. Outline how the JS wires the template and any events.

## Dependencies

- List related modules or assets.

## Notes

- Mention constraints or gotchas.
```
