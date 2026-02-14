import titleUrl from '$assets/Title.svg';
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

    const titleImages = root.querySelectorAll<HTMLImageElement>(
        '[data-asset="title"]'
    );
    titleImages.forEach((image) => {
        image.src = titleUrl;
        image.decoding = 'async';
    });

    const toggleButtons = root.querySelectorAll<HTMLButtonElement>(
        '[data-action="toggle-menu"]'
    );
    const mobileMenu = root.querySelector<HTMLElement>(
        '[data-role="mobile-menu"]'
    );
    if (mobileMenu !== null) {
        toggleButtons.forEach((button) => {
            button.addEventListener('click', () => {
                const isHidden = mobileMenu.classList.contains('hidden');
                mobileMenu.classList.toggle('hidden', !isHidden);
                toggleButtons.forEach((control) => {
                    control.setAttribute('aria-expanded', String(isHidden));
                });
            });
        });
    }

    return root;
}
