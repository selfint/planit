import type { Meta, StoryObj } from '@storybook/html';

import { createAppHeader } from './AppHeader';

const meta: Meta = {
    title: 'Components/AppHeader',
    render: () => {
        const container = document.createElement('div');
        container.className = 'space-y-8';

        const lightSection = document.createElement('section');
        lightSection.className = 'space-y-3';
        lightSection.innerHTML =
            '<p class="text-xs font-semibold uppercase tracking-[0.2em] text-text-muted">Light mode</p>';
        lightSection.appendChild(createAppHeader());

        const darkSection = document.createElement('section');
        darkSection.className = 'sb-dark space-y-3 rounded-3xl bg-bg-dark p-4';
        darkSection.innerHTML =
            '<p class="text-xs font-semibold uppercase tracking-[0.2em] text-text-muted">Dark mode</p>';
        darkSection.appendChild(createAppHeader());

        container.appendChild(lightSection);
        container.appendChild(darkSection);
        return container;
    },
};

export default meta;

export type Story = StoryObj;

export const Default: Story = {};
