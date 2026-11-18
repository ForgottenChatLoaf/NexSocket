import { bleService } from './bluetooth/ble-service.js';
import { BLE_COMMANDS } from './bluetooth/ble-commands.js';
import { logger } from '../utils/logger.js';

export const outletService = {
  async setOutlet1(turnOn) {
    logger.debug(`Setting Outlet 1 to ${turnOn ? 'ON' : 'OFF'}`);
    const cmd = turnOn ? BLE_COMMANDS.OUTLET_1_ON : BLE_COMMANDS.OUTLET_1_OFF;
    await bleService.sendCommand(cmd);
  },

  async setOutlet2(turnOn) {
    logger.debug(`Setting Outlet 2 to ${turnOn ? 'ON' : 'OFF'}`);
    const cmd = turnOn ? BLE_COMMANDS.OUTLET_2_ON : BLE_COMMANDS.OUTLET_2_OFF;
    await bleService.sendCommand(cmd);
  },

  async allOff() {
    logger.debug('Turning ALL outlets OFF');
    await bleService.sendCommand(BLE_COMMANDS.ALL_OFF);
  },
};
