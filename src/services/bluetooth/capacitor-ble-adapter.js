import { BleClient, numbersToDataView } from '@capacitor-community/bluetooth-le';
import { BLE_CONFIG } from './ble-config.js';
import { logger } from '../../utils/logger.js';

/**
 * Capacitor BLE Adapter for native Android execution
 */
export class CapacitorBleAdapter {
  constructor() {
    this.connectedDeviceId = null;
  }

  async initialize() {
    logger.debug('[CapacitorBleAdapter] Initializing BLE client');
    await BleClient.initialize();
  }

  async scan(onDeviceFound) {
    logger.debug('[CapacitorBleAdapter] Requesting device scan');
    await BleClient.requestLEScan(
      {
        services: [BLE_CONFIG.serviceUuid],
      },
      (result) => {
        if (onDeviceFound && (result.localName === BLE_CONFIG.deviceName || result.device.name === BLE_CONFIG.deviceName)) {
          onDeviceFound({
            name: result.localName || result.device.name,
            deviceId: result.device.deviceId,
            rssi: result.rssi,
          });
        }
      }
    );
  }

  async stopScan() {
    logger.debug('[CapacitorBleAdapter] Stopping LE scan');
    await BleClient.stopLEScan();
  }

  async connect(deviceId, onDisconnected) {
    logger.debug('[CapacitorBleAdapter] Connecting to deviceId:', deviceId);
    await BleClient.connect(deviceId, onDisconnected);
    this.connectedDeviceId = deviceId;
  }

  async disconnect() {
    if (this.connectedDeviceId) {
      logger.debug('[CapacitorBleAdapter] Disconnecting from:', this.connectedDeviceId);
      await BleClient.disconnect(this.connectedDeviceId);
      this.connectedDeviceId = null;
    }
  }

  async writeCommand(commandByte) {
    if (!this.connectedDeviceId) {
      throw new Error('No device connected');
    }
    const data = numbersToDataView([commandByte]);
    await BleClient.write(
      this.connectedDeviceId,
      BLE_CONFIG.serviceUuid,
      BLE_CONFIG.commandCharacteristicUuid,
      data
    );
  }

  async subscribeStatus(callback) {
    if (!this.connectedDeviceId) {
      throw new Error('No device connected');
    }
    await BleClient.startNotifications(
      this.connectedDeviceId,
      BLE_CONFIG.serviceUuid,
      BLE_CONFIG.statusCharacteristicUuid,
      (value) => {
        if (callback) {
          callback(value);
        }
      }
    );
  }

  async unsubscribeStatus() {
    if (this.connectedDeviceId) {
      await BleClient.stopNotifications(
        this.connectedDeviceId,
        BLE_CONFIG.serviceUuid,
        BLE_CONFIG.statusCharacteristicUuid
      );
    }
  }
}
