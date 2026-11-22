export function renderConfirmationDialog({
  title = 'Confirmation Required',
  message = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'danger', // 'danger' | 'primary'
  onConfirm,
  onCancel,
}) {
  const backdrop = document.createElement('div');
  backdrop.className = 'dialog-backdrop';
  backdrop.setAttribute('role', 'dialog');
  backdrop.setAttribute('aria-modal', 'true');

  const isPrimary = type === 'primary';

  backdrop.innerHTML = `
    <div class="dialog-modal" role="document">
      <div style="display: flex; align-items: flex-start; gap: 0.875rem; margin-bottom: 1.25rem;">
        <div style="display: flex; align-items: center; justify-content: center; width: 42px; height: 42px; border-radius: var(--radius-full); background-color: ${isPrimary ? 'var(--color-primary-bg)' : 'var(--color-danger-bg)'}; color: ${isPrimary ? 'var(--color-primary)' : 'var(--color-danger)'}; border: 1px solid ${isPrimary ? 'rgba(16, 185, 129, 0.4)' : 'rgba(249, 115, 22, 0.4)'}; flex-shrink: 0;">
          ${
            isPrimary
              ? `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                   <path d="M18.36 6.64a9 9 0 1 1-12.73 0"></path>
                   <line x1="12" y1="2" x2="12" y2="12"></line>
                 </svg>`
              : `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                   <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path>
                   <line x1="12" y1="9" x2="12" y2="13"></line>
                   <line x1="12" y1="17" x2="12.01" y2="17"></line>
                 </svg>`
          }
        </div>
        <div>
          <h3 style="font-size: var(--font-size-md); font-weight: 700; color: var(--color-text); margin-bottom: 0.25rem;">
            ${title}
          </h3>
          <p style="color: var(--color-text-secondary); font-size: var(--font-size-sm); line-height: 1.45;">
            ${message}
          </p>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; margin-top: 1.5rem;">
        <button type="button" class="btn btn-secondary" id="dialog-cancel-btn">
          ${cancelText}
        </button>
        <button type="button" class="btn ${isPrimary ? 'btn-primary' : 'btn-danger'}" id="dialog-confirm-btn">
          ${confirmText}
        </button>
      </div>
    </div>
  `;

  const closeDialog = () => {
    backdrop.remove();
  };

  backdrop.querySelector('#dialog-cancel-btn').onclick = () => {
    closeDialog();
    if (onCancel) onCancel();
  };

  backdrop.querySelector('#dialog-confirm-btn').onclick = () => {
    closeDialog();
    if (onConfirm) onConfirm();
  };

  backdrop.onclick = (e) => {
    if (e.target === backdrop) {
      closeDialog();
      if (onCancel) onCancel();
    }
  };

  const handleKey = (e) => {
    if (e.key === 'Escape') {
      closeDialog();
      if (onCancel) onCancel();
      window.removeEventListener('keydown', handleKey);
    }
  };
  window.addEventListener('keydown', handleKey);

  return backdrop;
}
