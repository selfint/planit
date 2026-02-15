import {
    s as p,
    g,
    r as F,
    c as G,
    d as H,
    e as Q,
} from './indexeddb-Ba_KKj-k.js';
function R(e) {
    return e?.nested === void 0 ? [] : e.nested.filter((t) => z(t));
}
function V(e) {
    return R(e)
        .map((t) => {
            const n = q(t);
            if (n !== void 0) return { id: n, label: O(t, n), node: t };
        })
        .filter((t) => t !== void 0);
}
function Y(e, t) {
    if (e.nested === void 0) return e;
    const n = R(e);
    if (n.length === 0 || t === void 0) return e;
    const a = n.find((i) => q(i) === t);
    if (a === void 0) return e;
    const o = e.nested.filter((i) => B(i)),
        r = Array.isArray(a.nested) ? a.nested : [];
    return { ...e, nested: [...r, ...o] };
}
function K(e) {
    if (e === void 0) return 0;
    const t = new Set();
    return (P(e, t), t.size);
}
function O(e, t) {
    return typeof e.he == 'string' && e.he.length > 0
        ? e.he
        : typeof e.en == 'string' && e.en.length > 0
          ? e.en
          : t;
}
function q(e) {
    if (typeof e.name == 'string' && e.name.length > 0) return e.name;
    if (typeof e.en == 'string' && e.en.length > 0) return e.en;
}
function P(e, t) {
    if (Array.isArray(e.courses))
        for (const n of e.courses)
            typeof n == 'string' && n.length > 0 && t.add(n);
    if (Array.isArray(e.nested)) for (const n of e.nested) P(n, t);
}
function z(e) {
    return typeof e.en != 'string' ? !1 : e.en.toLowerCase().includes('path');
}
function B(e) {
    return typeof e.en != 'string'
        ? !1
        : e.en.toLowerCase().includes('elective');
}
const h = {
    activeCatalogId: 'requirementsActiveCatalogId',
    activeFacultyId: 'requirementsActiveFacultyId',
    activeProgramId: 'requirementsActiveProgramId',
    activePath: 'requirementsActivePath',
    lastSync: 'requirementsLastSync',
};
function W() {
    return 'onLine' in navigator ? navigator.onLine : !0;
}
function J(e) {
    return `https://raw.githubusercontent.com/selfint/degree-planner/main/static/_catalogs/${e.catalogId}/${e.facultyId}/${e.programId}/requirementsData.json`;
}
async function X() {
    const [e, t, n, a] = await Promise.all([
            g(h.activeCatalogId),
            g(h.activeFacultyId),
            g(h.activeProgramId),
            g(h.activePath),
        ]),
        o = typeof e?.value == 'string' ? e.value : void 0,
        r = typeof t?.value == 'string' ? t.value : void 0,
        i = typeof n?.value == 'string' ? n.value : void 0,
        s = typeof a?.value == 'string' ? a.value : void 0;
    if (
        !(
            o === void 0 ||
            o.length === 0 ||
            r === void 0 ||
            r.length === 0 ||
            i === void 0 ||
            i.length === 0
        )
    )
        return {
            catalogId: o,
            facultyId: r,
            programId: i,
            path: typeof s == 'string' && s.length > 0 ? s : void 0,
        };
}
async function y(e) {
    await p({ key: h.activePath, value: e ?? '' });
}
async function Z(e) {
    if (!W()) return { status: 'offline' };
    const t = await g(h.activeProgramId),
        n = typeof t?.value == 'string' ? t.value : void 0,
        a = await fetch(J(e));
    if (!a.ok)
        return {
            status: 'failed',
            error: `שגיאה בטעינת דרישות (${String(a.status)})`,
        };
    const o = await a.json();
    return (
        await F(
            {
                catalogId: e.catalogId,
                facultyId: e.facultyId,
                programId: e.programId,
                path: e.path,
                data: o,
            },
            n
        ),
        await p({ key: h.lastSync, value: new Date().toISOString() }),
        { status: 'updated' }
    );
}
const ee =
        'https://raw.githubusercontent.com/selfint/degree-planner/main/static/catalogs.json',
    d = {
        etag: 'catalogsDataEtag',
        lastModified: 'catalogsDataLastModified',
        lastSync: 'catalogsDataLastSync',
        count: 'catalogsDataCount',
        remoteUpdatedAt: 'catalogsDataRemoteUpdatedAt',
        lastChecked: 'catalogsDataLastChecked',
    };
