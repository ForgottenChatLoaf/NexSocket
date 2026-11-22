import { bleService } from '../services/bluetooth/ble-service.js';
import { BLE_CONFIG } from '../services/bluetooth/ble-config.js';
import { appState } from '../state/app-state.js';
import { outletState } from '../state/outlet-state.js';
import { isWebBluetoothSupported } from '../services/bluetooth/web-ble-adapter.js';

export function renderConnectionSummary() {
  const card = document.createElement('section');
  card.className = 'card connection-summary-card';
  card.setAttribute('aria-label', 'Bluetooth Connection Summary');

  function update() {
    const { isScanning, isConnecting, connectedDevice, operationMode } = appState.getState();
    const { connected } = outletState.getState();
    const isDemo = operationMode === 'demo';

    let statusText = 'Disconnected';
    let statusClass = 'offline';
    let actionBtnHtml = '';

    if (connected) {
      statusText = `Connected (${connectedDevice || 'ESP32-C3'})`;
      statusClass = 'online';
      actionBtnHtml = `
        <button class="btn btn-secondary btn-sm" id="btn-summary-disconnect">
          Disconnect
        </button>
      `;
    } else if (isConnecting) {
      statusText = 'Establishing BLE link...';
      statusClass = 'connecting';
      actionBtnHtml = `
        <div class="summary-spinner"></div>
      `;
    } else if (isScanning) {
      statusText = 'Scanning for peripheral...';
      statusClass = 'scanning';
      actionBtnHtml = `
        <button class="btn btn-secondary btn-sm" id="btn-summary-cancel">
          Cancel
        </button>
      `;
    } else {
      statusText = isDemo ? 'Ready to pair (Demo Simulator)' : 'Offline (Hardware mode)';
      statusClass = 'offline';
      actionBtnHtml = `
        <button class="btn btn-primary btn-sm btn-summary-connect" id="btn-summary-connect">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="m7 7 10 10-5 5V2l5 5L7 17"></path>
          </svg>
          <span>Connect</span>
        </button>
      `;
    }

    card.innerHTML = `
      <div class="summary-top">
        <div class="summary-meta">
          <div class="summary-icon-container ${statusClass}">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="m7 7 10 10-5 5V2l5 5L7 17"></path>
            </svg>
          </div>
          <div class="summary-text-group">
            <div style="display: flex; align-items: center; gap: 0.4rem; flex-wrap: wrap;">
              <span class="summary-device-name">${BLE_CONFIG.deviceName}</span>
              <span class="summary-mode-pill ${isDemo ? 'demo' : 'hardware'}">
                ${isDemo ? 'DEMO' : 'LIVE BLE'}
              </span>
            </div>
            <span class="summary-status-line">
              <span class="pulse-dot ${statusClass}"></span>
              <span>${statusText}</span>
            </span>
          </div>
        </div>

        <div class="summary-actions">
          ${actionBtnHtml}
        </div>
      </div>

      <div class="summary-bottom">
        <span class="summary-target-label">Target: ESP32-C3 Super Mini</span>
        <button type="button" class="summary-link-devices" id="btn-goto-devices">
          <span>Manage in Devices</span>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
      </div>
    `;

    // Connect handler
    const btnConnect = card.querySelector('#btn-summary-connect');
    if (btnConnect) {
      btnConnect.onclick = async () => {
        if (!isDemo && !isWebBluetoothSupported()) {
          appState.setActiveTab('devices');
          return;
        }

        try {
          appState.setState({ isScanning: true });
          await bleService.startScan(async (device) => {
            await bleService.stopScan();
            appState.setState({ isScanning: false, isConnecting: true });
            await bleService.connect(device.deviceId);
          });
        } catch (err) {
          appState.setState({
            isScanning: false,
            isConnecting: false,
            notification: { type: 'error', message: err.message },
          });
        }
      };
    }

    // Cancel scan
    const btnCancel = card.querySelector('#btn-summary-cancel');
    if (btnCancel) {
      btnCancel.onclick = async () => {
        await bleService.stopScan();
        appState.setState({ isScanning: false });
      };
    }

    // Disconnect handler
    const btnDisconnect = card.querySelector('#btn-summary-disconnect');
    if (btnDisconnect) {
      btnDisconnect.onclick = async () => {
        await bleService.disconnect();
      };
    }

    // Navigate to devices tab
    const btnGoto = card.querySelector('#btn-goto-devices');
    if (btnGoto) {
      btnGoto.onclick = () => {
        appState.setActiveTab('devices');
      };
    }
  }

  appState.subscribe(update);
  outletState.subscribe(update);
  update();

  return card;
}
