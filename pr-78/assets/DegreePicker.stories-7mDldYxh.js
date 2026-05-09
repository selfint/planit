import{s as t}from"./stateManagement-B8gT_tAG.js";import{c as a}from"./storyStateProvider-B1qxCnRt.js";import{D as o}from"./DegreePicker-DF10Lgsq.js";import"./requirementsUtils-CGhlNlon.js";const s=n(),u={title:"Components/DegreePicker"},e={render:()=>(t.provider.set(s),o()),globals:{theme:"light"}},r={render:()=>(t.provider.set(s),o()),globals:{theme:"dark"},parameters:{backgrounds:{default:"dark"}}};function n(){return a({courses:{query:()=>Promise.resolve({courses:[],total:0}),page:()=>Promise.resolve([]),count:()=>Promise.resolve(0),faculties:()=>Promise.resolve([])},catalogs:{get:()=>Promise.resolve({"2025_200":{he:"קטלוג 2025","computer-science":{he:"מדעי המחשב","0324":{he:"מדעי המחשב - ארבע שנתי"}}}})},requirements:{get:()=>Promise.resolve({programId:"0324",catalogId:"2025_200",facultyId:"computer-science",data:{name:"root",nested:[{name:"software-path",en:"Software Path",nested:[{name:"core",he:"חובה",courses:["234114","236501"]}]}]}}),sync:()=>Promise.resolve({status:"updated"})},userDegree:{get:()=>Promise.resolve({catalogId:"2025_200",facultyId:"computer-science",programId:"0324",path:void 0})}})}e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
  render: () => {
    state.provider.set(storyProvider);
    return DegreePicker();
  },
  globals: {
    theme: 'light'
  }
}`,...e.parameters?.docs?.source}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  render: () => {
    state.provider.set(storyProvider);
    return DegreePicker();
  },
  globals: {
    theme: 'dark'
  },
  parameters: {
    backgrounds: {
      default: 'dark'
    }
  }
}`,...r.parameters?.docs?.source}}};const l=["Default","Dark"];export{r as Dark,e as Default,l as __namedExportsOrder,u as default};
