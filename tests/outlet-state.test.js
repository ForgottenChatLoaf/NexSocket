import { describe, it, expect, beforeEach } from 'vitest';
import { outletState } from '../src/state/outlet-state.js';

describe('OutletState', () => {
  beforeEach(() => {
    outletState.clearHistory();
  });

  it('updates state and notifies subscribers', () => {
    let capturedState = null;
    const unsubscribe = outletState.subscribe((state) => {
      capturedState = state;
    });

    expect(capturedState).toBeDefined();

    outletState.setState({ connected: true, outlet1: true });
    expect(capturedState.connected).toBe(true);
    expect(capturedState.outlet1).toBe(true);

    unsubscribe();
  });

  it('updates custom outlet names and persists', () => {
    outletState.setOutletName('outlet1', 'Nightstand Lamp');
    expect(outletState.getState().names.outlet1).toBe('Nightstand Lamp');

    // Does not allow empty names
    outletState.setOutletName('outlet1', '   ');
    expect(outletState.getState().names.outlet1).toBe('Nightstand Lamp');
  });

  it('records and clears activity history', () => {
    outletState.addHistory({
      type: 'power-on',
      title: 'Outlet 1 ON',
      detail: 'Relay channel 1 activated',
    });

    const history = outletState.getState().history;
    expect(history.length).toBe(1);
    expect(history[0].title).toBe('Outlet 1 ON');
    expect(history[0].type).toBe('power-on');
    expect(history[0].timestamp).toBeDefined();

    outletState.clearHistory();
    expect(outletState.getState().history.length).toBe(0);
  });

  it('toggles auto-reconnect setting', () => {
    outletState.setAutoReconnect(false);
    expect(outletState.getState().autoReconnect).toBe(false);
    outletState.setAutoReconnect(true);
    expect(outletState.getState().autoReconnect).toBe(true);
  });
});
