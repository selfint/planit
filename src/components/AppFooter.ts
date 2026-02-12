import templateHtml from './AppFooter.html?raw';

export function AppFooter(): HTMLElement {
    const template = document.createElement('template');
    template.innerHTML = templateHtml;
    const templateElement = template.content.firstElementChild;
    if (!(templateElement instanceof HTMLTemplateElement)) {
        throw new Error('AppFooter template element not found');
    }
    const root = templateElement.content.firstElementChild?.cloneNode(true);
    if (!(root instanceof HTMLElement)) {
        throw new Error('AppFooter template root not found');
    }

    const buildSha = root.querySelector<HTMLElement>('[data-build-sha]');
    if (buildSha !== null) {
        buildSha.textContent = `Build ${__BUILD_SHA__}`;
    }

    return root;
}
