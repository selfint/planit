import{s as m,p as D,g as x,a as U}from"./indexeddb-Ba_KKj-k.js";const k="https://raw.githubusercontent.com/selfint/degree-planner/main/static/courseData.json",u={etag:"courseDataEtag",lastModified:"courseDataLastModified",lastSync:"courseDataLastSync",count:"courseDataCount",remoteUpdatedAt:"courseDataRemoteUpdatedAt",lastChecked:"courseDataLastChecked"};function E(){return"onLine"in navigator?navigator.onLine:!0}async function M(){const[t,e]=await Promise.all([x(u.etag),x(u.lastModified)]),n=new Headers,o=typeof t?.value=="string"?t.value:void 0,a=typeof e?.value=="string"?e.value:void 0;return o!==void 0&&o.length>0&&n.set("If-None-Match",o),a!==void 0&&a.length>0&&n.set("If-Modified-Since",a),fetch(k,{headers:n})}async function T(){const t=await fetch("https://api.github.com/repos/selfint/degree-planner/commits?path=static/courseData.json&per_page=1",{headers:{Accept:"application/vnd.github+json"}});if(!t.ok)throw new Error(`Failed to fetch remote update metadata: ${String(t.status)} ${t.statusText}`);const n=(await t.json())[0]?.commit?.committer?.date;if(typeof n=="string"&&n.length>0)return n}async function _(t){const[e,n]=await Promise.all([x(u.remoteUpdatedAt),x(u.lastSync)]),o=typeof e?.value=="string"?e.value:void 0;return t===void 0||o===void 0||o.length===0||o!==t?!0:n?.value===void 0}async function O(){if(!E())return{status:"offline"};let t;try{t=await T()}catch(i){console.error("Failed to fetch remote course metadata",i)}if(t!==void 0&&(await m({key:u.remoteUpdatedAt,value:t}),await m({key:u.lastChecked,value:new Date().toISOString()})),!await _(t))return{status:"skipped"};const e=await M();if(e.status===304)return await m({key:u.lastSync,value:new Date().toISOString()}),{status:"skipped"};if(!e.ok)throw new Error(`Failed to fetch course data: ${String(e.status)} ${e.statusText}`);const n=await e.json(),o=Object.values(n);await D(o);const a=e.headers.get("etag"),s=e.headers.get("last-modified");return await Promise.all([a!==null&&a.length>0?m({key:u.etag,value:a}):Promise.resolve(),s!==null&&s.length>0?m({key:u.lastModified,value:s}):Promise.resolve(),m({key:u.lastSync,value:new Date().toISOString()}),m({key:u.count,value:o.length}),t!==void 0?m({key:u.remoteUpdatedAt,value:t}):Promise.resolve()]),{status:"updated",count:o.length}}function R(t){async function e(){try{const o=await O();t?.onSync?.(o)}catch(o){console.error("Course sync failed",o),t?.onError?.(o)}}function n(){e()}window.addEventListener("online",n),E()&&e()}const P=`<template>
    <section
        class="border-border/60 bg-surface-2/80 rounded-2xl border p-4"
        data-component="CourseTable"
    >
        <div class="flex flex-wrap items-center justify-between gap-3">
            <div class="flex flex-col gap-1">
                <p class="text-lg font-medium">תמונת מצב IndexedDB</p>
            </div>
            <p class="text-text-muted text-xs" data-course-last-updated>
                <span>עדכון אחרון: —</span>
            </p>
        </div>
        <div
            class="mt-3 flex flex-wrap items-center justify-between gap-3 text-xs"
        >
            <p class="text-text-muted" data-course-count>
                <span>מוצגים 0 קורסים</span>
            </p>
            <div class="flex items-center gap-2">
                <button
                    type="button"
                    class="border-border/60 bg-surface-1/70 text-text-muted hover:border-accent/40 hover:text-text touch-manipulation rounded-full border px-3 py-1 transition duration-200 ease-out"
                    data-course-prev
                >
                    <span>הקודם</span>
                </button>
                <span class="text-text-muted" data-course-page> עמוד 1 </span>
                <button
                    type="button"
                    class="border-border/60 bg-surface-1/70 text-text-muted hover:border-accent/40 hover:text-text touch-manipulation rounded-full border px-3 py-1 transition duration-200 ease-out"
                    data-course-next
                >
                    <span>הבא</span>
                </button>
            </div>
        </div>
        <div class="mt-3 overflow-x-auto">
            <table class="w-full table-fixed text-xs">
                <colgroup>
                    <col class="w-[9ch]" />
                    <col class="w-full" />
                    <col class="w-[5ch]" />
                    <col class="w-[6ch]" />
                </colgroup>
                <thead class="text-text-muted">
                    <tr class="border-border/60 border-b">
                        <th
                            class="overflow-hidden px-2 py-2 text-start font-medium whitespace-nowrap"
                        >
                            <button
                                type="button"
                                class="text-text-muted hover:text-text focus-visible:ring-accent/60 flex items-center gap-2 rounded-md transition duration-200 ease-out focus-visible:ring-2"
                                data-course-sort
                                data-sort-key="code"
                            >
                                <span>קוד</span>
                                <span
                                    class="inline-flex h-3 w-3 items-center justify-center text-[10px]"
                                    data-sort-indicator
                                    data-sort-key="code"
                                ></span>
                            </button>
                        </th>
                        <th class="w-full px-2 py-2 text-start font-medium">
                            <button
                                type="button"
                                class="text-text-muted hover:text-text focus-visible:ring-accent/60 flex items-center gap-2 rounded-md transition duration-200 ease-out focus-visible:ring-2"
                                data-course-sort
                                data-sort-key="name"
                            >
                                <span>שם</span>
                                <span
                                    class="inline-flex h-3 w-3 items-center justify-center text-[10px]"
                                    data-sort-indicator
                                    data-sort-key="name"
                                ></span>
                            </button>
                        </th>
                        <th
                            class="overflow-hidden px-2 py-2 text-start font-medium whitespace-nowrap"
                        >
                            <button
                                type="button"
                                class="text-text-muted hover:text-text focus-visible:ring-accent/60 flex items-center gap-2 rounded-md transition duration-200 ease-out focus-visible:ring-2"
                                data-course-sort
                                data-sort-key="points"
                            >
                                <span>נק״ז</span>
                                <span
                                    class="inline-flex h-3 w-3 items-center justify-center text-[10px]"
                                    data-sort-indicator
                                    data-sort-key="points"
                                ></span>
                            </button>
                        </th>
                        <th
                            class="overflow-hidden px-2 py-2 text-start font-medium whitespace-nowrap"
                        >
                            <button
                                type="button"
                                class="text-text-muted hover:text-text focus-visible:ring-accent/60 flex items-center gap-2 rounded-md transition duration-200 ease-out focus-visible:ring-2"
                                data-course-sort
                                data-sort-key="median"
                            >
                                <span>חציון</span>
                                <span
                                    class="inline-flex h-3 w-3 items-center justify-center text-[10px]"
                                    data-sort-indicator
                                    data-sort-key="median"
                                ></span>
                            </button>
                        </th>
                    </tr>
                </thead>
                <tbody
                    class="divide-border/60 divide-y"
                    data-course-rows
                ></tbody>
            </table>
        </div>
        <p class="text-text-muted mt-3 text-xs" data-course-empty>
            <span
                >אין קורסים שמורים עדיין. סנכרן אונליין כדי לטעון נתונים.</span
            >
        </p>
    </section>
</template>
`,v=12,I="courseDataCount",N="courseDataRemoteUpdatedAt",K="קורסים",$="עדכון אחרון: —",j="עדכון אחרון",q="עמוד",F="מתוך",B="—";function W(){const t=document.createElement("template");t.innerHTML=P;const e=t.content.firstElementChild;if(!(e instanceof HTMLTemplateElement))throw new Error("CourseTable template element not found");const n=e.content.firstElementChild?.cloneNode(!0);if(!(n instanceof HTMLElement))throw new Error("CourseTable template root not found");const o=n.querySelector("[data-course-rows]"),a=n.querySelector("[data-course-empty]"),s=n.querySelector("[data-course-count]"),i=n.querySelector("[data-course-last-updated]"),d=n.querySelector("[data-course-page]"),l=n.querySelector("[data-course-prev]"),p=n.querySelector("[data-course-next]"),c=Array.from(n.querySelectorAll("[data-course-sort]")),f=Array.from(n.querySelectorAll("[data-sort-indicator]"));if(o===null||a===null||s===null||i===null||d===null||l===null||p===null||c.length===0||f.length===0)throw new Error("CourseTable required elements not found");const r={pageIndex:0,sortKey:"code",sortDirection:"asc"};l.addEventListener("click",()=>{r.pageIndex>0&&(r.pageIndex-=1,g(r,o,a,s,i,d,l,p,c,f))}),p.addEventListener("click",()=>{r.pageIndex+=1,g(r,o,a,s,i,d,l,p,c,f)});for(const h of c)h.addEventListener("click",()=>{const w=b(h.dataset.sortKey);w!==void 0&&(r.sortKey===w?r.sortDirection=r.sortDirection==="asc"?"desc":"asc":(r.sortKey=w,r.sortDirection="asc"),r.pageIndex=0,g(r,o,a,s,i,d,l,p,c,f))});return R({onSync:()=>{g(r,o,a,s,i,d,l,p,c,f)}}),g(r,o,a,s,i,d,l,p,c,f),n}async function g(t,e,n,o,a,s,i,d,l,p){const[c,f,r]=await Promise.all([U(v,t.pageIndex*v,t.sortKey,t.sortDirection),x(I),x(N)]);J(l,p,t),H(o,c.length,f?.value),Y(a,r?.value),e.replaceChildren();for(const h of c)e.append(G(h));c.length===0?n.classList.remove("hidden"):n.classList.add("hidden"),z(s,i,d,t.pageIndex,f?.value,c.length)}function H(t,e,n){const o=L(n),a=K,s=o??e;t.textContent=`${String(s)} ${a}`}function L(t){if(typeof t=="number"&&Number.isFinite(t))return t;if(typeof t=="string"){const e=Number.parseInt(t,10);if(!Number.isNaN(e))return e}}function Y(t,e){const n=V(e);if(n===void 0){t.textContent=$;return}const o=j;t.textContent=`${o}: ${n}`}function V(t){if(typeof t!="string"||t.length===0)return;const e=new Date(t);if(!Number.isNaN(e.getTime()))return e.toLocaleDateString()}function z(t,e,n,o,a,s){const i=L(a),d=i!==void 0?Math.max(1,Math.ceil(i/v)):o+1,l=Math.min(o+1,d),p=q,c=F;t.textContent=`${p} ${String(l)} ${c} ${String(d)}`,e.disabled=o<=0,n.disabled=i!==void 0?o+1>=d:s<v,C(e),C(n)}function C(t){t.disabled?(t.classList.add("opacity-60"),t.classList.add("cursor-not-allowed")):(t.classList.remove("opacity-60"),t.classList.remove("cursor-not-allowed"))}function G(t){const e=document.createElement("tr");e.className="text-text";const n=A();return e.append(y(t.code,"whitespace-nowrap overflow-hidden")),e.append(y(t.name??n,"w-full whitespace-normal")),e.append(y(S(t.points),"whitespace-nowrap overflow-hidden")),e.append(y(S(t.median),"whitespace-nowrap overflow-hidden")),e}function y(t,e){const n=document.createElement("td");return n.className=e!==void 0&&e.length>0?`px-2 py-2 text-start ${e}`:"px-2 py-2 text-start",n.textContent=t,n}function S(t){return t===void 0||!Number.isFinite(t)?A():t.toString()}function A(){return B}function b(t){if(t==="code"||t==="name"||t==="points"||t==="median")return t}function J(t,e,n){for(const o of t){const a=b(o.dataset.sortKey);if(a===void 0)continue;const s=a===n.sortKey;o.classList.toggle("text-text",s),o.classList.toggle("text-text-muted",!s),o.setAttribute("aria-pressed",s?"true":"false")}for(const o of e){const a=b(o.dataset.sortKey);if(a!==void 0){if(a!==n.sortKey){o.replaceChildren();continue}o.replaceChildren(X(n.sortDirection))}}}function X(t){const e=document.createElementNS("http://www.w3.org/2000/svg","svg");e.setAttribute("viewBox","0 0 24 24"),e.setAttribute("aria-hidden","true"),e.classList.add("h-3","w-3","text-text-muted");const n=document.createElementNS("http://www.w3.org/2000/svg","path");return n.setAttribute("fill","currentColor"),n.setAttribute("d",t==="asc"?"M12 8l5 6H7l5-6z":"M12 16l-5-6h10l-5 6z"),e.append(n),e}export{W as C};
