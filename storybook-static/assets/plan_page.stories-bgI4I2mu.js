import { C as T } from './CourseCard-Dyyw2ZpT.js';
import { s as k, g as _, b as B } from './indexeddb-Ba_KKj-k.js';
const O = `<template>
    <section class="text-text min-h-screen w-full" data-page="plan">
        <main
            class="flex min-h-screen w-full flex-col gap-5 px-4 pt-[calc(env(safe-area-inset-top)+1.25rem)] pb-[calc(env(safe-area-inset-bottom)+1.5rem)] sm:px-6 lg:px-8"
        >
            <p class="text-text-muted text-xs">/plan</p>
            <section
                class="border-border/60 from-surface-1/90 to-surface-2/80 flex w-full flex-col gap-4 rounded-3xl border bg-gradient-to-b p-4 shadow-sm sm:p-5"
            >
                <div class="flex flex-wrap items-start justify-between gap-3">
                    <div class="flex flex-col gap-1">
                        <h1 class="text-2xl font-medium sm:text-3xl">
                            מתכנן תואר לפי סמסטרים
                        </h1>
                        <p class="text-text-muted max-w-3xl text-xs sm:text-sm">
                            לחצו על קורס כדי לבחור אותו ואז על סמסטר יעד כדי
                            להעביר. לחיצה נוספת על אותו קורס פותחת את עמוד פרטי
                            הקורס.
                        </p>
                    </div>
                    <a
                        class="border-border/70 bg-surface-1/70 text-text-muted hover:border-accent/50 hover:text-text rounded-full border px-4 py-2 text-xs font-medium transition duration-200 ease-out"
                        href="/"
                    >
                        חזרה לדף הבית
                    </a>
                </div>
                <div class="flex flex-wrap items-center gap-2 sm:gap-3">
                    <p
                        class="border-border/60 bg-surface-1/70 text-text-muted rounded-full border px-3 py-1.5 text-xs"
                        data-selected-status
                    >
                        לא נבחר קורס
                    </p>
                    <button
                        type="button"
                        class="border-border/60 bg-surface-1/70 text-text-muted hover:border-accent/50 hover:text-text rounded-full border px-3 py-1.5 text-xs font-medium transition duration-200 ease-out disabled:cursor-not-allowed disabled:opacity-60"
                        data-clear-selection
                    >
                        נקה בחירה
                    </button>
                    <label
                        class="border-border/60 bg-surface-1/70 text-text-muted flex items-center gap-2 rounded-full border px-3 py-1 text-xs"
                    >
                        <span>מספר סמסטרים</span>
                        <input
                            type="number"
                            min="3"
                            step="1"
                            class="focus-visible:ring-accent/60 bg-surface-2/80 text-text w-16 rounded-lg px-2 py-1 text-xs focus-visible:ring-2"
                            data-semester-count
                        />
                    </label>
                </div>
            </section>

            <section class="-mx-4 flex flex-col gap-4 sm:-mx-6 lg:-mx-8">
                <div
                    class="flex items-center justify-between gap-3 px-4 sm:px-6 lg:px-8"
                >
                    <h2 class="text-lg font-medium">תכנית סמסטרים</h2>
                    <div class="hidden items-center gap-2 md:flex">
                        <button
                            type="button"
                            class="border-border/60 bg-surface-2/80 text-text-muted hover:border-accent/50 hover:text-text rounded-full border px-3 py-1.5 text-xs transition duration-200 ease-out disabled:cursor-not-allowed disabled:opacity-60"
                            aria-controls="semester-rail"
                            data-rail-prev
                        >
                            הקודם
                        </button>
                        <button
                            type="button"
                            class="border-border/60 bg-surface-2/80 text-text-muted hover:border-accent/50 hover:text-text rounded-full border px-3 py-1.5 text-xs transition duration-200 ease-out disabled:cursor-not-allowed disabled:opacity-60"
                            aria-controls="semester-rail"
                            data-rail-next
                        >
                            הבא
                        </button>
                    </div>
                </div>

                <p
                    class="text-warning hidden px-4 text-xs sm:px-6 lg:px-8"
                    role="status"
                    aria-live="polite"
                    data-plan-warning
                ></p>

                <div
                    id="semester-rail"
                    class="flex w-full snap-x snap-mandatory gap-4 overflow-x-auto pb-2 [scrollbar-width:thin]"
                    data-semester-rail
                ></div>

                <section class="flex flex-col gap-2 px-4 sm:px-6 lg:px-8">
                    <div class="flex items-center justify-between gap-2">
                        <h3 class="text-sm font-medium">בעיות תזמון</h3>
                        <span
                            class="text-text-muted text-xs"
                            data-problems-count
                            >0</span
                        >
                    </div>
                    <ul
                        class="text-text-muted flex list-disc flex-col gap-1 ps-5 text-xs"
                        data-schedule-problems
                    >
                        <li>לא זוהו בעיות כרגע.</li>
                    </ul>
                </section>
            </section>
        </main>
    </section>
</template>
`,
    M = 'planPageState',
    N = 1,
    h = 3,
    F = 6,
    S = ['אביב', 'קיץ', 'חורף'],
    D = { אביב: 'אביב', קיץ: 'קיץ', חורף: 'חורף' },
    j = [
        {
            code: '104031',
            name: 'חשבון אינפיניטסימלי 1',
            points: 5,
            median: 78,
            seasons: ['חורף', 'אביב'],
            tests: [{ year: 2025, monthIndex: 1, day: 15 }],
        },
        {
            code: '104166',
            name: 'אלגברה לינארית 1',
            points: 5,
            median: 74,
            seasons: ['חורף', 'אביב'],
            tests: [{ year: 2025, monthIndex: 5, day: 20 }],
        },
        {
            code: '234114',
            name: 'מבוא למדעי המחשב',
            points: 4,
            median: 81,
            seasons: ['אביב', 'קיץ'],
            tests: [null],
        },
        {
            code: '234124',
            name: 'מבני נתונים',
            points: 4,
            median: 76,
            seasons: ['חורף', 'אביב'],
            tests: [{ year: 2025, monthIndex: 8, day: 3 }],
        },
        {
            code: '044252',
            name: 'מערכות ספרתיות',
            points: 3,
            median: 79,
            seasons: ['חורף'],
            tests: [{ year: 2025, monthIndex: 11, day: 10 }],
        },
        {
            code: '236363',
            name: 'מערכות הפעלה',
            points: 3,
            median: 82,
            seasons: ['אביב'],
            tests: [{ year: 2025, monthIndex: 7, day: 27 }],
        },
        {
            code: '236360',
            name: 'תורת הקומפילציה',
            points: 3,
            median: 75,
            seasons: ['חורף'],
            tests: [null],
        },
        {
            code: '236350',
            name: 'בסיסי נתונים',
            points: 3,
            median: 84,
            seasons: ['אביב', 'קיץ'],
            tests: [{ year: 2024, monthIndex: 6, day: 19 }],
        },
        {
            code: '236501',
            name: 'מבוא לבינה מלאכותית',
            points: 3,
            median: 87,
            seasons: ['אביב'],
            tests: [{ year: 2024, monthIndex: 5, day: 8 }],
        },
        {
            code: '236299',
            name: 'פרויקט תכנה',
            points: 2,
            median: 90,
            seasons: ['קיץ'],
            tests: [null],
        },
    ];
