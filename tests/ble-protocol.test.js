import { describe, it, expect } from 'vitest';
import { BleProtocol } from '../src/services/bluetooth/ble-protocol.js';
import { BLE_COMMANDS } from '../src/services/bluetooth/ble-commands.js';

describe('BleProtocol', () => {
  it('correctly parses status 0 (Both OFF)', () => {
    const status = BleProtocol.parseStatus(0);
    expect(status).toEqual({ outlet1: false, outlet2: false });
  });

  it('correctly parses status 1 (Outlet 1 ON, Outlet 2 OFF)', () => {
    const status = BleProtocol.parseStatus(1);
    expect(status).toEqual({ outlet1: true, outlet2: false });
  });

  it('correctly parses status 2 (Outlet 1 OFF, Outlet 2 ON)', () => {
    const status = BleProtocol.parseStatus(2);
    expect(status).toEqual({ outlet1: false, outlet2: true });
  });

  it('correctly parses status 3 (Both ON)', () => {
    const status = BleProtocol.parseStatus(3);
    expect(status).toEqual({ outlet1: true, outlet2: true });
  });

  it('throws error on invalid status byte', () => {
    expect(() => BleProtocol.parseStatus(4)).toThrow();
    expect(() => BleProtocol.parseStatus(255)).toThrow();
  });

  it('builds command payloads accurately', () => {
    const payload = BleProtocol.buildPayload(BLE_COMMANDS.ALL_OFF);
    expect(payload).toBeInstanceOf(Uint8Array);
    expect(payload[0]).toBe(5);
  });
});
