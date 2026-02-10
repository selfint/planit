import './style.css';

import appLogo from '/favicon.svg';
import appTemplate from './app.html?raw';
import { initPWA } from './pwa.ts';
import { setupCounter } from './counter.ts';
import typescriptLogo from './typescript.svg';

const app = document.querySelector<HTMLDivElement>('#app');

if (!app) {
    throw new Error('Missing #app element');
}
app.innerHTML = appTemplate
    .replaceAll('{{appLogo}}', appLogo)
    .replaceAll('{{typescriptLogo}}', typescriptLogo);

const counterButton = document.querySelector<HTMLButtonElement>('#counter');

if (!counterButton) {
    throw new Error('Missing #counter button');
}

setupCounter(counterButton);

initPWA(app);
