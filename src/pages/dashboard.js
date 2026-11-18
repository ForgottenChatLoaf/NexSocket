import { renderHeader } from '../components/header.js';
import { renderConnectionPanel } from '../components/connection-panel.js';
import { renderOutletCard } from '../components/outlet-card.js';
import { renderNotification } from '../components/notification.js';
import { renderConfirmationDialog } from '../components/confirmation-dialog.js';
import { outletState } from '../state/outlet-state.js';
import { outletService } from '../services/outlet-service.js';

export function renderDashboard() {
  const container = document.createElement('div');
  container.className = 'main-container';

  container.appendChild(renderHeader());
  container.appendChild(renderNotification());
  container.appendChild(renderConnectionPanel());

  const grid = document.createElement('div');
  grid.className = 'outlet-grid';
  grid.appendChild(renderOutletCard(1));
  grid.appendChild(renderOutletCard(2));
  container.appendChild(grid);

  const globalControls = document.createElement('div');
  globalControls.className = 'global-controls';
  globalControls.style.marginTop = '1rem';

  const allOffBtn = document.createElement('button');
  allOffBtn.className = 'btn btn-danger';
  allOffBtn.style.width = '100%';
  allOffBtn.textContent = 'ALL OFF';
  allOffBtn.id = 'btn-all-off';

  function updateGlobal() {
    const { connected, isPending } = outletState.getState();
    allOffBtn.disabled = !connected || isPending;
  }

  outletState.subscribe(updateGlobal);
  updateGlobal();

  allOffBtn.onclick = () => {
    const dialog = renderConfirmationDialog({
      title: 'Turn All Outlets OFF?',
      message: 'This will immediately disconnect power to all connected devices.',
      onConfirm: async () => {
        await outletService.allOff();
      },
    });
    document.body.appendChild(dialog);
  };

  globalControls.appendChild(allOffBtn);
  container.appendChild(globalControls);

  return container;
}
