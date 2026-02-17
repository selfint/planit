import { type Locator, type Page, expect, test } from '@playwright/test';

const DEFAULT_COURSE_CODE = '03240033';
const COURSE_CODE =
    process.env.PW_DEMO_COURSE_CODE?.trim() ?? DEFAULT_COURSE_CODE;

test.describe('first-time-user-experience', () => {
    test('completes landing to semester journey with selected catalog course', async ({
        page,
    }) => {
        test.setTimeout(120_000);

        await page.goto('http://localhost:5173/planit/');
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(1200);
        await resetClientCache(page);
        await page.reload();
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(1200);
        await installDemoCursor(page);
        await page.waitForTimeout(1000);
        await expect(
            page.locator('[data-component="LandingHero"]')
        ).toBeVisible();
        await page.waitForTimeout(1200);

        const catalogsLink = page.getByRole('link', { name: 'קטלוגים' }).first();
        await humanMove(page, catalogsLink);
        await humanClick(page, catalogsLink);
        await page.waitForTimeout(1000);
        await expect(page).toHaveURL(/\/catalog$/);
        await expect(page.locator('[data-page="catalog"]')).toBeVisible();
        await page.waitForTimeout(1700);

        await selectFirstNonEmptyOption(page, '[data-degree-catalog]');
        await page.waitForTimeout(900);
        await selectFirstNonEmptyOption(page, '[data-degree-faculty]');
        await page.waitForTimeout(900);
        await selectFirstNonEmptyOption(page, '[data-degree-program]');
        await page.waitForTimeout(900);
        await selectPathIfRequired(page);
        await page.waitForTimeout(1200);

        await expect(page.locator('[data-catalog-groups]')).toBeVisible();
        await page.waitForTimeout(1700);

        const selectedCourseCode = await openCourseFromCatalog(page, COURSE_CODE);
        await page.waitForTimeout(1000);
        await expect(page).toHaveURL(
            new RegExp(`/course\\?code=${selectedCourseCode}$`)
        );
        await expect(page.locator('[data-page="course"]')).toBeVisible();
        await page.waitForTimeout(1500);

        const wishlistAdd = page.locator('[data-role="wishlist-add"]');
        if ((await wishlistAdd.count()) > 0) {
            await humanClick(page, wishlistAdd);
            await page.waitForTimeout(900);
            await expect(
                page.locator('[data-role="wishlist-status"]')
            ).toContainText(/נוסף|כבר/);
            await page.waitForTimeout(1200);
        }

        await humanClick(
            page,
            page.locator('[data-page="course"] a[href="/plan"]').first()
        );
        await page.waitForTimeout(1000);
        await expect(page).toHaveURL(/\/plan$/);
        await expect(page.locator('[data-page="plan"]')).toBeVisible();
        await page.waitForTimeout(1800);

        const wishlistCourse = page.locator(
            `[data-course-action][data-row-id="wishlist"][data-course-code="${selectedCourseCode}"]`
        );
        const wishlistCount = await wishlistCourse.count();
        if (wishlistCount > 0) {
            await humanClick(page, wishlistCourse);
            await page.waitForTimeout(900);
        }

        const firstSemesterRow = page
            .locator('[data-plan-row][data-row-kind="semester"]')
            .first();
        await humanClick(page, firstSemesterRow.locator('header'));
        await page.waitForTimeout(1000);

        if (wishlistCount > 0) {
            await expect(
                firstSemesterRow.locator(
                    `[data-course-action][data-course-code="${selectedCourseCode}"]`
                )
            ).toHaveCount(1);
            await expect(wishlistCourse).toHaveCount(0);
            await page.waitForTimeout(1500);
        }

        if (!page.url().includes('/semester?number=1')) {
            await humanClick(
                page,
                firstSemesterRow.locator('[data-semester-link]').first()
            );
            await page.waitForTimeout(1000);
        }
        await expect(page).toHaveURL(/\/semester\?number=1$/);
        await expect(
            page.locator('[data-role="current-semester-title"]')
        ).toContainText('סמסטר');
        await page.waitForTimeout(1800);
        if (wishlistCount > 0) {
            await expect(
                page.locator(
                    `[data-role="current-semester-courses"] [data-course-code="${selectedCourseCode}"]`
                )
            ).toHaveCount(1);
            await page.waitForTimeout(1200);
        }
    });
});

