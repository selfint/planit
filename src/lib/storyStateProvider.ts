import type { StateProvider } from '$lib/stateManagement';

type StoryStateProviderOverrides = {
    courses?: Partial<StateProvider['courses']>;
    catalogs?: Partial<StateProvider['catalogs']>;
    requirements?: Partial<StateProvider['requirements']>;
    userDegree?: Partial<StateProvider['userDegree']>;
    userPlan?: Partial<StateProvider['userPlan']>;
};

function unresolved<T>(): Promise<T> {
    return Promise.resolve(undefined as T);
}

const defaultCourses: StateProvider['courses'] = {
    get(): ReturnType<StateProvider['courses']['get']> {
        return unresolved();
    },
    set(): ReturnType<StateProvider['courses']['set']> {
        return Promise.resolve();
    },
    query(): ReturnType<StateProvider['courses']['query']> {
        return unresolved();
    },
    page(): ReturnType<StateProvider['courses']['page']> {
        return unresolved();
    },
    count(): ReturnType<StateProvider['courses']['count']> {
        return unresolved();
    },
    faculties(): ReturnType<StateProvider['courses']['faculties']> {
        return unresolved();
    },
    getLastSync(): ReturnType<StateProvider['courses']['getLastSync']> {
        return unresolved();
    },
};

const defaultCatalogs: StateProvider['catalogs'] = {
    get(): ReturnType<StateProvider['catalogs']['get']> {
        return unresolved();
    },
    set(): ReturnType<StateProvider['catalogs']['set']> {
        return Promise.resolve();
    },
};

const defaultRequirements: StateProvider['requirements'] = {
    get(): ReturnType<StateProvider['requirements']['get']> {
        return unresolved();
    },
    sync(): ReturnType<StateProvider['requirements']['sync']> {
        return unresolved();
    },
};

const defaultUserDegree: StateProvider['userDegree'] = {
    get(): ReturnType<StateProvider['userDegree']['get']> {
        return unresolved();
    },
    set(): ReturnType<StateProvider['userDegree']['set']> {
        return Promise.resolve();
    },
};

const defaultUserPlan: StateProvider['userPlan'] = {
    get(): ReturnType<StateProvider['userPlan']['get']> {
        return unresolved();
    },
    set(): ReturnType<StateProvider['userPlan']['set']> {
        return Promise.resolve();
    },
};

export function createStoryStateProvider(
    overrides: StoryStateProviderOverrides = {}
): StateProvider {
    return {
        courses: {
            ...defaultCourses,
            ...overrides.courses,
        },
        catalogs: {
            ...defaultCatalogs,
            ...overrides.catalogs,
        },
        requirements: {
            ...defaultRequirements,
            ...overrides.requirements,
        },
        userDegree: {
            ...defaultUserDegree,
            ...overrides.userDegree,
        },
        userPlan: {
            ...defaultUserPlan,
            ...overrides.userPlan,
        },
    };
}

export type { StoryStateProviderOverrides };
