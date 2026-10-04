import templateHtml from './LandingHero.html?raw';

const TEMPLATE_ROOT = createTemplateRoot();

export function LandingHero(): HTMLElement {
    const root = TEMPLATE_ROOT.cloneNode(true);
    if (!(root instanceof HTMLElement)) {
        throw new Error('LandingHero template root not found');
    }

    return root;
}

function createTemplateRoot(): HTMLElement {
    const template = document.createElement('template');
    template.innerHTML = templateHtml.trim();
    const root = template.content.firstElementChild;
    if (!(root instanceof HTMLElement)) {
        throw new Error('LandingHero template root not found');
    }
    return root;
}
