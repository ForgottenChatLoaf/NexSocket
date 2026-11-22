import './index.css';
import { renderDashboard } from './pages/dashboard.js';
import { appState } from './state/app-state.js';
import { outletState } from './state/outlet-state.js';
import { renderStatusIndicator } from './components/status-indicator.js';
import { bleService } from './services/bluetooth/ble-service.js';

// ─── Service Worker Registration ─────────────────────────────────────────────
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js', { scope: '/' })
      .then((reg) => {
        console.log('[App] Service worker registered. Scope:', reg.scope);
        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                console.log('[App] New version cached and ready. Reload to update.');
              }
            });
          }
        });
      })
      .catch((err) => console.warn('[App] Service worker registration failed:', err));
  });
}

// ─── Showcase Mode ────────────────────────────────────────────────────────────
// ?showcase=1 → automatically enters Demo Mode, connects the simulated
// ESP32-C3 peripheral, and arms the outlet controls for live demonstration.
// Use this URL during the ADET211 final presentation.
async function activateShowcaseMode() {
  appState.setOperationMode('demo');
  appState.setState({
    notification: {
      type: 'info',
      message: '🎓 Showcase Mode — Demo ESP32-C3 connected automatically',
    },
  });

  try {
    await bleService.init();
    await bleService.startScan(async (device) => {
      await bleService.stopScan();
      await bleService.connect(device.deviceId);
      appState.setState({
        notification: {
          type: 'success',
          message: `Showcase Mode: Connected to ${device.name} (Simulated)`,
        },
      });
    });
  } catch (err) {
    console.warn('[Showcase] Auto-connect failed:', err.message);
  }
}

// ─── App Bootstrap ────────────────────────────────────────────────────────────
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

  // Activate showcase mode if URL param is present
  const params = new URLSearchParams(window.location.search);
  if (params.get('showcase') === '1') {
    activateShowcaseMode();
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
