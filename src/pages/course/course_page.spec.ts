import { expect, test } from '../../../tests/helpers/testWithDevState';

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
            page.locator('[data-page="course"] h1').first()
        ).toBeVisible();
        await expect(page.getByText('/course?code=104031')).toHaveCount(0);
    });
});
