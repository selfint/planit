import type { Meta, StoryObj } from '@storybook/html';

import { createAppHeader } from './AppHeader';

const meta: Meta = {
    title: 'Components/AppHeader',
    render: () => createAppHeader(),
};

export default meta;

export type Story = StoryObj;

export const Default: Story = {};
