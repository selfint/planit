import type { Meta, StoryObj } from '@storybook/html';

import logoUrl from '../../assets/logo.webp';
import { LandingFeatureCard } from './LandingFeatureCard';

const meta: Meta = {
    title: 'Pages/Landing/LandingFeatureCard',
};

export default meta;

export type Story = StoryObj;

export const Default: Story = {
    render: () => {
        const wrapper = document.createElement('div');
        wrapper.className = 'flex flex-col gap-4';
        wrapper.appendChild(
            LandingFeatureCard({
                label: 'מתכנן סמסטר',
                title: 'תכנון מסודר',
                description: 'ראו את כל הסמסטרים, נק"ז ועומסים במקום אחד.',
                href: '/plan',
                linkLabel: 'מעבר למתכנן →',
                mediaSrc: logoUrl,
                mediaAlt: 'תצוגת מתכנן',
            })
        );
        wrapper.appendChild(
            LandingFeatureCard({
                label: 'קטלוגים',
                title: 'דרישות ברורות',
                description: 'בחירת מסלול והשוואת דרישות בצורה נקייה.',
                href: '/catalog',
                linkLabel: 'בדיקת קטלוגים →',
            })
        );
        return wrapper;
    },
    globals: {
        theme: 'light',
    },
};

export const Dark: Story = {
    render: () => {
        const wrapper = document.createElement('div');
        wrapper.className = 'flex flex-col gap-4';
        wrapper.appendChild(
            LandingFeatureCard({
                label: 'קטלוגים',
                title: 'דרישות ברורות',
                description: 'בחירת מסלול והשוואת דרישות בצורה נקייה.',
                href: '/catalog',
                linkLabel: 'בדיקת קטלוגים →',
                mediaSrc: logoUrl,
                mediaAlt: 'תצוגת קטלוג',
            })
        );
        wrapper.appendChild(
            LandingFeatureCard({
                label: 'סמסטרים',
                title: 'מעקב לכל תקופה',
                description: 'תיעוד עומסים, נקודות זכות, ושינויים בין סמסטרים.',
                href: '/semester',
                linkLabel: 'מעבר לסמסטר →',
            })
        );
        return wrapper;
    },
    globals: {
        theme: 'dark',
    },
    parameters: {
        backgrounds: {
            default: 'dark',
        },
    },
};
