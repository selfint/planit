export type FirebaseWebConfig = {
    apiKey: string;
    authDomain: string;
    projectId: string;
    storageBucket: string;
    messagingSenderId: string;
    appId: string;
    measurementId: string;
};

export type FirebaseUser = {
    uid: string;
} & Record<string, unknown>;

const DEFAULT_EMULATOR_AUTH_HOST = '127.0.0.1:9099';
const DEFAULT_EMULATOR_FIRESTORE_HOST = '127.0.0.1:8080';

const DEFAULT_FIREBASE_WEB_CONFIG: FirebaseWebConfig = {
    apiKey: 'AIzaSyBU4Z-kNIh2B1pVy5QZMuZsY9NqTp487i4',
    authDomain: 'degree-planner-d8f8d.firebaseapp.com',
    projectId: 'degree-planner-d8f8d',
    storageBucket: 'degree-planner-d8f8d.firebasestorage.app',
    messagingSenderId: '625307050657',
    appId: '1:625307050657:web:9c6134abdc1ac0fc5cc6e0',
    measurementId: 'G-9XWSYCZWZX',
};

const FIREBASE_CDN_VERSION = '12.9.0';

const FIREBASE_CDN_URLS = {
    app: `https://www.gstatic.com/firebasejs/${FIREBASE_CDN_VERSION}/firebase-app.js`,
    auth: `https://www.gstatic.com/firebasejs/${FIREBASE_CDN_VERSION}/firebase-auth.js`,
    firestore: `https://www.gstatic.com/firebasejs/${FIREBASE_CDN_VERSION}/firebase-firestore.js`,
};

type FirebaseAuth = {
    currentUser: FirebaseUser | null;
};

type FirebaseAppModule = {
    initializeApp(config: FirebaseWebConfig): unknown;
};

type GoogleAuthProviderClass = {
    new (): unknown;
    credential(idToken: string): unknown;
};

type FirebaseAuthModule = {
    GoogleAuthProvider: GoogleAuthProviderClass;
    connectAuthEmulator(auth: FirebaseAuth, url: string): void;
    getAuth(app: unknown): FirebaseAuth;
    onAuthStateChanged(
        auth: FirebaseAuth,
        callback: (user: FirebaseUser | null) => void
    ): () => void;
    signInWithCredential(
        auth: FirebaseAuth,
        credential: unknown
    ): Promise<unknown>;
    signInWithPopup(auth: FirebaseAuth, provider: unknown): Promise<unknown>;
    signOut(auth: FirebaseAuth): Promise<void>;
};

type FirebaseFirestoreModule = {
    connectFirestoreEmulator(
        database: unknown,
        host: string,
        port: number
    ): void;
    getFirestore(app: unknown): unknown;
};

type FirebaseSdkModules = {
    appModule: FirebaseAppModule;
    authModule: FirebaseAuthModule;
    firestoreModule: FirebaseFirestoreModule;
};

type FirebaseRuntime = {
    auth: FirebaseAuth;
    authModule: FirebaseAuthModule;
};

type FirebaseSdkLoader = () => Promise<FirebaseSdkModules>;

const userChangeListeners = new Set<(user: FirebaseUser | null) => void>();

let sdkLoader: FirebaseSdkLoader = loadFirebaseSdkFromCdn;
let firebaseRuntime: FirebaseRuntime | null = null;
let firebaseRuntimePromise: Promise<FirebaseRuntime> | null = null;
let firebaseUser: FirebaseUser | null = null;
let emulatorsConnected = false;

export async function preloadFirebase(): Promise<void> {
    await ensureFirebaseRuntime();
}

export async function login(): Promise<void> {
    const runtime = await ensureFirebaseRuntime();
    if (isFirebaseEmulatorEnabled()) {
        const credential = runtime.authModule.GoogleAuthProvider.credential(
            buildEmulatorGoogleIdToken()
        );
        await runtime.authModule.signInWithCredential(runtime.auth, credential);
        setFirebaseUser(runtime.auth.currentUser);
        return;
    }

    const provider = new runtime.authModule.GoogleAuthProvider();
    await runtime.authModule.signInWithPopup(runtime.auth, provider);
    setFirebaseUser(runtime.auth.currentUser);
}

export async function logout(): Promise<void> {
    const runtime = await ensureFirebaseRuntime();
    await runtime.authModule.signOut(runtime.auth);
    setFirebaseUser(runtime.auth.currentUser);
}

