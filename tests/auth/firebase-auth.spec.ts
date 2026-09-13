import { type APIRequestContext, expect, test } from '@playwright/test';

test.describe('firebase auth emulator flow', () => {
    test.use({ storageState: undefined });

    test('logs in and logs out from console nav', async ({ page }) => {
        await page.goto('plan');

        const loginButton = page.locator('[data-login]');
        const logoutButton = page.locator('[data-logout]');

        await expect(loginButton).toBeVisible();
        await expect(logoutButton).toBeHidden();

        await loginButton.click();

        await expect(logoutButton).toBeVisible();
        await expect(loginButton).toBeHidden();

        await logoutButton.click();

        await expect(loginButton).toBeVisible();
        await expect(logoutButton).toBeHidden();
    });

    test('reloads after sign in and hydrates remote firestore plan', async ({
        page,
        request,
    }) => {
        await seedFirestorePlanState(request, 9);

        await page.goto('plan');
        const semesterCountInput = page.locator('[data-semester-count]');
        await expect(semesterCountInput).toHaveValue('6');

        const loginButton = page.locator('[data-login]');
        const navigationEntriesBefore = await page.evaluate(() => {
            return performance.getEntriesByType('navigation').length;
        });

        await loginButton.click();

        await expect
            .poll(async () => {
                return page.evaluate(() => {
                    return performance.getEntriesByType('navigation').length;
                });
            })
            .toBeGreaterThan(navigationEntriesBefore);

        await expect(page.locator('[data-page="plan"]')).toBeVisible();
        await expect(semesterCountInput).toHaveValue('9');
    });
});

async function seedFirestorePlanState(
    request: APIRequestContext,
    semesterCount: number
): Promise<void> {
    const emulatorHost = process.env.VITE_FIREBASE_FIRESTORE_EMULATOR_HOST;
    if (emulatorHost === undefined || emulatorHost.length === 0) {
        throw new Error(
            'VITE_FIREBASE_FIRESTORE_EMULATOR_HOST must be set for firestore auth integration test.'
        );
    }

    const endpoint = `http://${emulatorHost}/v1/projects/demo-planit/databases/(default)/documents/users-v2/planit-test-user`;
    const payload = {
        fields: {
            planPageState: toFirestoreValue(
                buildPersistedPlanPayload(semesterCount)
            ),
        },
    };

    const response = await request.patch(endpoint, {
        data: payload,
    });

    if (!response.ok()) {
        throw new Error(
            `Failed to seed firestore plan state: ${String(response.status())} ${await response.text()}`
        );
    }
}

function buildPersistedPlanPayload(semesterCount: number): {
    version: number;
    semesterCount: number;
    currentSemester: number;
    semesters: { id: string; courseCodes: string[] }[];
} {
    const semesters = Array.from({ length: semesterCount }).map((_, index) => ({
        id: `seeded-${String(index)}`,
        courseCodes: [],
    }));

    return {
        version: 3,
        semesterCount,
        currentSemester: 0,
        semesters,
    };
}

function toFirestoreValue(value: unknown): Record<string, unknown> {
    if (value === null) {
        return { nullValue: null };
    }

    if (Array.isArray(value)) {
        return {
            arrayValue: {
                values: value.map((entry) => toFirestoreValue(entry)),
            },
        };
    }

    if (typeof value === 'string') {
        return { stringValue: value };
    }

    if (typeof value === 'number') {
        if (!Number.isFinite(value)) {
            throw new Error(
                'Cannot encode non-finite number for Firestore seed'
            );
        }

        if (Number.isInteger(value)) {
            return { integerValue: String(value) };
        }

        return { doubleValue: value };
    }

    if (typeof value === 'boolean') {
        return { booleanValue: value };
    }

    if (typeof value === 'object') {
        const fields: Record<string, unknown> = {};
        for (const [key, nested] of Object.entries(value)) {
            fields[key] = toFirestoreValue(nested);
        }
        return {
            mapValue: {
                fields,
            },
        };
    }

    throw new Error(`Cannot encode Firestore value for type: ${typeof value}`);
}
