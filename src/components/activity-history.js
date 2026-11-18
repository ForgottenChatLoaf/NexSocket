import { outletState } from '../state/outlet-state.js';

export function renderActivityHistory() {
  const section = document.createElement('section');
  section.className = 'card activity-history-card';
  section.setAttribute('aria-label', 'Activity History');

  let isCollapsed = false;

  function update() {
    const { history } = outletState.getState();
    const count = (history || []).length;

    section.innerHTML = `
      <div class="history-header">
        <div class="history-title-group">
          <div style="display: flex; align-items: center; gap: 0.5rem;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: var(--color-brand-cyan);">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
            <h2 class="history-title">Activity History</h2>
            <span class="history-count-badge">${count}</span>
          </div>
          <span class="history-sublabel">Live log of relay and Bluetooth events</span>
        </div>

        <div class="history-actions">
          ${count > 0 ? `<button class="btn-text-danger" id="btn-clear-history" title="Clear History">Clear</button>` : ''}
          <button class="btn-icon-sm" id="btn-toggle-history" aria-label="${isCollapsed ? 'Expand history' : 'Collapse history'}">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="transform: ${isCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)'}; transition: transform var(--transition-fast);">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </button>
        </div>
      </div>

      <div class="history-list-container ${isCollapsed ? 'is-collapsed' : ''}" id="history-container">
        ${
          count === 0
            ? `<div class="history-empty-state">
                 <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="color: var(--color-text-muted); opacity: 0.6;">
                   <circle cx="12" cy="12" r="10"></circle>
                   <line x1="12" y1="8" x2="12" y2="12"></line>
                   <line x1="12" y1="16" x2="12.01" y2="16"></line>
                 </svg>
                 <span>No activity recorded yet</span>
                 <span style="font-size: var(--font-size-xs); color: var(--color-text-muted);">Events will appear here as outlets are toggled</span>
               </div>`
            : `<div class="history-items-list">
                 ${history
                   .map((item) => {
                     let iconSvg = '';
                     let iconClass = 'ble';
                     if (item.type === 'power-on') {
                       iconClass = 'power-on';
                       iconSvg = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="9"/><path d="m9 12 2 2 4-4"/></svg>`;
                     } else if (item.type === 'power-off') {
                       iconClass = 'power-off';
                       iconSvg = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="9"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/></svg>`;
                     } else if (item.type === 'all-off') {
                       iconClass = 'all-off';
                       iconSvg = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18.36 6.64a9 9 0 1 1-12.73 0"/><line x1="12" y1="2" x2="12" y2="12"/></svg>`;
                     } else {
                       iconClass = 'bluetooth';
                       iconSvg = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m7 7 10 10-5 5V2l5 5L7 17"/></svg>`;
                     }

                     return `
                       <div class="history-item">
                         <div class="history-item-icon ${iconClass}">
                           ${iconSvg}
                         </div>
                         <div class="history-item-content">
                           <span class="history-item-title">${item.title}</span>
                           <span class="history-item-detail">${item.detail || ''}</span>
                         </div>
                         <span class="history-item-time">${item.timestamp}</span>
                       </div>
                     `;
                   })
                   .join('')}
               </div>`
        }
      </div>
    `;

    const btnClear = section.querySelector('#btn-clear-history');
    if (btnClear) {
      btnClear.onclick = () => {
        outletState.clearHistory();
      };
    }

    const btnToggle = section.querySelector('#btn-toggle-history');
    if (btnToggle) {
      btnToggle.onclick = () => {
        isCollapsed = !isCollapsed;
        update();
      };
    }
  }

  outletState.subscribe(update);
  update();

  return section;
}
