import type { Meta, StoryObj } from '@storybook/html';

import { DegreePicker } from './DegreePicker';

const meta: Meta = {
    title: 'Components/DegreePicker',
};

export default meta;

export type Story = StoryObj;

export const Default: Story = {
    render: () => DegreePicker(),
    globals: {
        theme: 'light',
    },
};

export const Dark: Story = {
    render: () => DegreePicker(),
    globals: { theme: 'dark' },
    parameters: {
        backgrounds: {
            default: 'dark',
        },
    },
};
