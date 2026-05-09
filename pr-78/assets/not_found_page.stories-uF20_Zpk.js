const m=`<template>
    <section class="text-text min-h-screen w-full">
        <main
            class="mx-auto flex min-h-screen w-full max-w-5xl flex-col items-start justify-center gap-6 px-4 pt-[calc(env(safe-area-inset-top)+2rem)] pb-[calc(env(safe-area-inset-bottom)+2rem)] sm:px-6 lg:px-8"
        >
            <p class="text-text-muted text-xs" data-slot="path">/404</p>
            <h1 class="text-3xl font-medium">העמוד לא נמצא</h1>
            <p class="text-text-muted max-w-2xl text-sm">
                הנתיב המבוקש אינו קיים. אפשר לחזור לעמוד הבית.
            </p>
            <a
                class="bg-accent text-accent-contrast rounded-full px-5 py-2 text-xs font-medium"
                href="/"
            >
                חזרה לעמוד הבית
            </a>
        </main>
    </section>
</template>
`;function s(l="/404"){const a=document.createElement("template");a.innerHTML=m;const r=a.content.firstElementChild;if(!(r instanceof HTMLTemplateElement))throw new Error("NotFoundPage template element not found");const n=r.content.firstElementChild?.cloneNode(!0);if(!(n instanceof HTMLElement))throw new Error("NotFoundPage template root not found");const o=n.querySelector('[data-slot="path"]');return o!==null&&(o.textContent=l),n}const c={title:"Pages/NotFound",parameters:{layout:"fullscreen"}},e={render:()=>s("/missing-route"),globals:{theme:"light"}},t={render:()=>s("/missing-route"),globals:{theme:"dark"},parameters:{backgrounds:{default:"dark"}}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
  render: () => NotFoundPage('/missing-route'),
  globals: {
    theme: 'light'
  }
}`,...e.parameters?.docs?.source}}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  render: () => NotFoundPage('/missing-route'),
  globals: {
    theme: 'dark'
  },
  parameters: {
    backgrounds: {
      default: 'dark'
    }
  }
}`,...t.parameters?.docs?.source}}};const u=["Default","Dark"];export{t as Dark,e as Default,u as __namedExportsOrder,c as default};
