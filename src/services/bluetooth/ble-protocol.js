import { BLE_COMMANDS } from './ble-commands.js';

/**
 * BLE Protocol Helper
 * Handles payload encoding and status decoding according to the agreed protocol.
 */
export const BleProtocol = {
  /**
   * Parse single status byte from hardware
   * @param {number|DataView|Uint8Array} rawData
   * @returns {{ outlet1: boolean, outlet2: boolean }}
   */
  parseStatus(rawData) {
    let byteVal;
    if (typeof rawData === 'number') {
      byteVal = rawData;
    } else if (rawData instanceof DataView) {
      byteVal = rawData.getUint8(0);
    } else if (rawData instanceof Uint8Array) {
      byteVal = rawData[0];
    } else {
      throw new Error(`Invalid BLE status data format: ${typeof rawData}`);
    }

    switch (byteVal) {
      case 0:
        return { outlet1: false, outlet2: false };
      case 1:
        return { outlet1: true, outlet2: false };
      case 2:
        return { outlet1: false, outlet2: true };
      case 3:
        return { outlet1: true, outlet2: true };
      default:
        throw new Error(`Unknown BLE status byte received: ${byteVal}`);
    }
  },

  /**
   * Build Uint8Array payload for a command
   * @param {number} commandByte
   * @returns {Uint8Array}
   */
  buildPayload(commandByte) {
    if (!Object.values(BLE_COMMANDS).includes(commandByte)) {
      throw new Error(`Invalid command byte: ${commandByte}`);
    }
    return new Uint8Array([commandByte]);
  },
};
