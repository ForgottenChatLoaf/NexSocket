import { outletState } from '../state/outlet-state.js';
import { outletService } from '../services/outlet-service.js';
import { appState } from '../state/app-state.js';

export function renderOutletCard(outletNumber) {
  const card = document.createElement('article');
  card.className = 'card outlet-card is-off';
  card.setAttribute('aria-label', `Outlet ${outletNumber} Control`);

  const outletKey = `outlet${outletNumber}`;

  function update() {
    const state = outletState.getState();
    const isOn = Boolean(state[outletKey]);
    const isConnected = state.connected;
    const isPending = Boolean(state.isPending);

    // Update active class on card wrapper
    card.classList.toggle('is-on', isOn && isConnected);
    card.classList.toggle('is-off', !isOn || !isConnected);

    card.innerHTML = `
      <div class="outlet-card-top">
        <div class="outlet-identity">
          <div class="outlet-icon-circle">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 2v10"></path>
              <path d="M18.4 6.6a9 9 0 1 1-12.77 0"></path>
            </svg>
          </div>
          <div class="outlet-title-group">
            <span class="outlet-label">Outlet ${outletNumber}</span>
            <span class="outlet-sublabel">Simulated Relay Channel ${outletNumber}</span>
          </div>
        </div>

        <div class="outlet-status-pill ${isConnected && isOn ? 'on' : 'off'}">
          <span class="pulse-dot ${isConnected && isOn ? 'online' : 'offline'}"></span>
          <span>${isConnected ? (isOn ? 'ON' : 'OFF') : 'OFFLINE'}</span>
        </div>
      </div>

      <div style="display: flex; flex-direction: column; gap: 0.5rem;">
        <div class="outlet-actions-row">
          <button 
            type="button"
            class="btn btn-outlet-on ${isConnected && isOn ? 'is-active' : ''}" 
            id="btn-outlet-${outletNumber}-on"
            ${!isConnected || isPending ? 'disabled' : ''}
            aria-pressed="${isOn}"
          >
            ${
              isPending && !isOn
                ? `<span class="spinner" style="width: 14px; height: 14px; border-width: 2px;"></span>
                   <span>Activating...</span>`
                : `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                     <circle cx="12" cy="12" r="9"></circle>
                     <path d="m9 12 2 2 4-4"></path>
                   </svg>
                   <span>Turn ON</span>`
            }
          </button>

          <button 
            type="button"
            class="btn btn-outlet-off ${isConnected && !isOn ? 'is-active' : ''}" 
            id="btn-outlet-${outletNumber}-off"
            ${!isConnected || isPending ? 'disabled' : ''}
            aria-pressed="${!isOn}"
          >
            ${
              isPending && isOn
                ? `<span class="spinner" style="width: 14px; height: 14px; border-width: 2px;"></span>
                   <span>Shutting down...</span>`
                : `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                     <circle cx="12" cy="12" r="9"></circle>
                     <path d="m15 9-6 6"></path>
                     <path d="m9 9 6 6"></path>
                   </svg>
                   <span>Turn OFF</span>`
            }
          </button>
        </div>

        ${
          !isConnected
            ? `<span style="font-size: var(--font-size-xs); color: var(--color-text-muted); text-align: center;">
                 Connect to Bluetooth device to control
               </span>`
            : ''
        }
      </div>
    `;

    const btnOn = card.querySelector(`#btn-outlet-${outletNumber}-on`);
    if (btnOn) {
      btnOn.onclick = async () => {
        if (!isConnected || isPending) return;
        if (isOn) {
          appState.setState({
            notification: { type: 'info', message: `Outlet ${outletNumber} is already ON` },
          });
          return;
        }

        try {
          if (outletNumber === 1) {
            await outletService.setOutlet1(true);
          } else {
            await outletService.setOutlet2(true);
          }
        } catch (err) {
          appState.setState({
            notification: {
              type: 'error',
              message: `Failed to turn ON Outlet ${outletNumber}: ${err.message}`,
            },
          });
        }
      };
    }

    const btnOff = card.querySelector(`#btn-outlet-${outletNumber}-off`);
    if (btnOff) {
      btnOff.onclick = async () => {
        if (!isConnected || isPending) return;
        if (!isOn) {
          appState.setState({
            notification: { type: 'info', message: `Outlet ${outletNumber} is already OFF` },
          });
          return;
        }

        try {
          if (outletNumber === 1) {
            await outletService.setOutlet1(false);
          } else {
            await outletService.setOutlet2(false);
          }
        } catch (err) {
          appState.setState({
            notification: {
              type: 'error',
              message: `Failed to turn OFF Outlet ${outletNumber}: ${err.message}`,
            },
          });
        }
      };
    }
  }

  outletState.subscribe(update);
  update();

  return card;
}
