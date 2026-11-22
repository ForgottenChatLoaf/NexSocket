import { APP_CONFIG } from '../config/app-config.js';
import { BLE_CONFIG } from '../services/bluetooth/ble-config.js';
import { appState } from '../state/app-state.js';
import { outletState } from '../state/outlet-state.js';

export function renderDesktopSidebar() {
  const aside = document.createElement('aside');
  aside.className = 'desktop-sidebar';
  aside.setAttribute('aria-label', 'Desktop Navigation Sidebar');

  function update() {
    const { activeTab, operationMode } = appState.getState();
    const { connected } = outletState.getState();
    const isDemo = operationMode === 'demo';

    aside.innerHTML = `
      <div class="sidebar-header">
        <div class="sidebar-brand">
          <img src="${APP_CONFIG.logoPath}" alt="${APP_CONFIG.appName}" class="sidebar-logo" />
          <div class="sidebar-brand-text">
            <span class="sidebar-title">Nex<span class="sidebar-title-accent">Socket</span></span>
            <span class="sidebar-subtitle">SMART OUTLET CONTROL</span>
          </div>
        </div>
      </div>

      <!-- Quick Status Widget in Sidebar -->
      <div class="sidebar-status-box">
        <div class="sidebar-status-header">
          <span class="pulse-dot ${connected ? 'online' : 'offline'}"></span>
          <span class="sidebar-status-label">${connected ? 'CONNECTED' : 'DISCONNECTED'}</span>
        </div>
        <div class="sidebar-status-meta">
          <span class="sidebar-mode-tag ${isDemo ? 'demo' : 'hardware'}">
            ${isDemo ? '🧪 DEMO SIMULATOR' : '⚡ LIVE HARDWARE'}
          </span>
          <span class="sidebar-device-tag">${BLE_CONFIG.deviceName}</span>
        </div>
      </div>

      <!-- Navigation Menu -->
      <nav class="sidebar-nav">
        <button 
          type="button" 
          class="sidebar-nav-link ${activeTab === 'home' ? 'active' : ''}" 
          data-tab="home"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            <polyline points="9 22 9 12 15 12 15 22"/>
          </svg>
          <span>Dashboard</span>
        </button>

        <button 
          type="button" 
          class="sidebar-nav-link ${activeTab === 'devices' ? 'active' : ''}" 
          data-tab="devices"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="m7 7 10 10-5 5V2l5 5L7 17"/>
          </svg>
          <span>Devices & BLE</span>
        </button>

        <button 
          type="button" 
          class="sidebar-nav-link ${activeTab === 'activity' ? 'active' : ''}" 
          data-tab="activity"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12 6 12 12 16 14"/>
          </svg>
          <span>Activity Log</span>
        </button>

        <button 
          type="button" 
          class="sidebar-nav-link ${activeTab === 'settings' ? 'active' : ''}" 
          data-tab="settings"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="3"/>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
          </svg>
          <span>Hardware & Specs</span>
        </button>
      </nav>

      <!-- Sidebar Footer -->
      <div class="sidebar-footer">
        <div class="sidebar-footer-card">
          <span class="sidebar-footer-title">ESP32-C3 Super Mini</span>
          <span class="sidebar-footer-desc">Direct BLE GATT Peripheral · ADET211</span>
        </div>
      </div>
    `;

    aside.querySelectorAll('.sidebar-nav-link').forEach((btn) => {
      btn.onclick = () => {
        const tab = btn.dataset.tab;
        appState.setActiveTab(tab);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      };
    });
  }

  appState.subscribe(update);
  outletState.subscribe(update);
  update();

  return aside;
}
