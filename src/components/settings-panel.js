import { APP_CONFIG } from '../config/app-config.js';
import { BLE_CONFIG } from '../services/bluetooth/ble-config.js';
import { bleService } from '../services/bluetooth/ble-service.js';
import { appState } from '../state/app-state.js';
import { outletState } from '../state/outlet-state.js';
import { openAboutModal } from './navigation-drawer.js';

export function renderSettingsPanel() {
  const container = document.createElement('section');
  container.className = 'settings-view-container';
  container.setAttribute('aria-label', 'Hardware Specifications & Preferences');

  function update() {
    const { autoReconnect } = outletState.getState();

    container.innerHTML = `
      <div class="view-header">
        <span class="view-eyebrow">CONFIGURATION</span>
        <h2 class="view-title">Settings & Hardware</h2>
        <p class="view-desc">Device configuration, GATT communication specifications, and application preferences.</p>
      </div>

      <!-- Preferences Card -->
      <div class="card settings-card">
        <h3 class="settings-section-title">Application Preferences</h3>
        <div class="settings-row">
          <div>
            <span class="settings-label">Auto-Reconnection</span>
            <span class="settings-desc">Automatically retry GATT link if Bluetooth connection drops unexpectedly</span>
          </div>
          <label class="toggle-switch">
            <input type="checkbox" id="settings-auto-reconnect" ${autoReconnect ? 'checked' : ''} />
            <span class="toggle-slider"></span>
          </label>
        </div>
      </div>

      <!-- Target Hardware Card -->
      <div class="card settings-card">
        <h3 class="settings-section-title">Target Hardware Architecture</h3>
        <div class="specs-grid">
          <div class="spec-item">
            <span class="spec-label">Target Peripheral</span>
            <span class="spec-val mono-cyan">${BLE_CONFIG.deviceName}</span>
          </div>
          <div class="spec-item">
            <span class="spec-label">Microcontroller</span>
            <span class="spec-val">ESP32-C3 RISC-V 32-bit</span>
          </div>
          <div class="spec-item">
            <span class="spec-label">Relay 1 Pin</span>
            <span class="spec-val">GPIO 4 (Safe Boot)</span>
          </div>
          <div class="spec-item">
            <span class="spec-label">Relay 2 Pin</span>
            <span class="spec-val">GPIO 5 (Safe Boot)</span>
          </div>
          <div class="spec-item">
            <span class="spec-label">Status Heartbeat</span>
            <span class="spec-val">GPIO 8 (On-board LED)</span>
          </div>
          <div class="spec-item">
            <span class="spec-label">Boot Strapping Avoided</span>
            <span class="spec-val" style="color: var(--color-primary);">GPIO 2 Protected</span>
          </div>
        </div>
      </div>

      <!-- GATT Specification Card -->
      <div class="card settings-card">
        <h3 class="settings-section-title">BLE GATT Profile (128-bit UUIDs)</h3>
        <div class="uuid-list">
          <div class="uuid-item">
            <span class="uuid-role">Service UUID (Primary):</span>
            <code class="uuid-val">${BLE_CONFIG.serviceUuid}</code>
          </div>
          <div class="uuid-item">
            <span class="uuid-role">Command Characteristic (Write):</span>
            <code class="uuid-val">${BLE_CONFIG.commandCharacteristicUuid}</code>
          </div>
          <div class="uuid-item">
            <span class="uuid-role">Status Characteristic (Notify/Read):</span>
            <code class="uuid-val">${BLE_CONFIG.statusCharacteristicUuid}</code>
          </div>
        </div>
      </div>

      <!-- Project Showcase & Guide Action -->
      <div class="card settings-card" style="border-color: rgba(59, 130, 246, 0.4); background: linear-gradient(180deg, rgba(59, 130, 246, 0.06) 0%, rgba(23, 29, 39, 1) 100%);">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
          <div>
            <h3 class="settings-section-title" style="margin-bottom: 0.25rem; display: flex; align-items: center; gap: 0.5rem;">
              <span>ADET211 Project Showcase</span>
              <span class="demo-badge">DEFENSE READY</span>
            </h3>
            <p style="font-size: var(--font-size-xs); color: var(--color-text-secondary); margin: 0;">
              Presentation guide, technical architecture, and 1-click live demonstration launcher.
            </p>
          </div>
          <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
            <button class="btn btn-secondary btn-sm" id="btn-open-about-modal">
              Project Guide
            </button>
            <button class="btn btn-primary btn-sm" id="btn-launch-showcase" style="background: var(--color-blue); border-color: var(--color-blue);">
              ⚡ Launch Demo
            </button>
          </div>
        </div>
      </div>
    `;

    const toggle = container.querySelector('#settings-auto-reconnect');
    if (toggle) {
      toggle.onchange = (e) => {
        outletState.setAutoReconnect(e.target.checked);
      };
    }

    const btnAbout = container.querySelector('#btn-open-about-modal');
    if (btnAbout) {
      btnAbout.onclick = () => {
        openAboutModal();
      };
    }

    const btnLaunchShowcase = container.querySelector('#btn-launch-showcase');
    if (btnLaunchShowcase) {
      btnLaunchShowcase.onclick = async () => {
        btnLaunchShowcase.disabled = true;
        btnLaunchShowcase.innerHTML = `<span class="spinner" style="width: 12px; height: 12px; border-width: 2px;"></span> Connecting...`;

        try {
          appState.setOperationMode('demo');
          await bleService.init();
          if (!outletState.getState().connected) {
            await bleService.startScan(async (device) => {
              await bleService.stopScan();
              await bleService.connect(device.deviceId);
            });
          }
          appState.setActiveTab('home');
          appState.setState({
            notification: {
              type: 'success',
              message: '🎓 Defense Showcase Mode: Simulated ESP32-C3 connected and armed!',
            },
          });
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (err) {
          appState.setState({
            notification: { type: 'error', message: `Failed to launch showcase: ${err.message}` },
          });
        } finally {
          btnLaunchShowcase.disabled = false;
          btnLaunchShowcase.innerHTML = `⚡ Launch Demo`;
        }
      };
    }
  }

  outletState.subscribe(update);
  update();

  return container;
}
