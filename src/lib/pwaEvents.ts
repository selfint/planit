export const PWA_UPDATE_EVENT = 'planit:pwa-update';

export type UpdateSW = (reloadPage?: boolean) => Promise<void>;
