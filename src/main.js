import './index.css';
import { renderDashboard } from './pages/dashboard.js';
import { appState } from './state/app-state.js';
import { renderStatusIndicator } from './components/status-indicator.js';
import { outletState } from './state/outlet-state.js';

function initApp() {
  const app = document.querySelector('#app');
  if (!app) return;

  app.innerHTML = '';
  app.appendChild(renderDashboard());

  const pillContainer = document.querySelector('#header-connection-pill');
  if (pillContainer) {
    function updatePill(state) {
      pillContainer.innerHTML = '';
      pillContainer.appendChild(renderStatusIndicator(state.connected));
    }
    outletState.subscribe(updatePill);
  }

  const notificationEl = document.querySelector('#app-notification');
  if (notificationEl) {
    appState.subscribe(({ notification }) => {
      if (notification) {
        notificationEl.style.display = 'block';
        notificationEl.textContent = notification.message;
        if (notification.type === 'error') {
          notificationEl.style.backgroundColor = 'rgba(239, 68, 68, 0.15)';
          notificationEl.style.color = '#ef4444';
          notificationEl.style.border = '1px solid rgba(239, 68, 68, 0.3)';
        } else if (notification.type === 'success') {
          notificationEl.style.backgroundColor = 'var(--color-success-bg)';
          notificationEl.style.color = 'var(--color-success)';
          notificationEl.style.border = '1px solid rgba(16, 185, 129, 0.3)';
        } else {
          notificationEl.style.backgroundColor = 'rgba(59, 130, 246, 0.15)';
          notificationEl.style.color = 'var(--color-primary)';
          notificationEl.style.border = '1px solid rgba(59, 130, 246, 0.3)';
        }
      } else {
        notificationEl.style.display = 'none';
      }
    });
  }
}

document.addEventListener('DOMContentLoaded', initApp);
