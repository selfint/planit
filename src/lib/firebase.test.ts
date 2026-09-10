import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
    __resetFirebaseForTests,
    __setFirebaseSdkLoaderForTests,
    getUser,
    loadUserData,
    login,
    logout,
    preloadFirebase,
    saveUserData,
} from '$lib/firebase';

type MockUser = {
    uid: string;
    email: string;
};

describe('firebase lib', () => {
    const user: MockUser = {
        uid: 'user-1',
        email: 'planit-test-user@example.com',
    };

    const state: {
        currentUser: MockUser | null;
    } = {
        currentUser: null,
    };

    const auth = {
        currentUser: null as MockUser | null,
    };

    const initializeApp = vi.fn(() => ({ name: 'app' }));
    const getAuth = vi.fn(() => auth);
    const firestore = { name: 'db' };
    const usersCollection = { name: 'users-v2' };
    const userDocument = { id: 'user-1' };
    const getFirestore = vi.fn(() => firestore);
    const collection = vi.fn(() => usersCollection);
    const doc = vi.fn(() => userDocument);
    const getDoc = vi.fn(() =>
        Promise.resolve({
            exists: () => false,
            data: () => undefined,
        })
    );
    const setDoc = vi.fn(() => Promise.resolve());
    const connectAuthEmulator = vi.fn();
    const connectFirestoreEmulator = vi.fn();
    const onAuthStateChanged = vi.fn(
        (
            instance: typeof auth,
            callback: (nextUser: MockUser | null) => void
        ): (() => void) => {
            callback(instance.currentUser);
            return () => undefined;
        }
    );
    const signInWithPopup = vi.fn(() => {
        state.currentUser = user;
        auth.currentUser = user;
        return Promise.resolve({ user });
    });
    const signOut = vi.fn(() => {
        state.currentUser = null;
        auth.currentUser = null;
        return Promise.resolve();
    });
    const signInWithCredential = vi.fn(() => {
        state.currentUser = user;
        auth.currentUser = user;
        return Promise.resolve({ user });
    });

    type MockGoogleAuthProviderType = {
        new (): unknown;
        credential(idToken: string): { idToken: string };
    };
    const MockGoogleAuthProvider = function MockGoogleAuthProvider(): void {
        return;
    } as unknown as MockGoogleAuthProviderType;
    MockGoogleAuthProvider.credential = function credential(idToken: string): {
        idToken: string;
    } {
        return { idToken };
    };

    beforeEach(() => {
        vi.unstubAllEnvs();
        state.currentUser = null;
        auth.currentUser = null;
        initializeApp.mockClear();
        getAuth.mockClear();
        getFirestore.mockClear();
        connectAuthEmulator.mockClear();
        connectFirestoreEmulator.mockClear();
        collection.mockClear();
        doc.mockClear();
        getDoc.mockClear();
        setDoc.mockClear();
        onAuthStateChanged.mockClear();
        signInWithPopup.mockClear();
        signOut.mockClear();
        signInWithCredential.mockClear();

        __setFirebaseSdkLoaderForTests(() => {
            return Promise.resolve({
                appModule: {
                    initializeApp,
                },
                authModule: {
                    GoogleAuthProvider: MockGoogleAuthProvider,
                    connectAuthEmulator,
                    getAuth,
                    onAuthStateChanged,
                    signInWithCredential,
                    signInWithPopup,
                    signOut,
                },
                firestoreModule: {
                    collection,
                    connectFirestoreEmulator,
                    doc,
                    getDoc,
                    getFirestore,
                    setDoc,
                },
            });
        });
    });

    afterEach(() => {
        __resetFirebaseForTests();
    });

    it('initializes sdk once when preloading multiple times', async () => {
        await preloadFirebase();
        await preloadFirebase();

        expect(initializeApp).toHaveBeenCalledTimes(1);
        expect(getAuth).toHaveBeenCalledTimes(1);
        expect(getFirestore).toHaveBeenCalledTimes(1);
    });

    it('signs in with popup in normal mode', async () => {
        await login();

        expect(signInWithPopup).toHaveBeenCalledTimes(1);
        expect(signInWithCredential).not.toHaveBeenCalled();
        expect(getUser()).toEqual(user);
    });

    it('signs in with credential in emulator mode', async () => {
        vi.stubEnv('VITE_FIREBASE_EMULATOR', 'on');

        await login();

        expect(signInWithCredential).toHaveBeenCalledTimes(1);
        expect(signInWithPopup).not.toHaveBeenCalled();
        expect(connectAuthEmulator).toHaveBeenCalledTimes(1);
        expect(connectFirestoreEmulator).toHaveBeenCalledTimes(1);
        expect(getUser()).toEqual(user);
    });

    it('logs out active user', async () => {
        await login();
        await logout();

        expect(signOut).toHaveBeenCalledTimes(1);
        expect(getUser()).toBeNull();
    });

    it('loads user data from users-v2 collection', async () => {
        auth.currentUser = user;
        getDoc.mockResolvedValueOnce({
            exists: () => true,
            data: () => ({ planPageState: { semesterCount: 8 } }),
        });

        const payload = await loadUserData<{ semesterCount: number }>(
            'planPageState'
        );

        expect(collection).toHaveBeenCalledWith({ name: 'db' }, 'users-v2');
        expect(doc).toHaveBeenCalledWith({ name: 'users-v2' }, 'user-1');
        expect(payload).toEqual({ semesterCount: 8 });
    });

    it('saves user data to users-v2 collection with merge', async () => {
        auth.currentUser = user;

        await saveUserData('planPageState', { semesterCount: 6 });

        expect(collection).toHaveBeenCalledWith({ name: 'db' }, 'users-v2');
        expect(doc).toHaveBeenCalledWith({ name: 'users-v2' }, 'user-1');
        expect(setDoc).toHaveBeenCalledWith(
            { id: 'user-1' },
            expect.objectContaining({
                planPageState: { semesterCount: 6 },
            }),
            { merge: true }
        );
    });
});
