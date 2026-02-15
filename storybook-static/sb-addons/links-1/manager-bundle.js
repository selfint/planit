try {
    (() => {
        var v = __STORYBOOK_API__,
            {
                ActiveTabs: c,
                Consumer: y,
                ManagerContext: S,
                Provider: w,
                RequestResponseError: E,
                addons: s,
                combineParameters: O,
                controlOrMetaKey: T,
                controlOrMetaSymbol: A,
                eventMatchesShortcut: h,
                eventToShortcut: R,
                experimental_MockUniversalStore: I,
                experimental_UniversalStore: P,
                experimental_requestResponse: g,
                experimental_useUniversalStore: x,
                isMacLike: C,
                isShortcutTaken: M,
                keyToSymbol: U,
                merge: D,
                mockChannel: N,
                optionOrAltSymbol: B,
                shortcutMatchesShortcut: K,
                shortcutToHumanString: V,
                types: f,
                useAddonState: q,
                useArgTypes: G,
                useArgs: L,
                useChannel: Y,
                useGlobalTypes: $,
                useGlobals: H,
                useParameter: Q,
                useSharedState: j,
                useStoryPrepared: z,
                useStorybookApi: F,
                useStorybookState: J,
            } = __STORYBOOK_API__;
        var e = 'storybook/links',
            r = {
                NAVIGATE: `${e}/navigate`,
                REQUEST: `${e}/request`,
                RECEIVE: `${e}/receive`,
            };
        s.register(e, (o) => {
            o.on(r.REQUEST, ({ kind: p, name: m }) => {
                let l = o.storyId(p, m);
                o.emit(r.RECEIVE, l);
            });
        });
    })();
} catch (e) {
    console.error(
        '[Storybook] One of your manager-entries failed: ' + import.meta.url,
        e
    );
}
