import type { Meta, StoryObj } from '@storybook/html';

import { ConsoleNav } from './ConsoleNav';

const meta: Meta = {
    title: 'Components/ConsoleNav',
};

export default meta;

export type Story = StoryObj;

export const Default: Story = {
    render: () => ConsoleNav({ activePath: '/plan' }),
    globals: {
        theme: 'light',
    },
};

export const Dark: Story = {
    render: () => ConsoleNav({ activePath: '/search' }),
    globals: {
        theme: 'dark',
    },
    parameters: {
        backgrounds: {
            default: 'dark',
        },
    },
};
