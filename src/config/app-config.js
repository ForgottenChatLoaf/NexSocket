/**
 * Application Configuration
 */
export const APP_CONFIG = {
  appName: 'NexSocket',
  version: '1.0.0',
  logoPath: '/assets/brand/nexsocket-icon.svg',
  logoHorizontalPath: '/assets/brand/nexsocket-logo.svg',
  tagline: 'SMART OUTLET CONTROL',
  isDev: import.meta.env.DEV,
  useMockBle: import.meta.env.VITE_USE_MOCK_BLE === 'true',
  logLevel: import.meta.env.VITE_LOG_LEVEL || 'info',
};
