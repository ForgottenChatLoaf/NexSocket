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
    this.isReconnecting = false;
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
      outletState.addHistory({
        type: 'bluetooth',
        title: 'Bluetooth Connected',
        detail: `Paired with ${BLE_CONFIG.deviceName} (${deviceId})`,
      });
      appState.setState({
        isConnecting: false,
        connectedDevice: deviceId,
        notification: { type: 'success', message: 'Connected to NexSocket (SMART_OUTLET_01)' },
      });

      // Subscribe to status notifications
      await this.adapter.subscribeStatus((rawStatus) => {
        const parsed = BleProtocol.parseStatus(rawStatus);
        const prev = outletState.getState();
        const names = prev.names || { outlet1: 'Outlet 1', outlet2: 'Outlet 2' };
        
        outletState.setState({
          outlet1: parsed.outlet1,
          outlet2: parsed.outlet2,
          isPending: false,
        });

        // Provide feedback and history recording when state transitions occur
        if (prev.connected) {
          if (!prev.outlet1 && parsed.outlet1 && prev.outlet2 === parsed.outlet2) {
            appState.setState({ notification: { type: 'success', message: `${names.outlet1} confirmed ON` } });
            outletState.addHistory({ type: 'power-on', title: `${names.outlet1} ON`, detail: 'Channel 1 relay activated' });
          } else if (prev.outlet1 && !parsed.outlet1 && prev.outlet2 === parsed.outlet2) {
            appState.setState({ notification: { type: 'info', message: `${names.outlet1} confirmed OFF` } });
            outletState.addHistory({ type: 'power-off', title: `${names.outlet1} OFF`, detail: 'Channel 1 relay cut off' });
          } else if (!prev.outlet2 && parsed.outlet2 && prev.outlet1 === parsed.outlet1) {
            appState.setState({ notification: { type: 'success', message: `${names.outlet2} confirmed ON` } });
            outletState.addHistory({ type: 'power-on', title: `${names.outlet2} ON`, detail: 'Channel 2 relay activated' });
          } else if (prev.outlet2 && !parsed.outlet2 && prev.outlet1 === parsed.outlet1) {
            appState.setState({ notification: { type: 'info', message: `${names.outlet2} confirmed OFF` } });
            outletState.addHistory({ type: 'power-off', title: `${names.outlet2} OFF`, detail: 'Channel 2 relay cut off' });
          } else if ((prev.outlet1 || prev.outlet2) && !parsed.outlet1 && !parsed.outlet2) {
            appState.setState({ notification: { type: 'info', message: 'All outlets confirmed OFF' } });
            outletState.addHistory({ type: 'all-off', title: 'Master Shutoff', detail: 'All channels powered off' });
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
    this.handleDisconnect(false);
  }

  handleDisconnect(unexpected = false) {
    const wasConnected = outletState.getState().connected;
    outletState.setState({
      connected: false,
      outlet1: false,
      outlet2: false,
      isPending: false,
    });
    if (wasConnected) {
      outletState.addHistory({
        type: 'bluetooth',
        title: unexpected ? 'Connection Lost' : 'Bluetooth Disconnected',
        detail: unexpected ? 'Link dropped unexpectedly' : 'Disconnected by user',
      });
    }
    appState.setState({
      isConnecting: false,
      connectedDevice: null,
      notification: {
        type: unexpected ? 'error' : 'info',
        message: unexpected ? 'Bluetooth link dropped' : 'Disconnected from NexSocket',
      },
    });

    // Auto-reconnection logic
    if (unexpected && outletState.getState().autoReconnect && !this.isReconnecting) {
      this.attemptAutoReconnect();
    }
  }

  async attemptAutoReconnect() {
    this.isReconnecting = true;
    appState.setState({
      notification: { type: 'info', message: 'Connection lost. Auto-reconnecting in 3s...' },
    });
    setTimeout(async () => {
      try {
        if (!outletState.getState().connected && outletState.getState().autoReconnect) {
          appState.setState({
            notification: { type: 'info', message: 'Attempting auto-reconnect...' },
          });
          await this.startScan(async (device) => {
            await this.stopScan();
            await this.connect(device.deviceId);
          });
        }
      } catch (err) {
        logger.debug('Auto-reconnect attempt failed:', err.message);
      } finally {
        this.isReconnecting = false;
      }
    }, 3000);
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
