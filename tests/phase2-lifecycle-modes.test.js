import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { bleService } from '../src/services/bluetooth/ble-service.js';
import { BLE_COMMANDS } from '../src/services/bluetooth/ble-commands.js';
import { COMMAND_STATUS } from '../src/services/bluetooth/command-lifecycle.js';
import { appState } from '../src/state/app-state.js';
import { outletState } from '../src/state/outlet-state.js';

describe('Phase 2 — Core Logic, Modes & Command Lifecycle', () => {
  beforeEach(async () => {
    // Reset state before each test
    appState.setOperationMode('demo');
    if (outletState.getState().connected) {
      await bleService.disconnect();
    }
    outletState.setState({
      connected: false,
      outlet1: false,
      outlet2: false,
      isPending: false,
    });
    outletState.setCommandLifecycle(COMMAND_STATUS.IDLE, null);
  });

  afterEach(async () => {
    if (outletState.getState().connected) {
      await bleService.disconnect();
    }
  });

  describe('Objective 1: Demo Mode vs Live Hardware Mode Separation', () => {
    it('initializes in Demo Mode by default and uses MockBleAdapter', async () => {
      expect(appState.getState().operationMode).toBe('demo');
      await bleService.init();
      expect(bleService.adapter).toBeDefined();
      expect(bleService.currentMode).toBe('demo');
    });

    it('handles switching to Hardware Mode in browser by initializing WebBleAdapter', async () => {
      await bleService.switchMode('hardware');
      expect(appState.getState().operationMode).toBe('hardware');
      // In browser/node, adapter is now WebBleAdapter
      expect(bleService.adapter.constructor.name).toBe('WebBleAdapter');

      // Scanning in an unsupported browser environment throws informative error
      await expect(bleService.startScan()).rejects.toThrow(/Web Bluetooth is not supported/);
    });

    it('safely switches back to Demo Mode and restores mock peripheral link', async () => {
      await bleService.switchMode('hardware');
      await bleService.switchMode('demo');
      expect(appState.getState().operationMode).toBe('demo');
      expect(bleService.adapter).toBeDefined();

      let found = false;
      await bleService.startScan((dev) => {
        found = true;
      });
      await bleService.stopScan();
      expect(found).toBe(true);
    });
  });

  describe('Objective 2: Command Lifecycle (Pending -> Confirmed -> Failed)', () => {
    it('transitions through PENDING and CONFIRMED upon successful write', async () => {
      await bleService.switchMode('demo');
      await bleService.connect('TEST-DEVICE');
      expect(outletState.getState().connected).toBe(true);

      // Send Outlet 1 ON command
      const sendPromise = bleService.sendCommand(BLE_COMMANDS.OUTLET_1_ON);

      // Immediately after sending, state should be PENDING
      const pendingState = outletState.getState();
      expect(pendingState.isPending).toBe(true);
      expect(pendingState.commandLifecycle.status).toBe(COMMAND_STATUS.PENDING);
      expect(pendingState.commandLifecycle.command).toBe(BLE_COMMANDS.OUTLET_1_ON);

      await sendPromise;

      // Wait for Mock adapter's confirmation notification (120ms)
      await new Promise((r) => setTimeout(r, 200));

      const confirmedState = outletState.getState();
      expect(confirmedState.isPending).toBe(false);
      expect(confirmedState.commandLifecycle.status).toBe(COMMAND_STATUS.CONFIRMED);
      expect(confirmedState.outlet1).toBe(true);
    });

    it('rejects concurrent commands while a command is still pending', async () => {
      await bleService.switchMode('demo');
      await bleService.connect('TEST-DEVICE');

      // Start first command
      const p1 = bleService.sendCommand(BLE_COMMANDS.OUTLET_1_ON);

      // Attempt second command while first is pending
      await expect(bleService.sendCommand(BLE_COMMANDS.OUTLET_2_ON)).rejects.toThrow(
        /A previous command is still awaiting device confirmation/
      );

      await p1;
      await new Promise((r) => setTimeout(r, 200));
    });
  });

  describe('Objective 3: Stale Command Protection on Disconnection', () => {
    it('aborts active timeouts and discards pending commands immediately on disconnect', async () => {
      await bleService.switchMode('demo');
      await bleService.connect('TEST-DEVICE');

      // Manually set a pending command state simulating in-flight transmission
      outletState.setCommandLifecycle(COMMAND_STATUS.PENDING, BLE_COMMANDS.OUTLET_1_ON);
      bleService.activeCommand = BLE_COMMANDS.OUTLET_1_ON;
      bleService.commandTimeoutTimer = setTimeout(() => {}, 10000);

      expect(outletState.getState().isPending).toBe(true);
      expect(bleService.activeCommand).toBe(BLE_COMMANDS.OUTLET_1_ON);

      // Trigger disconnect
      await bleService.disconnect();

      // State must be completely reset to IDLE and isPending cleared
      expect(outletState.getState().connected).toBe(false);
      expect(outletState.getState().isPending).toBe(false);
      expect(outletState.getState().commandLifecycle.status).toBe(COMMAND_STATUS.IDLE);
      expect(bleService.activeCommand).toBeNull();
      expect(bleService.commandTimeoutTimer).toBeNull();
    });

    it('does not execute stale commands after reconnection', async () => {
      await bleService.switchMode('demo');
      await bleService.connect('TEST-DEVICE');
      await bleService.disconnect();

      // Reconnect
      await bleService.connect('TEST-DEVICE');
      expect(outletState.getState().connected).toBe(true);
      expect(outletState.getState().isPending).toBe(false);
      expect(outletState.getState().commandLifecycle.status).toBe(COMMAND_STATUS.IDLE);
    });
  });
});
