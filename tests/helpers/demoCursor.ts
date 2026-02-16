import type { Page } from '@playwright/test';

const DEMO_CURSOR_SCRIPT = String.raw`
(() => {
    const STYLE_ID = 'pw-demo-cursor-style';
    const CURSOR_ID = 'pw-demo-cursor';
    const RIPPLE_CLASS = 'pw-demo-cursor-ripple';

    if (document.getElementById(STYLE_ID) !== null) {
        return;
    }

    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = [
        '#'+CURSOR_ID+' {',
        'position: fixed;',
        'width: 24px;',
        'height: 24px;',
        'border-radius: 9999px;',
        'border: 2px solid rgba(255,255,255,0.95);',
        'background: rgba(20,184,166,0.45);',
        'box-shadow: 0 0 0 2px rgba(15,23,42,0.45), 0 8px 24px rgba(15,23,42,0.35);',
        'pointer-events: none;',
        'z-index: 2147483647;',
        'left: 0;',
        'top: 0;',
        'transform: translate(-999px, -999px);',
        'transition: transform 40ms linear;',
        '}',
        '.'+RIPPLE_CLASS+' {',
        'position: fixed;',
        'width: 24px;',
        'height: 24px;',
        'border-radius: 9999px;',
        'border: 3px solid rgba(45,212,191,0.85);',
        'background: rgba(45,212,191,0.25);',
        'pointer-events: none;',
        'z-index: 2147483646;',
        'left: 0;',
        'top: 0;',
        'transform: translate(-50%, -50%) scale(0.8);',
        'animation: pw-demo-cursor-click 420ms ease-out forwards;',
        '}',
        '@keyframes pw-demo-cursor-click {',
        '0% { opacity: 0.9; transform: translate(-50%, -50%) scale(0.8); }',
        '100% { opacity: 0; transform: translate(-50%, -50%) scale(2.6); }',
        '}',
    ].join('');
    document.head.append(style);

    const cursor = document.createElement('div');
    cursor.id = CURSOR_ID;
    document.documentElement.append(cursor);

    const moveCursor = (clientX, clientY) => {
        cursor.style.transform = 'translate(' + String(clientX - 12) + 'px, ' + String(clientY - 12) + 'px)';
    };

    const onMove = (event) => {
        moveCursor(event.clientX, event.clientY);
    };

    const onDown = (event) => {
        moveCursor(event.clientX, event.clientY);
        const ripple = document.createElement('div');
        ripple.className = RIPPLE_CLASS;
        ripple.style.left = String(event.clientX) + 'px';
        ripple.style.top = String(event.clientY) + 'px';
        ripple.addEventListener('animationend', () => {
            ripple.remove();
        });
        document.documentElement.append(ripple);
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerdown', onDown, { passive: true });
})();
`;

export async function installDemoCursor(page: Page): Promise<void> {
    await page.addInitScript(DEMO_CURSOR_SCRIPT);
}

export function isDemoModeEnabled(): boolean {
    return process.env.PW_DEMO === 'on';
}