function M() {
    return 'onLine' in navigator ? navigator.onLine : !0;
}
async function te() {
    const [e, t] = await Promise.all([g(d.etag), g(d.lastModified)]),
        n = new Headers(),
        a = typeof e?.value == 'string' ? e.value : void 0,
        o = typeof t?.value == 'string' ? t.value : void 0;
    return (
        a !== void 0 && a.length > 0 && n.set('If-None-Match', a),
        o !== void 0 && o.length > 0 && n.set('If-Modified-Since', o),
        fetch(ee, { headers: n })
    );
}
async function ne() {
    const e = await fetch(
        'https://api.github.com/repos/selfint/degree-planner/commits?path=static/catalogs.json&per_page=1',
        { headers: { Accept: 'application/vnd.github+json' } }
    );
    if (!e.ok)
        throw new Error(
            `Failed to fetch remote update metadata: ${String(e.status)} ${e.statusText}`
        );
    const n = (await e.json())[0]?.commit?.committer?.date;
    if (typeof n == 'string' && n.length > 0) return n;
}
async function ae(e) {
    const [t, n] = await Promise.all([g(d.remoteUpdatedAt), g(d.lastSync)]),
        a = typeof t?.value == 'string' ? t.value : void 0;
    return e === void 0 || a === void 0 || a.length === 0 || a !== e
        ? !0
        : n?.value === void 0;
}
async function oe() {
    if (!M()) return { status: 'offline' };
    let e;
    try {
        e = await ne();
    } catch (i) {
        console.error('Failed to fetch remote catalog metadata', i);
    }
    if (
        (e !== void 0 &&
            (await p({ key: d.remoteUpdatedAt, value: e }),
            await p({ key: d.lastChecked, value: new Date().toISOString() })),
        !(await ae(e)))
    )
        return { status: 'skipped' };
    const t = await te();
    if (t.status === 304)
        return (
            await p({ key: d.lastSync, value: new Date().toISOString() }),
            { status: 'skipped' }
        );
    if (!t.ok)
        throw new Error(
            `Failed to fetch catalog data: ${String(t.status)} ${t.statusText}`
        );
    const n = await t.json(),
        a = Object.keys(n).length;
    await G(n);
    const o = t.headers.get('etag'),
        r = t.headers.get('last-modified');
    return (
        await Promise.all([
            o !== null && o.length > 0
                ? p({ key: d.etag, value: o })
                : Promise.resolve(),
            r !== null && r.length > 0
                ? p({ key: d.lastModified, value: r })
                : Promise.resolve(),
            p({ key: d.lastSync, value: new Date().toISOString() }),
            p({ key: d.count, value: a }),
            e !== void 0
                ? p({ key: d.remoteUpdatedAt, value: e })
                : Promise.resolve(),
        ]),
        { status: 'updated', count: a }
    );
}
function re(e) {
    async function t() {
        try {
            const a = await oe();
            e?.onSync?.(a);
        } catch (a) {
            (console.error('Catalog sync failed', a), e?.onError?.(a));
        }
    }
    function n() {
        t();
    }
    (window.addEventListener('online', n), M() && t());
}
const ie = `<template>
    <section
        class="border-border/60 bg-surface-1/80 flex flex-col gap-4 rounded-3xl border p-5 shadow-sm"
        data-component="DegreePicker"
    >
        <div class="flex flex-col gap-1">
            <p class="text-text-muted text-xs">בחירת תואר</p>
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
        <div class="border-border/60 bg-surface-2/70 rounded-2xl border p-3">
            <p class="text-text-muted mb-2 text-xs">דרישות במסלול</p>
            <div class="border-border/50 overflow-hidden rounded-2xl border">
                <table class="w-full text-xs">
                    <thead class="bg-surface-1/60 text-text-muted">
                        <tr>
                            <th class="px-3 py-2 text-start font-medium">
                                דרישה
                            </th>
                            <th class="px-3 py-2 text-start font-medium">
                                סה״כ קורסים
                            </th>
                        </tr>
                    </thead>
                    <tbody
                        class="divide-border/40 divide-y"
                        data-requirement-rows
                    >
                        <tr>
                            <td class="text-text px-3 py-2" colspan="2">
                                בחר תכנית ומסלול כדי לראות דרישות.
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
        <p class="text-text-muted text-xs" data-degree-status></p>
    </section>
</template>
`,
    k = 'לתכנית זו אין מסלולים לבחירה.',
    L = 'בחר תכנית ומסלול כדי לראות דרישות.',
    T = 'לא נמצאו דרישות לתכנית זו.',
    I = 'בחר מסלול כדי להציג דרישות.',
    se = 'אין דרישות במסלול זה.';
