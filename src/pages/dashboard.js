import { renderHeader } from '../components/header.js';
import { renderConnectionPanel } from '../components/connection-panel.js';
import { renderOutletCard } from '../components/outlet-card.js';
import { renderNotification } from '../components/notification.js';
import { renderConfirmationDialog } from '../components/confirmation-dialog.js';
import { outletState } from '../state/outlet-state.js';
import { outletService } from '../services/outlet-service.js';
import { appState } from '../state/app-state.js';

export function renderDashboard() {
  const container = document.createElement('main');
  container.className = 'main-container';

  // A. Application Header
  container.appendChild(renderHeader());

  // E. Notification Host
  container.appendChild(renderNotification());

  // B. Bluetooth Connection Panel
  container.appendChild(renderConnectionPanel());

  // Section Header: Power Controls
  const sectionRow = document.createElement('div');
  sectionRow.className = 'section-title-row';
  sectionRow.innerHTML = `
    <span class="section-title">Power Outlets</span>
    <span style="font-size: var(--font-size-xs); color: var(--color-text-muted);">2 Outputs Available</span>
  `;
  container.appendChild(sectionRow);

  // C. Outlet Management Grid (Outlet 1 & Outlet 2)
  const grid = document.createElement('div');
  grid.className = 'outlet-grid';
  grid.appendChild(renderOutletCard(1));
  grid.appendChild(renderOutletCard(2));
  container.appendChild(grid);

  // D. Global Control Card ("Turn All OFF")
  const globalCard = document.createElement('section');
  globalCard.className = 'card global-control-card';
  globalCard.setAttribute('aria-label', 'Global Controls');

  globalCard.innerHTML = `
    <div class="global-control-header">
      <div>
        <h2 class="global-control-title">Master Control</h2>
        <span class="global-control-desc">Instantly disconnect power to all paired outlets</span>
      </div>
      <span class="pulse-dot offline" id="global-power-indicator"></span>
    </div>

    <button 
      type="button"
      class="btn btn-danger btn-all-off" 
      id="btn-all-off"
      disabled
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M18.36 6.64a9 9 0 1 1-12.73 0"></path>
        <line x1="12" y1="2" x2="12" y2="12"></line>
      </svg>
      <span>Turn All OFF</span>
    </button>
  `;

  const allOffBtn = globalCard.querySelector('#btn-all-off');
  const globalIndicator = globalCard.querySelector('#global-power-indicator');

  function updateGlobal() {
    const { connected, outlet1, outlet2, isPending } = outletState.getState();
    const anyOn = outlet1 || outlet2;

    // Disabled when not connected, pending, or already all off
    allOffBtn.disabled = !connected || isPending || !anyOn;

    if (globalIndicator) {
      if (connected && anyOn) {
        globalIndicator.className = 'pulse-dot online';
      } else {
        globalIndicator.className = 'pulse-dot offline';
      }
    }
  }

  outletState.subscribe(updateGlobal);
  updateGlobal();

  allOffBtn.onclick = () => {
    const dialog = renderConfirmationDialog({
      title: 'Shut Down All Outlets?',
      message: 'This will immediately cut electrical power to all connected devices on Outlet 1 and Outlet 2.',
      confirmText: 'Turn All OFF',
      cancelText: 'Cancel',
      onConfirm: async () => {
        try {
          await outletService.allOff();
          appState.setState({
            notification: { type: 'success', message: 'All outlets have been turned OFF.' },
          });
        } catch (err) {
          appState.setState({
            notification: {
              type: 'error',
              message: `Master shutoff failed: ${err.message}`,
            },
          });
        }
      },
    });
    document.body.appendChild(dialog);
  };

  container.appendChild(globalCard);

  // Footer / Status line
  const footer = document.createElement('footer');
  footer.className = 'app-footer';
  footer.innerHTML = `
    <span>Bluetooth Low Energy • Direct Device Communication</span>
    <span>Runs completely offline without Wi-Fi or Cloud Services</span>
  `;
  container.appendChild(footer);

  return container;
}
