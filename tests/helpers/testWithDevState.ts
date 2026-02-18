import { expect, test as base } from '@playwright/test';

import { createDefaultDevStateSnapshot, setDevState } from './devState';

const test = base;

test.beforeEach(async ({ page }) => {
    await setDevState(page, createDefaultDevStateSnapshot());
});

export { expect, test };
