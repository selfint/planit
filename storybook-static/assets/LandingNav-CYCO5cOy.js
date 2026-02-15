import { l as c } from './logo-DOrqz8C6.js';
const u = `<template>
    <div class="relative" data-component="LandingNav">
        <header
            class="border-border/50 border-b bg-transparent backdrop-blur-sm"
        >
            <div
                class="mx-auto flex items-center justify-between px-4 sm:px-6 lg:max-w-6xl lg:px-8"
            >
                <div class="order-3 flex items-center gap-3" data-slot="logo">
                    <svg class="size-16" aria-label="Planit" role="img">
                        <use data-title-use></use>
                    </svg>

                    <img class="size-10" alt="לוגו Planit" data-logo />
                </div>

                <nav
                    class="text-text order-2 hidden items-center gap-6 text-sm md:flex"
                    data-slot="links"
                >
                    <a
                        class="hover:text-text w-fit transition duration-200 ease-out"
                        href="/plan"
                    >
                        מתכנן
                    </a>
                    <a
                        class="hover:text-text w-fit transition duration-200 ease-out"
                        href="/catalog"
                    >
                        קטלוגים
                    </a>
                    <a
                        class="hover:text-text w-fit transition duration-200 ease-out"
                        href="/course"
                    >
                        קורסים
                    </a>
                    <a
                        class="hover:text-text w-fit transition duration-200 ease-out"
                        href="/search"
                    >
                        חיפוש
                    </a>
                </nav>

                <div
                    class="order-1 hidden items-center gap-3 md:flex"
                    data-slot="actions"
                >
                    <a
                        class="bg-accent text-accent-contrast rounded-full px-4 py-2 text-xs font-medium shadow-sm"
                        href="/plan"
                    >
                        התחילו לתכנן
                    </a>
                    <a
                        class="text-text hover:text-text text-xs transition duration-200 ease-out"
                        href="/login"
                    >
                        כניסה
                    </a>
                </div>

                <button
                    class="text-text order-1 flex items-center gap-2 rounded-full px-3 py-2 text-xs font-medium md:hidden"
                    type="button"
                    data-action="toggle-menu"
                    aria-expanded="false"
                    aria-controls="landing-mobile-menu"
                >
                    <span class="sr-only">תפריט</span>
                    <span
                        class="flex h-4 w-5 flex-col justify-between"
                        aria-hidden="true"
                    >
                        <span class="bg-text h-0.5 w-full rounded-full"></span>
                        <span class="bg-text h-0.5 w-full rounded-full"></span>
                        <span class="bg-text h-0.5 w-full rounded-full"></span>
                    </span>
                </button>
            </div>
        </header>

        <div
            class="border-border/60 bg-surface-1/95 absolute inset-x-4 top-full z-40 mt-3 hidden rounded-2xl border p-4 shadow-sm backdrop-blur-lg sm:inset-x-6"
            role="dialog"
            aria-modal="true"
            id="landing-mobile-menu"
            data-role="mobile-menu"
        >
            <nav class="mt-6 flex flex-col items-start gap-4 text-base">
                <a class="hover:text-text" href="/plan">מתכנן</a>
                <a class="hover:text-text" href="/catalog">קטלוגים</a>
                <a class="hover:text-text" href="/course">קורסים</a>
                <a class="hover:text-text" href="/search">חיפוש</a>
            </nav>
            <div class="mt-6 flex flex-col gap-3">
                <a
                    class="bg-accent text-accent-contrast rounded-full px-4 py-3 text-center text-sm font-medium"
                    href="/plan"
                >
                    התחילו לתכנן
                </a>
                <a
                    class="border-border/70 bg-surface-2/70 text-text-muted rounded-full border px-4 py-3 text-center text-sm"
                    href="/login"
                >
                    כניסה
                </a>
            </div>
        </div>
    </div>
</template>
`,
    x = '' + new URL('Title-CvVoNA55.svg', import.meta.url).href;
function f() {
    const a = document.createElement('template');
    a.innerHTML = u;
    const l = a.content.firstElementChild;
    if (!(l instanceof HTMLTemplateElement))
        throw new Error('LandingNav template element not found');
    const n = l.content.firstElementChild?.cloneNode(!0);
    if (!(n instanceof HTMLElement))
        throw new Error('LandingNav template root not found');
    const s = n.querySelector('[data-logo]');
    s !== null && (s.src = c);
    const o = n.querySelector('[data-title-use]');
    o !== null && o.setAttribute('href', x);
    const e = n.querySelectorAll('[data-action="toggle-menu"]');
    if (e.length === 0) throw new Error('LandingNav toggleButtons not found');
    const t = n.querySelector('[data-role="mobile-menu"]');
    if (t === null) throw new Error('LandingNav mobile menu not found');
    return (
        e.forEach((i) => {
            i.addEventListener('click', () => {
                const r = t.classList.contains('hidden');
                (t.classList.toggle('hidden', !r),
                    e.forEach((d) => {
                        d.setAttribute('aria-expanded', String(r));
                    }));
            });
        }),
        n
    );
}
export { f as L };
