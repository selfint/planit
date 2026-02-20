import { expect, test } from '@playwright/test';

test.describe('/course page route', () => {
    test('shows validation state when code is missing', async ({ page }) => {
        await page.goto('course');

        await expect(page.getByRole('main')).toBeVisible();
        await expect(page.getByText('לא נמצא קורס תואם')).toBeVisible();
        await expect(page.getByText('נדרש פרמטר code בכתובת')).toBeVisible();
    });

    test('accepts query-based course deep link', async ({ page }) => {
        await page.goto('course?code=104031');

        await expect(page.getByRole('main')).toBeVisible();
        await expect(
            page.getByRole('heading', { name: 'פרטי קורס' })
        ).toBeVisible();
        await expect(page.getByText('/course?code=104031')).toHaveCount(0);
    });

    test('switches to remove action after adding course to current semester', async ({
        page,
    }) => {
        await page.goto('course?code=104031');

        const addCurrentSemester = page.locator(
            '[data-role="semester-add-current"]'
        );
        const removePlacement = page.locator('[data-role="placement-remove"]');

        await expect(addCurrentSemester).toBeVisible();
        await addCurrentSemester.click();

        await expect(removePlacement).toBeVisible();
        await expect(removePlacement).toContainText('הסר מסמסטר 1');
        await expect(addCurrentSemester).toBeHidden();
    });
});
