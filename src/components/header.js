import { APP_CONFIG } from '../config/app-config.js';
import { BLE_CONFIG } from '../services/bluetooth/ble-config.js';
import { outletState } from '../state/outlet-state.js';
import { appState } from '../state/app-state.js';

export function renderHeader() {
  const header = document.createElement('header');
  header.className = 'app-header';

  header.innerHTML = `
    <div class="brand-wrapper">
      <img 
        src="${APP_CONFIG.logoPath}" 
        alt="${APP_CONFIG.appName} Logo" 
        class="brand-logo-img"
        id="brand-logo"
      />
      <div class="brand-info">
        <h1 class="brand-title">Nex<span class="brand-title-accent">Socket</span></h1>
        <span class="brand-subtitle">${APP_CONFIG.tagline || 'SMART OUTLET CONTROL'}</span>
      </div>
    </div>
    <div class="header-actions">
      <div id="header-connection-pill"></div>
      <button 
        class="btn-icon" 
        id="btn-settings" 
        title="Settings & Device Info"
        aria-label="Settings and Device Information"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="3"></circle>
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
        </svg>
      </button>
    </div>
  `;

  const btnSettings = header.querySelector('#btn-settings');
  if (btnSettings) {
    btnSettings.onclick = () => {
      openSettingsModal();
    };
  }

  return header;
}

function openSettingsModal() {
  const existing = document.querySelector('#settings-modal-backdrop');
  if (existing) existing.remove();

  const backdrop = document.createElement('div');
  backdrop.id = 'settings-modal-backdrop';
  backdrop.className = 'dialog-backdrop';

  const { autoReconnect } = outletState.getState();

  backdrop.innerHTML = `
    <div class="dialog-modal settings-modal" role="dialog" aria-labelledby="settings-title">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem;">
        <div style="display: flex; align-items: center; gap: 0.5rem;">
          <h2 id="settings-title" style="font-size: var(--font-size-lg); font-weight: var(--font-weight-bold); color: var(--color-text-primary);">
            Settings & Hardware
          </h2>
        </div>
        <button class="btn-icon" id="btn-close-settings" aria-label="Close settings">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
          </svg>
        </button>
      </div>

      <div class="settings-scroll-area">
        <!-- Application Preferences -->
        <span class="settings-group-label">PREFERENCES</span>
        <div class="settings-card-group">
          <div class="settings-row">
            <div>
              <span class="settings-label">Auto-Reconnection</span>
              <span class="settings-desc">Automatically retry if link drops</span>
            </div>
            <label class="toggle-switch">
              <input type="checkbox" id="toggle-auto-reconnect" ${autoReconnect ? 'checked' : ''} />
              <span class="toggle-slider"></span>
            </label>
          </div>
        </div>

        <!-- Hardware & Device Info -->
        <span class="settings-group-label" style="margin-top: 1rem;">TARGET HARDWARE</span>
        <div class="settings-card-group">
          <div class="settings-row">
            <span class="settings-label">Target Peripheral</span>
            <span style="font-family: monospace; font-weight: 600; color: var(--color-brand-cyan);">${BLE_CONFIG.deviceName}</span>
          </div>
          <div class="settings-row">
            <span class="settings-label">Microcontroller</span>
            <span style="color: var(--color-text-secondary);">ESP32-C3 RISC-V</span>
          </div>
          <div class="settings-row">
            <span class="settings-label">Simulated MAC</span>
            <span style="font-family: monospace; font-size: 0.8rem; color: var(--color-text-secondary);">84:F7:03:A1:C2:59</span>
          </div>
          <div class="settings-row">
            <span class="settings-label">Firmware</span>
            <span style="color: var(--color-text-secondary);">v1.2.0-esp32c3 (GATT)</span>
          </div>
          <div class="settings-row">
            <span class="settings-label">GATT MTU</span>
            <span style="color: var(--color-text-secondary);">23 Bytes (Standard LE)</span>
          </div>
        </div>

        <!-- GATT Protocol UUIDs -->
        <span class="settings-group-label" style="margin-top: 1rem;">GATT UUID SPECIFICATION</span>
        <div class="settings-card-group">
          <div class="settings-row-col">
            <span class="settings-label">Service UUID:</span>
            <span class="uuid-mono">${BLE_CONFIG.serviceUuid}</span>
          </div>
          <div class="settings-row-col">
            <span class="settings-label">Command Characteristic (Write):</span>
            <span class="uuid-mono">${BLE_CONFIG.commandCharacteristicUuid}</span>
          </div>
          <div class="settings-row-col">
            <span class="settings-label">Status Characteristic (Notify/Read):</span>
            <span class="uuid-mono">${BLE_CONFIG.statusCharacteristicUuid}</span>
          </div>
        </div>

        <!-- App Info -->
        <span class="settings-group-label" style="margin-top: 1rem;">ABOUT</span>
        <div class="settings-card-group">
          <div class="settings-row">
            <span class="settings-label">Application</span>
            <span style="font-weight: 600;">${APP_CONFIG.appName} v${APP_CONFIG.version}</span>
          </div>
          <div class="settings-row">
            <span class="settings-label">Architecture</span>
            <span style="color: var(--color-text-secondary);">Capacitor 8 • Vanilla JS</span>
          </div>
        </div>
      </div>

      <button class="btn btn-secondary" id="btn-settings-ok" style="width: 100%; margin-top: 1.25rem;">
        Done
      </button>
    </div>
  `;

  document.body.appendChild(backdrop);

  const toggleAutoReconnect = backdrop.querySelector('#toggle-auto-reconnect');
  if (toggleAutoReconnect) {
    toggleAutoReconnect.onchange = (e) => {
      const enabled = e.target.checked;
      outletState.setAutoReconnect(enabled);
      appState.setState({
        notification: {
          type: 'info',
          message: enabled ? 'Auto-reconnection enabled' : 'Auto-reconnection disabled',
        },
      });
    };
  }

  const close = () => backdrop.remove();
  backdrop.querySelector('#btn-close-settings').onclick = close;
  backdrop.querySelector('#btn-settings-ok').onclick = close;
  backdrop.onclick = (e) => {
    if (e.target === backdrop) close();
  };
}
