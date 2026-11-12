import { ConsoleNav } from '$components/ConsoleNav';
import { state } from '$lib/stateManagement';

import templateHtml from './share_page.html?raw';

export function SharePage(): HTMLElement {
    const template = document.createElement('template');
    template.innerHTML = templateHtml;
    const templateElement = template.content.firstElementChild;
    if (!(templateElement instanceof HTMLTemplateElement)) {
        throw new Error('SharePage template element not found');
    }

    const root = templateElement.content.firstElementChild?.cloneNode(true);
    if (!(root instanceof HTMLElement)) {
        throw new Error('SharePage template root not found');
    }

    const consoleNavHost = root.querySelector<HTMLElement>('[data-console-nav]');
    if (consoleNavHost === null) {
        throw new Error('SharePage console nav host not found');
    }
    consoleNavHost.replaceWith(ConsoleNav({ activePath: '/share' }));

    bindShareActions(root);
    fillFromUrlIfPresent(root);
    return root;
}

function bindShareActions(root: HTMLElement): void {
    const shareCreate = root.querySelector<HTMLButtonElement>('[data-share-create]');
    const shareLink = root.querySelector<HTMLTextAreaElement>('[data-share-link]');
    const shareStatus = root.querySelector<HTMLElement>('[data-share-status]');
    const importInput = root.querySelector<HTMLTextAreaElement>('[data-share-import-input]');
    const importButton = root.querySelector<HTMLButtonElement>('[data-share-import]');
    const importStatus = root.querySelector<HTMLElement>('[data-share-import-status]');
    if (shareCreate === null || shareLink === null || shareStatus === null || importInput === null || importButton === null || importStatus === null) {
        throw new Error('SharePage required elements not found');
    }

    shareCreate.addEventListener('click', () => {
        void createShareLink(shareLink, shareStatus);
    });

    importButton.addEventListener('click', () => {
        void importPlan(importInput, importStatus);
    });
}

async function createShareLink(output: HTMLTextAreaElement, status: HTMLElement): Promise<void> {
    const userPlan = await state.userPlan.get();
    const encoded = btoa(unescape(encodeURIComponent(JSON.stringify(userPlan?.value ?? null))));
    const shareUrl = new URL('/share', window.location.origin);
    shareUrl.searchParams.set('plan', encoded);
    output.value = shareUrl.toString();
    status.classList.remove('hidden');
    status.textContent = 'קישור השיתוף נוצר. אפשר להעתיק ולשלוח.';
}

function fillFromUrlIfPresent(root: HTMLElement): void {
    const planToken = new URL(window.location.href).searchParams.get('plan');
    if (planToken === null) {
        return;
    }
    const importInput = root.querySelector<HTMLTextAreaElement>('[data-share-import-input]');
    if (importInput === null) {
        throw new Error('SharePage import input not found');
    }
    importInput.value = planToken;
}

async function importPlan(input: HTMLTextAreaElement, status: HTMLElement): Promise<void> {
    const value = input.value.trim();
    if (value === '') {
        throw new Error('Share import input is empty');
    }

    const parsed = parseImportedValue(value);
    await state.userPlan.set(parsed);
    status.classList.remove('hidden');
    status.textContent = 'התוכנית יובאה ונשמרה במכשיר זה.';
}

function parseImportedValue(value: string): unknown {
    const maybeUrl = value.startsWith('http://') || value.startsWith('https://') ? new URL(value) : null;
    const rawPayload = maybeUrl?.searchParams.get('plan') ?? value;
    const decoded = decodeURIComponent(escape(atob(rawPayload)));
    return JSON.parse(decoded);
}
