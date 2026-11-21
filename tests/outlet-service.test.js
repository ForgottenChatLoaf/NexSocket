import { describe, it, expect, beforeEach } from 'vitest';
import { outletService } from '../src/services/outlet-service.js';
import { outletState } from '../src/state/outlet-state.js';
import { bleService } from '../src/services/bluetooth/ble-service.js';
import { BLE_COMMANDS } from '../src/services/bluetooth/ble-commands.js';

describe('outletService', () => {
  beforeEach(() => {
    // Reset state before each test
    outletState.setState({
      connected: false,
      outlet1: false,
      outlet2: false,
      isPending: false,
    });
  });

  it('rejects Outlet 1 command when device is disconnected', async () => {
    await expect(outletService.setOutlet1(true)).rejects.toThrow(
      'Cannot control Outlet 1: Bluetooth device is disconnected'
    );
  });

  it('rejects Outlet 2 command when device is disconnected', async () => {
    await expect(outletService.setOutlet2(true)).rejects.toThrow(
      'Cannot control Outlet 2: Bluetooth device is disconnected'
    );
  });

  it('rejects Master Shutoff when device is disconnected', async () => {
    await expect(outletService.allOff()).rejects.toThrow(
      'Cannot shut down outlets: Bluetooth device is disconnected'
    );
  });

  it('rejects commands when another operation is currently pending', async () => {
    outletState.setState({ connected: true, isPending: true });

    await expect(outletService.setOutlet1(true)).rejects.toThrow(
      'A previous command is still pending confirmation'
    );
    await expect(outletService.setOutlet2(false)).rejects.toThrow(
      'A previous command is still pending confirmation'
    );
    await expect(outletService.allOff()).rejects.toThrow(
      'A previous command is still pending confirmation'
    );
  });

  it('sends correct command bytes when connected', async () => {
    let sentCommand = null;
    // Mock sendCommand on bleService
    const originalSendCommand = bleService.sendCommand;
    bleService.sendCommand = async (cmd) => {
      sentCommand = cmd;
    };

    outletState.setState({ connected: true, isPending: false });

    // Test Outlet 1 ON
    const res1 = await outletService.setOutlet1(true);
    expect(res1.success).toBe(true);
    expect(sentCommand).toBe(BLE_COMMANDS.OUTLET_1_ON);

    // Test Outlet 1 OFF
    await outletService.setOutlet1(false);
    expect(sentCommand).toBe(BLE_COMMANDS.OUTLET_1_OFF);

    // Test Outlet 2 ON
    await outletService.setOutlet2(true);
    expect(sentCommand).toBe(BLE_COMMANDS.OUTLET_2_ON);

    // Test Outlet 2 OFF
    await outletService.setOutlet2(false);
    expect(sentCommand).toBe(BLE_COMMANDS.OUTLET_2_OFF);

    // Test ALL OFF
    await outletService.allOff();
    expect(sentCommand).toBe(BLE_COMMANDS.ALL_OFF);

    // Test ALL ON
    await outletService.allOn();
    expect(sentCommand).toBe(BLE_COMMANDS.ALL_ON);

    // Test GET STATUS
    await outletService.requestStatus();
    expect(sentCommand).toBe(BLE_COMMANDS.GET_STATUS);

    // Restore original function
    bleService.sendCommand = originalSendCommand;
  });
});
