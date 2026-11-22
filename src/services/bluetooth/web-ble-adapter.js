import { BLE_CONFIG } from './ble-config.js';
import { logger } from '../../utils/logger.js';

/**
 * Check if the current browser environment supports the Web Bluetooth API.
 * Requirements:
 * - Chromium-based browser (Chrome, Edge, Opera, Samsung Internet)
 * - Secure context (HTTPS or localhost)
 * - User gesture on device pairing
 */
export function isWebBluetoothSupported() {
  return typeof navigator !== 'undefined' && Boolean(navigator.bluetooth);
}

/**
 * Web Bluetooth Adapter for direct browser communication with physical ESP32-C3 hardware.
 * Uses navigator.bluetooth to discover, pair, write commands, and receive GATT notifications.
 */
export class WebBleAdapter {
  constructor() {
    this.device = null;
    this.server = null;
    this.service = null;
    this.commandChar = null;
    this.statusChar = null;
    this.statusCallback = null;
    this.onDisconnected = null;
    this.connected = false;
    this.selectedDevice = null;
  }

  async initialize() {
    if (!isWebBluetoothSupported()) {
      logger.warn('[WebBleAdapter] Web Bluetooth API is not supported in this browser environment.');
      return false;
    }
    logger.info('[WebBleAdapter] Initialized successfully. Web Bluetooth API available.');
    return true;
  }

  /**
   * Prompts user with native browser Bluetooth picker to select the ESP32-C3 device.
   * Must be triggered from a user gesture (e.g., button click).
   */
  async scan(onDeviceFound) {
    if (!isWebBluetoothSupported()) {
      throw new Error(
        'Web Bluetooth is not supported in this browser. Please use Google Chrome or Microsoft Edge on localhost or HTTPS.'
      );
    }

    logger.debug('[WebBleAdapter] Requesting device via navigator.bluetooth.requestDevice...');

    try {
      // Filter for device by name, prefix, and requested GATT service UUID
      const device = await navigator.bluetooth.requestDevice({
        filters: [
          { name: BLE_CONFIG.deviceName },
          { namePrefix: 'SMART_OUTLET' },
          { services: [BLE_CONFIG.serviceUuid] },
        ],
        optionalServices: [BLE_CONFIG.serviceUuid],
      });

      this.selectedDevice = device;
      logger.info('[WebBleAdapter] Device selected by user:', device.name, device.id);

      if (onDeviceFound) {
        onDeviceFound({
          name: device.name || BLE_CONFIG.deviceName,
          deviceId: device.id,
          rssi: -60, // Web Bluetooth standard does not expose live RSSI to client scripts
        });
      }

      return device;
    } catch (err) {
      if (err.name === 'NotFoundError') {
        throw new Error('Device selection cancelled by user.');
      }
      throw err;
    }
  }

  async stopScan() {
    // In Web Bluetooth, scan closes automatically when user chooses or cancels the browser dialog.
    logger.debug('[WebBleAdapter] Stop scan called');
  }

