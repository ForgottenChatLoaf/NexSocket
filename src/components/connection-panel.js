import { Capacitor } from '@capacitor/core';
import { bleService } from '../services/bluetooth/ble-service.js';
import { BLE_CONFIG } from '../services/bluetooth/ble-config.js';
import { appState } from '../state/app-state.js';
import { outletState } from '../state/outlet-state.js';
import { renderConfirmationDialog } from './confirmation-dialog.js';

export function renderConnectionPanel() {
  const panel = document.createElement('section');
  panel.className = 'card connection-panel';
  panel.setAttribute('aria-label', 'Bluetooth Connection Management');

  function update() {
    const { isScanning, isConnecting, connectedDevice } = appState.getState();
    const { connected, rssi, autoReconnect } = outletState.getState();
    const isNative = Capacitor.isNativePlatform();
    const currentRssi = rssi || -58;
    const signalQuality = currentRssi > -60 ? 'Optimal' : currentRssi > -75 ? 'Good' : 'Fair';

    if (connected) {
      // 🟢 CONNECTED STATE: Full live telemetry and management
      panel.innerHTML = `
        <div class="connection-header connected-mode">
          <div class="connection-meta">
            <div class="ble-icon-container connected">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="m7 7 10 10-5 5V2l5 5L7 17"></path>
              </svg>
            </div>
            <div class="connection-details">
              <div style="display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap;">
                <span class="device-name">${BLE_CONFIG.deviceName}</span>
                <span class="demo-badge">${isNative ? 'BLE NATIVE' : 'MOCK BLE'}</span>
                ${autoReconnect ? `<span class="badge-subtle" title="Auto-reconnect is active">AUTO-SYNC</span>` : ''}
              </div>
              <span class="device-status-text">
                <span class="pulse-dot online"></span>
                <span>Paired · GATT Service Active (${connectedDevice || 'ESP32-C3'})</span>
              </span>
            </div>
          </div>

          <div class="connection-controls">
            <button class="btn btn-secondary btn-disconnect-action" id="btn-disconnect">
              Disconnect
            </button>
          </div>
        </div>

        <div class="connection-badge-row">
          <span>Hardware: ESP32-C3 GATT Peripheral</span>
          <div class="signal-indicator" style="display: flex; align-items: center; gap: 0.35rem;">
            <span class="signal-bars" title="Signal Strength: ${signalQuality}">
              <span class="bar bar-1 active"></span>
              <span class="bar bar-2 active"></span>
              <span class="bar bar-3 active"></span>
              <span class="bar bar-4 ${currentRssi > -65 ? 'active' : ''}"></span>
            </span>
            <span style="color: var(--color-brand-cyan); font-weight: 500;">RSSI: ${currentRssi} dBm (${signalQuality})</span>
          </div>
        </div>
      `;
    } else if (isScanning) {
      // 🟡 SCANNING STATE: Animated radar progress
      panel.innerHTML = `
        <div class="connection-state-banner scanning-mode">
          <div class="state-icon-pulse scanning-pulse">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="m7 7 10 10-5 5V2l5 5L7 17"></path>
            </svg>
          </div>
          <div class="state-banner-info">
            <span class="state-banner-title">Scanning for SMART_OUTLET_01...</span>
            <span class="state-banner-desc">Searching for local BLE advertisements</span>
          </div>
          <button class="btn btn-secondary btn-cancel-scan" id="btn-cancel-scan">
            Cancel
          </button>
        </div>
      `;
    } else if (isConnecting) {
      // 🟡 CONNECTING STATE: Progress indicator
      panel.innerHTML = `
        <div class="connection-state-banner connecting-mode">
          <div class="spinner-large"></div>
          <div class="state-banner-info">
            <span class="state-banner-title">Establishing BLE Link...</span>
            <span class="state-banner-desc">Negotiating GATT services and characteristics</span>
          </div>
        </div>
      `;
    } else {
      // ⚪ DISCONNECTED / WELCOME STATE: Context-aware first-time or standby banner
      panel.innerHTML = `
        <div class="connection-welcome-banner">
          <div class="welcome-banner-top">
            <div class="ble-icon-container">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="m7 7 10 10-5 5V2l5 5L7 17"></path>
              </svg>
            </div>
            <div class="welcome-banner-text">
              <span class="welcome-title">Connect NexSocket</span>
              <span class="welcome-subtitle">Pair with your ESP32-C3 controller to manage smart outlets</span>
            </div>
          </div>

          <button class="btn btn-primary btn-connect-hero" id="btn-connect">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="m7 7 10 10-5 5V2l5 5L7 17"></path>
            </svg>
            <span>Find & Connect Device</span>
          </button>

          <div class="welcome-banner-footer">
            <span class="welcome-badge">MOCK BLE READY</span>
            <span>Target: ESP32-C3 Super Mini · Direct Bluetooth LE</span>
          </div>
        </div>
      `;
    }

    // Connect Action
    const btnConnect = panel.querySelector('#btn-connect');
    if (btnConnect) {
      btnConnect.onclick = async () => {
        try {
          appState.setState({
            isScanning: true,
            notification: { type: 'info', message: 'Scanning for SMART_OUTLET_01...' },
          });

          await bleService.startScan(async (device) => {
            await bleService.stopScan();
            appState.setState({
              isScanning: false,
              isConnecting: true,
              notification: { type: 'info', message: `Found ${device.name}. Connecting...` },
            });
            await bleService.connect(device.deviceId);
          });
        } catch (err) {
          appState.setState({
            isScanning: false,
            isConnecting: false,
            notification: {
              type: 'error',
              message: `Connection failed: ${err.message || 'Device unreachable'}`,
            },
          });
        }
      };
    }

    // Cancel Scan Action
    const btnCancel = panel.querySelector('#btn-cancel-scan');
    if (btnCancel) {
      btnCancel.onclick = async () => {
        await bleService.stopScan();
        appState.setState({
          isScanning: false,
          notification: { type: 'info', message: 'Bluetooth scan cancelled' },
        });
      };
    }

    // Disconnect Action
    const btnDisconnect = panel.querySelector('#btn-disconnect');
    if (btnDisconnect) {
      btnDisconnect.onclick = () => {
        const dialog = renderConfirmationDialog({
          title: 'Disconnect Device?',
          message: 'This will end the Bluetooth connection to SMART_OUTLET_01. Outlet states will no longer be controllable until reconnected.',
          confirmText: 'Disconnect',
          cancelText: 'Cancel',
          onConfirm: async () => {
            try {
              await bleService.disconnect();
            } catch (err) {
              appState.setState({
                notification: { type: 'error', message: `Disconnect error: ${err.message}` },
              });
            }
          },
        });
        document.body.appendChild(dialog);
      };
    }
  }

  outletState.subscribe(update);
  appState.subscribe(update);
  update();

  return panel;
}
