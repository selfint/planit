export type StorybookComponentRenderer = () => HTMLElement;

export type PreviewMode = 'light' | 'dark';

const previewClassNames: Record<PreviewMode, string> = {
    light: 'rounded-3xl border border-slate-200 bg-bg p-4',
    dark: 'sb-dark rounded-3xl bg-bg p-4',
};

export function renderStorybookPreview(
    renderComponent: StorybookComponentRenderer,
    mode: PreviewMode
): HTMLElement {
    const section = document.createElement('section');
    section.className = previewClassNames[mode];
    section.appendChild(renderComponent());
    return section;
}
