import { outletState } from '../state/outlet-state.js';
import { outletService } from '../services/outlet-service.js';

export function renderOutletCard(outletNumber) {
  const card = document.createElement('div');
  card.className = 'card outlet-card';
  const outletKey = `outlet${outletNumber}`;

  function update() {
    const state = outletState.getState();
    const isOn = !!state[outletKey];
    const isConnected = state.connected;
    const isPending = state.isPending;

    card.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
        <div>
          <h3 style="font-size: var(--font-size-base); font-weight: 600;">Outlet ${outletNumber}</h3>
          <span style="font-size: var(--font-size-xs); color: ${isOn ? 'var(--color-success)' : 'var(--color-text-muted)'}; font-weight: 600;">
            ${isOn ? '● ON' : '○ OFF'}
          </span>
        </div>
      </div>
      <button 
        class="btn ${isOn ? 'btn-danger' : 'btn-primary'}" 
        id="toggle-outlet-${outletNumber}" 
        style="width: 100%;"
        ${!isConnected || isPending ? 'disabled' : ''}
      >
        ${isOn ? 'Turn OFF' : 'Turn ON'}
      </button>
    `;

    const toggleBtn = card.querySelector(`#toggle-outlet-${outletNumber}`);
    if (toggleBtn) {
      toggleBtn.onclick = async () => {
        if (!isConnected || isPending) return;
        if (outletNumber === 1) {
          await outletService.setOutlet1(!isOn);
        } else {
          await outletService.setOutlet2(!isOn);
        }
      };
    }
  }

  outletState.subscribe(update);
  update();

  return card;
}
