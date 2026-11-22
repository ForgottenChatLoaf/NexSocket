import { appState } from '../state/app-state.js';
import { outletState } from '../state/outlet-state.js';

export function renderBottomNavigation() {
  const nav = document.createElement('nav');
  nav.className = 'bottom-nav-bar';
  nav.setAttribute('aria-label', 'Mobile Bottom Navigation');

  function update() {
    const { activeTab } = appState.getState();
    const { connected } = outletState.getState();

    nav.innerHTML = `
      <button 
        type="button" 
        class="bottom-nav-item ${activeTab === 'home' ? 'active' : ''}" 
        data-tab="home"
        aria-label="Home Dashboard"
        aria-selected="${activeTab === 'home'}"
      >
        <div class="bottom-nav-icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            <polyline points="9 22 9 12 15 12 15 22"/>
          </svg>
        </div>
        <span class="bottom-nav-label">Home</span>
      </button>

      <button 
        type="button" 
        class="bottom-nav-item ${activeTab === 'devices' ? 'active' : ''}" 
        data-tab="devices"
        aria-label="Devices and Bluetooth Connection"
        aria-selected="${activeTab === 'devices'}"
      >
        <div class="bottom-nav-icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="m7 7 10 10-5 5V2l5 5L7 17"/>
          </svg>
          ${connected ? '<span class="nav-status-dot connected"></span>' : ''}
        </div>
        <span class="bottom-nav-label">Devices</span>
      </button>

      <button 
        type="button" 
        class="bottom-nav-item ${activeTab === 'activity' ? 'active' : ''}" 
        data-tab="activity"
        aria-label="Activity History Log"
        aria-selected="${activeTab === 'activity'}"
      >
        <div class="bottom-nav-icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12 6 12 12 16 14"/>
          </svg>
        </div>
        <span class="bottom-nav-label">Activity</span>
      </button>

      <button 
        type="button" 
        class="bottom-nav-item ${activeTab === 'settings' ? 'active' : ''}" 
        data-tab="settings"
        aria-label="Settings and Hardware Specifications"
        aria-selected="${activeTab === 'settings'}"
      >
        <div class="bottom-nav-icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="3"/>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
          </svg>
        </div>
        <span class="bottom-nav-label">Settings</span>
      </button>
    `;

    nav.querySelectorAll('.bottom-nav-item').forEach((btn) => {
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

  return nav;
}
