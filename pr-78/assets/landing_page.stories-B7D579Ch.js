import{L as g}from"./LandingFeatureCard-0i66H1Iu.js";import{L as b}from"./LandingHero-ztRIF_x4.js";import{L as v}from"./LandingNav-CKYzdjOp.js";import"./Title-Whni9imO.js";const k=""+new URL("first-time-user-experience-desktop-chrome-dark-C8Tt3P28.webm",import.meta.url).href,x=""+new URL("first-time-user-experience-desktop-chrome-light-cLcxiEH0.webm",import.meta.url).href,L=""+new URL("first-time-user-experience-mobile-chrome-dark-w4npPmPQ.webm",import.meta.url).href,y=""+new URL("first-time-user-experience-mobile-chrome-light-CScYk0EJ.webm",import.meta.url).href,w=`<template>
    <div data-component="LandingPage">
        <div data-landing-nav></div>
        <main
            class="mx-auto flex min-h-screen max-w-6xl flex-col gap-12 px-4 pt-20 pb-[calc(env(safe-area-inset-bottom)+3rem)] sm:px-6 lg:px-8"
        >
            <div data-landing-hero></div>

            <section class="mt-20 flex flex-col">
                <div
                    class="border-border/60 bg-surface-2/70 relative flex items-center justify-center overflow-hidden rounded-2xl border"
                    data-video-placeholder
                    data-skeleton="true"
                >
                    <video
                        class="h-auto w-full object-contain opacity-0 transition duration-300 ease-out dark:hidden md:hidden"
                        data-landing-demo-video="mobile-light"
                        aria-label="הדגמת משתמש חדשה - מובייל בהיר"
                        width="430"
                        height="932"
                        autoplay
                        muted
                        loop
                        playsinline
                        preload="metadata"
                        controls
                    >
                        <track
                            kind="captions"
                            srclang="he"
                            label="כתוביות"
                            src="data:text/vtt;charset=utf-8,WEBVTT"
                        />
                    </video>
                    <video
                        class="hidden h-auto w-full object-contain opacity-0 transition duration-300 ease-out dark:block md:hidden!"
                        data-landing-demo-video="mobile-dark"
                        aria-label="הדגמת משתמש חדשה - מובייל כהה"
                        width="430"
                        height="932"
                        autoplay
                        muted
                        loop
                        playsinline
                        preload="metadata"
                        controls
                    >
                        <track
                            kind="captions"
                            srclang="he"
                            label="כתוביות"
                            src="data:text/vtt;charset=utf-8,WEBVTT"
                        />
                    </video>
                    <video
                        class="hidden h-auto w-full object-contain opacity-0 transition duration-300 ease-out md:block dark:md:hidden"
                        data-landing-demo-video="desktop-light"
                        aria-label="הדגמת משתמש חדשה - דסקטופ בהיר"
                        width="1400"
                        height="1050"
                        autoplay
                        muted
                        loop
                        playsinline
                        preload="metadata"
                        controls
                    >
                        <track
                            kind="captions"
                            srclang="he"
                            label="כתוביות"
                            src="data:text/vtt;charset=utf-8,WEBVTT"
                        />
                    </video>
                    <video
                        class="hidden h-auto w-full object-contain opacity-0 transition duration-300 ease-out dark:md:block"
                        data-landing-demo-video="desktop-dark"
                        aria-label="הדגמת משתמש חדשה - דסקטופ כהה"
                        width="1400"
                        height="1050"
                        autoplay
                        muted
                        loop
                        playsinline
                        preload="metadata"
                        controls
                    >
                        <track
                            kind="captions"
                            srclang="he"
                            label="כתוביות"
                            src="data:text/vtt;charset=utf-8,WEBVTT"
                        />
                    </video>
                    <span
                        class="skeleton-shimmer absolute inset-0"
                        aria-hidden="true"
                        data-skeleton-layer
                    ></span>
                    <div
                        class="text-text-muted bg-surface-1/75 border-border/60 absolute inset-x-6 bottom-6 hidden rounded-xl border px-4 py-3 text-xs"
                        data-video-fallback
                    >
                        ההדגמה תיטען כשיהיה חיבור יציב. אפשר להמשיך לקטלוג כבר
                        עכשיו.
                    </div>
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
                        href="/catalog"
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
`,f={"desktop-dark":k,"desktop-light":x,"mobile-dark":L,"mobile-light":y};function h(){const n=document.createElement("template");n.innerHTML=w;const r=n.content.firstElementChild;if(!(r instanceof HTMLTemplateElement))throw new Error("LandingPage template element not found");const a=r.content.firstElementChild?.cloneNode(!0);if(!(a instanceof HTMLElement))throw new Error("LandingPage template root not found");const o=a.querySelector("[data-landing-nav]");o!==null&&o.replaceWith(v());const d=a.querySelector("[data-landing-hero]");d!==null&&d.replaceWith(b());const p={plan:{label:"מתכנן סמסטר",title:"תכננו את ההרכבה",description:"גררו קורסים, בדקו עומס וראו תמונה מלאה של הסמסטרים.",href:"/plan",linkLabel:"מעבר למתכנן →",mediaAlt:"תצוגת מתכנן"},catalog:{label:"קטלוגים",title:"כל הדרישות במקום אחד",description:"בחרו מסלול, בדקו דרישות חובה ובחרו תמהיל מתאים.",href:"/catalog",linkLabel:"בדיקת קטלוגים →",mediaAlt:"תצוגת קטלוג"},search:{label:"חיפוש",title:"מצאו קורסים מהר",description:"חיפוש מתקדם עם פילטרים, דרישות קדם והצעות.",href:"/search",linkLabel:"לפתיחת חיפוש →",mediaAlt:"תצוגת חיפוש"},semester:{label:"סמסטרים",title:"מעקב לכל תקופה",description:"תיעוד עומסים, נקודות זכות, ושינויים בין סמסטרים.",href:"/semester",linkLabel:"מעבר לסמסטר →",mediaAlt:"תצוגת סמסטר"},course:{label:"פרטי קורס",title:"כל פרט במקום אחד",description:'תיאור, נק"ז, תנאי קדם וביקוש — בלי לעבור בין אתרים.',href:"/course",linkLabel:"לפרטי קורס →",mediaAlt:"תצוגת קורס"}};return a.querySelectorAll("[data-landing-feature-card]").forEach(t=>{const s=t.dataset.landingFeatureCard;if(s===void 0)return;const e=p[s],c=g({label:e.label,title:e.title,description:e.description,href:e.href,linkLabel:e.linkLabel,mediaAlt:e.mediaAlt});t.replaceWith(c)}),a.querySelectorAll("[data-feature-media], [data-hero-media]").forEach(t=>{t.dataset.videoReady="false"}),E(a),a}function E(n){const r=n.querySelector("[data-video-placeholder]"),a=n.querySelectorAll("[data-landing-demo-video]"),o=n.querySelector("[data-skeleton-layer]"),d=n.querySelector("[data-video-fallback]");if(r===null||a.length===0||o===null)return;const p=r,i=o,l=Array.from(a);l.forEach(e=>{const c=e.dataset.landingDemoVideo;c!==void 0&&(e.src=D(c))});function t(){l.forEach(e=>{e.classList.remove("opacity-0")}),p.dataset.skeleton="false",i.classList.add("hidden"),d?.classList.add("hidden")}function s(){i.classList.remove("skeleton-shimmer"),i.classList.add("bg-surface-2/70"),d?.classList.remove("hidden")}if(l.some(e=>e.readyState>=2)){t();return}l.forEach(e=>{e.addEventListener("loadeddata",t,{once:!0}),e.addEventListener("error",s,{once:!0})})}function D(n){if(n in f)return f[n];throw new Error(`Unsupported landing demo variant: "${n}"`)}const P={title:"Pages/Landing",parameters:{layout:"fullscreen"}},m={render:()=>h(),globals:{theme:"light"}},u={render:()=>h(),globals:{theme:"dark"},parameters:{backgrounds:{default:"dark"}}};m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  render: () => LandingPage(),
  globals: {
    theme: 'light'
  }
}`,...m.parameters?.docs?.source}}};u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  render: () => LandingPage(),
  globals: {
    theme: 'dark'
  },
  parameters: {
    backgrounds: {
      default: 'dark'
    }
  }
}`,...u.parameters?.docs?.source}}};const U=["Default","Dark"];export{u as Dark,m as Default,U as __namedExportsOrder,P as default};
