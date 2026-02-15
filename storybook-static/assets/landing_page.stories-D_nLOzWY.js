import { L as p } from './LandingFeatureCard-0i66H1Iu.js';
import { L as u } from './LandingHero-C9LvJAbw.js';
import { L as g } from './LandingNav-CYCO5cOy.js';
import { l as h } from './logo-DOrqz8C6.js';
const v = `<template>
    <div data-component="LandingPage">
        <div class="pt-[env(safe-area-inset-top)]">
            <div data-landing-nav></div>
        </div>
        <main
            class="mx-auto flex min-h-screen max-w-6xl flex-col gap-12 px-4 pt-20 pb-[calc(env(safe-area-inset-bottom)+3rem)] sm:px-6 lg:px-8"
        >
            <div data-landing-hero></div>

            <section class="mt-20 flex flex-col">
                <div
                    class="border-border/60 bg-surface-2/70 relative flex aspect-video items-center justify-center overflow-hidden rounded-2xl border"
                    data-video-placeholder
                    data-skeleton="true"
                >
                    <span
                        class="skeleton-shimmer absolute inset-0"
                        aria-hidden="true"
                        data-skeleton-layer
                    ></span>
                </div>
            </section>

            <section class="flex flex-col gap-6">
                <div class="grid gap-4 lg:grid-cols-2">
                    <div data-landing-feature-card="plan"></div>
                    <div data-landing-feature-card="catalog"></div>
                    <div data-landing-feature-card="search"></div>
                    <div data-landing-feature-card="semester"></div>
                </div>
                <div data-landing-feature-card="course"></div>
            </section>

            <section
                class="border-border/60 bg-surface-1/80 flex flex-col items-start gap-4 rounded-3xl border p-6 shadow-sm"
            >
                <div class="flex flex-col gap-2">
                    <h2 class="text-2xl font-medium">הצעד הבא בתכנון התואר.</h2>
                    <p class="text-text-muted text-sm">
                        התחילו עם המסלול שלכם וראו איך כל סמסטר מתחבר לתמונה.
                    </p>
                </div>
                <div class="flex flex-wrap gap-3">
                    <a
                        class="bg-accent text-accent-contrast rounded-full px-5 py-2 text-xs font-medium shadow-sm"
                        href="/plan"
                    >
                        התחילו עכשיו
                    </a>
                    <a
                        class="border-border/70 bg-surface-2/70 text-text-muted hover:border-accent/40 hover:text-text rounded-full border px-5 py-2 text-xs font-medium transition duration-200 ease-out"
                        href="/catalog"
                    >
                        בחירת מסלול
                    </a>
                </div>
            </section>
        </main>
    </div>
</template>
`;
function c() {
    const l = document.createElement('template');
    l.innerHTML = v;
    const d = l.content.firstElementChild;
    if (!(d instanceof HTMLTemplateElement))
        throw new Error('LandingPage template element not found');
    const a = d.content.firstElementChild?.cloneNode(!0);
    if (!(a instanceof HTMLElement))
        throw new Error('LandingPage template root not found');
    const o = a.querySelector('[data-landing-nav]');
    o !== null && o.replaceWith(g());
    const s = a.querySelector('[data-landing-hero]');
    s !== null && s.replaceWith(u());
    const m = {
        plan: {
            label: 'מתכנן סמסטר',
            title: 'תכננו את ההרכבה',
            description: 'גררו קורסים, בדקו עומס וראו תמונה מלאה של הסמסטרים.',
            href: '/plan',
            linkLabel: 'מעבר למתכנן →',
            mediaAlt: 'תצוגת מתכנן',
        },
        catalog: {
            label: 'קטלוגים',
            title: 'כל הדרישות במקום אחד',
            description: 'בחרו מסלול, בדקו דרישות חובה ובחרו תמהיל מתאים.',
            href: '/catalog',
            linkLabel: 'בדיקת קטלוגים →',
            mediaAlt: 'תצוגת קטלוג',
        },
        search: {
            label: 'חיפוש',
            title: 'מצאו קורסים מהר',
            description: 'חיפוש מתקדם עם פילטרים, דרישות קדם והצעות.',
            href: '/search',
            linkLabel: 'לפתיחת חיפוש →',
            mediaAlt: 'תצוגת חיפוש',
        },
        semester: {
            label: 'סמסטרים',
            title: 'מעקב לכל תקופה',
            description: 'תיעוד עומסים, נקודות זכות, ושינויים בין סמסטרים.',
            href: '/semester',
            linkLabel: 'מעבר לסמסטר →',
            mediaAlt: 'תצוגת סמסטר',
        },
        course: {
            label: 'פרטי קורס',
            title: 'כל פרט במקום אחד',
            description: 'תיאור, נק"ז, תנאי קדם וביקוש — בלי לעבור בין אתרים.',
            href: '/course',
            linkLabel: 'לפרטי קורס →',
            mediaAlt: 'תצוגת קורס',
        },
    };
    return (
        a.querySelectorAll('[data-landing-feature-card]').forEach((e) => {
            const i = e.dataset.landingFeatureCard;
            if (i === void 0) return;
            const t = m[i],
                f = p({
                    label: t.label,
                    title: t.title,
                    description: t.description,
                    href: t.href,
                    linkLabel: t.linkLabel,
                    mediaAlt: t.mediaAlt,
                });
            e.replaceWith(f);
        }),
        a.querySelectorAll('[data-placeholder="logo"]').forEach((e) => {
            ((e.src = h), (e.loading = 'lazy'), (e.decoding = 'async'));
        }),
        a
            .querySelectorAll('[data-feature-media], [data-hero-media]')
            .forEach((e) => {
                e.dataset.videoReady = 'false';
            }),
        a
    );
}
const w = { title: 'Pages/Landing', parameters: { layout: 'fullscreen' } },
    n = { render: () => c(), globals: { theme: 'light' } },
    r = {
        render: () => c(),
        globals: { theme: 'dark' },
        parameters: { backgrounds: { default: 'dark' } },
    };
n.parameters = {
    ...n.parameters,
    docs: {
        ...n.parameters?.docs,
        source: {
            originalSource: `{
  render: () => LandingPage(),
  globals: {
    theme: 'light'
  }
}`,
            ...n.parameters?.docs?.source,
        },
    },
};
r.parameters = {
    ...r.parameters,
    docs: {
        ...r.parameters?.docs,
        source: {
            originalSource: `{
  render: () => LandingPage(),
  globals: {
    theme: 'dark'
  },
  parameters: {
    backgrounds: {
      default: 'dark'
    }
  }
}`,
            ...r.parameters?.docs?.source,
        },
    },
};
const H = ['Default', 'Dark'];
export { r as Dark, n as Default, H as __namedExportsOrder, w as default };
