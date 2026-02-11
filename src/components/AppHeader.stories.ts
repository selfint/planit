import type { Meta, StoryObj } from '@storybook/html';

import { createAppHeader } from './AppHeader';

const meta: Meta = {
    title: 'Components/AppHeader',
};

export default meta;

export type Story = StoryObj;

export const Default: Story = {
    render: () => createAppHeader(),
};

export const Dark: Story = {
    render: () => createAppHeader(),
    globals: {
        theme: 'dark',
    },
    parameters: {
        backgrounds: {
            default: 'dark',
        },
    },
};
