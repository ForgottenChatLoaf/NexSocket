import { describe, it, expect } from 'vitest';
import { BLE_COMMANDS, BLE_COMMAND_DESCRIPTIONS } from '../src/services/bluetooth/ble-commands.js';

describe('BLE Commands', () => {
  it('has mapped byte values conforming to hardware specification', () => {
    expect(BLE_COMMANDS.OUTLET_1_ON).toBe(1);
    expect(BLE_COMMANDS.OUTLET_1_OFF).toBe(2);
    expect(BLE_COMMANDS.OUTLET_2_ON).toBe(3);
    expect(BLE_COMMANDS.OUTLET_2_OFF).toBe(4);
    expect(BLE_COMMANDS.ALL_OFF).toBe(5);
  });

  it('has descriptions for all defined commands', () => {
    Object.values(BLE_COMMANDS).forEach((cmd) => {
      expect(BLE_COMMAND_DESCRIPTIONS[cmd]).toBeDefined();
    });
  });
});
