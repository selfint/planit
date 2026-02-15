const c = 'planit:pwa-update',
    f = `<template>
    <section
        class="border-border/60 bg-surface-1/90 text-text mb-4 flex flex-col items-start gap-3 rounded-2xl border px-4 py-3 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-6"
        data-component="UpdateBanner"
        role="status"
        aria-live="polite"
    >
        <div class="flex min-w-0 flex-1 items-center gap-3 text-xs sm:text-sm">
            <span class="bg-info size-2 rounded-full"></span>
            <div class="flex min-w-0 flex-col gap-0.5 text-start leading-snug">
                <span class="font-medium">גרסה חדשה זמינה</span>
                <span class="text-text-muted text-xs"
                    >עדכן כדי לקבל את השיפורים האחרונים</span
                >
            </div>
        </div>
        <button
            type="button"
            class="bg-accent text-accent-contrast w-full rounded-full px-4 py-2 text-xs font-medium shadow-sm transition duration-200 ease-out hover:opacity-90 sm:w-auto"
            data-update-action
        >
            עדכן עכשיו
        </button>
    </section>
</template>
`;
function x() {
    const e = document.createElement('div'),
        t = document.createElement('template');
    t.innerHTML = f;
    const l = t.content.firstElementChild;
    if (!(l instanceof HTMLTemplateElement))
        throw new Error('UpdateBanner template element not found');
    const n = l.content.firstElementChild?.cloneNode(!0);
    if (!(n instanceof HTMLElement))
        throw new Error('UpdateBanner template root not found');
    const a = n.querySelector('[data-update-action]');
    if (a === null) throw new Error('UpdateBanner action not found');
    let s = null;
    const p = (d) => {
            ((s = d), e.append(n));
        },
        u = () => {
            n.remove();
        };
    return (
        a.addEventListener('click', () => {
            s !== null &&
                ((a.disabled = !0), (a.textContent = 'מעדכן...'), s(!0), u());
        }),
        window.addEventListener(c, (d) => {
            if ('onLine' in navigator && !navigator.onLine) return;
            const i = d.detail;
            typeof i.updateSW == 'function' && p(i.updateSW);
        }),
        e
    );
}
const g = { title: 'Components/UpdateBanner' };
function m() {
    const e = x(),
        t = () => Promise.resolve();
    return (
        window.dispatchEvent(new CustomEvent(c, { detail: { updateSW: t } })),
        e
    );
}
const r = { render: () => m(), globals: { theme: 'light' } },
    o = {
        render: () => m(),
        globals: { theme: 'dark' },
        parameters: { backgrounds: { default: 'dark' } },
    };
r.parameters = {
    ...r.parameters,
    docs: {
        ...r.parameters?.docs,
        source: {
            originalSource: `{
  render: () => renderBanner(),
  globals: {
    theme: 'light'
  }
}`,
            ...r.parameters?.docs?.source,
        },
    },
};
o.parameters = {
    ...o.parameters,
    docs: {
        ...o.parameters?.docs,
        source: {
            originalSource: `{
  render: () => renderBanner(),
  globals: {
    theme: 'dark'
  },
  parameters: {
    backgrounds: {
      default: 'dark'
    }
  }
}`,
            ...o.parameters?.docs?.source,
        },
    },
};
const w = ['Default', 'Dark'];
export { o as Dark, r as Default, w as __namedExportsOrder, g as default };
