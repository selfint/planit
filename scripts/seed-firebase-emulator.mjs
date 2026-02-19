const AUTH_EMULATOR_HOST =
    process.env.FIREBASE_AUTH_EMULATOR_HOST ?? '127.0.0.1:9099';

const TEST_USER = {
    email: 'planit-test-user@example.com',
    password: 'PlanitTest123!',
    displayName: 'Planit Test User',
};

async function clearUsers() {
    const response = await fetch(
        `http://${AUTH_EMULATOR_HOST}/emulator/v1/projects/demo-planit/accounts`,
        {
            method: 'DELETE',
        }
    );

    if (!response.ok) {
        throw new Error(
            `Failed to clear auth emulator users: ${response.status}`
        );
    }
}

async function createUser() {
    const response = await fetch(
        `http://${AUTH_EMULATOR_HOST}/identitytoolkit.googleapis.com/v1/accounts:signUp?key=fake-api-key`,
        {
            method: 'POST',
            headers: {
                'content-type': 'application/json',
            },
            body: JSON.stringify({
                email: TEST_USER.email,
                password: TEST_USER.password,
                displayName: TEST_USER.displayName,
                returnSecureToken: true,
            }),
        }
    );

    if (!response.ok) {
        const text = await response.text();
        throw new Error(
            `Failed to create auth emulator user: ${response.status} ${text}`
        );
    }
}

await clearUsers();
await createUser();
