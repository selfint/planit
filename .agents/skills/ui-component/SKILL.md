---
name: ui-component
description: Create or update UI components in vanilla TypeScript + Vite + Tailwind projects where each component is split into src/components/Component.html (markup + Tailwind) and src/components/Component.ts (logic). Use when asked to build new UI components, refactor components into HTML+TS pairs, or wire template-based UI logic with <template>.
---

# Ui Component

## Overview

Build UI components as paired files: HTML for structure/styling and TypeScript for behavior, using <template> for DOM cloning.
Each component also ships with a short Markdown doc that explains how it works.
The app is always RTL and in Hebrew; inline all copy in Hebrew.

## Workflow

1. Confirm or create the component set at src/components/<Component>.html, src/components/<Component>.ts, src/components/<Component>.stories.ts, and src/components/<Component>.md.
2. Put all markup and Tailwind classes in the HTML file inside a <template>.
3. Keep logic, state, and event wiring in the TS file; do not embed scripts in HTML.
4. Put all text in Hebrew; except for PlanIt and other english-only phrases.
5. Use data attributes in the HTML to target elements from TS.
6. Export a component factory (e.g., `AppHeader()`) that returns a root element.
7. Add a concise Markdown doc in `src/components/<Component>.md` following the structure below.
8. Mount by `replaceWith()` or `appendChild()` in the caller (avoid `outerHTML`).

## Component Contract

- Files:
    - src/components/<Component>.html
    - src/components/<Component>.ts
    - src/components/<Component>.stories.ts
    - src/components/<Component>.md
- HTML:
    - Wrap the component in a single <template> element.
    - Keep UI-only concerns here: structure, Tailwind classes, semantic tags.
    - Use data attributes like data-role, data-action, data-slot for hooks.
- TypeScript:
    - Import the HTML as text (`?raw` with Vite).
    - Clone the template into a root element.
    - Bind events and return a single root element.

## Documentation File

- Use `src/components/<Component>.md` to explain the component behavior.
- Keep it short and technical; follow the CourseTable example.
- Recommended sections: Overview, Template Structure, Data Flow, Dependencies, Notes.

## Verification Script

Run this check to ensure every component has the required files:

```bash
node -e "const fs=require('fs');const path=require('path');const dir='src/components';const required=['.ts','.html','.stories.ts','.md'];const entries=fs.readdirSync(dir).filter(f=>!f.startsWith('.'));const names=new Set(entries.map(f=>f.replace(/\.stories\.ts$|\.html$|\.ts$|\.md$/,'')));const missing=[];for(const name of names){for(const ext of required){const file=path.join(dir,`${name}${ext}`);if(!fs.existsSync(file))missing.push(file);}}if(missing.length){console.error('Missing component files:\n'+missing.join('\n'));process.exit(1);}console.log('All components have .ts, .html, .stories.ts, and .md files.');"
```

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
