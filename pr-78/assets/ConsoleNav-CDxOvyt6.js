import{l as u,t as d}from"./Title-Whni9imO.js";import{s as r,o as m}from"./stateManagement-B8gT_tAG.js";const f=`<template>
    <header
        class="border-border/50 bg-surface-1/45 sticky top-0 z-40 border-b pt-[env(safe-area-inset-top)] backdrop-blur-md"
        data-component="ConsoleNav"
    >
        <nav
            class="mx-auto flex min-h-11 w-full items-center justify-between gap-4 px-3 py-1 sm:px-5 md:py-2 lg:max-w-6xl lg:px-8"
            aria-label="ניווט ראשי"
        >
            <div class="flex items-center gap-0.5 sm:gap-x-1 md:gap-x-1.5">
                <button
                    class="focus-visible:ring-accent/60 text-text-muted hover:text-text inline-flex min-h-10 min-w-10 cursor-pointer touch-manipulation items-center justify-center rounded-xl transition duration-200 ease-out focus-visible:ring-2"
                    type="button"
                    data-login
                    aria-hidden="false"
                    aria-label="login"
                >
                    <svg
                        viewBox="0 0 24 24"
                        class="size-4"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                    >
                        <circle cx="12" cy="12" r="9"></circle>
                        <circle cx="12" cy="10" r="3"></circle>
                        <path d="M17 18c-1.3-1.4-3-2-5-2s-3.7.6-5 2"></path>
                    </svg>
                </button>
                <button
                    class="focus-visible:ring-accent/60 text-text-muted hover:text-text hidden min-h-10 min-w-10 cursor-pointer touch-manipulation items-center justify-center rounded-xl transition duration-200 ease-out focus-visible:ring-2"
                    type="button"
                    data-logout
                    aria-hidden="true"
                    aria-label="logout"
                >
                    <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        class="size-4"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                    >
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                        <path d="M16 17l5-5-5-5" />
                        <path d="M21 12H9" />
                    </svg>
                </button>
                <a
                    class="focus-visible:ring-accent/60 text-text-muted hover:text-text inline-flex min-h-10 min-w-10 items-center justify-center rounded-xl transition duration-200 ease-out focus-visible:ring-2"
                    href="/search"
                    data-console-link="search"
                    aria-label="חיפוש"
                    title="חיפוש"
                >
                    <svg
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                        class="size-4"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                    >
                        <circle cx="11" cy="11" r="7"></circle>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                </a>
                <a
                    class="focus-visible:ring-accent/60 text-text-muted hover:text-text inline-flex min-h-10 items-center rounded-xl px-2.5 text-sm font-medium transition duration-200 ease-out focus-visible:ring-2"
                    href="/plan"
                    data-console-link="plan"
                >
                    מתכנן
                </a>
                <a
                    class="focus-visible:ring-accent/60 text-text-muted hover:text-text inline-flex min-h-10 items-center rounded-xl px-2.5 text-sm font-medium transition duration-200 ease-out focus-visible:ring-2"
                    href="/catalog"
                    data-console-link="catalog"
                >
                    קטלוג
                </a>
            </div>

            <div class="flex min-w-0 items-center gap-2" data-slot="logo">
                <a
                    class="focus-visible:ring-accent/60 flex min-h-10 items-center gap-1 rounded-2xl px-2 py-0.5 focus-visible:ring-2"
                    href="/"
                    data-console-link="home"
                    aria-label="מעבר לעמוד הבית"
                    title="עמוד הבית"
                >
                    <svg
                        class="text-text hidden h-6 w-16 md:block"
                        aria-label="Planit"
                        role="img"
                    >
                        <use data-title-use></use>
                    </svg>
                    <img class="size-9" alt="לוגו Planit" data-logo />
                </a>
            </div>
        </nav>
    </header>
</template>
`,g={catalog:"/catalog",plan:"/plan",search:"/search"};function y(n={}){const l=document.createElement("template");l.innerHTML=f;const o=l.content.firstElementChild;if(!(o instanceof HTMLTemplateElement))throw new Error("ConsoleNav template element not found");const t=o.content.firstElementChild?.cloneNode(!0);if(!(t instanceof HTMLElement))throw new Error("ConsoleNav template root not found");const e=t.querySelector("[data-logo]");e!==null&&(e.src=u);const i=t.querySelector("[data-title-use]");return i!==null&&i.setAttribute("href",d),x(t,n.activePath),p(t),t}function x(n,l){const o=v(l),t=n.querySelectorAll("[data-console-link]");for(const e of t){const i=e.dataset.consoleLink;if(!h(i))continue;if(o===g[i]){e.classList.add("text-text"),e.classList.add("font-medium"),e.classList.remove("text-text-muted");continue}e.classList.remove("font-medium")}}function h(n){return n==="catalog"||n==="plan"||n==="search"}function v(n){return n===void 0||n===""||n==="/"?"/":n.replace(/\/+$/,"")}function p(n){const l=n.querySelector("[data-login]");if(l===null)throw new Error("ConsoleNav login button not found");const o=l,t=n.querySelector("[data-logout]");if(t===null)throw new Error("ConsoleNav logout button not found");const e=t;function i(){const s=r.firebase.getUser()!==null;o.classList.toggle("hidden",s),o.classList.toggle("inline-flex",!s),o.setAttribute("aria-hidden",String(s)),e.classList.toggle("hidden",!s),e.classList.toggle("inline-flex",s),e.setAttribute("aria-hidden",String(!s))}o.addEventListener("click",()=>{r.firebase.login().catch(a=>{console.error("Firebase login failed",a)})}),e.addEventListener("click",()=>{r.firebase.logout().catch(a=>{console.error("Firebase logout failed",a)})});const c=m(()=>{i()});n.addEventListener("DOMNodeRemoved",()=>{c()},{once:!0}),i()}export{y as C};
