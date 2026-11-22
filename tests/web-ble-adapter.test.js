import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { WebBleAdapter, isWebBluetoothSupported } from '../src/services/bluetooth/web-ble-adapter.js';
import { BLE_CONFIG } from '../src/services/bluetooth/ble-config.js';
import { BLE_COMMANDS } from '../src/services/bluetooth/ble-commands.js';

describe('Phase 3 — Web Bluetooth Adapter (WebBleAdapter)', () => {
  let adapter;

  beforeEach(() => {
    adapter = new WebBleAdapter();
  });

  it('detects lack of Web Bluetooth in unsupported or node environments', () => {
    // In node/vitest, navigator.bluetooth is undefined
    expect(isWebBluetoothSupported()).toBe(false);
  });

  it('initialize() returns false when Web Bluetooth is unsupported', async () => {
    const initialized = await adapter.initialize();
    expect(initialized).toBe(false);
  });

  it('scan() throws an informative error explaining browser requirements if bluetooth is missing', async () => {
    await expect(adapter.scan()).rejects.toThrow(/Web Bluetooth is not supported in this browser/);
  });

  describe('with simulated navigator.bluetooth', () => {
    let mockBluetooth;
    let mockDevice;
    let mockServer;
    let mockService;
    let mockCommandChar;
    let mockStatusChar;

    beforeEach(() => {
      mockCommandChar = {
        writeValueWithResponse: vi.fn().mockResolvedValue(undefined),
        writeValue: vi.fn().mockResolvedValue(undefined),
      };

      mockStatusChar = {
        startNotifications: vi.fn().mockResolvedValue(undefined),
        stopNotifications: vi.fn().mockResolvedValue(undefined),
        readValue: vi.fn().mockResolvedValue({
          byteLength: 1,
          getUint8: vi.fn().mockReturnValue(0x00),
        }),
        addEventListener: vi.fn(),
      };

      mockService = {
        getCharacteristic: vi.fn().mockImplementation((uuid) => {
          if (uuid === BLE_CONFIG.commandCharacteristicUuid) return Promise.resolve(mockCommandChar);
          if (uuid === BLE_CONFIG.statusCharacteristicUuid) return Promise.resolve(mockStatusChar);
          throw new Error('Unknown UUID');
        }),
      };

      mockServer = {
        connect: vi.fn(),
        getPrimaryService: vi.fn().mockResolvedValue(mockService),
      };
      mockServer.connect.mockResolvedValue(mockServer);

      mockDevice = {
        id: 'ESP32-HARDWARE-01',
        name: 'SMART_OUTLET_01',
        gatt: mockServer,
        addEventListener: vi.fn(),
      };

      mockBluetooth = {
        requestDevice: vi.fn().mockResolvedValue(mockDevice),
      };

      // Mock navigator.bluetooth on existing global navigator
      Object.defineProperty(globalThis.navigator, 'bluetooth', {
        value: mockBluetooth,
        configurable: true,
        writable: true,
      });
    });

    afterEach(() => {
      try {
        delete globalThis.navigator.bluetooth;
      } catch (e) {
        // Ignore
      }
    });

    it('requests device with correct filters and optionalServices', async () => {
      let foundDev = null;
      await adapter.scan((dev) => {
        foundDev = dev;
      });

      expect(mockBluetooth.requestDevice).toHaveBeenCalledTimes(1);
      const callArgs = mockBluetooth.requestDevice.mock.calls[0][0];
      expect(callArgs.filters).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ name: BLE_CONFIG.deviceName }),
          expect.objectContaining({ services: [BLE_CONFIG.serviceUuid] }),
        ])
      );
      expect(callArgs.optionalServices).toContain(BLE_CONFIG.serviceUuid);
      expect(foundDev.name).toBe('SMART_OUTLET_01');
      expect(foundDev.deviceId).toBe('ESP32-HARDWARE-01');
    });

    it('connects to GATT server and discovers characteristics', async () => {
      await adapter.scan();
      const connected = await adapter.connect('ESP32-HARDWARE-01');

      expect(connected).toBe(true);
      expect(mockServer.connect).toHaveBeenCalled();
      expect(mockServer.getPrimaryService).toHaveBeenCalledWith(BLE_CONFIG.serviceUuid);
      expect(mockService.getCharacteristic).toHaveBeenCalledWith(BLE_CONFIG.commandCharacteristicUuid);
      expect(mockService.getCharacteristic).toHaveBeenCalledWith(BLE_CONFIG.statusCharacteristicUuid);
    });

    it('writes command byte to command characteristic', async () => {
      await adapter.scan();
      await adapter.connect('ESP32-HARDWARE-01');

      await adapter.writeCommand(BLE_COMMANDS.OUTLET_1_ON);

      expect(mockCommandChar.writeValueWithResponse).toHaveBeenCalledWith(
        new Uint8Array([BLE_COMMANDS.OUTLET_1_ON])
      );
    });

    it('subscribes to notifications and reads initial status', async () => {
      await adapter.scan();
      await adapter.connect('ESP32-HARDWARE-01');

      const onStatus = vi.fn();
      await adapter.subscribeStatus(onStatus);

      expect(mockStatusChar.startNotifications).toHaveBeenCalled();
      expect(mockStatusChar.addEventListener).toHaveBeenCalledWith(
        'characteristicvaluechanged',
        expect.any(Function)
      );
      expect(onStatus).toHaveBeenCalledWith(0x00);
    });
  });
});
