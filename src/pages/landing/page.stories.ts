import type { Meta, StoryObj } from '@storybook/html';

import { LandingPage } from './page';

const meta: Meta = {
    title: 'Pages/Landing',
    parameters: {
        layout: 'fullscreen',
    },
};

export default meta;

export type Story = StoryObj;

export const Default: Story = {
    render: () => LandingPage(),
    globals: {
        theme: 'light',
    },
};

export const Dark: Story = {
    render: () => LandingPage(),
    globals: {
        theme: 'dark',
    },
    parameters: {
        backgrounds: {
            default: 'dark',
        },
    },
};
