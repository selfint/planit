import{f as L,b as P,g as D,a as N,c as k}from"./requirementsUtils-CGhlNlon.js";import{s as x}from"./stateManagement-B8gT_tAG.js";const j={BASE_URL:"./",DEV:!1,MODE:"production",PROD:!0,SSR:!1,STORYBOOK:"true"};function G(e,t){const o=j[e];return typeof o=="string"&&o.length>0?o:t}G("VITE_DATA_BASE_URL","_data");const H="planit:catalog-sync",U=`<template>
    <section
        class="mx-4 flex flex-col gap-4 xl:mx-0"
        data-component="DegreePicker"
    >
        <div class="flex flex-col gap-1">
            <p class="text-lg font-medium">
                בחר קטלוג ותכנית כדי לטעון דרישות.
            </p>
        </div>
        <div class="flex flex-col gap-3">
            <label class="text-text-muted flex flex-col gap-2 text-xs">
                <span>קטלוג</span>
                <select
                    class="border-border/60 bg-surface-2/80 text-text rounded-2xl border px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-60"
                    data-degree-catalog
                ></select>
            </label>
            <label class="text-text-muted flex flex-col gap-2 text-xs">
                <span>פקולטה</span>
                <select
                    class="border-border/60 bg-surface-2/80 text-text rounded-2xl border px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-60"
                    data-degree-faculty
                ></select>
            </label>
            <label class="text-text-muted flex flex-col gap-2 text-xs">
                <span>תכנית</span>
                <select
                    class="border-border/60 bg-surface-2/80 text-text rounded-2xl border px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-60"
                    data-degree-program
                ></select>
            </label>
            <label class="text-text-muted flex flex-col gap-2 text-xs">
                <span>מסלול</span>
                <select
                    class="border-border/60 bg-surface-2/80 text-text rounded-2xl border px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-60"
                    data-degree-path
                ></select>
            </label>
            <p class="text-text-muted hidden text-xs" data-path-empty></p>
        </div>
        <div class="pt-2">
            <p class="text-text-muted mb-2 text-xs">דרישות במסלול</p>
            <table class="w-full text-xs">
                <thead class="border-border/50 text-text-muted border-y">
                    <tr>
                        <th class="px-3 py-2 text-start font-medium">דרישה</th>
                        <th class="px-3 py-2 text-start font-medium">
                            סה״כ קורסים
                        </th>
                    </tr>
                </thead>
                <tbody class="divide-border/40 divide-y" data-requirement-rows>
                    <tr>
                        <td class="text-text px-3 py-2" colspan="2">
                            בחר תכנית ומסלול כדי לראות דרישות.
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
        <p class="text-text-muted text-xs" data-degree-status></p>
    </section>
</template>
`,q="לתכנית זו אין מסלולים לבחירה.",O="בחר תכנית ומסלול כדי לראות דרישות.",R="לא נמצאו דרישות לתכנית זו.",h="בחר מסלול כדי להציג דרישות.",Y="אין דרישות במסלול זה.";function X(){const e=document.createElement("template");e.innerHTML=U;const t=e.content.firstElementChild;if(!(t instanceof HTMLTemplateElement))throw new Error("DegreePicker template element not found");const n=t.content.firstElementChild?.cloneNode(!0);if(!(n instanceof HTMLElement))throw new Error("DegreePicker template root not found");const o=n.querySelector("[data-degree-catalog]"),r=n.querySelector("[data-degree-faculty]"),i=n.querySelector("[data-degree-program]"),a=n.querySelector("[data-degree-path]"),s=n.querySelector("[data-path-empty]"),c=n.querySelector("[data-degree-status]"),d=n.querySelector("[data-requirement-rows]");if(o===null||r===null||i===null||a===null||s===null||c===null||d===null)throw new Error("DegreePicker required elements not found");const l={catalogs:{},selection:void 0,requirement:void 0,pathOptions:[]};return o.addEventListener("change",()=>{const f=o.value;if(f.length===0){l.selection=void 0,l.requirement=void 0,l.pathOptions=[],_(l,o,r,i),m(a,s,d),u(c,"בחר קטלוג כדי להמשיך.");return}l.selection={catalogId:f,facultyId:"",programId:"",path:void 0},l.requirement=void 0,l.pathOptions=[],C(l,r,i),b(l,i),m(a,s,d),u(c,"בחר פקולטה כדי להמשיך.")}),r.addEventListener("change",()=>{l.selection!==void 0&&(l.selection={...l.selection,facultyId:r.value,programId:"",path:void 0},l.requirement=void 0,l.pathOptions=[],b(l,i),m(a,s,d),u(c,"בחר תכנית כדי לטעון דרישות."))}),i.addEventListener("change",()=>{if(l.selection===void 0)return;const f=i.value;f.length!==0&&(l.selection={...l.selection,programId:f,path:void 0},l.requirement=void 0,l.pathOptions=[],B(l,i,a,s,d,c))}),a.addEventListener("change",()=>{if(l.selection===void 0)return;const f=a.value;l.selection={...l.selection,path:f.length>0?f:void 0},M(l),A(l,d,l.selection.path),l.selection.path===void 0&&l.pathOptions.length>0&&u(c,h)}),window.addEventListener(H,()=>{n.isConnected&&E(l,o,r,i,a,s,d,c)}),E(l,o,r,i,a,s,d,c),n}async function E(e,t,n,o,r,i,a,s){e.catalogs=await x.catalogs.get();const c=await x.userDegree.get();c!==void 0&&(e.selection={catalogId:c.catalogId,facultyId:c.facultyId,programId:c.programId,path:c.path}),_(e,t,n,o);const d=e.selection?.programId;d!==void 0&&d.length>0?await w(e,r,i,a,s):(m(r,i,a),u(s,Object.keys(e.catalogs).length===0?"אין קטלוגים זמינים אופליין.":"בחר תכנית כדי לטעון דרישות."))}function _(e,t,n,o){const r=Object.keys(e.catalogs).sort();if(p(t,r.map(i=>({id:i,label:y(e.catalogs[i],i)})),"בחר קטלוג"),e.selection!==void 0&&(t.value=e.selection.catalogId),t.value.length===0){n.disabled=!0,o.disabled=!0,p(n,[],"בחר פקולטה"),p(o,[],"בחר תכנית");return}C(e,n,o),b(e,o)}function C(e,t,n){const o=e.selection?.catalogId??"",r=v(e.catalogs[o]),a=(r!==void 0?Object.keys(r).filter(s=>!S(s)):[]).map(s=>({id:s,label:y(r?.[s],s)}));p(t,a,"בחר פקולטה"),t.disabled=a.length===0,e.selection!==void 0&&(t.value=e.selection.facultyId),n.disabled=!0,p(n,[],"בחר תכנית")}function b(e,t){const n=e.selection?.catalogId??"",o=e.selection?.facultyId??"",r=v(e.catalogs[n]),i=r!==void 0?v(r[o]):void 0,s=(i!==void 0?Object.keys(i).filter(c=>!S(c)):[]).map(c=>({id:c,label:y(i?.[c],c)}));p(t,s,"בחר תכנית"),t.disabled=s.length===0,e.selection!==void 0&&(t.value=e.selection.programId)}async function B(e,t,n,o,r,i){if(e.selection===void 0)return;const a=e.selection;t.disabled=!0,u(i,"טוען דרישות...");const s=await x.requirements.sync(a,{persistActiveSelection:!1});if(t.disabled=!1,await w(e,n,o,r,i),!(e.pathOptions.length>0&&e.selection.path===void 0)){if(s.status==="updated"){u(i,"הדרישות נטענו ונשמרו אופליין.");return}if(s.status==="offline"){u(i,"אין חיבור לרשת. הדרישות הקודמות נשמרות.");return}u(i,s.error??"שגיאה בטעינת דרישות.")}}async function w(e,t,n,o,r){const i=e.selection?.programId??"";if(i.length===0){m(t,n,o);return}const a=await x.requirements.get(i);e.requirement=K(a?.data);const s=P(e.requirement);e.pathOptions=s,Q(e,t,n);const c=e.selection?.path;if(s.length>0&&c===void 0){g(o,h),u(r,h);return}M(e),A(e,o,c),e.requirement===void 0&&u(r,R)}function Q(e,t,n){const o=e.pathOptions;if(o.length===0){t.required=!1,t.disabled=!0,p(t,[],q),n.textContent="",n.classList.add("hidden"),e.selection!==void 0&&(e.selection={...e.selection,path:void 0});return}if(t.disabled=!1,t.required=!0,n.textContent="",n.classList.add("hidden"),p(t,o.map(r=>({id:r.id,label:r.label})),"בחר מסלול"),e.selection?.path!==void 0&&o.some(i=>i.id===e.selection?.path)){t.value=e.selection.path;return}t.value="",e.selection!==void 0&&(e.selection={...e.selection,path:void 0})}function A(e,t,n){if(t.replaceChildren(),e.pathOptions.length>0&&n===void 0){g(t,h);return}const o=e.requirement;if(o===void 0){g(t,R);return}const r=L(o,n),i=Array.isArray(r.nested)?r.nested:[],a=F(i);if(a.length===0){g(t,n!==void 0?Y:O);return}for(const s of a)t.append(V(s))}function g(e,t){e.replaceChildren();const n=document.createElement("tr"),o=document.createElement("td");o.className="text-text px-3 py-2",o.colSpan=2,o.textContent=t,n.append(o),e.append(n)}function V(e){const t=document.createElement("tr"),n=e.path,o=e.count;return t.append(I(n,"text-start")),t.append(I(o.toString(),"text-start")),t}function I(e,t){const n=document.createElement("td");return n.className=t.length>0?`text-text px-3 py-2 ${t}`:"text-text px-3 py-2",n.textContent=e,n}function F(e){const t=[];for(const n of e)T(n,[],t);return t}function T(e,t,n){const o=D(e)??"—",r=N(e,o),i=[...t,r].join(" ");if(Array.isArray(e.courses)&&e.courses.length>0&&n.push({path:i,count:k(e)}),Array.isArray(e.nested))for(const s of e.nested)T(s,[...t,r],n)}function m(e,t,n){e.required=!1,e.disabled=!0,p(e,[],q),t.textContent="",t.classList.add("hidden"),g(n,O)}function p(e,t,n){e.replaceChildren();const o=document.createElement("option");o.value="",o.textContent=n,e.append(o);for(const r of t){const i=document.createElement("option");i.value=r.id,i.textContent=r.label,e.append(i)}}function v(e){if(!(typeof e!="object"||e===null))return e}function S(e){return e==="en"||e==="he"}function y(e,t){const n=v(e),o=n?.he;if(typeof o=="string"&&o.length>0)return o;const r=n?.en;return typeof r=="string"&&r.length>0?r:t}function K(e){if(!(typeof e!="object"||e===null))return e}function u(e,t){e.textContent=t}function z(e){const t=e.selection;return!(t===void 0||t.catalogId.length===0||t.facultyId.length===0||t.programId.length===0||e.pathOptions.length>0&&(t.path?.length??0)===0)}async function M(e){!z(e)||e.selection===void 0||await x.userDegree.set(e.selection)}export{X as D};
