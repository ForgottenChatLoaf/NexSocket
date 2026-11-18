export function renderNotification() {
  const el = document.createElement('div');
  el.id = 'app-notification';
  el.style.display = 'none';
  el.style.padding = '0.75rem 1rem';
  el.style.borderRadius = 'var(--radius-md)';
  el.style.fontSize = 'var(--font-size-sm)';
  el.style.marginBottom = '1rem';
  el.style.transition = 'all var(--transition-fast)';
  return el;
}
