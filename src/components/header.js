export function renderHeader() {
  const header = document.createElement('header');
  header.className = 'app-header';
  header.innerHTML = `
    <div style="display: flex; align-items: center; justify-content: space-between; padding: 1rem 0; border-bottom: 1px solid var(--color-border);">
      <div style="display: flex; align-items: center; gap: 0.5rem;">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: var(--color-primary)">
          <path d="M12 2v10"></path>
          <path d="M18.4 6.6a9 9 0 1 1-12.77 0"></path>
        </svg>
        <h1 style="font-size: var(--font-size-xl); font-weight: 700; letter-spacing: -0.02em;">SmartOutlet</h1>
      </div>
      <div id="header-connection-pill"></div>
    </div>
  `;
  return header;
}
