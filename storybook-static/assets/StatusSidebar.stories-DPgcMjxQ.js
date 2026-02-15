const d=`<template>
    <aside class="flex flex-col gap-4" data-component="StatusSidebar">
        <div
            class="border-border/60 bg-surface-1/80 rounded-3xl border p-5 shadow-sm"
        >
            <p class="text-text-muted text-xs">סקירת סנכרון</p>
            <p class="mt-2 text-lg font-medium">קטלוגים + קורסים</p>
            <p class="text-text-muted mt-2 text-xs">ריענון אחרון: טרם סונכרן</p>
            <div class="text-text-muted mt-4 flex items-center gap-3 text-xs">
                <span class="bg-warning size-2 rounded-full"></span>
                <span>ממתין לרשת</span>
            </div>
        </div>
        <div
            class="border-border/60 bg-surface-1/80 rounded-3xl border p-5 shadow-sm"
        >
            <p class="text-text-muted text-xs">אחסון אופליין</p>
            <p class="mt-2 text-lg font-medium">IndexedDB מוכן</p>
            <p class="text-text-muted mt-2 text-xs">
                התכניות שלך נשארות מקומיות עד הסנכרון.
            </p>
            <div class="text-text-muted mt-4 flex items-center gap-3 text-xs">
                <span class="bg-success size-2 rounded-full"></span>
                <span>מוצפן במכשיר</span>
            </div>
        </div>
    </aside>
</template>
`;function r(){const n=document.createElement("template");n.innerHTML=d;const s=n.content.firstElementChild;if(!(s instanceof HTMLTemplateElement))throw new Error("StatusSidebar template element not found");const a=s.content.firstElementChild?.cloneNode(!0);if(!(a instanceof HTMLElement))throw new Error("StatusSidebar template root not found");return a}const o={title:"Components/StatusSidebar"},e={render:()=>r(),globals:{theme:"light"}},t={render:()=>r(),globals:{theme:"dark"},parameters:{backgrounds:{default:"dark"}}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
  render: () => StatusSidebar(),
  globals: {
    theme: 'light'
  }
}`,...e.parameters?.docs?.source}}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  render: () => StatusSidebar(),
  globals: {
    theme: 'dark'
  },
  parameters: {
    backgrounds: {
      default: 'dark'
    }
  }
}`,...t.parameters?.docs?.source}}};const l=["Default","Dark"];export{t as Dark,e as Default,l as __namedExportsOrder,o as default};
