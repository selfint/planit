import type { Meta, StoryObj } from '@storybook/html';

import { AppFooter } from './AppFooter';

const meta: Meta = {
    title: 'Components/AppFooter',
};

export default meta;

export type Story = StoryObj;

export const Default: Story = {
    render: () => AppFooter(),
    globals: {
        theme: 'light',
    },
};

export const Dark: Story = {
    render: () => AppFooter(),
    globals: {
        theme: 'dark',
    },
    parameters: {
        backgrounds: {
            default: 'dark',
        },
    },
};
