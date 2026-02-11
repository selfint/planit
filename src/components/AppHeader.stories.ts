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
    decorators: [
        (Story) => {
            const wrapper = document.createElement('div');
            wrapper.dataset.theme = 'dark';
            const story = Story();
            if (typeof story === 'string') {
                wrapper.innerHTML = story;
            } else {
                wrapper.appendChild(story);
            }
            return wrapper;
        },
    ],
    parameters: {
        backgrounds: {
 default: 'dark'
},
    },
};
