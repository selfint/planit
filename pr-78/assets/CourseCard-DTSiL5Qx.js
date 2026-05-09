const k=`<template>
    <article
        class="border-border/60 bg-surface-1/80 text-text group flex h-full w-full min-w-fit flex-col gap-2 overflow-hidden rounded-2xl border p-2.5 text-xs shadow-sm"
        data-component="CourseCard"
        data-skeleton="true"
    >
        <div
            class="text-text-muted flex items-center justify-between text-xs/4"
        >
            <span
                class="group-data-[skeleton=true]:skeleton-shimmer me-2.5 size-3 min-h-3 min-w-3 shrink-0 rounded-none"
                data-role="status-dot"
            ></span>
            <span class="shrink-0 leading-none whitespace-nowrap tabular-nums">
                <span
                    class="text-text group-data-[skeleton=true]:skeleton-shimmer inline-block shrink-0 align-middle group-data-[skeleton=true]:h-3 group-data-[skeleton=true]:w-[2.5ch] group-data-[skeleton=true]:rounded-md"
                    data-role="course-points"
                ></span>
                <span
                    class="text-text group-data-[skeleton=true]:skeleton-shimmer inline-block shrink-0 align-middle group-data-[skeleton=true]:h-3 group-data-[skeleton=true]:w-[3.5ch] group-data-[skeleton=true]:rounded-md"
                    data-role="course-median"
                ></span>
            </span>
        </div>
        <div class="flex flex-col gap-1">
            <p
                class="group-data-[skeleton=true]:skeleton-shimmer [display:-webkit-box] overflow-hidden text-xs/4 leading-none font-medium [-webkit-box-orient:vertical] group-data-[skeleton=true]:block group-data-[skeleton=true]:h-12 group-data-[skeleton=true]:w-full group-data-[skeleton=true]:max-w-full group-data-[skeleton=true]:rounded-md"
                data-role="course-title"
            ></p>
            <p
                class="text-text-muted group-data-[skeleton=true]:skeleton-shimmer h-4 truncate text-xs/4 leading-none group-data-[skeleton=true]:block group-data-[skeleton=true]:h-3 group-data-[skeleton=true]:w-[70%] group-data-[skeleton=true]:max-w-full group-data-[skeleton=true]:rounded-md"
                data-role="course-code"
            ></p>
        </div>
    </article>
</template>
`,x="hsl(168 56% 46%)";const g="קורס ללא שם";function E(e,o){const n=document.createElement("template");n.innerHTML=k;const a=n.content.firstElementChild;if(!(a instanceof HTMLTemplateElement))throw new Error("CourseCard template element not found");const t=a.content.firstElementChild?.cloneNode(!0);if(!(t instanceof HTMLElement))throw new Error("CourseCard template root not found");if(e===void 0)return C(t),t;t.removeAttribute("data-skeleton"),t.removeAttribute("aria-busy");const s=b(e.code)??x,r="—",p=e.name??g,f=(Array.isArray(e.tests)?e.tests.some(h=>h!==null):!1)?"rounded-full":"rounded-none",l=t.querySelector("[data-role='status-dot']");l!==null&&(l.className=`me-[10px] h-3 w-3 min-h-3 min-w-3 shrink-0 ${f}`,l.style.backgroundColor=s);const u=t.querySelector("[data-role='course-points']");u!==null&&(u.textContent=m(e.points,r));const d=t.querySelector("[data-role='course-median']");d!==null&&(d.textContent=m(e.median,r));const i=t.querySelector("[data-role='course-title']");i!==null&&(i.textContent=p);const c=t.querySelector("[data-role='course-code']");return c!==null&&(c.textContent=e.code),t}function C(e){e.setAttribute("data-skeleton","true"),e.setAttribute("aria-busy","true");const o=e.querySelectorAll("[data-role='course-points'], [data-role='course-median'], [data-role='course-title'], [data-role='course-code']");for(const n of o)n.textContent=""}function m(e,o){return e===void 0||!Number.isFinite(e)?o:e.toString()}function b(e){const o=e.trim();if(o.length===0)return;let n=2166136261;for(let r=0;r<o.length;r+=1)n^=o.charCodeAt(r),n=Math.imul(n,16777619);n>>>=0;const a=n%360,t=58+(n>>>9)%18,s=42+(n>>>17)%16;return`hsl(${a} ${t}% ${s}%)`}export{E as C};
