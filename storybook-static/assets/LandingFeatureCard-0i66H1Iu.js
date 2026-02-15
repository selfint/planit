const u = `<template>
    <article
        class="border-border/60 bg-surface-1/80 flex flex-col gap-4 rounded-3xl border p-5 shadow-sm lg:flex-row lg:items-start"
        data-component="LandingFeatureCard"
    >
        <div
            class="border-border/60 bg-surface-2/70 relative flex aspect-16/10 w-full items-center justify-center overflow-hidden rounded-2xl border lg:w-1/2"
            data-slot="media"
            data-skeleton="true"
        >
            <span
                class="skeleton-shimmer absolute inset-0"
                aria-hidden="true"
                data-skeleton-layer
            ></span>
        </div>
        <div class="flex w-full flex-col gap-2 lg:w-1/2" data-slot="content">
            <h2 class="text-lg font-medium" data-slot="title">
                <span
                    class="skeleton-shimmer block h-4 w-40 rounded-full"
                    aria-hidden="true"
                ></span>
            </h2>
            <p class="text-text-muted text-xs" data-slot="description">
                <span
                    class="skeleton-shimmer block h-3 w-full rounded-full"
                    aria-hidden="true"
                ></span>
                <span
                    class="skeleton-shimmer mt-2 block h-3 w-3/4 rounded-full"
                    aria-hidden="true"
                ></span>
            </p>
            <a
                class="text-accent text-xs font-medium"
                href="/"
                data-slot="link"
            >
                <span
                    class="skeleton-shimmer block h-3 w-20 rounded-full"
                    aria-hidden="true"
                ></span>
            </a>
        </div>
    </article>
</template>
`;
function m(e = {}) {
    const r = document.createElement('template');
    r.innerHTML = u;
    const d = r.content.firstElementChild;
    if (!(d instanceof HTMLTemplateElement))
        throw new Error('LandingFeatureCard template element not found');
    const t = d.content.firstElementChild?.cloneNode(!0);
    if (!(t instanceof HTMLElement))
        throw new Error('LandingFeatureCard template root not found');
    const o = t.querySelector('[data-slot="label"]');
    o !== null && e.label !== void 0 && (o.textContent = e.label);
    const s = t.querySelector('[data-slot="title"]');
    s !== null && e.title !== void 0 && (s.textContent = e.title);
    const i = t.querySelector('[data-slot="description"]');
    i !== null && e.description !== void 0 && (i.textContent = e.description);
    const l = t.querySelector('[data-slot="link"]');
    if (
        (l !== null && e.linkLabel !== void 0 && (l.textContent = e.linkLabel),
        l !== null && e.href !== void 0 && (l.href = e.href),
        e.mediaSrc !== void 0)
    ) {
        const a = t.querySelector('[data-slot="media"]');
        if (a !== null) {
            const n = document.createElement('img');
            ((n.className = 'h-full w-full object-cover'),
                (n.src = e.mediaSrc),
                (n.loading = 'lazy'),
                (n.decoding = 'async'),
                (n.alt = e.mediaAlt ?? 'תצוגת כרטיס'),
                a.appendChild(n),
                a.removeAttribute('data-skeleton'));
            const c = a.querySelector('[data-skeleton-layer]');
            c !== null && c.remove();
        }
    }
    return t;
}
export { m as L };
