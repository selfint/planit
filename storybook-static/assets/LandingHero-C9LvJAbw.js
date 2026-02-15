const a=`<template>
    <section class="grid place-items-center gap-8" data-component="LandingHero">
        <div class="flex flex-col items-center gap-6 text-center">
            <div class="flex flex-col gap-3">
                <p
                    class="border-border/70 bg-surface-1/80 text-text-muted w-fit self-center rounded-full border px-3 py-1 text-xs"
                >
                    חדש: תמיכה ב-offline
                </p>
                <h1
                    class="text-3xl font-medium sm:text-[2.6rem]"
                    data-slot="title"
                >
                    תכנון תואר בטכניון בקלות.
                </h1>
                <div
                    class="bg-accent/30 h-1 w-16 self-center rounded-full"
                ></div>
                <p class="text-text-muted text-sm" data-slot="summary">
                    Planit מרכזת את הקטלוגים, הדרישות והתכנון הסמסטריאלי למבט
                    אחד ברור.
                </p>
            </div>
            <div
                class="flex flex-wrap justify-center gap-3"
                data-slot="actions"
            >
                <a
                    class="bg-accent text-accent-contrast rounded-full px-5 py-2 text-xs font-medium shadow-sm"
                    href="/plan"
                    data-action="primary"
                >
                    התחל לתכנן
                </a>
                <a
                    class="border-border/70 bg-surface-2/70 text-text-muted hover:border-accent/40 hover:text-text rounded-full border px-5 py-2 text-xs font-medium transition duration-200 ease-out"
                    href="/semester"
                    data-action="secondary"
                >
                    צפה בהדגמה
                </a>
            </div>
        </div>
    </section>
</template>
`;function o(){const e=document.createElement("template");e.innerHTML=a;const t=e.content.firstElementChild;if(!(t instanceof HTMLTemplateElement))throw new Error("LandingHero template element not found");const n=t.content.firstElementChild?.cloneNode(!0);if(!(n instanceof HTMLElement))throw new Error("LandingHero template root not found");return n}export{o as L};
