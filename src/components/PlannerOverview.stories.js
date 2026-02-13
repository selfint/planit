import { PlannerOverview } from './PlannerOverview';

/** @type {import('@storybook/html').Meta} */
const meta = {
    title: 'Components/PlannerOverview',
};

export default meta;

/** @typedef {import('@storybook/html').StoryObj} Story */

/** @type {Story} */
export const Default = {
    render: () => PlannerOverview(),
    globals: {
        theme: 'light',
    },
};

/** @type {Story} */
export const Dark = {
    render: () => PlannerOverview(),
    globals: {
        theme: 'dark',
    },
    parameters: {
        backgrounds: {
            default: 'dark',
        },
    },
};
