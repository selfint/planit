(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const o of document.querySelectorAll('link[rel="modulepreload"]'))r(o);new MutationObserver(o=>{for(const s of o)if(s.type==="childList")for(const a of s.addedNodes)a.tagName==="LINK"&&a.rel==="modulepreload"&&r(a)}).observe(document,{childList:!0,subtree:!0});function n(o){const s={};return o.integrity&&(s.integrity=o.integrity),o.referrerPolicy&&(s.referrerPolicy=o.referrerPolicy),o.crossOrigin==="use-credentials"?s.credentials="include":o.crossOrigin==="anonymous"?s.credentials="omit":s.credentials="same-origin",s}function r(o){if(o.ep)return;o.ep=!0;const s=n(o);fetch(o.href,s)}})();const Mn="db",In=3,C="courses",R="meta",X="catalogs",Y="requirements";function O(){return new Promise((e,t)=>{const n=indexedDB.open(Mn,In);n.onupgradeneeded=()=>{const r=n.result,o=n.transaction;if(o===null)throw new Error("IndexedDB upgrade transaction missing");const s=r.objectStoreNames.contains(C)?o.objectStore(C):r.createObjectStore(C,{keyPath:"code"});r.objectStoreNames.contains(R)||r.createObjectStore(R,{keyPath:"key"}),r.objectStoreNames.contains(X)||r.createObjectStore(X,{keyPath:"id"}),r.objectStoreNames.contains(Y)||r.createObjectStore(Y,{keyPath:"programId"}),s.indexNames.contains("name")||s.createIndex("name","name"),s.indexNames.contains("points")||s.createIndex("points","points"),s.indexNames.contains("median")||s.createIndex("median","median")},n.onsuccess=()=>{e(n.result)},n.onerror=()=>{t(n.error??new Error("Failed to open IndexedDB"))}})}async function ke(e,t,n){const r=await O();return new Promise((o,s)=>{const a=r.transaction(e,t),i=a.objectStore(e),l=n(i);l!==null&&(l.onsuccess=()=>{o(l.result)},l.onerror=()=>{s(l.error??new Error("IndexedDB request failed"))}),a.oncomplete=()=>{r.close(),l===null&&o(void 0)},a.onerror=()=>{s(a.error??new Error("IndexedDB transaction failed"))},a.onabort=()=>{s(a.error??new Error("IndexedDB transaction aborted"))}})}async function Rn(e,t,n){const r=await O();return new Promise((o,s)=>{const a=r.transaction(e,t),i={};for(const l of e)i[l]=a.objectStore(l);n(i),a.oncomplete=()=>{r.close(),o()},a.onerror=()=>{s(a.error??new Error("IndexedDB transaction failed"))},a.onabort=()=>{s(a.error??new Error("IndexedDB transaction aborted"))}})}async function T(e){return await ke(R,"readonly",n=>n.get(e))}async function w(e){await ke(R,"readwrite",t=>(t.put(e),null))}async function It(e){const t=await O();await new Promise((n,r)=>{const o=t.transaction(C,"readwrite"),s=o.objectStore(C);for(const a of e)s.put(a);o.oncomplete=()=>{t.close(),n()},o.onerror=()=>{r(o.error??new Error("Failed to save courses"))},o.onabort=()=>{r(o.error??new Error("Course transaction aborted"))}})}async function Rt(e){const t=await O();await new Promise((n,r)=>{const o=t.transaction(X,"readwrite"),s=o.objectStore(X);for(const[a,i]of Object.entries(e))s.put({id:a,data:i});o.oncomplete=()=>{t.close(),n()},o.onerror=()=>{r(o.error??new Error("Failed to save catalogs"))},o.onabort=()=>{r(o.error??new Error("Catalog transaction aborted"))}})}async function _n(){const e=await O();return new Promise((t,n)=>{const r={},o=e.transaction(X,"readonly"),a=o.objectStore(X).openCursor();a.onsuccess=()=>{const i=a.result;if(i===null)return;const l=i.value;r[l.id]=l.data,i.continue()},a.onerror=()=>{n(a.error??new Error("Failed to read catalogs"))},o.oncomplete=()=>{e.close(),t(r)},o.onerror=()=>{n(o.error??new Error("Catalog transaction failed"))},o.onabort=()=>{n(o.error??new Error("Catalog transaction aborted"))}})}async function Un(e){return await ke(Y,"readonly",n=>n.get(e))}async function On(e,t,n=!0){await Rn([Y,R],"readwrite",r=>{r[Y].put(e),t!==void 0&&t.length>0&&t!==e.programId&&r[Y].delete(t),n&&(r[R].put({key:"requirementsActiveCatalogId",value:e.catalogId}),r[R].put({key:"requirementsActiveFacultyId",value:e.facultyId}),r[R].put({key:"requirementsActiveProgramId",value:e.programId}),r[R].put({key:"requirementsActivePath",value:e.path??""}))})}async function Dn(e){return await ke(C,"readonly",n=>n.get(e))}async function Fn(e,t){if(e<=0||t<0)return[];const n=await O();return new Promise((r,o)=>{const s=[];let a=!1;const i=n.transaction(C,"readonly"),d=i.objectStore(C).openCursor();d.onsuccess=()=>{const c=d.result;if(!(c===null||s.length>=e)){if(!a&&t>0){a=!0,c.advance(t);return}s.push(c.value),c.continue()}},d.onerror=()=>{o(d.error??new Error("Failed to read courses"))},i.oncomplete=()=>{n.close(),r(s)},i.onerror=()=>{o(i.error??new Error("Course transaction failed"))},i.onabort=()=>{o(i.error??new Error("Course transaction aborted"))}})}async function jn(){const e=await O();return new Promise((t,n)=>{const r=new Set,o=e.transaction(C,"readonly"),a=o.objectStore(C).openCursor();a.onsuccess=()=>{const i=a.result;if(i===null)return;const l=i.value;typeof l.faculty=="string"&&l.faculty.trim().length>0&&r.add(l.faculty.trim()),i.continue()},a.onerror=()=>{n(a.error??new Error("Failed to read course faculties"))},o.oncomplete=()=>{e.close(),t(Array.from(r).sort((i,l)=>i.localeCompare(l)))},o.onerror=()=>{n(o.error??new Error("Course faculty transaction failed"))},o.onabort=()=>{n(o.error??new Error("Course faculty transaction aborted"))}})}async function Hn(){const e=await O();return new Promise((t,n)=>{let r=0;const o=e.transaction(C,"readonly"),a=o.objectStore(C).openCursor();a.onsuccess=()=>{const i=a.result;i!==null&&(r+=1,i.continue())},a.onerror=()=>{n(a.error??new Error("Failed to count courses"))},o.oncomplete=()=>{e.close(),t(r)},o.onerror=()=>{n(o.error??new Error("Course count transaction failed"))},o.onabort=()=>{n(o.error??new Error("Course count transaction aborted"))}})}async function $n(e){const t=he(e.query??""),n=t.length===0?[]:t.split(" "),r=zn(e.faculty),o=Me(e.pointsMin),s=Me(e.pointsMax),a=Me(e.medianMin),i=new Set(e.requirementCourseCodes??[]),l=i.size>0,d=Gn(e.pageSize),c=Bn(e.page),u=d==="all"?0:(c-1)*d,m=await O();return new Promise((f,p)=>{const g=[],v=[],q=[],E=[],y=m.transaction(C,"readonly"),j=y.objectStore(C).openCursor();j.onsuccess=()=>{const k=j.result;if(k===null)return;const b=k.value;if(!Vn(b,e.availableOnly===!0,r,o,s,a,i,l)){k.continue();return}if(n.length===0){g.push(b),k.continue();return}const ue=he(b.code),me=he(b.name??""),fe=he(`${b.code} ${b.name??""}`);if(!n.every(pe=>fe.includes(pe))){k.continue();return}ue.startsWith(t)?v.push(b):me.startsWith(t)?q.push(b):E.push(b),k.continue()},j.onerror=()=>{p(j.error??new Error("Failed to query courses"))},y.oncomplete=()=>{m.close();const k=n.length===0?g:[...v,...q,...E],b=k.length;if(d==="all"){f({courses:k,total:b});return}f({courses:k.slice(u,u+d),total:b})},y.onerror=()=>{p(y.error??new Error("Course query transaction failed"))},y.onabort=()=>{p(y.error??new Error("Course query transaction aborted"))}})}function he(e){return e.trim().toLocaleLowerCase().replace(/\s+/g," ")}function zn(e){if(typeof e!="string")return;const t=e.trim();if(t.length!==0)return t}function Me(e){if(!(typeof e!="number"||!Number.isFinite(e)))return e}function Bn(e){return typeof e!="number"||!Number.isInteger(e)||e<1?1:e}function Gn(e){return e==="all"||e===void 0||!Number.isInteger(e)||e<=0?"all":e}function Vn(e,t,n,r,o,s,a,i){if(t&&e.current!==!0||n!==void 0&&e.faculty!==n)return!1;if(r!==void 0){const l=Ie(e.points);if(l===void 0||l<r)return!1}if(o!==void 0){const l=Ie(e.points);if(l===void 0||l>o)return!1}if(s!==void 0){const l=Ie(e.median);if(l===void 0||l<s)return!1}return!(i&&!a.has(e.code))}function Ie(e){if(typeof e=="number")return Number.isFinite(e)?e:void 0;if(typeof e=="string"){const t=Number.parseFloat(e);return Number.isFinite(t)?t:void 0}}function _t(e){return e?.nested===void 0?[]:e.nested.filter(t=>Yn(t))}function Wn(e){return _t(e).map(t=>{const n=ce(t);if(n!==void 0)return{id:n,label:Le(t,n),node:t}}).filter(t=>t!==void 0)}function et(e,t){if(e.nested===void 0)return e;const n=_t(e);if(n.length===0||t===void 0)return e;const r=n.find(a=>ce(a)===t);if(r===void 0)return e;const o=e.nested.filter(a=>Qn(a)),s=Array.isArray(r.nested)?r.nested:[];return{...e,nested:[...s,...o]}}function Kn(e){if(e===void 0)return 0;const t=new Set;return Ut(e,t),t.size}function Le(e,t){return typeof e.he=="string"&&e.he.length>0?e.he:typeof e.en=="string"&&e.en.length>0?e.en:t}function ce(e){if(typeof e.name=="string"&&e.name.length>0)return e.name;if(typeof e.en=="string"&&e.en.length>0)return e.en}function Ut(e,t){if(Array.isArray(e.courses))for(const n of e.courses)typeof n=="string"&&n.length>0&&t.add(n);if(Array.isArray(e.nested))for(const n of e.nested)Ut(n,t)}function Yn(e){if(typeof e.he=="string"){const t=e.he.toLowerCase();return e.he.includes("מסלול")||e.he.includes("נתיב")||t.includes("path")}return typeof e.en=="string"?e.en.toLowerCase().includes("path"):!1}function Qn(e){return typeof e.he=="string"?e.he.includes("בחירה"):typeof e.en=="string"?e.en.toLowerCase().includes("elective"):!1}const Ot="/planit/assets/logo-InBvJXIa.webp",Xn=`<template>
    <header
        class="border-border/50 bg-surface-1/45 sticky top-0 z-40 border-b pt-[env(safe-area-inset-top)] backdrop-blur-md"
        data-component="ConsoleNav"
    >
        <nav
            class="mx-auto flex min-h-11 w-full items-center justify-between gap-4 px-3 py-1 sm:px-5 md:py-2 lg:max-w-6xl lg:px-8"
            aria-label="ניווט ראשי"
        >
            <div class="flex items-center gap-0.5 sm:gap-x-1 md:gap-x-1.5">
                <button
                    class="focus-visible:ring-accent/60 text-text-muted hover:text-text inline-flex min-h-10 min-w-10 cursor-pointer touch-manipulation items-center justify-center rounded-xl transition duration-200 ease-out focus-visible:ring-2"
                    type="button"
                    data-login
                    aria-hidden="false"
                    aria-label="login"
                >
                    <svg
                        viewBox="0 0 24 24"
                        class="size-4"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                    >
                        <circle cx="12" cy="12" r="9"></circle>
                        <circle cx="12" cy="10" r="3"></circle>
                        <path d="M17 18c-1.3-1.4-3-2-5-2s-3.7.6-5 2"></path>
                    </svg>
                </button>
                <button
                    class="focus-visible:ring-accent/60 text-text-muted hover:text-text hidden min-h-10 min-w-10 cursor-pointer touch-manipulation items-center justify-center rounded-xl transition duration-200 ease-out focus-visible:ring-2"
                    type="button"
                    data-logout
                    aria-hidden="true"
                    aria-label="logout"
                >
                    <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        class="size-4"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                    >
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                        <path d="M16 17l5-5-5-5" />
                        <path d="M21 12H9" />
                    </svg>
                </button>
                <a
                    class="focus-visible:ring-accent/60 text-text-muted hover:text-text inline-flex min-h-10 min-w-10 items-center justify-center rounded-xl transition duration-200 ease-out focus-visible:ring-2"
                    href="/search"
                    data-console-link="search"
                    aria-label="חיפוש"
                    title="חיפוש"
                >
                    <svg
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                        class="size-4"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                    >
                        <circle cx="11" cy="11" r="7"></circle>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                </a>
                <a
                    class="focus-visible:ring-accent/60 text-text-muted hover:text-text inline-flex min-h-10 items-center rounded-xl px-2.5 text-sm font-medium transition duration-200 ease-out focus-visible:ring-2"
                    href="/plan"
                    data-console-link="plan"
                >
                    מתכנן
                </a>
                <a
                    class="focus-visible:ring-accent/60 text-text-muted hover:text-text inline-flex min-h-10 items-center rounded-xl px-2.5 text-sm font-medium transition duration-200 ease-out focus-visible:ring-2"
                    href="/catalog"
                    data-console-link="catalog"
                >
                    קטלוג
                </a>
            </div>

            <div class="flex min-w-0 items-center gap-2" data-slot="logo">
                <a
                    class="focus-visible:ring-accent/60 flex min-h-10 items-center gap-1 rounded-2xl px-2 py-0.5 focus-visible:ring-2"
                    href="/"
                    data-console-link="home"
                    aria-label="מעבר לעמוד הבית"
                    title="עמוד הבית"
                >
                    <svg
                        class="text-text hidden h-6 w-16 md:block"
                        aria-label="Planit"
                        role="img"
                    >
                        <use data-title-use></use>
                    </svg>
                    <img class="size-9" alt="לוגו Planit" data-logo />
                </a>
            </div>
        </nav>
    </header>
</template>
`,Dt="/planit/assets/Title-CvVoNA55.svg",Zn={BASE_URL:"/planit/",DEV:!1,MODE:"production",PROD:!0,SSR:!1},Jn="127.0.0.1:9099",er="127.0.0.1:8080",tr={apiKey:"AIzaSyBU4Z-kNIh2B1pVy5QZMuZsY9NqTp487i4",authDomain:"degree-planner-d8f8d.firebaseapp.com",projectId:"degree-planner-d8f8d",storageBucket:"degree-planner-d8f8d.firebasestorage.app",messagingSenderId:"625307050657",appId:"1:625307050657:web:9c6134abdc1ac0fc5cc6e0",measurementId:"G-9XWSYCZWZX"},Re="12.9.0",_e={app:`https://www.gstatic.com/firebasejs/${Re}/firebase-app.js`,auth:`https://www.gstatic.com/firebasejs/${Re}/firebase-auth.js`,firestore:`https://www.gstatic.com/firebasejs/${Re}/firebase-firestore.js`},Ve=new Set;let nr=ur,K=null,ge=null,Ft=null,mt=!1;async function rr(){await tt()}async function or(){const e=await tt();if(jt()){const n=e.authModule.GoogleAuthProvider.credential(dr());await e.authModule.signInWithCredential(e.auth,n),se(e.auth.currentUser);return}const t=new e.authModule.GoogleAuthProvider;await e.authModule.signInWithPopup(e.auth,t),se(e.auth.currentUser)}async function sr(){const e=await tt();await e.authModule.signOut(e.auth),se(e.auth.currentUser)}function ar(){return K===null?Ft:K.auth.currentUser}function ir(e){return Ve.add(e),()=>{Ve.delete(e)}}async function tt(){return K!==null?K:ge!==null?ge:(ge=lr(),K=await ge,K)}async function lr(){const{appModule:e,authModule:t,firestoreModule:n}=await nr(),r=e.initializeApp(tr),o=t.getAuth(r),s=n.getFirestore(r);if(jt()&&!mt){const a=We("VITE_FIREBASE_AUTH_EMULATOR_HOST")??Jn,i=We("VITE_FIREBASE_FIRESTORE_EMULATOR_HOST")??er,l=cr(i);t.connectAuthEmulator(o,`http://${a}`),n.connectFirestoreEmulator(s,l.host,l.port),mt=!0}return t.onAuthStateChanged(o,a=>{se(a)}),se(o.currentUser),{auth:o,authModule:t}}function cr(e){const t=e.split(":");if(t.length!==2)throw new Error(`Invalid firestore emulator host value: "${e}". Expected host:port.`);const n=Number.parseInt(t[1],10);if(Number.isNaN(n))throw new Error(`Invalid firestore emulator port in value: "${e}". Expected numeric port.`);return{host:t[0],port:n}}function jt(){return We("VITE_FIREBASE_EMULATOR")==="on"}function We(e){const n=Zn[e];if(typeof n=="string")return n}function dr(){return JSON.stringify({sub:"planit-test-user",email:"planit-test-user@example.com",email_verified:!0})}function se(e){Ft=e;for(const t of Ve)t(e)}async function ur(){const e=await import(_e.app),t=await import(_e.auth),n=await import(_e.firestore);return{appModule:e,authModule:t,firestoreModule:n}}const I={activeCatalogId:"requirementsActiveCatalogId",activeFacultyId:"requirementsActiveFacultyId",activeProgramId:"requirementsActiveProgramId",activePath:"requirementsActivePath",lastSync:"requirementsLastSync"};function mr(){return"onLine"in navigator?navigator.onLine:!0}function fr(e){return`_data/_catalogs/${e.catalogId}/${e.facultyId}/${e.programId}/requirementsData.json`}async function pr(){const[e,t,n,r]=await Promise.all([T(I.activeCatalogId),T(I.activeFacultyId),T(I.activeProgramId),T(I.activePath)]),o=typeof e?.value=="string"?e.value:void 0,s=typeof t?.value=="string"?t.value:void 0,a=typeof n?.value=="string"?n.value:void 0,i=typeof r?.value=="string"?r.value:void 0;if(!(o===void 0||o.length===0||s===void 0||s.length===0||a===void 0||a.length===0))return{catalogId:o,facultyId:s,programId:a,path:typeof i=="string"&&i.length>0?i:void 0}}async function hr(e){await Promise.all([w({key:I.activeCatalogId,value:e.catalogId}),w({key:I.activeFacultyId,value:e.facultyId}),w({key:I.activeProgramId,value:e.programId}),w({key:I.activePath,value:e.path??""})])}async function gr(e,t){if(!mr())return{status:"offline"};const n=t?.persistActiveSelection??!0,r=await T(I.activeProgramId),o=typeof r?.value=="string"?r.value:void 0,s=await fetch(fr(e));if(!s.ok)return{status:"failed",error:`שגיאה בטעינת דרישות (${String(s.status)})`};const a=await s.json();return await On({catalogId:e.catalogId,facultyId:e.facultyId,programId:e.programId,path:e.path,data:a},o,n),await w({key:I.lastSync,value:new Date().toISOString()}),{status:"updated"}}const ft="planPageState",xr="courseDataGeneratedAt";let x=wr(),Ht;const h={courses:{get(e){return x.courses.get(e)},set(e){return x.courses.set(e)},query(e){return x.courses.query(e)},page(e,t){return x.courses.page(e,t)},count(){return x.courses.count()},faculties(){return x.courses.faculties()},getLastSync(){return x.courses.getLastSync()}},catalogs:{get(){return x.catalogs.get()},set(e){return x.catalogs.set(e)}},requirements:{get(e){return x.requirements.get(e)},sync(e,t){return x.requirements.sync(e,t)}},userDegree:{get(){return x.userDegree.get()},set(e){return x.userDegree.set(e)}},userPlan:{get(){return x.userPlan.get()},set(e){return x.userPlan.set(e)}},firebase:{login(){return x.firebase.login()},logout(){return x.firebase.logout()},getUser(){return x.firebase.getUser()}},provider:{get(){return x},set(e){x=e,Ht?.()}}};function vr(e){Ht=e}function wr(){return{courses:{get:Dn,set:It,query:$n,page:Fn,count:Hn,faculties:jn,async getLastSync(){const e=await T(xr);return typeof e?.value=="string"?e.value:void 0}},catalogs:{get:_n,set:Rt},requirements:{get:Un,sync:gr},userDegree:{get:pr,set:hr},userPlan:{get:()=>T(ft),set:e=>w({key:ft,value:e})},firebase:{login:or,logout:sr,getUser:ar}}}const br={catalog:"/catalog",plan:"/plan",search:"/search"};function de(e={}){const t=document.createElement("template");t.innerHTML=Xn;const n=t.content.firstElementChild;if(!(n instanceof HTMLTemplateElement))throw new Error("ConsoleNav template element not found");const r=n.content.firstElementChild?.cloneNode(!0);if(!(r instanceof HTMLElement))throw new Error("ConsoleNav template root not found");const o=r.querySelector("[data-logo]");o!==null&&(o.src=Ot);const s=r.querySelector("[data-title-use]");return s!==null&&s.setAttribute("href",Dt),yr(r,e.activePath),Er(r),r}function yr(e,t){const n=Sr(t),r=e.querySelectorAll("[data-console-link]");for(const o of r){const s=o.dataset.consoleLink;if(!Cr(s))continue;if(n===br[s]){o.classList.add("text-text"),o.classList.add("font-medium"),o.classList.remove("text-text-muted");continue}o.classList.remove("font-medium")}}function Cr(e){return e==="catalog"||e==="plan"||e==="search"}function Sr(e){return e===void 0||e===""||e==="/"?"/":e.replace(/\/+$/,"")}function Er(e){const t=e.querySelector("[data-login]");if(t===null)throw new Error("ConsoleNav login button not found");const n=t,r=e.querySelector("[data-logout]");if(r===null)throw new Error("ConsoleNav logout button not found");const o=r;function s(){const l=h.firebase.getUser()!==null;n.classList.toggle("hidden",l),n.classList.toggle("inline-flex",!l),n.setAttribute("aria-hidden",String(l)),o.classList.toggle("hidden",!l),o.classList.toggle("inline-flex",l),o.setAttribute("aria-hidden",String(!l))}n.addEventListener("click",()=>{h.firebase.login().catch(i=>{console.error("Firebase login failed",i)})}),o.addEventListener("click",()=>{h.firebase.logout().catch(i=>{console.error("Firebase logout failed",i)})});const a=ir(()=>{s()});e.addEventListener("DOMNodeRemoved",()=>{a()},{once:!0}),s()}const kr=`<template>
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
`,Lr="hsl(168 56% 46%)",Ar="—",qr="קורס ללא שם";function U(e,t){const n=document.createElement("template");n.innerHTML=kr;const r=n.content.firstElementChild;if(!(r instanceof HTMLTemplateElement))throw new Error("CourseCard template element not found");const o=r.content.firstElementChild?.cloneNode(!0);if(!(o instanceof HTMLElement))throw new Error("CourseCard template root not found");if(e===void 0)return Pr(o),o;o.removeAttribute("data-skeleton"),o.removeAttribute("aria-busy");const s=Tr(e.code)??Lr,a=Ar,i=e.name??qr,d=(Array.isArray(e.tests)?e.tests.some(g=>g!==null):!1)?"rounded-full":"rounded-none",c=o.querySelector("[data-role='status-dot']");c!==null&&(c.className=`me-[10px] h-3 w-3 min-h-3 min-w-3 shrink-0 ${d}`,c.style.backgroundColor=s);const u=o.querySelector("[data-role='course-points']");u!==null&&(u.textContent=pt(e.points,a));const m=o.querySelector("[data-role='course-median']");m!==null&&(m.textContent=pt(e.median,a));const f=o.querySelector("[data-role='course-title']");f!==null&&(f.textContent=i);const p=o.querySelector("[data-role='course-code']");return p!==null&&(p.textContent=e.code),o}function Pr(e){e.setAttribute("data-skeleton","true"),e.setAttribute("aria-busy","true");const t=e.querySelectorAll("[data-role='course-points'], [data-role='course-median'], [data-role='course-title'], [data-role='course-code']");for(const n of t)n.textContent=""}function pt(e,t){return e===void 0||!Number.isFinite(e)?t:e.toString()}function Tr(e){const t=e.trim();if(t.length===0)return;let n=2166136261;for(let a=0;a<t.length;a+=1)n^=t.charCodeAt(a),n=Math.imul(n,16777619);n>>>=0;const r=n%360,o=58+(n>>>9)%18,s=42+(n>>>17)%16;return`hsl(${r} ${o}% ${s}%)`}const Nr=`<template>
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
`,Mr={BASE_URL:"/planit/",DEV:!1,MODE:"production",PROD:!0,SSR:!1};function Ir(e,t){const r=Mr[e];return typeof r=="string"&&r.length>0?r:t}const $t=Ir("VITE_DATA_BASE_URL","_data"),Rr=`${$t}/catalogs.json`,_r=`${$t}/generatedAt.json`,$={etag:"catalogsDataEtag",lastModified:"catalogsDataLastModified",lastSync:"catalogsDataLastSync",count:"catalogsDataCount",generatedAt:"catalogsDataGeneratedAt"},Ur="planit:catalog-sync";function Or(){return"onLine"in navigator?navigator.onLine:!0}async function Dr(){const[e,t]=await Promise.all([T($.etag),T($.lastModified)]),n=new Headers,r=typeof e?.value=="string"?e.value:void 0,o=typeof t?.value=="string"?t.value:void 0;return r!==void 0&&r.length>0&&n.set("If-None-Match",r),o!==void 0&&o.length>0&&n.set("If-Modified-Since",o),fetch(Rr,{headers:n})}async function Fr(){const e=await fetch(_r);if(!e.ok)throw new Error(`Failed to fetch generated-at metadata: ${String(e.status)} ${e.statusText}`);const t=await e.json();if(typeof t.timestamp!="number")throw new Error('generatedAt.json is missing a numeric "timestamp" field');const n=new Date(t.timestamp);if(Number.isNaN(n.getTime()))throw new Error(`generatedAt.json has invalid timestamp: ${String(t.timestamp)}`);return n.toISOString()}async function jr(){if(!Or())return{status:"offline"};const e=await Dr();if(e.status===304)return{status:"skipped"};if(!e.ok)throw new Error(`Failed to fetch catalog data: ${String(e.status)} ${e.statusText}`);const t=await e.json(),n=Object.keys(t).length,r=await Fr();await Rt(t);const o=e.headers.get("etag"),s=e.headers.get("last-modified");return await Promise.all([o!==null&&o.length>0?w({key:$.etag,value:o}):Promise.resolve(),s!==null&&s.length>0?w({key:$.lastModified,value:s}):Promise.resolve(),w({key:$.lastSync,value:new Date().toISOString()}),w({key:$.count,value:n}),w({key:$.generatedAt,value:r})]),{status:"updated",count:n}}const Hr=`<template>
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
`,zt="לתכנית זו אין מסלולים לבחירה.",Bt="בחר תכנית ומסלול כדי לראות דרישות.",Gt="לא נמצאו דרישות לתכנית זו.",be="בחר מסלול כדי להציג דרישות.",$r="אין דרישות במסלול זה.";function zr(){const e=document.createElement("template");e.innerHTML=Hr;const t=e.content.firstElementChild;if(!(t instanceof HTMLTemplateElement))throw new Error("DegreePicker template element not found");const n=t.content.firstElementChild?.cloneNode(!0);if(!(n instanceof HTMLElement))throw new Error("DegreePicker template root not found");const r=n.querySelector("[data-degree-catalog]"),o=n.querySelector("[data-degree-faculty]"),s=n.querySelector("[data-degree-program]"),a=n.querySelector("[data-degree-path]"),i=n.querySelector("[data-path-empty]"),l=n.querySelector("[data-degree-status]"),d=n.querySelector("[data-requirement-rows]");if(r===null||o===null||s===null||a===null||i===null||l===null||d===null)throw new Error("DegreePicker required elements not found");const c={catalogs:{},selection:void 0,requirement:void 0,pathOptions:[]};return r.addEventListener("change",()=>{const u=r.value;if(u.length===0){c.selection=void 0,c.requirement=void 0,c.pathOptions=[],Vt(c,r,o,s),re(a,i,d),N(l,"בחר קטלוג כדי להמשיך.");return}c.selection={catalogId:u,facultyId:"",programId:"",path:void 0},c.requirement=void 0,c.pathOptions=[],Wt(c,o,s),Ke(c,s),re(a,i,d),N(l,"בחר פקולטה כדי להמשיך.")}),o.addEventListener("change",()=>{c.selection!==void 0&&(c.selection={...c.selection,facultyId:o.value,programId:"",path:void 0},c.requirement=void 0,c.pathOptions=[],Ke(c,s),re(a,i,d),N(l,"בחר תכנית כדי לטעון דרישות."))}),s.addEventListener("change",()=>{if(c.selection===void 0)return;const u=s.value;u.length!==0&&(c.selection={...c.selection,programId:u,path:void 0},c.requirement=void 0,c.pathOptions=[],Br(c,s,a,i,d,l))}),a.addEventListener("change",()=>{if(c.selection===void 0)return;const u=a.value;c.selection={...c.selection,path:u.length>0?u:void 0},Zt(c),Yt(c,d,c.selection.path),c.selection.path===void 0&&c.pathOptions.length>0&&N(l,be)}),window.addEventListener(Ur,()=>{n.isConnected&&ht(c,r,o,s,a,i,d,l)}),ht(c,r,o,s,a,i,d,l),n}async function ht(e,t,n,r,o,s,a,i){e.catalogs=await h.catalogs.get();const l=await h.userDegree.get();l!==void 0&&(e.selection={catalogId:l.catalogId,facultyId:l.facultyId,programId:l.programId,path:l.path}),Vt(e,t,n,r);const d=e.selection?.programId;d!==void 0&&d.length>0?await Kt(e,o,s,a,i):(re(o,s,a),N(i,Object.keys(e.catalogs).length===0?"אין קטלוגים זמינים אופליין.":"בחר תכנית כדי לטעון דרישות."))}function Vt(e,t,n,r){const o=Object.keys(e.catalogs).sort();if(_(t,o.map(s=>({id:s,label:nt(e.catalogs[s],s)})),"בחר קטלוג"),e.selection!==void 0&&(t.value=e.selection.catalogId),t.value.length===0){n.disabled=!0,r.disabled=!0,_(n,[],"בחר פקולטה"),_(r,[],"בחר תכנית");return}Wt(e,n,r),Ke(e,r)}function Wt(e,t,n){const r=e.selection?.catalogId??"",o=ye(e.catalogs[r]),a=(o!==void 0?Object.keys(o).filter(i=>!Xt(i)):[]).map(i=>({id:i,label:nt(o?.[i],i)}));_(t,a,"בחר פקולטה"),t.disabled=a.length===0,e.selection!==void 0&&(t.value=e.selection.facultyId),n.disabled=!0,_(n,[],"בחר תכנית")}function Ke(e,t){const n=e.selection?.catalogId??"",r=e.selection?.facultyId??"",o=ye(e.catalogs[n]),s=o!==void 0?ye(o[r]):void 0,i=(s!==void 0?Object.keys(s).filter(l=>!Xt(l)):[]).map(l=>({id:l,label:nt(s?.[l],l)}));_(t,i,"בחר תכנית"),t.disabled=i.length===0,e.selection!==void 0&&(t.value=e.selection.programId)}async function Br(e,t,n,r,o,s){if(e.selection===void 0)return;const a=e.selection;t.disabled=!0,N(s,"טוען דרישות...");const i=await h.requirements.sync(a,{persistActiveSelection:!1});if(t.disabled=!1,await Kt(e,n,r,o,s),!(e.pathOptions.length>0&&e.selection.path===void 0)){if(i.status==="updated"){N(s,"הדרישות נטענו ונשמרו אופליין.");return}if(i.status==="offline"){N(s,"אין חיבור לרשת. הדרישות הקודמות נשמרות.");return}N(s,i.error??"שגיאה בטעינת דרישות.")}}async function Kt(e,t,n,r,o){const s=e.selection?.programId??"";if(s.length===0){re(t,n,r);return}const a=await h.requirements.get(s);e.requirement=Kr(a?.data);const i=Wn(e.requirement);e.pathOptions=i,Gr(e,t,n);const l=e.selection?.path;if(i.length>0&&l===void 0){ne(r,be),N(o,be);return}Zt(e),Yt(e,r,l),e.requirement===void 0&&N(o,Gt)}function Gr(e,t,n){const r=e.pathOptions;if(r.length===0){t.required=!1,t.disabled=!0,_(t,[],zt),n.textContent="",n.classList.add("hidden"),e.selection!==void 0&&(e.selection={...e.selection,path:void 0});return}if(t.disabled=!1,t.required=!0,n.textContent="",n.classList.add("hidden"),_(t,r.map(o=>({id:o.id,label:o.label})),"בחר מסלול"),e.selection?.path!==void 0&&r.some(s=>s.id===e.selection?.path)){t.value=e.selection.path;return}t.value="",e.selection!==void 0&&(e.selection={...e.selection,path:void 0})}function Yt(e,t,n){if(t.replaceChildren(),e.pathOptions.length>0&&n===void 0){ne(t,be);return}const r=e.requirement;if(r===void 0){ne(t,Gt);return}const o=et(r,n),s=Array.isArray(o.nested)?o.nested:[],a=Wr(s);if(a.length===0){ne(t,n!==void 0?$r:Bt);return}for(const i of a)t.append(Vr(i))}function ne(e,t){e.replaceChildren();const n=document.createElement("tr"),r=document.createElement("td");r.className="text-text px-3 py-2",r.colSpan=2,r.textContent=t,n.append(r),e.append(n)}function Vr(e){const t=document.createElement("tr"),n=e.path,r=e.count;return t.append(gt(n,"text-start")),t.append(gt(r.toString(),"text-start")),t}function gt(e,t){const n=document.createElement("td");return n.className=t.length>0?`text-text px-3 py-2 ${t}`:"text-text px-3 py-2",n.textContent=e,n}function Wr(e){const t=[];for(const n of e)Qt(n,[],t);return t}function Qt(e,t,n){const r=ce(e)??"—",o=Le(e,r),s=[...t,o].join(" ");if(Array.isArray(e.courses)&&e.courses.length>0&&n.push({path:s,count:Kn(e)}),Array.isArray(e.nested))for(const i of e.nested)Qt(i,[...t,o],n)}function re(e,t,n){e.required=!1,e.disabled=!0,_(e,[],zt),t.textContent="",t.classList.add("hidden"),ne(n,Bt)}function _(e,t,n){e.replaceChildren();const r=document.createElement("option");r.value="",r.textContent=n,e.append(r);for(const o of t){const s=document.createElement("option");s.value=o.id,s.textContent=o.label,e.append(s)}}function ye(e){if(!(typeof e!="object"||e===null))return e}function Xt(e){return e==="en"||e==="he"}function nt(e,t){const n=ye(e),r=n?.he;if(typeof r=="string"&&r.length>0)return r;const o=n?.en;return typeof o=="string"&&o.length>0?o:t}function Kr(e){if(!(typeof e!="object"||e===null))return e}function N(e,t){e.textContent=t}function Yr(e){const t=e.selection;return!(t===void 0||t.catalogId.length===0||t.facultyId.length===0||t.programId.length===0||e.pathOptions.length>0&&(t.path?.length??0)===0)}async function Zt(e){!Yr(e)||e.selection===void 0||await h.userDegree.set(e.selection)}const Ue="לא נמצאו קורסים במסלול הזה. אפשר לבחור מסלול אחר לבדיקת דרישות.",V="בחרו תכנית ומסלול כדי להציג קורסים.",Qr="טוען קורסים מהאחסון המקומי...",oe="מעדכן בחירה בתכנית...",Oe="אין דרישות שמורות לתכנית זו. התחברו לאינטרנט ונסו לטעון שוב.",Xr="קורס",Zr=6,Jt="min-w-0 max-w-full overflow-x-auto overflow-y-hidden pb-2 [scrollbar-width:thin]",en="flex w-max min-w-full snap-x snap-mandatory gap-2";function Jr(){const e=document.createElement("template");e.innerHTML=Nr;const t=e.content.firstElementChild;if(!(t instanceof HTMLTemplateElement))throw new Error("CatalogPage template element not found");const n=t.content.firstElementChild?.cloneNode(!0);if(!(n instanceof HTMLElement))throw new Error("CatalogPage template root not found");const r=n.querySelector("[data-console-nav]");r!==null&&r.replaceWith(de({activePath:"/catalog"}));const o=n.querySelector("[data-catalog-degree-picker]"),s=n.querySelector("[data-catalog-groups]"),a=n.querySelector("[data-catalog-state]"),i=n.querySelector("[data-catalog-summary]");if(o===null||s===null||a===null||i===null)throw new Error("CatalogPage required elements not found");const l=zr();o.replaceWith(l);const d={root:s,state:a,summary:i,pickerRoot:l,courseCache:new Map,pickerPending:!1,refreshTimer:void 0,refreshVersion:0},c=l.querySelectorAll("[data-degree-catalog], [data-degree-faculty], [data-degree-program], [data-degree-path]");for(const m of c)m.addEventListener("change",()=>{d.pickerPending=!0,d.state.textContent=oe,W(d.root,oe),De(d)});return new MutationObserver(()=>{De(d)}).observe(l,{childList:!0,subtree:!0,characterData:!0,attributes:!0,attributeFilter:["disabled"]}),window.addEventListener("resize",()=>{De(d)}),co(d.root,4),tn(d),n}function De(e){e.refreshTimer!==void 0&&window.clearTimeout(e.refreshTimer),e.refreshTimer=window.setTimeout(()=>{e.refreshTimer=void 0,tn(e)},60)}async function tn(e){const t=e.refreshVersion+1;e.refreshVersion=t,e.state.textContent=Qr;const n=await h.userDegree.get();if(e.refreshVersion!==t)return;if(!to(e.pickerRoot)){e.pickerPending=!1,e.summary.textContent=V,e.state.textContent=V,W(e.root,V);return}if(e.pickerPending&&!eo(e.pickerRoot,n)){e.summary.textContent=oe,e.state.textContent=oe,W(e.root,oe);return}if(e.pickerPending=!1,n===void 0){e.summary.textContent=V,e.state.textContent=V,W(e.root,V);return}const r=await h.requirements.get(n.programId);if(e.refreshVersion!==t)return;const o=lo(r?.data);if(o===void 0){e.summary.textContent=Oe,e.state.textContent=Oe,W(e.root,Oe);return}const s=et(o,n.path),a=ao(s);if(a.length===0){e.summary.textContent=Ue,e.state.textContent=Ue,W(e.root,Ue);return}no(e.root,a,e.courseCache);const i=so(a).length;e.summary.textContent=`נטענו ${String(i)} קורסים מתוך ${String(a.length)} קבוצות דרישה.`,e.state.textContent=`עודכן מנתונים שמורים אופליין עבור ${n.programId}.`}function eo(e,t){if((e.querySelector("[data-degree-status]")?.textContent??"").includes("טוען דרישות"))return!1;const r=ee(e,"[data-degree-catalog]"),o=ee(e,"[data-degree-faculty]"),s=ee(e,"[data-degree-program]"),a=ee(e,"[data-degree-path]"),i=t?.catalogId??"",l=t?.facultyId??"",d=t?.programId??"",c=t?.path??"";return r===i&&o===l&&s===d&&a===c}function ee(e,t){return e.querySelector(t)?.value??""}function to(e){if(ee(e,"[data-degree-program]").length===0)return!1;const n=e.querySelector("[data-degree-path]");return!(n?.required===!0&&n.value.length===0)}function no(e,t,n){e.replaceChildren(),t.forEach(r=>{const o=document.createElement("section");o.className="flex min-w-0 flex-col gap-3 py-4 [content-visibility:auto] [contain-intrinsic-size:24rem]";const s=document.createElement("div");s.className="mx-4 flex flex-col gap-1 xl:mx-0";const a=document.createElement("h3");a.className="text-sm font-medium",a.textContent=r.label;const i=document.createElement("p");i.className="text-text-muted text-xs",i.textContent=r.subtitle,s.append(a),s.append(i),o.append(s);const l=document.createElement("div");l.className=Jt;const d=document.createElement("div");d.className=en,d.dataset.role="group-row",l.append(d),o.append(l);let c=0,u,m;async function f(){if(u!==void 0&&m!==void 0)return{codes:u,records:m};const g=await oo(r.courseCodes,n),v=ro(r.courseCodes,g);return u=v,m=g,{codes:v,records:g}}async function p(){c+=1;const g=c,v=await f();if(g===c){d.replaceChildren();for(const q of v.codes){const E=v.records.get(q),y=E==null?U({code:q,name:`${Xr} ${q}`}):U(E),A=document.createElement("a");A.href=`/course?code=${encodeURIComponent(q)}`,A.className="touch-manipulation focus-visible:ring-accent/60 block h-[7.5rem] w-[7.5rem] shrink-0 snap-start rounded-2xl focus-visible:ring-2 sm:h-[6.5rem] lg:w-[10.5rem] [content-visibility:auto] [contain-intrinsic-size:7.5rem_7.5rem] sm:[contain-intrinsic-size:7.5rem_6.5rem] lg:[contain-intrinsic-size:10.5rem_6.5rem]",E?.current!==!0&&A.classList.add("opacity-70"),A.append(y),d.append(A)}}}p(),e.append(o)})}function ro(e,t){return[...e].sort((n,r)=>{const o=xt(t.get(n)),s=xt(t.get(r));return s!==o?s-o:n.localeCompare(r)})}function xt(e){return e?.median===void 0||!Number.isFinite(e.median)?Number.NEGATIVE_INFINITY:e.median}async function oo(e,t){const n=new Map;return await Promise.all(e.map(async r=>{const o=t.get(r);if(o!==void 0){n.set(r,o);return}const a=await h.courses.get(r)??null;t.set(r,a),n.set(r,a)})),n}function so(e){const t=new Set;for(const n of e)for(const r of n.courseCodes)t.add(r);return[...t]}function ao(e){const t=[];return nn(e,[],t),t}function nn(e,t,n){const r=ce(e)??"—",o=Le(e,r),s=[...t,o],a=io(e);if(a.length>0&&n.push({id:r,label:o,subtitle:`${s.join(" • ")} · ${String(a.length)} קורסים`,courseCodes:a}),Array.isArray(e.nested))for(const i of e.nested)nn(i,s,n)}function io(e){if(!Array.isArray(e.courses))return[];const t=new Set;for(const n of e.courses)typeof n=="string"&&n.length>0&&t.add(n);return[...t]}function lo(e){if(!(typeof e!="object"||e===null))return e}function W(e,t){e.replaceChildren();const n=document.createElement("p");n.className="text-text-muted mx-4 py-3 text-xs xl:mx-0",n.textContent=t,e.append(n)}function co(e,t){e.replaceChildren();for(let n=0;n<t;n+=1){const r=document.createElement("div");r.className="flex flex-col gap-3 py-4";const o=document.createElement("span");o.className="skeleton-shimmer mx-4 h-4 w-44 rounded-md xl:mx-0",r.append(o);const s=document.createElement("div");s.className=Jt;const a=document.createElement("div");a.className=en,a.dataset.role="group-row";for(let i=0;i<Zr;i+=1){const l=document.createElement("div");l.className="pointer-events-none block h-[7.5rem] w-[7.5rem] shrink-0 snap-start rounded-2xl sm:h-[6.5rem] lg:w-[10.5rem]",l.setAttribute("aria-hidden","true"),l.append(U()),a.append(l)}s.append(a),r.append(s),e.append(r)}}const uo={BASE_URL:"/planit/",DEV:!1,MODE:"production",PROD:!0,SSR:!1};function mo(e,t){const r=uo[e];return typeof r=="string"&&r.length>0?r:t}const rn=mo("VITE_DATA_BASE_URL","_data"),fo=`${rn}/courseData.json`,po=`${rn}/generatedAt.json`,z={etag:"courseDataEtag",lastModified:"courseDataLastModified",lastSync:"courseDataLastSync",count:"courseDataCount",generatedAt:"courseDataGeneratedAt"},ho="planit:course-sync";function go(){return"onLine"in navigator?navigator.onLine:!0}async function xo(){const[e,t]=await Promise.all([T(z.etag),T(z.lastModified)]),n=new Headers,r=typeof e?.value=="string"?e.value:void 0,o=typeof t?.value=="string"?t.value:void 0;return r!==void 0&&r.length>0&&n.set("If-None-Match",r),o!==void 0&&o.length>0&&n.set("If-Modified-Since",o),fetch(fo,{headers:n})}async function vo(){const e=await fetch(po);if(!e.ok)throw new Error(`Failed to fetch generated-at metadata: ${String(e.status)} ${e.statusText}`);const t=await e.json();if(typeof t.timestamp!="number")throw new Error('generatedAt.json is missing a numeric "timestamp" field');const n=new Date(t.timestamp);if(Number.isNaN(n.getTime()))throw new Error(`generatedAt.json has invalid timestamp: ${String(t.timestamp)}`);return n.toISOString()}async function wo(){if(!go())return{status:"offline"};const e=await xo();if(e.status===304)return{status:"skipped"};if(!e.ok)throw new Error(`Failed to fetch course data: ${String(e.status)} ${e.statusText}`);const t=await e.json(),n=Object.values(t),r=await vo();await It(n);const o=e.headers.get("etag"),s=e.headers.get("last-modified");return await Promise.all([o!==null&&o.length>0?w({key:z.etag,value:o}):Promise.resolve(),s!==null&&s.length>0?w({key:z.lastModified,value:s}):Promise.resolve(),w({key:z.lastSync,value:new Date().toISOString()}),w({key:z.count,value:n.length}),w({key:z.generatedAt,value:r})]),{status:"updated",count:n.length}}const bo=`<template>
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
`,Ce="—",on="קורס לא זמין במאגר",vt=300,yo=3,sn=6,Fe=["אביב","קיץ","חורף"],Co=["skeleton-shimmer","inline-block","h-3","w-16","rounded-md","text-transparent"];function So(){const e=document.createElement("template");e.innerHTML=bo;const t=e.content.firstElementChild;if(!(t instanceof HTMLTemplateElement))throw new Error("CoursePage template element not found");const n=t.content.firstElementChild?.cloneNode(!0);if(!(n instanceof HTMLElement))throw new Error("CoursePage template root not found");const r=n.querySelector("[data-console-nav]");r!==null&&r.replaceWith(de({activePath:"/course"}));const o=Eo(n),s=ko(window.location.search);return Lo(n,o,s),s===void 0?(dn(o,"נדרש פרמטר code בכתובת, למשל /course?code=104031."),an(o),o.actionStatus.textContent="אי אפשר לעדכן תכנית בלי קוד קורס.",n):(wt(o,s),window.addEventListener(ho,()=>{n.isConnected&&wt(o,s)}),n)}function Eo(e){const t=e.querySelector("[data-role='course-name']"),n=e.querySelector("[data-role='course-about']"),r=e.querySelector("[data-role='course-points']"),o=e.querySelector("[data-role='course-median']"),s=e.querySelector("[data-role='course-faculty']"),a=e.querySelector("[data-role='course-seasons']"),i=e.querySelector("[data-role='course-points-card']"),l=e.querySelector("[data-role='course-median-card']"),d=e.querySelector("[data-role='course-faculty-card']"),c=e.querySelector("[data-role='course-seasons-card']"),u=e.querySelector("[data-role='semester-split-control']"),m=e.querySelector("[data-role='semester-add-current']"),f=e.querySelector("[data-role='semester-dropdown']"),p=e.querySelector("[data-role='semester-dropdown-menu']"),g=e.querySelector("[data-role='wishlist-add']"),v=e.querySelector("[data-role='exemptions-add']"),q=e.querySelector("[data-role='placement-remove']"),E=e.querySelector("[data-role='action-status']"),y=e.querySelector("[data-state='not-found']"),A=e.querySelector("[data-role='not-found-message']"),j=e.querySelector("[data-role='dependencies-grid']"),k=e.querySelector("[data-role='dependencies-count']"),b=e.querySelector("[data-role='dependencies-empty']"),ue=e.querySelector("[data-role='dependants-grid']"),me=e.querySelector("[data-role='dependants-count']"),fe=e.querySelector("[data-role='dependants-empty']"),Ne=e.querySelector("[data-role='adjacent-grid']"),pe=e.querySelector("[data-role='adjacent-count']"),lt=e.querySelector("[data-role='adjacent-empty']"),ct=e.querySelector("[data-role='exclusive-grid']"),dt=e.querySelector("[data-role='exclusive-count']"),ut=e.querySelector("[data-role='exclusive-empty']");if(t===null||n===null||r===null||o===null||s===null||a===null||i===null||l===null||d===null||c===null||u===null||m===null||f===null||p===null||g===null||v===null||q===null||E===null||y===null||A===null||j===null||k===null||b===null||ue===null||me===null||fe===null||Ne===null||pe===null||lt===null||ct===null||dt===null||ut===null)throw new Error("CoursePage required elements not found");return{courseName:t,courseAbout:n,coursePoints:r,courseMedian:o,courseFaculty:s,courseSeasons:a,coursePointsCard:i,courseMedianCard:l,courseFacultyCard:d,courseSeasonsCard:c,semesterSplitControl:u,semesterAddCurrent:m,semesterDropdown:f,semesterDropdownMenu:p,wishlistAdd:g,exemptionsAdd:v,placementRemove:q,actionStatus:E,notFoundState:y,notFoundMessage:A,dependenciesGrid:j,dependenciesCount:k,dependenciesEmpty:b,dependantsGrid:ue,dependantsCount:me,dependantsEmpty:fe,adjacentGrid:Ne,adjacentCount:pe,adjacentEmpty:lt,exclusiveGrid:ct,exclusiveCount:dt,exclusiveEmpty:ut}}function ko(e){const n=new URLSearchParams(e).get("code");if(n===null)return;const r=n.trim().toUpperCase();if(r.length!==0)return r}function Lo(e,t,n){G(t,n),t.semesterAddCurrent.addEventListener("click",()=>{n!==void 0&&No(t,n)}),t.wishlistAdd.addEventListener("click",()=>{n!==void 0&&Io(t,n)}),t.exemptionsAdd.addEventListener("click",()=>{n!==void 0&&Ro(t,n)}),t.placementRemove.addEventListener("click",()=>{n!==void 0&&_o(t,n)}),t.semesterDropdownMenu.addEventListener("click",r=>{const o=r.target;if(!(o instanceof Element))return;const s=o.closest("[data-semester-option]");if(s===null)return;const a=Number.parseInt(s.dataset.semesterIndex??"",10);!Number.isFinite(a)||n===void 0||Mo(t,n,a)}),e.addEventListener("click",r=>{const o=r.target;o instanceof Node&&(t.semesterDropdown.contains(o)||(t.semesterDropdown.open=!1))})}function an(e){B(e.semesterSplitControl),B(e.wishlistAdd),B(e.exemptionsAdd),te(e.placementRemove),e.placementRemove.disabled=!0,e.semesterDropdown.open=!1}async function G(e,t){if(t===void 0){an(e),e.actionStatus.textContent.trim().length===0&&(e.actionStatus.textContent="אי אפשר לעדכן תכנית בלי קוד קורס.");return}const n=await Ae(),r=ln(n,t);if(Ao(e,n.semesters,n.currentSemester),r.kind==="none"){te(e.semesterSplitControl),te(e.wishlistAdd),te(e.exemptionsAdd),B(e.placementRemove),e.placementRemove.disabled=!0;return}B(e.semesterSplitControl),B(e.wishlistAdd),B(e.exemptionsAdd),te(e.placementRemove),e.placementRemove.disabled=!1,e.placementRemove.textContent=To(r),e.semesterDropdown.open=!1}function B(e){e.classList.remove("inline-flex"),e.classList.add("hidden")}function te(e){e.classList.remove("hidden"),e.classList.add("inline-flex")}function Ao(e,t,n){const r=Math.max(sn,t.length),o=qe(n,r),s=Ye(o,t[o]?.id);e.semesterAddCurrent.textContent=`הוסף ל${s}`,e.semesterDropdownMenu.replaceChildren();for(let a=0;a<r;a+=1){const i=document.createElement("button");i.type="button",i.className="hover:bg-surface-2 text-text touch-manipulation min-h-10 rounded-xl px-2.5 py-1.5 text-start text-xs",i.dataset.semesterOption="true",i.dataset.semesterIndex=String(a);const l=a===o,d=Ye(a,t[a]?.id);i.textContent=l?`${d} (נוכחי)`:d,e.semesterDropdownMenu.append(i)}}function Ye(e,t){const n=qo(t);if(n!==void 0)return`${n.season} ${String(n.year)}`;const r=Po(e+1);return`${r.season} ${String(r.year)}`}function qo(e){if(e===void 0)return;const t=/^(אביב|קיץ|חורף)-(\d{4})-/.exec(e);if(t!==null)return{season:t[1],year:Number.parseInt(t[2],10)}}function Po(e){const t=Math.max(0,e-1),n=Fe[t%Fe.length],r=2026+Math.floor(e/Fe.length);return{season:n,year:r}}function To(e){return e.kind==="semester"?`הסר מסמסטר ${String(e.semesterIndex+1)}`:e.kind==="wishlist"?"הסר מרשימת המשאלות":"הסר מהפטורים"}async function No(e,t){M(e,!0),e.actionStatus.textContent="מוסיף לסמסטר הנוכחי...";const n=await Ae(),r=await cn(t,n.currentSemester);e.actionStatus.textContent=r?`הקורס נוסף לסמסטר ${String(n.currentSemester+1)}.`:"הקורס כבר קיים בסמסטר הנוכחי.",await G(e,t),M(e,!1)}async function Mo(e,t,n){M(e,!0),e.actionStatus.textContent=`מוסיף לסמסטר ${String(n+1)}...`;const r=await cn(t,n);e.actionStatus.textContent=r?`הקורס נוסף לסמסטר ${String(n+1)}.`:`הקורס כבר קיים בסמסטר ${String(n+1)}.`,await G(e,t),M(e,!1)}async function Io(e,t){M(e,!0),e.actionStatus.textContent="מעדכן רשימת משאלות...";const n=await Uo(t);e.actionStatus.textContent=n?"הקורס נוסף לרשימת המשאלות.":"הקורס כבר קיים ברשימת המשאלות.",await G(e,t),M(e,!1)}async function Ro(e,t){M(e,!0),e.actionStatus.textContent="מעדכן פטורים...";const n=await Oo(t);e.actionStatus.textContent=n?"הקורס נוסף לפטורים.":"הקורס כבר קיים בפטורים.",await G(e,t),M(e,!1)}async function _o(e,t){M(e,!0),e.actionStatus.textContent="מסיר את הקורס מהתכנית...";const n=await Ae(),r=ln(n,t);if(r.kind==="none"){e.actionStatus.textContent="הקורס לא נמצא בתכנית כרגע.",await G(e,t),M(e,!1);return}if(r.kind==="semester"){const o=Ye(r.semesterIndex,n.semesters[r.semesterIndex]?.id);await Do(t,r.semesterIndex),e.actionStatus.textContent=`הקורס הוסר מ${o}.`}else r.kind==="wishlist"?(await Fo(t),e.actionStatus.textContent="הקורס הוסר מרשימת המשאלות."):(await jo(t),e.actionStatus.textContent="הקורס הוסר מהפטורים.");await G(e,t),M(e,!1)}function M(e,t){e.semesterAddCurrent.disabled=t,e.wishlistAdd.disabled=t,e.exemptionsAdd.disabled=t,e.placementRemove.disabled=t;const n=e.semesterDropdownMenu.querySelectorAll("[data-semester-option]");for(const r of n)r.disabled=t;t&&(e.semesterDropdown.open=!1)}async function Ae(){const e=await h.userPlan.get(),t=Ho(e?.value),n=Bo(t?.semesterCount);return{version:yo,semesterCount:n,currentSemester:qe(t?.currentSemester,n),semesters:rt($o(t?.semesters),n),wishlistCourseCodes:S(t?.wishlistCourseCodes),exemptionsCourseCodes:S(t?.exemptionsCourseCodes)}}function ln(e,t){const n=t.trim().toUpperCase();if(n.length===0)return{kind:"none"};for(const[r,o]of e.semesters.entries())if(S(o.courseCodes).includes(n))return{kind:"semester",semesterIndex:r};return S(e.wishlistCourseCodes).includes(n)?{kind:"wishlist"}:S(e.exemptionsCourseCodes).includes(n)?{kind:"exemptions"}:{kind:"none"}}function rt(e,t){const n=e.map(r=>({id:r.id,courseCodes:S(r.courseCodes)}));for(;n.length<t;)n.push({id:void 0,courseCodes:[]});return n}async function Z(e){const t=await Ae();return e(t)?(await h.userPlan.set(t),!0):!1}async function cn(e,t){const n=e.trim().toUpperCase();return n.length===0?!1:Z(r=>{const o=qe(t,r.semesterCount);r.semesters=rt(r.semesters,r.semesterCount);const s=r.semesters[o],a=S(s.courseCodes);return a.includes(n)?!1:(s.courseCodes=[...a,n],!0)})}async function Uo(e){const t=e.trim().toUpperCase();return t.length===0?!1:Z(n=>{const r=S(n.wishlistCourseCodes);return r.includes(t)?!1:(n.wishlistCourseCodes=[...r,t],!0)})}async function Oo(e){const t=e.trim().toUpperCase();return t.length===0?!1:Z(n=>{const r=S(n.exemptionsCourseCodes);return r.includes(t)?!1:(n.exemptionsCourseCodes=[...r,t],!0)})}async function Do(e,t){const n=e.trim().toUpperCase();return n.length===0?!1:Z(r=>{const o=qe(t,r.semesterCount);r.semesters=rt(r.semesters,r.semesterCount);const s=r.semesters[o],a=S(s.courseCodes),i=a.filter(l=>l!==n);return i.length===a.length?!1:(s.courseCodes=i,!0)})}async function Fo(e){const t=e.trim().toUpperCase();return t.length===0?!1:Z(n=>{const r=S(n.wishlistCourseCodes),o=r.filter(s=>s!==t);return o.length===r.length?!1:(n.wishlistCourseCodes=o,!0)})}async function jo(e){const t=e.trim().toUpperCase();return t.length===0?!1:Z(n=>{const r=S(n.exemptionsCourseCodes),o=r.filter(s=>s!==t);return o.length===r.length?!1:(n.exemptionsCourseCodes=o,!0)})}function Ho(e){if(!(typeof e!="object"||e===null))return e}function S(e){if(!Array.isArray(e))return[];const t=new Set;for(const n of e){if(typeof n!="string")continue;const r=n.trim().toUpperCase();r.length!==0&&t.add(r)}return[...t]}function $o(e){return Array.isArray(e)?e.map(t=>{if(typeof t!="object"||t===null)return{courseCodes:[]};const n=t,r=S(n.courseCodes);return{id:typeof n.id=="string"?n.id:void 0,courseCodes:r.length>0?r:zo(n.courses)}}):[]}function zo(e){if(!Array.isArray(e))return[];const t=[];for(const n of e){if(typeof n=="string"){t.push(n);continue}if(typeof n!="object"||n===null)continue;const r=n;typeof r.code=="string"&&t.push(r.code)}return S(t)}function Bo(e){return typeof e=="number"&&Number.isFinite(e)?Math.max(3,Math.floor(e)):sn}function qe(e,t){return typeof e=="number"&&Number.isFinite(e)?Math.max(0,Math.min(t-1,Math.floor(e))):0}function dn(e,t){e.notFoundState.classList.remove("hidden"),e.notFoundMessage.textContent=t,un(e),Vo(e)}function Go(e){e.notFoundState.classList.add("hidden"),un(e)}function un(e,t){xe(e.coursePointsCard),xe(e.courseMedianCard),xe(e.courseFacultyCard),xe(e.courseSeasonsCard)}function xe(e,t){e.dataset.loading="false"}function mn(e,t){e.classList.remove(...Co)}function Vo(e){fn(e.dependenciesGrid,e.dependenciesCount,e.dependenciesEmpty,[]),Q(e.dependantsGrid,e.dependantsCount,e.dependantsEmpty,[]),Q(e.adjacentGrid,e.adjacentCount,e.adjacentEmpty,[]),Q(e.exclusiveGrid,e.exclusiveCount,e.exclusiveEmpty,[])}async function wt(e,t){const n=await h.courses.get(t);if(n===void 0){dn(e,`לא נמצא קורס עם הקוד ${t}.`);return}Wo(e,n);const r=Qo(n),o=yt(n.connections?.adjacent),s=yt(n.connections?.exclusive),[a,i,l,d]=await Promise.all([Xo(t,r),Zo(t),Qe(t,o),Qe(t,s)]);fn(e.dependenciesGrid,e.dependenciesCount,e.dependenciesEmpty,a),Q(e.dependantsGrid,e.dependantsCount,e.dependantsEmpty,i),Q(e.adjacentGrid,e.adjacentCount,e.adjacentEmpty,l),Q(e.exclusiveGrid,e.exclusiveCount,e.exclusiveEmpty,d),Go(e)}function Wo(e,t){e.courseName.textContent=je(t.name)??on,e.courseAbout.textContent=je(t.about)??"אין תיאור זמין לקורס זה במאגר הנוכחי.",e.coursePoints.textContent=bt(t.points),e.courseMedian.textContent=bt(t.median),e.courseFaculty.textContent=je(t.faculty)??Ce,e.courseSeasons.textContent=Ko(t.seasons)}function bt(e){return e===void 0||!Number.isFinite(e)?Ce:e.toString()}function Ko(e){if(!Array.isArray(e)||e.length===0)return Ce;const t=e.map(n=>Yo(n)).filter(n=>n.length>0);return t.length===0?Ce:t.join(" · ")}function Yo(e){const t=e.trim().toLowerCase();return t.length===0?"":t==="חורף"||t==="winter"||t==="a"||t==="א"||t==="semester a"?"חורף":t==="אביב"||t==="spring"||t==="b"||t==="ב"||t==="semester b"?"אביב":t==="קיץ"||t==="summer"||t==="c"||t==="ג"||t==="semester c"?"קיץ":e.trim()}function je(e){if(e===void 0)return;const t=e.trim();if(t.length!==0)return t}function Qo(e){const t=e.connections?.dependencies;if(!Array.isArray(t))return[];const n=[];for(const r of t){if(!Array.isArray(r))continue;const o=[];for(const s of r){if(typeof s!="string")continue;const a=s.trim().toUpperCase();a.length!==0&&(o.includes(a)||o.push(a))}o.length>0&&n.push(o)}return n}function yt(e){return Array.isArray(e)?e.map(t=>t.trim().toUpperCase()).filter(t=>t.length>0):[]}async function Qe(e,t){const n=Array.from(new Set(t)).filter(o=>o!==e);return n.length===0?[]:await Promise.all(n.map(async o=>{const s=await h.courses.get(o);return s!==void 0?s:{code:o,name:on}}))}async function Xo(e,t){return t.length===0?[]:Promise.all(t.map(async n=>Qe(e,n)))}async function Zo(e){const t=e.trim().toUpperCase();if(t.length===0)return[];const n=await h.courses.count();if(n===0)return[];const r=[];for(let o=0;o<n;o+=vt){const s=await h.courses.page(vt,o);if(s.length===0)break;for(const a of s)a.code!==t&&Jo(a,t)&&r.push(a)}return r}function Jo(e,t){const n=e.connections?.dependencies;if(!Array.isArray(n))return!1;for(const r of n)if(Array.isArray(r)){for(const o of r)if(typeof o=="string"&&o.trim().toUpperCase()===t)return!0}return!1}function fn(e,t,n,r){e.replaceChildren(),mn(t);const o=r.length,s=r.reduce((a,i)=>a+i.length,0);if(t.textContent=`${String(o)} חלופות · ${String(s)} קורסים`,o===0||s===0){n.classList.remove("hidden");return}n.classList.add("hidden");for(let a=0;a<r.length;a+=1){const i=r[a]??[];if(i.length===0)continue;const l=document.createElement("section");l.className="flex flex-col gap-3";const d=document.createElement("div");d.className="grid w-fit max-w-full grid-cols-[repeat(auto-fit,minmax(5rem,1fr))] justify-start gap-2 md:grid-cols-[repeat(auto-fit,minmax(7rem,1fr))] lg:grid-cols-[repeat(auto-fit,minmax(9rem,1fr))]";for(const c of i){const u=pn(c);d.append(u)}if(l.append(d),e.append(l),a<r.length-1){const c=document.createElement("div");c.className="flex items-center gap-2 py-1";const u=document.createElement("span");u.className="bg-border/80 h-px flex-1";const m=document.createElement("span");m.className="bg-border/80 h-px flex-1";const f=document.createElement("p");f.className="bg-surface-2 text-text-muted inline-flex w-fit items-center rounded-full px-3 py-1 text-xs",f.textContent="או",c.append(u,f,m),e.append(c)}}}function Q(e,t,n,r){if(e.replaceChildren(),mn(t),t.textContent=`${String(r.length)} קורסים`,r.length===0){n.classList.remove("hidden");return}n.classList.add("hidden");for(const o of r)e.append(pn(o))}function pn(e){const t=U(e),n=document.createElement("a");return n.href=`/course?code=${encodeURIComponent(e.code)}`,n.className="block",n.setAttribute("aria-label",`פתיחת הקורס ${e.code}`),n.append(t),n}const es=`<template>
    <article
        class="border-border/60 bg-surface-1/80 flex flex-col gap-4 rounded-3xl border p-5 shadow-sm lg:flex-row lg:items-start"
        data-component="LandingFeatureCard"
    >
        <div
            class="border-border/60 bg-surface-2/70 relative flex aspect-16/10 w-full items-center justify-center overflow-hidden rounded-2xl border lg:w-1/2"
            data-slot="media"
            data-skeleton="true"
        >
            <span
                class="skeleton-shimmer absolute inset-0"
                aria-hidden="true"
                data-skeleton-layer
            ></span>
        </div>
        <div class="flex w-full flex-col gap-2 lg:w-1/2" data-slot="content">
            <h2 class="text-lg font-medium" data-slot="title">
                <span
                    class="skeleton-shimmer block h-4 w-40 rounded-full"
                    aria-hidden="true"
                ></span>
            </h2>
            <p class="text-text-muted text-xs" data-slot="description">
                <span
                    class="skeleton-shimmer block h-3 w-full rounded-full"
                    aria-hidden="true"
                ></span>
                <span
                    class="skeleton-shimmer mt-2 block h-3 w-3/4 rounded-full"
                    aria-hidden="true"
                ></span>
            </p>
            <a
                class="text-accent text-xs font-medium"
                href="/"
                data-slot="link"
            >
                <span
                    class="skeleton-shimmer block h-3 w-20 rounded-full"
                    aria-hidden="true"
                ></span>
            </a>
        </div>
    </article>
</template>
`;function ts(e={}){const t=document.createElement("template");t.innerHTML=es;const n=t.content.firstElementChild;if(!(n instanceof HTMLTemplateElement))throw new Error("LandingFeatureCard template element not found");const r=n.content.firstElementChild?.cloneNode(!0);if(!(r instanceof HTMLElement))throw new Error("LandingFeatureCard template root not found");const o=r.querySelector('[data-slot="label"]');o!==null&&e.label!==void 0&&(o.textContent=e.label);const s=r.querySelector('[data-slot="title"]');s!==null&&e.title!==void 0&&(s.textContent=e.title);const a=r.querySelector('[data-slot="description"]');a!==null&&e.description!==void 0&&(a.textContent=e.description);const i=r.querySelector('[data-slot="link"]');if(i!==null&&e.linkLabel!==void 0&&(i.textContent=e.linkLabel),i!==null&&e.href!==void 0&&(i.href=e.href),e.mediaSrc!==void 0){const l=r.querySelector('[data-slot="media"]');if(l!==null){const d=document.createElement("img");d.className="h-full w-full object-cover",d.src=e.mediaSrc,d.loading="lazy",d.decoding="async",d.alt=e.mediaAlt??"תצוגת כרטיס",l.appendChild(d),l.removeAttribute("data-skeleton");const c=l.querySelector("[data-skeleton-layer]");c!==null&&c.remove()}}return r}const ns=`<template>
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
                    href="/catalog"
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
`;function rs(){const e=document.createElement("template");e.innerHTML=ns;const t=e.content.firstElementChild;if(!(t instanceof HTMLTemplateElement))throw new Error("LandingHero template element not found");const n=t.content.firstElementChild?.cloneNode(!0);if(!(n instanceof HTMLElement))throw new Error("LandingHero template root not found");return n}const os=`<template>
    <div class="relative" data-component="LandingNav">
        <header
            class="border-border/50 border-b bg-transparent pt-[env(safe-area-inset-top)] backdrop-blur-sm"
        >
            <div
                class="mx-auto flex items-center justify-between px-4 sm:px-6 lg:max-w-6xl lg:px-8"
            >
                <div class="order-3 flex items-center gap-3" data-slot="logo">
                    <svg class="size-16" aria-label="Planit" role="img">
                        <use data-title-use></use>
                    </svg>

                    <img class="size-10" alt="לוגו Planit" data-logo />
                </div>

                <nav
                    class="text-text order-2 hidden items-center gap-6 text-sm md:flex"
                    data-slot="links"
                >
                    <a
                        class="hover:text-text w-fit transition duration-200 ease-out"
                        href="/plan"
                    >
                        מתכנן
                    </a>
                    <a
                        class="hover:text-text w-fit transition duration-200 ease-out"
                        href="/catalog"
                    >
                        קטלוגים
                    </a>
                    <a
                        class="hover:text-text w-fit transition duration-200 ease-out"
                        href="/course"
                    >
                        קורסים
                    </a>
                    <a
                        class="hover:text-text w-fit transition duration-200 ease-out"
                        href="/search"
                    >
                        חיפוש
                    </a>
                </nav>

                <div
                    class="order-1 hidden items-center gap-3 md:flex"
                    data-slot="actions"
                >
                    <a
                        class="bg-accent text-accent-contrast rounded-full px-4 py-2 text-xs font-medium shadow-sm"
                        href="/catalog"
                    >
                        התחילו לתכנן
                    </a>
                </div>

                <button
                    class="text-text order-1 flex items-center gap-2 rounded-full px-3 py-2 text-xs font-medium md:hidden"
                    type="button"
                    data-action="toggle-menu"
                    aria-expanded="false"
                    aria-controls="landing-mobile-menu"
                >
                    <span class="sr-only">תפריט</span>
                    <span
                        class="flex h-4 w-5 flex-col justify-between"
                        aria-hidden="true"
                    >
                        <span class="bg-text h-0.5 w-full rounded-full"></span>
                        <span class="bg-text h-0.5 w-full rounded-full"></span>
                        <span class="bg-text h-0.5 w-full rounded-full"></span>
                    </span>
                </button>
            </div>
        </header>

        <div
            class="border-border/60 bg-surface-1/95 absolute inset-x-4 top-full z-40 mt-3 hidden rounded-2xl border p-4 shadow-sm backdrop-blur-lg sm:inset-x-6"
            role="dialog"
            aria-modal="true"
            id="landing-mobile-menu"
            data-role="mobile-menu"
        >
            <nav class="mt-6 flex flex-col items-start gap-4 text-base">
                <a class="hover:text-text" href="/plan">מתכנן</a>
                <a class="hover:text-text" href="/catalog">קטלוגים</a>
                <a class="hover:text-text" href="/course">קורסים</a>
                <a class="hover:text-text" href="/search">חיפוש</a>
            </nav>
            <div class="mt-6 flex flex-col gap-3">
                <a
                    class="bg-accent text-accent-contrast rounded-full px-4 py-3 text-center text-sm font-medium"
                    href="/catalog"
                >
                    התחילו לתכנן
                </a>
            </div>
        </div>
    </div>
</template>
`;function ss(){const e=document.createElement("template");e.innerHTML=os;const t=e.content.firstElementChild;if(!(t instanceof HTMLTemplateElement))throw new Error("LandingNav template element not found");const n=t.content.firstElementChild?.cloneNode(!0);if(!(n instanceof HTMLElement))throw new Error("LandingNav template root not found");const r=n.querySelector("[data-logo]");r!==null&&(r.src=Ot);const o=n.querySelector("[data-title-use]");o!==null&&o.setAttribute("href",Dt);const s=n.querySelectorAll('[data-action="toggle-menu"]');if(s.length===0)throw new Error("LandingNav toggleButtons not found");const a=n.querySelector('[data-role="mobile-menu"]');if(a===null)throw new Error("LandingNav mobile menu not found");return s.forEach(i=>{i.addEventListener("click",()=>{const l=a.classList.contains("hidden");a.classList.toggle("hidden",!l),s.forEach(d=>{d.setAttribute("aria-expanded",String(l))})})}),n}const as="/planit/assets/first-time-user-experience-desktop-chrome-dark-C8Tt3P28.webm",is="/planit/assets/first-time-user-experience-desktop-chrome-light-cLcxiEH0.webm",ls="/planit/assets/first-time-user-experience-mobile-chrome-dark-w4npPmPQ.webm",cs="/planit/assets/first-time-user-experience-mobile-chrome-light-CScYk0EJ.webm",ds=`<template>
    <div data-component="LandingPage">
        <div data-landing-nav></div>
        <main
            class="mx-auto flex min-h-screen max-w-6xl flex-col gap-12 px-4 pt-20 pb-[calc(env(safe-area-inset-bottom)+3rem)] sm:px-6 lg:px-8"
        >
            <div data-landing-hero></div>

            <section class="mt-20 flex flex-col">
                <div
                    class="border-border/60 bg-surface-2/70 relative flex items-center justify-center overflow-hidden rounded-2xl border"
                    data-video-placeholder
                    data-skeleton="true"
                >
                    <video
                        class="h-auto w-full object-contain opacity-0 transition duration-300 ease-out dark:hidden md:hidden"
                        data-landing-demo-video="mobile-light"
                        aria-label="הדגמת משתמש חדשה - מובייל בהיר"
                        width="430"
                        height="932"
                        autoplay
                        muted
                        loop
                        playsinline
                        preload="metadata"
                        controls
                    >
                        <track
                            kind="captions"
                            srclang="he"
                            label="כתוביות"
                            src="data:text/vtt;charset=utf-8,WEBVTT"
                        />
                    </video>
                    <video
                        class="hidden h-auto w-full object-contain opacity-0 transition duration-300 ease-out dark:block md:hidden!"
                        data-landing-demo-video="mobile-dark"
                        aria-label="הדגמת משתמש חדשה - מובייל כהה"
                        width="430"
                        height="932"
                        autoplay
                        muted
                        loop
                        playsinline
                        preload="metadata"
                        controls
                    >
                        <track
                            kind="captions"
                            srclang="he"
                            label="כתוביות"
                            src="data:text/vtt;charset=utf-8,WEBVTT"
                        />
                    </video>
                    <video
                        class="hidden h-auto w-full object-contain opacity-0 transition duration-300 ease-out md:block dark:md:hidden"
                        data-landing-demo-video="desktop-light"
                        aria-label="הדגמת משתמש חדשה - דסקטופ בהיר"
                        width="1400"
                        height="1050"
                        autoplay
                        muted
                        loop
                        playsinline
                        preload="metadata"
                        controls
                    >
                        <track
                            kind="captions"
                            srclang="he"
                            label="כתוביות"
                            src="data:text/vtt;charset=utf-8,WEBVTT"
                        />
                    </video>
                    <video
                        class="hidden h-auto w-full object-contain opacity-0 transition duration-300 ease-out dark:md:block"
                        data-landing-demo-video="desktop-dark"
                        aria-label="הדגמת משתמש חדשה - דסקטופ כהה"
                        width="1400"
                        height="1050"
                        autoplay
                        muted
                        loop
                        playsinline
                        preload="metadata"
                        controls
                    >
                        <track
                            kind="captions"
                            srclang="he"
                            label="כתוביות"
                            src="data:text/vtt;charset=utf-8,WEBVTT"
                        />
                    </video>
                    <span
                        class="skeleton-shimmer absolute inset-0"
                        aria-hidden="true"
                        data-skeleton-layer
                    ></span>
                    <div
                        class="text-text-muted bg-surface-1/75 border-border/60 absolute inset-x-6 bottom-6 hidden rounded-xl border px-4 py-3 text-xs"
                        data-video-fallback
                    >
                        ההדגמה תיטען כשיהיה חיבור יציב. אפשר להמשיך לקטלוג כבר
                        עכשיו.
                    </div>
                </div>
            </section>

            <section class="flex flex-col gap-6">
                <div class="grid gap-4 lg:grid-cols-2">
                    <div data-landing-feature-card="plan"></div>
                    <div data-landing-feature-card="catalog"></div>
                    <div data-landing-feature-card="search"></div>
                    <div data-landing-feature-card="semester"></div>
                </div>
                <div data-landing-feature-card="course"></div>
            </section>

            <section
                class="border-border/60 bg-surface-1/80 flex flex-col items-start gap-4 rounded-3xl border p-6 shadow-sm"
            >
                <div class="flex flex-col gap-2">
                    <h2 class="text-2xl font-medium">הצעד הבא בתכנון התואר.</h2>
                    <p class="text-text-muted text-sm">
                        התחילו עם המסלול שלכם וראו איך כל סמסטר מתחבר לתמונה.
                    </p>
                </div>
                <div class="flex flex-wrap gap-3">
                    <a
                        class="bg-accent text-accent-contrast rounded-full px-5 py-2 text-xs font-medium shadow-sm"
                        href="/catalog"
                    >
                        התחילו עכשיו
                    </a>
                    <a
                        class="border-border/70 bg-surface-2/70 text-text-muted hover:border-accent/40 hover:text-text rounded-full border px-5 py-2 text-xs font-medium transition duration-200 ease-out"
                        href="/catalog"
                    >
                        בחירת מסלול
                    </a>
                </div>
            </section>
        </main>
    </div>
</template>
`,Ct={"desktop-dark":as,"desktop-light":is,"mobile-dark":ls,"mobile-light":cs};function us(){const e=document.createElement("template");e.innerHTML=ds;const t=e.content.firstElementChild;if(!(t instanceof HTMLTemplateElement))throw new Error("LandingPage template element not found");const n=t.content.firstElementChild?.cloneNode(!0);if(!(n instanceof HTMLElement))throw new Error("LandingPage template root not found");const r=n.querySelector("[data-landing-nav]");r!==null&&r.replaceWith(ss());const o=n.querySelector("[data-landing-hero]");o!==null&&o.replaceWith(rs());const s={plan:{label:"מתכנן סמסטר",title:"תכננו את ההרכבה",description:"גררו קורסים, בדקו עומס וראו תמונה מלאה של הסמסטרים.",href:"/plan",linkLabel:"מעבר למתכנן →",mediaAlt:"תצוגת מתכנן"},catalog:{label:"קטלוגים",title:"כל הדרישות במקום אחד",description:"בחרו מסלול, בדקו דרישות חובה ובחרו תמהיל מתאים.",href:"/catalog",linkLabel:"בדיקת קטלוגים →",mediaAlt:"תצוגת קטלוג"},search:{label:"חיפוש",title:"מצאו קורסים מהר",description:"חיפוש מתקדם עם פילטרים, דרישות קדם והצעות.",href:"/search",linkLabel:"לפתיחת חיפוש →",mediaAlt:"תצוגת חיפוש"},semester:{label:"סמסטרים",title:"מעקב לכל תקופה",description:"תיעוד עומסים, נקודות זכות, ושינויים בין סמסטרים.",href:"/semester",linkLabel:"מעבר לסמסטר →",mediaAlt:"תצוגת סמסטר"},course:{label:"פרטי קורס",title:"כל פרט במקום אחד",description:'תיאור, נק"ז, תנאי קדם וביקוש — בלי לעבור בין אתרים.',href:"/course",linkLabel:"לפרטי קורס →",mediaAlt:"תצוגת קורס"}};return n.querySelectorAll("[data-landing-feature-card]").forEach(l=>{const d=l.dataset.landingFeatureCard;if(d===void 0)return;const c=s[d],u=ts({label:c.label,title:c.title,description:c.description,href:c.href,linkLabel:c.linkLabel,mediaAlt:c.mediaAlt});l.replaceWith(u)}),n.querySelectorAll("[data-feature-media], [data-hero-media]").forEach(l=>{l.dataset.videoReady="false"}),ms(n),n}function ms(e){const t=e.querySelector("[data-video-placeholder]"),n=e.querySelectorAll("[data-landing-demo-video]"),r=e.querySelector("[data-skeleton-layer]"),o=e.querySelector("[data-video-fallback]");if(t===null||n.length===0||r===null)return;const s=t,a=r,i=Array.from(n);i.forEach(c=>{const u=c.dataset.landingDemoVideo;u!==void 0&&(c.src=fs(u))});function l(){i.forEach(c=>{c.classList.remove("opacity-0")}),s.dataset.skeleton="false",a.classList.add("hidden"),o?.classList.add("hidden")}function d(){a.classList.remove("skeleton-shimmer"),a.classList.add("bg-surface-2/70"),o?.classList.remove("hidden")}if(i.some(c=>c.readyState>=2)){l();return}i.forEach(c=>{c.addEventListener("loadeddata",l,{once:!0}),c.addEventListener("error",d,{once:!0})})}function fs(e){if(e in Ct)return Ct[e];throw new Error(`Unsupported landing demo variant: "${e}"`)}const ps=`<template>
    <section class="text-text min-h-screen w-full">
        <main
            class="mx-auto flex min-h-screen w-full max-w-5xl flex-col items-start justify-center gap-6 px-4 pt-[calc(env(safe-area-inset-top)+2rem)] pb-[calc(env(safe-area-inset-bottom)+2rem)] sm:px-6 lg:px-8"
        >
            <p class="text-text-muted text-xs" data-slot="path">/404</p>
            <h1 class="text-3xl font-medium">העמוד לא נמצא</h1>
            <p class="text-text-muted max-w-2xl text-sm">
                הנתיב המבוקש אינו קיים. אפשר לחזור לעמוד הבית.
            </p>
            <a
                class="bg-accent text-accent-contrast rounded-full px-5 py-2 text-xs font-medium"
                href="/"
            >
                חזרה לעמוד הבית
            </a>
        </main>
    </section>
</template>
`;function hs(e="/404"){const t=document.createElement("template");t.innerHTML=ps;const n=t.content.firstElementChild;if(!(n instanceof HTMLTemplateElement))throw new Error("NotFoundPage template element not found");const r=n.content.firstElementChild?.cloneNode(!0);if(!(r instanceof HTMLElement))throw new Error("NotFoundPage template root not found");const o=r.querySelector('[data-slot="path"]');return o!==null&&(o.textContent=e),r}const gs=`<template>
    <section class="text-text min-h-screen w-full" data-page="plan">
        <div data-console-nav></div>
        <main
            class="mx-auto flex min-h-screen w-full flex-col gap-5 px-4 pt-5 pb-[calc(env(safe-area-inset-bottom)+1.5rem)] sm:px-6 lg:max-w-6xl lg:px-8"
        >
            <section class="flex flex-col gap-4">
                <div class="flex flex-wrap items-center gap-2 sm:gap-3">
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
                    <label
                        class="border-border/60 bg-surface-1/70 text-text-muted flex items-center gap-2 rounded-full border px-3 py-1 text-xs"
                    >
                        <span>סמסטר נוכחי</span>
                        <select
                            class="focus-visible:ring-accent/60 bg-surface-2/80 text-text max-w-36 rounded-lg px-2 py-1 text-xs focus-visible:ring-2"
                            data-current-semester-select
                        ></select>
                    </label>
                </div>

                <p
                    class="text-warning hidden text-xs"
                    role="status"
                    aria-live="polite"
                    data-plan-warning
                ></p>

                <div
                    class="flex w-full flex-col gap-3"
                    data-semester-rail
                ></div>

                <template data-role="row-course-list-template">
                    <div
                        class="grid w-fit max-w-full grid-cols-[repeat(auto-fit,minmax(5rem,1fr))] justify-start gap-2 md:grid-cols-[repeat(auto-fit,minmax(7rem,1fr))] lg:grid-cols-[repeat(auto-fit,minmax(9rem,1fr))]"
                        data-row-course-list
                    ></div>
                </template>
            </section>

            <section class="flex flex-col gap-2">
                <div class="flex items-center justify-between gap-2">
                    <h3 class="text-sm font-medium">בעיות תזמון</h3>
                    <span class="text-text-muted text-xs" data-problems-count
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
        </main>
    </section>
</template>
`,xs=3,ae=3,vs=6,ws="wishlist",bs="exemptions",ys="רשימת משאלות",Cs="פטורים",Ss="קורס",He=["אביב","קיץ","חורף"],Es={אביב:"אביב",קיץ:"קיץ",חורף:"חורף"},ks=[{code:"104031",name:"חשבון אינפיניטסימלי 1",points:5,median:78,seasons:["חורף","אביב"],tests:[{year:2025,monthIndex:1,day:15}]},{code:"104166",name:"אלגברה לינארית 1",points:5,median:74,seasons:["חורף","אביב"],tests:[{year:2025,monthIndex:5,day:20}]},{code:"234114",name:"מבוא למדעי המחשב",points:4,median:81,seasons:["אביב","קיץ"],tests:[null]},{code:"234124",name:"מבני נתונים",points:4,median:76,seasons:["חורף","אביב"],tests:[{year:2025,monthIndex:8,day:3}]},{code:"044252",name:"מערכות ספרתיות",points:3,median:79,seasons:["חורף"],tests:[{year:2025,monthIndex:11,day:10}]},{code:"236363",name:"מערכות הפעלה",points:3,median:82,seasons:["אביב"],tests:[{year:2025,monthIndex:7,day:27}]},{code:"236360",name:"תורת הקומפילציה",points:3,median:75,seasons:["חורף"],tests:[null]},{code:"236350",name:"בסיסי נתונים",points:3,median:84,seasons:["אביב","קיץ"],tests:[{year:2024,monthIndex:6,day:19}]},{code:"236501",name:"מבוא לבינה מלאכותית",points:3,median:87,seasons:["אביב"],tests:[{year:2024,monthIndex:5,day:8}]},{code:"236299",name:"פרויקט תכנה",points:2,median:90,seasons:["קיץ"],tests:[null]}];function Ls(){const e=vs;return{semesterCount:e,currentSemester:0,semesters:Pe(e).map(t=>({...t,courses:[]})),wishlist:[],exemptions:[],problems:[]}}function Pe(e){const t=Math.max(ae,Math.floor(e)),n=2026,r=[];for(let o=0;o<t;o+=1){const s=He[o%He.length],a=Math.floor((o+1)/He.length),i=n+a;r.push({id:`${s}-${i}-${o}`,title:`${Es[s]} ${i}`,season:s,year:i})}return r}function As(){const e=document.createElement("template");e.innerHTML=gs;const t=e.content.firstElementChild;if(!(t instanceof HTMLTemplateElement))throw new Error("PlanPage template element not found");const n=t.content.firstElementChild?.cloneNode(!0);if(!(n instanceof HTMLElement))throw new Error("PlanPage template root not found");const r=n.querySelector("[data-console-nav]");r!==null&&r.replaceWith(de({activePath:"/plan"}));const o=n.querySelector("[data-semester-rail]"),s=n.querySelector("[data-plan-warning]"),a=n.querySelector("[data-schedule-problems]"),i=n.querySelector("[data-problems-count]"),l=n.querySelector("[data-semester-count]"),d=n.querySelector("[data-current-semester-select]"),c=n.querySelector("[data-role='row-course-list-template']");if(o===null||s===null||a===null||i===null||l===null||d===null||c===null)throw new Error("PlanPage required elements not found");const u=Ls();return l.value=u.semesterCount.toString(),l.addEventListener("change",()=>{const m=ot(u),f=wn(l.value,m);l.value=f.toString(),js(u,f),Ze(u),we(u,o,s,a,i,l,d,c)}),d.addEventListener("change",()=>{u.currentSemester=J(d.value,u.semesters.length),Ze(u),we(u,o,s,a,i,l,d,c)}),n.addEventListener("mouseover",m=>{const f=m.target;if(!(f instanceof Element))return;const p=f.closest("[data-test-course-code]");if(p===null)return;const g=p.dataset.testCourseCode;g!==void 0&&kt(o,u,g,!0)}),n.addEventListener("mouseout",m=>{const f=m.target;if(!(f instanceof Element))return;const p=f.closest("[data-test-course-code]");if(p===null)return;const g=m.relatedTarget;if(g instanceof Node&&p.contains(g))return;const v=p.dataset.testCourseCode;v!==void 0&&kt(o,u,v,!1)}),o.addEventListener("click",m=>{const f=m.target;if(!(f instanceof Element)||f.closest("[data-semester-link]")!==null)return;const g=f.closest("[data-course-action]");if(f.closest("[data-cancel-selection]")!==null){Gs(u,o);return}if(g!==null){const y=g.dataset.rowId,A=g.dataset.courseCode;if(y===void 0||A===void 0)return;Ws(u,y,A,o);return}const E=f.closest("[data-plan-row]")?.dataset.rowId;E!==void 0&&Ks(u,E,o)}),we(u,o,s,a,i,l,d,c),qs(u,o,s,a,i,l,d,c),n}async function qs(e,t,n,r,o,s,a,i){const[l,d]=await Promise.all([h.userPlan.get().catch(()=>{}),h.courses.page(18,0).catch(()=>[])]),c=Xs(d.length>0?d:ks),u=Zs(c),m=await Js(l?.value,u);m!==void 0?(e.semesterCount=m.semesters.length,e.currentSemester=m.currentSemester,e.semesters=m.semesters,e.wishlist=m.wishlist,e.exemptions=m.exemptions):e.semesters=Qs(c,e.semesterCount);const f=ea(e.semesters);f!==void 0&&(e.warning=f),we(e,t,n,r,o,s,a,i)}function we(e,t,n,r,o,s,a,i){e.currentSemester=J(String(e.currentSemester),e.semesters.length),s.min=ot(e).toString(),s.value=e.semesterCount.toString(),Ps(e,a),e.warning!==void 0&&e.warning.length>0?(n.textContent=e.warning,n.classList.remove("hidden")):(n.textContent="",n.classList.add("hidden")),e.problems=$s(e.semesters),Hs(e.problems,r,o),t.replaceChildren();for(const l of gn(e)){const d=Is(e,l,i);t.append(d)}hn(e,t),Te(t,e.selected?.rowId)}function J(e,t){const n=Number.parseInt(e,10);if(!Number.isFinite(n))return 0;const r=Math.max(1,t);return Math.max(0,Math.min(r-1,n))}function Ps(e,t){const n=J(String(e.currentSemester),e.semesters.length);e.currentSemester=n,t.replaceChildren(),e.semesters.forEach((r,o)=>{const s=document.createElement("option");s.value=String(o),s.textContent=r.title,o===n&&(s.selected=!0),t.append(s)})}function hn(e,t){const n=t.querySelector('[data-plan-row][data-current-semester-row="true"]');if(n===null)return;const r=n.querySelector('[data-tests-track="0"]'),o=n.querySelector('[data-tests-track="1"]'),s=n.querySelector("[data-tests-empty]");if(r===null||o===null||s===null)return;r.replaceChildren(),o.replaceChildren();const a=e.semesters.at(e.currentSemester);if(a===void 0){s.classList.remove("hidden");return}const i=St(a.courses,0),l=St(a.courses,1),d=i.length>0||l.length>0;s.classList.toggle("hidden",d),Et(r,i),Et(o,l)}function St(e,t){const n=[];for(const r of e){const o=r.tests?.[t];o!=null&&n.push({courseCode:r.code,date:o})}return n.sort((r,o)=>{const s=Date.UTC(r.date.year,r.date.monthIndex,r.date.day),a=Date.UTC(o.date.year,o.date.monthIndex,o.date.day);return s-a}),n}function Et(e,t){t.forEach((n,r)=>{const o=document.createElement("span");o.className="text-accent-contrast inline-flex h-5 shrink-0 items-center justify-center rounded-none px-0.5 text-xs tabular-nums",o.dataset.testCourseCode=n.courseCode,o.style.backgroundColor=Ms(n.courseCode),o.textContent=r===0?Ns(n.date):String(Ts(t[r-1].date,n.date)),e.append(o)})}function Ts(e,t){const n=Date.UTC(e.year,e.monthIndex,e.day),r=Date.UTC(t.year,t.monthIndex,t.day);return Math.round((r-n)/864e5)}function Ns(e){return`${String(e.day)}/${String(e.monthIndex+1)}`}function kt(e,t,n,r){const o=t.semesters.at(t.currentSemester);if(o===void 0)return;const s=e.querySelector(`[data-course-action][data-current-semester-course="true"][data-row-id="${CSS.escape(o.id)}"][data-course-code="${CSS.escape(n)}"]`);s!==null&&(s.classList.toggle("ring-2",r),s.classList.toggle("ring-accent/70",r))}function Ms(e){const t=e.trim();if(t.length===0)return"hsl(168 56% 46%)";let n=2166136261;for(let a=0;a<t.length;a+=1)n^=t.charCodeAt(a),n=Math.imul(n,16777619);n>>>=0;const r=n%360,o=58+(n>>>9)%18,s=42+(n>>>17)%16;return`hsl(${r} ${o}% ${s}%)`}function gn(e){return[...e.semesters.map((n,r)=>({id:n.id,title:n.title,kind:"semester",courses:n.courses,season:n.season,semesterNumber:r+1})),{id:ws,title:ys,kind:"wishlist",courses:e.wishlist},{id:bs,title:Cs,kind:"exemptions",courses:e.exemptions}]}function Is(e,t,n){const r=document.createElement("section");r.className="border-border/50 bg-semester-surface flex flex-col gap-3 rounded-2xl border p-3 sm:p-4",r.dataset.planRow="true",r.dataset.rowId=t.id,r.dataset.rowKind=t.kind;const o=t.kind==="semester"&&t.semesterNumber===e.currentSemester+1;o&&(r.dataset.currentSemesterRow="true");const s=document.createElement("header");s.className="flex flex-col gap-2";const a=document.createElement("div");a.className="flex flex-wrap items-center gap-2";const i=document.createElement("p");i.className="text-sm font-medium whitespace-nowrap",i.textContent=t.title,o&&i.classList.add("underline","decoration-accent","decoration-2");const l=Us(t),d=document.createElement("div");d.className="text-text-muted flex flex-wrap items-center gap-x-3 gap-y-1 text-xs",d.dataset.rowMetrics="true",d.dataset.rowId=t.id,vn(d,t);const c=document.createElement("p");c.className="border-accent/40 bg-accent/10 text-accent min-h-7 rounded-xl border px-2 py-1 text-xs opacity-0 transition-opacity duration-200 ease-out invisible pointer-events-none",c.textContent="העברה",c.dataset.moveTarget="true",c.dataset.rowId=t.id;const u=document.createElement("button");u.type="button",u.className="border-border/60 bg-surface-1/70 text-text-muted hover:border-accent/50 hover:text-text ms-auto min-h-7 rounded-xl border px-2 py-1 text-xs opacity-0 transition-opacity duration-200 ease-out invisible pointer-events-none touch-manipulation",u.textContent="ביטול",u.dataset.cancelSelection="true",u.dataset.rowId=t.id,o&&t.kind==="semester"&&xn(d),l!==void 0?a.append(i,l,c,u):a.append(i,c,u),s.append(a,d);const m=Rs(n);for(const f of t.courses)m.append(_s(e,t,f));return r.append(s,m),r}function xn(e){const t=document.createElement("div");t.className="flex flex-wrap items-center gap-x-3 gap-y-1",t.dataset.testsSchedule="true";const n=document.createElement("div");n.className="flex shrink-0 items-center gap-1",n.dataset.testRow="0";const r=document.createElement("p");r.className="text-text-muted shrink-0 text-xs",r.textContent="מועדי א׳:";const o=document.createElement("div");o.className="flex min-h-7 flex-wrap items-center gap-1",o.dataset.testsTrack="0",n.append(r,o);const s=document.createElement("div");s.className="flex shrink-0 items-center gap-1",s.dataset.testRow="1";const a=document.createElement("p");a.className="text-text-muted shrink-0 text-xs",a.textContent="מועדי ב׳:";const i=document.createElement("div");i.className="flex min-h-7 flex-wrap items-center gap-1",i.dataset.testsTrack="1",s.append(a,i);const l=document.createElement("p");l.className="text-text-muted hidden text-xs",l.dataset.testsEmpty="true",l.textContent="אין מועדי בחינות ידועים בסמסטר הנוכחי.",l.classList.add("w-full"),t.append(n,s,l),e.append(t)}function Rs(e){const t=e.content.firstElementChild?.cloneNode(!0);if(!(t instanceof HTMLElement))throw new Error("PlanPage row course list template root not found");return t}function _s(e,t,n){const r=document.createElement("button");r.type="button",r.className="focus-visible:ring-accent/60 w-full rounded-2xl text-start transition duration-200 ease-out focus-visible:ring-2",r.dataset.courseAction="true",r.dataset.courseCode=n.code,r.dataset.rowId=t.id,t.kind==="semester"&&t.semesterNumber===e.currentSemester+1&&(r.dataset.currentSemesterCourse="true");const s=e.selected?.courseCode===n.code&&e.selected.rowId===t.id;ie(r,s);const a=U(n),i=a.querySelector('[data-component="CourseCard"]');return i!==null&&i.classList.add("hover:border-accent/40"),r.append(a),r}function ve(e,t){const n=document.createElement("p");return n.className="text-text-muted rounded-xl px-1 py-1",n.textContent=`${e}: ${t}`,n}function Us(e){if(e.kind!=="semester"||e.semesterNumber===void 0)return;const t=document.createElement("a");return t.href=`/semester?number=${String(e.semesterNumber)}`,t.className="border-border/60 bg-surface-1/70 text-text-muted hover:border-accent/50 hover:text-text focus-visible:ring-accent/60 touch-manipulation rounded-xl border px-2 py-1 text-xs transition duration-200 ease-out focus-visible:ring-2",t.textContent="פתיחה",t.dataset.semesterLink="true",t.dataset.semesterNumber=String(e.semesterNumber),t}function vn(e,t){if(e.replaceChildren(),t.kind==="semester"){const n=Ds(t.courses);e.append(ve("נק״ז",n.totalPoints)),e.append(ve("חציון",n.avgMedian)),e.append(ve("מבחנים",n.testsCount));return}e.append(ve("קורסים",String(t.courses.length)))}function Lt(e,t,n){const r=t.querySelector(`[data-row-metrics][data-row-id="${CSS.escape(n)}"]`),o=Xe(e,n);r===null||o===void 0||(vn(r,o),Os(e,o)&&xn(r))}function Os(e,t){return t.kind==="semester"&&t.semesterNumber===e.currentSemester+1}function Ds(e){let t=0,n=0,r=0,o=0;for(const s of e)typeof s.points=="number"&&Number.isFinite(s.points)&&(t+=s.points),typeof s.median=="number"&&Number.isFinite(s.median)&&(n+=s.median,r+=1),Array.isArray(s.tests)&&s.tests.some(a=>a!==null)&&(o+=1);return{totalPoints:t.toString(),avgMedian:r>0?(n/r).toFixed(1):"—",testsCount:o.toString()}}function Fs(e,t){if(!(!Array.isArray(e.seasons)||e.seasons.length===0)&&!e.seasons.includes(t))return"הקורס לרוב לא נפתח בעונה זו"}function wn(e,t=ae){const n=Number.parseInt(e,10),r=Math.max(ae,Math.floor(t));return Number.isNaN(n)?r:Math.max(r,n)}function ot(e){for(let t=e.semesters.length-1;t>=0;t-=1)if(e.semesters[t].courses.length>0)return Math.max(ae,t+1);return ae}function js(e,t){const n=ot(e),r=Math.max(n,Math.floor(t));if(r===e.semesterCount)return;const s=Pe(r).map(i=>({...i,courses:[]}));e.semesters.forEach((i,l)=>{const d=Math.min(l,s.length-1);s[d].courses.push(...i.courses)});const a=e.selected?.courseCode;if(e.semesterCount=r,e.semesters=s,e.currentSemester=J(String(e.currentSemester),s.length),a!==void 0){const i=s.find(l=>l.courses.some(d=>d.code===a));i!==void 0?e.selected={rowId:i.id,courseCode:a}:e.selected=void 0}}function Hs(e,t,n){if(n.textContent=e.length.toString(),t.replaceChildren(),e.length===0){const r=document.createElement("li");r.textContent="לא זוהו בעיות כרגע.",t.append(r);return}for(const r of e){const o=document.createElement("li");o.className="text-warning",o.textContent=r,t.append(o)}}function $s(e){const t=[],n=new Set,r=new Set;for(const o of e)for(const s of o.courses)n.add(s.code);for(const o of e){for(const s of o.courses){const a=Fs(s,o.season);a!==void 0&&t.push(`${s.code}: ${a} (${o.title})`);const i=zs(s,r);i!==void 0&&t.push(`${s.code}: ${i} (${o.title})`);const l=Bs(s,n);l!==void 0&&t.push(`${s.code}: ${l} (${o.title})`)}for(const s of o.courses)r.add(s.code)}return Array.from(new Set(t))}function zs(e,t){const n=e.connections?.dependencies;if(!Array.isArray(n)||n.length===0)return;const r=n.filter(a=>Array.isArray(a)&&a.length>0).map(a=>a.filter(i=>typeof i=="string"));if(r.length===0||r.some(a=>a.every(i=>t.has(i))))return;const s=r[0].filter(a=>!t.has(a));return s.length===0?"דרישות קדם אינן מסופקות":`דרישות קדם חסרות: ${s.join(", ")}`}function Bs(e,t){const n=e.connections?.exclusive;if(!Array.isArray(n)||n.length===0)return;const r=n.filter(o=>t.has(o));if(r.length!==0)return`חפיפה לקורסים הדדיים: ${r.join(", ")}`}function ie(e,t){if(t){e.classList.add("ring-accent/50","ring-2");return}e.classList.remove("ring-accent/50","ring-2")}function Se(e,t,n){return e.querySelector(`[data-course-action][data-row-id="${CSS.escape(t)}"][data-course-code="${CSS.escape(n)}"]`)??void 0}function Te(e,t){const n=e.querySelectorAll("[data-move-target]");for(const s of n){const a=s.dataset.rowId,i=t!==void 0&&a!==void 0&&a!==t;s.classList.toggle("invisible",!i),s.classList.toggle("opacity-0",!i),s.classList.toggle("pointer-events-none",!i)}const r=e.querySelectorAll("[data-cancel-selection]");for(const s of r){const a=t!==void 0;s.classList.toggle("invisible",!a),s.classList.toggle("opacity-0",!a),s.classList.toggle("pointer-events-none",!a)}const o=e.querySelectorAll("[data-plan-row]");for(const s of o){const a=t!==void 0&&s.dataset.rowId!==void 0&&s.dataset.rowId!==t;s.classList.toggle("!bg-surface-2/80",a),s.classList.toggle("!border-accent/40",a)}}function Gs(e,t){if(e.selected===void 0)return;const n=Se(t,e.selected.rowId,e.selected.courseCode);n!==void 0&&ie(n,!1),e.selected=void 0,Te(t,void 0)}function Vs(e,t){return e.querySelector(`[data-plan-row][data-row-id="${CSS.escape(t)}"]`)?.querySelector("[data-row-course-list]")??void 0}function Ws(e,t,n,r){if(e.selected?.rowId===t&&e.selected.courseCode===n){Ys(n);return}const s=e.selected;if(s!==void 0){const i=Se(r,s.rowId,s.courseCode);i!==void 0&&ie(i,!1)}e.selected={rowId:t,courseCode:n};const a=Se(r,t,n);a!==void 0&&ie(a,!0),Te(r,t)}function Xe(e,t){return gn(e).find(n=>n.id===t)}async function Ks(e,t,n){if(e.selected===void 0)return;const r=e.selected.courseCode,o=e.selected.rowId,s=Xe(e,o),a=Xe(e,t);if(s===void 0||a===void 0||s.id===a.id)return;const i=s.courses.findIndex(u=>u.code===r);if(i<0)return;const[l]=s.courses.splice(i,1);a.courses.push(l);const d=Se(n,o,r),c=Vs(n,t);d!==void 0&&c!==void 0&&(d.dataset.rowId=t,ie(d,!1),c.append(d)),Lt(e,n,o),Lt(e,n,t),hn(e,n),e.selected=void 0,Te(n,void 0),await Ze(e)}function Ys(e){const t=new URL("/course",window.location.origin);t.searchParams.set("code",e),window.history.pushState(null,"",t),window.dispatchEvent(new PopStateEvent("popstate"))}function Qs(e,t){const n=Pe(t).map(r=>({...r,courses:[]}));return e.forEach((r,o)=>{const s=o%n.length;n[s].courses.push(r)}),n}function Xs(e){const t=[],n=new Set;for(const r of e)n.has(r.code)||(n.add(r.code),t.push(r));return t}function Zs(e){const t=new Map;for(const n of e)t.set(n.code,n);return t}async function Js(e,t){if(typeof e!="object"||e===null)return;const n=e,r=Number(n.version);if(!Array.isArray(n.semesters)||r!==1&&r!==2&&r!==3)return;const o=wn(String(n.semesterCount??n.semesters.length)),s=Pe(o).map(c=>({...c,courses:[]}));for(const[c,u]of n.semesters.entries()){const m=s.find(p=>p.id===u.id)??s.at(c);if(m===void 0)continue;const f=Array.isArray(u.courseCodes)?u.courseCodes:[];for(const p of f){const g=await $e(t,p);g!==void 0&&m.courses.push(g)}}const a=Array.isArray(n.wishlistCourseCodes)?n.wishlistCourseCodes:[],i=Array.isArray(n.exemptionsCourseCodes)?n.exemptionsCourseCodes:[],[l,d]=await Promise.all([Promise.all(a.map(c=>$e(t,c))),Promise.all(i.map(c=>$e(t,c)))]);return{currentSemester:J(String(n.currentSemester??0),s.length),semesters:s,wishlist:l.filter(c=>c!==void 0),exemptions:d.filter(c=>c!==void 0)}}async function $e(e,t){const n=e.get(t);if(n!==void 0)return n;const r=await h.courses.get(t).catch(()=>{});if(r!==void 0)return e.set(t,r),r;const o={code:t,name:`${Ss} ${t}`};return e.set(t,o),o}function ea(e){const t=new Set;let n=0;for(const r of e)r.courses=r.courses.filter(o=>t.has(o.code)?(n+=1,!1):(t.add(o.code),!0));if(n!==0)return`זוהו ${String(n)} כפילויות בתכנית והן אוחדו למיקום יחיד.`}async function Ze(e){const t={version:xs,semesterCount:e.semesterCount,currentSemester:J(String(e.currentSemester),e.semesters.length),semesters:e.semesters.map(n=>({id:n.id,courseCodes:n.courses.map(r=>r.code)})),wishlistCourseCodes:e.wishlist.map(n=>n.code),exemptionsCourseCodes:e.exemptions.map(n=>n.code)};await h.userPlan.set(t).catch(()=>{})}const ta=`<template>
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
`,na=220;function ra(){const e=document.createElement("template");e.innerHTML=ta;const t=e.content.firstElementChild;if(!(t instanceof HTMLTemplateElement))throw new Error("SearchPage template element not found");const n=t.content.firstElementChild?.cloneNode(!0);if(!(n instanceof HTMLElement))throw new Error("SearchPage template root not found");const r=n.querySelector("[data-console-nav]");r!==null&&r.replaceWith(de({activePath:"/search"}));const o=oa(n),s=sa();return aa(o,s),ia(o,s),xa(o.sync),la(o,s),va(s,o),P(o,s,!1),n}function oa(e){const t=e.querySelector("[data-search-form]"),n=e.querySelector("[data-search-input]"),r=e.querySelector("[data-filter-available]"),o=e.querySelector("[data-filter-faculty]"),s=e.querySelector("[data-filter-requirement]"),a=e.querySelector("[data-filter-points-min]"),i=e.querySelector("[data-filter-points-max]"),l=e.querySelector("[data-filter-median-min]"),d=e.querySelector("[data-search-status]"),c=e.querySelector("[data-search-sync]"),u=e.querySelector("[data-search-empty]"),m=e.querySelector("[data-search-results]");if(t===null||n===null||r===null||o===null||s===null||a===null||i===null||l===null||d===null||c===null||u===null||m===null)throw new Error("SearchPage required elements not found");return{form:t,input:n,available:r,faculty:o,requirement:s,pointsMin:a,pointsMax:i,medianMin:l,status:d,sync:c,empty:u,results:m}}function sa(){const e=new URL(window.location.href);return{query:L(e.searchParams.get("q")??""),availableOnly:e.searchParams.get("available")==="1",faculty:L(e.searchParams.get("faculty")??""),requirement:L(e.searchParams.get("requirement")??""),pointsMin:L(e.searchParams.get("pointsMin")??""),pointsMax:L(e.searchParams.get("pointsMax")??""),medianMin:L(e.searchParams.get("medianMin")??""),debounceId:void 0,requestId:0,requirementCodes:new Map,totalCourses:void 0}}function aa(e,t){e.input.value=t.query,e.available.checked=t.availableOnly,e.faculty.value=t.faculty,e.requirement.value=t.requirement,e.pointsMin.value=t.pointsMin,e.pointsMax.value=t.pointsMax,e.medianMin.value=t.medianMin}function ia(e,t){e.form.addEventListener("submit",n=>{n.preventDefault(),t.query=L(e.input.value),ze(t),P(e,t,!0)}),e.input.addEventListener("input",()=>{t.query=L(e.input.value),ze(t),t.debounceId=window.setTimeout(()=>{t.debounceId=void 0,P(e,t,!0)},na)}),e.input.addEventListener("keydown",n=>{n.key==="Escape"&&(n.preventDefault(),t.query="",e.input.value="",ze(t),P(e,t,!0))}),e.available.addEventListener("change",()=>{t.availableOnly=e.available.checked,P(e,t,!0)}),e.faculty.addEventListener("change",()=>{t.faculty=L(e.faculty.value),P(e,t,!0)}),e.requirement.addEventListener("change",()=>{t.requirement=L(e.requirement.value),P(e,t,!0)}),e.pointsMin.addEventListener("input",()=>{t.pointsMin=L(e.pointsMin.value),P(e,t,!0)}),e.pointsMax.addEventListener("input",()=>{t.pointsMax=L(e.pointsMax.value),P(e,t,!0)}),e.medianMin.addEventListener("input",()=>{t.medianMin=L(e.medianMin.value),P(e,t,!0)})}function ze(e){e.debounceId!==void 0&&(window.clearTimeout(e.debounceId),e.debounceId=void 0)}async function la(e,t){try{const[n,r]=await Promise.all([h.courses.faculties(),fa()]);At(e.faculty,"כל הפקולטות",n),t.faculty.length>0&&n.some(a=>a===t.faculty)?e.faculty.value=t.faculty:(t.faculty="",e.faculty.value="");const o=r.map(a=>({value:a.id,label:a.label}));At(e.requirement,"כל הדרישות",o,!0),t.requirementCodes=new Map(r.map(a=>[a.id,a.courseCodes])),r.some(a=>a.id===t.requirement)?e.requirement.value=t.requirement:(t.requirement="",e.requirement.value="")}catch{e.status.textContent="הפילטרים נטענו חלקית (נתוני דרישות חסרים)."}}async function P(e,t,n){const r=t.requestId+1;t.requestId=r,n&&da(t),ua(e.results,6),e.empty.classList.add("hidden"),e.status.textContent="מחפש...";const o=ca(t);try{const s=await h.courses.query(o);if(r!==t.requestId)return;if(ma(e.results,s.courses),s.total===0){const i=t.totalCourses??0;if(e.status.textContent=`מציג 0 מתוך ${String(i)}`,i===0)return;e.empty.textContent="נסו להרחיב את הטווחים או לנקות חלק מהפילטרים.",e.empty.classList.remove("hidden");return}const a=t.totalCourses??s.total;e.status.textContent=`מציג ${String(s.total)} מתוך ${String(a)}`}catch{if(r!==t.requestId)return;e.results.replaceChildren(),e.status.textContent="טעינת התוצאות נכשלה.",e.empty.textContent="אירעה שגיאה בקריאת הנתונים המקומיים.",e.empty.classList.remove("hidden")}}function ca(e){const t=e.requirement.length>0?e.requirementCodes.get(e.requirement)??[]:[];return{query:e.query,availableOnly:e.availableOnly,faculty:e.faculty,pointsMin:Be(e.pointsMin),pointsMax:Be(e.pointsMax),medianMin:Be(e.medianMin),requirementCourseCodes:t,page:1,pageSize:"all"}}function da(e){const t=new URL(window.location.href);H(t,"q",e.query),H(t,"available",e.availableOnly?"1":""),H(t,"faculty",e.faculty),H(t,"requirement",e.requirement),H(t,"pointsMin",e.pointsMin),H(t,"pointsMax",e.pointsMax),H(t,"medianMin",e.medianMin),window.history.replaceState(null,"",t)}function H(e,t,n){if(n.length===0){e.searchParams.delete(t);return}e.searchParams.set(t,n)}function Be(e){if(e.length===0)return;const t=Number.parseFloat(e);if(Number.isFinite(t))return t}function L(e){return e.trim().replace(/\s+/g," ")}function ua(e,t){const n=[];for(let r=0;r<t;r+=1)n.push(U());e.replaceChildren(...n)}function ma(e,t){const n=t.map(r=>{const o=document.createElement("a");o.href=`/course?code=${encodeURIComponent(r.code)}`;const s=r.current===!0?"":"opacity-45 saturate-40";return o.className=`focus-visible:ring-accent/60 block h-[7.5rem] rounded-2xl focus-visible:ring-2 sm:h-[6.5rem] [content-visibility:auto] [contain-intrinsic-size:7.5rem] sm:[contain-intrinsic-size:6.5rem] ${s}`.trim(),o.setAttribute("aria-label",`פתיחת הקורס ${r.code}`),o.append(U(r)),o});e.replaceChildren(...n)}function At(e,t,n,r=!1){e.replaceChildren();const o=document.createElement("option");o.value="",o.textContent=t,e.append(o);for(const s of n){const a=document.createElement("option");if(r){const i=s;a.value=i.value,a.textContent=i.label}else{const i=s;a.value=i,a.textContent=i}e.append(a)}}async function fa(){const t=(await h.userDegree.get())?.programId??"";if(t.length===0)return[];const n=await h.requirements.get(t);if(n===void 0)return[];const r=ga(n.data);if(r===void 0)return[];const o=[];return bn(r,[],o),o}function bn(e,t,n){const r=ha(e),o=r.length>0?[...t,r]:t,s=pa(e);if(s.length>0&&o.length>0&&n.push({id:o.join("::"),label:o.join(" > "),courseCodes:s}),!!Array.isArray(e.nested))for(const a of e.nested)bn(a,o,n)}function pa(e){const t=new Set;return yn(e,t),Array.from(t)}function yn(e,t){if(Array.isArray(e.courses))for(const n of e.courses)typeof n=="string"&&n.length>0&&t.add(n);if(Array.isArray(e.nested))for(const n of e.nested)yn(n,t)}function ha(e){return typeof e.he=="string"&&e.he.length>0?e.he:typeof e.en=="string"&&e.en.length>0?e.en:typeof e.name=="string"&&e.name.length>0?e.name:""}function ga(e){if(!(typeof e!="object"||e===null))return e}async function xa(e){const t=await h.courses.getLastSync();if(t===void 0||t.length===0){e.replaceChildren(document.createTextNode("עדיין לא בוצע סנכרון נתונים. "),wa("עברו לקטלוג כדי לבחור מסלול."));return}const n=new Date(t);if(Number.isNaN(n.getTime())){e.textContent="סטטוס סנכרון לא זמין.";return}e.textContent=`עודכן לאחרונה: ${n.toLocaleString()}`}async function va(e,t){try{e.totalCourses=await h.courses.count(),P(t,e,!1)}catch{e.totalCourses=void 0}}function wa(e){const t=document.createElement("a");return t.href="/catalog",t.className="text-accent hover:text-accent/80 underline underline-offset-2",t.textContent=e,t}const ba=`<template>
    <section class="text-text min-h-screen w-full" data-page="semester">
        <div data-console-nav></div>
        <main
            class="mx-auto flex w-full max-w-6xl flex-col gap-6 pt-[calc(env(safe-area-inset-top)+1rem)] pb-[calc(env(safe-area-inset-bottom)+1.5rem)]"
        >
            <div
                class="grid min-w-0 grid-cols-1 gap-4 lg:grid-cols-[18rem_minmax(0,1fr)] lg:items-start"
            >
                <section
                    class="order-2 flex min-w-0 flex-col gap-4 lg:order-2"
                    data-role="groups-root"
                ></section>

                <aside
                    class="sticky top-[calc(env(safe-area-inset-top)+3rem)] order-1 w-full md:top-[calc(env(safe-area-inset-top)+3.5rem)] lg:top-[calc(env(safe-area-inset-top)+4.75rem)] lg:order-1 lg:mx-0 lg:w-auto lg:self-start"
                    data-role="current-semester-aside"
                >
                    <section
                        class="border-border/60 bg-semester-surface flex w-full min-w-0 flex-col gap-3 border py-3 shadow-sm lg:max-h-[calc(100vh-env(safe-area-inset-top)-4.75rem-0.75rem)] lg:overflow-y-auto lg:rounded-2xl lg:px-2"
                        data-role="current-semester"
                    >
                        <div class="mx-3 flex items-center gap-2">
                            <h2
                                class="text-sm font-medium"
                                data-role="current-semester-title"
                            ></h2>
                            <button
                                type="button"
                                class="border-border/60 bg-surface-1/70 text-text-muted hover:border-accent/50 hover:text-text pointer-events-none invisible ms-auto min-h-7 touch-manipulation rounded-xl border px-2 py-1 text-xs opacity-0 transition-opacity duration-200 ease-out"
                                data-role="current-semester-cancel"
                            >
                                ביטול
                            </button>
                        </div>
                        <div
                            class="min-h-0 overflow-x-auto overflow-y-hidden pb-1 [scrollbar-width:thin] lg:overflow-x-hidden lg:overflow-y-visible lg:pb-0"
                            data-role="current-semester-courses"
                        ></div>
                        <p
                            class="text-text-muted hidden text-xs"
                            data-role="current-semester-empty"
                        >
                            אין קורסים בסמסטר זה.
                        </p>
                    </section>
                </aside>
            </div>
        </main>
    </section>
</template>
`,qt="קורס",Pt=1,Cn=10,Ge=["אביב","קיץ","חורף"];function ya(){const e=document.createElement("template");e.innerHTML=ba;const t=e.content.firstElementChild;if(!(t instanceof HTMLTemplateElement))throw new Error("SemesterPage template element not found");const n=t.content.firstElementChild?.cloneNode(!0);if(!(n instanceof HTMLElement))throw new Error("SemesterPage template root not found");const r=n.querySelector("[data-console-nav]");r!==null&&r.replaceWith(de({activePath:"/semester"}));const o=Ca(n),s=Sa(window.location.search),a={elements:o,semesterNumber:s,planValue:void 0,semesterCourseCodeSet:new Set};return n.addEventListener("click",i=>{Fa(a,i)}),ka(a),n}function Ca(e){const t=e.querySelector('[data-role="groups-root"]'),n=e.querySelector('[data-role="current-semester"]'),r=e.querySelector('[data-role="current-semester-title"]'),o=e.querySelector('[data-role="current-semester-cancel"]'),s=e.querySelector('[data-role="current-semester-courses"]'),a=e.querySelector('[data-role="current-semester-empty"]');if(t===null||n===null||r===null||o===null||s===null||a===null)throw new Error("SemesterPage required elements not found");return{groupsRoot:t,currentSemester:n,currentTitle:r,currentCancelButton:o,currentCourses:s,currentEmpty:a}}function Sa(e){const n=new URLSearchParams(e).get("number");if(n===null)return Pt;const r=Number.parseInt(n,10);return!Number.isInteger(r)||r<1?Pt:r}function Ea(e){const t=Math.max(0,e-1),n=Ge[t%Ge.length],r=2026+Math.floor(e/Ge.length);return{number:e,season:n,year:r}}async function ka(e){const{elements:t,semesterNumber:n}=e;try{const[r,o]=await Promise.all([h.userDegree.get(),h.userPlan.get()]),s=new Map,a=La(o?.value);e.planValue=o?.value;const i=a?.semesters?.at(Math.max(0,n-1))??void 0,l=Aa(i?.courseCodes);Ua(t.currentCourses,t.currentEmpty,l.length);const d=qa(n,i?.id);e.semesterId=i?.id,e.semesterCourseCodeSet=new Set(l),t.currentTitle.textContent=`סמסטר ${String(d.number)} • ${d.season} ${String(d.year)}`;const c=new Set(l),u=r===void 0?[]:await Na(r.programId,r.path,c),m=Ra(u);t.groupsRoot.replaceChildren();const f=Sn(l,s),p=Oa(t.groupsRoot,u,s),g=Da(t.groupsRoot,m,c),v=await f;_a(t.currentCourses,t.currentEmpty,v),await Promise.all([p,g]),st(e,!1)}catch{t.groupsRoot.replaceChildren();const r=document.createElement("p");r.className="text-danger text-xs",r.textContent="אירעה שגיאה בקריאת הנתונים המקומיים.",t.groupsRoot.append(r)}}function La(e){if(!(typeof e!="object"||e===null))return e}function Aa(e){if(!Array.isArray(e))return[];const t=new Set;for(const n of e){if(typeof n!="string")continue;const r=n.trim();r.length!==0&&t.add(r)}return[...t]}function qa(e,t){if(typeof t=="string"){const n=/^(אביב|קיץ|חורף)-(\d{4})-/.exec(t);if(n!==null)return{number:e,season:n[1],year:Number.parseInt(n[2],10)}}return Ea(e)}async function Sn(e,t){return Promise.all(e.map(n=>Pa(n,t)))}function Pa(e,t){const n=t.get(e);if(n!==void 0)return n;const r=h.courses.get(e).then(o=>o??{code:e,name:`${qt} ${e}`}).catch(()=>({code:e,name:`${qt} ${e}`}));return t.set(e,r),r}function Ta(e){if(!(typeof e!="object"||e===null))return e}async function Na(e,t,n){const r=await h.requirements.get(e),o=Ta(r?.data);if(o===void 0)return[];const s=et(o,t),a=Ma(s),i=[];for(const l of a){const d=l.courseCodes.filter(c=>!n.has(c));d.length!==0&&i.push({label:l.label,courseCodes:d})}return i}function Ma(e){const t=[];return En(e,t),t}function En(e,t){const n=ce(e)??"—",r=Le(e,n),o=Ia(e);if(o.length>0&&t.push({label:r,courseCodes:o}),!!Array.isArray(e.nested))for(const s of e.nested)En(s,t)}function Ia(e){if(!Array.isArray(e.courses))return[];const t=new Set;for(const n of e.courses){if(typeof n!="string")continue;const r=n.trim();r.length>0&&t.add(r)}return[...t]}function Ra(e){const t=new Set;for(const n of e)for(const r of n.courseCodes)t.add(r);return t}function kn(e){return[...e].sort((t,n)=>{const r=typeof t.median=="number"&&Number.isFinite(t.median)?t.median:Number.NEGATIVE_INFINITY,o=typeof n.median=="number"&&Number.isFinite(n.median)?n.median:Number.NEGATIVE_INFINITY;return o!==r?o-r:t.code.localeCompare(n.code)})}function _a(e,t,n){e.replaceChildren();const r=document.createElement("div");if(r.className="flex min-h-0 snap-x snap-mandatory gap-2 lg:snap-none lg:flex-col",e.append(r),n.length===0){t.classList.remove("hidden");return}t.classList.add("hidden");for(const o of n)r.append(Tn(o,"current"))}function Ua(e,t,n){e.replaceChildren(),t.classList.add("hidden");const r=document.createElement("div");r.className="flex min-h-0 snap-x snap-mandatory gap-2 lg:snap-none lg:flex-col",e.append(r),qn(r,n)}async function Oa(e,t,n){await Promise.all(t.map(async r=>{const o=Ln(e,{title:r.label,kind:"requirement"},r.courseCodes.length),s=kn(await Sn(r.courseCodes,n));An(o.row,s)}))}async function Da(e,t,n){const o=[...await h.courses.faculties().catch(()=>[])].sort((a,i)=>a.localeCompare(i,"he"));if(await Promise.all(o.map(async a=>{const i=Ln(e,{title:`בחירה חופשית: ${a}`,kind:"free"},Cn),l=await h.courses.query({faculty:a,page:1,pageSize:"all"}).catch(()=>({courses:[],total:0})),d=kn(l.courses.filter(c=>!t.has(c.code)&&!n.has(c.code)));if(d.length===0){i.section.remove();return}An(i.row,d)})),e.querySelector("section[data-group-kind]")===null){const a=document.createElement("p");a.className="text-text-muted text-xs",a.textContent="אין קבוצות קורסים להצגה.",e.append(a)}}function Ln(e,t,n){const r=document.createElement("section");r.className="flex min-w-0 flex-col gap-2 [content-visibility:auto] [contain-intrinsic-size:24rem]",r.dataset.groupKind=t.kind,r.dataset.groupTitle=t.title;const o=document.createElement("h2");o.className="mx-3 text-sm font-medium",o.textContent=t.title,r.append(o);const s=document.createElement("div");s.className="min-w-0 max-w-full overflow-x-auto overflow-y-hidden pb-2 [scrollbar-width:thin]";const a=document.createElement("div");return a.className="flex w-max min-w-full snap-x snap-mandatory gap-2",a.dataset.role="group-row",n>0&&qn(a,n),s.append(a),r.append(s),e.append(r),{section:r,row:a}}function An(e,t){if(e.replaceChildren(),t.length===0){const n=document.createElement("p");n.className="text-text-muted text-xs",n.textContent="אין קורסים להצגה בקבוצה זו.",e.append(n);return}for(const n of t)e.append(Tn(n,"row"))}function qn(e,t){const n=Math.max(1,Math.min(t,Cn));for(let r=0;r<n;r+=1){const o=document.createElement("div");o.className="pointer-events-none block h-[7.5rem] w-[7.5rem] shrink-0 snap-start rounded-2xl sm:h-[6.5rem] lg:w-[10.5rem]",o.setAttribute("aria-hidden","true"),o.append(U()),e.append(o)}}function Fa(e,t){const n=t.target;if(!(n instanceof Element))return;if(n.closest('[data-role="current-semester-cancel"]')!==null){t.preventDefault(),Pn(e);return}const o=n.closest("a[data-course-code]");if(o!==null){t.preventDefault(),ja(e,o);return}n.closest('[data-role="current-semester"]')!==null&&(t.preventDefault(),Ha(e))}function ja(e,t){const n=t.dataset.courseCode,r=t.dataset.courseKind;if(n===void 0||r!=="row"&&r!=="current")return;const o=e.selected;if(o?.code===n&&o.element===t){Wa(n);return}o!==void 0&&Je(o.element,!1),e.selected={code:n,sourceKind:r,element:t},Je(t,!0),st(e,!0)}function Je(e,t){e.classList.toggle("ring-2",t),e.classList.toggle("ring-accent/50",t)}function st(e,t){e.elements.currentSemester.classList.toggle("!border-accent/40",t),e.elements.currentSemester.classList.toggle("!bg-surface-2/80",t);const n=e.elements.currentCancelButton;n.classList.toggle("invisible",!t),n.classList.toggle("opacity-0",!t),n.classList.toggle("pointer-events-none",!t)}function Pn(e){e.selected!==void 0&&Je(e.selected.element,!1),e.selected=void 0,st(e,!1)}async function Ha(e){const t=e.selected;if(t?.sourceKind!=="row")return;const n=t.element.parentElement,r=$a(e.elements.currentCourses);za(t.element,"current"),r.append(t.element),e.elements.currentEmpty.classList.add("hidden"),n instanceof HTMLElement&&Ba(n),e.semesterCourseCodeSet.add(t.code),Pn(e),await Ga(e)}function $a(e){const t=e.firstElementChild;if(t instanceof HTMLElement)return t;const n=document.createElement("div");return n.className="flex min-h-0 snap-x snap-mandatory gap-2 lg:snap-none lg:flex-col",e.append(n),n}function za(e,t){e.dataset.courseKind=t,e.classList.remove("lg:w-[10.5rem]","lg:w-auto"),e.classList.add("lg:w-auto","w-[7.5rem]")}function Ba(e){if(e.querySelector("a[data-course-code]")!==null||e.querySelector('p[data-role="empty-group"]')!==null)return;const t=document.createElement("p");t.className="text-text-muted text-xs",t.dataset.role="empty-group",t.textContent="אין קורסים להצגה בקבוצה זו.",e.append(t)}async function Ga(e){const t=[...e.semesterCourseCodeSet],n=Va(e.planValue,e.semesterNumber,e.semesterId,t);e.planValue=n,await h.userPlan.set(n).catch(()=>{})}function Va(e,t,n,r){const o=typeof e=="object"&&e!==null?{...e}:{},s=Array.isArray(o.semesters)?o.semesters.map(l=>({...l})):[],a=Math.max(0,t-1);for(;s.length<=a;)s.push({});const i=s[a]??{};return s[a]={...i,id:typeof i.id=="string"?i.id:n,courseCodes:r},{...o,semesters:s}}function Wa(e){const t=new URL("/course",window.location.origin);t.searchParams.set("code",e),window.history.pushState(null,"",t),window.dispatchEvent(new PopStateEvent("popstate"))}function Tn(e,t){const n=document.createElement("a");n.href=`/course?code=${encodeURIComponent(e.code)}`;const r=t==="row"?"w-[7.5rem] lg:w-[10.5rem]":"w-[7.5rem] lg:w-auto",o=t==="row"?"[contain-intrinsic-size:7.5rem_7.5rem] sm:[contain-intrinsic-size:7.5rem_6.5rem] lg:[contain-intrinsic-size:10.5rem_6.5rem]":"[contain-intrinsic-size:7.5rem_7.5rem] sm:[contain-intrinsic-size:7.5rem_6.5rem]";return n.className=`touch-manipulation focus-visible:ring-accent/60 block h-[7.5rem] ${r} shrink-0 snap-start rounded-2xl focus-visible:ring-2 sm:h-[6.5rem] [content-visibility:auto] ${o}`.trim(),n.dataset.courseCode=e.code,n.dataset.courseKind=t,e.current!==!0&&n.classList.add("opacity-70"),n.append(U(e)),n}const Tt="planit:redirect-path",D=at("/planit/"),Ka={"/":us,"/plan":As,"/catalog":Jr,"/course":So,"/search":ra,"/semester":ya};function F(e){return e===""?"/":e==="/"?e:e.replace(/\/+$/,"")}function at(e){const t=F(e);return t===""||t==="."?"/":t.startsWith("/")?t:F(`/${t}`)}function le(e,t){const n=F(e),r=at(t);return r==="/"?n:n===r?"/":n.startsWith(`${r}/`)?F(n.slice(r.length)):n}function it(e,t){const n=F(e),r=at(t);return r==="/"?n:n==="/"?r:`${r}${n}`}function Ya(e){const t=F(e),n=Ka[t];return n===void 0?null:n}function Ee(e,t=!1){const n=document.querySelector("#app");if(n===null)throw new Error("Missing #app element");const r=le(e,D),o=Ya(r);o===null?n.replaceChildren(hs(r)):n.replaceChildren(o());const s=new URL(window.location.href),a=F(s.pathname),i=it(r,D);t&&i!==a&&(s.pathname=i,window.history.replaceState(null,"",s))}function Qa(e){const t=new URL(e.href),n=le(t.pathname,D);t.pathname=it(n,D);const r=new URL(window.location.href);t.pathname===F(r.pathname)&&t.search===r.search&&t.hash===r.hash||(window.history.pushState(null,"",t),Ee(t.pathname))}function Xa(e){if(e.defaultPrevented||e.button!==0||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return!1;const t=e.target;if(!(t instanceof Element))return!1;const n=t.closest("a[href]");return!(n===null||n.target!==""&&n.target!=="_self"||n.hasAttribute("download")||new URL(n.href,window.location.href).origin!==window.location.origin)}function Za(e){return e.hash===""?!1:le(e.pathname,D)===le(window.location.pathname,D)&&e.search===window.location.search}function Ja(){const e=window.sessionStorage.getItem(Tt);if(e===null||e==="")return;window.sessionStorage.removeItem(Tt);const t=new URL(e,window.location.origin);if(t.origin!==window.location.origin)return;const n=le(t.pathname,D);t.pathname=it(n,D),window.history.replaceState(null,"",t)}function ei(){Ee(window.location.pathname,!0)}function ti(){Ja(),vr(()=>{Ee(window.location.pathname,!0)}),window.addEventListener("popstate",()=>{Ee(window.location.pathname,!0)}),document.addEventListener("click",e=>{if(!Xa(e))return;const t=e.target;if(!(t instanceof Element))return;const n=t.closest("a[href]");if(n===null)return;const r=new URL(n.href,window.location.href);Za(r)||(e.preventDefault(),Qa(r))})}const ni="modulepreload",ri=function(e){return"/planit/"+e},Nt={},oi=function(t,n,r){let o=Promise.resolve();if(n&&n.length>0){let d=function(c){return Promise.all(c.map(u=>Promise.resolve(u).then(m=>({status:"fulfilled",value:m}),m=>({status:"rejected",reason:m}))))};var a=d;document.getElementsByTagName("link");const i=document.querySelector("meta[property=csp-nonce]"),l=i?.nonce||i?.getAttribute("nonce");o=d(n.map(c=>{if(c=ri(c),c in Nt)return;Nt[c]=!0;const u=c.endsWith(".css"),m=u?'[rel="stylesheet"]':"";if(document.querySelector(`link[href="${c}"]${m}`))return;const f=document.createElement("link");if(f.rel=u?"stylesheet":ni,u||(f.as="script"),f.crossOrigin="",f.href=c,l&&f.setAttribute("nonce",l),document.head.appendChild(f),u)return new Promise((p,g)=>{f.addEventListener("load",p),f.addEventListener("error",()=>g(new Error(`Unable to preload CSS for ${c}`)))})}))}function s(i){const l=new Event("vite:preloadError",{cancelable:!0});if(l.payload=i,window.dispatchEvent(l),!l.defaultPrevented)throw i}return o.then(i=>{for(const l of i||[])l.status==="rejected"&&s(l.reason);return t().catch(s)})};function si(e={}){const{immediate:t=!1,onNeedRefresh:n,onOfflineReady:r,onRegistered:o,onRegisteredSW:s,onRegisterError:a}=e;let i,l,d;const c=async(m=!0)=>{await l,d?.()};async function u(){if("serviceWorker"in navigator){if(i=await oi(async()=>{const{Workbox:m}=await import("./workbox-window.prod.es5-BIl4cyR9.js");return{Workbox:m}},[]).then(({Workbox:m})=>new m("/planit/sw.js",{scope:"/planit/",type:"classic"})).catch(m=>{a?.(m)}),!i)return;d=()=>{i?.messageSkipWaiting()};{let m=!1;const f=()=>{m=!0,i?.addEventListener("controlling",p=>{p.isUpdate&&window.location.reload()}),n?.()};i.addEventListener("installed",p=>{typeof p.isUpdate>"u"?typeof p.isExternal<"u"&&p.isExternal?f():!m&&r?.():p.isUpdate||r?.()}),i.addEventListener("waiting",f)}i.register({immediate:t}).then(m=>{s?s("/planit/sw.js",m):o?.(m)}).catch(m=>{a?.(m)})}}return l=u(),c}const Nn="planit:pwa-update";function ai(){let e=!1,t=!1,n=!1,r=null,o=null;const s=600*1e3,a=()=>{r!==null&&(n||(n=!0,window.dispatchEvent(new CustomEvent(Nn,{detail:{updateSW:r}}))))},i=()=>{if(r===null){t=!0;return}if("onLine"in navigator&&!navigator.onLine){e=!0;return}a()};window.addEventListener("online",()=>{if(!e&&!t){o!==null&&o();return}e=!1,t=!1,a(),o!==null&&o()}),document.addEventListener("visibilitychange",()=>{document.visibilityState==="visible"&&o!==null&&o()}),window.addEventListener("load",()=>{r=si({immediate:!0,onNeedRefresh(){i()},onRegisteredSW(l,d){if(d!==void 0)if(d.active?.state==="activated")o=Mt(s,l,d),o();else{const c=d.installing;if(c===null)return;c.addEventListener("statechange",u=>{u.target.state==="activated"&&(o=Mt(s,l,d),o())})}}}),t&&(t=!1,i())})}function Mt(e,t,n){const r=async()=>{if("onLine"in navigator&&!navigator.onLine)return;const o=await fetch(t,{cache:"no-store",headers:{cache:"no-store","cache-control":"no-cache"}});(o.status===200||o.status===304)&&await n.update()};return setInterval(()=>{r()},e),r}const ii=`<template>
    <div
        class="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex justify-center p-3 sm:justify-end sm:p-4"
    >
        <section
            class="border-border/80 bg-surface-1/95 text-text pointer-events-auto hidden w-full max-w-md rounded-2xl border p-3 shadow-lg backdrop-blur-md"
            role="status"
            aria-live="polite"
            aria-atomic="true"
            data-component="PwaUpdateToast"
        >
            <div class="flex items-start gap-3">
                <div
                    class="bg-info/15 text-info mt-0.5 rounded-full px-2 py-0.5 text-[11px] font-medium"
                >
                    עדכון
                </div>
                <div class="min-w-0 flex-1">
                    <p class="text-sm font-medium">גרסה חדשה זמינה</p>
                </div>
            </div>

            <div class="mt-3 flex items-center justify-end gap-2">
                <button
                    type="button"
                    class="bg-accent text-accent-contrast focus-visible:ring-accent/50 min-h-11 rounded-xl px-3 text-xs font-medium shadow-sm transition duration-200 ease-out focus-visible:ring-2"
                    data-role="apply"
                >
                    עדכן עכשיו
                </button>
            </div>
        </section>
    </div>
</template>
`;function li(){const e=document.createElement("template");e.innerHTML=ii;const t=e.content.firstElementChild;if(!(t instanceof HTMLTemplateElement))throw new Error("PwaUpdateToast template element not found");const n=t.content.firstElementChild?.cloneNode(!0);if(!(n instanceof HTMLElement))throw new Error("PwaUpdateToast template root not found");const r=n.querySelector('[data-component="PwaUpdateToast"]'),o=n.querySelector('[data-role="apply"]');if(r===null||o===null)throw new Error("PwaUpdateToast required elements not found");let s=null;return window.addEventListener(Nn,a=>{const l=a.detail.updateSW;typeof l=="function"&&(s=l,o.disabled=!1,r.classList.remove("hidden"))}),o.addEventListener("click",()=>{s!==null&&(o.disabled=!0,s(!0).catch(()=>{o.disabled=!1}))}),n}const ci=`<template>
    <div
        class="bg-bg/95 fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm"
        data-app-loading-screen
        aria-live="polite"
        aria-label="טוען"
    >
        <div
            class="border-border/60 bg-surface-1/90 flex min-w-52 items-center gap-3 rounded-2xl border px-4 py-3 shadow-sm"
        >
            <span
                class="border-accent/30 border-t-accent inline-block size-4 animate-spin rounded-full border-2"
                aria-hidden="true"
            ></span>
            <span class="text-text text-xs font-medium"
                >טוען סביבת התחברות...</span
            >
        </div>
    </div>
</template>
`;async function di(){if(ai(),ti(),ui()){const e=mi();document.body.append(e),await Promise.all([jr(),wo(),rr()]),e.remove()}ei(),document.body.append(li())}function ui(){return"onLine"in navigator?navigator.onLine:!0}function mi(){const e=document.createElement("template");e.innerHTML=ci;const t=e.content.firstElementChild;if(!(t instanceof HTMLTemplateElement))throw new Error("AppLoadingScreen template element not found");const n=t.content.firstElementChild?.cloneNode(!0);if(!(n instanceof HTMLElement))throw new Error("AppLoadingScreen template root not found");return n}di();