  /**
   * Connect to the selected device's GATT server and discover characteristics
   */
  async connect(deviceId, onDisconnected) {
    if (!this.selectedDevice && (!this.device || this.device.id !== deviceId)) {
      throw new Error('No Bluetooth device selected. Please scan first.');
    }

    const device = this.selectedDevice || this.device;
    this.device = device;
    this.onDisconnected = onDisconnected;

    logger.info('[WebBleAdapter] Connecting to GATT Server for', device.name || deviceId);

    // Register disconnect listener
    device.addEventListener('gattserverdisconnected', () => {
      logger.warn('[WebBleAdapter] GATT Server disconnected unexpectedly');
      this.connected = false;
      this.server = null;
      this.service = null;
      this.commandChar = null;
      this.statusChar = null;
      if (this.onDisconnected) {
        const cb = this.onDisconnected;
        this.onDisconnected = null;
        cb();
      }
    });

    // 1. Establish GATT Server connection
    const server = await device.gatt.connect();
    this.server = server || device.gatt;
    this.connected = true;
    logger.info('[WebBleAdapter] GATT connected. Discovering primary service:', BLE_CONFIG.serviceUuid);

    // 2. Discover primary service
    this.service = await this.server.getPrimaryService(BLE_CONFIG.serviceUuid);

    // 3. Discover Command Characteristic (Write)
    this.commandChar = await this.service.getCharacteristic(BLE_CONFIG.commandCharacteristicUuid);
    logger.info('[WebBleAdapter] Found Command Characteristic:', BLE_CONFIG.commandCharacteristicUuid);

    // 4. Discover Status Characteristic (Notify/Read)
    this.statusChar = await this.service.getCharacteristic(BLE_CONFIG.statusCharacteristicUuid);
    logger.info('[WebBleAdapter] Found Status Characteristic:', BLE_CONFIG.statusCharacteristicUuid);

    // 5. If a status listener was already subscribed, activate notifications now
    if (this.statusCallback) {
      await this._startStatusNotifications();
    }

    return true;
  }

  async disconnect() {
    logger.info('[WebBleAdapter] Disconnecting');
    this.connected = false;
    if (this.device && this.device.gatt && this.device.gatt.connected) {
      this.device.gatt.disconnect();
    }
    this.server = null;
    this.service = null;
    this.commandChar = null;
    this.statusChar = null;
    if (this.onDisconnected) {
      const cb = this.onDisconnected;
      this.onDisconnected = null;
      cb();
    }
    return true;
  }

  /**
   * Write command byte to the ESP32-C3 Command Characteristic
   * @param {number} commandByte
   */
  async writeCommand(commandByte) {
    if (!this.connected || !this.commandChar) {
      throw new Error('Device not connected: Cannot write to Command Characteristic');
    }

    const payload = new Uint8Array([commandByte]);
    logger.debug('[WebBleAdapter] Writing command byte: 0x' + commandByte.toString(16).padStart(2, '0'));

    if (this.commandChar.writeValueWithResponse) {
      await this.commandChar.writeValueWithResponse(payload);
    } else {
      await this.commandChar.writeValue(payload);
    }
  }

  /**
   * Subscribe to status notifications from the ESP32-C3 Status Characteristic
   * @param {Function} callback (rawStatusByte: number) => void
   */
  async subscribeStatus(callback) {
    this.statusCallback = callback;
    if (this.connected && this.statusChar) {
      await this._startStatusNotifications();
    }
  }

  async _startStatusNotifications() {
    if (!this.statusChar) return;
    try {
      await this.statusChar.startNotifications();
      logger.info('[WebBleAdapter] Subscribed to status characteristic notifications');

      this.statusChar.addEventListener('characteristicvaluechanged', (event) => {
        const dataView = event.target.value;
        if (dataView && dataView.byteLength > 0) {
          const rawStatus = dataView.getUint8(0);
          logger.debug('[WebBleAdapter] Notification received raw status: 0x' + rawStatus.toString(16));
          if (this.statusCallback) {
            this.statusCallback(rawStatus);
          }
        }
      });

      // Also read initial status value immediately
      try {
        const initialValue = await this.statusChar.readValue();
        if (initialValue && initialValue.byteLength > 0 && this.statusCallback) {
          this.statusCallback(initialValue.getUint8(0));
        }
      } catch (readErr) {
        logger.debug('[WebBleAdapter] Initial readValue optional attempt:', readErr.message);
      }
    } catch (err) {
      logger.error('[WebBleAdapter] Failed to start status notifications:', err);
      throw err;
    }
  }

  unsubscribeStatus() {
    if (this.statusChar) {
      try {
        this.statusChar.stopNotifications();
      } catch (e) {
        // Ignore during disconnect
      }
    }
    this.statusCallback = null;
  }
}
