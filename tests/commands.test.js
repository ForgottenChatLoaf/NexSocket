import { describe, it, expect } from 'vitest';
import { BLE_COMMANDS, BLE_COMMAND_DESCRIPTIONS } from '../src/services/bluetooth/ble-commands.js';

describe('BLE Commands', () => {
  it('has mapped byte values conforming to hardware specification', () => {
    expect(BLE_COMMANDS.OUTLET_1_ON).toBe(0x01);
    expect(BLE_COMMANDS.OUTLET_1_OFF).toBe(0x02);
    expect(BLE_COMMANDS.OUTLET_2_ON).toBe(0x03);
    expect(BLE_COMMANDS.OUTLET_2_OFF).toBe(0x04);
    expect(BLE_COMMANDS.ALL_OFF).toBe(0x05);
    expect(BLE_COMMANDS.ALL_ON).toBe(0x06);
    expect(BLE_COMMANDS.GET_STATUS).toBe(0x07);
  });

  it('has descriptions for all defined commands', () => {
    Object.values(BLE_COMMANDS).forEach((cmd) => {
      expect(BLE_COMMAND_DESCRIPTIONS[cmd]).toBeDefined();
    });
  });
});
