/**
 * Hardware Command Protocol Definitions
 * Conforms to the 7-command NexSocket BLE GATT Specification
 */
export const BLE_COMMANDS = {
  OUTLET_1_ON: 0x01,
  OUTLET_1_OFF: 0x02,
  OUTLET_2_ON: 0x03,
  OUTLET_2_OFF: 0x04,
  ALL_OFF: 0x05,
  ALL_ON: 0x06,
  GET_STATUS: 0x07,
};

export const BLE_COMMAND_DESCRIPTIONS = {
  [BLE_COMMANDS.OUTLET_1_ON]: 'Turn Outlet 1 ON',
  [BLE_COMMANDS.OUTLET_1_OFF]: 'Turn Outlet 1 OFF',
  [BLE_COMMANDS.OUTLET_2_ON]: 'Turn Outlet 2 ON',
  [BLE_COMMANDS.OUTLET_2_OFF]: 'Turn Outlet 2 OFF',
  [BLE_COMMANDS.ALL_OFF]: 'Turn All Outlets OFF (Master Shutoff)',
  [BLE_COMMANDS.ALL_ON]: 'Turn All Outlets ON (Master Power)',
  [BLE_COMMANDS.GET_STATUS]: 'Request Current Device Status',
};
