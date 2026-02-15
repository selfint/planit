const x=`<template>
    <article
        class="border-border/60 bg-surface-1/80 text-text group flex h-full w-full flex-col gap-2 rounded-2xl border p-3 shadow-sm"
        data-component="CourseCard"
        data-skeleton="true"
    >
        <div class="text-text-muted flex items-center justify-between text-xs">
            <span
                class="group-data-[skeleton=true]:skeleton-shimmer size-3 rounded-none"
                data-role="status-dot"
            ></span>
            <div class="flex items-center gap-3">
                <span
                    class="text-text group-data-[skeleton=true]:skeleton-shimmer group-data-[skeleton=true]:inline-block group-data-[skeleton=true]:h-3 group-data-[skeleton=true]:w-7 group-data-[skeleton=true]:rounded-md"
                    data-role="course-points"
                ></span>
                <span
                    class="text-text group-data-[skeleton=true]:skeleton-shimmer group-data-[skeleton=true]:inline-block group-data-[skeleton=true]:h-3 group-data-[skeleton=true]:w-10 group-data-[skeleton=true]:rounded-md"
                    data-role="course-median"
                ></span>
            </div>
        </div>
        <div class="flex flex-col gap-1">
            <p
                class="group-data-[skeleton=true]:skeleton-shimmer text-sm font-medium group-data-[skeleton=true]:block group-data-[skeleton=true]:h-4 group-data-[skeleton=true]:w-32 group-data-[skeleton=true]:rounded-md"
                data-role="course-title"
            ></p>
            <p
                class="text-text-muted group-data-[skeleton=true]:skeleton-shimmer text-xs group-data-[skeleton=true]:block group-data-[skeleton=true]:h-3 group-data-[skeleton=true]:w-20 group-data-[skeleton=true]:rounded-md"
                data-role="course-code"
            ></p>
        </div>
    </article>
</template>
`,h="bg-success",i=["bg-success","bg-warning","bg-info","bg-danger","bg-accent"];const C="קורס ללא שם";function E(e,n){const o=document.createElement("template");o.innerHTML=x;const r=o.content.firstElementChild;if(!(r instanceof HTMLTemplateElement))throw new Error("CourseCard template element not found");const t=r.content.firstElementChild?.cloneNode(!0);if(!(t instanceof HTMLElement))throw new Error("CourseCard template root not found");if(e===void 0)return b(t),t;t.removeAttribute("data-skeleton"),t.removeAttribute("aria-busy");const p=n?.statusClass??T(e.code)??h,s=n?.emptyValue??"—",g=e.name??C,f=(Array.isArray(e.tests)?e.tests.some(k=>k!==null):!1)?"rounded-full":"rounded-none",a=t.querySelector("[data-role='status-dot']");a!==null&&(a.className=`h-2.5 w-2.5 ${f} ${p}`);const l=t.querySelector("[data-role='course-points']");l!==null&&(l.textContent=m(e.points,s));const u=t.querySelector("[data-role='course-median']");u!==null&&(u.textContent=m(e.median,s));const d=t.querySelector("[data-role='course-title']");d!==null&&(d.textContent=g);const c=t.querySelector("[data-role='course-code']");return c!==null&&(c.textContent=e.code),t}function b(e){e.setAttribute("data-skeleton","true"),e.setAttribute("aria-busy","true");const n=e.querySelectorAll("[data-role='course-points'], [data-role='course-median'], [data-role='course-title'], [data-role='course-code']");for(const o of n)o.textContent=""}function m(e,n){return e===void 0||!Number.isFinite(e)?n:e.toString()}function T(e){const n=e.trim();if(n.length===0)return;let o=0;for(let r=0;r<n.length;r+=1)o=(o*31+n.charCodeAt(r))%i.length;return i[o]}export{E as C};
