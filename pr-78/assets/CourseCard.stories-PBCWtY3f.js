import{C as n}from"./CourseCard-DTSiL5Qx.js";const b={title:"Components/CourseCard"},c=[{code:"01040012",name:"חשבון דיפרנציאלי ואינטגרלי 1מ",points:5.5,median:73.3,tests:[{year:2025,monthIndex:1,day:14}]},{code:"234114",name:"מבוא למדעי המחשב",points:4,median:84,tests:[null]},{code:"234124",name:"מבני נתונים",points:4,median:79,tests:[{year:2025,monthIndex:7,day:2}]},{code:"236350",name:"בסיסי נתונים",points:3,median:82,tests:[{year:2024,monthIndex:5,day:11}]},{code:"236501",name:"מבוא לבינה מלאכותית",points:3,median:87,tests:[null]},{code:"044252",name:"מערכות ספרתיות",points:3,median:75,tests:[{year:2025,monthIndex:11,day:19}]}];function l(e){const r=document.createElement("div");return r.className=e,r}function i(e){return n(e)}function m(e){const r=document.createElement("div");return r.className="min-w-[6.4rem] shrink-0 basis-[calc((100%-1.5rem)/3)]",r.append(e),r}function u(){const e=l("grid grid-cols-3 gap-3");return e.append(i(c[0]),n()),e}function g(){const e=l("mx-auto flex w-full max-w-4xl gap-3 overflow-x-auto pb-2 [scrollbar-width:thin]");for(const r of c)e.append(m(i(r)));return e.append(m(n())),e}function p(){const e=l("grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-5");for(const r of c)e.append(i(r));return e.append(n()),e.append(n({code:"999999",name:"קורס עם שם ארוך במיוחד כדי לבדוק חיתוך טקסט בכרטיס",points:2,median:68,tests:[null]})),e}function f(){const e=l("flex flex-wrap gap-3");for(const r of c)e.append(i(r));return e.append(n()),e}const a={render:()=>u(),globals:{theme:"light"}},s={render:()=>g(),globals:{theme:"light"}},o={render:()=>p(),globals:{theme:"light"}},t={render:()=>f(),globals:{theme:"light"}},d={render:()=>p(),globals:{theme:"dark"},parameters:{backgrounds:{default:"dark"}}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  render: () => renderDefaultCards(),
  globals: {
    theme: 'light'
  }
}`,...a.parameters?.docs?.source}}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  render: () => renderManyHorizontalCards(),
  globals: {
    theme: 'light'
  }
}`,...s.parameters?.docs?.source}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  render: () => renderDenseGrid(),
  globals: {
    theme: 'light'
  }
}`,...o.parameters?.docs?.source}}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  render: () => renderWrappedCards(),
  globals: {
    theme: 'light'
  }
}`,...t.parameters?.docs?.source}}};d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  render: () => renderDenseGrid(),
  globals: {
    theme: 'dark'
  },
  parameters: {
    backgrounds: {
      default: 'dark'
    }
  }
}`,...d.parameters?.docs?.source}}};const C=["Default","HorizontalRail","DenseGrid","WrappedFlow","Dark"];export{d as Dark,a as Default,o as DenseGrid,s as HorizontalRail,t as WrappedFlow,C as __namedExportsOrder,b as default};
