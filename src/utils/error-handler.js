import { logger } from './logger.js';

export function handleError(error, userMessage = 'An unexpected error occurred') {
  logger.error(userMessage, error);
  return {
    success: false,
    message: userMessage,
    detail: error?.message || String(error),
  };
}
