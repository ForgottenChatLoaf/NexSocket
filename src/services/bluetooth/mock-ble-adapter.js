import { BLE_CONFIG } from './ble-config.js';
import { BLE_COMMANDS } from './ble-commands.js';
import { logger } from '../../utils/logger.js';

/**
 * Mock BLE Adapter for development in browser without hardware
 */
export class MockBleAdapter {
  constructor() {
    this.connected = false;
    this.statusCallback = null;
    this.internalStatus = 0; // 0 = BOTH OFF
  }

  async initialize() {
    logger.debug('[MockBleAdapter] Initialized');
    return true;
  }

  async scan(onDeviceFound) {
    logger.debug('[MockBleAdapter] Scanning started');
    // Simulate finding the target device after short delay
    setTimeout(() => {
      if (onDeviceFound) {
        onDeviceFound({
          name: BLE_CONFIG.deviceName,
          deviceId: 'MOCK-DEVICE-ID-ESP32-01',
          rssi: -58,
        });
      }
    }, 600);
  }

  async stopScan() {
    logger.debug('[MockBleAdapter] Scanning stopped');
  }

  async connect(deviceId) {
    logger.debug('[MockBleAdapter] Connecting to device:', deviceId);
    await new Promise((resolve) => setTimeout(resolve, 800));
    this.connected = true;
    logger.info('[MockBleAdapter] Connected successfully to', deviceId);
    return true;
  }

  async disconnect() {
    logger.debug('[MockBleAdapter] Disconnecting');
    this.connected = false;
    return true;
  }

  async writeCommand(commandByte) {
    if (!this.connected) {
      throw new Error('Device not connected');
    }
    logger.debug('[MockBleAdapter] Received command:', commandByte);

    let o1 = (this.internalStatus & 0x01) !== 0;
    let o2 = (this.internalStatus & 0x02) !== 0;

    switch (commandByte) {
      case BLE_COMMANDS.OUTLET_1_ON:
        o1 = true;
        break;
      case BLE_COMMANDS.OUTLET_1_OFF:
        o1 = false;
        break;
      case BLE_COMMANDS.OUTLET_2_ON:
        o2 = true;
        break;
      case BLE_COMMANDS.OUTLET_2_OFF:
        o2 = false;
        break;
      case BLE_COMMANDS.ALL_OFF:
        o1 = false;
        o2 = false;
        break;
      default:
        throw new Error(`Unknown command byte: ${commandByte}`);
    }

    this.internalStatus = (o1 ? 1 : 0) | (o2 ? 2 : 0);

    // Simulate notification arriving from ESP32 after hardware relay confirms
    setTimeout(() => {
      if (this.statusCallback) {
        this.statusCallback(this.internalStatus);
      }
    }, 150);
  }

  subscribeStatus(callback) {
    this.statusCallback = callback;
    // Initial status report
    if (this.connected && callback) {
      callback(this.internalStatus);
    }
  }

  unsubscribeStatus() {
    this.statusCallback = null;
  }
}
