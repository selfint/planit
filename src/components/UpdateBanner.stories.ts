import type { Meta, StoryObj } from '@storybook/html';

import { PWA_UPDATE_EVENT } from '$lib/pwa';

import { UpdateBanner } from './UpdateBanner';

const meta: Meta = {
    title: 'Components/UpdateBanner',
};

export default meta;

export type Story = StoryObj;

function renderBanner(): HTMLElement {
    const banner = UpdateBanner();
    const updateSW = (): Promise<void> => Promise.resolve();
    window.dispatchEvent(
        new CustomEvent(PWA_UPDATE_EVENT, {
            detail: { updateSW },
        })
    );
    return banner;
}

export const Default: Story = {
    render: () => renderBanner(),
    globals: {
        theme: 'light',
    },
};

export const Dark: Story = {
    render: () => renderBanner(),
    globals: {
        theme: 'dark',
    },
    parameters: {
        backgrounds: {
            default: 'dark',
        },
    },
};
