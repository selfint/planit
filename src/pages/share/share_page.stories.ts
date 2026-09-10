import type { Meta, StoryObj } from '@storybook/html';

import { SharePage } from './share_page';

const meta: Meta = {
    title: 'Pages/Share',
    parameters: {
        layout: 'fullscreen',
    },
};

export default meta;

type Story = StoryObj;

export const Default: Story = {
    render: () => SharePage(),
    globals: {
        theme: 'light',
    },
};

export const Dark: Story = {
    render: () => SharePage(),
    globals: {
        theme: 'dark',
    },
    parameters: {
        backgrounds: {
            default: 'dark',
        },
    },
};
