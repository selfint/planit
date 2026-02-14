import type { Meta, StoryObj } from '@storybook/html';

import { LandingHero } from './LandingHero';

const meta: Meta = {
    title: 'Pages/Landing/LandingHero',
};

export default meta;

export type Story = StoryObj;

export const Default: Story = {
    render: () => LandingHero(),
    globals: {
        theme: 'light',
    },
};

export const Dark: Story = {
    render: () => LandingHero(),
    globals: {
        theme: 'dark',
    },
    parameters: {
        backgrounds: {
            default: 'dark',
        },
    },
};
