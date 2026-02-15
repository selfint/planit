try {
    (() => {
        var re = Object.create;
        var W = Object.defineProperty;
        var ae = Object.getOwnPropertyDescriptor;
        var ie = Object.getOwnPropertyNames;
        var ce = Object.getPrototypeOf,
            le = Object.prototype.hasOwnProperty;
        var w = ((e) =>
            typeof require < 'u'
                ? require
                : typeof Proxy < 'u'
                  ? new Proxy(e, {
                        get: (o, c) => (typeof require < 'u' ? require : o)[c],
                    })
                  : e)(function (e) {
            if (typeof require < 'u') return require.apply(this, arguments);
            throw Error('Dynamic require of "' + e + '" is not supported');
        });
        var M = (e, o) => () => (e && (o = e((e = 0))), o);
        var se = (e, o) => () => (
            o || e((o = { exports: {} }).exports, o),
            o.exports
        );
        var ue = (e, o, c, r) => {
            if ((o && typeof o == 'object') || typeof o == 'function')
                for (let a of ie(o))
                    !le.call(e, a) &&
                        a !== c &&
                        W(e, a, {
                            get: () => o[a],
                            enumerable: !(r = ae(o, a)) || r.enumerable,
                        });
            return e;
        };
        var de = (e, o, c) => (
            (c = e != null ? re(ce(e)) : {}),
            ue(
                o || !e || !e.__esModule
                    ? W(c, 'default', { value: e, enumerable: !0 })
                    : c,
                e
            )
        );
        var m = M(() => {});
        var h = M(() => {});
        var f = M(() => {});
        var X = se((Q, V) => {
            m();
            h();
            f();
            (function (e) {
                if (typeof Q == 'object' && typeof V < 'u') V.exports = e();
                else if (typeof define == 'function' && define.amd)
                    define([], e);
                else {
                    var o;
                    (typeof window < 'u' || typeof window < 'u'
                        ? (o = window)
                        : typeof self < 'u'
                          ? (o = self)
                          : (o = this),
                        (o.memoizerific = e()));
                }
            })(function () {
                var e, o, c;
                return (function r(a, p, l) {
                    function t(i, d) {
                        if (!p[i]) {
                            if (!a[i]) {
                                var s = typeof w == 'function' && w;
                                if (!d && s) return s(i, !0);
                                if (n) return n(i, !0);
                                var k = new Error(
                                    "Cannot find module '" + i + "'"
                                );
                                throw ((k.code = 'MODULE_NOT_FOUND'), k);
                            }
                            var I = (p[i] = { exports: {} });
                            a[i][0].call(
                                I.exports,
                                function (b) {
                                    var _ = a[i][1][b];
                                    return t(_ || b);
                                },
                                I,
                                I.exports,
                                r,
                                a,
                                p,
                                l
                            );
                        }
                        return p[i].exports;
                    }
                    for (
                        var n = typeof w == 'function' && w, u = 0;
                        u < l.length;
                        u++
                    )
                        t(l[u]);
                    return t;
                })(
                    {
                        1: [
                            function (r, a, p) {
                                a.exports = function (l) {
                                    if (typeof Map != 'function' || l) {
                                        var t = r('./similar');
                                        return new t();
                                    } else return new Map();
                                };
                            },
                            { './similar': 2 },
                        ],
                        2: [
                            function (r, a, p) {
                                function l() {
                                    return (
                                        (this.list = []),
                                        (this.lastItem = void 0),
                                        (this.size = 0),
                                        this
                                    );
                                }
                                ((l.prototype.get = function (t) {
                                    var n;
                                    if (
                                        this.lastItem &&
                                        this.isEqual(this.lastItem.key, t)
                                    )
                                        return this.lastItem.val;
                                    if (((n = this.indexOf(t)), n >= 0))
                                        return (
                                            (this.lastItem = this.list[n]),
                                            this.list[n].val
                                        );
                                }),
                                    (l.prototype.set = function (t, n) {
                                        var u;
                                        return this.lastItem &&
                                            this.isEqual(this.lastItem.key, t)
                                            ? ((this.lastItem.val = n), this)
                                            : ((u = this.indexOf(t)),
                                              u >= 0
                                                  ? ((this.lastItem =
                                                        this.list[u]),
                                                    (this.list[u].val = n),
                                                    this)
                                                  : ((this.lastItem = {
                                                        key: t,
                                                        val: n,
                                                    }),
                                                    this.list.push(
                                                        this.lastItem
                                                    ),
                                                    this.size++,
                                                    this));
                                    }),
                                    (l.prototype.delete = function (t) {
                                        var n;
                                        if (
                                            (this.lastItem &&
                                                this.isEqual(
                                                    this.lastItem.key,
                                                    t
                                                ) &&
                                                (this.lastItem = void 0),
                                            (n = this.indexOf(t)),
                                            n >= 0)
                                        )
                                            return (
                                                this.size--,
                                                this.list.splice(n, 1)[0]
                                            );
                                    }),
                                    (l.prototype.has = function (t) {
                                        var n;
                                        return this.lastItem &&
                                            this.isEqual(this.lastItem.key, t)
                                            ? !0
                                            : ((n = this.indexOf(t)),
                                              n >= 0
                                                  ? ((this.lastItem =
                                                        this.list[n]),
                                                    !0)
                                                  : !1);
                                    }),
                                    (l.prototype.forEach = function (t, n) {
                                        var u;
                                        for (u = 0; u < this.size; u++)
                                            t.call(
                                                n || this,
                                                this.list[u].val,
                                                this.list[u].key,
                                                this
                                            );
                                    }),
                                    (l.prototype.indexOf = function (t) {
                                        var n;
                                        for (n = 0; n < this.size; n++)
                                            if (
                                                this.isEqual(
                                                    this.list[n].key,
                                                    t
                                                )
                                            )
                                                return n;
                                        return -1;
                                    }),
                                    (l.prototype.isEqual = function (t, n) {
                                        return t === n || (t !== t && n !== n);
                                    }),
                                    (a.exports = l));
                            },
                            {},
                        ],
                        3: [
                            function (r, a, p) {
                                var l = r('map-or-similar');
                                a.exports = function (i) {
                                    var d = new l(!1),
                                        s = [];
                                    return function (k) {
                                        var I = function () {
                                            var b = d,
                                                _,
                                                R,
                                                T = arguments.length - 1,
                                                x = Array(T + 1),
                                                O = !0,
                                                A;
                                            if (
                                                (I.numArgs ||
                                                    I.numArgs === 0) &&
                                                I.numArgs !== T + 1
                                            )
                                                throw new Error(
                                                    'Memoizerific functions should always be called with the same number of arguments'
                                                );
                                            for (A = 0; A < T; A++) {
                                                if (
                                                    ((x[A] = {
                                                        cacheItem: b,
                                                        arg: arguments[A],
                                                    }),
                                                    b.has(arguments[A]))
                                                ) {
                                                    b = b.get(arguments[A]);
                                                    continue;
                                                }
                                                ((O = !1),
                                                    (_ = new l(!1)),
                                                    b.set(arguments[A], _),
                                                    (b = _));
                                            }
                                            return (
                                                O &&
                                                    (b.has(arguments[T])
                                                        ? (R = b.get(
                                                              arguments[T]
                                                          ))
                                                        : (O = !1)),
                                                O ||
                                                    ((R = k.apply(
                                                        null,
                                                        arguments
                                                    )),
                                                    b.set(arguments[T], R)),
                                                i > 0 &&
                                                    ((x[T] = {
                                                        cacheItem: b,
                                                        arg: arguments[T],
                                                    }),
                                                    O ? t(s, x) : s.push(x),
                                                    s.length > i &&
                                                        n(s.shift())),
                                                (I.wasMemoized = O),
                                                (I.numArgs = T + 1),
                                                R
                                            );
                                        };
                                        return (
                                            (I.limit = i),
                                            (I.wasMemoized = !1),
                                            (I.cache = d),
                                            (I.lru = s),
                                            I
                                        );
                                    };
                                };
                                function t(i, d) {
                                    var s = i.length,
                                        k = d.length,
                                        I,
                                        b,
                                        _;
                                    for (b = 0; b < s; b++) {
                                        for (I = !0, _ = 0; _ < k; _++)
                                            if (!u(i[b][_].arg, d[_].arg)) {
                                                I = !1;
                                                break;
                                            }
                                        if (I) break;
                                    }
                                    i.push(i.splice(b, 1)[0]);
                                }
                                function n(i) {
                                    var d = i.length,
                                        s = i[d - 1],
                                        k,
                                        I;
                                    for (
                                        s.cacheItem.delete(s.arg), I = d - 2;
                                        I >= 0 &&
                                        ((s = i[I]),
                                        (k = s.cacheItem.get(s.arg)),
                                        !k || !k.size);
                                        I--
                                    )
                                        s.cacheItem.delete(s.arg);
                                }
                                function u(i, d) {
                                    return i === d || (i !== i && d !== d);
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
        m();
        h();
        f();
        m();
        h();
        f();
        m();
        h();
        f();
        m();
        h();
        f();
        var g = __REACT__,
            {
                Children: we,
                Component: Ee,
                Fragment: D,
                Profiler: Be,
                PureComponent: Re,
                StrictMode: xe,
                Suspense: Le,
                __SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED: Pe,
                cloneElement: Me,
                createContext: De,
                createElement: Ge,
                createFactory: Ue,
                createRef: Ne,
                forwardRef: Fe,
                isValidElement: He,
                lazy: qe,
                memo: E,
                startTransition: ze,
                unstable_act: Ke,
                useCallback: G,
                useContext: Ve,
                useDebugValue: Ye,
                useDeferredValue: We,
                useEffect: je,
                useId: $e,
                useImperativeHandle: Ze,
                useInsertionEffect: Je,
                useLayoutEffect: Qe,
                useMemo: j,
                useReducer: Xe,
                useRef: eo,
                useState: U,
                useSyncExternalStore: oo,
                useTransition: no,
                version: to,
            } = __REACT__;
        m();
        h();
        f();
        var lo = __STORYBOOK_API__,
            {
                ActiveTabs: so,
                Consumer: uo,
                ManagerContext: po,
                Provider: Io,
                RequestResponseError: mo,
                addons: N,
                combineParameters: ho,
                controlOrMetaKey: fo,
                controlOrMetaSymbol: go,
                eventMatchesShortcut: bo,
                eventToShortcut: ko,
                experimental_MockUniversalStore: _o,
                experimental_UniversalStore: vo,
                experimental_requestResponse: yo,
                experimental_useUniversalStore: So,
                isMacLike: Co,
                isShortcutTaken: To,
                keyToSymbol: Ao,
                merge: Oo,
                mockChannel: wo,
                optionOrAltSymbol: Eo,
                shortcutMatchesShortcut: Bo,
                shortcutToHumanString: Ro,
                types: $,
                useAddonState: xo,
                useArgTypes: Lo,
                useArgs: Po,
                useChannel: Mo,
                useGlobalTypes: Do,
                useGlobals: L,
                useParameter: P,
                useSharedState: Go,
                useStoryPrepared: Uo,
                useStorybookApi: No,
                useStorybookState: Fo,
            } = __STORYBOOK_API__;
        m();
        h();
        f();
        var Vo = __STORYBOOK_COMPONENTS__,
            {
                A: Yo,
                ActionBar: Wo,
                AddonPanel: jo,
                Badge: $o,
                Bar: Zo,
                Blockquote: Jo,
                Button: Qo,
                ClipboardCode: Xo,
                Code: en,
                DL: on,
                Div: nn,
                DocumentWrapper: tn,
                EmptyTabContent: rn,
                ErrorFormatter: an,
                FlexBar: cn,
                Form: ln,
                H1: sn,
                H2: un,
                H3: dn,
                H4: pn,
                H5: In,
                H6: mn,
                HR: hn,
                IconButton: B,
                IconButtonSkeleton: fn,
                Icons: gn,
                Img: bn,
                LI: kn,
                Link: _n,
                ListItem: vn,
                Loader: yn,
                Modal: Sn,
                OL: Cn,
                P: Tn,
                Placeholder: An,
                Pre: On,
                ProgressSpinner: wn,
                ResetWrapper: En,
                ScrollArea: Bn,
                Separator: Rn,
                Spaced: xn,
                Span: Ln,
                StorybookIcon: Pn,
                StorybookLogo: Mn,
                Symbols: Dn,
                SyntaxHighlighter: Gn,
                TT: Un,
                TabBar: Nn,
                TabButton: Fn,
                TabWrapper: Hn,
                Table: qn,
                Tabs: zn,
                TabsState: Kn,
                TooltipLinkList: F,
                TooltipMessage: Vn,
                TooltipNote: Yn,
                UL: Wn,
                WithTooltip: H,
                WithTooltipPure: jn,
                Zoom: $n,
                codeCommon: Zn,
                components: Jn,
                createCopyToClipboardFunction: Qn,
                getStoryHref: Xn,
                icons: et,
                interleaveSeparators: ot,
                nameSpaceClassNames: nt,
                resetComponents: tt,
                withReset: rt,
            } = __STORYBOOK_COMPONENTS__;
        m();
        h();
        f();
        var st = __STORYBOOK_ICONS__,
            {
                AccessibilityAltIcon: ut,
                AccessibilityIcon: dt,
                AccessibilityIgnoredIcon: pt,
                AddIcon: It,
                AdminIcon: mt,
                AlertAltIcon: ht,
                AlertIcon: ft,
                AlignLeftIcon: gt,
                AlignRightIcon: bt,
                AppleIcon: kt,
                ArrowBottomLeftIcon: _t,
                ArrowBottomRightIcon: vt,
                ArrowDownIcon: yt,
                ArrowLeftIcon: St,
                ArrowRightIcon: Ct,
                ArrowSolidDownIcon: Tt,
                ArrowSolidLeftIcon: At,
                ArrowSolidRightIcon: Ot,
                ArrowSolidUpIcon: wt,
                ArrowTopLeftIcon: Et,
                ArrowTopRightIcon: Bt,
                ArrowUpIcon: Rt,
                AzureDevOpsIcon: xt,
                BackIcon: Lt,
                BasketIcon: Pt,
                BatchAcceptIcon: Mt,
                BatchDenyIcon: Dt,
                BeakerIcon: Gt,
                BellIcon: Ut,
                BitbucketIcon: Nt,
                BoldIcon: Ft,
                BookIcon: Ht,
                BookmarkHollowIcon: qt,
                BookmarkIcon: zt,
                BottomBarIcon: Kt,
                BottomBarToggleIcon: Vt,
                BoxIcon: Yt,
                BranchIcon: Wt,
                BrowserIcon: jt,
                ButtonIcon: $t,
                CPUIcon: Zt,
                CalendarIcon: Jt,
                CameraIcon: Qt,
                CameraStabilizeIcon: Xt,
                CategoryIcon: er,
                CertificateIcon: or,
                ChangedIcon: nr,
                ChatIcon: tr,
                CheckIcon: rr,
                ChevronDownIcon: ar,
                ChevronLeftIcon: ir,
                ChevronRightIcon: cr,
                ChevronSmallDownIcon: lr,
                ChevronSmallLeftIcon: sr,
                ChevronSmallRightIcon: ur,
                ChevronSmallUpIcon: dr,
                ChevronUpIcon: pr,
                ChromaticIcon: Ir,
                ChromeIcon: mr,
                CircleHollowIcon: hr,
                CircleIcon: Z,
                ClearIcon: fr,
                CloseAltIcon: gr,
                CloseIcon: br,
                CloudHollowIcon: kr,
                CloudIcon: _r,
                CogIcon: vr,
                CollapseIcon: yr,
                CommandIcon: Sr,
                CommentAddIcon: Cr,
                CommentIcon: Tr,
                CommentsIcon: Ar,
                CommitIcon: Or,
                CompassIcon: wr,
                ComponentDrivenIcon: Er,
                ComponentIcon: Br,
                ContrastIcon: Rr,
                ContrastIgnoredIcon: xr,
                ControlsIcon: Lr,
                CopyIcon: Pr,
                CreditIcon: Mr,
                CrossIcon: Dr,
                DashboardIcon: Gr,
                DatabaseIcon: Ur,
                DeleteIcon: Nr,
                DiamondIcon: Fr,
                DirectionIcon: Hr,
                DiscordIcon: qr,
                DocChartIcon: zr,
                DocListIcon: Kr,
                DocumentIcon: Vr,
                DownloadIcon: Yr,
                DragIcon: Wr,
                EditIcon: jr,
                EllipsisIcon: $r,
                EmailIcon: Zr,
                ExpandAltIcon: Jr,
                ExpandIcon: Qr,
                EyeCloseIcon: Xr,
                EyeIcon: ea,
                FaceHappyIcon: oa,
                FaceNeutralIcon: na,
                FaceSadIcon: ta,
                FacebookIcon: ra,
                FailedIcon: aa,
                FastForwardIcon: ia,
                FigmaIcon: ca,
                FilterIcon: la,
                FlagIcon: sa,
                FolderIcon: ua,
                FormIcon: da,
                GDriveIcon: pa,
                GithubIcon: Ia,
                GitlabIcon: ma,
                GlobeIcon: ha,
                GoogleIcon: fa,
                GraphBarIcon: ga,
                GraphLineIcon: ba,
                GraphqlIcon: ka,
                GridAltIcon: _a,
                GridIcon: q,
                GrowIcon: va,
                HeartHollowIcon: ya,
                HeartIcon: Sa,
                HomeIcon: Ca,
                HourglassIcon: Ta,
                InfoIcon: Aa,
                ItalicIcon: Oa,
                JumpToIcon: wa,
                KeyIcon: Ea,
                LightningIcon: Ba,
                LightningOffIcon: Ra,
                LinkBrokenIcon: xa,
                LinkIcon: La,
                LinkedinIcon: Pa,
                LinuxIcon: Ma,
                ListOrderedIcon: Da,
                ListUnorderedIcon: Ga,
                LocationIcon: Ua,
                LockIcon: Na,
                MarkdownIcon: Fa,
                MarkupIcon: Ha,
                MediumIcon: qa,
                MemoryIcon: za,
                MenuIcon: Ka,
                MergeIcon: Va,
                MirrorIcon: Ya,
                MobileIcon: Wa,
                MoonIcon: ja,
                NutIcon: $a,
                OutboxIcon: Za,
                OutlineIcon: Ja,
                PaintBrushIcon: Qa,
                PaperClipIcon: Xa,
                ParagraphIcon: ei,
                PassedIcon: oi,
                PhoneIcon: ni,
                PhotoDragIcon: ti,
                PhotoIcon: z,
                PhotoStabilizeIcon: ri,
                PinAltIcon: ai,
                PinIcon: ii,
                PlayAllHollowIcon: ci,
                PlayBackIcon: li,
                PlayHollowIcon: si,
                PlayIcon: ui,
                PlayNextIcon: di,
                PlusIcon: pi,
                PointerDefaultIcon: Ii,
                PointerHandIcon: mi,
                PowerIcon: hi,
                PrintIcon: fi,
                ProceedIcon: gi,
                ProfileIcon: bi,
                PullRequestIcon: ki,
                QuestionIcon: _i,
                RSSIcon: vi,
                RedirectIcon: yi,
                ReduxIcon: Si,
                RefreshIcon: J,
                ReplyIcon: Ci,
                RepoIcon: Ti,
                RequestChangeIcon: Ai,
                RewindIcon: Oi,
                RulerIcon: wi,
                SaveIcon: Ei,
                SearchIcon: Bi,
                ShareAltIcon: Ri,
                ShareIcon: xi,
                ShieldIcon: Li,
                SideBySideIcon: Pi,
                SidebarAltIcon: Mi,
                SidebarAltToggleIcon: Di,
                SidebarIcon: Gi,
                SidebarToggleIcon: Ui,
                SpeakerIcon: Ni,
                StackedIcon: Fi,
                StarHollowIcon: Hi,
                StarIcon: qi,
                StatusFailIcon: zi,
                StatusIcon: Ki,
                StatusPassIcon: Vi,
                StatusWarnIcon: Yi,
                StickerIcon: Wi,
                StopAltHollowIcon: ji,
                StopAltIcon: $i,
                StopIcon: Zi,
                StorybookIcon: Ji,
                StructureIcon: Qi,
                SubtractIcon: Xi,
                SunIcon: ec,
                SupportIcon: oc,
                SweepIcon: nc,
                SwitchAltIcon: tc,
                SyncIcon: rc,
                TabletIcon: ac,
                ThumbsUpIcon: ic,
                TimeIcon: cc,
                TimerIcon: lc,
                TransferIcon: sc,
                TrashIcon: uc,
                TwitterIcon: dc,
                TypeIcon: pc,
                UbuntuIcon: Ic,
                UndoIcon: mc,
                UnfoldIcon: hc,
                UnlockIcon: fc,
                UnpinIcon: gc,
                UploadIcon: bc,
                UserAddIcon: kc,
                UserAltIcon: _c,
                UserIcon: vc,
                UsersIcon: yc,
                VSCodeIcon: Sc,
                VerifiedIcon: Cc,
                VideoIcon: Tc,
                WandIcon: Ac,
                WatchIcon: Oc,
                WindowsIcon: wc,
                WrenchIcon: Ec,
                XIcon: Bc,
                YoutubeIcon: Rc,
                ZoomIcon: xc,
                ZoomOutIcon: Lc,
                ZoomResetIcon: Pc,
                iconList: Mc,
            } = __STORYBOOK_ICONS__;
        m();
        h();
        f();
        var Fc = __STORYBOOK_CLIENT_LOGGER__,
            {
                deprecate: Hc,
                logger: K,
                once: qc,
                pretty: zc,
            } = __STORYBOOK_CLIENT_LOGGER__;
        var Y = de(X());
        m();
        h();
        f();
        var Qc = __STORYBOOK_THEMING__,
            {
                CacheProvider: Xc,
                ClassNames: el,
                Global: ol,
                ThemeProvider: nl,
                background: tl,
                color: rl,
                convert: al,
                create: il,
                createCache: cl,
                createGlobal: ll,
                createReset: sl,
                css: ul,
                darken: dl,
                ensure: pl,
                ignoreSsrWarning: Il,
                isPropValid: ml,
                jsx: hl,
                keyframes: fl,
                lighten: gl,
                styled: ee,
                themes: bl,
                typography: kl,
                useTheme: _l,
                withTheme: vl,
            } = __STORYBOOK_THEMING__;
        m();
        h();
        f();
        function oe(e) {
            for (var o = [], c = 1; c < arguments.length; c++)
                o[c - 1] = arguments[c];
            var r = Array.from(typeof e == 'string' ? [e] : e);
            r[r.length - 1] = r[r.length - 1].replace(/\r?\n([\t ]*)$/, '');
            var a = r.reduce(function (t, n) {
                var u = n.match(/\n([\t ]+|(?!\s).)/g);
                return u
                    ? t.concat(
                          u.map(function (i) {
                              var d, s;
                              return (s =
                                  (d = i.match(/[\t ]/g)) === null ||
                                  d === void 0
                                      ? void 0
                                      : d.length) !== null && s !== void 0
                                  ? s
                                  : 0;
                          })
                      )
                    : t;
            }, []);
            if (a.length) {
                var p = new RegExp(
                    `
[	 ]{` +
                        Math.min.apply(Math, a) +
                        '}',
                    'g'
                );
                r = r.map(function (t) {
                    return t.replace(
                        p,
                        `
`
                    );
                });
            }
            r[0] = r[0].replace(/^\r?\n/, '');
            var l = r[0];
            return (
                o.forEach(function (t, n) {
                    var u = l.match(/(?:^|\n)( *)$/),
                        i = u ? u[1] : '',
                        d = t;
                    (typeof t == 'string' &&
                        t.includes(`
`) &&
                        (d = String(t)
                            .split(
                                `
`
                            )
                            .map(function (s, k) {
                                return k === 0 ? s : '' + i + s;
                            }).join(`
`)),
                        (l += d + r[n + 1]));
                }),
                l
            );
        }
        var ne = 'storybook/background',
            v = 'backgrounds',
            pe = {
                light: { name: 'light', value: '#F8F8F8' },
                dark: { name: 'dark', value: '#333' },
            },
            Ie = E(function () {
                let e = P(v),
                    [o, c, r] = L(),
                    [a, p] = U(!1),
                    { options: l = pe, disable: t = !0 } = e || {};
                if (t) return null;
                let n = o[v] || {},
                    u = n.value,
                    i = n.grid || !1,
                    d = l[u],
                    s = !!r?.[v],
                    k = Object.keys(l).length;
                return g.createElement(me, {
                    length: k,
                    backgroundMap: l,
                    item: d,
                    updateGlobals: c,
                    backgroundName: u,
                    setIsTooltipVisible: p,
                    isLocked: s,
                    isGridActive: i,
                    isTooltipVisible: a,
                });
            }),
            me = E(function (e) {
                let {
                        item: o,
                        length: c,
                        updateGlobals: r,
                        setIsTooltipVisible: a,
                        backgroundMap: p,
                        backgroundName: l,
                        isLocked: t,
                        isGridActive: n,
                        isTooltipVisible: u,
                    } = e,
                    i = G(
                        (d) => {
                            r({ [v]: d });
                        },
                        [r]
                    );
                return g.createElement(
                    D,
                    null,
                    g.createElement(
                        B,
                        {
                            key: 'grid',
                            active: n,
                            disabled: t,
                            title: 'Apply a grid to the preview',
                            onClick: () => i({ value: l, grid: !n }),
                        },
                        g.createElement(q, null)
                    ),
                    c > 0
                        ? g.createElement(
                              H,
                              {
                                  key: 'background',
                                  placement: 'top',
                                  closeOnOutsideClick: !0,
                                  tooltip: ({ onHide: d }) =>
                                      g.createElement(F, {
                                          links: [
                                              ...(o
                                                  ? [
                                                        {
                                                            id: 'reset',
                                                            title: 'Reset background',
                                                            icon: g.createElement(
                                                                J,
                                                                null
                                                            ),
                                                            onClick: () => {
                                                                (i({
                                                                    value: void 0,
                                                                    grid: n,
                                                                }),
                                                                    d());
                                                            },
                                                        },
                                                    ]
                                                  : []),
                                              ...Object.entries(p).map(
                                                  ([s, k]) => ({
                                                      id: s,
                                                      title: k.name,
                                                      icon: g.createElement(Z, {
                                                          color:
                                                              k?.value ||
                                                              'grey',
                                                      }),
                                                      active: s === l,
                                                      onClick: () => {
                                                          (i({
                                                              value: s,
                                                              grid: n,
                                                          }),
                                                              d());
                                                      },
                                                  })
                                              ),
                                          ].flat(),
                                      }),
                                  onVisibleChange: a,
                              },
                              g.createElement(
                                  B,
                                  {
                                      disabled: t,
                                      key: 'background',
                                      title: 'Change the background of the preview',
                                      active: !!o || u,
                                  },
                                  g.createElement(z, null)
                              )
                          )
                        : null
                );
            }),
            he = ee.span(
                ({ background: e }) => ({
                    borderRadius: '1rem',
                    display: 'block',
                    height: '1rem',
                    width: '1rem',
                    background: e,
                }),
                ({ theme: e }) => ({
                    boxShadow: `${e.appBorderColor} 0 0 0 1px inset`,
                })
            ),
            fe = (e, o = [], c) => {
                if (e === 'transparent') return 'transparent';
                if (o.find((a) => a.value === e) || e) return e;
                let r = o.find((a) => a.name === c);
                if (r) return r.value;
                if (c) {
                    let a = o.map((p) => p.name).join(', ');
                    K.warn(oe`
        Backgrounds Addon: could not find the default color "${c}".
        These are the available colors for your story based on your configuration:
        ${a}.
      `);
                }
                return 'transparent';
            },
            te = (0, Y.default)(1e3)((e, o, c, r, a, p) => ({
                id: e || o,
                title: o,
                onClick: () => {
                    a({ selected: c, name: o });
                },
                value: c,
                right: r ? g.createElement(he, { background: c }) : void 0,
                active: p,
            })),
            ge = (0, Y.default)(10)((e, o, c) => {
                let r = e.map(({ name: a, value: p }) =>
                    te(null, a, p, !0, c, p === o)
                );
                return o !== 'transparent'
                    ? [
                          te(
                              'reset',
                              'Clear background',
                              'transparent',
                              null,
                              c,
                              !1
                          ),
                          ...r,
                      ]
                    : r;
            }),
            be = { default: null, disable: !0, values: [] },
            ke = E(function () {
                let e = P(v, be),
                    [o, c] = U(!1),
                    [r, a] = L(),
                    p = r[v]?.value,
                    l = j(() => fe(p, e.values, e.default), [e, p]);
                Array.isArray(e) &&
                    K.warn(
                        'Addon Backgrounds api has changed in Storybook 6.0. Please refer to the migration guide: https://github.com/storybookjs/storybook/blob/next/MIGRATION.md'
                    );
                let t = G(
                    (n) => {
                        a({ [v]: { ...r[v], value: n } });
                    },
                    [e, r, a]
                );
                return e.disable
                    ? null
                    : g.createElement(
                          H,
                          {
                              placement: 'top',
                              closeOnOutsideClick: !0,
                              tooltip: ({ onHide: n }) =>
                                  g.createElement(F, {
                                      links: ge(
                                          e.values,
                                          l,
                                          ({ selected: u }) => {
                                              (l !== u && t(u), n());
                                          }
                                      ),
                                  }),
                              onVisibleChange: c,
                          },
                          g.createElement(
                              B,
                              {
                                  key: 'background',
                                  title: 'Change the background of the preview',
                                  active: l !== 'transparent' || o,
                              },
                              g.createElement(z, null)
                          )
                      );
            }),
            _e = E(function () {
                let [e, o] = L(),
                    { grid: c } = P(v, { grid: { disable: !1 } });
                if (c?.disable) return null;
                let r = e[v]?.grid || !1;
                return g.createElement(
                    B,
                    {
                        key: 'background',
                        active: r,
                        title: 'Apply a grid to the preview',
                        onClick: () => o({ [v]: { ...e[v], grid: !r } }),
                    },
                    g.createElement(q, null)
                );
            });
        N.register(ne, () => {
            N.add(ne, {
                title: 'Backgrounds',
                type: $.TOOL,
                match: ({ viewMode: e, tabId: o }) =>
                    !!(e && e.match(/^(story|docs)$/)) && !o,
                render: () =>
                    FEATURES?.backgroundsStoryGlobals
                        ? g.createElement(Ie, null)
                        : g.createElement(
                              D,
                              null,
                              g.createElement(ke, null),
                              g.createElement(_e, null)
                          ),
            });
        });
    })();
} catch (e) {
    console.error(
        '[Storybook] One of your manager-entries failed: ' + import.meta.url,
        e
    );
}
