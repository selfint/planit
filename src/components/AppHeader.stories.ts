import type { Meta, StoryObj } from '@storybook/html';

import { createAppHeader } from './AppHeader';
import { renderStorybookPreview } from './storybookRender';

const meta: Meta = {
    title: 'Components/AppHeader',
};

export default meta;

export type Story = StoryObj;

export const Default: Story = {
    render: () => renderStorybookPreview(createAppHeader, 'light'),
};

export const Dark: Story = {
    render: () => renderStorybookPreview(createAppHeader, 'dark'),
};
