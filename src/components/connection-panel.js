import { bleService } from '../services/bluetooth/ble-service.js';
import { appState } from '../state/app-state.js';
import { outletState } from '../state/outlet-state.js';

export function renderConnectionPanel() {
  const panel = document.createElement('div');
  panel.className = 'card connection-panel';

  function update() {
    const { isScanning, isConnecting } = appState.getState();
    const { connected } = outletState.getState();

    panel.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <div>
          <h2 style="font-size: var(--font-size-base); font-weight: 600;">Bluetooth Device</h2>
          <p style="font-size: var(--font-size-xs); color: var(--color-text-secondary); margin-top: 2px;">
            Target: <strong>SMART_OUTLET_01</strong>
          </p>
        </div>
        <div>
          ${
            connected
              ? `<button class="btn" id="btn-disconnect" style="background-color: var(--color-bg-card-hover); color: var(--color-text-primary); font-size: var(--font-size-xs);">Disconnect</button>`
              : `<button class="btn btn-primary" id="btn-connect" ${isScanning || isConnecting ? 'disabled' : ''} style="font-size: var(--font-size-xs);">
                  ${isScanning ? 'Scanning...' : isConnecting ? 'Connecting...' : 'Connect'}
                </button>`
          }
        </div>
      </div>
    `;

    const btnConnect = panel.querySelector('#btn-connect');
    if (btnConnect) {
      btnConnect.onclick = async () => {
        try {
          await bleService.startScan(async (device) => {
            await bleService.stopScan();
            await bleService.connect(device.deviceId);
          });
        } catch (err) {
          console.error('Connection failed', err);
        }
      };
    }

    const btnDisconnect = panel.querySelector('#btn-disconnect');
    if (btnDisconnect) {
      btnDisconnect.onclick = async () => {
        await bleService.disconnect();
      };
    }
  }

  outletState.subscribe(update);
  appState.subscribe(update);
  update();

  return panel;
}
