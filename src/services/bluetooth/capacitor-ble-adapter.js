import { BleClient, numbersToDataView } from '@capacitor-community/bluetooth-le';
import { BLE_CONFIG } from './ble-config.js';
import { logger } from '../../utils/logger.js';

/**
 * Capacitor BLE Adapter for native Android execution.
 * Handles Bluetooth LE Central lifecycle: initialization, scanning, pairing,
 * GATT characteristic write and notifications with ESP32-C3 peripheral.
 */
export class CapacitorBleAdapter {
  constructor() {
    this.connectedDeviceId = null;
    this.isScanning = false;
  }

  /**
   * Initialize BLE subsystem and check hardware availability
   */
  async initialize() {
    logger.debug('[CapacitorBleAdapter] Initializing BLE subsystem');
    await BleClient.initialize();

    // Verify Bluetooth is enabled on the device
    const enabled = await BleClient.isEnabled();
    if (!enabled) {
      logger.warn('[CapacitorBleAdapter] Bluetooth is currently disabled. Requesting enable...');
      try {
        await BleClient.enable();
      } catch (err) {
        throw new Error('Bluetooth is disabled. Please turn on Bluetooth in Android settings.');
      }
    }
  }

  /**
   * Scan for advertising ESP32 peripheral SMART_OUTLET_01
   * @param {function} onDeviceFound
   */
  async scan(onDeviceFound) {
    if (this.isScanning) {
      await this.stopScan();
    }

    logger.debug('[CapacitorBleAdapter] Scanning for SMART_OUTLET_01');
    this.isScanning = true;

    try {
      await BleClient.requestLEScan(
        {
          // Scan for target service UUID or match by local name
          services: [BLE_CONFIG.serviceUuid],
        },
        (result) => {
          const deviceName = result.localName || result.device.name || '';
          const matchesName = deviceName.toUpperCase() === BLE_CONFIG.deviceName.toUpperCase();
          const matchesUuid = result.uuids && result.uuids.some(
            (u) => u.toLowerCase() === BLE_CONFIG.serviceUuid.toLowerCase()
          );

          if (matchesName || matchesUuid) {
            logger.info('[CapacitorBleAdapter] Target device discovered:', deviceName, result.device.deviceId);
            if (onDeviceFound) {
              onDeviceFound({
                name: deviceName || BLE_CONFIG.deviceName,
                deviceId: result.device.deviceId,
                rssi: result.rssi,
              });
            }
          }
        }
      );
    } catch (err) {
      this.isScanning = false;
      throw err;
    }
  }

  /**
   * Stop active BLE scan
   */
  async stopScan() {
    if (!this.isScanning) return;
    logger.debug('[CapacitorBleAdapter] Stopping BLE scan');
    this.isScanning = false;
    try {
      await BleClient.stopLEScan();
    } catch (err) {
      logger.warn('[CapacitorBleAdapter] stopLEScan notice:', err);
    }
  }

  /**
   * Connect to peripheral and handle disconnections
   * @param {string} deviceId
   * @param {function} onDisconnected
   */
  async connect(deviceId, onDisconnected) {
    logger.debug('[CapacitorBleAdapter] Connecting to device:', deviceId);

    // Ensure scan is stopped before connecting (Android best practice)
    await this.stopScan();

    await BleClient.connect(deviceId, (disconnectedId) => {
      logger.warn('[CapacitorBleAdapter] Device disconnected callback received for:', disconnectedId);
      this.connectedDeviceId = null;
      if (onDisconnected) {
        onDisconnected(disconnectedId);
      }
    });

    this.connectedDeviceId = deviceId;
    logger.info('[CapacitorBleAdapter] Connected successfully to:', deviceId);
  }

  /**
   * Disconnect from peripheral
   */
  async disconnect() {
    if (this.connectedDeviceId) {
      const id = this.connectedDeviceId;
      this.connectedDeviceId = null;
      logger.debug('[CapacitorBleAdapter] Disconnecting from:', id);
      try {
        await BleClient.disconnect(id);
      } catch (err) {
        logger.warn('[CapacitorBleAdapter] Disconnect error (ignored):', err);
      }
    }
  }

  /**
   * Write byte command to the Command Characteristic
   * @param {number} commandByte
   */
  async writeCommand(commandByte) {
    if (!this.connectedDeviceId) {
      throw new Error('Device not connected. Cannot write command to BLE GATT.');
    }

    const payload = numbersToDataView([commandByte]);
    logger.debug(
      `[CapacitorBleAdapter] Writing byte 0x0${commandByte.toString(16)} to characteristic ${BLE_CONFIG.commandCharacteristicUuid}`
    );

    await BleClient.write(
      this.connectedDeviceId,
      BLE_CONFIG.serviceUuid,
      BLE_CONFIG.commandCharacteristicUuid,
      payload
    );
  }

  /**
   * Read current status characteristic
   */
  async readStatus() {
    if (!this.connectedDeviceId) {
      throw new Error('Device not connected. Cannot read status.');
    }

    const dataView = await BleClient.read(
      this.connectedDeviceId,
      BLE_CONFIG.serviceUuid,
      BLE_CONFIG.statusCharacteristicUuid
    );
    return dataView.getUint8(0);
  }

  /**
   * Subscribe to notifications on Status Characteristic
   * @param {function} callback
   */
  async subscribeStatus(callback) {
    if (!this.connectedDeviceId) {
      throw new Error('Device not connected. Cannot subscribe to status notifications.');
    }

    logger.debug('[CapacitorBleAdapter] Subscribing to status notifications');

    // Read current initial status
    try {
      const initialStatus = await this.readStatus();
      if (callback) callback(initialStatus);
    } catch (err) {
      logger.warn('[CapacitorBleAdapter] Could not read initial status, waiting for notification:', err);
    }

    // Listen for notify events
    await BleClient.startNotifications(
      this.connectedDeviceId,
      BLE_CONFIG.serviceUuid,
      BLE_CONFIG.statusCharacteristicUuid,
      (value) => {
        if (callback) {
          const statusByte = value.getUint8(0);
          logger.debug('[CapacitorBleAdapter] Status notification received:', statusByte);
          callback(statusByte);
        }
      }
    );
  }

  /**
   * Unsubscribe from status notifications
   */
  async unsubscribeStatus() {
    if (this.connectedDeviceId) {
      try {
        await BleClient.stopNotifications(
          this.connectedDeviceId,
          BLE_CONFIG.serviceUuid,
          BLE_CONFIG.statusCharacteristicUuid
        );
      } catch (err) {
        logger.warn('[CapacitorBleAdapter] stopNotifications error:', err);
      }
    }
  }
}
