import{C as s}from"./CourseCard-Dyyw2ZpT.js";const d={title:"Components/CourseCard"},t={code:"01040012",name:"חשבון דיפרנציאלי ואינטגרלי 1מ",points:5.5,median:73.3};function n(){const a=document.createElement("div");return a.className="grid gap-3 sm:grid-cols-2",a.append(s(t,{statusClass:"bg-success"}),s()),a}const e={render:()=>n(),globals:{theme:"light"}},r={render:()=>n(),globals:{theme:"dark"},parameters:{backgrounds:{default:"dark"}}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
  render: () => renderCards(),
  globals: {
    theme: 'light'
  }
}`,...e.parameters?.docs?.source}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  render: () => renderCards(),
  globals: {
    theme: 'dark'
  },
  parameters: {
    backgrounds: {
      default: 'dark'
    }
  }
}`,...r.parameters?.docs?.source}}};const c=["Default","Dark"];export{r as Dark,e as Default,c as __namedExportsOrder,d as default};
