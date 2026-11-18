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

    let statusLabel = 'Offline • Tap connect to discover';
    let statusClass = 'offline';

    if (connected) {
      statusLabel = `Paired • GATT Active (${connectedDevice || 'ESP32'})`;
      statusClass = 'online';
    } else if (isScanning) {
      statusLabel = 'Scanning for SMART_OUTLET_01...';
      statusClass = 'connecting';
    } else if (isConnecting) {
      statusLabel = 'Establishing BLE GATT link...';
      statusClass = 'connecting';
    }

    const currentRssi = rssi || -58;
    const signalQuality = currentRssi > -60 ? 'Optimal' : currentRssi > -75 ? 'Good' : 'Fair';

    panel.innerHTML = `
      <div class="connection-header">
        <div class="connection-meta">
          <div class="ble-icon-container ${connected ? 'connected' : ''}">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="m7 7 10 10-5 5V2l5 5L7 17"></path>
            </svg>
          </div>
          <div class="connection-details">
            <div style="display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap;">
              <span class="device-name">${BLE_CONFIG.deviceName}</span>
              <span class="demo-badge">${isNative ? 'BLE NATIVE' : 'MOCK BLE'}</span>
              ${autoReconnect ? `<span class="badge-subtle" title="Auto-reconnect is enabled">AUTO-SYNC</span>` : ''}
            </div>
            <span class="device-status-text">
              <span class="pulse-dot ${statusClass}"></span>
              <span>${statusLabel}</span>
            </span>
          </div>
        </div>

        <div class="connection-controls">
          ${
            connected
              ? `<button class="btn btn-secondary" id="btn-disconnect" style="font-size: var(--font-size-sm); min-height: 42px;">
                  Disconnect
                </button>`
              : `<button class="btn btn-primary" id="btn-connect" ${isScanning || isConnecting ? 'disabled' : ''} style="font-size: var(--font-size-sm); min-height: 42px;">
                  ${
                    isScanning || isConnecting
                      ? `<span class="spinner" style="width: 14px; height: 14px; border-width: 2px;"></span>
                         <span>${isScanning ? 'Scanning...' : 'Connecting...'}</span>`
                      : `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                           <path d="m7 7 10 10-5 5V2l5 5L7 17"></path>
                         </svg>
                         <span>Connect</span>`
                  }
                </button>`
          }
        </div>
      </div>

      <div class="connection-badge-row">
        <span>Hardware: ESP32-C3 GATT Peripheral</span>
        <div class="signal-indicator" style="display: flex; align-items: center; gap: 0.35rem;">
          ${
            connected
              ? `<span class="signal-bars" title="Signal Strength: ${signalQuality}">
                   <span class="bar bar-1 active"></span>
                   <span class="bar bar-2 active"></span>
                   <span class="bar bar-3 active"></span>
                   <span class="bar bar-4 ${currentRssi > -65 ? 'active' : ''}"></span>
                 </span>
                 <span style="color: var(--color-brand-cyan); font-weight: 500;">RSSI: ${currentRssi} dBm (${signalQuality})</span>`
              : `<span>Range: BLE Direct</span>`
          }
        </div>
      </div>
    `;

    const btnConnect = panel.querySelector('#btn-connect');
    if (btnConnect) {
      btnConnect.onclick = async () => {
        try {
          appState.setState({
            notification: { type: 'info', message: 'Scanning for SMART_OUTLET_01...' },
          });

          await bleService.startScan(async (device) => {
            await bleService.stopScan();
            appState.setState({
              notification: { type: 'info', message: `Found ${device.name}. Connecting...` },
            });
            await bleService.connect(device.deviceId);
          });
        } catch (err) {
          appState.setState({
            notification: {
              type: 'error',
              message: `Connection failed: ${err.message || 'Device unreachable'}`,
            },
          });
        }
      };
    }

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
