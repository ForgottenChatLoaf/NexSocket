import { outletState } from '../state/outlet-state.js';

export function renderSystemOverview() {
  const section = document.createElement('section');
  section.className = 'card system-overview-card';
  section.setAttribute('aria-label', 'System Overview');

  function update() {
    const { connected, outlet1, outlet2 } = outletState.getState();
    const activeCount = (outlet1 ? 1 : 0) + (outlet2 ? 1 : 0);
    const inactiveCount = 2 - activeCount;

    let statusText = 'Offline • Disconnected';
    let statusClass = 'offline';

    if (connected) {
      if (activeCount === 0) {
        statusText = 'Standby • All Off';
        statusClass = 'standby';
      } else if (activeCount === 1) {
        statusText = '1 Active Output';
        statusClass = 'active';
      } else {
        statusText = 'All Active (2/2)';
        statusClass = 'all-active';
      }
    }

    section.innerHTML = `
      <div class="overview-header">
        <div class="overview-title-group">
          <span class="overview-eyebrow">SYSTEM STATUS</span>
          <h2 class="overview-title">Overview</h2>
        </div>
        <span class="overview-status-pill ${statusClass}">
          <span class="pulse-dot ${connected && activeCount > 0 ? 'online' : statusClass === 'connecting' ? 'connecting' : 'offline'}"></span>
          <span>${statusText}</span>
        </span>
      </div>

      <div class="overview-metrics-grid">
        <div class="overview-metric">
          <span class="metric-value">2</span>
          <span class="metric-label">Total Outlets</span>
        </div>
        <div class="overview-metric ${connected && activeCount > 0 ? 'is-active' : ''}">
          <span class="metric-value active-val">${connected ? activeCount : '—'}</span>
          <span class="metric-label">Active Power</span>
        </div>
        <div class="overview-metric">
          <span class="metric-value">${connected ? inactiveCount : '—'}</span>
          <span class="metric-label">Inactive</span>
        </div>
      </div>
    `;
  }

  outletState.subscribe(update);
  update();

  return section;
}
