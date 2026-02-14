import logoUrl from '../../../assets/logo.webp';
import templateHtml from './LandingNav.html?raw';
import titleSvg from '../../../assets/Title.svg?raw';

export function LandingNav(): HTMLElement {
    const template = document.createElement('template');
    template.innerHTML = templateHtml;
    const templateElement = template.content.firstElementChild;
    if (!(templateElement instanceof HTMLTemplateElement)) {
        throw new Error('LandingNav template element not found');
    }
    const root = templateElement.content.firstElementChild?.cloneNode(true);
    if (!(root instanceof HTMLElement)) {
        throw new Error('LandingNav template root not found');
    }

    const logo = root.querySelector<HTMLImageElement>('[data-logo]');
    if (logo !== null) {
        logo.src = logoUrl;
    }

    const title = root.querySelector<HTMLDivElement>('[data-title]');
    if (title !== null) {
        title.innerHTML = titleSvg;
        const svg = title.querySelector<SVGElement>('svg');
        if (svg !== null) {
            svg.setAttribute('class', 'h-full w-auto');
        }
    }

    const toggleButtons = root.querySelectorAll<HTMLButtonElement>(
        '[data-action="toggle-menu"]'
    );
    if (toggleButtons.length === 0) {
        throw new Error('LandingNav toggleButtons not found');
    }
    const mobileMenu = root.querySelector<HTMLElement>(
        '[data-role="mobile-menu"]'
    );
    if (mobileMenu === null) {
        throw new Error('LandingNav mobile menu not found');
    }
    toggleButtons.forEach((button) => {
        button.addEventListener('click', () => {
            const isHidden = mobileMenu.classList.contains('hidden');
            mobileMenu.classList.toggle('hidden', !isHidden);
            toggleButtons.forEach((control) => {
                control.setAttribute('aria-expanded', String(isHidden));
            });
        });
    });

    return root;
}
