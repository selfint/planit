import{s as C}from"./stateManagement-B8gT_tAG.js";import{f as U,g as V,a as F}from"./requirementsUtils-CGhlNlon.js";import{C as $}from"./ConsoleNav-CDxOvyt6.js";import{C as _}from"./CourseCard-DTSiL5Qx.js";import{D as H}from"./DegreePicker-DF10Lgsq.js";import{c as z}from"./storyStateProvider-B1qxCnRt.js";import"./Title-Whni9imO.js";const W=`<template>
    <section class="text-text min-h-screen w-full" data-page="catalog">
        <div data-console-nav></div>
        <main
            class="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-6 pt-6 pb-[calc(env(safe-area-inset-bottom)+2rem)]"
        >
            <header class="mx-4 flex flex-col gap-3 xl:mx-0">
                <div class="flex flex-col gap-2">
                    <h1 class="text-2xl font-medium sm:text-3xl">
                        קטלוג מסלולים
                    </h1>
                    <p class="text-text-muted max-w-3xl text-xs sm:text-sm">
                        בחרו קטלוג, פקולטה ותכנית כדי לראות דרישות.
                    </p>
                </div>
                <p class="text-text-muted text-xs" data-catalog-summary>
                    בחרו תכנית כדי להתחיל.
                </p>
            </header>

            <section class="grid gap-5 xl:grid-cols-[minmax(0,390px)_1fr]">
                <div data-catalog-degree-picker></div>

                <section
                    class="flex min-h-88 min-w-0 flex-col gap-4 overflow-x-hidden"
                    aria-live="polite"
                >
                    <div
                        class="border-border/60 mx-4 flex flex-wrap items-center justify-between gap-3 border-b pb-3 xl:mx-0"
                    >
                        <h2 class="text-lg font-medium">
                            קבוצות דרישה וקורסים
                        </h2>
                        <p class="text-text-muted text-xs" data-catalog-state>
                            טוען נתוני דרישות...
                        </p>
                    </div>

                    <div
                        class="divide-border/45 min-w-0 max-w-full flex flex-col divide-y"
                        data-catalog-groups
                    ></div>
                </section>
            </section>
        </main>
    </section>
</template>
`,b="לא נמצאו קורסים במסלול הזה. אפשר לבחור מסלול אחר לבדיקת דרישות.",u="בחרו תכנית ומסלול כדי להציג קורסים.",B="טוען קורסים מהאחסון המקומי...",v="מעדכן בחירה בתכנית...",k="אין דרישות שמורות לתכנית זו. התחברו לאינטרנט ונסו לטעון שוב.",j="קורס",K=6,R="min-w-0 max-w-full overflow-x-auto overflow-y-hidden pb-2 [scrollbar-width:thin]",q="flex w-max min-w-full snap-x snap-mandatory gap-2";function G(){const e=document.createElement("template");e.innerHTML=W;const r=e.content.firstElementChild;if(!(r instanceof HTMLTemplateElement))throw new Error("CatalogPage template element not found");const t=r.content.firstElementChild?.cloneNode(!0);if(!(t instanceof HTMLElement))throw new Error("CatalogPage template root not found");const n=t.querySelector("[data-console-nav]");n!==null&&n.replaceWith($({activePath:"/catalog"}));const o=t.querySelector("[data-catalog-degree-picker]"),s=t.querySelector("[data-catalog-groups]"),a=t.querySelector("[data-catalog-state]"),l=t.querySelector("[data-catalog-summary]");if(o===null||s===null||a===null||l===null)throw new Error("CatalogPage required elements not found");const i=H();o.replaceWith(i);const c={root:s,state:a,summary:l,pickerRoot:i,courseCache:new Map,pickerPending:!1,refreshTimer:void 0,refreshVersion:0},d=i.querySelectorAll("[data-degree-catalog], [data-degree-faculty], [data-degree-program], [data-degree-path]");for(const p of d)p.addEventListener("change",()=>{c.pickerPending=!0,c.state.textContent=v,m(c.root,v),N(c)});return new MutationObserver(()=>{N(c)}).observe(i,{childList:!0,subtree:!0,characterData:!0,attributes:!0,attributeFilter:["disabled"]}),window.addEventListener("resize",()=>{N(c)}),ae(c.root,4),T(c),t}function N(e){e.refreshTimer!==void 0&&window.clearTimeout(e.refreshTimer),e.refreshTimer=window.setTimeout(()=>{e.refreshTimer=void 0,T(e)},60)}async function T(e){const r=e.refreshVersion+1;e.refreshVersion=r,e.state.textContent=B;const t=await C.userDegree.get();if(e.refreshVersion!==r)return;if(!X(e.pickerRoot)){e.pickerPending=!1,e.summary.textContent=u,e.state.textContent=u,m(e.root,u);return}if(e.pickerPending&&!Y(e.pickerRoot,t)){e.summary.textContent=v,e.state.textContent=v,m(e.root,v);return}if(e.pickerPending=!1,t===void 0){e.summary.textContent=u,e.state.textContent=u,m(e.root,u);return}const n=await C.requirements.get(t.programId);if(e.refreshVersion!==r)return;const o=ne(n?.data);if(o===void 0){e.summary.textContent=k,e.state.textContent=k,m(e.root,k);return}const s=U(o,t.path),a=te(s);if(a.length===0){e.summary.textContent=b,e.state.textContent=b,m(e.root,b);return}J(e.root,a,e.courseCache);const l=ee(a).length;e.summary.textContent=`נטענו ${String(l)} קורסים מתוך ${String(a.length)} קבוצות דרישה.`,e.state.textContent=`עודכן מנתונים שמורים אופליין עבור ${t.programId}.`}function Y(e,r){if((e.querySelector("[data-degree-status]")?.textContent??"").includes("טוען דרישות"))return!1;const n=x(e,"[data-degree-catalog]"),o=x(e,"[data-degree-faculty]"),s=x(e,"[data-degree-program]"),a=x(e,"[data-degree-path]"),l=r?.catalogId??"",i=r?.facultyId??"",c=r?.programId??"",d=r?.path??"";return n===l&&o===i&&s===c&&a===d}function x(e,r){return e.querySelector(r)?.value??""}function X(e){if(x(e,"[data-degree-program]").length===0)return!1;const t=e.querySelector("[data-degree-path]");return!(t?.required===!0&&t.value.length===0)}function J(e,r,t){e.replaceChildren(),r.forEach(n=>{const o=document.createElement("section");o.className="flex min-w-0 flex-col gap-3 py-4 [content-visibility:auto] [contain-intrinsic-size:24rem]";const s=document.createElement("div");s.className="mx-4 flex flex-col gap-1 xl:mx-0";const a=document.createElement("h3");a.className="text-sm font-medium",a.textContent=n.label;const l=document.createElement("p");l.className="text-text-muted text-xs",l.textContent=n.subtitle,s.append(a),s.append(l),o.append(s);const i=document.createElement("div");i.className=R;const c=document.createElement("div");c.className=q,c.dataset.role="group-row",i.append(c),o.append(i);let d=0,y,p;async function M(){if(y!==void 0&&p!==void 0)return{codes:y,records:p};const f=await Z(n.courseCodes,t),g=Q(n.courseCodes,f);return y=g,p=f,{codes:g,records:f}}async function L(){d+=1;const f=d,g=await M();if(f===d){c.replaceChildren();for(const w of g.codes){const S=g.records.get(w),D=S==null?_({code:w,name:`${j} ${w}`}):_(S),h=document.createElement("a");h.href=`/course?code=${encodeURIComponent(w)}`,h.className="touch-manipulation focus-visible:ring-accent/60 block h-[7.5rem] w-[7.5rem] shrink-0 snap-start rounded-2xl focus-visible:ring-2 sm:h-[6.5rem] lg:w-[10.5rem] [content-visibility:auto] [contain-intrinsic-size:7.5rem_7.5rem] sm:[contain-intrinsic-size:7.5rem_6.5rem] lg:[contain-intrinsic-size:10.5rem_6.5rem]",S?.current!==!0&&h.classList.add("opacity-70"),h.append(D),c.append(h)}}}L(),e.append(o)})}function Q(e,r){return[...e].sort((t,n)=>{const o=I(r.get(t)),s=I(r.get(n));return s!==o?s-o:t.localeCompare(n)})}function I(e){return e?.median===void 0||!Number.isFinite(e.median)?Number.NEGATIVE_INFINITY:e.median}async function Z(e,r){const t=new Map;return await Promise.all(e.map(async n=>{const o=r.get(n);if(o!==void 0){t.set(n,o);return}const a=await C.courses.get(n)??null;r.set(n,a),t.set(n,a)})),t}function ee(e){const r=new Set;for(const t of e)for(const n of t.courseCodes)r.add(n);return[...r]}function te(e){const r=[];return A(e,[],r),r}function A(e,r,t){const n=V(e)??"—",o=F(e,n),s=[...r,o],a=re(e);if(a.length>0&&t.push({id:n,label:o,subtitle:`${s.join(" • ")} · ${String(a.length)} קורסים`,courseCodes:a}),Array.isArray(e.nested))for(const l of e.nested)A(l,s,t)}function re(e){if(!Array.isArray(e.courses))return[];const r=new Set;for(const t of e.courses)typeof t=="string"&&t.length>0&&r.add(t);return[...r]}function ne(e){if(!(typeof e!="object"||e===null))return e}function m(e,r){e.replaceChildren();const t=document.createElement("p");t.className="text-text-muted mx-4 py-3 text-xs xl:mx-0",t.textContent=r,e.append(t)}function ae(e,r){e.replaceChildren();for(let t=0;t<r;t+=1){const n=document.createElement("div");n.className="flex flex-col gap-3 py-4";const o=document.createElement("span");o.className="skeleton-shimmer mx-4 h-4 w-44 rounded-md xl:mx-0",n.append(o);const s=document.createElement("div");s.className=R;const a=document.createElement("div");a.className=q,a.dataset.role="group-row";for(let l=0;l<K;l+=1){const i=document.createElement("div");i.className="pointer-events-none block h-[7.5rem] w-[7.5rem] shrink-0 snap-start rounded-2xl sm:h-[6.5rem] lg:w-[10.5rem]",i.setAttribute("aria-hidden","true"),i.append(_()),a.append(i)}s.append(a),n.append(s),e.append(n)}}const O=oe(),pe={title:"Pages/Catalog",parameters:{layout:"fullscreen"}},P={render:()=>(C.provider.set(O),G()),globals:{theme:"light"}},E={render:()=>(C.provider.set(O),G()),globals:{theme:"dark"},parameters:{backgrounds:{default:"dark"}}};function oe(){return z({courses:{get:e=>Promise.resolve({code:e,name:`Course ${e}`,median:80,current:!0}),query:()=>Promise.resolve({courses:[],total:0}),page:()=>Promise.resolve([]),count:()=>Promise.resolve(0),faculties:()=>Promise.resolve([])},catalogs:{get:()=>Promise.resolve({"2025_200":{he:"קטלוג 2025","computer-science":{he:"מדעי המחשב","0324":{he:"מדעי המחשב - ארבע שנתי"}}}})},requirements:{get:()=>Promise.resolve({programId:"0324",catalogId:"2025_200",facultyId:"computer-science",data:{name:"root",nested:[{name:"software-path",en:"Software Path",nested:[{name:"core",he:"חובה",courses:["234114","236501","236363"]}]}]}}),sync:()=>Promise.resolve({status:"updated"})},userDegree:{get:()=>Promise.resolve({catalogId:"2025_200",facultyId:"computer-science",programId:"0324",path:"software-path"})}})}P.parameters={...P.parameters,docs:{...P.parameters?.docs,source:{originalSource:`{
  render: () => {
    state.provider.set(storyProvider);
    return CatalogPage();
  },
  globals: {
    theme: 'light'
  }
}`,...P.parameters?.docs?.source}}};E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
  render: () => {
    state.provider.set(storyProvider);
    return CatalogPage();
  },
  globals: {
    theme: 'dark'
  },
  parameters: {
    backgrounds: {
      default: 'dark'
    }
  }
}`,...E.parameters?.docs?.source}}};const fe=["Default","Dark"];export{E as Dark,P as Default,fe as __namedExportsOrder,pe as default};
