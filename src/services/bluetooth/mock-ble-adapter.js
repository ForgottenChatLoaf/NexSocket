import { BLE_CONFIG } from './ble-config.js';
import { BLE_COMMANDS } from './ble-commands.js';
import { logger } from '../../utils/logger.js';

/**
 * Mock BLE Adapter for development in browser without hardware.
 * Faithfully simulates an ESP32-C3 peripheral advertising SMART_OUTLET_01.
 */
export class MockBleAdapter {
  constructor() {
    this.connected = false;
    this.statusCallback = null;
    this.onDisconnected = null;
    this.internalStatus = 0; // 0 = BOTH OFF
    this.simulatedRssi = -58;
  }

  async initialize() {
    logger.debug('[MockBleAdapter] Initialized');
    return true;
  }

  async scan(onDeviceFound) {
    logger.debug('[MockBleAdapter] Scanning started');
    // Simulate finding the target device after realistic radio discovery latency
    return new Promise((resolve) => {
      setTimeout(() => {
        if (onDeviceFound) {
          onDeviceFound({
            name: BLE_CONFIG.deviceName,
            deviceId: 'ESP32-MOCK-DEV-01',
            rssi: this.simulatedRssi,
          });
        }
        resolve();
      }, 500);
    });
  }

  async stopScan() {
    logger.debug('[MockBleAdapter] Scanning stopped');
  }

  async connect(deviceId, onDisconnected) {
    logger.debug('[MockBleAdapter] Connecting to device:', deviceId);
    // Simulate connection negotiation delay
    await new Promise((resolve) => setTimeout(resolve, 600));
    this.connected = true;
    this.onDisconnected = onDisconnected;
    logger.info('[MockBleAdapter] Connected successfully to', deviceId);

    // Initial status report from peripheral
    if (this.statusCallback) {
      this.statusCallback(this.internalStatus);
    }
    return true;
  }

  async disconnect() {
    logger.debug('[MockBleAdapter] Disconnecting');
    this.connected = false;
    if (this.onDisconnected) {
      const cb = this.onDisconnected;
      this.onDisconnected = null;
      cb();
    }
    return true;
  }

  /**
   * Helper to simulate unexpected link loss (e.g. out of range, power loss)
   */
  simulateUnexpectedDisconnection() {
    if (this.connected) {
      this.disconnect();
    }
  }

  async writeCommand(commandByte) {
    if (!this.connected) {
      throw new Error('Device not connected: Cannot write to Command Characteristic');
    }
    logger.debug('[MockBleAdapter] Received command byte:', commandByte);

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
      case BLE_COMMANDS.ALL_ON:
        o1 = true;
        o2 = true;
        break;
      case BLE_COMMANDS.GET_STATUS:
        // Query status without modifying state
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
    }, 120);
  }

  subscribeStatus(callback) {
    this.statusCallback = callback;
    if (this.connected && callback) {
      callback(this.internalStatus);
    }
  }

  unsubscribeStatus() {
    this.statusCallback = null;
  }
}
