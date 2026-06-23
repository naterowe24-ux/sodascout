// Bottom nav is handled by Expo Router Tabs — this file is a shared type/constant reference
export const TAB_ROUTES = ['index', 'top-sips', 'review', 'saved', 'travel'] as const;
export type TabRoute = (typeof TAB_ROUTES)[number];
