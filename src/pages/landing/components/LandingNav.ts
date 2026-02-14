import logoUrl from '../../../assets/logo.webp';
import titleUrl from '../../../assets/Title.svg?url';
import templateHtml from './LandingNav.html?raw';

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

    const titleUse = root.querySelector<SVGUseElement>('[data-title-use]');
    if (titleUse !== null) {
        titleUse.setAttribute('href', titleUrl);
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
