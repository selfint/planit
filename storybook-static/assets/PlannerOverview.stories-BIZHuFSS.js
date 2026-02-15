import{C as d}from"./CourseTable-TMkINQyF.js";import{D as c}from"./DegreePicker-BI0M4dZA.js";import"./indexeddb-Ba_KKj-k.js";const m=`<template>
    <section
        class="border-border/60 bg-surface-1/80 flex flex-col gap-5 rounded-3xl border p-6 shadow-sm"
        data-component="PlannerOverview"
    >
        <div class="flex flex-col gap-2">
            <p class="text-text-muted text-xs">ברוך שובך</p>
            <h1 class="text-2xl font-medium">תכנן את הסמסטרים שלך בבהירות.</h1>
            <p class="text-text-muted text-xs">
                Planit שומרת את תכנית התואר שלך אופליין תחילה, ואז מסנכרנת
                עדכונים כשיש חיבור.
            </p>
        </div>
        <div class="grid gap-3 sm:grid-cols-3">
            <div
                class="border-border/60 bg-surface-2/80 rounded-2xl border p-4"
            >
                <p class="text-text-muted text-xs">התכנית הנוכחית</p>
                <p class="mt-2 text-lg font-medium">אביב 2026</p>
                <p class="text-text-muted mt-1 text-xs">12 נק״ז במעקב</p>
            </div>
            <div
                class="border-border/60 bg-surface-2/80 rounded-2xl border p-4"
            >
                <p class="text-text-muted text-xs">דרישות</p>
                <p class="mt-2 text-lg font-medium">68%</p>
                <p class="text-text-muted mt-1 text-xs">במסלול</p>
            </div>
            <div
                class="border-border/60 bg-surface-2/80 rounded-2xl border p-4"
            >
                <p class="text-text-muted text-xs">הסנכרון הבא</p>
                <p class="mt-2 text-lg font-medium">מוכן</p>
                <p class="text-text-muted mt-1 text-xs">ממתין לחיבור</p>
            </div>
        </div>
        <div data-degree-picker></div>
        <div class="flex flex-wrap gap-3">
            <button
                type="button"
                class="bg-accent text-accent-contrast rounded-full px-4 py-2 text-xs font-medium shadow-sm"
            >
                <span>התחל לתכנן</span>
            </button>
            <button
                type="button"
                class="border-border/70 bg-surface-2/70 text-text-muted hover:border-accent/40 hover:text-text rounded-full border px-4 py-2 text-xs font-medium transition duration-200 ease-out"
            >
                <span>סקירת דרישות</span>
            </button>
        </div>
        <div data-course-table></div>
    </section>
</template>
`;function l(){const r=document.createElement("template");r.innerHTML=m;const a=r.content.firstElementChild;if(!(a instanceof HTMLTemplateElement))throw new Error("PlannerOverview template element not found");const e=a.content.firstElementChild?.cloneNode(!0);if(!(e instanceof HTMLElement))throw new Error("PlannerOverview template root not found");const s=e.querySelector("[data-course-table]");s!==null&&s.replaceWith(d());const o=e.querySelector("[data-degree-picker]");return o!==null&&o.replaceWith(c()),e}const x={title:"Components/PlannerOverview"},t={render:()=>l(),globals:{theme:"light"}},n={render:()=>l(),globals:{theme:"dark"},parameters:{backgrounds:{default:"dark"}}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  render: () => PlannerOverview(),
  globals: {
    theme: 'light'
  }
}`,...t.parameters?.docs?.source}}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  render: () => PlannerOverview(),
  globals: {
    theme: 'dark'
  },
  parameters: {
    backgrounds: {
      default: 'dark'
    }
  }
}`,...n.parameters?.docs?.source}}};const b=["Default","Dark"];export{n as Dark,t as Default,b as __namedExportsOrder,x as default};
