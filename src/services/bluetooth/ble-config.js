/**
 * Bluetooth GATT Configuration and UUIDs
 */
export const BLE_CONFIG = {
  deviceName: import.meta.env.VITE_BLE_DEVICE_NAME || 'SMART_OUTLET_01',
  serviceUuid: (import.meta.env.VITE_BLE_SERVICE_UUID || '12345678-1234-5678-1234-56789abcdef0').toLowerCase(),
  commandCharacteristicUuid: (import.meta.env.VITE_BLE_COMMAND_UUID || '12345678-1234-5678-1234-56789abcdef1').toLowerCase(),
  statusCharacteristicUuid: (import.meta.env.VITE_BLE_STATUS_UUID || '12345678-1234-5678-1234-56789abcdef2').toLowerCase(),
  scanTimeoutMs: 10000,
  connectionTimeoutMs: 10000,
};