async function selectFirstNonEmptyOption(
    page: Page,
    selector: string
): Promise<void> {
    const select = page.locator(selector);
    await expect(select).toBeVisible();
    await expect(select).toBeEnabled();
    await humanClick(page, select);
    await page.waitForTimeout(300);

    await expect
        .poll(async () => {
            return select.evaluate((node) => {
                if (!(node instanceof HTMLSelectElement)) {
                    return 0;
                }
                return Array.from(node.options).filter(
                    (option) => option.value.trim().length > 0
                ).length;
            });
        })
        .toBeGreaterThan(0);

    const selected = await select.evaluate((node) => {
        if (!(node instanceof HTMLSelectElement)) {
            return false;
        }
        const first = Array.from(node.options).find(
            (option) => option.value.trim().length > 0
        );
        if (first === undefined) {
            return false;
        }

        node.value = first.value;
        node.dispatchEvent(new Event('change', { bubbles: true }));
        return true;
    });

    expect(selected).toBe(true);
}

async function selectPathIfRequired(page: Page): Promise<void> {
    const pathSelect = page.locator('[data-degree-path]');
    await expect(pathSelect).toBeVisible();

    const isRequired = await pathSelect.evaluate((node) => {
        return node instanceof HTMLSelectElement && node.required;
    });
    if (!isRequired) {
        return;
    }

    await selectFirstNonEmptyOption(page, '[data-degree-path]');
}

async function openCourseFromCatalog(
    page: Page,
    preferredCourseCode?: string
): Promise<string> {
    if (preferredCourseCode !== undefined) {
        const encodedPreferredCode = encodeURIComponent(preferredCourseCode);
        const preferredLink = page
            .locator(`a[href*="/course?code=${encodedPreferredCode}"]`)
            .first();
        await expect(preferredLink).toBeVisible({ timeout: 15_000 });
        await humanClick(page, preferredLink);
        return preferredCourseCode;
    }

    const firstCourseLink = page.locator('a[href*="/course?code="]').first();
    await expect(firstCourseLink).toBeVisible({ timeout: 15_000 });

    const firstCourseHref = await firstCourseLink.getAttribute('href');
    if (firstCourseHref === null) {
        throw new Error('Could not find any course in catalog groups.');
    }

    await humanClick(page, firstCourseLink);

    const parsedCode = extractCourseCodeFromHref(firstCourseHref);
    if (parsedCode === null) {
        throw new Error(
            `Could not parse course code from catalog link: ${firstCourseHref}`
        );
    }

    return parsedCode;
}

function extractCourseCodeFromHref(href: string): string | null {
    const marker = '/course?code=';
    const markerIndex = href.indexOf(marker);
    if (markerIndex < 0) {
        return null;
    }

    const encoded = href.slice(markerIndex + marker.length).trim();
    if (encoded.length === 0) {
        return null;
    }

    try {
        const decoded = decodeURIComponent(encoded);
        return decoded.length > 0 ? decoded : null;
    } catch {
        return null;
    }
}

async function humanClick(page: Page, locator: Locator): Promise<void> {
    await expect(locator).toBeVisible();
    await locator.waitFor({ state: 'visible' });
    await locator.scrollIntoViewIfNeeded();
    const box = await locator.boundingBox();
    if (box === null) {
        throw new Error('Element not visible');
    }

    const x = box.x + box.width / 2;
    const y = box.y + box.height / 2;

    await page.mouse.move(x, y, { steps: 40 });
    await page.waitForTimeout(250);

    await page.mouse.down();
    await page.waitForTimeout(80);
    await page.mouse.up();
}

async function humanMove(page: Page, locator: Locator): Promise<void> {
    const box = await locator.boundingBox();
    if (box === null) {
        return;
    }

    const x = box.x + box.width / 2;
    const y = box.y + box.height / 2;

    await page.mouse.move(x, y, { steps: 35 });
    await page.waitForTimeout(200);
}

async function installDemoCursor(page: Page): Promise<void> {
    await page.addStyleTag({
        content: `
    * { cursor: none !important; }

    .demo-cursor {
      position: fixed;
      width: 20px;
      height: 20px;
      border: 2px solid black;
      border-radius: 50%;
      background: white;
      pointer-events: none;
      z-index: 999999;
      transform: translate(-50%, -50%);
    }
  `,
    });

    await page.evaluate(() => {
        const cursor = document.createElement('div');
        cursor.className = 'demo-cursor';
        document.body.appendChild(cursor);

        document.addEventListener('mousemove', (e) => {
            cursor.style.left = `${String(e.clientX)}px`;
            cursor.style.top = `${String(e.clientY)}px`;
        });
    });
}

async function resetClientCache(page: Page): Promise<void> {
    await page.evaluate(async () => {
        if ('serviceWorker' in navigator) {
            const registrations =
                await navigator.serviceWorker.getRegistrations();
            await Promise.all(
                registrations.map((registration) => registration.unregister())
            );
        }

        if ('caches' in window) {
            const cacheNames = await caches.keys();
            await Promise.all(
                cacheNames.map((cacheName) => caches.delete(cacheName))
            );
        }
    });
}
