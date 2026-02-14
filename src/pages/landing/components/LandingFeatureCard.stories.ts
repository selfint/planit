import type { Meta, StoryObj } from '@storybook/html';

import { LandingFeatureCard } from './LandingFeatureCard';

const meta: Meta = {
    title: 'Pages/Landing/LandingFeatureCard',
};

export default meta;

export type Story = StoryObj;

export const Default: Story = {
    render: () =>
        LandingFeatureCard({
            label: 'מתכנן סמסטר',
            title: 'תכנון מסודר',
            description: 'ראו את כל הסמסטרים, נק"ז ועומסים במקום אחד.',
            href: '/plan',
            linkLabel: 'מעבר למתכנן →',
            mediaAlt: 'תצוגת מתכנן',
        }),
    globals: {
        theme: 'light',
    },
};

export const Dark: Story = {
    render: () =>
        LandingFeatureCard({
            label: 'קטלוגים',
            title: 'דרישות ברורות',
            description: 'בחירת מסלול והשוואת דרישות בצורה נקייה.',
            href: '/catalog',
            linkLabel: 'בדיקת קטלוגים →',
            mediaAlt: 'תצוגת קטלוג',
        }),
    globals: {
        theme: 'dark',
    },
    parameters: {
        backgrounds: {
            default: 'dark',
        },
    },
};
