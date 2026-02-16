import type { Meta, StoryObj } from '@storybook/html';

import { PWA_UPDATE_EVENT } from '$lib/pwaEvents';

import { PwaUpdateBanner } from './PwaUpdateBanner';

const meta: Meta = {
    title: 'Components/PwaUpdateToast',
};

export default meta;

export type Story = StoryObj;

export const Hidden: Story = {
    render: () => PwaUpdateBanner(),
    globals: {
        theme: 'light',
    },
};

export const UpdateAvailable: Story = {
    render: () => {
        const banner = PwaUpdateBanner();
        const updateSW = (): Promise<void> => Promise.resolve();

        window.dispatchEvent(
            new CustomEvent(PWA_UPDATE_EVENT, {
                detail: { updateSW },
            })
        );

        return banner;
    },
    globals: {
        theme: 'light',
    },
};

export const Dark: Story = {
    render: () => {
        const banner = PwaUpdateBanner();
        const updateSW = (): Promise<void> => Promise.resolve();

        window.dispatchEvent(
            new CustomEvent(PWA_UPDATE_EVENT, {
                detail: { updateSW },
            })
        );

        return banner;
    },
    globals: {
        theme: 'dark',
    },
    parameters: {
        backgrounds: {
            default: 'dark',
        },
    },
};
