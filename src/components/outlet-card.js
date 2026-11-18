import { outletState } from '../state/outlet-state.js';
import { outletService } from '../services/outlet-service.js';
import { appState } from '../state/app-state.js';

export function renderOutletCard(outletNumber) {
  const card = document.createElement('article');
  card.className = 'card outlet-card is-off';
  card.setAttribute('aria-label', `Outlet ${outletNumber} Control`);

  const outletKey = `outlet${outletNumber}`;
  let isEditing = false;

  function update() {
    const state = outletState.getState();
    const isOn = Boolean(state[outletKey]);
    const isConnected = state.connected;
    const isPending = Boolean(state.isPending);
    const outletName = (state.names && state.names[outletKey]) || `Outlet ${outletNumber}`;

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
            ${
              isEditing
                ? `<div class="outlet-rename-row">
                     <input type="text" class="outlet-rename-input" id="input-rename-${outletNumber}" value="${outletName}" maxlength="24" placeholder="Outlet name" />
                     <button class="btn-icon-xs btn-confirm-rename" id="btn-save-rename-${outletNumber}" title="Save Name">
                       <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                     </button>
                     <button class="btn-icon-xs btn-cancel-rename" id="btn-cancel-rename-${outletNumber}" title="Cancel">
                       <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                     </button>
                   </div>`
                : `<div style="display: flex; align-items: center; gap: 0.45rem;">
                     <span class="outlet-label" id="label-outlet-${outletNumber}">${outletName}</span>
                     <button class="btn-icon-xs btn-edit-name" id="btn-edit-${outletNumber}" title="Rename Outlet" aria-label="Rename ${outletName}">
                       <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                         <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
                       </svg>
                     </button>
                   </div>`
            }
            <span class="outlet-sublabel">Relay Channel ${outletNumber} • Direct BLE</span>
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

    // Rename handlers
    const btnEdit = card.querySelector(`#btn-edit-${outletNumber}`);
    if (btnEdit) {
      btnEdit.onclick = () => {
        isEditing = true;
        update();
        const input = card.querySelector(`#input-rename-${outletNumber}`);
        if (input) {
          input.focus();
          input.select();
        }
      };
    }

    const btnSaveRename = card.querySelector(`#btn-save-rename-${outletNumber}`);
    const inputRename = card.querySelector(`#input-rename-${outletNumber}`);
    if (btnSaveRename && inputRename) {
      const save = () => {
        const val = inputRename.value.trim();
        if (val) {
          outletState.setOutletName(outletKey, val);
          appState.setState({
            notification: { type: 'success', message: `Outlet renamed to "${val}"` },
          });
        }
        isEditing = false;
        update();
      };
      btnSaveRename.onclick = save;
      inputRename.onkeydown = (e) => {
        if (e.key === 'Enter') save();
        if (e.key === 'Escape') {
          isEditing = false;
          update();
        }
      };
    }

    const btnCancelRename = card.querySelector(`#btn-cancel-rename-${outletNumber}`);
    if (btnCancelRename) {
      btnCancelRename.onclick = () => {
        isEditing = false;
        update();
      };
    }

    // Toggle handlers
    const btnOn = card.querySelector(`#btn-outlet-${outletNumber}-on`);
    if (btnOn) {
      btnOn.onclick = async () => {
        if (!isConnected || isPending) return;
        if (isOn) {
          appState.setState({
            notification: { type: 'info', message: `${outletName} is already ON` },
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
              message: `Failed to turn ON ${outletName}: ${err.message}`,
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
            notification: { type: 'info', message: `${outletName} is already OFF` },
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
              message: `Failed to turn OFF ${outletName}: ${err.message}`,
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
