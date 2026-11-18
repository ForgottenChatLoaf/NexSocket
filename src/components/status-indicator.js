import { appState } from '../state/app-state.js';

export function renderStatusIndicator(isConnected = false) {
  const container = document.createElement('div');
  container.className = 'status-indicator';
  container.style.display = 'inline-flex';
  container.style.alignItems = 'center';
  container.style.gap = '0.45rem';
  container.style.fontSize = 'var(--font-size-xs)';
  container.style.padding = '0.3rem 0.75rem';
  container.style.borderRadius = 'var(--radius-full)';
  container.style.border = '1px solid';
  container.style.fontWeight = '600';
  container.style.transition = 'all var(--transition-fast)';

  const { isScanning, isConnecting } = appState.getState();

  if (isConnected) {
    container.style.backgroundColor = 'var(--color-success-bg)';
    container.style.borderColor = 'rgba(16, 185, 129, 0.35)';
    container.style.color = 'var(--color-success)';
    container.innerHTML = `
      <span class="pulse-dot online"></span>
      <span>Connected</span>
    `;
  } else if (isScanning || isConnecting) {
    container.style.backgroundColor = 'var(--color-warning-bg)';
    container.style.borderColor = 'rgba(245, 158, 11, 0.35)';
    container.style.color = 'var(--color-warning)';
    container.innerHTML = `
      <span class="spinner" style="width: 10px; height: 10px; border-width: 1.5px; border-top-color: var(--color-warning);"></span>
      <span>${isScanning ? 'Scanning...' : 'Connecting...'}</span>
    `;
  } else {
    container.style.backgroundColor = 'rgba(100, 116, 139, 0.15)';
    container.style.borderColor = 'rgba(100, 116, 139, 0.25)';
    container.style.color = 'var(--color-text-muted)';
    container.innerHTML = `
      <span class="pulse-dot offline"></span>
      <span>Disconnected</span>
    `;
  }

  return container;
}
