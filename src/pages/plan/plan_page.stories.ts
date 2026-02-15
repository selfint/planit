import type { Meta, StoryObj } from '@storybook/html';

import { PlanPage } from './plan_page';

const meta: Meta = {
    title: 'Pages/Plan',
    parameters: {
        layout: 'fullscreen',
    },
};

export default meta;

type Story = StoryObj;

export const Default: Story = {
    render: () => PlanPage(),
    globals: {
        theme: 'light',
    },
};

export const Dark: Story = {
    render: () => PlanPage(),
    globals: {
        theme: 'dark',
    },
    parameters: {
        backgrounds: {
            default: 'dark',
        },
    },
};
