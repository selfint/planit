import{s as u}from"./stateManagement-B8gT_tAG.js";import{c as E}from"./storyStateProvider-B1qxCnRt.js";import{C as L}from"./ConsoleNav-CDxOvyt6.js";import{C as w}from"./CourseCard-DTSiL5Qx.js";import"./Title-Whni9imO.js";const I=`<template>
    <section
        class="from-bg via-surface-2/40 to-bg text-text min-h-screen w-full bg-linear-to-b"
    >
        <div data-console-nav></div>
        <main
            class="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-4 px-3 pt-4 pb-[calc(env(safe-area-inset-bottom)+1.5rem)] sm:gap-5 sm:px-5 lg:px-8"
            data-page="search"
        >
            <section
                class="border-border/60 bg-surface-1/85 flex flex-col gap-3 rounded-3xl border p-3 shadow-sm sm:p-4"
            >
                <form class="flex flex-col gap-3" data-search-form>
                    <div class="grid grid-cols-[minmax(0,1fr)_auto] gap-2">
                        <input
                            type="search"
                            name="q"
                            inputmode="search"
                            autocomplete="off"
                            placeholder="לדוגמה: 234114 או מבוא למדעי המחשב"
                            class="border-border/70 bg-surface-2/80 text-text placeholder:text-text-muted focus-visible:ring-accent/60 min-h-10 w-full min-w-0 rounded-2xl border px-3 text-[11px] transition duration-200 ease-out focus-visible:ring-2 sm:text-xs"
                            data-search-input
                        />
                        <button
                            type="submit"
                            class="bg-accent text-accent-contrast min-h-10 min-w-10 rounded-2xl px-3 shadow-sm"
                            data-search-submit
                            aria-label="חיפוש"
                            title="חיפוש"
                        >
                            <svg
                                viewBox="0 0 24 24"
                                aria-hidden="true"
                                class="h-4 w-4"
                                fill="none"
                                stroke="currentColor"
                                stroke-width="2"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                            >
                                <circle cx="11" cy="11" r="7"></circle>
                                <line
                                    x1="21"
                                    y1="21"
                                    x2="16.65"
                                    y2="16.65"
                                ></line>
                            </svg>
                        </button>
                    </div>

                    <div class="grid grid-cols-2 gap-2 lg:grid-cols-3">
                        <div class="flex w-full min-w-0 flex-col gap-1">
                            <span class="text-text-muted text-[11px] sm:text-xs"
                                >זמינות</span
                            >
                            <label
                                class="border-border/60 bg-surface-2/50 flex min-h-10 w-full min-w-0 items-center gap-2 rounded-xl border px-3"
                            >
                                <input
                                    type="checkbox"
                                    class="accent-accent h-4 w-4"
                                    data-filter-available
                                />
                                <span class="text-text text-[11px] sm:text-xs"
                                    >זמין</span
                                >
                            </label>
                        </div>

                        <label class="flex w-full min-w-0 flex-col gap-1">
                            <span class="text-text-muted text-[11px] sm:text-xs"
                                >פקולטה</span
                            >
                            <select
                                class="border-border/70 bg-surface-2/80 text-text focus-visible:ring-accent/60 min-h-10 w-full min-w-0 rounded-xl border px-3 text-[11px] focus-visible:ring-2 sm:text-xs"
                                data-filter-faculty
                            >
                                <option value="">כל הפקולטות</option>
                            </select>
                        </label>

                        <label class="flex w-full min-w-0 flex-col gap-1">
                            <span class="text-text-muted text-[11px] sm:text-xs"
                                >דרישה</span
                            >
                            <select
                                class="border-border/70 bg-surface-2/80 text-text focus-visible:ring-accent/60 min-h-10 w-full min-w-0 rounded-xl border px-3 text-[11px] focus-visible:ring-2 sm:text-xs"
                                data-filter-requirement
                            >
                                <option value="">כל הדרישות</option>
                            </select>
                        </label>

                        <label class="flex w-full min-w-0 flex-col gap-1">
                            <span class="text-text-muted text-[11px] sm:text-xs"
                                >חציון מינימום</span
                            >
                            <input
                                type="number"
                                inputmode="decimal"
                                min="0"
                                max="100"
                                class="border-border/70 bg-surface-2/80 text-text placeholder:text-text-muted focus-visible:ring-accent/60 min-h-10 w-full min-w-0 rounded-xl border px-3 text-[11px] focus-visible:ring-2 sm:text-xs"
                                placeholder="ללא"
                                data-filter-median-min
                            />
                        </label>

                        <label class="flex w-full min-w-0 flex-col gap-1">
                            <span class="text-text-muted text-[11px] sm:text-xs"
                                >נק״ז מינימום</span
                            >
                            <input
                                type="number"
                                inputmode="decimal"
                                step="0.5"
                                min="0"
                                class="border-border/70 bg-surface-2/80 text-text placeholder:text-text-muted focus-visible:ring-accent/60 min-h-10 w-full min-w-0 rounded-xl border px-3 text-[11px] focus-visible:ring-2 sm:text-xs"
                                placeholder="ללא"
                                data-filter-points-min
                            />
                        </label>

                        <label class="flex w-full min-w-0 flex-col gap-1">
                            <span class="text-text-muted text-[11px] sm:text-xs"
                                >נק״ז מקסימום</span
                            >
                            <input
                                type="number"
                                inputmode="decimal"
                                step="0.5"
                                min="0"
                                class="border-border/70 bg-surface-2/80 text-text placeholder:text-text-muted focus-visible:ring-accent/60 min-h-10 w-full min-w-0 rounded-xl border px-3 text-[11px] focus-visible:ring-2 sm:text-xs"
                                placeholder="ללא"
                                data-filter-points-max
                            />
                        </label>
                    </div>
                </form>
            </section>

            <section class="flex flex-col gap-2" aria-live="polite">
                <div class="flex flex-wrap items-center justify-between gap-2">
                    <p
                        class="text-text-muted text-[11px] sm:text-xs"
                        data-search-status
                    >
                        טוען נתונים...
                    </p>
                </div>
                <p
                    class="text-text-muted text-[11px] sm:text-xs"
                    data-search-sync
                ></p>

                <p
                    class="border-border/60 bg-surface-1/70 text-text-muted rounded-2xl border p-3 text-[11px] sm:text-xs"
                    data-search-empty
                >
                    אין כרגע תוצאות להצגה.
                </p>

                <div
                    class="grid grid-cols-3 gap-2 sm:grid-cols-4 sm:gap-3 lg:grid-cols-5"
                    data-search-results
                ></div>
            </section>
        </main>
    </section>
</template>
`,k=220;function S(){const e=document.createElement("template");e.innerHTML=I;const n=e.content.firstElementChild;if(!(n instanceof HTMLTemplateElement))throw new Error("SearchPage template element not found");const t=n.content.firstElementChild?.cloneNode(!0);if(!(t instanceof HTMLElement))throw new Error("SearchPage template root not found");const a=t.querySelector("[data-console-nav]");a!==null&&a.replaceWith(L({activePath:"/search"}));const r=O(t),i=R();return N(r,i),D(r,i),Q(r.sync),T(r,i),W(i,r),c(r,i,!1),t}function O(e){const n=e.querySelector("[data-search-form]"),t=e.querySelector("[data-search-input]"),a=e.querySelector("[data-filter-available]"),r=e.querySelector("[data-filter-faculty]"),i=e.querySelector("[data-filter-requirement]"),o=e.querySelector("[data-filter-points-min]"),l=e.querySelector("[data-filter-points-max]"),g=e.querySelector("[data-filter-median-min]"),v=e.querySelector("[data-search-status]"),b=e.querySelector("[data-search-sync]"),h=e.querySelector("[data-search-empty]"),y=e.querySelector("[data-search-results]");if(n===null||t===null||a===null||r===null||i===null||o===null||l===null||g===null||v===null||b===null||h===null||y===null)throw new Error("SearchPage required elements not found");return{form:n,input:t,available:a,faculty:r,requirement:i,pointsMin:o,pointsMax:l,medianMin:g,status:v,sync:b,empty:h,results:y}}function R(){const e=new URL(window.location.href);return{query:s(e.searchParams.get("q")??""),availableOnly:e.searchParams.get("available")==="1",faculty:s(e.searchParams.get("faculty")??""),requirement:s(e.searchParams.get("requirement")??""),pointsMin:s(e.searchParams.get("pointsMin")??""),pointsMax:s(e.searchParams.get("pointsMax")??""),medianMin:s(e.searchParams.get("medianMin")??""),debounceId:void 0,requestId:0,requirementCodes:new Map,totalCourses:void 0}}function N(e,n){e.input.value=n.query,e.available.checked=n.availableOnly,e.faculty.value=n.faculty,e.requirement.value=n.requirement,e.pointsMin.value=n.pointsMin,e.pointsMax.value=n.pointsMax,e.medianMin.value=n.medianMin}function D(e,n){e.form.addEventListener("submit",t=>{t.preventDefault(),n.query=s(e.input.value),f(n),c(e,n,!0)}),e.input.addEventListener("input",()=>{n.query=s(e.input.value),f(n),n.debounceId=window.setTimeout(()=>{n.debounceId=void 0,c(e,n,!0)},k)}),e.input.addEventListener("keydown",t=>{t.key==="Escape"&&(t.preventDefault(),n.query="",e.input.value="",f(n),c(e,n,!0))}),e.available.addEventListener("change",()=>{n.availableOnly=e.available.checked,c(e,n,!0)}),e.faculty.addEventListener("change",()=>{n.faculty=s(e.faculty.value),c(e,n,!0)}),e.requirement.addEventListener("change",()=>{n.requirement=s(e.requirement.value),c(e,n,!0)}),e.pointsMin.addEventListener("input",()=>{n.pointsMin=s(e.pointsMin.value),c(e,n,!0)}),e.pointsMax.addEventListener("input",()=>{n.pointsMax=s(e.pointsMax.value),c(e,n,!0)}),e.medianMin.addEventListener("input",()=>{n.medianMin=s(e.medianMin.value),c(e,n,!0)})}function f(e){e.debounceId!==void 0&&(window.clearTimeout(e.debounceId),e.debounceId=void 0)}async function T(e,n){try{const[t,a]=await Promise.all([u.courses.faculties(),U()]);q(e.faculty,"כל הפקולטות",t),n.faculty.length>0&&t.some(o=>o===n.faculty)?e.faculty.value=n.faculty:(n.faculty="",e.faculty.value="");const r=a.map(o=>({value:o.id,label:o.label}));q(e.requirement,"כל הדרישות",r,!0),n.requirementCodes=new Map(a.map(o=>[o.id,o.courseCodes])),a.some(o=>o.id===n.requirement)?e.requirement.value=n.requirement:(n.requirement="",e.requirement.value="")}catch{e.status.textContent="הפילטרים נטענו חלקית (נתוני דרישות חסרים)."}}async function c(e,n,t){const a=n.requestId+1;n.requestId=a,t&&_(n),F(e.results,6),e.empty.classList.add("hidden"),e.status.textContent="מחפש...";const r=A(n);try{const i=await u.courses.query(r);if(a!==n.requestId)return;if(H(e.results,i.courses),i.total===0){const l=n.totalCourses??0;if(e.status.textContent=`מציג 0 מתוך ${String(l)}`,l===0)return;e.empty.textContent="נסו להרחיב את הטווחים או לנקות חלק מהפילטרים.",e.empty.classList.remove("hidden");return}const o=n.totalCourses??i.total;e.status.textContent=`מציג ${String(i.total)} מתוך ${String(o)}`}catch{if(a!==n.requestId)return;e.results.replaceChildren(),e.status.textContent="טעינת התוצאות נכשלה.",e.empty.textContent="אירעה שגיאה בקריאת הנתונים המקומיים.",e.empty.classList.remove("hidden")}}function A(e){const n=e.requirement.length>0?e.requirementCodes.get(e.requirement)??[]:[];return{query:e.query,availableOnly:e.availableOnly,faculty:e.faculty,pointsMin:x(e.pointsMin),pointsMax:x(e.pointsMax),medianMin:x(e.medianMin),requirementCourseCodes:n,page:1,pageSize:"all"}}function _(e){const n=new URL(window.location.href);d(n,"q",e.query),d(n,"available",e.availableOnly?"1":""),d(n,"faculty",e.faculty),d(n,"requirement",e.requirement),d(n,"pointsMin",e.pointsMin),d(n,"pointsMax",e.pointsMax),d(n,"medianMin",e.medianMin),window.history.replaceState(null,"",n)}function d(e,n,t){if(t.length===0){e.searchParams.delete(n);return}e.searchParams.set(n,t)}function x(e){if(e.length===0)return;const n=Number.parseFloat(e);if(Number.isFinite(n))return n}function s(e){return e.trim().replace(/\s+/g," ")}function F(e,n){const t=[];for(let a=0;a<n;a+=1)t.push(w());e.replaceChildren(...t)}function H(e,n){const t=n.map(a=>{const r=document.createElement("a");r.href=`/course?code=${encodeURIComponent(a.code)}`;const i=a.current===!0?"":"opacity-45 saturate-40";return r.className=`focus-visible:ring-accent/60 block h-[7.5rem] rounded-2xl focus-visible:ring-2 sm:h-[6.5rem] [content-visibility:auto] [contain-intrinsic-size:7.5rem] sm:[contain-intrinsic-size:6.5rem] ${i}`.trim(),r.setAttribute("aria-label",`פתיחת הקורס ${a.code}`),r.append(w(a)),r});e.replaceChildren(...t)}function q(e,n,t,a=!1){e.replaceChildren();const r=document.createElement("option");r.value="",r.textContent=n,e.append(r);for(const i of t){const o=document.createElement("option");if(a){const l=i;o.value=l.value,o.textContent=l.label}else{const l=i;o.value=l,o.textContent=l}e.append(o)}}async function U(){const n=(await u.userDegree.get())?.programId??"";if(n.length===0)return[];const t=await u.requirements.get(n);if(t===void 0)return[];const a=B(t.data);if(a===void 0)return[];const r=[];return C(a,[],r),r}function C(e,n,t){const a=z(e),r=a.length>0?[...n,a]:n,i=j(e);if(i.length>0&&r.length>0&&t.push({id:r.join("::"),label:r.join(" > "),courseCodes:i}),!!Array.isArray(e.nested))for(const o of e.nested)C(o,r,t)}function j(e){const n=new Set;return M(e,n),Array.from(n)}function M(e,n){if(Array.isArray(e.courses))for(const t of e.courses)typeof t=="string"&&t.length>0&&n.add(t);if(Array.isArray(e.nested))for(const t of e.nested)M(t,n)}function z(e){return typeof e.he=="string"&&e.he.length>0?e.he:typeof e.en=="string"&&e.en.length>0?e.en:typeof e.name=="string"&&e.name.length>0?e.name:""}function B(e){if(!(typeof e!="object"||e===null))return e}async function Q(e){const n=await u.courses.getLastSync();if(n===void 0||n.length===0){e.replaceChildren(document.createTextNode("עדיין לא בוצע סנכרון נתונים. "),G("עברו לקטלוג כדי לבחור מסלול."));return}const t=new Date(n);if(Number.isNaN(t.getTime())){e.textContent="סטטוס סנכרון לא זמין.";return}e.textContent=`עודכן לאחרונה: ${t.toLocaleString()}`}async function W(e,n){try{e.totalCourses=await u.courses.count(),c(n,e,!1)}catch{e.totalCourses=void 0}}function G(e){const n=document.createElement("a");return n.href="/catalog",n.className="text-accent hover:text-accent/80 underline underline-offset-2",n.textContent=e,n}const P=J(),$={title:"Pages/Search",parameters:{layout:"fullscreen"}},m={render:()=>(u.provider.set(P),S()),globals:{theme:"light"}},p={render:()=>(u.provider.set(P),S()),globals:{theme:"dark"},parameters:{backgrounds:{default:"dark"}}};function J(){return E({courses:{query:()=>Promise.resolve({total:3,courses:[{code:"234114",name:"מבוא למדעי המחשב",current:!0},{code:"236501",name:"מבוא לבינה מלאכותית",current:!0},{code:"236363",name:"מערכות הפעלה",current:!1}]}),page:()=>Promise.resolve([]),count:()=>Promise.resolve(3),faculties:()=>Promise.resolve(["מדעי המחשב","מתמטיקה"]),getLastSync:()=>Promise.resolve(new Date().toISOString())},catalogs:{get:()=>Promise.resolve({})},requirements:{get:()=>Promise.resolve({programId:"0324",catalogId:"2025_200",facultyId:"computer-science",data:{name:"root",nested:[{he:"חובה",courses:["234114","236501"]}]}}),sync:()=>Promise.resolve({status:"updated"})},userDegree:{get:()=>Promise.resolve({catalogId:"2025_200",facultyId:"computer-science",programId:"0324",path:void 0})}})}m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  render: () => {
    state.provider.set(storyStateManagement);
    return SearchPage();
  },
  globals: {
    theme: 'light'
  }
}`,...m.parameters?.docs?.source}}};p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  render: () => {
    state.provider.set(storyStateManagement);
    return SearchPage();
  },
  globals: {
    theme: 'dark'
  },
  parameters: {
    backgrounds: {
      default: 'dark'
    }
  }
}`,...p.parameters?.docs?.source}}};const ee=["Default","Dark"];export{p as Dark,m as Default,ee as __namedExportsOrder,$ as default};
