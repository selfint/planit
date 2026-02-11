type ComponentModule = {
    mountComponent?: (
        target: HTMLElement,
        options?: unknown
    ) => HTMLElement | undefined;
    createComponent?: (
        options?: unknown
    ) => { root?: HTMLElement } | HTMLElement | undefined;
    default?: (
        target: HTMLElement,
        options?: unknown
    ) => HTMLElement | undefined;
};

type ComponentEntry = {
    name: string;
    tsPath?: string;
    htmlPath?: string;
};

const componentModules = import.meta.glob('./components/*.ts');
const componentTemplates = import.meta.glob('./components/*.html', {
    query: '?raw',
    import: 'default',
});

const componentIndex = buildComponentIndex();

function buildComponentIndex(): Map<string, ComponentEntry> {
    const index = new Map<string, ComponentEntry>();

    Object.keys(componentModules).forEach((path) => {
        const name = nameFromPath(path);
        const entry = index.get(name) ?? { name };
        entry.tsPath = path;
        index.set(name, entry);
    });

    Object.keys(componentTemplates).forEach((path) => {
        const name = nameFromPath(path);
        const entry = index.get(name) ?? { name };
        entry.htmlPath = path;
        index.set(name, entry);
    });

    return index;
}

function nameFromPath(path: string): string {
    const file = path.split('/').pop() ?? path;
    return file.replace(/\.(ts|html)$/, '');
}

function isComponentsRoute(pathname: string): boolean {
    return pathname === '/components' || pathname.startsWith('/components/');
}

function getComponentNames(): ComponentEntry[] {
    return Array.from(componentIndex.values()).sort((a, b) =>
        a.name.localeCompare(b.name)
    );
}

function setOutlet(outlet: HTMLElement, html: string): void {
    outlet.innerHTML = html;
}

function navigate(path: string): void {
    if (path === window.location.pathname) {
        return;
    }
    window.history.pushState({}, '', path);
    renderRoute();
}

function attachLinkHandler(root: HTMLElement): void {
    root.addEventListener('click', (event) => {
        const target = event.target as HTMLElement | null;
        if (target === null) {
            return;
        }
        const link = target.closest<HTMLAnchorElement>('a[data-route-link]');
        if (link === null) {
            return;
        }
        const href = link.getAttribute('href');
        if (href === null || href.length === 0) {
            return;
        }
        event.preventDefault();
        navigate(href);
    });
}

let outletElement: HTMLElement | null = null;

export function initComponentRoutes(app: HTMLElement): void {
    const outlet = app.querySelector<HTMLElement>('[data-route]');
    if (outlet === null) {
        return;
    }

    outletElement = outlet;
    attachLinkHandler(document.body);

    window.addEventListener('popstate', () => {
        renderRoute();
    });

    renderRoute();
}

function renderRoute(): void {
    const outlet = outletElement;
    if (outlet === null) {
        return;
    }

    if (!isComponentsRoute(window.location.pathname)) {
        setOutlet(outlet, '');
        return;
    }

    const path = window.location.pathname.replace(/\/+$/, '');
    if (path === '/components') {
        renderGallery(outlet);
        return;
    }

    const componentName = decodeURIComponent(
        path.replace('/components/', '').split('/')[0]
    );
    void renderComponentDetail(outlet, componentName);
}

function renderGallery(outlet: HTMLElement): void {
    const entries = getComponentNames();
    const list = entries
        .map((entry) => {
            const detailPath = `/components/${entry.name}`;
            const hasTs = entry.tsPath !== undefined;
            const hasHtml = entry.htmlPath !== undefined;
            const tag = hasTs && hasHtml ? 'ts+html' : hasTs ? 'ts' : 'html';
            return `
                <li class="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
                    <a class="text-sm font-semibold text-slate-900 hover:text-slate-700" data-route-link href="${detailPath}">
                        ${entry.name}
                    </a>
                    <span class="rounded-full bg-slate-100 px-2 py-1 text-xs uppercase tracking-wide text-slate-500">
                        ${tag}
                    </span>
                </li>
            `;
        })
        .join('');

    const emptyState = `
        <div class="rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-sm text-slate-600">
            No components found in <code class="rounded bg-slate-100 px-1">src/components</code> yet.
        </div>
    `;

    setOutlet(
        outlet,
        `
        <section class="space-y-6">
            <header class="rounded-2xl bg-gradient-to-br from-emerald-50 via-slate-50 to-sky-50 p-6">
                <p class="text-xs uppercase tracking-[0.24em] text-slate-500">Dev Gallery</p>
                <h1 class="mt-2 text-2xl font-semibold text-slate-900">Component index</h1>
                <p class="mt-2 text-sm text-slate-600">Browse and validate component markup and behavior.</p>
            </header>
            <div class="space-y-3">
                ${entries.length > 0 ? `<ul class="grid gap-3">${list}</ul>` : emptyState}
            </div>
        </section>
        `
    );
}

async function renderComponentDetail(
    outlet: HTMLElement,
    name: string
): Promise<void> {
    const entry = componentIndex.get(name);

    setOutlet(
        outlet,
        `
        <section class="space-y-6">
            <header class="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <p class="text-xs uppercase tracking-[0.24em] text-slate-500">Component</p>
                    <h1 class="mt-2 text-2xl font-semibold text-slate-900">${name}</h1>
                </div>
                <a class="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-700 hover:bg-slate-50" data-route-link href="/components">Back to gallery</a>
            </header>
            <div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div class="flex flex-wrap items-center justify-between gap-3 text-xs uppercase tracking-wide text-slate-500">
                    <span>Preview</span>
                    <span data-component-status>Loading</span>
                </div>
                <div class="mt-4 rounded-xl border border-dashed border-slate-200 p-4" data-component-host></div>
            </div>
        </section>
        `
    );

    const status = outlet.querySelector<HTMLElement>('[data-component-status]');
    const host = outlet.querySelector<HTMLElement>('[data-component-host]');

    if (status === null || host === null) {
        return;
    }

    if (entry?.tsPath === undefined) {
        status.textContent = 'No TS entry found.';
        return;
    }

    try {
        const moduleLoader = componentModules[entry.tsPath];
        const mod = (await moduleLoader()) as ComponentModule;
        const mounted = mountFromModule(mod, host);

        status.textContent = mounted ? 'Rendered' : 'No mount function found.';
    } catch (error) {
        status.textContent =
            error instanceof Error
                ? error.message
                : 'Failed to load component.';
    }
}

function mountFromModule(mod: ComponentModule, host: HTMLElement): boolean {
    if (typeof mod.mountComponent === 'function') {
        const result = mod.mountComponent(host);
        if (result instanceof HTMLElement) {
            host.appendChild(result);
        }
        return true;
    }

    if (typeof mod.createComponent === 'function') {
        const result = mod.createComponent();
        if (result instanceof HTMLElement) {
            host.appendChild(result);
            return true;
        }
        if (result !== undefined) {
            const root = result.root;
            if (root instanceof HTMLElement) {
                host.appendChild(root);
                return true;
            }
        }
    }

    if (typeof mod.default === 'function') {
        const result = mod.default(host);
        if (result instanceof HTMLElement) {
            host.appendChild(result);
        }
        return true;
    }

    return false;
}
