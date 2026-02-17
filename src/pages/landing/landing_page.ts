import { LandingFeatureCard } from './components/LandingFeatureCard';
import { LandingHero } from './components/LandingHero';
import { LandingNav } from './components/LandingNav';
import landingDemoVideoUrl from '$assets/demos/first-time-user-experience.webm';
import templateHtml from './landing_page.html?raw';

export function LandingPage(): HTMLElement {
    const template = document.createElement('template');
    template.innerHTML = templateHtml;
    const templateElement = template.content.firstElementChild;
    if (!(templateElement instanceof HTMLTemplateElement)) {
        throw new Error('LandingPage template element not found');
    }
    const root = templateElement.content.firstElementChild?.cloneNode(true);
    if (!(root instanceof HTMLElement)) {
        throw new Error('LandingPage template root not found');
    }

    const navHost = root.querySelector<HTMLElement>('[data-landing-nav]');
    if (navHost !== null) {
        navHost.replaceWith(LandingNav());
    }

    const heroHost = root.querySelector<HTMLElement>('[data-landing-hero]');
    if (heroHost !== null) {
        heroHost.replaceWith(LandingHero());
    }

    const featureData: Record<
        string,
        {
            label: string;
            title: string;
            description: string;
            href: string;
            linkLabel: string;
            mediaAlt: string;
        }
    > = {
        plan: {
            label: 'מתכנן סמסטר',
            title: 'תכננו את ההרכבה',
            description: 'גררו קורסים, בדקו עומס וראו תמונה מלאה של הסמסטרים.',
            href: '/plan',
            linkLabel: 'מעבר למתכנן →',
            mediaAlt: 'תצוגת מתכנן',
        },
        catalog: {
            label: 'קטלוגים',
            title: 'כל הדרישות במקום אחד',
            description: 'בחרו מסלול, בדקו דרישות חובה ובחרו תמהיל מתאים.',
            href: '/catalog',
            linkLabel: 'בדיקת קטלוגים →',
            mediaAlt: 'תצוגת קטלוג',
        },
        search: {
            label: 'חיפוש',
            title: 'מצאו קורסים מהר',
            description: 'חיפוש מתקדם עם פילטרים, דרישות קדם והצעות.',
            href: '/search',
            linkLabel: 'לפתיחת חיפוש →',
            mediaAlt: 'תצוגת חיפוש',
        },
        semester: {
            label: 'סמסטרים',
            title: 'מעקב לכל תקופה',
            description: 'תיעוד עומסים, נקודות זכות, ושינויים בין סמסטרים.',
            href: '/semester',
            linkLabel: 'מעבר לסמסטר →',
            mediaAlt: 'תצוגת סמסטר',
        },
        course: {
            label: 'פרטי קורס',
            title: 'כל פרט במקום אחד',
            description: 'תיאור, נק"ז, תנאי קדם וביקוש — בלי לעבור בין אתרים.',
            href: '/course',
            linkLabel: 'לפרטי קורס →',
            mediaAlt: 'תצוגת קורס',
        },
    };

    const featureHosts = root.querySelectorAll<HTMLElement>(
        '[data-landing-feature-card]'
    );
    featureHosts.forEach((host) => {
        const featureKey = host.dataset.landingFeatureCard;
        if (featureKey === undefined) {
            return;
        }
        const data = featureData[featureKey];
        const card = LandingFeatureCard({
            label: data.label,
            title: data.title,
            description: data.description,
            href: data.href,
            linkLabel: data.linkLabel,
            mediaAlt: data.mediaAlt,
        });
        host.replaceWith(card);
    });

    const mediaContainers = root.querySelectorAll<HTMLElement>(
        '[data-feature-media], [data-hero-media]'
    );
    mediaContainers.forEach((container) => {
        container.dataset.videoReady = 'false';
    });

    setupLandingDemoVideo(root);

    return root;
}

function setupLandingDemoVideo(root: HTMLElement): void {
    const placeholder = root.querySelector<HTMLElement>(
        '[data-video-placeholder]'
    );
    const video = root.querySelector<HTMLVideoElement>(
        '[data-landing-demo-video]'
    );
    const skeletonLayer = root.querySelector<HTMLElement>(
        '[data-skeleton-layer]'
    );
    const fallback = root.querySelector<HTMLElement>('[data-video-fallback]');
    if (placeholder === null || video === null || skeletonLayer === null) {
        return;
    }

    const resolvedPlaceholder = placeholder;
    const resolvedVideo = video;
    const resolvedSkeletonLayer = skeletonLayer;

    resolvedVideo.src = landingDemoVideoUrl;

    function revealVideo(): void {
        resolvedVideo.classList.remove('opacity-0');
        resolvedPlaceholder.dataset.skeleton = 'false';
        resolvedSkeletonLayer.classList.add('hidden');
        fallback?.classList.add('hidden');
    }

    function handleVideoFailure(): void {
        resolvedSkeletonLayer.classList.remove('skeleton-shimmer');
        resolvedSkeletonLayer.classList.add('bg-surface-2/70');
        fallback?.classList.remove('hidden');
    }

    if (resolvedVideo.readyState >= 2) {
        revealVideo();
        return;
    }

    resolvedVideo.addEventListener('loadeddata', revealVideo, { once: true });
    resolvedVideo.addEventListener('error', handleVideoFailure, { once: true });
}
