const i="planit:pwa-update",u=`<template>
    <div
        class="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex justify-center p-3 sm:justify-end sm:p-4"
    >
        <section
            class="border-border/80 bg-surface-1/95 text-text pointer-events-auto hidden w-full max-w-md rounded-2xl border p-3 shadow-lg backdrop-blur-md"
            role="status"
            aria-live="polite"
            aria-atomic="true"
            data-component="PwaUpdateToast"
        >
            <div class="flex items-start gap-3">
                <div
                    class="bg-info/15 text-info mt-0.5 rounded-full px-2 py-0.5 text-[11px] font-medium"
                >
                    עדכון
                </div>
                <div class="min-w-0 flex-1">
                    <p class="text-sm font-medium">גרסה חדשה זמינה</p>
                </div>
            </div>

            <div class="mt-3 flex items-center justify-end gap-2">
                <button
                    type="button"
                    class="bg-accent text-accent-contrast focus-visible:ring-accent/50 min-h-11 rounded-xl px-3 text-xs font-medium shadow-sm transition duration-200 ease-out focus-visible:ring-2"
                    data-role="apply"
                >
                    עדכן עכשיו
                </button>
            </div>
        </section>
    </div>
</template>
`;function l(){const e=document.createElement("template");e.innerHTML=u;const t=e.content.firstElementChild;if(!(t instanceof HTMLTemplateElement))throw new Error("PwaUpdateToast template element not found");const a=t.content.firstElementChild?.cloneNode(!0);if(!(a instanceof HTMLElement))throw new Error("PwaUpdateToast template root not found");const c=a.querySelector('[data-component="PwaUpdateToast"]'),n=a.querySelector('[data-role="apply"]');if(c===null||n===null)throw new Error("PwaUpdateToast required elements not found");let d=null;return window.addEventListener(i,m=>{const p=m.detail.updateSW;typeof p=="function"&&(d=p,n.disabled=!1,c.classList.remove("hidden"))}),n.addEventListener("click",()=>{d!==null&&(n.disabled=!0,d(!0).catch(()=>{n.disabled=!1}))}),a}const v={title:"Components/PwaUpdateToast"},o={render:()=>l(),globals:{theme:"light"}},r={render:()=>{const e=l(),t=()=>Promise.resolve();return window.dispatchEvent(new CustomEvent(i,{detail:{updateSW:t}})),e},globals:{theme:"light"}},s={render:()=>{const e=l(),t=()=>Promise.resolve();return window.dispatchEvent(new CustomEvent(i,{detail:{updateSW:t}})),e},globals:{theme:"dark"},parameters:{backgrounds:{default:"dark"}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  render: () => PwaUpdateToast(),
  globals: {
    theme: 'light'
  }
}`,...o.parameters?.docs?.source}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  render: () => {
    const banner = PwaUpdateToast();
    const updateSW = (): Promise<void> => Promise.resolve();
    window.dispatchEvent(new CustomEvent(PWA_UPDATE_EVENT, {
      detail: {
        updateSW
      }
    }));
    return banner;
  },
  globals: {
    theme: 'light'
  }
}`,...r.parameters?.docs?.source}}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  render: () => {
    const banner = PwaUpdateToast();
    const updateSW = (): Promise<void> => Promise.resolve();
    window.dispatchEvent(new CustomEvent(PWA_UPDATE_EVENT, {
      detail: {
        updateSW
      }
    }));
    return banner;
  },
  globals: {
    theme: 'dark'
  },
  parameters: {
    backgrounds: {
      default: 'dark'
    }
  }
}`,...s.parameters?.docs?.source}}};const w=["Hidden","UpdateAvailable","Dark"];export{s as Dark,o as Hidden,r as UpdateAvailable,w as __namedExportsOrder,v as default};
