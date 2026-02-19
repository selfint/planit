import type { StateProvider } from '$lib/stateManagement';

type StoryStateProviderOverrides = Partial<{
    [Key in keyof StateProvider]: Partial<StateProvider[Key]>;
}>;

export function createStoryStateProvider(
    overrides: StoryStateProviderOverrides = {}
): StateProvider {
    return {
        courses: {
            get: () => Promise.resolve(undefined),
            set: () => Promise.resolve(),
            query: () => Promise.resolve(undefined as never),
            page: () => Promise.resolve(undefined as never),
            count: () => Promise.resolve(undefined as never),
            faculties: () => Promise.resolve(undefined as never),
            getLastSync: () => Promise.resolve(undefined),
            ...overrides.courses,
        },
        catalogs: {
            get: () => Promise.resolve(undefined as never),
            set: () => Promise.resolve(),
            ...overrides.catalogs,
        },
        requirements: {
            get: () => Promise.resolve(undefined),
            sync: () => Promise.resolve(undefined as never),
            ...overrides.requirements,
        },
        userDegree: {
            get: () => Promise.resolve(undefined),
            set: () => Promise.resolve(),
            ...overrides.userDegree,
        },
        userPlan: {
            get: () => Promise.resolve(undefined),
            set: () => Promise.resolve(),
            ...overrides.userPlan,
        },
        firebase: {
            getUser: () => null,
            login: () => Promise.resolve(),
            logout: () => Promise.resolve(),
            ...overrides.firebase,
        },
    };
}

export type { StoryStateProviderOverrides };
