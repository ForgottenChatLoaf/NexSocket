import { APP_CONFIG } from '../config/app-config.js';
import { BLE_CONFIG } from '../services/bluetooth/ble-config.js';
import { outletState } from '../state/outlet-state.js';
import { appState } from '../state/app-state.js';

export function openNavigationDrawer(onOpenSettings) {
  const existing = document.querySelector('#nav-drawer-backdrop');
  if (existing) existing.remove();

  const backdrop = document.createElement('div');
  backdrop.id = 'nav-drawer-backdrop';
  backdrop.className = 'drawer-backdrop';

  const { connected } = outletState.getState();
  const { operationMode } = appState.getState();
  const isDemo = operationMode === 'demo';

  backdrop.innerHTML = `
    <div class="drawer-panel" role="dialog" aria-label="Main Navigation">
      <!-- Drawer Header -->
      <div class="drawer-header">
        <div class="drawer-brand">
          <img src="${APP_CONFIG.logoPath}" alt="${APP_CONFIG.appName}" class="drawer-logo" />
          <div class="drawer-brand-text">
            <span class="drawer-title">Nex<span style="color: var(--color-brand-blue);">Socket</span></span>
            <span class="drawer-version">v${APP_CONFIG.version} · ADET211</span>
          </div>
        </div>
        <button class="btn-icon drawer-close" id="btn-close-drawer" aria-label="Close navigation menu">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      <!-- Device Status Pill Inside Drawer -->
      <div class="drawer-status-card">
        <div style="display: flex; align-items: center; gap: 0.5rem;">
          <span class="pulse-dot ${connected ? 'online' : 'offline'}"></span>
          <span style="font-size: 0.8rem; font-weight: 600; color: var(--color-text-primary);">
            ${connected ? 'Connected: ' + BLE_CONFIG.deviceName : 'Disconnected (Offline)'}
          </span>
        </div>
        <span class="demo-badge">${isDemo ? 'SIMULATOR' : 'LIVE BLE'}</span>
      </div>

      <!-- Navigation Links -->
      <nav class="drawer-nav">
        <button class="drawer-link active" data-action="dashboard">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
          <div class="drawer-link-text">
            <span>Dashboard</span>
            <small>Main overview & quick controls</small>
          </div>
        </button>

        <button class="drawer-link" data-action="connection">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m7 7 10 10-5 5V2l5 5L7 17"/></svg>
          <div class="drawer-link-text">
            <span>Device Connection</span>
            <small>Bluetooth scanner & link status</small>
          </div>
        </button>

        <button class="drawer-link" data-action="outlets">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="6" y="2" width="12" height="20" rx="2"/><circle cx="12" cy="14" r="4"/><line x1="12" y1="6" x2="12.01" y2="6"/></svg>
          <div class="drawer-link-text">
            <span>Outlet Management</span>
            <small>Channel relays & custom names</small>
          </div>
        </button>

        <button class="drawer-link" data-action="history">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          <div class="drawer-link-text">
            <span>Activity History</span>
            <small>Device events & relay audit log</small>
          </div>
        </button>

        <button class="drawer-link" data-action="settings">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
          <div class="drawer-link-text">
            <span>Settings & Specs</span>
            <small>Hardware specs & auto-reconnect</small>
          </div>
        </button>

        <button class="drawer-link" data-action="about">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
          <div class="drawer-link-text">
            <span>About & Presentation</span>
            <small>ADET211 showcase & project guide</small>
          </div>
        </button>
      </nav>

      <!-- Drawer Footer -->
      <div class="drawer-footer">
        <span>ESP32-C3 Super Mini · Bluetooth LE</span>
        <small>© 2026 NexSocket Team</small>
      </div>
    </div>
  `;

  document.body.appendChild(backdrop);
  document.body.style.overflow = 'hidden'; // Lock background scroll

  const close = () => {
    if (backdrop.classList.contains('closing')) return;
    backdrop.classList.add('closing');
    setTimeout(() => {
      backdrop.remove();
      document.body.style.overflow = '';
    }, 240);
  };

  backdrop.querySelector('#btn-close-drawer').onclick = close;
  backdrop.onclick = (e) => {
    if (e.target === backdrop) close();
  };

  // Keyboard accessibility
  const handleKey = (e) => {
    if (e.key === 'Escape') {
      close();
      window.removeEventListener('keydown', handleKey);
    }
  };
  window.addEventListener('keydown', handleKey);

  // Link actions
  backdrop.querySelectorAll('.drawer-link').forEach((btn) => {
    btn.onclick = () => {
      const action = btn.dataset.action;
      close();

      if (action === 'dashboard') {
        appState.setActiveTab('home');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (action === 'connection') {
        appState.setActiveTab('devices');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (action === 'outlets') {
        appState.setActiveTab('home');
        setTimeout(() => {
          const el = document.querySelector('.outlet-grid');
          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 50);
      } else if (action === 'history') {
        appState.setActiveTab('activity');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (action === 'settings') {
        appState.setActiveTab('settings');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (action === 'about') {
        openAboutModal();
      }
    };
  });
}

export function openAboutModal() {
  const existing = document.querySelector('#about-modal-backdrop');
  if (existing) existing.remove();

  const backdrop = document.createElement('div');
  backdrop.id = 'about-modal-backdrop';
  backdrop.className = 'dialog-backdrop';

  backdrop.innerHTML = `
    <div class="dialog-modal about-modal" role="dialog" aria-labelledby="about-title">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem;">
        <div style="display: flex; align-items: center; gap: 0.5rem;">
          <h2 id="about-title" style="font-size: var(--font-size-lg); font-weight: var(--font-weight-bold); color: var(--color-text-primary);">
            About NexSocket
          </h2>
        </div>
        <button class="btn-icon" id="btn-close-about" aria-label="Close about dialog">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      <div class="settings-scroll-area">
        <span class="settings-group-label">PROJECT DETAILS</span>
        <div class="settings-card-group">
          <div class="settings-row">
            <span class="settings-label">Course</span>
            <span style="font-weight: 600; color: var(--color-brand-cyan);">ADET211 Final Showcase</span>
          </div>
          <div class="settings-row">
            <span class="settings-label">System Type</span>
            <span style="color: var(--color-text-secondary);">Smart Dual Extension Outlet</span>
          </div>
          <div class="settings-row">
            <span class="settings-label">Microcontroller</span>
            <span style="color: var(--color-text-secondary);">ESP32-C3 Super Mini (RISC-V)</span>
          </div>
          <div class="settings-row">
            <span class="settings-label">Link Protocol</span>
            <span style="color: var(--color-text-secondary);">Direct Bluetooth Low Energy (GATT)</span>
          </div>
        </div>

        <span class="settings-group-label" style="margin-top: 1rem;">PRESENTATION & DEMO FLOW</span>
        <div class="settings-card-group">
          <p style="font-size: 0.8rem; color: var(--color-text-secondary); line-height: 1.5;">
            1. <b>Application Launch:</b> Open NexSocket on phone; shows clean disconnected standby.<br/>
            2. <b>Bluetooth Pair:</b> Tap Connect to discover <code>SMART_OUTLET_01</code>.<br/>
            3. <b>Independent Control:</b> Toggle Outlet 1 and Outlet 2 independently.<br/>
            4. <b>Quick Actions:</b> Demonstrate Turn All ON and Turn All OFF with confirmation safety.<br/>
            5. <b>Activity Audit:</b> Inspect verified timestamped events in Activity History.
          </p>
        </div>

        <span class="settings-group-label" style="margin-top: 1rem;">ARCHITECTURE INTEGRITY</span>
        <div class="settings-card-group">
          <p style="font-size: 0.8rem; color: var(--color-text-secondary); line-height: 1.5;">
            • <b>Offline Architecture:</b> Runs 100% without Wi-Fi, cloud, or external database.<br/>
            • <b>Confirmed States:</b> Displayed outlet states reflect confirmed device notifications, never unverified clicks.<br/>
            • <b>Honest Metrics:</b> Relays report active channels without fabricated electrical wattage.
          </p>
        </div>
      </div>

      <button class="btn btn-secondary" id="btn-about-ok" style="width: 100%; margin-top: 1.25rem;">
        Done
      </button>
    </div>
  `;

  document.body.appendChild(backdrop);

  const close = () => backdrop.remove();
  backdrop.querySelector('#btn-close-about').onclick = close;
  backdrop.querySelector('#btn-about-ok').onclick = close;
  backdrop.onclick = (e) => {
    if (e.target === backdrop) close();
  };
}
