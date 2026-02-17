import { type Locator, type Page, expect, test } from '@playwright/test';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const DEFAULT_COURSE_CODE = '03240033';
const COURSE_CODE =
    process.env.PW_DEMO_COURSE_CODE?.trim() ?? DEFAULT_COURSE_CODE;
const FTUX_VIDEO_OUTPUT_PATH = path.join(
    process.cwd(),
    'src',
    'assets',
    'demos',
    'first-time-user-experience.webm'
);
const MODERN_CURSOR_ASSET_PATH = fileURLToPath(
    new URL('../../src/assets/demos/modern-cursor.svg', import.meta.url)
);
const DEMO_TIME_SCALE_RAW = Number.parseFloat(
    process.env.PW_DEMO_TIME_SCALE ?? '1'
);
const DEMO_TIME_SCALE =
    Number.isFinite(DEMO_TIME_SCALE_RAW) && DEMO_TIME_SCALE_RAW > 0
        ? DEMO_TIME_SCALE_RAW
        : 1;

test.describe('first-time-user-experience', () => {
    test('completes landing to semester journey with selected catalog course', async ({
        page,
    }) => {
        test.setTimeout(120_000);

        await page.goto('catalog');
        // await page.waitForLoadState('networkidle');
        // await resetClientCache(page);
        // await page.reload();
        // await page.waitForLoadState('networkidle');
        await installDemoCursor(page);
        await expect(page).toHaveURL(/\/catalog$/);
        await expect(page.locator('[data-page="catalog"]')).toBeVisible();

        await selectFirstNonEmptyOption(page, '[data-degree-catalog]');
        await pause(page, 900);
        await selectFirstNonEmptyOption(page, '[data-degree-faculty]');
        await pause(page, 900);
        await selectFirstNonEmptyOption(page, '[data-degree-program]');
        await pause(page, 900);
        await selectPathIfRequired(page);
        await pause(page, 1200);

        await expect(page.locator('[data-catalog-groups]')).toBeVisible();
        await pause(page, 1700);

        const selectedCourseCode = await openCourseFromCatalog(
            page,
            COURSE_CODE
        );
        await pause(page, 1000);
        await expect(page).toHaveURL(
            new RegExp(`/course\\?code=${selectedCourseCode}$`)
        );
        await expect(page.locator('[data-page="course"]')).toBeVisible();
        await pause(page, 1500);

        const wishlistAdd = page.locator('[data-role="wishlist-add"]');
        if ((await wishlistAdd.count()) > 0) {
            await humanClick(page, wishlistAdd);
            await pause(page, 900);
            await expect(
                page.locator('[data-role="wishlist-status"]')
            ).toContainText(/נוסף|כבר/);
            await pause(page, 1200);
        }

        await humanClick(
            page,
            page.locator('[data-page="course"] a[href="/plan"]').first()
        );
        await pause(page, 1000);
        await expect(page).toHaveURL(/\/plan$/);
        await expect(page.locator('[data-page="plan"]')).toBeVisible();
        await pause(page, 1800);

        const wishlistCourse = page.locator(
            `[data-course-action][data-row-id="wishlist"][data-course-code="${selectedCourseCode}"]`
        );
        const wishlistCount = await wishlistCourse.count();
        if (wishlistCount > 0) {
            await humanClick(page, wishlistCourse);
            await pause(page, 900);
        }

        const firstSemesterRow = page
            .locator('[data-plan-row][data-row-kind="semester"]')
            .first();
        await humanClick(page, firstSemesterRow.locator('header'));
        await pause(page, 1000);

        if (wishlistCount > 0) {
            await expect(
                firstSemesterRow.locator(
                    `[data-course-action][data-course-code="${selectedCourseCode}"]`
                )
            ).toHaveCount(1);
            await expect(wishlistCourse).toHaveCount(0);
            await pause(page, 1500);
        }

        if (!page.url().includes('/semester?number=1')) {
            await humanClick(
                page,
                firstSemesterRow.locator('[data-semester-link]').first()
            );
            await pause(page, 1000);
        }
        await expect(page).toHaveURL(/\/semester\?number=1$/);
        await expect(
            page.locator('[data-role="current-semester-title"]')
        ).toContainText('סמסטר');
        await pause(page, 1800);
        if (wishlistCount > 0) {
            await expect(
                page.locator(
                    `[data-role="current-semester-courses"] [data-course-code="${selectedCourseCode}"]`
                )
            ).toHaveCount(1);
            await pause(page, 1200);
        }

        await saveFtuxVideo(page);
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
    await pause(page, 300);

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
    await smoothScrollToLocator(page, locator);
    const box = await locator.boundingBox();
    if (box === null) {
        throw new Error('Element not visible');
    }

    const x = box.x + box.width / 2;
    const y = box.y + box.height / 2;

    await page.mouse.move(x, y, { steps: 55 });
    await pause(page, 250);

    await setDemoCursorPressed(page, true);
    await page.mouse.down();
    await emitClickPulse(page, x, y);
    await pause(page, 80);
    await page.mouse.up();
    await setDemoCursorPressed(page, false);
    await pause(page, 120);
}

async function installDemoCursor(page: Page): Promise<void> {
    const cursorSvgMarkup = await fs.readFile(MODERN_CURSOR_ASSET_PATH, 'utf8');

    await page.addStyleTag({
        content: `
    * { cursor: none !important; }

    .demo-cursor {
      position: fixed;
      width: 56px;
      height: 56px;
      pointer-events: none;
      z-index: 999999;
      transform: translate(-50%, -50%);
      transition: transform 140ms ease-out, filter 140ms ease-out;
      filter: drop-shadow(0 6px 14px rgb(2 6 23 / 0.24));
    }

    .demo-cursor img {
      display: block;
      width: 100%;
      height: 100%;
    }

    .demo-cursor[data-pressed='true'] {
      transform: translate(-50%, -50%) scale(0.9);
      filter: drop-shadow(0 3px 8px rgb(2 6 23 / 0.2));
    }

    .demo-click-pulse {
      position: fixed;
      width: 12px;
      height: 12px;
      border-radius: 9999px;
      border: 2px solid var(--color-accent, rgb(20 184 166));
      background: transparent;
      pointer-events: none;
      z-index: 999998;
      transform: translate(-50%, -50%) scale(0.2);
      animation: demo-click-pulse 520ms ease-out forwards;
    }

    @keyframes demo-click-pulse {
      0% {
        opacity: 0.95;
        transform: translate(-50%, -50%) scale(0.2);
      }
      70% {
        opacity: 0.4;
      }
      100% {
        opacity: 0;
        transform: translate(-50%, -50%) scale(3.8);
      }
    }
  `,
    });

    const initialPosition = await page.evaluate((svgMarkup) => {
        const cursor = document.createElement('div');
        cursor.className = 'demo-cursor';
        cursor.innerHTML = svgMarkup;
        const svg = cursor.querySelector('svg');
        if (svg instanceof SVGElement) {
            svg.setAttribute('aria-hidden', 'true');
            svg.setAttribute('focusable', 'false');
        }

        const centerX = Math.round(window.innerWidth / 2);
        const centerY = Math.round(window.innerHeight / 2);
        cursor.style.left = `${String(centerX)}px`;
        cursor.style.top = `${String(centerY)}px`;
        document.body.appendChild(cursor);

        document.addEventListener('mousemove', (e) => {
            cursor.style.left = `${String(e.clientX)}px`;
            cursor.style.top = `${String(e.clientY)}px`;
        });

        return { x: centerX, y: centerY };
    }, cursorSvgMarkup);

    await page.mouse.move(initialPosition.x, initialPosition.y, { steps: 1 });
}

async function setDemoCursorPressed(
    page: Page,
    pressed: boolean
): Promise<void> {
    await page.evaluate((nextPressed) => {
        const cursor = document.querySelector('.demo-cursor');
        if (!(cursor instanceof HTMLElement)) {
            return;
        }
        cursor.dataset.pressed = nextPressed ? 'true' : 'false';
    }, pressed);
}

async function emitClickPulse(page: Page, x: number, y: number): Promise<void> {
    await page.evaluate(
        ({ pulseX, pulseY }) => {
            const pulse = document.createElement('span');
            pulse.className = 'demo-click-pulse';
            pulse.style.left = `${String(pulseX)}px`;
            pulse.style.top = `${String(pulseY)}px`;
            document.body.appendChild(pulse);
            window.setTimeout(() => {
                pulse.remove();
            }, 650);
        },
        { pulseX: x, pulseY: y }
    );
}

async function pause(page: Page, durationMs: number): Promise<void> {
    await page.waitForTimeout(
        Math.max(40, Math.round(durationMs * DEMO_TIME_SCALE))
    );
}

async function smoothScrollToLocator(
    page: Page,
    locator: Locator
): Promise<void> {
    await locator.evaluate(async (node) => {
        if (!(node instanceof HTMLElement)) {
            return;
        }
        node.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
            inline: 'center',
        });

        await new Promise<void>((resolve) => {
            let lastY = window.scrollY;
            let stableFrames = 0;

            const tick = (): void => {
                const currentY = window.scrollY;
                if (Math.abs(currentY - lastY) < 1) {
                    stableFrames += 1;
                } else {
                    stableFrames = 0;
                    lastY = currentY;
                }

                if (stableFrames >= 6) {
                    resolve();
                    return;
                }

                window.requestAnimationFrame(tick);
            };

            window.requestAnimationFrame(tick);
        });
    });
    await pause(page, 160);
}

// async function resetClientCache(page: Page): Promise<void> {
//     await page.evaluate(async () => {
//         if ('serviceWorker' in navigator) {
//             const registrations =
//                 await navigator.serviceWorker.getRegistrations();
//             await Promise.all(
//                 registrations.map((registration) => registration.unregister())
//             );
//         }

//         if ('caches' in window) {
//             const cacheNames = await caches.keys();
//             await Promise.all(
//                 cacheNames.map((cacheName) => caches.delete(cacheName))
//             );
//         }
//     });
// }

async function saveFtuxVideo(page: Page): Promise<void> {
    const video = page.video();
    if (video === null) {
        return;
    }

    await fs.mkdir(path.dirname(FTUX_VIDEO_OUTPUT_PATH), { recursive: true });
    await page.close();
    await video.saveAs(FTUX_VIDEO_OUTPUT_PATH);
}
