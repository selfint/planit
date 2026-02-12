import type { Meta, StoryObj } from '@storybook/html';

import { StatusSidebar } from './StatusSidebar';

const meta: Meta = {
    title: 'Components/StatusSidebar',
};

export default meta;

export type Story = StoryObj;

export const Default: Story = {
    render: () => StatusSidebar(),
    globals: {
        theme: 'light',
    },
};

export const Dark: Story = {
    render: () => StatusSidebar(),
    globals: {
        theme: 'dark',
    },
    parameters: {
        backgrounds: {
            default: 'dark',
        },
    },
};
