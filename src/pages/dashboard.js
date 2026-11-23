import { renderHeader } from '../components/header.js';
import { renderBottomNavigation } from '../components/bottom-navigation.js';
import { renderDesktopSidebar } from '../components/desktop-sidebar.js';
import { renderConnectionSummary } from '../components/connection-summary.js';
import { renderConnectionPanel } from '../components/connection-panel.js';
import { renderSystemOverview } from '../components/system-overview.js';
import { renderQuickActions } from '../components/quick-actions.js';
import { renderOutletCard } from '../components/outlet-card.js';
import { renderActivityHistory } from '../components/activity-history.js';
import { renderSettingsPanel } from '../components/settings-panel.js';
import { renderNotification } from '../components/notification.js';
import { appState } from '../state/app-state.js';

export function renderDashboard() {
  const shell = document.createElement('div');
  shell.className = 'app-shell';

  // 1. Persistent Desktop Sidebar (Visible on screens >= 1024px)
  shell.appendChild(renderDesktopSidebar());

  // 2. Main Content Workspace Container
  const mainContent = document.createElement('div');
  mainContent.className = 'main-layout-container';

  // Centered & Proportion-Constrained Inner Workspace
  const innerContent = document.createElement('div');
  innerContent.className = 'main-content-inner';

  // Persistent Top Header
  innerContent.appendChild(renderHeader());

  // Toast Notification Host
  innerContent.appendChild(renderNotification());

  // Dynamic View Container (Controlled by activeTab in appState)
  const tabContent = document.createElement('div');
  tabContent.className = 'tab-content-host';

  function renderActiveTab() {
    tabContent.innerHTML = '';
    const { activeTab } = appState.getState();

    if (activeTab === 'home') {
      // 🏠 HOME DASHBOARD
      const homeView = document.createElement('div');
      homeView.className = 'tab-view home-view';

      // 1. Hero Greeting (Compact & Intentional)
      const hero = document.createElement('div');
      hero.className = 'dashboard-hero';
      hero.innerHTML = `
        <span class="hero-eyebrow">SMART HOME CONTROL</span>
        <h1 class="hero-title">Your home, under control.</h1>
        <p class="hero-desc">Two independent outlets. One intelligent control center.</p>
      `;
      homeView.appendChild(hero);

      // 2. Top Status Row (Side-by-side on desktop/tablet, stacked on mobile)
      const topStatusRow = document.createElement('div');
      topStatusRow.className = 'dashboard-top-status-row';
      topStatusRow.appendChild(renderConnectionSummary());
      topStatusRow.appendChild(renderSystemOverview());
      homeView.appendChild(topStatusRow);

      // 3. Section Title: Power Outlets
      const sectionRow = document.createElement('div');
      sectionRow.className = 'section-title-row';
      sectionRow.innerHTML = `
        <span class="section-title">Power Outlets</span>
        <span class="section-badge">2 Outputs Available</span>
      `;
      homeView.appendChild(sectionRow);

      // 4. Independent Outlet Cards Grid (Balanced 2 columns on desktop)
      const grid = document.createElement('div');
      grid.className = 'outlet-grid';
      grid.appendChild(renderOutletCard(1));
      grid.appendChild(renderOutletCard(2));
      homeView.appendChild(grid);

      // 5. Master Power Controls (Compact Quick Actions)
      homeView.appendChild(renderQuickActions());

      // 6. Recent Activity Preview (Compact list with link to full log)
      const activityWrapper = document.createElement('div');
      activityWrapper.className = 'home-activity-wrapper';
      activityWrapper.appendChild(renderActivityHistory(true)); // true = compact preview mode

      const viewMoreRow = document.createElement('div');
      viewMoreRow.className = 'view-more-activity-row';
      viewMoreRow.innerHTML = `
        <button type="button" class="btn btn-secondary btn-sm" id="btn-view-all-activity">
          View Complete Activity Log ➔
        </button>
      `;
      const btnViewMore = viewMoreRow.querySelector('#btn-view-all-activity');
      if (btnViewMore) {
        btnViewMore.onclick = () => {
          appState.setActiveTab('activity');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        };
      }
      activityWrapper.appendChild(viewMoreRow);
      homeView.appendChild(activityWrapper);

      // Footer
      const footer = document.createElement('div');
      footer.className = 'app-footer';
      footer.innerHTML = `
        <div class="footer-ble-row">
          <span class="footer-ble-dot"></span>
          <span class="footer-ble-label">Bluetooth Low Energy</span>
          <span class="footer-ble-sep">·</span>
          <span class="footer-ble-label">Direct Device Communication</span>
        </div>
        <p class="footer-offline-note">BLE device control requires no internet &mdash; outlet switching works fully offline</p>
        <p class="footer-credit">NexSocket &mdash; ADET211 Final Showcase</p>
      `;
      homeView.appendChild(footer);

      tabContent.appendChild(homeView);

    } else if (activeTab === 'devices') {
      // 📶 DEVICES & CONNECTION MANAGEMENT
      const devicesView = document.createElement('div');
      devicesView.className = 'tab-view devices-view';

      const devHeader = document.createElement('div');
      devHeader.className = 'view-header';
      devHeader.innerHTML = `
        <span class="view-eyebrow">DEVICE MANAGEMENT</span>
        <h2 class="view-title">Bluetooth Connection</h2>
        <p class="view-desc">Configure wireless connectivity, discover ESP32-C3 hardware, and manage operating modes.</p>
      `;
      devicesView.appendChild(devHeader);

      // Full Connection Panel
      devicesView.appendChild(renderConnectionPanel());

      tabContent.appendChild(devicesView);

    } else if (activeTab === 'activity') {
      // 📜 FULL ACTIVITY HISTORY LOG
      const activityView = document.createElement('div');
      activityView.className = 'tab-view activity-view';

      const actHeader = document.createElement('div');
      actHeader.className = 'view-header';
      actHeader.innerHTML = `
        <span class="view-eyebrow">AUDIT TRAIL</span>
        <h2 class="view-title">Activity History</h2>
        <p class="view-desc">Live chronological log of outlet relay switching, master shutoffs, and Bluetooth events.</p>
      `;
      activityView.appendChild(actHeader);

      // Full Activity History component (complete audit trail)
      activityView.appendChild(renderActivityHistory(false));

      tabContent.appendChild(activityView);

    } else if (activeTab === 'settings') {
      // ⚙️ SETTINGS & HARDWARE SPECIFICATIONS
      const settingsView = document.createElement('div');
      settingsView.className = 'tab-view settings-view';
      settingsView.appendChild(renderSettingsPanel());
      tabContent.appendChild(settingsView);
    }
  }

  appState.subscribe(renderActiveTab);
  renderActiveTab();

  innerContent.appendChild(tabContent);
  mainContent.appendChild(innerContent);
  shell.appendChild(mainContent);

  // 3. Persistent Mobile Bottom Navigation Bar (Visible on mobile/tablet)
  shell.appendChild(renderBottomNavigation());

  return shell;
}
