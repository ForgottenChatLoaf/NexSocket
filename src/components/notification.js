import { appState } from '../state/app-state.js';

let notificationTimer = null;

export function renderNotification() {
  const container = document.createElement('div');
  container.id = 'notification-container';
  container.setAttribute('aria-live', 'polite');

  function update({ notification }) {
    if (notificationTimer) {
      clearTimeout(notificationTimer);
      notificationTimer = null;
    }

    if (!notification) {
      container.innerHTML = '';
      return;
    }

    const { type = 'info', message } = notification;

    let bg = 'rgba(59, 130, 246, 0.12)';
    let border = 'rgba(59, 130, 246, 0.3)';
    let color = 'var(--color-primary)';
    let iconSvg = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="16" x2="12" y2="12"></line>
        <line x1="12" y1="8" x2="12.01" y2="8"></line>
      </svg>
    `;

    if (type === 'success') {
      bg = 'var(--color-success-bg)';
      border = 'rgba(16, 185, 129, 0.35)';
      color = 'var(--color-success)';
      iconSvg = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
          <polyline points="22 4 12 14.01 9 11.01"></polyline>
        </svg>
      `;
    } else if (type === 'error') {
      bg = 'var(--color-danger-bg)';
      border = 'rgba(239, 68, 68, 0.35)';
      color = 'var(--color-danger)';
      iconSvg = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="15" y1="9" x2="9" y2="15"></line>
          <line x1="9" y1="9" x2="15" y2="15"></line>
        </svg>
      `;
    }

    container.innerHTML = `
      <div class="notification-toast" style="background-color: ${bg}; border-color: ${border}; color: ${color};">
        <div style="display: flex; align-items: center; gap: 0.625rem;">
          ${iconSvg}
          <span style="color: var(--color-text-primary); font-size: var(--font-size-sm);">${message}</span>
        </div>
        <button 
          id="btn-close-notification" 
          style="background: none; border: none; color: var(--color-text-secondary); cursor: pointer; padding: 0.25rem; display: flex; align-items: center;"
          aria-label="Dismiss notification"
        >
          ✕
        </button>
      </div>
    `;

    const closeBtn = container.querySelector('#btn-close-notification');
    if (closeBtn) {
      closeBtn.onclick = () => {
        appState.setState({ notification: null });
      };
    }

    // Auto dismiss after 4 seconds
    notificationTimer = setTimeout(() => {
      appState.setState({ notification: null });
    }, 4000);
  }

  appState.subscribe(update);
  return container;
}
