import './index.css';
import { renderDashboard } from './pages/dashboard.js';
import { appState } from './state/app-state.js';
import { outletState } from './state/outlet-state.js';
import { renderStatusIndicator } from './components/status-indicator.js';

function initApp() {
  const app = document.querySelector('#app');
  if (!app) return;

  app.innerHTML = '';
  app.appendChild(renderDashboard());

  const pillContainer = document.querySelector('#header-connection-pill');
  if (pillContainer) {
    const updatePill = () => {
      pillContainer.innerHTML = '';
      pillContainer.appendChild(renderStatusIndicator(outletState.getState().connected));
    };

    outletState.subscribe(updatePill);
    appState.subscribe(updatePill);
    updatePill();
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
