import{C as se}from"./ConsoleNav-CDxOvyt6.js";import{C as ge}from"./CourseCard-DTSiL5Qx.js";import{s as w}from"./stateManagement-B8gT_tAG.js";import"./Title-Whni9imO.js";const we={BASE_URL:"./",DEV:!1,MODE:"production",PROD:!0,SSR:!1,STORYBOOK:"true"};function be(e,n){const s=we[e];return typeof s=="string"&&s.length>0?s:n}be("VITE_DATA_BASE_URL","_data");const Ce="planit:course-sync",re=`<template>
    <section class="text-text min-h-screen w-full" data-page="course">
        <div data-console-nav></div>
        <main
            class="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-6 px-3 pt-4 pb-[calc(env(safe-area-inset-bottom)+2rem)] sm:px-4 lg:px-6"
            data-role="course-page-root"
        >
            <header class="flex w-full flex-col gap-3">
                <div class="flex w-full flex-col gap-4 py-1">
                    <div
                        class="flex flex-wrap items-start justify-between gap-4"
                    >
                        <div class="flex flex-col gap-2">
                            <h1
                                class="text-2xl font-medium sm:text-3xl"
                                data-role="course-name"
                            >
                                פרטי קורס
                            </h1>
                            <p
                                class="text-text-muted max-w-3xl text-xs"
                                data-role="course-about"
                            >
                                בחרו קורס כדי לראות תיאור מלא, תנאי קדם וקשרים
                                לקורסים נוספים.
                            </p>
                        </div>
                    </div>

                    <dl
                        class="grid w-full grid-cols-2 gap-3 text-xs sm:grid-cols-4"
                    >
                        <div
                            class="bg-surface-2/70 data-[loading=true]:skeleton-shimmer rounded-2xl p-3 data-[loading=true]:text-transparent"
                            data-loading="false"
                            data-role="course-points-card"
                        >
                            <dt class="text-text-muted">נק"ז</dt>
                            <dd
                                class="text-sm font-medium"
                                data-role="course-points"
                            >
                                —
                            </dd>
                        </div>
                        <div
                            class="bg-surface-2/70 data-[loading=true]:skeleton-shimmer rounded-2xl p-3 data-[loading=true]:text-transparent"
                            data-loading="false"
                            data-role="course-median-card"
                        >
                            <dt class="text-text-muted">חציון</dt>
                            <dd
                                class="text-sm font-medium"
                                data-role="course-median"
                            >
                                —
                            </dd>
                        </div>
                        <div
                            class="bg-surface-2/70 data-[loading=true]:skeleton-shimmer rounded-2xl p-3 data-[loading=true]:text-transparent"
                            data-loading="false"
                            data-role="course-faculty-card"
                        >
                            <dt class="text-text-muted">פקולטה</dt>
                            <dd
                                class="text-sm font-medium"
                                data-role="course-faculty"
                            >
                                —
                            </dd>
                        </div>
                        <div
                            class="bg-surface-2/70 data-[loading=true]:skeleton-shimmer rounded-2xl p-3 data-[loading=true]:text-transparent"
                            data-loading="false"
                            data-role="course-seasons-card"
                        >
                            <dt class="text-text-muted">סמסטרים</dt>
                            <dd
                                class="text-sm font-medium"
                                data-role="course-seasons"
                            >
                                —
                            </dd>
                        </div>
                    </dl>

                    <div class="flex flex-wrap gap-2 text-xs">
                        <div
                            class="relative inline-flex"
                            data-role="semester-split-control"
                        >
                            <button
                                type="button"
                                class="bg-accent text-accent-contrast inline-flex min-h-10 touch-manipulation items-center rounded-s-full px-4 font-medium"
                                data-role="semester-add-current"
                            >
                                הוסף לסמסטר הנוכחי
                            </button>
                            <details
                                class="static"
                                data-role="semester-dropdown"
                            >
                                <summary
                                    class="bg-accent text-accent-contrast flex min-h-10 w-10 touch-manipulation list-none items-center justify-center rounded-e-full border-s border-black/10 px-0"
                                    data-role="semester-dropdown-toggle"
                                >
                                    <svg
                                        viewBox="0 0 24 24"
                                        aria-hidden="true"
                                        class="size-5"
                                        fill="none"
                                        stroke="currentColor"
                                        stroke-width="2"
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                    >
                                        <path d="M6 9l6 6 6-6"></path>
                                    </svg>
                                    <span class="sr-only">בחירת סמסטר אחר</span>
                                </summary>
                                <div
                                    class="border-border bg-surface-1 absolute start-0 z-20 mt-2 flex w-[calc(100%-2.5rem)] flex-col rounded-2xl border p-1 shadow-lg"
                                    data-role="semester-dropdown-menu"
                                ></div>
                            </details>
                        </div>
                        <button
                            type="button"
                            class="border-border bg-surface-2 text-text inline-flex min-h-10 touch-manipulation items-center rounded-full border px-4 font-medium"
                            data-role="wishlist-add"
                        >
                            הוסף לרשימת המשאלות
                        </button>
                        <button
                            type="button"
                            class="border-border bg-surface-2 text-text inline-flex min-h-10 touch-manipulation items-center rounded-full border px-4 font-medium"
                            data-role="exemptions-add"
                        >
                            הוסף לפטורים
                        </button>
                        <button
                            type="button"
                            class="border-border bg-surface-2 text-text hidden min-h-10 touch-manipulation items-center rounded-full border px-4 font-medium"
                            data-role="placement-remove"
                        >
                            הסר
                        </button>
                    </div>
                    <p
                        class="text-text-muted text-xs"
                        data-role="action-status"
                    ></p>
                </div>
            </header>

            <section class="hidden w-full py-4" data-state="not-found">
                <h2 class="text-lg font-medium">לא נמצא קורס תואם</h2>
                <p
                    class="text-text-muted mt-2 text-sm"
                    data-role="not-found-message"
                >
                    לא נמצא קורס מתאים לבקשה הנוכחית.
                </p>
            </section>

            <section class="w-full flex-col gap-8" data-role="relations-root">
                <article class="flex w-full flex-col gap-3">
                    <div class="flex items-center justify-between gap-2">
                        <h2 class="text-lg font-medium">קורסי קדם</h2>
                        <p
                            class="skeleton-shimmer inline-block h-3 w-16 rounded-md text-xs text-transparent"
                            data-role="dependencies-count"
                        ></p>
                    </div>
                    <div
                        class="flex flex-col gap-4"
                        data-role="dependencies-grid"
                    >
                        <section class="flex flex-col gap-3">
                            <div
                                class="grid w-fit max-w-full grid-cols-[repeat(auto-fit,minmax(5rem,1fr))] justify-start gap-2 md:grid-cols-[repeat(auto-fit,minmax(7rem,1fr))] lg:grid-cols-[repeat(auto-fit,minmax(9rem,1fr))]"
                            >
                                <article
                                    aria-busy="true"
                                    class="border-border/60 bg-surface-1/80 text-text group flex h-full w-full min-w-fit flex-col gap-2 overflow-hidden rounded-2xl border p-3 text-xs shadow-sm"
                                    data-component="CourseCard"
                                    data-skeleton="true"
                                >
                                    <div
                                        class="text-text-muted flex items-center justify-between text-xs/4"
                                    >
                                        <span
                                            class="skeleton-shimmer me-2.5 size-3 min-h-3 min-w-3 shrink-0 rounded-none"
                                        ></span>
                                        <span
                                            class="shrink-0 leading-none whitespace-nowrap tabular-nums"
                                        >
                                            <span
                                                class="skeleton-shimmer inline-block h-3 w-[2.5ch] rounded-md"
                                            ></span>
                                            <span
                                                class="skeleton-shimmer inline-block h-3 w-[3.5ch] rounded-md"
                                            ></span>
                                        </span>
                                    </div>
                                    <div class="flex flex-col gap-1">
                                        <p
                                            class="skeleton-shimmer block h-12 w-full rounded-md"
                                        ></p>
                                        <p
                                            class="skeleton-shimmer block h-3 w-[70%] rounded-md"
                                        ></p>
                                    </div>
                                </article>
                                <article
                                    aria-busy="true"
                                    class="border-border/60 bg-surface-1/80 text-text group flex h-full w-full min-w-fit flex-col gap-2 overflow-hidden rounded-2xl border p-3 text-xs shadow-sm"
                                    data-component="CourseCard"
                                    data-skeleton="true"
                                >
                                    <div
                                        class="text-text-muted flex items-center justify-between text-xs/4"
                                    >
                                        <span
                                            class="skeleton-shimmer me-2.5 size-3 min-h-3 min-w-3 shrink-0 rounded-none"
                                        ></span>
                                        <span
                                            class="shrink-0 leading-none whitespace-nowrap tabular-nums"
                                        >
                                            <span
                                                class="skeleton-shimmer inline-block h-3 w-[2.5ch] rounded-md"
                                            ></span>
                                            <span
                                                class="skeleton-shimmer inline-block h-3 w-[3.5ch] rounded-md"
                                            ></span>
                                        </span>
                                    </div>
                                    <div class="flex flex-col gap-1">
                                        <p
                                            class="skeleton-shimmer block h-12 w-full rounded-md"
                                        ></p>
                                        <p
                                            class="skeleton-shimmer block h-3 w-[70%] rounded-md"
                                        ></p>
                                    </div>
                                </article>
                                <article
                                    aria-busy="true"
                                    class="border-border/60 bg-surface-1/80 text-text group flex h-full w-full min-w-fit flex-col gap-2 overflow-hidden rounded-2xl border p-3 text-xs shadow-sm"
                                    data-component="CourseCard"
                                    data-skeleton="true"
                                >
                                    <div
                                        class="text-text-muted flex items-center justify-between text-xs/4"
                                    >
                                        <span
                                            class="skeleton-shimmer me-2.5 size-3 min-h-3 min-w-3 shrink-0 rounded-none"
                                        ></span>
                                        <span
                                            class="shrink-0 leading-none whitespace-nowrap tabular-nums"
                                        >
                                            <span
                                                class="skeleton-shimmer inline-block h-3 w-[2.5ch] rounded-md"
                                            ></span>
                                            <span
                                                class="skeleton-shimmer inline-block h-3 w-[3.5ch] rounded-md"
                                            ></span>
                                        </span>
                                    </div>
                                    <div class="flex flex-col gap-1">
                                        <p
                                            class="skeleton-shimmer block h-12 w-full rounded-md"
                                        ></p>
                                        <p
                                            class="skeleton-shimmer block h-3 w-[70%] rounded-md"
                                        ></p>
                                    </div>
                                </article>
                            </div>
                        </section>
                    </div>
                    <p
                        class="text-text-muted text-xs"
                        data-role="dependencies-empty"
                    >
                        אין לקורס קורסי קדם רשומים.
                    </p>
                </article>

                <article class="mt-4 flex w-full flex-col gap-3">
                    <div class="flex items-center justify-between gap-2">
                        <h2 class="text-lg font-medium">קורסים תלויים</h2>
                        <p
                            class="skeleton-shimmer inline-block h-3 w-16 rounded-md text-xs text-transparent"
                            data-role="dependants-count"
                        ></p>
                    </div>
                    <div
                        class="grid w-fit max-w-full grid-cols-[repeat(auto-fit,minmax(5rem,1fr))] justify-start gap-2 md:grid-cols-[repeat(auto-fit,minmax(7rem,1fr))] lg:grid-cols-[repeat(auto-fit,minmax(9rem,1fr))]"
                        data-role="dependants-grid"
                    >
                        <article
                            aria-busy="true"
                            class="border-border/60 bg-surface-1/80 text-text group flex h-full w-full min-w-fit flex-col gap-2 overflow-hidden rounded-2xl border p-3 text-xs shadow-sm"
                            data-component="CourseCard"
                            data-skeleton="true"
                        >
                            <div
                                class="text-text-muted flex items-center justify-between text-xs/4"
                            >
                                <span
                                    class="skeleton-shimmer me-2.5 size-3 min-h-3 min-w-3 shrink-0 rounded-none"
                                ></span>
                                <span
                                    class="shrink-0 leading-none whitespace-nowrap tabular-nums"
                                >
                                    <span
                                        class="skeleton-shimmer inline-block h-3 w-[2.5ch] rounded-md"
                                    ></span>
                                    <span
                                        class="skeleton-shimmer inline-block h-3 w-[3.5ch] rounded-md"
                                    ></span>
                                </span>
                            </div>
                            <div class="flex flex-col gap-1">
                                <p
                                    class="skeleton-shimmer block h-12 w-full rounded-md"
                                ></p>
                                <p
                                    class="skeleton-shimmer block h-3 w-[70%] rounded-md"
                                ></p>
                            </div>
                        </article>
                        <article
                            aria-busy="true"
                            class="border-border/60 bg-surface-1/80 text-text group flex h-full w-full min-w-fit flex-col gap-2 overflow-hidden rounded-2xl border p-3 text-xs shadow-sm"
                            data-component="CourseCard"
                            data-skeleton="true"
                        >
                            <div
                                class="text-text-muted flex items-center justify-between text-xs/4"
                            >
                                <span
                                    class="skeleton-shimmer me-2.5 size-3 min-h-3 min-w-3 shrink-0 rounded-none"
                                ></span>
                                <span
                                    class="shrink-0 leading-none whitespace-nowrap tabular-nums"
                                >
                                    <span
                                        class="skeleton-shimmer inline-block h-3 w-[2.5ch] rounded-md"
                                    ></span>
                                    <span
                                        class="skeleton-shimmer inline-block h-3 w-[3.5ch] rounded-md"
                                    ></span>
                                </span>
                            </div>
                            <div class="flex flex-col gap-1">
                                <p
                                    class="skeleton-shimmer block h-12 w-full rounded-md"
                                ></p>
                                <p
                                    class="skeleton-shimmer block h-3 w-[70%] rounded-md"
                                ></p>
                            </div>
                        </article>
                        <article
                            aria-busy="true"
                            class="border-border/60 bg-surface-1/80 text-text group flex h-full w-full min-w-fit flex-col gap-2 overflow-hidden rounded-2xl border p-3 text-xs shadow-sm"
                            data-component="CourseCard"
                            data-skeleton="true"
                        >
                            <div
                                class="text-text-muted flex items-center justify-between text-xs/4"
                            >
                                <span
                                    class="skeleton-shimmer me-2.5 size-3 min-h-3 min-w-3 shrink-0 rounded-none"
                                ></span>
                                <span
                                    class="shrink-0 leading-none whitespace-nowrap tabular-nums"
                                >
                                    <span
                                        class="skeleton-shimmer inline-block h-3 w-[2.5ch] rounded-md"
                                    ></span>
                                    <span
                                        class="skeleton-shimmer inline-block h-3 w-[3.5ch] rounded-md"
                                    ></span>
                                </span>
                            </div>
                            <div class="flex flex-col gap-1">
                                <p
                                    class="skeleton-shimmer block h-12 w-full rounded-md"
                                ></p>
                                <p
                                    class="skeleton-shimmer block h-3 w-[70%] rounded-md"
                                ></p>
                            </div>
                        </article>
                    </div>
                    <p
                        class="text-text-muted text-xs"
                        data-role="dependants-empty"
                    >
                        אין קורסים שתלויים בקורס זה.
                    </p>
                </article>

                <article class="mt-4 flex w-full flex-col gap-3">
                    <div class="flex items-center justify-between gap-2">
                        <h2 class="text-lg font-medium">קורסים צמודים</h2>
                        <p
                            class="skeleton-shimmer inline-block h-3 w-16 rounded-md text-xs text-transparent"
                            data-role="adjacent-count"
                        ></p>
                    </div>
                    <div
                        class="grid w-fit max-w-full grid-cols-[repeat(auto-fit,minmax(5rem,1fr))] justify-start gap-2 md:grid-cols-[repeat(auto-fit,minmax(7rem,1fr))] lg:grid-cols-[repeat(auto-fit,minmax(9rem,1fr))]"
                        data-role="adjacent-grid"
                    >
                        <article
                            aria-busy="true"
                            class="border-border/60 bg-surface-1/80 text-text group flex h-full w-full min-w-fit flex-col gap-2 overflow-hidden rounded-2xl border p-3 text-xs shadow-sm"
                            data-component="CourseCard"
                            data-skeleton="true"
                        >
                            <div
                                class="text-text-muted flex items-center justify-between text-xs/4"
                            >
                                <span
                                    class="skeleton-shimmer me-2.5 size-3 min-h-3 min-w-3 shrink-0 rounded-none"
                                ></span>
                                <span
                                    class="shrink-0 leading-none whitespace-nowrap tabular-nums"
                                >
                                    <span
                                        class="skeleton-shimmer inline-block h-3 w-[2.5ch] rounded-md"
                                    ></span>
                                    <span
                                        class="skeleton-shimmer inline-block h-3 w-[3.5ch] rounded-md"
                                    ></span>
                                </span>
                            </div>
                            <div class="flex flex-col gap-1">
                                <p
                                    class="skeleton-shimmer block h-12 w-full rounded-md"
                                ></p>
                                <p
                                    class="skeleton-shimmer block h-3 w-[70%] rounded-md"
                                ></p>
                            </div>
                        </article>
                        <article
                            aria-busy="true"
                            class="border-border/60 bg-surface-1/80 text-text group flex h-full w-full min-w-fit flex-col gap-2 overflow-hidden rounded-2xl border p-3 text-xs shadow-sm"
                            data-component="CourseCard"
                            data-skeleton="true"
                        >
                            <div
                                class="text-text-muted flex items-center justify-between text-xs/4"
                            >
                                <span
                                    class="skeleton-shimmer me-2.5 size-3 min-h-3 min-w-3 shrink-0 rounded-none"
                                ></span>
                                <span
                                    class="shrink-0 leading-none whitespace-nowrap tabular-nums"
                                >
                                    <span
                                        class="skeleton-shimmer inline-block h-3 w-[2.5ch] rounded-md"
                                    ></span>
                                    <span
                                        class="skeleton-shimmer inline-block h-3 w-[3.5ch] rounded-md"
                                    ></span>
                                </span>
                            </div>
                            <div class="flex flex-col gap-1">
                                <p
                                    class="skeleton-shimmer block h-12 w-full rounded-md"
                                ></p>
                                <p
                                    class="skeleton-shimmer block h-3 w-[70%] rounded-md"
                                ></p>
                            </div>
                        </article>
                        <article
                            aria-busy="true"
                            class="border-border/60 bg-surface-1/80 text-text group flex h-full w-full min-w-fit flex-col gap-2 overflow-hidden rounded-2xl border p-3 text-xs shadow-sm"
                            data-component="CourseCard"
                            data-skeleton="true"
                        >
                            <div
                                class="text-text-muted flex items-center justify-between text-xs/4"
                            >
                                <span
                                    class="skeleton-shimmer me-2.5 size-3 min-h-3 min-w-3 shrink-0 rounded-none"
                                ></span>
                                <span
                                    class="shrink-0 leading-none whitespace-nowrap tabular-nums"
                                >
                                    <span
                                        class="skeleton-shimmer inline-block h-3 w-[2.5ch] rounded-md"
                                    ></span>
                                    <span
                                        class="skeleton-shimmer inline-block h-3 w-[3.5ch] rounded-md"
                                    ></span>
                                </span>
                            </div>
                            <div class="flex flex-col gap-1">
                                <p
                                    class="skeleton-shimmer block h-12 w-full rounded-md"
                                ></p>
                                <p
                                    class="skeleton-shimmer block h-3 w-[70%] rounded-md"
                                ></p>
                            </div>
                        </article>
                    </div>
                    <p
                        class="text-text-muted text-xs"
                        data-role="adjacent-empty"
                    >
                        אין קורסים צמודים.
                    </p>
                </article>

                <article class="mt-4 flex w-full flex-col gap-3">
                    <div class="flex items-center justify-between gap-2">
                        <h2 class="text-lg font-medium">ללא זיכוי נוסף</h2>
                        <p
                            class="skeleton-shimmer inline-block h-3 w-16 rounded-md text-xs text-transparent"
                            data-role="exclusive-count"
                        ></p>
                    </div>
                    <div
                        class="grid w-fit max-w-full grid-cols-[repeat(auto-fit,minmax(5rem,1fr))] justify-start gap-2 md:grid-cols-[repeat(auto-fit,minmax(7rem,1fr))] lg:grid-cols-[repeat(auto-fit,minmax(9rem,1fr))]"
                        data-role="exclusive-grid"
                    >
                        <article
                            aria-busy="true"
                            class="border-border/60 bg-surface-1/80 text-text group flex h-full w-full min-w-fit flex-col gap-2 overflow-hidden rounded-2xl border p-3 text-xs shadow-sm"
                            data-component="CourseCard"
                            data-skeleton="true"
                        >
                            <div
                                class="text-text-muted flex items-center justify-between text-xs/4"
                            >
                                <span
                                    class="skeleton-shimmer me-2.5 size-3 min-h-3 min-w-3 shrink-0 rounded-none"
                                ></span>
                                <span
                                    class="shrink-0 leading-none whitespace-nowrap tabular-nums"
                                >
                                    <span
                                        class="skeleton-shimmer inline-block h-3 w-[2.5ch] rounded-md"
                                    ></span>
                                    <span
                                        class="skeleton-shimmer inline-block h-3 w-[3.5ch] rounded-md"
                                    ></span>
                                </span>
                            </div>
                            <div class="flex flex-col gap-1">
                                <p
                                    class="skeleton-shimmer block h-12 w-full rounded-md"
                                ></p>
                                <p
                                    class="skeleton-shimmer block h-3 w-[70%] rounded-md"
                                ></p>
                            </div>
                        </article>
                        <article
                            aria-busy="true"
                            class="border-border/60 bg-surface-1/80 text-text group flex h-full w-full min-w-fit flex-col gap-2 overflow-hidden rounded-2xl border p-3 text-xs shadow-sm"
                            data-component="CourseCard"
                            data-skeleton="true"
                        >
                            <div
                                class="text-text-muted flex items-center justify-between text-xs/4"
                            >
                                <span
                                    class="skeleton-shimmer me-2.5 size-3 min-h-3 min-w-3 shrink-0 rounded-none"
                                ></span>
                                <span
                                    class="shrink-0 leading-none whitespace-nowrap tabular-nums"
                                >
                                    <span
                                        class="skeleton-shimmer inline-block h-3 w-[2.5ch] rounded-md"
                                    ></span>
                                    <span
                                        class="skeleton-shimmer inline-block h-3 w-[3.5ch] rounded-md"
                                    ></span>
                                </span>
                            </div>
                            <div class="flex flex-col gap-1">
                                <p
                                    class="skeleton-shimmer block h-12 w-full rounded-md"
                                ></p>
                                <p
                                    class="skeleton-shimmer block h-3 w-[70%] rounded-md"
                                ></p>
                            </div>
                        </article>
                        <article
                            aria-busy="true"
                            class="border-border/60 bg-surface-1/80 text-text group flex h-full w-full min-w-fit flex-col gap-2 overflow-hidden rounded-2xl border p-3 text-xs shadow-sm"
                            data-component="CourseCard"
                            data-skeleton="true"
                        >
                            <div
                                class="text-text-muted flex items-center justify-between text-xs/4"
                            >
                                <span
                                    class="skeleton-shimmer me-2.5 size-3 min-h-3 min-w-3 shrink-0 rounded-none"
                                ></span>
                                <span
                                    class="shrink-0 leading-none whitespace-nowrap tabular-nums"
                                >
                                    <span
                                        class="skeleton-shimmer inline-block h-3 w-[2.5ch] rounded-md"
                                    ></span>
                                    <span
                                        class="skeleton-shimmer inline-block h-3 w-[3.5ch] rounded-md"
                                    ></span>
                                </span>
                            </div>
                            <div class="flex flex-col gap-1">
                                <p
                                    class="skeleton-shimmer block h-12 w-full rounded-md"
                                ></p>
                                <p
                                    class="skeleton-shimmer block h-3 w-[70%] rounded-md"
                                ></p>
                            </div>
                        </article>
                    </div>
                    <p
                        class="text-text-muted text-xs"
                        data-role="exclusive-empty"
                    >
                        אין קורסים ללא זיכוי נוסף.
                    </p>
                </article>
            </section>
        </main>
    </section>
</template>
`,A="—",oe="קורס לא זמין במאגר",Q=300,ke=3,ae=6,P=["אביב","קיץ","חורף"],ve=["skeleton-shimmer","inline-block","h-3","w-16","rounded-md","text-transparent"];function ie(){const e=document.createElement("template");e.innerHTML=re;const n=e.content.firstElementChild;if(!(n instanceof HTMLTemplateElement))throw new Error("CoursePage template element not found");const t=n.content.firstElementChild?.cloneNode(!0);if(!(t instanceof HTMLElement))throw new Error("CoursePage template root not found");const s=t.querySelector("[data-console-nav]");s!==null&&s.replaceWith(se({activePath:"/course"}));const r=Se(t),o=Ee(window.location.search);return Ae(t,r,o),o===void 0?(ue(r,"נדרש פרמטר code בכתובת, למשל /course?code=104031."),le(r),r.actionStatus.textContent="אי אפשר לעדכן תכנית בלי קוד קורס.",t):(ee(r,o),window.addEventListener(Ce,()=>{t.isConnected&&ee(r,o)}),t)}function ye(){const e=document.createElement("template");e.innerHTML=re;const n=e.content.firstElementChild;if(!(n instanceof HTMLTemplateElement))throw new Error("CoursePage template element not found");const t=n.content.firstElementChild?.cloneNode(!0);if(!(t instanceof HTMLElement))throw new Error("CoursePage template root not found");const s=t.querySelector("[data-console-nav]");return s!==null&&s.replaceWith(se({activePath:"/course"})),t}function Se(e){const n=e.querySelector("[data-role='course-name']"),t=e.querySelector("[data-role='course-about']"),s=e.querySelector("[data-role='course-points']"),r=e.querySelector("[data-role='course-median']"),o=e.querySelector("[data-role='course-faculty']"),a=e.querySelector("[data-role='course-seasons']"),i=e.querySelector("[data-role='course-points-card']"),d=e.querySelector("[data-role='course-median-card']"),c=e.querySelector("[data-role='course-faculty-card']"),m=e.querySelector("[data-role='course-seasons-card']"),p=e.querySelector("[data-role='semester-split-control']"),C=e.querySelector("[data-role='semester-add-current']"),h=e.querySelector("[data-role='semester-dropdown']"),q=e.querySelector("[data-role='semester-dropdown-menu']"),U=e.querySelector("[data-role='wishlist-add']"),z=e.querySelector("[data-role='exemptions-add']"),_=e.querySelector("[data-role='placement-remove']"),D=e.querySelector("[data-role='action-status']"),F=e.querySelector("[data-state='not-found']"),I=e.querySelector("[data-role='not-found-message']"),G=e.querySelector("[data-role='dependencies-grid']"),$=e.querySelector("[data-role='dependencies-count']"),O=e.querySelector("[data-role='dependencies-empty']"),B=e.querySelector("[data-role='dependants-grid']"),H=e.querySelector("[data-role='dependants-count']"),W=e.querySelector("[data-role='dependants-empty']"),X=e.querySelector("[data-role='adjacent-grid']"),V=e.querySelector("[data-role='adjacent-count']"),K=e.querySelector("[data-role='adjacent-empty']"),Y=e.querySelector("[data-role='exclusive-grid']"),Z=e.querySelector("[data-role='exclusive-count']"),J=e.querySelector("[data-role='exclusive-empty']");if(n===null||t===null||s===null||r===null||o===null||a===null||i===null||d===null||c===null||m===null||p===null||C===null||h===null||q===null||U===null||z===null||_===null||D===null||F===null||I===null||G===null||$===null||O===null||B===null||H===null||W===null||X===null||V===null||K===null||Y===null||Z===null||J===null)throw new Error("CoursePage required elements not found");return{courseName:n,courseAbout:t,coursePoints:s,courseMedian:r,courseFaculty:o,courseSeasons:a,coursePointsCard:i,courseMedianCard:d,courseFacultyCard:c,courseSeasonsCard:m,semesterSplitControl:p,semesterAddCurrent:C,semesterDropdown:h,semesterDropdownMenu:q,wishlistAdd:U,exemptionsAdd:z,placementRemove:_,actionStatus:D,notFoundState:F,notFoundMessage:I,dependenciesGrid:G,dependenciesCount:$,dependenciesEmpty:O,dependantsGrid:B,dependantsCount:H,dependantsEmpty:W,adjacentGrid:X,adjacentCount:V,adjacentEmpty:K,exclusiveGrid:Y,exclusiveCount:Z,exclusiveEmpty:J}}function Ee(e){const t=new URLSearchParams(e).get("code");if(t===null)return;const s=t.trim().toUpperCase();if(s.length!==0)return s}function Ae(e,n,t){x(n,t),n.semesterAddCurrent.addEventListener("click",()=>{t!==void 0&&Re(n,t)}),n.wishlistAdd.addEventListener("click",()=>{t!==void 0&&Te(n,t)}),n.exemptionsAdd.addEventListener("click",()=>{t!==void 0&&qe(n,t)}),n.placementRemove.addEventListener("click",()=>{t!==void 0&&Ue(n,t)}),n.semesterDropdownMenu.addEventListener("click",s=>{const r=s.target;if(!(r instanceof Element))return;const o=r.closest("[data-semester-option]");if(o===null)return;const a=Number.parseInt(o.dataset.semesterIndex??"",10);!Number.isFinite(a)||t===void 0||Me(n,t,a)}),e.addEventListener("click",s=>{const r=s.target;r instanceof Node&&(n.semesterDropdown.contains(r)||(n.semesterDropdown.open=!1))})}function le(e){f(e.semesterSplitControl),f(e.wishlistAdd),f(e.exemptionsAdd),k(e.placementRemove),e.placementRemove.disabled=!0,e.semesterDropdown.open=!1}async function x(e,n){if(n===void 0){le(e),e.actionStatus.textContent.trim().length===0&&(e.actionStatus.textContent="אי אפשר לעדכן תכנית בלי קוד קורס.");return}const t=await j(),s=de(t,n);if(je(e,t.semesters,t.currentSemester),s.kind==="none"){k(e.semesterSplitControl),k(e.wishlistAdd),k(e.exemptionsAdd),f(e.placementRemove),e.placementRemove.disabled=!0;return}f(e.semesterSplitControl),f(e.wishlistAdd),f(e.exemptionsAdd),k(e.placementRemove),e.placementRemove.disabled=!1,e.placementRemove.textContent=Ne(s),e.semesterDropdown.open=!1}function f(e){e.classList.remove("inline-flex"),e.classList.add("hidden")}function k(e){e.classList.remove("hidden"),e.classList.add("inline-flex")}function je(e,n,t){const s=Math.max(ae,n.length),r=L(t,s),o=R(r,n[r]?.id);e.semesterAddCurrent.textContent=`הוסף ל${o}`,e.semesterDropdownMenu.replaceChildren();for(let a=0;a<s;a+=1){const i=document.createElement("button");i.type="button",i.className="hover:bg-surface-2 text-text touch-manipulation min-h-10 rounded-xl px-2.5 py-1.5 text-start text-xs",i.dataset.semesterOption="true",i.dataset.semesterIndex=String(a);const d=a===r,c=R(a,n[a]?.id);i.textContent=d?`${c} (נוכחי)`:c,e.semesterDropdownMenu.append(i)}}function R(e,n){const t=Le(n);if(t!==void 0)return`${t.season} ${String(t.year)}`;const s=Pe(e+1);return`${s.season} ${String(s.year)}`}function Le(e){if(e===void 0)return;const n=/^(אביב|קיץ|חורף)-(\d{4})-/.exec(e);if(n!==null)return{season:n[1],year:Number.parseInt(n[2],10)}}function Pe(e){const n=Math.max(0,e-1),t=P[n%P.length],s=2026+Math.floor(e/P.length);return{season:t,year:s}}function Ne(e){return e.kind==="semester"?`הסר מסמסטר ${String(e.semesterIndex+1)}`:e.kind==="wishlist"?"הסר מרשימת המשאלות":"הסר מהפטורים"}async function Re(e,n){u(e,!0),e.actionStatus.textContent="מוסיף לסמסטר הנוכחי...";const t=await j(),s=await ce(n,t.currentSemester);e.actionStatus.textContent=s?`הקורס נוסף לסמסטר ${String(t.currentSemester+1)}.`:"הקורס כבר קיים בסמסטר הנוכחי.",await x(e,n),u(e,!1)}async function Me(e,n,t){u(e,!0),e.actionStatus.textContent=`מוסיף לסמסטר ${String(t+1)}...`;const s=await ce(n,t);e.actionStatus.textContent=s?`הקורס נוסף לסמסטר ${String(t+1)}.`:`הקורס כבר קיים בסמסטר ${String(t+1)}.`,await x(e,n),u(e,!1)}async function Te(e,n){u(e,!0),e.actionStatus.textContent="מעדכן רשימת משאלות...";const t=await ze(n);e.actionStatus.textContent=t?"הקורס נוסף לרשימת המשאלות.":"הקורס כבר קיים ברשימת המשאלות.",await x(e,n),u(e,!1)}async function qe(e,n){u(e,!0),e.actionStatus.textContent="מעדכן פטורים...";const t=await _e(n);e.actionStatus.textContent=t?"הקורס נוסף לפטורים.":"הקורס כבר קיים בפטורים.",await x(e,n),u(e,!1)}async function Ue(e,n){u(e,!0),e.actionStatus.textContent="מסיר את הקורס מהתכנית...";const t=await j(),s=de(t,n);if(s.kind==="none"){e.actionStatus.textContent="הקורס לא נמצא בתכנית כרגע.",await x(e,n),u(e,!1);return}if(s.kind==="semester"){const r=R(s.semesterIndex,t.semesters[s.semesterIndex]?.id);await De(n,s.semesterIndex),e.actionStatus.textContent=`הקורס הוסר מ${r}.`}else s.kind==="wishlist"?(await Fe(n),e.actionStatus.textContent="הקורס הוסר מרשימת המשאלות."):(await Ie(n),e.actionStatus.textContent="הקורס הוסר מהפטורים.");await x(e,n),u(e,!1)}function u(e,n){e.semesterAddCurrent.disabled=n,e.wishlistAdd.disabled=n,e.exemptionsAdd.disabled=n,e.placementRemove.disabled=n;const t=e.semesterDropdownMenu.querySelectorAll("[data-semester-option]");for(const s of t)s.disabled=n;n&&(e.semesterDropdown.open=!1)}async function j(){const e=await w.userPlan.get(),n=Ge(e?.value),t=Be(n?.semesterCount);return{version:ke,semesterCount:t,currentSemester:L(n?.currentSemester,t),semesters:T($e(n?.semesters),t),wishlistCourseCodes:l(n?.wishlistCourseCodes),exemptionsCourseCodes:l(n?.exemptionsCourseCodes)}}function de(e,n){const t=n.trim().toUpperCase();if(t.length===0)return{kind:"none"};for(const[s,r]of e.semesters.entries())if(l(r.courseCodes).includes(t))return{kind:"semester",semesterIndex:s};return l(e.wishlistCourseCodes).includes(t)?{kind:"wishlist"}:l(e.exemptionsCourseCodes).includes(t)?{kind:"exemptions"}:{kind:"none"}}function T(e,n){const t=e.map(s=>({id:s.id,courseCodes:l(s.courseCodes)}));for(;t.length<n;)t.push({id:void 0,courseCodes:[]});return t}async function b(e){const n=await j();return e(n)?(await w.userPlan.set(n),!0):!1}async function ce(e,n){const t=e.trim().toUpperCase();return t.length===0?!1:b(s=>{const r=L(n,s.semesterCount);s.semesters=T(s.semesters,s.semesterCount);const o=s.semesters[r],a=l(o.courseCodes);return a.includes(t)?!1:(o.courseCodes=[...a,t],!0)})}async function ze(e){const n=e.trim().toUpperCase();return n.length===0?!1:b(t=>{const s=l(t.wishlistCourseCodes);return s.includes(n)?!1:(t.wishlistCourseCodes=[...s,n],!0)})}async function _e(e){const n=e.trim().toUpperCase();return n.length===0?!1:b(t=>{const s=l(t.exemptionsCourseCodes);return s.includes(n)?!1:(t.exemptionsCourseCodes=[...s,n],!0)})}async function De(e,n){const t=e.trim().toUpperCase();return t.length===0?!1:b(s=>{const r=L(n,s.semesterCount);s.semesters=T(s.semesters,s.semesterCount);const o=s.semesters[r],a=l(o.courseCodes),i=a.filter(d=>d!==t);return i.length===a.length?!1:(o.courseCodes=i,!0)})}async function Fe(e){const n=e.trim().toUpperCase();return n.length===0?!1:b(t=>{const s=l(t.wishlistCourseCodes),r=s.filter(o=>o!==n);return r.length===s.length?!1:(t.wishlistCourseCodes=r,!0)})}async function Ie(e){const n=e.trim().toUpperCase();return n.length===0?!1:b(t=>{const s=l(t.exemptionsCourseCodes),r=s.filter(o=>o!==n);return r.length===s.length?!1:(t.exemptionsCourseCodes=r,!0)})}function Ge(e){if(!(typeof e!="object"||e===null))return e}function l(e){if(!Array.isArray(e))return[];const n=new Set;for(const t of e){if(typeof t!="string")continue;const s=t.trim().toUpperCase();s.length!==0&&n.add(s)}return[...n]}function $e(e){return Array.isArray(e)?e.map(n=>{if(typeof n!="object"||n===null)return{courseCodes:[]};const t=n,s=l(t.courseCodes);return{id:typeof t.id=="string"?t.id:void 0,courseCodes:s.length>0?s:Oe(t.courses)}}):[]}function Oe(e){if(!Array.isArray(e))return[];const n=[];for(const t of e){if(typeof t=="string"){n.push(t);continue}if(typeof t!="object"||t===null)continue;const s=t;typeof s.code=="string"&&n.push(s.code)}return l(n)}function Be(e){return typeof e=="number"&&Number.isFinite(e)?Math.max(3,Math.floor(e)):ae}function L(e,n){return typeof e=="number"&&Number.isFinite(e)?Math.max(0,Math.min(n-1,Math.floor(e))):0}function ue(e,n){e.notFoundState.classList.remove("hidden"),e.notFoundMessage.textContent=n,me(e),We(e)}function He(e){e.notFoundState.classList.add("hidden"),me(e)}function me(e,n){v(e.coursePointsCard),v(e.courseMedianCard),v(e.courseFacultyCard),v(e.courseSeasonsCard)}function v(e,n){e.dataset.loading="false"}function pe(e,n){e.classList.remove(...ve)}function We(e){fe(e.dependenciesGrid,e.dependenciesCount,e.dependenciesEmpty,[]),g(e.dependantsGrid,e.dependantsCount,e.dependantsEmpty,[]),g(e.adjacentGrid,e.adjacentCount,e.adjacentEmpty,[]),g(e.exclusiveGrid,e.exclusiveCount,e.exclusiveEmpty,[])}async function ee(e,n){const t=await w.courses.get(n);if(t===void 0){ue(e,`לא נמצא קורס עם הקוד ${n}.`);return}Xe(e,t);const s=Ye(t),r=te(t.connections?.adjacent),o=te(t.connections?.exclusive),[a,i,d,c]=await Promise.all([Ze(n,s),Je(n),M(n,r),M(n,o)]);fe(e.dependenciesGrid,e.dependenciesCount,e.dependenciesEmpty,a),g(e.dependantsGrid,e.dependantsCount,e.dependantsEmpty,i),g(e.adjacentGrid,e.adjacentCount,e.adjacentEmpty,d),g(e.exclusiveGrid,e.exclusiveCount,e.exclusiveEmpty,c),He(e)}function Xe(e,n){e.courseName.textContent=N(n.name)??oe,e.courseAbout.textContent=N(n.about)??"אין תיאור זמין לקורס זה במאגר הנוכחי.",e.coursePoints.textContent=ne(n.points),e.courseMedian.textContent=ne(n.median),e.courseFaculty.textContent=N(n.faculty)??A,e.courseSeasons.textContent=Ve(n.seasons)}function ne(e){return e===void 0||!Number.isFinite(e)?A:e.toString()}function Ve(e){if(!Array.isArray(e)||e.length===0)return A;const n=e.map(t=>Ke(t)).filter(t=>t.length>0);return n.length===0?A:n.join(" · ")}function Ke(e){const n=e.trim().toLowerCase();return n.length===0?"":n==="חורף"||n==="winter"||n==="a"||n==="א"||n==="semester a"?"חורף":n==="אביב"||n==="spring"||n==="b"||n==="ב"||n==="semester b"?"אביב":n==="קיץ"||n==="summer"||n==="c"||n==="ג"||n==="semester c"?"קיץ":e.trim()}function N(e){if(e===void 0)return;const n=e.trim();if(n.length!==0)return n}function Ye(e){const n=e.connections?.dependencies;if(!Array.isArray(n))return[];const t=[];for(const s of n){if(!Array.isArray(s))continue;const r=[];for(const o of s){if(typeof o!="string")continue;const a=o.trim().toUpperCase();a.length!==0&&(r.includes(a)||r.push(a))}r.length>0&&t.push(r)}return t}function te(e){return Array.isArray(e)?e.map(n=>n.trim().toUpperCase()).filter(n=>n.length>0):[]}async function M(e,n){const t=Array.from(new Set(n)).filter(r=>r!==e);return t.length===0?[]:await Promise.all(t.map(async r=>{const o=await w.courses.get(r);return o!==void 0?o:{code:r,name:oe}}))}async function Ze(e,n){return n.length===0?[]:Promise.all(n.map(async t=>M(e,t)))}async function Je(e){const n=e.trim().toUpperCase();if(n.length===0)return[];const t=await w.courses.count();if(t===0)return[];const s=[];for(let r=0;r<t;r+=Q){const o=await w.courses.page(Q,r);if(o.length===0)break;for(const a of o)a.code!==n&&Qe(a,n)&&s.push(a)}return s}function Qe(e,n){const t=e.connections?.dependencies;if(!Array.isArray(t))return!1;for(const s of t)if(Array.isArray(s)){for(const r of s)if(typeof r=="string"&&r.trim().toUpperCase()===n)return!0}return!1}function fe(e,n,t,s){e.replaceChildren(),pe(n);const r=s.length,o=s.reduce((a,i)=>a+i.length,0);if(n.textContent=`${String(r)} חלופות · ${String(o)} קורסים`,r===0||o===0){t.classList.remove("hidden");return}t.classList.add("hidden");for(let a=0;a<s.length;a+=1){const i=s[a]??[];if(i.length===0)continue;const d=document.createElement("section");d.className="flex flex-col gap-3";const c=document.createElement("div");c.className="grid w-fit max-w-full grid-cols-[repeat(auto-fit,minmax(5rem,1fr))] justify-start gap-2 md:grid-cols-[repeat(auto-fit,minmax(7rem,1fr))] lg:grid-cols-[repeat(auto-fit,minmax(9rem,1fr))]";for(const m of i){const p=xe(m);c.append(p)}if(d.append(c),e.append(d),a<s.length-1){const m=document.createElement("div");m.className="flex items-center gap-2 py-1";const p=document.createElement("span");p.className="bg-border/80 h-px flex-1";const C=document.createElement("span");C.className="bg-border/80 h-px flex-1";const h=document.createElement("p");h.className="bg-surface-2 text-text-muted inline-flex w-fit items-center rounded-full px-3 py-1 text-xs",h.textContent="או",m.append(p,h,C),e.append(m)}}}function g(e,n,t,s){if(e.replaceChildren(),pe(n),n.textContent=`${String(s.length)} קורסים`,s.length===0){t.classList.remove("hidden");return}t.classList.add("hidden");for(const r of s)e.append(xe(r))}function xe(e){const n=ge(e),t=document.createElement("a");return t.href=`/course?code=${encodeURIComponent(e.code)}`,t.className="block",t.setAttribute("aria-label",`פתיחת הקורס ${e.code}`),t.append(n),t}const rn={title:"Pages/Course",parameters:{layout:"fullscreen"},argTypes:{courseCode:{control:"text",description:"Course code for /course?code=XXXXXX"}},args:{courseCode:"01040012"}},y={render:e=>(window.history.replaceState(null,"",he(e.courseCode)),ie()),globals:{theme:"light"}},S={render:e=>(window.history.replaceState(null,"",he(e.courseCode)),ie()),globals:{theme:"dark"},parameters:{backgrounds:{default:"dark"}}},E={render:()=>ye(),globals:{theme:"light"}};function he(e){const n=e.trim();return n.length===0?"/course":`/course?code=${encodeURIComponent(n)}`}y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  render: args => {
    window.history.replaceState(null, '', buildCourseUrl(args.courseCode));
    return CoursePage();
  },
  globals: {
    theme: 'light'
  }
}`,...y.parameters?.docs?.source}}};S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  render: args => {
    window.history.replaceState(null, '', buildCourseUrl(args.courseCode));
    return CoursePage();
  },
  globals: {
    theme: 'dark'
  },
  parameters: {
    backgrounds: {
      default: 'dark'
    }
  }
}`,...S.parameters?.docs?.source}}};E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
  render: () => {
    return CoursePageSkeletonPreview();
  },
  globals: {
    theme: 'light'
  }
}`,...E.parameters?.docs?.source}}};const on=["Default","Dark","Skeleton"];export{S as Dark,y as Default,E as Skeleton,on as __namedExportsOrder,rn as default};
