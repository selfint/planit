import type { Meta, StoryObj } from '@storybook/html';

import { NotFoundPage } from './not_found_page';

const meta: Meta = {
    title: 'Pages/NotFound',
    parameters: {
        layout: 'fullscreen',
    },
};

export default meta;

type Story = StoryObj;

export const Default: Story = {
    render: () => NotFoundPage('/missing-route'),
    globals: {
        theme: 'light',
    },
};

export const Dark: Story = {
    render: () => NotFoundPage('/missing-route'),
    globals: {
        theme: 'dark',
    },
    parameters: {
        backgrounds: {
            default: 'dark',
        },
    },
};