export function getUser(): FirebaseUser | null {
    if (firebaseRuntime === null) {
        return firebaseUser;
    }

    return firebaseRuntime.auth.currentUser;
}

export function onUserChange(
    listener: (user: FirebaseUser | null) => void
): () => void {
    userChangeListeners.add(listener);
    return () => {
        userChangeListeners.delete(listener);
    };
}

async function ensureFirebaseRuntime(): Promise<FirebaseRuntime> {
    if (firebaseRuntime !== null) {
        return firebaseRuntime;
    }

    if (firebaseRuntimePromise !== null) {
        return firebaseRuntimePromise;
    }

    firebaseRuntimePromise = createFirebaseRuntime();
    firebaseRuntime = await firebaseRuntimePromise;
    return firebaseRuntime;
}

async function createFirebaseRuntime(): Promise<FirebaseRuntime> {
    const { appModule, authModule, firestoreModule } = await sdkLoader();
    const app = appModule.initializeApp(DEFAULT_FIREBASE_WEB_CONFIG);
    const auth = authModule.getAuth(app);
    const firestore = firestoreModule.getFirestore(app);

    if (isFirebaseEmulatorEnabled() && !emulatorsConnected) {
        const authEmulatorHost =
            readEnvString('VITE_FIREBASE_AUTH_EMULATOR_HOST') ??
            DEFAULT_EMULATOR_AUTH_HOST;
        const firestoreEmulatorHost =
            readEnvString('VITE_FIREBASE_FIRESTORE_EMULATOR_HOST') ??
            DEFAULT_EMULATOR_FIRESTORE_HOST;
        const firestoreHost = parseFirestoreHost(firestoreEmulatorHost);
        authModule.connectAuthEmulator(auth, `http://${authEmulatorHost}`);
        firestoreModule.connectFirestoreEmulator(
            firestore,
            firestoreHost.host,
            firestoreHost.port
        );
        emulatorsConnected = true;
    }

    authModule.onAuthStateChanged(auth, (user) => {
        setFirebaseUser(user);
    });
    setFirebaseUser(auth.currentUser);

    return {
        auth,
        authModule,
    };
}

function parseFirestoreHost(value: string): { host: string; port: number } {
    const segments = value.split(':');
    if (segments.length !== 2) {
        throw new Error(
            `Invalid firestore emulator host value: "${value}". Expected host:port.`
        );
    }

    const port = Number.parseInt(segments[1], 10);
    if (Number.isNaN(port)) {
        throw new Error(
            `Invalid firestore emulator port in value: "${value}". Expected numeric port.`
        );
    }

    return {
        host: segments[0],
        port,
    };
}

function isFirebaseEmulatorEnabled(): boolean {
    return readEnvString('VITE_FIREBASE_EMULATOR') === 'on';
}

function readEnvString(key: string): string | undefined {
    const env = import.meta.env as Record<string, unknown>;
    const value = env[key];
    if (typeof value === 'string') {
        return value;
    }

    return undefined;
}

function buildEmulatorGoogleIdToken(): string {
    return JSON.stringify({
        sub: 'planit-test-user',
        email: 'planit-test-user@example.com',
        email_verified: true,
    });
}

function setFirebaseUser(user: FirebaseUser | null): void {
    firebaseUser = user;
    for (const listener of userChangeListeners) {
        listener(user);
    }
}

async function loadFirebaseSdkFromCdn(): Promise<FirebaseSdkModules> {
    const appModuleUnknown: unknown = await import(
        /* @vite-ignore */ FIREBASE_CDN_URLS.app
    );
    const authModuleUnknown: unknown = await import(
        /* @vite-ignore */ FIREBASE_CDN_URLS.auth
    );
    const firestoreModuleUnknown: unknown = await import(
        /* @vite-ignore */ FIREBASE_CDN_URLS.firestore
    );

    return {
        appModule: appModuleUnknown as unknown as FirebaseAppModule,
        authModule: authModuleUnknown as unknown as FirebaseAuthModule,
        firestoreModule:
            firestoreModuleUnknown as unknown as FirebaseFirestoreModule,
    };
}

export function __setFirebaseSdkLoaderForTests(
    loader: FirebaseSdkLoader
): void {
    sdkLoader = loader;
}

export function __resetFirebaseForTests(): void {
    sdkLoader = loadFirebaseSdkFromCdn;
    firebaseRuntime = null;
    firebaseRuntimePromise = null;
    firebaseUser = null;
    emulatorsConnected = false;
    userChangeListeners.clear();
}
