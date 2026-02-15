const l = `<template>
    <footer
        class="border-border/60 text-text-muted mt-10 flex flex-wrap items-center justify-between gap-3 border-t pt-4 text-xs"
        data-component="AppFooter"
    >
        <div class="flex items-center gap-2">
            <span class="bg-info size-2 rounded-full"></span>
            <span>Planit PWA - מתכנן אופליין תחילה</span>
        </div>
        <div class="flex flex-wrap items-center gap-4">
            <span>מותאם ל-Safe Area</span>
            <span>
                <span data-build-sha>Build</span>
            </span>
        </div>
    </footer>
</template>
`;
function s() {
    const r = document.createElement('template');
    r.innerHTML = l;
    const a = r.content.firstElementChild;
    if (!(a instanceof HTMLTemplateElement))
        throw new Error('AppFooter template element not found');
    const n = a.content.firstElementChild?.cloneNode(!0);
    if (!(n instanceof HTMLElement))
        throw new Error('AppFooter template root not found');
    const o = n.querySelector('[data-build-sha]');
    return (o !== null && (o.textContent = 'Build 66ab3dc'), n);
}
const p = { title: 'Components/AppFooter' },
    e = { render: () => s(), globals: { theme: 'light' } },
    t = {
        render: () => s(),
        globals: { theme: 'dark' },
        parameters: { backgrounds: { default: 'dark' } },
    };
e.parameters = {
    ...e.parameters,
    docs: {
        ...e.parameters?.docs,
        source: {
            originalSource: `{
  render: () => AppFooter(),
  globals: {
    theme: 'light'
  }
}`,
            ...e.parameters?.docs?.source,
        },
    },
};
t.parameters = {
    ...t.parameters,
    docs: {
        ...t.parameters?.docs,
        source: {
            originalSource: `{
  render: () => AppFooter(),
  globals: {
    theme: 'dark'
  },
  parameters: {
    backgrounds: {
      default: 'dark'
    }
  }
}`,
            ...t.parameters?.docs?.source,
        },
    },
};
const d = ['Default', 'Dark'];
export { t as Dark, e as Default, d as __namedExportsOrder, p as default };
