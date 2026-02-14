import type { Meta, StoryObj } from '@storybook/html';

import { LandingNav } from './LandingNav';

const meta: Meta = {
    title: 'Pages/Landing/LandingNav',
};

export default meta;

export type Story = StoryObj;

export const Default: Story = {
    render: () => LandingNav(),
    globals: {
        theme: 'light',
    },
    parameters: {
        viewport: {
            defaultViewport: 'responsive',
        },
    },
};

export const Dark: Story = {
    render: () => LandingNav(),
    globals: {
        theme: 'dark',
    },
    parameters: {
        backgrounds: {
            default: 'dark',
        },
        viewport: {
            defaultViewport: 'responsive',
        },
    },
};
