import type { Meta, StoryObj } from '@storybook/html';

import { AppHeader } from './AppHeader';

const meta: Meta = {
    title: 'Components/AppHeader',
};

export default meta;

export type Story = StoryObj;

export const Default: Story = {
    render: () => AppHeader(),
    globals: {
        theme: 'light',
    },
};

export const Dark: Story = {
    render: () => AppHeader(),
    globals: {
        theme: 'dark',
    },
    parameters: {
        backgrounds: {
            default: 'dark',
        },
    },
};
