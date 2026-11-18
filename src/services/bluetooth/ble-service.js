import { Capacitor } from '@capacitor/core';
import { APP_CONFIG } from '../../config/app-config.js';
import { MockBleAdapter } from './mock-ble-adapter.js';
import { CapacitorBleAdapter } from './capacitor-ble-adapter.js';
import { BleProtocol } from './ble-protocol.js';
import { outletState } from '../../state/outlet-state.js';
import { appState } from '../../state/app-state.js';
import { logger } from '../../utils/logger.js';

class BleService {
  constructor() {
    this.adapter = null;
    this.isInitialized = false;
  }

  async init() {
    if (this.isInitialized) return;

    const isNative = Capacitor.isNativePlatform();
    // Use Mock adapter if in browser or if explicitly forced in dev
    if (!isNative || APP_CONFIG.useMockBle) {
      logger.info('Using Mock BLE Adapter (Browser/Dev mode)');
      this.adapter = new MockBleAdapter();
    } else {
      logger.info('Using Native Capacitor BLE Adapter (Android)');
      this.adapter = new CapacitorBleAdapter();
    }

    await this.adapter.initialize();
    this.isInitialized = true;
  }

  async startScan(onDeviceFound) {
    await this.init();
    appState.setState({ isScanning: true });
    await this.adapter.scan((device) => {
      if (onDeviceFound) onDeviceFound(device);
    });
  }

  async stopScan() {
    if (this.adapter) {
      await this.adapter.stopScan();
    }
    appState.setState({ isScanning: false });
  }

  async connect(deviceId) {
    await this.init();
    appState.setState({ isConnecting: true });
    try {
      await this.adapter.connect(deviceId, () => {
        this.handleDisconnect();
      });

      outletState.setState({ connected: true });
      appState.setState({
        isConnecting: false,
        connectedDevice: deviceId,
        notification: { type: 'success', message: 'Connected to Smart Outlet' },
      });

      // Subscribe to status notifications
      await this.adapter.subscribeStatus((rawStatus) => {
        const parsed = BleProtocol.parseStatus(rawStatus);
        outletState.setState({
          outlet1: parsed.outlet1,
          outlet2: parsed.outlet2,
          isPending: false,
        });
      });
    } catch (err) {
      appState.setState({ isConnecting: false });
      this.handleDisconnect();
      throw err;
    }
  }

  async disconnect() {
    if (this.adapter) {
      await this.adapter.disconnect();
    }
    this.handleDisconnect();
  }

  handleDisconnect() {
    outletState.setState({
      connected: false,
      outlet1: false,
      outlet2: false,
      isPending: false,
    });
    appState.setState({
      isConnecting: false,
      connectedDevice: null,
      notification: { type: 'info', message: 'Disconnected from Smart Outlet' },
    });
  }

  async sendCommand(commandByte) {
    if (!outletState.getState().connected) {
      throw new Error('Device is not connected');
    }
    outletState.setState({ isPending: true });
    await this.adapter.writeCommand(commandByte);
  }
}

export const bleService = new BleService();
