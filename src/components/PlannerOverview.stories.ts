import type { Meta, StoryObj } from '@storybook/html';

import { PlannerOverview } from './PlannerOverview';

const meta: Meta = {
    title: 'Components/PlannerOverview',
};

export default meta;

export type Story = StoryObj;

export const Default: Story = {
    render: () => PlannerOverview(),
    globals: {
        theme: 'light',
    },
};

export const Dark: Story = {
    render: () => PlannerOverview(),
    globals: {
        theme: 'dark',
    },
    parameters: {
        backgrounds: {
            default: 'dark',
        },
    },
};
