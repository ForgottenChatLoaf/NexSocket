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
    // On native Android, use real BLE hardware adapter. In web browser, use mock adapter.
    if (isNative && !APP_CONFIG.forceMockOnNative) {
      logger.info('Using Native Capacitor BLE Adapter (Android Hardware)');
      this.adapter = new CapacitorBleAdapter();
    } else {
      logger.info('Using Mock BLE Adapter (Browser / Dev simulation)');
      this.adapter = new MockBleAdapter();
    }

    await this.adapter.initialize();
    this.isInitialized = true;
  }

  async startScan(onDeviceFound) {
    await this.init();
    appState.setState({ isScanning: true });
    try {
      await this.adapter.scan((device) => {
        if (onDeviceFound) onDeviceFound(device);
      });
    } catch (err) {
      appState.setState({ isScanning: false });
      throw err;
    }
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
        notification: { type: 'success', message: 'Connected to NexSocket (SMART_OUTLET_01)' },
      });

      // Subscribe to status notifications
      await this.adapter.subscribeStatus((rawStatus) => {
        const parsed = BleProtocol.parseStatus(rawStatus);
        const prev = outletState.getState();
        
        outletState.setState({
          outlet1: parsed.outlet1,
          outlet2: parsed.outlet2,
          isPending: false,
        });

        // Provide feedback when state transitions occur after initial connection
        if (prev.connected) {
          if (!prev.outlet1 && parsed.outlet1 && prev.outlet2 === parsed.outlet2) {
            appState.setState({ notification: { type: 'success', message: 'Outlet 1 confirmed ON' } });
          } else if (prev.outlet1 && !parsed.outlet1 && prev.outlet2 === parsed.outlet2) {
            appState.setState({ notification: { type: 'info', message: 'Outlet 1 confirmed OFF' } });
          } else if (!prev.outlet2 && parsed.outlet2 && prev.outlet1 === parsed.outlet1) {
            appState.setState({ notification: { type: 'success', message: 'Outlet 2 confirmed ON' } });
          } else if (prev.outlet2 && !parsed.outlet2 && prev.outlet1 === parsed.outlet1) {
            appState.setState({ notification: { type: 'info', message: 'Outlet 2 confirmed OFF' } });
          } else if ((prev.outlet1 || prev.outlet2) && !parsed.outlet1 && !parsed.outlet2) {
            appState.setState({ notification: { type: 'info', message: 'All outlets confirmed OFF' } });
          }
        }
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
      notification: { type: 'info', message: 'Disconnected from NexSocket' },
    });
  }

  async sendCommand(commandByte) {
    if (!outletState.getState().connected) {
      throw new Error('Device is not connected');
    }
    outletState.setState({ isPending: true });
    try {
      await this.adapter.writeCommand(commandByte);
    } catch (err) {
      outletState.setState({ isPending: false });
      throw err;
    }
  }
}

export const bleService = new BleService();
