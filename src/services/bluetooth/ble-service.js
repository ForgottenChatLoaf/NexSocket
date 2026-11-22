import { Capacitor } from '@capacitor/core';
import { APP_CONFIG } from '../../config/app-config.js';
import { BLE_CONFIG } from './ble-config.js';
import { BLE_COMMANDS } from './ble-commands.js';
import { MockBleAdapter } from './mock-ble-adapter.js';
import { CapacitorBleAdapter } from './capacitor-ble-adapter.js';
import { WebBleAdapter, isWebBluetoothSupported } from './web-ble-adapter.js';
import { BleProtocol } from './ble-protocol.js';
import { COMMAND_STATUS, COMMAND_TIMEOUT_MS, COMMAND_NAMES } from './command-lifecycle.js';
import { outletState } from '../../state/outlet-state.js';
import { appState } from '../../state/app-state.js';
import { logger } from '../../utils/logger.js';

class BleService {
  constructor() {
    this.adapter = null;
    this.isInitialized = false;
    this.isReconnecting = false;
    this.activeCommand = null;
    this.commandTimeoutTimer = null;
  }

  async init() {
    const { operationMode } = appState.getState();
    const isNative = Capacitor.isNativePlatform();

    if (this.isInitialized && this.currentMode === operationMode) {
      return;
    }

    if (operationMode === 'hardware') {
      if (isNative && !APP_CONFIG.forceMockOnNative) {
        logger.info('[BleService] Mode: Hardware (Native Capacitor BLE on Android)');
        this.adapter = new CapacitorBleAdapter();
      } else {
        logger.info('[BleService] Mode: Hardware (Web Bluetooth API in Browser)');
        this.adapter = new WebBleAdapter();
      }
    } else {
      logger.info('[BleService] Mode: Demo (Simulated ESP32-C3 peripheral)');
      this.adapter = new MockBleAdapter();
    }

    await this.adapter.initialize();
    this.isInitialized = true;
    this.currentMode = operationMode;
  }

  async switchMode(newMode) {
    if (newMode !== 'demo' && newMode !== 'hardware') return;
    if (outletState.getState().connected) {
      await this.disconnect();
    }
    this.isInitialized = false;
    appState.setOperationMode(newMode);
    await this.init();
  }

  async startScan(onDeviceFound) {
    await this.init();
    if (!this.adapter) {
      throw new Error('Bluetooth adapter not initialized');
    }
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
    if (!this.adapter) {
      throw new Error('Bluetooth adapter not initialized');
    }
    appState.setState({ isConnecting: true });
    try {
      await this.adapter.connect(deviceId, () => {
        this.handleDisconnect(true);
      });

      outletState.setState({ connected: true });
      outletState.setCommandLifecycle(COMMAND_STATUS.IDLE, null);
      outletState.addHistory({
        type: 'bluetooth',
        title: 'Bluetooth Connected',
        detail: `Paired with ${BLE_CONFIG.deviceName} (${deviceId})`,
      });
      appState.setState({
        isConnecting: false,
        connectedDevice: deviceId,
        notification: { type: 'success', message: `Connected to NexSocket (${BLE_CONFIG.deviceName})` },
      });

      // Subscribe to status notifications
      await this.adapter.subscribeStatus((rawStatus) => {
        const parsed = BleProtocol.parseStatus(rawStatus);
        const prev = outletState.getState();
        const names = prev.names || { outlet1: 'Outlet 1', outlet2: 'Outlet 2' };
        const activeCmd = this.activeCommand;

        // Command confirmed by device notification!
        if (this.commandTimeoutTimer) {
          clearTimeout(this.commandTimeoutTimer);
          this.commandTimeoutTimer = null;
        }

        if (this.activeCommand !== null) {
          outletState.setCommandLifecycle(COMMAND_STATUS.CONFIRMED, activeCmd);
          this.activeCommand = null;
          // Reset to idle after brief confirmation window
          setTimeout(() => {
            const current = outletState.getState().commandLifecycle;
            if (current.status === COMMAND_STATUS.CONFIRMED) {
              outletState.setCommandLifecycle(COMMAND_STATUS.IDLE, null);
            }
          }, 1000);
        }

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
          } else if ((!prev.outlet1 || !prev.outlet2) && parsed.outlet1 && parsed.outlet2) {
            appState.setState({ notification: { type: 'success', message: 'All outlets confirmed ON' } });
            outletState.addHistory({ type: 'all-on', title: 'Master Power', detail: 'All channels powered on' });
          }
        }
      });

      // Query physical state immediately on connect (stale command protection & state verification)
      try {
        await this.adapter.writeCommand(BLE_COMMANDS.GET_STATUS);
      } catch (e) {
        logger.debug('[BleService] Initial GET_STATUS query sent');
      }

    } catch (err) {
      appState.setState({ isConnecting: false });
      this.handleDisconnect(false);
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
    // 🛡️ Stale Command Protection: Cancel active timeouts and discard pending commands
    if (this.commandTimeoutTimer) {
      clearTimeout(this.commandTimeoutTimer);
      this.commandTimeoutTimer = null;
    }
    this.activeCommand = null;

    const wasConnected = outletState.getState().connected;
    outletState.setState({
      connected: false,
      outlet1: false,
      outlet2: false,
      isPending: false,
    });
    outletState.setCommandLifecycle(COMMAND_STATUS.IDLE, null);

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
    if (this.activeCommand !== null || outletState.getState().isPending) {
      throw new Error('A previous command is still awaiting device confirmation');
    }

    // 1. Enter PENDING lifecycle state
    this.activeCommand = commandByte;
    outletState.setCommandLifecycle(COMMAND_STATUS.PENDING, commandByte);

    // 2. Set timeout guard (3500ms)
    this.commandTimeoutTimer = setTimeout(() => {
      if (this.activeCommand === commandByte) {
        logger.warn(`[BleService] Command 0x${commandByte.toString(16)} timed out`);
        this.activeCommand = null;
        outletState.setCommandLifecycle(COMMAND_STATUS.FAILED, commandByte, 'Hardware confirmation timeout');
        appState.setState({
          notification: {
            type: 'error',
            message: `Command timed out: ${COMMAND_NAMES[commandByte] || 'Device'} did not acknowledge state.`,
          },
        });
        outletState.addHistory({
          type: 'error',
          title: 'Command Timed Out',
          detail: `${COMMAND_NAMES[commandByte] || 'Command'} unacknowledged`,
        });
      }
    }, COMMAND_TIMEOUT_MS);

    // 3. Transmit command to peripheral
    try {
      await this.adapter.writeCommand(commandByte);
    } catch (err) {
      if (this.commandTimeoutTimer) {
        clearTimeout(this.commandTimeoutTimer);
        this.commandTimeoutTimer = null;
      }
      this.activeCommand = null;
      outletState.setCommandLifecycle(COMMAND_STATUS.FAILED, commandByte, err.message);
      throw err;
    }
  }
}

export const bleService = new BleService();
