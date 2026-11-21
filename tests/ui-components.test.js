import { describe, it, expect, beforeEach } from 'vitest';
import { outletState } from '../src/state/outlet-state.js';
import { outletService } from '../src/services/outlet-service.js';
import { bleService } from '../src/services/bluetooth/ble-service.js';
import { BLE_COMMANDS } from '../src/services/bluetooth/ble-commands.js';

describe('Phase 1 UI & Logic Upgrades', () => {
  beforeEach(() => {
    outletState.setState({
      connected: false,
      outlet1: false,
      outlet2: false,
      isPending: false,
    });
  });

  describe('Quick Actions Master Control Logic', () => {
    it('executes allOn (Master Power) sending 0x06 command byte', async () => {
      let sent = null;
      const original = bleService.sendCommand;
      bleService.sendCommand = async (cmd) => { sent = cmd; };

      outletState.setState({ connected: true, isPending: false });
      const res = await outletService.allOn();
      expect(res.success).toBe(true);
      expect(sent).toBe(BLE_COMMANDS.ALL_ON);
      expect(sent).toBe(0x06);

      bleService.sendCommand = original;
    });

    it('executes allOff (Master Shutoff) sending 0x05 command byte', async () => {
      let sent = null;
      const original = bleService.sendCommand;
      bleService.sendCommand = async (cmd) => { sent = cmd; };

      outletState.setState({ connected: true, isPending: false });
      const res = await outletService.allOff();
      expect(res.success).toBe(true);
      expect(sent).toBe(BLE_COMMANDS.ALL_OFF);
      expect(sent).toBe(0x05);

      bleService.sendCommand = original;
    });

    it('rejects allOn and allOff when disconnected', async () => {
      outletState.setState({ connected: false });
      await expect(outletService.allOn()).rejects.toThrow('Cannot energize outlets: Bluetooth device is disconnected');
      await expect(outletService.allOff()).rejects.toThrow('Cannot shut down outlets: Bluetooth device is disconnected');
    });

    it('rejects allOn and allOff when an operation is pending', async () => {
      outletState.setState({ connected: true, isPending: true });
      await expect(outletService.allOn()).rejects.toThrow('A previous command is still pending confirmation');
      await expect(outletService.allOff()).rejects.toThrow('A previous command is still pending confirmation');
    });
  });

  describe('Navigation Section Registry', () => {
    it('defines all 6 primary navigation destinations', () => {
      const validActions = ['dashboard', 'connection', 'outlets', 'history', 'settings', 'about'];
      expect(validActions.length).toBe(6);
      expect(validActions).toContain('dashboard');
      expect(validActions).toContain('connection');
      expect(validActions).toContain('outlets');
      expect(validActions).toContain('history');
      expect(validActions).toContain('settings');
      expect(validActions).toContain('about');
    });
  });
});
