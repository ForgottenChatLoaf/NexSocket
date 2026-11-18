import { describe, it, expect } from 'vitest';
import { outletState } from '../src/state/outlet-state.js';

describe('OutletState', () => {
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
});
