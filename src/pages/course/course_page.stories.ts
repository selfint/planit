import type { Meta, StoryObj } from '@storybook/html';

import { CoursePage } from './course_page';

type CoursePageStoryArgs = {
    courseCode: string;
};

const meta: Meta<CoursePageStoryArgs> = {
    title: 'Pages/Course',
    parameters: {
        layout: 'fullscreen',
    },
    argTypes: {
        courseCode: {
            control: 'text',
            description: 'Course code for /course?code=XXXXXX',
        },
    },
    args: {
        courseCode: '104031',
    },
};

export default meta;

type Story = StoryObj<CoursePageStoryArgs>;

export const Default: Story = {
    render: (args) => {
        window.history.replaceState(null, '', buildCourseUrl(args.courseCode));
        return CoursePage();
    },
    globals: {
        theme: 'light',
    },
};

export const Dark: Story = {
    render: (args) => {
        window.history.replaceState(null, '', buildCourseUrl(args.courseCode));
        return CoursePage();
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

function buildCourseUrl(code: string): string {
    const normalized = code.trim();
    if (normalized.length === 0) {
        return '/course';
    }

    return `/course?code=${encodeURIComponent(normalized)}`;
}