function ge() {
    const e = document.createElement('template');
    e.innerHTML = ie;
    const t = e.content.firstElementChild;
    if (!(t instanceof HTMLTemplateElement))
        throw new Error('DegreePicker template element not found');
    const n = t.content.firstElementChild?.cloneNode(!0);
    if (!(n instanceof HTMLElement))
        throw new Error('DegreePicker template root not found');
    const a = n.querySelector('[data-degree-catalog]'),
        o = n.querySelector('[data-degree-faculty]'),
        r = n.querySelector('[data-degree-program]'),
        i = n.querySelector('[data-degree-path]'),
        s = n.querySelector('[data-path-empty]'),
        c = n.querySelector('[data-degree-status]'),
        u = n.querySelector('[data-requirement-rows]');
    if (
        a === null ||
        o === null ||
        r === null ||
        i === null ||
        s === null ||
        c === null ||
        u === null
    )
        throw new Error('DegreePicker required elements not found');
    const l = {
        catalogs: {},
        selection: void 0,
        requirement: void 0,
        pathOptions: [],
    };
    return (
        a.addEventListener('change', () => {
            const m = a.value;
            if (m.length === 0) {
                ((l.selection = void 0),
                    (l.requirement = void 0),
                    (l.pathOptions = []),
                    y(void 0),
                    D(l, a, o, r),
                    b(i, s, u),
                    f(c, 'בחר קטלוג כדי להמשיך.'));
                return;
            }
            ((l.selection = {
                catalogId: m,
                facultyId: '',
                programId: '',
                path: void 0,
            }),
                (l.requirement = void 0),
                (l.pathOptions = []),
                y(void 0),
                _(l, o, r),
                w(l, r),
                b(i, s, u),
                f(c, 'בחר פקולטה כדי להמשיך.'));
        }),
        o.addEventListener('change', () => {
            l.selection !== void 0 &&
                ((l.selection = {
                    ...l.selection,
                    facultyId: o.value,
                    programId: '',
                    path: void 0,
                }),
                (l.requirement = void 0),
                (l.pathOptions = []),
                y(void 0),
                w(l, r),
                b(i, s, u),
                f(c, 'בחר תכנית כדי לטעון דרישות.'));
        }),
        r.addEventListener('change', () => {
            if (l.selection === void 0) return;
            const m = r.value;
            m.length !== 0 &&
                ((l.selection = { ...l.selection, programId: m, path: void 0 }),
                (l.requirement = void 0),
                (l.pathOptions = []),
                y(void 0),
                le(l, r, i, s, u, c));
        }),
        i.addEventListener('change', () => {
            if (l.selection === void 0) return;
            const m = i.value;
            ((l.selection = {
                ...l.selection,
                path: m.length > 0 ? m : void 0,
            }),
                y(l.selection.path),
                N(l, u, l.selection.path),
                l.selection.path === void 0 &&
                    l.pathOptions.length > 0 &&
                    f(c, I));
        }),
        re({
            onSync: () => {
                S(l, a, o, r, i, s, u, c);
            },
        }),
        S(l, a, o, r, i, s, u, c),
        n
    );
}
async function S(e, t, n, a, o, r, i, s) {
    e.catalogs = await H();
    const c = await X();
    (c !== void 0 &&
        (e.selection = {
            catalogId: c.catalogId,
            facultyId: c.facultyId,
            programId: c.programId,
            path: c.path,
        }),
        D(e, t, n, a));
    const u = e.selection?.programId;
    u !== void 0 && u.length > 0
        ? await j(e, o, r, i, s)
        : (b(o, r, i),
          f(
              s,
              Object.keys(e.catalogs).length === 0
                  ? 'אין קטלוגים זמינים אופליין.'
                  : 'בחר תכנית כדי לטעון דרישות.'
          ));
}
function D(e, t, n, a) {
    const o = Object.keys(e.catalogs).sort();
    if (
        (v(
            t,
            o.map((r) => ({ id: r, label: A(e.catalogs[r], r) })),
            'בחר קטלוג'
        ),
        e.selection !== void 0 && (t.value = e.selection.catalogId),
        t.value.length === 0)
    ) {
        ((n.disabled = !0),
            (a.disabled = !0),
            v(n, [], 'בחר פקולטה'),
            v(a, [], 'בחר תכנית'));
        return;
    }
    (_(e, n, a), w(e, a));
}
function _(e, t, n) {
    const a = e.selection?.catalogId ?? '',
        o = E(e.catalogs[a]),
        i = (o !== void 0 ? Object.keys(o).filter((s) => !$(s)) : []).map(
            (s) => ({ id: s, label: A(o?.[s], s) })
        );
    (v(t, i, 'בחר פקולטה'),
        (t.disabled = i.length === 0),
        e.selection !== void 0 && (t.value = e.selection.facultyId),
        (n.disabled = !0),
        v(n, [], 'בחר תכנית'));
}
function w(e, t) {
    const n = e.selection?.catalogId ?? '',
        a = e.selection?.facultyId ?? '',
        o = E(e.catalogs[n]),
        r = o !== void 0 ? E(o[a]) : void 0,
        s = (r !== void 0 ? Object.keys(r).filter((c) => !$(c)) : []).map(
            (c) => ({ id: c, label: A(r?.[c], c) })
        );
    (v(t, s, 'בחר תכנית'),
        (t.disabled = s.length === 0),
        e.selection !== void 0 && (t.value = e.selection.programId));
}
async function le(e, t, n, a, o, r) {
    if (e.selection === void 0) return;
    const i = e.selection;
    ((t.disabled = !0), f(r, 'טוען דרישות...'));
    const s = await Z(i);
    if (
        ((t.disabled = !1),
        await j(e, n, a, o, r),
        !(e.pathOptions.length > 0 && e.selection.path === void 0))
    ) {
        if (s.status === 'updated') {
            f(r, 'הדרישות נטענו ונשמרו אופליין.');
            return;
        }
        if (s.status === 'offline') {
            f(r, 'אין חיבור לרשת. הדרישות הקודמות נשמרות.');
            return;
        }
        f(r, s.error ?? 'שגיאה בטעינת דרישות.');
    }
}
async function j(e, t, n, a, o) {
    const r = e.selection?.programId ?? '';
    if (r.length === 0) {
        b(t, n, a);
        return;
    }
    const i = await Q(r);
    e.requirement = fe(i?.data);
    const s = V(e.requirement);
    ((e.pathOptions = s), ce(e, t, n));
    const c = e.selection?.path;
    if (s.length > 0 && c === void 0) {
        (x(a, I), f(o, I));
        return;
    }
    (N(e, a, c), e.requirement === void 0 && f(o, T));
}
function ce(e, t, n) {
    const a = e.pathOptions;
    if (a.length === 0) {
        ((t.required = !1),
            (t.disabled = !0),
            v(t, [], k),
            (n.textContent = ''),
            n.classList.add('hidden'),
            e.selection !== void 0 &&
                (e.selection = { ...e.selection, path: void 0 }),
            y(void 0));
        return;
    }
    if (
        ((t.disabled = !1),
        (t.required = !0),
        (n.textContent = ''),
        n.classList.add('hidden'),
        v(
            t,
            a.map((o) => ({ id: o.id, label: o.label })),
            'בחר מסלול'
        ),
        e.selection?.path !== void 0 &&
            a.some((r) => r.id === e.selection?.path))
    ) {
        t.value = e.selection.path;
        return;
    }
    ((t.value = ''),
        e.selection !== void 0 &&
            (e.selection = { ...e.selection, path: void 0 }));
}
function N(e, t, n) {
    if ((t.replaceChildren(), e.pathOptions.length > 0 && n === void 0)) {
        x(t, I);
        return;
    }
    const a = e.requirement;
    if (a === void 0) {
        x(t, T);
        return;
    }
    const o = Y(a, n),
        r = Array.isArray(o.nested) ? o.nested : [],
        i = ue(r);
    if (i.length === 0) {
        x(t, n !== void 0 ? se : L);
        return;
    }
    for (const s of i) t.append(de(s));
}
function x(e, t) {
    e.replaceChildren();
    const n = document.createElement('tr'),
        a = document.createElement('td');
    ((a.className = 'text-text px-3 py-2'),
        (a.colSpan = 2),
        (a.textContent = t),
        n.append(a),
        e.append(n));
}
function de(e) {
    const t = document.createElement('tr'),
        n = e.path,
        a = e.count;
    return (
        t.append(C(n, 'text-start')),
        t.append(C(a.toString(), 'text-start')),
        t
    );
}
function C(e, t) {
    const n = document.createElement('td');
    return (
        (n.className =
            t.length > 0 ? `text-text px-3 py-2 ${t}` : 'text-text px-3 py-2'),
        (n.textContent = e),
        n
    );
}
function ue(e) {
    const t = [];
    for (const n of e) U(n, [], t);
    return t;
}
function U(e, t, n) {
    const a = q(e) ?? '—',
        o = O(e, a),
        r = [...t, o].join(' ');
    if (
        (Array.isArray(e.courses) &&
            e.courses.length > 0 &&
            n.push({ path: r, count: K(e) }),
        Array.isArray(e.nested))
    )
        for (const s of e.nested) U(s, [...t, o], n);
}
function b(e, t, n) {
    ((e.required = !1),
        (e.disabled = !0),
        v(e, [], k),
        (t.textContent = ''),
        t.classList.add('hidden'),
        x(n, L));
}
function v(e, t, n) {
    e.replaceChildren();
    const a = document.createElement('option');
    ((a.value = ''), (a.textContent = n), e.append(a));
    for (const o of t) {
        const r = document.createElement('option');
        ((r.value = o.id), (r.textContent = o.label), e.append(r));
    }
}
function E(e) {
    if (!(typeof e != 'object' || e === null)) return e;
}
function $(e) {
    return e === 'en' || e === 'he';
}
function A(e, t) {
    const n = E(e),
        a = n?.he;
    if (typeof a == 'string' && a.length > 0) return a;
    const o = n?.en;
    return typeof o == 'string' && o.length > 0 ? o : t;
}
function fe(e) {
    if (!(typeof e != 'object' || e === null)) return e;
}
function f(e, t) {
    e.textContent = t;
}
export { ge as D };
