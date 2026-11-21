/**
 * State store for Outlets, custom names, connection, and activity history
 */

const STORAGE_KEY_NAMES = 'nexsocket_outlet_names';
const STORAGE_KEY_AUTO_RECONNECT = 'nexsocket_auto_reconnect';
const STORAGE_KEY_HISTORY = 'nexsocket_activity_history';

function loadStoredNames() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_NAMES);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    // Fallback if localStorage unavailable
  }
  return { outlet1: 'Outlet 1', outlet2: 'Outlet 2' };
}

function loadStoredAutoReconnect() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_AUTO_RECONNECT);
    if (raw !== null) return raw === 'true';
  } catch (e) {
    // Fallback
  }
  return true;
}

function loadStoredHistory() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_HISTORY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    // Fallback
  }
  return [];
}

class OutletState {
  constructor() {
    this.state = {
      outlet1: false,
      outlet2: false,
      connected: false,
      isPending: false,
      commandLifecycle: {
        status: 'idle', // 'idle' | 'pending' | 'confirmed' | 'failed'
        command: null,
        timestamp: null,
        error: null,
      },
      rssi: -58,
      names: loadStoredNames(),
      autoReconnect: loadStoredAutoReconnect(),
      history: loadStoredHistory(),
    };
    this.listeners = new Set();
  }

  setCommandLifecycle(status, command = null, error = null) {
    this.setState({
      commandLifecycle: {
        status,
        command,
        timestamp: Date.now(),
        error,
      },
      isPending: status === 'pending',
    });
  }

  getState() {
    return { ...this.state };
  }

  setState(partialState) {
    this.state = { ...this.state, ...partialState };
    this.notify();
  }

  setOutletName(outletKey, name) {
    const trimmed = (name || '').trim();
    if (!trimmed) return;
    const names = { ...this.state.names, [outletKey]: trimmed };
    this.setState({ names });
    try {
      localStorage.setItem(STORAGE_KEY_NAMES, JSON.stringify(names));
    } catch (e) {
      // Ignore
    }
  }

  setAutoReconnect(enabled) {
    const autoReconnect = Boolean(enabled);
    this.setState({ autoReconnect });
    try {
      localStorage.setItem(STORAGE_KEY_AUTO_RECONNECT, String(autoReconnect));
    } catch (e) {
      // Ignore
    }
  }

  addHistory(entry) {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const newEntry = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      timestamp: timeStr,
      time: now.getTime(),
      ...entry,
    };
    // Keep last 40 events
    const history = [newEntry, ...(this.state.history || [])].slice(0, 40);
    this.setState({ history });
    try {
      localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(history));
    } catch (e) {
      // Ignore
    }
  }

  clearHistory() {
    this.setState({ history: [] });
    try {
      localStorage.removeItem(STORAGE_KEY_HISTORY);
    } catch (e) {
      // Ignore
    }
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

export const outletState = new OutletState();
