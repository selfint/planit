import type { Meta, StoryObj } from '@storybook/html';

import { CatalogPage } from './catalog_page';

const meta: Meta = {
    title: 'Pages/Catalog',
    parameters: {
        layout: 'fullscreen',
    },
};

export default meta;

export type Story = StoryObj;

export const Default: Story = {
    render: () => CatalogPage(),
    globals: {
        theme: 'light',
    },
};

export const Dark: Story = {
    render: () => CatalogPage(),
    globals: {
        theme: 'dark',
    },
    parameters: {
        backgrounds: {
            default: 'dark',
        },
    },
};
