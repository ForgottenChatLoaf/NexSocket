/**
 * Application Configuration
 */
export const APP_CONFIG = {
  appName: 'SmartOutlet',
  version: '1.0.0',
  logoPath: '/assets/brand/smartoutlet-placeholder.svg',
  isDev: import.meta.env.DEV,
  useMockBle: import.meta.env.VITE_USE_MOCK_BLE === 'true',
  logLevel: import.meta.env.VITE_LOG_LEVEL || 'info',
};
