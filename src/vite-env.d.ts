/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/vanillajs" />

declare const __BUILD_SHA__: string;
declare module '*.webp?w=256' {
    const src: string;
    export default src;
}
