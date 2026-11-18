import { describe, it, expect } from 'vitest';
import { MockBleAdapter } from '../src/services/bluetooth/mock-ble-adapter.js';
import { BLE_COMMANDS } from '../src/services/bluetooth/ble-commands.js';

describe('MockBleAdapter', () => {
  it('initializes and handles connection lifecycle', async () => {
    const adapter = new MockBleAdapter();
    await adapter.initialize();
    expect(adapter.connected).toBe(false);

    await adapter.connect('TEST-DEVICE');
    expect(adapter.connected).toBe(true);

    await adapter.disconnect();
    expect(adapter.connected).toBe(false);
  });

  it('correctly updates internal status on command and notifies subscribers', async () => {
    const adapter = new MockBleAdapter();
    await adapter.connect('TEST-DEVICE');

    let notifiedStatus = null;
    adapter.subscribeStatus((status) => {
      notifiedStatus = status;
    });

    // Command: Outlet 1 ON (1) -> status becomes 1
    await adapter.writeCommand(BLE_COMMANDS.OUTLET_1_ON);
    // Wait for the simulated delay (150ms in mock adapter)
    await new Promise((r) => setTimeout(r, 200));
    expect(notifiedStatus).toBe(1);

    // Command: Outlet 2 ON (3) -> status becomes 3 (1 | 2)
    await adapter.writeCommand(BLE_COMMANDS.OUTLET_2_ON);
    await new Promise((r) => setTimeout(r, 200));
    expect(notifiedStatus).toBe(3);

    // Command: ALL OFF (5) -> status becomes 0
    await adapter.writeCommand(BLE_COMMANDS.ALL_OFF);
    await new Promise((r) => setTimeout(r, 200));
    expect(notifiedStatus).toBe(0);
  });

  it('rejects command if device is disconnected', async () => {
    const adapter = new MockBleAdapter();
    await expect(adapter.writeCommand(BLE_COMMANDS.OUTLET_1_ON)).rejects.toThrow();
  });
});
