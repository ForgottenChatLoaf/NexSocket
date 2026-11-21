import { renderHeader } from '../components/header.js';
import { renderConnectionPanel } from '../components/connection-panel.js';
import { renderSystemOverview } from '../components/system-overview.js';
import { renderQuickActions } from '../components/quick-actions.js';
import { renderOutletCard } from '../components/outlet-card.js';
import { renderActivityHistory } from '../components/activity-history.js';
import { renderNotification } from '../components/notification.js';

export function renderDashboard() {
  const container = document.createElement('main');
  container.className = 'main-container';

  // 1. Application Header (Logo + Status Pill + Hamburger Menu)
  container.appendChild(renderHeader());

  // 2. Notification Toast Host
  container.appendChild(renderNotification());

  // 3. Context-Aware Connection Banner (Welcome / Scan / Connect / Telemetry)
  container.appendChild(renderConnectionPanel());

  // 4. System Overview Metrics (Total: 2, Active Outlets: 0/2, Inactive)
  container.appendChild(renderSystemOverview());

  // 5. Quick Actions Bar (Dual Master Controls: Turn All ON / Turn All OFF)
  container.appendChild(renderQuickActions());

  // 6. Section Header: Power Outlets
  const sectionRow = document.createElement('div');
  sectionRow.className = 'section-title-row';
  sectionRow.innerHTML = `
    <span class="section-title">Power Outlets</span>
    <span style="font-size: var(--font-size-xs); color: var(--color-text-muted);">2 Channels • Independent Relays</span>
  `;
  container.appendChild(sectionRow);

  // 7. Outlet Management Grid (Outlet 1 & Outlet 2 cards)
  const grid = document.createElement('div');
  grid.className = 'outlet-grid';
  grid.appendChild(renderOutletCard(1));
  grid.appendChild(renderOutletCard(2));
  container.appendChild(grid);

  // 8. Live Activity History Log
  container.appendChild(renderActivityHistory());

  // 9. Mobile Footer
  const footer = document.createElement('footer');
  footer.className = 'app-footer';
  footer.innerHTML = `
    <span>Bluetooth Low Energy • Direct Device Communication</span>
    <span>Runs completely offline without Wi-Fi or Cloud Services</span>
  `;
  container.appendChild(footer);

  return container;
}
