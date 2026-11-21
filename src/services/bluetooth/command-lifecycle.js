/**
 * Command Lifecycle States & Constants for NexSocket
 * 
 * Lifecycle transitions:
 * IDLE -> PENDING (Command initiated, awaiting hardware response)
 *   -> CONFIRMED (Hardware relay status acknowledged via BLE notification)
 *   -> FAILED (Timeout exceeded or transport error)
 */

export const COMMAND_STATUS = {
  IDLE: 'idle',
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  FAILED: 'failed',
};

export const COMMAND_TIMEOUT_MS = 3500;

export const COMMAND_NAMES = {
  0x01: 'Outlet 1 ON',
  0x02: 'Outlet 1 OFF',
  0x03: 'Outlet 2 ON',
  0x04: 'Outlet 2 OFF',
  0x05: 'Turn All OFF (Master Shutoff)',
  0x06: 'Turn All ON (Master Power)',
  0x07: 'Query Status (GET_STATUS)',
};
