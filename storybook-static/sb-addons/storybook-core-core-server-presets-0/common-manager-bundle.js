try {
    (() => {
        var S = __STORYBOOK_API__,
            {
                ActiveTabs: w,
                Consumer: O,
                ManagerContext: T,
                Provider: h,
                RequestResponseError: g,
                addons: p,
                combineParameters: f,
                controlOrMetaKey: A,
                controlOrMetaSymbol: x,
                eventMatchesShortcut: P,
                eventToShortcut: M,
                experimental_MockUniversalStore: R,
                experimental_UniversalStore: C,
                experimental_requestResponse: U,
                experimental_useUniversalStore: B,
                isMacLike: E,
                isShortcutTaken: I,
                keyToSymbol: K,
                merge: N,
                mockChannel: G,
                optionOrAltSymbol: L,
                shortcutMatchesShortcut: Y,
                shortcutToHumanString: q,
                types: D,
                useAddonState: F,
                useArgTypes: H,
                useArgs: j,
                useChannel: V,
                useGlobalTypes: z,
                useGlobals: J,
                useParameter: Q,
                useSharedState: W,
                useStoryPrepared: X,
                useStorybookApi: Z,
                useStorybookState: $,
            } = __STORYBOOK_API__;
        var m = (() => {
                let e;
                return (
                    typeof window < 'u'
                        ? (e = window)
                        : typeof globalThis < 'u'
                          ? (e = globalThis)
                          : typeof window < 'u'
                            ? (e = window)
                            : typeof self < 'u'
                              ? (e = self)
                              : (e = {}),
                    e
                );
            })(),
            i = 'tag-filters',
            u = 'static-filter';
        p.register(i, (e) => {
            let l = Object.entries(m.TAGS_OPTIONS ?? {}).reduce((o, n) => {
                let [t, d] = n;
                return (d.excludeFromSidebar && (o[t] = !0), o);
            }, {});
            e.experimental_setFilter(u, (o) => {
                let n = o.tags ?? [];
                return (
                    (n.includes('dev') || o.type === 'docs') &&
                    n.filter((t) => l[t]).length === 0
                );
            });
        });
    })();
} catch (e) {
    console.error(
        '[Storybook] One of your manager-entries failed: ' + import.meta.url,
        e
    );
}
