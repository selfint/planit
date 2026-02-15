import type { Meta, StoryObj } from '@storybook/html';

import { SearchPage } from './search_page';

const meta: Meta = {
    title: 'Pages/Search',
    parameters: {
        layout: 'fullscreen',
    },
};

export default meta;

type Story = StoryObj;

export const Default: Story = {
    render: () => SearchPage(),
    globals: {
        theme: 'light',
    },
};

export const Dark: Story = {
    render: () => SearchPage(),
    globals: {
        theme: 'dark',
    },
    parameters: {
        backgrounds: {
            default: 'dark',
        },
    },
};
