export function renderStatusIndicator(isConnected = false) {
  const container = document.createElement('div');
  container.className = 'status-indicator';
  container.style.display = 'inline-flex';
  container.style.alignItems = 'center';
  container.style.gap = '0.375rem';
  container.style.fontSize = 'var(--font-size-xs)';
  container.style.padding = '0.25rem 0.625rem';
  container.style.borderRadius = 'var(--radius-full)';
  container.style.backgroundColor = isConnected ? 'var(--color-success-bg)' : 'rgba(100, 116, 139, 0.15)';
  container.style.color = isConnected ? 'var(--color-success)' : 'var(--color-text-muted)';
  container.style.fontWeight = '600';

  const dot = document.createElement('span');
  dot.style.width = '8px';
  dot.style.height = '8px';
  dot.style.borderRadius = '50%';
  dot.style.backgroundColor = isConnected ? 'var(--color-success)' : 'var(--color-text-muted)';

  const text = document.createElement('span');
  text.textContent = isConnected ? 'Connected' : 'Disconnected';

  container.appendChild(dot);
  container.appendChild(text);
  return container;
}
