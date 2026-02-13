import { PWA_UPDATE_EVENT } from '$lib/pwa';

import { UpdateBanner } from './UpdateBanner';

/** @type {import('@storybook/html').Meta} */
const meta = {
    title: 'Components/UpdateBanner',
};

export default meta;

/** @typedef {import('@storybook/html').StoryObj} Story */

/** @returns {HTMLElement} */
function renderBanner() {
    const banner = UpdateBanner();
    const updateSW = () => Promise.resolve();
    window.dispatchEvent(
        new CustomEvent(PWA_UPDATE_EVENT, {
            detail: { updateSW },
        })
    );
    return banner;
}

/** @type {Story} */
export const Default = {
    render: () => renderBanner(),
    globals: {
        theme: 'light',
    },
};

/** @type {Story} */
export const Dark = {
    render: () => renderBanner(),
    globals: {
        theme: 'dark',
    },
    parameters: {
        backgrounds: {
            default: 'dark',
        },
    },
};
