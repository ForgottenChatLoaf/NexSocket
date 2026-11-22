import { outletState } from '../state/outlet-state.js';
import { outletService } from '../services/outlet-service.js';
import { appState } from '../state/app-state.js';
import { renderConfirmationDialog } from './confirmation-dialog.js';

export function renderQuickActions() {
  const section = document.createElement('section');
  section.className = 'card quick-actions-card';
  section.setAttribute('aria-label', 'Quick Actions');

  function update() {
    const { connected, outlet1, outlet2, isPending } = outletState.getState();
    const bothOn = outlet1 && outlet2;
    const bothOff = !outlet1 && !outlet2;

    section.innerHTML = `
      <div class="quick-actions-header">
        <span class="quick-actions-eyebrow">FAST CONTROLS</span>
        <h2 class="quick-actions-title">Quick Actions</h2>
      </div>

      <div class="quick-actions-grid">
        <!-- Turn All ON -->
        <button 
          type="button" 
          class="btn-quick-action btn-quick-on" 
          id="btn-quick-all-on"
          ${!connected || isPending || bothOn ? 'disabled' : ''}
          aria-label="Turn All Outlets ON"
        >
          <div class="quick-action-icon-circle on-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M18.36 6.64a9 9 0 1 1-12.73 0"></path>
              <line x1="12" y1="2" x2="12" y2="12"></line>
            </svg>
          </div>
          <div class="quick-action-content">
            <span class="quick-action-label">Turn All ON</span>
            <small class="quick-action-desc">Master Power (Both Channels)</small>
          </div>
        </button>

        <!-- Turn All OFF -->
        <button 
          type="button" 
          class="btn-quick-action btn-quick-off" 
          id="btn-quick-all-off"
          ${!connected || isPending || bothOff ? 'disabled' : ''}
          aria-label="Turn All Outlets OFF"
        >
          <div class="quick-action-icon-circle off-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line>
            </svg>
          </div>
          <div class="quick-action-content">
            <span class="quick-action-label">Turn All OFF</span>
            <small class="quick-action-desc">Master Shutoff (Both Channels)</small>
          </div>
        </button>
      </div>
    `;

    // Turn All ON Handler
    const btnAllOn = section.querySelector('#btn-quick-all-on');
    if (btnAllOn) {
      btnAllOn.onclick = () => {
        const dialog = renderConfirmationDialog({
          title: 'Power Up All Outlets?',
          message: 'This will immediately supply electrical power to both Outlet 1 and Outlet 2.',
          confirmText: 'Turn All ON',
          cancelText: 'Cancel',
          type: 'primary',
          onConfirm: async () => {
            try {
              await outletService.allOn();
              appState.setState({
                notification: { type: 'success', message: 'Master Power: Both outlets turned ON.' },
              });
            } catch (err) {
              appState.setState({
                notification: { type: 'error', message: `Master power activation failed: ${err.message}` },
              });
            }
          },
        });
        document.body.appendChild(dialog);
      };
    }

    // Turn All OFF Handler
    const btnAllOff = section.querySelector('#btn-quick-all-off');
    if (btnAllOff) {
      btnAllOff.onclick = () => {
        const dialog = renderConfirmationDialog({
          title: 'Shut Down All Outlets?',
          message: 'This will immediately cut electrical power to all connected devices on Outlet 1 and Outlet 2.',
          confirmText: 'Turn All OFF',
          cancelText: 'Cancel',
          onConfirm: async () => {
            try {
              await outletService.allOff();
              appState.setState({
                notification: { type: 'success', message: 'Master Shutoff: Both outlets turned OFF.' },
              });
            } catch (err) {
              appState.setState({
                notification: { type: 'error', message: `Master shutoff failed: ${err.message}` },
              });
            }
          },
        });
        document.body.appendChild(dialog);
      };
    }
  }

  outletState.subscribe(update);
  update();

  return section;
}