function z() {
    const e = F;
    return {
        semesterCount: e,
        semesters: b(e).map((n) => ({ ...n, courses: [] })),
        problems: [],
    };
}
function b(e) {
    const n = Math.max(h, Math.floor(e)),
        t = 2026,
        s = [];
    for (let o = 0; o < n; o += 1) {
        const r = S[o % S.length],
            a = Math.floor((o + 1) / S.length),
            d = t + a;
        s.push({
            id: `${r}-${d}-${o}`,
            title: `${D[r]} ${d}`,
            season: r,
            year: d,
        });
    }
    return s;
}
function L() {
    const e = document.createElement('template');
    e.innerHTML = O;
    const n = e.content.firstElementChild;
    if (!(n instanceof HTMLTemplateElement))
        throw new Error('PlanPage template element not found');
    const t = n.content.firstElementChild?.cloneNode(!0);
    if (!(t instanceof HTMLElement))
        throw new Error('PlanPage template root not found');
    const s = t.querySelector('[data-semester-rail]'),
        o = t.querySelector('[data-selected-status]'),
        r = t.querySelector('[data-clear-selection]'),
        a = t.querySelector('[data-plan-warning]'),
        d = t.querySelector('[data-schedule-problems]'),
        i = t.querySelector('[data-problems-count]'),
        c = t.querySelector('[data-semester-count]'),
        u = t.querySelector('[data-rail-prev]'),
        f = t.querySelector('[data-rail-next]');
    if (
        s === null ||
        o === null ||
        r === null ||
        a === null ||
        d === null ||
        i === null ||
        c === null ||
        u === null ||
        f === null
    )
        throw new Error('PlanPage required elements not found');
    const l = z();
    return (
        (c.value = l.semesterCount.toString()),
        r.addEventListener('click', () => {
            ((l.selected = void 0), p(l, s, o, r, a, d, i, c));
        }),
        c.addEventListener('change', () => {
            const m = $(c.value);
            ((c.value = m.toString()),
                G(l, m),
                q(l),
                p(l, s, o, r, a, d, i, c));
        }),
        s.addEventListener('click', (m) => {
            const v = m.target;
            if (!(v instanceof Element)) return;
            const y = v.closest('[data-course-action]');
            if (y !== null) {
                const I = y.dataset.semesterId,
                    P = y.dataset.courseCode;
                if (I === void 0 || P === void 0) return;
                te(l, I, P, s, o, r, a, d, i, c);
                return;
            }
            const E = v.closest('[data-semester-column]')?.dataset.semesterId;
            E !== void 0 && ne(l, E, s, o, r, a, d, i, c);
        }),
        ie(s, u, f),
        p(l, s, o, r, a, d, i, c),
        H(l, s, o, r, a, d, i, c),
        t
    );
}
async function H(e, n, t, s, o, r, a, d) {
    const [i, c] = await Promise.all([
            _(M).catch(() => {}),
            B(18).catch(() => []),
        ]),
        u = re(c.length > 0 ? c : j),
        f = ae(u),
        l = ce(i?.value, f);
    l !== void 0
        ? ((e.semesterCount = l.length), (e.semesters = l))
        : (e.semesters = oe(u, e.semesterCount));
    const m = de(e.semesters);
    (m !== void 0 && (e.warning = m), p(e, n, t, s, o, r, a, d));
}
function p(e, n, t, s, o, r, a, d) {
    ((t.textContent = ee(e)),
        (s.disabled = e.selected === void 0),
        (d.value = e.semesterCount.toString()),
        e.warning !== void 0 && e.warning.length > 0
            ? ((o.textContent = e.warning), o.classList.remove('hidden'))
            : ((o.textContent = ''), o.classList.add('hidden')),
        (e.problems = Q(e)),
        J(e.problems, r, a),
        n.replaceChildren());
    for (const i of e.semesters) {
        const c = U(e, i);
        n.append(c);
    }
    w(n);
}
function U(e, n) {
    const t = document.createElement('section');
    ((t.className =
        'flex h-[100svh] w-[min(92vw,28rem)] shrink-0 snap-start flex-col gap-3 px-1 md:w-[calc((100vw-2rem)/2)] lg:w-[calc((100vw-3rem)/3)]'),
        (t.dataset.semesterColumn = 'true'),
        (t.dataset.semesterId = n.id));
    const s = document.createElement('header');
    s.className = 'flex flex-wrap items-center gap-x-3 gap-y-2';
    const o = document.createElement('p');
    ((o.className = 'text-sm font-medium whitespace-nowrap'),
        (o.textContent = n.title));
    const r = document.createElement('div');
    r.className =
        'text-text-muted flex flex-wrap items-center gap-x-3 gap-y-1 text-xs';
    const a = W(n.courses);
    if (
        (r.append(C('נק״ז', a.totalPoints)),
        r.append(C('חציון', a.avgMedian)),
        r.append(C('מבחנים', a.testsCount)),
        s.append(o, r),
        e.selected !== void 0 && e.selected.semesterId !== n.id)
    ) {
        const c = document.createElement('p');
        ((c.className =
            'border-accent/40 bg-accent/10 text-accent rounded-xl border px-2 py-1 text-xs'),
            (c.textContent = 'לחצו כאן להעברת הקורס הנבחר'),
            s.append(c));
    }
    const i = document.createElement('div');
    if (
        ((i.className =
            'flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto pe-1'),
        n.courses.length === 0)
    ) {
        const c = document.createElement('p');
        ((c.className =
            'border-border/50 bg-surface-1/60 text-text-muted rounded-xl border border-dashed px-3 py-4 text-xs'),
            (c.textContent =
                'אין קורסים בסמסטר זה. אפשר ללחוץ כדי להעביר לכאן.'),
            i.append(c));
    }
    for (const c of n.courses) i.append(V(e, n, c));
    return (t.append(s, i), t);
}
function V(e, n, t) {
    const s = document.createElement('button');
    ((s.type = 'button'),
        (s.className =
            'focus-visible:ring-accent/60 w-full rounded-2xl text-start transition duration-200 ease-out focus-visible:ring-2'),
        (s.dataset.courseAction = 'true'),
        (s.dataset.courseCode = t.code),
        (s.dataset.semesterId = n.id),
        e.selected?.courseCode === t.code &&
            e.selected.semesterId === n.id &&
            s.classList.add('ring-accent/50', 'ring-2'));
    const r = T(t, { statusClass: Y(n.season) }),
        a = r.querySelector('[data-component="CourseCard"]');
    return (
        a !== null && a.classList.add('hover:border-accent/40'),
        s.append(r),
        s
    );
}
function C(e, n) {
    const t = document.createElement('p');
    return (
        (t.className = 'text-text-muted rounded-xl px-1 py-1'),
        (t.textContent = `${e}: ${n}`),
        t
    );
}
function W(e) {
    let n = 0,
        t = 0,
        s = 0,
        o = 0;
    for (const r of e)
        (typeof r.points == 'number' &&
            Number.isFinite(r.points) &&
            (n += r.points),
            typeof r.median == 'number' &&
                Number.isFinite(r.median) &&
                ((t += r.median), (s += 1)),
            Array.isArray(r.tests) &&
                r.tests.some((a) => a !== null) &&
                (o += 1));
    return {
        totalPoints: n.toString(),
        avgMedian: s > 0 ? (t / s).toFixed(1) : '—',
        testsCount: o.toString(),
    };
}
function Y(e) {
    return e === 'חורף'
        ? 'bg-info'
        : e === 'אביב'
          ? 'bg-success'
          : 'bg-warning';
}
function K(e, n) {
    if (
        !(!Array.isArray(e.seasons) || e.seasons.length === 0) &&
        !e.seasons.includes(n)
    )
        return 'הקורס לרוב לא נפתח בעונה זו';
}
function $(e) {
    const n = Number.parseInt(e, 10);
    return Number.isNaN(n) ? h : Math.max(h, n);
}
function G(e, n) {
    const t = Math.max(h, Math.floor(n));
    if (t === e.semesterCount) return;
    const o = b(t).map((a) => ({ ...a, courses: [] }));
    e.semesters.forEach((a, d) => {
        const i = Math.min(d, o.length - 1);
        o[i].courses.push(...a.courses);
    });
    const r = e.selected?.courseCode;
    if (((e.semesterCount = t), (e.semesters = o), r !== void 0)) {
        const a = o.find((d) => d.courses.some((i) => i.code === r));
        a !== void 0
            ? (e.selected = { semesterId: a.id, courseCode: r })
            : (e.selected = void 0);
    }
}
function J(e, n, t) {
    if (
        ((t.textContent = e.length.toString()),
        n.replaceChildren(),
        e.length === 0)
    ) {
        const s = document.createElement('li');
        ((s.textContent = 'לא זוהו בעיות כרגע.'), n.append(s));
        return;
    }
    for (const s of e) {
        const o = document.createElement('li');
        ((o.className = 'text-warning'), (o.textContent = s), n.append(o));
    }
}
function Q(e) {
    const n = [],
        t = new Set(),
        s = new Set();
    for (const o of e.semesters) for (const r of o.courses) t.add(r.code);
    for (const o of e.semesters) {
        for (const r of o.courses) {
            const a = K(r, o.season);
            a !== void 0 && n.push(`${r.code}: ${a} (${o.title})`);
            const d = X(r, s);
            d !== void 0 && n.push(`${r.code}: ${d} (${o.title})`);
            const i = Z(r, t);
            i !== void 0 && n.push(`${r.code}: ${i} (${o.title})`);
        }
        for (const r of o.courses) s.add(r.code);
    }
    return Array.from(new Set(n));
}
function X(e, n) {
    const t = e.connections?.dependencies;
    if (!Array.isArray(t) || t.length === 0) return;
    const s = t
        .filter((a) => Array.isArray(a) && a.length > 0)
        .map((a) => a.filter((d) => typeof d == 'string'));
    if (s.length === 0 || s.some((a) => a.every((d) => n.has(d)))) return;
    const r = s[0].filter((a) => !n.has(a));
    return r.length === 0
        ? 'דרישות קדם אינן מסופקות'
        : `דרישות קדם חסרות: ${r.join(', ')}`;
}
function Z(e, n) {
    const t = e.connections?.exclusive;
    if (!Array.isArray(t) || t.length === 0) return;
    const s = t.filter((o) => n.has(o));
    if (s.length !== 0) return `חפיפה לקורסים הדדיים: ${s.join(', ')}`;
}
function ee(e) {
    if (e.selected === void 0) return 'לא נבחר קורס';
    const n = e.semesters.find((o) => o.id === e.selected?.semesterId),
        t = n?.courses.find((o) => o.code === e.selected?.courseCode);
    return n === void 0 || t === void 0
        ? 'לא נבחר קורס'
        : `נבחר: ${t.name ?? t.code} (${n.title})`;
}
function te(e, n, t, s, o, r, a, d, i, c) {
    if (e.selected?.semesterId === n && e.selected.courseCode === t) {
        se(t);
        return;
    }
    ((e.selected = { semesterId: n, courseCode: t }),
        p(e, s, o, r, a, d, i, c));
}
async function ne(e, n, t, s, o, r, a, d, i) {
    if (e.selected === void 0) return;
    const c = e.semesters.find((m) => m.id === e.selected?.semesterId),
        u = e.semesters.find((m) => m.id === n);
    if (c === void 0 || u === void 0 || c.id === u.id) return;
    const f = c.courses.findIndex((m) => m.code === e.selected?.courseCode);
    if (f < 0) return;
    const [l] = c.courses.splice(f, 1);
    (u.courses.push(l),
        (e.selected = void 0),
        (e.warning = void 0),
        await q(e),
        p(e, t, s, o, r, a, d, i));
}
function se(e) {
    const n = new URL('/course', window.location.origin);
    (n.searchParams.set('code', e),
        window.history.pushState(null, '', n),
        window.dispatchEvent(new PopStateEvent('popstate')));
}
function oe(e, n) {
    const t = b(n).map((s) => ({ ...s, courses: [] }));
    return (
        e.forEach((s, o) => {
            const r = o % t.length;
            t[r].courses.push(s);
        }),
        t
    );
}
function re(e) {
    const n = [],
        t = new Set();
    for (const s of e) t.has(s.code) || (t.add(s.code), n.push(s));
    return n;
}
function ae(e) {
    const n = new Map();
    for (const t of e) n.set(t.code, t);
    return n;
}
function ce(e, n) {
    if (typeof e != 'object' || e === null) return;
    const t = e;
    if (t.version !== N || !Array.isArray(t.semesters)) return;
    const s = $(String(t.semesterCount ?? t.semesters.length)),
        o = b(s).map((r) => ({ ...r, courses: [] }));
    return (
        t.semesters.forEach((r, a) => {
            const d = o.find((c) => c.id === r.id) ?? o[a];
            if (d === void 0) return;
            const i = Array.isArray(r.courseCodes) ? r.courseCodes : [];
            for (const c of i) {
                const u = n.get(c);
                u !== void 0 && d.courses.push(u);
            }
        }),
        o
    );
}
function de(e) {
    const n = new Set();
    let t = 0;
    for (const s of e)
        s.courses = s.courses.filter((o) =>
            n.has(o.code) ? ((t += 1), !1) : (n.add(o.code), !0)
        );
    if (t !== 0)
        return `זוהו ${String(t)} כפילויות בתכנית והן אוחדו למיקום יחיד.`;
}
async function q(e) {
    const n = {
        version: N,
        semesterCount: e.semesterCount,
        semesters: e.semesters.map((t) => ({
            id: t.id,
            courseCodes: t.courses.map((s) => s.code),
        })),
    };
    await k({ key: M, value: n }).catch(() => {});
}
function ie(e, n, t) {
    (n.addEventListener('click', () => {
        A(e, 'prev');
    }),
        t.addEventListener('click', () => {
            A(e, 'next');
        }),
        e.addEventListener('scroll', () => {
            w(e);
        }),
        window.addEventListener('resize', () => {
            w(e);
        }));
}
function w(e) {
    const n = document.querySelector('[data-rail-prev]'),
        t = document.querySelector('[data-rail-next]');
    if (n === null || t === null) return;
    const s = Array.from(e.querySelectorAll('[data-semester-column]'));
    if (!(e.scrollWidth > e.clientWidth + 2) || s.length <= 1) {
        ((n.disabled = !0), (t.disabled = !0));
        return;
    }
    const r = R(e, s);
    ((n.disabled = r <= 0), (t.disabled = r >= s.length - 1));
}
function A(e, n) {
    const t = Array.from(e.querySelectorAll('[data-semester-column]'));
    if (t.length === 0) return;
    const s = R(e, t),
        o = n === 'next' ? 1 : -1,
        r = Math.min(t.length - 1, Math.max(0, s + o));
    t[r].scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'start',
    });
}
function R(e, n) {
    const t = e.getBoundingClientRect(),
        s = getComputedStyle(e).direction === 'rtl';
    let o = 0,
        r = Number.POSITIVE_INFINITY;
    return (
        n.forEach((a, d) => {
            const i = a.getBoundingClientRect(),
                c = Math.abs(s ? i.right - t.right : i.left - t.left);
            c < r && ((r = c), (o = d));
        }),
        o
    );
}
const fe = { title: 'Pages/Plan', parameters: { layout: 'fullscreen' } },
    x = { render: () => L(), globals: { theme: 'light' } },
    g = {
        render: () => L(),
        globals: { theme: 'dark' },
        parameters: { backgrounds: { default: 'dark' } },
    };
x.parameters = {
    ...x.parameters,
    docs: {
        ...x.parameters?.docs,
        source: {
            originalSource: `{
  render: () => PlanPage(),
  globals: {
    theme: 'light'
  }
}`,
            ...x.parameters?.docs?.source,
        },
    },
};
g.parameters = {
    ...g.parameters,
    docs: {
        ...g.parameters?.docs,
        source: {
            originalSource: `{
  render: () => PlanPage(),
  globals: {
    theme: 'dark'
  },
  parameters: {
    backgrounds: {
      default: 'dark'
    }
  }
}`,
            ...g.parameters?.docs?.source,
        },
    },
};
const pe = ['Default', 'Dark'];
export { g as Dark, x as Default, pe as __namedExportsOrder, fe as default };
