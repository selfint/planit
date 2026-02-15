if (!self.define) {
    let s,
        e = {};
    const r = (r, i) => (
        (r = new URL(r + '.js', i).href),
        e[r] ||
            new Promise((e) => {
                if ('document' in self) {
                    const s = document.createElement('script');
                    ((s.src = r), (s.onload = e), document.head.appendChild(s));
                } else ((s = r), importScripts(r), e());
            }).then(() => {
                let s = e[r];
                if (!s)
                    throw new Error(`Module ${r} didn’t register its module`);
                return s;
            })
    );
    self.define = (i, n) => {
        const a =
            s ||
            ('document' in self ? document.currentScript.src : '') ||
            location.href;
        if (e[a]) return;
        let l = {};
        const o = (s) => r(s, a),
            u = { module: { uri: a }, exports: l, require: o };
        e[a] = Promise.all(i.map((s) => u[s] || o(s))).then(
            (s) => (n(...s), l)
        );
    };
}
define(['./workbox-3105ea8d'], function (s) {
    'use strict';
    (self.skipWaiting(),
        s.clientsClaim(),
        s.precacheAndRoute(
            [
                {
                    url: 'pwa-64x64.png',
                    revision: 'aa83269747c073b78040ac202a1048ac',
                },
                {
                    url: 'pwa-512x512.png',
                    revision: 'd072c2c907fc105c2d3a5cdb0ca8f6f8',
                },
                {
                    url: 'pwa-192x192.png',
                    revision: '87ae4bce581396365f186f8bf51503da',
                },
                {
                    url: 'maskable-icon-512x512.png',
                    revision: '260cc1d545e9ce3b346d73b252783593',
                },
                {
                    url: 'index.html',
                    revision: '7046a48954b028c69841c833e1b79f70',
                },
                {
                    url: 'iframe.html',
                    revision: '0d378b5208d02d6ff3adbc372ae48d27',
                },
                {
                    url: 'favicon.svg',
                    revision: '695ec815efa60eb325f23cd67a9b3cf3',
                },
                {
                    url: 'favicon.ico',
                    revision: '5b8ec3f68e8d9411eecca8e5744763dc',
                },
                {
                    url: 'apple-touch-icon-180x180.png',
                    revision: 'bfc0399d4f783b660844cf4a43c3fe9a',
                },
                {
                    url: '404.html',
                    revision: '3e39a4669b7113c0e52bbbc033f4a90d',
                },
                {
                    url: 'sb-manager/runtime.js',
                    revision: 'ba7566fe2b41a6fa12cd515f529df814',
                },
                {
                    url: 'sb-manager/globals.js',
                    revision: '0b744e53a57d781b7b0091a4ec146dbf',
                },
                {
                    url: 'sb-manager/globals-runtime.js',
                    revision: '8797ba704abcca66e474dd285b7da977',
                },
                {
                    url: 'sb-manager/globals-module-info.js',
                    revision: 'db490dab1f38612c6d6ebbbc58c94ae1',
                },
                {
                    url: 'sb-common-assets/favicon.svg',
                    revision: '695ec815efa60eb325f23cd67a9b3cf3',
                },
                {
                    url: 'sb-addons/storybook-core-core-server-presets-0/common-manager-bundle.js',
                    revision: '4f8b9c90d8ff25178d7fbf79ba1face3',
                },
                {
                    url: 'sb-addons/links-1/manager-bundle.js',
                    revision: 'd01f9cf4a20854203aba2b123c594bfa',
                },
                {
                    url: 'sb-addons/interactions-10/manager-bundle.js',
                    revision: '3285e0e6a6a712afa264dcb9780b5c0f',
                },
                {
                    url: 'sb-addons/essentials-viewport-6/manager-bundle.js',
                    revision: 'ffabe65ea4743cb63ea80c7fa7a68fca',
                },
                {
                    url: 'sb-addons/essentials-toolbars-7/manager-bundle.js',
                    revision: 'c1219063cf7d73aef6981d61decdb8bb',
                },
                {
                    url: 'sb-addons/essentials-outline-9/manager-bundle.js',
                    revision: '84e47b7a8728a3d0eef2dc27e719dcef',
                },
                {
                    url: 'sb-addons/essentials-measure-8/manager-bundle.js',
                    revision: 'e27ce77a271610fffd229483dd1cebd3',
                },
                {
                    url: 'sb-addons/essentials-docs-4/manager-bundle.js',
                    revision: '469536e46bf4110cbf9a73880b9243ca',
                },
                {
                    url: 'sb-addons/essentials-controls-2/manager-bundle.js',
                    revision: '49386ea534a8ded6963846cfaa3f60e4',
                },
                {
                    url: 'sb-addons/essentials-backgrounds-5/manager-bundle.js',
                    revision: 'd25e4f461a35eb30ec8bf17952550684',
                },
                {
                    url: 'sb-addons/essentials-actions-3/manager-bundle.js',
                    revision: 'cd6108eb5a5af305c82a8a2c8665e46d',
                },
                {
                    url: 'sb-addons/a11y-11/manager-bundle.js',
                    revision: '82138d4723d7c6a3287a46faba2c5bc8',
                },
                { url: 'assets/preview-r2gE1JdV.css', revision: null },
                { url: 'assets/preview-caVMbCIR.js', revision: null },
                { url: 'assets/preview-WIE65ICp.js', revision: null },
                { url: 'assets/preview-TqM3Oi8H.js', revision: null },
                { url: 'assets/preview-EL2ALTCg.js', revision: null },
                { url: 'assets/preview-DTyQTpzx.js', revision: null },
                { url: 'assets/preview-DHQbi4pV.js', revision: null },
                { url: 'assets/preview-DHNTBTs5.js', revision: null },
                { url: 'assets/preview-DGZ5Qq08.js', revision: null },
                { url: 'assets/preview-BXhsHniX.js', revision: null },
                { url: 'assets/preview-BWzBA1C2.js', revision: null },
                { url: 'assets/preview-B4Zxc-aw.js', revision: null },
                { url: 'assets/plan_page.stories-bgI4I2mu.js', revision: null },
                { url: 'assets/matchers-7Z3WT2CE-Dw4MQV_s.js', revision: null },
                { url: 'assets/logo-DOrqz8C6.js', revision: null },
                {
                    url: 'assets/landing_page.stories-D_nLOzWY.js',
                    revision: null,
                },
                { url: 'assets/indexeddb-Ba_KKj-k.js', revision: null },
                { url: 'assets/index-DrFu-skq.js', revision: null },
                { url: 'assets/index-DIC7bB7E.js', revision: null },
                { url: 'assets/index-64M2WgeJ.js', revision: null },
                { url: 'assets/iframe-CAjpa8h7.js', revision: null },
                {
                    url: 'assets/entry-preview-docs-DaRDBfEQ.js',
                    revision: null,
                },
                { url: 'assets/entry-preview-DImpdu69.js', revision: null },
                { url: 'assets/axe-d9UbSZVA.js', revision: null },
                { url: 'assets/_commonjsHelpers-CqkleIqs.js', revision: null },
                {
                    url: 'assets/UpdateBanner.stories-Boob6-z0.js',
                    revision: null,
                },
                { url: 'assets/Title-CvVoNA55.svg', revision: null },
                {
                    url: 'assets/StatusSidebar.stories-DPgcMjxQ.js',
                    revision: null,
                },
                {
                    url: 'assets/PlannerOverview.stories-BIZHuFSS.js',
                    revision: null,
                },
                {
                    url: 'assets/LandingNav.stories-6avqzzZV.js',
                    revision: null,
                },
                { url: 'assets/LandingNav-CYCO5cOy.js', revision: null },
                {
                    url: 'assets/LandingHero.stories-B7Xod5kk.js',
                    revision: null,
                },
                { url: 'assets/LandingHero-C9LvJAbw.js', revision: null },
                {
                    url: 'assets/LandingFeatureCard.stories-4JYqpVBo.js',
                    revision: null,
                },
                {
                    url: 'assets/LandingFeatureCard-0i66H1Iu.js',
                    revision: null,
                },
                {
                    url: 'assets/DocsRenderer-CFRXHY34-dIXmhlFk.js',
                    revision: null,
                },
                {
                    url: 'assets/DegreePicker.stories-C3lxxpi1.js',
                    revision: null,
                },
                { url: 'assets/DegreePicker-BI0M4dZA.js', revision: null },
                {
                    url: 'assets/CourseTable.stories-4Dtg531M.js',
                    revision: null,
                },
                { url: 'assets/CourseTable-TMkINQyF.js', revision: null },
                {
                    url: 'assets/CourseCard.stories-BZ7qsq4J.js',
                    revision: null,
                },
                { url: 'assets/CourseCard-Dyyw2ZpT.js', revision: null },
                { url: 'assets/Color-YHDXOIA2-OLD11J8P.js', revision: null },
                { url: 'assets/AppHeader.stories-Ca_zu_hz.js', revision: null },
                { url: 'assets/AppFooter.stories-CchPSVaJ.js', revision: null },
                {
                    url: 'manifest.webmanifest',
                    revision: 'f5e47a1648abbcd76657864bf09cb5ba',
                },
            ],
            {}
        ),
        s.cleanupOutdatedCaches(),
        s.registerRoute(
            new s.NavigationRoute(s.createHandlerBoundToURL('index.html'))
        ));
});
