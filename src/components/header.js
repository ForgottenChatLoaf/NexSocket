import { APP_CONFIG } from '../config/app-config.js';
import { BLE_CONFIG } from '../services/bluetooth/ble-config.js';

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
        <h1 class="brand-title">${APP_CONFIG.appName}</h1>
        <span class="brand-subtitle">Smart BLE Controller</span>
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

  backdrop.innerHTML = `
    <div class="dialog-modal" role="dialog" aria-labelledby="settings-title">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem;">
        <h2 id="settings-title" style="font-size: var(--font-size-lg); font-weight: 700; color: var(--color-text-primary);">
          App & Device Settings
        </h2>
        <button class="btn-icon" id="btn-close-settings" aria-label="Close settings">✕</button>
      </div>

      <div style="display: flex; flex-direction: column; gap: 0.875rem; font-size: var(--font-size-sm); margin-bottom: 1.5rem;">
        <div style="display: flex; justify-content: space-between; padding: 0.5rem 0; border-bottom: 1px solid var(--color-border);">
          <span style="color: var(--color-text-secondary);">Application</span>
          <span style="font-weight: 600;">${APP_CONFIG.appName} v${APP_CONFIG.version}</span>
        </div>
        <div style="display: flex; justify-content: space-between; padding: 0.5rem 0; border-bottom: 1px solid var(--color-border);">
          <span style="color: var(--color-text-secondary);">Operating Mode</span>
          <span class="demo-badge">MOCK / DEMO MODE</span>
        </div>
        <div style="display: flex; justify-content: space-between; padding: 0.5rem 0; border-bottom: 1px solid var(--color-border);">
          <span style="color: var(--color-text-secondary);">Target Device</span>
          <span style="font-family: monospace; font-weight: 600;">${BLE_CONFIG.deviceName}</span>
        </div>
        <div style="display: flex; flex-direction: column; gap: 0.25rem; padding: 0.5rem 0; border-bottom: 1px solid var(--color-border);">
          <span style="color: var(--color-text-secondary);">Service UUID:</span>
          <span style="font-family: monospace; font-size: var(--font-size-xs); color: var(--color-text-primary); word-break: break-all;">
            ${BLE_CONFIG.serviceUuid}
          </span>
        </div>
        <div style="display: flex; flex-direction: column; gap: 0.25rem; padding: 0.5rem 0;">
          <span style="color: var(--color-text-secondary);">Command UUID:</span>
          <span style="font-family: monospace; font-size: var(--font-size-xs); color: var(--color-text-primary); word-break: break-all;">
            ${BLE_CONFIG.commandCharacteristicUuid}
          </span>
        </div>
      </div>

      <button class="btn btn-secondary" id="btn-settings-ok" style="width: 100%;">
        Done
      </button>
    </div>
  `;

  document.body.appendChild(backdrop);

  const close = () => backdrop.remove();
  backdrop.querySelector('#btn-close-settings').onclick = close;
  backdrop.querySelector('#btn-settings-ok').onclick = close;
  backdrop.onclick = (e) => {
    if (e.target === backdrop) close();
  };
}
