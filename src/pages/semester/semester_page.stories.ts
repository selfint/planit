import type { Meta, StoryObj } from '@storybook/html';

import { SemesterPage } from './semester_page';

type SemesterPageStoryArgs = {
    number: number;
};

const meta: Meta<SemesterPageStoryArgs> = {
    title: 'Pages/Semester',
    parameters: {
        layout: 'fullscreen',
    },
    argTypes: {
        number: {
            control: { type: 'number', min: 1, step: 1 },
            description: 'Semester number for /semester?number=<n>',
        },
    },
    args: {
        number: 3,
    },
};

export default meta;

type Story = StoryObj<SemesterPageStoryArgs>;

export const Default: Story = {
    render: (args) => {
        window.history.replaceState(null, '', buildSemesterUrl(args.number));
        return SemesterPage();
    },
    globals: {
        theme: 'light',
    },
};

export const Dark: Story = {
    render: (args) => {
        window.history.replaceState(null, '', buildSemesterUrl(args.number));
        return SemesterPage();
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

function buildSemesterUrl(semesterNumber: number): string {
    if (!Number.isInteger(semesterNumber) || semesterNumber < 1) {
        return '/semester';
    }

    return `/semester?number=${String(semesterNumber)}`;
}
