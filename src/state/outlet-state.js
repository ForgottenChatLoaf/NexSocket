/**
 * State store for Outlets and connection
 */
class OutletState {
  constructor() {
    this.state = {
      outlet1: false,
      outlet2: false,
      connected: false,
      isPending: false,
    };
    this.listeners = new Set();
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

export const outletState = new OutletState();
