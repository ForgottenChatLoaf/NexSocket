import { describe, it, expect } from 'vitest';
import { appState } from '../src/state/app-state.js';

describe('AppState', () => {
  it('updates notification and connection state correctly', () => {
    let captured = null;
    const unsubscribe = appState.subscribe((state) => {
      captured = state;
    });

    appState.setState({
      notification: { type: 'success', message: 'Test success' },
      isScanning: true,
    });

    expect(captured.notification).toEqual({ type: 'success', message: 'Test success' });
    expect(captured.isScanning).toBe(true);

    unsubscribe();
  });
});
