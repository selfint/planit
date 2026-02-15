try {
    (() => {
        var a = __REACT__,
            {
                Children: se,
                Component: ie,
                Fragment: pe,
                Profiler: ue,
                PureComponent: me,
                StrictMode: de,
                Suspense: ce,
                __SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED: be,
                cloneElement: _e,
                createContext: ke,
                createElement: ve,
                createFactory: Se,
                createRef: ye,
                forwardRef: Te,
                isValidElement: Oe,
                lazy: Ce,
                memo: fe,
                startTransition: Ie,
                unstable_act: Ee,
                useCallback: T,
                useContext: xe,
                useDebugValue: ge,
                useDeferredValue: we,
                useEffect: x,
                useId: Ae,
                useImperativeHandle: Re,
                useInsertionEffect: he,
                useLayoutEffect: Le,
                useMemo: Be,
                useReducer: Pe,
                useRef: h,
                useState: L,
                useSyncExternalStore: Me,
                useTransition: Ne,
                version: De,
            } = __REACT__;
        var Ge = __STORYBOOK_API__,
            {
                ActiveTabs: Ue,
                Consumer: Ke,
                ManagerContext: Ye,
                Provider: $e,
                RequestResponseError: qe,
                addons: g,
                combineParameters: ze,
                controlOrMetaKey: je,
                controlOrMetaSymbol: Ze,
                eventMatchesShortcut: Je,
                eventToShortcut: Qe,
                experimental_MockUniversalStore: Xe,
                experimental_UniversalStore: et,
                experimental_requestResponse: tt,
                experimental_useUniversalStore: ot,
                isMacLike: nt,
                isShortcutTaken: rt,
                keyToSymbol: at,
                merge: lt,
                mockChannel: st,
                optionOrAltSymbol: it,
                shortcutMatchesShortcut: pt,
                shortcutToHumanString: ut,
                types: B,
                useAddonState: mt,
                useArgTypes: dt,
                useArgs: ct,
                useChannel: bt,
                useGlobalTypes: P,
                useGlobals: w,
                useParameter: _t,
                useSharedState: kt,
                useStoryPrepared: vt,
                useStorybookApi: M,
                useStorybookState: St,
            } = __STORYBOOK_API__;
        var ft = __STORYBOOK_COMPONENTS__,
            {
                A: It,
                ActionBar: Et,
                AddonPanel: xt,
                Badge: gt,
                Bar: wt,
                Blockquote: At,
                Button: Rt,
                ClipboardCode: ht,
                Code: Lt,
                DL: Bt,
                Div: Pt,
                DocumentWrapper: Mt,
                EmptyTabContent: Nt,
                ErrorFormatter: Dt,
                FlexBar: Vt,
                Form: Ht,
                H1: Wt,
                H2: Ft,
                H3: Gt,
                H4: Ut,
                H5: Kt,
                H6: Yt,
                HR: $t,
                IconButton: N,
                IconButtonSkeleton: qt,
                Icons: A,
                Img: zt,
                LI: jt,
                Link: Zt,
                ListItem: Jt,
                Loader: Qt,
                Modal: Xt,
                OL: eo,
                P: to,
                Placeholder: oo,
                Pre: no,
                ProgressSpinner: ro,
                ResetWrapper: ao,
                ScrollArea: lo,
                Separator: D,
                Spaced: so,
                Span: io,
                StorybookIcon: po,
                StorybookLogo: uo,
                Symbols: mo,
                SyntaxHighlighter: co,
                TT: bo,
                TabBar: _o,
                TabButton: ko,
                TabWrapper: vo,
                Table: So,
                Tabs: yo,
                TabsState: To,
                TooltipLinkList: V,
                TooltipMessage: Oo,
                TooltipNote: Co,
                UL: fo,
                WithTooltip: H,
                WithTooltipPure: Io,
                Zoom: Eo,
                codeCommon: xo,
                components: go,
                createCopyToClipboardFunction: wo,
                getStoryHref: Ao,
                icons: Ro,
                interleaveSeparators: ho,
                nameSpaceClassNames: Lo,
                resetComponents: Bo,
                withReset: Po,
            } = __STORYBOOK_COMPONENTS__;
        var U = { type: 'item', value: '' },
            K = (o, t) => ({
                ...t,
                name: t.name || o,
                description: t.description || o,
                toolbar: {
                    ...t.toolbar,
                    items: t.toolbar.items.map((e) => {
                        let n =
                            typeof e == 'string' ? { value: e, title: e } : e;
                        return (
                            n.type === 'reset' &&
                                t.toolbar.icon &&
                                ((n.icon = t.toolbar.icon), (n.hideIcon = !0)),
                            { ...U, ...n }
                        );
                    }),
                },
            }),
            Y = ['reset'],
            $ = (o) => o.filter((t) => !Y.includes(t.type)).map((t) => t.value),
            _ = 'addon-toolbars',
            q = async (o, t, e) => {
                (e &&
                    e.next &&
                    (await o.setAddonShortcut(_, {
                        label: e.next.label,
                        defaultShortcut: e.next.keys,
                        actionName: `${t}:next`,
                        action: e.next.action,
                    })),
                    e &&
                        e.previous &&
                        (await o.setAddonShortcut(_, {
                            label: e.previous.label,
                            defaultShortcut: e.previous.keys,
                            actionName: `${t}:previous`,
                            action: e.previous.action,
                        })),
                    e &&
                        e.reset &&
                        (await o.setAddonShortcut(_, {
                            label: e.reset.label,
                            defaultShortcut: e.reset.keys,
                            actionName: `${t}:reset`,
                            action: e.reset.action,
                        })));
            },
            z = (o) => (t) => {
                let {
                        id: e,
                        toolbar: { items: n, shortcuts: r },
                    } = t,
                    u = M(),
                    [k, i] = w(),
                    l = h([]),
                    p = k[e],
                    O = T(() => {
                        i({ [e]: '' });
                    }, [i]),
                    C = T(() => {
                        let s = l.current,
                            d = s.indexOf(p),
                            c = d === s.length - 1 ? 0 : d + 1,
                            m = l.current[c];
                        i({ [e]: m });
                    }, [l, p, i]),
                    f = T(() => {
                        let s = l.current,
                            d = s.indexOf(p),
                            c = d > -1 ? d : 0,
                            m = c === 0 ? s.length - 1 : c - 1,
                            b = l.current[m];
                        i({ [e]: b });
                    }, [l, p, i]);
                return (
                    x(() => {
                        r &&
                            q(u, e, {
                                next: { ...r.next, action: C },
                                previous: { ...r.previous, action: f },
                                reset: { ...r.reset, action: O },
                            });
                    }, [u, e, r, C, f, O]),
                    x(() => {
                        l.current = $(n);
                    }, []),
                    a.createElement(o, { cycleValues: l.current, ...t })
                );
            },
            W = ({ currentValue: o, items: t }) =>
                o != null && t.find((e) => e.value === o && e.type !== 'reset'),
            j = ({ currentValue: o, items: t }) => {
                let e = W({ currentValue: o, items: t });
                if (e) return e.icon;
            },
            Z = ({ currentValue: o, items: t }) => {
                let e = W({ currentValue: o, items: t });
                if (e) return e.title;
            },
            J = ({
                active: o,
                disabled: t,
                title: e,
                icon: n,
                description: r,
                onClick: u,
            }) =>
                a.createElement(
                    N,
                    {
                        active: o,
                        title: r,
                        disabled: t,
                        onClick: t ? () => {} : u,
                    },
                    n &&
                        a.createElement(A, {
                            icon: n,
                            __suppressDeprecationWarning: !0,
                        }),
                    e ? `\xA0${e}` : null
                ),
            Q = ({
                right: o,
                title: t,
                value: e,
                icon: n,
                hideIcon: r,
                onClick: u,
                disabled: k,
                currentValue: i,
            }) => {
                let l =
                        n &&
                        a.createElement(A, {
                            style: { opacity: 1 },
                            icon: n,
                            __suppressDeprecationWarning: !0,
                        }),
                    p = {
                        id: e ?? '_reset',
                        active: i === e,
                        right: o,
                        title: t,
                        disabled: k,
                        onClick: u,
                    };
                return (n && !r && (p.icon = l), p);
            },
            X = z(
                ({
                    id: o,
                    name: t,
                    description: e,
                    toolbar: {
                        icon: n,
                        items: r,
                        title: u,
                        preventDynamicIcon: k,
                        dynamicTitle: i,
                    },
                }) => {
                    let [l, p, O] = w(),
                        [C, f] = L(!1),
                        s = l[o],
                        d = !!s,
                        c = o in O,
                        m = n,
                        b = u;
                    (k || (m = j({ currentValue: s, items: r }) || m),
                        i && (b = Z({ currentValue: s, items: r }) || b),
                        !b &&
                            !m &&
                            console.warn(
                                `Toolbar '${t}' has no title or icon`
                            ));
                    let F = T(
                        (E) => {
                            p({ [o]: E });
                        },
                        [o, p]
                    );
                    return a.createElement(
                        H,
                        {
                            placement: 'top',
                            tooltip: ({ onHide: E }) => {
                                let G = r
                                    .filter(({ type: I }) => {
                                        let R = !0;
                                        return (
                                            I === 'reset' && !s && (R = !1),
                                            R
                                        );
                                    })
                                    .map((I) =>
                                        Q({
                                            ...I,
                                            currentValue: s,
                                            disabled: c,
                                            onClick: () => {
                                                (F(I.value), E());
                                            },
                                        })
                                    );
                                return a.createElement(V, { links: G });
                            },
                            closeOnOutsideClick: !0,
                            onVisibleChange: f,
                        },
                        a.createElement(J, {
                            active: C || d,
                            disabled: c,
                            description: e || '',
                            icon: m,
                            title: b || '',
                        })
                    );
                }
            ),
            ee = () => {
                let o = P(),
                    t = Object.keys(o).filter((e) => !!o[e].toolbar);
                return t.length
                    ? a.createElement(
                          a.Fragment,
                          null,
                          a.createElement(D, null),
                          t.map((e) => {
                              let n = K(e, o[e]);
                              return a.createElement(X, {
                                  key: e,
                                  id: e,
                                  ...n,
                              });
                          })
                      )
                    : null;
            };
        g.register(_, () =>
            g.add(_, {
                title: _,
                type: B.TOOL,
                match: ({ tabId: o }) => !o,
                render: () => a.createElement(ee, null),
            })
        );
    })();
} catch (e) {
    console.error(
        '[Storybook] One of your manager-entries failed: ' + import.meta.url,
        e
    );
}
