try {
    (() => {
        var Ie = Object.create;
        var J = Object.defineProperty;
        var he = Object.getOwnPropertyDescriptor;
        var fe = Object.getOwnPropertyNames;
        var be = Object.getPrototypeOf,
            ge = Object.prototype.hasOwnProperty;
        var x = ((e) =>
            typeof require < 'u'
                ? require
                : typeof Proxy < 'u'
                  ? new Proxy(e, {
                        get: (t, a) => (typeof require < 'u' ? require : t)[a],
                    })
                  : e)(function (e) {
            if (typeof require < 'u') return require.apply(this, arguments);
            throw Error('Dynamic require of "' + e + '" is not supported');
        });
        var N = (e, t) => () => (e && (t = e((e = 0))), t);
        var we = (e, t) => () => (
            t || e((t = { exports: {} }).exports, t),
            t.exports
        );
        var ve = (e, t, a, c) => {
            if ((t && typeof t == 'object') || typeof t == 'function')
                for (let l of fe(t))
                    !ge.call(e, l) &&
                        l !== a &&
                        J(e, l, {
                            get: () => t[l],
                            enumerable: !(c = he(t, l)) || c.enumerable,
                        });
            return e;
        };
        var ye = (e, t, a) => (
            (a = e != null ? Ie(be(e)) : {}),
            ve(
                t || !e || !e.__esModule
                    ? J(a, 'default', { value: e, enumerable: !0 })
                    : a,
                e
            )
        );
        var f = N(() => {});
        var b = N(() => {});
        var g = N(() => {});
        var se = we((le, Z) => {
            f();
            b();
            g();
            (function (e) {
                if (typeof le == 'object' && typeof Z < 'u') Z.exports = e();
                else if (typeof define == 'function' && define.amd)
                    define([], e);
                else {
                    var t;
                    (typeof window < 'u' || typeof window < 'u'
                        ? (t = window)
                        : typeof self < 'u'
                          ? (t = self)
                          : (t = this),
                        (t.memoizerific = e()));
                }
            })(function () {
                var e, t, a;
                return (function c(l, w, u) {
                    function o(n, m) {
                        if (!w[n]) {
                            if (!l[n]) {
                                var r = typeof x == 'function' && x;
                                if (!m && r) return r(n, !0);
                                if (i) return i(n, !0);
                                var p = new Error(
                                    "Cannot find module '" + n + "'"
                                );
                                throw ((p.code = 'MODULE_NOT_FOUND'), p);
                            }
                            var d = (w[n] = { exports: {} });
                            l[n][0].call(
                                d.exports,
                                function (h) {
                                    var v = l[n][1][h];
                                    return o(v || h);
                                },
                                d,
                                d.exports,
                                c,
                                l,
                                w,
                                u
                            );
                        }
                        return w[n].exports;
                    }
                    for (
                        var i = typeof x == 'function' && x, I = 0;
                        I < u.length;
                        I++
                    )
                        o(u[I]);
                    return o;
                })(
                    {
                        1: [
                            function (c, l, w) {
                                l.exports = function (u) {
                                    if (typeof Map != 'function' || u) {
                                        var o = c('./similar');
                                        return new o();
                                    } else return new Map();
                                };
                            },
                            { './similar': 2 },
                        ],
                        2: [
                            function (c, l, w) {
                                function u() {
                                    return (
                                        (this.list = []),
                                        (this.lastItem = void 0),
                                        (this.size = 0),
                                        this
                                    );
                                }
                                ((u.prototype.get = function (o) {
                                    var i;
                                    if (
                                        this.lastItem &&
                                        this.isEqual(this.lastItem.key, o)
                                    )
                                        return this.lastItem.val;
                                    if (((i = this.indexOf(o)), i >= 0))
                                        return (
                                            (this.lastItem = this.list[i]),
                                            this.list[i].val
                                        );
                                }),
                                    (u.prototype.set = function (o, i) {
                                        var I;
                                        return this.lastItem &&
                                            this.isEqual(this.lastItem.key, o)
                                            ? ((this.lastItem.val = i), this)
                                            : ((I = this.indexOf(o)),
                                              I >= 0
                                                  ? ((this.lastItem =
                                                        this.list[I]),
                                                    (this.list[I].val = i),
                                                    this)
                                                  : ((this.lastItem = {
                                                        key: o,
                                                        val: i,
                                                    }),
                                                    this.list.push(
                                                        this.lastItem
                                                    ),
                                                    this.size++,
                                                    this));
                                    }),
                                    (u.prototype.delete = function (o) {
                                        var i;
                                        if (
                                            (this.lastItem &&
                                                this.isEqual(
                                                    this.lastItem.key,
                                                    o
                                                ) &&
                                                (this.lastItem = void 0),
                                            (i = this.indexOf(o)),
                                            i >= 0)
                                        )
                                            return (
                                                this.size--,
                                                this.list.splice(i, 1)[0]
                                            );
                                    }),
                                    (u.prototype.has = function (o) {
                                        var i;
                                        return this.lastItem &&
                                            this.isEqual(this.lastItem.key, o)
                                            ? !0
                                            : ((i = this.indexOf(o)),
                                              i >= 0
                                                  ? ((this.lastItem =
                                                        this.list[i]),
                                                    !0)
                                                  : !1);
                                    }),
                                    (u.prototype.forEach = function (o, i) {
                                        var I;
                                        for (I = 0; I < this.size; I++)
                                            o.call(
                                                i || this,
                                                this.list[I].val,
                                                this.list[I].key,
                                                this
                                            );
                                    }),
                                    (u.prototype.indexOf = function (o) {
                                        var i;
                                        for (i = 0; i < this.size; i++)
                                            if (
                                                this.isEqual(
                                                    this.list[i].key,
                                                    o
                                                )
                                            )
                                                return i;
                                        return -1;
                                    }),
                                    (u.prototype.isEqual = function (o, i) {
                                        return o === i || (o !== o && i !== i);
                                    }),
                                    (l.exports = u));
                            },
                            {},
                        ],
                        3: [
                            function (c, l, w) {
                                var u = c('map-or-similar');
                                l.exports = function (n) {
                                    var m = new u(!1),
                                        r = [];
                                    return function (p) {
                                        var d = function () {
                                            var h = m,
                                                v,
                                                T,
                                                y = arguments.length - 1,
                                                M = Array(y + 1),
                                                R = !0,
                                                k;
                                            if (
                                                (d.numArgs ||
                                                    d.numArgs === 0) &&
                                                d.numArgs !== y + 1
                                            )
                                                throw new Error(
                                                    'Memoizerific functions should always be called with the same number of arguments'
                                                );
                                            for (k = 0; k < y; k++) {
                                                if (
                                                    ((M[k] = {
                                                        cacheItem: h,
                                                        arg: arguments[k],
                                                    }),
                                                    h.has(arguments[k]))
                                                ) {
                                                    h = h.get(arguments[k]);
                                                    continue;
                                                }
                                                ((R = !1),
                                                    (v = new u(!1)),
                                                    h.set(arguments[k], v),
                                                    (h = v));
                                            }
                                            return (
                                                R &&
                                                    (h.has(arguments[y])
                                                        ? (T = h.get(
                                                              arguments[y]
                                                          ))
                                                        : (R = !1)),
                                                R ||
                                                    ((T = p.apply(
                                                        null,
                                                        arguments
                                                    )),
                                                    h.set(arguments[y], T)),
                                                n > 0 &&
                                                    ((M[y] = {
                                                        cacheItem: h,
                                                        arg: arguments[y],
                                                    }),
                                                    R ? o(r, M) : r.push(M),
                                                    r.length > n &&
                                                        i(r.shift())),
                                                (d.wasMemoized = R),
                                                (d.numArgs = y + 1),
                                                T
                                            );
                                        };
                                        return (
                                            (d.limit = n),
                                            (d.wasMemoized = !1),
                                            (d.cache = m),
                                            (d.lru = r),
                                            d
                                        );
                                    };
                                };
                                function o(n, m) {
                                    var r = n.length,
                                        p = m.length,
                                        d,
                                        h,
                                        v;
                                    for (h = 0; h < r; h++) {
                                        for (d = !0, v = 0; v < p; v++)
                                            if (!I(n[h][v].arg, m[v].arg)) {
                                                d = !1;
                                                break;
                                            }
                                        if (d) break;
                                    }
                                    n.push(n.splice(h, 1)[0]);
                                }
                                function i(n) {
                                    var m = n.length,
                                        r = n[m - 1],
                                        p,
                                        d;
                                    for (
                                        r.cacheItem.delete(r.arg), d = m - 2;
                                        d >= 0 &&
                                        ((r = n[d]),
                                        (p = r.cacheItem.get(r.arg)),
                                        !p || !p.size);
                                        d--
                                    )
                                        r.cacheItem.delete(r.arg);
                                }
                                function I(n, m) {
                                    return n === m || (n !== n && m !== m);
                                }
                            },
                            { 'map-or-similar': 1 },
                        ],
                    },
                    {},
                    [3]
                )(3);
            });
        });
        f();
        b();
        g();
        f();
        b();
        g();
        f();
        b();
        g();
        f();
        b();
        g();
        var s = __REACT__,
            {
                Children: $e,
                Component: Je,
                Fragment: V,
                Profiler: Qe,
                PureComponent: Xe,
                StrictMode: et,
                Suspense: tt,
                __SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED: ot,
                cloneElement: nt,
                createContext: rt,
                createElement: z,
                createFactory: it,
                createRef: at,
                forwardRef: lt,
                isValidElement: st,
                lazy: ct,
                memo: Q,
                startTransition: pt,
                unstable_act: dt,
                useCallback: X,
                useContext: ut,
                useDebugValue: mt,
                useDeferredValue: It,
                useEffect: O,
                useId: ht,
                useImperativeHandle: ft,
                useInsertionEffect: bt,
                useLayoutEffect: gt,
                useMemo: wt,
                useReducer: vt,
                useRef: ee,
                useState: H,
                useSyncExternalStore: yt,
                useTransition: St,
                version: kt,
            } = __REACT__;
        f();
        b();
        g();
        var Tt = __STORYBOOK_API__,
            {
                ActiveTabs: Rt,
                Consumer: At,
                ManagerContext: xt,
                Provider: Ot,
                RequestResponseError: Lt,
                addons: U,
                combineParameters: Bt,
                controlOrMetaKey: Pt,
                controlOrMetaSymbol: Mt,
                eventMatchesShortcut: Vt,
                eventToShortcut: Dt,
                experimental_MockUniversalStore: Nt,
                experimental_UniversalStore: zt,
                experimental_requestResponse: Ht,
                experimental_useUniversalStore: Ut,
                isMacLike: Gt,
                isShortcutTaken: Ft,
                keyToSymbol: qt,
                merge: Wt,
                mockChannel: Yt,
                optionOrAltSymbol: jt,
                shortcutMatchesShortcut: Kt,
                shortcutToHumanString: Zt,
                types: te,
                useAddonState: $t,
                useArgTypes: Jt,
                useArgs: Qt,
                useChannel: Xt,
                useGlobalTypes: eo,
                useGlobals: G,
                useParameter: F,
                useSharedState: to,
                useStoryPrepared: oo,
                useStorybookApi: oe,
                useStorybookState: no,
            } = __STORYBOOK_API__;
        f();
        b();
        g();
        var so = __STORYBOOK_COMPONENTS__,
            {
                A: co,
                ActionBar: po,
                AddonPanel: uo,
                Badge: mo,
                Bar: Io,
                Blockquote: ho,
                Button: fo,
                ClipboardCode: bo,
                Code: go,
                DL: wo,
                Div: vo,
                DocumentWrapper: yo,
                EmptyTabContent: So,
                ErrorFormatter: ko,
                FlexBar: _o,
                Form: Co,
                H1: Eo,
                H2: To,
                H3: Ro,
                H4: Ao,
                H5: xo,
                H6: Oo,
                HR: Lo,
                IconButton: L,
                IconButtonSkeleton: Bo,
                Icons: Po,
                Img: Mo,
                LI: Vo,
                Link: Do,
                ListItem: No,
                Loader: zo,
                Modal: Ho,
                OL: Uo,
                P: Go,
                Placeholder: Fo,
                Pre: qo,
                ProgressSpinner: Wo,
                ResetWrapper: Yo,
                ScrollArea: jo,
                Separator: Ko,
                Spaced: Zo,
                Span: $o,
                StorybookIcon: Jo,
                StorybookLogo: Qo,
                Symbols: Xo,
                SyntaxHighlighter: en,
                TT: tn,
                TabBar: on,
                TabButton: nn,
                TabWrapper: rn,
                Table: an,
                Tabs: ln,
                TabsState: sn,
                TooltipLinkList: q,
                TooltipMessage: cn,
                TooltipNote: pn,
                UL: dn,
                WithTooltip: W,
                WithTooltipPure: un,
                Zoom: mn,
                codeCommon: In,
                components: hn,
                createCopyToClipboardFunction: fn,
                getStoryHref: bn,
                icons: gn,
                interleaveSeparators: wn,
                nameSpaceClassNames: vn,
                resetComponents: yn,
                withReset: Sn,
            } = __STORYBOOK_COMPONENTS__;
        f();
        b();
        g();
        var Tn = __STORYBOOK_THEMING__,
            {
                CacheProvider: Rn,
                ClassNames: An,
                Global: Y,
                ThemeProvider: xn,
                background: On,
                color: Ln,
                convert: Bn,
                create: Pn,
                createCache: Mn,
                createGlobal: Vn,
                createReset: Dn,
                css: Nn,
                darken: zn,
                ensure: Hn,
                ignoreSsrWarning: Un,
                isPropValid: Gn,
                jsx: Fn,
                keyframes: qn,
                lighten: Wn,
                styled: S,
                themes: Yn,
                typography: jn,
                useTheme: Kn,
                withTheme: Zn,
            } = __STORYBOOK_THEMING__;
        f();
        b();
        g();
        var er = __STORYBOOK_ICONS__,
            {
                AccessibilityAltIcon: tr,
                AccessibilityIcon: or,
                AccessibilityIgnoredIcon: nr,
                AddIcon: rr,
                AdminIcon: ir,
                AlertAltIcon: ar,
                AlertIcon: lr,
                AlignLeftIcon: sr,
                AlignRightIcon: cr,
                AppleIcon: pr,
                ArrowBottomLeftIcon: dr,
                ArrowBottomRightIcon: ur,
                ArrowDownIcon: mr,
                ArrowLeftIcon: Ir,
                ArrowRightIcon: hr,
                ArrowSolidDownIcon: fr,
                ArrowSolidLeftIcon: br,
                ArrowSolidRightIcon: gr,
                ArrowSolidUpIcon: wr,
                ArrowTopLeftIcon: vr,
                ArrowTopRightIcon: yr,
                ArrowUpIcon: Sr,
                AzureDevOpsIcon: kr,
                BackIcon: _r,
                BasketIcon: Cr,
                BatchAcceptIcon: Er,
                BatchDenyIcon: Tr,
                BeakerIcon: Rr,
                BellIcon: Ar,
                BitbucketIcon: xr,
                BoldIcon: Or,
                BookIcon: Lr,
                BookmarkHollowIcon: Br,
                BookmarkIcon: Pr,
                BottomBarIcon: Mr,
                BottomBarToggleIcon: Vr,
                BoxIcon: Dr,
                BranchIcon: Nr,
                BrowserIcon: ne,
                ButtonIcon: zr,
                CPUIcon: Hr,
                CalendarIcon: Ur,
                CameraIcon: Gr,
                CameraStabilizeIcon: Fr,
                CategoryIcon: qr,
                CertificateIcon: Wr,
                ChangedIcon: Yr,
                ChatIcon: jr,
                CheckIcon: Kr,
                ChevronDownIcon: Zr,
                ChevronLeftIcon: $r,
                ChevronRightIcon: Jr,
                ChevronSmallDownIcon: Qr,
                ChevronSmallLeftIcon: Xr,
                ChevronSmallRightIcon: ei,
                ChevronSmallUpIcon: ti,
                ChevronUpIcon: oi,
                ChromaticIcon: ni,
                ChromeIcon: ri,
                CircleHollowIcon: ii,
                CircleIcon: ai,
                ClearIcon: li,
                CloseAltIcon: si,
                CloseIcon: ci,
                CloudHollowIcon: pi,
                CloudIcon: di,
                CogIcon: ui,
                CollapseIcon: mi,
                CommandIcon: Ii,
                CommentAddIcon: hi,
                CommentIcon: fi,
                CommentsIcon: bi,
                CommitIcon: gi,
                CompassIcon: wi,
                ComponentDrivenIcon: vi,
                ComponentIcon: yi,
                ContrastIcon: Si,
                ContrastIgnoredIcon: ki,
                ControlsIcon: _i,
                CopyIcon: Ci,
                CreditIcon: Ei,
                CrossIcon: Ti,
                DashboardIcon: Ri,
                DatabaseIcon: Ai,
                DeleteIcon: xi,
                DiamondIcon: Oi,
                DirectionIcon: Li,
                DiscordIcon: Bi,
                DocChartIcon: Pi,
                DocListIcon: Mi,
                DocumentIcon: Vi,
                DownloadIcon: Di,
                DragIcon: Ni,
                EditIcon: zi,
                EllipsisIcon: Hi,
                EmailIcon: Ui,
                ExpandAltIcon: Gi,
                ExpandIcon: Fi,
                EyeCloseIcon: qi,
                EyeIcon: Wi,
                FaceHappyIcon: Yi,
                FaceNeutralIcon: ji,
                FaceSadIcon: Ki,
                FacebookIcon: Zi,
                FailedIcon: $i,
                FastForwardIcon: Ji,
                FigmaIcon: Qi,
                FilterIcon: Xi,
                FlagIcon: ea,
                FolderIcon: ta,
                FormIcon: oa,
                GDriveIcon: na,
                GithubIcon: ra,
                GitlabIcon: ia,
                GlobeIcon: aa,
                GoogleIcon: la,
                GraphBarIcon: sa,
                GraphLineIcon: ca,
                GraphqlIcon: pa,
                GridAltIcon: da,
                GridIcon: ua,
                GrowIcon: j,
                HeartHollowIcon: ma,
                HeartIcon: Ia,
                HomeIcon: ha,
                HourglassIcon: fa,
                InfoIcon: ba,
                ItalicIcon: ga,
                JumpToIcon: wa,
                KeyIcon: va,
                LightningIcon: ya,
                LightningOffIcon: Sa,
                LinkBrokenIcon: ka,
                LinkIcon: _a,
                LinkedinIcon: Ca,
                LinuxIcon: Ea,
                ListOrderedIcon: Ta,
                ListUnorderedIcon: Ra,
                LocationIcon: Aa,
                LockIcon: xa,
                MarkdownIcon: Oa,
                MarkupIcon: La,
                MediumIcon: Ba,
                MemoryIcon: Pa,
                MenuIcon: Ma,
                MergeIcon: Va,
                MirrorIcon: Da,
                MobileIcon: re,
                MoonIcon: Na,
                NutIcon: za,
                OutboxIcon: Ha,
                OutlineIcon: Ua,
                PaintBrushIcon: Ga,
                PaperClipIcon: Fa,
                ParagraphIcon: qa,
                PassedIcon: Wa,
                PhoneIcon: Ya,
                PhotoDragIcon: ja,
                PhotoIcon: Ka,
                PhotoStabilizeIcon: Za,
                PinAltIcon: $a,
                PinIcon: Ja,
                PlayAllHollowIcon: Qa,
                PlayBackIcon: Xa,
                PlayHollowIcon: el,
                PlayIcon: tl,
                PlayNextIcon: ol,
                PlusIcon: nl,
                PointerDefaultIcon: rl,
                PointerHandIcon: il,
                PowerIcon: al,
                PrintIcon: ll,
                ProceedIcon: sl,
                ProfileIcon: cl,
                PullRequestIcon: pl,
                QuestionIcon: dl,
                RSSIcon: ul,
                RedirectIcon: ml,
                ReduxIcon: Il,
                RefreshIcon: ie,
                ReplyIcon: hl,
                RepoIcon: fl,
                RequestChangeIcon: bl,
                RewindIcon: gl,
                RulerIcon: wl,
                SaveIcon: vl,
                SearchIcon: yl,
                ShareAltIcon: Sl,
                ShareIcon: kl,
                ShieldIcon: _l,
                SideBySideIcon: Cl,
                SidebarAltIcon: El,
                SidebarAltToggleIcon: Tl,
                SidebarIcon: Rl,
                SidebarToggleIcon: Al,
                SpeakerIcon: xl,
                StackedIcon: Ol,
                StarHollowIcon: Ll,
                StarIcon: Bl,
                StatusFailIcon: Pl,
                StatusIcon: Ml,
                StatusPassIcon: Vl,
                StatusWarnIcon: Dl,
                StickerIcon: Nl,
                StopAltHollowIcon: zl,
                StopAltIcon: Hl,
                StopIcon: Ul,
                StorybookIcon: Gl,
                StructureIcon: Fl,
                SubtractIcon: ql,
                SunIcon: Wl,
                SupportIcon: Yl,
                SweepIcon: jl,
                SwitchAltIcon: Kl,
                SyncIcon: Zl,
                TabletIcon: ae,
                ThumbsUpIcon: $l,
                TimeIcon: Jl,
                TimerIcon: Ql,
                TransferIcon: K,
                TrashIcon: Xl,
                TwitterIcon: es,
                TypeIcon: ts,
                UbuntuIcon: os,
                UndoIcon: ns,
                UnfoldIcon: rs,
                UnlockIcon: is,
                UnpinIcon: as,
                UploadIcon: ls,
                UserAddIcon: ss,
                UserAltIcon: cs,
                UserIcon: ps,
                UsersIcon: ds,
                VSCodeIcon: us,
                VerifiedIcon: ms,
                VideoIcon: Is,
                WandIcon: hs,
                WatchIcon: fs,
                WindowsIcon: bs,
                WrenchIcon: gs,
                XIcon: ws,
                YoutubeIcon: vs,
                ZoomIcon: ys,
                ZoomOutIcon: Ss,
                ZoomResetIcon: ks,
                iconList: _s,
            } = __STORYBOOK_ICONS__;
        var $ = ye(se()),
            B = 'storybook/viewport',
            A = 'viewport',
            de = {
                mobile1: {
                    name: 'Small mobile',
                    styles: { height: '568px', width: '320px' },
                    type: 'mobile',
                },
                mobile2: {
                    name: 'Large mobile',
                    styles: { height: '896px', width: '414px' },
                    type: 'mobile',
                },
                tablet: {
                    name: 'Tablet',
                    styles: { height: '1112px', width: '834px' },
                    type: 'tablet',
                },
            },
            P = {
                name: 'Reset viewport',
                styles: { height: '100%', width: '100%' },
                type: 'desktop',
            },
            ke = { [A]: { value: void 0, isRotated: !1 } },
            _e = { viewport: 'reset', viewportRotated: !1 },
            Ce = globalThis.FEATURES?.viewportStoryGlobals ? ke : _e,
            ue = (e, t) => e.indexOf(t),
            Ee = (e, t) => {
                let a = ue(e, t);
                return a === e.length - 1 ? e[0] : e[a + 1];
            },
            Te = (e, t) => {
                let a = ue(e, t);
                return a < 1 ? e[e.length - 1] : e[a - 1];
            },
            me = async (e, t, a, c) => {
                (await e.setAddonShortcut(B, {
                    label: 'Previous viewport',
                    defaultShortcut: ['alt', 'shift', 'V'],
                    actionName: 'previous',
                    action: () => {
                        a({ viewport: Te(c, t) });
                    },
                }),
                    await e.setAddonShortcut(B, {
                        label: 'Next viewport',
                        defaultShortcut: ['alt', 'V'],
                        actionName: 'next',
                        action: () => {
                            a({ viewport: Ee(c, t) });
                        },
                    }),
                    await e.setAddonShortcut(B, {
                        label: 'Reset viewport',
                        defaultShortcut: ['alt', 'control', 'V'],
                        actionName: 'reset',
                        action: () => {
                            a(Ce);
                        },
                    }));
            },
            Re = S.div({ display: 'inline-flex', alignItems: 'center' }),
            ce = S.div(({ theme: e }) => ({
                display: 'inline-block',
                textDecoration: 'none',
                padding: 10,
                fontWeight: e.typography.weight.bold,
                fontSize: e.typography.size.s2 - 1,
                lineHeight: '1',
                height: 40,
                border: 'none',
                borderTop: '3px solid transparent',
                borderBottom: '3px solid transparent',
                background: 'transparent',
            })),
            Ae = S(L)(() => ({ display: 'inline-flex', alignItems: 'center' })),
            xe = S.div(({ theme: e }) => ({
                fontSize: e.typography.size.s2 - 1,
                marginLeft: 10,
            })),
            Oe = {
                desktop: s.createElement(ne, null),
                mobile: s.createElement(re, null),
                tablet: s.createElement(ae, null),
                other: s.createElement(V, null),
            },
            Le = ({ api: e }) => {
                let t = F(A),
                    [a, c, l] = G(),
                    [w, u] = H(!1),
                    { options: o = de, disable: i } = t || {},
                    I = a?.[A] || {},
                    n = I.value,
                    m = I.isRotated,
                    r = o[n] || P,
                    p = w || r !== P,
                    d = A in l,
                    h = Object.keys(o).length;
                if (
                    (O(() => {
                        me(e, n, c, Object.keys(o));
                    }, [o, n, c, e]),
                    r.styles === null || !o || h < 1)
                )
                    return null;
                if (typeof r.styles == 'function')
                    return (
                        console.warn(
                            'Addon Viewport no longer supports dynamic styles using a function, use css calc() instead'
                        ),
                        null
                    );
                let v = m ? r.styles.height : r.styles.width,
                    T = m ? r.styles.width : r.styles.height;
                return i
                    ? null
                    : s.createElement(Be, {
                          item: r,
                          updateGlobals: c,
                          viewportMap: o,
                          viewportName: n,
                          isRotated: m,
                          setIsTooltipVisible: u,
                          isLocked: d,
                          isActive: p,
                          width: v,
                          height: T,
                      });
            },
            Be = s.memo(function (e) {
                let {
                        item: t,
                        viewportMap: a,
                        viewportName: c,
                        isRotated: l,
                        updateGlobals: w,
                        setIsTooltipVisible: u,
                        isLocked: o,
                        isActive: i,
                        width: I,
                        height: n,
                    } = e,
                    m = X((r) => w({ [A]: r }), [w]);
                return s.createElement(
                    V,
                    null,
                    s.createElement(
                        W,
                        {
                            placement: 'bottom',
                            tooltip: ({ onHide: r }) =>
                                s.createElement(q, {
                                    links: [
                                        ...(length > 0 && t !== P
                                            ? [
                                                  {
                                                      id: 'reset',
                                                      title: 'Reset viewport',
                                                      icon: s.createElement(
                                                          ie,
                                                          null
                                                      ),
                                                      onClick: () => {
                                                          (m({
                                                              value: void 0,
                                                              isRotated: !1,
                                                          }),
                                                              r());
                                                      },
                                                  },
                                              ]
                                            : []),
                                        ...Object.entries(a).map(([p, d]) => ({
                                            id: p,
                                            title: d.name,
                                            icon: Oe[d.type],
                                            active: p === c,
                                            onClick: () => {
                                                (m({ value: p, isRotated: !1 }),
                                                    r());
                                            },
                                        })),
                                    ].flat(),
                                }),
                            closeOnOutsideClick: !0,
                            onVisibleChange: u,
                        },
                        s.createElement(
                            Ae,
                            {
                                disabled: o,
                                key: 'viewport',
                                title: 'Change the size of the preview',
                                active: i,
                                onDoubleClick: () => {
                                    m({ value: void 0, isRotated: !1 });
                                },
                            },
                            s.createElement(j, null),
                            t !== P
                                ? s.createElement(
                                      xe,
                                      null,
                                      t.name,
                                      ' ',
                                      l ? '(L)' : '(P)'
                                  )
                                : null
                        )
                    ),
                    s.createElement(Y, {
                        styles: {
                            'iframe[data-is-storybook="true"]': {
                                width: I,
                                height: n,
                            },
                        },
                    }),
                    t !== P
                        ? s.createElement(
                              Re,
                              null,
                              s.createElement(
                                  ce,
                                  { title: 'Viewport width' },
                                  I.replace('px', '')
                              ),
                              o
                                  ? '/'
                                  : s.createElement(
                                        L,
                                        {
                                            key: 'viewport-rotate',
                                            title: 'Rotate viewport',
                                            onClick: () => {
                                                m({ value: c, isRotated: !l });
                                            },
                                        },
                                        s.createElement(K, null)
                                    ),
                              s.createElement(
                                  ce,
                                  { title: 'Viewport height' },
                                  n.replace('px', '')
                              )
                          )
                        : null
                );
            }),
            Pe = (0, $.default)(50)((e) => [
                ...Me,
                ...Object.entries(e).map(([t, { name: a, ...c }]) => ({
                    ...c,
                    id: t,
                    title: a,
                })),
            ]),
            D = {
                id: 'reset',
                title: 'Reset viewport',
                styles: null,
                type: 'other',
            },
            Me = [D],
            Ve = (0, $.default)(50)((e, t, a, c) =>
                e
                    .filter((l) => l.id !== D.id || t.id !== l.id)
                    .map((l) => ({
                        ...l,
                        onClick: () => {
                            (a({ viewport: l.id }), c());
                        },
                    }))
            ),
            De = ({ width: e, height: t, ...a }) => ({
                ...a,
                height: e,
                width: t,
            }),
            Ne = S.div({ display: 'inline-flex', alignItems: 'center' }),
            pe = S.div(({ theme: e }) => ({
                display: 'inline-block',
                textDecoration: 'none',
                padding: 10,
                fontWeight: e.typography.weight.bold,
                fontSize: e.typography.size.s2 - 1,
                lineHeight: '1',
                height: 40,
                border: 'none',
                borderTop: '3px solid transparent',
                borderBottom: '3px solid transparent',
                background: 'transparent',
            })),
            ze = S(L)(() => ({ display: 'inline-flex', alignItems: 'center' })),
            He = S.div(({ theme: e }) => ({
                fontSize: e.typography.size.s2 - 1,
                marginLeft: 10,
            })),
            Ue = (e, t, a) => {
                if (t === null) return;
                let c = typeof t == 'function' ? t(e) : t;
                return a ? De(c) : c;
            },
            Ge = Q(function () {
                let [e, t] = G(),
                    {
                        viewports: a = de,
                        defaultOrientation: c,
                        defaultViewport: l,
                        disable: w,
                    } = F(A, {}),
                    u = Pe(a),
                    o = oe(),
                    [i, I] = H(!1);
                (l &&
                    !u.find((p) => p.id === l) &&
                    console.warn(
                        `Cannot find "defaultViewport" of "${l}" in addon-viewport configs, please check the "viewports" setting in the configuration.`
                    ),
                    O(() => {
                        me(o, e, t, Object.keys(a));
                    }, [a, e, e.viewport, t, o]),
                    O(() => {
                        let p = c === 'landscape';
                        ((l && e.viewport !== l) ||
                            (c && e.viewportRotated !== p)) &&
                            t({ viewport: l, viewportRotated: p });
                    }, [c, l, t]));
                let n =
                        u.find((p) => p.id === e.viewport) ||
                        u.find((p) => p.id === l) ||
                        u.find((p) => p.default) ||
                        D,
                    m = ee(),
                    r = Ue(m.current, n.styles, e.viewportRotated);
                return (
                    O(() => {
                        m.current = r;
                    }, [n]),
                    w || Object.entries(a).length === 0
                        ? null
                        : s.createElement(
                              V,
                              null,
                              s.createElement(
                                  W,
                                  {
                                      placement: 'top',
                                      tooltip: ({ onHide: p }) =>
                                          s.createElement(q, {
                                              links: Ve(u, n, t, p),
                                          }),
                                      closeOnOutsideClick: !0,
                                      onVisibleChange: I,
                                  },
                                  s.createElement(
                                      ze,
                                      {
                                          key: 'viewport',
                                          title: 'Change the size of the preview',
                                          active: i || !!r,
                                          onDoubleClick: () => {
                                              t({ viewport: D.id });
                                          },
                                      },
                                      s.createElement(j, null),
                                      r
                                          ? s.createElement(
                                                He,
                                                null,
                                                e.viewportRotated
                                                    ? `${n.title} (L)`
                                                    : `${n.title} (P)`
                                            )
                                          : null
                                  )
                              ),
                              r
                                  ? s.createElement(
                                        Ne,
                                        null,
                                        s.createElement(Y, {
                                            styles: {
                                                'iframe[data-is-storybook="true"]':
                                                    {
                                                        ...(r || {
                                                            width: '100%',
                                                            height: '100%',
                                                        }),
                                                    },
                                            },
                                        }),
                                        s.createElement(
                                            pe,
                                            { title: 'Viewport width' },
                                            r.width.replace('px', '')
                                        ),
                                        s.createElement(
                                            L,
                                            {
                                                key: 'viewport-rotate',
                                                title: 'Rotate viewport',
                                                onClick: () => {
                                                    t({
                                                        viewportRotated:
                                                            !e.viewportRotated,
                                                    });
                                                },
                                            },
                                            s.createElement(K, null)
                                        ),
                                        s.createElement(
                                            pe,
                                            { title: 'Viewport height' },
                                            r.height.replace('px', '')
                                        )
                                    )
                                  : null
                          )
                );
            });
        U.register(B, (e) => {
            U.add(B, {
                title: 'viewport / media-queries',
                type: te.TOOL,
                match: ({ viewMode: t, tabId: a }) => t === 'story' && !a,
                render: () =>
                    FEATURES?.viewportStoryGlobals
                        ? z(Le, { api: e })
                        : z(Ge, null),
            });
        });
    })();
} catch (e) {
    console.error(
        '[Storybook] One of your manager-entries failed: ' + import.meta.url,
        e
    );
}
