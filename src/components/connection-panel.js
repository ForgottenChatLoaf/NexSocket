import { Capacitor } from '@capacitor/core';
import { bleService } from '../services/bluetooth/ble-service.js';
import { BLE_CONFIG } from '../services/bluetooth/ble-config.js';
import { COMMAND_NAMES, COMMAND_STATUS } from '../services/bluetooth/command-lifecycle.js';
import { isWebBluetoothSupported } from '../services/bluetooth/web-ble-adapter.js';
import { appState } from '../state/app-state.js';
import { outletState } from '../state/outlet-state.js';
import { renderConfirmationDialog } from './confirmation-dialog.js';

export function renderConnectionPanel() {
  const panel = document.createElement('section');
  panel.className = 'card connection-panel';
  panel.setAttribute('aria-label', 'Bluetooth Connection Management');

  function update() {
    const { isScanning, isConnecting, connectedDevice, operationMode } = appState.getState();
    const { connected, rssi, autoReconnect, commandLifecycle } = outletState.getState();
    const isNative = Capacitor.isNativePlatform();
    const isDemo = operationMode === 'demo';
    const currentRssi = rssi || -58;
    const signalQuality = currentRssi > -60 ? 'Optimal' : currentRssi > -75 ? 'Good' : 'Fair';

    // Command lifecycle feedback string
    let lifecycleHtml = '';
    if (commandLifecycle && commandLifecycle.status !== COMMAND_STATUS.IDLE) {
      const cmdName = COMMAND_NAMES[commandLifecycle.command] || 'Command';
      if (commandLifecycle.status === COMMAND_STATUS.PENDING) {
        lifecycleHtml = `
          <div class="command-lifecycle-banner pending">
            <span class="spinner" style="width: 12px; height: 12px; border-width: 2px;"></span>
            <span>Awaiting device confirmation: ${cmdName}...</span>
          </div>
        `;
      } else if (commandLifecycle.status === COMMAND_STATUS.CONFIRMED) {
        lifecycleHtml = `
          <div class="command-lifecycle-banner confirmed">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
            <span>Confirmed by hardware: ${cmdName}</span>
          </div>
        `;
      } else if (commandLifecycle.status === COMMAND_STATUS.FAILED) {
        lifecycleHtml = `
          <div class="command-lifecycle-banner failed">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
            <span>${commandLifecycle.error || 'Command failed: No acknowledgement'}</span>
          </div>
        `;
      }
    }

    // Top Mode Switcher Bar
    const modeSwitcherHtml = `
      <div class="mode-switcher-container" role="radiogroup" aria-label="Operation Mode Selection">
        <button 
          class="mode-pill-btn ${isDemo ? 'active demo-active' : ''}" 
          id="btn-mode-demo" 
          role="radio" 
          aria-checked="${isDemo}"
          title="Simulated ESP32-C3 peripheral for browser testing"
        >
          <span class="mode-pill-dot"></span>
          <span>🧪 Demo Mode (Mock)</span>
        </button>
        <button 
          class="mode-pill-btn ${!isDemo ? 'active hardware-active' : ''}" 
          id="btn-mode-hardware" 
          role="radio" 
          aria-checked="${!isDemo}"
          title="Physical ESP32-C3 Super Mini hardware link"
        >
          <span class="mode-pill-dot"></span>
          <span>⚡ Live Hardware</span>
        </button>
      </div>
    `;

    if (connected) {
      // 🟢 CONNECTED STATE: Full live telemetry and management
      panel.innerHTML = `
        ${modeSwitcherHtml}
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
                <span class="demo-badge">${isDemo ? 'SIMULATED ESP32' : (isNative ? 'BLE NATIVE' : 'LIVE BLE')}</span>
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
        ${lifecycleHtml}
      `;
    } else if (isScanning) {
      // 🟡 SCANNING STATE: Animated radar progress
      panel.innerHTML = `
        ${modeSwitcherHtml}
        <div class="connection-state-banner scanning-mode">
          <div class="state-icon-pulse scanning-pulse">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="m7 7 10 10-5 5V2l5 5L7 17"></path>
            </svg>
          </div>
          <div class="state-banner-info">
            <span class="state-banner-title">Scanning for ${BLE_CONFIG.deviceName}...</span>
            <span class="state-banner-desc">${isDemo ? 'Discovering simulated local peripheral' : 'Searching for physical BLE advertisements'}</span>
          </div>
          <button class="btn btn-secondary btn-cancel-scan" id="btn-cancel-scan">
            Cancel
          </button>
        </div>
      `;
    } else if (isConnecting) {
      // 🟡 CONNECTING STATE: Progress indicator
      panel.innerHTML = `
        ${modeSwitcherHtml}
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
        ${modeSwitcherHtml}
        <div class="connection-welcome-banner">
          <div class="welcome-banner-top">
            <div class="ble-icon-container">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="m7 7 10 10-5 5V2l5 5L7 17"></path>
              </svg>
            </div>
            <div class="welcome-banner-text">
              <span class="welcome-title">${isDemo ? 'Connect NexSocket Simulator' : 'Connect Live ESP32-C3'}</span>
              <span class="welcome-subtitle">
                ${
                  isDemo 
                    ? 'Simulated ESP32-C3 GATT peripheral ready for safe browser testing' 
                    : 'Direct hardware connection over Bluetooth Low Energy (Web BLE)'
                }
              </span>
            </div>
          </div>

          <button class="btn btn-primary btn-connect-hero" id="btn-connect">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="m7 7 10 10-5 5V2l5 5L7 17"></path>
            </svg>
            <span>${isDemo ? 'Start Demo Link (Connect)' : 'Scan for Physical ESP32'}</span>
          </button>

          <div class="welcome-banner-footer">
            <span class="welcome-badge">${isDemo ? 'DEMO SIMULATOR' : (isNative ? 'ANDROID BLE NATIVE' : 'WEB BLUETOOTH')}</span>
            <span>Target: ESP32-C3 Super Mini · ${isDemo ? 'Virtual Peripheral' : 'Physical GATT Link'}</span>
          </div>
        </div>
      `;
    }

    // Mode Switcher Handlers
    const btnModeDemo = panel.querySelector('#btn-mode-demo');
    if (btnModeDemo) {
      btnModeDemo.onclick = async () => {
        if (!isDemo) {
          await bleService.switchMode('demo');
          appState.setState({
            notification: { type: 'info', message: 'Switched to Demo Mode (Simulated ESP32)' },
          });
        }
      };
    }

    const btnModeHardware = panel.querySelector('#btn-mode-hardware');
    if (btnModeHardware) {
      btnModeHardware.onclick = async () => {
        if (isDemo) {
          if (!isNative && !isWebBluetoothSupported()) {
            // Web browser does not support Web Bluetooth
            const dialog = renderConfirmationDialog({
              title: 'Web Bluetooth Not Supported',
              message: 'Your current browser does not support the Web Bluetooth API. Please use Google Chrome or Microsoft Edge on localhost or HTTPS to communicate directly with your ESP32-C3 hardware.',
              confirmText: 'Stay in Demo Mode',
              cancelText: 'Dismiss',
              onConfirm: async () => {},
            });
            document.body.appendChild(dialog);
            return;
          }

          await bleService.switchMode('hardware');
          appState.setState({
            notification: {
              type: 'info',
              message: isNative
                ? 'Switched to Hardware Mode (Native Android BLE)'
                : 'Switched to Hardware Mode (Web Bluetooth API ready)',
            },
          });
        }
      };
    }

    // Connect Action
    const btnConnect = panel.querySelector('#btn-connect');
    if (btnConnect) {
      btnConnect.onclick = async () => {
        if (!isDemo && !isNative && !isWebBluetoothSupported()) {
          const dialog = renderConfirmationDialog({
            title: 'Web Bluetooth Required',
            message: 'Direct browser Bluetooth requires Google Chrome or Microsoft Edge on a secure origin (localhost or HTTPS). Please switch back to Demo Mode for browser simulation.',
            confirmText: 'Switch to Demo Mode',
            cancelText: 'Cancel',
            onConfirm: async () => {
              await bleService.switchMode('demo');
            },
          });
          document.body.appendChild(dialog);
          return;
        }

        try {
          appState.setState({
            isScanning: true,
            notification: { type: 'info', message: `Scanning for ${BLE_CONFIG.deviceName}...` },
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
