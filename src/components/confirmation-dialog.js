export function renderConfirmationDialog({ title, message, onConfirm, onCancel }) {
  const backdrop = document.createElement('div');
  backdrop.className = 'dialog-backdrop';
  backdrop.style.position = 'fixed';
  backdrop.style.inset = '0';
  backdrop.style.backgroundColor = 'rgba(0, 0, 0, 0.6)';
  backdrop.style.display = 'flex';
  backdrop.style.alignItems = 'center';
  backdrop.style.justifyContent = 'center';
  backdrop.style.zIndex = '1000';
  backdrop.style.padding = '1rem';

  const modal = document.createElement('div');
  modal.className = 'card';
  modal.style.maxWidth = '400px';
  modal.style.width = '100%';

  modal.innerHTML = `
    <h3 style="font-size: var(--font-size-lg); margin-bottom: 0.5rem;">${title}</h3>
    <p style="color: var(--color-text-secondary); margin-bottom: 1.5rem; font-size: var(--font-size-sm);">${message}</p>
    <div style="display: flex; justify-content: flex-end; gap: 0.75rem;">
      <button class="btn" id="dialog-cancel-btn" style="background-color: var(--color-bg-card-hover); color: var(--color-text-primary);">Cancel</button>
      <button class="btn btn-danger" id="dialog-confirm-btn">Confirm</button>
    </div>
  `;

  backdrop.appendChild(modal);

  modal.querySelector('#dialog-cancel-btn').onclick = () => {
    backdrop.remove();
    if (onCancel) onCancel();
  };

  modal.querySelector('#dialog-confirm-btn').onclick = () => {
    backdrop.remove();
    if (onConfirm) onConfirm();
  };

  return backdrop;
}
