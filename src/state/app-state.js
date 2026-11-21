/**
 * Application global UI state (notifications, dialogs, scanning)
 */
class AppState {
  constructor() {
    this.state = {
      isScanning: false,
      isConnecting: false,
      connectedDevice: null,
      operationMode: 'demo', // 'demo' (Simulated ESP32) | 'hardware' (Real ESP32-C3)
      notification: null, // { type: 'success' | 'error' | 'info', message: string }
    };
    this.listeners = new Set();
  }

  setOperationMode(mode) {
    if (mode !== 'demo' && mode !== 'hardware') return;
    this.setState({ operationMode: mode });
  }

  getState() {
    return { ...this.state };
  }

  setState(partialState) {
    this.state = { ...this.state, ...partialState };
    this.notify();
  }

  subscribe(listener) {
    this.listeners.add(listener);
    listener(this.getState());
    return () => this.listeners.delete(listener);
  }

  notify() {
    const currentState = this.getState();
    this.listeners.forEach((listener) => {
      try {
        listener(currentState);
      } catch (err) {
        console.error('Error in state subscriber:', err);
      }
    });
  }
}

export const appState = new AppState();
