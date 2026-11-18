import { APP_CONFIG } from '../config/app-config.js';

export const logger = {
  debug(...args) {
    if (APP_CONFIG.logLevel === 'debug') {
      console.log('[DEBUG]', ...args);
    }
  },
  info(...args) {
    console.info('[INFO]', ...args);
  },
  warn(...args) {
    console.warn('[WARN]', ...args);
  },
  error(...args) {
    console.error('[ERROR]', ...args);
  },
};
