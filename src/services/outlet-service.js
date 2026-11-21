import { bleService } from './bluetooth/ble-service.js';
import { BLE_COMMANDS } from './bluetooth/ble-commands.js';
import { outletState } from '../state/outlet-state.js';
import { logger } from '../utils/logger.js';

export const outletService = {
  /**
   * Toggle Outlet 1 ON or OFF
   * @param {boolean} turnOn
   */
  async setOutlet1(turnOn) {
    const currentState = outletState.getState();
    if (!currentState.connected) {
      throw new Error('Cannot control Outlet 1: Bluetooth device is disconnected');
    }
    if (currentState.isPending) {
      throw new Error('A previous command is still pending confirmation');
    }

    logger.debug(`Setting Outlet 1 to ${turnOn ? 'ON' : 'OFF'}`);
    const cmd = turnOn ? BLE_COMMANDS.OUTLET_1_ON : BLE_COMMANDS.OUTLET_1_OFF;
    await bleService.sendCommand(cmd);
    return { success: true, command: cmd };
  },

  /**
   * Toggle Outlet 2 ON or OFF
   * @param {boolean} turnOn
   */
  async setOutlet2(turnOn) {
    const currentState = outletState.getState();
    if (!currentState.connected) {
      throw new Error('Cannot control Outlet 2: Bluetooth device is disconnected');
    }
    if (currentState.isPending) {
      throw new Error('A previous command is still pending confirmation');
    }

    logger.debug(`Setting Outlet 2 to ${turnOn ? 'ON' : 'OFF'}`);
    const cmd = turnOn ? BLE_COMMANDS.OUTLET_2_ON : BLE_COMMANDS.OUTLET_2_OFF;
    await bleService.sendCommand(cmd);
    return { success: true, command: cmd };
  },

  /**
   * Turn all outlets OFF (Master shutoff)
   */
  async allOff() {
    const currentState = outletState.getState();
    if (!currentState.connected) {
      throw new Error('Cannot shut down outlets: Bluetooth device is disconnected');
    }
    if (currentState.isPending) {
      throw new Error('A previous command is still pending confirmation');
    }

    logger.debug('Executing Master Shutoff: All Outlets OFF');
    await bleService.sendCommand(BLE_COMMANDS.ALL_OFF);
    return { success: true, command: BLE_COMMANDS.ALL_OFF };
  },

  /**
   * Turn all outlets ON (Master activate)
   */
  async allOn() {
    const currentState = outletState.getState();
    if (!currentState.connected) {
      throw new Error('Cannot energize outlets: Bluetooth device is disconnected');
    }
    if (currentState.isPending) {
      throw new Error('A previous command is still pending confirmation');
    }

    logger.debug('Executing Master Activate: All Outlets ON');
    await bleService.sendCommand(BLE_COMMANDS.ALL_ON);
    return { success: true, command: BLE_COMMANDS.ALL_ON };
  },

  /**
   * Request fresh status from peripheral
   */
  async requestStatus() {
    const currentState = outletState.getState();
    if (!currentState.connected) {
      throw new Error('Cannot query status: Bluetooth device is disconnected');
    }
    logger.debug('Querying peripheral device status');
    await bleService.sendCommand(BLE_COMMANDS.GET_STATUS);
    return { success: true, command: BLE_COMMANDS.GET_STATUS };
  },
};
